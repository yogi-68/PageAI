import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAdmin } from '@/lib/plans';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();
        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
        }

        // Use anon key for user authentication (service_role is not suitable for client auth flows)
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        );

        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
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
        console.error('[admin/login]', error);
        return NextResponse.json({ error: error.message || 'Login failed' }, { status: 500 });
    }
}

