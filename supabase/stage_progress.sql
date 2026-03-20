-- ============================================================
-- Ego Consciente — Stage Progress
-- Run this in Supabase → SQL Editor → New Query.
-- Safe to rerun.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.stage_progress (
  user_id                  UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  stage_number             INTEGER NOT NULL CHECK (stage_number >= 1 AND stage_number <= 40),
  status                   TEXT NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'in_progress', 'completed')),
  started_at               TIMESTAMPTZ,
  completed_at             TIMESTAMPTZ,
  user_confirmed_complete  BOOLEAN DEFAULT FALSE NOT NULL,
  created_at               TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at               TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (user_id, stage_number)
);

ALTER TABLE public.stage_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own stage_progress"   ON public.stage_progress;
DROP POLICY IF EXISTS "Users can insert own stage_progress" ON public.stage_progress;
DROP POLICY IF EXISTS "Users can update own stage_progress" ON public.stage_progress;

CREATE POLICY "Users can read own stage_progress"
  ON public.stage_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stage_progress"
  ON public.stage_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stage_progress"
  ON public.stage_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
