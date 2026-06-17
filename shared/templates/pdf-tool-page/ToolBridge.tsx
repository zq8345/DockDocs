// Post-result conversion bridge: after a tool produces output, offer ONE genuinely
// useful next step toward a related (often AI/Pro) workflow. Honest, opt-in, never a
// dark pattern. It is a fresh suggestion — it does NOT carry the file over and must
// never imply a client-side tool uploaded anything. Returns null for slugs with no
// bridge, so it's safe to mount everywhere. Only links to LIVE tools (never soon:true).

type BridgeLocale = "en" | "zh" | "es" | "pt" | "fr";

type Bridge = {
  targetHref: string;
  label: Record<BridgeLocale, string>;
  pitch: Record<BridgeLocale, string>;
};

const EXTRACT_TO_EXCEL: Bridge = {
  targetHref: "/extract-to-excel",
  label: { en: "Extract to Excel", zh: "数据抽取到表格", es: "Extraer a Excel", pt: "Extrair para Excel", fr: "Extraire vers Excel" },
  pitch: {
    en: "Need the data inside, not just a smaller file? Pull tables and figures into a spreadsheet.",
    zh: "需要里面的数据，而不只是更小的文件？把表格和数字抽取到电子表格。",
    es: "¿Necesitas los datos, no solo un archivo más pequeño? Extrae tablas y cifras a una hoja de cálculo.",
    pt: "Precisa dos dados, não só de um arquivo menor? Extraia tabelas e números para uma planilha.",
    fr: "Besoin des données, pas seulement d'un fichier plus léger ? Extrayez tableaux et chiffres vers un tableur.",
  },
};

const BATCH_WORD: Bridge = {
  targetHref: "/batch-word-to-pdf",
  label: { en: "Batch Word to PDF", zh: "批量 Word 转 PDF", es: "Word a PDF por lotes", pt: "Word para PDF em lote", fr: "Word vers PDF par lot" },
  pitch: {
    en: "Got a whole folder? Convert many Word files to PDF in one batch.",
    zh: "有一整个文件夹？一次把多个 Word 文件转成 PDF。",
    es: "¿Tienes una carpeta entera? Convierte muchos archivos de Word a PDF en un lote.",
    pt: "Tem uma pasta inteira? Converta muitos arquivos do Word em PDF de uma vez.",
    fr: "Tout un dossier ? Convertissez plusieurs fichiers Word en PDF en un seul lot.",
  },
};

const CHAT_WITH_PDF: Bridge = {
  targetHref: "/chat-with-pdf",
  label: { en: "Chat with PDF", zh: "和 PDF 对话", es: "Chatear con PDF", pt: "Conversar com PDF", fr: "Discuter avec le PDF" },
  pitch: {
    en: "Want to understand this document? Ask it questions and get answers cited from the text.",
    zh: "想读懂这份文档？直接提问，答案都引用原文。",
    es: "¿Quieres entender este documento? Hazle preguntas y recibe respuestas citadas del texto.",
    pt: "Quer entender este documento? Faça perguntas e receba respostas citadas do texto.",
    fr: "Envie de comprendre ce document ? Posez vos questions, les réponses citent le texte.",
  },
};

const COMPARE_DOCS: Bridge = {
  targetHref: "/compare",
  label: { en: "Compare Documents", zh: "多文档对比", es: "Comparar documentos", pt: "Comparar documentos", fr: "Comparer des documents" },
  pitch: {
    en: "Comparing versions or several files? See exactly what differs, side by side.",
    zh: "要比对版本或多份文件？并排看清到底哪里不同。",
    es: "¿Comparas versiones o varios archivos? Ve exactamente qué cambia, lado a lado.",
    pt: "Comparando versões ou vários arquivos? Veja exatamente o que muda, lado a lado.",
    fr: "Comparer des versions ou plusieurs fichiers ? Voyez précisément ce qui diffère, côte à côte.",
  },
};

// Source tool slug → the next-step bridge. Several page-edit + OCR tools share the
// Chat bridge; first batch covers the highest-intent jumps.
const BRIDGES: Record<string, Bridge> = {
  "compress-pdf": EXTRACT_TO_EXCEL,
  "word-to-pdf": BATCH_WORD,
  "merge-pdf": COMPARE_DOCS,
  "delete-page": CHAT_WITH_PDF,
  "rotate-page": CHAT_WITH_PDF,
  "reorder-pages": CHAT_WITH_PDF,
  "add-page": CHAT_WITH_PDF,
  "ocr": CHAT_WITH_PDF,
  "ocr-pdf": CHAT_WITH_PDF,
};

const NEXT_LABEL: Record<BridgeLocale, string> = {
  en: "Next step",
  zh: "下一步",
  es: "Siguiente paso",
  pt: "Próximo passo",
  fr: "Étape suivante",
};

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
  locale?: BridgeLocale;
  useLocalePrefix?: boolean;
}) {
  const bridge = BRIDGES[slug];
  if (!bridge) return null;

  const href = useLocalePrefix ? `/${locale}${bridge.targetHref}` : bridge.targetHref;

  return (
    <a
      href={href}
      className="group flex items-start justify-between gap-4 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-4 py-3 transition hover:border-[color:var(--accent)] hover:bg-[color:var(--soft-accent)]"
    >
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--accent-strong)]">
          {NEXT_LABEL[locale] ?? NEXT_LABEL.en}
        </p>
        <p className="mt-1 text-[13px] leading-snug text-[color:var(--muted)]">
          {bridge.pitch[locale] ?? bridge.pitch.en}
        </p>
      </div>
      <span className="mt-0.5 shrink-0 whitespace-nowrap text-[13px] font-semibold text-[color:var(--foreground)] transition group-hover:translate-x-0.5">
        {bridge.label[locale] ?? bridge.label.en} →
      </span>
    </a>
  );
}
