import DodoPayments from 'dodopayments';

// Initialize Dodo Payments client lazily (server-side only)
let _dodoClient: DodoPayments | null = null;

export function getDodoClient(): DodoPayments {
    if (!_dodoClient) {
        _dodoClient = new DodoPayments({
            bearerToken: process.env.DODO_PAYMENTS_API_KEY || '',
        });
    }
    return _dodoClient;
}

// ─── Plan Configuration ───────────────────────────────────
// Trial days per plan — 0 means no trial (controlled in backend, not in Dodo product)
// Free: permanent free tier (no trial needed)
// Starter/Growth: 7-day trial for FIRST-TIME subscribers only
// Scale/Enterprise: no trial (serious users; trial abuse risk)
export const PLAN_TRIAL_DAYS: Record<string, number> = {
    free: 0,
    starter: 7,
    growth: 7,
    scale: 0,
    enterprise: 0,
};

// Yearly plans: charged as a single upfront payment for the full year
export const YEARLY_PRICES: Record<string, number> = {
    starter: 276,  // $23/mo × 12  — save $72 vs monthly
    growth:  660,  // $55/mo × 12  — save $168 vs monthly
    scale:  1908,  // $159/mo × 12 — save $480 vs monthly
};

// Per-month equivalent shown in UI when annual billing is selected
export const YEARLY_MONTHLY_EQUIV: Record<string, number> = {
    starter: 23,
    growth:  55,
    scale:   159,
};

// Yearly product IDs (create in Dodo Dashboard with billing_period=yearly)
export const YEARLY_PRODUCT_IDS: Record<string, string | null> = {
    starter: process.env.DODO_PRODUCT_STARTER_YEARLY || null,
    growth:  process.env.DODO_PRODUCT_GROWTH_YEARLY  || null,
    scale:   process.env.DODO_PRODUCT_SCALE_YEARLY   || null,
};

export const PLANS = {
    free: {
        id: 'free',
        name: 'Free',
        description: 'Try PageAI with basic features',
        price: 0,
        productId: null,
        trialDays: 0,
        features: [
            '1 Chatbot',
            '50 messages/month',
            '100 pages indexed',
            'GPT-4.1 Mini',
            'Website source only',
            'PageAI branding',
        ],
        limits: {
            chatbots: 1,
            messagesPerMonth: 50,
            pagesIndexed: 100,
            model: 'gpt-4.1-mini',
            dataSources: ['website'],
            apiAccess: false,
            customBranding: false,
        },
    },
    starter: {
        id: 'starter',
        name: 'Starter',
        price: 29,
        productId: process.env.DODO_PRODUCT_STARTER || null,
        trialDays: 7,
        description: 'For small businesses getting started',
        features: [
            '1 Chatbot',
            '4,000 messages/month',
            '1,000 pages indexed',
            'GPT-4.1 Mini + Auto-routing',
            'Website + File Upload',
            'Basic analytics',
            'Remove branding',
            'Email support',
        ],
        limits: {
            chatbots: 1,
            messagesPerMonth: 4000,
            pagesIndexed: 1000,
            model: 'auto',
            dataSources: ['website', 'file_upload', 'sitemap'],
            apiAccess: false,
            customBranding: true,
        },
    },
    growth: {
        id: 'growth',
        name: 'Growth',
        price: 69,
        popular: true,
        productId: process.env.DODO_PRODUCT_GROWTH || null,
        trialDays: 7,
        description: 'For growing companies',
        features: [
            '3 Chatbots',
            '10,000 messages/month',
            '10,000 pages indexed',
            'GPT-4.1 + Smart Routing',
            'All data sources',
            'Advanced analytics',
            'API access',
            'Priority support',
            'Custom system prompts',
        ],
        limits: {
            chatbots: 3,
            messagesPerMonth: 10000,
            pagesIndexed: 10000,
            model: 'auto',
            dataSources: ['website', 'file_upload', 'sitemap', 'notion', 'google_drive'],
            apiAccess: true,
            customBranding: true,
        },
    },
    scale: {
        id: 'scale',
        name: 'Scale',
        price: 199,
        productId: process.env.DODO_PRODUCT_SCALE || null,
        trialDays: 0,
        description: 'For high-volume operations',
        features: [
            '10 Chatbots',
            '40,000 messages/month',
            '50,000 pages indexed',
            'GPT-4.1 priority access',
            'All data sources + API',
            'Advanced analytics + exports',
            'Dedicated support',
            'Webhook integrations',
            'White-label option',
            'Team seats (5)',
        ],
        limits: {
            chatbots: 10,
            messagesPerMonth: 40000,
            pagesIndexed: 50000,
            model: 'auto',
            dataSources: ['website', 'file_upload', 'sitemap', 'notion', 'google_drive', 'gitbook', 'zendesk', 'confluence'],
            apiAccess: true,
            customBranding: true,
        },
    },
    enterprise: {
        id: 'enterprise',
        name: 'Enterprise',
        price: -1, // Custom pricing
        productId: process.env.DODO_PRODUCT_ENTERPRISE || null,
        trialDays: 0,
        description: 'Custom for large organizations',
        features: [
            'Unlimited Chatbots',
            'Unlimited messages',
            'Unlimited pages',
            'All AI models',
            'All data sources',
            'Dedicated account manager',
            'SLA guarantee',
            'SSO / SAML',
            'Custom model fine-tuning',
            'On-premise option',
        ],
        limits: {
            chatbots: -1,
            messagesPerMonth: -1,
            pagesIndexed: -1,
            model: 'gpt-4.1',
            dataSources: ['website', 'file_upload', 'sitemap', 'notion', 'google_drive', 'gitbook', 'zendesk', 'confluence', 'api'],
            apiAccess: true,
            customBranding: true,
        },
    },
} as const;

