import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { isAdmin } from '@/lib/plans';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();
        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
        }

        const admin = getAdminClient();

        // Verify credentials via Supabase Auth
        const { data: authData, error: authError } = await admin.auth.signInWithPassword({ email, password });
        if (authError || !authData.user) {
            return NextResponse.json({ error: authError?.message || 'Invalid credentials' }, { status: 401 });
        }

        // Check admin authorization
        if (!isAdmin(authData.user.email || '')) {
            return NextResponse.json({ error: 'Unauthorized — not an admin' }, { status: 403 });
        }

        return NextResponse.json({
            token: authData.session?.access_token,
            user: {
                id: authData.user.id,
                email: authData.user.email,
            },
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Login failed' }, { status: 500 });
    }
}
