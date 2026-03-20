import { AppLayout } from "@/components/layout/app-layout";
import { useStore } from "@/lib/store-context";
import { useStages } from "@/lib/stage-context";
import { TOTAL_STAGES, PHASES, getStage } from "@/lib/stages";
import { motion } from "framer-motion";
import { Check, Calendar, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function Progress() {
  const { reflections } = useStore();
  const { currentStage, completedCount, stages } = useStages();
  const progressPercentage = (completedCount / TOTAL_STAGES) * 100;

  const sortedReflections = [...reflections].sort((a, b) => b.day - a.day);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-6 lg:p-10 pt-12 pb-32">
        <header className="mb-12">
          <h1 className="font-display text-4xl lg:text-5xl font-semibold mb-4">Tu recorrido</h1>
          <p className="text-lg text-muted-foreground">La consciencia es acumulativa.</p>
        </header>

        <section className="bg-card border border-border rounded-3xl p-8 mb-12 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 relative z-10">
            <div>
              <p className="text-sm font-medium tracking-widest uppercase text-muted-foreground mb-2">Proceso actual</p>
              <h2 className="font-display text-5xl font-bold text-foreground">
                Etapa {currentStage} <span className="text-2xl text-muted-foreground font-medium">/ {TOTAL_STAGES}</span>
              </h2>
            </div>
            <div className="mt-4 md:mt-0 text-right">
              <span className="inline-flex items-center gap-1.5 bg-secondary px-3 py-1 rounded-full text-sm font-medium text-secondary-foreground">
                <Calendar className="w-4 h-4" />
                {Math.round(progressPercentage)}% Completado
              </span>
            </div>
          </div>

          <div className="w-full bg-background rounded-full h-4 mb-2 overflow-hidden border border-border/50 relative z-10">
            <motion.div
              className="bg-primary h-full rounded-full relative"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <div className="absolute inset-0 bg-white/20 w-full h-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)'}} />
            </motion.div>
          </div>

          <div className="flex justify-between text-xs text-muted-foreground mt-2 relative z-10">
            <span>{completedCount} etapas completadas</span>
            <span>{TOTAL_STAGES - completedCount} restantes</span>
          </div>
        </section>

        <section className="mb-12">
          <h3 className="text-2xl font-display font-semibold mb-6">Fases del proceso</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PHASES.map((phase) => {
              const phaseStages = stages.filter(
                (s) => s.stageNumber >= phase.start && s.stageNumber <= phase.end
              );
              const phaseCompleted = phaseStages.filter((s) => s.status === "completed").length;
              const phaseTotal = phase.end - phase.start + 1;
              const isActive = currentStage >= phase.start && currentStage <= phase.end;

              return (
                <div
                  key={phase.name}
                  className={`bg-card border rounded-2xl p-5 transition-all ${
                    isActive ? "border-primary/30 bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-semibold tracking-widest uppercase ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                      {phase.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {phaseCompleted}/{phaseTotal}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Etapas {phase.start}–{phase.end}
                  </p>
                  <div className="w-full bg-background rounded-full h-2 overflow-hidden border border-border/30">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-500"
                      style={{ width: `${(phaseCompleted / phaseTotal) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-accent/10 border border-accent/20 rounded-3xl p-8 mb-12">
          <h3 className="text-sm font-bold uppercase tracking-widest text-accent mb-3">Tu paso mínimo de hoy</h3>
          <p className="text-xl md:text-2xl font-display text-foreground font-medium">
            "Observa un pensamiento sin reaccionar ante él."
          </p>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-display font-semibold">Historial de registros PEA</h3>
            <span className="text-sm text-muted-foreground">{reflections.length} entradas</span>
          </div>

          <div className="space-y-4">
            {sortedReflections.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-border rounded-3xl bg-card/50">
                <p className="text-muted-foreground mb-4">Aún no hay registros en tu historial.</p>
                <Link href="/reflection" className="text-primary font-medium hover:underline">
                  Crear primer registro
                </Link>
              </div>
            ) : (
              sortedReflections.map((ref, idx) => (
                <motion.div
                  key={ref.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-card border border-border rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4 group hover:shadow-md hover:border-primary/30 transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground shrink-0 font-display font-bold text-xl">
                    {ref.day}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">
                      {ref.date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <p className="text-foreground font-medium line-clamp-1">
                      {ref.pensamiento}
                    </p>
                  </div>
                  <div className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity">
                     <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
