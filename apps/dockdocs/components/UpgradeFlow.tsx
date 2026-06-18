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

// The breakdown confirmation modal — "new price − unused credit = you pay" — shown
// before the redirect, so the credit is always visible (the 可溯源/honest promise).
export function UpgradeConfirmModal({ flow, locale }: { flow: UpgradeFlow; locale: MembershipLocale }) {
  const c = flow.confirm;
  if (!c) return null;
  const q = c.quote;
  const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  const planName = c.plan === "PLUS" ? "Plus" : "Pro";
  const ivLabel =
    c.interval === "lifetime"
      ? (locale === "zh" ? "终身" : locale === "es" ? "De por vida" : locale === "pt" ? "Vitalício" : locale === "fr" ? "À vie" : "Lifetime")
      : c.interval === "annual"
        ? (locale === "zh" ? "年付" : locale === "es" ? "Anual" : locale === "pt" ? "Anual" : locale === "fr" ? "Annuel" : "Yearly")
        : (locale === "zh" ? "月付" : locale === "es" ? "Mensual" : locale === "pt" ? "Mensal" : locale === "fr" ? "Mensuel" : "Monthly");
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" onClick={() => !flow.loading && flow.dismiss()}>
      <div className="w-full max-w-sm rounded-2xl border border-[color:var(--line)] bg-[color:var(--background)] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.5)]" onClick={(e) => e.stopPropagation()}>
        <p className="text-[15px] font-semibold">
          {locale === "zh" ? "确认升级" : locale === "es" ? "Confirmar mejora" : locale === "pt" ? "Confirmar upgrade" : locale === "fr" ? "Confirmer la mise à niveau" : "Confirm upgrade"}
        </p>
        <div className="mt-4 space-y-2 text-[14px]">
          <div className="flex items-center justify-between">
            <span className="text-[color:var(--muted)]">{`${planName} · ${ivLabel}`}</span>
            <span>{money(q.newPriceCents)}</span>
          </div>
          {q.creditCents > 0 && (
            <div className="flex items-center justify-between text-[color:var(--accent-strong)]">
              <span>{locale === "zh" ? "未用价值（抵扣）" : locale === "es" ? "Valor no usado (crédito)" : locale === "pt" ? "Valor não usado (crédito)" : locale === "fr" ? "Valeur non utilisée (crédit)" : "Unused value (credit)"}</span>
              <span>{`−${money(q.creditCents)}`}</span>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-[color:var(--line)] pt-2 text-[15px] font-semibold">
            <span>{locale === "zh" ? "现在支付" : locale === "es" ? "Pagas ahora" : locale === "pt" ? "Você paga agora" : locale === "fr" ? "Vous payez" : "You pay now"}</span>
            <span>{money(q.finalCents)}</span>
          </div>
        </div>
        <p className="mt-3 text-[11px] leading-5 text-[color:var(--faint)]">
          {locale === "zh" ? "升级立即生效；旧套餐当期未用部分已折抵，绝不重复收费。"
            : locale === "es" ? "La mejora es inmediata; el tiempo no usado de tu plan actual se acredita — sin cobros duplicados."
            : locale === "pt" ? "O upgrade é imediato; o tempo não usado do seu plano atual é creditado — sem cobranças duplicadas."
            : locale === "fr" ? "La mise à niveau est immédiate ; le temps non utilisé de votre forfait actuel est crédité — aucun double prélèvement."
            : "Upgrade is immediate; the unused time on your current plan is credited — never double-charged."}
        </p>
        <div className="mt-5 flex gap-2">
          <button type="button" onClick={flow.dismiss} disabled={flow.loading} className="flex-1 rounded-full border border-[color:var(--line-strong)] px-4 py-2.5 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--foreground)] disabled:opacity-50">
            {locale === "zh" ? "取消" : locale === "es" ? "Cancelar" : locale === "pt" ? "Cancelar" : locale === "fr" ? "Annuler" : "Cancel"}
          </button>
          <button type="button" onClick={flow.confirmUpgrade} disabled={flow.loading} className="flex-1 rounded-full bg-[color:var(--accent)] px-4 py-2.5 text-[13px] font-semibold text-[color:var(--on-accent)] transition hover:bg-[color:var(--accent-hover)] disabled:opacity-50">
            {flow.loading
              ? (locale === "zh" ? "跳转中…" : locale === "es" ? "Redirigiendo…" : locale === "pt" ? "Redirecionando…" : locale === "fr" ? "Redirection…" : "Redirecting…")
              : (locale === "zh" ? "确认并支付" : locale === "es" ? "Confirmar y pagar" : locale === "pt" ? "Confirmar e pagar" : locale === "fr" ? "Confirmer et payer" : "Confirm & pay")}
          </button>
        </div>
      </div>
    </div>
  );
}
