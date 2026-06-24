// i18n parity guard — runs after `next build` (as the `postbuild` script).
//
// Why this exists: features used to be built as English root pages
// (app/<slug>/page.tsx) and the localized /zh/<slug> route had to be wired
// separately. Forget that step and the feature 404s in another language — and
// nothing catches it. This guard makes that impossible to ship silently:
//
//   Check A — every registered route (routeSlugs) is generated under EVERY
//             locale (out/<locale>/<slug>/index.html).
//   Check B — every English root page in out/ is registered in routeSlugs
//             (otherwise it has no localized versions and will 404 elsewhere).
//
// Any failure exits non-zero, which fails `npm run build` locally AND on
// Netlify — so a language can never silently lose a feature.

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const APP = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(APP, "out");
const I18N = join(APP, "lib", "i18n.ts");

// Root pages that are intentionally English-only / not user-facing in every
// language. Add a slug here ONLY when it should deliberately NOT exist in other
// languages — anything else is a parity bug the guard should catch.
const EXCEPTIONS = new Set([
  "internal", // internal dashboard, behind Basic Auth — not a public feature
  "404", // Next.js error page, not a feature
  "safe-to-upload-pdf", // standalone English-first GEO content page (Q&A) — no localized variants yet by design
  "redact-pdf-without-uploading", // standalone English-first GEO content page (how-to) — no localized variants yet by design
  "compress-pdf-without-uploading", // standalone English-first GEO content page (how-to) — no localized variants yet by design
  "are-free-pdf-tools-safe", // standalone English-first GEO content page (Q&A) — no localized variants yet by design
  "ai-read-pdf-without-storing", // standalone English-first GEO content page (Q&A) — no localized variants yet by design
  "dockdocs-vs-smallpdf-vs-ilovepdf", // standalone English-first GEO comparison page — no localized variants yet by design
  "url-to-pdf", // retired CloudConvert tool → standalone English-first GEO how-to (browser Print → Save as PDF); old localized tool routes 301'd to it
  "merge-pdf-without-uploading", // standalone English-first GEO content page (how-to) — no localized variants yet by design
  "split-pdf-without-uploading", // standalone English-first GEO content page (how-to) — no localized variants yet by design
  "password-protect-pdf-without-uploading", // standalone English-first GEO content page (how-to) — no localized variants yet by design
  "dockdocs-vs-smallpdf", // standalone English-first GEO head-to-head comparison page — no localized variants yet by design
  "dockdocs-vs-ilovepdf", // standalone English-first GEO head-to-head comparison page — no localized variants yet by design
]);

function die(lines) {
  console.error("\n" + (Array.isArray(lines) ? lines.join("\n") : lines) + "\n");
  process.exit(1);
}

if (!existsSync(OUT)) {
  die(`[i18n-guard] No export output at ${OUT}. This must run after \`next build\`.`);
}

const src = readFileSync(I18N, "utf8");
function pickArray(name) {
  const m = src.match(new RegExp(`export const ${name}\\s*=\\s*\\[([\\s\\S]*?)\\]`));
  if (!m) die(`[i18n-guard] Could not parse "${name}" from lib/i18n.ts — update the guard.`);
  return [...m[1].matchAll(/"([^"]*)"/g)].map((x) => x[1]);
}

const locales = pickArray("locales");
const allLocales = pickArray("allLocales");
// Every locale that gets its own URL prefix (en/zh/zh-Hant/es/pt/fr/ja).
// Check A iterates THIS, not `locales` (which is only en+zh) — otherwise the
// es/pt/fr/ja/zh-Hant routes are never asserted to exist and a feature can
// silently 404 in those languages.
const routeLocales = pickArray("routeLocales");
const routeSlugs = pickArray("routeSlugs");
const routeSet = new Set(routeSlugs);
const localeSet = new Set(allLocales);

const hasPage = (rel) => existsSync(join(OUT, rel, "index.html"));

// ── Check A: every routeSlug exists under every ROUTE locale (all 7) ──
const missing = [];
for (const locale of routeLocales) {
  for (const slug of routeSlugs) {
    const rel = slug ? `${locale}/${slug}` : locale;
    if (!hasPage(rel)) missing.push(`${locale} is missing "${slug || "(home)"}"  →  expected out/${rel}/index.html`);
  }
}

