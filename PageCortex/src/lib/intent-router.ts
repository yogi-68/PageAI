/**
 * Intent Router — classifies user queries to determine the response strategy.
 *
 * Decision tree:
 *   1. Fast keyword/regex pattern match (zero LLM cost, ~0ms)
 *   2. If no match and integrations exist, LLM classification (~200ms)
 *   3. Default: RAG-only
 *
 * Output:
 *   route     — 'rag' | 'tool' | 'both'
 *   toolName  — which tool to call (if route includes 'tool')
 *   entities  — extracted entities (order ID, product ID, location)
 */

import { getOpenAI } from './openai';
import type { ToolName } from './tools';

export type RouteDecision = 'rag' | 'tool' | 'both';

export interface IntentResult {
    route: RouteDecision;
    toolName?: ToolName;
    entities: {
        orderId?: string;
        productId?: string;
        location?: string;
        variant?: string;
    };
    confidence: number;
}

// ─── Keyword Patterns ─────────────────────────────────────

// Order ID patterns: #12345, ORD-12345, ORDER-abc123, plain 5-10 digit numbers in context
const ORDER_ID_PATTERN = /(?:order\s*#?\s*|ord[-_]?|#)([A-Z0-9-]{3,20})/i;

// Phrases that strongly signal a live order lookup is needed
const ORDER_STATUS_PHRASES = [
    /where\s+(is|are)\s+(my\s+)?(order|package|shipment|parcel)/i,
    /status\s+of\s+(my\s+)?(order|package)/i,
    /my\s+order\s+(status|update|info)/i,
    /track\s+(my\s+)?(order|package|shipment|parcel)/i,
    /order\s+#?\s*\d/i,
    /hasn'?t?\s+(arrived|shipped|delivered)/i,
    /when\s+will\s+(my\s+)?(order|package|item)\s+(arrive|ship|come|be\s+delivered)/i,
    /order\s+not\s+(received|arrived)/i,
];

// Shipment tracking phrases
const SHIPMENT_PHRASES = [
    /track(ing)?\s+(number|code|id)/i,
    /shipment\s+(status|update|info|location)/i,
    /shipping\s+update/i,
    /package\s+(location|update|status)/i,
    /out\s+for\s+delivery/i,
    /delivery\s+(update|status|tracking)/i,
    /carrier\s+(update|status)/i,
    /\b(ups|fedex|usps|dhl|canada\s*post)\b.*tracking/i,
];

// Product availability phrases
const AVAILABILITY_PHRASES = [
    /in\s+stock/i,
    /out\s+of\s+stock/i,
    /available/i,
    /do\s+you\s+have\s+.+\s+in\s+(size|color|colour)/i,
    /is\s+.+\s+(available|in\s+stock)/i,
    /stock\s+(level|status|check)/i,
    /back\s+in\s+stock/i,
    /when\s+will\s+.+\s+be\s+(back\s+in\s+stock|available|restocked)/i,
    /inventory/i,
];

// Shipping estimate phrases
const SHIPPING_ESTIMATE_PHRASES = [
    /how\s+long\s+(does|will|would)\s+shipping/i,
    /when\s+will\s+it\s+arrive/i,
    /shipping\s+(time|duration|estimate|cost|fee|price|rate)\s+to/i,
    /deliver(y|ed)?\s+(to|in|within)\s+/i,
    /ship\s+to\s+/i,
    /estimated\s+(delivery|arrival|shipping)/i,
    /how\s+fast\s+(is|does)\s+shipping/i,
    /standard\s+(shipping|delivery)/i,
];

// Phrases that always stay in RAG (policy, general info)
const RAG_ONLY_PHRASES = [
    /refund\s+policy/i,
    /return\s+policy/i,
    /terms\s+of\s+service/i,
    /privacy\s+policy/i,
    /how\s+does\s+.+\s+work/i,
    /what\s+is\s+your\s+(pricing|plan|subscription)/i,
    /features?/i,
    /contact\s+(us|support|team)/i,
    /about\s+(you|us|the\s+company)/i,
    /cancel\s+(my\s+)?(subscription|account|plan)/i,
];

// ─── Entity Extractors ────────────────────────────────────
function extractOrderId(query: string): string | undefined {
    const match = query.match(ORDER_ID_PATTERN);
    return match?.[1];
}

function extractLocation(query: string): string | undefined {
    const patterns = [
        /(?:to|in|for)\s+([A-Za-z\s,]+(?:\d{3,6})?)/i,
        /(?:ship(?:ping)?|deliver(?:y)?)\s+to\s+([A-Za-z\s,]+)/i,
        /([A-Za-z]{2,}(?:\s+[A-Za-z]+)*,\s*[A-Z]{2}(?:\s+\d{5})?)/,
    ];
    for (const p of patterns) {
        const m = query.match(p);
        if (m?.[1] && m[1].trim().length > 2) return m[1].trim().slice(0, 100);
    }
    return undefined;
}

function extractProductId(query: string): string | undefined {
    // SKU, product code, or quoted product name
    const sku = query.match(/(?:sku|product\s*(?:id|code|#))[\s:]*([A-Z0-9-]{3,20})/i);
    if (sku) return sku[1];
    // Quoted product name
    const quoted = query.match(/["']([^"']{3,60})["']/);
    if (quoted) return quoted[1];
    return undefined;
}

// ─── Fast Pattern Classifier ──────────────────────────────
function classifyByPattern(query: string): IntentResult | null {
    // Always RAG for policy / general queries
    if (RAG_ONLY_PHRASES.some((p) => p.test(query))) {
        return { route: 'rag', entities: {}, confidence: 0.95 };
    }

    const orderId = extractOrderId(query);
    const location = extractLocation(query);
    const productId = extractProductId(query);

    // Order status
    if (ORDER_STATUS_PHRASES.some((p) => p.test(query))) {
        return {
            route: 'tool',
            toolName: 'getOrderStatus',
            entities: { orderId },
            confidence: 0.9,
        };
    }

    // Shipment tracking
    if (SHIPMENT_PHRASES.some((p) => p.test(query))) {
        const entities = { orderId };
        return { route: 'tool', toolName: 'trackShipment', entities, confidence: 0.9 };
    }

    // Product availability
    if (AVAILABILITY_PHRASES.some((p) => p.test(query))) {
        return {
            route: 'tool',
            toolName: 'getProductAvailability',
            entities: { productId },
            confidence: 0.85,
        };
    }

    // Shipping estimate
    if (SHIPPING_ESTIMATE_PHRASES.some((p) => p.test(query))) {
        return {
            route: 'tool',
            toolName: 'getShippingEstimate',
            entities: { location, productId },
            confidence: 0.85,
        };
    }

    return null;
}

// ─── LLM Classifier (fallback) ────────────────────────────
const CLASSIFICATION_PROMPT = `You are an intent classifier for an e-commerce AI assistant.
Classify the user query into one of these categories:

- "rag": Answer from static knowledge base only (policies, features, how-it-works, company info)
- "tool_order_status": Needs live order status lookup
- "tool_track_shipment": Needs live shipment tracking
- "tool_product_availability": Needs live product/inventory check
- "tool_shipping_estimate": Needs live shipping time/cost estimate
- "both_order": Needs order status + policy context
- "both_shipping": Needs shipping estimate + policy context

Respond with ONLY a JSON object: { "category": "...", "orderId": "...", "productId": "...", "location": "..." }
Leave fields null if not found in the query.`;

async function classifyByLLM(query: string): Promise<IntentResult> {
    try {
        const res = await getOpenAI().chat.completions.create({
            model: 'gpt-4.1-mini',
            messages: [
                { role: 'system', content: CLASSIFICATION_PROMPT },
                { role: 'user', content: query },
            ],
            temperature: 0,
            max_tokens: 120,
            response_format: { type: 'json_object' },
        });

        const raw = res.choices[0]?.message?.content?.trim() || '{}';
        const parsed = JSON.parse(raw);
        const cat: string = parsed.category || 'rag';

        const entities = {
            orderId: parsed.orderId || undefined,
            productId: parsed.productId || undefined,
            location: parsed.location || undefined,
        };

        if (cat === 'tool_order_status') {
            return { route: 'tool', toolName: 'getOrderStatus', entities, confidence: 0.8 };
        }
        if (cat === 'tool_track_shipment') {
            return { route: 'tool', toolName: 'trackShipment', entities, confidence: 0.8 };
        }
        if (cat === 'tool_product_availability') {
            return { route: 'tool', toolName: 'getProductAvailability', entities, confidence: 0.8 };
        }
        if (cat === 'tool_shipping_estimate') {
            return { route: 'tool', toolName: 'getShippingEstimate', entities, confidence: 0.8 };
        }
        if (cat === 'both_order') {
            return { route: 'both', toolName: 'getOrderStatus', entities, confidence: 0.75 };
        }
        if (cat === 'both_shipping') {
            return { route: 'both', toolName: 'getShippingEstimate', entities, confidence: 0.75 };
        }

        return { route: 'rag', entities, confidence: 0.8 };
    } catch {
        return { route: 'rag', entities: {}, confidence: 0.5 };
    }
}

// ─── Public API ───────────────────────────────────────────
/**
 * Classify a query and return the routing decision.
 *
 * @param query          The user's message
 * @param hasIntegrations Whether the bot owner has any enabled integrations.
 *                        If false, always routes to RAG (no tool calls possible).
 */
export async function classifyQuery(
    query: string,
    hasIntegrations: boolean
): Promise<IntentResult> {
    // No integrations configured — always RAG
    if (!hasIntegrations) {
        return { route: 'rag', entities: {}, confidence: 1.0 };
    }

    // Fast path: keyword/pattern matching
    const patternResult = classifyByPattern(query);
    if (patternResult) return patternResult;

    // Slow path: LLM classification (only for ambiguous queries)
    return classifyByLLM(query);
}
