import { NextRequest, NextResponse } from 'next/server';
import { getDodoClientForUser, getAddonProductIdForUser, isMockMode, isTestMode, MESSAGE_ADDONS, AddonId } from '@/lib/dodo';
import { getAdminClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { validateEnv } from '@/lib/env';
import { getSessionUser } from '@/lib/auth-server';

function dodoErrorMessage(err: unknown, fallback: string): string {
    if (err && typeof err === 'object' && 'error' in err) {
        const nested = (err as { error?: { message?: string } }).error?.message;
        if (nested) return nested;
    }
    if (err instanceof Error && err.message) return err.message;
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

    await admin.rpc('add_addon_balance', {
        p_user_id: userId,
        p_messages: addon.messages,
    });

    await admin.from('message_addons').insert({
        user_id: userId,
        addon_type: addonId,
        messages_purchased: addon.messages,
        amount_paid_usd: String(addon.price),
        dodo_payment_id: paymentRef,
        expires_at: expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
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
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            const mockUrl = `${appUrl}/api/billing/mock-complete?addonId=${addonId}&userId=${userId}`;
            return NextResponse.json({ success: true, url: mockUrl });
        }

        const admin = getAdminClient();
        const { data: profile } = await admin
            .from('profiles')
            .select('email, full_name, dodo_customer_id, plan, dodo_subscription_id, subscription_expires_at')
            .eq('id', userId)
            .single();

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

        const sub = await dodo.subscriptions.retrieve(profile.dodo_subscription_id);
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

        try {
            await dodo.subscriptions.changePlan(profile.dodo_subscription_id, {
                product_id: sub.product_id,
                quantity: sub.quantity || 1,
                proration_billing_mode: 'difference_immediately',
                addons: existingAddons,
                metadata,
            });
        } catch (changeErr: unknown) {
            const msg = dodoErrorMessage(changeErr, 'Failed to attach add-on');
            logger.error('billing', 'Subscription changePlan for addon failed', { error: msg, addonId, subscriptionId: profile.dodo_subscription_id });

            // Fallback: one-time charge on the subscription (saved payment method)
            try {
                const charge = await dodo.subscriptions.charge(profile.dodo_subscription_id, {
                    product_price: Math.round(addon.price * 100),
                    product_description: addon.label,
                    metadata,
                });
                await creditAddonPurchase(admin, userId, addonId as AddonId, expiresAt, charge.payment_id);
                logger.info('billing', `Add-on charged via subscription.charge`, { userId, addonId, paymentId: charge.payment_id });
                return NextResponse.json({
                    success: true,
                    immediate: true,
                    message: `+${addon.messages.toLocaleString()} messages added until your next billing date.`,
                });
            } catch (chargeErr: unknown) {
                const chargeMsg = dodoErrorMessage(chargeErr, msg);
                logger.error('billing', 'Subscription charge for addon failed', { error: chargeMsg, addonId, subscriptionId: profile.dodo_subscription_id });
                return NextResponse.json({ error: chargeMsg }, { status: 500 });
            }
        }

        await creditAddonPurchase(admin, userId, addonId as AddonId, expiresAt, null);

        logger.info('billing', `Add-on attached to subscription`, {
            userId,
            addonId,
            dodoAddonId,
            messages: addon.messages,
        });

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
