import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n";
import { AiSummaryClient } from "./AiSummaryClient";
import { groundingFaq } from "@/components/GroundingNote";

// Source-grounding fact (shown as prose by GroundingNote in the client) folded into
// the FAQ schema so the citable "summaries stay grounded" statement is structured data.
const summaryGrounding = groundingFaq("summary", "en");

export const metadata: Metadata = {
  title: "AI PDF Summarizer — Summarize Documents Free Online | DockDocs",
  description: "Upload any PDF or document and get an AI-powered summary with key points, action items, and next steps in seconds. Free, no account needed.",
  keywords: [
    "ai pdf summarizer",
    "summarize pdf",
    "summarize pdf online",
    "summarize pdf free",
    "pdf summarizer",
    "ai document summarizer",
    "pdf summary generator",
    "ai pdf summary",
    "summarize documents",
    "ai pdf reader",
  ],
  alternates: { canonical: "/ai-summary/", languages: languageAlternates("ai-summary") },
  robots: { index: true, follow: true },
  openGraph: {
    title: "AI PDF Summarizer — Summarize Documents Free | DockDocs",
    description: "Get AI-powered summaries with key points and action items from any PDF. Free, no account needed.",
  },
};

const aiSummarySchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://dockdocs.app/ai-summary/#app",
      name: "DockDocs AI PDF Summarizer",
      url: "https://dockdocs.app/ai-summary/",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description:
        "Upload any PDF or document and get an AI-powered summary with key points, action items, and next steps — free, no account required.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://dockdocs.app/ai-summary/#breadcrumb",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "DockDocs", item: "https://dockdocs.app/" },
        { "@type": "ListItem", position: 2, name: "AI PDF Summarizer", item: "https://dockdocs.app/ai-summary/" },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": "https://dockdocs.app/ai-summary/#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "How do I summarize a PDF with AI?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Upload your PDF or document file to the AI summarizer, then click Summarize. The AI reads the full document and returns a concise summary with key points, action items, and important details — usually in under 30 seconds.",
          },
        },
        {
          "@type": "Question",
          name: "Is the AI PDF summarizer free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Summarizing PDFs with AI is free on DockDocs. No account is required to get a summary.",
          },
        },
        {
          "@type": "Question",
          name: "What types of documents can I summarize?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The AI summarizer works with PDFs and handles reports, research papers, contracts, meeting notes, and long-form articles. The AI extracts key points regardless of document length.",
          },
        },
        {
          "@type": "Question",
          name: "Is my PDF kept private when I use this?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Only the text needed to generate the summary is sent to our AI provider. DockDocs does not store your document after your session and does not use your files to train its own models. No account, no history.",
          },
        },
        {
          "@type": "Question",
          name: "What is the difference between AI Summary and AI Workspace?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "AI Summary gives you a one-shot structured summary — key points, action items, and takeaways. AI Workspace lets you have a full conversation with your document: ask follow-up questions, drill into sections, or extract specific data. Use Summary for a quick overview; use Workspace for deep research.",
          },
        },
        {
          "@type": "Question",
          name: summaryGrounding.question,
          acceptedAnswer: { "@type": "Answer", text: summaryGrounding.answer },
        },
      ],
    },
  ],
};

export default function AiSummaryPage() {
  return (
    <main className="bg-[color:var(--surface)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aiSummarySchema) }}
      />
      <div className="mx-auto max-w-5xl px-5 pb-12 pt-12 sm:px-6 sm:pt-16">
        <div className="mb-6 flex items-center gap-2 text-xs text-[color:var(--muted)]">
          <a href="/" className="transition hover:text-[color:var(--foreground)]">DockDocs</a>
          <span>/</span>
          <span className="font-medium text-[color:var(--foreground)]">AI PDF Summarizer</span>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-3xl">
          AI PDF Summarizer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
          Upload any PDF or document and get an AI-generated summary with key points, action items, and next steps in seconds. Free, no account needed.
        </p>

        <div className="mt-8">
          <AiSummaryClient locale="en" />
        </div>

        <section className="mt-16 space-y-6 border-t border-[color:var(--line)] pt-10">
          <h2 className="text-base font-medium text-[color:var(--foreground)]">Frequently Asked Questions</h2>
          <dl className="space-y-5">
            <div>
              <dt className="text-sm font-medium text-[color:var(--foreground)]">How do I summarize a PDF with AI?</dt>
              <dd className="mt-1 text-sm leading-6 text-[color:var(--muted)]">Upload your PDF or document file, then click Summarize. The AI reads the full document and returns a concise summary with key points, action items, and important details — usually in under 30 seconds.</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-[color:var(--foreground)]">Is the AI PDF summarizer free?</dt>
              <dd className="mt-1 text-sm leading-6 text-[color:var(--muted)]">Yes. Summarizing PDFs with AI is free on DockDocs. No account is required to get a summary.</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-[color:var(--foreground)]">What types of documents can I summarize?</dt>
              <dd className="mt-1 text-sm leading-6 text-[color:var(--muted)]">The AI summarizer works with PDFs and handles reports, research papers, contracts, meeting notes, and long-form articles. The AI extracts key points regardless of document length.</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-[color:var(--foreground)]">Is my PDF kept private?</dt>
              <dd className="mt-1 text-sm leading-6 text-[color:var(--muted)]">Only the text needed to generate the summary is sent to our AI provider. DockDocs does not store your document after your session and does not use your files to train its own models. No account, no history.</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-[color:var(--foreground)]">What is the difference between AI Summary and AI Workspace?</dt>
              <dd className="mt-1 text-sm leading-6 text-[color:var(--muted)]">AI Summary gives you a one-shot structured summary — key points, action items, and takeaways. <a href="/ai-workspace/" className="text-[color:var(--accent)] hover:underline">AI Workspace</a> lets you have a full conversation with your document: ask follow-up questions, drill into sections, or extract specific data. Use Summary for a quick overview; use Workspace for deep research.</dd>
            </div>
          </dl>
        </section>
      </div>
    </main>
  );
}
