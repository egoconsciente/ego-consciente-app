import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import {
  motion,
  AnimatePresence,
  useDragControls,
  type PanInfo,
} from "framer-motion";
import {
  ShieldCheck,
  Wind,
  Anchor,
  X,
  PauseCircle,
  Hourglass,
  Check,
  AlertCircle,
} from "lucide-react";
import { respectsReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
export type SafetyLevel = "none" | "green" | "yellow" | "red";

// ─────────────────────────────────────────────────────────────
// Modal a11y hook — initial focus + focus trap + restore focus
// ─────────────────────────────────────────────────────────────
const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function useModalA11y(
  open: boolean,
  containerRef: RefObject<HTMLElement | null>,
  initialFocusRef?: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusInitial = () => {
      const target =
        initialFocusRef?.current ??
        (containerRef.current?.querySelector(FOCUSABLE) as HTMLElement | null) ??
        containerRef.current;
      target?.focus();
    };
    const t = window.setTimeout(focusInitial, 30);

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const node = containerRef.current;
      if (!node) return;
      const focusables = Array.from(
        node.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((el) => !el.hasAttribute("disabled") && el.offsetParent !== null);
      if (focusables.length === 0) {
        e.preventDefault();
        node.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (active === first || !node.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last || !node.contains(active)) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      // Restore focus to the trigger
      if (previouslyFocused && typeof previouslyFocused.focus === "function") {
        previouslyFocused.focus();
      }
    };
  }, [open, containerRef, initialFocusRef]);
}

export interface Step72Data {
  commitment: string;
  dueAt: string | Date;
  status: "pending" | "completed" | "expired";
}

// ═════════════════════════════════════════════════════════════
// SafetyBanner
// ═════════════════════════════════════════════════════════════
export function SafetyBanner({
  level = "none",
  onGround,
  onPause,
  className,
}: {
  level?: SafetyLevel;
  onGround?: () => void;
  onPause?: () => void;
  className?: string;
}) {
  if (level === "none") return null;

  if (level === "green") {
    return (
      <div
        role="status"
        aria-label="Espacio estable"
        className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-full",
          "warm-border-soft bg-[hsl(var(--paper))]",
          "ec-meta italic text-[hsl(var(--ink-soft))]",
          className,
        )}
      >
        <ShieldCheck
          className="w-3.5 h-3.5 text-[hsl(var(--tierra-deep))]"
          strokeWidth={1.6}
        />
        Espacio estable
      </div>
    );
  }

  if (level === "yellow") {
    return (
      <section
        role="status"
        aria-label="Bajar intensidad"
        className={cn(
          "rounded-3xl px-5 py-5 sm:px-6 sm:py-6",
          "warm-border bg-[hsl(var(--paper-soft))]",
          "relative overflow-hidden",
          className,
        )}
      >
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(60% 60% at 0% 0%, hsl(var(--ambar-soft) / 0.32) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4">
          <span className="shrink-0 w-10 h-10 rounded-full inline-flex items-center justify-center bg-[hsl(var(--paper-veil))] warm-border-soft text-[hsl(var(--tierra-deep))]">
            <Wind className="w-4 h-4" strokeWidth={1.6} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="ec-eyebrow text-[hsl(var(--tierra-deep))]">
              Cuidado del proceso
            </p>
            <p className="mt-1.5 ec-serif text-[16px] sm:text-[17px] text-[hsl(var(--tierra-deep))] leading-snug">
              Hoy bajamos la intensidad.
            </p>
            <p className="mt-1 ec-serif-italic text-[13px] text-[hsl(var(--ink-soft))]">
              Observa más despacio. Si necesitas, vuelve al cuerpo un momento.
            </p>
          </div>
          {onGround && (
            <button
              type="button"
              onClick={onGround}
              className={cn(
                "shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px]",
                "warm-border-soft bg-[hsl(var(--paper))] text-[hsl(var(--tierra-deep))]",
                "hover:bg-[hsl(var(--paper-veil))] motion-safe:transition-colors",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--terracota))]",
              )}
            >
              <Anchor className="w-3.5 h-3.5" strokeWidth={1.6} />
              Volver al cuerpo
            </button>
          )}
        </div>
      </section>
    );
  }

  // red
  return (
    <section
      role="status"
      aria-label="Pausar el proceso"
      className={cn(
        "rounded-3xl px-5 py-5 sm:px-6 sm:py-6",
        "warm-border bg-[hsl(var(--paper-soft))]",
        "relative overflow-hidden",
        className,
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(70% 70% at 0% 0%, hsl(var(--terracota) / 0.16) 0%, transparent 70%)",
        }}
      />
      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <span className="shrink-0 w-10 h-10 rounded-full inline-flex items-center justify-center bg-[hsl(var(--paper-veil))] warm-border-soft text-[hsl(var(--terracota))]">
            <AlertCircle className="w-4 h-4" strokeWidth={1.6} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="ec-eyebrow text-[hsl(var(--terracota))]">
              Cuidado del proceso
            </p>
            <p className="mt-1.5 ec-serif text-[17px] sm:text-[19px] text-[hsl(var(--tierra-deep))] leading-snug">
              Pausamos el proceso. Primero volvamos al cuerpo.
            </p>
            <p className="mt-1 ec-serif-italic text-[13px] text-[hsl(var(--ink-soft))]">
              No hay urgencia. Lo observado no se pierde.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:pl-[3.25rem]">
          {onGround && (
            <button
              type="button"
              onClick={onGround}
              className={cn(
                "inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-[13px]",
                "bg-[hsl(var(--tierra-deep))] text-[hsl(var(--paper))]",
                "motion-safe:hover:shadow-md motion-safe:transition-shadow",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--terracota))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--paper))]",
              )}
            >
              <Anchor className="w-3.5 h-3.5" strokeWidth={1.7} />
              Volver al cuerpo
            </button>
          )}
          {onPause && (
            <button
              type="button"
              onClick={onPause}
              className={cn(
                "inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-[13px]",
                "warm-border-soft bg-[hsl(var(--paper))] text-[hsl(var(--tierra-deep))]",
                "hover:bg-[hsl(var(--paper-veil))] motion-safe:transition-colors",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--terracota))]",
              )}
            >
              <PauseCircle className="w-3.5 h-3.5" strokeWidth={1.6} />
              Pausar el proceso
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

