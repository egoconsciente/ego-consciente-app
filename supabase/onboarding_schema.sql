-- ============================================================
-- Ego Consciente — Onboarding Schema
-- Safe to rerun. Run this in your Supabase project SQL editor:
-- https://supabase.com/dashboard → SQL Editor → New Query
-- ============================================================

-- ─────────────────────────────────────────────
-- ONBOARDING RESPONSES
-- One row per user (user_id is the PK).
-- Row existence = onboarding complete.
-- Supports upsert so the user can update later.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.onboarding_responses (
  user_id           UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  reason            TEXT NOT NULL,
  incongruence_area TEXT NOT NULL,
  difficulty        TEXT NOT NULL,
  daily_time        TEXT NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.onboarding_responses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before recreating (makes script safely rerunnable)
DROP POLICY IF EXISTS "Users can read own onboarding"   ON public.onboarding_responses;
DROP POLICY IF EXISTS "Users can insert own onboarding" ON public.onboarding_responses;
DROP POLICY IF EXISTS "Users can update own onboarding" ON public.onboarding_responses;

CREATE POLICY "Users can read own onboarding"
  ON public.onboarding_responses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding"
  ON public.onboarding_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding"
  ON public.onboarding_responses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
