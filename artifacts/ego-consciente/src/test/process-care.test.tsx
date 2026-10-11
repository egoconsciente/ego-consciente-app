import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useProcessPause } from "@/lib/process-pause";
import { ProcessCare } from "@/components/process-care";
import { StageProvider, useStages } from "@/lib/stage-context";
import { JourneyPauseGate } from "@/components/journey-pause-gate";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import Dashboard from "@/pages/dashboard";

const db = vi.hoisted(() => ({
  paused_at: null as string | null,
  fail: false,
  zero: false,
  hold: null as Promise<void> | null,
  writes: [] as Record<string, unknown>[],
  user: { id: "person", name: "Eduardo" },
  records: [
    {
      stage_number: 7,
      status: "in_progress",
      thought: "Conservo lo observado",
      emotion: "calma",
      action: "escribo",
      notes: "mi nota",
      reflection_payload: { draft: "intacto" },
    },
    ...Array.from({length: 6}, (_, i) => ({stage_number: i + 1, status: "completed", thought: "observado", emotion: "calma", action: "escribo", notes: "guardado", reflection_payload: {draft: "intacto"}})),
  ],
}));
vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({ user: db.user, portalComplete: true }),
}));
vi.mock("@/components/layout/app-layout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => (
    <main>{children}</main>
  ),
}));
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from(table: string) {
      let payload: Record<string, unknown> | undefined;
      const result = async () => {
        if (db.hold && payload) await db.hold;
        if (db.fail) return { data: null, error: { message: "offline" } };
        if (db.zero) return { data: null, error: null };
        if (table === "stage_progress")
          return { data: db.records, error: null };
        if (payload) {
          db.writes.push(payload);
          db.paused_at = payload.paused_at as string | null;
        }
        return { data: { paused_at: db.paused_at }, error: null };
      };
      const chain: any = {
        select: () => chain,
        eq: () => chain,
        update: (p: Record<string, unknown>) => {
          payload = p;
          return chain;
        },
        single: result,
        order: result,
      };
      return chain;
    },
  },
}));
function Care() {
  return <ProcessCare pause={useProcessPause("person")} />;
}
async function ready() {
  await screen.findByText("Recorrido disponible.");
}
beforeEach(() => {
  db.paused_at = null;
  db.fail = false;
  db.zero = false;
  db.hold = null;
  db.writes = [];
});

