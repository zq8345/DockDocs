import type { Config, Context } from "@netlify/functions";
import { json, requireBillingUser } from "./_shared/billing-auth";
import { creemApiKey, creemApiBase, creemProductIdForPlan, type CreemPlan } from "./_shared/creem";
import { readSubscriptionByUserId } from "./_shared/billing-store";

declare const Netlify: { env: { get(name: string): string | undefined } };

// ⚠️ TEMPORARY DIAGNOSTIC — remove after the Path 1 vs Path 2 decision.
//
// Tests whether Creem's update-subscription endpoint (POST /v1/subscriptions/{id}
// with an items[] array) performs a CROSS-INTERVAL change (caller's current
// recurring plan → the ANNUAL product) that the simpler /upgrade wrapper rejects.
// Returns the full Creem trace (GET item id → POST items-update → GET result) so we
// can read the real HTTP status + body + resulting subscription state.
//
// Gated to ONE email via the BILLING_DIAG_EMAIL env (fail-closed: unset → 403), and
// it only ever touches the CALLER's own subscription. The Creem API key stays
// server-side. NOTE: on success this performs a REAL prorated upgrade of the
// caller's own subscription — that is the intended test (a genuine upgrade).

export default async (req: Request, _ctx: Context) => {
  if (req.method !== "POST") {
    return json({ ok: false, code: "METHOD_NOT_ALLOWED" }, 405, { Allow: "POST" });
  }

  const auth = await requireBillingUser(req);
  if (!auth.ok) return auth.response;

  // Allowlist gate — only the configured email may run this real-upgrade test.
  const allowed = Netlify.env.get("BILLING_DIAG_EMAIL")?.trim().toLowerCase();
  const email = (auth.user.email || "").trim().toLowerCase();
  if (!allowed || !email || email !== allowed) {
    return json(
      { ok: false, code: "DIAG_FORBIDDEN", callerEmail: email || null, note: "Set BILLING_DIAG_EMAIL to this email to enable." },
      403,
    );
  }

  const apiKey = creemApiKey();
  if (!apiKey) return json({ ok: false, code: "CREEM_NOT_CONFIGURED" }, 503);

  const current = await readSubscriptionByUserId(auth.user.id);
  const subId = current?.stripeSubscriptionId;
  if (!current || current.plan === "FREE" || !subId) {
    return json(
      { ok: false, code: "NO_RECURRING_SUB", current: { plan: current?.plan ?? null, interval: current?.interval ?? null, subId: subId ?? null } },
      409,
    );
  }
  if (current.interval === "lifetime") {
    return json({ ok: false, code: "IS_LIFETIME", note: "Caller is on lifetime; nothing to upgrade." }, 409);
  }

  // Target = caller's current plan, ANNUAL interval (the cross-interval case).
  const targetProductId = creemProductIdForPlan(current.plan as CreemPlan, "annual");
  if (!targetProductId) {
    return json({ ok: false, code: "NO_TARGET_PRODUCT", plan: current.plan, note: "CREEM_<PLAN>_ANNUAL_PRODUCT_ID unset?" }, 503);
  }

  const base = creemApiBase();
  const getHeaders = { "x-api-key": apiKey };
  const postHeaders = { "x-api-key": apiKey, "Content-Type": "application/json" };
  const subUrl = `${base}/subscriptions/${encodeURIComponent(subId)}`; // path form — for the POST update (Creem: POST /v1/subscriptions/{id})
  // Creem RETRIEVE is query-param form (path form 404s — confirmed from the Creem OpenAPI spec: GET /v1/subscriptions?subscription_id=...).
  const getUrl = `${base}/subscriptions?subscription_id=${encodeURIComponent(subId)}`;

  // 1) GET the subscription → find the existing item id + current product.
  const getRes = await fetch(getUrl, { headers: getHeaders });
  const getBody = (await getRes.json().catch(() => null)) as Record<string, unknown> | null;
  const items = (getBody?.items ??
    (getBody?.subscription as Record<string, unknown> | undefined)?.items) as
    | Array<Record<string, unknown>>
    | undefined;
  const itemId = items?.[0]?.id as string | undefined;

  if (!itemId) {
    // Can't form the items-update without the item id — return the raw GET so we
    // can learn the actual items shape and adjust.
    return json({ ok: true, step: "GET_ONLY", note: "No item id found — inspect getBody for the items shape.", subId, targetProductId, getStatus: getRes.status, getBody }, 200);
  }

  // 2) POST update-subscription with items[] (REAL prorated upgrade if supported).
  const updateRequest = {
    items: [{ id: itemId, product_id: targetProductId }],
    update_behavior: "proration-charge-immediately",
  };
  const postRes = await fetch(subUrl, { method: "POST", headers: postHeaders, body: JSON.stringify(updateRequest) });
  const postBody = await postRes.json().catch(() => null);

  // 3) GET again → resulting subscription state (did product/interval change?).
  const getRes2 = await fetch(getUrl, { headers: getHeaders });
  const resultSubscription = await getRes2.json().catch(() => null);

  return json(
    {
      ok: true,
      subId,
      currentPlan: current.plan,
      currentInterval: current.interval ?? null,
      targetProductId,
      sentItemId: itemId,
      updateRequest,
      postStatus: postRes.status,
      postBody,
      resultStatus: getRes2.status,
      resultSubscription,
    },
    200,
  );
};

export const config: Config = { path: "/api/billing/diag-items-upgrade", method: ["POST"] };
