-- ============================================
-- PageAI Database Schema (Supabase / PostgreSQL)
-- Production-Ready AI Chatbot Platform
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";      -- pgvector for embeddings
CREATE EXTENSION IF NOT EXISTS "pg_trgm";     -- trigram for full-text / fuzzy search

-- ================================
-- Users & Authentication
-- ================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'growth', 'scale', 'enterprise')),
  dodo_customer_id TEXT UNIQUE,
  dodo_subscription_id TEXT,
  monthly_message_count INTEGER NOT NULL DEFAULT 0,
  monthly_message_limit INTEGER NOT NULL DEFAULT 50,
  total_pages_indexed INTEGER NOT NULL DEFAULT 0,
  max_pages_indexed INTEGER NOT NULL DEFAULT 100,
  max_chatbots INTEGER NOT NULL DEFAULT 1,
  overage_enabled BOOLEAN NOT NULL DEFAULT false,
  addon_message_balance INTEGER NOT NULL DEFAULT 0,
  company TEXT,
  api_access BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================
-- Data Sources (multi-type ingestion)
-- ================================
CREATE TABLE public.data_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('website', 'google_drive', 'notion', 'gitbook', 'zendesk', 'confluence', 'file_upload', 'api', 'sitemap')),
  name TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'syncing', 'indexed', 'error', 'paused')),
  last_synced_at TIMESTAMPTZ,
  sync_frequency TEXT DEFAULT 'weekly' CHECK (sync_frequency IN ('realtime', 'daily', 'weekly', 'monthly', 'manual')),
  documents_count INTEGER DEFAULT 0,
  total_chunks INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================
-- Websites (crawled web sources)
-- ================================
CREATE TABLE public.websites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  data_source_id UUID REFERENCES public.data_sources(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'crawling', 'indexed', 'error')),
  pages_count INTEGER DEFAULT 0,
  total_words INTEGER DEFAULT 0,
  last_crawled_at TIMESTAMPTZ,
  crawl_frequency TEXT DEFAULT 'weekly' CHECK (crawl_frequency IN ('daily', 'weekly', 'monthly', 'manual')),
  allowed_paths TEXT[] DEFAULT '{}',
  blocked_paths TEXT[] DEFAULT '{}',
  max_depth INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================
-- Bots (AI Assistants)
-- ================================
CREATE TABLE public.bots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  website_id UUID REFERENCES public.websites(id) ON DELETE SET NULL,
  name TEXT NOT NULL DEFAULT 'AI Assistant',
  system_prompt TEXT,
  welcome_message TEXT DEFAULT 'Hi! How can I help you today?',
  model TEXT NOT NULL DEFAULT 'gpt-4.1-mini' CHECK (model IN ('gpt-4.1-mini', 'gpt-4.1', 'auto')),
  primary_color TEXT DEFAULT '#6366f1',
  position TEXT DEFAULT 'right' CHECK (position IN ('left', 'right')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  branding_enabled BOOLEAN NOT NULL DEFAULT true,
  total_conversations INTEGER DEFAULT 0,
  temperature DECIMAL(2,1) DEFAULT 0.2 CHECK (temperature >= 0 AND temperature <= 1),
  max_tokens INTEGER DEFAULT 1024,
  confidence_threshold DECIMAL(3,2) DEFAULT 0.65,
  fallback_message TEXT DEFAULT 'I don''t have enough information to answer that. Would you like to contact our support team?',
  allowed_domains TEXT[] DEFAULT '{}',
  data_source_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================
-- Documents (from any source)
-- ================================
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  data_source_id UUID NOT NULL REFERENCES public.data_sources(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  website_id UUID REFERENCES public.websites(id) ON DELETE CASCADE,
  external_id TEXT,
  url TEXT,
  -- Generated column so the UNIQUE constraint works without expression syntax
  source_key TEXT GENERATED ALWAYS AS (COALESCE(external_id, url)) STORED,
  title TEXT,
  content TEXT,
  content_hash TEXT,
  word_count INTEGER DEFAULT 0,
  doc_type TEXT DEFAULT 'page' CHECK (doc_type IN ('page', 'article', 'pdf', 'doc', 'sheet', 'slide', 'markdown', 'other')),
  metadata JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'chunking', 'indexed', 'error', 'stale')),
  last_indexed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(data_source_id, source_key)
);

