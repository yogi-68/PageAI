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
import { formatOperationalError, checkIntegrationLimit, createUsageLimitError } from '@/lib/operational-errors';

async function getSessionUser(request?: NextRequest) {
    if (request) {
        const authHeader = request.headers.get('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const supabaseAuth = createServerClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                { cookies: { getAll: () => [] } }
            );
            const { data: { user } } = await supabaseAuth.auth.getUser(token);
            if (user) return user;
        }
    }

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
export async function GET(request: NextRequest) {
    try {
        const user = await getSessionUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const integrations = await getIntegrationsPublic(user.id);
        return NextResponse.json({ integrations });
    } catch (error) {
        console.error('[PageCortex] Error in GET /api/integrations:', error);
        return NextResponse.json({ integrations: [] });
    }
}

// POST /api/integrations — create a new integration
export async function POST(request: NextRequest) {
    const user = await getSessionUser(request);
    if (!user) {
        const error = formatOperationalError(new Error('Unauthorized'), 'authentication');
        return NextResponse.json({ error: error.message }, { status: 401 });
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
    } catch (err) {
        const error = formatOperationalError(err, 'validation');
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const { name, type, baseUrl, credentials, allowedEndpoints } = body;

    if (!name || !type || !baseUrl) {
        return NextResponse.json({ 
            error: 'Integration name, type, and URL are required' 
        }, { status: 400 });
    }

    const ALLOWED_TYPES: IntegrationType[] = ['shopify', 'woocommerce', 'custom'];
    if (!ALLOWED_TYPES.includes(type)) {
        return NextResponse.json({ 
            error: `Integration type must be one of: ${ALLOWED_TYPES.join(', ')}` 
        }, { status: 400 });
    }

    // Validate URL format
    try { 
        new URL(baseUrl); 
    } catch {
        return NextResponse.json({ 
            error: 'Please enter a valid URL (e.g., https://example.com)' 
        }, { status: 400 });
    }

    // Check integration limit based on plan
    try {
        const existingIntegrations = await getIntegrationsPublic(user.id);
        const limitCheck = await checkIntegrationLimit(user.id, existingIntegrations.length);
        
        if (!limitCheck.allowed) {
            const usageError = createUsageLimitError(limitCheck.plan, limitCheck.limit);
            const formatted = formatOperationalError(usageError, 'usage_limit');
            return NextResponse.json({ 
                error: formatted.message,
                suggestion: formatted.suggestion,
                code: 'USAGE_LIMIT_EXCEEDED'
            }, { status: 402 }); // 402 Payment Required
        }
    } catch (err) {
        console.error('Failed to check integration limit:', err);
        // Continue anyway - don't block integration creation on limit check failures
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
        const error = formatOperationalError(new Error(result.error), 'database');
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: result.id, message: 'Integration created successfully' }, { status: 201 });
}

// PATCH /api/integrations — update an existing integration
export async function PATCH(request: NextRequest) {
    const user = await getSessionUser(request);
    if (!user) {
        const error = formatOperationalError(new Error('Unauthorized'), 'authentication');
        return NextResponse.json({ error: error.message }, { status: 401 });
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
    } catch (err) {
        const error = formatOperationalError(err, 'validation');
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!body.id) {
        return NextResponse.json({ error: 'Integration ID is required' }, { status: 400 });
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
        const formattedError = formatOperationalError(new Error(error), 'database');
        return NextResponse.json({ error: formattedError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Integration updated successfully' });
}

// DELETE /api/integrations — delete an integration
export async function DELETE(request: NextRequest) {
    const user = await getSessionUser(request);
    if (!user) {
        const error = formatOperationalError(new Error('Unauthorized'), 'authentication');
        return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Integration ID is required' }, { status: 400 });
    }

    const admin = getAdminClient();
    const { error } = await admin
        .from('client_integrations')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) {
        const formattedError = formatOperationalError(error, 'database');
        return NextResponse.json({ error: formattedError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Integration deleted successfully' });
}
