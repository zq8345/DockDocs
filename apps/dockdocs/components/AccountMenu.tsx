"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { defaultLocale } from "@/lib/i18n";
import { toHant } from "@/lib/zh-hant";
import { signOut, type AuthUser } from "@/lib/auth";
import {
  getSubscriptionSnapshot,
  createBillingPortalSession,
  type SubscriptionSnapshot,
} from "@/lib/subscription-runtime";
import {
  planBadge,
  planStatusText,
  upgradePrompts,
  type MembershipLocale,
} from "@/lib/membership-ui";

// Desktop nav account control: identity badge button + dropdown account card.
// Reads the subscription snapshot so the badge / status / upgrade prompts match
// the account page exactly. Upgrade prompts route to /upgrade; "Manage billing" opens
// the Creem portal.

function lh(href: string, locale: string) {
  return locale === defaultLocale ? href : `/${locale}${href}`;
}

function asMembershipLocale(locale: string): MembershipLocale {
  const supported: MembershipLocale[] = ["en", "zh", "es", "pt", "fr", "ja", "zh-Hant", "de", "ko"];
  return supported.includes(locale as MembershipLocale) ? (locale as MembershipLocale) : "en";
}

const linkCls =
  "block w-full rounded-[var(--radius-sm)] px-2.5 py-1.5 text-left text-[13px] font-medium text-[color:var(--muted)] transition hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)]";

