"use client";

import { useState } from "react";
import { createBillingCheckoutSession } from "@/lib/subscription-runtime";
import type { PaidSubscriptionPlan } from "@/lib/billing-config";

type PromptLocale = "en" | "zh" | "es" | "pt" | "fr";

const STR: Record<
  PromptLocale,
  { title: string; body: (n: number) => string; cta: string; redir: string; all: string; pricing: string }
> = {
  en: {
    title: "You've hit today's free limit",
    body: (n) => `The free plan allows ${n}/day. Upgrade for higher limits and every premium AI feature.`,
    cta: "Upgrade to Plus · $5/mo",
    redir: "Redirecting…",
    all: "See all plans",
    pricing: "/pricing",
  },
  zh: {
    title: "已达今天的免费上限",
    body: (n) => `免费版每天 ${n} 次。升级解锁更高额度和全部 AI 高级功能。`,
    cta: "升级 Plus · $5/月",
    redir: "跳转中…",
    all: "查看全部方案",
    pricing: "/zh/pricing",
  },
  es: {
    title: "Has alcanzado el límite gratuito de hoy",
    body: (n) => `El plan gratuito permite ${n}/día. Mejora para más capacidad y todas las funciones de IA premium.`,
    cta: "Mejorar a Plus · $5/mes",
    redir: "Redirigiendo…",
    all: "Ver todos los planes",
    pricing: "/es/pricing",
  },
  pt: {
    title: "Você atingiu o limite gratuito de hoje",
    body: (n) => `O plano gratuito permite ${n}/dia. Faça upgrade para mais capacidade e todos os recursos de IA premium.`,
    cta: "Upgrade para Plus · $5/mês",
    redir: "Redirecionando…",
    all: "Ver todos os planos",
    pricing: "/pricing",
  },
  fr: {
    title: "Vous avez atteint la limite gratuite du jour",
    body: (n) => `Le plan gratuit permet ${n}/jour. Passez à la version supérieure pour des limites plus élevées et toutes les fonctionnalités IA premium.`,
    cta: "Passer à Plus · 5 $/mois",
    redir: "Redirection…",
    all: "Voir tous les plans",
    pricing: "/fr/pricing",
  },
};

// Inline upsell card shown when a free user hits a daily cap. Replaces the old
// dead-end text message with a clickable CTA that goes straight to checkout —
// the conversion moment the funnel was missing. Soft, not a blocking modal.
export function UpgradePrompt({
  locale = "en",
  limit,
}: {
  locale?: PromptLocale;
  limit: number;
}) {
  const t = STR[locale] ?? STR.en;
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
      <p className="text-[15px] font-semibold text-[color:var(--foreground)]">{t.title}</p>
      <p className="mt-1.5 text-[13.5px] leading-6 text-[color:var(--muted)]">{t.body(limit)}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => upgrade("PLUS")}
          disabled={loading === "PLUS"}
          className="inline-flex h-10 items-center justify-center rounded-full bg-[color:var(--accent)] px-5 text-[13.5px] font-medium transition hover:bg-[color:var(--accent-hover)] disabled:opacity-60"
        >
          {loading === "PLUS" ? t.redir : t.cta}
        </button>
        <a
          href={t.pricing}
          className="text-[13px] font-medium text-[color:var(--accent)] transition hover:text-[color:var(--accent-strong)]"
        >
          {t.all}
        </a>
      </div>
    </div>
  );
}
