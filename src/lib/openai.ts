import OpenAI from 'openai';

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

export async function generateEmbedding(text: string): Promise<number[]> {
    const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
    });
    return response.data[0].embedding;
}

export async function generateAnswer(
    query: string,
    context: string,
    systemPrompt?: string,
    model: string = 'gpt-3.5-turbo'
) {
    const defaultSystem = `You are a helpful AI assistant for a website. Answer questions ONLY based on the provided context from the website's content. If the answer is not found in the context, politely say you don't have that information and suggest the user contact support or browse the website directly.

Always be professional, concise, and helpful. If relevant, mention which page or section the information comes from.`;

    const response = await openai.chat.completions.create({
        model,
        messages: [
            { role: 'system', content: systemPrompt || defaultSystem },
            {
                role: 'user',
                content: `Context from the website:\n---\n${context}\n---\n\nUser Question: ${query}\n\nProvide a helpful, accurate answer based only on the context above.`,
            },
        ],
        temperature: 0.3,
        max_tokens: 1000,
    });

    return {
        answer: response.choices[0].message.content,
        usage: response.usage,
        model: response.model,
    };
}
