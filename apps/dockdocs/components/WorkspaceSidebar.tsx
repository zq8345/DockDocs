"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { headerStructure, navCopy, navItemLabels } from "@/lib/header-nav";
import { getRuntimeCopy, type RuntimeLocale } from "@/lib/copy";
import { routeLocales, localeLabels } from "@/lib/i18n";
import { getUser, onAuthChange, type AuthUser } from "@/lib/auth";
import { getSubscriptionSnapshot } from "@/lib/subscription-runtime";

type NavLocale = "en" | "zh" | "es" | "pt" | "fr" | "ja" | "de" | "ko";

function toNavLocale(locale: RuntimeLocale): NavLocale {
  return locale === "zh-Hant" ? "zh" : (locale as NavLocale);
}

const SHOWN_LOCALES = (routeLocales as readonly string[]).filter((l) => l !== "zh-Hant");
const EMBEDDED_SLUGS = new Set(["/chat-with-pdf", "/compare", "/ai-summary", "/contract-risk"]);

// Module-level to avoid remount on every render
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
  // ⑤ Flat: Document tools' 3 cols + AI analysis + By profession at same level
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

  // ② Init theme from localStorage / OS preference
  useEffect(() => {
    try {
      const stored = localStorage.getItem("dockdocs-theme");
      const isLight = stored === "light" ||
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
    try { localStorage.setItem("dockdocs-lang", next); } catch {}
    setLangOpen(false);
    router.push(`/${next}/dashboard`);
  }

  const initials = authUser?.name
    ? authUser.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : authUser?.email?.[0]?.toUpperCase() ?? "";
  const displayName = authUser?.name ?? authUser?.email ?? "";
  const langLabel = (localeLabels as Record<string, string>)[locale] ?? locale.toUpperCase();

  // ⑤ Build flat render list
  const docToolsCat = headerStructure.find((c) => c.catKey === "Document tools");
  const otherCats = headerStructure.filter((c) => c.catKey !== "Document tools");

  const itemCls = (isActive: boolean, soon: boolean) =>
    `flex w-full items-center justify-between rounded px-3 py-1.5 text-left text-[13px] transition hover:bg-[color:var(--surface)] ${
      isActive
        ? "bg-[color:var(--surface)] text-[color:var(--accent)]"
        : soon
        ? "text-[color:var(--faint)]"
        : "text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
    }`;

  const SoonBadge = () => (
    <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[color:var(--faint)]">
      soon
    </span>
  );

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

      {/* ── ③ Nav sections (⑤ flat 5 categories) ── */}
      <div className="flex-1 overflow-y-auto px-2 py-3">
        {/* Document tools: 3 cols promoted to top-level */}
        {docToolsCat?.cols.map((col) => {
          const heading = (col as { headingKey?: string }).headingKey;
          if (!heading) return null;
          const catLabel = copy[heading] ?? heading;
          const isOpen = openCats[heading] ?? false;
          return (
            <div key={heading} className="mb-1">
              <button
                type="button"
                onClick={() => toggle(heading)}
                className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left transition hover:bg-[color:var(--surface)]"
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--faint)]">
                  {catLabel}
                </span>
                <ChevronIcon open={isOpen} />
              </button>
              {isOpen && (
                <div className="mt-0.5 space-y-0.5 pb-1">
                  {col.items.map((item) => {
                    const label = labels[item.key] ?? item.key;
                    const soon = !!(item as { soon?: boolean }).soon;
                    const isActive = activeTool === item.slug;
                    return (
                      <a
                        key={item.key}
                        href={item.slug}
                        className={`flex items-center justify-between rounded px-3 py-1.5 text-[12.5px] transition hover:bg-[color:var(--surface)] ${
                          isActive
                            ? "bg-[color:var(--surface)] text-[color:var(--accent)]"
                            : soon
                            ? "text-[color:var(--faint)]"
                            : "text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
                        }`}
                      >
                        <span>{label}</span>
                        {soon && <SoonBadge />}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* AI analysis + By profession */}
        {otherCats.map((cat) => {
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
                <ChevronIcon open={isOpen} />
              </button>
              {isOpen && (
                <div className="mt-0.5 space-y-0.5 pb-1">
                  {cat.cols.map((col, colIdx) => {
                    const maybeHeading = (col as { headingKey?: string }).headingKey;
                    return (
                      <div key={colIdx}>
                        {maybeHeading && (
                          <p className="mb-0.5 mt-1.5 px-3 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[color:var(--faint)]">
                            {copy[maybeHeading] ?? maybeHeading}
                          </p>
                        )}
                        {col.items.map((item) => {
                          const label = labels[item.key] ?? item.key;
                          const soon = !!(item as { soon?: boolean }).soon;
                          const isActive = activeTool === item.slug;
                          const canEmbed = !!onToolSelect && !soon && EMBEDDED_SLUGS.has(item.slug);
                          return canEmbed ? (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => onToolSelect(item.slug)}
                              className={itemCls(isActive, soon)}
                            >
                              <span>{label}</span>
                            </button>
                          ) : (
                            <a
                              key={item.key}
                              href={item.slug}
                              className={itemCls(isActive, soon)}
                            >
                              <span>{label}</span>
                              {soon && <SoonBadge />}
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
      </div>

      {/* ── ④ Bottom: two rows ── */}
      <div className="shrink-0 border-t border-[color:var(--line)] px-3 py-2.5">
        {/* Row 1: avatar + name + plan badge */}
        <a
          href="/account"
          className="mb-2 flex min-w-0 items-center gap-2 rounded px-1 py-1 transition hover:bg-[color:var(--surface)]"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[color:var(--line)] bg-[color:var(--surface)]">
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
          <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.06em] ${
            planLabel === "Free"
              ? "bg-[color:var(--surface)] text-[color:var(--faint)]"
              : "bg-[color:var(--surface-subtle)] text-[color:var(--accent)]"
          }`}>
            {planLabel}
          </span>
        </a>

        {/* Row 2: language switcher + theme toggle */}
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <button
              type="button"
              onClick={() => setLangOpen((v) => !v)}
              className="flex h-7 w-full items-center gap-1.5 rounded border border-[color:var(--line)] bg-[color:var(--surface)] px-2 text-[11px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]"
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
                      className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-[13px] transition hover:bg-[color:var(--surface)] ${
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
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-[color:var(--line)] bg-[color:var(--surface)] text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--foreground)]"
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
