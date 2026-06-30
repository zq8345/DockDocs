import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n";
import { BatchOfficeToPdfClient } from "@/components/BatchOfficeToPdfClient";
import { webPageSchema } from "@/lib/page-schema";

export const metadata: Metadata = {
  title: "Batch Word to PDF — Convert Many Word Files Free",
  description:
    "Batch convert Word files (.docx, .doc) to PDF — upload multiple files at once, each converted server-side and downloaded as a single ZIP. Free.",
  keywords: ["batch word to pdf", "batch convert word to pdf", "convert multiple word to pdf", "bulk docx to pdf", "word to pdf batch", "folder word to pdf"],
  alternates: {
    canonical: "/batch-word-to-pdf/",
    languages: languageAlternates("batch-word-to-pdf"),
  },
};

export default function BatchWordToPdfPage() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema("en", "batch-word-to-pdf", "Batch Word to PDF — Convert Many Word Files Free")) }} /><BatchOfficeToPdfClient source="word" /></>;
}
