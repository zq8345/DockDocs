"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { WorkspaceSidebar } from "@/components/WorkspaceSidebar";
import { WorkspaceTopbar } from "@/components/WorkspaceTopbar";
import { WorkspaceNavContext } from "@/components/WorkspaceNavContext";
import { LegalSessionProvider } from "@/components/LegalSessionProvider";
import { headerStructure, navItemLabels } from "@/lib/header-nav";
import { readWorkHistory, type WorkHistoryItem } from "@/lib/work-history";
import { getRuntimeCopy, type RuntimeLocale } from "@/lib/copy";
import { isRouteLocale } from "@/lib/i18n";

// ── Lazy-loaded embedded AI tools ──────────────────────────────────────────
const ContractRiskEmbedded = dynamic(
  () => import("@/components/ContractRiskClient").then((m) => m.ContractRiskClient),
  { ssr: false },
);
const ChatWithPdfEmbedded = dynamic(
  () => import("@/app/(site)/chat-with-pdf/ChatWithPdfClient").then((m) => m.ChatWithPdfClient),
  { ssr: false },
);
const DocumentCompareEmbedded = dynamic(
  () => import("@/components/DocumentCompareClient").then((m) => m.DocumentCompareClient),
  { ssr: false },
);
const AiSummaryEmbedded = dynamic(
  () => import("@/app/(site)/ai-summary/AiSummaryClient").then((m) => m.AiSummaryClient),
  { ssr: false },
);
const AccountEmbedded = dynamic(
  () => import("@/components/AccountClient").then((m) => m.AccountClient),
  { ssr: false },
);
const WorkspacePdfToolEmbedded = dynamic(
  () => import("@/components/WorkspacePdfTool").then((m) => m.WorkspacePdfTool),
  { ssr: false },
);
const RedlineEmbedded = dynamic(
  () => import("@/components/RedlineClient").then((m) => m.RedlineClient),
  { ssr: false },
);
const LeaseRedflagEmbedded = dynamic(
  () => import("@/components/LeaseRedflagClient").then((m) => m.LeaseRedflagClient),
  { ssr: false },
);
const GovbidMatrixEmbedded = dynamic(
  () => import("@/components/GovbidMatrixClient").then((m) => m.GovbidMatrixClient),
  { ssr: false },
);
const ExtractExcelEmbedded = dynamic(
  () => import("@/components/ExtractExcelClient").then((m) => m.ExtractExcelClient),
  { ssr: false },
);
const QuizEmbedded = dynamic(
  () => import("@/components/QuizClient").then((m) => m.QuizClient),
  { ssr: false },
);
const BatchSummaryEmbedded = dynamic(
  () => import("@/components/BatchSummaryClient").then((m) => m.BatchSummaryClient),
  { ssr: false },
);
const BatchSortEmbedded = dynamic(
  () => import("@/components/BatchSortClient").then((m) => m.BatchSortClient),
  { ssr: false },
);
const LegalHubEmbedded = dynamic(
  () => import("@/components/LegalWorkspaceHub").then((m) => m.LegalWorkspaceHub),
  { ssr: false },
);

// Coming-soon panel for domain workspaces not yet built
const DOMAIN_SOON_COPY: Record<string, { en: { h: string; sub: string; preview: string[] }; zh: { h: string; sub: string; preview: string[] } }> = {
  finance: {
    en: {
      h: "Finance / Tax — Coming Soon",
      sub: "Tools for reviewing financial documents, extracting invoice data, and checking tax compliance.",
      preview: ["Invoice data extraction to spreadsheet", "Financial report summarization", "Tax document compliance review"],
    },
    zh: {
      h: "财务 / 税务 — 即将推出",
      sub: "用于审阅财务文件、提取发票数据、检查税务合规的专业工具。",
      preview: ["发票数据提取到表格", "财务报告摘要提取", "税务文件合规审查"],
    },
  },
  research: {
    en: {
      h: "Research / Academic — Coming Soon",
      sub: "Tools for summarizing papers, extracting citations, and comparing scientific documents.",
      preview: ["Research paper summarization", "Citation and reference extraction", "Multi-paper comparison and synthesis"],
    },
    zh: {
      h: "科研 / 学术 — 即将推出",
      sub: "用于摘要论文、提取引文、对比学术文献的专业工具。",
      preview: ["论文摘要提取", "引文和参考文献提取", "多篇论文对比综合"],
    },
  },
};

