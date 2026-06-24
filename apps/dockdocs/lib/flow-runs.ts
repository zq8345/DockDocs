"use client";

// Flow run history — Phase A (localStorage) + Phase B (Supabase sync).
// Phase B activates only when the user has opted into the private workspace.
// localStorage is always the source of truth; Supabase is a best-effort mirror.

import { supabase } from "@/lib/supabase";

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

  // Phase B: mirror to Supabase if user opted in. Fire-and-forget.
  void syncRunInsert(next);

  return next;
}

export function relativeTime(iso: string, locale: "en" | "zh" | "es" | "pt" | "fr" | "ja" | "de"): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (locale === "ja") {
    if (mins < 1) return "たった今";
    if (mins < 60) return `${mins}分前`;
    if (hours < 24) return `${hours}時間前`;
    return `${days}日前`;
  }
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
  if (locale === "pt") {
    if (mins < 1) return "agora";
    if (mins < 60) return `há ${mins} min`;
    if (hours < 24) return `há ${hours} h`;
    return `há ${days} dia${days > 1 ? "s" : ""}`;
  }
  if (locale === "fr") {
    if (mins < 1) return "à l'instant";
    if (mins < 60) return `il y a ${mins} min`;
    if (hours < 24) return `il y a ${hours} h`;
    return `il y a ${days} jour${days > 1 ? "s" : ""}`;
  }
  if (locale === "de") {
    if (mins < 1) return "gerade eben";
    if (mins < 60) return `vor ${mins} Min.`;
    if (hours < 24) return `vor ${hours} Std.`;
    return `vor ${days} Tag${days > 1 ? "en" : ""}`;
  }
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

// ── Phase B helpers ────────────────────────────────────────────────────────

async function isFlowOptedIn(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;
    if (data.user.user_metadata?.flow_optin !== true) return null;
    return data.user.id;
  } catch {
    return null;
  }
}

async function syncRunInsert(run: FlowRun): Promise<void> {
  const userId = await isFlowOptedIn();
  if (!userId) return;
  try {
    await supabase.from("flow_runs").insert({
      id: run.id,
      user_id: userId,
      template_id: run.templateId,
      template_name: run.templateName,
      file_names: run.fileNames,
      doc_type: run.docType,
      status: run.status,
      error: run.error ?? null,
      created_at: run.createdAt,
    });
  } catch {
    // Best-effort.
  }
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