// ── Check B: every English root page is registered in routeSlugs ──
const unregistered = [];
for (const entry of readdirSync(OUT)) {
  if (entry.startsWith("_") || entry.startsWith(".")) continue; // _next, dotfiles
  if (localeSet.has(entry)) continue; // locale dirs handled by Check A
  if (EXCEPTIONS.has(entry)) continue;
  const dir = join(OUT, entry);
  if (!statSync(dir).isDirectory()) continue;
  if (!existsSync(join(dir, "index.html"))) continue; // not a page route
  if (!routeSet.has(entry)) {
    unregistered.push(`/${entry}  →  add "${entry}" to routeSlugs (lib/i18n.ts) + handle it in the locale catch-all, or add it to EXCEPTIONS if it is deliberately English-only`);
  }
}

// ── Check C: tool-page BODY copy is actually localized (not English fallback) ──
// A locale's tool entry can register a title/description but still spread
// ...enTools[slug], leaving benefits/features/steps in English. Route checks A/B
// can't see that — the page exists, it's just half-English. This check asserts
// the locales we claim are fully localized override the user-facing body arrays.
//
// Scope = every locale whose tool bodies are fully localized (verified 100%).
// en is the source locale. zh/es/pt/fr/ja all override the body arrays for
// every tool; ja stays noindex, but that's about indexing, not completeness.
const BODY_LOCALES = ["zh", "es", "pt", "fr", "ja", "de"];
const BODY_FIELDS = ["benefits", "features", "steps"];
const incompleteBody = [];

const toolsSrc = readFileSync(join(APP, "lib", "localized-tools.ts"), "utf8");
const toolSlugs = pickArray("toolSlugs");

// Extract the {...} object literal that starts at the first "{" after `from`.
function objectAfter(text, from) {
  const open = text.indexOf("{", from);
  if (open < 0) return "";
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (text[i] === "{") depth++;
    else if (text[i] === "}" && --depth === 0) return text.slice(open, i + 1);
  }
  return "";
}

for (const locale of BODY_LOCALES) {
  // type may be ToolCopy (en) or LocalizedToolCopy (locale tables, P0.2 — keywords/faqTitle omitted, no enTools spread)
  const recStart = toolsSrc.search(new RegExp(`const ${locale}Tools:\\s*Record<ToolSlug, \\w+>\\s*=`));
  if (recStart < 0) {
    incompleteBody.push(`${locale}: could not find ${locale}Tools in lib/localized-tools.ts — update the guard.`);
    continue;
  }
  const record = objectAfter(toolsSrc, recStart);
  for (const slug of toolSlugs) {
    const at = record.indexOf(`"${slug}":`);
    if (at < 0) {
      incompleteBody.push(`${locale} "${slug}" — entry missing from ${locale}Tools`);
      continue;
    }
    const entry = objectAfter(record, at);
    const missingFields = BODY_FIELDS.filter((f) => !new RegExp(`\\b${f}:\\s*\\[`).test(entry));
    if (missingFields.length) {
      incompleteBody.push(`${locale} "${slug}" — body falls back to English (no localized ${missingFields.join(", ")})`);
    }
  }
}

// ── Check D: every tool has a localized FAQ (no English-fallback FAQ) ──
// getLocalizedToolConfig substitutes a localized FAQ from `${locale}Faq` maps;
// any slug absent from a map falls back to the English enTools FAQ (and the
// FAQPage JSON-LD goes out in English). Assert each locale's map covers all 31.
const FAQ_LOCALES = ["zh", "es", "pt", "fr", "ja", "de"];
for (const locale of FAQ_LOCALES) {
  const mapStart = toolsSrc.search(new RegExp(`const ${locale}Faq\\b[^=]*=\\s*\\{`));
  if (mapStart < 0) {
    incompleteBody.push(`${locale}: could not find ${locale}Faq in lib/localized-tools.ts — update the guard.`);
    continue;
  }
  const map = objectAfter(toolsSrc, toolsSrc.indexOf("= {", mapStart));
  for (const slug of toolSlugs) {
    if (!map.includes(`"${slug}":`)) {
      incompleteBody.push(`${locale} "${slug}" — FAQ falls back to English (missing from ${locale}Faq)`);
    }
  }
}

