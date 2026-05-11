# PageCortex — AI Model Guide

This document covers the current AI implementation, model alternatives, cost analysis,
and enhancement recommendations for PageCortex.

---

## Current Implementation

### Models in Use

| Role | Model | Notes |
|------|-------|-------|
| Fast chat (default) | `gpt-4.1-mini` | Free + Starter plans; simple queries on Growth+ |
| Advanced chat | `gpt-4.1` | Growth/Scale/Enterprise; complex queries via Smart Routing |
| Embeddings | `text-embedding-3-small` | 1536-dim vectors, stored in pgvector |
| Intent classification | `gpt-4.1-mini` | Fallback only — keyword matching runs first |
| Follow-up suggestions | `gpt-4.1-mini` | Non-blocking, fires after stream ends |

### RAG Architecture

```
User Query
    │
    ├─▶ Intent Router (keywords + optional LLM)
    │        │
    │        ├─▶ RAG only       → Hybrid Search → Re-rank → LLM
    │        ├─▶ Tool call      → API Proxy → Sanitize → LLM
    │        └─▶ Both           → Parallel [RAG + Tool] → Merge → LLM
    │
    └─▶ SSE Stream → Widget
```

**Key libraries:** `openai` v6, Supabase pgvector, Node.js `crypto` (AES-256-GCM)

### Latency Budget (target ≤ 3s)

| Step | Typical Time | Notes |
|------|-------------|-------|
| Intent classification (keywords) | ~0ms | No LLM, pure regex |
| Intent classification (LLM) | ~200ms | Only for ambiguous queries |
| Embedding generation | ~100–200ms | Cached for repeated queries |
| Hybrid search (pgvector + BM25) | ~80–150ms | Supabase RPC |
| Tool API call | ~200–2000ms | Client's external API, 5s timeout |
| LLM streaming (first token) | ~400–900ms | gpt-4.1-mini fast path |
| **Total (RAG only)** | **~700ms–1.3s** | |
| **Total (tool + RAG)** | **~1.2s–3s** | |

---

## Model Alternatives

### Option 1: Groq (Recommended for Cost Reduction)

**Models:** `llama-3.3-70b-versatile`, `llama-3.1-8b-instant`

| Metric | OpenAI gpt-4.1-mini | Groq Llama-3.3-70B |
|--------|--------------------|--------------------|
| Input cost (per 1M tokens) | ~$0.15 | ~$0.59 |
| Output cost (per 1M tokens) | ~$0.60 | ~$0.79 |
| Time to first token | ~400–900ms | **~80–200ms** |
| Context window | 1M tokens | 128K tokens |
| Tool calling | Yes | Yes |

**When to use:** Simple factual queries, order status lookups, short FAQ answers.
Estimated infrastructure saving: **30–50% on chat costs**.

**Implementation:** Add `GROQ_API_KEY` env var and route `gpt-4.1-mini` queries to Groq
for `auto` model tier. Already plumbed in `.env.example`.

```env
GROQ_API_KEY=gsk_...
```

```typescript
// Example routing in selectModel()
if (requestedModel === 'auto' && !isComplex && confidence > 0.6) {
  return process.env.GROQ_API_KEY ? 'groq:llama-3.3-70b-versatile' : 'gpt-4.1-mini';
}
```

---

### Option 2: Anthropic Claude 3.5 Haiku

**Model:** `claude-3-5-haiku-20241022`

| Metric | OpenAI gpt-4.1-mini | Claude 3.5 Haiku |
|--------|--------------------|--------------------|
| Input cost (per 1M tokens) | ~$0.15 | ~$0.80 |
| Output cost (per 1M tokens) | ~$0.60 | ~$4.00 |
| Instruction following | Strong | **Very strong** |
| Tool calling accuracy | Good | **Excellent** |
| JSON extraction | Good | Excellent |

**When to use:** Tool-calling flows where structured extraction from API responses
matters most (e.g. parsing complex Shopify order JSON). Claude follows structured
output instructions more reliably.

**Verdict:** Slightly more expensive but worth considering for the tool-calling path.

---

### Option 3: Google Gemini 2.0 Flash

**Model:** `gemini-2.0-flash-exp`

| Metric | OpenAI gpt-4.1-mini | Gemini 2.0 Flash |
|--------|--------------------|--------------------|
| Input cost (per 1M tokens) | ~$0.15 | ~$0.075 (2x cheaper) |
| Output cost (per 1M tokens) | ~$0.60 | ~$0.30 (2x cheaper) |
| Context window | 1M tokens | **1M tokens** |
| Multimodal | No | Yes (images, audio) |

**When to use:** If you want the cheapest OpenAI-quality alternative. Particularly
good for long-document RAG where large context windows matter.

