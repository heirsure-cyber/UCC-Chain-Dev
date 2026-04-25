# UCC-Chain Frequently Asked Questions
## Version 1.0 | April 2026 | UCC-Chain LLC / HeirSure LLC

---

> Not legal advice. Consult a secured-transactions attorney before use
> in any real transaction.

---

## General Questions

**Q1: What is UCC-Chain in plain English?**

UCC-Chain is a free public tool that lets anyone verify whether a lender
has cryptographic control over a borrower's crypto assets. Think of it
as a public registry that links a traditional UCC-1 lien filing to a
specific blockchain wallet address, provably and permanently.

---

**Q2: Who is this for?**

- Lenders making crypto-collateralized loans
- Lawyers advising on secured transactions involving digital assets
- Bankruptcy trustees verifying what crypto a debtor controlled
- Divorce attorneys tracing digital asset ownership
- Title insurers underwriting policies touching on-chain assets
- Courts needing rapid verifiable snapshots of crypto control
- Anyone who needs to answer: "does this lender actually control
  this wallet?"

---

**Q3: Is this legal advice?**

No. UCC-Chain LLC and HeirSure LLC are not law firms. Nothing published
by UCC-Chain constitutes legal advice or creates an attorney-client
relationship. Consult a secured-transactions attorney licensed in the
relevant jurisdiction before using this protocol in any real transaction.

---

**Q4: Does this replace filing a UCC-1?**

No. UCC-Chain supplements traditional UCC-1 filing, it does not replace
it. You still file with the Secretary of State. UCC-Chain adds a
cryptographic proof layer that existing search infrastructure cannot
provide. Use both.

---

**Q5: Is this free?**

Yes. Verification is free forever. The registry contract has no fee
mechanism and never will. Attesting a new filing costs approximately
$0.001 in Polygon gas fees (a fraction of a cent).

---

## Legal Questions

**Q6: What is UCC Article 12 and why does it matter?**

UCC Article 12 is a new section of the Uniform Commercial Code that
creates a legal framework for "controllable electronic records" (CERs)
including cryptocurrencies and NFTs. It takes effect in New York on
June 3, 2026. The key provision is UCC Section 9-326A: a secured party
who has control of a CER has priority over a secured party who only has
a UCC-1 filing. Control beats filing.

More information: https://www.uniformlaws.org

---

**Q7: What is the "control test" under Section 12-105?**

To have legal control of a CER, a party must satisfy three prongs:
(a)(1)(A) - Power to realize substantially all benefit from the record
(a)(1)(B) - Exclusive power to prevent others from benefiting and to
            transfer control
(a)(2)    - Ability to readily identify itself as having those powers
            "by name, identifying number, cryptographic key, office,
            or account number"

UCC-Chain specifically addresses prong (a)(2) by binding a legal name
(on the UCC-1) to a cryptographic key (the wallet address) via an
on-chain commitment hash.

---

**Q8: Has any court ruled on this yet?**

No. As of April 2026, no US court has applied Article 12's control test
to an NFT-based secured interest, interpreted Section 9-108 against a
blockchain collateral description, or ruled on the evidentiary weight of
a Polygon-anchored SHA-256 commitment in a priority dispute. New York's
enactment takes effect June 3, 2026 and litigation is likely years away.
Early adopters are implicitly underwriting the first wave of judicial
interpretation.

---

**Q9: Does a UCC-1 filing alone protect me under Article 12?**

No. Under Section 12-104(h), filing a financing statement is NOT notice
of a property claim in a CER. A subsequent good-faith purchaser who
obtains control without actual notice of your interest takes the CER
free of your claim. You need control, not just a filing.

---

**Q10: What collateral qualifies as a CER?**

Native cryptocurrencies (BTC, ETH), most NFTs, on-chain receivables
tokens, and tokenized fund interests plausibly qualify as CERs. Excluded
categories include investment property, electronic money (contested),
and tokenized securities governed by other UCC articles or federal law.
Whether a particular asset qualifies is a fact-intensive inquiry -
consult counsel.

---

**Q11: Can I use this in a bankruptcy proceeding?**

UCC-Chain is designed to produce court-ready verification artifacts.
The "Download Proof JSON" feature exports attestation details including
block number, timestamp, and attester address. However, no court has
yet accepted a Polygon-anchored commitment as evidence in a bankruptcy
proceeding. Work with bankruptcy counsel to establish proper foundation
for admission under Federal Rules of Evidence 901 and 902(13)-(14).

---

**Q12: What if the other party claims my UCC-1 collateral description
is insufficient under Section 9-108?**

The templates in docs/templates/collateral-description-templates.md are
designed to satisfy Section 9-108 under three independent theories:
(b)(1) specific listing, (b)(6) objectively determinable, and
Section 12-105(a)(2) identifiability by cryptographic key. The Seventh
Circuit's reasoning in In re I80 Equipment LLC, 938 F.3d 866 (2019)
supports the objective determinability argument. However, no court has
directly addressed blockchain-reference collateral descriptions. Use
these templates with counsel review.

