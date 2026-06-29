"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser, type AuthUser } from "@/lib/auth";
import {
  getSubscriptionSnapshot,
  createBillingCheckoutSession,
  startUpgradeCheckout,
  BillingError,
  type SubscriptionSnapshot,
} from "@/lib/subscription-runtime";
import { planPriceCents, type BillingInterval } from "@/lib/billing-config";
import { planBadge, planStatusText, type MembershipLocale } from "@/lib/membership-ui";
import { type AuthoredLocale, type RouteLocale, routeLocales, defaultLocale } from "@/lib/i18n";
import { deepHant } from "@/lib/zh-hant";

// Derived from the single price source — never hardcoded.
const MONTHLY_CENTS = planPriceCents("PRO", "monthly");
const ANNUAL_CENTS = planPriceCents("PRO", "annual");
const LIFETIME_CENTS = planPriceCents("PRO", "lifetime");
const ANNUAL_SAVINGS_PCT = Math.round(((MONTHLY_CENTS * 12 - ANNUAL_CENTS) / (MONTHLY_CENTS * 12)) * 100);
const ANNUAL_LIMIT = 500;

function fmtDollars(cents: number) {
  return `$${cents / 100}`;
}

const INTERVAL_RANK: Record<BillingInterval, number> = { monthly: 0, annual: 1, lifetime: 2 };

type UpgradeCopy = {
  heading: string;
  statusPrefix: string;
  loading: string;
  redirecting: string;
  monthly: string;
  annual: string;
  lifetime: string;
  perMonth: string;
  perYear: string;
  oneTime: string;
  savedBadge: string;
  popularBadge: string;
  limitedBadge: string;
  currentBadge: string;
  features: [string, string, string, string];
  subscribePro: string;
  currentPlan: string;
  billedAnnually: string;
  trust: string;
  error: string;
};

