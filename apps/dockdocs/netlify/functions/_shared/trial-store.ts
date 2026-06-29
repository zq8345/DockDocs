import { getStore } from "@netlify/blobs";

export type TrialRecord = {
  userId: string;
  plan: "PRO";
  startedAt: string;
  expiresAt: string;
  // status is informational; expiry is always decided by comparing expiresAt to now
  status: "trialing" | "expired";
};

const STORE_NAME = "dockdocs-billing";
const TRIAL_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

function trialKey(userId: string) {
  return `trials/by-user/${userId}.json`;
}

// Separate, never-deleted marker — persists even if the trial record is removed.
// Only this marker is checked for the "has the user ever trialed?" decision, so
// it can't be bypassed by deleting the trial record.
function trialUsedKey(userId: string) {
  return `trials/used/${userId}.json`;
}

function getTrialStore() {
  return getStore({ name: STORE_NAME, consistency: "strong" });
}

// Returns true if this userId has EVER started a trial. Fails CLOSED on a store
// error (a blob outage must not hand out unlimited re-trials to the same account).
export async function hasUsedTrial(userId: string): Promise<boolean> {
  try {
    const marker = await getTrialStore().get(trialUsedKey(userId), {
      type: "json",
    });
    return marker !== null;
  } catch {
    return true; // fail closed — deny on uncertainty
  }
}

export async function readTrialByUserId(
  userId: string,
): Promise<TrialRecord | null> {
  try {
    return (await getTrialStore().get(trialKey(userId), {
      type: "json",
    })) as TrialRecord | null;
  } catch {
    return null; // fail open — a store hiccup must not revoke trial access
  }
}

// Write the used marker first (anti-abuse priority), then the trial record.
// If the trial record write fails after the marker is set, the user keeps their
// blocked state but has no trial — extremely unlikely; they can contact support.
export async function startTrial(userId: string): Promise<TrialRecord> {
  const store = getTrialStore();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + TRIAL_DURATION_MS);
  const record: TrialRecord = {
    userId,
    plan: "PRO",
    startedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    status: "trialing",
  };
  await store.setJSON(trialUsedKey(userId), { markedAt: now.toISOString() });
  await store.setJSON(trialKey(userId), record);
  return record;
}

// Returns true if the trial exists and has not yet expired.
export function isTrialActive(trial: TrialRecord): boolean {
  return (
    trial.status === "trialing" && new Date(trial.expiresAt) > new Date()
  );
}
