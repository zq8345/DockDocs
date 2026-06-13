"use client";

import { useState } from "react";
import { createBillingCheckoutSession } from "@/lib/subscription-runtime";
import type { PaidSubscriptionPlan } from "@/lib/billing-config";

// Inline upsell card shown when a free user hits a daily cap. Replaces the old
// dead-end text message with a clickable CTA that goes straight to checkout —
// the conversion moment the funnel was missing. Soft, not a blocking modal.
export function UpgradePrompt({
  locale = "en",
  limit,
}: {
  locale?: "en" | "zh";
  limit: number;
}) {
  const zh = locale === "zh";
  const [loading, setLoading] = useState<PaidSubscriptionPlan | "">("");

  async function upgrade(plan: PaidSubscriptionPlan) {
    setLoading(plan);
    try {
      await createBillingCheckoutSession(plan); // redirects to checkout on success
    } catch {
      if (typeof window !== "undefined") window.location.href = "/account";
    }
  }

  return (
    <div className="mt-4 rounded-[var(--radius-lg)] border border-[color:var(--line-strong)] bg-[color:var(--surface)] p-5">
      <p className="text-[15px] font-semibold text-[color:var(--foreground)]">
        {zh ? "已达今天的免费上限" : "You've hit today's free limit"}
      </p>
      <p className="mt-1.5 text-[13.5px] leading-6 text-[color:var(--muted)]">
        {zh
          ? `免费版每天 ${limit} 次。升级解锁更高额度和全部 AI 高级功能。`
          : `The free plan allows ${limit}/day. Upgrade for higher limits and every premium AI feature.`}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => upgrade("PLUS")}
          disabled={loading === "PLUS"}
          className="inline-flex h-10 items-center justify-center rounded-full bg-[color:var(--accent)] px-5 text-[13.5px] font-medium transition hover:bg-[color:var(--accent-hover)] disabled:opacity-60"
        >
          {loading === "PLUS"
            ? zh
              ? "跳转中…"
              : "Redirecting…"
            : zh
              ? "升级 Plus · $5/月"
              : "Upgrade to Plus · $5/mo"}
        </button>
        <a
          href={zh ? "/zh/pricing" : "/pricing"}
          className="text-[13px] font-medium text-[color:var(--accent)] transition hover:text-[color:var(--accent-strong)]"
        >
          {zh ? "查看全部方案" : "See all plans"}
        </a>
      </div>
    </div>
  );
}
