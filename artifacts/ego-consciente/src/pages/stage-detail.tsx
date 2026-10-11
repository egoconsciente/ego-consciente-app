import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import {
  useStages,
  validateReflection,
  type MissingField,
} from "@/lib/stage-context";
import { getStage, TOTAL_STAGES, getPhaseForStage } from "@/lib/stages";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Lock,
  MessageCircle,
  BookOpen,
  Eye,
  Heart,
  Footprints,
  Sparkle,
  Compass,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { EcSigil, StageNumeral } from "@/components/ec";
import { respectsReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";
import {
  SafetyBanner,
  GroundingSheet,
  PauseProcessDialog,
  type SafetyLevel,
} from "@/components/safety";

// ─────────────────────────────────────────────────────────────
//  StageDetail
// ─────────────────────────────────────────────────────────────
export default function StageDetail({ stageNumber }: { stageNumber: number }) {
  const [, setLocation] = useLocation();
  const {
    pause,
    currentStage,
    getStageProgress,
    completeStageWithData,
    saveReflection,
  } = useStages();
  const reduced = respectsReducedMotion();

  const [isCompleting, setIsCompleting] = useState(false);
  const [interventionMissing, setInterventionMissing] = useState<MissingField[]>(
    [],
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved">("idle");

  const stageDef = getStage(stageNumber);
  const progress = getStageProgress(stageNumber);
  const phase = getPhaseForStage(stageNumber);

  const [thought, setThought] = useState("");
  const [emotion, setEmotion] = useState("");
  const [action, setAction] = useState("");
  const [notes, setNotes] = useState("");

  // Safety state — UI preparada, default oculta. Declarado arriba para
  // mantener el orden estable de hooks frente a los early returns.
  const [safetyLevel] = useState<SafetyLevel>("none");
  const [groundingOpen, setGroundingOpen] = useState(false);
  const [pauseOpen, setPauseOpen] = useState(false);

  const valuesRef = useRef({ thought: "", emotion: "", action: "", notes: "" });
  useEffect(() => {
    valuesRef.current = { thought, emotion, action, notes };
  }, [thought, emotion, action, notes]);

  const buildReflectionPayload = useCallback(
    (
      responses: {
        thought: string;
        emotion: string;
        action: string;
        notes: string;
      },
      opts: { completed: boolean },
    ): Record<string, unknown> | null => {
      if (!stageDef) {
        console.warn(
          "[StageDetail] buildReflectionPayload skipped: stageDef is undefined",
          { stageNumber },
        );
        return null;
      }
      const payload: Record<string, unknown> = {
        stageNumber: stageDef.stageNumber,
        stageTitle: stageDef.title,
        phase: phase.name,
        dailyPhrase: stageDef.dailyPhrase ?? null,
        visibleObjective: stageDef.visibleObjective ?? null,
        requiredData: stageDef.requiredData ?? [],
        responses: {
          thought: responses.thought,
          emotion: responses.emotion,
          action: responses.action,
          notes: responses.notes,
        },
        completionContext: {
          completedAt: opts.completed ? new Date().toISOString() : null,
          source: "stage-detail",
          userConfirmedComplete: opts.completed,
        },
      };
      if (stageDef.internalSignal || stageDef.bookSignal) {
        payload.internal = {
          internalSignal: stageDef.internalSignal ?? null,
          bookSignal: stageDef.bookSignal ?? null,
        };
      }
      if (import.meta.env.DEV) {
        console.log("REFLECTION PAYLOAD BUILT", {
          stageNumber: stageDef.stageNumber,
          completed: opts.completed,
          keys: Object.keys(payload),
          payload,
        });
      }
      return payload;
    },
    [stageDef, phase.name, stageNumber],
  );

  const prevStageRef = useRef<number | null>(null);
  useEffect(() => {
    if (prevStageRef.current !== stageNumber) {
      setThought(progress.thought || "");
      setEmotion(progress.emotion || "");
      setAction(progress.action || "");
      setNotes(progress.notes || "");
      setInterventionMissing([]);
      prevStageRef.current = stageNumber;
    }
  }, [
    stageNumber,
    progress.thought,
    progress.emotion,
    progress.action,
    progress.notes,
  ]);

  const saveTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>(
    {},
  );
  const activeSavesRef = useRef(0);

  const debouncedSave = useCallback(
    (field: string, value: string) => {
      if (saveTimersRef.current[field])
        clearTimeout(saveTimersRef.current[field]);
      saveTimersRef.current[field] = setTimeout(async () => {
        activeSavesRef.current++;
        setIsSaving(true);
        const current = { ...valuesRef.current, [field]: value };
        const payload = buildReflectionPayload(current, { completed: false });
        await saveReflection(
          stageNumber,
          { [field]: value },
          payload ?? undefined,
        );
        activeSavesRef.current--;
        if (activeSavesRef.current === 0) {
          setIsSaving(false);
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 2000);
        }
      }, 800);
    },
    [stageNumber, saveReflection, buildReflectionPayload],
  );

  const handleFieldChange = (
    field: string,
    value: string,
    setter: (v: string) => void,
  ) => {
    setter(value);
    debouncedSave(field, value);
    if (interventionMissing.length > 0) {
      setInterventionMissing((prev) => prev.filter((m) => m.field !== field));
    }
  };

  const flushPendingSaves = useCallback(async () => {
    for (const key of Object.keys(saveTimersRef.current)) {
      clearTimeout(saveTimersRef.current[key]);
      delete saveTimersRef.current[key];
    }
    const payload = buildReflectionPayload(
      { thought, emotion, action, notes },
      { completed: false },
    );
    await saveReflection(
      stageNumber,
      { thought, emotion, action, notes },
      payload ?? undefined,
    );
  }, [
    stageNumber,
    thought,
    emotion,
    action,
    notes,
    saveReflection,
    buildReflectionPayload,
  ]);

  // Triángulo de campos requeridos
  const filledCount = useMemo(() => {
    let n = 0;
    if (thought.trim().length >= 3) n++;
    if (emotion.trim().length >= 3) n++;
    if (action.trim().length >= 3) n++;
    return n;
  }, [thought, emotion, action]);

  if (!stageDef) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-5 sm:px-6 py-12 text-center">
          <p className="ec-serif-italic text-[hsl(var(--ink-soft))]">
            Etapa no encontrada.
          </p>
          <Link
            href="/journey"
            className="ec-eyebrow text-[hsl(var(--terracota))] mt-4 inline-block hover:underline"
          >
            Volver al mapa
          </Link>
        </div>
      </AppLayout>
    );
  }

  const isLocked = progress.status === "locked" && stageNumber !== currentStage;
  const isCompleted = progress.status === "completed";
  const isCurrent = stageNumber === currentStage && !isCompleted;

  // ─── LOCKED ───────────────────────────────────────────────
  if (isLocked) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-5 sm:px-6 py-10">
          <BackToMap />
          <div className="paper-surface rounded-3xl px-6 py-12 sm:px-10 sm:py-14 mt-8 text-center">
            <div className="w-14 h-14 rounded-full bg-[hsl(var(--paper-veil))] warm-border-soft mx-auto mb-6 flex items-center justify-center">
              <Lock
                className="w-5 h-5 text-[hsl(var(--ink-soft))]"
                strokeWidth={1.6}
              />
            </div>
            <p className="ec-eyebrow text-[hsl(var(--ink-soft))]">
              Etapa {stageNumber}
            </p>
            <h2 className="mt-2 ec-serif text-2xl sm:text-3xl text-[hsl(var(--tierra-deep))]">
              {stageDef.title}
            </h2>
            <p className="mt-4 ec-serif-italic text-[15px] text-[hsl(var(--ink-soft))] max-w-md mx-auto leading-relaxed">
              Esta etapa llegará a su tiempo. Termina las anteriores y se
              abrirá.
            </p>
            <Link
              href="/journey"
              className={cn(
                "mt-8 inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full",
                "bg-[hsl(var(--tierra-deep))] text-[hsl(var(--paper))]",
                "text-sm font-medium",
                "motion-safe:hover:shadow-lg motion-safe:hover:-translate-y-[1px] motion-safe:transition-all motion-safe:duration-300",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--terracota))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--paper))]",
              )}
            >
              Volver al mapa
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  const handleComplete = async () => {
    const localData = { thought, emotion, action, notes };
    const validation = validateReflection(localData);
    if (!validation.valid) {
      setInterventionMissing(validation.missing);
      return;
    }

    setIsCompleting(true);
    try {
      await flushPendingSaves();
      const completionPayload = buildReflectionPayload(localData, {
        completed: true,
      });
      const result = await completeStageWithData(
        stageNumber,
        localData,
        completionPayload ?? undefined,
      );
      if (result.success) {
        setInterventionMissing([]);
        console.log("[StageDetail] Navigating to journey map");
        setLocation("/journey");
        return;
      }
      if (result.validation && !result.validation.valid) {
        setInterventionMissing(result.validation.missing);
      }
    } catch (err) {
      console.error("[StageDetail] Unexpected error during completion:", err);
    } finally {
      setIsCompleting(false);
    }
  };

  const highlightField = (field: string) =>
    interventionMissing.some((m) => m.field === field);

  const fadeIn = (delay = 0) =>
    reduced
      ? { initial: false as const, animate: { opacity: 1 } }
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: 0.6,
            delay,
            ease: [0.22, 0.61, 0.36, 1] as [number, number, number, number],
          },
        };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-6 lg:py-10 pb-32">
        {/* Safety banner (UI preparada, oculta si level='none') */}
        <SafetyBanner
          level={safetyLevel}
          onGround={() => setGroundingOpen(true)}
          onPause={() => setPauseOpen(true)}
          className="mb-6"
        />

        {/* ── 1. StageRitualHeader ────────────────────────── */}
        <StageRitualHeader
          stageNumber={stageNumber}
          phaseName={phase.name}
          estimatedMinutes={stageDef.estimatedMinutes}
          isSaving={isSaving}
          saveStatus={saveStatus}
          filledCount={filledCount}
          totalRequired={3}
          isCompleted={isCompleted}
          reduced={reduced}
        />

        <div className="mt-8 lg:mt-10 space-y-8 lg:space-y-10">
          {/* ── 2. Voz del Ego ──────────────────────────── */}
          <motion.section
            {...fadeIn(0)}
            className="living-glass rounded-3xl px-6 py-7 sm:px-9 sm:py-9 relative overflow-hidden"
            aria-label="Voz del Ego Guía"
          >
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(60% 60% at 90% 0%, hsl(var(--ambar-soft) / 0.18) 0%, transparent 65%)",
              }}
            />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-9 h-9 rounded-full bg-[hsl(var(--paper-veil))] warm-border-soft inline-flex items-center justify-center text-[hsl(var(--tierra-deep))]">
                  <EcSigil variant="hairline" size={20} />
                </span>
                <p className="ec-eyebrow text-[hsl(var(--terracota))]">
                  El Ego Guía
                </p>
              </div>
              <p className="font-display text-lg sm:text-xl text-[hsl(var(--tierra-deep))] leading-relaxed whitespace-pre-line">
                {stageDef.egoIntro}
              </p>

              {stageDef.dailyPhrase && (
                <figure className="mt-6 pl-5 border-l border-[hsl(var(--warm-line))]">
                  <blockquote className="ec-serif-italic text-[15px] sm:text-base text-[hsl(var(--tierra-deep))] leading-relaxed">
                    {stageDef.dailyPhrase}
                  </blockquote>
                </figure>
              )}
            </div>
          </motion.section>

          {/* ── 3. Lo que observamos hoy ──────────────── */}
          {stageDef.visibleObjective && (
            <motion.section
              {...fadeIn(0.05)}
              className="paper-surface rounded-3xl px-6 py-7 sm:px-8 sm:py-8"
              aria-label="Lo que observamos hoy"
            >
              <div className="flex items-start gap-3">
                <Compass
                  className="w-4 h-4 mt-[3px] shrink-0 text-[hsl(var(--terracota))]"
                  strokeWidth={1.6}
                />
                <div className="min-w-0">
                  <p className="ec-eyebrow text-[hsl(var(--ink-soft))]">
                    Lo que observamos hoy
                  </p>
                  <p className="mt-2 ec-serif text-lg sm:text-xl text-[hsl(var(--tierra-deep))] leading-snug">
                    {stageDef.visibleObjective}
                  </p>
                </div>
              </div>
            </motion.section>
          )}

          {/* ── 4. Instrucción ──────────────────────── */}
          <motion.section
            {...fadeIn(0.1)}
            className="paper-surface rounded-3xl px-6 py-7 sm:px-8 sm:py-8"
            aria-label="Instrucción"
          >
            <p className="ec-eyebrow text-[hsl(var(--ink-soft))]">
              Cómo observar hoy
            </p>
            <h3 className="mt-2 ec-serif text-xl sm:text-2xl text-[hsl(var(--tierra-deep))] leading-snug">
              {stageDef.shortDescription}
            </h3>
            <p className="mt-3 text-[15px] sm:text-base text-[hsl(var(--ink))] leading-relaxed whitespace-pre-line">
              {stageDef.instructionText}
            </p>

            {stageDef.requiredData && stageDef.requiredData.length > 0 && (
              <div className="mt-6 pt-5 border-t border-[hsl(var(--warm-line-soft))]">
                <p className="ec-meta italic text-[hsl(var(--ink-soft))] mb-2.5">
                  Antes de cerrar, observa si registraste…
                </p>
                <ul className="space-y-1.5">
                  {stageDef.requiredData.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-[14px] text-[hsl(var(--ink))] leading-relaxed"
                    >
                      <span className="mt-1 inline-block w-1 h-1 rounded-full bg-[hsl(var(--terracota))] shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.section>

          {/* ── 5. PEAComposer (triada) ───────────────── */}
          <motion.section
            {...fadeIn(0.15)}
            className="space-y-3"
            aria-label="Tu observación P-E-A"
          >
            <div className="flex items-center justify-between px-1">
              <p className="ec-eyebrow text-[hsl(var(--terracota))]">
                Tu observación · P-E-A
              </p>
              <SaveStatus
                isSaving={isSaving}
                saveStatus={saveStatus}
                reduced={reduced}
              />
            </div>

            <PeaCard
              icon={Eye}
              label="Pensamiento"
              hint="¿Qué pensamiento apareció o se repitió?"
              placeholder="Escribe el pensamiento que observaste…"
              rows={3}
              value={thought}
              disabled={isCompleted}
              missing={highlightField("thought")}
              onChange={(v) => handleFieldChange("thought", v, setThought)}
              accent="terracota"
              filled={thought.trim().length >= 3}
            />
            <Connector />
            <PeaCard
              icon={Heart}
              label="Emoción"
              hint="¿Qué sentiste? Nombra la emoción lo más específica posible."
              placeholder="Nombra la emoción que acompañó ese pensamiento…"
              rows={2}
              value={emotion}
              disabled={isCompleted}
              missing={highlightField("emotion")}
              onChange={(v) => handleFieldChange("emotion", v, setEmotion)}
              accent="ambar"
              filled={emotion.trim().length >= 3}
            />
            <Connector />
            <PeaCard
              icon={Footprints}
              label="Acción o evitación"
              hint="¿Qué hiciste o qué evitaste hacer?"
              placeholder="Describe lo que hiciste o dejaste de hacer…"
              rows={2}
              value={action}
              disabled={isCompleted}
              missing={highlightField("action")}
              onChange={(v) => handleFieldChange("action", v, setAction)}
              accent="tierra"
              filled={action.trim().length >= 3}
            />

            {/* Nota adicional (opcional) */}
            <div className="paper-surface rounded-2xl px-5 py-5 sm:px-6 sm:py-6 mt-2">
              <label
                htmlFor="stage-notes"
                className="ec-eyebrow text-[hsl(var(--ink-soft))]"
              >
                Nota adicional{" "}
                <span className="normal-case tracking-normal italic text-[hsl(var(--ink-soft))]">
                  (opcional)
                </span>
              </label>
              <textarea
                id="stage-notes"
                value={notes}
                onChange={(e) =>
                  handleFieldChange("notes", e.target.value, setNotes)
                }
                placeholder="Algo más que quieras registrar…"
                rows={2}
                disabled={isCompleted}
                className={cn(
                  "mt-2 w-full bg-transparent border-0 outline-none resize-none",
                  "text-[15px] text-[hsl(var(--ink))] placeholder:text-[hsl(var(--ink-soft))]/55",
                  "leading-relaxed",
                  isCompleted && "cursor-not-allowed opacity-70",
                )}
              />
            </div>
          </motion.section>

          {/* ── 6. Validación suave (Ego Guía) ─────── */}
          <AnimatePresence>
            {interventionMissing.length > 0 && (
              <motion.section
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
                animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={{ duration: reduced ? 0 : 0.4 }}
                className="warm-border bg-[hsl(var(--paper-soft))] rounded-3xl px-6 py-6 sm:px-7 sm:py-7"
                role="status"
                aria-live="polite"
              >
                <div className="flex items-start gap-3 mb-4">
                  <span className="shrink-0 w-9 h-9 rounded-full bg-[hsl(var(--paper))] warm-border-soft inline-flex items-center justify-center text-[hsl(var(--tierra-deep))]">
                    <EcSigil variant="hairline" size={18} />
                  </span>
                  <div>
                    <p className="ec-eyebrow text-[hsl(var(--terracota))]">
                      El Ego Guía
                    </p>
                    <p className="mt-1.5 ec-serif text-[17px] sm:text-lg text-[hsl(var(--tierra-deep))] leading-snug">
                      Todavía no hay suficiente para cerrar esta etapa.
                    </p>
                  </div>
                </div>
                <ul className="space-y-2 pl-12">
                  {interventionMissing.map((item) => (
                    <li
                      key={item.field}
                      className="flex items-start gap-2.5 text-[14px] sm:text-[15px] text-[hsl(var(--ink))] leading-relaxed"
                    >
                      <Sparkle
                        className="w-3.5 h-3.5 mt-[3px] shrink-0 text-[hsl(var(--ambar))]"
                        strokeWidth={1.6}
                      />
                      <span>{item.message}</span>
                    </li>
                  ))}
                </ul>
              </motion.section>
            )}
          </AnimatePresence>

          {/* ── 7. Completar etapa / Cierre ritual ───── */}
          {isCurrent && (
            <motion.div {...fadeIn(0.1)}>
              <button
                type="button"
                onClick={handleComplete}
                disabled={isCompleting}
                className={cn(
                  "w-full inline-flex items-center justify-center gap-3 px-7 py-4 rounded-full",
                  "bg-[hsl(var(--tierra-deep))] text-[hsl(var(--paper))]",
                  "text-base font-medium tracking-wide",
                  "shadow-md shadow-[hsl(var(--tierra-deep)/0.18)]",
                  "motion-safe:hover:shadow-lg motion-safe:hover:-translate-y-[1px] motion-safe:transition-all motion-safe:duration-300",
                  "disabled:opacity-60 disabled:cursor-not-allowed",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--terracota))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--paper))]",
                )}
              >
                {isCompleting ? (
                  <>
                    {reduced ? (
                      <span className="w-4 h-4 rounded-full border-2 border-[hsl(var(--paper))] border-t-transparent" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border-2 border-[hsl(var(--paper))] border-t-transparent motion-safe:animate-spin" />
                    )}
                    Cerrando la etapa…
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" strokeWidth={2} />
                    Completar etapa
                  </>
                )}
              </button>
              <p className="mt-3 text-center ec-meta italic text-[hsl(var(--ink-soft))]">
                Al cerrar, se abre la siguiente etapa.
              </p>
            </motion.div>
          )}

          {isCompleted && (
            <motion.section
              {...fadeIn(0)}
              className="paper-surface rounded-3xl px-6 py-9 sm:px-10 sm:py-11 text-center relative overflow-hidden"
              aria-label="Etapa completada"
            >
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(50% 50% at 50% 0%, hsl(var(--ambar-soft) / 0.22) 0%, transparent 70%)",
                }}
              />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-full bg-[hsl(var(--paper-veil))] warm-border-soft mx-auto mb-4 flex items-center justify-center">
                  <Check
                    className="w-5 h-5 text-[hsl(var(--tierra-deep))]"
                    strokeWidth={1.8}
                  />
                </div>
                <p className="ec-eyebrow text-[hsl(var(--terracota))]">
                  Cierre ritual
                </p>
                <p className="mt-2 ec-serif text-xl sm:text-2xl text-[hsl(var(--tierra-deep))] leading-snug">
                  Esta etapa quedó observada.
                </p>
                <p className="mt-3 ec-serif-italic text-[15px] text-[hsl(var(--ink-soft))] max-w-md mx-auto">
                  Puedes volver a leerla cuando quieras. Lo que aprendiste no se
                  borra.
                </p>
                <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/journey"
                    className={cn(
                      "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full",
                      "bg-[hsl(var(--tierra-deep))] text-[hsl(var(--paper))]",
                      "text-sm font-medium",
                      "motion-safe:hover:shadow-lg motion-safe:hover:-translate-y-[1px] motion-safe:transition-all motion-safe:duration-300",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--terracota))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--paper))]",
                    )}
                  >
                    Volver al mapa
                  </Link>
                  {currentStage > stageNumber && currentStage <= TOTAL_STAGES && (
                    <Link
                      href={`/journey/${currentStage}`}
                      className={cn(
                        "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full",
                        "warm-border bg-[hsl(var(--paper))] text-[hsl(var(--tierra-deep))]",
                        "text-sm font-medium",
                        "hover:bg-[hsl(var(--paper-veil))] motion-safe:transition-colors",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--terracota))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--paper))]",
                      )}
                    >
                      Continuar
                      <ArrowRight className="w-4 h-4" strokeWidth={1.8} />
                    </Link>
                  )}
                </div>
              </div>
            </motion.section>
          )}

          {/* ── 8. Enlaces contextuales ─────────────── */}
          <motion.section
            {...fadeIn(0.2)}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            aria-label="Enlaces contextuales"
          >
            <ContextLink
              href="/chat"
              Icon={MessageCircle}
              label="Chat profundo"
              hint="Conversa con el Guía."
            />
            <ContextLink
              href="/reflection"
              Icon={BookOpen}
              label="Registro P-E-A libre"
              hint="Para lo que aparece fuera de etapa."
            />
          </motion.section>
        </div>
      </div>

      {/* Diálogos de cuidado del proceso (preparados, sin backend) */}
      <GroundingSheet
        open={groundingOpen}
        onClose={() => setGroundingOpen(false)}
      />
      <PauseProcessDialog
        open={pauseOpen}
        onCancel={() => setPauseOpen(false)}
        onConfirm={() => pause.setPaused(true)}
        busy={pause.busy}
        error={pause.error}
        onRetry={() => void pause.reload()}
      />
    </AppLayout>
  );
}

