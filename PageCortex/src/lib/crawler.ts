/**
 * Website crawling: page fetching, text extraction and frontier discovery.
 *
 * Kept out of the route handler so the crawl strategy can be exercised directly
 * against real sites in tests, without Supabase or OpenAI in the loop.
 */
import * as cheerio from 'cheerio';

export const CRAWLER_UA = 'PageCortex Bot/2.0 (+https://www.pagecortex.com)';

// Pages are fetched in parallel batches — a serial crawl spends nearly all its time
// waiting on network I/O, and JS-rendered pages go through Jina at ~2-5s each.
export const FETCH_CONCURRENCY = 5;

const SKIP_FILE_EXT = /\.(pdf|jpg|jpeg|png|gif|webp|avif|css|js|json|xml|zip|gz|mp4|mp3|wav|woff|woff2|ttf|eot|ico|svg)$/i;

export const normalizeUrl = (u: string) => u.replace(/\/$/, '');

export interface FetchedPage {
    title: string;
    text: string;
    headings: string[];
    html: string;
    finalUrl: string;
    // Links recovered from Jina markdown, for pages that have no raw HTML to scan.
    markdownLinks?: string[];
}

// Shared same-host / path-filter gate, so HTML links, markdown links and sitemap
// entries are all admitted on identical rules.
export function toCrawlableUrl(
    candidate: string,
    base: URL,
    allowedPaths: string[],
    blockedPaths: string[]
): string | null {
    try {
        const resolved = new URL(candidate, base);
        if (resolved.protocol !== 'http:' && resolved.protocol !== 'https:') return null;
        if (resolved.hostname !== base.hostname) return null;

        resolved.hash = '';
        if (SKIP_FILE_EXT.test(resolved.pathname)) return null;

        const path = resolved.pathname;
        if (allowedPaths.length > 0 && !allowedPaths.some(p => path.startsWith(p))) return null;
        if (blockedPaths.some(p => path.startsWith(p))) return null;

        return normalizeUrl(resolved.toString());
    } catch {
        return null;
    }
}

// Extract text content from HTML
export function extractText(html: string, pageUrl: string): { title: string; text: string; headings: string[] } {
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
export function discoverLinks(html: string, baseUrl: string, allowedPaths: string[], blockedPaths: string[]): string[] {
    const $ = cheerio.load(html);
    const links: Set<string> = new Set();
    const base = new URL(baseUrl);

    $('a[href]').each((_, el) => {
        const href = $(el).attr('href');
        if (!href) return;
        const clean = toCrawlableUrl(href, base, allowedPaths, blockedPaths);
        if (clean) links.add(clean);
    });
    return Array.from(links);
}

// Discover links from Jina markdown. JS-rendered sites hand back no usable HTML, so
// without this a SPA crawl can never get past its entry page.
export function discoverLinksFromMarkdown(
    markdown: string,
    baseUrl: string,
    allowedPaths: string[],
    blockedPaths: string[]
): string[] {
    const base = new URL(baseUrl);
    const links: Set<string> = new Set();

    const patterns = [
        /\]\(\s*([^)\s]+)/g,        // [text](url) and ![alt](url)
        /<(https?:\/\/[^>\s]+)>/g,  // <https://...>
    ];
    for (const pattern of patterns) {
        for (const m of markdown.matchAll(pattern)) {
            const clean = toCrawlableUrl(m[1], base, allowedPaths, blockedPaths);
            if (clean) links.add(clean);
        }
    }
    return Array.from(links);
}

