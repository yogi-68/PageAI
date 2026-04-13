-- ============================================================
-- PageAI Migration — Safe to run on partially-created databases
-- Idempotent: all operations use IF NOT EXISTS / IF EXISTS / CREATE OR REPLACE
-- ============================================================

-- ─── Extensions ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ─── Fix: IMMUTABLE index predicate ─────────────────────────
-- Old index used WHERE expires_at > NOW() which is STABLE, not IMMUTABLE.
DROP INDEX IF EXISTS idx_cache_lookup;
CREATE INDEX IF NOT EXISTS idx_cache_lookup ON public.response_cache(bot_id, query_hash);

-- ─── New column: usage_reset_at on profiles ─────────────────
DO $$ BEGIN
  ALTER TABLE public.profiles ADD COLUMN usage_reset_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- ─── Analytics Events table ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  event TEXT NOT NULL,
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event ON public.analytics_events(event);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON public.analytics_events(created_at);

-- ─── Webhook Events table ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON public.webhook_events(event_id);

-- ─── RLS (safe to re-enable) ────────────────────────────────
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
DO $$ BEGIN ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ─── RLS Policies (safe: DROP IF EXISTS first) ──────────────
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can CRUD own data_sources" ON public.data_sources;
CREATE POLICY "Users can CRUD own data_sources" ON public.data_sources FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can CRUD own websites" ON public.websites;
CREATE POLICY "Users can CRUD own websites" ON public.websites FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can CRUD own bots" ON public.bots;
CREATE POLICY "Users can CRUD own bots" ON public.bots FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can CRUD own documents" ON public.documents;
CREATE POLICY "Users can CRUD own documents" ON public.documents FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can access own chunks" ON public.chunks;
CREATE POLICY "Users can access own chunks" ON public.chunks FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Bot owners can view conversations" ON public.conversations;
CREATE POLICY "Bot owners can view conversations" ON public.conversations FOR SELECT USING (bot_id IN (SELECT id FROM public.bots WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "Users can view messages" ON public.messages;
CREATE POLICY "Users can view messages" ON public.messages FOR SELECT USING (conversation_id IN (SELECT c.id FROM public.conversations c JOIN public.bots b ON c.bot_id = b.id WHERE b.user_id = auth.uid()));
DROP POLICY IF EXISTS "Bot owners can access cache" ON public.response_cache;
CREATE POLICY "Bot owners can access cache" ON public.response_cache FOR ALL USING (bot_id IN (SELECT id FROM public.bots WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "Users can view own addons" ON public.message_addons;
CREATE POLICY "Users can view own addons" ON public.message_addons FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can view own analytics" ON public.analytics_events;
CREATE POLICY "Users can view own analytics" ON public.analytics_events FOR SELECT USING (auth.uid() = user_id);

-- ─── Functions (CREATE OR REPLACE = safe) ───────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- Triggers (safe: drop if exists first)
DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS trigger_websites_updated_at ON public.websites;
CREATE TRIGGER trigger_websites_updated_at BEFORE UPDATE ON public.websites FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS trigger_bots_updated_at ON public.bots;
CREATE TRIGGER trigger_bots_updated_at BEFORE UPDATE ON public.bots FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS trigger_documents_updated_at ON public.documents;
CREATE TRIGGER trigger_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS trigger_data_sources_updated_at ON public.data_sources;
CREATE TRIGGER trigger_data_sources_updated_at BEFORE UPDATE ON public.data_sources FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE OR REPLACE FUNCTION increment_message_count(p_user_id UUID, p_bot_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles SET monthly_message_count = monthly_message_count + 1 WHERE id = p_user_id;
  UPDATE public.bots SET total_conversations = total_conversations + 1 WHERE id = p_bot_id;
  INSERT INTO public.usage_monthly (user_id, month, message_count) VALUES (p_user_id, DATE_TRUNC('month', NOW()), 1)
  ON CONFLICT (user_id, month) DO UPDATE SET message_count = public.usage_monthly.message_count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION reset_monthly_counters()
RETURNS VOID AS $$
BEGIN UPDATE public.profiles SET monthly_message_count = 0, usage_reset_at = NOW(); END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION clean_expired_cache()
RETURNS VOID AS $$
BEGIN DELETE FROM public.response_cache WHERE expires_at < NOW(); END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION add_addon_balance(p_user_id UUID, p_messages INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles SET addon_message_balance = addon_message_balance + p_messages WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION clean_old_webhook_events()
RETURNS VOID AS $$
BEGIN DELETE FROM public.webhook_events WHERE processed_at < NOW() - INTERVAL '30 days'; END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── Hybrid Search ──────────────────────────────────────────
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
  chunk_id UUID, content TEXT, token_count INTEGER, heading TEXT,
  page_url TEXT, page_title TEXT, doc_type TEXT, metadata JSONB,
  vector_score FLOAT, text_score FLOAT, combined_score FLOAT
) AS $$
BEGIN
  RETURN QUERY
  WITH vector_results AS (
    SELECT c.id, c.content, c.token_count, c.heading, c.page_url, c.page_title, c.doc_type, c.metadata,
           1 - (c.embedding <=> p_query_embedding) AS v_score
    FROM public.chunks c
    WHERE c.user_id = p_user_id AND (p_data_source_ids IS NULL OR c.data_source_id = ANY(p_data_source_ids))
    ORDER BY c.embedding <=> p_query_embedding LIMIT p_match_count * 2
  ),
  text_results AS (
    SELECT c.id, ts_rank_cd(c.search_vector, plainto_tsquery('english', p_query_text)) AS t_score
    FROM public.chunks c
    WHERE c.user_id = p_user_id AND (p_data_source_ids IS NULL OR c.data_source_id = ANY(p_data_source_ids))
      AND c.search_vector @@ plainto_tsquery('english', p_query_text)
    LIMIT p_match_count * 2
  ),
  combined AS (
    SELECT v.id AS chunk_id, v.content, v.token_count, v.heading, v.page_url, v.page_title, v.doc_type, v.metadata,
           v.v_score AS vector_score, COALESCE(t.t_score, 0) AS text_score,
           (v.v_score * p_vector_weight + COALESCE(t.t_score, 0) * p_text_weight) AS combined_score
    FROM vector_results v LEFT JOIN text_results t ON v.id = t.id
  )
  SELECT * FROM combined ORDER BY combined.combined_score DESC LIMIT p_match_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── Atomic Usage Check + Increment (v2) ────────────────────
CREATE OR REPLACE FUNCTION check_and_increment_message(p_user_id UUID, p_bot_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_profile RECORD;
  v_valid_addon_balance INTEGER;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(p_user_id::text)::bigint);

  SELECT * INTO v_profile FROM public.profiles WHERE id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN RETURN FALSE; END IF;

  -- Auto-reset if billing cycle (1 month) elapsed
  IF v_profile.usage_reset_at + INTERVAL '1 month' <= NOW() THEN
    UPDATE public.profiles SET monthly_message_count = 0, usage_reset_at = NOW() WHERE id = p_user_id;
    v_profile.monthly_message_count := 0;
  END IF;

  -- Reconcile addon balance with non-expired packs only
  SELECT COALESCE(SUM(GREATEST(messages_purchased - messages_used, 0)), 0)
  INTO v_valid_addon_balance
  FROM public.message_addons
  WHERE user_id = p_user_id AND (expires_at IS NULL OR expires_at > NOW());

  IF v_profile.addon_message_balance IS DISTINCT FROM v_valid_addon_balance THEN
    UPDATE public.profiles SET addon_message_balance = v_valid_addon_balance WHERE id = p_user_id;
    v_profile.addon_message_balance := v_valid_addon_balance;
  END IF;

  -- Priority: plan quota → addon → overage
  IF v_profile.monthly_message_count < v_profile.monthly_message_limit THEN
    UPDATE public.profiles SET monthly_message_count = monthly_message_count + 1 WHERE id = p_user_id;
  ELSIF v_valid_addon_balance > 0 THEN
    UPDATE public.profiles SET monthly_message_count = monthly_message_count + 1, addon_message_balance = addon_message_balance - 1 WHERE id = p_user_id;
    UPDATE public.message_addons SET messages_used = messages_used + 1
    WHERE id = (SELECT id FROM public.message_addons WHERE user_id = p_user_id AND messages_used < messages_purchased AND (expires_at IS NULL OR expires_at > NOW()) ORDER BY created_at ASC LIMIT 1);
  ELSIF v_profile.overage_enabled THEN
    UPDATE public.profiles SET monthly_message_count = monthly_message_count + 1 WHERE id = p_user_id;
  ELSE
    RETURN FALSE;
  END IF;

  UPDATE public.bots SET total_conversations = total_conversations + 1 WHERE id = p_bot_id;

  INSERT INTO public.usage_monthly (user_id, month, message_count) VALUES (p_user_id, DATE_TRUNC('month', NOW()), 1)
  ON CONFLICT (user_id, month) DO UPDATE SET message_count = public.usage_monthly.message_count + 1;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── Rollback message increment (on API failure) ────────────
CREATE OR REPLACE FUNCTION rollback_message_increment(p_user_id UUID, p_bot_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles SET monthly_message_count = GREATEST(0, monthly_message_count - 1) WHERE id = p_user_id;
  UPDATE public.bots SET total_conversations = GREATEST(0, total_conversations - 1) WHERE id = p_bot_id;
  UPDATE public.usage_monthly SET message_count = GREATEST(0, message_count - 1)
  WHERE user_id = p_user_id AND month = DATE_TRUNC('month', NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── Expire Addon Balances (run via pg_cron or API cron) ────
CREATE OR REPLACE FUNCTION expire_addon_balances()
RETURNS INTEGER AS $$
DECLARE v_affected INTEGER := 0;
BEGIN
  UPDATE public.profiles p SET addon_message_balance = COALESCE((
    SELECT SUM(GREATEST(ma.messages_purchased - ma.messages_used, 0))
    FROM public.message_addons ma
    WHERE ma.user_id = p.id AND (ma.expires_at IS NULL OR ma.expires_at > NOW())
  ), 0)
  WHERE p.addon_message_balance > 0;
  GET DIAGNOSTICS v_affected = ROW_COUNT;
  RETURN v_affected;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
