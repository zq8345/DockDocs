import type { Metadata } from "next";
import { BatchSplitMergeClient } from "@/components/BatchSplitMergeClient";

export const metadata: Metadata = {
  title: "Batch Split & Merge PDF — Combine or Split Many PDFs Online Free | DockDocs",
  description:
    "Merge a whole folder of PDFs into one, or split each into N-page files — all in your browser, packaged for download. Your files never leave your device.",
  keywords: ["batch merge pdf", "merge folder of pdf", "batch split pdf", "split multiple pdf"],
  alternates: { canonical: "/batch-split-merge/" },
};

export default function BatchSplitMergePage() {
  return <BatchSplitMergeClient />;
}
