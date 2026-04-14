/**
 * Mock billing complete handler — only active when DODO_MOCK_PAYMENTS=true
 *
 * Simulates the webhook flow entirely in-app so developers can test the full
 * billing pipeline (plan upgrades, add-ons, usage limits) without a Dodo account.
 *
 * Flow (mock mode):
 *   1. User clicks "Upgrade" on billing page
 *   2. /api/billing/checkout returns { url: '/api/billing/mock-complete?planId=starter&userId=...' }
 *   3. This route applies the plan change to the DB (same as webhook would)
 *   4. Redirects to /dashboard/billing?mock_upgraded=true
 *
 * NEVER reachable in production — returns 403 if DODO_MOCK_PAYMENTS is not 'true'.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { getMessageLimit, getPageLimit, getChatbotLimit, isMockMode } from '@/lib/dodo';

export async function GET(request: NextRequest) {
    if (!isMockMode()) {
        return NextResponse.json({ error: 'Mock mode is not enabled' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('planId');
    const addonId = searchParams.get('addonId');
    const userId = searchParams.get('userId');
    const billing = searchParams.get('billing') || 'monthly';

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (!userId) {
        return NextResponse.redirect(`${appUrl}/dashboard/billing?error=missing_userId`);
    }

    const admin = getAdminClient();

    try {
        if (planId && planId !== 'free') {
            // Simulate subscription activation
            const resolved = planId as string;
            await admin.from('profiles').update({
                plan: resolved,
                dodo_subscription_id: `mock_sub_${Date.now()}`,
                monthly_message_limit: getMessageLimit(resolved),
                max_pages_indexed: getPageLimit(resolved),
                max_chatbots: getChatbotLimit(resolved),
                api_access: ['growth', 'scale', 'enterprise'].includes(resolved),
                has_used_trial: true,
            }).eq('id', userId);

            return NextResponse.redirect(
                `${appUrl}/dashboard/billing?mock_upgraded=${resolved}&billing=${billing}`
            );
        }

        if (addonId) {
            const ADDON_MESSAGES: Record<string, number> = {
                '1000_messages': 1000,
                '5000_messages': 5000,
                '10000_messages': 10000,
            };
            const messages = ADDON_MESSAGES[addonId] || 0;
            if (messages > 0) {
                await admin.rpc('add_addon_balance', { p_user_id: userId, p_messages: messages });
            }
            return NextResponse.redirect(
                `${appUrl}/dashboard/billing?mock_addon=${addonId}&messages=${messages}`
            );
        }

        return NextResponse.redirect(`${appUrl}/dashboard/billing?error=invalid_mock`);
    } catch (err: any) {
        console.error('Mock complete error:', err);
        return NextResponse.redirect(`${appUrl}/dashboard/billing?error=${encodeURIComponent(err.message)}`);
    }
}
