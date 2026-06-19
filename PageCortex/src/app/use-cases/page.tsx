import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Link from 'next/link';
import type { Metadata } from 'next';

// ─── Use-Case Pages Data ──────────────────────────────────
export interface UseCasePage {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  heroHeadline: string;
  heroSub: string;
  painPoints: { icon: string; title: string; desc: string }[];
  solution: { title: string; desc: string }[];
  stats: { value: string; label: string }[];
  faqItems: { q: string; a: string }[];
}

export const useCases: UseCasePage[] = [
  {
    slug: 'ai-assistant-for-website',
    title: 'AI Assistant for Website',
    metaTitle: 'AI Assistant for Website — Add Smart AI Chat to Any Site | PageCortex',
    metaDescription: 'Add an AI assistant to your website in under 5 minutes. Trains on your content automatically, answers visitor questions 24/7, and converts browsers into buyers. No coding required.',
    heroHeadline: 'Add an AI Assistant to Your Website in Minutes',
    heroSub: 'PageCortex trains an intelligent AI assistant on your website content — pricing, features, docs, FAQs — and deploys a chat widget that answers visitor questions accurately, 24/7.',
    painPoints: [
      { icon: '⏳', title: 'Visitors Leave Without Answers', desc: 'Most visitors bounce within 15 seconds when they can\'t find what they need. An AI assistant gives them instant answers before they leave.' },
      { icon: '🌙', title: 'No 24/7 Coverage', desc: '40% of buying decisions happen outside business hours. An AI assistant never sleeps — it handles pricing, feature, and integration questions at 3 AM.' },
      { icon: '💸', title: 'Hiring Live Chat Agents Is Expensive', desc: 'A single live chat agent costs $3,000-5,000/month. An AI assistant handles 90%+ of questions for a fraction of the cost.' },
    ],
    solution: [
      { title: 'Automatic Knowledge Ingestion', desc: 'Point PageCortex at your URL. It crawls every page — pricing, docs, FAQs, feature lists — and builds a searchable knowledge base automatically.' },
      { title: 'RAG-Powered Accuracy', desc: 'Retrieval-Augmented Generation ensures every answer is grounded in YOUR content. No hallucinations. No made-up pricing. Every answer cites its source.' },
      { title: 'One-Line Embed', desc: 'Copy a single script tag into your site. Works on WordPress, Wix, Shopify, Webflow, React, or any HTML page.' },
      { title: 'Conversion Analytics', desc: 'Track which questions visitors ask, what goes unanswered, and how chat interactions convert to signups and demos.' },
    ],
    stats: [
      { value: '3x', label: 'More Trial Signups' },
      { value: '<2s', label: 'Response Time' },
      { value: '95%+', label: 'Answer Accuracy' },
      { value: '24/7', label: 'Always Available' },
    ],
    faqItems: [
      { q: 'How does an AI assistant learn my website content?', a: 'PageCortex crawls your website automatically, extracts text from every page, converts it into vector embeddings, and stores it in a searchable knowledge base. When a visitor asks a question, the AI retrieves the most relevant content and generates an accurate answer.' },
      { q: 'Do I need coding skills to add an AI assistant?', a: 'No. After creating your bot in the dashboard, you get a single JavaScript snippet to paste into your website. Most platforms (WordPress, Wix, Shopify) have a "custom code" section where you can paste it in seconds.' },
      { q: 'Can the AI assistant handle pricing questions?', a: 'Yes — this is one of the most common use cases. The AI reads your pricing page and can answer questions like "Which plan is best for a 5-person team?" or "Do you offer annual billing?" with exact details from your content.' },
      { q: 'What if the AI doesn\'t know the answer?', a: 'PageCortex uses confidence scoring. When the AI isn\'t confident, it offers to connect the visitor with your team via email, contact form, or demo booking — so you never lose a lead.' },
      { q: 'Is it free to try?', a: 'Yes. PageCortex has a free-forever plan with 50 messages/month, 1 chatbot, and 100 indexed pages. No credit card required.' },
    ],
  },
  {
    slug: 'ai-chatbot-for-website',
    title: 'AI Chatbot for Website',
    metaTitle: 'AI Chatbot for Website — Smart, No-Code Chat Widget | PageCortex',
    metaDescription: 'Deploy an AI chatbot on your website that actually understands your product. Trained on your content, answers questions accurately, and converts visitors into customers.',
    heroHeadline: 'An AI Chatbot That Actually Knows Your Product',
    heroSub: 'Most chatbots give generic responses. PageCortex trains on YOUR website — your features, pricing, docs — so it answers every question with specific, accurate details.',
    painPoints: [
      { icon: '🤖', title: 'Generic Chatbots Give Generic Answers', desc: 'Rule-based chatbots follow rigid scripts. GPT wrappers hallucinate. PageCortex uses RAG to ground every answer in your actual content.' },
      { icon: '🔧', title: 'Complex Setup & Maintenance', desc: 'Traditional chatbots require building conversation flows, training intents, and constant maintenance. PageCortex auto-learns from your website.' },
      { icon: '📉', title: 'Low Engagement Rates', desc: 'Visitors ignore chatbots that can\'t help. An AI chatbot trained on your content earns trust by giving accurate, source-cited answers.' },
    ],
    solution: [
      { title: 'Trained on Your Content', desc: 'PageCortex crawls your website and builds a knowledge base. The chatbot answers from your actual content — not general AI knowledge.' },
      { title: 'Hybrid Search Technology', desc: 'Combines vector similarity search with keyword matching for the most relevant results. Re-ranks chunks to ensure the best context reaches the AI.' },
      { title: 'Customizable Widget', desc: 'Match your brand colors, position, welcome message, and personality. The widget looks native to your site, not like a third-party add-on.' },
      { title: 'Smart Model Routing', desc: 'Simple questions get fast, cheap AI responses. Complex buyer objections get routed to advanced models. Best quality at optimal cost.' },
    ],
    stats: [
      { value: '67%', label: 'Fewer Bounces' },
      { value: '90%+', label: 'Auto-Resolved' },
      { value: '5 min', label: 'Setup Time' },
      { value: '95+', label: 'Languages' },
    ],
    faqItems: [
      { q: 'How is PageCortex different from ChatGPT wrappers?', a: 'ChatGPT wrappers use general knowledge and often hallucinate. PageCortex uses RAG (Retrieval-Augmented Generation) to retrieve your specific content before generating answers, ensuring accuracy and source citations.' },
      { q: 'What websites does the chatbot work on?', a: 'Any publicly accessible website. WordPress, Shopify, Wix, Webflow, Squarespace, custom HTML/React/Vue — one script tag works everywhere.' },
      { q: 'Can I customize the chatbot appearance?', a: 'Yes. You can set accent colors, position (left/right), welcome messages, and the AI\'s personality and tone through the dashboard.' },
      { q: 'How many pages can the chatbot learn from?', a: 'Free plan: 100 pages. Starter ($29/mo): 500 pages. Growth ($69/mo): 2,000 pages. Scale ($199/mo): Unlimited.' },
      { q: 'Does the chatbot support multiple languages?', a: 'Yes. PageCortex supports 95+ languages automatically. The AI responds in the same language the visitor uses.' },
    ],
  },
  {
    slug: 'chatbot-for-saas',
    title: 'AI Chatbot for SaaS',
    metaTitle: 'AI Chatbot for SaaS — Convert Free Trial Visitors | PageCortex',
    metaDescription: 'Purpose-built AI chatbot for SaaS companies. Answer pricing questions, overcome buyer objections, and convert website visitors into free trial signups automatically.',
    heroHeadline: 'The AI Chatbot Built for SaaS Conversions',
    heroSub: 'SaaS visitors have specific questions — pricing tiers, integrations, comparisons. PageCortex answers them instantly using your actual product data to drive trial signups.',
    painPoints: [
      { icon: '❓', title: 'Pricing Page Confusion', desc: 'Visitors compare 3-4 plans and can\'t decide. An AI chatbot recommends the right plan based on their team size, usage, and needs.' },
      { icon: '🔄', title: 'Integration Questions Go Unanswered', desc: '"Does this work with Slack?" "Can I connect to Salesforce?" — if visitors can\'t find answers instantly, they check your competitor.' },
      { icon: '⚖️', title: 'Competitor Comparisons', desc: '"How are you different from Intercom?" — your chatbot can pull comparison data and highlight your advantages automatically.' },
    ],
    solution: [
      { title: 'Pre-Sales Focus', desc: 'Unlike support chatbots, PageCortex is optimized for conversion. It answers buying questions, handles objections, and guides visitors toward trial signup.' },
      { title: 'Automatic Content Refresh', desc: 'When you update your pricing page or add new features, re-crawl your site and the chatbot\'s knowledge updates instantly.' },
      { title: 'Lead Qualification', desc: 'The AI understands buying intent. High-value prospects can be routed to demo booking while casual browsers get self-serve answers.' },
      { title: 'Unanswered Question Tracking', desc: 'See exactly what questions your chatbot couldn\'t answer. Use this data to improve your website content and close knowledge gaps.' },
    ],
    stats: [
      { value: '40%', label: 'More Trial Signups' },
      { value: '3x', label: 'Engagement Rate' },
      { value: '$0', label: 'Free Forever Plan' },
      { value: '42%', label: 'Fewer Support Tickets' },
    ],
    faqItems: [
      { q: 'Is PageCortex built specifically for SaaS?', a: 'Yes. While it works for any website, PageCortex is purpose-built for SaaS pre-sales. Features like conversion analytics, plan recommendation, and trial CTA integration are designed for software companies.' },
      { q: 'Can it answer "How are you different from X?" questions?', a: 'Yes. If your website has comparison or competitor pages, the AI will pull that data to answer comparison questions. Many customers create dedicated comparison pages to feed the chatbot.' },
      { q: 'Does it integrate with my existing tools?', a: 'PageCortex has built-in integrations for Shopify, WooCommerce, and custom APIs. You can also use webhooks to connect to Slack, email, or your CRM for lead routing.' },
      { q: 'How does it handle pricing questions?', a: 'The AI reads your pricing page, feature comparison tables, and FAQ content. It can recommend specific plans based on visitor requirements and answer questions about billing, refunds, and upgrades.' },
    ],
  },
  {
    slug: 'no-code-chatbot-builder',
    title: 'No-Code Chatbot Builder',
    metaTitle: 'No-Code AI Chatbot Builder — Build in 5 Minutes | PageCortex',
    metaDescription: 'Build a powerful AI chatbot without writing a single line of code. PageCortex auto-trains on your website content and deploys with one click. Free forever plan available.',
    heroHeadline: 'Build an AI Chatbot Without Writing Code',
    heroSub: 'No conversation flows to design. No intents to train. No developer needed. Just enter your website URL and PageCortex builds an intelligent chatbot automatically.',
    painPoints: [
      { icon: '🏗️', title: 'Traditional Chatbots Need Developers', desc: 'Building conversation trees, training NLU models, maintaining integrations — it takes weeks and a dev team. PageCortex takes 5 minutes.' },
      { icon: '🔀', title: 'Conversation Flows Break Easily', desc: 'Rule-based flows can\'t handle unexpected questions. Users get stuck in loops. AI-powered bots understand natural language and adapt.' },
      { icon: '📊', title: 'No Visibility Into Performance', desc: 'Most no-code builders don\'t show you what\'s working. PageCortex tracks engagement, unanswered questions, and conversion metrics.' },
    ],
    solution: [
      { title: 'URL → Chatbot in Minutes', desc: 'Enter your website URL. PageCortex crawls it, builds a knowledge base, and generates a working chatbot. That\'s it.' },
      { title: 'AI Handles the Complexity', desc: 'No decision trees to design. The AI understands natural language, retrieves relevant content, and generates accurate responses automatically.' },
      { title: 'Visual Dashboard', desc: 'Manage everything from a clean dashboard — bots, knowledge sources, analytics, settings. Zero technical knowledge required.' },
      { title: 'One-Click Embed', desc: 'Copy a script tag and paste it into your website. Works with any platform — WordPress, Wix, Shopify, Webflow, or custom HTML.' },
    ],
    stats: [
      { value: '5 min', label: 'Time to Launch' },
      { value: '0', label: 'Lines of Code' },
      { value: '100+', label: 'Platforms Supported' },
      { value: 'Free', label: 'To Get Started' },
    ],
    faqItems: [
      { q: 'Do I really not need any coding?', a: 'Correct. You enter your URL, customize colors and messaging in the dashboard, and copy-paste one script tag into your site. Many users set up on Wix or WordPress without any technical knowledge.' },
      { q: 'How is this different from Dialogflow or Rasa?', a: 'Dialogflow and Rasa require designing intents, training data, and conversation flows. PageCortex automatically learns from your website content — no NLU training or flow design needed.' },
      { q: 'Can I customize the chatbot without code?', a: 'Yes. The dashboard lets you set colors, position, welcome messages, AI personality, fallback behavior, and more — all through a visual interface.' },
      { q: 'What if I want to add custom data sources?', a: 'You can upload PDFs, Word documents, or connect Notion pages through the dashboard. All data sources are indexed automatically and available to the chatbot.' },
    ],
  },
  {
    slug: 'chatbase-alternative',
    title: 'Chatbase Alternative',
    metaTitle: 'Best Chatbase Alternative — More Messages, Better Pricing | PageCortex',
    metaDescription: 'Looking for a Chatbase alternative? PageCortex offers 2.5x more messages, conversion-focused analytics, and lower pricing. Free plan available.',
    heroHeadline: 'The Chatbase Alternative Built for Conversions',
    heroSub: 'PageCortex gives you more messages per dollar, conversion-focused analytics, and features like human handoff and unanswered question tracking that Chatbase doesn\'t offer.',
    painPoints: [
      { icon: '💰', title: 'Chatbase Gets Expensive Fast', desc: 'Chatbase charges $120/month for 4,000 messages. PageCortex Growth plan gives you 5,000 messages for $69/month — 2.5x better value.' },
      { icon: '📊', title: 'No Conversion Tracking', desc: 'Chatbase shows chat metrics but not conversion impact. PageCortex tracks visitor → conversation → signup funnels so you see real ROI.' },
      { icon: '🚫', title: 'No Human Handoff', desc: 'When Chatbase can\'t answer, the visitor is stuck. PageCortex has confidence-based fallback to connect visitors with your team.' },
    ],
    solution: [
      { title: 'Better Pricing', desc: '$69/month for 5,000 messages vs Chatbase\'s $120/month for 4,000. More messages, lower cost, same quality AI.' },
      { title: 'Conversion Analytics', desc: 'Track which questions lead to signups, identify content gaps from unanswered questions, and measure your chatbot\'s revenue impact.' },
      { title: 'Human Handoff & Fallbacks', desc: 'When the AI isn\'t confident, visitors get connected to your team via email, contact forms, or demo booking. Never lose a lead.' },
      { title: 'Same Easy Setup', desc: 'Like Chatbase, just enter your URL and embed a script tag. Migration takes under 10 minutes.' },
    ],
    stats: [
      { value: '2.5x', label: 'Better Message Value' },
      { value: '42%', label: 'Cost Savings' },
      { value: '10 min', label: 'Migration Time' },
      { value: 'Free', label: 'Plan Available' },
    ],
    faqItems: [
      { q: 'How does pricing compare to Chatbase?', a: 'PageCortex Growth ($69/mo) gives you 5,000 messages and 10 bots. Chatbase Hobby ($120/mo) gives you 4,000 messages and 5 chatbots. PageCortex is significantly cheaper with more capacity.' },
      { q: 'Can I migrate from Chatbase easily?', a: 'Yes. Since both platforms crawl your website, you just enter your URL in PageCortex and it builds a new knowledge base in minutes. No data export needed.' },
      { q: 'Does PageCortex have everything Chatbase has?', a: 'Yes, plus more: conversion analytics, unanswered question tracking, human handoff, confidence-based fallbacks, smart model routing, and API integrations.' },
      { q: 'Is the AI quality comparable?', a: 'PageCortex uses the same GPT-4.1 models plus a hybrid search pipeline (vector + BM25 + re-ranking) that often delivers more accurate results than vector-only search.' },
    ],
  },
  {
    slug: 'embed-chatbot-on-website',
    title: 'Embed Chatbot on Website',
    metaTitle: 'How to Embed an AI Chatbot on Any Website — WordPress, Shopify, Wix | PageCortex',
    metaDescription: 'Embed a smart AI chatbot on WordPress, Shopify, Wix, Webflow, or any website with one script tag. No coding required. Free plan available.',
    heroHeadline: 'Embed an AI Chatbot on Any Website — One Line of Code',
    heroSub: 'WordPress, Shopify, Wix, Webflow, Squarespace, React — PageCortex works everywhere with a single script tag. Your chatbot is live in under 5 minutes.',
    painPoints: [
      { icon: '🔌', title: 'Platform Lock-In', desc: 'Many chatbots only work on specific platforms. PageCortex is platform-agnostic — one script tag works on any website that supports HTML.' },
      { icon: '⚙️', title: 'Complex Integration Steps', desc: 'Some chatbots need plugins, API keys, and SDK installations. PageCortex embeds with a single line — no dependencies, no build steps.' },
      { icon: '📱', title: 'Poor Mobile Experience', desc: 'Many chat widgets break on mobile. PageCortex\'s widget is fully responsive and optimized for touch interactions on any screen size.' },
    ],
    solution: [
      { title: 'Universal Script Tag', desc: 'One line of code works on every platform: <script src="pagecortex.com/widget.js" data-bot-id="YOUR_ID" async></script>' },
      { title: 'Platform-Specific Guides', desc: 'Step-by-step instructions for WordPress, Shopify, Wix, Webflow, Squarespace, Next.js, and Google Tag Manager.' },
      { title: 'Customizable Appearance', desc: 'Set colors, position, and branding with data attributes — no CSS required. The widget matches your site automatically.' },
      { title: 'Lightweight & Fast', desc: 'The widget script is under 25KB and loads asynchronously. Zero impact on your page speed or Core Web Vitals.' },
    ],
    stats: [
      { value: '1', label: 'Line of Code' },
      { value: '<25KB', label: 'Script Size' },
      { value: '100+', label: 'Platforms' },
      { value: '0ms', label: 'Page Speed Impact' },
    ],
    faqItems: [
      { q: 'How do I embed the chatbot on WordPress?', a: 'Go to Appearance → Theme File Editor, open footer.php, and paste the script before </body>. Or use the "Insert Headers and Footers" plugin for a no-code approach.' },
      { q: 'Does it work on Shopify?', a: 'Yes. Go to Online Store → Themes → Edit Code, open theme.liquid, and paste the script before the closing </body> tag.' },
      { q: 'Will it slow down my website?', a: 'No. The script loads asynchronously (async attribute) and is under 25KB. It has zero impact on your page load time or Google PageSpeed score.' },
      { q: 'Can I put it on specific pages only?', a: 'Yes. You can conditionally load the script on specific pages using your platform\'s page-specific code injection, or use Google Tag Manager with page-level triggers.' },
    ],
  },
];

