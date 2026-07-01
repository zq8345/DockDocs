"use client";

import { useState, useCallback } from "react";
import { useWorkspaceNav } from "@/components/WorkspaceNavContext";
import { useLegalSession, type LegalRisk, type LegalRequirement, type LegalSession } from "@/lib/legal-session";
import { checkUsage, markUsage } from "@/lib/usage-gate";
import { authHeader } from "@/lib/supabase";
import { trackToolRun } from "@/lib/track";
import type { RuntimeLocale } from "@/lib/copy";

type L = "en" | "zh" | "es" | "pt" | "fr" | "ja" | "de" | "ko" | "zh-Hant";

const COPY: Record<L, {
  eyebrow: string;
  h1: string;
  subtitle: string;
  anchors: { title: string; body: string }[];
  cards: { title: string; desc: string; slug: string }[];
  privacy: string;
  uploadTitle: string;
  uploadHint: string;
  extracting: string;
  removeFile: string;
  runAll: string;
  running: string;
  exportReport: string;
  errRead: string;
  errExtract: string;
}> = {
  en: {
    eyebrow: "Professional · Legal",
    h1: "Legal Document Workspace",
    subtitle: "Read contracts, leases, and bid documents — flag risk clauses, missing protections, and compliance requirements, and see what changed between versions.",
    anchors: [
      { title: "Depth", body: "3 specialized legal tools covering contract review, lease red flags, and government bid compliance." },
      { title: "Traceable", body: "Every risk is cited to the source clause — click to verify. Not AI guessing: grounded when it can locate the text." },
      { title: "In perspective", body: "Not a lawyer replacement — but helps you know what to ask before you sign." },
    ],
    cards: [
      { title: "Contract Risk Review", desc: "Flag risky clauses and missing protections in contracts, NDAs, and service agreements.", slug: "/contract-risk" },
      { title: "Lease Red Flag Scan", desc: "Identify unfair terms, hidden fees, and missing tenant protections in lease agreements.", slug: "/lease-redflag" },
      { title: "Gov Bid Compliance Matrix", desc: "Check whether your proposal meets every requirement in a government tender or RFP.", slug: "/govbid-matrix" },
    ],
    privacy: "File is read locally in your browser; only extracted text is sent for analysis.",
    uploadTitle: "Upload your legal document (PDF)",
    uploadHint: "Drop here or click · runs locally in your browser",
    extracting: "Extracting…",
    removeFile: "Remove file",
    runAll: "Run All",
    running: "Running…",
    exportReport: "Export Report",
    errRead: "Could not read PDF.",
    errExtract: "Could not extract text from this PDF.",
  },
  ko: {
    eyebrow: "전문 · 법률",
    h1: "법률 문서 작업 공간",
    subtitle: "계약서, 임대차 계약서, 입찰 문서를 읽고 — 위험 조항, 누락된 보호 장치, 규정 준수 요건을 표시하고 버전 간 변경 사항을 확인하세요.",
    anchors: [
      { title: "깊이", body: "계약 검토, 임대차 위험 신호, 정부 입찰 규정 준수를 다루는 3가지 전문 법률 도구." },
      { title: "추적 가능", body: "모든 위험은 출처 조항에 연결됩니다 — 클릭해 확인하세요. AI의 추측이 아니라, 텍스트를 찾을 수 있을 때 근거를 제시합니다." },
      { title: "균형 잡힌 시각", body: "변호사를 대체하지는 않지만, 서명하기 전에 무엇을 물어야 할지 알도록 돕습니다." },
    ],
    cards: [
      { title: "계약 위험 검토", desc: "계약서, NDA, 서비스 계약서에서 위험한 조항과 누락된 보호 장치를 표시합니다.", slug: "/contract-risk" },
      { title: "임대차 위험 신호 스캔", desc: "임대차 계약서에서 불공정한 조건, 숨은 수수료, 누락된 세입자 보호를 찾아냅니다.", slug: "/lease-redflag" },
      { title: "정부 입찰 규정 준수 매트릭스", desc: "제안서가 정부 입찰 또는 RFP의 모든 요건을 충족하는지 확인합니다.", slug: "/govbid-matrix" },
    ],
    privacy: "파일은 브라우저에서 로컬로 읽으며, 추출된 텍스트만 분석을 위해 전송됩니다.",
    uploadTitle: "법률 문서 업로드 (PDF)",
    uploadHint: "드래그하거나 클릭 · 브라우저에서 처리",
    extracting: "추출 중…",
    removeFile: "파일 제거",
    runAll: "전체 분석",
    running: "분석 중…",
    exportReport: "보고서 내보내기",
    errRead: "PDF를 읽을 수 없습니다.",
    errExtract: "이 PDF에서 텍스트를 추출할 수 없습니다.",
  },
  zh: {
    eyebrow: "专业领域 · 法律",
    h1: "法律文档工作区",
    subtitle: "阅读合同、租约和招标文件 — 标出风险条款、缺失保护、合规要求，以及两个版本间发生了哪些变化。",
    anchors: [
      { title: "深度", body: "3 个法律专业工具，覆盖合同审查、租约红旗、政府标书合规。" },
      { title: "可溯源", body: "每条风险都标明原文出处，可点击核对。能定位时给出原文位置，不是 AI 泛泛猜测。" },
      { title: "定位清晰", body: "不替代律师 — 但帮你在签字前知道该问什么。" },
    ],
    cards: [
      { title: "合同风险审查", desc: "标出合同、NDA 和服务协议中的风险条款和缺失保护。", slug: "/contract-risk" },
      { title: "租约风险扫描", desc: "识别租赁协议中的不公平条款、隐藏费用和缺失的承租人保护。", slug: "/lease-redflag" },
      { title: "政府标书合规矩阵", desc: "核查你的方案是否满足政府招标或 RFP 的每一项要求。", slug: "/govbid-matrix" },
    ],
    privacy: "文件在浏览器本地读取，仅提取的文字发去分析。",
    uploadTitle: "上传法律文档（PDF）",
    uploadHint: "拖拽或点击上传 · 文件在浏览器本地读取",
    extracting: "正在提取…",
    removeFile: "移除文件",
    runAll: "一键运行",
    running: "运行中…",
    exportReport: "导出报告",
    errRead: "无法读取 PDF 文件。",
    errExtract: "无法从此 PDF 提取文字。",
  },
  es: {
    eyebrow: "Profesional · Legal",
    h1: "Espacio de trabajo legal",
    subtitle: "Analiza contratos, arrendamientos y documentos de licitación — identifica cláusulas de riesgo, protecciones faltantes y requisitos de cumplimiento.",
    anchors: [
      { title: "Profundidad", body: "3 herramientas legales especializadas: revisión de contratos, señales de alerta en arrendamientos y cumplimiento en licitaciones." },
      { title: "Trazable", body: "Cada riesgo cita el texto fuente — haz clic para verificar. Anclado cuando puede localizar el texto." },
      { title: "En perspectiva", body: "No reemplaza a un abogado — pero te ayuda a saber qué preguntar antes de firmar." },
    ],
    cards: [
      { title: "Revisión de riesgos contractuales", desc: "Identifica cláusulas riesgosas y protecciones faltantes en contratos y acuerdos.", slug: "/contract-risk" },
      { title: "Escaneo de señales en arrendamiento", desc: "Detecta términos injustos, cargos ocultos y protecciones faltantes en contratos de arrendamiento.", slug: "/lease-redflag" },
      { title: "Matriz de cumplimiento de licitación", desc: "Verifica si tu propuesta cumple todos los requisitos de una licitación gubernamental.", slug: "/govbid-matrix" },
    ],
    privacy: "El archivo se lee localmente en tu navegador; solo se envía el texto extraído para el análisis.",
    uploadTitle: "Sube tu documento legal (PDF)",
    uploadHint: "Arrastra o haz clic · se procesa en tu navegador",
    extracting: "Extrayendo…",
    removeFile: "Quitar archivo",
    runAll: "Analizar todo",
    running: "Analizando…",
    exportReport: "Exportar informe",
    errRead: "No se pudo leer el PDF.",
    errExtract: "No se pudo extraer texto de este PDF.",
  },
  pt: {
    eyebrow: "Profissional · Jurídico",
    h1: "Espaço de trabalho jurídico",
    subtitle: "Leia contratos, arrendamentos e documentos de licitação — identifique cláusulas de risco, proteções ausentes e requisitos de conformidade.",
    anchors: [
      { title: "Profundidade", body: "3 ferramentas jurídicas especializadas: revisão de contratos, alertas em arrendamentos e conformidade em licitações." },
      { title: "Rastreável", body: "Cada risco cita o texto fonte — clique para verificar. Ancorado quando consegue localizar o trecho." },
      { title: "Em perspectiva", body: "Não substitui um advogado — mas ajuda você a saber o que perguntar antes de assinar." },
    ],
    cards: [
      { title: "Revisão de riscos contratuais", desc: "Sinalize cláusulas arriscadas e proteções ausentes em contratos e acordos.", slug: "/contract-risk" },
      { title: "Varredura de alertas em arrendamento", desc: "Identifique termos injustos, taxas ocultas e proteções ausentes em contratos de locação.", slug: "/lease-redflag" },
      { title: "Matriz de conformidade em licitação", desc: "Verifique se sua proposta atende a todos os requisitos de uma licitação governamental.", slug: "/govbid-matrix" },
    ],
    privacy: "O arquivo é lido localmente no seu navegador; apenas o texto extraído é enviado para análise.",
    uploadTitle: "Envie seu documento jurídico (PDF)",
    uploadHint: "Arraste ou clique · processado no seu navegador",
    extracting: "Extraindo…",
    removeFile: "Remover arquivo",
    runAll: "Analisar tudo",
    running: "Analisando…",
    exportReport: "Exportar relatório",
    errRead: "Não foi possível ler o PDF.",
    errExtract: "Não foi possível extrair texto deste PDF.",
  },
  fr: {
    eyebrow: "Professionnel · Juridique",
    h1: "Espace de travail juridique",
    subtitle: "Lisez contrats, baux et dossiers d'appel d'offres — signalez les clauses à risque, les protections manquantes et les exigences de conformité.",
    anchors: [
      { title: "Profondeur", body: "3 outils juridiques spécialisés : révision de contrats, signaux d'alerte dans les baux et conformité aux appels d'offres." },
      { title: "Traçable", body: "Chaque risque cite le texte source — cliquez pour vérifier. Ancré quand le texte peut être localisé." },
      { title: "En perspective", body: "Ne remplace pas un avocat — mais vous aide à savoir quoi demander avant de signer." },
    ],
    cards: [
      { title: "Révision des risques contractuels", desc: "Signalez les clauses risquées et les protections manquantes dans les contrats et accords.", slug: "/contract-risk" },
      { title: "Scan des signaux d'alerte de bail", desc: "Identifiez les termes injustes, les frais cachés et les protections manquantes dans les baux.", slug: "/lease-redflag" },
      { title: "Matrice de conformité des appels d'offres", desc: "Vérifiez si votre proposition répond à tous les critères d'un appel d'offres public.", slug: "/govbid-matrix" },
    ],
    privacy: "Le fichier est lu localement dans votre navigateur ; seul le texte extrait est envoyé pour analyse.",
    uploadTitle: "Chargez votre document juridique (PDF)",
    uploadHint: "Glissez ou cliquez · traité dans votre navigateur",
    extracting: "Extraction…",
    removeFile: "Supprimer le fichier",
    runAll: "Tout analyser",
    running: "En cours…",
    exportReport: "Exporter le rapport",
    errRead: "Impossible de lire le PDF.",
    errExtract: "Impossible d'extraire le texte de ce PDF.",
  },
  ja: {
    eyebrow: "専門領域・法務",
    h1: "法務ドキュメント ワークスペース",
    subtitle: "契約書・リース・入札書類を読み込み — リスク条項、欠如している保護、コンプライアンス要件を抽出し、バージョン間の変更点を把握します。",
    anchors: [
      { title: "深さ", body: "契約レビュー、リースの赤旗、政府入札のコンプライアンス — 3 つの法務専門ツール。" },
      { title: "ソース参照", body: "各リスクは原文箇所を引用 — クリックで確認できます。特定できたときに根拠を提示します。" },
      { title: "位置づけ", body: "弁護士の代替ではありません — ただし、サイン前に何を確認すべきか把握する助けになります。" },
    ],
    cards: [
      { title: "契約リスク審査", desc: "契約書・NDA・業務委託契約のリスク条項と欠如している保護を抽出します。", slug: "/contract-risk" },
      { title: "リース契約リスクスキャン", desc: "賃貸契約の不公平な条件、隠れた費用、欠如している借主保護を特定します。", slug: "/lease-redflag" },
      { title: "入札コンプライアンスマトリクス", desc: "提案が政府入札・RFP のすべての要件を満たしているか確認します。", slug: "/govbid-matrix" },
    ],
    privacy: "ファイルはブラウザ内でローカルに読み込まれます。分析に送信されるのは抽出されたテキストのみです。",
    uploadTitle: "法律文書をアップロード（PDF）",
    uploadHint: "ドラッグまたはクリック · ブラウザ内で処理",
    extracting: "抽出中…",
    removeFile: "ファイルを削除",
    runAll: "一括分析",
    running: "分析中…",
    exportReport: "レポートをエクスポート",
    errRead: "PDF を読み込めませんでした。",
    errExtract: "この PDF からテキストを抽出できませんでした。",
  },
  de: {
    eyebrow: "Professionell · Recht",
    h1: "Rechts-Dokumenten-Arbeitsbereich",
    subtitle: "Lesen Sie Verträge, Mietverträge und Ausschreibungsunterlagen — markieren Sie Risikoklauseln, fehlende Schutzbestimmungen und Compliance-Anforderungen.",
    anchors: [
      { title: "Tiefe", body: "3 spezialisierte Rechts-Tools: Vertragsüberprüfung, Mietvertrag-Warnzeichen und Ausschreibungs-Compliance." },
      { title: "Nachvollziehbar", body: "Jedes Risiko wird mit dem Quelltext belegt — klicken Sie zur Überprüfung. Mit Quellenangabe, wenn der Text lokalisiert werden kann." },
      { title: "Einordnung", body: "Kein Ersatz für einen Anwalt — aber hilft Ihnen zu wissen, was Sie vor der Unterzeichnung fragen sollten." },
    ],
    cards: [
      { title: "Vertragsrisiko-Prüfung", desc: "Markieren Sie Risikoklauseln und fehlende Schutzmaßnahmen in Verträgen und Vereinbarungen.", slug: "/contract-risk" },
      { title: "Mietvertrag-Risikoscan", desc: "Erkennen Sie unfaire Konditionen, versteckte Gebühren und fehlende Mieterrechte in Mietverträgen.", slug: "/lease-redflag" },
      { title: "Ausschreibungs-Compliance-Matrix", desc: "Prüfen Sie, ob Ihr Angebot alle Anforderungen einer öffentlichen Ausschreibung erfüllt.", slug: "/govbid-matrix" },
    ],
    privacy: "Die Datei wird lokal in Ihrem Browser verarbeitet; nur der extrahierte Text wird zur Analyse gesendet.",
    uploadTitle: "Rechtsdokument hochladen (PDF)",
    uploadHint: "Ziehen oder klicken · wird im Browser verarbeitet",
    extracting: "Extrahiere…",
    removeFile: "Datei entfernen",
    runAll: "Alles analysieren",
    running: "Läuft…",
    exportReport: "Bericht exportieren",
    errRead: "PDF konnte nicht gelesen werden.",
    errExtract: "Text konnte nicht aus diesem PDF extrahiert werden.",
  },
  "zh-Hant": {
    eyebrow: "專業領域・法律",
    h1: "法律文件工作區",
    subtitle: "閱讀合約、租約和招標文件 — 標出風險條款、缺失保護、合規要求，以及兩個版本間的變更。",
    anchors: [
      { title: "深度", body: "3 個法律專業工具：合約審查、租約警訊、政府標案合規。" },
      { title: "可溯源", body: "每條風險均標明原文出處，可點擊核對。能定位時提供原文位置，不是 AI 的泛泛猜測。" },
      { title: "定位清晰", body: "不取代律師 — 但幫助你在簽名前知道應該問什麼。" },
    ],
    cards: [
      { title: "合約風險審查", desc: "標出合約、NDA 和服務協議中的風險條款與缺失保護。", slug: "/contract-risk" },
      { title: "租約風險掃描", desc: "識別租賃協議中的不公平條款、隱藏費用和缺失的承租人保護。", slug: "/lease-redflag" },
      { title: "政府標案合規矩陣", desc: "核查你的提案是否符合政府招標或 RFP 的每一項要求。", slug: "/govbid-matrix" },
    ],
    privacy: "文件在瀏覽器本地讀取，僅提取的文字發送分析。",
    uploadTitle: "上傳法律文件（PDF）",
    uploadHint: "拖曳或點擊上傳 · 文件在瀏覽器本地讀取",
    extracting: "正在提取…",
    removeFile: "移除文件",
    runAll: "一鍵執行",
    running: "執行中…",
    exportReport: "匯出報告",
    errRead: "無法讀取 PDF 文件。",
    errExtract: "無法從此 PDF 提取文字。",
  },
};

