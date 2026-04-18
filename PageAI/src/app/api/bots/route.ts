import { NextRequest, NextResponse } from 'next/server';
import { supabase, getAdminClient } from '@/lib/supabase';

// GET /api/bots — fetch user's bots, or a single bot by id
export async function GET(request: NextRequest) {
    try {
        const userId = request.nextUrl.searchParams.get('userId');
        const botId = request.nextUrl.searchParams.get('id');

        // Single bot fetch (used by chat-preview)
        if (botId) {
            const admin = getAdminClient();
            const { data: bot, error } = await admin
                .from('bots')
                .select('id, name, primary_color, welcome_message, is_active')
                .eq('id', botId)
                .single();
            if (error || !bot) return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
            return NextResponse.json(bot);
        }

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

        // Enforce bot count limit for the user's plan
        const [{ data: profile }, { data: existingBots }] = await Promise.all([
            admin.from('profiles').select('plan').eq('id', userId).single(),
            admin.from('bots').select('id').eq('user_id', userId),
        ]);
        const planLimits: Record<string, number> = { free: 1, starter: 1, growth: 3, scale: 10, enterprise: -1 };
        const userPlan = (profile?.plan as string) || 'free';
        const limit = planLimits[userPlan] ?? 1;
        if (limit !== -1 && (existingBots?.length || 0) >= limit) {
            return NextResponse.json(
                { error: `Your ${userPlan} plan allows ${limit} bot${limit === 1 ? '' : 's'}. Upgrade to create more.`, limitReached: true },
                { status: 403 }
            );
        }

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

// DELETE /api/bots — delete a bot + cleanup orphaned data sources
export async function DELETE(request: NextRequest) {
    try {
        const botId = request.nextUrl.searchParams.get('botId');
        if (!botId) {
            return NextResponse.json({ error: 'botId required' }, { status: 400 });
        }

        const admin = getAdminClient();

        // Fetch the bot's data source IDs and website_id before deleting
        const { data: bot } = await admin
            .from('bots')
            .select('data_source_ids, user_id, website_id')
            .eq('id', botId)
            .single();

        // Delete the bot (conversations/messages cascade via FK)
        const { error } = await admin.from('bots').delete().eq('id', botId);
        if (error) throw error;

        // Clean up data sources that are no longer referenced by any remaining bot
        const dataSourceIds = (bot?.data_source_ids ?? []) as string[];
        if (dataSourceIds.length > 0) {
            for (const dsId of dataSourceIds) {
                const { count } = await admin
                    .from('bots')
                    .select('id', { count: 'exact', head: true })
                    .filter('data_source_ids', 'cs', `{${dsId}}`);

                if (count === 0) {
                    // Orphaned data source — safe to delete; cascades to documents + chunks
                    await admin.from('data_sources').delete().eq('id', dsId);
                }
            }
        }

        // Clean up orphaned website — if no other bot references it, delete it
        if (bot?.website_id) {
            const { count: refCount } = await admin
                .from('bots')
                .select('id', { count: 'exact', head: true })
                .eq('website_id', bot.website_id);

            if (refCount === 0) {
                await admin.from('websites').delete().eq('id', bot.website_id);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
