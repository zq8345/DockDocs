"use client";

import { usePathname } from "next/navigation";
import { isAllLocale, defaultLocale } from "@/lib/i18n";
import { LAYOUT } from "@/lib/layout-constants";

function getLocale(path: string | null) {
  const seg = (path ?? "/").split("/").filter(Boolean)[0];
  return isAllLocale(seg) ? seg : defaultLocale;
}

// Localized 404 copy for every route locale (en/zh/zh-Hant/es/pt/fr/ja/de).
// Falls back to English for any non-route locale isAllLocale may return.
const NOT_FOUND_COPY = {
  en: { title: "Page not found", body: "The requested DockDocs page is unavailable or has been moved.", home: "Back to home" },
  zh: { title: "页面不存在", body: "你请求的 DockDocs 页面不存在或已被移动。", home: "回到首页" },
  "zh-Hant": { title: "頁面不存在", body: "你請求的 DockDocs 頁面不存在或已被移動。", home: "回到首頁" },
  es: { title: "Página no encontrada", body: "La página de DockDocs solicitada no existe o se ha movido.", home: "Volver al inicio" },
  pt: { title: "Página não encontrada", body: "A página do DockDocs solicitada não existe ou foi movida.", home: "Voltar ao início" },
  fr: { title: "Page introuvable", body: "La page DockDocs demandée n'existe pas ou a été déplacée.", home: "Retour à l'accueil" },
  ja: { title: "ページが見つかりません", body: "お探しの DockDocs ページは存在しないか、移動されました。", home: "ホームに戻る" },
  de: { title: "Seite nicht gefunden", body: "Die angeforderte DockDocs-Seite ist nicht verfügbar oder wurde verschoben.", home: "Zurück zur Startseite" },
} as const;

export default function NotFound() {
  // usePathname is safe here — not-found renders client-side
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/";
  const locale = getLocale(pathname);
  const c = NOT_FOUND_COPY[locale as keyof typeof NOT_FOUND_COPY] ?? NOT_FOUND_COPY.en;
  // Only prefix the home link for locales that actually have a route; others → "/".
  const homeHref = locale !== defaultLocale && locale in NOT_FOUND_COPY ? `/${locale}/` : "/";

  return (
    <main className={`mx-auto min-h-[60vh] ${LAYOUT.content} px-4 py-20 sm:px-6 lg:px-8`}>
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
        404
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-[color:var(--foreground)]">
        {c.title}
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-[color:var(--muted)]">
        {c.body}
      </p>
      <div className="mt-6">
        <a
          href={homeHref}
          className="inline-flex h-10 items-center rounded-[var(--radius)] bg-[color:var(--accent)] px-5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          {c.home}
        </a>
      </div>
    </main>
  );
}
