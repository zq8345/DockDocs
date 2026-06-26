"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  createBillingPortalSession,
  getSubscriptionSnapshot,
  type SubscriptionSnapshot,
} from "@/lib/subscription-runtime";
import { planBadge, planStatusText, upgradePrompts, type MembershipLocale } from "@/lib/membership-ui";
import { useUpgradeFlow, UpgradeConfirmModal } from "@/components/UpgradeFlow";
import { OtpVerifyForm } from "@/components/OtpVerifyForm";
import { supabase, authHeader } from "@/lib/supabase";
import { trackSignUp } from "@/lib/analytics";
import { deepHant } from "@/lib/zh-hant";

type AuthView = "loading" | "signed-out" | "email-sent" | "signed-in";
type DeleteState = "idle" | "confirm" | "deleting" | "done";

type AccountLocale = "en" | "zh" | "zh-Hant" | "es" | "pt" | "fr" | "ja" | "de" | "ko";

// zh-Hant has no hand-authored copy: derive Traditional from the zh strings
// (deepHant also wraps the function-valued fields so their output converts too).
// ko has no copy yet → falls through every ternary to the English default.
function getCopy(locale: AccountLocale) {
  if (locale === "zh-Hant") return deepHant(accountCopy("zh"));
  return accountCopy(locale);
}

