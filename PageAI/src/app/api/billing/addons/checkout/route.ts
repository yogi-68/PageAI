import { NextRequest, NextResponse } from 'next/server';
import { getDodoClient, MESSAGE_ADDONS, AddonId, isMockMode } from '@/lib/dodo';
import { getAdminClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';

// POST /api/billing/addons/checkout — purchase a prepaid message add-on
export async function POST(request: NextRequest) {
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
        if (!addon.productId) {
            // Mock mode: simulate add-on without Dodo
            if (isMockMode()) {
                const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
                return NextResponse.json({
                    success: true,
                    url: `${appUrl}/api/billing/mock-complete?addonId=${addonId}&userId=${userId}`,
                    mock: true,
                });
            }
            return NextResponse.json(
                { error: `Add-on product not configured. Set DODO_ADDON_${addonId.split('_')[0].toUpperCase()} in environment variables. Set DODO_MOCK_PAYMENTS=true to test without credentials.` },
                { status: 503 }
            );
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

        // One-time payment for an add-on (not a subscription)
        const payment = await (dodo as any).payments.create({
            billing: { city: '', country: 'US', state: '', street: '', zipcode: '' },
            customer: {
                email: profile.email,
                name: profile.full_name || profile.email,
                ...(profile.dodo_customer_id && { customer_id: profile.dodo_customer_id }),
            },
            product_cart: [{ product_id: addon.productId, quantity: 1 }],
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
