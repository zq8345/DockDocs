import type { HTMLAttributes, ReactNode } from "react";
import type { DockTone } from "@/components/ui/tokens";

type StatusVariant = "soft" | "outline" | "solid";
type StatusCategory = "core" | "data" | "document" | "agent";

export const dockStatusGroups = {
  core: ["Active", "Blocked", "Completed", "QA", "Merged", "Production", "Backlog"],
  data: ["Live", "Example", "Local", "Synced", "Session-only", "Saved"],
  document: ["PDF", "Uploaded", "Parsed", "Source", "Citation", "Exported"],
  agent: ["Ready", "Active", "Idle", "Blocked", "Needs Review"],
} as const satisfies Record<StatusCategory, readonly string[]>;

export type DockCoreStatus = (typeof dockStatusGroups.core)[number];
export type DockDataStatus = (typeof dockStatusGroups.data)[number];
export type DockDocumentStatus = (typeof dockStatusGroups.document)[number];
export type DockAgentStatus = (typeof dockStatusGroups.agent)[number];
export type DockStatusLabel =
  | DockCoreStatus
  | DockDataStatus
  | DockDocumentStatus
  | DockAgentStatus;

type StatusProps = HTMLAttributes<HTMLSpanElement> & {
  children?: ReactNode;
  "data-testid"?: string;
  label?: string;
  status?: DockStatusLabel | string;
  tone?: DockTone;
  variant?: StatusVariant;
};

const baseClass =
  "inline-flex min-h-7 shrink-0 items-center rounded-[var(--radius-sm)] border px-2.5 text-xs font-semibold";

const toneVariantClasses: Record<DockTone, Record<StatusVariant, string>> = {
  neutral: {
    soft: "border-[color:var(--line)] bg-[color:var(--surface-subtle)] text-[color:var(--muted)]",
    outline: "border-[color:var(--line)] bg-transparent text-[color:var(--foreground)]",
    solid: "border-[color:var(--foreground)] bg-[color:var(--foreground)] text-[color:var(--background)]",
  },
  accent: {
    soft: "border-[color:var(--soft-accent)] bg-[color:var(--soft-accent)] text-[color:var(--accent-strong)]",
    outline: "border-[color:var(--accent)] bg-transparent text-[color:var(--accent)]",
    solid: "border-[color:var(--accent)] bg-[color:var(--accent)] text-white",
  },
  success: {
    soft: "border-[color:var(--success-line)] bg-[color:var(--success-surface)] text-[color:var(--success)]",
    outline: "border-[color:var(--success-line)] bg-transparent text-[color:var(--success)]",
    solid: "border-[color:var(--success)] bg-[color:var(--success)] text-white",
  },
  warning: {
    soft: "border-[color:var(--warning-line)] bg-[color:var(--warning-surface)] text-[color:var(--warning)]",
    outline: "border-[color:var(--warning-line)] bg-transparent text-[color:var(--warning)]",
    solid: "border-[color:var(--warning)] bg-[color:var(--warning)] text-white",
  },
  error: {
    soft: "border-[color:var(--error-line)] bg-[color:var(--error-surface)] text-[color:var(--error)]",
    outline: "border-[color:var(--error-line)] bg-transparent text-[color:var(--error)]",
    solid: "border-[color:var(--error)] bg-[color:var(--error)] text-white",
  },
};

const statusToneMap: Record<string, DockTone> = {
  Active: "success",
  Blocked: "error",
  Completed: "success",
  QA: "warning",
  Merged: "success",
  Production: "success",
  Backlog: "neutral",
  Live: "success",
  Example: "warning",
  Local: "warning",
  Synced: "success",
  "Session-only": "warning",
  Saved: "success",
  PDF: "accent",
  Uploaded: "success",
  Parsed: "success",
  Source: "neutral",
  Citation: "accent",
  Exported: "success",
  Ready: "success",
  Idle: "neutral",
  "Needs Review": "warning",
};

const statusAliases: Record<string, DockStatusLabel> = {
  active: "Active",
  blocked: "Blocked",
  completed: "Completed",
  done: "Completed",
  qa: "QA",
  merged: "Merged",
  production: "Production",
  "in production": "Production",
  backlog: "Backlog",
  live: "Live",
  example: "Example",
  local: "Local",
  synced: "Synced",
  saved: "Saved",
  session: "Session-only",
  "session-only": "Session-only",
  pdf: "PDF",
  uploaded: "Uploaded",
  parsed: "Parsed",
  extracted: "Parsed",
  source: "Source",
  citation: "Citation",
  exported: "Exported",
  ready: "Ready",
  idle: "Idle",
  review: "Needs Review",
  "needs review": "Needs Review",
  "进行中": "Active",
  "已阻塞": "Blocked",
  "阻塞": "Blocked",
  "已完成": "Completed",
  "已合并": "Merged",
  "生产中": "Production",
  "已上线": "Production",
  "观察": "Needs Review",
  "就绪": "Ready",
  "等待中": "Backlog",
  "执行中": "Active",
  "失败": "Blocked",
  "已跳过": "Backlog",
  "已保存": "Saved",
  "本地": "Local",
  "已同步": "Synced",
};

export function normalizeStatusLabel(label?: string | null): DockStatusLabel | null {
  if (!label) {
    return null;
  }

  const trimmed = label.trim();
  if (trimmed in statusToneMap) {
    return trimmed as DockStatusLabel;
  }

  const lower = trimmed.toLowerCase();
  if (statusAliases[lower]) {
    return statusAliases[lower];
  }

  const matchedAlias = Object.entries(statusAliases).find(([alias]) =>
    lower.includes(alias),
  );

  return matchedAlias?.[1] || null;
}

export function getStatusTone(label?: string | null): DockTone {
  const normalized = normalizeStatusLabel(label);

  if (normalized) {
    return statusToneMap[normalized] || "neutral";
  }

  return "neutral";
}

export function Status({
  children,
  className = "",
  label,
  status,
  tone,
  variant = "soft",
  "data-testid": testId,
  ...props
}: StatusProps) {
  const displayLabel = label || status;
  const resolvedTone = tone || getStatusTone(String(status || displayLabel || ""));

  return (
    <span
      data-testid={testId || "dock-status"}
      className={[baseClass, toneVariantClasses[resolvedTone][variant], className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children || displayLabel}
    </span>
  );
}

export function StatusBadge(props: StatusProps) {
  return <Status {...props} />;
}
