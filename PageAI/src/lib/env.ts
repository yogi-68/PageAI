import { NextResponse } from 'next/server';

/**
 * Returns a 503 NextResponse if any critical env vars are missing,
 * so routes surface a clear error instead of an opaque 500.
 *
 * Usage at the top of any API handler:
 *   const err = validateEnv('billing');
 *   if (err) return err;
 */

const REQUIRED: Record<string, string[]> = {
    supabase: [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
    ],
    billing: [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
        'NEXT_PUBLIC_APP_URL',
    ],
    openai: [
        'OPENAI_API_KEY',
    ],
};

export function validateEnv(...groups: Array<keyof typeof REQUIRED>): NextResponse | null {
    const keys = [...new Set(groups.flatMap(g => REQUIRED[g] ?? []))];
    const missing = keys.filter(k => !process.env[k]);
    if (missing.length === 0) return null;

    // In test / mock mode the Dodo key isn't required; otherwise flag it
    const dodoBilling = !process.env.DODO_MOCK_PAYMENTS && !process.env.DODO_TEST_MODE;
    const dodoKey = dodoBilling
        ? (!process.env.DODO_PAYMENTS_API_KEY ? ['DODO_PAYMENTS_API_KEY'] : [])
        : (!process.env.DODO_TEST_PAYMENTS_API_KEY && process.env.DODO_TEST_MODE === 'true')
            ? ['DODO_TEST_PAYMENTS_API_KEY']
            : [];

    const allMissing = [...missing, ...dodoKey];

    return NextResponse.json(
        {
            error: 'Server misconfiguration — missing environment variables',
            missing: allMissing,
            hint: 'Add these to Vercel → Project → Settings → Environment Variables and redeploy.',
        },
        { status: 503 },
    );
}

/** Quick boolean check — use when you just need to know, not return a response. */
export function hasRequiredEnv(...groups: Array<keyof typeof REQUIRED>): boolean {
    return validateEnv(...groups) === null;
}
