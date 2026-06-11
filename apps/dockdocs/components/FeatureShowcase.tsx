"use client";

import { useEffect, useRef, useState } from "react";

type Locale = "en" | "zh";

const KF = `
@keyframes fsRise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes fsPulse{0%,100%{opacity:.5}50%{opacity:1}}
@keyframes fsBar{0%{width:8%}55%{width:100%}100%{width:100%}}
@keyframes fsBlink{0%,100%{opacity:.2}50%{opacity:1}}
@keyframes fsFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
`;

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setShown(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`transition-all duration-700 ease-out ${shown ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"} ${className}`}>
      {children}
    </div>
  );
}

const copy = {
  en: {
    eyebrow: "Why DockDocs",
    heading: "Not just another PDF site.",
    sub: "DockDocs reads your documents, compares them, and shows its work — so you can trust the answer.",
    solutions: [
      {
        tag: "Multi-doc · Beta",
        title: "Compare many documents, pick the best in seconds",
        body: "Drop in several quotes, contracts or reports. DockDocs lines up the key fields, flags the differences, and recommends a winner — with every number traceable to its source.",
        cta: "Try compare", href: "compare", visual: "compare",
      },
      {
        tag: "Private · Free",
        title: "20+ PDF tools, most run right in your browser",
        body: "Compress, merge, split, convert, watermark, OCR. Most tools process locally — your file never leaves your device, and no sign-up is needed to start.",
        cta: "Browse tools", href: "sitemap", visual: "privacy",
      },
      {
        tag: "AI",
        title: "AI that reads your documents — ask, summarize, translate",
        body: "Chat with any PDF and get answers grounded in the actual text, summarize long reports to the key points, or translate into 18 languages. Real understanding, not generic replies.",
        cta: "Chat with a PDF", href: "chat-with-pdf", visual: "ai",
      },
    ],
    metricsTitle: "The numbers that matter",
    metrics: [
      { value: "0", label: "Files uploaded to our servers" },
      { value: "100%", label: "AI answers trace to the source" },
      { value: "20+", label: "Free PDF tools in one place" },
      { value: "18", label: "Languages for instant translation" },
    ],
    quote: "“Finally a PDF site that doesn't ship my files to who-knows-where — and when I ask the AI something, it points me to the exact line.”",
    quoteName: "What privacy-first users want",
  },
  zh: {
    eyebrow: "为什么选择 DockDocs",
    heading: "不止是又一个 PDF 网站。",
    sub: "DockDocs 读懂你的文档、把多份摆在一起对比，还把依据摆给你看——答案你能核对。",
    solutions: [
      {
        tag: "多文档 · Beta",
        title: "多份文档一起对比，几秒选出最优",
        body: "一次传多份报价、合同或报告。DockDocs 自动对齐关键字段、标出差异、给出带理由的推荐——而且每个数字都能追回原文出处。",
        cta: "试试对比", href: "compare", visual: "compare",
      },
      {
        tag: "隐私 · 免费",
        title: "20+ PDF 工具，大多在浏览器内完成",
        body: "压缩、合并、拆分、转换、加水印、OCR。多数工具本地处理——文件不离开你的设备，无需注册即可开始。",
        cta: "浏览工具", href: "sitemap", visual: "privacy",
      },
      {
        tag: "AI",
        title: "AI 读懂你的文档：问答 · 摘要 · 翻译",
        body: "和任意 PDF 对话，答案基于文档原文；把长报告浓缩成要点；或翻译成 18 种语言。是真正的理解，而非通用回复。",
        cta: "与 PDF 对话", href: "chat-with-pdf", visual: "ai",
      },
    ],
    metricsTitle: "更有说服力的数据",
    metrics: [
      { value: "0", label: "文件上传到我们的服务器" },
      { value: "100%", label: "AI 答案都能点回原文" },
      { value: "20+", label: "免费 PDF 工具，集中一处" },
      { value: "18", label: "种语言即时翻译" },
    ],
    quote: "“终于有个不把我文件传到不知道哪里的 PDF 网站了——而且问 AI 问题时，它能直接指到原文那一行。”",
    quoteName: "隐私优先用户的心声",
  },
} as const;

function Visual({ kind, locale }: { kind: string; locale: Locale }) {
  const zh = locale === "zh";
  if (kind === "compare") return <CompareVisual zh={zh} />;
  if (kind === "privacy") return <PrivacyVisual zh={zh} />;
  return <AiVisual zh={zh} />;
}

