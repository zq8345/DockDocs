"use client";

import { useEffect, useState } from "react";
import {
  type MissionControlData,
  type JobCategory,
  getFreshness,
  sortJobs,
} from "@/lib/mission-control-v2";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

/* ── Formatting helpers ── */

function fmtDate(iso: string): string {
  const t = Date.parse(iso);
  if (!iso || Number.isNaN(t)) return "—";
  return new Date(t).toLocaleString("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function relativeTime(fromIso: string, nowMs: number): string {
  const t = Date.parse(fromIso);
  if (!fromIso || Number.isNaN(t)) return "时间未知";
  const diff = Math.max(0, nowMs - t);
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "刚刚";
  if (min < 60) return `${min} 分钟前`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours} 小时前`;
  return `${Math.floor(hours / 24)} 天前`;
}

/* ── Shared mini components (kept) ── */

function StatusDot({ tone }: { tone: Tone }) {
  const c: Record<Tone, string> = {
    success: "bg-emerald-400",
    warning: "bg-amber-400",
    danger: "bg-red-400",
    info: "bg-blue-400",
    neutral: "bg-[color:var(--muted)]",
  };
  return <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${c[tone]}`} aria-hidden />;
}

function StatCard({
  label,
  value,
  sub,
  tone = "neutral",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: Tone;
}) {
  const c: Record<Tone, string> = {
    success: "text-emerald-400",
    warning: "text-amber-400",
    danger: "text-red-400",
    info: "text-blue-400",
    neutral: "text-[color:var(--foreground)]",
  };
  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--muted)]">{label}</p>
      <p className={`mt-2 text-[28px] font-semibold tracking-tight ${c[tone]}`}>{value}</p>
      {sub && <p className="mt-1 text-[12px] text-[color:var(--muted)]">{sub}</p>}
    </div>
  );
}

