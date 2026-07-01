"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function LocaleWorkspaceToolRedirect({
  locale,
  toolSlug,
}: {
  locale: string;
  toolSlug: string;
}) {
  const router = useRouter();
  useEffect(() => {
    try { localStorage.setItem("dockdocs-lang", locale); } catch {}
    // Redirect to the root workspace with the same tool slug
    router.replace(`/workspace/${toolSlug}/`);
  }, [router, locale, toolSlug]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-[color:var(--line)] border-t-[color:var(--accent)]" />
    </div>
  );
}
