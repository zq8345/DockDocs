import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DockDocs — AI Document Platform",
  description:
    "20+ PDF tools for compress, convert, merge, split, OCR, AI chat, and more. Process documents in your browser, privately and fast.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "DockDocs — AI Document Platform",
    description:
      "PDF tools, AI chat, OCR, compression, and conversion — all in one place. No installs. Files processed locally where possible.",
    url: "https://dockdocs.app",
    siteName: "DockDocs",
    type: "website",
  },
  robots: { index: true, follow: true },
};

const tools = [
  { slug: "/compress-pdf",    name: "Compress PDF",      group: "Optimize",  desc: "Reduce PDF size for email and sharing." },
  { slug: "/merge-pdf",       name: "Merge PDF",         group: "Edit",      desc: "Combine multiple PDFs into one file." },
  { slug: "/split-pdf",       name: "Split PDF",         group: "Edit",      desc: "Extract pages or ranges from a PDF." },
  { slug: "/pdf-to-word",     name: "PDF to Word",       group: "Convert",   desc: "Convert PDF to editable Word output." },
  { slug: "/word-to-pdf",     name: "Word to PDF",       group: "Convert",   desc: "Convert DOCX to PDF with layout preserved." },
  { slug: "/ocr-pdf",         name: "OCR PDF",           group: "AI",        desc: "Make scanned PDF text searchable." },
  { slug: "/jpg-to-pdf",      name: "JPG to PDF",        group: "Convert",   desc: "Turn images into a clean PDF document." },
  { slug: "/pdf-to-jpg",      name: "PDF to JPG",        group: "Convert",   desc: "Export PDF pages as high-quality images." },
  { slug: "/png-to-pdf",      name: "PNG to PDF",        group: "Convert",   desc: "Convert PNG screenshots to PDF." },
  { slug: "/pdf-to-png",      name: "PDF to PNG",        group: "Convert",   desc: "Export PDF pages as lossless PNG." },
  { slug: "/text-to-pdf",     name: "Text to PDF",       group: "Convert",   desc: "Turn plain text files into PDF." },
  { slug: "/pdf-to-markdown", name: "PDF to Markdown",   group: "Convert",   desc: "Extract PDF text as structured Markdown." },
  { slug: "/excel-to-pdf",    name: "Excel to PDF",      group: "Convert",   desc: "Convert spreadsheets to PDF." },
  { slug: "/ppt-to-pdf",      name: "PPT to PDF",        group: "Convert",   desc: "Convert presentations to PDF." },
  { slug: "/pdf-to-excel",    name: "PDF to Excel",      group: "Convert",   desc: "Extract PDF tables to Excel." },
  { slug: "/delete-page",     name: "Delete Page",       group: "Edit",      desc: "Remove unwanted pages from a PDF." },
  { slug: "/rotate-page",     name: "Rotate Page",       group: "Edit",      desc: "Fix PDF page orientation instantly." },
  { slug: "/reorder-pages",   name: "Reorder Pages",     group: "Edit",      desc: "Rearrange PDF pages into a new order." },
  { slug: "/add-page",        name: "Add Page",          group: "Edit",      desc: "Insert a blank page at any position." },
  { slug: "/protect-pdf",     name: "Protect PDF",       group: "Security",  desc: "Add password protection to a PDF." },
] as const;

const features = [
  {
    title: "Chat with PDF",
    href: "/chat-with-pdf",
    eyebrow: "AI",
    description: "Ask questions about any PDF. Get grounded, document-specific answers from the AI.",
  },
  {
    title: "AI Summary",
    href: "/ai-summary",
    eyebrow: "AI",
    description: "Turn long documents into concise summaries, key points, and action items.",
  },
  {
    title: "OCR Workspace",
    href: "/ocr",
    eyebrow: "AI",
    description: "Make scanned PDFs and images searchable and usable with AI-powered text extraction.",
  },
] as const;

const stats = [
  { value: "20+", label: "PDF Tools" },
  { value: "Browser", label: "Local processing" },
  { value: "Free", label: "Core tools" },
] as const;

