import type { Metadata } from "next";
import { FeatureShowcase } from "@/components/FeatureShowcase";
import { HeroBackground } from "@/components/HeroBackground";
import { HeroFeatureGraph } from "@/components/HeroFeatureGraph";

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

const stats = [
  { value: "Grounded", label: "Answers cite the source" },
  { value: "Private", label: "Files stay on your device" },
  { value: "Free", label: "No account to start" },
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

        <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-12 sm:px-6 sm:pt-16 lg:px-8">
          {/* Keyword H1 for SEO — the visible hero is the interactive graph below */}
          <h1 className="sr-only">Everything you need to do with a PDF — free tools, batch automation, and AI that actually reads your documents.</h1>
          {/* Dynamic feature graph — the solution map */}
          <HeroFeatureGraph locale="en" />

          {/* Trust chips */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5">
            {stats.map(({ value, label }) => (
              <span key={label} className="inline-flex items-center gap-1.5 text-[13px] text-[color:var(--muted)]">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-[color:var(--accent)]"><path d="M3 8.5l3.2 3.2L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <span className="font-semibold text-[color:var(--foreground)]">{value}</span>
                <span className="text-[color:var(--faint)]">{label}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Core solutions + supporting metrics + quote ── */}
      <FeatureShowcase locale="en" />

      {/* ── Manifesto ── */}
      <section className="bg-[color:var(--surface)]">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-6 py-16 text-center sm:px-12 sm:py-20">
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--accent)] to-transparent opacity-60" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--accent)]">DockDocs</p>
            <h2 className="mx-auto mt-4 max-w-3xl text-[28px] font-semibold leading-[1.18] tracking-[-0.02em] text-[color:var(--foreground)] sm:text-[40px]">
              Every document, understood — read, checked, compared.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[15px] leading-7 text-[color:var(--muted)] sm:text-base">
              That&apos;s DockDocs: grounded AI plus 20+ local PDF tools, privacy-first and no sign-up. Understanding and verifiable evidence in one place — you just decide.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <a
                href="/chat-with-pdf"
                className="inline-flex h-11 items-center rounded-[var(--radius)] bg-[color:var(--accent)] px-7 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Chat with a PDF
              </a>
              <a
                href="/pricing"
                className="inline-flex h-11 items-center rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-7 text-sm font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]"
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
