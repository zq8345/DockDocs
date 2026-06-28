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
      className="flex shrink-0 items-center border-b border-[color:var(--line)] bg-[color:var(--surface)] px-4"
      style={{ height: 48 }}
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
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3 w-3 text-[color:var(--faint)]"
            >
              <path d="M6 3l5 5-5 5" />
            </svg>
            <span className="text-[color:var(--foreground)]">{toolLabel}</span>
          </>
        )}
      </nav>
    </header>
  );
}
