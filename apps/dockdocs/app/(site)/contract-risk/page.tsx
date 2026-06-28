import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n";
import { ContractRiskClient } from "@/components/ContractRiskClient";

export const metadata: Metadata = {
  title: "Contract Risk Check — Spot Risky Clauses Before You Sign",
  description:
    "Upload a contract and get a plain-language list of risky, one-sided, or missing clauses — flagged red/amber/green, quoted from your document, with what to ask. Informational, not legal advice.",
  keywords: ["contract risk review", "contract clause checker", "review contract before signing", "AI contract analysis", "red flag contract clauses"],
  alternates: {
    canonical: "/contract-risk/",
    languages: languageAlternates("contract-risk"),
  },
};

export default function ContractRiskPage() {
  return <ContractRiskClient />;
}
