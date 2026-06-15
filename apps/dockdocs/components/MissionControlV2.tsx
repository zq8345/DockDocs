"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type MissionControlData,
  type SystemStatus,
  type TaskStatus,
  type AlertLevel,
  fmtBeijing,
  relativeCN,
  num,
} from "@/lib/mission-control-v2";

/* ── 颜色映射 ── */
const SYS_META: Record<SystemStatus, { label: string; box: string; text: string; dot: string }> = {
  ok: { label: "系统运行正常", box: "border-emerald-500/30 bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
  warn: { label: "有事项需关注", box: "border-amber-500/30 bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400" },
  error: { label: "存在错误，需处理", box: "border-red-500/30 bg-red-500/10", text: "text-red-400", dot: "bg-red-400" },
};
const TASK_META: Record<TaskStatus, { label: string; dot: string; text: string }> = {
  ok: { label: "正常", dot: "bg-emerald-400", text: "text-emerald-400" },
  stale: { label: "可能挂了", dot: "bg-red-400", text: "text-red-400" },
  missing: { label: "无数据", dot: "bg-amber-400", text: "text-amber-400" },
  pending: { label: "待接入", dot: "bg-[color:var(--muted)]", text: "text-[color:var(--muted)]" },
};
const ALERT_META: Record<AlertLevel, { box: string; dot: string }> = {
  error: { box: "border-red-500/30 bg-red-500/5", dot: "bg-red-400" },
  warn: { box: "border-amber-500/30 bg-amber-500/5", dot: "bg-amber-400" },
  info: { box: "border-blue-500/30 bg-blue-500/5", dot: "bg-blue-400" },
};

/* ── 小组件 ── */
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] ${className}`}>
      {children}
    </div>
  );
}

function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-3 text-center">
      <h2 className="text-[15px] font-semibold text-[color:var(--foreground)]">{title}</h2>
      {sub && <p className="mt-0.5 text-[12px] text-[color:var(--muted)]">{sub}</p>}
    </div>
  );
}

function Bar({ pct, tone }: { pct: number; tone: string }) {
  return (
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[color:var(--line)]">
      <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
    </div>
  );
}

function MetricCard({ label, value, sub, accent = "text-[color:var(--foreground)]", bar }: {
  label: string; value: string; sub?: string; accent?: string; bar?: { pct: number; tone: string };
}) {
  return (
    <Card className="p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--muted)]">{label}</p>
      <p className={`mt-2 text-[30px] font-semibold leading-none tracking-tight ${accent}`}>{value}</p>
      {bar && <Bar pct={bar.pct} tone={bar.tone} />}
      {sub && <p className="mt-2 text-[12px] text-[color:var(--muted)]">{sub}</p>}
    </Card>
  );
}

function Skeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-5 py-10">
      <div className="mx-auto h-9 w-56 rounded bg-[color:var(--line)] animate-pulse" />
      <div className="h-16 rounded-[var(--radius-lg)] bg-[color:var(--line)] animate-pulse" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className="h-28 rounded-[var(--radius-lg)] bg-[color:var(--line)] animate-pulse" />)}
      </div>
    </div>
  );
}

/* ── 主组件 ── */
type FetchState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: MissionControlData; nowMs: number };

export function MissionControlV2() {
  const [state, setState] = useState<FetchState>({ status: "loading" });
  const [tick, setTick] = useState(0);

  const load = useCallback(() => {
    let cancelled = false;
    fetch("/mission-control-data.json", { cache: "no-store" })
      .then((res) => { if (!res.ok) throw new Error(`服务器返回 HTTP ${res.status}`); return res.json(); })
      .then((json: MissionControlData) => { if (!cancelled) setState({ status: "ready", data: json, nowMs: Date.now() }); })
      .catch((err: unknown) => { if (!cancelled) setState({ status: "error", message: err instanceof Error ? err.message : "未知错误" }); });
    return () => { cancelled = true; };
  }, []);

  // 首次加载 + 每 5 分钟自动刷新
  useEffect(() => {
    const cleanup = load();
    const timer = setInterval(() => setTick((t) => t + 1), 5 * 60_000);
    return () => { cleanup(); clearInterval(timer); };
  }, [load, tick]);

  if (state.status === "loading") return <Skeleton />;

  if (state.status === "error") {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20 text-center">
        <h1 className="text-[20px] font-semibold text-red-400">无法加载控制台数据</h1>
        <p className="mt-2 text-[13px] text-[color:var(--muted)]">{state.message}</p>
        <p className="mt-1 text-[12px] text-[color:var(--muted)]">/mission-control-data.json 请求失败(未回退占位数据，避免误导)</p>
        <button type="button" onClick={() => setTick((t) => t + 1)}
          className="mt-5 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-2 text-[13px] font-semibold transition hover:bg-[color:var(--surface-subtle)]">
          重试
        </button>
      </div>
    );
  }

  const { data: m, nowMs } = state;
  const sys = SYS_META[m.systemStatus] ?? SYS_META.warn;
  const mt = m.metrics ?? ({} as MissionControlData["metrics"]);
  const alerts = m.alerts ?? [];
  const tasks = m.tasks ?? [];
  const opps = m.opportunities ?? [];

  const hs = mt.healthScore;
  const hsTone = hs == null ? "bg-[color:var(--muted)]" : hs >= 90 ? "bg-emerald-400" : hs >= 70 ? "bg-amber-400" : "bg-red-400";
  const hsAccent = hs == null ? "text-[color:var(--foreground)]" : hs >= 90 ? "text-emerald-400" : hs >= 70 ? "text-amber-400" : "text-red-400";
  const gscConnected = mt.gscImpressions != null;

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      {/* 1 · 居中标题 + 北京时间 */}
      <header className="text-center">
        <h1 className="text-[28px] font-semibold tracking-tight text-[color:var(--foreground)]">DockDocs 控制台</h1>
        <p className="mt-2 text-[13px] text-[color:var(--muted)]">
          更新于 {fmtBeijing(m.generatedAt)}(北京时间)· {relativeCN(m.generatedAt, nowMs)}
          <button type="button" onClick={() => setTick((t) => t + 1)}
            className="ml-2 rounded-[var(--radius-sm)] border border-[color:var(--line)] px-2 py-0.5 text-[11px] transition hover:bg-[color:var(--surface-subtle)]">
            刷新
          </button>
        </p>
      </header>

      {/* 2 · 系统状态心跳条 */}
      <div className={`mt-6 flex items-center justify-center gap-3 rounded-[var(--radius-lg)] border px-5 py-4 ${sys.box}`}>
        <span className="relative flex h-2.5 w-2.5">
          {m.systemStatus === "ok" && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />}
          <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${sys.dot}`} />
        </span>
        <p className={`text-[15px] font-semibold ${sys.text}`}>{sys.label}</p>
      </div>

      {/* 3 · 通知中心(集成原飞书告警) */}
      <section className="mt-8">
        <SectionTitle title="通知中心" sub="需要人工处理的告警与异常" />
        {alerts.length ? (
          <div className="mx-auto max-w-3xl space-y-2">
            {alerts.map((al, i) => {
              const meta = ALERT_META[al.level] ?? ALERT_META.info;
              return (
                <div key={i} className={`flex items-start gap-2.5 rounded-[var(--radius)] border px-4 py-3 ${meta.box}`}>
                  <span className={`mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full ${meta.dot}`} />
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-[color:var(--foreground)]">{al.message}</p>
                    <p className="mt-0.5 text-[12px] text-[color:var(--muted)]">来源：{al.source}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-[13px] text-[color:var(--muted)]">暂无告警，一切正常 ✅</p>
        )}
      </section>

      {/* 4 · 核心指标(可视化，只显真实数据) */}
      <section className="mt-8">
        <SectionTitle title="核心指标" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="站点健康"
            value={hs == null ? "—" : `${hs}`}
            accent={hsAccent}
            bar={{ pct: hs ?? 0, tone: hsTone }}
            sub={mt.pagesLive != null ? `${num(mt.pagesHealthy)}/${num(mt.pagesLive)} 页正常` : "暂无健康数据"}
          />
          <MetricCard
            label="在线页面"
            value={num(mt.pagesLive)}
            sub={mt.pagesError != null ? (mt.pagesError > 0 ? `${mt.pagesError} 页有错误` : "无错误页面") : undefined}
            accent={mt.pagesError ? "text-red-400" : "text-[color:var(--foreground)]"}
          />
          <MetricCard
            label="外部提及"
            value={num(mt.externalMentions)}
            sub="HN / GitHub / Reddit"
          />
          <MetricCard
            label="GSC 搜索点击"
            value={gscConnected ? num(mt.gscClicks) : "未接入"}
            accent={gscConnected ? "text-[color:var(--foreground)]" : "text-[color:var(--muted)]"}
            sub={gscConnected ? `${num(mt.gscImpressions)} 次曝光` : "服务账号待生效"}
          />
        </div>
      </section>

      {/* 5 · GSC 机会词(高曝光低点击 = 最高 ROI) */}
      <section className="mt-8">
        <SectionTitle title="优化机会(高曝光低点击)" sub="点击率偏低、优化标题/内容即可涨流量的搜索词" />
        {opps.length ? (
          <Card className="overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[color:var(--line)] text-[11px] uppercase tracking-wide text-[color:var(--muted)]">
                  <th className="px-4 py-2 text-left font-semibold">搜索词</th>
                  <th className="px-4 py-2 text-right font-semibold">曝光</th>
                  <th className="px-4 py-2 text-right font-semibold">点击率</th>
                  <th className="px-4 py-2 text-right font-semibold">排名</th>
                </tr>
              </thead>
              <tbody>
                {opps.map((o, i) => (
                  <tr key={i} className="border-b border-[color:var(--line)] last:border-0">
                    <td className="max-w-[280px] truncate px-4 py-2 text-[color:var(--foreground)]">{o.query}</td>
                    <td className="px-4 py-2 text-right text-[color:var(--foreground)]">{o.impressions.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right text-amber-400">{o.ctr}%</td>
                    <td className="px-4 py-2 text-right text-[color:var(--muted)]">{o.position}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        ) : (
          <p className="text-center text-[13px] text-[color:var(--muted)]">{gscConnected ? "暂无机会词数据" : "GSC 接入后，这里会列出可优化的搜索词"}</p>
        )}
      </section>

      {/* 6 · 任务运行状态(可视化) */}
      <section className="mt-8">
        <SectionTitle title="任务运行状态" sub={`${tasks.length} 个自动化任务`} />
        {tasks.length ? (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {tasks.map((t, i) => {
              const meta = TASK_META[t.status] ?? TASK_META.pending;
              return (
                <Card key={i} className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block h-2 w-2 rounded-full ${meta.dot}`} />
                      <span className="text-[13px] font-semibold text-[color:var(--foreground)]">{t.name}</span>
                    </div>
                    <span className={`text-[12px] font-medium ${meta.text}`}>{meta.label}</span>
                  </div>
                  <p className="mt-2 text-[11px] text-[color:var(--muted)]">
                    {t.lastRun ? `上次运行：${relativeCN(t.lastRun, nowMs)}` : "尚未运行"}
                  </p>
                </Card>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-[13px] text-[color:var(--muted)]">尚未上报任务状态</p>
        )}
      </section>

      {/* 7 · 快捷入口 */}
      <section className="mt-8">
        <SectionTitle title="快捷入口" />
        <div className="mx-auto flex max-w-3xl flex-wrap justify-center gap-2">
          {[
            { label: "网站首页", href: "https://dockdocs.app" },
            { label: "Search Console", href: "https://search.google.com/search-console" },
            { label: "Netlify", href: "https://app.netlify.com" },
            { label: "GitHub", href: "https://github.com/zq8345/dock-ai-ecosystem" },
            { label: "阿里云 ECS", href: "https://ecs.console.aliyun.com" },
          ].map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
              className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-1.5 text-[12px] text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--foreground)]">
              {l.label} ↗
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
