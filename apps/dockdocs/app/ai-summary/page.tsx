import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n";
import { AiSummaryClient } from "./AiSummaryClient";

export const metadata: Metadata = {
  title: "AI PDF Summary — Summarize Documents Free",
  description: "Summarize long PDFs and documents into key points and action items with AI — upload a file and get a concise summary in seconds. Free, in your browser.",
  keywords: ["ai pdf summary", "summarize pdf", "summarize documents", "pdf summarizer", "ai document summary"],
  alternates: { canonical: "/ai-summary/", languages: languageAlternates("ai-summary") },
  robots: { index: true, follow: true },
};

export default function AiSummaryPage() {
  return (
    <main className="bg-[color:var(--surface)]">
      <div className="mx-auto max-w-3xl px-5 pb-12 pt-12 sm:px-6 sm:pt-16">
        <div className="mb-6 flex items-center gap-2 text-xs text-[color:var(--muted)]">
          <a href="/" className="transition hover:text-[color:var(--foreground)]">DockDocs</a>
          <span>/</span>
          <span className="font-medium text-[color:var(--foreground)]">AI Summary</span>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-3xl">
          AI Summary
        </h1>
        <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
          Upload a document and get an AI-powered summary with key points, action items, and next steps.
        </p>

        <div className="mt-8">
          <AiSummaryClient locale="en" />
        </div>
      </div>
    </main>
  );
}
