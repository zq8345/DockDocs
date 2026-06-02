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
import { defaultLocale, localizedPath } from "@/lib/i18n";

type AccountState = {
  user: User | null;
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
  const pricingHref =
    locale === defaultLocale ? "/pricing/" : localizedPath(locale, "pricing");
  const [state, setState] = useState<AccountState>({
    user: null,
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
        if (mounted) {
          setState((current) => ({ ...current, user, loading: false }));
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
    const unsubscribe = onAuthChange((_event, user) => {
      setState((current) => ({ ...current, user, loading: false, error: "" }));
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
      setState((current) => ({
        ...current,
        user,
        password: "",
        emailOpen: false,
      }));
    } catch (error) {
      setState((current) => ({ ...current, error: getErrorMessage(error) }));
    }
  }

  async function handleLogout() {
    await logout();
    setState((current) => ({ ...current, user: null, password: "" }));
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
        </div>
        <div className="flex flex-wrap items-center gap-2">
        <a
          href="/my-chats"
          className="inline-flex min-h-11 items-center rounded-[var(--radius-sm)] border border-[color:var(--line)] px-3 py-2 font-semibold text-[color:var(--foreground)] transition hover:bg-black/5 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]"
        >
          {copy.myChats}
        </a>
        <a
          href={pricingHref}
          className="inline-flex min-h-11 items-center rounded-[var(--radius-sm)] bg-[color:var(--accent)] px-3 py-2 font-semibold text-white transition hover:opacity-90 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]"
        >
          {copy.upgrade}
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
              {copy.signedOutDescription}
            </p>
          </div>
          <span className="shrink-0 rounded-[var(--radius-sm)] border border-[color:var(--line)] px-2 py-1 text-[10px] font-semibold text-[color:var(--muted)]">
            {copy.currentPlan}
          </span>
        </div>
        <a
          href={pricingHref}
          className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-[var(--radius-sm)] bg-[color:var(--accent)] px-3 py-2 font-semibold text-white transition hover:opacity-90 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]"
        >
          {copy.upgrade}
        </a>
      </div>
      <div className="flex max-w-full flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => oauthLogin("google")}
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
