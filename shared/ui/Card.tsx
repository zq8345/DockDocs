import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-lg border border-[color:var(--line)] bg-black/[0.02] p-5 transition hover:border-[color:var(--foreground)] dark:bg-white/[0.03] ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}
