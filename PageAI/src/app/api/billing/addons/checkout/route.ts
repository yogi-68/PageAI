import { NextRequest, NextResponse } from 'next/server';
import { getDodoClientForUser, isDevUser, getAddonProductIdForUser, isMockMode, MESSAGE_ADDONS, AddonId } from '@/lib/dodo';
import { getAdminClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { validateEnv } from '@/lib/env';

// POST /api/billing/addons/checkout — purchase a prepaid message add-on
export async function POST(request: NextRequest) {
    const envErr = validateEnv('billing');
    if (envErr) return envErr;

    try {
        const body = await request.json();
        const { addonId, userId } = body as { addonId: string; userId: string };

        if (!addonId || !userId) {
            return NextResponse.json({ error: 'addonId and userId are required' }, { status: 400 });
        }

        const addon = MESSAGE_ADDONS[addonId as AddonId];
        if (!addon) {
            return NextResponse.json({ error: 'Invalid add-on ID' }, { status: 400 });
        }

        // ── Mock mode: skip Dodo entirely ──────────────────────────────────────
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

        // Developer email → Dodo sandbox; everyone else → live payments
        const userTestMode = isDevUser(profile.email);
        const productId = getAddonProductIdForUser(addonId, userTestMode);

        if (!productId) {
            return NextResponse.json(
                { error: `Add-on product not configured. Set DODO_ADDON_${addonId.split('_')[0].toUpperCase()}${userTestMode ? ' or DODO_TEST_PRODUCT_ID' : ''} in environment variables.` },
                { status: 503 }
            );
        }

        let dodo;
        try {
            dodo = getDodoClientForUser(userTestMode);
        } catch (clientErr: any) {
            logger.error('billing', 'Dodo client init failed for addon', { error: clientErr.message });
            return NextResponse.json(
                { error: 'Payment provider not configured. Please contact support.' },
                { status: 503 }
            );
        }

        // One-time payment for an add-on (not a subscription)
        const payment = await (dodo as any).payments.create({
            customer: {
                email: profile.email,
                name: profile.full_name || profile.email,
                // In test mode the stored customer_id is from the live environment — skip it
                ...(!userTestMode && profile.dodo_customer_id && { customer_id: profile.dodo_customer_id }),
            },
            product_cart: [{ product_id: productId, quantity: 1 }],
            payment_link: true,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?addon_success=true&addon=${addonId}`,
            metadata: {
                userId,
                addonId,
                addon_type: addonId,
                messages_to_add: String(addon.messages),
            },
        });

        const url = payment.payment_link || payment.url;
        if (!url) {
            throw new Error('No payment URL returned from Dodo');
        }

        logger.info('billing', `Add-on checkout created`, {
            userId,
            addonId,
            messages: addon.messages,
            price: addon.price,
        });

        return NextResponse.json({ success: true, url });
    } catch (error: any) {
        logger.error('billing', 'Add-on checkout failed', { error: error.message });
        return NextResponse.json({ error: error.message || 'Failed to create checkout' }, { status: 500 });
    }
}
