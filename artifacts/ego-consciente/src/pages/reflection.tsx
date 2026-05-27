import { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { useStore } from "@/lib/store-context";
import { useToast } from "@/hooks/use-toast";
import { Check, ArrowLeft, Eye, Heart, Footprints, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { EcSigil } from "@/components/ec";
import { respectsReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

const ACCENT_HUE: Record<"terracota" | "ambar" | "tierra", string> = {
  terracota: "var(--terracota)",
  ambar: "var(--ambar)",
  tierra: "var(--tierra-deep)",
};

export default function Reflection() {
  const { currentDay, addReflection, reflections, isLoadingData } = useStore();
  const { toast } = useToast();
  const reduced = respectsReducedMotion();

  const existingReflection = useMemo(
    () => reflections.find((r) => r.day === currentDay),
    [reflections, currentDay],
  );

  const [p, setP] = useState(existingReflection?.pensamiento || "");
  const [e, setE] = useState(existingReflection?.emocion || "");
  const [a, setA] = useState(existingReflection?.accion || "");
  const [isSaved, setIsSaved] = useState(!!existingReflection);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (existingReflection) {
      setP(existingReflection.pensamiento);
      setE(existingReflection.emocion);
      setA(existingReflection.accion);
      setIsSaved(true);
    }
  }, [existingReflection]);

  const canSubmit = p.trim().length >= 3 && e.trim().length >= 3 && a.trim().length >= 3;

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    addReflection(p, e, a);
    setIsSaved(true);
    toast({
      title: "Registro guardado",
      description: "Tu observación del día quedó anotada.",
      duration: 3500,
    });
    setSubmitting(false);
  };

  const fade = (delay = 0) =>
    reduced
      ? { initial: false as const, animate: { opacity: 1 } }
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: 0.55,
            delay,
            ease: [0.22, 0.61, 0.36, 1] as [number, number, number, number],
          },
        };

  const sortedHistory = useMemo(
    () => [...reflections].sort((x, y) => y.day - x.day),
    [reflections],
  );

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-6 lg:py-10 pb-32">
        {/* Header */}
        <BackToDashboard />

        <motion.header {...fade(0)} className="mt-6 mb-8">
          <div className="flex items-start gap-4">
            <span className="shrink-0 w-11 h-11 rounded-full bg-[hsl(var(--paper-veil))] warm-border-soft inline-flex items-center justify-center text-[hsl(var(--tierra-deep))]">
              <BookOpen className="w-4 h-4" strokeWidth={1.6} />
            </span>
            <div className="min-w-0">
              <p className="ec-eyebrow text-[hsl(var(--terracota))]">
                Diario libre · Día {currentDay}
              </p>
              <h1 className="mt-1.5 ec-serif text-2xl sm:text-3xl lg:text-[34px] leading-tight text-[hsl(var(--tierra-deep))]">
                Registro P-E-A libre
              </h1>
              <p className="mt-3 ec-serif-italic text-[15px] sm:text-base text-[hsl(var(--ink-soft))] max-w-xl leading-relaxed">
                Este registro no completa una etapa. Es tu diario libre para
                observar el día.
              </p>
            </div>
          </div>
        </motion.header>

        {/* Composer / Saved view */}
        <AnimatePresence mode="wait" initial={false}>
          {isSaved && existingReflection ? (
            <motion.section
              key="saved"
              {...fade(0.05)}
              className="paper-surface rounded-3xl px-6 py-7 sm:px-8 sm:py-8 relative overflow-hidden"
              aria-label="Registro guardado"
            >
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(45% 50% at 100% 0%, hsl(var(--ambar-soft) / 0.16) 0%, transparent 65%)",
                }}
              />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-9 h-9 rounded-full bg-[hsl(var(--paper-veil))] warm-border-soft inline-flex items-center justify-center text-[hsl(var(--tierra-deep))]">
                    <Check className="w-4 h-4" strokeWidth={1.8} />
                  </span>
                  <div>
                    <p className="ec-eyebrow text-[hsl(var(--terracota))]">
                      Guardado
                    </p>
                    <p className="mt-0.5 ec-serif text-[17px] text-[hsl(var(--tierra-deep))]">
                      Tu observación del día {currentDay}
                    </p>
                  </div>
                </div>

                <dl className="space-y-4">
                  <SavedRow accent="terracota" label="Pensamiento" value={p} icon={Eye} />
                  <SavedRow accent="ambar" label="Emoción" value={e} icon={Heart} />
                  <SavedRow accent="tierra" label="Acción" value={a} icon={Footprints} />
                </dl>

                <button
                  type="button"
                  onClick={() => setIsSaved(false)}
                  className={cn(
                    "mt-6 ec-meta italic text-[hsl(var(--ink-soft))] hover:text-[hsl(var(--tierra-deep))] motion-safe:transition-colors",
                    "focus:outline-none focus-visible:underline underline-offset-4",
                  )}
                >
                  Editar registro
                </button>
              </div>
            </motion.section>
          ) : (
            <motion.form
              key="form"
              {...fade(0.05)}
              onSubmit={handleSubmit}
              className="space-y-3"
              aria-label="Composer P-E-A libre"
            >
              <FreePeaField
                id="pea-thought"
                label="Pensamiento"
                hint="¿Qué pensamiento se repitió o apareció hoy?"
                placeholder="Ej. Pensé que si no terminaba todo hoy, fracasaría."
                rows={3}
                value={p}
                onChange={setP}
                accent="terracota"
                icon={Eye}
              />
              <Connector />
              <FreePeaField
                id="pea-emotion"
                label="Emoción"
                hint="¿Qué sentiste? Nombra la emoción lo más específica posible."
                placeholder="Ej. Tensión en el pecho, ansiedad sostenida."
                rows={2}
                value={e}
                onChange={setE}
                accent="ambar"
                icon={Heart}
              />
              <Connector />
              <FreePeaField
                id="pea-action"
                label="Acción"
                hint="¿Qué hiciste o qué evitaste?"
                placeholder="Ej. Me quedé trabajando hasta tarde sin comer."
                rows={2}
                value={a}
                onChange={setA}
                accent="tierra"
                icon={Footprints}
              />

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={!canSubmit || submitting}
                  className={cn(
                    "w-full inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full",
                    "bg-[hsl(var(--tierra-deep))] text-[hsl(var(--paper))]",
                    "text-base font-medium tracking-wide",
                    "shadow-md shadow-[hsl(var(--tierra-deep)/0.18)]",
                    "motion-safe:hover:shadow-lg motion-safe:hover:-translate-y-[1px] motion-safe:transition-all motion-safe:duration-300",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:translate-y-0",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--terracota))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--paper))]",
                  )}
                >
                  <Check className="w-4 h-4" strokeWidth={2} />
                  Guardar registro
                </button>
                {!canSubmit && (
                  <p className="mt-3 text-center ec-meta italic text-[hsl(var(--ink-soft))]">
                    Escribe al menos unas palabras en cada campo.
                  </p>
                )}
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Mini history */}
        {!isLoadingData && sortedHistory.length > 0 && (
          <motion.section
            {...fade(0.15)}
            className="mt-12"
            aria-label="Registros recientes"
          >
            <div className="flex items-end justify-between mb-4 px-1">
              <p className="ec-eyebrow text-[hsl(var(--ink-soft))]">
                Registros recientes
              </p>
              <Link
                href="/progress"
                className="ec-meta italic text-[hsl(var(--ink-soft))] hover:text-[hsl(var(--tierra-deep))] motion-safe:transition-colors"
              >
                Ver historial completo →
              </Link>
            </div>
            <ul className="space-y-2">
              {sortedHistory
                .filter((r) => r.day !== currentDay)
                .slice(0, 4)
                .map((ref) => (
                  <li
                    key={ref.id}
                    className="paper-surface rounded-2xl px-5 py-4 flex items-center gap-4"
                  >
                    <span className="shrink-0 w-9 h-9 rounded-full bg-[hsl(var(--paper-veil))] warm-border-soft inline-flex items-center justify-center ec-serif text-[14px] text-[hsl(var(--tierra-deep))]">
                      {ref.day}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="ec-meta text-[hsl(var(--ink-soft))]">
                        {ref.date.toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "long",
                        })}
                      </p>
                      <p className="mt-0.5 text-[14px] text-[hsl(var(--ink))] truncate">
                        {ref.pensamiento}
                      </p>
                    </div>
                  </li>
                ))}
            </ul>
          </motion.section>
        )}
      </div>
    </AppLayout>
  );
}

