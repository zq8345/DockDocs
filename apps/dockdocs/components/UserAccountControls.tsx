"use client";

import { useEffect, useState } from "react";
import {
  getUser,
  onAuthChange,
  signInWithGoogle,
  signInWithMicrosoft,
  sendMagicLink,
  signOut,
  type AuthUser,
} from "@/lib/auth";
import { usePathname } from "next/navigation";
import { getRuntimeCopy, localeFromPathname } from "@/lib/copy";
import { StatusBadge } from "@/components/ui/Status";
import {
  getSubscriptionSnapshot,
  type SubscriptionSnapshot,
} from "@/lib/subscription-runtime";

type AccountState = {
  user: AuthUser | null;
  subscription: SubscriptionSnapshot | null;
  loading: boolean;
  error: string;
  email: string;
  emailOpen: boolean;
  emailSent: boolean;
};

export function UserAccountControls() {
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const copy = getRuntimeCopy(locale).shell.account;
  const isZh = locale === "zh";
  const [state, setState] = useState<AccountState>({
    user: null,
    subscription: null,
    loading: true,
    error: "",
    email: "",
    emailOpen: false,
    emailSent: false,
  });

  useEffect(() => {
    let mounted = true;
    async function loadUser() {
      try {
        const user = await getUser();
        const subscription = await getSubscriptionSnapshot();
        if (mounted) setState((s) => ({ ...s, user, subscription, loading: false }));
      } catch (error) {
        if (mounted) setState((s) => ({ ...s, loading: false, error: getErrorMessage(error) }));
      }
    }
    loadUser();
    const unsubscribe = onAuthChange(async (user) => {
      const subscription = await getSubscriptionSnapshot();
      setState((s) => ({ ...s, user, subscription, loading: false, error: "" }));
    });
    return () => { mounted = false; unsubscribe(); };
  }, []);

  async function handleMagicLink() {
    setState((s) => ({ ...s, error: "" }));
    try {
      await sendMagicLink(state.email.trim());
      setState((s) => ({ ...s, emailSent: true }));
    } catch (error) {
      setState((s) => ({ ...s, error: getErrorMessage(error) }));
    }
  }

  async function handleOAuth(fn: () => Promise<void>) {
    setState((s) => ({ ...s, error: "" }));
    try { await fn(); } catch (error) { setState((s) => ({ ...s, error: getErrorMessage(error) })); }
  }

  async function handleLogout() {
    try {
      await signOut();
      const subscription = await getSubscriptionSnapshot();
      setState((s) => ({ ...s, user: null, subscription, email: "", emailOpen: false, emailSent: false }));
    } catch (error) {
      setState((s) => ({ ...s, error: getErrorMessage(error) }));
    }
  }

  if (state.loading) {
    return <StatusBadge label={copy.account} status="Idle" />;
  }

  if (state.user) {
    return (
      <div className="grid max-w-full gap-3 text-xs sm:text-sm">
        <div className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">{copy.signedIn}</p>
          <p className="mt-1 max-w-[240px] truncate text-sm font-semibold">{state.user.name || state.user.email || copy.signedIn}</p>
          <div className="mt-2">
            <StatusBadge label={`Plan: ${state.subscription?.displayName ?? "Free"}`} status="Saved" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a href="/my-chats" className="inline-flex min-h-11 items-center rounded-[var(--radius-sm)] border border-[color:var(--line)] px-3 py-2 font-semibold text-[color:var(--foreground)] transition hover:bg-black/5 active:scale-[0.99]">
            {copy.myChats}
          </a>
          <button type="button" onClick={handleLogout} className="inline-flex min-h-11 items-center rounded-[var(--radius-sm)] border border-[color:var(--line)] px-3 py-2 font-semibold text-[color:var(--muted)] transition hover:bg-black/5 hover:text-[color:var(--foreground)] active:scale-[0.99]">
            {copy.logout}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid max-w-full gap-3 text-xs sm:text-sm">
      <div className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold">{copy.signedOutTitle}</p>
            <p className="mt-1 text-xs leading-5 text-[color:var(--muted)]">
              {isZh ? "登录后可按账户隔离我的对话和工作区记录。" : "Sign in to isolate My Chats and workspace records by account."}
            </p>
          </div>
          <StatusBadge className="shrink-0 text-[10px]" label={state.subscription?.displayName ?? copy.currentPlan} status="Session-only" />
        </div>
      </div>
      <div className="flex max-w-full flex-wrap items-center gap-2">
        <button type="button" onClick={() => handleOAuth(signInWithGoogle)} className="inline-flex min-h-11 items-center rounded-[var(--radius-sm)] bg-[color:var(--foreground)] px-3 py-2 font-semibold text-[color:var(--background)] transition hover:opacity-90 active:scale-[0.99]">
          {copy.continueGoogle}
        </button>
        <button type="button" onClick={() => handleOAuth(signInWithMicrosoft)} className="inline-flex min-h-11 items-center rounded-[var(--radius-sm)] border border-[color:var(--line)] px-3 py-2 font-semibold text-[color:var(--foreground)] transition hover:bg-black/5 active:scale-[0.99]">
          {isZh ? "Microsoft" : "Microsoft"}
        </button>
        <button type="button" onClick={() => setState((s) => ({ ...s, emailOpen: !s.emailOpen, emailSent: false }))} className="inline-flex min-h-11 items-center rounded-[var(--radius-sm)] border border-[color:var(--line)] px-3 py-2 font-semibold text-[color:var(--muted)] transition hover:bg-black/5 hover:text-[color:var(--foreground)] active:scale-[0.99]">
          {copy.email}
        </button>
      </div>
      {state.emailOpen ? (
        <div className="grid w-full gap-2 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-3 shadow-sm sm:w-72">
          {state.emailSent ? (
            <p className="text-xs leading-5 text-[color:var(--success)]">
              {isZh ? "登录链接已发送到邮箱,点击邮件中的链接即可登录。" : "Magic link sent — check your email to sign in."}
            </p>
          ) : (
            <>
              <input
                value={state.email}
                onChange={(e) => setState((s) => ({ ...s, email: e.target.value }))}
                placeholder={copy.email}
                type="email"
                className="min-h-11 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3 text-sm outline-none focus:border-[color:var(--accent)]"
              />
              <button type="button" onClick={handleMagicLink} disabled={!state.email} className="min-h-11 rounded-[var(--radius-sm)] bg-[color:var(--accent)] px-3 text-sm font-semibold text-white transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50">
                {isZh ? "发送登录链接" : "Send magic link"}
              </button>
              <p className="text-[11px] leading-4 text-[color:var(--faint)]">{isZh ? "免密码,我们会发一封登录邮件" : "No password — we'll email you a sign-in link"}</p>
            </>
          )}
          {state.error ? <p className="text-xs leading-5 text-[color:var(--error)]">{state.error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : getRuntimeCopy().shell.account.actionFailed;
}
