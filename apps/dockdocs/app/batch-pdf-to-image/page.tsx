import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n";
import { BatchPdfToImageClient } from "@/components/BatchPdfToImageClient";

export const metadata: Metadata = {
  title: "Batch PDF to Image — Convert Many PDFs to JPG/PNG Online Free | DockDocs",
  description:
    "Convert a whole folder of PDFs to images at once — every page to JPG or PNG, packaged into one ZIP. Entirely in your browser; your files never leave your device.",
  keywords: ["batch pdf to image", "convert multiple pdf to jpg", "pdf to png bulk", "folder of pdf to images"],
  alternates: { canonical: "/batch-pdf-to-image/", languages: languageAlternates("batch-pdf-to-image") },
};

export default function BatchPdfToImagePage() {
  return <BatchPdfToImageClient />;
}
