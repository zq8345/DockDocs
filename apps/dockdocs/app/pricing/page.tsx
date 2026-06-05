import type { Metadata } from "next";
import { PricingPlans } from "@/components/PricingPlans";

export const metadata: Metadata = {
  title: "Pricing — DockDocs",
  description: "Choose the plan that fits your document volume. From free tools to unlimited workflows.",
  alternates: { canonical: "/pricing/" },
};

export default function PricingPage() {
  return <PricingPlans />;
}
