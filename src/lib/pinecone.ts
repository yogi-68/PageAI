import { Pinecone } from '@pinecone-database/pinecone';

let pineconeClient: Pinecone | null = null;

export function getPinecone() {
    if (!pineconeClient) {
        pineconeClient = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY!,
        });
    }
    return pineconeClient;
}

export function getIndex() {
    const pc = getPinecone();
    return pc.index(process.env.PINECONE_INDEX || 'pageai-embeddings');
}

export async function upsertEmbeddings(
    vectors: { id: string; values: number[]; metadata: Record<string, string> }[]
) {
    const index = getIndex();
    // Pinecone upsert in batches of 100
    const batchSize = 100;
    for (let i = 0; i < vectors.length; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize);
        await (index as any).upsert(batch);
    }
}

export async function queryEmbeddings(
    vector: number[],
    topK: number = 5,
    filter?: Record<string, string>
) {
    const index = getIndex();
    const results = await (index as any).query({
        vector,
        topK,
        filter,
        includeMetadata: true,
    });
    return results.matches || [];
}

export async function deleteByFilter(filter: Record<string, string>) {
    const index = getIndex();
    try {
        await (index as any).deleteMany(filter);
    } catch {
        // Fallback: deletion might not be supported with filters on all tiers
        console.warn('Delete by filter not supported, skipping');
    }
}
