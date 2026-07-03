import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n";
import { BatchTranslateClient } from "@/components/BatchTranslateClient";
import { ExtraToolJsonLd } from "@/lib/extra-tool-schema";

export const metadata: Metadata = {
  title: "Translate Documents — Batch PDF Translation",
  description:
    "Translate a whole folder of PDFs into one language in a single run — each document's text is translated and packaged into a ZIP of .txt files.",
  keywords: ["batch translate pdf", "translate multiple pdfs", "bulk pdf translation", "translate pdf folder"],
  alternates: {
    canonical: "/batch-translate/",
    languages: languageAlternates("batch-translate"),
  },
};

export default function BatchTranslatePage() {
  return <><ExtraToolJsonLd slug="batch-translate" locale="en" /><BatchTranslateClient /></>;
}
