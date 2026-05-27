import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { EcSigil } from "@/components/ec";
import { respectsReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Paragraph = { text: string; tone: "serif" | "body" };

const PARAGRAPHS: Paragraph[] = [
  { text: "No soy tu ego personal. Aún no.", tone: "serif" },
  {
    text: "Soy el Guía. El marco. El que sostiene la estructura mientras tú te adentras.",
    tone: "body",
  },
  {
    text: "Estoy aquí porque algo en ti decidió observar. No corregir. No mejorar. Observar.",
    tone: "body",
  },
  {
    text: "Cada pregunta que te haga, cada ejercicio que te proponga, cada reflexión que registres abre otra puerta en tu propio descubrimiento.",
    tone: "body",
  },
  {
    text: "No voy a decirte quién eres. Voy a ayudarte a ver cómo opera tu sistema — el que organiza lo que piensas, lo que sientes y lo que haces.",
    tone: "body",
  },
  {
    text: "Con el tiempo, cuando tenga suficiente contexto, podré hablar más cerca de tu propio ego. Por ahora, soy la estructura que te acompaña.",
    tone: "body",
  },
  { text: "Confía en el proceso.", tone: "serif" },
];

export default function EgoIntro() {
  const [, setLocation] = useLocation();
  const [visibleCount, setVisibleCount] = useState(1);
  const reduced = respectsReducedMotion();

  const allVisible = visibleCount >= PARAGRAPHS.length;
  const hasReadEnough = visibleCount >= 3;

  const reveal = () => setVisibleCount((c) => Math.min(c + 1, PARAGRAPHS.length));
  const advance = () => setLocation("/portal");

  return (
    <div className="min-h-screen bg-[hsl(var(--paper))] text-[hsl(var(--ink))] flex flex-col items-center px-5 sm:px-6 py-10 sm:py-14 relative overflow-x-hidden">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(55% 40% at 50% 5%, hsl(var(--ambar-soft) / 0.22) 0%, transparent 65%), radial-gradient(70% 55% at 50% 100%, hsl(var(--paper-altar)) 0%, transparent 55%)",
        }}
      />

      <div className="w-full max-w-xl relative z-10 flex flex-col items-center">
        {/* Sigil medallion — first encounter */}
        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reduced ? 0 : 1.4, ease: [0.22, 0.61, 0.36, 1] }}
          className="relative mb-10 sm:mb-12"
        >
          {/* Breathing ring */}
          {!reduced && (
            <motion.span
              aria-hidden
              className="absolute inset-[-14px] rounded-full"
              style={{ border: "1px solid hsl(var(--warm-line) / 0.55)" }}
              animate={{ scale: [1, 1.06, 1], opacity: [0.5, 0.85, 0.5] }}
              transition={{
                duration: 6.5,
                repeat: Infinity,
                ease: [0.45, 0.05, 0.55, 0.95],
              }}
            />
          )}
          {!reduced && (
            <motion.span
              aria-hidden
              className="absolute inset-2 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, hsl(var(--ambar-soft) / 0.35) 0%, transparent 70%)",
              }}
              animate={{ opacity: [0.4, 0.75, 0.4] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
          <span
            className={cn(
              "relative inline-flex items-center justify-center",
              "w-24 h-24 sm:w-28 sm:h-28 rounded-full",
              "paper-surface text-[hsl(var(--tierra-deep))]",
            )}
          >
            <EcSigil variant="hairline" size={62} />
          </span>
        </motion.div>

        {/* Greeting eyebrow */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduced ? 0 : 0.4, duration: reduced ? 0 : 0.7 }}
          className="text-center mb-8"
        >
          <p className="ec-eyebrow text-[hsl(var(--terracota))]">Primer encuentro</p>
          <p className="ec-meta italic text-[hsl(var(--ink-soft))] mt-2">
            El Ego Guía
          </p>
        </motion.div>

        {/* Narrative paragraphs */}
        <div className="w-full space-y-6 mb-12">
          <AnimatePresence initial={false}>
            {PARAGRAPHS.slice(0, visibleCount).map((p, i) => (
              <motion.p
                key={i}
                initial={reduced ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: reduced ? 0 : 0.85,
                  ease: [0.22, 0.61, 0.36, 1],
                }}
                className={cn(
                  "text-center leading-relaxed",
                  p.tone === "serif"
                    ? "ec-serif text-xl sm:text-2xl text-[hsl(var(--tierra-deep))]"
                    : "text-[15px] sm:text-base text-[hsl(var(--ink))] max-w-md mx-auto",
                )}
              >
                {p.text}
              </motion.p>
            ))}
          </AnimatePresence>
        </div>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={allVisible ? advance : reveal}
            className={cn(
              "w-full sm:w-auto inline-flex items-center justify-center gap-2",
              "px-9 py-4 rounded-full",
              "bg-[hsl(var(--tierra-deep))] text-[hsl(var(--paper))]",
              "text-base font-medium tracking-wide",
              "shadow-md shadow-[hsl(var(--tierra-deep)/0.18)]",
              "hover:shadow-lg hover:-translate-y-[1px] transition-all duration-300",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--terracota))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--paper))]",
            )}
          >
            <span>{allVisible ? "Continuar al umbral" : "Siguiente"}</span>
            <ArrowRight className="w-4 h-4" strokeWidth={1.8} />
          </button>

          <AnimatePresence>
            {!allVisible && hasReadEnough && (
              <motion.button
                type="button"
                onClick={advance}
                initial={reduced ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0 }}
                transition={{ duration: reduced ? 0 : 0.5 }}
                className={cn(
                  "ec-meta italic text-[hsl(var(--ink-soft))]",
                  "hover:text-[hsl(var(--tierra-deep))] transition-colors",
                  "focus:outline-none focus-visible:underline",
                )}
              >
                Continuar
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
