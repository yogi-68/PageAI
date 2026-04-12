# PageAI — AI Chatbot Platform for Websites

**PageAI** is a production-ready SaaS platform that lets businesses create custom AI chatbots trained on their website content. Built with an advanced RAG (Retrieval-Augmented Generation) pipeline, GPT-4.1, and pgvector hybrid search, it delivers accurate, citation-backed answers with streaming responses — in real-time.

**Live:** [pageai-tau.vercel.app](https://pageai-tau.vercel.app)

---

## Features

### AI Chat Engine
- **Advanced RAG Pipeline** — Semantic chunking, hybrid search (vector + full-text), query rewriting, multi-hop reasoning
- **GPT-4.1 & GPT-4.1 Mini** — Smart model routing based on query complexity
- **Streaming SSE Responses** — Real-time token streaming for instant UX
- **Source Citations** — Every answer backed by relevant page references with confidence scores
- **Intelligent Caching** — LRU + database-level response cache for repeat queries
- **Rate Limiting** — Token-bucket rate limiting per user tier (chat, crawl, API)

### Data Ingestion
- **Website Crawler** — Automatic crawl, extract, and semantic chunking of website content
- **Multi-Source Connectors** — Website, file upload, sitemap, Notion, Google Drive, GitBook, Zendesk, Confluence
- **pgvector Embeddings** — OpenAI `text-embedding-3-small` stored in Supabase pgvector for hybrid search
- **Embeddable Widget** — Drop-in `<script>` tag to add the chatbot to any website

### Customer Dashboard
- **Overview** — Active bots, conversations, plan status, message usage with progress bar
- **Bot Management** — Create, customize, preview, deploy, manage chatbots with embed code
- **Conversations** — Full conversation viewer with search, message threading, visitor tracking
- **Analytics** — 7-day conversation trends, message counts, top pages
- **Websites** — Manage crawled sites, re-crawl, view page counts
- **Knowledge Base** — Browse all indexed documents grouped by website
- **Billing** — Subscription management, plan comparison, usage tracking, trial status
- **Settings** — Profile, notifications, account management

### Admin Panel (`/admin`)
- **Overview Dashboard** — Total users, bots, conversations, websites, MRR, subscriber count, recent signups
- **User Management** — All users with plan, usage bars, search, signup dates
- **Bot Overview** — All bots across the platform with owner info and status
- **Revenue Analytics** — MRR, plan breakdown with progress bars, conversion rate

### Payment & Billing
- **Dodo Payments** — Subscription gateway with automatic webhook handling
- **5-Tier Plans** — Free, Starter ($29/mo), Growth ($69/mo), Scale ($199/mo), Enterprise (custom)
- **7-Day Free Trial** — All paid plans include a 7-day free trial
- **Overage Billing** — $4 per 1,000 extra messages after plan limit
- **Webhook Integration** — Auto plan upgrades, downgrades, cancellations, chargebacks

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 |
| **Auth & Database** | Supabase (PostgreSQL + Auth + pgvector) |
| **AI / LLM** | OpenAI GPT-4.1, GPT-4.1 Mini, text-embedding-3-small |
| **Vector Store** | pgvector (Supabase) + hybrid search RPC |
| **Payments** | Dodo Payments |
| **Deployment** | Vercel |

---

## Pricing & Rate Limits

| Plan | Price | Chatbots | Messages/mo | Pages Indexed | AI Model | Rate Limit |
|---|---|---|---|---|---|---|
| **Free** | $0 | 1 | 50 | 100 | GPT-4.1 Mini | 30 req/min |
| **Starter** | $29/mo | 1 | 4,000 | 1,000 | GPT-4.1 Mini + Auto | 30 req/min |
| **Growth** | $69/mo | 3 | 10,000 | 10,000 | GPT-4.1 + Smart Routing | 30 req/min |
| **Scale** | $199/mo | 10 | 40,000 | 50,000 | GPT-4.1 Priority | 30 req/min |
| **Enterprise** | Custom | Unlimited | Unlimited | Unlimited | All Models | Custom |

**Overage:** $4 per 1,000 messages beyond plan limit.

### API Rate Limits

| Endpoint | Limit |
|---|---|
| Chat (`/api/chat`) | 30 requests/min |
| Crawl (`/api/crawl`) | 5 requests/min |
| General API | 60 requests/min |

All paid plans include a **7-day free trial**.

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout + SEO
│   ├── globals.css               # Design system tokens
│   ├── login/ & signup/          # Auth pages
│   ├── blog/                     # Blog
│   ├── dashboard/
│   │   ├── layout.tsx            # Dashboard shell + sidebar + usage bar
│   │   ├── page.tsx              # Overview with KPIs + subscription status
│   │   ├── bots/                 # Bot management + creation wizard
│   │   ├── conversations/        # Conversation viewer
│   │   ├── analytics/            # 7-day analytics + charts
│   │   ├── websites/             # Website management
│   │   ├── knowledge/            # Knowledge base browser
│   │   ├── billing/              # Subscription, usage, plan cards
│   │   └── settings/             # Profile + notifications + danger zone
│   ├── admin/
│   │   ├── layout.tsx            # Admin shell (env-based auth)
│   │   ├── page.tsx              # Admin overview + KPIs
│   │   ├── users/                # User management
│   │   ├── bots/                 # All bots overview
│   │   └── revenue/              # Revenue analytics
│   └── api/
│       ├── chat/route.ts         # RAG chat endpoint (streaming SSE)
│       ├── crawl/route.ts        # Website crawler
│       ├── bots/route.ts         # Bot CRUD
│       ├── billing/
│       │   ├── checkout/route.ts # Dodo checkout sessions
│       │   └── webhook/route.ts  # Dodo webhook handler (7 events)
│       ├── dashboard/stats/      # Dashboard statistics
│       └── admin/stats/          # Admin statistics
├── components/landing/           # 9 landing page sections
└── lib/
    ├── auth.tsx                  # Supabase auth context
    ├── supabase.ts               # Supabase clients + DB types
    ├── openai.ts                 # Lazy-init OpenAI client
    ├── dodo.ts                   # Dodo Payments + plan config
    ├── rag.ts                    # Advanced RAG pipeline
    ├── cache.ts                  # LRU + DB response cache
    ├── chunker.ts                # Semantic text chunker
    ├── rate-limit.ts             # Token-bucket rate limiter
    └── connectors/               # Data source connectors
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
git clone https://github.com/yogi-68/PageAI.git
cd PageAI
npm install
```

### 2. Environment Variables

Create `.env.local` with the following:

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key (server-side only) |
| `OPENAI_API_KEY` | ✅ | OpenAI API key ([platform.openai.com](https://platform.openai.com/api-keys)) |
| `DODO_PAYMENTS_API_KEY` | ✅ | Dodo Payments API key |
| `DODO_PAYMENTS_WEBHOOK_KEY` | ✅ | Dodo webhook signing secret |
| `DODO_PRODUCT_STARTER` | ✅ | Dodo Product ID for Starter ($29/mo) |
| `DODO_PRODUCT_GROWTH` | ✅ | Dodo Product ID for Growth ($69/mo) |
| `DODO_PRODUCT_SCALE` | ✅ | Dodo Product ID for Scale ($199/mo) |
| `DODO_PRODUCT_ENTERPRISE` | — | Dodo Product ID for Enterprise (optional) |
| `ADMIN_EMAILS` | ✅ | Comma-separated admin emails (e.g. `you@example.com`) |
| `NEXT_PUBLIC_APP_URL` | ✅ | Your app URL (e.g. `https://pageai-tau.vercel.app`) |

> **Vercel note:** `NEXT_PUBLIC_*` variables are embedded into the client bundle **at build time**. You must set them in Vercel → Settings → Environment Variables and **redeploy** for them to take effect in the browser. Missing these variables will cause a `supabaseUrl is required` error.

### 3. Database Setup

1. Enable the **pgvector** extension in your Supabase project
2. Run `supabase/schema.sql` in the Supabase SQL Editor — creates 13 tables, indexes, RPC functions, RLS policies, and:
   - `check_and_increment_message()` — atomic usage enforcement (prevents race conditions)
   - `webhook_events` table — idempotent webhook processing (prevents duplicate plan updates)

### 4. Dodo Payments Setup

1. Create 3 subscription products in Dodo:
   - **Starter** — $29/month
   - **Growth** — $69/month
   - **Scale** — $199/month
2. Copy Product IDs to `.env.local`
3. Register webhook URL: `https://yourdomain.com/api/billing/webhook`
4. Copy webhook secret to `DODO_PAYMENTS_WEBHOOK_KEY`

### 5. Run

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Admin Panel

Access `/admin` — protected by `ADMIN_EMAILS` environment variable.

```
ADMIN_EMAILS=you@example.com,admin@pageai.com
```

---

## Deployment (Vercel)

1. Push to GitHub
2. Import in [Vercel](https://vercel.com)
3. Add all environment variables in Vercel dashboard
4. Deploy

**Post-deployment:**
- Set `NEXT_PUBLIC_APP_URL` to your production domain
- Register webhook URL in Dodo: `https://yourdomain.com/api/billing/webhook`

---

## OpenAI Cost Reference

| Model | Input | Output |
|---|---|---|
| GPT-4.1 | $2.00 / 1M tokens | $8.00 / 1M tokens |
| GPT-4.1 Mini | $0.40 / 1M tokens | $1.60 / 1M tokens |
| text-embedding-3-small | $0.02 / 1M tokens | — |

---

## License

MIT — see [LICENSE](LICENSE)
