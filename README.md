# 🤖 PageAI — AI Chatbot SaaS for Websites

**PageAI** is a full-stack SaaS platform that lets anyone create custom AI chatbots trained on their website content. Powered by RAG (Retrieval-Augmented Generation), GPT-4, and Pinecone vector search, it delivers accurate, citation-backed answers to visitor questions — in real-time.

---

## ✨ Features

### Core Platform
- **Website Crawling** — Automatically crawl, extract, and chunk website content
- **Vector Embeddings** — Generate and store OpenAI embeddings in Pinecone for semantic search
- **RAG-Powered Chat** — Retrieve relevant content chunks and generate accurate AI answers with source citations
- **Multi-Model Support** — GPT-3.5 Turbo, GPT-4 Turbo, and Claude 3.5 Sonnet
- **Embeddable Widget** — Drop-in `<script>` tag to add the chatbot to any website

### Dashboard
- **Bot Management** — Create, customize, preview, and deploy chatbots
- **Conversations** — Review all chatbot conversations with messages, sources, and ratings
- **Analytics** — Track response times, satisfaction rates, daily volumes, and top pages
- **Websites** — Manage crawled sites, re-crawl, view page/word counts
- **Knowledge Base** — Browse all indexed content grouped by website
- **Billing** — Subscription management powered by **Dodo Payments**
- **Settings** — Profile, notifications, and account management

### Admin Panel (`/admin`)
- **Overview Dashboard** — Total users, bots, conversations, revenue metrics
- **User Management** — View all users, plans, usage, and signup dates
- **Bot Overview** — All bots across the platform with owner info and stats
- **Revenue Analytics** — MRR, plan breakdown, conversion rates

### Payment & Billing
- **Dodo Payments** — Secure payment gateway for subscriptions
- **4-Tier Plans** — Starter (Free), Growth ($39/mo), Professional ($129/mo), Enterprise ($399/mo)
- **Webhook Integration** — Automatic plan upgrades/downgrades via Dodo webhooks
- **Usage Tracking** — Monthly question counts with automatic limits

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS 4 |
| **Auth & Database** | Supabase (PostgreSQL + Auth) |
| **AI / LLM** | OpenAI (GPT-4, GPT-3.5, Embeddings) |
| **Vector Store** | Pinecone |
| **Payments** | Dodo Payments |
| **Email** | Resend |
| **Icons** | Lucide React |
| **Deployment** | Vercel |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── layout.tsx               # Root layout + SEO
│   ├── globals.css              # Design system
│   ├── login/page.tsx           # Login page
│   ├── signup/page.tsx          # Signup page
│   ├── blog/page.tsx            # Blog listing
│   ├── dashboard/
│   │   ├── layout.tsx           # Dashboard shell + sidebar
│   │   ├── page.tsx             # Dashboard overview
│   │   ├── bots/page.tsx        # Bot management
│   │   ├── bots/new/page.tsx    # Bot creation wizard
│   │   ├── conversations/       # Conversation viewer
│   │   ├── analytics/           # Analytics dashboard
│   │   ├── websites/            # Website management
│   │   ├── knowledge/           # Knowledge base browser
│   │   ├── billing/             # Subscription & billing
│   │   └── settings/            # User settings
│   ├── admin/
│   │   ├── layout.tsx           # Admin panel shell
│   │   ├── page.tsx             # Admin overview
│   │   ├── users/               # User management
│   │   ├── bots/                # All bots overview
│   │   └── revenue/             # Revenue analytics
│   └── api/
│       ├── chat/route.ts        # RAG chat endpoint
│       ├── crawl/route.ts       # Website crawler
│       ├── bots/route.ts        # Bot CRUD
│       ├── billing/
│       │   ├── checkout/route.ts  # Dodo checkout sessions
│       │   └── webhook/route.ts   # Dodo webhook handler
│       ├── dashboard/stats/     # Dashboard statistics
│       └── admin/stats/         # Admin statistics
├── components/landing/          # Landing page sections
└── lib/
    ├── auth.tsx                 # Supabase auth context
    ├── supabase.ts              # Supabase client + types
    ├── openai.ts                # OpenAI client
    ├── pinecone.ts              # Pinecone client
    └── dodo.ts                  # Dodo Payments client + plans
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- OpenAI API key
- Pinecone account
- Dodo Payments account

### 1. Clone & Install

```bash
git clone https://github.com/your-username/pageai.git
cd pageai
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
```

**Required variables:**

| Variable | Source |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API |
| `OPENAI_API_KEY` | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| `PINECONE_API_KEY` | [app.pinecone.io](https://app.pinecone.io) |
| `PINECONE_INDEX` | Your Pinecone index name (e.g. `pageai-embeddings`) |
| `DODO_PAYMENTS_API_KEY` | [app.dodopayments.com](https://app.dodopayments.com) |
| `DODO_PAYMENTS_WEBHOOK_KEY` | Dodo Dashboard → Webhooks |
| `DODO_PRODUCT_GROWTH` | Dodo Dashboard → Products (Growth $39/mo) |
| `DODO_PRODUCT_PRO` | Dodo Dashboard → Products (Professional $129/mo) |
| `DODO_PRODUCT_ENTERPRISE` | Dodo Dashboard → Products (Enterprise $399/mo) |
| `ADMIN_EMAILS` | Comma-separated admin emails |
| `NEXT_PUBLIC_APP_URL` | Your app URL (e.g. `http://localhost:3000`) |

### 3. Database Setup

Run the schema SQL in your Supabase SQL Editor:

```bash
# Copy contents of supabase/schema.sql into Supabase SQL Editor and execute
```

> **Note:** After setting up, update the `stripe_*` columns in `profiles` to `dodo_customer_id` and `dodo_subscription_id`:
> ```sql
> ALTER TABLE public.profiles RENAME COLUMN stripe_customer_id TO dodo_customer_id;
> ALTER TABLE public.profiles RENAME COLUMN stripe_subscription_id TO dodo_subscription_id;
> ```

### 4. Dodo Payments Setup

1. Create 3 subscription products in your Dodo Payments dashboard:
   - **Growth** — $39/month
   - **Professional** — $129/month  
   - **Enterprise** — $399/month
2. Copy each Product ID into your `.env.local`
3. Register your webhook URL: `https://yourdomain.com/api/billing/webhook`
4. Copy the webhook secret into `DODO_PAYMENTS_WEBHOOK_KEY`

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 💰 Pricing Plans

| Plan | Price | Websites | Q&A/month | Pages | AI Model |
|---|---|---|---|---|---|
| **Starter** | Free | 1 | 1,000 | 10 | GPT-3.5 |
| **Growth** | $39/mo | 3 | 10,000 | 50 | GPT-4 |
| **Professional** | $129/mo | 10 | 50,000 | 200 | GPT-4 + Claude |
| **Enterprise** | $399/mo | Unlimited | 200K+ | 1,000+ | All Models |

---

## 🔒 Admin Panel

Access the admin panel at `/admin`. Protected by the `ADMIN_EMAILS` environment variable.

Set `ADMIN_EMAILS=your@email.com` (comma-separated for multiple admins).

**Admin features:**
- Platform-wide metrics (users, bots, conversations, revenue)
- User management with plan and usage visibility
- Bot overview across all users
- Revenue analytics with MRR and plan breakdown

---

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import in [Vercel](https://vercel.com)
3. Set all environment variables in Vercel dashboard
4. Deploy!

### Post-Deployment
- Register webhook URL in Dodo Payments: `https://yourdomain.com/api/billing/webhook`
- Update `NEXT_PUBLIC_APP_URL` to your production domain

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
