/* DockDocs service worker — offline support for the client-side tools.
 *
 * Conservative + honest, by design:
 *  - NEVER caches /api/*, /.netlify/* or analytics → AI & file-conversion tools always hit
 *    the network (they upload; offline they fail honestly, never from a poisoned cache).
 *  - Hashed Next bundle (/_next/static/) → cache-first (immutable; new hash = new file).
 *  - Same-name mutable assets (root icons, pdf.worker, *.wasm) → stale-while-revalidate
 *    so they're always fresh after a deploy, not frozen at first-load.
 *  - HTML navigations → network-first with cache fallback.
 *  - VERSION is stamped at build time by scripts/inject-sw-version.mjs
 *    (__SW_VERSION__ → git short hash or epoch); changes every deploy → activate
 *    always clears stale caches. Never bump manually.
 */
const VERSION = "__SW_VERSION__";
const STATIC_CACHE = `dockdocs-static-${VERSION}`;
const PAGES_CACHE = `dockdocs-pages-${VERSION}`;
const OFFLINE_URL = "/offline/";

const IS_DEV = self.location.hostname === "localhost" || self.location.hostname === "127.0.0.1";

self.addEventListener("install", (event) => {
  // Do NOT call self.skipWaiting() here. Doing so would immediately activate the
  // new SW and trigger clients.claim(), reloading any open tab — including one with
  // an in-progress file conversion. The SKIP_WAITING message handler below lets the
  // page defer the handoff until the user navigates away naturally.
  event.waitUntil(
    caches
      .open(PAGES_CACHE)
      // Resilient: a missing/failed offline page must not abort the whole SW install.
      .then((cache) => cache.add(OFFLINE_URL).catch(() => {})),
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

// Let the page prompt a waiting SW to take over immediately (keeps open tabs current).
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
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

// Content-hashed Next bundle is truly immutable → safe for cache-first forever.
const IMMUTABLE_HASHED = /^\/_next\/static\//;
// Root icons, /pdf.worker.min.mjs, /ocr/*.wasm keep the same filename across deploys
// but their content can change → stale-while-revalidate, never cache-first-forever.
const REVALIDATE_ASSET = /\.(?:js|mjs|css|woff2?|ttf|otf|wasm|png|jpe?g|svg|webp|gif|ico)$/;

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  let url;
  try {
    url = new URL(req.url);
  } catch {
    return;
  }
  if (url.origin !== self.location.origin) return;
  if (isNetworkOnly(url)) return;

  // Hashed Next bundle → cache-first (immutable; new content = new filename + hash).
  if (IMMUTABLE_HASHED.test(url.pathname)) {
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

  // Same-name-but-mutable assets → stale-while-revalidate: serve cache for perf/offline,
  // always fetch fresh in background so the next load gets the post-deploy version.
  if (REVALIDATE_ASSET.test(url.pathname)) {
    if (IS_DEV) return;
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) =>
        cache.match(req).then((hit) => {
          const network = fetch(req)
            .then((res) => {
              if (res.ok) cache.put(req, res.clone());
              return res;
            })
            .catch(() => hit);
          return hit || network;
        }),
      ),
    );
    return;
  }

  // HTML navigations → network-first, fall back to cache, then the offline page.
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

  event.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});
