import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n";
import { BatchSortClient } from "@/components/BatchSortClient";

export const metadata: Metadata = {
  title: "Batch Sort PDFs into Folders — AI File Organizer Online Free",
  description:
    "Drop a messy pile of PDFs — AI labels each (invoice, contract, resume…) and sorts them into folders inside one ZIP. The text is read in your browser; only that text is sent to the AI to sort — your file itself isn't uploaded.",
  keywords: ["batch sort pdf", "ai organize pdf", "classify pdf into folders", "auto file organizer"],
  alternates: { canonical: "/batch-sort/", languages: languageAlternates("batch-sort") },
};

export default function BatchSortPage() {
  return <BatchSortClient />;
}
