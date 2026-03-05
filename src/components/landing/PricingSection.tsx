'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    desc: 'For trying things out',
    price: { m: 0, a: 0 },
    cta: 'Start Free',
    href: '/signup',
    features: ['1 chatbot', '50 messages/month', '100 pages indexed', 'GPT-4.1 Mini', 'Basic analytics', 'Website connector'],
  },
  {
    name: 'Starter',
    desc: 'For small businesses',
    price: { m: 29, a: 23 },
    cta: 'Get Started',
    href: '/signup',
    features: ['1 chatbot', '4,000 messages/month', '1,000 pages indexed', 'GPT-4.1 Mini', 'Full analytics', 'Custom branding', 'File uploads', 'Email support'],
  },
  {
    name: 'Growth',
    desc: 'For growing teams',
    price: { m: 69, a: 55 },
    cta: 'Get Started',
    href: '/signup',
    popular: true,
    features: ['3 chatbots', '10,000 messages/month', '10,000 pages indexed', 'GPT-4.1 + Auto routing', 'Notion & Google Drive', 'API access', 'Priority support', 'Streaming responses'],
  },
  {
    name: 'Scale',
    desc: 'For scaling businesses',
    price: { m: 199, a: 159 },
    cta: 'Get Started',
    href: '/signup',
    features: ['10 chatbots', '40,000 messages/month', '50,000 pages indexed', 'GPT-4.1 + Smart routing', 'All data connectors', 'Zendesk & Confluence', 'Dedicated support', 'Custom branding'],
  },
];

export default function PricingSection() {
  const [annual, setAnnual] = useState(false);

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

              <div className="mb-5">
                <h3 className="text-[17px] font-semibold text-fg tracking-[-0.01em]">{plan.name}</h3>
                <p className="text-[13px] text-fg-muted mt-0.5">{plan.desc}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-[36px] font-bold text-fg tracking-[-0.03em]">
                    ${annual ? plan.price.a : plan.price.m}
                  </span>
                  {plan.price.m > 0 && (
                    <span className="text-[14px] text-fg-muted">/mo</span>
                  )}
                </div>
                {plan.price.m === 0 && (
                  <p className="text-[13px] text-fg-muted">Free forever</p>
                )}
              </div>

              <Link
                href={plan.href}
                className={`block text-center text-[13.5px] font-medium py-2.5 rounded-lg transition-all duration-300 mb-6 ${
                  plan.popular
                    ? 'bg-primary hover:bg-primary-hover text-white hover:shadow-[0_0_24px_rgba(79,109,245,0.25)]'
                    : 'bg-edge/50 hover:bg-edge-light text-fg'
                }`}
              >
                {plan.cta}
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
      </div>
    </section>
  );
}
