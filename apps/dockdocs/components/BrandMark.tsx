"use client";

import { usePathname } from "next/navigation";
import { getRuntimeCopy, localeFromPathname } from "@/lib/copy";

type BrandMarkProps = {
  className?: string;
  showWordmark?: boolean;
};

export function BrandMark({ className = "", showWordmark = true }: BrandMarkProps) {
  const locale = localeFromPathname(usePathname());
  const copy = getRuntimeCopy(locale).shell.header;

  return (
    <span className={`inline-flex min-w-0 items-center gap-2.5 ${className}`.trim()}>
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center">
        <svg
          aria-hidden="true"
          viewBox="0 0 44 44"
          className="h-9 w-9 drop-shadow-[0_10px_24px_rgba(37,99,235,0.22)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5.5 5.5h14.4C30.5 5.5 38.5 12.3 38.5 22S30.5 38.5 19.9 38.5H5.5v-33Z"
            fill="#2563EB"
          />
          <path
            d="M13.2 12.5h11.2l6.4 6.3v13.4H13.2V12.5Z"
            fill="#0B1220"
            fillOpacity="0.9"
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path d="M24.3 12.9v6.1h6" stroke="#93C5FD" strokeWidth="1.8" strokeLinejoin="round" />
          <path
            d="M17.1 25.7h8.4M17.1 21.9h5.9M17.1 29.5h6.8"
            stroke="#FFFFFF"
            strokeOpacity="0.92"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="16.8" cy="18.1" r="1.45" fill="#60A5FA" />
          <circle cx="28.5" cy="28.8" r="1.2" fill="#93C5FD" />
        </svg>
      </span>
      {showWordmark && (
        <span className="flex min-w-0 flex-col leading-none">
          <span className="text-base font-semibold tracking-tight">
            <span>Dock</span>
            <span className="text-[color:var(--accent)]">Docs</span>
          </span>
          <span className="mt-1 hidden text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)] sm:block">
            {copy.tagline}
          </span>
        </span>
      )}
    </span>
  );
}
