# PageCortex — Monorepo

> AI-powered customer support chatbot platform built on Next.js, Supabase, and Dodo Payments.

---

## Repository Structure

```
PageCortex/          ← Main customer-facing app (Next.js 16, TypeScript, Tailwind)
admin/           ← Internal admin dashboard (Next.js 16, React 19)
.gitignore       ← Root ignore file (covers both apps)
README.md        ← This file
```

---

## Apps

### `PageCortex/` — Main App

| Layer | Stack |
|---|---|
| Framework | Next.js 16 (App Router) |
| Auth | Supabase Auth |
| Database | Supabase (PostgreSQL + pgvector) |
| Payments | Dodo Payments |
| AI | OpenAI GPT-4.1 / GPT-4.1 Mini |
| Styling | Tailwind CSS v4 |

### `admin/` — Admin Dashboard

Internal-only dashboard for managing users, bots, revenue, and subscriptions. Protected by `ADMIN_EMAILS` env var. Not deployed publicly.

---

## Getting Started

```bash
# 1. Install dependencies for main app
cd PageCortex
npm install

# 2. Copy env file
cp .env.local.example .env.local
# Fill in all values (see Environment Variables section below)

# 3. Run migrations in Supabase SQL editor
# Execute: PageCortex/supabase/schema.sql
# Then run any files in: PageCortex/supabase/migrations/

# 4. Start dev server
npm run dev
# App runs at http://localhost:3000

# Admin dashboard
cd ../admin
npm install
npm run dev
# Admin runs at http://localhost:3001
```

---

## Environment Variables

### `PageCortex/.env.local`

```env
# ── Supabase ──────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# ── Database ──────────────────────────────────────────────
DATABASE_URL=          # Transaction pooler (Prisma / pgbouncer)
DIRECT_URL=            # Session pooler (migrations)

# ── App ───────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=https://pagecortex.vercel.app
NEXT_PUBLIC_APP_NAME=PageCortex
ADMIN_EMAILS=your@email.com

# ── OpenAI ────────────────────────────────────────────────
OPENAI_API_KEY=

# ── Dodo Payments ─────────────────────────────────────────
DODO_PAYMENTS_API_KEY=
DODO_PAYMENTS_WEBHOOK_KEY=

# Monthly subscription products
DODO_PRODUCT_STARTER=pdt_0Na603bGfLhkLh74hALiC
DODO_PRODUCT_GROWTH=pdt_0Na60FlO1CCXGUkDQPFlX
DODO_PRODUCT_SCALE=pdt_0Na60Qj7xuBj9KMnRauOX

# Yearly subscription products (full year billed upfront)
DODO_PRODUCT_STARTER_YEARLY=pdt_0NcdpWE11ME0j4xvvjxI0
DODO_PRODUCT_GROWTH_YEARLY=pdt_0NcdrZxNv5UTjBh81PpFB
DODO_PRODUCT_SCALE_YEARLY=pdt_0Ncdrjceib44YqAgeMbIz

# Message add-on one-time products
DODO_ADDON_1000=adn_0NcdiB9TzRuxsKamxD1VP
DODO_ADDON_5000=adn_0NcdiWzj1iuK9KCW5alip
DODO_ADDON_10000=adn_0Ncdj6z7Ly8Wf7YjP3puN
```

---

## Dodo Payments — Products Reference

### Monthly Subscription Plans

| Product Name | Product ID | Price | Billing |
|---|---|---|---|
| Starter Plan | `pdt_0Na603bGfLhkLh74hALiC` | $29.00/mo | Monthly |
| Growth Plan | `pdt_0Na60FlO1CCXGUkDQPFlX` | $69.00/mo | Monthly |
| Scale Plan | `pdt_0Na60Qj7xuBj9KMnRauOX` | $199.00/mo | Monthly |

### Yearly Subscription Plans (Full Year Upfront)

| Product Name | Product ID | Created (UTC) | Price | Savings vs Monthly |
|---|---|---|---|---|
| STARTER_YEARLY | `pdt_0NcdpWE11ME0j4xvvjxI0` | 13 Apr 2026, 10:43 pm | $276.00/yr | Save $72/yr |
| GROWTH_YEARLY | `pdt_0NcdrZxNv5UTjBh81PpFB` | 13 Apr 2026, 10:54 pm | $660.00/yr | Save $168/yr |
| SCALE_YEARLY | `pdt_0Ncdrjceib44YqAgeMbIz` | 13 Apr 2026, 10:55 pm | $1,908.00/yr | Save $480/yr |

