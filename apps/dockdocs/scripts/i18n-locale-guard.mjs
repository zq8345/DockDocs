// i18n locale-coverage guard. Catches code that silently ships English to a
// locale whose key is present in a ternary chain but whose arm is missing.
//
// Three regression patterns:
//   (A) ja-collapse        — `locale === "ja" ? "en"` clamps ja to English
//   (B) union-missing-ja   — `"en" | "zh" | "es" | "pt" | "fr"` type missing ja
//   (C) missing-arm        — a ternary that branches on >=2 content locales
//                            (e.g. zh + fr + ja) but DROPS one or more of
//                            {zh,es,pt,fr,ja} and falls back to an English
//                            string literal. This is the SaasInfoPage-class bug:
//                            `zh ? : fr ? : ja ? : "English"` missing es/pt.
//
// A single-locale ternary (`zh ? "中" : "English"`) is intentional en/zh
// bilingual content (GEO/blog by design) and is NOT flagged — Check C only
// fires once >=2 content locales are handled, which signals multilingual intent.
//
// A genuinely-intentional gap must carry an inline `// i18n-guard-allow: <reason>`
// comment on the same line. Run as part of postbuild; scans dockdocs app + the
// shared tool-page template; skips tests and build output.

import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

const ROOT = process.cwd(); // apps/dockdocs
const SCAN_DIRS = [join(ROOT, "app"), join(ROOT, "components"), join(ROOT, "lib"), join(ROOT, "..", "..", "shared", "templates", "pdf-tool-page")];
const SKIP_DIR = /(^|\/)(node_modules|\.next|out|tests|__tests__)(\/|$)/;
const SKIP_FILE = /\.(test|spec)\.(ts|tsx)$|\.d\.ts$/;

// Content locales that should all be covered once a chain goes multilingual.
// zh-Hant is omitted: it is derived from zh via OpenCC (deepHant/toHant), so
// code branches on zh (often `locale === "zh" || hant`), not a separate arm.
const CONTENT_LOCALES = ["zh", "es", "pt", "fr", "ja"];

// All known missing-arm leaks are fixed (BatchFixScans/BatchTranslate got
// pt/fr/ja arms — commit alongside this flip). Missing-arm now HARD-FAILS the
// build like patterns A/B, so any NEW silent-English-fallback ternary is caught
// at build time. Set back to false only if a temporary known-gap batch needs to
// land before its arms (and track the cleanup).
const MISSING_ARM_FAILS = true;

const REGEX_PATTERNS = [
  { id: "ja-collapse", re: /===\s*"ja"\s*\?\s*"en"/, msg: 'collapses ja → "en" (ship English to ja users)' },
  // 5-locale union with no ja immediately after.
  { id: "union-missing-ja", re: /"en"\s*\|\s*"zh"\s*\|\s*"es"\s*\|\s*"pt"\s*\|\s*"fr"(?!\s*\|\s*"ja")/, msg: 'locale union missing "ja"' },
];
const ALLOW = /i18n-guard-allow/;

// Which content locales does this line branch on?
// Matches both `locale === "es"` and bare-boolean `es ?` (after `const es = locale === "es"`).
function localesOnLine(line) {
  return CONTENT_LOCALES.filter(
    (loc) => new RegExp(`locale\\s*===\\s*"${loc}"|\\b${loc}\\s*\\?`).test(line),
  );
}

// Does the line contain an English string literal (the silent fallback)?
// Conservative: needs >=2 ascii words AND a common English function/UI word,
// so chains that fall back to a variable/record lookup aren't flagged.
const EN_WORD = /\b(the|and|or|to|of|in|for|with|your|you|is|are|be|this|that|from|on|it|we|our|can|will|not|no|page|pages|plan|tool|tools|guide|guides|home|read|browse|select|current|manage|billing|coming|download|file|image|images)\b/i;
function hasEnglishLiteral(line) {
  const strs = line.match(/["'`][^"'`]{4,}["'`]/g) || [];
  return strs.some((s) => {
    const inner = s.slice(1, -1);
    const words = inner.match(/[A-Za-z]+/g) || [];
    return words.length >= 2 && EN_WORD.test(inner);
  });
}

function missingArm(line) {
  const found = localesOnLine(line);
  if (found.length < 2) return null; // single-locale = intentional en/zh bilingual
  const missing = CONTENT_LOCALES.filter((l) => !found.includes(l));
  if (missing.length === 0) return null; // fully covered
  if (!hasEnglishLiteral(line)) return null; // falls back to a var/record, not English
  return { found, missing };
}

async function* walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (SKIP_DIR.test(p)) continue;
    if (e.isDirectory()) yield* walk(p);
    else if (/\.(ts|tsx)$/.test(e.name) && !SKIP_FILE.test(e.name)) yield p;
  }
}

const violations = [];
const warnings = [];
let allowed = 0;
for (const dir of SCAN_DIRS) {
  for await (const file of walk(dir)) {
    const text = await readFile(file, "utf8");
    const lines = text.split("\n");
    lines.forEach((line, i) => {
      // Regex patterns (A/B)
      for (const pat of REGEX_PATTERNS) {
        if (!pat.re.test(line)) continue;
        if (ALLOW.test(line)) {
          allowed++;
          continue;
        }
        violations.push({ file: relative(ROOT, file), line: i + 1, id: pat.id, msg: pat.msg, text: line.trim().slice(0, 120) });
      }
      // Missing-arm pattern (C)
      const arm = missingArm(line);
      if (arm) {
        if (ALLOW.test(line)) {
          allowed++;
        } else {
          (MISSING_ARM_FAILS ? violations : warnings).push({
            file: relative(ROOT, file),
            line: i + 1,
            id: "missing-arm",
            msg: `ternary covers ${arm.found.join("/")} but drops ${arm.missing.join("/")} → English fallback`,
            text: line.trim().slice(0, 120),
          });
        }
      }
    });
  }
}

if (warnings.length) {
  console.warn(`[i18n-locale-guard] ${warnings.length} missing-arm WARNING(s) — non-blocking (feature-owned files pending pt/fr/ja arms):`);
  for (const w of warnings) console.warn(`  ${w.file}:${w.line}  [${w.id}] ${w.msg}\n      ${w.text}`);
}
if (violations.length === 0) {
  console.log(`[i18n-locale-guard] OK — no ja-collapse clamps or ja-less unions (${allowed} allow-listed, ${warnings.length} non-blocking missing-arm warning${warnings.length === 1 ? "" : "s"}).`);
  process.exit(0);
}

console.error(`[i18n-locale-guard] FAIL — ${violations.length} locale-coverage issue(s) that would ship English to a locale:`);
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}  [${v.id}] ${v.msg}\n      ${v.text}`);
}
console.error(
  `\nFix: add the missing locale arm(s) with real native copy (don't ship machine translation).\n` +
    `If the surface genuinely has no content for those locales yet, append an inline  // i18n-guard-allow: <reason>  comment to that line.`,
);
process.exit(1);
