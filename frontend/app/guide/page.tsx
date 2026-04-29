"use client";

import { useState } from "react";

const CONTRACT_ADDRESS = "0xC17def4DF914b016D60500Cb9C459c3eAf6469Ff";
const POLYGONSCAN_WRITE = "https://polygonscan.com/address/0xC17def4DF914b016D60500Cb9C459c3eAf6469Ff#writeContract";
const NY_DOS_URL = "https://www.dos.ny.gov/corps/ucc_filing.html";
const GITHUB_METADATA = "https://github.com/heirsure-cyber/UCC-Chain-Dev/tree/main/metadata";
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xdayvgrd";

export default function GuidePage() {
  const [role, setRole] = useState("");
  const [filingMethod, setFilingMethod] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);

  const roles = [
    { id: "lender", label: "Lender / Creditor", desc: "I want to perfect a security interest in crypto collateral" },
    { id: "lawyer", label: "Attorney", desc: "I need to verify or advise on a digital asset lien" },
    { id: "trustee", label: "Trustee / Court", desc: "I need to verify who controlled a wallet at a specific time" },
    { id: "estate", label: "Estate / Fiduciary", desc: "I am managing digital assets on behalf of a benefactor" },
  ];

  const roleContext: Record<string, string> = {
    lender: "As a lender, you will use UCC-Chain to prove your security interest in a borrower's crypto assets beats any later competing claim under UCC Section 9-326A.",
    lawyer: "As an attorney, you can verify an existing attestation for a client, or advise a lender on how to perfect control under UCC Article 12.",
    trustee: "As a trustee or court officer, you can verify any attestation for free and download a court-ready verification artifact.",
    estate: "As a fiduciary, you can document custody arrangements under UCC Section 12-105(e) acknowledging custodian framework.",
  };

  const scrollToServices = () => {
    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 bg-gray-900 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <a href="/" className="text-xl font-bold text-white hover:text-yellow-400 transition-colors">
              UCC<span className="text-yellow-400">-</span>Chain
            </a>
            <p className="text-xs text-gray-400">Cryptographic UCC-1 Verification Protocol</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={scrollToServices}
              className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              Professional Services
            </button>
            <a href="/" className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors">
              Back to Verifier
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-10">

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-3">How UCC-Chain Works</h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm leading-relaxed">
            A step-by-step guide to verifying and recording digital asset control under UCC Article 12, effective New York June 3, 2026.
          </p>
        </div>

        <div className="mb-10">
          <p className="text-sm font-medium text-gray-300 mb-4 text-center">Who are you?</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {roles.map((r) => (
              <button key={r.id} onClick={() => setRole(r.id)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  role === r.id ? "border-blue-500 bg-blue-500/10" : "border-gray-700 bg-gray-900 hover:border-gray-600"}`}>
                <p className="text-sm font-semibold text-white mb-1">{r.label}</p>
                <p className="text-xs text-gray-400">{r.desc}</p>
              </button>
            ))}
          </div>
          {role && roleContext[role] && (
            <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <p className="text-sm text-blue-300">{roleContext[role]}</p>
            </div>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4 text-center">What do you need to do?</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900 border border-teal-500/40 rounded-xl p-5">
              <p className="text-teal-400 font-bold text-lg mb-2">Verify an existing attestation</p>
              <p className="text-sm text-gray-400">Someone gave you a filing ID, wallet, and salt. You want to confirm the lien is active on the blockchain.</p>
              <p className="text-xs text-teal-400 mt-3 font-semibold">Follow Steps 1-2 below</p>
            </div>
            <div className="bg-gray-900 border border-blue-500/40 rounded-xl p-5">
              <p className="text-blue-400 font-bold text-lg mb-2">Record a new security interest</p>
              <p className="text-sm text-gray-400">You are a lender or fiduciary who wants to create a new on-chain attestation linked to a UCC-1 filing.</p>
              <p className="text-xs text-blue-400 mt-3 font-semibold">Follow Steps 1-7 below</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">

          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">1</div>
              <div>
                <h3 className="font-bold text-white">Understand the Three Inputs</h3>
                <p className="text-xs text-gray-400">Every UCC-Chain attestation requires exactly three inputs</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { name: "Filing ID", example: "HEIRSURE-2026-001", desc: "A unique identifier for this filing. Can be your own reference ID or the official Secretary of State number. Must be consistent across all steps.", color: "border-teal-500", lc: "text-teal-400" },
                { name: "Wallet Address", example: "0x5DC1...7778", desc: "The secured party wallet - the lender or custodian recording the security interest. Must start with 0x. This wallet signs the attest() transaction.", color: "border-blue-500", lc: "text-blue-400" },
                { name: "Salt", example: "b02e9855...", desc: "A random 64-character string preventing brute-force guessing. Generated automatically. MUST be saved - you cannot verify without it later.", color: "border-purple-500", lc: "text-purple-400" },
              ].map((input) => (
                <div key={input.name} className={`bg-gray-800 rounded-lg p-3 border ${input.color}`}>
                  <p className={`text-xs font-bold ${input.lc} mb-1`}>{input.name}</p>
                  <p className="font-mono text-xs text-gray-300 mb-2">{input.example}</p>
                  <p className="text-xs text-gray-400">{input.desc}</p>
                </div>
              ))}
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <p className="text-xs text-yellow-400">
                <span className="font-bold">Critical:</span> The salt is NOT on the public UCC-1. It is published separately in the off-chain metadata JSON. Always save your salt in at least two secure locations immediately after generating it.
              </p>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">2</div>
              <div>
                <h3 className="font-bold text-white">Verify an Existing Attestation</h3>
                <p className="text-xs text-gray-400">If you just want to verify - stop here after this step</p>
              </div>
            </div>
            <ol className="space-y-3 mb-4">
              {[
                "Go to verify.ucc-chain.org and click the Verify Attestation tab",
                "Enter the Filing ID from the public UCC-1 collateral description or off-chain metadata",
                "Enter the Secured Party wallet address from the UCC-1",
                "Enter the Salt from the off-chain metadata JSON (published in GitHub or Arweave)",
                "Click Verify Attestation - the hash is computed in your browser and queried against Polygon Mainnet",
                "Read the result: Active means the lien is in force. Revoked means it was terminated.",
                "Click Download Proof JSON to save a court-ready verification artifact",
              ].map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-300">
                  <span className="text-teal-400 font-bold flex-shrink-0">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
            <a href="/" className="inline-block bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              Go to Verifier
            </a>
          </div>

          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">3</div>
              <div>
                <h3 className="font-bold text-white">Choose Your Filing ID Approach</h3>
                <p className="text-xs text-gray-400">Important decision before you generate anything</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 mb-4">
              The Filing ID in your commitment hash must be consistent with what appears in your UCC-1. You have two valid approaches:
            </p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <button onClick={() => setFilingMethod("own")}
                className={`p-4 rounded-xl border text-left transition-all ${filingMethod === "own" ? "border-blue-500 bg-blue-500/10" : "border-gray-700 bg-gray-800 hover:border-gray-600"}`}>
                <p className="text-sm font-bold text-blue-400 mb-2">Option A — Your Own Reference ID</p>
                <p className="text-xs text-gray-300 mb-2">Choose a unique identifier you control before filing. Example: HEIRSURE-2026-001</p>
                <p className="text-xs text-green-400 font-semibold">Recommended — simpler workflow</p>
                <ul className="text-xs text-gray-400 mt-2 space-y-1">
                  <li>+ Attest before filing the UCC-1</li>
                  <li>+ No UCC-3 amendment needed</li>
                  <li>+ Reference your ID in the UCC-1 collateral description</li>
                </ul>
              </button>
              <button onClick={() => setFilingMethod("official")}
                className={`p-4 rounded-xl border text-left transition-all ${filingMethod === "official" ? "border-purple-500 bg-purple-500/10" : "border-gray-700 bg-gray-800 hover:border-gray-600"}`}>
                <p className="text-sm font-bold text-purple-400 mb-2">Option B — Official Filing Number</p>
                <p className="text-xs text-gray-300 mb-2">File the UCC-1 first, get the official number from the Secretary of State, then attest.</p>
                <p className="text-xs text-yellow-400 font-semibold">Maximum legal integrity</p>
                <ul className="text-xs text-gray-400 mt-2 space-y-1">
                  <li>+ Hash contains official government filing number</li>
                  <li>- File UCC-1 first with placeholder collateral description</li>
                  <li>- Requires UCC-3 amendment to add hash afterward</li>
                </ul>
              </button>
            </div>
            {filingMethod === "own" && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-xs text-blue-300">
                  <span className="font-bold">Option A selected:</span> Create your own unique reference ID now (e.g. HEIRSURE-2026-001), use it in Step 4 to generate your hash and attest, then reference that same ID in your UCC-1 collateral description when you file in Step 6.
                </p>
              </div>
            )}
            {filingMethod === "official" && (
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                <p className="text-xs text-purple-300">
                  <span className="font-bold">Option B selected:</span> Go to Step 6 first and file your UCC-1 with a placeholder collateral description. Get your official filing number, then return to Step 4 to generate the hash and attest. Finally file a UCC-3 amendment adding the hash to the collateral description.
                </p>
              </div>
            )}
          </div>

          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">4</div>
              <div>
                <h3 className="font-bold text-white">Generate Your Commitment Hash</h3>
                <p className="text-xs text-gray-400">For lenders and fiduciaries recording a new security interest</p>
              </div>
            </div>
            <ol className="space-y-3 mb-4">
              {[
                "Go to verify.ucc-chain.org and click the Generate Hash tab",
                "Enter your Filing ID - either your own reference ID (Option A) or the official filing number (Option B)",
                "Enter your secured party wallet address in 0x... format - this is YOUR wallet as lender or fiduciary",
                "Click Generate Salt - this creates a cryptographically random 64-character string",
                "SAVE THE SALT NOW - copy it to a password manager or secure note immediately. You cannot verify without it.",
                "Click Generate Commitment Hash - a 0x... hash appears",
                "Save the hash - this is what gets written to the blockchain in the next step",
              ].map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-300">
                  <span className="text-blue-400 font-bold flex-shrink-0">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
            <a href="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              Go to Generate Hash
            </a>
          </div>

          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">5</div>
              <div>
                <h3 className="font-bold text-white">Attest the Hash on Polygon Mainnet</h3>
                <p className="text-xs text-gray-400">Write your commitment hash to the blockchain - costs less than $0.01</p>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <p className="text-xs text-gray-400 mb-2 font-semibold">What you need before starting:</p>
              <ul className="text-xs text-gray-300 space-y-1">
                <li>MetaMask wallet installed in your browser (metamask.io)</li>
                <li>Polygon Mainnet added to MetaMask (Network: Polygon, Chain ID: 137)</li>
                <li>A small amount of POL token in your wallet (about $1 worth is plenty)</li>
                <li>Your commitment hash from Step 4</li>
              </ul>
            </div>
            <ol className="space-y-3 mb-4">
              {[
                "Click the PolygonScan Write Contract link below to open the registry contract",
                "Click Connect to Web3 on the PolygonScan page and select MetaMask",
                "Confirm MetaMask is set to Polygon Mainnet - check the network name at the top of MetaMask",
                "Find the function called 1. attest in the list of functions on PolygonScan",
                "In the commitmentHash field: paste your full 0x... hash from Step 4",
                "In the filingState field: enter 1 for New York (see state codes below)",
                "Click Write - MetaMask opens with a transaction to confirm",
                "Click Confirm in MetaMask - gas cost is approximately $0.001 to $0.003",
                "Wait 15-30 seconds - you will see a green Success status on PolygonScan",
                "Save the Transaction Hash, Block Number, and Timestamp shown on PolygonScan - you need these for your metadata file",
              ].map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-300">
                  <span className="text-blue-400 font-bold flex-shrink-0">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-xs font-bold text-gray-300 mb-2">State Codes for filingState field</p>
                {[["1","New York"],["2","Delaware"],["3","California"],["4","Florida"],["5","Texas"]].map(([code, state]) => (
                  <div key={code} className="flex justify-between text-xs py-0.5">
                    <span className="font-mono text-blue-400">{code}</span>
                    <span className="text-gray-300">{state}</span>
                  </div>
                ))}
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-xs font-bold text-yellow-400 mb-2">Important</p>
                <p className="text-xs text-gray-300">
                  The wallet you use to call attest() becomes the recorded secured party. Use the SAME wallet address you entered as Secured Party in Step 4. Only this wallet can later revoke the attestation.
                </p>
              </div>
            </div>
            <a href={POLYGONSCAN_WRITE} target="_blank" rel="noopener noreferrer"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              Open PolygonScan Write Contract
            </a>
          </div>

          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">6</div>
              <div>
                <h3 className="font-bold text-white">File Your UCC-1 with the Secretary of State</h3>
                <p className="text-xs text-gray-400">Reference your commitment hash in the collateral description</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 mb-4">
              File your UCC-1 at the NY Department of State online portal. In the collateral description field include a reference to your on-chain attestation. If you used Option A (your own reference ID) you already have your hash ready to include. If you used Option B (official filing number) file first then return to Step 4.
            </p>
            <div className="bg-gray-800 rounded-lg p-4 font-mono text-xs text-green-400 mb-4 leading-relaxed">
              {`All rights, title, and interest of Debtor in and to the controllable
electronic record(s) held at wallet address [BORROWER_WALLET], together
with all proceeds thereof. Cryptographic verification of secured party
control under UCC SS 12-105(a)(2) recorded at registry contract
${CONTRACT_ADDRESS} on Polygon PoS (chainId 137),
commitment hash [YOUR_HASH], filing reference [YOUR_FILING_ID].
Metadata at [YOUR_METADATA_URL].`}
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
              <p className="text-xs text-yellow-400">
                <span className="font-bold">Legal note:</span> This is draft template language only. Not legal advice. Have a secured-transactions attorney review before use in any real transaction. Effective under New York law only as of June 3, 2026.
              </p>
            </div>
            <a href={NY_DOS_URL} target="_blank" rel="noopener noreferrer"
              className="inline-block bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              NY DOS UCC Filing Portal
            </a>
          </div>

          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">7</div>
              <div>
                <h3 className="font-bold text-white">Publish Your Metadata and Verify</h3>
                <p className="text-xs text-gray-400">Make inputs publicly available so anyone can verify</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 mb-4">
              Create a JSON metadata file with your filing details and publish it so verifiers can find the salt needed to recompute the hash.
            </p>
            <div className="bg-gray-800 rounded-lg p-4 font-mono text-xs text-green-400 mb-4 leading-relaxed">
              {`{
  "ucc_chain_version": "v1",
  "filing_id": "YOUR-FILING-ID",
  "wallet_address": "0x...",
  "salt": "your-64-char-salt",
  "commitment_hash": "0x...",
  "registry_contract": "${CONTRACT_ADDRESS}",
  "attested_block": 86042088,
  "attested_date": "April 26, 2026",
  "secured_party_name": "Your Entity Name",
  "filing_state": 1,
  "filing_state_name": "New York"
}`}
            </div>
            <ol className="space-y-2 mb-4">
              {[
                "Create a file named [your-filing-id].json with the schema above",
                "Publish it to a public GitHub repository under a /metadata folder",
                "The raw GitHub URL becomes your metadata URL - include it in your UCC-1 collateral description",
                "Go to verify.ucc-chain.org and enter your three inputs to confirm Active status",
                "Click Download Proof JSON - save this court-ready verification artifact with your deal records",
              ].map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-300">
                  <span className="text-green-400 font-bold flex-shrink-0">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
            <div className="flex gap-3">
              <a href={GITHUB_METADATA} target="_blank" rel="noopener noreferrer"
                className="inline-block bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                View Example Metadata Files
              </a>
              <a href="/" className="inline-block bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                Go Verify Now
              </a>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="font-bold text-white mb-4">Quick Answers</h3>
            <div className="space-y-4">
              {[
                { q: "Do I need a crypto wallet to verify?", a: "No. Verification is completely free and requires no wallet, no account, and no software. Just a browser." },
                { q: "Do I file the UCC-1 before or after attesting?", a: "Either order works. Option A (recommended): choose your own reference ID, attest first, then file the UCC-1 referencing that ID and hash. Option B: file first, get the official filing number, then attest using that number, then file a UCC-3 amendment adding the hash to the collateral description." },
                { q: "What does Attestation Active mean legally?", a: "It means the commitment hash is recorded on Polygon Mainnet, is not revoked, and the named secured party wallet attested it at the recorded block. Under UCC Article 12 this supports the identifiability prong of the Section 12-105 control test." },
                { q: "What do I do if the attestation shows Revoked?", a: "The secured party revoked this attestation. This could mean the wallet was compromised, the loan was terminated, or the filing was corrected. Look for a newer attestation on the same filing." },
                { q: "How much does it cost to attest?", a: "Approximately $0.001 to $0.003 in Polygon gas fees. Less than a fraction of a cent. Verification is always free." },
                { q: "What states does this work in?", a: "Currently New York only for the June 3, 2026 launch. Multi-state expansion planned for Phase 4 (2028+) pending state-specific legal review per jurisdiction." },
                { q: "Is this legal advice?", a: "No. UCC-Chain is a verification tool. Nothing here is legal advice. Consult a secured-transactions attorney before use in any real transaction." },
              ].map((item) => (
                <div key={item.q} className="border-b border-gray-800 pb-4 last:border-0 last:pb-0">
                  <p className="text-sm font-semibold text-white mb-1">{item.q}</p>
                  <p className="text-sm text-gray-400">{item.a}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Services section */}
        <div id="services" className="mt-12 pt-8 border-t border-gray-800 scroll-mt-20">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Professional Verification Services</h2>
            <p className="text-gray-400 text-sm max-w-2xl mx-auto">
              HeirSure LLC offers automated verification and monitoring services for lenders, trustees, and fiduciaries. We provide technical verification only — not legal advice. Consult your attorney for collateral description language and UCC filing strategy.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            {[
              {
                name: "Verification Report",
                price: "$49",
                desc: "We verify one attestation and deliver a court-ready proof JSON plus written summary within 48 hours.",
                features: ["Attestation verified on Polygon Mainnet", "Court-ready proof JSON artifact", "Written verification summary", "48-hour turnaround"],
                color: "border-teal-500/40",
                labelColor: "text-teal-400",
              },
              {
                name: "Monthly Monitoring",
                price: "$19/mo",
                desc: "Ongoing automated monitoring of your attestations with instant alerts on any status changes.",
                features: ["Monitor all your attestations 24/7", "Instant email alert on revocation", "Monthly status reports", "Priority email support"],
                color: "border-purple-500/40",
                labelColor: "text-purple-400",
              },
            ].map((service) => (
              <div key={service.name} className={`bg-gray-900 border ${service.color} rounded-xl p-6`}>
                <p className={`${service.labelColor} font-bold text-xl mb-1`}>{service.name}</p>
                <p className="text-4xl font-bold text-white mb-3">{service.price}</p>
                <p className="text-sm text-gray-400 mb-4 leading-relaxed">{service.desc}</p>
                <ul className="space-y-2 mb-5">
                  {service.features.map((f) => (
                    <li key={f} className="text-xs text-gray-300 flex items-start gap-2">
                      <span className={`${service.labelColor} flex-shrink-0 mt-0.5`}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {!formSubmitted ? (
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="font-bold text-white mb-2">Request Service</h3>
              <p className="text-xs text-gray-400 mb-4">We provide technical verification services only. For UCC filing strategy and collateral description language, consult a secured-transactions attorney.</p>
              <form action={FORMSPREE_ENDPOINT} method="POST" onSubmit={() => setFormSubmitted(true)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Your Name *</label>
                    <input type="text" name="name" required
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Entity / Organization</label>
                    <input type="text" name="entity"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Email *</label>
                    <input type="email" name="email" required
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone</label>
                    <input type="tel" name="phone"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Service Interested In *</label>
                  <select name="service" required
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors">
                    <option value="">Select a service...</option>
                    <option value="Verification Report - $49">Verification Report - $49</option>
                    <option value="Monthly Monitoring - $19/mo">Monthly Monitoring - $19/mo</option>
                    <option value="Question / Not Sure">Question / Not Sure</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Filing ID, Wallet Address, Salt (if applicable)</label>
                  <textarea name="attestation_details" rows={3}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors font-mono"
                    placeholder="Filing ID: YOUR-FILING-ID&#10;Wallet: 0x...&#10;Salt: abc123..."></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Additional Notes</label>
                  <textarea name="message" rows={3}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Any questions or additional context..."></textarea>
                </div>
                <button type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors text-sm">
                  Submit Request
                </button>
              </form>
              <p className="text-xs text-gray-500 mt-3 text-center">
                We typically respond within 24 hours. Not legal advice. Technical verification services only.
              </p>
            </div>
          ) : (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
              <p className="text-green-400 font-bold text-lg mb-2">Thank you for your request!</p>
              <p className="text-gray-300 text-sm">
                We have received your enquiry and will respond within 24 hours at the email you provided.
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <a href="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors mb-4">
            Go to Verifier
          </a>
          <p className="text-xs text-gray-600 mt-4">UCC-Chain LLC - HeirSure LLC - New York - April 2026</p>
          <p className="text-xs text-gray-600">Not legal advice. Technical verification services only. Consult a secured-transactions attorney before use.</p>
        </div>

      </div>
    </main>
  );
}