> **Important:** All Dodo products must have `Trial Period = 0 days`. Trial logic is controlled entirely in the backend (see Trial System below).

### Message Add-on Products (One-Time)

| Product Name | Product ID | Price | Messages |
|---|---|---|---|
| +1,000 Messages | `adn_0NcdiB9TzRuxsKamxD1VP` | $4.00 | +1,000 |
| +5,000 Messages | `adn_0NcdiWzj1iuK9KCW5alip` | $18.00 | +5,000 |
| +10,000 Messages | `adn_0Ncdj6z7Ly8Wf7YjP3puN` | $30.00 | +10,000 |

---

## Pricing Plans

### Monthly vs Annual

| Plan | Monthly | Annual (per mo equiv) | Annual Total | Savings |
|---|---|---|---|---|
| Free | $0 | — | — | — |
| Starter | $29/mo | $23/mo | **$276/yr upfront** | $72/yr |
| Growth | $69/mo | $55/mo | **$660/yr upfront** | $168/yr |
| Scale | $199/mo | $159/mo | **$1,908/yr upfront** | $480/yr |

Annual plans are separate Dodo products (not a discount code). The full amount is charged immediately at checkout.

---

## Trial System

### Design Goals

1. **Conversion** — Give new users a risk-free way to experience paid features
2. **Revenue protection** — Prevent users from abusing trials by re-signing up repeatedly
3. **Simplicity** — One 7-day trial per user account, tracked in the database

### Trial Eligibility by Plan

| Plan | Trial | Reason |
|---|---|---|
| Free | None | Free tier is the trial experience |
| Starter | 7 days (first time only) | Helps conversion for price-sensitive users |
| Growth | 7 days (first time only) | Popular plan; trial aids conversion |
| Scale | None | High price = serious buyers; abuse risk outweighs benefit |
| Annual (any) | None | Annual pricing already includes ~20% savings |

### How It Works

#### Database Column

```sql
-- profiles table
has_used_trial BOOLEAN NOT NULL DEFAULT false
```

This starts as `false` for every new user. It flips to `true` the moment their first paid subscription becomes active (via Dodo webhook).

#### Checkout Flow

```
User clicks "Subscribe to Starter"
        ↓
Backend reads profile.has_used_trial
        ↓
has_used_trial = false  →  trialDays = 7   (free trial)
has_used_trial = true   →  trialDays = 0   (no trial)
        ↓
POST to Dodo: { product_id, trial_period_days: trialDays }
        ↓
User lands on Dodo-hosted checkout page
```

#### After Trial Activates

```
Dodo fires: subscription.active webhook
        ↓
Backend sets: has_used_trial = true
        ↓
User is now on paid plan; future subscriptions → no trial
```

#### Re-subscribe Scenario (Trial Abuse Prevention)

```
User cancels → plan goes to 'free' (via subscription.cancelled webhook)
        ↓
User tries to subscribe again
        ↓
has_used_trial = true  →  trialDays = 0
        ↓
No trial — they pay from day 1
```

### Important: Dodo Product Must Have Trial = 0

If you set a trial period inside the Dodo product dashboard, every user gets it regardless of your backend logic. That creates a bypass:

```
User creates new Supabase account → has_used_trial = false → gets trial
+ User uses Dodo "change payment method" or re-subscribes → Dodo gives trial again ❌
```

**Fix:** Set all Dodo subscription products to `Trial Period = 0 days`. Backend sends `trial_period_days` dynamically per checkout.

---

## Webhook Events

Webhooks are received at `/api/billing/webhook`. Signatures are verified using the Svix standard (HMAC-SHA256).

| Event | Action |
|---|---|
| `subscription.active` | Upgrade profile plan, set limits, `has_used_trial = true` |
| `subscription.plan_changed` | Update plan and limits |
| `subscription.renewed` | Reset monthly message count |
| `subscription.cancelled` | Downgrade to free, clear subscription ID |
| `subscription.expired` | Same as cancelled |
| `subscription.on_hold` | Log warning |
| `subscription.failed` | Log warning |
| `payment.succeeded` | Credit addon message balance |

