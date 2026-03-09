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
export const TRIAL_DAYS = 7; // 7-day free trial on all paid plans

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
        trialDays: TRIAL_DAYS,
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
        trialDays: TRIAL_DAYS,
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
        trialDays: TRIAL_DAYS,
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
        trialDays: TRIAL_DAYS,
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
