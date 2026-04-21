'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
  accentClass: string;
  ctaClass: string;
  groups: FeatureGroup[];
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    desc: 'For trying things out',
    price: { m: 0, a: 0 },
    accentClass: 'border-edge bg-surface/40 hover:border-edge-light',
    ctaClass: 'bg-edge/60 hover:bg-edge-light text-fg',
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
          { text: '⚡ Fast AI (GPT-4.1 mini)' },
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
    accentClass: 'border-primary/40 bg-primary/4 hover:border-primary/60',
    ctaClass: 'bg-primary hover:bg-primary-hover text-white hover:shadow-[0_0_24px_rgba(79,109,245,0.25)]',
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
          { text: '⚡ Fast AI + 🧠 Smart routing' },
        ],
      },
      {
        label: 'Data & Knowledge',
        features: [
          { text: 'Website + SPA crawling' },
          { text: 'File uploads (PDF, DOCX, HTML, CSV, MD)', highlight: true },
          { text: 'Remove PageAI branding' },
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
    accentClass: 'border-success/30 bg-success/3 hover:border-success/50',
    ctaClass: 'bg-success hover:bg-success/90 text-white',
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
          { text: '🧠 Advanced AI + Smart routing', highlight: true },
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
          { text: 'Remove PageAI branding' },
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
    accentClass: 'border-warning/30 bg-warning/3 hover:border-warning/50',
    ctaClass: 'bg-warning hover:bg-warning/90 text-[#1a1200]',
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
          { text: '🚀 All AI models', highlight: true },
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
          { text: 'Remove PageAI branding' },
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
      <div className="max-w-300 mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-[13px] font-medium uppercase tracking-widest text-primary mb-4">Pricing</p>
          <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.15] tracking-[-0.03em] mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-[16px] text-fg-secondary max-w-125 mx-auto leading-relaxed">
            More messages, more pages, lower cost than every major competitor. Start free, no card required.
          </p>
        </motion.div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <span className={`text-[13.5px] transition-colors duration-200 ${!annual ? 'text-fg font-medium' : 'text-fg-muted'}`}>
            Monthly
          </span>
          <button
            onClick={() => setAnnual(!annual)}
            aria-label="Toggle annual billing"
            className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${annual ? 'bg-primary' : 'bg-edge-light'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300 ${annual ? 'left-6' : 'left-1'}`} />
          </button>
          <span className={`text-[13.5px] transition-colors duration-200 ${annual ? 'text-fg font-medium' : 'text-fg-muted'}`}>
            Annual{' '}
            <span className="inline-block px-1.5 py-0.5 rounded-md bg-success/15 text-success text-[11px] font-semibold ml-1">
              Save 20%
            </span>
          </span>
        </div>

        {/* Plan cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className={`relative rounded-2xl border transition-all duration-300 flex flex-col ${plan.accentClass}`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <span className={`px-3 py-1 rounded-full text-white text-[11px] font-semibold whitespace-nowrap shadow-sm ${plan.badge.color === 'primary' ? 'bg-primary' : 'bg-success'}`}>
                    {plan.badge.text}
                  </span>
                </div>
              )}

              <div className="p-6 pb-4">
                {/* Trial badge */}
                {plan.trial && (
                  <div className="mb-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-success/10 text-success text-[11px] font-medium">
                      <span className="w-1 h-1 rounded-full bg-success" />
                      7-day free trial
                    </span>
                  </div>
                )}

                {/* Plan name */}
                <h3 className="text-[18px] font-bold text-fg tracking-[-0.02em]">{plan.name}</h3>
                <p className="text-[12.5px] text-fg-muted mt-0.5">{plan.desc}</p>

                {/* Price */}
                <div className="mt-4 mb-1">
                  {annual && plan.price.m > 0 && (
                    <span className="text-[13px] text-fg-muted line-through mr-1.5">${plan.price.m}/mo</span>
                  )}
                  <div className="flex items-baseline gap-1">
                    <span className="text-[38px] font-bold text-fg tracking-[-0.04em] leading-none">
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
                  className={`block text-center text-[13.5px] font-semibold py-2.5 rounded-xl transition-all duration-200 mt-5 ${plan.ctaClass}`}
                >
                  {plan.id === 'free' ? 'Start Free' : plan.trial ? 'Start Free Trial' : 'Get Started'}
                </Link>
              </div>

              {/* Divider */}
              <div className="mx-6 border-t border-edge/60" />

              {/* Grouped features */}
              <div className="p-6 pt-4 space-y-4 flex-1">
                {plan.groups.map((group) => (
                  <div key={group.label}>
                    <p className="text-[10.5px] font-bold uppercase tracking-widest text-fg-muted mb-2">{group.label}</p>
                    <ul className="space-y-1.5">
                      {group.features.map((f) => (
                        <li key={f.text} className="flex items-start gap-2">
                          <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${f.highlight ? 'text-primary' : 'text-success'}`} />
                          <span className={`text-[12.5px] leading-snug ${f.highlight ? 'text-fg font-medium' : 'text-fg-secondary'}`}>{f.text}</span>
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
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ delay: 0.3, duration: 0.4 }}
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
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="mt-8 mx-auto max-w-215 rounded-2xl border border-primary/20 bg-primary/3 px-6 py-5"
        >
          <p className="text-center text-[13px] font-semibold text-fg mb-3">How PageAI compares at $69/month</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            {[
              { name: 'PageAI Growth', msgs: '10,000', pages: '10,000', highlight: true },
              { name: 'Chatbase $120', msgs: '4,000', pages: '20 MB' },
              { name: 'Biel.ai $150', msgs: '10,000', pages: '3,000' },
              { name: 'OkayIQ $74', msgs: '5,000', pages: '1,000' },
            ].map((c) => (
              <div key={c.name} className={`rounded-xl p-3 ${c.highlight ? 'bg-primary/10 border border-primary/30' : 'bg-surface/60 border border-edge'}`}>
                <p className={`text-[11.5px] font-semibold mb-2 ${c.highlight ? 'text-primary' : 'text-fg-muted'}`}>{c.name}</p>
                <p className="text-[13px] font-bold text-fg">{c.msgs}</p>
                <p className="text-[10.5px] text-fg-muted">messages</p>
                <p className="text-[13px] font-bold text-fg mt-1">{c.pages}</p>
                <p className="text-[10.5px] text-fg-muted">pages</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Add-ons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-16"
        >
          <div className="text-center mb-8">
            <p className="text-[13px] font-medium uppercase tracking-widest text-primary mb-2">Add-ons</p>
            <h3 className="text-[clamp(1.25rem,2.5vw,1.75rem)] font-bold tracking-[-0.02em]">
              Need more messages?
            </h3>
            <p className="text-[14px] text-fg-secondary mt-2">
              Top up anytime. Valid for 12 months, no expiry stress.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 max-w-175 mx-auto">
            {addons.map((addon) => (
              <div
                key={addon.messages}
                className={`relative p-5 rounded-2xl border flex flex-col items-center text-center transition-all duration-300 ${
                  addon.popular
                    ? 'border-primary/40 bg-primary/4'
                    : 'border-edge bg-surface/40 hover:bg-surface/70 hover:border-edge-light'
                }`}
              >
                {addon.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full bg-primary text-white text-[11px] font-medium">
                      Best Value
                    </span>
                  </div>
                )}
                <div className="text-[28px] font-bold text-fg tracking-[-0.03em] mt-1">${addon.price}</div>
                <div className="text-[13px] text-fg-muted mt-0.5">one-time</div>
                <div className="text-[16px] font-semibold text-fg mt-3">{addon.messages} messages</div>
                <div className="text-[12px] text-fg-secondary mt-1">{addon.desc}</div>
                <Link
                  href="/dashboard/billing"
                  className="mt-4 w-full text-center text-[13px] font-medium py-2 rounded-lg bg-edge/50 hover:bg-edge-light text-fg transition-colors duration-200"
                >
                  Add to account
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-[12px] text-fg-muted mt-6">
            Add-ons stack on top of your plan monthly limit. Unused messages roll over within validity period.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
