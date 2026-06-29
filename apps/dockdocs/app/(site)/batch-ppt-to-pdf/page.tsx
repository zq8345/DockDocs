import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n";
import { BatchOfficeToPdfClient } from "@/components/BatchOfficeToPdfClient";
import { webPageSchema } from "@/lib/page-schema";

export const metadata: Metadata = {
  title: "Batch PPT to PDF — Convert Many PowerPoints Free",
  description:
    "Convert a whole folder of PowerPoint presentations to PDF at once — each converted on our server and packaged into a single ZIP.",
  keywords: ["batch ppt to pdf", "convert multiple powerpoint to pdf", "bulk pptx to pdf", "powerpoint to pdf batch", "presentations to pdf"],
  alternates: {
    canonical: "/batch-ppt-to-pdf/",
    languages: languageAlternates("batch-ppt-to-pdf"),
  },
};

export default function BatchPptToPdfPage() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema("en", "batch-ppt-to-pdf", "Batch PPT to PDF — Convert Many PowerPoints Free")) }} /><BatchOfficeToPdfClient source="ppt" /></>;
}
