"use client";

import { useEffect, useState } from "react";
import { OFFLINE_COPY, detectOfflineLocale, type OfflineLocale } from "@/lib/offline-copy";

// Content of the /offline fallback page (served by the service worker when the user
// navigates to an uncached page while offline). Locale-aware, client-side only.
export function OfflineFallback() {
  const [loc, setLoc] = useState<OfflineLocale>("en");
  useEffect(() => setLoc(detectOfflineLocale()), []);
  const c = OFFLINE_COPY[loc];

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 font-mono text-xs text-[color:var(--faint)]">// DockDocs</div>
      <h1 className="mb-4 text-2xl font-normal text-[color:var(--foreground)]">{c.title}</h1>
      <p className="leading-relaxed text-[color:var(--muted)]">{c.body}</p>
      <button
        onClick={() => location.reload()}
        className="mt-8 rounded-lg border border-[color:var(--line)] px-5 py-2.5 text-sm text-[color:var(--foreground)] transition-colors hover:border-[color:var(--line-strong)]"
      >
        {c.retry}
      </button>
    </main>
  );
}
