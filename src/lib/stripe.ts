import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-01-28.clover',
});

export const PLANS = {
    free: {
        id: 'free',
        name: 'Starter',
        description: 'Perfect for trying out PageAI',
        price: 0,
        priceId: null,
        features: [
            '1 Website',
            '1,000 Q&A/month',
            '10 Pages indexed',
            'GPT-3.5 Turbo',
            'Basic analytics',
            'PageAI branding',
        ],
        limits: {
            websites: 1,
            questionsPerMonth: 1000,
            pagesIndexed: 10,
            model: 'gpt-3.5-turbo',
        },
    },
    basic: {
        id: 'basic',
        name: 'Growth',
        price: 39,
        priceId: process.env.STRIPE_BASIC_PRICE_ID,
        description: 'For growing businesses',
        features: [
            '3 Websites',
            '10,000 Q&A/month',
            '50 Pages indexed',
            'GPT-4 Turbo',
            'Advanced analytics',
            'Remove branding',
            'Email support',
            'Custom bot persona',
        ],
        limits: {
            websites: 3,
            questionsPerMonth: 10000,
            pagesIndexed: 50,
            model: 'gpt-4-turbo',
        },
    },
    pro: {
        id: 'pro',
        name: 'Professional',
        price: 129,
        popular: true,
        priceId: process.env.STRIPE_PRO_PRICE_ID,
        description: 'For scaling companies',
        features: [
            '10 Websites',
            '50,000 Q&A/month',
            '200 Pages indexed',
            'GPT-4 + Claude 3.5',
            'Priority support',
            'API access',
            'Webhook integrations',
            'Multi-language support',
            'Team seats (3)',
        ],
        limits: {
            websites: 10,
            questionsPerMonth: 50000,
            pagesIndexed: 200,
            model: 'gpt-4',
        },
    },
    premium: {
        id: 'premium',
        name: 'Enterprise',
        price: 399,
        priceId: process.env.STRIPE_PREMIUM_PRICE_ID,
        description: 'For large organizations',
        features: [
            'Unlimited Websites',
            '200,000+ Q&A/month',
            '1,000+ Pages indexed',
            'All AI Models',
            'Dedicated support',
            'SLA guarantee',
            'SSO / SAML',
            'Custom integrations',
            'White-label option',
            'On-premises deployment',
            'Unlimited team seats',
        ],
        limits: {
            websites: -1,
            questionsPerMonth: 200000,
            pagesIndexed: 1000,
            model: 'gpt-4',
        },
    },
} as const;

export type PlanId = keyof typeof PLANS;
