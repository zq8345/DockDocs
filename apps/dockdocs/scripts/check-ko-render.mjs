// ─────────────────────────────────────────────────────────────────────────────
// check-ko-render.mjs — Korean (ko) RENDER verification.
//
// The ONLY trustworthy "ko is done" signal. tsc/guards pass while a /ko/ page
// silently falls back to English (a missing locale key → `?? .en`). This script
// crawls the ACTUAL static-export HTML in out/ko/** and fails if a page's visible
// body still contains English that leaked through (an English fallback).
//
// Two detectors (a line PASSES if it contains ANY Korean character — so Korean/
// English mixed lines like "PDF를 Word로 변환" are fine):
//   1. run-on English  — ≥4 consecutive English words (a leaked English sentence).
//   2. short-label English (NEW) — a line that is ENTIRELY English (no Korean char)
//      after stripping the whitelist/URLs/symbols, with any real English word left,
//      is a leaked nav/footer/table label (Workspace, Pricing, "All rights
//      reserved", "Format conversion (single file)", …). The old run-on detector
//      missed these 1-3-word labels — the gap Joe caught live on /ko/.
//
// Page set is ENUMERATED, not sampled: every out/ko/**/index.html is checked, so a
// new tool/route can't slip the net. Content-layer pages whose BODY is en/zh by
// design (blog, GEO guides/resources, app shells) are marked chromeOnly → reported
// but never gating.
//
// Usage:
//   node scripts/check-ko-render.mjs            # build first, then check
//   node scripts/check-ko-render.mjs --no-build # check existing out/ only
//
// Exit 0 iff every GATING page PASSES; exit 1 otherwise.
// ─────────────────────────────────────────────────────────────────────────────
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { execSync } from "node:child_process";

const ROOT = process.cwd();
const OUT = join(ROOT, "out");
const KO_DIR = join(OUT, "ko");
const noBuild = process.argv.includes("--no-build");

// ── 1. Build (Next static export → out/) ─────────────────────────────────────
if (!noBuild) {
  console.log("→ npm run build (static export)…\n");
  try {
    execSync("npm run build", { cwd: ROOT, stdio: "inherit" });
  } catch {
    console.error("\n✗ build FAILED — fix the build before render-checking ko.");
    process.exit(1);
  }
  console.log("");
}

// ── 2. Enumerate ALL ko pages from out/ko/**/index.html ──────────────────────
// Walk the static export so the page list can never drift from what actually ships.
function walkIndexHtml(dir) {
  const found = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      found.push(...walkIndexHtml(full));
    } else if (name === "index.html") {
      found.push(full);
    }
  }
  return found;
}

// Content-layer routes whose BODY is en/zh BY DESIGN (not a bug): GEO long-form
// content + the blog + auth-gated app shells (client-rendered, near-empty static
// HTML). These are scanned but classified chromeOnly → never gate the exit code.
// (Matched on the route path AFTER the leading "ko/".) Keep this list TIGHT — do
// NOT add real tool/marketing routes here just to silence a failure.
const CHROME_ONLY = new Set([
  "blog",          // ko blog chrome falls back to en (foundation phase)
  "guides",        // GEO long-form content layer (en/zh authored)
  "resources",     // GEO long-form content layer
  "ai-pdf-guides", // GEO long-form content layer
  "dashboard",     // auth-gated client app shell (no static body copy)
  "account",       // auth-gated client app shell
  "my-chats",      // auth-gated client app shell
]);

