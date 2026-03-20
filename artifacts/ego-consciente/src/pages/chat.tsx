import { useState, useRef, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { useAuth } from "@/lib/auth-context";
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
import { Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [egoCtx, setEgoCtx] = useState<EgoContext | null>(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Load chat history + ego context on mount
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

      // Build and save ego memory
      const memory = buildEgoMemory(user.id, ctx);
      saveEgoMemory(memory);

      ctx.messageCount = existingMessages.length;
      setEgoCtx(ctx);
      setMessages(existingMessages);

      // If no messages exist, generate a welcome
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
    return () => { cancelled = true; };
  }, [user]);

  const handleSend = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || !user || !egoCtx || isTyping) return;

      const userText = input.trim();
      setInput("");

      // Save user message
      const userMsg = await saveChatMessage(user.id, "user", userText);
      if (userMsg) {
        setMessages((prev) => [...prev, userMsg]);
      } else {
        // Optimistic fallback if save fails
        setMessages((prev) => [
          ...prev,
          {
            id: `temp_${Date.now()}`,
            role: "user" as const,
            content: userText,
            created_at: new Date().toISOString(),
          },
        ]);
      }

      // Show typing indicator
      setIsTyping(true);

      // Update context for response generation
      const updatedCtx = { ...egoCtx, messageCount: egoCtx.messageCount + 1 };
      setEgoCtx(updatedCtx);

      // Generate and save ego response after a realistic delay
      const delay = 1500 + Math.random() * 1500;
      setTimeout(async () => {
        const response = generateResponse(userText, updatedCtx);
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
          prev ? { ...prev, messageCount: prev.messageCount + 1 } : prev
        );
        setIsTyping(false);
      }, delay);
    },
    [input, user, egoCtx, isTyping]
  );

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-muted-foreground text-sm">
              Preparando la conversación...
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-full h-[calc(100vh-80px)] md:h-screen max-w-4xl mx-auto">
        {/* Chat Header */}
        <header className="px-6 py-4 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-border shadow-sm">
            <img
              src={`${import.meta.env.BASE_URL}images/ego-avatar.png`}
              alt="Ego Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">El Ego</h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
              Observando
            </p>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[75%]">
                  {msg.role === "ego" && (
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-border shrink-0 hidden sm:block mb-1">
                      <img
                        src={`${import.meta.env.BASE_URL}images/ego-avatar.png`}
                        alt="Ego"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div
                    className={`p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-card border border-border text-card-foreground rounded-bl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 mx-2">
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </motion.div>
            ))}

            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-3 text-muted-foreground text-sm"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border border-border shrink-0 hidden sm:block">
                  <img
                    src={`${import.meta.env.BASE_URL}images/ego-avatar.png`}
                    alt="Ego"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="bg-card border border-border rounded-2xl rounded-bl-none p-4 flex gap-1 items-center h-12">
                  <motion.div
                    className="w-1.5 h-1.5 bg-muted-foreground rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                  />
                  <motion.div
                    className="w-1.5 h-1.5 bg-muted-foreground rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.6,
                      delay: 0.2,
                    }}
                  />
                  <motion.div
                    className="w-1.5 h-1.5 bg-muted-foreground rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.6,
                      delay: 0.4,
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} className="h-4" />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-background border-t border-border">
          <form
            onSubmit={handleSend}
            className="relative max-w-4xl mx-auto flex items-end gap-2"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder="Escribe aquí tu observación..."
              className="w-full bg-card border border-border rounded-2xl py-4 pl-5 pr-14 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none min-h-[60px] max-h-[150px] transition-all"
              rows={1}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-3 bottom-3 p-2 bg-primary text-primary-foreground rounded-xl disabled:opacity-50 disabled:bg-muted disabled:text-muted-foreground hover:bg-primary/90 transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
