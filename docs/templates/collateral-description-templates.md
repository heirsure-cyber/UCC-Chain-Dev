# UCC-Chain Collateral Description Templates
## Version 1.0 | April 2026 | UCC-Chain LLC / HeirSure LLC

---

> **DISCLAIMER:** These templates are draft legal language generated for
> informational purposes only. They are NOT legal advice. No attorney-client
> relationship is created by use of these templates. Before using any of these
> templates in a real UCC-1 financing statement or security agreement, you MUST
> consult a secured-transactions attorney licensed in the relevant jurisdiction.
> UCC-Chain LLC and HeirSure LLC make no warranty as to the legal sufficiency
> of these templates in any jurisdiction or transaction. These templates are
> published in advance of any judicial interpretation of UCC Article 12 in New
> York (effective June 3, 2026) and no court has yet ruled on the legal
> sufficiency of blockchain-reference collateral descriptions under SS 9-108.

---

## Legal Basis

These templates are designed to satisfy three independent bases for
collateral-description sufficiency under the UCC:

1. **SS 9-108(b)(1)** - Specific listing: the NFT contract address and token ID
   are globally unique identifiers that specifically list the collateral.

2. **SS 9-108(b)(6)** - Objectively determinable: an EVM contract address and
   token ID can be independently verified by any party with internet access,
   satisfying the "objectively determinable" standard from In re I80 Equipment,
   LLC, 938 F.3d 866 (7th Cir. 2019).

3. **SS 12-105(a)(2)** - Identifiability by cryptographic key: the on-chain
   commitment hash binds the named secured party to a specific cryptographic
   key, directly satisfying the identifiability prong of the Article 12 control
   test.

---

## Template A: Simple Hash Reference
### Use Case: Basic crypto-collateral pledge (V1 MVP)
### Satisfies: SS 9-108(b)(1), SS 9-108(b)(6), SS 12-105(a)(2)

---

### FOR USE IN SECURITY AGREEMENT (SS 9-108 applies - no supergeneric):

All rights, title, and interest of Debtor in and to the controllable
electronic record(s) held at wallet address [WALLET_ADDRESS], together
with all proceeds, products, and replacements thereof.

The secured party has provided cryptographic verification of control
under UCC SS 12-105(a)(2) by on-chain attestation recorded at:
  - Registry Contract: [CONTRACT_ADDRESS] on Polygon PoS (chainId 137)
  - Commitment Hash:   [COMMITMENT_HASH]
  - Attested Block:    [BLOCK_NUMBER]
  - Attested Date:     [DATE]
  - Metadata URL:      [METADATA_URL]

---

### FOR USE IN UCC-1 FINANCING STATEMENT (SS 9-504 applies - supergeneric OK):

All assets of Debtor, including without limitation all controllable
electronic records as defined under UCC Article 12, held at or
associated with wallet address [WALLET_ADDRESS]. Cryptographic
verification of secured party control available at registry contract
[CONTRACT_ADDRESS] on Polygon PoS mainnet (chainId 137), commitment
hash [COMMITMENT_HASH]. Metadata published at [METADATA_URL].

---

## Template B: With Security Agreement Hash
### Use Case: When security agreement is stored on Arweave/IPFS
### Satisfies: SS 9-108(b)(1), SS 9-108(b)(6), SS 12-105(a)(2)

---

### FOR USE IN SECURITY AGREEMENT:

All rights, title, and interest of Debtor in and to the controllable
electronic record(s) held at wallet address [WALLET_ADDRESS], including
without limitation any cryptocurrency, non-fungible tokens, staking
positions, on-chain receivables, and tokenized assets held at or
controlled by that address, together with all proceeds, products,
rents, and replacements thereof.

Cryptographic verification of secured party control under UCC
SS 12-105(a)(2):
  - Registry Contract:      [CONTRACT_ADDRESS] (Polygon PoS, chainId 137)
  - Commitment Hash:        [COMMITMENT_HASH]
  - Attested Block:         [BLOCK_NUMBER]
  - Attested Timestamp:     [UNIX_TIMESTAMP] ([HUMAN_DATE])
  - Security Agreement Hash: SHA-256: [SECURITY_AGREEMENT_SHA256]
  - Security Agreement URL:  [ARWEAVE_OR_IPFS_URL]
  - Metadata URL:            [METADATA_URL]

The secured party may verify control at: https://verify.ucc-chain.org

---

### FOR USE IN UCC-1 FINANCING STATEMENT:

All assets of Debtor, including without limitation all controllable
electronic records (as defined in UCC SS 12-102(a)(1)), controllable
accounts, and controllable payment intangibles held at or associated
with wallet address [WALLET_ADDRESS]. On-chain attestation of secured
party control recorded at [CONTRACT_ADDRESS] on Polygon PoS mainnet
(chainId 137), commitment hash [COMMITMENT_HASH]. Security agreement
(SHA-256: [SECURITY_AGREEMENT_SHA256]) and full metadata published at
[METADATA_URL]. Free public verification at https://verify.ucc-chain.org

---

