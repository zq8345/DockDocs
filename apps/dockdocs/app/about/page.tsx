import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About DockDocs",
  description:
    "DockDocs is a privacy-first AI document platform with 20+ PDF tools, AI chat, OCR, and document workflows — built for teams, students, and professionals worldwide.",
  alternates: { canonical: "/about/" },
  robots: { index: true, follow: true },
};

const stats = [
  { value: "20+",  label: "PDF tools" },
  { value: "100%", label: "Browser-side for free tools" },
  { value: "EN/ZH", label: "Bilingual platform" },
  { value: "Free",  label: "Core tools, no sign-up" },
] as const;

const principles = [
  {
    number: "01",
    title: "Privacy first",
    body: "Browser-side tools process your files locally — nothing is uploaded to a server unless you choose a cloud conversion feature. Every cloud tool is clearly labeled so you always know where your file goes.",
  },
  {
    number: "02",
    title: "Built for global use",
    body: "DockDocs is designed for multilingual, multi-region document workflows. Full EN/ZH support is live, with more languages on the way. Every page, tool, and header switches language together.",
  },
  {
    number: "03",
    title: "Honest tools",
    body: "We don't hide limitations behind vague error messages. Each tool states exactly what it accepts, what it does, and what it produces. No surprise sign-up walls on free features.",
  },
] as const;

const timeline = [
  { year: "2021", event: "DockDocs founded. First PDF compression and OCR tools launched." },
  { year: "2022", event: "Expanded tool set. Added AI Summary and Chat with PDF beta." },
  { year: "2023", event: "Chat with PDF reaches general availability. Full EN/ZH bilingual support." },
  { year: "2024", event: "Launched 20+ browser-side tools: Merge, Split, Rotate, Reorder, Protect, and image conversion." },
  { year: "2025", event: "Cloud conversion suite: Word, PPT, Excel ↔ PDF via CloudConvert. Comprehensive audit and performance pass." },
] as const;

const toolHighlights = [
  { name: "Chat with PDF", href: "/chat-with-pdf", group: "AI" },
  { name: "Compress PDF",  href: "/compress-pdf",  group: "Optimize" },
  { name: "Merge PDF",     href: "/merge-pdf",     group: "Edit" },
  { name: "OCR PDF",       href: "/ocr-pdf",       group: "AI" },
  { name: "PDF to Word",   href: "/pdf-to-word",   group: "Convert" },
  { name: "Word to PDF",   href: "/word-to-pdf",   group: "Convert" },
] as const;

export default function AboutPage() {
  return (
    <main>
      {/* ── Hero ── */}
      <section className="border-b border-[color:var(--line)] bg-[color:var(--surface)]">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="grid items-start gap-12 lg:grid-cols-[1fr_1fr]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
                About DockDocs
              </p>
              <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.02em] text-[color:var(--foreground)] sm:text-4xl lg:text-5xl">
                A global document productivity platform.
              </h1>
              <p className="mt-5 text-base leading-8 text-[color:var(--muted)]">
                DockDocs is a privacy-first AI document platform built for teams, students,
                and professionals. We build the tools people need every day — compress, convert,
                merge, split, OCR, summarize, and review documents — in one fast, honest workspace.
              </p>
              <p className="mt-4 text-base leading-8 text-[color:var(--muted)]">
                Our approach is simple: browser-side processing where possible, clear labels when
                cloud is required, and no dark patterns around free features.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="/"
                  className="inline-flex h-10 items-center rounded-[var(--radius)] bg-[color:var(--accent)] px-5 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  All PDF Tools
                </a>
                <a
                  href="/blog"
                  className="inline-flex h-10 items-center rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-5 text-sm font-semibold text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--foreground)]"
                >
                  Read the Blog
                </a>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              {stats.map(({ value, label }) => (
                <div
                  key={label}
                  className="rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-6"
                >
                  <p className="text-3xl font-semibold tracking-tight text-[color:var(--foreground)]">
                    {value}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="border-b border-[color:var(--line)] bg-[color:var(--surface-subtle)]">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[280px_1fr]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
                Mission
              </p>
              <h2 className="mt-3 text-2xl font-semibold leading-snug tracking-tight text-[color:var(--foreground)]">
                Why DockDocs exists
              </h2>
            </div>
            <div className="space-y-5">
              <p className="text-base leading-8 text-[color:var(--muted)]">
                Document work shouldn't require installing heavy software, paying for features you
                use once, or surrendering your files to opaque cloud processes. DockDocs was built
                on a simple belief: the tools you need every day should be fast, private, and honest
                about what they do.
              </p>
              <p className="text-base leading-8 text-[color:var(--muted)]">
                We started with PDF compression and OCR and grew into a full document platform —
                because the real problem isn't any single task, it's the fragmented workflow across
                compress, convert, review, summarize, and sign. We're building the workspace that
                connects those steps without forcing you to pay for each one separately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Principles ── */}
      <section className="border-b border-[color:var(--line)] bg-[color:var(--surface)]">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6 lg:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
            How we build
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[color:var(--foreground)]">
            Principles
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {principles.map((p) => (
              <div
                key={p.title}
                className="rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-6"
              >
                <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-[color:var(--soft-accent)] text-[11px] font-bold text-[color:var(--accent-strong)]">
                  {p.number}
                </div>
                <p className="text-[15px] font-semibold text-[color:var(--foreground)]">{p.title}</p>
                <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="border-b border-[color:var(--line)] bg-[color:var(--surface-subtle)]">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6 lg:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
            History
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[color:var(--foreground)]">
            Building DockDocs
          </h2>
          <div className="mt-10">
            {timeline.map((item, i) => (
              <div key={item.year} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] text-[11px] font-bold text-[color:var(--accent)]">
                    ✓
                  </div>
                  {i < timeline.length - 1 && (
                    <div className="mt-1 w-px flex-1 bg-[color:var(--line)]" style={{ minHeight: "28px" }} />
                  )}
                </div>
                <div className="pb-8">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--accent)]">
                    {item.year}
                  </p>
                  <p className="mt-1 text-sm leading-7 text-[color:var(--muted)]">{item.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tool highlights ── */}
      <section className="border-b border-[color:var(--line)] bg-[color:var(--surface)]">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6 lg:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
            Tools
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[color:var(--foreground)]">
            Popular workflows
          </h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {toolHighlights.map((tool) => (
              <a
                key={tool.href}
                href={tool.href}
                className="group flex items-center justify-between rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-5 py-4 transition hover:border-[color:var(--line-strong)]"
              >
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--faint)]">
                    {tool.group}
                  </p>
                  <p className="mt-1 text-[14px] font-semibold text-[color:var(--foreground)]">{tool.name}</p>
                </div>
                <span className="text-[color:var(--faint)] transition group-hover:text-[color:var(--muted)]">
                  →
                </span>
              </a>
            ))}
          </div>
          <div className="mt-6 text-center">
            <a href="/" className="text-sm font-medium text-[color:var(--accent)] hover:underline">
              View all 20+ tools →
            </a>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-[color:var(--surface-subtle)]">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[color:var(--line)] bg-[color:var(--foreground)] px-8 py-12 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-[color:var(--background)]">
              Ready to start working with your documents?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[color:var(--background)]/60">
              Free to use. No account required for most tools. Upgrade to Plus for AI features.
            </p>
            <a
              href="/"
              className="mt-6 inline-flex h-10 items-center rounded-[var(--radius)] bg-[color:var(--accent)] px-6 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Explore all tools
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
