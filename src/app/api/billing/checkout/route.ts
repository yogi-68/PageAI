import { NextRequest, NextResponse } from 'next/server';
import { getDodoClient, PLANS, PlanId } from '@/lib/dodo';
import { getAdminClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const { planId, userId } = await request.json();

        if (!planId || !userId) {
            return NextResponse.json({ error: 'planId and userId are required' }, { status: 400 });
        }

        const plan = PLANS[planId as PlanId];
        if (!plan || !plan.productId) {
            return NextResponse.json({ error: 'Invalid plan or no product configured' }, { status: 400 });
        }

        const admin = getAdminClient();
        const { data: profile } = await admin
            .from('profiles')
            .select('email, full_name, dodo_customer_id')
            .eq('id', userId)
            .single();

        if (!profile) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const dodo = getDodoClient();
        const trialDays = plan.trialDays || 0;
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
            },
            product_id: plan.productId,
            quantity: 1,
            payment_link: true,
            ...(trialDays > 0 && { trial_period_days: trialDays }),
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?upgraded=true`,
            metadata: {
                userId,
                planId,
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
            url: (subscription as any).payment_link || (subscription as any).url || `/dashboard/billing?session=${subscription.subscription_id}`,
            subscriptionId: subscription.subscription_id,
        });
    } catch (error: any) {
        console.error('Dodo checkout error:', error);
        return NextResponse.json({ error: error.message || 'Failed to create checkout session' }, { status: 500 });
    }
}
