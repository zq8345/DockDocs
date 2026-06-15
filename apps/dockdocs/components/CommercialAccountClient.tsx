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
import { getDockAccountState, type DockAccountState } from "@/lib/account-runtime";
import {
  createBillingCheckoutSession,
  createBillingPortalSession,
  getSubscriptionSnapshot,
  type SubscriptionSnapshot,
} from "@/lib/subscription-runtime";
import { StatusBadge } from "@/components/ui/Status";
import type { PaidSubscriptionPlan } from "@/lib/billing-config";

export function CommercialAccountClient() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [account, setAccount] = useState<DockAccountState | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionSnapshot | null>(null);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [billingAction, setBillingAction] = useState<"checkout-plus" | "checkout-pro" | "portal" | "">("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const currentUser = await getUser();
        if (!mounted) return;
        setUser(currentUser);
        setAccount(await getDockAccountState());
        setSubscription(await getSubscriptionSnapshot());
        if (window.location.search.includes("checkout=success")) {
          setMessage("结算已返回，订阅将在 Stripe 同步后更新。");
        }
      } catch (loadError) {
        if (mounted) setError(getErrorMessage(loadError));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    const unsubscribe = onAuthChange(async (nextUser) => {
      setUser(nextUser);
      setAccount(await getDockAccountState());
      setSubscription(await getSubscriptionSnapshot());
      setError("");
    });
    return () => { mounted = false; unsubscribe(); };
  }, []);

  async function refreshAccount() {
    setAccount(await getDockAccountState());
    setSubscription(await getSubscriptionSnapshot());
  }

  async function handleMagicLink() {
    setError(""); setMessage("");
    try {
      await sendMagicLink(email.trim());
      setEmailSent(true);
      setMessage("登录链接已发送到邮箱，点击邮件中的链接即可登录。");
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }

  async function handleOAuth(fn: () => Promise<void>) {
    setError(""); setMessage("");
    try { await fn(); } catch (e) { setError(getErrorMessage(e)); }
  }

  async function handleLogout() {
    setError(""); setMessage("");
    try { await signOut(); setUser(null); await refreshAccount(); } catch (e) { setError(getErrorMessage(e)); }
  }

  async function handleCheckout(plan: PaidSubscriptionPlan) {
    setError(""); setMessage(""); setBillingAction(plan === "PLUS" ? "checkout-plus" : "checkout-pro");
    try { const url = await createBillingCheckoutSession(plan); window.location.assign(url); }
    catch (e) { setError(getErrorMessage(e)); } finally { setBillingAction(""); }
  }

  async function handlePortal() {
    setError(""); setMessage(""); setBillingAction("portal");
    try { const url = await createBillingPortalSession(); window.location.assign(url); }
    catch (e) { setError(getErrorMessage(e)); } finally { setBillingAction(""); }
  }

  if (loading) {
    return (
      <section className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-6">
        <StatusBadge label="加载账户中…" status="Idle" />
      </section>
    );
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="grid gap-6">
        <AccountStatusCard user={user} account={account} subscription={subscription} onLogout={handleLogout} />
        {user ? null : (
          <LoginCard
            email={email}
            emailSent={emailSent}
            onEmailChange={setEmail}
            onMagicLink={handleMagicLink}
            onGoogle={() => handleOAuth(signInWithGoogle)}
            onMicrosoft={() => handleOAuth(signInWithMicrosoft)}
          />
        )}
      </div>

      <div className="grid gap-6">
        <PlanCard signedIn={Boolean(user)} subscription={subscription} billingAction={billingAction} onCheckout={handleCheckout} onPortal={handlePortal} />
        <WorkspaceBindingCard account={account} />
        {message ? <StatusBadge className="justify-start p-3 text-sm" label={message} status="Completed" /> : null}
        {error ? <StatusBadge role="alert" className="justify-start p-3 text-sm" label={error} status="Blocked" /> : null}
      </div>
    </section>
  );
}

function AccountStatusCard({
  user, account, subscription, onLogout,
}: {
  user: AuthUser | null;
  account: DockAccountState | null;
  subscription: SubscriptionSnapshot | null;
  onLogout: () => void;
}) {
  return (
    <section className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">当前用户</p>
      <h2 className="mt-2 break-words text-2xl font-semibold">{user ? user.name || user.email || "已登录用户" : "匿名浏览器"}</h2>
      <dl className="mt-4 grid gap-3 text-sm">
        <div>
          <dt className="font-semibold text-[color:var(--muted)]">状态</dt>
          <dd className="mt-1"><StatusBadge label={account?.signedIn ? "已登录" : "未登录"} status={account?.signedIn ? "Active" : "Session-only"} /></dd>
        </div>
        <div>
          <dt className="font-semibold text-[color:var(--muted)]">套餐</dt>
          <dd className="mt-1 font-semibold">{subscription?.displayName ?? "Free"}</dd>
        </div>
        <div>
          <dt className="font-semibold text-[color:var(--muted)]">套餐状态</dt>
          <dd className="mt-1"><StatusBadge label={subscription?.statusLabel ?? "Free"} status={subscription?.record.status === "active" ? "Active" : "Backlog"} /></dd>
        </div>
        <div>
          <dt className="font-semibold text-[color:var(--muted)]">工作区存储</dt>
          <dd className="mt-1 break-all font-semibold">{account?.storageId ?? "anonymous"}</dd>
        </div>
      </dl>
      {user ? (
        <button type="button" onClick={onLogout} className="mt-5 min-h-11 rounded-[var(--radius-sm)] border border-[color:var(--line)] px-4 text-sm font-semibold text-[color:var(--foreground)]">退出登录</button>
      ) : null}
    </section>
  );
}

