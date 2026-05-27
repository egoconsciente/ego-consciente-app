import { forwardRef, type TextareaHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BreathFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  prompt?: string;
  helper?: ReactNode;
  eyebrow?: string;
}

export const BreathField = forwardRef<HTMLTextAreaElement, BreathFieldProps>(
  ({ label, prompt, helper, eyebrow, className, id, ...rest }, ref) => {
    const fieldId = id ?? `breath-${label.toLowerCase().replace(/\s+/g, "-")}`;
    return (
      <div className="flex flex-col gap-2.5">
        {eyebrow && <span className="ec-eyebrow">{eyebrow}</span>}
        <label
          htmlFor={fieldId}
          className="ec-serif text-lg md:text-xl text-foreground"
        >
          {label}
        </label>
        {prompt && <p className="ec-meta italic">{prompt}</p>}
        <textarea
          id={fieldId}
          ref={ref}
          className={cn(
            "w-full min-h-[120px] resize-none",
            "bg-[hsl(var(--paper))] text-foreground",
            "warm-border rounded-2xl",
            "px-5 py-4 text-base leading-relaxed font-sans",
            "placeholder:text-muted-foreground placeholder:italic",
            "focus:outline-none focus:border-[hsl(var(--terracota))]",
            "transition-colors duration-200",
            className,
          )}
          {...rest}
        />
        {helper && <div className="ec-meta">{helper}</div>}
      </div>
    );
  },
);
BreathField.displayName = "BreathField";
