# UCC-Chain

**A Cryptographic Bridge Between UCC-1 Filings and On-Chain Control**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Network: Polygon Mainnet](https://img.shields.io/badge/Network-Polygon%20Mainnet-8247E5)](https://polygonscan.com)
[![Status: Pre-MVP](https://img.shields.io/badge/Status-Pre--MVP-orange)](https://verify.ucc-chain.org)

---

## What is UCC-Chain?

UCC-Chain is an open verification protocol that cryptographically links a
filed UCC-1 financing statement to a specific cryptocurrency wallet address.

Any lender, lawyer, court, or bankruptcy trustee can verify digital asset
collateral control in seconds — at zero cost — without relying on any
private vendor, subscription service, or account.

**Live at:** https://verify.ucc-chain.org

---

## Why It Exists

Commercial credit verification relies on a 60-year-old paper-based workflow.
Three forces are breaking that model:

1. **Asset digitization** - Growing collateral lives natively on blockchains
   where "possession" has no physical analog
2. **Velocity** - Crypto-collateralized lending happens in minutes, not weeks
3. **Legal convergence** - UCC Article 12 (effective New York June 3, 2026)
   makes cryptographic control legally equivalent to possession

Under UCC Section 9-326A, a control-perfected security interest in a
controllable electronic record (CER) defeats an earlier-filed UCC-1.
UCC-Chain provides the verification infrastructure to prove that control.

---

## How It Works

### The Commitment Formula
H = SHA256("UCC-CHAIN/v1" + "|" + filing_id + "|" + wallet + "|" + salt)
This hash cryptographically binds three things together:
- The UCC-1 filing identifier (public record)
- The secured party wallet address (on-chain identity)
- A random salt (prevents brute-force guessing)

### The Flow

Secured party computes H from filing_id + wallet + salt
Calls attest(H, stateCode) on UCCChainRegistry (Polygon Mainnet)
Files UCC-1 with Secretary of State referencing H and registry contract
Publishes off-chain metadata JSON with filing_id, wallet, salt
Anyone verifies: recomputes H, queries contract, gets result in seconds

### The Legal Hook

UCC Section 12-105(a)(2) requires that a secured party be able to
"readily identify itself" as having control powers "by name, identifying
number, cryptographic key, office, or account number."

A registered UCC-1 naming the secured party + an on-chain commitment
binding that legal name to a wallet address = the cleanest available
way to satisfy the identifiability prong under Article 12.

---

## Deployed Contract

| Field | Value |
|-------|-------|
| Contract Name | UCCChainRegistry |
| Address | 0xC17def4DF914b016D60500Cb9C459c3eAf6469Ff |
| Network | Polygon Mainnet (Chain ID 137) |
| Verified | Yes - PolygonScan source verified |
| Compiler | Solidity 0.8.33 |
| License | MIT |

**PolygonScan:**
https://polygonscan.com/address/0xC17def4DF914b016D60500Cb9C459c3eAf6469Ff

---

## Contract Functions

```solidity
// Record a UCC-1 to wallet commitment on-chain
function attest(bytes32 commitmentHash, uint8 filingState) external;

// Look up an attestation - FREE, no gas when called off-chain
function verify(bytes32 commitmentHash) external view returns (Attestation memory);

// Mark an attestation as revoked (only original attester)
function revoke(bytes32 commitmentHash) external;

// Returns true if attested AND not revoked
function isActive(bytes32 commitmentHash) external view returns (bool);

// Returns "UCC-CHAIN/v1"
function version() external pure returns (string memory);
```

---

## Security Design

- No admin key
- No upgradeable proxy
- No owner
- Append-only state (records never deleted, only flagged revoked)
- Permissionless attest (any wallet can use the protocol)
- Only original attester can revoke their own attestation
- 23/23 tests passing including 512 fuzz test runs

---

## Repository Structure

ucc-chain-protocol/
├── src/
│   └── UCCChainRegistry.sol      # Core smart contract
├── test/
│   └── UCCChainRegistry.t.sol    # 23-test Foundry suite
├── script/
│   └── Deploy.s.sol              # Deployment script
├── frontend/
│   ├── app/page.tsx              # Main verifier UI
│   ├── lib/commitment.ts         # SHA-256 hash generator
│   └── lib/contract.ts           # Polygon RPC interface
├── docs/
│   └── templates/
│       ├── collateral-description-templates.md
│       └── metadata-schema.md
├── metadata/                     # Pilot filing metadata JSONs
├── broadcast/                    # Deployment records
└── foundry.toml

---

## Quick Start: Verify an Attestation

**Option 1: Web interface (no code)**
Go to https://verify.ucc-chain.org
Enter filing ID, wallet address, and salt.
Result in seconds.

**Option 2: Direct contract query**
```javascript
const { ethers } = require("ethers");

const provider = new ethers.JsonRpcProvider("https://polygon-rpc.com");
const contract = new ethers.Contract(
  "0xC17def4DF914b016D60500Cb9C459c3eAf6469Ff",
  ["function verify(bytes32) view returns (tuple(address,uint64,uint64,uint8,bool))"],
  provider
);

const preimage = `UCC-CHAIN/v1|${filingId}|${wallet}|${salt}`;
const hash = ethers.sha256(ethers.toUtf8Bytes(preimage));
const result = await contract.verify(hash);
console.log("Found:", result.attester !== ethers.ZeroAddress);
console.log("Active:", !result.revoked);
```

---

## Quick Start: Attest a Filing

```javascript
const { ethers } = require("ethers");

const signer = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(
  "0xC17def4DF914b016D60500Cb9C459c3eAf6469Ff",
  ["function attest(bytes32,uint8) external"],
  signer
);

const salt = ethers.hexlify(ethers.randomBytes(32));
const preimage = `UCC-CHAIN/v1|${filingId}|${wallet}|${salt}`;
const hash = ethers.sha256(ethers.toUtf8Bytes(preimage));

// 1 = New York, 2 = Delaware, 3 = California
const tx = await contract.attest(hash, 1);
await tx.wait();
console.log("Attested:", tx.hash);
```

---

## Documents

- [Collateral Description Templates](docs/templates/collateral-description-templates.md)
- [Metadata Schema](docs/templates/metadata-schema.md)
- [Threat Model](docs/THREAT-MODEL.md)
- [FAQ](docs/FAQ.md)
- [Integration Guide](docs/INTEGRATION.md)

---

## Legal Status

UCC-Chain is a pre-MVP protocol operating in a pre-case-law legal
environment. Key facts:

- No US court has yet applied Article 12 control test to an NFT-based
  secured interest
- No US court has yet interpreted Section 9-108 against a blockchain
  collateral description
- New York UCC Article 12 takes effect June 3, 2026
- Litigation testing these premises is likely years away

**Use UCC-Chain alongside traditional filing best practices, not as a
replacement for them.**

This is not legal advice. Consult a secured-transactions attorney
licensed in the relevant jurisdiction before use in any real transaction.

---

## Open Protocol Commitments

UCC-Chain LLC commits to:

1. Publishing all smart contract source code under MIT license
2. Never introducing a token, fee, or permissioned access layer
3. Operating the registry without admin or upgrade keys
4. Maintaining free public verification forever

---

## About

**UCC-Chain LLC** is a wholly-owned subsidiary of **HeirSure LLC**,
a New York limited liability company operating in the crypto-inheritance
infrastructure sector.

**Founder:** Jonathan Hood
**Partner:** GenWealth Services
**Effective Date:** June 3, 2026 (NY UCC Article 12)

---

*Not legal advice. Pre-MVP. Pre-case-law.*
*verify.ucc-chain.org | April 2026*
