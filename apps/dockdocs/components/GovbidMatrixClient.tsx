"use client";

import { trackToolRun } from "@/lib/track";
import { ToolFaq } from "@/components/ToolFaq";
import { ToolSections, type ToolSectionsContent } from "@/components/ToolSections";
import { UploadDropzone } from "@/components/UploadDropzone";
import { encryptedPdfMessage } from "@/lib/pdf-errors";
import { checkUsage, markUsage } from "@/lib/usage-gate";
import { UpgradePrompt } from "@/components/ui/UpgradePrompt";
import { authHeader } from "@/lib/supabase";
import { deepHant, toHant } from "@/lib/zh-hant";
import { TrialCta } from "@/components/TrialCta";
import type { RouteLocale, AuthoredLocale, AuthoredCopy } from "@/lib/i18n";
import { LAYOUT } from "@/lib/layout-constants";

import { useCallback, useMemo, useState } from "react";

type Locale = RouteLocale;
type RequirementType = "mandatory" | "advisory";
type Requirement = {
  id: string;
  section: string;
  requirement: string;
  quote: string | null;
  type: RequirementType;
};

const MAX_CHARS = 60_000;

const STR_EN = {
  title: "Government Bid Compliance Matrix",
  eyebrow: "PRO · Single-doc AI",
  subtitle: "Upload an RFP or solicitation — get every 'shall/must' requirement extracted into a numbered compliance matrix with section references.",
  upload: "Drop your solicitation PDF here",
  analyze: "Extract Requirements",
  analyzing: "Analyzing solicitation…",
  noText: "No readable text found. Run OCR on this PDF first.",
  errPrefix: "Analysis failed:",
  retry: "Retry",
  privacy: "📋 Only the extracted text is sent for analysis — your file itself isn't uploaded.",
  mandatory: "Mandatory",
  advisory: "Advisory",
  colId: "#",
  colSection: "Section",
  colRequirement: "Requirement",
  colType: "Type",
  colQuote: "Source text",
  downloadCsv: "Download CSV",
  found: (n: number) => `${n} requirement${n === 1 ? "" : "s"} found`,
  filterAll: "All",
  filterMandatory: "Mandatory only",
  filterAdvisory: "Advisory only",
  noQuote: "Quote unverifiable",
};

