// Mission Control — 控制台数据模型
// 数据由 dock-automation-tools/mission-control-report.mjs 生成(全真实数据，无硬编码)
// 写入 public/mission-control-data.json，前端每隔几分钟拉取一次。

export type TaskStatus = "ok" | "stale" | "missing" | "pending";
export type AlertLevel = "error" | "warn" | "info";
export type SystemStatus = "ok" | "warn" | "error";

export interface TaskState {
  name: string;
  lastRun: string | null;
  ageHours: number | null;
  status: TaskStatus;
}

export interface Metrics {
  healthScore: number | null;
  pagesLive: number | null;
  pagesHealthy: number | null;
  pagesError: number | null;
  gscClicks: number | null;
  gscImpressions: number | null;
  externalMentions: number | null;
}

export interface Opportunity {
  query: string;
  impressions: number;
  clicks: number;
  ctr: number;       // 百分比，如 1.8 表示 1.8%
  position: number;
}

export interface AlertItem {
  level: AlertLevel;
  source: string;
  message: string;
}

export interface MissionControlData {
  generatedAt: string;
  systemStatus: SystemStatus;
  tasks: TaskState[];
  metrics: Metrics;
  opportunities: Opportunity[];
  recentPages: string[];
  alerts: AlertItem[];
}

// 北京时间(Asia/Shanghai)，精确到秒
export function fmtBeijing(iso: string): string {
  const t = Date.parse(iso);
  if (!iso || Number.isNaN(t)) return "时间未知";
  return new Date(t).toLocaleString("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

// 相对时间(中文)
export function relativeCN(iso: string, nowMs: number): string {
  const t = Date.parse(iso);
  if (!iso || Number.isNaN(t)) return "时间未知";
  const min = Math.floor(Math.max(0, nowMs - t) / 60_000);
  if (min < 1) return "刚刚";
  if (min < 60) return `${min} 分钟前`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} 小时前`;
  return `${Math.floor(h / 24)} 天前`;
}

// 数字展示：null → 占位符
export function num(n: number | null | undefined, fallback = "—"): string {
  return n == null ? fallback : n.toLocaleString("zh-CN");
}