const ANCHOR_ICONS = [
  // Depth — stack icon
  <svg key="depth" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0 text-[color:var(--accent)]">
    <path d="M12 2 2 7l10 5 10-5-10-5Z" />
    <path d="M2 12l10 5 10-5" />
    <path d="M2 17l10 5 10-5" />
  </svg>,
  // Traceable — link/chain icon
  <svg key="trace" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0 text-[color:var(--accent)]">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>,
  // Perspective — scale/balance icon
  <svg key="persp" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0 text-[color:var(--accent)]">
    <path d="M12 3v18" />
    <path d="M3 9l9-6 9 6" />
    <path d="M3 9c0 3 4 5 9 5s9-2 9-5" />
  </svg>,
];

function getLang(locale: RuntimeLocale): L {
  if (locale === "zh-Hant") return "zh-Hant";
  const l = locale as L;
  return l in COPY ? l : "en";
}

const LEVEL_ORDER: Record<"high" | "medium" | "low", number> = { high: 0, medium: 1, low: 2 };
const MAX_GOVBID_CHARS = 60_000;
type RunKey = "contractRisk" | "leaseRedflag" | "govbidMatrix";
type RunStatus = "idle" | "running" | "done" | "error";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const SAFE_LEVELS = new Set(["high", "medium", "low"]);
function safeLevel(v: string): "high" | "medium" | "low" {
  return SAFE_LEVELS.has(v) ? (v as "high" | "medium" | "low") : "low";
}

