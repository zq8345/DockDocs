import {
  readSubscriptionRecord,
  type SubscriptionPlan,
} from "@/lib/subscription-runtime";

export type UsageFeature =
  | "chat"
  | "summary"
  | "ocr"
  | "compress"
  | "analyzer"
  | "contractAnalyzer";

export type UsagePeriod = "day" | "month";

export type UsageMetadata = {
  source?: string;
  documentId?: string;
  sessionId?: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
};

export type UsageCheck = {
  userId: string;
  feature: UsageFeature;
  plan: SubscriptionPlan;
  period: UsagePeriod;
  periodKey: string;
  used: number;
  limit: number;
  remaining: number;
  allowed: boolean;
  upgradeRequired: boolean;
  resetAt: string;
  storage: "localStorage" | "unavailable";
};

export type UsageRecord = {
  userId: string;
  feature: UsageFeature;
  plan: SubscriptionPlan;
  period: UsagePeriod;
  periodKey: string;
  count: number;
  updatedAt: string;
  events: UsageEvent[];
};

export type UsageEvent = UsageMetadata & {
  id: string;
  createdAt: string;
};

export const meteredFeatures: UsageFeature[] = [
  "chat",
  "summary",
  "ocr",
  "compress",
  "analyzer",
  "contractAnalyzer",
];

const prefix = "dockdocs:usage";
const maxEventsPerRecord = 50;

const featureAliases: Record<string, UsageFeature> = {
  chat: "chat",
  chatPdf: "chat",
  "chat-pdf": "chat",
  "chat-with-pdf": "chat",
  summary: "summary",
  aiSummary: "summary",
  "ai-summary": "summary",
  ocr: "ocr",
  "ocr-pdf": "ocr",
  compress: "compress",
  "compress-pdf": "compress",
  analyzer: "analyzer",
  documentAnalyzer: "analyzer",
  "document-analyzer": "analyzer",
  contractAnalyzer: "contractAnalyzer",
  "contract-analyzer": "contractAnalyzer",
};

const featureLimits: Record<
  SubscriptionPlan,
  Record<UsageFeature, { limit: number; period: UsagePeriod }>
> = {
  FREE: {
    chat: { limit: 5, period: "day" },
    summary: { limit: 5, period: "day" },
    ocr: { limit: 10, period: "day" },
    compress: { limit: 20, period: "day" },
    analyzer: { limit: 5, period: "day" },
    contractAnalyzer: { limit: 5, period: "day" },
  },
  PLUS: {
    chat: { limit: 500, period: "month" },
    summary: { limit: 500, period: "month" },
    ocr: { limit: 500, period: "month" },
    compress: { limit: 1000, period: "month" },
    analyzer: { limit: 500, period: "month" },
    contractAnalyzer: { limit: 500, period: "month" },
  },
  PRO: {
    chat: { limit: 5000, period: "month" },
    summary: { limit: 5000, period: "month" },
    ocr: { limit: 5000, period: "month" },
    compress: { limit: 10000, period: "month" },
    analyzer: { limit: 5000, period: "month" },
    contractAnalyzer: { limit: 5000, period: "month" },
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

export async function canUseFeature(
  userId: string,
  feature: UsageFeature | string,
): Promise<UsageCheck> {
  const normalizedFeature = requireUsageFeature(feature);
  const normalizedUserId = normalizeUserId(userId);
  const subscription = readSubscriptionRecord(normalizedUserId);
  const config = readFeatureLimit(subscription.plan, normalizedFeature);
  const periodKey = createPeriodKey(config.period);
  const record = readUsageRecord(
    normalizedUserId,
    normalizedFeature,
    subscription.plan,
    config.period,
    periodKey,
  );
  const remaining = Math.max(0, config.limit - record.count);

  return {
    userId: normalizedUserId,
    feature: normalizedFeature,
    plan: subscription.plan,
    period: config.period,
    periodKey,
    used: record.count,
    limit: config.limit,
    remaining,
    allowed: remaining > 0,
    upgradeRequired: remaining <= 0,
    resetAt: createResetAt(config.period),
    storage: canUseStorage() ? "localStorage" : "unavailable",
  };
}

export async function recordUsage(
  userId: string,
  feature: UsageFeature | string,
  metadata: UsageMetadata = {},
): Promise<UsageCheck> {
  const before = await canUseFeature(userId, feature);
  if (!canUseStorage()) {
    return before;
  }

  const record = readUsageRecord(
    before.userId,
    before.feature,
    before.plan,
    before.period,
    before.periodKey,
  );
  const nextRecord: UsageRecord = {
    ...record,
    count: record.count + 1,
    updatedAt: new Date().toISOString(),
    events: [
      createUsageEvent(metadata),
      ...record.events,
    ].slice(0, maxEventsPerRecord),
  };

  writeJson(usageKey(before.userId, before.feature, before.period, before.periodKey), nextRecord);
  return canUseFeature(before.userId, before.feature);
}

export function readUsageRecord(
  userId: string,
  feature: UsageFeature,
  plan = readSubscriptionRecord(normalizeUserId(userId)).plan,
  period = readFeatureLimit(plan, feature).period,
  periodKey = createPeriodKey(period),
): UsageRecord {
  const normalizedUserId = normalizeUserId(userId);
  const record = readJson<UsageRecord | null>(
    usageKey(normalizedUserId, feature, period, periodKey),
    null,
  );

  if (record && isUsageRecord(record)) {
    return record;
  }

  return {
    userId: normalizedUserId,
    feature,
    plan,
    period,
    periodKey,
    count: 0,
    updatedAt: new Date().toISOString(),
    events: [],
  };
}

function requireUsageFeature(feature: UsageFeature | string): UsageFeature {
  const normalizedFeature = normalizeUsageFeature(feature);
  if (!normalizedFeature) {
    throw new Error(`Unsupported metered feature: ${feature}`);
  }

  return normalizedFeature;
}

function createUsageEvent(metadata: UsageMetadata): UsageEvent {
  return {
    id: createRecordId(),
    createdAt: new Date().toISOString(),
    ...metadata,
  };
}

function normalizeUserId(userId: string) {
  return userId || "anonymous";
}

function usageKey(
  userId: string,
  feature: UsageFeature,
  period: UsagePeriod,
  periodKey: string,
) {
  return `${prefix}:${userId}:${feature}:${period}:${periodKey}`;
}

function createPeriodKey(period: UsagePeriod) {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  return period === "day" ? `${year}-${month}-${day}` : `${year}-${month}`;
}

function createResetAt(period: UsagePeriod) {
  const now = new Date();
  if (period === "day") {
    return new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
    )).toISOString();
  }

  return new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth() + 1,
    1,
  )).toISOString();
}

function createRecordId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isUsageRecord(value: unknown): value is UsageRecord {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as UsageRecord;
  return (
    typeof record.userId === "string" &&
    isUsageMeteredFeature(record.feature) &&
    typeof record.count === "number" &&
    Array.isArray(record.events)
  );
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) {
    return fallback;
  }

  try {
    return JSON.parse(window.localStorage.getItem(key) || "") as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}
