type BrandMarkProps = {
  className?: string;
  showWordmark?: boolean;
  iconOnly?: boolean;
};

// Canonical DockDocs D-mark. The geometry is fixed by design — only scale it
// uniformly (viewBox preserves aspect), never redraw the rects.
export function BrandMark({ className = "", showWordmark = true, iconOnly = false }: BrandMarkProps) {
  const icon = (
    <svg
      aria-hidden="true"
      viewBox="0 0 62 76"
      className="h-7 w-auto shrink-0"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="2" y="4" width="8" height="68" rx="4" fill="#3ECF8E" />
      <rect x="24" y="6" width="16" height="8" rx="4" fill="#3ECF8E" />
      <rect x="40" y="19" width="16" height="8" rx="4" fill="#3ECF8E" />
      <rect x="44" y="34" width="16" height="8" rx="4" fill="#3ECF8E" />
      <rect x="40" y="49" width="16" height="8" rx="4" fill="#3ECF8E" />
      <rect x="24" y="62" width="16" height="8" rx="4" fill="#3ECF8E" />
    </svg>
  );

  if (iconOnly) {
    return <span className={`inline-flex shrink-0 items-center justify-center ${className}`.trim()}>{icon}</span>;
  }

  return (
    <span className={`inline-flex min-w-0 items-center gap-2 ${className}`.trim()}>
      {icon}
      {showWordmark && (
        <span className="text-[16px] font-bold tracking-[-0.02em]" style={{ fontFamily: "var(--font-brand)" }}>
          <span className="text-[color:var(--foreground)]">Dock</span>
          <span className="text-[#3ECF8E]">Docs</span>
        </span>
      )}
    </span>
  );
}
