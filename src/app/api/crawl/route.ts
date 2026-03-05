import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { getAdminClient } from '@/lib/supabase';
import { generateEmbedding, generateEmbeddings } from '@/lib/openai';
import { chunkHTMLContent } from '@/lib/chunker';
import { rateLimitCrawl } from '@/lib/rate-limit';
import { invalidateCache } from '@/lib/cache';
import crypto from 'crypto';

// Extract text content from HTML
function extractText(html: string, pageUrl: string): { title: string; text: string; headings: string[] } {
    const $ = cheerio.load(html);
    $('script, style, nav, footer, header, iframe, noscript, svg, [aria-hidden="true"]').remove();

    const title = $('title').text().trim() || $('h1').first().text().trim() || pageUrl;
    const headings: string[] = [];
    $('h1, h2, h3, h4').each((_, el) => {
        const h = $(el).text().trim();
        if (h) headings.push(h);
    });

    const text = $('body').text().replace(/\s+/g, ' ').trim();
    return { title, text, headings };
}

// Discover links from a page
function discoverLinks(html: string, baseUrl: string, allowedPaths: string[], blockedPaths: string[]): string[] {
    const $ = cheerio.load(html);
    const links: Set<string> = new Set();
    const base = new URL(baseUrl);

    $('a[href]').each((_, el) => {
        try {
            const href = $(el).attr('href');
            if (!href) return;
            const resolved = new URL(href, baseUrl);
            if (resolved.hostname !== base.hostname) return;

            resolved.hash = '';
            const clean = resolved.toString().replace(/\/$/, '');
            const path = resolved.pathname;

            // Skip files
            if (/\.(pdf|jpg|jpeg|png|gif|svg|css|js|zip|mp4|mp3|woff|woff2|ico)$/i.test(clean)) return;

            // Check allowed paths
            if (allowedPaths.length > 0 && !allowedPaths.some(p => path.startsWith(p))) return;

            // Check blocked paths
            if (blockedPaths.some(p => path.startsWith(p))) return;

            links.add(clean);
        } catch { /* skip invalid URLs */ }
    });
    return Array.from(links);
}