function Badge({ label, tone }: { label: string; tone: Tone }) {
  const c: Record<Tone, string> = {
    success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    warning: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    danger: "bg-red-500/15 text-red-400 border-red-500/30",
    info: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    neutral: "bg-[color:var(--line)] text-[color:var(--muted)] border-[color:var(--line)]",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${c[tone]}`}>
      {label}
    </span>
  );
}

function Skeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-5 py-10 sm:px-6">
      <div className="h-14 rounded-[var(--radius-lg)] bg-[color:var(--line)] animate-pulse" />
      <div className="grid gap-3 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-[104px] rounded-[var(--radius-lg)] bg-[color:var(--line)] animate-pulse" />
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-[200px] rounded-[var(--radius-lg)] bg-[color:var(--line)] animate-pulse" />
        ))}
      </div>
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-3">
      <h2 className="text-[15px] font-semibold text-[color:var(--foreground)]">{title}</h2>
      {subtitle && <p className="mt-0.5 text-[12px] text-[color:var(--muted)]">{subtitle}</p>}
    </div>
  );
}

function CronRow({
  job,
  tone,
  statusLabel,
}: {
  job: MissionControlData["cronJobs"][number];
  tone: Tone;
  statusLabel: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <StatusDot tone={tone} />
          <p className="truncate text-[13px] font-semibold text-[color:var(--foreground)]">{job.name}</p>
          <Badge label={job.schedule} tone="neutral" />
        </div>
        {job.summary && <p className="mt-1 text-[12px] text-[color:var(--muted)]">{job.summary}</p>}
      </div>
      <div className="shrink-0 text-right">
        <p className={`text-[12px] font-medium ${tone === "danger" ? "text-red-400" : tone === "warning" ? "text-amber-400" : "text-[color:var(--foreground)]"}`}>
          {statusLabel}
        </p>
        <p className="text-[11px] text-[color:var(--muted)]">{fmtDate(job.nextRun)}</p>
      </div>
    </div>
  );
}

function AlertRow({ alert }: { alert: MissionControlData["alerts"][number] }) {
  const box = {
    critical: "border-red-500/30 bg-red-500/5",
    warning: "border-amber-500/30 bg-amber-500/5",
    info: "border-blue-500/30 bg-blue-500/5",
  } as const;
  const dot: Record<typeof alert.level, Tone> = {
    critical: "danger",
    warning: "warning",
    info: "info",
  };
  return (
    <div className={`rounded-[var(--radius)] border px-4 py-3 ${box[alert.level]}`}>
      <div className="flex items-start gap-2.5">
        <span className="mt-1.5">
          <StatusDot tone={dot[alert.level]} />
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-[color:var(--foreground)]">{alert.message}</p>
          <p className="mt-0.5 text-[12px] text-[color:var(--muted)]">来源：{alert.source}</p>
          <p className="mt-1.5 text-[13px] font-medium text-[color:var(--accent)]">→ {alert.action}</p>
        </div>
      </div>
    </div>
  );
}

function QuickLinks() {
  const links = [
    { label: "网站首页", href: "https://dockdocs.app" },
    { label: "GitHub 仓库", href: "https://github.com/zq8345/dock-ai-ecosystem" },
    { label: "Sitemap", href: "https://dockdocs.app/sitemap.xml" },
    { label: "Netlify 控制台", href: "https://app.netlify.com" },
    { label: "阿里云 ECS", href: "https://ecs.console.aliyun.com" },
    { label: "DeepSeek 后台", href: "https://platform.deepseek.com" },
    { label: "Stripe Dashboard", href: "https://dashboard.stripe.com" },
  ];
  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
      <SectionTitle title="快捷入口" />
      <div className="mt-3 grid gap-1">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-[var(--radius)] px-3 py-2 text-[13px] text-[color:var(--muted)] transition hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)]"
          >
            {l.label}
            <span aria-hidden>↗</span>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ── State components ── */

function HeartbeatBanner({ generatedAt, nowMs }: { generatedAt: string; nowMs: number }) {
  const { level } = getFreshness(generatedAt, nowMs);
  const rel = relativeTime(generatedAt, nowMs);

  const variants = {
    fresh: {
      box: "border-emerald-500/30 bg-emerald-500/5",
      dot: "success" as Tone,
      title: "系统运行正常",
      detail: `数据 ${rel}更新 · Reporter 每 6h 同步`,
      titleColor: "text-emerald-400",
    },
    stale: {
      box: "border-amber-500/30 bg-amber-500/5",
      dot: "warning" as Tone,
      title: "数据可能过期",
      detail: `快照已超过 8 小时未刷新（${rel}）· 检查 Mission Control Reporter`,
      titleColor: "text-amber-400",
    },
    critical: {
      box: "border-red-500/30 bg-red-500/5",
      dot: "danger" as Tone,
      title: "数据严重过期",
      detail: `快照超过 24 小时未更新（${rel}）· 自动化流水线可能已停止`,
      titleColor: "text-red-400",
    },
    unknown: {
      box: "border-red-500/30 bg-red-500/5",
      dot: "danger" as Tone,
      title: "无法确定数据时间",
      detail: "快照缺少有效的 generatedAt 时间戳",
      titleColor: "text-red-400",
    },
  } as const;

  const v = variants[level];
  return (
    <div className={`mt-6 flex items-center gap-3 rounded-[var(--radius-lg)] border px-5 py-4 ${v.box}`}>
      <span className="relative flex h-2.5 w-2.5">
        {level === "fresh" && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
        )}
        <StatusDot tone={v.dot} />
      </span>
      <div className="min-w-0">
        <p className={`text-[14px] font-semibold ${v.titleColor}`}>{v.title}</p>
        <p className="mt-0.5 text-[12px] text-[color:var(--muted)]">{v.detail}</p>
      </div>
    </div>
  );
}

function StaleWarning({ generatedAt, nowMs }: { generatedAt: string; nowMs: number }) {
  const rel = relativeTime(generatedAt, nowMs);
  return (
    <div className="mt-4 rounded-[var(--radius)] border border-amber-500/30 bg-amber-500/5 px-4 py-3">
      <div className="flex items-start gap-2.5">
        <span className="mt-1.5">
          <StatusDot tone="warning" />
        </span>
        <p className="text-[13px] text-[color:var(--foreground)]">
          以下指标基于 <span className="font-semibold">{rel}</span>的快照，可能不反映当前真实状态。
        </p>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6">
      <div className="rounded-[var(--radius-lg)] border border-red-500/30 bg-red-500/5 p-8 text-center">
        <div className="flex justify-center">
          <StatusDot tone="danger" />
        </div>
        <h1 className="mt-3 text-[17px] font-semibold text-red-400">无法加载驾驶舱数据</h1>
        <p className="mt-1.5 text-[13px] text-[color:var(--muted)]">{message}</p>
        <p className="mt-1 text-[12px] text-[color:var(--muted)]">
          /mission-control-data.json 请求失败 —— 未回退到占位数据，避免显示误导信息。
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex items-center rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-2 text-[13px] font-semibold text-[color:var(--foreground)] transition hover:bg-[color:var(--surface-subtle)]"
        >
          重试
        </button>
      </div>
    </div>
  );
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-dashed border-[color:var(--line)] bg-[color:var(--surface)] px-6 py-10 text-center">
      <div className="flex justify-center">
        <StatusDot tone="neutral" />
      </div>
      <p className="mt-3 text-[14px] font-semibold text-[color:var(--foreground)]">{title}</p>
      <p className="mt-1 text-[12px] text-[color:var(--muted)]">{detail}</p>
    </div>
  );
}

/* ── Job presentation mapping ── */

function jobTone(category: JobCategory, lastStatus: MissionControlData["cronJobs"][number]["lastStatus"]): Tone {
  if (category === "failed") return "danger";
  if (category === "overdue") return "warning";
  if (lastStatus === "success") return "success";
  if (lastStatus === "running") return "info";
  return "neutral";
}

function jobLabel(category: JobCategory, lastStatus: MissionControlData["cronJobs"][number]["lastStatus"]): string {
  if (category === "failed") return "失败";
  if (category === "overdue") return "已逾期";
  if (lastStatus === "success") return "正常";
  if (lastStatus === "running") return "运行中";
  return "待执行";
}

/* ── Main ── */

type FetchState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: MissionControlData; nowMs: number };

export function MissionControlV2() {
  const [state, setState] = useState<FetchState>({ status: "loading" });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    fetch("/mission-control-data.json", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(`服务器返回 HTTP ${res.status}`);
        return res.json();
      })
      .then((json: MissionControlData) => {
        if (!cancelled) setState({ status: "ready", data: json, nowMs: Date.now() });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({ status: "error", message: err instanceof Error ? err.message : "未知错误" });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  if (state.status === "loading") return <Skeleton />;
  if (state.status === "error") {
    return <ErrorState message={state.message} onRetry={() => setReloadKey((k) => k + 1)} />;
  }

  const { data: m, nowMs } = state;
  const fresh = getFreshness(m.generatedAt, nowMs);
  const isStale = fresh.level === "stale" || fresh.level === "critical" || fresh.level === "unknown";

  const sorted = sortJobs(m.cronJobs, nowMs);
  const failedJobs = sorted.filter((s) => s.category === "failed");
  const hasJobs = m.cronJobs.length > 0;
  const hasAttention = m.alerts.length > 0 || failedJobs.length > 0;

  // KPI source data
  const { pagesLive, pagesHealthy, aiCitationRate: cit } = m.seoGeo;
  const a = m.analytics;
  const citTracked = cit.current > 0 || cit.previous > 0;
  const healthTone: Tone =
    pagesLive === 0 ? "neutral" : pagesHealthy === pagesLive ? "success" : pagesHealthy / pagesLive >= 0.9 ? "warning" : "danger";

  const hasTraffic =
    a.todayPageViews > 0 || a.weekPageViews > 0 || a.registeredUsers > 0 || a.payingUsers > 0;

  const freshBadge: { label: string; tone: Tone } =
    fresh.level === "fresh"
      ? { label: "数据新鲜", tone: "success" }
      : fresh.level === "stale"
        ? { label: "数据过期", tone: "warning" }
        : { label: "数据失效", tone: "danger" };

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6">
      {/* 1 · Header + freshness */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--accent)]">
            DockDocs · Mission Control v2
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[color:var(--foreground)]">自动化驾驶舱</h1>
        </div>
        <div className="flex items-center gap-3">
          <Badge label={freshBadge.label} tone={freshBadge.tone} />
          <p className="text-[12px] text-[color:var(--muted)]">{relativeTime(m.generatedAt, nowMs)}更新</p>
        </div>
      </div>

      {/* 2 · Heartbeat banner */}
      <HeartbeatBanner generatedAt={m.generatedAt} nowMs={nowMs} />

      {/* 3 · Attention queue (alerts + failed jobs) */}
      <section className="mt-6">
        <SectionTitle title="关注队列" subtitle="需要人工注意的告警与失败任务" />
        {hasAttention ? (
          <div className="space-y-2">
            {m.alerts.map((alert, i) => (
              <AlertRow key={`alert-${i}`} alert={alert} />
            ))}
            {failedJobs.map(({ job, category }) => (
              <CronRow
                key={`failed-${job.name}`}
                job={job}
                tone={jobTone(category, job.lastStatus)}
                statusLabel={jobLabel(category, job.lastStatus)}
              />
            ))}
          </div>
        ) : (
          <EmptyState title="无需关注的事项" detail="没有未处理的告警，所有任务运行正常。" />
        )}
      </section>

      {/* 4 · KPI row — all wired to real seoGeo / analytics data */}
      {isStale && <StaleWarning generatedAt={m.generatedAt} nowMs={nowMs} />}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="站点健康"
          value={pagesLive > 0 ? `${pagesHealthy}/${pagesLive}` : "—"}
          sub={pagesLive > 0 ? "健康 / 在线页面" : "暂无页面数据"}
          tone={healthTone}
        />
        <StatCard
          label="AI 引用率"
          value={citTracked ? `${cit.current}/${cit.outOf}` : "待追踪"}
          sub={
            citTracked
              ? `${cit.delta > 0 ? `↑ ${cit.delta}` : cit.delta < 0 ? `↓ ${Math.abs(cit.delta)}` : "持平"} 较上次`
              : "AI Citation Tracker 每日 08:00"
          }
          tone={citTracked ? (cit.delta >= 0 ? "success" : "warning") : "neutral"}
        />
        <StatCard
          label="今日浏览"
          value={a.todayPageViews.toLocaleString()}
          sub={`本周 ${a.weekPageViews.toLocaleString()} 次浏览`}
          tone={a.todayPageViews > 0 ? "success" : "neutral"}
        />
        <StatCard
          label="注册用户"
          value={a.registeredUsers.toLocaleString()}
          sub={`付费 ${a.payingUsers.toLocaleString()} · 转化 ${a.conversionRate}`}
          tone={a.payingUsers > 0 ? "success" : "neutral"}
        />
      </div>

      {/* 5 · Job table — sorted failed → overdue → upcoming */}
      <section className="mt-8">
        <SectionTitle title="任务状态" subtitle={`${m.cronJobs.length} 个自动化任务 · 失败 → 逾期 → 即将运行`} />
        {hasJobs ? (
          <div className="space-y-2">
            {sorted.map(({ job, category }) => (
              <CronRow
                key={job.name}
                job={job}
                tone={jobTone(category, job.lastStatus)}
                statusLabel={jobLabel(category, job.lastStatus)}
              />
            ))}
          </div>
        ) : (
          <EmptyState title="尚未配置自动化任务" detail="当 Reporter 上报任务后，这里会显示运行状态。" />
        )}
      </section>

      {/* 6 · Traffic section — only when there is real analytics data */}
      {hasTraffic && (
        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
            <SectionTitle title="访问分析" subtitle="今日 / 本周流量" />
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[var(--radius)] border border-[color:var(--line)] px-3 py-2 text-center">
                <p className="text-[22px] font-semibold text-[color:var(--foreground)]">{a.todayPageViews.toLocaleString()}</p>
                <p className="text-[11px] text-[color:var(--muted)]">今日浏览</p>
              </div>
              <div className="rounded-[var(--radius)] border border-[color:var(--line)] px-3 py-2 text-center">
                <p className="text-[22px] font-semibold text-[color:var(--foreground)]">{a.todayVisitors.toLocaleString()}</p>
                <p className="text-[11px] text-[color:var(--muted)]">今日访客</p>
              </div>
              <div className="rounded-[var(--radius)] border border-[color:var(--line)] px-3 py-2 text-center">
                <p className="text-[22px] font-semibold text-[color:var(--foreground)]">{a.weekPageViews.toLocaleString()}</p>
                <p className="text-[11px] text-[color:var(--muted)]">本周浏览</p>
              </div>
              <div className="rounded-[var(--radius)] border border-[color:var(--line)] px-3 py-2 text-center">
                <p className="text-[22px] font-semibold text-[color:var(--foreground)]">{a.weekVisitors.toLocaleString()}</p>
                <p className="text-[11px] text-[color:var(--muted)]">本周访客</p>
              </div>
            </div>
            {a.topPages.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {a.topPages.slice(0, 5).map((p) => (
                  <div key={p.path} className="flex items-center justify-between text-[12px]">
                    <span className="truncate text-[color:var(--muted)]">{p.path}</span>
                    <span className="shrink-0 font-semibold text-[color:var(--foreground)]">{p.views.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
            <SectionTitle title="用户与收入" subtitle="Google OAuth · Stripe" />
            <div className="space-y-2">
              <div className="flex justify-between text-[13px]">
                <span className="text-[color:var(--muted)]">注册用户</span>
                <span className="font-semibold text-[color:var(--foreground)]">{a.registeredUsers.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-[color:var(--muted)]">付费用户</span>
                <span className="font-semibold text-[color:var(--foreground)]">{a.payingUsers.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-[color:var(--line)] pt-2 text-[13px]">
                <span className="text-[color:var(--muted)]">转化率</span>
                <span className="font-semibold text-emerald-400">{a.conversionRate}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 7 · Footer — quick links + cost footnote (no server IP) */}
      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <QuickLinks />
        <div className="rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
          <SectionTitle title="关于此面板" />
          <p className="text-[13px] text-[color:var(--muted)]">
            自动化流水线由 Mission Control Reporter 每 6 小时上报一次，数据写入 <code className="text-[12px]">mission-control-data.json</code>。
          </p>
          <p className="mt-2 text-[13px] text-[color:var(--muted)]">
            运行成本：自托管于阿里云 ECS，内容生成使用 DeepSeek V4 Pro —— 整体维持在低成本区间。
          </p>
        </div>
      </section>

      <p className="mt-10 text-center text-[11px] text-[color:var(--muted)]">
        Mission Control v2 · Hermes Agent 自动生成 · 快照 {fmtDate(m.generatedAt)}
      </p>
    </div>
  );
}
