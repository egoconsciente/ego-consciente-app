import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { shouldShowRitual, isDemoMode } from "@/lib/demo-mode";

const STORAGE_KEY = "ego_ritual_seen";

const INTRO_LINES = [
  "Nos dijeron que el ego era el enemigo.",
  "Que había que silenciarlo.",
  "Pero casi nadie explicó cómo funciona.",
  "Hoy puedes empezar a descubrirlo.",
];

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

type Phase = "splash" | "intro" | "landing";

export default function Landing() {
  const showRitual = shouldShowRitual();
  const [phase, setPhase] = useState<Phase>(showRitual ? "splash" : "landing");
  const [introIndex, setIntroIndex] = useState(0);

  useEffect(() => {
    if (phase !== "splash") return;
    const timer = setTimeout(() => setPhase("intro"), 2800);
    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "intro") return;
    if (introIndex < INTRO_LINES.length - 1) {
      const timer = setTimeout(() => setIntroIndex((i) => i + 1), 1800);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => {
      if (!isDemoMode()) {
        localStorage.setItem(STORAGE_KEY, "true");
      }
      setPhase("landing");
    }, 2200);
    return () => clearTimeout(timer);
  }, [phase, introIndex]);

  const skipRitual = useCallback(() => {
    if (!isDemoMode()) {
      localStorage.setItem(STORAGE_KEY, "true");
    }
    setPhase("landing");
  }, []);

  if (phase === "splash") {
    return (
      <div
        className="min-h-screen bg-background flex items-center justify-center relative"
        onClick={skipRitual}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <Triquetra className="w-32 h-32 text-primary" />
          <motion.div
            className="absolute inset-0"
            animate={{ opacity: [0.2, 0.6, 0.2], scale: [1, 1.06, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Triquetra className="w-32 h-32 text-primary blur-lg" />
          </motion.div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 text-xs text-muted-foreground"
        >
          Toca para continuar
        </motion.p>
      </div>
    );
  }

  if (phase === "intro") {
    return (
      <div
        className="min-h-screen bg-background flex items-center justify-center px-8 relative"
        onClick={skipRitual}
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={introIndex}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.6 }}
            className="font-display text-2xl md:text-3xl text-center text-foreground max-w-xl leading-relaxed italic"
          >
            {INTRO_LINES[introIndex]}
          </motion.p>
        </AnimatePresence>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 0.5 }}
          className="absolute bottom-10 text-xs text-muted-foreground"
        >
          Toca para saltar
        </motion.p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-40">
        <img
          src={`${import.meta.env.BASE_URL}images/hero-abstract.png`}
          alt="Abstract calm background"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-6 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="inline-block py-1 px-3 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold tracking-widest uppercase mb-8 border border-border/50">
            Un proceso de observación
          </span>
        </motion.div>

        <motion.h1
          className="font-display text-4xl md:text-6xl lg:text-7xl leading-tight text-foreground mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          "No vengo a decirte quién eres. <br className="hidden md:block" />
          <span className="text-primary italic">
            Vengo a mostrarte cómo se construye la historia que hoy llamas
            'yo'.
          </span>
          "
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 font-light leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          Ego Consciente es un proceso de autoobservación.
          <br />
          Aquí no vienes a recibir una etiqueta.
          <br />
          Vienes a recuperar claridad.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-medium text-lg hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300"
          >
            Iniciar proceso
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 bg-transparent text-foreground border border-border rounded-2xl font-medium text-lg hover:bg-secondary hover:border-secondary transition-all duration-300"
          >
            Ya tengo cuenta
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
