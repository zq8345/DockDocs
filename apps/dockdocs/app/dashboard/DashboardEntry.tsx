"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { isRouteLocale } from "@/lib/i18n";

// Lazy-load the full workspace to keep the /dashboard entry chunk small.
const DashboardWorkspace = dynamic(
  () => import("@/components/DashboardWorkspace").then((m) => m.DashboardWorkspace),
  { ssr: false },
);

export function DashboardEntry() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [isEn, setIsEn] = useState(false);

  useEffect(() => {
    let locale = "en";
    try {
      const saved = localStorage.getItem("dockdocs-lang");
      if (saved && isRouteLocale(saved)) locale = saved;
    } catch {}

    if (locale === "en") {
      setIsEn(true);
      setReady(true);
    } else {
      router.replace(`/${locale}/dashboard`);
    }
  }, [router]);

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[color:var(--line)] border-t-[color:var(--accent)]" />
      </div>
    );
  }

  if (isEn) return <DashboardWorkspace locale="en" />;
  return null;
}
