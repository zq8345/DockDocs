import type { Metadata } from "next";
import { BatchSortClient } from "@/components/BatchSortClient";

export const metadata: Metadata = {
  title: "Batch Sort PDFs into Folders — AI File Organizer Online Free | DockDocs",
  description:
    "Drop a messy pile of PDFs — AI labels each (invoice, contract, resume…) and sorts them into folders inside one ZIP. Entirely in your browser; your files never leave your device.",
  keywords: ["batch sort pdf", "ai organize pdf", "classify pdf into folders", "auto file organizer"],
  alternates: { canonical: "/batch-sort/" },
};

export default function BatchSortPage() {
  return <BatchSortClient />;
}
