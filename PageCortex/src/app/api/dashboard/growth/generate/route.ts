import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { generateEmbedding, getOpenAI } from '@/lib/openai';

export const maxDuration = 60; // Allow 60s for Vercel Pro since generation can be long

export async function POST(request: NextRequest) {
    try {
        const { type, input, userId } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }
        if (!input || !input.trim()) {
            return NextResponse.json({ error: 'Input is required' }, { status: 400 });
        }
        if (type !== 'seo' && type !== 'social') {
            return NextResponse.json({ error: 'Invalid generation type' }, { status: 400 });
        }

        const admin = getAdminClient();

        // 1. Generate embedding for the input (objection keyword or reddit post)
        const queryEmbedding = await generateEmbedding(input);

        // 2. Fetch the most relevant chunks from the user's knowledge base
        const { data: chunks, error } = await admin.rpc('match_chunks', {
            query_embedding: queryEmbedding,
            match_count: 15, // Get top 15 chunks for solid context
            filter_user_id: userId,
        });

        if (error) {
            console.error('Vector search error in Growth Hub:', error);
            throw new Error('Failed to retrieve knowledge base context.');
        }

        const context = (chunks || []).map((c: any) => c.content).join('\n\n---\n\n');

        // 3. Construct prompt based on type
        let systemPrompt = '';
        let userPrompt = '';

        if (type === 'seo') {
            systemPrompt = `You are an expert SEO copywriter and SaaS marketer. Your goal is to write a highly converting, SEO-optimized blog post or landing page article answering a specific buyer objection or keyword. 
            
RULES:
1. Use ONLY the provided Knowledge Base context to inform your product's features, benefits, and solutions.
2. Structure the article with a catchy H1, followed by H2s and H3s.
3. Use markdown formatting.
4. Keep the tone professional, persuasive, and authoritative.
5. End with a strong Call to Action (CTA) pointing to the product.`;

            userPrompt = `Knowledge Base Context:\n${context}\n\nTarget Objection/Keyword: "${input}"\n\nPlease write the SEO article.`;
        } else {
            systemPrompt = `You are an expert community manager and growth hacker. Your goal is to write a highly helpful, native-feeling Reddit or X (Twitter) reply.
            
RULES:
1. Provide genuine, actionable value FIRST based on the user's problem.
2. Do NOT sound like a spam bot or a corporate shill. Use a casual, helpful tone.
3. After providing value, subtly introduce your product as an elegant solution to their problem, using the provided Knowledge Base context.
4. Keep it relatively concise but deeply relevant to the specific venting or problem in the post.
5. Do NOT make up features that are not in the context.`;

            userPrompt = `Knowledge Base Context:\n${context}\n\nSocial Media Post:\n"${input}"\n\nPlease write the reply.`;
        }

        // 4. Generate content
        const response = await getOpenAI().chat.completions.create({
            model: 'gpt-4.1', // Use the advanced model for high quality generation
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 1500,
        });

        const content = response.choices[0]?.message?.content?.trim() || '';

        return NextResponse.json({ success: true, content });

    } catch (error: any) {
        console.error('Growth Hub Generate API Error:', error);
        return NextResponse.json(
            { error: error.message || 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
