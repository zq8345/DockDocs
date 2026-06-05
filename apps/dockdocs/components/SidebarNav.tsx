"use client";

import { usePathname } from "next/navigation";

type ToolGroup = {
  label: string;
  items: { name: string; href: string }[];
};

const toolGroups: ToolGroup[] = [
  {
    label: "AI Workspace",
    items: [
      { name: "Chat with PDF", href: "/chat-with-pdf" },
      { name: "AI Summary", href: "/ai-summary" },
      { name: "OCR Workspace", href: "/ocr" },
    ],
  },
  {
    label: "Convert",
    items: [
      { name: "Word to PDF", href: "/word-to-pdf" },
      { name: "PPT to PDF", href: "/ppt-to-pdf" },
      { name: "Excel to PDF", href: "/excel-to-pdf" },
      { name: "PDF to Word", href: "/pdf-to-word" },
      { name: "PDF to Excel", href: "/pdf-to-excel" },
      { name: "JPG to PDF", href: "/jpg-to-pdf" },
      { name: "PNG to PDF", href: "/png-to-pdf" },
      { name: "Text to PDF", href: "/text-to-pdf" },
    ],
  },
  {
    label: "Edit & Organize",
    items: [
      { name: "Merge PDF", href: "/merge-pdf" },
      { name: "Split PDF", href: "/split-pdf" },
      { name: "Compress PDF", href: "/compress-pdf" },
      { name: "Delete Pages", href: "/delete-page" },
      { name: "Rotate Pages", href: "/rotate-page" },
      { name: "Reorder Pages", href: "/reorder-pages" },
      { name: "Add Pages", href: "/add-page" },
    ],
  },
  {
    label: "Export & Protect",
    items: [
      { name: "PDF to JPG", href: "/pdf-to-jpg" },
      { name: "PDF to PNG", href: "/pdf-to-png" },
      { name: "PDF to Markdown", href: "/pdf-to-markdown" },
      { name: "OCR PDF", href: "/ocr-pdf" },
      { name: "Protect PDF", href: "/protect-pdf" },
    ],
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  // Hide sidebar on non-tool pages (blog, guides, resources, etc.)
  const isToolPage =
    pathname === "/" ||
    toolGroups.some((g) =>
      g.items.some((item) => pathname.startsWith(item.href)),
    ) ||
    pathname === "/dashboard" ||
    pathname === "/pricing";

  if (!isToolPage) return null;

  return (
    <aside className="hidden w-56 shrink-0 border-r border-[color:var(--line)] bg-[color:var(--surface)] lg:block">
      <nav className="sticky top-[57px] max-h-[calc(100vh-57px)] overflow-y-auto px-3 py-4">
        {toolGroups.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--faint)]">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className={`block rounded-[var(--radius-sm)] px-2 py-1.5 text-[13px] font-medium transition ${
                        isActive
                          ? "bg-[color:var(--soft-accent)] text-[color:var(--accent-strong)]"
                          : "text-[color:var(--muted)] hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)]"
                      }`}
                    >
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
