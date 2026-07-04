// Post-result conversion bridge: after a tool produces output, offer ONE genuinely
// useful next step toward a related (often AI/Pro) workflow. Honest, opt-in, never a
// dark pattern. It is a fresh suggestion — it does NOT carry the file over and must
// never imply a client-side tool uploaded anything. Returns null for slugs with no
// bridge, so it's safe to mount everywhere. Only links to LIVE tools (never soon:true).

import { toHant } from "./zh-hant";

// Locales with their own bridge-copy literals (Record keys). zh-Hant is NOT a key;
// it is derived from zh via OpenCC in the component (see BridgeLocaleInput).
type BridgeLocale = "en" | "zh" | "es" | "pt" | "fr" | "ja";
type BridgeLocaleInput = BridgeLocale | "de" | "ko" | "zh-Hant";
// Resolve a per-locale string, deriving zh-Hant from the zh value via OpenCC.
// de/ko have no authored bridge copy → fall to rec.en via the ?? below (GAP: de/ko bridge copy).
function bridgeStr(rec: Record<BridgeLocale, string>, locale: BridgeLocaleInput): string {
  if (locale === "zh-Hant") return toHant(rec.zh);
  return rec[locale as BridgeLocale] ?? rec.en;
}

type Bridge = {
  targetHref: string;
  label: Record<BridgeLocale, string>;
  pitch: Record<BridgeLocale, string>;
};

const EXTRACT_TO_EXCEL: Bridge = {
  targetHref: "/extract-to-excel",
  label: { en: "Extract to Excel", zh: "数据抽取到表格", es: "Extraer a Excel", pt: "Extrair para Excel", fr: "Extraire vers Excel", ja: "Excel に抽出" },
  pitch: {
    en: "Need the data inside, not just a smaller file? Pull tables and figures into a spreadsheet.",
    zh: "需要里面的数据，而不只是更小的文件？把表格和数字抽取到电子表格。",
    es: "¿Necesitas los datos, no solo un archivo más pequeño? Extrae tablas y cifras a una hoja de cálculo.",
    pt: "Precisa dos dados, não só de um arquivo menor? Extraia tabelas e números para uma planilha.",
    fr: "Besoin des données, pas seulement d'un fichier plus léger ? Extrayez tableaux et chiffres vers un tableur.",
    ja: "小さくするだけでなく中のデータが必要ですか？表や数値をスプレッドシートに抽出できます。",
  },
};

const BATCH_WORD: Bridge = {
  targetHref: "/batch-word-to-pdf",
  label: { en: "Batch Word to PDF", zh: "批量 Word 转 PDF", es: "Word a PDF por lotes", pt: "Word para PDF em lote", fr: "Word vers PDF par lot", ja: "Word を PDF に一括変換" },
  pitch: {
    en: "Got a whole folder? Convert many Word files to PDF in one batch.",
    zh: "有一整个文件夹？一次把多个 Word 文件转成 PDF。",
    es: "¿Tienes una carpeta entera? Convierte muchos archivos de Word a PDF en un lote.",
    pt: "Tem uma pasta inteira? Converta muitos arquivos do Word em PDF de uma vez.",
    fr: "Tout un dossier ? Convertissez plusieurs fichiers Word en PDF en un seul lot.",
    ja: "フォルダごとまとめて？複数の Word ファイルを一括で PDF に変換できます。",
  },
};

const CHAT_WITH_PDF: Bridge = {
  targetHref: "/chat-with-pdf",
  label: { en: "Chat with PDF", zh: "和 PDF 对话", es: "Chatear con PDF", pt: "Conversar com PDF", fr: "Discuter avec le PDF", ja: "PDF とチャット" },
  pitch: {
    en: "Want to understand this document? Ask it questions and get answers cited from the text.",
    zh: "想读懂这份文档？直接提问，答案都引用原文。",
    es: "¿Quieres entender este documento? Hazle preguntas y recibe respuestas citadas del texto.",
    pt: "Quer entender este documento? Faça perguntas e receba respostas citadas do texto.",
    fr: "Envie de comprendre ce document ? Posez vos questions, les réponses citent le texte.",
    ja: "この文書を理解したいですか？質問すると、本文を引用した回答が得られます。",
  },
};

