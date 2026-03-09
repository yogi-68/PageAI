'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  { q: 'How does PageAI work?', a: 'PageAI crawls your website or connects to data sources (Notion, Google Drive, etc.), semantically chunks your content, and stores embeddings in a vector database. When a visitor asks a question, our hybrid search (vector + BM25) finds the best context, and GPT-4.1 generates an accurate, cited answer.' },
  { q: 'Do I need coding skills?', a: "No. Enter your URL, wait for the crawl, customize appearance, and copy the embed code. It's a single script tag that works on any website." },
  { q: 'How accurate are the responses?', a: 'Our advanced RAG pipeline with query rewriting, hybrid search, and re-ranking achieves 95-98% accuracy. The chatbot only answers from your actual content — eliminating hallucinations.' },
  { q: 'Can I customize the chatbot?', a: 'Yes — colors, position, welcome message, bot name, and avatar. Starter plans and above also remove PageAI branding.' },
  { q: 'What data sources are supported?', a: 'Website crawling, sitemap import, and file uploads on all plans. Growth adds Notion and Google Drive. Scale adds Zendesk, Confluence, and GitBook. Enterprise supports custom API connectors.' },
  { q: 'How long does setup take?', a: 'Most users go from signup to a live chatbot in under 5 minutes. Crawling takes 30 seconds to 2 minutes depending on site size.' },
  { q: 'What AI models do you use?', a: 'All plans use GPT-4.1 Mini for fast, accurate responses. Growth and above get smart model routing — automatically using GPT-4.1 for complex queries while keeping costs low.' },
  { q: 'What happens at my message limit?', a: "You'll be notified at 80% usage. At the limit, you can enable automatic overage at $4 per 1,000 extra messages, or the bot shows a friendly message directing visitors to contact you. Upgrade anytime." },
  { q: 'Is there a free trial?', a: 'Yes! All paid plans include a 7-day free trial. No charge until the trial ends, and you can cancel anytime. Your free plan stays active even after canceling.' },
  { q: 'What languages are supported?', a: 'PageAI supports 95+ languages out of the box. GPT-4.1 handles multilingual queries natively — your chatbot can answer in the same language the visitor uses, even if your content is in English.' },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 relative">
      <div className="max-w-[680px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-[13px] font-medium uppercase tracking-[0.1em] text-primary mb-4">FAQ</p>
          <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.15] tracking-[-0.03em]">
            Frequently asked questions
          </h2>
        </motion.div>

        <div className="space-y-2">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className="rounded-xl border border-edge bg-surface/40 overflow-hidden transition-colors hover:border-edge-light"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer"
                >
                  <span className="text-[14.5px] font-medium text-fg pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-fg-muted shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-4">
                        <p className="text-[13.5px] text-fg-secondary leading-relaxed">{faq.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
