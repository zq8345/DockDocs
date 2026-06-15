/**
 * IndexNow bulk URL submission for dockdocs.app
 *
 * Usage:
 *   node scripts/submit-indexnow.mjs           — submit all sitemap URLs
 *   node scripts/submit-indexnow.mjs --dry-run — print URLs without submitting
 *
 * Pre-requisites:
 *   - public/8f3c4a7b9e2d1f6a5c0e3b7dda92c14f.txt must be deployed (done)
 *   - Joe: verify the site in Bing Webmaster Tools at https://www.bing.com/webmasters
 *     (Settings → IndexNow → confirm the key URL above)
 *
 * What it does:
 *   1. Fetches the live sitemap from dockdocs.app
 *   2. Submits URLs to api.indexnow.org (which fans out to Bing, Yandex, etc.)
 *   3. Logs HTTP status per batch — 200 = accepted, 202 = queued, 4xx = error
 */

const KEY = '8f3c4a7b9e2d1f6a5c0e3b7dda92c14f';
const HOST = 'dockdocs.app';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const SITEMAP_URL = `https://${HOST}/sitemap.xml`;
const BATCH_SIZE = 500;

const isDryRun = process.argv.includes('--dry-run');

async function fetchSitemapUrls() {
  const res = await fetch(SITEMAP_URL);
  if (!res.ok) throw new Error(`Sitemap fetch failed: HTTP ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

async function submitBatch(urls, batchIndex) {
  const body = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  };

  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  });

  const label = `Batch ${batchIndex} (${urls.length} URLs)`;
  if (res.status === 200) {
    console.log(`  ✓ ${label} → HTTP 200 accepted`);
  } else if (res.status === 202) {
    console.log(`  ⏳ ${label} → HTTP 202 queued (will be indexed soon)`);
  } else {
    const text = await res.text().catch(() => '');
    console.warn(`  ✗ ${label} → HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
}

async function main() {
  console.log(`IndexNow submission for ${HOST}`);
  console.log(`Key location: ${KEY_LOCATION}\n`);

  console.log(`Fetching sitemap from ${SITEMAP_URL}...`);
  const urls = await fetchSitemapUrls();
  console.log(`Found ${urls.length} URLs\n`);

  if (isDryRun) {
    console.log('--dry-run: URLs to submit:');
    urls.forEach((u) => console.log(`  ${u}`));
    console.log(`\nTotal: ${urls.length} URLs (not submitted)`);
    return;
  }

  const batches = [];
  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    batches.push(urls.slice(i, i + BATCH_SIZE));
  }

  console.log(`Submitting ${urls.length} URLs in ${batches.length} batch(es)...`);
  for (let i = 0; i < batches.length; i++) {
    await submitBatch(batches[i], i + 1);
  }

  console.log('\n✅ Submission complete.');
  console.log('\n⚠️  Bing Webmaster Tools action required (Joe):');
  console.log('   1. Go to https://www.bing.com/webmasters');
  console.log('   2. Add site: https://dockdocs.app');
  console.log('   3. Verify via DNS TXT record or meta tag');
  console.log('   4. Settings → IndexNow — confirm key URL:');
  console.log(`      ${KEY_LOCATION}`);
}

main().catch((err) => {
  console.error('IndexNow submission failed:', err.message);
  process.exit(1);
});
