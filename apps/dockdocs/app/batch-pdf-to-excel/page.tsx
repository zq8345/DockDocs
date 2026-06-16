import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n";
import { BatchPdfToOfficeClient } from "@/components/BatchPdfToOfficeClient";

export const metadata: Metadata = {
  title: "Batch PDF to Excel — Convert Many PDFs to Excel Free",
  description:
    "Convert a whole folder of PDFs to editable Excel (.xlsx) spreadsheets at once — each converted on our server and packaged into a single ZIP.",
  keywords: ["batch pdf to excel", "convert multiple pdfs to excel", "bulk pdf to xlsx", "pdf to excel batch", "extract pdf tables to excel"],
  alternates: {
    canonical: "/batch-pdf-to-excel/",
    languages: languageAlternates("batch-pdf-to-excel"),
  },
};

export default function BatchPdfToExcelPage() {
  return <BatchPdfToOfficeClient target="excel" />;
}
