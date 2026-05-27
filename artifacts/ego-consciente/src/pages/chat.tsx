import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { useAuth } from "@/lib/auth-context";
import { useStages } from "@/lib/stage-context";
import { getPhaseForStage, TOTAL_STAGES } from "@/lib/stages";
import {
  fetchEgoContext,
  loadChatMessages,
  saveChatMessage,
  buildEgoMemory,
  saveEgoMemory,
  generateWelcome,
  generateResponse,
  type ChatMsg,
  type EgoContext,
} from "@/lib/ego-engine";
import { ArrowLeft, ArrowUp, Wind, Anchor } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { respectsReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

const PRESET_PROMPTS = {
  intensity: "Necesito bajar la intensidad. Acompáñame con algo breve.",
  body: "Quiero volver al cuerpo. Recuérdame respirar y aterrizar.",
} as const;

function Triquetra({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      className={className}
      aria-hidden
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

export default function Chat() {
  const { user } = useAuth();
  const { currentStage } = useStages();
  const reduced = respectsReducedMotion();

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [egoCtx, setEgoCtx] = useState<EgoContext | null>(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
    });
  }, [messages, isTyping, reduced]);

  // Load chat history + ego context on mount (lógica intacta)
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const init = async () => {
      setIsLoading(true);

      const [ctx, existingMessages] = await Promise.all([
        fetchEgoContext(user.id),
        loadChatMessages(user.id),
      ]);

      if (cancelled) return;

      const memory = buildEgoMemory(user.id, ctx);
      saveEgoMemory(memory);

      ctx.messageCount = existingMessages.length;
      setEgoCtx(ctx);
      setMessages(existingMessages);

      if (existingMessages.length === 0) {
        const welcome = generateWelcome(ctx);
        const saved = await saveChatMessage(user.id, "ego", welcome);
        if (saved && !cancelled) {
          setMessages([saved]);
          ctx.messageCount = 1;
        }
      }

      setIsLoading(false);
    };

    init();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const sendText = useCallback(
    async (text: string): Promise<boolean> => {
      const trimmed = text.trim();
      if (!trimmed || !user || !egoCtx || isTyping) return false;

      // Save user message
      const userMsg = await saveChatMessage(user.id, "user", trimmed);
      if (userMsg) {
        setMessages((prev) => [...prev, userMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `temp_${Date.now()}`,
            role: "user" as const,
            content: trimmed,
            created_at: new Date().toISOString(),
          },
        ]);
      }

      setIsTyping(true);

      const updatedCtx = { ...egoCtx, messageCount: egoCtx.messageCount + 1 };
      setEgoCtx(updatedCtx);

      const delay = 1500 + Math.random() * 1500;
      setTimeout(async () => {
        const response = generateResponse(trimmed, updatedCtx);
        const egoMsg = await saveChatMessage(user.id, "ego", response);

        if (egoMsg) {
          setMessages((prev) => [...prev, egoMsg]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: `temp_ego_${Date.now()}`,
              role: "ego" as const,
              content: response,
              created_at: new Date().toISOString(),
            },
          ]);
        }

        setEgoCtx((prev) =>
          prev ? { ...prev, messageCount: prev.messageCount + 1 } : prev,
        );
        setIsTyping(false);
      }, delay);

      return true;
    },
    [user, egoCtx, isTyping],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const text = input.trim();
      if (!text || isTyping || !egoCtx) return;
      const ok = await sendText(text);
      if (ok) setInput("");
    },
    [input, sendText, isTyping, egoCtx],
  );

  // Current phase label for header
  const phaseInfo = useMemo(() => {
    if (!currentStage || currentStage < 1) return null;
    const phase = getPhaseForStage(currentStage);
    return phase;
  }, [currentStage]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
          <div className="flex flex-col items-center gap-4">
            <span className="w-6 h-6 rounded-full border-2 border-[hsl(var(--terracota))] border-t-transparent motion-safe:animate-spin" />
            <p className="ec-serif-italic text-[14px] text-[hsl(var(--ink-soft))]">
              Preparando la conversación…
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="relative flex flex-col h-[calc(100dvh-80px)] md:h-[calc(100dvh-32px)] max-w-3xl mx-auto">
        {/* Soft warm background veil for intimacy */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none -z-10"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 0%, hsl(var(--ambar-soft) / 0.18) 0%, transparent 65%), radial-gradient(70% 60% at 50% 100%, hsl(var(--terracota) / 0.06) 0%, transparent 70%)",
          }}
        />

        {/* Header — cámara íntima */}
        <header className="px-5 sm:px-6 pt-5 pb-4 border-b border-[hsl(var(--warm-line-soft))]">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/dashboard"
              aria-label="Volver al panel"
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full -ml-1",
                "ec-meta italic text-[hsl(var(--ink-soft))]",
                "hover:text-[hsl(var(--tierra-deep))] motion-safe:transition-colors",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--terracota))]",
              )}
            >
              <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.6} />
              Panel
            </Link>

            {phaseInfo && currentStage && (
              <span className="ec-eyebrow text-[hsl(var(--ink-soft))] tracking-wider">
                Etapa {String(currentStage).padStart(2, "0")}
                <span className="text-[hsl(var(--ink-soft))]/60">
                  {" "}
                  / {TOTAL_STAGES}
                </span>{" "}
                · {phaseInfo.name}
              </span>
            )}
          </div>

          <div className="mt-5 flex items-start gap-4">
            <div className="shrink-0 relative">
              <span className="w-14 h-14 rounded-full bg-[hsl(var(--paper-veil))] warm-border inline-flex items-center justify-center text-[hsl(var(--tierra-deep))]">
                <Triquetra className="w-6 h-6" />
              </span>
              <span
                aria-hidden
                className="absolute -inset-1 rounded-full pointer-events-none"
                style={{
                  background:
                    "radial-gradient(50% 50% at 50% 50%, hsl(var(--ambar-soft) / 0.35) 0%, transparent 70%)",
                  zIndex: -1,
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="ec-eyebrow text-[hsl(var(--terracota))]">
                Conversación profunda
              </p>
              <h1 className="mt-1 ec-serif text-2xl sm:text-[28px] leading-tight text-[hsl(var(--tierra-deep))]">
                El Ego
              </h1>
              <p className="mt-1.5 ec-serif-italic text-[13px] sm:text-[14px] text-[hsl(var(--ink-soft))] leading-snug">
                Sin diagnóstico. Sin urgencia. Aquí se observa.
              </p>
            </div>
          </div>
        </header>

        {/* Messages — editorial */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-7 space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  ease: [0.22, 0.61, 0.36, 1],
                }}
                className={cn(
                  "flex flex-col",
                  msg.role === "user" ? "items-end" : "items-start",
                )}
              >
                {msg.role === "ego" ? (
                  <div className="max-w-[92%] sm:max-w-[80%] flex items-start gap-3">
                    <span className="shrink-0 w-7 h-7 rounded-full bg-[hsl(var(--paper-veil))] warm-border-soft inline-flex items-center justify-center text-[hsl(var(--tierra-deep))] mt-0.5">
                      <Triquetra className="w-3.5 h-3.5" />
                    </span>
                    <p
                      className={cn(
                        "ec-serif text-[16px] sm:text-[17px] leading-[1.65]",
                        "text-[hsl(var(--tierra-deep))]",
                        "whitespace-pre-line",
                      )}
                    >
                      {msg.content}
                    </p>
                  </div>
                ) : (
                  <div
                    className={cn(
                      "max-w-[88%] sm:max-w-[72%] px-4 py-3 rounded-2xl rounded-br-md",
                      "bg-[hsl(var(--tierra-deep))] text-[hsl(var(--paper))]",
                      "text-[15px] leading-relaxed",
                      "shadow-sm shadow-[hsl(var(--tierra-deep)/0.18)]",
                    )}
                  >
                    {msg.content}
                  </div>
                )}
                <span className="ec-meta italic text-[hsl(var(--ink-soft))]/70 mt-1.5 mx-2">
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </motion.div>
            ))}

            {isTyping && (
              <motion.div
                initial={reduced ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
                aria-live="polite"
                aria-label="El Ego está escribiendo"
              >
                <span className="shrink-0 w-7 h-7 rounded-full bg-[hsl(var(--paper-veil))] warm-border-soft inline-flex items-center justify-center text-[hsl(var(--tierra-deep))]">
                  <Triquetra className="w-3.5 h-3.5" />
                </span>
                <div className="flex gap-1.5 items-center h-7">
                  {[0, 0.15, 0.3].map((delay) => (
                    <motion.span
                      key={delay}
                      className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--ink-soft))]"
                      animate={reduced ? undefined : { y: [0, -4, 0] }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.9,
                        delay,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} className="h-2" />
        </div>

        {/* Secondary actions */}
        <div className="px-5 sm:px-7 pb-2 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="ec-eyebrow text-[hsl(var(--ink-soft))] mr-1">
              Acciones suaves
            </p>
            <button
              type="button"
              onClick={() => sendText(PRESET_PROMPTS.intensity)}
              disabled={isTyping || !egoCtx}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px]",
                "warm-border-soft bg-[hsl(var(--paper))] text-[hsl(var(--tierra-deep))]",
                "hover:bg-[hsl(var(--paper-veil))] motion-safe:transition-colors",
                "disabled:opacity-40 disabled:cursor-not-allowed",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--terracota))]",
              )}
            >
              <Wind className="w-3.5 h-3.5" strokeWidth={1.6} />
              Bajar intensidad
            </button>
            <button
              type="button"
              onClick={() => sendText(PRESET_PROMPTS.body)}
              disabled={isTyping || !egoCtx}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px]",
                "warm-border-soft bg-[hsl(var(--paper))] text-[hsl(var(--tierra-deep))]",
                "hover:bg-[hsl(var(--paper-veil))] motion-safe:transition-colors",
                "disabled:opacity-40 disabled:cursor-not-allowed",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--terracota))]",
              )}
            >
              <Anchor className="w-3.5 h-3.5" strokeWidth={1.6} />
              Volver al cuerpo
            </button>
          </div>
        </div>

        {/* Input area */}
        <div
          className="px-4 sm:px-6 py-4 border-t border-[hsl(var(--warm-line-soft))] bg-[hsl(var(--paper)/0.7)] backdrop-blur-sm"
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
        >
          <form
            onSubmit={handleSubmit}
            className="relative flex items-end gap-2"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (isTyping || !egoCtx) return;
                  handleSubmit(e as unknown as React.FormEvent);
                }
              }}
              placeholder="Escribe lo que estás observando…"
              aria-label="Mensaje para El Ego"
              rows={1}
              className={cn(
                "flex-1 resize-none rounded-3xl",
                "px-5 py-4 pr-14",
                "bg-[hsl(var(--paper))] warm-border-soft",
                "text-[15px] leading-relaxed text-[hsl(var(--ink))]",
                "placeholder:text-[hsl(var(--ink-soft))]/60",
                "min-h-[56px] max-h-[160px]",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--terracota))]",
                "motion-safe:transition-shadow",
              )}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              aria-label="Enviar mensaje"
              className={cn(
                "absolute right-2 bottom-2",
                "w-10 h-10 rounded-full inline-flex items-center justify-center",
                "bg-[hsl(var(--tierra-deep))] text-[hsl(var(--paper))]",
                "shadow-sm shadow-[hsl(var(--tierra-deep)/0.18)]",
                "motion-safe:hover:shadow-md motion-safe:transition-shadow",
                "disabled:opacity-40 disabled:hover:shadow-none",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--terracota))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--paper))]",
              )}
            >
              <ArrowUp className="w-4 h-4" strokeWidth={2} />
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
