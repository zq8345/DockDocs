import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n";
import { PricingPlans } from "@/components/PricingPlans";

export const metadata: Metadata = {
  title: "Pricing — DockDocs",
  description:
    "Choose the plan that fits your document volume. Free core tools, Pro for teams and heavy workflows. From $0 to $20/month.",
  alternates: { canonical: "/pricing/", languages: languageAlternates("pricing") },
};

const pricingSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": "https://dockdocs.app/pricing/#app",
      name: "DockDocs",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: "https://dockdocs.app",
      description:
        "Free online PDF tools with 20+ document processing features. AI-powered chat, OCR, compression, and conversion.",
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "USD",
        lowPrice: "0",
        highPrice: "20",
        offerCount: "3",
        offers: [
          {
            "@type": "Offer",
            name: "Free",
            price: "0",
            priceCurrency: "USD",
            description:
              "Core PDF tools — compress, merge, split, convert, OCR. Free forever.",
          },
          {
            "@type": "Offer",
            name: "Plus",
            price: "5",
            priceCurrency: "USD",
            description:
              "AI features — Chat with PDF, AI Summarization, higher limits. $5/month or $36/year.",
          },
          {
            "@type": "Offer",
            name: "Pro",
            price: "20",
            priceCurrency: "USD",
            description:
              "Teams and heavy workflows — unlimited everything, priority processing. $20/month or $144/year.",
          },
        ],
      },
    },
    {
      "@type": "WebPage",
      "@id": "https://dockdocs.app/pricing/#webpage",
      url: "https://dockdocs.app/pricing/",
      name: "DockDocs Pricing — Free & Premium Plans",
      description:
        "Free core tools. Plus ($5/mo) for AI features. Pro ($20/mo) for teams and heavy workflows.",
      isPartOf: {
        "@type": "WebSite",
        name: "DockDocs",
        url: "https://dockdocs.app",
      },
      mainEntity: { "@id": "https://dockdocs.app/pricing/#app" },
    },
  ],
};

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingSchema) }}
      />
      <PricingPlans />
    </>
  );
}
