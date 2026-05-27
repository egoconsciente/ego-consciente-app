import { AppLayout } from "@/components/layout/app-layout";
import { useStages } from "@/lib/stage-context";
import { STAGES, TOTAL_STAGES } from "@/lib/stages";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Lock } from "lucide-react";
import { Link } from "wouter";
import { respectsReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useState } from "react";

// Ceremonial phase labels (presentation only — canonical data names live in stages.ts)
type CeremonialPhase = {
  index: 1 | 2 | 3 | 4;
  label: string;
  canonicalName: string; // matches stages.ts
  micro: string;
  start: number;
  end: number;
  /** subtle hue used for inner halo + active node */
  hue: "ambar" | "terracota" | "tierra" | "ambar-soft";
};

const CEREMONIAL_PHASES: CeremonialPhase[] = [
  {
    index: 1,
    label: "Revelación",
    canonicalName: "Observación",
    micro: "Lo que aún no habías querido ver.",
    start: 1,
    end: 10,
    hue: "ambar-soft",
  },
  {
    index: 2,
    label: "Confrontación",
    canonicalName: "Reconocimiento",
    micro: "Cara a cara con tu sistema.",
    start: 11,
    end: 20,
    hue: "terracota",
  },
  {
    index: 3,
    label: "Reconfiguración",
    canonicalName: "Integración",
    micro: "Reescribir lo que opera en automático.",
    start: 21,
    end: 30,
    hue: "ambar",
  },
  {
    index: 4,
    label: "Integración",
    canonicalName: "Congruencia",
    micro: "Vivir desde la nueva coherencia.",
    start: 31,
    end: 40,
    hue: "tierra",
  },
];

// Normalized constellation points per phase (x%, y%) — organic, never on a grid.
// 10 points; the 10th sits centered and lower → drawn as the milestone (D10/D20/D30/D40).
const CONSTELLATION: Array<{ x: number; y: number }> = [
  { x: 22, y: 6 },
  { x: 64, y: 13 },
  { x: 36, y: 22 },
  { x: 78, y: 30 },
  { x: 24, y: 39 },
  { x: 58, y: 47 },
  { x: 34, y: 57 },
  { x: 72, y: 64 },
  { x: 30, y: 76 },
  { x: 56, y: 92 }, // milestone
];

const HUE_VAR: Record<CeremonialPhase["hue"], string> = {
  ambar: "var(--ambar)",
  "ambar-soft": "var(--ambar-soft)",
  terracota: "var(--terracota)",
  tierra: "var(--tierra-deep)",
};

export default function Journey() {
  const { currentStage, completedCount, getStageProgress } = useStages();
  const reduced = respectsReducedMotion();
  const progressPct = Math.round((completedCount / TOTAL_STAGES) * 100);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-8 lg:py-12 pb-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 lg:mb-10">
          <Link
            href="/dashboard"
            aria-label="Volver al panel"
            className={cn(
              "shrink-0 w-10 h-10 rounded-full inline-flex items-center justify-center",
              "warm-border bg-[hsl(var(--paper))] text-[hsl(var(--ink))]",
              "hover:bg-[hsl(var(--paper-veil))] motion-safe:transition-colors",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--terracota))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--paper))]",
            )}
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.6} />
          </Link>
          <div className="min-w-0">
            <p className="ec-eyebrow text-[hsl(var(--terracota))]">El mapa</p>
            <h1 className="mt-1 ec-serif text-2xl sm:text-3xl lg:text-4xl leading-tight text-[hsl(var(--tierra-deep))]">
              Constelación de 40 etapas
            </h1>
            <p className="mt-1.5 ec-meta italic text-[hsl(var(--ink-soft))]">
              Cuatro fases · diez etapas cada una · una sola observación a la
              vez.
            </p>
          </div>
        </div>

        {/* Summary band */}
        <section
          className="living-glass rounded-3xl px-6 py-5 sm:px-8 sm:py-6 mb-10 lg:mb-12 grid grid-cols-3 gap-4"
          aria-label="Resumen del proceso"
        >
          <SummaryCell label="Etapa actual" value={String(currentStage).padStart(2, "0")} />
          <SummaryCell label="Completadas" value={`${completedCount}`} />
          <SummaryCell label="Progreso" value={`${progressPct}%`} />
        </section>

        {/* Constellation per phase */}
        <div className="space-y-10 lg:space-y-14">
          {CEREMONIAL_PHASES.map((phase) => (
            <PhaseConstellation
              key={phase.index}
              phase={phase}
              currentStage={currentStage}
              getStageProgress={getStageProgress}
              reduced={reduced}
            />
          ))}
        </div>

        {/* Closing whisper */}
        <p className="mt-14 text-center ec-serif-italic text-[15px] text-[hsl(var(--ink-soft))] max-w-md mx-auto">
          No se trata de avanzar más rápido. Se trata de no dejar de observar.
        </p>
      </div>
    </AppLayout>
  );
}

function SummaryCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 text-center sm:text-left">
      <p className="ec-eyebrow text-[hsl(var(--ink-soft))]">{label}</p>
      <p className="mt-1.5 ec-serif text-2xl sm:text-3xl text-[hsl(var(--tierra-deep))]">
        {value}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  PHASE CONSTELLATION
// ─────────────────────────────────────────────────────────────
function PhaseConstellation({
  phase,
  currentStage,
  getStageProgress,
  reduced,
}: {
  phase: CeremonialPhase;
  currentStage: number;
  getStageProgress: (n: number) => ReturnType<ReturnType<typeof useStages>["getStageProgress"]>;
  reduced: boolean;
}) {
  const stagesInPhase = STAGES.filter(
    (s) => s.stageNumber >= phase.start && s.stageNumber <= phase.end,
  );
  const doneInPhase = stagesInPhase.filter(
    (s) => getStageProgress(s.stageNumber).status === "completed",
  ).length;
  const isPhaseActive =
    currentStage >= phase.start && currentStage <= phase.end;
  const hue = `hsl(${HUE_VAR[phase.hue]})`;

  // Build smooth polyline path (S-curve through points)
  const pathD = (() => {
    const pts = CONSTELLATION;
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const midY = (prev.y + curr.y) / 2;
      d += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`;
    }
    return d;
  })();

  return (
    <motion.section
      initial={reduced ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: reduced ? 0 : 0.7, ease: [0.22, 0.61, 0.36, 1] }}
      className="paper-surface rounded-3xl relative"
      aria-labelledby={`phase-${phase.index}-title`}
    >
      {/* Subtle phase halo */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isPhaseActive
            ? `radial-gradient(70% 60% at 50% 0%, ${hue.replace(")", " / 0.18)")} 0%, transparent 70%)`
            : `radial-gradient(70% 60% at 50% 0%, ${hue.replace(")", " / 0.08)")} 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-[1fr,auto] gap-4 md:gap-6 px-6 pt-7 sm:px-8 sm:pt-8">
        <div className="min-w-0">
          <p
            className="ec-eyebrow"
            style={{ color: isPhaseActive ? hue : "hsl(var(--ink-soft))" }}
          >
            Fase {phase.index} · {phase.canonicalName}
          </p>
          <h2
            id={`phase-${phase.index}-title`}
            className="mt-2 ec-serif text-2xl sm:text-[26px] leading-snug text-[hsl(var(--tierra-deep))]"
          >
            {phase.label}
          </h2>
          <p className="mt-1.5 ec-serif-italic text-[15px] text-[hsl(var(--ink-soft))] max-w-sm">
            {phase.micro}
          </p>
        </div>

        <div className="md:text-right">
          <p className="ec-eyebrow text-[hsl(var(--ink-soft))]">Avance</p>
          <p className="mt-1.5 ec-serif text-xl text-[hsl(var(--tierra-deep))]">
            {doneInPhase}<span className="text-[hsl(var(--ink-soft))]">/10</span>
          </p>
          <div
            className="mt-2 h-[2px] w-28 ml-auto rounded-full bg-[hsl(var(--warm-line-soft))] overflow-hidden"
            role="progressbar"
            aria-valuenow={doneInPhase}
            aria-valuemin={0}
            aria-valuemax={10}
            aria-label={`Avance de la fase ${phase.label}`}
          >
            <div
              className="h-full rounded-full motion-safe:transition-all motion-safe:duration-700"
              style={{
                width: `${(doneInPhase / 10) * 100}%`,
                background: isPhaseActive ? hue : "hsl(var(--tierra-deep))",
              }}
            />
          </div>
        </div>
      </div>

      {/* Constellation canvas — extra bottom padding so milestone caption never clips */}
      <div
        className="relative mt-6 mx-auto w-full max-w-md px-6 sm:px-8 pb-14"
        style={{ aspectRatio: "5 / 8" }}
      >
        {/* Connecting curve */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full pointer-events-none"
          aria-hidden
        >
          <path
            d={pathD}
            fill="none"
            stroke="hsl(var(--warm-line))"
            strokeOpacity={0.55}
            strokeWidth={0.35}
            strokeLinecap="round"
            strokeDasharray="0.6 0.9"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Nodes */}
        {stagesInPhase.map((stage, idx) => {
          const point = CONSTELLATION[idx];
          const isMilestone = idx === 9;
          const stageNumber = stage.stageNumber;
          const progress = getStageProgress(stageNumber);
          const isCompleted = progress.status === "completed";
          const isCurrent =
            stageNumber === currentStage && progress.status !== "completed";
          const isLocked =
            progress.status === "locked" && stageNumber !== currentStage;

          return (
            <ConstellationNode
              key={stageNumber}
              stageNumber={stageNumber}
              title={stage.title}
              estimatedMinutes={stage.estimatedMinutes}
              x={point.x}
              y={point.y}
              isMilestone={isMilestone}
              isCompleted={isCompleted}
              isCurrent={isCurrent}
              isLocked={isLocked}
              hue={hue}
              reduced={reduced}
            />
          );
        })}
      </div>
    </motion.section>
  );
}

// ─────────────────────────────────────────────────────────────
//  CONSTELLATION NODE
// ─────────────────────────────────────────────────────────────
function ConstellationNode({
  stageNumber,
  title,
  estimatedMinutes,
  x,
  y,
  isMilestone,
  isCompleted,
  isCurrent,
  isLocked,
  hue,
  reduced,
}: {
  stageNumber: number;
  title: string;
  estimatedMinutes: number;
  x: number;
  y: number;
  isMilestone: boolean;
  isCompleted: boolean;
  isCurrent: boolean;
  isLocked: boolean;
  hue: string;
  reduced: boolean;
}) {
  const [softNudge, setSoftNudge] = useState(false);
  const size = isMilestone ? 64 : 44; // touch target ≥44

  // Determine visual state
  const stateLabel = isCurrent
    ? "Etapa actual"
    : isCompleted
      ? "Completada"
      : isLocked
        ? "Aún no disponible"
        : "Disponible";

  const baseStyle: React.CSSProperties = {
    left: `${x}%`,
    top: `${y}%`,
    width: size,
    height: size,
    transform: "translate(-50%, -50%)",
  };

  const ariaLabel = `Etapa ${stageNumber} — ${title}. ${stateLabel}.`;

  // Inner visual
  const Marker = () => {
    if (isMilestone) {
      return (
        <span
          className={cn(
            "ec-serif",
            isCompleted
              ? "text-[hsl(var(--paper))]"
              : isCurrent
                ? "text-[hsl(var(--paper))]"
                : isLocked
                  ? "text-[hsl(var(--ink-soft))]/50"
                  : "text-[hsl(var(--tierra-deep))]",
          )}
          style={{ fontSize: 16, letterSpacing: "0.05em" }}
        >
          D{stageNumber}
        </span>
      );
    }
    if (isCompleted) {
      return (
        <Check
          className="w-3.5 h-3.5 text-[hsl(var(--paper))]"
          strokeWidth={2.2}
        />
      );
    }
    if (isCurrent) {
      return (
        <span className="block w-2 h-2 rounded-full bg-[hsl(var(--paper))]" />
      );
    }
    if (isLocked) {
      return (
        <Lock
          className="w-3 h-3 text-[hsl(var(--ink-soft))]/60"
          strokeWidth={1.6}
        />
      );
    }
    return (
      <span className="ec-meta text-[hsl(var(--tierra-deep))]">
        {String(stageNumber).padStart(2, "0")}
      </span>
    );
  };

  const visualClasses = cn(
    "absolute rounded-full inline-flex items-center justify-center",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--paper))] focus-visible:ring-[hsl(var(--terracota))]",
    isLocked && "cursor-default",
  );

  // Background fill
  const backgroundStyle: React.CSSProperties = (() => {
    if (isCompleted)
      return {
        background: "hsl(var(--tierra-deep))",
        border: `1px solid ${hue}`,
      };
    if (isCurrent)
      return {
        background: hue,
        boxShadow: `0 0 0 1px ${hue.replace(")", " / 0.35)")}, 0 6px 18px ${hue.replace(")", " / 0.28)")}`,
      };
    if (isLocked)
      return {
        background: "hsl(var(--paper))",
        border: "1px solid hsl(var(--warm-line-soft))",
        opacity: 0.55,
      };
    // available (unlocked & not current, e.g. milestone reached non-sequential)
    return {
      background: "hsl(var(--paper))",
      border: "1px solid hsl(var(--warm-line))",
    };
  })();

  // Locked → soft feedback (no aggressive error)
  if (isLocked) {
    return (
      <div className="absolute" style={baseStyle}>
        <button
          type="button"
          aria-label={ariaLabel}
          aria-disabled="true"
          onClick={() => {
            setSoftNudge(true);
            window.setTimeout(() => setSoftNudge(false), 1400);
          }}
          className={cn(
            visualClasses,
            "inset-0",
            !reduced && softNudge && "animate-[pulse_0.6s_ease-in-out_1]",
          )}
          style={backgroundStyle}
        >
          <Marker />
        </button>
        {softNudge && (
          <motion.span
            role="status"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.35 }}
            className={cn(
              "absolute left-1/2 -translate-x-1/2 top-full mt-2 whitespace-nowrap",
              "ec-meta italic text-[hsl(var(--ink-soft))]",
              "bg-[hsl(var(--paper))] warm-border rounded-full px-3 py-1 shadow-sm",
            )}
          >
            Llegará a su tiempo
          </motion.span>
        )}
      </div>
    );
  }

  return (
    <div className="absolute" style={baseStyle}>
      <Link
        href={`/journey/${stageNumber}`}
        aria-label={ariaLabel}
        title={`Etapa ${stageNumber} — ${title} · ~${estimatedMinutes} min`}
        className={cn(visualClasses, "inset-0 group")}
        style={backgroundStyle}
      >
        {/* Breathing halo for current */}
        {isCurrent && !reduced && (
          <>
            <motion.span
              aria-hidden
              className="absolute rounded-full pointer-events-none"
              style={{
                inset: -10,
                border: `1px solid ${hue.replace(")", " / 0.55)")}`,
              }}
              animate={{ scale: [1, 1.18, 1], opacity: [0.55, 0.9, 0.55] }}
              transition={{
                duration: 5.5,
                repeat: Infinity,
                ease: [0.45, 0.05, 0.55, 0.95],
              }}
            />
            <motion.span
              aria-hidden
              className="absolute rounded-full pointer-events-none"
              style={{
                inset: -22,
                background: `radial-gradient(circle, ${hue.replace(")", " / 0.22)")} 0%, transparent 70%)`,
              }}
              animate={{ opacity: [0.5, 0.9, 0.5] }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </>
        )}
        <Marker />
      </Link>

      {/* Current label (motion-respectful: hidden when reduced to keep markup quiet) */}
      {isCurrent && !reduced && (
        <span
          className={cn(
            "absolute left-1/2 -translate-x-1/2 top-full mt-2 whitespace-nowrap",
            "ec-eyebrow",
          )}
          style={{ color: hue }}
        >
          Aquí
        </span>
      )}

      {/* Milestone caption */}
      {isMilestone && !isCurrent && (
        <span
          className={cn(
            "absolute left-1/2 -translate-x-1/2 top-full mt-2 whitespace-nowrap",
            "ec-meta italic text-[hsl(var(--ink-soft))]",
          )}
        >
          Cierre de fase
        </span>
      )}
    </div>
  );
}
