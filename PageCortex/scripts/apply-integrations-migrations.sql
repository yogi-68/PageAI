-- Run this entire file in Supabase Dashboard → SQL Editor
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE
--
-- Creates client_integrations + tool_execution_logs tables required for
-- Dashboard → Integrations (Shopify, WooCommerce, Custom REST).

-- ========== 20260512: API integrations ==========
CREATE TABLE IF NOT EXISTS public.client_integrations (
  id                   UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id              UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name                 TEXT        NOT NULL,
  type                 TEXT        NOT NULL CHECK (type IN ('shopify', 'woocommerce', 'custom')),
  base_url             TEXT        NOT NULL,
  encrypted_credentials TEXT       NOT NULL DEFAULT '',
  allowed_endpoints    TEXT[]      NOT NULL DEFAULT '{}',
  is_enabled           BOOLEAN     NOT NULL DEFAULT true,
  last_test_at         TIMESTAMPTZ,
  last_test_status     TEXT        CHECK (last_test_status IN ('ok', 'error', 'timeout')),
  last_test_message    TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tool_execution_logs (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  bot_id         UUID        REFERENCES public.bots(id) ON DELETE SET NULL,
  integration_id UUID        REFERENCES public.client_integrations(id) ON DELETE SET NULL,
  tool_name      TEXT        NOT NULL,
  input_params   JSONB       NOT NULL DEFAULT '{}',
  output_summary JSONB,
  status         TEXT        NOT NULL CHECK (status IN ('success', 'error', 'timeout', 'blocked')),
  latency_ms     INTEGER,
  error_message  TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_integrations_user_id
  ON public.client_integrations (user_id);

CREATE INDEX IF NOT EXISTS idx_client_integrations_enabled
  ON public.client_integrations (user_id, is_enabled);

CREATE INDEX IF NOT EXISTS idx_tool_execution_logs_user_id
  ON public.tool_execution_logs (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tool_execution_logs_bot_id
  ON public.tool_execution_logs (bot_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tool_execution_logs_status
  ON public.tool_execution_logs (user_id, status, created_at DESC);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_client_integrations_updated_at ON public.client_integrations;
CREATE TRIGGER set_client_integrations_updated_at
  BEFORE UPDATE ON public.client_integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.client_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_execution_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own integrations" ON public.client_integrations;
CREATE POLICY "Users manage own integrations"
  ON public.client_integrations
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users view own tool logs" ON public.tool_execution_logs;
CREATE POLICY "Users view own tool logs"
  ON public.tool_execution_logs
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role manages tool logs" ON public.tool_execution_logs;
CREATE POLICY "Service role manages tool logs"
  ON public.tool_execution_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE OR REPLACE VIEW public.tool_execution_stats AS
SELECT
  user_id,
  tool_name,
  COUNT(*)                                          AS total_calls,
  COUNT(*) FILTER (WHERE status = 'success')        AS successful,
  COUNT(*) FILTER (WHERE status = 'error')          AS failed,
  COUNT(*) FILTER (WHERE status = 'timeout')        AS timed_out,
  ROUND(AVG(latency_ms) FILTER (WHERE latency_ms IS NOT NULL))::INTEGER AS avg_latency_ms,
  MAX(created_at)                                   AS last_called_at
FROM public.tool_execution_logs
GROUP BY user_id, tool_name;

-- Verify:
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public' AND table_name IN ('client_integrations', 'tool_execution_logs');
