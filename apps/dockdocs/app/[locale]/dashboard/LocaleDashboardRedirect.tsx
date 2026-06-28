"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function LocaleDashboardRedirect({ locale }: { locale: string }) {
  const router = useRouter();
  useEffect(() => {
    try { localStorage.setItem("dockdocs-lang", locale); } catch {}
    router.replace("/dashboard");
  }, [router, locale]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-[color:var(--line)] border-t-[color:var(--accent)]" />
    </div>
  );
}
