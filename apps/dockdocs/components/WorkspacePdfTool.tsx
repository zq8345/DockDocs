"use client";

import type { ReactNode } from "react";
import type { RuntimeLocale } from "@/lib/copy";
import type { RouteLocale, ToolSlug } from "@/lib/i18n";
import { getLocalizedToolConfig } from "@/lib/localized-tools";
import { PdfToolPageEmbedded } from "../../../shared/templates/pdf-tool-page";
import { WorkspaceValueZone } from "@/components/WorkspaceValueZone";

// Specialized clients — page-editing tools
import { EditPdfClient } from "@/components/pdf-editor/EditPdfClient";
import { MergePdfClient } from "@/components/MergePdfClient";
import { SplitPdfClient } from "@/components/SplitPdfClient";
import { DeletePagesClient } from "@/components/DeletePagesClient";
import { RotatePagesClient } from "@/components/RotatePagesClient";
import { PageReorderClient } from "@/components/PageReorderClient";
import { InsertPdfClient } from "@/components/InsertPdfClient";
import { WatermarkEditorClient } from "@/components/WatermarkEditorClient";
import { PageNumbersClient } from "@/components/PageNumbersClient";

// Specialized clients — image/utility tools
import { PdfToImageClient } from "@/components/PdfToImageClient";
import { ImagesToPdfClient } from "@/components/ImagesToPdfClient";
import { CropPdfClient } from "@/components/CropPdfClient";
import { RedactPdfClient } from "@/components/RedactPdfClient";
import { SignPdfClient } from "@/components/SignPdfClient";

// Batch clients
import { BatchCompressClient } from "@/components/BatchCompressClient";
import { BatchPdfToImageClient } from "@/components/BatchPdfToImageClient";
import { BatchProtectClient } from "@/components/BatchProtectClient";
import { BatchPdfToOfficeClient } from "@/components/BatchPdfToOfficeClient";
import { BatchOfficeToPdfClient } from "@/components/BatchOfficeToPdfClient";
import { BatchTranslateClient } from "@/components/BatchTranslateClient";

type L = RouteLocale;

function toL(locale: RuntimeLocale): L {
  return (locale as L) ?? "en";
}

// Tools that use PdfToolPage template on the official site → PdfToolPageEmbedded + real config.
// Must be valid ToolSlugs so getLocalizedToolConfig can look them up.
const WORKFLOW_ENGINE_SLUGS = new Set<string>([
  "compress-pdf",    "pdf-to-word",    "pdf-to-excel",   "pdf-to-ppt",
  "pdf-to-pdfa",     "pdf-to-html",    "pdf-to-markdown", "word-to-pdf",
  "excel-to-pdf",    "ppt-to-pdf",     "html-to-pdf",    "protect-pdf",
  "unlock-pdf",      "ocr-pdf",
]);

// Subset of WORKFLOW_ENGINE_SLUGS where files are sent to our server (CloudConvert
// or Gotenberg). Cannot claim "zero upload" — show "server" value zone instead.
// Source of truth: CloudConvertRoute in shared/templates/pdf-tool-page/cloudconvert-runtime.ts
const CLOUD_CONVERT_ENGINE_SLUGS = new Set<string>([
  "pdf-to-word", "pdf-to-excel", "pdf-to-ppt", "pdf-to-pdfa",
  "word-to-pdf", "excel-to-pdf", "ppt-to-pdf", "html-to-pdf",
  "protect-pdf",
]);

