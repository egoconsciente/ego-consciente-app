import type { ReactNode } from "react";
import { Redirect } from "wouter";
import type { useProcessPause } from "@/lib/process-pause";

export function JourneyPauseGate({
  pause,
  children,
}: {
  pause: ReturnType<typeof useProcessPause>;
  children: ReactNode;
}) {
  if (pause.loading)
    return <p role="status">Consultando estado del recorrido…</p>;
  if (pause.paused || pause.error) return <Redirect to="/dashboard" />;
  return <>{children}</>;
}
