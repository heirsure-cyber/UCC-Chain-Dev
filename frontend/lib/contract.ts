/**
 * UCC-Chain V1 — Contract Interaction Library
 *
 * Handles all communication between the frontend and the
 * UCCChainRegistry smart contract on Polygon Mainnet.
 *
 * Contract Address: 0xC17def4DF914b016D60500Cb9C459c3eAf6469Ff
 * Network:          Polygon Mainnet (Chain ID 137)
 * Explorer:         https://polygonscan.com/address/0xC17def4DF914b016D60500Cb9C459c3eAf6469Ff
 */

import { ethers } from "ethers";

// ─────────────────────────────────────────────────────────────
// CONTRACT CONFIGURATION
// ─────────────────────────────────────────────────────────────

export const CONTRACT_ADDRESS = "0xC17def4DF914b016D60500Cb9C459c3eAf6469Ff";
export const CHAIN_ID = 137;
export const NETWORK_NAME = "Polygon Mainnet";
export const POLYGONSCAN_URL = `https://polygonscan.com/address/${CONTRACT_ADDRESS}`;

// RPC URL — falls back to public Polygon RPC if env var not set
const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL ||
  "https://polygon-rpc.com";

// ─────────────────────────────────────────────────────────────
// CONTRACT ABI
// Only the functions we need — keeps bundle size small
// ─────────────────────────────────────────────────────────────

const ABI = [
  // verify(bytes32) → returns Attestation struct
  {
    inputs: [{ internalType: "bytes32", name: "commitmentHash", type: "bytes32" }],
    name: "verify",
    outputs: [
      {
        components: [
          { internalType: "address", name: "attester",    type: "address" },
          { internalType: "uint64",  name: "blockNumber", type: "uint64"  },
          { internalType: "uint64",  name: "timestamp",   type: "uint64"  },
          { internalType: "uint8",   name: "filingState", type: "uint8"   },
          { internalType: "bool",    name: "revoked",     type: "bool"    },
        ],
        internalType: "struct UCCChainRegistry.Attestation",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  // isActive(bytes32) → returns bool
  {
    inputs: [{ internalType: "bytes32", name: "commitmentHash", type: "bytes32" }],
    name: "isActive",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  // version() → returns string
  {
    inputs: [],
    name: "version",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "pure",
    type: "function",
  },
];

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export interface Attestation {
  attester:    string;   // wallet address of the secured party
  blockNumber: number;   // Polygon block when attested
  timestamp:   number;   // Unix timestamp in seconds
  filingState: number;   // US state code (1=NY, 2=DE, 3=CA...)
  revoked:     boolean;  // true if revoked
}

export interface VerifyResult {
  found:       boolean;       // false if hash was never attested
  active:      boolean;       // true if attested AND not revoked
  attestation: Attestation | null;
  txUrl:       string;        // PolygonScan link
  error:       string | null; // error message if something went wrong
}

// US state codes used by the protocol
export const STATE_CODES: Record<number, string> = {
  1:  "New York",
  2:  "Delaware",
  3:  "California",
  4:  "Florida",
  5:  "Texas",
  6:  "Illinois",
  7:  "Pennsylvania",
  8:  "Colorado",
  9:  "Washington",
  10: "Nevada",
};

// ─────────────────────────────────────────────────────────────
// MAIN VERIFY FUNCTION
// ─────────────────────────────────────────────────────────────

/**
 * Verify a commitment hash against the live registry contract.
 *
 * This is the core function used by the verifier UI.
 * It reads from the blockchain — no gas cost, no wallet needed.
 *
 * @param commitmentHash - 32-byte hex hash starting with 0x
 * @returns              - VerifyResult with full attestation details
 */
export async function verifyCommitment(
  commitmentHash: string
): Promise<VerifyResult> {
  try {
    // Connect to Polygon Mainnet via RPC
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    // Create read-only contract instance
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

    // Call verify() — free read, no gas
    const result = await contract.verify(commitmentHash);

    // Check if attestation exists
    // If attester is zero address, hash was never attested
    const found = result.attester !== ethers.ZeroAddress;

    if (!found) {
      return {
        found:       false,
        active:      false,
        attestation: null,
        txUrl:       POLYGONSCAN_URL,
        error:       null,
      };
    }

    // Build attestation object from contract response
    const attestation: Attestation = {
      attester:    result.attester,
      blockNumber: Number(result.blockNumber),
      timestamp:   Number(result.timestamp),
      filingState: Number(result.filingState),
      revoked:     result.revoked,
    };

    return {
      found:       true,
      active:      !attestation.revoked,
      attestation,
      txUrl:       `https://polygonscan.com/address/${CONTRACT_ADDRESS}`,
      error:       null,
    };
  } catch (err) {
    // Network error, RPC issue, or invalid hash format
    const message = err instanceof Error ? err.message : "Unknown error";
    return {
      found:       false,
      active:      false,
      attestation: null,
      txUrl:       POLYGONSCAN_URL,
      error:       `Verification failed: ${message}`,
    };
  }
}

/**
 * Format a Unix timestamp into a readable date string.
 *
 * @param unixSeconds - Unix timestamp in seconds
 * @returns           - Human readable date e.g. "April 25, 2026 at 3:42 PM"
 */
export function formatTimestamp(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleString("en-US", {
    year:   "numeric",
    month:  "long",
    day:    "numeric",
    hour:   "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Get the state name from a filing state code.
 *
 * @param code - Numeric state code from the contract
 * @returns    - State name or "Unknown (code N)"
 */
export function getStateName(code: number): string {
  return STATE_CODES[code] || `Unknown (code ${code})`;
}

/**
 * Format a wallet address for display — first 6 and last 4 chars.
 * Example: "0xC17d...69Ff"
 *
 * @param address - Full 42-character wallet address
 * @returns       - Shortened display string
 */
export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}