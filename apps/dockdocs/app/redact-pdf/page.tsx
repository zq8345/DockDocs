import type { Metadata } from "next";
import { RedactPdfClient } from "@/components/RedactPdfClient";

export const metadata: Metadata = {
  title: "Redact PDF — Permanently Remove Sensitive Text Online Free | DockDocs",
  description:
    "Redact a PDF for real. Black out names, numbers, and confidential text — then download a copy where the hidden text is permanently destroyed (not just covered). Runs entirely in your browser; your file never leaves your device.",
  keywords: ["redact pdf", "remove text from pdf", "black out pdf", "redact sensitive text", "permanently delete pdf text"],
  alternates: { canonical: "/redact-pdf/" },
};

export default function RedactPdfPage() {
  return <RedactPdfClient />;
}
