import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n";
import { ContractReviewClient } from "@/components/ContractReviewClient";
import { ExtraToolJsonLd } from "@/lib/extra-tool-schema";

export const metadata: Metadata = {
  title: "Contract Review — Compare Versions & Analyze Changes",
  description:
    "Upload two versions of a contract to see every addition and deletion, then get plain-language AI explanations of what changed, why it matters, and what to negotiate. Runs in your browser — your files stay private.",
  keywords: ["contract comparison", "contract redline review", "compare contract versions", "AI contract change analysis", "contract diff tool"],
  alternates: {
    canonical: "/contract-review/",
    languages: languageAlternates("contract-review"),
  },
};

export default function ContractReviewPage() {
  return <><ExtraToolJsonLd slug="contract-review" locale="en" /><ContractReviewClient /></>;
}
