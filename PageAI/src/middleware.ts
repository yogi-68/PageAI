import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware handles three concerns:
 *
 * 1. Admin site isolation (ADMIN_HOSTNAME).
 * 2. Soft rate limiting on API routes (in-memory token bucket).
 * 3. X-Response-Time header for latency monitoring.
 */

// ─── Minimal in-memory rate limiter ──────────────────────
const rateBuckets = new Map<string, { tokens: number; lastRefill: number }>();
const RL_MAX = 60;        // requests per window
const RL_WINDOW = 60_000; // 1 minute

function softRateLimit(ip: string): boolean {
    const now = Date.now();
    const b = rateBuckets.get(ip);
    if (!b || now - b.lastRefill > RL_WINDOW) {
        rateBuckets.set(ip, { tokens: RL_MAX - 1, lastRefill: now });
        return true;
    }
    if (b.tokens > 0) {
        b.tokens -= 1;
        return true;
    }
    return false;
}

// Periodic cleanup (runs synchronously, fast)
let lastCleanup = Date.now();
function cleanup() {
    const now = Date.now();
    if (now - lastCleanup < 120_000) return;
    lastCleanup = now;
    const cutoff = now - 300_000;
    for (const [k, v] of rateBuckets) {
        if (v.lastRefill < cutoff) rateBuckets.delete(k);
    }
}

export function middleware(request: NextRequest) {
    const start = Date.now();
    const { pathname } = request.nextUrl;
    cleanup();

    // ── Admin isolation ──────────────────────────────────
    if (pathname.startsWith('/admin')) {
        const adminHostname = process.env.ADMIN_HOSTNAME;
        if (adminHostname) {
            const host = request.headers.get('host') || '';
            if (host !== adminHostname && !host.startsWith('admin.')) {
                return new NextResponse(null, { status: 404 });
            }
        }
    }

    // ── Soft rate limiting on /api/* ─────────────────────
    if (pathname.startsWith('/api/')) {
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            || request.headers.get('x-real-ip')
            || '0.0.0.0';
        if (!softRateLimit(ip)) {
            return NextResponse.json(
                { error: 'Too many requests' },
                { status: 429, headers: { 'Retry-After': '60' } }
            );
        }
    }

    // ── Pass through + response-time header ──────────────
    const response = NextResponse.next();
    response.headers.set('X-Response-Time', `${Date.now() - start}ms`);
    return response;
}

export const config = {
    // Run on all routes except static files and _next internals
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
