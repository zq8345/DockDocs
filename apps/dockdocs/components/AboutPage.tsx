// Shared About page component — used by both /about (EN) and /zh/about (ZH)

const content = {
  en: {
    eyebrow: "About DockDocs",
    heroTitle: "A global document productivity platform.",
    heroDesc: "DockDocs is a privacy-first AI document platform built for teams, students, and professionals. We build the tools people need every day — compress, convert, merge, split, OCR, summarize, and review documents — in one fast, honest workspace.",
    heroDesc2: "Our approach is simple: browser-side processing where possible, clear labels when cloud is required, and no dark patterns around free features.",
    cta1: "All PDF Tools",
    cta2: "Read the Blog",
    stats: [
      { value: "20+",  label: "PDF tools" },
      { value: "100%", label: "Browser-side for free tools" },
      { value: "EN/ZH", label: "Bilingual platform" },
      { value: "Free",  label: "Core tools, no sign-up" },
    ],
    missionEyebrow: "Mission",
    missionTitle: "Why DockDocs exists",
    missionP1: "Document work shouldn't require installing heavy software, paying for features you use once, or surrendering your files to opaque cloud processes. DockDocs was built on a simple belief: the tools you need every day should be fast, private, and honest about what they do.",
    missionP2: "We started with PDF compression and OCR and grew into a full document platform — because the real problem isn't any single task, it's the fragmented workflow across compress, convert, review, summarize, and sign. We're building the workspace that connects those steps.",
    principlesEyebrow: "How we build",
    principlesTitle: "Principles",
    principles: [
      { n: "01", title: "Privacy first", body: "Browser-side tools process your files locally — nothing is uploaded to a server unless you choose a cloud conversion feature. Every cloud tool is clearly labeled so you always know where your file goes." },
      { n: "02", title: "Built for global use", body: "DockDocs is designed for multilingual, multi-region document workflows. Full EN/ZH support is live, with more languages on the way. Every page, tool, and header switches language together." },
      { n: "03", title: "Honest tools", body: "We don't hide limitations behind vague error messages. Each tool states exactly what it accepts, what it does, and what it produces. No surprise sign-up walls on free features." },
    ],
    historyEyebrow: "History",
    historyTitle: "Building DockDocs",
    timeline: [
      { year: "2021", event: "DockDocs founded. First PDF compression and OCR tools launched." },
      { year: "2022", event: "Expanded tool set. Added AI Summary and Chat with PDF beta." },
      { year: "2023", event: "Chat with PDF reaches general availability. Full EN/ZH bilingual support." },
      { year: "2024", event: "Launched 20+ browser-side tools: Merge, Split, Rotate, Reorder, Protect, and image conversion." },
      { year: "2025", event: "Cloud conversion suite: Word, PPT, Excel ↔ PDF via CloudConvert. Comprehensive audit and performance pass." },
    ],
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
    ctaTitle: "Ready to start working with your documents?",
    ctaDesc: "Free to use. No account required for most tools. Upgrade to Plus for AI features.",
    ctaBtn: "Explore all tools",
  },
  zh: {
    eyebrow: "关于 DockDocs",
    heroTitle: "面向全球的文档生产力平台。",
    heroDesc: "DockDocs 是面向团队、学生和专业人士的隐私优先 AI 文档平台。我们构建人们每天需要的工具——压缩、转换、合并、拆分、OCR、摘要和文档审阅——集成在一个快速、诚实的工作区中。",
    heroDesc2: "我们的原则简单：能在浏览器端处理的就本地处理，需要云端时明确标注，不在免费功能上设暗门。",
    cta1: "所有 PDF 工具",
    cta2: "阅读博客",
    stats: [
      { value: "20+",  label: "PDF 工具" },
      { value: "100%", label: "免费工具全部浏览器处理" },
      { value: "中/英", label: "双语平台" },
      { value: "免费",  label: "核心工具无需注册" },
    ],
    missionEyebrow: "使命",
    missionTitle: "DockDocs 为何存在",
    missionP1: "文档工作不应该要求安装沉重软件、为偶尔使用的功能付费，或者把文件交给不透明的云端流程。DockDocs 建立在一个简单信念之上：每天需要的工具应该快速、私密、对它的行为诚实。",
    missionP2: "我们从 PDF 压缩和 OCR 起步，发展成完整的文档平台——因为真正的问题不是某一个任务，而是压缩、转换、审阅、摘要、签署这些步骤之间的割裂工作流。我们在构建把这些步骤连接起来的工作区。",
    principlesEyebrow: "我们如何构建",
    principlesTitle: "原则",
    principles: [
      { n: "01", title: "隐私优先", body: "浏览器端工具在本地处理你的文件——除非你选择了云端转换功能，否则不会上传到服务器。每个云端工具都有明确标注，让你清楚文件去向。" },
      { n: "02", title: "面向全球构建", body: "DockDocs 为多语言、多地区的文档工作流而设计。中英文完整支持已上线，更多语言正在规划中。每个页面、工具和页眉都能同步切换语言。" },
      { n: "03", title: "诚实的工具", body: "我们不用模糊错误信息掩盖限制。每个工具都清楚说明它接受什么、做什么、产出什么。免费功能不设惊喜注册墙。" },
    ],
    historyEyebrow: "历史",
    historyTitle: "构建 DockDocs",
    timeline: [
      { year: "2021", event: "DockDocs 创立。推出首批 PDF 压缩和 OCR 工具。" },
      { year: "2022", event: "扩展工具集，推出 AI 摘要和 Chat with PDF 测试版。" },
      { year: "2023", event: "Chat with PDF 正式上线。完整中英文双语支持。" },
      { year: "2024", event: "推出 20+ 浏览器端工具：合并、拆分、旋转、排序、保护和图片转换。" },
      { year: "2025", event: "云端转换套件：Word、PPT、Excel ↔ PDF（via CloudConvert）。全面审计和性能优化。" },
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
    ctaTitle: "准备好开始处理你的文档了吗？",
    ctaDesc: "大多数工具免费使用，无需注册。升级 Plus 享受 AI 功能。",
    ctaBtn: "探索所有工具",
  },
} as const;

type Locale = "en" | "zh";

export function AboutPage({ locale = "en" }: { locale?: Locale }) {
  const c = content[locale] ?? content.en;
  const homeHref = locale === "zh" ? "/zh/" : "/";
  const blogHref = locale === "zh" ? "/zh/blog" : "/blog";

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
                <a href={blogHref} className="inline-flex h-10 items-center rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-5 text-sm font-semibold text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--foreground)]">{c.cta2}</a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {c.stats.map(({ value, label }) => (
                <div key={label} className="rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-6">
                  <p className="text-3xl font-semibold tracking-tight text-[color:var(--foreground)]">{value}</p>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="border-b border-[color:var(--line)] bg-[color:var(--surface-subtle)]">
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

      {/* ── Principles ── */}
      <section className="border-b border-[color:var(--line)] bg-[color:var(--surface)]">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6 lg:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">{c.principlesEyebrow}</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[color:var(--foreground)]">{c.principlesTitle}</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {c.principles.map((p) => (
              <div key={p.title} className="rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-6">
                <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-[color:var(--soft-accent)] text-[11px] font-bold text-[color:var(--accent-strong)]">{p.n}</div>
                <p className="text-[15px] font-semibold text-[color:var(--foreground)]">{p.title}</p>
                <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="border-b border-[color:var(--line)] bg-[color:var(--surface-subtle)]">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6 lg:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">{c.historyEyebrow}</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[color:var(--foreground)]">{c.historyTitle}</h2>
          <div className="mt-10">
            {c.timeline.map((item, i) => (
              <div key={item.year} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] text-[11px] font-bold text-[color:var(--accent)]">✓</div>
                  {i < c.timeline.length - 1 && <div className="mt-1 w-px flex-1 bg-[color:var(--line)]" style={{ minHeight: "28px" }} />}
                </div>
                <div className="pb-8">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--accent)]">{item.year}</p>
                  <p className="mt-1 text-sm leading-7 text-[color:var(--muted)]">{item.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tool highlights ── */}
      <section className="border-b border-[color:var(--line)] bg-[color:var(--surface)]">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6 lg:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">{c.toolsEyebrow}</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[color:var(--foreground)]">{c.toolsTitle}</h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {c.tools.map((tool) => (
              <a key={tool.href} href={tool.href} className="group flex items-center justify-between rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-5 py-4 transition hover:border-[color:var(--line-strong)]">
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
      <section className="bg-[color:var(--surface-subtle)]">
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
