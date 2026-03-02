import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { getAdminClient } from '@/lib/supabase';
import { generateEmbedding } from '@/lib/openai';
import { upsertEmbeddings, deleteByFilter } from '@/lib/pinecone';

// Chunk text into ~400 word segments with overlap
function chunkText(text: string, chunkSize = 400, overlap = 50): string[] {
    const words = text.split(/\s+/);
    const chunks: string[] = [];
    for (let i = 0; i < words.length; i += chunkSize - overlap) {
        const chunk = words.slice(i, i + chunkSize).join(' ');
        if (chunk.trim().length > 20) chunks.push(chunk.trim());
    }
    return chunks;
}

// Extract text content from HTML
function extractText(html: string, pageUrl: string): { title: string; text: string } {
    const $ = cheerio.load(html);
    // Remove scripts, styles, nav, footer, etc.
    $('script, style, nav, footer, header, iframe, noscript, svg').remove();
    const title = $('title').text().trim() || $('h1').first().text().trim() || pageUrl;
    const text = $('body').text().replace(/\s+/g, ' ').trim();
    return { title, text };
}

// Discover links from a page
function discoverLinks(html: string, baseUrl: string): string[] {
    const $ = cheerio.load(html);
    const links: Set<string> = new Set();
    const base = new URL(baseUrl);

    $('a[href]').each((_, el) => {
        try {
            const href = $(el).attr('href');
            if (!href) return;
            const resolved = new URL(href, baseUrl);
            // Only same-domain links
            if (resolved.hostname === base.hostname) {
                // Remove hash, query params for dedup
                resolved.hash = '';
                const clean = resolved.toString().replace(/\/$/, '');
                // Skip files, images, etc.
                if (!/\.(pdf|jpg|jpeg|png|gif|svg|css|js|zip|mp4|mp3)$/i.test(clean)) {
                    links.add(clean);
                }
            }
        } catch { /* skip invalid URLs */ }
    });
    return Array.from(links);
}

export async function POST(request: NextRequest) {
    try {
        const { url, botId, websiteId, userId, maxPages = 20 } = await request.json();

        if (!url || !userId) {
            return NextResponse.json({ error: 'url and userId are required' }, { status: 400 });
        }

        const admin = getAdminClient();
        const baseUrl = url.replace(/\/$/, '');

        // 1. Create or update website record
        let siteId = websiteId;
        if (!siteId) {
            const { data: site, error: siteErr } = await admin
                .from('websites')
                .insert({ user_id: userId, url: baseUrl, name: new URL(baseUrl).hostname, status: 'crawling' })
                .select()
                .single();
            if (siteErr) throw siteErr;
            siteId = site.id;
        } else {
            await admin.from('websites').update({ status: 'crawling' }).eq('id', siteId);
        }

        // 2. Crawl pages
        const visited = new Set<string>();
        const queue = [baseUrl];
        const pages: { url: string; title: string; text: string; wordCount: number }[] = [];

        while (queue.length > 0 && visited.size < maxPages) {
            const currentUrl = queue.shift()!;
            const normalized = currentUrl.replace(/\/$/, '');
            if (visited.has(normalized)) continue;
            visited.add(normalized);

            try {
                const res = await fetch(normalized, {
                    headers: { 'User-Agent': 'PageAI Bot/1.0' },
                    signal: AbortSignal.timeout(10000),
                });
                if (!res.ok) continue;
                const ct = res.headers.get('content-type') || '';
                if (!ct.includes('html')) continue;

                const html = await res.text();
                const { title, text } = extractText(html, normalized);

                if (text.length < 50) continue; // Skip near-empty pages

                const wordCount = text.split(/\s+/).length;
                pages.push({ url: normalized, title, text, wordCount });

                // Discover new links
                const links = discoverLinks(html, normalized);
                for (const link of links) {
                    if (!visited.has(link.replace(/\/$/, '')) && queue.length + visited.size < maxPages) {
                        queue.push(link);
                    }
                }
            } catch {
                // Skip failed pages
            }
        }

        // 3. Store pages in Supabase
        for (const page of pages) {
            await admin.from('pages').upsert(
                {
                    website_id: siteId,
                    url: page.url,
                    title: page.title,
                    content: page.text.substring(0, 50000), // Limit content storage
                    word_count: page.wordCount,
                    status: 'indexed',
                    last_indexed_at: new Date().toISOString(),
                },
                { onConflict: 'website_id,url' }
            );
        }

        // 4. Generate embeddings and upsert to Pinecone
        if (botId) {
            // Delete old embeddings for this bot
            try {
                await deleteByFilter({ botId });
            } catch { /* first time, no old embeddings */ }
        }

        const vectors: { id: string; values: number[]; metadata: Record<string, string> }[] = [];

        for (const page of pages) {
            const chunks = chunkText(page.text);
            for (let i = 0; i < chunks.length; i++) {
                try {
                    const embedding = await generateEmbedding(chunks[i]);
                    vectors.push({
                        id: `${siteId}_${page.url}_chunk_${i}`,
                        values: embedding,
                        metadata: {
                            botId: botId || siteId,
                            websiteId: siteId,
                            pageUrl: page.url,
                            pageTitle: page.title,
                            chunkIndex: String(i),
                            text: chunks[i].substring(0, 1000), // Pinecone metadata limit
                        },
                    });
                } catch (embErr) {
                    console.error('Embedding error for chunk', i, 'of', page.url, embErr);
                }
            }
        }

        if (vectors.length > 0) {
            await upsertEmbeddings(vectors);
        }

        // 5. Update website status
        const totalWords = pages.reduce((sum, p) => sum + p.wordCount, 0);
        await admin.from('websites').update({
            status: 'indexed',
            pages_count: pages.length,
            total_words: totalWords,
            last_crawled_at: new Date().toISOString(),
        }).eq('id', siteId);

        return NextResponse.json({
            success: true,
            websiteId: siteId,
            pages: pages.map(p => ({
                url: p.url,
                title: p.title,
                wordCount: p.wordCount,
                status: 'indexed',
            })),
            stats: {
                totalPages: pages.length,
                totalWords,
                totalChunks: vectors.length,
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