// ── 3. Whitelist: brand / technical / format tokens that are English by design ─
// Stripped from a line BEFORE both detectors, so a legitimately-Korean line like
// "PDF를 Word로 변환" is never flagged for "PDF"/"Word", and a short brand label
// like "PDF OCR" is not a false short-label leak.
const WHITELIST = [
  // "Dock" + "Docs" are the two <span> halves of the BrandMark wordmark
  // (components/BrandMark.tsx) — after tag-stripping they land on their own lines,
  // so they must be allowed or they false-positive on every single page.
  "DockDocs", "Dock", "Docs", "PDF", "PDFs", "PDF/A", "OCR", "AI", "Word", "Excel", "PPT",
  "PowerPoint", "JPG", "PNG", "JPEG", "WebP", "CSV", "ZIP", "API", "RFP", "RFPs",
  "LibreOffice", "Merchant of Record", "Google", "Microsoft", "Markdown",
  "HTML", "URL", "URLs", "Tesseract", "WASM", "Gotenberg", "CloudConvert",
  "Creem", "Supabase", "Netlify", "Pro", "Plus", "Free", "FREE", "PRO",
  "AES", "AES-256", "DocSend", "GEO", "SaaS", "docx", "xlsx", "pptx", "v2",
  "Office", "iLovePDF", "Smallpdf", "Adobe",
  // Upper-case file-format codes (UploadDropzone acceptLabel "Supports XLSX XLS",
  // "PPTX", "DOCX DOC" etc.) — technical tokens English by design, same as the
  // lower-case docx/xlsx/pptx and PDF/Word/Excel already above.
  "XLSX", "XLS", "PPTX", "DOCX", "DOC",
];

// Language-switcher native names + brand standalone lines + pure punctuation:
// legitimately non-Korean even though they contain no Korean character.
const SKIP_LINE = [
  /^english$/i, /^deutsch$/i, /^español$/i, /^français$/i, /^português$/i,
  /^italiano$/i, /^русский$/i, /^日本語$/i, /^中文$/i, /^简体中文$/i,
  /^繁體中文$/i, /^한국어$/i, /^العربية$/i, /^हिन्दी$/i, /^dockdocs$/i,
  /^->$/, /^→$/, /^\/+$/, /^©.*dockdocs.*$/i,
];

// ── 4. HTML → visible body text ──────────────────────────────────────────────
function visibleText(html) {
  let s = html;
  s = s.replace(/<head[\s\S]*?<\/head>/gi, " ");
  s = s.replace(/<script[\s\S]*?<\/script>/gi, " ");
  s = s.replace(/<style[\s\S]*?<\/style>/gi, " ");
  s = s.replace(/<template[\s\S]*?<\/template>/gi, " ");
  s = s.replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");
  s = s.replace(/<[^>]+>/g, "\n");
  s = s
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&#x27;|&#39;|&apos;/g, "'").replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ").replace(/&mdash;/g, "—").replace(/&hellip;/g, "…");
  return s.split("\n").map((l) => l.trim()).filter(Boolean);
}

// Korean (Hangul) presence — any syllable or jamo. A line with ANY Korean char is
// treated as translated (Korean/English mixed is normal and fine).
const HANGUL = /[가-힣ᄀ-ᇿ㄰-㆏ꥠ-꥿ힰ-퟿]/;

// Strip whitelist tokens (whole-word, case-sensitive) + emails + URL-ish paths, so
// they cannot seed either detector. Returns the leftover "non-allowed" text.
function stripAllowed(line) {
  let s = line;
  s = s.replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, " "); // emails
  s = s.replace(/https?:\/\/\S+/g, " ");           // urls
  s = s.replace(/\/[A-Za-z][\w/-]*/g, " ");        // url-ish paths (/merge-pdf)
  for (const w of WHITELIST) {
    s = s.replace(new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g"), " ");
  }
  return s;
}

