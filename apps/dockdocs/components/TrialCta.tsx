"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthChange, signInWithGoogle } from "@/lib/auth";
import { getSubscriptionSnapshot, startBillingTrial } from "@/lib/subscription-runtime";
import type { AuthoredLocale } from "@/lib/i18n";

export type TrialCtaVariant = "hero" | "tool-pro" | "tool-free";

export type TrialCtaProps =
  | { variant: "hero"; locale?: string }
  | { variant: "tool-pro"; locale?: string; hookTitle: string }
  | { variant: "tool-free"; locale?: string; visible?: boolean };

type CtaL10n = {
  heroTitle: string;
  heroPrivacy: string;
  freeIntro: string;
  freeOutcome: string;
  proBody: string;
  btnHero: string;
  btnTool: string;
  btnFree: string;
  noTricks: readonly [string, string, string];
};

const L: Record<AuthoredLocale, CtaL10n> = {
  en: {
    heroTitle:
      "In 7 days, use AI to work through all your important documents — contracts, quotes, long reports. Saves you dozens of hours.",
    heroPrivacy: "See how privacy works",
    freeIntro: "This document — let AI understand it next.",
    freeOutcome:
      "7 days free Pro: let AI work through it and all your important documents — contract risks, quote comparisons, long report summaries. Saves dozens of hours.",
    proBody:
      "7 days of full Pro — AI verification for contracts, quotes, and long reports.",
    btnHero: "Start Free Pro Trial · 7 Days",
    btnTool: "Start Free 7-Day Trial",
    btnFree: "Start Free 7 Days →",
    noTricks: ["No credit card", "No auto-charge", "Drops to free tier when it ends"],
  },
  zh: {
    heroTitle:
      "7 天里，把你所有重要文件用 AI 啃一遍——合同、报价、长报告，省你几十小时",
    heroPrivacy: "看隐私怎么做到",
    freeIntro: "这份文档，接下来让 AI 读懂它",
    freeOutcome:
      "7 天免费 Pro：把它和你其它重要文件用 AI 啃一遍——合同风险、报价对比、长报告摘要，省你几十小时",
    proBody: "7 天 Pro 全功能 · 合同/报价/长报告都能 AI 逐条核验",
    btnHero: "免费试用 Pro · 7 天",
    btnTool: "免费试用 7 天",
    btnFree: "免费试用 7 天 →",
    noTricks: ["不要卡", "不自动扣费", "到期不锁死，掉回免费版继续用"],
  },
  es: {
    heroTitle:
      "En 7 días, usa IA para revisar todos tus documentos importantes — contratos, presupuestos, informes largos. Ahorra decenas de horas.",
    heroPrivacy: "Mira cómo funciona la privacidad",
    freeIntro: "Este documento — que la IA lo entienda después.",
    freeOutcome:
      "7 días de Pro gratis: deja que la IA analice este y todos tus documentos importantes — riesgos en contratos, comparativas de presupuestos, resúmenes de informes. Ahorra decenas de horas.",
    proBody:
      "7 días de acceso Pro completo — verificación por IA de contratos, presupuestos e informes.",
    btnHero: "Empezar prueba Pro gratis · 7 días",
    btnTool: "Empezar prueba gratuita de 7 días",
    btnFree: "Empezar prueba gratuita de 7 días →",
    noTricks: [
      "Sin tarjeta",
      "Sin cargos automáticos",
      "Vuelve al plan gratuito al terminar",
    ],
  },
  pt: {
    heroTitle:
      "Em 7 dias, use IA para analisar todos os seus documentos importantes — contratos, propostas, relatórios. Economize dezenas de horas.",
    heroPrivacy: "Veja como a privacidade funciona",
    freeIntro: "Este documento — deixe a IA entendê-lo depois.",
    freeOutcome:
      "7 dias de Pro gratuito: deixe a IA analisar este e todos os seus documentos importantes — riscos em contratos, comparações de propostas, resumos de relatórios. Economize dezenas de horas.",
    proBody:
      "7 dias de acesso Pro completo — verificação por IA de contratos, propostas e relatórios.",
    btnHero: "Iniciar teste Pro gratuito · 7 dias",
    btnTool: "Iniciar teste gratuito de 7 dias",
    btnFree: "Iniciar teste gratuito de 7 dias →",
    noTricks: [
      "Sem cartão",
      "Sem cobrança automática",
      "Retorna ao plano gratuito no fim",
    ],
  },
  fr: {
    heroTitle:
      "En 7 jours, utilisez l'IA pour analyser tous vos documents importants — contrats, devis, longs rapports. Gagnez des dizaines d'heures.",
    heroPrivacy: "Voir comment fonctionne la confidentialité",
    freeIntro: "Ce document — laissez l'IA le comprendre ensuite.",
    freeOutcome:
      "7 jours de Pro gratuit : laissez l'IA analyser ce document et tous vos documents importants — risques contractuels, comparaisons de devis, résumés de rapports. Gagnez des dizaines d'heures.",
    proBody:
      "7 jours d'accès Pro complet — vérification IA de contrats, devis et rapports.",
    btnHero: "Commencer l'essai Pro gratuit · 7 jours",
    btnTool: "Commencer l'essai gratuit de 7 jours",
    btnFree: "Commencer l'essai gratuit de 7 jours →",
    noTricks: [
      "Sans carte",
      "Pas de débit automatique",
      "Retour au plan gratuit à l'expiration",
    ],
  },
  ja: {
    heroTitle:
      "7日間、AIであなたの重要書類をすべて読み込む——契約書、見積書、長い報告書。何十時間もの節約になります。",
    heroPrivacy: "プライバシーの仕組みを見る",
    freeIntro: "この書類——次はAIに読み込ませてみてください。",
    freeOutcome:
      "7日間Proを無料体験：この書類とほかの重要書類をAIで分析——契約リスク、見積比較、報告書の要約。何十時間も節約できます。",
    proBody: "7日間フルProアクセス——契約書・見積書・報告書をAIで逐条確認。",
    btnHero: "Proを7日間無料で試す",
    btnTool: "7日間無料で試す",
    btnFree: "7日間無料で試す →",
    noTricks: ["カード不要", "自動課金なし", "期限後は自動的に無料版へ"],
  },
  de: {
    heroTitle:
      "In 7 Tagen alle wichtigen Dokumente mit KI durcharbeiten — Verträge, Angebote, lange Berichte. Spart Dutzende Stunden.",
    heroPrivacy: "So funktioniert der Datenschutz",
    freeIntro: "Dieses Dokument — als Nächstes von der KI verstehen lassen.",
    freeOutcome:
      "7 Tage Pro kostenlos: Lass die KI dieses und alle wichtigen Dokumente analysieren — Vertragsrisiken, Angebotsvergleiche, Berichtszusammenfassungen. Spart Dutzende Stunden.",
    proBody:
      "7 Tage voller Pro-Zugang — KI-Prüfung von Verträgen, Angeboten und Berichten.",
    btnHero: "Pro 7 Tage gratis testen",
    btnTool: "7 Tage gratis testen",
    btnFree: "7 Tage gratis testen →",
    noTricks: [
      "Keine Kreditkarte",
      "Keine automatische Abbuchung",
      "Läuft in den Gratis-Plan aus",
    ],
  },
  ko: {
    heroTitle:
      "7일 동안 AI로 중요한 모든 문서를 처리하세요——계약서, 견적서, 긴 보고서. 수십 시간을 절약할 수 있습니다.",
    heroPrivacy: "프라이버시 작동 방식 보기",
    freeIntro: "이 문서——다음은 AI가 이해할 차례입니다.",
    freeOutcome:
      "7일 Pro 무료 체험: AI로 이 문서와 모든 중요한 문서 분석——계약 위험, 견적 비교, 긴 보고서 요약. 수십 시간을 절약하세요.",
    proBody: "7일 전체 Pro 액세스——계약서, 견적서, 보고서를 AI로 항목별 검토.",
    btnHero: "Pro 7일 무료 체험",
    btnTool: "7일 무료 체험",
    btnFree: "7일 무료 체험 →",
    noTricks: ["카드 불필요", "자동 결제 없음", "기간 종료 후 무료 버전으로 전환"],
  },
};

