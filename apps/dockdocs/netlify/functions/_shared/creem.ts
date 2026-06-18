// Creem (Merchant of Record) integration helpers — raw REST, no SDK.
// Reads everything from Netlify env vars so the code is inert until configured:
//   CREEM_API_KEY            creem_test_... (test) or creem_... (live) — base URL derived from prefix
//   CREEM_PLUS_PRODUCT_ID    prod_... for the $5/mo Plus subscription
//   CREEM_PRO_PRODUCT_ID     prod_... for the $20/mo Pro subscription
//   CREEM_WEBHOOK_SECRET     signing secret from the Creem webhook settings
// Docs: https://docs.creem.io  (POST /v1/checkouts ; webhook header `creem-signature`, HMAC-SHA256 over raw body)

declare const Netlify: {
  env: { get(name: string): string | undefined };
};

export type CreemPlan = "PLUS" | "PRO";
// monthly/annual = recurring; lifetime = one-time (never expires).
export type CreemInterval = "monthly" | "annual" | "lifetime";

export function creemApiKey(): string {
  return Netlify.env.get("CREEM_API_KEY")?.trim() || "";
}

// Test keys are prefixed `creem_test_`; live keys `creem_`. Pick the matching host.
export function creemApiBase(): string {
  return creemApiKey().startsWith("creem_test_")
    ? "https://test-api.creem.io/v1"
    : "https://api.creem.io/v1";
}

export function creemProductIdForPlan(plan: CreemPlan, interval: CreemInterval = "monthly"): string {
  // Env names: monthly = CREEM_PLUS_PRODUCT_ID / CREEM_PRO_PRODUCT_ID (pre-existing);
  // annual = CREEM_{PLAN}_ANNUAL_PRODUCT_ID; lifetime = CREEM_{PLAN}_LIFETIME_PRODUCT_ID.
  const seg = interval === "monthly" ? "" : `${interval.toUpperCase()}_`;
  return Netlify.env.get(`CREEM_${plan}_${seg}PRODUCT_ID`)?.trim() || "";
}

// Map a product id seen in a webhook back to our (plan, interval). Checks all six
// SKUs (plus/pro × monthly/annual/lifetime). Unset env vars return "" so they
// never false-match a real product id.
export function planAndIntervalForCreemProductId(
  productId: string | undefined | null,
): { plan: CreemPlan; interval: CreemInterval } | null {
  const id = (productId || "").trim();
  if (!id) return null;
  const plans: CreemPlan[] = ["PLUS", "PRO"];
  const intervals: CreemInterval[] = ["monthly", "annual", "lifetime"];
  for (const plan of plans) {
    for (const interval of intervals) {
      if (id === creemProductIdForPlan(plan, interval)) return { plan, interval };
    }
  }
  return null;
}

// Back-compat helper — plan only.
export function planForCreemProductId(productId: string | undefined | null): CreemPlan | null {
  return planAndIntervalForCreemProductId(productId)?.plan ?? null;
}

export type CreemCheckoutResult =
  | { ok: true; url: string; id?: string }
  | { ok: false; status: number; code: string; message: string };

