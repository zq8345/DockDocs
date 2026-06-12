import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n";
import { BatchStampClient } from "@/components/BatchStampClient";

export const metadata: Metadata = {
  title: "Batch Add Page Numbers to PDFs — Online Free | DockDocs",
  description:
    "Add page numbers to a whole folder of PDFs at once, packaged into one ZIP. Entirely in your browser; your files never leave your device.",
  keywords: ["batch page numbers pdf", "bulk add page numbers", "number multiple pdf", "add page numbers many pdf"],
  alternates: { canonical: "/batch-page-numbers/", languages: languageAlternates("batch-page-numbers") },
};

export default function BatchPageNumbersPage() {
  return <BatchStampClient lockMode="pagenum" />;
}
