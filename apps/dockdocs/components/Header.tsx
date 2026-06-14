"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { defaultLocale, isAllLocale, routeLocales, localeLabels } from "@/lib/i18n";

// ── Top-level nav categories. Each opens a dropdown; PDF tools has sub-columns. ──
type NavItem = { name: string; slug: string; soon?: boolean };
type NavCol = { heading?: string; items: NavItem[] };
type NavCat = { label: string; tier: string; cols: NavCol[] };

export const navCategories: Record<"en" | "zh" | "es", NavCat[]> = {
  en: [
    {
      label: "PDF tools",
      tier: "Free",
      cols: [
        {
          heading: "Convert",
          items: [
            { name: "PDF to Word", slug: "/pdf-to-word" },
            { name: "PDF to Excel", slug: "/pdf-to-excel" },
            { name: "PDF to PPT", slug: "/pdf-to-ppt" },
            { name: "PDF to PDF/A", slug: "/pdf-to-pdfa" },
            { name: "PDF to Image", slug: "/pdf-to-image" },
            { name: "PDF to HTML", slug: "/pdf-to-html" },
            { name: "PDF to Markdown", slug: "/pdf-to-markdown" },
            { name: "Word to PDF", slug: "/word-to-pdf" },
            { name: "Excel to PDF", slug: "/excel-to-pdf" },
            { name: "PPT to PDF", slug: "/ppt-to-pdf" },
            { name: "Image to PDF", slug: "/images-to-pdf" },
            { name: "HTML to PDF", slug: "/html-to-pdf" },
          ],
        },
        {
          heading: "Organize",
          items: [
            { name: "Split PDF", slug: "/split-pdf" },
            { name: "Compress PDF", slug: "/compress-pdf" },
            { name: "Delete Pages", slug: "/delete-page" },
            { name: "Rotate Pages", slug: "/rotate-page" },
            { name: "Reorder Pages", slug: "/reorder-pages" },
            { name: "Add Page", slug: "/add-page" },
            { name: "Watermark PDF", slug: "/watermark-pdf" },
            { name: "Add Page Numbers", slug: "/page-numbers" },
            { name: "Crop PDF", slug: "/crop-pdf" },
            { name: "Redact PDF", slug: "/redact-pdf" },
            { name: "Sign PDF", slug: "/sign-pdf" },
          ],
        },
        {
          heading: "Security & OCR",
          items: [
            { name: "Protect PDF", slug: "/protect-pdf" },
            { name: "Unlock PDF", slug: "/unlock-pdf" },
            { name: "PDF OCR", slug: "/ocr-pdf" },
          ],
        },
      ],
    },
    {
      label: "Batch processing",
      tier: "Plus",
      cols: [
        {
          items: [
            { name: "Merge PDF", slug: "/merge-pdf" },
            { name: "Batch compress", slug: "/batch-compress" },
            { name: "Batch PDF to image", slug: "/batch-pdf-to-image" },
            { name: "Batch encrypt", slug: "/batch-protect-pdf" },
            { name: "Batch rename", slug: "/batch-rename-pdf" },
            { name: "Batch watermark", slug: "/batch-watermark-pdf" },
            { name: "Batch page numbers", slug: "/batch-page-numbers" },
            { name: "Batch split", slug: "/batch-split-merge" },
            { name: "Batch rotate", slug: "/batch-rotate-pdf" },
            { name: "Batch PDF to Word/Excel", slug: "/batch-pdf-to-office" },
          ],
        },
      ],
    },
    {
      label: "AI workflows",
      tier: "Plus",
      cols: [
        {
          heading: "Single-doc AI",
          items: [
            { name: "AI Workspace", slug: "/ai-workspace" },
            { name: "Chat with PDF", slug: "/chat-with-pdf" },
            { name: "PDF Summary", slug: "/ai-summary" },
            { name: "Translate PDF", slug: "/translate-pdf" },
            { name: "PDF Flashcards", slug: "/flashcards" },
          ],
        },
        {
          heading: "Multi-doc AI",
          items: [
            { name: "Compare documents", slug: "/compare" },
            { name: "Cross-doc Q&A", slug: "/compare" },
            { name: "Compare versions", slug: "/redline" },
            { name: "Extract to Excel", slug: "/extract-to-excel" },
            { name: "Batch summary", slug: "/batch-summary" },
            { name: "Classify PDFs", slug: "/batch-sort" },
          ],
        },
      ],
    },
    {
      label: "By profession",
      tier: "Soon",
      cols: [
        {
          items: [
            { name: "Legal & contracts", slug: "/pricing", soon: true },
            { name: "Finance & tax", slug: "/pricing", soon: true },
            { name: "Research & academia", slug: "/pricing", soon: true },
            { name: "Banking & finance", slug: "/pricing", soon: true },
            { name: "Architecture & engineering", slug: "/pricing", soon: true },
            { name: "Healthcare & medical", slug: "/pricing", soon: true },
          ],
        },
      ],
    },
  ],
  zh: [
    {
      label: "PDF 工具",
      tier: "Free",
      cols: [
        {
          heading: "转换",
          items: [
            { name: "PDF 转 Word", slug: "/pdf-to-word" },
            { name: "PDF 转 Excel", slug: "/pdf-to-excel" },
            { name: "PDF 转 PPT", slug: "/pdf-to-ppt" },
            { name: "PDF 转 PDF/A", slug: "/pdf-to-pdfa" },
            { name: "PDF 转图片", slug: "/pdf-to-image" },
            { name: "PDF 转 HTML", slug: "/pdf-to-html" },
            { name: "PDF 转 Markdown", slug: "/pdf-to-markdown" },
            { name: "Word 转 PDF", slug: "/word-to-pdf" },
            { name: "Excel 转 PDF", slug: "/excel-to-pdf" },
            { name: "PPT 转 PDF", slug: "/ppt-to-pdf" },
            { name: "图片转 PDF", slug: "/images-to-pdf" },
            { name: "HTML 转 PDF", slug: "/html-to-pdf" },
          ],
        },
        {
          heading: "整理",
          items: [
            { name: "PDF 拆分", slug: "/split-pdf" },
            { name: "PDF 压缩", slug: "/compress-pdf" },
            { name: "PDF 页面删除", slug: "/delete-page" },
            { name: "PDF 页面旋转", slug: "/rotate-page" },
            { name: "PDF 页面排序", slug: "/reorder-pages" },
            { name: "PDF 页面添加", slug: "/add-page" },
            { name: "PDF 加水印", slug: "/watermark-pdf" },
            { name: "PDF 添加页码", slug: "/page-numbers" },
            { name: "PDF 裁剪", slug: "/crop-pdf" },
            { name: "PDF 智能涂黑", slug: "/redact-pdf" },
            { name: "PDF 签名", slug: "/sign-pdf" },
          ],
        },
        {
          heading: "安全 & OCR",
          items: [
            { name: "PDF 加密", slug: "/protect-pdf" },
            { name: "PDF 解密", slug: "/unlock-pdf" },
            { name: "PDF OCR", slug: "/ocr-pdf" },
          ],
        },
      ],
    },
    {
      label: "批量处理",
      tier: "Plus",
      cols: [
        {
          items: [
            { name: "批量 PDF 合并", slug: "/merge-pdf" },
            { name: "批量 PDF 压缩", slug: "/batch-compress" },
            { name: "批量 PDF 转图片", slug: "/batch-pdf-to-image" },
            { name: "批量 PDF 加密", slug: "/batch-protect-pdf" },
            { name: "批量 PDF 改名", slug: "/batch-rename-pdf" },
            { name: "批量 PDF 添加水印", slug: "/batch-watermark-pdf" },
            { name: "批量 PDF 添加页码", slug: "/batch-page-numbers" },
            { name: "批量 PDF 拆分", slug: "/batch-split-merge" },
            { name: "批量 PDF 旋转", slug: "/batch-rotate-pdf" },
            { name: "批量 PDF 转 Word/Excel", slug: "/batch-pdf-to-office" },
          ],
        },
      ],
    },
    {
      label: "AI 工作流",
      tier: "Plus",
      cols: [
        {
          heading: "单文档 AI",
          items: [
            { name: "AI 工作台", slug: "/ai-workspace" },
            { name: "PDF 问答", slug: "/chat-with-pdf" },
            { name: "PDF 摘要提取", slug: "/ai-summary" },
            { name: "PDF 翻译", slug: "/translate-pdf" },
            { name: "PDF 抽认卡", slug: "/flashcards" },
          ],
        },
        {
          heading: "多文档 AI",
          items: [
            { name: "多文档对比", slug: "/compare" },
            { name: "跨文档问答", slug: "/compare" },
            { name: "PDF 版本对比", slug: "/redline" },
            { name: "数据抽取到表格", slug: "/extract-to-excel" },
            { name: "批量摘要", slug: "/batch-summary" },
            { name: "PDF 智能分类", slug: "/batch-sort" },
          ],
        },
      ],
    },
    {
      label: "专业领域",
      tier: "Soon",
      cols: [
        {
          items: [
            { name: "法律 / 合同", slug: "/pricing", soon: true },
            { name: "财务 / 税务", slug: "/pricing", soon: true },
            { name: "科研 / 学术", slug: "/pricing", soon: true },
            { name: "金融 / 投行", slug: "/pricing", soon: true },
            { name: "建筑 / 工程", slug: "/pricing", soon: true },
            { name: "医疗 / 健康", slug: "/pricing", soon: true },
          ],
        },
      ],
    },
  ],
  es: [
    {
      label: "Herramientas PDF",
      tier: "Free",
      cols: [
        {
          heading: "Convertir",
          items: [
            { name: "PDF a Word", slug: "/pdf-to-word" },
            { name: "PDF a Excel", slug: "/pdf-to-excel" },
            { name: "PDF a PPT", slug: "/pdf-to-ppt" },
            { name: "PDF a PDF/A", slug: "/pdf-to-pdfa" },
            { name: "PDF a imagen", slug: "/pdf-to-image" },
            { name: "PDF a HTML", slug: "/pdf-to-html" },
            { name: "PDF a Markdown", slug: "/pdf-to-markdown" },
            { name: "Word a PDF", slug: "/word-to-pdf" },
            { name: "Excel a PDF", slug: "/excel-to-pdf" },
            { name: "PPT a PDF", slug: "/ppt-to-pdf" },
            { name: "Imagen a PDF", slug: "/images-to-pdf" },
            { name: "HTML a PDF", slug: "/html-to-pdf" },
          ],
        },
        {
          heading: "Organizar",
          items: [
            { name: "Dividir PDF", slug: "/split-pdf" },
            { name: "Comprimir PDF", slug: "/compress-pdf" },
            { name: "Eliminar páginas", slug: "/delete-page" },
            { name: "Rotar páginas", slug: "/rotate-page" },
            { name: "Reordenar páginas", slug: "/reorder-pages" },
            { name: "Añadir página", slug: "/add-page" },
            { name: "Marca de agua en PDF", slug: "/watermark-pdf" },
            { name: "Añadir números de página", slug: "/page-numbers" },
            { name: "Recortar PDF", slug: "/crop-pdf" },
            { name: "Censurar PDF", slug: "/redact-pdf" },
            { name: "Firmar PDF", slug: "/sign-pdf" },
          ],
        },
        {
          heading: "Seguridad y OCR",
          items: [
            { name: "Proteger PDF", slug: "/protect-pdf" },
            { name: "Desbloquear PDF", slug: "/unlock-pdf" },
            { name: "OCR de PDF", slug: "/ocr-pdf" },
          ],
        },
      ],
    },
    {
      label: "Procesamiento por lotes",
      tier: "Plus",
      cols: [
        {
          items: [
            { name: "Combinar PDF", slug: "/merge-pdf" },
            { name: "Compresión por lotes", slug: "/batch-compress" },
            { name: "PDF a imagen por lotes", slug: "/batch-pdf-to-image" },
            { name: "Cifrado por lotes", slug: "/batch-protect-pdf" },
            { name: "Renombrado por lotes", slug: "/batch-rename-pdf" },
            { name: "Marca de agua por lotes", slug: "/batch-watermark-pdf" },
            { name: "Números de página por lotes", slug: "/batch-page-numbers" },
            { name: "División por lotes", slug: "/batch-split-merge" },
            { name: "Rotación por lotes", slug: "/batch-rotate-pdf" },
            { name: "PDF a Word/Excel por lotes", slug: "/batch-pdf-to-office" },
          ],
        },
      ],
    },
    {
      label: "Flujos de trabajo con IA",
      tier: "Plus",
      cols: [
        {
          heading: "IA para un documento",
          items: [
            { name: "Espacio de trabajo IA", slug: "/ai-workspace" },
            { name: "Chatear con PDF", slug: "/chat-with-pdf" },
            { name: "Resumen de PDF", slug: "/ai-summary" },
            { name: "Traducir PDF", slug: "/translate-pdf" },
            { name: "Tarjetas de estudio de PDF", slug: "/flashcards" },
          ],
        },
        {
          heading: "IA para varios documentos",
          items: [
            { name: "Comparar documentos", slug: "/compare" },
            { name: "Preguntas entre documentos", slug: "/compare" },
            { name: "Comparar versiones", slug: "/redline" },
            { name: "Extraer a Excel", slug: "/extract-to-excel" },
            { name: "Resumen por lotes", slug: "/batch-summary" },
            { name: "Clasificar PDF", slug: "/batch-sort" },
          ],
        },
      ],
    },
    {
      label: "Por profesión",
      tier: "Soon",
      cols: [
        {
          items: [
            { name: "Legal y contratos", slug: "/pricing", soon: true },
            { name: "Finanzas e impuestos", slug: "/pricing", soon: true },
            { name: "Investigación y academia", slug: "/pricing", soon: true },
            { name: "Banca y finanzas", slug: "/pricing", soon: true },
            { name: "Arquitectura e ingeniería", slug: "/pricing", soon: true },
            { name: "Salud y medicina", slug: "/pricing", soon: true },
          ],
        },
      ],
    },
  ],
};