export type PlanId = keyof typeof PLANS;

// Overage pricing: $4 per 1,000 messages
export const OVERAGE_RATE = 4; // USD per 1000 messages

// ─── Message Add-ons (prepaid packs) ─────────────────────
export const MESSAGE_ADDONS = {
    '1000_messages': {
        id: '1000_messages',
        label: '+1,000 Messages',
        messages: 1000,
        price: 4,
        perK: 4.0,
        productId: process.env.DODO_ADDON_1000 || null,
    },
    '5000_messages': {
        id: '5000_messages',
        label: '+5,000 Messages',
        messages: 5000,
        price: 18,
        perK: 3.6,
        productId: process.env.DODO_ADDON_5000 || null,
    },
    '10000_messages': {
        id: '10000_messages',
        label: '+10,000 Messages',
        messages: 10000,
        price: 30,
        perK: 3.0,
        productId: process.env.DODO_ADDON_10000 || null,
    },
} as const;

export type AddonId = keyof typeof MESSAGE_ADDONS;

// Map Dodo Product ID to add-on ID
export function getAddonByProductId(productId: string): AddonId | null {
    for (const [key, addon] of Object.entries(MESSAGE_ADDONS)) {
        if (addon.productId === productId) return key as AddonId;
    }
    return null;
}

// Map Dodo Product ID to our plan ID
export function getPlanByProductId(productId: string): PlanId | null {
    for (const [key, plan] of Object.entries(PLANS)) {
        if (plan.productId === productId) {
            return key as PlanId;
        }
    }
    return null;
}

// Get plan limits for a given plan ID
export function getPlanLimits(planId: PlanId) {
    return PLANS[planId]?.limits || PLANS.free.limits;
}

// Get message limit for plan
export function getMessageLimit(planId: string): number {
    const plan = PLANS[planId as PlanId];
    if (!plan) return 50;
    const limit = plan.limits.messagesPerMonth;
    return limit === -1 ? 999999 : limit;
}

// Get page limit for plan
export function getPageLimit(planId: string): number {
    const plan = PLANS[planId as PlanId];
    if (!plan) return 100;
    const limit = plan.limits.pagesIndexed;
    return limit === -1 ? 999999 : limit;
}

// Get chatbot limit for plan
export function getChatbotLimit(planId: string): number {
    const plan = PLANS[planId as PlanId];
    if (!plan) return 1;
    const limit = plan.limits.chatbots;
    return limit === -1 ? 999999 : limit;
}

// Legacy alias for backward compatibility
export function getQuestionLimit(planId: string): number {
    return getMessageLimit(planId);
}
