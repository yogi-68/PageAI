// ─── Alerting Utilities ──────────────────────────────────
// Threshold-based alerting via structured logger.
// In production, Vercel Log Drains forward these to your alerting provider
// (Datadog, PagerDuty, Slack webhook, etc).

import { logger } from './logger';

// ─── Counters (in-memory, per-instance) ─────────────────
const counters = new Map<string, { count: number; windowStart: number }>();

const WINDOW_MS = 60_000; // 1-minute sliding window

function increment(key: string): number {
    const now = Date.now();
    const c = counters.get(key);
    if (!c || now - c.windowStart > WINDOW_MS) {
        counters.set(key, { count: 1, windowStart: now });
        return 1;
    }
    c.count += 1;
    return c.count;
}

// ─── OpenAI Health ──────────────────────────────────────
const OPENAI_ERROR_THRESHOLD = 5; // errors per minute before alerting

export function recordOpenAIError(error: any): void {
    const count = increment('openai_error');
    logger.error('chat', `OpenAI error (${count}/min)`, {
        status: error?.status,
        code: error?.code,
        message: error?.message?.slice(0, 200),
    });

    if (count === OPENAI_ERROR_THRESHOLD) {
        logger.error('api', '🚨 ALERT: OpenAI error rate spike', {
            alert: 'openai_error_spike',
            errorsPerMinute: count,
            threshold: OPENAI_ERROR_THRESHOLD,
        });
    }
}

// ─── Webhook Health ─────────────────────────────────────
const WEBHOOK_FAIL_THRESHOLD = 3;

export function recordWebhookFailure(eventType: string, error: any): void {
    const count = increment('webhook_fail');
    logger.error('webhook', `Webhook processing failed (${count}/min)`, {
        eventType,
        message: error?.message?.slice(0, 200),
    });

    if (count === WEBHOOK_FAIL_THRESHOLD) {
        logger.error('api', '🚨 ALERT: Webhook failure spike', {
            alert: 'webhook_failure_spike',
            failuresPerMinute: count,
            threshold: WEBHOOK_FAIL_THRESHOLD,
        });
    }
}

// ─── Usage Alert (near limit) ───────────────────────────
export function checkUsageAlert(
    userId: string,
    used: number,
    limit: number
): void {
    const pct = limit > 0 ? (used / limit) * 100 : 0;
    if (pct >= 90 && pct < 100) {
        logger.warn('usage', `User at ${pct.toFixed(0)}% of message limit`, {
            alert: 'usage_warning',
            userId,
            used,
            limit,
        });
    } else if (pct >= 100) {
        logger.warn('usage', `User hit message limit`, {
            alert: 'usage_limit_hit',
            userId,
            used,
            limit,
        });
    }
}
