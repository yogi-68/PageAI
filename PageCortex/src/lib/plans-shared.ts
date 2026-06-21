export type PlanId = 'free' | 'starter' | 'growth' | 'scale' | 'enterprise';

export const PLAN_RANK: Record<PlanId, number> = {
    free: 0,
    starter: 1,
    growth: 2,
    scale: 3,
    enterprise: 4,
};

export type PlanAction = 'current' | 'upgrade' | 'downgrade' | 'contact';

export function comparePlans(targetPlanId: string, currentPlanId: string): PlanAction {
    if (targetPlanId === 'enterprise') return 'contact';
    if (targetPlanId === currentPlanId) return 'current';
    const targetRank = PLAN_RANK[targetPlanId as PlanId] ?? 0;
    const currentRank = PLAN_RANK[currentPlanId as PlanId] ?? 0;
    if (targetRank > currentRank) return 'upgrade';
    if (targetRank < currentRank) return 'downgrade';
    return 'current';
}

/** Display config for billing page — keep in sync with PLANS in lib/dodo.ts */
export const BILLING_PLANS = [
    { id: 'free' as const, name: 'Free', price: 0, trial: false, features: ['1 Chatbot', '100 messages/month', '200 Pages indexed', 'Fast AI only', 'Basic analytics', 'Website connector', 'PageCortex branding'] },
    { id: 'starter' as const, name: 'Starter', price: 29, trial: true, features: ['1 Chatbot', '4,000 messages/month', '1,000 Pages indexed', 'Smart AI routing', 'Website + File upload', 'Remove PageCortex branding', 'Email support'] },
    { id: 'growth' as const, name: 'Growth', price: 69, popular: true, trial: true, features: ['3 Chatbots', '10,000 messages/month', '10,000 Pages indexed', 'Advanced AI + Smart routing', 'All data connectors', 'Advanced analytics', 'Priority support', 'Custom system prompts'] },
    { id: 'scale' as const, name: 'Scale', price: 199, trial: false, features: ['10 Chatbots', '40,000 messages/month', '50,000 Pages indexed', 'All AI models', 'All data connectors', 'Dedicated support'] },
    { id: 'enterprise' as const, name: 'Enterprise', price: -1, trial: false, features: ['Unlimited Chatbots', 'Unlimited messages', 'Unlimited pages', 'All AI tiers', 'All data connectors', 'Dedicated account manager', 'Custom integrations'] },
];

export function getPlanButtonLabel(action: PlanAction, loading: boolean): string {
    if (loading) return 'Loading...';
    switch (action) {
        case 'current': return 'Current Plan';
        case 'upgrade': return 'Upgrade';
        case 'downgrade': return 'Downgrade';
        case 'contact': return 'Contact Sales';
    }
}
