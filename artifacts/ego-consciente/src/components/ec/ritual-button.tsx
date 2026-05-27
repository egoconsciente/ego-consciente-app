import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type RitualIntent = "cross" | "complete" | "continue" | "ghost";

interface RitualButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  intent?: RitualIntent;
}

const INTENT_CLASS: Record<RitualIntent, string> = {
  cross:
    "bg-[hsl(var(--tierra-deep))] text-[hsl(var(--paper))] hover:bg-[hsl(var(--tierra))]",
  complete:
    "bg-[hsl(var(--tierra))] text-[hsl(var(--paper))] hover:bg-[hsl(var(--tierra-deep))]",
  continue:
    "bg-[hsl(var(--terracota))] text-[hsl(var(--paper))] hover:bg-[hsl(var(--terracota-soft))]",
  ghost:
    "bg-transparent text-foreground warm-border hover:bg-[hsl(var(--paper-veil))]",
};

export const RitualButton = forwardRef<HTMLButtonElement, RitualButtonProps>(
  ({ intent = "complete", className, children, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl",
          "font-sans text-sm font-medium tracking-wide",
          "transition-colors duration-300",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          INTENT_CLASS[intent],
          className,
        )}
        {...rest}
      >
        {children}
      </button>
    );
  },
);
RitualButton.displayName = "RitualButton";
