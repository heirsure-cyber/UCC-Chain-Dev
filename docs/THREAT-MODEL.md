# UCC-Chain Threat Model
## Version 1.0 | April 2026 | UCC-Chain LLC / HeirSure LLC

Honest treatment of limitations is essential. UCC-Chain's value depends
on practitioners understanding precisely what it does and does not
guarantee. This document is published proactively — not defensively.

---

## What UCC-Chain Guarantees

1. **Tamper-evident timestamp** - The commitment hash was published to
   Polygon Mainnet at a specific block, which is independently verifiable
   by anyone with internet access.

2. **Binding** - The hash cryptographically binds a specific filing ID,
   wallet address, and salt together. Any change to any input produces
   a completely different hash.

3. **Immutability** - The registry contract has no admin key, no upgrade
   proxy, and no owner. Once attested, a record cannot be altered or
   deleted by anyone including UCC-Chain LLC.

4. **Free public verification** - Any party can verify any attestation
   at zero cost without an account, subscription, or vendor relationship.

---

## What UCC-Chain Does NOT Guarantee

1. **Legal control** - UCC-Chain provides evidentiary infrastructure for
   control. It does not create control. Control is a function of the
   underlying asset protocol (who holds the private key).

2. **Legal validity** - No court has yet ruled on the legal sufficiency
   of blockchain-reference collateral descriptions or NFT-based control
   under UCC Article 12.

3. **Identity verification** - The protocol binds a wallet address to a
   named secured party on a UCC-1. It does not independently verify that
   the named party actually controls the wallet.

4. **Priority** - UCC-Chain helps prove control but does not guarantee
   priority. Priority depends on correct filing, correct collateral
   description, and applicable law.

---

## Threat Register

### T1: Wallet Private Key Compromise
**Severity:** HIGH
**Description:** If the secured party wallet private key is stolen,
the attacker can transfer the collateral out of the wallet. Under
UCC Section 12-104(e), a good-faith transferee may take free of the
secured party claim.

**What UCC-Chain does:** The revoke() function lets the secured party
mark the attestation as revoked post-compromise. Combined with a timely
UCC-3 amendment re-perfecting against a new wallet, priority is
preserved going forward.

**What UCC-Chain does NOT do:** Cannot prevent the transfer. Cannot
retroactively cure a good-faith purchaser's intervening rights.

**Mitigations:**
- Use multi-signature wallets (Gnosis Safe or equivalent)
- Use MPC custody (Fireblocks, Anchorage, BitGo)
- Use hardware security modules (Ledger, Trezor)
- Use SS 12-105(e) acknowledging custodian arrangements
- Monitor wallet for unauthorized transactions

---

### T2: Wallet Private Key Loss
**Severity:** HIGH
**Description:** If the secured party loses access to its private key,
the wallet is unrecoverable. The security interest survives as a legal
matter but the control element may be compromised - the secured party
may no longer satisfy SS 12-105(a)(1)(B) power to transfer.

**What UCC-Chain does:** Nothing - this is a custody-layer problem.

**Mitigations:**
- Shamir Secret Sharing backups
- Multi-sig with geographically distributed signers
- Institutional custody under SS 12-105(e)
- Dead-man switch protocols (Safe modules)
- Predefined successor-signer arrangements (critical for inheritance)

---

### T3: No Case Law Yet
**Severity:** HIGH
**Description:** No US court has yet applied Article 12 control test
to an NFT-based secured interest, interpreted SS 9-108 against a
blockchain collateral description, or ruled on the evidentiary weight
of a Polygon-anchored SHA-256 commitment in a priority dispute.

**What UCC-Chain does:** Publishes this disclaimer prominently on all
materials. Designed to align precisely with statutory text to maximise
the chance of judicial acceptance when cases arise.

**Mitigations:**
- Use alongside traditional filing best practices
- Consult secured-transactions attorney before use
- File UCC-1 with AND without blockchain reference
- Monitor case law developments post June 3, 2026

---

### T4: Polygon Finality and Reorg Risk
**Severity:** MEDIUM
**Description:** Polygon PoS has experienced documented reorg incidents.
Prior to the 2024 Aalborg upgrade, reorgs of up to 32 blocks were
possible at the Bor execution layer. A September 2025 finality-lag
incident required an emergency hard fork.

**What UCC-Chain does:** Heimdall v2 milestone mechanism provides
deterministic finality within seconds at consensus layer. Merkle-root
checkpoints committed to Ethereum L1 approximately every 30 minutes.

**Mitigations:**
- For low-stakes use: wait 256 Bor blocks (~10 minutes) before treating
  attestation as final
- For high-stakes use: wait for next Ethereum L1 checkpoint (~30 min)
- For maximum certainty: dual-anchor to Bitcoin via OpenTimestamps
  (opentimestamps.org) - free, no account required

---

