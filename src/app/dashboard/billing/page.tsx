'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

// Plans matching canonical PLANS in lib/dodo.ts
const plans = [
  { id: 'free', name: 'Starter', price: 0, features: ['1 Website', '1,000 Q&A/month', '10 Pages indexed', 'GPT-3.5 Turbo', 'Basic analytics', 'PageAI branding'] },
  { id: 'basic', name: 'Growth', price: 9, features: ['3 Websites', '10,000 Q&A/month', '50 Pages indexed', 'GPT-4 Turbo', 'Advanced analytics', 'Remove branding', 'Email support', 'Custom bot persona'] },
  { id: 'pro', name: 'Professional', price: 29, popular: true, features: ['10 Websites', '50,000 Q&A/month', '200 Pages indexed', 'GPT-4 + Claude 3.5', 'Priority support', 'API access', 'Webhook integrations', 'Multi-language support', 'Team seats (3)'] },
  { id: 'premium', name: 'Enterprise', price: 79, features: ['Unlimited Websites', '200,000+ Q&A/month', '1,000+ Pages indexed', 'All AI Models', 'Dedicated support', 'SLA guarantee', 'SSO / SAML', 'Custom integrations', 'White-label option'] },
];

export default function BillingPage() {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState('free');
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('plan').eq('id', user.id).single().then(({ data }) => {
      if (data?.plan) setCurrentPlan(data.plan);
    });
  }, [user]);

  const handleUpgrade = async (planId: string) => {
    if (planId === currentPlan || planId === 'free') return;
    setLoading(planId);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, userId: user?.id }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else throw new Error(data.error || 'Failed');
    } catch (e: any) {
      toast.error(e.message);
    }
    setLoading(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-bold text-fg tracking-[-0.02em]">Billing</h1>
        <p className="text-[14px] text-fg-secondary mt-0.5">Manage your subscription and billing</p>
      </div>

      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-edge bg-surface/40">
        <span className="text-[13px] text-fg-secondary">Current Plan:</span>
        <span className="text-[13px] font-semibold text-primary capitalize">{currentPlan}</span>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {plans.map(plan => {
          const isCurrent = plan.id === currentPlan;
          return (
            <div key={plan.id} className={`relative flex flex-col p-5 rounded-xl border transition-all duration-200 ${plan.popular ? 'border-primary bg-primary/[0.04]' : 'border-edge bg-surface/40'} ${isCurrent ? 'ring-1 ring-primary/40' : ''}`}>
              {plan.popular && <span className="absolute -top-2.5 left-4 px-2.5 py-0.5 rounded-md bg-primary text-white text-[11px] font-semibold">Popular</span>}
              <h3 className="text-[16px] font-bold text-fg">{plan.name}</h3>
              <div className="mt-2 mb-4">
                <span className="text-[28px] font-bold text-fg">${plan.price}</span>
                <span className="text-[13px] text-fg-muted">/mo</span>
              </div>
              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-[13px] text-fg-secondary">
                    <svg className="w-4 h-4 text-success shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={isCurrent || loading === plan.id}
                className={`w-full py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                  isCurrent
                    ? 'bg-edge/50 text-fg-muted cursor-default'
                    : plan.popular
                      ? 'bg-primary text-white hover:bg-primary-hover'
                      : 'border border-edge text-fg hover:bg-surface-elevated/50 hover:border-edge-light'
                } disabled:opacity-50`}
              >
                {loading === plan.id ? 'Loading...' :
                  isCurrent ? 'Current Plan' : plan.price === 0 ? 'Downgrade' : 'Upgrade'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
