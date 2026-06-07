"use client";

import { useState } from "react";
import { localizedPath, type RouteSlug } from "@/lib/i18n";

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
        highlights: ["All 20+ PDF tools", "Unlimited use, no account", "Browser-side processing — files stay private", "Compress, merge, split, convert & more"],
        cta: "Start free now",
        href: "/chat-with-pdf" as RouteSlug,
        featured: false,
      },
      {
        name: "Plus",
        monthlyPrice: "$5",
        yearlyPrice: "$3",
        yearlyTotal: "$36/yr",
        tagline: "For professionals who work with documents daily.",
        valueLine: "Less than a coffee a month.",
        highlights: ["Everything in Free", "AI: Chat with PDF & summaries", "Large files up to 100 MB", "Batch & priority processing", "Google Drive integration"],
        cta: "Upgrade to Plus",
        href: "" as RouteSlug,
        featured: true,
      },
      {
        name: "Pro",
        monthlyPrice: "$20",
        yearlyPrice: "$12",
        yearlyTotal: "$144/yr",
        tagline: "Maximum power for teams and heavy workflows.",
        highlights: ["Everything in Plus", "Unlimited file size", "API access for automation", "Bulk workflows", "Team management", "Priority support"],
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
        monthlyPrice: "¥0",
        yearlyPrice: "¥0",
        tagline: "日常 PDF 工作所需的一切。",
        highlights: ["全部 20+ PDF 工具", "无限使用，无需注册", "浏览器本地处理——文件保持私密", "压缩、合并、拆分、转换等"],
        cta: "立即免费开始",
        href: "/chat-with-pdf" as RouteSlug,
        featured: false,
      },
      {
        name: "Plus",
        monthlyPrice: "¥35",
        yearlyPrice: "¥21",
        yearlyTotal: "¥252/年",
        tagline: "为每天处理文档的专业人士打造。",
        valueLine: "每月不到一杯咖啡的钱。",
        highlights: ["包含「免费」全部功能", "AI：PDF 问答与摘要", "大文件最高 100 MB", "批量与优先处理", "Google Drive 集成"],
        cta: "升级到 Plus",
        href: "" as RouteSlug,
        featured: true,
      },
      {
        name: "Pro",
        monthlyPrice: "¥138",
        yearlyPrice: "¥83",
        yearlyTotal: "¥996/年",
        tagline: "为团队和高强度工作流提供最强能力。",
        highlights: ["包含「Plus」全部功能", "无限文件大小", "API 接入，支持自动化", "批量工作流", "团队管理", "优先支持"],
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
  },
} as const;

