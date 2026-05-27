import { useState, useRef, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useDragControls,
  type PanInfo,
} from "framer-motion";
import { X, ArrowUp, HelpCircle } from "lucide-react";
import { respectsReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface GuideMessage {
  id: string;
  role: "ego" | "user";
  text: string;
}

const WELCOME =
  "Guía rápida del sistema. Respondo breve: etapas, P-E-A, progreso o navegación.";

const SUGGESTED_CHIPS: { label: string; query: string }[] = [
  { label: "¿Qué es P-E-A?", query: "¿Qué es P-E-A?" },
  { label: "¿Cómo completo una etapa?", query: "¿Cómo completo una etapa?" },
  { label: "¿Qué significa el portal?", query: "¿Qué significa el portal?" },
  { label: "¿Dónde veo mi progreso?", query: "¿Dónde veo mi progreso?" },
];

const KNOWLEDGE: { keywords: string[]; response: string }[] = [
  {
    keywords: ["p-e-a", "pea", "pensamiento", "emocion", "accion", "marco"],
    response:
      "P-E-A es Pensamiento · Emoción · Acción. Es la unidad mínima de observación: nombras el pensamiento, la emoción que lo acompañó y la acción (o no-acción) que disparó. Eso es todo. Sin diagnóstico.",
  },
  {
    keywords: [
      "completo una etapa",
      "completar etapa",
      "cerrar etapa",
      "como completo",
      "terminar etapa",
    ],
    response:
      "Abre la etapa desde el mapa (/journey) y atraviesa el encuentro guiado con el Ego. Al final del paso, pulsa Completar etapa. No hay tiempo mínimo: tu sistema decide el ritmo.",
  },
  {
    keywords: ["portal", "umbral", "cruzar"],
    response:
      "El Portal es el umbral simbólico que marca el inicio de tu proceso de 40 etapas. Cruzarlo es una decisión consciente. A partir de ahí, queda abierta la Etapa 1.",
  },
  {
    keywords: ["progreso", "mapa de integracion", "avance", "recorrido", "donde veo"],
    response:
      "En /progress está tu Mapa de integración: etapa actual, avance por fase, etapas observadas y tu diario P-E-A libre. Sin rachas, sin medallas.",
  },
  {
    keywords: ["chat", "ego", "conversacion", "hablar"],
    response:
      "El Chat es conversación profunda con el Ego. La Guía rápida (esto) es solo informativa. Si necesitas observar algo a fondo, ve al Chat.",
  },
  {
    keywords: ["reflexion", "registro libre", "diario", "pea libre"],
    response:
      "En /reflection puedes dejar un Registro P-E-A libre del día. No completa una etapa: es tu diario para observar.",
  },
  {
    keywords: ["empezar", "comenzar", "iniciar", "start"],
    response:
      "Desde el panel principal, pulsa Empezar mi proceso. Pasarás por una introducción breve y luego el Portal. A partir de ahí, las 40 etapas.",
  },
  {
    keywords: ["journey", "constelacion", "mapa", "fases", "40 etapas"],
    response:
      "El recorrido tiene 4 fases: Revelación (1-10), Confrontación (11-20), Reconfiguración (21-30), Integración (31-40). Ábrelo en /journey.",
  },
];

function findResponse(input: string): string {
  const lower = input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  for (const entry of KNOWLEDGE) {
    if (
      entry.keywords.some((kw) =>
        lower.includes(kw.normalize("NFD").replace(/[\u0300-\u036f]/g, "")),
      )
    ) {
      return entry.response;
    }
  }

  return "Puedo responderte sobre P-E-A, cómo completar una etapa, el portal o dónde ver tu progreso. Para observación profunda, abre el Chat.";
}

function Triquetra({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
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

export function EgoGuideButton() {
  const [isOpen, setIsOpen] = useState(false);
  const reduced = respectsReducedMotion();

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={reduced ? false : { scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { scale: 0.6, opacity: 0 }}
            transition={{ type: "spring", damping: 22, stiffness: 320 }}
            onClick={() => setIsOpen(true)}
            className={cn(
              "fixed bottom-[5.5rem] right-4 md:bottom-5 md:right-5 z-30",
              "inline-flex items-center gap-1.5 pl-2 pr-3 py-1.5 rounded-full",
              "paper-surface text-[hsl(var(--tierra-deep))]",
              "shadow-sm shadow-[hsl(var(--tierra-deep)/0.10)]",
              "motion-safe:hover:shadow-md motion-safe:transition-shadow",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--terracota))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--paper))]",
            )}
            style={{ marginBottom: "env(safe-area-inset-bottom)" }}
            whileHover={reduced ? undefined : { scale: 1.04 }}
            whileTap={reduced ? undefined : { scale: 0.96 }}
            aria-label="Abrir guía rápida"
          >
            <span className="w-6 h-6 rounded-full bg-[hsl(var(--paper-veil))] warm-border-soft inline-flex items-center justify-center">
              <Triquetra className="w-3.5 h-3.5" />
            </span>
            <span className="ec-meta text-[11px] hidden md:inline tracking-wide">
              Guía
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && <EgoGuideSheet onClose={() => setIsOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

function EgoGuideSheet({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<GuideMessage[]>([
    { id: "welcome", role: "ego", text: WELCOME },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();
  const reduced = respectsReducedMotion();
  const hasUserAsked = messages.some((m) => m.role === "user");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
    });
  }, [messages, reduced]);

  const sendText = (text: string) => {
    const trimmed = text.trim();
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

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (info.offset.y > 80) onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Guía rápida"
    >
      <div
        className="absolute inset-0 bg-[hsl(var(--tierra-deep)/0.18)] backdrop-blur-[2px]"
        onClick={onClose}
      />

      <motion.div
        initial={reduced ? { opacity: 0 } : { y: "100%" }}
        animate={reduced ? { opacity: 1 } : { y: 0 }}
        exit={reduced ? { opacity: 0 } : { y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
        drag={reduced ? false : "y"}
        dragControls={dragControls}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={handleDragEnd}
        className={cn(
          "relative z-10 w-full max-w-md flex flex-col",
          "living-glass rounded-t-3xl md:rounded-3xl",
          "shadow-2xl shadow-[hsl(var(--tierra-deep)/0.20)]",
          "max-h-[80vh] md:max-h-[65vh]",
        )}
      >
        {/* Drag handle (mobile) */}
        <div
          className="flex flex-col items-center pt-3 pb-1 md:hidden cursor-grab active:cursor-grabbing"
          onPointerDown={(e) => dragControls.start(e)}
        >
          <div
            className="w-10 h-1 rounded-full"
            style={{ background: "hsl(var(--warm-line))" }}
          />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-3 pb-4 border-b border-[hsl(var(--warm-line-soft))]">
          <div className="flex items-start gap-3 min-w-0">
            <span className="shrink-0 w-9 h-9 rounded-full bg-[hsl(var(--paper-veil))] warm-border-soft inline-flex items-center justify-center text-[hsl(var(--tierra-deep))]">
              <HelpCircle className="w-4 h-4" strokeWidth={1.7} />
            </span>
            <div className="min-w-0">
              <p className="ec-eyebrow text-[hsl(var(--terracota))]">
                Ego · utilidad
              </p>
              <h3 className="mt-0.5 ec-serif text-[18px] text-[hsl(var(--tierra-deep))]">
                Guía rápida
              </h3>
              <p className="mt-1 ec-meta italic text-[hsl(var(--ink-soft))] leading-snug">
                Pregúntame sobre etapas, P-E-A, progreso o cómo usar la app.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar guía"
            className={cn(
              "shrink-0 w-8 h-8 rounded-full inline-flex items-center justify-center",
              "text-[hsl(var(--ink-soft))] hover:bg-[hsl(var(--paper-veil))] motion-safe:transition-colors",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--terracota))]",
            )}
          >
            <X className="w-4 h-4" strokeWidth={1.7} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={cn(
                  "max-w-[88%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed",
                  msg.role === "user"
                    ? "bg-[hsl(var(--tierra-deep))] text-[hsl(var(--paper))] rounded-br-md"
                    : "bg-[hsl(var(--paper-veil))] warm-border-soft text-[hsl(var(--ink))] rounded-bl-md",
                )}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Suggested chips (only before user has asked) */}
        {!hasUserAsked && (
          <div className="px-4 pb-3">
            <p className="ec-eyebrow text-[hsl(var(--ink-soft))] mb-2 px-0.5">
              Preguntas frecuentes
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_CHIPS.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => sendText(chip.query)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-[12px]",
                    "warm-border-soft bg-[hsl(var(--paper))] text-[hsl(var(--tierra-deep))]",
                    "hover:bg-[hsl(var(--paper-veil))] motion-safe:transition-colors",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--terracota))]",
                  )}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div
          className="px-4 py-3 border-t border-[hsl(var(--warm-line-soft))]"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendText(input)}
              placeholder="Pregúntame algo…"
              aria-label="Pregunta para la guía rápida"
              className={cn(
                "flex-1 rounded-full px-4 py-2.5 text-[13px]",
                "bg-[hsl(var(--paper))] warm-border-soft text-[hsl(var(--ink))]",
                "placeholder:text-[hsl(var(--ink-soft))]/60",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--terracota))]",
              )}
            />
            <button
              onClick={() => sendText(input)}
              disabled={!input.trim()}
              aria-label="Enviar pregunta"
              className={cn(
                "w-9 h-9 rounded-full inline-flex items-center justify-center shrink-0",
                "bg-[hsl(var(--tierra-deep))] text-[hsl(var(--paper))]",
                "motion-safe:hover:shadow-md motion-safe:transition-shadow",
                "disabled:opacity-40 disabled:hover:shadow-none",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--terracota))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--paper))]",
              )}
            >
              <ArrowUp className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
