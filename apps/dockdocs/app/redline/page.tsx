import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n";
import { RedlineClient } from "@/components/RedlineClient";
import { ExtraToolJsonLd } from "@/lib/extra-tool-schema";

export const metadata: Metadata = {
  title: "PDF Redline — Compare Two PDF Versions Free",
  description:
    "Compare two PDF versions to see exactly what changed — added text is highlighted and removed text is struck through. Free, and entirely in your browser.",
  keywords: ["pdf redline", "compare pdf versions", "pdf diff", "compare two pdfs", "pdf version compare"],
  alternates: {
    canonical: "/redline/",
    languages: languageAlternates("redline"),
  },
};

export default function RedlinePage() {
  return <><ExtraToolJsonLd slug="redline" locale="en" /><RedlineClient /></>;
}
