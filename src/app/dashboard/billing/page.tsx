'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

// Plans matching canonical PLANS in lib/dodo.ts
const plans = [
  { id: 'free', name: 'Free', price: 0, features: ['1 Chatbot', '50 messages/month', '100 Pages indexed', 'GPT-4.1 Mini', 'Basic analytics', 'Website connector', 'PageAI branding'] },
  { id: 'starter', name: 'Starter', price: 10.99, trial: true, features: ['1 Chatbot', '4,000 messages/month', '1,000 Pages indexed', 'GPT-4.1 Mini', 'Full analytics', 'Custom branding', 'File uploads', 'Email support'] },
  { id: 'growth', name: 'Growth', price: 29, popular: true, trial: true, features: ['3 Chatbots', '10,000 messages/month', '10,000 Pages indexed', 'GPT-4.1 + Auto routing', 'Notion & Google Drive', 'API access', 'Priority support', 'Streaming responses'] },
  { id: 'scale', name: 'Scale', price: 79, trial: true, features: ['10 Chatbots', '40,000 messages/month', '50,000 Pages indexed', 'GPT-4.1 + Smart routing', 'All data connectors', 'Dedicated support', 'Custom branding', 'White-label option'] },
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
              {(plan as any).trial && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-success/10 text-success text-[11px] font-medium mb-2"><span className="w-1 h-1 rounded-full bg-success" />7-day free trial</span>}
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
