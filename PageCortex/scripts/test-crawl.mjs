/**
 * Crawl smoke test — runs the real crawler against a live site, with no Supabase
 * or OpenAI in the loop, and prints what the indexer would have stored.
 *
 * Usage: node scripts/test-crawl.mjs <url> [maxPages] [mode]
 *   e.g. node scripts/test-crawl.mjs https://www.cardiacdesignlabs.com 20 auto
 *
 * Requires Node 22.6+ (TypeScript type stripping).
 */
import {
    FETCH_CONCURRENCY,
    cleanMarkdown,
    discoverLinks,
    fetchPageContent,
    fetchSitemapUrls,
    normalizeUrl,
    toCrawlableUrl,
} from '../src/lib/crawler.ts';

const url = process.argv[2];
const maxPages = Number(process.argv[3] || 20);
const mode = process.argv[4] || 'auto';

if (!url) {
    console.error('Usage: node scripts/test-crawl.mjs <url> [maxPages] [mode]');
    process.exit(1);
}

const baseUrl = normalizeUrl(url);
const allowedPaths = [];
const blockedPaths = [];

console.log(`Crawling ${baseUrl}  (maxPages=${maxPages}, mode=${mode})\n`);

const t0 = Date.now();
const sitemapUrls = await fetchSitemapUrls(baseUrl, allowedPaths, blockedPaths, maxPages);
console.log(`Sitemap: ${sitemapUrls.length} URL(s) in ${Date.now() - t0}ms`);
for (const u of sitemapUrls.slice(0, 10)) console.log(`  ${u}`);
if (sitemapUrls.length > 10) console.log(`  … ${sitemapUrls.length - 10} more`);
console.log();

// Mirrors the frontier logic in src/app/api/crawl/route.ts
const visited = new Set();
const queued = new Set([baseUrl]);
const queue = [baseUrl];
for (const u of sitemapUrls) {
    if (queued.has(u)) continue;
    queued.add(u);
    queue.push(u);
}

const pages = [];
const enqueue = (link) => {
    const n = normalizeUrl(link);
    if (queued.has(n) || visited.has(n) || queued.size >= maxPages) return;
    queued.add(n);
    queue.push(n);
};

while (queue.length > 0 && visited.size < maxPages) {
    const batch = [];
    while (queue.length > 0 && batch.length < FETCH_CONCURRENCY && visited.size + batch.length < maxPages) {
        const next = normalizeUrl(queue.shift());
        if (visited.has(next) || batch.includes(next)) continue;
        batch.push(next);
    }
    if (batch.length === 0) break;
    for (const u of batch) visited.add(u);

    const results = await Promise.all(batch.map(u => fetchPageContent(u, mode).catch(() => null)));

    for (let i = 0; i < batch.length; i++) {
        const result = results[i];
        if (!result) {
            console.log(`  ✗ ${batch[i]}  (no content)`);
            continue;
        }
        const pageUrl = normalizeUrl(result.finalUrl);
        if (pageUrl !== batch[i]) visited.add(pageUrl);
        const words = result.text.split(/\s+/).length;
        pages.push({ url: pageUrl, title: result.title, words, via: result.html ? 'static' : 'jina' });
        console.log(`  ✓ ${pageUrl}  [${result.html ? 'static' : 'jina'}] ${words} words — ${result.title.slice(0, 70)}`);

        const links = result.html
            ? discoverLinks(result.html, pageUrl, allowedPaths, blockedPaths)
            : (result.markdownLinks || [])
                .map(l => toCrawlableUrl(l, new URL(pageUrl), allowedPaths, blockedPaths))
                .filter(Boolean);
        for (const link of links) enqueue(link);
    }
}

const totalWords = pages.reduce((s, p) => s + p.words, 0);
console.log(`\n${pages.length} page(s), ${totalWords} words, ${Math.round((Date.now() - t0) / 1000)}s`);

if (pages.length > 0) {
    const sample = await fetchPageContent(pages[0].url, mode);
    if (sample) {
        console.log(`\n── extracted text sample (${pages[0].url}) ──`);
        console.log(sample.text.slice(0, 900));
    }
}
