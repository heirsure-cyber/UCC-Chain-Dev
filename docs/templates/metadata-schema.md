# UCC-Chain Off-Chain Metadata Schema
## Version 1.0 | April 2026 | UCC-Chain LLC / HeirSure LLC

---

## Purpose

Every UCC-Chain attestation requires a corresponding off-chain metadata
file. This file contains the inputs needed to recompute the commitment
hash and verify the attestation. Without the metadata, a verifier cannot
reconstruct the hash from the public UCC-1 filing alone.

The metadata file is published to a permanent, publicly accessible URL
which is referenced in the UCC-1 collateral description. For the V1 MVP
pilot filings, metadata is stored in the GitHub repository. For
production use, Arweave is recommended for permanent immutable storage.

---

## JSON Schema (V1)

```json
{
  "ucc_chain_version": "v1",
  "filing_id": "NY-202607-123456789",
  "wallet_address": "0x5DC1107121371b8bf487cDAdF3Bc42eAfA6C7778",
  "salt": "a7f3d9e2b1c4f8a6d5e3b2c1f9a8d7e6b5c4a3f2e1d9c8b7a6f5e4d3c2b1a0f9",
  "commitment_hash": "0x3a9fc6fa0b91fae6a6f699cbd0be13b62ac538613ea15b5bf97b7fc515376e3a",
  "registry_contract": "0xC17def4DF914b016D60500Cb9C459c3eAf6469Ff",
  "registry_chain": "polygon-mainnet",
  "registry_chain_id": 137,
  "attested_block": 85960719,
  "attested_timestamp": 1745625600,
  "attested_date": "April 25, 2026 at 3:42 PM UTC",
  "debtor_name": "Acme Corp LLC",
  "debtor_state_of_organization": "New York",
  "secured_party_name": "HeirSure LLC",
  "filing_state": 1,
  "filing_state_name": "New York",
  "filing_office": "New York Department of State",
  "security_agreement_date": "April 25, 2026",
  "security_agreement_hash": "",
  "security_agreement_url": "",
  "collateral_description": "All controllable electronic records held at wallet address 0x...",
  "verifier_url": "https://verify.ucc-chain.org",
  "polygonscan_url": "https://polygonscan.com/address/0xC17def4DF914b016D60500Cb9C459c3eAf6469Ff",
  "metadata_version": "1.0",
  "created_at": "2026-04-25T15:42:00Z",
  "notes": ""
}
```

---

## Field Reference

### Required Fields (must be present in every metadata file)

| Field | Type | Description |
|-------|------|-------------|
| ucc_chain_version | string | Always "v1" for V1 protocol |
| filing_id | string | UCC-1 filing identifier from Secretary of State |
| wallet_address | string | Secured party wallet (EIP-55 checksum format) |
| salt | string | 64-char hex salt used in hash computation |
| commitment_hash | string | 66-char SHA-256 commitment hash (0x-prefixed) |
| registry_contract | string | UCCChainRegistry address on Polygon |
| registry_chain_id | number | Always 137 for Polygon Mainnet |
| attested_block | number | Polygon block number of attestation |
| attested_timestamp | number | Unix timestamp (seconds) of attestation |
| debtor_name | string | Legal name of debtor as filed on UCC-1 |
| secured_party_name | string | Legal name of secured party as filed on UCC-1 |
| filing_state | number | State code (1=NY, 2=DE, 3=CA) |

### Recommended Fields

| Field | Type | Description |
|-------|------|-------------|
| attested_date | string | Human-readable attestation date and time |
| filing_state_name | string | Full state name for readability |
| filing_office | string | Name of filing office (e.g. NY Department of State) |
| security_agreement_date | string | Date security agreement was signed |
| collateral_description | string | Full collateral description from security agreement |
| verifier_url | string | Always https://verify.ucc-chain.org |
| polygonscan_url | string | Direct PolygonScan link to registry contract |
| created_at | string | ISO 8601 timestamp of metadata creation |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| security_agreement_hash | string | SHA-256 hash of security agreement PDF |
| security_agreement_url | string | Arweave/IPFS URL of security agreement |
| debtor_state_of_organization | string | State where debtor is organized |
| notes | string | Any additional notes for this filing |

---

## State Code Reference

