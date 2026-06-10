"use client";

import { usePathname } from "next/navigation";
import { defaultLocale, isLocale } from "@/lib/i18n";

function stripLocale(pathname: string): { locale: string; barePath: string } {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  if (isLocale(first)) {
    const bare = "/" + segments.slice(1).join("/") || "/";
    return { locale: first, barePath: bare };
  }
  return { locale: defaultLocale, barePath: pathname || "/" };
}

function localizeHref(href: string, locale: string): string {
  if (locale === defaultLocale) return href;
  return `/${locale}${href}`;
}

export type ToolGroup = { label: string; items: { name: string; href: string }[] };

const toolGroups: ToolGroup[] = [
  { label: "AI", items: [
    { name: "Chat with PDF", href: "/chat-with-pdf" },
    { name: "AI Summary", href: "/ai-summary" },
    { name: "OCR PDF", href: "/ocr-pdf" },
  ]},
  { label: "Convert", items: [
    { name: "Word to PDF", href: "/word-to-pdf" }, { name: "PDF to Word", href: "/pdf-to-word" },
    { name: "Excel to PDF", href: "/excel-to-pdf" }, { name: "PDF to Excel", href: "/pdf-to-excel" },
    { name: "PPT to PDF", href: "/ppt-to-pdf" },
    { name: "JPG to PDF", href: "/jpg-to-pdf" }, { name: "PNG to PDF", href: "/png-to-pdf" },
    { name: "PDF to JPG", href: "/pdf-to-jpg" }, { name: "PDF to PNG", href: "/pdf-to-png" },
    { name: "PDF to Markdown", href: "/pdf-to-markdown" },
  ]},
  { label: "Organize", items: [
    { name: "Merge PDF", href: "/merge-pdf" }, { name: "Split PDF", href: "/split-pdf" },
    { name: "Compress PDF", href: "/compress-pdf" },
    { name: "Delete Pages", href: "/delete-page" }, { name: "Rotate Pages", href: "/rotate-page" },
    { name: "Reorder Pages", href: "/reorder-pages" }, { name: "Add Pages", href: "/add-page" },
  ]},
  { label: "Security", items: [
    { name: "Protect PDF", href: "/protect-pdf" },
  ]},
];

export function SidebarNav() {
  const pathname = usePathname();
  const { locale, barePath } = stripLocale(pathname ?? "/");
  const alwaysShowPaths = ["/dashboard", "/pricing"];
  const isToolPage = barePath === "/" || toolGroups.some((g) => g.items.some((item) => barePath.startsWith(item.href))) || alwaysShowPaths.some((p) => barePath.startsWith(p));
  if (!isToolPage) return null;

  return (
    <aside className="hidden w-48 shrink-0 border-r border-[color:var(--line)] bg-[color:var(--surface)] md:block xl:w-52">
      <nav className="sticky top-[57px] max-h-[calc(100vh-57px)] overflow-y-auto px-3 py-4">
        {toolGroups.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--faint)]">{group.label}</p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = barePath === item.href;
                return (
                  <li key={item.href}>
                    <a href={localizeHref(item.href, locale)} className={`block rounded-[var(--radius-sm)] px-2 py-1.5 text-[13px] font-medium transition ${isActive ? "bg-[color:var(--soft-accent)] text-[color:var(--accent-strong)]" : "text-[color:var(--muted)] hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)]"}`}>
                      {item.name}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
