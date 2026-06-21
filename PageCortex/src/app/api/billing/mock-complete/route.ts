/**
 * Mock billing complete handler — only active when DODO_MOCK_PAYMENTS=true (non-production)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { getMessageLimit, getPageLimit, getChatbotLimit, isMockMode } from '@/lib/dodo';
import { validateEnv } from '@/lib/env';
import { getSessionUser } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
    if (!isMockMode()) {
        return NextResponse.json({ error: 'Mock mode is not enabled' }, { status: 403 });
    }

    const user = await getSessionUser(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const envErr = validateEnv('supabase');
    if (envErr) return envErr;

    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('planId');
    const addonId = searchParams.get('addonId');
    const userId = user.id;
    const billing = searchParams.get('billing') || 'monthly';

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const admin = getAdminClient();

    try {
        if (planId && planId !== 'free') {
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
