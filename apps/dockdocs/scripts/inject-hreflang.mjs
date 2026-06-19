// Post-build fixup: inject rel="alternate" hreflang link tags into the static
// export so search engines can connect the per-locale variants of each page.
//
// The app-router static export emits no hreflang at all. We can't easily know
// inside generateMetadata which locales actually have a given route (blog/guides
// exist only for en/zh, tools for all), so we derive it from the emitted files:
// for each en (root) route we look up which secondary-locale variants actually
// exist on disk and link exactly those — no dangling alternates.
//
// ja is deliberately noindex (machine-translated, awaiting native review), so it
// is excluded from every cluster: a noindex page should not be part of an
// hreflang set. ja pages therefore receive no hreflang.

import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const OUT = join(process.cwd(), "out");
const BASE = "https://dockdocs.app";
// Indexable secondary locales only (ja omitted on purpose — noindex).
const SECONDARY = ["zh", "es", "pt", "fr"];
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

// en routes = the canonical root tree (locale-prefixed dirs excluded).
const enRoutes = await collectRoutes(OUT, { skipTopLevelLocaleDirs: true });
const secondaryRoutes = {};
for (const loc of SECONDARY) secondaryRoutes[loc] = await collectRoutes(join(OUT, loc));

let injected = 0;
for (const route of enRoutes) {
  const cluster = ["en", ...SECONDARY.filter((loc) => secondaryRoutes[loc].has(route))];
  if (cluster.length < 2) continue; // nothing to link

  const links =
    cluster.map((loc) => `<link rel="alternate" hreflang="${loc}" href="${urlFor(loc, route)}"/>`).join("") +
    `<link rel="alternate" hreflang="x-default" href="${urlFor("en", route)}"/>`;

  // Inject into every variant that exists, incl. the /en mirror of the root page.
  const targets = [fileFor("en", route), fileFor("en", route ? `en/${route}` : "en")];
  for (const loc of SECONDARY) if (secondaryRoutes[loc].has(route)) targets.push(fileFor(loc, route));

  for (const f of targets) {
    let html;
    try {
      html = await readFile(f, "utf8");
    } catch {
      continue;
    }
    if (html.includes('hreflang="')) continue;
    const next = html.replace("</head>", `${links}</head>`);
    if (next !== html) {
      await writeFile(f, next);
      injected++;
    }
  }
}

console.log(`[inject-hreflang] added hreflang clusters to ${injected} files`);
