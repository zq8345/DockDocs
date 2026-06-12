import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n";
import { BatchSummaryClient } from "@/components/BatchSummaryClient";

export const metadata: Metadata = {
  title: "Batch Summarize PDFs — Summarize Multiple Documents | DockDocs",
  description:
    "Upload several reports, papers, or contracts and get a concise AI summary of each — an executive summary plus key points, all in one pass.",
  keywords: ["batch summarize pdf", "summarize multiple pdfs", "bulk pdf summary", "ai pdf summary", "summarize documents"],
  alternates: {
    canonical: "/batch-summary/",
    languages: languageAlternates("batch-summary"),
  },
};

export default function BatchSummaryPage() {
  return <BatchSummaryClient />;
}
