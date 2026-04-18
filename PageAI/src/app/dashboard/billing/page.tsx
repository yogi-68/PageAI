'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

// Plans — features kept in sync with PLANS in lib/dodo.ts
const plans = [
  { id: 'free',       name: 'Free',       price: 0,   trial: false, features: ['1 Chatbot', '50 messages/month', '100 Pages indexed', 'Fast AI responses', 'Basic analytics', 'Website connector', 'PageAI branding'] },
  { id: 'starter',   name: 'Starter',    price: 29,  trial: true,  features: ['1 Chatbot', '4,000 messages/month', '1,000 Pages indexed', 'Smart AI routing', 'Website + File upload', 'Basic analytics', 'Remove PageAI branding', 'Email support'] },
  { id: 'growth',    name: 'Growth',     price: 69,  popular: true, trial: true, features: ['3 Chatbots', '10,000 messages/month', '10,000 Pages indexed', 'Advanced AI + Smart routing', 'All data sources incl. Notion', 'Advanced analytics', 'API access', 'Priority support', 'Custom system prompts'] },
  { id: 'scale',     name: 'Scale',      price: 199, trial: false, features: ['10 Chatbots', '40,000 messages/month', '50,000 Pages indexed', 'Premium AI priority access', 'All data sources + API', 'Analytics exports', 'Webhook integrations', 'Dedicated support', 'White-label + Team seats (5)'] },
  { id: 'enterprise', name: 'Enterprise', price: -1, trial: false, features: ['Unlimited Chatbots', 'Unlimited messages', 'Unlimited pages', 'All AI tiers unlocked', 'All data sources', 'Dedicated account manager', 'SLA guarantee', 'SSO / SAML', 'Custom model fine-tuning'] },
];

const MESSAGE_ADDONS = [
  { id: '1000_messages', label: '+1,000 Messages', price: 4, perK: '$4.00/K', badge: null },
  { id: '5000_messages', label: '+5,000 Messages', price: 18, perK: '$3.60/K', badge: 'Save 10%' },
  { id: '10000_messages', label: '+10,000 Messages', price: 30, perK: '$3.00/K', badge: 'Best value' },
];

interface ProfileData {
  plan: string;
  monthly_message_count: number;
  monthly_message_limit: number;
  total_pages_indexed: number;
  max_pages_indexed: number;
  dodo_subscription_id: string | null;
  addon_message_balance: number;
}

interface BillingMode { testMode: boolean; mockMode: boolean; ok: boolean; }

