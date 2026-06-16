"use client";

import { useCallback, useEffect, useRef, useState, type DragEvent } from "react";
import { loadTemplates, saveTemplate, deleteTemplate, type FlowTemplate } from "@/lib/flow-templates";
import { loadRunsForTemplate, saveRun, relativeTime, type FlowRun } from "@/lib/flow-runs";
import { isEncryptedPdfError, encryptedPdfNotice } from "@/lib/pdf-errors";
import { authHeader } from "@/lib/supabase";
import { ToolFaq } from "@/components/ToolFaq";
import { checkUsage, markUsage } from "@/lib/usage-gate";
import { UpgradePrompt } from "@/components/ui/UpgradePrompt";

// Comparison engine UI (bilingual).
//  D5: multi-file upload -> browser-side text extraction (pdf.js).
//  D6: /api/compare-extract -> aligned structured fields with sources -> table.

type Locale = "en" | "zh" | "es" | "pt" | "fr";
type DocStatus = "ok" | "empty" | "error";

type DocResult = {
  id: string;
  name: string;
  pages: number;
  chars: number;
  text: string;
  status: DocStatus;
  error?: string;
  file?: File; // kept so a scanned doc can be re-read with OCR
};

type CmpField = { value: string | null; source: string | null };
type CmpDoc = { id: string; name: string; fields: Record<string, CmpField> };
type Comparison = {
  docType: string;
  dimensions: Array<{ key: string; label: string }>;
  documents: CmpDoc[];
};

type Recommendation = {
  winnerId: string | null;
  headline: string;
  reasons: string[];
  perDoc: Array<{ id: string; pros: string[]; cons: string[] }>;
};

const MAX_FILES = 8;

