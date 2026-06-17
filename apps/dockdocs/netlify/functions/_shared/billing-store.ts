import { getStore } from "@netlify/blobs";
import type {
  SubscriptionPlan,
  SubscriptionStatus,
} from "../../../lib/subscription-runtime";
import type { BillingInterval } from "../../../lib/billing-config";

export type BillingCustomerRecord = {
  userId: string;
  email?: string;
  stripeCustomerId: string;
  createdAt: string;
  updatedAt: string;
};

export type BillingSubscriptionRecord = {
  userId: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  source: "stripe-webhook" | "creem-webhook";
  // monthly/annual = recurring (currentPeriodEnd set); lifetime = one-time, never
  // expires (currentPeriodEnd omitted — no deactivating event ever arrives).
  interval?: BillingInterval;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  priceId?: string;
  lastStripeEventId?: string;
  updatedAt: string;
};

const storeName = "dockdocs-billing";
const memory = new Map<string, unknown>();

export async function readCustomerByUserId(userId: string) {
  return readJson<BillingCustomerRecord>(customerKey(userId));
}

export async function writeCustomer(record: BillingCustomerRecord) {
  const now = new Date().toISOString();
  const nextRecord = {
    ...record,
    updatedAt: now,
    createdAt: record.createdAt || now,
  };
  await writeJson(customerKey(record.userId), nextRecord);
  await writeJson(customerLookupKey(record.stripeCustomerId), {
    userId: record.userId,
  });
}

export async function readSubscriptionByUserId(userId: string) {
  return readJson<BillingSubscriptionRecord>(subscriptionUserKey(userId));
}

export async function readSubscriptionByCustomerId(customerId: string) {
  const lookup = await readJson<{ userId?: string }>(subscriptionCustomerKey(customerId));
  return lookup?.userId ? readSubscriptionByUserId(lookup.userId) : null;
}

export async function readSubscriptionBySubscriptionId(subscriptionId: string) {
  const lookup = await readJson<{ userId?: string }>(
    subscriptionLookupKey(subscriptionId),
  );
  return lookup?.userId ? readSubscriptionByUserId(lookup.userId) : null;
}

export async function writeSubscription(record: BillingSubscriptionRecord) {
  const nextRecord = {
    ...record,
    updatedAt: new Date().toISOString(),
  };
  await writeJson(subscriptionUserKey(record.userId), nextRecord);
  if (record.stripeCustomerId) {
    await writeJson(subscriptionCustomerKey(record.stripeCustomerId), {
      userId: record.userId,
    });
  }
  if (record.stripeSubscriptionId) {
    await writeJson(subscriptionLookupKey(record.stripeSubscriptionId), {
      userId: record.userId,
    });
  }
}

export async function hasProcessedStripeEvent(eventId: string) {
  return Boolean(await readJson<{ processedAt?: string }>(eventKey(eventId)));
}

export async function markStripeEventProcessed(eventId: string) {
  await writeJson(eventKey(eventId), {
    processedAt: new Date().toISOString(),
  });
}

// ── Lifetime founding-counter ────────────────────────────────────────────────
// Counts DISTINCT lifetime buyers from 0 so we know when the first-1000 founding
// window is filling (the price rises after 1000 — handled manually, no live
// ticker is shown to users). Idempotent per user via a marker, so webhook retries
// or a same-user repurchase never double-count. Concurrent first-time buyers
// could in theory race the read-modify-write, but founding lifetime sales are
// rare and Blobs uses strong consistency, so v1 accepts that; the count only
// needs to be approximately right to signal "approaching 1000".
const lifetimeCountKey = "lifetime/count.json";
function lifetimeBuyerKey(userId: string) {
  return `lifetime/buyers/${userId}.json`;
}

export async function readLifetimeBuyerCount(): Promise<number> {
  const rec = await readJson<{ count?: number }>(lifetimeCountKey);
  return typeof rec?.count === "number" && Number.isFinite(rec.count) ? rec.count : 0;
}

// Record a lifetime purchase for a user and return the resulting distinct-buyer
// count. No-op (returns the current count) if this user is already counted.
export async function recordLifetimeBuyer(userId: string): Promise<number> {
  const current = await readLifetimeBuyerCount();
  const already = await readJson<{ countedAt?: string }>(lifetimeBuyerKey(userId));
  if (already) return current;
  await writeJson(lifetimeBuyerKey(userId), { countedAt: new Date().toISOString() });
  const next = current + 1;
  await writeJson(lifetimeCountKey, { count: next });
  return next;
}

export function createFreeBillingSubscription(
  userId: string,
): BillingSubscriptionRecord {
  return {
    userId,
    plan: "FREE",
    status: "free",
    source: "stripe-webhook",
    updatedAt: new Date().toISOString(),
  };
}

async function readJson<T>(key: string): Promise<T | null> {
  try {
    const store = getBillingStore();
    return (await store.get(key, { type: "json" })) as T | null;
  } catch {
    return (memory.get(key) as T | undefined) ?? null;
  }
}

async function writeJson(key: string, value: unknown) {
  memory.set(key, value);
  try {
    const store = getBillingStore();
    await store.setJSON(key, value);
  } catch {
    // Local tests may not run inside a configured Netlify Blobs environment.
  }
}

function getBillingStore() {
  return getStore({
    name: storeName,
    consistency: "strong",
  });
}

function customerKey(userId: string) {
  return `customers/by-user/${userId}.json`;
}

function customerLookupKey(customerId: string) {
  return `customers/by-customer/${customerId}.json`;
}

function subscriptionUserKey(userId: string) {
  return `subscriptions/by-user/${userId}.json`;
}

function subscriptionCustomerKey(customerId: string) {
  return `subscriptions/by-customer/${customerId}.json`;
}

function subscriptionLookupKey(subscriptionId: string) {
  return `subscriptions/by-subscription/${subscriptionId}.json`;
}

function eventKey(eventId: string) {
  return `events/${eventId}.json`;
}
