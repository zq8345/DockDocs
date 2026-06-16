import type { Metadata } from "next";
import { DocumentCompareClient } from "@/components/DocumentCompareClient";

export const metadata: Metadata = {
  title: "Compare PDF Documents Side by Side with AI | DockDocs",
  description:
    "Compare two or more PDF documents with AI to spot differences in clauses, terms, and content. Free, browser-based document comparison — nothing uploaded to any server.",
  alternates: { canonical: "/compare/" },
};

export default function ComparePage() {
  return <DocumentCompareClient />;
}
