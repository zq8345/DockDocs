import * as OpenCC from "opencc-js";

// Simplified (cn) -> Traditional with Taiwan PHRASES (twp) converter, shared by
// the PDF tool template (index + workflow engine + runtimes). twp applies
// OpenCC's curated Taiwan vocabulary on top of the tw glyph mapping (e.g.
// 軟件→軟體, 內存→記憶體, 默認→預設, 鼠標→滑鼠). Module-level singleton so SSG
// and client hydration emit identical strings (opencc-js is deterministic and
// isomorphic) — no hydration mismatch. zh-Hant copy is derived from zh; there is
// no separate Traditional literal in the template.
let _conv: ((s: string) => string) | null = null;

// High-frequency, UNAMBIGUOUS Taiwan terms that twp still leaves as mainland
// vocabulary. Applied to the Traditional output, longest-key-first so a longer
// phrase wins before any substring of it. Keys are Chinese phrases only (no
// ASCII), so PDF/OCR/AI/DockDocs/URLs/brand tokens are never touched.
// AMBIGUOUS terms are deliberately EXCLUDED and left for native TW review:
//   文件 (file→檔案 OR document) · 支持 (support→支援 OR endorse).
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

export function toHant(s: string): string {
  if (!s) return s;
  if (!_conv) _conv = OpenCC.Converter({ from: "cn", to: "twp" });
  return applyTwVocab(_conv(s));
}

export function deepHant<T>(value: T): T {
  if (typeof value === "string") return toHant(value) as unknown as T;
  if (Array.isArray(value)) return value.map((v) => deepHant(v)) as unknown as T;
  // Wrap functions so their string return is converted too; non-strings pass through.
  if (typeof value === "function") {
    const fn = value as unknown as (...args: unknown[]) => unknown;
    return ((...args: unknown[]) => {
      const r = fn(...args);
      return typeof r === "string" ? toHant(r) : r;
    }) as unknown as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) out[k] = deepHant(v);
    return out as T;
  }
  return value;
}
