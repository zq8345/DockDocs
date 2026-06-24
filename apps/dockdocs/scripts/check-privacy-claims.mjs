// privacy-claims guard — FAIL mode (engine-judged, 2026-06-23).
//
// Catches the class of bug that shipped to prod twice and was caught only by hand:
// copy that claims a tool is CLIENT-SIDE ("runs in your browser / files never leave
// your device / verify with F12, nothing uploaded") when the tool's REAL runtime is
// SERVER-SIDE (uploads to CloudConvert) — OR the reverse, a server tool stripped of its
// honest framing. The judge is the ENGINE, never a comment or a meter alias:
//
//   SERVER-SIDE set = pdf-runtime.ts `cloudConvertRoutes` (the only slugs that POST the
//   file to CloudConvert). Everything else with a real runtime is pure client-side
//   (pdf-lib / @cantoo/pdf-lib / pdfjs / canvas / Tesseract-WASM), incl. protect-pdf
//   (protectPdfLocally) — the very tool the stale `usage-limits` comment mislabeled.
//
// THREE CHECKS (any failure -> exit 1, wired into the same gate as check-claims):
//   B — set invariant: LOCAL_ONLY_SLUGS (renders the "verify with F12, never uploaded"
//       trust badge) MUST NOT intersect cloudConvertRoutes. A server tool can never
//       carry that badge.
//   A — per-tool copy: a SERVER slug's user-facing copy (localized-tools tool table +
//       FAQ map, catch-all CUSTOM_TOOL_COPY) must NOT make a client-side/no-upload claim.
//   C — site-level blanket: the homepage (app/page.tsx + lib/page-schema.ts) must not
//       claim "~N / all tools run in your browser, files never leave" WITHOUT a scoping
//       qualifier (most/some/client-side), because server tools exist.

import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const APP = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SHARED = resolve(APP, "..", "..", "shared", "templates", "pdf-tool-page");
const rd = (p) => (existsSync(p) ? readFileSync(p, "utf8") : "");

// ── engine sources of truth ──────────────────────────────────────────────────
const runtimeSrc = rd(join(SHARED, "pdf-runtime.ts"));
const verifySrc = rd(join(SHARED, "VerifyClientSide.tsx"));

function strArray(src, anchorRe) {
  const m = src.match(anchorRe);
  if (!m) return null;
  // Anchor on the `=` so the type annotation's brackets (PdfRuntimeSlug[]) aren't
  // mistaken for the value array.
  const eq = src.indexOf("=", m.index);
  if (eq < 0) return null;
  const start = src.indexOf("[", eq);
  const end = src.indexOf("]", start);
  if (start < 0 || end < 0) return null;
  return [...src.slice(start, end).matchAll(/"([^"]+)"/g)].map((x) => x[1]);
}
// The single authoritative server-side set: the slugs gated into runCloudConvert().
const cloudConvertRoutes = strArray(runtimeSrc, /const\s+cloudConvertRoutes\s*:/);
// The "verify F12 / never uploaded" allowlist.
function parseSet(src) {
  const m = src.match(/LOCAL_ONLY_SLUGS\s*=\s*new Set<string>\(\[([\s\S]*?)\]\)/);
  if (!m) return null;
  // strip // comment lines, keep quoted entries
  const body = m[1].split("\n").filter((l) => !l.trim().startsWith("//")).join("\n");
  return [...body.matchAll(/"([^"]+)"/g)].map((x) => x[1]);
}
const localOnly = parseSet(verifySrc);

const errors = [];
if (!cloudConvertRoutes) errors.push(`[engine]  could not parse cloudConvertRoutes from pdf-runtime.ts — update the guard (this is the source of truth).`);
if (!localOnly) errors.push(`[engine]  could not parse LOCAL_ONLY_SLUGS from VerifyClientSide.tsx — update the guard.`);
const serverSet = new Set(cloudConvertRoutes ?? []);

