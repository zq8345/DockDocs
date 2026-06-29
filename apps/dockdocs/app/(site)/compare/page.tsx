import type { Metadata } from "next";
import { DocumentCompareClient } from "@/components/DocumentCompareClient";
import { ExtraToolJsonLd } from "@/lib/extra-tool-schema";
import { languageAlternates } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Compare PDF Documents Side by Side with AI",
  description:
    "Compare two or more PDF documents with AI to spot differences in clauses, terms, and content. Free, browser-based document comparison — nothing uploaded to any server.",
  alternates: { canonical: "/compare/", languages: languageAlternates("compare") },
};

export default function ComparePage() {
  return <><ExtraToolJsonLd slug="compare" locale="en" /><DocumentCompareClient /></>;
}
