import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface EditorialQuoteProps extends HTMLAttributes<HTMLElement> {
  attribution?: string;
}

export function EditorialQuote({
  attribution,
  className,
  children,
  ...rest
}: EditorialQuoteProps) {
  return (
    <figure
      className={cn(
        "relative pl-6 border-l warm-border-soft text-foreground",
        className,
      )}
      {...rest}
    >
      <blockquote className="ec-serif text-xl md:text-2xl leading-relaxed">
        {children}
      </blockquote>
      {attribution && (
        <figcaption className="ec-meta mt-3">{attribution}</figcaption>
      )}
    </figure>
  );
}
