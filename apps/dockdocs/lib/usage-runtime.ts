import {
  readEffectiveSubscriptionRecord,
  readSubscriptionRecord,
  type SubscriptionPlan,
} from "@/lib/subscription-runtime";
import {
  createPeriodKey,
  createResetAt,
  isUsageMeteredFeature,
  meteredFeatures,
  normalizeUsageFeature,
  readFeatureLimit,
  type UsageFeature,
  type UsagePeriod,
} from "@/lib/usage-limits";

// Re-export the shared limits surface so existing `@/lib/usage-runtime`
// importers keep working unchanged after the extraction to usage-limits.ts.
export {
  isUsageMeteredFeature,
  meteredFeatures,
  normalizeUsageFeature,
  readFeatureLimit,
};
export type { UsageFeature, UsagePeriod };

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

const prefix = "dockdocs:usage";
const maxEventsPerRecord = 50;

export async function canUseFeature(
  userId: string,
  feature: UsageFeature | string,
): Promise<UsageCheck> {
  const normalizedFeature = requireUsageFeature(feature);
  const normalizedUserId = normalizeUserId(userId);
  const subscription = await readEffectiveSubscriptionRecord(normalizedUserId);
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
