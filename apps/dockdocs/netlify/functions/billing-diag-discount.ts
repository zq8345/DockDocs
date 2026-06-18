import type { Config, Context } from "@netlify/functions";
import { creemProductIdForPlan, createCreemDiscount, createCreemCheckout } from "./_shared/creem";

declare const Netlify: { env: { get(name: string): string | undefined } };
declare const crypto: { randomUUID(): string };

// ⚠️ TEMPORARY — remove once the Creem fixed-discount AMOUNT UNIT is confirmed.
//
// The docs are ambiguous (the endpoint example shows `amount: 20` ≈ dollars, but the
// discounts guide + SDK example say "in cents"). This sends a KNOWN test discount of
// amount=500 on the Pro-monthly product ($20.00) and a checkout carrying it, so the
// real unit can be read without another user-facing round:
//   • checkout total $15.00  → amount is CENTS (500 = $5 off $20) → keep amountCents.
//   • discount-create error "exceeds price" / total $0 / "$500 off" → amount is DOLLARS
//     → change createCreemDiscount call sites to send amountCents/100.
//
// Admin-gated (reuses DOCKDOCS_METRICS_TOKEN). The test discount is single-use + 1h
// expiry + product-scoped; the checkout is never paid. Curl:
//   curl -s -X POST https://dockdocs.app/api/billing/diag-discount \
//        -H "authorization: Bearer $DOCKDOCS_METRICS_TOKEN" | jq
const TEST_AMOUNT = 500; // 500 = $5.00 if cents; $500.00 if dollars (would exceed $20)

export default async (req: Request, _ctx: Context) => {
  const expected = Netlify.env.get("DOCKDOCS_METRICS_TOKEN")?.trim();
  const header = req.headers.get("authorization") || "";
  const provided = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!expected || !provided || !constantTimeEqual(provided, expected)) {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }

  const productId = creemProductIdForPlan("PRO", "monthly");
  if (!productId) return json({ ok: false, code: "NO_PRODUCT", note: "CREEM_PRO_PRODUCT_ID unset?" }, 503);

  const code = crypto.randomUUID().replace(/-/g, "").slice(0, 14).toUpperCase();
  const expiryDateIso = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  const disc = await createCreemDiscount({ amountCents: TEST_AMOUNT, productId, code, expiryDateIso });
  if (!disc.ok) {
    return json(
      {
        ok: true,
        verdict: "discount-create FAILED — read discountError.message ('exceeds price' ⇒ amount is DOLLARS).",
        amountSent: TEST_AMOUNT,
        productPrice: "$20.00 (Pro monthly)",
        discountError: { code: disc.code, message: disc.message },
      },
      200,
    );
  }

  const checkout = await createCreemCheckout({
    plan: "PRO",
    interval: "monthly",
    userId: "diag",
    successUrl: "https://dockdocs.app/account",
    discountCode: disc.code,
  });
  return json(
    {
      ok: true,
      amountSent: TEST_AMOUNT,
      productPrice: "$20.00 (Pro monthly)",
      interpret: "Open checkoutUrl: total $15.00 ⇒ CENTS (keep amountCents). total $0 / error / '$500 off' ⇒ DOLLARS (use amountCents/100).",
      discountCode: disc.code,
      checkoutUrl: checkout.ok ? checkout.url : null,
      checkoutError: checkout.ok ? null : { code: checkout.code, message: checkout.message },
    },
    200,
  );
};

export const config: Config = { path: "/api/billing/diag-discount", method: ["GET", "POST"] };

function constantTimeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  if (ab.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ab.length; i += 1) diff |= ab[i] ^ bb[i];
  return diff === 0;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}
