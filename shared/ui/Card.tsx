import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  variant?: "default" | "elevated" | "interactive" | "muted";
};

const variants = {
  default:
    "border border-[color:var(--line)] bg-[color:var(--surface)]",
  elevated:
    "border border-[color:var(--line-strong)] bg-[color:var(--surface)]",
  interactive:
    "border border-[color:var(--line)] bg-[color:var(--surface)] transition-colors hover:border-[color:var(--line-strong)]",
  muted:
    "border border-[color:var(--line)] bg-[color:var(--surface-subtle)]",
};

export function Card({
  children,
  className = "",
  variant = "default",
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-[var(--radius)] p-5 ${variants[variant]} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}
