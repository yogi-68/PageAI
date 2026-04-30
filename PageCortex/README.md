# PageCortex — AI Chatbot Platform for Websites

**PageCortex** is a production-ready SaaS platform that lets businesses create custom AI chatbots trained on their website content. It crawls your site, builds a semantic knowledge base, and serves accurate, citation-backed answers through an embeddable widget — in real-time.

**Live:** [pagecortex.vercel.app](https://pagecortex.vercel.app)

---

## Table of Contents

1. [Quick Demo](#quick-demo)
2. [Who Is This For](#who-is-this-for)
3. [Why PageCortex](#why-PageCortex)
4. [Screenshots](#screenshots)
5. [How It Works](#how-it-works)
6. [Web Scraping & Crawling](#web-scraping--crawling)
7. [Features](#features)
8. [UI Routes](#ui-routes)
9. [API Routes](#api-routes)
10. [Pricing & Justification](#pricing--justification)
11. [Limitations](#limitations)
12. [Roadmap](#roadmap)
13. [Tech Stack](#tech-stack)
14. [Project Structure](#project-structure)
15. [Getting Started](#getting-started)
16. [Admin Panel](#admin-panel)
17. [Deployment](#deployment)
18. [OpenAI Cost Reference](#openai-cost-reference)
19. [Support](#support)

---

## Quick Demo

- **Live site:** https://pagecortex.vercel.app
- **Demo bot:** https://pagecortex.vercel.app/chat-preview/54ab9e2c-bb23-4e9c-9c92-4d80da4b4570
- **Test question:** _"What does PageCortex do?"_ or _"How do I embed the chatbot?"_

Sign up free — no credit card required. The demo bot is trained on the PageCortex website itself.

---

## Who Is This For

| Persona | Use Case |
|---|---|
| **SaaS founders** | Turn your docs, changelog, and help center into an always-on AI support agent |
| **E-commerce stores** | Answer product questions, shipping policy, returns — 24/7, without a support team |
| **Documentation-heavy products** | Let developers ask questions in plain English instead of searching docs |
| **Agencies** | White-label AI chatbots for clients — resell as a managed service |
| **Internal tools teams** | Train a bot on internal wikis, SOPs, and runbooks for employee self-service |

PageCortex is **not** a general-purpose chatbot builder. It is specifically designed for websites and documentation — if your use case is "answer questions about my content", PageCortex is the right tool.

---

## Why PageCortex

| Feature | PageCortex | Intercom | Custom GPT | Chatbase |
|---|---|---|---|---|
| Trains on your website | ✅ Auto-crawl | ❌ Manual | ❌ Manual upload | ✅ Manual upload |
| RAG with source citations | ✅ | ❌ | ❌ | Partial |
| Streaming responses | ✅ | ✅ | ✅ | ❌ |
| Open source / self-hostable | ✅ | ❌ | ❌ | ❌ |
| Pricing (entry paid tier) | $29/mo | ~$74/mo | $20/mo (Plus) | $19/mo |
| Hybrid vector + full-text search | ✅ | ❌ | ❌ | ❌ |
| Plan-based model enforcement | ✅ | N/A | N/A | ❌ |
| Native webhook billing | ✅ Dodo Payments | ✅ Stripe | N/A | ✅ Stripe |

**Bottom line:** PageCortex auto-crawls and re-indexes your site, uses hybrid RAG with citations, and gives you full ownership of your deployment.

---

## Screenshots

> Add screenshot files to `docs/screenshots/` to populate this section.

| Dashboard Overview | Bot Creation Wizard |
|---|---|
| ![Dashboard](docs/screenshots/dashboard.png) | ![Bot Creation](docs/screenshots/bot-creation.png) |

| Chat Widget (live on site) | Analytics |
|---|---|
| ![Widget](docs/screenshots/widget.png) | ![Analytics](docs/screenshots/analytics.png) |

---

## How It Works

```
User enters website URL
        ↓
Crawler fetches pages (Cheerio-based scraper)
        ↓
Clean HTML → extract readable text → remove scripts/styles/nav
        ↓
Semantic chunking → split into overlapping text chunks
        ↓
OpenAI Embeddings (text-embedding-3-small) → vectors
        ↓
Store chunks + vectors in Supabase (pgvector)
        ↓
User visits website → opens chat widget
        ↓
Query → hybrid search (vector + full-text) → top-k chunks
        ↓
GPT-4.1 generates answer with source citations (streamed)
        ↓
Answer displayed in real-time to visitor
```

---

## Web Scraping & Crawling

Web scraping is the **data input layer** for PageCortex — it is how website content gets into the knowledge base.

### What the crawler does

- Fetches HTML via standard HTTP (no headless browser needed for most sites)
- Strips `<script>`, `<style>`, `<nav>`, `<footer>`, `<header>`, `<iframe>`, `<svg>`, and `[aria-hidden]` elements using **Cheerio**
- Extracts page title, h1–h4 headings, and body text
- Discovers internal links and follows them recursively
- Respects configurable `allowedPaths` and `blockedPaths`
- Skips binary files (`.pdf`, `.jpg`, `.css`, `.js`, etc.)
- Enforces per-plan page limits (Free: 100 pages, Starter: 1,000, Growth: 10,000, Scale: 50,000)
- Rate-limited per user (5 crawl requests/min) to prevent abuse

### Limits by design

| Plan | Max Pages | Purpose |
|---|---|---|
| Free | 100 | Small landing sites, single-product pages |
| Starter | 1,000 | Small business sites, docs sites |
| Growth | 10,000 | Mid-size company sites, wikis |
| Scale | 50,000 | Large enterprise knowledge bases |
| Enterprise | Unlimited | Custom — contact us |

### Implementation: `src/app/api/crawl/route.ts`

Uses Cheerio (not Puppeteer) for fast, lightweight HTML parsing. JavaScript-rendered pages (SPAs) are not fully supported in Phase 1 — Puppeteer/Playwright integration is planned for Phase 2.

### Supported data sources

| Source | Status | Plan |
|---|---|---|
| Website URL (crawler) | ✅ Live | All plans |
| File upload (PDF, TXT, DOCX) | ✅ Live | Starter+ |
| Sitemap.xml | ✅ Live | Starter+ |
| Notion | 🔜 Planned | Growth+ |
| Google Drive | 🔜 Planned | Growth+ |
| GitBook | 🔜 Planned | Scale+ |
| Zendesk | 🔜 Planned | Scale+ |
| REST API ingestion | 🔜 Planned | Scale+ |

---

## Features

### AI Chat Engine
- **Advanced RAG Pipeline** — Semantic chunking with overlap, hybrid search (cosine similarity + full-text trigram), query rewriting, multi-hop reasoning
- **Smart Model Routing** — Fast AI for simple queries, Advanced AI for complex ones; fully automatic
- **Streaming SSE Responses** — Real-time token streaming so users see answers as they are generated
- **Source Citations** — Every answer backed by page references with confidence scores
- **Intelligent Caching** — LRU + database-level response cache for repeated queries
- **Rate Limiting** — Token-bucket rate limiting per user/IP tier for chat and crawl endpoints
- **Domain Verification** — Optional per-bot allowed-domain list to prevent unauthorized widget embeds

### Data Ingestion
- **Website Crawler** — Crawls, extracts, and indexes website content automatically with Cheerio
- **Semantic Chunker** — Smart text splitting with configurable chunk size and overlap to preserve context
- **pgvector Embeddings** — OpenAI `text-embedding-3-small` stored in Supabase pgvector
- **Hybrid Search** — Combined vector similarity + full-text search RPC for higher recall
- **Re-crawl Support** — Dashboard button to refresh stale knowledge base

### Embeddable Widget
- **One-line integration** — Single `<script async>` tag, paste before `</body>`
- **Lazy-loaded** — Deferred via `requestIdleCallback` so it never blocks page first paint
- **Auto-detects API origin** from script `src` — works on any domain without config
- **Configurable** via `data-` attributes: color, position, bot name, welcome message
- **Streaming chat** — SSE-powered real-time answers inside the widget
- **Source links** — Clickable page references displayed below bot answers
- **Branding toggle** — "Powered by PageCortex" shown/hidden based on plan

### Customer Dashboard
- **Overview** — Active bots, total conversations, resolution rate, plan badge, message usage bar with color alerts
- **Bot Management** — Full CRUD: create via wizard, customize appearance/AI model, preview live, copy embed code, delete
- **Bot Creation Wizard** — Step-by-step: connect source → crawl & index → customize → deploy
- **Bot Settings** — Name, colors, widget position, AI model selection, system prompt, branding toggle
- **Chat Preview** — Standalone `/chat-preview/[id]` page to test the bot before embedding
- **Conversations** — Full conversation viewer with message threading and visitor tracking
- **Analytics** — 7-day conversation trends, message counts, top pages
- **Websites** — Manage crawled sites, view page/word counts, re-crawl
- **Knowledge Base** — Browse all indexed documents grouped by source
- **Billing** — Subscription management, plan comparison cards, usage tracking, add-on message packs, trial status
- **Settings** — Profile, notifications, account management, danger zone

### Plan Enforcement (enforced server-side)
- **Bot count limits** — Checked at creation time and shown as live warnings on the bots page
- **Message limits** — Atomic SQL RPC (`check_and_increment_message`) prevents any race-condition bypass
- **Model enforcement** — Free/Starter plans cannot call GPT-4.1 regardless of client-side selection
- **Upgrade nudges** — Inline banners when at or over limit with direct billing CTAs
- **Over-limit state** — Detects downgraded users with more bots than allowed; warns and shows upgrade path

### Admin Panel (`/admin`)
- **Overview Dashboard** — Total users, bots, conversations, websites, MRR, subscriber count, recent signups
- **User Management** — All users with plan, usage bars, search, signup dates
- **Bot Overview** — All bots across the platform with owner info and status
- **Revenue Analytics** — MRR, plan breakdown, conversion rate

### Payment & Billing (Dodo Payments)
- **5-Tier Subscription Plans** — Free, Starter, Growth, Scale, Enterprise
- **7-Day Free Trial** — Starter and Growth plans
- **Message Add-on Packs** — +1K ($4), +5K ($18), +10K ($30) one-time purchases
- **Webhook Handling** — Auto plan upgrades, downgrades, renewals, cancellations, chargebacks
- **Per-user test/mock mode** — Developer can bypass real payment flow for testing

---

## UI Routes

Every user-facing route and what it does:

### Public

| Route | Description |
|---|---|
| `/` | Landing page: Hero, Features, How it Works, Pricing, Testimonials, FAQ, CTA |
| `/login` | Supabase email/password login |
| `/signup` | Account registration |
| `/blog` | Blog index (placeholder for content marketing) |
| `/docs` | Quick-start guide and integration documentation |
| `/api-reference` | API endpoint reference for developers |
| `/changelog` | Product updates history |
| `/about` | Company/product mission |
| `/careers` | Open roles |
| `/contact` | Contact form / support |
| `/chat-preview/[id]` | Standalone live chat preview for a specific bot (shareable link) |

### Dashboard (Authenticated)

| Route | Description |
|---|---|
| `/dashboard` | Overview: KPI cards (active bots, conversations, resolution rate, plan), message usage bar, recent bots list, quick actions |
| `/dashboard/bots` | All bots list: status badges, conversation counts, plan limit indicator, over-limit warning, create/manage/preview/copy-embed actions |
| `/dashboard/bots/new` | Bot creation wizard (4 steps): connect source → crawl & index → customize (name, color, position, model, welcome message) → deploy with embed code |
| `/dashboard/bots/[id]` | Bot management: overview stats, settings (identity, appearance, AI model, system prompt), embed code, knowledge base, re-crawl |
| `/dashboard/conversations` | Conversation viewer: list by bot, full message threads, visitor tracking |
| `/dashboard/analytics` | Analytics: 7-day charts, message trends, top pages, resolution rate |
| `/dashboard/websites` | Website manager: all crawled sites, page/word counts, re-crawl button, add new |
| `/dashboard/knowledge` | Knowledge base: all indexed documents grouped by website, with preview |
| `/dashboard/billing` | Billing: current plan card with usage bars, plan comparison table, upgrade/downgrade, message add-on packs, trial countdown |
| `/dashboard/settings` | Settings: display name, email, notification preferences, danger zone (delete account) |

### Admin (Protected by `ADMIN_EMAILS`)

| Route | Description |
|---|---|
| `/admin` | Admin overview: total users, bots, conversations, MRR, recent signups, subscriber count |
| `/admin/users` | All users: plan, message usage bars, signup date, search |
| `/admin/bots` | All bots on the platform: name, owner, conversations, status |
| `/admin/revenue` | Revenue: MRR, plan distribution, conversion rate |

---

## API Routes

All under `/api/`. Server-side only (Next.js Route Handlers).

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/chat` | Public (bot key) | RAG chat with SSE streaming. Enforces rate limit, message usage, model plan restrictions. |
| `POST` | `/api/crawl` | User session | Crawls a website URL, extracts text, generates embeddings, stores in pgvector. |
| `GET` | `/api/bots` | User session | List user's bots. Single-bot fetch by `?id=` (used by chat-preview). |
| `POST` | `/api/bots` | User session | Create new bot. Enforces bot count plan limit server-side. |
| `PATCH` | `/api/bots` | User session | Update bot settings (name, model, colors, system prompt, etc.). |
| `DELETE` | `/api/bots` | User session | Delete a bot and its associated data. |
| `GET` | `/api/dashboard/stats` | User session | Dashboard KPIs: active bots, conversations, resolution rate, usage, recent bots. |
| `GET` | `/api/admin/stats` | Admin only | Platform-wide stats: users, bots, MRR, plan breakdown, recent signups. |
| `POST` | `/api/billing/checkout` | User session | Creates Dodo Payments checkout session for plan upgrade or add-on purchase. |
| `POST` | `/api/billing/webhook` | Dodo (HMAC) | Handles subscription events: activated, renewed, cancelled, downgraded, payment failed. |

---

## Pricing & Justification

### Plan Comparison

| Plan | Monthly Price | Chatbots | Messages/mo | Pages Indexed | AI Tier | Trial |
|---|---|---|---|---|---|---|
| **Free** | $0 | 1 | 50 | 100 | Fast AI | None |
| **Starter** | $29/mo | 1 | 4,000 | 1,000 | Smart AI routing | 7 days |
| **Growth** | **$69/mo** ⭐ | 3 | 10,000 | 10,000 | Advanced AI + Smart routing | 7 days |
| **Scale** | $199/mo | 10 | 40,000 | 50,000 | Premium AI priority | None |
| **Enterprise** | Custom | Unlimited | Unlimited | Unlimited | All AI tiers | None |

**Overage:** +$4 per 1,000 messages. Add-on packs: +1K ($4) · +5K ($18) · +10K ($30).

---

### Why Each Plan Is Priced This Way

#### Free — $0

**Purpose:** Acquisition and product-led growth.

The free plan is sized to let a solo developer or small site owner prove value — one bot on a small site (100 pages) with 50 messages/month. That is enough to validate the product, see answers working, and want to upgrade. It is **not** sized to run a real production chatbot for a business (50 messages is roughly 1–2 conversations/day).

Cost to us per free user: ~$0.002 in embeddings for a 100-page crawl + near-zero for 50 messages/month at GPT-4.1 Mini rates. Sustainable.

---

#### Starter — $29/mo

**Purpose:** First paying tier for small businesses.

4,000 messages covers a typical SMB support flow (~130 conversations/month). 1,000 indexed pages handles full company websites, help docs, and a product catalog. Remove-branding is included to let the business look professional.

**Our cost at 4,000 messages (GPT-4.1 Mini only):**
- ~4,000 × 800 input tokens = 3.2M tokens × $0.40/M = **~$1.28/mo in API costs**
- 1,000 pages × ~500 tokens/page = 500K tokens × $0.02/M = **~$0.01 in embedding costs**
- Infra + Supabase + Vercel share: ~$2/mo amortized
- **Total cost: ~$3.30/mo → margin: ~$25.70 (~88%)**

$29 is a well-established SaaS micro-tier price point. Cheaper than a single hour of human support staff.

---

#### Growth — $69/mo (Most Popular)

**Purpose:** Growing companies with real support volume.

10,000 messages/month covers a mid-size SaaS or e-commerce business with active users. 10,000 indexed pages handles complex documentation, multi-product sites, and wikis. Access to Advanced AI + Smart routing means harder technical questions get better answers.

3 chatbots lets teams create separate bots per product, language, or department.

**Our cost at 10,000 messages (mixed model routing):**
- ~70% mini, ~30% GPT-4.1: (7K × 800t × $0.40/M) + (3K × 2,000t × $2.00/M) = **$2.24 + $12 = ~$14.24/mo**
- Embeddings + infra: ~$3/mo
- **Total cost: ~$17/mo → margin: ~$52/mo (~75%)**

Growth is the "sweet spot" tier — high enough ASP to be meaningful revenue, low enough to be an easy upsell from Starter.

---

#### Scale — $199/mo

**Purpose:** High-volume operations, agencies, or multi-product companies.

40,000 messages/month and 10 bots covers a customer-facing company with serious traffic. 50,000 indexed pages supports full enterprise documentation. White-label option and team seats (5) make it viable for agencies billing this to clients.

**Our cost at 40,000 messages:**
- Mixed routing: ~$55/mo in API costs
- Infra + Supabase storage at scale: ~$8/mo
- **Total cost: ~$63/mo → margin: ~$136/mo (~68%)**

The lower margin % vs Starter is offset by the much higher absolute dollar margin per account.

---

#### Enterprise — Custom pricing

**Purpose:** Large orgs with compliance, SLA, and volume needs.

Pricing negotiated per deal. SSO/SAML, dedicated support, SLA, custom model fine-tuning, and on-premise options justify $500–$2,000+/mo contracts. Not self-serve — requires sales contact.

---

### Overage Pricing: $4 per 1,000 messages

At full GPT-4.1 Mini load, 1,000 messages costs us ~$0.32 in API + ~$0.20 infra = **~$0.52 cost**. We charge $4 → ~**88% margin on overages**, which is intentional: overages should motivate upgrade to the next plan tier.

The add-on pack pricing offers a volume discount (5K pack = $3.60/K, 10K = $3.00/K) to reward loyalty while keeping margins healthy.

---

## Limitations

Be aware of what PageCortex does **not** currently support:

- **JavaScript-heavy websites (SPAs)** — The crawler uses Cheerio (static HTML only). Sites built entirely with client-side React, Vue, or Angular may return minimal content. Puppeteer/Playwright support is planned for Phase 2.
- **Large crawls take time** — Crawling 10,000+ pages can take several minutes. There is no background job UI; the crawl request is long-running.
- **Scanned PDFs** — Text extraction works for copy-paste PDFs. Scanned/image-only PDFs require OCR, which is not yet implemented.
- **No real-time re-indexing** — If your website content changes, you must manually trigger a re-crawl from the dashboard. Automatic scheduled re-crawling is not yet live.
- **English-only dashboard UI** — Bots can respond in any language the underlying model supports, but the dashboard is English-only.
- **Dodo Payments sandbox for developer account** — The developer account runs in payment sandbox mode. All other user accounts use live payments.

---

## Roadmap

Planned in rough priority order:

### Phase 2 — Near-term
- [ ] **Puppeteer/Playwright crawler** — Full support for JS-rendered SPAs and dynamic content
- [ ] **Scheduled re-crawl** — Auto-refresh knowledge base on a configurable interval
- [ ] **Notion connector** — Import pages directly from Notion workspaces
- [ ] **Google Drive connector** — Index Google Docs, Sheets, and Slides

### Phase 3 — Growth
- [ ] **Team accounts** — Invite teammates to share a dashboard and manage bots together
- [ ] **Custom domain widget** — Serve `widget.js` from your own domain for complete white-labeling
- [ ] **Conversation handoff** — Escalate to a human agent when bot confidence is low
- [ ] **GitBook / Zendesk / Confluence connectors**

### Phase 4 — Scale
- [ ] **Fine-tuning support** — Upload conversation history to fine-tune a custom model
- [ ] **SSO / SAML** — Enterprise identity provider integration
- [ ] **REST API ingestion** — Push content via API instead of crawling
- [ ] **On-premise / self-hosted option**

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 |
| **Auth & Database** | Supabase (PostgreSQL 17 + Auth + pgvector) |
| **HTML Parsing** | Cheerio 1.x (fast, lightweight — no headless browser) |
| **AI / LLM** | OpenAI GPT-4.1, GPT-4.1 Mini, text-embedding-3-small |
| **Vector Store** | pgvector (Supabase) + hybrid search RPC |
| **Payments** | Dodo Payments |
| **Deployment** | Vercel (Edge + Serverless) |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page (9 sections)
│   ├── layout.tsx                  # Root layout + SEO metadata
│   ├── globals.css                 # Design system tokens (CSS variables)
│   ├── robots.ts                   # SEO robots.txt
│   ├── sitemap.ts                  # Dynamic sitemap.xml
│   ├── login/                      # Supabase email auth login
│   ├── signup/                     # Account registration
│   ├── blog/                       # Blog index
│   ├── docs/                       # Integration guide + quick-start
│   ├── api-reference/              # REST API documentation
│   ├── changelog/                  # Product changelog
│   ├── about/                      # About page
│   ├── careers/                    # Careers page
│   ├── contact/                    # Contact page
│   ├── chat-preview/[id]/          # Standalone bot preview
│   ├── dashboard/
│   │   ├── layout.tsx              # Dashboard shell: sidebar, usage bar, auth guard
│   │   ├── page.tsx                # Overview: KPIs, subscription card, bots list, quick actions
│   │   ├── bots/
│   │   │   ├── page.tsx            # Bots list with plan limit banners + upgrade CTAs
│   │   │   ├── new/page.tsx        # 4-step bot creation wizard
│   │   │   └── [id]/page.tsx       # Per-bot: overview, settings, embed, knowledge
│   │   ├── conversations/page.tsx  # Conversation viewer
│   │   ├── analytics/page.tsx      # 7-day analytics charts
│   │   ├── websites/page.tsx       # Website manager
│   │   ├── knowledge/page.tsx      # Knowledge base browser
│   │   ├── billing/page.tsx        # Plans, usage, add-ons, trial status
│   │   └── settings/page.tsx       # Profile + danger zone
│   ├── admin/
│   │   ├── layout.tsx              # Admin shell (ADMIN_EMAILS guard)
│   │   ├── page.tsx                # Platform KPIs + recent signups
│   │   ├── users/page.tsx          # User management
│   │   ├── bots/page.tsx           # All bots overview
│   │   └── revenue/page.tsx        # MRR + plan analytics
│   └── api/
│       ├── chat/route.ts           # RAG pipeline: rate limit → bot fetch → plan model enforce → usage RPC → RAG → SSE stream
│       ├── crawl/route.ts          # Web crawler: fetch → Cheerio extract → chunk → embed → upsert pgvector
│       ├── bots/route.ts           # Bot CRUD (GET/POST with limit enforcement/PATCH/DELETE)
│       ├── billing/
│       │   ├── checkout/route.ts   # Dodo checkout session creation
│       │   └── webhook/route.ts    # Dodo webhook: subscription.activated / renewed / cancelled etc.
│       ├── dashboard/stats/        # Dashboard KPI aggregation
│       └── admin/stats/            # Admin platform-wide stats (service role)
├── components/
│   └── landing/                    # 9 landing page sections (Navbar, Hero, Features, HowItWorks,
│                                   #   Pricing, Testimonials, FAQ, CTA, Footer)
└── lib/
    ├── auth.tsx                    # Supabase auth context + useAuth hook
    ├── supabase.ts                 # Client + admin (service role) Supabase instances
    ├── openai.ts                   # Lazy-initialized OpenAI client
    ├── dodo.ts                     # Dodo Payments SDK + PLANS config (limits, features, product IDs)
    ├── rag.ts                      # Full RAG pipeline: query rewrite → hybrid search → rerank → generate
    ├── cache.ts                    # LRU + DB response cache
    ├── chunker.ts                  # Semantic text chunker with configurable overlap
    ├── rate-limit.ts               # Token-bucket rate limiter (chat / crawl / API tiers)
    ├── analytics.ts                # Event tracking
    ├── alerts.ts                   # Error alerting (OpenAI errors, etc.)
    └── logger.ts                   # Structured logging

public/
└── widget.js                       # Embeddable chat widget (vanilla JS, lazy-loaded, ~15KB)

supabase/
└── schema.sql                      # Full DB schema: 15 tables, indexes, RLS, hybrid search RPC,
                                    # check_and_increment_message() atomic function
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account (with pgvector extension)
- OpenAI API key
- Dodo Payments account

### 1. Clone & Install

```bash
git clone https://github.com/yogi-68/PageCortex.git
cd PageCortex
npm install
```

### 2. Environment Variables

Create `.env.local` (local dev) and add every variable to **Vercel → Project → Settings → Environment Variables** (production).

> `NEXT_PUBLIC_*` vars are baked into the JS bundle **at build time** — after adding or changing them in Vercel you must **redeploy** the project.

#### Core (required)

| Variable | Where to get it | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL | Client + server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon/public key | Client + server |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → service_role key | **Server only** — never expose to client |
| `OPENAI_API_KEY` | platform.openai.com → API Keys | Server only |
| `NEXT_PUBLIC_APP_URL` | Your Vercel deployment URL, e.g. `https://pagecortex.vercel.app` | No trailing slash |
| `ADMIN_EMAILS` | Your own email(s), comma-separated | `you@example.com,other@example.com` |

#### Dodo Payments

| Variable | Where to get it | Notes |
|---|---|---|
| `DODO_PAYMENTS_API_KEY` | Dodo dashboard → API Keys | Server only |
| `DODO_PAYMENTS_WEBHOOK_KEY` | Dodo dashboard → Webhooks → signing secret | Server only |
| `DODO_PRODUCT_STARTER` | Dodo → Products → Starter product ID | e.g. `prod_xxx` |
| `DODO_PRODUCT_GROWTH` | Dodo → Products → Growth product ID | |
| `DODO_PRODUCT_SCALE` | Dodo → Products → Scale product ID | |
| `DODO_ADDON_1000` | Dodo → Products → 1K Messages add-on ID | Optional |
| `DODO_ADDON_5000` | Dodo → Products → 5K Messages add-on ID | Optional |
| `DODO_ADDON_10000` | Dodo → Products → 10K Messages add-on ID | Optional |

#### Admin separation (optional)

| Variable | Value | Notes |
|---|---|---|
| `ADMIN_HOSTNAME` | e.g. `admin.pagecortex.io` | Restricts `/admin/*` to a separate hostname |

---

### 3. Database Setup (Supabase)

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to **Database → Extensions**, enable: `vector`, `pg_trgm`, `uuid-ossp`
3. Go to **SQL Editor → New Query**, paste the contents of `supabase/schema.sql` and click **Run**
4. Copy from **Project Settings → API**: Project URL, anon key, service_role key

> The schema creates 15 tables, all indexes, RLS policies, hybrid search RPC, and the atomic `check_and_increment_message()` function with advisory locking.

---

### 4. OpenAI Setup

1. Create an account at [platform.openai.com](https://platform.openai.com)
2. Add billing — GPT-4.1 requires **Usage Tier 1** (a $5 payment unlocks this)
3. Go to **API Keys → Create new secret key** — copy immediately
4. Paste as `OPENAI_API_KEY`

> Models used: `gpt-4.1-mini` (~$0.40/M input), `gpt-4.1` (~$2.00/M input), `text-embedding-3-small` (~$0.02/M tokens)

---

### 5. Dodo Payments Setup

Create subscription products in Dodo → **Products**:

| Product | Type | Price |
|---|---|---|
| PageCortex Starter | Subscription | $29/mo |
| PageCortex Growth | Subscription | $69/mo |
| PageCortex Scale | Subscription | $199/mo |
| +1,000 Messages | One-time | $4 |
| +5,000 Messages | One-time | $18 |
| +10,000 Messages | One-time | $30 |

Webhook URL: `https://yourdomain.com/api/billing/webhook` → subscribe to all subscription and payment events.

---

### 6. Run

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Admin Panel

Access `/admin` — protected by `ADMIN_EMAILS` environment variable. No separate login needed — the guard checks if the authenticated user's email is in the list.

---

## Deployment (Vercel)

1. Push to GitHub
2. Import in [Vercel](https://vercel.com)
3. Add all environment variables in Vercel dashboard
4. Deploy

Post-deployment:
- Set `NEXT_PUBLIC_APP_URL` to your production domain
- Register webhook in Dodo: `https://yourdomain.com/api/billing/webhook`

---

## OpenAI Cost Reference

| Model | Input | Output |
|---|---|---|
| GPT-4.1 | $2.00 / 1M tokens | $8.00 / 1M tokens |
| GPT-4.1 Mini | $0.40 / 1M tokens | $1.60 / 1M tokens |
| text-embedding-3-small | $0.02 / 1M tokens | — |

---

## Support

| Channel | Details |
|---|---|
| **Email** | support@pagecortex.com |
| **Bug reports** | [GitHub Issues](https://github.com/yogi-68/PageCortex/issues) |
| **Live site** | [pagecortex.vercel.app](https://pagecortex.vercel.app) |

For billing questions, use the in-app chat widget or email the above address. Enterprise inquiries can be sent to the same address with "Enterprise" in the subject line.

---

## License

MIT — see [LICENSE](LICENSE)
