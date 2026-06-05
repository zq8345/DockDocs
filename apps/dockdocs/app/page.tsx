import type { Metadata } from "next";

const pageUrl = "https://dockdocs.app";

const pillars = [
  {
    icon: "📄",
    title: "Convert",
    description: "20+ tools for PDF, Word, Excel, PPT, images, and text. Convert between formats with CloudConvert precision.",
    href: "/word-to-pdf",
    cta: "Convert a file →",
  },
  {
    icon: "🤖",
    title: "AI Reasoning",
    description: "Chat with PDFs, extract summaries, identify risks, and generate action items. AI that reads documents with you.",
    href: "/chat-with-pdf",
    cta: "Chat with PDF →",
  },
  {
    icon: "📊",
    title: "Workspace",
    description: "Track usage, manage files, and scale from first upload to a full document workflow with Pro features.",
    href: "/dashboard",
    cta: "Open dashboard →",
  },
];

const toolGroups = [
  {
    label: "Convert",
    color: "#6366f1",
    items: ["Word to PDF", "Excel to PDF", "PPT to PDF", "PDF to Word", "PDF to Excel", "JPG to PDF", "PNG to PDF", "Text to PDF"],
    hrefs: ["/word-to-pdf", "/excel-to-pdf", "/ppt-to-pdf", "/pdf-to-word", "/pdf-to-excel", "/jpg-to-pdf", "/png-to-pdf", "/text-to-pdf"],
  },
  {
    label: "Edit & Organize",
    color: "#8b5cf6",
    items: ["Merge PDF", "Split PDF", "Compress PDF", "Delete Pages", "Rotate Pages", "Reorder Pages", "Add Pages"],
    hrefs: ["/merge-pdf", "/split-pdf", "/compress-pdf", "/delete-page", "/rotate-page", "/reorder-pages", "/add-page"],
  },
  {
    label: "AI & Export",
    color: "#06b6d4",
    items: ["Chat with PDF", "AI Summary", "OCR PDF", "PDF to JPG", "PDF to PNG", "PDF to Markdown", "Protect PDF"],
    hrefs: ["/chat-with-pdf", "/ai-summary", "/ocr-pdf", "/pdf-to-jpg", "/pdf-to-png", "/pdf-to-markdown", "/protect-pdf"],
  },
];

const faqs = [
  {
    question: "What is DockDocs?",
    answer:
      "DockDocs is an AI document platform for working with PDFs, scanned files, office documents, summaries, conversion, and document chat — all in one workspace.",
  },
  {
    question: "Is it free?",
    answer:
      "Yes. All AI and conversion tools are free. A Pro plan adds higher usage limits and premium workspace features.",
  },
  {
    question: "What file types are supported?",
    answer:
      "PDF, DOCX, XLSX, PPTX, JPG, PNG, TXT, and Markdown. Upload, convert, and process documents across formats.",
  },
  {
    question: "Does it work on mobile?",
    answer:
      "Yes. Every tool page, the workspace, and the dashboard are responsive across desktop, tablet, and mobile.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${pageUrl}#app`,
      name: "DockDocs",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: pageUrl,
      description:
        "DockDocs is an AI document platform for PDFs, office files, and document workflows.",
      brand: {
        "@type": "Brand",
        name: "DockDocs",
        slogan: "AI Document Platform",
      },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${pageUrl}#faq`,
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
  ],
};

