"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { getRuntimeCopy } from "@/lib/copy";
import {
  defaultLocale,
  isLocale,
  localizedPath,
  normalizeSlug,
  pathForSlug,
  type Locale,
  type RouteSlug,
} from "@/lib/i18n";

type FeatureTier = "FREE" | "PLUS";

type HeaderFeatureCategory = {
  id: string;
  label: string;
  groups: Array<{
    label: string;
    items: Array<{
      label: string;
      tier: FeatureTier;
      href?: string;
    }>;
  }>;
};

type FeatureDefinition = {
  id: string;
  labels: Record<Locale, string>;
  groups: Array<{
    labels: Record<Locale, string>;
    items: Array<{
      labels: Record<Locale, string>;
      tier: FeatureTier;
      slug?: RouteSlug;
    }>;
  }>;
};

const featureDefinitions: FeatureDefinition[] = [
  {
    id: "ai-workspace",
    labels: { en: "AI Workspace", zh: "AI 工作区" },
    groups: [
      {
        labels: { en: "AI Reading", zh: "AI 阅读" },
        items: [
          { labels: { en: "AI Summary", zh: "AI 摘要" }, tier: "FREE", slug: "ai-summary" },
          { labels: { en: "Key Points", zh: "关键要点" }, tier: "PLUS", slug: "ai-summary" },
          { labels: { en: "Knowledge Card", zh: "知识卡片" }, tier: "PLUS", slug: "ai-summary" },
        ],
      },
      {
        labels: { en: "Chat PDF", zh: "PDF 问答" },
        items: [
          { labels: { en: "Chat with PDF", zh: "Chat with PDF" }, tier: "FREE", slug: "chat-with-pdf" },
        ],
      },
    ],
  },
  {
    id: "convert",
    labels: { en: "Convert", zh: "转换" },
    groups: [
      {
        labels: { en: "To PDF", zh: "转为 PDF" },
        items: [
          { labels: { en: "JPG to PDF", zh: "JPG 转 PDF" }, tier: "FREE", slug: "jpg-to-pdf" },
          { labels: { en: "PNG to PDF", zh: "PNG 转 PDF" }, tier: "PLUS", slug: "png-to-pdf" },
          { labels: { en: "Word to PDF", zh: "Word 转 PDF" }, tier: "PLUS" },
          { labels: { en: "PPT to PDF", zh: "PPT 转 PDF" }, tier: "PLUS" },
          { labels: { en: "Excel to PDF", zh: "Excel 转 PDF" }, tier: "PLUS" },
          { labels: { en: "Text to PDF", zh: "文本转 PDF" }, tier: "PLUS", slug: "text-to-pdf" },
        ],
      },
      {
        labels: { en: "From PDF", zh: "从 PDF 转出" },
        items: [
          { labels: { en: "PDF to JPG", zh: "PDF 转 JPG" }, tier: "PLUS", slug: "pdf-to-jpg" },
          { labels: { en: "PDF to PNG", zh: "PDF 转 PNG" }, tier: "PLUS", slug: "pdf-to-png" },
        ],
      },
      {
        labels: { en: "Office Conversion", zh: "Office 转换" },
        items: [
          { labels: { en: "PDF to Word", zh: "PDF 转 Word" }, tier: "FREE", slug: "pdf-to-word" },
          { labels: { en: "PDF to Excel", zh: "PDF 转 Excel" }, tier: "PLUS" },
        ],
      },
      {
        labels: { en: "Developer Conversion", zh: "开发者转换" },
        items: [
          { labels: { en: "PDF to Markdown", zh: "PDF 转 Markdown" }, tier: "PLUS", slug: "pdf-to-markdown" },
        ],
      },
    ],
  },
  {
    id: "edit",
    labels: { en: "Edit", zh: "编辑" },
    groups: [
      {
        labels: { en: "Page Operations", zh: "页面操作" },
        items: [
          { labels: { en: "Delete Page", zh: "删除页面" }, tier: "PLUS", slug: "delete-page" },
          { labels: { en: "Add Page", zh: "添加页面" }, tier: "PLUS", slug: "add-page" },
          { labels: { en: "Rotate Page", zh: "旋转页面" }, tier: "PLUS", slug: "rotate-page" },
          { labels: { en: "Reorder Pages", zh: "页面排序" }, tier: "PLUS", slug: "reorder-pages" },
          { labels: { en: "Merge PDF", zh: "合并 PDF" }, tier: "FREE", slug: "merge-pdf" },
          { labels: { en: "Split PDF", zh: "拆分 PDF" }, tier: "FREE", slug: "split-pdf" },
        ],
      },
    ],
  },
  {
    id: "compress",
    labels: { en: "Compress", zh: "压缩" },
    groups: [
      {
        labels: { en: "Basic Compression", zh: "基础压缩" },
        items: [
          { labels: { en: "Compress PDF", zh: "压缩 PDF" }, tier: "FREE", slug: "compress-pdf" },
        ],
      },
    ],
  },
  {
    id: "ocr",
    labels: { en: "OCR", zh: "OCR 提取" },
    groups: [
      {
        labels: { en: "Basic OCR", zh: "基础 OCR" },
        items: [
          { labels: { en: "PDF to Text", zh: "PDF 转文本" }, tier: "FREE", slug: "ocr" },
        ],
      },
      {
        labels: { en: "Enhanced OCR", zh: "增强 OCR" },
        items: [
          { labels: { en: "PDF to Excel", zh: "PDF 转 Excel" }, tier: "PLUS" },
        ],
      },
    ],
  },
  {
    id: "security",
    labels: { en: "Security", zh: "安全" },
    groups: [
      {
        labels: { en: "Basic", zh: "基础" },
        items: [
          { labels: { en: "Password Protection", zh: "密码保护" }, tier: "PLUS", slug: "protect-pdf" },
        ],
      },
    ],
  },
];

