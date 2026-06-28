"use client";

import { useState, useEffect } from "react";
import { headerStructure, navCopy, navItemLabels } from "@/lib/header-nav";
import { readWorkHistory, type WorkHistoryItem } from "@/lib/work-history";
import { getRuntimeCopy, type RuntimeLocale } from "@/lib/copy";

type NavLocale = "en" | "zh" | "es" | "pt" | "fr" | "ja" | "de" | "ko";

function toNavLocale(locale: RuntimeLocale): NavLocale {
  return locale === "zh-Hant" ? "zh" : (locale as NavLocale);
}

export function WorkspaceSidebar({ locale = "en" }: { locale?: RuntimeLocale }) {
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({
    "Document tools": true,
    "AI analysis": true,
    "By profession": true,
  });
  const [history, setHistory] = useState<WorkHistoryItem[]>([]);

  useEffect(() => {
    setHistory(readWorkHistory().slice(0, 5));
  }, []);

  const navLocale = toNavLocale(locale);
  const copy = navCopy[navLocale] as Record<string, string>;
  const labels = navItemLabels[navLocale] as Record<string, string>;
  const dash = getRuntimeCopy(locale).dashboard as unknown as Record<string, string>;
  const recentLabel = dash.recentShort ?? "Recent";

  const toggle = (catKey: string) =>
    setOpenCats((prev) => ({ ...prev, [catKey]: !(prev[catKey] ?? true) }));

  return (
    <nav
      className="flex h-screen shrink-0 flex-col overflow-hidden border-r border-[color:var(--line)]"
      style={{ width: 260, background: "#1a1a1a" }}
    >
      {/* ── Logo + account ── */}
      <div className="flex items-center justify-between border-b border-[color:var(--line)] px-4 py-3">
        <a
          href="/"
          className="text-[14px] font-bold tracking-[-0.02em] text-[color:var(--foreground)]"
          style={{ fontFamily: "var(--font-brand, inherit)" }}
        >
          DockDocs
        </a>
        <a
          href="/account"
          title="Account"
          className="flex h-7 w-7 items-center justify-center rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] text-[color:var(--muted)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5"
          >
            <circle cx="8" cy="5.5" r="2.5" />
            <path d="M2.5 13.5c0-2.76 2.46-5 5.5-5s5.5 2.24 5.5 5" />
          </svg>
        </a>
      </div>

      {/* ── Nav sections ── */}
      <div className="flex-1 overflow-y-auto px-2 py-3">
        {headerStructure.map((cat) => {
          const catLabel = copy[cat.catKey] ?? cat.catKey;
          const isOpen = openCats[cat.catKey] ?? true;

          return (
            <div key={cat.catKey} className="mb-1">
              <button
                type="button"
                onClick={() => toggle(cat.catKey)}
                className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left transition hover:bg-[color:var(--surface)]"
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--faint)]">
                  {catLabel}
                </span>
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`h-3 w-3 text-[color:var(--faint)] transition-transform ${isOpen ? "" : "-rotate-90"}`}
                >
                  <path d="M4 6l4 4 4-4" />
                </svg>
              </button>

              {isOpen && (
                <div className="mt-0.5 space-y-0.5 pb-1">
                  {cat.cols.map((col, colIdx) => {
                    const maybeHeading = (col as { headingKey?: string }).headingKey;

                    if (cat.catKey === "Document tools") {
                      if (!maybeHeading) return null;
                      const colLabel = copy[maybeHeading] ?? maybeHeading;
                      const firstSlug = col.items[0]?.slug ?? "/";
                      return (
                        <a
                          key={colIdx}
                          href={firstSlug}
                          className="flex items-center rounded px-3 py-1.5 text-[13px] text-[color:var(--muted)] transition hover:bg-[color:var(--surface)] hover:text-[color:var(--foreground)]"
                        >
                          {colLabel}
                        </a>
                      );
                    }

                    return (
                      <div key={colIdx}>
                        {maybeHeading && (
                          <p className="mb-0.5 mt-1.5 px-3 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[color:var(--faint)]">
                            {copy[maybeHeading] ?? maybeHeading}
                          </p>
                        )}
                        {col.items.map((item) => {
                          const label = labels[item.key] ?? item.key;
                          const soon = (item as { soon?: boolean }).soon;
                          return (
                            <a
                              key={item.key}
                              href={item.slug}
                              className={`flex items-center justify-between rounded px-3 py-1.5 text-[13px] transition hover:bg-[color:var(--surface)] ${
                                soon
                                  ? "text-[color:var(--faint)]"
                                  : "text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
                              }`}
                            >
                              <span>{label}</span>
                              {soon && (
                                <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[color:var(--faint)]">
                                  soon
                                </span>
                              )}
                            </a>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* ── Recent ── */}
        {history.length > 0 && (
          <div className="mt-2 border-t border-[color:var(--line)] pt-2">
            <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--faint)]">
              {recentLabel}
            </p>
            {history.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className="flex min-w-0 flex-col rounded px-3 py-1.5 transition hover:bg-[color:var(--surface)]"
              >
                <span className="truncate text-[12.5px] font-medium text-[color:var(--muted)]">
                  {item.fileName}
                </span>
                <span className="text-[11px] text-[color:var(--faint)]">{item.subtitle}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
