export function getTossClientKey(): string {
  const key = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
  if (!key) {
    throw new Error('NEXT_PUBLIC_TOSS_CLIENT_KEY is not configured');
  }
  return key;
}
