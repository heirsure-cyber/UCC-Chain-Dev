import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';

const ALCHEMY_API_KEY = "TxzPNxD1jxp2dk7Rovh-1";
const ALCHEMY_RPC = `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
const REGISTRY_CONTRACT = "0xC17def4DF914b016D60500Cb9C459c3eAf6469Ff";

const STATE_NAMES: { [key: number]: string } = {
  1: "New York",
  2: "Delaware",
  3: "California",
  4: "Florida",
  5: "Texas",
  6: "Illinois",
  7: "Pennsylvania"
};

interface VerifyRequest {
  filingId: string;
  wallet: string;
  salt: string;
}

interface AttestationResult {
  attester: string;
  blockNumber: string;
  timestamp: string;
  filingState: number;
  revoked: boolean;
}

// Simple Keccak256 implementation for function selector
function keccak256(data: string): string {
  // For now, use the known selector for verify(bytes32)
  // This is Keccak256("verify(bytes32)") truncated to first 4 bytes
  return "fc735e99";
}

export async function POST(request: NextRequest) {
  try {
    const body: VerifyRequest = await request.json();
    const { filingId, wallet, salt } = body;

    if (!filingId || !wallet || !salt) {
      return NextResponse.json(
        { error: "Missing required fields: filingId, wallet, salt" },
        { status: 400 }
      );
    }

    if (!wallet.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: "Invalid wallet address format" },
        { status: 400 }
      );
    }

    if (!salt.match(/^[a-f0-9]{64}$/)) {
      return NextResponse.json(
        { error: "Invalid salt format (must be 64 hex characters)" },
        { status: 400 }
      );
    }

    const preImage = `UCC-CHAIN/v1|${filingId}|${wallet.toLowerCase()}|${salt}`;
    const commitmentHash = '0x' + createHash('sha256').update(preImage, 'utf8').digest('hex');

    // Try to read from the contract using attestations mapping directly
    // attestations is a public mapping, so we can call attestations(bytes32)
    const ATTESTATIONS_SELECTOR = '0x29c23a89'; // Keccak256("attestations(bytes32)")
    const param = commitmentHash.slice(2).padStart(64, '0');
    const callData = ATTESTATIONS_SELECTOR + param;

    const rpcPayload = {
      jsonrpc: "2.0",
      method: "eth_call",
      params: [{ to: REGISTRY_CONTRACT, data: callData }, "latest"],
      id: 1
    };

    const rpcResponse = await fetch(ALCHEMY_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rpcPayload)
    });

    if (!rpcResponse.ok) {
      throw new Error(`Alchemy RPC failed: ${rpcResponse.statusText}`);
    }

    const rpcResult = await rpcResponse.json();
    
    if (rpcResult.error) {
      throw new Error(`RPC error: ${rpcResult.error.message}`);
    }

    const resultHex = rpcResult.result;
    const attestation = decodeAttestationResult(resultHex);

    const status = attestation.blockNumber === '0' ? 'Not Found' : attestation.revoked ? 'Revoked' : 'Active';

    const proof = {
      ucc_chain_version: "v1",
      verified_at: new Date().toISOString(),
      inputs: { filing_id: filingId, secured_party_wallet: wallet.toLowerCase(), salt: salt },
      commitment_hash: commitmentHash,
      status: status,
      on_chain_data: attestation.blockNumber !== '0' ? {
        attester: attestation.attester,
        block_number: parseInt(attestation.blockNumber),
        timestamp: parseInt(attestation.timestamp),
        timestamp_date: new Date(parseInt(attestation.timestamp) * 1000).toISOString(),
        filing_state: attestation.filingState,
        filing_state_name: STATE_NAMES[attestation.filingState] || "Unknown",
        revoked: attestation.revoked
      } : null,
      registry_contract: REGISTRY_CONTRACT,
      chain: "Polygon PoS",
      chain_id: 137
    };

    const summary = generateSummary(filingId, wallet, status, attestation);

    return NextResponse.json({ success: true, proof: proof, summary: summary });

  } catch (error: any) {
    console.error('Verification API error:', error);
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 });
  }
}

function decodeAttestationResult(resultHex: string): AttestationResult {
  if (!resultHex || resultHex === '0x' || resultHex.length < 10) {
    return { attester: '0x0000000000000000000000000000000000000000', blockNumber: '0', timestamp: '0', filingState: 0, revoked: false };
  }

  const data = resultHex.slice(2);
  
  // Struct encoding: (address attester, uint256 blockNumber, uint256 timestamp, uint8 filingState, bool revoked)
  const attester = '0x' + data.slice(24, 64);
  const blockNumber = BigInt('0x' + data.slice(64, 128)).toString();
  const timestamp = BigInt('0x' + data.slice(128, 192)).toString();
  const filingState = parseInt(data.slice(190, 192), 16);
  const revoked = parseInt(data.slice(254, 256), 16) === 1;

  return { attester, blockNumber, timestamp, filingState, revoked };
}

function generateSummary(filingId: string, wallet: string, status: string, attestation: AttestationResult): string {
  if (status === 'Not Found') {
    return `No attestation found on Polygon Mainnet for filing ID "${filingId}" with secured party wallet ${wallet}. This attestation has not been recorded on-chain, or the provided inputs (filing ID, wallet address, or salt) are incorrect.`;
  }

  if (status === 'Revoked') {
    const date = new Date(parseInt(attestation.timestamp) * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    return `The attestation for filing ID "${filingId}" was recorded on Polygon Mainnet at block ${attestation.blockNumber} on ${date}, but has been REVOKED by the original attester (${attestation.attester}). This could indicate the loan was terminated, the wallet was compromised, or the filing was corrected. Look for a newer attestation on the same filing.`;
  }

  const date = new Date(parseInt(attestation.timestamp) * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const stateName = STATE_NAMES[attestation.filingState] || "Unknown State";
  
  return `VERIFIED ACTIVE. The attestation for filing ID "${filingId}" is recorded on Polygon Mainnet at block ${attestation.blockNumber}, attested on ${date} by wallet ${attestation.attester}. Filing state: ${stateName}. This attestation supports the identifiability prong of the UCC § 12-105 control test for the secured party at wallet ${wallet}. The attestation has not been revoked and remains in force.`;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const filingId = searchParams.get('filingId');
  const wallet = searchParams.get('wallet');
  const salt = searchParams.get('salt');

  if (!filingId || !wallet || !salt) {
    return NextResponse.json({
      error: "Missing query parameters. Required: filingId, wallet, salt",
      example: "/api/verify?filingId=UCC-CHAIN-TEST-001&wallet=0x5DC1107121371b8bf487cDAdF3Bc42eAfA6C7778&salt=b02e985534141268219e7afe352a8c24977463456fc064e9ed41d362728bd54e"
    }, { status: 400 });
  }

  return POST(new NextRequest(request.url, {
    method: 'POST',
    body: JSON.stringify({ filingId, wallet, salt }),
    headers: { 'Content-Type': 'application/json' }
  }));
}
