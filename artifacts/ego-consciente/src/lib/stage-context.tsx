import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase";
import { useAuth } from "./auth-context";
import { TOTAL_STAGES, type StageDefinition, getStage } from "./stages";

export interface StageReflection {
  thought: string;
  emotion: string;
  action: string;
  notes: string;
}

export interface StageProgress {
  stageNumber: number;
  status: "locked" | "in_progress" | "completed";
  startedAt: string | null;
  completedAt: string | null;
  userConfirmedComplete: boolean;
  thought: string | null;
  emotion: string | null;
  action: string | null;
  notes: string | null;
  completionReady: boolean;
  completionMissing: string[];
  egoFollowupCount: number;
}

export interface MissingField {
  field: "thought" | "emotion" | "action";
  message: string;
}

export type ValidationResult =
  | { valid: true }
  | { valid: false; missing: MissingField[] };

interface StageContextType {
  stages: StageProgress[];
  currentStage: number;
  completedCount: number;
  isLoading: boolean;
  getCurrentStageDefinition: () => StageDefinition | undefined;
  getStageProgress: (stageNumber: number) => StageProgress;
  completeStageWithData: (stageNumber: number, data: StageReflection) => Promise<{ success: boolean; validation?: ValidationResult }>;
  saveReflection: (stageNumber: number, data: Partial<StageReflection>) => Promise<boolean>;
  recordValidationFailure: (stageNumber: number, missing: string[]) => Promise<void>;
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
  thought: null,
  emotion: null,
  action: null,
  notes: null,
  completionReady: false,
  completionMissing: [],
  egoFollowupCount: 0,
};

function isValidText(text: string | null | undefined): boolean {
  if (!text) return false;
  const trimmed = text.trim();
  if (trimmed.length < 3) return false;
  if (/^[.\-_,;:!?¡¿\s]+$/.test(trimmed)) return false;
  if (/^(.)\1+$/.test(trimmed)) return false;
  const words = trimmed.split(/\s+/).filter(w => w.length > 0);
  if (words.length === 1 && trimmed.length < 4) return false;
  return true;
}

export function validateReflection(data: StageReflection): ValidationResult {
  const missing: MissingField[] = [];

  if (!isValidText(data.thought)) {
    missing.push({
      field: "thought",
      message: "Antes de avanzar, necesito una frase clara de lo que estabas pensando en esa situación.",
    });
  }

  if (!isValidText(data.emotion)) {
    missing.push({
      field: "emotion",
      message: "¿Qué sentiste exactamente? Evita algo muy general si puedes. Nombra la emoción más real.",
    });
  }

  if (!isValidText(data.action)) {
    missing.push({
      field: "action",
      message: "¿Qué hiciste o qué evitaste hacer en ese momento?",
    });
  }

  if (missing.length > 0) return { valid: false, missing };
  return { valid: true };
}

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

    const mapped: StageProgress[] = (data || []).map((row: Record<string, unknown>) => ({
      stageNumber: row.stage_number as number,
      status: row.status as StageProgress["status"],
      startedAt: (row.started_at as string) || null,
      completedAt: (row.completed_at as string) || null,
      userConfirmedComplete: (row.user_confirmed_complete as boolean) || false,
      thought: (row.thought as string) || null,
      emotion: (row.emotion as string) || null,
      action: (row.action as string) || null,
      notes: (row.notes as string) || null,
      completionReady: (row.completion_ready as boolean) || false,
      completionMissing: (row.completion_missing as string[]) || [],
      egoFollowupCount: (row.ego_followup_count as number) || 0,
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

  const saveReflection = useCallback(
    async (stageNumber: number, data: Partial<StageReflection>): Promise<boolean> => {
      if (!user) return false;

      const updatePayload: Record<string, unknown> = {
        user_id: user.id,
        stage_number: stageNumber,
        updated_at: new Date().toISOString(),
      };

      if (data.thought !== undefined) updatePayload.thought = data.thought;
      if (data.emotion !== undefined) updatePayload.emotion = data.emotion;
      if (data.action !== undefined) updatePayload.action = data.action;
      if (data.notes !== undefined) updatePayload.notes = data.notes;

      const { error } = await supabase
        .from("stage_progress")
        .upsert(updatePayload, { onConflict: "user_id,stage_number" });

      if (error) {
        console.error("[StageContext] Error saving reflection:", error);
        return false;
      }

      setStages((prev) => {
        const exists = prev.some((s) => s.stageNumber === stageNumber);
        if (exists) {
          return prev.map((s) =>
            s.stageNumber === stageNumber
              ? {
                  ...s,
                  thought: data.thought !== undefined ? (data.thought || null) : s.thought,
                  emotion: data.emotion !== undefined ? (data.emotion || null) : s.emotion,
                  action: data.action !== undefined ? (data.action || null) : s.action,
                  notes: data.notes !== undefined ? (data.notes || null) : s.notes,
                }
              : s
          );
        }
        return [
          ...prev,
          {
            ...DEFAULT_PROGRESS,
            stageNumber,
            thought: data.thought || null,
            emotion: data.emotion || null,
            action: data.action || null,
            notes: data.notes || null,
          },
        ];
      });

      return true;
    },
    [user]
  );

  const recordValidationFailure = useCallback(
    async (stageNumber: number, missing: string[]): Promise<void> => {
      if (!user) return;

      const progress = stages.find((s) => s.stageNumber === stageNumber);

      await supabase
        .from("stage_progress")
        .upsert(
          {
            user_id: user.id,
            stage_number: stageNumber,
            completion_ready: false,
            completion_missing: missing,
            ego_followup_count: (progress?.egoFollowupCount || 0) + 1,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,stage_number" }
        );
    },
    [user, stages]
  );

  const completeStageWithData = useCallback(
    async (stageNumber: number, data: StageReflection): Promise<{ success: boolean; validation?: ValidationResult }> => {
      if (!user) return { success: false };

      if (stageNumber !== currentStage) {
        console.warn("[StageContext] Cannot complete stage", stageNumber, "— current is", currentStage);
        return { success: false };
      }

      const progress = stages.find((s) => s.stageNumber === stageNumber);
      if (progress && progress.status === "completed") {
        console.warn("[StageContext] Stage", stageNumber, "is already completed");
        return { success: false };
      }

      const validation = validateReflection(data);
      if (!validation.valid) {
        const missingFields = validation.missing.map((m) => m.field);
        await recordValidationFailure(stageNumber, missingFields);
        return { success: false, validation };
      }

      try {
        const now = new Date().toISOString();

        const { error: saveError } = await supabase
          .from("stage_progress")
          .upsert(
            {
              user_id: user.id,
              stage_number: stageNumber,
              thought: data.thought,
              emotion: data.emotion,
              action: data.action,
              notes: data.notes,
              status: "completed",
              completed_at: now,
              user_confirmed_complete: true,
              completion_ready: true,
              completion_missing: [],
              updated_at: now,
            },
            { onConflict: "user_id,stage_number" }
          );

        if (saveError) {
          console.error("[StageContext] Error completing stage:", saveError);
          return { success: false };
        }

        console.log("[StageContext] Stage completed:", stageNumber);

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
          } else {
            console.log("[StageContext] Next stage unlocked:", stageNumber + 1);
          }
        }

        await loadStages();
        return { success: true };
      } catch (err) {
        console.error("[StageContext] Unexpected error completing stage:", err);
        return { success: false };
      }
    },
    [user, currentStage, stages, recordValidationFailure, loadStages]
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
        completeStageWithData,
        saveReflection,
        recordValidationFailure,
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
