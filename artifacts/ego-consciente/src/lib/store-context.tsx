import React, { createContext, useContext, useState, useEffect } from "react";

export interface Message {
  id: string;
  sender: "ego" | "user";
  text: string;
  timestamp: Date;
}

export interface Reflection {
  id: string;
  day: number;
  pensamiento: string;
  emocion: string;
  accion: string;
  date: Date;
}

interface StoreContextType {
  messages: Message[];
  addMessage: (text: string, sender: "ego" | "user") => void;
  reflections: Reflection[];
  addReflection: (p: string, e: string, a: string) => void;
  currentDay: number;
}

const INITIAL_MESSAGES: Message[] = [
  { id: "1", sender: "ego", text: "No soy tu enemigo. Pero tampoco soy tu esencia. Soy una función.", timestamp: new Date(Date.now() - 100000) },
  { id: "2", sender: "user", text: "¿Qué significa eso exactamente?", timestamp: new Date(Date.now() - 90000) },
  { id: "3", sender: "ego", text: "Significa que puedo observarte sin juzgarte. ¿Qué pensaste, qué sentiste y qué hiciste hoy?", timestamp: new Date(Date.now() - 80000) },
  { id: "4", sender: "user", text: "Hoy me sentí ansioso en el trabajo.", timestamp: new Date(Date.now() - 70000) },
  { id: "5", sender: "ego", text: "No quiero etiquetarte. Quiero ayudarte a observar tu patrón. Cuando tu sistema se tensa, ¿qué intenta proteger?", timestamp: new Date(Date.now() - 60000) },
  { id: "6", sender: "ego", text: "Hoy no busques perfección. Busca un paso mínimo congruente.", timestamp: new Date(Date.now() - 50000) },
];

const INITIAL_REFLECTIONS: Reflection[] = [
  { id: "r1", day: 5, pensamiento: "Observé tensión al comenzar el día", emocion: "Ansiedad ligera", accion: "Respiré profundo antes de empezar", date: new Date(Date.now() - 86400000 * 2) },
  { id: "r2", day: 6, pensamiento: "Noté un patrón de evitación", emocion: "Incomodidad", accion: "Decidí hacer la tarea difícil primero", date: new Date(Date.now() - 86400000) },
];

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const currentDay = 7; // Hardcoded to 7 as per requirements

  // Load from local storage on mount
  useEffect(() => {
    const storedMessages = localStorage.getItem("ego_messages");
    if (storedMessages) {
      try {
        const parsed = JSON.parse(storedMessages);
        // revive dates
        setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
      } catch (e) { console.error(e); }
    } else {
      setMessages(INITIAL_MESSAGES);
    }

    const storedReflections = localStorage.getItem("ego_reflections");
    if (storedReflections) {
      try {
        const parsed = JSON.parse(storedReflections);
        setReflections(parsed.map((r: any) => ({ ...r, date: new Date(r.date) })));
      } catch (e) { console.error(e); }
    } else {
      setReflections(INITIAL_REFLECTIONS);
    }
  }, []);

  // Save to local storage when state changes
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("ego_messages", JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (reflections.length > 0) {
      localStorage.setItem("ego_reflections", JSON.stringify(reflections));
    }
  }, [reflections]);

  const addMessage = (text: string, sender: "ego" | "user") => {
    const newMessage: Message = {
      id: Math.random().toString(36).substring(7),
      text,
      sender,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addReflection = (p: string, e: string, a: string) => {
    const newReflection: Reflection = {
      id: Math.random().toString(36).substring(7),
      day: currentDay,
      pensamiento: p,
      emocion: e,
      accion: a,
      date: new Date()
    };
    // Only keep one reflection per day for simplicity in this mock, or just append
    setReflections(prev => {
      const filtered = prev.filter(ref => ref.day !== currentDay);
      return [...filtered, newReflection].sort((x, y) => x.day - y.day);
    });
  };

  return (
    <StoreContext.Provider value={{ messages, addMessage, reflections, addReflection, currentDay }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
