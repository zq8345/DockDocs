import { getCurrentAccountUser } from "@/lib/account-runtime";

export type BillingTier = "FREE" | "PLUS" | "PRO";

export type SubscriptionStatus =
  | "free"
  | "active"
  | "trialing"
  | "past_due"
  | "canceled";

export type MeteredFeature =
  | "chat"
  | "summary"
  | "ocr"
  | "compress"
  | "analyzer"
  | "contractAnalyzer";

export type BillingSubscription = {
  tier: BillingTier;
  status: SubscriptionStatus;
  source: "local" | "stripe-checkout";
  updatedAt: string;
  stripeSessionId?: string;
};

export type FeatureUsageLimit = {
  feature: MeteredFeature;
  tier: BillingTier;
  period: "day" | "month";
  used: number;
  limit: number;
  remaining: number;
  allowed: boolean;
};

export type BillingSnapshot = {
  userId: string;
  signedIn: boolean;
  subscription: BillingSubscription;
  usage: FeatureUsageLimit[];
};

export type CheckoutRequest = {
  tier: Exclude<BillingTier, "FREE">;
  userId: string;
  email?: string;
};

const prefix = "dockdocs:billing";

const meteredFeatures: MeteredFeature[] = [
  "chat",
  "summary",
  "ocr",
  "compress",
  "analyzer",
  "contractAnalyzer",
];

const featureLimits: Record<
  BillingTier,
  Record<MeteredFeature, { limit: number; period: "day" | "month" }>
> = {
  FREE: {
    chat: { limit: 5, period: "day" },
    summary: { limit: 5, period: "day" },
    ocr: { limit: 10, period: "day" },
    compress: { limit: 20, period: "day" },
    analyzer: { limit: 5, period: "day" },
    contractAnalyzer: { limit: 5, period: "day" },
  },
  PLUS: {
    chat: { limit: 500, period: "month" },
    summary: { limit: 500, period: "month" },
    ocr: { limit: 500, period: "month" },
    compress: { limit: 1000, period: "month" },
    analyzer: { limit: 500, period: "month" },
    contractAnalyzer: { limit: 500, period: "month" },
  },
  PRO: {
    chat: { limit: 100000, period: "month" },
    summary: { limit: 100000, period: "month" },
    ocr: { limit: 100000, period: "month" },
    compress: { limit: 100000, period: "month" },
    analyzer: { limit: 100000, period: "month" },
    contractAnalyzer: { limit: 100000, period: "month" },
  },
};

export const billingPlans: Array<{
  tier: BillingTier;
  name: string;
  price: string;
  description: string;
  cta: string;
  highlights: string[];
}> = [
  {
    tier: "FREE",
    name: "Free",
    price: "$0",
    description: "Start with core PDF tools and limited AI document usage.",
    cta: "Current free plan",
    highlights: [
      "Basic PDF tools",
      "5 Chat with PDF calls per day",
      "5 AI Summary calls per day",
      "10 OCR calls per day",
    ],
  },
  {
    tier: "PLUS",
    name: "Plus",
    price: "$5/month",
    description: "Higher usage for individuals working with documents weekly.",
    cta: "Upgrade to Plus",
    highlights: [
      "500 Chat with PDF calls per month",
      "500 AI Summary calls per month",
      "500 OCR calls per month",
      "Workspace history",
    ],
  },
  {
    tier: "PRO",
    name: "Pro",
    price: "$20/month",
    description: "High-volume workspace placeholder for heavier document teams.",
    cta: "Upgrade to Pro",
    highlights: [
      "High usage limits",
      "Document workspace history",
      "Contract analyzer usage",
      "Future team and workflow previews",
    ],
  },
];

export function isMeteredFeature(feature: string): feature is MeteredFeature {
  return (meteredFeatures as readonly string[]).includes(feature);
}

