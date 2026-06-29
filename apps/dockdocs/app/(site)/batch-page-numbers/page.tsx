import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n";
import { BatchStampClient } from "@/components/BatchStampClient";
import { webPageSchema } from "@/lib/page-schema";

export const metadata: Metadata = {
  title: "Batch Add Page Numbers to PDFs — Online Free",
  description:
    "Add page numbers to a whole folder of PDFs at once, packaged into one ZIP. Entirely in your browser; your files never leave your device.",
  keywords: ["batch page numbers pdf", "bulk add page numbers", "number multiple pdf", "add page numbers many pdf"],
  alternates: { canonical: "/batch-page-numbers/", languages: languageAlternates("batch-page-numbers") },
};

export default function BatchPageNumbersPage() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema("en", "batch-page-numbers", "Batch Add Page Numbers to PDFs — Online Free")) }} /><BatchStampClient lockMode="pagenum" /></>;
}
