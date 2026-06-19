// Post-build fixup: inject rel="alternate" hreflang link tags into the static
// export so search engines can connect the per-locale variants of each page.
//
// The app-router static export emits no hreflang at all. We derive each route's
// real cluster from the emitted files: for every en (root) route we look up which
// locale variants actually exist on disk AND are indexable, and link exactly
// those — no dangling alternates, and never a link to a noindex page.
//
// ja is only partially native (tool pages + home/pricing/sitemap/info are
// Japanese; GEO guide hubs + blog still fall back to English, so those ja pages
// are noindex). Rather than hard-code that split, we read each ja page's robots
// meta: an indexable ja variant joins the cluster, a noindex one does not. The
// same robots check applies to every locale, so a noindex page in any locale is
// automatically kept out of the hreflang set.

import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const OUT = join(process.cwd(), "out");
const BASE = "https://dockdocs.app";
const SECONDARY = ["zh", "es", "pt", "fr", "ja"];
const LOCALE_DIRS = new Set(["en", "zh", "es", "pt", "fr", "ja"]);

async function collectRoutes(base, { skipTopLevelLocaleDirs = false } = {}) {
  const set = new Set();
  async function walk(dir, parts) {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (e.isDirectory()) {
        if (e.name === "_next") continue;
        if (skipTopLevelLocaleDirs && parts.length === 0 && LOCALE_DIRS.has(e.name)) continue;
        await walk(join(dir, e.name), [...parts, e.name]);
      } else if (e.name === "index.html") {
        set.add(parts.join("/")); // "" === home
      }
    }
  }
  await walk(base, []);
  return set;
}

const urlFor = (locale, route) => {
  const seg = route ? route + "/" : "";
  return locale === "en" ? `${BASE}/${seg}` : `${BASE}/${locale}/${seg}`;
};

const fileFor = (locale, route) =>
  locale === "en"
    ? join(OUT, route, "index.html")
    : join(OUT, locale, route, "index.html");

const isNoindex = (html) => /<meta name="robots"[^>]*content="[^"]*noindex/i.test(html);

async function readIfExists(file) {
  try {
    return await readFile(file, "utf8");
  } catch {
    return null;
  }
}

// en routes = the canonical root tree (locale-prefixed dirs excluded).
const enRoutes = await collectRoutes(OUT, { skipTopLevelLocaleDirs: true });
const secondaryRoutes = {};
for (const loc of SECONDARY) secondaryRoutes[loc] = await collectRoutes(join(OUT, loc));

let injected = 0;
for (const route of enRoutes) {
  // Eligible variants = file exists AND is indexable. en (root) is the canonical;
  // if it's missing or noindex, there is no cluster to build.
  const enHtml = await readIfExists(fileFor("en", route));
  if (!enHtml || isNoindex(enHtml)) continue;

  const variants = [{ loc: "en", file: fileFor("en", route), html: enHtml }];
  for (const loc of SECONDARY) {
    if (!secondaryRoutes[loc].has(route)) continue;
    const file = fileFor(loc, route);
    const html = await readIfExists(file);
    if (!html || isNoindex(html)) continue;
    variants.push({ loc, file, html });
  }
  if (variants.length < 2) continue; // nothing to link

  const links =
    variants.map((v) => `<link rel="alternate" hreflang="${v.loc}" href="${urlFor(v.loc, route)}"/>`).join("") +
    `<link rel="alternate" hreflang="x-default" href="${urlFor("en", route)}"/>`;

  // Inject into every eligible variant, plus the /en mirror of the root page.
  const targets = variants.map((v) => ({ file: v.file, html: v.html }));
  const mirrorFile = fileFor("en", route ? `en/${route}` : "en");
  const mirrorHtml = await readIfExists(mirrorFile);
  if (mirrorHtml) targets.push({ file: mirrorFile, html: mirrorHtml });

  for (const { file, html } of targets) {
    if (html.includes('hreflang="')) continue;
    const next = html.replace("</head>", `${links}</head>`);
    if (next !== html) {
      await writeFile(file, next);
      injected++;
    }
  }
}

console.log(`[inject-hreflang] added hreflang clusters to ${injected} files`);
