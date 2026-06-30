// Layout-constants guard — FAIL mode.
//
// Enforces that all page-level outer-frame widths appear only via LAYOUT constants,
// never as raw Tailwind strings. Two tiers:
//   LAYOUT.content   = max-w-6xl (ALL page outer frames: marketing, info, tool pages, AI tools)
//   LAYOUT.appShell  = max-w-7xl (workspace shell: my-chats, upgrade, mission-control)
//
// Inner work columns (upload box, result panels, prose columns) are component-internal
// and NOT governed here — those may use max-w-3xl / max-w-4xl / max-w-5xl as local layout.
//
// Pattern: any className string containing "mx-auto" followed directly (no intervening
// class) by a raw "max-w-(4xl|5xl|6xl|7xl)" without a ${LAYOUT. reference is a violation.
//
// Exempt: lib/layout-constants.ts (the definition file), node_modules, .next.
// NOT flagged: w-full max-w-3xl (embedded-panel shorthand — no mx-auto in that combo).

import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";
import { fileURLToPath } from "url";

const __dir = fileURLToPath(new URL(".", import.meta.url));
const ROOT = join(__dir, "..");

// Regex: mx-auto followed (optionally by other classes) by max-w-{4,5,6,7}xl
// Use a raw source scan — if the literal text appears in source, it's a violation.
const PATTERN = /mx-auto\s[^`"]*max-w-(?:4xl|5xl|6xl|7xl)/;

const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "dist", "out"]);
const EXEMPT_PATHS = [
  "lib/layout-constants.ts",
  "scripts/check-layout-constants.mjs",
  // Inner work column — intentionally narrower than the page outer frame
  "components/ToolSections.tsx",
];

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full, files);
    } else if (/\.(tsx|ts)$/.test(entry)) {
      files.push(full);
    }
  }
  return files;
}

// Also scan shared templates (one level up from apps/dockdocs)
const SHARED_ROOT = join(ROOT, "..", "..", "shared");

const allFiles = [
  ...walk(join(ROOT, "app")),
  ...walk(join(ROOT, "components")),
  ...walk(join(ROOT, "lib")),
];

// Add shared if it exists
try {
  allFiles.push(...walk(SHARED_ROOT));
} catch {
  // shared dir may not exist in all environments
}

let violations = 0;

for (const file of allFiles) {
  const rel = relative(ROOT, file).replace(/\\/g, "/");
  if (EXEMPT_PATHS.some((p) => rel.endsWith(p))) continue;

  const src = readFileSync(file, "utf8");
  const lines = src.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (PATTERN.test(line)) {
      // Allow if the line already uses ${LAYOUT. (migrated)
      if (line.includes("${LAYOUT.")) continue;
      // Allow if this is in a comment
      const stripped = line.trimStart();
      if (stripped.startsWith("//") || stripped.startsWith("*")) continue;
      console.error(`[layout] raw max-w in className: ${rel}:${i + 1}`);
      console.error(`         ${line.trim()}`);
      violations++;
    }
  }
}

if (violations > 0) {
  console.error(
    `\n[layout] ${violations} violation(s) — replace raw max-w-* with LAYOUT.content (page outer frames) or LAYOUT.appShell (workspace shell) from lib/layout-constants\n`
  );
  process.exit(1);
} else {
  console.log("[layout] OK — all page-level containers use LAYOUT constants");
}
