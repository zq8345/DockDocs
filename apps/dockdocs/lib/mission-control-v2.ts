// Mission Control v2 — live SEO/GEO dashboard data model
// Auto-updated by Mission Control Reporter cron job (every 6h)

export interface CronJobStatus {
  name: string;
  schedule: string;
  lastRun: string | null;
  lastStatus: "success" | "error" | "running" | "pending";
  nextRun: string;
  summary: string;
}

export interface SeoGeoMetrics {
  aiCitationRate: { current: number; outOf: number; previous: number; delta: number };
  healthScore: number; // 0-100
  contentProducedToday: number;
  externalMentions: number;
  pagesLive: number;
  pagesHealthy: number;
}

export interface AnalyticsData {
  todayPageViews: number;
  todayVisitors: number;
  weekPageViews: number;
  weekVisitors: number;
  topPages: Array<{ path: string; views: number }>;
  registeredUsers: number;
  payingUsers: number;
  conversionRate: string;
}

export interface Alert {
  level: "critical" | "warning" | "info";
  source: string;
  message: string;
  action: string;
}

export interface MissionControlData {
  generatedAt: string;
  seoGeo: SeoGeoMetrics;
  analytics: AnalyticsData;
  cronJobs: CronJobStatus[];
  alerts: Alert[];
}

// Default empty state — shown when no data yet.
// generatedAt is intentionally blank so freshness resolves to "unknown"
// (a real fetch always carries a timestamp).
export const emptyMissionControlData: MissionControlData = {
  generatedAt: "",
  seoGeo: {
    aiCitationRate: { current: 0, outOf: 10, previous: 0, delta: 0 },
    healthScore: 0,
    contentProducedToday: 0,
    externalMentions: 0,
    pagesLive: 0,
    pagesHealthy: 0,
  },
  analytics: {
    todayPageViews: 0,
    todayVisitors: 0,
    weekPageViews: 0,
    weekVisitors: 0,
    topPages: [],
    registeredUsers: 0,
    payingUsers: 0,
    conversionRate: "0%",
  },
  cronJobs: [],
  alerts: [],
};

// ── Derived data-flow helpers (pure, UI-agnostic) ──

export type FreshnessLevel = "fresh" | "stale" | "critical" | "unknown";

// Classify how old the snapshot is. The Reporter cron runs every 6h, so a
// healthy snapshot is < 8h old; 8–24h is stale; > 24h means the pipeline stalled.
export function getFreshness(
  generatedAt: string,
  nowMs: number,
): { level: FreshnessLevel; ageMs: number | null } {
  const t = Date.parse(generatedAt);
  if (!generatedAt || Number.isNaN(t)) return { level: "unknown", ageMs: null };
  const ageMs = Math.max(0, nowMs - t);
  const ageHours = ageMs / 3_600_000;
  if (ageHours <= 8) return { level: "fresh", ageMs };
  if (ageHours <= 24) return { level: "stale", ageMs };
  return { level: "critical", ageMs };
}

export type JobCategory = "failed" | "overdue" | "upcoming";

export function classifyJob(job: CronJobStatus, nowMs: number): JobCategory {
  if (job.lastStatus === "error") return "failed";
  const next = Date.parse(job.nextRun);
  if (!Number.isNaN(next) && next < nowMs) return "overdue";
  return "upcoming";
}

const CATEGORY_ORDER: Record<JobCategory, number> = { failed: 0, overdue: 1, upcoming: 2 };

// Sort jobs failed → overdue → upcoming, then by soonest next run within a group.
export function sortJobs(
  jobs: CronJobStatus[],
  nowMs: number,
): Array<{ job: CronJobStatus; category: JobCategory }> {
  return jobs
    .map((job) => ({ job, category: classifyJob(job, nowMs) }))
    .sort((a, b) => {
      const byCategory = CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category];
      if (byCategory !== 0) return byCategory;
      return (Date.parse(a.job.nextRun) || 0) - (Date.parse(b.job.nextRun) || 0);
    });
}
