import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n";
import { ResearchHubPage } from "@/components/ResearchHubPage";

export const metadata: Metadata = {
  title: "Research AI: summarize, search & compare papers — DockDocs",
  description:
    "AI tools for researchers: summarize papers, ask a PDF about its methods, compare studies, OCR scanned articles, and extract data tables — every answer traceable to the source. Verify before you cite.",
  keywords: [
    "research AI tools",
    "summarize research paper AI",
    "chat with research paper",
    "OCR scanned paper",
    "extract data from PDF research",
  ],
  alternates: {
    canonical: "/for/research/",
    languages: languageAlternates("for/research"),
  },
};

export default function ForResearchPage() {
  return <ResearchHubPage />;
}
