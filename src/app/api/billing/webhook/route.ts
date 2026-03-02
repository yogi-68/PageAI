import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { getPlanByProductId, getQuestionLimit } from '@/lib/dodo';
import crypto from 'crypto';

// Verify Dodo Payments webhook signature
function verifyWebhookSignature(body: string, signature: string | null, secret: string): boolean {
    if (!signature) return false;
    try {
        const hmac = crypto.createHmac('sha256', secret);
        hmac.update(body);
        const digest = hmac.digest('hex');
        return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
    } catch {
        return false;
    }
}

// POST /api/billing/webhook — Handle Dodo Payments webhooks
export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const signature = request.headers.get('webhook-signature') || request.headers.get('x-dodo-signature');
        const webhookSecret = process.env.DODO_PAYMENTS_WEBHOOK_KEY;

        // Verify webhook signature if secret is configured
        if (webhookSecret && !verifyWebhookSignature(body, signature, webhookSecret)) {
            console.error('Webhook signature verification failed');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const event = JSON.parse(body);
        const eventType = event.type || event.event_type;
        const data = event.data || event;

        const admin = getAdminClient();

        switch (eventType) {
            // Subscription activated / payment succeeded
            case 'subscription.active':
            case 'subscription.created': {
                const metadata = data.metadata || {};
                const userId = metadata.userId;
                const planId = metadata.planId;
                const productId = data.product_id;

                if (!userId) break;

                // Determine the plan from product ID or metadata
                const resolvedPlanId = planId || getPlanByProductId(productId) || 'basic';
                const questionLimit = getQuestionLimit(resolvedPlanId);

                await admin
                    .from('profiles')
                    .update({
                        plan: resolvedPlanId,
                        dodo_customer_id: data.customer?.customer_id || null,
                        dodo_subscription_id: data.subscription_id || null,
                        monthly_question_limit: questionLimit,
                    })
                    .eq('id', userId);

                console.log(`✅ User ${userId} upgraded to ${resolvedPlanId}`);
                break;
            }

            // Subscription updated (plan change)
            case 'subscription.updated': {
                const metadata = data.metadata || {};
                const userId = metadata.userId;
                const productId = data.product_id;

                if (!userId) {
                    // Try to find user by dodo_subscription_id
                    const subId = data.subscription_id;
                    if (subId) {
                        const { data: profile } = await admin
                            .from('profiles')
                            .select('id')
                            .eq('dodo_subscription_id', subId)
                            .single();
                        if (profile) {
                            const resolvedPlanId = getPlanByProductId(productId) || 'basic';
                            const questionLimit = getQuestionLimit(resolvedPlanId);
                            await admin
                                .from('profiles')
                                .update({
                                    plan: resolvedPlanId,
                                    monthly_question_limit: questionLimit,
                                })
                                .eq('id', profile.id);
                            console.log(`✅ User ${profile.id} plan updated to ${resolvedPlanId}`);
                        }
                    }
                    break;
                }

                const resolvedPlanId = getPlanByProductId(productId) || 'basic';
                const questionLimit = getQuestionLimit(resolvedPlanId);
                await admin
                    .from('profiles')
                    .update({
                        plan: resolvedPlanId,
                        monthly_question_limit: questionLimit,
                    })
                    .eq('id', userId);

                console.log(`✅ User ${userId} plan updated to ${resolvedPlanId}`);
                break;
            }

            // Subscription cancelled
            case 'subscription.cancelled':
            case 'subscription.canceled': {
                const metadata = data.metadata || {};
                let userId = metadata.userId;

                // If no userId in metadata, find by subscription ID
                if (!userId && data.subscription_id) {
                    const { data: profile } = await admin
                        .from('profiles')
                        .select('id')
                        .eq('dodo_subscription_id', data.subscription_id)
                        .single();
                    if (profile) userId = profile.id;
                }

                if (userId) {
                    await admin
                        .from('profiles')
                        .update({
                            plan: 'free',
                            dodo_subscription_id: null,
                            monthly_question_limit: 1000,
                        })
                        .eq('id', userId);
                    console.log(`⚠️ User ${userId} downgraded to free`);
                }
                break;
            }

            // Payment events
            case 'payment.succeeded':
            case 'payment.completed': {
                console.log(`💰 Payment received: ${data.payment_id || data.id}`);
                break;
            }

            case 'payment.failed': {
                const metadata = data.metadata || {};
                const userId = metadata.userId;
                if (userId) {
                    console.warn(`❌ Payment failed for user ${userId}`);
                }
                break;
            }

            default:
                console.log(`ℹ️ Unhandled webhook event: ${eventType}`);
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 400 }
        );
    }
}
