"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { WorkspaceSidebar } from "@/components/WorkspaceSidebar";
import { WorkspaceTopbar } from "@/components/WorkspaceTopbar";
import { WorkspaceNavContext } from "@/components/WorkspaceNavContext";
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

// All PDF tool slugs from the "Document tools" nav category — served via WorkspacePdfTool.
// Derived from headerStructure so adding a new tool auto-expands the set.
const WORKSPACE_PDF_SLUGS: Set<string> = new Set([
  ...(headerStructure.find((c) => c.catKey === "Document tools")?.cols ?? [])
    .flatMap((col) => col.items.map((item) => item.slug)),
  "/ocr-pdf",
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
export function DashboardWorkspace() {
  const [locale, setLocale] = useState<RuntimeLocale>("en");
  const [hydrated, setHydrated] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [history, setHistory] = useState<WorkHistoryItem[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("dockdocs-lang");
      if (saved && isRouteLocale(saved)) setLocale(saved as RuntimeLocale);
    } catch {}
    setHydrated(true);
    setHistory(readWorkHistory().slice(0, 8));
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("panel") === "account") {
        setActiveTool("/workspace-account");
        const clean = window.location.pathname;
        window.history.replaceState({}, "", clean);
      }
    }
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
        type NavItem = { key: string; slug: string };
        const item = headerStructure
          .flatMap((cat) => cat.cols.flatMap((col) => col.items as unknown as NavItem[]))
          .find((i) => i.slug === activeTool);
        return item ? (labels[item.key] ?? item.key) : undefined;
      })()
    : undefined;

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
    <WorkspaceNavContext.Provider value={setActiveTool}>
    <div className="flex h-screen overflow-hidden bg-[color:var(--background)]">
      <WorkspaceSidebar locale={locale} activeTool={activeTool} onToolSelect={setActiveTool} onLocaleChange={handleLocaleChange} />

      {/* ── Right column (topbar + content) ── */}
      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-1 flex-col overflow-y-auto">
        {activeTool ? (
          /* ── Tool active: vertically centred column (§六) ── */
          <div className="flex min-h-full flex-col items-center justify-center">
            {toolLabel && (
              <div className="w-full max-w-3xl px-8 pt-8 pb-4">
                <h1 className="text-[22px] font-medium text-[color:var(--foreground)]">{toolLabel}</h1>
                {toolDescription && <p className="mt-1 text-[13px] leading-[1.5] text-[color:var(--muted)]">{toolDescription}</p>}
              </div>
            )}
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
            ) : activeTool === "/lease-redflag" ? (
              <LeaseRedflagEmbedded locale={locale} embedded />
            ) : activeTool === "/govbid-matrix" ? (
              <GovbidMatrixEmbedded locale={locale} embedded />
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
  );
}
