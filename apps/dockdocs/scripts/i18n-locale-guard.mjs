// i18n locale-coverage guard. Catches the two regression patterns that caused
// the ja English-leak incident (2026-06-19): user-facing code that either
//   (A) collapses a real locale to English  — `locale === "ja" ? "en" : locale`
//   (B) declares a 5-locale union missing ja — `"en" | "zh" | "es" | "pt" | "fr"`
// Both silently ship English to the dropped locale. New occurrences fail the
// build. A genuinely-intentional case (e.g. a surface that has no ja content
// yet) must carry an inline `// i18n-guard-allow: <reason>` comment on the same
// line — that documents the exception and keeps it visible.
//
// Run as part of postbuild. Scans the dockdocs app + the shared tool-page
// template (the surfaces that render localized UI); skips tests and build output.

import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

const ROOT = process.cwd(); // apps/dockdocs
const SCAN_DIRS = [join(ROOT, "app"), join(ROOT, "components"), join(ROOT, "lib"), join(ROOT, "..", "..", "shared", "templates", "pdf-tool-page")];
const SKIP_DIR = /(^|\/)(node_modules|\.next|out|tests|__tests__)(\/|$)/;
const SKIP_FILE = /\.(test|spec)\.(ts|tsx)$|\.d\.ts$/;

const PATTERNS = [
  { id: "ja-collapse", re: /===\s*"ja"\s*\?\s*"en"/, msg: 'collapses ja → "en" (ship English to ja users)' },
  // 5-locale union with no ja immediately after.
  { id: "union-missing-ja", re: /"en"\s*\|\s*"zh"\s*\|\s*"es"\s*\|\s*"pt"\s*\|\s*"fr"(?!\s*\|\s*"ja")/, msg: 'locale union missing "ja"' },
];
const ALLOW = /i18n-guard-allow/;

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
let allowed = 0;
for (const dir of SCAN_DIRS) {
  for await (const file of walk(dir)) {
    const text = await readFile(file, "utf8");
    const lines = text.split("\n");
    lines.forEach((line, i) => {
      for (const pat of PATTERNS) {
        if (!pat.re.test(line)) continue;
        if (ALLOW.test(line)) {
          allowed++;
          continue;
        }
        violations.push({ file: relative(ROOT, file), line: i + 1, id: pat.id, msg: pat.msg, text: line.trim().slice(0, 120) });
      }
    });
  }
}

if (violations.length === 0) {
  console.log(`[i18n-locale-guard] OK — no ja-collapse clamps or ja-less locale unions (${allowed} allow-listed exception${allowed === 1 ? "" : "s"}).`);
  process.exit(0);
}

console.error(`[i18n-locale-guard] FAIL — ${violations.length} locale-coverage issue(s) that would ship English to a locale:`);
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}  [${v.id}] ${v.msg}\n      ${v.text}`);
}
console.error(
  `\nFix: include the missing locale (add "ja" / pass the real locale through to a ja-capable component).\n` +
    `If the surface genuinely has no ja content yet, append an inline  // i18n-guard-allow: <reason>  comment to that line.`,
);
process.exit(1);
