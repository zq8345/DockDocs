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
import { useUpgradeFlow, UpgradeConfirmModal } from "@/components/UpgradeFlow";
import type { MembershipLocale } from "@/lib/membership-ui";
import type { PaidSubscriptionPlan } from "@/lib/billing-config";
import { deepHant } from "@/lib/zh-hant";

type Locale = "en" | "zh" | "es" | "pt" | "fr" | "ja" | "de" | "zh-Hant";

type Strings = {
  loading: string;
  checkoutSuccess: string;
  magicLinkSent: string;
  errorFallback: string;
  currentUser: string;
  loggedInUser: string;
  anonymousBrowser: string;
  statusLabel: string;
  signedInLabel: string;
  notSignedInLabel: string;
  planLabel: string;
  planStatusLabel: string;
  workspaceStorage: string;
  signOut: string;
  loginTitle: string;
  loginDescription: string;
  continueWithGoogle: string;
  continueWithMicrosoft: string;
  orEmail: string;
  emailSentMessage: string;
  sendLoginLink: string;
  passwordlessNote: string;
  planTitle: string;
  planDescription: string;
  sourceLabel: string;
  periodEndLabel: string;
  updatedAtLabel: string;
  notSet: string;
  opening: string;
  upgradePlus: string;
  upgradePro: string;
  openingBilling: string;
  manageBilling: string;
  signInToBill: string;
  workspaceBindingTitle: string;
  workspaceBindingDescription: string;
};