const COPY: Record<AuthoredLocale, UpgradeCopy> = {
  en: {
    heading: "Upgrade to Pro",
    statusPrefix: "Current plan",
    loading: "Loading…",
    redirecting: "Redirecting to checkout…",
    monthly: "Monthly",
    annual: "Annual",
    lifetime: "Lifetime",
    perMonth: "/mo",
    perYear: "/yr",
    oneTime: "one-time",
    savedBadge: `Save ${ANNUAL_SAVINGS_PCT}%`,
    popularBadge: "Most popular",
    limitedBadge: `${ANNUAL_LIMIT} lifetime slots`,
    currentBadge: "Current",
    features: ["Contract risk & AI Q&A", "Batch workflow automation", "All PDF tools", "7-day refund"],
    subscribePro: "Subscribe to Pro",
    currentPlan: "Current plan",
    billedAnnually: "billed annually",
    trust: "7-day refund · cancel anytime · Secure checkout by Creem",
    error: "Something went wrong. Please try again.",
  },
  zh: {
    heading: "升级到 Pro",
    statusPrefix: "当前套餐",
    loading: "加载中…",
    redirecting: "正在跳转到结账页…",
    monthly: "月付",
    annual: "年付",
    lifetime: "终身",
    perMonth: "/月",
    perYear: "/年",
    oneTime: "买断",
    savedBadge: `省 ${ANNUAL_SAVINGS_PCT}%`,
    popularBadge: "最受欢迎",
    limitedBadge: `限 ${ANNUAL_LIMIT} 个终身名额`,
    currentBadge: "当前",
    features: ["合同风险审查 & AI 问答", "批量工作流自动化", "全部 PDF 工具", "7 天无理由退款"],
    subscribePro: "订阅 Pro 会员",
    currentPlan: "当前套餐",
    billedAnnually: "按年计费",
    trust: "7 天退款 · 随时取消 · 由 Creem 安全结账",
    error: "出现错误，请重试。",
  },
  es: {
    heading: "Actualiza a Pro",
    statusPrefix: "Plan actual",
    loading: "Cargando…",
    redirecting: "Redirigiendo al pago…",
    monthly: "Mensual",
    annual: "Anual",
    lifetime: "De por vida",
    perMonth: "/mes",
    perYear: "/año",
    oneTime: "pago único",
    savedBadge: `Ahorra ${ANNUAL_SAVINGS_PCT}%`,
    popularBadge: "Más popular",
    limitedBadge: `${ANNUAL_LIMIT} cupos de por vida`,
    currentBadge: "Actual",
    features: ["Revisión de contratos & IA", "Automatización por lotes", "Todas las herramientas PDF", "Reembolso de 7 días"],
    subscribePro: "Suscribirse a Pro",
    currentPlan: "Plan actual",
    billedAnnually: "facturado anualmente",
    trust: "Reembolso de 7 días · cancela cuando quieras · Pago seguro con Creem",
    error: "Algo salió mal. Inténtalo de nuevo.",
  },
  pt: {
    heading: "Atualizar para Pro",
    statusPrefix: "Plano atual",
    loading: "Carregando…",
    redirecting: "Redirecionando para o pagamento…",
    monthly: "Mensal",
    annual: "Anual",
    lifetime: "Vitalício",
    perMonth: "/mês",
    perYear: "/ano",
    oneTime: "pagamento único",
    savedBadge: `Economize ${ANNUAL_SAVINGS_PCT}%`,
    popularBadge: "Mais popular",
    limitedBadge: `${ANNUAL_LIMIT} vagas vitalícias`,
    currentBadge: "Atual",
    features: ["Revisão de contratos & IA", "Automação em lote", "Todas as ferramentas PDF", "Reembolso em 7 dias"],
    subscribePro: "Assinar o Pro",
    currentPlan: "Plano atual",
    billedAnnually: "cobrado anualmente",
    trust: "Reembolso em 7 dias · cancele quando quiser · Checkout seguro com Creem",
    error: "Algo deu errado. Tente novamente.",
  },
  fr: {
    heading: "Passer à Pro",
    statusPrefix: "Forfait actuel",
    loading: "Chargement…",
    redirecting: "Redirection vers le paiement…",
    monthly: "Mensuel",
    annual: "Annuel",
    lifetime: "À vie",
    perMonth: "/mois",
    perYear: "/an",
    oneTime: "paiement unique",
    savedBadge: `Économisez ${ANNUAL_SAVINGS_PCT}%`,
    popularBadge: "Le plus populaire",
    limitedBadge: `${ANNUAL_LIMIT} accès à vie`,
    currentBadge: "Actuel",
    features: ["Révision de contrats & IA", "Automatisation par lot", "Tous les outils PDF", "Remboursement 7 jours"],
    subscribePro: "S'abonner à Pro",
    currentPlan: "Forfait actuel",
    billedAnnually: "facturé annuellement",
    trust: "Remboursement 7 jours · annulation à tout moment · Paiement sécurisé par Creem",
    error: "Une erreur s'est produite. Réessayez.",
  },
  ja: {
    heading: "Pro にアップグレード",
    statusPrefix: "現在のプラン",
    loading: "読み込み中…",
    redirecting: "お支払いページへ移動中…",
    monthly: "月額",
    annual: "年額",
    lifetime: "買い切り",
    perMonth: "/月",
    perYear: "/年",
    oneTime: "一括払い",
    savedBadge: `${ANNUAL_SAVINGS_PCT}% お得`,
    popularBadge: "人気 No.1",
    limitedBadge: `終身 ${ANNUAL_LIMIT} 枠限定`,
    currentBadge: "現在",
    features: ["契約リスク審査 & AI 問答", "一括ワークフロー自動化", "全 PDF ツール", "7日間返金"],
    subscribePro: "Pro を購読する",
    currentPlan: "現在のプラン",
    billedAnnually: "年払い",
    trust: "7日間返金 · いつでもキャンセル可 · Creem による安全なチェックアウト",
    error: "エラーが発生しました。再度お試しください。",
  },
  de: {
    heading: "Auf Pro upgraden",
    statusPrefix: "Aktueller Tarif",
    loading: "Wird geladen…",
    redirecting: "Weiterleitung zur Zahlung…",
    monthly: "Monatlich",
    annual: "Jährlich",
    lifetime: "Lebenslang",
    perMonth: "/Monat",
    perYear: "/Jahr",
    oneTime: "Einmalzahlung",
    savedBadge: `${ANNUAL_SAVINGS_PCT}% sparen`,
    popularBadge: "Am beliebtesten",
    limitedBadge: `${ANNUAL_LIMIT} Lebenszeit-Plätze`,
    currentBadge: "Aktuell",
    features: ["Vertragsrisiko & KI-Fragen", "Batch-Workflow-Automatisierung", "Alle PDF-Tools", "7 Tage Rückerstattung"],
    subscribePro: "Pro abonnieren",
    currentPlan: "Aktueller Tarif",
    billedAnnually: "jährlich abgerechnet",
    trust: "7 Tage Rückerstattung · jederzeit kündbar · Sichere Zahlung über Creem",
    error: "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.",
  },
  ko: {
    heading: "Pro로 업그레이드",
    statusPrefix: "현재 플랜",
    loading: "불러오는 중…",
    redirecting: "결제 페이지로 이동 중…",
    monthly: "월간",
    annual: "연간",
    lifetime: "평생",
    perMonth: "/월",
    perYear: "/년",
    oneTime: "일회 결제",
    savedBadge: `${ANNUAL_SAVINGS_PCT}% 절약`,
    popularBadge: "가장 인기 있음",
    limitedBadge: `평생 슬롯 ${ANNUAL_LIMIT}개`,
    currentBadge: "현재",
    features: ["계약 리스크 & AI 질문", "일괄 워크플로 자동화", "모든 PDF 도구", "7일 환불"],
    subscribePro: "Pro 구독하기",
    currentPlan: "현재 플랜",
    billedAnnually: "연간 청구",
    trust: "7일 환불 · 언제든지 취소 · Creem 안전 결제",
    error: "문제가 발생했습니다. 다시 시도해 주세요.",
  },
};

