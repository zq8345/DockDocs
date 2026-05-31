"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { localeFromPathname } from "@/lib/copy";

export function HtmlLangSync() {
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.lang = localeFromPathname(pathname);
  }, [pathname]);

  return null;
}
