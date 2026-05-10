import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog — AI Pre-Sales Tips, Guides & Updates',
  description: 'Explore the PageCortex blog for guides on AI pre-sales assistants, conversion optimization, RAG technology, and best practices for boosting trial signups.',
  alternates: { canonical: 'https://pagecortex.com/blog' },
};

export interface BlogPost {
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  featured?: boolean;
  slug: string;
  content: string;
}

export const posts: BlogPost[] = [
  {
    title: 'How AI Pre-Sales Assistants Are Boosting SaaS Trial Conversions in 2025',
    excerpt: 'Discover how SaaS companies are using AI-powered pre-sales assistants to answer buyer objections instantly, reduce pricing confusion, and increase trial signups by 3x.',
    date: '2025-05-10',
    readTime: '8 min',
    category: 'Conversions',
    featured: true,
    slug: 'ai-presales-assistants-boosting-saas-conversions',
    content: `The SaaS landscape has fundamentally shifted. Visitors no longer want to fill out contact forms and wait for a sales rep to call them back. They want instant answers to their buying questions — pricing, integrations, comparisons, and "is this right for me?" queries.

## The Problem: Silent Visitor Churn

Most SaaS websites lose 67% of their qualified visitors because they can't get answers fast enough. Common scenarios:

- **Pricing confusion**: "Do you have a plan that fits a 5-person team?" → No instant answer → Visitor leaves
- **Integration questions**: "Does this work with Salesforce?" → Has to dig through docs → Gives up
- **Competitor comparison**: "How is this different from Intercom?" → No clear comparison → Checks competitor instead

## The Solution: AI Pre-Sales Assistants

Unlike generic chatbots that handle support tickets, AI pre-sales assistants are specifically designed to:

1. **Answer pricing questions** with exact plan details, not vague "check our pricing page" responses
2. **Overcome buyer objections** by pulling real product information from your website
3. **Qualify leads** by understanding buying intent and routing high-value prospects appropriately
4. **Work 24/7** — capturing the 40% of buying decisions that happen outside business hours

## Real Results

Companies using PageCortex's AI pre-sales assistant report:

- **3x increase** in trial signups from website visitors
- **67% reduction** in time-to-first-response for pricing questions
- **42% fewer** abandoned checkout flows due to pricing confusion
- **24/7 coverage** without adding headcount

## Getting Started

Setting up an AI pre-sales assistant takes under 5 minutes:

1. Connect your website URL
2. Let AI crawl and learn your product content
3. Embed one line of code
4. Start converting visitors into trials

The key insight: you don't need to build complex conversation flows. The AI learns from your existing website content — pricing pages, feature lists, FAQs, and documentation — and uses that to answer buyer questions accurately.`,
  },
  {
    title: 'The Complete Guide to RAG-Powered Chatbots',
    excerpt: 'Learn how Retrieval-Augmented Generation technology makes chatbots more accurate and contextually aware than ever before — and why it matters for your business.',
    date: '2025-05-05',
    readTime: '12 min',
    category: 'Technology',
    slug: 'complete-guide-rag-powered-chatbots',
    content: `Retrieval-Augmented Generation (RAG) is the technology behind the most accurate AI chatbots available today. Unlike traditional chatbots that rely on pre-written scripts or pure language model generation, RAG combines the best of both worlds.

## What is RAG?

RAG works in three steps:

1. **Retrieve**: When a user asks a question, the system searches your knowledge base (website content, docs, FAQs) to find the most relevant information
2. **Augment**: The retrieved context is fed to the AI model alongside the user's question
3. **Generate**: The AI generates a response grounded in your actual content, not its training data

## Why RAG Matters

### Accuracy
Traditional chatbots either follow rigid scripts (rule-based) or hallucinate freely (pure LLM). RAG-powered bots are grounded in your data, achieving 95-98% answer accuracy.

### Source Citations
Every answer can include the source page it was pulled from, building user trust and allowing verification.

### Always Up-to-Date
When you update your website, the chatbot's knowledge updates automatically after re-crawling. No manual training required.

### No Hallucinations
If the answer isn't in your content, the bot says so instead of making something up. This is critical for pricing, legal, and technical questions.

## How PageCortex Implements RAG

PageCortex uses a hybrid search approach combining:

- **Vector similarity search** (pgvector) for semantic understanding
- **BM25 full-text search** for exact keyword matching
- **Re-ranking** to ensure the best chunks rise to the top
- **Confidence scoring** to trigger fallbacks when information is missing

This multi-signal approach delivers superior retrieval quality compared to vector-only search.`,
  },
  {
    title: '5 Conversion Metrics Every SaaS Should Track for Their AI Chatbot',
    excerpt: 'From visitor-to-conversation rate to demo booking conversions, these are the KPIs that matter most for measuring your AI chatbot\'s impact on revenue.',
    date: '2025-04-28',
    readTime: '6 min',
    category: 'Analytics',
    slug: 'saas-chatbot-conversion-metrics',
    content: `If you're measuring your chatbot by "total messages sent," you're doing it wrong. For SaaS companies, the metrics that matter are conversion-focused.

## 1. Visitor → Conversation Rate

**What it measures**: The percentage of website visitors who actually engage with your chatbot.

**Target**: 5-15% of visitors should initiate a conversation.

**How to improve**: Better welcome messages that address visitor intent. Instead of "Hi, how can I help?", try "Have questions about our pricing or features? I can help you find the right plan."

## 2. Conversation → Trial Signup Rate

**What it measures**: Of visitors who chat, how many sign up for a free trial?

**Target**: 15-30% conversion rate for engaged chatbot users.

**Why it matters**: This is your chatbot's direct revenue impact. If visitors are chatting but not converting, your bot may be giving poor answers or lacking confidence-based fallbacks.

## 3. Unanswered Question Rate

**What it measures**: Percentage of questions where the bot couldn't provide a confident answer.

**Target**: Below 10%.

**How to improve**: Review unanswered questions in your dashboard and add the missing content to your website. This creates a virtuous cycle of improvement.

## 4. Average Response Time

**What it measures**: Time from question to first response token.

**Target**: Under 2 seconds for first token.

## 5. Human Handoff Rate

**What it measures**: Percentage of conversations that needed human intervention.

**Target**: Below 15% for a well-trained bot.

**Why it matters**: Too high means your knowledge base has gaps. Too low might mean you're missing complex queries that deserve human attention.`,
  },
  {
    title: 'Why Your Pricing Page Needs an AI Assistant (Not Just a FAQ)',
    excerpt: 'Static FAQs can\'t handle the infinite variety of pricing questions. Here\'s why an AI assistant on your pricing page can increase trial conversions by 40%.',
    date: '2025-04-20',
    readTime: '7 min',
    category: 'Strategy',
    slug: 'pricing-page-ai-assistant',
    content: `Your pricing page is where buying decisions happen — or don't. It's the highest-intent page on your entire website, yet most SaaS companies leave visitors alone to figure things out.

## The Problem with Static FAQs

A typical FAQ section covers 10-15 questions. But visitors have infinite variations:

- "Which plan is best for a 3-person team with 50,000 monthly users?"
- "If I upgrade mid-cycle, do I get charged the full month?"
- "Can I use the Growth plan features but with the Starter plan pricing?"
- "Do you have a startup discount?"

No FAQ can anticipate every question. An AI assistant can answer all of them by understanding your pricing structure from your actual content.

## What an AI Pricing Assistant Does

### Instant Plan Recommendations
"I have a 10-person team, we handle about 5,000 customer conversations a month" → The AI recommends the right plan with specific reasoning.

### Comparison with Competitors  
"How does your $69 plan compare to Intercom?" → The AI pulls your comparison data and highlights advantages.

### Objection Handling
"That seems expensive for what you offer" → The AI responds with value propositions and ROI data from your content.

### Fallback to Human
When the AI can't answer confidently, it offers to connect the visitor with your team — capturing the lead instead of losing them.

## Implementation

Adding an AI assistant to your pricing page takes one line of code. PageCortex crawls your entire site including pricing, feature comparison, and FAQ pages, then deploys a widget that sits on your pricing page ready to answer any question.

Companies report a 40% increase in trial conversions after adding an AI assistant to their pricing page.`,
  },
  {
    title: 'How to Embed a Chatbot on Any Website: WordPress, Wix, Shopify & More',
    excerpt: 'Step-by-step guide to adding an AI chatbot to any website platform — from WordPress and Wix to Shopify, Webflow, and custom React apps.',
    date: '2025-04-15',
    readTime: '5 min',
    category: 'Tutorial',
    slug: 'embed-chatbot-any-website',
    content: `One of the most common questions we get is "how do I add the chatbot to my specific website platform?" The good news: it's the same single script tag for every platform. The only difference is where you paste it.

## The Universal Script Tag

Every PageCortex chatbot uses one line of code:

\`\`\`html
<script src="https://www.pagecortex.com/widget.js" data-bot-id="YOUR_BOT_ID" async></script>
\`\`\`

## Platform-Specific Instructions

### WordPress
Go to **Appearance → Theme File Editor**, open \`footer.php\`, and paste the script before \`</body>\`. Or use the "Insert Headers and Footers" plugin for a no-code approach.

### Wix
Navigate to **Settings → Custom Code → Add Custom Code**. Set placement to "Body - End" and apply to "All Pages."

### Shopify
Go to **Online Store → Themes → Edit Code**, open \`theme.liquid\`, and paste before the closing \`</body>\` tag.

### Webflow
In **Project Settings → Custom Code**, paste into the "Footer Code" section and publish.

### Squarespace
Go to **Settings → Developer Tools → Code Injection** and paste in the Footer section.

### React / Next.js
Use the Script component:

\`\`\`jsx
import Script from 'next/script'
<Script src="https://www.pagecortex.com/widget.js" data-bot-id="YOUR_BOT_ID" strategy="lazyOnload" />
\`\`\`

### Google Tag Manager
Create a new Custom HTML tag, paste the script, and set the trigger to "All Pages."

## Customization

You can customize the widget with data attributes:

- \`data-color="#6366f1"\` — Widget accent color
- \`data-position="right"\` — Widget position (left or right)

The widget automatically matches your site's layout and works on both desktop and mobile.`,
  },
  {
    title: 'PageCortex vs Chatbase vs Intercom: Which AI Chatbot is Right for You?',
    excerpt: 'An honest comparison of PageCortex, Chatbase, and Intercom across pricing, features, accuracy, and use cases to help you choose the right tool.',
    date: '2025-04-10',
    readTime: '10 min',
    category: 'Comparison',
    slug: 'pagecortex-vs-chatbase-vs-intercom',
    content: `Choosing an AI chatbot platform is a significant decision. Here's how PageCortex compares to two popular alternatives across the dimensions that matter most.

## Pricing Comparison

| Feature | PageCortex Growth ($69/mo) | Chatbase ($120/mo) | Intercom ($99/mo + per resolution) |
|---------|---------------------------|--------------------|------------------------------------|
| Conversations | 10,000/mo | 4,000/mo | Unlimited (but $0.99/resolution) |
| Pages Indexed | 10,000 | 20 MB limit | N/A (manual KB) |
| Chatbots | 3 | 5 | 1 |
| AI Model | GPT-4.1 + Mini | GPT-4 | Fin AI |

## Key Differences

### PageCortex — Best for Pre-Sales Conversion
- **Focus**: Converting visitors into trials and demos
- **Strength**: Automatic website crawling, confidence-based fallbacks, conversion analytics
- **Best for**: SaaS startups, B2B products, developer tools

### Chatbase — Best for General AI Chat
- **Focus**: General-purpose AI chatbot
- **Strength**: Multiple data source integrations, simple UI
- **Best for**: Content-heavy websites, general customer support

### Intercom — Best for Full Customer Support
- **Focus**: Complete customer support platform
- **Strength**: Ticketing, team inbox, proactive messaging, deep integrations
- **Best for**: Large teams needing a full support suite

## Our Honest Take

If you need a full customer support platform with ticketing and team management, Intercom is the right choice despite the higher cost.

If you want a general-purpose chatbot trained on your content, Chatbase works well.

If your goal is specifically to **convert more website visitors into trials and demos**, PageCortex is purpose-built for that use case — with better pricing, more conversations, and conversion-focused analytics.`,
  },
];

