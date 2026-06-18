"use client";

import { useState } from "react";
import {
  getUpgradeQuote,
  startUpgradeCheckout,
  BillingError,
  type UpgradeQuote,
} from "@/lib/subscription-runtime";
import { billingErrorCopy, type MembershipLocale } from "@/lib/membership-ui";
import type { PaidSubscriptionPlan, BillingInterval } from "@/lib/billing-config";

type ConfirmState = { plan: PaidSubscriptionPlan; interval: BillingInterval; quote: UpgradeQuote };

export type UpgradeFlow = {
  confirm: ConfirmState | null;
  loading: boolean;
  error: string;
  beginUpgrade: (plan: PaidSubscriptionPlan, interval: BillingInterval) => Promise<void>;
  confirmUpgrade: () => Promise<void>;
  dismiss: () => void;
  clearError: () => void;
};

// Shared in-place proration upgrade flow: fetch the server-authoritative breakdown,
// show it (UpgradeConfirmModal), then on confirm redirect to the discounted checkout.
// Reused by the pricing page, the account page, and the nav account card so EVERY
// upgrade entry point pops the SAME breakdown instead of dumping the user on /pricing.
// Pure orchestration over the reviewed quote/checkout endpoints — no payment logic.
export function useUpgradeFlow(locale: MembershipLocale): UpgradeFlow {
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleErr(err: unknown) {
    const e = err instanceof BillingError ? err : null;
    const code = e?.code;
    const message = e?.message || (err instanceof Error ? err.message : "");
    console.error("[billing] upgrade failed:", code ?? "(no code)", "—", message);
    // Only a genuine auth failure should bounce to sign-in.
    if (e?.status === 401 || code === "UNAUTHORIZED" || code === "UNAUTHENTICATED") {
      if (typeof window !== "undefined") window.location.href = "/account";
      return;
    }
    setError(billingErrorCopy(code, message, locale));
  }

  async function beginUpgrade(plan: PaidSubscriptionPlan, interval: BillingInterval) {
    setLoading(true);
    setError("");
    try {
      const quote = await getUpgradeQuote(plan, interval);
      setConfirm({ plan, interval, quote });
    } catch (err) {
      handleErr(err);
    } finally {
      setLoading(false);
    }
  }

  async function confirmUpgrade() {
    if (!confirm) return;
    setLoading(true);
    setError("");
    try {
      await startUpgradeCheckout(confirm.plan, confirm.interval); // redirects on success
    } catch (err) {
      setConfirm(null);
      handleErr(err);
      setLoading(false);
    }
  }

  return {
    confirm,
    loading,
    error,
    beginUpgrade,
    confirmUpgrade,
    dismiss: () => setConfirm(null),
    clearError: () => setError(""),
  };
}

function intervalLabel(interval: string, locale: MembershipLocale): string {
  if (interval === "lifetime") return locale === "zh" ? "终身" : locale === "es" ? "De por vida" : locale === "pt" ? "Vitalício" : locale === "fr" ? "À vie" : "Lifetime";
  if (interval === "annual") return locale === "zh" ? "年付" : locale === "es" ? "Anual" : locale === "pt" ? "Anual" : locale === "fr" ? "Annuel" : "Yearly";
  return locale === "zh" ? "月付" : locale === "es" ? "Mensual" : locale === "pt" ? "Mensal" : locale === "fr" ? "Mensuel" : "Monthly";
}

// Headline benefits per (target) tier — shown when upgrading to a higher tier.
const PRO_BENEFITS: Record<MembershipLocale, string[]> = {
  en: ["Contract risk review", "Batch workflow automation", "API access", "Team workspace"],
  zh: ["合同风险审查", "批量工作流自动化", "API 接入", "团队工作区"],
  es: ["Revisión de riesgos de contratos", "Automatización de flujos por lotes", "Acceso a la API", "Espacio de equipo"],
  pt: ["Revisão de riscos de contratos", "Automação de fluxos em lote", "Acesso à API", "Espaço de equipe"],
  fr: ["Analyse des risques de contrats", "Automatisation des flux par lots", "Accès API", "Espace d'équipe"],
};

