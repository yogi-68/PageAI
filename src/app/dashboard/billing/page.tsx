"use client";

import {
    CreditCard,
    Check,
    ArrowRight,
    Sparkles,
    Download,
    Calendar,
    Zap,
} from "lucide-react";

const currentPlan = {
    name: "Starter",
    price: 0,
    period: "forever",
    usage: {
        questions: { used: 742, limit: 1000 },
        pages: { used: 8, limit: 10 },
        websites: { used: 1, limit: 1 },
    },
};

const plans = [
    {
        id: "basic",
        name: "Growth",
        price: 39,
        features: ["3 Websites", "10K Q&A/mo", "50 Pages", "GPT-4 Turbo"],
    },
    {
        id: "pro",
        name: "Professional",
        price: 129,
        popular: true,
        features: [
            "10 Websites",
            "50K Q&A/mo",
            "200 Pages",
            "GPT-4 + Claude",
            "API Access",
        ],
    },
    {
        id: "premium",
        name: "Enterprise",
        price: 399,
        features: [
            "Unlimited",
            "200K Q&A/mo",
            "1K+ Pages",
            "All Models",
            "SLA",
        ],
    },
];

const invoices = [
    { id: "INV-001", date: "Feb 1, 2026", amount: "$0.00", status: "Free", plan: "Starter" },
    { id: "INV-000", date: "Jan 1, 2026", amount: "$0.00", status: "Free", plan: "Starter" },
];

export default function BillingPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">Billing & Plans</h1>
                <p className="text-text-secondary text-sm mt-1">
                    Manage your subscription and view usage
                </p>
            </div>

            {/* Current Plan */}
            <div className="card gradient-border !p-0 overflow-hidden">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-lg font-semibold">Current Plan</h2>
                                <div className="badge text-xs">
                                    <Sparkles className="w-3 h-3" />
                                    {currentPlan.name}
                                </div>
                            </div>
                            <p className="text-sm text-text-muted">
                                {currentPlan.price === 0
                                    ? "Free forever — upgrade for more features"
                                    : `$${currentPlan.price}/month`}
                            </p>
                        </div>
                        <button className="btn-primary">
                            <Zap className="w-4 h-4" />
                            Upgrade Plan
                        </button>
                    </div>

                    {/* Usage Bars */}
                    <div className="grid sm:grid-cols-3 gap-6">
                        {Object.entries(currentPlan.usage).map(([key, val]) => {
                            const percentage = (val.used / val.limit) * 100;
                            const isHigh = percentage > 80;
                            return (
                                <div key={key}>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-text-secondary capitalize">{key}</span>
                                        <span className={`font-medium ${isHigh ? "text-amber-400" : ""}`}>
                                            {val.used.toLocaleString()} / {val.limit.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="h-2.5 bg-surface-elevated rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${isHigh ? "bg-amber-500" : "gradient-bg"
                                                }`}
                                            style={{ width: `${Math.min(percentage, 100)}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-text-muted mt-1">
                                        {(100 - percentage).toFixed(0)}% remaining
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Upgrade Plans */}
            <div>
                <h2 className="text-lg font-semibold mb-4">Available Plans</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`card ${plan.popular ? "gradient-border glow-purple" : ""
                                } relative`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                                    <div className="gradient-bg text-white text-xs font-semibold px-3 py-0.5 rounded-full">
                                        Recommended
                                    </div>
                                </div>
                            )}
                            <h3 className="text-base font-semibold mb-1">{plan.name}</h3>
                            <div className="flex items-baseline gap-1 mb-4">
                                <span className="text-3xl font-bold">${plan.price}</span>
                                <span className="text-text-muted text-sm">/mo</span>
                            </div>
                            <ul className="space-y-2 mb-6">
                                {plan.features.map((f) => (
                                    <li key={f} className="flex items-center gap-2 text-sm text-text-secondary">
                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <button
                                className={`w-full ${plan.popular ? "btn-primary" : "btn-secondary"
                                    }`}
                            >
                                Upgrade
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Invoices */}
            <div className="card !p-0">
                <div className="flex items-center justify-between p-5 border-b border-border">
                    <h2 className="text-lg font-semibold">Invoice History</h2>
                    <Calendar className="w-4 h-4 text-text-muted" />
                </div>
                <div className="divide-y divide-border">
                    {invoices.map((inv) => (
                        <div
                            key={inv.id}
                            className="flex items-center justify-between px-5 py-4 hover:bg-surface-hover/50 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-surface-card border border-border flex items-center justify-center">
                                    <CreditCard className="w-5 h-5 text-text-muted" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{inv.id}</p>
                                    <p className="text-xs text-text-muted">
                                        {inv.date} • {inv.plan}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium">{inv.amount}</span>
                                <div className="badge-emerald text-xs">{inv.status}</div>
                                <button className="p-2 rounded-lg hover:bg-surface-hover text-text-muted hover:text-white">
                                    <Download className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
