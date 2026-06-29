import type { BillingInterval, PaidSubscriptionPlan } from "@/lib/billing-config";
import { toHant } from "@/lib/zh-hant";

// Shared membership presentation helpers. The nav account card, the nav badge,
// and the account page all read from the SAME subscription snapshot through these
// functions, so the identity / status / upgrade copy stays consistent. Pure
// display + copy — never touches entitlement logic.

export type MembershipLocale = "en" | "zh" | "es" | "pt" | "fr" | "ja" | "zh-Hant";
export type PlanDisplayName = "Free" | "Pro";

function pick(
  locale: MembershipLocale,
  en: string,
  zh: string,
  es: string,
  pt: string,
  fr: string,
  ja: string,
): string {
  if (locale === "zh-Hant") return toHant(zh);
  return locale === "zh" ? zh : locale === "es" ? es : locale === "pt" ? pt : locale === "fr" ? fr : locale === "ja" ? ja : en;
}

// Identity badge shown after the user's name (nav button + account page).
export function planBadge(
  displayName: PlanDisplayName,
  interval: BillingInterval | undefined,
  locale: MembershipLocale,
): { label: string; className: string } {
  const suffix =
    interval === "lifetime"
      ? ` · ${pick(locale, "Lifetime", "终身", "De por vida", "Vitalício", "À vie", "買い切り")}`
      : "";
  if (displayName === "Pro") {
    // Brightest — solid accent fill.
    return { label: `Pro${suffix}`, className: "bg-[color:var(--accent)] text-[color:var(--on-accent)]" };
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
      locale === "zh" ? "zh-CN" : locale === "zh-Hant" ? "zh-TW" : locale === "es" ? "es-ES" : locale === "pt" ? "pt-BR" : locale === "fr" ? "fr-FR" : locale === "ja" ? "ja-JP" : "en-US";
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
    return pick(locale, "Free plan", "免费版", "Plan gratuito", "Plano gratuito", "Forfait gratuit", "無料プラン");
  }
  if (interval === "lifetime") {
    return pick(locale, "Lifetime · never expires", "终身永久 · 永不过期", "De por vida · nunca caduca", "Vitalício · nunca expira", "À vie · n'expire jamais", "買い切り · 無期限");
  }
  if (status === "past_due") {
    return pick(locale, "Past due · update your payment method", "续费失败 · 请更新付款方式", "Pago vencido · actualiza tu método de pago", "Pagamento vencido · atualize sua forma de pagamento", "Paiement en retard · mettez à jour votre moyen de paiement", "支払い遅延 · お支払い方法を更新してください");
  }
  if (status === "canceled" || cancelAtPeriodEnd) {
    if (date) {
      return pick(locale, `Canceled · active until ${date}`, `已取消 · 有效期至 ${date}`, `Cancelado · activo hasta ${date}`, `Cancelado · ativo até ${date}`, `Annulé · actif jusqu'au ${date}`, `キャンセル済み · ${date} まで有効`);
    }
    return pick(locale, "Canceled", "已取消", "Cancelado", "Cancelado", "Annulé", "キャンセル済み");
  }
  if (date) {
    return pick(locale, `Active · renews ${date}`, `生效中 · 续费日 ${date}`, `Activo · se renueva el ${date}`, `Ativo · renova em ${date}`, `Actif · se renouvelle le ${date}`, `有効 · ${date} に更新`);
  }
  const cycle =
    interval === "annual"
      ? pick(locale, "annual", "按年", "anual", "anual", "annuel", "年額")
      : pick(locale, "monthly", "按月", "mensual", "mensal", "mensuel", "月額");
  return pick(locale, `Active · ${cycle}`, `生效中 · ${cycle}`, `Activo · ${cycle}`, `Ativo · ${cycle}`, `Actif · ${cycle}`, `有効 · ${cycle}`);
}

export type UpgradeTarget = { plan: PaidSubscriptionPlan; interval: BillingInterval };
// `target` set → the caller can run the in-place proration upgrade flow to that exact
// (plan, interval). Absent (Free users) → route to /pricing for a plain checkout.
export type UpgradePrompt = { label: string; primary: boolean; target?: UpgradeTarget };

