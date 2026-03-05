import OpenAI from 'openai';
import { getCachedEmbedding, setCachedEmbedding } from './cache';

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

// ─── Embedding Generation (with caching) ──────────────────
export async function generateEmbedding(text: string): Promise<number[]> {
    // Check cache first
    const cached = getCachedEmbedding(text);
    if (cached) return cached;

    const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text.substring(0, 8000), // Limit input length
    });
    const embedding = response.data[0].embedding;

    // Store in cache
    setCachedEmbedding(text, embedding);
    return embedding;
}

// ─── Batch Embedding Generation ───────────────────────────
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];

    // Process in batches of 100 (OpenAI limit)
    const batchSize = 100;
    const allEmbeddings: number[][] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize).map(t => t.substring(0, 8000));
        const response = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: batch,
        });
        const embeddings = response.data.map(d => d.embedding);
        allEmbeddings.push(...embeddings);
    }

    return allEmbeddings;
}

// ─── Chat Completion (non-streaming) ──────────────────────
export async function generateAnswer(
    query: string,
    context: string,
    systemPrompt?: string,
    model: string = 'gpt-4.1-mini'
) {
    const defaultSystem = `You are a helpful AI assistant. Answer questions ONLY based on the provided context. If the answer is not found in the context, politely say you don't have that information. Be professional, concise, and cite sources when possible.`;

    const response = await openai.chat.completions.create({
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
    });

    const choice = response.choices[0];
    return {
        answer: choice?.message?.content?.trim() || '',
        usage: response.usage,
        model: response.model,
    };
}

// ─── Streaming Chat Completion ────────────────────────────
export async function generateAnswerStream(
    query: string,
    context: string,
    systemPrompt?: string,
    model: string = 'gpt-4.1-mini',
    temperature: number = 0.2,
    maxTokens: number = 1024
) {
    const defaultSystem = `You are a helpful AI assistant. Answer questions ONLY based on the provided context. If the answer is not found in the context, politely say you don't have that information. Be professional, concise, and cite sources when possible.`;

    return openai.chat.completions.create({
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
    });
}
