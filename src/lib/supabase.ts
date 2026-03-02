import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Browser / client-side Supabase (uses anon key)
export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Server-side admin Supabase (uses service role key — bypasses RLS)
let adminClient: SupabaseClient | null = null;
export function getAdminClient() {
    if (!adminClient) {
        adminClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
    }
    return adminClient;
}

// ─── Database Types ───────────────────────────────────────
export interface Profile {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    plan: 'free' | 'basic' | 'pro' | 'premium';
    dodo_customer_id: string | null;
    dodo_subscription_id: string | null;
    monthly_question_count: number;
    monthly_question_limit: number;
    created_at: string;
    updated_at: string;
}

export interface Website {
    id: string;
    user_id: string;
    url: string;
    name: string | null;
    status: 'pending' | 'crawling' | 'indexed' | 'error';
    pages_count: number;
    total_words: number;
    last_crawled_at: string | null;
    crawl_frequency: string;
    created_at: string;
    updated_at: string;
}

export interface Bot {
    id: string;
    user_id: string;
    website_id: string;
    name: string;
    system_prompt: string | null;
    welcome_message: string;
    model: string;
    primary_color: string;
    position: string;
    is_active: boolean;
    branding_enabled: boolean;
    total_conversations: number;
    created_at: string;
    updated_at: string;
    // joined data
    website?: Website;
}

export interface Page {
    id: string;
    website_id: string;
    url: string;
    title: string | null;
    content: string | null;
    word_count: number;
    status: string;
    last_indexed_at: string | null;
    created_at: string;
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
    role: 'user' | 'assistant';
    content: string;
    sources: { url: string; title: string; relevance: number }[];
    model_used: string | null;
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    response_time_ms: number | null;
    created_at: string;
}

// ─── Helper queries ───────────────────────────────────────
export async function getUserProfile(userId: string) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    if (error) throw error;
    return data as Profile;
}

export async function getUserBots(userId: string) {
    const { data, error } = await supabase
        .from('bots')
        .select('*, website:websites(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as Bot[];
}

export async function getUserWebsites(userId: string) {
    const { data, error } = await supabase
        .from('websites')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as Website[];
}

export async function getBotConversations(botId: string, limit = 50) {
    const { data, error } = await supabase
        .from('conversations')
        .select('*, messages(*)')
        .eq('bot_id', botId)
        .order('created_at', { ascending: false })
        .limit(limit);
    if (error) throw error;
    return (data || []) as Conversation[];
}

export async function getConversationsForUser(userId: string, limit = 50) {
    // Get all bots for user, then all conversations
    const { data: bots } = await supabase
        .from('bots')
        .select('id, name')
        .eq('user_id', userId);

    if (!bots || bots.length === 0) return [];

    const botIds = bots.map(b => b.id);
    const { data, error } = await supabase
        .from('conversations')
        .select('*, bot:bots(id, name), messages(*)')
        .in('bot_id', botIds)
        .order('created_at', { ascending: false })
        .limit(limit);
    if (error) throw error;
    return (data || []) as Conversation[];
}

export async function getWebsitePages(websiteId: string) {
    const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('website_id', websiteId)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as Page[];
}

// ─── Dashboard Stats ──────────────────────────────────────
export async function getDashboardStats(userId: string) {
    const bots = await getUserBots(userId);
    const botIds = bots.map(b => b.id);

    let totalConversations = 0;
    let resolvedCount = 0;
    let totalMessages = 0;

    if (botIds.length > 0) {
        const { count: convCount } = await supabase
            .from('conversations')
            .select('*', { count: 'exact', head: true })
            .in('bot_id', botIds);
        totalConversations = convCount || 0;

        const { count: resCount } = await supabase
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
