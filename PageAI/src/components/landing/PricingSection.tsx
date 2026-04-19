'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const plans = [
  {
    id: 'free',
    name: 'Free',
    desc: 'For trying things out',
    price: { m: 0, a: 0 },
    cta: 'Start Free',
    features: ['1 chatbot', '100 messages/month', '200 pages indexed', 'Fast AI', 'Basic analytics', 'Website connector'],
  },
  {
    id: 'starter',
    name: 'Starter',
    desc: 'For small businesses',
    price: { m: 29, a: 23 },
    ctaMonthly: 'Start 7-Day Free Trial',
    ctaAnnual: 'Get Annual Plan',
    trial: true,
    features: ['1 chatbot', '4,000 messages/month', '1,000 pages indexed', 'Smart AI routing', 'File uploads', 'Remove branding', 'Email support'],
  },
  {
    id: 'growth',
    name: 'Growth',
    desc: 'For growing teams',
    price: { m: 69, a: 55 },
    ctaMonthly: 'Start 7-Day Free Trial',
    ctaAnnual: 'Get Annual Plan',
    popular: true,
    trial: true,
    features: ['3 chatbots', '10,000 messages/month', '10,000 pages indexed', 'Advanced AI + Smart routing', 'All data connectors', 'Advanced analytics', 'Priority support', 'Custom system prompts'],
  },
  {
    id: 'scale',
    name: 'Scale',
    desc: 'For scaling businesses',
    price: { m: 199, a: 159 },
    ctaMonthly: 'Start 7-Day Free Trial',
    ctaAnnual: 'Get Annual Plan',
    trial: true,
    features: ['10 chatbots', '40,000 messages/month', '50,000 pages indexed', 'All AI models', 'All data connectors', 'Dedicated support'],
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
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-[13px] font-medium uppercase tracking-[0.1em] text-primary mb-4">Pricing</p>
          <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.15] tracking-[-0.03em] mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-[16px] text-fg-secondary max-w-[420px] mx-auto leading-relaxed">
            Start free. Upgrade when ready. Cancel anytime.
          </p>
        </motion.div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <span className={`text-[13.5px] transition-colors duration-200 ${!annual ? 'text-fg' : 'text-fg-muted'}`}>
            Monthly
          </span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${annual ? 'bg-primary' : 'bg-edge-light'}`}
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${annual ? 'left-6' : 'left-1'}`}
            />
          </button>
          <span className={`text-[13.5px] transition-colors duration-200 ${annual ? 'text-fg' : 'text-fg-muted'}`}>
            Annual <span className="text-success text-[12px]">Save 20%</span>
          </span>
        </div>

        {/* Plans */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className={`relative p-6 rounded-2xl border transition-all duration-300 flex flex-col ${
                plan.popular
                  ? 'border-primary/40 bg-primary/[0.04] hover:border-primary/60'
                  : 'border-edge bg-surface/40 hover:bg-surface/70 hover:border-edge-light'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full bg-primary text-white text-[11px] font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              {(plan as any).trial && !annual && (
                <div className="mb-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-success/10 text-success text-[11px] font-medium">
                    <span className="w-1 h-1 rounded-full bg-success" />
                    7-day free trial
                  </span>
                </div>
              )}

              <div className="mb-5">
                <h3 className="text-[17px] font-semibold text-fg tracking-[-0.01em]">{plan.name}</h3>
                <p className="text-[13px] text-fg-muted mt-0.5">{plan.desc}</p>
              </div>

              <div className="mb-6">
                {/* Strikethrough original monthly when annual selected */}
                {annual && plan.price.m > 0 && (
                  <div className="text-[14px] text-fg-muted line-through mb-0.5">
                    ${plan.price.m}/mo
                  </div>
                )}
                <div className="flex items-baseline gap-1">
                  <span className="text-[36px] font-bold text-fg tracking-[-0.03em]">
                    ${annual ? plan.price.a : plan.price.m}
                  </span>
                  {plan.price.m > 0 && (
                    <span className="text-[14px] text-fg-muted">/mo</span>
                  )}
                </div>
                {plan.price.m === 0 && (
                  <p className="text-[13px] text-fg-muted mt-1">Free forever</p>
                )}
                {plan.price.m > 0 && annual && (
                  <p className="text-[12px] text-fg-muted mt-1">
                    Billed <span className="text-fg">${plan.price.a * 12}/yr</span>
                    {' · '}
                    <span className="text-success font-medium">
                      Save ${(plan.price.m - plan.price.a) * 12}
                    </span>
                  </p>
                )}
                {plan.price.m > 0 && !annual && (
                  <p className="text-[12px] text-success mt-1 font-medium">
                    Save ${(plan.price.m - plan.price.a) * 12}/yr with annual ↑
                  </p>
                )}
              </div>

              <Link
                href={
                  (plan as any).id === 'free'
                    ? '/signup'
                    : `/signup?plan=${(plan as any).id}${annual ? '&billing=annual' : ''}`
                }
                className={`block text-center text-[13.5px] font-medium py-2.5 rounded-lg transition-all duration-300 mb-6 ${
                  plan.popular
                    ? 'bg-primary hover:bg-primary-hover text-white hover:shadow-[0_0_24px_rgba(79,109,245,0.25)]'
                    : 'bg-edge/50 hover:bg-edge-light text-fg'
                }`}
              >
                {(plan as any).id === 'free'
                  ? 'Start Free'
                  : annual
                  ? (plan as any).ctaAnnual
                  : (plan as any).ctaMonthly}
              </Link>

              <ul className="space-y-2.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" />
                    <span className="text-[13px] text-fg-secondary">{f}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Perks */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-10"
        >
          {['7-day free trial', 'Cancel anytime', '95+ languages supported', 'Friendly pricing as you scale', 'Personalized onboarding help'].map((perk) => (
            <span key={perk} className="flex items-center gap-1.5 text-[13px] text-fg-secondary">
              <Check className="w-3.5 h-3.5 text-success shrink-0" />
              {perk}
            </span>
          ))}
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
            <p className="text-[13px] font-medium uppercase tracking-[0.1em] text-primary mb-2">Add-ons</p>
            <h3 className="text-[clamp(1.25rem,2.5vw,1.75rem)] font-bold tracking-[-0.02em]">
              Need more messages?
            </h3>
            <p className="text-[14px] text-fg-secondary mt-2">
              Top up anytime. Valid for 12 months, no expiry stress.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 max-w-[700px] mx-auto">
            {addons.map((addon) => (
              <div
                key={addon.messages}
                className={`relative p-5 rounded-2xl border flex flex-col items-center text-center transition-all duration-300 ${
                  addon.popular
                    ? 'border-primary/40 bg-primary/[0.04]'
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
                <div className="text-[28px] font-bold text-fg tracking-[-0.03em] mt-1">
                  ${addon.price}
                </div>
                <div className="text-[13px] text-fg-muted mt-0.5">one-time</div>
                <div className="text-[16px] font-semibold text-fg mt-3">
                  {addon.messages} messages
                </div>
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
            Add-ons stack on top of your plan's monthly limit. Unused messages roll over within validity period.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
