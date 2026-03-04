-- ============================================
-- PageAI Database Schema (Supabase / PostgreSQL)
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";  -- pgvector for embeddings

-- ================================
-- Users & Authentication
-- ================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'basic', 'pro', 'premium')),
  dodo_customer_id TEXT UNIQUE,
  dodo_subscription_id TEXT,
  monthly_question_count INTEGER NOT NULL DEFAULT 0,
  monthly_question_limit INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================
-- Websites
-- ================================
CREATE TABLE public.websites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'crawling', 'indexed', 'error')),
  pages_count INTEGER DEFAULT 0,
  total_words INTEGER DEFAULT 0,
  last_crawled_at TIMESTAMPTZ,
  crawl_frequency TEXT DEFAULT 'weekly' CHECK (crawl_frequency IN ('daily', 'weekly', 'monthly', 'manual')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================
-- Bots (AI Assistants)
-- ================================
CREATE TABLE public.bots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  website_id UUID NOT NULL REFERENCES public.websites(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'AI Assistant',
  system_prompt TEXT,
  welcome_message TEXT DEFAULT 'Hi! 👋 Ask me anything about this website!',
  model TEXT NOT NULL DEFAULT 'gpt-3.5-turbo' CHECK (model IN ('gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'claude-3.5-sonnet')),
  primary_color TEXT DEFAULT '#6366f1',
  position TEXT DEFAULT 'right' CHECK (position IN ('left', 'right')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  branding_enabled BOOLEAN NOT NULL DEFAULT true,
  total_conversations INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================
-- Pages (Crawled Content)
-- ================================
CREATE TABLE public.pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL REFERENCES public.websites(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,
  content TEXT,
  word_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'indexed', 'error')),
  last_indexed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(website_id, url)
);

-- ================================
-- Content Chunks (for RAG)
-- ================================
CREATE TABLE public.chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  website_id UUID NOT NULL REFERENCES public.websites(id) ON DELETE CASCADE,
  bot_id UUID REFERENCES public.bots(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  token_count INTEGER DEFAULT 0,
  embedding vector(1536),  -- OpenAI text-embedding-3-small dimension
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for vector similarity search
CREATE INDEX idx_chunks_embedding ON public.chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_chunks_website_id ON public.chunks(website_id);
CREATE INDEX idx_chunks_bot_id ON public.chunks(bot_id);

-- ================================
-- Conversations
-- ================================
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bot_id UUID NOT NULL REFERENCES public.bots(id) ON DELETE CASCADE,
  visitor_id TEXT,  -- Anonymous visitor identifier
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
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  sources JSONB DEFAULT '[]',  -- Array of {url, title, relevance}
  model_used TEXT,
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  response_time_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================
-- Usage Tracking
-- ================================
CREATE TABLE public.usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  bot_id UUID REFERENCES public.bots(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('question', 'crawl', 'embed')),
  tokens_used INTEGER DEFAULT 0,
  model TEXT,
  cost_usd DECIMAL(10, 6) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Monthly usage aggregation
CREATE TABLE public.usage_monthly (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  month DATE NOT NULL,  -- First day of month
  question_count INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  total_cost_usd DECIMAL(10, 4) DEFAULT 0,
  crawl_count INTEGER DEFAULT 0,
  UNIQUE(user_id, month)
);

-- ================================
-- API Keys
-- ================================
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Default',
  key_hash TEXT NOT NULL UNIQUE,  -- Store hashed key
  key_prefix TEXT NOT NULL,  -- First 8 chars for display
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
-- Row Level Security (RLS)
-- ================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_monthly ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only read/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Websites: Users can only access their own websites
CREATE POLICY "Users can CRUD own websites" ON public.websites FOR ALL USING (auth.uid() = user_id);

-- Bots: Users can only access their own bots
CREATE POLICY "Users can CRUD own bots" ON public.bots FOR ALL USING (auth.uid() = user_id);

-- Pages: Users can access pages for their websites
CREATE POLICY "Users can access own pages" ON public.pages FOR ALL
  USING (website_id IN (SELECT id FROM public.websites WHERE user_id = auth.uid()));

-- Conversations: Bot owners can view conversations
CREATE POLICY "Bot owners can view conversations" ON public.conversations FOR SELECT
  USING (bot_id IN (SELECT id FROM public.bots WHERE user_id = auth.uid()));

-- Messages: Access via conversation ownership
CREATE POLICY "Users can view messages" ON public.messages FOR SELECT
  USING (conversation_id IN (
    SELECT c.id FROM public.conversations c
    JOIN public.bots b ON c.bot_id = b.id
    WHERE b.user_id = auth.uid()
  ));

-- ================================
-- Functions & Triggers
-- ================================

-- Auto-update updated_at timestamp
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
CREATE TRIGGER trigger_pages_updated_at BEFORE UPDATE ON public.pages FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on user signup
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

-- Increment monthly question count
CREATE OR REPLACE FUNCTION increment_question_count(p_user_id UUID, p_bot_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET monthly_question_count = monthly_question_count + 1
  WHERE id = p_user_id;

  UPDATE public.bots
  SET total_conversations = total_conversations + 1
  WHERE id = p_bot_id;

  INSERT INTO public.usage_monthly (user_id, month, question_count)
  VALUES (p_user_id, DATE_TRUNC('month', NOW()), 1)
  ON CONFLICT (user_id, month)
  DO UPDATE SET question_count = public.usage_monthly.question_count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reset monthly counters (run via pg_cron or Supabase Edge Function)
CREATE OR REPLACE FUNCTION reset_monthly_counters()
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles SET monthly_question_count = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
