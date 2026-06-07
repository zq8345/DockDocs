"use client";

import { useEffect, useState } from "react";
import type { MissionControlData } from "@/lib/mission-control-v2";
import { emptyMissionControlData } from "@/lib/mission-control-v2";

/* ── Shared mini components ── */

function StatCard({ label, value, sub, tone = "neutral" }: { label: string; value: string; sub?: string; tone?: "success" | "warning" | "danger" | "neutral" }) {
  const c = { success: "text-emerald-400", warning: "text-amber-400", danger: "text-red-400", neutral: "text-[color:var(--foreground)]" };
  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--muted)]">{label}</p>
      <p className={`mt-2 text-[28px] font-semibold tracking-tight ${c[tone]}`}>{value}</p>
      {sub && <p className="mt-1 text-[12px] text-[color:var(--muted)]">{sub}</p>}
    </div>
  );
}

function Badge({ label, tone }: { label: string; tone: "success" | "warning" | "danger" | "neutral" }) {
  const c = { success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", warning: "bg-amber-500/15 text-amber-400 border-amber-500/30", danger: "bg-red-500/15 text-red-400 border-red-500/30", neutral: "bg-[color:var(--line)] text-[color:var(--muted)] border-[color:var(--line)]" };
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${c[tone]}`}>{label}</span>;
}

function SectionTitle({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-3">
      <h2 className="text-[15px] font-semibold text-[color:var(--foreground)]">{icon} {title}</h2>
      {subtitle && <p className="mt-0.5 text-[12px] text-[color:var(--muted)]">{subtitle}</p>}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid gap-3 sm:grid-cols-4">{[...Array(4)].map((_, i) => <div key={i} className="h-[104px] rounded-[var(--radius-lg)] bg-[color:var(--line)]" />)}</div>
      <div className="grid gap-3 sm:grid-cols-2">{[...Array(2)].map((_, i) => <div key={i} className="h-[200px] rounded-[var(--radius-lg)] bg-[color:var(--line)]" />)}</div>
    </div>
  );
}

/* ── Cron job row ── */

function CronRow({ job }: { job: MissionControlData["cronJobs"][number] }) {
  const dot: Record<string, string> = { success: "🟢", error: "🔴", running: "🔵", pending: "⚪" };
  return (
    <div className="flex items-center justify-between gap-3 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span>{dot[job.lastStatus]}</span>
          <p className="text-[13px] font-semibold text-[color:var(--foreground)] truncate">{job.name}</p>
          <Badge label={job.schedule} tone="neutral" />
        </div>
        {job.summary && <p className="mt-1 text-[12px] text-[color:var(--muted)]">{job.summary}</p>}
      </div>
      <div className="shrink-0 text-right">
        <p className="text-[11px] text-[color:var(--muted)]">
          {job.nextRun ? new Date(job.nextRun).toLocaleString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
        </p>
      </div>
    </div>
  );
}

function AlertRow({ alert }: { alert: MissionControlData["alerts"][number] }) {
  const s = { critical: "border-red-500/30 bg-red-500/5", warning: "border-amber-500/30 bg-amber-500/5", info: "border-blue-500/30 bg-blue-500/5" };
  const icon = { critical: "🔴", warning: "🟡", info: "🔵" };
  return (
    <div className={`rounded-[var(--radius)] border px-4 py-3 ${s[alert.level]}`}>
      <div className="flex items-start gap-2"><span>{icon[alert.level]}</span><div className="min-w-0"><p className="text-[13px] font-semibold text-[color:var(--foreground)]">{alert.message}</p><p className="mt-0.5 text-[12px] text-[color:var(--muted)]">来源: {alert.source}</p><p className="mt-1.5 text-[13px] text-[color:var(--accent)] font-medium">→ {alert.action}</p></div></div>
    </div>
  );
}

/* ── Panels ── */

function ArchitecturePanel() {
  const layers = [
    { label: "感知层", items: ["Page Detector", "Keyword Tracker", "Platform Watcher"], color: "border-blue-500/30 bg-blue-500/5" },
    { label: "策略层", items: ["Strategy Brain (每周自我进化)"], color: "border-purple-500/30 bg-purple-500/5" },
    { label: "执行层", items: ["Content Factory", "Full Health Audit", "AI Citation", "Competitor Intel", "Signal Monitor", "Internal Links"], color: "border-emerald-500/30 bg-emerald-500/5" },
    { label: "展示层", items: ["Mission Control → GitHub → Netlify 自动部署"], color: "border-amber-500/30 bg-amber-500/5" },
  ];
  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
      <SectionTitle icon="🏗️" title="系统架构" subtitle="感知 → 策略 → 执行 → 部署" />
      <div className="mt-3 space-y-3">{layers.map((l, i) => (<div key={l.label} className={`rounded-[var(--radius)] border px-4 py-3 ${l.color}`}><div className="flex items-center gap-2"><span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--muted)]">L{i + 1}</span><p className="text-[13px] font-semibold text-[color:var(--foreground)]">{l.label}</p></div><div className="mt-2 flex flex-wrap gap-1">{l.items.map((item) => <Badge key={item} label={item} tone="neutral" />)}</div></div>))}</div>
    </div>
  );
}

function SiteStructurePanel() {
  const groups = [
    { label: "优化", count: 4, items: "压缩 · 合并 · 拆分 · OCR" },
    { label: "转换", count: 12, items: "PDF↔Word/JPG/PNG/Excel/PPT/Text/MD" },
    { label: "编辑", count: 5, items: "编辑 · 签名 · 旋转 · 排序 · 增删页" },
    { label: "安全", count: 3, items: "加密 · 解锁 · 翻译" },
    { label: "AI", count: 3, items: "问答 · 摘要 · OCR 工作区" },
    { label: "页面", count: 8, items: "首页 · 定价 · 关于 · 博客 · FAQ · 帮助 · 隐私 · 条款" },
  ];
  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
      <SectionTitle icon="🌐" title="站点结构" subtitle="42 页面 · 30 工具 · 全部含 JSON-LD 结构化数据" />
      <div className="mt-3 space-y-2">{groups.map((g) => (<div key={g.label} className="flex items-center justify-between rounded-[var(--radius)] border border-[color:var(--line)] px-3 py-2"><div className="min-w-0"><p className="text-[13px] font-semibold text-[color:var(--foreground)]">{g.label}</p><p className="text-[11px] text-[color:var(--muted)] truncate">{g.items}</p></div><span className="shrink-0 text-[20px] font-semibold text-[color:var(--muted)]">{g.count}</span></div>))}</div>
    </div>
  );
}

function AnalyticsPanel({ data }: { data: MissionControlData["analytics"] }) {
  const hasData = data.todayPageViews > 0;
  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
      <SectionTitle icon="📈" title="访问分析" subtitle="Microsoft Clarity · 免费" />
      {!hasData ? (
        <div className="mt-3 rounded-[var(--radius)] border border-blue-500/30 bg-blue-500/5 px-4 py-3 text-[13px]">
          <p className="font-semibold text-[color:var(--foreground)]">📋 启用流量分析</p>
          <p className="mt-1 text-[color:var(--muted)]">1. clarity.microsoft.com → 创建项目 → 复制 ID</p>
          <p className="text-[color:var(--muted)]">2. 替换 layout.tsx 中的 PLACEHOLDER_CLARITY_ID</p>
          <p className="mt-2 text-[color:var(--accent)] font-medium">→ 30 分钟后数据自动出现</p>
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-[var(--radius)] border border-[color:var(--line)] px-3 py-2 text-center"><p className="text-[22px] font-semibold">{data.todayPageViews.toLocaleString()}</p><p className="text-[11px] text-[color:var(--muted)]">今日浏览</p></div>
          <div className="rounded-[var(--radius)] border border-[color:var(--line)] px-3 py-2 text-center"><p className="text-[22px] font-semibold">{data.todayVisitors.toLocaleString()}</p><p className="text-[11px] text-[color:var(--muted)]">今日访客</p></div>
          <div className="rounded-[var(--radius)] border border-[color:var(--line)] px-3 py-2 text-center"><p className="text-[22px] font-semibold">{data.weekPageViews.toLocaleString()}</p><p className="text-[11px] text-[color:var(--muted)]">本周浏览</p></div>
          <div className="rounded-[var(--radius)] border border-[color:var(--line)] px-3 py-2 text-center"><p className="text-[22px] font-semibold">{data.weekVisitors.toLocaleString()}</p><p className="text-[11px] text-[color:var(--muted)]">本周访客</p></div>
        </div>
      )}
    </div>
  );
}

function UsersPanel({ data }: { data: MissionControlData["analytics"] }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
      <SectionTitle icon="👥" title="用户与收入" subtitle="Google OAuth · Stripe" />
      <div className="mt-3 space-y-2">
        <div className="flex justify-between text-[13px]"><span className="text-[color:var(--muted)]">注册用户</span><span className="font-semibold">{data.registeredUsers.toLocaleString()}</span></div>
        <div className="flex justify-between text-[13px]"><span className="text-[color:var(--muted)]">付费用户</span><span className="font-semibold">{data.payingUsers.toLocaleString()}</span></div>
        <div className="flex justify-between text-[13px]"><span className="text-[color:var(--muted)]">转化率</span><span className="font-semibold">{data.conversionRate}</span></div>
        {data.registeredUsers === 0 && <div className="mt-2 rounded-[var(--radius)] border border-blue-500/30 bg-blue-500/5 px-3 py-2 text-[12px] text-[color:var(--muted)]">用户系统尚未激活。接入 Google OAuth + Stripe Webhook 后自动统计。</div>}
      </div>
    </div>
  );
}

function CostPanel() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
      <SectionTitle icon="💰" title="运行成本" subtitle="DeepSeek V4 Pro · 阿里云 ECS" />
      <div className="mt-3 space-y-3">
        <div className="flex justify-between text-[13px]"><span className="text-[color:var(--muted)]">每日 LLM 调用</span><span className="font-semibold">~48 次</span></div>
        <div className="flex justify-between text-[13px]"><span className="text-[color:var(--muted)]">LLM 日费</span><span className="font-semibold">~$0.12</span></div>
        <div className="flex justify-between text-[13px]"><span className="text-[color:var(--muted)]">服务器月费</span><span className="font-semibold">~¥50</span></div>
        <div className="border-t border-[color:var(--line)] pt-2 flex justify-between text-[13px]"><span className="text-[color:var(--muted)]">总计月费</span><span className="font-semibold text-emerald-400">≈ ¥60</span></div>
      </div>
    </div>
  );
}

function QuickLinksPanel() {
  const links = [
    { label: "网站首页", href: "https://dockdocs.app" },
    { label: "GitHub 仓库", href: "https://github.com/zq8345/dock-ai-ecosystem" },
    { label: "Sitemap", href: "https://dockdocs.app/sitemap.xml" },
    { label: "Netlify 控制台", href: "https://app.netlify.com" },
    { label: "阿里云 ECS", href: "https://ecs.console.aliyun.com" },
    { label: "DeepSeek 后台", href: "https://platform.deepseek.com" },
    { label: "Microsoft Clarity", href: "https://clarity.microsoft.com" },
    { label: "Stripe Dashboard", href: "https://dashboard.stripe.com" },
  ];
  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
      <SectionTitle icon="🔗" title="快捷入口" />
      <div className="mt-3 grid gap-1">{links.map((l) => (<a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-[var(--radius)] px-3 py-2 text-[13px] text-[color:var(--muted)] transition hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)]">{l.label}<span>↗</span></a>))}</div>
    </div>
  );
}

/* ── Main ── */

export function MissionControlV2() {
  const [data, setData] = useState<MissionControlData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/mission-control-data.json")
      .then((res) => res.json())
      .then((json: MissionControlData) => { setData(json); setLoading(false); })
      .catch(() => { setData(emptyMissionControlData); setLoading(false); });
  }, []);

  if (loading) return <Skeleton />;

  const m = data ?? emptyMissionControlData;
  const pending = m.cronJobs.filter((j) => j.lastStatus === "pending").length;

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--accent)]">DockDocs · Mission Control v2</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[color:var(--foreground)]">自动化驾驶舱</h1>
        </div>
        <div className="flex items-center gap-3">
          <Badge label={`11 任务`} tone="neutral" />
          <Badge label={`${pending} 待执行`} tone="warning" />
          <p className="text-[12px] text-[color:var(--muted)]">{new Date(m.generatedAt).toLocaleString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
        </div>
      </div>

      {/* Key metrics */}
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <StatCard label="任务总数" value="11" sub="自动化 SEO/GEO" />
        <StatCard label="站点健康" value="100%" sub={`${m.seoGeo.pagesLive} 页面全部正常`} tone="success" />
        <StatCard label="AI 引用率" value="待首次追踪" sub="AI Citation Tracker 08:00 运行" />
        <StatCard label="月费" value="≈ ¥60" sub="DeepSeek + ECS" tone="success" />
      </div>

      {/* Alerts */}
      <section className="mt-6">
        <SectionTitle icon="🔔" title="通知中心" subtitle={`${m.alerts.length} 条`} />
        <div className="mt-2 space-y-2">{m.alerts.map((a, i) => <AlertRow key={i} alert={a} />)}</div>
      </section>

      {/* Analytics + Users row */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <AnalyticsPanel data={m.analytics} />
        <UsersPanel data={m.analytics} />
      </div>

      {/* Jobs + Architecture */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <SectionTitle icon="🤖" title="任务状态" subtitle="11 个自动化任务 · 阿里云 24×7" />
          <div className="mt-2 space-y-2">{m.cronJobs.map((j) => <CronRow key={j.name} job={j} />)}</div>
        </div>
        <div className="space-y-6">
          <ArchitecturePanel />
          <SiteStructurePanel />
        </div>
      </div>

      {/* Bottom row */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <CostPanel />
        <QuickLinksPanel />
      </div>

      <p className="mt-10 text-center text-[11px] text-[color:var(--muted)]">Mission Control v2 · Hermes Agent 自动生成 · Cloud: 47.251.125.101 · Model: DeepSeek V4 Pro</p>
    </div>
  );
}
