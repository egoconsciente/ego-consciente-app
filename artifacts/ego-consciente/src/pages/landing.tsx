import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  shouldShowRitual,
  isDemoMode,
  isDevEnvironment,
  activateDemoMode,
  resetDemoReplay,
  getAppBase,
} from "@/lib/demo-mode";
import { useAuth } from "@/lib/auth-context";
import { EcSigil } from "@/components/ec";
import { respectsReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "ego_ritual_seen";

const INTRO_LINES = [
  "Nos dijeron que el ego era el enemigo.",
  "Que había que silenciarlo.",
  "Pero casi nadie explicó cómo funciona.",
  "Hoy puedes empezar a observarlo.",
];

type Phase = "splash" | "intro" | "landing";

export default function Landing() {
  const showRitual = shouldShowRitual();
  const [phase, setPhase] = useState<Phase>(showRitual ? "splash" : "landing");
  const [introIndex, setIntroIndex] = useState(0);
  const { logout } = useAuth();
  const showDemoButton = isDevEnvironment() && !isDemoMode();
  const reduced = respectsReducedMotion();

  useEffect(() => {
    if (phase !== "splash") return;
    const timer = setTimeout(() => setPhase("intro"), reduced ? 800 : 3200);
    return () => clearTimeout(timer);
  }, [phase, reduced]);

  useEffect(() => {
    if (phase !== "intro") return;
    if (introIndex < INTRO_LINES.length - 1) {
      const timer = setTimeout(
        () => setIntroIndex((i) => i + 1),
        reduced ? 900 : 2000,
      );
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(
      () => {
        if (!isDemoMode()) {
          localStorage.setItem(STORAGE_KEY, "true");
        }
        setPhase("landing");
      },
      reduced ? 900 : 2400,
    );
    return () => clearTimeout(timer);
  }, [phase, introIndex, reduced]);

  const skipRitual = useCallback(() => {
    if (!isDemoMode()) {
      localStorage.setItem(STORAGE_KEY, "true");
    }
    setPhase("landing");
  }, []);

  if (phase === "splash") {
    return <SplashScene reduced={reduced} onSkip={skipRitual} />;
  }

  if (phase === "intro") {
    return (
      <IntroScene
        reduced={reduced}
        line={INTRO_LINES[introIndex]}
        index={introIndex}
        onSkip={skipRitual}
      />
    );
  }

  return (
    <LandingScene
      reduced={reduced}
      showDemoButton={showDemoButton}
      onActivateDemo={async () => {
        activateDemoMode();
        resetDemoReplay();
        await logout();
        window.location.replace(getAppBase());
      }}
    />
  );
}

/* ---------------- SPLASH ---------------- */

function SplashScene({
  reduced,
  onSkip,
}: {
  reduced: boolean;
  onSkip: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSkip}
      aria-label="Saltar introducción"
      className={cn(
        "min-h-screen w-full bg-[hsl(var(--paper))] text-[hsl(var(--tierra-deep))]",
        "flex items-center justify-center relative overflow-hidden",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--terracota))] focus-visible:ring-offset-4 focus-visible:ring-offset-[hsl(var(--paper))]",
      )}
    >
      {/* Warm aura backdrop */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 42%, hsl(var(--ambar-soft) / 0.22) 0%, transparent 65%), radial-gradient(80% 60% at 50% 100%, hsl(var(--paper-altar)) 0%, transparent 55%)",
        }}
      />

      <div className="relative flex flex-col items-center gap-10 px-8">
        <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center">
          {/* Outer breathing ring */}
          {!reduced && (
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-full"
              style={{
                border: "1px solid hsl(var(--warm-line) / 0.55)",
              }}
              animate={{ scale: [1, 1.06, 1], opacity: [0.55, 0.85, 0.55] }}
              transition={{
                duration: 6.5,
                repeat: Infinity,
                ease: [0.45, 0.05, 0.55, 0.95],
              }}
            />
          )}
          {/* Inner halo */}
          {!reduced && (
            <motion.span
              aria-hidden
              className="absolute inset-6 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, hsl(var(--ambar-soft) / 0.30) 0%, transparent 70%)",
              }}
              animate={{ opacity: [0.4, 0.75, 0.4] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}

          <motion.div
            initial={reduced ? false : { opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: reduced ? 0 : 1.6, ease: [0.22, 0.61, 0.36, 1] }}
            className="relative"
          >
            <EcSigil
              variant="hairline"
              size={132}
              className="text-[hsl(var(--tierra-deep))]"
            />
          </motion.div>
        </div>

        <motion.p
          initial={reduced ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduced ? 0 : 1.1, duration: reduced ? 0 : 0.9 }}
          className="ec-eyebrow text-[hsl(var(--terracota))]"
        >
          Ego Consciente
        </motion.p>
      </div>

      <motion.p
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: reduced ? 0 : 1.8, duration: reduced ? 0 : 0.6 }}
        className="absolute bottom-8 ec-meta text-[hsl(var(--ink-soft))]"
      >
        Toca para continuar
      </motion.p>
    </button>
  );
}