## Template C: V2 NFT Reference (Forward-Looking)
### Use Case: When collateral is represented as a soulbound NFT (V2)
### Satisfies: SS 9-108(b)(1), SS 9-108(b)(6), SS 12-105(a)(2)
### NOTE: Requires V2 NFT contract deployment - not yet available in V1

---

### FOR USE IN SECURITY AGREEMENT:

All rights, title, and interest in the controllable electronic record
evidenced by the non-fungible token minted at:
  - NFT Contract Address: [NFT_CONTRACT_ADDRESS]
  - Token ID:             [TOKEN_ID]
  - Network:              Polygon PoS (chainId 137)

together with all proceeds thereof. The secured interest is further
evidenced by SHA-256 commitment hash [COMMITMENT_HASH] recorded at
UCCChainRegistry contract [CONTRACT_ADDRESS] on Polygon PoS mainnet.

This description satisfies UCC SS 9-108 under three independent bases:
(i) SS 9-108(b)(1) specific listing by NFT contract address and token ID;
(ii) SS 9-108(b)(6) objectively determinable identification, as the
(contract, tokenId) pair is globally unique and publicly verifiable; and
(iii) SS 12-105(a)(2) identifiability by cryptographic key, as the
on-chain commitment binds the named secured party to the wallet address
holding the NFT.

---

### FOR USE IN UCC-1 FINANCING STATEMENT:

All rights in the controllable electronic record evidenced by NFT at
contract [NFT_CONTRACT_ADDRESS], token ID [TOKEN_ID], on Polygon PoS
(chainId 137), together with all proceeds thereof. SHA-256 commitment
hash [COMMITMENT_HASH] recorded at UCCChainRegistry [CONTRACT_ADDRESS].
Full metadata at [METADATA_URL]. Verify at https://verify.ucc-chain.org

---

## Variable Reference Guide

Replace all bracketed variables before use:

| Variable                    | Example Value                              | Where to Find        |
|-----------------------------|--------------------------------------------|----------------------|
| [WALLET_ADDRESS]            | 0x5DC1107121371b8bf487cDAdF3Bc42eAfA6C7778 | MetaMask             |
| [CONTRACT_ADDRESS]          | 0xC17def4DF914b016D60500Cb9C459c3eAf6469Ff | polygonscan.com      |
| [COMMITMENT_HASH]           | 0x3a9f...8bc2 (full 66 chars)              | verify.ucc-chain.org |
| [BLOCK_NUMBER]              | 85960719                                   | polygonscan.com      |
| [DATE]                      | April 25, 2026                             | From block timestamp |
| [UNIX_TIMESTAMP]            | 1745625600                                 | From block timestamp |
| [HUMAN_DATE]                | April 25, 2026 at 3:42 PM                  | From block timestamp |
| [METADATA_URL]              | https://github.com/heirsure-cyber/...      | GitHub /metadata/    |
| [SECURITY_AGREEMENT_SHA256] | sha256:abc123...                           | Compute before upload|
| [ARWEAVE_OR_IPFS_URL]       | https://arweave.net/abc123                 | After upload         |
| [NFT_CONTRACT_ADDRESS]      | 0x... (V2 only)                            | V2 deployment        |
| [TOKEN_ID]                  | 1 (V2 only)                                | V2 minting           |

---

## Filing Checklist

Before filing any UCC-1 using these templates:

- [ ] Security agreement signed and dated by debtor
- [ ] Wallet address verified (EIP-55 checksum format)
- [ ] Commitment hash computed using verify.ucc-chain.org Generate Hash tab
- [ ] Salt saved securely (required for future verification)
- [ ] Commitment hash attested on Polygon Mainnet via attest() function
- [ ] Block number and timestamp recorded from PolygonScan
- [ ] Metadata JSON created and published (GitHub or Arweave)
- [ ] UCC-1 filed with Secretary of State (NY: dos.ny.gov)
- [ ] Collateral description references commitment hash and registry contract
- [ ] Secured-transactions attorney reviewed before execution (recommended)

---

## Statutory Citations

- UCC SS 9-108: Sufficiency of description
- UCC SS 9-108(b)(1): Specific listing
- UCC SS 9-108(b)(6): Any other method, if objectively determinable
- UCC SS 9-504(2): Supergeneric description permitted in financing statements
- UCC SS 12-102(a)(1): Definition of controllable electronic record
- UCC SS 12-105(a)(2): Identifiability prong of control test
- UCC SS 9-326A: Control-perfected interest priority over filing
- In re I80 Equipment LLC, 938 F.3d 866 (7th Cir. 2019): Objective
  determinability satisfies SS 9-108

*Effective in New York: June 3, 2026 (NY Assembly Bill A.3307-A / Senate Bill
S.1840-A, signed December 5, 2025, effective 180 days after signing)*

---

*UCC-Chain LLC - HeirSure LLC - New York - April 2026*
*Not legal advice. Consult a secured-transactions attorney before use.*
*verify.ucc-chain.org | github.com/heirsure-cyber/UCC-Chain-Dev*
