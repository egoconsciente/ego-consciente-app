import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase";
import { useAuth } from "./auth-context";
import { TOTAL_STAGES, type StageDefinition, getStage } from "./stages";

export interface StageProgress {
  stageNumber: number;
  status: "locked" | "in_progress" | "completed";
  startedAt: string | null;
  completedAt: string | null;
  userConfirmedComplete: boolean;
}

interface StageContextType {
  stages: StageProgress[];
  currentStage: number;
  completedCount: number;
  isLoading: boolean;
  getCurrentStageDefinition: () => StageDefinition | undefined;
  getStageProgress: (stageNumber: number) => StageProgress;
  completeStage: (stageNumber: number) => Promise<boolean>;
  isProcessComplete: boolean;
  reload: () => Promise<void>;
}

const StageContext = createContext<StageContextType | undefined>(undefined);

const DEFAULT_PROGRESS: StageProgress = {
  stageNumber: 0,
  status: "locked",
  startedAt: null,
  completedAt: null,
  userConfirmedComplete: false,
};

export function StageProvider({ children }: { children: React.ReactNode }) {
  const { user, portalComplete } = useAuth();
  const [stages, setStages] = useState<StageProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadStages = useCallback(async () => {
    if (!user || !portalComplete) {
      setStages([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const { data, error } = await supabase
      .from("stage_progress")
      .select("*")
      .eq("user_id", user.id)
      .order("stage_number", { ascending: true });

    if (error) {
      console.error("[StageContext] Error loading stages:", error);
      setIsLoading(false);
      return;
    }

    const mapped: StageProgress[] = (data || []).map((row: {
      stage_number: number;
      status: string;
      started_at: string | null;
      completed_at: string | null;
      user_confirmed_complete: boolean;
    }) => ({
      stageNumber: row.stage_number,
      status: row.status as StageProgress["status"],
      startedAt: row.started_at,
      completedAt: row.completed_at,
      userConfirmedComplete: row.user_confirmed_complete,
    }));

    setStages(mapped);
    setIsLoading(false);
  }, [user, portalComplete]);

  useEffect(() => {
    loadStages();
  }, [loadStages]);

  const getStageProgress = useCallback(
    (stageNumber: number): StageProgress => {
      return stages.find((s) => s.stageNumber === stageNumber) || {
        ...DEFAULT_PROGRESS,
        stageNumber,
      };
    },
    [stages]
  );

  const currentStage = (() => {
    if (stages.length === 0) return 1;

    const inProgress = stages.find((s) => s.status === "in_progress");
    if (inProgress) return inProgress.stageNumber;

    const completedNums = stages
      .filter((s) => s.status === "completed")
      .map((s) => s.stageNumber);

    if (completedNums.length === 0) return 1;

    const maxCompleted = Math.max(...completedNums);
    if (maxCompleted >= TOTAL_STAGES) return TOTAL_STAGES;
    return maxCompleted + 1;
  })();

  const completedCount = stages.filter((s) => s.status === "completed").length;

  const isProcessComplete = completedCount >= TOTAL_STAGES;

  const getCurrentStageDefinition = useCallback(() => {
    return getStage(currentStage);
  }, [currentStage]);

  const completeStage = useCallback(
    async (stageNumber: number): Promise<boolean> => {
      if (!user) return false;

      if (stageNumber !== currentStage) {
        console.warn("[StageContext] Cannot complete stage", stageNumber, "— current is", currentStage);
        return false;
      }

      const progress = stages.find((s) => s.stageNumber === stageNumber);
      if (progress && progress.status === "completed") {
        console.warn("[StageContext] Stage", stageNumber, "is already completed");
        return false;
      }

      const now = new Date().toISOString();

      const { error: completeError } = await supabase
        .from("stage_progress")
        .upsert(
          {
            user_id: user.id,
            stage_number: stageNumber,
            status: "completed",
            completed_at: now,
            user_confirmed_complete: true,
            updated_at: now,
          },
          { onConflict: "user_id,stage_number" }
        );

      if (completeError) {
        console.error("[StageContext] Error completing stage:", completeError);
        return false;
      }

      if (stageNumber < TOTAL_STAGES) {
        const { error: unlockError } = await supabase
          .from("stage_progress")
          .upsert(
            {
              user_id: user.id,
              stage_number: stageNumber + 1,
              status: "in_progress",
              started_at: now,
              updated_at: now,
            },
            { onConflict: "user_id,stage_number" }
          );

        if (unlockError) {
          console.error("[StageContext] Error unlocking next stage:", unlockError);
        }
      }

      await loadStages();
      return true;
    },
    [user, currentStage, stages, loadStages]
  );

  return (
    <StageContext.Provider
      value={{
        stages,
        currentStage,
        completedCount,
        isLoading,
        getCurrentStageDefinition,
        getStageProgress,
        completeStage,
        isProcessComplete,
        reload: loadStages,
      }}
    >
      {children}
    </StageContext.Provider>
  );
}

export function useStages() {
  const context = useContext(StageContext);
  if (context === undefined) {
    throw new Error("useStages must be used within a StageProvider");
  }
  return context;
}