/* ---------------- INTRO ---------------- */

function IntroScene({
  reduced,
  line,
  index,
  onSkip,
}: {
  reduced: boolean;
  line: string;
  index: number;
  onSkip: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSkip}
      aria-label="Saltar introducción"
      className={cn(
        "min-h-screen w-full bg-[hsl(var(--paper))] text-[hsl(var(--ink))]",
        "flex items-center justify-center relative overflow-hidden",
        "px-7 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--terracota))] focus-visible:ring-offset-4 focus-visible:ring-offset-[hsl(var(--paper))]",
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(65% 50% at 50% 35%, hsl(var(--paper-soft)) 0%, transparent 70%), radial-gradient(50% 40% at 50% 95%, hsl(var(--ambar-soft) / 0.10) 0%, transparent 70%)",
        }}
      />

      {/* Hairline dividers above/below for ritual framing */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-16 h-px bg-[hsl(var(--warm-line))] opacity-70" />
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-16 h-px bg-[hsl(var(--warm-line))] opacity-70" />

      <div className="relative w-full max-w-2xl text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -14 }}
            transition={{
              duration: reduced ? 0 : 0.9,
              ease: [0.22, 0.61, 0.36, 1],
            }}
            className={cn(
              "font-display ec-serif-italic",
              "text-[1.6rem] sm:text-3xl md:text-4xl",
              "leading-[1.5] tracking-[-0.005em]",
              "text-[hsl(var(--tierra-deep))]",
            )}
          >
            {line}
          </motion.p>
        </AnimatePresence>

        {/* Progress dots */}
        <div
          className="mt-12 flex items-center justify-center gap-2"
          aria-hidden
        >
          {INTRO_LINES.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-px transition-all duration-700",
                i === index
                  ? "w-8 bg-[hsl(var(--tierra-deep))]"
                  : i < index
                    ? "w-4 bg-[hsl(var(--warm-line))]"
                    : "w-4 bg-[hsl(var(--warm-line-soft))]",
              )}
            />
          ))}
        </div>
      </div>

      <p className="absolute bottom-8 ec-meta text-[hsl(var(--ink-soft))] opacity-70">
        Toca para saltar
      </p>
    </button>
  );
}

/* ---------------- LANDING ---------------- */

