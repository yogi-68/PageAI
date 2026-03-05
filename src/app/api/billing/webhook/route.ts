import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { getPlanByProductId, getMessageLimit, getPageLimit, getChatbotLimit } from '@/lib/dodo';
import crypto from 'crypto';

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

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const signature = request.headers.get('webhook-signature') || request.headers.get('x-dodo-signature');
        const webhookSecret = process.env.DODO_PAYMENTS_WEBHOOK_KEY;

        if (webhookSecret && !verifyWebhookSignature(body, signature, webhookSecret)) {
            console.error('Webhook signature verification failed');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const event = JSON.parse(body);
        const eventType = event.type || event.event_type;
        const data = event.data || event;
        const admin = getAdminClient();

        switch (eventType) {
            case 'subscription.active': {
                const metadata = data.metadata || {};
                const userId = metadata.userId;
                const planId = metadata.planId;
                const productId = data.product_id;
                if (!userId) break;

                const resolvedPlanId = planId || getPlanByProductId(productId) || 'starter';
                await admin.from('profiles').update({
                    plan: resolvedPlanId,
                    dodo_customer_id: data.customer?.customer_id || null,
                    dodo_subscription_id: data.subscription_id || null,
                    monthly_message_limit: getMessageLimit(resolvedPlanId),
                    max_pages_indexed: getPageLimit(resolvedPlanId),
                    max_chatbots: getChatbotLimit(resolvedPlanId),
                    api_access: ['growth', 'scale', 'enterprise'].includes(resolvedPlanId),
                }).eq('id', userId);
                console.log(`✅ User ${userId} upgraded to ${resolvedPlanId}`);
                break;
            }

            case 'subscription.plan_changed': {
                const metadata = data.metadata || {};
                let userId = metadata.userId;
                const productId = data.product_id;

                if (!userId && data.subscription_id) {
                    const { data: profile } = await admin.from('profiles').select('id').eq('dodo_subscription_id', data.subscription_id).single();
                    if (profile) userId = profile.id;
                }
                if (userId) {
                    const resolvedPlanId = getPlanByProductId(productId) || 'starter';
                    await admin.from('profiles').update({
                        plan: resolvedPlanId,
                        monthly_message_limit: getMessageLimit(resolvedPlanId),
                        max_pages_indexed: getPageLimit(resolvedPlanId),
                        max_chatbots: getChatbotLimit(resolvedPlanId),
                        api_access: ['growth', 'scale', 'enterprise'].includes(resolvedPlanId),
                    }).eq('id', userId);
                    console.log(`✅ User ${userId} plan changed to ${resolvedPlanId}`);
                }
                break;
            }

            case 'subscription.renewed': {
                const metadata = data.metadata || {};
                let userId = metadata.userId;
                if (!userId && data.subscription_id) {
                    const { data: profile } = await admin.from('profiles').select('id').eq('dodo_subscription_id', data.subscription_id).single();
                    if (profile) userId = profile.id;
                }
                if (userId) {
                    await admin.from('profiles').update({ monthly_message_count: 0 }).eq('id', userId);
                    console.log(`🔄 User ${userId} subscription renewed, usage reset`);
                }
                break;
            }

            case 'subscription.cancelled':
            case 'subscription.canceled':
            case 'subscription.expired': {
                const metadata = data.metadata || {};
                let userId = metadata.userId;
                if (!userId && data.subscription_id) {
                    const { data: profile } = await admin.from('profiles').select('id').eq('dodo_subscription_id', data.subscription_id).single();
                    if (profile) userId = profile.id;
                }
                if (userId) {
                    await admin.from('profiles').update({
                        plan: 'free',
                        dodo_subscription_id: null,
                        monthly_message_limit: 50,
                        max_pages_indexed: 100,
                        max_chatbots: 1,
                        api_access: false,
                    }).eq('id', userId);
                    console.log(`⚠️ User ${userId} downgraded to free (${eventType})`);
                }
                break;
            }

            case 'payment.succeeded': {
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
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 400 });
    }
}
