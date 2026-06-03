"use client";

import { useEffect, useState } from "react";
import {
  getUser,
  handleAuthCallback,
  login,
  logout,
  oauthLogin,
  onAuthChange,
  type User,
} from "@netlify/identity";
import { usePathname } from "next/navigation";
import { getRuntimeCopy, localeFromPathname } from "@/lib/copy";
import {
  getSubscriptionSnapshot,
  type SubscriptionSnapshot,
} from "@/lib/subscription-runtime";

type AccountState = {
  user: User | null;
  subscription: SubscriptionSnapshot | null;
  loading: boolean;
  error: string;
  email: string;
  password: string;
  emailOpen: boolean;
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
    password: "",
    emailOpen: false,
  });

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        await handleAuthCallback();
        const user = await getUser();
        const subscription = await getSubscriptionSnapshot();
        if (mounted) {
          setState((current) => ({
            ...current,
            user,
            subscription,
            loading: false,
          }));
        }
      } catch (error) {
        if (mounted) {
          setState((current) => ({
            ...current,
            loading: false,
            error: getErrorMessage(error),
          }));
        }
      }
    }

    loadUser();
    const unsubscribe = onAuthChange(async (_event, user) => {
      const subscription = await getSubscriptionSnapshot();
      setState((current) => ({
        ...current,
        user,
        subscription,
        loading: false,
        error: "",
      }));
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  async function handleEmailLogin() {
    setState((current) => ({ ...current, error: "" }));

    try {
      const user = await login(state.email, state.password);
      const subscription = await getSubscriptionSnapshot();
      setState((current) => ({
        ...current,
        user,
        subscription,
        password: "",
        emailOpen: false,
      }));
    } catch (error) {
      setState((current) => ({ ...current, error: getErrorMessage(error) }));
    }
  }

  async function handleGoogleLogin() {
    setState((current) => ({ ...current, error: "" }));

    try {
      await oauthLogin("google");
    } catch (error) {
      setState((current) => ({ ...current, error: getErrorMessage(error) }));
    }
  }

  async function handleLogout() {
    try {
      await logout();
      const subscription = await getSubscriptionSnapshot();
      setState((current) => ({
        ...current,
        user: null,
        subscription,
        password: "",
      }));
    } catch (error) {
      setState((current) => ({ ...current, error: getErrorMessage(error) }));
    }
  }

  if (state.loading) {
    return (
      <div className="rounded-[var(--radius-sm)] border border-[color:var(--line)] px-3 py-2 text-xs font-semibold text-[color:var(--muted)]">
        {copy.account}
      </div>
    );
  }

  if (state.user) {
    return (
      <div className="grid max-w-full gap-3 text-xs sm:text-sm">
        <div className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">
            {copy.signedIn}
          </p>
          <p className="mt-1 max-w-[240px] truncate text-sm font-semibold">
            {state.user.name || state.user.email || copy.signedIn}
          </p>
          <p className="mt-2 text-xs font-semibold text-[color:var(--muted)]">
            Plan: {state.subscription?.displayName ?? "Free"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
        <a
          href="/my-chats"
          className="inline-flex min-h-11 items-center rounded-[var(--radius-sm)] border border-[color:var(--line)] px-3 py-2 font-semibold text-[color:var(--foreground)] transition hover:bg-black/5 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]"
        >
          {copy.myChats}
        </a>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex min-h-11 items-center rounded-[var(--radius-sm)] border border-[color:var(--line)] px-3 py-2 font-semibold text-[color:var(--muted)] transition hover:bg-black/5 hover:text-[color:var(--foreground)] active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]"
        >
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
              {isZh
                ? "登录后可按账户隔离我的对话和工作区记录。"
                : "Sign in to isolate My Chats and workspace records by account."}
            </p>
          </div>
          <span className="shrink-0 rounded-[var(--radius-sm)] border border-[color:var(--line)] px-2 py-1 text-[10px] font-semibold text-[color:var(--muted)]">
            {state.subscription?.displayName ?? copy.currentPlan}
          </span>
        </div>
      </div>
      <div className="flex max-w-full flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="inline-flex min-h-11 items-center rounded-[var(--radius-sm)] bg-[color:var(--foreground)] px-3 py-2 font-semibold text-[color:var(--background)] transition hover:opacity-90 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]"
      >
        {copy.continueGoogle}
      </button>
      <button
        type="button"
        onClick={() =>
          setState((current) => ({ ...current, emailOpen: !current.emailOpen }))
        }
        className="inline-flex min-h-11 items-center rounded-[var(--radius-sm)] border border-[color:var(--line)] px-3 py-2 font-semibold text-[color:var(--muted)] transition hover:bg-black/5 hover:text-[color:var(--foreground)] active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]"
      >
        {copy.email}
      </button>
      </div>
      {state.emailOpen ? (
        <div className="grid w-full gap-2 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-3 shadow-sm sm:w-72">
          <input
            value={state.email}
            onChange={(event) =>
              setState((current) => ({ ...current, email: event.target.value }))
            }
            placeholder={copy.email}
            type="email"
            className="min-h-11 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3 text-sm outline-none focus:border-[color:var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]"
          />
          <input
            value={state.password}
            onChange={(event) =>
              setState((current) => ({
                ...current,
                password: event.target.value,
              }))
            }
            placeholder={copy.password}
            type="password"
            className="min-h-11 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3 text-sm outline-none focus:border-[color:var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]"
          />
          <button
            type="button"
            onClick={handleEmailLogin}
            disabled={!state.email || !state.password}
            className="min-h-11 rounded-[var(--radius-sm)] bg-[color:var(--accent)] px-3 text-sm font-semibold text-white transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]"
          >
            {copy.login}
          </button>
          {state.error ? (
            <p className="text-xs leading-5 text-[color:var(--error)]">{state.error}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : getRuntimeCopy().shell.account.actionFailed;
}
