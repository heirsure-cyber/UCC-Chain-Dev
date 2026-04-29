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
  1: "New York", 2: "Delaware", 3: "California",
  4: "Florida", 5: "Texas", 6: "Illinois", 7: "Pennsylvania"
};

function computeHash(filingId: string, wallet: string, salt: string): string {
  const preImage = `UCC-CHAIN/v1|${filingId}|${wallet}|${salt}`;
  return '0x' + createHash('sha256').update(preImage, 'utf8').digest('hex');
}

function generateSummary(filingId: string, wallet: string, status: string, attestation: any): string {
  if (status === 'Not Found') {
    return `No attestation found on Polygon Mainnet for filing ID "${filingId}" with secured party wallet ${wallet}. The provided inputs (filing ID, wallet address, or salt) did not match any on-chain record.`;
  }
  if (status === 'Revoked') {
    const date = new Date(parseInt(attestation.timestamp) * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    return `The attestation for filing ID "${filingId}" was recorded on Polygon Mainnet at block ${attestation.blockNumber} on ${date}, but has been REVOKED by the original attester (${attestation.attester}). This could indicate the loan was terminated, the wallet was compromised, or the filing was corrected.`;
  }
  const date = new Date(parseInt(attestation.timestamp) * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const stateName = STATE_NAMES[attestation.filingState] || "Unknown State";
  return `VERIFIED ACTIVE. The attestation for filing ID "${filingId}" is recorded on Polygon Mainnet at block ${attestation.blockNumber}, attested on ${date} by wallet ${attestation.attester}. Filing state: ${stateName}. This attestation supports the identifiability prong of the UCC § 12-105 control test for the secured party at wallet ${wallet}. The attestation has not been revoked and remains in force.`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filingId, wallet, salt } = body;

    if (!filingId || !wallet || !salt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const provider = new JsonRpcProvider(ALCHEMY_RPC);
    const contract = new Contract(REGISTRY_CONTRACT, REGISTRY_ABI, provider);

    const walletVariants = [wallet, wallet.toLowerCase(), wallet.toUpperCase()];
    let attestation = null;
    let matchedHash = computeHash(filingId, wallet, salt);

    for (const walletVariant of walletVariants) {
      const hash = computeHash(filingId, walletVariant, salt);
      const result = await contract.verify(hash);
      if (result.blockNumber.toString() !== '0') {
        attestation = {
          attester: result.attester,
          blockNumber: result.blockNumber.toString(),
          timestamp: result.timestamp.toString(),
          filingState: Number(result.filingState),
          revoked: result.revoked
        };
        matchedHash = hash;
        break;
      }
    }

    const status = !attestation ? 'Not Found' : attestation.revoked ? 'Revoked' : 'Active';
    const summary = generateSummary(filingId, wallet, status, attestation);
    const verifiedAt = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });

    let timestampDate = '';
    if (attestation) {
      timestampDate = new Date(parseInt(attestation.timestamp) * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
    }

    // Generate PDF using HTML that Vercel can render
    // Return structured data for PDF generation
    const reportData = {
      filing_id: filingId,
      wallet,
      commitment_hash: matchedHash,
      status,
      summary,
      verified_at: verifiedAt,
      attester: attestation?.attester || '',
      block_number: attestation ? parseInt(attestation.blockNumber) : null,
      timestamp_date: timestampDate,
      filing_state: attestation ? STATE_NAMES[attestation.filingState] || 'Unknown' : '',
      revoked: attestation?.revoked || false,
      registry_contract: REGISTRY_CONTRACT,
    };

    return NextResponse.json({ success: true, report: reportData, summary });

  } catch (error: any) {
    console.error('Report API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const filingId = searchParams.get('filingId');
  const wallet = searchParams.get('wallet');
  const salt = searchParams.get('salt');

  if (!filingId || !wallet || !salt) {
    return NextResponse.json({ error: "Missing query parameters" }, { status: 400 });
  }

  return POST(new NextRequest(request.url, {
    method: 'POST',
    body: JSON.stringify({ filingId, wallet, salt }),
    headers: { 'Content-Type': 'application/json' }
  }));
}
