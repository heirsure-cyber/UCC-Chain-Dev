# UCC-Chain Integration Guide
## Version 1.0 | April 2026 | UCC-Chain LLC / HeirSure LLC
## For Lenders, Lawyers, and Custodians

---

> Not legal advice. Consult a secured-transactions attorney before use
> in any real transaction.

---

## Overview

This guide walks through the complete workflow for using UCC-Chain in
a real secured transaction involving digital asset collateral. It covers
everything from drafting the security agreement to verifying the
attestation is live on Polygon Mainnet.

**Time required:** 30-60 minutes for your first filing.
**Cost:** ~$0.001 in Polygon gas + UCC-1 filing fee (~$20-50).
**What you need:** A wallet with a small amount of POL, the debtor's
wallet address, and the UCC-1 filing number after filing.

---

## Prerequisites

Before starting, confirm you have:

- [ ] MetaMask or equivalent EVM wallet installed
- [ ] Small amount of POL on Polygon Mainnet (~$1 worth is more than enough)
- [ ] Debtor's wallet address (EIP-55 checksum format, starts with 0x)
- [ ] Signed security agreement with debtor
- [ ] Access to New York Secretary of State UCC filing portal
      (or equivalent for your jurisdiction)

---

## Part 1: Generate the Commitment Hash

### Step 1.1: Open the Hash Generator

Go to: https://verify.ucc-chain.org
Click the "Generate Hash" tab.

### Step 1.2: Enter the Filing ID

You have two options:

**Option A (Recommended):** File the UCC-1 first, get the filing number,
then generate the hash. This lets you include the exact filing number.

**Option B:** Use a placeholder filing ID, attest it, then include the
hash in the UCC-1. This means the UCC-1 references a hash that was
computed with a placeholder ID. This is legally weaker but technically
valid.

We recommend Option A. Example filing ID format:
NY-202607-123456789
### Step 1.3: Enter the Wallet Address

Enter the secured party wallet address in EIP-55 checksum format.
This is YOUR wallet - the lender/secured party wallet that will hold
or attest the security interest.

Example:0x5DC1107121371b8bf487cDAdF3Bc42eAfA6C7778The app automatically validates and checksums the address.

### Step 1.4: Generate the Salt

Click "Generate Salt". This creates 32 cryptographically random bytes.

**CRITICAL: Save this salt immediately.**
Copy it to a password manager, secure notes app, or print it.
The salt is required for all future verification.
If you lose it, the attestation cannot be verified.

Example salt:
a7f3d9e2b1c4f8a6d5e3b2c1f9a8d7e6b5c4a3f2e1d9c8b7a6f5e4d3c2b1a0f9

### Step 1.5: Generate the Hash

Click "Generate Commitment Hash".
Copy the resulting hash (starts with 0x, 66 characters total).

Example:
0xf616c6fa0b91fae6a6f699cbd0be13b62ac538613ea15b5bf97b7fc515376e3a

**Save this hash alongside your salt.**

---

## Part 2: Attest the Hash On-Chain

### Step 2.1: Go to PolygonScan Write Contract

Open:https://polygonscan.com/address/0xC17def4DF914b016D60500Cb9C459c3eAf6469Ff#writeContract
### Step 2.2: Connect Your Wallet

Click "Connect to Web3" on PolygonScan.
Select MetaMask.
Make sure you are on Polygon Mainnet (not testnet).

### Step 2.3: Find the attest() Function

In the Write Contract tab, find function "1. attest".

### Step 2.4: Enter the Parameters

**commitmentHash (bytes32):**
Paste your commitment hash from Step 1.5.
0xf616c6fa0b91fae6a6f699cbd0be13b62ac538613ea15b5bf97b7fc515376e3a

**filingState (uint8):**
Enter the numeric code for your filing state:
1  = New York
### Step 2.5: Submit the Transaction

Click "Write".
MetaMask opens - confirm the transaction.
Gas cost: approximately $0.001 (fraction of a cent).
Wait 15-30 seconds for confirmation.

### Step 2.6: Record the Transaction Details

From PolygonScan, record:
- Transaction hash (0x...)
- Block number
- Timestamp

You will need these for the metadata file.

---

## Part 3: File the UCC-1

### Step 3.1: Open the NY UCC Filing Portal

Go to: https://www.dos.ny.gov/corps/ucc_filing.html

Or for other states, use the appropriate Secretary of State portal.

### Step 3.2: Complete Standard UCC-1 Fields

- Debtor name: Legal name exactly as registered
- Debtor address: Principal place of business
- Secured party name: Your legal entity name
- Secured party address: Your address

### Step 3.3: Enter the Collateral Description

Use Template A or Template B from:
docs/templates/collateral-description-templates.md

