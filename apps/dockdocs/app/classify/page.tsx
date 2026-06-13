import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n";
import { BatchSortClient } from "@/components/BatchSortClient";

export const metadata: Metadata = {
  title: "Auto-Classify & Tag PDFs with AI",
  description:
    "Upload a pile of PDFs and let AI sort them into categories and tags — invoices, resumes, contracts, papers — so you can organize a folder in seconds.",
  keywords: ["classify pdf", "auto tag pdf", "organize pdfs", "ai document classification", "sort pdf files"],
  alternates: {
    canonical: "/classify/",
    languages: languageAlternates("classify"),
  },
};

export default function ClassifyPage() {
  return <BatchSortClient />;
}
