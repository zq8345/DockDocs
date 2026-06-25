// Standalone unit test for the pure chunking + merge/de-dup logic (no deps, no
// provider). Run from apps/dockdocs:
//   node --experimental-strip-types netlify/functions/_shared/contract-chunking.test.mjs
import { chunkRangesFor, mergeAndDedupRisks, normalizeForMatch } from "./contract-chunking.ts";

let failures = 0;
function assert(cond, msg) {
  if (cond) console.log("ok   ", msg);
  else { console.error("FAIL ", msg); failures++; }
}

// ---------- chunkRangesFor ----------

// short text → one full range
{
  const r = chunkRangesFor("hello world", 100, 10);
  assert(r.length === 1 && r[0].start === 0 && r[0].end === 11, "short text → single full range");
}

// long text → multiple chunks, each <= maxChars, full coverage, overlapping
{
  const text = "A".repeat(1000) + "\n\n" + "B".repeat(1000) + "\n\n" + "C".repeat(1000);
  const max = 1200, overlap = 200;
  const r = chunkRangesFor(text, max, overlap);
  assert(r.length >= 2, "long text → multiple chunks");
  assert(r.every((c) => c.end - c.start <= max), "every chunk <= maxChars");
  assert(r[0].start === 0, "first chunk starts at 0");
  assert(r[r.length - 1].end === text.length, "last chunk ends at document end");
  let overlapsOk = true, gapsOk = true;
  for (let i = 1; i < r.length; i++) {
    if (!(r[i].start < r[i - 1].end)) overlapsOk = false; // re-includes prior tail
    if (r[i].start > r[i - 1].end) gapsOk = false;        // no uncovered gap
    if (!(r[i].start > r[i - 1].start)) gapsOk = false;   // always progresses
  }
  assert(overlapsOk, "chunks overlap their predecessor");
  assert(gapsOk, "no coverage gaps, always progresses");
}

// prefers a paragraph boundary near the limit instead of a hard cut
{
  const text = "X".repeat(900) + "\n\n" + "Y".repeat(900);
  const r = chunkRangesFor(text, 1000, 100);
  assert(r[0].end === 902, `cuts at the paragraph boundary (got ${r[0].end}, want 902)`);
}

// pathological no-boundary text still terminates and fully covers
{
  const text = "Z".repeat(5000);
  const r = chunkRangesFor(text, 1000, 100);
  assert(r.length > 0 && r[r.length - 1].end === 5000, "no-break text terminates + full coverage");
}

// ---------- mergeAndDedupRisks ----------

// same (normalized) quote from overlapping chunks → one finding, keep the more severe
{
  const merged = mergeAndDedupRisks([
    { type: "Liability", level: "medium", quote: "uncapped liability" },
    { type: "Liability cap", level: "high", quote: "Uncapped  Liability" },
  ]);
  assert(merged.length === 1, "same quote → deduped to one");
  assert(merged[0].level === "high", "kept the more severe copy");
}

// same missing-protection type (no quote) → one finding
{
  const merged = mergeAndDedupRisks([
    { type: "No liability cap", level: "high", quote: null },
    { type: "no LIABILITY cap", level: "high", quote: null },
  ]);
  assert(merged.length === 1, "same missing type → deduped to one");
}

// distinct findings kept and sorted high → medium → low
{
  const merged = mergeAndDedupRisks([
    { type: "a", level: "low", quote: "q1" },
    { type: "b", level: "high", quote: "q2" },
    { type: "c", level: "medium", quote: "q3" },
  ]);
  assert(merged.length === 3, "distinct quotes kept");
  assert(
    merged[0].level === "high" && merged[1].level === "medium" && merged[2].level === "low",
    "sorted by severity",
  );
}

// list capped
{
  const many = Array.from({ length: 20 }, (_, i) => ({ type: "t" + i, level: "low", quote: "q" + i }));
  assert(mergeAndDedupRisks(many, 12).length === 12, "capped to 12");
}

// a quoted risk and a missing risk of the SAME type are NOT merged
{
  const merged = mergeAndDedupRisks([
    { type: "Indemnity", level: "high", quote: "broad indemnity clause" },
    { type: "Indemnity", level: "medium", quote: null },
  ]);
  assert(merged.length === 2, "quoted vs missing of same type stay separate");
}

// normalizeForMatch sanity
assert(normalizeForMatch("  Foo   BAR\n baz ") === "foo bar baz", "normalizeForMatch collapses + lowercases");

// --- normalizeForMatch: Chinese citation grounding (the PDF-extraction-inserts-spaces bug) ---
// Spaces inserted between Chinese characters by pdf.js must not break the match against
// the model's space-free quote.
assert(normalizeForMatch("本 协 议") === normalizeForMatch("本协议"), "CJK inter-char spaces collapse (extraction vs model quote)");
assert(normalizeForMatch("甲方 应 当在 30 日内 通知") === normalizeForMatch("甲方应当在30日内通知"), "mixed CJK + digit spacing collapses");
// Full-width vs half-width punctuation must match either way.
assert(normalizeForMatch("责任，不超过上月费用。") === normalizeForMatch("责任,不超过上月费用."), "full-width comma/period match ASCII");
assert(normalizeForMatch("（如适用）") === normalizeForMatch("(如适用)"), "full-width parens match ASCII");
assert(normalizeForMatch("赔偿100％") === normalizeForMatch("赔偿100%"), "full-width percent matches ASCII");
// A realistic haystack (extracted with spaces) must contain the model's clean quote.
{
  const haystack = normalizeForMatch("第 五 条  乙 方 的 责 任 应 当 不 设 上 限 ，");
  const quote = normalizeForMatch("乙方的责任应当不设上限");
  assert(haystack.includes(quote), "spaced Chinese haystack includes the space-free quote (groundRisks path)");
}
// English must NOT regress: word spaces are preserved, not stripped.
assert(normalizeForMatch("Uncapped  Liability") === "uncapped liability", "english collapses to single space");
assert(normalizeForMatch("the cat") !== normalizeForMatch("thecat"), "english word spaces are NOT stripped (no false merge)");

console.log(failures === 0 ? "\nALL PASS" : `\n${failures} TEST(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
