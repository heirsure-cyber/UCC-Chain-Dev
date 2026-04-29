import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { JsonRpcProvider, Contract } from 'ethers';

const ALCHEMY_API_KEY = "TxzPNxD1jxp2dk7Rovh-1";
const ALCHEMY_RPC = `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
const REGISTRY_CONTRACT = "0xC17def4DF914b016D60500Cb9C459c3eAf6469Ff";

const REGISTRY_ABI = [
  {
    "inputs": [{"name": "commitmentHash", "type": "bytes32"}],
    "name": "verify",
    "outputs": [
      {
        "components": [
          {"name": "attester", "type": "address"},
          {"name": "blockNumber", "type": "uint64"},
          {"name": "timestamp", "type": "uint64"},
          {"name": "filingState", "type": "uint8"},
          {"name": "revoked", "type": "bool"}
        ],
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

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

function computeHash(filingId: string, wallet: string, salt: string): string {
  const preImage = `UCC-CHAIN/v1|${filingId}|${wallet}|${salt}`;
  return '0x' + createHash('sha256').update(preImage, 'utf8').digest('hex');
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

    const provider = new JsonRpcProvider(ALCHEMY_RPC);
    const contract = new Contract(REGISTRY_CONTRACT, REGISTRY_ABI, provider);

    // Try three wallet casing variants to match however the original hash was computed
    const walletVariants = [
      wallet,                  // as-entered (mixed case EIP-55)
      wallet.toLowerCase(),    // all lowercase
      wallet.toUpperCase(),    // all uppercase
    ];

    let attestation = null;
    let matchedHash = '';
    let matchedVariant = '';

    for (const walletVariant of walletVariants) {
      const hash = computeHash(filingId, walletVariant, salt);
      const result = await contract.verify(hash);
      
      if (result.blockNumber.toString() !== '0') {
        attestation = {
          attester: result.attester as string,
          blockNumber: result.blockNumber.toString(),
          timestamp: result.timestamp.toString(),
          filingState: Number(result.filingState),
          revoked: result.revoked as boolean
        };
        matchedHash = hash;
        matchedVariant = walletVariant;
        break;
      }
      
      // Save first hash as default if nothing found
      if (!matchedHash) matchedHash = hash;
    }

    const status = !attestation
      ? 'Not Found'
      : attestation.revoked
        ? 'Revoked'
        : 'Active';

    const proof = {
      ucc_chain_version: "v1",
      verified_at: new Date().toISOString(),
      inputs: {
        filing_id: filingId,
        secured_party_wallet: wallet,
        salt: salt
      },
      commitment_hash: matchedHash,
      status: status,
      on_chain_data: attestation ? {
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
    return NextResponse.json({
      success: false,
      error: error.message || "Internal server error"
    }, { status: 500 });
  }
}

function generateSummary(filingId: string, wallet: string, status: string, attestation: any): string {
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
