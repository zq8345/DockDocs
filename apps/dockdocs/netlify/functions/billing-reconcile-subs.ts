import type { Config, Context } from "@netlify/functions";
import { cancelCreemSubscription } from "./_shared/creem";
import { listAllSubscriptions, writeSubscription } from "./_shared/billing-store";

declare const Netlify: { env: { get(name: string): string | undefined } };

// Admin-gated reconciliation sweep for the Path-2 proration residual risk: when the
// post-upgrade cancellation of a user's OLD recurring sub fails, the webhook leaves a
// `pendingCancelFailure` marker. This retries those cancels — preventing a silent
// double-charge — and clears the marker on success. Safe to run on a schedule.
// Auth: shared admin bearer token (reuses DOCKDOCS_METRICS_TOKEN).

export default async (req: Request, _ctx: Context) => {
  const expected = Netlify.env.get("DOCKDOCS_METRICS_TOKEN")?.trim();
  const header = req.headers.get("authorization") || "";
  const provided = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!expected || !provided || !constantTimeEqual(provided, expected)) {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }

  const subs = await listAllSubscriptions();
  const pending = subs.filter((s) => s.pendingCancelFailure?.oldSubId);

  let cleared = 0;
  let stillFailing = 0;
  for (const rec of pending) {
    const oldSubId = rec.pendingCancelFailure?.oldSubId;
    if (!oldSubId) continue;
    const res = await cancelCreemSubscription(oldSubId, "immediate");
    if (res.ok) {
      await writeSubscription({ ...rec, pendingCancelFailure: undefined, updatedAt: new Date().toISOString() });
      cleared += 1;
    } else {
      stillFailing += 1;
    }
  }

  return json({ ok: true, scanned: subs.length, pending: pending.length, cleared, stillFailing }, 200);
};

export const config: Config = { path: "/api/billing/reconcile-subs", method: ["GET", "POST"] };

function constantTimeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  if (ab.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ab.length; i += 1) diff |= ab[i] ^ bb[i];
  return diff === 0;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}
