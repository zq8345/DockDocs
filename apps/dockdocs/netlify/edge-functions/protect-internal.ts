// protect-internal.ts — Netlify Edge Function: server-side Basic Auth
// Protects ONLY the internal dashboard pages + the JSON data they read.
// This is real auth (intercepted at the CDN edge), enforced before the
// page/file is served.
//
// IMPORTANT: This function must NEVER block public pages (home, tools,
// pricing, about, etc). It does an explicit internal-path check below and
// calls context.next() (pass through) for everything else, regardless of
// how Netlify routes the request in.
//
// Enable by setting in Netlify → Settings → Environment variables:
//   MC_USER = your username
//   MC_PASS = your strong password
//
// This file is bundled by Netlify with the Deno runtime (not part of Next).

declare const Deno: { env: { get(key: string): string | undefined } };
type EdgeContext = { next: () => Promise<Response> };

// Paths that actually require auth. Everything else passes through.
function isProtectedPath(pathname: string): boolean {
  // strip optional locale prefix: /en/... or /zh/...
  const p = pathname.replace(/^\/(en|zh)(?=\/|$)/, "");
  return (
    p === "/internal" ||
    p.startsWith("/internal/") ||
    p === "/mission-control-data.json"
  );
}

export default async (request: Request, context: EdgeContext): Promise<Response> => {
  const pathname = new URL(request.url).pathname;

  // SAFETY GATE: if this isn't an internal path, never challenge — pass through.
  // This guarantees public pages are never blocked, even if Netlify's path
  // matcher routes a broader set of requests into this function.
  if (!isProtectedPath(pathname)) {
    return context.next();
  }

  const user = Deno.env.get("MC_USER");
  const pass = Deno.env.get("MC_PASS");

  // If credentials aren't configured, do NOT lock the whole route — just pass
  // through. (The internal dashboard simply won't be password-protected until
  // MC_USER/MC_PASS are set. Better than risking a site-wide lockout.)
  if (!user || !pass) {
    return context.next();
  }

  const expected = "Basic " + btoa(`${user}:${pass}`);
  const got = request.headers.get("authorization") || "";

  if (got !== expected) {
    return new Response("Authentication required.", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="DockDocs Internal", charset="UTF-8"',
        "Cache-Control": "no-store",
      },
    });
  }

  return context.next();
};

// Netlify only invokes this function for these paths. The in-function
// isProtectedPath() check is a second safety layer on top of this.
export const config = {
  path: ["/internal/*", "/en/internal/*", "/zh/internal/*", "/mission-control-data.json"],
};
