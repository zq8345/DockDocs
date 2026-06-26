"use client";

// Email verification-code (OTP) step, shared by AccountClient + CommercialAccountClient.
// After sendMagicLink() the email carries BOTH a sign-in link and a 6-digit code; this
// form lets the user paste/type the code and verifies it client-side (verifyEmailOtp →
// supabase.auth.verifyOtp, which sets the session without a redirect round-trip). The
// magic link stays as a fallback. Errors are generic so we never reveal whether an
// email exists. Auth is core UI, so copy is authored in all active locales.
import { useEffect, useRef, useState, type FormEvent } from "react";
import { sendMagicLink, verifyEmailOtp } from "@/lib/auth";
import { deepHant } from "@/lib/zh-hant";

const RESEND_SECONDS = 60;

function buildCopy(locale: string) {
  const zh = locale === "zh";
  const es = locale === "es";
  const pt = locale === "pt";
  const fr = locale === "fr";
  const ja = locale === "ja";
  const de = locale === "de";
  const base = {
    label: zh ? "输入邮件里的验证码" : es ? "Introduce el código del correo" : pt ? "Digite o código do e-mail" : fr ? "Saisissez le code de l'e-mail" : ja ? "メールの確認コードを入力" : de ? "Code aus der E-Mail eingeben" : "Enter the code from your email",
    verify: zh ? "验证并登录" : es ? "Verificar e iniciar sesión" : pt ? "Verificar e entrar" : fr ? "Vérifier et se connecter" : ja ? "確認してログイン" : de ? "Bestätigen und anmelden" : "Verify & sign in",
    verifying: zh ? "验证中…" : es ? "Verificando…" : pt ? "Verificando…" : fr ? "Vérification…" : ja ? "確認中…" : de ? "Wird überprüft…" : "Verifying…",
    resend: zh ? "重新发送验证码" : es ? "Reenviar código" : pt ? "Reenviar código" : fr ? "Renvoyer le code" : ja ? "コードを再送信" : de ? "Code erneut senden" : "Resend code",
    resendIn: (n: number) => (zh ? `重新发送(${n}s)` : es ? `Reenviar (${n}s)` : pt ? `Reenviar (${n}s)` : fr ? `Renvoyer (${n}s)` : ja ? `再送信(${n}s)` : de ? `Erneut senden (${n}s)` : `Resend (${n}s)`),
    fallback: zh ? "没收到?你也可以点邮件里的登录链接。" : es ? "¿No lo recibiste? También puedes usar el enlace del correo." : pt ? "Não recebeu? Você também pode usar o link do e-mail." : fr ? "Pas reçu ? Vous pouvez aussi utiliser le lien dans l'e-mail." : ja ? "届かない場合は、メール内のログインリンクもご利用いただけます。" : de ? "Nicht erhalten? Sie können auch den Link in der E-Mail verwenden." : "Didn't get it? You can also use the sign-in link in the email.",
    error: zh ? "验证码不正确或已过期,请重试或重新发送。" : es ? "Código incorrecto o caducado. Inténtalo de nuevo o reenvíalo." : pt ? "Código incorreto ou expirado. Tente novamente ou reenvie." : fr ? "Code incorrect ou expiré. Réessayez ou renvoyez-le." : ja ? "コードが正しくないか期限切れです。もう一度お試しいただくか再送信してください。" : de ? "Code falsch oder abgelaufen. Bitte erneut versuchen oder neu senden." : "That code is incorrect or expired. Try again or resend.",
  };
  // zh-Hant: derive Traditional Chinese from zh via deepHant (same pattern as AccountClient)
  if (locale === "zh-Hant") return deepHant(buildCopy("zh"));
  return base;
}

export function OtpVerifyForm({
  email,
  locale,
  onVerified,
}: {
  email: string;
  locale: string;
  onVerified: () => void | Promise<void>;
}) {
  const t = buildCopy(locale);

  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [err, setErr] = useState("");
  const [left, setLeft] = useState(RESEND_SECONDS);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (left <= 0) return;
    const id = window.setInterval(() => setLeft((n) => (n <= 1 ? 0 : n - 1)), 1000);
    return () => window.clearInterval(id);
  }, [left]);

  const digits = code.replace(/\D/g, "");

  async function onVerify(e: FormEvent) {
    e.preventDefault();
    if (busy || digits.length < 6) return;
    setBusy(true);
    setErr("");
    try {
      await verifyEmailOtp(email, digits);
      await onVerified();
    } catch {
      setErr(t.error); // generic — never reveals whether the email exists
    } finally {
      setBusy(false);
    }
  }

  async function onResend() {
    if (left > 0 || resending) return;
    setResending(true);
    setErr("");
    try {
      await sendMagicLink(email);
      setLeft(RESEND_SECONDS);
    } catch {
      setErr(t.error);
    } finally {
      setResending(false);
    }
  }

  return (
    <form onSubmit={onVerify} className="space-y-3 text-left">
      <label className="block text-[13px] font-medium text-[color:var(--muted)]">{t.label}</label>
      <input
        ref={inputRef}
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]*"
        maxLength={6}
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        placeholder="••••••"
        aria-label={t.label}
        className="w-full rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-3 text-center text-[20px] font-semibold tracking-[0.4em] tabular-nums outline-none transition focus:border-[color:var(--accent)]"
      />
      {err && <p className="text-[12.5px] text-[color:var(--error)]">{err}</p>}
      <button
        type="submit"
        disabled={busy || digits.length < 6}
        className="w-full rounded-[var(--radius)] bg-[color:var(--accent)] px-4 py-3 text-[14px] font-semibold text-[color:var(--on-accent)] transition hover:opacity-90 disabled:opacity-50"
      >
        {busy ? t.verifying : t.verify}
      </button>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onResend}
          disabled={left > 0 || resending}
          className="text-[12px] font-semibold text-[color:var(--accent)] transition disabled:text-[color:var(--faint)]"
        >
          {left > 0 ? t.resendIn(left) : t.resend}
        </button>
      </div>
      <p className="text-[11.5px] leading-relaxed text-[color:var(--faint)]">{t.fallback}</p>
    </form>
  );
}
