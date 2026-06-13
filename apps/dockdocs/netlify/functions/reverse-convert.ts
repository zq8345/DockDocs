import type { Context } from "@netlify/functions";

declare const Netlify: {
  env: {
    get(name: string): string | undefined;
  };
};

const ALLOWED_ORIGIN = /^https:\/\/([a-z0-9-]+\.)*(dockdocs\.app|netlify\.app)$/i;

// OSS reverse-conversion routes handled by the pdf2docx + pdfplumber service on
// the same Aliyun box as Gotenberg. PDF → DOCX/XLSX at $0 marginal cost.
// PDF → PPTX has no good OSS option — falls through to CloudConvert.
const REVERSE_ROUTES = new Set(["pdf-to-word", "pdf-to-excel"]);

const OUT_MIME: Record<string, string> = {
  "pdf-to-word": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "pdf-to-excel": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

// File passes THROUGH this function — bounded by Netlify's ~6 MB body limit.
const MAX_BYTES = 5 * 1024 * 1024;

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
    return json({ ok: false, code: "NOT_CONFIGURED", message: "Reverse converter is not configured." }, 503);
  }

  if (isRateLimited(req, 20, 60_000)) {
    return json({ ok: false, code: "RATE_LIMITED", message: "Too many conversions — please wait a minute and try again." }, 429);
  }

  let inForm: FormData;
  try {
    inForm = await req.formData();
  } catch {
    return json({ ok: false, code: "INVALID_BODY", message: "Expected multipart form-data." }, 400);
  }

  const route = String(inForm.get("route") || "").trim();
  const file = inForm.get("file");

  if (!REVERSE_ROUTES.has(route)) {
    return json({ ok: false, code: "INVALID_ROUTE", message: "Unsupported route for the OSS reverse converter." }, 400);
  }
  if (!(file instanceof File) || file.size === 0) {
    return json({ ok: false, code: "NO_FILE", message: "No file was provided." }, 400);
  }
  if (file.size > MAX_BYTES) {
    return json({ ok: false, code: "FILE_TOO_LARGE", message: `File exceeds ${MAX_BYTES / 1024 / 1024} MB limit.` }, 413);
  }

  const out = new FormData();
  out.append("route", route);
  out.append("file", file, file.name || "source.pdf");

  let upstream: Response;
  try {
    upstream = await fetch(`${base}/reverse/convert`, {
      method: "POST",
      headers: { "X-DockDocs-Key": secret },
      body: out,
    });
  } catch (err) {
    console.error("[reverse] unreachable", err instanceof Error ? err.message : err);
    return json({ ok: false, code: "UPSTREAM_UNREACHABLE", message: "The reverse converter could not be reached." }, 502);
  }

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => "");
    console.error("[reverse] convert failed", upstream.status, detail.slice(0, 300));
    return json({ ok: false, code: "CONVERT_FAILED", status: upstream.status, message: "The file could not be converted." }, 502);
  }

  const result = await upstream.arrayBuffer();
  if (result.byteLength === 0) {
    return json({ ok: false, code: "EMPTY_RESULT", message: "The converter returned an empty file." }, 502);
  }

  return new Response(result, {
    status: 200,
    headers: {
      "Content-Type": OUT_MIME[route] ?? "application/octet-stream",
      "Cache-Control": "no-store",
    },
  });
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const config = {
  path: "/api/reverse-convert",
};
