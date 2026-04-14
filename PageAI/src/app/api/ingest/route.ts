import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { generateEmbeddings } from '@/lib/openai';

// Allow up to 60 s on Vercel (Pro/Team). Free tier is capped at 10 s by Vercel, not this flag.
export const maxDuration = 60;

const MAX_CONTENT_CHARS = 500_000; // ~100k words
// Smaller batch = less risk of hitting token-rate limits in a single burst
const EMBED_BATCH = 50;

function detectDocType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
    if (ext === 'md') return 'markdown';
    if (ext === 'csv') return 'sheet';
    return 'other';
}

function chunkText(text: string, maxChunk = 1000, overlap = 100): string[] {
    const words = text.split(/\s+/);
    const chunks: string[] = [];
    let i = 0;
    while (i < words.length) {
        const slice = words.slice(i, i + maxChunk).join(' ');
        if (slice.trim()) chunks.push(slice);
        i += maxChunk - overlap;
    }
    return chunks;
}

export async function POST(request: NextRequest) {
    try {
        const { fileName, content, userId } = await request.json();

        if (!fileName || !content || !userId) {
            return NextResponse.json({ error: 'fileName, content, and userId are required' }, { status: 400 });
        }
        if (typeof content !== 'string') {
            return NextResponse.json({ error: 'content must be a string' }, { status: 400 });
        }
        if (content.length > MAX_CONTENT_CHARS) {
            return NextResponse.json({ error: 'File content exceeds 500k characters' }, { status: 413 });
        }

        const admin = getAdminClient();
        const wordCount = content.split(/\s+/).filter(Boolean).length;
        const docType = detectDocType(fileName);

        // Create data source
        const { data: dataSource, error: dsError } = await admin
            .from('data_sources')
            .insert({
                user_id: userId,
                type: 'file_upload',
                name: fileName,
                config: { fileName, docType },
                status: 'syncing',
            })
            .select()
            .single();
        if (dsError) throw dsError;

        // Create document record
        const { data: doc, error: docError } = await admin
            .from('documents')
            .insert({
                data_source_id: dataSource.id,
                user_id: userId,
                url: null,
                title: fileName,
                content,
                word_count: wordCount,
                doc_type: docType,
                status: 'indexed',
            })
            .select()
            .single();
        if (docError) throw docError;

        // Chunk & embed in batches to stay within rate limits
        const textChunks = chunkText(content);
        const allEmbeddings: number[][] = [];
        for (let i = 0; i < textChunks.length; i += EMBED_BATCH) {
            const batch = textChunks.slice(i, i + EMBED_BATCH);
            const batchEmbeddings = await generateEmbeddings(batch);
            allEmbeddings.push(...batchEmbeddings);
        }

        const chunkRows = textChunks.map((chunk, idx) => ({
            document_id: doc.id,
            data_source_id: dataSource.id,
            user_id: userId,
            content: chunk,
            embedding: allEmbeddings[idx],
            chunk_index: idx,
            word_count: chunk.split(/\s+/).filter(Boolean).length,
        }));

        const { error: chunkError } = await admin.from('chunks').insert(chunkRows);
        if (chunkError) throw chunkError;

        // Update data source status
        await admin.from('data_sources').update({
            status: 'indexed',
            documents_count: 1,
            total_chunks: chunkRows.length,
            last_synced_at: new Date().toISOString(),
        }).eq('id', dataSource.id);

        return NextResponse.json({
            success: true,
            dataSourceId: dataSource.id,
            fileName,
            wordCount,
            chunks: chunkRows.length,
        });
    } catch (error: any) {
        console.error('Ingest error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
