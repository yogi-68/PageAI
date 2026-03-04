'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  { q: 'How does PageAI work?', a: 'PageAI crawls your website, extracts text content, creates vector embeddings using OpenAI, and stores them in a vector database. When a visitor asks a question, we use RAG to find the most relevant content and generate an accurate answer.' },
  { q: 'Do I need coding skills?', a: "No. Enter your URL, wait for the crawl, customize appearance, and copy the embed code. It's a single script tag that works on any website." },
  { q: 'How accurate are the responses?', a: 'Because we use RAG, the chatbot only answers from your actual content. This eliminates hallucinations and ensures factual, grounded responses.' },
  { q: 'Can I customize the chatbot?', a: 'Yes — colors, position, welcome message, bot name, and avatar. Premium plans also remove PageAI branding.' },
  { q: 'What websites are supported?', a: 'Any publicly accessible site — WordPress, Shopify, Wix, Next.js, plain HTML, and more.' },
  { q: 'How long does setup take?', a: 'Most users go from signup to a live chatbot in under 5 minutes. Crawling takes 30 seconds to 2 minutes.' },
  { q: 'Can I use my own API key?', a: 'Enterprise plans support bring-your-own-key. Other plans include all API costs within your message limits.' },
  { q: 'What happens at my message limit?', a: "You'll be notified at 80% usage. At the limit, the bot shows a friendly message directing visitors to contact you. Upgrade anytime." },
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