export default function Home() {
  return (
    <main>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-[color:var(--line)]">
        {/* Subtle grid */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        {/* Radial accent */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[-120px] h-[500px] w-[800px] -translate-x-1/2 rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(ellipse, var(--accent) 0%, transparent 70%)" }}
        />

        <div className="relative mx-auto max-w-5xl px-5 pb-20 pt-20 sm:px-6 sm:pt-28 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-4 py-1.5 text-xs font-semibold tracking-wide text-[color:var(--muted)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent)]" aria-hidden="true" />
              AI Document Platform
            </div>

            <h1 className="text-[40px] font-semibold leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-5xl lg:text-[62px]">
              The document workspace<br className="hidden sm:block" /> built for real work.
            </h1>

            <p className="mt-5 text-base leading-7 text-[color:var(--muted)] sm:text-lg sm:leading-8">
              PDF tools, AI chat, OCR, conversion and compression — all in one place.
              No installs. Files processed locally where possible.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href="/chat-with-pdf"
                className="inline-flex h-10 items-center justify-center rounded-[var(--radius)] bg-[color:var(--accent)] px-5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Chat with a PDF
              </a>
              <a
                href="#tools"
                className="inline-flex h-10 items-center justify-center rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-5 text-sm font-semibold text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--foreground)]"
              >
                Browse tools ↓
              </a>
            </div>
          </div>

          {/* Stats strip */}
          <div className="mx-auto mt-14 grid max-w-lg grid-cols-3 gap-px overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--line)]">
            {stats.map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center bg-[color:var(--surface)] px-4 py-5 text-center">
                <span className="text-xl font-semibold text-[color:var(--foreground)]">{value}</span>
                <span className="mt-1 text-[11px] font-medium uppercase tracking-[0.1em] text-[color:var(--muted)]">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Features strip ── */}
      <section className="border-b border-[color:var(--line)] bg-[color:var(--surface-subtle)]">
        <div className="mx-auto max-w-5xl px-5 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-3 sm:grid-cols-3">
            {features.map((f) => (
              <a
                key={f.href}
                href={f.href}
                className="group flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5 transition hover:border-[color:var(--line-strong)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
              >
                <span className="inline-flex w-fit rounded-full border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--muted)]">
                  {f.eyebrow}
                </span>
                <div>
                  <p className="text-[15px] font-semibold text-[color:var(--foreground)]">{f.title}</p>
                  <p className="mt-1.5 text-sm leading-6 text-[color:var(--muted)]">{f.description}</p>
                </div>
                <span className="mt-auto text-xs font-medium text-[color:var(--accent)] opacity-0 transition group-hover:opacity-100">
                  Open →
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tool grid ── */}
      <section id="tools" className="border-b border-[color:var(--line)] bg-[color:var(--surface)]">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
                Tools
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-3xl">
                Everything you need for PDF work
              </h2>
            </div>
            <a
              href="/sitemap"
              className="hidden text-sm font-medium text-[color:var(--muted)] transition hover:text-[color:var(--foreground)] sm:block"
            >
              View all →
            </a>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tools.map((tool) => (
              <a
                key={tool.slug}
                href={tool.slug}
                className="group flex flex-col gap-2.5 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-4 transition hover:border-[color:var(--line-strong)] hover:bg-[color:var(--surface)]"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-[var(--radius-sm)] bg-[color:var(--soft-accent)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--accent-strong)]">
                    {tool.group}
                  </span>
                  <span className="text-[color:var(--faint)] transition group-hover:text-[color:var(--muted)]">
                    →
                  </span>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[color:var(--foreground)]">{tool.name}</p>
                  <p className="mt-0.5 text-[12px] leading-5 text-[color:var(--muted)]">{tool.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-[color:var(--surface-subtle)]">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[color:var(--line)] bg-[color:var(--foreground)] px-8 py-14 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-[color:var(--background)] sm:text-3xl">
              Start working with your documents.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-[color:var(--background)]/60 sm:text-base">
              Free to use. No account required for most tools. Switch to Plus for AI features and higher limits.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href="/chat-with-pdf"
                className="inline-flex h-10 items-center rounded-[var(--radius)] bg-[color:var(--accent)] px-6 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Chat with a PDF
              </a>
              <a
                href="/pricing"
                className="inline-flex h-10 items-center rounded-[var(--radius)] border border-[color:var(--background)]/20 px-6 text-sm font-semibold text-[color:var(--background)] transition hover:border-[color:var(--background)]/40"
              >
                View pricing
              </a>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
