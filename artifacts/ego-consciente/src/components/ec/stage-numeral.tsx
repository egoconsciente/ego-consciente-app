import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface StageNumeralProps extends HTMLAttributes<HTMLDivElement> {
  n: number;
  total?: number;
  state?: "current" | "completed" | "locked" | "available";
  scale?: "sm" | "md" | "lg" | "xl";
}

const SCALE: Record<NonNullable<StageNumeralProps["scale"]>, string> = {
  sm: "text-2xl",
  md: "text-4xl",
  lg: "text-6xl",
  xl: "text-7xl md:text-8xl",
};

const STATE_TONE: Record<NonNullable<StageNumeralProps["state"]>, string> = {
  current: "text-[hsl(var(--tierra-deep))]",
  completed: "text-[hsl(var(--ink-soft))]",
  locked: "text-[hsl(var(--warm-line))]",
  available: "text-foreground",
};

export function StageNumeral({
  n,
  total,
  state = "current",
  scale = "lg",
  className,
  ...rest
}: StageNumeralProps) {
  return (
    <div
      className={cn(
        "ec-stage-numeral inline-flex items-baseline gap-2",
        SCALE[scale],
        STATE_TONE[state],
        className,
      )}
      {...rest}
    >
      <span>{String(n).padStart(2, "0")}</span>
      {total && (
        <span className="text-base ec-meta self-end pb-1">
          / {String(total).padStart(2, "0")}
        </span>
      )}
    </div>
  );
}