const STR: AuthoredCopy<typeof STR_EN> = {
  en: STR_EN,
  zh: {
    title: "政府标书合规矩阵",
    eyebrow: "PRO · 单文档 AI",
    subtitle: "上传 RFP 或招标文件——自动提取每条「shall/must」合规要求，生成带条款编号的合规矩阵。",
    upload: "把招标 PDF 拖到这里",
    analyze: "提取合规要求",
    analyzing: "正在分析招标文件……",
    noText: "未检测到可读文本，请先对该 PDF 做 OCR。",
    errPrefix: "分析失败：",
    retry: "重试",
    privacy: "📋 仅发送提取的文本进行分析——文件本身不会上传。",
    mandatory: "强制要求",
    advisory: "建议要求",
    colId: "编号",
    colSection: "条款",
    colRequirement: "合规要求",
    colType: "类型",
    colQuote: "原文引用",
    downloadCsv: "下载 CSV",
    found: (n: number) => `找到 ${n} 条合规要求`,
    filterAll: "全部",
    filterMandatory: "仅强制",
    filterAdvisory: "仅建议",
    noQuote: "引用未验证",
  },
  es: {
    title: "Matriz de cumplimiento para licitaciones públicas",
    eyebrow: "PRO · IA un solo doc",
    subtitle: "Sube un RFP o pliego de condiciones — extrae cada requisito 'shall/must' en una matriz numerada con referencias de sección.",
    upload: "Suelta tu PDF de licitación aquí",
    analyze: "Extraer requisitos",
    analyzing: "Analizando licitación…",
    noText: "No se encontró texto legible. Aplica OCR a este PDF primero.",
    errPrefix: "Análisis fallido:",
    retry: "Reintentar",
    privacy: "📋 Solo se envía el texto extraído para análisis: el archivo en sí no se sube.",
    mandatory: "Obligatorio",
    advisory: "Recomendado",
    colId: "#",
    colSection: "Sección",
    colRequirement: "Requisito",
    colType: "Tipo",
    colQuote: "Texto fuente",
    downloadCsv: "Descargar CSV",
    found: (n: number) => `${n} requisito${n === 1 ? "" : "s"} encontrado${n === 1 ? "" : "s"}`,
    filterAll: "Todos",
    filterMandatory: "Solo obligatorios",
    filterAdvisory: "Solo recomendados",
    noQuote: "Cita no verificada",
  },
  pt: {
    title: "Matriz de conformidade para licitações públicas",
    eyebrow: "PRO · IA doc único",
    subtitle: "Envie um RFP ou edital — extraia cada requisito 'shall/must' em uma matriz numerada com referências de seção.",
    upload: "Solte seu PDF de licitação aqui",
    analyze: "Extrair requisitos",
    analyzing: "Analisando licitação…",
    noText: "Nenhum texto legível encontrado. Execute OCR neste PDF primeiro.",
    errPrefix: "Análise falhou:",
    retry: "Tentar novamente",
    privacy: "📋 Apenas o texto extraído é enviado para análise — o arquivo em si não é enviado.",
    mandatory: "Obrigatório",
    advisory: "Recomendado",
    colId: "#",
    colSection: "Seção",
    colRequirement: "Requisito",
    colType: "Tipo",
    colQuote: "Texto fonte",
    downloadCsv: "Baixar CSV",
    found: (n: number) => `${n} requisito${n === 1 ? "" : "s"} encontrado${n === 1 ? "" : "s"}`,
    filterAll: "Todos",
    filterMandatory: "Somente obrigatórios",
    filterAdvisory: "Somente recomendados",
    noQuote: "Citação não verificável",
  },
  fr: {
    title: "Matrice de conformité pour appels d'offres publics",
    eyebrow: "PRO · IA document unique",
    subtitle: "Importez un appel d'offres ou un cahier des charges — extrayez chaque exigence « shall/must » dans une matrice numérotée avec références de section.",
    upload: "Déposez votre PDF d'appel d'offres ici",
    analyze: "Extraire les exigences",
    analyzing: "Analyse de l'appel d'offres…",
    noText: "Aucun texte lisible trouvé. Exécutez d'abord l'OCR sur ce PDF.",
    errPrefix: "Échec de l'analyse :",
    retry: "Réessayer",
    privacy: "📋 Seul le texte extrait est envoyé pour analyse — le fichier lui-même n'est pas téléversé.",
    mandatory: "Obligatoire",
    advisory: "Recommandé",
    colId: "#",
    colSection: "Section",
    colRequirement: "Exigence",
    colType: "Type",
    colQuote: "Texte source",
    downloadCsv: "Télécharger CSV",
    found: (n: number) => `${n} exigence${n === 1 ? "" : "s"} trouvée${n === 1 ? "" : "s"}`,
    filterAll: "Toutes",
    filterMandatory: "Obligatoires uniquement",
    filterAdvisory: "Recommandées uniquement",
    noQuote: "Citation non vérifiable",
  },
  ja: {
    title: "入札コンプライアンス・マトリクス",
    eyebrow: "PRO · 単一文書AI",
    subtitle: "RFPや入札公告をアップロードすると、すべての「~しなければならない（shall/must）」要件を、セクション参照つきの番号付きコンプライアンス・マトリクスに抽出します。",
    upload: "入札公告のPDFをここにドロップ",
    analyze: "要件を抽出",
    analyzing: "公告を分析中…",
    noText: "読み取れるテキストがありません。先にこのPDFにOCRをかけてください。",
    errPrefix: "分析に失敗しました:",
    retry: "再試行",
    privacy: "📋 分析には抽出されたテキストのみが送られます——ファイル自体はアップロードされません。",
    mandatory: "必須",
    advisory: "任意",
    colId: "#",
    colSection: "セクション",
    colRequirement: "要件",
    colType: "種別",
    colQuote: "出典テキスト",
    downloadCsv: "CSVをダウンロード",
    found: (n: number) => `${n}件の要件が見つかりました`,
    filterAll: "すべて",
    filterMandatory: "必須のみ",
    filterAdvisory: "任意のみ",
    noQuote: "引用を確認できません",
  },
  de: {
    title: "Compliance-Matrix für Ausschreibungen",
    eyebrow: "PRO · Einzeldokument-KI",
    subtitle: "Laden Sie eine Ausschreibung oder ein Leistungsverzeichnis hoch – jede „shall/must“-Anforderung wird in eine nummerierte Compliance-Matrix mit Klauselverweisen extrahiert.",
    upload: "Ziehen Sie Ihr Ausschreibungs-PDF hierher",
    analyze: "Anforderungen extrahieren",
    analyzing: "Ausschreibung wird analysiert…",
    noText: "Kein lesbarer Text gefunden. Führen Sie zuerst OCR für dieses PDF aus.",
    errPrefix: "Analyse fehlgeschlagen:",
    retry: "Erneut versuchen",
    privacy: "📋 Nur der extrahierte Text wird zur Analyse gesendet – die Datei selbst wird nicht hochgeladen.",
    mandatory: "Verbindlich",
    advisory: "Empfehlung",
    colId: "#",
    colSection: "Klausel",
    colRequirement: "Anforderung",
    colType: "Art",
    colQuote: "Quelltext",
    downloadCsv: "CSV herunterladen",
    found: (n: number) => `${n} Anforderung${n === 1 ? "" : "en"} gefunden`,
    filterAll: "Alle",
    filterMandatory: "Nur verbindliche",
    filterAdvisory: "Nur empfohlene",
    noQuote: "Zitat nicht überprüfbar",
  },
  ko: {
    title: "정부 입찰 컴플라이언스 매트릭스",
    eyebrow: "PRO · 단일 문서 AI",
    subtitle: "RFP나 입찰 공고를 업로드하면 모든 'shall/must' 요건을 조항 참조가 붙은 번호 매긴 컴플라이언스 매트릭스로 추출합니다.",
    upload: "입찰 공고 PDF를 여기에 놓으세요",
    analyze: "요건 추출",
    analyzing: "입찰 공고 분석 중…",
    noText: "읽을 수 있는 텍스트를 찾지 못했습니다. 이 PDF에 먼저 OCR을 실행하세요.",
    errPrefix: "분석 실패:",
    retry: "다시 시도",
    privacy: "📋 분석에는 추출된 텍스트만 전송됩니다 — 파일 자체는 업로드되지 않습니다.",
    mandatory: "필수",
    advisory: "권고",
    colId: "#",
    colSection: "조항",
    colRequirement: "요건",
    colType: "유형",
    colQuote: "출처 텍스트",
    downloadCsv: "CSV 다운로드",
    found: (n: number) => `요건 ${n}개 발견`,
    filterAll: "전체",
    filterMandatory: "필수만",
    filterAdvisory: "권고만",
    noQuote: "인용 확인 불가",
  },
};

