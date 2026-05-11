/**
 * Tool Definitions & Executor
 *
 * Defines OpenAI-compatible tool schemas and maps each tool call
 * to a secure proxied API call via the client's integration config.
 *
 * Supported tools:
 *   getOrderStatus       — live order status + ETA
 *   trackShipment        — real-time shipment tracking
 *   getProductAvailability — stock levels + variants
 *   getShippingEstimate  — delivery estimate for a location
 */

import type { ClientIntegration } from './api-integrations';
import { proxyToolCall, sanitizeApiResponse, logToolExecution } from './api-integrations';

// ─── OpenAI Tool Definitions ──────────────────────────────
export const TOOL_DEFINITIONS = [
    {
        type: 'function' as const,
        function: {
            name: 'getOrderStatus',
            description:
                'Look up the current status of a customer order by order ID or order number. ' +
                'Returns order status, items, estimated delivery date, and tracking info if available. ' +
                'Use when a customer asks "where is my order", "what is the status of order #X", or similar.',
            parameters: {
                type: 'object',
                properties: {
                    orderId: {
                        type: 'string',
                        description: 'The order ID, order number, or reference code. Extract from the user message.',
                    },
                },
                required: ['orderId'],
            },
        },
    },
    {
        type: 'function' as const,
        function: {
            name: 'trackShipment',
            description:
                'Track the current shipping status of an order. Returns carrier, tracking number, ' +
                'current location, and estimated delivery. Use when a customer asks "track my shipment", ' +
                '"where is my package", "has my order shipped", or provides a tracking number.',
            parameters: {
                type: 'object',
                properties: {
                    orderId: {
                        type: 'string',
                        description: 'The order ID or tracking number to look up shipment status for.',
                    },
                },
                required: ['orderId'],
            },
        },
    },
    {
        type: 'function' as const,
        function: {
            name: 'getProductAvailability',
            description:
                'Check whether a product is in stock and get availability details. ' +
                'Returns stock status, quantity available, and available variants (size/color). ' +
                'Use when a customer asks "is this in stock", "do you have size X", "is [product] available".',
            parameters: {
                type: 'object',
                properties: {
                    productId: {
                        type: 'string',
                        description: 'The product ID, SKU, or product name/handle to check availability for.',
                    },
                    variant: {
                        type: 'string',
                        description: 'Optional specific variant (size, color, etc.) to check.',
                    },
                },
                required: ['productId'],
            },
        },
    },
    {
        type: 'function' as const,
        function: {
            name: 'getShippingEstimate',
            description:
                'Get an estimated shipping time and cost to a location. ' +
                'Use when a customer asks "when will it arrive", "how long does shipping take to X", ' +
                '"what are the shipping options to [city/country]".',
            parameters: {
                type: 'object',
                properties: {
                    location: {
                        type: 'string',
                        description: 'The destination — city, state, country, or zip/postal code.',
                    },
                    productId: {
                        type: 'string',
                        description: 'Optional product ID if the customer is asking about a specific product.',
                    },
                },
                required: ['location'],
            },
        },
    },
] as const;

export type ToolName = 'getOrderStatus' | 'trackShipment' | 'getProductAvailability' | 'getShippingEstimate';

export interface ToolCallResult {
    toolName: ToolName;
    success: boolean;
    context: string;        // Human-readable context for the LLM
    rawData?: Record<string, unknown>;
    error?: string;
    latencyMs: number;
    integrationId: string | null;
}

// ─── Endpoint Mapping ─────────────────────────────────────
// Maps tool names to endpoint path templates per integration type.
// {param} placeholders are replaced with actual argument values.
const ENDPOINT_MAP: Record<string, Record<string, string>> = {
    shopify: {
        getOrderStatus:          '/admin/api/2024-01/orders/{orderId}.json',
        trackShipment:           '/admin/api/2024-01/orders/{orderId}/fulfillments.json',
        getProductAvailability:  '/admin/api/2024-01/products/{productId}.json',
        getShippingEstimate:     '/admin/api/2024-01/shipping_zones.json',
    },
    woocommerce: {
        getOrderStatus:          '/wp-json/wc/v3/orders/{orderId}',
        trackShipment:           '/wp-json/wc/v3/orders/{orderId}',
        getProductAvailability:  '/wp-json/wc/v3/products/{productId}',
        getShippingEstimate:     '/wp-json/wc/v3/shipping/zones',
    },
    custom: {
        getOrderStatus:          '/orders/{orderId}',
        trackShipment:           '/shipments/{orderId}',
        getProductAvailability:  '/products/{productId}',
        getShippingEstimate:     '/shipping/estimate',
    },
};

function buildEndpoint(
    template: string,
    args: Record<string, string>
): { path: string; params: Record<string, string> } {
    let path = template;
    const remainingParams: Record<string, string> = {};

    for (const [key, value] of Object.entries(args)) {
        if (path.includes(`{${key}}`)) {
            path = path.replace(`{${key}}`, encodeURIComponent(value));
        } else {
            remainingParams[key] = value;
        }
    }

    return { path, params: remainingParams };
}

