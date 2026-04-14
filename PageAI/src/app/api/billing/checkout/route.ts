import { NextRequest, NextResponse } from 'next/server';
import { getDodoClient, PLANS, PlanId, YEARLY_PRODUCT_IDS, YEARLY_PRICES, isMockMode, isTestMode } from '@/lib/dodo';
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

        // Annual billing: use yearly product (full year charged upfront)
        const isAnnual = billing === 'annual';
        const productId = isAnnual
            ? (YEARLY_PRODUCT_IDS[planId] || null)
            : plan.productId;

        // ─── Mock mode (local dev, no Dodo credentials) ───────────────
        if (isMockMode()) {
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            return NextResponse.json({
                success: true,
                url: `${appUrl}/api/billing/mock-complete?planId=${planId}&userId=${userId}&billing=${billing}`,
                mock: true,
            });
        }

        if (!productId) {
            const missing = isAnnual
                ? `DODO_PRODUCT_${planId.toUpperCase()}_YEARLY`
                : `DODO_PRODUCT_${planId.toUpperCase()}`;
            return NextResponse.json(
                { error: `${isAnnual ? 'Yearly' : 'Monthly'} product not configured. Set ${missing} in environment variables.` },
                { status: 503 }
            );
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

        const dodo = getDodoClient();
        // Trial rules:
        // 1. Annual plans never get a trial (they already save ~20%)
        // 2. Scale/Enterprise plans have trialDays=0 (serious users; abuse risk)
        // 3. Starter/Growth get 7 days — ONLY if user has never been given a trial before
        //    We set has_used_trial=true HERE (at checkout) so even if payment fails later
        //    the user cannot re-subscribe to get a second trial.
        const willGetTrial = !isAnnual && plan.trialDays > 0 && !profile.has_used_trial;
        const trialDays = willGetTrial ? plan.trialDays : 0;

        // Mark trial as used immediately — prevents abuse via abandoned checkout or failed payment
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
                ...(profile.dodo_customer_id && { customer_id: profile.dodo_customer_id }),
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

        if (subscription.customer?.customer_id && !profile.dodo_customer_id) {
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
