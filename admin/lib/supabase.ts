import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _admin: SupabaseClient | null = null;

export function getAdminClient(): SupabaseClient {
    if (!_admin) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        if (!url || !key) throw new Error('Missing SUPABASE env vars');
        _admin = createClient(url, key);
    }
    return _admin;
}

let _browser: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
    if (!_browser) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        if (!url || !key) throw new Error('Missing SUPABASE env vars');
        _browser = createClient(url, key);
    }
    return _browser;
}