// zh-Hant (Traditional) is derived from the zh (Simplified) arm at module load via
// OpenCC (deepHant) — same correct-by-construction pattern as the tool copy, so it
// never drifts. All other locales are authored directly below; de is full German.
const AUTHORED: Record<Exclude<Locale, "zh-Hant">, Strings> = {
  en: {
    loading: "Loading account…",
    checkoutSuccess: "Checkout returned — subscription will update after Stripe syncs.",
    magicLinkSent: "Login link sent to your email. Click the link in the email to sign in.",
    errorFallback: "Account action failed.",
    currentUser: "Current User",
    loggedInUser: "Signed-in User",
    anonymousBrowser: "Anonymous Browser",
    statusLabel: "Status",
    signedInLabel: "Signed in",
    notSignedInLabel: "Not signed in",
    planLabel: "Plan",
    planStatusLabel: "Plan Status",
    workspaceStorage: "Workspace Storage",
    signOut: "Sign Out",
    loginTitle: "Sign In",
    loginDescription: "Once signed in, your saved conversations and workspace metadata will belong to your account. Anonymous data is stored only in this browser.",
    continueWithGoogle: "Continue with Google",
    continueWithMicrosoft: "Continue with Microsoft",
    orEmail: "or email",
    emailSentMessage: "Login link sent to your email. Click it to sign in (check spam if needed).",
    sendLoginLink: "Send Login Link",
    passwordlessNote: "Passwordless — we'll email you a sign-in link.",
    planTitle: "Plan",
    planDescription: "Sign in to initiate Stripe billing. Subscription status reflects the latest Stripe webhook.",
    sourceLabel: "Source",
    periodEndLabel: "Period End",
    updatedAtLabel: "Updated At",
    notSet: "Not set",
    opening: "Opening…",
    upgradePlus: "Upgrade to Plus",
    upgradePro: "Upgrade to Pro",
    openingBilling: "Opening billing…",
    manageBilling: "Manage Billing",
    signInToBill: "Sign in to initiate checkout or open the customer portal.",
    workspaceBindingTitle: "Workspace Binding",
    workspaceBindingDescription: "Workspace records use the current account's storage ID. Original PDFs are never stored.",
  },
  zh: {
    loading: "加载账户中…",
    checkoutSuccess: "结算已返回，订阅将在 Stripe 同步后更新。",
    magicLinkSent: "登录链接已发送到邮箱，点击邮件中的链接即可登录。",
    errorFallback: "账户操作失败。",
    currentUser: "当前用户",
    loggedInUser: "已登录用户",
    anonymousBrowser: "匿名浏览器",
    statusLabel: "状态",
    signedInLabel: "已登录",
    notSignedInLabel: "未登录",
    planLabel: "套餐",
    planStatusLabel: "套餐状态",
    workspaceStorage: "工作区存储",
    signOut: "退出登录",
    loginTitle: "登录",
    loginDescription: "登录后，保存的对话与工作区元数据将归属你的账户；匿名数据仅保留在本浏览器。",
    continueWithGoogle: "使用 Google 继续",
    continueWithMicrosoft: "使用 Microsoft 继续",
    orEmail: "或邮箱",
    emailSentMessage: "登录链接已发送到邮箱，点击即可登录(可能在垃圾箱)。",
    sendLoginLink: "发送登录链接",
    passwordlessNote: "免密码，我们会发一封登录邮件给你",
    planTitle: "套餐",
    planDescription: "登录后可发起 Stripe 结算；订阅状态以 Stripe webhook 同步后为准。",
    sourceLabel: "来源",
    periodEndLabel: "本期结束",
    updatedAtLabel: "更新时间",
    notSet: "未设置",
    opening: "打开中…",
    upgradePlus: "升级 Plus",
    upgradePro: "升级 Pro",
    openingBilling: "打开账单…",
    manageBilling: "管理账单",
    signInToBill: "登录后即可发起结算或打开客户门户。",
    workspaceBindingTitle: "工作区绑定",
    workspaceBindingDescription: "工作区记录使用当前账户的存储 ID；原始 PDF 不会被存储。",
  },
  es: {
    loading: "Cargando cuenta…",
    checkoutSuccess: "Pago completado — la suscripción se actualizará tras la sincronización con Stripe.",
    magicLinkSent: "Enlace de inicio de sesión enviado a tu correo. Haz clic en el enlace del correo para iniciar sesión.",
    errorFallback: "La acción de cuenta falló.",
    currentUser: "Usuario actual",
    loggedInUser: "Usuario conectado",
    anonymousBrowser: "Navegador anónimo",
    statusLabel: "Estado",
    signedInLabel: "Conectado",
    notSignedInLabel: "No conectado",
    planLabel: "Plan",
    planStatusLabel: "Estado del plan",
    workspaceStorage: "Almacenamiento del espacio de trabajo",
    signOut: "Cerrar sesión",
    loginTitle: "Iniciar sesión",
    loginDescription: "Al iniciar sesión, tus conversaciones guardadas y metadatos del espacio de trabajo pertenecerán a tu cuenta. Los datos anónimos solo se almacenan en este navegador.",
    continueWithGoogle: "Continuar con Google",
    continueWithMicrosoft: "Continuar con Microsoft",
    orEmail: "o correo electrónico",
    emailSentMessage: "Enlace de inicio de sesión enviado a tu correo. Haz clic para iniciar sesión (revisa el spam si no lo ves).",
    sendLoginLink: "Enviar enlace de inicio de sesión",
    passwordlessNote: "Sin contraseña — te enviaremos un enlace de acceso por correo.",
    planTitle: "Plan",
    planDescription: "Inicia sesión para iniciar la facturación con Stripe. El estado de la suscripción se refleja tras el último webhook de Stripe.",
    sourceLabel: "Origen",
    periodEndLabel: "Fin del período",
    updatedAtLabel: "Actualizado el",
    notSet: "No establecido",
    opening: "Abriendo…",
    upgradePlus: "Actualizar a Plus",
    upgradePro: "Actualizar a Pro",
    openingBilling: "Abriendo facturación…",
    manageBilling: "Gestionar facturación",
    signInToBill: "Inicia sesión para iniciar el pago o abrir el portal de cliente.",
    workspaceBindingTitle: "Vinculación del espacio de trabajo",
    workspaceBindingDescription: "Los registros del espacio de trabajo usan el ID de almacenamiento de la cuenta actual. Los PDF originales nunca se almacenan.",
  },
  pt: {
    loading: "Carregando conta…",
    checkoutSuccess: "Pagamento concluído — a assinatura será atualizada após a sincronização com o Stripe.",
    magicLinkSent: "Link de login enviado para o seu e-mail. Clique no link do e-mail para entrar.",
    errorFallback: "Ação de conta falhou.",
    currentUser: "Usuário atual",
    loggedInUser: "Usuário conectado",
    anonymousBrowser: "Navegador anônimo",
    statusLabel: "Status",
    signedInLabel: "Conectado",
    notSignedInLabel: "Não conectado",
    planLabel: "Plano",
    planStatusLabel: "Status do plano",
    workspaceStorage: "Armazenamento do espaço de trabalho",
    signOut: "Sair",
    loginTitle: "Entrar",
    loginDescription: "Após entrar, suas conversas salvas e metadados do espaço de trabalho pertencerão à sua conta. Os dados anônimos são armazenados apenas neste navegador.",
    continueWithGoogle: "Continuar com o Google",
    continueWithMicrosoft: "Continuar com a Microsoft",
    orEmail: "ou e-mail",
    emailSentMessage: "Link de login enviado para o seu e-mail. Clique para entrar (verifique o spam se necessário).",
    sendLoginLink: "Enviar link de login",
    passwordlessNote: "Sem senha — enviaremos um link de acesso por e-mail.",
    planTitle: "Plano",
    planDescription: "Entre para iniciar a cobrança pelo Stripe. O status da assinatura reflete o último webhook do Stripe.",
    sourceLabel: "Origem",
    periodEndLabel: "Fim do período",
    updatedAtLabel: "Atualizado em",
    notSet: "Não definido",
    opening: "Abrindo…",
    upgradePlus: "Atualizar para Plus",
    upgradePro: "Atualizar para Pro",
    openingBilling: "Abrindo cobrança…",
    manageBilling: "Gerenciar cobrança",
    signInToBill: "Entre para iniciar o pagamento ou abrir o portal do cliente.",
    workspaceBindingTitle: "Vinculação do espaço de trabalho",
    workspaceBindingDescription: "Os registros do espaço de trabalho usam o ID de armazenamento da conta atual. Os PDFs originais nunca são armazenados.",
  },
  fr: {
    loading: "Chargement du compte…",
    checkoutSuccess: "Paiement effectué — l'abonnement sera mis à jour après la synchronisation avec Stripe.",
    magicLinkSent: "Lien de connexion envoyé à votre adresse e-mail. Cliquez sur le lien dans l'e-mail pour vous connecter.",
    errorFallback: "L'action sur le compte a échoué.",
    currentUser: "Utilisateur actuel",
    loggedInUser: "Utilisateur connecté",
    anonymousBrowser: "Navigateur anonyme",
    statusLabel: "Statut",
    signedInLabel: "Connecté",
    notSignedInLabel: "Non connecté",
    planLabel: "Formule",
    planStatusLabel: "Statut de la formule",
    workspaceStorage: "Stockage de l'espace de travail",
    signOut: "Se déconnecter",
    loginTitle: "Connexion",
    loginDescription: "Une fois connecté, vos conversations enregistrées et les métadonnées de votre espace de travail seront associées à votre compte. Les données anonymes sont uniquement conservées dans ce navigateur.",
    continueWithGoogle: "Continuer avec Google",
    continueWithMicrosoft: "Continuer avec Microsoft",
    orEmail: "ou e-mail",
    emailSentMessage: "Lien de connexion envoyé à votre e-mail. Cliquez dessus pour vous connecter (vérifiez vos spams si nécessaire).",
    sendLoginLink: "Envoyer le lien de connexion",
    passwordlessNote: "Sans mot de passe — nous vous enverrons un lien de connexion par e-mail.",
    planTitle: "Formule",
    planDescription: "Connectez-vous pour initier la facturation Stripe. Le statut de l'abonnement reflète le dernier webhook Stripe.",
    sourceLabel: "Source",
    periodEndLabel: "Fin de période",
    updatedAtLabel: "Mis à jour le",
    notSet: "Non défini",
    opening: "Ouverture…",
    upgradePlus: "Passer à Plus",
    upgradePro: "Passer à Pro",
    openingBilling: "Ouverture de la facturation…",
    manageBilling: "Gérer la facturation",
    signInToBill: "Connectez-vous pour initier le paiement ou ouvrir le portail client.",
    workspaceBindingTitle: "Liaison de l'espace de travail",
    workspaceBindingDescription: "Les enregistrements de l'espace de travail utilisent l'identifiant de stockage du compte actuel. Les PDF originaux ne sont jamais stockés.",
  },
  ja: {
    loading: "アカウントを読み込み中…",
    checkoutSuccess: "決済が完了しました。Stripe の同期後にサブスクリプションが更新されます。",
    magicLinkSent: "ログインリンクをメールに送信しました。メール内のリンクをクリックしてログインしてください。",
    errorFallback: "アカウント操作に失敗しました。",
    currentUser: "現在のユーザー",
    loggedInUser: "ログイン済みユーザー",
    anonymousBrowser: "匿名ブラウザ",
    statusLabel: "ステータス",
    signedInLabel: "ログイン済み",
    notSignedInLabel: "未ログイン",
    planLabel: "プラン",
    planStatusLabel: "プランの状態",
    workspaceStorage: "ワークスペースストレージ",
    signOut: "ログアウト",
    loginTitle: "ログイン",
    loginDescription: "ログインすると、保存された会話とワークスペースのメタデータがアカウントに紐づきます。匿名データはこのブラウザ内にのみ保存されます。",
    continueWithGoogle: "Google で続ける",
    continueWithMicrosoft: "Microsoft で続ける",
    orEmail: "またはメール",
    emailSentMessage: "ログインリンクをメールに送信しました。クリックしてログインしてください(届かない場合は迷惑メールをご確認ください)。",
    sendLoginLink: "ログインリンクを送信",
    passwordlessNote: "パスワード不要 — ログインリンクをメールでお送りします。",
    planTitle: "プラン",
    planDescription: "ログインすると Stripe のお支払いを開始できます。サブスクリプションの状態は最新の Stripe webhook を反映します。",
    sourceLabel: "ソース",
    periodEndLabel: "期間終了",
    updatedAtLabel: "更新日時",
    notSet: "未設定",
    opening: "開いています…",
    upgradePlus: "Plus にアップグレード",
    upgradePro: "Pro にアップグレード",
    openingBilling: "お支払いを開いています…",
    manageBilling: "お支払いを管理",
    signInToBill: "ログインして決済を開始するか、カスタマーポータルを開いてください。",
    workspaceBindingTitle: "ワークスペースの紐付け",
    workspaceBindingDescription: "ワークスペースの記録は現在のアカウントのストレージ ID を使用します。元の PDF は保存されません。",
  },
  de: {
    loading: "Konto wird geladen…",
    checkoutSuccess: "Bezahlung abgeschlossen — das Abonnement wird aktualisiert, sobald Stripe synchronisiert hat.",
    magicLinkSent: "Anmeldelink an Ihre E-Mail-Adresse gesendet. Klicken Sie auf den Link in der E-Mail, um sich anzumelden.",
    errorFallback: "Die Kontoaktion ist fehlgeschlagen.",
    currentUser: "Aktueller Nutzer",
    loggedInUser: "Angemeldeter Nutzer",
    anonymousBrowser: "Anonymer Browser",
    statusLabel: "Status",
    signedInLabel: "Angemeldet",
    notSignedInLabel: "Nicht angemeldet",
    planLabel: "Tarif",
    planStatusLabel: "Tarifstatus",
    workspaceStorage: "Workspace-Speicher",
    signOut: "Abmelden",
    loginTitle: "Anmelden",
    loginDescription: "Sobald Sie angemeldet sind, gehören Ihre gespeicherten Unterhaltungen und Workspace-Metadaten zu Ihrem Konto. Anonyme Daten werden nur in diesem Browser gespeichert.",
    continueWithGoogle: "Mit Google fortfahren",
    continueWithMicrosoft: "Mit Microsoft fortfahren",
    orEmail: "oder E-Mail",
    emailSentMessage: "Anmeldelink an Ihre E-Mail-Adresse gesendet. Klicken Sie darauf, um sich anzumelden (prüfen Sie ggf. den Spam-Ordner).",
    sendLoginLink: "Anmeldelink senden",
    passwordlessNote: "Ohne Passwort — wir senden Ihnen einen Anmeldelink per E-Mail.",
    planTitle: "Tarif",
    planDescription: "Melden Sie sich an, um die Abrechnung über Stripe zu starten. Der Abonnementstatus spiegelt den letzten Stripe-Webhook wider.",
    sourceLabel: "Quelle",
    periodEndLabel: "Periodenende",
    updatedAtLabel: "Aktualisiert am",
    notSet: "Nicht festgelegt",
    opening: "Wird geöffnet…",
    upgradePlus: "Auf Plus upgraden",
    upgradePro: "Auf Pro upgraden",
    openingBilling: "Abrechnung wird geöffnet…",
    manageBilling: "Abrechnung verwalten",
    signInToBill: "Melden Sie sich an, um die Bezahlung zu starten oder das Kundenportal zu öffnen.",
    workspaceBindingTitle: "Workspace-Verknüpfung",
    workspaceBindingDescription: "Workspace-Einträge verwenden die Speicher-ID des aktuellen Kontos. Original-PDFs werden niemals gespeichert.",
  },
};

