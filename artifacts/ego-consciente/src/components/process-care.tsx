import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GroundingSheet, PauseProcessDialog } from "./safety";
import type { useProcessPause } from "@/lib/process-pause";

export function ProcessCare({
  pause,
}: {
  pause: ReturnType<typeof useProcessPause>;
}) {
  const [grounding, setGrounding] = useState(false);
  const [confirm, setConfirm] = useState(false);
  return (
    <section
      aria-label="Cuidado del proceso"
      className="paper-surface rounded-3xl p-6 space-y-4"
    >
      <h2 className="ec-serif text-xl">A tu ritmo</h2>
      <p>
        Las 40 etapas no tienen un plazo. Puedes detenerte y volver cuando
        quieras.
      </p>
      <p role="status">
        {pause.loading
          ? "Consultando estado del recorrido…"
          : pause.error
            ? "Estado pendiente de verificar."
            : pause.paused
              ? "Recorrido en pausa. Tus registros guardados se conservan."
              : "Recorrido disponible."}
      </p>
      {pause.error && (
        <div role="alert">
          <p>{pause.error}</p>
          <Button disabled={pause.busy} onClick={() => void pause.reload()}>
            Consultar estado
          </Button>
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={() => setGrounding(true)}>
          Volver al cuerpo
        </Button>
        <Button
          disabled={pause.loading || pause.busy || !!pause.error}
          onClick={() =>
            pause.paused ? void pause.setPaused(false) : setConfirm(true)
          }
        >
          {pause.busy
            ? "Guardando…"
            : pause.paused
              ? "Reanudar el proceso"
              : "Pausar el proceso"}
        </Button>
      </div>
      <GroundingSheet open={grounding} onClose={() => setGrounding(false)} />
      <PauseProcessDialog
        open={confirm}
        onCancel={() => setConfirm(false)}
        onConfirm={() => pause.setPaused(true)}
        busy={pause.busy}
        error={pause.error}
        onRetry={() => void pause.reload()}
      />
    </section>
  );
}
