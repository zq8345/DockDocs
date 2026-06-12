import type { HTMLAttributes } from "react";
import type { DockTone } from "@/components/ui/tokens";

type CardElement = "article" | "aside" | "div" | "section";
type CardVariant = "default" | "muted" | "elevated" | "interactive";

type CardProps = HTMLAttributes<HTMLElement> & {
  as?: CardElement;
  tone?: DockTone;
  variant?: CardVariant;
};

const baseClass =
  "rounded-[var(--radius)] border bg-[color:var(--surface)] text-[color:var(--foreground)]";

const variantClasses: Record<CardVariant, string> = {
  default: "border-[color:var(--line)]",
  muted: "border-[color:var(--line)] bg-[color:var(--surface-subtle)]",
  elevated: "border-[color:var(--line-strong)]",
  interactive:
    "border-[color:var(--line)] transition-colors hover:border-[color:var(--line-strong)] focus-within:border-[color:var(--accent)]",
};

const toneClasses: Record<DockTone, string> = {
  neutral: "",
  accent: "border-[color:var(--accent)]",
  success: "border-[color:var(--success-line)]",
  warning: "border-[color:var(--warning-line)]",
  error: "border-[color:var(--error-line)]",
};

export function Card({
  as: Component = "section",
  className = "",
  tone = "neutral",
  variant = "default",
  ...props
}: CardProps) {
  return (
    <Component
      className={[baseClass, variantClasses[variant], toneClasses[tone], className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
