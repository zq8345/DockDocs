// Post-build fixup: set <html lang="…"> per locale in the static export.
//
// Next.js app-router static export renders a single root layout, so every page
// ships with the hardcoded `<html lang="en">` from app/layout.tsx — including
// the localized /zh, /es, /pt, /fr, /ja trees. That's an a11y + SEO defect for
// the indexed secondary locales. We can't read the route locale inside the root
// <html> at render time under `output: export`, so we rewrite the emitted HTML
// here instead: cheap, deterministic, and crawler-visible.
//
// Locale is derived from the first path segment under out/. Root pages and
// out/en/** stay "en".

import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const OUT = join(process.cwd(), "out");
const PREFIX_LOCALES = new Set(["zh", "es", "pt", "fr", "ja", "zh-Hant"]);

async function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "_next") continue; // no HTML of ours in here
      out.push(...(await walk(p)));
    } else if (e.name.endsWith(".html")) {
      out.push(p);
    }
  }
  return out;
}

function localeForPath(absPath) {
  const rel = absPath.slice(OUT.length + 1); // strip "out/"
  const first = rel.split(/[/\\]/)[0];
  return PREFIX_LOCALES.has(first) ? first : "en";
}

const files = await walk(OUT);
let changed = 0;
const counts = {};
for (const f of files) {
  const locale = localeForPath(f);
  if (locale === "en") continue;
  const html = await readFile(f, "utf8");
  // Only the root <html> tag carries lang; replace its first occurrence.
  const next = html.replace(/(<html[^>]*\blang=")en(")/, `$1${locale}$2`);
  if (next !== html) {
    await writeFile(f, next);
    changed++;
    counts[locale] = (counts[locale] ?? 0) + 1;
  }
}

console.log(
  `[fix-html-lang] rewrote <html lang> on ${changed} files ` +
    `(${Object.entries(counts).map(([l, n]) => `${l}:${n}`).join(", ") || "none"})`,
);