export async function createCreemCheckout(params: {
  plan: CreemPlan;
  interval?: CreemInterval;
  userId: string;
  email?: string;
  successUrl: string;
  // Proration upgrade: a server-created one-time discount code (= the credit) and
  // the prior recurring sub this new sub supersedes (cancelled on activation).
  discountCode?: string;
  supersedesSubId?: string;
}): Promise<CreemCheckoutResult> {
  const interval: CreemInterval = params.interval ?? "monthly";
  const apiKey = creemApiKey();
  if (!apiKey) {
    return { ok: false, status: 503, code: "CREEM_NOT_CONFIGURED", message: "Payments are not configured yet (set CREEM_API_KEY)." };
  }
  const productId = creemProductIdForPlan(params.plan, interval);
  if (!productId) {
    return { ok: false, status: 503, code: "CREEM_PRODUCT_MISSING", message: `Missing product id for ${params.plan} ${interval} — set the matching CREEM_… env var.` };
  }

  let res: Response;
  try {
    res = await fetch(`${creemApiBase()}/checkouts`, {
      method: "POST",
      headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: productId,
        success_url: params.successUrl,
        // Discount is applied SERVER-SIDE — the code is never handed to the user.
        ...(params.discountCode ? { discount_code: params.discountCode } : {}),
        ...(params.email ? { customer: { email: params.email } } : {}),
        // Echoed back in every webhook so we can grant the right user.
        metadata: {
          userId: params.userId,
          plan: params.plan,
          interval,
          ...(params.supersedesSubId ? { supersedesSubId: params.supersedesSubId } : {}),
        },
      }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not reach the payment provider.";
    return { ok: false, status: 502, code: "CREEM_UNREACHABLE", message };
  }

  const data = (await res.json().catch(() => null)) as { checkout_url?: string; id?: string; message?: string } | null;
  if (!res.ok || !data?.checkout_url) {
    return {
      ok: false,
      status: 502,
      code: "CREEM_CHECKOUT_FAILED",
      message: data?.message || `The payment provider returned status ${res.status}.`,
    };
  }
  return { ok: true, url: data.checkout_url, id: data.id };
}

// Verify the `creem-signature` header: HMAC-SHA256 of the raw request body with the webhook secret.
// Uses Web Crypto so it runs on any Netlify Functions runtime.
export async function verifyCreemSignature(rawBody: string, signature: string | null | undefined): Promise<boolean> {
  const secret = Netlify.env.get("CREEM_WEBHOOK_SECRET")?.trim() || "";
  const provided = (signature || "").trim().toLowerCase();
  if (!secret || !provided) return false;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sigBuf = await crypto.subtle.sign("HMAC", key, enc.encode(rawBody));
  const expected = [...new Uint8Array(sigBuf)].map((b) => b.toString(16).padStart(2, "0")).join("");

  if (expected.length !== provided.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i += 1) {
    mismatch |= expected.charCodeAt(i) ^ provided.charCodeAt(i);
  }
  return mismatch === 0;
}

export type CreemPortalResult =
  | { ok: true; url: string }
  | { ok: false; status: number; code: string; message: string };

// Generate a Creem customer portal link so a subscriber can manage / cancel.
export async function createCreemPortal(customerId: string): Promise<CreemPortalResult> {
  const apiKey = creemApiKey();
  if (!apiKey) {
    return { ok: false, status: 503, code: "CREEM_NOT_CONFIGURED", message: "Payments are not configured yet." };
  }
  if (!customerId) {
    return { ok: false, status: 404, code: "NO_CUSTOMER", message: "No customer to manage." };
  }

  let res: Response;
  try {
    res = await fetch(`${creemApiBase()}/customers/billing`, {
      method: "POST",
      headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ customer_id: customerId }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not reach the payment provider.";
    return { ok: false, status: 502, code: "CREEM_UNREACHABLE", message };
  }

  const data = (await res.json().catch(() => null)) as
    | { customer_portal_link?: string; url?: string; portal_url?: string; link?: string; message?: string }
    | null;
  const url = data?.customer_portal_link || data?.url || data?.portal_url || data?.link;
  if (!res.ok || !url) {
    return { ok: false, status: 502, code: "CREEM_PORTAL_FAILED", message: data?.message || `The payment provider returned status ${res.status}.` };
  }
  return { ok: true, url };
}

export type CreemActionResult =
  | { ok: true }
  | { ok: false; status: number; code: string; message: string };

// Cancel a subscription (immediate by default). Used to stop a user's prior
// recurring sub after they upgrade (proration checkout) or buy a lifetime plan, so
// they aren't double-charged. Docs: POST /v1/subscriptions/{id}/cancel { mode }.
export async function cancelCreemSubscription(
  subscriptionId: string,
  mode: "immediate" | "scheduled" = "immediate",
): Promise<CreemActionResult> {
  const apiKey = creemApiKey();
  if (!apiKey) return { ok: false, status: 503, code: "CREEM_NOT_CONFIGURED", message: "Payments are not configured yet." };
  if (!subscriptionId) return { ok: false, status: 400, code: "CREEM_NO_SUBSCRIPTION", message: "No subscription to cancel." };

  let res: Response;
  try {
    res = await fetch(`${creemApiBase()}/subscriptions/${encodeURIComponent(subscriptionId)}/cancel`, {
      method: "POST",
      headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ mode }),
    });
  } catch (error) {
    return { ok: false, status: 502, code: "CREEM_UNREACHABLE", message: error instanceof Error ? error.message : "Could not reach the payment provider." };
  }
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { message?: string } | null;
    return { ok: false, status: 502, code: "CREEM_CANCEL_FAILED", message: data?.message || `The payment provider returned status ${res.status}.` };
  }
  return { ok: true };
}

