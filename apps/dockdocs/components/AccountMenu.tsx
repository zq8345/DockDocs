"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { defaultLocale } from "@/lib/i18n";
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
// the account page exactly. All upgrade prompts route to /pricing (interval is
// chosen there); only "Manage billing" acts directly (Creem portal).

function lh(href: string, locale: string) {
  return locale === defaultLocale ? href : `/${locale}${href}`;
}

function asMembershipLocale(locale: string): MembershipLocale {
  return locale === "zh" || locale === "es" || locale === "pt" || locale === "fr" ? locale : "en";
}

const linkCls =
  "block w-full rounded-[var(--radius-sm)] px-2.5 py-1.5 text-left text-[13px] font-medium text-[color:var(--muted)] transition hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)]";

export function AccountMenu({ authUser, locale }: { authUser: AuthUser | null; locale: string }) {
  const router = useRouter();
  const loc = asMembershipLocale(locale);
  const [open, setOpen] = useState(false);
  const [snapshot, setSnapshot] = useState<SubscriptionSnapshot | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);

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

  const t = (en: string, zh: string, es: string, pt: string, fr: string) =>
    loc === "zh" ? zh : loc === "es" ? es : loc === "pt" ? pt : loc === "fr" ? fr : en;

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
        {t("Sign in", "登录", "Iniciar sesión", "Entrar", "Connexion")}
      </button>
    );
  }

  const name = authUser.name ?? authUser.email ?? t("Account", "账户", "Cuenta", "Conta", "Compte");
  const display = snapshot?.displayName ?? "Free";
  const interval = snapshot?.record.interval;
  const badge = planBadge(display, interval, loc);
  const prompts = snapshot ? upgradePrompts(display, interval, loc) : [];
  const isPaid = snapshot?.isPaidPlaceholder ?? false;

  return (
    <div className="relative hidden md:block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={t("Account", "账户", "Cuenta", "Conta", "Compte")}
        className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--background)] py-1 pl-1 pr-2.5 transition hover:border-[color:var(--line-strong)]"
      >
        <span className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-[color:var(--accent)] text-[11px] font-semibold text-[color:var(--on-accent)]">
          {authUser.pictureUrl ? (
            <img src={authUser.pictureUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            name.charAt(0).toUpperCase()
          )}
        </span>
        <span className="max-w-[120px] truncate text-[13px] font-medium text-[color:var(--foreground)]">{name}</span>
        <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${badge.className}`}>{badge.label}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" aria-hidden="true" onClick={() => setOpen(false)} />
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
                    },
                    loc,
                  )}
                </p>
              )}
            </div>

            {/* upgrade prompts → pricing (interval chosen there) */}
            {prompts.length > 0 && (
              <div className="mt-1.5 space-y-1 px-1">
                {prompts.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => go("/pricing")}
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
              {t("Account center", "账户中心", "Centro de cuenta", "Central da conta", "Centre du compte")}
            </button>
            {isPaid && (
              <button type="button" onClick={handlePortal} disabled={billingLoading} className={`${linkCls} disabled:opacity-50`}>
                {billingLoading
                  ? t("Opening…", "打开中…", "Abriendo…", "Abrindo…", "Ouverture…")
                  : t("Manage billing", "管理账单", "Gestionar facturación", "Gerenciar cobrança", "Gérer la facturation")}
              </button>
            )}
            <button
              type="button"
              onClick={handleSignOut}
              className="block w-full rounded-[var(--radius-sm)] px-2.5 py-1.5 text-left text-[13px] font-medium text-[color:var(--error)] transition hover:bg-[color:var(--error-surface)]"
            >
              {t("Sign out", "退出登录", "Cerrar sesión", "Sair", "Se déconnecter")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
