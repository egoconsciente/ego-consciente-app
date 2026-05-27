import { useState, useEffect, useRef, useCallback } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { useStages, validateReflection, type ValidationResult, type MissingField } from "@/lib/stage-context";
import { getStage, TOTAL_STAGES, getPhaseForStage } from "@/lib/stages";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Clock, Lock, MessageSquare, BookOpen, AlertCircle, Quote, Target } from "lucide-react";
import { Link, useLocation } from "wouter";

function Triquetra({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      {[0, 120, 240].map((angle) => (
        <ellipse key={angle} cx="50" cy="32" rx="16" ry="28" transform={`rotate(${angle} 50 52)`} />
      ))}
    </svg>
  );
}

export default function StageDetail({ stageNumber }: { stageNumber: number }) {
  const [, setLocation] = useLocation();
  const { currentStage, getStageProgress, completeStageWithData, saveReflection } = useStages();
  const [isCompleting, setIsCompleting] = useState(false);
  const [interventionMissing, setInterventionMissing] = useState<MissingField[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved">("idle");

  const stageDef = getStage(stageNumber);
  const progress = getStageProgress(stageNumber);
  const phase = getPhaseForStage(stageNumber);

  const [thought, setThought] = useState("");
  const [emotion, setEmotion] = useState("");
  const [action, setAction] = useState("");
  const [notes, setNotes] = useState("");

  const valuesRef = useRef({ thought: "", emotion: "", action: "", notes: "" });
  useEffect(() => {
    valuesRef.current = { thought, emotion, action, notes };
  }, [thought, emotion, action, notes]);

  const buildReflectionPayload = useCallback(
    (responses: { thought: string; emotion: string; action: string; notes: string }, opts: { completed: boolean }): Record<string, unknown> | null => {
      if (!stageDef) {
        console.warn("[StageDetail] buildReflectionPayload skipped: stageDef is undefined", { stageNumber });
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
    [stageDef, phase.name, stageNumber]
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
  }, [stageNumber, progress.thought, progress.emotion, progress.action, progress.notes]);

  const saveTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const activeSavesRef = useRef(0);

  const debouncedSave = useCallback(
    (field: string, value: string) => {
      if (saveTimersRef.current[field]) clearTimeout(saveTimersRef.current[field]);
      saveTimersRef.current[field] = setTimeout(async () => {
        activeSavesRef.current++;
        setIsSaving(true);
        const current = { ...valuesRef.current, [field]: value };
        const payload = buildReflectionPayload(current, { completed: false });
        await saveReflection(stageNumber, { [field]: value }, payload ?? undefined);
        activeSavesRef.current--;
        if (activeSavesRef.current === 0) {
          setIsSaving(false);
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 2000);
        }
      }, 800);
    },
    [stageNumber, saveReflection, buildReflectionPayload]
  );

  const handleFieldChange = (field: string, value: string, setter: (v: string) => void) => {
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
    const payload = buildReflectionPayload({ thought, emotion, action, notes }, { completed: false });
    await saveReflection(stageNumber, { thought, emotion, action, notes }, payload ?? undefined);
  }, [stageNumber, thought, emotion, action, notes, saveReflection, buildReflectionPayload]);

  if (!stageDef) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto p-6 lg:p-10 pt-12 text-center">
          <p className="text-muted-foreground">Etapa no encontrada.</p>
          <Link href="/journey" className="text-primary mt-4 inline-block">
            Volver al mapa
          </Link>
        </div>
      </AppLayout>
    );
  }

  const isLocked = progress.status === "locked" && stageNumber !== currentStage;
  const isCompleted = progress.status === "completed";
  const isCurrent = stageNumber === currentStage && !isCompleted;

  if (isLocked) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto p-6 lg:p-10 pt-12">
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/journey"
              className="p-2 rounded-xl border border-border hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-display text-2xl font-semibold">
                Etapa {stageNumber}
              </h1>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-6">
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-3">
              {stageDef.title}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md leading-relaxed">
              Esta etapa aún no está desbloqueada. Completa las etapas anteriores para acceder.
            </p>
            <Link
              href="/journey"
              className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-medium hover:bg-primary/90 transition-all"
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
      const completionPayload = buildReflectionPayload(localData, { completed: true });
      const result = await completeStageWithData(stageNumber, localData, completionPayload ?? undefined);
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

  const highlightField = (field: string) => interventionMissing.some((m) => m.field === field);

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto p-6 lg:p-10 pt-8 pb-32">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/journey"
            className="p-2 rounded-xl border border-border hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold tracking-widest uppercase text-primary">
              {phase.name} — Etapa {stageNumber} de {TOTAL_STAGES}
            </p>
            <h1 className="font-display text-2xl lg:text-3xl font-semibold truncate">
              {stageDef.title}
            </h1>
          </div>
          {isCompleted && (
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shrink-0">
              <Check className="w-5 h-5 text-primary-foreground" />
            </div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="py-2">
            <p className="font-display text-lg md:text-xl text-foreground/90 leading-relaxed whitespace-pre-line">
              {stageDef.egoIntro}
            </p>
          </div>

          {stageDef.dailyPhrase && (
            <figure className="relative bg-primary/5 border-l-4 border-primary rounded-r-2xl rounded-l-md px-6 py-5">
              <Quote className="absolute top-3 right-4 w-5 h-5 text-primary/30" />
              <blockquote className="font-display text-base md:text-lg italic text-foreground/85 leading-relaxed pr-6">
                {stageDef.dailyPhrase}
              </blockquote>
            </figure>
          )}

          <div className="bg-card border border-border rounded-2xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Tiempo estimado</span>
            </div>
            <span className="font-semibold">~{stageDef.estimatedMinutes} min</span>
          </div>

          {stageDef.visibleObjective && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-primary" />
                <p className="text-xs font-semibold tracking-widest uppercase text-primary">
                  Objetivo de esta etapa
                </p>
              </div>
              <p className="text-foreground leading-relaxed">
                {stageDef.visibleObjective}
              </p>
            </div>
          )}

          <div className="bg-card border border-border rounded-2xl p-8">
            <h2 className="font-display text-xl font-semibold mb-2">
              {stageDef.shortDescription}
            </h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {stageDef.instructionText}
            </p>
          </div>

          <div className="bg-accent/10 border border-accent/20 rounded-2xl p-6">
            <p className="text-xs font-semibold tracking-widest uppercase text-accent mb-2">
              Para completar esta etapa
            </p>
            <p className="text-foreground leading-relaxed">
              {stageDef.completionHint}
            </p>

            {stageDef.requiredData && stageDef.requiredData.length > 0 && (
              <div className="mt-5 pt-5 border-t border-accent/20">
                <p className="text-xs font-medium text-foreground/70 mb-3">
                  Antes de completar, observa si registraste…
                </p>
                <ul className="space-y-2">
                  {stageDef.requiredData.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground/80 leading-relaxed">
                      <span className="text-accent mt-0.5 shrink-0">·</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">Tu observación</h3>
              <AnimatePresence>
                {isSaving && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-muted-foreground"
                  >
                    Guardando...
                  </motion.span>
                )}
                {saveStatus === "saved" && !isSaving && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-primary"
                  >
                    Guardado
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Pensamiento
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                ¿Qué pensamiento apareció o se repitió?
              </p>
              <textarea
                value={thought}
                onChange={(e) => handleFieldChange("thought", e.target.value, setThought)}
                placeholder="Escribe el pensamiento que observaste..."
                rows={3}
                disabled={isCompleted}
                className={`w-full bg-background border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-colors ${highlightField("thought") ? "border-orange-400 ring-1 ring-orange-400/30" : "border-border"}`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Emoción
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                ¿Qué sentiste? Nombra la emoción lo más específica posible.
              </p>
              <textarea
                value={emotion}
                onChange={(e) => handleFieldChange("emotion", e.target.value, setEmotion)}
                placeholder="Nombra la emoción que acompañó ese pensamiento..."
                rows={2}
                disabled={isCompleted}
                className={`w-full bg-background border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-colors ${highlightField("emotion") ? "border-orange-400 ring-1 ring-orange-400/30" : "border-border"}`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Acción o evitación
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                ¿Qué hiciste o qué evitaste hacer?
              </p>
              <textarea
                value={action}
                onChange={(e) => handleFieldChange("action", e.target.value, setAction)}
                placeholder="Describe lo que hiciste o dejaste de hacer..."
                rows={2}
                disabled={isCompleted}
                className={`w-full bg-background border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-colors ${highlightField("action") ? "border-orange-400 ring-1 ring-orange-400/30" : "border-border"}`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Nota adicional <span className="text-muted-foreground font-normal">(opcional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => handleFieldChange("notes", e.target.value, setNotes)}
                placeholder="Algo más que quieras registrar..."
                rows={2}
                disabled={isCompleted}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>
          </div>

          <AnimatePresence>
            {interventionMissing.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/40 rounded-2xl p-6 space-y-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Triquetra className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-display text-sm font-semibold text-foreground mb-1">
                      Ego Guía
                    </p>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      Antes de avanzar, hay algo que tu sistema aún no ha terminado de mostrar.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pl-11">
                  {interventionMissing.map((item) => (
                    <div key={item.field} className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-foreground/70 leading-relaxed">
                        {item.message}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/reflection"
              className="flex items-center gap-3 p-4 bg-card border border-border rounded-2xl hover:border-primary/20 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-sm">Registro PEA</p>
                <p className="text-xs text-muted-foreground">Registrar observación</p>
              </div>
            </Link>
            <Link
              href="/chat"
              className="flex items-center gap-3 p-4 bg-card border border-border rounded-2xl hover:border-primary/20 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-sm">Chat con el Ego</p>
                <p className="text-xs text-muted-foreground">Explorar más</p>
              </div>
            </Link>
          </div>

          {isCompleted && (
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center">
              <Check className="w-8 h-8 text-primary mx-auto mb-3" />
              <p className="font-display text-lg font-semibold text-foreground mb-1">
                Etapa completada
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Completaste esta etapa. Puedes revisarla cuando quieras.
              </p>
              <Link
                href="/journey"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
              >
                Volver al mapa
              </Link>
            </div>
          )}

          {isCurrent && (
            <button
              onClick={handleComplete}
              disabled={isCompleting}
              className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-semibold text-lg hover:bg-primary/90 hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isCompleting ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                  Completando...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Completar etapa
                </>
              )}
            </button>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
}
