// check-bare-links — postbuild guard against locale-dropping internal links.
//
// A bare "/slug" href rendered on a locale page silently sends the visitor to
// the English site (the 2026-07-04 sweep found 28 code points + ~520 data
// links doing exactly that). This guard freezes the fix as an invariant:
// components/ and shared/templates/ must build internal hrefs through
// localizedPath(locale, slug) / localizedDataHref(locale, href) / lh() —
// never as bare "/..." literals.
//
// Runs in the postbuild chain (NOT pre-push: tsc has a [locale] blind spot —
// see dockdocs-prepush-tsc-bracket-blindspot).
//
// KNOWN BLIND SPOT (by design): bare hrefs inside DATA tables (readingLinks
// rows etc.) are not href=/push( syntax and can't be matched here. The
// architectural rule that protects them: any shared component that renders
// caller data as an href MUST pass it through localizedDataHref/localizedPath
// at the render point (ToolSections/SaasInfoPage are the reference pattern).
//
// Escape hatches (both audited — grep for them):
//   1. `// bare-ok: <reason>` pragma on the same or the previous line
//   2. scripts/bare-link-allowlist.json entries {file, path, reason}
//      (matched by file + path literal, not line numbers)

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SCAN_DIRS = [join(ROOT, "components"), join(ROOT, "..", "..", "shared", "templates")];
const ALLOWLIST_PATH = join(ROOT, "scripts", "bare-link-allowlist.json");

// Verbs that turn a string literal into a navigation target. NOTE: `href:`
// object keys are deliberately NOT matched — those are data rows (readingLinks
// etc.), which stay bare by design and get localized at the render point.
const VERB =
  /(?:href=\{?|router\.push\(|window\.location\.href\s*=\s*|location\.assign\(|history\.pushState\([^)]*,\s*|history\.replaceState\([^)]*,\s*)(["'`])(\/[^"'`]*)\1/g;
// Template-literal paths whose interpolation carries no locale awareness.
const TEMPLATE = /(?:href=\{|router\.push\(|window\.location\.href\s*=\s*|location\.assign\()`\/\$\{/;

const NEUTRAL = [
  /^\/api\//,
  /^\/workspace(?:\/|$)/, // deliberately locale-less (the /[locale]/workspace shim owns locale)
  /^\/410(?:\/|$)/,
  /^\/_next\//,
  /^\/offline(?:\/|$)/, // standalone PWA fallback, en-only by design
  /\.(?:png|jpe?g|svg|webp|gif|ico|pdf|xml|txt|json|wasm|mjs|js|css|woff2?|gz|traineddata)(?:$|\?)/i,
];

let allowlist = [];
if (existsSync(ALLOWLIST_PATH)) {
  allowlist = JSON.parse(readFileSync(ALLOWLIST_PATH, "utf8"));
}

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) yield* walk(full);
    else if (/\.tsx?$/.test(entry)) yield full;
  }
}

const failures = [];

for (const dir of SCAN_DIRS) {
  if (!existsSync(dir)) continue;
  for (const file of walk(dir)) {
    const rel = relative(join(ROOT, ".."), file).replace(/\\/g, "/");
    const lines = readFileSync(file, "utf8").split(/\r?\n/);
    lines.forEach((line, i) => {
      const prev = i > 0 ? lines[i - 1] : "";
      const pragma = /\/\/\s*bare-ok:/.test(line) || /\/\/\s*bare-ok:/.test(prev);

      for (const match of line.matchAll(VERB)) {
        const path = match[2];
        if (path.startsWith("//")) continue;
        if (NEUTRAL.some((re) => re.test(path))) continue;
        if (pragma) continue;
        if (allowlist.some((a) => rel.endsWith(a.file) && a.path === path)) continue;
        failures.push({ file: rel, line: i + 1, hit: match[0] });
      }

      if (
        TEMPLATE.test(line) &&
        !/locale|localizedPath|localizedDataHref|localizedHref|lh\(/.test(line) &&
        !pragma &&
        !allowlist.some((a) => rel.endsWith(a.file) && a.path === "`template`")
      ) {
        failures.push({ file: rel, line: i + 1, hit: "template literal href without locale" });
      }
    });
  }
}

console.log("");
console.log("════════════════════════════════════════════════════════════════════");
console.log("  BARE-LINK GUARD  (locale-dropping internal links in components/shared)");
console.log("════════════════════════════════════════════════════════════════════");

if (failures.length > 0) {
  for (const f of failures) {
    console.error(`  ✗ ${f.file}:${f.line}  ${f.hit}`);
  }
  console.error("");
  console.error(`  ${failures.length} bare internal link(s). Use localizedPath(locale, slug) /`);
  console.error("  localizedDataHref(locale, href), or add `// bare-ok: <reason>` if the");
  console.error("  path is deliberately locale-less.");
  console.log("════════════════════════════════════════════════════════════════════");
  process.exit(1);
}

console.log("  ✓ no bare internal links — locale-aware by construction.");
console.log("════════════════════════════════════════════════════════════════════");
