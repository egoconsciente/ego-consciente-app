-- ============================================================
-- Ego Consciente — Ego Engine v1 Schema
-- Run this in Supabase → SQL Editor → New Query.
-- Safe to rerun: uses IF NOT EXISTS + DROP POLICY IF EXISTS.
-- ============================================================


-- ─────────────────────────────────────────────
-- 1. CHAT MESSAGES
-- Persistent conversation history between user and Ego.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('user', 'ego')),
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_created
  ON public.chat_messages (user_id, created_at DESC);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own chat_messages"  ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert own chat_messages" ON public.chat_messages;

CREATE POLICY "Users can read own chat_messages"
  ON public.chat_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat_messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- ─────────────────────────────────────────────
-- 2. EGO MEMORY
-- Single row per user. The Ego's running understanding
-- of the user, updated on every chat load.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ego_memory (
  user_id                    UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  current_day                INTEGER,
  primary_incongruence_area  TEXT,
  primary_difficulty         TEXT,
  latest_thought             TEXT,
  latest_emotion             TEXT,
  latest_action              TEXT,
  dominant_pattern_summary   TEXT,
  current_focus              TEXT,
  next_question              TEXT,
  suggested_step             TEXT,
  updated_at                 TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.ego_memory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own ego_memory"   ON public.ego_memory;
DROP POLICY IF EXISTS "Users can insert own ego_memory" ON public.ego_memory;
DROP POLICY IF EXISTS "Users can update own ego_memory" ON public.ego_memory;

CREATE POLICY "Users can read own ego_memory"
  ON public.ego_memory FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ego_memory"
  ON public.ego_memory FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ego_memory"
  ON public.ego_memory FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ─────────────────────────────────────────────
-- 3. EGO INSIGHTS
-- Observations the Ego registers over time.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ego_insights (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  source       TEXT NOT NULL,
  insight_text TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ego_insights_user_created
  ON public.ego_insights (user_id, created_at DESC);

ALTER TABLE public.ego_insights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own ego_insights"  ON public.ego_insights;
DROP POLICY IF EXISTS "Users can insert own ego_insights" ON public.ego_insights;

CREATE POLICY "Users can read own ego_insights"
  ON public.ego_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ego_insights"
  ON public.ego_insights FOR INSERT
  WITH CHECK (auth.uid() = user_id);
