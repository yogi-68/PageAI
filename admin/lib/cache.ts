/**
 * Pluggable cache layer for admin stats.
 *
 * Automatically switches to Upstash Redis when the following env vars are set:
 *   UPSTASH_REDIS_REST_URL   — your Upstash Redis REST endpoint
 *   UPSTASH_REDIS_REST_TOKEN — your Upstash READ/WRITE token
 *
 * Falls back to a per-instance in-memory TTL cache when those variables are absent.
 *
 * How to upgrade to Upstash (free tier works for this use case):
 *   1. Create a Redis database at console.upstash.com
 *   2. Copy "REST URL" and "REST Token" from the database dashboard
 *   3. Add them as Vercel environment variables (Settings → Environment Variables)
 *   4. Redeploy — no code change required
 *
 * Cache invalidation: call cacheInvalidate(key) whenever you want fresh data.
 * Add ?bust=1 to /api/stats to force a live DB fetch and refresh the cache.
 */

const DEFAULT_TTL = 5 * 60; // 5 minutes

// ─── In-memory fallback ───────────────────────────────────
const _mem = new Map<string, { data: unknown; expiresAt: number }>();

function memGet<T>(key: string): T | null {
    const entry = _mem.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) { _mem.delete(key); return null; }
    return entry.data as T;
}
function memSet(key: string, data: unknown, ttl: number): void {
    _mem.set(key, { data, expiresAt: Date.now() + ttl * 1000 });
}
function memDel(key: string): void { _mem.delete(key); }

// ─── Upstash REST helpers (no SDK required) ────────────────
async function upstashCmd(cmd: unknown[]): Promise<unknown> {
    const url = process.env.UPSTASH_REDIS_REST_URL!;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN!;
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(cmd),
            // Don't cache the fetch itself
            cache: 'no-store',
        });
        const json = await res.json() as { result: unknown };
        return json.result;
    } catch {
        return null;
    }
}

function hasUpstash(): boolean {
    return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

// ─── Public API ────────────────────────────────────────────
export async function cacheGet<T>(key: string): Promise<T | null> {
    if (!hasUpstash()) return memGet<T>(key);
    const raw = await upstashCmd(['get', key]);
    if (raw === null || raw === undefined) return null;
    try { return JSON.parse(raw as string) as T; } catch { return null; }
}

export async function cacheSet(key: string, data: unknown, ttlSeconds = DEFAULT_TTL): Promise<void> {
    if (!hasUpstash()) { memSet(key, data, ttlSeconds); return; }
    await upstashCmd(['set', key, JSON.stringify(data), 'ex', ttlSeconds]);
}

export async function cacheInvalidate(key: string): Promise<void> {
    if (!hasUpstash()) { memDel(key); return; }
    await upstashCmd(['del', key]);
}

/** For diagnostics — returns which backend is active */
export function getCacheBackend(): 'upstash' | 'memory' {
    return hasUpstash() ? 'upstash' : 'memory';
}