const STR = {
  en: {
    badge: "Comparison engine",
    h1: "Compare documents",
    intro: `Upload 2–${MAX_FILES} PDFs of the same kind. DockDocs reads them in your browser, then lines up the key terms side by side — with the source line behind every value.`,
    drop: "Drag & drop PDFs here",
    dropHint: "Read locally — your files never leave your device. Field extraction runs on our server.",
    choose: "Choose PDFs",
    samples: "Try 3 sample quotes",
    extracting: "Extracting text…",
    typeLabel: "Type",
    compare: "Compare fields",
    comparing: "Comparing…",
    clear: "Clear",
    bExtracted: "Text extracted",
    bEmpty: "Not recognized (likely scanned — needs OCR)",
    ocrRun: "Extract text with OCR",
    ocrBusy: "Reading with OCR… (this can take a few seconds)",
    bError: "Failed to read",
    needTwo: "Add at least 2 readable documents to compare.",
    failed: "Comparison failed.",
    comparison: "Comparison",
    dimension: "Dimension",
    notRecognized: "Not recognized",
    tableNote:
      "Extracted by AI. Each value shows the exact source line it came from (verified to appear in that document). “Not recognized” means the document didn’t state it — nothing is guessed.",
    comingNext: "Coming next",
    next: [
      "A sourced recommendation (which option wins, and why)",
      "Click any value to jump to the exact spot in the original PDF",
      "Add your own dimensions to compare",
    ],
    docCount: (n: number) => `${n} document${n > 1 ? "s" : ""}`,
    pages: (n: number) => `${n} page${n === 1 ? "" : "s"} · `,
    chars: (n: number) => `${n.toLocaleString()} characters`,
    docTypes: [
      { value: "quote", label: "Quotes" },
      { value: "invoice", label: "Invoices" },
      { value: "contract", label: "Contracts" },
    ],
    tplSave: "Save as template",
    tplSaving: "Saving…",
    tplNamePlaceholder: "Template name (e.g. Vendor quotes)",
    tplConfirm: "Save",
    tplCancel: "Cancel",
    tplMyTemplates: "My templates",
    tplDelete: "Delete",
    tplLoaded: (name: string) => `Template: ${name}`,
    tplRerunHint: "Drop new files to re-run automatically",
    tplLastRun: "Last run",
    tplRunFiles: (n: number) => `${n} file${n > 1 ? "s" : ""}`,
    tplNoRuns: "No runs yet",
    tplEditDims: "Edit dimensions",
    tplDimLabel: "Label",
    tplDimAdd: "+ Add",
    tplDimApply: "Apply",
    tplDimReset: "Reset to default",
    tplNewFiles: "New files",
    tplDims: "dims",
    tplDropHere: "Drop PDFs to rerun",
    retry: "Try again",
  },
  zh: {
    badge: "对比引擎",
    h1: "多文档对比",
    intro: `上传 2–${MAX_FILES} 份同类 PDF。DockDocs 在你浏览器里读取，把关键条款并排列出——每个值后面都带原文出处。`,
    drop: "把 PDF 拖到这里",
    dropHint: "在本地读取——文件不离开你的设备。字段抽取在我们服务器上完成。",
    choose: "选择 PDF",
    samples: "试用 3 份示例报价单",
    extracting: "正在抽取文本…",
    typeLabel: "类型",
    compare: "对比字段",
    comparing: "对比中…",
    clear: "清空",
    bExtracted: "已抽取文本",
    bEmpty: "未识别(可能是扫描件——需 OCR)",
    ocrRun: "用 OCR 提取文字",
    ocrBusy: "OCR 识别中…(可能需要几秒)",
    bError: "读取失败",
    needTwo: "至少添加 2 份可读文档才能对比。",
    failed: "对比失败。",
    comparison: "对比结果",
    dimension: "维度",
    notRecognized: "未识别",
    tableNote:
      "由 AI 抽取。每个值都标注了它来自原文的那一句(已校验确实出现在该文档中)。「未识别」表示该文档没有写，绝不猜测。",
    comingNext: "即将推出",
    next: [
      "带依据的推荐(选哪个、为什么)",
      "点任意值，跳转到原 PDF 的对应位置",
      "自定义你要对比的维度",
    ],
    docCount: (n: number) => `${n} 份文档`,
    pages: (n: number) => `${n} 页 · `,
    chars: (n: number) => `${n.toLocaleString()} 字符`,
    docTypes: [
      { value: "quote", label: "报价单" },
      { value: "invoice", label: "账单" },
      { value: "contract", label: "合同" },
    ],
    tplSave: "保存为模板",
    tplSaving: "保存中…",
    tplNamePlaceholder: "模板名称（如：供应商报价单）",
    tplConfirm: "保存",
    tplCancel: "取消",
    tplMyTemplates: "我的模板",
    tplDelete: "删除",
    tplLoaded: (name: string) => `模板：${name}`,
    tplRerunHint: "拖入新文件即自动重跑对比",
    tplLastRun: "最近运行",
    tplRunFiles: (n: number) => `${n} 份文件`,
    tplNoRuns: "暂无运行记录",
    tplEditDims: "编辑维度",
    tplDimLabel: "标签",
    tplDimAdd: "+ 添加",
    tplDimApply: "应用",
    tplDimReset: "恢复默认",
    tplNewFiles: "新文件",
    tplDims: "个维度",
    tplDropHere: "拖入 PDF 即重跑",
    retry: "重试",
  },
  es: {
    badge: "Motor de comparación",
    h1: "Comparar documentos",
    intro: `Sube de 2 a ${MAX_FILES} PDF del mismo tipo. DockDocs los lee en tu navegador y luego alinea los términos clave uno al lado del otro, con la línea de origen detrás de cada valor.`,
    drop: "Arrastra y suelta PDF aquí",
    dropHint: "Se leen localmente: tus archivos nunca salen de tu dispositivo. La extracción de campos se ejecuta en nuestro servidor.",
    choose: "Elegir PDF",
    samples: "Probar 3 cotizaciones de ejemplo",
    extracting: "Extrayendo texto…",
    typeLabel: "Tipo",
    compare: "Comparar campos",
    comparing: "Comparando…",
    clear: "Limpiar",
    bExtracted: "Texto extraído",
    bEmpty: "No reconocido (probablemente escaneado: necesita OCR)",
    ocrRun: "Extraer texto con OCR",
    ocrBusy: "Leyendo con OCR… (esto puede tardar unos segundos)",
    bError: "Error al leer",
    needTwo: "Agrega al menos 2 documentos legibles para comparar.",
    failed: "La comparación falló.",
    comparison: "Comparación",
    dimension: "Dimensión",
    notRecognized: "No reconocido",
    tableNote:
      "Extraído por IA. Cada valor muestra la línea de origen exacta de la que proviene (verificada que aparece en ese documento). “No reconocido” significa que el documento no lo indicaba: no se adivina nada.",
    comingNext: "Próximamente",
    next: [
      "Una recomendación con fuentes (qué opción gana y por qué)",
      "Haz clic en cualquier valor para saltar al punto exacto en el PDF original",
      "Agrega tus propias dimensiones para comparar",
    ],
    docCount: (n: number) => `${n} documento${n > 1 ? "s" : ""}`,
    pages: (n: number) => `${n} página${n === 1 ? "" : "s"} · `,
    chars: (n: number) => `${n.toLocaleString()} caracteres`,
    docTypes: [
      { value: "quote", label: "Cotizaciones" },
      { value: "invoice", label: "Facturas" },
      { value: "contract", label: "Contratos" },
    ],
    tplSave: "Guardar como plantilla",
    tplSaving: "Guardando…",
    tplNamePlaceholder: "Nombre de plantilla (ej. Cotizaciones de proveedores)",
    tplConfirm: "Guardar",
    tplCancel: "Cancelar",
    tplMyTemplates: "Mis plantillas",
    tplDelete: "Eliminar",
    tplLoaded: (name: string) => `Plantilla: ${name}`,
    tplRerunHint: "Suelta archivos nuevos para volver a comparar automáticamente",
    tplLastRun: "Última ejecución",
    tplRunFiles: (n: number) => `${n} archivo${n > 1 ? "s" : ""}`,
    tplNoRuns: "Sin ejecuciones aún",
    tplEditDims: "Editar dimensiones",
    tplDimLabel: "Etiqueta",
    tplDimAdd: "+ Agregar",
    tplDimApply: "Aplicar",
    tplDimReset: "Restaurar predeterminado",
    tplNewFiles: "Archivos nuevos",
    tplDims: "dims.",
    tplDropHere: "Suelta PDFs para volver a ejecutar",
    retry: "Reintentar",
  },
  pt: {
    badge: "Motor de comparação",
    h1: "Comparar documentos",
    intro: `Envie de 2 a ${MAX_FILES} PDFs do mesmo tipo. O DockDocs os lê no seu navegador e alinha os termos-chave lado a lado — com a linha de origem por trás de cada valor.`,
    drop: "Arraste e solte PDFs aqui",
    dropHint: "Lidos localmente: seus arquivos nunca saem do seu dispositivo. A extração de campos é executada no nosso servidor.",
    choose: "Escolher PDFs",
    samples: "Experimentar 3 orçamentos de exemplo",
    extracting: "Extraindo texto…",
    typeLabel: "Tipo",
    compare: "Comparar campos",
    comparing: "Comparando…",
    clear: "Limpar",
    bExtracted: "Texto extraído",
    bEmpty: "Não reconhecido (provavelmente digitalizado: precisa de OCR)",
    ocrRun: "Extrair texto com OCR",
    ocrBusy: "Lendo com OCR… (pode levar alguns segundos)",
    bError: "Erro ao ler",
    needTwo: "Adicione pelo menos 2 documentos legíveis para comparar.",
    failed: "A comparação falhou.",
    comparison: "Comparação",
    dimension: "Dimensão",
    notRecognized: "Não reconhecido",
    tableNote:
      "Extraído por IA. Cada valor mostra a linha de origem exata de onde veio (verificada como presente nesse documento). \"Não reconhecido\" significa que o documento não o indicava — nada é inventado.",
    comingNext: "Em breve",
    next: [
      "Uma recomendação com fontes (qual opção vence e por quê)",
      "Clique em qualquer valor para ir ao ponto exato no PDF original",
      "Adicione suas próprias dimensões para comparar",
    ],
    docCount: (n: number) => `${n} documento${n > 1 ? "s" : ""}`,
    pages: (n: number) => `${n} página${n === 1 ? "" : "s"} · `,
    chars: (n: number) => `${n.toLocaleString()} caracteres`,
    docTypes: [
      { value: "quote", label: "Orçamentos" },
      { value: "invoice", label: "Faturas" },
      { value: "contract", label: "Contratos" },
    ],
    tplSave: "Salvar como modelo",
    tplSaving: "Salvando…",
    tplNamePlaceholder: "Nome do modelo (ex.: Orçamentos de fornecedores)",
    tplConfirm: "Salvar",
    tplCancel: "Cancelar",
    tplMyTemplates: "Meus modelos",
    tplDelete: "Excluir",
    tplLoaded: (name: string) => `Modelo: ${name}`,
    tplRerunHint: "Solte novos arquivos para recomparar automaticamente",
    tplLastRun: "Última execução",
    tplRunFiles: (n: number) => `${n} arquivo${n > 1 ? "s" : ""}`,
    tplNoRuns: "Nenhuma execução ainda",
    tplEditDims: "Editar dimensões",
    tplDimLabel: "Rótulo",
    tplDimAdd: "+ Adicionar",
    tplDimApply: "Aplicar",
    tplDimReset: "Restaurar padrão",
    tplNewFiles: "Novos arquivos",
    tplDims: "dims.",
    tplDropHere: "Solte PDFs para reexecutar",
    retry: "Tentar novamente",
  },
  fr: {
    badge: "Moteur de comparaison · bêta",
    h1: "Comparer des documents",
    intro: `Déposez 2 à ${MAX_FILES} PDF du même type. DockDocs les lit dans votre navigateur, puis aligne les termes clés côte à côte — avec la ligne source derrière chaque valeur.`,
    drop: "Glissez-déposez vos PDF ici",
    dropHint: "Lecture locale — vos fichiers ne quittent jamais votre appareil. L'extraction des champs s'effectue sur notre serveur.",
    choose: "Choisir des PDF",
    samples: "Tester 3 devis exemples",
    extracting: "Extraction du texte…",
    typeLabel: "Type",
    compare: "Comparer les champs",
    comparing: "Comparaison en cours…",
    clear: "Effacer",
    bExtracted: "Texte extrait",
    bEmpty: "Non reconnu (probablement scanné — nécessite l'OCR)",
    ocrRun: "Extraire le texte avec l'OCR",
    ocrBusy: "Lecture par OCR… (cela peut prendre quelques secondes)",
    bError: "Échec de la lecture",
    needTwo: "Ajoutez au moins 2 documents lisibles pour lancer la comparaison.",
    failed: "La comparaison a échoué.",
    comparison: "Comparaison",
    dimension: "Dimension",
    notRecognized: "Non reconnu",
    tableNote:
      "Extrait par IA. Chaque valeur affiche la ligne source exacte dont elle provient (vérifiée comme présente dans ce document). « Non reconnu » signifie que le document ne le mentionne pas — rien n'est deviné.",
    comingNext: "Prochainement",
    next: [
      "Une recommandation sourcée (quelle option l'emporte et pourquoi)",
      "Cliquez sur une valeur pour accéder à l'emplacement exact dans le PDF original",
      "Ajoutez vos propres dimensions à comparer",
    ],
    docCount: (n: number) => `${n} document${n > 1 ? "s" : ""}`,
    pages: (n: number) => `${n} page${n === 1 ? "" : "s"} · `,
    chars: (n: number) => `${n.toLocaleString()} caractères`,
    docTypes: [
      { value: "quote", label: "Devis" },
      { value: "invoice", label: "Factures" },
      { value: "contract", label: "Contrats" },
    ],
    tplSave: "Enregistrer comme modèle",
    tplSaving: "Enregistrement…",
    tplNamePlaceholder: "Nom du modèle (ex. Devis fournisseurs)",
    tplConfirm: "Enregistrer",
    tplCancel: "Annuler",
    tplMyTemplates: "Mes modèles",
    tplDelete: "Supprimer",
    tplLoaded: (name: string) => `Modèle : ${name}`,
    tplRerunHint: "Déposez de nouveaux fichiers pour relancer la comparaison automatiquement",
    tplLastRun: "Dernière exécution",
    tplRunFiles: (n: number) => `${n} fichier${n > 1 ? "s" : ""}`,
    tplNoRuns: "Aucune exécution pour le moment",
    tplEditDims: "Modifier les dimensions",
    tplDimLabel: "Libellé",
    tplDimAdd: "+ Ajouter",
    tplDimApply: "Appliquer",
    tplDimReset: "Rétablir les valeurs par défaut",
    tplNewFiles: "Nouveaux fichiers",
    tplDims: "dims.",
    tplDropHere: "Déposez des PDF pour relancer",
    retry: "Réessayer",
  },
} as const;

