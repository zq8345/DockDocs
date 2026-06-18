// Unit tests for the Creem webhook decision logic — the money / entitlement zone.
// Run with the built-in node test runner (no framework dep):
//   node --test apps/dockdocs/netlify/functions/_shared/webhook-decision.test.ts
// Covers the e5a89b0 BLOCKER guard (cancel-old must never wipe a fresh entitlement),
// both new-activate/old-cancel orderings, stale-event recency, portal-downgrade
// by-time (not rank), and the proration credit math (Joe's baseline).

import { test } from "node:test";
import assert from "node:assert/strict";
import { decideWebhookAction, type ExistingLite } from "./webhook-decision.ts";
import { planPriceCents } from "../../../lib/billing-config.ts";

const subA: ExistingLite = { plan: "PRO", interval: "monthly", stripeSubscriptionId: "subA", lastEventAt: 100 };
const subB: ExistingLite = { plan: "PRO", interval: "annual", stripeSubscriptionId: "subB", lastEventAt: 200 };

test("upgrade activation captures the old recurring sub to cancel", () => {
  const d = decideWebhookAction({
    eventType: "subscription.active", statusStr: "active", hasPlan: true,
    interval: "annual", subscriptionId: "subB", eventAt: 200, existing: subA,
  });
  assert.equal(d.action, "activate");
  assert.equal(d.action === "activate" && d.cancelOldSubId, "subA");
});

test("OLD sub cancellation after new activation is a no-op (e5a89b0 identity guard)", () => {
  // The old sub's subscription.canceled arrives after we've already written the new
  // sub (subB). subA != current subB → MUST ignore, never wipe the new entitlement.
  const d = decideWebhookAction({
    eventType: "subscription.canceled", statusStr: "", hasPlan: false,
    subscriptionId: "subA", eventAt: 300, existing: subB,
  });
  assert.equal(d.action, "ignore");
});

test("stale late OLD activation is ignored by recency", () => {
  const d = decideWebhookAction({
    eventType: "subscription.paid", statusStr: "active", hasPlan: true,
    interval: "monthly", subscriptionId: "subA", eventAt: 50, existing: subB,
  });
  assert.equal(d.action, "ignore");
});

test("lifetime activation captures the old recurring sub", () => {
  const d = decideWebhookAction({
    eventType: "checkout.completed", statusStr: "", hasPlan: true,
    interval: "lifetime", subscriptionId: "subL", eventAt: 200, existing: subA,
  });
  assert.equal(d.action, "activate");
  assert.equal(d.action === "activate" && d.cancelOldSubId, "subA");
});

test("portal downgrade (same sub, lower product) applies by time, not rank", () => {
  const d = decideWebhookAction({
    eventType: "subscription.update", statusStr: "active", hasPlan: true,
    interval: "monthly", subscriptionId: "subB", eventAt: 300, existing: subB,
  });
  assert.equal(d.action, "activate");
  assert.equal(d.action === "activate" && d.cancelOldSubId, undefined); // same sub → no cancel
});

test("first subscription (no existing) activates with no cancel", () => {
  const d = decideWebhookAction({
    eventType: "checkout.completed", statusStr: "", hasPlan: true,
    interval: "monthly", subscriptionId: "subX", eventAt: 10, existing: null,
  });
  assert.equal(d.action, "activate");
  assert.equal(d.action === "activate" && d.cancelOldSubId, undefined);
});

test("renewal of the same sub does not cancel itself", () => {
  const d = decideWebhookAction({
    eventType: "subscription.paid", statusStr: "active", hasPlan: true,
    interval: "annual", subscriptionId: "subB", eventAt: 300, existing: subB,
  });
  assert.equal(d.action, "activate");
  assert.equal(d.action === "activate" && d.cancelOldSubId, undefined);
});

test("cancellation of the user's CURRENT sub deactivates", () => {
  const d = decideWebhookAction({
    eventType: "subscription.canceled", statusStr: "", hasPlan: false,
    subscriptionId: "subB", eventAt: 300, existing: subB,
  });
  assert.equal(d.action, "deactivate");
});

test("proration credit = Joe's baseline (Pro-monthly day 17/30 → Pro-lifetime = $8.67 → pay $390.33)", () => {
  // Mirrors computeUpgradeQuote: clamp(round(oldPrice × remainingFraction), 0, newPrice−1).
  const oldPrice = planPriceCents("PRO", "monthly");
  const newPrice = planPriceCents("PRO", "lifetime");
  assert.equal(oldPrice, 2000);
  assert.equal(newPrice, 39900);
  const remainingFraction = 13 / 30;
  const credit = Math.max(0, Math.min(Math.round(oldPrice * remainingFraction), newPrice - 1));
  assert.equal(credit, 867); // $8.67
  assert.equal(newPrice - credit, 39033); // $390.33
});
