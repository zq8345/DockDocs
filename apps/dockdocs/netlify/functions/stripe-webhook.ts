import type { Config, Context } from "@netlify/functions";
import type {
  SubscriptionPlan,
  SubscriptionStatus,
} from "../../lib/subscription-runtime";
import { json } from "./_shared/billing-auth";
import {
  hasProcessedStripeEvent,
  markStripeEventProcessed,
  readSubscriptionByCustomerId,
  readSubscriptionBySubscriptionId,
  writeCustomer,
  writeSubscription,
  type BillingSubscriptionRecord,
} from "./_shared/billing-store";
import {
  isStripeSubscription,
  parseStripeEvent,
  planForPriceId,
  readBillingEnv,
  retrieveStripeSubscription,
  statusFromStripeStatus,
  verifyStripeWebhookSignature,
  type StripeCheckoutSession,
  type StripeEvent,
  type StripeSubscription,
} from "./_shared/stripe-client";

type StripeInvoice = {
  id?: string;
  customer?: string;
  subscription?: string;
};

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") {
    return json(
      {
        ok: false,
        code: "METHOD_NOT_ALLOWED",
        message: "Use POST for Stripe webhooks.",
      },
      405,
      { Allow: "POST" },
    );
  }

  const env = readBillingEnv();
  if (!env.webhookSecret) {
    return json(
      {
        ok: false,
        code: "BILLING_NOT_CONFIGURED",
        message: "Billing webhook is not configured. Set STRIPE_WEBHOOK_SECRET.",
      },
      503,
    );
  }

  const payload = await req.text();
  const signature = req.headers.get("Stripe-Signature");
  if (!verifyStripeWebhookSignature({ payload, signature, secret: env.webhookSecret })) {
    return json(
      {
        ok: false,
        code: "STRIPE_SIGNATURE_INVALID",
        message: "Stripe webhook signature could not be verified.",
      },
      400,
    );
  }

  const event = parseStripeEvent(payload);
  if (!event) {
    return json(
      {
        ok: false,
        code: "INVALID_STRIPE_EVENT",
        message: "Stripe webhook payload is invalid.",
      },
      400,
    );
  }

  if (await hasProcessedStripeEvent(event.id)) {
    return json({
      ok: true,
      duplicate: true,
    });
  }

  const result = await processStripeEvent(event);
  await markStripeEventProcessed(event.id);

  return json({
    ok: true,
    ...result,
  });
};

export const config: Config = {
  path: "/api/billing/stripe-webhook",
};

async function processStripeEvent(event: StripeEvent) {
  const object = event.data?.object;
  switch (event.type) {
    case "checkout.session.completed":
      return handleCheckoutCompleted(event, object as StripeCheckoutSession);
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      return handleSubscriptionEvent(event, object);
    case "invoice.payment_succeeded":
      return handleInvoiceEvent(event, object as StripeInvoice, "active");
    case "invoice.payment_failed":
    case "invoice.payment_action_required":
      return handleInvoiceEvent(event, object as StripeInvoice, "past_due");
    default:
      return {
        ignored: true,
        eventType: event.type,
      };
  }
}

async function handleCheckoutCompleted(
  event: StripeEvent,
  session: StripeCheckoutSession,
) {
  const userId = session.client_reference_id || session.metadata?.userId;
  const customerId = stringOrUndefined(session.customer);
  const subscriptionId = stringOrUndefined(session.subscription);
  if (!userId || !customerId) {
    return {
      ignored: true,
      reason: "missing_checkout_user_or_customer",
    };
  }

  const now = new Date().toISOString();
  await writeCustomer({
    userId,
    email: session.customer_details?.email,
    stripeCustomerId: customerId,
    createdAt: now,
    updatedAt: now,
  });

  const subscription = subscriptionId
    ? await retrieveStripeSubscription(subscriptionId)
    : null;
  const record =
    subscription && isStripeSubscription(subscription)
      ? subscriptionToRecord({
          eventId: event.id,
          subscription,
          fallbackUserId: userId,
        })
      : checkoutToRecord({
          eventId: event.id,
          userId,
          customerId,
          subscriptionId,
          plan: planFromMetadata(session.metadata?.plan),
        });

  await writeSubscription(record);
  return {
    eventType: event.type,
    userId,
    plan: record.plan,
    status: record.status,
  };
}

