import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "./supabase";
import { useStages } from "./stage-context";
import { useAuth } from "./auth-context";

export interface Reflection {
  id: string;
  day: number;
  pensamiento: string;
  emocion: string;
  accion: string;
  date: Date;
}

interface StoreContextType {
  reflections: Reflection[];
  addReflection: (p: string, e: string, a: string) => Promise<boolean>;
  currentStage: number;
  isLoadingData: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const { currentStage, isLoading: isLoadingStages, loadError } = useStages();
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setIsLoadingData(true);

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

  const addReflection = async (p: string, e: string, a: string): Promise<boolean> => {
    if (!user || isLoadingData || isLoadingStages || loadError) return false;
    // Never upsert into a legacy chronological slot: a conflicting entry must survive.
    const { data, error } = await supabase.from("pea_entries").insert({
      user_id: user.id, day_number: currentStage, thought: p, emotion: e, action: a,
    }).select().single();
    if (error || !data) {
      console.error("Error guardando reflexión (registro existente protegido):", error);
      return false;
    }
    setReflections(prev => [...prev, {
      id: data.id, day: data.day_number, pensamiento: data.thought,
      emocion: data.emotion, accion: data.action, date: new Date(data.created_at),
    }]);
    return true;
  };

  return (
    <StoreContext.Provider
      value={{ reflections, addReflection, currentStage, isLoadingData: isLoadingData || isLoadingStages }}
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
