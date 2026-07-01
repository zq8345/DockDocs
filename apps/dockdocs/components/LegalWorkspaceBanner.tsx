"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getUser, onAuthChange } from "@/lib/auth";
import { routeLocaleFromSegment, type RouteLocale } from "@/lib/i18n";

const COPY: Record<RouteLocale, { msg: string; cta: string }> = {
  en:       { msg: "Run all 4 legal tools on one document and export a merged report",                       cta: "Open Legal Workspace →" },
  zh:       { msg: "一次运行全部 4 个法律工具，导出合并分析报告",                                            cta: "打开法律工作区 →" },
  "zh-Hant":{ msg: "一次執行全部 4 個法律工具，匯出合併分析報告",                                           cta: "開啟法律工作區 →" },
  es:       { msg: "Analiza con las 4 herramientas legales a la vez y exporta un informe unificado",         cta: "Abrir espacio de trabajo →" },
  pt:       { msg: "Use as 4 ferramentas jurídicas de uma vez e exporte um relatório combinado",              cta: "Abrir espaço de trabalho →" },
  fr:       { msg: "Analysez avec les 4 outils juridiques en une fois et exportez un rapport fusionné",      cta: "Ouvrir l'espace de travail →" },
  ja:       { msg: "4 つの法務ツールを一括実行し、統合レポートをエクスポート",                               cta: "法務ワークスペースを開く →" },
  de:       { msg: "Alle 4 Rechts-Tools auf einmal nutzen und einen zusammengeführten Bericht exportieren",  cta: "Arbeitsbereich öffnen →" },
  ko:       { msg: "4가지 법률 도구를 한 번에 실행하고 통합 보고서 내보내기",                               cta: "법률 작업 공간 열기 →" },
};

export function LegalWorkspaceBanner() {
  const [loggedIn, setLoggedIn] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;
    getUser().then((u) => { if (mounted) setLoggedIn(!!u); });
    const unsub = onAuthChange((u) => { if (mounted) setLoggedIn(!!u); });
    return () => { mounted = false; unsub(); };
  }, []);

  if (!loggedIn) return null;

  const seg = pathname?.split("/").filter(Boolean)[0] ?? "";
  const locale = routeLocaleFromSegment(seg);
  const c = COPY[locale];
  const href = locale === "en" ? "/workspace/workspace-legal" : `/${locale}/workspace/workspace-legal`;

  return (
    <div className="my-4 flex items-center gap-3 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-4 py-2.5">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0 text-[color:var(--accent)]" aria-hidden="true">
        <rect x="1" y="4" width="14" height="10" rx="1.5" />
        <path d="M5 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
      </svg>
      <p className="flex-1 text-[12px] leading-snug text-[color:var(--muted)]">{c.msg}</p>
      <a href={href} className="shrink-0 whitespace-nowrap text-[12px] font-medium text-[color:var(--accent)] hover:underline">{c.cta}</a>
    </div>
  );
}
