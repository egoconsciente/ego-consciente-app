import { ProcessCare } from "@/components/process-care";
import { AppLayout } from "@/components/layout/app-layout";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { useStages } from "@/lib/stage-context";
import {
  ArrowRight,
  BookOpen,
  MessageCircle,
  Clock,
  Compass,
} from "lucide-react";
import { motion } from "framer-motion";
import { TOTAL_STAGES, type StageDefinition } from "@/lib/stages";
import { EcSigil, StageNumeral } from "@/components/ec";
import { respectsReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";
import {
  Step72Card,
} from "@/components/safety";

const PHASES = [
  { name: "Observación", start: 1, end: 10 },
  { name: "Reconocimiento", start: 11, end: 20 },
  { name: "Integración", start: 21, end: 30 },
  { name: "Congruencia", start: 31, end: 40 },
] as const;

// ─────────────────────────────────────────────────────────────
//  PRE-PROCESS DASHBOARD
// ─────────────────────────────────────────────────────────────
function PreProcessDashboard({ userName }: { userName: string }) {
  const reduced = respectsReducedMotion();
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 py-10 lg:py-14">
        <header className="mb-10 lg:mb-12">
          <p className="ec-eyebrow text-[hsl(var(--terracota))]">
            Antes de empezar
          </p>
          <h1 className="mt-3 ec-serif text-3xl sm:text-4xl lg:text-5xl leading-[1.05] text-[hsl(var(--tierra-deep))]">
            Hola, {userName}.
          </h1>
          <p className="mt-3 ec-serif-italic text-base sm:text-lg text-[hsl(var(--ink-soft))]">
            Tu proceso de observación te espera.
          </p>
        </header>

        <motion.section
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0 : 0.7, ease: [0.22, 0.61, 0.36, 1] }}
          className="paper-surface rounded-3xl px-6 py-8 sm:px-10 sm:py-12 relative overflow-hidden"
          aria-label="Estado pre-proceso"
        >
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(60% 60% at 80% 0%, hsl(var(--ambar-soft) / 0.18) 0%, transparent 65%)",
            }}
          />
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-[auto,1fr] gap-6 md:gap-8 items-center">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto md:mx-0 flex items-center justify-center">
              {!reduced && (
                <motion.span
                  aria-hidden
                  className="absolute inset-0 rounded-full"
                  style={{ border: "1px solid hsl(var(--warm-line) / 0.55)" }}
                  animate={{ scale: [1, 1.06, 1], opacity: [0.5, 0.85, 0.5] }}
                  transition={{
                    duration: 6.5,
                    repeat: Infinity,
                    ease: [0.45, 0.05, 0.55, 0.95],
                  }}
                />
              )}
              {!reduced && (
                <motion.span
                  aria-hidden
                  className="absolute inset-3 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, hsl(var(--ambar-soft) / 0.40) 0%, transparent 70%)",
                  }}
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
              <EcSigil
                variant="hairline"
                size={72}
                className="relative text-[hsl(var(--tierra-deep))]"
              />
            </div>

            <div>
              <p className="ec-eyebrow text-[hsl(var(--ink-soft))]">
                El umbral
              </p>
              <h2 className="mt-2 ec-serif text-2xl sm:text-[28px] leading-snug text-[hsl(var(--tierra-deep))]">
                Todavía no has cruzado el umbral.
              </h2>
              <p className="mt-3 text-[15px] sm:text-base text-[hsl(var(--ink))] leading-relaxed max-w-md">
                Al iniciar, comienzan tus 40 etapas de observación —
                pensamiento, emoción y acción, una a la vez.
              </p>

              <Link
                href="/ego-intro"
                className={cn(
                  "mt-6 inline-flex items-center justify-center gap-2",
                  "px-7 py-3.5 rounded-full",
                  "bg-[hsl(var(--tierra-deep))] text-[hsl(var(--paper))]",
                  "text-sm sm:text-base font-medium tracking-wide",
                  "shadow-md shadow-[hsl(var(--tierra-deep)/0.18)]",
                  "motion-safe:hover:shadow-lg motion-safe:hover:-translate-y-[1px] motion-safe:transition-all motion-safe:duration-300",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--terracota))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--paper))]",
                )}
              >
                <span>Ir al umbral</span>
                <ArrowRight className="w-4 h-4" strokeWidth={1.8} />
              </Link>
            </div>
          </div>
        </motion.section>

        <p className="mt-8 ec-meta italic text-[hsl(var(--ink-soft))] text-center max-w-md mx-auto">
          No vamos a diagnosticarte. No vamos a etiquetarte. Vamos a observar
          cómo opera tu sistema.
        </p>
      </div>
    </AppLayout>
  );
}

