"use client";

import { usePathname } from "next/navigation";
import { getRuntimeCopy, localeFromPathname } from "@/lib/copy";

type BrandMarkProps = {
  className?: string;
  showWordmark?: boolean;
  iconOnly?: boolean;
};

export function BrandMark({ className = "", showWordmark = true, iconOnly = false }: BrandMarkProps) {
  const locale = localeFromPathname(usePathname());
  const copy = getRuntimeCopy(locale).shell.header;

  const icon = (
    <svg
      aria-hidden="true"
      viewBox="0 0 48 48"
      className="h-9 w-9"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* First D */}
      <path
        d="M10 10h8c8.8 0 16 6.3 16 14s-7.2 14-16 14h-8V10Z"
        fill="var(--accent)"
        fillOpacity="0.85"
      />
      {/* Second D — offset right and down */}
      <path
        d="M16 16h8c8.8 0 16 6.3 16 14s-7.2 14-16 14h-8V16Z"
        fill="var(--accent-strong)"
        fillOpacity="0.5"
      />
      {/* Light cutout line between the two D's */}
      <path
        d="M16 16h8c6.6 0 12 5.4 12 12s-5.4 12-12 12h-8"
        stroke="var(--foreground)"
        strokeOpacity="0.3"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );

  if (iconOnly) return icon;

  return (
    <span className={`inline-flex min-w-0 items-center gap-2.5 ${className}`.trim()}>
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center">
        {icon}
      </span>
      {showWordmark && (
        <span className="flex min-w-0 flex-col leading-none">
          <span className="text-[15px] font-semibold tracking-[-0.01em] text-[color:var(--foreground)]">
            Dock<span className="text-[color:var(--accent)]">Docs</span>
          </span>
          <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-[color:var(--faint)]">
            {copy.tagline}
          </span>
        </span>
      )}
    </span>
  );
}