export const metadata: Metadata = {
  title: 'Use Cases — AI Assistant for Every Website | PageCortex',
  description: 'Explore how PageCortex powers AI assistants for websites, SaaS chatbots, no-code chatbot builders, and more. Find the perfect solution for your use case.',
  alternates: { canonical: 'https://pagecortex.com/use-cases' },
};

export default function UseCasesPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-bg pt-32 pb-24">
        <section className="max-w-[1280px] mx-auto px-6 mb-16">
          <div className="text-center">
            <p className="text-[12.5px] font-semibold uppercase tracking-[0.12em] text-primary mb-4">Use Cases</p>
            <h1 className="text-[clamp(2rem,4vw,3rem)] font-bold text-fg tracking-[-0.035em] mb-4">
              AI-Powered Solutions for Every Website
            </h1>
            <p className="text-[16px] text-fg-secondary max-w-[560px] mx-auto leading-relaxed">
              From SaaS pre-sales to e-commerce support, PageCortex adapts to your specific use case.
            </p>
          </div>
        </section>

        <section className="max-w-[1280px] mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {useCases.map((uc) => (
              <Link
                key={uc.slug}
                href={`/use-cases/${uc.slug}`}
                className="group block p-6 rounded-3xl border border-edge bg-surface hover:bg-surface-elevated/60 hover:border-edge-light hover:scale-[1.01] transition-all duration-300"
              >
                <h2 className="text-[18px] font-bold text-fg tracking-[-0.02em] mb-2 group-hover:text-primary transition-colors">
                  {uc.title}
                </h2>
                <p className="text-[13.5px] text-fg-secondary leading-relaxed mb-4">
                  {uc.metaDescription.substring(0, 120)}…
                </p>
                <span className="text-[13px] font-semibold text-primary group-hover:underline">
                  Learn more →
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

