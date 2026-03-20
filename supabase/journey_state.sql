-- ============================================================
-- Ego Consciente — Journey State
-- Run this in Supabase → SQL Editor → New Query.
-- Safe to rerun.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.journey_state (
  user_id            UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  intro_completed    BOOLEAN DEFAULT FALSE NOT NULL,
  portal_completed   BOOLEAN DEFAULT FALSE NOT NULL,
  process_started_at TIMESTAMPTZ,
  created_at         TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at         TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.journey_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own journey_state"   ON public.journey_state;
DROP POLICY IF EXISTS "Users can insert own journey_state" ON public.journey_state;
DROP POLICY IF EXISTS "Users can update own journey_state" ON public.journey_state;

CREATE POLICY "Users can read own journey_state"
  ON public.journey_state FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journey_state"
  ON public.journey_state FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journey_state"
  ON public.journey_state FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
