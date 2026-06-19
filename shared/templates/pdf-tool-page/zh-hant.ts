import * as OpenCC from "opencc-js";

// Simplified (cn) -> Traditional (tw, Taiwan) converter, shared by the PDF tool
// template (index + workflow engine + runtimes). Module-level singleton so SSG
// and client hydration emit identical strings (opencc-js is deterministic and
// isomorphic) — no hydration mismatch. zh-Hant copy is derived from zh; there is
// no separate Traditional literal in the template.
let _conv: ((s: string) => string) | null = null;

export function toHant(s: string): string {
  if (!s) return s;
  if (!_conv) _conv = OpenCC.Converter({ from: "cn", to: "tw" });
  return _conv(s);
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