function toAuthored(locale?: string): AuthoredLocale {
  if (locale === "zh-Hant") return "zh";
  const authored = ["en", "zh", "es", "pt", "fr", "ja", "de", "ko"] as const;
  return (authored as readonly string[]).includes(locale ?? "")
    ? (locale as AuthoredLocale)
    : "en";
}

function CheckIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="shrink-0 text-[color:var(--accent)]"
    >
      <path
        d="M3 8.5l3 3L13 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0 text-[color:var(--accent)]"
    >
      <path
        d="M12 2L4 6v6c0 5.1 3.4 9.9 8 11.4C16.6 21.9 20 17.1 20 12V6L12 2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M9 12l2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function NoTricks({ items }: { items: readonly [string, string, string] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {items.map((item) => (
        <span
          key={item}
          className="flex items-center gap-1 text-[12px] text-[color:var(--muted)]"
        >
          <CheckIcon />
          {item}
        </span>
      ))}
    </div>
  );
}

function GreenButton({
  label,
  loading,
  onClick,
}: {
  label: string;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center justify-center gap-2 rounded-[var(--radius)] bg-[color:var(--accent)] px-6 py-2.5 text-[14px] font-semibold text-[color:var(--on-accent)] shadow-[0_4px_20px_color-mix(in_srgb,var(--accent)_28%,transparent)] transition hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
    >
      {loading && <Spinner />}
      {label}
    </button>
  );
}

