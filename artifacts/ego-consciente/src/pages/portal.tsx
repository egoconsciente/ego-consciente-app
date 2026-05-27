import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Compass, Clock, Sparkle } from "lucide-react";
import { EcSigil } from "@/components/ec";
import { respectsReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

type OnboardingSummary = {
  reason: string | null;
  incongruence_area: string | null;
  daily_time: string | null;
};

export default function Portal() {
  const { user, markPortalComplete } = useAuth();
  const [, setLocation] = useLocation();
  const reduced = respectsReducedMotion();

  const [isStarting, setIsStarting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [summary, setSummary] = useState<OnboardingSummary | null>(null);

  // Load onboarding summary — best-effort, never blocks.
  useEffect(() => {
    let active = true;
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("onboarding_responses")
        .select("reason,incongruence_area,daily_time")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!active) return;
      if (error) {
        console.warn("[Portal] No se pudo cargar resumen:", error.message);
        return;
      }
      if (data) {
        setSummary({
          reason: data.reason ?? null,
          incongruence_area: data.incongruence_area ?? null,
          daily_time: data.daily_time ?? null,
        });
      }
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const navigateToDashboard = () => {
    console.log("[Portal] Redirecting to /dashboard");
    markPortalComplete();
    setLocation("/dashboard");
  };

  const handleStart = async () => {
    if (!user || isStarting) return;
    setIsStarting(true);
    setErrorMsg(null);
    console.log("[Portal] Cross threshold clicked");

    const fallbackTimer = setTimeout(() => {
      console.log("[Portal] Fallback timeout — forcing navigation");
      navigateToDashboard();
    }, 4000);

    try {
      const now = new Date().toISOString();

      const { error: journeyError } = await supabase
        .from("journey_state")
        .upsert(
          {
            user_id: user.id,
            intro_completed: true,
            portal_completed: true,
            process_started_at: now,
          },
          { onConflict: "user_id" },
        );

      if (journeyError) {
        clearTimeout(fallbackTimer);
        console.error("[Portal] journey_state error:", journeyError.message);
        setErrorMsg(
          `Error al iniciar (${journeyError.code || "desconocido"}). Revisa la consola.`,
        );
        setIsStarting(false);
        return;
      }

      const { error: stageError } = await supabase
        .from("stage_progress")
        .upsert(
          {
            user_id: user.id,
            stage_number: 1,
            status: "in_progress",
            started_at: now,
            updated_at: now,
          },
          { onConflict: "user_id,stage_number" },
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

  const hasAnySummary =
    summary &&
    (summary.reason || summary.incongruence_area || summary.daily_time);

  return (
    <div className="min-h-screen bg-[hsl(var(--paper))] text-[hsl(var(--ink))] flex flex-col items-center justify-center px-5 sm:px-6 py-12 relative overflow-hidden">
      {/* Ceremonial aura */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(55% 45% at 50% 20%, hsl(var(--ambar-soft) / 0.28) 0%, transparent 65%), radial-gradient(80% 65% at 50% 110%, hsl(var(--paper-altar)) 0%, transparent 55%)",
        }}
      />
      <div
        aria-hidden
        className="absolute top-12 left-1/2 -translate-x-1/2 w-16 h-px bg-[hsl(var(--warm-line))] opacity-70"
      />
      <div
        aria-hidden
        className="absolute bottom-12 left-1/2 -translate-x-1/2 w-16 h-px bg-[hsl(var(--warm-line))] opacity-70"
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-xl w-full">
        {/* Living sigil */}
        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reduced ? 0 : 1.4, ease: [0.22, 0.61, 0.36, 1] }}
          className="relative mb-10 sm:mb-12 w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center"
        >
          {!reduced && (
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-full"
              style={{ border: "1px solid hsl(var(--warm-line) / 0.55)" }}
              animate={{ scale: [1, 1.07, 1], opacity: [0.5, 0.9, 0.5] }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: [0.45, 0.05, 0.55, 0.95],
              }}
            />
          )}
          {!reduced && (
            <motion.span
              aria-hidden
              className="absolute inset-4 rounded-full"
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
            size={96}
            className="relative text-[hsl(var(--tierra-deep))]"
          />
        </motion.div>

        {/* Eyebrow + title */}
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduced ? 0 : 0.4, duration: reduced ? 0 : 0.7 }}
          className="ec-eyebrow text-[hsl(var(--terracota))]"
        >
          El umbral
        </motion.p>

        <motion.h1
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduced ? 0 : 0.55, duration: reduced ? 0 : 0.8 }}
          className={cn(
            "mt-3 ec-serif text-[hsl(var(--tierra-deep))]",
            "text-3xl sm:text-5xl leading-[1.1] tracking-[-0.01em]",
          )}
        >
          40 etapas
          <br />
          de observación.
        </motion.h1>

        <motion.p
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduced ? 0 : 0.75, duration: reduced ? 0 : 0.8 }}
          className={cn(
            "mt-7 sm:mt-8 max-w-md",
            "ec-serif-italic text-[hsl(var(--ink))]",
            "text-lg sm:text-xl leading-[1.55]",
          )}
        >
          No vamos a diagnosticarte. No vamos a etiquetarte.
          <br />
          Vamos a observar cómo opera tu sistema.
        </motion.p>

        {/* Summary chips — only if onboarding data exists */}
        {hasAnySummary && (
          <motion.section
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0 : 0.95, duration: reduced ? 0 : 0.7 }}
            className="mt-10 w-full"
            aria-label="Resumen de calibración inicial"
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="h-px w-8 bg-[hsl(var(--warm-line))]" />
              <p className="ec-eyebrow text-[hsl(var(--ink-soft))]">
                Lo que trajiste
              </p>
              <span className="h-px w-8 bg-[hsl(var(--warm-line))]" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {summary?.incongruence_area && (
                <SummaryChip
                  Icon={Compass}
                  label="Área inicial"
                  value={summary.incongruence_area}
                />
              )}
              {summary?.daily_time && (
                <SummaryChip
                  Icon={Clock}
                  label="Tiempo diario"
                  value={summary.daily_time}
                />
              )}
              {summary?.reason && (
                <SummaryChip
                  Icon={Sparkle}
                  label="Foco de llegada"
                  value={truncate(summary.reason, 56)}
                />
              )}
            </div>
          </motion.section>
        )}

        {errorMsg && (
          <motion.p
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduced ? 0 : 0.4 }}
            role="alert"
            className="mt-8 text-sm text-[hsl(var(--terracota))] bg-[hsl(var(--terracota-soft)/0.15)] warm-border-soft rounded-2xl px-4 py-3 leading-relaxed"
          >
            {errorMsg}
          </motion.p>
        )}

        {/* CTA */}
        <motion.button
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduced ? 0 : 1.1, duration: reduced ? 0 : 0.8 }}
          onClick={handleStart}
          disabled={isStarting}
          className={cn(
            "mt-10 sm:mt-12 group inline-flex items-center justify-center gap-3",
            "px-10 py-5 rounded-full",
            "bg-[hsl(var(--tierra-deep))] text-[hsl(var(--paper))]",
            "text-base sm:text-lg font-medium tracking-wide",
            "shadow-lg shadow-[hsl(var(--tierra-deep)/0.22)]",
            "hover:shadow-xl hover:-translate-y-[1px] transition-all duration-300",
            "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--terracota))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--paper))]",
          )}
        >
          {isStarting ? (
            <>
              <span className="w-5 h-5 rounded-full border-2 border-[hsl(var(--paper))] border-t-transparent animate-spin" />
              <span>Cruzando…</span>
            </>
          ) : (
            <>
              <span>Cruzar el umbral</span>
              <span
                aria-hidden
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              >
                →
              </span>
            </>
          )}
        </motion.button>

        <motion.p
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 0.65 }}
          transition={{ delay: reduced ? 0 : 1.4, duration: reduced ? 0 : 0.6 }}
          className="mt-8 ec-meta italic text-[hsl(var(--ink-soft))]"
        >
          El primer paso no es avanzar. Es detenerte a observar.
        </motion.p>
      </div>
    </div>
  );
}

function SummaryChip({
  Icon,
  label,
  value,
}: {
  Icon: typeof Compass;
  label: string;
  value: string;
}) {
  return (
    <div
      className={cn(
        "paper-surface rounded-2xl px-4 py-3.5 text-left",
        "flex items-start gap-3",
      )}
    >
      <span
        className={cn(
          "shrink-0 w-8 h-8 inline-flex items-center justify-center rounded-full",
          "bg-[hsl(var(--paper-veil))] warm-border-soft",
          "text-[hsl(var(--tierra-deep))]",
        )}
      >
        <Icon className="w-4 h-4" strokeWidth={1.6} />
      </span>
      <div className="min-w-0">
        <p className="ec-eyebrow text-[hsl(var(--ink-soft))]">{label}</p>
        <p className="ec-serif text-[15px] text-[hsl(var(--tierra-deep))] mt-0.5 break-words">
          {value}
        </p>
      </div>
    </div>
  );
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return `${s.slice(0, n).trimEnd()}…`;
}
