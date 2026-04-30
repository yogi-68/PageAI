import { NextRequest, NextResponse } from 'next/server';
import { getDodoClientForUser, isDevUser, getProductIdForUser, isMockMode, PLANS, PlanId, YEARLY_PRICES } from '@/lib/dodo';
import { getAdminClient } from '@/lib/supabase';
import { validateEnv } from '@/lib/env';

export async function POST(request: NextRequest) {
    const envErr = validateEnv('billing');
    if (envErr) return envErr;

    try {
        const { planId, userId, billing = 'monthly' } = await request.json() as {
            planId: string;
            userId: string;
            billing?: 'monthly' | 'annual';
        };

        if (!planId || !userId) {
            return NextResponse.json({ error: 'planId and userId are required' }, { status: 400 });
        }

        const plan = PLANS[planId as PlanId];
        if (!plan) {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
        }

        const isAnnual = billing === 'annual';

        // ── Mock mode: skip Dodo entirely ──────────────────────────────────────
        if (isMockMode()) {
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            const mockUrl = `${appUrl}/api/billing/mock-complete?planId=${planId}&userId=${userId}&billing=${billing}`;
            return NextResponse.json({ success: true, url: mockUrl });
        }

        // Fetch user profile first — email determines whether to use sandbox or live payments
        const admin = getAdminClient();
        const { data: profile } = await admin
            .from('profiles')
            .select('email, full_name, dodo_customer_id, has_used_trial')
            .eq('id', userId)
            .single();

        if (!profile) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Developer email → Dodo sandbox; everyone else → live payments
        const userTestMode = isDevUser(profile.email);
        const productId = getProductIdForUser(planId, isAnnual, userTestMode);

        console.log('[billing/checkout] creating subscription', { productId, planId, userTestMode });

        if (!productId) {
            const missing = isAnnual
                ? `DODO_PRODUCT_${planId.toUpperCase()}_YEARLY`
                : `DODO_PRODUCT_${planId.toUpperCase()}`;
            return NextResponse.json(
                { error: `Product not configured. Set ${missing}${userTestMode ? ' or DODO_TEST_PRODUCT_ID' : ''} in environment variables.` },
                { status: 503 }
            );
        }

        const dodo = getDodoClientForUser(userTestMode);

        const willGetTrial = !isAnnual && plan.trialDays > 0 && !profile.has_used_trial;
        const trialDays = willGetTrial ? plan.trialDays : 0;

        if (willGetTrial) {
            await admin
                .from('profiles')
                .update({ has_used_trial: true })
                .eq('id', userId)
                .eq('has_used_trial', false); // idempotent: only update if still false
        }

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
                // In test mode the stored customer_id is from the live environment — skip it
                ...(!userTestMode && profile.dodo_customer_id && { customer_id: profile.dodo_customer_id }),
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

        // Only persist customer_id when in live mode (test IDs must not overwrite live IDs)
        if (!userTestMode && subscription.customer?.customer_id && !profile.dodo_customer_id) {
            await admin
                .from('profiles')
                .update({ dodo_customer_id: subscription.customer.customer_id })
                .eq('id', userId);
        }

        return NextResponse.json({
            success: true,
            url: (subscription as any).payment_link || (subscription as any).url ||
                `/dashboard/billing?session=${subscription.subscription_id}`,
            subscriptionId: subscription.subscription_id,
        });
    } catch (error: any) {
        console.error('Dodo checkout error:', error);
        return NextResponse.json({ error: error.message || 'Failed to create checkout session' }, { status: 500 });
    }
}