// ── client-side / no-upload CLAIM phrases (7 langs) — a SERVER tool must not say these.
// Surgical: multi-word, unambiguous; tuned to NOT match "works in any modern browser"
// or "no software to install" (true for server tools too).
// UNAMBIGUOUS privacy/no-upload claims only. We deliberately do NOT match a bare
// "in your browser / en tu navegador / 在浏览器" — that is also the honest no-install
// convenience phrasing ("Convert directly in your browser", no software to install),
// which is true for server tools too. We require either an explicit local-PROCESSING
// claim (runs/processed/encrypted entirely|completely|locally in your browser) or an
// explicit no-upload / never-leaves-device / offline claim.
const CLAIM = [
  /\b(runs?|processed|encrypted|happens?|done)\s+(entirely|completely|locally)\s+(in|on)\s+your\s+(browser|device)\b/i,
  /\bnever\s+leaves?\s+your\s+(device|computer)\b/i,
  /\bnothing\s+is\s+uploaded\b/i, /\bno\s+upload\b/i, /\b0-?byte\s+upload\b/i,
  /\bnever\s+uploaded\b/i, /\bworks?\s+offline\b/i, /\bno\s+file\s+is\s+(ever\s+)?uploaded\b/i,
  /(完全|全部)在(你的?|您的?)?浏览器(里|中|内)(本地)?(运行|处理|加密|完成)/, /文件不(会)?(上传|离开你的设备|离开您的设备)/, /不上传(任何)?(文件)?/, /断网(也能|可)/,
  /nunca\s+sale[n]?\s+de\s+tu\s+dispositivo/i, /sin\s+subir(\s+nada)?/i, /no\s+se\s+sube/i, /sin\s+conexi[oó]n/i,
  /nunca\s+sa[ei]m?\s+do\s+seu\s+dispositivo/i, /sem\s+upload/i, /n[ãa]o\s+[ée]\s+enviado/i,
  /ne\s+quitte[nt]?\s+jamais\s+votre\s+appareil/i, /rien\s+n'est\s+(envoy[ée]|t[ée]l[ée]vers[ée])/i, /hors\s+ligne/i,
  /デバイス(から|の外に)出(る|ない|ること)/, /アップロードされません/, /アップロードは(一切)?ありません/, /オフライン/,
];
// A client-side phrase is HONEST (not a false claim) when it appears in a
// RECOMMENDATION / CONDITIONAL context — a server tool legitimately tells the user
// "if you'd rather a file never leave your device, use one of our client-side tools".
// That points to alternatives; it does not claim THIS tool is client-side.
const REC_EXEMPT = [
  /if\s+you|\brather\b|\bprefer\b|\binstead\b|client-?side|purely\s+client|use\s+one\s+of\s+our|switch\s+to/i,
  /如果你|如果您|更想|宁愿|想要|改用|客户端|纯客户端|换用/,
  /si\s+prefieres|si\s+quieres|en\s+su\s+lugar|del\s+lado\s+del\s+cliente|usa\s+una|prefieres\s+que/i,
  /se\s+prefere|se\s+voc[êe]|em\s+vez|do\s+lado\s+do\s+cliente|use\s+uma|prefere\s+que/i,
  /si\s+vous\s+pr[ée]f[ée]rez|plut[ôo]t|c[ôo]t[ée]\s+client|utilisez|si\s+vous\s+voulez/i,
  /の方が|むしろ|代わりに|クライアントサイド|お使いください|希望\s*なら/,
];
// Find the first client-side claim that is NOT in a recommendation/conditional context.
function falseClientClaim(text) {
  for (const re of CLAIM) {
    const g = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
    for (const m of text.matchAll(g)) {
      const w = text.slice(Math.max(0, m.index - 90), m.index + m[0].length + 90);
      if (REC_EXEMPT.some((ex) => ex.test(w))) continue; // honest "use a client-side tool instead"
      return m[0];
    }
  }
  return null;
}

// ── CHECK B: set invariant — no server route may be in the F12-badge allowlist ──
if (cloudConvertRoutes && localOnly) {
  const bad = localOnly.filter((s) => serverSet.has(s));
  for (const s of bad) {
    errors.push(`[B/badge]  "${s}" is in LOCAL_ONLY_SLUGS (renders the "verify with F12 — never uploaded" badge) BUT is a CloudConvert server route (pdf-runtime cloudConvertRoutes). A server tool can never carry that badge — remove it from LOCAL_ONLY_SLUGS or stop routing it server-side.`);
  }
}

