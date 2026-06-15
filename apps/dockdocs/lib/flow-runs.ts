"use client";

// Flow run history — Phase A (localStorage).
// Records each compare-extract execution triggered by a saved template,
// so users can see when they last ran a template and with which files.
// Phase B will persist these to Supabase document_texts / pipeline_runs.

export type FlowRun = {
  id: string;
  templateId: string;
  templateName: string;
  fileNames: string[];
  docType: string;
  status: "ok" | "error";
  createdAt: string;
  error?: string;
};

const KEY = "dockdocs:flow-runs";
const MAX_RUNS = 30;

export function loadRuns(): FlowRun[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isRun);
  } catch {
    return [];
  }
}

export function loadRunsForTemplate(templateId: string): FlowRun[] {
  return loadRuns().filter((r) => r.templateId === templateId);
}

export function saveRun(run: Omit<FlowRun, "id" | "createdAt">): FlowRun {
  const next: FlowRun = {
    id: `run_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    ...run,
  };
  const existing = loadRuns();
  const updated = [next, ...existing].slice(0, MAX_RUNS);
  localStorage.setItem(KEY, JSON.stringify(updated));
  return next;
}

export function relativeTime(iso: string, locale: "en" | "zh" | "es"): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (locale === "zh") {
    if (mins < 1) return "刚刚";
    if (mins < 60) return `${mins} 分钟前`;
    if (hours < 24) return `${hours} 小时前`;
    return `${days} 天前`;
  }
  if (locale === "es") {
    if (mins < 1) return "ahora mismo";
    if (mins < 60) return `hace ${mins} min`;
    if (hours < 24) return `hace ${hours} h`;
    return `hace ${days} día${days > 1 ? "s" : ""}`;
  }
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function isRun(x: unknown): x is FlowRun {
  if (!x || typeof x !== "object") return false;
  const r = x as Record<string, unknown>;
  return (
    typeof r.id === "string" &&
    typeof r.templateId === "string" &&
    typeof r.templateName === "string" &&
    Array.isArray(r.fileNames) &&
    typeof r.docType === "string" &&
    typeof r.createdAt === "string"
  );
}
