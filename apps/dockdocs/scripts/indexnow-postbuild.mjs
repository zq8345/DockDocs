/**
 * Post-build IndexNow ping — runs in the npm `postbuild` chain so every
 * production deploy auto-notifies Bing/Yandex (instead of the old manual run).
 *
 * GUARDED to fire ONLY on a real Netlify PRODUCTION deploy (CONTEXT=production):
 * local `npm run build`, `next dev`, deploy-previews and branch-deploys all skip,
 * so routine local builds across the shared tree never spam IndexNow.
 *
 * NEVER fails the build: any missing file, network error, or non-2xx is logged
 * and swallowed (the process still exits 0). A search-engine ping is best-effort
 * and must not be able to break a deploy.
 *
 * Reads the freshly-built out/sitemap.xml (the URLs about to go live). For an
 * on-demand full resubmission use: node scripts/submit-indexnow.mjs
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const isNetlifyProd =
  process.env.NETLIFY === "true" && process.env.CONTEXT === "production";

if (!isNetlifyProd) {
  console.log("[indexnow] skipped — not a Netlify production deploy");
  process.exit(0);
}

const KEY = "8f3c4a7b9e2d1f6a5c0e3b7dda92c14f";
const HOST = "dockdocs.app";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = "https://api.indexnow.org/indexnow";
const BATCH_SIZE = 500;

async function run() {
  const xml = await readFile(join(process.cwd(), "out", "sitemap.xml"), "utf8");
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (urls.length === 0) {
    console.warn("[indexnow] out/sitemap.xml has no <loc> URLs — nothing to ping");
    return;
  }
  console.log(`[indexnow] notifying ${urls.length} URLs (Netlify production deploy)`);
  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const urlList = urls.slice(i, i + BATCH_SIZE);
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
    });
    console.log(`[indexnow]   batch ${i / BATCH_SIZE + 1} (${urlList.length} URLs) -> HTTP ${res.status}`);
  }
}

run().catch((err) => {
  // Best-effort only: never break a deploy because IndexNow was unreachable.
  console.warn(`[indexnow] skipped — ${err.message}`);
});
