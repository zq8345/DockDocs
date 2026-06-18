"use client";

import { useState } from "react";
import { authHeader } from "@/lib/supabase";

// ⚠️ TEMPORARY diagnostic UI — remove after the Path 1 vs Path 2 decision. Renders
// only behind ?diag=1 on the account page (see AccountClient). One click calls the
// gated /api/billing/diag-items-upgrade endpoint and shows the raw Creem trace, so
// we can read whether the items-update endpoint does cross-interval. The endpoint is
// gated server-side by BILLING_DIAG_EMAIL; the Creem key never reaches the client.
export function DiagItemsUpgrade() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  async function run() {
    setLoading(true);
    setResult("");
    try {
      const headers = await authHeader();
      const res = await fetch("/api/billing/diag-items-upgrade", { method: "POST", headers });
      const text = await res.text();
      let pretty = text;
      try {
        pretty = JSON.stringify(JSON.parse(text), null, 2);
      } catch {
        // leave raw
      }
      setResult(`HTTP ${res.status}\n\n${pretty}`);
    } catch (e) {
      setResult("ERROR: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-[var(--radius)] border border-[color:var(--accent-strong)] bg-[color:var(--surface)] p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--accent-strong)]">⚙ Diagnostic (temporary)</p>
      <p className="mt-2 text-[13px] leading-5 text-[color:var(--muted)]">
        Tests Creem <code>update-subscription</code> items[] for a cross-interval upgrade
        (your current plan → annual). ⚠️ If Creem supports it, this performs a REAL prorated
        upgrade of your subscription.
      </p>
      <button
        type="button"
        onClick={run}
        disabled={loading}
        className="mt-3 rounded-[var(--radius-sm)] bg-[color:var(--accent)] px-3 py-1.5 text-[12px] font-semibold text-[color:var(--on-accent)] transition hover:bg-[color:var(--accent-hover)] disabled:opacity-50"
      >
        {loading ? "Running…" : "Run items-upgrade diagnostic"}
      </button>
      {result && (
        <pre className="mt-3 max-h-[420px] overflow-auto whitespace-pre-wrap break-all rounded-[var(--radius-sm)] bg-[color:var(--surface-subtle)] p-3 text-[11px] leading-relaxed text-[color:var(--foreground)]">
          {result}
        </pre>
      )}
    </div>
  );
}
