# PageCortex

**AI-powered sales assistant for websites** — train on your content, convert visitors to customers.

PageCortex crawls your website, indexes your content, and deploys an intelligent AI assistant that answers buyer questions, overcomes objections, and drives conversions — all automatically.

---

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

### Required Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_key

# App
NEXT_PUBLIC_APP_URL=https://www.pagecortex.com

# API Integrations (required for tool-calling feature)
# Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_SECRET=your_64_char_hex_key

# Optional: Groq for faster/cheaper inference on simple queries
GROQ_API_KEY=gsk_...
```

See `.env.example` for the full variable list including billing.

---

## Architecture

```
User Query
    │
    ▼
┌─────────────┐    ┌──────────────────┐
│ Intent Match │───▶│ Predefined Reply │
└──────┬──────┘    └──────────────────┘
       │ no match
       ▼
┌─────────────┐    ┌──────────────────┐
│  RAG Search  │───▶│ Hybrid Search    │
│              │    │ (Vector + BM25)  │
└──────┬──────┘    └──────────────────┘
       │
       ▼
┌─────────────┐    ┌──────────────────┐
│  Re-Rank    │───▶│ Confidence Score │
└──────┬──────┘    └──────────────────┘
       │
       ▼
┌─────────────┐    ┌──────────────────┐
│  LLM Reply  │───▶│ Safety Layer     │
└──────┬──────┘    └──────────────────┘
       │
       ▼
   Response
```

### Core Principles

| Layer | Purpose |
|-------|---------|
| **Intent System** | Deterministic answers for known questions (pricing, features, etc.) |
| **RAG Pipeline** | Contextual knowledge from crawled website content |
| **LLM** | Conversational intelligence — warm, helpful, concise |
| **Safety Layer** | Output filtering, data sanitization, confidence-based fallback |
| **Tool APIs** | Live data from external systems (planned) |

---

## Features

### Deployed ✅

- **Advanced RAG Pipeline** — Hybrid search (vector + BM25), re-ranking, confidence scoring
- **Real-Time API Tool Calling** — Live order/shipment/product/shipping queries via Shopify, WooCommerce, or custom REST
- **Intent Router** — Classifies queries first (keyword matching + optional LLM) to pick RAG, tool call, or both
- **Secure Credential Storage** — AES-256-GCM encrypted API keys; backend-only; never exposed to frontend
- **API Integration Dashboard** — Add/edit/test integrations; endpoint whitelist; tool execution logs
- **Smart Model Routing** — Auto-selects fast or advanced AI based on query complexity
- **Embeddable Widget** — One script tag, works on any website (WordPress, Shopify, Wix, React, etc.)
- **AI Testing Playground** — Chat with your bot, inspect confidence scores, latency, RAG sources
- **Streaming Responses** — Progressive token rendering with live-data loading indicators
- **Unanswered Question Monitoring** — Dashboard alerts for queries the bot couldn't handle
- **Conversion-Focused Design** — Built for pre-sales, not generic support
- **Source Citations** — Every answer links back to the page it came from
- **Brand Customization** — Colors, welcome messages, bot name, positioning
- **Multi-language Support** — 95+ languages, responds in the visitor's language
- **Usage Controls** — Plan-based message limits, model restrictions, overage handling
- **Legal Pages** — Privacy policy, terms of service

### Dashboard Sections

| Section | Pages | Description |
|---------|-------|-------------|
| **Home** | Overview | Key metrics, recent activity, quick actions |
| **Train** | Websites, Knowledge, Bots | Configure content sources and bot settings |
| **Integrations** | API Integrations | Connect Shopify, WooCommerce, custom REST APIs |
| **Test & Deploy** | Playground | Test bot responses with debug inspector |
| **Analyze** | Analytics, Unanswered | Conversion metrics, unanswered questions |
| **Settings** | Billing, Settings | Account, plan management, preferences |

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | Next.js 16 (App Router) |
| Database | Supabase (PostgreSQL + pgvector) |
| AI | OpenAI API (smart model routing) |
| Auth | Supabase Auth (OAuth + Email) |
| Hosting | Vercel |
| Styling | Vanilla CSS + Tailwind-free custom design system |
| Search | Hybrid (pgvector + BM25 via Supabase RPC) |
| Encryption | Node.js `crypto` AES-256-GCM (credential storage) |

> See [docs/AI_MODELS.md](docs/AI_MODELS.md) for AI model alternatives, cost analysis, and profitability recommendations.

---

## Pricing Plans

| Feature | Free | Starter ($29/mo) | Growth ($69/mo) | Scale ($199/mo) |
|---------|------|-------------------|-----------------|-----------------|
| Messages/month | 50 | 1,000 | 5,000 | Unlimited |
| Chatbots | 1 | 3 | 10 | Unlimited |
| Indexed pages | 100 | 500 | 2,000 | Unlimited |
| AI Model | Fast AI | Fast AI + Smart Routing | All models | All models |
| Branding removal | ❌ | ✅ | ✅ | ✅ |
| Priority support | ❌ | ❌ | ✅ | ✅ |

---

## RAG Pipeline

### How It Works

1. **Crawl** — Spider your website, extract text from every page
2. **Chunk** — Split content into semantic chunks with metadata
3. **Embed** — Generate vector embeddings (OpenAI text-embedding-3-small)
4. **Store** — Save embeddings in Supabase pgvector
5. **Search** — Hybrid search (70% vector + 30% BM25 keyword) on each query
6. **Re-rank** — Score and re-rank results by relevance, heading match, chunk quality
7. **Generate** — Feed top context to LLM with system prompt for grounded answers
8. **Monitor** — Track confidence, detect unanswered questions, log for improvement

### Confidence Scoring

- **70%+** (Green) — Strong match, high-quality answer
- **40-70%** (Yellow) — Partial match, answer attempted with available context
- **Below 40%** (Red) — Weak match, answer may be incomplete
- **0% / No chunks** — Fallback triggered, no relevant data found

> Confidence is only visible in the dashboard (Playground + Unanswered). End users never see confidence scores.

### Smart Model Routing

When set to "Smart Routing", the system auto-selects the model:

- **Fast AI** — For simple, direct questions (< 200 chars, < 30 words, high confidence)
- **Advanced AI** — For complex queries, comparisons, analysis, or low-confidence situations

---

## Widget Integration

### Basic Embed

```html
<script
  src="https://www.pagecortex.com/widget.js"
  data-bot-id="YOUR_BOT_ID"
  async
