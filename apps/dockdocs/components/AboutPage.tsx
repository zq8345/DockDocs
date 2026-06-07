// Shared About page component — used by both /about (EN) and /zh/about (ZH)

const content = {
  en: {
    eyebrow: "About DockDocs",
    heroTitle: "Document tools built to be fast, private, and honest.",
    heroDesc: "DockDocs is a privacy-first document platform. Compress, convert, merge, split, OCR, summarize, and chat with PDFs — most of it runs right in your browser, so your files never leave your device.",
    heroDesc2: "We're a young, independent product moving fast. What we promise, we put in writing below — and we'd rather be honest about what we are than inflate what we aren't.",
    cta1: "All PDF Tools",
    cta2: "View Pricing",

    // Capability stats (all verifiable facts, not user counts)
    stats: [
      { value: "20+", label: "Document tools" },
      { value: "Local", label: "Most tools run in-browser" },
      { value: "EN / ZH", label: "Fully bilingual" },
      { value: "No sign-up", label: "Free tools, no account" },
    ],

    // Trust / why pay
    trustEyebrow: "Why you can trust us with your files",
    trustTitle: "Built around your privacy",
    trust: [
      { title: "Your files stay on your device", body: "Compression, merging, splitting, rotation, image conversion, and more run entirely in your browser. Nothing is uploaded for these tools — there's no server copy to leak." },
      { title: "Cloud steps are clearly labeled", body: "A few conversions (Office formats, OCR at scale) need a cloud engine. Those tools say so plainly, up front. You always know where your file goes before you start." },
      { title: "We never train AI on your documents", body: "Your files and their contents are processed to give you a result — never used to train models, never sold, never shared with advertisers." },
      { title: "Files aren't kept", body: "Cloud conversions are processed and the temporary copy is discarded automatically. We don't build a library of your documents." },
    ],

    // Mission
    missionEyebrow: "Mission",
    missionTitle: "Why DockDocs exists",
    missionP1: "Document work shouldn't mean installing heavy software, paying for features you use once, or handing your files to an opaque cloud. We believe the tools you reach for every day should be fast, private, and honest about exactly what they do.",
    missionP2: "So we built one clean workspace that connects the whole flow — compress, convert, merge, OCR, summarize, and review — instead of scattering it across a dozen sites. Local-first where possible, cloud only where it genuinely helps, and clearly marked when it does.",

    // What you get when you pay
    payEyebrow: "Paying customers",
    payTitle: "What Plus gives you",
    payDesc: "Core tools are free and stay free. Plus unlocks the AI-heavy and high-volume features — with terms that respect you.",
    payPoints: [
      { title: "AI features", body: "Chat with PDF, AI summaries, and large-batch processing powered by leading language models." },
      { title: "Higher limits", body: "Bigger files and more conversions, including large-file cloud conversion that bypasses the usual upload caps." },
      { title: "Cancel anytime", body: "No lock-in. Manage or cancel your subscription yourself, in a couple of clicks — no email-us-to-cancel games." },
      { title: "Transparent billing", body: "Clear pricing, no hidden charges, no surprise renewals buried in fine print." },
    ],

    // Who it's for
    forEyebrow: "Built for",
    forTitle: "Who DockDocs is for",
    forItems: [
      { title: "Professionals & teams", body: "Compress for email, convert contracts, merge reports — without uploading sensitive files to unknown servers." },
      { title: "Students & researchers", body: "OCR scanned papers, summarize long PDFs, and chat with documents to find what matters faster." },
      { title: "Anyone with a PDF", body: "No account, no install, no learning curve. Open the tool, drop your file, get your result." },
    ],

    // Tools
    toolsEyebrow: "Tools",
    toolsTitle: "Popular workflows",
    tools: [
      { name: "Chat with PDF", href: "/chat-with-pdf", group: "AI" },
      { name: "Compress PDF",  href: "/compress-pdf",  group: "Optimize" },
      { name: "Merge PDF",     href: "/merge-pdf",     group: "Edit" },
      { name: "OCR PDF",       href: "/ocr-pdf",       group: "AI" },
      { name: "PDF to Word",   href: "/pdf-to-word",   group: "Convert" },
      { name: "Word to PDF",   href: "/word-to-pdf",   group: "Convert" },
    ],
    toolsViewAll: "View all 20+ tools →",

    ctaTitle: "Try the tools — most are free, no account needed.",
    ctaDesc: "Start with any tool right now. Upgrade to Plus only if you need AI features or higher limits.",
    ctaBtn: "Explore all tools",
  },

  zh: {
    eyebrow: "关于 DockDocs",
    heroTitle: "快速、私密、诚实的文档工具。",
    heroDesc: "DockDocs 是一个隐私优先的文档平台。压缩、转换、合并、拆分、OCR、摘要、PDF 问答——大部分功能直接在你的浏览器里运行，文件无需离开你的设备。",
    heroDesc2: "我们是一个年轻、独立、快速迭代的产品。我们承诺的，都写在下面白纸黑字——与其夸大我们还不是的样子，我们更愿意诚实说明我们是什么。",
    cta1: "所有 PDF 工具",
    cta2: "查看定价",

    stats: [
      { value: "20+", label: "文档工具" },
      { value: "本地", label: "多数工具浏览器内处理" },
      { value: "中 / 英", label: "完整双语" },
      { value: "免注册", label: "免费工具无需账户" },
    ],

    trustEyebrow: "为什么可以把文件放心交给我们",
    trustTitle: "围绕你的隐私构建",
    trust: [
      { title: "文件留在你的设备上", body: "压缩、合并、拆分、旋转、图片转换等功能完全在你的浏览器中运行。这些工具不上传任何内容——服务器上没有副本，也就无从泄露。" },
      { title: "云端步骤明确标注", body: "少数转换（Office 格式、大批量 OCR）需要云端引擎。这些工具会在你开始前清楚说明，你始终清楚文件的去向。" },
      { title: "绝不用你的文档训练 AI", body: "你的文件及其内容仅用于为你生成结果——绝不用于训练模型、绝不出售、绝不分享给广告商。" },
      { title: "不留存文件", body: "云端转换处理完成后，临时副本会自动销毁。我们不会建立你的文档库。" },
    ],

    missionEyebrow: "使命",
    missionTitle: "DockDocs 为何存在",
    missionP1: "文档工作不应该意味着安装沉重软件、为只用一次的功能付费，或把文件交给不透明的云端。我们相信，你每天要用的工具应该快速、私密、并对它的行为诚实。",
    missionP2: "所以我们构建了一个干净的工作区，把整个流程连接起来——压缩、转换、合并、OCR、摘要、审阅——而不是散落在十几个网站。能本地就本地，只在真正有帮助时才用云端，并且用到时明确标注。",

    payEyebrow: "付费用户",
    payTitle: "Plus 为你带来什么",
    payDesc: "核心工具免费，并将持续免费。Plus 解锁 AI 密集型和大批量功能——并配以尊重你的条款。",
    payPoints: [
      { title: "AI 功能", body: "PDF 问答、AI 摘要、大批量处理，由领先的大语言模型驱动。" },
      { title: "更高额度", body: "更大的文件和更多的转换次数，包括突破常规上传上限的大文件云端转换。" },
      { title: "随时取消", body: "无捆绑。自己几次点击即可管理或取消订阅——没有「发邮件才能取消」的套路。" },
      { title: "透明计费", body: "清晰定价，没有隐藏费用，没有埋在小字里的意外续费。" },
    ],

    forEyebrow: "适用人群",
    forTitle: "DockDocs 适合谁",
    forItems: [
      { title: "专业人士与团队", body: "为邮件压缩、转换合同、合并报告——无需把敏感文件上传到陌生服务器。" },
      { title: "学生与研究者", body: "对扫描论文做 OCR、为长 PDF 生成摘要、与文档对话，更快找到关键内容。" },
      { title: "任何有 PDF 的人", body: "无需账户、无需安装、无需学习成本。打开工具，拖入文件，拿到结果。" },
    ],

    toolsEyebrow: "工具",
    toolsTitle: "热门工作流",
    tools: [
      { name: "PDF 问答",     href: "/chat-with-pdf", group: "AI" },
      { name: "压缩 PDF",    href: "/compress-pdf",  group: "优化" },
      { name: "合并 PDF",    href: "/merge-pdf",     group: "编辑" },
      { name: "OCR PDF",     href: "/ocr-pdf",       group: "AI" },
      { name: "PDF 转 Word", href: "/pdf-to-word",   group: "转换" },
      { name: "Word 转 PDF", href: "/word-to-pdf",   group: "转换" },
    ],
    toolsViewAll: "查看全部 20+ 工具 →",

    ctaTitle: "试试这些工具——多数免费，无需注册。",
    ctaDesc: "现在就从任意工具开始。只有需要 AI 功能或更高额度时，才需要升级 Plus。",
    ctaBtn: "探索所有工具",
  },
} as const;

