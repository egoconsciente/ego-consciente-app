import { type SVGProps } from "react";
import { cn } from "@/lib/utils";

interface EcSigilProps extends Omit<SVGProps<SVGSVGElement>, "variant"> {
  variant?: "full" | "hairline" | "seal";
  size?: number;
}

/**
 * Triquetra glifo del sistema Ego Consciente.
 * Tres variantes: full (relleno), hairline (línea fina), seal (sellado compacto).
 */
export function EcSigil({
  variant = "hairline",
  size = 48,
  className,
  ...rest
}: EcSigilProps) {
  const stroke = variant === "hairline" ? 1.1 : variant === "seal" ? 1.6 : 1.4;
  const opacity = variant === "hairline" ? 0.8 : 1;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-foreground", className)}
      {...rest}
    >
      <g
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={opacity}
        fill={variant === "full" ? "currentColor" : "none"}
        fillOpacity={variant === "full" ? 0.04 : 0}
      >
        <path d="M50 18 C68 30 68 55 50 67 C32 55 32 30 50 18 Z" />
        <path d="M27 62 C39 50 64 50 76 62 C64 74 39 74 27 62 Z" />
        <path d="M27 62 C30 44 50 32 73 38 C70 56 50 68 27 62 Z" transform="rotate(-25 50 55)" />
        <circle cx="50" cy="52" r="3" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}
