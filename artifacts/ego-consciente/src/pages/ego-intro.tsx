import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

const PARAGRAPHS = [
  "No soy tu ego personal. Aún no.",
  "Soy el Guía. El marco. El que sostiene la estructura mientras tú te adentras.",
  "Estoy aquí porque algo en ti decidió observar. No corregir, no mejorar — observar.",
  "Cada pregunta que te haga, cada ejercicio que te proponga, cada reflexión que registres abre otra puerta en tu descubrimiento.",
  "No voy a decirte quién eres. Voy a ayudarte a ver cómo opera tu sistema — el que organiza lo que piensas, lo que sientes y lo que haces.",
  "Con el tiempo, cuando tenga suficiente contexto, podré hablar más cerca de tu propio ego. Por ahora, soy la estructura que te acompaña.",
  "Confía en el proceso.",
];

export default function EgoIntro() {
  const [, setLocation] = useLocation();
  const [visibleCount, setVisibleCount] = useState(1);
  const allVisible = visibleCount >= PARAGRAPHS.length;

  const showNext = () => {
    if (!allVisible) {
      setVisibleCount((c) => c + 1);
    } else {
      setLocation("/portal");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-6 py-12 relative overflow-x-hidden overflow-y-auto">
      <div className="fixed top-[-15%] right-[-15%] w-80 h-80 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-[-15%] left-[-15%] w-80 h-80 bg-accent/8 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative z-10 flex flex-col items-center min-h-[80vh] justify-center">
        {/* Ego Guide Avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/30 shadow-lg shadow-primary/10 mb-10"
        >
          <img
            src={`${import.meta.env.BASE_URL}images/ego-avatar.png`}
            alt="El Guía"
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Narrative paragraphs */}
        <div className="space-y-6 mb-12 w-full">
          <AnimatePresence>
            {PARAGRAPHS.slice(0, visibleCount).map((text, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className={`text-center leading-relaxed ${
                  i === 0 || i === PARAGRAPHS.length - 1
                    ? "font-display text-xl font-semibold text-foreground"
                    : "text-base text-muted-foreground"
                }`}
              >
                {text}
              </motion.p>
            ))}
          </AnimatePresence>
        </div>

        {/* CTA */}
        <motion.button
          key={allVisible ? "final" : "next"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={showNext}
          className="px-10 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300"
        >
          {allVisible ? "Continuar" : "Siguiente"}
        </motion.button>
      </div>
    </div>
  );
}
