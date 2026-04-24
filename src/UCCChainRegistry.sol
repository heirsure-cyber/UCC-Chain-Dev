// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title  UCCChainRegistry
 * @notice UCC-Chain V1 — Hash-Commitment MVP
 *
 * HOW IT WORKS:
 *   1. Off-chain, the secured party computes:
 *        H = SHA256("UCC-CHAIN/v1|" + filing_id + "|" + wallet + "|" + salt)
 *   2. They call attest(H, filingState) to write H to the blockchain.
 *   3. Anyone calls verify(H) to confirm the attestation exists.
 *   4. The original attester can call revoke(H) if needed.
 *
 * LEGAL CONTEXT:
 *   Satisfies UCC § 12-105(a)(2) identifiability prong by binding
 *   a named secured party (on the UCC-1) to a cryptographic key (this wallet).
 *   Effective in New York as of June 3, 2026 (UCC Article 12).
 *
 * SECURITY DESIGN:
 *   - No admin key
 *   - No upgradeable proxy
 *   - No owner
 *   - Append-only (records never deleted, only flagged revoked)
 *   - Permissionless attesting
 *   - Only original attester can revoke their own attestation
 *
 * @author  UCC-Chain LLC / HeirSure LLC
 * @custom:version  1.0.0
 */
contract UCCChainRegistry {

    // ─────────────────────────────────────────────────────────────
    // DATA STRUCTURES
    // ─────────────────────────────────────────────────────────────

    /**
     * @dev One Attestation record per commitment hash.
     *
     * attester     — wallet that called attest()
     * blockNumber  — Polygon block when mined (wait 256 blocks for finality)
     * timestamp    — Unix time in seconds when mined
     * filingState  — US state code (1=NY, 2=DE, 3=CA ...)
     * revoked      — false by default, true if revoke() called
     *                Record is NEVER deleted — only flagged.
     */
    struct Attestation {
        address attester;
        uint64  blockNumber;
        uint64  timestamp;
        uint8   filingState;
        bool    revoked;
    }

    // ─────────────────────────────────────────────────────────────
    // STATE
    // ─────────────────────────────────────────────────────────────

    /**
     * @dev Core registry: SHA-256 commitment hash → Attestation record.
     *      bytes32 = exactly 32 bytes, matching SHA-256 output size.
     *      Append-only: values written but never deleted.
     */
    mapping(bytes32 => Attestation) private _attestations;

    // ─────────────────────────────────────────────────────────────
    // EVENTS
    // ─────────────────────────────────────────────────────────────

    /**
     * @dev Emitted when a new attestation is recorded.
     *      Indexed fields are searchable by block explorers.
     */
    event Attested(
        bytes32 indexed commitmentHash,
        address indexed attester,
        uint8           filingState,
        uint64          blockNumber
    );

    /**
     * @dev Emitted when an attestation is revoked.
     *      Record stays in mapping with revoked=true.
     */
    event Revoked(
        bytes32 indexed commitmentHash,
        address indexed attester
    );

    // ─────────────────────────────────────────────────────────────
    // ERRORS
    // ─────────────────────────────────────────────────────────────

    /// Thrown when attest() called with a hash that already exists
    error AlreadyAttested(bytes32 commitmentHash);

    /// Thrown when attest() called with empty bytes32
    error ZeroHash();

    /// Thrown when revoke() called by someone other than original attester
    error NotAttester(bytes32 commitmentHash, address caller);

    /// Thrown when revoke() called on a hash never attested
    error NotFound(bytes32 commitmentHash);

    /// Thrown when revoke() called on already-revoked attestation
    error AlreadyRevoked(bytes32 commitmentHash);

    // ─────────────────────────────────────────────────────────────
    // FUNCTIONS
    // ─────────────────────────────────────────────────────────────

    /**
     * @notice Record a UCC-1 to wallet commitment hash on-chain.
     *
     * @dev Called by secured party AFTER filing UCC-1 with Secretary of State.
     *      Commitment hash H must be computed off-chain as:
     *        H = SHA256("UCC-CHAIN/v1|" + filing_id + "|" + wallet + "|" + salt)
     *
     *      Permissionless — any wallet can call this.
     *      msg.sender is recorded as the attester automatically.
     *      Each commitment hash can only be attested ONCE.
     *
     * @param commitmentHash  32-byte SHA-256 digest of canonical pre-image
     * @param filingState     US state code (1=NY, 2=DE, 3=CA ...)
     */
    function attest(bytes32 commitmentHash, uint8 filingState) external {
        // Reject empty hash
        if (commitmentHash == bytes32(0)) revert ZeroHash();

        // Each hash can only be attested once
        if (_attestations[commitmentHash].attester != address(0)) {
            revert AlreadyAttested(commitmentHash);
        }

        // Write attestation to storage
        _attestations[commitmentHash] = Attestation({
            attester:    msg.sender,
            blockNumber: uint64(block.number),
            timestamp:   uint64(block.timestamp),
            filingState: filingState,
            revoked:     false
        });

        // Emit for off-chain indexers and block explorers
        emit Attested(
            commitmentHash,
            msg.sender,
            filingState,
            uint64(block.number)
        );
    }

    /**
     * @notice Look up an attestation by its commitment hash.
     *
     * @dev Free to call — no gas when called off-chain via eth_call.
     *      Returns empty Attestation (all zeros) if hash not found.
     *      Check: result.attester != address(0) to confirm hash was attested.
     *
     * HOW A VERIFIER USES THIS:
     *   1. Get filing_id, wallet, salt from public UCC-1 metadata
     *   2. Recompute H = SHA256("UCC-CHAIN/v1|filing_id|wallet|salt")
     *   3. Call verify(H)
     *   4. Check attester != address(0)  → attestation exists
     *             revoked == false        → still active
     *
     * @param  commitmentHash  The 32-byte SHA-256 hash to look up
     * @return Full Attestation struct for this hash
     */
    function verify(bytes32 commitmentHash)
        external
        view
        returns (Attestation memory)
    {
        return _attestations[commitmentHash];
    }

    /**
     * @notice Mark an attestation as revoked.
     *
     * @dev Only ORIGINAL attester can revoke their own attestation.
     *      Record flagged revoked=true but NEVER deleted.
     *      Historical record preserved — only status changes.
     *
     * When to revoke:
     *   - Wallet private key compromised → revoke + re-attest new wallet
     *   - UCC-1 terminated via UCC-3 → revoke to signal lapse
     *   - Filing had errors → revoke and re-file correctly
     *
     * @param commitmentHash  The 32-byte hash to revoke
     */
    function revoke(bytes32 commitmentHash) external {
        Attestation storage a = _attestations[commitmentHash];

        // Hash must exist
        if (a.attester == address(0)) revert NotFound(commitmentHash);

        // Only original attester can revoke
        if (a.attester != msg.sender) {
            revert NotAttester(commitmentHash, msg.sender);
        }

        // Cannot revoke twice
        if (a.revoked) revert AlreadyRevoked(commitmentHash);

        // Flag revoked — record preserved forever
        a.revoked = true;

        emit Revoked(commitmentHash, msg.sender);
    }

    /**
     * @notice Returns true if a hash is attested AND not revoked.
     *
     * @dev Convenience helper — saves verifiers checking two fields.
     *      false if: never attested OR attested but revoked.
     *
     * @param  commitmentHash  The 32-byte hash to check
     * @return bool  true = active attestation exists
     */
    function isActive(bytes32 commitmentHash)
        external
        view
        returns (bool)
    {
        Attestation storage a = _attestations[commitmentHash];
        return (a.attester != address(0) && !a.revoked);
    }

    /**
     * @notice Returns the protocol version string.
     * @dev    Lets verifiers confirm they are talking to a V1 registry.
     */
    function version() external pure returns (string memory) {
        return "UCC-CHAIN/v1";
    }
}