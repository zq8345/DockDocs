"use client";

import { useEffect, useState } from "react";
import {
  getUser,
  handleAuthCallback,
  login,
  logout,
  oauthLogin,
  onAuthChange,
  signup,
  type User,
} from "@netlify/identity";
import { getDockAccountState, type DockAccountState } from "@/lib/account-runtime";
import {
  createBillingCheckoutSession,
  createBillingPortalSession,
  getSubscriptionSnapshot,
  type SubscriptionSnapshot,
} from "@/lib/subscription-runtime";
import type { PaidSubscriptionPlan } from "@/lib/billing-config";

type FormState = {
  name: string;
  email: string;
  password: string;
};

const initialForm: FormState = {
  name: "",
  email: "",
  password: "",
};

export function CommercialAccountClient() {
  const [user, setUser] = useState<User | null>(null);
  const [account, setAccount] = useState<DockAccountState | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionSnapshot | null>(
    null,
  );
  const [form, setForm] = useState<FormState>(initialForm);
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [loading, setLoading] = useState(true);
  const [billingAction, setBillingAction] = useState<
    "checkout-plus" | "checkout-pro" | "portal" | ""
  >("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const callback = await handleAuthCallback();
        const currentUser = await getUser();
        if (!mounted) {
          return;
        }

        setUser(currentUser);
        setAccount(await getDockAccountState());
        setSubscription(await getSubscriptionSnapshot());
        if (callback?.type === "oauth" || callback?.type === "confirmation") {
          setMessage("Account session is active.");
        }
        if (window.location.search.includes("checkout=success")) {
          setMessage(
            "Checkout returned. Subscription updates after Stripe webhook sync.",
          );
        }
      } catch (loadError) {
        if (mounted) {
          setError(getErrorMessage(loadError));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();
    const unsubscribe = onAuthChange(async (_event, nextUser) => {
      setUser(nextUser);
      setAccount(await getDockAccountState());
      setSubscription(await getSubscriptionSnapshot());
      setError("");
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  async function refreshAccount() {
    setAccount(await getDockAccountState());
    setSubscription(await getSubscriptionSnapshot());
  }

  async function handleSignup() {
    setError("");
    setMessage("");
    try {
      const nextUser = await signup(form.email, form.password, {
        full_name: form.name,
      });
      setUser(nextUser);
      setForm(initialForm);
      const emailVerified = Boolean(
        (nextUser as User & { emailVerified?: boolean }).emailVerified,
      );
      setMessage(
        emailVerified
          ? "Account created. You are signed in."
          : "Account created. Check your email to confirm access.",
      );
      await refreshAccount();
    } catch (signupError) {
      setError(getErrorMessage(signupError));
    }
  }

  async function handleLogin() {
    setError("");
    setMessage("");
    try {
      const nextUser = await login(form.email, form.password);
      setUser(nextUser);
      setForm(initialForm);
      setMessage("Signed in.");
      await refreshAccount();
    } catch (loginError) {
      setError(getErrorMessage(loginError));
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setMessage("");
    try {
      await oauthLogin("google");
    } catch (oauthError) {
      setError(getErrorMessage(oauthError));
    }
  }

  async function handleLogout() {
    setError("");
    setMessage("");
    try {
      await logout();
      setUser(null);
      await refreshAccount();
    } catch (logoutError) {
      setError(getErrorMessage(logoutError));
    }
  }

  async function handleCheckout(plan: PaidSubscriptionPlan) {
    setError("");
    setMessage("");
    setBillingAction(plan === "PLUS" ? "checkout-plus" : "checkout-pro");
    try {
      const url = await createBillingCheckoutSession(plan);
      window.location.assign(url);
    } catch (checkoutError) {
      setError(getErrorMessage(checkoutError));
    } finally {
      setBillingAction("");
    }
  }

  async function handlePortal() {
    setError("");
    setMessage("");
    setBillingAction("portal");
    try {
      const url = await createBillingPortalSession();
      window.location.assign(url);
    } catch (portalError) {
      setError(getErrorMessage(portalError));
    } finally {
      setBillingAction("");
    }
  }

  if (loading) {
    return (
      <section className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-6">
        <p className="text-sm font-semibold text-[color:var(--muted)]">
          Loading account...
        </p>
      </section>
    );
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="grid gap-6">
        <AccountStatusCard
          user={user}
          account={account}
          subscription={subscription}
          onLogout={handleLogout}
        />
        {user ? null : (
          <LoginCard
            form={form}
            mode={mode}
            onFormChange={setForm}
            onGoogleLogin={handleGoogleLogin}
            onModeChange={setMode}
            onSubmit={mode === "signup" ? handleSignup : handleLogin}
          />
        )}
      </div>

      <div className="grid gap-6">
        <PlanCard
          signedIn={Boolean(user)}
          subscription={subscription}
          billingAction={billingAction}
          onCheckout={handleCheckout}
          onPortal={handlePortal}
        />
        <WorkspaceBindingCard account={account} />
        {message ? (
          <p className="rounded-[var(--radius-sm)] border border-[color:var(--success-line)] bg-[color:var(--success-surface)] p-3 text-sm font-semibold text-[color:var(--success)]">
            {message}
          </p>
        ) : null}
        {error ? (
          <p role="alert" className="rounded-[var(--radius-sm)] border border-[color:var(--error-line)] bg-[color:var(--error-surface)] p-3 text-sm font-semibold text-[color:var(--error)]">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  );
}

function AccountStatusCard({
  user,
  account,
  subscription,
  onLogout,
}: {
  user: User | null;
  account: DockAccountState | null;
  subscription: SubscriptionSnapshot | null;
  onLogout: () => void;
}) {
  return (
    <section className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
        Current user
      </p>
      <h2 className="mt-2 break-words text-2xl font-semibold">
        {user ? user.name || user.email || "Signed-in user" : "Anonymous browser"}
      </h2>
      <dl className="mt-4 grid gap-3 text-sm">
        <div>
          <dt className="font-semibold text-[color:var(--muted)]">Status</dt>
          <dd className="mt-1 font-semibold">
            {account?.signedIn ? "Signed in" : "Not signed in"}
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-[color:var(--muted)]">Plan</dt>
          <dd className="mt-1 font-semibold">
            {subscription?.displayName ?? "Free"}
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-[color:var(--muted)]">Plan status</dt>
          <dd className="mt-1 font-semibold">
            {subscription?.statusLabel ?? "Free placeholder"}
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-[color:var(--muted)]">
            Workspace storage
          </dt>
          <dd className="mt-1 break-all font-semibold">
            {account?.storageId ?? "anonymous"}
          </dd>
        </div>
      </dl>
      {user ? (
        <button
          type="button"
          onClick={onLogout}
          className="mt-5 min-h-11 rounded-[var(--radius-sm)] border border-[color:var(--line)] px-4 text-sm font-semibold text-[color:var(--foreground)]"
        >
          Logout
        </button>
      ) : null}
    </section>
  );
}

function LoginCard({
  form,
  mode,
  onFormChange,
  onGoogleLogin,
  onModeChange,
  onSubmit,
}: {
  form: FormState;
  mode: "login" | "signup";
  onFormChange: (form: FormState) => void;
  onGoogleLogin: () => void;
  onModeChange: (mode: "login" | "signup") => void;
  onSubmit: () => void;
}) {
  return (
    <section className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
        Sign in
      </p>
      <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
        Sign in to keep saved chats and workspace metadata scoped to your
        account. Anonymous workspace data remains local to this browser.
      </p>
      <button
        type="button"
        onClick={onGoogleLogin}
        className="mt-4 min-h-11 w-full rounded-[var(--radius-sm)] bg-[color:var(--foreground)] px-4 text-sm font-semibold text-[color:var(--background)]"
      >
        Continue with Google
      </button>
      <div className="mt-4 grid grid-cols-2 gap-2 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-1">
        {(["signup", "login"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onModeChange(item)}
            className={
              mode === item
                ? "min-h-10 rounded-[var(--radius-sm)] bg-[color:var(--foreground)] px-3 text-sm font-semibold text-[color:var(--background)]"
                : "min-h-10 rounded-[var(--radius-sm)] px-3 text-sm font-semibold text-[color:var(--muted)]"
            }
          >
            {item === "signup" ? "Sign up" : "Login"}
          </button>
        ))}
      </div>
      <div className="mt-3 grid gap-3">
        {mode === "signup" ? (
          <input
            value={form.name}
            onChange={(event) =>
              onFormChange({ ...form, name: event.target.value })
            }
            placeholder="Name"
            className="min-h-11 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3 text-sm outline-none"
          />
        ) : null}
        <input
          value={form.email}
          onChange={(event) =>
            onFormChange({ ...form, email: event.target.value })
          }
          placeholder="Email"
          type="email"
          className="min-h-11 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3 text-sm outline-none"
        />
        <input
          value={form.password}
          onChange={(event) =>
            onFormChange({ ...form, password: event.target.value })
          }
          placeholder="Password"
          type="password"
          className="min-h-11 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3 text-sm outline-none"
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={!form.email || !form.password}
          className="min-h-11 rounded-[var(--radius-sm)] bg-[color:var(--accent)] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {mode === "signup" ? "Create account" : "Login"}
        </button>
      </div>
    </section>
  );
}

function PlanCard({
  signedIn,
  subscription,
  billingAction,
  onCheckout,
  onPortal,
}: {
  signedIn: boolean;
  subscription: SubscriptionSnapshot | null;
  billingAction: "checkout-plus" | "checkout-pro" | "portal" | "";
  onCheckout: (plan: PaidSubscriptionPlan) => void;
  onPortal: () => void;
}) {
  const plan = subscription?.displayName ?? "Free";
  const status = subscription?.statusLabel ?? "Free";
  const source = subscription?.record.source ?? "local";

  return (
    <section className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
        Plan
      </p>
      <h2 className="mt-2 text-3xl font-semibold">{plan}</h2>
      <p className="mt-2 text-sm font-semibold text-[color:var(--muted)]">
        {status}
      </p>
      <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
        Stripe checkout is available for signed-in accounts. Subscription status
        is trusted only after Stripe webhook sync.
      </p>
      <dl className="mt-4 grid gap-2 text-sm">
        <div className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3">
          <dt className="font-semibold text-[color:var(--muted)]">Source</dt>
          <dd className="mt-1 font-semibold">
            {source}
          </dd>
        </div>
        {subscription?.record.currentPeriodEnd ? (
          <div className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3">
            <dt className="font-semibold text-[color:var(--muted)]">
              Current period ends
            </dt>
            <dd className="mt-1 break-words font-semibold">
              {subscription.record.currentPeriodEnd}
            </dd>
          </div>
        ) : null}
        <div className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3">
          <dt className="font-semibold text-[color:var(--muted)]">Updated</dt>
          <dd className="mt-1 break-words font-semibold">
            {subscription?.record.updatedAt ?? "Not set"}
          </dd>
        </div>
      </dl>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onCheckout("PLUS")}
          disabled={!signedIn || billingAction !== ""}
          className="min-h-11 rounded-[var(--radius-sm)] bg-[color:var(--accent)] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {billingAction === "checkout-plus" ? "Opening..." : "Upgrade to Plus"}
        </button>
        <button
          type="button"
          onClick={() => onCheckout("PRO")}
          disabled={!signedIn || billingAction !== ""}
          className="min-h-11 rounded-[var(--radius-sm)] border border-[color:var(--line)] px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
        >
          {billingAction === "checkout-pro" ? "Opening..." : "Upgrade to Pro"}
        </button>
        <button
          type="button"
          onClick={onPortal}
          disabled={!signedIn || billingAction !== ""}
          className="min-h-11 rounded-[var(--radius-sm)] border border-[color:var(--line)] px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2"
        >
          {billingAction === "portal" ? "Opening billing..." : "Manage billing"}
        </button>
      </div>
      {!signedIn ? (
        <p className="mt-3 text-xs font-semibold text-[color:var(--muted)]">
          Sign in to start checkout or open the customer portal.
        </p>
      ) : null}
    </section>
  );
}

function WorkspaceBindingCard({
  account,
}: {
  account: DockAccountState | null;
}) {
  return (
    <section className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
        Workspace binding
      </p>
      <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
        Workspace records use the current account storage ID. Original PDFs are
        not stored.
      </p>
      <p className="mt-4 break-all rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3 text-sm font-semibold">
        {account?.storageId ?? "anonymous"}
      </p>
    </section>
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Account action failed.";
}