**Example using Template A (Security Agreement):**
All rights, title, and interest of Debtor in and to the controllable
electronic record(s) held at wallet address
0x[DEBTOR_WALLET_ADDRESS], together with all proceeds, products,
and replacements thereof.
The secured party has provided cryptographic verification of control
under UCC SS 12-105(a)(2) by on-chain attestation recorded at:
Registry Contract: 0xC17def4DF914b016D60500Cb9C459c3eAf6469Ff
on Polygon PoS (chainId 137)
Commitment Hash:   0x[YOUR_COMMITMENT_HASH]
Attested Block:    [BLOCK_NUMBER]
Attested Date:     [DATE]
Metadata URL:      https://raw.githubusercontent.com/heirsure-cyber/
UCC-Chain-Dev/main/metadata/[FILING_ID].json
### Step 3.4: Submit and Record the Filing Number

Submit the UCC-1 and record the filing number.
Example format: NY-202607-123456789

---

## Part 4: Create and Publish Metadata

### Step 4.1: Create the Metadata JSON File

Create a new file named [filing_id].json using the schema from:
docs/templates/metadata-schema.md

Fill in all required fields using the values you have collected.

### Step 4.2: Commit to GitHub

```bash
# From your project root
cp your-metadata-file.json metadata/NY-202607-123456789.json
git add metadata/NY-202607-123456789.json
git commit -m "Add metadata for filing NY-202607-123456789"
git push origin main
```

The raw URL will be:
https://raw.githubusercontent.com/heirsure-cyber/UCC-Chain-Dev/main/
metadata/NY-202607-123456789.json
This is the URL to include in your UCC-1 collateral description.

---

## Part 5: Verify End-to-End

### Step 5.1: Open the Verifier

Go to: https://verify.ucc-chain.org
Click "Verify Attestation" tab.

### Step 5.2: Enter the Three Inputs

- UCC-1 Filing ID: NY-202607-123456789
- Wallet Address: 0x[YOUR_WALLET]
- Salt: [YOUR_SAVED_SALT]

### Step 5.3: Click Verify Attestation

The app computes the hash locally and queries Polygon Mainnet.

**Expected result:**
Attestation Active
This commitment hash is attested and active on Polygon Mainnet
Secured Party Wallet:  0x...
Filing State:          New York
Attested Block:        85960719
Attested Date:         April 25, 2026 at 3:42 PM
Status:                ACTIVE
Commitment Hash:       0xf616...3a


### Step 5.4: Download the Proof JSON

Click "Download Proof JSON".
Save this file. It is your court-ready verification artifact containing:
- Protocol version
- Commitment hash
- Full attestation record (attester, block, timestamp, state)
- Verification timestamp
- Registry contract address
- Network details

---

## Part 6: Ongoing Maintenance

### Monitoring

Check your attestation periodically at verify.ucc-chain.org to confirm:
- Status remains ACTIVE
- Wallet has not been compromised
- No unauthorized transactions on wallet

### UCC-1 Continuation

UCC-1 filings lapse after 5 years. File a UCC-3 continuation before
lapse. The on-chain attestation does not lapse - only the UCC filing.

### Revoking an Attestation

If your wallet is compromised or the filing terminates:

1. Go to PolygonScan Write Contract (same URL as Step 2.1)
2. Find function "3. revoke"
3. Enter your commitment hash
4. Submit transaction from original attester wallet
5. File UCC-3 amendment if transferring to new wallet
6. Create new attestation from new wallet

### Assignment (Loan Portfolio Sale)

If you sell the loan:
1. File UCC-3 assignment naming the new secured party
2. New secured party creates a new attestation from their wallet
3. You revoke your original attestation
4. Update metadata JSON to reference both filings

---

## Troubleshooting

**"Not Found" on verification:**
- Check filing ID is exact (case-sensitive, spacing matters)
- Confirm wallet address is EIP-55 checksum format
- Verify salt is exactly as saved (no extra spaces)
- Confirm transaction was confirmed on Polygon Mainnet (not testnet)

**MetaMask shows wrong network:**
- Switch to Polygon Mainnet in MetaMask network dropdown
- Chain ID must be 137

**Transaction fails on PolygonScan:**
- Check POL balance (need ~$0.01 worth minimum)
- Make sure you are not on testnet
- Try increasing gas limit slightly

**Hash already attested error:**
- Each commitment hash can only be attested once
- If you need to re-attest (e.g. correcting an error), generate a new
  salt which produces a new hash

---

## State Filing Portals

| State | Portal | Fee |
|-------|--------|-----|
| New York | dos.ny.gov/corps/ucc_filing.html | ~$20-50 |
| Delaware | corp.delaware.gov/ucc.shtml | ~$25-35 |
| California | sos.ca.gov/business-programs/ucc | ~$10-20 |
| Florida | dos.myflorida.com/sunbiz | ~$10-20 |
| Texas | sos.texas.gov/ucc | ~$15-25 |

---

## Support

For technical issues: Open a GitHub issue at
https://github.com/heirsure-cyber/UCC-Chain-Dev/issues

For legal questions: Consult a secured-transactions attorney.
UCC-Chain LLC does not provide legal advice.

---

*UCC-Chain LLC - HeirSure LLC - New York - April 2026*
*Not legal advice. Consult a secured-transactions attorney before use.*
*verify.ucc-chain.org | github.com/heirsure-cyber/UCC-Chain-Dev*
