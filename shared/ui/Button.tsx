import type { AnchorHTMLAttributes, ReactNode } from "react";

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  variant?: "solid" | "outline" | "inverse";
};

export function ButtonLink({
  children,
  className = "",
  variant = "solid",
  ...props
}: ButtonLinkProps) {
  const base =
    "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition";
  const variants = {
    solid:
      "bg-[color:var(--foreground)] text-[color:var(--background)] opacity-95 hover:opacity-100",
    outline:
      "border border-[color:var(--line)] hover:border-[color:var(--foreground)]",
    inverse:
      "border border-[color:var(--background)] text-[color:var(--background)] hover:bg-[color:var(--background)] hover:text-[color:var(--foreground)]",
  };

  return (
    <a className={`${base} ${variants[variant]} ${className}`.trim()} {...props}>
      {children}
    </a>
  );
}
