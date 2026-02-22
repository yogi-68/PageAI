# 🧠 PageAI — AI-Powered Website Q&A Chatbot SaaS

![PageAI](https://img.shields.io/badge/PageAI-AI%20Chatbot%20SaaS-6366f1?style=for-the-badge&logo=openai&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js%2015-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white)

**Transform any website into an intelligent AI assistant.** PageAI crawls your site, indexes your content using RAG (Retrieval-Augmented Generation), and creates a custom chatbot that answers visitor questions using your own data — with source citations.

## 🚀 Live Demo

Visit the deployed app: [https://pageai.io](https://pageai.io)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [External Services Required](#-external-services-required)
- [Database Setup](#-database-setup)
- [Revenue Strategy](#-revenue-strategy)
- [SEO Strategy](#-seo-strategy)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)

---

## ✨ Features

### Core Platform
- **🕷️ Auto-Crawl Websites** — Enter a URL and automatically extract, chunk, and index all content
- **🤖 RAG-Powered Q&A** — Accurate, hallucination-free answers grounded in actual site content
- **💬 Embeddable Widget** — Drop-in chat widget with single `<script>` tag
- **📊 Real-Time Analytics** — Track conversations, satisfaction, popular questions, and engagement
- **🎨 Full Customization** — Custom colors, persona, welcome message, position
- **🌍 Multi-Language** — Auto-detect and respond in 50+ languages
- **🔗 Source Citations** — Every answer links back to the exact source page
- **🔌 Integrations** — Webhooks, Slack, Zendesk, HubSpot connectors
- **👥 Team Collaboration** — Multi-seat access with role-based permissions
- **⚡ AI Actions** — Beyond Q&A: lead capture, scheduling, CRM updates

### Dashboard
- **Overview** — Stats, bot performance, recent conversations
- **Bot Manager** — Create, configure, and deploy multiple bots
- **Conversations** — Review all chat logs with detail panel
- **Analytics** — Charts, sentiment analysis, top pages
- **Billing** — Usage meters, plan management, invoice history
- **Settings** — Profile, notifications, API keys, security

### SEO
- **JSON-LD Structured Data** — SoftwareApplication, Organization, FAQ schemas
- **Dynamic Sitemap** — Auto-generated sitemap.xml
- **Robots.txt** — Proper crawl directives
- **Open Graph & Twitter Cards** — Rich social media previews
- **Blog System** — SEO-optimized content hub
- **Performance** — Server-side rendering, code splitting, optimized fonts

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, React, TypeScript |
| **Styling** | Tailwind CSS 4, Custom CSS |
| **Auth** | Supabase Auth (Google, GitHub, Email) |
| **Database** | Supabase (PostgreSQL + pgvector) |
| **Vector DB** | Pinecone or Supabase pgvector |
| **AI/LLM** | OpenAI GPT-4, GPT-3.5, Embeddings |
| **Payments** | Stripe (Subscriptions + Webhooks) |
| **Email** | Resend (Transactional) |
| **Hosting** | Vercel |
| **CDN** | Cloudflare |
| **Animations** | Framer Motion, CSS Animations |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Landing  │  │Dashboard │  │ Embed Widget     │  │
│  │  Page    │  │  (React) │  │  (Vanilla JS)    │  │
│  └────┬─────┘  └────┬─────┘  └──────┬───────────┘  │
└───────┼──────────────┼──────────────┼───────────────┘
        │              │              │
        ▼              ▼              ▼
┌─────────────────────────────────────────────────────┐
│                 NEXT.JS API ROUTES                  │
│  ┌──────┐  ┌──────┐  ┌───────┐  ┌────────────────┐ │
│  │/crawl│  │/chat │  │/billing│  │/webhook        │ │
│  └──┬───┘  └──┬───┘  └───┬───┘  └────┬───────────┘ │
└─────┼─────────┼──────────┼────────────┼─────────────┘
      │         │          │            │
      ▼         ▼          ▼            ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│  Cheerio │ │  OpenAI  │ │  Stripe  │ │  Resend  │
│ (Crawler)│ │ (AI/RAG) │ │(Payments)│ │ (Email)  │
└──────────┘ └──┬───────┘ └──────────┘ └──────────┘
                │
         ┌──────┴──────┐
         ▼             ▼
    ┌──────────┐  ┌──────────┐
    │ Pinecone │  │ Supabase │
    │(Vectors) │  │(Postgres)│
    └──────────┘  └──────────┘
```

### RAG Pipeline

```
User Query → Embed Query → Vector Search (top-5) → Assemble Context → LLM Generate → Answer + Sources
```

---

## 🏁 Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/pageai.git
cd pageai

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Fill in your credentials in .env.local
# (See "External Services Required" below)

# Run development server
npm run dev
```

Visit `http://localhost:3000`

---

## 🔑 External Services Required

Set up these services and add credentials to `.env.local`:

### 1. Supabase (Database + Auth)
1. Go to [supabase.com](https://supabase.com) → Create new project
2. Copy: `Project URL`, `anon key`, `service_role key`
3. Run the schema: Go to SQL Editor → paste `supabase/schema.sql` → Run
4. Enable Auth providers: Settings → Auth → Google, GitHub

### 2. OpenAI (AI Models)
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create API key → Copy
3. Recommended: Set usage limits to control costs

### 3. Stripe (Payments)
1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Get: `Secret Key`, `Publishable Key`
3. Create Products:
   - **Growth** → $39/month → Copy Price ID
   - **Professional** → $129/month → Copy Price ID
   - **Enterprise** → $399/month → Copy Price ID
4. Set up Webhook:
   - Endpoint: `https://yourdomain.com/api/billing/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.*`, `invoice.*`
   - Copy Webhook Secret

### 4. Pinecone (Vector Database)
1. Go to [pinecone.io](https://pinecone.io) → Create free account
2. Create index: Name=`pageai-embeddings`, Dimensions=`1536`, Metric=`cosine`
3. Copy API Key

### 5. Resend (Emails)
1. Go to [resend.com](https://resend.com) → Create account
2. Verify your domain
3. Copy API Key

### 6. Vercel (Hosting)
1. Go to [vercel.com](https://vercel.com) → Connect GitHub
2. Import project → Add all env variables
3. Deploy

### 7. Domain + Cloudflare
1. Register domain (e.g., `pageai.io`)
2. Set up Cloudflare for DNS, CDN, and DDoS protection
3. Point domain to Vercel

### 8. Google Search Console + GA4
1. [search.google.com/search-console](https://search.google.com/search-console) → Add property
2. Submit sitemap: `https://yourdomain.com/sitemap.xml`
3. [analytics.google.com](https://analytics.google.com) → Create GA4 property

---

## 💰 Revenue Strategy

### Pricing Tiers

| Plan | Price | Q&A/mo | Pages | Models | Key Feature |
|------|-------|--------|-------|--------|-------------|
| **Starter** | Free | 1,000 | 10 | GPT-3.5 | Try before buy |
| **Growth** | $39/mo | 10,000 | 50 | GPT-4 | Remove branding |
| **Professional** | $129/mo | 50,000 | 200 | GPT-4 + Claude | API + Webhooks |
| **Enterprise** | $399/mo | 200,000+ | 1,000+ | All models | SLA + White-label |

### Revenue Projections

**Month 6 Target:**
- 500 Free users → 50 Growth ($1,950) + 15 Pro ($1,935) + 3 Enterprise ($1,197) = **$5,082 MRR**

**Month 12 Target:**
- 2,000 Free users → 200 Growth ($7,800) + 60 Pro ($7,740) + 12 Enterprise ($4,788) = **$20,328 MRR**

### Cost Structure
- **OpenAI API**: ~$0.002-0.03 per answer (depending on model)
- **Pinecone**: Free tier → $70/mo at scale
- **Supabase**: Free tier → $25/mo at scale
- **Vercel**: Free → $20/mo Pro
- **Estimated margin**: 70-85% at scale

### Upsell Opportunities
1. **Overage charges** — Pay-as-you-go after hitting Q&A limits
2. **White-label** — $100-200/mo add-on
3. **Custom integrations** — One-time setup fees $500-2000
4. **Agency partnerships** — Volume licensing for web agencies

---

## 🔍 SEO Strategy

### On-Page SEO (Implemented)
- ✅ Semantic HTML5 structure
- ✅ JSON-LD structured data (SoftwareApplication, Organization, FAQPage)
- ✅ Dynamic sitemap.xml
- ✅ Robots.txt with proper directives
- ✅ Open Graph + Twitter Cards
- ✅ Meta titles, descriptions, keywords
- ✅ Canonical URLs
- ✅ H1 hierarchy per page
- ✅ Inter font (Google Fonts) for performance
- ✅ Server-side rendering (Next.js SSR)

### Content Strategy (To Implement)
- 📝 Weekly blog posts targeting long-tail keywords
- 📝 Comparison pages ("PageAI vs Chatbase", "PageAI vs Botsonic")
- 📝 Use case pages ("AI Chatbot for E-commerce", "AI Chatbot for SaaS")
- 📝 Integration guides ("How to Add AI Chatbot to WordPress")
- 📝 Landing pages per industry vertical

### Technical SEO
- 📝 Core Web Vitals optimization
- 📝 Image optimization with Next.js Image component
- 📝 Lazy loading for below-fold content
- 📝 Preconnect to critical third-party domains
- 📝 Service worker for offline capability

### Link Building
- 📝 Product Hunt launch
- 📝 Hacker News / Reddit posts
- 📝 Guest posts on SaaS & AI blogs
- 📝 Free tool pages (e.g., "Free Website Crawler", "AI Readiness Checker")
- 📝 Integration partner pages with backlinks

---

## 📁 Project Structure

```
PageAI/
├── public/
│   └── widget.js              # Embeddable chat widget
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout with SEO
│   │   ├── page.tsx           # Landing page
│   │   ├── sitemap.ts         # Dynamic sitemap
│   │   ├── robots.ts          # Robots.txt
│   │   ├── login/page.tsx     # Login page
│   │   ├── signup/page.tsx    # Signup page
│   │   ├── blog/page.tsx      # Blog listing
│   │   ├── dashboard/
│   │   │   ├── layout.tsx     # Dashboard shell
│   │   │   ├── page.tsx       # Overview
│   │   │   ├── bots/
│   │   │   │   ├── page.tsx   # Bot list
│   │   │   │   └── new/page.tsx # Bot creation wizard
│   │   │   ├── conversations/page.tsx
│   │   │   ├── analytics/page.tsx
│   │   │   ├── billing/page.tsx
│   │   │   └── settings/page.tsx
│   │   └── api/
│   │       ├── chat/route.ts      # RAG chat endpoint
│   │       ├── crawl/route.ts     # Website crawler
│   │       └── billing/
│   │           ├── checkout/route.ts
│   │           └── webhook/route.ts
│   ├── components/
│   │   └── landing/           # Landing page components
│   │       ├── Navbar.tsx
│   │       ├── HeroSection.tsx
│   │       ├── FeaturesSection.tsx
│   │       ├── HowItWorksSection.tsx
│   │       ├── PricingSection.tsx
│   │       ├── TestimonialsSection.tsx
│   │       ├── FAQSection.tsx
│   │       ├── CTASection.tsx
│   │       └── Footer.tsx
│   └── lib/
│       ├── utils.ts           # Utility functions
│       ├── supabase.ts        # Supabase client
│       ├── stripe.ts          # Stripe config + plans
│       └── openai.ts          # OpenAI + RAG functions
├── supabase/
│   └── schema.sql             # Database schema
├── .env.example               # Environment template
├── next.config.ts             # Next.js configuration
├── package.json
└── README.md
```

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Add all environment variables in Vercel Dashboard → Settings → Environment Variables.

### Docker (Alternative)

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 📄 License

MIT License — feel free to modify and use commercially.

---

## 🤝 Contributing

Contributions welcome! Please open an issue first to discuss changes.

---

Built with ❤️ by the PageAI team. **Star ⭐ this repo if it helped you!**