export type CreemDiscountResult =
  | { ok: true; code: string; id?: string }
  | { ok: false; status: number; code: string; message: string };

// Create a single-use, product-scoped, time-limited FIXED discount = the proration
// credit. `duration:"once"` on a subscription discounts only the first payment, so
// the user pays (new price − credit) = the difference, then renews at full price.
// Docs: POST /v1/discounts { type, amount, currency, duration, max_redemptions,
// applies_to_products, expiry_date, code }.
export async function createCreemDiscount(params: {
  amountCents: number;
  productId: string;
  code: string;
  expiryDateIso: string;
  currency?: string;
  name?: string;
}): Promise<CreemDiscountResult> {
  const apiKey = creemApiKey();
  if (!apiKey) return { ok: false, status: 503, code: "CREEM_NOT_CONFIGURED", message: "Payments are not configured yet." };
  if (!params.productId || !(params.amountCents > 0)) {
    return { ok: false, status: 400, code: "CREEM_BAD_DISCOUNT", message: "Missing product or non-positive amount." };
  }

  let res: Response;
  try {
    res = await fetch(`${creemApiBase()}/discounts`, {
      method: "POST",
      headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        name: params.name || `proration-${params.code}`,
        code: params.code,
        type: "fixed",
        amount: params.amountCents,
        currency: params.currency || "USD",
        duration: "once",
        max_redemptions: 1,
        applies_to_products: [params.productId],
        expiry_date: params.expiryDateIso,
      }),
    });
  } catch (error) {
    return { ok: false, status: 502, code: "CREEM_UNREACHABLE", message: error instanceof Error ? error.message : "Could not reach the payment provider." };
  }
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { message?: string } | null;
    return { ok: false, status: 502, code: "CREEM_DISCOUNT_FAILED", message: data?.message || `The payment provider returned status ${res.status}.` };
  }
  const data = (await res.json().catch(() => null)) as { id?: string; code?: string } | null;
  return { ok: true, code: data?.code || params.code, id: data?.id };
}

export type CreemSubscriptionResult =
  | { ok: true; subscription: Record<string, unknown> }
  | { ok: false; status: number; code: string; message: string };

// Retrieve a subscription (for authoritative period dates when computing proration).
// Creem's retrieve is the QUERY-PARAM form — the path form /subscriptions/{id} 404s.
// Docs: GET /v1/subscriptions?subscription_id=...
export async function getCreemSubscription(subscriptionId: string): Promise<CreemSubscriptionResult> {
  const apiKey = creemApiKey();
  if (!apiKey) return { ok: false, status: 503, code: "CREEM_NOT_CONFIGURED", message: "Payments are not configured yet." };
  if (!subscriptionId) return { ok: false, status: 400, code: "CREEM_NO_SUBSCRIPTION", message: "No subscription to retrieve." };

  let res: Response;
  try {
    res = await fetch(`${creemApiBase()}/subscriptions?subscription_id=${encodeURIComponent(subscriptionId)}`, {
      headers: { "x-api-key": apiKey },
    });
  } catch (error) {
    return { ok: false, status: 502, code: "CREEM_UNREACHABLE", message: error instanceof Error ? error.message : "Could not reach the payment provider." };
  }
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { message?: string } | null;
    return { ok: false, status: 502, code: "CREEM_GET_SUB_FAILED", message: data?.message || `The payment provider returned status ${res.status}.` };
  }
  const subscription = (await res.json().catch(() => null)) as Record<string, unknown> | null;
  if (!subscription) return { ok: false, status: 502, code: "CREEM_GET_SUB_FAILED", message: "Empty subscription body." };
  return { ok: true, subscription };
}
