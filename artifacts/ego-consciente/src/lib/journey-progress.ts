import { TOTAL_STAGES } from "./stages";

export interface ProgressRow { stageNumber: number; status: string }

/** Calendar dates never advance the journey. Completed stages are counted once. */
export function resolveJourneyProgress(rows: readonly ProgressRow[]) {
  const valid = rows.filter(r => Number.isInteger(r.stageNumber) && r.stageNumber >= 1 && r.stageNumber <= TOTAL_STAGES);
  const completed = new Set(valid.filter(r => r.status === "completed").map(r => r.stageNumber));
  // The first unfinished stage prevents accidental skips in partial/inconsistent data.
  let currentStage = 1;
  while (currentStage < TOTAL_STAGES && completed.has(currentStage)) currentStage++;
  return { currentStage, completedCount: completed.size, isProcessComplete: completed.size === TOTAL_STAGES };
}