// Tools with specialized client UIs — mirror official catch-all exactly (props included).
const CUSTOM_RENDERERS: Record<string, (loc: L) => ReactNode> = {
  // Page-editing tools (moved from engine: official site uses dedicated clients)
  "edit-pdf":           (loc) => <EditPdfClient locale={loc} embedded />,
  "merge-pdf":          (loc) => <MergePdfClient locale={loc} embedded />,
  "split-pdf":          (loc) => <SplitPdfClient locale={loc} embedded />,
  "delete-page":        (loc) => <DeletePagesClient locale={loc} embedded />,
  "rotate-page":        (loc) => <RotatePagesClient locale={loc} embedded />,
  "reorder-pages":      (loc) => <PageReorderClient locale={loc} embedded />,
  "add-page":           (loc) => <InsertPdfClient locale={loc} embedded />,
  "watermark-pdf":      (loc) => <WatermarkEditorClient locale={loc} embedded />,
  "page-numbers":       (loc) => <PageNumbersClient locale={loc} embedded />,

  // Image/utility tools
  "pdf-to-image":       (loc) => <PdfToImageClient locale={loc} defaultFormat="jpg" variant="hub" embedded />,
  "images-to-pdf":      (loc) => <ImagesToPdfClient locale={loc} embedded />,
  "crop-pdf":           (loc) => <CropPdfClient locale={loc} embedded />,
  "redact-pdf":         (loc) => <RedactPdfClient locale={loc} embedded />,
  "sign-pdf":           (loc) => <SignPdfClient locale={loc} embedded />,

  // Batch tools
  "batch-compress":     (loc) => <BatchCompressClient locale={loc} embedded />,
  "batch-pdf-to-image": (loc) => <BatchPdfToImageClient locale={loc} embedded />,
  "batch-protect-pdf":  (loc) => <BatchProtectClient locale={loc} embedded />,
  "batch-pdf-to-word":  (loc) => <BatchPdfToOfficeClient locale={loc} target="word" embedded />,
  "batch-pdf-to-excel": (loc) => <BatchPdfToOfficeClient locale={loc} target="excel" embedded />,
  "batch-word-to-pdf":  (loc) => <BatchOfficeToPdfClient locale={loc} source="word" embedded />,
  "batch-excel-to-pdf": (loc) => <BatchOfficeToPdfClient locale={loc} source="excel" embedded />,
  "batch-ppt-to-pdf":   (loc) => <BatchOfficeToPdfClient locale={loc} source="ppt" embedded />,
  "batch-translate":    (loc) => <BatchTranslateClient locale={loc} embedded />,
};

const FALLBACK_LABEL: Partial<Record<L, [string, string]>> = {
  zh: ["完整工具页面即将支持", "在完整页面中打开 →"],
  "zh-Hant": ["完整工具頁面即將支援", "在完整頁面中開啟 →"],
  ja: ["ワークスペースへの対応は近日公開予定です", "フルページで開く →"],
  de: ["Vollständige Unterstützung demnächst", "Im vollständigen Tool öffnen →"],
  fr: ["Support complet bientôt disponible", "Ouvrir la page complète →"],
  es: ["Soporte completo próximamente", "Abrir en la página completa →"],
  pt: ["Suporte completo em breve", "Abrir página completa →"],
};

export function WorkspacePdfTool({ slug, locale = "en" }: { slug: string; locale?: RuntimeLocale }) {
  const loc = toL(locale);

  // Path 1: PdfToolPage-template tools — use real localized config (same as official site)
  if (WORKFLOW_ENGINE_SLUGS.has(slug)) {
    const vzType = CLOUD_CONVERT_ENGINE_SLUGS.has(slug) ? "server" : "client";
    return (
      <PdfToolPageEmbedded
        key={slug}
        config={getLocalizedToolConfig(loc, slug as ToolSlug)}
        valueZone={<WorkspaceValueZone type={vzType} locale={loc} />}
      />
    );
  }

  // Path 2: Specialized client tools — mirror official catch-all props exactly
  const renderer = CUSTOM_RENDERERS[slug];
  if (renderer) {
    return <div key={slug} className="w-full">{renderer(loc)}</div>;
  }

  // Path 3: Fallback (should not be reached for any known sidebar slug)
  const [msg, link] = FALLBACK_LABEL[loc] ?? ["Full workspace support coming soon.", "Open full page →"];
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 text-center">
      <p className="text-[14px] text-[color:var(--muted)]">{msg}</p>
      <a
        href={`/${slug}/`}
        className="inline-flex h-10 items-center rounded-[var(--radius)] border border-[color:var(--line)] px-5 text-[14px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]"
      >
        {link}
      </a>
    </div>
  );
}
