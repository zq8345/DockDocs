import type { ReactNode } from "react";
import { LAYOUT } from "@/lib/layout-constants";

// ── Class-string constants — About v2 / Home v2 design baseline ──────────
export const SHELL = `mx-auto ${LAYOUT.content} px-6 py-24`;
export const H2 = "text-[28px] font-normal leading-[1.15] tracking-[-0.02em] text-[color:var(--foreground)] sm:text-[36px]";
export const SUB = "mt-4 max-w-2xl text-[16px] leading-[1.6] text-[color:var(--muted)]";
export const CAP = "mt-4 font-mono text-[12px] text-[color:var(--faint)]";
export const PANEL = "rounded-xl border border-[color:var(--line)] bg-black/20 p-5";

// Eyebrow class — mono faint; zh skips uppercase + tracking
export const eyebrowCls = (zh: boolean) =>
  `font-mono text-[12px] text-[color:var(--faint)] ${zh ? "" : "uppercase tracking-[0.08em]"}`;

// ── Dropzone visual + shell ─────────────────────────────────────────────────
// dropzoneVisual is the SINGLE source for what a dropzone looks like: radius,
// dashed border, and the idle↔active (hover / drag-over) highlight — nothing
// about layout. Inline drop areas (e.g. the AI workflow control panels, which
// keep their own button-row / textarea layout) spread this onto their own
// container so they share the exact border/radius/drag-over treatment WITHOUT a
// re-drifted inline `border-2 border-dashed …` copy. `active` swaps the idle
// state for the drag-over highlight (drag events can't trigger :hover, so
// callers pass their dragging state).
export const dropzoneVisual = (active = false) =>
  `rounded-[var(--radius-xl)] border-2 border-dashed transition ${
    active
      ? "border-[color:var(--accent)] bg-[color:var(--soft-accent)]"
      : "border-[color:var(--line)] bg-[color:var(--surface-subtle)] hover:border-[color:var(--accent)] hover:bg-[color:var(--soft-accent)]"
  }`;

// dropzoneShell = dropzoneVisual + the full-dropzone layout (flex column,
// min-height, centering, padding, cursor). One upload look site-wide for the
// standard single-file dropzones (UploadDropzone, BatchUploadBox, AI idle
// zones). Depth comes from the dashed border only — no shadow, no self-set
// aspect/width. Lives inside the page max-w-5xl shell; callers prepend their
// own margin (e.g. `mt-8`) and any extra flex gap.
export const dropzoneShell = (active = false) =>
  `flex min-h-[300px] w-full cursor-pointer flex-col items-center justify-center px-6 py-8 text-center sm:min-h-[360px] ${dropzoneVisual(active)}`;

// ── Figure ────────────────────────────────────────────────────────────────
// Depth/weight treatment shared across About + Home (and all future v2 pages):
// soft accent glow behind, raised gradient surface, strong border + large shadow,
// inner lit top edge. Single source of truth — never copy this recipe.
export function Figure({
  children,
  className = "",
  glow = "28%",
}: {
  children: ReactNode;
  className?: string;
  glow?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 blur-[48px]"
        style={{ background: `radial-gradient(55% 60% at ${glow} 45%, rgba(62,207,142,0.10), transparent 70%)` }}
      />
      <div
        className="relative z-10 overflow-hidden rounded-2xl border border-[color:var(--line-strong)] p-6 sm:p-8"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.012) 60%, transparent), var(--surface)",
          boxShadow: "0 24px 60px -20px rgba(0,0,0,0.6), inset 0 1px 0 0 rgba(255,255,255,0.04)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ── React-wrapper primitives (for consumers that prefer JSX over className strings) ──

export function Shell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`${SHELL}${className ? ` ${className}` : ""}`}>{children}</div>;
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`${PANEL}${className ? ` ${className}` : ""}`}>{children}</div>;
}

export function Eyebrow({ zh = false, children }: { zh?: boolean; children: ReactNode }) {
  return <p className={eyebrowCls(zh)}>{children}</p>;
}

export function SectionHeading({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h2 className={`${H2}${className ? ` ${className}` : ""}`}>{children}</h2>;
}

export function Caption({ children }: { children: ReactNode }) {
  return <p className={CAP}>{children}</p>;
}
