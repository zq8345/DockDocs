/* DockDocs service worker — offline support for the client-side tools.
 *
 * Conservative + honest, by design:
 *  - NEVER caches /api/*, /.netlify/* or analytics → AI & file-conversion tools always hit
 *    the network (they upload; offline they fail honestly, never from a poisoned cache).
 *  - Immutable static assets (/_next/static, fonts, wasm, images, css/js) → cache-first,
 *    so a client-side tool page + its pdf-lib / pdfjs / tesseract wasm work fully offline.
 *  - HTML navigations → network-first with cache fallback (a fresh deploy always wins;
 *    offline serves the last-seen page, or the /offline/ fallback).
 *  - Versioned caches; every non-current cache is purged on activate, so a deploy can
 *    never get "stuck" serving stale chunks (the classic service-worker footgun).
 *
 * Bump VERSION on any change to this file's caching behaviour.
 */
const VERSION = "v1";
const STATIC_CACHE = `dockdocs-static-${VERSION}`;
const PAGES_CACHE = `dockdocs-pages-${VERSION}`;
const OFFLINE_URL = "/offline/";

// Dev mode: skip all caching so HMR chunk updates are always fresh.
// Production cache-first behavior is untouched.
const IS_DEV = self.location.hostname === "localhost" || self.location.hostname === "127.0.0.1";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PAGES_CACHE)
      // Resilient: a missing/failed offline page must not abort the whole SW install
      // (we'd just lose the offline fallback, not all offline support).
      .then((cache) => cache.add(OFFLINE_URL).catch(() => {}))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith("dockdocs-") && !k.endsWith(`-${VERSION}`))
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Server-only: must always go to the network, never the cache.
function isNetworkOnly(url) {
  return (
    url.pathname === "/sw.js" ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/.netlify/") ||
    /(?:^|\.)analytics\.dockdocs\.app$|(?:^|\.)convert\.dockdocs\.app$|clarity\.ms$|googletagmanager\.com$|google-analytics\.com$/.test(
      url.hostname,
    )
  );
}

const STATIC_ASSET = /\.(?:js|mjs|css|woff2?|ttf|otf|wasm|png|jpe?g|svg|webp|gif|ico)$/;

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  let url;
  try {
    url = new URL(req.url);
  } catch {
    return;
  }
  if (url.origin !== self.location.origin) return; // cross-origin → browser default
  if (isNetworkOnly(url)) return; // API / functions / analytics → straight to network

  // Immutable static assets → cache-first (revalidate in the background on miss).
  // Dev: skip caching entirely so HMR chunk updates are always fetched fresh.
  if (url.pathname.startsWith("/_next/static/") || STATIC_ASSET.test(url.pathname)) {
    if (IS_DEV) return;
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(STATIC_CACHE).then((c) => c.put(req, copy));
            }
            return res;
          }),
      ),
    );
    return;
  }

  // HTML navigations → network-first, fall back to cache, then the offline page.
  // Dev: always network so page changes are immediate.
  if (req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html")) {
    if (IS_DEV) return;
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(PAGES_CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match(OFFLINE_URL))),
    );
    return;
  }

  // Everything else → cache, then network.
  event.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});
