import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

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

type OptionButtonProps = {
  label: string;
  selected: boolean;
  onClick: () => void;
};

function OptionButton({ label, selected, onClick }: OptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-5 py-4 rounded-2xl border transition-all duration-200 font-medium text-base ${
        selected
          ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
          : "bg-card border-border text-foreground hover:border-primary/40 hover:bg-secondary"
      }`}
    >
      {label}
    </button>
  );
}

export default function Onboarding() {
  const { user, markOnboardingComplete } = useAuth();
  const [, setLocation] = useLocation();

  const [step, setStep] = useState(1);
  const [reason, setReason] = useState("");
  const [incongruenceArea, setIncongruenceArea] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [dailyTime, setDailyTime] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const canAdvance =
    (step === 1 && reason.trim().length > 0) ||
    (step === 2 && incongruenceArea !== "") ||
    (step === 3 && difficulty !== "") ||
    (step === 4 && dailyTime !== "");

  const handleNext = async () => {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      return;
    }

    // Step 4: save and finish
    if (!user) return;
    setIsSaving(true);
    setSaveError(null);

    const { error } = await supabase.from("onboarding_responses").upsert(
      {
        user_id: user.id,
        reason: reason.trim(),
        incongruence_area: incongruenceArea,
        difficulty,
        daily_time: dailyTime,
      },
      { onConflict: "user_id" }
    );

    if (error) {
      setSaveError("Hubo un problema al guardar. Inténtalo de nuevo.");
      setIsSaving(false);
      return;
    }

    markOnboardingComplete();
    setLocation("/dashboard");
  };

  const slideVariants = {
    enter: { opacity: 0, x: 40 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-15%] right-[-15%] w-80 h-80 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-15%] left-[-15%] w-80 h-80 bg-accent/8 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">
            Ego Consciente
          </p>
          <h1 className="font-display text-2xl text-foreground font-semibold">
            Antes de comenzar
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Unas preguntas para calibrar tu proceso.
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground font-medium">
              Paso {step} de {TOTAL_STEPS}
            </span>
            <span className="text-xs text-muted-foreground">
              {Math.round((step / TOTAL_STEPS) * 100)}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={false}
              animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="relative min-h-[340px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <div className="bg-card border border-border rounded-3xl p-7 shadow-sm h-full">
                  <h2 className="font-display text-xl font-semibold text-foreground mb-2">
                    ¿Qué te trae hoy aquí?
                  </h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    No hay respuesta correcta. Solo observa lo primero que surge.
                  </p>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Escribe libremente..."
                    className="w-full h-36 bg-background border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-all text-base"
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <div className="bg-card border border-border rounded-3xl p-7 shadow-sm h-full">
                  <h2 className="font-display text-xl font-semibold text-foreground mb-2">
                    ¿Dónde sientes más incongruencia ahora mismo?
                  </h2>
                  <p className="text-sm text-muted-foreground mb-5">
                    El área donde hay más tensión entre lo que piensas, sientes y haces.
                  </p>
                  <div className="space-y-2.5">
                    {INCONGRUENCE_OPTIONS.map((opt) => (
                      <OptionButton
                        key={opt}
                        label={opt}
                        selected={incongruenceArea === opt}
                        onClick={() => setIncongruenceArea(opt)}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <div className="bg-card border border-border rounded-3xl p-7 shadow-sm h-full">
                  <h2 className="font-display text-xl font-semibold text-foreground mb-2">
                    ¿Qué te cuesta más hoy?
                  </h2>
                  <p className="text-sm text-muted-foreground mb-5">
                    No lo que debería costarte. Lo que realmente te cuesta.
                  </p>
                  <div className="space-y-2.5">
                    {DIFFICULTY_OPTIONS.map((opt) => (
                      <OptionButton
                        key={opt}
                        label={opt}
                        selected={difficulty === opt}
                        onClick={() => setDifficulty(opt)}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <div className="bg-card border border-border rounded-3xl p-7 shadow-sm h-full">
                  <h2 className="font-display text-xl font-semibold text-foreground mb-2">
                    ¿Cuánto tiempo puedes dedicar al día?
                  </h2>
                  <p className="text-sm text-muted-foreground mb-5">
                    Ser honesto aquí es ya una forma de congruencia.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {TIME_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setDailyTime(opt)}
                        className={`py-5 rounded-2xl border transition-all duration-200 font-semibold text-lg ${
                          dailyTime === opt
                            ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                            : "bg-card border-border text-foreground hover:border-primary/40 hover:bg-secondary"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  {saveError && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 text-center"
                    >
                      {saveError}
                    </motion.p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              disabled={isSaving}
              className="px-6 py-4 rounded-xl border border-border text-foreground font-medium hover:bg-secondary transition-colors disabled:opacity-50"
            >
              Atrás
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            disabled={!canAdvance || isSaving}
            className="flex-1 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                <span>Guardando...</span>
              </>
            ) : step === TOTAL_STEPS ? (
              "Comenzar mi proceso"
            ) : (
              "Continuar"
            )}
          </button>
        </div>

        {/* Ego note */}
        <p className="mt-6 text-center text-xs text-muted-foreground leading-relaxed px-4">
          "Lo que revelas aquí no te define. Solo ayuda a calibrar la observación."
        </p>
      </div>
    </div>
  );
}
