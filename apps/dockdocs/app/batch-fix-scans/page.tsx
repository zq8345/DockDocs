import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n";
import { BatchFixScansClient } from "@/components/BatchFixScansClient";

export const metadata: Metadata = {
  title: "Batch Fix Scans — Crop Margins or Delete Pages in Bulk",
  description:
    "Clean up a whole folder of scanned PDFs at once — trim the same margins off every page or delete the same pages from each file. All in your browser, one ZIP.",
  keywords: ["batch crop pdf", "bulk crop pdf margins", "batch delete pdf pages", "fix scanned pdf batch", "remove pages from multiple pdfs"],
  alternates: {
    canonical: "/batch-fix-scans/",
    languages: languageAlternates("batch-fix-scans"),
  },
};

export default function BatchFixScansPage() {
  return <BatchFixScansClient />;
}
