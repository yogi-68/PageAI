'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

// Plans matching canonical PLANS in lib/dodo.ts
const plans = [
  { id: 'free', name: 'Free', price: 0, features: ['1 Chatbot', '50 messages/month', '100 Pages indexed', 'GPT-4.1 Mini', 'Basic analytics', 'Website connector', 'PageAI branding'] },
  { id: 'starter', name: 'Starter', price: 29, trial: true, features: ['1 Chatbot', '4,000 messages/month', '1,000 Pages indexed', 'GPT-4.1 Mini', 'Full analytics', 'Custom branding', 'File uploads', 'Email support'] },
  { id: 'growth', name: 'Growth', price: 69, popular: true, trial: true, features: ['3 Chatbots', '10,000 messages/month', '10,000 Pages indexed', 'GPT-4.1 + Auto routing', 'Notion & Google Drive', 'API access', 'Priority support', 'Streaming responses'] },
  { id: 'scale', name: 'Scale', price: 199, trial: true, features: ['10 Chatbots', '40,000 messages/month', '50,000 Pages indexed', 'GPT-4.1 + Smart routing', 'All data connectors', 'Dedicated support', 'Custom branding', 'White-label option'] },
  { id: 'enterprise', name: 'Enterprise', price: -1, features: ['Unlimited Chatbots', 'Unlimited messages', 'Unlimited pages', 'All AI models', 'All data sources', 'Dedicated manager', 'SLA guarantee', 'SSO / SAML', 'Custom fine-tuning'] },
];

interface ProfileData {
  plan: string;
  monthly_message_count: number;
  monthly_message_limit: number;
  total_pages_indexed: number;
  max_pages_indexed: number;
  dodo_subscription_id: string | null;
}

