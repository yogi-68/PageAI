/**
 * API Integration Manager
 *
 * Handles: credential retrieval, connectivity testing, secure
 * backend-only proxy calls, and response sanitization.
 *
 * All calls happen server-side only. Credentials are never
 * returned to the frontend or included in LLM prompts.
 */

import { getAdminClient } from './supabase';
import { encryptCredentials, decryptCredentials } from './encryption';

// ─── Types ────────────────────────────────────────────────
export type IntegrationType = 'shopify' | 'woocommerce' | 'custom';

export interface ClientIntegration {
    id: string;
    user_id: string;
    name: string;
    type: IntegrationType;
    base_url: string;
    credentials: Record<string, string>; // decrypted, backend-only
    allowed_endpoints: string[];
    is_enabled: boolean;
    last_test_at: string | null;
    last_test_status: 'ok' | 'error' | 'timeout' | null;
    last_test_message: string | null;
    created_at: string;
    updated_at: string;
}

/** Safe version returned to the frontend — no credentials */
export type ClientIntegrationPublic = Omit<ClientIntegration, 'credentials'>;

export interface ProxyCallResult {
    success: boolean;
    data?: Record<string, unknown>;
    error?: string;
    latencyMs: number;
    blocked?: boolean;
}

// ─── Sensitive Field Patterns ─────────────────────────────
// Any key matching these patterns is stripped from API responses
// before being passed to the LLM or returned to the caller.
const SENSITIVE_KEY_PATTERNS = [
    /token/i,
    /password/i,
    /secret/i,
    /api_?key/i,
    /auth/i,
    /bearer/i,
    /credential/i,
    /private/i,
    /internal/i,
    /admin/i,
    /hash/i,
    /salt/i,
    /session/i,
    /cookie/i,
    /signature/i,
    /webhook/i,
    /client_?id/i,
    /client_?secret/i,
    /access_?key/i,
    /refresh_?token/i,
];

// ─── Response Sanitizer ───────────────────────────────────
/**
 * Recursively strips sensitive keys from API response objects.
 * Depth-limited to prevent stack overflow on circular-like deep structures.
 */
export function sanitizeApiResponse(
    data: unknown,
    depth = 0
): unknown {
    if (depth > 8) return '[truncated]';
    if (data === null || data === undefined) return data;
    if (typeof data !== 'object') return data;

    if (Array.isArray(data)) {
        return data.slice(0, 50).map((item) => sanitizeApiResponse(item, depth + 1));
    }

    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
        const isSensitive = SENSITIVE_KEY_PATTERNS.some((p) => p.test(key));
        if (!isSensitive) {
            result[key] = sanitizeApiResponse(value, depth + 1);
        }
    }
    return result;
}

// ─── Endpoint Whitelist Check ─────────────────────────────
function isEndpointAllowed(url: string, allowedEndpoints: string[]): boolean {
    if (allowedEndpoints.length === 0) return false;
    try {
        const parsed = new URL(url);
        const path = parsed.pathname;
        return allowedEndpoints.some((allowed) => path.startsWith(allowed));
    } catch {
        return false;
    }
}

// ─── Build Auth Headers ───────────────────────────────────
function buildAuthHeaders(
    type: IntegrationType,
    credentials: Record<string, string>
): Record<string, string> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'PageCortex/1.0',
    };

    switch (type) {
        case 'shopify':
            if (credentials.apiKey) {
                headers['X-Shopify-Access-Token'] = credentials.apiKey;
            }
            break;
        case 'woocommerce': {
            // WooCommerce uses HTTP Basic auth with consumer key + secret
            const wcCred = `${credentials.consumerKey || ''}:${credentials.consumerSecret || ''}`;
            headers['Authorization'] = `Basic ${Buffer.from(wcCred).toString('base64')}`;
            break;
        }
        case 'custom':
            if (credentials.authHeader) {
                const [headerName, ...rest] = credentials.authHeader.split(':');
                headers[headerName.trim()] = rest.join(':').trim();
            } else if (credentials.apiKey) {
                headers['Authorization'] = `Bearer ${credentials.apiKey}`;
            }
            break;
    }

    return headers;
}

// ─── Main Functions ───────────────────────────────────────

/**
 * Fetch all enabled integrations for a user, with decrypted credentials.
 * Backend-only — never call from client components.
 */
export async function getIntegrationsForUser(userId: string): Promise<ClientIntegration[]> {
    const admin = getAdminClient();
    const { data, error } = await admin
        .from('client_integrations')
        .select('*')
        .eq('user_id', userId)
        .eq('is_enabled', true)
        .order('created_at', { ascending: true });

    if (error || !data) return [];

    return data.map((row) => ({
        ...row,
        credentials: decryptCredentials(row.encrypted_credentials || ''),
    })) as ClientIntegration[];
}

/**
 * Fetch integrations for the dashboard (no credentials in result).
 */
