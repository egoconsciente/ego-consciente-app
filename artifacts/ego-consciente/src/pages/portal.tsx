import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

function Triquetra({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      className={className}
    >
      {[0, 120, 240].map((angle) => (
        <ellipse
          key={angle}
          cx="50"
          cy="32"
          rx="16"
          ry="28"
          transform={`rotate(${angle} 50 52)`}
        />
      ))}
    </svg>
  );
}

export default function Portal() {
  const { user, markPortalComplete } = useAuth();
  const [, setLocation] = useLocation();
  const [isStarting, setIsStarting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const navigateToDashboard = () => {
    console.log("[Portal] Redirecting to /dashboard");
    markPortalComplete();
    setLocation("/dashboard");
  };

  const handleStart = async () => {
    if (!user || isStarting) return;
    setIsStarting(true);
    setErrorMsg(null);
    console.log("[Portal] Start process clicked");

    const fallbackTimer = setTimeout(() => {
      console.log("[Portal] Fallback timeout — forcing navigation");
      navigateToDashboard();
    }, 4000);

    try {
      console.log("[Portal] Writing journey_state");
      const now = new Date().toISOString();

      const { error: journeyError } = await supabase.from("journey_state").upsert(
        {
          user_id: user.id,
          intro_completed: true,
          portal_completed: true,
          process_started_at: now,
        },
        { onConflict: "user_id" }
      );

      if (journeyError) {
        clearTimeout(fallbackTimer);
        console.error("[Portal] journey_state error:", journeyError.message);
        setErrorMsg(`Error al iniciar (${journeyError.code || "desconocido"}). Revisa la consola.`);
        setIsStarting(false);
        return;
      }

      console.log("[Portal] Initializing stage 1");
      const { error: stageError } = await supabase.from("stage_progress").upsert(
        {
          user_id: user.id,
          stage_number: 1,
          status: "in_progress",
          started_at: now,
          updated_at: now,
        },
        { onConflict: "user_id,stage_number" }
      );

      if (stageError) {
        console.error("[Portal] stage_progress init error:", stageError.message);
      }

      clearTimeout(fallbackTimer);
      navigateToDashboard();
    } catch (err) {
      clearTimeout(fallbackTimer);
      console.error("[Portal] Unexpected error:", err);
      setErrorMsg("Error inesperado. Intenta de nuevo.");
      setIsStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="fixed top-[-20%] right-[-20%] w-96 h-96 bg-primary/6 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-[-20%] left-[-20%] w-96 h-96 bg-accent/6 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12"
        >
          <div className="relative">
            <Triquetra className="w-28 h-28 text-primary" />
            <motion.div
              className="absolute inset-0 w-28 h-28"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Triquetra className="w-28 h-28 text-primary blur-md" />
            </motion.div>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4"
        >
          El umbral
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-lg text-muted-foreground leading-relaxed mb-4"
        >
          Lo que sigue son 40 etapas de observación.
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-base text-muted-foreground leading-relaxed mb-12"
        >
          No vas a recibir respuestas. Vas a aprender a hacerte las preguntas
          correctas. Cada etapa, un pensamiento. Una emoción. Una acción. Un paso
          mínimo congruente.
        </motion.p>

        {errorMsg && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 text-center leading-relaxed"
          >
            {errorMsg}
          </motion.p>
        )}

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          onClick={handleStart}
          disabled={isStarting}
          className="px-12 py-5 bg-primary text-primary-foreground rounded-2xl font-semibold text-lg hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
        >
          {isStarting ? (
            <>
              <div className="w-5 h-5 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
              Iniciando...
            </>
          ) : (
            "Comenzar el proceso"
          )}
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="mt-8 text-xs text-muted-foreground"
        >
          "El primer paso no es avanzar. Es detenerte a observar."
        </motion.p>
      </div>
    </div>
  );
}
