import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface EgoVoiceProps extends HTMLAttributes<HTMLDivElement> {
  tone?: "intro" | "reveal" | "guide";
  eyebrow?: string;
}

const TONE_TEXT: Record<NonNullable<EgoVoiceProps["tone"]>, string> = {
  intro: "text-lg md:text-xl leading-relaxed",
  reveal: "text-xl md:text-2xl leading-relaxed",
  guide: "text-base md:text-lg leading-relaxed",
};

export function EgoVoice({
  tone = "intro",
  eyebrow,
  className,
  children,
  ...rest
}: EgoVoiceProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)} {...rest}>
      {eyebrow && <span className="ec-eyebrow">{eyebrow}</span>}
      <p className={cn("ec-serif-italic text-foreground", TONE_TEXT[tone])}>
        {children}
      </p>
    </div>
  );
}