function currentRoute(pathname: string | null) {
  const segments = (pathname ?? "/").split("/").filter(Boolean);
  const firstSegment = segments[0];
  const hasLocalePrefix = isLocale(firstSegment);
  const slugSegments = hasLocalePrefix ? segments.slice(1) : segments;

  return {
    locale: hasLocalePrefix ? firstSegment : defaultLocale,
    hasLocalePrefix,
    slug: normalizeSlug(slugSegments.join("/")) ?? "",
  };
}

function getHeaderFeatureNav(
  locale: Locale,
  useLocalePrefix: boolean,
): HeaderFeatureCategory[] {
  return featureDefinitions.map((category) => ({
    id: category.id,
    label: category.labels[locale],
    groups: category.groups.map((group) => ({
      label: group.labels[locale],
      items: group.items.map((item) => ({
        label: item.labels[locale],
        tier: item.tier,
        href: item.slug
          ? useLocalePrefix
            ? localizedPath(locale, item.slug)
            : pathForSlug(item.slug)
          : undefined,
      })),
    })),
  }));
}

function categoryIsActive(category: HeaderFeatureCategory, pathname: string) {
  return category.groups.some((group) =>
    group.items.some((item) => {
      if (!item.href) {
        return false;
      }

      const itemPath = item.href.replace(/^\/(en|zh)/u, "").replace(/\/$/u, "");
      const activePath = pathname.replace(/^\/(en|zh)/u, "").replace(/\/$/u, "");
      return itemPath === activePath;
    }),
  );
}

export function HeaderProductNav({
  mobileOpen: controlledMobileOpen,
  onMobileOpenChange,
}: {
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
} = {}) {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const { locale, hasLocalePrefix } = currentRoute(pathname);
  const copy = getRuntimeCopy(locale).shell;
  const categories = useMemo(
    () => getHeaderFeatureNav(locale, hasLocalePrefix),
    [locale, hasLocalePrefix],
  );
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);
  const [uncontrolledMobileOpen, setUncontrolledMobileOpen] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const mobileOpen = controlledMobileOpen ?? uncontrolledMobileOpen;
  const setMobileOpen = onMobileOpenChange ?? setUncontrolledMobileOpen;
  const openCategory =
    categories.find((category) => category.id === openCategoryId) ?? null;

  function cancelCloseTimer() {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function openDesktopCategory(categoryId: string) {
    cancelCloseTimer();
    setOpenCategoryId(categoryId);
  }

  function scheduleDesktopClose() {
    cancelCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setOpenCategoryId(null);
      closeTimerRef.current = null;
    }, 180);
  }

  useEffect(() => {
    cancelCloseTimer();
    setOpenCategoryId(null);
  }, [pathname]);

  useEffect(() => {
    function closeDesktopMenu(event: MouseEvent) {
      if (!navRef.current?.contains(event.target as Node)) {
        cancelCloseTimer();
        setOpenCategoryId(null);
      }
    }

    function closeWithEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        cancelCloseTimer();
        setOpenCategoryId(null);
        setMobileOpen(false);
      }
    }

    document.addEventListener("mousedown", closeDesktopMenu);
    document.addEventListener("keydown", closeWithEscape);

    return () => {
      cancelCloseTimer();
      document.removeEventListener("mousedown", closeDesktopMenu);
      document.removeEventListener("keydown", closeWithEscape);
    };
  }, [setMobileOpen]);

  return (
    <nav ref={navRef} aria-label={copy.header.aria} className="min-w-0 flex-1">
      <div className="sm:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-haspopup="menu"
          aria-controls="dockdocs-tools-menu"
          className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] px-3 text-sm font-semibold text-[color:var(--foreground)] shadow-sm transition hover:bg-[color:var(--surface-subtle)] active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]"
        >
          {copy.header.tools}
        </button>
        {mobileOpen ? (
          <div
            id="dockdocs-tools-menu"
            role="menu"
            aria-label={copy.header.featureMenu}
            className="absolute left-3 right-3 top-[calc(100%+8px)] z-50 max-h-[min(74vh,680px)] overflow-y-auto rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-3 shadow-[0_24px_70px_rgba(15,23,42,0.16)]"
          >
            <FeaturePanel
              categories={categories}
              copy={copy.header}
              compact
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        ) : null}
      </div>

      <div
        className="relative hidden min-w-0 sm:block"
        onMouseEnter={cancelCloseTimer}
        onMouseLeave={scheduleDesktopClose}
      >
        <ul className="flex min-w-0 gap-1 overflow-x-auto pb-1 text-sm font-semibold text-[color:var(--muted)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((category) => {
            const isActive = categoryIsActive(category, pathname ?? "/");
            const isOpen = openCategoryId === category.id;

            return (
              <li key={category.id} className="shrink-0">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-haspopup="menu"
                  aria-controls={`dockdocs-feature-menu-${category.id}`}
                  onClick={() => {
                    cancelCloseTimer();
                    setOpenCategoryId((current) =>
                      current === category.id ? null : category.id,
                    );
                  }}
                  onMouseEnter={() => openDesktopCategory(category.id)}
                  onFocus={() => openDesktopCategory(category.id)}
                  className={
                    isActive || isOpen
                      ? "min-h-10 rounded-[var(--radius-sm)] bg-[color:var(--soft-accent)] px-3 text-[color:var(--accent-strong)] transition active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]"
                      : "min-h-10 rounded-[var(--radius-sm)] px-3 transition hover:bg-black/5 hover:text-[color:var(--foreground)] active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)] dark:hover:bg-white/10"
                  }
                >
                  {category.label}
                </button>
              </li>
            );
          })}
        </ul>

        {openCategory ? (
          <div
            id={`dockdocs-feature-menu-${openCategory.id}`}
            role="menu"
            aria-label={`${openCategory.label} ${copy.header.featureMenu}`}
            className="absolute left-1/2 top-full z-50 w-[min(760px,calc(100vw-2rem))] -translate-x-1/2 pt-2"
            onMouseEnter={cancelCloseTimer}
            onMouseLeave={scheduleDesktopClose}
          >
            <div className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4 shadow-[0_24px_70px_rgba(15,23,42,0.16)]">
              <FeaturePanel
                categories={[openCategory]}
                copy={copy.header}
                onNavigate={() => setOpenCategoryId(null)}
              />
            </div>
          </div>
        ) : null}
      </div>
    </nav>
  );
}

