// Pure, environment-agnostic usage limits + helpers.
//
// This module holds ONLY data and pure functions (no window, no Supabase, no
// React) so it can be imported from BOTH the client metering runtime
// (lib/usage-runtime.ts, localStorage) AND server-side Netlify functions
// (netlify/functions/_shared/feature-gate.ts, Netlify Blobs). It is the single
// source of truth for per-plan feature caps — change a limit here and both the
// client nudge and the server-enforced gate move together.

import type { SubscriptionPlan } from "@/lib/subscription-runtime";

export type UsageFeature =
  | "chat"
  | "summary"
  | "translate"
  | "ocr"
  | "compress"
  | "analyzer"
  | "contractAnalyzer"
  | "compare"
  | "convert"
  | "convertFree";

export type UsagePeriod = "day" | "month";

export const meteredFeatures: UsageFeature[] = [
  "chat",
  "summary",
  "translate",
  "ocr",
  "compress",
  "analyzer",
  "contractAnalyzer",
  "compare",
  "convert",
  "convertFree",
];

export const featureAliases: Record<string, UsageFeature> = {
  chat: "chat",
  chatPdf: "chat",
  "chat-pdf": "chat",
  "chat-with-pdf": "chat",
  summary: "summary",
  aiSummary: "summary",
  "ai-summary": "summary",
  translate: "translate",
  translatePdf: "translate",
  "translate-pdf": "translate",
  ocr: "ocr",
  "ocr-pdf": "ocr",
  compress: "compress",
  "compress-pdf": "compress",
  analyzer: "analyzer",
  documentAnalyzer: "analyzer",
  "document-analyzer": "analyzer",
  contractAnalyzer: "contractAnalyzer",
  "contract-analyzer": "contractAnalyzer",
  "contract-risk": "contractAnalyzer",
  "contract-review": "contractAnalyzer",
  compare: "compare",
  "compare-docs": "compare",
  // Conversion meters. NOTE: server enforcement is by the literal feature key the 3
  // endpoints pass to enforceFeatureGate — these aliases drive client/doc consistency,
  // not the server gate. Option-C split: forward $0 self-hosted-Gotenberg routes →
  // "convertFree" (high fair-use, no real cost); paid CloudConvert routes (reverse
  // pdf→Office, >5MB fallback) keep the low "convert".
  convert: "convert",
  convertFree: "convertFree",
  "word-to-pdf": "convertFree",   // forward · $0 gotenberg
  "ppt-to-pdf": "convertFree",    // forward · $0 gotenberg
  "excel-to-pdf": "convertFree",  // forward · $0 gotenberg
  "html-to-pdf": "convertFree",   // forward · $0 gotenberg
  "pdf-to-pdfa": "convertFree",   // forward · $0 gotenberg pdfengines
  "pdf-to-word": "convert",       // reverse ($, OSS box + CC fallback)
  "pdf-to-excel": "convert",      // reverse ($, OSS box + CC fallback)
  "pdf-to-ppt": "convert",        // reverse ($, CloudConvert only)
  // ⚠️ protect-pdf is CLIENT-SIDE (@cantoo/pdf-lib pdfDoc.encrypt; pdf-runtime.ts:204/898,
  // git 683c139). The encryption never hits a server, so this alias NEVER fires the gate —
  // it's vestigial (kept for map completeness). It is NOT a CloudConvert route. (This stale
  // "server route" comment was the source of the 2026-06-22 false-server-side copy regression.)
  "protect-pdf": "convert",
};

// Two active tiers: FREE and PRO. PLUS has no active users; feature-gate.ts
// normalizes any unknown plan value to FREE before calling readFeatureLimit.
export const featureLimits: Record<
  "FREE" | "PRO",
  Record<UsageFeature, { limit: number; period: UsagePeriod }>
> = {
  FREE: {
    // Free daily caps, ALIGNED to the published tier-config.ts table (payment is live →
    // these are the enforced free tier, server-side here; the client meter is a UX nudge):
    //   ai-standard (chat/summary/translate/analyzer) = 10/day
    //   ai-hero (contractAnalyzer/compare)            = 3/day
    chat: { limit: 10, period: "day" },
    summary: { limit: 10, period: "day" },
    translate: { limit: 10, period: "day" },
    ocr: { limit: 15, period: "day" },
    compress: { limit: 30, period: "day" },
    analyzer: { limit: 10, period: "day" },
    contractAnalyzer: { limit: 3, period: "day" },
    compare: { limit: 3, period: "day" },
    // UI shows "10/day" for conversions (Joe 2026-07-03). Flat daily cap across
    // both CloudConvert (convert) and Gotenberg (convertFree) directions.
    convert: { limit: 10, period: "day" },
    convertFree: { limit: 10, period: "day" },
  },
  PRO: {
    // ai-standard = Unlimited (fair use): a high fair-use ceiling that bounds only
    // scripted abuse, effectively uncapped for any human. ai-hero (contractAnalyzer/
    // compare) keeps the ~5000/mo soft cap; ocr/compress/convert unchanged.
    chat: { limit: 100000, period: "month" },
    summary: { limit: 100000, period: "month" },
    translate: { limit: 100000, period: "month" },
    ocr: { limit: 5000, period: "month" },
    compress: { limit: 10000, period: "month" },
    analyzer: { limit: 100000, period: "month" },
    contractAnalyzer: { limit: 5000, period: "month" },
    compare: { limit: 5000, period: "month" },
    convert: { limit: 15000, period: "month" },
    convertFree: { limit: 100000, period: "month" },
  },
};

export function isUsageMeteredFeature(feature: string): feature is UsageFeature {
  return Boolean(normalizeUsageFeature(feature));
}

export function normalizeUsageFeature(feature: string): UsageFeature | null {
  return featureAliases[feature] ?? null;
}

export function readFeatureLimit(plan: SubscriptionPlan, feature: UsageFeature) {
  return featureLimits[plan][feature];
}

// UTC-keyed period buckets — identical math on client and server so the two
// agree on which day/month a request falls in regardless of timezone.
export function createPeriodKey(period: UsagePeriod) {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  return period === "day" ? `${year}-${month}-${day}` : `${year}-${month}`;
}

export function createResetAt(period: UsagePeriod) {
  const now = new Date();
  if (period === "day") {
    return new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
    ).toISOString();
  }

  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
  ).toISOString();
}
