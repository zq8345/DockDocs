import { getStore } from "@netlify/blobs";
import type {
  SubscriptionPlan,
  SubscriptionStatus,
} from "../../../lib/subscription-runtime";

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
