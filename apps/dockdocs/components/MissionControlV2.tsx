"use client";

import { useEffect, useState } from "react";
import type { MissionControlData } from "@/lib/mission-control-v2";
import { emptyMissionControlData } from "@/lib/mission-control-v2";

function StatCard({
  label,
  value,
  sub,
  tone = "neutral",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "success" | "warning" | "danger" | "neutral";
}) {
  const colors = {
    success: "text-emerald-400",
    warning: "text-amber-400",
    danger: "text-red-400",
    neutral: "text-[color:var(--foreground)]",
  };
  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--muted)]">
        {label}
      </p>
      <p className={`mt-2 text-[28px] font-semibold tracking-tight ${colors[tone]}`}>
        {value}
      </p>
      {sub && (
        <p className="mt-1 text-[12px] text-[color:var(--muted)]">{sub}</p>
      )}
    </div>
  );
}

function CronJobRow({ job }: { job: MissionControlData["cronJobs"][number] }) {
  const statusColors: Record<string, string> = {
    success: "bg-emerald-500/20 text-emerald-400",
    error: "bg-red-500/20 text-red-400",
    running: "bg-blue-500/20 text-blue-400",
    pending: "bg-[color:var(--line)] text-[color:var(--muted)]",
  };
  return (
    <div className="flex items-center justify-between gap-4 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-[color:var(--foreground)] truncate">
          {job.name}
        </p>
        <p className="text-[11px] text-[color:var(--muted)]">{job.schedule}</p>
        {job.summary && (
          <p className="mt-0.5 text-[12px] text-[color:var(--muted)] truncate">
            {job.summary}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-[11px] text-[color:var(--muted)]">
          {job.lastRun
            ? new Date(job.lastRun).toLocaleTimeString("zh-CN", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "—"}
        </span>
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            statusColors[job.lastStatus]
          }`}
        >
          {job.lastStatus === "success"
            ? "✓"
            : job.lastStatus === "error"
              ? "✗"
              : job.lastStatus === "running"
                ? "●"
                : "○"}
        </span>
      </div>
    </div>
  );
}

function AlertCard({ alert }: { alert: MissionControlData["alerts"][number] }) {
  const styles = {
    critical: "border-red-500/30 bg-red-500/5",
    warning: "border-amber-500/30 bg-amber-500/5",
    info: "border-blue-500/30 bg-blue-500/5",
  };
  const icons = {
    critical: "🔴",
    warning: "🟡",
    info: "🔵",
  };
  return (
    <div
      className={`rounded-[var(--radius)] border px-4 py-3 ${styles[alert.level]}`}
    >
      <div className="flex items-start gap-2">
        <span className="text-sm">{icons[alert.level]}</span>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-[color:var(--foreground)]">
            {alert.message}
          </p>
          <p className="mt-0.5 text-[12px] text-[color:var(--muted)]">
            来源: {alert.source}
          </p>
          <p className="mt-1.5 text-[13px] text-[color:var(--accent)] font-medium">
            → {alert.action}
          </p>
        </div>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid gap-3 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-[104px] rounded-[var(--radius-lg)] bg-[color:var(--line)]"
          />
        ))}
      </div>
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-[52px] rounded-[var(--radius)] bg-[color:var(--line)]"
          />
        ))}
      </div>
    </div>
  );
}

export function MissionControlV2() {
  const [data, setData] = useState<MissionControlData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/mission-control-data.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json: MissionControlData) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        setData(emptyMissionControlData);
        setError("数据文件尚未生成，显示默认面板。首次数据将在 Mission Control Reporter 运行后出现。");
        setLoading(false);
      });
  }, []);

  if (loading) return <Skeleton />;

  const m = data ?? emptyMissionControlData;
  const isEmpty = m.cronJobs.length === 0;

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--accent)]">
            DockDocs · Mission Control v2
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[color:var(--foreground)]">
            SEO / GEO 实时面板
          </h1>
        </div>
        <p className="text-[12px] text-[color:var(--muted)]">
          更新于{" "}
          {new Date(m.generatedAt).toLocaleString("zh-CN", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      {error && (
        <div className="mt-4 rounded-[var(--radius)] border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-[13px] text-amber-400">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <StatCard
          label="AI 引用率"
          value={
            isEmpty
              ? "—"
              : `${m.seoGeo.aiCitationRate.current}/${m.seoGeo.aiCitationRate.outOf}`
          }
          sub={
            m.seoGeo.aiCitationRate.delta !== 0
              ? `${m.seoGeo.aiCitationRate.delta > 0 ? "△" : "▽"} ${Math.abs(m.seoGeo.aiCitationRate.delta)} vs 上周`
              : "与上周持平"
          }
          tone={
            m.seoGeo.aiCitationRate.delta > 0
              ? "success"
              : m.seoGeo.aiCitationRate.delta < 0
                ? "danger"
                : "neutral"
          }
        />
        <StatCard
          label="站点健康"
          value={isEmpty ? "—" : `${m.seoGeo.healthScore}%`}
          tone={
            m.seoGeo.healthScore >= 90
              ? "success"
              : m.seoGeo.healthScore >= 70
                ? "warning"
                : "danger"
          }
        />
        <StatCard
          label="今日内容"
          value={isEmpty ? "—" : String(m.seoGeo.contentProducedToday)}
          sub="篇"
        />
        <StatCard
          label="外部提及"
          value={isEmpty ? "—" : String(m.seoGeo.externalMentions)}
          sub="次"
        />
      </div>

      {/* Alerts */}
      {m.alerts.length > 0 && (
        <section className="mt-8">
          <h2 className="text-[15px] font-semibold text-[color:var(--foreground)]">
            🔔 需要关注
          </h2>
          <div className="mt-3 space-y-2">
            {m.alerts.map((a, i) => (
              <AlertCard key={i} alert={a} />
            ))}
          </div>
        </section>
      )}

      {/* Cron Jobs */}
      <section className="mt-8">
        <h2 className="text-[15px] font-semibold text-[color:var(--foreground)]">
          🤖 自动化任务 ({m.cronJobs.length})
        </h2>
        {isEmpty ? (
          <p className="mt-3 text-[13px] text-[color:var(--muted)]">
            暂无任务数据。等待 Mission Control Reporter 首次运行。
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {m.cronJobs.map((job) => (
              <CronJobRow key={job.name} job={job} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
