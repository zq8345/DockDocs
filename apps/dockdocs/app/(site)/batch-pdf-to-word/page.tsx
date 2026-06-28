import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n";
import { BatchPdfToOfficeClient } from "@/components/BatchPdfToOfficeClient";

export const metadata: Metadata = {
  title: "Batch PDF to Word — Convert Many PDFs to Word Free",
  description:
    "Convert a whole folder of PDFs to editable Word (.docx) files at once — each converted on our server and packaged into a single ZIP.",
  keywords: ["batch pdf to word", "convert multiple pdfs to word", "bulk pdf to docx", "pdf to word batch", "folder pdf to word"],
  alternates: {
    canonical: "/batch-pdf-to-word/",
    languages: languageAlternates("batch-pdf-to-word"),
  },
};

export default function BatchPdfToWordPage() {
  return <BatchPdfToOfficeClient target="word" />;
}
