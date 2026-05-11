-- ============================================================
-- PageCortex: Client API Integrations + Tool Execution Logs
-- Migration: 20260512_api_integrations
-- ============================================================

-- ─── Client Integrations ─────────────────────────────────
-- Stores encrypted third-party API credentials per user.
-- Credentials are AES-256-GCM encrypted server-side; never
-- stored or returned in plain text.
CREATE TABLE IF NOT EXISTS public.client_integrations (
  id                   UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id              UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name                 TEXT        NOT NULL,
  type                 TEXT        NOT NULL CHECK (type IN ('shopify', 'woocommerce', 'custom')),
  base_url             TEXT        NOT NULL,
  -- AES-256-GCM encrypted JSON blob: { apiKey?, token?, consumerKey?, consumerSecret?, authHeader? }
  encrypted_credentials TEXT       NOT NULL DEFAULT '',
  -- Whitelisted endpoint path segments, e.g. ['/orders/', '/products/']
  allowed_endpoints    TEXT[]      NOT NULL DEFAULT '{}',
  is_enabled           BOOLEAN     NOT NULL DEFAULT true,
  -- Last connectivity test result
  last_test_at         TIMESTAMPTZ,
  last_test_status     TEXT        CHECK (last_test_status IN ('ok', 'error', 'timeout')),
  last_test_message    TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Tool Execution Logs ──────────────────────────────────
-- Tracks every live API call the AI makes during a chat.
CREATE TABLE IF NOT EXISTS public.tool_execution_logs (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  bot_id         UUID        REFERENCES public.bots(id) ON DELETE SET NULL,
  integration_id UUID        REFERENCES public.client_integrations(id) ON DELETE SET NULL,
  tool_name      TEXT        NOT NULL,
  -- Sanitized input params passed to the tool (no secrets)
  input_params   JSONB       NOT NULL DEFAULT '{}',
  -- Sanitized output summary (no raw tokens/passwords/internal IDs)
  output_summary JSONB,
  status         TEXT        NOT NULL CHECK (status IN ('success', 'error', 'timeout', 'blocked')),
  latency_ms     INTEGER,
  error_message  TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Indexes ─────────────────────────────────────────────
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

-- ─── Updated-At Trigger ──────────────────────────────────
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

-- ─── Row Level Security ───────────────────────────────────
ALTER TABLE public.client_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_execution_logs ENABLE ROW LEVEL SECURITY;

-- Users can only access their own integrations
CREATE POLICY "Users manage own integrations"
  ON public.client_integrations
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only view their own tool logs (read-only from client)
CREATE POLICY "Users view own tool logs"
  ON public.tool_execution_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert logs (from backend API routes)
CREATE POLICY "Service role manages tool logs"
  ON public.tool_execution_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ─── Tool Execution Stats View ────────────────────────────
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
