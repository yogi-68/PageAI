'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Globe, Plug, ShoppingBag, Store, Code2, Upload, Map } from 'lucide-react';
import { inViewOnce } from '@/lib/landing-motion';

const knowledgeSources = [
  { icon: Globe, name: 'Website crawl', desc: 'Index your marketing site, docs, and pricing pages', plans: 'All plans', status: 'available' as const },
  { icon: Map, name: 'Sitemap import', desc: 'Bulk-import pages from your XML sitemap', plans: 'Starter+', status: 'available' as const },
  { icon: Upload, name: 'File upload', desc: 'PDF, DOCX, TXT, and Markdown files', plans: 'Starter+', status: 'available' as const },
  { icon: BookOpen, name: 'Notion', desc: 'Sync Notion pages and databases', plans: 'Growth+', status: 'coming_soon' as const },
  { icon: Upload, name: 'Google Drive', desc: 'Import docs from Google Drive', plans: 'Growth+', status: 'coming_soon' as const },
];

const liveIntegrations = [
  {
    icon: ShoppingBag,
    name: 'Shopify',
    desc: 'Look up orders, products, and shipping zones via Admin API',
    tools: ['Order status', 'Shipment tracking', 'Product availability', 'Shipping estimate'],
    plans: 'Growth+',
  },
  {
    icon: Store,
    name: 'WooCommerce',
    desc: 'Connect your WooCommerce store for live order and product data',
    tools: ['Order status', 'Shipment tracking', 'Product availability', 'Shipping estimate'],
    plans: 'Growth+',
  },
  {
    icon: Code2,
    name: 'Custom REST API',
    desc: 'Any REST API with GET endpoints — whitelisted paths, encrypted credentials',
    tools: ['Configurable endpoints', 'Bearer / API key auth', 'Response sanitization'],
    plans: 'Growth+',
  },
];

const setupSteps = [
  'Upgrade to Growth (or Scale) — live API integrations require API access on your plan.',
  'Go to Dashboard → Integrations and click Add integration.',
  'Choose Shopify, WooCommerce, or Custom REST. Enter your store URL and API credentials.',
  'Set allowed endpoint paths (e.g. /orders/, /products/) — only whitelisted paths can be called.',
  'Run Test connection, then enable the integration. Your bot can now answer live order and product questions.',
];

export default function IntegrationsSection() {
  return (
    <section id="integrations" className="py-24 relative">
      <div className="max-w-[1280px] mx-auto px-6">
        <motion.div {...inViewOnce} className="text-center mb-14">
          <p className="text-[12.5px] font-semibold uppercase tracking-[0.12em] text-primary mb-4">Integrations</p>
          <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.12] tracking-[-0.035em] mb-4">
            Train on your content.
            <br className="hidden sm:block" /> Connect live store data.
          </h2>
          <p className="text-[16px] text-fg-secondary max-w-[640px] mx-auto leading-relaxed">
            PageCortex has two integration layers: <strong className="text-fg font-medium">knowledge sources</strong> that teach your bot what to say,
            and <strong className="text-fg font-medium">live API integrations</strong> that let it look up real orders, products, and shipping info during chat.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <motion.div {...inViewOnce} className="p-6 rounded-3xl border border-edge bg-surface/40">
            <div className="flex items-center gap-2 mb-4">
              <Plug className="w-5 h-5 text-primary" />
              <h3 className="text-[18px] font-bold text-fg">Knowledge sources</h3>
            </div>
            <p className="text-[13.5px] text-fg-secondary mb-5 leading-relaxed">
              Used to answer pricing, feature, and setup questions from your existing content. No live API calls — content is indexed and searched with RAG.
            </p>
            <ul className="space-y-3">
              {knowledgeSources.map((s) => (
                <li key={s.name} className="flex items-start gap-3 p-3 rounded-xl border border-edge/80 bg-bg/30">
                  <s.icon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[14px] font-semibold text-fg">{s.name}</span>
                      {s.status === 'coming_soon' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-warning/10 text-warning font-medium">Coming soon</span>
                      )}
                    </div>
                    <p className="text-[12.5px] text-fg-secondary mt-0.5">{s.desc}</p>
                    <p className="text-[11px] text-fg-muted mt-1">{s.plans}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div {...inViewOnce} className="p-6 rounded-3xl border border-primary/15 bg-primary/[0.03]">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <h3 className="text-[18px] font-bold text-fg">Live API integrations</h3>
            </div>
            <p className="text-[13.5px] text-fg-secondary mb-5 leading-relaxed">
              For e-commerce and SaaS with order portals. The AI calls your store API during chat to answer &ldquo;Where is my order?&rdquo; and similar questions — credentials are encrypted and never exposed to visitors.
            </p>
            <div className="space-y-4">
              {liveIntegrations.map((item) => (
                <div key={item.name} className="p-4 rounded-xl border border-edge bg-surface/60">
                  <div className="flex items-center gap-2 mb-1">
                    <item.icon className="w-4 h-4 text-primary" />
                    <span className="text-[15px] font-bold text-fg">{item.name}</span>
                    <span className="text-[10px] ml-auto px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">{item.plans}</span>
                  </div>
                  <p className="text-[12.5px] text-fg-secondary mb-2">{item.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.tools.map((t) => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded-md bg-edge/60 text-fg-muted">{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div {...inViewOnce} className="p-6 md:p-8 rounded-3xl border border-edge bg-surface/40">
          <h3 className="text-[17px] font-bold text-fg mb-4">How to set up a live integration</h3>
          <ol className="space-y-3 mb-6">
            {setupSteps.map((step, i) => (
              <li key={i} className="flex gap-3 text-[14px] text-fg-secondary leading-relaxed">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-[12px] font-bold flex items-center justify-center">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/docs#integrations"
              className="inline-flex items-center gap-2 text-[14px] font-semibold text-primary hover:text-primary-hover transition-colors"
            >
              Read full integration guide <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 text-[14px] font-medium text-fg-secondary hover:text-fg transition-colors"
            >
              Start free, connect later
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
