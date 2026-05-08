// ─── Analytics Event Tracking ─────────────────────────────
// Lightweight event tracking stored in Supabase analytics_events table.
// Fire-and-forget — never blocks the request pipeline.

import { getAdminClient } from './supabase';
import { logger } from './logger';

export type AnalyticsEvent =
    | 'addon.purchased'
    | 'limit.reached'
    | 'limit.warning'
    | 'upgrade.clicked'
    | 'chat.completed'
    | 'chat.failed'
    | 'chat.cached'
    | 'chat.unanswered'
    | 'bot.created'
    | 'bot.deleted'
    | 'crawl.started'
    | 'crawl.completed'
    | 'signup.completed';

export function trackEvent(
    event: AnalyticsEvent,
    properties: Record<string, unknown> = {},
    userId?: string
): void {
    // Fire-and-forget — don't await
    _track(event, properties, userId).catch((err) => {
        logger.warn('api', `Analytics track failed: ${err.message}`, { event });
    });
}

async function _track(
    event: AnalyticsEvent,
    properties: Record<string, unknown>,
    userId?: string
): Promise<void> {
    const admin = getAdminClient();
    await admin.from('analytics_events').insert({
        event,
        properties,
        user_id: userId || null,
    });
}

// ─── Query helpers (for dashboard) ───────────────────────
export async function getEventCounts(
    userId: string,
    events: AnalyticsEvent[],
    sinceDays = 30
): Promise<Record<string, number>> {
    const admin = getAdminClient();
    const since = new Date(Date.now() - sinceDays * 86400000).toISOString();

    const { data, error } = await admin
        .from('analytics_events')
        .select('event')
        .eq('user_id', userId)
        .in('event', events)
        .gte('created_at', since);

    if (error || !data) return {};

    const counts: Record<string, number> = {};
    for (const row of data) {
        counts[row.event] = (counts[row.event] || 0) + 1;
    }
    return counts;
}
