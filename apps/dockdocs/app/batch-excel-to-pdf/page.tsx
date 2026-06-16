import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n";
import { BatchOfficeToPdfClient } from "@/components/BatchOfficeToPdfClient";

export const metadata: Metadata = {
  title: "Batch Excel to PDF — Convert Many Spreadsheets Free",
  description:
    "Convert a whole folder of Excel spreadsheets to PDF at once — each converted on our server and packaged into a single ZIP.",
  keywords: ["batch excel to pdf", "convert multiple excel to pdf", "bulk xlsx to pdf", "excel to pdf batch", "spreadsheets to pdf"],
  alternates: {
    canonical: "/batch-excel-to-pdf/",
    languages: languageAlternates("batch-excel-to-pdf"),
  },
};

export default function BatchExcelToPdfPage() {
  return <BatchOfficeToPdfClient source="excel" />;
}
