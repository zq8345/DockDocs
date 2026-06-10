"use client";

import { useState } from "react";

const toolIcons: Record<string, string> = {
  "chat-with-pdf": "💬", "ai-summary": "📋", "ocr-pdf": "🔍", "translate-pdf": "🌐",
  "word-to-pdf": "📄", "pdf-to-word": "📕", "excel-to-pdf": "📊", "pdf-to-excel": "📕",
  "ppt-to-pdf": "🖥", "jpg-to-pdf": "🖼", "png-to-pdf": "🖼", "pdf-to-jpg": "📕",
  "pdf-to-png": "📕", "pdf-to-markdown": "📕",
  "merge-pdf": "🔗", "split-pdf": "✂️", "compress-pdf": "📦",
  "delete-page": "🗑", "rotate-page": "🔄", "reorder-pages": "📑", "add-page": "➕",
  "protect-pdf": "🔒", "unlock-pdf": "🔓", "edit-pdf": "✏️", "sign-pdf": "✍️",
};

type ToolCard = { name: string; href: string; category: string; isNew?: boolean; desc: string };

const highlightTools: ToolCard[] = [
  { name: "Merge PDF", href: "/merge-pdf", category: "popular", desc: "Combine PDFs in the order you want." },
  { name: "Compress PDF", href: "/compress-pdf", category: "popular", desc: "Reduce file size while optimizing quality." },
  { name: "Chat with PDF", href: "/chat-with-pdf", category: "popular", desc: "Ask questions grounded in your document.", isNew: true },
  { name: "Word to PDF", href: "/word-to-pdf", category: "convert", desc: "DOCX to high-fidelity PDF." },
  { name: "PDF to Word", href: "/pdf-to-word", category: "convert", desc: "Extract content into editable Word." },
  { name: "Split PDF", href: "/split-pdf", category: "popular", desc: "Extract pages or split by range." },
];

const features = [
  { icon: "⚡", title: "Fast & free", desc: "Every tool is free. No account, no watermarks, no limits." },
  { icon: "🔒", title: "Privacy first", desc: "Files processed in your browser. Nothing stored on servers." },
  { icon: "🤖", title: "AI-powered", desc: "Chat, summarize, translate, and extract insights from documents." },
  { icon: "🌍", title: "Global", desc: "12 languages. Teams in 5 cities. 30M+ users worldwide." },
];

export function HomeClient() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-[color:var(--line)]">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 sm:py-28 lg:grid-cols-2 lg:py-36">
          <div>
            <h1 className="text-[40px] font-semibold leading-[1.04] tracking-[-0.022em] sm:text-[52px] sm:leading-[1.02]">
              PDF tools<br /><span className="text-[color:var(--accent-strong)]">built for real work.</span>
            </h1>
            <p className="mt-6 max-w-lg text-[16px] leading-relaxed text-[color:var(--muted)]">
              Merge, compress, convert, chat with AI — every tool you need for PDFs, all free.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="/merge-pdf" className="inline-flex min-h-[44px] items-center rounded-[var(--radius)] bg-[color:var(--accent)] px-5 text-[14px] font-semibold text-white shadow-[0_1px_3px_rgba(0,0,0,0.3)] transition hover:bg-[color:var(--accent-hover)]">Start free</a>
              <a href="#tools" className="inline-flex min-h-[44px] items-center rounded-[var(--radius)] border border-[color:var(--line)] px-5 text-[14px] font-medium transition hover:border-[color:var(--line-strong)]">Browse tools →</a>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-8">
              <div className="grid grid-cols-3 gap-3">
                {["📄→📕", "📄→📊", "🔗", "📦", "🤖", "🔒", "✂️", "🔄", "✏️"].map((icon, i) => (
                  <div key={i} className="flex aspect-square items-center justify-center rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] text-[28px]">{icon}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-[color:var(--line)]">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] p-6 transition hover:border-[color:var(--line-strong)]">
                <span className="text-[24px]">{f.icon}</span>
                <h3 className="mt-4 text-[16px] font-semibold">{f.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-[color:var(--muted)]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular tools */}
      <section id="tools" className="border-b border-[color:var(--line)]">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--faint)]">Most used</p>
          <h2 className="mt-3 text-center text-[28px] font-semibold tracking-[-0.014em]">Start with these.</h2>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {highlightTools.map((tool) => (
              <a key={tool.href} href={tool.href} className="group relative flex items-start gap-4 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5 transition hover:border-[color:var(--line-strong)] hover:bg-[color:var(--surface-raised)]">
                {tool.isNew && <span className="absolute -top-1.5 -right-1.5 rounded-full bg-[color:var(--accent)] px-2 py-0.5 text-[9px] font-bold uppercase text-white shadow-sm">New</span>}
                <span className="shrink-0 pt-0.5 text-[24px]">{toolIcons[tool.href.replace(/^\//, "")] || "📄"}</span>
                <div><h3 className="text-[15px] font-semibold">{tool.name}</h3><p className="mt-1 text-[13px] leading-relaxed text-[color:var(--muted)]">{tool.desc}</p></div>
              </a>
            ))}
          </div>
          <p className="mt-8 text-center">
            <a href="/" className="text-[13px] font-medium text-[color:var(--accent-strong)] hover:underline">View all 26 tools →</a>
          </p>
        </div>
      </section>
    </>
  );
}
