"use client";

import { useEffect, useRef, useState } from "react";

type Locale = "en" | "zh";

// Scroll-reveal wrapper: fades + slides children in when they enter view.
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setShown(true); return; }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setShown(true); io.disconnect(); }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
    >
      {children}
    </div>
  );
}

const copy = {
  en: {
    stepsEyebrow: "How it works",
    stepsTitle: "Three steps. No account. No friction.",
    steps: [
      { n: "1", title: "Open a tool", body: "Pick from 20+ tools. Nothing to install, no sign-up to start." },
      { n: "2", title: "Drop your file", body: "Most tools process right in your browser — your file never leaves your device." },
      { n: "3", title: "Get your result", body: "Download instantly. Compress, convert, merge, summarize — done in seconds." },
    ],
    metricsEyebrow: "Why people choose DockDocs",
    metrics: [
      { value: "74%", label: "Typical size cut on image PDFs" },
      { value: "100 MB", label: "Max file for cloud conversion" },
      { value: "0", label: "Files stored on our servers" },
      { value: "20+", label: "Tools in one workspace" },
    ],
    quote: "\u201cFinally a PDF site that doesn't upload my files to who-knows-where. Compress and convert, all local, all fast.\u201d",
    quoteName: "What privacy-first users want",
  },
  zh: {
    stepsEyebrow: "如何使用",
    stepsTitle: "三步搞定。无需注册，毫无阻碍。",
    steps: [
      { n: "1", title: "打开工具", body: "从 20+ 工具中选择。无需安装，无需注册即可开始。" },
      { n: "2", title: "拖入文件", body: "多数工具直接在浏览器中处理——文件绝不离开你的设备。" },
      { n: "3", title: "获取结果", body: "即时下载。压缩、转换、合并、摘要——几秒完成。" },
    ],
    metricsEyebrow: "为什么选择 DockDocs",
    metrics: [
      { value: "74%", label: "图片型 PDF 常见压缩率" },
      { value: "100 MB", label: "云端转换最大文件" },
      { value: "0", label: "服务器留存的文件数" },
      { value: "20+", label: "一个工作区集成的工具" },
    ],
    quote: "\u201c终于有个不把我文件上传到不知道哪里的 PDF 网站了。压缩、转换全在本地，又快又稳。\u201d",
    quoteName: "隐私优先用户的心声",
  },
} as const;

export function HomeExtras({ locale = "en" }: { locale?: Locale }) {
  const c = copy[locale] ?? copy.en;

  return (
    <>
      {/* How it works */}
      <section className="border-b border-[color:var(--line)] bg-[color:var(--surface-subtle)]">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-24 lg:px-8">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">{c.stepsEyebrow}</p>
              <h2 className="mt-3 text-[26px] font-semibold leading-[1.15] tracking-[-0.02em] text-[color:var(--foreground)] sm:text-[34px]">{c.stepsTitle}</h2>
            </div>
          </Reveal>
          <div className="mt-14 grid gap-5 sm:grid-cols-3">
            {c.steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 120}>
                <div className="relative h-full rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--accent)] text-[16px] font-bold text-white">{s.n}</div>
                  <p className="mt-5 text-[16px] font-semibold text-[color:var(--foreground)]">{s.title}</p>
                  <p className="mt-2 text-[14px] leading-7 text-[color:var(--muted)]">{s.body}</p>
                  {i < c.steps.length - 1 && (
                    <span className="absolute right-5 top-7 hidden text-[color:var(--faint)] sm:block">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                    </span>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Metrics band */}
      <section className="border-b border-[color:var(--line)] bg-[color:var(--surface)]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
          <Reveal>
            <p className="text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">{c.metricsEyebrow}</p>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--line)] sm:grid-cols-4">
            {c.metrics.map((m, i) => (
              <Reveal key={m.label} delay={i * 90}>
                <div className="h-full bg-[color:var(--surface)] px-5 py-8 text-center">
                  <p className="text-[32px] font-semibold tracking-tight text-[color:var(--foreground)] sm:text-[38px]">{m.value}</p>
                  <p className="mt-2 text-[12px] leading-5 text-[color:var(--muted)]">{m.label}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Quote */}
          <Reveal delay={120}>
            <figure className="mx-auto mt-12 max-w-3xl rounded-[var(--radius-xl)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-8 text-center">
              <blockquote className="text-[17px] font-medium leading-8 tracking-[-0.01em] text-[color:var(--foreground)] sm:text-[19px]">{c.quote}</blockquote>
              <figcaption className="mt-4 text-[13px] text-[color:var(--muted)]">{c.quoteName}</figcaption>
            </figure>
          </Reveal>
        </div>
      </section>
    </>
  );
}
