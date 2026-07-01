import type { Config } from "@netlify/functions";

// Self-test monitor for the contract-risk AI endpoint.
// Runs on a schedule; if the endpoint fails, logs an error and optionally
// POSTs to MONITOR_WEBHOOK_URL so we catch model deprecation/outages before
// users do. This is the lesson from the mistral-large-2512 deprecation incident
// (2026-06-30) where the root cause only surfaced through user reports.
//
// Auth: uses X-Monitor-Key header matching MONITOR_SECRET env var to bypass the
// per-user feature gate — no quota is burned by the health check.

declare const Netlify: {
  env: {
    get(name: string): string | undefined;
  };
};

const TEST_CONTRACT = `SERVICE AGREEMENT

This Agreement is entered into as of January 1, 2025, between Acme Corp ("Client") and Vendor Inc ("Service Provider").

1. SERVICES. Service Provider shall deliver software consulting services as directed by Client.
2. PAYMENT. Client shall pay $5,000 per month, due within 15 days of invoice. Late payments accrue 2% interest monthly.
3. TERM. This Agreement is effective for one (1) year and automatically renews unless either party gives 30 days written notice.
4. TERMINATION. Client may terminate for convenience with 30 days notice. Service Provider may terminate immediately for non-payment.
5. LIABILITY. In no event shall either party be liable for indirect, incidental, or consequential damages.
6. CONFIDENTIALITY. Service Provider shall keep all Client information confidential for 3 years after termination.
`;

export default async () => {
  const monitorSecret = Netlify.env.get("MONITOR_SECRET")?.trim();
  if (!monitorSecret) {
    console.warn("[contract-risk-monitor] MONITOR_SECRET not set — skipping health check");
    return;
  }

  // Netlify provides the canonical deploy URL as the URL env var.
  const baseUrl = (Netlify.env.get("URL") || "https://dockdocs.app").replace(/\/+$/, "");
  const endpoint = `${baseUrl}/api/contract-risk`;

  const startMs = Date.now();
  let ok = false;
  let errorMsg = "";

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-monitor-key": monitorSecret,
      },
      body: JSON.stringify({ text: TEST_CONTRACT, locale: "en" }),
    });

    const elapsedMs = Date.now() - startMs;

    if (!res.ok) {
      errorMsg = `HTTP ${res.status} after ${elapsedMs}ms`;
    } else {
      const data = (await res.json()) as { ok?: boolean; risks?: unknown[] };
      if (data.ok && Array.isArray(data.risks) && data.risks.length > 0) {
        ok = true;
        console.log(`[contract-risk-monitor] OK — ${data.risks.length} risks, ${elapsedMs}ms`);
      } else {
        errorMsg = `Response ok=${String(data.ok)} risks=${JSON.stringify(data.risks?.slice(0, 1))} after ${elapsedMs}ms`;
      }
    }
  } catch (err) {
    const elapsedMs = Date.now() - startMs;
    errorMsg = `Fetch failed after ${elapsedMs}ms: ${err instanceof Error ? err.message.slice(0, 200) : String(err)}`;
  }

  if (!ok) {
    console.error(`[contract-risk-monitor] FAIL — ${errorMsg}`);
    await notifyWebhook(errorMsg, baseUrl);
  }
};

async function notifyWebhook(errorMsg: string, baseUrl: string): Promise<void> {
  // TODO: wire a real alert channel (Slack / email) once an incident channel is set up.
  // For now, the console.error above is picked up by Netlify function logs + any
  // log-drain integrations. Set MONITOR_WEBHOOK_URL to enable a simple HTTP POST alert.
  const webhookUrl = Netlify.env.get("MONITOR_WEBHOOK_URL")?.trim();
  if (!webhookUrl) return;
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `[DockDocs] contract-risk health check FAILED\n${baseUrl}/api/contract-risk\n${errorMsg}`,
      }),
    });
  } catch (webhookErr) {
    console.error("[contract-risk-monitor] webhook POST failed:", webhookErr);
  }
}

export const config: Config = {
  // Run once per day at 08:00 UTC. Adjust via CRON_CONTRACT_RISK env if needed.
  schedule: "@daily",
};