export const metadata: Metadata = {
  title: "DockDocs — AI Document Workspace",
  description:
    "AI-powered document tools for PDFs, office files, and real document workflows. Convert, chat, summarize, OCR, and more.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "DockDocs — AI Document Workspace",
    description:
      "AI-powered document tools for PDFs, office files, and real document workflows.",
    url: pageUrl,
    siteName: "DockDocs",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DockDocs — AI Document Workspace",
    description:
      "AI-powered document tools for PDFs, office files, and real document workflows.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="border-b border-[color:var(--line)]">
        <div className="mx-auto flex max-w-5xl flex-col items-center px-5 py-20 text-center sm:py-28 lg:py-36">
          <div className="inline-flex rounded-full border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--accent-strong)]">
            AI Document Platform
          </div>
          <h1 className="mt-8 max-w-3xl text-[42px] font-semibold leading-[1.06] tracking-[-0.022em] sm:text-[56px] sm:leading-[1.04] sm:tracking-[-0.024em] lg:text-[64px]">
            Documents meet AI.
            <br />
            <span className="text-[color:var(--muted)]">Real work begins.</span>
          </h1>
          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-[color:var(--muted)] sm:text-[17px]">
            Upload PDFs, scans, reports, and office documents. Chat, summarize,
            convert, compress — all inside one quiet, focused workspace.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/chat-with-pdf"
              className="inline-flex min-h-[42px] items-center rounded-[var(--radius)] bg-[color:var(--accent)] px-5 text-[14px] font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.4)] transition hover:bg-[color:var(--accent-hover)]"
            >
              Start free
            </a>
            <a
              href="#tools"
              className="inline-flex min-h-[42px] items-center rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-5 text-[14px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]"
            >
              Browse tools →
            </a>
          </div>

          <div className="mt-12 grid w-full max-w-md grid-cols-3 gap-3 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-5">
            {[
              ["20+", "Tools"],
              ["100%", "Free"],
              ["AI", "Ready"],
            ].map(([value, label]) => (
              <div key={label} className="text-center">
                <p className="text-[22px] font-semibold tracking-tight">{value}</p>
                <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.12em] text-[color:var(--faint)]">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Three Pillars ─────────────────────────────────── */}
      <section className="border-b border-[color:var(--line)]">
        <div className="mx-auto max-w-5xl px-5 py-20 sm:py-24">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--faint)]">
            Three pillars
          </p>
          <h2 className="mt-4 text-center text-[32px] font-semibold tracking-[-0.018em] sm:text-[38px]">
            Everything your documents need.
          </h2>
          <div className="mt-14 grid gap-5 sm:grid-cols-3">
            {pillars.map((pillar) => (
              <a
                key={pillar.title}
                href={pillar.href}
                className="group rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] p-6 transition hover:border-[color:var(--line-strong)] hover:bg-[color:var(--surface-raised)]"
              >
                <span className="text-[28px]">{pillar.icon}</span>
                <h3 className="mt-5 text-[18px] font-semibold tracking-[-0.01em]">
                  {pillar.title}
                </h3>
                <p className="mt-3 text-[14px] leading-relaxed text-[color:var(--muted)]">
                  {pillar.description}
                </p>
                <span className="mt-5 inline-block text-[13px] font-medium text-[color:var(--accent-strong)] group-hover:underline">
                  {pillar.cta}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tool Card Wall ────────────────────────────────── */}
      <section id="tools" className="border-b border-[color:var(--line)]">
        <div className="mx-auto max-w-5xl px-5 py-20 sm:py-24">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--faint)]">
            All tools
          </p>
          <h2 className="mt-4 text-center text-[32px] font-semibold tracking-[-0.018em] sm:text-[38px]">
            20+ document tools, one workspace.
          </h2>

          <div className="mt-14 grid gap-10 sm:grid-cols-3">
            {toolGroups.map((group) => (
              <div key={group.label}>
                <div className="mb-4 flex items-center gap-2.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: group.color }}
                  />
                  <h3 className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[color:var(--faint)]">
                    {group.label}
                  </h3>
                </div>
                <ul className="space-y-1">
                  {group.items.map((item, i) => (
                    <li key={item}>
                      <a
                        href={group.hrefs[i]}
                        className="block rounded-[var(--radius-sm)] px-2.5 py-2 text-[13px] font-medium text-[color:var(--muted)] transition hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)]"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="border-b border-[color:var(--line)]">
        <div className="mx-auto flex max-w-2xl flex-col items-center px-5 py-20 text-center sm:py-28">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent-strong)]">
            Get started
          </p>
          <h2 className="mt-5 text-[32px] font-semibold tracking-[-0.018em] sm:text-[38px]">
            From first upload to a full document workflow.
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-[color:var(--muted)]">
            No account required. Upload a file and start working — chat, convert,
            compress, or summarize in seconds.
          </p>
          <a
            href="/chat-with-pdf"
            className="mt-9 inline-flex min-h-[44px] items-center rounded-[var(--radius)] bg-[color:var(--accent)] px-6 text-[15px] font-semibold text-white shadow-[0_1px_3px_rgba(0,0,0,0.4)] transition hover:bg-[color:var(--accent-hover)]"
          >
            Try DockDocs free
          </a>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────── */}
      <section id="faq" className="px-5 py-20 sm:py-24">
        <div className="mx-auto max-w-2xl">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--faint)]">
            FAQ
          </p>
          <h2 className="mt-4 text-center text-[28px] font-semibold tracking-[-0.016em]">
            Common questions
          </h2>
          <div className="mt-10 divide-y divide-[color:var(--line)] border-y border-[color:var(--line)]">
            {faqs.map((faq) => (
              <details key={faq.question} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[15px] font-medium transition hover:text-[color:var(--foreground)]">
                  {faq.question}
                  <span className="shrink-0 text-[color:var(--faint)] transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="pb-5 text-[14px] leading-relaxed text-[color:var(--muted)]">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
