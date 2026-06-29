import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n";
import { BatchRotateClient } from "@/components/BatchRotateClient";
import { webPageSchema } from "@/lib/page-schema";

export const metadata: Metadata = {
  title: "Batch Rotate PDF — Fix Many Sideways Scans Online Free",
  description:
    "Fix a whole folder of sideways or upside-down scans at once — rotate every page of every PDF and download one ZIP. Entirely in your browser; your files never leave your device.",
  keywords: ["batch rotate pdf", "rotate multiple pdf", "fix sideways scans", "bulk rotate pages"],
  alternates: { canonical: "/batch-rotate-pdf/", languages: languageAlternates("batch-rotate-pdf") },
};

export default function BatchRotatePdfPage() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema("en", "batch-rotate-pdf", "Batch Rotate PDF — Fix Many Sideways Scans Online Free")) }} /><BatchRotateClient /></>;
}
