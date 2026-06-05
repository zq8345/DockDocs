"use client";

import { useState } from "react";

const pageUrl = "https://dockdocs.app";

type ToolCard = {
  name: string; href: string; icon: string; description: string; category: string; isNew?: boolean;
};

const allTools: ToolCard[] = [
  { name: "Chat with PDF", href: "/chat-with-pdf", icon: "💬", description: "Ask questions grounded in your document.", category: "ai", isNew: true },
  { name: "AI Summary", href: "/ai-summary", icon: "📋", description: "Summarize long documents into key points.", category: "ai" },
  { name: "OCR PDF", href: "/ocr-pdf", icon: "🔍", description: "Extract text from scanned PDFs.", category: "ai" },
  { name: "Translate PDF", href: "/translate-pdf", icon: "🌐", description: "AI-powered PDF translation.", category: "ai", isNew: true },
  { name: "Word to PDF", href: "/word-to-pdf", icon: "📄→📕", description: "Convert DOCX to high-fidelity PDF.", category: "convert" },
  { name: "PDF to Word", href: "/pdf-to-word", icon: "📕→📄", description: "Extract content into editable Word docs.", category: "convert" },
  { name: "Excel to PDF", href: "/excel-to-pdf", icon: "📊→📕", description: "Convert spreadsheets to PDF.", category: "convert" },
  { name: "PDF to Excel", href: "/pdf-to-excel", icon: "📕→📊", description: "Pull data into Excel.", category: "convert" },
  { name: "PPT to PDF", href: "/ppt-to-pdf", icon: "🖥→📕", description: "Convert presentations to PDF.", category: "convert" },
  { name: "JPG to PDF", href: "/jpg-to-pdf", icon: "🖼→📕", description: "Turn images into PDF.", category: "convert" },
  { name: "PNG to PDF", href: "/png-to-pdf", icon: "🖼→📕", description: "PNG images to PDF.", category: "convert" },
  { name: "PDF to JPG", href: "/pdf-to-jpg", icon: "📕→🖼", description: "Export pages as JPG.", category: "convert" },
  { name: "PDF to PNG", href: "/pdf-to-png", icon: "📕→🖼", description: "Render pages as PNG.", category: "convert" },
  { name: "Text to PDF", href: "/text-to-pdf", icon: "📝→📕", description: "Plain text to formatted PDF.", category: "convert" },
  { name: "PDF to Markdown", href: "/pdf-to-markdown", icon: "📕→📝", description: "Extract text as Markdown.", category: "convert" },
  { name: "Merge PDF", href: "/merge-pdf", icon: "🔗", description: "Combine multiple PDFs into one.", category: "organize" },
  { name: "Split PDF", href: "/split-pdf", icon: "✂️", description: "Extract pages or split by range.", category: "organize" },
  { name: "Compress PDF", href: "/compress-pdf", icon: "📦", description: "Reduce file size for sharing.", category: "organize" },
  { name: "Delete Pages", href: "/delete-page", icon: "🗑", description: "Remove pages from a PDF.", category: "organize" },
  { name: "Rotate Pages", href: "/rotate-page", icon: "🔄", description: "Rotate pages 90°/180°/270°.", category: "organize" },
  { name: "Reorder Pages", href: "/reorder-pages", icon: "📑", description: "Rearrange pages.", category: "organize" },
  { name: "Add Pages", href: "/add-page", icon: "➕", description: "Insert blank pages.", category: "organize" },
  { name: "Protect PDF", href: "/protect-pdf", icon: "🔒", description: "Encrypt PDF with password.", category: "security" },
  { name: "Unlock PDF", href: "/unlock-pdf", icon: "🔓", description: "Remove password from PDF.", category: "security", isNew: true },
  { name: "Edit PDF", href: "/edit-pdf", icon: "✏️", description: "Add text, shapes, annotations.", category: "edit", isNew: true },
  { name: "Sign PDF", href: "/sign-pdf", icon: "✍️", description: "Add electronic signature.", category: "edit", isNew: true },
];

const categories = [
  { key: "all", label: "All" },
  { key: "ai", label: "AI" },
  { key: "convert", label: "Convert" },
  { key: "organize", label: "Organize" },
  { key: "edit", label: "Edit" },
  { key: "security", label: "Security" },
] as const;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [{
    "@type": "WebApplication", "@id": `${pageUrl}#app`,
    name: "DockDocs", applicationCategory: "BusinessApplication",
    operatingSystem: "Web", url: pageUrl,
    description: "AI document platform for PDFs and office files.",
    brand: { "@type": "Brand", name: "DockDocs", slogan: "AI Document Platform" },
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  }],
};

export function HomeClient() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const filtered = activeCategory === "all" ? allTools : allTools.filter((t) => t.category === activeCategory);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="border-b border-[color:var(--line)]">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-5 py-16 text-center sm:py-24">
          <h1 className="max-w-2xl text-[36px] font-semibold leading-[1.08] tracking-[-0.018em] sm:text-[48px]">
            Every tool you need for PDFs,<br /><span className="text-[color:var(--accent-strong)]">with AI.</span>
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-[color:var(--muted)]">
            Merge, split, compress, convert, chat, summarize — all 100% free.
          </p>
        </div>
      </section>
      <div className="sticky top-[52px] z-30 border-b border-[color:var(--line)] bg-[color:var(--surface)]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 lg:px-6">
          {categories.map((cat) => (
            <button key={cat.key} type="button" onClick={() => setActiveCategory(cat.key)}
              className={`shrink-0 rounded-[var(--radius-sm)] px-4 py-2 text-[13px] font-medium transition ${activeCategory === cat.key ? "bg-[color:var(--foreground)] text-[color:var(--background)]" : "text-[color:var(--muted)] hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)]"}`}
            >{cat.label}</button>
          ))}
        </div>
      </div>
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((tool) => (
              <a key={tool.href} href={tool.href} className="group relative flex flex-col gap-3 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5 transition hover:border-[color:var(--line-strong)] hover:bg-[color:var(--surface-raised)]">
                {tool.isNew && <span className="absolute right-3 top-3 rounded-full bg-[color:var(--accent)] px-2 py-0.5 text-[10px] font-bold uppercase text-white">New</span>}
                <span className="text-[24px]">{tool.icon}</span>
                <div><h3 className="text-[15px] font-semibold">{tool.name}</h3><p className="mt-1 text-[13px] leading-relaxed text-[color:var(--muted)]">{tool.description}</p></div>
              </a>
            ))}
          </div>
          {filtered.length === 0 && <p className="py-16 text-center text-[14px] text-[color:var(--faint)]">No tools in this category yet.</p>}
        </div>
      </section>
      <section className="border-t border-[color:var(--line)]">
        <div className="mx-auto flex max-w-2xl flex-col items-center px-5 py-16 text-center sm:py-24">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent-strong)]">Get started</p>
          <h2 className="mt-4 text-[28px] font-semibold tracking-[-0.014em]">Ready to work smarter with PDFs?</h2>
          <p className="mt-3 text-[14px] leading-relaxed text-[color:var(--muted)]">All tools free. No account required.</p>
          <a href="/chat-with-pdf" className="mt-6 inline-flex min-h-[42px] items-center rounded-[var(--radius)] bg-[color:var(--accent)] px-5 text-[14px] font-semibold text-white transition hover:bg-[color:var(--accent-hover)]">Start free</a>
        </div>
      </section>
    </>
  );
}
