import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { JsonRpcProvider, Contract } from 'ethers';
// @ts-ignore
import PDFDocument from 'pdfkit';

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

async function streamToBuffer(stream: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
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
      summary = `No attestation found on Polygon Mainnet for filing ID "${filingId}" with the provided inputs.`;
    } else if (status === 'Revoked') {
      summary = `The attestation for filing ID "${filingId}" was recorded at block ${attestation!.blockNumber} but has been REVOKED by the original attester (${attestation!.attester}).`;
    } else {
      summary = `VERIFIED ACTIVE. The attestation for filing ID "${filingId}" is recorded on Polygon Mainnet at block ${attestation!.blockNumber}, attested on ${attestedDate} by wallet ${attestation!.attester}. Filing state: ${stateName}. This attestation supports the identifiability prong of the UCC § 12-105 control test. The attestation has not been revoked and remains in force.`;
    }

    // Generate PDF
    const doc = new PDFDocument({ margin: 54, size: 'LETTER' });

    // Colors
    const DARK = '#0f172a';
    const GREEN = '#16a34a';
    const RED = '#dc2626';
    const GRAY = '#64748b';
    const LIGHT = '#f8fafc';
    const statusColor = status === 'Active' ? GREEN : status === 'Revoked' ? RED : GRAY;

    // ── HEADER ──
    doc.rect(54, 54, doc.page.width - 108, 64).fill(DARK);
    doc.fillColor('white').font('Helvetica-Bold').fontSize(20).text('UCC-Chain', 74, 68);
    doc.fillColor('#94a3b8').font('Helvetica').fontSize(9).text('VERIFICATION REPORT', 74, 92);
    doc.fillColor('#94a3b8').font('Helvetica').fontSize(8).text('Cryptographic UCC-1 Attestation', doc.page.width - 280, 68, { width: 200, align: 'right' });
    doc.fillColor('#94a3b8').font('Helvetica').fontSize(8).text(`Generated: ${verifiedAt}`, doc.page.width - 280, 82, { width: 200, align: 'right' });

    // ── STATUS BOX ──
    const statusBg = status === 'Active' ? '#f0fdf4' : status === 'Revoked' ? '#fef2f2' : '#f8fafc';
    doc.rect(54, 132, doc.page.width - 108, 48).fill(statusBg);
    doc.rect(54, 178, doc.page.width - 108, 1.5).fill(statusColor);
    const statusText = status === 'Active' ? '✓  ATTESTATION ACTIVE' : status === 'Revoked' ? '✗  ATTESTATION REVOKED' : '—  NOT FOUND';
    doc.fillColor(statusColor).font('Helvetica-Bold').fontSize(13).text(statusText, 70, 147);
    doc.fillColor(DARK).font('Helvetica').fontSize(9).text(`Filing ID: ${filingId}`, doc.page.width - 280, 147, { width: 216, align: 'right' });

    let y = 196;
    const lineHeight = 18;
    const labelX = 54;
    const valueX = 200;
    const pageWidth = doc.page.width - 108;

    const sectionHeader = (title: string) => {
      y += 8;
      doc.fillColor(GRAY).font('Helvetica-Bold').fontSize(8).text(title, labelX, y);
      y += 14;
    };

    const row = (label: string, value: string, mono = false) => {
      const bg = y % (lineHeight * 2) < lineHeight ? '#ffffff' : LIGHT;
      doc.rect(labelX, y - 3, pageWidth, lineHeight).fill(bg);
      doc.fillColor(GRAY).font('Helvetica-Bold').fontSize(8).text(label, labelX + 8, y);
      doc.fillColor(DARK).font(mono ? 'Courier' : 'Helvetica').fontSize(8).text(value, valueX, y, { width: pageWidth - 155 });
      y += lineHeight;
    };

    // ── SUMMARY ──
    sectionHeader('VERIFICATION SUMMARY');
    doc.rect(labelX, y - 3, pageWidth, 0).fill('#e2e8f0');
    doc.rect(labelX, y - 3, pageWidth, 52).fill(LIGHT);
    doc.fillColor(DARK).font('Helvetica').fontSize(9).text(summary, labelX + 8, y, { width: pageWidth - 16, lineGap: 3 });
    y += 60;

    // ── ON-CHAIN DATA ──
    sectionHeader('ON-CHAIN ATTESTATION DATA');
    row('Filing Reference ID', filingId);
    row('Secured Party Wallet', wallet, true);
    row('Commitment Hash (SHA-256)', matchedHash, true);
    if (attestation) {
      row('Attester Address', attestation.attester, true);
      row('Block Number', parseInt(attestation.blockNumber).toLocaleString());
      row('Attestation Date', attestedDate);
      row('Filing State', stateName);
    }
    row('Status', status);
    row('Revoked', attestation?.revoked ? 'Yes' : 'No');

    // ── REGISTRY ──
    sectionHeader('REGISTRY & CHAIN DETAILS');
    row('Registry Contract', REGISTRY_CONTRACT, true);
    row('Blockchain Network', 'Polygon PoS Mainnet (Chain ID 137)');
    row('Hash Function', 'SHA-256 (NIST FIPS 180-4)');
    row('Verification URL', 'https://verify.ucc-chain.org');

    // ── LEGAL ──
    sectionHeader('LEGAL CONTEXT');
    row('Governing Law', 'New York UCC Article 12 (effective June 3, 2026)');
    row('Statutory Basis', 'UCC § 12-105(a)(2) — identifiability by cryptographic key');
    row('Priority Rule', 'UCC § 9-326A — control-perfected interest senior to filing-only');
    row('Collateral Type', 'Controllable Electronic Record (CER)');

    // ── DISCLAIMER ──
    y += 12;
    doc.rect(labelX, y, pageWidth, 0.5).fill('#e2e8f0');
    y += 10;
    doc.fillColor(GRAY).font('Helvetica').fontSize(7).text(
      'DISCLAIMER: This report is a technical verification artifact produced by UCC-Chain LLC / HeirSure LLC. It confirms the existence and status of an on-chain cryptographic attestation. It is NOT legal advice, does NOT constitute a legal opinion, and does NOT create an attorney-client relationship. No representation is made as to the legal sufficiency of any underlying UCC-1 filing, security agreement, or collateral description. Consult a secured-transactions attorney before relying on this report.',
      labelX, y, { width: pageWidth, lineGap: 2 }
    );
    y += 38;
    doc.fillColor(GRAY).font('Helvetica').fontSize(8).text(
      'UCC-Chain LLC · HeirSure LLC · New York · verify.ucc-chain.org · Not legal advice',
      labelX, y, { width: pageWidth, align: 'center' }
    );

    doc.end();

    const pdfBuffer = await streamToBuffer(doc);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="UCC-Chain-Report-${filingId}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      }
    });

  } catch (error: any) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
