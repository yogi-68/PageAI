-- ============================================================
-- PageAI Live DB Migration — Run this in Supabase SQL Editor
-- Idempotent: safe to run multiple times on any DB state
-- ============================================================

-- Make sure extensions exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- 1. message_addons table (required by check_and_increment_message)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.message_addons (
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

CREATE INDEX IF NOT EXISTS idx_message_addons_user_id ON public.message_addons(user_id);

-- RLS for message_addons
ALTER TABLE public.message_addons ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'message_addons' AND policyname = 'Users can view own addons'
  ) THEN
    CREATE POLICY "Users can view own addons" ON public.message_addons FOR SELECT USING (auth.uid() = user_id);
  END IF;
END;
$$;

-- ============================================================
-- 2. usage_monthly table (required by check_and_increment_message)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.usage_monthly (
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

-- ============================================================
-- 3. response_cache table (required by RAG cache layer)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.response_cache (
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

CREATE INDEX IF NOT EXISTS idx_cache_lookup ON public.response_cache(bot_id, query_hash);

-- RLS for response_cache
ALTER TABLE public.response_cache ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'response_cache' AND policyname = 'Bot owners can access cache'
  ) THEN
    CREATE POLICY "Bot owners can access cache" ON public.response_cache FOR ALL
      USING (bot_id IN (SELECT id FROM public.bots WHERE user_id = auth.uid()));
  END IF;
END;
$$;

-- ============================================================
-- 4. webhook_events table (idempotency for Dodo webhooks)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON public.webhook_events(event_id);

-- ============================================================
-- 5. Add missing columns to profiles (if schema was applied before these were added)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='addon_message_balance') THEN
    ALTER TABLE public.profiles ADD COLUMN addon_message_balance INTEGER NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='overage_enabled') THEN
    ALTER TABLE public.profiles ADD COLUMN overage_enabled BOOLEAN NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='has_used_trial') THEN
    ALTER TABLE public.profiles ADD COLUMN has_used_trial BOOLEAN NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='usage_reset_at') THEN
    ALTER TABLE public.profiles ADD COLUMN usage_reset_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;
END;
$$;

-- ============================================================
-- 6. hybrid_search RPC (vector + BM25 — required by RAG)
-- ============================================================
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

-- ============================================================
-- 7. check_and_increment_message RPC (atomic usage gate)
-- ============================================================
CREATE OR REPLACE FUNCTION check_and_increment_message(p_user_id UUID, p_bot_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_profile RECORD;
  v_valid_addon_balance INTEGER;
  v_used_addon BOOLEAN := FALSE;
BEGIN
  -- Per-user transaction-scoped advisory lock
  PERFORM pg_advisory_xact_lock(hashtext(p_user_id::text)::bigint);

  -- Fetch & lock the profile row
  SELECT * INTO v_profile FROM public.profiles WHERE id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN RETURN FALSE; END IF;

  -- Auto-reset: if billing cycle (1 month) has elapsed, reset counter
  IF v_profile.usage_reset_at + INTERVAL '1 month' <= NOW() THEN
    UPDATE public.profiles
    SET monthly_message_count = 0, usage_reset_at = NOW()
    WHERE id = p_user_id;
    v_profile.monthly_message_count := 0;
  END IF;

  -- Reconcile addon balance with only non-expired packs
  SELECT COALESCE(SUM(GREATEST(messages_purchased - messages_used, 0)), 0)
  INTO v_valid_addon_balance
  FROM public.message_addons
  WHERE user_id = p_user_id AND (expires_at IS NULL OR expires_at > NOW());

  IF v_profile.addon_message_balance IS DISTINCT FROM v_valid_addon_balance THEN
    UPDATE public.profiles SET addon_message_balance = v_valid_addon_balance WHERE id = p_user_id;
    v_profile.addon_message_balance := v_valid_addon_balance;
  END IF;

  -- Priority: plan quota → addon balance → overage
  IF v_profile.monthly_message_count < v_profile.monthly_message_limit THEN
    UPDATE public.profiles
    SET monthly_message_count = monthly_message_count + 1
    WHERE id = p_user_id;
  ELSIF v_valid_addon_balance > 0 THEN
    UPDATE public.profiles
    SET monthly_message_count = monthly_message_count + 1,
        addon_message_balance = addon_message_balance - 1
    WHERE id = p_user_id;
    UPDATE public.message_addons
    SET messages_used = messages_used + 1
    WHERE id = (
      SELECT id FROM public.message_addons
      WHERE user_id = p_user_id
        AND messages_used < messages_purchased
        AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY created_at ASC LIMIT 1
    );
    v_used_addon := TRUE;
  ELSIF v_profile.overage_enabled THEN
    UPDATE public.profiles
    SET monthly_message_count = monthly_message_count + 1
    WHERE id = p_user_id;
  ELSE
    RETURN FALSE;
  END IF;

  UPDATE public.bots
  SET total_conversations = total_conversations + 1
  WHERE id = p_bot_id;

  INSERT INTO public.usage_monthly (user_id, month, message_count)
  VALUES (p_user_id, DATE_TRUNC('month', NOW()), 1)
  ON CONFLICT (user_id, month)
  DO UPDATE SET message_count = public.usage_monthly.message_count + 1;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 8. rollback_message_increment RPC
-- ============================================================
CREATE OR REPLACE FUNCTION rollback_message_increment(p_user_id UUID, p_bot_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET monthly_message_count = GREATEST(0, monthly_message_count - 1)
  WHERE id = p_user_id;

  UPDATE public.bots
  SET total_conversations = GREATEST(0, total_conversations - 1)
  WHERE id = p_bot_id;

  UPDATE public.usage_monthly
  SET message_count = GREATEST(0, message_count - 1)
  WHERE user_id = p_user_id AND month = DATE_TRUNC('month', NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 9. add_addon_balance RPC (called from Dodo webhook)
-- ============================================================
CREATE OR REPLACE FUNCTION add_addon_balance(p_user_id UUID, p_messages INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET addon_message_balance = addon_message_balance + p_messages
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 10. analytics_events table (required by trackEvent() in analytics.ts)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event ON public.analytics_events(event);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at);

-- ============================================================
-- Done — all required tables and functions are now in place.
-- ============================================================
