import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { respectsReducedMotion } from "@/lib/motion";

interface PresenceDotProps extends HTMLAttributes<HTMLSpanElement> {
  state?: "observing" | "still" | "speaking";
  label?: string;
}

const COLOR: Record<NonNullable<PresenceDotProps["state"]>, string> = {
  observing: "bg-[hsl(var(--terracota))]",
  still: "bg-[hsl(var(--oliva))]",
  speaking: "bg-[hsl(var(--ambar))]",
};

export function PresenceDot({
  state = "observing",
  label,
  className,
  ...rest
}: PresenceDotProps) {
  const reduced = respectsReducedMotion();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 ec-eyebrow text-[hsl(var(--ink-soft))]",
        className,
      )}
      {...rest}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          COLOR[state],
          !reduced && state === "observing" && "animate-pulse",
        )}
        style={{ animationDuration: "2.4s" }}
        aria-hidden
      />
      {label}
    </span>
  );
}
