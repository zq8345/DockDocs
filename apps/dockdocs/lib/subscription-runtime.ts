import { getCurrentAccountUser } from "@/lib/account-runtime";

export type SubscriptionPlan = "FREE" | "PLUS" | "PRO";

export type SubscriptionStatus =
  | "free"
  | "active"
  | "trialing"
  | "past_due"
  | "canceled";

export type SubscriptionSource = "local" | "stripe-checkout" | "manual";

export type SubscriptionRecord = {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  source: SubscriptionSource;
  updatedAt: string;
  userId?: string;
  stripeSessionId?: string;
};

export type SubscriptionSnapshot = {
  userId: string;
  signedIn: boolean;
  record: SubscriptionRecord;
  displayName: "Free" | "Plus" | "Pro";
  statusLabel: string;
  isPaidPlaceholder: boolean;
};

const prefix = "dockdocs:subscription";
const legacyBillingPrefix = "dockdocs:billing";
const anonymousUserId = "anonymous";

export async function getSubscriptionSnapshot(): Promise<SubscriptionSnapshot> {
  const user = await getCurrentAccountUser();
  const userId = user?.id ?? anonymousUserId;
  const record = readSubscriptionRecord(userId);

  return {
    userId,
    signedIn: Boolean(user),
    record,
    displayName: planDisplayName(record.plan),
    statusLabel: statusDisplayName(record.status),
    isPaidPlaceholder: record.plan !== "FREE",
  };
}

export function readSubscriptionRecord(userId: string): SubscriptionRecord {
  const normalizedUserId = userId || anonymousUserId;
  const record =
    normalizeSubscriptionRecord(
      readJson<unknown>(subscriptionKey(normalizedUserId), null),
      normalizedUserId,
    ) ??
    normalizeSubscriptionRecord(
      readJson<unknown>(legacyBillingSubscriptionKey(normalizedUserId), null),
      normalizedUserId,
    );

  return record ?? createFreeSubscription(normalizedUserId);
}

export function writeSubscriptionRecord(
  userId: string,
  record: SubscriptionRecord,
) {
  if (!canUseStorage()) {
    return;
  }

  const normalizedUserId = userId || anonymousUserId;
  writeJson(subscriptionKey(normalizedUserId), {
    ...record,
    userId: normalizedUserId,
    updatedAt: record.updatedAt || new Date().toISOString(),
  });
}

export function createFreeSubscription(
  userId = anonymousUserId,
): SubscriptionRecord {
  return {
    plan: "FREE",
    status: "free",
    source: "local",
    updatedAt: new Date().toISOString(),
    userId,
  };
}

export function planDisplayName(plan: SubscriptionPlan) {
  if (plan === "PLUS") {
    return "Plus";
  }

  if (plan === "PRO") {
    return "Pro";
  }

  return "Free";
}

export function statusDisplayName(status: SubscriptionStatus) {
  const labels: Record<SubscriptionStatus, string> = {
    free: "Free placeholder",
    active: "Active placeholder",
    trialing: "Trial placeholder",
    past_due: "Past due placeholder",
    canceled: "Canceled placeholder",
  };

  return labels[status];
}

function normalizeSubscriptionRecord(
  value: unknown,
  userId: string,
): SubscriptionRecord | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const input = value as {
    plan?: unknown;
    tier?: unknown;
    status?: unknown;
    source?: unknown;
    updatedAt?: unknown;
    stripeSessionId?: unknown;
  };
  const plan = normalizePlan(input.plan ?? input.tier);
  const status = normalizeStatus(input.status);

  if (!plan || !status) {
    return null;
  }

  return {
    plan,
    status,
    source: normalizeSource(input.source),
    updatedAt:
      typeof input.updatedAt === "string"
        ? input.updatedAt
        : new Date().toISOString(),
    userId,
    stripeSessionId:
      typeof input.stripeSessionId === "string" ? input.stripeSessionId : undefined,
  };
}

function normalizePlan(value: unknown): SubscriptionPlan | null {
  return value === "FREE" || value === "PLUS" || value === "PRO" ? value : null;
}

function normalizeStatus(value: unknown): SubscriptionStatus | null {
  return value === "free" ||
    value === "active" ||
    value === "trialing" ||
    value === "past_due" ||
    value === "canceled"
    ? value
    : null;
}

function normalizeSource(value: unknown): SubscriptionSource {
  if (value === "stripe-checkout" || value === "manual") {
    return value;
  }

  return "local";
}

function subscriptionKey(userId: string) {
  return `${prefix}:${userId}:record`;
}

function legacyBillingSubscriptionKey(userId: string) {
  return `${legacyBillingPrefix}:${userId}:subscription`;
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
  window.localStorage.setItem(key, JSON.stringify(value));
}

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}