const REC = {
  en: {
    title: "Recommendation",
    thinking: "Weighing the options…",
    recommended: "Recommended",
    disclaimer: "This verdict is the AI's reasoning over the figures in the table below — unlike each table cell, it isn't individually source-checked. Confirm the numbers in the table before deciding.",
    recError: "Recommendation unavailable — the comparison table below is still accurate.",
  },
  zh: {
    title: "推荐",
    thinking: "正在权衡各选项…",
    recommended: "推荐",
    disclaimer: "此结论是 AI 基于下方表格里的数字做的推理——它不像表格每个单元格那样逐条核对过出处。决定前请以表格里的数字为准。",
    recError: "推荐加载失败——下方对比表仍然准确。",
  },
  es: {
    title: "Recomendación",
    thinking: "Sopesando las opciones…",
    recommended: "Recomendado",
    disclaimer: "Este veredicto es el razonamiento de la IA sobre las cifras de la tabla de abajo; a diferencia de cada celda de la tabla, no se verifica su fuente de forma individual. Confirma los números en la tabla antes de decidir.",
    recError: "Recomendación no disponible; la tabla de comparación sigue siendo precisa.",
  },
  pt: {
    title: "Recomendação",
    thinking: "Avaliando as opções…",
    recommended: "Recomendado",
    disclaimer: "Este veredicto é o raciocínio da IA sobre os números da tabela abaixo — ao contrário de cada célula da tabela, não é verificado individualmente em relação à fonte. Confirme os números na tabela antes de decidir.",
    recError: "Recomendação indisponível — a tabela de comparação abaixo continua precisa.",
  },
  fr: {
    title: "Recommandation",
    thinking: "Évaluation des options…",
    recommended: "Recommandé",
    disclaimer: "Ce verdict est le raisonnement de l'IA sur les chiffres du tableau ci-dessous — contrairement à chaque cellule du tableau, il n'est pas vérifié individuellement par rapport à la source. Confirmez les chiffres dans le tableau avant de décider.",
    recError: "Recommandation indisponible — le tableau de comparaison ci-dessous reste précis.",
  },
} as const;

const TRACE = {
  en: { source: "Source", notLocated: "Couldn't locate the exact snippet — showing the full text." },
  zh: { source: "原文出处", notLocated: "未能精确定位片段——显示全文。" },
  es: { source: "Origen", notLocated: "No se pudo localizar el fragmento exacto: se muestra el texto completo." },
  pt: { source: "Origem", notLocated: "Não foi possível localizar o trecho exato — exibindo o texto completo." },
  fr: { source: "Source", notLocated: "Impossible de localiser l'extrait exact — affichage du texte intégral." },
} as const;

// Localized dimension labels (the backend returns English labels).
const DIM_ZH: Record<string, string> = {
  vendor: "供应商",
  total_price: "总价",
  currency: "币种",
  delivery_time: "交期",
  payment_terms: "付款方式",
  warranty: "质保",
  validity: "有效期至",
  invoice_number: "发票号",
  total_amount: "总金额",
  issue_date: "开票日期",
  due_date: "到期日",
  parties: "签约方",
  effective_date: "生效日期",
  term: "期限",
  termination: "终止条款",
  governing_law: "管辖法律",
  liability: "责任上限",
};

