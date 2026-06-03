import { execFileSync } from "node:child_process";
import process from "node:process";

const allowedExact = new Set([
  "apps/dockdocs/lib/programmatic-geo.ts",
  "apps/dockdocs/lib/geo.ts",
  "apps/dockdocs/components/ProgrammaticGeoPage.tsx",
  "apps/dockdocs/components/GeoHubPage.tsx",
  "apps/dockdocs/app/sitemap.ts",
  "apps/dockdocs/public/llms.txt",
  "apps/dockdocs/scripts/geo-qa-check.mjs",
  "apps/dockdocs/scripts/geo-scope-guard.mjs",
  "apps/dockdocs/scripts/geo-template-audit.mjs",
  "package.json",
  "apps/dockdocs/package.json",
]);

const allowedPrefixes = ["apps/dockdocs/docs/"];

const warningPatterns = [
  /^apps\/dockdocs\/netlify\/functions\//u,
  /^apps\/dockdocs\/app\/api\//u,
  /^docs\/seo\//u,
  /^apps\/[^/]+\/next\.config\./u,
  /^netlify\.toml$/u,
  /dns/i,
  /cloudflare/i,
  /deploy/i,
];

const ignoredPatterns = [
  /\.tsbuildinfo$/u,
  /^apps\/[^/]+\/out\//u,
  /^apps\/[^/]+\/\.next\//u,
  /^node_modules\//u,
];

function runGit(args) {
  return execFileSync("git", args, { encoding: "utf8" })
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((file) => file.replace(/\\/g, "/"));
}

const changed = new Set([
  ...runGit(["diff", "--name-only"]),
  ...runGit(["ls-files", "--others", "--exclude-standard"]),
]);

const files = [...changed].sort();
const allowed = [];
const blocked = [];
const warnings = [];

for (const file of files) {
  if (ignoredPatterns.some((pattern) => pattern.test(file))) {
    continue;
  }

  const isAllowed =
    allowedExact.has(file) ||
    allowedPrefixes.some((prefix) => file.startsWith(prefix));
  const isWarning = warningPatterns.some((pattern) => pattern.test(file));

  if (isAllowed) {
    allowed.push(file);
    continue;
  }

  if (isWarning) {
    warnings.push(file);
    continue;
  }

  blocked.push(file);
}

if (!files.length) {
  console.log("GEO scope guard passed: no git changes detected.");
  process.exit(0);
}

if (allowed.length) {
  console.log("GEO scope guard allowed files:");
  for (const file of allowed) console.log(`- ${file}`);
}

if (warnings.length) {
  console.warn("GEO scope guard high-risk warnings:");
  for (const file of warnings) console.warn(`- ${file}`);
}

if (blocked.length) {
  console.error("GEO scope guard failed: non-GEO files are present in git diff or untracked files.");
  for (const file of blocked) console.error(`- ${file}`);
  console.error("Separate or review these files before a GEO-only commit.");
  process.exit(1);
}

console.log("GEO scope guard passed: all changed files are GEO-scoped.");
