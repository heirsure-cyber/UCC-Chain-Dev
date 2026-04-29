export function computeCommitmentHash(filingId: string, wallet: string, salt: string): string {
  const preImage = `UCC-CHAIN/v1|${filingId}|${wallet.toLowerCase()}|${salt}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(preImage);
  return crypto.subtle.digest('SHA-256', data).then(hashBuffer => {
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }) as any;
}
