// Small CSS-only loading spinner shared by the visual PDF tools while a file
// is being rendered. Size/colour come from className; defaults to a 28px ring.
export function Spinner({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full border-2 border-[color:var(--line)] border-t-[color:var(--accent)] ${className}`}
    />
  );
}