// ─────────────────────────────────────────────────────────────
//  ACTIVE DASHBOARD
// ─────────────────────────────────────────────────────────────
function ActiveDashboard({ userName }: { userName: string }) {
  const {
    pause,
    currentStage,
    completedCount,
    getCurrentStageDefinition,
    stages,
    isLoading,
  } = useStages();
  const stageDef = getCurrentStageDefinition();
  const reduced = respectsReducedMotion();

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-10 lg:py-14">
          <div
            className="paper-surface rounded-3xl p-8 sm:p-10 animate-pulse"
            aria-label="Cargando estado del proceso"
          >
            <div className="h-3 w-24 rounded bg-[hsl(var(--warm-line-soft))] mb-5" />
            <div className="h-8 w-3/4 rounded bg-[hsl(var(--warm-line-soft))] mb-3" />
            <div className="h-4 w-2/3 rounded bg-[hsl(var(--warm-line-soft))] mb-8" />
            <div className="h-[3px] w-full rounded bg-[hsl(var(--warm-line-soft))]" />
          </div>
        </div>
      </AppLayout>
    );
  }

  const progressPct = Math.round((completedCount / TOTAL_STAGES) * 100);
  const currentPhase = stageDef?.phase ?? "Observación";

  // Phase completion map (no streaks, no medals — just truth)
  const phaseStats = PHASES.map((p) => {
    const total = p.end - p.start + 1;
    const done = stages.filter(
      (s) =>
        s.stageNumber >= p.start &&
        s.stageNumber <= p.end &&
        s.status === "completed",
    ).length;
    return {
      ...p,
      total,
      done,
      isActive: currentStage >= p.start && currentStage <= p.end,
    };
  });

  const nextAction =
    stageDef?.visibleObjective ?? stageDef?.shortDescription ?? null;
  const egoCopy = stageDef?.dailyPhrase ?? null;

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8 lg:space-y-10">
        <ProcessCare pause={pause} />

        {/* Greeting */}
        <header>
          <p className="ec-eyebrow text-[hsl(var(--terracota))]">
            Estado del proceso
          </p>
          <h1 className="mt-2 ec-serif text-2xl sm:text-3xl lg:text-4xl leading-tight text-[hsl(var(--tierra-deep))]">
            Hola, {userName}.
          </h1>
        </header>

        {/* Cycle Status Card */}
        <CycleStatusCard
          currentStage={currentStage}
          currentPhase={currentPhase}
          stageDef={stageDef}
          progressPct={progressPct}
          completedCount={completedCount}
          nextAction={nextAction}
          egoCopy={egoCopy}
          reduced={reduced}
        />

        {/* Today + Phase Map */}
        <section className="grid grid-cols-1 lg:grid-cols-[1.4fr,1fr] gap-6">
          {!pause.paused && !pause.loading && !pause.error && <TodayCard
            stageNumber={currentStage}
            stageDef={stageDef}
            reduced={reduced}
          />}
          <PhaseMap phaseStats={phaseStats} />
        </section>

        {/* Secondary access */}
        <section
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          aria-label="Accesos secundarios"
        >
          <SecondaryAccess
            href="/chat"
            Icon={MessageCircle}
            label="Conversación con el Guía"
            hint="Para nombrar lo que aparece."
          />
          <SecondaryAccess
            href="/reflection"
            Icon={BookOpen}
            label="Registro P-E-A"
            hint="Pensamiento, emoción, acción."
          />
        </section>

        {/* 72h step (placeholder hasta que haya datos reales) */}
        <Step72Card />
      </div>

    </AppLayout>
  );
}

