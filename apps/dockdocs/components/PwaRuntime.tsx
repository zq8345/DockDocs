"use client";

import { useEffect, useState } from "react";
import { OFFLINE_COPY, detectOfflineLocale, type OfflineLocale } from "@/lib/offline-copy";

// Registers the service worker (production builds only) and shows an honest offline
// banner when the connection drops — so a failed AI / conversion call reads as "no
// connection" rather than a mysterious error, while the browser-side tools keep working.
export function PwaRuntime() {
  const [offline, setOffline] = useState(false);
  const [loc, setLoc] = useState<OfflineLocale>("en");

  useEffect(() => {
    setLoc(detectOfflineLocale());

    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const sync = () => setOffline(typeof navigator !== "undefined" && !navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-2 text-center text-xs text-[color:var(--muted)]"
    >
      {OFFLINE_COPY[loc].banner}
    </div>
  );
}
