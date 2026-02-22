"use client";

import { Check, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

const plans = [
    {
        id: "free",
        name: "Starter",
        price: 0,
        period: "forever",
        description: "Perfect for trying out PageAI",
        cta: "Start Free",
        features: [
            "1 Website",
            "1,000 Q&A / month",
            "10 Pages indexed",
            "GPT-3.5 Turbo",
            "Basic analytics",
            "PageAI branding",
            "Community support",
        ],
    },
    {
        id: "basic",
        name: "Growth",
        price: 39,
        period: "/month",
        description: "For growing businesses",
        cta: "Start Growth Plan",
        features: [
            "3 Websites",
            "10,000 Q&A / month",
            "50 Pages indexed",
            "GPT-4 Turbo",
            "Advanced analytics",
            "Remove branding",
            "Email support",
            "Custom bot persona",
            "Lead capture forms",
        ],
    },
    {
        id: "pro",
        name: "Professional",
        price: 129,
        period: "/month",
        popular: true,
        description: "For scaling companies",
        cta: "Start Pro Plan",
        features: [
            "10 Websites",
            "50,000 Q&A / month",
            "200 Pages indexed",
            "GPT-4 + Claude 3.5",
            "Priority support",
            "API access",
            "Webhook integrations",
            "Multi-language (50+)",
            "3 Team seats",
            "AI Actions",
            "Custom domain",
        ],
    },
    {
        id: "premium",
        name: "Enterprise",
        price: 399,
        period: "/month",
        description: "For large organizations",
        cta: "Contact Sales",
        features: [
            "Unlimited Websites",
            "200,000+ Q&A / month",
            "1,000+ Pages indexed",
            "All AI Models",
            "Dedicated support & SLA",
            "SSO / SAML",
            "Custom integrations",
            "White-label option",
            "On-premises deployment",
            "Unlimited team seats",
            "Advanced AI Actions",
            "99.99% uptime SLA",
        ],
    },
];

export default function PricingSection() {
    return (
        <section id="pricing" className="section-padding relative">
            <div className="absolute inset-0 bg-dots opacity-20" />
            <div className="relative container-wide px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="badge mb-4 inline-flex">
                        <Sparkles className="w-3.5 h-3.5" />
                        Simple Pricing
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                        Transparent Pricing,
                        <br />
                        <span className="gradient-text">No Hidden Fees</span>
                    </h2>
                    <p className="text-text-secondary text-lg max-w-2xl mx-auto">
                        Start free, scale as you grow. Every plan includes our core RAG
                        engine, embeddable widget, and real-time analytics.
                    </p>
                </div>

                {/* Pricing Grid */}
                <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5 max-w-6xl mx-auto">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative flex flex-col rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] ${plan.popular
                                    ? "gradient-border bg-surface-card glow-purple"
                                    : "bg-surface-card border border-border hover:border-border-light"
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <div className="gradient-bg text-white text-xs font-semibold px-4 py-1 rounded-full shadow-lg shadow-purple-500/30">
                                        Most Popular
                                    </div>
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                                <p className="text-sm text-text-muted mb-4">
                                    {plan.description}
                                </p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold">
                                        ${plan.price}
                                    </span>
                                    <span className="text-text-muted text-sm">
                                        {plan.period}
                                    </span>
                                </div>
                            </div>

                            <Link
                                href="/signup"
                                className={`w-full text-center mb-6 ${plan.popular
                                        ? "btn-primary"
                                        : "btn-secondary"
                                    }`}
                            >
                                {plan.cta}
                                <ArrowRight className="w-4 h-4" />
                            </Link>

                            <ul className="space-y-3 flex-1">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-2.5">
                                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm text-text-secondary">
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom note */}
                <p className="text-center text-sm text-text-muted mt-10">
                    All plans include a 14-day free trial of Pro features. No credit card
                    required. Cancel anytime.
                </p>
            </div>
        </section>
    );
}
