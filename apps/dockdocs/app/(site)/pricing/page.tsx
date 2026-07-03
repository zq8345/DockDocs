import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n";
import { PricingPlans } from "@/components/PricingPlans";
import { pricingSchema } from "@/lib/page-schema";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Choose the plan that fits your document volume. Free PDF tools forever. Plus plan with AI features from $9/month.",
  alternates: { canonical: "/pricing/", languages: languageAlternates("pricing") },
};

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingSchema("en")) }}
      />
      <PricingPlans />
    </>
  );
}
