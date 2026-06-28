// ─────────────────────────────────────────────────────────────────────────────
// check-ko-render.mjs — Korean (ko) RENDER verification.
//
// The ONLY trustworthy "ko is done" signal. tsc/guards pass while a /ko/ page
// silently falls back to English (a missing locale key → `?? .en`). This script
// crawls the ACTUAL static-export HTML in out/ko/** and fails if a page's visible
// body still contains run-on English (= English fallback leaked through).
//
// Usage:
//   node scripts/check-ko-render.mjs            # build first, then check
//   node scripts/check-ko-render.mjs --no-build # check existing out/ only
//
// Exit 0 iff every checked page PASSES; exit 1 otherwise.
// ─────────────────────────────────────────────────────────────────────────────
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

const ROOT = process.cwd();
const OUT = join(ROOT, "out");
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

// ── 2. Pages to check ────────────────────────────────────────────────────────
// `chromeOnly: true` → the page BODY is en/zh by design (blog articles), so we
// only require the chrome (nav/footer/title/GEO blocks) to be Korean. We still
// scan it, but classify body-language leaks as informational, not FAIL.
const PAGES = [
  // ── core / leaf ──
  { route: "ko", label: "Home (首页)" },
  { route: "ko/about", label: "About (关于)" },
  { route: "ko/contact", label: "Contact (联系)" },
  { route: "ko/pricing", label: "Pricing (定价)" },
  { route: "ko/guides", label: "Guides hub (指南)" },
  { route: "ko/blog", label: "Blog index", chromeOnly: true },
  { route: "ko/sitemap", label: "Sitemap" },
  { route: "ko/faq", label: "FAQ" },
  { route: "ko/help", label: "Help" },
  { route: "ko/ai-workspace", label: "AI workspace" },
  // ── vertical hubs ──
  { route: "ko/for/legal", label: "Hub /for/legal" },
  { route: "ko/for/finance", label: "Hub /for/finance" },
  { route: "ko/for/research", label: "Hub /for/research" },
  // ── tool samples (cover each rendering family) ──
  { route: "ko/merge-pdf", label: "Tool merge-pdf (client)" },
  { route: "ko/compress-pdf", label: "Tool compress-pdf (template)" },
  { route: "ko/pdf-to-word", label: "Tool pdf-to-word (template/server)" },
  { route: "ko/split-pdf", label: "Tool split-pdf (client)" },
  { route: "ko/watermark-pdf", label: "Tool watermark-pdf (client)" },
  { route: "ko/contract-risk", label: "Tool contract-risk (AI client)" },
  { route: "ko/chat-with-pdf", label: "Tool chat-with-pdf (AI)" },
  { route: "ko/ai-summary", label: "Tool ai-summary (AI)" },
  { route: "ko/sign-pdf", label: "Tool sign-pdf (client)" },
  { route: "ko/redact-pdf", label: "Tool redact-pdf (client)" },
  { route: "ko/extract-to-excel", label: "Tool extract-to-excel (AI client)" },
  { route: "ko/batch-compress", label: "Tool batch-compress (batch client)" },
];

// ── 3. Whitelist: brand / technical / format tokens that are English by design ─
// These are stripped from the visible text BEFORE the run-on-English test, so a
// legitimately-Korean line like "PDF를 Word로 변환" is not flagged for "PDF"/"Word".
const WHITELIST = [
  "DockDocs", "PDF", "PDFs", "PDF/A", "OCR", "AI", "Word", "Excel", "PPT",
  "PowerPoint", "JPG", "PNG", "JPEG", "CSV", "ZIP", "API", "RFP", "RFPs",
  "LibreOffice", "Merchant of Record", "Google", "Microsoft", "Markdown",
  "HTML", "URL", "URLs", "Tesseract", "WASM", "Gotenberg", "CloudConvert",
  "Creem", "Supabase", "Netlify", "Pro", "Plus", "Free", "FREE", "PRO",
  "AES", "AES-256", "DocSend", "GEO", "SaaS", "docx", "xlsx", "pptx", "v2",
];

// Language-switcher native names + brand standalone lines: legitimately non-Korean.
const SKIP_LINE = [
  /^english$/i, /^deutsch$/i, /^español$/i, /^français$/i, /^português$/i,
  /^italiano$/i, /^русский$/i, /^日本語$/i, /^中文$/i, /^简体中文$/i,
  /^繁體中文$/i, /^한국어$/i, /^العربية$/i, /^हिन्दी$/i, /^dockdocs$/i,
  /^->$/, /^→$/, /^\/+$/,
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

// Strip whitelist tokens (whole-word, case-sensitive for brand fidelity) + e-mail
// addresses + URL paths, so they cannot seed a run-on-English match.
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

// Run-on English: ≥4 consecutive English words. After stripping the whitelist,
// any such run is an English sentence that leaked (= English fallback).
const RUN_ON = /\b[A-Za-z][A-Za-z']*(?:\s+[A-Za-z][A-Za-z']*){3,}\b/g;

function findLeaks(lines) {
  const hits = [];
  for (const raw of lines) {
    if (raw.length < 4) continue;
    if (SKIP_LINE.some((re) => re.test(raw))) continue;
    const stripped = stripAllowed(raw);
    const matches = stripped.match(RUN_ON);
    if (matches) {
      for (const m of matches) {
        // ignore residual all-caps acronym runs / single stray tokens
        if (m.split(/\s+/).filter((w) => /[A-Za-z]/.test(w)).length >= 4) {
          hits.push({ frag: m.trim(), line: raw.slice(0, 160) });
        }
      }
    }
  }
  return hits;
}

// ── 5. Run ───────────────────────────────────────────────────────────────────
if (!existsSync(OUT)) {
  console.error(`✗ ${OUT} not found — run a build first (omit --no-build).`);
  process.exit(1);
}

let pass = 0;
let fail = 0;
const failures = [];

for (const page of PAGES) {
  const file = join(OUT, page.route, "index.html");
  const tag = page.chromeOnly ? " [chrome-only]" : "";
  if (!existsSync(file)) {
    fail++;
    failures.push(page);
    console.log(`FAIL  /${page.route}  — ${page.label}${tag}\n        (out file missing: ${file})`);
    continue;
  }
  const lines = visibleText(readFileSync(file, "utf8"));
  const leaks = findLeaks(lines);

  if (page.chromeOnly) {
    // Body is en/zh by design. Report leaks as info only; never FAIL.
    console.log(`PASS  /${page.route}  — ${page.label}${tag}  (${leaks.length} body English frag(s), not gating)`);
    pass++;
    continue;
  }

  if (leaks.length === 0) {
    console.log(`PASS  /${page.route}  — ${page.label}`);
    pass++;
  } else {
    fail++;
    failures.push({ ...page, leaks });
    console.log(`FAIL  /${page.route}  — ${page.label}  (${leaks.length} English frag(s))`);
    const uniq = [...new Map(leaks.map((l) => [l.frag, l])).values()];
    for (const l of uniq.slice(0, 6)) {
      console.log(`        • "${l.frag}"`);
    }
    if (uniq.length > 6) console.log(`        …+${uniq.length - 6} more unique`);
  }
}

console.log(`\n──────────────────────────────────────────`);
console.log(`${pass} PASS / ${fail} FAIL  (of ${PAGES.length} checked)`);
console.log(`──────────────────────────────────────────`);

process.exit(fail === 0 ? 0 : 1);
