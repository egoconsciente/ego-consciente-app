import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, GitMerge, Compass } from "lucide-react";
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

const PILLARS: {
  title: string;
  body: string;
  Icon: typeof Eye;
}[] = [
  {
    title: "Observa",
    body: "Reconoce el pensamiento, la emoción y la acción que sostienen tu versión actual de ti.",
    Icon: Eye,
  },
  {
    title: "Integra",
    body: "Devuelve coherencia al sistema. Lo que se observa sin juicio empieza a alinearse solo.",
    Icon: GitMerge,
  },
  {
    title: "Elige",
    body: "Recupera agencia. Decide desde la presencia, no desde la inercia heredada.",
    Icon: Compass,
  },
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
        <section className="pt-10 sm:pt-20 pb-16 sm:pb-24 flex flex-col items-center text-center">
          <motion.div {...fade(0.05)} className="mb-7 sm:mb-10">
            <span
              className={cn(
                "inline-flex items-center gap-2 py-1.5 px-3.5 rounded-full",
                "bg-[hsl(var(--paper))] warm-border",
                "ec-eyebrow text-[hsl(var(--terracota))]",
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--terracota))]" />
              40 etapas · sin etiquetas
            </span>
          </motion.div>

          <motion.h1
            {...fade(0.15)}
            className={cn(
              "ec-serif text-[hsl(var(--tierra-deep))]",
              "text-[2rem] leading-[1.08] sm:text-5xl md:text-6xl lg:text-7xl",
              "tracking-[-0.015em] max-w-3xl",
            )}
          >
            No vengo a decirte
            <br />
            quién eres.
          </motion.h1>

          <motion.p
            {...fade(0.3)}
            className={cn(
              "mt-6 sm:mt-8 max-w-2xl",
              "ec-serif-italic text-[hsl(var(--ink))]",
              "text-lg sm:text-2xl md:text-3xl leading-[1.45]",
            )}
          >
            Vengo a mostrarte cómo se organiza la versión de ti que estás
            llamando <span className="text-[hsl(var(--terracota))]">«yo»</span>.
          </motion.p>

          <motion.p
            {...fade(0.45)}
            className={cn(
              "mt-8 sm:mt-10 max-w-xl",
              "text-[hsl(var(--ink-soft))]",
              "text-[15px] sm:text-base leading-relaxed",
            )}
          >
            40 etapas breves. Pensamiento, emoción y acción.
            <br className="hidden sm:block" />
            Un espejo vivo que aprende contigo sin etiquetarte.
          </motion.p>

          <motion.div
            {...fade(0.6)}
            className="mt-10 sm:mt-12 w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4"
          >
            <Link
              href="/register"
              className={cn(
                "group inline-flex items-center justify-center gap-2",
                "px-8 py-4 rounded-full",
                "bg-[hsl(var(--tierra-deep))] text-[hsl(var(--paper))]",
                "text-base font-medium tracking-wide",
                "shadow-md shadow-[hsl(var(--tierra-deep)/0.18)]",
                "hover:shadow-lg hover:-translate-y-[1px] transition-all duration-300",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--terracota))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--paper))]",
              )}
            >
              Iniciar proceso
              <span
                aria-hidden
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              >
                →
              </span>
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

        {/* Pillars */}
        <motion.section
          {...fade(0.75)}
          className="pb-20 sm:pb-28"
          aria-labelledby="pillars-heading"
        >
          <div className="flex items-center justify-center gap-4 mb-8 sm:mb-10">
            <span className="h-px w-10 bg-[hsl(var(--warm-line))]" />
            <h2
              id="pillars-heading"
              className="ec-eyebrow text-[hsl(var(--ink-soft))]"
            >
              El gesto del proceso
            </h2>
            <span className="h-px w-10 bg-[hsl(var(--warm-line))]" />
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {PILLARS.map(({ title, body, Icon }, i) => (
              <li key={title}>
                <motion.article
                  initial={reduced ? false : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{
                    duration: reduced ? 0 : 0.7,
                    delay: reduced ? 0 : 0.05 * i,
                    ease,
                  }}
                  className={cn(
                    "h-full rounded-2xl p-6 sm:p-7",
                    "paper-surface",
                    "flex flex-col gap-3",
                    "transition-shadow duration-300 hover:shadow-md hover:shadow-[hsl(var(--tierra-deep)/0.06)]",
                  )}
                >
                  <span
                    className={cn(
                      "w-10 h-10 inline-flex items-center justify-center rounded-full",
                      "bg-[hsl(var(--paper-veil))] warm-border-soft",
                      "text-[hsl(var(--tierra-deep))]",
                    )}
                  >
                    <Icon className="w-[18px] h-[18px]" strokeWidth={1.6} />
                  </span>
                  <h3 className="ec-serif text-xl text-[hsl(var(--tierra-deep))]">
                    {title}
                  </h3>
                  <p className="text-[15px] leading-relaxed text-[hsl(var(--ink-soft))]">
                    {body}
                  </p>
                </motion.article>
              </li>
            ))}
          </ul>

          <p className="mt-10 text-center ec-meta italic text-[hsl(var(--ink-soft))]">
            Observa. Integra. Elige.
          </p>
        </motion.section>

        {showDemoButton && (
          <div className="pb-12 flex justify-center">
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
