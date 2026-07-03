/**
 * AiToolCopy — typed keyed copy table for AI shell tools
 * (方案: AI统一壳方案-2026-07-03 §8). Kills the per-client inline-ternary copy
 * that is the root of the i18n blind spots (guard 报绿而渲染是英文兜底).
 *
 * Contract: every shell tool authors ONE `AuthoredCopy<AiShellCopy & Extra>`
 * table — `AuthoredCopy` is Record over ALL authored locales, so a missing
 * locale is a tsc error, not a silent English fallback (the ko lesson).
 * zh-Hant is machine-derived from zh via deepHant at resolve time, giving the
 * full 9 route locales from 8 authored blocks.
 *
 * ⚠ The AI ANSWER language is a separate concern (engineLocale may collapse
 * de/zh-Hant→en for the model) — this table localizes the UI SHELL only; do
 * not let it imply the answer itself is localized.
 */

import type { AuthoredCopy, AuthoredLocale } from "@/lib/i18n";
import { deepHant } from "@/lib/zh-hant";

/** The copy every AI shell tool must provide — shell regions + moat atoms. */
export type AiShellCopy = {
  /* action region */
  ask: string;
  working: string;
  cancel: string;
  retry: string;
  ready: string;
  /* grounded answer */
  answer: string;
  references: string;
  verifiedBadge: string;
  unverifiedBadge: string;
  missingBadge: string;
  copyReference: string;
  showReference: string;
  hideReference: string;
  /* answer actions */
  copyAnswer: string;
  /* doc context bar */
  repick: string;
  reset: string;
};

/** A tool's full table: shell keys + tool-specific extras, all locales enforced. */
export type AiToolCopyTable<TExtra extends object = Record<never, never>> = AuthoredCopy<
  AiShellCopy & TExtra
>;

/**
 * Resolve one locale's copy. zh-Hant derives from zh (deepHant); unknown
 * locales fall back to en explicitly (route locales are typed, so this only
 * triggers for out-of-union strings passed from loose call sites).
 */
export function resolveAiToolCopy<T extends AiShellCopy>(
  table: AuthoredCopy<T>,
  locale: string,
): T {
  if (locale === "zh-Hant") return deepHant(table.zh) as unknown as T;
  return table[locale as AuthoredLocale] ?? table.en;
}
