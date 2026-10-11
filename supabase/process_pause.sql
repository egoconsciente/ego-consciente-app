-- Apply after journey_state.sql and stage_progress schema, before frontend deploy.
BEGIN;
ALTER TABLE public.journey_state ADD COLUMN IF NOT EXISTS paused_at timestamptz;
-- Existing ownership RLS applies; SELECT is needed to verify the written row.
GRANT SELECT, UPDATE ON public.journey_state TO authenticated;
-- Serialize stage advancement with pause writes on the same journey row.
CREATE OR REPLACE FUNCTION public.guard_paused_stage() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE pause_time timestamptz;
BEGIN
  IF NEW.status IN ('completed', 'in_progress') AND
     (TG_OP = 'INSERT' OR NEW.status IS DISTINCT FROM OLD.status) THEN
    SELECT paused_at INTO pause_time FROM public.journey_state
      WHERE user_id = NEW.user_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Journey state unavailable'; END IF;
    IF pause_time IS NOT NULL THEN RAISE EXCEPTION 'Resume the process before advancing'; END IF;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.guard_paused_stage() FROM PUBLIC;
DROP TRIGGER IF EXISTS guard_paused_stage ON public.stage_progress;
CREATE TRIGGER guard_paused_stage BEFORE INSERT OR UPDATE ON public.stage_progress
FOR EACH ROW EXECUTE FUNCTION public.guard_paused_stage();
COMMIT;