describe("voluntary care and persisted pause", () => {
  it("exposes both controls from the real dashboard without classification", async () => {
    render(
      <StageProvider>
        <Dashboard />
      </StageProvider>,
    );
    expect(
      await screen.findByRole("button", { name: "Volver al cuerpo" }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Pausar el proceso" }),
    ).toBeVisible();
  });
  it("opens grounding by keyboard, traps focus and restores it on Escape", async () => {
    const user = userEvent.setup();
    render(<Care />);
    await ready();
    const trigger = screen.getByRole("button", { name: "Volver al cuerpo" });
    trigger.focus();
    await user.keyboard("{Enter}");
    expect(
      screen.getByRole("dialog", { name: "Volver al cuerpo" }),
    ).toHaveAttribute("aria-modal", "true");
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Cerrar" })).toHaveFocus(),
    );
    await user.tab({ shift: true });
    expect(
      screen.getByRole("button", { name: "Volver cuando esté listo" }),
    ).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Cerrar" })).toHaveFocus();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(db.writes).toEqual([]);
  });
  it("cancels with no persistence and restores focus", async () => {
    const user = userEvent.setup();
    render(<Care />);
    await ready();
    const trigger = screen.getByRole("button", { name: "Pausar el proceso" });
    await user.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Pausar el proceso" });
    expect(dialog).toHaveAttribute(
      "aria-describedby",
      "pause-dialog-description",
    );
    await user.click(screen.getByRole("button", { name: "Seguir observando" }));
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(db.writes).toEqual([]);
  });
  it("waits for successful write, ignores repeated confirmation and blocks cancellation while pending", async () => {
    const user = userEvent.setup();
    render(<Care />);
    await ready();
    await user.click(screen.getByRole("button", { name: "Pausar el proceso" }));
    let release!: () => void;
    db.hold = new Promise((r) => {
      release = r;
    });
    await user.click(screen.getByRole("button", { name: "Pausar" }));
    expect(
      screen.getByRole("button", { name: "Seguir observando" }),
    ).toBeDisabled();
    await user.keyboard("{Escape}");
    expect(screen.getByRole("dialog")).toBeVisible();
    expect(screen.queryByText(/Recorrido en pausa/)).toBeNull();
    await act(async () => release());
    await screen.findByText(/Recorrido en pausa/);
    expect(db.writes).toHaveLength(1);
  });
  it("survives reload, resumes without moving stage or modifying saved information", async () => {
    const saved = structuredClone(db.records);
    const user = userEvent.setup();
    const first = render(<Care />);
    await ready();
    await user.click(screen.getByRole("button", { name: "Pausar el proceso" }));
    await user.click(screen.getByRole("button", { name: "Pausar" }));
    await screen.findByText(/Recorrido en pausa/);
    first.unmount();
    render(<Care />);
    await screen.findByText(/Recorrido en pausa/);
    await user.click(
      screen.getByRole("button", { name: "Reanudar el proceso" }),
    );
    await ready();
    expect(db.paused_at).toBeNull();
    expect(db.records).toEqual(saved);
    expect(db.writes.every((p) => Object.keys(p).join() === "paused_at")).toBe(
      true,
    );
  });
  it.each(["error", "zero rows"])(
    "never confirms a failed pause: %s",
    async (mode) => {
      const user = userEvent.setup();
      render(<Care />);
      await ready();
      await user.click(
        screen.getByRole("button", { name: "Pausar el proceso" }),
      );
      db.fail = mode === "error";
      db.zero = mode === "zero rows";
      await user.click(screen.getByRole("button", { name: "Pausar" }));
      expect(await screen.findByRole("dialog")).toBeVisible();
      await waitFor(() =>
        expect(screen.getAllByRole("alert").length).toBeGreaterThan(0),
      );
      expect(screen.queryByText(/Recorrido en pausa/)).toBeNull();
      expect(db.paused_at).toBeNull();
    },
  );
  it("does not claim resumed on failure", async () => {
    db.paused_at = "2026-10-10T00:00:00Z";
    const user = userEvent.setup();
    render(<Care />);
    await screen.findByText(/Recorrido en pausa/);
    db.fail = true;
    await user.click(
      screen.getByRole("button", { name: "Reanudar el proceso" }),
    );
    await screen.findByRole("alert");
    expect(db.paused_at).not.toBeNull();
    expect(screen.queryByText("Recorrido disponible.")).toBeNull();
    db.fail = false;
    await user.click(screen.getByRole("button", { name: "Consultar estado" }));
    await screen.findByText(/Recorrido en pausa/);
    await user.click(
      screen.getByRole("button", { name: "Reanudar el proceso" }),
    );
    await ready();
  });
  it("keeps grounding available on load failure", async () => {
    db.fail = true;
    render(<Care />);
    await screen.findByRole("alert");
    expect(
      screen.getByRole("button", { name: "Volver al cuerpo" }),
    ).toBeEnabled();
    expect(
      screen.getByRole("button", { name: "Pausar el proceso" }),
    ).toBeDisabled();
  });
  it("prevents stage completion while paused", async () => {
    db.paused_at = "2026-10-10T00:00:00Z";
    let context!: ReturnType<typeof useStages>;
    function Probe() {
      context = useStages();
      return null;
    }
    render(
      <StageProvider>
        <Probe />
      </StageProvider>,
    );
    await waitFor(() => expect(context.pause.paused).toBe(true));
    const result = await context.completeStageWithData(7, {
      thought: "mi pensamiento",
      emotion: "calma",
      action: "escribo",
      notes: "",
    });
    expect(result.success).toBe(false);
    expect(context.currentStage).toBe(7);
    expect(db.writes).toEqual([]);
  });
});

it("protects a direct journey URL after reload while leaving saved stage intact", async () => {
  db.paused_at = "2026-10-10T00:00:00Z";
  const location = memoryLocation({ path: "/journey/7" });
  function RouteProbe() {
    const [path] = location.hook();
    return <p data-route>{path}</p>;
  }
  function Gate() {
    return (
      <JourneyPauseGate pause={useProcessPause("person")}>
        <p>Etapa editable</p>
      </JourneyPauseGate>
    );
  }
  render(
    <Router hook={location.hook}>
      <RouteProbe />
      <Gate />
    </Router>,
  );
  expect(screen.queryByText("Etapa editable")).toBeNull();
  await waitFor(() =>
    expect(window.document.querySelector("[data-route]")?.textContent).toBe(
      "/dashboard",
    ),
  );
  expect(db.records[0].stage_number).toBe(7);
});

it("cancels the pause dialog with Escape without writing", async () => {
  const user = userEvent.setup();
  render(<Care />);
  await ready();
  const trigger = screen.getByRole("button", { name: "Pausar el proceso" });
  await user.click(trigger);
  await user.keyboard("{Escape}");
  await waitFor(() => expect(trigger).toHaveFocus());
  expect(db.writes).toEqual([]);
});

it("allows the current stage again after a successful resume and reload", async () => {
  db.paused_at = "2026-10-10T00:00:00Z";
  const user = userEvent.setup();
  const first = render(<Care />);
  await screen.findByText(/Recorrido en pausa/);
  await user.click(screen.getByRole("button", { name: "Reanudar el proceso" }));
  await ready();
  first.unmount();
  function Gate() {
    return (
      <JourneyPauseGate pause={useProcessPause("person")}>
        <p>Etapa editable</p>
      </JourneyPauseGate>
    );
  }
  render(<Gate />);
  expect(await screen.findByText("Etapa editable")).toBeVisible();
  expect(db.records[0].stage_number).toBe(7);
});
