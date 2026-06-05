"use client";

import { useState } from "react";

const toolIcons: Record<string, string> = {
  "chat-with-pdf": "💬", "ai-summary": "📋", "ocr-pdf": "🔍", "translate-pdf": "🌐",
  "word-to-pdf": "📄", "pdf-to-word": "📕", "excel-to-pdf": "📊", "pdf-to-excel": "📕",
  "ppt-to-pdf": "🖥", "jpg-to-pdf": "🖼", "png-to-pdf": "🖼", "pdf-to-jpg": "📕",
  "pdf-to-png": "📕", "text-to-pdf": "📝", "pdf-to-markdown": "📕",
  "merge-pdf": "🔗", "split-pdf": "✂️", "compress-pdf": "📦",
  "delete-page": "🗑", "rotate-page": "🔄", "reorder-pages": "📑", "add-page": "➕",
  "protect-pdf": "🔒", "unlock-pdf": "🔓", "edit-pdf": "✏️", "sign-pdf": "✍️",
};

type ToolCard = { name: string; href: string; category: string; isNew?: boolean };

const allTools: ToolCard[] = [
  { name: "Chat with PDF", href: "/chat-with-pdf", category: "ai", isNew: true },
  { name: "AI Summary", href: "/ai-summary", category: "ai" },
  { name: "OCR PDF", href: "/ocr-pdf", category: "ai" },
  { name: "Translate PDF", href: "/translate-pdf", category: "ai", isNew: true },
  { name: "Word to PDF", href: "/word-to-pdf", category: "convert" }, { name: "PDF to Word", href: "/pdf-to-word", category: "convert" },
  { name: "Excel to PDF", href: "/excel-to-pdf", category: "convert" }, { name: "PDF to Excel", href: "/pdf-to-excel", category: "convert" },
  { name: "PPT to PDF", href: "/ppt-to-pdf", category: "convert" },
  { name: "JPG to PDF", href: "/jpg-to-pdf", category: "convert" }, { name: "PNG to PDF", href: "/png-to-pdf", category: "convert" },
  { name: "PDF to JPG", href: "/pdf-to-jpg", category: "convert" }, { name: "PDF to PNG", href: "/pdf-to-png", category: "convert" },
  { name: "Text to PDF", href: "/text-to-pdf", category: "convert" }, { name: "PDF to Markdown", href: "/pdf-to-markdown", category: "convert" },
  { name: "Merge PDF", href: "/merge-pdf", category: "organize" }, { name: "Split PDF", href: "/split-pdf", category: "organize" },
  { name: "Compress PDF", href: "/compress-pdf", category: "organize" },
  { name: "Delete Pages", href: "/delete-page", category: "organize" }, { name: "Rotate Pages", href: "/rotate-page", category: "organize" },
  { name: "Reorder Pages", href: "/reorder-pages", category: "organize" }, { name: "Add Pages", href: "/add-page", category: "organize" },
  { name: "Protect PDF", href: "/protect-pdf", category: "security" }, { name: "Unlock PDF", href: "/unlock-pdf", category: "security", isNew: true },
  { name: "Edit PDF", href: "/edit-pdf", category: "edit", isNew: true }, { name: "Sign PDF", href: "/sign-pdf", category: "edit", isNew: true },
];

const categories = [
  { key: "all", label: "All" }, { key: "ai", label: "AI" }, { key: "convert", label: "Convert" },
  { key: "organize", label: "Organize" }, { key: "edit", label: "Edit" }, { key: "security", label: "Security" },
] as const;

export function HomeClient() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const filtered = activeCategory === "all" ? allTools : allTools.filter((t) => t.category === activeCategory);

  return (
    <>
      <section className="border-b border-[color:var(--line)]">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-5 py-16 text-center sm:py-20">
          <h1 className="max-w-2xl text-[36px] font-semibold leading-[1.08] tracking-[-0.018em] sm:text-[48px]">Every tool you need for PDFs,<br /><span className="text-[color:var(--accent-strong)]">with AI.</span></h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-[color:var(--muted)]">Merge, split, compress, convert, chat, summarize — all 100% free.</p>
        </div>
      </section>

      <div className="sticky top-[52px] z-30 border-b border-[color:var(--line)] bg-[color:var(--surface)]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl justify-center gap-1 overflow-x-auto px-4 py-2">
          {categories.map((cat) => (
            <button key={cat.key} type="button" onClick={() => setActiveCategory(cat.key)}
              className={`shrink-0 rounded-[var(--radius-sm)] px-4 py-2 text-[13px] font-medium transition ${activeCategory === cat.key ? "bg-[color:var(--foreground)] text-[color:var(--background)]" : "text-[color:var(--muted)] hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)]"}`}
            >{cat.label}</button>
          ))}
        </div>
      </div>

      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((tool) => (
              <a key={tool.href} href={tool.href} className="group relative flex items-center gap-3 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4 transition hover:border-[color:var(--line-strong)] hover:bg-[color:var(--surface-raised)]">
                {tool.isNew && <span className="absolute -top-1.5 -right-1.5 rounded-full bg-[color:var(--accent)] px-2 py-0.5 text-[9px] font-bold uppercase text-white shadow-sm">New</span>}
                <span className="shrink-0 text-[22px]">{toolIcons[tool.href.replace(/^\//, "")] || "📄"}</span>
                <span className="text-[13px] font-semibold">{tool.name}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[color:var(--line)]">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-5 py-16 text-center sm:py-20">
          <h2 className="text-[28px] font-semibold tracking-[-0.014em]">Ready to work smarter with PDFs?</h2>
          <p className="mt-3 text-[14px] leading-relaxed text-[color:var(--muted)]">All tools free. No account required.</p>
        </div>
      </section>
    </>
  );
}