// ─────────────────────────────────────────────────────────────
//  CYCLE STATUS CARD
// ─────────────────────────────────────────────────────────────
function CycleStatusCard({
  currentStage,
  currentPhase,
  stageDef,
  progressPct,
  completedCount,
  nextAction,
  egoCopy,
  reduced,
}: {
  currentStage: number;
  currentPhase: string;
  stageDef: StageDefinition | undefined;
  progressPct: number;
  completedCount: number;
  nextAction: string | null;
  egoCopy: string | null;
  reduced: boolean;
}) {
  return (
    <motion.section
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0 : 0.7, ease: [0.22, 0.61, 0.36, 1] }}
      className="living-glass rounded-3xl p-6 sm:p-9 relative overflow-hidden"
      aria-label="Estado del ciclo actual"
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(55% 55% at 90% 0%, hsl(var(--ambar-soft) / 0.18) 0%, transparent 65%), radial-gradient(50% 50% at 0% 100%, hsl(var(--paper-altar)) 0%, transparent 65%)",
        }}
      />

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-[auto,1fr] gap-6 md:gap-8">
        {/* Stage numeral */}
        <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-3">
          <div className="relative">
            <StageNumeral n={currentStage} total={TOTAL_STAGES} scale="lg" />
            {!reduced && (
              <motion.span
                aria-hidden
                className="absolute inset-[-10px] rounded-full"
                style={{ border: "1px solid hsl(var(--warm-line) / 0.4)" }}
                animate={{ scale: [1, 1.05, 1], opacity: [0.35, 0.7, 0.35] }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: [0.45, 0.05, 0.55, 0.95],
                }}
              />
            )}
          </div>
          <div className="md:mt-2">
            <p className="ec-eyebrow text-[hsl(var(--ink-soft))]">Fase</p>
            <p className="ec-serif text-lg text-[hsl(var(--tierra-deep))] mt-1">
              {currentPhase}
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="min-w-0">
          <div className="flex items-baseline justify-between gap-4 mb-1">
            <p className="ec-eyebrow text-[hsl(var(--terracota))]">
              Etapa {currentStage} <span className="text-[hsl(var(--ink-soft))]">de {TOTAL_STAGES}</span>
            </p>
            <p className="ec-meta text-[hsl(var(--ink-soft))]">
              {completedCount} completadas · {progressPct}%
            </p>
          </div>

          {stageDef && (
            <h2 className="ec-serif text-2xl sm:text-[28px] leading-snug text-[hsl(var(--tierra-deep))]">
              {stageDef.title}
            </h2>
          )}

          {/* Hairline progress over 40 stages */}
          <div
            className="mt-5 h-[3px] w-full rounded-full bg-[hsl(var(--warm-line-soft))] overflow-hidden"
            role="progressbar"
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progreso de 40 etapas"
          >
            <motion.div
              className="h-full rounded-full bg-[hsl(var(--tierra-deep))]"
              initial={reduced ? false : { width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: reduced ? 0 : 1.1, ease: [0.22, 0.61, 0.36, 1] }}
            />
          </div>

          {/* Next action */}
          {nextAction && (
            <div className="mt-6 flex items-start gap-3">
              <Compass
                className="w-4 h-4 mt-[3px] shrink-0 text-[hsl(var(--terracota))]"
                strokeWidth={1.6}
              />
              <div className="min-w-0">
                <p className="ec-eyebrow text-[hsl(var(--ink-soft))]">
                  Siguiente acción
                </p>
                <p className="mt-1 text-[15px] sm:text-base text-[hsl(var(--ink))] leading-relaxed">
                  {nextAction}
                </p>
              </div>
            </div>
          )}

          {/* Ego copy */}
          {egoCopy && (
            <div className="mt-6 pl-4 border-l border-[hsl(var(--warm-line))]">
              <p className="ec-eyebrow text-[hsl(var(--ink-soft))]">El Guía</p>
              <p className="mt-2 ec-serif-italic text-[15px] sm:text-base leading-relaxed text-[hsl(var(--tierra-deep))]">
                {egoCopy}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
}

// ─────────────────────────────────────────────────────────────
//  TODAY CARD — "Hoy toca observar…"
// ─────────────────────────────────────────────────────────────
function TodayCard({
  stageNumber,
  stageDef,
  reduced,
}: {
  stageNumber: number;
  stageDef: StageDefinition | undefined;
  reduced: boolean;
}) {
  const canContinue = !!stageDef;
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduced ? 0 : 0.7,
        delay: reduced ? 0 : 0.1,
        ease: [0.22, 0.61, 0.36, 1],
      }}
      className="paper-surface rounded-3xl p-6 sm:p-8 flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="ec-eyebrow text-[hsl(var(--terracota))]">Hoy</p>
        {stageDef && (
          <span className="inline-flex items-center gap-1.5 ec-meta text-[hsl(var(--ink-soft))]">
            <Clock className="w-3.5 h-3.5" strokeWidth={1.6} />~
            {stageDef.estimatedMinutes} min
          </span>
        )}
      </div>

      <h3 className="ec-serif text-xl sm:text-2xl leading-snug text-[hsl(var(--tierra-deep))]">
        Hoy toca observar…
      </h3>

      {stageDef && (
        <p className="mt-3 text-[15px] sm:text-base text-[hsl(var(--ink))] leading-relaxed flex-1">
          {stageDef.shortDescription}
        </p>
      )}

      {canContinue ? (
        <Link
          href={`/journey/${stageNumber}`}
          className={cn(
            "mt-6 group inline-flex items-center justify-center gap-2",
            "px-6 py-3.5 rounded-full",
            "bg-[hsl(var(--tierra-deep))] text-[hsl(var(--paper))]",
            "text-sm sm:text-base font-medium tracking-wide",
            "shadow-md shadow-[hsl(var(--tierra-deep)/0.18)]",
            "motion-safe:hover:shadow-lg motion-safe:hover:-translate-y-[1px] motion-safe:transition-all motion-safe:duration-300",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--terracota))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--paper))]",
          )}
        >
          <span>Continuar etapa</span>
          <ArrowRight
            className="w-4 h-4 motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:translate-x-0.5"
            strokeWidth={1.8}
          />
        </Link>
      ) : (
        <button
          type="button"
          disabled
          className={cn(
            "mt-6 inline-flex items-center justify-center gap-2",
            "px-6 py-3.5 rounded-full warm-border",
            "bg-[hsl(var(--paper-veil))] text-[hsl(var(--ink-soft))]",
            "text-sm sm:text-base cursor-not-allowed",
          )}
        >
          Etapa no disponible
        </button>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
//  PHASE MAP — 4 phases, hairline bars
// ─────────────────────────────────────────────────────────────
function PhaseMap({
  phaseStats,
}: {
  phaseStats: {
    name: string;
    start: number;
    end: number;
    total: number;
    done: number;
    isActive: boolean;
  }[];
}) {
  return (
    <div
      className="paper-surface rounded-3xl p-6 sm:p-7"
      aria-label="Mapa de progreso por fase"
    >
      <div className="flex items-center justify-between mb-5">
        <p className="ec-eyebrow text-[hsl(var(--ink-soft))]">Fases</p>
        <Link
          href="/progress"
          className="ec-meta italic text-[hsl(var(--ink-soft))] hover:text-[hsl(var(--tierra-deep))] transition-colors inline-flex items-center gap-1 focus:outline-none focus-visible:underline"
        >
          Ver recorrido
          <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.6} />
        </Link>
      </div>

      <ul className="space-y-4">
        {phaseStats.map((p) => {
          const pct = Math.round((p.done / p.total) * 100);
          return (
            <li key={p.name}>
              <div className="flex items-baseline justify-between mb-1.5">
                <span
                  className={cn(
                    "text-[13px] sm:text-sm",
                    p.isActive
                      ? "ec-serif text-[hsl(var(--tierra-deep))]"
                      : "text-[hsl(var(--ink-soft))]",
                  )}
                >
                  {p.name}
                </span>
                <span className="ec-meta text-[hsl(var(--ink-soft))]">
                  {p.done}/{p.total}
                </span>
              </div>
              <div className="h-[2px] w-full rounded-full bg-[hsl(var(--warm-line-soft))] overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full motion-safe:transition-all motion-safe:duration-700",
                    p.isActive
                      ? "bg-[hsl(var(--terracota))]"
                      : "bg-[hsl(var(--tierra-deep))]",
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  SECONDARY ACCESS TILE
// ─────────────────────────────────────────────────────────────
function SecondaryAccess({
  href,
  Icon,
  label,
  hint,
}: {
  href: string;
  Icon: typeof BookOpen;
  label: string;
  hint: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "paper-surface rounded-2xl px-5 py-4 group",
        "flex items-center gap-4",
        "hover:bg-[hsl(var(--paper-veil))] motion-safe:transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--terracota))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--paper))]",
      )}
    >
      <span className="shrink-0 w-10 h-10 rounded-full inline-flex items-center justify-center bg-[hsl(var(--paper-veil))] warm-border-soft text-[hsl(var(--tierra-deep))]">
        <Icon className="w-4 h-4" strokeWidth={1.6} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="ec-serif text-[15px] sm:text-base text-[hsl(var(--tierra-deep))]">
          {label}
        </p>
        <p className="ec-meta text-[hsl(var(--ink-soft))] mt-0.5 truncate">
          {hint}
        </p>
      </div>
      <ArrowRight
        className="w-4 h-4 shrink-0 text-[hsl(var(--ink-soft))] group-hover:text-[hsl(var(--tierra-deep))] motion-safe:group-hover:translate-x-0.5 motion-safe:transition-all"
        strokeWidth={1.6}
      />
    </Link>
  );
}


// ─────────────────────────────────────────────────────────────
//  ENTRY POINT
// ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, portalComplete } = useAuth();
  const userName = user?.name || "Caminante";

  if (!portalComplete) {
    return <PreProcessDashboard userName={userName} />;
  }

  return <ActiveDashboard userName={userName} />;
}