function DomainSoonPanel({ domain, locale }: { domain: "finance" | "research"; locale: RuntimeLocale }) {
  const langKey = (locale === "zh" || locale === "zh-Hant") ? "zh" : "en";
  const c = DOMAIN_SOON_COPY[domain][langKey];
  return (
    <div className="mx-auto w-full max-w-2xl px-8 py-12 text-center">
      <h1 className="mb-3 text-[18px] font-[400] text-[color:var(--foreground)]">{c.h}</h1>
      <p className="mb-8 text-[13.5px] leading-[1.65] text-[color:var(--muted)]">{c.sub}</p>
      <ul className="space-y-2 text-left inline-block">
        {c.preview.map((item, i) => (
          <li key={i} className="flex items-center gap-2.5 text-[13px] text-[color:var(--muted)]">
            <span className="text-[color:var(--faint)]">·</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// All PDF tool slugs from the "Document tools" nav category — served via WorkspacePdfTool.
// Derived from headerStructure so adding a new tool auto-expands the set.
const WORKSPACE_PDF_SLUGS: Set<string> = new Set([
  ...(headerStructure.find((c) => c.catKey === "Document tools")?.cols ?? [])
    .flatMap((col) => col.items.map((item) => item.slug)),
  "/ocr-pdf",
]);

const WORKSPACE_AI_SLUGS: Set<string> = new Set([
  "/chat-with-pdf", "/compare", "/ai-summary", "/contract-risk",
  "/redline", "/extract-to-excel", "/flashcards", "/batch-summary", "/batch-sort",
  "/lease-redflag", "/govbid-matrix",
  "/workspace-legal", "/workspace-finance", "/workspace-research", "/workspace-account",
]);

type NavLocale = "en" | "zh" | "zh-Hant" | "es" | "pt" | "fr" | "ja" | "de" | "ko";

function toNavLocale(locale: RuntimeLocale): NavLocale {
  return locale as NavLocale;
}

// ── Quick-start tool card definitions ──────────────────────────────────────
const CARDS = [
  {
    navKey: "Contract risk check",
    href: "/contract-risk",
    descKey: "cardContractDesc",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M5 3h10a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
        <path d="M7 8h6M7 12h4" />
        <circle cx="14" cy="14.5" r="2.5" />
        <path d="m16 16.5 1.5 1.5" />
      </svg>
    ),
  },
  {
    navKey: "Chat with PDF",
    href: "/chat-with-pdf",
    descKey: "cardChatDesc",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M3 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H7l-4 3V4Z" />
      </svg>
    ),
  },
  {
    navKey: "Compare documents",
    href: "/compare",
    descKey: "cardCompareDesc",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <rect x="2" y="3" width="7" height="14" rx="1" />
        <rect x="11" y="3" width="7" height="14" rx="1" />
        <path d="M9 10h2" />
      </svg>
    ),
  },
  {
    navKey: "PDF Summary",
    href: "/ai-summary",
    descKey: "cardSummaryDesc",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M4 5h12M4 9h8M4 13h10M4 17h6" />
      </svg>
    ),
  },
] as const;

// ── Component ───────────────────────────────────────────────────────────────
export function DashboardWorkspace({ initialTool }: { initialTool?: string | null }) {
  const [locale, setLocale] = useState<RuntimeLocale>("en");
  const [hydrated, setHydrated] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [history, setHistory] = useState<WorkHistoryItem[]>([]);

  // Mount: restore locale, set initial tool (from path or legacy ?tool= param)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("dockdocs-lang");
      if (saved && isRouteLocale(saved)) setLocale(saved as RuntimeLocale);
    } catch {}
    setHydrated(true);
    setHistory(readWorkHistory().slice(0, 8));

    if (initialTool) {
      // Path-based: e.g. /workspace/chat-with-pdf/ → initialTool = "/chat-with-pdf"
      if (WORKSPACE_PDF_SLUGS.has(initialTool) || WORKSPACE_AI_SLUGS.has(initialTool)) {
        setActiveTool(initialTool);
      }
      // URL is already correct from the path — no replaceState needed
    } else if (typeof window !== "undefined") {
      // Backward compat: legacy ?tool= and ?panel= query params
      const params = new URLSearchParams(window.location.search);
      const toolParam = params.get("tool");
      if (toolParam) {
        const slug = "/" + toolParam;
        if (WORKSPACE_PDF_SLUGS.has(slug) || WORKSPACE_AI_SLUGS.has(slug)) {
          setActiveTool(slug);
          // Upgrade URL to new path form
          window.history.replaceState({}, "", `/workspace/${toolParam}/`);
        } else {
          window.history.replaceState({}, "", window.location.pathname);
        }
      } else if (params.get("panel") === "account") {
        setActiveTool("/workspace-account");
        window.history.replaceState({}, "", "/workspace/");
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // URL sync: push a history entry whenever the active tool changes
  useEffect(() => {
    if (!hydrated) return;
    const target =
      activeTool && !activeTool.startsWith("/workspace-")
        ? `/workspace${activeTool}/`
        : "/workspace/";
    if (window.location.pathname !== target) {
      window.history.pushState({ activeTool: activeTool ?? "" }, "", target);
    }
  }, [activeTool, hydrated]);

  // Popstate: sync active tool when browser back/forward is used
  useEffect(() => {
    const onPop = () => {
      const path = window.location.pathname;
      const match = /^\/workspace\/([^/]+)\/?$/.exec(path);
      if (match) {
        const slug = "/" + match[1];
        if (WORKSPACE_PDF_SLUGS.has(slug) || WORKSPACE_AI_SLUGS.has(slug)) {
          setActiveTool(slug);
          return;
        }
      }
      setActiveTool(null);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const handleLocaleChange = useCallback((next: RuntimeLocale) => {
    setLocale(next);
    try { localStorage.setItem("dockdocs-lang", next); } catch {}
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (!file) return;
      setActiveTool("/chat-with-pdf");
    },
    [],
  );

  const navLocale = toNavLocale(locale);
  const labels = navItemLabels[navLocale] as Record<string, string>;
  const dash = getRuntimeCopy(locale).dashboard as unknown as Record<string, string>;

  // Breadcrumb: resolve active tool's display label
  const toolLabel = activeTool
    ? (() => {
        if (activeTool === "/workspace-account") {
          const acctLabel: Record<string, string> = { zh: "账户", "zh-Hant": "帳戶", es: "Cuenta", pt: "Conta", fr: "Compte", ja: "アカウント", de: "Konto", ko: "계정" };
          return acctLabel[locale] ?? "Account";
        }
        if (activeTool === "/workspace-legal") {
          const legalLabel: Record<string, string> = { zh: "法律文档工作区", "zh-Hant": "法律文件工作區", es: "Espacio de trabajo legal", pt: "Espaço jurídico", fr: "Espace juridique", ja: "法務ワークスペース", de: "Rechts-Arbeitsbereich", ko: "법률 워크스페이스" };
          return legalLabel[locale] ?? "Legal Document Workspace";
        }
        if (activeTool === "/workspace-finance") {
          const finLabel: Record<string, string> = { zh: "财务 / 税务", "zh-Hant": "財務 / 稅務", es: "Finanzas / Impuestos", pt: "Finanças / Impostos", fr: "Finance / Fiscalité", ja: "財務・税務", de: "Finanzen / Steuern", ko: "재무 / 세금" };
          return finLabel[locale] ?? "Finance / Tax";
        }
        if (activeTool === "/workspace-research") {
          const resLabel: Record<string, string> = { zh: "科研 / 学术", "zh-Hant": "學術 / 研究", es: "Investigación / Académico", pt: "Pesquisa / Académico", fr: "Recherche / Académique", ja: "研究・学術", de: "Forschung / Akademisch", ko: "연구 / 학술" };
          return resLabel[locale] ?? "Research / Academic";
        }
        type NavItem = { key: string; slug: string };
        const item = headerStructure
          .flatMap((cat) => cat.cols.flatMap((col) => col.items as unknown as NavItem[]))
          .find((i) => i.slug === activeTool);
        return item ? (labels[item.key] ?? item.key) : undefined;
      })()
    : undefined;

  // Workspace root label — used in breadcrumb (home title + breadcrumb root)
  const WS_LABEL: Record<string, string> = {
    zh: "工作台", "zh-Hant": "工作台", es: "Área de trabajo", pt: "Área de trabalho",
    fr: "Espace de travail", ja: "ワークスペース", de: "Arbeitsbereich", ko: "작업 공간",
  };
  const wsLabel = WS_LABEL[locale] ?? "Workspace";

  // One-line value subtitle — reuse existing quickstart card copy for the 4 AI tools
  const toolDescriptionMap: Record<string, string> = {
    "/chat-with-pdf":  dash.cardChatDesc     ?? "",
    "/compare":        dash.cardCompareDesc  ?? "",
    "/ai-summary":     dash.cardSummaryDesc  ?? "",
    "/contract-risk":  dash.cardContractDesc ?? "",
  };
  const toolDescription = activeTool ? (toolDescriptionMap[activeTool] ?? "") : "";

  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[color:var(--line)] border-t-[color:var(--accent)]" />
      </div>
    );
  }

  return (
    <LegalSessionProvider>
    <WorkspaceNavContext.Provider value={setActiveTool}>
    <div className="flex h-screen overflow-hidden bg-[color:var(--background)]">
      <WorkspaceSidebar locale={locale} activeTool={activeTool} onToolSelect={setActiveTool} onLocaleChange={handleLocaleChange} />

      {/* ── Right column (topbar + content) ── */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* ── Sticky topbar: height = sidebar logo (48px), always visible ── */}
        <header
          className="flex shrink-0 items-center border-b border-[color:var(--line)] bg-[color:var(--background)] px-6"
          style={{ height: 48 }}
        >
          {activeTool && toolLabel ? (
            <nav className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden text-[14px] leading-none">
              <button
                type="button"
                onClick={() => setActiveTool(null)}
                className="shrink-0 whitespace-nowrap text-[color:var(--muted)] transition hover:text-[color:var(--foreground)]"
              >
                {wsLabel}
              </button>
              <span className="shrink-0 select-none text-[color:var(--faint)]">›</span>
              <span className="min-w-0 truncate font-semibold text-[color:var(--foreground)]">{toolLabel}</span>
            </nav>
          ) : (
            <h1 className="text-[14px] font-semibold leading-none text-[color:var(--foreground)]">
              {wsLabel}
            </h1>
          )}
        </header>

        <div className="flex flex-1 flex-col overflow-y-auto">
        {activeTool ? (
          /* ── Tool active: content starts at top of scroll area ── */
          <div className="flex min-h-full flex-col items-center">
            {activeTool === "/workspace-account" ? (
              <div className="mx-auto w-full max-w-md px-8 pb-10">
                <AccountEmbedded locale={locale} />
              </div>
            ) : WORKSPACE_PDF_SLUGS.has(activeTool) ? (
              <WorkspacePdfToolEmbedded slug={activeTool.slice(1)} locale={locale} />
            ) : activeTool === "/contract-risk" ? (
              <ContractRiskEmbedded locale={locale} embedded />
            ) : activeTool === "/chat-with-pdf" ? (
              <ChatWithPdfEmbedded locale={locale} embedded />
            ) : activeTool === "/compare" ? (
              <DocumentCompareEmbedded locale={locale} embedded />
            ) : activeTool === "/ai-summary" ? (
              <AiSummaryEmbedded locale={locale} embedded />
            ) : activeTool === "/redline" ? (
              <RedlineEmbedded locale={locale} embedded />
            ) : activeTool === "/extract-to-excel" ? (
              <ExtractExcelEmbedded locale={locale} embedded />
            ) : activeTool === "/flashcards" ? (
              <QuizEmbedded locale={locale} embedded />
            ) : activeTool === "/batch-summary" ? (
              <BatchSummaryEmbedded locale={locale} embedded />
            ) : activeTool === "/batch-sort" ? (
              <BatchSortEmbedded locale={locale} embedded />
            ) : activeTool === "/lease-redflag" ? (
              <LeaseRedflagEmbedded locale={locale} embedded />
            ) : activeTool === "/govbid-matrix" ? (
              <GovbidMatrixEmbedded locale={locale} embedded />
            ) : activeTool === "/workspace-legal" ? (
              <LegalHubEmbedded locale={locale} />
            ) : activeTool === "/workspace-finance" ? (
              <DomainSoonPanel domain="finance" locale={locale} />
            ) : activeTool === "/workspace-research" ? (
              <DomainSoonPanel domain="research" locale={locale} />
            ) : null}
          </div>
        ) : history.length > 0 ? (
          /* ── ③ Recent docs (returning user) ── */
          <div className="mx-auto w-full max-w-2xl px-8 py-12">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--faint)]">
              {dash.recentShort ?? "Recent"}
            </p>
            <div className="space-y-1">
              {history.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  className="flex min-w-0 items-center gap-3 rounded-[var(--radius)] border border-transparent px-3 py-2.5 transition hover:border-[color:var(--line)] hover:bg-[color:var(--surface)]"
                >
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0 text-[color:var(--faint)]">
                    <path d="M5 3h8l4 4v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
                    <path d="M13 3v4h4" />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-[color:var(--foreground)]">
                      {item.fileName}
                    </p>
                    <p className="text-[11px] text-[color:var(--faint)]">{item.subtitle}</p>
                  </div>
                </a>
              ))}
            </div>
            <p className="mt-8 text-center text-[11.5px] text-[color:var(--faint)]">
              ⚿ {dash.privacyNote ?? "Files processed in your browser · never uploaded"}
            </p>
          </div>
        ) : (
          /* ── ③ Quick start (new user) ── */
          <div
            className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-8 py-12"
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--faint)]">
              {dash.quickStart ?? "Quick start"}
            </p>

            {/* Tool cards — 2×2 grid */}
            <div className="grid grid-cols-2 gap-3">
              {CARDS.map((card) => (
                <button
                  key={card.navKey}
                  type="button"
                  onClick={() => setActiveTool(card.href)}
                  className="group flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5 text-left transition hover:border-[color:var(--accent)]"
                >
                  <span className="text-[color:var(--muted)] transition group-hover:text-[color:var(--accent)]">
                    {card.icon}
                  </span>
                  <div>
                    <p className="text-[14px] font-semibold text-[color:var(--foreground)]">
                      {labels[card.navKey] ?? card.navKey}
                    </p>
                    <p className="mt-0.5 text-[12.5px] leading-relaxed text-[color:var(--muted)]">
                      {dash[card.descKey] ?? ""}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Drop zone */}
            <div
              className={`mt-6 flex flex-col items-center justify-center rounded-[var(--radius-lg)] border-2 border-dashed px-6 py-10 text-center transition ${
                dragOver
                  ? "border-[color:var(--accent)] bg-[color:var(--surface-subtle)]"
                  : "border-[color:var(--line)] hover:border-[color:var(--line-strong)]"
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3 h-8 w-8 text-[color:var(--faint)]">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p className="text-[14px] font-medium text-[color:var(--muted)]">
                {dragOver
                  ? (dash.dropActive ?? "Drop to open with AI Chat")
                  : (dash.dropHere ?? "Drop a document here")}
              </p>
              <p className="mt-1 text-[12px] text-[color:var(--faint)]">
                {dash.fileTypes ?? "PDF · Word · Excel · PowerPoint"}
              </p>
            </div>

            <p className="mt-auto pt-8 text-center text-[11.5px] text-[color:var(--faint)]">
              ⚿ {dash.privacyNote ?? "Files processed in your browser · never uploaded"}
            </p>
          </div>
        )}
        </div>
      </main>
    </div>
    </WorkspaceNavContext.Provider>
    </LegalSessionProvider>
  );
}
