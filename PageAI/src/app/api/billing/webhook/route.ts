import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { getPlanByProductId, getMessageLimit, getPageLimit, getChatbotLimit, getAddonByProductId, isTestMode, isMockMode } from '@/lib/dodo';
import { logger } from '@/lib/logger';
import { trackEvent } from '@/lib/analytics';
import { recordWebhookFailure } from '@/lib/alerts';
import crypto from 'crypto';

// Dodo Payments uses Svix-style webhook signatures
// Header: webhook-signature = "v1,<base64_sig>"
// Signed content: "${webhook_id}.${webhook_timestamp}.${body}"
// Secret: base64-decoded webhook key (strip "whsec_" prefix)
function verifyWebhookSignature(
    body: string,
    headers: { id: string | null; timestamp: string | null; signature: string | null },
    secret: string
): boolean {
    if (!headers.id || !headers.timestamp || !headers.signature) return false;
    try {
        // Strip "whsec_" prefix if present, then base64-decode the secret
        const secretBytes = Buffer.from(
            secret.startsWith('whsec_') ? secret.slice(6) : secret,
            'base64'
        );
        const signedContent = `${headers.id}.${headers.timestamp}.${body}`;
        const expectedSig = crypto
            .createHmac('sha256', secretBytes)
            .update(signedContent)
            .digest('base64');

        // signature header may have multiple sigs: "v1,sig1 v1,sig2"
        const signatures = headers.signature.split(' ');
        for (const versionedSig of signatures) {
            const [version, sig] = versionedSig.split(',');
            if (version === 'v1') {
                if (crypto.timingSafeEqual(Buffer.from(expectedSig), Buffer.from(sig))) {
                    return true;
                }
            }
        }
        return false;
    } catch {
        return false;
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const webhookSecret = process.env.DODO_PAYMENTS_WEBHOOK_KEY;

        // Skip signature check in mock mode (no real Dodo secret) or test mode
        const skipSigCheck = isMockMode() || (isTestMode() && !webhookSecret);

        // Svix-style headers used by Dodo Payments
        const whHeaders = {
            id: request.headers.get('webhook-id'),
            timestamp: request.headers.get('webhook-timestamp'),
            signature: request.headers.get('webhook-signature'),
        };

        if (!skipSigCheck && webhookSecret && !verifyWebhookSignature(body, whHeaders, webhookSecret)) {
            console.error('Webhook signature verification failed');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        // Dodo WebhookPayload: { type, data, business_id, timestamp }
        const event = JSON.parse(body);
        const eventType: string = event.type;
        const data = event.data;
        const admin = getAdminClient();

        // ─── Idempotency: skip already-processed events ───
        const eventId = whHeaders.id || event.id;
        if (eventId) {
            const { error: insertErr } = await admin
                .from('webhook_events')
                .insert({ event_id: String(eventId), event_type: eventType });

            if (insertErr?.code === '23505') {
                logger.debug('webhook', `Duplicate event skipped`, { eventId });
                return NextResponse.json({ received: true, duplicate: true });
            }
        }

        switch (eventType) {
            // ─── Subscription activated (new or after trial) ───
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
                    // Belt-and-suspenders: mark trial used on activation too.
                    // Checkout already sets this, but this catches edge cases
                    // (e.g. direct Dodo API subscriptions, admin-created subs).
                    has_used_trial: true,
                }).eq('id', userId);
                logger.info('webhook', `User upgraded to ${resolvedPlanId}`, { userId, plan: resolvedPlanId });
                break;
            }

            // ─── Plan changed (upgrade/downgrade) ───
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

            // ─── Subscription renewed (monthly billing) ───
            case 'subscription.renewed': {
                const metadata = data.metadata || {};
                let userId = metadata.userId;
                if (!userId && data.subscription_id) {
                    const { data: profile } = await admin.from('profiles').select('id').eq('dodo_subscription_id', data.subscription_id).single();
                    if (profile) userId = profile.id;
                }
                if (userId) {
                    await admin.from('profiles').update({
                        monthly_message_count: 0,
                        usage_reset_at: new Date().toISOString(),
                    }).eq('id', userId);
                    logger.info('webhook', `Subscription renewed, usage reset`, { userId });
                }
                break;
            }

            // ─── Subscription cancelled / expired / on hold ───
            case 'subscription.cancelled':
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

            case 'subscription.on_hold':
            case 'subscription.failed': {
                const metadata = data.metadata || {};
                let userId = metadata.userId;
                if (!userId && data.subscription_id) {
                    const { data: profile } = await admin.from('profiles').select('id').eq('dodo_subscription_id', data.subscription_id).single();
                    if (profile) userId = profile.id;
                }
                if (userId) {
                    // Payment failed — flag account as overdue without fully downgrading yet.
                    // Dodo will retry payment and send subscription.cancelled if all retries fail.
                    // We keep the plan active during the retry window but note the issue.
                    logger.warn('webhook', `Subscription ${eventType} — payment issue, will be resolved by Dodo retry`, {
                        userId,
                        subscriptionId: data.subscription_id,
                        eventType,
                    });
                    recordWebhookFailure(eventType, data.subscription_id);
                }
                break;
            }

            // ─── One-time payment succeeded (add-on packs) ───
            case 'payment.succeeded': {
                // Payment.metadata contains our custom fields
                const metadata = data.metadata || {};
                const addonType = metadata.addon_type || metadata.addonId;
                const payUserId = metadata.userId;

                if (addonType && payUserId) {
                    // Get product_id from product_cart (Dodo Payment type)
                    const productId = data.product_cart?.[0]?.product_id || '';
                    const addonId = getAddonByProductId(productId) || addonType;
                    const messagesToAdd = parseInt(metadata.messages_to_add || '0', 10) ||
                        { '1000_messages': 1000, '5000_messages': 5000, '10000_messages': 10000 }[addonType as string] || 0;

                    if (messagesToAdd > 0) {
                        await admin.rpc('add_addon_balance', {
                            p_user_id: payUserId,
                            p_messages: messagesToAdd,
                        });

                        await admin.from('message_addons').insert({
                            user_id: payUserId,
                            addon_type: addonType,
                            messages_purchased: messagesToAdd,
                            amount_paid_usd: data.total_amount ? (data.total_amount / 100).toFixed(2) : '0',
                            dodo_payment_id: data.payment_id || null,
                            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                        });

                        trackEvent('addon.purchased', {
                            addonType,
                            messages: messagesToAdd,
                            amountUsd: data.total_amount ? data.total_amount / 100 : 0,
                        }, payUserId);

                        logger.info('webhook', `Add-on credited: +${messagesToAdd} messages`, {
                            userId: payUserId,
                            addonId,
                            messages: messagesToAdd,
                        });
                    }
                } else {
                    logger.info('webhook', `Payment received: ${data.payment_id}`);
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
                logger.debug('webhook', `Unhandled event: ${eventType}`);
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        recordWebhookFailure('unknown', error);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 400 });
    }
}