// ─────────────────────────────────────────────────────────────
function BackToDashboard() {
  return (
    <Link
      href="/dashboard"
      aria-label="Volver al panel"
      className={cn(
        "inline-flex items-center gap-2 px-3 py-2 rounded-full",
        "ec-meta italic text-[hsl(var(--ink-soft))]",
        "hover:text-[hsl(var(--tierra-deep))] motion-safe:transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--terracota))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--paper))]",
      )}
    >
      <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.6} />
      Volver al panel
    </Link>
  );
}

function Connector() {
  return (
    <div className="flex justify-center py-0.5" aria-hidden>
      <span
        className="block w-px h-5"
        style={{ background: "hsl(var(--warm-line))" }}
      />
    </div>
  );
}

function FreePeaField({
  id,
  label,
  hint,
  placeholder,
  rows,
  value,
  onChange,
  accent,
  icon: Icon,
}: {
  id: string;
  label: string;
  hint: string;
  placeholder: string;
  rows: number;
  value: string;
  onChange: (v: string) => void;
  accent: "terracota" | "ambar" | "tierra";
  icon: typeof Eye;
}) {
  const hue = `hsl(${ACCENT_HUE[accent]})`;
  const filled = value.trim().length >= 3;
  return (
    <div className="paper-surface rounded-3xl px-5 py-5 sm:px-6 sm:py-6">
      <div className="flex items-center gap-3 mb-3">
        <span
          className="w-9 h-9 rounded-full inline-flex items-center justify-center shrink-0 warm-border-soft motion-safe:transition-colors"
          style={{
            background: filled ? hue : "hsl(var(--paper-veil))",
            color: filled ? "hsl(var(--paper))" : hue,
          }}
        >
          <Icon className="w-4 h-4" strokeWidth={1.7} />
        </span>
        <div className="flex-1 min-w-0">
          <label htmlFor={id} className="ec-eyebrow" style={{ color: hue }}>
            {label}
          </label>
          <p className="ec-meta italic text-[hsl(var(--ink-soft))] mt-0.5">
            {hint}
          </p>
        </div>
      </div>
      <textarea
        id={id}
        value={value}
        onChange={(ev) => onChange(ev.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={cn(
          "w-full bg-transparent border-0 outline-none resize-none",
          "text-[15px] sm:text-base text-[hsl(var(--ink))] placeholder:text-[hsl(var(--ink-soft))]/55",
          "leading-relaxed",
        )}
      />
    </div>
  );
}

function SavedRow({
  accent,
  label,
  value,
  icon: Icon,
}: {
  accent: "terracota" | "ambar" | "tierra";
  label: string;
  value: string;
  icon: typeof Eye;
}) {
  const hue = `hsl(${ACCENT_HUE[accent]})`;
  return (
    <div className="flex items-start gap-3">
      <span
        className="shrink-0 w-8 h-8 rounded-full inline-flex items-center justify-center mt-0.5"
        style={{ background: "hsl(var(--paper-veil))", color: hue }}
      >
        <Icon className="w-3.5 h-3.5" strokeWidth={1.7} />
      </span>
      <div className="min-w-0 flex-1">
        <dt className="ec-eyebrow" style={{ color: hue }}>
          {label}
        </dt>
        <dd className="mt-1 text-[15px] text-[hsl(var(--ink))] leading-relaxed whitespace-pre-line">
          {value}
        </dd>
      </div>
    </div>
  );
}

// Silenciar warning de unused EcSigil si no se usa en este render
void EcSigil;