| Code | State | Filing Office |
|------|-------|---------------|
| 1 | New York | NY Department of State - UCC Division |
| 2 | Delaware | Delaware Division of Corporations |
| 3 | California | CA Secretary of State |
| 4 | Florida | FL Division of Corporations |
| 5 | Texas | TX Secretary of State |
| 6 | Illinois | IL Secretary of State |
| 7 | Pennsylvania | PA Department of State |
| 8 | Colorado | CO Secretary of State |
| 9 | Washington | WA Secretary of State |
| 10 | Nevada | NV Secretary of State |

---

## How to Create a Metadata File

### Step 1: Generate the commitment hash
Go to https://verify.ucc-chain.org and click Generate Hash tab.
Enter filing ID, wallet address, and click Generate Salt.
Click Generate Commitment Hash and copy the result.
SAVE THE SALT - you cannot verify without it later.

### Step 2: Attest the hash on Polygon Mainnet
Call attest(commitmentHash, filingStateCode) on the registry contract.
Use PolygonScan write contract interface or your own script.
Record the transaction hash, block number, and timestamp.

### Step 3: File the UCC-1
File with the Secretary of State using collateral description from
docs/templates/collateral-description-templates.md.
Include the commitment hash and registry contract address.
Include the metadata URL (even if not yet published - use GitHub URL).

### Step 4: Create the metadata JSON file
Copy the template above. Fill in all required fields.
Name the file: [filing_id].json
Example: NY-202607-123456789.json

### Step 5: Publish the metadata
For pilot filings: commit to /metadata/ folder in GitHub repo.
For production: upload to Arweave for permanent storage.
The GitHub raw URL format:
https://raw.githubusercontent.com/heirsure-cyber/UCC-Chain-Dev/main/metadata/[filing_id].json

### Step 6: Verify end to end
Go to https://verify.ucc-chain.org
Enter filing ID, wallet address, and salt.
Confirm the attestation shows as Active.
Download the proof JSON for your records.

---

## Example: Pilot Filing Metadata

```json
{
  "ucc_chain_version": "v1",
  "filing_id": "NY-202606-PILOT001",
  "wallet_address": "0x5DC1107121371b8bf487cDAdF3Bc42eAfA6C7778",
  "salt": "REPLACE_WITH_GENERATED_SALT",
  "commitment_hash": "REPLACE_WITH_COMPUTED_HASH",
  "registry_contract": "0xC17def4DF914b016D60500Cb9C459c3eAf6469Ff",
  "registry_chain": "polygon-mainnet",
  "registry_chain_id": 137,
  "attested_block": 0,
  "attested_timestamp": 0,
  "attested_date": "REPLACE_WITH_DATE",
  "debtor_name": "REPLACE_WITH_DEBTOR_NAME",
  "debtor_state_of_organization": "New York",
  "secured_party_name": "HeirSure LLC",
  "filing_state": 1,
  "filing_state_name": "New York",
  "filing_office": "New York Department of State",
  "security_agreement_date": "REPLACE_WITH_DATE",
  "collateral_description": "REPLACE_WITH_COLLATERAL_DESCRIPTION",
  "verifier_url": "https://verify.ucc-chain.org",
  "polygonscan_url": "https://polygonscan.com/address/0xC17def4DF914b016D60500Cb9C459c3eAf6469Ff",
  "metadata_version": "1.0",
  "created_at": "REPLACE_WITH_ISO_TIMESTAMP",
  "notes": "Pilot filing - HeirSure LLC / GenWealth Services"
}
```

---

## Storage Options

| Option | Cost | Permanence | Best For |
|--------|------|------------|----------|
| GitHub /metadata/ | Free | Until repo deleted | Pilot filings (V1 MVP) |
| Arweave | ~$0.50/file | Permanent (200yr endowment) | Production filings |
| IPFS + Pinata | Free tier | Until unpinned | Development/testing |
| Self-hosted | Variable | Until server down | Not recommended |

Recommendation: GitHub for pilot filings, Arweave for all production use.

---

*UCC-Chain LLC - HeirSure LLC - New York - April 2026*
*Not legal advice. Consult a secured-transactions attorney before use.*
*verify.ucc-chain.org | github.com/heirsure-cyber/UCC-Chain-Dev*