const STR: Record<Locale, Strings> = {
  ...AUTHORED,
  "zh-Hant": deepHant(AUTHORED.zh),
};

function useLocale(): Locale {
  const [locale, setLocale] = useState<Locale>("zh");
  useEffect(() => {
    // URL segments are emitted lowercase (/zh-hant/, /de/), so normalize the
    // Traditional-Chinese segment back to its BCP-47 "zh-Hant" key before lookup.
    const raw = window.location.pathname.split("/").filter(Boolean)[0]?.toLowerCase();
    const seg = (raw === "zh-hant" ? "zh-Hant" : raw) as Locale;
    if (seg && seg in STR) setLocale(seg);
  }, []);
  return locale;
}

// The upgrade flow (Pro-benefits list + billing-error copy) is keyed by
// MembershipLocale, which has no authored German content. de → en here is an
// intentional fallback, not a half-translation; the de account UI itself is
// fully German via STR.de above.
function asMembershipLocale(locale: Locale): MembershipLocale {
  return locale === "de" ? "en" : locale;
}

export function CommercialAccountClient() {
  const locale = useLocale();
  const t = STR[locale];
  const membershipLocale = asMembershipLocale(locale);
  const upgradeFlow = useUpgradeFlow(membershipLocale);
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
          setMessage(t.checkoutSuccess);
        }
      } catch (loadError) {
        if (mounted) setError(getErrorMessage(loadError, t.errorFallback));
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
  }, [t]);

  async function refreshAccount() {
    setAccount(await getDockAccountState());
    setSubscription(await getSubscriptionSnapshot());
  }

  async function handleMagicLink() {
    setError(""); setMessage("");
    try {
      await sendMagicLink(email.trim());
      setEmailSent(true);
      setMessage(t.magicLinkSent);
    } catch (e) {
      setError(getErrorMessage(e, t.errorFallback));
    }
  }

  async function handleOAuth(fn: () => Promise<void>) {
    setError(""); setMessage("");
    try { await fn(); } catch (e) { setError(getErrorMessage(e, t.errorFallback)); }
  }

  async function handleLogout() {
    setError(""); setMessage("");
    try { await signOut(); setUser(null); await refreshAccount(); } catch (e) { setError(getErrorMessage(e, t.errorFallback)); }
  }

  async function handleCheckout(plan: PaidSubscriptionPlan) {
    setError(""); setMessage("");
    // A PAID user must go through the in-place proration upgrade (which cancels the
    // old sub) — a fresh checkout here would create a second sub = double-charge.
    // Free users have nothing to prorate → a plain new-subscription checkout.
    if (subscription?.isPaidPlaceholder) {
      const interval =
        subscription.record.interval && subscription.record.interval !== "lifetime"
          ? subscription.record.interval
          : "monthly";
      void upgradeFlow.beginUpgrade(plan, interval);
      return;
    }
    setBillingAction(plan === "PLUS" ? "checkout-plus" : "checkout-pro");
    try { const url = await createBillingCheckoutSession(plan); window.location.assign(url); }
    catch (e) { setError(getErrorMessage(e, t.errorFallback)); } finally { setBillingAction(""); }
  }

  async function handlePortal() {
    setError(""); setMessage(""); setBillingAction("portal");
    try { const url = await createBillingPortalSession(); window.location.assign(url); }
    catch (e) { setError(getErrorMessage(e, t.errorFallback)); } finally { setBillingAction(""); }
  }

  if (loading) {
    return (
      <section className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-6">
        <StatusBadge label={t.loading} status="Idle" />
      </section>
    );
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <UpgradeConfirmModal flow={upgradeFlow} locale={membershipLocale} />
      <div className="grid gap-6">
        <AccountStatusCard user={user} account={account} subscription={subscription} onLogout={handleLogout} t={t} />
        {user ? null : (
          <LoginCard
            email={email}
            emailSent={emailSent}
            onEmailChange={setEmail}
            onMagicLink={handleMagicLink}
            onGoogle={() => handleOAuth(signInWithGoogle)}
            onMicrosoft={() => handleOAuth(signInWithMicrosoft)}
            t={t}
          />
        )}
      </div>

      <div className="grid gap-6">
        <PlanCard signedIn={Boolean(user)} subscription={subscription} billingAction={billingAction} onCheckout={handleCheckout} onPortal={handlePortal} t={t} />
        <WorkspaceBindingCard account={account} t={t} />
        {message ? <StatusBadge className="justify-start p-3 text-sm" label={message} status="Completed" /> : null}
        {(error || upgradeFlow.error) ? <StatusBadge role="alert" className="justify-start p-3 text-sm" label={error || upgradeFlow.error} status="Blocked" /> : null}
      </div>
    </section>
  );
}

