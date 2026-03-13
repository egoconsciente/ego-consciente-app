-- ============================================================
-- Ego Consciente — Onboarding Schema
-- Run this in your Supabase project SQL editor:
-- https://supabase.com/dashboard → SQL Editor → New Query
-- ============================================================

-- ─────────────────────────────────────────────
-- ONBOARDING RESPONSES
-- One row per user. Its existence = onboarding complete.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.onboarding_responses (
  user_id          UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  reason           TEXT NOT NULL,
  incongruence_area TEXT NOT NULL,
  difficulty       TEXT NOT NULL,
  daily_time       TEXT NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.onboarding_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own onboarding"
  ON public.onboarding_responses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding"
  ON public.onboarding_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);
