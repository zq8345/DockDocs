import * as OpenCC from "opencc-js";

// Simplified (cn) -> Traditional with Taiwan PHRASES (twp). twp applies OpenCC's
// curated Taiwan vocabulary on top of the tw glyph mapping (e.g. 軟件→軟體,
// 內存→記憶體, 默認→預設, 鼠標→滑鼠). opencc-js bundles its dictionaries, is
// synchronous, deterministic, and isomorphic (identical output in Node SSG and in
// the browser), so calling toHant on both server and client produces the same
// string — no hydration mismatch.
let _converter: ((s: string) => string) | null = null;

function converter(): (s: string) => string {
  if (!_converter) {
    _converter = OpenCC.Converter({ from: "cn", to: "twp" });
  }
  return _converter;
}

// Sense-dependent terms resolved on the SIMPLIFIED input, BEFORE OpenCC — at this
// point 文件 vs 文档 are still distinct (after conversion they collapse, so it must
// be done here). Domain-validated for this PDF tool (verified across the zh source):
// 文件 is always "file", 文档 always "document", 支持 always software "support".
// Order matters: 文件→檔案 runs before 文档→文件 (distinct keys, no collision) so
// file-sense lands on 檔案 and document-sense on 文件.
const TW_PRE: Array<[string, string]> = [
  ["文件", "檔案"], // file → 檔案
  ["文档", "文件"], // document (mainland 文档) → TW 文件
  ["支持", "支援"], // software support → 支援
];

function applyTwPre(s: string): string {
  let out = s;
  for (const [from, to] of TW_PRE) {
    if (out.includes(from)) out = out.split(from).join(to);
  }
  return out;
}

// High-frequency, UNAMBIGUOUS Taiwan terms that twp still leaves as mainland
// vocabulary. Applied to the Traditional output, longest-key-first so a longer
// phrase wins before any substring of it. Keys are Chinese phrases only (no
// ASCII), so PDF/OCR/AI/DockDocs/URLs/brand tokens are never touched.
const TW_VOCAB: Record<string, string> = {
  服務器: "伺服器",
  在線: "線上",
  數據: "資料",
  網絡: "網路",
  設置: "設定",
  質量: "品質",
  屏幕: "螢幕",
  視頻: "影片",
  窗口: "視窗",
  信息: "資訊",
  界面: "介面",
  用戶: "使用者",
  登錄: "登入",
  點擊: "點選",
  智能: "智慧",
  文檔: "文件",
  // Fix an OpenCC mis-conversion: 面向 (orient/face) wrongly becomes 麵向.
  麵向: "面向",
};

const TW_VOCAB_ENTRIES = Object.entries(TW_VOCAB).sort(
  ([a], [b]) => b.length - a.length,
);

function applyTwVocab(s: string): string {
  let out = s;
  for (const [from, to] of TW_VOCAB_ENTRIES) {
    if (out.includes(from)) out = out.split(from).join(to);
  }
  return out;
}

/** Convert a Simplified-Chinese string to Traditional (Taiwan). Memoized converter. */
export function toHant(s: string): string {
  if (!s) return s;
  return applyTwVocab(converter()(applyTwPre(s)));
}

/**
 * Recursively convert every string value in an object/array tree from
 * Simplified to Traditional Chinese. Clones structure (does not mutate the
 * input); leaves non-string primitives untouched.
 */
export function deepHant<T>(value: T): T {
  if (typeof value === "string") {
    return toHant(value) as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => deepHant(item)) as unknown as T;
  }
  // Wrap functions (e.g. copy tables with `files: (n) => "…"`) so their string
  // return value is converted too; non-string returns pass through.
  if (typeof value === "function") {
    const fn = value as unknown as (...args: unknown[]) => unknown;
    return ((...args: unknown[]) => {
      const result = fn(...args);
      return typeof result === "string" ? toHant(result) : result;
    }) as unknown as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      out[key] = deepHant(val);
    }
    return out as T;
  }
  return value;
}
