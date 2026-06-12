// Shared About page — used by /about (EN) and /zh/about (ZH).
// Same design system as the homepage: flat #171717, weight-400 headings, mono
// --faint eyebrows, border-only cards, no internal dividers, strict colour ladder.

type Locale = "en" | "zh";

const content = {
  en: {
    eyebrow: "About DockDocs",
    heroTitle: ["Fast.", "Private.", "Honest."],
    heroSub: "DockDocs is a privacy-first AI PDF platform — about 50 tools, most running in your browser so your files never leave your device, plus AI that reads your documents and shows its sources.",
    cta1: "Use it free", cta2: "View pricing",

    missionEyebrow: "Mission",
    missionTitle: "Why DockDocs exists.",
    missionP1: "Document work shouldn't mean installing heavy software, paying for a feature you use once, or handing your files to an opaque cloud. The tools you reach for every day should be fast, private, and honest about what they do.",
    missionP2: "So we built one clean workspace for the whole flow — convert, organize, OCR, summarize, compare — local-first where possible, cloud only where it genuinely helps, and clearly marked when it does.",

    trustEyebrow: "Privacy",
    trustTitle: "Built around your files staying yours.",
    trust: [
      { title: "Files stay on your device", body: "Compress, merge, split, convert and more run entirely in your browser. Nothing is uploaded — no server copy to leak." },
      { title: "Cloud steps are labeled", body: "A few conversions (Office formats, large OCR) use a cloud engine. Those tools say so up front, before you start." },
      { title: "We never train AI on your docs", body: "Your files are processed to give you a result — never used to train models, never sold, never shared." },
      { title: "Files aren't kept", body: "Cloud conversions run, then the temporary copy is deleted automatically. We don't build a library of your documents." },
    ],

    forEyebrow: "Built for",
    forTitle: "Who it's for.",
    forItems: [
      { title: "Professionals & teams", body: "Compress for email, convert contracts, merge reports — without uploading sensitive files to unknown servers." },
      { title: "Students & researchers", body: "OCR scanned papers, summarize long PDFs, and ask documents to find what matters faster." },
      { title: "Anyone with a PDF", body: "No account, no install, no learning curve. Open the tool, drop your file, get your result." },
    ],

    payEyebrow: "Pricing",
    payTitle: "Honest by default.",
    payDesc: "Core tools are free and stay free. Plus unlocks the AI-heavy and high-volume features — on terms that respect you.",
    payPoints: [
      "AI features — Chat with PDF, summaries, and large-batch processing",
      "Higher limits — bigger files and large-file cloud conversion",
      "Cancel anytime — self-serve, a couple of clicks, no email-to-cancel games",
      "Transparent billing — clear prices, no surprise renewals",
    ],

    ctaTitle: "Open a tool. No account needed.",
    ctaSub: "Start with any tool right now — upgrade to Plus only if you need AI or higher limits.",
  },

  zh: {
    eyebrow: "关于 DockDocs",
    heroTitle: ["快速。", "私密。", "诚实。"],
    heroSub: "DockDocs 是隐私优先的 AI PDF 平台——约 50 个工具，大多在浏览器内运行，文件绝不离开你的设备；还有真正读懂文档、并给你看依据的 AI。",
    cta1: "免费使用", cta2: "查看定价",

    missionEyebrow: "使命",
    missionTitle: "DockDocs 为何存在。",
    missionP1: "文档工作不该意味着安装沉重软件、为只用一次的功能付费，或把文件交给不透明的云端。你每天要用的工具，应该快速、私密、并对它的行为诚实。",
    missionP2: "所以我们把整个流程收进一个干净的工作区——转换、整理、OCR、摘要、对比——能本地就本地，只在真正有帮助时才用云端，用到时明确标注。",

    trustEyebrow: "隐私",
    trustTitle: "围绕「文件始终是你的」来构建。",
    trust: [
      { title: "文件留在你的设备上", body: "压缩、合并、拆分、转换等完全在浏览器中运行。不上传任何内容——服务器上没有副本，也就无从泄露。" },
      { title: "云端步骤明确标注", body: "少数转换（Office 格式、大批量 OCR）需要云端引擎。这些工具会在你开始前清楚说明。" },
      { title: "绝不用你的文档训练 AI", body: "你的文件仅用于为你生成结果——绝不训练模型、绝不出售、绝不分享。" },
      { title: "不留存文件", body: "云端转换处理完成后，临时副本自动销毁。我们不会建立你的文档库。" },
    ],

    forEyebrow: "适用人群",
    forTitle: "为谁而建。",
    forItems: [
      { title: "专业人士与团队", body: "压缩发邮件、转换合同、合并报告——无需把敏感文件上传到陌生服务器。" },
      { title: "学生与研究者", body: "对扫描论文做 OCR、为长 PDF 生成摘要、向文档提问，更快找到关键内容。" },
      { title: "任何有 PDF 的人", body: "无需账户、无需安装、无需学习成本。打开工具，拖入文件，拿到结果。" },
    ],

    payEyebrow: "定价",
    payTitle: "默认诚实。",
    payDesc: "核心工具免费，并持续免费。Plus 解锁 AI 密集与大批量功能——配以尊重你的条款。",
    payPoints: [
      "AI 功能 —— PDF 问答、摘要、大批量处理",
      "更高额度 —— 更大文件、大文件云端转换",
      "随时取消 —— 自助、几次点击，没有「发邮件才能取消」套路",
      "透明计费 —— 价格清晰，没有意外续费",
    ],

    ctaTitle: "打开一个工具，无需注册。",
    ctaSub: "现在就从任意工具开始——只有需要 AI 或更高额度时，才升级 Plus。",
  },
} as const;