const COMPARE_DOCS: Bridge = {
  targetHref: "/compare",
  label: { en: "Compare Documents", zh: "多文档对比", es: "Comparar documentos", pt: "Comparar documentos", fr: "Comparer des documents", ja: "ドキュメント比較" },
  pitch: {
    en: "Comparing versions or several files? See exactly what differs, side by side.",
    zh: "要比对版本或多份文件？并排看清到底哪里不同。",
    es: "¿Comparas versiones o varios archivos? Ve exactamente qué cambia, lado a lado.",
    pt: "Comparando versões ou vários arquivos? Veja exatamente o que muda, lado a lado.",
    fr: "Comparer des versions ou plusieurs fichiers ? Voyez précisément ce qui diffère, côte à côte.",
    ja: "バージョンや複数ファイルを比較しますか？違いを並べて正確に確認できます。",
  },
};

const BATCH_PPT: Bridge = {
  targetHref: "/batch-ppt-to-pdf",
  label: { en: "Batch PPT to PDF", zh: "批量 PPT 转 PDF", es: "PPT a PDF por lotes", pt: "PPT para PDF em lote", fr: "PPT vers PDF par lot", ja: "PPT を PDF に一括変換" },
  pitch: {
    en: "Got a whole folder? Convert many PowerPoint files to PDF in one batch.",
    zh: "有一整个文件夹？一次把多个 PowerPoint 文件转成 PDF。",
    es: "¿Tienes una carpeta entera? Convierte muchos archivos de PowerPoint a PDF en un lote.",
    pt: "Tem uma pasta inteira? Converta muitos arquivos do PowerPoint em PDF de uma vez.",
    fr: "Tout un dossier ? Convertissez plusieurs présentations en PDF en un seul lot.",
    ja: "フォルダごとまとめて？複数の PowerPoint ファイルを一括で PDF に変換できます。",
  },
};

const BATCH_EXCEL_TO_PDF: Bridge = {
  targetHref: "/batch-excel-to-pdf",
  label: { en: "Batch Excel to PDF", zh: "批量 Excel 转 PDF", es: "Excel a PDF por lotes", pt: "Excel para PDF em lote", fr: "Excel vers PDF par lot", ja: "Excel を PDF に一括変換" },
  pitch: {
    en: "Got a whole folder? Convert many Excel files to PDF in one batch.",
    zh: "有一整个文件夹？一次把多个 Excel 文件转成 PDF。",
    es: "¿Tienes una carpeta entera? Convierte muchos archivos de Excel a PDF en un lote.",
    pt: "Tem uma pasta inteira? Converta muitos arquivos do Excel em PDF de uma vez.",
    fr: "Tout un dossier ? Convertissez plusieurs feuilles de calcul en PDF en un seul lot.",
    ja: "フォルダごとまとめて？複数の Excel ファイルを一括で PDF に変換できます。",
  },
};

const BATCH_PDF_TO_EXCEL: Bridge = {
  targetHref: "/batch-pdf-to-excel",
  label: { en: "Batch PDF to Excel", zh: "批量 PDF 转 Excel", es: "PDF a Excel por lotes", pt: "PDF para Excel em lote", fr: "PDF vers Excel par lot", ja: "PDF を Excel に一括変換" },
  pitch: {
    en: "Got multiple PDFs with tables? Convert them all to Excel in one go.",
    zh: "有多个含表格的 PDF？一次全部转成 Excel。",
    es: "¿Tienes varios PDF con tablas? Conviértelos todos a Excel de una vez.",
    pt: "Tem vários PDF com tabelas? Converta todos para Excel de uma vez.",
    fr: "Plusieurs PDF avec des tableaux ? Convertissez-les tous en Excel en une fois.",
    ja: "表が入った PDF が複数ありますか？まとめて Excel に変換できます。",
  },
};

