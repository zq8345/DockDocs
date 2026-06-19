import * as OpenCC from "opencc-js";

// Simplified (cn) -> Traditional (tw, Taiwan variant). opencc-js bundles its
// dictionaries, is synchronous, deterministic, and isomorphic (identical output
// in Node SSG and in the browser), so calling toHant on both server and client
// produces the same string — no hydration mismatch.
let _converter: ((s: string) => string) | null = null;

function converter(): (s: string) => string {
  if (!_converter) {
    _converter = OpenCC.Converter({ from: "cn", to: "tw" });
  }
  return _converter;
}

/** Convert a Simplified-Chinese string to Traditional (Taiwan). Memoized converter. */
export function toHant(s: string): string {
  if (!s) return s;
  return converter()(s);
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