// ── CHECK A: a SERVER slug's copy must not claim client-side ──
// Extract per-slug copy from localized-tools.ts (every `"<slug>": { … }` block in any
// table/faq map) + catch-all CUSTOM_TOOL_COPY. Scan only the server slugs.
const tools = rd(join(APP, "lib", "localized-tools.ts"));
const page = rd(join(APP, "app", "[locale]", "[[...slug]]", "page.tsx"));
function blocksForSlug(src, slug) {
  const out = [];
  let from = 0;
  const needle = `"${slug}": {`;
  while (true) {
    const i = src.indexOf(needle, from);
    if (i < 0) break;
    let d = 0, j = src.indexOf("{", i), str = null;
    for (; j < src.length; j++) {
      const c = src[j];
      if (str) { if (c === "\\") { j++; continue; } if (c === str) str = null; continue; }
      if (c === '"' || c === "'" || c === "`") { str = c; continue; }
      if (c === "{") d++; else if (c === "}") { d--; if (d === 0) { j++; break; } }
    }
    out.push(src.slice(i, j));
    from = j;
  }
  return out;
}
for (const slug of serverSet) {
  for (const [label, src] of [["localized-tools.ts", tools], ["catch-all CUSTOM_TOOL_COPY", page]]) {
    for (const block of blocksForSlug(src, slug)) {
      const hit = falseClientClaim(block);
      if (hit) {
        errors.push(`[A/copy]   server-side slug "${slug}" makes a CLIENT-SIDE / no-upload claim in ${label} ("${hit}") — it uploads to CloudConvert (pdf-runtime cloudConvertRoutes), so this is false. Reword to honest server-side framing (or, if it's recommending a client-side alternative, phrase it as a recommendation).`);
        break;
      }
    }
  }
}

// ── CHECK C: site-level blanket privacy claim must be scoped ──
// The homepage says ~N PDF tools "run in your browser, files never leave". Since server
// tools EXIST (cloudConvertRoutes non-empty), an UNSCOPED blanket ("all"/"~N"/"every"
// tools + browser + never-leave, with no most/some/client-side qualifier) is false.
const SCOPE = /\b(most|some|many|client-?side|those|certain)\b/i;
const SCOPE_ZH = /多数|大多数|大部分|部分|客户端|这些/;
const BLANKET = [
  /(~?\s*\d+|all|every)\s+(free\s+)?(pdf\s+)?tools[^.。]{0,80}\b(run|runs|processed|happen)[^.。]{0,40}in\s+your\s+browser[^.。]{0,80}(never\s+leaves?|no\s+upload|nothing\s+uploaded)/i,
];
if (serverSet.size > 0) {
  for (const [label, src] of [["app/page.tsx", rd(join(APP, "app", "page.tsx"))], ["lib/page-schema.ts", rd(join(APP, "lib", "page-schema.ts"))]]) {
    for (const re of BLANKET) {
      for (const m of src.matchAll(new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g"))) {
        const window = src.slice(Math.max(0, m.index - 30), m.index + m[0].length + 30);
        if (SCOPE.test(window) || SCOPE_ZH.test(window)) continue; // scoped → honest
        const ln = src.slice(0, m.index).split("\n").length;
        errors.push(`[C/blanket] ${label}:${ln} — unscoped blanket privacy claim ("${m[0].slice(0, 70)}…"). Server tools exist (cloudConvertRoutes non-empty), so scope it ("most run in your browser…").`);
      }
    }
  }
}

// ── report ──────────────────────────────────────────────────────────────────
console.log("");
console.log("════════════════════════════════════════════════════════════════════");
console.log("  PRIVACY-CLAIMS GUARD  (client-side claim vs engine runtime · F12 badge · blanket)");
console.log("════════════════════════════════════════════════════════════════════");
console.log(`  Engine server-side set (pdf-runtime cloudConvertRoutes): ${[...serverSet].join(", ") || "(none?)"}`);
console.log(`  LOCAL_ONLY_SLUGS (F12 badge): ${(localOnly ?? []).length} slugs`);
if (!errors.length) {
  console.log("\n  ✓ no server tool claims client-side; no server route carries the F12 badge; homepage blanket scoped.");
  console.log("════════════════════════════════════════════════════════════════════\n");
  process.exit(0);
}
console.log(`\n  ✗ ${errors.length} privacy-claim problem(s):\n`);
for (const e of errors) console.log("  • " + e);
console.log("\n  The judge is the ENGINE (pdf-runtime cloudConvertRoutes), never a comment/alias.");
console.log("════════════════════════════════════════════════════════════════════\n");
process.exit(1);
