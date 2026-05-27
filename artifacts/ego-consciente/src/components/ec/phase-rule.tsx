import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type EcPhase = "observacion" | "reconocimiento" | "integracion" | "congruencia";

interface PhaseRuleProps extends HTMLAttributes<HTMLDivElement> {
  phase: EcPhase;
  label: string;
  range?: string;
}

const PHASE_ACCENT: Record<EcPhase, string> = {
  observacion: "text-[hsl(var(--oliva))]",
  reconocimiento: "text-[hsl(var(--terracota))]",
  integracion: "text-[hsl(var(--ambar))]",
  congruencia: "text-[hsl(var(--tierra))]",
};

export function PhaseRule({
  phase,
  label,
  range,
  className,
  ...rest
}: PhaseRuleProps) {
  return (
    <div
      className={cn("flex items-center gap-4 py-3", className)}
      {...rest}
    >
      <span className={cn("ec-eyebrow", PHASE_ACCENT[phase])}>{label}</span>
      <span className="flex-1 h-px bg-[hsl(var(--warm-line-soft))]" />
      {range && <span className="ec-meta">{range}</span>}
    </div>
  );
}
