/**
 * GET /api/billing/health
 *
 * Returns the configuration status of the billing system.
 * Use this to verify your Dodo setup before going live.
 *
 * Response fields:
 *   ok          — true if all required env vars are set and DB is reachable
 *   testMode    — true if DODO_TEST_MODE=true
 *   mockMode    — true if DODO_MOCK_PAYMENTS=true (local dev)
 *   database    — 'connected' | 'error'
 *   dodo.apiKey — 'set' | 'missing'
 *   dodo.webhookKey — 'set' | 'missing' (required for billing sync)
 *   dodo.plans  — object showing which plan product IDs are configured
 *   dodo.addons — object showing which add-on product IDs are configured
 *   setupGuide  — human-readable hints for unconfigured items
 */

import { NextResponse } from 'next/server';
import { getDodoConfigStatus } from '@/lib/dodo';
import { getAdminClient } from '@/lib/supabase';

export async function GET() {
    const config = getDodoConfigStatus();

    // Quick DB connectivity check
    let dbOk = false;
    let dbError: string | null = null;
    try {
        const admin = getAdminClient();
        const { error } = await admin.from('profiles').select('id').limit(1).maybeSingle();
        dbOk = !error;
        if (error) dbError = error.message;
    } catch (err: any) {
        dbError = err.message;
    }

    // Build setup hints
    const hints: string[] = [];
    if (!config.apiKeySet) hints.push('Set DODO_PAYMENTS_API_KEY in Vercel env vars (or DODO_TEST_PAYMENTS_API_KEY for test mode).');
    if (!config.webhookKeySet) hints.push('Set DODO_PAYMENTS_WEBHOOK_KEY so subscription events are synced from Dodo to your database.');
    Object.entries(config.plans).forEach(([plan, set]) => {
        if (!set) hints.push(`Set DODO_PRODUCT_${plan.toUpperCase()} to link the ${plan} plan to your Dodo product.`);
    });
    Object.entries(config.addons).forEach(([addon, set]) => {
        if (!set) hints.push(`Set DODO_ADDON_${addon.split('_')[0].toUpperCase()} to enable the ${addon} add-on pack.`);
    });
    if (!dbOk) hints.push(`Database connection failed: ${dbError}`);

    const allRequiredSet = config.apiKeySet && config.webhookKeySet && dbOk;

    return NextResponse.json({
        ok: allRequiredSet,
        testMode: config.testMode,
        mockMode: config.mockMode,
        database: dbOk ? 'connected' : 'error',
        dodo: {
            apiKey: config.apiKeySet ? 'set' : 'missing',
            webhookKey: config.webhookKeySet ? 'set' : 'missing',
            plans: Object.fromEntries(Object.entries(config.plans).map(([k, v]) => [k, v ? 'set' : 'missing'])),
            addons: Object.fromEntries(Object.entries(config.addons).map(([k, v]) => [k, v ? 'set' : 'missing'])),
        },
        setupHints: hints,
    });
}