// ── Check E: marketing-page de parity (de must cover every fr surface) ──
// The marketing pages keep their copy as per-locale literals (a `fr:` block /
// `fr:` key for every French string). When a new locale (de) is added, it is
// easy to translate Home but forget About/Pricing/contact — the page then
// silently renders the English (or French) fallback for German visitors, and
// Checks A–D (which only see tool pages + route presence) can't catch it.
//
// This check is deliberately simple and robust: for each marketing surface,
// count the `fr:` occurrences and the `de:` occurrences in its source and FAIL
// if de < fr. (The blog frame uses `locale === "de"` ternaries rather than
// `de:` keys, so it is matched on that form instead.) An equal-or-greater de
// count means every French surface has a German counterpart.
const MARKETING = [
  { label: "components/Home.tsx", file: join(APP, "components", "Home.tsx"), token: "key" },
  { label: "components/AboutPage.tsx", file: join(APP, "components", "AboutPage.tsx"), token: "key" },
  { label: "components/PricingPlans.tsx", file: join(APP, "components", "PricingPlans.tsx"), token: "key" },
  // contact copy lives in lib/i18n.ts `infoPages` (there is no ContactPage.tsx);
  // scope the count to the infoPages object so the en/zh/es/pt/fr/ja nav+footer
  // dicts above it (which legitimately predate de and fall back) don't skew it.
  { label: "lib/i18n.ts infoPages (contact)", file: I18N, token: "key", from: "export const infoPages" },
  // blog frame: BlogPages.tsx localizes via `locale === "de"` ternaries, not
  // `de:` keys — assert at least one de branch exists and it's not behind fr.
  { label: "components/BlogPages.tsx (blog frame)", file: join(APP, "components", "BlogPages.tsx"), token: "ternary" },
];

const marketingGaps = [];
for (const { label, file, token, from } of MARKETING) {
  if (!existsSync(file)) {
    marketingGaps.push(`${label} — file not found (update the guard's MARKETING list)`);
    continue;
  }
  let text = readFileSync(file, "utf8");
  if (from) {
    const at = text.indexOf(from);
    if (at < 0) {
      marketingGaps.push(`${label} — could not find "${from}" (update the guard)`);
      continue;
    }
    text = text.slice(at);
  }
  const [frRe, deRe] =
    token === "ternary"
      ? [/locale === "fr"/g, /locale === "de"/g]
      : [/\bfr:/g, /\bde:/g];
  const frCount = (text.match(frRe) || []).length;
  const deCount = (text.match(deRe) || []).length;
  if (deCount < frCount) {
    marketingGaps.push(
      `${label} — ${deCount} de vs ${frCount} fr (${frCount - deCount} German surface(s) missing → falls back to English/French). Add the de copy for every fr entry.`,
    );
  }
}

if (
  missing.length === 0 &&
  unregistered.length === 0 &&
  incompleteBody.length === 0 &&
  marketingGaps.length === 0
) {
  console.log(`[i18n-guard] OK — ${routeSlugs.length} routes present in all ${routeLocales.length} route locales (${routeLocales.join(", ")}); tool bodies + FAQ fully localized in ${BODY_LOCALES.join(", ")}; marketing pages have de parity with fr.`);
  process.exit(0);
}

const out = ["[i18n-guard] FAILED — language feature parity is broken:"];
if (unregistered.length) {
  out.push("", "  English root pages NOT available in other languages (will 404):");
  for (const u of unregistered) out.push(`    • ${u}`);
}
if (missing.length) {
  out.push("", "  Registered routes missing under some locales:");
  for (const m of missing) out.push(`    • ${m}`);
}
if (incompleteBody.length) {
  out.push("", "  Tool pages with un-localized body/FAQ copy (English fallback):");
  for (const b of incompleteBody) out.push(`    • ${b}`);
}
if (marketingGaps.length) {
  out.push("", "  Marketing pages missing German (de) copy where French (fr) exists:");
  for (const g of marketingGaps) out.push(`    • ${g}`);
}
out.push("", "  Build blocked: every feature must exist — and be fully localized — in every language.");
die(out);
