import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n";
import { BatchSplitMergeClient } from "@/components/BatchSplitMergeClient";

export const metadata: Metadata = {
  title: "Batch Split PDF — Split Many PDFs at Once",
  description:
    "Split each PDF in a whole folder into smaller N-page files — all in your browser, packaged for download. Your files never leave your device.",
  keywords: ["batch split pdf", "split multiple pdf", "bulk split pdf", "split folder of pdf"],
  alternates: { canonical: "/batch-split-merge/", languages: languageAlternates("batch-split-merge") },
};

export default function BatchSplitMergePage() {
  return <BatchSplitMergeClient lockMode="split" />;
}