function exportCsv(requirements: Requirement[], t: typeof STR_EN) {
  const header = [t.colId, t.colSection, t.colType, t.colRequirement, t.colQuote].join(",");
  const rows = requirements.map((r) =>
    [r.id, r.section, r.type, r.requirement, r.quote ?? ""]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(","),
  );
  const blob = new Blob([header + "\n" + rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "compliance-matrix.csv";
  a.click();
  URL.revokeObjectURL(url);
}

const SECTIONS: Record<AuthoredLocale, ToolSectionsContent> = {
  en: {
    benefitsTitle: "What the compliance matrix does for you",
    benefitsDescription: "The AI reads your solicitation's text and turns scattered obligations into one structured, exportable matrix.",
    benefits: [
      { title: "Every shall/must, nothing missed", description: "The AI sweeps the whole solicitation for binding language — 'shall', 'must', 'is required to' — so a buried requirement on page 47 doesn't cost you the bid." },
      { title: "Each line carries its source clause", description: "Every requirement carries the clause number it came from, and the exact source sentence when it can be located, so your team can verify each one against the original RFP." },
      { title: "Export to CSV for your response", description: "Send the numbered matrix straight to a spreadsheet and assign owners, status, and proof — turning extraction into a working compliance checklist." },
    ],
    workflowTitle: "From solicitation PDF to compliance checklist",
    workflowDescription: "When a tender lands and you need every binding requirement pulled out before the deadline clock starts.",
    steps: [
      "Upload the RFP or solicitation PDF.",
      "The AI analyzes the document's text and extracts each shall/must requirement with its section reference.",
      "Review the numbered matrix and download it as CSV for your bid response.",
    ],
    readingTitle: "More AI document analysis",
    readingDescription: "Related tools for reading contracts, leases, and long documents.",
    readingLinks: [
      { label: "Contract risk review", href: "/contract-risk", description: "Flag risky clauses and one-sided terms in a contract, each tied to its source passage." },
      { label: "AI document workspace", href: "/ai-workspace", description: "Ask questions across a whole document and get answers traced back to the text." },
      { label: "AI document resources", href: "/resources", description: "A structured hub for AI document tools, extraction, and analysis paths." },
    ],
  },
  zh: {
    benefitsTitle: "合规矩阵能为你做什么",
    benefitsDescription: "AI 读取招标文件的文本，把散落各处的义务整理成一份结构化、可导出的矩阵。",
    benefits: [
      { title: "每条 shall/must 都不漏", description: "AI 通读整份招标文件，捕捉所有约束性措辞——「shall」「must」「必须」——让埋在第 47 页的要求不再让你丢标。" },
      { title: "每条都标注来源条款", description: "每条要求都附上来源条款编号，能定位到原文时还附上原文句子，方便你的团队逐条对照原始 RFP 核验。" },
      { title: "导出 CSV 用于投标响应", description: "把编号矩阵直接导入表格，分配负责人、状态和佐证——让提取结果变成可执行的合规清单。" },
    ],
    workflowTitle: "从招标 PDF 到合规清单",
    workflowDescription: "当一份标书到手、你需要在截止倒计时开始前把每条约束性要求提取出来时。",
    steps: [
      "上传 RFP 或招标 PDF。",
      "AI 分析文档文本，逐条提取 shall/must 要求并标注条款编号。",
      "查看编号矩阵，导出 CSV 用于你的投标响应。",
    ],
    readingTitle: "更多 AI 文档分析",
    readingDescription: "用于读合同、租约和长文档的相关工具。",
    readingLinks: [
      { label: "合同风险审查", href: "/contract-risk", description: "标记合同中的风险条款和单方面条款，每条都关联到来源段落。" },
      { label: "AI 文档工作台", href: "/ai-workspace", description: "针对整份文档提问，得到可追溯回原文的答案。" },
      { label: "AI 文档资源", href: "/resources", description: "按工作流整理的 AI 文档工具、提取与分析路径中心。" },
    ],
  },
  es: {
    benefitsTitle: "Qué hace por ti la matriz de cumplimiento",
    benefitsDescription: "La IA lee el texto del pliego y convierte obligaciones dispersas en una matriz estructurada y exportable.",
    benefits: [
      { title: "Cada shall/must, sin omitir nada", description: "La IA recorre todo el pliego en busca de lenguaje vinculante —'shall', 'must', 'deberá'— para que un requisito enterrado en la página 47 no te cueste la licitación." },
      { title: "Cada línea lleva su cláusula de origen", description: "Cada requisito lleva el número de cláusula de origen, y la frase fuente exacta cuando puede localizarse, para que tu equipo verifique cada uno contra el RFP original." },
      { title: "Exporta a CSV para tu respuesta", description: "Lleva la matriz numerada directo a una hoja de cálculo y asigna responsables, estado y evidencia: la extracción se convierte en una lista de cumplimiento operativa." },
    ],
    workflowTitle: "Del PDF del pliego a la lista de cumplimiento",
    workflowDescription: "Cuando llega una licitación y necesitas extraer cada requisito vinculante antes de que empiece la cuenta atrás.",
    steps: [
      "Sube el PDF del RFP o pliego.",
      "La IA analiza el texto del documento y extrae cada requisito shall/must con su referencia de sección.",
      "Revisa la matriz numerada y descárgala en CSV para tu propuesta.",
    ],
    readingTitle: "Más análisis de documentos con IA",
    readingDescription: "Herramientas relacionadas para leer contratos, arrendamientos y documentos largos.",
    readingLinks: [
      { label: "Revisión de riesgos de contrato", href: "/contract-risk", description: "Detecta cláusulas riesgosas y términos desequilibrados, cada uno ligado a su pasaje fuente." },
      { label: "Espacio de trabajo de documentos con IA", href: "/ai-workspace", description: "Haz preguntas sobre todo un documento y obtén respuestas rastreables al texto." },
      { label: "Recursos de documentos con IA", href: "/resources", description: "Un centro estructurado de herramientas de IA, extracción y análisis de documentos." },
    ],
  },
  pt: {
    benefitsTitle: "O que a matriz de conformidade faz por você",
    benefitsDescription: "A IA lê o texto do edital e transforma obrigações dispersas em uma matriz estruturada e exportável.",
    benefits: [
      { title: "Cada shall/must, nada esquecido", description: "A IA varre todo o edital em busca de linguagem vinculante —'shall', 'must', 'deverá'— para que um requisito escondido na página 47 não custe a licitação." },
      { title: "Cada linha traz sua cláusula de origem", description: "Cada requisito traz o número da cláusula de origem, e a frase fonte exata quando ela pode ser localizada, para sua equipe conferir cada um contra o RFP original." },
      { title: "Exporte para CSV na sua resposta", description: "Leve a matriz numerada direto para uma planilha e atribua responsáveis, status e comprovação: a extração vira uma lista de conformidade operacional." },
    ],
    workflowTitle: "Do PDF do edital à lista de conformidade",
    workflowDescription: "Quando uma licitação chega e você precisa extrair cada requisito vinculante antes da contagem regressiva começar.",
    steps: [
      "Envie o PDF do RFP ou edital.",
      "A IA analisa o texto do documento e extrai cada requisito shall/must com sua referência de seção.",
      "Revise a matriz numerada e baixe-a em CSV para sua proposta.",
    ],
    readingTitle: "Mais análise de documentos com IA",
    readingDescription: "Ferramentas relacionadas para ler contratos, contratos de locação e documentos longos.",
    readingLinks: [
      { label: "Análise de riscos de contrato", href: "/contract-risk", description: "Sinalize cláusulas arriscadas e termos desequilibrados, cada um ligado ao seu trecho de origem." },
      { label: "Espaço de trabalho de documentos com IA", href: "/ai-workspace", description: "Faça perguntas sobre um documento inteiro e obtenha respostas rastreáveis ao texto." },
      { label: "Recursos de documentos com IA", href: "/resources", description: "Um hub estruturado de ferramentas de IA, extração e análise de documentos." },
    ],
  },
  fr: {
    benefitsTitle: "Ce que la matrice de conformité fait pour vous",
    benefitsDescription: "L'IA lit le texte de l'appel d'offres et transforme des obligations éparses en une matrice structurée et exportable.",
    benefits: [
      { title: "Chaque shall/must, rien d'oublié", description: "L'IA parcourt tout l'appel d'offres à la recherche du langage contraignant —« shall », « must », « devra »— pour qu'une exigence enfouie en page 47 ne vous coûte pas le marché." },
      { title: "Chaque ligne porte sa clause d'origine", description: "Chaque exigence porte le numéro de clause d'origine, et la phrase source exacte lorsqu'elle peut être localisée, pour que votre équipe vérifie chacune par rapport à l'appel d'offres original." },
      { title: "Exportez en CSV pour votre réponse", description: "Envoyez la matrice numérotée directement dans un tableur et attribuez responsables, statut et preuves : l'extraction devient une liste de conformité opérationnelle." },
    ],
    workflowTitle: "Du PDF de l'appel d'offres à la liste de conformité",
    workflowDescription: "Quand un appel d'offres arrive et qu'il faut extraire chaque exigence contraignante avant le départ du compte à rebours.",
    steps: [
      "Importez le PDF de l'appel d'offres ou du cahier des charges.",
      "L'IA analyse le texte du document et extrait chaque exigence shall/must avec sa référence de section.",
      "Vérifiez la matrice numérotée et téléchargez-la en CSV pour votre réponse.",
    ],
    readingTitle: "Plus d'analyse de documents par IA",
    readingDescription: "Outils associés pour lire contrats, baux et documents longs.",
    readingLinks: [
      { label: "Analyse des risques de contrat", href: "/contract-risk", description: "Repérez les clauses risquées et déséquilibrées, chacune reliée à son passage source." },
      { label: "Espace de travail documentaire IA", href: "/ai-workspace", description: "Posez des questions sur un document entier et obtenez des réponses traçables au texte." },
      { label: "Ressources documentaires IA", href: "/resources", description: "Un hub structuré d'outils IA, d'extraction et d'analyse de documents." },
    ],
  },
  ja: {
    benefitsTitle: "コンプライアンス・マトリクスができること",
    benefitsDescription: "AI が入札文書のテキストを読み取り、散在する義務を 1 つの構造化された、書き出し可能なマトリクスにまとめます。",
    benefits: [
      { title: "すべての shall/must を見逃さない", description: "AI が入札文書全体から拘束力のある表現——「shall」「must」「~しなければならない」——を洗い出すので、47 ページ目に埋もれた要件が落札を逃す原因になりません。" },
      { title: "各行に出典の条項番号を明記", description: "各要件には出典の条項番号が付き、原文を特定できる場合はその一文も添えられるため、チームが元の RFP と照らし合わせて 1 件ずつ確認できます。" },
      { title: "提案用に CSV へ書き出し", description: "番号付きマトリクスをそのまま表計算ソフトに取り込み、担当者・ステータス・証跡を割り当て——抽出結果が実用的なコンプライアンス・チェックリストになります。" },
    ],
    workflowTitle: "入札 PDF からコンプライアンス・チェックリストへ",
    workflowDescription: "入札案件が届き、締め切りのカウントダウンが始まる前にすべての拘束的要件を抜き出す必要があるとき。",
    steps: [
      "RFP や入札公告の PDF をアップロードします。",
      "AI が文書のテキストを分析し、各 shall/must 要件をセクション参照とともに抽出します。",
      "番号付きマトリクスを確認し、提案用に CSV としてダウンロードします。",
    ],
    readingTitle: "その他の AI 文書分析",
    readingDescription: "契約書、賃貸借契約、長文を読むための関連ツール。",
    readingLinks: [
      { label: "契約リスクレビュー", href: "/contract-risk", description: "契約書のリスク条項や一方的な条件を、それぞれ出典箇所に紐づけて指摘します。" },
      { label: "AI 文書ワークスペース", href: "/ai-workspace", description: "文書全体に質問し、本文までたどれる回答を得られます。" },
      { label: "AI 文書リソース", href: "/resources", description: "AI 文書ツール、抽出、分析の導線を整理したハブ。" },
    ],
  },
  de: {
    benefitsTitle: "Was die Compliance-Matrix für Sie leistet",
    benefitsDescription: "Die KI liest den Text Ihrer Ausschreibung und verwandelt verstreute Pflichten in eine strukturierte, exportierbare Matrix.",
    benefits: [
      { title: "Jedes shall/must, nichts übersehen", description: "Die KI durchsucht die gesamte Ausschreibung nach verbindlichen Formulierungen – „shall“, „must“, „ist verpflichtet“ –, damit eine auf Seite 47 vergrabene Anforderung Sie nicht den Zuschlag kostet." },
      { title: "Jede Zeile trägt ihre Quellklausel", description: "Jede Anforderung trägt die Klauselnummer, aus der sie stammt, und den genauen Quellsatz, sofern er auffindbar ist, sodass Ihr Team jede Anforderung mit der ursprünglichen Ausschreibung abgleichen kann." },
      { title: "Export als CSV für Ihre Angebotsantwort", description: "Übertragen Sie die nummerierte Matrix direkt in eine Tabelle und weisen Sie Verantwortliche, Status und Nachweise zu – so wird aus der Extraktion eine praktikable Compliance-Checkliste." },
    ],
    workflowTitle: "Vom Ausschreibungs-PDF zur Compliance-Checkliste",
    workflowDescription: "Wenn eine Ausschreibung eintrifft und Sie jede verbindliche Anforderung herausziehen müssen, bevor die Frist zu laufen beginnt.",
    steps: [
      "Laden Sie das PDF der Ausschreibung oder des Leistungsverzeichnisses hoch.",
      "Die KI analysiert den Text des Dokuments und extrahiert jede shall/must-Anforderung mit ihrem Klauselverweis.",
      "Prüfen Sie die nummerierte Matrix und laden Sie sie als CSV für Ihre Angebotsantwort herunter.",
    ],
    readingTitle: "Mehr KI-Dokumentenanalyse",
    readingDescription: "Verwandte Tools zum Lesen von Verträgen, Mietverträgen und langen Dokumenten.",
    readingLinks: [
      { label: "Vertrags-Risikoprüfung", href: "/contract-risk", description: "Markiert riskante Klauseln und einseitige Bedingungen in einem Vertrag, jede mit ihrer Quellstelle verknüpft." },
      { label: "KI-Dokumenten-Arbeitsbereich", href: "/ai-workspace", description: "Stellen Sie Fragen zu einem ganzen Dokument und erhalten Sie Antworten, die auf den Text zurückführbar sind." },
      { label: "KI-Dokumentenressourcen", href: "/resources", description: "Ein strukturierter Hub für KI-Dokumententools, Extraktion und Analysewege." },
    ],
  },
  ko: {
    benefitsTitle: "컴플라이언스 매트릭스가 해 주는 일",
    benefitsDescription: "AI가 입찰 문서의 텍스트를 읽고, 흩어진 의무를 하나의 구조화된 내보내기 가능한 매트릭스로 정리합니다.",
    benefits: [
      { title: "모든 shall/must, 하나도 놓치지 않음", description: "AI가 입찰 문서 전체에서 구속력 있는 표현 — 'shall', 'must', '~해야 한다' — 을 훑어내므로, 47페이지에 묻힌 요건 때문에 낙찰을 놓치지 않습니다." },
      { title: "각 줄에 출처 조항이 붙습니다", description: "각 요건에는 출처 조항 번호가 붙고, 위치를 찾을 수 있을 때는 정확한 출처 문장도 함께 표시되어, 팀이 원본 RFP와 하나씩 대조해 확인할 수 있습니다." },
      { title: "제안용으로 CSV 내보내기", description: "번호 매긴 매트릭스를 곧바로 스프레드시트로 옮겨 담당자, 상태, 증빙을 배정하세요 — 추출 결과가 실제로 쓰는 컴플라이언스 체크리스트가 됩니다." },
    ],
    workflowTitle: "입찰 PDF에서 컴플라이언스 체크리스트까지",
    workflowDescription: "입찰 건이 도착하고, 마감 카운트다운이 시작되기 전에 모든 구속력 있는 요건을 뽑아내야 할 때를 위한 기능입니다.",
    steps: [
      "RFP나 입찰 공고 PDF를 업로드하세요.",
      "AI가 문서의 텍스트를 분석해 각 shall/must 요건을 조항 참조와 함께 추출합니다.",
      "번호 매긴 매트릭스를 검토하고, 입찰 응답용으로 CSV로 다운로드하세요.",
    ],
    readingTitle: "더 많은 AI 문서 분석",
    readingDescription: "계약서, 임대차, 긴 문서를 읽기 위한 관련 도구입니다.",
    readingLinks: [
      { label: "계약 위험 검토", href: "/contract-risk", description: "계약서의 위험 조항과 한쪽에 치우친 조건을 표시하고, 각각을 출처 구절에 연결합니다." },
      { label: "AI 문서 작업 공간", href: "/ai-workspace", description: "문서 전체에 질문하고, 본문까지 추적되는 답변을 받아 보세요." },
      { label: "AI 문서 자료", href: "/resources", description: "AI 문서 도구, 추출, 분석 경로를 정리한 구조화된 허브입니다." },
    ],
  },
};

export function GovbidMatrixClient({ locale = "en", embedded = false }: { locale?: Locale; embedded?: boolean }) {
  // ko is fully authored (STR/SECTIONS/READ_ERR carry Korean). zh-Hant derives from zh via deepHant.
  const al: AuthoredLocale = locale === "zh-Hant" ? "en" : locale;
  const t = locale === "zh-Hant" ? deepHant(STR.zh) : STR[al];
  const sec: ToolSectionsContent = locale === "zh-Hant" ? deepHant(SECTIONS.zh) : SECTIONS[al];
  // zh-Hant rendered from zh via OpenCC; child components (UpgradePrompt /
  // ToolFaq / encryptedPdfMessage) lack zh-Hant in their union → map to "zh".
  // ko has no engine/runtime copy yet → English (foundation phase); zh-Hant preserved.
  const childLocale = locale; // shared widgets accept zh-Hant (Traditional derived via OpenCC)
  const [phase, setPhase] = useState<"ready" | "analyzing" | "done">("ready");
  const [error, setError] = useState<string | null>(null);
  const [requirements, setRequirements] = useState<Requirement[] | null>(null);
  const [filter, setFilter] = useState<"all" | "mandatory" | "advisory">("all");
  const [limitHit, setLimitHit] = useState<number | null>(null);
  const [expandedQuote, setExpandedQuote] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [fileSizeMb, setFileSizeMb] = useState<number>(0);
  const [analyzedFileName, setAnalyzedFileName] = useState<string>("");

  const onAnalyze = useCallback(
    async (file: File) => {
      setPhase("analyzing");
      setError(null);
      setRequirements(null);
      setLimitHit(null);
      setExpandedQuote(null);
      setAnalyzedFileName(file.name);
      setFileSizeMb(Math.round((file.size / 1024 / 1024) * 100) / 100);
      setThumbnailUrl(null);

      // Extract text client-side
      const { getDocument } = await import("pdfjs-dist");
      const { GlobalWorkerOptions } = await import("pdfjs-dist");
      GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      let text = "";
      try {
        const ab = await file.arrayBuffer();
        const pdf = await getDocument({ data: ab }).promise;
        try {
          const thumb = await pdf.getPage(1);
          const vp = thumb.getViewport({ scale: 0.4 });
          const thumbCanvas = document.createElement("canvas");
          thumbCanvas.width = vp.width; thumbCanvas.height = vp.height;
          const ctx = thumbCanvas.getContext("2d");
          if (ctx) await thumb.render({ canvas: thumbCanvas, canvasContext: ctx, viewport: vp }).promise;
          setThumbnailUrl(thumbCanvas.toDataURL("image/jpeg", 0.7));
        } catch { /* non-critical */ }
        for (let p = 1; p <= pdf.numPages && text.length < MAX_CHARS; p++) {
          const page = await pdf.getPage(p);
          const content = await page.getTextContent();
          text += content.items.map((i) => ("str" in i ? (i as { str?: string }).str : "") ?? "").join(" ") + "\n";
        }
      } catch (e) {
        const READ_ERR: Record<AuthoredLocale, string> = {
          en: "Could not read PDF",
          zh: "无法读取 PDF",
          es: "No se pudo leer el PDF",
          pt: "Não foi possível ler o PDF",
          fr: "Impossible de lire le PDF",
          ja: "PDF を読み取れませんでした",
          de: "PDF konnte nicht gelesen werden",
          ko: "PDF를 읽을 수 없습니다",
        };
        const readErr = locale === "zh-Hant" ? toHant(READ_ERR.zh) : READ_ERR[al];
        const msg = encryptedPdfMessage(e, childLocale) ?? readErr;
        setError(msg);
        setPhase("ready");
        return;
      }

      text = text.trim().slice(0, MAX_CHARS);
      if (!text) {
        setError(t.noText);
        setPhase("ready");
        return;
      }

      const gate = await checkUsage("contractAnalyzer");
      if (!gate.allowed) {
        setLimitHit(gate.limit);
        setPhase("ready");
        return;
      }

      const auth = await authHeader();
      const res = await fetch("/api/govbid-matrix", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...auth },
        body: JSON.stringify({ text, locale }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        setError((t.errPrefix + " " + (data.message ?? res.status)).trim());
        setPhase("ready");
        return;
      }

      await markUsage(gate, "contractAnalyzer");
      setRequirements(data.requirements ?? []);
      setPhase("done");
      trackToolRun("govbid-matrix");
    },
    [locale, al, t, childLocale],
  );

  const filtered = useMemo(() => {
    if (!requirements) return [];
    if (filter === "mandatory") return requirements.filter((r) => r.type === "mandatory");
    if (filter === "advisory") return requirements.filter((r) => r.type === "advisory");
    return requirements;
  }, [requirements, filter]);

  const typeBadge = (type: RequirementType) => {
    const base = "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium";
    if (type === "mandatory")
      return <span className={`${base} bg-[rgba(248,113,113,0.12)] text-[#f87171]`}>{t.mandatory}</span>;
    return <span className={`${base} bg-[rgba(251,191,36,0.12)] text-[#fbbf24]`}>{t.advisory}</span>;
  };

  const Wrapper: "main" | "div" = embedded ? "div" : "main";
  return (
    <Wrapper className={embedded ? "mx-auto w-full max-w-3xl px-8 pb-10 pt-4" : `mx-auto ${LAYOUT.content} px-5 py-12`}>
      {!embedded && (
        <>
          <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-[color:var(--faint)]">{t.eyebrow}</p>
          <h1 className="mt-2 text-[32px] font-normal leading-[1.15] tracking-[-0.02em] text-[color:var(--foreground)] sm:text-[40px]">
            {t.title}
          </h1>
          <p className="mt-3 text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.subtitle}</p>
        </>
      )}
      {embedded && <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.subtitle}</p>}

      {!embedded && (
        <div className="mt-6">
          <TrialCta
            variant="tool-pro"
            locale={locale}
            hookTitle={
              locale === "zh" || locale === "zh-Hant"
                ? "这份招标文件，先免费查一遍合规要求"
                : locale === "es" ? "Esta licitación — que la IA identifique los requisitos de cumplimiento."
                : locale === "pt" ? "Este edital — que a IA identifique os requisitos de conformidade."
                : locale === "fr" ? "Cet appel d'offres — que l'IA identifie les exigences de conformité."
                : locale === "ja" ? "この入札文書——AIが要件を洗い出します。"
                : locale === "de" ? "Diese Ausschreibung — KI prüft die Compliance-Anforderungen."
                : locale === "ko" ? "이 입찰 문서——AI가 준수 요건을 찾아드립니다."
                : "This bid document — let AI check the compliance requirements."
            }
          />
        </div>
      )}

      {/* Upload */}
      <div className="mt-8">
        <UploadDropzone
          locale={childLocale}
          accept="application/pdf"
          buttonLabel={t.upload}
          onFile={onAnalyze}
          busy={phase === "analyzing"}
          constrained={embedded}
          valueZone="ai"
        />
      </div>

      {/* Limit hit */}
      {limitHit !== null && <UpgradePrompt locale={childLocale === "ko" ? "en" : childLocale} limit={limitHit} />}

      {/* Error */}
      {error && (
        <div role="alert" className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">
          <span>{error}</span>
          {phase === "ready" && (
            <button type="button" onClick={() => setError(null)} className="shrink-0 rounded border border-[rgba(248,113,113,0.4)] px-3 py-1 text-[12px] font-semibold transition hover:bg-[rgba(248,113,113,0.1)]">
              {t.retry}
            </button>
          )}
        </div>
      )}

      {/* Loading skeleton */}
      {phase === "analyzing" && (
        <div className="mt-6 space-y-2" aria-busy="true">
          <p className="text-[13px] text-[color:var(--muted)]">{t.analyzing}</p>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-3 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-3">
              <div className="h-4 w-12 rounded bg-[color:var(--surface-subtle)]" />
              <div className="h-4 w-20 rounded bg-[color:var(--surface-subtle)]" />
              <div className="h-4 w-16 rounded bg-[color:var(--surface-subtle)]" />
              <div className="h-4 flex-1 rounded bg-[color:var(--surface-subtle)]" />
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {requirements && phase === "done" && (
        <div className="mt-8">
          {analyzedFileName && (
            <div className="mb-4 flex items-start gap-3 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-2.5">
              {thumbnailUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={thumbnailUrl} alt="Page 1" className="h-24 max-w-[160px] w-auto object-contain shrink-0 rounded border border-[color:var(--line)]" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold text-[color:var(--foreground)]">{analyzedFileName}</p>
                {fileSizeMb > 0 && <p className="text-[11.5px] text-[color:var(--faint)]">{fileSizeMb} MB</p>}
              </div>
            </div>
          )}
          {/* Toolbar */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[13px] text-[color:var(--muted)]">{t.found(requirements.length)}</p>
            <div className="flex items-center gap-2">
              {/* Filter */}
              <div className="flex rounded-[var(--radius-sm)] border border-[color:var(--line)] overflow-hidden">
                {(["all", "mandatory", "advisory"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 text-[12px] font-medium transition ${filter === f ? "bg-[color:var(--surface-subtle)] text-[color:var(--foreground)]" : "text-[color:var(--muted)] hover:text-[color:var(--foreground)]"}`}
                  >
                    {f === "all" ? t.filterAll : f === "mandatory" ? t.filterMandatory : t.filterAdvisory}
                  </button>
                ))}
              </div>
              {/* CSV download */}
              <button
                type="button"
                onClick={() => exportCsv(filtered, t)}
                className="rounded-[var(--radius-sm)] border border-[color:var(--line)] px-3 py-1.5 text-[12px] font-medium text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--foreground)]"
              >
                {t.downloadCsv}
              </button>
            </div>
          </div>

          {/* Matrix table */}
          <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[color:var(--line)]">
            <table className="w-full text-[13.5px]">
              <thead>
                <tr className="border-b border-[color:var(--line)] bg-[color:var(--surface)]">
                  <th className="px-3 py-2.5 text-left font-medium text-[color:var(--muted)]">{t.colId}</th>
                  <th className="px-3 py-2.5 text-left font-medium text-[color:var(--muted)]">{t.colSection}</th>
                  <th className="px-3 py-2.5 text-left font-medium text-[color:var(--muted)]">{t.colType}</th>
                  <th className="px-3 py-2.5 text-left font-medium text-[color:var(--muted)]">{t.colRequirement}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr
                    key={r.id}
                    className={`border-b border-[color:var(--line)] last:border-0 transition hover:bg-[color:var(--surface-subtle)] ${i % 2 === 0 ? "" : "bg-[color:var(--surface)]"}`}
                  >
                    <td className="px-3 py-2.5 font-mono text-[12px] text-[color:var(--faint)] whitespace-nowrap">{r.id}</td>
                    <td className="px-3 py-2.5 font-mono text-[12px] text-[color:var(--muted)] whitespace-nowrap">{r.section || "—"}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">{typeBadge(r.type)}</td>
                    <td className="px-3 py-2.5 text-[color:var(--foreground)] leading-[1.5]">
                      <span>{r.requirement}</span>
                      {r.quote && (
                        <button
                          type="button"
                          onClick={() => setExpandedQuote(expandedQuote === r.id ? null : r.id)}
                          className="ml-2 text-[11px] text-[color:var(--accent)] hover:underline"
                        >
                          {expandedQuote === r.id ? "▲" : `▼ ${locale === "zh" || locale === "zh-Hant" ? "原文" : locale === "es" ? "fuente" : locale === "pt" ? "fonte" : locale === "ja" ? "出典" : locale === "de" ? "Quelle" : locale === "ko" ? "출처" : "source"}`}
                        </button>
                      )}
                      {expandedQuote === r.id && r.quote && (
                        <blockquote className="mt-1.5 border-l-2 border-[color:var(--accent)] pl-2.5 text-[12px] italic text-[color:var(--muted)]">
                          {r.quote}
                        </blockquote>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Privacy notice */}
      <p className="mt-8 text-[12px] text-[color:var(--faint)]">{t.privacy}</p>

      {!embedded && <ToolSections locale={locale} content={sec} />}
      {!embedded && <ToolFaq tool="govbid-matrix" locale={childLocale} />}
    </Wrapper>
  );
}
