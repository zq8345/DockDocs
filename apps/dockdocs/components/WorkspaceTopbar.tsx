"use client";

import { type RuntimeLocale } from "@/lib/copy";

export function WorkspaceTopbar({
  locale,
  activeTool = null,
  toolLabel,
}: {
  locale: RuntimeLocale;
  activeTool?: string | null;
  toolLabel?: string;
}) {
  const wsLabel =
    locale === "zh" || locale === "zh-Hant"
      ? "工作台"
      : locale === "ja"
      ? "ワークスペース"
      : locale === "ko"
      ? "작업 공간"
      : "Workspace";

  return (
    <header
      className="flex shrink-0 items-center border-b border-[color:var(--line)] px-4"
      style={{ height: 48, background: "#1a1a1a" }}
    >
      <nav className="flex items-center gap-1.5 text-[13px]">
        <span
          className={
            activeTool
              ? "text-[color:var(--muted)]"
              : "text-[color:var(--foreground)]"
          }
        >
          {wsLabel}
        </span>
        {activeTool && toolLabel && (
          <>
            <span className="select-none text-[color:var(--faint)]">/</span>
            <span className="text-[color:var(--foreground)]">{toolLabel}</span>
          </>
        )}
      </nav>
    </header>
  );
}
