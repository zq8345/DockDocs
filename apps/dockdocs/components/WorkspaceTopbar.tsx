"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { routeLocales, localeLabels } from "@/lib/i18n";
import { getUser, onAuthChange, type AuthUser } from "@/lib/auth";
import { type RuntimeLocale } from "@/lib/copy";

const SHOWN_LOCALES = (routeLocales as readonly string[]).filter((l) => l !== "zh-Hant");

export function WorkspaceTopbar({ locale }: { locale: RuntimeLocale }) {
  const router = useRouter();
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    getUser().then((u) => { if (mounted) setAuthUser(u); }).catch(() => {});
    const unsub = onAuthChange((u) => { if (mounted) setAuthUser(u); });
    return () => { mounted = false; unsub(); };
  }, []);

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
    <header
      className="flex shrink-0 items-center justify-between border-b border-[color:var(--line)] px-4"
      style={{ height: 48, background: "#1a1a1a" }}
    >
      {/* Logo */}
      <a
        href={`/${locale}/dashboard`}
        className="text-[14px] font-bold tracking-[-0.02em] text-[color:var(--foreground)]"
        style={{ fontFamily: "var(--font-brand, inherit)" }}
      >
        DockDocs
      </a>

      {/* Right controls */}
      <div className="flex items-center gap-1">

        {/* Language switcher */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setLangOpen((v) => !v)}
            className="flex h-7 items-center gap-1.5 rounded border border-[color:var(--line)] bg-[color:var(--surface)] px-2.5 text-[12px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0 text-[color:var(--muted)]">
              <circle cx="8" cy="8" r="6.5" />
              <path d="M1.5 8h13M8 1.5c-1.5 1.5-1.5 9 0 13M8 1.5c1.5 1.5 1.5 9 0 13" />
            </svg>
            <span>{langLabel}</span>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`h-3 w-3 shrink-0 text-[color:var(--muted)] transition-transform ${langOpen ? "rotate-180" : ""}`}>
              <path d="M4 6l4 4 4-4" />
            </svg>
          </button>

          {langOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
              <div className="absolute right-0 top-full z-50 mt-1 w-44 overflow-hidden rounded-[var(--radius)] border border-[color:var(--line)] bg-[#1a1a1a] py-1 shadow-lg">
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

        {/* Account */}
        <a
          href="/account"
          title="Account"
          className="ml-1 flex h-7 w-7 items-center justify-center rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] overflow-hidden transition hover:border-[color:var(--accent)]"
        >
          {authUser?.pictureUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={authUser.pictureUrl} alt="" className="h-full w-full object-cover" />
          ) : initials ? (
            <span className="text-[10px] font-semibold text-[color:var(--muted)]">{initials}</span>
          ) : (
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-[color:var(--muted)]">
              <circle cx="8" cy="5.5" r="2.5" />
              <path d="M2.5 13.5c0-2.76 2.46-5 5.5-5s5.5 2.24 5.5 5" />
            </svg>
          )}
        </a>
      </div>
    </header>
  );
}
