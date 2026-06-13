import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n";
import { ExtractExcelClient } from "@/components/ExtractExcelClient";

export const metadata: Metadata = {
  title: "Batch Extract Data to Spreadsheet — Many Invoices to CSV Online",
  description:
    "Drop a whole folder of invoices, quotes, or contracts — AI pulls the key fields from every file into one table (one row each) and exports CSV. It only reports what's actually there.",
  keywords: ["batch extract pdf to excel", "invoices to spreadsheet", "bulk pdf data extraction", "folder of invoices to csv"],
  alternates: { canonical: "/batch-extract-sheet/", languages: languageAlternates("batch-extract-sheet") },
};

export default function BatchExtractSheetPage() {
  return <ExtractExcelClient />;
}
