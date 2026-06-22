// claims-consistency guard — FAIL mode (multilingual strategy P0.1, 2026-06-22).
//
// Turns the founder's #1 recurring pain (de-claim = ~6 rounds of English-centric
// grep that missed non-English parallels TWICE) into a build-time invariant.
// A 66-agent 6-language audit found 59 over-claims where an en-grep caught 3; this
// guard freezes that result into a ratchet that only goes forward.
//
// THREE CHECKS (any failure -> process.exit(1), wired into pre-push):
//   1. BANNED PHRASES — per-7-language blacklist of universal/over-claim wording
//      scanned across every copy surface. Per-language tokens are the whole point:
//      an English-only grep structurally cannot catch the es/pt/fr/ja parallels.
//   2. SCOPING CO-OCCURRENCE — the canonical CITATION_SCOPE (lib/claims.ts) must
//      carry a scope qualifier in all 7 locales; the brand-level ORG_DESC/SITE_DESC
//      (page-schema) must pair any source-passage claim with the "flags what it
//      can't trace" caveat (the exact regression that shipped today on SITE_DESC).
//   3. CROSS-LANGUAGE PARITY — CITATION_SCOPE / BRAND_SLOGAN present in all 7
//      locales and not leaking English (=== en); the tool count drift "20+/50+"
//      absent in every file (the count comes only from claims.ts TOOL_COUNT).
//
// The banned list is a LIVING artifact: when an adversarial review finds a new
// over-claim phrasing, add it here as a new rule. Ratchet, never loosen.

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";

const APP = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const rel = (p) => relative(APP, p).replace(/\\/g, "/");

// ── locales ──────────────────────────────────────────────────────────────────
const LOCALES = ["en", "zh", "zh-Hant", "es", "pt", "fr", "ja"];

// ── surface collection ───────────────────────────────────────────────────────
// Every user-facing copy surface. Recursive walk of components/, lib/, app/ for
// .ts/.tsx (these dirs hold no build output). out/ and .next/ are not under them.
const SCAN_DIRS = ["components", "lib", "app"];
const SKIP_DIR = new Set(["node_modules", ".next", "out", "scripts"]);
function walk(dir, acc) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return acc; }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) { if (!SKIP_DIR.has(e.name)) walk(full, acc); }
    else if (/\.(ts|tsx)$/.test(e.name) && !/\.d\.ts$/.test(e.name)) acc.push(full);
  }
  return acc;
}
const FILES = SCAN_DIRS.flatMap((d) => walk(join(APP, d), []));

// Strip // and /* */ comments (respecting string literals), replacing comment
// bytes with spaces/newlines so offsets + line numbers are preserved. Banned-
// phrase scanning runs on the stripped text so doc comments that DOCUMENT a
// banned phrase (e.g. lib/claims.ts header, "not a universal 'every answer is
// cited'" explainers) don't self-trip the guard.
function stripComments(src) {
  let out = "", i = 0, inStr = null;
  while (i < src.length) {
    const c = src[i], n = src[i + 1];
    if (inStr) {
      out += c;
      if (c === "\\") { out += n ?? ""; i += 2; continue; }
      if (c === inStr) inStr = null;
      i++; continue;
    }
    if (c === '"' || c === "'" || c === "`") { inStr = c; out += c; i++; continue; }
    if (c === "/" && n === "/") { while (i < src.length && src[i] !== "\n") { out += " "; i++; } continue; }
    if (c === "/" && n === "*") {
      out += "  "; i += 2;
      while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) { out += src[i] === "\n" ? "\n" : " "; i++; }
      out += "  "; i += 2; continue;
    }
    out += c; i++;
  }
  return out;
}

