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

export interface Alert {
  level: "critical" | "warning" | "info";
  source: string; // which job triggered this
  message: string;
  action: string; // what to do
}

export interface MissionControlData {
  generatedAt: string;
  seoGeo: SeoGeoMetrics;
  cronJobs: CronJobStatus[];
  alerts: Alert[];
}

// Default empty state — shown when no data yet
export const emptyMissionControlData: MissionControlData = {
  generatedAt: new Date().toISOString(),
  seoGeo: {
    aiCitationRate: { current: 0, outOf: 10, previous: 0, delta: 0 },
    healthScore: 0,
    contentProducedToday: 0,
    externalMentions: 0,
    pagesLive: 0,
    pagesHealthy: 0,
  },
  cronJobs: [],
  alerts: [],
};
