import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n";
import { BatchRenameClient } from "@/components/BatchRenameClient";
import { webPageSchema } from "@/lib/page-schema";

export const metadata: Metadata = {
  title: "Batch Rename PDF — Rename Many Files by Pattern Online Free",
  description:
    "Rename a whole folder of PDFs at once — by a numbered pattern or find-and-replace — and download a ZIP with the new names. Entirely in your browser; your files never leave your device.",
  keywords: ["batch rename pdf", "rename multiple pdf", "bulk rename files", "sequential pdf rename"],
  alternates: { canonical: "/batch-rename-pdf/", languages: languageAlternates("batch-rename-pdf") },
};

export default function BatchRenamePdfPage() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema("en", "batch-rename-pdf", "Batch Rename PDF — Rename Many Files by Pattern Online Free")) }} /><BatchRenameClient /></>;
}
