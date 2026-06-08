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
import {
  createBillingCheckoutSession,
  createBillingPortalSession,
  getSubscriptionSnapshot,
  type SubscriptionSnapshot,
} from "@/lib/subscription-runtime";
import type { PaidSubscriptionPlan } from "@/lib/billing-config";

type AuthView = "loading" | "signed-out" | "email-sent" | "signed-in";

export function AccountClient() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionSnapshot | null>(null);
  const [view, setView] = useState<AuthView>("loading");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [billingLoading, setBillingLoading] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const current = await getUser();
        if (!mounted) return;
        if (current) {
          setUser(current);
          setView("signed-in");
          setSubscription(await getSubscriptionSnapshot());
        } else {
          setView("signed-out");
        }
      } catch {
        if (mounted) setView("signed-out");
      }
    }
    load();

    const unsub = onAuthChange(async (changed) => {
      if (!mounted) return;
      setUser(changed);
      if (changed) {
        setView("signed-in");
        setSubscription(await getSubscriptionSnapshot());
      } else {
        setView("signed-out");
        setSubscription(null);
      }
    });
    return () => { mounted = false; unsub(); };
  }, []);

  async function oauth(fn: () => Promise<void>, label: string) {
    setError(""); setMessage(`正在跳转到${label}…`);
    try { await fn(); } catch (err) { setError(err instanceof Error ? err.message : `${label}登录失败`); setMessage(""); }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setMessage(""); setBusy("email");
    try {
      await sendMagicLink(email.trim());
      setView("email-sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "发送失败,请重试");
    } finally {
      setBusy("");
    }
  }

  async function handleSignOut() {
    setError("");
    try { await signOut(); } catch (err) { setError(err instanceof Error ? err.message : "退出失败"); }
  }

  async function handleBilling(plan: PaidSubscriptionPlan) {
    setBillingLoading(plan); setError("");
    try { await createBillingCheckoutSession(plan); } catch (err) { setError(err instanceof Error ? err.message : "结算失败"); setBillingLoading(""); }
  }
  async function handlePortal() {
    setBillingLoading("portal"); setError("");
    try { await createBillingPortalSession(); } catch (err) { setError(err instanceof Error ? err.message : "账单管理打开失败"); setBillingLoading(""); }
  }

  if (view === "loading") {
    return (
      <div className="mt-10 flex justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[color:var(--line)] border-t-[color:var(--accent)]" />
      </div>
    );
  }

  if (view === "email-sent") {
    return (
      <div className="mt-8 space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--success-surface)] text-[color:var(--success)] text-xl">✉</div>
        <p className="text-[15px] font-semibold">登录链接已发送</p>
        <p className="text-[13px] text-[color:var(--muted)]">我们已把登录链接发到 <span className="font-medium text-[color:var(--foreground)]">{email}</span>,点击邮件里的链接即可登录(可能在垃圾箱)。</p>
        <button type="button" onClick={() => { setView("signed-out"); setMessage(""); }} className="text-[12px] text-[color:var(--muted)] hover:text-[color:var(--foreground)]">&larr; 返回</button>
      </div>
    );
  }

  if (view === "signed-out") {
    return (
      <div className="mt-8 space-y-4">
        {/* Google */}
        <button type="button" onClick={() => oauth(signInWithGoogle, "Google")}
          className="flex w-full items-center justify-center gap-3 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-3 text-[14px] font-semibold transition hover:border-[color:var(--line-strong)] hover:bg-[color:var(--surface-raised)]">
          <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          使用 Google 继续
        </button>

        {/* Microsoft */}
        <button type="button" onClick={() => oauth(signInWithMicrosoft, "Microsoft")}
          className="flex w-full items-center justify-center gap-3 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-3 text-[14px] font-semibold transition hover:border-[color:var(--line-strong)] hover:bg-[color:var(--surface-raised)]">
          <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#F25022" d="M3 3h8.5v8.5H3z"/><path fill="#7FBA00" d="M12.5 3H21v8.5h-8.5z"/><path fill="#00A4EF" d="M3 12.5h8.5V21H3z"/><path fill="#FFB900" d="M12.5 12.5H21V21h-8.5z"/></svg>
          使用 Microsoft 继续
        </button>

        {message && <p className="rounded-[var(--radius-sm)] bg-[color:var(--success-surface)] px-3 py-2 text-[13px] text-[color:var(--success)]">{message}</p>}
        {error && <p className="rounded-[var(--radius-sm)] bg-[color:var(--error-surface)] px-3 py-2 text-[13px] text-[color:var(--error)]">{error}</p>}

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-[color:var(--line)]" />
          <span className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--faint)]">或邮箱</span>
          <div className="h-px flex-1 bg-[color:var(--line)]" />
        </div>

        {/* Email magic link */}
        <form onSubmit={handleMagicLink} className="space-y-2">
          <input type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-2.5 text-[14px] outline-none transition focus:border-[color:var(--accent)]" />
          <button type="submit" disabled={!email || busy === "email"}
            className="w-full rounded-[var(--radius)] bg-[color:var(--accent)] px-4 py-2.5 text-[14px] font-semibold text-white transition hover:bg-[color:var(--accent-hover)] disabled:opacity-50">
            {busy === "email" ? "发送中…" : "发送登录链接"}
          </button>
          <p className="text-center text-[12px] text-[color:var(--faint)]">无需密码,我们会发一封登录邮件给你</p>
        </form>

        <div className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3 text-[12px] text-[color:var(--faint)]">
           即将支持 Apple 登录
        </div>
      </div>
    );
  }

  // signed-in
  return (
    <div className="mt-8 space-y-6">
      <div className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[color:var(--accent)] text-[14px] font-semibold text-white">
            {user?.pictureUrl ? <img src={user.pictureUrl} alt="" className="h-full w-full object-cover" /> : (user?.name?.charAt(0) ?? user?.email?.charAt(0)?.toUpperCase() ?? "?")}
          </div>
          <div>
            <p className="text-[15px] font-semibold">{user?.name || user?.email}</p>
            <p className="text-[13px] text-[color:var(--muted)]">{user?.email}</p>
          </div>
          <span className="ml-auto rounded-full bg-[color:var(--success-surface)] px-2.5 py-1 text-[11px] font-semibold text-[color:var(--success)]">已登录</span>
        </div>
      </div>

      {subscription && (
        <div className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--faint)]">当前套餐</p>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-[18px] font-semibold">{subscription.displayName}</p>
              <p className="text-[12px] text-[color:var(--muted)]">{subscription.statusLabel}</p>
            </div>
            {subscription.displayName === "Free" ? (
              <div className="flex gap-2">
                <button type="button" onClick={() => handleBilling("PLUS")} disabled={billingLoading === "PLUS"} className="rounded-[var(--radius-sm)] border border-[color:var(--line)] px-3 py-1.5 text-[12px] font-medium text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--foreground)] disabled:opacity-50">
                  {billingLoading === "PLUS" ? "加载…" : "升级 Plus"}
                </button>
                <button type="button" onClick={() => handleBilling("PRO")} disabled={billingLoading === "PRO"} className="rounded-[var(--radius-sm)] bg-[color:var(--accent)] px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-[color:var(--accent-hover)] disabled:opacity-50">
                  {billingLoading === "PRO" ? "加载…" : "升级 Pro"}
                </button>
              </div>
            ) : (
              <button type="button" onClick={handlePortal} disabled={billingLoading === "portal"} className="rounded-[var(--radius-sm)] border border-[color:var(--line)] px-3 py-1.5 text-[12px] font-medium text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)] disabled:opacity-50">
                {billingLoading === "portal" ? "加载…" : "管理账单"}
              </button>
            )}
          </div>
        </div>
      )}

      {error && <p className="rounded-[var(--radius-sm)] bg-[color:var(--error-surface)] px-3 py-2 text-[13px] text-[color:var(--error)]">{error}</p>}

      <button type="button" onClick={handleSignOut} className="w-full rounded-[var(--radius)] border border-[color:var(--error-line)] px-4 py-2.5 text-[13px] font-medium text-[color:var(--error)] transition hover:bg-[color:var(--error-surface)]">
        退出登录
      </button>
    </div>
  );
}