export default function BillingPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('plan, monthly_message_count, monthly_message_limit, total_pages_indexed, max_pages_indexed, dodo_subscription_id').eq('id', user.id).single().then(({ data }) => {
      if (data) setProfile(data as ProfileData);
    });
  }, [user]);

  const handleUpgrade = async (planId: string) => {
    if (planId === (profile?.plan || 'free') || planId === 'free' || planId === 'enterprise') return;
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

  const currentPlan = profile?.plan || 'free';
  const msgUsed = profile?.monthly_message_count || 0;
  const msgLimit = profile?.monthly_message_limit || 50;
  const pagesUsed = profile?.total_pages_indexed || 0;
  const pagesLimit = profile?.max_pages_indexed || 100;
  const msgPct = Math.min(100, Math.round((msgUsed / Math.max(msgLimit, 1)) * 100));
  const pagesPct = Math.min(100, Math.round((pagesUsed / Math.max(pagesLimit, 1)) * 100));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-bold text-fg tracking-[-0.02em]">Billing</h1>
        <p className="text-[14px] text-fg-secondary mt-0.5">Manage your subscription and usage</p>
      </div>

      {/* Current Plan & Usage Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-edge bg-surface/40">
          <span className="text-[12px] font-medium text-fg-muted uppercase tracking-wide">Current Plan</span>
          <p className={`text-[20px] font-bold mt-1 capitalize ${
            currentPlan === 'free' ? 'text-fg-muted' : currentPlan === 'growth' ? 'text-primary' : currentPlan === 'scale' ? 'text-warning' : 'text-success'
          }`}>{currentPlan}</p>
          {profile?.dodo_subscription_id && (
            <p className="text-[11px] text-fg-muted mt-1">Subscription active</p>
          )}
        </div>
        <div className="p-5 rounded-xl border border-edge bg-surface/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-medium text-fg-muted uppercase tracking-wide">Messages</span>
            <span className="text-[11px] text-fg-muted">{msgUsed.toLocaleString()} / {msgLimit.toLocaleString()}</span>
          </div>
          <div className="h-2 rounded-full bg-edge overflow-hidden mb-1">
            <div className={`h-full rounded-full transition-all ${msgPct > 90 ? 'bg-danger' : msgPct > 70 ? 'bg-warning' : 'bg-primary'}`} style={{ width: `${msgPct}%` }} />
          </div>
          <span className="text-[11px] text-fg-muted">{msgPct}% used this month</span>
        </div>
        <div className="p-5 rounded-xl border border-edge bg-surface/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-medium text-fg-muted uppercase tracking-wide">Pages Indexed</span>
            <span className="text-[11px] text-fg-muted">{pagesUsed.toLocaleString()} / {pagesLimit.toLocaleString()}</span>
          </div>
          <div className="h-2 rounded-full bg-edge overflow-hidden mb-1">
            <div className={`h-full rounded-full transition-all ${pagesPct > 90 ? 'bg-danger' : pagesPct > 70 ? 'bg-warning' : 'bg-primary'}`} style={{ width: `${pagesPct}%` }} />
          </div>
          <span className="text-[11px] text-fg-muted">{pagesPct}% of limit</span>
        </div>
      </div>

      {/* Overage info */}
      {msgPct > 90 && currentPlan !== 'free' && (
        <div className="p-4 rounded-xl border border-warning/20 bg-warning/[0.04] flex items-center gap-3">
          <span className="text-warning text-[16px]">⚠</span>
          <div>
            <p className="text-[13px] font-medium text-fg">Approaching message limit</p>
            <p className="text-[12px] text-fg-secondary">Messages beyond your limit are billed at $4 per 1,000 messages.</p>
          </div>
        </div>
      )}

      {/* Plan Cards */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {plans.map(plan => {
          const isCurrent = plan.id === currentPlan;
          const isEnterprise = plan.id === 'enterprise';
          return (
            <div key={plan.id} className={`relative flex flex-col p-5 rounded-xl border transition-all duration-200 ${(plan as any).popular ? 'border-primary bg-primary/[0.04]' : 'border-edge bg-surface/40'} ${isCurrent ? 'ring-1 ring-primary/40' : ''}`}>
              {(plan as any).popular && <span className="absolute -top-2.5 left-4 px-2.5 py-0.5 rounded-md bg-primary text-white text-[11px] font-semibold">Popular</span>}
              {plan.trial && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-success/10 text-success text-[11px] font-medium mb-2 w-fit"><span className="w-1 h-1 rounded-full bg-success" />7-day free trial</span>}
              <h3 className="text-[16px] font-bold text-fg">{plan.name}</h3>
              <div className="mt-2 mb-4">
                {isEnterprise ? (
                  <span className="text-[20px] font-bold text-fg">Custom</span>
                ) : (
                  <>
                    <span className="text-[28px] font-bold text-fg">${plan.price}</span>
                    <span className="text-[13px] text-fg-muted">/mo</span>
                  </>
                )}
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
                onClick={() => isEnterprise ? window.open('mailto:support@pageai.com?subject=Enterprise%20Plan', '_blank') : handleUpgrade(plan.id)}
                disabled={isCurrent || loading === plan.id}
                className={`w-full py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                  isCurrent
                    ? 'bg-edge/50 text-fg-muted cursor-default'
                    : (plan as any).popular
                      ? 'bg-primary text-white hover:bg-primary-hover'
                      : isEnterprise
                        ? 'bg-[#a78bfa]/10 text-[#a78bfa] border border-[#a78bfa]/20 hover:bg-[#a78bfa]/20'
                        : 'border border-edge text-fg hover:bg-surface-elevated/50 hover:border-edge-light'
                } disabled:opacity-50`}
              >
                {loading === plan.id ? 'Loading...' :
                  isCurrent ? 'Current Plan' : isEnterprise ? 'Contact Sales' : plan.price === 0 ? 'Downgrade' : 'Upgrade'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Overage pricing note */}
      <div className="p-4 rounded-xl border border-edge bg-surface/40">
        <p className="text-[13px] text-fg-secondary"><span className="font-medium text-fg">Overage pricing:</span> $4 per 1,000 messages beyond your plan limit. All paid plans include a 7-day free trial.</p>
      </div>
    </div>
  );
}
