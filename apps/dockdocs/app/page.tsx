import type { Metadata } from "next";
import { FeatureShowcase } from "@/components/FeatureShowcase";
import { HeroBackground } from "@/components/HeroBackground";
import { HomeExtras } from "@/components/HomeExtras";

export const metadata: Metadata = {
  title: "DockDocs — AI Document Platform",
  description:
    "Chat with any PDF and get answers with sources you can check — not guesses. Multi-document comparison for contracts and quotes is coming. Plus 20+ free PDF tools to compress, convert, merge, split, and OCR.",
  alternates: {
    canonical: "/",
    languages: {
      en: "https://dockdocs.app/",
      zh: "https://dockdocs.app/zh/",
      "x-default": "https://dockdocs.app/",
    },
  },
  openGraph: {
    title: "DockDocs — AI Document Platform",
    description:
      "Chat with any PDF for grounded, source-cited answers. Multi-document comparison coming soon. Plus 20+ free PDF tools — no installs.",
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
    title: "OCR PDF",
    href: "/ocr-pdf",
    eyebrow: "AI",
    description: "Make scanned PDFs and images searchable and usable with AI-powered text extraction.",
  },
] as const;

const stats = [
  { value: "Grounded", label: "Answers cite the source" },
  { value: "Private", label: "Files stay on your device" },
  { value: "Fast", label: "Instant in-browser tools" },
] as const;

const siteUrl = "https://dockdocs.app";
const homeSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}#org`,
      name: "DockDocs",
      url: siteUrl,
      description: "Free online PDF tools — compress, merge, split, convert, OCR, AI chat, and more. Browser-based, no installs.",
      slogan: "AI document platform for real file workflows",
      foundingDate: "2024",
      sameAs: [
        "https://github.com/zq8345/dock-ai-ecosystem",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}#website`,
      name: "DockDocs",
      url: siteUrl,
      description: "Free online PDF tools with AI-powered document processing. Work with PDFs in your browser.",
      inLanguage: ["en", "zh"],
      publisher: { "@id": `${siteUrl}#org` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteUrl}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "WebPage",
      "@id": `${siteUrl}#webpage`,
      url: siteUrl,
      name: "DockDocs — Free Online PDF Tools",
      description:
        "Every tool you need for PDFs — merge, split, compress, convert, chat, summarize, OCR. All free, no installs.",
      isPartOf: { "@id": `${siteUrl}#website` },
      about: { "@id": `${siteUrl}#org` },
    },
    {
      "@type": "FAQPage",
      "@id": `${siteUrl}#faq`,
      name: "DockDocs Frequently Asked Questions",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is DockDocs?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "DockDocs is a free online PDF tools platform with over 20 tools including PDF compression, merging, splitting, conversion, OCR, AI chat, and document summarization. All tools work in your browser — no software installation required.",
          },
        },
        {
          "@type": "Question",
          name: "Is DockDocs free to use?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. DockDocs core PDF tools — compress, merge, split, convert, OCR, and more — are completely free. No account required for most tools. Plus plan ($5/month) adds AI features like Chat with PDF and AI Summarization.",
          },
        },
        {
          "@type": "Question",
          name: "Are my PDF files safe on DockDocs?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. DockDocs processes files locally in your browser where possible. For tools requiring server processing, files are encrypted in transit and automatically deleted after processing. DockDocs does not store, share, or sell your documents.",
          },
        },
        {
          "@type": "Question",
          name: "What PDF tools does DockDocs offer?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "DockDocs offers 20+ PDF tools: Compress PDF, Merge PDF, Split PDF, PDF to Word, Word to PDF, JPG to PDF, PDF to JPG, OCR PDF, Chat with PDF, AI Summary, Protect PDF, Unlock PDF, Sign PDF, Edit PDF, Translate PDF, and more.",
          },
        },
        {
          "@type": "Question",
          name: "How does DockDocs AI Chat with PDF work?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Upload a PDF and ask questions in natural language. DockDocs AI reads the document and provides grounded, document-specific answers — not generic responses. It works with contracts, reports, research papers, manuals, and any text-based PDF.",
          },
        },
        {
          "@type": "Question",
          name: "What makes DockDocs different from other PDF tools?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "DockDocs combines traditional PDF tools (compress, merge, convert) with AI-powered features (Chat with PDF, AI Summarization, OCR) in a single clean workspace. Files are processed locally where possible for privacy. The interface is designed to be fast and minimal — no clutter, no ads, no watermarks.",
          },
        },
      ],
    },
    {
      "@type": "ItemList",
      "@id": `${siteUrl}#tools`,
      name: "DockDocs PDF Tools",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Compress PDF", url: `${siteUrl}/compress-pdf/` },
        { "@type": "ListItem", position: 2, name: "Merge PDF", url: `${siteUrl}/merge-pdf/` },
        { "@type": "ListItem", position: 3, name: "Split PDF", url: `${siteUrl}/split-pdf/` },
        { "@type": "ListItem", position: 4, name: "PDF to Word", url: `${siteUrl}/pdf-to-word/` },
        { "@type": "ListItem", position: 5, name: "Word to PDF", url: `${siteUrl}/word-to-pdf/` },
        { "@type": "ListItem", position: 6, name: "OCR PDF", url: `${siteUrl}/ocr-pdf/` },
        { "@type": "ListItem", position: 7, name: "Chat with PDF", url: `${siteUrl}/chat-with-pdf/` },
        { "@type": "ListItem", position: 8, name: "AI Summary", url: `${siteUrl}/ai-summary/` },
        { "@type": "ListItem", position: 9, name: "JPG to PDF", url: `${siteUrl}/jpg-to-pdf/` },
        { "@type": "ListItem", position: 10, name: "PDF to JPG", url: `${siteUrl}/pdf-to-jpg/` },
        { "@type": "ListItem", position: 11, name: "Protect PDF", url: `${siteUrl}/protect-pdf/` },
        { "@type": "ListItem", position: 12, name: "Sign PDF", url: `${siteUrl}/sign-pdf/` },
        { "@type": "ListItem", position: 13, name: "Edit PDF", url: `${siteUrl}/edit-pdf/` },
        { "@type": "ListItem", position: 14, name: "Translate PDF", url: `${siteUrl}/translate-pdf/` },
        { "@type": "ListItem", position: 15, name: "Unlock PDF", url: `${siteUrl}/unlock-pdf/` },
      ],
    },
  ],
};

