// ─────────────────────────────────────────────────────────────────────────────
// CLAIMS — single source of truth for load-bearing marketing/honesty claims.
//
// WHY THIS EXISTS (multilingual strategy P0.1, 2026-06-22):
// A product claim ("every answer cites its source", the tool count) used to live
// hand-written in 15+ files across 6 languages. De-claiming it meant ~6 rounds of
// English-centric grep that missed the non-English parallels TWICE (a 66-agent
// 6-language audit found 59 over-claims where an en-grep caught 3). This module is
// the typed catalog the `scripts/check-claims.mjs` guard anchors on: change a claim
// here, the guard turns red until every language consumer + surface is consistent.
//
// RULES (enforced by the guard, not by convention):
//   • Tool count is ONE number (TOOL_COUNT). Never write "20+"/"50+ tools".
//   • Any citation/source claim MUST be scoped — it carries a "when it can locate
//     it / and says when it can't" qualifier. Universal "every answer cites" is
//     banned. Seed wording below is today's post-de-claim gold standard.
//   • Brand SLOGAN (a value statement) and claim MECHANISM (a capability promise)
//     are kept apart: BRAND_SLOGAN is the whitelist ("Verify every answer" is fine);
//     mechanism over-claims are the blacklist (see check-claims.mjs).
//
// AI-citation ground truth (why citation copy must be scoped): only ai-chat
// reliably cites; contract-risk / lease-redflag / govbid-matrix / compare-extract /
// compare-qa cite a server-verified quote ONLY when locatable; summary / translate /
// classify / quiz do not cite at all. So no surface may promise a universal citation.
// ─────────────────────────────────────────────────────────────────────────────

import type { RouteLocale } from "@/lib/i18n";

/**
 * The canonical PDF-tool count. The site says "~50" (approximate, honest).
 * Import this instead of hand-writing a number; never ship "20+"/"50+ tools".
 * (Incremental migration per strategy §3.1 — new/edited copy must use this.)
 */
export const TOOL_COUNT = 50 as const;

/**
 * Scoped citation claim, per route locale. Each value MUST contain a scoping
 * qualifier marker ("when it can locate it" / "flags what it can't trace" /
 * "won't appear for every answer" and the localized equivalents) — the guard
 * asserts the marker is present in all 7 locales (check 2 + check 3). This is the
 * post-de-claim gold wording; edit here, not in consumers.
 */
export const CITATION_SCOPE: Record<RouteLocale, string> = {
  en: "When the AI can ground an answer in your document, DockDocs shows the source passage behind it and flags what it can't trace — a citation won't appear for every answer.",
  zh: "当 AI 能在你的文档里为答案找到依据时，DockDocs 会标出对应的原文出处，并在无法溯源时明确说明——并非每条回答都会有出处。",
  "zh-Hant": "當 AI 能在你的文檔裡為答案找到依據時，DockDocs 會標出對應的原文出處，並在無法溯源時明確說明——並非每條回答都會有出處。",
  es: "Cuando la IA puede fundamentar una respuesta en tu documento, DockDocs muestra el pasaje de origen y señala lo que no puede rastrear; no toda respuesta llevará una cita.",
  pt: "Quando a IA consegue fundamentar uma resposta no seu documento, o DockDocs mostra o trecho de origem e sinaliza o que não pode rastrear; nem toda resposta terá uma citação.",
  fr: "Lorsque l'IA peut ancrer une réponse dans votre document, DockDocs montre le passage source et signale ce qu'elle ne peut pas tracer ; toutes les réponses n'auront pas de citation.",
  ja: "AI が回答をあなたの文書に根拠づけられる場合、DockDocs は該当する原文箇所を示し、たどれない部分は明示します——すべての回答に出典が付くわけではありません。",
  de: "Wenn die KI eine Antwort in Ihrem Dokument verankern kann, zeigt DockDocs die zugrunde liegende Quellstelle und weist darauf hin, was sich nicht belegen lässt – nicht jede Antwort erhält eine Quellenangabe.",
  // ko: AI-translated (no native reviewer yet) — commit-local, flag for native review.
  // Scoped per the honesty rule: 출처는 찾을 수 있을 때만 표시, 못 찾으면 명시 — NEVER "모든 답변에 출처".
  ko: "AI가 당신의 문서에서 답변의 근거를 찾을 수 있을 때 DockDocs는 그 근거가 된 원문 구절을 보여 주고, 추적할 수 없는 부분은 명확히 알려 줍니다 — 모든 답변에 출처가 표시되는 것은 아닙니다.",
};

/**
 * Brand slogan, per route locale — a value statement ("verify the answers"),
 * NOT a capability promise. This is the WHITELIST: "Verify every answer" is honest
 * even though it contains "every answer", because it tells the user to verify, it
 * does not claim the AI cites every answer. Keep distinct from CITATION_SCOPE.
 */
export const BRAND_SLOGAN: Record<RouteLocale, string> = {
  en: "Verify every answer.",
  zh: "逐一核验答案。",
  "zh-Hant": "逐一核驗答案。",
  es: "Verifica cada respuesta.",
  pt: "Verifique cada resposta.",
  fr: "Vérifiez chaque réponse.",
  ja: "すべての回答を検証。",
  de: "Prüfen Sie jede Antwort.",
  // ko: AI-translated (no native reviewer yet) — commit-local, flag for native review.
  ko: "모든 답변을 검증하세요.",
};
