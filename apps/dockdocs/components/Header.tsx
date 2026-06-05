"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { defaultLocale, isLocale } from "@/lib/i18n";

const toolIcons: Record<string, string> = {
  "chat-with-pdf": "💬", "ai-summary": "📋", "ocr-pdf": "🔍", "translate-pdf": "🌐",
  "word-to-pdf": "📄", "pdf-to-word": "📕", "excel-to-pdf": "📊", "pdf-to-excel": "📕",
  "ppt-to-pdf": "🖥", "jpg-to-pdf": "🖼", "png-to-pdf": "🖼", "pdf-to-jpg": "📕",
  "pdf-to-png": "📕", "text-to-pdf": "📝", "pdf-to-markdown": "📕",
  "merge-pdf": "🔗", "split-pdf": "✂️", "compress-pdf": "📦",
  "delete-page": "🗑", "rotate-page": "🔄", "reorder-pages": "📑", "add-page": "➕",
  "protect-pdf": "🔒", "unlock-pdf": "🔓", "edit-pdf": "✏️", "sign-pdf": "✍️",
};

function iconFor(href: string) { return toolIcons[href.replace(/^\//, "")] || "📄"; }

const allToolGroups = [
  { label: "AI", items: ["Chat with PDF","AI Summary","OCR PDF","Translate PDF"], slugs: ["/chat-with-pdf","/ai-summary","/ocr-pdf","/translate-pdf"] },
  { label: "Convert", items: ["Word to PDF","PDF to Word","Excel to PDF","PDF to Excel","PPT to PDF","JPG to PDF","PNG to PDF","PDF to JPG","PDF to PNG","Text to PDF","PDF to Markdown"], slugs: ["/word-to-pdf","/pdf-to-word","/excel-to-pdf","/pdf-to-excel","/ppt-to-pdf","/jpg-to-pdf","/png-to-pdf","/pdf-to-jpg","/pdf-to-png","/text-to-pdf","/pdf-to-markdown"] },
  { label: "Organize", items: ["Merge PDF","Split PDF","Compress PDF","Delete Pages","Rotate Pages","Reorder Pages","Add Pages"], slugs: ["/merge-pdf","/split-pdf","/compress-pdf","/delete-page","/rotate-page","/reorder-pages","/add-page"] },
  { label: "Edit & Security", items: ["Edit PDF","Sign PDF","Protect PDF","Unlock PDF"], slugs: ["/edit-pdf","/sign-pdf","/protect-pdf","/unlock-pdf"] },
];

const topTools = ["/merge-pdf","/compress-pdf","/chat-with-pdf"];
const topNames: Record<string, string> = { "/merge-pdf":"Merge PDF","/compress-pdf":"Compress PDF","/chat-with-pdf":"Chat with PDF" };
const pageLinks = [{ name: "Pricing", href: "/pricing" },{ name: "Blog", href: "/blog" },{ name: "About", href: "/about" }];

function stripLocale(p: string) { const s = p.split("/").filter(Boolean); return isLocale(s[0]) ? s[0] : defaultLocale; }
function lh(h: string, l: string) { return l === defaultLocale ? h : `/${l}${h}`; }

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [light, setLight] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const locale = stripLocale(pathname ?? "/");

  useEffect(() => { setLight(document.documentElement.classList.contains("light")); }, []);
  useEffect(() => { setMobileOpen(false); }, [pathname]);
  useEffect(() => { document.body.style.overflow = mobileOpen ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [mobileOpen]);

  function toggleTheme() {
    const n = !light; setLight(n);
    document.documentElement.classList.toggle("light", n);
    try { localStorage.setItem("dockdocs-theme", n ? "light" : "dark"); } catch {}
  }

  function navTo(href: string) { router.push(lh(href, locale)); }

  const nl = "rounded-[var(--radius-sm)] px-2.5 py-1.5 text-[13px] font-medium text-[color:var(--muted)] transition hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)] cursor-pointer";

  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--line)] bg-[color:var(--surface)]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-[52px] max-w-6xl items-center px-4 lg:px-6">
        <a href={lh("/", locale)} className="shrink-0 mr-4"><BrandMark /></a>
        <nav className="hidden flex-1 items-center justify-center gap-0.5 md:flex">
          {topTools.map((t) => (
            <button key={t} type="button" onClick={() => navTo(t)} className={nl}>{topNames[t]}</button>
          ))}
          <div className="relative group">
            <span className={nl + " flex items-center gap-1"}>
              All Tools <svg className="h-3 w-3 transition group-hover:rotate-180" viewBox="0 0 12 12" fill="none"><path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </span>
            <div className="absolute left-1/2 top-full z-50 mt-1 hidden w-[520px] -translate-x-1/2 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5 shadow-[0_16px_48px_rgba(0,0,0,0.4)] group-hover:block">
              <div className="grid gap-5" style={{ gridTemplateColumns: `repeat(${allToolGroups.length}, 1fr)` }}>
                {allToolGroups.map((g) => (
                  <div key={g.label}>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--faint)]">{g.label}</p>
                    <div className="space-y-0.5">
                      {g.items.map((item, i) => (
                        <button key={g.slugs[i]} type="button" onClick={() => navTo(g.slugs[i])} className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 text-left text-[13px] font-medium text-[color:var(--muted)] transition hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)]">
                          <span className="shrink-0 text-[15px]">{iconFor(g.slugs[i])}</span> {item}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {pageLinks.map((p) => (
            <button key={p.href} type="button" onClick={() => navTo(p.href)} className={nl}>{p.name}</button>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          <LanguageSwitcher />
          <button type="button" onClick={toggleTheme} aria-label="Toggle theme" className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] text-sm transition hover:border-[color:var(--line-strong)]">{light ? "☾" : "☀"}</button>
          <button type="button" onClick={() => navTo("/account")} className="hidden rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3 py-1.5 text-[13px] font-medium text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--foreground)] md:inline-flex">Sign in</button>
          <button type="button" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu" className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] md:hidden"><span className="text-sm">{mobileOpen ? "✕" : "☰"}</span></button>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 top-[52px] z-40 overflow-y-auto bg-[color:var(--background)] md:hidden">
          <div className="px-4 py-4">
            <div className="mb-6 flex flex-wrap gap-1">
              {[...topTools.map(t => ({ name: topNames[t], href: t })), ...pageLinks].map(item => (
                <button key={item.href} type="button" onClick={() => { navTo(item.href); setMobileOpen(false); }} className="rounded-[var(--radius-sm)] px-3 py-2 text-[15px] font-medium text-[color:var(--muted)] transition hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)]">{item.name}</button>
              ))}
            </div>
            <div className="mb-6 border-t border-[color:var(--line)]" />
            {allToolGroups.map(g => (
              <div key={g.label} className="mb-6">
                <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--faint)]">{g.label}</p>
                <div className="grid grid-cols-2 gap-1">
                  {g.items.map((item, i) => (
                    <button key={g.slugs[i]} type="button" onClick={() => { navTo(g.slugs[i]); setMobileOpen(false); }} className="flex items-center gap-2 rounded-[var(--radius-sm)] px-2 py-2 text-left text-[14px] font-medium text-[color:var(--muted)] transition hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)]">{iconFor(g.slugs[i])} {item}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}</header>
  );
}
