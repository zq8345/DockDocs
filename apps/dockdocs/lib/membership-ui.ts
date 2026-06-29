import type { BillingInterval, PaidSubscriptionPlan } from "@/lib/billing-config";
import { toHant } from "@/lib/zh-hant";

// Shared membership presentation helpers. The nav account card, the nav badge,
// and the account page all read from the SAME subscription snapshot through these
// functions, so the identity / status / upgrade copy stays consistent. Pure
// display + copy — never touches entitlement logic.

export type MembershipLocale = "en" | "zh" | "es" | "pt" | "fr" | "ja" | "zh-Hant" | "de" | "ko";
export type PlanDisplayName = "Free" | "Pro";

function pick(
  locale: MembershipLocale,
  en: string,
  zh: string,
  es: string,
  pt: string,
  fr: string,
  ja: string,
  de?: string,
  ko?: string,
): string {
  if (locale === "zh-Hant") return toHant(zh);
  if (locale === "de") return de ?? en;
  if (locale === "ko") return ko ?? en;
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
      ? ` · ${pick(locale, "Lifetime", "终身", "De por vida", "Vitalício", "À vie", "買い切り", "Lebenslang", "평생")}`
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
      locale === "zh" ? "zh-CN" : locale === "zh-Hant" ? "zh-TW" : locale === "es" ? "es-ES" : locale === "pt" ? "pt-BR" : locale === "fr" ? "fr-FR" : locale === "ja" ? "ja-JP" : locale === "de" ? "de-DE" : locale === "ko" ? "ko-KR" : "en-US";
    return d.toLocaleDateString(loc, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

// Human status line: "Active · renews <date>" / "Lifetime · never expires" /
// "Canceled · active until <date>" / "Past due" / "Free plan" / "Pro Trial · N days left".
export function planStatusText(
  opts: {
    displayName: PlanDisplayName;
    interval: BillingInterval | undefined;
    status: string;
    currentPeriodEnd?: string;
    cancelAtPeriodEnd?: boolean;
    daysRemaining?: number;
  },
  locale: MembershipLocale,
): string {
  const { displayName, interval, status, currentPeriodEnd, cancelAtPeriodEnd, daysRemaining } = opts;
  const date = formatDate(currentPeriodEnd, locale);

  if (displayName === "Free") {
    return pick(locale, "Free plan", "免费版", "Plan gratuito", "Plano gratuito", "Forfait gratuit", "無料プラン", "Gratis-Tarif", "무료 플랜");
  }
  if (interval === "lifetime") {
    return pick(locale, "Lifetime · never expires", "终身永久 · 永不过期", "De por vida · nunca caduca", "Vitalício · nunca expira", "À vie · n'expire jamais", "買い切り · 無期限", "Lebenslang · läuft nie ab", "평생 · 만료 없음");
  }
  if (status === "trialing") {
    if (typeof daysRemaining === "number") {
      const n = daysRemaining;
      return pick(locale,
        `Pro Trial · ${n} day${n === 1 ? "" : "s"} left`,
        `Pro 试用 · 剩余 ${n} 天`,
        `Prueba Pro · quedan ${n} día${n === 1 ? "" : "s"}`,
        `Teste Pro · faltam ${n} dia${n === 1 ? "" : "s"}`,
        `Essai Pro · ${n} jour${n === 1 ? "" : "s"} restant${n === 1 ? "" : "s"}`,
        `Pro トライアル · 残り ${n} 日`,
        `Pro Testversion · noch ${n} Tag${n === 1 ? "" : "e"}`,
        `Pro 체험 · ${n}일 남음`,
      );
    }
    return pick(locale, "Pro Trial", "Pro 试用", "Prueba Pro", "Teste Pro", "Essai Pro", "Pro トライアル", "Pro Testversion", "Pro 체험");
  }
  if (status === "past_due") {
    return pick(locale, "Past due · update your payment method", "续费失败 · 请更新付款方式", "Pago vencido · actualiza tu método de pago", "Pagamento vencido · atualize sua forma de pagamento", "Paiement en retard · mettez à jour votre moyen de paiement", "支払い遅延 · お支払い方法を更新してください", "Überfällig · bitte Zahlungsmethode aktualisieren", "결제 기한 초과 · 결제 수단을 업데이트해 주세요");
  }
  if (status === "canceled" || cancelAtPeriodEnd) {
    if (date) {
      return pick(locale, `Canceled · active until ${date}`, `已取消 · 有效期至 ${date}`, `Cancelado · activo hasta ${date}`, `Cancelado · ativo até ${date}`, `Annulé · actif jusqu'au ${date}`, `キャンセル済み · ${date} まで有効`, `Gekündigt · aktiv bis ${date}`, `취소됨 · ${date}까지 이용 가능`);
    }
    return pick(locale, "Canceled", "已取消", "Cancelado", "Cancelado", "Annulé", "キャンセル済み", "Gekündigt", "취소됨");
  }
  if (date) {
    return pick(locale, `Active · renews ${date}`, `生效中 · 续费日 ${date}`, `Activo · se renueva el ${date}`, `Ativo · renova em ${date}`, `Actif · se renouvelle le ${date}`, `有効 · ${date} に更新`, `Aktiv · verlängert sich am ${date}`, `활성 · ${date}에 갱신됨`);
  }
  const cycle =
    interval === "annual"
      ? pick(locale, "annual", "按年", "anual", "anual", "annuel", "年額", "jährlich", "연간")
      : pick(locale, "monthly", "按月", "mensual", "mensal", "mensuel", "月額", "monatlich", "월간");
  return pick(locale, `Active · ${cycle}`, `生效中 · ${cycle}`, `Activo · ${cycle}`, `Ativo · ${cycle}`, `Actif · ${cycle}`, `有効 · ${cycle}`, `Aktiv · ${cycle}`, `활성 · ${cycle}`);
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
  if (interval === "lifetime") return [];
  // Recurring Pro users are already Pro — direct them to plan management, not "upgrade".
  if (displayName === "Pro" && interval != null) {
    return [
      { label: pick(locale, "Manage plan", "管理套餐", "Gestionar suscripción", "Gerenciar plano", "Gérer l'abonnement", "プランを管理", "Abo verwalten", "플랜 관리"), primary: true },
    ];
  }
  return [
    { label: pick(locale, "Upgrade to Pro", "升级到 Pro", "Actualizar a Pro", "Atualizar para Pro", "Passer à Pro", "Pro にアップグレード", "Auf Pro upgraden", "Pro로 업그레이드"), primary: true },
  ];
}

// Localized, user-facing copy for a billing failure code. The raw code + server
// message still go to the console for diagnosis; users see a friendly reason. Shared
// by the pricing page and the in-place upgrade flow.
export function billingErrorCopy(code: string | undefined, serverMessage: string, locale: MembershipLocale): string {
  const t = (en: string, zh: string, es: string, pt: string, fr: string, ja: string, de?: string, ko?: string) => pick(locale, en, zh, es, pt, fr, ja, de, ko);
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
        "Diese Abrechnungsoption ist gerade nicht verfügbar. Bitte versuchen Sie einen anderen Zeitraum oder kontaktieren Sie den Support.",
        "이 결제 옵션은 현재 이용할 수 없어요. 다른 기간을 선택하거나 고객 지원에 문의해 주세요.",
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
        "Das Upgrade konnte gerade nicht abgeschlossen werden. Bitte versuchen Sie es gleich noch einmal.",
        "지금 업그레이드를 완료할 수 없어요. 잠시 후 다시 시도해 주세요.",
      );
    case "CANNOT_PRORATE":
      return t(
        "We couldn't work out your unused credit. Please upgrade from Manage billing instead.",
        "无法计算你的未用抵扣，请改从「管理账单」升级。",
        "No pudimos calcular tu crédito no usado. Mejora desde «Gestionar facturación».",
        "Não foi possível calcular seu crédito não usado. Faça o upgrade em «Gerenciar cobrança».",
        "Impossible de calculer votre crédit non utilisé. Mettez à niveau depuis « Gérer la facturation ».",
        "未使用分のクレジットを計算できませんでした。代わりに「請求の管理」からアップグレードしてください。",
        "Wir konnten Ihr ungenutztes Guthaben nicht berechnen. Bitte führen Sie das Upgrade über «Abrechnung verwalten» durch.",
        "미사용 크레딧을 계산할 수 없었어요. '결제 관리'에서 업그레이드해 주세요.",
      );
    case "NO_RECURRING_SUB":
      return t(
        "No active subscription to change. Start a new checkout instead.",
        "没有可更改的有效订阅，请重新发起结账。",
        "No hay una suscripción activa para cambiar. Inicia un nuevo pago.",
        "Nenhuma assinatura ativa para alterar. Inicie um novo checkout.",
        "Aucun abonnement actif à modifier. Lancez un nouveau paiement.",
        "変更できる有効なサブスクリプションがありません。新しいお支払いを開始してください。",
        "Kein aktives Abonnement zum Ändern. Starten Sie stattdessen einen neuen Checkout.",
        "변경할 활성 구독이 없어요. 새로 결제를 시작해 주세요.",
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
          "Bei der Abrechnung ist etwas schiefgelaufen. Bitte versuchen Sie es erneut.",
          "결제 처리 중 오류가 발생했어요. 다시 시도해 주세요.",
        )
      );
  }
}
