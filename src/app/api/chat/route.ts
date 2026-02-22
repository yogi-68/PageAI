import { NextRequest, NextResponse } from "next/server";

// POST /api/chat - Handle chat queries (the RAG pipeline)
export async function POST(request: NextRequest) {
    try {
        const { query, botId, conversationId } = await request.json();

        if (!query || !botId) {
            return NextResponse.json(
                { error: "Query and botId are required" },
                { status: 400 }
            );
        }

        // In production, this would:
        // 1. Rate limit based on user's plan (check monthly usage)
        // 2. Generate embedding for the query
        //    const queryEmbedding = await generateEmbedding(query);
        // 3. Search Pinecone for top-k matches filtered by botId
        //    const matches = await pinecone.index('pageai').query({
        //      vector: queryEmbedding,
        //      topK: 5,
        //      filter: { botId },
        //      includeMetadata: true,
        //    });
        // 4. Assemble context from matched chunks
        //    const context = matches.map(m => m.metadata.text).join('\n\n');
        // 5. Call LLM with context + query
        //    const answer = await generateAnswer(query, context, systemPrompt, model);
        // 6. Log the conversation in Supabase
        // 7. Increment user's monthly usage counter

        // Simulated RAG response
        const simulatedAnswer = getSimulatedAnswer(query);

        return NextResponse.json({
            success: true,
            answer: simulatedAnswer.text,
            sources: simulatedAnswer.sources,
            conversationId: conversationId || `conv_${Date.now()}`,
            usage: {
                promptTokens: 450,
                completionTokens: 120,
                totalTokens: 570,
                model: "gpt-3.5-turbo",
            },
        });
    } catch (error) {
        console.error("Chat error:", error);
        return NextResponse.json(
            { error: "Failed to generate response" },
            { status: 500 }
        );
    }
}

function getSimulatedAnswer(query: string) {
    const q = query.toLowerCase();

    if (q.includes("shipping") || q.includes("delivery")) {
        return {
            text: "Based on our Shipping Policy page, we offer free standard shipping on all orders over $50 within the US. International shipping starts at $9.99. Express shipping (2-3 business days) is available for $14.99. Orders are typically processed within 1-2 business days.",
            sources: [
                { url: "/shipping-policy", title: "Shipping Policy", relevance: 0.95 },
                { url: "/faq", title: "FAQ", relevance: 0.72 },
            ],
        };
    }

    if (q.includes("return") || q.includes("refund")) {
        return {
            text: "According to our Returns page, you can return most items within 30 days of purchase for a full refund. Items must be unused and in original packaging. Refunds are processed within 5-7 business days after we receive the returned item. Sale items can be exchanged but not refunded.",
            sources: [
                { url: "/returns", title: "Returns & Refunds", relevance: 0.97 },
                { url: "/faq", title: "FAQ", relevance: 0.68 },
            ],
        };
    }

    if (q.includes("price") || q.includes("cost") || q.includes("plan")) {
        return {
            text: "We offer several pricing plans to fit your needs. Our Starter plan is free with basic features. The Growth plan is $39/month, Professional is $129/month, and Enterprise is $399/month. All paid plans include a 14-day free trial. Visit our Pricing page for detailed feature comparisons.",
            sources: [
                { url: "/pricing", title: "Pricing", relevance: 0.98 },
            ],
        };
    }

    return {
        text: `Thank you for your question! Based on the website content I have access to, I can help you with information about products, pricing, shipping, returns, and more. Could you please be more specific about what you'd like to know? You can also browse the website directly for more details.`,
        sources: [
            { url: "/", title: "Home", relevance: 0.5 },
            { url: "/faq", title: "FAQ", relevance: 0.45 },
        ],
    };
}
