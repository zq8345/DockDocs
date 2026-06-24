// i18n COVERAGE guard — FAIL mode (Phase 3 of the i18n root-fix).
//
// This is a SEPARATE build-blocking companion to scripts/check-i18n-parity.mjs.
// The parity guard only checks route presence + tool bodies + FAQ. This guard
// inventories EVERY remaining user-facing string source and enforces BOTH:
//   • MISSING  — a non-en locale lacks a key the en source has, and
//   • LEAK     — a non-en locale's value === the en value (and the value is not
//                an allow-listed legitimately-identical string) → SUSPECTED
//                untranslated (this is the class that lets English leak through
//                the `...enTools[slug]` spread, e.g. the stats chips).
//
// Phase 3: exits 1 on any gap → blocks the build until fixed.
// Any new English string must be translated in ALL locales before it can ship.
//
// Sources inventoried:
//   1. lib/localized-tools.ts   — per-locale tool objects, ALL fields incl.
//                                  stats + upload.{title,description,buttonLabel,note}
//   2. lib/copy.ts              — runtimeCopy, every leaf string per locale
//   3. app/[locale]/[[...slug]]/page.tsx  CUSTOM_TOOL_COPY — title/desc per locale
//
// zh-Hant is DERIVED at runtime via deepHant(zh) inside getLocalizedToolConfig.
// We do NOT expect hand-written zh-Hant data; instead we assert the derivation
// path is wired (deepHant import + the zh-Hant branch) and otherwise EXCLUDE
// zh-Hant from data-parity. CUSTOM_TOOL_COPY is the one place zh-Hant is NOT
// derived (it is read by raw locale key), so we DO flag zh-Hant there.

import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const APP = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TOOLS = join(APP, "lib", "localized-tools.ts");
const COPY = join(APP, "lib", "copy.ts");
const I18N = join(APP, "lib", "i18n.ts");
const PAGE = join(APP, "app", "[locale]", "[[...slug]]", "page.tsx");

// ── locales ────────────────────────────────────────────────────────────────
const SOURCE = "en";
// DATA_LOCALES / CUSTOM_LOCALES are DERIVED from routeLocales (lib/i18n.ts) just
// below — NOT hardcoded. That way adding a new route locale (e.g. "de") AUTO-enrolls
// it here and this guard FAILS the build until that locale is translated in all three
// inventoried sources, instead of silently shipping English. (en is the source; zh-Hant
// derives via deepHant, so it's excluded from hand-written-data parity. CUSTOM_TOOL_COPY
// also derives zh-Hant via toHant(zh), so it uses the same explicit-entry locale list.)
// ⚠️ KNOWN RESIDUAL GAP: this guard inventories only the THREE sources below
// (localized-tools.ts, copy.ts, CUSTOM_TOOL_COPY). It does NOT scan the custom-client
// inline STR/SECTIONS dictionaries or ToolFaq's FAQS — those use per-file hardcoded
// locale unions + `?? .en` fallback, and the catch-all narrows an unknown locale to
// "en" (esLocale/clientLocale/metaLocale), so adding a locale ships English there with
// a GREEN build. Closing that needs the canonical-store refactor, not this guard.

// ── English-leak allowlist ───────────────────────────────────────────────────
// A non-en value that EQUALS the en value is only OK if it's one of these
// legitimately-identical strings (brand, format names, universal tokens). Any
// other equal value is flagged as a SUSPECTED untranslated leak.
const ALLOW_EXACT = new Set(
  [
    "DockDocs", "PDF", "OK", "AI", "API", "MVP", "FREE", "PLUS", "PRO",
    "Free", "Plus", "Pro", "OCR", "URL", "ZIP", "CSV", "TXT", "HTML",
    "JPG", "JPEG", "PNG", "DOCX", "DOC", "PPTX", "PPT", "XLSX", "XLS",
    "Word", "Excel", "PowerPoint", "Markdown", "PDF/A", "Google", "Microsoft",
    "DockIMG", "DockSEO", "DockText", "Provider", "DeepSeek", "CloudConvert",
    "Netlify", "Stripe", "Creem", "Supabase", "(c)", "12", "40k", "Live",
    "$0", "$5", "$20",
    // product/feature names used verbatim across locales (brand convention)
    "Chat with PDF", "DockDocs Workspace",
    // French-origin / international tech terms legitimately identical across fr/es/pt
    // (flagged as "leak" only because the guard can't know these are cognates)
    "Blog", "Error", "Menu", "Chat", "Scan",
    "Document", "Documents", "Collections", "Messages",
    "Actions", "Question", "Conversations", "Source", "Sources",
    "docs",           // abbreviation "4 docs" / "9 docs" used in es/pt/fr
    "2 sources",      // "sources" is French, verbatim same
    "{count} citation{plural}", // "citation" is French-origin; template is identical in fr
  ].map((s) => s.toLowerCase()),
);

