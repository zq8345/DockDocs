import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n";
import { BatchPdfToOfficeClient } from "@/components/BatchPdfToOfficeClient";

export const metadata: Metadata = {
  title: "Batch PDF to Word / Excel — Convert a Whole Folder",
  description:
    "Convert a whole folder of PDFs to editable Word or Excel files in one go — each converted on our server and packaged into a single ZIP.",
  keywords: ["batch pdf to word", "batch pdf to excel", "convert multiple pdfs to word", "bulk pdf to excel", "pdf to docx batch"],
  alternates: {
    canonical: "/batch-pdf-to-office/",
    languages: languageAlternates("batch-pdf-to-office"),
  },
};

export default function BatchPdfToOfficePage() {
  return <BatchPdfToOfficeClient />;
}
