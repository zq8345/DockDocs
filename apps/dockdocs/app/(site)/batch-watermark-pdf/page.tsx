import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n";
import { BatchStampClient } from "@/components/BatchStampClient";
import { webPageSchema } from "@/lib/page-schema";

export const metadata: Metadata = {
  title: "Batch Watermark PDFs — Stamp Many PDFs Online Free",
  description:
    "Add a watermark to a whole folder of PDFs at once, packaged into one ZIP. Entirely in your browser; your files never leave your device.",
  keywords: ["batch watermark pdf", "watermark multiple pdf", "stamp many pdfs", "bulk watermark pdf"],
  alternates: { canonical: "/batch-watermark-pdf/", languages: languageAlternates("batch-watermark-pdf") },
};

export default function BatchWatermarkPdfPage() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema("en", "batch-watermark-pdf", "Batch Watermark PDFs — Stamp Many PDFs Online Free")) }} /><BatchStampClient lockMode="watermark" /></>;
}
