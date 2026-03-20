-- ============================================================
-- Ego Consciente — Supabase Schema
-- Run this in your Supabase project SQL editor:
-- https://supabase.com/dashboard → SQL Editor → New Query
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. PROFILES
-- Linked 1:1 to auth.users. Created automatically via trigger.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);


-- ─────────────────────────────────────────────
-- 2. PEA ENTRIES
-- One entry per user per day (enforced by unique constraint).
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pea_entries (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL CHECK (day_number BETWEEN 1 AND 40),
  thought    TEXT NOT NULL,
  emotion    TEXT NOT NULL,
  action     TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT pea_entries_user_day_unique UNIQUE (user_id, day_number)
);

ALTER TABLE public.pea_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own pea_entries"
  ON public.pea_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pea_entries"
  ON public.pea_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pea_entries"
  ON public.pea_entries FOR UPDATE
  USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────
-- 3. DAILY PROGRESS
-- Tracks the "paso mínimo" for each day.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.daily_progress (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL CHECK (day_number BETWEEN 1 AND 40),
  step_text  TEXT NOT NULL,
  completed  BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.daily_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own daily_progress"
  ON public.daily_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily_progress"
  ON public.daily_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily_progress"
  ON public.daily_progress FOR UPDATE
  USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────
-- 4. TRIGGER — auto-create profile on signup
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