type Locale = "en" | "zh";

export function AboutPage({ locale = "en" }: { locale?: Locale }) {
  const c = content[locale] ?? content.en;
  const homeHref = locale === "zh" ? "/zh/" : "/";
  const pricingHref = locale === "zh" ? "/zh/pricing" : "/pricing";

  return (
    <main>
      {/* ── Hero ── */}
      <section className="border-b border-[color:var(--line)] bg-[color:var(--surface)]">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="grid items-start gap-12 lg:grid-cols-[1fr_1fr]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">{c.eyebrow}</p>
              <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.02em] text-[color:var(--foreground)] sm:text-4xl lg:text-5xl">{c.heroTitle}</h1>
              <p className="mt-5 text-base leading-8 text-[color:var(--muted)]">{c.heroDesc}</p>
              <p className="mt-4 text-base leading-8 text-[color:var(--muted)]">{c.heroDesc2}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={homeHref} className="inline-flex h-10 items-center rounded-[var(--radius)] bg-[color:var(--accent)] px-5 text-sm font-semibold text-white transition hover:opacity-90">{c.cta1}</a>
                <a href={pricingHref} className="inline-flex h-10 items-center rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-5 text-sm font-semibold text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--foreground)]">{c.cta2}</a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {c.stats.map(({ value, label }) => (
                <div key={label} className="rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-6">
                  <p className="text-2xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-3xl">{value}</p>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust / privacy (the core "why pay" trust block) ── */}
      <section className="border-b border-[color:var(--line)] bg-[color:var(--surface-subtle)]">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6 lg:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">{c.trustEyebrow}</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-3xl">{c.trustTitle}</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {c.trust.map((t) => (
              <div key={t.title} className="rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] p-6">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] bg-[color:var(--soft-accent)] text-[color:var(--accent-strong)]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 4 5v6c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V5l-8-3Z"/><path d="m9 12 2 2 4-4"/></svg>
                </div>
                <p className="text-[15px] font-semibold text-[color:var(--foreground)]">{t.title}</p>
                <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">{t.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="border-b border-[color:var(--line)] bg-[color:var(--surface)]">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[280px_1fr]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">{c.missionEyebrow}</p>
              <h2 className="mt-3 text-2xl font-semibold leading-snug tracking-tight text-[color:var(--foreground)]">{c.missionTitle}</h2>
            </div>
            <div className="space-y-5">
              <p className="text-base leading-8 text-[color:var(--muted)]">{c.missionP1}</p>
              <p className="text-base leading-8 text-[color:var(--muted)]">{c.missionP2}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── What Plus gives you ── */}
      <section className="border-b border-[color:var(--line)] bg-[color:var(--surface-subtle)]">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6 lg:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">{c.payEyebrow}</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-3xl">{c.payTitle}</h2>
          <p className="mt-3 max-w-2xl text-base leading-8 text-[color:var(--muted)]">{c.payDesc}</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {c.payPoints.map((p) => (
              <div key={p.title} className="flex gap-4 rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] p-6">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[color:var(--soft-accent)] text-[color:var(--accent-strong)]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-11"/></svg>
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-[color:var(--foreground)]">{p.title}</p>
                  <p className="mt-1.5 text-sm leading-7 text-[color:var(--muted)]">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who it's for ── */}
      <section className="border-b border-[color:var(--line)] bg-[color:var(--surface)]">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6 lg:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">{c.forEyebrow}</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-3xl">{c.forTitle}</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {c.forItems.map((f) => (
              <div key={f.title} className="rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-6">
                <p className="text-[15px] font-semibold text-[color:var(--foreground)]">{f.title}</p>
                <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tool highlights ── */}
      <section className="border-b border-[color:var(--line)] bg-[color:var(--surface-subtle)]">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6 lg:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">{c.toolsEyebrow}</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[color:var(--foreground)]">{c.toolsTitle}</h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {c.tools.map((tool) => (
              <a key={tool.href} href={tool.href} className="group flex items-center justify-between rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] px-5 py-4 transition hover:border-[color:var(--line-strong)]">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--faint)]">{tool.group}</p>
                  <p className="mt-1 text-[14px] font-semibold text-[color:var(--foreground)]">{tool.name}</p>
                </div>
                <span className="text-[color:var(--faint)] transition group-hover:text-[color:var(--muted)]">→</span>
              </a>
            ))}
          </div>
          <div className="mt-6 text-center">
            <a href={homeHref} className="text-sm font-medium text-[color:var(--accent)] hover:underline">{c.toolsViewAll}</a>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-[color:var(--surface)]">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-8 py-12 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-[color:var(--foreground)]">{c.ctaTitle}</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[color:var(--muted)]">{c.ctaDesc}</p>
            <a href={homeHref} className="mt-6 inline-flex h-10 items-center rounded-[var(--radius)] bg-[color:var(--accent)] px-6 text-sm font-semibold text-white transition hover:opacity-90">{c.ctaBtn}</a>
          </div>
        </div>
      </section>
    </main>
  );
}
