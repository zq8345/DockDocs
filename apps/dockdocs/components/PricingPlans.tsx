"use client";

import { useState } from "react";
import { localizedPath, type RouteSlug } from "@/lib/i18n";
import { createBillingCheckoutSession } from "@/lib/subscription-runtime";
import type { PaidSubscriptionPlan } from "@/lib/billing-config";

type Locale = "en" | "zh";

const copy = {
  en: {
    title: "Simple pricing. Powerful documents.",
    subtitle: "Start free — no account, no card. Upgrade only when you need AI, bigger files, or higher volume. Cancel anytime, in two clicks.",
    monthly: "Monthly",
    yearly: "Yearly",
    save: "Save ~40%",
    perMo: "/mo",
    mostPopular: "Most popular",
    billedYearly: (v: string) => `${v} billed yearly`,
    // trust bar
    trust: ["7-day money-back guarantee", "Cancel anytime, no questions", "Files never used to train AI"],
    plans: [
      {
        name: "Free",
        monthlyPrice: "$0",
        yearlyPrice: "$0",
        tagline: "Everything you need for everyday PDF work.",
        highlights: ["20+ PDF tools — convert, compress, merge, split", "Encrypt, edit pages & OCR scanned docs", "Processed in your browser — files stay private", "Free forever, no account needed"],
        cta: "Start free now",
        href: "/chat-with-pdf" as RouteSlug,
        featured: false,
      },
      {
        name: "Plus",
        monthlyPrice: "$5",
        yearlyPrice: "$3",
        yearlyTotal: "$36/yr",
        tagline: "AI reads and compares your documents — in seconds.",
        valueLine: "Less than a coffee a month.",
        highlights: ["Everything in Free", "Chat with any PDF — answers cite the source", "AI summaries & key points in seconds", "Compare multiple documents side by side", "100 MB files, batch & priority, no ads"],
        cta: "Upgrade to Plus",
        href: "" as RouteSlug,
        featured: true,
      },
      {
        name: "Pro",
        monthlyPrice: "$20",
        yearlyPrice: "$12",
        yearlyTotal: "$144/yr",
        tagline: "Automate document workflows & professional review.",
        highlights: ["Everything in Plus", "Automate batch document workflows", "Contract review — flags risky & missing clauses", "API access & auto-classification", "Team workspace & priority support"],
        cta: "Upgrade to Pro",
        href: "" as RouteSlug,
        featured: false,
      },
    ],
    faqTitle: "Questions before you buy",
    faq: [
      { q: "Can I cancel anytime?", a: "Yes. Manage or cancel your subscription yourself in a couple of clicks — no emails, no retention games. You keep access until the end of the period you paid for." },
      { q: "Is there a refund?", a: "Yes. If Plus or Pro isn't right for you, request a refund within 7 days of payment and we'll return it." },
      { q: "Do I need to pay to use DockDocs?", a: "No. All 20+ core PDF tools are free forever, with no account required. You only pay if you want AI features, larger files, or higher volume." },
      { q: "What happens to my files?", a: "Most tools process entirely in your browser — your files never leave your device. Cloud conversions are processed and the temporary copy is deleted automatically. We never use your documents to train AI." },
      { q: "Can I switch plans later?", a: "Anytime. Upgrade, downgrade, or move between monthly and yearly whenever you like." },
    ],
    ctaTitle: "Try it free — decide later.",
    ctaDesc: "Open any tool right now. No account, no card, no commitment.",
    ctaBtn: "Start with a free tool",
    scenariosTitle: "What can DockDocs solve for you?",
    scenarios: [
      { emoji: "📊", title: "Compare quotes & pick the best", before: "Open 3 files, copy numbers into a sheet — ~1 hour", after: "Upload → side-by-side table + a sourced pick — 1 min", tier: "Plus", href: "/compare" as RouteSlug },
      { emoji: "📄", title: "Catch the traps in a contract", before: "Pay a lawyer $300, or sign blind and get burned", after: "AI flags risky & missing clauses in minutes", tier: "Pro", href: "/compare" as RouteSlug },
      { emoji: "🧾", title: "Process a batch of invoices", before: "Key them in one by one — hours, or hire help", after: "Drop the whole batch → auto-extract & summarize", tier: "Pro", href: "/extract-to-excel" as RouteSlug },
      { emoji: "📕", title: "Understand a long report fast", before: "Read 80 pages to find a few answers — hours", after: "Ask it anything → sourced answers in 30s", tier: "Plus", href: "/chat-with-pdf" as RouteSlug },
    ],
    compareTitle: "Compare plans",
    compareCols: ["Free", "Plus", "Pro"],
    compareRows: [
      { f: "20+ PDF tools — convert, compress, merge, encrypt, OCR", v: ["✓", "✓", "✓"] },
      { f: "Chat with PDF · AI summaries", v: ["—", "✓", "✓"] },
      { f: "AI translate PDF (keeps layout)", v: ["—", "Soon", "Soon"] },
      { f: "Compare multiple documents", v: ["—", "✓", "✓"] },
      { f: "100 MB files · batch · no ads", v: ["—", "✓", "✓"] },
      { f: "Automate workflows · API · auto-classify", v: ["—", "—", "✓"] },
      { f: "Contract review — risk & missing clauses", v: ["—", "—", "✓"] },
      { f: "Team workspace · priority support", v: ["—", "—", "✓"] },
    ],
  },
  zh: {
    title: "定价简单，文档强大。",
    subtitle: "免费开始——无需注册、无需信用卡。只在你需要 AI、更大文件或更高用量时才升级。随时取消，两次点击搞定。",
    monthly: "按月",
    yearly: "按年",
    save: "省约 40%",
    perMo: "/月",
    mostPopular: "最受欢迎",
    billedYearly: (v: string) => `按年计费 ${v}`,
    trust: ["7 天无理由退款", "随时取消，绝不刁难", "绝不用文件训练 AI"],
    plans: [
      {
        name: "免费",
        monthlyPrice: "$0",
        yearlyPrice: "$0",
        tagline: "日常 PDF 工作所需的一切。",
        highlights: ["20+ PDF 工具:转换、压缩、合并、拆分", "加密、页面编辑、扫描件 OCR", "浏览器本地处理——文件保持私密", "永久免费,无需注册"],
        cta: "立即免费开始",
        href: "/chat-with-pdf" as RouteSlug,
        featured: false,
      },
      {
        name: "Plus",
        monthlyPrice: "$5",
        yearlyPrice: "$3",
        yearlyTotal: "$36/年",
        tagline: "AI 替你读懂、横比文档——几秒搞定。",
        valueLine: "每月不到一杯咖啡的钱。",
        highlights: ["包含「免费」全部功能", "和任意 PDF 对话——答案带原文出处", "AI 摘要与要点,几秒搞定", "多份文档并排对比", "100MB 大文件、批量与优先、无广告"],
        cta: "升级到 Plus",
        href: "" as RouteSlug,
        featured: true,
      },
      {
        name: "Pro",
        monthlyPrice: "$20",
        yearlyPrice: "$12",
        yearlyTotal: "$144/年",
        tagline: "自动跑文档流程 + 专业领域审查。",
        highlights: ["包含「Plus」全部功能", "批量文档工作流自动化", "合同审查——标出风险与缺失条款", "API 接入与自动分类", "团队工作区与优先支持"],
        cta: "升级到 Pro",
        href: "" as RouteSlug,
        featured: false,
      },
    ],
    faqTitle: "购买前的疑问",
    faq: [
      { q: "可以随时取消吗？", a: "可以。你自己几次点击即可管理或取消订阅——无需发邮件，没有挽留套路。在你已付费的周期结束前，仍可正常使用。" },
      { q: "支持退款吗？", a: "支持。如果 Plus 或 Pro 不适合你，在付款后 7 天内申请退款，我们会全额退还。" },
      { q: "使用 DockDocs 必须付费吗？", a: "不必。全部 20+ 核心 PDF 工具永久免费，且无需注册。只有在你需要 AI 功能、更大文件或更高用量时才需付费。" },
      { q: "我的文件会怎样？", a: "大多数工具完全在你的浏览器中处理——文件绝不离开你的设备。云端转换处理后会自动删除临时副本。我们绝不会用你的文档训练 AI。" },
      { q: "之后可以更换套餐吗？", a: "随时可以。升级、降级，或在按月与按年之间切换，随你心意。" },
    ],
    ctaTitle: "先免费试用——之后再决定。",
    ctaDesc: "现在就打开任意工具。无需注册、无需信用卡、无需承诺。",
    ctaBtn: "从一个免费工具开始",
    scenariosTitle: "DockDocs 能替你解决什么?",
    scenarios: [
      { emoji: "📊", title: "比报价,选最优", before: "开 3 个文件抄数字进表格 —— 约 1 小时", after: "上传 → 并排对比表 + 带出处的推荐 —— 1 分钟", tier: "Plus", href: "/compare" as RouteSlug },
      { emoji: "📄", title: "看穿合同里的坑", before: "花 $300 找律师,或盲签踩坑", after: "AI 几分钟标出风险与缺失条款", tier: "Pro", href: "/compare" as RouteSlug },
      { emoji: "🧾", title: "批量处理发票", before: "一张张录入几小时,或雇人", after: "整批丢进去 → 自动抽取汇总", tier: "Pro", href: "/extract-to-excel" as RouteSlug },
      { emoji: "📕", title: "快速读懂长报告", before: "读 80 页找几个答案 —— 几小时", after: "问它任何问题 → 30 秒带出处的答案", tier: "Plus", href: "/chat-with-pdf" as RouteSlug },
    ],
    compareTitle: "套餐对照",
    compareCols: ["免费", "Plus", "Pro"],
    compareRows: [
      { f: "20+ PDF 工具(转换/压缩/合并/加密/OCR)", v: ["✓", "✓", "✓"] },
      { f: "和 PDF 对话 · AI 摘要", v: ["—", "✓", "✓"] },
      { f: "AI 翻译 PDF(保留版式)", v: ["—", "即将", "即将"] },
      { f: "多文档对比", v: ["—", "✓", "✓"] },
      { f: "100MB 大文件 · 批量 · 无广告", v: ["—", "✓", "✓"] },
      { f: "工作流自动化 · API · 自动分类", v: ["—", "—", "✓"] },
      { f: "合同审查(风险与缺失条款)", v: ["—", "—", "✓"] },
      { f: "团队工作区 · 优先支持", v: ["—", "—", "✓"] },
    ],
  },
} as const;

