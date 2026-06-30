import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n";
import { BatchSummaryClient } from "@/components/BatchSummaryClient";
import { webPageSchema } from "@/lib/page-schema";

export const metadata: Metadata = {
  title: "Batch Summary — AI Summaries of Multiple PDFs at Once",
  description:
    "Batch summarize multiple PDFs in one go — upload reports, papers, or contracts and get an AI executive summary + key points for each document. Free.",
  keywords: ["batch summary", "batch summarize pdf", "summarize multiple pdfs", "bulk pdf summary", "ai pdf summary", "summarize documents"],
  alternates: {
    canonical: "/batch-summary/",
    languages: languageAlternates("batch-summary"),
  },
};

export default function BatchSummaryPage() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema("en", "batch-summary", "Batch Summarize PDFs — Summarize Multiple Documents")) }} /><BatchSummaryClient /></>;
}
