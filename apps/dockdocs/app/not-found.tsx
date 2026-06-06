"use client";

import { usePathname } from "next/navigation";
import { isAllLocale, defaultLocale } from "@/lib/i18n";

function getLocale(path: string | null) {
  const seg = (path ?? "/").split("/").filter(Boolean)[0];
  return isAllLocale(seg) ? seg : defaultLocale;
}

export default function NotFound() {
  // usePathname is safe here — not-found renders client-side
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/";
  const locale = getLocale(pathname);
  const zh = locale === "zh";

  return (
    <main className="mx-auto min-h-[60vh] max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
        404
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-[color:var(--foreground)]">
        {zh ? "页面不存在" : "Page not found"}
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-[color:var(--muted)]">
        {zh
          ? "你请求的 DockDocs 页面不存在或已被移动。"
          : "The requested DockDocs page is unavailable or has been moved."}
      </p>
      <div className="mt-6">
        <a
          href={zh ? "/zh/" : "/"}
          className="inline-flex h-10 items-center rounded-[var(--radius)] bg-[color:var(--accent)] px-5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          {zh ? "回到首页" : "Back to home"}
        </a>
      </div>
    </main>
  );
}
