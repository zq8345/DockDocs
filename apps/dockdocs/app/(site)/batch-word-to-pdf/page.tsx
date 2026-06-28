import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n";
import { BatchOfficeToPdfClient } from "@/components/BatchOfficeToPdfClient";

export const metadata: Metadata = {
  title: "Batch Word to PDF — Convert Many Word Files Free",
  description:
    "Convert a whole folder of Word documents to PDF at once — each converted on our server and packaged into a single ZIP.",
  keywords: ["batch word to pdf", "convert multiple word to pdf", "bulk docx to pdf", "word to pdf batch", "folder word to pdf"],
  alternates: {
    canonical: "/batch-word-to-pdf/",
    languages: languageAlternates("batch-word-to-pdf"),
  },
};

export default function BatchWordToPdfPage() {
  return <BatchOfficeToPdfClient source="word" />;
}
