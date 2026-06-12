"use client";

import { useEffect } from "react";

// Client-side redirect for a static-export route that should point elsewhere
// (e.g. a legacy/placeholder slug → the real tool). Renders a minimal fallback
// with a manual link in case JS is disabled.
export function ClientRedirect({ to }: { to: string }) {
  useEffect(() => {
    window.location.replace(to);
  }, [to]);

  return (
    <main className="mx-auto max-w-3xl px-5 py-24 text-center">
      <p className="text-[15px] text-[color:var(--muted)]">
        Redirecting…{" "}
        <a href={to} className="text-[color:var(--accent)] underline">
          Continue
        </a>
      </p>
    </main>
  );
}