**Verdict:** Best cost-per-token for high-volume deployments. API is in GA as of 2026.

---

### Option 4: Vercel AI SDK (Recommended Architecture Change)

The [Vercel AI SDK](https://sdk.vercel.ai/) (`ai` package) provides a unified
interface over all providers above. Benefits:

- Switch providers without rewriting RAG code
- Built-in streaming abstractions (replaces manual SSE)
- A/B test models by user plan or bot config
- Built-in tool calling with schema validation
- `streamText`, `generateText`, `generateObject` — drop-in for current calls

**Migration effort:** Medium (~2 days). Replace `getOpenAI().chat.completions.create`
calls in `rag.ts` with `streamText({ model: openai('gpt-4.1-mini'), ... })`.

**Recommendation:** Migrate to Vercel AI SDK when adding Groq support, since it
handles multi-provider routing natively.

---

## Profitability Analysis

### Cost Per Chat Message (Current Setup)

Assuming avg 500 input tokens + 300 output tokens:

| Plan | Model | Cost/message | 1000 messages/mo |
|------|-------|-------------|------------------|
| Free | gpt-4.1-mini | ~$0.00026 | ~$0.26 |
| Starter | gpt-4.1-mini | ~$0.00026 | ~$0.26 |
| Growth | auto (mix) | ~$0.00052 | ~$2.60 |
| Scale | gpt-4.1 | ~$0.0022 | ~$22 |

**With Groq for free/starter fast queries:**
- Free/Starter cost drops ~60% → improves margin on free plan significantly

### Recommended Model Strategy for Profit

```
Free plan       → Groq llama-3.1-8b-instant (cheapest, fast, acceptable quality)
Starter plan    → Groq llama-3.3-70b (better quality, still cheap)
Growth plan     → OpenAI gpt-4.1-mini + gpt-4.1 (premium, but user pays $69/mo)
Scale plan      → OpenAI gpt-4.1 (full quality, user pays $199/mo)
Enterprise      → Customer's own OpenAI API key (bring-your-own-key option)
```

---

## Enhancement Roadmap

### Priority 1: Performance
- [ ] **Vercel AI SDK migration** — unified streaming, easier multi-provider
- [ ] **Groq routing** for free/starter plans — 10x faster, 5x cheaper
- [ ] **Response caching at CDN level** — cache common queries at edge

### Priority 2: Features
- [ ] **Conversation memory** — rolling 5-turn history injected into context
- [ ] **Human handoff** — email escalation when confidence < 30% or user requests
- [ ] **Proactive widget** — pop up after 30s time-on-page with contextual message
- [ ] **Lead capture** — collect email before answering certain question types

### Priority 3: Enterprise
- [ ] **Bring-your-own-key** — Enterprise customers use their own OpenAI key
- [ ] **A/B testing** — different system prompts / models per visitor segment
- [ ] **Webhook push** — order status updates pushed to visitors vs polled
- [ ] **Multi-language bot personas** — different system prompts per detected language

### Priority 4: Safety
- [ ] **PII detection** — scan responses for email/phone/card patterns before sending
- [ ] **Content moderation** — OpenAI moderation API pre-check on queries
- [ ] **Response versioning** — lock bot to specific prompt version for production

---

## Tool-Calling System (Implemented)

See `src/lib/tools.ts`, `src/lib/intent-router.ts`, `src/lib/api-integrations.ts`.

### Supported Tools

| Tool | Trigger Pattern | Integration |
|------|----------------|-------------|
| `getOrderStatus` | "where is my order", "order #123" | Shopify/WC/Custom |
| `trackShipment` | "track my package", "shipment update" | Shopify/WC/Custom |
| `getProductAvailability` | "in stock", "is [product] available" | Shopify/WC/Custom |
| `getShippingEstimate` | "how long does shipping take", "ship to NYC" | Shopify/WC/Custom |

### Security Properties

- All API calls are backend-only — credentials never reach the browser
- AES-256-GCM encryption for stored credentials (`ENCRYPTION_SECRET`)
- Endpoint whitelist — AI can only call pre-approved paths
- Response sanitizer strips tokens, passwords, internal IDs, admin fields
- 5-second timeout on all tool calls to prevent slow API blocking
- Read-only mode — only GET requests, never POST/PUT/DELETE
- Tool execution logged to `tool_execution_logs` with latency + status

---

## Embedding Model

**Current:** `text-embedding-3-small` (OpenAI, 1536 dimensions)
- Cost: ~$0.02 per 1M tokens — negligible
- Quality: Very good for semantic search
- **Alternative:** `text-embedding-3-large` (3072-dim) — better recall, ~5x cost

For most PageCortex deployments, `text-embedding-3-small` is the right tradeoff.
Only consider `large` for Scale/Enterprise plans where retrieval accuracy is critical.
