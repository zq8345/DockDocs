import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n";
import { BatchStampClient } from "@/components/BatchStampClient";

export const metadata: Metadata = {
  title: "Batch Watermark PDFs — Stamp Many PDFs Online Free | DockDocs",
  description:
    "Add a watermark to a whole folder of PDFs at once, packaged into one ZIP. Entirely in your browser; your files never leave your device.",
  keywords: ["batch watermark pdf", "watermark multiple pdf", "stamp many pdfs", "bulk watermark pdf"],
  alternates: { canonical: "/batch-watermark-pdf/", languages: languageAlternates("batch-watermark-pdf") },
};

export default function BatchWatermarkPdfPage() {
  return <BatchStampClient lockMode="watermark" />;
}
