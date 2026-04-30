import OpenAI from 'openai';
import { getCachedEmbedding, setCachedEmbedding } from './cache';

// Lazy-initialized OpenAI client (safe for Vercel build)
let _openai: OpenAI | null = null;

export function getOpenAI(): OpenAI {
    if (!_openai) {
        _openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY!,
        });
    }
    return _openai;
}

// Backwards-compatible export (getter proxy)
export const openai = new Proxy({} as OpenAI, {
    get(_target, prop) {
        return (getOpenAI() as any)[prop];
    },
});

// ─── Retry with Exponential Backoff ───────────────────────
async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
    let lastError: any;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (err: any) {
            lastError = err;
            // Do NOT retry billing quota errors — they won't resolve with retries
            const isQuotaExhausted = err?.code === 'insufficient_quota' ||
                (err?.status === 429 && err?.message?.includes('quota'));
            const isRetryable =
                (!isQuotaExhausted && err?.status === 429) ||
                err?.status === 503 ||
                err?.status === 502 ||
                err?.code === 'ECONNRESET' ||
                err?.code === 'ETIMEDOUT';
            if (!isRetryable || attempt === maxAttempts - 1) throw err;
            const delayMs = Math.min(1000 * Math.pow(2, attempt), 8000) + Math.random() * 500;
            await new Promise(r => setTimeout(r, delayMs));
        }
    }
    throw lastError;
}

// ─── Embedding Generation (with caching + retry) ──────────
export async function generateEmbedding(text: string): Promise<number[]> {
    // Check cache first
    const cached = getCachedEmbedding(text);
    if (cached) return cached;

    const response = await withRetry(() => getOpenAI().embeddings.create({
        model: 'text-embedding-3-small',
        input: text.substring(0, 8000),
    }));
    const embedding = response.data[0].embedding;

    // Store in cache
    setCachedEmbedding(text, embedding);
    return embedding;
}

// ─── Batch Embedding Generation (with retry) ──────────────
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];

    // Process in batches of 100 (OpenAI limit)
    const batchSize = 100;
    const allEmbeddings: number[][] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize).map(t => t.substring(0, 8000));
        const response = await withRetry(() => getOpenAI().embeddings.create({
            model: 'text-embedding-3-small',
            input: batch,
        }));
        const embeddings = response.data.map(d => d.embedding);
        allEmbeddings.push(...embeddings);
    }

    return allEmbeddings;
}

// ─── Chat Completion (non-streaming, with retry) ──────────
export async function generateAnswer(
    query: string,
    context: string,
    systemPrompt?: string,
    model: string = 'gpt-4.1-mini'
) {
    const defaultSystem = `You are a helpful AI assistant. Answer questions ONLY based on the provided context. If the answer is not found in the context, politely say you don't have that information. Be professional, concise, and cite sources when possible.`;

    const response = await withRetry(() => getOpenAI().chat.completions.create({
        model,
        messages: [
            { role: 'system', content: systemPrompt || defaultSystem },
            {
                role: 'user',
                content: `Context:\n---\n${context}\n---\n\nQuestion: ${query}\n\nAnswer based only on the context above.`,
            },
        ],
        temperature: 0.2,
        max_tokens: 1024,
    }));

    const choice = response.choices[0];
    return {
        answer: choice?.message?.content?.trim() || '',
        usage: response.usage,
        model: response.model,
    };
}

// ─── Streaming Chat Completion (with retry on init) ───────
export async function generateAnswerStream(
    query: string,
    context: string,
    systemPrompt?: string,
    model: string = 'gpt-4.1-mini',
    temperature: number = 0.2,
    maxTokens: number = 1024
) {
    const defaultSystem = `You are a helpful AI assistant. Answer questions ONLY based on the provided context. If the answer is not found in the context, politely say you don't have that information. Be professional, concise, and cite sources when possible.`;

    return withRetry(() => getOpenAI().chat.completions.create({
        model,
        messages: [
            { role: 'system', content: systemPrompt || defaultSystem },
            {
                role: 'user',
                content: `Context:\n---\n${context}\n---\n\nQuestion: ${query}\n\nAnswer based only on the context above.`,
            },
        ],
        temperature,
        max_tokens: maxTokens,
        stream: true,
    }));
}