export default function BlogPage() {
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-bg pt-32 pb-24">
        <section className="max-w-[1200px] mx-auto px-6 mb-16">
          <div className="text-center">
            <p className="text-[13px] font-medium uppercase tracking-[0.1em] text-primary mb-4">Blog</p>
            <h1 className="text-[clamp(2rem,4vw,3rem)] font-bold text-fg tracking-[-0.03em] mb-4">Insights &amp; Resources</h1>
            <p className="text-[16px] text-fg-secondary max-w-[520px] mx-auto leading-relaxed">Practical guides on AI pre-sales, conversion optimization, and growing your SaaS.</p>
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-6">
          <div>
            {/* Featured */}
            <Link href={`/blog/${featured.slug}`} className="block p-8 rounded-2xl border border-edge bg-surface/50 hover:bg-surface/80 transition-all duration-300 hover:border-edge-light mb-8 group">
              <span className="inline-block px-2.5 py-1 rounded-md bg-primary/10 text-primary text-[12px] font-medium mb-4">{featured.category}</span>
              <h2 className="text-[24px] font-bold text-fg tracking-[-0.02em] mb-3 group-hover:text-primary transition-colors">{featured.title}</h2>
              <p className="text-[15px] text-fg-secondary leading-relaxed mb-4 max-w-[600px]">{featured.excerpt}</p>
              <div className="flex items-center gap-2 text-[13px] text-fg-muted">
                <span>{new Date(featured.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span className="w-1 h-1 rounded-full bg-fg-muted/40"></span>
                <span>{featured.readTime}</span>
              </div>
            </Link>

            {/* Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rest.map((post, i) => (
                <Link key={i} href={`/blog/${post.slug}`} className="block p-6 rounded-2xl border border-edge bg-surface/40 hover:bg-surface/70 transition-all duration-300 hover:border-edge-light group">
                  <span className="inline-block px-2.5 py-1 rounded-md bg-primary/[0.06] text-primary/80 text-[11.5px] font-medium mb-3">{post.category}</span>
                  <h3 className="text-[17px] font-semibold text-fg tracking-[-0.01em] mb-2 group-hover:text-primary transition-colors leading-snug">{post.title}</h3>
                  <p className="text-[13.5px] text-fg-secondary leading-relaxed mb-4">{post.excerpt}</p>
                  <div className="flex items-center gap-2 text-[12px] text-fg-muted">
                    <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <span className="w-1 h-1 rounded-full bg-fg-muted/40"></span>
                    <span>{post.readTime}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