// ─────────────────────────────────────────────────────────────
//  BackToMap (shared)
// ─────────────────────────────────────────────────────────────
function BackToMap() {
  return (
    <Link
      href="/journey"
      aria-label="Volver al mapa"
      className={cn(
        "inline-flex items-center gap-2 px-3 py-2 rounded-full",
        "ec-meta italic text-[hsl(var(--ink-soft))]",
        "hover:text-[hsl(var(--tierra-deep))] motion-safe:transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--terracota))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--paper))]",
      )}
    >
      <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.6} />
      Volver al mapa
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────
//  StageRitualHeader
// ─────────────────────────────────────────────────────────────
function StageRitualHeader({
  stageNumber,
  phaseName,
  estimatedMinutes,
  isSaving,
  saveStatus,
  filledCount,
  totalRequired,
  isCompleted,
  reduced,
}: {
  stageNumber: number;
  phaseName: string;
  estimatedMinutes: number;
  isSaving: boolean;
  saveStatus: "idle" | "saved";
  filledCount: number;
  totalRequired: number;
  isCompleted: boolean;
  reduced: boolean;
}) {
  const stageDef = getStage(stageNumber);
  const pct = Math.min(100, Math.round((filledCount / totalRequired) * 100));

  return (
    <motion.header
      initial={reduced ? false : { opacity: 0, y: 10 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0 : 0.6, ease: [0.22, 0.61, 0.36, 1] }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <BackToMap />
        <SaveStatus
          isSaving={isSaving}
          saveStatus={saveStatus}
          reduced={reduced}
        />
      </div>

      <div className="paper-surface rounded-3xl px-6 py-6 sm:px-8 sm:py-7 relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(50% 50% at 100% 0%, hsl(var(--ambar-soft) / 0.16) 0%, transparent 65%)",
          }}
        />
        <div className="relative z-10 flex items-start gap-5">
          <div className="shrink-0">
            <StageNumeral n={stageNumber} total={TOTAL_STAGES} scale="md" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="ec-eyebrow text-[hsl(var(--terracota))]">
              {phaseName} · Etapa {stageNumber}
            </p>
            <h1 className="mt-1.5 ec-serif text-xl sm:text-2xl lg:text-[26px] leading-snug text-[hsl(var(--tierra-deep))]">
              {stageDef?.title ?? "Etapa"}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 ec-meta text-[hsl(var(--ink-soft))]">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" strokeWidth={1.6} />~
                {estimatedMinutes} min
              </span>
              {!isCompleted && (
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block w-1 h-1 rounded-full bg-[hsl(var(--warm-line))]" />
                  {filledCount}/{totalRequired} campos
                </span>
              )}
              {isCompleted && (
                <span className="inline-flex items-center gap-1.5 text-[hsl(var(--tierra-deep))]">
                  <Check className="w-3.5 h-3.5" strokeWidth={2} />
                  Completada
                </span>
              )}
            </div>
            <div
              className="mt-3 h-[2px] w-full rounded-full bg-[hsl(var(--warm-line-soft))] overflow-hidden"
              role="progressbar"
              aria-valuenow={isCompleted ? 100 : pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progreso de campos requeridos"
            >
              <motion.div
                className="h-full rounded-full bg-[hsl(var(--terracota))]"
                initial={reduced ? false : { width: 0 }}
                animate={{ width: `${isCompleted ? 100 : pct}%` }}
                transition={{
                  duration: reduced ? 0 : 0.7,
                  ease: [0.22, 0.61, 0.36, 1],
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

// ─────────────────────────────────────────────────────────────
//  SaveStatus
// ─────────────────────────────────────────────────────────────
function SaveStatus({
  isSaving,
  saveStatus,
  reduced,
}: {
  isSaving: boolean;
  saveStatus: "idle" | "saved";
  reduced: boolean;
}) {
  return (
    <div
      className="ec-meta italic text-[hsl(var(--ink-soft))] min-h-[20px] inline-flex items-center"
      aria-live="polite"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isSaving && (
          <motion.span
            key="saving"
            initial={reduced ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.25 }}
            className="inline-flex items-center gap-1.5"
          >
            <span
              className={cn(
                "inline-block w-1.5 h-1.5 rounded-full bg-[hsl(var(--ambar))]",
                !reduced && "motion-safe:animate-pulse",
              )}
            />
            Guardando…
          </motion.span>
        )}
        {!isSaving && saveStatus === "saved" && (
          <motion.span
            key="saved"
            initial={reduced ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.25 }}
            className="inline-flex items-center gap-1.5 text-[hsl(var(--tierra-deep))]"
          >
            <Check className="w-3 h-3" strokeWidth={2} />
            Guardado
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  PeaCard
// ─────────────────────────────────────────────────────────────
const ACCENT_HUE: Record<"terracota" | "ambar" | "tierra", string> = {
  terracota: "var(--terracota)",
  ambar: "var(--ambar)",
  tierra: "var(--tierra-deep)",
};

function PeaCard({
  icon: Icon,
  label,
  hint,
  placeholder,
  rows,
  value,
  disabled,
  missing,
  onChange,
  accent,
  filled,
}: {
  icon: typeof Eye;
  label: string;
  hint: string;
  placeholder: string;
  rows: number;
  value: string;
  disabled: boolean;
  missing: boolean;
  onChange: (v: string) => void;
  accent: "terracota" | "ambar" | "tierra";
  filled: boolean;
}) {
  const fieldId = `pea-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const hue = `hsl(${ACCENT_HUE[accent]})`;

  return (
    <div
      className={cn(
        "paper-surface rounded-3xl px-5 py-5 sm:px-6 sm:py-6 relative motion-safe:transition-all motion-safe:duration-300",
        missing && "ring-1 ring-[hsl(var(--ambar)/0.55)]",
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        <span
          className="w-9 h-9 rounded-full inline-flex items-center justify-center shrink-0 warm-border-soft motion-safe:transition-colors"
          style={{
            background: filled ? hue : "hsl(var(--paper-veil))",
            color: filled ? "hsl(var(--paper))" : hue,
          }}
        >
          <Icon className="w-4 h-4" strokeWidth={1.7} />
        </span>
        <div className="flex-1 min-w-0">
          <label
            htmlFor={fieldId}
            className="ec-eyebrow"
            style={{ color: hue }}
          >
            {label}
          </label>
          <p className="ec-meta italic text-[hsl(var(--ink-soft))] mt-0.5">
            {hint}
          </p>
        </div>
        {filled && (
          <Check
            className="w-3.5 h-3.5 shrink-0 text-[hsl(var(--ink-soft))]"
            strokeWidth={2}
            aria-label="Campo completado"
          />
        )}
      </div>

      <textarea
        id={fieldId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        aria-invalid={missing}
        className={cn(
          "w-full bg-transparent border-0 outline-none resize-none",
          "text-[15px] sm:text-base text-[hsl(var(--ink))] placeholder:text-[hsl(var(--ink-soft))]/55",
          "leading-relaxed",
          disabled && "cursor-not-allowed opacity-70",
        )}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Connector (visual link between PEA cards)
// ─────────────────────────────────────────────────────────────
function Connector() {
  return (
    <div className="flex justify-center py-0.5" aria-hidden>
      <span
        className="block w-px h-5"
        style={{ background: "hsl(var(--warm-line))" }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  ContextLink
// ─────────────────────────────────────────────────────────────
function ContextLink({
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
        "paper-surface rounded-2xl px-5 py-4 flex items-center gap-4 group",
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
