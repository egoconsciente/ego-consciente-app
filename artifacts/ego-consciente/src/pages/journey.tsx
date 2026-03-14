import { AppLayout } from "@/components/layout/app-layout";
import { useStore } from "@/lib/store-context";
import { motion } from "framer-motion";
import { Check, Lock, Circle, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

const TOTAL_DAYS = 40;

const PHASE_LABELS: Record<number, string> = {
  1: "Observación",
  11: "Reconocimiento",
  21: "Integración",
  31: "Congruencia",
};

export default function Journey() {
  const { currentDay, reflections } = useStore();
  const completedDays = new Set(reflections.map((r) => r.day));

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto p-6 lg:p-10 pt-8 pb-32">
        {/* Header */}
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
              40 días de autoobservación
            </p>
          </div>
        </div>

        {/* Progress summary */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Día actual</p>
            <p className="font-display text-3xl font-bold">{currentDay}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Reflexiones</p>
            <p className="font-display text-3xl font-bold">
              {completedDays.size}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Completado</p>
            <p className="font-display text-3xl font-bold">
              {Math.round((currentDay / TOTAL_DAYS) * 100)}%
            </p>
          </div>
        </div>

        {/* 40-day grid */}
        <div className="space-y-1">
          {Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).map((day) => {
            const isPast = day < currentDay;
            const isCurrent = day === currentDay;
            const isFuture = day > currentDay;
            const hasReflection = completedDays.has(day);
            const phaseLabel = PHASE_LABELS[day];

            return (
              <div key={day}>
                {phaseLabel && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="pt-6 pb-3 pl-1"
                  >
                    <span className="text-xs font-semibold tracking-widest uppercase text-primary">
                      {phaseLabel}
                    </span>
                  </motion.div>
                )}
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: day * 0.015 }}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                    isCurrent
                      ? "bg-primary/10 border border-primary/30"
                      : isPast
                        ? "hover:bg-secondary/50"
                        : "opacity-40"
                  }`}
                >
                  {/* Status icon */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      hasReflection
                        ? "bg-primary text-primary-foreground"
                        : isCurrent
                          ? "bg-primary/20 text-primary border-2 border-primary"
                          : isFuture
                            ? "bg-secondary text-muted-foreground"
                            : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {hasReflection ? (
                      <Check className="w-4 h-4" />
                    ) : isFuture ? (
                      <Lock className="w-3 h-3" />
                    ) : (
                      <Circle className="w-3 h-3" />
                    )}
                  </div>

                  {/* Day info */}
                  <div className="flex-1">
                    <p
                      className={`font-medium ${
                        isCurrent
                          ? "text-primary font-semibold"
                          : "text-foreground"
                      }`}
                    >
                      Día {day}
                      {isCurrent && (
                        <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                          Hoy
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Reflection indicator */}
                  {hasReflection && (
                    <span className="text-xs text-muted-foreground">
                      PEA registrado
                    </span>
                  )}
                  {isCurrent && !hasReflection && (
                    <Link
                      href="/reflection"
                      className="text-xs text-primary font-medium hover:underline"
                    >
                      Registrar
                    </Link>
                  )}
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