// Contextual upgrade prompts. For a user who already has a recurring sub, each prompt
// carries a concrete `target` so the nav card / account page can pop the in-place
// breakdown + checkout (no dumping the user onto /pricing to re-find it). Free users
// have no sub to prorate → no target → /pricing. Returns [] for lifetime owners.
export function upgradePrompts(
  displayName: PlanDisplayName,
  interval: BillingInterval | undefined,
  locale: MembershipLocale,
): UpgradePrompt[] {
  if (displayName === "Free") {
    return [
      { label: pick(locale, "Unlock AI & Pro precision", "升级解锁 AI 与专业精准", "Desbloquea IA y precisión Pro", "Desbloqueie IA e precisão Pro", "Débloquez l'IA et la précision Pro", "AI とプロ精度をアンロック"), primary: true },
    ];
  }
  if (interval === "lifetime") return [];
  const curInterval: BillingInterval = interval ?? "monthly";

  // Pro on a recurring plan → lifetime.
  return [
    { label: pick(locale, "Get lifetime — pay once", "切终身 · 一次买断永久", "Hazlo de por vida — pago único", "Mude para vitalício — pague uma vez", "Passez à vie — paiement unique", "買い切りにする — 一度の支払い"), primary: true, target: { plan: "PRO", interval: "lifetime" } },
  ];
}

// Localized, user-facing copy for a billing failure code. The raw code + server
// message still go to the console for diagnosis; users see a friendly reason. Shared
// by the pricing page and the in-place upgrade flow.
export function billingErrorCopy(code: string | undefined, serverMessage: string, locale: MembershipLocale): string {
  const t = (en: string, zh: string, es: string, pt: string, fr: string, ja: string) => pick(locale, en, zh, es, pt, fr, ja);
  switch (code) {
    case "CREEM_PRODUCT_MISSING":
    case "CREEM_NOT_CONFIGURED":
      return t(
        "This billing option isn't available right now. Please try another period or contact support.",
        "该计费周期暂时不可用，请换一个周期或联系客服。",
        "Esta opción de facturación no está disponible ahora. Prueba otro periodo o contacta con soporte.",
        "Esta opção de cobrança não está disponível agora. Tente outro período ou contate o suporte.",
        "Cette option de facturation est indisponible pour l'instant. Essayez une autre période ou contactez le support.",
        "この請求オプションは現在ご利用いただけません。別の期間を選ぶか、サポートにお問い合わせください。",
      );
    case "CREEM_DISCOUNT_FAILED":
    case "CREEM_CHECKOUT_FAILED":
    case "CREEM_PORTAL_FAILED":
    case "CREEM_CANCEL_FAILED":
    case "CREEM_GET_SUB_FAILED":
    case "CREEM_UNREACHABLE":
      return t(
        "Couldn't complete the upgrade right now. Please try again in a moment.",
        "升级暂时无法完成，请稍后再试。",
        "No se pudo completar la mejora ahora. Inténtalo de nuevo en un momento.",
        "Não foi possível concluir o upgrade agora. Tente novamente em instantes.",
        "Impossible de finaliser la mise à niveau pour l'instant. Réessayez dans un instant.",
        "現在アップグレードを完了できませんでした。少し時間をおいて再度お試しください。",
      );
    case "CANNOT_PRORATE":
      return t(
        "We couldn't work out your unused credit. Please upgrade from Manage billing instead.",
        "无法计算你的未用抵扣，请改从「管理账单」升级。",
        "No pudimos calcular tu crédito no usado. Mejora desde «Gestionar facturación».",
        "Não foi possível calcular seu crédito não usado. Faça o upgrade em «Gerenciar cobrança».",
        "Impossible de calculer votre crédit non utilisé. Mettez à niveau depuis « Gérer la facturation ».",
        "未使用分のクレジットを計算できませんでした。代わりに「請求の管理」からアップグレードしてください。",
      );
    case "NO_RECURRING_SUB":
      return t(
        "No active subscription to change. Start a new checkout instead.",
        "没有可更改的有效订阅，请重新发起结账。",
        "No hay una suscripción activa para cambiar. Inicia un nuevo pago.",
        "Nenhuma assinatura ativa para alterar. Inicie um novo checkout.",
        "Aucun abonnement actif à modifier. Lancez un nouveau paiement.",
        "変更できる有効なサブスクリプションがありません。新しいお支払いを開始してください。",
      );
    default:
      return (
        serverMessage ||
        t(
          "Something went wrong with billing. Please try again.",
          "账单操作出错了，请重试。",
          "Algo salió mal con la facturación. Inténtalo de nuevo.",
          "Algo deu errado com a cobrança. Tente novamente.",
          "Une erreur de facturation est survenue. Réessayez.",
          "請求処理でエラーが発生しました。もう一度お試しください。",
        )
      );
  }
}