// Jina wraps its markdown in a short preamble and leaves image embeds and raw CDN
// URLs inline. Those tokens answer no question but do dominate chunks on
// image-heavy marketing sites, dragging retrieval quality down, so drop them before
// chunking and embedding.
export function cleanMarkdown(markdown: string): string {
    return markdown
        // Jina's "Title: / URL Source: / Markdown Content:" preamble
        .replace(/^[\s\S]*?^Markdown Content:[ \t]*$/m, '')
        // Image embeds, including an image used as a link's label
        .replace(/\[!\[[^\]]*\]\([^)]*\)([^\]]*)\]\([^)]*\)/g, '$1')
        .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
        // Keep the link text, drop the URL
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
        // Leftover bare URLs
        .replace(/<https?:\/\/[^>\s]+>/g, '')
        .replace(/https?:\/\/\S+/g, '')
        // List items and table cells that held nothing but a stripped image
        .replace(/^[ \t]*[-*+][ \t]*$/gm, '')
        .replace(/^[ \t]*\|[\s|]*$/gm, '')
        // Tidy the whitespace the removals leave behind
        .replace(/[ \t]{2,}/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

// Walk the site's sitemaps to seed the crawl. This is the only reliable way to
// enumerate pages on a JS-rendered site, whose served HTML contains no links at all.
export async function fetchSitemapUrls(
    baseUrl: string,
    allowedPaths: string[],
    blockedPaths: string[],
    limit: number
): Promise<string[]> {
    const base = new URL(baseUrl);
    const found = new Set<string>();
    const seenSitemaps = new Set<string>();
    const queue: string[] = [];

    // robots.txt is authoritative about where the sitemap actually lives
    try {
        const res = await fetch(new URL('/robots.txt', base).toString(), {
            headers: { 'User-Agent': CRAWLER_UA },
            signal: AbortSignal.timeout(10000),
        });
        if (res.ok) {
            const robots = await res.text();
            for (const m of robots.matchAll(/^[ \t]*sitemap:[ \t]*(\S+)/gim)) queue.push(m[1]);
        }
    } catch { /* robots.txt is optional */ }

    for (const p of ['/sitemap.xml', '/sitemap_index.xml', '/sitemap-index.xml', '/sitemap.txt']) {
        queue.push(new URL(p, base).toString());
    }

    // A sitemap index points at further sitemaps, so walk them breadth-first.
    while (queue.length > 0 && found.size < limit && seenSitemaps.size < 25) {
        const sitemapUrl = queue.shift()!;
        if (seenSitemaps.has(sitemapUrl)) continue;
        seenSitemaps.add(sitemapUrl);

        let body: string;
        try {
            const res = await fetch(sitemapUrl, {
                headers: { 'User-Agent': CRAWLER_UA },
                signal: AbortSignal.timeout(15000),
            });
            if (!res.ok) continue;
            body = await res.text();
        } catch {
            continue;
        }

        // sitemap.txt is a plain newline-delimited URL list
        if (!body.includes('<')) {
            for (const line of body.split(/\r?\n/)) {
                const clean = toCrawlableUrl(line.trim(), base, allowedPaths, blockedPaths);
                if (clean && found.size < limit) found.add(clean);
            }
            continue;
        }

        const $ = cheerio.load(body, { xmlMode: true });
        const isIndex = $('sitemapindex').length > 0;
        $('loc').each((_, el) => {
            const loc = $(el).text().trim();
            if (!loc) return;
            if (isIndex) {
                queue.push(loc);
                return;
            }
            const clean = toCrawlableUrl(loc, base, allowedPaths, blockedPaths);
            if (clean && found.size < limit) found.add(clean);
        });
    }

    return Array.from(found);
}

// Fetch a page using Cheerio (fast) with optional Jina AI SPA fallback
export async function fetchPageContent(
    pageUrl: string,
    crawlMode: string
): Promise<FetchedPage | null> {
    // ── SPA mode: go straight to Jina AI Reader ──────────────────────────
    if (crawlMode === 'spa') {
        return jinaFetch(pageUrl);
    }

    // ── Static / Auto: try Cheerio first ────────────────────────────────
    try {
        const res = await fetch(pageUrl, {
            headers: { 'User-Agent': CRAWLER_UA },
            signal: AbortSignal.timeout(15000),
        });
        if (!res.ok) return null;
        const ct = res.headers.get('content-type') || '';
        if (!ct.includes('html')) return null;
        const html = await res.text();
        const { title, text, headings } = extractText(html, pageUrl);
        // Use the post-redirect URL as the page's identity so redirected pages
        // (e.g. www → apex, trailing slash normalization) aren't stored/cited under a stale URL.
        const finalUrl = res.url || pageUrl;
        // If static extraction gives <200 chars AND mode is auto, try Jina AI
        if (text.length < 200 && crawlMode === 'auto') {
            const jina = await jinaFetch(pageUrl);
            if (jina) return jina;
        }
        return text.length >= 50 ? { title, text, headings, html, finalUrl } : null;
    } catch {
        // If static fetch fails and mode is auto, try Jina AI
        if (crawlMode === 'auto') return jinaFetch(pageUrl);
        return null;
    }
}

// Jina AI Reader: renders JS-heavy pages and returns clean markdown
// Free, no API key required, respects robots.txt
export async function jinaFetch(pageUrl: string): Promise<FetchedPage | null> {
    try {
        const jinaUrl = `https://r.jina.ai/${pageUrl}`;
        const res = await fetch(jinaUrl, {
            headers: {
                'User-Agent': 'PageCortex Bot/2.0',
                'X-Return-Format': 'markdown',
            },
            signal: AbortSignal.timeout(30000),
        });
        if (!res.ok) return null;
        const markdown = await res.text();
        if (markdown.length < 50) return null;

        // Jina states the real <title> in its preamble; the first markdown heading is
        // usually just hero copy, so only fall back to that.
        const preambleTitle = markdown.match(/^Title:[ \t]*(.+)$/m);
        const headingTitle = markdown.match(/^#\s+(.+)$/m);
        const title = preambleTitle?.[1].trim() || headingTitle?.[1].trim() || pageUrl;
        const sourceUrl = markdown.match(/^URL Source:[ \t]*(\S+)$/m)?.[1];

        // Pull links off the raw markdown before cleaning strips the URLs out.
        // Path filters are applied by the caller, which knows the crawl's config.
        const markdownLinks = discoverLinksFromMarkdown(markdown, pageUrl, [], []);

        const text = cleanMarkdown(markdown);
        if (text.length < 50) return null;

        const headings: string[] = [];
        for (const m of text.matchAll(/^#{1,4}\s+(.+)$/gm)) headings.push(m[1].trim());

        return { title, text, headings, html: '', finalUrl: sourceUrl || pageUrl, markdownLinks };
    } catch {
        return null;
    }
}
