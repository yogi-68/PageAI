import { NextRequest, NextResponse } from 'next/server';
import { APIError } from 'dodopayments';
import { getDodoClientForUser, getAddonProductIdForUser, isMockMode, isTestMode, MESSAGE_ADDONS, AddonId } from '@/lib/dodo';
import { getAdminClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { validateEnv } from '@/lib/env';
import { getSessionUser } from '@/lib/auth-server';
import { getAppUrl } from '@/lib/app-url';

function dodoErrorMessage(err: unknown, fallback: string): string {
    if (err instanceof APIError) {
        const body = err.error as { message?: string; detail?: string; error?: string } | undefined;
        if (body?.message) return body.message;
        if (body?.detail) return body.detail;
        if (body?.error) return body.error;
        if (err.message) return err.message;
    }
    if (err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string') {
        return (err as { message: string }).message;
    }
    return fallback;
}

/** Credit message add-on balance and record purchase; expires at next billing cycle end */
async function creditAddonPurchase(
    admin: ReturnType<typeof getAdminClient>,
    userId: string,
    addonId: AddonId,
    expiresAt: string | null,
    paymentRef: string | null,
) {
    const addon = MESSAGE_ADDONS[addonId];
    if (!addon) return;

    const { error: rpcErr } = await admin.rpc('add_addon_balance', {
        p_user_id: userId,
        p_messages: addon.messages,
    });
    if (rpcErr) {
        throw new Error(`Failed to credit messages: ${rpcErr.message}`);
    }

    const { error: insertErr } = await admin.from('message_addons').insert({
        user_id: userId,
        addon_type: addonId,
        messages_purchased: addon.messages,
        amount_paid_usd: String(addon.price),
        dodo_payment_id: paymentRef,
        expires_at: expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
    if (insertErr) {
        throw new Error(`Failed to record purchase: ${insertErr.message}`);
    }
}

async function loadProfile(admin: ReturnType<typeof getAdminClient>, userId: string) {
    const withDates = await admin
        .from('profiles')
        .select('email, full_name, dodo_customer_id, plan, dodo_subscription_id, subscription_expires_at')
        .eq('id', userId)
        .single();

    if (!withDates.error && withDates.data) return withDates.data;

    const fallback = await admin
        .from('profiles')
        .select('email, full_name, dodo_customer_id, plan, dodo_subscription_id')
        .eq('id', userId)
        .single();

    if (fallback.error || !fallback.data) return null;
    return { ...fallback.data, subscription_expires_at: null as string | null };
}

/** Attach add-on to Dodo subscription without charging again (after a successful charge). */
async function syncAddonOnSubscription(
    dodo: ReturnType<typeof getDodoClientForUser>,
    subscriptionId: string,
    sub: { product_id: string; quantity?: number },
    addons: { addon_id: string; quantity: number }[],
    metadata: Record<string, string>,
) {
    await dodo.subscriptions.changePlan(subscriptionId, {
        product_id: sub.product_id,
        quantity: sub.quantity || 1,
        proration_billing_mode: 'do_not_bill',
        addons,
        metadata,
    });
}

export async function POST(request: NextRequest) {
    const envErr = validateEnv('billing');
    if (envErr) return envErr;

    const user = await getSessionUser(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let addonIdForLog = '';
    try {
        const body = await request.json();
        const { addonId } = body as { addonId: string };
        addonIdForLog = addonId;
        const userId = user.id;

        if (!addonId) {
            return NextResponse.json({ error: 'addonId is required' }, { status: 400 });
        }

        const addon = MESSAGE_ADDONS[addonId as AddonId];
        if (!addon) {
            return NextResponse.json({ error: 'Invalid add-on ID' }, { status: 400 });
        }

        if (isMockMode()) {
            const mockUrl = `${getAppUrl()}/api/billing/mock-complete?addonId=${addonId}&userId=${userId}`;
            return NextResponse.json({ success: true, url: mockUrl });
        }

        const admin = getAdminClient();
        const profile = await loadProfile(admin, userId);

        if (!profile) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (!profile.dodo_subscription_id || profile.plan === 'free') {
            return NextResponse.json(
                { error: 'Message add-ons require an active paid subscription. Upgrade your plan first, then purchase add-ons.' },
                { status: 400 },
            );
        }

        const useTestMode = isTestMode();
        const dodoAddonId = getAddonProductIdForUser(addonId, useTestMode);

        if (!dodoAddonId) {
            return NextResponse.json(
                { error: `Add-on not configured. Set DODO_ADDON_${addonId.split('_')[0].toUpperCase()} to your Dodo add-on ID (adn_...).` },
                { status: 503 },
            );
        }

        let dodo;
        try {
            dodo = getDodoClientForUser(useTestMode);
        } catch (clientErr: unknown) {
            const msg = clientErr instanceof Error ? clientErr.message : 'Dodo client init failed';
            logger.error('billing', 'Dodo client init failed for addon', { error: msg });
            return NextResponse.json(
                { error: 'Payment provider not configured. Please contact support.' },
                { status: 503 },
            );
        }

        let sub;
        try {
            sub = await dodo.subscriptions.retrieve(profile.dodo_subscription_id);
        } catch (retrieveErr: unknown) {
            const msg = dodoErrorMessage(retrieveErr, 'Could not load your subscription');
            logger.error('billing', 'Subscription retrieve failed for addon', { error: msg, subscriptionId: profile.dodo_subscription_id });
            return NextResponse.json(
                { error: 'Your subscription could not be verified. Please contact support or try upgrading again.' },
                { status: 502 },
            );
        }

        if (sub.status !== 'active' && sub.status !== 'pending') {
            return NextResponse.json(
                { error: `Your subscription is ${sub.status}. Add-ons can only be purchased on an active subscription.` },
                { status: 400 },
            );
        }

        const existingAddons = (sub.addons || []).map(a => ({
            addon_id: a.addon_id,
            quantity: a.quantity,
        }));

        const existingIdx = existingAddons.findIndex(a => a.addon_id === dodoAddonId);
        if (existingIdx >= 0) {
            existingAddons[existingIdx].quantity += 1;
        } else {
            existingAddons.push({ addon_id: dodoAddonId, quantity: 1 });
        }

        const expiresAt =
            profile.subscription_expires_at ||
            sub.next_billing_date ||
            null;

        const metadata = {
            userId,
            addonId,
            addon_type: addonId,
            messages_to_add: String(addon.messages),
            credited_in_api: 'true',
        };

        let paymentId: string | null = null;
        let chargeError = '';
        let changePlanError = '';

        // 1) Charge saved payment method (most reliable for one-time add-on purchase)
        try {
            const charge = await dodo.subscriptions.charge(profile.dodo_subscription_id, {
                product_price: Math.round(addon.price * 100),
                product_description: addon.label,
                metadata,
            });
            paymentId = charge.payment_id;
            logger.info('billing', 'Add-on charged via subscription.charge', { userId, addonId, paymentId });
        } catch (chargeErr: unknown) {
            chargeError = dodoErrorMessage(chargeErr, 'Charge failed');
            logger.warn('billing', 'subscription.charge for addon failed, trying changePlan', {
                error: chargeError,
                addonId,
                subscriptionId: profile.dodo_subscription_id,
            });

            // 2) Fallback: attach add-on via changePlan with immediate proration
            try {
                await dodo.subscriptions.changePlan(profile.dodo_subscription_id, {
                    product_id: sub.product_id,
                    quantity: sub.quantity || 1,
                    proration_billing_mode: 'difference_immediately',
                    addons: existingAddons,
                    metadata,
                    on_payment_failure: 'prevent_change',
                });
                logger.info('billing', 'Add-on attached via changePlan', { userId, addonId, dodoAddonId });
            } catch (changeErr: unknown) {
                changePlanError = dodoErrorMessage(changeErr, 'Failed to attach add-on');
                logger.error('billing', 'Both charge and changePlan failed for addon', {
                    chargeError,
                    changePlanError,
                    addonId,
                    subscriptionId: profile.dodo_subscription_id,
                });
                return NextResponse.json(
                    {
                        error: changePlanError || chargeError || 'Payment failed. Check that your subscription has a valid payment method on file.',
                    },
                    { status: 500 },
                );
            }
        }

        // 3) After charge, sync add-on on subscription without double-billing
        if (paymentId) {
            try {
                await syncAddonOnSubscription(dodo, profile.dodo_subscription_id, sub, existingAddons, metadata);
            } catch (syncErr: unknown) {
                logger.warn('billing', 'Add-on credited but Dodo subscription sync failed (non-fatal)', {
                    error: dodoErrorMessage(syncErr, 'sync failed'),
                    userId,
                    addonId,
                });
            }
        }

        await creditAddonPurchase(admin, userId, addonId as AddonId, expiresAt, paymentId);

        return NextResponse.json({
            success: true,
            immediate: true,
            message: `+${addon.messages.toLocaleString()} messages added until your next billing date.`,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to purchase add-on';
        logger.error('billing', 'Add-on checkout failed', { error: message, addonId: addonIdForLog });
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