type T = typeof STR["en"];

function AccountStatusCard({
  user, account, subscription, onLogout, t,
}: {
  user: AuthUser | null;
  account: DockAccountState | null;
  subscription: SubscriptionSnapshot | null;
  onLogout: () => void;
  t: T;
}) {
  return (
    <section className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{t.currentUser}</p>
      <h2 className="mt-2 break-words text-2xl font-semibold">{user ? user.name || user.email || t.loggedInUser : t.anonymousBrowser}</h2>
      <dl className="mt-4 grid gap-3 text-sm">
        <div>
          <dt className="font-semibold text-[color:var(--muted)]">{t.statusLabel}</dt>
          <dd className="mt-1"><StatusBadge label={account?.signedIn ? t.signedInLabel : t.notSignedInLabel} status={account?.signedIn ? "Active" : "Session-only"} /></dd>
        </div>
        <div>
          <dt className="font-semibold text-[color:var(--muted)]">{t.planLabel}</dt>
          <dd className="mt-1 font-semibold">{subscription?.displayName ?? "Free"}</dd>
        </div>
        <div>
          <dt className="font-semibold text-[color:var(--muted)]">{t.planStatusLabel}</dt>
          <dd className="mt-1"><StatusBadge label={subscription?.statusLabel ?? "Free"} status={subscription?.record.status === "active" ? "Active" : "Backlog"} /></dd>
        </div>
        <div>
          <dt className="font-semibold text-[color:var(--muted)]">{t.workspaceStorage}</dt>
          <dd className="mt-1 break-all font-semibold">{account?.storageId ?? "anonymous"}</dd>
        </div>
      </dl>
      {user ? (
        <button type="button" onClick={onLogout} className="mt-5 min-h-11 rounded-[var(--radius-sm)] border border-[color:var(--line)] px-4 text-sm font-semibold text-[color:var(--foreground)]">{t.signOut}</button>
      ) : null}
    </section>
  );
}

