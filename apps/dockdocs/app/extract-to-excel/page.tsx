import type { Metadata } from "next";
import { ExtractExcelClient } from "@/components/ExtractExcelClient";

export const metadata: Metadata = {
  title: "Extract PDF Data to a Spreadsheet — Invoices, Quotes, Contracts | DockDocs",
  description:
    "Upload invoices, quotes, or contracts and let AI pull the key fields into a spreadsheet you can download as CSV (opens in Excel & Google Sheets). It only reports what is actually in each document.",
  keywords: ["extract pdf data", "pdf to excel data", "invoice data extraction", "extract invoice to excel", "pdf data extraction"],
};

export default function ExtractToExcelPage() {
  return <ExtractExcelClient />;
}
