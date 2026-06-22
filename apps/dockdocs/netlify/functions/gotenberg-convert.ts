import type { Context } from "@netlify/functions";
import { enforceFeatureGate } from "./_shared/feature-gate";

declare const Netlify: {
  env: {
    get(name: string): string | undefined;
  };
};

const ALLOWED_ORIGIN = /^https:\/\/([a-z0-9-]+\.)*(dockdocs\.app|netlify\.app)$/i;

// Forward-direction conversions the self-hosted Gotenberg box can serve at ~$0.
// Reverse (pdf -> office) cannot be done by Gotenberg and stays on CloudConvert.
const GOTENBERG_ROUTES = new Set([
  "word-to-pdf",
  "ppt-to-pdf",
  "excel-to-pdf",
  "html-to-pdf",
  "pdf-to-pdfa",
]);

// Best-effort per-IP sliding-window limiter (per warm instance) to bound abuse.
const rlHits = new Map<string, number[]>();
function isRateLimited(req: Request, limit: number, windowMs: number): boolean {
  const ip =
    req.headers.get("x-nf-client-connection-ip") ||
    (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
    "anon";
  const now = Date.now();
  const arr = (rlHits.get(ip) || []).filter((ts) => now - ts < windowMs);
  arr.push(now);
  rlHits.set(ip, arr);
  if (rlHits.size > 5000) {
    for (const [k, v] of rlHits) if (!v.length || now - v[v.length - 1] > windowMs) rlHits.delete(k);
  }
  return arr.length > limit;
}

// ---------------------------------------------------------------------------
// Synchronous proxy to the self-hosted Gotenberg box (Chromium + LibreOffice).
// Unlike the CloudConvert path, the file passes THROUGH this function, so it is
// bounded by Netlify's ~6 MB body limit — the client only routes small files
// here and falls back to CloudConvert for larger files or on any failure.
//
// Auth to the box is a shared secret header (X-DockDocs-Key); the box's Caddy
// rejects anything without it. Both GOTENBERG_URL and GOTENBERG_SECRET live in
// Netlify env, never in the client.
// ---------------------------------------------------------------------------
export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") {
    return json({ ok: false, code: "METHOD_NOT_ALLOWED", message: "Use POST." }, 405);
  }

  const origin = req.headers.get("origin");
  if (origin && !ALLOWED_ORIGIN.test(origin) && !/^http:\/\/localhost(:\d+)?$/i.test(origin)) {
    return json({ ok: false, code: "FORBIDDEN_ORIGIN", message: "Requests are only allowed from DockDocs." }, 403);
  }

  const base = Netlify.env.get("GOTENBERG_URL")?.trim().replace(/\/+$/, "");
  const secret = Netlify.env.get("GOTENBERG_SECRET")?.trim();
  if (!base || !secret) {
    return json({ ok: false, code: "NOT_CONFIGURED", message: "Self-hosted converter is not configured." }, 503);
  }

  if (isRateLimited(req, 30, 60_000)) {
    return json({ ok: false, code: "RATE_LIMITED", message: "Too many conversions — please wait a minute and try again." }, 429);
  }

  // Per-plan conversion quota — reads only the Authorization header, safe before formData().
  // This endpoint serves ONLY forward $0 self-hosted Gotenberg routes (word/ppt/excel/html→pdf,
  // pdf-to-pdfa), so it meters on "convertFree" (high fair-use, no real cost). Paid CloudConvert
  // paths (cloudconvert-convert / reverse-convert) keep the low "convert" meter (Option C).
  const gate = await enforceFeatureGate(req, "convertFree");
  if (!gate.ok) return gate.response;

  let inForm: FormData;
  try {
    inForm = await req.formData();
  } catch {
    return json({ ok: false, code: "INVALID_BODY", message: "Expected multipart form-data." }, 400);
  }

  const route = String(inForm.get("route") || "").trim();
  const file = inForm.get("file");
  if (!GOTENBERG_ROUTES.has(route)) {
    return json({ ok: false, code: "INVALID_ROUTE", message: "Unsupported route for the self-hosted converter." }, 400);
  }
  if (!(file instanceof File) || file.size === 0) {
    return json({ ok: false, code: "NO_FILE", message: "No file was provided." }, 400);
  }

  // Build the Gotenberg request per route.
  let endpoint: string;
  const out = new FormData();
  if (route === "html-to-pdf") {
    endpoint = `${base}/forms/chromium/convert/html`;
    out.append("files", file, "index.html"); // Chromium HTML route needs the entry file named index.html
  } else if (route === "pdf-to-pdfa") {
    endpoint = `${base}/forms/pdfengines/convert`;
    out.append("files", file, file.name || "document.pdf");
    out.append("pdfa", "PDF/A-2b");
  } else {
    endpoint = `${base}/forms/libreoffice/convert`;
    out.append("files", file, file.name || "document");
  }

  let upstream: Response;
  try {
    upstream = await fetch(endpoint, {
      method: "POST",
      headers: { "X-DockDocs-Key": secret },
      body: out,
    });
  } catch (err) {
    console.error("[gotenberg] unreachable", err instanceof Error ? err.message : err);
    return json({ ok: false, code: "UPSTREAM_UNREACHABLE", message: "The converter could not be reached." }, 502);
  }

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => "");
    console.error("[gotenberg] convert failed", upstream.status, detail.slice(0, 300));
    return json({ ok: false, code: "CONVERT_FAILED", status: upstream.status, message: "The file could not be converted." }, 502);
  }

  const pdf = await upstream.arrayBuffer();
  if (pdf.byteLength === 0) {
    return json({ ok: false, code: "EMPTY_RESULT", message: "The converter returned an empty file." }, 502);
  }

  await gate.commit();
  return new Response(pdf, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Cache-Control": "no-store",
    },
  });
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const config = {
  path: "/api/gotenberg-convert",
};
