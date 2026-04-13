// Plan prices for MRR calculations
export const PLAN_PRICES: Record<string, number> = {
    free: 0,
    starter: 29,
    growth: 69,
    scale: 199,
    enterprise: 499,
};

export const PLAN_LIMITS: Record<string, { messages: number; pages: number; bots: number }> = {
    free: { messages: 50, pages: 100, bots: 1 },
    starter: { messages: 4000, pages: 1000, bots: 1 },
    growth: { messages: 10000, pages: 10000, bots: 3 },
    scale: { messages: 40000, pages: 50000, bots: 10 },
    enterprise: { messages: 999999, pages: 999999, bots: 999 },
};

export function isAdmin(email: string): boolean {
    const admins = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
    return admins.includes(email.toLowerCase());
}
