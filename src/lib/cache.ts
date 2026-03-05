/**
 * Response Cache Layer
 *
 * In-memory LRU cache + Supabase persistent cache
 * Serves cached responses for repeated questions within 24h
 */

import { getAdminClient } from './supabase';

// ─── In-Memory LRU Cache ──────────────────────────────────
const LRU_MAX = 500;
const memoryCache = new Map<string, { data: any; expiry: number }>();

function getLRU(key: string): any | null {
    const entry = memoryCache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
        memoryCache.delete(key);
        return null;
    }
    // Refresh position (LRU)
    memoryCache.delete(key);
    memoryCache.set(key, entry);
    return entry.data;
}

function setLRU(key: string, data: any, ttlMs: number = 3600000): void {
    // Evict oldest if at capacity
    if (memoryCache.size >= LRU_MAX) {
        const oldest = memoryCache.keys().next().value;
        if (oldest) memoryCache.delete(oldest);
    }
    memoryCache.set(key, { data, expiry: Date.now() + ttlMs });
}

// ─── Embedding Cache ──────────────────────────────────────
const embeddingCache = new Map<string, { embedding: number[]; expiry: number }>();
const EMBEDDING_CACHE_MAX = 200;
const EMBEDDING_TTL = 24 * 60 * 60 * 1000; // 24h

export function getCachedEmbedding(text: string): number[] | null {
    const key = text.toLowerCase().trim();
    const entry = embeddingCache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
        embeddingCache.delete(key);
        return null;
    }
    return entry.embedding;
}

export function setCachedEmbedding(text: string, embedding: number[]): void {
    if (embeddingCache.size >= EMBEDDING_CACHE_MAX) {
        const oldest = embeddingCache.keys().next().value;
        if (oldest) embeddingCache.delete(oldest);
    }
    const key = text.toLowerCase().trim();
    embeddingCache.set(key, { embedding, expiry: Date.now() + EMBEDDING_TTL });
}

// ─── Response Cache (DB-backed) ───────────────────────────
export async function getCache(botId: string, queryHash: string): Promise<any | null> {
    // Check memory first
    const memKey = `${botId}:${queryHash}`;
    const memResult = getLRU(memKey);
    if (memResult) return memResult;

    // Check Supabase
    try {
        const admin = getAdminClient();
        const { data, error } = await admin
            .from('response_cache')
            .select('response_text, sources, hit_count')
            .eq('bot_id', botId)
            .eq('query_hash', queryHash)
            .gt('expires_at', new Date().toISOString())
            .single();

        if (error || !data) return null;

        // Increment hit count
        admin
            .from('response_cache')
            .update({ hit_count: data.hit_count + 1 })
            .eq('bot_id', botId)
            .eq('query_hash', queryHash)
            .then(() => {});

        const cached = {
            answer: data.response_text,
            sources: data.sources || [],
            confidence: 1,
            model: 'cached',
            queryRewrite: null,
            chunksRetrieved: 0,
        };

        // Store in memory
        setLRU(memKey, cached);
        return cached;
    } catch {
        return null;
    }
}

export async function setCache(
    botId: string,
    queryHash: string,
    queryText: string,
    result: { answer: string; sources: any[]; confidence: number }
): Promise<void> {
    // Only cache high-confidence answers
    if (result.confidence < 0.5 || !result.answer) return;

    const memKey = `${botId}:${queryHash}`;
    setLRU(memKey, {
        answer: result.answer,
        sources: result.sources,
        confidence: result.confidence,
        model: 'cached',
        queryRewrite: null,
        chunksRetrieved: 0,
    });

    try {
        const admin = getAdminClient();
        await admin.from('response_cache').upsert(
            {
                bot_id: botId,
                query_hash: queryHash,
                query_text: queryText.substring(0, 500),
                response_text: result.answer,
                sources: result.sources,
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            },
            { onConflict: 'bot_id,query_hash' }
        );
    } catch (err) {
        console.error('Cache write error:', err);
    }
}

// ─── Invalidate cache for a bot ───────────────────────────
export async function invalidateCache(botId: string): Promise<void> {
    // Clear memory cache entries for this bot
    for (const key of memoryCache.keys()) {
        if (key.startsWith(`${botId}:`)) {
            memoryCache.delete(key);
        }
    }

    // Clear DB cache
    try {
        const admin = getAdminClient();
        await admin.from('response_cache').delete().eq('bot_id', botId);
    } catch {
        // Non-critical
    }
}
