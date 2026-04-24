"use client";

import { useState } from "react";
import { generateCommitmentHash, generateSalt, formatHash } from "@/lib/commitment";
import {
  verifyCommitment,
  formatTimestamp,
  getStateName,
  formatAddress,
  CONTRACT_ADDRESS,
  POLYGONSCAN_URL,
  type VerifyResult,
} from "@/lib/contract";

type Mode = "verify" | "generate";
type Status = "idle" | "loading" | "found" | "notfound" | "error";

export default function Home() {
  const [mode, setMode] = useState<Mode>("verify");
  const [filingId, setFilingId] = useState("");
  const [wallet, setWallet] = useState("");
  const [salt, setSalt] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [computedHash, setComputedHash] = useState("");
  const [hashError, setHashError] = useState("");
  const [genFilingId, setGenFilingId] = useState("");
  const [genWallet, setGenWallet] = useState("");
  const [genSalt, setGenSalt] = useState("");
  const [genHash, setGenHash] = useState("");
  const [genError, setGenError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleVerify() {
    setHashError(""); setResult(null); setComputedHash("");
    let hash = "";
    try {
      hash = generateCommitmentHash(filingId, wallet, salt);
      setComputedHash(hash);
    } catch (err) {
      setHashError(err instanceof Error ? err.message : "Invalid inputs");
      return;
    }
    setStatus("loading");
    try {
      const res = await verifyCommitment(hash);
      setResult(res);
      if (res.error) setStatus("error");
      else if (res.found) setStatus("found");
      else setStatus("notfound");
    } catch { setStatus("error"); }
  }

  function handleGenerate() {
    setGenError(""); setGenHash("");
    try {
      const hash = generateCommitmentHash(genFilingId, genWallet, genSalt);
      setGenHash(hash);
    } catch (err) {
      setGenError(err instanceof Error ? err.message : "Invalid inputs");
    }
  }

  function handleRandomSalt() { setGenSalt(generateSalt()); }

  async function handleCopy(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleReset() {
    setFilingId(""); setWallet(""); setSalt("");
    setStatus("idle"); setResult(null);
    setComputedHash(""); setHashError("");
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">
              UCC<span className="text-yellow-400">-</span>Chain
            </h1>
            <p className="text-xs text-gray-400">Cryptographic UCC-1 Verification Protocol</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs text-green-400 bg-green-400/10 px-3 py-1.5 rounded-full border border-green-400/20">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Live on Polygon Mainnet
            </span>
            <a href={POLYGONSCAN_URL} target="_blank" rel="noopener noreferrer"
              className="text-xs text-gray-400 hover:text-white transition-colors">
              PolygonScan
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">Verify Digital Asset Control</h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm leading-relaxed">
            UCC-Chain cryptographically links UCC-1 financing statements to on-chain wallet
            addresses. Enter a filing ID, wallet, and salt to verify control under{" "}
            <span className="text-yellow-400">UCC Article 12</span> — effective New York June 3, 2026.
          </p>
        </div>

        <div className="flex gap-2 mb-6 bg-gray-900 p-1 rounded-lg w-fit mx-auto">
          <button onClick={() => setMode("verify")}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
              mode === "verify" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}>
            Verify Attestation
          </button>
          <button onClick={() => setMode("generate")}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
              mode === "generate" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}>
            Generate Hash
          </button>
        </div>

        {mode === "verify" && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold mb-1">Verify an Attestation</h3>
            <p className="text-gray-400 text-sm mb-6">
              Enter the three inputs from the public UCC-1 metadata. Free — no wallet needed.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">UCC-1 Filing ID</label>
                <input type="text" value={filingId} onChange={(e) => setFilingId(e.target.value)}
                  placeholder="e.g. NY-202607-123456789"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Secured Party Wallet Address</label>
                <input type="text" value={wallet} onChange={(e) => setWallet(e.target.value)}
                  placeholder="0x..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors font-mono" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Attestation Salt</label>
                <input type="text" value={salt} onChange={(e) => setSalt(e.target.value)}
                  placeholder="64-character hex string from metadata"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors font-mono" />
              </div>
              {hashError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">
                  {hashError}
                </div>
              )}
              {computedHash && (
                <div className="bg-gray-800 rounded-lg px-4 py-3">
                  <p className="text-xs text-gray-400 mb-1">Computed commitment hash:</p>
                  <p className="font-mono text-xs text-green-400 break-all">{computedHash}</p>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button onClick={handleVerify}
                  disabled={status === "loading" || !filingId || !wallet || !salt}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3 rounded-lg transition-colors text-sm">
                  {status === "loading" ? "Querying Polygon Mainnet..." : "Verify Attestation"}
                </button>
                {status !== "idle" && (
                  <button onClick={handleReset}
                    className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors text-sm">
                    Reset
                  </button>
                )}
              </div>
            </div>

            {status === "found" && result?.attestation && (
              <div className="mt-6 border-t border-gray-800 pt-6">
                <div className={`rounded-lg border p-4 mb-4 ${result.active
                  ? "bg-green-500/10 border-green-500/30"
                  : "bg-red-500/10 border-red-500/30"}`}>
                  <p className={`font-bold text-lg ${result.active ? "text-green-400" : "text-red-400"}`}>
                    {result.active ? "Attestation Active" : "Attestation Revoked"}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {result.active
                      ? "This commitment hash is attested and active on Polygon Mainnet"
                      : "This attestation was revoked by the original attester"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Secured Party Wallet", value: result.attestation.attester, mono: true },
                    { label: "Filing State", value: getStateName(result.attestation.filingState), mono: false },
                    { label: "Attested Block", value: result.attestation.blockNumber.toLocaleString(), mono: false },
                    { label: "Attested Date", value: formatTimestamp(result.attestation.timestamp), mono: false },
                    { label: "Status", value: result.attestation.revoked ? "REVOKED" : "ACTIVE", mono: false },
                    { label: "Commitment Hash", value: formatHash(computedHash), mono: true },
                  ].map(({ label, value, mono }) => (
                    <div key={label} className="bg-gray-800 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">{label}</p>
                      <p className={`text-sm text-white break-all ${mono ? "font-mono" : "font-medium"}`}>{value}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-4">
                  <a href={`https://polygonscan.com/address/${CONTRACT_ADDRESS}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex-1 text-center py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors">
                    View on PolygonScan
                  </a>
                  <button onClick={() => {
                    const proof = {
                      protocol: "UCC-CHAIN/v1",
                      commitmentHash: computedHash,
                      attestation: result.attestation,
                      verifiedAt: new Date().toISOString(),
                      registryContract: CONTRACT_ADDRESS,
                      network: "Polygon Mainnet (chainId 137)",
                    };
                    const blob = new Blob([JSON.stringify(proof, null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url; a.download = "ucc-chain-proof.json"; a.click();
                  }}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors">
                    Download Proof JSON
                  </button>
                </div>
              </div>
            )}

            {status === "notfound" && (
              <div className="mt-6 border-t border-gray-800 pt-6">
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <p className="text-yellow-400 font-bold">Not Found</p>
                  <p className="text-gray-400 text-sm mt-1">
                    No attestation found for this commitment hash. Check that all three inputs are exactly correct.
                  </p>
                  {computedHash && (
                    <p className="font-mono text-xs text-gray-500 mt-2 break-all">Queried: {computedHash}</p>
                  )}
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="mt-6 border-t border-gray-800 pt-6">
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <p className="text-red-400 font-bold">Error</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {result?.error || "Could not connect to Polygon Mainnet. Try again."}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {mode === "generate" && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold mb-1">Generate Commitment Hash</h3>
            <p className="text-gray-400 text-sm mb-6">
              Generate the SHA-256 commitment hash for a new UCC-1 attestation.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">UCC-1 Filing ID</label>
                <input type="text" value={genFilingId} onChange={(e) => setGenFilingId(e.target.value)}
                  placeholder="e.g. NY-202607-123456789"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Secured Party Wallet Address</label>
                <input type="text" value={genWallet} onChange={(e) => setGenWallet(e.target.value)}
                  placeholder="0x..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors font-mono" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Salt</label>
                <div className="flex gap-2">
                  <input type="text" value={genSalt} onChange={(e) => setGenSalt(e.target.value)}
                    placeholder="64-character hex string"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors font-mono" />
                  <button onClick={handleRandomSalt}
                    className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors whitespace-nowrap">
                    Generate Salt
                  </button>
                </div>
              </div>
              {genError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">
                  {genError}
                </div>
              )}
              <button onClick={handleGenerate}
                disabled={!genFilingId || !genWallet || !genSalt}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3 rounded-lg transition-colors text-sm">
                Generate Commitment Hash
              </button>
              {genHash && (
                <div className="bg-gray-800 rounded-lg p-4 border border-green-500/30">
                  <p className="text-xs text-gray-400 mb-2">Your commitment hash:</p>
                  <p className="font-mono text-sm text-green-400 break-all mb-3">{genHash}</p>
                  <button onClick={() => handleCopy(genHash)}
                    className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors">
                    {copied ? "Copied!" : "Copy Hash"}
                  </button>
                  <div className="mt-4 bg-gray-900 rounded-lg p-3">
                    <p className="text-xs text-yellow-400 font-semibold mb-1">Next steps:</p>
                    <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
                      <li>Save this hash and your salt securely</li>
                      <li>Call attest(hash, stateCode) on the registry contract</li>
                      <li>File your UCC-1 referencing this hash in the collateral description</li>
                      <li>Publish metadata JSON with filing ID, wallet, salt, and hash</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 bg-gray-900 rounded-xl border border-gray-800 p-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-xs text-gray-400">Registry Contract</p>
              <p className="font-mono text-sm text-white">{CONTRACT_ADDRESS}</p>
            </div>
            <div className="flex gap-2">
              <a href={POLYGONSCAN_URL} target="_blank" rel="noopener noreferrer"
                className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors">
                PolygonScan
              </a>
              <a href="https://github.com/heirsure-cyber/UCC-Chain-Dev" target="_blank" rel="noopener noreferrer"
                className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors">
                GitHub
              </a>
            </div>
          </div>
        </div>

        <div className="mt-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
          <p className="text-xs text-yellow-600 leading-relaxed">
            <span className="font-bold">Disclaimer:</span> UCC-Chain is a pre-MVP protocol
            operating in a pre-case-law legal environment. No US court has yet ruled on
            NFT-based control under UCC Article 12. Use alongside traditional filing
            best practices. Not legal advice. Consult a secured-transactions attorney
            before use in any real transaction.
          </p>
        </div>

        <footer className="mt-8 text-center text-xs text-gray-600">
          <p>UCC-Chain LLC - HeirSure LLC - New York - April 2026</p>
          <p className="mt-1">Built with Claude AI - Deployed on Polygon PoS Mainnet - MIT License</p>
        </footer>
      </div>
    </main>
  );
}
