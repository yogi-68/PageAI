import { NextRequest, NextResponse } from 'next/server';
import { getDodoClientForUser, getProductIdForUser, isMockMode, isTestMode, PLANS, PlanId, YEARLY_PRICES } from '@/lib/dodo';
import { getAdminClient } from '@/lib/supabase';
import { validateEnv } from '@/lib/env';
import { getSessionUser } from '@/lib/auth-server';

export async function POST(request: NextRequest) {
    const envErr = validateEnv('billing');
    if (envErr) return envErr;

    const user = await getSessionUser(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { planId, billing = 'monthly' } = await request.json() as {
            planId: string;
            billing?: 'monthly' | 'annual';
        };

        const userId = user.id;

        if (!planId) {
            return NextResponse.json({ error: 'planId is required' }, { status: 400 });
        }

        const plan = PLANS[planId as PlanId];
        if (!plan) {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
        }

        const isAnnual = billing === 'annual';

        if (isMockMode()) {
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            const mockUrl = `${appUrl}/api/billing/mock-complete?planId=${planId}&userId=${userId}&billing=${billing}`;
            return NextResponse.json({ success: true, url: mockUrl });
        }

        const admin = getAdminClient();
        const { data: profile } = await admin
            .from('profiles')
            .select('email, full_name, dodo_customer_id, has_used_trial')
            .eq('id', userId)
            .single();

        if (!profile) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const useTestMode = isTestMode();
        const productId = getProductIdForUser(planId, isAnnual, useTestMode);

        console.log('[billing/checkout] creating subscription', { productId, planId, useTestMode });

        if (!productId) {
            const missing = isAnnual
                ? `DODO_PRODUCT_${planId.toUpperCase()}_YEARLY`
                : `DODO_PRODUCT_${planId.toUpperCase()}`;
            return NextResponse.json(
                { error: `Product not configured. Set ${missing} in environment variables.` },
                { status: 503 }
            );
        }

        const dodo = getDodoClientForUser(useTestMode);

        const willGetTrial = !isAnnual && plan.trialDays > 0 && !profile.has_used_trial;
        const trialDays = willGetTrial ? plan.trialDays : 0;

        const subscription = await dodo.subscriptions.create({
            billing: {
                city: '',
                country: 'US',
                state: '',
                street: '',
                zipcode: '',
            },
            customer: {
                email: profile.email,
                name: profile.full_name || profile.email,
                ...(!useTestMode && profile.dodo_customer_id && { customer_id: profile.dodo_customer_id }),
            },
            product_id: productId,
            quantity: 1,
            payment_link: true,
            ...(trialDays > 0 && { trial_period_days: trialDays }),
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?upgraded=true&billing=${billing}`,
            metadata: {
                userId,
                planId,
                billing,
                ...(isAnnual && { yearly_price: String(YEARLY_PRICES[planId] || 0) }),
            },
        });

        if (!useTestMode && subscription.customer?.customer_id && !profile.dodo_customer_id) {
            await admin
                .from('profiles')
                .update({ dodo_customer_id: subscription.customer.customer_id })
                .eq('id', userId);
        }

        const paymentUrl = (subscription as any).payment_link || (subscription as any).url;
        if (!paymentUrl) {
            console.error('[billing/checkout] No payment URL from Dodo', { subscriptionId: subscription.subscription_id });
            return NextResponse.json(
                { error: 'Payment provider did not return a checkout URL. Please try again or contact support.' },
                { status: 502 }
            );
        }

        return NextResponse.json({
            success: true,
            url: paymentUrl,
            subscriptionId: subscription.subscription_id,
        });
    } catch (error: any) {
        console.error('Dodo checkout error:', error);
        return NextResponse.json({ error: error.message || 'Failed to create checkout session' }, { status: 500 });
    }
}
