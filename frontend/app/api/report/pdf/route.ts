export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { JsonRpcProvider, Contract } from 'ethers';
import { jsPDF } from 'jspdf';

const ALCHEMY_API_KEY = "TxzPNxD1jxp2dk7Rovh-1";
const ALCHEMY_RPC = `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
const REGISTRY_CONTRACT = "0xC17def4DF914b016D60500Cb9C459c3eAf6469Ff";

const REGISTRY_ABI = [
  {
    "inputs": [{"name": "commitmentHash", "type": "bytes32"}],
    "name": "verify",
    "outputs": [{"components": [{"name": "attester", "type": "address"},{"name": "blockNumber", "type": "uint64"},{"name": "timestamp", "type": "uint64"},{"name": "filingState", "type": "uint8"},{"name": "revoked", "type": "bool"}],"name": "","type": "tuple"}],
    "stateMutability": "view",
    "type": "function"
  }
];

const STATE_NAMES: { [key: number]: string } = {
  1: "New York", 2: "Delaware", 3: "California", 4: "Florida", 5: "Texas", 6: "Illinois", 7: "Pennsylvania"
};

function computeHash(filingId: string, wallet: string, salt: string): string {
  return '0x' + createHash('sha256').update(`UCC-CHAIN/v1|${filingId}|${wallet}|${salt}`, 'utf8').digest('hex');
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filingId = searchParams.get('filingId') || '';
    const wallet = searchParams.get('wallet') || '';
    const salt = searchParams.get('salt') || '';

    if (!filingId || !wallet || !salt) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const provider = new JsonRpcProvider(ALCHEMY_RPC);
    const contract = new Contract(REGISTRY_CONTRACT, REGISTRY_ABI, provider);

    const walletVariants = [wallet, wallet.toLowerCase(), wallet.toUpperCase()];
    let attestation = null;
    let matchedHash = computeHash(filingId, wallet, salt);

    for (const v of walletVariants) {
      const hash = computeHash(filingId, v, salt);
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
        break;
      }
    }

    const status = !attestation ? 'Not Found' : attestation.revoked ? 'Revoked' : 'Active';
    
    // Return JSON for now - PDF generation moved to client side
    return NextResponse.json({
      success: true,
      status,
      message: "PDF generation has been moved to the /report page for better compatibility"
    });

  } catch (error: any) {
    console.error('PDF error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
