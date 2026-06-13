import { getStore } from "@netlify/blobs";
import type { UsageFeature, UsagePeriod } from "../../../lib/usage-limits";

// Server-side usage counters in Netlify Blobs. This is the authoritative,
// non-bypassable counterpart to the client localStorage metering in
// lib/usage-runtime.ts — clearing localStorage or hitting the API directly no
// longer resets the count. Keyed by SUBJECT, which is `user:<id>` for signed-in
// callers and `ip:<addr>` for anonymous ones.
//
// Mirrors billing-store.ts: strong consistency, with an in-memory Map fallback
// so local/dev runs (no Blobs env) degrade gracefully rather than throwing.

type UsageCountRecord = {
  subjectId: string;
  feature: UsageFeature;
  period: UsagePeriod;
  periodKey: string;
  count: number;
  updatedAt: string;
};

const storeName = "dockdocs-usage";
const memory = new Map<string, unknown>();

export async function readUsageCount(
  subjectId: string,
  feature: UsageFeature,
  period: UsagePeriod,
  periodKey: string,
): Promise<number> {
  const record = await readJson<UsageCountRecord>(
    usageKey(subjectId, feature, period, periodKey),
  );
  return typeof record?.count === "number" && Number.isFinite(record.count)
    ? record.count
    : 0;
}

// Increment-after-success: callers invoke this only once the paid action
// actually succeeded, so timeouts/failures don't burn a user's quota. Returns
// the new count. Blobs has no atomic add; under concurrency this can slightly
// under-count (read-modify-write race), which is the safe direction for a gate.
export async function incrementUsageCount(
  subjectId: string,
  feature: UsageFeature,
  period: UsagePeriod,
  periodKey: string,
): Promise<number> {
  const current = await readUsageCount(subjectId, feature, period, periodKey);
  const next = current + 1;
  await writeJson(usageKey(subjectId, feature, period, periodKey), {
    subjectId,
    feature,
    period,
    periodKey,
    count: next,
    updatedAt: new Date().toISOString(),
  } satisfies UsageCountRecord);
  return next;
}

async function readJson<T>(key: string): Promise<T | null> {
  try {
    const store = getUsageStore();
    return (await store.get(key, { type: "json" })) as T | null;
  } catch {
    return (memory.get(key) as T | undefined) ?? null;
  }
}

async function writeJson(key: string, value: unknown) {
  memory.set(key, value);
  try {
    const store = getUsageStore();
    await store.setJSON(key, value);
  } catch {
    // No Blobs environment (local/dev) — the in-memory fallback above holds it.
  }
}

function getUsageStore() {
  return getStore({
    name: storeName,
    consistency: "strong",
  });
}

function usageKey(
  subjectId: string,
  feature: UsageFeature,
  period: UsagePeriod,
  periodKey: string,
) {
  // subjectId can contain ':' (user:<uuid> / ip:<addr>) — swap for '_' so the
  // blob key stays a clean path segment.
  const safeSubject = subjectId.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `usage/${safeSubject}/${feature}/${period}/${periodKey}.json`;
}
