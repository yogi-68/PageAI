import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy-initialized browser Supabase client (safe for Vercel build)
let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
    if (!_supabase) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!url || !key) {
            throw new Error(
                '[PageCortex] Missing Supabase environment variables. ' +
                'Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY ' +
                'to your Vercel project → Settings → Environment Variables, then redeploy.'
            );
        }
        _supabase = createClient(url, key);
    }
    return _supabase;
}

// Backwards-compatible export (getter proxy)
export const supabase = new Proxy({} as SupabaseClient, {
    get(_target, prop) {
        return (getSupabase() as any)[prop];
    },
});

// Server-side admin Supabase (uses service role key — bypasses RLS)
let adminClient: SupabaseClient | null = null;
export function getAdminClient() {
    if (!adminClient) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!url || !key) {
            throw new Error(
                '[PageCortex] Missing Supabase admin environment variables. ' +
                'Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY ' +
                'to your Vercel project → Settings → Environment Variables, then redeploy.'
            );
        }
        adminClient = createClient(url, key);
    }
    return adminClient;
}

// ─── Database Types ───────────────────────────────────────
export interface Profile {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    plan: 'free' | 'starter' | 'growth' | 'scale' | 'enterprise';
    dodo_customer_id: string | null;
    dodo_subscription_id: string | null;
    monthly_message_count: number;
    monthly_message_limit: number;
    total_pages_indexed: number;
    max_pages_indexed: number;
    max_chatbots: number;
    overage_enabled: boolean;
    company: string | null;
    api_access: boolean;
    created_at: string;
    updated_at: string;
}

export interface DataSource {
    id: string;
    user_id: string;
    type: 'website' | 'google_drive' | 'notion' | 'gitbook' | 'zendesk' | 'confluence' | 'file_upload' | 'api' | 'sitemap';
    name: string;
    config: Record<string, any>;
    status: 'pending' | 'syncing' | 'indexed' | 'error' | 'paused';
    last_synced_at: string | null;
    sync_frequency: string;
    documents_count: number;
    total_chunks: number;
    error_message: string | null;
    created_at: string;
    updated_at: string;
}

export interface Website {
    id: string;
    user_id: string;
    data_source_id: string | null;
    url: string;
    name: string | null;
    status: 'pending' | 'crawling' | 'indexed' | 'error';
    pages_count: number;
    total_words: number;
    last_crawled_at: string | null;
    crawl_frequency: string;
    allowed_paths: string[];
    blocked_paths: string[];
    max_depth: number;
    created_at: string;
    updated_at: string;
}

export interface Bot {
    id: string;
    user_id: string;
    website_id: string | null;
    name: string;
    system_prompt: string | null;
    welcome_message: string;
    model: 'gpt-4.1-mini' | 'gpt-4.1' | 'auto';
    primary_color: string;
    position: string;
    is_active: boolean;
    branding_enabled: boolean;
    total_conversations: number;
    temperature: number;
    max_tokens: number;
    confidence_threshold: number;
    fallback_message: string;
    allowed_domains: string[];
    data_source_ids: string[];
    created_at: string;
    updated_at: string;
    // joined data
    website?: Website;
}

export interface Document {
    id: string;
    data_source_id: string;
    user_id: string;
    website_id: string | null;
    external_id: string | null;
    url: string | null;
    title: string | null;
    content: string | null;
    content_hash: string | null;
    word_count: number;
    doc_type: string;
    metadata: Record<string, any>;
    status: string;
    last_indexed_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface Conversation {
    id: string;
    bot_id: string;
    visitor_id: string | null;
    visitor_ip: string | null;
    visitor_country: string | null;
    visitor_page_url: string | null;
    status: 'active' | 'resolved' | 'escalated';
    satisfaction_rating: number | null;
    message_count: number;
    created_at: string;
    updated_at: string;
    // joined
    bot?: Bot;
    messages?: Message[];
}

export interface Message {
    id: string;
    conversation_id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    sources: { url: string; title: string; relevance: number }[];
    model_used: string | null;
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    response_time_ms: number | null;
    confidence_score: number | null;
    query_rewrite: string | null;
    chunks_retrieved: number;
    created_at: string;
}

// Legacy type alias for backward compatibility
export type Page = Document;

// ─── Helper queries ───────────────────────────────────────
export async function getUserProfile(userId: string) {
    const { data, error } = await getSupabase()
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    if (error) throw error;
    return data as Profile;
}

export async function getUserBots(userId: string) {
    const { data, error } = await getSupabase()
        .from('bots')
        .select('*, website:websites(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as Bot[];
}

export async function getUserWebsites(userId: string) {
    const { data, error } = await getSupabase()
        .from('websites')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as Website[];
}

export async function getUserDataSources(userId: string) {
    const { data, error } = await getSupabase()
        .from('data_sources')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as DataSource[];
}

export async function getBotConversations(botId: string, limit = 50) {
    const { data, error } = await getSupabase()
        .from('conversations')
        .select('*, messages(*)')
        .eq('bot_id', botId)
        .order('created_at', { ascending: false })
        .limit(limit);
    if (error) throw error;
    return (data || []) as Conversation[];
}

export async function getConversationsForUser(userId: string, limit = 50) {
    const sb = getSupabase();
    const { data: bots } = await sb
        .from('bots')
        .select('id, name')
        .eq('user_id', userId);

    if (!bots || bots.length === 0) return [];

    const botIds = bots.map(b => b.id);
    const { data, error } = await sb
        .from('conversations')
        .select('*, bot:bots(id, name), messages(*)')
        .in('bot_id', botIds)
        .order('created_at', { ascending: false })
        .limit(limit);
    if (error) throw error;
    return (data || []) as Conversation[];
}

export async function getWebsitePages(websiteId: string) {
    const { data, error } = await getSupabase()
        .from('documents')
        .select('*')
        .eq('website_id', websiteId)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as Document[];
}

// ─── Dashboard Stats ──────────────────────────────────────
export async function getDashboardStats(userId: string) {
    const sb = getSupabase();
    const bots = await getUserBots(userId);
    const botIds = bots.map(b => b.id);

    let totalConversations = 0;
    let resolvedCount = 0;

    if (botIds.length > 0) {
        const { count: convCount } = await sb
            .from('conversations')
            .select('*', { count: 'exact', head: true })
            .in('bot_id', botIds);
        totalConversations = convCount || 0;

        const { count: resCount } = await sb
            .from('conversations')
            .select('*', { count: 'exact', head: true })
            .in('bot_id', botIds)
            .eq('status', 'resolved');
        resolvedCount = resCount || 0;
    }

    return {
        totalConversations,
        activeBots: bots.filter(b => b.is_active).length,
        totalBots: bots.length,
        resolutionRate: totalConversations > 0
            ? ((resolvedCount / totalConversations) * 100).toFixed(1)
            : '0',
        bots,
    };
}