All events are idempotent via the `webhook_events` table (duplicate event IDs are ignored).

---

## Database Schema

Key tables in `PageCortex/supabase/schema.sql`:

| Table | Purpose |
|---|---|
| `profiles` | User accounts, plan, limits, trial status |
| `bots` | AI chatbot configurations |
| `data_sources` | Knowledge base sources (website, file, Notion, etc.) |
| `websites` | Crawled website sources |
| `documents` | Chunked content with pgvector embeddings |
| `conversations` | Chat sessions |
| `messages` | Individual chat messages |
| `webhook_events` | Idempotency log for Dodo webhooks |

### Running Migrations

```bash
# In Supabase SQL editor, run in order:
1. PageCortex/supabase/schema.sql                              ← Full schema
2. PageCortex/supabase/migrations/20260414_add_has_used_trial.sql  ← Trial column
```

---

## Deployment

### Vercel (Main App)

1. Connect `PageCortex/` as the Vercel project root
2. Set all environment variables from `PageCortex/.env.local`
3. Set `NEXT_PUBLIC_APP_URL` to your production domain
4. Configure Dodo webhook to point at: `https://yourdomain.com/api/billing/webhook`

### Dodo Webhook Setup

In Dodo Dashboard → Webhooks → Create endpoint:
- URL: `https://yourdomain.com/api/billing/webhook`
- Events: `subscription.*`, `payment.succeeded`
- Copy the webhook secret → set as `DODO_PAYMENTS_WEBHOOK_KEY`

---

## Development Notes

### Widget Embed

The embeddable chat widget lives at `PageCortex/public/widget.js`. It's loaded by end-customers on their own sites:

```html
<script src="https://pagecortex.vercel.app/widget.js" data-bot-id="YOUR_BOT_ID"></script>
```

### Add a New Plan

1. Create the product in Dodo Dashboard
2. Add product ID to `.env.local` and Vercel env vars
3. Add plan config to `PageCortex/src/lib/dodo.ts` PLANS object
4. Add to `PricingSection.tsx` plans array

### Add a New Add-on Pack

1. Create one-time product in Dodo Dashboard
2. Add product ID to `.env.local` as `DODO_ADDON_XXXX`
3. Add to `MESSAGE_ADDONS` in `dodo.ts`
4. Update `PricingSection.tsx` addons array
# PageCortex — AI Chatbot Platform for Websites

**PageCortex** is a production-ready SaaS platform that lets businesses create custom AI chatbots trained on their website content. Built with an advanced RAG (Retrieval-Augmented Generation) pipeline, GPT-4.1, and pgvector hybrid search, it delivers accurate, citation-backed answers with streaming responses — in real-time.

**Live:** [pagecortex.vercel.app](https://pagecortex.vercel.app)

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
git clone https://github.com/yogi-68/PageCortex.git
cd PageCortex
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
| `DODO_PRODUCT_ENTERPRISE` | Dodo → Products → Enterprise product ID | Optional |
| `DODO_ADDON_1000` | Dodo → Products → 1K Messages add-on ID | Optional: enables add-on packs |
| `DODO_ADDON_5000` | Dodo → Products → 5K Messages add-on ID | Optional |
| `DODO_ADDON_10000` | Dodo → Products → 10K Messages add-on ID | Optional |

#### Admin separation (optional)

| Variable | Value | Notes |
|---|---|---|
| `ADMIN_HOSTNAME` | e.g. `admin.pagecortex.io` | Restricts `/admin/*` to that hostname only — makes admin invisible on the main URL |

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

> PageCortex uses two models:
> - `gpt-4.1-mini` — default (fast, cheap, ~$0.40/M input tokens)
> - `gpt-4.1` — complex queries via smart routing (~$2.00/M input tokens)
> - `text-embedding-3-small` — embeddings (~$0.02/M tokens)

---

### 5. Dodo Payments Setup

#### Subscription products (plans)

In Dodo dashboard → **Products → Create Product** × 3:

| Product | Type | Price |
|---|---|---|
| PageCortex Starter | Subscription | $29 / month |
| PageCortex Growth | Subscription | $69 / month |
| PageCortex Scale | Subscription | $199 / month |

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
ADMIN_EMAILS=you@example.com,admin@pagecortex.com
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
