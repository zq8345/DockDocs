import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n";
import { FinanceHubPage } from "@/components/FinanceHubPage";
import { webPageSchema } from "@/lib/page-schema";

export const metadata: Metadata = {
  title: "Finance AI: invoice, statement & report tools",
  description:
    "AI tools for finance teams: extract invoices and statements to a spreadsheet, summarize financial reports, and compare quotes — every figure traceable to your document. Informational, not financial advice.",
  keywords: [
    "finance AI tools",
    "invoice data extraction",
    "extract invoice to excel",
    "summarize financial report AI",
    "compare quotes tool",
  ],
  alternates: {
    canonical: "/for/finance/",
    languages: languageAlternates("for/finance"),
  },
};

export default function ForFinancePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema("en", "for/finance", "Finance AI: invoice, statement & report tools")) }} />
      <FinanceHubPage />
    </>
  );
}
