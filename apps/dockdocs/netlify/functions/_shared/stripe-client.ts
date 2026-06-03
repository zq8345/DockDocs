import { createHmac, timingSafeEqual } from "node:crypto";
import {
  isPaidSubscriptionPlan,
  type PaidSubscriptionPlan,
} from "../../../lib/billing-config";
import type {
  SubscriptionPlan,
  SubscriptionStatus,
} from "../../../lib/subscription-runtime";

declare const Netlify:
  | {
      env: {
        get(name: string): string | undefined;
      };
    }
  | undefined;

export type BillingEnv = {
  stripeSecretKey?: string;
  webhookSecret?: string;
  plusPriceId?: string;
  proPriceId?: string;
  portalConfigurationId?: string;
};

export type StripeCheckoutSession = {
  id?: string;
  url?: string;
  customer?: string;
  subscription?: string;
  client_reference_id?: string;
  metadata?: Record<string, string>;
  customer_details?: {
    email?: string;
  };
  error?: {
    message?: string;
  };
};

export type StripePortalSession = {
  id?: string;
  url?: string;
  error?: {
    message?: string;
  };
};

export type StripeSubscription = {
  id: string;
  customer?: string;
  status?: string;
  current_period_start?: number;
  current_period_end?: number;
  cancel_at_period_end?: boolean;
  metadata?: Record<string, string>;
  items?: {
    data?: Array<{
      price?: {
        id?: string;
      };
    }>;
  };
};

export type StripeEvent = {
  id: string;
  type: string;
  data?: {
    object?: unknown;
  };
};

const stripeApi = "https://api.stripe.com/v1";

export function readBillingEnv(): BillingEnv {
  return {
    stripeSecretKey: readEnv("STRIPE_SECRET_KEY"),
    webhookSecret: readEnv("STRIPE_WEBHOOK_SECRET"),
    plusPriceId: readEnv("DOCKDOCS_STRIPE_PLUS_PRICE_ID"),
    proPriceId: readEnv("DOCKDOCS_STRIPE_PRO_PRICE_ID"),
    portalConfigurationId: readEnv("DOCKDOCS_STRIPE_PORTAL_CONFIGURATION_ID"),
  };
}

export function readSiteOrigin() {
  const siteUrl =
    readEnv("URL") || readEnv("DEPLOY_PRIME_URL") || "https://dockdocs.app";
  return siteUrl.replace(/\/+$/u, "");
}

export function hasCheckoutConfig(env = readBillingEnv()) {
  return Boolean(env.stripeSecretKey && env.plusPriceId && env.proPriceId);
}

export function hasWebhookConfig(env = readBillingEnv()) {
  return Boolean(env.webhookSecret);
}

export function priceIdForPlan(plan: PaidSubscriptionPlan, env = readBillingEnv()) {
  return plan === "PLUS" ? env.plusPriceId : env.proPriceId;
}

export function planForPriceId(
  priceId: string | undefined,
  env = readBillingEnv(),
): SubscriptionPlan {
  if (priceId && priceId === env.plusPriceId) {
    return "PLUS";
  }

  if (priceId && priceId === env.proPriceId) {
    return "PRO";
  }

  return "FREE";
}

export function statusFromStripeStatus(status: string | undefined): SubscriptionStatus {
  if (status === "active") {
    return "active";
  }

  if (status === "trialing") {
    return "trialing";
  }

  if (
    status === "past_due" ||
    status === "incomplete" ||
    status === "incomplete_expired" ||
    status === "unpaid"
  ) {
    return "past_due";
  }

  return "canceled";
}

