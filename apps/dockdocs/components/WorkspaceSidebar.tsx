"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { headerStructure, navCopy, navItemLabels } from "@/lib/header-nav";
import { readWorkHistory, type WorkHistoryItem } from "@/lib/work-history";
import { getRuntimeCopy, type RuntimeLocale } from "@/lib/copy";
import { routeLocales, localeLabels } from "@/lib/i18n";
import { getUser, onAuthChange, type AuthUser } from "@/lib/auth";

type NavLocale = "en" | "zh" | "es" | "pt" | "fr" | "ja" | "de" | "ko";

function toNavLocale(locale: RuntimeLocale): NavLocale {
  return locale === "zh-Hant" ? "zh" : (locale as NavLocale);
}

const SHOWN_LOCALES = (routeLocales as readonly string[]).filter((l) => l !== "zh-Hant");
const EMBEDDED_SLUGS = new Set(["/chat-with-pdf", "/compare", "/ai-summary", "/contract-risk"]);

export function WorkspaceSidebar({
  locale = "en",
  activeTool = null,
  onToolSelect,
}: {
  locale?: RuntimeLocale;
  activeTool?: string | null;
  onToolSelect?: (slug: string | null) => void;
}) {
  const router = useRouter();
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({
    "Document tools": true,
    "AI analysis": true,
    "By profession": true,
  });
  const [openDocSubs, setOpenDocSubs] = useState<Record<string, boolean>>({});
  const [history, setHistory] = useState<WorkHistoryItem[]>([]);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    setHistory(readWorkHistory().slice(0, 5));
  }, []);

  useEffect(() => {
    let mounted = true;
    getUser().then((u) => { if (mounted) setAuthUser(u); }).catch(() => {});
    const unsub = onAuthChange((u) => { if (mounted) setAuthUser(u); });
    return () => { mounted = false; unsub(); };
  }, []);

  const navLocale = toNavLocale(locale);
  const copy = navCopy[navLocale] as Record<string, string>;
  const labels = navItemLabels[navLocale] as Record<string, string>;
  const dash = getRuntimeCopy(locale).dashboard as unknown as Record<string, string>;
  const recentLabel = dash.recentShort ?? "Recent";

  const toggle = (catKey: string) =>
    setOpenCats((prev) => ({ ...prev, [catKey]: !(prev[catKey] ?? true) }));

  const toggleDocSub = (key: string) =>
    setOpenDocSubs((prev) => ({ ...prev, [key]: !(prev[key] ?? false) }));

  function switchLocale(next: string) {
    try { localStorage.setItem("dockdocs-lang", next); } catch {}
    setLangOpen(false);
    router.push(`/${next}/dashboard`);
  }

  const initials = authUser?.name
    ? authUser.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : authUser?.email?.[0]?.toUpperCase() ?? "";

  const langLabel = (localeLabels as Record<string, string>)[locale] ?? locale.toUpperCase();

  return (
    <nav
      className="flex h-full shrink-0 flex-col overflow-hidden border-r border-[color:var(--line)]"
      style={{ width: 260, background: "#1a1a1a" }}
    >
      {/* ── ① Logo ── */}
      <div
        className="flex shrink-0 items-center border-b border-[color:var(--line)] px-4"
        style={{ height: 48 }}
      >
        <button
          type="button"
          onClick={() => onToolSelect?.(null)}
          className="text-[14px] font-bold tracking-[-0.02em] text-[color:var(--foreground)] transition hover:text-[color:var(--accent)]"
          style={{ fontFamily: "var(--font-brand, inherit)" }}
        >
          DockDocs
        </button>
      </div>

      {/* ── ③ Nav sections ── */}
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
                      const isSubOpen = openDocSubs[maybeHeading] ?? false;
                      return (
                        <div key={colIdx}>
                          <button
                            type="button"
                            onClick={() => toggleDocSub(maybeHeading)}
                            className="flex w-full items-center justify-between rounded px-3 py-1.5 text-left text-[13px] text-[color:var(--muted)] transition hover:bg-[color:var(--surface)] hover:text-[color:var(--foreground)]"
                          >
                            <span>{colLabel}</span>
                            <svg
                              viewBox="0 0 16 16"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className={`h-3 w-3 shrink-0 text-[color:var(--faint)] transition-transform ${isSubOpen ? "" : "-rotate-90"}`}
                            >
                              <path d="M4 6l4 4 4-4" />
                            </svg>
                          </button>
                          {isSubOpen && (
                            <div className="pb-1 pl-3">
                              {col.items.map((item) => {
                                const label = labels[item.key] ?? item.key;
                                const soon = (item as { soon?: boolean }).soon;
                                const isActive = activeTool === item.slug;
                                return (
                                  <a
                                    key={item.key}
                                    href={item.slug}
                                    className={`flex items-center justify-between rounded px-2 py-1.5 text-[12.5px] transition hover:bg-[color:var(--surface)] ${
                                      isActive
                                        ? "bg-[color:var(--surface)] text-[color:var(--accent)]"
                                        : soon
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
                          )}
                        </div>
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
                          const isActive = activeTool === item.slug;
                          const canEmbed = !!onToolSelect && !soon && EMBEDDED_SLUGS.has(item.slug);
                          const itemClass = `flex w-full items-center justify-between rounded px-3 py-1.5 text-left text-[13px] transition hover:bg-[color:var(--surface)] ${
                            isActive
                              ? "bg-[color:var(--surface)] text-[color:var(--accent)]"
                              : soon
                              ? "text-[color:var(--faint)]"
                              : "text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
                          }`;
                          return canEmbed ? (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => onToolSelect(item.slug)}
                              className={itemClass}
                            >
                              <span>{label}</span>
                            </button>
                          ) : (
                            <a
                              key={item.key}
                              href={item.slug}
                              className={itemClass}
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

      {/* ── ④ Bottom: language + account ── */}
      <div className="shrink-0 border-t border-[color:var(--line)] px-2 py-2">
        <div className="flex items-center gap-1.5">
          {/* Language switcher */}
          <div className="relative flex-1">
            <button
              type="button"
              onClick={() => setLangOpen((v) => !v)}
              className="flex h-8 w-full items-center gap-1.5 rounded border border-[color:var(--line)] bg-[color:var(--surface)] px-2.5 text-[12px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]"
            >
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3.5 w-3.5 shrink-0 text-[color:var(--muted)]"
              >
                <circle cx="8" cy="8" r="6.5" />
                <path d="M1.5 8h13M8 1.5c-1.5 1.5-1.5 9 0 13M8 1.5c1.5 1.5 1.5 9 0 13" />
              </svg>
              <span className="flex-1 text-left">{langLabel}</span>
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`h-3 w-3 shrink-0 text-[color:var(--muted)] transition-transform ${langOpen ? "rotate-180" : ""}`}
              >
                <path d="M4 6l4 4 4-4" />
              </svg>
            </button>

            {langOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                <div className="absolute bottom-full left-0 z-50 mb-1 w-44 overflow-hidden rounded-[var(--radius)] border border-[color:var(--line)] bg-[#1a1a1a] py-1 shadow-lg">
                  {SHOWN_LOCALES.map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => switchLocale(l)}
                      className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-[13px] transition hover:bg-[color:var(--surface)] ${
                        l === locale ? "text-[color:var(--accent)]" : "text-[color:var(--muted)]"
                      }`}
                    >
                      <span>{(localeLabels as Record<string, string>)[l] ?? l}</span>
                      {l === locale && (
                        <svg
                          viewBox="0 0 12 12"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-3 w-3"
                        >
                          <path d="M2 6l3 3 5-5" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Account avatar */}
          <a
            href="/account"
            title="Account"
            className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] transition hover:border-[color:var(--accent)]"
          >
            {authUser?.pictureUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={authUser.pictureUrl} alt="" className="h-full w-full object-cover" />
            ) : initials ? (
              <span className="text-[10px] font-semibold text-[color:var(--muted)]">{initials}</span>
            ) : (
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3.5 w-3.5 text-[color:var(--muted)]"
              >
                <circle cx="8" cy="5.5" r="2.5" />
                <path d="M2.5 13.5c0-2.76 2.46-5 5.5-5s5.5 2.24 5.5 5" />
              </svg>
            )}
          </a>
        </div>
      </div>
    </nav>
  );
}
