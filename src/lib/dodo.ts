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

// ─── Plan Configuration ───────────────────────────────
export const PLANS = {
    free: {
        id: 'free',
        name: 'Starter',
        description: 'Perfect for trying out PageAI',
        price: 0,
        productId: null,
        features: [
            '1 Website',
            '100 AI responses/month',
            '10 Pages indexed',
            'GPT-3.5 Turbo',
            'Basic analytics',
            'PageAI branding',
        ],
        limits: {
            websites: 1,
            questionsPerMonth: 100,
            pagesIndexed: 10,
            model: 'gpt-3.5-turbo',
        },
    },
    basic: {
        id: 'basic',
        name: 'Growth',
        price: 19,
        productId: process.env.DODO_PRODUCT_GROWTH || null,
        description: 'For growing businesses',
        features: [
            '1 Website',
            '2,000 AI responses/month',
            '100 Pages indexed',
            'GPT-4 Turbo',
            'Advanced analytics',
            'Remove branding',
            'Email support',
            'Custom bot persona',
        ],
        limits: {
            websites: 1,
            questionsPerMonth: 2000,
            pagesIndexed: 100,
            model: 'gpt-4-turbo',
        },
    },
    pro: {
        id: 'pro',
        name: 'Professional',
        price: 49,
        popular: true,
        productId: process.env.DODO_PRODUCT_PRO || null,
        description: 'For scaling companies',
        features: [
            '5 Websites',
            '10,000 AI responses/month',
            '500 Pages indexed',
            'GPT-4 + Claude 3.5',
            'Priority support',
            'API access',
            'Webhook integrations',
            'Multi-language support',
            'Team seats (3)',
        ],
        limits: {
            websites: 5,
            questionsPerMonth: 10000,
            pagesIndexed: 500,
            model: 'gpt-4',
        },
    },
    premium: {
        id: 'premium',
        name: 'Enterprise',
        price: 129,
        productId: process.env.DODO_PRODUCT_ENTERPRISE || null,
        description: 'For large organizations',
        features: [
            'Unlimited Websites',
            '50,000 AI responses/month',
            '2,000 Pages indexed',
            'All AI Models',
            'Dedicated support',
            'SLA guarantee',
            'SSO / SAML',
            'White-label option',
            'Custom integrations',
            'Unlimited team seats',
        ],
        limits: {
            websites: -1,
            questionsPerMonth: 50000,
            pagesIndexed: 2000,
            model: 'gpt-4',
        },
    },
} as const;

export type PlanId = keyof typeof PLANS;

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

// Get question limit for a plan
export function getQuestionLimit(planId: PlanId): number {
    return PLANS[planId]?.limits.questionsPerMonth || 1000;
}
