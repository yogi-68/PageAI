import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { getPlanByProductId, getMessageLimit, getPageLimit, getChatbotLimit, getAddonByProductId } from '@/lib/dodo';
import { logger } from '@/lib/logger';
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

        // ─── Idempotency: skip already-processed events ───
        const eventId = event.id || event.event_id || event.webhook_id;
        if (eventId) {
            const { error: insertErr } = await admin
                .from('webhook_events')
                .insert({ event_id: String(eventId), event_type: eventType });

            if (insertErr?.code === '23505') {
                // Duplicate key — event already processed
                logger.debug('webhook', `Duplicate event skipped`, { eventId });
                return NextResponse.json({ received: true, duplicate: true });
            }
        }

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
                logger.info('webhook', `User upgraded to ${resolvedPlanId}`, { userId, plan: resolvedPlanId });
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
                    logger.info('webhook', `User plan changed to ${resolvedPlanId}`, { userId, plan: resolvedPlanId });
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
                    logger.info('webhook', `Subscription renewed, usage reset`, { userId });
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
                    logger.warn('webhook', `User downgraded to free (${eventType})`, { userId });
                }
                break;
            }

            case 'payment.succeeded': {
                const metadata = data.metadata || {};
                const addonType = metadata.addon_type || metadata.addonId;
                const payUserId = metadata.userId;

                if (addonType && payUserId) {
                    // This is a prepaid message add-on payment
                    const addonId = getAddonByProductId(data.product_id) || addonType;
                    const messagesToAdd = parseInt(metadata.messages_to_add || '0', 10) ||
                        { '1000_messages': 1000, '5000_messages': 5000, '10000_messages': 10000 }[addonType as string] || 0;

                    if (messagesToAdd > 0) {
                        // Credit addon_message_balance
                        await admin.rpc('add_addon_balance', {
                            p_user_id: payUserId,
                            p_messages: messagesToAdd,
                        });

                        // Record the purchase in message_addons
                        await admin.from('message_addons').insert({
                            user_id: payUserId,
                            addon_type: addonType,
                            messages_purchased: messagesToAdd,
                            amount_paid_usd: data.total_amount ? (data.total_amount / 100).toFixed(2) : '0',
                            dodo_payment_id: data.payment_id || data.id || null,
                        });

                        logger.info('webhook', `Add-on credited: +${messagesToAdd} messages`, {
                            userId: payUserId,
                            addonId,
                            messages: messagesToAdd,
                        });
                    }
                } else {
                    logger.info('webhook', `Payment received: ${data.payment_id || data.id}`);
                }
                break;
            }

            case 'payment.failed': {
                const metadata = data.metadata || {};
                const userId = metadata.userId;
                if (userId) {
                    logger.warn('webhook', `Payment failed for user`, { userId, paymentId: data.payment_id });
                }
                break;
            }

            default:
                console.log(`ℹ️ Unhandled webhook event: ${eventType}`);
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        logger.error('webhook', 'Webhook handler failed', { error: error.message });
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 400 });
    }
}