-- ================================
-- Content Chunks (for Advanced RAG)
-- ================================
CREATE TABLE public.chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  data_source_id UUID NOT NULL REFERENCES public.data_sources(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  token_count INTEGER DEFAULT 0,
  chunk_index INTEGER DEFAULT 0,
  embedding vector(1536),
  heading TEXT,
  page_url TEXT,
  page_title TEXT,
  doc_type TEXT,
  search_vector tsvector GENERATED ALWAYS AS (to_tsvector('english', content)) STORED,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chunks_embedding ON public.chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_chunks_search_vector ON public.chunks USING GIN (search_vector);
CREATE INDEX idx_chunks_data_source ON public.chunks(data_source_id);
CREATE INDEX idx_chunks_user_id ON public.chunks(user_id);
CREATE INDEX idx_chunks_document_id ON public.chunks(document_id);

-- ================================
-- Conversations
-- ================================
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bot_id UUID NOT NULL REFERENCES public.bots(id) ON DELETE CASCADE,
  visitor_id TEXT,
  visitor_ip TEXT,
  visitor_country TEXT,
  visitor_page_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'escalated')),
  satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 1 AND 5),
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================
-- Messages
-- ================================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  sources JSONB DEFAULT '[]',
  model_used TEXT,
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  response_time_ms INTEGER,
  confidence_score DECIMAL(3,2),
  query_rewrite TEXT,
  chunks_retrieved INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================
-- Usage Tracking
-- ================================
CREATE TABLE public.usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  bot_id UUID REFERENCES public.bots(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('message', 'crawl', 'embed', 'reindex', 'sync')),
  tokens_used INTEGER DEFAULT 0,
  model TEXT,
  cost_usd DECIMAL(10, 6) DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.usage_monthly (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  message_count INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  total_cost_usd DECIMAL(10, 4) DEFAULT 0,
  crawl_count INTEGER DEFAULT 0,
  pages_indexed INTEGER DEFAULT 0,
  UNIQUE(user_id, month)
);

-- ================================
-- API Keys
-- ================================
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Default',
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  scopes TEXT[] DEFAULT '{chat,read}',
  rate_limit INTEGER DEFAULT 60,
  last_used_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================
-- Lead Captures
-- ================================
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bot_id UUID NOT NULL REFERENCES public.bots(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  name TEXT,
  email TEXT,
  phone TEXT,
  company TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================
-- Message Add-ons (prepaid message packs)
-- ================================
CREATE TABLE public.message_addons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  addon_type TEXT NOT NULL CHECK (addon_type IN ('1000_messages', '5000_messages', '10000_messages')),
  messages_purchased INTEGER NOT NULL,
  messages_used INTEGER NOT NULL DEFAULT 0,
  amount_paid_usd DECIMAL(10, 2) NOT NULL,
  dodo_payment_id TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_message_addons_user_id ON public.message_addons(user_id);

-- ================================
-- Response Cache
-- ================================
CREATE TABLE public.response_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bot_id UUID NOT NULL REFERENCES public.bots(id) ON DELETE CASCADE,
  query_hash TEXT NOT NULL,
  query_text TEXT NOT NULL,
  response_text TEXT NOT NULL,
  sources JSONB DEFAULT '[]',
  hit_count INTEGER DEFAULT 1,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(bot_id, query_hash)
);

CREATE INDEX idx_cache_lookup ON public.response_cache(bot_id, query_hash) WHERE expires_at > NOW();

-- ================================
-- Row Level Security (RLS)
-- ================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_monthly ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.response_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can CRUD own data_sources" ON public.data_sources FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own websites" ON public.websites FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own bots" ON public.bots FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own documents" ON public.documents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own chunks" ON public.chunks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Bot owners can view conversations" ON public.conversations FOR SELECT
  USING (bot_id IN (SELECT id FROM public.bots WHERE user_id = auth.uid()));
CREATE POLICY "Users can view messages" ON public.messages FOR SELECT
  USING (conversation_id IN (
    SELECT c.id FROM public.conversations c
    JOIN public.bots b ON c.bot_id = b.id
    WHERE b.user_id = auth.uid()
  ));
CREATE POLICY "Bot owners can access cache" ON public.response_cache FOR ALL
  USING (bot_id IN (SELECT id FROM public.bots WHERE user_id = auth.uid()));
CREATE POLICY "Users can view own addons" ON public.message_addons FOR SELECT USING (auth.uid() = user_id);