function LoginCard({
  email, emailSent, onEmailChange, onMagicLink, onGoogle, onMicrosoft,
}: {
  email: string;
  emailSent: boolean;
  onEmailChange: (v: string) => void;
  onMagicLink: () => void;
  onGoogle: () => void;
  onMicrosoft: () => void;
}) {
  return (
    <section className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">登录</p>
      <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">登录后，保存的对话与工作区元数据将归属你的账户；匿名数据仅保留在本浏览器。</p>
      <button type="button" onClick={onGoogle} className="mt-4 min-h-11 w-full rounded-[var(--radius-sm)] bg-[color:var(--foreground)] px-4 text-sm font-semibold text-[color:var(--background)]">使用 Google 继续</button>
      <button type="button" onClick={onMicrosoft} className="mt-2 min-h-11 w-full rounded-[var(--radius-sm)] border border-[color:var(--line)] px-4 text-sm font-semibold text-[color:var(--foreground)]">使用 Microsoft 继续</button>
      <div className="mt-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-[color:var(--line)]" />
        <span className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--faint)]">或邮箱</span>
        <div className="h-px flex-1 bg-[color:var(--line)]" />
      </div>
      {emailSent ? (
        <p className="mt-3 text-sm leading-6 text-[color:var(--success)]">登录链接已发送到邮箱，点击即可登录(可能在垃圾箱)。</p>
      ) : (
        <div className="mt-3 grid gap-2">
          <input value={email} onChange={(e) => onEmailChange(e.target.value)} placeholder="you@example.com" type="email"
            className="min-h-11 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3 text-sm outline-none" />
          <button type="button" onClick={onMagicLink} disabled={!email}
            className="min-h-11 rounded-[var(--radius-sm)] bg-[color:var(--accent)] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">发送登录链接</button>
          <p className="text-[11px] text-[color:var(--faint)]">免密码，我们会发一封登录邮件给你</p>
        </div>
      )}
    </section>
  );
}

function PlanCard({
  signedIn, subscription, billingAction, onCheckout, onPortal,
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
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">套餐</p>
      <h2 className="mt-2 text-3xl font-semibold">{plan}</h2>
      <div className="mt-2"><StatusBadge label={status} status={subscription?.record.status === "active" ? "Active" : "Backlog"} /></div>
      <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">登录后可发起 Stripe 结算；订阅状态以 Stripe webhook 同步后为准。</p>
      <dl className="mt-4 grid gap-2 text-sm">
        <div className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3">
          <dt className="font-semibold text-[color:var(--muted)]">来源</dt>
          <dd className="mt-1"><StatusBadge label={source} status={source === "manual" ? "Local" : "Synced"} /></dd>
        </div>
        {subscription?.record.currentPeriodEnd ? (
          <div className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3">
            <dt className="font-semibold text-[color:var(--muted)]">本期结束</dt>
            <dd className="mt-1 break-words font-semibold">{subscription.record.currentPeriodEnd}</dd>
          </div>
        ) : null}
        <div className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3">
          <dt className="font-semibold text-[color:var(--muted)]">更新时间</dt>
          <dd className="mt-1 break-words font-semibold">{subscription?.record.updatedAt ?? "未设置"}</dd>
        </div>
      </dl>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <button type="button" onClick={() => onCheckout("PLUS")} disabled={!signedIn || billingAction !== ""} className="min-h-11 rounded-[var(--radius-sm)] bg-[color:var(--accent)] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
          {billingAction === "checkout-plus" ? "打开中…" : "升级 Plus"}
        </button>
        <button type="button" onClick={() => onCheckout("PRO")} disabled={!signedIn || billingAction !== ""} className="min-h-11 rounded-[var(--radius-sm)] border border-[color:var(--line)] px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50">
          {billingAction === "checkout-pro" ? "打开中…" : "升级 Pro"}
        </button>
        <button type="button" onClick={onPortal} disabled={!signedIn || billingAction !== ""} className="min-h-11 rounded-[var(--radius-sm)] border border-[color:var(--line)] px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2">
          {billingAction === "portal" ? "打开账单…" : "管理账单"}
        </button>
      </div>
      {!signedIn ? <p className="mt-3 text-xs font-semibold text-[color:var(--muted)]">登录后即可发起结算或打开客户门户。</p> : null}
    </section>
  );
}

function WorkspaceBindingCard({ account }: { account: DockAccountState | null }) {
  return (
    <section className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">工作区绑定</p>
      <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">工作区记录使用当前账户的存储 ID；原始 PDF 不会被存储。</p>
      <p className="mt-4 break-all rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3 text-sm font-semibold">{account?.storageId ?? "anonymous"}</p>
    </section>
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "账户操作失败。";
}
