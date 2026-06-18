import { getCurrentAccountUser } from "@/lib/account-runtime";
import { isPaidSubscriptionPlan, isBillingInterval, type PaidSubscriptionPlan, type BillingInterval } from "@/lib/billing-config";
import { supabase } from "@/lib/supabase";

// Billing endpoints identify the user from the Supabase access token (Bearer).
async function authHeader(): Promise<Record<string, string>> {
  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

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
  | "creem-checkout"
  | "creem-webhook"
  | "manual";

export type SubscriptionRecord = {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  source: SubscriptionSource;
  updatedAt: string;
  userId?: string;
  interval?: BillingInterval;
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

// Error thrown by the billing actions, carrying the backend's code + HTTP status
// so callers can show the real reason and only treat a genuine 401 as "sign in".
export class BillingError extends Error {
  code?: string;
  status?: number;
  constructor(message: string, opts?: { code?: string; status?: number }) {
    super(message);
    this.name = "BillingError";
    this.code = opts?.code;
    this.status = opts?.status;
  }
}

const prefix = "dockdocs:subscription";
const legacyBillingPrefix = "dockdocs:billing";
const anonymousUserId = "anonymous";
const developmentProAccountEmails = (process.env.NEXT_PUBLIC_DEV_PRO_EMAILS ?? "")
  .split(",")
  .map((entry) => entry.trim().toLowerCase())
  .filter(Boolean);

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

export async function createBillingCheckoutSession(
  plan: PaidSubscriptionPlan,
  interval: BillingInterval = "monthly",
) {
  if (!isPaidSubscriptionPlan(plan)) {
    throw new Error("Choose Plus or Pro.");
  }

  const auth = await authHeader();
  const response = await fetch("/api/billing/create-checkout-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...auth,
    },
    body: JSON.stringify({
      plan,
      interval,
      origin: window.location.origin,
    }),
  });
  const payload = await readBillingResponse(response);
  if (!response.ok || !payload?.ok || !payload.url) {
    throw new BillingError(payload?.message || "Checkout is not available.", {
      code: payload?.code,
      status: response.status,
    });
  }

  // Redirect the browser to the hosted Creem checkout page.
  if (typeof window !== "undefined") {
    window.location.assign(payload.url);
  }

  return payload.url;
}

// Start a proration UPGRADE checkout for a user who already has a recurring sub.
// The server computes the unused-value credit, mints a one-time discount, and returns
// a checkout URL; the browser redirects so the user pays only the difference. (Covers
// recurring→recurring AND recurring→lifetime upgrades; replaces the old in-place
// change-plan, which Creem couldn't do across billing intervals.)
export async function startUpgradeCheckout(plan: PaidSubscriptionPlan, interval: BillingInterval) {
  if (!isPaidSubscriptionPlan(plan)) {
    throw new Error("Choose Plus or Pro.");
  }
  const auth = await authHeader();
  const response = await fetch("/api/billing/upgrade-checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...auth,
    },
    body: JSON.stringify({ plan, interval, origin: window.location.origin }),
  });
  const payload = await readBillingResponse(response);
  if (!response.ok || !payload?.ok || !payload.url) {
    throw new BillingError(payload?.message || "Upgrade is not available.", {
      code: payload?.code,
      status: response.status,
    });
  }

  // Redirect to the hosted Creem checkout (discount already applied server-side).
  if (typeof window !== "undefined") {
    window.location.assign(payload.url);
  }

  return payload.url;
}

export async function createBillingPortalSession() {
  const auth = await authHeader();
  const response = await fetch("/api/billing/create-portal-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...auth,
    },
    body: JSON.stringify({
      origin: window.location.origin,
    }),
  });
  const payload = await readBillingResponse(response);
  if (!response.ok || !payload?.ok || !payload.url) {
    throw new BillingError(payload?.message || "Customer portal is not available.", {
      code: payload?.code,
      status: response.status,
    });
  }

  // Redirect the browser to the hosted Creem billing portal.
  if (typeof window !== "undefined") {
    window.location.assign(payload.url);
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
  const validated = normalizeSubscriptionRecord(
    { ...record, userId: normalizedUserId, updatedAt: record.updatedAt || new Date().toISOString() },
    normalizedUserId,
  );
  if (!validated) return;
  writeJson(subscriptionKey(normalizedUserId), validated);
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
  const normalized = email?.trim().toLowerCase();
  return normalized ? developmentProAccountEmails.includes(normalized) : false;
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
    interval?: unknown;
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
    interval: isBillingInterval(input.interval) ? input.interval : undefined,
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
  if (
    value === "stripe-checkout" ||
    value === "stripe-webhook" ||
    value === "creem-checkout" ||
    value === "creem-webhook" ||
    value === "manual"
  ) {
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
    const auth = await authHeader();
    if (!auth.Authorization) {
      return null;
    }
    const response = await fetch("/api/billing/subscription", {
      method: "GET",
      headers: auth,
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
        code?: string;
        message?: string;
      }
    | null;
}