export async function readBillingSnapshot(): Promise<BillingSnapshot> {
  const user = await getCurrentAccountUser().catch(() => null);
  const userId = user?.id ?? "anonymous";
  const subscription = readSubscription(userId);

  return {
    userId,
    signedIn: Boolean(user),
    subscription,
    usage: meteredFeatures.map((feature) =>
      readFeatureUsageLimit(userId, subscription.tier, feature),
    ),
  };
}

export async function canUseCommercialFeature(feature: MeteredFeature) {
  const snapshot = await readBillingSnapshot();
  return snapshot.usage.find((item) => item.feature === feature) ??
    readFeatureUsageLimit(snapshot.userId, snapshot.subscription.tier, feature);
}

export async function recordCommercialFeatureUsage(feature: MeteredFeature) {
  if (!canUseStorage()) {
    return;
  }

  const user = await getCurrentAccountUser().catch(() => null);
  const userId = user?.id ?? "anonymous";
  const subscription = readSubscription(userId);
  const limit = featureLimits[subscription.tier][feature];
  const key = usageKey(userId, feature, limit.period);
  const current = readJson<{ count: number }>(key, { count: 0 });
  writeJson(key, { count: current.count + 1 });
}

export async function markCheckoutSuccess({
  tier,
  sessionId,
}: {
  tier: BillingTier;
  sessionId: string;
}) {
  if (tier === "FREE") {
    return;
  }

  const user = await getCurrentAccountUser().catch(() => null);
  if (!user) {
    return;
  }

  writeJson(subscriptionKey(user.id), {
    tier,
    status: "active",
    source: "stripe-checkout",
    updatedAt: new Date().toISOString(),
    stripeSessionId: sessionId,
  } satisfies BillingSubscription);
}

export async function createCheckoutSession({
  tier,
  userId,
  email,
}: CheckoutRequest) {
  const response = await fetch("/api/create-checkout-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tier,
      userId,
      email,
      origin: window.location.origin,
    }),
  });
  const payload = (await response.json().catch(() => null)) as
    | {
        ok?: boolean;
        url?: string;
        message?: string;
      }
    | null;

  if (!response.ok || !payload?.ok || !payload.url) {
    throw new Error(
      payload?.message || "Billing is not configured yet.",
    );
  }

  return payload.url;
}

export function readPlanLimit(tier: BillingTier, feature: MeteredFeature) {
  return featureLimits[tier][feature];
}

function readSubscription(userId: string): BillingSubscription {
  const subscription = readJson<BillingSubscription | null>(
    subscriptionKey(userId),
    null,
  );

  if (subscription && isBillingTier(subscription.tier)) {
    return subscription;
  }

  return {
    tier: "FREE",
    status: "free",
    source: "local",
    updatedAt: new Date().toISOString(),
  };
}

function readFeatureUsageLimit(
  userId: string,
  tier: BillingTier,
  feature: MeteredFeature,
): FeatureUsageLimit {
  const config = featureLimits[tier][feature];
  const usage = readJson<{ count: number }>(
    usageKey(userId, feature, config.period),
    { count: 0 },
  );
  const remaining = Math.max(0, config.limit - usage.count);

  return {
    feature,
    tier,
    period: config.period,
    used: usage.count,
    limit: config.limit,
    remaining,
    allowed: remaining > 0,
  };
}

function usageKey(
  userId: string,
  feature: MeteredFeature,
  period: "day" | "month",
) {
  const periodKey =
    period === "day"
      ? new Date().toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 7);
  return `${prefix}:${userId}:usage:${feature}:${period}:${periodKey}`;
}

function subscriptionKey(userId: string) {
  return `${prefix}:${userId}:subscription`;
}

function isBillingTier(value: unknown): value is BillingTier {
  return value === "FREE" || value === "PLUS" || value === "PRO";
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) {
    return fallback;
  }

  try {
    return JSON.parse(window.localStorage.getItem(key) || "") as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}