function getLocale(): RouteLocale {
  try {
    const saved = localStorage.getItem("dockdocs-lang");
    if (saved && (routeLocales as readonly string[]).includes(saved)) return saved as RouteLocale;
  } catch {}
  return defaultLocale;
}

function lh(href: string, locale: RouteLocale): string {
  return locale === defaultLocale ? href : `/${locale}${href}`;
}

export function UpgradePage() {
  const router = useRouter();
  const [locale, setLocale] = useState<RouteLocale>("en");
  const [authUser, setAuthUser] = useState<AuthUser | null | "loading">("loading");
  const [snapshot, setSnapshot] = useState<SubscriptionSnapshot | null | "loading">("loading");
  const [selected, setSelected] = useState<BillingInterval>("annual");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLocale(getLocale());
    Promise.all([getUser(), getSubscriptionSnapshot()]).then(([user, snap]) => {
      setAuthUser(user);
      setSnapshot(snap);
      if (!user) router.replace(lh("/account", getLocale()));
    }).catch(() => {
      setAuthUser(null);
      setSnapshot(null);
      router.replace(lh("/account", getLocale()));
    });
  }, [router]);

  const c = locale === "zh-Hant" ? (deepHant(COPY.zh) as UpgradeCopy) : COPY[locale as AuthoredLocale] ?? COPY.en;

  if (authUser === "loading" || snapshot === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[color:var(--line)] border-t-[color:var(--accent)]" />
      </div>
    );
  }

  if (!authUser) return null;

  const isTrial = snapshot?.trial?.status === "trialing";
  const isFree = !snapshot || snapshot.displayName === "Free";
  const currentInterval: BillingInterval | undefined = snapshot?.record.interval;
  const currentRank = currentInterval ? INTERVAL_RANK[currentInterval] : -1;
  const mloc = locale as MembershipLocale;

  const trialDaysRemaining = isTrial && snapshot?.trial?.expiresAt
    ? Math.max(0, Math.ceil((new Date(snapshot.trial.expiresAt).getTime() - Date.now()) / 86400000))
    : undefined;

  const statusBadge = snapshot ? planBadge(isTrial ? "Pro" : snapshot.displayName, snapshot.record.interval, mloc) : null;
  const statusLine = snapshot
    ? planStatusText({
        displayName: isTrial ? "Pro" : snapshot.displayName,
        interval: snapshot.record.interval,
        status: isTrial ? "trialing" : snapshot.record.status,
        currentPeriodEnd: snapshot.record.currentPeriodEnd,
        cancelAtPeriodEnd: snapshot.record.cancelAtPeriodEnd,
        daysRemaining: trialDaysRemaining,
      }, mloc)
    : "";

  // Bottom CTA logic based on selected card + user state.
  const selectedIsCurrent = !isTrial && selected === currentInterval;
  const canCheckout = isTrial || isFree || INTERVAL_RANK[selected] > currentRank;

  async function handleCheckout() {
    if (checkoutLoading || selectedIsCurrent) return;
    setCheckoutLoading(true);
    setError("");
    try {
      if (isTrial || isFree) {
        await createBillingCheckoutSession("PRO", selected);
      } else {
        await startUpgradeCheckout("PRO", selected);
      }
    } catch (err) {
      const msg = err instanceof BillingError ? err.message : c.error;
      setError(msg);
      setCheckoutLoading(false);
    }
  }

  const CARDS: { interval: BillingInterval; name: string; price: number; sub: string; badge: string | null; highlighted: boolean }[] = [
    {
      interval: "monthly",
      name: c.monthly,
      price: MONTHLY_CENTS,
      sub: fmtDollars(MONTHLY_CENTS) + c.perMonth,
      badge: null,
      highlighted: false,
    },
    {
      interval: "annual",
      name: c.annual,
      price: ANNUAL_CENTS,
      sub: `${fmtDollars(Math.round(ANNUAL_CENTS / 12))}${c.perMonth} · ${c.billedAnnually}`,
      badge: c.savedBadge,
      highlighted: true,
    },
    {
      interval: "lifetime",
      name: c.lifetime,
      price: LIFETIME_CENTS,
      sub: c.oneTime,
      badge: c.limitedBadge,
      highlighted: false,
    },
  ];

  return (
    <div className="mx-auto min-h-screen max-w-4xl px-6 py-12">
      <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-[color:var(--foreground)]">
        {c.heading}
      </h1>

      {/* Current plan status */}
      {statusBadge && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-[13px] text-[color:var(--muted)]">{c.statusPrefix}:</span>
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusBadge.className}`}>{statusBadge.label}</span>
          {statusLine && <span className="text-[13px] text-[color:var(--muted)]">· {statusLine}</span>}
        </div>
      )}

      {/* Plan cards — click to select */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {CARDS.map(({ interval, name, price, sub, badge, highlighted }) => {
          const isSelected = selected === interval;
          const isCurrent = !isTrial && interval === currentInterval;

          return (
            <button
              key={interval}
              type="button"
              onClick={() => setSelected(interval)}
              className={`relative flex flex-col rounded-[var(--radius)] border p-5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] ${
                isSelected
                  ? "border-[color:var(--accent)] bg-[color:var(--surface)]"
                  : "border-[color:var(--line)] bg-[color:var(--surface-subtle)] hover:border-[color:var(--line-strong)]"
              }`}
            >
              {/* Popular badge */}
              {highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[color:var(--accent)] px-2.5 py-0.5 text-[10px] font-semibold text-[color:var(--on-accent)]">
                  {c.popularBadge}
                </span>
              )}

              {/* Interval badge */}
              {badge && !highlighted && (
                <span className="mb-2 inline-block rounded border border-[color:var(--line)] px-1.5 py-0.5 text-[10px] text-[color:var(--muted)]">
                  {badge}
                </span>
              )}

              {/* Savings badge on highlighted */}
              {badge && highlighted && (
                <span className="mb-2 inline-block rounded bg-[color:var(--accent)]/15 px-1.5 py-0.5 text-[10px] font-semibold text-[color:var(--accent)]">
                  {badge}
                </span>
              )}

              <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[color:var(--muted)]">{name}</p>
              <p className="mt-1.5 text-[32px] font-semibold tracking-[-0.02em] text-[color:var(--foreground)]">
                {fmtDollars(price)}
              </p>
              <p className="text-[11px] text-[color:var(--faint)]">{sub}</p>

              {/* Features */}
              <ul className="mt-4 flex-1 space-y-1.5">
                {c.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[12px] text-[color:var(--foreground)]">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0 text-[color:var(--accent)]">
                      <path d="M3 8.5l3.2 3.2L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              {/* "Current" label inside card if this interval matches user's active plan */}
              {isCurrent && (
                <div className="mt-4 rounded-[var(--radius-sm)] border border-[color:var(--line)] py-1.5 text-center text-[12px] text-[color:var(--muted)]">
                  {c.currentBadge}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Unified CTA button */}
      <div className="mt-6">
        {selectedIsCurrent ? (
          <div className="inline-flex items-center justify-center rounded-[var(--radius)] border border-[color:var(--line)] px-8 py-3 text-[14px] font-medium text-[color:var(--muted)]">
            {c.currentPlan}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => void handleCheckout()}
            disabled={!canCheckout || checkoutLoading}
            className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-[color:var(--accent)] px-8 py-3 text-[14px] font-semibold text-[color:var(--on-accent)] transition hover:opacity-90 disabled:opacity-50"
          >
            {checkoutLoading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                {c.redirecting}
              </>
            ) : (
              c.subscribePro
            )}
          </button>
        )}
      </div>

      {/* Trust row */}
      <div className="mt-4 flex flex-wrap items-center gap-x-1 gap-y-1 text-[11px] text-[color:var(--faint)]">
        <svg width="10" height="10" viewBox="0 0 16 16" fill="none" className="shrink-0 text-[color:var(--accent)]">
          <path d="M3 8.5l3.2 3.2L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>{c.trust}</span>
      </div>

      {error && (
        <p className="mt-4 rounded-[var(--radius-sm)] bg-[color:var(--error-surface)] px-3 py-2 text-[13px] text-[color:var(--error)]">
          {error}
        </p>
      )}
    </div>
  );
}
