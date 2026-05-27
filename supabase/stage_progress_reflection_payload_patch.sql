DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'stage_progress'
      AND column_name = 'reflection_payload'
  ) THEN
    ALTER TABLE public.stage_progress
      ADD COLUMN reflection_payload jsonb DEFAULT '{}'::jsonb NOT NULL;
  END IF;
END $$;
