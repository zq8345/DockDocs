"use client";

type Locale = "en" | "zh";

const copy = {
  en: {
    eyebrow: "Why DockDocs",
    features: [
      {
        title: "Compress PDFs without losing quality",
        body: "Smart compression that reduces file size while keeping documents readable. Down from 15MB to 3MB — email and upload ready.",
        tag: "Compress",
      },
      {
        title: "Merge and split in your browser",
        body: "No server uploads. Combine multiple PDFs into one, or extract pages — all processed locally so your files stay private.",
        tag: "Merge & Split",
      },
      {
        title: "AI that reads your documents",
        body: "Chat with any PDF. Ask questions, get summaries, extract key points — AI grounded in your actual document, not generic answers.",
        tag: "AI",
      },
    ],
  },
  zh: {
    eyebrow: "为什么选择 DockDocs",
    features: [
      {
        title: "压缩 PDF 不损质量",
        body: "智能压缩减小文件体积，同时保持文档可读。从 15MB 压到 3MB — 邮件和上传就绪。",
        tag: "压缩",
      },
      {
        title: "浏览器内合并和拆分",
        body: "无需上传到服务器。合并多个 PDF 为一个，或提取页面 — 全部在本地处理，文件不外泄。",
        tag: "合并与拆分",
      },
      {
        title: "AI 读懂你的文档",
        body: "与任何 PDF 对话。提问、获取摘要、提取要点 — AI 基于你的实际文档作答，而非通用回复。",
        tag: "AI",
      },
    ],
  },
} as const;

export function FeatureShowcase({ locale = "en" }: { locale?: Locale }) {
  const c = copy[locale] ?? copy.en;

  return (
    <section className="border-b border-[color:var(--line)] bg-[color:var(--surface)]">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-24 lg:px-8">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
          {c.eyebrow}
        </p>

        <div className="mt-12 grid gap-10 sm:gap-12">
          {c.features.map((f, i) => (
            <div
              key={f.title}
              className={`grid items-center gap-8 sm:grid-cols-2 sm:gap-12 ${
                i % 2 === 1 ? "sm:[direction:rtl]" : ""
              }`}
            >
              {/* Image side */}
              <div
                className={`rounded-[var(--radius-xl)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-8 ${
                  i % 2 === 1 ? "sm:[direction:ltr]" : ""
                }`}
              >
                <div className="flex items-center justify-center" style={{ minHeight: 160 }}>
                  <FeatureIllustration index={i} />
                </div>
              </div>

              {/* Text side */}
              <div className={i % 2 === 1 ? "sm:[direction:ltr]" : ""}>
                <span className="inline-flex rounded-full border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--accent)]">
                  {f.tag}
                </span>
                <h3 className="mt-4 text-[22px] font-semibold leading-[1.2] tracking-[-0.02em] text-[color:var(--foreground)] sm:text-[26px]">
                  {f.title}
                </h3>
                <p className="mt-3 max-w-md text-[15px] leading-7 text-[color:var(--muted)]">
                  {f.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureIllustration({ index }: { index: number }) {
  const illustrations = [
    // Compress: file → smaller file
    <svg key="0" width="200" height="120" viewBox="0 0 200 120" fill="none">
      <rect x="40" y="20" width="80" height="80" rx="6" stroke="var(--foreground)" strokeWidth="2" opacity="0.3" />
      <rect x="48" y="30" width="64" height="4" rx="2" fill="var(--foreground)" opacity="0.2" />
      <rect x="48" y="40" width="48" height="3" rx="1.5" fill="var(--foreground)" opacity="0.15" />
      <rect x="48" y="48" width="56" height="3" rx="1.5" fill="var(--foreground)" opacity="0.15" />
      <rect x="48" y="56" width="40" height="3" rx="1.5" fill="var(--foreground)" opacity="0.15" />
      <circle cx="145" cy="50" r="16" stroke="var(--accent)" strokeWidth="2.5" />
      <path d="M140 55l4-4 6 6" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="155" y="62" width="30" height="24" rx="4" stroke="var(--accent)" strokeWidth="2" opacity="0.6" />
      <rect x="158" y="66" width="24" height="3" rx="1.5" fill="var(--accent)" opacity="0.4" />
    </svg>,

    // Merge & Split: documents combining/splitting
    <svg key="1" width="200" height="120" viewBox="0 0 200 120" fill="none">
      <rect x="20" y="15" width="36" height="48" rx="4" stroke="var(--foreground)" strokeWidth="2" opacity="0.25" />
      <rect x="30" y="55" width="36" height="48" rx="4" stroke="var(--foreground)" strokeWidth="2" opacity="0.35" />
      <rect x="40" y="35" width="36" height="48" rx="4" stroke="var(--foreground)" strokeWidth="2" opacity="0.3" />
      <line x1="90" y1="60" x2="140" y2="60" stroke="var(--accent)" strokeWidth="2" strokeDasharray="4 3" />
      <rect x="145" y="30" width="42" height="56" rx="6" stroke="var(--accent)" strokeWidth="2.5" />
      <rect x="152" y="40" width="28" height="3" rx="1.5" fill="var(--accent)" opacity="0.4" />
      <rect x="152" y="48" width="22" height="3" rx="1.5" fill="var(--accent)" opacity="0.3" />
      <rect x="152" y="56" width="18" height="3" rx="1.5" fill="var(--accent)" opacity="0.3" />
    </svg>,

    // AI Chat: document + chat bubbles
    <svg key="2" width="200" height="120" viewBox="0 0 200 120" fill="none">
      <rect x="10" y="25" width="55" height="70" rx="6" stroke="var(--foreground)" strokeWidth="2" opacity="0.3" />
      <rect x="18" y="35" width="40" height="3" rx="1.5" fill="var(--foreground)" opacity="0.2" />
      <rect x="18" y="44" width="35" height="3" rx="1.5" fill="var(--foreground)" opacity="0.15" />
      <rect x="18" y="52" width="30" height="3" rx="1.5" fill="var(--foreground)" opacity="0.15" />
      <circle cx="105" cy="35" r="14" stroke="var(--accent)" strokeWidth="2" />
      <path d="M99 35l4 0" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
      <rect x="130" y="50" width="60" height="28" rx="8" stroke="var(--accent)" strokeWidth="2" />
      <rect x="140" y="58" width="40" height="2" rx="1" fill="var(--accent)" opacity="0.4" />
      <rect x="140" y="64" width="30" height="2" rx="1" fill="var(--accent)" opacity="0.3" />
      <line x1="110" y1="85" x2="150" y2="85" stroke="var(--accent)" strokeWidth="2" />
      <circle cx="155" cy="85" r="5" stroke="var(--accent)" strokeWidth="2" />
    </svg>,
  ];

  return illustrations[index] ?? illustrations[0];
}
