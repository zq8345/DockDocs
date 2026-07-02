/**
 * Issues a short-lived HMAC upload token for browser direct-upload to the
 * self-hosted convert box (/upload/convert on convert.dockdocs.app).
 *
 * Token format (must match reverse/app.py _verify_upload_token exactly):
 *   ts:nonce:hex(HMAC_SHA256(GOTENBERG_SECRET, "ts:nonce:route"))
 * where ts = Unix seconds (string), nonce = 32-char hex, mac = 64-char hex.
 *
 * Only signs — never touches the file. Rate-limited per IP to keep tokens
 * scarce (required companion to the Caddy pre-auth body cap on the box).
 */
import type { Context } from "@netlify/functions";
import crypto from "node:crypto";

declare const Netlify: {
  env: { get(name: string): string | undefined };
};

const ALLOWED_ORIGIN = /^https:\/\/([a-z0-9-]+\.)*(dockdocs\.app|netlify\.app)$/i;

const UPLOAD_ROUTES = new Set([
  "word-to-pdf",
  "ppt-to-pdf",
  "excel-to-pdf",
  "html-to-pdf",
  "pdf-to-pdfa",
]);

const TOKEN_TTL_SECS = 300; // 5 minutes — must match app.py TOKEN_WINDOW_SECS

// ---------------------------------------------------------------------------
// Rate limiter: max 20 token issuances per IP per 60 s.
// Mirror of gotenberg-convert.ts isRateLimited (per warm Netlify instance).
// Keeps tokens scarce so the Caddy body-cap + token-rate together bound DoS.
// ---------------------------------------------------------------------------
const rlHits = new Map<string, number[]>();

function isRateLimited(req: Request): boolean {
  const ip =
    req.headers.get("x-nf-client-connection-ip") ||
    (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
    "anon";
  const now = Date.now();
  const windowMs = 60_000;
  const limit = 20;
  const arr = (rlHits.get(ip) || []).filter((t) => now - t < windowMs);
  arr.push(now);
  rlHits.set(ip, arr);
  // Evict stale IPs when map grows large
  if (rlHits.size > 5000) {
    for (const [k, v] of rlHits)
      if (!v.length || now - v[v.length - 1] > windowMs) rlHits.delete(k);
  }
  return arr.length > limit;
}

// ---------------------------------------------------------------------------
export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") {
    return json({ ok: false, code: "METHOD_NOT_ALLOWED", message: "Use POST." }, 405);
  }

  const origin = req.headers.get("origin");
  if (
    origin &&
    !ALLOWED_ORIGIN.test(origin) &&
    !/^http:\/\/localhost(:\d+)?$/i.test(origin)
  ) {
    return json(
      { ok: false, code: "FORBIDDEN_ORIGIN", message: "Requests are only allowed from DockDocs." },
      403,
    );
  }

  const secret = Netlify.env.get("GOTENBERG_SECRET")?.trim();
  const uploadBase = Netlify.env.get("GOTENBERG_URL")?.trim().replace(/\/+$/, "");
  if (!secret || !uploadBase) {
    return json(
      { ok: false, code: "NOT_CONFIGURED", message: "Upload token signing is not configured." },
      503,
    );
  }

  if (isRateLimited(req)) {
    return json(
      { ok: false, code: "RATE_LIMITED", message: "Too many token requests — please wait a minute and try again." },
      429,
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json(
      { ok: false, code: "INVALID_BODY", message: "Expected JSON body: { route: string }." },
      400,
    );
  }

  const route =
    typeof body === "object" && body !== null && "route" in body
      ? String((body as { route: unknown }).route).trim()
      : "";

  if (!UPLOAD_ROUTES.has(route)) {
    return json(
      {
        ok: false,
        code: "INVALID_ROUTE",
        message: `Unsupported route. Must be one of: ${[...UPLOAD_ROUTES].sort().join(", ")}.`,
      },
      400,
    );
  }

  // Build token — must match app.py _verify_upload_token byte-for-byte:
  //   msg  = "{ts}:{nonce}:{route}"   (UTF-8, same as Python f-string .encode())
  //   mac  = HMAC-SHA256(secret, msg).hexdigest()
  //   token = "{ts}:{nonce}:{mac}"
  const ts = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(16).toString("hex"); // 32-char hex, no colons
  const msg = `${ts}:${nonce}:${route}`;
  const mac = crypto.createHmac("sha256", secret).update(msg).digest("hex");
  const token = `${ts}:${nonce}:${mac}`;

  return json({
    ok: true,
    token,
    uploadUrl: `${uploadBase}/upload/convert`,
    expiresAt: Number(ts) + TOKEN_TTL_SECS,
  });
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const config = {
  path: "/api/gotenberg-upload-token",
};
