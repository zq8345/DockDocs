import type { BillingInterval } from "@/lib/billing-config";

// Shared membership presentation helpers. The nav account card, the nav badge,
// and the account page all read from the SAME subscription snapshot through these
// functions, so the identity / status / upgrade copy stays consistent. Pure
// display + copy — never touches entitlement logic.

export type MembershipLocale = "en" | "zh" | "es" | "pt" | "fr";
export type PlanDisplayName = "Free" | "Plus" | "Pro";

function pick(
  locale: MembershipLocale,
  en: string,
  zh: string,
  es: string,
  pt: string,
  fr: string,
): string {
  return locale === "zh" ? zh : locale === "es" ? es : locale === "pt" ? pt : locale === "fr" ? fr : en;
}

// Identity badge shown after the user's name (nav button + account page).
export function planBadge(
  displayName: PlanDisplayName,
  interval: BillingInterval | undefined,
  locale: MembershipLocale,
): { label: string; className: string } {
  const suffix =
    interval === "lifetime"
      ? ` · ${pick(locale, "Lifetime", "终身", "De por vida", "Vitalício", "À vie")}`
      : "";
  if (displayName === "Pro") {
    // Brightest — solid accent fill.
    return { label: `Pro${suffix}`, className: "bg-[color:var(--accent)] text-[color:var(--on-accent)]" };
  }
  if (displayName === "Plus") {
    // Green, softer than Pro.
    return { label: `Plus${suffix}`, className: "bg-[color:var(--soft-accent)] text-[color:var(--accent-strong)]" };
  }
  // Free — neutral gray pill.
  return { label: "Free", className: "border border-[color:var(--line)] bg-[color:var(--surface-subtle)] text-[color:var(--muted)]" };
}

function formatDate(iso: string | undefined, locale: MembershipLocale): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const loc =
      locale === "zh" ? "zh-CN" : locale === "es" ? "es-ES" : locale === "pt" ? "pt-BR" : locale === "fr" ? "fr-FR" : "en-US";
    return d.toLocaleDateString(loc, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

// Human status line: "Active · renews <date>" / "Lifetime · never expires" /
// "Canceled · active until <date>" / "Past due" / "Free plan".
export function planStatusText(
  opts: {
    displayName: PlanDisplayName;
    interval: BillingInterval | undefined;
    status: string;
    currentPeriodEnd?: string;
    cancelAtPeriodEnd?: boolean;
  },
  locale: MembershipLocale,
): string {
  const { displayName, interval, status, currentPeriodEnd, cancelAtPeriodEnd } = opts;
  const date = formatDate(currentPeriodEnd, locale);

  if (displayName === "Free") {
    return pick(locale, "Free plan", "免费版", "Plan gratuito", "Plano gratuito", "Forfait gratuit");
  }
  if (interval === "lifetime") {
    return pick(locale, "Lifetime · never expires", "终身永久 · 永不过期", "De por vida · nunca caduca", "Vitalício · nunca expira", "À vie · n'expire jamais");
  }
  if (status === "past_due") {
    return pick(locale, "Past due · update your payment method", "续费失败 · 请更新付款方式", "Pago vencido · actualiza tu pago", "Pagamento vencido · atualize o pagamento", "Paiement en retard · mettez à jour le paiement");
  }
  if (status === "canceled" || cancelAtPeriodEnd) {
    if (date) {
      return pick(locale, `Canceled · active until ${date}`, `已取消 · 有效期至 ${date}`, `Cancelado · activo hasta ${date}`, `Cancelado · ativo até ${date}`, `Annulé · actif jusqu'au ${date}`);
    }
    return pick(locale, "Canceled", "已取消", "Cancelado", "Cancelado", "Annulé");
  }
  if (date) {
    return pick(locale, `Active · renews ${date}`, `生效中 · 续费日 ${date}`, `Activo · se renueva el ${date}`, `Ativo · renova em ${date}`, `Actif · renouvelé le ${date}`);
  }
  const cycle =
    interval === "annual"
      ? pick(locale, "annual", "按年", "anual", "anual", "annuel")
      : pick(locale, "monthly", "按月", "mensual", "mensal", "mensuel");
  return pick(locale, `Active · ${cycle}`, `生效中 · ${cycle}`, `Activo · ${cycle}`, `Ativo · ${cycle}`, `Actif · ${cycle}`);
}

export type UpgradePrompt = { label: string; primary: boolean };

// Contextual upgrade prompts. ALL of them route to the pricing page — the user
// picks the interval there and the pricing CTA performs the actual checkout /
// in-place change-plan. So this stays pure routing and never decides entitlement
// or hardcodes an interval. Returns [] for lifetime owners (nothing to upgrade
// in-app; Plus-lifetime → Pro is handled manually).
export function upgradePrompts(
  displayName: PlanDisplayName,
  interval: BillingInterval | undefined,
  locale: MembershipLocale,
): UpgradePrompt[] {
  if (displayName === "Free") {
    return [
      { label: pick(locale, "Unlock AI & Pro precision", "升级解锁 AI 与专业精准", "Desbloquea IA y precisión Pro", "Desbloqueie IA e precisão Pro", "Débloquez l'IA et la précision Pro"), primary: true },
    ];
  }
  if (interval === "lifetime") return [];

  if (displayName === "Plus") {
    const prompts: UpgradePrompt[] = [
      { label: pick(locale, "Upgrade to Pro", "升级 Pro 专业精准", "Mejora a Pro", "Faça upgrade para Pro", "Passer à Pro"), primary: true },
    ];
    if (interval !== "annual") {
      prompts.push({
        label: pick(locale, "Switch to yearly — save 40%", "切年付 · 省 40%", "Cambia a anual — ahorra 40%", "Mude para anual — economize 40%", "Passez à l'annuel — −40 %"),
        primary: false,
      });
    }
    return prompts;
  }
  // Pro on a recurring plan → lifetime.
  return [
    { label: pick(locale, "Get lifetime — pay once", "切终身 · 一次买断永久", "Hazlo de por vida — pago único", "Torne vitalício — pague uma vez", "Passez à vie — paiement unique"), primary: true },
  ];
}