// ── CHECK 1: banned over-claim phrases (per-language) ────────────────────────
// Each rule: { re, why, scopable? }. Kept SURGICAL — universal phrasings only.
// `scopable: true` rules (citation universals) are EXEMPT when a scope marker
// co-occurs nearby: a scoped/negated mention ("...not a blanket 'every answer is
// cited'...", "shows the source when it can locate it") is honest copy, not an
// over-claim. Hard rules (tool-count, legal/accuracy absolutes) are never exempt.
const BANNED = [
  // — tool-count drift (HARD: a nearby scope word is irrelevant; use TOOL_COUNT) —
  { re: /\b\d+\s*\+\s*(free\s+)?(pdf\s+)?tools?\b/i, why: 'tool-count drift "N+ tools" — use ~TOOL_COUNT (lib/claims.ts)' },
  { re: /\d+\s*\+\s*(个|款)?\s*(工具|PDF\s*工具)/, why: 'zh 工具数漂移 "N+ 工具" — 用 TOOL_COUNT' },
  { re: /\d+\s*\+\s*(herramientas|ferramentas|outils)/i, why: 'es/pt/fr tool-count drift — use TOOL_COUNT' },
  { re: /\d+\s*\+\s*(の)?\s*ツール/, why: 'ja ツール数の水増し — TOOL_COUNT を使う' },

  // — universal answer-cites (en) — scopable: exempt if a scope marker co-occurs —
  { re: /every\s+answer\s+(cites|is\s+cited|shows\s+its\s+source|points\s+back|carries|quotes)/i, why: 'en universal "every answer cites/shows its source"', scopable: true },
  { re: /each\s+answer\s+(cites|is\s+quoted|points\s+back|shows\s+its\s+source)/i, why: 'en universal "each answer cites/points back"', scopable: true },
  { re: /\balways\s+cites?\b/i, why: 'en "always cites" — citations depend on the model, scope it', scopable: true },
  { re: /every\s+finding\s+is\s+quoted/i, why: 'en "every finding is quoted" (missing-clause findings have no quote)', scopable: true },

  // — universal answer-cites (zh) —
  { re: /每个回答都引用/, why: 'zh "每个回答都引用" — 并非每条都有出处', scopable: true },
  { re: /每一条结论都引用/, why: 'zh "每一条结论都引用" — 缺失类无原文可引', scopable: true },
  { re: /每条结论都(对应|引用)原文/, why: 'zh "每条结论都对应/引用原文"', scopable: true },
  // NOTE: "答案带原文出处" / "answers show their source" is NOT banned — it is
  // context-dependent: an over-claim for compare-qa (citePartial) but the
  // preserved, accurate chat-with-pdf moat claim (citeYes). A blanket phrase ban
  // cannot tell the two apart, so this class is left to human/audit review.

  // — universal answer-cites (es/pt/fr/ja) —
  { re: /cada\s+respuesta\s+cita/i, why: 'es "cada respuesta cita"', scopable: true },
  { re: /cada\s+resposta\s+cita/i, why: 'pt "cada resposta cita"', scopable: true },
  { re: /chaque\s+réponse\s+cite/i, why: 'fr "chaque réponse cite"', scopable: true },
  { re: /すべての回答が[^。]{0,8}引用/, why: 'ja "すべての回答が…引用"', scopable: true },
  { re: /必ず[^。]{0,8}(引用|出典|指し示)/, why: 'ja "必ず…引用/出典" — 必ず over-claim', scopable: true },
  // "sourced answer(s)" is a citation claim — scopable (chat cites only when locatable)
  { re: /sourced\s+answers?/i, why: 'en "sourced answer(s)" — scope it (chat cites only when locatable)', scopable: true },

  // — compare-recommend = citeNo: the recommendation has NO single source to cite,
  //   so a "sourced recommendation" is HARD-banned (use "backed by the numbers /
  //   基于并排数据 / based on the side-by-side data") —
  { re: /sourced\s+(pick|recommendation|verdict|choice)/i, why: 'en "sourced pick/recommendation/verdict" — compare-recommend is citeNo' },
  { re: /带出处的推荐/, why: 'zh "带出处的推荐" — 推荐无单一出处,用"基于并排数据"' },
  { re: /(recomendaci[oó]n|elecci[oó]n|veredicto)\s+con\s+(la\s+)?fuente/i, why: 'es "recomendación/elección/veredicto con fuente" — citeNo' },
  { re: /(recomenda[çc][ãa]o|escolha|veredic?to)\s+com\s+(a\s+)?fonte/i, why: 'pt "recomendação/escolha/veredicto com fonte" — citeNo' },
  { re: /(recommandation|choix|verdict)\s+(document[ée]e?|sourcée?)/i, why: 'fr "recommandation/choix/verdict documenté/sourcé" — citeNo' },
  { re: /(出典付き|根拠つき|根拠付き)の(おすすめ|推奨|選択|選定|判定|結論)/, why: 'ja "出典付き/根拠つきの…結論" — 推奨に単一の出典なし' },

  // — marketing absolutes (HARD: never exempt) —
  { re: /court-ready/i, why: 'en "court-ready" — legal absolute' },
  { re: /\b100\s*%\s*(accurate|accuracy|cited|verified|reliable|guaranteed)/i, why: 'en "100% accurate/cited/…"' },
  { re: /法庭可用/, why: 'zh "法庭可用" — 法律绝对化' },
  { re: /零风险/, why: 'zh "零风险"' },
  { re: /(完全|正確)性を保証(し(ます|て)|する)/, why: 'ja "完全性/正確性を保証" — 完整性/正确性保证' },
];

