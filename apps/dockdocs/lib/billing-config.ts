import type { SubscriptionPlan } from "@/lib/subscription-runtime";

export type PaidSubscriptionPlan = Exclude<SubscriptionPlan, "FREE">;

// Billing interval. "monthly"/"annual" are recurring; "lifetime" is a one-time
// payment that never expires (the founding/limited SKU — see the pricing spec).
export type BillingInterval = "monthly" | "annual" | "lifetime";

export function isBillingInterval(value: unknown): value is BillingInterval {
  return value === "monthly" || value === "annual" || value === "lifetime";
}

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

// Ranks for upgrade comparisons (higher = more). Shared by the pricing CTA and
// the server-side change-plan guard so client and server agree on "upgrade".
const PLAN_RANK: Record<string, number> = { FREE: 0, PLUS: 1, PRO: 2 };
const INTERVAL_RANK: Record<BillingInterval, number> = { monthly: 0, annual: 1, lifetime: 2 };

// True when (toPlan, toInterval) is strictly higher than (fromPlan, fromInterval):
// a higher plan tier, or the same plan with a longer interval. Equal or lower is
// NOT an upgrade — those go through the billing portal, not the in-place
// change-plan endpoint (which charges proration immediately).
export function isPlanUpgrade(
  fromPlan: string,
  fromInterval: BillingInterval | undefined,
  toPlan: string,
  toInterval: BillingInterval,
): boolean {
  const fromPlanRank = PLAN_RANK[fromPlan] ?? 0;
  const toPlanRank = PLAN_RANK[toPlan] ?? 0;
  if (toPlanRank !== fromPlanRank) return toPlanRank > fromPlanRank;
  return (INTERVAL_RANK[toInterval] ?? 0) > (INTERVAL_RANK[fromInterval ?? "monthly"] ?? 0);
}
