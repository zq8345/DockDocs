#!/usr/bin/env node
// postbuild: stamp __SW_VERSION__ in out/sw.js with a unique build identifier.
//
// Version source priority:
//   1. $COMMIT_REF env var (Netlify sets this to the full SHA on every deploy).
//   2. `git rev-parse --short HEAD` (local builds).
//   3. Epoch-seconds fallback (always unique, always changes — last resort).
//
// This makes VERSION change on every deploy without manual intervention,
// so activate() always clears stale caches and ChunkLoadError white screens
// never happen from a frozen SW. Never bump VERSION by hand.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SW_OUT = join(__dirname, "../out/sw.js");

if (!existsSync(SW_OUT)) {
  // next build with output:"export" writes to out/; dev builds don't produce out/.
  console.log("[sw-version] out/sw.js not found — skipping (dev or non-export build).");
  process.exit(0);
}

function getBuildId() {
  // Netlify production deploy.
  const commitRef = process.env.COMMIT_REF;
  if (commitRef && commitRef.length >= 7) return commitRef.slice(0, 8);
  // Local git repo.
  try {
    return execSync("git rev-parse --short HEAD", { encoding: "utf8", stdio: ["pipe","pipe","pipe"] }).trim();
  } catch {
    // No git or detached HEAD — use epoch seconds (always changes, never collides).
    return String(Math.floor(Date.now() / 1000));
  }
}

const id = getBuildId();
const version = `v${id}`;
const src = readFileSync(SW_OUT, "utf8");
const patched = src.replace(/__SW_VERSION__/g, version);

if (patched === src) {
  console.warn("[sw-version] WARNING: __SW_VERSION__ placeholder missing in out/sw.js — check public/sw.js source.");
  process.exit(0);
}

writeFileSync(SW_OUT, patched, "utf8");
console.log(`[sw-version] stamped out/sw.js VERSION = ${version}`);