export function PricingPlans({ locale = "en" }: { locale?: Locale }) {
  const [yearly, setYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [billingLoading, setBillingLoading] = useState("");
  const zh = locale === "zh";
  const c = copy[locale] ?? copy.en;

  // Start hosted checkout for paid plans. Signed-in users go straight to Creem;
  // signed-out users (or if checkout isn't configured yet) fall back to /account
  // so they can sign in and upgrade there — instead of the button dead-ending.
  async function upgrade(plan: PaidSubscriptionPlan) {
    setBillingLoading(plan);
    try {
      await createBillingCheckoutSession(plan); // redirects to checkout on success
    } catch {
      if (typeof window !== "undefined") window.location.href = "/account";
    }
  }
  // 账户页全站统一为 /account(无语言版本),不要按 locale 加 /zh 前缀,否则 /zh/account 会 404
  const toolHref = (href: RouteSlug) => (href ? localizedPath(locale, href) : "/account");
  const eyebrow = `font-mono text-[12px] text-[color:var(--faint)] ${zh ? "" : "uppercase tracking-[0.08em]"}`;
  const h2 = "text-[26px] font-normal leading-[1.15] tracking-[-0.02em] text-[color:var(--foreground)] sm:text-[32px]";

  return (
    <div className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
      {/* Header */}
      <div className="text-center">
        <p className={eyebrow}>{zh ? "// 定价" : "// Pricing"}</p>
        <h1 className="mt-4 text-[34px] font-normal leading-[1.08] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[48px]">
          {c.title}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-[16px] leading-[1.6] text-[color:var(--muted)]">
          {c.subtitle}
        </p>

        {/* Monthly / Yearly toggle */}
        <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-[color:var(--line)] p-1">
          <button type="button" onClick={() => setYearly(false)}
            className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition ${!yearly ? "bg-[color:var(--accent)]" : "text-[color:var(--muted)] hover:text-[color:var(--foreground)]"}`}
          >{c.monthly}</button>
          <button type="button" onClick={() => setYearly(true)}
            className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition ${yearly ? "bg-[color:var(--accent)]" : "text-[color:var(--muted)] hover:text-[color:var(--foreground)]"}`}
          >{c.yearly} <span className={`ml-1 text-[11px] ${yearly ? "text-[color:var(--on-accent)]" : "text-[color:var(--accent-strong)]"}`}>{c.save}</span></button>
        </div>
      </div>

      {/* Plans */}
      <div className="mt-12 grid gap-4 lg:grid-cols-3">
        {c.plans.map((plan) => {
          const isFree = plan.monthlyPrice === "$0";
          const price = yearly && !isFree ? plan.yearlyPrice : plan.monthlyPrice;
          const featured = plan.featured;
          const planKey: PaidSubscriptionPlan | null = isFree ? null : featured ? "PLUS" : "PRO";
          const ctaCls = `mt-6 flex h-11 w-full items-center justify-center rounded-full text-[14px] font-medium transition ${featured ? "bg-[color:var(--accent)] hover:bg-[color:var(--accent-hover)]" : "border border-[color:var(--line-strong)] text-[color:var(--foreground)] hover:border-[color:var(--foreground)]"}`;
          return (
            <article key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-6 transition-colors ${
                featured
                  ? "border-[color:var(--accent)] lg:-mt-2 lg:mb-2"
                  : "border-[color:var(--line)] hover:border-[color:var(--line-strong)]"
              }`}
            >
              {featured && (
                <span className="mb-3 self-start rounded-full bg-[color:var(--accent)] px-3 py-1 text-[11px] font-medium">{c.mostPopular}</span>
              )}
              <h2 className="text-[20px] font-normal text-[color:var(--foreground)]">{plan.name}</h2>

              <div className="mt-4">
                <p className="text-[44px] font-normal leading-none tracking-tight text-[color:var(--foreground)]">
                  {price}<span className="text-[16px] text-[color:var(--muted)]">{isFree ? "" : c.perMo}</span>
                </p>
                {yearly && !isFree && "yearlyTotal" in plan && plan.yearlyTotal && (
                  <p className="mt-1.5 text-[13px] text-[color:var(--muted)]">{c.billedYearly(plan.yearlyTotal)}</p>
                )}
                {!yearly && "valueLine" in plan && plan.valueLine && (
                  <p className="mt-1.5 text-[13px] text-[color:var(--accent-strong)]">{plan.valueLine}</p>
                )}
              </div>

              <p className="mt-4 text-[14px] leading-[1.5] text-[color:var(--muted)]">{plan.tagline}</p>

              <ul className="mt-6 flex-1 space-y-3">
                {plan.highlights.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[14px] leading-[1.45] text-[color:var(--foreground)]">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0 text-[color:var(--accent)]"><path d="M3 8.5l3.2 3.2L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    {item}
                  </li>
                ))}
              </ul>

              {planKey ? (
                <button type="button" onClick={() => upgrade(planKey)} disabled={billingLoading === planKey} className={ctaCls}>
                  {billingLoading === planKey ? (zh ? "跳转中…" : "Redirecting…") : plan.cta}
                </button>
              ) : (
                <a href={toolHref(plan.href)} className={ctaCls}>{plan.cta}</a>
              )}
            </article>
          );
        })}
      </div>

      {/* Trust bar */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
        {c.trust.map((t) => (
          <span key={t} className="flex items-center gap-2 text-[13px] text-[color:var(--muted)]">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="text-[color:var(--accent)]"><path d="M3 8.5l3.2 3.2L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            {t}
          </span>
        ))}
      </div>

      {/* Solutions by scenario */}
      <div className="mx-auto mt-24 max-w-5xl">
        <p className={`${eyebrow} text-center`}>{zh ? "// 应用场景" : "// Use cases"}</p>
        <h2 className={`mt-3 text-center ${h2}`}>{c.scenariosTitle}</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {c.scenarios.map((s) => (
            <div key={s.title} className="rounded-2xl border border-[color:var(--line)] p-5 transition-colors hover:border-[color:var(--line-strong)]">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[15px] font-normal text-[color:var(--foreground)]">{s.emoji} {s.title}</p>
                <span className="shrink-0 rounded-full border border-[color:var(--line)] px-2.5 py-0.5 text-[11px] text-[color:var(--accent)]">{s.tier}</span>
              </div>
              <p className="mt-3 text-[13px] leading-6 text-[color:var(--muted)]">😩 {s.before}</p>
              <p className="mt-1.5 text-[13px] leading-6 text-[color:var(--foreground)]"><span className="text-[color:var(--accent)]">⚡</span> {s.after}</p>
              {s.href && (
                <a href={toolHref(s.href)} className="mt-3 inline-block text-[13px] font-medium text-[color:var(--accent)] transition hover:text-[color:var(--accent-strong)]">{zh ? "去试试 →" : "Try it →"}</a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Compare plans */}
      <div className="mx-auto mt-24 max-w-4xl">
        <p className={`${eyebrow} text-center`}>{zh ? "// 套餐对照" : "// Compare"}</p>
        <h2 className={`mt-3 text-center ${h2}`}>{c.compareTitle}</h2>
        <div className="mt-10 overflow-x-auto rounded-2xl border border-[color:var(--line)]">
          <table className="w-full border-collapse text-[14px]">
            <thead>
              <tr>
                <th className="border-b border-[color:var(--line)] px-4 py-3 text-left"></th>
                {c.compareCols.map((col, i) => (
                  <th key={col} className={`border-b border-l border-[color:var(--line)] px-4 py-3 text-center text-[13px] font-normal ${i === 1 ? "text-[color:var(--accent-strong)]" : "text-[color:var(--foreground)]"}`}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {c.compareRows.map((row) => (
                <tr key={row.f}>
                  <td className="border-b border-[color:var(--line)] px-4 py-3 text-[color:var(--foreground)]">{row.f}</td>
                  {row.v.map((val, i) => (
                    <td key={i} className={`border-b border-l border-[color:var(--line)] px-4 py-3 text-center ${val === "✓" ? "text-[color:var(--accent)]" : val === "—" ? "text-[color:var(--faint)]" : "text-[12px] text-[color:var(--muted)]"}`}>{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div className="mx-auto mt-24 max-w-3xl">
        <p className={`${eyebrow} text-center`}>{zh ? "// 常见问题" : "// FAQ"}</p>
        <h2 className={`mt-3 text-center ${h2}`}>{c.faqTitle}</h2>
        <div className="mt-8 divide-y divide-[color:var(--line)] border-y border-[color:var(--line)]">
          {c.faq.map((item, i) => (
            <div key={item.q}>
              <button type="button" onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left"
              >
                <span className="text-[15px] font-normal text-[color:var(--foreground)]">{item.q}</span>
                <span className={`shrink-0 text-[color:var(--muted)] transition ${openFaq === i ? "rotate-45" : ""}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                </span>
              </button>
              {openFaq === i && (
                <p className="pb-5 text-[14px] leading-7 text-[color:var(--muted)]">{item.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mx-auto mt-24 max-w-3xl text-center">
        <h2 className={h2}>{c.ctaTitle}</h2>
        <p className="mx-auto mt-4 max-w-xl text-[16px] leading-[1.55] text-[color:var(--muted)]">{c.ctaDesc}</p>
        <a href={zh ? "/zh/" : "/"}
          className="mt-8 inline-flex h-11 items-center rounded-full bg-[color:var(--accent)] px-6 text-[14px] font-medium transition hover:bg-[color:var(--accent-hover)]"
        >{c.ctaBtn}</a>
      </div>
    </div>
  );
}
