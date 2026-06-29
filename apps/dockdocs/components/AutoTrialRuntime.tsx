"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { onAuthChange } from "@/lib/auth";
import { getSubscriptionSnapshot, startBillingTrial } from "@/lib/subscription-runtime";
import { localeFromPathname } from "@/lib/copy";

// Detects first-ever sign-in transitions and auto-activates a 7-day Pro trial
// for eligible users (no paid sub, no prior trial). Fires once per browser session.
// Gate: skipped if plan !== FREE or status === "trialing" (avoids redundant endpoint call).
export function AutoTrialRuntime() {
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const [toast, setToast] = useState(false);
  // Track sign-in state: null = first callback not yet received, bool = known state.
  const knownSignedIn = useRef<boolean | null>(null);
  const fired = useRef(false);

  useEffect(() => {
    let mounted = true;

    const unsub = onAuthChange(async (user) => {
      if (!mounted) return;

      const isSignedIn = user !== null;

      if (knownSignedIn.current === null) {
        // First callback: establish initial state. Do NOT fire trial on page load
        // even if the user is already signed in — we only want actual transitions.
        knownSignedIn.current = isSignedIn;
        return;
      }

      if (!knownSignedIn.current && isSignedIn && !fired.current) {
        // Signed-out → signed-in transition.
        knownSignedIn.current = true;
        fired.current = true;

        try {
          const snap = await getSubscriptionSnapshot();
          // Skip if already on a paid plan or currently trialing.
          if (snap.isPaidPlaceholder || snap.record.status === "trialing") return;

          const result = await startBillingTrial();
          if (result.ok && mounted) {
            setToast(true);
            const tid = setTimeout(() => { if (mounted) setToast(false); }, 7000);
            return () => clearTimeout(tid);
          }
        } catch {
          // Non-blocking — trial failure must never interrupt the login flow.
        }
      } else {
        knownSignedIn.current = isSignedIn;
      }
    });

    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  if (!toast) return null;

  const zh = locale === "zh" || locale === "zh-Hant";
  const msg =
    zh ? "已激活 7 天 Pro 试用 · 到期自动回免费版 · 不收信用卡"
    : locale === "es" ? "Prueba Pro de 7 días activada · Vuelve al plan gratis al vencer · Sin tarjeta"
    : locale === "pt" ? "Teste Pro de 7 dias ativado · Retorna ao gratuito ao expirar · Sem cartão"
    : locale === "fr" ? "Essai Pro de 7 jours activé · Retour au gratuit à l'expiration · Sans carte"
    : locale === "ja" ? "7日間Proトライアル開始 · 期限後は自動的に無料版へ · カード不要"
    : locale === "de" ? "7-tägige Pro-Testphase aktiviert · Läuft automatisch ab · Keine Kreditkarte"
    : locale === "ko" ? "7일 Pro 체험 시작 · 만료 후 자동으로 무료 버전 전환 · 카드 불필요"
    : "7-day Pro trial activated · Reverts to Free when it ends · No card needed";

  const dismissLabel =
    zh ? "关闭"
    : locale === "es" ? "Cerrar"
    : locale === "pt" ? "Fechar"
    : locale === "fr" ? "Fermer"
    : locale === "ja" ? "閉じる"
    : locale === "de" ? "Schließen"
    : locale === "ko" ? "닫기"
    : "Dismiss";

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-[60] flex items-center justify-between gap-3 border-t border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-3 text-[13px] text-[color:var(--foreground)] shadow-[0_-2px_16px_rgba(0,0,0,0.08)]"
    >
      <span>
        <span className="mr-2 inline-block rounded-full bg-[color:var(--accent)] px-2 py-0.5 text-[11px] font-semibold text-[color:var(--on-accent)]">
          Pro
        </span>
        {msg}
      </span>
      <button
        type="button"
        onClick={() => setToast(false)}
        aria-label={dismissLabel}
        className="shrink-0 rounded p-1 text-[color:var(--muted)] transition hover:text-[color:var(--foreground)]"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 4l8 8M12 4l-8 8" />
        </svg>
      </button>
    </div>
  );
}
