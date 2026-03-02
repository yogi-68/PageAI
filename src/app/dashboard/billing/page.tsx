'use client';

import { useState } from 'react';
import {
    CreditCard, Check, Sparkles, ArrowRight, Zap,
    Calendar, Info, Clock, Loader2, ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useEffect } from 'react';

export default function BillingPage() {
    const { user } = useAuth();
    const [usage, setUsage] = useState({ plan: 'free', monthly_question_count: 0, monthly_question_limit: 1000 });
    const [upgrading, setUpgrading] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;
        fetch(`/api/dashboard/stats?userId=${user.id}`)
            .then(r => r.json())
            .then(d => { if (d.usage) setUsage(d.usage); })
            .catch(() => { });
    }, [user]);

    const usagePercent = (usage.monthly_question_count / usage.monthly_question_limit) * 100;

    const handleUpgrade = async (planId: string) => {
        if (!user || planId === 'free') return;
        setUpgrading(planId);
        try {
            const res = await fetch('/api/billing/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId, userId: user.id }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                console.error('No checkout URL returned');
            }
        } catch (err) {
            console.error('Upgrade error:', err);
        } finally {
            setUpgrading(null);
        }
    };

    const plans = [
        {
            id: 'free',
            name: 'Starter',
            price: 0,
            current: usage.plan === 'free',
            features: ['1 Website', '1,000 Q&A/mo', '10 Pages', 'GPT-3.5 Turbo', 'Basic Analytics'],
        },
        {
            id: 'basic',
            name: 'Growth',
            price: 39,
            current: usage.plan === 'basic',
            features: ['3 Websites', '10,000 Q&A/mo', '50 Pages', 'GPT-4 Turbo', 'Remove Branding'],
        },
        {
            id: 'pro',
            name: 'Professional',
            price: 129,
            popular: true,
            current: usage.plan === 'pro',
            features: ['10 Websites', '50,000 Q&A/mo', '200 Pages', 'GPT-4 + Claude', 'API & Webhooks'],
        },
        {
            id: 'premium',
            name: 'Enterprise',
            price: 399,
            current: usage.plan === 'premium',
            features: ['Unlimited', '200K+ Q&A/mo', '1,000+ Pages', 'All Models', 'SLA & SSO'],
        },
    ];

    const currentPlanName = plans.find(p => p.current)?.name || 'Starter';

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Billing & Plans</h1>
                <p className="text-[var(--text-secondary)] text-sm mt-1">
                    Manage your subscription and monitor usage
                </p>
            </div>

            {/* Current Usage */}
            <div className="card gradient-border">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-lg font-semibold">Current Plan</h2>
                            <div className="badge text-xs"><Sparkles className="w-3 h-3" />{currentPlanName}</div>
                        </div>
                        <p className="text-sm text-[var(--text-muted)]">
                            {usage.plan === 'free'
                                ? 'Free forever — upgrade for more features'
                                : `You\'re on the ${currentPlanName} plan`}
                        </p>
                    </div>
                    {usage.plan !== 'free' && (
                        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                            <Calendar className="w-3.5 h-3.5" />
                            Renews monthly
                        </div>
                    )}
                </div>

                <div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-[var(--text-secondary)]">Monthly Q&A Usage</span>
                        <span className={`font-medium ${usagePercent > 80 ? 'text-amber-400' : ''}`}>
                            {usage.monthly_question_count.toLocaleString()} / {usage.monthly_question_limit.toLocaleString()}
                        </span>
                    </div>
                    <div className="h-3 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${usagePercent > 80 ? 'bg-amber-500' : 'gradient-bg'}`}
                            style={{ width: `${Math.min(usagePercent, 100)}%` }}
                        />
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-2">
                        {Math.max(0, 100 - usagePercent).toFixed(0)}% remaining this month
                    </p>
                </div>
            </div>

            {/* Plans */}
            <div>
                <h2 className="text-lg font-semibold mb-4">Available Plans</h2>
                <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`card ${plan.popular ? 'gradient-border glow-purple' : ''} ${plan.current ? '!border-emerald-500/30' : ''} relative`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                                    <div className="gradient-bg text-white text-[10px] font-semibold px-3 py-0.5 rounded-full">
                                        Most Popular
                                    </div>
                                </div>
                            )}
                            {plan.current && (
                                <div className="absolute -top-2.5 right-4">
                                    <div className="bg-emerald-500 text-white text-[10px] font-semibold px-3 py-0.5 rounded-full">
                                        Current
                                    </div>
                                </div>
                            )}
                            <h3 className="text-sm font-semibold mb-1">{plan.name}</h3>
                            <div className="flex items-baseline gap-1 mb-4">
                                <span className="text-3xl font-bold">${plan.price}</span>
                                <span className="text-[var(--text-muted)] text-xs">{plan.price > 0 ? '/mo' : 'forever'}</span>
                            </div>
                            <ul className="space-y-2 mb-6">
                                {plan.features.map((f) => (
                                    <li key={f} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                                        <Check className="w-3 h-3 text-emerald-400" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => handleUpgrade(plan.id)}
                                disabled={plan.current || plan.id === 'free' || upgrading === plan.id}
                                className={`w-full ${plan.popular ? 'btn-primary' : 'btn-secondary'} disabled:opacity-40 disabled:cursor-not-allowed`}
                            >
                                {upgrading === plan.id ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                                ) : plan.current ? (
                                    'Current Plan'
                                ) : plan.id === 'free' ? (
                                    'Free Plan'
                                ) : (
                                    <><Zap className="w-3.5 h-3.5" /> Upgrade</>
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Payment Info */}
            <div className="card !p-5">
                <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-[var(--primary-400)] flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium">Secure Payments by Dodo Payments</p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                            All payments are processed securely through Dodo Payments. Your payment information
                            is never stored on our servers. Cancel anytime from your subscription settings.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
