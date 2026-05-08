-- ============================================
-- Unanswered Questions Tracking
-- Stores questions that the bot could not answer
-- so the bot owner can review and improve their KB
-- ============================================

CREATE TABLE IF NOT EXISTS public.unanswered_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bot_id UUID NOT NULL REFERENCES public.bots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  confidence DECIMAL(3,2) DEFAULT 0,
  reason TEXT NOT NULL DEFAULT 'low_confidence'
    CHECK (reason IN ('low_confidence', 'no_chunks', 'fallback_triggered', 'evasive_answer')),
  visitor_ip TEXT,
  visitor_page_url TEXT,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_unanswered_bot_id ON public.unanswered_questions(bot_id);
CREATE INDEX IF NOT EXISTS idx_unanswered_user_id ON public.unanswered_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_unanswered_created ON public.unanswered_questions(created_at);
CREATE INDEX IF NOT EXISTS idx_unanswered_unresolved ON public.unanswered_questions(bot_id, is_resolved) WHERE NOT is_resolved;

-- RLS
ALTER TABLE public.unanswered_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Bot owners can view unanswered questions" ON public.unanswered_questions FOR SELECT
  USING (bot_id IN (SELECT id FROM public.bots WHERE user_id = auth.uid()));

CREATE POLICY "Bot owners can update unanswered questions" ON public.unanswered_questions FOR UPDATE
  USING (bot_id IN (SELECT id FROM public.bots WHERE user_id = auth.uid()));