// ═════════════════════════════════════════════════════════════
// GroundingSheet
// ═════════════════════════════════════════════════════════════
const GROUNDING_STEPS: { title: string; hint: string }[] = [
  {
    title: "Nombra tres cosas que ves.",
    hint: "Sin prisa. Solo nombra lo que está a tu alrededor.",
  },
  {
    title: "Siente los pies.",
    hint: "El peso, la temperatura, el contacto con el suelo.",
  },
  {
    title: "Respira lento.",
    hint: "Inhala. Exhala más largo que la inhalación.",
  },
];

export function GroundingSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const reduced = respectsReducedMotion();
  const dragControls = useDragControls();
  const containerRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useModalA11y(open, containerRef, closeBtnRef);

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (info.offset.y > 80) onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Volver al cuerpo"
        >
          <div
            className="absolute inset-0 bg-[hsl(var(--tierra-deep)/0.20)] backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            initial={reduced ? { opacity: 0 } : { y: "100%" }}
            animate={reduced ? { opacity: 1 } : { y: 0 }}
            exit={reduced ? { opacity: 0 } : { y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            drag={reduced ? false : "y"}
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={handleDragEnd}
            ref={containerRef}
            tabIndex={-1}
            className={cn(
              "relative z-10 w-full max-w-md flex flex-col outline-none",
              "living-glass rounded-t-3xl md:rounded-3xl",
              "shadow-2xl shadow-[hsl(var(--tierra-deep)/0.20)]",
              "max-h-[88vh]",
            )}
          >
            {/* Drag handle (mobile) */}
            <div
              className="flex flex-col items-center pt-3 pb-1 md:hidden cursor-grab active:cursor-grabbing"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div
                className="w-10 h-1 rounded-full"
                style={{ background: "hsl(var(--warm-line))" }}
              />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between px-6 pt-4 pb-3">
              <div className="min-w-0">
                <p className="ec-eyebrow text-[hsl(var(--terracota))]">
                  Pausa breve
                </p>
                <h3 className="mt-1 ec-serif text-[22px] text-[hsl(var(--tierra-deep))] leading-tight">
                  Volver al cuerpo
                </h3>
                <p className="mt-1.5 ec-serif-italic text-[13px] text-[hsl(var(--ink-soft))] leading-snug">
                  Tres movimientos suaves para aterrizar.
                </p>
              </div>
              <button
                ref={closeBtnRef}
                onClick={onClose}
                aria-label="Cerrar"
                className={cn(
                  "shrink-0 w-8 h-8 rounded-full inline-flex items-center justify-center",
                  "text-[hsl(var(--ink-soft))] hover:bg-[hsl(var(--paper-veil))] motion-safe:transition-colors",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--terracota))]",
                )}
              >
                <X className="w-4 h-4" strokeWidth={1.7} />
              </button>
            </div>

            {/* Steps */}
            <ol className="px-6 py-3 space-y-3">
              {GROUNDING_STEPS.map((step, idx) => (
                <li
                  key={step.title}
                  className="paper-surface rounded-2xl px-4 py-4 flex items-start gap-3"
                >
                  <span className="shrink-0 w-7 h-7 rounded-full bg-[hsl(var(--paper-veil))] warm-border-soft inline-flex items-center justify-center ec-serif text-[13px] text-[hsl(var(--tierra-deep))]">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="ec-serif text-[15px] text-[hsl(var(--tierra-deep))] leading-snug">
                      {step.title}
                    </p>
                    <p className="mt-1 ec-serif-italic text-[12.5px] text-[hsl(var(--ink-soft))] leading-snug">
                      {step.hint}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            {/* Footer */}
            <div
              className="px-6 pt-2 pb-4 border-t border-[hsl(var(--warm-line-soft))] mt-2"
              style={{
                paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
              }}
            >
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  "w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full",
                  "bg-[hsl(var(--tierra-deep))] text-[hsl(var(--paper))]",
                  "text-[14px] font-medium tracking-wide",
                  "motion-safe:hover:shadow-md motion-safe:transition-shadow",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--terracota))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--paper))]",
                )}
              >
                Volver cuando esté listo
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ═════════════════════════════════════════════════════════════
// PauseProcessDialog
// ═════════════════════════════════════════════════════════════
export function PauseProcessDialog({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm?: () => void;
}) {
  const reduced = respectsReducedMotion();
  const confirmRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  useModalA11y(open, containerRef, confirmRef);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pause-dialog-title"
        >
          <div
            className="absolute inset-0 bg-[hsl(var(--tierra-deep)/0.22)] backdrop-blur-[2px]"
            onClick={onCancel}
          />
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 0.61, 0.36, 1] }}
            ref={containerRef}
            tabIndex={-1}
            className={cn(
              "relative z-10 w-full max-w-sm outline-none",
              "paper-surface rounded-3xl px-6 py-7",
              "shadow-2xl shadow-[hsl(var(--tierra-deep)/0.18)]",
            )}
          >
            <div className="flex items-start gap-3">
              <span className="shrink-0 w-10 h-10 rounded-full bg-[hsl(var(--paper-veil))] warm-border-soft inline-flex items-center justify-center text-[hsl(var(--tierra-deep))]">
                <PauseCircle className="w-4 h-4" strokeWidth={1.6} />
              </span>
              <div className="min-w-0">
                <p className="ec-eyebrow text-[hsl(var(--terracota))]">
                  Pausa del proceso
                </p>
                <h3
                  id="pause-dialog-title"
                  className="mt-1 ec-serif text-[20px] text-[hsl(var(--tierra-deep))] leading-tight"
                >
                  Pausar el proceso
                </h3>
              </div>
            </div>

            <p className="mt-5 ec-serif text-[15px] text-[hsl(var(--tierra-deep))] leading-relaxed">
              Pausar no borra tu proceso.
            </p>
            <p className="mt-2 ec-serif-italic text-[13px] text-[hsl(var(--ink-soft))] leading-relaxed">
              Tus etapas, tu diario y lo observado se quedan donde están. Puedes
              volver cuando estés listo.
            </p>

            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
              <button
                type="button"
                onClick={onCancel}
                className={cn(
                  "inline-flex items-center justify-center px-4 py-2.5 rounded-full text-[13px]",
                  "ec-meta italic text-[hsl(var(--ink-soft))]",
                  "hover:text-[hsl(var(--tierra-deep))] motion-safe:transition-colors",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--terracota))]",
                )}
              >
                Seguir observando
              </button>
              <button
                ref={confirmRef}
                type="button"
                onClick={() => {
                  onConfirm?.();
                  onCancel();
                }}
                className={cn(
                  "inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full text-[13px]",
                  "bg-[hsl(var(--tierra-deep))] text-[hsl(var(--paper))]",
                  "motion-safe:hover:shadow-md motion-safe:transition-shadow",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--terracota))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--paper))]",
                )}
              >
                <PauseCircle className="w-3.5 h-3.5" strokeWidth={1.7} />
                Pausar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ═════════════════════════════════════════════════════════════