function LoginCard({
  email, emailSent, onEmailChange, onMagicLink, onGoogle, onMicrosoft, t,
}: {
  email: string;
  emailSent: boolean;
  onEmailChange: (v: string) => void;
  onMagicLink: () => void;
  onGoogle: () => void;
  onMicrosoft: () => void;
  t: T;
}) {
  return (
    <section className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{t.loginTitle}</p>
      <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{t.loginDescription}</p>
      <button type="button" onClick={onGoogle} className="mt-4 min-h-11 w-full rounded-[var(--radius-sm)] bg-[color:var(--foreground)] px-4 text-sm font-semibold text-[color:var(--background)]">{t.continueWithGoogle}</button>
      <button type="button" onClick={onMicrosoft} className="mt-2 min-h-11 w-full rounded-[var(--radius-sm)] border border-[color:var(--line)] px-4 text-sm font-semibold text-[color:var(--foreground)]">{t.continueWithMicrosoft}</button>
      <div className="mt-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-[color:var(--line)]" />
        <span className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--faint)]">{t.orEmail}</span>
        <div className="h-px flex-1 bg-[color:var(--line)]" />
      </div>
      {emailSent ? (
        <p className="mt-3 text-sm leading-6 text-[color:var(--success)]">{t.emailSentMessage}</p>
      ) : (
        <div className="mt-3 grid gap-2">
          <input value={email} onChange={(e) => onEmailChange(e.target.value)} placeholder="you@example.com" type="email"
            className="min-h-11 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3 text-sm outline-none" />
          <button type="button" onClick={onMagicLink} disabled={!email}
            className="min-h-11 rounded-[var(--radius-sm)] bg-[color:var(--accent)] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{t.sendLoginLink}</button>
          <p className="text-[11px] text-[color:var(--faint)]">{t.passwordlessNote}</p>
        </div>
      )}
    </section>
  );
}

