import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-[color:var(--line)] p-5 ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}
