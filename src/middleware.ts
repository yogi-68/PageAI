import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware handles two concerns:
 *
 * 1. Admin site isolation.
 *    If ADMIN_HOSTNAME is set (e.g. "admin.pageai.io"), /admin/* routes are
 *    ONLY accessible from that hostname — returning 404 from the main domain.
 *    This lets you point a separate Vercel project or custom domain at the
 *    same deploy while hiding admin from the public-facing URL.
 *
 *    How to set up on Vercel:
 *      a) Add domain "admin.pageai.io" to the same Vercel project.
 *      b) Set env var ADMIN_HOSTNAME=admin.pageai.io.
 *      c) Redeploy — /admin is now only reachable from admin.pageai.io.
 *
 * 2. Response-time header (monitoring).
 *    Adds X-Response-Time: <ms>ms to every API response so you can track
 *    latency in Vercel Analytics / any log drain.
 */
export function middleware(request: NextRequest) {
    const start = Date.now();
    const { pathname } = request.nextUrl;

    // ── Admin isolation ──────────────────────────────────
    if (pathname.startsWith('/admin')) {
        const adminHostname = process.env.ADMIN_HOSTNAME;
        if (adminHostname) {
            const host = request.headers.get('host') || '';
            // Allow only the configured admin hostname
            if (host !== adminHostname && !host.startsWith('admin.')) {
                return new NextResponse(null, { status: 404 });
            }
        }
    }

    // ── Pass through + add response-time header ──────────
    const response = NextResponse.next();
    response.headers.set('X-Response-Time', `${Date.now() - start}ms`);
    return response;
}

export const config = {
    // Run on all routes except static files and _next internals
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