export function PricingPlans({ locale = "en" }: { locale?: Locale }) {
  const [yearly, setYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const c = copy[locale] ?? copy.en;
  const toolHref = (href: RouteSlug) => (href ? localizedPath(locale, href) : locale === "zh" ? "/zh/account" : "/account");

  return (
    <div className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-[32px] font-semibold leading-[1.1] tracking-[-0.018em] text-[color:var(--foreground)] sm:text-[42px]">
          {c.title}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-[color:var(--muted)]">
          {c.subtitle}
        </p>

        {/* Monthly / Yearly toggle */}
        <div className="mt-8 inline-flex items-center gap-1 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-1">
          <button type="button" onClick={() => setYearly(false)}
            className={`rounded-[var(--radius-sm)] px-4 py-1.5 text-[13px] font-medium transition ${!yearly ? "bg-[color:var(--accent)] text-white" : "text-[color:var(--muted)] hover:text-[color:var(--foreground)]"}`}
          >{c.monthly}</button>
          <button type="button" onClick={() => setYearly(true)}
            className={`rounded-[var(--radius-sm)] px-4 py-1.5 text-[13px] font-medium transition ${yearly ? "bg-[color:var(--accent)] text-white" : "text-[color:var(--muted)] hover:text-[color:var(--foreground)]"}`}
          >{c.yearly} <span className={`ml-1 text-[11px] ${yearly ? "text-white/90" : "text-[color:var(--accent-strong)]"}`}>{c.save}</span></button>
        </div>
      </div>

      {/* Plans */}
      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {c.plans.map((plan) => {
          const isFree = plan.monthlyPrice === "$0" || plan.monthlyPrice === "¥0";
          const price = yearly && !isFree ? plan.yearlyPrice : plan.monthlyPrice;
          const featured = plan.featured;
          return (
            <article key={plan.name}
              className={`relative flex flex-col rounded-[var(--radius-lg)] border p-6 transition hover:-translate-y-0.5 ${
                featured
                  ? "border-[color:var(--accent)] bg-[color:var(--surface)] shadow-[0_8px_30px_rgba(99,102,241,0.15)] lg:-mt-2 lg:mb-2"
                  : "border-[color:var(--line)] bg-[color:var(--surface)]"
              }`}
            >
              {featured && (
                <span className="mb-3 self-start rounded-full bg-[color:var(--accent)] px-3 py-1 text-[11px] font-semibold text-white">{c.mostPopular}</span>
              )}
              <h2 className="text-[20px] font-semibold text-[color:var(--foreground)]">{plan.name}</h2>

              <div className="mt-4">
                <p className="text-[40px] font-semibold leading-none tracking-tight text-[color:var(--foreground)]">
                  {price}<span className="text-[16px] font-normal text-[color:var(--muted)]">{isFree ? "" : c.perMo}</span>
                </p>
                {yearly && !isFree && "yearlyTotal" in plan && plan.yearlyTotal && (
                  <p className="mt-1.5 text-[13px] text-[color:var(--muted)]">{c.billedYearly(plan.yearlyTotal)}</p>
                )}
                {!yearly && "valueLine" in plan && plan.valueLine && (
                  <p className="mt-1.5 text-[13px] font-medium text-[color:var(--accent-strong)]">{plan.valueLine}</p>
                )}
              </div>

              <p className="mt-4 text-[14px] leading-relaxed text-[color:var(--muted)]">{plan.tagline}</p>

              <ul className="mt-6 flex-1 space-y-3">
                {plan.highlights.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[14px] text-[color:var(--foreground)]">
                    <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${featured ? "bg-[color:var(--accent)] text-white" : "bg-[color:var(--soft-accent)] text-[color:var(--accent-strong)]"}`}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-11"/></svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <a href={toolHref(plan.href)}
                className={`mt-6 flex min-h-[46px] w-full items-center justify-center rounded-[var(--radius)] text-[14px] font-semibold transition ${
                  featured ? "bg-[color:var(--accent)] text-white hover:opacity-90" : "border border-[color:var(--line)] text-[color:var(--foreground)] hover:border-[color:var(--line-strong)]"
                }`}
              >{plan.cta}</a>
            </article>
          );
        })}
      </div>

      {/* Trust bar */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
        {c.trust.map((t) => (
          <span key={t} className="flex items-center gap-2 text-[13px] text-[color:var(--muted)]">
            <span className="flex h-4 w-4 items-center justify-center text-[color:var(--accent)]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 4 5v6c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V5l-8-3Z"/><path d="m9 12 2 2 4-4"/></svg>
            </span>
            {t}
          </span>
        ))}
      </div>

      {/* FAQ */}
      <div className="mx-auto mt-20 max-w-3xl">
        <h2 className="text-center text-[24px] font-semibold tracking-tight text-[color:var(--foreground)]">{c.faqTitle}</h2>
        <div className="mt-8 divide-y divide-[color:var(--line)] border-y border-[color:var(--line)]">
          {c.faq.map((item, i) => (
            <div key={item.q}>
              <button type="button" onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left"
              >
                <span className="text-[15px] font-medium text-[color:var(--foreground)]">{item.q}</span>
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
      <div className="mx-auto mt-16 max-w-3xl rounded-[var(--radius-xl)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-8 py-10 text-center">
        <h2 className="text-[22px] font-semibold tracking-tight text-[color:var(--foreground)]">{c.ctaTitle}</h2>
        <p className="mx-auto mt-3 max-w-xl text-[14px] leading-7 text-[color:var(--muted)]">{c.ctaDesc}</p>
        <a href={locale === "zh" ? "/zh/" : "/"}
          className="mt-6 inline-flex h-11 items-center rounded-[var(--radius)] bg-[color:var(--accent)] px-7 text-[14px] font-semibold text-white transition hover:opacity-90"
        >{c.ctaBtn}</a>
      </div>
    </div>
  );
}
