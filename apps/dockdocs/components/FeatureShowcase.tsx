// Linear-style alternating image+text feature sections.
// Visuals are crafted SVG/CSS product mockups (no real screenshots needed).

type Locale = "en" | "zh";

const copy = {
  en: {
    sectionEyebrow: "Built for real document work",
    sectionTitle: "Everything you need, in one fast workspace.",
    sectionSub: "From a quick compress to AI-powered document Q&A — clean tools that do exactly what they say.",
    features: [
      {
        eyebrow: "AI · Chat with PDF",
        title: "Ask your documents anything.",
        body: "Upload a PDF and ask questions in plain language. Get answers grounded in the document — no more scrolling through 80 pages to find one number.",
        cta: "Try Chat with PDF",
        href: "/chat-with-pdf",
        visual: "chat",
      },
      {
        eyebrow: "Optimize · Compress",
        title: "Smaller files, same document.",
        body: "Real compression that actually shrinks image-heavy PDFs — often by 50–70%. Pick a level, see the savings, download. All in your browser.",
        cta: "Compress a PDF",
        href: "/compress-pdf",
        visual: "compress",
      },
      {
        eyebrow: "Convert · 12 formats",
        title: "Convert between everything.",
        body: "PDF to Word, Excel, images, Markdown — and back. Office files in, clean PDFs out. Large files supported, layout preserved.",
        cta: "See all converters",
        href: "/pdf-to-word",
        visual: "convert",
      },
    ],
  },
  zh: {
    sectionEyebrow: "为真实的文档工作而生",
    sectionTitle: "你需要的一切，集成在一个快速的工作区。",
    sectionSub: "从快速压缩到 AI 文档问答——干净的工具，说到做到。",
    features: [
      {
        eyebrow: "AI · PDF 问答",
        title: "向你的文档提任何问题。",
        body: "上传 PDF，用日常语言提问。答案都基于文档内容——不必再翻遍 80 页去找一个数字。",
        cta: "试试 PDF 问答",
        href: "/chat-with-pdf",
        visual: "chat",
      },
      {
        eyebrow: "优化 · 压缩",
        title: "文件更小，文档不变。",
        body: "真正有效的压缩，对图片型 PDF 常能减小 50–70%。选择级别、查看节省、下载完成——全程在浏览器中。",
        cta: "压缩一个 PDF",
        href: "/compress-pdf",
        visual: "compress",
      },
      {
        eyebrow: "转换 · 12 种格式",
        title: "在各种格式间自由转换。",
        body: "PDF 转 Word、Excel、图片、Markdown——也能转回来。Office 文件进，干净 PDF 出。支持大文件，保留版式。",
        cta: "查看全部转换工具",
        href: "/pdf-to-word",
        visual: "convert",
      },
    ],
  },
} as const;

