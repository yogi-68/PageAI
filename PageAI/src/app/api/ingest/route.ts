import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { generateEmbeddings } from '@/lib/openai';
import { chunkText } from '@/lib/chunker';

// Allow up to 60 s on Vercel (Pro/Team). Free tier is capped at 10 s by Vercel, not this flag.
export const maxDuration = 60;

const MAX_CONTENT_CHARS = 500_000; // ~100k words
// Smaller batch = less risk of hitting token-rate limits in a single burst
const EMBED_BATCH = 50;

function detectDocType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
    if (ext === 'md') return 'markdown';
    if (ext === 'csv') return 'sheet';
    if (ext === 'pdf') return 'pdf';
    if (ext === 'docx') return 'docx';
    if (ext === 'html' || ext === 'htm') return 'html';
    return 'other';
}

// GET /api/ingest?dataSourceId=xxx — poll indexing status
export async function GET(request: NextRequest) {
    const dataSourceId = request.nextUrl.searchParams.get('dataSourceId');
    if (!dataSourceId) return NextResponse.json({ error: 'dataSourceId required' }, { status: 400 });
    const admin = getAdminClient();
    const { data, error } = await admin
        .from('data_sources')
        .select('id, status, total_chunks, error_message, last_synced_at')
        .eq('id', dataSourceId)
        .single();
    if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ dataSourceId: data.id, status: data.status, chunks: data.total_chunks, errorMessage: data.error_message, lastSyncedAt: data.last_synced_at });
}

export async function POST(request: NextRequest) {
    try {
        const { fileName, content, userId, contentBase64 } = await request.json();

        if (!fileName || !userId || (!content && !contentBase64)) {
            return NextResponse.json({ error: 'fileName, userId, and content are required' }, { status: 400 });
        }

        // Extract text content depending on file type
        let textContent: string;
        const ext = fileName.split('.').pop()?.toLowerCase() ?? '';

        if (ext === 'pdf') {
            if (!contentBase64) return NextResponse.json({ error: 'PDF requires contentBase64' }, { status: 400 });
            try {
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                const pdfParse = require('pdf-parse');
                const buffer = Buffer.from(contentBase64, 'base64');
                const parsed = await pdfParse(buffer);
                textContent = parsed.text || '';
                if (!textContent.trim()) {
                    return NextResponse.json({ error: 'PDF contains no extractable text (scanned/image PDF not supported)' }, { status: 422 });
                }
            } catch (pdfErr: any) {
                return NextResponse.json({ error: `PDF parsing failed: ${pdfErr.message}` }, { status: 422 });
            }
        } else if (ext === 'docx') {
            if (!contentBase64) return NextResponse.json({ error: 'DOCX requires contentBase64' }, { status: 400 });
            try {
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                const mammoth = require('mammoth');
                const buffer = Buffer.from(contentBase64, 'base64');
                const result = await mammoth.extractRawText({ buffer });
                textContent = result.value || '';
                if (!textContent.trim()) {
                    return NextResponse.json({ error: 'DOCX contains no extractable text' }, { status: 422 });
                }
            } catch (docxErr: any) {
                return NextResponse.json({ error: `DOCX parsing failed: ${docxErr.message}` }, { status: 422 });
            }
        } else if (ext === 'html' || ext === 'htm') {
            if (typeof content !== 'string') return NextResponse.json({ error: 'content must be a string' }, { status: 400 });
            // Strip HTML tags using regex — cheerio is heavier, this is sufficient for uploaded HTML
            textContent = content
                .replace(/<script[\s\S]*?<\/script>/gi, '')
                .replace(/<style[\s\S]*?<\/style>/gi, '')
                .replace(/<[^>]+>/g, ' ')
                .replace(/&nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/\s+/g, ' ')
                .trim();
            if (!textContent) return NextResponse.json({ error: 'HTML file contains no readable text' }, { status: 422 });
        } else {
            if (typeof content !== 'string') {
                return NextResponse.json({ error: 'content must be a string' }, { status: 400 });
            }
            textContent = content;
        }

        if (textContent.length > MAX_CONTENT_CHARS) {
            return NextResponse.json({ error: 'File content exceeds 500k characters' }, { status: 413 });
        }

        const admin = getAdminClient();
        const wordCount = textContent.split(/\s+/).filter(Boolean).length;
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
                content: textContent,
                word_count: wordCount,
                doc_type: docType,
                status: 'indexed',
            })
            .select()
            .single();
        if (docError) throw docError;

        // Compute chunks using section-aware chunker (600-token target, 120-token overlap, heading-aware)
        const chunkResults = chunkText(textContent, { pageTitle: fileName, docType: detectDocType(fileName) });
        const textChunks = chunkResults.map(c => c.content);

        // Schedule embedding + DB writes for AFTER the response is sent
        // This makes the endpoint feel instant regardless of file size.
        after(async () => {
            const adminBg = getAdminClient();
            try {
                const allEmbeddings: number[][] = [];
                for (let i = 0; i < textChunks.length; i += EMBED_BATCH) {
                    const batch = textChunks.slice(i, i + EMBED_BATCH);
                    const batchEmbeddings = await generateEmbeddings(batch);
                    allEmbeddings.push(...batchEmbeddings);
                }

                const chunkRows = chunkResults.map((chunk, idx) => ({
                    document_id: doc.id,
                    data_source_id: dataSource.id,
                    user_id: userId,
                    content: chunk.content,
                    embedding: allEmbeddings[idx],
                    chunk_index: chunk.chunkIndex,
                    token_count: chunk.tokenCount,
                    heading: chunk.heading,
                    word_count: chunk.content.split(/\s+/).filter(Boolean).length,
                    metadata: chunk.metadata,
                }));

                await adminBg.from('chunks').insert(chunkRows);
                await adminBg.from('data_sources').update({
                    status: 'indexed',
                    documents_count: 1,
                    total_chunks: chunkRows.length,
                    last_synced_at: new Date().toISOString(),
                }).eq('id', dataSource.id);
            } catch (bgErr: any) {
                console.error('Ingest background error:', bgErr);
                await adminBg.from('data_sources').update({
                    status: 'error',
                    error_message: bgErr.message,
                }).eq('id', dataSource.id);
            }
        });

        // Return immediately — embedding happens in background
        return NextResponse.json({
            success: true,
            dataSourceId: dataSource.id,
            fileName,
            wordCount,
            chunks: textChunks.length,
            status: 'syncing', // will update to 'indexed' within seconds
        });
    } catch (error: any) {
        console.error('Ingest error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
