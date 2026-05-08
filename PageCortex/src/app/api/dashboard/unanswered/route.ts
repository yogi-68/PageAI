import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';

// GET /api/dashboard/unanswered — Fetch unanswered questions for a user's bots
export async function GET(request: NextRequest) {
    try {
        const userId = request.nextUrl.searchParams.get('userId');
        const botId = request.nextUrl.searchParams.get('botId');
        const resolved = request.nextUrl.searchParams.get('resolved');
        const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50');

        if (!userId) {
            return NextResponse.json({ error: 'userId required' }, { status: 400 });
        }

        const admin = getAdminClient();

        // Build query
        let query = admin
            .from('unanswered_questions')
            .select('*, bot:bots(name)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (botId) {
            query = query.eq('bot_id', botId);
        }

        if (resolved !== null && resolved !== undefined) {
            query = query.eq('is_resolved', resolved === 'true');
        }

        const { data, error } = await query;

        if (error) throw error;

        // Count unresolved
        const { count } = await admin
            .from('unanswered_questions')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_resolved', false);

        return NextResponse.json({
            questions: data || [],
            unresolvedCount: count || 0,
        }, {
            headers: { 'Cache-Control': 'no-store' },
        });
    } catch (error: any) {
        console.error('Unanswered questions error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH /api/dashboard/unanswered — Mark a question as resolved
export async function PATCH(request: NextRequest) {
    try {
        const { questionId, resolved, notes } = await request.json();

        if (!questionId) {
            return NextResponse.json({ error: 'questionId required' }, { status: 400 });
        }

        const admin = getAdminClient();
        const { error } = await admin
            .from('unanswered_questions')
            .update({
                is_resolved: resolved ?? true,
                resolved_at: resolved !== false ? new Date().toISOString() : null,
                notes: notes || null,
            })
            .eq('id', questionId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Update unanswered question error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
