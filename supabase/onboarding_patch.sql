-- ============================================================
-- Ego Consciente — Onboarding Patch
-- Run this in Supabase → SQL Editor → New Query.
-- Safe to rerun: uses IF NOT EXISTS + DROP POLICY IF EXISTS.
-- ============================================================

-- 1. Create table if it does not exist yet
CREATE TABLE IF NOT EXISTS public.onboarding_responses (
  user_id           UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  reason            TEXT NOT NULL,
  incongruence_area TEXT NOT NULL,
  difficulty        TEXT NOT NULL,
  daily_time        TEXT NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Enable RLS (idempotent)
ALTER TABLE public.onboarding_responses ENABLE ROW LEVEL SECURITY;

-- 3. Drop all policies before recreating (safe to rerun)
DROP POLICY IF EXISTS "Users can read own onboarding"   ON public.onboarding_responses;
DROP POLICY IF EXISTS "Users can insert own onboarding" ON public.onboarding_responses;
DROP POLICY IF EXISTS "Users can update own onboarding" ON public.onboarding_responses;

-- 4. SELECT — user can read their own row
CREATE POLICY "Users can read own onboarding"
  ON public.onboarding_responses FOR SELECT
  USING (auth.uid() = user_id);

-- 5. INSERT — user can create their own row
CREATE POLICY "Users can insert own onboarding"
  ON public.onboarding_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 6. UPDATE — required for upsert ON CONFLICT DO UPDATE path
CREATE POLICY "Users can update own onboarding"
  ON public.onboarding_responses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
