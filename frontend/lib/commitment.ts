import { ethers } from "ethers";

export function generateCommitmentHash(
  filingId: string,
  wallet: string,
  salt: string
): string {
  if (!filingId || !filingId.trim()) {
    throw new Error("Filing ID is required");
  }
  if (!wallet || !wallet.trim()) {
    throw new Error("Wallet address is required");
  }
  if (!salt || !salt.trim()) {
    throw new Error("Salt is required");
  }
  if (!ethers.isAddress(wallet)) {
    throw new Error("Invalid wallet address format");
  }
  const checksumWallet = ethers.getAddress(wallet);
  const preimage = `UCC-CHAIN/v1|${filingId.trim()}|${checksumWallet}|${salt.trim()}`;
  return ethers.sha256(ethers.toUtf8Bytes(preimage));
}

export function isValidCommitmentHash(hash: string): boolean {
  return /^0x[0-9a-fA-F]{64}$/.test(hash);
}

export function formatHash(hash: string): string {
  if (!hash || hash.length < 20) return hash;
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

export function generateSalt(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
