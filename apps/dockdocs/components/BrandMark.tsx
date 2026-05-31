type BrandMarkProps = {
  className?: string;
  showWordmark?: boolean;
};

export function BrandMark({ className = "", showWordmark = true }: BrandMarkProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`.trim()}>
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[color:var(--foreground)] text-[color:var(--background)] shadow-[0_10px_30px_rgba(15,23,42,0.16)]">
        <svg
          aria-hidden="true"
          viewBox="0 0 32 32"
          className="h-5 w-5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 7.5h8.4L23 13.1v11.4H9V7.5Z"
            stroke="currentColor"
            strokeWidth="2.3"
            strokeLinejoin="round"
          />
          <path d="M17.2 7.8v5.5h5.5" stroke="currentColor" strokeWidth="2.3" />
          <path
            d="M13 20.2h6M13 16.5h4.5"
            stroke="currentColor"
            strokeWidth="2.3"
            strokeLinecap="round"
          />
          <circle cx="22.4" cy="9.2" r="2.2" fill="#60A5FA" />
        </svg>
      </span>
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span className="text-sm font-semibold tracking-tight">DockDocs</span>
          <span className="mt-1 hidden text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)] sm:block">
            AI Document Platform
          </span>
        </span>
      )}
    </span>
  );
}
