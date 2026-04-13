/**
 * Rate Limiting + Security
 *
 * Token-bucket rate limiting with per-IP and per-bot limits
 * Domain verification for widget requests
 */

// ─── Token Bucket Rate Limiter ────────────────────────────
interface Bucket {
    tokens: number;
    lastRefill: number;
}

const buckets = new Map<string, Bucket>();
const CLEANUP_INTERVAL = 60000; // Clean old buckets every 60s
let lastCleanup = Date.now();

function cleanupBuckets(): void {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL) return;
    lastCleanup = now;

    const cutoff = now - 300000; // Remove buckets older than 5 min
    for (const [key, bucket] of buckets) {
        if (bucket.lastRefill < cutoff) {
            buckets.delete(key);
        }
    }
}

export interface RateLimitConfig {
    maxRequests: number;       // Max requests per window
    windowMs: number;          // Window size in milliseconds
    keyPrefix?: string;        // Prefix for the rate limit key
}

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    retryAfterMs: number;
}

export function checkRateLimit(
    key: string,
    config: RateLimitConfig = { maxRequests: 30, windowMs: 60000 }
): RateLimitResult {
    cleanupBuckets();

    const fullKey = `${config.keyPrefix || 'rl'}:${key}`;
    const now = Date.now();
    const bucket = buckets.get(fullKey);

    if (!bucket) {
        // New bucket
        buckets.set(fullKey, { tokens: config.maxRequests - 1, lastRefill: now });
        return { allowed: true, remaining: config.maxRequests - 1, retryAfterMs: 0 };
    }

    // Refill tokens based on elapsed time
    const elapsed = now - bucket.lastRefill;
    const refillRate = config.maxRequests / config.windowMs;
    const newTokens = elapsed * refillRate;
    bucket.tokens = Math.min(config.maxRequests, bucket.tokens + newTokens);
    bucket.lastRefill = now;

    if (bucket.tokens >= 1) {
        bucket.tokens -= 1;
        return { allowed: true, remaining: Math.floor(bucket.tokens), retryAfterMs: 0 };
    }

    // Rate limited
    const waitTime = Math.ceil((1 - bucket.tokens) / refillRate);
    return { allowed: false, remaining: 0, retryAfterMs: waitTime };
}

// ─── Preset rate limiters ─────────────────────────────────
export function rateLimitChat(ip: string): RateLimitResult {
    return checkRateLimit(ip, { maxRequests: 30, windowMs: 60000, keyPrefix: 'chat' });
}

export function rateLimitCrawl(userId: string): RateLimitResult {
    return checkRateLimit(userId, { maxRequests: 5, windowMs: 60000, keyPrefix: 'crawl' });
}

export function rateLimitAPI(apiKeyPrefix: string): RateLimitResult {
    return checkRateLimit(apiKeyPrefix, { maxRequests: 60, windowMs: 60000, keyPrefix: 'api' });
}

// ─── Domain Verification ──────────────────────────────────
export function verifyDomain(
    requestOrigin: string | null,
    allowedDomains: string[]
): boolean {
    // If no domain restrictions, allow all
    if (!allowedDomains || allowedDomains.length === 0) return true;
    if (!requestOrigin) return false;

    try {
        const originUrl = new URL(requestOrigin);
        const originHost = originUrl.hostname.toLowerCase();

        return allowedDomains.some((domain) => {
            const d = domain.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
            // Exact match or wildcard subdomain match
            return (
                originHost === d ||
                originHost.endsWith(`.${d}`) ||
                d === '*'
            );
        });
    } catch {
        return false;
    }
}

// ─── IP Extraction ────────────────────────────────────────
export function getClientIP(request: Request): string {
    const headers = request.headers;
    return (
        headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        headers.get('x-real-ip') ||
        headers.get('cf-connecting-ip') ||
        'unknown'
    );
}

// ─── CORS Headers ─────────────────────────────────────────
export function corsHeaders(origin?: string | null): Record<string, string> {
    return {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
        'Access-Control-Max-Age': '86400',
    };
}
