import { NextRequest, NextResponse } from 'next/server';
import { supabase, getAdminClient } from '@/lib/supabase';

// GET /api/bots — fetch user's bots
export async function GET(request: NextRequest) {
    try {
        const userId = request.nextUrl.searchParams.get('userId');
        if (!userId) {
            return NextResponse.json({ error: 'userId required' }, { status: 400 });
        }

        const { data: bots, error } = await supabase
            .from('bots')
            .select('*, website:websites(url, name, pages_count, total_words, status)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return NextResponse.json({ bots: bots || [] });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/bots — create a new bot
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, websiteId, name, welcomeMessage, primaryColor, position, model, systemPrompt, dataSourceIds } = body;

        if (!userId) {
            return NextResponse.json({ error: 'userId required' }, { status: 400 });
        }

        const admin = getAdminClient();
        const { data: bot, error } = await admin
            .from('bots')
            .insert({
                user_id: userId,
                website_id: websiteId || null,
                name: name || 'AI Assistant',
                welcome_message: welcomeMessage || 'Hi! How can I help you today?',
                primary_color: primaryColor || '#6366f1',
                position: position || 'right',
                model: model || 'gpt-4.1-mini',
                system_prompt: systemPrompt || null,
                is_active: true,
                branding_enabled: true,
                data_source_ids: dataSourceIds || [],
            })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ bot });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH /api/bots — update a bot
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { botId, ...updates } = body;

        if (!botId) {
            return NextResponse.json({ error: 'botId required' }, { status: 400 });
        }

        const admin = getAdminClient();
        const { data, error } = await admin
            .from('bots')
            .update(updates)
            .eq('id', botId)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ bot: data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/bots — delete a bot
export async function DELETE(request: NextRequest) {
    try {
        const botId = request.nextUrl.searchParams.get('botId');
        if (!botId) {
            return NextResponse.json({ error: 'botId required' }, { status: 400 });
        }

        const admin = getAdminClient();
        const { error } = await admin.from('bots').delete().eq('id', botId);
        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
