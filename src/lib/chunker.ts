/**
 * Smart Text Chunking for RAG
 *
 * Strategy: Semantic-aware chunking with 600 token target, 120 token overlap
 * Respects heading boundaries and paragraph breaks for better retrieval
 */

// Rough token estimation (~4 chars per token for English)
function estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
}

export interface ChunkResult {
    content: string;
    tokenCount: number;
    chunkIndex: number;
    heading: string | null;
    metadata: Record<string, string>;
}

export interface ChunkOptions {
    targetTokens?: number;     // Target chunk size in tokens (default: 600)
    overlapTokens?: number;    // Overlap between chunks (default: 120)
    minTokens?: number;        // Minimum chunk size (default: 50)
    pageUrl?: string;
    pageTitle?: string;
    docType?: string;
}

// ─── Heading Extraction ───────────────────────────────────
function extractSections(text: string): { heading: string | null; content: string }[] {
    // Split on markdown-style headings or common heading patterns
    const headingPattern = /^(#{1,6}\s+.+|[A-Z][A-Za-z\s]{2,60}:?\s*$)/gm;
    const parts = text.split(headingPattern);

    const sections: { heading: string | null; content: string }[] = [];
    let currentHeading: string | null = null;

    for (const part of parts) {
        const trimmed = part.trim();
        if (!trimmed) continue;

        if (/^#{1,6}\s+/.test(trimmed) || /^[A-Z][A-Za-z\s]{2,60}:?\s*$/.test(trimmed)) {
            currentHeading = trimmed.replace(/^#+\s+/, '').replace(/:$/, '').trim();
        } else {
            sections.push({ heading: currentHeading, content: trimmed });
        }
    }

    if (sections.length === 0 && text.trim()) {
        sections.push({ heading: null, content: text.trim() });
    }

    return sections;
}

// ─── Paragraph-Aware Splitting ────────────────────────────
function splitIntoParagraphs(text: string): string[] {
    return text
        .split(/\n\s*\n|\r\n\s*\r\n/)
        .map(p => p.trim())
        .filter(p => p.length > 10);
}

// ─── Main Chunking Function ──────────────────────────────
export function chunkText(text: string, options: ChunkOptions = {}): ChunkResult[] {
    const {
        targetTokens = 600,
        overlapTokens = 120,
        minTokens = 50,
        pageUrl,
        pageTitle,
        docType,
    } = options;

    const targetChars = targetTokens * 4;
    const overlapChars = overlapTokens * 4;
    const minChars = minTokens * 4;

    const sections = extractSections(text);
    const chunks: ChunkResult[] = [];
    let chunkIndex = 0;

    for (const section of sections) {
        const paragraphs = splitIntoParagraphs(section.content);

        let currentChunk = '';

        for (const paragraph of paragraphs) {
            if (currentChunk.length + paragraph.length + 2 <= targetChars) {
                // Add paragraph to current chunk
                currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
            } else if (currentChunk.length >= minChars) {
                // Current chunk is big enough, save it
                chunks.push({
                    content: currentChunk,
                    tokenCount: estimateTokens(currentChunk),
                    chunkIndex: chunkIndex++,
                    heading: section.heading,
                    metadata: {
                        ...(pageUrl && { pageUrl }),
                        ...(pageTitle && { pageTitle }),
                        ...(docType && { docType }),
                    },
                });

                // Start new chunk with overlap from end of previous
                const overlapText = currentChunk.slice(-overlapChars);
                currentChunk = overlapText + '\n\n' + paragraph;
            } else {
                // Current chunk too small, keep adding
                currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
            }

            // Handle very long paragraphs that exceed target
            while (currentChunk.length > targetChars * 1.5) {
                const splitPoint = findBestSplitPoint(currentChunk, targetChars);
                const chunkContent = currentChunk.slice(0, splitPoint).trim();

                if (chunkContent.length >= minChars) {
                    chunks.push({
                        content: chunkContent,
                        tokenCount: estimateTokens(chunkContent),
                        chunkIndex: chunkIndex++,
                        heading: section.heading,
                        metadata: {
                            ...(pageUrl && { pageUrl }),
                            ...(pageTitle && { pageTitle }),
                            ...(docType && { docType }),
                        },
                    });
                }

                // Keep overlap
                const overlapStart = Math.max(0, splitPoint - overlapChars);
                currentChunk = currentChunk.slice(overlapStart).trim();
            }
        }

        // Flush remaining content
        if (currentChunk.trim().length >= minChars) {
            chunks.push({
                content: currentChunk.trim(),
                tokenCount: estimateTokens(currentChunk.trim()),
                chunkIndex: chunkIndex++,
                heading: section.heading,
                metadata: {
                    ...(pageUrl && { pageUrl }),
                    ...(pageTitle && { pageTitle }),
                    ...(docType && { docType }),
                },
            });
        }
    }

    return chunks;
}

// Find the best split point near the target position
function findBestSplitPoint(text: string, targetPos: number): number {
    const searchStart = Math.max(0, targetPos - 200);
    const searchEnd = Math.min(text.length, targetPos + 200);
    const region = text.slice(searchStart, searchEnd);

    // Prefer splitting at paragraph breaks
    const paraBreak = region.lastIndexOf('\n\n');
    if (paraBreak > 0) return searchStart + paraBreak;

    // Then sentence boundaries
    const sentenceEnd = region.search(/[.!?]\s+(?=[A-Z])/);
    if (sentenceEnd > 0) return searchStart + sentenceEnd + 1;

    // Then any newline
    const lineBreak = region.lastIndexOf('\n');
    if (lineBreak > 0) return searchStart + lineBreak;

    // Fallback to target position
    return targetPos;
}

// ─── HTML Content Chunking (for web pages) ────────────────
export function chunkHTMLContent(
    text: string,
    title: string,
    url: string,
    docType: string = 'page'
): ChunkResult[] {
    return chunkText(text, {
        targetTokens: 600,
        overlapTokens: 120,
        pageUrl: url,
        pageTitle: title,
        docType,
    });
}
