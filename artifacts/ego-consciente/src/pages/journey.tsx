import { AppLayout } from "@/components/layout/app-layout";
import { useStages } from "@/lib/stage-context";
import { STAGES, TOTAL_STAGES, isPhaseStart, getPhaseForStage } from "@/lib/stages";
import { motion } from "framer-motion";
import { Check, Lock, Circle, ArrowLeft, Clock } from "lucide-react";
import { Link } from "wouter";

export default function Journey() {
  const { currentStage, completedCount, getStageProgress } = useStages();

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto p-6 lg:p-10 pt-8 pb-32">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl border border-border hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-display text-3xl lg:text-4xl font-semibold">
              Mapa del proceso
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              40 etapas de autoobservación
            </p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Etapa actual</p>
            <p className="font-display text-3xl font-bold">{currentStage}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Completadas</p>
            <p className="font-display text-3xl font-bold">
              {completedCount}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Progreso</p>
            <p className="font-display text-3xl font-bold">
              {Math.round((completedCount / TOTAL_STAGES) * 100)}%
            </p>
          </div>
        </div>

        <div className="space-y-1">
          {STAGES.map((stage) => {
            const progress = getStageProgress(stage.stageNumber);
            const isCompleted = progress.status === "completed";
            const isCurrent = stage.stageNumber === currentStage && progress.status !== "completed";
            const isLocked = progress.status === "locked" && stage.stageNumber !== currentStage;
            const showPhaseLabel = isPhaseStart(stage.stageNumber);
            const phase = getPhaseForStage(stage.stageNumber);

            return (
              <div key={stage.stageNumber}>
                {showPhaseLabel && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="pt-6 pb-3 pl-1"
                  >
                    <span className="text-xs font-semibold tracking-widest uppercase text-primary">
                      {phase.name}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      Etapas {phase.start}–{phase.end}
                    </span>
                  </motion.div>
                )}
                {isLocked ? (
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: stage.stageNumber * 0.01 }}
                    className="flex items-center gap-4 px-4 py-3 rounded-xl opacity-40 cursor-pointer"
                    onClick={() => alert("Esta etapa aún no está desbloqueada.")}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-secondary text-muted-foreground">
                      <Lock className="w-3 h-3" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground/50">
                        Etapa {stage.stageNumber}
                      </p>
                      <p className="text-xs text-muted-foreground/50 line-clamp-1">
                        {stage.title}
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <Link href={`/journey/${stage.stageNumber}`}>
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: stage.stageNumber * 0.01 }}
                      className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-primary/10 border border-primary/30 hover:bg-primary/15"
                          : "hover:bg-secondary/50"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          isCompleted
                            ? "bg-primary text-primary-foreground"
                            : isCurrent
                              ? "bg-primary/20 text-primary border-2 border-primary"
                              : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Circle className="w-3 h-3" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-medium ${
                            isCurrent
                              ? "text-primary font-semibold"
                              : "text-foreground"
                          }`}
                        >
                          Etapa {stage.stageNumber}
                          {isCurrent && (
                            <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                              Actual
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {stage.title}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isCompleted && (
                          <span className="text-xs text-muted-foreground">
                            Completada
                          </span>
                        )}
                        {isCurrent && (
                          <span className="inline-flex items-center gap-1 text-xs text-primary">
                            <Clock className="w-3 h-3" />
                            ~{stage.estimatedMinutes} min
                          </span>
                        )}
                      </div>
                    </motion.div>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