export default function Home() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema) }}
      />
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-[color:var(--line)]">
        <HeroBackground />

        <div className="relative mx-auto max-w-5xl px-5 pb-20 pt-20 sm:px-6 sm:pt-28 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-4 py-1.5 text-xs font-semibold tracking-wide text-[color:var(--muted)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent)]" aria-hidden="true" />
              AI Document Intelligence
            </div>

            <h1 className="text-[40px] font-semibold leading-[1.05] tracking-[-0.03em] text-[color:var(--foreground)] sm:text-[56px] lg:text-[68px]">
              Ask your documents. Compare them. Decide.
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-[16px] leading-8 text-[color:var(--muted)] sm:text-[18px]">
              DockDocs reads your PDFs and answers with sources you can check — not guesses.
              Chat with any document now; multi-document comparison for contracts and quotes is on the way.
              Plus 20+ free PDF tools to get files ready.
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

      {/* ── Feature showcase (Linear-style image+text) ── */}
      <FeatureShowcase locale="en" />

      {/* ── How it works + metrics (with scroll reveal) ── */}
      <HomeExtras locale="en" />

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
          <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-8 py-14 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-3xl">
              Put AI to work on your documents.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-[color:var(--muted)] sm:text-base">
              Free to use. No account required for most tools. Plus adds AI chat and summaries; Pro adds the multi-document comparison engine.
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
                className="inline-flex h-10 items-center rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-6 text-sm font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]"
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
