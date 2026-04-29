"use client";

import { useState } from "react";
import { computeCommitmentHash } from "./utils/hash";
import { verifyAttestation } from "./utils/verify";

type Mode = "verify" | "generate";

export default function Home() {
  const [mode, setMode] = useState<Mode>("verify");

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 bg-gray-900 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">
              UCC<span className="text-yellow-400">-</span>Chain
            </h1>
            <p className="text-xs text-gray-400">Cryptographic UCC-1 Verification Protocol</p>
          </div>
          <a 
            href="/guide#services"
            className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            Professional Services
          </a>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <p className="text-gray-400 text-sm mb-4 max-w-2xl mx-auto leading-relaxed">
            Cryptographically verify UCC-1 filing attestations on Polygon Mainnet. Built for New York UCC Article 12 (effective June 3, 2026).
          </p>
          <a href="/guide" className="text-sm text-blue-400 hover:text-blue-300 underline">
            New here? How does this work?
          </a>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="flex border-b border-gray-800">
            <button
              onClick={() => setMode("verify")}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                mode === "verify"
                  ? "bg-gray-800 text-white border-b-2 border-blue-500"
                  : "text-gray-400 hover:text-white hover:bg-gray-850"
              }`}
            >
              Verify Attestation
            </button>
            <button
              onClick={() => setMode("generate")}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                mode === "generate"
                  ? "bg-gray-800 text-white border-b-2 border-blue-500"
                  : "text-gray-400 hover:text-white hover:bg-gray-850"
              }`}
            >
              Generate Hash
            </button>
          </div>

          <div className="p-6">
            {mode === "verify" ? <VerifyMode /> : <GenerateMode />}
          </div>
        </div>

        <footer className="mt-8 text-center text-xs text-gray-600">
          <p>UCC-Chain LLC · HeirSure LLC · New York · April 2026</p>
          <p className="mt-1">
            Not legal advice. Pre-case-law. Technical verification tool only.
          </p>
        </footer>
      </div>
    </main>
  );
}

function VerifyMode() {
  const [filingId, setFilingId] = useState("");
  const [wallet, setWallet] = useState("");
  const [salt, setSalt] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const data = await verifyAttestation(filingId, wallet, salt);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const downloadProof = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ucc-chain-proof-${filingId}.json`;
    a.click();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Filing ID
        </label>
        <input
          type="text"
          value={filingId}
          onChange={(e) => setFilingId(e.target.value)}
          placeholder="e.g., UCC-CHAIN-TEST-001"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Secured Party Wallet Address
        </label>
        <input
          type="text"
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
          placeholder="0x..."
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 font-mono focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Salt (64 hex characters)
        </label>
        <input
          type="text"
          value={salt}
          onChange={(e) => setSalt(e.target.value)}
          placeholder="b02e985534141268..."
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 font-mono focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      <button
        onClick={handleVerify}
        disabled={loading || !filingId || !wallet || !salt}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors text-sm"
      >
        {loading ? "Verifying..." : "Verify Attestation"}
      </button>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div
            className={`border rounded-lg p-4 ${
              result.status === "Active"
                ? "bg-green-500/10 border-green-500/30"
                : result.status === "Revoked"
                ? "bg-yellow-500/10 border-yellow-500/30"
                : "bg-gray-800 border-gray-700"
            }`}
          >
            <p
              className={`font-bold text-lg mb-2 ${
                result.status === "Active"
                  ? "text-green-400"
                  : result.status === "Revoked"
                  ? "text-yellow-400"
                  : "text-gray-400"
              }`}
            >
              Status: {result.status}
            </p>
            <p className="text-sm text-gray-300 leading-relaxed">{result.summary}</p>
          </div>

          {result.on_chain_data && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-400 mb-2">On-Chain Data</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Attester:</span>
                  <span className="text-gray-300 font-mono">{result.on_chain_data.attester}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Block:</span>
                  <span className="text-gray-300">{result.on_chain_data.block_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date:</span>
                  <span className="text-gray-300">{result.on_chain_data.timestamp_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">State:</span>
                  <span className="text-gray-300">{result.on_chain_data.filing_state_name}</span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={downloadProof}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
          >
            Download Proof JSON
          </button>
        </div>
      )}
    </div>
  );
}

function GenerateMode() {
  const [filingId, setFilingId] = useState("");
  const [wallet, setWallet] = useState("");
  const [salt, setSalt] = useState("");
  const [hash, setHash] = useState("");

  const generateSalt = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const newSalt = Array.from(array)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    setSalt(newSalt);
  };

  const generateHash = () => {
    if (!filingId || !wallet || !salt) return;
    const computed = computeCommitmentHash(filingId, wallet, salt);
    setHash(computed);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Filing ID
        </label>
        <input
          type="text"
          value={filingId}
          onChange={(e) => setFilingId(e.target.value)}
          placeholder="e.g., HEIRSURE-2026-001"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Secured Party Wallet Address
        </label>
        <input
          type="text"
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
          placeholder="0x..."
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 font-mono focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Salt (64 hex characters)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={salt}
            onChange={(e) => setSalt(e.target.value)}
            placeholder="Click Generate Salt →"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 font-mono focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button
            onClick={generateSalt}
            className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
          >
            Generate Salt
          </button>
        </div>
      </div>

      <button
        onClick={generateHash}
        disabled={!filingId || !wallet || !salt}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors text-sm"
      >
        Generate Commitment Hash
      </button>

      {hash && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <p className="text-xs font-semibold text-gray-400 mb-2">Commitment Hash</p>
          <p className="text-sm text-green-400 font-mono break-all">{hash}</p>
          <p className="text-xs text-gray-500 mt-3">
            Save this hash. You will write it to the blockchain via PolygonScan, then reference it in your UCC-1 filing.
          </p>
        </div>
      )}
    </div>
  );
}
