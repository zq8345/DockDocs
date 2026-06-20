import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n";
import { BatchCompressClient } from "@/components/BatchCompressClient";
import { ExtraToolJsonLd } from "@/lib/extra-tool-schema";

export const metadata: Metadata = {
  title: "Batch Compress PDFs — Shrink a Whole Folder",
  description:
    "Drop a whole folder of PDFs and compress them all in one go — each is shrunk in your browser and packaged into a single ZIP. Nothing is uploaded.",
  keywords: ["batch compress pdf", "compress multiple pdfs", "compress pdf folder", "bulk compress pdf", "reduce pdf size"],
  alternates: {
    canonical: "/batch-compress/",
    languages: languageAlternates("batch-compress"),
  },
};

export default function BatchCompressPage() {
  return <><ExtraToolJsonLd slug="batch-compress" locale="en" /><BatchCompressClient /></>;
}
