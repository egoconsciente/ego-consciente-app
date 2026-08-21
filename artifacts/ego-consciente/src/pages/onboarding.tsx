import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { EcSigil } from "@/components/ec";
import { respectsReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { reportClientError, reportClientEvent } from "@/lib/client-observability";

const TOTAL_STEPS = 4;

const INCONGRUENCE_OPTIONS = [
  "trabajo",
  "pareja",
  "familia",
  "imagen pública",
  "soledad",
  "otra",
];

const DIFFICULTY_OPTIONS = [
  "decir lo que pienso",
  "reconocer lo que siento",
  "actuar con claridad",
  "sostener una decisión",
  "no sé todavía",
];

const TIME_OPTIONS = ["3 min", "5 min", "10 min", "15 min"];

const STEP_META = [
  { eyebrow: "Llegada", title: "¿Qué te trae hoy aquí?" },
  { eyebrow: "Terreno", title: "¿Dónde sientes más incongruencia ahora mismo?" },
  { eyebrow: "Resistencia", title: "¿Qué te cuesta más hoy?" },
  { eyebrow: "Ritmo", title: "¿Cuánto tiempo puedes dedicar al día?" },
];

function ChipOption({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "w-full text-left px-5 py-4 rounded-2xl",
        "text-base font-sans transition-all duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--terracota))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--paper))]",
        selected
          ? "bg-[hsl(var(--tierra-deep))] text-[hsl(var(--paper))] warm-border shadow-md shadow-[hsl(var(--tierra-deep)/0.16)]"
          : "paper-surface text-[hsl(var(--ink))] hover:bg-[hsl(var(--paper-veil))]",
      )}
    >
      {label}
    </button>
  );
}

