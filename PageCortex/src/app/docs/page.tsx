import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Documentation — How to Set Up & Embed Your AI Chatbot',
  description: 'Step-by-step guide to creating, configuring, and embedding an AI chatbot with PageCortex. From account setup to going live on your website in under 5 minutes.',
  alternates: { canonical: 'https://pagecortex.com/docs' },
  openGraph: {
    title: 'PageCortex Documentation — AI Chatbot Setup Guide',
    description: 'Complete step-by-step guide to setting up and embedding your AI chatbot with PageCortex.',
    url: 'https://pagecortex.com/docs',
    type: 'article',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'PageCortex Documentation' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PageCortex Docs — AI Chatbot Setup Guide',
    description: 'Step-by-step guide to setting up and embedding your AI chatbot.',
    images: ['/og-image.png'],
  },
};

const steps = [
  {
    number: '01',
    title: 'Create Your Account',
    description: 'Sign up for free — no credit card required. Your free plan includes 1 chatbot, 50 messages/month, and 100 pages indexed.',
    actions: [
      'Visit pagecortex.vercel.app and click "Get started free"',
      'Enter your email and create a password',
      'Confirm your email and you\'re in',
    ],
    tip: 'Start with the free plan to explore the platform, then upgrade when you\'re ready to go live.',
  },
  {
    number: '02',
    title: 'Add Your Website',
    description: 'PageCortex crawls your website and indexes its content so your chatbot can answer questions accurately.',
    actions: [
      'Go to Dashboard → Websites',
      'Click "Add Website" and enter your domain (e.g. yourcompany.com)',
      'PageCortex will crawl and index up to 100 pages automatically',
      'Wait for the status to show "Indexed" — usually under 2 minutes',
    ],
    tip: 'You can add multiple URLs to focus on specific pages, or use a sitemap URL to bulk-import all pages at once.',
  },
  {
    number: '03',
    title: 'Create Your First Bot',
    description: 'A bot is your AI assistant — give it a name, personality, and connect it to your website\'s knowledge.',
    actions: [
      'Go to Dashboard → Bots → New Bot',
      'Give your bot a name (e.g. "Support Assistant")',
      'Select your indexed website as the knowledge source',
      'Set a system prompt to define the bot\'s personality and scope',
      'Click "Create Bot" — your bot is now live',
    ],
    tip: 'System prompt example: "You are a helpful support assistant for Acme Corp. Answer questions about our products, pricing, and policies. If you don\'t know the answer, say so and suggest contacting support@acme.com."',
  },
  {
    number: '04',
    title: 'Test Your Bot',
    description: 'Use the built-in preview to test your bot before embedding it on your site.',
    actions: [
      'Open your bot from the Bots dashboard',
      'Click the "Preview" button to open a live test window',
      'Ask questions your customers actually ask',
      'Adjust the system prompt if needed to refine the tone',
    ],
    tip: 'Try asking questions your customers actually ask — edge cases, product comparisons, pricing questions.',
  },
  {
    number: '05',
    title: 'Embed on Your Website',
    description: 'Add your chatbot to any website with a single line of code. No framework required.',
    actions: [
      'Go to your bot settings and copy the embed snippet',
      'Paste it before the closing </body> tag on your website',
      'The chat widget appears automatically on all pages',
    ],
    code: `<script
  src="https://pagecortex.vercel.app/widget.js"
  data-bot-id="YOUR_BOT_ID"
  async
></script>`,
    tip: 'Works with any website — Shopify, WordPress, Webflow, plain HTML, or React apps.',
  },
];

