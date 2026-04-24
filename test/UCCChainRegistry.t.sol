// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/UCCChainRegistry.sol";

/**
 * @title  UCCChainRegistry Tests
 * @notice Full test suite for UCC-Chain V1 MVP
 *
 * HOW TO READ THESE TESTS:
 * Each test function starts with "test_" and tests ONE specific behaviour.
 * Green = pass. Red = fail. All must be green before deploying.
 *
 * WHAT WE TEST:
 *  - Happy path: attest, verify, revoke, isActive, version
 *  - Edge cases: zero hash, duplicate hash, wrong revoker
 *  - Events: correct data emitted on attest and revoke
 *  - State: revoked records preserved, never deleted
 */
contract UCCChainRegistryTest is Test {

    // ─────────────────────────────────────────────────────────────
    // SETUP
    // ─────────────────────────────────────────────────────────────

    UCCChainRegistry public registry;

    // Test wallets — Foundry gives us these for free
    address public securedParty  = makeAddr("securedParty");
    address public randomWallet  = makeAddr("randomWallet");
    address public anotherWallet = makeAddr("anotherWallet");

    // Sample test data matching real UCC-Chain format
    // H = SHA256("UCC-CHAIN/v1|NY-202607-123456789|0xWallet|saltvalue")
    bytes32 public testHash = keccak256(
        abi.encodePacked("UCC-CHAIN/v1|NY-202607-123456789|0xWallet|saltvalue")
    );

    bytes32 public testHash2 = keccak256(
        abi.encodePacked("UCC-CHAIN/v1|NY-202607-987654321|0xWallet2|saltvalue2")
    );

    // New York state code
    uint8 public constant NY = 1;
    uint8 public constant DE = 2;

    function setUp() public {
        // Deploy a fresh registry before each test
        registry = new UCCChainRegistry();
    }

    // ─────────────────────────────────────────────────────────────
    // VERSION TESTS
    // ─────────────────────────────────────────────────────────────

    /**
     * @dev Contract should identify itself as V1
     */
    function test_version_returnsCorrectString() public view {
        assertEq(registry.version(), "UCC-CHAIN/v1");
    }

    // ─────────────────────────────────────────────────────────────
    // ATTEST TESTS
    // ─────────────────────────────────────────────────────────────

    /**
     * @dev Happy path: secured party attests a valid hash
     *      Checks all fields stored correctly
     */
    function test_attest_storesAllFieldsCorrectly() public {
        // Simulate securedParty calling attest()
        vm.prank(securedParty);
        registry.attest(testHash, NY);

        // Read it back
        UCCChainRegistry.Attestation memory a = registry.verify(testHash);

        // Every field must match exactly
        assertEq(a.attester,    securedParty, "attester should be securedParty");
        assertEq(a.filingState, NY,           "filingState should be NY (1)");
        assertEq(a.revoked,     false,        "should not be revoked");
        assertGt(a.blockNumber, 0,            "blockNumber should be set");
        assertGt(a.timestamp,   0,            "timestamp should be set");
    }

    /**
     * @dev Attesting with Delaware state code should store correctly
     */
    function test_attest_delawareStateCode() public {
        vm.prank(securedParty);
        registry.attest(testHash, DE);

        UCCChainRegistry.Attestation memory a = registry.verify(testHash);
        assertEq(a.filingState, DE, "filingState should be DE (2)");
    }

    /**
     * @dev Two different hashes from two different wallets
     *      Both should coexist in the registry
     */
    function test_attest_twoHashesTwoWallets() public {
        vm.prank(securedParty);
        registry.attest(testHash, NY);

        vm.prank(anotherWallet);
        registry.attest(testHash2, DE);

        UCCChainRegistry.Attestation memory a1 = registry.verify(testHash);
        UCCChainRegistry.Attestation memory a2 = registry.verify(testHash2);

        assertEq(a1.attester, securedParty,  "first attester wrong");
        assertEq(a2.attester, anotherWallet, "second attester wrong");
        assertEq(a1.filingState, NY,         "first state wrong");
        assertEq(a2.filingState, DE,         "second state wrong");
    }

    /**
     * @dev Zero hash (empty bytes32) must be rejected
     *      Prevents meaningless attestations
     */
    function test_attest_revertsOnZeroHash() public {
        vm.prank(securedParty);
        vm.expectRevert(UCCChainRegistry.ZeroHash.selector);
        registry.attest(bytes32(0), NY);
    }

    /**
     * @dev Same hash cannot be attested twice
     *      Prevents overwriting existing attestations
     */
    function test_attest_revertsOnDuplicateHash() public {
        // First attest succeeds
        vm.prank(securedParty);
        registry.attest(testHash, NY);

        // Second attest on same hash must fail
        vm.prank(securedParty);
        vm.expectRevert(
            abi.encodeWithSelector(
                UCCChainRegistry.AlreadyAttested.selector,
                testHash
            )
        );
        registry.attest(testHash, NY);
    }

    /**
     * @dev Even a different wallet cannot re-attest the same hash
     */
    function test_attest_revertsOnDuplicateHashDifferentWallet() public {
        vm.prank(securedParty);
        registry.attest(testHash, NY);

        vm.prank(randomWallet);
        vm.expectRevert(
            abi.encodeWithSelector(
                UCCChainRegistry.AlreadyAttested.selector,
                testHash
            )
        );
        registry.attest(testHash, NY);
    }

    // ─────────────────────────────────────────────────────────────
    // VERIFY TESTS
    // ─────────────────────────────────────────────────────────────

    /**
     * @dev Verifying a hash that was never attested returns empty struct
     *      Callers check attester != address(0) to detect this
     */
    function test_verify_returnsEmptyForUnknownHash() public view {
        UCCChainRegistry.Attestation memory a = registry.verify(testHash);
        assertEq(a.attester,    address(0), "attester should be zero address");
        assertEq(a.blockNumber, 0,          "blockNumber should be 0");
        assertEq(a.timestamp,   0,          "timestamp should be 0");
        assertEq(a.filingState, 0,          "filingState should be 0");
        assertEq(a.revoked,     false,      "revoked should be false");
    }

    /**
     * @dev Verify is free — anyone can call it, no restrictions
     */
    function test_verify_anyoneCanCall() public {
        vm.prank(securedParty);
        registry.attest(testHash, NY);

        // Random wallet can verify — no permission needed
        vm.prank(randomWallet);
        UCCChainRegistry.Attestation memory a = registry.verify(testHash);
        assertEq(a.attester, securedParty);
    }

    // ─────────────────────────────────────────────────────────────
    // REVOKE TESTS
    // ─────────────────────────────────────────────────────────────

    /**
     * @dev Happy path: original attester can revoke their own attestation
     */
    function test_revoke_setsRevokedTrue() public {
        vm.prank(securedParty);
        registry.attest(testHash, NY);

        vm.prank(securedParty);
        registry.revoke(testHash);

        UCCChainRegistry.Attestation memory a = registry.verify(testHash);
        assertEq(a.revoked, true, "should be revoked");
    }

    /**
     * @dev Revoking preserves all other fields — record never deleted
     *      Critical for legal chain of custody
     */
    function test_revoke_preservesOtherFields() public {
        vm.prank(securedParty);
        registry.attest(testHash, NY);

        vm.prank(securedParty);
        registry.revoke(testHash);

        UCCChainRegistry.Attestation memory a = registry.verify(testHash);

        // These must survive revocation
        assertEq(a.attester,    securedParty, "attester lost after revoke");
        assertEq(a.filingState, NY,           "filingState lost after revoke");
        assertGt(a.blockNumber, 0,            "blockNumber lost after revoke");
        assertGt(a.timestamp,   0,            "timestamp lost after revoke");
        // Only this changes
        assertEq(a.revoked, true,             "revoked not set");
    }

    /**
     * @dev A different wallet cannot revoke someone else's attestation
     */
    function test_revoke_revertsForWrongCaller() public {
        vm.prank(securedParty);
        registry.attest(testHash, NY);

        // randomWallet tries to revoke securedParty's attestation
        vm.prank(randomWallet);
        vm.expectRevert(
            abi.encodeWithSelector(
                UCCChainRegistry.NotAttester.selector,
                testHash,
                randomWallet
            )
        );
        registry.revoke(testHash);
    }

    /**
     * @dev Cannot revoke a hash that was never attested
     */
    function test_revoke_revertsForUnknownHash() public {
        vm.prank(securedParty);
        vm.expectRevert(
            abi.encodeWithSelector(
                UCCChainRegistry.NotFound.selector,
                testHash
            )
        );
        registry.revoke(testHash);
    }

    /**
     * @dev Cannot revoke the same attestation twice
     */
    function test_revoke_revertsIfAlreadyRevoked() public {
        vm.prank(securedParty);
        registry.attest(testHash, NY);

        vm.prank(securedParty);
        registry.revoke(testHash);

        // Second revoke must fail
        vm.prank(securedParty);
        vm.expectRevert(
            abi.encodeWithSelector(
                UCCChainRegistry.AlreadyRevoked.selector,
                testHash
            )
        );
        registry.revoke(testHash);
    }

    // ─────────────────────────────────────────────────────────────
    // ISACTIVE TESTS
    // ─────────────────────────────────────────────────────────────

    /**
     * @dev isActive returns true for a fresh valid attestation
     */
    function test_isActive_trueForFreshAttestation() public {
        vm.prank(securedParty);
        registry.attest(testHash, NY);

        assertTrue(registry.isActive(testHash), "should be active");
    }

    /**
     * @dev isActive returns false for unknown hash
     */
    function test_isActive_falseForUnknownHash() public view {
        assertFalse(registry.isActive(testHash), "unknown hash should not be active");
    }

    /**
     * @dev isActive returns false after revocation
     */
    function test_isActive_falseAfterRevoke() public {
        vm.prank(securedParty);
        registry.attest(testHash, NY);

        vm.prank(securedParty);
        registry.revoke(testHash);

        assertFalse(registry.isActive(testHash), "revoked hash should not be active");
    }

    // ─────────────────────────────────────────────────────────────
    // EVENT TESTS
    // ─────────────────────────────────────────────────────────────

    /**
     * @dev attest() must emit Attested event with correct data
     *      Events are how off-chain systems track attestations
     */
    function test_attest_emitsAttestedEvent() public {
        vm.prank(securedParty);

        // Tell Foundry to watch for this exact event
        vm.expectEmit(true, true, false, true);
        emit UCCChainRegistry.Attested(
            testHash,
            securedParty,
            NY,
            uint64(block.number)
        );

        registry.attest(testHash, NY);
    }

    /**
     * @dev revoke() must emit Revoked event with correct data
     */
    function test_revoke_emitsRevokedEvent() public {
        vm.prank(securedParty);
        registry.attest(testHash, NY);

        vm.prank(securedParty);
        vm.expectEmit(true, true, false, true);
        emit UCCChainRegistry.Revoked(testHash, securedParty);

        registry.revoke(testHash);
    }

    // ─────────────────────────────────────────────────────────────
    // FUZZ TESTS
    // ─────────────────────────────────────────────────────────────

    /**
     * @dev Fuzz test: any non-zero hash should attest successfully
     *      Foundry runs this 256 times with random inputs automatically
     */
    function testFuzz_attest_anyNonZeroHash(bytes32 randomHash) public {
        // Skip zero hash — that's handled by a separate test
        vm.assume(randomHash != bytes32(0));

        vm.prank(securedParty);
        registry.attest(randomHash, NY);

        UCCChainRegistry.Attestation memory a = registry.verify(randomHash);
        assertEq(a.attester, securedParty);
        assertEq(a.revoked,  false);
    }

    /**
     * @dev Fuzz test: any state code 1-50 should store correctly
     */
    function testFuzz_attest_anyStateCode(uint8 stateCode) public {
        vm.assume(stateCode > 0);

        vm.prank(securedParty);
        registry.attest(testHash, stateCode);

        UCCChainRegistry.Attestation memory a = registry.verify(testHash);
        assertEq(a.filingState, stateCode);
    }
}