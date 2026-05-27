import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type SurfaceVariant = "paper" | "glass" | "ritual" | "editorial";

interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SurfaceVariant;
  glow?: boolean;
}

const VARIANT_CLASS: Record<SurfaceVariant, string> = {
  paper: "paper-surface",
  glass: "living-glass",
  ritual: "ritual-field",
  editorial: "editorial-card",
};

export const Surface = forwardRef<HTMLDivElement, SurfaceProps>(
  ({ variant = "paper", glow = false, className, children, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(VARIANT_CLASS[variant], glow && "subtle-glow", className)}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
Surface.displayName = "Surface";