function FeaturePanel({
  categories,
  copy,
  compact = false,
  onNavigate,
}: {
  categories: HeaderFeatureCategory[];
  copy: ReturnType<typeof getRuntimeCopy>["shell"]["header"];
  compact?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <div className="grid gap-4">
      {categories.map((category) => (
        <section key={category.id}>
          {compact ? (
            <h2 className="text-sm font-semibold text-[color:var(--foreground)]">
              {category.label}
            </h2>
          ) : null}
          <div
            className={
              compact
                ? "mt-2 grid gap-3"
                : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            }
          >
            {category.groups.map((group) => (
              <div key={`${category.id}-${group.label}`}>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                  {group.label}
                </p>
                <div className="mt-2 grid gap-1">
                  {group.items.map((item) =>
                    item.href ? (
                      <a
                        key={`${group.label}-${item.label}`}
                        href={item.href}
                        role="menuitem"
                        onClick={onNavigate}
                        className="grid min-h-11 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-sm transition hover:bg-[color:var(--surface-subtle)] active:scale-[0.99] focus:bg-[color:var(--surface-subtle)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]"
                      >
                        <span className="min-w-0 break-words font-semibold text-[color:var(--foreground)]">
                          {item.label}
                        </span>
                        <TierBadge tier={item.tier} copy={copy} />
                      </a>
                    ) : (
                      <div
                        key={`${group.label}-${item.label}`}
                        role="menuitem"
                        aria-disabled="true"
                        className="grid min-h-11 cursor-not-allowed grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-sm opacity-75"
                      >
                        <span className="min-w-0">
                          <span className="block break-words font-semibold text-[color:var(--foreground)]">
                            {item.label}
                          </span>
                          <span className="text-xs font-semibold text-[color:var(--muted)]">
                            {copy.comingSoon}
                          </span>
                        </span>
                        <TierBadge tier={item.tier} copy={copy} />
                      </div>
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function TierBadge({
  tier,
  copy,
}: {
  tier: FeatureTier;
  copy: ReturnType<typeof getRuntimeCopy>["shell"]["header"];
}) {
  return (
    <span
      className={`${tier === "FREE"
        ? "border-[color:var(--success-line)] bg-[color:var(--success-surface)] text-[color:var(--success)]"
        : "border-[color:var(--line)] bg-[color:var(--surface-subtle)] text-[color:var(--muted)]"
      } shrink-0 whitespace-nowrap rounded-[var(--radius-sm)] border px-2 py-1 text-[10px] font-semibold`}
    >
      {tier === "FREE" ? copy.free : copy.plus}
    </span>
  );
}
