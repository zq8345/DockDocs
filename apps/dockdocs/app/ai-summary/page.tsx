import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Summary — DockDocs",
  description: "Summarize long documents into key points and actions with AI.",
  alternates: { canonical: "/ai-summary/" },
  robots: { index: true, follow: true },
};

export default function AiSummaryPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
      <h1 className="text-[28px] font-semibold tracking-[-0.014em]">AI Summary</h1>
      <p className="mt-2 text-[14px] leading-relaxed text-[color:var(--muted)]">
        Upload a document and get an AI-powered summary with key points and actions.
      </p>
      <div className="mt-8 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-6 text-center">
        <p className="text-[14px] text-[color:var(--muted)]">AI Summary workspace is ready. Upload a PDF or document to begin.</p>
      </div>
    </div>
  );
}