export default function BillingPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [billingMode, setBillingMode] = useState<BillingMode | null>(null);

  const refreshProfile = useCallback(() => {
    if (!user) return;
    supabase.from('profiles').select('plan, monthly_message_count, monthly_message_limit, total_pages_indexed, max_pages_indexed, dodo_subscription_id, addon_message_balance').eq('id', user.id).single().then(({ data }) => {
      if (data) setProfile(data as ProfileData);
    });
  }, [user]);

  useEffect(() => {
    refreshProfile();
    // Check billing mode (test/mock)
    fetch('/api/billing/health').then(r => r.json()).then(d => setBillingMode(d)).catch(() => {});
  }, [refreshProfile]);

  // Handle return from mock checkout or real checkout
  useEffect(() => {
    const mockUpgraded = searchParams.get('mock_upgraded');
    const mockAddon = searchParams.get('mock_addon');
    const mockMessages = searchParams.get('messages');
    const upgraded = searchParams.get('upgraded');
    const addonSuccess = searchParams.get('addon_success');

    if (mockUpgraded) {
      toast.success(`Plan upgraded to ${mockUpgraded}!`);
      refreshProfile();
    }
    if (mockAddon && mockMessages) {
      toast.success(`+${Number(mockMessages).toLocaleString()} messages added to your account!`);
      refreshProfile();
    }
    if (upgraded) {
      // Real Dodo checkout: webhook may take a few seconds to fire — poll until plan changes
      toast.success('Payment received! Activating your plan...');
      let attempts = 0;
      const poll = setInterval(() => {
        refreshProfile();
        attempts++;
        if (attempts >= 8) clearInterval(poll); // stop after ~16s
      }, 2000);
    }
    if (addonSuccess) {
      toast.success('Add-on messages added to your account!');
      let attempts = 0;
      const poll = setInterval(() => {
        refreshProfile();
        attempts++;
        if (attempts >= 8) clearInterval(poll);
      }, 2000);
    }
  }, [searchParams, refreshProfile]);

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

  const handleBuyAddon = async (addonId: string) => {
    setLoading(addonId);
    try {
      const res = await fetch('/api/billing/addons/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addonId, userId: user?.id }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (res.status === 503) {
        toast.error('Add-on payments are not configured yet — please contact support.');
      } else {
        throw new Error(data.error || 'Failed to create checkout');
      }
    } catch (e: any) {
      toast.error(e.message);
    }
    setLoading(null);
  };

  const currentPlan = profile?.plan || 'free';
  const msgUsed = profile?.monthly_message_count || 0;
  const msgLimit = profile?.monthly_message_limit || 50;
  const addonBalance = profile?.addon_message_balance || 0;
  const pagesUsed = profile?.total_pages_indexed || 0;
  const pagesLimit = profile?.max_pages_indexed || 100;
  const msgPct = Math.min(100, Math.round((msgUsed / Math.max(msgLimit, 1)) * 100));
  const pagesPct = Math.min(100, Math.round((pagesUsed / Math.max(pagesLimit, 1)) * 100));
  const atLimit = msgUsed >= msgLimit;

  // Only the developer account sees payment mode indicators — clients see nothing
  const isDeveloper = user?.email === 'yogeshwar0402@gmail.com';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-bold text-fg tracking-[-0.02em]">Billing &amp; Plans</h1>
        <p className="text-[14px] text-fg-secondary mt-0.5">Manage your subscription, track usage, and buy message add-ons</p>
      </div>

      {/* Sandbox mode indicator — only visible to the developer account */}
      {isDeveloper && (billingMode?.testMode || billingMode?.mockMode) && (
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg border border-warning/30 bg-warning/[0.04]">
          <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-warning/20 text-warning uppercase tracking-wide">Dev</span>
          <p className="text-[12px] text-fg-secondary">
            <span className="font-medium text-warning">Sandbox mode active</span> — payments use Dodo test environment. No real charges.
          </p>
        </div>
      )}

      {/* Current Plan & Usage Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl border border-edge bg-surface/40">
          <span className="text-[12px] font-medium text-fg-muted uppercase tracking-wide">Current Plan</span>
          <p className={`text-[20px] font-bold mt-1 capitalize ${
            currentPlan === 'free' ? 'text-fg-muted' : currentPlan === 'growth' ? 'text-primary' : currentPlan === 'scale' ? 'text-warning' : 'text-success'
          }`}>{currentPlan}</p>
          {profile?.dodo_subscription_id && (
            <p className="text-[11px] text-fg-muted mt-1">Subscription active</p>
          )}
        </div>
        <div className="p-5 rounded-xl border border-edge bg-surface/40 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-medium text-fg-muted uppercase tracking-wide">Messages</span>
              <span className="text-[11px] text-fg-muted">{msgUsed.toLocaleString()} / {msgLimit.toLocaleString()}</span>
            </div>
            <div className="h-2 rounded-full bg-edge overflow-hidden mb-1">
              <div className={`h-full rounded-full transition-all ${msgPct > 90 ? 'bg-danger' : msgPct > 70 ? 'bg-warning' : 'bg-primary'}`} style={{ width: `${msgPct}%` }} />
            </div>
            <span className="text-[11px] text-fg-muted">{msgPct}% used this month</span>
            {addonBalance > 0 && (
              <p className="text-[11px] text-success mt-1">+{addonBalance.toLocaleString()} add-on messages available</p>
            )}
          </div>
          <div>
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
      </div>

      {/* Limit warning with add-on prompt */}
      {atLimit && (
        <div className="p-4 rounded-xl border border-danger/20 bg-danger/[0.04] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-danger text-[16px]">⛔</span>
            <div>
              <p className="text-[13px] font-medium text-fg">Message limit reached — chatbot blocked</p>
              <p className="text-[12px] text-fg-secondary">Buy an add-on pack below to instantly restore service, or upgrade your plan.</p>
            </div>
          </div>
        </div>
      )}
      {!atLimit && msgPct > 90 && currentPlan !== 'free' && (
        <div className="p-4 rounded-xl border border-warning/20 bg-warning/[0.04] flex items-center gap-3">
          <span className="text-warning text-[16px]">⚠</span>
          <div>
            <p className="text-[13px] font-medium text-fg">Approaching message limit</p>
            <p className="text-[12px] text-fg-secondary">Messages beyond your limit are billed at $4 per 1,000 messages. Buy an add-on pack below to pre-load credits.</p>
          </div>
        </div>
      )}

      {/* Message Add-on Packs — available on all plans */}
      {currentPlan !== 'enterprise' && (
        <div>
          <div className="mb-3">
            <h2 className="text-[16px] font-bold text-fg">Message Add-on Packs</h2>
            <p className="text-[13px] text-fg-secondary mt-0.5">
              Instantly add messages to your account — no plan change needed. Credits never expire and are used before overage billing kicks in.
              {currentPlan === 'free' && <span className="ml-1 text-primary font-medium">Available on all plans including Free.</span>}
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            {MESSAGE_ADDONS.map(addon => (
              <div key={addon.id} className={`relative flex flex-col p-5 rounded-xl border transition-all duration-200 ${addon.badge === 'Best value' ? 'border-success bg-success/[0.03]' : 'border-edge bg-surface/40 hover:border-edge-light'}`}>
                {addon.badge && (
                  <span className={`absolute -top-2.5 left-4 px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${addon.badge === 'Best value' ? 'bg-success text-white' : 'bg-warning/20 text-warning'}`}>
                    {addon.badge}
                  </span>
                )}
                <p className="text-[15px] font-bold text-fg mt-1">{addon.label}</p>
                <div className="flex items-baseline gap-1 my-2">
                  <span className="text-[26px] font-bold text-fg">${addon.price}</span>
                  <span className="text-[12px] text-fg-muted">one-time</span>
                </div>
                <p className="text-[11px] text-fg-muted mb-4">{addon.perK} per 1K messages</p>
                <button
                  onClick={() => handleBuyAddon(addon.id)}
                  disabled={loading === addon.id}
                  className={`w-full py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 disabled:opacity-50 ${addon.badge === 'Best value' ? 'bg-success text-white hover:bg-success/90' : 'border border-edge text-fg hover:bg-surface-elevated/50 hover:border-edge-light'}`}
                >
                  {loading === addon.id ? 'Redirecting...' : 'Buy Now'}
                </button>
              </div>
            ))}
          </div>
          {addonBalance > 0 && (
            <p className="text-[12px] text-success mt-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
              You have <strong>{addonBalance.toLocaleString()}</strong> add-on messages remaining this billing cycle.
            </p>
          )}
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
        <p className="text-[13px] text-fg-secondary">
          <span className="font-medium text-fg">Usage priority:</span> Plan quota is used first → then add-on credits → then auto-overage (if enabled) at $4 / 1,000 messages.
          All paid plans include a 7-day free trial.
        </p>
      </div>
    </div>
  );
}
