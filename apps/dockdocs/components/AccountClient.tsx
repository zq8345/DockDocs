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
import { supabase, authHeader } from "@/lib/supabase";
import { trackSignUp, trackBeginCheckout } from "@/lib/analytics";

type AuthView = "loading" | "signed-out" | "email-sent" | "signed-in";
type DeleteState = "idle" | "confirm" | "deleting" | "done";

type AccountLocale = "en" | "zh" | "es" | "pt" | "fr";

function getCopy(locale: AccountLocale) {
  const zh = locale === "zh";
  const es = locale === "es";
  const pt = locale === "pt";
  const fr = locale === "fr";
  return {
    redirecting: (label: string) => (zh ? `正在跳转到${label}…` : es ? `Redirigiendo a ${label}…` : pt ? `Redirecionando para ${label}…` : fr ? `Redirection vers ${label}…` : `Redirecting to ${label}…`),
    oauthFailed: (label: string) => (zh ? `${label}登录失败` : es ? `Error al iniciar sesión con ${label}` : pt ? `Falha ao entrar com ${label}` : fr ? `Échec de connexion avec ${label}` : `${label} sign-in failed`),
    sendFailed: zh ? "发送失败，请重试" : es ? "Error al enviar, inténtalo de nuevo" : pt ? "Falha ao enviar, tente novamente" : fr ? "Échec d'envoi, veuillez réessayer" : "Failed to send, please try again",
    signOutFailed: zh ? "退出失败" : es ? "Error al cerrar sesión" : pt ? "Falha ao sair" : fr ? "Échec de la déconnexion" : "Sign out failed",
    checkoutFailed: zh ? "结算失败" : es ? "Error en el pago" : pt ? "Falha no pagamento" : fr ? "Échec du paiement" : "Checkout failed",
    portalFailed: zh ? "账单管理打开失败" : es ? "No se pudo abrir el portal de facturación" : pt ? "Não foi possível abrir o portal de cobrança" : fr ? "Impossible d'ouvrir le portail de facturation" : "Couldn't open billing portal",
    magicSentTitle: zh ? "登录链接已发送" : es ? "Enlace de acceso enviado" : pt ? "Link de acesso enviado" : fr ? "Lien de connexion envoyé" : "Magic link sent",
    magicSentBody: (email: string) =>
      zh
        ? `我们已把登录链接发到 ${email}，点击邮件里的链接即可登录(可能在垃圾箱)。`
        : es
        ? `Hemos enviado un enlace de acceso a ${email}. Haz clic en él para iniciar sesión (revisa también spam).`
        : pt
        ? `Enviamos um link de acesso para ${email}. Clique nele para entrar (verifique também o spam).`
        : fr
        ? `Nous avons envoyé un lien de connexion à ${email}. Cliquez dessus pour vous connecter (vérifiez aussi les spams).`
        : `We've sent a sign-in link to ${email}. Click it to sign in (check spam too).`,
    back: zh ? "← 返回" : es ? "← Volver" : pt ? "← Voltar" : fr ? "← Retour" : "← Back",
    continueGoogle: zh ? "使用 Google 继续" : es ? "Continuar con Google" : pt ? "Continuar com Google" : fr ? "Continuer avec Google" : "Continue with Google",
    continueMicrosoft: zh ? "使用 Microsoft 继续" : es ? "Continuar con Microsoft" : pt ? "Continuar com Microsoft" : fr ? "Continuer avec Microsoft" : "Continue with Microsoft",
    orEmail: zh ? "或邮箱" : es ? "o correo" : pt ? "ou e-mail" : fr ? "ou e-mail" : "or email",
    sending: zh ? "发送中…" : es ? "Enviando…" : pt ? "Enviando…" : fr ? "Envoi en cours…" : "Sending…",
    sendMagic: zh ? "发送登录链接" : es ? "Enviar enlace de acceso" : pt ? "Enviar link de acesso" : fr ? "Envoyer le lien de connexion" : "Send magic link",
    emailHint: zh ? "无需密码，我们会发一封登录邮件给你" : es ? "Sin contraseña — te enviaremos un enlace de acceso" : pt ? "Sem senha — enviaremos um link de acesso por e-mail" : fr ? "Sans mot de passe — nous vous enverrons un lien de connexion" : "No password — we'll email you a sign-in link",
    appleSoon: zh ? "即将支持 Apple 登录" : es ? "Apple Sign-in próximamente" : pt ? "Apple Sign-in em breve" : fr ? "Connexion Apple bientôt disponible" : "Apple sign-in coming soon",
    signedIn: zh ? "已登录" : es ? "Sesión iniciada" : pt ? "Sessão iniciada" : fr ? "Connecté" : "Signed in",
    currentPlan: zh ? "当前套餐" : es ? "Plan actual" : pt ? "Plano atual" : fr ? "Forfait actuel" : "Current plan",
    upgradePlus: zh ? "升级 Plus" : es ? "Actualizar a Plus" : pt ? "Fazer upgrade para Plus" : fr ? "Passer à Plus" : "Upgrade to Plus",
    upgradePro: zh ? "升级 Pro" : es ? "Actualizar a Pro" : pt ? "Fazer upgrade para Pro" : fr ? "Passer à Pro" : "Upgrade to Pro",
    manageBilling: zh ? "管理账单" : es ? "Administrar facturación" : pt ? "Gerenciar cobrança" : fr ? "Gérer la facturation" : "Manage billing",
    loading: zh ? "加载…" : es ? "Cargando…" : pt ? "Carregando…" : fr ? "Chargement…" : "Loading…",
    signOut: zh ? "退出登录" : es ? "Cerrar sesión" : pt ? "Sair" : fr ? "Se déconnecter" : "Sign out",
    privateSpace: zh ? "私密工作区" : es ? "Espacio privado" : pt ? "Espaço privado" : fr ? "Espace privé" : "Private Space",
    privateDesc: zh
      ? "启用后，你的流程模板和执行记录将加密同步到云端，跨设备访问，随时可删除。"
      : es
      ? "Cuando está activado, tus plantillas de flujo e historial de ejecuciones se sincronizan cifrados en la nube para acceso entre dispositivos. Puedes borrarlos en cualquier momento."
      : pt
      ? "Quando ativado, seus modelos de fluxo e histórico de execuções são sincronizados criptografados na nuvem para acesso entre dispositivos. Você pode excluí-los a qualquer momento."
      : fr
      ? "Lorsqu'activé, vos modèles de flux et votre historique d'exécutions sont synchronisés de façon chiffrée dans le cloud pour un accès multi-appareils. Vous pouvez les supprimer à tout moment."
      : "When enabled, your flow templates and run history sync encrypted to the cloud for cross-device access. You can delete them at any time.",
    privateOn: zh ? "已启用" : es ? "Activado" : pt ? "Ativado" : fr ? "Activé" : "Enabled",
    privateOff: zh ? "未启用" : es ? "Desactivado" : pt ? "Desativado" : fr ? "Désactivé" : "Disabled",
    enableSync: zh ? "启用同步" : es ? "Activar sincronización" : pt ? "Ativar sincronização" : fr ? "Activer la synchronisation" : "Enable sync",
    disableSync: zh ? "停用同步" : es ? "Desactivar sincronización" : pt ? "Desativar sincronização" : fr ? "Désactiver la synchronisation" : "Disable sync",
    deleteData: zh ? "删除所有数据" : es ? "Eliminar todos los datos" : pt ? "Excluir todos os dados" : fr ? "Supprimer toutes les données" : "Delete all data",
    deleteConfirm: zh
      ? "确认删除？此操作不可撤销。"
      : es
      ? "¿Confirmar eliminación? Esta acción no se puede deshacer."
      : pt
      ? "Confirmar exclusão? Esta ação não pode ser desfeita."
      : fr
      ? "Confirmer la suppression ? Cette action est irréversible."
      : "Confirm delete? This cannot be undone.",
    deleteCancel: zh ? "取消" : es ? "Cancelar" : pt ? "Cancelar" : fr ? "Annuler" : "Cancel",
    deleting: zh ? "删除中…" : es ? "Eliminando…" : pt ? "Excluindo…" : fr ? "Suppression…" : "Deleting…",
    deleteOk: (t: number, r: number) =>
      zh
        ? `已删除 ${t} 个模板，${r} 条运行记录。`
        : es
        ? `Se eliminaron ${t} plantilla(s) y ${r} registro(s) de ejecución.`
        : pt
        ? `${t} modelo(s) e ${r} registro(s) de execução excluídos.`
        : fr
        ? `${t} modèle(s) et ${r} exécution(s) supprimés.`
        : `Deleted ${t} template(s) and ${r} run(s).`,
    saving: zh ? "保存中…" : es ? "Guardando…" : pt ? "Salvando…" : fr ? "Enregistrement…" : "Saving…",
    eyebrow: zh ? "账户" : es ? "Cuenta" : pt ? "Conta" : fr ? "Compte" : "Account",
    headSignedOut: zh ? "登录 DockDocs" : es ? "Iniciar sesión en DockDocs" : pt ? "Entrar no DockDocs" : fr ? "Connexion à DockDocs" : "Sign in to DockDocs",
    headSignedIn: zh ? "你的账户" : es ? "Tu cuenta" : pt ? "Sua conta" : fr ? "Votre compte" : "Your account",
    subSignedOut: zh ? "访问你的工作区、管理订阅，并跨设备保留文档记录。" : es ? "Accede a tu área de trabajo, gestiona la facturación y mantén el historial de documentos en todos tus dispositivos." : pt ? "Acesse seu espaço de trabalho, gerencie assinaturas e mantenha o histórico de documentos em todos os seus dispositivos." : fr ? "Accédez à votre espace de travail, gérez la facturation et conservez l'historique de vos documents sur tous vos appareils." : "Access your workspace, manage billing, and keep your document history across devices.",
    subSignedIn: zh ? "管理你的套餐、账单与工作区。" : es ? "Gestiona tu plan, facturación y área de trabajo." : pt ? "Gerencie seu plano, cobrança e espaço de trabalho." : fr ? "Gérez votre forfait, votre facturation et votre espace de travail." : "Manage your plan, billing, and workspace.",
  };
}

