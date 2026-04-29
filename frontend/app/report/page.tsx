'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { jsPDF } from 'jspdf';

export default function ReportPage() {
  const searchParams = useSearchParams();
  const filingId = searchParams.get('filingId') || '';
  const wallet = searchParams.get('wallet') || '';
  const salt = searchParams.get('salt') || '';

  const [loading, setLoading] = useState(true);
  const [proof, setProof] = useState<any>(null);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!filingId || !wallet || !salt) {
      setError('Missing verification parameters');
      setLoading(false);
      return;
    }

    fetch(`/api/verify?filingId=${encodeURIComponent(filingId)}&wallet=${encodeURIComponent(wallet)}&salt=${encodeURIComponent(salt)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProof(data.proof);
          setSummary(data.summary);
        } else {
          setError(data.error || 'Verification failed');
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [filingId, wallet, salt]);

  const downloadPDF = () => {
    if (!proof) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    const status = proof.status;
    const attestation = proof.on_chain_data;

    // Header
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('UCC-Chain', 15, 18);
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text('VERIFICATION REPORT', 15, 25);
    doc.text(`Generated: ${new Date().toUTCString()}`, pageWidth - 15, 18, { align: 'right' });

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
    doc.text(`Filing ID: ${proof.inputs.filing_id}`, pageWidth - 20, y + 12, { align: 'right' });

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

    // Data rows helper
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

    // On-chain data
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('ON-CHAIN ATTESTATION DATA', 15, y);
    y += 6;

    addRow('Filing Reference ID', proof.inputs.filing_id);
    addRow('Secured Party Wallet', proof.inputs.secured_party_wallet, true);
    addRow('Commitment Hash', proof.commitment_hash, true);
    if (attestation) {
      addRow('Attester Address', attestation.attester, true);
      addRow('Block Number', attestation.block_number.toLocaleString());
      addRow('Attestation Date', attestation.timestamp_date);
      addRow('Filing State', attestation.filing_state_name);
    }
    addRow('Status', status);
    addRow('Revoked', attestation?.revoked ? 'Yes' : 'No');

    y += 6;
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('REGISTRY & CHAIN DETAILS', 15, y);
    y += 6;

    addRow('Registry Contract', proof.registry_contract, true);
    addRow('Blockchain Network', `${proof.chain} (Chain ID ${proof.chain_id})`);
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

    doc.save(`UCC-Chain-Report-${proof.inputs.filing_id}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Verifying attestation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Verification Error</h1>
          <p className="text-slate-700">{error}</p>
        </div>
      </div>
    );
  }

  const statusColor = proof.status === 'Active' ? 'green' : proof.status === 'Revoked' ? 'red' : 'gray';
  const statusBg = proof.status === 'Active' ? 'bg-green-50' : proof.status === 'Revoked' ? 'bg-red-50' : 'bg-gray-50';
  const statusBorder = proof.status === 'Active' ? 'border-green-500' : proof.status === 'Revoked' ? 'border-red-500' : 'border-gray-500';

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-slate-900 text-white px-8 py-6">
            <h1 className="text-3xl font-bold">UCC-Chain</h1>
            <p className="text-slate-400 text-sm">VERIFICATION REPORT</p>
          </div>

          {/* Status */}
          <div className={`${statusBg} border-b-4 ${statusBorder} px-8 py-6`}>
            <div className="flex justify-between items-center">
              <div className={`text-2xl font-bold text-${statusColor}-600`}>
                {proof.status === 'Active' && '✓ ATTESTATION ACTIVE'}
                {proof.status === 'Revoked' && '✗ ATTESTATION REVOKED'}
                {proof.status === 'Not Found' && '— NOT FOUND'}
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-600">Filing ID</div>
                <div className="font-mono font-bold">{proof.inputs.filing_id}</div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="px-8 py-6 bg-slate-50">
            <h2 className="text-xs font-bold text-slate-500 uppercase mb-2">Verification Summary</h2>
            <p className="text-slate-800">{summary}</p>
          </div>

          {/* Download Button */}
          <div className="px-8 py-6 border-t border-slate-200">
            <button
              onClick={downloadPDF}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition"
            >
              Download PDF Report
            </button>
          </div>

          {/* View JSON */}
          <div className="px-8 py-6 border-t border-slate-200">
            <details>
              <summary className="cursor-pointer text-sm font-bold text-slate-600 hover:text-slate-900">
                View Raw Proof JSON
              </summary>
              <pre className="mt-4 p-4 bg-slate-900 text-green-400 rounded text-xs overflow-x-auto">
                {JSON.stringify(proof, null, 2)}
              </pre>
            </details>
          </div>
        </div>

        <div className="text-center text-sm text-slate-500 mt-8">
          UCC-Chain LLC · HeirSure LLC · verify.ucc-chain.org · Not legal advice
        </div>
      </div>
    </div>
  );
}
