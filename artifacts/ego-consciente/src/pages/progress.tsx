import { useMemo } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { useStore } from "@/lib/store-context";
import { useStages } from "@/lib/stage-context";
import { TOTAL_STAGES, STAGES, getStage } from "@/lib/stages";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Clock,
  Compass,
  Sparkle,
} from "lucide-react";
import { Link } from "wouter";
import { respectsReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Step72Card } from "@/components/safety";

// Ceremonial phase labels matching Journey (presentation only)
type CeremonialPhase = {
  index: 1 | 2 | 3 | 4;
  label: string;
  canonicalName: string;
  micro: string;
  start: number;
  end: number;
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

const HUE_VAR: Record<CeremonialPhase["hue"], string> = {
  ambar: "var(--ambar)",
  "ambar-soft": "var(--ambar-soft)",
  terracota: "var(--terracota)",
  tierra: "var(--tierra-deep)",
};

const MILESTONES = [10, 20, 30, 40] as const;

export default function Progress() {
  const { reflections, isLoadingData } = useStore();
  const { currentStage, completedCount, stages, isLoading: isLoadingStages } =
    useStages();
  const reduced = respectsReducedMotion();

  const progressPct = Math.round((completedCount / TOTAL_STAGES) * 100);

  const completedStages = useMemo(
    () =>
      stages
        .filter((s) => s.status === "completed")
        .sort((a, b) => {
          // Most recent first by completedAt, then by stageNumber
          if (a.completedAt && b.completedAt) {
            return (
              new Date(b.completedAt).getTime() -
              new Date(a.completedAt).getTime()
            );
          }
          if (a.completedAt) return -1;
          if (b.completedAt) return 1;
          return b.stageNumber - a.stageNumber;
        }),
    [stages],
  );

  const sortedReflections = useMemo(
    () => [...reflections].sort((a, b) => b.day - a.day),
    [reflections],
  );

  const fade = (delay = 0) =>
    reduced
      ? { initial: false as const, animate: { opacity: 1 } }
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: 0.6,
            delay,
            ease: [0.22, 0.61, 0.36, 1] as [number, number, number, number],
          },
        };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 py-6 lg:py-10 pb-32">
        {/* Back */}
        <Link
          href="/dashboard"
          aria-label="Volver al panel"
          className={cn(
            "inline-flex items-center gap-2 px-3 py-2 rounded-full",
            "ec-meta italic text-[hsl(var(--ink-soft))]",
            "hover:text-[hsl(var(--tierra-deep))] motion-safe:transition-colors",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--terracota))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--paper))]",
          )}
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.6} />
          Volver al panel
        </Link>

        {/* Header */}
        <motion.header {...fade(0)} className="mt-6 mb-10">
          <p className="ec-eyebrow text-[hsl(var(--terracota))]">Tu recorrido</p>
          <h1 className="mt-1.5 ec-serif text-3xl sm:text-4xl lg:text-[40px] leading-tight text-[hsl(var(--tierra-deep))]">
            Mapa de integración
          </h1>
          <p className="mt-3 ec-serif-italic text-[15px] sm:text-base text-[hsl(var(--ink-soft))] max-w-2xl leading-relaxed">
            Lo que has observado, lo que estás integrando, y lo que aún no se
            abre. Una vista del proceso sin marcadores ni rachas.
          </p>
        </motion.header>

        {/* Global integration band */}
        <motion.section
          {...fade(0.05)}
          className="living-glass rounded-3xl px-6 py-7 sm:px-9 sm:py-8 mb-10 relative overflow-hidden"
          aria-label="Progreso global"
        >
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(55% 60% at 100% 0%, hsl(var(--ambar-soft) / 0.18) 0%, transparent 65%)",
            }}
          />
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-[1fr,auto] gap-6 sm:gap-8 items-end">
            <div className="min-w-0">
              <p className="ec-eyebrow text-[hsl(var(--ink-soft))]">
                Estás en la etapa
              </p>
              <p className="mt-2 ec-serif text-3xl sm:text-4xl text-[hsl(var(--tierra-deep))]">
                {String(currentStage).padStart(2, "0")}{" "}
                <span className="text-[hsl(var(--ink-soft))] text-xl sm:text-2xl">
                  / {TOTAL_STAGES}
                </span>
              </p>
              <p className="mt-2 ec-serif-italic text-[14px] text-[hsl(var(--ink-soft))]">
                {completedCount} etapa{completedCount === 1 ? "" : "s"}{" "}
                observada{completedCount === 1 ? "" : "s"} ·{" "}
                {TOTAL_STAGES - completedCount} por venir
              </p>
            </div>
            <div className="sm:text-right">
              <p className="ec-eyebrow text-[hsl(var(--ink-soft))]">
                Integración
              </p>
              <p
                className="mt-2 ec-serif text-3xl sm:text-4xl"
                style={{ color: "hsl(var(--tierra-deep))" }}
              >
                {progressPct}%
              </p>
            </div>
          </div>

          {/* Hairline overall bar */}
          <div
            className="mt-5 h-[3px] w-full rounded-full bg-[hsl(var(--warm-line-soft))] overflow-hidden relative z-10"
            role="progressbar"
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progreso global del proceso"
          >
            <motion.div
              className="h-full rounded-full bg-[hsl(var(--terracota))]"
              initial={reduced ? false : { width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{
                duration: reduced ? 0 : 0.9,
                ease: [0.22, 0.61, 0.36, 1],
              }}
            />
          </div>

          {/* Milestone markers along bar */}
          <div className="relative z-10 mt-3 grid grid-cols-4 gap-2">
            {MILESTONES.map((m) => {
              const reached = completedCount >= m;
              return (
                <div
                  key={m}
                  className="flex flex-col items-center text-center"
                  aria-label={`Hito D${m}${reached ? " — alcanzado" : " — pendiente"}`}
                >
                  <span
                    className={cn(
                      "ec-eyebrow",
                      reached
                        ? "text-[hsl(var(--terracota))]"
                        : "text-[hsl(var(--ink-soft))]/60",
                    )}
                  >
                    D{m}
                  </span>
                  <span className="ec-meta italic text-[hsl(var(--ink-soft))]/70 mt-0.5">
                    {reached ? "Alcanzado" : "Próximamente"}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* Per-phase */}
        <motion.section
          {...fade(0.1)}
          className="mb-12"
          aria-label="Progreso por fase"
        >
          <div className="flex items-baseline justify-between mb-4 px-1">
            <h2 className="ec-serif text-xl sm:text-2xl text-[hsl(var(--tierra-deep))]">
              Por fase
            </h2>
            <Link
              href="/journey"
              className="ec-meta italic text-[hsl(var(--ink-soft))] hover:text-[hsl(var(--tierra-deep))] motion-safe:transition-colors"
            >
              Abrir la constelación →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CEREMONIAL_PHASES.map((phase) => {
              const phaseStages = stages.filter(
                (s) =>
                  s.stageNumber >= phase.start && s.stageNumber <= phase.end,
              );
              const done = phaseStages.filter(
                (s) => s.status === "completed",
              ).length;
              const total = phase.end - phase.start + 1;
              const isActive =
                currentStage >= phase.start && currentStage <= phase.end;
              const hue = `hsl(${HUE_VAR[phase.hue]})`;
              return (
                <div
                  key={phase.index}
                  className="paper-surface rounded-3xl px-5 py-5 sm:px-6 sm:py-6 relative overflow-hidden"
                >
                  <div
                    aria-hidden
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: isActive
                        ? `radial-gradient(70% 60% at 0% 0%, ${hue.replace(")", " / 0.20)")} 0%, transparent 70%)`
                        : `radial-gradient(70% 60% at 0% 0%, ${hue.replace(")", " / 0.08)")} 0%, transparent 70%)`,
                    }}
                  />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p
                          className="ec-eyebrow"
                          style={{
                            color: isActive ? hue : "hsl(var(--ink-soft))",
                          }}
                        >
                          Fase {phase.index} · {phase.canonicalName}
                        </p>
                        <p className="mt-1.5 ec-serif text-lg text-[hsl(var(--tierra-deep))]">
                          {phase.label}
                        </p>
                        <p className="mt-1 ec-serif-italic text-[13px] text-[hsl(var(--ink-soft))]">
                          {phase.micro}
                        </p>
                      </div>
                      <p className="shrink-0 ec-serif text-base text-[hsl(var(--tierra-deep))]">
                        {done}
                        <span className="text-[hsl(var(--ink-soft))]">
                          /{total}
                        </span>
                      </p>
                    </div>
                    <div
                      className="mt-4 h-[2px] w-full rounded-full bg-[hsl(var(--warm-line-soft))] overflow-hidden"
                      role="progressbar"
                      aria-valuenow={done}
                      aria-valuemin={0}
                      aria-valuemax={total}
                      aria-label={`Avance de la fase ${phase.label}`}
                    >
                      <motion.div
                        className="h-full rounded-full motion-safe:transition-all"
                        initial={reduced ? false : { width: 0 }}
                        animate={{ width: `${(done / total) * 100}%` }}
                        transition={{
                          duration: reduced ? 0 : 0.7,
                          ease: [0.22, 0.61, 0.36, 1],
                        }}
                        style={{
                          background: isActive ? hue : "hsl(var(--tierra-deep))",
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* Completed stages history */}
        <motion.section
          {...fade(0.15)}
          className="mb-12"
          aria-label="Etapas observadas"
        >
          <div className="flex items-baseline justify-between mb-4 px-1">
            <h2 className="ec-serif text-xl sm:text-2xl text-[hsl(var(--tierra-deep))]">
              Etapas observadas
            </h2>
            <span className="ec-meta italic text-[hsl(var(--ink-soft))]">
              {completedStages.length}
              {completedStages.length === 1 ? " etapa" : " etapas"}
            </span>
          </div>

          {isLoadingStages ? (
            <div className="paper-surface rounded-3xl px-6 py-10 text-center">
              <InlineSpinner reduced={reduced} />
              <p className="mt-3 ec-serif-italic text-[15px] text-[hsl(var(--ink-soft))]">
                Leyendo tu recorrido…
              </p>
            </div>
          ) : completedStages.length === 0 ? (
            <div className="paper-surface rounded-3xl px-6 py-10 text-center">
              <Compass
                className="w-5 h-5 mx-auto text-[hsl(var(--ink-soft))]"
                strokeWidth={1.6}
              />
              <p className="mt-3 ec-serif-italic text-[15px] text-[hsl(var(--ink-soft))] max-w-md mx-auto">
                Aún no hay etapas observadas. Cuando cierres la primera,
                aparecerá aquí.
              </p>
              <Link
                href={`/journey/${currentStage}`}
                className={cn(
                  "mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full",
                  "warm-border bg-[hsl(var(--paper))] text-[hsl(var(--tierra-deep))]",
                  "ec-eyebrow",
                  "hover:bg-[hsl(var(--paper-veil))] motion-safe:transition-colors",
                )}
              >
                Ir a la etapa actual
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.8} />
              </Link>
            </div>
          ) : (
            <ul className="space-y-2">
              {completedStages.map((s) => {
                const def = getStage(s.stageNumber);
                if (!def) return null;
                return (
                  <li key={s.stageNumber}>
                    <Link
                      href={`/journey/${s.stageNumber}`}
                      className={cn(
                        "paper-surface rounded-2xl px-5 py-4 flex items-center gap-4 group",
                        "hover:bg-[hsl(var(--paper-veil))] motion-safe:transition-colors",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--terracota))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--paper))]",
                      )}
                    >
                      <span className="shrink-0 w-9 h-9 rounded-full bg-[hsl(var(--tierra-deep))] text-[hsl(var(--paper))] inline-flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" strokeWidth={2.2} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="ec-meta text-[hsl(var(--ink-soft))]">
                          Etapa {String(s.stageNumber).padStart(2, "0")} ·{" "}
                          {def.phase}
                        </p>
                        <p className="mt-0.5 ec-serif text-[15px] text-[hsl(var(--tierra-deep))] truncate">
                          {def.title}
                        </p>
                      </div>
                      {s.completedAt && (
                        <span className="hidden sm:inline ec-meta italic text-[hsl(var(--ink-soft))] shrink-0">
                          {new Date(s.completedAt).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      )}
                      <ArrowRight
                        className="w-4 h-4 shrink-0 text-[hsl(var(--ink-soft))] group-hover:text-[hsl(var(--tierra-deep))] motion-safe:group-hover:translate-x-0.5 motion-safe:transition-all"
                        strokeWidth={1.6}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </motion.section>

        {/* Free P-E-A history */}
        <motion.section
          {...fade(0.2)}
          className="mb-12"
          aria-label="Diario P-E-A libre"
        >
          <div className="flex items-baseline justify-between mb-4 px-1">
            <h2 className="ec-serif text-xl sm:text-2xl text-[hsl(var(--tierra-deep))]">
              Diario P-E-A libre
            </h2>
            <Link
              href="/reflection"
              className="ec-meta italic text-[hsl(var(--ink-soft))] hover:text-[hsl(var(--tierra-deep))] motion-safe:transition-colors"
            >
              Abrir registro →
            </Link>
          </div>

          {isLoadingData ? (
            <div className="paper-surface rounded-3xl px-6 py-8 text-center">
              <InlineSpinner reduced={reduced} />
              <p className="mt-3 ec-serif-italic text-[15px] text-[hsl(var(--ink-soft))]">
                Cargando registros…
              </p>
            </div>
          ) : sortedReflections.length === 0 ? (
            <div className="paper-surface rounded-3xl px-6 py-10 text-center">
              <BookOpen
                className="w-5 h-5 mx-auto text-[hsl(var(--ink-soft))]"
                strokeWidth={1.6}
              />
              <p className="mt-3 ec-serif-italic text-[15px] text-[hsl(var(--ink-soft))] max-w-md mx-auto">
                Aún no hay registros libres. El diario es opcional, no
                completa etapas.
              </p>
              <Link
                href="/reflection"
                className={cn(
                  "mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full",
                  "warm-border bg-[hsl(var(--paper))] text-[hsl(var(--tierra-deep))]",
                  "ec-eyebrow",
                  "hover:bg-[hsl(var(--paper-veil))] motion-safe:transition-colors",
                )}
              >
                Crear primer registro
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.8} />
              </Link>
            </div>
          ) : (
            <ul className="space-y-2">
              {sortedReflections.slice(0, 12).map((ref) => (
                <li
                  key={ref.id}
                  className="paper-surface rounded-2xl px-5 py-4 flex items-center gap-4"
                >
                  <span className="shrink-0 w-9 h-9 rounded-full bg-[hsl(var(--paper-veil))] warm-border-soft inline-flex items-center justify-center ec-serif text-[14px] text-[hsl(var(--tierra-deep))]">
                    {ref.day}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="ec-meta text-[hsl(var(--ink-soft))]">
                      {ref.date.toLocaleDateString("es-ES", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </p>
                    <p className="mt-0.5 text-[14px] text-[hsl(var(--ink))] line-clamp-1">
                      {ref.pensamiento}
                    </p>
                  </div>
                </li>
              ))}
              {sortedReflections.length > 12 && (
                <li className="text-center pt-2">
                  <span className="ec-meta italic text-[hsl(var(--ink-soft))]">
                    + {sortedReflections.length - 12} registros más
                  </span>
                </li>
              )}
            </ul>
          )}
        </motion.section>

        {/* Placeholders: Steps 72h + Milestones */}
        <motion.section
          {...fade(0.25)}
          aria-label="Próximas funciones"
        >
          <div className="flex items-baseline justify-between mb-4 px-1">
            <h2 className="ec-serif text-xl sm:text-2xl text-[hsl(var(--tierra-deep))]">
              Próximamente
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Step72Card />
            <PlaceholderCard
              icon={Sparkle}
              eyebrow="Hitos D10 · D20 · D30 · D40"
              title="Cierres de fase"
              hint={`Pasaste ${MILESTONES.filter((m) => completedCount >= m).length} de ${MILESTONES.length}.`}
            />
          </div>
          <p className="mt-3 px-1 ec-meta italic text-[hsl(var(--ink-soft))]">
            No se muestran datos inventados. Esta sección se llenará cuando los
            módulos estén abiertos.
          </p>
        </motion.section>
      </div>
    </AppLayout>
  );
}

function InlineSpinner({ reduced }: { reduced: boolean }) {
  if (reduced) {
    return (
      <span
        aria-label="Cargando"
        className="inline-block w-5 h-5 rounded-full border-2 border-[hsl(var(--terracota))] border-t-transparent"
      />
    );
  }
  return (
    <span
      aria-label="Cargando"
      className="inline-block w-5 h-5 rounded-full border-2 border-[hsl(var(--terracota))] border-t-transparent motion-safe:animate-spin"
    />
  );
}

function PlaceholderCard({
  icon: Icon,
  eyebrow,
  title,
  hint,
}: {
  icon: typeof Clock;
  eyebrow: string;
  title: string;
  hint: string;
}) {
  return (
    <div className="paper-surface rounded-3xl px-5 py-5 sm:px-6 sm:py-6 opacity-80">
      <div className="flex items-start gap-3">
        <span className="shrink-0 w-9 h-9 rounded-full bg-[hsl(var(--paper-veil))] warm-border-soft inline-flex items-center justify-center text-[hsl(var(--ink-soft))]">
          <Icon className="w-4 h-4" strokeWidth={1.6} />
        </span>
        <div className="min-w-0">
          <p className="ec-eyebrow text-[hsl(var(--ink-soft))]">{eyebrow}</p>
          <p className="mt-1.5 ec-serif text-[15px] text-[hsl(var(--tierra-deep))]">
            {title}
          </p>
          <p className="mt-1 ec-serif-italic text-[13px] text-[hsl(var(--ink-soft))]">
            {hint}
          </p>
        </div>
      </div>
    </div>
  );
}

// Touch STAGES so the import is preserved even if not directly read by the renderer
void STAGES;
