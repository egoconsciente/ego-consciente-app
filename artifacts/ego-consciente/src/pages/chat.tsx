import { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { useStore, type Message } from "@/lib/store-context";
import { Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const EGO_RESPONSES = [
  "Cuéntame algo más sobre eso.",
  "¿Qué notaste en tu cuerpo cuando eso ocurrió?",
  "Tu sistema tiende a buscar seguridad. ¿Qué lo activa?",
  "Eso es una observación valiosa. Continúa.",
  "Hoy no busques perfección. Busca un paso mínimo congruente."
];

export default function Chat() {
  const { messages, addMessage } = useStore();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    addMessage(input.trim(), "user");
    setInput("");
    setIsTyping(true);

    // Mock Ego response delay
    setTimeout(() => {
      const randomResponse = EGO_RESPONSES[Math.floor(Math.random() * EGO_RESPONSES.length)];
      addMessage(randomResponse, "ego");
      setIsTyping(false);
    }, 2000 + Math.random() * 1500); // 2-3.5s delay for realism
  };

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
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[75%]">
                  {msg.sender === "ego" && (
                     <div className="w-8 h-8 rounded-full overflow-hidden border border-border shrink-0 hidden sm:block mb-1">
                        <img src={`${import.meta.env.BASE_URL}images/ego-avatar.png`} alt="Ego" className="w-full h-full object-cover" />
                     </div>
                  )}
                  <div 
                    className={`p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                      msg.sender === "user" 
                        ? "bg-primary text-primary-foreground rounded-br-none" 
                        : "bg-card border border-border text-card-foreground rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 mx-2">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                    <img src={`${import.meta.env.BASE_URL}images/ego-avatar.png`} alt="Ego" className="w-full h-full object-cover" />
                </div>
                <div className="bg-card border border-border rounded-2xl rounded-bl-none p-4 flex gap-1 items-center h-12">
                  <motion.div className="w-1.5 h-1.5 bg-muted-foreground rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                  <motion.div className="w-1.5 h-1.5 bg-muted-foreground rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                  <motion.div className="w-1.5 h-1.5 bg-muted-foreground rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} className="h-4" />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-background border-t border-border">
          <form onSubmit={handleSend} className="relative max-w-4xl mx-auto flex items-end gap-2">
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
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
              disabled={!input.trim()}
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
