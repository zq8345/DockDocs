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

type AccountState = {
  user: User | null;
  loading: boolean;
  error: string;
  email: string;
  password: string;
  emailOpen: boolean;
};

export function UserAccountControls() {
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
      <div className="rounded-full border border-[color:var(--line)] px-3 py-2 text-xs font-semibold text-[color:var(--muted)]">
        Account
      </div>
    );
  }

  if (state.user) {
    return (
      <div className="flex flex-wrap items-center justify-end gap-2 text-xs sm:text-sm">
        <a
          href="/my-chats"
          className="rounded-full border border-[color:var(--line)] px-3 py-2 font-semibold text-[color:var(--foreground)] transition hover:bg-black/5"
        >
          My Chats
        </a>
        <span className="max-w-[180px] truncate rounded-full bg-[color:var(--soft-accent)] px-3 py-2 font-semibold text-[color:var(--accent-strong)]">
          {state.user.name || state.user.email || "Signed in"}
        </span>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-full border border-[color:var(--line)] px-3 py-2 font-semibold text-[color:var(--muted)] transition hover:bg-black/5 hover:text-[color:var(--foreground)]"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="flex max-w-full flex-wrap items-center justify-end gap-2 text-xs sm:text-sm">
      <button
        type="button"
        onClick={() => oauthLogin("google")}
        className="rounded-full bg-[color:var(--accent)] px-3 py-2 font-semibold text-white transition hover:opacity-90"
      >
        Continue with Google
      </button>
      <button
        type="button"
        onClick={() =>
          setState((current) => ({ ...current, emailOpen: !current.emailOpen }))
        }
        className="rounded-full border border-[color:var(--line)] px-3 py-2 font-semibold text-[color:var(--muted)] transition hover:bg-black/5 hover:text-[color:var(--foreground)]"
      >
        Email
      </button>
      {state.emailOpen ? (
        <div className="grid w-full gap-2 rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] p-3 shadow-sm sm:w-72">
          <input
            value={state.email}
            onChange={(event) =>
              setState((current) => ({ ...current, email: event.target.value }))
            }
            placeholder="Email"
            type="email"
            className="min-h-10 rounded-md border border-[color:var(--line)] bg-[color:var(--background)] px-3 text-sm outline-none focus:border-[color:var(--accent)]"
          />
          <input
            value={state.password}
            onChange={(event) =>
              setState((current) => ({
                ...current,
                password: event.target.value,
              }))
            }
            placeholder="Password"
            type="password"
            className="min-h-10 rounded-md border border-[color:var(--line)] bg-[color:var(--background)] px-3 text-sm outline-none focus:border-[color:var(--accent)]"
          />
          <button
            type="button"
            onClick={handleEmailLogin}
            disabled={!state.email || !state.password}
            className="min-h-10 rounded-md bg-[color:var(--accent)] px-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Login
          </button>
          {state.error ? (
            <p className="text-xs leading-5 text-red-700">{state.error}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Account action failed.";
}
