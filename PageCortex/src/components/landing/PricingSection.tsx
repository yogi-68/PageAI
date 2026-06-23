'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { inViewOnce } from '@/lib/landing-motion';
import { Check } from 'lucide-react';

interface FeatureGroup {
  label: string;
  features: { text: string; highlight?: boolean }[];
}

interface Plan {
  id: string;
  name: string;
  desc: string;
  price: { m: number; a: number };
  badge?: { text: string; color: 'primary' | 'success' };
  trial?: boolean;
  cardClass: string;
  badgeClass: string;
  ctaClass: string;
  accentColor: string;
  groups: FeatureGroup[];
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    desc: 'For trying things out',
    price: { m: 0, a: 0 },
    cardClass: 'border-edge bg-surface',
    badgeClass: '',
    ctaClass: 'bg-surface-elevated border border-edge hover:bg-edge text-fg',
    accentColor: 'text-fg-muted',
    groups: [
      {
        label: 'Usage',
        features: [
          { text: '1 chatbot' },
          { text: '100 AI conversations / month' },
          { text: '200 pages indexed' },
          { text: '5 MB knowledge storage' },
          { text: '1 member' },
        ],
      },
      {
        label: 'AI Capabilities',
        features: [
          { text: 'GPT-4.1 Mini only' },
        ],
      },
      {
        label: 'Data & Knowledge',
        features: [
          { text: 'Website crawling' },
          { text: 'SPA / React sites supported' },
          { text: 'Basic analytics' },
        ],
      },
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    desc: 'For small businesses',
    price: { m: 29, a: 23 },
    badge: { text: 'Most Popular', color: 'primary' },
    trial: true,
    cardClass: 'border-primary/30 bg-primary/[0.03]',
    badgeClass: 'bg-primary',
    ctaClass: 'bg-primary hover:bg-primary-hover text-white hover:shadow-lg hover:shadow-primary/20',
    accentColor: 'text-primary',
    groups: [
      {
        label: 'Usage',
        features: [
          { text: '1 chatbot' },
          { text: '4,000 AI conversations / month' },
          { text: '1,000 pages indexed' },
          { text: '25 MB knowledge storage' },
          { text: '1 member' },
        ],
      },
      {
        label: 'AI Capabilities',
        features: [
          { text: 'GPT-4.1 Mini + smart routing' },
        ],
      },
      {
        label: 'Data & Knowledge',
        features: [
          { text: 'Website + SPA crawling' },
          { text: 'File uploads (PDF, DOCX, HTML, CSV, MD)', highlight: true },
          { text: 'Remove PageCortex branding' },
        ],
      },
      {
        label: 'Support',
        features: [
          { text: 'Email support' },
        ],
      },
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    desc: 'For growing teams',
    price: { m: 69, a: 55 },
    badge: { text: 'Best Value', color: 'success' },
    trial: true,
    cardClass: 'border-success/25 bg-success/[0.02]',
    badgeClass: 'bg-success',
    ctaClass: 'bg-success hover:opacity-90 text-white',
    accentColor: 'text-success',
    groups: [
      {
        label: 'Usage',
        features: [
          { text: '3 chatbots' },
          { text: '10,000 AI conversations / month' },
          { text: '10,000 pages indexed' },
          { text: '250 MB knowledge storage' },
          { text: 'Up to 5 team members' },
        ],
      },
      {
        label: 'AI Capabilities',
        features: [
          { text: 'GPT-4.1 Mini + GPT-4.1 with smart routing', highlight: true },
          { text: 'Custom system prompts' },
        ],
      },
      {
        label: 'Data & Knowledge',
        features: [
          { text: 'All data connectors' },
          { text: 'Website + SPA crawling' },
          { text: 'All file formats' },
          { text: 'Advanced analytics' },
        ],
      },
      {
        label: 'Platform',
        features: [
          { text: 'API access', highlight: true },
          { text: 'Remove PageCortex branding' },
        ],
      },
      {
        label: 'Support',
        features: [
          { text: 'Priority support' },
        ],
      },
    ],
  },
  {
    id: 'scale',
    name: 'Scale',
    desc: 'For scaling businesses',
    price: { m: 199, a: 159 },
    trial: false,
    cardClass: 'border-warning/25 bg-warning/[0.02]',
    badgeClass: '',
    ctaClass: 'bg-warning hover:opacity-90 text-[#1a1200]',
    accentColor: 'text-warning',
    groups: [
      {
        label: 'Usage',
        features: [
          { text: '10 chatbots' },
          { text: '40,000 AI conversations / month' },
          { text: '50,000 pages indexed' },
          { text: '2 GB knowledge storage' },
          { text: 'Team collaboration' },
        ],
      },
      {
        label: 'AI Capabilities',
        features: [
          { text: 'GPT-4.1 Mini + GPT-4.1 with smart routing', highlight: true },
          { text: 'Custom system prompts' },
        ],
      },
      {
        label: 'Data & Knowledge',
        features: [
          { text: 'All data connectors' },
          { text: 'Website + SPA crawling' },
          { text: 'All file formats' },
          { text: 'Advanced analytics' },
        ],
      },
      {
        label: 'Platform',
        features: [
          { text: 'API + Webhooks', highlight: true },
          { text: 'Remove PageCortex branding' },
        ],
      },
      {
        label: 'Support',
        features: [
          { text: 'Dedicated support' },
          { text: 'SLA (uptime guarantee)' },
        ],
      },
    ],
  },
];

const addons = [
  { messages: '1,000', price: 4, desc: 'Perfect for occasional spikes' },
  { messages: '5,000', price: 18, popular: true, desc: 'Best value · saves $2 vs 1K rate' },
  { messages: '10,000', price: 30, desc: 'Most messages · saves $10 vs 1K rate' },
];

export default function PricingSection() {
  const [annual, setAnnual] = useState(true);

  return (
    <section id="pricing" className="py-24 relative">
      <div className="max-w-[1280px] mx-auto px-6">
        <motion.div
          {...inViewOnce}
          className="text-center mb-12"
        >
          <p className="text-[12.5px] font-semibold uppercase tracking-[0.12em] text-primary mb-4">Pricing</p>
          <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.12] tracking-[-0.035em] mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-[16px] text-fg-secondary max-w-[500px] mx-auto leading-relaxed">
            Start free on your SaaS site. Upgrade when trial users start converting because their questions get answered.
          </p>
        </motion.div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <span className={`text-[13.5px] font-medium transition-colors duration-200 ${!annual ? 'text-fg' : 'text-fg-muted'}`}>
            Monthly
          </span>
          <button
            onClick={() => setAnnual(!annual)}
            aria-label="Toggle annual billing"
            className={`relative w-12 h-6.5 rounded-full transition-colors duration-300 ${annual ? 'bg-primary' : 'bg-edge-light'}`}
          >
            <div className={`absolute top-1 w-4.5 h-4.5 rounded-full bg-white shadow transition-transform duration-300 ${annual ? 'left-6.5' : 'left-1'}`} />
          </button>
          <span className={`text-[13.5px] font-medium transition-colors duration-200 ${annual ? 'text-fg' : 'text-fg-muted'}`}>
            Annual{' '}
            <span className="inline-block px-1.5 py-0.5 rounded-md bg-success/12 text-success text-[11px] font-semibold ml-1">
              Save 20%
            </span>
          </span>
        </div>

        {/* Plan cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              {...inViewOnce}
              transition={{ ...inViewOnce.transition, delay: i * 0.08 }}
              className={`relative rounded-3xl border transition-all duration-300 flex flex-col hover:scale-[1.01] ${plan.cardClass}`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <span className={`px-3 py-1 rounded-full text-white text-[11px] font-bold whitespace-nowrap shadow-sm ${plan.badgeClass}`}>
                    {plan.badge.text}
                  </span>
                </div>
              )}

              <div className="p-6 pb-4">
                {/* Trial badge */}
                {plan.trial && (
                  <div className="mb-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-success/10 text-success text-[11px] font-semibold border border-success/20">
                      <span className="w-1 h-1 rounded-full bg-success" />
                      7-day free trial
                    </span>
                  </div>
                )}

                {/* Plan name */}
                <h3 className="text-[19px] font-bold text-fg tracking-[-0.025em]">{plan.name}</h3>
                <p className="text-[12.5px] text-fg-muted mt-0.5">{plan.desc}</p>

                {/* Price */}
                <div className="mt-4 mb-1">
                  {annual && plan.price.m > 0 && (
                    <span className="text-[13px] text-fg-muted line-through mr-1.5">${plan.price.m}/mo</span>
                  )}
                  <div className="flex items-baseline gap-1">
                    <span className="text-[40px] font-bold text-fg tracking-[-0.04em] leading-none">
                      ${annual ? plan.price.a : plan.price.m}
                    </span>
                    {plan.price.m > 0 && <span className="text-[14px] text-fg-muted">/mo</span>}
                  </div>
                  {plan.price.m === 0 && (
                    <p className="text-[12px] text-fg-muted mt-1">Free forever</p>
                  )}
                  {plan.price.m > 0 && annual && (
                    <p className="text-[11.5px] text-fg-muted mt-1">
                      Billed ${plan.price.a * 12}/yr
                      {' '}·{' '}
                      <span className="text-success font-semibold">Save ${(plan.price.m - plan.price.a) * 12}</span>
                    </p>
                  )}
                  {plan.price.m > 0 && !annual && (
                    <p className="text-[11.5px] text-success font-medium mt-1">
                      Save ${(plan.price.m - plan.price.a) * 12}/yr with annual ↑
                    </p>
                  )}
                </div>

                {/* CTA */}
                <Link
                  href={plan.id === 'free' ? '/signup' : `/signup?plan=${plan.id}${annual ? '&billing=annual' : ''}`}
                  className={`block text-center text-[13.5px] font-semibold py-2.5 rounded-2xl transition-all duration-200 mt-5 ${plan.ctaClass}`}
                >
                  {plan.id === 'free' ? 'Answer trial questions (free)' : plan.trial ? 'Start free trial' : 'Get started'}
                </Link>
              </div>

              {/* Divider */}
              <div className="mx-6 border-t border-edge/50" />

              {/* Grouped features */}
              <div className="p-6 pt-4 space-y-4 flex-1">
                {plan.groups.map((group) => (
                  <div key={group.label}>
                    <p className="text-[10.5px] font-bold uppercase tracking-widest text-fg-muted mb-2">{group.label}</p>
                    <ul className="space-y-1.5">
                      {group.features.map((f) => (
                        <li key={f.text} className="flex items-start gap-2">
                          <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${f.highlight ? plan.accentColor : 'text-success'}`} />
                          <span className={`text-[12.5px] leading-snug ${f.highlight ? 'text-fg font-semibold' : 'text-fg-secondary'}`}>{f.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust perks */}
        <motion.div
          {...inViewOnce}
          transition={{ ...inViewOnce.transition, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-10"
        >
          {[
            '7-day free trial on paid plans',
            'Cancel anytime',
            '95+ languages',
            'No setup fees',
            '10x more pages than competitors at same price',
          ].map((perk) => (
            <span key={perk} className="flex items-center gap-1.5 text-[12.5px] text-fg-secondary">
              <Check className="w-3.5 h-3.5 text-success shrink-0" />
              {perk}
            </span>
          ))}
        </motion.div>

        {/* Competitor comparison callout */}
        <motion.div
          {...inViewOnce}
          transition={{ ...inViewOnce.transition, delay: 0.35 }}
          className="mt-8 mx-auto max-w-3xl rounded-3xl border border-primary/15 bg-primary/[0.02] px-6 py-6"
        >
          <p className="text-center text-[13px] font-bold text-fg mb-4">How PageCortex compares at $69/month</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            {[
              { name: 'PageCortex Growth', msgs: '10,000', pages: '10,000', highlight: true },
              { name: 'Chatbase $120', msgs: '4,000', pages: '20 MB' },
              { name: 'Biel.ai $150', msgs: '10,000', pages: '3,000' },
              { name: 'OkayIQ $74', msgs: '5,000', pages: '1,000' },
            ].map((c) => (
              <div key={c.name} className={`rounded-2xl p-3.5 ${c.highlight ? 'bg-primary/8 border border-primary/25' : 'bg-surface/80 border border-edge'}`}>
                <p className={`text-[11.5px] font-bold mb-2 ${c.highlight ? 'text-primary' : 'text-fg-muted'}`}>{c.name}</p>
                <p className="text-[14px] font-bold text-fg">{c.msgs}</p>
                <p className="text-[10.5px] text-fg-muted">messages</p>
                <p className="text-[14px] font-bold text-fg mt-1">{c.pages}</p>
                <p className="text-[10.5px] text-fg-muted">pages</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Add-ons */}
        <motion.div
          {...inViewOnce}
          transition={{ ...inViewOnce.transition, delay: 0.2 }}
          className="mt-16"
        >
          <div className="text-center mb-8">
            <p className="text-[12.5px] font-semibold uppercase tracking-[0.12em] text-primary mb-2">Add-ons</p>
            <h3 className="text-[clamp(1.25rem,2.5vw,1.75rem)] font-bold tracking-[-0.025em]">
              Supercharge your plan
            </h3>
            <p className="text-[14px] text-fg-secondary mt-2">
              Scale exactly what you need — messages, pages, bots, or support level.
            </p>
          </div>

          {/* Message add-ons */}
          <p className="text-[12px] font-bold uppercase tracking-wide text-fg-muted mb-4 text-center">Extra Conversations</p>
          <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
            {addons.map((addon) => (
              <div
                key={addon.messages}
                className={`relative p-5 rounded-3xl border flex flex-col items-center text-center transition-all duration-300 hover:scale-[1.01] ${
                  addon.popular
                    ? 'border-primary/30 bg-primary/[0.03]'
                    : 'border-edge bg-surface hover:bg-surface-elevated/50'
                }`}
              >
                {addon.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full bg-primary text-white text-[11px] font-bold">
                      Best Value
                    </span>
                  </div>
                )}
                <div className="text-[30px] font-bold text-fg tracking-[-0.03em] mt-1">${addon.price}</div>
                <div className="text-[12.5px] text-fg-muted mt-0.5">one-time</div>
                <div className="text-[16px] font-bold text-fg mt-3">{addon.messages} messages</div>
                <div className="text-[12px] text-fg-secondary mt-1">{addon.desc}</div>
                <Link
                  href="/dashboard/billing"
                  className="mt-4 w-full text-center text-[13px] font-semibold py-2.5 rounded-2xl bg-surface-elevated hover:bg-edge text-fg transition-colors duration-200 border border-edge"
                >
                  Add to account
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-[12px] text-fg-muted mt-6">
            Add-ons stack on top of your plan limits. Message packs valid for 12 months with rollover.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
