/**
 * Thin wrapper around window.gtag so every caller gets type safety and
 * no-op behaviour when GA4 is not configured (NEXT_PUBLIC_GA_ID unset).
 *
 * Usage:
 *   import { trackEvent } from "@/lib/analytics";
 *   trackEvent("tool_complete", { tool: "compress-pdf", locale: "en" });
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>,
) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  }
}

// ── Typed helpers for the core conversion funnel ──────────────────────────

/** Call when a user successfully downloads a processed file from any tool. */
export function trackToolComplete(tool: string, locale?: string) {
  trackEvent("tool_complete", { tool, locale: locale ?? "en" });
}

/** Call when a user signs up / first signs in via OAuth. */
export function trackSignUp(method: "google" | "microsoft" | "email") {
  trackEvent("sign_up", { method });
}

/** Call when a user clicks the upgrade / checkout button. */
export function trackBeginCheckout(plan: string) {
  trackEvent("begin_checkout", { plan });
}

/** Call on the success page after a confirmed purchase. */
export function trackPurchase(plan: string, value?: number) {
  trackEvent("purchase", { plan, ...(value != null ? { value, currency: "USD" } : {}) });
}