export async function createStripeCheckoutSession({
  plan,
  userId,
  email,
  origin,
  customerId,
}: {
  plan: PaidSubscriptionPlan;
  userId: string;
  email?: string;
  origin: string;
  customerId?: string;
}) {
  const env = readBillingEnv();
  const priceId = priceIdForPlan(plan, env);
  if (!env.stripeSecretKey || !priceId) {
    return {
      ok: false as const,
      code: "BILLING_NOT_CONFIGURED",
      status: 503,
      message:
        "Billing is not configured yet. Set STRIPE_SECRET_KEY and the DockDocs Stripe price IDs.",
    };
  }

  const params = new URLSearchParams({
    mode: "subscription",
    success_url: `${origin}/account/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pricing/?checkout=cancelled`,
    client_reference_id: userId,
  });
  params.append("line_items[0][price]", priceId);
  params.append("line_items[0][quantity]", "1");
  params.append("metadata[userId]", userId);
  params.append("metadata[plan]", plan);
  params.append("subscription_data[metadata][userId]", userId);
  params.append("subscription_data[metadata][plan]", plan);
  if (customerId) {
    params.append("customer", customerId);
  } else if (email) {
    params.append("customer_email", email);
  }

  const response = await stripeRequest<StripeCheckoutSession>(
    "/checkout/sessions",
    params,
    env.stripeSecretKey,
  );

  if (!response.ok || !response.data?.url) {
    return {
      ok: false as const,
      code: "STRIPE_CHECKOUT_FAILED",
      status: 502,
      message:
        response.data?.error?.message ||
        "Stripe checkout could not be created.",
    };
  }

  return {
    ok: true as const,
    data: response.data,
  };
}

export async function createStripePortalSession({
  customerId,
  origin,
}: {
  customerId: string;
  origin: string;
}) {
  const env = readBillingEnv();
  if (!env.stripeSecretKey) {
    return {
      ok: false as const,
      code: "BILLING_NOT_CONFIGURED",
      status: 503,
      message: "Billing is not configured yet. Set STRIPE_SECRET_KEY.",
    };
  }

  const params = new URLSearchParams({
    customer: customerId,
    return_url: `${origin}/account/`,
  });
  if (env.portalConfigurationId) {
    params.append("configuration", env.portalConfigurationId);
  }

  const response = await stripeRequest<StripePortalSession>(
    "/billing_portal/sessions",
    params,
    env.stripeSecretKey,
  );

  if (!response.ok || !response.data?.url) {
    return {
      ok: false as const,
      code: "STRIPE_PORTAL_FAILED",
      status: 502,
      message:
        response.data?.error?.message ||
        "Stripe customer portal could not be created.",
    };
  }

  return {
    ok: true as const,
    data: response.data,
  };
}

export async function retrieveStripeSubscription(subscriptionId: string) {
  const env = readBillingEnv();
  if (!env.stripeSecretKey) {
    return null;
  }

  const response = await fetch(
    `${stripeApi}/subscriptions/${encodeURIComponent(subscriptionId)}`,
    {
      headers: {
        Authorization: `Bearer ${env.stripeSecretKey}`,
      },
    },
  );

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as StripeSubscription;
}

export function verifyStripeWebhookSignature({
  payload,
  signature,
  secret,
}: {
  payload: string;
  signature: string | null;
  secret: string;
}) {
  if (!signature) {
    return false;
  }

  const parts = Object.fromEntries(
    signature.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key, value];
    }),
  );
  const timestamp = parts.t;
  const expected = parts.v1;
  if (!timestamp || !expected) {
    return false;
  }

  const digest = createHmac("sha256", secret)
    .update(`${timestamp}.${payload}`)
    .digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  const digestBuffer = Buffer.from(digest, "hex");
  return (
    expectedBuffer.length === digestBuffer.length &&
    timingSafeEqual(expectedBuffer, digestBuffer)
  );
}

export function parseStripeEvent(payload: string): StripeEvent | null {
  try {
    const event = JSON.parse(payload) as StripeEvent;
    if (!event?.id || !event.type) {
      return null;
    }

    return event;
  } catch {
    return null;
  }
}

export function isStripeSubscription(value: unknown): value is StripeSubscription {
  return Boolean(
    value &&
      typeof value === "object" &&
      typeof (value as StripeSubscription).id === "string",
  );
}

export function isPaidPlanFromUnknown(value: unknown): value is PaidSubscriptionPlan {
  return isPaidSubscriptionPlan(value);
}

async function stripeRequest<T>(
  path: string,
  params: URLSearchParams,
  secretKey: string,
) {
  const response = await fetch(`${stripeApi}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });
  const data = (await response.json().catch(() => null)) as T | null;

  return {
    ok: response.ok,
    data,
  };
}

function readEnv(name: string) {
  return (
    (typeof Netlify !== "undefined" ? Netlify?.env.get(name) : undefined) ??
    process.env[name]
  );
}