// ── CHECK 2/3: scope qualifier markers (per-language) ────────────────────────
// A citation claim is honest only if one of these qualifier markers co-occurs.
const SCOPE_MARKERS = {
  en: [/\bwhen\b[^.]*\b(can|locate|ground|trace)/i, /\bwhere\b[^.]*\b(it can|locate)/i, /flags?\s+what\s+it\s+can'?t\s+trace/i, /won'?t\s+appear\s+for\s+every/i, /or\s+says\s+it\s+can'?t/i],
  zh: [/无法溯源/, /能定位到原文时/, /找得到原文时/, /并非每条/, /缺失类/],
  "zh-Hant": [/無法溯源/, /能定位到原文時/, /找得到原文時/, /並非每條/, /缺失類/],
  es: [/cuando[^.]*(puede|localiz)/i, /señala lo que no puede rastrear/i, /no toda respuesta/i],
  pt: [/quando[^.]*(consegue|pode|localiz)/i, /sinaliza o que não pode rastrear/i, /nem toda resposta/i],
  fr: [/lorsqu/i, /quand[^.]*(peut|localis)/i, /signale ce qu'elle ne peut pas tracer/i, /n'auront pas de citation/i],
  ja: [/場合/, /たどれない部分/, /わけではありません/, /特定できる/],
};
function hasMarker(locale, text) {
  return (SCOPE_MARKERS[locale] ?? []).some((re) => re.test(text));
}

// Source-passage / citation NOUN per language (a claim that needs scoping).
const CITATION_NOUN = {
  en: /source passage/i,
  zh: /原文出处|原文段落/,
  "zh-Hant": /原文出處|原文段落/,
  es: /pasaje de origen/i,
  pt: /trecho de origem/i,
  fr: /passage source/i,
  ja: /原文箇所/,
};

// ── tiny parser: pull a Record<Locale,string> literal from a TS source ────────
// Returns { locale: value } for the named const's object literal.
function parseLocaleMap(src, constName) {
  const m = src.match(new RegExp(`${constName}\\s*(?::[^=]+)?=\\s*\\{`));
  if (!m) return null;
  const start = src.indexOf("{", m.index);
  let depth = 0, i = start, inStr = null;
  for (; i < src.length; i++) {
    const c = src[i];
    if (inStr) { if (c === "\\") { i++; continue; } if (c === inStr) inStr = null; continue; }
    if (c === '"' || c === "'" || c === "`") { inStr = c; continue; }
    if (c === "{") depth++;
    else if (c === "}" && --depth === 0) { i++; break; }
  }
  const body = src.slice(start, i);
  const out = {};
  const reEntry = /(?:"([a-zA-Z-]+)"|'([a-zA-Z-]+)'|([a-zA-Z][a-zA-Z-]*))\s*:\s*"((?:[^"\\]|\\.)*)"/g;
  let e;
  while ((e = reEntry.exec(body))) {
    const key = e[1] ?? e[2] ?? e[3];
    if (LOCALES.includes(key)) out[key] = e[4].replace(/\\(["'\\])/g, "$1");
  }
  return out;
}

// ── run ──────────────────────────────────────────────────────────────────────
const errors = [];

// CHECK 1 — banned phrases across all surfaces.
for (const file of FILES) {
  let text;
  try { text = readFileSync(file, "utf8"); } catch { continue; }
  const scan = stripComments(text); // ignore phrases that appear only in comments
  for (const { re, why, scopable } of BANNED) {
    const g = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
    for (const m of scan.matchAll(g)) {
      if (scopable) {
        // exempt a scoped/negated mention (a scope marker co-occurs within ~160 chars)
        const w = scan.slice(Math.max(0, m.index - 160), m.index + 160);
        if (LOCALES.some((l) => (SCOPE_MARKERS[l] ?? []).some((mk) => mk.test(w)))) continue;
      }
      const idx = scan.slice(0, m.index).split("\n").length;
      errors.push(`[banned]  ${rel(file)}:${idx}  ${why}\n            matched: "${m[0].slice(0, 60)}"`);
    }
  }
}

// Parse the SSOT (lib/claims.ts).
const CLAIMS = join(APP, "lib", "claims.ts");
if (!existsSync(CLAIMS)) {
  errors.push(`[ssot]    lib/claims.ts is MISSING — the claims SSOT must exist`);
} else {
  const claimsSrc = readFileSync(CLAIMS, "utf8");
  const scope = parseLocaleMap(claimsSrc, "CITATION_SCOPE");
  const slogan = parseLocaleMap(claimsSrc, "BRAND_SLOGAN");
  const toolCount = (claimsSrc.match(/TOOL_COUNT\s*=\s*(\d+)/) || [])[1];

  if (!toolCount) errors.push(`[ssot]    TOOL_COUNT not found in lib/claims.ts`);

  // CHECK 2 + 3 — CITATION_SCOPE: present-in-all-7, scoped-in-all-7, no en-leak.
  for (const map of [["CITATION_SCOPE", scope], ["BRAND_SLOGAN", slogan]]) {
    const [name, m] = map;
    if (!m) { errors.push(`[ssot]    could not parse ${name} from lib/claims.ts`); continue; }
    for (const loc of LOCALES) {
      if (!m[loc] || !m[loc].trim()) errors.push(`[parity]  ${name}.${loc} — MISSING (must be present in all 7 locales)`);
    }
    // no English leak (a non-en value identical to en = untranslated)
    for (const loc of LOCALES) {
      if (loc !== "en" && m[loc] && m.en && m[loc] === m.en) errors.push(`[parity]  ${name}.${loc} — LEAK (=== en, untranslated)`);
    }
  }
  if (scope) {
    for (const loc of LOCALES) {
      if (scope[loc] && !hasMarker(loc, scope[loc])) {
        errors.push(`[scope]   CITATION_SCOPE.${loc} — has no scoping qualifier marker (must say "when it can locate it / and says when it can't")`);
      }
    }
  }
}

// CHECK 2 — brand-level ORG_DESC / SITE_DESC must pair source-passage with caveat.
const PAGE_SCHEMA = join(APP, "lib", "page-schema.ts");
if (existsSync(PAGE_SCHEMA)) {
  const src = readFileSync(PAGE_SCHEMA, "utf8");
  for (const constName of ["ORG_DESC", "SITE_DESC"]) {
    const m = parseLocaleMap(src, constName);
    if (!m) { errors.push(`[scope]   could not parse ${constName} in lib/page-schema.ts`); continue; }
    for (const loc of Object.keys(m)) {
      const noun = CITATION_NOUN[loc];
      if (noun && noun.test(m[loc]) && !hasMarker(loc, m[loc])) {
        errors.push(`[scope]   ${constName}.${loc} — makes a source-passage claim with NO "flags what it can't trace" caveat`);
      }
    }
  }
}

// ── report ────────────────────────────────────────────────────────────────────
console.log("");
console.log("════════════════════════════════════════════════════════════════════");
console.log("  CLAIMS-CONSISTENCY GUARD  (banned phrases · scope co-occurrence · parity)");
console.log("════════════════════════════════════════════════════════════════════");
console.log(`  Surfaces scanned: ${FILES.length} files (components/ lib/ app/)`);
console.log(`  Locales: ${LOCALES.join(", ")}`);
if (!errors.length) {
  console.log("");
  console.log("  ✓ no over-claims, all citation copy scoped, claims present in all 7 locales.");
  console.log("════════════════════════════════════════════════════════════════════");
  console.log("");
  process.exit(0);
}
console.log("");
console.log(`  ✗ ${errors.length} problem(s):`);
console.log("");
for (const e of errors) console.log("  • " + e);
console.log("");
console.log("  Fix: scope the wording, or move the claim into lib/claims.ts and import it.");
console.log("  Banned list is a ratchet — add new over-claim phrasings, never remove.");
console.log("════════════════════════════════════════════════════════════════════");
console.log("");
process.exit(1);
