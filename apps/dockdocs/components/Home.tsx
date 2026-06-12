"use client";

import type { ReactNode } from "react";
import { navCategories } from "@/components/Header";

type Locale = "en" | "zh";
type Item = { name: string; slug: string };

const COPY = {
  en: {
    eyebrow: "Privacy-first AI PDF platform",
    heroA: "Read any document.",
    heroB: "Trust every answer.",
    heroSub: "~50 PDF tools that run in your browser, plus AI that reads, compares and extracts your documents — with sources you can click back to.",
    primary: "Use it free",
    secondary: "See how privacy works",
    proofHeading: "Your files never leave your device.",
    proof: [{ t: "Processed in your browser" }, { g: "0", t: " files uploaded" }, { t: "Answers cite the source" }, { t: "No sign-up" }],
    aiEyebrow: "Grounded AI",
    aiHeading: "AI that shows its work.",
    aiSub: "Ask any document and every answer points back to the exact line it came from. Compare, extract, summarize — grounded, never guessed.",
    aiCta: "Chat with a PDF",
    aiChips: ["Compare", "Extract to Excel", "Summarize", "Translate 18 languages"],
    capEyebrow: "What you can do",
    capHeading: "One toolkit. Four ways to work.",
    capSub: "About 50 PDF tools in one place — convert, organize, sign, redact, OCR — most running locally in your browser.",
    browseAll: "Browse all tools",
    more: (n: number) => `and ${n} more`,
    tools: "tools",
    ctaHeadA: "Read any document.",
    ctaHeadB: "Trust every answer.",
    ctaSub: "~50 tools, grounded AI, nothing uploaded. Free to start — no sign-up.",
    viewPricing: "View pricing",
    aiSummary: "AI summary",
    cite: "source",
  },
  zh: {
    eyebrow: "隐私优先的 AI PDF 平台",
    heroA: "读懂任意文档，",
    heroB: "答案皆可追溯。",
    heroSub: "约 50 个 PDF 工具在浏览器内运行，AI 读懂、对比、抽取你的文档——每个答案都能点回原文。",
    primary: "免费使用",
    secondary: "看隐私怎么做到",
    proofHeading: "你的文件，从不离开你的设备。",
    proof: [{ t: "在浏览器内处理" }, { g: "0", t: " 文件上传" }, { t: "答案可溯源" }, { t: "无需注册" }],
    aiEyebrow: "AI · 可溯源",
    aiHeading: "会给你看依据的 AI。",
    aiSub: "向任意文档提问，每个答案都能点回它出自的那一行。对比、抽取、摘要——有据可查，绝不瞎猜。",
    aiCta: "与 PDF 对话",
    aiChips: ["多文档对比", "抽取到表格", "摘要", "翻译 18 种语言"],
    capEyebrow: "能做什么",
    capHeading: "一个工具箱，四种用法。",
    capSub: "约 50 个 PDF 工具集中一处——转换、整理、签名、脱敏、OCR——大多在浏览器本地完成。",
    browseAll: "浏览全部工具",
    more: (n: number) => `还有 ${n} 个`,
    tools: "个工具",
    ctaHeadA: "读懂任意文档，",
    ctaHeadB: "答案皆可追溯。",
    ctaSub: "约 50 个工具，可溯源 AI，零上传。免费开始，无需注册。",
    viewPricing: "查看定价",
    aiSummary: "AI 摘要",
    cite: "原文",
  },
} as const;

// category icons (nav order: 0 PDF · 1 Batch · 2 AI · 3 Profession)
const ICONS: Record<number, ReactNode> = {
  0: <path d="M7 3h6l4 4v10a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z M13 3v4h4" />,
  1: <path d="M4 8l8-4 8 4-8 4-8-4Z M4 12l8 4 8-4 M4 16l8 4 8-4" />,
  2: <path d="M12 3l1.8 4.7L18.5 9l-4.7 1.8L12 15.5l-1.8-4.7L5.5 9l4.7-1.3L12 3Z" />,
  3: <path d="M5 9h14v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V9Z M9 9V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />,
};

function flatItems(cat: { cols: { items: Item[] }[] }): Item[] {
  const seen = new Set<string>(); const out: Item[] = [];
  for (const col of cat.cols) for (const it of col.items ?? []) { const k = it.name + it.slug; if (!seen.has(k)) { seen.add(k); out.push(it); } }
  return out;
}

