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
    // Collect all missing required keys for the requested groups
    const keys = [...new Set(groups.flatMap(g => REQUIRED[g] ?? []))];
    const missing = keys.filter(k => !process.env[k]);

    // Also check the Dodo API key for billing group — must happen regardless of
    // whether other keys are missing (fixed: removed early-return before this check)
    const extraMissing: string[] = [];
    if (groups.includes('billing')) {
        const isMock = process.env.DODO_MOCK_PAYMENTS === 'true';
        const isTest = process.env.DODO_TEST_MODE === 'true';

        if (!isMock) {
            // In test mode we need the test key; in production we need the live key
            const requiredKey = isTest ? 'DODO_TEST_PAYMENTS_API_KEY' : 'DODO_PAYMENTS_API_KEY';
            if (!process.env[requiredKey]) {
                extraMissing.push(requiredKey);
                if (!isTest) {
                    // Also hint about test mode as an alternative
                    extraMissing.push(
                        '(or set DODO_TEST_MODE=true + DODO_TEST_PAYMENTS_API_KEY for sandbox testing, ' +
                        'or DODO_MOCK_PAYMENTS=true for local dev without Dodo)'
                    );
                }
            }
        }
    }

    const allMissing = [...missing, ...extraMissing];
    if (allMissing.length === 0) return null;

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
