import { NextRequest, NextResponse } from 'next/server';
import { getDodoClientForUser, isTestMode } from '@/lib/dodo';
import { getAdminClient } from '@/lib/supabase';
import { validateEnv } from '@/lib/env';
import { getSessionUser } from '@/lib/auth-server';

/**
 * POST /api/billing/cancel — cancel active subscription and downgrade to free via webhook
 */
export async function POST(request: NextRequest) {
    const envErr = validateEnv('billing');
    if (envErr) return envErr;

    const user = await getSessionUser(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = getAdminClient();
    const { data: profile } = await admin
        .from('profiles')
        .select('email, plan, dodo_subscription_id')
        .eq('id', user.id)
        .single();

    if (!profile) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (profile.plan === 'free') {
        return NextResponse.json({ message: 'Already on free plan' });
    }

    if (!profile.dodo_subscription_id) {
        return NextResponse.json(
            { error: 'No active subscription found. Contact support if you believe this is an error.' },
            { status: 400 }
        );
    }

    if (profile.dodo_subscription_id.startsWith('mock_sub_')) {
        await admin.from('profiles').update({
            plan: 'free',
            dodo_subscription_id: null,
            monthly_message_limit: 50,
            max_pages_indexed: 100,
            max_chatbots: 1,
            api_access: false,
        }).eq('id', user.id);
        return NextResponse.json({ success: true, message: 'Subscription cancelled' });
    }

    try {
        const dodo = getDodoClientForUser(isTestMode());

        await (dodo as any).subscriptions.cancel(profile.dodo_subscription_id);

        return NextResponse.json({
            success: true,
            message: 'Subscription cancelled. Your plan will revert to free shortly.',
        });
    } catch (error: any) {
        console.error('[billing/cancel] error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to cancel subscription. Please contact support.' },
            { status: 500 }
        );
    }
}