export function TrialCta(props: TrialCtaProps) {
  const router = useRouter();
  const loc = toAuthored(props.locale);
  const c = L[loc];

  // null = not logged in; true = logged in
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [shouldHide, setShouldHide] = useState(false);
  const [subLoaded, setSubLoaded] = useState(false);
  const [ctaLoading, setCtaLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    getSubscriptionSnapshot()
      .then((snap) => {
        if (!mounted) return;
        setSignedIn(snap.signedIn);
        setShouldHide(snap.isPaidPlaceholder || snap.record.status === "trialing");
        setSubLoaded(true);
      })
      .catch(() => {
        if (mounted) {
          setSignedIn(false);
          setSubLoaded(true);
        }
      });

    const unsub = onAuthChange((u) => {
      if (mounted) setSignedIn(u !== null);
    });

    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  const handleCta = async () => {
    if (ctaLoading) return;

    if (!signedIn) {
      signInWithGoogle("/workspace").catch(() => {});
      return;
    }

    setCtaLoading(true);
    try {
      await startBillingTrial();
    } catch {
      // Network failure — navigate to workspace anyway
    } finally {
      setCtaLoading(false);
    }
    router.push("/workspace");
  };

  if (!subLoaded || shouldHide) return null;
  if (props.variant === "tool-free" && !props.visible) return null;

  if (props.variant === "hero") {
    const privacyHref = (!props.locale || props.locale === "en") ? "/privacy-policy" : `/${props.locale}/privacy-policy`;
    return (
      <div className="flex flex-col gap-4">
        <p className="max-w-lg text-[15px] leading-relaxed text-[color:var(--foreground)]">
          {c.heroTitle}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <GreenButton label={c.btnHero} loading={ctaLoading} onClick={handleCta} />
          <a
            href={privacyHref}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--line)] px-6 text-[14px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]"
          >
            {c.heroPrivacy}
          </a>
        </div>
        <NoTricks items={c.noTricks} />
      </div>
    );
  }

  if (props.variant === "tool-pro") {
    return (
      <div className="flex flex-col gap-3 rounded-[var(--radius)] border border-[color:var(--accent)]/30 bg-[color:var(--accent)]/5 px-5 py-4">
        <div className="flex items-start gap-3">
          <ShieldCheckIcon />
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-[color:var(--foreground)]">
              {props.hookTitle}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-[color:var(--muted)]">
              <span className="shrink-0 rounded bg-[color:var(--accent)] px-1.5 py-0.5 text-[10px] font-semibold text-[color:var(--on-accent)]">
                PRO
              </span>
              {c.proBody}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <GreenButton label={c.btnTool} loading={ctaLoading} onClick={handleCta} />
          <NoTricks items={c.noTricks} />
        </div>
      </div>
    );
  }

  // tool-free
  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-5 py-4">
      <div>
        <p className="text-[12px] font-semibold text-[color:var(--accent)]">
          {c.freeIntro}
        </p>
        <p className="mt-1 text-[14px] leading-relaxed text-[color:var(--foreground)]">
          {c.freeOutcome}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <GreenButton label={c.btnFree} loading={ctaLoading} onClick={handleCta} />
        <NoTricks items={c.noTricks} />
      </div>
    </div>
  );
}