></script>
```

### Custom Configuration

```html
<script
  src="https://www.pagecortex.com/widget.js"
  data-bot-id="YOUR_BOT_ID"
  data-color="#6366f1"
  data-position="right"
  data-name="Sales Assistant"
  data-welcome="Hi! How can I help you today?"
  data-suggested-questions='["What is your pricing?","How does it work?"]'
  async
></script>
```

### Supported Platforms

- WordPress (Theme Editor or plugin)
- Shopify (theme.liquid)
- Wix (Custom Code)
- Webflow (Custom Code)
- Squarespace (Code Injection)
- React / Next.js / Vue / Nuxt
- Google Tag Manager
- Any HTML website

---

## API Reference

### POST /api/chat

Send a message to the chatbot.

```json
{
  "query": "What are your pricing plans?",
  "botId": "bot_uuid",
  "stream": true
}
```

**Response (non-streaming):**

```json
{
  "success": true,
  "answer": "We offer plans starting from...",
  "sources": [{ "url": "...", "title": "..." }],
  "confidence": 0.85,
  "model": "gpt-4.1-mini",
  "responseTimeMs": 2340,
  "chunksRetrieved": 5,
  "unanswered": false,
  "cached": false
}
```

**Response (streaming):** Server-Sent Events (SSE)

```
data: {"type":"token","content":"We "}
data: {"type":"token","content":"offer "}
data: {"type":"done","confidence":0.85,"model":"gpt-4.1-mini","sources":[...]}
```

### POST /api/crawl

Crawl a website and index its content.

```json
{
  "url": "https://example.com",
  "websiteId": "ws_uuid",
  "userId": "user_uuid",
  "maxPages": 100,
  "crawlMode": "auto"
}
```

---

## Roadmap

### Phase 2: Intent System & Monitoring
- Predefined intent management with aliases
- Manual answer creation from unanswered questions
- Enhanced low-confidence monitoring with filtering
- Response feedback loop (correct/incorrect marking)

### Phase 3: Knowledge Base & Analytics
- PDF/DOCX upload and indexing
- Manual FAQ creation
- Conversion-focused analytics dashboard
- Common questions tracking
- Retrieval quality preview

### Phase 4: Enterprise Features (In Progress)
- **Human Handoff** — Escalation triggers, email notifications, live chat takeover
- **AI Safety** — PII detection, response moderation, output sanitization
- **Deployment Versioning** — Staging vs production, rollback, A/B testing
- **Conversation Memory** — Rolling multi-turn chat history

### Tool & API System (Implemented ✅)

Secure, read-only API integrations for live data:

| Integration | Tools Available |
|-------------|----------------|
| Shopify | `getOrderStatus`, `trackShipment`, `getProductAvailability`, `getShippingEstimate` |
| WooCommerce | `getOrderStatus`, `trackShipment`, `getProductAvailability`, `getShippingEstimate` |
| Custom REST | Same tools, configurable endpoint mapping |

Architecture:
- All API calls routed through backend — credentials never reach the browser
- AES-256-GCM encrypted credential storage (`ENCRYPTION_SECRET`)
- Endpoint whitelist — AI can only call pre-approved path prefixes
- Response sanitizer strips tokens, passwords, internal IDs, admin fields
- 5s timeout on all tool calls; failures degrade gracefully to RAG-only
- Tool execution logged with latency, status, and input params
- Intent router decides RAG / tool / both per query using keyword patterns first (zero LLM cost)

### AI Models

See [docs/AI_MODELS.md](docs/AI_MODELS.md) for full analysis. Summary:

| Provider | Model | Use Case | Cost/1M tokens |
|----------|-------|----------|----------------|
| OpenAI | `gpt-4.1-mini` | Default fast queries | ~$0.15 in / $0.60 out |
| OpenAI | `gpt-4.1` | Complex/advanced queries | ~$2 in / $8 out |
| Groq | `llama-3.3-70b` | **Recommended for Free/Starter** — 10x faster, 5x cheaper | ~$0.59 in / $0.79 out |
| Anthropic | `claude-3-5-haiku` | Best tool-calling accuracy | ~$0.80 in / $4 out |
| Google | `gemini-2.0-flash` | Cheapest large-context option | ~$0.075 in / $0.30 out |

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/              # Chat endpoint (streaming + non-streaming)
│   │   ├── integrations/      # Client API integrations CRUD + test + logs
│   │   ├── crawl/             # Website crawler
│   │   ├── bots/              # Bot CRUD
│   │   └── dashboard/         # Dashboard APIs (stats, unanswered)
│   ├── dashboard/
│   │   ├── integrations/      # API Integrations dashboard
│   │   ├── playground/        # AI Testing Playground
│   │   ├── conversations/     # Unanswered questions
│   │   ├── analytics/         # Analytics dashboard
│   │   ├── knowledge/         # Knowledge base
│   │   ├── bots/              # Bot management
│   │   ├── websites/          # Website management
│   │   ├── billing/           # Plan & billing
│   │   └── settings/          # Account settings
│   └── (landing pages)
├── components/
│   └── landing/               # Marketing page components
├── lib/
│   ├── rag.ts                 # RAG + tool-calling pipeline
│   ├── intent-router.ts       # Query classifier (rag/tool/both)
│   ├── tools.ts               # Tool definitions + executor
│   ├── api-integrations.ts    # Credential manager + API proxy
│   ├── encryption.ts          # AES-256-GCM credential encryption
│   ├── openai.ts              # OpenAI API wrapper
│   ├── supabase.ts            # Database client
│   ├── auth.ts                # Auth context
│   ├── analytics.ts           # Event tracking
│   └── rate-limit.ts          # Rate limiting
├── public/
│   ├── widget.js              # Embeddable chat widget (v2.2+)
│   └── logo.png               # Brand assets
├── supabase/
│   ├── schema.sql             # Full DB schema
│   └── migrations/            # Incremental migrations
└── docs/
    └── AI_MODELS.md           # AI model analysis & recommendations
```

---

## Deployment

### Vercel

1. Push to GitHub
2. Import in Vercel
3. Set environment variables
4. Deploy

### Environment Setup

- Set `NEXT_PUBLIC_APP_URL` to `https://www.pagecortex.com`
- Configure Supabase Auth redirects to include `https://www.pagecortex.com/auth/callback`
- Ensure `OPENAI_API_KEY` has sufficient credits

---

## License

Proprietary — All rights reserved.

## Contact

- Website: [pagecortex.com](https://www.pagecortex.com)
- Email: yogeshwar0402@gmail.com
