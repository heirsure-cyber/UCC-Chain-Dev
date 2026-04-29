export async function verifyAttestation(filingId: string, wallet: string, salt: string) {
  const response = await fetch('/api/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filingId, wallet, salt })
  });

  if (!response.ok) {
    throw new Error('Verification request failed');
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Verification failed');
  }

  return data.proof;
}