const Check = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0 text-[color:var(--accent)]"><path d="M3 8.5l3.2 3.2L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

export function AboutPage({ locale = "en" }: { locale?: Locale }) {
  const zh = locale === "zh";
  const c = content[zh ? "zh" : "en"];
  const eyebrow = `font-mono text-[12px] text-[color:var(--faint)] ${zh ? "" : "uppercase tracking-[0.08em]"}`;
  const path = (slug: string) => (zh ? `/zh${slug}` : slug);
  const card = "rounded-2xl border border-[color:var(--line)] p-6 transition-colors duration-200 hover:border-[color:var(--line-strong)]";

  return (
    <main>
      {/* ── Hero (who) — the only top hairline is the header's ── */}
      <section className="border-b border-[color:var(--line)]">
        <div className="mx-auto max-w-3xl px-5 pb-20 pt-24 text-center sm:px-6 sm:pb-28 sm:pt-32">
          <p className={eyebrow}>{c.eyebrow}</p>
          <h1 className="mt-5 text-[40px] font-normal leading-[1.04] tracking-[-0.03em] text-[color:var(--foreground)] sm:text-[58px] lg:text-[66px]">
            {c.heroTitle.map((w) => <span key={w}>{w} </span>)}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-[16px] leading-[1.6] text-[color:var(--muted)]">{c.heroSub}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href={path("/chat-with-pdf")} className="inline-flex h-11 items-center justify-center rounded-full bg-[color:var(--accent)] px-6 text-[14px] font-medium transition hover:bg-[color:var(--accent-hover)]">{c.cta1}</a>
            <a href={path("/pricing")} className="inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--line-strong)] px-6 text-[14px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--foreground)]">{c.cta2}</a>
          </div>
        </div>
      </section>

      {/* ── Mission (why) ── */}
      <section>
        <div className="mx-auto grid max-w-5xl gap-10 px-5 py-20 sm:px-6 sm:py-28 lg:grid-cols-[320px_1fr] lg:px-8">
          <div>
            <p className={eyebrow}>{c.missionEyebrow}</p>
            <h2 className="mt-4 text-[28px] font-normal leading-[1.15] tracking-[-0.02em] text-[color:var(--foreground)] sm:text-[34px]">{c.missionTitle}</h2>
          </div>
          <div className="space-y-5 text-[16px] leading-[1.7] text-[color:var(--muted)]">
            <p>{c.missionP1}</p>
            <p>{c.missionP2}</p>
          </div>
        </div>
      </section>

      {/* ── Privacy (why-trust) ── */}
      <section>
        <div className="mx-auto max-w-5xl px-5 py-20 sm:px-6 sm:py-28 lg:px-8">
          <p className={eyebrow}>{c.trustEyebrow}</p>
          <h2 className="mt-4 max-w-2xl text-[28px] font-normal leading-[1.15] tracking-[-0.02em] text-[color:var(--foreground)] sm:text-[36px]">{c.trustTitle}</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {c.trust.map((t) => (
              <div key={t.title} className={card}>
                <div className="flex items-start gap-2.5">
                  <Check />
                  <div>
                    <p className="text-[16px] font-normal text-[color:var(--foreground)]">{t.title}</p>
                    <p className="mt-2 text-[14px] leading-[1.6] text-[color:var(--muted)]">{t.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who it's for (who) ── */}
      <section>
        <div className="mx-auto max-w-5xl px-5 py-20 sm:px-6 sm:py-28 lg:px-8">
          <p className={eyebrow}>{c.forEyebrow}</p>
          <h2 className="mt-4 text-[28px] font-normal leading-[1.15] tracking-[-0.02em] text-[color:var(--foreground)] sm:text-[36px]">{c.forTitle}</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {c.forItems.map((f) => (
              <div key={f.title} className={card}>
                <p className="text-[16px] font-normal text-[color:var(--foreground)]">{f.title}</p>
                <p className="mt-2 text-[14px] leading-[1.6] text-[color:var(--muted)]">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing (what-paid) ── */}
      <section>
        <div className="mx-auto grid max-w-5xl gap-10 px-5 py-20 sm:px-6 sm:py-28 lg:grid-cols-[320px_1fr] lg:px-8">
          <div>
            <p className={eyebrow}>{c.payEyebrow}</p>
            <h2 className="mt-4 text-[28px] font-normal leading-[1.15] tracking-[-0.02em] text-[color:var(--foreground)] sm:text-[34px]">{c.payTitle}</h2>
            <p className="mt-4 max-w-xs text-[15px] leading-[1.6] text-[color:var(--muted)]">{c.payDesc}</p>
          </div>
          <ul className="space-y-3">
            {c.payPoints.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-[15px] leading-[1.55] text-[color:var(--foreground)]">
                <Check />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Final CTA — bottom hairline is owned by the footer ── */}
      <section>
        <div className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-6 sm:py-32">
          <h2 className="text-[28px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{c.ctaTitle}</h2>
          <p className="mx-auto mt-4 max-w-xl text-[16px] leading-[1.55] text-[color:var(--muted)]">{c.ctaSub}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href={path("/chat-with-pdf")} className="inline-flex h-11 items-center justify-center rounded-full bg-[color:var(--accent)] px-6 text-[14px] font-medium transition hover:bg-[color:var(--accent-hover)]">{c.cta1}</a>
            <a href={path("/pricing")} className="inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--line-strong)] px-6 text-[14px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--foreground)]">{c.cta2}</a>
          </div>
        </div>
      </section>
    </main>
  );
}
