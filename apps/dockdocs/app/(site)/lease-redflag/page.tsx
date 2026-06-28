import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n";
import { LeaseRedflagClient } from "@/components/LeaseRedflagClient";
import { ExtraToolJsonLd } from "@/lib/extra-tool-schema";

export const metadata: Metadata = {
  title: "Lease Red Flag Check — Spot Risky Clauses Before You Sign",
  description:
    "Upload a lease and get a plain-language list of risky, unfair, or missing clauses — flagged red/amber/green, quoted from your document, with what to ask your landlord before signing. Informational, not legal advice.",
  keywords: [
    "lease review",
    "rental agreement checker",
    "AI lease analysis",
    "red flag lease clauses",
    "tenant rights checker",
    "unfair lease clauses",
  ],
  alternates: {
    canonical: "/lease-redflag/",
    languages: languageAlternates("lease-redflag"),
  },
};

export default function LeaseRedflagPage() {
  return <><ExtraToolJsonLd slug="lease-redflag" locale="en" /><LeaseRedflagClient /></>;
}
