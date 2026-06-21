import { NextRequest, NextResponse } from 'next/server';
import { getDodoClientForUser, getAddonProductIdForUser, isMockMode, isTestMode, MESSAGE_ADDONS, AddonId } from '@/lib/dodo';
import { getAdminClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { validateEnv } from '@/lib/env';
import { getSessionUser } from '@/lib/auth-server';

export async function POST(request: NextRequest) {
    const envErr = validateEnv('billing');
    if (envErr) return envErr;

    const user = await getSessionUser(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let addonIdForLog = '';
    let productIdForLog = '';
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
            .select('email, full_name, dodo_customer_id')
            .eq('id', userId)
            .single();

        if (!profile) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const useTestMode = isTestMode();
        const productId = getAddonProductIdForUser(addonId, useTestMode);
        productIdForLog = productId || '';

        if (!productId) {
            return NextResponse.json(
                { error: `Add-on product not configured. Set DODO_ADDON_${addonId.split('_')[0].toUpperCase()} in environment variables.` },
                { status: 503 }
            );
        }

        let dodo;
        try {
            dodo = getDodoClientForUser(useTestMode);
        } catch (clientErr: any) {
            logger.error('billing', 'Dodo client init failed for addon', { error: clientErr.message });
            return NextResponse.json(
                { error: 'Payment provider not configured. Please contact support.' },
                { status: 503 }
            );
        }

        const session = await dodo.checkoutSessions.create({
            product_cart: [{ product_id: productId, quantity: 1 }],
            customer: {
                email: profile.email,
                name: profile.full_name || profile.email,
                ...(!useTestMode && profile.dodo_customer_id && { customer_id: profile.dodo_customer_id }),
            },
            billing_address: { country: 'US' },
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?addon_success=true&addon=${addonId}`,
            metadata: {
                userId,
                addonId,
                addon_type: addonId,
                messages_to_add: String(addon.messages),
            },
        });

        const url = session.checkout_url;
        if (!url) {
            return NextResponse.json(
                { error: 'Payment provider did not return a checkout URL. Please try again or contact support.' },
                { status: 502 }
            );
        }

        logger.info('billing', `Add-on checkout created`, {
            userId,
            addonId,
            messages: addon.messages,
            price: addon.price,
        });

        return NextResponse.json({ success: true, url });
    } catch (error: any) {
        const message = error?.message || 'Failed to create checkout';
        logger.error('billing', 'Add-on checkout failed', { error: message, addonId: addonIdForLog });
        const hint = productIdForLog.startsWith('adn_')
            ? ' Dodo add-on IDs (adn_*) are for subscriptions. Create one-time products (prod_*) for message packs and set DODO_ADDON_* to those product IDs.'
            : '';
        return NextResponse.json({ error: `${message}${hint}` }, { status: 500 });
    }
}