export function AccountMenu({ authUser, locale }: { authUser: AuthUser | null; locale: string }) {
  const router = useRouter();
  const loc = asMembershipLocale(locale);
  const [open, setOpen] = useState(false);
  const [snapshot, setSnapshot] = useState<SubscriptionSnapshot | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    if (!authUser) {
      setSnapshot(null);
      return;
    }
    getSubscriptionSnapshot()
      .then((s) => {
        if (mounted) setSnapshot(s);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [authUser]);

  // Close on a click outside the menu (button + dropdown) or on Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Directly-authored nav copy. Keyed off the RAW route locale (not `loc`) so de
  // and zh-Hant resolve their own copy — `loc` collapses de→en for the shared
  // membership helpers, but these strings live here and CAN be German. de tone
  // mirrors deTools in localized-tools.ts (formal Sie).
  const t = (en: string, zh: string, es: string, pt: string, fr: string, ja: string, de: string, ko: string) =>
    locale === "zh"
      ? zh
      : locale === "zh-Hant"
        ? toHant(zh)
        : locale === "es"
          ? es
          : locale === "pt"
            ? pt
            : locale === "fr"
              ? fr
              : locale === "ja"
                ? ja
                : locale === "de"
                  ? de
                  : locale === "ko"
                    ? ko
                    : en;

  function go(href: string) {
    setOpen(false);
    router.push(lh(href, locale));
  }

  async function handlePortal() {
    setBillingLoading(true);
    try {
      await createBillingPortalSession();
    } catch {
      go("/account");
    } finally {
      setBillingLoading(false);
    }
  }

  async function handleSignOut() {
    setOpen(false);
    try {
      await signOut();
    } catch {
      // Stay on the page; the auth listener will reconcile.
    }
  }

  // Signed out → simple "Sign in" button (unchanged behavior, routes to /account).
  if (!authUser) {
    return (
      <button
        type="button"
        onClick={() => go("/account")}
        className="hidden rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--background)] px-3 py-1.5 text-[13px] font-medium text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--foreground)] md:inline-flex"
      >
        {t("Sign in", "登录", "Iniciar sesión", "Entrar", "Connexion", "ログイン", "Anmelden", "로그인")}
      </button>
    );
  }

  const name = authUser.name ?? authUser.email ?? t("Account", "账户", "Cuenta", "Conta", "Compte", "アカウント", "Konto", "계정");
  const isTrial = snapshot?.trial?.status === "trialing";
  const display = isTrial ? "Pro" : (snapshot?.displayName ?? "Free");
  const interval = snapshot?.record.interval;
  const trialDaysRemaining = isTrial && snapshot?.trial?.expiresAt
    ? Math.max(0, Math.ceil((new Date(snapshot.trial.expiresAt).getTime() - Date.now()) / 86400000))
    : undefined;
  const badge = planBadge(display, interval, loc);
  const prompts = snapshot ? upgradePrompts(display, interval, loc) : [];
  const isPaid = snapshot?.isPaidPlaceholder ?? false;

  return (
    <div ref={menuRef} className="relative hidden md:block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={t("Account", "账户", "Cuenta", "Conta", "Compte", "アカウント", "Konto", "계정")}
        className="flex items-center rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--background)] p-1 transition hover:border-[color:var(--line-strong)]"
      >
        <span className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-[color:var(--accent)] text-[11px] font-semibold text-[color:var(--on-accent)]">
          {authUser.pictureUrl && !imgFailed ? (
            <img
              src={authUser.pictureUrl}
              alt=""
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
              onError={() => setImgFailed(true)}
            />
          ) : (
            name.charAt(0).toUpperCase()
          )}
        </span>
      </button>

      {open && (
        <>
          <div className="absolute right-0 top-full z-50 mt-1.5 w-[264px] rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--background)] p-1.5 shadow-[0_16px_48px_rgba(0,0,0,0.4)]">
            {/* identity */}
            <div className="px-2.5 pb-2 pt-1.5">
              <p className="truncate text-[13px] font-semibold text-[color:var(--foreground)]">{name}</p>
              {authUser.email && <p className="truncate text-[11px] text-[color:var(--muted)]">{authUser.email}</p>}
            </div>

            {/* plan + status */}
            <div className="mx-1 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-2.5 py-2">
              <span className={`inline-block rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${badge.className}`}>{badge.label}</span>
              {snapshot && (
                <p className="mt-1.5 text-[11px] leading-snug text-[color:var(--muted)]">
                  {planStatusText(
                    {
                      displayName: display,
                      interval,
                      status: snapshot.record.status,
                      currentPeriodEnd: snapshot.record.currentPeriodEnd,
                      cancelAtPeriodEnd: snapshot.record.cancelAtPeriodEnd,
                      daysRemaining: trialDaysRemaining,
                    },
                    loc,
                  )}
                </p>
              )}
            </div>

            {/* upgrade prompts → /upgrade page handles fresh vs proration */}
            {prompts.length > 0 && (
              <div className="mt-1.5 space-y-1 px-1">
                {prompts.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => go("/upgrade")}
                    className={
                      p.primary
                        ? "block w-full rounded-[var(--radius-sm)] bg-[color:var(--accent)] px-2.5 py-1.5 text-center text-[12px] font-semibold text-[color:var(--on-accent)] transition hover:bg-[color:var(--accent-hover)]"
                        : "block w-full rounded-[var(--radius-sm)] px-2.5 py-1.5 text-center text-[12px] font-medium text-[color:var(--accent-strong)] transition hover:bg-[color:var(--surface-subtle)]"
                    }
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}

            <div className="my-1.5 border-t border-[color:var(--line)]" />

            {/* links */}
            <button type="button" onClick={() => go("/account")} className={linkCls}>
              {t("Account center", "账户中心", "Centro de cuenta", "Central da conta", "Centre du compte", "アカウントセンター", "Kontocenter", "계정 센터")}
            </button>
            {isPaid && (
              <button type="button" onClick={handlePortal} disabled={billingLoading} className={`${linkCls} disabled:opacity-50`}>
                {billingLoading
                  ? t("Opening…", "打开中…", "Abriendo…", "Abrindo…", "Ouverture…", "開いています…", "Wird geöffnet…", "여는 중…")
                  : t("Manage billing", "管理账单", "Gestionar facturación", "Gerenciar cobrança", "Gérer la facturation", "請求を管理", "Abrechnung verwalten", "결제 관리")}
              </button>
            )}
            <button
              type="button"
              onClick={handleSignOut}
              className="block w-full rounded-[var(--radius-sm)] px-2.5 py-1.5 text-left text-[13px] font-medium text-[color:var(--error)] transition hover:bg-[color:var(--error-surface)]"
            >
              {t("Sign out", "退出登录", "Cerrar sesión", "Sair", "Se déconnecter", "ログアウト", "Abmelden", "로그아웃")}
            </button>
          </div>
        </>
      )}

    </div>
  );
}
