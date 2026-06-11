"use client";

import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { defaultLocale, isLocale } from "@/lib/i18n";

function l(pathname: string | null): string {
  const first = (pathname ?? "/").split("/").filter(Boolean)[0];
  return isLocale(first) ? first : defaultLocale;
}
function href(path: string, locale: string) {
  return locale === defaultLocale ? path : `/${locale}${path}`;
}

const toolColsEn = [
  {
    title: "AI Workspace",
    links: [
      { label: "Chat with PDF", href: "/chat-with-pdf" },
      { label: "AI Summary", href: "/ai-summary" },
      { label: "OCR Workspace", href: "/ocr" },
    ],
  },
  {
    title: "Convert",
    links: [
      { label: "Word to PDF", href: "/word-to-pdf" },
      { label: "PDF to Word", href: "/pdf-to-word" },
      { label: "Excel to PDF", href: "/excel-to-pdf" },
      { label: "PDF to Excel", href: "/pdf-to-excel" },
      { label: "PDF to PPT", href: "/pdf-to-ppt" },
      { label: "PPT to PDF", href: "/ppt-to-pdf" },
      { label: "JPG to PDF", href: "/jpg-to-pdf" },
      { label: "HTML to PDF", href: "/html-to-pdf" },
      { label: "URL to PDF", href: "/url-to-pdf" },
    ],
  },
  {
    title: "Edit & Organize",
    links: [
      { label: "Merge PDF", href: "/merge-pdf" },
      { label: "Split PDF", href: "/split-pdf" },
      { label: "Compress PDF", href: "/compress-pdf" },
      { label: "Delete Page", href: "/delete-page" },
      { label: "Rotate Page", href: "/rotate-page" },
      { label: "Crop PDF", href: "/crop-pdf" },
      { label: "Protect PDF", href: "/protect-pdf" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Pricing", href: "/pricing" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

const toolColsZh = [
  {
    title: "AI 工作区",
    links: [
      { label: "PDF 问答", href: "/chat-with-pdf" },
      { label: "AI 摘要", href: "/ai-summary" },
      { label: "OCR 工作区", href: "/ocr" },
    ],
  },
  {
    title: "转换",
    links: [
      { label: "Word 转 PDF", href: "/word-to-pdf" },
      { label: "PDF 转 Word", href: "/pdf-to-word" },
      { label: "Excel 转 PDF", href: "/excel-to-pdf" },
      { label: "PDF 转 Excel", href: "/pdf-to-excel" },
      { label: "PDF 转 PPT", href: "/pdf-to-ppt" },
      { label: "PPT 转 PDF", href: "/ppt-to-pdf" },
      { label: "JPG 转 PDF", href: "/jpg-to-pdf" },
      { label: "HTML 转 PDF", href: "/html-to-pdf" },
      { label: "网页转 PDF", href: "/url-to-pdf" },
    ],
  },
  {
    title: "编辑与整理",
    links: [
      { label: "合并 PDF", href: "/merge-pdf" },
      { label: "拆分 PDF", href: "/split-pdf" },
      { label: "压缩 PDF", href: "/compress-pdf" },
      { label: "删除页面", href: "/delete-page" },
      { label: "旋转页面", href: "/rotate-page" },
      { label: "裁剪 PDF", href: "/crop-pdf" },
      { label: "加密 PDF", href: "/protect-pdf" },
    ],
  },
  {
    title: "公司",
    links: [
      { label: "关于", href: "/about" },
      { label: "博客", href: "/blog" },
      { label: "定价", href: "/pricing" },
      { label: "联系", href: "/contact" },
    ],
  },
];

export function Footer() {
  const pathname = usePathname();
  const locale = l(pathname);

  return (
    <footer className="border-t border-[color:var(--line)] bg-[color:var(--surface)]">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 lg:px-8">
        {/* Top: logo + columns */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <a href={href("/", locale)}>
              <BrandMark showWordmark={true} />
            </a>
            <p className="mt-3 text-[13px] leading-relaxed text-[color:var(--faint)]">
              {locale === "zh" ? "面向 PDF 工作流的 AI 文档工具。" : "AI-powered document tools for PDF workflows."}
            </p>
          </div>
          {(locale === "zh" ? toolColsZh : toolColsEn).map((col) => (
            <div key={col.title}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--faint)]">
                {col.title}
              </p>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={href(link.href, locale)}
                      className="text-[13px] text-[color:var(--muted)] transition hover:text-[color:var(--foreground)]"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-4 border-t border-[color:var(--line)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] text-[color:var(--faint)]">
            &copy; {new Date().getFullYear()} DockDocs. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-[color:var(--faint)]">
            <a href={href("/privacy-policy", locale)} className="transition hover:text-[color:var(--muted)]">{locale === "zh" ? "隐私" : "Privacy"}</a>
            <a href={href("/terms", locale)} className="transition hover:text-[color:var(--muted)]">{locale === "zh" ? "条款" : "Terms"}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
