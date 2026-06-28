"use client";

import { useState, useEffect } from "react";
import { BrandMark } from "@/components/BrandMark";
import { headerStructure, navCopy, navItemLabels } from "@/lib/header-nav";
import { getRuntimeCopy, type RuntimeLocale } from "@/lib/copy";
import { routeLocales, localeLabels, isRouteLocale } from "@/lib/i18n";
import { getUser, onAuthChange, type AuthUser } from "@/lib/auth";
import { getSubscriptionSnapshot } from "@/lib/subscription-runtime";

type NavLocale = "en" | "zh" | "es" | "pt" | "fr" | "ja" | "de" | "ko";

function toNavLocale(locale: RuntimeLocale): NavLocale {
  return locale === "zh-Hant" ? "zh" : (locale as NavLocale);
}

const SHOWN_LOCALES = routeLocales as readonly string[];
const EMBEDDED_SLUGS = new Set(["/chat-with-pdf", "/compare", "/ai-summary", "/contract-risk"]);

// ── Chevron (module-level to avoid remount) ──────────────────────────────────
function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-3 w-3 shrink-0 text-[color:var(--faint)] transition-transform ${open ? "" : "-rotate-90"}`}
    >
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

// ── Category icons (Tabler-style, 24-viewBox, stroke 1.5) ────────────────────
const CAT_ICONS: Record<string, React.ReactNode> = {
  "PDF conversion": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-[15px] w-[15px]">
      <path d="M14 3H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8l-5-5Z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6m0 0-2-2m2 2-2 2" />
    </svg>
  ),
  "PDF editing": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-[15px] w-[15px]">
      <path d="M11 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />
      <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L13 14l-4 1 1-4 8.5-8.5Z" />
    </svg>
  ),
  "Batch": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-[15px] w-[15px]">
      <path d="M12 2 2 7l10 5 10-5-10-5Z" />
      <path d="M2 12l10 5 10-5" />
      <path d="M2 17l10 5 10-5" />
    </svg>
  ),
  "AI analysis": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-[15px] w-[15px]">
      <path d="M12 3 9.5 9.5 3 12l6.5 2.5L12 21l2.5-6.5L21 12l-6.5-2.5L12 3Z" />
    </svg>
  ),
  "By profession": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-[15px] w-[15px]">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 4 0v2" />
    </svg>
  ),
};

// ── Sub-item: shared active-bar wrapper ──────────────────────────────────────
function NavItemBar({ isActive }: { isActive: boolean }) {
  if (!isActive) return null;
  return <div className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-[color:var(--accent)]" />;
}

const subItemCls = (isActive: boolean, soon: boolean) =>
  `flex items-center justify-between rounded-[var(--radius)] py-1.5 pl-[34px] pr-3 text-[12.5px] transition ${
    isActive
      ? "bg-[color:var(--surface-subtle)] text-[color:var(--accent)]"
      : soon
      ? "cursor-default text-[color:var(--faint)]"
      : "text-[color:var(--muted)] hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)]"
  }`;

const SoonBadge = () => (
  <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[color:var(--faint)]">
    soon
  </span>
);

// ── Main component ───────────────────────────────────────────────────────────
export function WorkspaceSidebar({
  locale = "en",
  activeTool = null,
  onToolSelect,
  onLocaleChange,
}: {
  locale?: RuntimeLocale;
  activeTool?: string | null;
  onToolSelect?: (slug: string | null) => void;
  onLocaleChange?: (next: RuntimeLocale) => void;
}) {
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({
    "PDF conversion": false,
    "PDF editing": false,
    "Batch": false,
    "AI analysis": true,
    "By profession": true,
  });
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [planLabel, setPlanLabel] = useState<"Free" | "Plus" | "Pro">("Free");
  const [langOpen, setLangOpen] = useState(false);
  const [light, setLight] = useState(false);

  useEffect(() => {
    let mounted = true;
    getUser().then((u) => { if (mounted) setAuthUser(u); }).catch(() => {});
    const unsub = onAuthChange((u) => { if (mounted) setAuthUser(u); });
    return () => { mounted = false; unsub(); };
  }, []);

  useEffect(() => {
    getSubscriptionSnapshot()
      .then((snap) => setPlanLabel(snap.displayName))
      .catch(() => {});
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("dockdocs-theme");
      const isLight =
        stored === "light" ||
        (!stored && window.matchMedia("(prefers-color-scheme: light)").matches);
      setLight(isLight);
    } catch {}
  }, []);

  function toggleTheme() {
    const n = !light;
    setLight(n);
    document.documentElement.classList.toggle("light", n);
    try { localStorage.setItem("dockdocs-theme", n ? "light" : "dark"); } catch {}
  }

  const navLocale = toNavLocale(locale);
  const copy = navCopy[navLocale] as Record<string, string>;
  const labels = navItemLabels[navLocale] as Record<string, string>;

  const toggle = (catKey: string) =>
    setOpenCats((prev) => ({ ...prev, [catKey]: !(prev[catKey] ?? false) }));

  function switchLocale(next: string) {
    setLangOpen(false);
    if (isRouteLocale(next)) onLocaleChange?.(next as RuntimeLocale);
  }

  const initials = authUser?.name
    ? authUser.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : authUser?.email?.[0]?.toUpperCase() ?? "";
  const displayName = authUser?.name ?? authUser?.email ?? "";
  const langLabel = (localeLabels as Record<string, string>)[locale] ?? locale.toUpperCase();

  const docToolsCat = headerStructure.find((c) => c.catKey === "Document tools");
  const otherCats = headerStructure.filter((c) => c.catKey !== "Document tools");

  return (
    <nav
      className="flex h-full shrink-0 flex-col overflow-hidden border-r border-[color:var(--line)] bg-[color:var(--surface)]"
      style={{ width: 260 }}
    >
      {/* ── ① Logo ── */}
      <div
        className="flex shrink-0 items-center border-b border-[color:var(--line)] px-4"
        style={{ height: 48 }}
      >
        <button
          type="button"
          onClick={() => onToolSelect?.(null)}
          aria-label="DockDocs"
          className="transition hover:opacity-75"
        >
          <BrandMark />
        </button>
      </div>

      {/* ── ③⑤ Nav ── */}
      <div className="flex-1 overflow-y-auto px-2 py-2">

        {/* Document tools → 3 promoted flat categories */}
        {docToolsCat?.cols.map((col) => {
          const heading = (col as { headingKey?: string }).headingKey;
          if (!heading) return null;
          const catLabel = copy[heading] ?? heading;
          const isOpen = openCats[heading] ?? false;
          return (
            <div key={heading} className="mb-0.5">
              {/* Category row */}
              <button
                type="button"
                onClick={() => toggle(heading)}
                className="group flex w-full items-center gap-2.5 rounded-[var(--radius)] px-3 py-2 text-left transition hover:bg-[color:var(--surface-subtle)]"
              >
                <span className="shrink-0 text-[color:var(--faint)] transition group-hover:text-[color:var(--muted)]">
                  {CAT_ICONS[heading]}
                </span>
                <span className="flex-1 text-[12px] font-semibold text-[color:var(--foreground)]">
                  {catLabel}
                </span>
                <ChevronIcon open={isOpen} />
              </button>
              {/* Sub-items */}
              {isOpen && (
                <div className="mt-0.5 space-y-px pb-1">
                  {col.items.map((item) => {
                    const label = labels[item.key] ?? item.key;
                    const soon = !!(item as { soon?: boolean }).soon;
                    const isActive = activeTool === item.slug;
                    return (
                      <div key={item.key} className="relative">
                        <NavItemBar isActive={isActive} />
                        <a href={item.slug} className={subItemCls(isActive, soon)}>
                          <span>{label}</span>
                          {soon && <SoonBadge />}
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Divider */}
        <div className="my-2 border-t border-[color:var(--line-subtle)]" />

        {/* AI analysis + By profession */}
        {otherCats.map((cat) => {
          const catLabel = copy[cat.catKey] ?? cat.catKey;
          const isOpen = openCats[cat.catKey] ?? true;
          return (
            <div key={cat.catKey} className="mb-0.5">
              {/* Category row */}
              <button
                type="button"
                onClick={() => toggle(cat.catKey)}
                className="group flex w-full items-center gap-2.5 rounded-[var(--radius)] px-3 py-2 text-left transition hover:bg-[color:var(--surface-subtle)]"
              >
                <span className="shrink-0 text-[color:var(--faint)] transition group-hover:text-[color:var(--muted)]">
                  {CAT_ICONS[cat.catKey]}
                </span>
                <span className="flex-1 text-[12px] font-semibold text-[color:var(--foreground)]">
                  {catLabel}
                </span>
                <ChevronIcon open={isOpen} />
              </button>
              {/* Sub-items */}
              {isOpen && (
                <div className="mt-0.5 space-y-px pb-1">
                  {cat.cols.map((col, colIdx) => {
                    const maybeHeading = (col as { headingKey?: string }).headingKey;
                    return (
                      <div key={colIdx}>
                        {maybeHeading && (
                          <p className="mb-0.5 mt-2 px-3 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[color:var(--faint)]">
                            {copy[maybeHeading] ?? maybeHeading}
                          </p>
                        )}
                        {col.items.map((item) => {
                          const label = labels[item.key] ?? item.key;
                          const soon = !!(item as { soon?: boolean }).soon;
                          const isActive = activeTool === item.slug;
                          const canEmbed = !!onToolSelect && !soon && EMBEDDED_SLUGS.has(item.slug);
                          return canEmbed ? (
                            <div key={item.key} className="relative">
                              <NavItemBar isActive={isActive} />
                              <button
                                type="button"
                                onClick={() => onToolSelect(item.slug)}
                                className={subItemCls(isActive, false)}
                                style={{ width: "100%", textAlign: "left" }}
                              >
                                <span>{label}</span>
                              </button>
                            </div>
                          ) : (
                            <div key={item.key} className="relative">
                              <NavItemBar isActive={isActive} />
                              <a href={item.slug} className={subItemCls(isActive, soon)}>
                                <span>{label}</span>
                                {soon && <SoonBadge />}
                              </a>
                            </div>
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
      </div>

      {/* ── ④ Bottom: two rows ── */}
      <div className="shrink-0 border-t border-[color:var(--line)] px-3 py-2.5">
        {/* Row 1: avatar + name + plan badge — opens Zone ⑤ account panel (no navigation) */}
        <button
          type="button"
          onClick={() => onToolSelect?.("/workspace-account")}
          className="mb-2 flex w-full min-w-0 items-center gap-2 rounded px-1 py-1 text-left transition hover:bg-[color:var(--surface-subtle)]"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[color:var(--line)] bg-[color:var(--surface-subtle)]">
            {authUser?.pictureUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={authUser.pictureUrl} alt="" className="h-full w-full object-cover" />
            ) : initials ? (
              <span className="text-[9px] font-semibold text-[color:var(--muted)]">{initials}</span>
            ) : (
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-[color:var(--muted)]">
                <circle cx="8" cy="5.5" r="2.5" />
                <path d="M2.5 13.5c0-2.76 2.46-5 5.5-5s5.5 2.24 5.5 5" />
              </svg>
            )}
          </div>
          <span className="min-w-0 flex-1 truncate text-[12px] text-[color:var(--muted)]">
            {displayName || "Account"}
          </span>
          <span
            className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.06em] ${
              planLabel === "Free"
                ? "bg-[color:var(--surface-subtle)] text-[color:var(--faint)]"
                : "bg-[color:var(--surface-subtle)] text-[color:var(--accent)]"
            }`}
          >
            {planLabel}
          </span>
        </button>

        {/* Row 2: language switcher + theme toggle */}
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <button
              type="button"
              onClick={() => setLangOpen((v) => !v)}
              className="flex h-7 w-full items-center gap-1.5 rounded border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-2 text-[11px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]"
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 shrink-0 text-[color:var(--muted)]">
                <circle cx="8" cy="8" r="6.5" />
                <path d="M1.5 8h13M8 1.5c-1.5 1.5-1.5 9 0 13M8 1.5c1.5 1.5 1.5 9 0 13" />
              </svg>
              <span className="flex-1 text-left">{langLabel}</span>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`h-3 w-3 shrink-0 text-[color:var(--muted)] transition-transform ${langOpen ? "rotate-180" : ""}`}>
                <path d="M4 6l4 4 4-4" />
              </svg>
            </button>
            {langOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                <div className="absolute bottom-full left-0 z-50 mb-1 w-44 overflow-hidden rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] py-1 shadow-lg">
                  {SHOWN_LOCALES.map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => switchLocale(l)}
                      className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-[13px] transition hover:bg-[color:var(--surface-subtle)] ${
                        l === locale ? "text-[color:var(--accent)]" : "text-[color:var(--muted)]"
                      }`}
                    >
                      <span>{(localeLabels as Record<string, string>)[l] ?? l}</span>
                      {l === locale && (
                        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                          <path d="M2 6l3 3 5-5" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* ② Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-[color:var(--line)] bg-[color:var(--surface-subtle)] text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--foreground)]"
          >
            {light ? (
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                <circle cx="8" cy="8" r="3" />
                <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" />
              </svg>
            ) : (
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                <path d="M13.5 8.5A5.5 5.5 0 0 1 7.5 2.5a5.5 5.5 0 1 0 6 6Z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
