// Pure, dependency-free helpers for full-document contract analysis: overlapping
// text chunking + cross-chunk risk merge/de-dup. Isolated from the Netlify/provider
// runtime so they can be unit-tested directly (see contract-chunking.test.ts).
// Keep this file import-free.

export type RiskLevel = "high" | "medium" | "low";

// The subset of a Risk needed to merge/de-dup. The handler passes its full Risk
// objects (a superset) and gets the same objects back.
export type MergeableRisk = {
  type: string;
  level: RiskLevel;
  quote: string | null;
};

// Full-width CJK punctuation → ASCII equivalent, so a quote that transcribes a
// punctuation mark differently than the source (very common for Chinese contracts)
// still matches.
const FULLWIDTH_PUNCT: Record<string, string> = {
  "，": ",", "、": ",", "。": ".", "；": ";", "：": ":", "！": "!", "？": "?",
  "（": "(", "）": ")", "【": "[", "】": "]", "「": '"', "」": '"', "『": '"', "』": '"',
  "“": '"', "”": '"', "‘": "'", "’": "'", "《": "<", "》": ">", "—": "-", "～": "~", "％": "%",
};

// Normalize text for substring matching: lowercase, normalize full-width punctuation,
// and collapse whitespace. Shared by the citation-grounding check and the chunk
// de-dup so they agree on "same text".
//
// CJK fix: PDF text extraction (pdf.js items.join(" ")) often inserts spaces BETWEEN
// Chinese characters/runs ("本 协 议"), which the model omits when it quotes verbatim
// ("本协议"). Without stripping whitespace adjacent to CJK characters the grounding
// check fails on almost every Chinese citation. English word spacing is untouched.
export function normalizeForMatch(value: string): string {
  return value
    .toLowerCase()
    .replace(/[，、。；：！？（）【】「」『』“”‘’《》—～％]/g, (ch) => FULLWIDTH_PUNCT[ch] ?? ch)
    .replace(/　/g, " ") // full-width space → normal space
    .replace(/\s+(?=[一-鿿])|(?<=[一-鿿])\s+/g, "") // drop whitespace adjacent to CJK
    .replace(/\s+/g, " ")
    .trim();
}

// Split text into overlapping [start,end) ranges of <= maxChars, preferring to cut at
// a paragraph / line / sentence boundary near the limit so a clause isn't split
// mid-sentence. Overlap re-includes each chunk's tail at the next chunk's head, so a
// clause sitting on a boundary still appears whole in at least one chunk.
export function chunkRangesFor(
  text: string,
  maxChars: number,
  overlap: number,
): Array<{ start: number; end: number }> {
  const len = text.length;
  if (len <= maxChars) return [{ start: 0, end: len }];
  const ranges: Array<{ start: number; end: number }> = [];
  let start = 0;
  while (start < len) {
    let end = Math.min(start + maxChars, len);
    if (end < len) {
      const minEnd = start + Math.floor(maxChars * 0.7); // keep chunks from getting too small
      const cut = lastBoundary(text, minEnd, end);
      if (cut > minEnd) end = cut;
    }
    ranges.push({ start, end });
    if (end >= len) break;
    start = Math.max(end - overlap, start + 1); // overlap, but always make progress
  }
  return ranges;
}

// Index just AFTER the best break (paragraph > line > sentence) within [from,to], or
// -1 if none.
function lastBoundary(text: string, from: number, to: number): number {
  const slice = text.slice(from, to);
  const para = slice.lastIndexOf("\n\n");
  if (para !== -1) return from + para + 2;
  const line = slice.lastIndexOf("\n");
  if (line !== -1) return from + line + 1;
  const sentence = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("。"), slice.lastIndexOf("; "));
  if (sentence !== -1) return from + sentence + 1;
  return -1;
}

const LEVEL_RANK: Record<RiskLevel, number> = { high: 0, medium: 1, low: 2 };

// Merge findings from all chunks: de-duplicate (overlap regions + the same missing
// protection get flagged more than once), keep the most severe copy of each, sort
// most-important-first, and cap the list.
export function mergeAndDedupRisks<T extends MergeableRisk>(risks: T[], cap = 12): T[] {
  const byKey = new Map<string, T>();
  for (const r of risks) {
    const key = dedupKey(r);
    const prev = byKey.get(key);
    if (!prev) {
      byKey.set(key, r);
      continue;
    }
    // keep the more severe; tie → prefer the copy that carries a locatable quote
    if (LEVEL_RANK[r.level] < LEVEL_RANK[prev.level]) byKey.set(key, r);
    else if (LEVEL_RANK[r.level] === LEVEL_RANK[prev.level] && !prev.quote && r.quote) byKey.set(key, r);
  }
  return [...byKey.values()].sort((a, b) => LEVEL_RANK[a.level] - LEVEL_RANK[b.level]).slice(0, cap);
}

function dedupKey(r: MergeableRisk): string {
  // Quoted risks de-dup by their normalized quote; missing-clause risks (no quote)
  // de-dup by type so the same absent protection isn't reported once per chunk.
  const q = r.quote ? normalizeForMatch(r.quote) : "";
  return q ? `q:${q}` : `t:${normalizeForMatch(r.type)}`;
}
