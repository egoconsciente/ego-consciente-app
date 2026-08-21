import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "./supabase";
import { useAuth } from "./auth-context";
import { reportClientError } from "./client-observability";

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
  addReflection: (p: string, e: string, a: string) => void;
  currentDay: number;
  isLoadingData: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [currentDay, setCurrentDay] = useState(1);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setIsLoadingData(true);

      const { data: journeyState } = await supabase
        .from("journey_state")
        .select("process_started_at")
        .eq("user_id", user.id)
        .maybeSingle();

      if (journeyState?.process_started_at) {
        const daysDiff = Math.floor(
          (Date.now() - new Date(journeyState.process_started_at).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        setCurrentDay(Math.min(Math.max(daysDiff + 1, 1), 40));
      } else {
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
      }

      const { data: entries, error } = await supabase
        .from("pea_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("day_number", { ascending: true });

      if (error) {
        reportClientError("pea_entries_load_failed", error);
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

  const addReflection = (p: string, e: string, a: string) => {
    if (!user) return;

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
          reportClientError("pea_reflection_save_failed", error, {
            dayNumber: currentDay,
          });
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
      value={{ reflections, addReflection, currentDay, isLoadingData }}
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
