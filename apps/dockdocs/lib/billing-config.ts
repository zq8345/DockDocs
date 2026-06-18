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
// the server-side upgrade-checkout guard so client and server agree on "upgrade".
const PLAN_RANK: Record<string, number> = { FREE: 0, PLUS: 1, PRO: 2 };
const INTERVAL_RANK: Record<BillingInterval, number> = { monthly: 0, annual: 1, lifetime: 2 };

// An UPGRADE means the target is ≥ on BOTH dimensions — plan tier (Plus < Pro)
// AND term length (monthly < annual < lifetime) — and strictly greater on at
// least one. If either dimension goes DOWN it is not an upgrade (e.g. tier-up but
// term-down, like Plus-annual → Pro-monthly), so it routes to the billing portal
// rather than the upgrade-checkout endpoint (which prorates the credit). Both the
// pricing CTA and the server-side upgrade-checkout guard use this, so they agree.
export function isPlanUpgrade(
  fromPlan: string,
  fromInterval: BillingInterval | undefined,
  toPlan: string,
  toInterval: BillingInterval,
): boolean {
  const fromPlanRank = PLAN_RANK[fromPlan] ?? 0;
  const toPlanRank = PLAN_RANK[toPlan] ?? 0;
  const fromIntervalRank = INTERVAL_RANK[fromInterval ?? "monthly"] ?? 0;
  const toIntervalRank = INTERVAL_RANK[toInterval] ?? 0;
  // Either dimension lower → not an upgrade.
  if (toPlanRank < fromPlanRank || toIntervalRank < fromIntervalRank) return false;
  // At least one dimension strictly higher.
  return toPlanRank > fromPlanRank || toIntervalRank > fromIntervalRank;
}

// Server-authoritative price per (plan, interval) in CENTS — the single source of
// truth for proration credit and the discount amount. NEVER trust the client.
// Founding pricing: Plus $5/$36/$99, Pro $20/$144/$399 (see the pricing spec).
const PLAN_PRICE_CENTS: Record<string, Record<BillingInterval, number>> = {
  PLUS: { monthly: 500, annual: 3600, lifetime: 9900 },
  PRO: { monthly: 2000, annual: 14400, lifetime: 39900 },
};

export function planPriceCents(plan: string, interval: BillingInterval): number {
  return PLAN_PRICE_CENTS[plan]?.[interval] ?? 0;
}