// ─── Context Formatters ───────────────────────────────────
// Transform raw sanitized API data into readable LLM context strings.
function formatOrderStatus(data: Record<string, unknown>, source: string): string {
    // Handle Shopify envelope
    const order = (data.order || data) as Record<string, unknown>;

    const lines: string[] = [`[Live Order Data from ${source}]`];

    if (order.order_number || order.id) {
        lines.push(`Order: #${order.order_number || order.id}`);
    }
    if (order.financial_status || order.status) {
        lines.push(`Payment Status: ${order.financial_status || order.status}`);
    }
    if (order.fulfillment_status) {
        lines.push(`Fulfillment: ${order.fulfillment_status || 'unfulfilled'}`);
    }
    if (order.created_at) {
        lines.push(`Ordered: ${new Date(order.created_at as string).toLocaleDateString()}`);
    }

    const lineItems = (order.line_items || order.items) as unknown[];
    if (Array.isArray(lineItems) && lineItems.length > 0) {
        const items = lineItems.slice(0, 5).map((i: any) =>
            `${i.name || i.title || 'Item'} × ${i.quantity || 1}`
        );
        lines.push(`Items: ${items.join(', ')}`);
    }

    return lines.join('\n');
}

function formatShipmentTracking(data: Record<string, unknown>, source: string): string {
    const fulfillments = (data.fulfillments || (Array.isArray(data) ? data : [data])) as unknown[];
    const lines: string[] = [`[Live Shipment Data from ${source}]`];

    if (!Array.isArray(fulfillments) || fulfillments.length === 0) {
        lines.push('No shipment found for this order yet.');
        return lines.join('\n');
    }

    const latest = fulfillments[fulfillments.length - 1] as Record<string, unknown>;
    if (latest.tracking_number) lines.push(`Tracking #: ${latest.tracking_number}`);
    if (latest.tracking_company) lines.push(`Carrier: ${latest.tracking_company}`);
    if (latest.status) lines.push(`Shipment Status: ${latest.status}`);
    if (latest.estimated_delivery) {
        lines.push(`Estimated Delivery: ${new Date(latest.estimated_delivery as string).toLocaleDateString()}`);
    }

    return lines.join('\n');
}

function formatProductAvailability(data: Record<string, unknown>, source: string): string {
    const product = (data.product || data) as Record<string, unknown>;
    const lines: string[] = [`[Live Product Data from ${source}]`];

    if (product.title || product.name) lines.push(`Product: ${product.title || product.name}`);
    if (typeof product.status === 'string') lines.push(`Status: ${product.status}`);

    const variants = (product.variants) as unknown[];
    if (Array.isArray(variants) && variants.length > 0) {
        const available = variants.filter((v: any) => v.inventory_quantity > 0 || v.stock_status === 'instock');
        lines.push(`Available variants: ${available.length} of ${variants.length}`);
        available.slice(0, 5).forEach((v: any) => {
            const label = [v.title, v.option1, v.option2].filter(Boolean).join(' / ');
            const qty = v.inventory_quantity != null ? ` (${v.inventory_quantity} in stock)` : '';
            if (label) lines.push(`  • ${label}${qty}`);
        });
    } else if (product.stock_status) {
        lines.push(`Stock: ${product.stock_status === 'instock' ? 'In stock' : 'Out of stock'}`);
    }

    return lines.join('\n');
}

function formatShippingEstimate(data: Record<string, unknown>, source: string): string {
    const lines: string[] = [`[Live Shipping Data from ${source}]`];
    const zones = (data.shipping_zones || data.zones || (Array.isArray(data) ? data : [data])) as unknown[];

    if (!Array.isArray(zones) || zones.length === 0) {
        lines.push('No shipping information available for this location.');
        return lines.join('\n');
    }

    zones.slice(0, 3).forEach((zone: any) => {
        const name = zone.name || zone.zone_name || 'Standard';
        const rates = zone.price_based_shipping_rates || zone.shipping_rates || [];
        if (Array.isArray(rates) && rates.length > 0) {
            rates.slice(0, 2).forEach((r: any) => {
                lines.push(`${name}: ${r.name || 'Shipping'} — $${r.price || r.rate || '?'}`);
            });
        }
    });

    if (lines.length === 1) lines.push('Shipping details retrieved. Please contact support for exact estimates.');

    return lines.join('\n');
}

function buildContextString(
    toolName: ToolName,
    data: Record<string, unknown>,
    integrationName: string
): string {
    switch (toolName) {
        case 'getOrderStatus':      return formatOrderStatus(data, integrationName);
        case 'trackShipment':       return formatShipmentTracking(data, integrationName);
        case 'getProductAvailability': return formatProductAvailability(data, integrationName);
        case 'getShippingEstimate': return formatShippingEstimate(data, integrationName);
        default:                    return `[Live API Data]\n${JSON.stringify(sanitizeApiResponse(data), null, 2).slice(0, 1000)}`;
    }
}