function accountCopy(locale: Exclude<AccountLocale, "zh-Hant">) {
  const zh = locale === "zh";
  const es = locale === "es";
  const pt = locale === "pt";
  const fr = locale === "fr";
  const ja = locale === "ja";
  const de = locale === "de";
  return {
    redirecting: (label: string) => (zh ? `正在跳转到${label}…` : es ? `Redirigiendo a ${label}…` : pt ? `Redirecionando para ${label}…` : fr ? `Redirection vers ${label}…` : ja ? `${label}にリダイレクトしています…` : de ? `Weiterleitung zu ${label}…` : `Redirecting to ${label}…`),
    oauthFailed: (label: string) => (zh ? `${label}登录失败` : es ? `Error al iniciar sesión con ${label}` : pt ? `Falha ao entrar com ${label}` : fr ? `Échec de connexion avec ${label}` : ja ? `${label}でのサインインに失敗しました` : de ? `Anmeldung mit ${label} fehlgeschlagen` : `${label} sign-in failed`),
    sendFailed: zh ? "发送失败，请重试" : es ? "Error al enviar, inténtalo de nuevo" : pt ? "Falha ao enviar, tente novamente" : fr ? "Échec d'envoi, veuillez réessayer" : ja ? "送信に失敗しました。もう一度お試しください" : de ? "Senden fehlgeschlagen, bitte versuchen Sie es erneut" : "Failed to send, please try again",
    signOutFailed: zh ? "退出失败" : es ? "Error al cerrar sesión" : pt ? "Falha ao sair" : fr ? "Échec de la déconnexion" : ja ? "サインアウトに失敗しました" : de ? "Abmeldung fehlgeschlagen" : "Sign out failed",
    checkoutFailed: zh ? "结算失败" : es ? "Error en el pago" : pt ? "Falha no pagamento" : fr ? "Échec du paiement" : ja ? "決済に失敗しました" : de ? "Zahlung fehlgeschlagen" : "Checkout failed",
    portalFailed: zh ? "账单管理打开失败" : es ? "No se pudo abrir el portal de facturación" : pt ? "Não foi possível abrir o portal de cobrança" : fr ? "Impossible d'ouvrir le portail de facturation" : ja ? "請求管理を開けませんでした" : de ? "Abrechnungsportal konnte nicht geöffnet werden" : "Couldn't open billing portal",
    magicSentTitle: zh ? "登录链接已发送" : es ? "Enlace de acceso enviado" : pt ? "Link de acesso enviado" : fr ? "Lien de connexion envoyé" : ja ? "サインインリンクを送信しました" : de ? "Anmeldelink gesendet" : "Magic link sent",
    magicSentBody: (email: string) =>
      zh
        ? `我们已把登录链接发到 ${email}，点击邮件里的链接即可登录(可能在垃圾箱)。`
        : es
        ? `Hemos enviado un enlace de acceso a ${email}. Haz clic en él para iniciar sesión (revisa también spam).`
        : pt
        ? `Enviamos um link de acesso para ${email}. Clique nele para entrar (verifique também o spam).`
        : fr
        ? `Nous avons envoyé un lien de connexion à ${email}. Cliquez dessus pour vous connecter (vérifiez aussi les spams).`
        : ja
        ? `${email} にサインインリンクを送信しました。メール内のリンクをクリックしてサインインしてください（迷惑メールフォルダもご確認ください）。`
        : de
        ? `Wir haben einen Anmeldelink an ${email} gesendet. Klicken Sie darauf, um sich anzumelden (prüfen Sie auch den Spam-Ordner).`
        : `We've sent a sign-in link to ${email}. Click it to sign in (check spam too).`,
    back: zh ? "← 返回" : es ? "← Volver" : pt ? "← Voltar" : fr ? "← Retour" : ja ? "← 戻る" : de ? "← Zurück" : "← Back",
    continueGoogle: zh ? "使用 Google 继续" : es ? "Continuar con Google" : pt ? "Continuar com Google" : fr ? "Continuer avec Google" : ja ? "Google で続ける" : de ? "Mit Google fortfahren" : "Continue with Google",
    continueMicrosoft: zh ? "使用 Microsoft 继续" : es ? "Continuar con Microsoft" : pt ? "Continuar com Microsoft" : fr ? "Continuer avec Microsoft" : ja ? "Microsoft で続ける" : de ? "Mit Microsoft fortfahren" : "Continue with Microsoft",
    orEmail: zh ? "或邮箱" : es ? "o correo" : pt ? "ou e-mail" : fr ? "ou e-mail" : ja ? "またはメール" : de ? "oder E-Mail" : "or email",
    sending: zh ? "发送中…" : es ? "Enviando…" : pt ? "Enviando…" : fr ? "Envoi en cours…" : ja ? "送信中…" : de ? "Wird gesendet…" : "Sending…",
    sendMagic: zh ? "发送登录链接" : es ? "Enviar enlace de acceso" : pt ? "Enviar link de acesso" : fr ? "Envoyer le lien de connexion" : ja ? "サインインリンクを送信" : de ? "Anmeldelink senden" : "Send magic link",
    emailHint: zh ? "无需密码，我们会发一封登录邮件给你" : es ? "Sin contraseña — te enviaremos un enlace de acceso" : pt ? "Sem senha — enviaremos um link de acesso por e-mail" : fr ? "Sans mot de passe — nous vous enverrons un lien de connexion" : ja ? "パスワード不要 — サインインリンクをメールでお送りします" : de ? "Kein Passwort — wir senden Ihnen einen Anmeldelink per E-Mail" : "No password — we'll email you a sign-in link",
    appleSoon: zh ? "即将支持 Apple 登录" : es ? "Apple Sign-in próximamente" : pt ? "Apple Sign-in em breve" : fr ? "Connexion Apple bientôt disponible" : ja ? "Apple サインインは近日対応" : de ? "Apple-Anmeldung folgt in Kürze" : "Apple sign-in coming soon",
    signedIn: zh ? "已登录" : es ? "Sesión iniciada" : pt ? "Sessão iniciada" : fr ? "Connecté" : ja ? "サインイン済み" : de ? "Angemeldet" : "Signed in",
    planBilling: zh ? "套餐与账单" : es ? "Plan y facturación" : pt ? "Plano e cobrança" : fr ? "Forfait et facturation" : ja ? "プランと請求" : de ? "Tarif & Abrechnung" : "Plan & billing",
    manageBilling: zh ? "管理账单" : es ? "Gestionar facturación" : pt ? "Gerenciar cobrança" : fr ? "Gérer la facturation" : ja ? "請求を管理" : de ? "Abrechnung verwalten" : "Manage billing",
    manageBillingHint: zh ? "更改付款方式、取消或下载发票 — 由 Creem 安全托管，诚实无套路。" : es ? "Cambia tu método de pago, cancela o descarga facturas — gestionado de forma segura por Creem, sin trucos." : pt ? "Altere sua forma de pagamento, cancele ou baixe faturas — gerenciado com segurança pela Creem, sem pegadinhas." : fr ? "Modifiez votre moyen de paiement, annulez ou téléchargez vos factures — géré en toute sécurité par Creem, sans pièges." : ja ? "お支払い方法の変更・解約・請求書のダウンロード — Creem が安全に処理、隠れた仕掛けはありません。" : de ? "Zahlungsmethode ändern, kündigen oder Rechnungen herunterladen — sicher über Creem abgewickelt, ohne versteckte Tricks." : "Change payment, cancel, or download invoices — securely handled by Creem, no tricks.",
    usageTitle: zh ? "用量与权益" : es ? "Uso y beneficios" : pt ? "Uso e benefícios" : fr ? "Utilisation et avantages" : ja ? "使用量と特典" : de ? "Nutzung & Leistungen" : "Usage & entitlements",
    includedFree: zh ? "PDF 基础工具无限使用 · AI 工具可浅尝" : es ? "Herramientas PDF básicas ilimitadas · una muestra de las herramientas de IA" : pt ? "Ferramentas PDF básicas ilimitadas · uma amostra das ferramentas de IA" : fr ? "Outils PDF de base illimités · un aperçu des outils d'IA" : ja ? "基本 PDF ツールは無制限 · AI ツールはお試し利用" : de ? "Unbegrenzte grundlegende PDF-Tools · ein Vorgeschmack auf die KI-Tools" : "Unlimited core PDF tools · a taste of AI tools",
    includedPlus: zh ? "涵盖免费版 · AI 与批量工具可用量 · 公平用量" : es ? "Todo lo de Free · IA y herramientas por lotes con volumen de trabajo · uso justo" : pt ? "Tudo do Free · IA e ferramentas em lote com volume de trabalho · uso justo" : fr ? "Tout le forfait gratuit · IA et outils par lots à volume de travail · usage équitable" : ja ? "Free のすべて · AI・一括ツールを実用的な量まで · フェアユース" : de ? "Alles aus Free · KI- und Stapel-Tools in praktischem Umfang · faire Nutzung" : "Everything in Free · AI & batch tools at working volume · fair use",
    includedPro: zh ? "涵盖 Plus · 专业级精准 · 无限公平用量" : es ? "Todo lo de Plus · precisión profesional · uso justo ilimitado" : pt ? "Tudo do Plus · precisão profissional · uso justo ilimitado" : fr ? "Tout Plus · précision professionnelle · usage équitable illimité" : ja ? "Plus のすべて · プロ級の精度 · 無制限のフェアユース" : de ? "Alles aus Plus · Präzision auf Profi-Niveau · unbegrenzte faire Nutzung" : "Everything in Plus · pro-grade precision · unlimited fair use",
    fairUse: zh ? "公平用量上限仅用于防止滥用，正常使用不会触及；门控上线后这里会显示实时用量。" : es ? "Los límites de uso justo solo evitan abusos; el uso normal nunca los alcanza. El uso en tiempo real aparecerá aquí pronto." : pt ? "Os limites de uso justo só evitam abusos; o uso normal nunca os atinge. O uso em tempo real aparecerá aqui em breve." : fr ? "Les limites d'usage équitable ne servent qu'à éviter les abus ; un usage normal ne les atteint jamais. L'utilisation en temps réel s'affichera bientôt ici." : ja ? "フェアユース上限は不正利用を防ぐためだけのもので、通常のご利用で達することはありません。計測機能の提供後、ここにリアルタイムの使用量が表示されます。" : de ? "Faire-Nutzung-Grenzen schützen nur vor Missbrauch — bei normaler Nutzung werden sie nie erreicht. Die Echtzeit-Nutzung erscheint hier, sobald die Messung verfügbar ist." : "Fair-use limits only guard against abuse — normal use never hits them. Live usage will appear here once metering ships.",
    trustLine: zh ? "你的文档从不用于训练我们的模型；多数工具在浏览器本地运行。" : es ? "Tus documentos nunca se usan para entrenar nuestros modelos; la mayoría de las herramientas se ejecutan localmente en tu navegador." : pt ? "Seus documentos nunca são usados para treinar nossos modelos; a maioria das ferramentas roda localmente no seu navegador." : fr ? "Vos documents ne servent jamais à entraîner nos modèles ; la plupart des outils s'exécutent localement dans votre navigateur." : ja ? "あなたの文書がモデルの学習に使われることは一切ありません。ほとんどのツールはブラウザ内でローカルに動作します。" : de ? "Ihre Dokumente werden niemals zum Training unserer Modelle verwendet; die meisten Tools laufen lokal in Ihrem Browser." : "Your documents are never used to train our models — most tools run locally in your browser.",
    loading: zh ? "加载…" : es ? "Cargando…" : pt ? "Carregando…" : fr ? "Chargement…" : ja ? "読み込み中…" : de ? "Wird geladen…" : "Loading…",
    signOut: zh ? "退出登录" : es ? "Cerrar sesión" : pt ? "Sair" : fr ? "Se déconnecter" : ja ? "サインアウト" : de ? "Abmelden" : "Sign out",
    privateSpace: zh ? "私密工作区" : es ? "Espacio privado" : pt ? "Espaço privado" : fr ? "Espace privé" : ja ? "プライベートワークスペース" : de ? "Privater Bereich" : "Private Space",
    privateDesc: zh
      ? "启用后，你的流程模板和执行记录将加密同步到云端，跨设备访问，随时可删除。"
      : es
      ? "Cuando está activado, tus plantillas de flujo e historial de ejecuciones se sincronizan cifrados en la nube para acceso entre dispositivos. Puedes borrarlos en cualquier momento."
      : pt
      ? "Quando ativado, seus modelos de fluxo e histórico de execuções são sincronizados criptografados na nuvem para acesso entre dispositivos. Você pode excluí-los a qualquer momento."
      : fr
      ? "Lorsqu'activé, vos modèles de flux et votre historique d'exécutions sont synchronisés de façon chiffrée dans le cloud pour un accès multi-appareils. Vous pouvez les supprimer à tout moment."
      : ja
      ? "有効にすると、フローのテンプレートと実行履歴が暗号化されてクラウドに同期され、デバイス間でアクセスできます。いつでも削除できます。"
      : de
      ? "Wenn aktiviert, werden Ihre Flow-Vorlagen und Ihr Ausführungsverlauf AES-256-verschlüsselt in die Cloud synchronisiert, für den Zugriff über mehrere Geräte. Sie können sie jederzeit löschen."
      : "When enabled, your flow templates and run history sync encrypted to the cloud for cross-device access. You can delete them at any time.",
    privateOn: zh ? "已启用" : es ? "Activado" : pt ? "Ativado" : fr ? "Activé" : ja ? "有効" : de ? "Aktiviert" : "Enabled",
    privateOff: zh ? "未启用" : es ? "Desactivado" : pt ? "Desativado" : fr ? "Désactivé" : ja ? "無効" : de ? "Deaktiviert" : "Disabled",
    enableSync: zh ? "启用同步" : es ? "Activar sincronización" : pt ? "Ativar sincronização" : fr ? "Activer la synchronisation" : ja ? "同期を有効化" : de ? "Synchronisierung aktivieren" : "Enable sync",
    disableSync: zh ? "停用同步" : es ? "Desactivar sincronización" : pt ? "Desativar sincronização" : fr ? "Désactiver la synchronisation" : ja ? "同期を無効化" : de ? "Synchronisierung deaktivieren" : "Disable sync",
    deleteData: zh ? "删除所有数据" : es ? "Eliminar todos los datos" : pt ? "Excluir todos os dados" : fr ? "Supprimer toutes les données" : ja ? "すべてのデータを削除" : de ? "Alle Daten löschen" : "Delete all data",
    deleteConfirm: zh
      ? "确认删除？此操作不可撤销。"
      : es
      ? "¿Confirmar eliminación? Esta acción no se puede deshacer."
      : pt
      ? "Confirmar exclusão? Esta ação não pode ser desfeita."
      : fr
      ? "Confirmer la suppression ? Cette action est irréversible."
      : ja
      ? "削除しますか？この操作は取り消せません。"
      : de
      ? "Löschen bestätigen? Dieser Vorgang kann nicht rückgängig gemacht werden."
      : "Confirm delete? This cannot be undone.",
    deleteCancel: zh ? "取消" : es ? "Cancelar" : pt ? "Cancelar" : fr ? "Annuler" : ja ? "キャンセル" : de ? "Abbrechen" : "Cancel",
    deleting: zh ? "删除中…" : es ? "Eliminando…" : pt ? "Excluindo…" : fr ? "Suppression…" : ja ? "削除中…" : de ? "Wird gelöscht…" : "Deleting…",
    deleteOk: (t: number, r: number) =>
      zh
        ? `已删除 ${t} 个模板，${r} 条运行记录。`
        : es
        ? `Se eliminaron ${t} plantilla(s) y ${r} registro(s) de ejecución.`
        : pt
        ? `${t} modelo(s) e ${r} registro(s) de execução excluídos.`
        : fr
        ? `${t} modèle(s) et ${r} exécution(s) supprimés.`
        : ja
        ? `テンプレート ${t} 件、実行履歴 ${r} 件を削除しました。`
        : de
        ? `${t} Vorlage(n) und ${r} Ausführung(en) gelöscht.`
        : `Deleted ${t} template(s) and ${r} run(s).`,
    saving: zh ? "保存中…" : es ? "Guardando…" : pt ? "Salvando…" : fr ? "Enregistrement…" : ja ? "保存中…" : de ? "Wird gespeichert…" : "Saving…",
    eyebrow: zh ? "账户" : es ? "Cuenta" : pt ? "Conta" : fr ? "Compte" : ja ? "アカウント" : de ? "Konto" : "Account",
    headSignedOut: zh ? "登录 DockDocs" : es ? "Iniciar sesión en DockDocs" : pt ? "Entrar no DockDocs" : fr ? "Connexion à DockDocs" : ja ? "DockDocs にサインイン" : de ? "Bei DockDocs anmelden" : "Sign in to DockDocs",
    headSignedIn: zh ? "你的账户" : es ? "Tu cuenta" : pt ? "Sua conta" : fr ? "Votre compte" : ja ? "アカウント" : de ? "Ihr Konto" : "Your account",
    subSignedOut: zh ? "访问你的工作区、管理订阅，并跨设备保留文档记录。" : es ? "Accede a tu área de trabajo, gestiona la facturación y mantén el historial de documentos en todos tus dispositivos." : pt ? "Acesse seu espaço de trabalho, gerencie assinaturas e mantenha o histórico de documentos em todos os seus dispositivos." : fr ? "Accédez à votre espace de travail, gérez la facturation et conservez l'historique de vos documents sur tous vos appareils." : ja ? "ワークスペースにアクセスし、請求を管理し、文書の履歴をデバイス間で保持できます。" : de ? "Greifen Sie auf Ihren Arbeitsbereich zu, verwalten Sie die Abrechnung und behalten Sie Ihren Dokumentenverlauf über alle Geräte hinweg." : "Access your workspace, manage billing, and keep your document history across devices.",
    subSignedIn: zh ? "管理你的套餐、账单与工作区。" : es ? "Gestiona tu plan, facturación y área de trabajo." : pt ? "Gerencie seu plano, cobrança e espaço de trabalho." : fr ? "Gérez votre forfait, votre facturation et votre espace de travail." : ja ? "プラン・請求・ワークスペースを管理します。" : de ? "Verwalten Sie Ihren Tarif, Ihre Abrechnung und Ihren Arbeitsbereich." : "Manage your plan, billing, and workspace.",
  };
}

