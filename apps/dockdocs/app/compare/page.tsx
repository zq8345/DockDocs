import type { Metadata } from "next";
import { DocumentCompareClient } from "@/components/DocumentCompareClient";

export const metadata: Metadata = {
  title: "Compare documents (beta) — DockDocs",
  description:
    "Upload multiple PDFs and extract their text in your browser — the input layer of the DockDocs multi-document comparison engine.",
  robots: { index: false, follow: false },
};

export default function ComparePage() {
  return <DocumentCompareClient />;
}