// ─── Integration Health & Routing ─────────────────────────
/**
 * Calculate health score for an integration based on recent performance.
 * Score: 0-1 (higher is better)
 */
function calculateIntegrationHealth(integration: ClientIntegration): number {
    let score = 0.5; // Base score

    // Recent test status (+0.3 if OK, -0.2 if error/timeout)
    if (integration.last_test_status === 'ok') {
        score += 0.3;
    } else if (integration.last_test_status === 'error' || integration.last_test_status === 'timeout') {
        score -= 0.2;
    }

    // Recency bonus — tested within last hour (+0.2)
    if (integration.last_test_at) {
        const hoursSinceTest = (Date.now() - new Date(integration.last_test_at).getTime()) / (1000 * 60 * 60);
        if (hoursSinceTest < 1) score += 0.2;
        else if (hoursSinceTest > 24) score -= 0.1; // Penalty for stale
    }

    return Math.max(0, Math.min(1, score));
}

/**
 * Select the best integration for a given tool, ranked by:
 * 1. Tool capability (supports the requested tool)
 * 2. Health score (recent success + low latency)
 * 3. Enabled state
 */
function selectBestIntegration(
    toolName: ToolName,
    integrations: ClientIntegration[]
): ClientIntegration | null {
    // Filter to only integrations that support this tool
    const capable = integrations.filter(int => {
        const endpointTemplate = ENDPOINT_MAP[int.type]?.[toolName];
        return !!endpointTemplate;
    });

    if (capable.length === 0) return null;

    // Rank by health score
    const ranked = capable.map(int => ({
        integration: int,
        health: calculateIntegrationHealth(int),
    })).sort((a, b) => b.health - a.health);

    return ranked[0].integration;
}

// ─── Main Executor (with Smart Routing + Fallback) ────────
/**
 * Execute a tool call with smart integration routing.
 * - Selects best integration based on health and capability
 * - Attempts fallback integrations if first choice fails
 * - Logs all execution attempts
 */
export async function executeToolCall(
    toolName: ToolName,
    args: Record<string, string>,
    integrations: ClientIntegration[],
    botId: string,
    userId: string
): Promise<ToolCallResult> {
    if (integrations.length === 0) {
        return {
            toolName,
            success: false,
            context: '',
            error: 'No integrations configured. Please add an integration in your dashboard.',
            latencyMs: 0,
            integrationId: null,
        };
    }

    // Smart routing: select best integration for this tool
    const primaryIntegration = selectBestIntegration(toolName, integrations);

    if (!primaryIntegration) {
        return {
            toolName,
            success: false,
            context: '',
            error: `No integrations available that support the "${toolName}" tool.`,
            latencyMs: 0,
            integrationId: null,
        };
    }

    // Attempt primary integration
    const result = await attemptToolCall(toolName, args, primaryIntegration, botId, userId);
    
    // If primary succeeded, return immediately
    if (result.success) return result;

    // Fallback: try other capable integrations
    const fallbackIntegrations = integrations.filter(
        int => int.id !== primaryIntegration.id && ENDPOINT_MAP[int.type]?.[toolName]
    );

    for (const fallback of fallbackIntegrations) {
        const fallbackResult = await attemptToolCall(toolName, args, fallback, botId, userId);
        if (fallbackResult.success) return fallbackResult;
    }

    // All integrations failed — return the primary failure with conversational message
    return {
        ...result,
        error: result.error || 'Unable to reach the store system right now. Please try again in a moment.',
    };
}

/**
 * Attempt a single tool call against a specific integration.
 * Logs the result and returns standardized output.
 */
async function attemptToolCall(
    toolName: ToolName,
    args: Record<string, string>,
    integration: ClientIntegration,
    botId: string,
    userId: string
): Promise<ToolCallResult> {
    const endpointTemplate = ENDPOINT_MAP[integration.type]?.[toolName];

    if (!endpointTemplate) {
        return {
            toolName,
            success: false,
            context: '',
            error: `Tool "${toolName}" not supported for ${integration.type}`,
            latencyMs: 0,
            integrationId: integration.id,
        };
    }

    const { path, params } = buildEndpoint(endpointTemplate, args);
    const result = await proxyToolCall(integration, path, params);

    const status = result.blocked
        ? 'blocked'
        : result.success
            ? 'success'
            : (result.latencyMs >= 4900 ? 'timeout' : 'error');

    // Log execution
    void logToolExecution({
        userId,
        botId,
        integrationId: integration.id,
        toolName,
        inputParams: args as Record<string, unknown>,
        outputSummary: result.success ? { keys: Object.keys(result.data || {}) } : undefined,
        status,
        latencyMs: result.latencyMs,
        errorMessage: result.error,
    });

    if (!result.success || !result.data) {
        return {
            toolName,
            success: false,
            context: '',
            error: result.error,
            latencyMs: result.latencyMs,
            integrationId: integration.id,
        };
    }

    const context = buildContextString(toolName, result.data, integration.name);

    return {
        toolName,
        success: true,
        context,
        rawData: result.data,
        latencyMs: result.latencyMs,
        integrationId: integration.id,
    };
}
