/** Canonical app URL — always prefer production domain when env is unset. */
export function getAppUrl(): string {
    const raw = process.env.NEXT_PUBLIC_APP_URL || 'https://www.pagecortex.com';
    return raw.replace(/\/$/, '');
}
