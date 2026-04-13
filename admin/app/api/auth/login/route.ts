import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAdmin } from '@/lib/plans';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();
        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
        }

        // Check admin allowlist before hitting Supabase
        if (!isAdmin(email)) {
            return NextResponse.json({ error: 'Access denied — not an authorized admin account' }, { status: 403 });
        }

        const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        const supabase = createClient(url, anonKey);
        let { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });

        // Auto-confirm email for admin accounts if Supabase requires it
        if (authError?.message?.toLowerCase().includes('not confirmed')) {
            const supabaseAdmin = createClient(url, serviceKey, {
                auth: { autoRefreshToken: false, persistSession: false },
            });
            const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 100 });
            const target = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
            if (!target) {
                return NextResponse.json({
                    error: 'No Supabase account found for this email. Create a user in the Supabase Auth dashboard first.',
                }, { status: 401 });
            }
            await supabaseAdmin.auth.admin.updateUserById(target.id, { email_confirm: true });
            const retry = await supabase.auth.signInWithPassword({ email, password });
            if (retry.error || !retry.data.user) {
                return NextResponse.json({ error: retry.error?.message || 'Login failed after email confirmation' }, { status: 401 });
            }
            return NextResponse.json({
                token: retry.data.session?.access_token,
                user: { id: retry.data.user.id, email: retry.data.user.email },
            });
        }

        if (authError || !authData?.user) {
            const msg = authError?.message === 'Invalid login credentials'
                ? 'Incorrect email or password'
                : authError?.message || 'Login failed';
            return NextResponse.json({ error: msg }, { status: 401 });
        }

        return NextResponse.json({
            token: authData.session?.access_token,
            user: { id: authData.user.id, email: authData.user.email },
        });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Internal server error';
        console.error('[admin/login]', error);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

