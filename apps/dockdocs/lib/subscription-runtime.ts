import { getCurrentAccountUser } from "@/lib/account-runtime";
import { isPaidSubscriptionPlan, type PaidSubscriptionPlan } from "@/lib/billing-config";

export type SubscriptionPlan = "FREE" | "PLUS" | "PRO";

export type SubscriptionStatus =
  | "free"
  | "active"
  | "trialing"
  | "past_due"
  | "canceled";

export type SubscriptionSource =
  | "local"
  | "stripe-checkout"
  | "stripe-webhook"
  | "manual";

export type SubscriptionRecord = {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  source: SubscriptionSource;
  updatedAt: string;
  userId?: string;
  stripeSessionId?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  priceId?: string;
  lastStripeEventId?: string;
};

export type SubscriptionSnapshot = {
  userId: string;
  signedIn: boolean;
  record: SubscriptionRecord;
  displayName: "Free" | "Plus" | "Pro";
  statusLabel: string;
  isPaidPlaceholder: boolean;
  customer?: {
    stripeCustomerId?: string;
    email?: string;
  } | null;
  serverBacked: boolean;
};

const prefix = "dockdocs:subscription";
const legacyBillingPrefix = "dockdocs:billing";
const anonymousUserId = "anonymous";
const developmentProAccountEmail = "zq8345@gmail.com";

export async function getSubscriptionSnapshot(): Promise<SubscriptionSnapshot> {
  const user = await getCurrentAccountUser();
  const userId = user?.id ?? anonymousUserId;
  if (isDevelopmentProAccountEmail(user?.email)) {
    const record = createDevelopmentProSubscription(userId);
    return {
      userId,
      signedIn: Boolean(user),
      record,
      displayName: planDisplayName(record.plan),
      statusLabel: statusDisplayName(record.status),
      isPaidPlaceholder: true,
      customer: null,
      serverBacked: false,
    };
  }

  const serverSnapshot = await readServerSubscription();
  const record = serverSnapshot?.record ?? readSubscriptionRecord(userId);
  if (user && serverSnapshot?.record) {
    writeSubscriptionRecord(user.id, serverSnapshot.record);
  }

  return {
    userId,
    signedIn: Boolean(user),
    record,
    displayName: planDisplayName(record.plan),
    statusLabel: statusDisplayName(record.status),
    isPaidPlaceholder: record.plan !== "FREE",
    customer: serverSnapshot?.customer ?? null,
    serverBacked: Boolean(serverSnapshot),
  };
}

export async function createBillingCheckoutSession(plan: PaidSubscriptionPlan) {
  if (!isPaidSubscriptionPlan(plan)) {
    throw new Error("Choose Plus or Pro.");
  }

  const response = await fetch("/api/billing/create-checkout-session", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      plan,
      origin: window.location.origin,
    }),
  });
  const payload = await readBillingResponse(response);
  if (!response.ok || !payload?.ok || !payload.url) {
    throw new Error(payload?.message || "Checkout is not available.");
  }

  return payload.url;
}

export async function createBillingPortalSession() {
  const response = await fetch("/api/billing/create-portal-session", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      origin: window.location.origin,
    }),
  });
  const payload = await readBillingResponse(response);
  if (!response.ok || !payload?.ok || !payload.url) {
    throw new Error(payload?.message || "Customer portal is not available.");
  }

  return payload.url;
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

export async function readEffectiveSubscriptionRecord(
  userId: string,
): Promise<SubscriptionRecord> {
  const normalizedUserId = userId || anonymousUserId;
  const user = await getCurrentAccountUser();
  if (
    user?.id === normalizedUserId &&
    isDevelopmentProAccountEmail(user.email)
  ) {
    return createDevelopmentProSubscription(normalizedUserId);
  }

  return readSubscriptionRecord(normalizedUserId);
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

export function createDevelopmentProSubscription(
  userId = anonymousUserId,
): SubscriptionRecord {
  return {
    plan: "PRO",
    status: "active",
    source: "manual",
    updatedAt: new Date().toISOString(),
    userId,
  };
}

export function isDevelopmentProAccountEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() === developmentProAccountEmail;
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
    free: "Free",
    active: "Active",
    trialing: "Trialing",
    past_due: "Past due",
    canceled: "Canceled",
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
    stripeCustomerId?: unknown;
    stripeSubscriptionId?: unknown;
    currentPeriodStart?: unknown;
    currentPeriodEnd?: unknown;
    cancelAtPeriodEnd?: unknown;
    priceId?: unknown;
    lastStripeEventId?: unknown;
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
    stripeCustomerId:
      typeof input.stripeCustomerId === "string" ? input.stripeCustomerId : undefined,
    stripeSubscriptionId:
      typeof input.stripeSubscriptionId === "string"
        ? input.stripeSubscriptionId
        : undefined,
    currentPeriodStart:
      typeof input.currentPeriodStart === "string"
        ? input.currentPeriodStart
        : undefined,
    currentPeriodEnd:
      typeof input.currentPeriodEnd === "string" ? input.currentPeriodEnd : undefined,
    cancelAtPeriodEnd:
      typeof input.cancelAtPeriodEnd === "boolean"
        ? input.cancelAtPeriodEnd
        : undefined,
    priceId: typeof input.priceId === "string" ? input.priceId : undefined,
    lastStripeEventId:
      typeof input.lastStripeEventId === "string"
        ? input.lastStripeEventId
        : undefined,
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
  if (value === "stripe-checkout" || value === "stripe-webhook" || value === "manual") {
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

async function readServerSubscription() {
  if (typeof window === "undefined") {
    return null;
  }

  if (isLocalStaticHost()) {
    return null;
  }

  try {
    const response = await fetch("/api/billing/subscription", {
      method: "GET",
      credentials: "include",
    });
    const payload = (await response.json().catch(() => null)) as
      | {
          ok?: boolean;
          userId?: string;
          subscription?: unknown;
          customer?: {
            stripeCustomerId?: string;
            email?: string;
          } | null;
        }
      | null;

    if (!response.ok || !payload?.ok || !payload.subscription) {
      return null;
    }

    const userId = payload.userId || anonymousUserId;
    const record = normalizeSubscriptionRecord(payload.subscription, userId);
    if (!record) {
      return null;
    }

    return {
      record,
      customer: payload.customer ?? null,
    };
  } catch {
    return null;
  }
}

function isLocalStaticHost() {
  return (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "::1"
  );
}

async function readBillingResponse(response: Response) {
  return (await response.json().catch(() => null)) as
    | {
        ok?: boolean;
        url?: string;
        message?: string;
      }
    | null;
}