const EYEBROW = (zh: boolean) => `font-mono text-[12px] text-[color:var(--faint)] ${zh ? "" : "uppercase tracking-[0.08em]"}`;
const CARD = "group relative overflow-hidden rounded-2xl border border-[color:var(--line)] p-6 transition-colors duration-200 hover:border-[color:var(--line-strong)]";
const GLOW = { background: "radial-gradient(480px circle at 30% 0%, rgba(62,207,142,0.06), transparent 62%)" };

function Icon({ i }: { i: number }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[color:var(--line)] text-[color:var(--accent)]">
      <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{ICONS[i]}</svg>
    </span>
  );
}

// ── mini-visuals (border-only on flat #171717) ──
function MiniThumbs() {
  return (
    <div className="flex items-end gap-2">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex h-14 w-10 flex-col gap-1 rounded-md border border-[color:var(--line)] p-1.5" style={i === 1 ? { transform: "translateY(-6px) rotate(-5deg)", borderColor: "var(--line-strong)" } : undefined}>
          {[70, 90, 55].map((w, k) => <span key={k} className="h-[3px] rounded-full bg-[rgba(255,255,255,0.12)]" style={{ width: `${w}%` }} />)}
        </div>
      ))}
      <div className="flex h-14 w-10 items-center justify-center rounded-md border border-dashed border-[color:var(--line-strong)] text-[16px] text-[color:var(--faint)]">+</div>
    </div>
  );
}
function MiniExtract({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-16 w-12 flex-col gap-1 rounded-md border border-[color:var(--line)] p-1.5">
        {[80, 60, 75, 50, 65].map((w, k) => <span key={k} className="h-[3px] rounded-full bg-[rgba(255,255,255,0.1)]" style={{ width: `${w}%` }} />)}
      </div>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[color:var(--accent)]"><path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      <div className="flex-1 rounded-md border border-[color:var(--line)] p-2">
        <p className="mb-1.5 text-[9px] font-normal uppercase tracking-[0.1em] text-[color:var(--faint)]">{label}</p>
        {[0, 1, 2].map((k) => (
          <div key={k} className="mb-1 flex items-center gap-1.5 last:mb-0">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--accent)]" />
            <span className="h-[3px] flex-1 rounded-full bg-[rgba(255,255,255,0.12)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
function MiniBatch() {
  return (
    <div>
      <div className="relative h-14">
        {[0, 1, 2].map((i) => (
          <div key={i} className="absolute h-12 w-10 rounded-md border border-[color:var(--line)]" style={{ left: `${i * 10}px`, top: `${i * 3}px`, background: "var(--background)" }} />
        ))}
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.08)]">
        <div className="hfg-bar h-full rounded-full bg-[color:var(--accent)]" style={{ width: "70%" }} />
      </div>
      <p className="mt-1.5 text-[11px] text-[color:var(--faint)]">142 files</p>
    </div>
  );
}
function MiniSecure() {
  return (
    <div className="relative flex h-16 w-full flex-col justify-center gap-1.5 rounded-md border border-[color:var(--line)] px-3">
      <span className="h-[3px] w-[60%] rounded-full bg-[rgba(255,255,255,0.12)]" />
      <span className="h-[6px] w-[45%] rounded-sm bg-black" />
      <span className="h-[3px] w-[70%] rounded-full bg-[rgba(255,255,255,0.12)]" />
      <svg className="absolute right-3 top-3 text-[color:var(--accent)]" width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" /><path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4" /></svg>
    </div>
  );
}

const CARDS: { nav: number; span: number; visual: "thumbs" | "extract" | "batch" | "secure" }[] = [
  { nav: 0, span: 2, visual: "thumbs" },
  { nav: 2, span: 1, visual: "extract" },
  { nav: 1, span: 2, visual: "batch" },
  { nav: 3, span: 1, visual: "secure" },
];

export function Home({ locale = "en" }: { locale?: Locale }) {
  const zh = locale === "zh";
  const c = COPY[zh ? "zh" : "en"];
  const cats = (navCategories[zh ? "zh" : "en"] ?? navCategories.en).slice(0, 4);
  const path = (slug: string) => (zh ? `/zh${slug}` : slug);

  return (
    <>
      <style>{`
        @keyframes hfgFill{from{width:0}to{width:70%}}
        @keyframes hfgIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        .hfg-bar{animation:hfgFill 1.6s cubic-bezier(.2,.8,.2,1) both}
        .hfg-in{animation:hfgIn .7s ease-out both}
        @media (prefers-reduced-motion: reduce){.hfg-bar,.hfg-in{animation:none}}
      `}</style>

      {/* ── Hero (who) — the only top hairline sits under the global header ── */}
      <section className="border-b border-[color:var(--line)]">
        <div className="mx-auto max-w-3xl px-5 pb-20 pt-24 text-center sm:px-6 sm:pb-28 sm:pt-32">
          <p className={EYEBROW(zh)}>{c.eyebrow}</p>
          <h1 className="mt-5 text-[36px] font-normal leading-[1.05] tracking-[-0.03em] text-[color:var(--foreground)] sm:text-[54px] lg:text-[64px]">
            {c.heroA}<br />{c.heroB}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-[16px] leading-[1.55] text-[color:var(--muted)]">{c.heroSub}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href={path("/chat-with-pdf")} className="inline-flex h-11 items-center justify-center rounded-full bg-[color:var(--accent)] px-6 text-[14px] font-medium transition hover:bg-[color:var(--accent-hover)]">{c.primary}</a>
            <a href={path("/privacy-policy")} className="inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--line-strong)] px-6 text-[14px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--foreground)]">{c.secondary}</a>
          </div>
        </div>
      </section>

      {/* ── Proof strip (proof) — no box, whitespace only ── */}
      <section>
        <div className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-6 sm:py-28">
          <p className="text-[18px] font-normal text-[color:var(--foreground)]">{c.proofHeading}</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5">
            {c.proof.map((f, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 text-[13px] text-[color:var(--muted)]">
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="text-[color:var(--accent)]"><path d="M3 8.5l3.2 3.2L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                {"g" in f && f.g ? <span className="font-medium text-[color:var(--accent)]">{f.g}</span> : null}
                <span className="text-[color:var(--foreground)]">{f.t}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI "shows its work" (why) — left-aligned flagship ── */}
      <section>
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 sm:grid-cols-2 sm:px-6 sm:py-28 lg:px-8">
          <div>
            <p className={EYEBROW(zh)}>{c.aiEyebrow}</p>
            <h2 className="mt-4 text-[28px] font-normal leading-[1.15] tracking-[-0.02em] text-[color:var(--foreground)] sm:text-[36px]">{c.aiHeading}</h2>
            <p className="mt-4 max-w-md text-[16px] leading-[1.55] text-[color:var(--muted)]">{c.aiSub}</p>
            <a href={path("/chat-with-pdf")} className="mt-6 inline-flex items-center gap-1.5 text-[14px] font-medium text-[color:var(--accent)] transition hover:gap-2.5">
              {c.aiCta}
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 8h9M8 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </a>
            <div className="mt-6 flex flex-wrap gap-2">
              {c.aiChips.map((chip) => (
                <span key={chip} className="rounded-full border border-[color:var(--line)] px-3 py-1 text-[12px] text-[color:var(--muted)]">{chip}</span>
              ))}
            </div>
          </div>
          {/* flagship visual: report → AI summary with a clickable-looking citation */}
          <div className="hfg-in rounded-xl border border-[color:var(--line)] p-5">
            <div className="flex items-stretch gap-3">
              <div className="flex w-[36%] flex-col gap-1.5 rounded-lg border border-[color:var(--line)] p-3">
                {[80, 60, 70, 50, 65, 55].map((w, i) => <span key={i} className={`h-[3px] rounded-full ${i === 2 ? "bg-[color:var(--accent)]" : "bg-[rgba(255,255,255,0.1)]"}`} style={{ width: `${w}%`, opacity: i === 2 ? 0.9 : 1 }} />)}
                <span className="mt-1 text-[10px] text-[color:var(--faint)]">report.pdf</span>
              </div>
              <div className="flex items-center text-[color:var(--accent)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <div className="flex-1 rounded-lg border border-[color:var(--line)] p-3">
                <p className="mb-2 text-[10px] font-normal uppercase tracking-[0.12em] text-[color:var(--faint)]">{c.aiSummary}</p>
                <div className="mb-1.5 flex items-center gap-1.5 text-[12px] text-[color:var(--foreground)]">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--accent)]" />
                  <span>{zh ? "营收同比 +23%" : "Revenue +23% YoY"}</span>
                  <span className="ml-auto inline-flex items-center gap-1 rounded border border-[color:var(--line)] px-1.5 py-0.5 text-[9px] font-medium text-[color:var(--accent)]">{c.cite}</span>
                </div>
                {[zh ? "亚太区为主要驱动" : "APAC is the main driver", zh ? "毛利率 41%（↑3pt）" : "Gross margin 41% (↑3pt)"].map((b) => (
                  <div key={b} className="mb-1.5 flex items-center gap-1.5 text-[12px] text-[color:var(--muted)] last:mb-0">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[rgba(255,255,255,0.2)]" />{b}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Capability bento (what) — breadth as a count, not a list ── */}
      <section>
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-28 lg:px-8">
          <p className={EYEBROW(zh)}>{c.capEyebrow}</p>
          <h2 className="mt-4 text-[28px] font-normal leading-[1.15] tracking-[-0.02em] text-[color:var(--foreground)] sm:text-[36px]">{c.capHeading}</h2>
          <p className="mt-4 max-w-2xl text-[16px] leading-[1.55] text-[color:var(--muted)]">{c.capSub}</p>

          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            {CARDS.map(({ nav, span, visual }) => {
              const cat = cats[nav];
              if (!cat) return null;
              const tools = flatItems(cat as { cols: { items: Item[] }[] });
              const chips = tools.slice(0, 4);
              const more = tools.length - chips.length;
              return (
                <div key={nav} className={`${CARD} ${span === 2 ? "md:col-span-2" : "md:col-span-1"}`}>
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={GLOW} />
                  <div className="relative flex h-full flex-col">
                    <div className="flex items-center gap-3">
                      <Icon i={nav} />
                      <h3 className="text-[18px] font-normal text-[color:var(--foreground)] sm:text-[20px]">{cat.label}</h3>
                      <span className="ml-auto text-[12px] text-[color:var(--faint)]">{tools.length} {c.tools}</span>
                    </div>
                    <div className="mt-5">
                      {visual === "thumbs" && <MiniThumbs />}
                      {visual === "extract" && <MiniExtract label={c.aiSummary} />}
                      {visual === "batch" && <MiniBatch />}
                      {visual === "secure" && <MiniSecure />}
                    </div>
                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      {chips.map((t) => (
                        <a key={t.slug} href={path(t.slug)} className="rounded-full border border-[color:var(--line)] px-2.5 py-1 text-[12px] text-[color:var(--muted)] transition-colors hover:border-[color:var(--line-strong)] hover:text-[color:var(--foreground)]">{t.name}</a>
                      ))}
                      {more > 0 && (
                        <a href={path("/sitemap")} className="inline-flex items-center gap-1 px-1 text-[12px] text-[color:var(--accent)] transition hover:text-[color:var(--accent-strong)]">{c.more(more)} →</a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <a href={path("/sitemap")} className="mt-8 inline-flex items-center gap-1.5 text-[14px] font-medium text-[color:var(--accent)] transition hover:gap-2.5">
            {c.browseAll}
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 8h9M8 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </a>
        </div>
      </section>

      {/* ── Final CTA (cta) — reprise; the only bottom hairline is owned by the footer ── */}
      <section>
        <div className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-6 sm:py-32">
          <h2 className="text-[28px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">
            {c.ctaHeadA}<br className="sm:hidden" />{c.ctaHeadB}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[16px] leading-[1.55] text-[color:var(--muted)]">{c.ctaSub}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href={path("/chat-with-pdf")} className="inline-flex h-11 items-center justify-center rounded-full bg-[color:var(--accent)] px-6 text-[14px] font-medium transition hover:bg-[color:var(--accent-hover)]">{c.primary}</a>
            <a href={path("/pricing")} className="inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--line-strong)] px-6 text-[14px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--foreground)]">{c.viewPricing}</a>
          </div>
        </div>
      </section>
    </>
  );
}