function LandingScene({
  reduced,
  showDemoButton,
  onActivateDemo,
}: {
  reduced: boolean;
  showDemoButton: boolean;
  onActivateDemo: () => void | Promise<void>;
}) {
  const ease: [number, number, number, number] = [0.22, 0.61, 0.36, 1];
  const fade = (delay: number) => ({
    initial: reduced ? false : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduced ? 0 : 0.9, delay: reduced ? 0 : delay, ease },
  });

  return (
    <div className="min-h-screen bg-[hsl(var(--paper))] text-[hsl(var(--ink))] relative overflow-hidden">
      {/* Warm gradient atmosphere */}
      <div
        aria-hidden
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(70% 50% at 50% -10%, hsl(var(--ambar-soft) / 0.22) 0%, transparent 60%), radial-gradient(80% 60% at 50% 100%, hsl(var(--paper-altar)) 0%, transparent 55%)",
        }}
      />
      <img
        aria-hidden
        src={`${import.meta.env.BASE_URL}images/hero-abstract.png`}
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-center opacity-[0.10] mix-blend-multiply pointer-events-none"
      />

      {/* Top hairline ribbon */}
      <header className="relative z-10 flex items-center justify-between px-5 sm:px-10 pt-6 pb-2">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 inline-flex items-center justify-center rounded-full warm-border bg-[hsl(var(--paper))] text-[hsl(var(--tierra-deep))]">
            <EcSigil variant="hairline" size={20} />
          </span>
          <span className="ec-serif text-base font-semibold text-[hsl(var(--tierra-deep))]">
            Ego Consciente
          </span>
        </div>

        <Link
          href="/login"
          className="ec-meta text-[hsl(var(--ink-soft))] hover:text-[hsl(var(--tierra-deep))] transition-colors hidden sm:inline"
        >
          Ya tengo cuenta →
        </Link>
      </header>

      {/* Hero */}
      <main className="relative z-10 mx-auto w-full max-w-5xl px-5 sm:px-8">
        <section className="min-h-[calc(100vh-7rem)] flex flex-col items-center justify-center text-center pb-10">
          <motion.div {...fade(0.05)} className="mb-7 sm:mb-9">
            <span
              className={cn(
                "inline-flex items-center gap-2 py-1.5 px-3.5 rounded-full",
                "bg-[hsl(var(--paper))] warm-border-soft",
                "ec-eyebrow text-[hsl(var(--ink-soft))]",
              )}
            >
              <span className="w-1 h-1 rounded-full bg-[hsl(var(--terracota))]" />
              Un proceso de observación
            </span>
          </motion.div>

          <motion.h1
            {...fade(0.15)}
            className={cn(
              "ec-serif text-[hsl(var(--tierra-deep))]",
              "text-[1.9rem] leading-[1.1] sm:text-[2.6rem] md:text-5xl",
              "tracking-[-0.015em] max-w-3xl",
            )}
          >
            No vengo a decirte quién eres.
            <br />
            <span className="ec-serif-italic text-[hsl(var(--ink))]">
              Vengo a mostrarte cómo se construye la historia que hoy llamas{" "}
              <span className="text-[hsl(var(--terracota))]">«yo»</span>.
            </span>
          </motion.h1>

          <motion.p
            {...fade(0.4)}
            className={cn(
              "mt-7 sm:mt-9 max-w-xl",
              "text-[hsl(var(--ink-soft))]",
              "text-[14px] sm:text-[15px] leading-relaxed",
            )}
          >
            Ego Consciente es un proceso de autoobservación.
            <br />
            Aquí no vienes a recibir una etiqueta.
            <br />
            Vienes a recuperar claridad.
          </motion.p>

          <motion.p
            {...fade(0.55)}
            className={cn(
              "mt-8 sm:mt-10 max-w-md",
              "ec-meta italic text-[hsl(var(--ink-soft))]",
              "text-[13px] sm:text-sm leading-relaxed",
            )}
          >
            Si algo en ti lo reconoció, empieza aquí.
          </motion.p>

          <motion.div
            {...fade(0.7)}
            className="mt-10 sm:mt-12 w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4"
          >
            <Link
              href="/register"
              className={cn(
                "inline-flex items-center justify-center",
                "px-10 py-4 rounded-full",
                "bg-[hsl(var(--tierra-deep))] text-[hsl(var(--paper))]",
                "text-base font-medium tracking-wide",
                "shadow-md shadow-[hsl(var(--tierra-deep)/0.18)]",
                "hover:shadow-lg hover:-translate-y-[1px] transition-all duration-300",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--terracota))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--paper))]",
              )}
            >
              Crear cuenta
            </Link>
            <Link
              href="/login"
              className={cn(
                "inline-flex items-center justify-center",
                "px-8 py-4 rounded-full",
                "bg-transparent warm-border text-[hsl(var(--tierra-deep))]",
                "text-base font-medium tracking-wide",
                "hover:bg-[hsl(var(--paper-veil))] transition-colors duration-300",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--terracota))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--paper))]",
              )}
            >
              Ya tengo cuenta
            </Link>
          </motion.div>
        </section>

        {showDemoButton && (
          <div className="pb-8 flex justify-center">
            <button
              onClick={onActivateDemo}
              className="px-5 py-2 ec-meta text-[hsl(var(--ink-soft))] hover:text-[hsl(var(--tierra-deep))] warm-border-soft rounded-full transition-colors"
            >
              Ver demo completo
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