export async function POST(request: NextRequest) {
    try {
        const { url, botId, websiteId, userId, maxPages = 50, allowedPaths = [], blockedPaths = [] } = await request.json();

        if (!url || !userId) {
            return NextResponse.json({ error: 'url and userId are required' }, { status: 400 });
        }

        // Rate limiting
        const rateLimit = rateLimitCrawl(userId);
        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: 'Too many crawl requests. Please wait.', retryAfter: rateLimit.retryAfterMs },
                { status: 429 }
            );
        }

        const admin = getAdminClient();
        const baseUrl = url.replace(/\/$/, '');

        // 1. Create or get data source
        let dataSourceId: string;
        const { data: existingDS } = await admin
            .from('data_sources')
            .select('id')
            .eq('user_id', userId)
            .eq('type', 'website')
            .eq('config->>url', baseUrl)
            .single();

        if (existingDS) {
            dataSourceId = existingDS.id;
            await admin.from('data_sources').update({ status: 'syncing' }).eq('id', dataSourceId);
        } else {
            const { data: ds, error: dsErr } = await admin
                .from('data_sources')
                .insert({
                    user_id: userId,
                    type: 'website',
                    name: new URL(baseUrl).hostname,
                    config: { url: baseUrl, maxPages, allowedPaths, blockedPaths },
                    status: 'syncing',
                })
                .select()
                .single();
            if (dsErr) throw dsErr;
            dataSourceId = ds.id;
        }

        // 2. Create or update website record
        let siteId = websiteId;
        if (!siteId) {
            const { data: site, error: siteErr } = await admin
                .from('websites')
                .insert({
                    user_id: userId,
                    data_source_id: dataSourceId,
                    url: baseUrl,
                    name: new URL(baseUrl).hostname,
                    status: 'crawling',
                    allowed_paths: allowedPaths,
                    blocked_paths: blockedPaths,
                })
                .select()
                .single();
            if (siteErr) throw siteErr;
            siteId = site.id;
        } else {
            await admin.from('websites').update({ status: 'crawling' }).eq('id', siteId);
        }

        // 3. BFS Crawl
        const visited = new Set<string>();
        const queue = [baseUrl];
        const pages: { url: string; title: string; text: string; wordCount: number; headings: string[]; hash: string }[] = [];

        while (queue.length > 0 && visited.size < maxPages) {
            const currentUrl = queue.shift()!;
            const normalized = currentUrl.replace(/\/$/, '');
            if (visited.has(normalized)) continue;
            visited.add(normalized);

            try {
                const res = await fetch(normalized, {
                    headers: { 'User-Agent': 'PageAI Bot/2.0 (+https://pageai.io)' },
                    signal: AbortSignal.timeout(15000),
                });
                if (!res.ok) continue;
                const ct = res.headers.get('content-type') || '';
                if (!ct.includes('html')) continue;

                const html = await res.text();
                const { title, text, headings } = extractText(html, normalized);

                if (text.length < 50) continue;

                const wordCount = text.split(/\s+/).length;
                const hash = crypto.createHash('md5').update(text).digest('hex');
                pages.push({ url: normalized, title, text, wordCount, headings, hash });

                // Discover links
                const links = discoverLinks(html, normalized, allowedPaths, blockedPaths);
                for (const link of links) {
                    if (!visited.has(link.replace(/\/$/, '')) && queue.length + visited.size < maxPages) {
                        queue.push(link);
                    }
                }
            } catch {
                // Skip failed pages
            }
        }

        // 4. Store documents and chunks in Supabase
        // Delete old chunks for this data source
        await admin.from('chunks').delete().eq('data_source_id', dataSourceId);

        const allChunks: { content: string; heading: string | null; pageUrl: string; pageTitle: string; docType: string; tokenCount: number; chunkIndex: number }[] = [];

        for (const page of pages) {
            // Upsert document
            const { data: doc } = await admin
                .from('documents')
                .upsert(
                    {
                        data_source_id: dataSourceId,
                        user_id: userId,
                        website_id: siteId,
                        url: page.url,
                        title: page.title,
                        content: page.text.substring(0, 100000),
                        content_hash: page.hash,
                        word_count: page.wordCount,
                        doc_type: 'page',
                        status: 'indexed',
                        last_indexed_at: new Date().toISOString(),
                    },
                    { onConflict: 'data_source_id,COALESCE(external_id, url)' }
                )
                .select('id')
                .single();

            if (!doc) continue;

            // Chunk with semantic-aware chunking (600 token target, 120 overlap)
            const chunks = chunkHTMLContent(page.text, page.title, page.url);

            for (const chunk of chunks) {
                allChunks.push({
                    content: chunk.content,
                    heading: chunk.heading,
                    pageUrl: page.url,
                    pageTitle: page.title,
                    docType: 'page',
                    tokenCount: chunk.tokenCount,
                    chunkIndex: chunk.chunkIndex,
                });
            }
        }

        // 5. Generate embeddings in batch and store chunks with vectors
        const BATCH_SIZE = 50;
        let totalChunksStored = 0;

        for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
            const batch = allChunks.slice(i, i + BATCH_SIZE);
            const texts = batch.map(c => c.content);

            try {
                const embeddings = await generateEmbeddings(texts);

                const chunkRows = batch.map((chunk, j) => ({
                    data_source_id: dataSourceId,
                    user_id: userId,
                    document_id: null as any, // Will be set below
                    content: chunk.content.substring(0, 10000),
                    token_count: chunk.tokenCount,
                    chunk_index: chunk.chunkIndex,
                    embedding: JSON.stringify(embeddings[j]),
                    heading: chunk.heading,
                    page_url: chunk.pageUrl,
                    page_title: chunk.pageTitle,
                    doc_type: chunk.docType,
                    metadata: {},
                }));

                // Find document IDs
                for (const row of chunkRows) {
                    const { data: doc } = await admin
                        .from('documents')
                        .select('id')
                        .eq('data_source_id', dataSourceId)
                        .eq('url', row.page_url)
                        .single();
                    if (doc) row.document_id = doc.id;
                }

                // Insert chunks
                const validRows = chunkRows.filter(r => r.document_id);
                if (validRows.length > 0) {
                    await admin.from('chunks').insert(validRows);
                    totalChunksStored += validRows.length;
                }
            } catch (err) {
                console.error(`Embedding batch ${i} error:`, err);
            }
        }

        // 6. Update website + data source status
        const totalWords = pages.reduce((sum, p) => sum + p.wordCount, 0);
        await admin.from('websites').update({
            status: 'indexed',
            pages_count: pages.length,
            total_words: totalWords,
            last_crawled_at: new Date().toISOString(),
        }).eq('id', siteId);

        await admin.from('data_sources').update({
            status: 'indexed',
            documents_count: pages.length,
            total_chunks: totalChunksStored,
            last_synced_at: new Date().toISOString(),
        }).eq('id', dataSourceId);

        // Update user's total pages indexed
        const { data: userProfile } = await admin
            .from('profiles')
            .select('total_pages_indexed')
            .eq('id', userId)
            .single();

        if (userProfile) {
            await admin.from('profiles').update({
                total_pages_indexed: (userProfile.total_pages_indexed || 0) + pages.length,
            }).eq('id', userId);
        }

        // Invalidate cache for any bots linked to this data source
        if (botId) {
            await invalidateCache(botId);
        }

        return NextResponse.json({
            success: true,
            websiteId: siteId,
            dataSourceId,
            pages: pages.map(p => ({
                url: p.url,
                title: p.title,
                wordCount: p.wordCount,
                status: 'indexed',
            })),
            stats: {
                totalPages: pages.length,
                totalWords,
                totalChunks: totalChunksStored,
                estimatedTokens: Math.ceil(totalWords * 1.3),
            },
        });
    } catch (error: any) {
        console.error('Crawl error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to crawl website' },
            { status: 500 }
        );
    }
}