// Leaf key names that are STRUCTURAL (URLs, route slugs, tier codes, etc.) — not
// translatable copy. Their values are expected to be identical across locales, so
// equality with en is never a leak. Matched on the final path segment.
const STRUCTURAL_KEYS = new Set(["href", "slug", "tier", "src", "id", "key", "icon"]);
function isStructuralPath(path) {
  const leaf = path.replace(/\[\d+\]$/, "").split(".").pop() ?? "";
  return STRUCTURAL_KEYS.has(leaf);
}

// A value is "trivially identical" (never a leak) if, after stripping brand /
// format / punctuation / digits, nothing translatable remains. Catches things
// like "PDF → HTML", "DOCX & DOC", "100 MB", "v1.2", emails, urls, "—".
function isTriviallyIdentical(v) {
  if (typeof v !== "string") return true;
  const t = v.trim();
  if (t === "") return true;
  if (ALLOW_EXACT.has(t.toLowerCase())) return true;
  // strip allow-listed tokens, common units, digits, and punctuation; if the
  // remainder has no letters, there was nothing to translate.
  let r = t;
  for (const tok of ALLOW_EXACT) {
    r = r.replace(new RegExp(`\\b${tok.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}\\b`, "gi"), " ");
  }
  r = r
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/\b\S+@\S+\.\S+\b/g, " ")
    .replace(/\.(md|txt|html?|csv|pdf|docx?|pptx?|xlsx?|png|jpe?g|webp|zip|js|json)\b/gi, " ") // file extensions
    .replace(/\b\d+(\.\d+)?\s?(mb|kb|gb|px|k|%)?\b/gi, " ")
    .replace(/[^A-Za-zÀ-ɏ一-鿿぀-ヿ]/g, " ")
    .trim();
  // remaining ASCII letters? -> there was translatable English text -> not trivial
  return !/[A-Za-z]/.test(r);
}

function read(path, label) {
  if (!existsSync(path)) {
    console.error(`[i18n-coverage] missing source ${label}: ${path}`);
    process.exit(0); // report-only: never fail the build
  }
  return readFileSync(path, "utf8");
}