// Run-on English: ≥4 consecutive English words after stripping the whitelist.
const RUN_ON = /\b[A-Za-z][A-Za-z']*(?:\s+[A-Za-z][A-Za-z']*){3,}\b/g;
// Any English word (for the short-label detector).
const ANY_WORD = /\b[A-Za-z][A-Za-z']*\b/g;

function classifyLine(raw) {
  // returns { kind: "run-on" | "short-label" | null, frag }
  if (raw.length < 2) return { kind: null };
  if (SKIP_LINE.some((re) => re.test(raw))) return { kind: null };
  // Korean present anywhere → translated line, never a leak (handles KR/EN mix).
  if (HANGUL.test(raw)) return { kind: null };

  const stripped = stripAllowed(raw);

  // Detector 1 — run-on English (leaked sentence).
  const runs = stripped.match(RUN_ON);
  if (runs) {
    for (const m of runs) {
      if (m.split(/\s+/).filter((w) => /[A-Za-z]/.test(w)).length >= 4) {
        return { kind: "run-on", frag: m.trim() };
      }
    }
  }

  // Detector 2 — short-label English: the WHOLE line is English (no Korean) and,
  // after removing whitelist/symbols, still has ≥1 real English word (≥2 letters).
  // Catches 1-3-word nav/footer/table labels the run-on detector misses. Requiring
  // a ≥2-letter residual word avoids false positives from a stray single letter or
  // a unit residual ("x", the "x" left from "15/day").
  const words = (stripped.match(ANY_WORD) || []).filter((w) => w.length >= 2);
  if (words.length >= 1) {
    return { kind: "short-label", frag: words.join(" ").trim().slice(0, 80) };
  }

  return { kind: null };
}

function findLeaks(lines) {
  const runOn = [];
  const shortLabel = [];
  for (const raw of lines) {
    const { kind, frag } = classifyLine(raw);
    if (kind === "run-on") runOn.push({ frag, line: raw.slice(0, 160) });
    else if (kind === "short-label") shortLabel.push({ frag, line: raw.slice(0, 160) });
  }
  return { runOn, shortLabel };
}

// ── 5. Run ───────────────────────────────────────────────────────────────────
if (!existsSync(KO_DIR)) {
  console.error(`✗ ${KO_DIR} not found — run a build first (omit --no-build).`);
  process.exit(1);
}

const files = walkIndexHtml(KO_DIR).sort();
let pass = 0;
let fail = 0;
const gatingFailures = [];

for (const file of files) {
  // route = "ko/<...>" with OS-independent slashes; subPath = part after "ko/".
  const rel = relative(OUT, file).split(sep).join("/").replace(/\/index\.html$/, "");
  const subPath = rel.replace(/^ko\/?/, ""); // "" for the home page
  const chromeOnly = CHROME_ONLY.has(subPath);
  const tag = chromeOnly ? " [chrome-only]" : "";

  const lines = visibleText(readFileSync(file, "utf8"));
  const { runOn, shortLabel } = findLeaks(lines);
  const total = runOn.length + shortLabel.length;

  if (chromeOnly) {
    console.log(`PASS  /${rel}${tag}  (${total} body English frag(s): ${shortLabel.length} short-label / ${runOn.length} run-on — not gating)`);
    pass++;
    continue;
  }

  if (total === 0) {
    console.log(`PASS  /${rel}`);
    pass++;
  } else {
    fail++;
    gatingFailures.push({ rel, runOn, shortLabel });
    console.log(`FAIL  /${rel}  (${shortLabel.length} short-label + ${runOn.length} run-on English frag(s))`);
    const uniqShort = [...new Map(shortLabel.map((l) => [l.frag, l])).values()];
    const uniqRun = [...new Map(runOn.map((l) => [l.frag, l])).values()];
    for (const l of uniqShort.slice(0, 6)) console.log(`        [short] "${l.frag}"`);
    if (uniqShort.length > 6) console.log(`        …+${uniqShort.length - 6} more short-label`);
    for (const l of uniqRun.slice(0, 4)) console.log(`        [run-on] "${l.frag}"`);
    if (uniqRun.length > 4) console.log(`        …+${uniqRun.length - 4} more run-on`);
  }
}

console.log(`\n──────────────────────────────────────────`);
console.log(`${pass} PASS / ${fail} FAIL  (of ${files.length} ko pages enumerated)`);
console.log(`──────────────────────────────────────────`);

process.exit(fail === 0 ? 0 : 1);
