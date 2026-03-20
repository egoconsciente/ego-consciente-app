-- ============================================================
-- Ego Consciente — Stage Progress Completion Patch
-- Run this in Supabase → SQL Editor → New Query.
-- Safe to rerun (uses IF NOT EXISTS).
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='stage_progress' AND column_name='thought') THEN
    ALTER TABLE public.stage_progress ADD COLUMN thought text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='stage_progress' AND column_name='emotion') THEN
    ALTER TABLE public.stage_progress ADD COLUMN emotion text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='stage_progress' AND column_name='action') THEN
    ALTER TABLE public.stage_progress ADD COLUMN action text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='stage_progress' AND column_name='notes') THEN
    ALTER TABLE public.stage_progress ADD COLUMN notes text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='stage_progress' AND column_name='completion_ready') THEN
    ALTER TABLE public.stage_progress ADD COLUMN completion_ready boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='stage_progress' AND column_name='completion_missing') THEN
    ALTER TABLE public.stage_progress ADD COLUMN completion_missing jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='stage_progress' AND column_name='ego_followup_count') THEN
    ALTER TABLE public.stage_progress ADD COLUMN ego_followup_count integer DEFAULT 0;
  END IF;
END $$;