// Billing interval label for the current-plan card. Lifetime is one-time and
// never expires, so we say so explicitly (no renewal date is implied).
function intervalLabel(interval: string, locale: AccountLocale): string {
  const m: Record<string, Record<string, string>> = {
    lifetime: { en: "Lifetime · never expires", zh: "终身 · 永久有效", es: "De por vida · nunca caduca", pt: "Vitalício · nunca expira", fr: "À vie · n'expire jamais" },
    annual: { en: "Billed annually", zh: "按年计费", es: "Facturación anual", pt: "Cobrança anual", fr: "Facturation annuelle" },
    monthly: { en: "Billed monthly", zh: "按月计费", es: "Facturación mensual", pt: "Cobrança mensal", fr: "Facturation mensuelle" },
  };
  return m[interval]?.[locale] ?? m[interval]?.en ?? "";
}

export function AccountClient({ locale = "en" }: { locale?: AccountLocale }) {
  const t = getCopy(locale);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionSnapshot | null>(null);
  const [view, setView] = useState<AuthView>("loading");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [billingLoading, setBillingLoading] = useState("");
  const [flowOptin, setFlowOptin] = useState<boolean | null>(null);
  const [flowOptinSaving, setFlowOptinSaving] = useState(false);
  const [deleteState, setDeleteState] = useState<DeleteState>("idle");
  const [deleteMsg, setDeleteMsg] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const current = await getUser();
        if (!mounted) return;
        if (current) {
          setUser(current);
          setView("signed-in");
          const [snap, sbUser] = await Promise.all([
            getSubscriptionSnapshot(),
            supabase.auth.getUser(),
          ]);
          if (mounted) {
            setSubscription(snap);
            setFlowOptin(sbUser.data.user?.user_metadata?.flow_optin === true);
          }
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
        const [snap, sbUser] = await Promise.all([
          getSubscriptionSnapshot(),
          supabase.auth.getUser(),
        ]);
        if (mounted) {
          setSubscription(snap);
          setFlowOptin(sbUser.data.user?.user_metadata?.flow_optin === true);
        }
      } else {
        setView("signed-out");
        setSubscription(null);
        setFlowOptin(null);
      }
    });
    return () => { mounted = false; unsub(); };
  }, []);

  async function oauth(fn: () => Promise<void>, label: string) {
    setError(""); setMessage(t.redirecting(label));
    trackSignUp(label.toLowerCase() as "google" | "microsoft");
    try { await fn(); } catch (err) { setError(err instanceof Error ? err.message : t.oauthFailed(label)); setMessage(""); }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setMessage(""); setBusy("email");
    try {
      await sendMagicLink(email.trim());
      setView("email-sent");
      trackSignUp("email");
    } catch (err) {
      setError(err instanceof Error ? err.message : t.sendFailed);
    } finally {
      setBusy("");
    }
  }

  async function handleSignOut() {
    setError("");
    try { await signOut(); } catch (err) { setError(err instanceof Error ? err.message : t.signOutFailed); }
  }

  async function handleFlowOptinToggle() {
    if (flowOptin === null || flowOptinSaving) return;
    const next = !flowOptin;
    setFlowOptinSaving(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: { flow_optin: next },
      });
      if (!updateError) setFlowOptin(next);
    } catch {
      // Leave state unchanged on error.
    } finally {
      setFlowOptinSaving(false);
    }
  }

  async function handleDeleteData() {
    setDeleteState("deleting");
    try {
      const headers = await authHeader();
      const res = await fetch("/api/delete-user-data", {
        method: "POST",
        headers,
      });
      const data = (await res.json()) as { ok: boolean; deleted?: { templates: number; runs: number } };
      if (data.ok) {
        setDeleteMsg(t.deleteOk(data.deleted?.templates ?? 0, data.deleted?.runs ?? 0));
        setDeleteState("done");
      } else {
        setDeleteState("idle");
      }
    } catch {
      setDeleteState("idle");
    }
  }

  async function handleBilling(plan: PaidSubscriptionPlan) {
    setBillingLoading(plan); setError("");
    trackBeginCheckout(plan);
    try { await createBillingCheckoutSession(plan); } catch (err) { setError(err instanceof Error ? err.message : t.checkoutFailed); setBillingLoading(""); }
  }
  async function handlePortal() {
    setBillingLoading("portal"); setError("");
    try { await createBillingPortalSession(); } catch (err) { setError(err instanceof Error ? err.message : t.portalFailed); setBillingLoading(""); }
  }

  const header = (
    <div className="text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent-strong)]">{t.eyebrow}</p>
      <h1 className="mt-4 text-[28px] font-semibold tracking-[-0.014em]">{view === "signed-in" ? t.headSignedIn : t.headSignedOut}</h1>
      <p className="mt-3 text-[14px] leading-relaxed text-[color:var(--muted)]">{view === "signed-in" ? t.subSignedIn : t.subSignedOut}</p>
    </div>
  );

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
        {header}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--success-surface)] text-[color:var(--success)] text-xl">✉</div>
        <p className="text-[15px] font-semibold">{t.magicSentTitle}</p>
        <p className="text-[13px] text-[color:var(--muted)]">{t.magicSentBody(email)}</p>
        <button type="button" onClick={() => { setView("signed-out"); setMessage(""); }} className="text-[12px] text-[color:var(--muted)] hover:text-[color:var(--foreground)]">{t.back}</button>
      </div>
    );
  }

  if (view === "signed-out") {
    return (
      <div className="mt-8 space-y-4">
        {header}
        {/* Google */}
        <button type="button" onClick={() => oauth(signInWithGoogle, "Google")}
          className="flex w-full items-center justify-center gap-3 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-3 text-[14px] font-semibold transition hover:border-[color:var(--line-strong)] hover:bg-[color:var(--surface-raised)]">
          <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          {t.continueGoogle}
        </button>

        {/* Microsoft */}
        <button type="button" onClick={() => oauth(signInWithMicrosoft, "Microsoft")}
          className="flex w-full items-center justify-center gap-3 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-3 text-[14px] font-semibold transition hover:border-[color:var(--line-strong)] hover:bg-[color:var(--surface-raised)]">
          <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#F25022" d="M3 3h8.5v8.5H3z"/><path fill="#7FBA00" d="M12.5 3H21v8.5h-8.5z"/><path fill="#00A4EF" d="M3 12.5h8.5V21H3z"/><path fill="#FFB900" d="M12.5 12.5H21V21h-8.5z"/></svg>
          {t.continueMicrosoft}
        </button>

        {message && <p className="rounded-[var(--radius-sm)] bg-[color:var(--success-surface)] px-3 py-2 text-[13px] text-[color:var(--success)]">{message}</p>}
        {error && <p className="rounded-[var(--radius-sm)] bg-[color:var(--error-surface)] px-3 py-2 text-[13px] text-[color:var(--error)]">{error}</p>}

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-[color:var(--line)]" />
          <span className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--faint)]">{t.orEmail}</span>
          <div className="h-px flex-1 bg-[color:var(--line)]" />
        </div>

        {/* Email magic link */}
        <form onSubmit={handleMagicLink} className="space-y-2">
          <input type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-2.5 text-[14px] outline-none transition focus:border-[color:var(--accent)]" />
          <button type="submit" disabled={!email || busy === "email"}
            className="w-full rounded-[var(--radius)] bg-[color:var(--accent)] px-4 py-2.5 text-[14px] font-semibold text-white transition hover:bg-[color:var(--accent-hover)] disabled:opacity-50">
            {busy === "email" ? t.sending : t.sendMagic}
          </button>
          <p className="text-center text-[12px] text-[color:var(--faint)]">{t.emailHint}</p>
        </form>

        <div className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3 text-[12px] text-[color:var(--faint)]">
           {t.appleSoon}
        </div>
      </div>
    );
  }

  // signed-in
  return (
    <div className="mt-8 space-y-6">
      {header}
      <div className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[color:var(--accent)] text-[14px] font-semibold text-white">
            {user?.pictureUrl ? <img src={user.pictureUrl} alt="" className="h-full w-full object-cover" /> : (user?.name?.charAt(0) ?? user?.email?.charAt(0)?.toUpperCase() ?? "?")}
          </div>
          <div>
            <p className="text-[15px] font-semibold">{user?.name || user?.email}</p>
            <p className="text-[13px] text-[color:var(--muted)]">{user?.email}</p>
          </div>
          <span className="ml-auto rounded-full bg-[color:var(--success-surface)] px-2.5 py-1 text-[11px] font-semibold text-[color:var(--success)]">{t.signedIn}</span>
        </div>
      </div>

      {subscription && (
        <div className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--faint)]">{t.currentPlan}</p>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-[18px] font-semibold">{subscription.displayName}</p>
              <p className="text-[12px] text-[color:var(--muted)]">{subscription.statusLabel}</p>
              {subscription.displayName !== "Free" && subscription.record.interval && (
                <p className="text-[11px] text-[color:var(--faint)]">{intervalLabel(subscription.record.interval, locale)}</p>
              )}
            </div>
            {subscription.displayName === "Free" ? (
              <div className="flex gap-2">
                <button type="button" onClick={() => handleBilling("PLUS")} disabled={billingLoading === "PLUS"} className="rounded-[var(--radius-sm)] border border-[color:var(--line)] px-3 py-1.5 text-[12px] font-medium text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--foreground)] disabled:opacity-50">
                  {billingLoading === "PLUS" ? t.loading : t.upgradePlus}
                </button>
                <button type="button" onClick={() => handleBilling("PRO")} disabled={billingLoading === "PRO"} className="rounded-[var(--radius-sm)] bg-[color:var(--accent)] px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-[color:var(--accent-hover)] disabled:opacity-50">
                  {billingLoading === "PRO" ? t.loading : t.upgradePro}
                </button>
              </div>
            ) : (
              <button type="button" onClick={handlePortal} disabled={billingLoading === "portal"} className="rounded-[var(--radius-sm)] border border-[color:var(--line)] px-3 py-1.5 text-[12px] font-medium text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)] disabled:opacity-50">
                {billingLoading === "portal" ? t.loading : t.manageBilling}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Private Space */}
      {flowOptin !== null && (
        <div className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--faint)]">{t.privateSpace}</p>
              <p className="mt-2 text-[13px] leading-5 text-[color:var(--muted)]">{t.privateDesc}</p>
            </div>
            <button
              type="button"
              onClick={handleFlowOptinToggle}
              disabled={flowOptinSaving}
              className={`mt-0.5 shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold transition disabled:opacity-50 ${
                flowOptin
                  ? "bg-[color:var(--soft-accent)] text-[color:var(--accent-strong)]"
                  : "border border-[color:var(--line)] text-[color:var(--muted)] hover:border-[color:var(--line-strong)]"
              }`}
            >
              {flowOptinSaving ? t.saving : flowOptin ? t.privateOn : t.privateOff}
            </button>
          </div>
          {flowOptin && (
            <div className="mt-4 border-t border-[color:var(--line)] pt-4">
              {deleteState === "done" ? (
                <p className="text-[13px] text-[color:var(--success)]">{deleteMsg}</p>
              ) : deleteState === "confirm" ? (
                <div className="flex items-center gap-3">
                  <p className="text-[13px] text-[color:var(--muted)]">{t.deleteConfirm}</p>
                  <button type="button" onClick={handleDeleteData} className="rounded-[var(--radius-sm)] bg-[color:var(--error)] px-3 py-1 text-[12px] font-semibold text-white transition hover:opacity-90">
                    {t.deleteData}
                  </button>
                  <button type="button" onClick={() => setDeleteState("idle")} className="text-[12px] text-[color:var(--muted)] hover:text-[color:var(--foreground)]">
                    {t.deleteCancel}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setDeleteState("confirm")}
                  disabled={deleteState === "deleting"}
                  className="text-[13px] text-[color:var(--error)] transition hover:opacity-80 disabled:opacity-50"
                >
                  {deleteState === "deleting" ? t.deleting : t.deleteData}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {error && <p className="rounded-[var(--radius-sm)] bg-[color:var(--error-surface)] px-3 py-2 text-[13px] text-[color:var(--error)]">{error}</p>}

      <button type="button" onClick={handleSignOut} className="w-full rounded-[var(--radius)] border border-[color:var(--error-line)] px-4 py-2.5 text-[13px] font-medium text-[color:var(--error)] transition hover:bg-[color:var(--error-surface)]">
        {t.signOut}
      </button>
    </div>
  );
}
