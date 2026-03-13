import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "./supabase";
import { useAuth } from "./auth-context";

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
  isLoadingData: boolean;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    sender: "ego",
    text: "No soy tu enemigo. Pero tampoco soy tu esencia. Soy una función.",
    timestamp: new Date(Date.now() - 100000),
  },
  {
    id: "2",
    sender: "user",
    text: "¿Qué significa eso exactamente?",
    timestamp: new Date(Date.now() - 90000),
  },
  {
    id: "3",
    sender: "ego",
    text: "Significa que puedo observarte sin juzgarte. ¿Qué pensaste, qué sentiste y qué hiciste hoy?",
    timestamp: new Date(Date.now() - 80000),
  },
  {
    id: "4",
    sender: "user",
    text: "Hoy me sentí ansioso en el trabajo.",
    timestamp: new Date(Date.now() - 70000),
  },
  {
    id: "5",
    sender: "ego",
    text: "No quiero etiquetarte. Quiero ayudarte a observar tu patrón. Cuando tu sistema se tensa, ¿qué intenta proteger?",
    timestamp: new Date(Date.now() - 60000),
  },
  {
    id: "6",
    sender: "ego",
    text: "Hoy no busques perfección. Busca un paso mínimo congruente.",
    timestamp: new Date(Date.now() - 50000),
  },
];

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [currentDay, setCurrentDay] = useState(1);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Messages stay in localStorage — chat is not yet persisted to DB
  useEffect(() => {
    const storedMessages = localStorage.getItem("ego_messages");
    if (storedMessages) {
      try {
        const parsed = JSON.parse(storedMessages);
        setMessages(
          parsed.map((m: { timestamp: string | number | Date } & Record<string, unknown>) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          }))
        );
      } catch (e) {
        console.error("Error cargando mensajes:", e);
        setMessages(INITIAL_MESSAGES);
      }
    } else {
      setMessages(INITIAL_MESSAGES);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("ego_messages", JSON.stringify(messages));
    }
  }, [messages]);

  // Load reflections and currentDay from Supabase when user is available
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setIsLoadingData(true);

      // Load profile to calculate currentDay
      const { data: profile } = await supabase
        .from("profiles")
        .select("created_at")
        .eq("id", user.id)
        .single();

      if (profile) {
        const daysDiff = Math.floor(
          (Date.now() - new Date(profile.created_at).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        setCurrentDay(Math.min(Math.max(daysDiff + 1, 1), 40));
      }

      // Load PEA entries
      const { data: entries, error } = await supabase
        .from("pea_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("day_number", { ascending: true });

      if (error) {
        console.error("Error cargando entradas PEA:", error);
      } else if (entries) {
        const mapped: Reflection[] = entries.map(
          (entry: {
            id: string;
            day_number: number;
            thought: string;
            emotion: string;
            action: string;
            created_at: string;
          }) => ({
            id: entry.id,
            day: entry.day_number,
            pensamiento: entry.thought,
            emocion: entry.emotion,
            accion: entry.action,
            date: new Date(entry.created_at),
          })
        );
        setReflections(mapped);
      }

      setIsLoadingData(false);
    };

    loadData();
  }, [user]);

  const addMessage = (text: string, sender: "ego" | "user") => {
    const newMessage: Message = {
      id: Math.random().toString(36).substring(7),
      text,
      sender,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const addReflection = (p: string, e: string, a: string) => {
    if (!user) return;

    // Optimistic update — immediately reflect in UI
    const tempId = `temp_${Math.random().toString(36).substring(7)}`;
    const newReflection: Reflection = {
      id: tempId,
      day: currentDay,
      pensamiento: p,
      emocion: e,
      accion: a,
      date: new Date(),
    };
    setReflections((prev) => {
      const filtered = prev.filter((ref) => ref.day !== currentDay);
      return [...filtered, newReflection].sort((x, y) => x.day - y.day);
    });

    // Persist to Supabase asynchronously
    supabase
      .from("pea_entries")
      .upsert(
        {
          user_id: user.id,
          day_number: currentDay,
          thought: p,
          emotion: e,
          action: a,
        },
        { onConflict: "user_id,day_number" }
      )
      .select()
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error("Error guardando reflexión:", error);
        } else if (data) {
          setReflections((prev) =>
            prev.map((ref) =>
              ref.id === tempId ? { ...ref, id: data.id } : ref
            )
          );
        }
      });
  };

  return (
    <StoreContext.Provider
      value={{ messages, addMessage, reflections, addReflection, currentDay, isLoadingData }}
    >
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
