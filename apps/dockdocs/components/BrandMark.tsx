"use client";

type BrandMarkProps = { className?: string; showWordmark?: boolean; iconOnly?: boolean };

export function BrandMark({ className = "", showWordmark = true, iconOnly = false }: BrandMarkProps) {
  const icon = (
    <svg aria-hidden="true" viewBox="0 0 28 28" className="h-7 w-7" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer D — geometric pill shape */}
      <rect x="3" y="2" width="22" height="24" rx="12" stroke="var(--accent)" strokeWidth="2.5" />
      {/* Inner cutout — vertical bar forming the D */}
      <rect x="10" y="8" width="2.5" height="12" rx="1.25" fill="var(--accent)" />
      {/* Horizontal accent bar */}
      <rect x="10" y="18" width="8" height="2" rx="1" fill="var(--accent)" fillOpacity="0.5" />
    </svg>
  );

  if (iconOnly) return <span className={`inline-flex shrink-0 items-center justify-center ${className}`.trim()}>{icon}</span>;

  return (
    <span className={`inline-flex min-w-0 items-center gap-2.5 ${className}`.trim()}>
      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center">{icon}</span>
      {showWordmark && (
        <span className="text-[15px] font-semibold tracking-[-0.01em] text-[color:var(--foreground)]">
          Dock<span className="text-[color:var(--accent)]">Docs</span>
        </span>
      )}
    </span>
  );
}