// Mirrors DIMENSION_PRESETS in compare-extract.ts — used to show default
// dimensions in the editor before the first comparison result is back.
const CLIENT_PRESETS: Record<string, Array<{ key: string; label: string }>> = {
  quote: [
    { key: "vendor", label: "Vendor" },
    { key: "total_price", label: "Total price" },
    { key: "currency", label: "Currency" },
    { key: "delivery_time", label: "Delivery time" },
    { key: "payment_terms", label: "Payment terms" },
    { key: "warranty", label: "Warranty" },
    { key: "validity", label: "Valid until" },
  ],
  invoice: [
    { key: "vendor", label: "Vendor" },
    { key: "invoice_number", label: "Invoice #" },
    { key: "total_amount", label: "Total amount" },
    { key: "currency", label: "Currency" },
    { key: "issue_date", label: "Issue date" },
    { key: "due_date", label: "Due date" },
    { key: "payment_terms", label: "Payment terms" },
  ],
  contract: [
    { key: "parties", label: "Parties" },
    { key: "effective_date", label: "Effective date" },
    { key: "term", label: "Term / duration" },
    { key: "payment_terms", label: "Payment terms" },
    { key: "termination", label: "Termination" },
    { key: "governing_law", label: "Governing law" },
    { key: "liability", label: "Liability cap" },
  ],
};

function labelToKey(label: string): string {
  return label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || `dim_${Date.now()}`;
}

function locateSnippet(text: string, snippet: string, ctx = 600) {
  // Match the backend trust gate's normalization (lowercase + collapse whitespace)
  // so a source it verified never silently fails to highlight here. The doc text
  // is already single-spaced, so collapse the snippet's whitespace too.
  const needle = snippet.replace(/\s+/g, " ").trim().toLowerCase();
  const idx = needle ? text.toLowerCase().indexOf(needle) : -1;
  if (idx < 0) return { found: false as const };
  const len = needle.length;
  const start = Math.max(0, idx - ctx);
  const end = Math.min(text.length, idx + len + ctx);
  return {
    found: true as const,
    before: (start > 0 ? "…" : "") + text.slice(start, idx),
    match: text.slice(idx, idx + len),
    after: text.slice(idx + len, end) + (end < text.length ? "…" : ""),
  };
}

// Resolve a doc's display name from an id, tolerating ids the LLM may echo
// imperfectly in the recommendation (falls back to the name before ".pdf").
function resolveDocName(docs: ReadonlyArray<{ id: string; name: string }>, id: string) {
  const exact = docs.find((d) => d.id === id);
  if (exact) return exact.name;
  const cleaned = id.replace(/(\.pdf).*$/i, "$1");
  return docs.find((d) => d.name === cleaned)?.name ?? cleaned;
}