-- ================================
-- Functions & Triggers
-- ================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_websites_updated_at BEFORE UPDATE ON public.websites FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_bots_updated_at BEFORE UPDATE ON public.bots FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_data_sources_updated_at BEFORE UPDATE ON public.data_sources FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE OR REPLACE FUNCTION increment_message_count(p_user_id UUID, p_bot_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET monthly_message_count = monthly_message_count + 1
  WHERE id = p_user_id;

  UPDATE public.bots
  SET total_conversations = total_conversations + 1
  WHERE id = p_bot_id;

  INSERT INTO public.usage_monthly (user_id, month, message_count)
  VALUES (p_user_id, DATE_TRUNC('month', NOW()), 1)
  ON CONFLICT (user_id, month)
  DO UPDATE SET message_count = public.usage_monthly.message_count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION reset_monthly_counters()
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles SET monthly_message_count = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================
-- Hybrid Search Function (Vector + Full-Text)
-- ================================
CREATE OR REPLACE FUNCTION hybrid_search(
  p_query_embedding vector(1536),
  p_query_text TEXT,
  p_user_id UUID,
  p_data_source_ids UUID[] DEFAULT NULL,
  p_match_count INTEGER DEFAULT 20,
  p_vector_weight FLOAT DEFAULT 0.7,
  p_text_weight FLOAT DEFAULT 0.3
)
RETURNS TABLE (
  chunk_id UUID,
  content TEXT,
  token_count INTEGER,
  heading TEXT,
  page_url TEXT,
  page_title TEXT,
  doc_type TEXT,
  metadata JSONB,
  vector_score FLOAT,
  text_score FLOAT,
  combined_score FLOAT
) AS $$
BEGIN
  RETURN QUERY
  WITH vector_results AS (
    SELECT
      c.id,
      c.content,
      c.token_count,
      c.heading,
      c.page_url,
      c.page_title,
      c.doc_type,
      c.metadata,
      1 - (c.embedding <=> p_query_embedding) AS v_score
    FROM public.chunks c
    WHERE c.user_id = p_user_id
      AND (p_data_source_ids IS NULL OR c.data_source_id = ANY(p_data_source_ids))
    ORDER BY c.embedding <=> p_query_embedding
    LIMIT p_match_count * 2
  ),
  text_results AS (
    SELECT
      c.id,
      ts_rank_cd(c.search_vector, plainto_tsquery('english', p_query_text)) AS t_score
    FROM public.chunks c
    WHERE c.user_id = p_user_id
      AND (p_data_source_ids IS NULL OR c.data_source_id = ANY(p_data_source_ids))
      AND c.search_vector @@ plainto_tsquery('english', p_query_text)
    LIMIT p_match_count * 2
  ),
  combined AS (
    SELECT
      v.id AS chunk_id,
      v.content,
      v.token_count,
      v.heading,
      v.page_url,
      v.page_title,
      v.doc_type,
      v.metadata,
      v.v_score AS vector_score,
      COALESCE(t.t_score, 0) AS text_score,
      (v.v_score * p_vector_weight + COALESCE(t.t_score, 0) * p_text_weight) AS combined_score
    FROM vector_results v
    LEFT JOIN text_results t ON v.id = t.id
  )
  SELECT * FROM combined
  ORDER BY combined.combined_score DESC
  LIMIT p_match_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION clean_expired_cache()
RETURNS VOID AS $$
BEGIN
  DELETE FROM public.response_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Credit add-on message balance atomically (called from webhook)
CREATE OR REPLACE FUNCTION add_addon_balance(p_user_id UUID, p_messages INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET addon_message_balance = addon_message_balance + p_messages
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================
-- Webhook Events (idempotency)
-- ================================
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON public.webhook_events(event_id);

-- Auto-cleanup webhook events older than 30 days
CREATE OR REPLACE FUNCTION clean_old_webhook_events()
RETURNS VOID AS $$
BEGIN
  DELETE FROM public.webhook_events WHERE processed_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================
-- Atomic Usage Check + Increment
-- ================================
-- Returns TRUE if message was counted (within plan quota, add-on balance, or overage).
-- Returns FALSE if all limits exhausted.
-- Uses pg_advisory_xact_lock(user_id) to prevent race-condition bypasses under concurrent load.
CREATE OR REPLACE FUNCTION check_and_increment_message(p_user_id UUID, p_bot_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_rows_updated INTEGER;
BEGIN
  -- Acquire a per-user transaction-scoped advisory lock.
  -- This serialises concurrent requests for the same user so no two requests can
  -- both read the same count and both pass the limit check before either commits.
  PERFORM pg_advisory_xact_lock(hashtext(p_user_id::text)::bigint);

  -- Atomic UPDATE with priority order:
  --   1. Plan quota (monthly_message_count < monthly_message_limit)
  --   2. Add-on balance (addon_message_balance > 0)
  --   3. Overage (overage_enabled = true)
  UPDATE public.profiles
  SET
    monthly_message_count = monthly_message_count + 1,
    addon_message_balance = GREATEST(0, CASE
      WHEN monthly_message_count >= monthly_message_limit AND addon_message_balance > 0
        THEN addon_message_balance - 1
      ELSE addon_message_balance
    END)
  WHERE id = p_user_id
    AND (
      monthly_message_count < monthly_message_limit   -- within plan quota
      OR addon_message_balance > 0                    -- has prepaid add-on credits
      OR overage_enabled = true                       -- auto-overage billing enabled
    );

  GET DIAGNOSTICS v_rows_updated = ROW_COUNT;

  IF v_rows_updated = 0 THEN
    RETURN FALSE; -- all limits exhausted
  END IF;

  -- Increment bot conversation counter
  UPDATE public.bots
  SET total_conversations = total_conversations + 1
  WHERE id = p_bot_id;

  -- Upsert monthly usage aggregate
  INSERT INTO public.usage_monthly (user_id, month, message_count)
  VALUES (p_user_id, DATE_TRUNC('month', NOW()), 1)
  ON CONFLICT (user_id, month)
  DO UPDATE SET message_count = public.usage_monthly.message_count + 1;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