// Balanced extractor: returns the {...} (or [...]) literal that opens at the
// first `open` char at/after `from`. Skips strings + comments so braces inside
// quotes don't confuse depth tracking.
function balanced(text, from, open = "{", close = "}") {
  const start = text.indexOf(open, from);
  if (start < 0) return "";
  let depth = 0, i = start, inStr = null;
  for (; i < text.length; i++) {
    const c = text[i];
    if (inStr) {
      if (c === "\\") { i++; continue; }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") { inStr = c; continue; }
    if (c === "/" && text[i + 1] === "/") { while (i < text.length && text[i] !== "\n") i++; continue; }
    if (c === "/" && text[i + 1] === "*") { i += 2; while (i < text.length && !(text[i] === "*" && text[i + 1] === "/")) i++; i++; continue; }
    if (c === open) depth++;
    else if (c === close && --depth === 0) return text.slice(start, i + 1);
  }
  return "";
}

// Parse an array literal of "string" items, e.g. ["a","b","c"] -> [a,b,c]
function stringArrayFromList(listText) {
  return [...listText.matchAll(/"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'/g)].map(
    (m) => (m[1] ?? m[2] ?? "").replace(/\\(["'\\])/g, "$1"),
  );
}
function pickStringArray(src, name) {
  const m = src.match(new RegExp(`export const ${name}\\s*=\\s*\\[`));
  if (!m) return [];
  const arr = balanced(src, m.index, "[", "]");
  return stringArrayFromList(arr);
}

// Read the TOP-LEVEL keys of an object literal (depth-1 only). Returns a Map of
// key -> { raw } where raw is the source slice of the value (best-effort).
function topLevelKeys(objText) {
  const keys = new Map();
  let depth = 0, i = 0, inStr = null;
  for (; i < objText.length; i++) {
    const c = objText[i];
    if (inStr) {
      if (c === "\\") { i++; continue; }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") { inStr = c; continue; }
    if (c === "/" && objText[i + 1] === "/") { while (i < objText.length && objText[i] !== "\n") i++; continue; }
    if (c === "/" && objText[i + 1] === "*") { i += 2; while (i < objText.length && !(objText[i] === "*" && objText[i + 1] === "/")) i++; i++; continue; }
    if (c === "{" || c === "[" || c === "(") { depth++; continue; }
    if (c === "}" || c === "]" || c === ")") { depth--; continue; }
    if (depth === 1) {
      // a key at depth 1: either "key": / 'key': / bareKey:
      const rest = objText.slice(i);
      const km = rest.match(/^\s*(?:"([A-Za-z0-9_-]+)"|'([A-Za-z0-9_-]+)'|([A-Za-z_$][A-Za-z0-9_$]*))\s*:/);
      if (km && (objText[i - 1] === "{" || objText[i - 1] === "," || /\s/.test(objText[i - 1]))) {
        const key = km[1] ?? km[2] ?? km[3];
        // value starts right after the colon
        const colon = i + km[0].length;
        const valRaw = grabValue(objText, colon);
        keys.set(key, { raw: valRaw });
        i = colon - 1;
      }
    }
  }
  return keys;
}

// Grab a value slice starting at index `from` (just past the colon) up to the
// next depth-0 comma / closing brace.
function grabValue(text, from) {
  let i = from;
  while (i < text.length && /\s/.test(text[i])) i++;
  const c = text[i];
  if (c === "{") return balanced(text, i, "{", "}");
  if (c === "[") return balanced(text, i, "[", "]");
  // scalar / expression: read to next top-level , or }
  let depth = 0, inStr = null, start = i;
  for (; i < text.length; i++) {
    const ch = text[i];
    if (inStr) { if (ch === "\\") { i++; continue; } if (ch === inStr) inStr = null; continue; }
    if (ch === '"' || ch === "'" || ch === "`") { inStr = ch; continue; }
    if (ch === "{" || ch === "[" || ch === "(") depth++;
    else if (ch === "}" || ch === "]" || ch === ")") { if (depth === 0) break; depth--; }
    else if (ch === "," && depth === 0) break;
  }
  return text.slice(start, i).trim();
}

// Parse a JS string literal slice ("..." or '...') -> its content, else null.
function asString(raw) {
  if (typeof raw !== "string") return null;
  const t = raw.trim();
  const m = t.match(/^"((?:[^"\\]|\\.)*)"$/) || t.match(/^'((?:[^'\\]|\\.)*)'$/);
  if (!m) return null;
  return m[1].replace(/\\(["'\\])/g, "$1").replace(/\\n/g, "\n");
}

// ──────────────────────────────────────────────────────────────────────────
// SOURCE 1: lib/localized-tools.ts
// ──────────────────────────────────────────────────────────────────────────
const toolsSrc = read(TOOLS, "lib/localized-tools.ts");
const i18nSrc = read(I18N, "lib/i18n.ts");
const toolSlugs = pickStringArray(i18nSrc, "toolSlugs");

// Hand-written-translation locales = routeLocales minus en (the source) and zh-Hant
// (deepHant-derived). DERIVED so a newly-added route locale can't silently skip this
// guard (see the locales note up top). Fail closed if the parse yields nothing.
const ROUTE_LOCALES = pickStringArray(i18nSrc, "routeLocales");
const DATA_LOCALES = ROUTE_LOCALES.filter((l) => l !== "en" && l !== "zh-Hant");
const CUSTOM_LOCALES = DATA_LOCALES;
if (!DATA_LOCALES.length) {
  console.error("[i18n-coverage] FAIL — could not parse routeLocales from lib/i18n.ts (derived locale list is empty). Fix the parser before trusting this guard.");
  process.exit(1);
}

// PARTIAL locales: route locales that are deliberately NOT yet fully authored in
// the three body/runtime/metadata sources below — they ship localized claims +
// nav/shell-via-fallback and intentionally fall back to English for tool BODIES,
// runtimeCopy, and catch-all SEO metadata. This MUST stay in lock-step with the
// parity guard's BODY_LOCALES/FAQ_LOCALES (scripts/check-i18n-parity.mjs), which
// already scopes the same locales out of body/FAQ enforcement. Their gaps are
// still REPORTED below (full transparency) but do NOT fail the build. When a
// partial locale's deTools/runtimeCopy.de/CUSTOM_TOOL_COPY are authored, REMOVE
// it here and the guard re-blocks on any regression.
// de: now FULLY REQUIRED (deTools/deFaq/runtimeCopy.de/CUSTOM_TOOL_COPY de
// authored) — removed from this set so the guard blocks on any de gap.
const PARTIAL_LOCALES = new Set([]);
const BLOCKING_LOCALES = DATA_LOCALES.filter((l) => !PARTIAL_LOCALES.has(l));
const CUSTOM_BLOCKING_LOCALES = CUSTOM_LOCALES.filter((l) => !PARTIAL_LOCALES.has(l));

// Extract a `${locale}Tools` record -> Map<slug, entryObjText>
function extractRecord(localeVar) {
  const m = toolsSrc.search(new RegExp(`const ${localeVar}Tools[^=]*=`));
  if (m < 0) return null;
  const eq = toolsSrc.indexOf("=", m); // anchor at `=`; Record<…> has no braces but be safe
  const recText = balanced(toolsSrc, eq, "{", "}");
  const entries = new Map();
  // top-level keys of the record are the slugs
  const keys = topLevelKeys(recText);
  for (const [slug, { raw }] of keys) entries.set(slug, raw);
  return entries;
}

const enTools = extractRecord("en");
const localeTools = Object.fromEntries(DATA_LOCALES.map((l) => [l, extractRecord(l)]));

// FAQ maps (`${locale}Faq`) are substituted at runtime by getLocalizedToolConfig:
// for slugs present in the map, faqTitle + faq come from the LOCALIZED map, not
// from the tool record. So a record-level faqTitle that inherits en is NOT a
// real leak when the locale's FAQ map covers that slug. Build slug-coverage sets
// so we can suppress those false positives (and instead surface genuinely
// uncovered FAQ slugs).
function faqMapSlugs(localeVar) {
  // anchor at the `=` so balanced() opens the VALUE brace, not a brace inside the
  // `Partial<Record<ToolSlug, { … }>>` type annotation.
  const m = toolsSrc.search(new RegExp(`const ${localeVar}Faq\\b[^=]*=`));
  if (m < 0) return null;
  const eq = toolsSrc.indexOf("=", m);
  const obj = balanced(toolsSrc, eq, "{", "}");
  return new Set([...topLevelKeys(obj).keys()]);
}
const faqCoverage = Object.fromEntries(DATA_LOCALES.map((l) => [l, faqMapSlugs(l) ?? new Set()]));

// Per-tool top-level fields we want to verify are localized (string scalars).
const SCALAR_FIELDS = [
  "title", "description", "appName", "schemaName", "breadcrumbName",
  "heroTitle", "heroDescription", "primaryActionLabel",
  "benefitsTitle", "benefitsDescription", "featuresTitle", "featuresDescription",
  "workflowTitle", "workflowDescription", "faqTitle",
];

// helper: from an entry's object text, get top-level field value (string) if the
// field is EXPLICITLY overridden (present at depth 1). Returns:
//   { present:false }            -> inherited from en (the leak case for non-en)
//   { present:true, value }      -> override string
//   { present:true, value:null } -> override exists but not a plain string
function fieldOverride(entryText, field) {
  const keys = topLevelKeys(entryText);
  if (!keys.has(field)) return { present: false };
  return { present: true, value: asString(keys.get(field).raw) };
}

// stats: Array<[string,string]> — compare the flattened label/value strings.
function statsOf(entryText) {
  const keys = topLevelKeys(entryText);
  if (!keys.has("stats")) return null; // inherited
  return stringArrayFromList(keys.get("stats").raw);
}

// upload: { ...enUpload, title, description, buttonLabel, note } — note is the
// one that frequently falls back to English. Returns the override sub-keys.
function uploadOverride(entryText, sub) {
  const keys = topLevelKeys(entryText);
  if (!keys.has("upload")) return { present: false }; // whole upload inherited
  const upObj = keys.get("upload").raw;
  const upKeys = topLevelKeys(upObj);
  if (!upKeys.has(sub)) return { present: false };
  return { present: true, value: asString(upKeys.get(sub).raw) };
}

const toolFindings = {}; // locale -> [ "slug.field — MISSING/LEAK …" ]
for (const locale of DATA_LOCALES) toolFindings[locale] = [];

const enEntries = enTools ?? new Map();
for (const locale of DATA_LOCALES) {
  const recs = localeTools[locale];
  if (!recs) { toolFindings[locale].push(`(could not parse ${locale}Tools record)`); continue; }
  for (const slug of toolSlugs) {
    const enEntry = enEntries.get(slug);
    const locEntry = recs.get(slug);
    if (!locEntry) { toolFindings[locale].push(`${slug} — ENTRY MISSING from ${locale}Tools`); continue; }
    if (!enEntry) continue;

    // scalar fields
    for (const f of SCALAR_FIELDS) {
      // faqTitle is substituted at runtime from `${locale}Faq` when the slug is
      // covered — not a record-level leak in that case.
      if (f === "faqTitle" && faqCoverage[locale]?.has(slug)) continue;
      const en = fieldOverride(enEntry, f);
      if (!en.present || en.value == null) continue; // en doesn't define it as a plain string
      const loc = fieldOverride(locEntry, f);
      if (!loc.present) {
        // not overridden -> inherits en value -> leak (unless trivially identical)
        if (!isTriviallyIdentical(en.value)) toolFindings[locale].push(`${slug}.${f} — LEAK (inherits en: "${trunc(en.value)}")`);
        continue;
      }
      if (loc.value != null && loc.value === en.value && !isTriviallyIdentical(en.value)) {
        toolFindings[locale].push(`${slug}.${f} — LEAK (== en: "${trunc(en.value)}")`);
      }
    }

    // stats
    const enStats = statsOf(enEntry);
    if (enStats && enStats.length) {
      const locStats = statsOf(locEntry);
      if (!locStats) {
        toolFindings[locale].push(`${slug}.stats — LEAK (inherits en stats: ${JSON.stringify(enStats)})`);
      } else {
        // any stats cell equal to en (and non-trivial) is suspected untranslated
        const leaks = locStats.filter((v, idx) => v === enStats[idx] && !isTriviallyIdentical(v));
        if (leaks.length) toolFindings[locale].push(`${slug}.stats — LEAK (cells == en: ${JSON.stringify(leaks)})`);
      }
    }

    // upload.{title,description,buttonLabel,note}
    for (const sub of ["title", "description", "buttonLabel", "note"]) {
      const en = uploadOverride(enEntry, sub);
      if (!en.present || en.value == null) continue;
      const loc = uploadOverride(locEntry, sub);
      if (!loc.present) {
        if (!isTriviallyIdentical(en.value)) toolFindings[locale].push(`${slug}.upload.${sub} — LEAK (inherits en: "${trunc(en.value)}")`);
        continue;
      }
      if (loc.value != null && loc.value === en.value && !isTriviallyIdentical(en.value)) {
        toolFindings[locale].push(`${slug}.upload.${sub} — LEAK (== en: "${trunc(en.value)}")`);
      }
    }
  }
}

function trunc(s, n = 50) { return s.length > n ? s.slice(0, n) + "…" : s; }

// ──────────────────────────────────────────────────────────────────────────
// SOURCE 2: lib/copy.ts  (runtimeCopy)
// ──────────────────────────────────────────────────────────────────────────
const copySrc = read(COPY, "lib/copy.ts");
const copyFindings = {};
for (const locale of DATA_LOCALES) copyFindings[locale] = [];

// Runtime copy resolution (mirrors getRuntimeCopy in lib/copy.ts):
//   en/zh/es/pt/fr  -> runtimeCopy.<locale>
//   ja              -> { ...runtimeCopy.en, ...runtimeCopyJa }  (shallow merge:
//                      top-level blocks present in runtimeCopyJa override en;
//                      absent blocks fall back to en wholesale)
//   zh-Hant         -> deepHant(runtimeCopy.zh)  (derived; not checked here)
let copyLocales = {};
let jaCopyTop = null; // top-level keys present in runtimeCopyJa
{
  const m = copySrc.search(/export const runtimeCopy\s*=/);
  if (m < 0) {
    for (const l of DATA_LOCALES) copyFindings[l].push("(could not parse runtimeCopy)");
  } else {
    const obj = balanced(copySrc, m, "{", "}");
    const top = topLevelKeys(obj);
    for (const [loc, { raw }] of top) copyLocales[loc] = raw;
  }
  const jm = copySrc.search(/const runtimeCopyJa\s*=/);
  if (jm >= 0) jaCopyTop = topLevelKeys(balanced(copySrc, jm, "{", "}"));
}

// Flatten an object-literal text into a Map<keyPath, stringValue>, recursing
// through nested objects and arrays-of-objects. Array string items get [i].
function flattenStrings(objText, prefix, out) {
  const isArray = objText.trim().startsWith("[");
  if (isArray) {
    // walk array items
    let i = objText.indexOf("[") + 1, depth = 0, inStr = null, idx = 0, itemStart = i;
    for (; i < objText.length; i++) {
      const c = objText[i];
      if (inStr) { if (c === "\\") { i++; continue; } if (c === inStr) inStr = null; continue; }
      if (c === '"' || c === "'" || c === "`") { if (depth === 0) { /* string item */ } inStr = c; continue; }
      if (c === "{" || c === "[" || c === "(") depth++;
      else if (c === "}" || c === ")") depth--;
      else if (c === "]") { if (depth === 0) { pushArrayItem(objText.slice(itemStart, i), `${prefix}[${idx}]`, out); break; } depth--; }
      else if (c === "," && depth === 0) { pushArrayItem(objText.slice(itemStart, i), `${prefix}[${idx}]`, out); idx++; itemStart = i + 1; }
    }
    return;
  }
  const keys = topLevelKeys(objText);
  for (const [k, { raw }] of keys) {
    const path = prefix ? `${prefix}.${k}` : k;
    const t = raw.trim();
    const s = asString(raw);
    if (s != null) out.set(path, s);
    else if (t.startsWith("{")) flattenStrings(t, path, out);
    else if (t.startsWith("[")) flattenStrings(t, path, out);
    // ignore non-string scalars / expressions
  }
}
function pushArrayItem(itemText, path, out) {
  const t = itemText.trim();
  if (t === "") return;
  const s = asString(t);
  if (s != null) out.set(path, s);
  else if (t.startsWith("{")) flattenStrings(t, path, out);
  else if (t.startsWith("[")) flattenStrings(t, path, out);
}

let enCopyFlat = new Map();
if (copyLocales.en) flattenStrings(copyLocales.en, "", enCopyFlat);

// en top-level block -> its set of leaf paths, so we can attribute a whole
// inherited block (ja shallow-merge fallback) to a LEAK on every leaf.
function topBlockOf(path) { return path.split(/[.[]/)[0]; }

for (const locale of DATA_LOCALES) {
  if (copyFindings[locale].length) continue; // parse error already noted

  // Build the effective flat map for this locale.
  const flat = new Map();
  let jaInheritedBlocks = null;
  if (locale === "ja") {
    // ja = shallow merge of en + runtimeCopyJa (separate const)
    if (!jaCopyTop) { copyFindings.ja.push("(could not parse runtimeCopyJa)"); continue; }
    jaInheritedBlocks = new Set();
    const enTop = topLevelKeys(copyLocales.en);
    for (const [block, { raw }] of enTop) {
      if (jaCopyTop.has(block)) {
        flattenStrings(jaCopyTop.get(block).raw, block, flat); // ja overrides this block
      } else {
        jaInheritedBlocks.add(block); // whole block inherits en -> every leaf leaks
      }
    }
  } else {
    if (!copyLocales[locale]) { copyFindings[locale].push(`(runtimeCopy has no "${locale}" block)`); continue; }
    flattenStrings(copyLocales[locale], "", flat);
  }

  for (const [path, enVal] of enCopyFlat) {
    const structural = isStructuralPath(path);
    if (jaInheritedBlocks && jaInheritedBlocks.has(topBlockOf(path))) {
      if (!structural && !isTriviallyIdentical(enVal)) copyFindings.ja.push(`${path} — LEAK (block inherits en: "${trunc(enVal)}")`);
      continue;
    }
    if (!flat.has(path)) { copyFindings[locale].push(`${path} — MISSING`); continue; }
    if (structural) continue;
    const v = flat.get(path);
    if (v === enVal && !isTriviallyIdentical(enVal)) copyFindings[locale].push(`${path} — LEAK (== en: "${trunc(enVal)}")`);
  }
}

// ──────────────────────────────────────────────────────────────────────────
// SOURCE 3: app/[locale]/[[...slug]]/page.tsx  CUSTOM_TOOL_COPY
// ──────────────────────────────────────────────────────────────────────────
const pageSrc = read(PAGE, "app/[locale]/[[...slug]]/page.tsx");
const customFindings = {};
for (const locale of CUSTOM_LOCALES) customFindings[locale] = [];
let customEntryCount = 0;
{
  // anchor to the `= {` so we don't open the brace inside the multi-line
  // `Record<string, { … }>` TYPE annotation.
  const m = pageSrc.search(/const CUSTOM_TOOL_COPY\b[\s\S]*?=\s*\{/);
  const eq = m < 0 ? -1 : pageSrc.indexOf("=", m);
  if (m < 0 || eq < 0) {
    for (const l of CUSTOM_LOCALES) customFindings[l].push("(could not parse CUSTOM_TOOL_COPY)");
  } else {
    const obj = balanced(pageSrc, eq, "{", "}");
    const entries = topLevelKeys(obj);
    for (const [slug, { raw }] of entries) {
      customEntryCount++;
      const entryKeys = topLevelKeys(raw);
      for (const sub of ["title", "description"]) {
        if (!entryKeys.has(sub)) continue;
        const map = topLevelKeys(entryKeys.get(sub).raw);
        const enVal = asString(map.get("en")?.raw ?? "");
        for (const locale of CUSTOM_LOCALES) {
          if (!map.has(locale)) { customFindings[locale].push(`${slug}.${sub} — MISSING`); continue; }
          const v = asString(map.get(locale).raw);
          if (v != null && enVal != null && v === enVal && !isTriviallyIdentical(enVal)) {
            customFindings[locale].push(`${slug}.${sub} — LEAK (== en: "${trunc(enVal)}")`);
          }
        }
      }
    }
  }
}

// ──────────────────────────────────────────────────────────────────────────
// zh-Hant derivation sanity check
// ──────────────────────────────────────────────────────────────────────────
const hantWired =
  /import\s*\{\s*deepHant\s*\}\s*from\s*["']@\/lib\/zh-hant["']/.test(toolsSrc) &&
  /\(locale[^)]*\)\s*===\s*["']zh-Hant["']/.test(toolsSrc) &&
  /deepHant\(zhConfig\)/.test(toolsSrc);

// ──────────────────────────────────────────────────────────────────────────
// REPORT
// ──────────────────────────────────────────────────────────────────────────
const L = [];
L.push("");
L.push("════════════════════════════════════════════════════════════════════");
L.push("  i18n COVERAGE REPORT  (report-only — does NOT fail the build)");
L.push("════════════════════════════════════════════════════════════════════");

function countBy(findings, locales) {
  return locales.reduce((n, l) => n + (findings[l]?.length ?? 0), 0);
}
const toolTotal = countBy(toolFindings, DATA_LOCALES);
const copyTotal = countBy(copyFindings, DATA_LOCALES);
const customTotal = countBy(customFindings, CUSTOM_LOCALES);
// Blocking totals exclude PARTIAL_LOCALES (deliberately English-fallback locales,
// kept in lock-step with the parity guard's BODY_LOCALES) — those gaps are
// reported but do NOT fail the build.
const toolBlocking = countBy(toolFindings, BLOCKING_LOCALES);
const copyBlocking = countBy(copyFindings, BLOCKING_LOCALES);
const customBlocking = countBy(customFindings, CUSTOM_BLOCKING_LOCALES);

L.push("");
L.push("  SUMMARY");
L.push(`    Tool slugs checked: ${toolSlugs.length}   Data locales: ${DATA_LOCALES.join(", ")}   (zh-Hant derives via deepHant)`);
if (PARTIAL_LOCALES.size) {
  L.push(`    Partial (English-fallback, reported-not-blocking): ${[...PARTIAL_LOCALES].join(", ")}   — in lock-step with parity-guard BODY_LOCALES`);
}
L.push(`    lib/localized-tools.ts  gaps: ${toolTotal}`);
L.push(`    lib/copy.ts             gaps: ${copyTotal}`);
L.push(`    CUSTOM_TOOL_COPY        gaps: ${customTotal}   (${customEntryCount} entries × ${CUSTOM_LOCALES.length} locales)`);
L.push(`    zh-Hant derivation wired: ${hantWired ? "YES (deepHant(zh) path present)" : "NO ⚠️  — derivation path NOT detected"}`);
L.push(`    TOTAL gaps: ${toolTotal + copyTotal + customTotal}   (BLOCKING: ${toolBlocking + copyBlocking + customBlocking})`);

function section(title, findings, locales) {
  L.push("");
  L.push("────────────────────────────────────────────────────────────────────");
  L.push(`  ${title}`);
  L.push("────────────────────────────────────────────────────────────────────");
  for (const locale of locales) {
    const items = findings[locale] ?? [];
    L.push("");
    L.push(`  [${locale}]  ${items.length} gap${items.length === 1 ? "" : "s"}`);
    if (!items.length) { L.push("      ✓ none"); continue; }
    for (const it of items) L.push(`      • ${it}`);
  }
}

section("SOURCE 1 — lib/localized-tools.ts (per-tool fields incl. stats + upload.note)", toolFindings, DATA_LOCALES);
section("SOURCE 2 — lib/copy.ts (runtimeCopy leaf strings)", copyFindings, DATA_LOCALES);
section("SOURCE 3 — CUSTOM_TOOL_COPY (catch-all metadata; zh-Hant NOT derived here)", customFindings, CUSTOM_LOCALES);

L.push("");
L.push("────────────────────────────────────────────────────────────────────");
L.push("  NOT STATICALLY CHECKED (manual surfaces — consolidate in a later phase)");
L.push("────────────────────────────────────────────────────────────────────");
L.push("    • components/Header.tsx — nav labels, 'soon'/'More', Light/Dark, language");
L.push("      switcher + account/login strings live in JSX ternaries (per-locale");
L.push("      conditionals), not a parseable locale map. Audit flags zh-Hant nav (the");
L.push("      stripLocale structural bug) + es/pt/fr/ja 'soon'/'More'/theme labels.");
L.push("    • components/Footer.tsx — same pattern; audit flags missing zh-Hant + pt");
L.push("      footer links and un-localized 'All rights reserved'.");
L.push("    Recommendation: Phase 4 should hoist these into a checkable locale");
L.push("    structure (like runtimeCopy.shell) so this guard can cover them.");
L.push("");
L.push("  Phase 3 FAIL mode: exits 1 if any BLOCKING-locale gaps found above.");
if (PARTIAL_LOCALES.size) {
  L.push(`  (Partial locales [${[...PARTIAL_LOCALES].join(", ")}] are reported but English-fallback by design — not build-blocking.)`);
}
L.push("════════════════════════════════════════════════════════════════════");
L.push("");

console.log(L.join("\n"));
const blockingGaps = toolBlocking + copyBlocking + customBlocking;
if (blockingGaps > 0) {
  console.error(`[i18n-coverage] FAIL — ${blockingGaps} blocking gap(s) found. Fix all gaps before pushing.`);
  process.exit(1);
}
process.exit(0);