export function DocumentCompareClient({ locale = "en" }: { locale?: Locale }) {
  const cl = locale;
  const t = STR[cl];
  const r = REC[cl];
  const tr = TRACE[cl];
  const [results, setResults] = useState<DocResult[]>([]);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [docType, setDocType] = useState("quote");
  const [comparing, setComparing] = useState(false);
  const [comparison, setComparison] = useState<Comparison | null>(null);
  const [compareError, setCompareError] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [recommending, setRecommending] = useState(false);
  const [trace, setTrace] = useState<{ docId: string; docName: string; snippet: string } | null>(null);
  const [qaQ, setQaQ] = useState("");
  const [qaBusy, setQaBusy] = useState(false);
  const [qaAns, setQaAns] = useState<{ answer: string; sources: Array<{ docId: string; name: string; snippet: string }> } | null>(null);
  const [qaErr, setQaErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [ocrBusy, setOcrBusy] = useState<Set<string>>(new Set());
  const [limitHit, setLimitHit] = useState<number | null>(null);
  const [templates, setTemplates] = useState<FlowTemplate[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<FlowTemplate | null>(null);
  const [showSaveTpl, setShowSaveTpl] = useState(false);
  const [tplName, setTplName] = useState("");
  const [tplSaving, setTplSaving] = useState(false);
  const [rerunReady, setRerunReady] = useState(false);
  const [templateRuns, setTemplateRuns] = useState<FlowRun[]>([]);
  const compareRef = useRef<() => Promise<void>>(async () => {});
  const [recError, setRecError] = useState<string | null>(null);
  const [customDims, setCustomDims] = useState<Array<{ key: string; label: string }> | null>(null);
  const [editDims, setEditDims] = useState(false);
  const [editDimsRows, setEditDimsRows] = useState<Array<{ key: string; label: string }>>([]);
  const [cardDragTarget, setCardDragTarget] = useState<string | null>(null);

  useEffect(() => {
    setTemplates(loadTemplates());
  }, []);

  // Auto-trigger compare when a template is loaded and >= 2 readable docs are added.
  useEffect(() => {
    if (!rerunReady || comparing || comparison) return;
    const ok = results.filter((r) => r.status === "ok");
    if (ok.length >= 2) {
      setRerunReady(false);
      void compareRef.current();
    }
  }, [results, rerunReady, comparing, comparison]);

  const extractOne = useCallback(async (file: File): Promise<DocResult> => {
    const id = `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`;
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const data = new Uint8Array(await file.arrayBuffer());
      const doc = await pdfjs.getDocument({ data }).promise;
      let text = "";
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((it) => ("str" in it ? it.str : "")).join(" ") + "\n";
      }
      const trimmed = text.replace(/\s+/g, " ").trim();
      const numPages = doc.numPages;
      try { doc.destroy(); } catch { /* ignore */ }
      return { id, name: file.name, pages: numPages, chars: trimmed.length, text: trimmed, status: trimmed.length > 0 ? "ok" : "empty", file };
    } catch (e) {
      const msg = isEncryptedPdfError(e) ? encryptedPdfNotice(locale) : e instanceof Error ? e.message : String(e);
      return { id, name: file.name, pages: 0, chars: 0, text: "", status: "error", error: msg, file };
    }
  }, [locale]);

  const addFiles = useCallback(
    async (files: File[]) => {
      const pdfs = files.filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
      if (pdfs.length === 0) return;
      setBusy(true);
      setComparison(null);
      const extracted: DocResult[] = [];
      for (const f of pdfs) extracted.push(await extractOne(f));
      setResults((prev) => [...prev, ...extracted].slice(0, MAX_FILES));
      setBusy(false);
    },
    [extractOne],
  );

  // Re-read a scanned (empty) doc with in-browser OCR (free, client-side tesseract).
  const runOcrOn = useCallback(async (id: string) => {
    const doc = results.find((d) => d.id === id);
    if (!doc?.file) return;
    setOcrBusy((prev) => new Set(prev).add(id));
    try {
      const { runOcrPdfFirstPage } = await import("../../../shared/templates/pdf-tool-page/ocr-runtime");
      const res = await runOcrPdfFirstPage({
        file: doc.file,
        outputFileName: doc.name,
        pageRanges: "1-3",
        language: locale === "zh" ? "chi_sim" : "eng",
        locale,
      });
      const text = (res.text ?? "").replace(/\s+/g, " ").trim();
      setResults((prev) => prev.map((d) => (d.id === id ? { ...d, text, chars: text.length, status: text ? "ok" : "empty", error: text ? undefined : d.error } : d)));
    } catch (e) {
      setResults((prev) => prev.map((d) => (d.id === id ? { ...d, status: "empty", error: e instanceof Error ? e.message : String(e) } : d)));
    } finally {
      setOcrBusy((prev) => { const n = new Set(prev); n.delete(id); return n; });
    }
  }, [results, locale]);

  const loadSamples = useCallback(async () => {
    setBusy(true);
    const { PDFDocument, StandardFonts } = await import("pdf-lib");
    const make = async (vendor: string, lines: string[]) => {
      const doc = await PDFDocument.create();
      const page = doc.addPage([595, 842]);
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const bold = await doc.embedFont(StandardFonts.HelveticaBold);
      let y = 790;
      page.drawText(`Quotation — ${vendor}`, { x: 50, y, size: 18, font: bold });
      y -= 36;
      for (const line of lines) {
        page.drawText(line, { x: 50, y, size: 12, font });
        y -= 22;
      }
      const bytes = await doc.save();
      return new File([bytes], `quote-${vendor.toLowerCase().replace(/\s+/g, "-")}.pdf`, { type: "application/pdf" });
    };
    const samples = await Promise.all([
      make("Acme Supplies", ["Total price: USD 12,400", "Delivery: 30 days", "Payment terms: 50% upfront, 50% on delivery", "Warranty: 12 months", "Valid until: 2026-07-15"]),
      make("Globex Trading", ["Total price: USD 11,900", "Delivery: 45 days", "Payment terms: Net 30", "Warranty: 24 months", "Valid until: 2026-07-31"]),
      make("Initech Ltd", ["Total price: USD 13,200", "Delivery: 21 days", "Payment terms: 100% on delivery", "Warranty: 18 months", "Valid until: 2026-07-10"]),
    ]);
    setBusy(false);
    setDocType("quote");
    await addFiles(samples);
  }, [addFiles]);

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      void addFiles(Array.from(e.dataTransfer.files));
    },
    [addFiles],
  );

  const okDocs = results.filter((r) => r.status === "ok");

  const compare = useCallback(async () => {
    if (okDocs.length < 2) {
      setCompareError(t.needTwo);
      return;
    }
    setComparing(true);
    setCompareError(null);
    setComparison(null);
    setRecommendation(null);
    setLimitHit(null);
    setRecError(null);
    const gate = await checkUsage("compare");
    if (!gate.allowed) {
      setLimitHit(gate.limit);
      setComparing(false);
      return;
    }
    try {
      const auth = await authHeader();
      const res = await fetch("/api/compare-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...auth },
        body: JSON.stringify({
          docType,
          locale,
          ...(customDims ? { dimensions: customDims } : {}),
          documents: okDocs.map((d) => ({ id: d.id, name: d.name, text: d.text })),
        }),
      });
      const data = await res.json();
      if (!data?.ok) {
        setCompareError(data?.message || t.failed);
        return;
      }
      const cmp: Comparison = { docType: data.docType, dimensions: data.dimensions, documents: data.documents };
      setComparison(cmp);
      void markUsage(gate, "compare");
      if (activeTemplate) {
        saveRun({ templateId: activeTemplate.id, templateName: activeTemplate.name, fileNames: okDocs.map((d) => d.name), docType: cmp.docType, status: "ok" });
        setTemplateRuns(loadRunsForTemplate(activeTemplate.id));
      }
      // Auto-recommend on the extracted comparison — the "decide for you" payoff.
      setRecommending(true);
      try {
        const rr = await fetch("/api/compare-recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...auth },
          body: JSON.stringify({ docType: cmp.docType, locale, dimensions: cmp.dimensions, documents: cmp.documents }),
        });
        const rd = await rr.json();
        if (rd?.ok && rd.recommendation) setRecommendation(rd.recommendation);
        else setRecError(r.recError);
      } catch {
        setRecError(r.recError);
      } finally {
        setRecommending(false);
      }
    } catch (e) {
      setCompareError(e instanceof Error ? e.message : t.failed);
    } finally {
      setComparing(false);
    }
  }, [okDocs, docType, locale, t, r, activeTemplate]);

  // Keep ref in sync so the auto-trigger effect always calls the latest closure.
  useEffect(() => { compareRef.current = compare; }, [compare]);

  useEffect(() => {
    if (!trace) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setTrace(null); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [trace]);

  const handleSaveTemplate = () => {
    const name = tplName.trim();
    if (!name || !comparison) return;
    setTplSaving(true);
    const tpl = saveTemplate({ name, docType: comparison.docType, dimensions: comparison.dimensions });
    setTemplates(loadTemplates());
    setActiveTemplate(tpl);
    setShowSaveTpl(false);
    setTplName("");
    setTplSaving(false);
  };

  const handleLoadTemplate = (tpl: FlowTemplate) => {
    setDocType(tpl.docType);
    setCustomDims(tpl.dimensions.length > 0 ? tpl.dimensions : null);
    setEditDims(false);
    setActiveTemplate(tpl);
    setComparison(null);
    setRecommendation(null);
    setRerunReady(true);
    setTemplateRuns(loadRunsForTemplate(tpl.id));
  };

  const handleDeleteTemplate = (id: string) => {
    deleteTemplate(id);
    setTemplates(loadTemplates());
    if (activeTemplate?.id === id) setActiveTemplate(null);
  };

  const badge = (status: DocStatus) =>
    status === "ok"
      ? { label: t.bExtracted, cls: "text-[color:var(--accent)] border-[color:var(--accent)]" }
      : status === "empty"
        ? { label: t.bEmpty, cls: "text-amber-400 border-amber-400/50" }
        : { label: t.bError, cls: "text-red-400 border-red-400/50" };

  const dimLabel = (key: string, fallback: string) => (locale === "zh" ? DIM_ZH[key] ?? fallback : fallback);

  const askQa = async () => {
    const q = qaQ.trim();
    if (!q || okDocs.length === 0) return;
    // Pre-checks mirroring /api/compare-qa so the user gets instant feedback
    // instead of a round-trip rejection.
    if (okDocs.length > 8) {
      setQaErr(locale === "zh" ? "一次最多对 8 份文档提问。" : "Ask across up to 8 documents at a time.");
      return;
    }
    const totalChars = okDocs.reduce((s, d) => s + d.text.length, 0);
    if (totalChars > 60_000) {
      setQaErr(locale === "zh" ? "文档合计文字过长（上限 60,000 字符），请用更少或更短的文档。" : "Combined text is too long (60,000-character limit). Use fewer or shorter documents.");
      return;
    }
    if (q.length > 500) {
      setQaErr(locale === "zh" ? "问题过长（上限 500 字符）。" : "Question is too long (500-character limit).");
      return;
    }
    setQaBusy(true);
    setQaErr(null);
    setQaAns(null);
    try {
      const auth = await authHeader();
      const res = await fetch("/api/compare-qa", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...auth },
        body: JSON.stringify({ question: q, locale, documents: okDocs.map((d) => ({ id: d.id, name: d.name, text: d.text })) }),
      });
      const data = await res.json();
      if (data?.ok && typeof data.answer === "string" && data.answer.trim()) {
        setQaAns({ answer: data.answer, sources: Array.isArray(data.sources) ? data.sources : [] });
      } else if (data?.ok) {
        setQaErr(locale === "zh" ? "未能从这些文档中找到答案。" : "Couldn't find an answer in these documents.");
      } else {
        setQaErr(data?.message || "Failed.");
      }
    } catch (e) {
      setQaErr(e instanceof Error ? e.message : String(e));
    } finally {
      setQaBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-5 py-14 sm:px-6 lg:px-8">
      <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3 py-1 text-xs font-semibold text-[color:var(--muted)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent)]" />
        {t.badge}
      </div>
      <h1 className="text-3xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-4xl">{t.h1}</h1>
      <p className="mt-3 max-w-4xl text-[color:var(--muted)]">{t.intro}</p>

      {templates.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">{t.tplMyTemplates}</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((tpl) => {
              const runs = loadRunsForTemplate(tpl.id);
              const lastRun = runs[0];
              const isActive = activeTemplate?.id === tpl.id;
              const isDragTarget = cardDragTarget === tpl.id;
              return (
                <div
                  key={tpl.id}
                  onDragOver={(e) => { e.preventDefault(); setCardDragTarget(tpl.id); }}
                  onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setCardDragTarget(null); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setCardDragTarget(null);
                    handleLoadTemplate(tpl);
                    void addFiles(Array.from(e.dataTransfer.files));
                  }}
                  className={`relative rounded-[var(--radius-lg)] border p-4 transition ${
                    isDragTarget
                      ? "border-[color:var(--accent)] bg-[color:var(--soft-accent)] scale-[1.02]"
                      : isActive
                      ? "border-[color:var(--accent)] bg-[color:var(--soft-accent)]"
                      : "border-[color:var(--line)] bg-[color:var(--surface)] hover:border-[color:var(--line-strong)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <button
                      type="button"
                      onClick={() => handleLoadTemplate(tpl)}
                      className="text-sm font-semibold text-[color:var(--foreground)] text-left hover:text-[color:var(--accent)] transition"
                    >
                      {tpl.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTemplate(tpl.id)}
                      title={t.tplDelete}
                      className="shrink-0 text-[11px] text-[color:var(--error)] opacity-0 transition hover:opacity-80 group-hover:opacity-60 focus:opacity-100"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="mt-1 text-[11px] text-[color:var(--faint)]">
                    {tpl.docType} · {tpl.dimensions.length} {t.tplDims}
                  </p>
                  {lastRun ? (
                    <p className="mt-0.5 text-[11px] text-[color:var(--faint)]">
                      {t.tplLastRun}: {relativeTime(lastRun.createdAt, locale)} · {t.tplRunFiles(lastRun.fileNames.length)}
                    </p>
                  ) : (
                    <p className="mt-0.5 text-[11px] text-[color:var(--faint)]">{t.tplNoRuns}</p>
                  )}
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => { handleLoadTemplate(tpl); inputRef.current?.click(); }}
                      className="inline-flex h-7 items-center rounded-[var(--radius-sm)] border border-[color:var(--accent)] px-2.5 text-[11px] font-medium text-[color:var(--accent)] transition hover:bg-[color:var(--soft-accent)]"
                    >
                      {t.tplNewFiles}
                    </button>
                    {isActive && (
                      <span className="text-[11px] font-medium text-[color:var(--accent)]">✓</span>
                    )}
                  </div>
                  {isDragTarget && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-[var(--radius-lg)] bg-[color:var(--soft-accent)]/90 text-[13px] font-semibold text-[color:var(--accent)]">
                      {t.tplDropHere}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`mt-8 flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed px-6 py-12 text-center transition ${
          dragOver ? "border-[color:var(--accent)] bg-[color:var(--soft-accent)]" : "border-[color:var(--line)] bg-[color:var(--surface-subtle)]"
        }`}
      >
        <p className="text-sm font-medium text-[color:var(--foreground)]">{t.drop}</p>
        <p className="mt-1 text-xs text-[color:var(--muted)]">{t.dropHint}</p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={() => inputRef.current?.click()} disabled={busy} className="inline-flex h-10 items-center rounded-[var(--radius)] bg-[color:var(--accent)] px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
            {t.choose}
          </button>
          <button type="button" onClick={loadSamples} disabled={busy} className="inline-flex h-10 items-center rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-5 text-sm font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)] disabled:opacity-50">
            {t.samples}
          </button>
        </div>
        <input ref={inputRef} type="file" accept="application/pdf,.pdf" multiple hidden onChange={(e) => { void addFiles(Array.from(e.target.files ?? [])); e.target.value = ""; }} />
      </div>

      {busy && <p className="mt-4 text-sm text-[color:var(--muted)]">{t.extracting}</p>}

      {results.length > 0 && (
        <div className="mt-8 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-[color:var(--foreground)]">{t.docCount(results.length)}</h2>
            <div className="flex items-center gap-2">
              <label className="text-xs text-[color:var(--muted)]">{t.typeLabel}</label>
              <select value={docType} onChange={(e) => setDocType(e.target.value)} className="h-9 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-2 text-sm text-[color:var(--foreground)]">
                {t.docTypes.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
              <button type="button" onClick={compare} disabled={comparing || okDocs.length < 2} className="inline-flex h-9 items-center rounded-[var(--radius)] bg-[color:var(--accent)] px-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
                {comparing ? t.comparing : t.compare}
              </button>
              <button type="button" onClick={() => { setResults([]); setComparison(null); setCompareError(null); setRecommendation(null); setQaAns(null); setQaErr(null); setQaQ(""); setTrace(null); setOcrBusy(new Set()); setCustomDims(null); setEditDims(false); }} className="text-xs font-medium text-[color:var(--muted)] transition hover:text-[color:var(--foreground)]">
                {t.clear}
              </button>
            </div>
          </div>
          {/* Dimensions panel */}
          {!editDims ? (
            <div className="flex flex-wrap items-center gap-1.5">
              {(customDims ?? CLIENT_PRESETS[docType] ?? CLIENT_PRESETS.quote).map((d) => (
                <span key={d.key} className="rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] px-2 py-0.5 text-[11px] text-[color:var(--muted)]">
                  {dimLabel(d.key, d.label)}
                </span>
              ))}
              <button
                type="button"
                onClick={() => {
                  setEditDimsRows([...(customDims ?? CLIENT_PRESETS[docType] ?? CLIENT_PRESETS.quote)]);
                  setEditDims(true);
                }}
                className="rounded-full border border-[color:var(--line)] px-2 py-0.5 text-[11px] font-medium text-[color:var(--muted)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
              >
                {t.tplEditDims}
              </button>
            </div>
          ) : (
            <div className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3">
              <div className="space-y-1.5">
                {editDimsRows.map((row, i) => (
                  <div key={`${row.key}-${i}`} className="flex items-center gap-2">
                    <input
                      value={row.label}
                      onChange={(e) => setEditDimsRows((prev) => prev.map((r, idx) => idx === i ? { ...r, label: e.target.value } : r))}
                      placeholder={t.tplDimLabel}
                      className="h-8 flex-1 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--background)] px-2 text-[13px] text-[color:var(--foreground)] outline-none focus:border-[color:var(--accent)]"
                    />
                    <button
                      type="button"
                      onClick={() => setEditDimsRows((prev) => prev.filter((_, idx) => idx !== i))}
                      className="px-1 text-[11px] text-[color:var(--error)] transition hover:opacity-80"
                    >✕</button>
                  </div>
                ))}
              </div>
              {editDimsRows.length < 12 && (
                <button
                  type="button"
                  onClick={() => setEditDimsRows((prev) => [...prev, { key: `custom_${prev.length + 1}`, label: "" }])}
                  className="mt-2 text-[12px] font-medium text-[color:var(--accent)] transition hover:opacity-80"
                >
                  {t.tplDimAdd}
                </button>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const valid = editDimsRows.filter((r) => r.label.trim()).map((r) => ({ key: r.key.startsWith("custom_") ? labelToKey(r.label) : r.key, label: r.label.trim() }));
                    setCustomDims(valid.length > 0 ? valid : null);
                    setEditDims(false);
                  }}
                  className="rounded-[var(--radius-sm)] bg-[color:var(--accent)] px-3 py-1.5 text-[12px] font-semibold text-white transition hover:opacity-90"
                >
                  {t.tplDimApply}
                </button>
                <button
                  type="button"
                  onClick={() => { setCustomDims(null); setEditDims(false); }}
                  className="rounded-[var(--radius-sm)] border border-[color:var(--line)] px-3 py-1.5 text-[12px] font-medium text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)]"
                >
                  {t.tplDimReset}
                </button>
              </div>
            </div>
          )}

          {results.map((r) => {
            const b = badge(r.status);
            return (
              <div key={r.id} className="rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[color:var(--foreground)]">{r.name}</p>
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${b.cls}`}>{b.label}</span>
                </div>
                <p className="mt-1 text-xs text-[color:var(--muted)]">{t.pages(r.pages)}{t.chars(r.chars)}</p>
                {r.status === "empty" && r.file && (
                  ocrBusy.has(r.id) ? (
                    <p className="mt-2 text-xs font-medium text-[color:var(--accent)]">{t.ocrBusy}</p>
                  ) : (
                    <button type="button" onClick={() => runOcrOn(r.id)} className="mt-2 rounded-[var(--radius-sm)] border border-[color:var(--accent)] px-3 py-1 text-[12px] font-medium text-[color:var(--accent-strong)] transition hover:bg-[color:var(--soft-accent)]">
                      {t.ocrRun}
                    </button>
                  )
                )}
                {r.status === "empty" && !ocrBusy.has(r.id) && r.error && (
                  <p className="mt-1 text-[11px] text-amber-400/80">{r.error}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {compareError && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <p role="alert" className="rounded-[var(--radius)] border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300">{compareError}</p>
          <button type="button" onClick={compare} disabled={comparing || okDocs.length < 2} className="inline-flex h-9 items-center rounded-[var(--radius)] border border-red-400/40 px-4 text-sm font-semibold text-red-300 transition hover:bg-red-400/10 disabled:opacity-50">
            {t.retry}
          </button>
        </div>
      )}

      {limitHit !== null && <UpgradePrompt locale={locale} limit={limitHit} />}

      {okDocs.length >= 1 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-[color:var(--foreground)]">{locale === "zh" ? "跨文档提问" : "Ask across these documents"}</h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">{locale === "zh" ? "用一个问题问遍上传的所有文档，答案带原文出处。" : "Ask one question across every document you uploaded — the answer cites the source."}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              value={qaQ}
              onChange={(e) => setQaQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") askQa(); }}
              placeholder={locale === "zh" ? "例如：哪份报价的交期最短？" : "e.g. Which quote has the shortest delivery time?"}
              className="h-10 min-w-[220px] flex-1 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3 text-sm text-[color:var(--foreground)]"
            />
            <button type="button" onClick={askQa} disabled={qaBusy || !qaQ.trim()} className="h-10 rounded-[var(--radius)] bg-[color:var(--accent)] px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
              {qaBusy ? (locale === "zh" ? "思考中…" : "Thinking…") : (locale === "zh" ? "提问" : "Ask")}
            </button>
          </div>
          {qaErr && <p className="mt-3 rounded-[var(--radius)] border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300">{qaErr}</p>}
          {qaAns && (
            <div className="mt-4 rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4">
              <p className="whitespace-pre-wrap text-sm leading-7 text-[color:var(--foreground)]">{qaAns.answer}</p>
              {qaAns.sources.length > 0 && (
                <div className="mt-3 border-t border-[color:var(--line)] pt-3">
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[color:var(--muted)]">{locale === "zh" ? "出处" : "Sources"}</p>
                  <ul className="space-y-1.5">
                    {qaAns.sources.map((s, i) => (
                      <li key={i} className="text-xs text-[color:var(--muted)]"><span className="font-semibold text-[color:var(--foreground)]">{s.name}:</span> “{s.snippet}”</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {comparison && (recommending || recommendation || recError) && (
        <section className="mt-10">
          <div className="rounded-[var(--radius-lg)] border border-[color:var(--accent)] bg-[color:var(--soft-accent)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--accent)]">{r.title}</p>
            {recommending && !recommendation && !recError ? (
              <p className="mt-2 text-sm text-[color:var(--muted)]">{r.thinking}</p>
            ) : recError ? (
              <p className="mt-2 text-sm text-amber-400/80">{r.recError}</p>
            ) : recommendation ? (
              <>
                {recommendation.winnerId && (
                  <p className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">
                    ✅ {r.recommended}：{resolveDocName(comparison.documents, recommendation.winnerId)}
                  </p>
                )}
                {recommendation.headline && <p className="mt-1 text-sm text-[color:var(--foreground)]">{recommendation.headline}</p>}
                {recommendation.reasons.length > 0 && (
                  <ul className="mt-3 space-y-1 text-sm text-[color:var(--muted)]">
                    {recommendation.reasons.map((why, i) => (
                      <li key={i}>· {why}</li>
                    ))}
                  </ul>
                )}
                {recommendation.perDoc.length > 0 && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {recommendation.perDoc.map((p) => (
                      <div key={p.id} className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-3">
                        <p className="text-sm font-semibold text-[color:var(--foreground)]">
                          {resolveDocName(comparison.documents, p.id)}
                        </p>
                        {p.pros.length > 0 && <p className="mt-1.5 text-[12px] text-[color:var(--accent)]">+ {p.pros.join("；")}</p>}
                        {p.cons.length > 0 && <p className="mt-1 text-[12px] text-amber-400/80">− {p.cons.join("；")}</p>}
                      </div>
                    ))}
                  </div>
                )}
                <p className="mt-4 border-t border-[color:var(--line)] pt-3 text-[11.5px] leading-5 text-[color:var(--muted)]">{r.disclaimer}</p>
              </>
            ) : null}
          </div>
        </section>
      )}

      {comparison && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-[color:var(--foreground)]">{t.comparison}</h2>
          <div className="mt-3 overflow-x-auto rounded-[var(--radius-lg)] border border-[color:var(--line)]">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[color:var(--surface-subtle)]">
                  <th className="border-b border-[color:var(--line)] px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[color:var(--muted)]">{t.dimension}</th>
                  {comparison.documents.map((d) => (
                    <th key={d.id} className="border-b border-l border-[color:var(--line)] px-3 py-2 text-left text-xs font-semibold text-[color:var(--foreground)]">{d.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.dimensions.map((dim) => (
                  <tr key={dim.key} className="align-top">
                    <td className="border-b border-[color:var(--line)] px-3 py-2 font-medium text-[color:var(--muted)]">{dimLabel(dim.key, dim.label)}</td>
                    {comparison.documents.map((d) => {
                      const f = d.fields[dim.key];
                      return (
                        <td key={d.id} className="border-b border-l border-[color:var(--line)] px-3 py-2">
                          {f?.value ? (
                            <>
                              <div className="text-[color:var(--foreground)]">{f.value}</div>
                              {f.source && (
                                <button
                                  type="button"
                                  onClick={() => setTrace({ docId: d.id, docName: d.name, snippet: f.source! })}
                                  title={f.source}
                                  className="mt-0.5 block text-left text-[11px] italic text-[color:var(--faint)] underline decoration-dotted underline-offset-2 transition hover:text-[color:var(--accent)]"
                                >
                                  “{f.source.length > 52 ? `${f.source.slice(0, 52)}…` : f.source}” ↗
                                </button>
                              )}
                            </>
                          ) : (
                            <span className="text-[11px] text-amber-400/80">{t.notRecognized}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-[color:var(--muted)]">{t.tableNote}</p>
          <div className="mt-5">
            {!showSaveTpl ? (
              <button
                type="button"
                onClick={() => { setShowSaveTpl(true); setTplName(""); }}
                className="text-xs font-medium text-[color:var(--accent)] underline underline-offset-2 transition hover:opacity-80"
              >
                {t.tplSave}
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <input
                  autoFocus
                  value={tplName}
                  onChange={(e) => setTplName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSaveTemplate(); if (e.key === "Escape") setShowSaveTpl(false); }}
                  placeholder={t.tplNamePlaceholder}
                  className="h-9 min-w-[200px] rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3 text-sm text-[color:var(--foreground)]"
                />
                <button
                  type="button"
                  onClick={handleSaveTemplate}
                  disabled={tplSaving || !tplName.trim()}
                  className="h-9 rounded-[var(--radius)] bg-[color:var(--accent)] px-4 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {tplSaving ? t.tplSaving : t.tplConfirm}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSaveTpl(false)}
                  className="text-xs text-[color:var(--muted)] transition hover:text-[color:var(--foreground)]"
                >
                  {t.tplCancel}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {comparing && !comparison && (
        <div className="mt-10 space-y-6" aria-busy="true">
          <div className="animate-pulse rounded-[var(--radius-lg)] border border-[color:var(--accent)] bg-[color:var(--soft-accent)] p-5">
            <div className="h-3 w-24 rounded bg-[color:var(--accent)]/20" />
            <div className="mt-3 h-6 w-52 rounded bg-[color:var(--accent)]/20" />
            <div className="mt-3 space-y-2">
              <div className="h-4 w-full rounded bg-[color:var(--accent)]/20" />
              <div className="h-4 w-5/6 rounded bg-[color:var(--accent)]/20" />
              <div className="h-4 w-4/6 rounded bg-[color:var(--accent)]/20" />
            </div>
          </div>
          <div className="animate-pulse overflow-x-auto rounded-[var(--radius-lg)] border border-[color:var(--line)]">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[color:var(--surface-subtle)]">
                  {[0, 1, 2, 3].map((i) => (
                    <th key={i} className="border-b border-[color:var(--line)] px-3 py-2.5">
                      <div className="h-3 w-20 rounded bg-[color:var(--surface)]" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[0, 1, 2, 3, 4].map((i) => (
                  <tr key={i}>
                    {[0, 1, 2, 3].map((j) => (
                      <td key={j} className="border-b border-[color:var(--line)] px-3 py-3">
                        <div className={`h-4 rounded bg-[color:var(--surface-subtle)] ${j === 0 ? "w-24" : "w-full"}`} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!comparison && !comparing && (
        <div className="mt-10 rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--accent)]">{t.comingNext}</p>
          <ul className="mt-2 space-y-1 text-sm text-[color:var(--muted)]">
            {t.next.map((n) => (
              <li key={n}>· {n}</li>
            ))}
          </ul>
        </div>
      )}

      {trace &&
        (() => {
          const docText = results.find((d) => d.id === trace.docId)?.text ?? "";
          const loc = locateSnippet(docText, trace.snippet);
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setTrace(null)}>
              <div role="dialog" aria-modal="true" aria-labelledby="trace-dialog-title" className="max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-[color:var(--line)] px-5 py-3">
                  <p id="trace-dialog-title" className="text-sm font-semibold text-[color:var(--foreground)]">
                    {tr.source} · {trace.docName}
                  </p>
                  <button type="button" onClick={() => setTrace(null)} autoFocus aria-label="Close" className="text-[color:var(--muted)] transition hover:text-[color:var(--foreground)]">
                    ✕
                  </button>
                </div>
                <div className="max-h-[60vh] overflow-y-auto px-5 py-4 text-[13px] leading-6 text-[color:var(--muted)]">
                  {loc.found ? (
                    <p>
                      {loc.before}
                      <mark className="rounded bg-[color:var(--accent)] px-1 text-white">{loc.match}</mark>
                      {loc.after}
                    </p>
                  ) : (
                    <>
                      <p className="mb-2 text-[11px] text-amber-400/80">{tr.notLocated}</p>
                      <p>{docText}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      <ToolFaq tool="compare" locale={locale} />
    </main>
  );
}
