import type { HTMLAttributes, ReactNode } from "react";

type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

type SectionProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  bordered?: boolean;
};

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
};

export function Container({ children, className = "", ...props }: ContainerProps) {
  return (
    <div
      className={`mx-auto max-w-6xl px-5 sm:px-6 lg:px-8 ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}

export function Section({
  children,
  className = "",
  bordered = true,
  ...props
}: SectionProps) {
  return (
    <section
      className={`${bordered ? "border-b border-[color:var(--line)]" : ""} py-16 ${className}`.trim()}
      {...props}
    >
      {children}
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`max-w-2xl ${className}`.trim()}>
      <p className="text-sm font-medium uppercase tracking-[0.16em] text-[color:var(--muted)]">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-semibold leading-tight">{title}</h2>
      {description ? (
        <p className="mt-4 leading-7 text-[color:var(--muted)]">{description}</p>
      ) : null}
    </div>
  );
}