const pageLinks = {
  en: [
    { name: "Pricing", href: "/pricing" },
    { name: "Blog", href: "/blog" },
    { name: "About", href: "/about" },
  ],
  zh: [
    { name: "定价", href: "/pricing" },
    { name: "博客", href: "/blog" },
    { name: "关于", href: "/about" },
  ],
} as const;

type Locale = "en" | "zh";

function stripLocale(p: string): "en" | "zh" | "es" {
  const s = p.split("/").filter(Boolean);
  const first = s[0];
  return first === "zh" || first === "es" ? first : "en";
}
function lh(h: string, l: string) {
  return l === defaultLocale ? h : `/${l}${h}`;
}
function currentSlug(pathname: string | null) {
  const segs = (pathname ?? "/").split("/").filter(Boolean);
  const rest = isAllLocale(segs[0]) ? segs.slice(1) : segs;
  return rest.join("/");
}

const HEADER_H = 52; // px — must match h-[52px] below

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [light, setLight] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const locale = stripLocale(pathname ?? "/");

  const cats = navCategories[locale] ?? navCategories.en;
  const pages = pageLinks[locale === "es" ? "en" : locale] ?? pageLinks.en;

  useEffect(() => {
    setLight(document.documentElement.classList.contains("light"));
  }, []);
  useEffect(() => { setMobileOpen(false); setMoreOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  function toggleTheme() {
    const n = !light;
    setLight(n);
    document.documentElement.classList.toggle("light", n);
    try { localStorage.setItem("dockdocs-theme", n ? "light" : "dark"); } catch {}
  }

  function navTo(href: string) {
    // /account 是全站统一登录页(仅 /account/,无语言前缀),否则 /zh/account 会 404
    router.push(href === "/account" ? href : lh(href, locale));
  }

  function switchLang(target: string) {
    if (target === locale) return;
    const slug = currentSlug(pathname);
    const href = target === defaultLocale ? `/${slug}` : `/${target}/${slug}`;
    try { localStorage.setItem("dockdocs-lang", target); } catch {}
    setMoreOpen(false);
    setMobileOpen(false);
    router.push(href || "/");
  }

  const trigger =
    "flex items-center gap-1 rounded-[var(--radius-sm)] px-3 py-2 text-[15px] font-medium text-[color:var(--muted)] transition hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)] cursor-pointer";
  const itemCls =
    "block w-full whitespace-nowrap rounded-[var(--radius-sm)] px-2.5 py-1.5 text-left text-[14.5px] font-medium text-[color:var(--muted)] transition hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)]";
  const iconBtn =
    "inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--background)] text-sm transition hover:border-[color:var(--line-strong)]";

  // Inline language toggle (used in More menu + mobile)
  const langToggle = (
    <div className="flex gap-1">
      {routeLocales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => switchLang(l)}
          className={`rounded-[var(--radius-sm)] px-2.5 py-1 text-[12px] font-semibold transition ${
            l === locale
              ? "bg-[color:var(--soft-accent)] text-[color:var(--accent-strong)]"
              : "border border-[color:var(--line)] text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
          }`}
        >
          {localeLabels[l]}
        </button>
      ))}
    </div>
  );

  return (
    <>
      {/* ── Fixed header bar ── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-[color:var(--line)] bg-[color:var(--background)]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[52px] max-w-6xl items-center px-4 lg:px-6">
          {/* Logo */}
          <a href={lh("/", locale)} className="mr-3 shrink-0">
            <BrandMark />
          </a>

          {/* Desktop nav — 4 category dropdowns */}
          <nav className="hidden flex-1 items-center justify-center gap-x-6 lg:gap-x-10 md:flex">
            {cats.map((cat) => (
              <div key={cat.label} className="relative group">
                <span className={trigger}>
                  {cat.label}
                  <svg className="h-3 w-3 opacity-60 transition group-hover:rotate-180" viewBox="0 0 12 12" fill="none">
                    <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
                <div className="absolute left-0 top-full z-50 hidden w-max pt-2 group-hover:block">
                  <div className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--background)] p-4 shadow-[0_16px_48px_rgba(0,0,0,0.4)]">
                    <div
                      className="grid gap-x-7 gap-y-3"
                      style={{ gridTemplateColumns: `repeat(${cat.cols.length}, auto)` }}
                    >
                      {cat.cols.map((col, ci) => (
                        <div key={col.heading ?? ci} className="min-w-[168px]">
                          {col.heading && (
                            <p className="mb-2 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-[color:var(--faint)]">
                              {col.heading}
                            </p>
                          )}
                          <div className="space-y-0.5">
                            {col.items.map((item, ii) =>
                              item.soon ? (
                                <span key={`${item.slug}-${ii}`} className="flex w-full cursor-default items-center justify-between gap-3 whitespace-nowrap rounded-[var(--radius-sm)] px-2.5 py-1.5 text-left text-[14.5px] font-medium text-[color:var(--faint)]">
                                  {item.name}
                                  <span className="text-[10px] font-semibold uppercase opacity-80">{locale === "zh" ? "正在开发" : "soon"}</span>
                                </span>
                              ) : (
                                <a key={`${item.slug}-${ii}`} href={lh(item.slug, locale)} onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; e.preventDefault(); navTo(item.slug); }} className={itemCls}>
                                  {item.name}
                                </a>
                              ),
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </nav>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-1.5">
            {/* Sign in (desktop) */}
            <button
              type="button"
              onClick={() => navTo("/account")}
              className="hidden rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--background)] px-3 py-1.5 text-[13px] font-medium text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--foreground)] md:inline-flex"
            >
              {locale === "zh" ? "登录" : "Sign in"}
            </button>

            {/* Consolidated "More" menu (desktop) — Pricing/Blog/About + language + theme */}
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setMoreOpen((v) => !v)}
                aria-label={locale === "zh" ? "更多" : "More"}
                aria-expanded={moreOpen}
                className={iconBtn}
              >
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor">
                  <circle cx="3" cy="8" r="1.5" /><circle cx="8" cy="8" r="1.5" /><circle cx="13" cy="8" r="1.5" />
                </svg>
              </button>
              {moreOpen && (
                <>
                  <div className="fixed inset-0 z-40" aria-hidden="true" onClick={() => setMoreOpen(false)} />
                  <div className="absolute right-0 top-full z-50 mt-1.5 w-[210px] rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--background)] p-1.5 shadow-[0_16px_48px_rgba(0,0,0,0.4)]">
                    {pages.map((p) => (
                      <a
                        key={p.href}
                        href={lh(p.href, locale)}
                        onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; e.preventDefault(); navTo(p.href); setMoreOpen(false); }}
                        className="block w-full rounded-[var(--radius-sm)] px-3 py-2 text-left text-[13px] font-medium text-[color:var(--muted)] transition hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)]"
                      >
                        {p.name}
                      </a>
                    ))}
                    <div className="my-1.5 border-t border-[color:var(--line)]" />
                    <div className="flex items-center justify-between px-3 py-1.5">
                      <span className="text-[12px] font-medium text-[color:var(--faint)]">{locale === "zh" ? "语言" : "Language"}</span>
                      {langToggle}
                    </div>
                    <button
                      type="button"
                      onClick={toggleTheme}
                      className="flex w-full items-center justify-between rounded-[var(--radius-sm)] px-3 py-2 text-left text-[13px] font-medium text-[color:var(--muted)] transition hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)]"
                    >
                      <span>{locale === "zh" ? (light ? "切换深色" : "切换浅色") : light ? "Dark mode" : "Light mode"}</span>
                      <span className="text-base">{light ? "☾" : "☀"}</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Hamburger — mobile only */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--background)] text-[color:var(--foreground)] md:hidden"
            >
              {mobileOpen ? (
                <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
                  <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Spacer so content doesn't hide under fixed header */}
      <div className="h-[52px]" aria-hidden="true" />

      {/* ── Mobile full-screen menu ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex flex-col md:hidden" style={{ top: `${HEADER_H}px` }}>
          <div className="flex-1 overflow-y-auto bg-[color:var(--background)]">
            <div className="px-4 pb-8 pt-4">

              {/* Language / theme / sign-in row */}
              <div className="mb-5 flex items-center gap-2 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--background)] px-3 py-2.5">
                {langToggle}
                <button type="button" onClick={toggleTheme} aria-label="Toggle theme" className={`${iconBtn} bg-[color:var(--background)]`}>
                  {light ? "☾" : "☀"}
                </button>
                <button
                  type="button"
                  onClick={() => { navTo("/account"); setMobileOpen(false); }}
                  className="ml-auto rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--background)] px-3 py-1.5 text-[13px] font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]"
                >
                  {locale === "zh" ? "登录" : "Sign in"}
                </button>
              </div>

              {/* Quick links — Pricing / Blog / About */}
              <div className="mb-5">
                <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--faint)]">
                  {locale === "zh" ? "更多" : "More"}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {pages.map((p) => (
                    <a
                      key={p.href}
                      href={lh(p.href, locale)}
                      onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; e.preventDefault(); navTo(p.href); setMobileOpen(false); }}
                      className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--background)] px-3 py-2 text-[14px] font-medium text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--foreground)]"
                    >
                      {p.name}
                    </a>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-5">
                {cats.map((cat) => (
                  <div key={cat.label}>
                    <p className="mb-2.5 flex items-center gap-1.5 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--faint)]">
                      {cat.label}
                    </p>
                    {cat.cols.map((col, ci) => (
                      <div key={col.heading ?? ci} className="mb-2.5">
                        {col.heading && (
                          <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--faint)] opacity-70">
                            {col.heading}
                          </p>
                        )}
                        <div className="grid grid-cols-2 gap-1.5">
                          {col.items.map((item, ii) =>
                            item.soon ? (
                              <span key={`${item.slug}-${ii}`} className="flex w-full cursor-default items-center justify-between gap-1 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--background)] px-3 py-2.5 text-left text-[14px] font-medium text-[color:var(--faint)]">
                                {item.name}
                                <span className="text-[10px] font-semibold uppercase opacity-80">{locale === "zh" ? "正在开发" : "soon"}</span>
                              </span>
                            ) : (
                              <a
                                key={`${item.slug}-${ii}`}
                                href={lh(item.slug, locale)}
                                onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; e.preventDefault(); navTo(item.slug); setMobileOpen(false); }}
                                className="block w-full rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--background)] px-3 py-2.5 text-left text-[14px] font-medium text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--foreground)]"
                              >
                                {item.name}
                              </a>
                            ),
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
