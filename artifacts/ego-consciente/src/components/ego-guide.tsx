import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send } from "lucide-react";

interface GuideMessage {
  id: string;
  role: "ego" | "user";
  text: string;
}

const WELCOME = "¿En qué te puedo ayudar? Puedes preguntarme cualquier cosa sobre la aplicación, el proceso o cómo avanzar dentro de él.";

const KNOWLEDGE: { keywords: string[]; response: string }[] = [
  {
    keywords: ["proceso", "qué es", "de qué se trata", "cómo funciona", "explicar"],
    response: "Ego Consciente es un proceso de autoobservación de 40 días. Cada día registras un pensamiento, una emoción y una acción — lo que llamamos el marco PEA. No se trata de cambiar quién eres, sino de observar cómo opera tu sistema interior.",
  },
  {
    keywords: ["empezar", "comenzar", "iniciar", "cómo empiezo", "start"],
    response: "Para iniciar tu proceso, ve a la pantalla principal y presiona 'Empezar mi proceso'. Pasarás por una breve introducción del Ego Guía y luego cruzarás el umbral, que marca el inicio de tus 40 días de observación.",
  },
  {
    keywords: ["chat", "hablar", "conversación", "ego chat"],
    response: "La sección de Chat es donde puedes conversar con el Ego — tu guía interior. Ahí puedes explorar tus pensamientos, emociones y acciones del día con más profundidad. El Ego te hace preguntas que te ayudan a observar sin juzgar.",
  },
  {
    keywords: ["reflexión", "refleccion", "registro", "pea", "pensamiento", "emoción", "emocion", "acción", "accion"],
    response: "El Registro PEA es tu práctica diaria. Cada día identificas: un Pensamiento dominante, la Emoción que lo acompaña y la Acción que tomaste o quieres tomar. Este registro es el corazón del proceso de observación.",
  },
  {
    keywords: ["progreso", "avance", "recorrido"],
    response: "La sección de Progreso muestra tu recorrido a lo largo de los 40 días. Ahí puedes ver qué días has completado tu registro PEA y cómo ha sido tu camino de observación.",
  },
  {
    keywords: ["journey", "mapa", "viaje", "40 días", "40 dias", "fases"],
    response: "El Mapa del Proceso muestra las 4 fases de tus 40 días: Observación (días 1-10), Reconocimiento (días 11-20), Integración (días 21-30) y Congruencia (días 31-40). Cada fase tiene un enfoque diferente en tu proceso de autoobservación.",
  },
  {
    keywords: ["umbral", "portal", "cruzar"],
    response: "El Umbral es el momento simbólico donde decides comenzar tu proceso de 40 días. Es una decisión consciente de comprometerte con la observación. Una vez que lo cruzas, comienza tu Día 1.",
  },
  {
    keywords: ["ego", "quién eres", "quien eres", "guía", "guia"],
    response: "Soy el Ego Guía — no soy tu ego personal, sino la estructura que te acompaña durante el proceso. Estoy aquí para ayudarte a navegar la aplicación y el camino de autoobservación. Con el tiempo, a medida que registres más, podré hablar más cerca de tu propia experiencia.",
  },
  {
    keywords: ["día", "dia", "hoy", "actual"],
    response: "Tu día actual se calcula desde el momento en que cruzaste el umbral. Cada día tienes la oportunidad de registrar tu observación PEA y conversar con el Ego. No hay presión — el proceso se adapta a tu ritmo.",
  },
];

function findResponse(input: string): string {
  const lower = input.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  for (const entry of KNOWLEDGE) {
    if (entry.keywords.some((kw) => lower.includes(kw.normalize("NFD").replace(/[\u0300-\u036f]/g, "")))) {
      return entry.response;
    }
  }

  return "Entiendo tu pregunta. Por ahora, te puedo ayudar con información sobre el proceso, las secciones de la app (chat, reflexión, progreso, mapa), cómo empezar, o qué es el marco PEA. Pregúntame sobre cualquiera de estos temas.";
}

function Triquetra({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      {[0, 120, 240].map((angle) => (
        <ellipse key={angle} cx="50" cy="32" rx="16" ry="28" transform={`rotate(${angle} 50 52)`} />
      ))}
    </svg>
  );
}

export function EgoGuideButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 md:bottom-8 right-6 z-40 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg shadow-primary/25 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Abrir guía del Ego"
      >
        <Triquetra className="w-7 h-7" />
      </motion.button>

      <AnimatePresence>
        {isOpen && <EgoGuidePanel onClose={() => setIsOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

function EgoGuidePanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<GuideMessage[]>([
    { id: "welcome", role: "ego", text: WELCOME },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg: GuideMessage = {
      id: `user_${Date.now()}`,
      role: "user",
      text: trimmed,
    };

    const egoMsg: GuideMessage = {
      id: `ego_${Date.now()}`,
      role: "ego",
      text: findResponse(trimmed),
    };

    setMessages((prev) => [...prev, userMsg, egoMsg]);
    setInput("");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative z-10 w-full max-w-md bg-background border border-border rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col max-h-[80vh] md:max-h-[70vh]"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Triquetra className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-sm font-semibold text-foreground">Ego Guía</h3>
              <p className="text-[10px] text-muted-foreground">Asistente del proceso</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-secondary text-foreground rounded-bl-md"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="px-4 py-3 border-t border-border">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Pregúntame algo..."
              className="flex-1 bg-secondary rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
