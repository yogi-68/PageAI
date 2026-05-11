/**
 * /api/integrations — CRUD for client API integrations.
 * Requires authenticated Supabase session (dashboard use only).
 * Credentials are always stored encrypted; never returned to the client.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import {
    getIntegrationsPublic,
    createIntegration,
    updateIntegration,
    type IntegrationType,
} from '@/lib/api-integrations';
import { getAdminClient } from '@/lib/supabase';

async function getSessionUser() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll: () => cookieStore.getAll() } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

// GET /api/integrations — list all integrations for the current user
export async function GET() {
    const user = await getSessionUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const integrations = await getIntegrationsPublic(user.id);
    return NextResponse.json({ integrations });
}

// POST /api/integrations — create a new integration
export async function POST(request: NextRequest) {
    const user = await getSessionUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: {
        name?: string;
        type?: IntegrationType;
        baseUrl?: string;
        credentials?: Record<string, string>;
        allowedEndpoints?: string[];
    };

    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { name, type, baseUrl, credentials, allowedEndpoints } = body;

    if (!name || !type || !baseUrl) {
        return NextResponse.json({ error: 'name, type, and baseUrl are required' }, { status: 400 });
    }

    const ALLOWED_TYPES: IntegrationType[] = ['shopify', 'woocommerce', 'custom'];
    if (!ALLOWED_TYPES.includes(type)) {
        return NextResponse.json({ error: `type must be one of: ${ALLOWED_TYPES.join(', ')}` }, { status: 400 });
    }

    // Validate URL format
    try { new URL(baseUrl); } catch {
        return NextResponse.json({ error: 'baseUrl must be a valid URL' }, { status: 400 });
    }

    const result = await createIntegration({
        userId: user.id,
        name,
        type,
        baseUrl: baseUrl.replace(/\/$/, ''),
        credentials: credentials || {},
        allowedEndpoints: allowedEndpoints || [],
    });

    if ('error' in result) {
        return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ id: result.id, message: 'Integration created' }, { status: 201 });
}

// PATCH /api/integrations — update an existing integration
export async function PATCH(request: NextRequest) {
    const user = await getSessionUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: {
        id?: string;
        name?: string;
        baseUrl?: string;
        credentials?: Record<string, string>;
        allowedEndpoints?: string[];
        isEnabled?: boolean;
    };

    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!body.id) {
        return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const { error } = await updateIntegration({
        id: body.id,
        userId: user.id,
        name: body.name,
        baseUrl: body.baseUrl,
        credentials: body.credentials,
        allowedEndpoints: body.allowedEndpoints,
        isEnabled: body.isEnabled,
    });

    if (error) {
        return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ message: 'Integration updated' });
}

// DELETE /api/integrations — delete an integration
export async function DELETE(request: NextRequest) {
    const user = await getSessionUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'id query parameter is required' }, { status: 400 });
    }

    const admin = getAdminClient();
    const { error } = await admin
        .from('client_integrations')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Integration deleted' });
}