const SAFE_REQ_TYPES = new Set(["mandatory", "advisory"]);
function safeReqType(v: string): "mandatory" | "advisory" {
  return SAFE_REQ_TYPES.has(v) ? (v as "mandatory" | "advisory") : "advisory";
}

function StatusIcon({ status }: { status: RunStatus }) {
  if (status === "done") return <span className="text-[12px] font-semibold text-emerald-500">✓</span>;
  if (status === "running") return <span className="animate-pulse text-[12px] text-[color:var(--muted)]">⏳</span>;
  if (status === "error") return <span className="text-[12px] text-red-500">⊘</span>;
  return <span className="text-[12px] text-[color:var(--faint)]">–</span>;
}

function buildMergedReport(session: LegalSession, cardTitles: [string, string, string]): string {
  const { results, fileName } = session;
  const riskHtml = (risks: LegalRisk[]) =>
    risks.map(r => { const sl = safeLevel(r.level); return `<div class="rc ${sl}"><div class="rh"><span class="lb ${sl}">${sl.toUpperCase()}</span><strong>${esc(r.type)}</strong></div>${r.quote ? `<blockquote>${esc(r.quote)}</blockquote>` : ""}<p>${esc(r.why)}</p><p class="sg">${esc(r.suggestion)}</p></div>`; }).join("");
  const reqHtml = (reqs: LegalRequirement[]) =>
    `<table><thead><tr><th>#</th><th>Section</th><th>Requirement</th><th>Type</th></tr></thead><tbody>${reqs.map(r => { const st = safeReqType(r.type); return `<tr><td>${esc(r.id)}</td><td>${esc(r.section)}</td><td>${esc(r.requirement)}${r.quote ? `<br><em>"${esc(r.quote)}"</em>` : ""}</td><td class="${st}">${esc(r.type)}</td></tr>`; }).join("")}</tbody></table>`;
  const parts: string[] = [];
  if (results.contractRisk?.length) parts.push(`<h2>${esc(cardTitles[0])}</h2>${riskHtml(results.contractRisk)}`);
  if (results.leaseRedflag?.length) parts.push(`<h2>${esc(cardTitles[1])}</h2>${riskHtml(results.leaseRedflag)}`);
  if (results.govbidMatrix?.length) parts.push(`<h2>${esc(cardTitles[2])}</h2>${reqHtml(results.govbidMatrix)}`);
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Legal Analysis — ${esc(fileName)}</title><style>body{font-family:system-ui,sans-serif;max-width:800px;margin:2rem auto;padding:0 1rem;color:#1a1a1a}h1{font-size:1.4rem;margin-bottom:.25rem}.meta{color:#666;font-size:.85rem;margin-bottom:2rem}h2{font-size:1.1rem;border-bottom:1px solid #e0e0e0;padding-bottom:.4rem;margin:2rem 0 1rem}.rc{border:1px solid #e0e0e0;border-radius:6px;padding:12px 14px;margin-bottom:10px}.rc.high{border-left:3px solid #dc2626}.rc.medium{border-left:3px solid #ea580c}.rc.low{border-left:3px solid #ca8a04}.rh{display:flex;align-items:center;gap:8px;margin-bottom:6px}.lb{font-size:10px;font-weight:700;padding:2px 6px;border-radius:3px}.lb.high{background:#fee2e2;color:#dc2626}.lb.medium{background:#ffedd5;color:#ea580c}.lb.low{background:#fef9c3;color:#ca8a04}blockquote{font-style:italic;color:#555;border-left:3px solid #d4d4d4;margin:8px 0;padding-left:10px}.sg{font-size:.85rem;color:#4b5563;margin-top:6px}table{width:100%;border-collapse:collapse;font-size:.85rem}th,td{border:1px solid #e0e0e0;padding:6px 8px;text-align:left;vertical-align:top}th{background:#f5f5f5;font-weight:600}.mandatory{color:#dc2626;font-weight:500}.advisory{color:#ca8a04}@media print{body{margin:0}}</style></head><body><h1>Legal Analysis Report</h1><p class="meta">Document: ${esc(fileName)} · DockDocs Legal Workspace</p>${parts.join("")}</body></html>`;
}

export function LegalWorkspaceHub({ locale = "en" }: { locale?: RuntimeLocale }) {
  const nav = useWorkspaceNav();
  const legalCtx = useLegalSession();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [runStatus, setRunStatus] = useState<Record<RunKey, RunStatus>>({
    contractRisk: "idle", leaseRedflag: "idle", govbidMatrix: "idle",
  });
  const c = COPY[getLang(locale)];
  const session = legalCtx?.session;
  const hasFile = !!session?.extractedText;

  function getStatus(key: RunKey): RunStatus {
    if (session?.results[key]) return "done";
    return runStatus[key];
  }

  const onFile = useCallback(async (file: File) => {
    if (!file || (!file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".pdf"))) return;
    setUploading(true);
    setUploadError(null);
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
      const THUMB_PAGES = Math.min(doc.numPages, 20);
      const thumbnails: string[] = [];
      let text = "";
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        if (i <= THUMB_PAGES) {
          const vp = page.getViewport({ scale: 0.35 });
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(vp.width); canvas.height = Math.round(vp.height);
          const ctx2d = canvas.getContext("2d");
          if (ctx2d) await page.render({ canvas, canvasContext: ctx2d, viewport: vp }).promise;
          thumbnails.push(canvas.toDataURL("image/jpeg", 0.7));
        }
        const content = await page.getTextContent();
        text += content.items.map((it) => ("str" in it ? (it as { str: string }).str : "")).join(" ") + "\n\n";
      }
      const trimmed = text.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
      try { doc.destroy(); } catch { /* ignore */ }
      if (!trimmed) { setUploadError(c.errExtract); setUploading(false); return; }
      legalCtx?.setSessionFile(file, trimmed, thumbnails, doc.numPages);
      setRunStatus({ contractRisk: "idle", leaseRedflag: "idle", govbidMatrix: "idle" });
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : c.errRead);
    }
    setUploading(false);
  }, [legalCtx]);

  const runAll = useCallback(async () => {
    const text = session?.extractedText;
    if (!text) return;
    setRunStatus({ contractRisk: "running", leaseRedflag: "running", govbidMatrix: "running" });
    await Promise.all([
      (async () => {
        try {
          const gate = await checkUsage("contractAnalyzer");
          if (!gate.allowed) { setRunStatus(p => ({ ...p, contractRisk: "error" })); return; }
          const auth = await authHeader();
          const res = await fetch("/api/contract-risk", { method: "POST", headers: { "Content-Type": "application/json", ...auth }, body: JSON.stringify({ text, locale }) });
          const data = await res.json().catch(() => ({}));
          if (data?.ok && Array.isArray(data.risks)) {
            const sorted = (data.risks as LegalRisk[]).slice().sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]);
            legalCtx?.setResult("contractRisk", sorted);
            await markUsage(gate, "contractAnalyzer");
            trackToolRun("contract-risk");
          } else { setRunStatus(p => ({ ...p, contractRisk: "error" })); }
        } catch { setRunStatus(p => ({ ...p, contractRisk: "error" })); }
      })(),
      (async () => {
        try {
          const gate = await checkUsage("contractAnalyzer");
          if (!gate.allowed) { setRunStatus(p => ({ ...p, leaseRedflag: "error" })); return; }
          const auth = await authHeader();
          const res = await fetch("/api/lease-redflag", { method: "POST", headers: { "Content-Type": "application/json", ...auth }, body: JSON.stringify({ text, locale }) });
          const data = await res.json().catch(() => ({}));
          if (data?.ok && Array.isArray(data.risks)) {
            const sorted = (data.risks as LegalRisk[]).slice().sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]);
            legalCtx?.setResult("leaseRedflag", sorted);
            await markUsage(gate, "contractAnalyzer");
            trackToolRun("lease-redflag");
          } else { setRunStatus(p => ({ ...p, leaseRedflag: "error" })); }
        } catch { setRunStatus(p => ({ ...p, leaseRedflag: "error" })); }
      })(),
      (async () => {
        try {
          const gate = await checkUsage("contractAnalyzer");
          if (!gate.allowed) { setRunStatus(p => ({ ...p, govbidMatrix: "error" })); return; }
          const auth = await authHeader();
          const res = await fetch("/api/govbid-matrix", { method: "POST", headers: { "Content-Type": "application/json", ...auth }, body: JSON.stringify({ text: text.slice(0, MAX_GOVBID_CHARS), locale }) });
          const data = await res.json().catch(() => ({}));
          if (data?.ok) {
            const reqs: LegalRequirement[] = data.requirements ?? [];
            legalCtx?.setResult("govbidMatrix", reqs);
            await markUsage(gate, "contractAnalyzer");
            trackToolRun("govbid-matrix");
          } else { setRunStatus(p => ({ ...p, govbidMatrix: "error" })); }
        } catch { setRunStatus(p => ({ ...p, govbidMatrix: "error" })); }
      })(),
    ]);
  }, [session?.extractedText, locale, legalCtx]);

  const exportReport = useCallback(() => {
    if (!session) return;
    const titles: [string, string, string] = [c.cards[0].title, c.cards[1].title, c.cards[2].title];
    const html = buildMergedReport(session, titles);
    const win = window.open("", "_blank", "noopener,noreferrer");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.print();
  }, [session, c]);

  const hasResults = !!(session?.results.contractRisk || session?.results.leaseRedflag || session?.results.govbidMatrix);
  const anyRunning = (["contractRisk", "leaseRedflag", "govbidMatrix"] as RunKey[]).some(k => runStatus[k] === "running");

  return (
    <div className="mx-auto w-full max-w-2xl px-8 py-10">
      {/* Eyebrow + heading */}
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--faint)]">
        {c.eyebrow}
      </p>
      <h1 className="mb-3 text-[22px] font-[400] leading-[1.3] text-[color:var(--foreground)]">
        {c.h1}
      </h1>
      <p className="mb-8 text-[14px] leading-[1.65] text-[color:var(--muted)]">
        {c.subtitle}
      </p>

      {/* Upload / session panel */}
      {!hasFile ? (
        <div className="mb-8">
          <label
            className="flex flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] border-2 border-dashed border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-6 py-10 cursor-pointer hover:border-[color:var(--accent)] transition-colors"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) void onFile(f); }}
          >
            <input type="file" accept=".pdf,application/pdf" className="sr-only"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) void onFile(f); e.target.value = ""; }} />
            {uploading ? (
              <span className="animate-pulse text-[13px] text-[color:var(--muted)]">{c.extracting}</span>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-[color:var(--muted)]">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="12" x2="12" y2="18" /><line x1="9" y1="15" x2="15" y2="15" />
                </svg>
                <p className="text-[13px] font-medium text-[color:var(--foreground)]">{c.uploadTitle}</p>
                <p className="text-[12px] text-[color:var(--muted)]">{c.uploadHint}</p>
              </>
            )}
          </label>
          {uploadError && <p className="mt-2 text-[12px] text-red-500">{uploadError}</p>}
        </div>
      ) : (
        <div className="mb-8 rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-5">
          {/* File info row */}
          <div className="mb-4 flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0 text-[color:var(--accent)]">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
            </svg>
            <span className="flex-1 truncate text-[13px] font-medium text-[color:var(--foreground)]">{session.fileName}</span>
            <span className="text-[11.5px] text-[color:var(--muted)]">{session.pageCount}p</span>
            <button type="button" aria-label={c.removeFile}
              onClick={() => { legalCtx?.clearSession(); setRunStatus({ contractRisk: "idle", leaseRedflag: "idle", govbidMatrix: "idle" }); }}
              className="ml-1 text-[11.5px] text-[color:var(--muted)] hover:text-[color:var(--foreground)] transition-colors">✕</button>
          </div>
          {/* Per-tool status */}
          <div className="mb-4 flex flex-col gap-1.5">
            {(["contractRisk", "leaseRedflag", "govbidMatrix"] as RunKey[]).map((key, i) => (
              <div key={key} className="flex items-center gap-2">
                <StatusIcon status={getStatus(key)} />
                <span className="text-[12.5px] text-[color:var(--foreground)]">{c.cards[i].title}</span>
              </div>
            ))}
          </div>
          {/* Actions */}
          <div className="flex items-center gap-2.5">
            <button type="button" disabled={anyRunning} onClick={() => void runAll()}
              className="rounded-[var(--radius)] bg-[color:var(--accent)] px-3.5 py-1.5 text-[12.5px] font-medium text-[color:var(--on-accent)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
              {anyRunning ? c.running : c.runAll}
            </button>
            {hasResults && (
              <button type="button" onClick={exportReport}
                className="flex items-center gap-1.5 rounded-[var(--radius)] border border-[color:var(--line)] px-3.5 py-1.5 text-[12.5px] font-medium text-[color:var(--foreground)] transition hover:bg-[color:var(--surface)]">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                  <path d="M8 1v10M3 7l5 5 5-5M1 13h14" />
                </svg>
                {c.exportReport}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Value anchors */}
      <div className="mb-8 flex flex-col gap-4 border border-[color:var(--line)] rounded-[var(--radius)] p-5">
        {c.anchors.map((anchor, i) => (
          <div key={i} className="flex items-start gap-3">
            {ANCHOR_ICONS[i]}
            <div>
              <p className="text-[13px] font-medium text-[color:var(--foreground)]">{anchor.title}</p>
              <p className="mt-0.5 text-[12.5px] leading-[1.55] text-[color:var(--muted)]">{anchor.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tool cards with status badges */}
      <div className="mb-8 flex flex-col gap-2.5">
        {c.cards.map((card) => {
          const key = card.slug === "/contract-risk" ? "contractRisk" : card.slug === "/lease-redflag" ? "leaseRedflag" : "govbidMatrix" as RunKey;
          const status = getStatus(key);
          return (
            <button key={card.slug} type="button" onClick={() => nav?.(card.slug)}
              className="group flex w-full items-start gap-4 rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-3.5 text-left transition hover:border-[color:var(--line-strong)] hover:bg-[color:var(--surface-subtle)]">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-medium text-[color:var(--foreground)] group-hover:text-[color:var(--accent)] transition-colors">{card.title}</p>
                  {status === "done" && <span className="text-[11px] font-semibold text-emerald-500">✓</span>}
                </div>
                <p className="mt-0.5 text-[12px] leading-[1.5] text-[color:var(--muted)]">{card.desc}</p>
              </div>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--faint)] transition group-hover:text-[color:var(--accent)] group-hover:translate-x-0.5">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </button>
          );
        })}
      </div>

      {/* Privacy note */}
      <p className="text-center text-[11.5px] leading-[1.55] text-[color:var(--muted)]">
        {c.privacy}
      </p>
    </div>
  );
}
