// Pure decision logic for the Creem subscription webhook — no IO, no Netlify deps,
// so it can be reviewed and unit-tested in isolation. Given the incoming event and
// the user's CURRENT stored subscription, it decides whether to activate / deactivate
// / ignore, and (on activate) whether a prior recurring sub must be cancelled.
//
// Three guards live here, in order:
//  1. classify  — subscription.update is decided by payload status, not assumed active.
//  2. recency   — out-of-order/stale events (event time <= last applied) are ignored
//                 (TIME-based, never plan-rank — a legit portal downgrade must apply).
//  3. identity  — a deactivate only applies to the user's CURRENT subscription, so the
//                 cancellation of a replaced/old sub can never wipe a fresh entitlement
//                 (the e5a89b0 BLOCKER class). On activate, an existing DIFFERENT
//                 recurring sub is captured for cancellation (the proration replace).

export const ACTIVATING = new Set([
  "checkout.completed",
  "subscription.active",
  "subscription.paid",
  "subscription.trialing",
]);
export const DEACTIVATING = new Set(["subscription.canceled", "subscription.expired"]);
// subscription.update is ambiguous — classified by status, not the event name.
export const CANCELING_STATUS = new Set([
  "canceled",
  "cancelled",
  "expired",
  "incomplete",
  "incomplete_expired",
  "unpaid",
]);
// Transient — a failed charge must NOT immediately revoke access.
export const HOLD_STATUS = new Set(["past_due"]);

export type ExistingLite = {
  plan: string;
  interval?: string;
  stripeSubscriptionId?: string;
  lastEventAt?: number;
} | null;

export type WebhookDecision =
  | { action: "ignore"; reason: string }
  | { action: "activate"; cancelOldSubId?: string }
  | { action: "deactivate" };

export function decideWebhookAction(input: {
  eventType: string;
  statusStr: string;
  hasPlan: boolean; // a product_id that mapped to one of our plans
  interval?: string;
  subscriptionId: string;
  eventAt?: number; // event.created_at (unix ms)
  existing: ExistingLite;
}): WebhookDecision {
  const { eventType, statusStr, hasPlan, subscriptionId, eventAt, existing } = input;

  // 1) classify
  let raw: "activate" | "deactivate" | "ignore";
  if (eventType === "subscription.update") {
    raw = CANCELING_STATUS.has(statusStr)
      ? "deactivate"
      : HOLD_STATUS.has(statusStr)
        ? "ignore"
        : hasPlan
          ? "activate"
          : "ignore";
  } else if (ACTIVATING.has(eventType)) {
    raw = hasPlan ? "activate" : "ignore";
  } else if (DEACTIVATING.has(eventType)) {
    raw = "deactivate";
  } else {
    raw = "ignore";
  }

  if (raw === "ignore") return { action: "ignore", reason: "unhandled-or-no-plan" };

  // 2) recency — ignore stale/out-of-order events. Only when BOTH timestamps exist
  // (graceful for records written before lastEventAt was tracked). TIME-based only.
  if (
    existing &&
    typeof eventAt === "number" &&
    typeof existing.lastEventAt === "number" &&
    eventAt <= existing.lastEventAt
  ) {
    return { action: "ignore", reason: "stale-event" };
  }

  if (raw === "activate") {
    // Capture the existing recurring sub this activation REPLACES, so it can be
    // cancelled (avoid double-charge). Generalized from lifetime-only to ALL
    // upgrades-from-recurring. Never a FREE or lifetime record, and never the same sub.
    let cancelOldSubId: string | undefined;
    if (
      existing &&
      existing.plan !== "FREE" &&
      existing.interval !== "lifetime" &&
      existing.stripeSubscriptionId &&
      existing.stripeSubscriptionId !== subscriptionId
    ) {
      cancelOldSubId = existing.stripeSubscriptionId;
    }
    return { action: "activate", cancelOldSubId };
  }

  // 3) deactivate — identity guard: only the user's CURRENT recurring sub may downgrade.
  const isCurrentSub = Boolean(
    subscriptionId && existing?.stripeSubscriptionId && subscriptionId === existing.stripeSubscriptionId,
  );
  if (existing && existing.plan !== "FREE" && existing.interval !== "lifetime" && isCurrentSub) {
    return { action: "deactivate" };
  }
  return { action: "ignore", reason: "deactivate-not-current-sub" };
}