---

## Technical Questions

**Q13: What is a commitment hash?**

A commitment hash is a 32-byte SHA-256 fingerprint computed from three
inputs: the UCC-1 filing ID, the secured party wallet address, and a
random salt. It is mathematically impossible to produce the same hash
from different inputs (collision resistance). The hash is stored
permanently on the Polygon Mainnet blockchain.

Formula: SHA256("UCC-CHAIN/v1|filing_id|wallet|salt")

---

**Q14: What is a salt and why do I need to save it?**

A salt is a random 64-character string added to the hash input to
prevent brute-force guessing. If an attacker knows the filing ID and
wallet address (both public), they could try to guess the hash without
a salt. The salt makes this computationally infeasible.

IMPORTANT: The salt is required to verify the attestation later. If you
lose the salt, no one can verify the attestation. Save it in at least
two secure locations when you generate it.

---

**Q15: Why Polygon and not Ethereum mainnet?**

Three reasons: cost (a Polygon transaction costs a fraction of a cent
vs $5-50 on Ethereum), finality (deterministic within seconds at
consensus layer), and evidentiary surface (EVM-compatible, well-indexed
by PolygonScan, supported by mainstream compliance infrastructure).
Polygon checkpoints Merkle roots to Ethereum L1 approximately every
30 minutes, providing a second layer of settlement assurance.

---

**Q16: What happened to the Polygon Mumbai testnet?**

Mumbai was deprecated in April 2024. The current Polygon PoS testnet
is Amoy (Chain ID 80002). The UCC-Chain smart contract is deployed on
Polygon Mainnet (Chain ID 137) - not testnet.

---

**Q17: What if Polygon goes offline or shuts down?**

The SHA-256 commitment itself is the durable artifact. The blockchain
is a notarising witness. Mitigations include:
- Periodic export of registry state to Ethereum L1 and Arweave
- Dual-anchoring attestations to Bitcoin via OpenTimestamps
- Open-source state export format so any party can reconstruct
  verification from archival data
Any archival node preserves the full registry state indefinitely.

---

**Q18: Can someone fake an attestation?**

They would need to find a SHA-256 collision - computationally infeasible
with current technology. NIST continues to recommend SHA-256 for all
federal applications after 20+ years of adversarial scrutiny. The
registry contract is also immutable - no admin can insert fake records.

---

**Q19: What if my private key is compromised?**

1. Immediately call revoke() on all your attestations
2. File a UCC-3 amendment transferring the security interest to a new
   wallet address
3. Create new attestations from the new wallet
4. The historical record is preserved (revoke() flags, never deletes)
The revoke() function is specifically designed for this scenario.

---

**Q20: How do I verify an attestation without the website?**

Query the contract directly using any Ethereum-compatible library:

```javascript
const provider = new ethers.JsonRpcProvider("https://polygon-rpc.com");
const contract = new ethers.Contract(
  "0xC17def4DF914b016D60500Cb9C459c3eAf6469Ff",
  ["function verify(bytes32) view returns (tuple(address,uint64,uint64,uint8,bool))"],
  provider
);
const preimage = `UCC-CHAIN/v1|${filingId}|${wallet}|${salt}`;
const hash = ethers.sha256(ethers.toUtf8Bytes(preimage));
const result = await contract.verify(hash);
```

You can also use PolygonScan's Read Contract interface at no cost.

---

## Process Questions

**Q21: In what order do I do things?**

1. Draft security agreement with collateral description
2. Sign security agreement with debtor
3. Generate commitment hash (verify.ucc-chain.org Generate Hash tab)
4. Save the salt securely
5. Call attest() on the registry contract
6. File UCC-1 with Secretary of State referencing the hash
7. Publish metadata JSON to GitHub or Arweave
8. Verify the full flow at verify.ucc-chain.org

---

**Q22: Do I attest before or after filing the UCC-1?**

Attest first, then file the UCC-1. The UCC-1 collateral description
references the commitment hash and registry contract, so the hash must
exist on-chain before you can include it in the filing. In practice
the gap is minutes.

---

**Q23: How much does it cost to file?**

- Generating the hash: free
- Attesting on Polygon Mainnet: ~$0.001 (fraction of a cent)
- UCC-1 filing with NY Secretary of State: ~$20-50
- Verifying: free forever

---

**Q24: How do I file a UCC-1 in New York?**

File online at: https://www.dos.ny.gov/corps/ucc_filing.html
Fee: approximately $20-50 depending on filing type.
The collateral description field is where you include the hash reference.
Use the templates in docs/templates/collateral-description-templates.md.

---

*UCC-Chain LLC - HeirSure LLC - New York - April 2026*
*Not legal advice. Consult a secured-transactions attorney before use.*
*verify.ucc-chain.org | github.com/heirsure-cyber/UCC-Chain-Dev*