export function FeatureShowcase({ locale = "en" }: { locale?: Locale }) {
  const c = copy[locale] ?? copy.en;

  return (
    <section className="border-b border-[color:var(--line)] bg-[color:var(--surface)]">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-28 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">{c.sectionEyebrow}</p>
          <h2 className="mt-3 text-[28px] font-semibold leading-[1.15] tracking-[-0.02em] text-[color:var(--foreground)] sm:text-[36px]">{c.sectionTitle}</h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-7 text-[color:var(--muted)]">{c.sectionSub}</p>
        </div>

        {/* Alternating feature rows */}
        <div className="mt-16 space-y-20 sm:mt-20 sm:space-y-28">
          {c.features.map((f, i) => {
            const reversed = i % 2 === 1;
            return (
              <div key={f.title} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                {/* Text */}
                <div className={reversed ? "lg:order-2" : ""}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">{f.eyebrow}</p>
                  <h3 className="mt-3 text-[24px] font-semibold leading-[1.2] tracking-[-0.018em] text-[color:var(--foreground)] sm:text-[30px]">{f.title}</h3>
                  <p className="mt-4 text-[15px] leading-8 text-[color:var(--muted)]">{f.body}</p>
                  <a href={locale === "zh" ? `/zh${f.href}` : f.href}
                    className="mt-6 inline-flex items-center gap-1.5 text-[14px] font-semibold text-[color:var(--accent)] transition hover:gap-2.5"
                  >
                    {f.cta}
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                  </a>
                </div>

                {/* Visual */}
                <div className={reversed ? "lg:order-1" : ""}>
                  <Mockup kind={f.visual} locale={locale} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Product mockups (SVG/CSS, theme-aware) ──
function Mockup({ kind, locale }: { kind: string; locale: Locale }) {
  const zh = locale === "zh";
  const frame = "relative overflow-hidden rounded-[var(--radius-xl)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] shadow-[0_20px_60px_rgba(0,0,0,0.18)]";

  if (kind === "chat") {
    return (
      <div className={frame}>
        <div className="flex items-center gap-1.5 border-b border-[color:var(--line)] px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--line-strong)]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--line-strong)]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--line-strong)]" />
          <span className="ml-3 text-[12px] text-[color:var(--faint)]">{zh ? "报告.pdf · 84 页" : "report.pdf · 84 pages"}</span>
        </div>
        <div className="space-y-4 p-5">
          <div className="flex justify-end">
            <div className="max-w-[78%] rounded-2xl rounded-br-md bg-[color:var(--accent)] px-4 py-2.5 text-[13px] leading-6 text-white">
              {zh ? "第三季度净利润是多少？" : "What was the Q3 net profit?"}
            </div>
          </div>
          <div className="flex justify-start">
            <div className="max-w-[82%] rounded-2xl rounded-bl-md bg-[color:var(--surface)] px-4 py-2.5 text-[13px] leading-6 text-[color:var(--foreground)] ring-1 ring-[color:var(--line)]">
              {zh ? "第三季度净利润为 ¥1,240 万，环比增长 18%（见第 42 页）。" : "Q3 net profit was $12.4M, up 18% from Q2 (see page 42)."}
            </div>
          </div>
          <div className="flex justify-start">
            <div className="flex gap-1 rounded-2xl rounded-bl-md bg-[color:var(--surface)] px-4 py-3 ring-1 ring-[color:var(--line)]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[color:var(--faint)]" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[color:var(--faint)] [animation-delay:0.2s]" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[color:var(--faint)] [animation-delay:0.4s]" />
            </div>
          </div>
        </div>
        <div className="border-t border-[color:var(--line)] px-5 py-3">
          <div className="flex items-center gap-2 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-2">
            <span className="flex-1 text-[12px] text-[color:var(--faint)]">{zh ? "继续提问…" : "Ask a follow-up…"}</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-[var(--radius-sm)] bg-[color:var(--accent)] text-white">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (kind === "compress") {
    return (
      <div className={frame}>
        <div className="border-b border-[color:var(--line)] px-5 py-3 text-[12px] font-medium text-[color:var(--muted)]">{zh ? "压缩 PDF" : "Compress PDF"}</div>
        <div className="p-6">
          <div className="flex items-center justify-between text-[12px] text-[color:var(--muted)]">
            <span>{zh ? "原始大小" : "Original"}</span>
            <span className="font-semibold text-[color:var(--foreground)]">9.4 MB</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-[color:var(--line)]">
            <div className="h-full w-full rounded-full bg-[color:var(--line-strong)]" />
          </div>
          <div className="mt-5 flex items-center justify-between text-[12px]">
            <span className="text-[color:var(--muted)]">{zh ? "压缩后" : "Compressed"}</span>
            <span className="font-semibold text-[color:var(--foreground)]">2.2 MB</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-[color:var(--line)]">
            <div className="h-full w-[23%] rounded-full bg-[color:var(--accent)]" />
          </div>
          <div className="mt-6 flex items-center justify-center gap-2 rounded-[var(--radius)] border border-[color:var(--success-line)] bg-[color:var(--success-surface)] py-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-11"/></svg>
            <span className="text-[14px] font-semibold text-[color:var(--success)]">{zh ? "已节省 74%" : "Saved 74%"}</span>
          </div>
        </div>
      </div>
    );
  }

  // convert
  const rows = [
    { from: "PDF", to: "Word", ext: "docx" },
    { from: "PDF", to: "Excel", ext: "xlsx" },
    { from: "Word", to: "PDF", ext: "pdf" },
    { from: "PDF", to: "Markdown", ext: "md" },
  ];
  return (
    <div className={frame}>
      <div className="border-b border-[color:var(--line)] px-5 py-3 text-[12px] font-medium text-[color:var(--muted)]">{zh ? "转换" : "Convert"}</div>
      <div className="space-y-2 p-5">
        {rows.map((r) => (
          <div key={r.to} className="flex items-center justify-between rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-3">
            <div className="flex items-center gap-2.5 text-[13px]">
              <span className="rounded-[var(--radius-sm)] bg-[color:var(--surface-subtle)] px-2 py-0.5 font-semibold text-[color:var(--muted)]">{r.from}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              <span className="rounded-[var(--radius-sm)] bg-[color:var(--soft-accent)] px-2 py-0.5 font-semibold text-[color:var(--accent-strong)]">{r.to}</span>
            </div>
            <span className="text-[11px] text-[color:var(--faint)]">.{r.ext}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
