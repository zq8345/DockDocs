"use client";

import { useState } from "react";
import { createBillingCheckoutSession } from "@/lib/subscription-runtime";
import type { PaidSubscriptionPlan } from "@/lib/billing-config";
import { deepHant } from "@/lib/zh-hant";
import { localizedPath } from "@/lib/i18n";
import { useWorkspaceNav } from "@/components/WorkspaceNavContext";

// Locales with their own copy literals (Record keys). zh-Hant derives from zh.
// Links are NOT in this table — they're built with localizedPath at render
// time (hand-written per-locale paths drifted: pt lost its prefix, zh-Hant
// inherited zh's, ko fell back to English entirely).
type PromptLocale = "en" | "zh" | "es" | "pt" | "fr" | "ja" | "de" | "ko";
type PromptLocaleInput = PromptLocale | "zh-Hant";

const STR: Record<
  PromptLocale,
  { title: string; body: (n: number) => string; cta: string; redir: string; all: string }
> = {
  en: {
    title: "You've hit today's free limit",
    body: (n) => `The free plan allows ${n}/day. Upgrade for higher limits and every premium AI feature.`,
    cta: "Upgrade to Plus · $9/mo",
    redir: "Redirecting…",
    all: "See all plans",
  },
  zh: {
    title: "已达今天的免费上限",
    body: (n) => `免费版每天 ${n} 次。升级解锁更高额度和全部 AI 高级功能。`,
    cta: "升级 Plus · $9/月",
    redir: "跳转中…",
    all: "查看全部方案",
  },
  es: {
    title: "Has alcanzado el límite gratuito de hoy",
    body: (n) => `El plan gratuito permite ${n}/día. Mejora para más capacidad y todas las funciones de IA premium.`,
    cta: "Mejorar a Plus · $9/mes",
    redir: "Redirigiendo…",
    all: "Ver todos los planes",
  },
  pt: {
    title: "Você atingiu o limite gratuito de hoje",
    body: (n) => `O plano gratuito permite ${n}/dia. Faça upgrade para mais capacidade e todos os recursos de IA premium.`,
    cta: "Upgrade para Plus · $9/mês",
    redir: "Redirecionando…",
    all: "Ver todos os planos",
  },
  fr: {
    title: "Vous avez atteint la limite gratuite du jour",
    body: (n) => `Le plan gratuit permet ${n}/jour. Passez à la version supérieure pour des limites plus élevées et toutes les fonctionnalités IA premium.`,
    cta: "Passer à Plus · 9 $/mois",
    redir: "Redirection…",
    all: "Voir tous les plans",
  },
  ja: {
    title: "本日の無料利用上限に達しました",
    body: (n) => `無料プランは 1 日あたり ${n} 回までです。アップグレードすると上限が増え、すべてのプレミアム AI 機能をご利用いただけます。`,
    cta: "Plus にアップグレード · 月額 $9",
    redir: "リダイレクト中…",
    all: "すべてのプランを見る",
  },
  de: {
    title: "Sie haben das heutige Gratis-Limit erreicht",
    body: (n) => `Der kostenlose Plan erlaubt ${n}/Tag. Führen Sie ein Upgrade durch für höhere Limits und alle Premium-KI-Funktionen.`,
    cta: "Upgrade auf Plus · $9/Monat",
    redir: "Weiterleitung…",
    all: "Alle Pläne ansehen",
  },
  ko: {
    title: "오늘의 무료 한도에 도달했습니다",
    body: (n) => `무료 플랜은 하루 ${n}회까지입니다. 업그레이드하면 더 높은 한도와 모든 프리미엄 AI 기능을 이용할 수 있습니다.`,
    cta: "Plus로 업그레이드 · 월 $9",
    redir: "이동 중…",
    all: "모든 플랜 보기",
  },
};

// Inline upsell card shown when a free user hits a daily cap. Replaces the old
// dead-end text message with a clickable CTA that goes straight to checkout —
// the conversion moment the funnel was missing. Soft, not a blocking modal.
export function UpgradePrompt({
  locale = "en",
  limit,
}: {
  locale?: PromptLocaleInput;
  limit: number;
}) {
  const t = locale === "zh-Hant" ? deepHant(STR.zh) : (STR[locale] ?? STR.en);
  const [loading, setLoading] = useState<PaidSubscriptionPlan | "">("");

  const wsNav = useWorkspaceNav();
  async function upgrade(plan: PaidSubscriptionPlan) {
    setLoading(plan);
    try {
      await createBillingCheckoutSession(plan); // redirects to checkout on success
    } catch {
      if (wsNav) { wsNav("/workspace-account"); } else if (typeof window !== "undefined") { window.location.href = localizedPath(locale, "account"); }
    }
  }

  return (
    <div className="mt-4 rounded-[var(--radius-lg)] border border-[color:var(--line-strong)] bg-[color:var(--surface)] p-5">
      <p className="text-[15px] font-semibold text-[color:var(--foreground)]">{t.title}</p>
      <p className="mt-1.5 text-[13.5px] leading-6 text-[color:var(--muted)]">{t.body(limit)}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => upgrade("PRO")}
          disabled={loading === "PRO"}
          className="inline-flex h-10 items-center justify-center rounded-full bg-[color:var(--accent)] px-5 text-[13.5px] font-medium transition hover:bg-[color:var(--accent-hover)] disabled:opacity-60"
        >
          {loading === "PRO" ? t.redir : t.cta}
        </button>
        <a
          href={localizedPath(locale, "pricing")}
          className="text-[13px] font-medium text-[color:var(--accent)] transition hover:text-[color:var(--accent-strong)]"
        >
          {t.all}
        </a>
      </div>
    </div>
  );
}
