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

export function creemApiKey(): string {
  return Netlify.env.get("CREEM_API_KEY")?.trim() || "";
}

// Test keys are prefixed `creem_test_`; live keys `creem_`. Pick the matching host.
export function creemApiBase(): string {
  return creemApiKey().startsWith("creem_test_")
    ? "https://test-api.creem.io/v1"
    : "https://api.creem.io/v1";
}

export function creemProductIdForPlan(plan: CreemPlan): string {
  const name = plan === "PRO" ? "CREEM_PRO_PRODUCT_ID" : "CREEM_PLUS_PRODUCT_ID";
  return Netlify.env.get(name)?.trim() || "";
}

// Map a product id seen in a webhook back to our plan.
export function planForCreemProductId(productId: string | undefined | null): CreemPlan | null {
  const id = (productId || "").trim();
  if (!id) return null;
  if (id === Netlify.env.get("CREEM_PRO_PRODUCT_ID")?.trim()) return "PRO";
  if (id === Netlify.env.get("CREEM_PLUS_PRODUCT_ID")?.trim()) return "PLUS";
  return null;
}

export type CreemCheckoutResult =
  | { ok: true; url: string; id?: string }
  | { ok: false; status: number; code: string; message: string };

export async function createCreemCheckout(params: {
  plan: CreemPlan;
  userId: string;
  email?: string;
  successUrl: string;
}): Promise<CreemCheckoutResult> {
  const apiKey = creemApiKey();
  if (!apiKey) {
    return { ok: false, status: 503, code: "CREEM_NOT_CONFIGURED", message: "Payments are not configured yet (set CREEM_API_KEY)." };
  }
  const productId = creemProductIdForPlan(params.plan);
  if (!productId) {
    return { ok: false, status: 503, code: "CREEM_PRODUCT_MISSING", message: `Missing product id (set CREEM_${params.plan}_PRODUCT_ID).` };
  }

  let res: Response;
  try {
    res = await fetch(`${creemApiBase()}/checkouts`, {
      method: "POST",
      headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: productId,
        success_url: params.successUrl,
        ...(params.email ? { customer: { email: params.email } } : {}),
        // Echoed back in every webhook so we can grant the right user.
        metadata: { userId: params.userId, plan: params.plan },
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