export function AccountClient({ locale = "en" }: { locale?: AccountLocale }) {
  const t = getCopy(locale);
  const router = useRouter();
  // Membership-ui / UpgradeFlow are a separate, lib-owned locale surface whose
  // MembershipLocale type has NO "de"/"ko" arm and no authored German/Korean
  // billing/upgrade copy (badge labels, plan status, proration breakdown). Those
  // files are out of scope here, so the Account-owned copy above is fully German
  // while these billing helpers stay de/ko→en — the same coercion they would apply
  // internally. zh-Hant IS supported by MembershipLocale, so it passes through.
  // Drop the de/ko coercion when membership-ui.ts gains those arms.
  const membershipLocale: MembershipLocale = locale === "de" || locale === "ko" ? "en" : locale;
  const upgradeFlow = useUpgradeFlow(membershipLocale);
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
      setError(t.sendFailed);
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

  // Free users (no recurring sub to prorate) → the pricing page to pick a plan.
  // Recurring users invoke the in-place upgrade flow instead (prompt.target set).
  function goPricing() {
    router.push(locale === "en" ? "/pricing" : `/${locale}/pricing`);
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
      <div className="mt-8 space-y-4">
        {header}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--success-surface)] text-[color:var(--success)] text-xl">✉</div>
        <p className="text-center text-[15px] font-semibold">{t.magicSentTitle}</p>
        <p className="text-center text-[13px] text-[color:var(--muted)]">{t.magicSentBody(email)}</p>
        <OtpVerifyForm
          email={email}
          locale={locale}
          onVerified={async () => {
            const u = await getUser();
            if (u) {
              setUser(u);
              setView("signed-in");
              try {
                setSubscription(await getSubscriptionSnapshot());
              } catch {
                /* snapshot is non-blocking for sign-in */
              }
            }
          }}
        />
        <button type="button" onClick={() => { setView("signed-out"); setMessage(""); }} className="block w-full text-center text-[12px] text-[color:var(--muted)] hover:text-[color:var(--foreground)]">{t.back}</button>
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

  // signed-in — membership center
  const display = subscription?.displayName ?? "Free";
  const interval = subscription?.record.interval;
  const badge = planBadge(display, interval, membershipLocale);
  const prompts = subscription ? upgradePrompts(display, interval, membershipLocale) : [];
  const isPaid = subscription?.isPaidPlaceholder ?? false;
  const included = display === "Pro" ? t.includedPro : display === "Plus" ? t.includedPlus : t.includedFree;

  return (
    <div className="mt-8 space-y-6">
      {header}

      <UpgradeConfirmModal flow={upgradeFlow} locale={membershipLocale} />

      {/* Identity */}
      <div className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[color:var(--accent)] text-[14px] font-semibold text-[color:var(--on-accent)]">
            {user?.pictureUrl ? <img src={user.pictureUrl} alt="" className="h-full w-full object-cover" /> : (user?.name?.charAt(0) ?? user?.email?.charAt(0)?.toUpperCase() ?? "?")}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-[15px] font-semibold">{user?.name || user?.email}</p>
              <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${badge.className}`}>{badge.label}</span>
            </div>
            <p className="truncate text-[13px] text-[color:var(--muted)]">{user?.email}</p>
          </div>
          <span className="ml-auto shrink-0 rounded-full bg-[color:var(--success-surface)] px-2.5 py-1 text-[11px] font-semibold text-[color:var(--success)]">{t.signedIn}</span>
        </div>
      </div>

      {/* Plan & billing */}
      {subscription && (
        <div className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--faint)]">{t.planBilling}</p>
          <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[18px] font-semibold">{subscription.displayName}</p>
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${badge.className}`}>{badge.label}</span>
              </div>
              <p className="mt-1 text-[12px] text-[color:var(--muted)]">
                {planStatusText({ displayName: display, interval, status: subscription.record.status, currentPeriodEnd: subscription.record.currentPeriodEnd, cancelAtPeriodEnd: subscription.record.cancelAtPeriodEnd }, membershipLocale)}
              </p>
            </div>
            {isPaid && (
              <button type="button" onClick={handlePortal} disabled={billingLoading === "portal"} className="rounded-[var(--radius-sm)] border border-[color:var(--line)] px-3 py-1.5 text-[12px] font-medium text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--foreground)] disabled:opacity-50">
                {billingLoading === "portal" ? t.loading : t.manageBilling}
              </button>
            )}
          </div>

          {/* Upgrade prompts — invoke the in-place breakdown flow when the prompt has a
              concrete target (recurring users); Free users (no target) go to /pricing. */}
          {prompts.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {prompts.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  disabled={upgradeFlow.loading}
                  onClick={() => (p.target ? upgradeFlow.beginUpgrade(p.target.plan, p.target.interval) : goPricing())}
                  className={
                    p.primary
                      ? "rounded-[var(--radius-sm)] bg-[color:var(--accent)] px-3 py-1.5 text-[12px] font-semibold text-[color:var(--on-accent)] transition hover:bg-[color:var(--accent-hover)] disabled:opacity-50"
                      : "rounded-[var(--radius-sm)] border border-[color:var(--line)] px-3 py-1.5 text-[12px] font-medium text-[color:var(--accent-strong)] transition hover:border-[color:var(--line-strong)] disabled:opacity-50"
                  }
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          {isPaid && <p className="mt-3 text-[11px] leading-5 text-[color:var(--faint)]">{t.manageBillingHint}</p>}
        </div>
      )}

      {/* Usage & entitlements (lightweight — live metering ships later) */}
      {subscription && (
        <div className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--faint)]">{t.usageTitle}</p>
          <p className="mt-3 text-[13px] leading-5 text-[color:var(--foreground)]">{included}</p>
          <p className="mt-2 text-[12px] leading-5 text-[color:var(--muted)]">{t.fairUse}</p>
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

      {/* Trust reminder — the north-star promise */}
      <p className="px-1 text-center text-[12px] leading-5 text-[color:var(--faint)]">{t.trustLine}</p>

      {(error || upgradeFlow.error) && <p className="rounded-[var(--radius-sm)] bg-[color:var(--error-surface)] px-3 py-2 text-[13px] text-[color:var(--error)]">{error || upgradeFlow.error}</p>}

      <button type="button" onClick={handleSignOut} className="w-full rounded-[var(--radius)] border border-[color:var(--error-line)] px-4 py-2.5 text-[13px] font-medium text-[color:var(--error)] transition hover:bg-[color:var(--error-surface)]">
        {t.signOut}
      </button>
    </div>
  );
}