function CompareVisual({ zh }: { zh: boolean }) {
  const docs = zh ? ["报价 A", "报价 B", "报价 C"] : ["Quote A", "Quote B", "Quote C"];
  const rows = zh
    ? [["价格", "$9,200", "$8,800", "$9,500", 1], ["交期", "14 天", "21 天", "18 天", 0], ["质保", "1 年", "2 年", "1 年", 1]]
    : [["Price", "$9,200", "$8,800", "$9,500", 1], ["Lead time", "14 d", "21 d", "18 d", 0], ["Warranty", "1 yr", "2 yr", "1 yr", 1]];
  return (
    <div className="w-full">
      <div className="mb-3 flex gap-2">
        {docs.map((d, i) => (
          <span key={d} className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] px-2.5 py-1 text-[11px] font-medium text-[color:var(--muted)]" style={{ animation: "fsRise .5s ease-out both", animationDelay: `${i * 90}ms` }}>
            <span className={`h-2 w-2 rounded-sm ${i === 1 ? "bg-[color:var(--accent)]" : "bg-[color:var(--line-strong)]"}`} />{d}
          </span>
        ))}
      </div>
      <div className="overflow-hidden rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)]">
        {rows.map((r, ri) => (
          <div key={ri} className="grid grid-cols-4 border-b border-[color:var(--line)] text-[12.5px] last:border-b-0" style={{ animation: "fsRise .5s ease-out both", animationDelay: `${250 + ri * 110}ms` }}>
            <div className="px-3 py-2.5 font-medium text-[color:var(--faint)]">{r[0]}</div>
            {[1, 2, 3].map((ci) => {
              const win = (r[4] as number) === ci - 1;
              return (
                <div key={ci} className={`px-3 py-2.5 text-center ${win ? "font-semibold text-[color:var(--accent-strong)]" : "text-[color:var(--muted)]"}`}>
                  <span className={win ? "rounded bg-[color:var(--soft-accent)] px-1.5 py-0.5" : ""} style={win ? { animation: "fsPulse 2.6s ease-in-out infinite" } : undefined}>{r[ci]}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[color:var(--line-strong)] bg-[color:var(--surface)] px-3 py-1 text-[12px] font-semibold text-[color:var(--accent-strong)]" style={{ animation: "fsRise .5s ease-out both", animationDelay: "650ms" }}>
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3.2 3.2L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        {zh ? "推荐：报价 B · 综合最优" : "Recommended: Quote B · best overall"}
      </div>
    </div>
  );
}

function PrivacyVisual({ zh }: { zh: boolean }) {
  const tools = zh ? ["压缩", "合并", "拆分", "OCR", "加水印", "+ 更多"] : ["Compress", "Merge", "Split", "OCR", "Watermark", "+ more"];
  return (
    <div className="w-full">
      <div className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] text-[color:var(--accent)]" style={{ animation: "fsFloat 3.4s ease-in-out infinite" }}>
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" /><path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4" /></svg>
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-[color:var(--foreground)]">{zh ? "本地处理中…" : "Processing locally…"}</p>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[color:var(--surface-subtle)]">
              <div className="h-full rounded-full bg-[color:var(--accent)]" style={{ animation: "fsBar 2.8s ease-in-out infinite" }} />
            </div>
          </div>
        </div>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[color:var(--soft-accent)] px-2.5 py-1 text-[11px] font-semibold text-[color:var(--accent-strong)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent)]" />{zh ? "0 文件上传 · 浏览器内完成" : "0 uploads · runs in your browser"}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {tools.map((t, i) => (
          <span key={t} className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] px-2.5 py-1 text-[11.5px] font-medium text-[color:var(--muted)]" style={{ animation: "fsRise .5s ease-out both", animationDelay: `${i * 70}ms` }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

function AiVisual({ zh }: { zh: boolean }) {
  const bullets = zh ? ["营收同比 +23%", "亚太区为主要驱动", "毛利率 41%（↑3pt）"] : ["Revenue +23% YoY", "APAC is the main driver", "Gross margin 41% (↑3pt)"];
  const langs = ["EN", "中文", "ES", "日本語", "FR", "+13"];
  return (
    <div className="w-full">
      <div className="flex items-stretch gap-3">
        <div className="flex w-[34%] flex-col gap-1.5 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-3">
          {[80, 60, 70, 50, 65].map((w, i) => (
            <span key={i} className="h-1.5 rounded-full bg-[color:var(--line-strong)]" style={{ width: `${w}%`, opacity: 0.5 }} />
          ))}
          <span className="mt-1 text-[10px] font-medium text-[color:var(--faint)]">{zh ? "报告.pdf" : "report.pdf"}</span>
        </div>
        <div className="flex items-center text-[color:var(--accent)]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <div className="flex-1 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--accent)]">{zh ? "AI 摘要" : "AI summary"}</p>
          {bullets.map((b, i) => (
            <div key={b} className="mb-1.5 flex items-start gap-1.5 text-[12px] text-[color:var(--foreground)]" style={{ animation: "fsRise .5s ease-out both", animationDelay: `${200 + i * 130}ms` }}>
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--accent)]" />{b}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-medium text-[color:var(--faint)]">{zh ? "翻译：" : "Translate:"}</span>
        {langs.map((l, i) => (
          <span key={l} className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] px-2 py-0.5 text-[11px] font-medium text-[color:var(--muted)]" style={{ animation: "fsRise .5s ease-out both", animationDelay: `${i * 70}ms` }}>{l}</span>
        ))}
      </div>
    </div>
  );
}

export function FeatureShowcase({ locale = "en" }: { locale?: Locale }) {
  const c = copy[locale] ?? copy.en;
  const lp = (s: string) => (locale === "zh" ? `/zh/${s}` : `/${s}`);

  return (
    <section className="border-b border-[color:var(--line)] bg-[color:var(--surface)]">
      <style>{KF}</style>
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-24 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">{c.eyebrow}</p>
          <h2 className="mt-3 text-[26px] font-semibold leading-[1.15] tracking-[-0.02em] text-[color:var(--foreground)] sm:text-[34px]">{c.heading}</h2>
          <p className="mt-3 text-[15px] leading-7 text-[color:var(--muted)]">{c.sub}</p>
        </Reveal>

        <div className="mt-14 grid gap-12 sm:gap-16">
          {c.solutions.map((f, i) => (
            <div key={f.title} className={`grid items-center gap-8 sm:grid-cols-2 sm:gap-14 ${i % 2 === 1 ? "sm:[direction:rtl]" : ""}`}>
              {/* Visual side (big) */}
              <Reveal className={i % 2 === 1 ? "sm:[direction:ltr]" : ""}>
                <div className="rounded-[var(--radius-xl)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-6 sm:p-8">
                  <div className="flex min-h-[220px] items-center">
                    <Visual kind={f.visual} locale={locale} />
                  </div>
                </div>
              </Reveal>

              {/* Text side */}
              <Reveal delay={120} className={i % 2 === 1 ? "sm:[direction:ltr]" : ""}>
                <span className="inline-flex rounded-full border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--accent)]">{f.tag}</span>
                <h3 className="mt-4 text-[22px] font-semibold leading-[1.2] tracking-[-0.02em] text-[color:var(--foreground)] sm:text-[26px]">{f.title}</h3>
                <p className="mt-3 max-w-md text-[15px] leading-7 text-[color:var(--muted)]">{f.body}</p>
                <a href={lp(f.href)} className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-semibold text-[color:var(--accent-strong)] transition hover:gap-2.5">
                  {f.cta}
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 8h9M8 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </a>
              </Reveal>
            </div>
          ))}
        </div>

        {/* Metrics band — folded-in supporting data */}
        <Reveal className="mt-20">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">{c.metricsTitle}</p>
        </Reveal>
        <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--line)] sm:grid-cols-4">
          {c.metrics.map((m, i) => (
            <Reveal key={m.label} delay={i * 90}>
              <div className="h-full bg-[color:var(--surface)] px-5 py-8 text-center">
                <p className="text-[32px] font-semibold tracking-tight text-[color:var(--foreground)] sm:text-[38px]">{m.value}</p>
                <p className="mt-2 text-[12px] leading-5 text-[color:var(--muted)]">{m.label}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <figure className="mx-auto mt-12 max-w-3xl rounded-[var(--radius-xl)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-8 text-center">
            <blockquote className="text-[17px] font-medium leading-8 tracking-[-0.01em] text-[color:var(--foreground)] sm:text-[19px]">{c.quote}</blockquote>
            <figcaption className="mt-4 text-[13px] text-[color:var(--muted)]">{c.quoteName}</figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
