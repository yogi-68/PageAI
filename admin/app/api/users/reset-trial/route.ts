import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminClient } from '@/lib/supabase';
import { isAdmin } from '@/lib/plans';

// Helper: validate the admin JWT from Authorization header
async function verifyAdminToken(request: NextRequest): Promise<{ ok: boolean; email?: string }> {
    const auth = request.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) return { ok: false };
    const token = auth.slice(7);

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(url, anonKey);

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user?.email) return { ok: false };
    if (!isAdmin(user.email)) return { ok: false };
    return { ok: true, email: user.email };
}

// POST /api/users/reset-trial
// Body: { userId: string }
// Resets has_used_trial=false so the user can start a fresh 7-day trial.
export async function POST(request: NextRequest) {
    const auth = await verifyAdminToken(request);
    if (!auth.ok) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { userId } = await request.json() as { userId: string };
        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        const admin = getAdminClient();

        const { data: profile, error: fetchErr } = await admin
            .from('profiles')
            .select('id, email, has_used_trial, plan')
            .eq('id', userId)
            .single();

        if (fetchErr || !profile) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (!profile.has_used_trial) {
            return NextResponse.json({
                success: true,
                alreadyAvailable: true,
                message: 'Trial already available for this user',
                userId,
                email: profile.email,
            });
        }

        const { error: updateErr } = await admin
            .from('profiles')
            .update({ has_used_trial: false })
            .eq('id', userId);

        if (updateErr) {
            return NextResponse.json({ error: updateErr.message }, { status: 500 });
        }

        console.log(`[admin] Trial reset for ${profile.email} by ${auth.email}`);

        return NextResponse.json({
            success: true,
            message: `Trial reset for ${profile.email} — they can now start a fresh 7-day trial`,
            userId,
            email: profile.email,
        });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Internal server error';
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
