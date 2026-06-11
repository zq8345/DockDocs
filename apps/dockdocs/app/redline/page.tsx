import type { Metadata } from "next";
import { RedlineClient } from "@/components/RedlineClient";

export const metadata: Metadata = {
  title: "PDF Redline — Compare Two PDF Versions Free | DockDocs",
  description:
    "Compare two PDF versions to see exactly what changed — added text is highlighted and removed text is struck through. Free, and entirely in your browser.",
  keywords: ["pdf redline", "compare pdf versions", "pdf diff", "compare two pdfs", "pdf version compare"],
};

export default function RedlinePage() {
  return <RedlineClient />;
}