### T5: Chain Deprecation (5-10 Year Risk)
**Severity:** MEDIUM
**Description:** Polygon validator economics may change. RPC providers
may deprecate the chain. The registry state would persist in archival
nodes but casual verification would become harder.

**What UCC-Chain does:** The SHA-256 commitment itself is the durable
artifact. The chain is a notarising witness, not the source of truth.

**Mitigations:**
- Periodic bulk export of registry state to Ethereum L1 and Arweave
- Dual-anchor all attestations to Bitcoin via OpenTimestamps
- Open publication of registry source and state export format
- Any party can reconstruct verification from archival data

---

### T6: Smart Contract Vulnerability
**Severity:** MEDIUM
**Description:** A bug in UCCChainRegistry could corrupt the registry
or enable spoofed attestations.

**What UCC-Chain does:** Contract is intentionally minimal (~150 lines).
No proxy pattern, no admin key. Self-audit completed. 23/23 tests
passing including 512 fuzz runs.

**Mitigations:**
- Formal audit by independent firm (planned for Phase 2 with funding)
- Bug bounty program (planned for Phase 2)
- If critical bug discovered: deploy new registry, re-attest
- Immutability means no attacker can silently patch the contract

---

### T7: Identity and KYC Gap
**Severity:** LOW-MEDIUM
**Description:** The protocol binds a wallet address to a named secured
party on a UCC-1. The UCC system relies on self-reported names. A bad
actor could file a UCC-1 under a false name and attest a binding.

**What UCC-Chain does:** This is a limitation of the UCC itself, not
UCC-Chain. The protocol inherits it.

**Mitigations:**
- Integration with KYB providers planned for Phase 2
  (Persona, Alloy, Middesk)
- In regulated contexts (bank-originated credit) institutions already
  maintain identity documentation
- Courts and bankruptcy trustees can pierce address-to-identity binding
  through discovery as they do with named secured parties today

---

### T8: NFT Transferability Risk (V2 Only)
**Severity:** LOW
**Description:** If V2 uses a freely transferable ERC-721, an accidental
or malicious transfer could appear to assign the secured interest.

**What UCC-Chain does:** V2 design specifies ERC-5192 soulbound tokens
or equivalent non-transferable extension with purpose-built assign()
function that requires a corresponding UCC-3 hash.

**Mitigations:**
- Use ERC-5192 soulbound standard
- Require UCC-3 hash in assign() function
- Subordinate token transferability to legal assignment process

---

### T9: Front-Running and MEV
**Severity:** NONE
**Description:** A malicious actor observing a pending attest()
transaction could submit a competing transaction.

**Analysis:** Because commitments are hashed, content is opaque to
observers. Because attest() is append-only with no economic reward
for front-running, MEV surface is essentially nil. The protocol is
not an auction. This threat is not material.

---

### T10: SHA-256 Cryptographic Assumptions
**Severity:** VERY LOW
**Description:** SHA-256 collision resistance is foundational to the
protocol. A practical collision would undermine the binding.

**Analysis:** SHA-256 collision resistance remains unbroken after 20+
years of adversarial scrutiny. NIST continues to recommend SHA-256 for
all federal applications. Quantum attacks require Grover-speedup of
infeasible scale for preimage resistance.

**Mitigations:**
- If practical collision ever found: migrate to SHA-3 or BLAKE3 by
  deploying new registry. Existing proofs remain valid until break
  with ample migration lead time.

---

## Summary Risk Matrix

| Threat | Severity | Mitigated by Protocol | Mitigated by Custody | No Mitigation |
|--------|----------|----------------------|---------------------|---------------|
| T1: Key compromise | HIGH | Partial (revoke()) | Yes (multi-sig) | Transfer to BFP |
| T2: Key loss | HIGH | No | Yes (SSS, MPC) | - |
| T3: No case law | HIGH | Disclosure | - | Legal uncertainty |
| T4: Polygon reorg | MEDIUM | Yes (checkpoints) | - | - |
| T5: Chain deprecation | MEDIUM | Yes (dual-anchor) | - | - |
| T6: Contract bug | MEDIUM | Yes (minimal code) | - | Pre-audit |
| T7: Identity gap | LOW-MED | Disclosure | - | UCC limitation |
| T8: NFT transfer (V2) | LOW | Yes (ERC-5192) | - | - |
| T9: Front-running | NONE | N/A | - | - |
| T10: SHA-256 break | VERY LOW | Migration path | - | - |

---

## Disclosure Policy

UCC-Chain LLC commits to:

1. Publishing this threat model publicly before any production deployment
2. Updating this document when new threats are identified
3. Disclosing any discovered vulnerabilities within 48 hours
4. Maintaining a public bug bounty program (Phase 2)
5. Never misrepresenting the protocol's legal status or limitations

---

*UCC-Chain LLC - HeirSure LLC - New York - April 2026*
*Not legal advice. Consult a secured-transactions attorney before use.*
*verify.ucc-chain.org | github.com/heirsure-cyber/UCC-Chain-Dev*
