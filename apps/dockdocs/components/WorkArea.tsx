"use client";

// WorkArea — the shared work-surface container for grid tools (batch family,
// merge, page pickers). One bordered panel connects what used to be two
// floating pieces: a header toolbar (left slot = count + options, right slot
// = secondary actions + primary CTA, border-b separated) and the body (the
// card grid). Same panel language as the edit-pdf editor toolbar: --line
// border, surface-raised header, radius 12, weight 400/500.

import type { ReactNode } from "react";

export function WorkArea({
  left,
  right,
  footer,
  children,
}: {
  /** Header-left: file count, option segments (level, format …). */
  left: ReactNode;
  /** Header-right: secondary buttons + the primary CTA. */
  right: ReactNode;
  /** Optional bottom note row (privacy/processing note), border-t separated. */
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mt-6 overflow-hidden rounded-[12px] border border-[color:var(--line)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--line)] bg-[color:var(--surface-raised)] px-4 py-3">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">{left}</div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">{right}</div>
      </div>
      <div className="p-4">{children}</div>
      {footer && (
        <div className="border-t border-[color:var(--line)] px-4 py-2.5 text-[12px] text-[color:var(--faint)]">
          {footer}
        </div>
      )}
    </div>
  );
}