export async function getIntegrationsPublic(userId: string): Promise<ClientIntegrationPublic[]> {
    const admin = getAdminClient();
    const { data, error } = await admin
        .from('client_integrations')
        .select('id, user_id, name, type, base_url, allowed_endpoints, is_enabled, last_test_at, last_test_status, last_test_message, created_at, updated_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

    if (error || !data) return [];
    return data as ClientIntegrationPublic[];
}

/**
 * Test connectivity to an integration's base URL.
 * Tries a lightweight GET/HEAD request and records the result.
 */
export async function testIntegration(
    integrationId: string,
    userId: string
): Promise<{ success: boolean; message: string; latencyMs: number }> {
    const admin = getAdminClient();

    const { data: row } = await admin
        .from('client_integrations')
        .select('*')
        .eq('id', integrationId)
        .eq('user_id', userId)
        .single();

    if (!row) return { success: false, message: 'Integration not found', latencyMs: 0 };

    const credentials = decryptCredentials(row.encrypted_credentials || '');
    const headers = buildAuthHeaders(row.type as IntegrationType, credentials);
    const testUrl = row.base_url.replace(/\/$/, '');

    const start = Date.now();
    let success = false;
    let message = '';

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const res = await fetch(testUrl, {
            method: 'GET',
            headers,
            signal: controller.signal,
        });
        clearTimeout(timeout);

        success = res.status < 500;
        message = success
            ? `Connected — HTTP ${res.status}`
            : `Server error — HTTP ${res.status}`;
    } catch (err: any) {
        if (err?.name === 'AbortError') {
            message = 'Connection timed out (8s)';
        } else {
            message = err?.message || 'Connection failed';
        }
    }

    const latencyMs = Date.now() - start;
    const status = success ? 'ok' : (latencyMs >= 8000 ? 'timeout' : 'error');

    await admin
        .from('client_integrations')
        .update({
            last_test_at: new Date().toISOString(),
            last_test_status: status,
            last_test_message: message,
        })
        .eq('id', integrationId);

    return { success, message, latencyMs };
}

/**
 * Execute a single proxied API call on behalf of the AI.
 * - Validates the endpoint against the whitelist
 * - Injects auth credentials server-side
 * - Sanitizes the response before returning
 * - Times out after 5 seconds
 */
export async function proxyToolCall(
    integration: ClientIntegration,
    endpointPath: string,
    params: Record<string, string> = {}
): Promise<ProxyCallResult> {
    const start = Date.now();

    // Build full URL with query params
    const base = integration.base_url.replace(/\/$/, '');
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = `${base}${endpointPath}${queryString ? `?${queryString}` : ''}`;

    // Whitelist check — block if endpoint not allowed
    if (!isEndpointAllowed(fullUrl, integration.allowed_endpoints)) {
        return {
            success: false,
            error: `Endpoint "${endpointPath}" is not in the allowed list for this integration`,
            latencyMs: Date.now() - start,
            blocked: true,
        };
    }

    const headers = buildAuthHeaders(integration.type, integration.credentials);

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(fullUrl, {
            method: 'GET',
            headers,
            signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!res.ok) {
            return {
                success: false,
                error: `API returned HTTP ${res.status}`,
                latencyMs: Date.now() - start,
            };
        }

        const raw = await res.json();
        const sanitized = sanitizeApiResponse(raw) as Record<string, unknown>;

        return {
            success: true,
            data: sanitized,
            latencyMs: Date.now() - start,
        };
    } catch (err: any) {
        const isTimeout = err?.name === 'AbortError';
        return {
            success: false,
            error: isTimeout ? 'API call timed out (5s)' : (err?.message || 'Request failed'),
            latencyMs: Date.now() - start,
        };
    }
}

/**
 * Persist a tool execution log entry.
 * Non-critical — failures are silently swallowed.
 */
export async function logToolExecution(params: {
    userId: string;
    botId: string;
    integrationId: string | null;
    toolName: string;
    inputParams: Record<string, unknown>;
    outputSummary?: Record<string, unknown>;
    status: 'success' | 'error' | 'timeout' | 'blocked';
    latencyMs: number;
    errorMessage?: string;
}): Promise<void> {
    try {
        const admin = getAdminClient();
        await admin.from('tool_execution_logs').insert({
            user_id: params.userId,
            bot_id: params.botId,
            integration_id: params.integrationId,
            tool_name: params.toolName,
            input_params: params.inputParams,
            output_summary: params.outputSummary || null,
            status: params.status,
            latency_ms: params.latencyMs,
            error_message: params.errorMessage || null,
        });
    } catch {
        // Non-critical
    }
}

/**
 * Create a new integration with encrypted credentials.
 */
export async function createIntegration(params: {
    userId: string;
    name: string;
    type: IntegrationType;
    baseUrl: string;
    credentials: Record<string, string>;
    allowedEndpoints: string[];
}): Promise<{ id: string } | { error: string }> {
    const admin = getAdminClient();
    const encrypted = encryptCredentials(params.credentials);

    const { data, error } = await admin
        .from('client_integrations')
        .insert({
            user_id: params.userId,
            name: params.name,
            type: params.type,
            base_url: params.baseUrl,
            encrypted_credentials: encrypted,
            allowed_endpoints: params.allowedEndpoints,
        })
        .select('id')
        .single();

    if (error) return { error: error.message };
    return { id: data.id };
}

/**
 * Update an existing integration. Re-encrypts credentials if provided.
 */
export async function updateIntegration(params: {
    id: string;
    userId: string;
    name?: string;
    baseUrl?: string;
    credentials?: Record<string, string>;
    allowedEndpoints?: string[];
    isEnabled?: boolean;
}): Promise<{ error?: string }> {
    const admin = getAdminClient();

    const updates: Record<string, unknown> = {};
    if (params.name !== undefined) updates.name = params.name;
    if (params.baseUrl !== undefined) updates.base_url = params.baseUrl;
    if (params.allowedEndpoints !== undefined) updates.allowed_endpoints = params.allowedEndpoints;
    if (params.isEnabled !== undefined) updates.is_enabled = params.isEnabled;
    if (params.credentials !== undefined) {
        updates.encrypted_credentials = encryptCredentials(params.credentials);
    }

    const { error } = await admin
        .from('client_integrations')
        .update(updates)
        .eq('id', params.id)
        .eq('user_id', params.userId);

    return { error: error?.message };
}
