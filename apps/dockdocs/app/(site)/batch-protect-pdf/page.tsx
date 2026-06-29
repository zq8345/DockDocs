import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n";
import { BatchProtectClient } from "@/components/BatchProtectClient";
import { webPageSchema } from "@/lib/page-schema";

export const metadata: Metadata = {
  title: "Batch Encrypt PDF — Password-Protect Many PDFs Online Free",
  description:
    "Set one password and encrypt a whole folder of PDFs at once, packaged into one ZIP. Entirely in your browser; your files never leave your device.",
  keywords: ["batch encrypt pdf", "password protect multiple pdf", "bulk pdf password", "encrypt folder of pdf"],
  alternates: { canonical: "/batch-protect-pdf/", languages: languageAlternates("batch-protect-pdf") },
};

export default function BatchProtectPdfPage() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema("en", "batch-protect-pdf", "Batch Encrypt PDF — Password-Protect Many PDFs Online Free")) }} /><BatchProtectClient /></>;
}