// The breakdown confirmation modal — "new price − unused credit = you pay" — shown
// before the redirect, so the credit is always visible (the 可溯源/honest promise).
export function UpgradeConfirmModal({ flow, locale }: { flow: UpgradeFlow; locale: MembershipLocale }) {
  const c = flow.confirm;
  if (!c) return null;
  const q = c.quote;
  const tt = (en: string, zh: string, es: string, pt: string, fr: string) =>
    locale === "zh" ? zh : locale === "es" ? es : locale === "pt" ? pt : locale === "fr" ? fr : en;
  const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  const targetName = c.plan === "PLUS" ? "Plus" : "Pro";
  const curName = q.currentPlan === "PRO" ? "Pro" : q.currentPlan === "PLUS" ? "Plus" : q.currentPlan;
  const isTierUp = c.plan === "PRO" && q.currentPlan === "PLUS";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onClick={() => !flow.loading && flow.dismiss()}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[color:var(--line-strong)] bg-[color:var(--surface-raised)] p-7 shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[18px] font-semibold tracking-[-0.01em]">
          {tt("Confirm your upgrade", "确认升级", "Confirmar tu mejora", "Confirmar seu upgrade", "Confirmer votre mise à niveau")}
        </p>

        {/* Breakdown — new price − unused credit = you pay */}
        <div className="mt-5 rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] p-4 text-[14px]">
          <div className="flex items-center justify-between">
            <span className="text-[color:var(--muted)]">{`${targetName} · ${intervalLabel(c.interval, locale)}`}</span>
            <span>{money(q.newPriceCents)}</span>
          </div>
          {q.creditCents > 0 && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-[color:var(--accent-strong)]">
                <span>{tt("Unused value (credit)", "未用价值（抵扣）", "Valor no usado (crédito)", "Valor não usado (crédito)", "Valeur non utilisée (crédit)")}</span>
                <span>{`−${money(q.creditCents)}`}</span>
              </div>
              <p className="mt-1 text-[11px] text-[color:var(--faint)]">
                {tt(
                  `From your ${curName} (${intervalLabel(q.currentInterval, locale)}) — ${q.remainingDays} unused day${q.remainingDays === 1 ? "" : "s"} credited`,
                  `来自你的 ${curName}·${intervalLabel(q.currentInterval, locale)} — 剩余 ${q.remainingDays} 天未用已折抵`,
                  `De tu ${curName} (${intervalLabel(q.currentInterval, locale)}) — ${q.remainingDays} día(s) sin usar acreditados`,
                  `Do seu ${curName} (${intervalLabel(q.currentInterval, locale)}) — ${q.remainingDays} dia(s) não usado(s) creditados`,
                  `De votre ${curName} (${intervalLabel(q.currentInterval, locale)}) — ${q.remainingDays} jour(s) non utilisé(s) crédités`,
                )}
              </p>
            </div>
          )}
          <div className="mt-3 flex items-center justify-between border-t border-[color:var(--line)] pt-3">
            <span className="text-[15px] font-semibold">{tt("You pay now", "现在支付", "Pagas ahora", "Você paga agora", "Vous payez")}</span>
            <span className="text-[22px] font-semibold tracking-[-0.01em]">{money(q.finalCents)}</span>
          </div>
        </div>

        {/* What you unlock (tier upgrade) — or the value of the term change */}
        {isTierUp ? (
          <div className="mt-5">
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[color:var(--faint)]">
              {tt("You'll unlock", "升级后解锁", "Desbloquearás", "Você desbloqueia", "Vous débloquez")}
            </p>
            <ul className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {PRO_BENEFITS[locale].map((b) => (
                <li key={b} className="flex items-start gap-2 text-[13px] text-[color:var(--foreground)]">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0 text-[color:var(--accent)]"><path d="M3 8.5l3.2 3.2L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        ) : c.interval === "lifetime" ? (
          <p className="mt-5 text-[13px] text-[color:var(--accent-strong)]">
            {tt("Pay once — yours forever, no more renewals.", "一次买断 — 永久使用，不再续费。", "Pago único — tuyo para siempre, sin renovaciones.", "Pague uma vez — seu para sempre, sem renovações.", "Paiement unique — à vous pour toujours, sans renouvellement.")}
          </p>
        ) : (
          <p className="mt-5 text-[13px] text-[color:var(--accent-strong)]">
            {tt("Switch to yearly and save ~40% vs monthly.", "切到年付，相比月付省约 40%。", "Cambia a anual y ahorra ~40% frente al mensual.", "Mude para anual e economize ~40% vs mensal.", "Passez à l'annuel et économisez ~40 % vs mensuel.")}
          </p>
        )}

        {/* Trust row */}
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-[color:var(--muted)]">
          {[
            tt("7-day refund", "7天无理由退款", "Reembolso 7 días", "Reembolso em 7 dias", "Remboursement 7 jours"),
            tt("Cancel anytime", "随时取消", "Cancela cuando quieras", "Cancele quando quiser", "Annulez à tout moment"),
            tt("Secure checkout by Creem", "Creem 安全托管", "Pago seguro con Creem", "Pagamento seguro Creem", "Paiement sécurisé par Creem"),
          ].map((label) => (
            <span key={label} className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="shrink-0 text-[color:var(--accent)]"><path d="M3 8.5l3.2 3.2L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              {label}
            </span>
          ))}
        </div>

        <p className="mt-4 text-[11px] leading-5 text-[color:var(--faint)]">
          {tt(
            "Upgrade is immediate; the unused time on your current plan is credited — never double-charged.",
            "升级立即生效；旧套餐当期未用部分已折抵，绝不重复收费。",
            "La mejora es inmediata; el tiempo no usado de tu plan actual se acredita — sin cobros duplicados.",
            "O upgrade é imediato; o tempo não usado do seu plano atual é creditado — sem cobranças duplicadas.",
            "La mise à niveau est immédiate ; le temps non utilisé de votre forfait actuel est crédité — aucun double prélèvement.",
          )}
        </p>

        <div className="mt-6 flex gap-3">
          <button type="button" onClick={flow.dismiss} disabled={flow.loading} className="flex-1 rounded-full border border-[color:var(--line-strong)] px-4 py-3 text-[14px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--foreground)] disabled:opacity-50">
            {tt("Cancel", "取消", "Cancelar", "Cancelar", "Annuler")}
          </button>
          <button type="button" onClick={flow.confirmUpgrade} disabled={flow.loading} className="flex-[1.6] rounded-full bg-[color:var(--accent)] px-4 py-3 text-[14px] font-semibold text-[color:var(--on-accent)] transition hover:bg-[color:var(--accent-hover)] disabled:opacity-50">
            {flow.loading
              ? tt("Redirecting…", "跳转中…", "Redirigiendo…", "Redirecionando…", "Redirection…")
              : `${tt("Confirm & pay", "确认并支付", "Confirmar y pagar", "Confirmar e pagar", "Confirmer et payer")} ${money(q.finalCents)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