// Step72Card
// ═════════════════════════════════════════════════════════════
export function Step72Card({
  data,
  className,
}: {
  data?: Step72Data | null;
  className?: string;
}) {
  if (!data) {
    return (
      <section
        className={cn(
          "rounded-3xl px-6 py-7 sm:px-8 sm:py-8",
          "warm-border bg-[hsl(var(--paper-soft))]",
          "flex items-start gap-4",
          className,
        )}
        aria-label="Paso de 72 horas"
      >
        <span className="shrink-0 w-10 h-10 rounded-full inline-flex items-center justify-center bg-[hsl(var(--paper))] warm-border-soft text-[hsl(var(--ink-soft))]">
          <Hourglass className="w-4 h-4" strokeWidth={1.6} />
        </span>
        <div className="min-w-0">
          <p className="ec-eyebrow text-[hsl(var(--ink-soft))]">
            Paso de 72 horas
          </p>
          <p className="mt-2 ec-serif-italic text-[15px] sm:text-base text-[hsl(var(--ink))] leading-relaxed">
            Cuando llegue el momento, aquí aparecerá tu paso de 72 horas.
          </p>
        </div>
      </section>
    );
  }

  const dueDate = data.dueAt instanceof Date ? data.dueAt : new Date(data.dueAt);
  const dueLabel = isNaN(dueDate.getTime())
    ? null
    : dueDate.toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      });

  const statusMeta: Record<
    Step72Data["status"],
    { label: string; icon: typeof Check; color: string; bg: string }
  > = {
    pending: {
      label: "En curso",
      icon: Hourglass,
      color: "hsl(var(--tierra-deep))",
      bg: "hsl(var(--paper-veil))",
    },
    completed: {
      label: "Cumplido",
      icon: Check,
      color: "hsl(var(--paper))",
      bg: "hsl(var(--tierra-deep))",
    },
    expired: {
      label: "Venció",
      icon: AlertCircle,
      color: "hsl(var(--terracota))",
      bg: "hsl(var(--paper-veil))",
    },
  };

  const meta = statusMeta[data.status];
  const StatusIcon = meta.icon;

  return (
    <section
      className={cn(
        "rounded-3xl px-6 py-7 sm:px-8 sm:py-8",
        "paper-surface relative overflow-hidden",
        className,
      )}
      aria-label="Paso de 72 horas"
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(55% 60% at 100% 0%, hsl(var(--ambar-soft) / 0.16) 0%, transparent 65%)",
        }}
      />
      <div className="relative z-10 flex items-start gap-4">
        <span className="shrink-0 w-10 h-10 rounded-full inline-flex items-center justify-center bg-[hsl(var(--paper-veil))] warm-border-soft text-[hsl(var(--tierra-deep))]">
          <Hourglass className="w-4 h-4" strokeWidth={1.6} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="ec-eyebrow text-[hsl(var(--terracota))]">
              Paso de 72 horas
            </p>
            <span
              className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] ec-eyebrow"
              style={{ background: meta.bg, color: meta.color }}
            >
              <StatusIcon className="w-3 h-3" strokeWidth={1.8} />
              {meta.label}
            </span>
          </div>
          <p className="mt-2 ec-serif text-[16px] sm:text-[17px] text-[hsl(var(--tierra-deep))] leading-snug">
            {data.commitment}
          </p>
          {dueLabel && (
            <p className="mt-2 ec-serif-italic text-[13px] text-[hsl(var(--ink-soft))]">
              Vence el {dueLabel}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
