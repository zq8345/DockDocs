// Generates shared/templates/pdf-tool-page/_tool-dates.json — REAL per-tool-page
// git dates for schema datePublished/dateModified (GEO freshness, honest source).
//
// Honesty guardrails (per 总调度 2026-06-24):
//  - dateModified  = git LAST-commit date of that tool's source file (real content change)
//  - datePublished = git FIRST-commit date of that file (real first appearance)
//  - 🔴 NEVER emit fabricated or uniform dates. If real per-file history is
//    unavailable (Netlify SHALLOW clone → every file resolves to the same HEAD
//    date), DO NOT overwrite the committed file with uniform/HEAD dates — bail and
//    keep the real committed values. A slug that can't be mapped to a file is OMITTED.
//
// Run locally (full git history) then COMMIT the JSON, so the build reads a static,
// already-real file and never depends on the build environment's git depth.

import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = process.cwd(); // apps/dockdocs (npm run cwd)
const I18N = join(ROOT, "lib", "i18n.ts");
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "shared", "templates", "pdf-tool-page", "_tool-dates.json");

const sh = (cmd) => {
  try {
    return execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
};

const keepExisting = (reason) => {
  console.warn(`[tool-dates] ${reason} — keeping existing committed dates, NOT writing uniform/fake values.`);
  if (!existsSync(OUT)) writeFileSync(OUT, "{}\n");
  process.exit(0);
};

// --- Guardrail 1: shallow clone → uniform HEAD dates. Detect + try to fix; else bail.
if (sh("git rev-parse --is-shallow-repository") === "true") {
  console.warn("[tool-dates] shallow repo detected — attempting `git fetch --unshallow`...");
  sh("git fetch --unshallow --quiet");
  if (sh("git rev-parse --is-shallow-repository") === "true") {
    keepExisting("still shallow after unshallow (no real per-file history)");
  }
}

// --- Guardrail 2: derive slugs from the registry; OMIT any that don't map to a file.
const i18nSrc = existsSync(I18N) ? readFileSync(I18N, "utf8") : "";
const m = i18nSrc.match(/export const toolSlugs\s*=\s*\[([\s\S]*?)\]/);
const toolSlugs = m ? [...m[1].matchAll(/"([^"]*)"/g)].map((x) => x[1]) : [];
if (toolSlugs.length === 0) keepExisting("could not parse toolSlugs from lib/i18n.ts");

const dates = {};
for (const slug of toolSlugs) {
  const file = `app/${slug}/page.tsx`;
  if (!existsSync(join(ROOT, file))) continue; // OMIT: no exact source file
  const modified = sh(`git log -1 --format=%cI -- "${file}"`);
  const firstLines = sh(`git log --diff-filter=A --follow --format=%cI -- "${file}"`).split("\n").filter(Boolean);
  const published = firstLines.length ? firstLines[firstLines.length - 1] : "";
  const entry = {};
  if (published) entry.datePublished = published;
  if (modified) entry.dateModified = modified;
  if (Object.keys(entry).length) dates[slug] = entry;
}

// --- Guardrail 1 (belt-and-suspenders): if every dateModified is identical, that's
// the shallow-collapse signature → refuse to write uniform date-spam.
const mods = Object.values(dates).map((d) => d.dateModified).filter(Boolean);
if (mods.length > 1 && new Set(mods).size === 1) {
  keepExisting(`all ${mods.length} dateModified identical (= HEAD) → shallow not resolved`);
}

writeFileSync(OUT, JSON.stringify(dates, null, 2) + "\n");
console.log(`[tool-dates] wrote ${Object.keys(dates).length} tools · ${new Set(mods).size} distinct dateModified values.`);