const faqs = [
  {
    q: 'How long does it take to set up a chatbot?',
    a: 'Most users have a working chatbot embedded on their site within 5–10 minutes. The crawling process takes 1–2 minutes for most sites.',
  },
  {
    q: 'What AI models are used?',
    a: 'Free and Starter plans use GPT-4.1 Mini — fast and cost-effective. Growth, Scale, and Enterprise plans unlock GPT-4.1 (most capable) and smart auto-routing that selects the best model per query.',
  },
  {
    q: 'What happens when my message limit is reached?',
    a: 'The chatbot will notify users that the limit has been reached for the month. You can buy add-on message packs (1K, 5K, or 10K) from the Billing page, or upgrade your plan to get a higher monthly limit.',
  },
  {
    q: 'Does the chatbot answer in real time?',
    a: 'Yes — responses are streamed in real time. Most answers appear within 1–2 seconds.',
  },
  {
    q: 'How does the chatbot know what\'s on my website?',
    a: 'PageCortex crawls your website, splits the text into chunks, and creates vector embeddings stored in our database. When a user asks a question, we find the most relevant chunks and pass them to the AI along with the question — this is called RAG (Retrieval-Augmented Generation).',
  },
  {
    q: 'Can I update my website\'s content and re-index?',
    a: 'Yes. Go to Dashboard → Websites → select your site → click "Re-crawl". The bot\'s knowledge will update to reflect your latest content.',
  },
  {
    q: 'Can I customise what the chatbot looks like?',
    a: 'The widget supports a custom accent color and position. Full white-label (remove PageCortex branding) is available on Starter plan and above.',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. All data is encrypted at rest and in transit. Your content is only used to answer questions for your own bot — it\'s never shared with other users or used for training.',
  },
  {
    q: 'Can I cancel my subscription anytime?',
    a: 'Yes — cancel anytime from Billing → Manage Subscription. You\'ll keep access until the end of your billing period.',
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-[760px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[13px] font-medium mb-6">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            Documentation
          </div>
          <h1 className="text-[42px] md:text-[52px] font-bold tracking-[-0.03em] leading-[1.1] mb-5">
            Build your AI chatbot<br />
            <span className="text-primary">in 5 steps</span>
          </h1>
          <p className="text-[18px] text-fg-secondary leading-relaxed mb-8 max-w-[580px] mx-auto">
            From signup to a live chatbot on your website — no coding required. Follow this guide and you&apos;ll be up and running in under 10 minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold text-[15px] hover:bg-primary/90 transition-colors"
            >
              Go to Dashboard
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
            <Link
              href="/api-reference"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-edge text-fg font-medium text-[15px] hover:bg-surface transition-colors"
            >
              API Reference
            </Link>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="px-6 pb-20">
        <div className="max-w-[760px] mx-auto space-y-10">
          {steps.map((step, i) => (
            <div key={step.number} className="relative">
              {i < steps.length - 1 && (
                <div className="absolute left-[23px] top-[52px] w-px h-full bg-edge" />
              )}
              <div className="flex gap-5">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="text-[13px] font-bold text-primary">{step.number}</span>
                </div>
                <div className="flex-1 pt-1 pb-2">
                  <h2 className="text-[20px] font-bold text-fg tracking-tight mb-2">{step.title}</h2>
                  <p className="text-[15px] text-fg-secondary leading-relaxed mb-4">{step.description}</p>
                  <ol className="space-y-2 mb-4">
                    {step.actions.map((action, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-surface border border-edge flex items-center justify-center text-[11px] font-semibold text-fg-muted mt-0.5">{j + 1}</span>
                        <span className="text-[14px] text-fg-secondary">{action}</span>
                      </li>
                    ))}
                  </ol>
                  {step.code && (
                    <pre className="p-4 rounded-xl bg-surface border border-edge text-[13px] text-fg-secondary font-mono overflow-x-auto mb-4 whitespace-pre-wrap">{step.code}</pre>
                  )}
                  <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg bg-primary/5 border border-primary/15">
                    <svg className="w-4 h-4 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                    <p className="text-[13px] text-fg-secondary"><span className="font-semibold text-fg">Tip:</span> {step.tip}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 pb-24 border-t border-edge">
        <div className="max-w-[760px] mx-auto pt-20">
          <h2 className="text-[30px] font-bold tracking-tight mb-2">Frequently Asked Questions</h2>
          <p className="text-[16px] text-fg-secondary mb-10">Everything you need to know about using PageCortex.</p>
          <div className="space-y-5">
            {faqs.map((faq, i) => (
              <div key={i} className="p-5 rounded-xl border border-edge bg-surface/30">
                <p className="text-[15px] font-semibold text-fg mb-2">{faq.q}</p>
                <p className="text-[14px] text-fg-secondary leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24">
        <div className="max-w-[760px] mx-auto">
          <div className="p-8 md:p-12 rounded-2xl border border-primary/20 bg-primary/5 text-center">
            <h2 className="text-[26px] font-bold tracking-tight mb-3">Ready to get started?</h2>
            <p className="text-[15px] text-fg-secondary mb-6">Create your free account and have a chatbot running in minutes.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/signup" className="px-6 py-3 rounded-xl bg-primary text-white font-semibold text-[15px] hover:bg-primary/90 transition-colors">Start for free</Link>
              <Link href="/#pricing" className="px-6 py-3 rounded-xl border border-edge text-fg font-medium text-[15px] hover:bg-surface transition-colors">View pricing</Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