function PlanCard({
  signedIn, subscription, billingAction, onCheckout, onPortal, t,
}: {
  signedIn: boolean;
  subscription: SubscriptionSnapshot | null;
  billingAction: "checkout-plus" | "checkout-pro" | "portal" | "";
  onCheckout: (plan: PaidSubscriptionPlan) => void;
  onPortal: () => void;
  t: T;
}) {
  const plan = subscription?.displayName ?? "Free";
  const status = subscription?.statusLabel ?? "Free";
  const source = subscription?.record.source ?? "local";

  return (
    <section className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{t.planTitle}</p>
      <h2 className="mt-2 text-3xl font-semibold">{plan}</h2>
      <div className="mt-2"><StatusBadge label={status} status={subscription?.record.status === "active" ? "Active" : "Backlog"} /></div>
      <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{t.planDescription}</p>
      <dl className="mt-4 grid gap-2 text-sm">
        <div className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3">
          <dt className="font-semibold text-[color:var(--muted)]">{t.sourceLabel}</dt>
          <dd className="mt-1"><StatusBadge label={source} status={source === "manual" ? "Local" : "Synced"} /></dd>
        </div>
        {subscription?.record.currentPeriodEnd ? (
          <div className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3">
            <dt className="font-semibold text-[color:var(--muted)]">{t.periodEndLabel}</dt>
            <dd className="mt-1 break-words font-semibold">{subscription.record.currentPeriodEnd}</dd>
          </div>
        ) : null}
        <div className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3">
          <dt className="font-semibold text-[color:var(--muted)]">{t.updatedAtLabel}</dt>
          <dd className="mt-1 break-words font-semibold">{subscription?.record.updatedAt ?? t.notSet}</dd>
        </div>
      </dl>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <button type="button" onClick={() => onCheckout("PLUS")} disabled={!signedIn || billingAction !== ""} className="min-h-11 rounded-[var(--radius-sm)] bg-[color:var(--accent)] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
          {billingAction === "checkout-plus" ? t.opening : t.upgradePlus}
        </button>
        <button type="button" onClick={() => onCheckout("PRO")} disabled={!signedIn || billingAction !== ""} className="min-h-11 rounded-[var(--radius-sm)] border border-[color:var(--line)] px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50">
          {billingAction === "checkout-pro" ? t.opening : t.upgradePro}
        </button>
        <button type="button" onClick={onPortal} disabled={!signedIn || billingAction !== ""} className="min-h-11 rounded-[var(--radius-sm)] border border-[color:var(--line)] px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2">
          {billingAction === "portal" ? t.openingBilling : t.manageBilling}
        </button>
      </div>
      {!signedIn ? <p className="mt-3 text-xs font-semibold text-[color:var(--muted)]">{t.signInToBill}</p> : null}
    </section>
  );
}

function WorkspaceBindingCard({ account, t }: { account: DockAccountState | null; t: T }) {
  return (
    <section className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{t.workspaceBindingTitle}</p>
      <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{t.workspaceBindingDescription}</p>
      <p className="mt-4 break-all rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3 text-sm font-semibold">{account?.storageId ?? "anonymous"}</p>
    </section>
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