const UNLOCK_PDF: Bridge = {
  targetHref: "/unlock-pdf",
  label: { en: "Unlock PDF", zh: "解锁 PDF", es: "Desbloquear PDF", pt: "Desbloquear PDF", fr: "Déverrouiller le PDF", ja: "PDF のロック解除" },
  pitch: {
    en: "Restricted the wrong file? Remove restrictions and unlock editing, printing, and copying.",
    zh: "锁错文件了？移除限制，解锁编辑、打印和复制权限。",
    es: "¿Restringiste el archivo equivocado? Elimina restricciones y desbloquea edición, impresión y copia.",
    pt: "Restringiu o arquivo errado? Remova as restrições e desbloqueie edição, impressão e cópia.",
    fr: "Mauvais fichier verrouillé ? Supprimez les restrictions et déverrouillez l'édition, l'impression et la copie.",
    ja: "間違ったファイルを保護してしまいましたか？制限を解除して編集・印刷・コピーを可能にします。",
  },
};

// Source tool slug → the next-step bridge. Several page-edit + OCR tools share the
// Chat bridge; first batch covers the highest-intent jumps.
const BRIDGES: Record<string, Bridge> = {
  "compress-pdf": EXTRACT_TO_EXCEL,
  "batch-compress": EXTRACT_TO_EXCEL,
  "word-to-pdf": BATCH_WORD,
  "pdf-to-word": COMPARE_DOCS,
  "merge-pdf": COMPARE_DOCS,
  "delete-page": CHAT_WITH_PDF,
  "rotate-page": CHAT_WITH_PDF,
  "reorder-pages": CHAT_WITH_PDF,
  "add-page": CHAT_WITH_PDF,
  "ocr": CHAT_WITH_PDF,
  "ocr-pdf": CHAT_WITH_PDF,
  "batch-pdf-to-image": CHAT_WITH_PDF,
  "batch-word-to-pdf": CHAT_WITH_PDF,
  "batch-ppt-to-pdf": CHAT_WITH_PDF,
  "batch-excel-to-pdf": CHAT_WITH_PDF,
  "batch-pdf-to-word": COMPARE_DOCS,
  "batch-pdf-to-excel": COMPARE_DOCS,
  // Phase 2 — interactive + results tools
  "crop-pdf": CHAT_WITH_PDF,
  "split-pdf": CHAT_WITH_PDF,
  "sign-pdf": CHAT_WITH_PDF,
  "redact-pdf": CHAT_WITH_PDF,
  "page-numbers": CHAT_WITH_PDF,
  "watermark-pdf": CHAT_WITH_PDF,
  "pdf-to-image": CHAT_WITH_PDF,
  "images-to-pdf": CHAT_WITH_PDF,
  "extract-to-excel": CHAT_WITH_PDF,
  "translate-pdf": CHAT_WITH_PDF,
  "redline": CHAT_WITH_PDF,
  "compare": CHAT_WITH_PDF,
  "contract-review": CHAT_WITH_PDF,
  "contract-risk": CHAT_WITH_PDF,
  "govbid-matrix": CHAT_WITH_PDF,
  "lease-redflag": CHAT_WITH_PDF,
  "batch-protect-pdf": CHAT_WITH_PDF,
  "batch-translate": CHAT_WITH_PDF,
  // Conversion tools — previously missing
  "pdf-to-markdown": CHAT_WITH_PDF,
  "html-to-pdf": CHAT_WITH_PDF,
  "pdf-to-ppt": CHAT_WITH_PDF,
  "pdf-to-pdfa": CHAT_WITH_PDF,
  "ppt-to-pdf": BATCH_PPT,
  "excel-to-pdf": BATCH_EXCEL_TO_PDF,
  "pdf-to-excel": BATCH_PDF_TO_EXCEL,
  "protect-pdf": UNLOCK_PDF,
  "unlock-pdf": CHAT_WITH_PDF,
  "pdf-to-text": CHAT_WITH_PDF,
  "pdf-to-html": CHAT_WITH_PDF,
};

