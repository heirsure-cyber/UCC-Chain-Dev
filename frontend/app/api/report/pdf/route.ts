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

    // Verify on-chain
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
    const verifiedAt = new Date().toUTCString();
    const attestedDate = attestation ? new Date(parseInt(attestation.timestamp) * 1000).toUTCString() : '';
    const stateName = attestation ? (STATE_NAMES[attestation.filingState] || 'Unknown') : '';

    let summary = '';
    if (status === 'Not Found') {
      summary = `No attestation found on Polygon Mainnet for filing ID "${filingId}".`;
    } else if (status === 'Revoked') {
      summary = `The attestation for filing ID "${filingId}" was recorded at block ${attestation!.blockNumber} but has been REVOKED.`;
    } else {
      summary = `VERIFIED ACTIVE. The attestation for filing ID "${filingId}" is recorded on Polygon Mainnet at block ${attestation!.blockNumber}, attested on ${attestedDate}. Filing state: ${stateName}. This attestation supports the identifiability prong of UCC § 12-105 control test.`;
    }

    // Generate PDF with jsPDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Header
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('UCC-Chain', 15, 18);
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text('VERIFICATION REPORT', 15, 25);
    doc.text(`Generated: ${verifiedAt}`, pageWidth - 15, 18, { align: 'right' });

    y = 40;

    // Status box
    const statusColor = status === 'Active' ? [22, 163, 74] : status === 'Revoked' ? [220, 38, 38] : [100, 116, 139];
    const statusBg = status === 'Active' ? [240, 253, 244] : status === 'Revoked' ? [254, 242, 242] : [248, 250, 252];
    doc.setFillColor(...statusBg);
    doc.rect(15, y, pageWidth - 30, 20, 'F');
    doc.setTextColor(...statusColor);
    doc.setFontSize(13);
    const statusText = status === 'Active' ? '✓  ACTIVE' : status === 'Revoked' ? '✗  REVOKED' : '—  NOT FOUND';
    doc.text(statusText, 20, y + 12);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.text(`Filing ID: ${filingId}`, pageWidth - 20, y + 12, { align: 'right' });

    y += 30;

    // Summary
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('VERIFICATION SUMMARY', 15, y);
    y += 6;
    doc.setFillColor(248, 250, 252);
    doc.rect(15, y, pageWidth - 30, 25, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    const splitSummary = doc.splitTextToSize(summary, pageWidth - 40);
    doc.text(splitSummary, 20, y + 6);
    y += 32;

    // Data rows
    const addRow = (label: string, value: string, mono = false) => {
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(label, 20, y);
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);
      if (mono) doc.setFont('courier');
      const splitValue = doc.splitTextToSize(value, pageWidth - 90);
      doc.text(splitValue, 80, y);
      if (mono) doc.setFont('helvetica');
      y += 7;
    };

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('ON-CHAIN ATTESTATION DATA', 15, y);
    y += 6;

    addRow('Filing Reference ID', filingId);
    addRow('Secured Party Wallet', wallet, true);
    addRow('Commitment Hash', matchedHash, true);
    if (attestation) {
      addRow('Attester Address', attestation.attester, true);
      addRow('Block Number', parseInt(attestation.blockNumber).toLocaleString());
      addRow('Attestation Date', attestedDate);
      addRow('Filing State', stateName);
    }
    addRow('Status', status);
    addRow('Revoked', attestation?.revoked ? 'Yes' : 'No');

    y += 6;
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('REGISTRY & CHAIN DETAILS', 15, y);
    y += 6;

    addRow('Registry Contract', REGISTRY_CONTRACT, true);
    addRow('Blockchain Network', 'Polygon PoS Mainnet (Chain ID 137)');
    addRow('Hash Function', 'SHA-256 (NIST FIPS 180-4)');
    addRow('Verification URL', 'https://verify.ucc-chain.org', true);

    y += 6;
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('LEGAL CONTEXT', 15, y);
    y += 6;

    addRow('Governing Law', 'New York UCC Article 12 (eff. June 3, 2026)');
    addRow('Statutory Basis', 'UCC § 12-105(a)(2)');
    addRow('Priority Rule', 'UCC § 9-326A');

    y += 6;
    doc.setDrawColor(226, 232, 240);
    doc.line(15, y, pageWidth - 15, y);
    y += 4;
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    const disclaimer = 'DISCLAIMER: This is a technical verification artifact. It is NOT legal advice. Consult a secured-transactions attorney before relying on this report.';
    const splitDisclaimer = doc.splitTextToSize(disclaimer, pageWidth - 30);
    doc.text(splitDisclaimer, 15, y);
    y += splitDisclaimer.length * 3 + 4;
    doc.setFontSize(8);
    doc.text('UCC-Chain LLC · HeirSure LLC · verify.ucc-chain.org', pageWidth / 2, y, { align: 'center' });

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="UCC-Chain-Report-${filingId}.pdf"`,
      }
    });

  } catch (error: any) {
    console.error('PDF error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