export default function Onboarding() {
  const { user, markOnboardingComplete } = useAuth();
  const [, setLocation] = useLocation();
  const reduced = respectsReducedMotion();

  const [step, setStep] = useState(1);
  const [reason, setReason] = useState("");
  const [incongruenceArea, setIncongruenceArea] = useState("");
  const [incongruenceDetail, setIncongruenceDetail] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [dailyTime, setDailyTime] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const canAdvance = useMemo(() => {
    if (step === 1) return reason.trim().length > 0;
    if (step === 2) {
      if (incongruenceArea === "") return false;
      if (incongruenceArea === "otra" && incongruenceDetail.trim().length === 0)
        return false;
      return true;
    }
    if (step === 3) return difficulty !== "";
    if (step === 4) return dailyTime !== "";
    return false;
  }, [step, reason, incongruenceArea, incongruenceDetail, difficulty, dailyTime]);

  const handleNext = async () => {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      return;
    }

    if (!user) {
      setSaveError("No hay sesión activa. Por favor, vuelve a iniciar sesión.");
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    // If user chose "otra" with detail, persist the free text so the
    // ego-engine narration ("el área de '${incongruence_area}'") stays
    // legible. Schema unchanged.
    const areaToSave =
      incongruenceArea === "otra" && incongruenceDetail.trim()
        ? incongruenceDetail.trim()
        : incongruenceArea;

    const payload = {
      user_id: user.id,
      reason: reason.trim(),
      incongruence_area: areaToSave,
      difficulty,
      daily_time: dailyTime,
    };

    reportClientEvent("onboarding_save_started", { fieldCount: 4 });

    const { error } = await supabase
      .from("onboarding_responses")
      .upsert(payload, { onConflict: "user_id" });

    if (error) {
      reportClientError("onboarding_save_failed", error);
      setSaveError(
        `No se pudo guardar (${error.code ?? "error desconocido"}). Intenta de nuevo.`,
      );
      setIsSaving(false);
      return;
    }

    reportClientEvent("onboarding_saved");
    markOnboardingComplete();
    setLocation("/dashboard");
  };

  const meta = STEP_META[step - 1];

  return (
    <div className="min-h-screen bg-[hsl(var(--paper))] text-[hsl(var(--ink))] flex flex-col items-center px-5 sm:px-6 py-8 sm:py-12 relative overflow-x-hidden">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(60% 40% at 50% 0%, hsl(var(--ambar-soft) / 0.18) 0%, transparent 65%), radial-gradient(70% 50% at 50% 100%, hsl(var(--paper-altar)) 0%, transparent 55%)",
        }}
      />

      <div className="w-full max-w-xl relative z-10">
        {/* Ceremonial header */}
        <header className="flex flex-col items-center text-center mb-8 sm:mb-10">
          <span className="w-10 h-10 inline-flex items-center justify-center rounded-full warm-border bg-[hsl(var(--paper))] text-[hsl(var(--tierra-deep))] mb-4">
            <EcSigil variant="hairline" size={22} />
          </span>
          <p className="ec-eyebrow text-[hsl(var(--terracota))]">
            Calibración inicial
          </p>
          <p className="ec-meta italic text-[hsl(var(--ink-soft))] mt-2 max-w-sm">
            Esto no te define. Solo ayuda a calibrar la observación.
          </p>
        </header>

        {/* Ritual breathing progress */}
        <BreathingProgress step={step} total={TOTAL_STEPS} reduced={reduced} />

        {/* Step card */}
        <AnimatePresence mode="wait">
          <motion.section
            key={step}
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -12 }}
            transition={{
              duration: reduced ? 0 : 0.45,
              ease: [0.22, 0.61, 0.36, 1],
            }}
            className="mt-8 sm:mt-10"
          >
            <div
              className={cn(
                "paper-surface rounded-3xl",
                "px-6 py-8 sm:px-9 sm:py-10",
              )}
            >
              <p className="ec-eyebrow text-[hsl(var(--ink-soft))] mb-3">
                {meta.eyebrow}
              </p>
              <h2 className="ec-serif text-2xl sm:text-[28px] leading-snug text-[hsl(var(--tierra-deep))]">
                {meta.title}
              </h2>

              <div className="mt-7">
                {step === 1 && (
                  <>
                    <p className="ec-meta italic mb-4 text-[hsl(var(--ink-soft))]">
                      No hay respuesta correcta. Observa lo primero que surge.
                    </p>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Escribe libremente..."
                      className={cn(
                        "w-full min-h-[140px] resize-none rounded-2xl",
                        "bg-[hsl(var(--paper))] warm-border",
                        "px-5 py-4 text-base leading-relaxed text-[hsl(var(--ink))]",
                        "placeholder:text-[hsl(var(--ink-soft))] placeholder:italic",
                        "focus:outline-none focus:border-[hsl(var(--terracota))]",
                        "transition-colors duration-200",
                      )}
                    />
                  </>
                )}

                {step === 2 && (
                  <>
                    <p className="ec-meta italic mb-5 text-[hsl(var(--ink-soft))]">
                      El área donde hay más tensión entre lo que piensas,
                      sientes y haces.
                    </p>
                    <div className="space-y-2.5">
                      {INCONGRUENCE_OPTIONS.map((opt) => (
                        <ChipOption
                          key={opt}
                          label={opt}
                          selected={incongruenceArea === opt}
                          onClick={() => {
                            setIncongruenceArea(opt);
                            if (opt !== "otra") setIncongruenceDetail("");
                          }}
                        />
                      ))}
                    </div>

                    <AnimatePresence>
                      {incongruenceArea === "otra" && (
                        <motion.div
                          initial={reduced ? false : { opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={
                            reduced
                              ? undefined
                              : { opacity: 0, height: 0 }
                          }
                          transition={{ duration: reduced ? 0 : 0.35 }}
                          className="overflow-hidden"
                        >
                          <input
                            autoFocus
                            type="text"
                            value={incongruenceDetail}
                            onChange={(e) =>
                              setIncongruenceDetail(e.target.value)
                            }
                            placeholder="Nombra tu área..."
                            maxLength={120}
                            className={cn(
                              "mt-4 w-full rounded-2xl",
                              "bg-[hsl(var(--paper))] warm-border",
                              "px-5 py-3.5 text-base text-[hsl(var(--ink))]",
                              "placeholder:text-[hsl(var(--ink-soft))] placeholder:italic",
                              "focus:outline-none focus:border-[hsl(var(--terracota))]",
                              "transition-colors duration-200",
                            )}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}

                {step === 3 && (
                  <>
                    <p className="ec-meta italic mb-5 text-[hsl(var(--ink-soft))]">
                      No lo que debería costarte. Lo que realmente te cuesta.
                    </p>
                    <div className="space-y-2.5">
                      {DIFFICULTY_OPTIONS.map((opt) => (
                        <ChipOption
                          key={opt}
                          label={opt}
                          selected={difficulty === opt}
                          onClick={() => setDifficulty(opt)}
                        />
                      ))}
                    </div>
                  </>
                )}

                {step === 4 && (
                  <>
                    <p className="ec-meta italic mb-5 text-[hsl(var(--ink-soft))]">
                      Ser honesto aquí es ya una forma de congruencia.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {TIME_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setDailyTime(opt)}
                          aria-pressed={dailyTime === opt}
                          className={cn(
                            "py-5 rounded-2xl transition-all duration-200",
                            "ec-serif text-lg",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--terracota))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--paper))]",
                            dailyTime === opt
                              ? "bg-[hsl(var(--tierra-deep))] text-[hsl(var(--paper))] warm-border shadow-md shadow-[hsl(var(--tierra-deep)/0.16)]"
                              : "paper-surface text-[hsl(var(--tierra-deep))] hover:bg-[hsl(var(--paper-veil))]",
                          )}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>

                    {saveError && (
                      <motion.p
                        initial={reduced ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: reduced ? 0 : 0.4 }}
                        role="alert"
                        className="mt-6 text-sm text-[hsl(var(--terracota))] bg-[hsl(var(--terracota-soft)/0.15)] warm-border-soft rounded-2xl px-4 py-3 text-center leading-relaxed"
                      >
                        {saveError}
                      </motion.p>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.section>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-6 sm:mt-7 flex items-center gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              disabled={isSaving}
              aria-label="Paso anterior"
              className={cn(
                "inline-flex items-center gap-2 px-5 py-3.5 rounded-full",
                "warm-border bg-transparent text-[hsl(var(--ink-soft))]",
                "hover:bg-[hsl(var(--paper-veil))] hover:text-[hsl(var(--tierra-deep))] transition-colors",
                "disabled:opacity-50",
              )}
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.6} />
              <span className="text-sm">Atrás</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            disabled={!canAdvance || isSaving}
            className={cn(
              "flex-1 inline-flex items-center justify-center gap-2",
              "px-6 py-4 rounded-full",
              "bg-[hsl(var(--tierra-deep))] text-[hsl(var(--paper))]",
              "text-base font-medium tracking-wide",
              "shadow-md shadow-[hsl(var(--tierra-deep)/0.18)]",
              "hover:shadow-lg hover:-translate-y-[1px] transition-all duration-300",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-md",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--terracota))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--paper))]",
            )}
          >
            {isSaving ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-[hsl(var(--paper))] border-t-transparent animate-spin" />
                <span>Calibrando…</span>
              </>
            ) : step === TOTAL_STEPS ? (
              <>
                <span>Iniciar proceso</span>
                <ArrowRight
                  className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5"
                  strokeWidth={1.8}
                />
              </>
            ) : (
              <>
                <span>Continuar</span>
                <ArrowRight className="w-4 h-4" strokeWidth={1.8} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function BreathingProgress({
  step,
  total,
  reduced,
}: {
  step: number;
  total: number;
  reduced: boolean;
}) {
  return (
    <div className="flex items-center justify-center gap-3" aria-hidden>
      {Array.from({ length: total }).map((_, i) => {
        const idx = i + 1;
        const isPast = idx < step;
        const isCurrent = idx === step;
        return (
          <div key={i} className="relative h-[2px] w-12 sm:w-16">
            <span
              className={cn(
                "absolute inset-0 rounded-full",
                isPast
                  ? "bg-[hsl(var(--tierra-deep))]"
                  : "bg-[hsl(var(--warm-line-soft))]",
              )}
            />
            {isCurrent && !reduced && (
              <motion.span
                className="absolute inset-0 rounded-full bg-[hsl(var(--tierra-deep))] origin-left"
                animate={{ scaleX: [0.2, 1, 0.2], opacity: [0.4, 1, 0.4] }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}
            {isCurrent && reduced && (
              <span className="absolute inset-0 rounded-full bg-[hsl(var(--tierra-deep))]" />
            )}
          </div>
        );
      })}
      <span className="ec-meta text-[hsl(var(--ink-soft))] ml-3">
        {step}/{total}
      </span>
    </div>
  );
}