async function handleSubscriptionEvent(event: StripeEvent, object: unknown) {
  if (!isStripeSubscription(object)) {
    return {
      ignored: true,
      reason: "invalid_subscription_object",
    };
  }

  const existing = await findExistingSubscription(object);
  const record = subscriptionToRecord({
    eventId: event.id,
    subscription: object,
    fallbackUserId: object.metadata?.userId || existing?.userId,
    previous: existing,
  });
  if (!record.userId) {
    return {
      ignored: true,
      reason: "missing_subscription_user",
    };
  }

  await writeSubscription(record);
  return {
    eventType: event.type,
    userId: record.userId,
    plan: record.plan,
    status: record.status,
  };
}

async function handleInvoiceEvent(
  event: StripeEvent,
  invoice: StripeInvoice,
  status: SubscriptionStatus,
) {
  const subscriptionId = stringOrUndefined(invoice.subscription);
  const customerId = stringOrUndefined(invoice.customer);
  const existing = subscriptionId
    ? await readSubscriptionBySubscriptionId(subscriptionId)
    : customerId
      ? await readSubscriptionByCustomerId(customerId)
      : null;

  if (!existing) {
    return {
      ignored: true,
      reason: "subscription_not_found_for_invoice",
    };
  }

  await writeSubscription({
    ...existing,
    status,
    lastStripeEventId: event.id,
    updatedAt: new Date().toISOString(),
  });
  return {
    eventType: event.type,
    userId: existing.userId,
    plan: existing.plan,
    status,
  };
}

async function findExistingSubscription(subscription: StripeSubscription) {
  return (
    (await readSubscriptionBySubscriptionId(subscription.id)) ??
    (subscription.customer
      ? await readSubscriptionByCustomerId(subscription.customer)
      : null)
  );
}

function subscriptionToRecord({
  eventId,
  subscription,
  fallbackUserId,
  previous,
}: {
  eventId: string;
  subscription: StripeSubscription;
  fallbackUserId?: string;
  previous?: BillingSubscriptionRecord | null;
}): BillingSubscriptionRecord {
  const priceId = subscription.items?.data?.[0]?.price?.id;
  const planFromPrice = planForPriceId(priceId);
  const status = statusFromStripeStatus(subscription.status);
  const plan =
    status === "canceled"
      ? previous?.plan ?? planFromPrice
      : planFromPrice === "FREE"
        ? previous?.plan ?? "FREE"
        : planFromPrice;

  return {
    userId: fallbackUserId ?? "",
    stripeCustomerId: subscription.customer,
    stripeSubscriptionId: subscription.id,
    plan,
    status,
    source: "stripe-webhook",
    currentPeriodStart: unixToIso(subscription.current_period_start),
    currentPeriodEnd: unixToIso(subscription.current_period_end),
    cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
    priceId,
    lastStripeEventId: eventId,
    updatedAt: new Date().toISOString(),
  };
}

function checkoutToRecord({
  eventId,
  userId,
  customerId,
  subscriptionId,
  plan,
}: {
  eventId: string;
  userId: string;
  customerId: string;
  subscriptionId?: string;
  plan: SubscriptionPlan;
}): BillingSubscriptionRecord {
  return {
    userId,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    plan,
    status: "active",
    source: "stripe-webhook",
    lastStripeEventId: eventId,
    updatedAt: new Date().toISOString(),
  };
}

function planFromMetadata(value: unknown): SubscriptionPlan {
  return value === "PLUS" || value === "PRO" ? value : "FREE";
}

function stringOrUndefined(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function unixToIso(value: unknown) {
  return typeof value === "number" ? new Date(value * 1000).toISOString() : undefined;
}
