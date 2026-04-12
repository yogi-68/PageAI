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

Create `.env.local` (local dev) and add every variable to **Vercel → Project → Settings → Environment Variables** (production).

> `NEXT_PUBLIC_*` vars are baked into the JS bundle **at build time** — after adding or changing them in Vercel you must **redeploy** the project.

#### Core (required for every environment)

| Variable | Where to get it | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL | Client + server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon/public key | Client + server |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → service_role key | **Server only** — never expose to client |
| `OPENAI_API_KEY` | platform.openai.com → API Keys | Server only |
| `NEXT_PUBLIC_APP_URL` | Your Vercel deployment URL, e.g. `https://pageai-tau.vercel.app` | No trailing slash |
| `ADMIN_EMAILS` | Your own email(s), comma-separated | `you@example.com,other@example.com` |

#### Dodo Payments

| Variable | Where to get it | Notes |
|---|---|---|
| `DODO_PAYMENTS_API_KEY` | Dodo dashboard → API Keys | Server only |
| `DODO_PAYMENTS_WEBHOOK_KEY` | Dodo dashboard → Webhooks → signing secret | Server only |
| `DODO_PRODUCT_STARTER` | Dodo → Products → Starter product ID | e.g. `prod_xxx` |
| `DODO_PRODUCT_GROWTH` | Dodo → Products → Growth product ID | |
| `DODO_PRODUCT_SCALE` | Dodo → Products → Scale product ID | |
| `DODO_PRODUCT_ENTERPRISE` | Dodo → Products → Enterprise product ID | Optional |
| `DODO_ADDON_1000` | Dodo → Products → 1K Messages add-on ID | Optional: enables add-on packs |
| `DODO_ADDON_5000` | Dodo → Products → 5K Messages add-on ID | Optional |
| `DODO_ADDON_10000` | Dodo → Products → 10K Messages add-on ID | Optional |

#### Admin separation (optional)

| Variable | Value | Notes |
|---|---|---|
| `ADMIN_HOSTNAME` | e.g. `admin.pageai.io` | Restricts `/admin/*` to that hostname only — makes admin invisible on the main URL |

---

### 3. Database Setup (Supabase)

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. Go to **Database → Extensions**, search for and enable:
   - `vector` (pgvector — for embeddings)
   - `pg_trgm` (trigram search — for full-text)
   - `uuid-ossp` (UUIDs)
   
   *(The schema SQL also enables them automatically with `CREATE EXTENSION IF NOT EXISTS`.)*

3. Go to **SQL Editor → New Query**, paste the entire contents of `supabase/schema.sql` and click **Run**
4. Copy from **Project Settings → API**:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

> The schema creates 15 tables, all indexes, RLS policies, hybrid search RPC, and the atomic `check_and_increment_message()` function with advisory locking.

---

### 4. OpenAI Setup

1. Create an account at [platform.openai.com](https://platform.openai.com)
2. Add billing — GPT-4.1 requires at least **Usage Tier 1** (a $5 payment unlocks this)
3. Go to **API Keys → Create new secret key** — copy the value immediately (shown once)
4. Paste it as `OPENAI_API_KEY`

> PageAI uses two models:
> - `gpt-4.1-mini` — default (fast, cheap, ~$0.40/M input tokens)
> - `gpt-4.1` — complex queries via smart routing (~$2.00/M input tokens)
> - `text-embedding-3-small` — embeddings (~$0.02/M tokens)

---

### 5. Dodo Payments Setup

#### Subscription products (plans)

In Dodo dashboard → **Products → Create Product** × 3:

| Product | Type | Price |
|---|---|---|
| PageAI Starter | Subscription | $29 / month |
| PageAI Growth | Subscription | $69 / month |
| PageAI Scale | Subscription | $199 / month |

Copy each **Product ID** to `DODO_PRODUCT_STARTER`, `DODO_PRODUCT_GROWTH`, `DODO_PRODUCT_SCALE`.

#### Add-on products (message packs) — optional but recommended

Create 3 more one-time payment products:

| Product | Type | Price |
|---|---|---|
| +1,000 Messages | One-time | $4 |
| +5,000 Messages | One-time | $18 |
| +10,000 Messages | One-time | $30 |

Copy Product IDs to `DODO_ADDON_1000`, `DODO_ADDON_5000`, `DODO_ADDON_10000`.

#### Webhook

1. In Dodo → **Webhooks → Add Endpoint**:
   - URL: `https://yourdomain.com/api/billing/webhook`
   - Subscribe to **all** subscription and payment events
2. Copy the **signing secret** → `DODO_PAYMENTS_WEBHOOK_KEY`

---

### 6. Run

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
