"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isRouteLocale, defaultLocale } from "@/lib/i18n";

export function DashboardRedirect() {
  const router = useRouter();
  useEffect(() => {
    let locale = "en";
    try {
      const saved = localStorage.getItem("dockdocs-lang");
      if (saved && isRouteLocale(saved)) locale = saved;
    } catch {}
    router.replace(locale === defaultLocale ? "/dashboard" : `/${locale}/dashboard`);
  }, [router]);
  return null;
}