const NEXT_LABEL: Record<BridgeLocale, string> = {
  en: "Next step",
  zh: "下一步",
  es: "Siguiente paso",
  pt: "Próximo passo",
  fr: "Étape suivante",
  ja: "次のステップ",
};

// Bridge icons — 16×16 box, stroke-width 1.5, currentColor.
// Matches the Header ☰ menu icon style (Joe, 2026-06-25).
function BridgeIcon({ href }: { href: string }) {
  const p = {
    viewBox: "0 0 16 16",
    fill: "none" as const,
    stroke: "currentColor" as const,
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-4 w-4 shrink-0",
  };
  if (href === "/extract-to-excel") return (
    <svg {...p}>
      <rect x="2" y="2" width="12" height="12" rx="1.5"/>
      <path d="M2 6h12M2 10h12M6 2v12"/>
    </svg>
  );
  if (href === "/compare") return (
    <svg {...p}>
      <rect x="1.5" y="3" width="5.5" height="10" rx="1"/>
      <rect x="9" y="3" width="5.5" height="10" rx="1"/>
      <path d="M7.25 8h1.5"/>
    </svg>
  );
  if (href === "/batch-word-to-pdf") return (
    <svg {...p}>
      <rect x="4" y="1.5" width="8.5" height="11" rx="1.5"/>
      <rect x="2" y="3.5" width="8.5" height="11" rx="1.5"/>
    </svg>
  );
  if (href === "/chat-with-pdf") return (
    <svg {...p}>
      <path d="M13.5 2.5h-11A1 1 0 0 0 1.5 3.5v7a1 1 0 0 0 1 1H5l2.5 2.5L10 11.5h2.5a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1z"/>
    </svg>
  );
  return (
    <svg {...p}>
      <rect x="1.5" y="1.5" width="13" height="13" rx="2"/>
      <path d="M5 8h6M9 5.5l2.5 2.5L9 10.5"/>
    </svg>
  );
}

// True if this slug has a next-step bridge — lets mount points skip the wrapper
// entirely (no empty padded box) when there is nothing to show.
export function hasToolBridge(slug: string): boolean {
  return slug in BRIDGES;
}

export function ToolBridge({
  slug,
  locale = "en",
  useLocalePrefix = false,
}: {
  slug: string;
  locale?: BridgeLocaleInput;
  useLocalePrefix?: boolean;
}) {
  const bridge = BRIDGES[slug];
  if (!bridge) return null;

  const href = useLocalePrefix ? `/${locale}${bridge.targetHref}` : bridge.targetHref;

  return (
    <a
      href={href}
      className="group flex items-center gap-3 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-3 transition-colors hover:border-[color:var(--line-strong)] hover:bg-[color:var(--surface-subtle)]"
    >
      {/* Tool icon box */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-raised)] text-[color:var(--muted)]">
        <BridgeIcon href={bridge.targetHref} />
      </div>

      {/* Text block */}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--faint)]">
          {bridgeStr(NEXT_LABEL, locale)}
        </p>
        <p className="text-[13px] font-semibold leading-snug text-[color:var(--foreground)]">
          {bridgeStr(bridge.label, locale)}
        </p>
        <p className="mt-0.5 text-xs leading-snug text-[color:var(--muted)]">
          {bridgeStr(bridge.pitch, locale)}
        </p>
      </div>

      {/* Arrow */}
      <svg
        viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round"
        className="h-4 w-4 shrink-0 text-[color:var(--faint)] transition-transform group-hover:translate-x-0.5"
      >
        <path d="M3 8h10M9 4.5l3.5 3.5L9 11.5"/>
      </svg>
    </a>
  );
}
