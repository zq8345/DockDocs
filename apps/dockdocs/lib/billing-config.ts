import type { SubscriptionPlan } from "@/lib/subscription-runtime";

export type PaidSubscriptionPlan = Exclude<SubscriptionPlan, "FREE">;

export type BillingPlanConfig = {
  plan: SubscriptionPlan;
  name: "Free" | "Plus" | "Pro";
  price: string;
  description: string;
  checkoutEnabled: boolean;
  priceEnvName?: string;
};

export const billingPlanConfigs: BillingPlanConfig[] = [
  {
    plan: "FREE",
    name: "Free",
    price: "$0",
    description: "Local workspace and limited document AI usage.",
    checkoutEnabled: false,
  },
  {
    plan: "PLUS",
    name: "Plus",
    price: "$5/month",
    description: "Higher monthly usage for individual document work.",
    checkoutEnabled: true,
    priceEnvName: "DOCKDOCS_STRIPE_PLUS_PRICE_ID",
  },
  {
    plan: "PRO",
    name: "Pro",
    price: "$20/month",
    description: "High-volume document workspace usage.",
    checkoutEnabled: true,
    priceEnvName: "DOCKDOCS_STRIPE_PRO_PRICE_ID",
  },
];

export const paidBillingPlans = billingPlanConfigs.filter(
  (plan): plan is BillingPlanConfig & { plan: PaidSubscriptionPlan } =>
    plan.checkoutEnabled && plan.plan !== "FREE",
);

export function isPaidSubscriptionPlan(
  plan: unknown,
): plan is PaidSubscriptionPlan {
  return plan === "PLUS" || plan === "PRO";
}
