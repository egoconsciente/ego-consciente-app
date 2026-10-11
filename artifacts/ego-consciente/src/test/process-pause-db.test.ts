// @vitest-environment node
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { beforeEach, afterEach, it, expect } from "vitest";
let db: PGlite;
const person = "11111111-1111-1111-1111-111111111111";
const other = "22222222-2222-2222-2222-222222222222";
beforeEach(async () => {
  db = new PGlite();
  await db.exec(`CREATE ROLE authenticated; CREATE SCHEMA auth;
    CREATE TABLE auth.users(id uuid PRIMARY KEY);
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT current_setting('test.uid')::uuid $$;
    INSERT INTO auth.users VALUES ('${person}'), ('${other}');
    CREATE TABLE public.stage_progress(user_id uuid, stage_number int, status text, thought text, notes text, PRIMARY KEY(user_id, stage_number));
    ALTER TABLE public.stage_progress ENABLE ROW LEVEL SECURITY;
    CREATE POLICY stage_owner ON public.stage_progress TO authenticated USING (auth.uid()=user_id) WITH CHECK(auth.uid()=user_id);
    GRANT USAGE ON SCHEMA public, auth TO authenticated;
    GRANT SELECT, INSERT, UPDATE ON public.stage_progress TO authenticated;`);
  await db.exec(
    readFileSync(
      new URL("../../../../supabase/journey_state.sql", import.meta.url),
      "utf8",
    ),
  );
  await db.exec(
    readFileSync(
      new URL("../../../../supabase/process_pause.sql", import.meta.url),
      "utf8",
    ),
  );
  await db.exec(`INSERT INTO public.journey_state(user_id, portal_completed, process_started_at) VALUES ('${person}', true, '2026-01-01'), ('${other}', true, '2026-01-01');
    INSERT INTO public.stage_progress VALUES ('${person}', 7, 'in_progress', 'mi reflexión', 'mi nota');
    SET ROLE authenticated; SET test.uid='${person}';`);
});
afterEach(async () => {
  await db.close();
});
it("SQL pause blocks advancement; resume preserves stage, notes, start and portal", async () => {
  await db.exec(
    `UPDATE journey_state SET paused_at=now() WHERE user_id='${person}'`,
  );
  await expect(
    db.exec(
      `UPDATE stage_progress SET status='completed' WHERE user_id='${person}'`,
    ),
  ).rejects.toThrow(/Resume the process/);
  await expect(
    db.exec(
      `INSERT INTO stage_progress VALUES ('${person}',8,'in_progress',null,null)`,
    ),
  ).rejects.toThrow(/Resume the process/);
  await db.exec(
    `UPDATE stage_progress SET notes='guardado en pausa' WHERE user_id='${person}'`,
  );
  await db.exec(
    `UPDATE journey_state SET paused_at=null WHERE user_id='${person}'`,
  );
  const stage = await db.query<{
    stage_number: number;
    status: string;
    thought: string;
    notes: string;
  }>("SELECT * FROM stage_progress");
  expect(stage.rows[0]).toMatchObject({
    stage_number: 7,
    status: "in_progress",
    thought: "mi reflexión",
    notes: "guardado en pausa",
  });
  const journey = await db.query<{
    portal_completed: boolean;
    started: string;
  }>(
    "SELECT portal_completed, process_started_at::text AS started FROM journey_state",
  );
  expect(journey.rows[0]).toMatchObject({
    portal_completed: true,
    started: "2026-01-01 00:00:00+00",
  });
  await db.exec(
    `UPDATE stage_progress SET status='completed' WHERE user_id='${person}'`,
  );
});
it("RLS forbids reading or pausing another account", async () => {
  const read = await db.query(
    `SELECT * FROM journey_state WHERE user_id='${other}'`,
  );
  expect(read.rows).toHaveLength(0);
  const update = await db.query(
    `UPDATE journey_state SET paused_at=now() WHERE user_id='${other}' RETURNING user_id`,
  );
  expect(update.rows).toHaveLength(0);
  await expect(
    db.exec(
      `UPDATE journey_state SET user_id='${other}' WHERE user_id='${person}'`,
    ),
  ).rejects.toThrow();
});
it("SQL is rerunnable", async () => {
  await db.exec("RESET ROLE");
  await db.exec(
    readFileSync(
      new URL("../../../../supabase/process_pause.sql", import.meta.url),
      "utf8",
    ),
  );
});
