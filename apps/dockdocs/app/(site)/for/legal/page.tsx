import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n";
import { LegalHubPage } from "@/components/LegalHubPage";

export const metadata: Metadata = {
  title: "Legal AI: contract, lease & bid review",
  description:
    "AI tools for legal teams: contract risk, lease red flags, gov-bid compliance, and version compare — every finding traceable to your document. Informational, not legal advice.",
  keywords: [
    "legal AI tools",
    "contract review AI",
    "lease review tool",
    "RFP compliance matrix",
    "redline compare PDF",
  ],
  alternates: {
    canonical: "/for/legal/",
    languages: languageAlternates("for/legal"),
  },
};

export default function ForLegalPage() {
  return <LegalHubPage />;
}
