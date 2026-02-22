import { NextRequest, NextResponse } from "next/server";

// POST /api/billing/checkout - Create a Stripe checkout session
export async function POST(request: NextRequest) {
    try {
        const { planId, userId } = await request.json();

        if (!planId || !userId) {
            return NextResponse.json(
                { error: "planId and userId are required" },
                { status: 400 }
            );
        }

        // In production, this would:
        // 1. Look up the plan's Stripe Price ID
        //    const plan = PLANS[planId];
        //    if (!plan?.priceId) throw new Error('Invalid plan');
        // 2. Get or create Stripe customer for the user
        //    const customer = await stripe.customers.create({ email, metadata: { userId } });
        // 3. Create checkout session
        //    const session = await stripe.checkout.sessions.create({
        //      customer: customer.id,
        //      payment_method_types: ['card'],
        //      line_items: [{ price: plan.priceId, quantity: 1 }],
        //      mode: 'subscription',
        //      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
        //      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
        //      metadata: { userId, planId },
        //    });
        // 4. Return the session URL

        return NextResponse.json({
            success: true,
            url: `/dashboard/billing?session=simulated`,
            sessionId: `cs_${Date.now()}`,
        });
    } catch (error) {
        console.error("Billing error:", error);
        return NextResponse.json(
            { error: "Failed to create checkout session" },
            { status: 500 }
        );
    }
}
