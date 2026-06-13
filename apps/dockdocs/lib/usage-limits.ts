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
  | "compare";

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
  compare: "compare",
  "compare-docs": "compare",
};

export const featureLimits: Record<
  SubscriptionPlan,
  Record<UsageFeature, { limit: number; period: UsagePeriod }>
> = {
  FREE: {
    // Generous free daily caps: a soft upgrade nudge on top of the server-side
    // per-minute rate limit, not a hard wall. Bump again once payment is live so
    // the "upgrade" CTA actually leads somewhere.
    chat: { limit: 10, period: "day" },
    summary: { limit: 10, period: "day" },
    translate: { limit: 10, period: "day" },
    ocr: { limit: 15, period: "day" },
    compress: { limit: 30, period: "day" },
    analyzer: { limit: 10, period: "day" },
    contractAnalyzer: { limit: 10, period: "day" },
    compare: { limit: 3, period: "day" },
  },
  PLUS: {
    chat: { limit: 500, period: "month" },
    summary: { limit: 500, period: "month" },
    translate: { limit: 500, period: "month" },
    ocr: { limit: 500, period: "month" },
    compress: { limit: 1000, period: "month" },
    analyzer: { limit: 500, period: "month" },
    contractAnalyzer: { limit: 500, period: "month" },
    compare: { limit: 500, period: "month" },
  },
  PRO: {
    chat: { limit: 5000, period: "month" },
    summary: { limit: 5000, period: "month" },
    translate: { limit: 5000, period: "month" },
    ocr: { limit: 5000, period: "month" },
    compress: { limit: 10000, period: "month" },
    analyzer: { limit: 5000, period: "month" },
    contractAnalyzer: { limit: 5000, period: "month" },
    compare: { limit: 5000, period: "month" },
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
