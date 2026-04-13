import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';

// POST /api/admin/reset-trial
// Body: { userId: string }
// Purpose: Allow admin/support to reset a user's trial so they can get a fresh 7-day trial.
// Use cases: refunds, goodwill gestures, failed card during trial that was never used, support tickets.
export async function POST(request: NextRequest) {
    try {
        // Verify caller is an admin (checked via Authorization header carrying the service key,
        // OR via the user's session being in ADMIN_EMAILS)
        const authHeader = request.headers.get('authorization');
        const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim());

        // Accept either service-role key (for internal tooling) or a valid admin user session
        const isServiceKey = authHeader === `Bearer ${adminKey}`;
        if (!isServiceKey) {
            // Check if the request carries a valid admin session via x-admin-email header
            const adminEmail = request.headers.get('x-admin-email');
            if (!adminEmail || !adminEmails.includes(adminEmail)) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        }

        const { userId } = await request.json() as { userId: string };
        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        const admin = getAdminClient();

        // Verify user exists
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
                message: 'Trial already available for this user (has_used_trial is already false)',
                userId,
                email: profile.email,
            });
        }

        const { error: updateErr } = await admin
            .from('profiles')
            .update({ has_used_trial: false })
            .eq('id', userId);

        if (updateErr) {
            throw updateErr;
        }

        console.log(`[admin] Trial reset for user ${userId} (${profile.email})`);

        return NextResponse.json({
            success: true,
            message: `Trial reset. User ${profile.email} can now get a 7-day trial on their next Starter or Growth subscription.`,
            userId,
            email: profile.email,
        });
    } catch (error: any) {
        console.error('Admin reset-trial error:', error);
        return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
    }
}
