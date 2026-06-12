import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n";
import { BatchProtectClient } from "@/components/BatchProtectClient";

export const metadata: Metadata = {
  title: "Batch Encrypt PDF — Password-Protect Many PDFs Online Free | DockDocs",
  description:
    "Set one password and encrypt a whole folder of PDFs at once, packaged into one ZIP. Entirely in your browser; your files never leave your device.",
  keywords: ["batch encrypt pdf", "password protect multiple pdf", "bulk pdf password", "encrypt folder of pdf"],
  alternates: { canonical: "/batch-protect-pdf/", languages: languageAlternates("batch-protect-pdf") },
};

export default function BatchProtectPdfPage() {
  return <BatchProtectClient />;
}
