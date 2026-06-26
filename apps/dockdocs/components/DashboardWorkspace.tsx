"use client";

import { useEffect, useState } from "react";
import { localizedPath, type RouteSlug } from "@/lib/i18n";
import { getDockAccountState } from "@/lib/account-runtime";
import { readWorkHistory, type WorkHistoryItem } from "@/lib/work-history";
import type { RuntimeLocale } from "@/lib/copy";

type DashLocale = RuntimeLocale | "es" | "pt" | "fr" | "ja" | "zh-Hant" | "de" | "ko";

// Cast a known-valid slug string through RouteSlug so localizedPath is satisfied.
// All slugs used in this file (contract-risk, compare-documents, chat-with-pdf,
// ai-summary) are registered in lib/i18n.ts routeSlugs / toolSlugs.
function lp(locale: DashLocale, slug: string): string {
  return localizedPath(locale, slug as RouteSlug);
}

// ---------------------------------------------------------------------------
// Copy
// ---------------------------------------------------------------------------
const COPY = {
  zh: {
    eyebrow: "你的工作台",
    greet: (name: string) => `欢迎回来，${name}`,
    resume: "继续上次",
    resumeCta: "继续查看",
    recent: "最近",
    quick: "快捷开工",
    tools: {
      "contract-risk": "合同审查",
      compare: "文档对比",
      "chat-with-pdf": "AI 问答",
      "ai-summary": "AI 摘要",
    },
    privacy: "你的分析存在浏览器里·文件不上传",
    empty: "暂无记录，选下方工具开始工作",
  },
  en: {
    eyebrow: "Your workspace",
    greet: (name: string) => `Welcome back, ${name}`,
    resume: "Pick up where you left off",
    resumeCta: "Continue",
    recent: "Recent",
    quick: "Quick start",
    tools: {
      "contract-risk": "Contract review",
      compare: "Compare docs",
      "chat-with-pdf": "AI chat",
      "ai-summary": "AI summary",
    },
    privacy: "Your analysis stays in your browser · files not uploaded",
    empty: "No history yet — pick a tool below to get started",
  },
};

// ---------------------------------------------------------------------------
// Quick-start tool list
// ---------------------------------------------------------------------------
const QUICK_TOOLS: { tool: WorkHistoryItem["tool"]; href: string }[] = [
  { tool: "contract-risk", href: "contract-risk" },
  { tool: "compare",       href: "compare" },
  { tool: "chat-with-pdf", href: "chat-with-pdf" },
  { tool: "ai-summary",    href: "ai-summary" },
];

// ---------------------------------------------------------------------------
// Relative time helper
// ---------------------------------------------------------------------------
function formatRelativeTime(timestamp: number, isZh: boolean): string {
  const diff = Date.now() - timestamp;
  const m = Math.floor(diff / 60_000);
  const h = Math.floor(diff / 3_600_000);
  const d = Math.floor(diff / 86_400_000);
  if (m < 2) return isZh ? "刚刚" : "just now";
  if (h < 1) return isZh ? `${m}分钟前` : `${m}m ago`;
  if (h < 24) return isZh ? `${h}小时前` : `${h}h ago`;
  if (d === 1) return isZh ? "昨天" : "yesterday";
  const zhDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  if (d < 7) {
    return isZh
      ? zhDays[new Date(timestamp).getDay()]
      : new Date(timestamp).toLocaleDateString("en", { weekday: "short" });
  }
  return isZh ? `${d}天前` : `${d}d ago`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function DashboardWorkspace({ locale = "en" }: { locale?: DashLocale }) {
  const isZh = locale === "zh" || locale === "zh-Hant";
  const copy = isZh ? COPY.zh : COPY.en;

  const [history, setHistory] = useState<WorkHistoryItem[]>([]);
  const [userName, setUserName] = useState("…");

  useEffect(() => {
    setHistory(readWorkHistory());
    getDockAccountState()
      .then((state) => {
        const raw =
          state.user?.name ||
          state.user?.email?.split("@")[0] ||
          null;
        setUserName(raw ?? (isZh ? "你" : "you"));
      })
      .catch(() => setUserName(isZh ? "你" : "you"));
  }, [isZh]);

  const latest = history[0] ?? null;
  const recent = history.slice(0, 3);

  return (
    <main className="mx-auto max-w-3xl px-5 py-10 sm:px-6 lg:px-8">
      {/* ── Greeting ── */}
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--accent)]">
        {copy.eyebrow}
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">
        {copy.greet(userName)}
      </h1>

      {/* ── 继续上次 ── */}
      {latest && (
        <section className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">
            {copy.resume}
          </p>
          <a
            href={lp(locale, latest.href.replace(/^\//, ""))}
            className="mt-3 flex items-center justify-between gap-4 rounded-[var(--radius)] border border-[color:var(--accent)] bg-[color:var(--surface)] p-5 transition hover:border-[color:var(--accent-strong)] active:scale-[0.99]"
          >
            <div className="flex min-w-0 items-center gap-4">
              <span className="shrink-0 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-2 py-1 text-xs font-semibold text-[color:var(--muted)]">
                {copy.tools[latest.tool]}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold">{latest.fileName}</p>
                <p className="mt-0.5 text-sm text-[color:var(--muted)]">
                  {latest.subtitle} · {formatRelativeTime(latest.timestamp, isZh)}
                </p>
              </div>
            </div>
            <span className="shrink-0 text-sm font-semibold text-[color:var(--accent)]">
              {copy.resumeCta} →
            </span>
          </a>
        </section>
      )}

      {/* ── 最近 ── */}
      {recent.length > 0 && (
        <section className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">
            {copy.recent}
          </p>
          <div className="mt-3 grid gap-2">
            {recent.map((item) => (
              <a
                key={item.id}
                href={lp(locale, item.href.replace(/^\//, ""))}
                className="flex items-center gap-4 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-5 py-4 transition hover:border-[color:var(--line-strong)] active:scale-[0.99]"
              >
                <span className="w-20 shrink-0 text-xs font-semibold text-[color:var(--muted)]">
                  {copy.tools[item.tool]}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                  {item.fileName}
                </span>
                <span className="shrink-0 text-xs text-[color:var(--muted)]">
                  {item.subtitle} · {formatRelativeTime(item.timestamp, isZh)}
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ── 空状态 ── */}
      {history.length === 0 && (
        <p className="mt-8 rounded-[var(--radius)] border border-dashed border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-6 text-center text-sm text-[color:var(--muted)]">
          {copy.empty}
        </p>
      )}

      {/* ── 快捷开工 ── */}
      <section className="mt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">
          {copy.quick}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {QUICK_TOOLS.map(({ tool, href }) => (
            <a
              key={tool}
              href={lp(locale, href)}
              className="flex items-center justify-center rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-4 text-sm font-semibold transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] active:scale-[0.99]"
            >
              {copy.tools[tool]}
            </a>
          ))}
        </div>
      </section>

      {/* ── Privacy note ── */}
      <p className="mt-8 flex items-center gap-1.5 text-xs text-[color:var(--faint)]">
        <span aria-hidden="true">⚿</span>
        {copy.privacy}
      </p>
    </main>
  );
}
