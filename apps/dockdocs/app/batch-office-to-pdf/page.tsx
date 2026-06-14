import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n";
import { BatchOfficeToPdfClient } from "@/components/BatchOfficeToPdfClient";

export const metadata: Metadata = {
  title: "Batch Office to PDF — Convert Word, PowerPoint & Excel Folders",
  description:
    "Convert a whole folder of Word, PowerPoint, and Excel files to PDF in one go — each converted on our server and packaged into a single ZIP.",
  keywords: ["batch office to pdf", "batch word to pdf", "convert multiple word to pdf", "bulk excel to pdf", "powerpoint to pdf batch"],
  alternates: {
    canonical: "/batch-office-to-pdf/",
    languages: languageAlternates("batch-office-to-pdf"),
  },
};

export default function BatchOfficeToPdfPage() {
  return <BatchOfficeToPdfClient />;
}
