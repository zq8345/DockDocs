import type { Metadata } from "next";
import { BatchExtractSheetClient } from "@/components/BatchExtractSheetClient";

export const metadata: Metadata = {
  title: "Batch Extract Data to Spreadsheet — Many Invoices to CSV Online | DockDocs",
  description:
    "Drop a whole folder of invoices, quotes, or contracts — AI pulls the key fields from every file into one table (one row each) and exports CSV. It only reports what's actually there.",
  keywords: ["batch extract pdf to excel", "invoices to spreadsheet", "bulk pdf data extraction", "folder of invoices to csv"],
  alternates: { canonical: "/batch-extract-sheet/" },
};

export default function BatchExtractSheetPage() {
  return <BatchExtractSheetClient />;
}
