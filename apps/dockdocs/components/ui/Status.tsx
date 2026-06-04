import type { HTMLAttributes, ReactNode } from "react";
import type { DockTone } from "@/components/ui/tokens";

type StatusVariant = "soft" | "outline" | "solid";

type StatusProps = HTMLAttributes<HTMLSpanElement> & {
  children?: ReactNode;
  label?: string;
  tone?: DockTone;
  variant?: StatusVariant;
};

const baseClass =
  "inline-flex min-h-7 shrink-0 items-center rounded-[var(--radius-sm)] border px-2.5 text-xs font-semibold";

const toneVariantClasses: Record<DockTone, Record<StatusVariant, string>> = {
  neutral: {
    soft: "border-[color:var(--line)] bg-[color:var(--surface-subtle)] text-[color:var(--muted)]",
    outline: "border-[color:var(--line)] bg-transparent text-[color:var(--foreground)]",
    solid: "border-[color:var(--foreground)] bg-[color:var(--foreground)] text-[color:var(--background)]",
  },
  accent: {
    soft: "border-[color:var(--soft-accent)] bg-[color:var(--soft-accent)] text-[color:var(--accent-strong)]",
    outline: "border-[color:var(--accent)] bg-transparent text-[color:var(--accent)]",
    solid: "border-[color:var(--accent)] bg-[color:var(--accent)] text-white",
  },
  success: {
    soft: "border-[color:var(--success-line)] bg-[color:var(--success-surface)] text-[color:var(--success)]",
    outline: "border-[color:var(--success-line)] bg-transparent text-[color:var(--success)]",
    solid: "border-[color:var(--success)] bg-[color:var(--success)] text-white",
  },
  warning: {
    soft: "border-[color:var(--warning-line)] bg-[color:var(--warning-surface)] text-[color:var(--warning)]",
    outline: "border-[color:var(--warning-line)] bg-transparent text-[color:var(--warning)]",
    solid: "border-[color:var(--warning)] bg-[color:var(--warning)] text-white",
  },
  error: {
    soft: "border-[color:var(--error-line)] bg-[color:var(--error-surface)] text-[color:var(--error)]",
    outline: "border-[color:var(--error-line)] bg-transparent text-[color:var(--error)]",
    solid: "border-[color:var(--error)] bg-[color:var(--error)] text-white",
  },
};

export function Status({
  children,
  className = "",
  label,
  tone = "neutral",
  variant = "soft",
  ...props
}: StatusProps) {
  return (
    <span
      className={[baseClass, toneVariantClasses[tone][variant], className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children || label}
    </span>
  );
}
