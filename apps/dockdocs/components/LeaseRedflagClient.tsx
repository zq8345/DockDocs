"use client";

import { trackToolRun } from "@/lib/track";
import { ToolFaq } from "@/components/ToolFaq";
import { ToolSections, type ToolSectionsContent } from "@/components/ToolSections";
import { UploadDropzone } from "@/components/UploadDropzone";
import { WorkspaceValueZone } from "@/components/WorkspaceValueZone";
import { encryptedPdfMessage } from "@/lib/pdf-errors";
import { checkUsage, markUsage } from "@/lib/usage-gate";
import { UpgradePrompt } from "@/components/ui/UpgradePrompt";
import { authHeader } from "@/lib/supabase";
import { deepHant } from "@/lib/zh-hant";
import { TrialCta } from "@/components/TrialCta";
import type { RouteLocale, AuthoredLocale } from "@/lib/i18n";
import { LAYOUT } from "@/lib/layout-constants";

import { useCallback, useMemo, useState } from "react";

type Locale = RouteLocale;
type RiskLevel = "high" | "medium" | "low";
type Risk = { type: string; level: RiskLevel; quote: string | null; why: string; suggestion: string; missing?: boolean; unverified?: boolean };

const MAX_CHARS = 24_000;

const _en = {
    title: "Lease Red Flag Check",
    subtitle:
      "Upload a lease — residential or commercial — and get a plain-language list of risky, unfair, or missing clauses: flagged red / amber / green, quoted from your document, with what to ask before you sign.",
    proBadge: "PRO",
    drop: "Drag & drop a lease PDF here, or click to choose",
    choose: "Choose lease PDF",
    extracting: "Reading lease…",
    pagesChars: (p: number, c: number) => `${p} pages · ${c.toLocaleString()} characters`,
    noText: "No selectable text found. Is this a scanned lease? Run OCR first.",
    tooLong: `This lease is longer than the ${MAX_CHARS.toLocaleString()}-character limit — only the first part will be reviewed.`,
    analyze: "Scan for red flags",
    analyzing: "Reviewing…",
    result: (n: number) => `${n} flag${n === 1 ? "" : "s"} to review`,
    noRisks: "No clear red flags were found. That's not a guarantee the lease is fair — read it in full and consider having a lawyer review it.",
    disclaimer: "This is an automated review to help tenants spot clauses worth attention. It is not legal advice. For anything important, consult a lawyer or a tenant-rights organization.",
    levelHigh: "High", levelMedium: "Medium", levelLow: "Low",
    quoteLabel: "From your lease",
    verifiedBadge: "Verified against source",
    notLocated: "Flagged as a missing/absent protection (no quote).",
    unverifiedQuote: "A cited quote couldn't be located in your lease, so it was hidden.",
    whyLabel: "Why it matters",
    suggestionLabel: "What to ask",
    reset: "Scan another lease",
    errPrefix: "Couldn't complete the scan: ",
    retry: "Try again",
    privacy: "Your lease is read in your browser; only the extracted text is sent for analysis.",
};

const STR = {
  en: _en,
  zh: {
    title: "租约红旗扫描",
    subtitle:
      "上传住宅或商业租约,得到白话的风险清单——逐条标注 红/黄/绿 等级、引用租约原文、告诉你签字前该问什么。",
    proBadge: "PRO",
    drop: "把租约 PDF 拖到这里,或点击选择",
    choose: "选择租约 PDF",
    extracting: "正在读取租约…",
    pagesChars: (p: number, c: number) => `${p} 页 · ${c.toLocaleString()} 字符`,
    noText: "没找到可选中的文字。是扫描件吗?请先用 OCR。",
    tooLong: `租约超过 ${MAX_CHARS.toLocaleString()} 字符上限,只会分析前面的部分。`,
    analyze: "扫描红旗条款",
    analyzing: "正在审查…",
    result: (n: number) => `${n} 个需要关注的条款`,
    noRisks: "没有发现明显的红旗条款。这不代表租约一定公平——请完整阅读,必要时咨询律师或租客权益机构。",
    disclaimer: "这是帮租客发现值得注意条款的自动审查,不构成法律意见。重要事项请咨询律师或租客权益机构。",
    levelHigh: "高", levelMedium: "中", levelLow: "低",
    quoteLabel: "租约原文",
    verifiedBadge: "已核对原文",
    notLocated: "标记为缺失/没有的保护条款(无原文)。",
    unverifiedQuote: "引文无法在租约原文中定位，已隐藏。",
    whyLabel: "为什么要注意",
    suggestionLabel: "该问什么",
    reset: "扫描另一份",
    errPrefix: "扫描未能完成:",
    retry: "重试",
    privacy: "租约在你的浏览器中读取,只有提取出的文字会被发送去分析。",
  },
  es: {
    title: "Análisis de riesgos del arrendamiento",
    subtitle:
      "Sube tu contrato de arrendamiento (residencial o comercial) y obtén una lista en lenguaje claro de cláusulas riesgosas, abusivas o ausentes: cada una marcada en rojo / ámbar / verde, citada de tu documento, con qué preguntar antes de firmar.",
    proBadge: "PRO",
    drop: "Arrastra un PDF del arrendamiento aquí, o haz clic para elegir",
    choose: "Elegir PDF del arrendamiento",
    extracting: "Leyendo el arrendamiento…",
    pagesChars: (p: number, c: number) => `${p} páginas · ${c.toLocaleString()} caracteres`,
    noText: "No se encontró texto seleccionable. ¿Es un contrato escaneado? Aplica OCR primero.",
    tooLong: `El arrendamiento supera el límite de ${MAX_CHARS.toLocaleString()} caracteres; solo se revisará la primera parte.`,
    analyze: "Buscar cláusulas problemáticas",
    analyzing: "Revisando…",
    result: (n: number) => `${n} cláusula${n === 1 ? "" : "s"} a revisar`,
    noRisks: "No se encontraron cláusulas problemáticas claras. Eso no garantiza que el arrendamiento sea justo; léelo completo y considera consultar a un abogado.",
    disclaimer: "Esta es una revisión automatizada para ayudar a los inquilinos a detectar cláusulas que merecen atención. No es asesoramiento legal. Para algo importante, consulta a un abogado o una organización de derechos del inquilino.",
    levelHigh: "Alto", levelMedium: "Medio", levelLow: "Bajo",
    quoteLabel: "De tu arrendamiento",
    verifiedBadge: "Verificado con el original",
    notLocated: "Marcada como protección ausente (sin cita).",
    unverifiedQuote: "No se pudo localizar la cita en tu arrendamiento; se ocultó.",
    whyLabel: "Por qué importa",
    suggestionLabel: "Qué preguntar",
    reset: "Analizar otro",
    errPrefix: "No se pudo completar el análisis: ",
    retry: "Reintentar",
    privacy: "Tu arrendamiento se lee en tu navegador; solo se envía el texto extraído para analizarlo.",
  },
  pt: {
    title: "Verificação de cláusulas problemáticas no contrato de aluguel",
    subtitle:
      "Envie seu contrato de aluguel (residencial ou comercial) e receba uma lista em linguagem simples de cláusulas arriscadas, abusivas ou ausentes — cada uma marcada em vermelho / âmbar / verde, citada do seu documento, com o que perguntar antes de assinar.",
    proBadge: "PRO",
    drop: "Arraste um PDF do contrato de aluguel aqui, ou clique para escolher",
    choose: "Escolher PDF do contrato de aluguel",
    extracting: "Lendo o contrato de aluguel…",
    pagesChars: (p: number, c: number) => `${p} páginas · ${c.toLocaleString()} caracteres`,
    noText: "Nenhum texto selecionável encontrado. É um contrato digitalizado? Execute o OCR primeiro.",
    tooLong: `O contrato de aluguel ultrapassa o limite de ${MAX_CHARS.toLocaleString()} caracteres; apenas a primeira parte será revisada.`,
    analyze: "Buscar cláusulas problemáticas",
    analyzing: "Revisando…",
    result: (n: number) => `${n} cláusula${n === 1 ? "" : "s"} para revisar`,
    noRisks: "Nenhuma cláusula problemática clara foi encontrada. Isso não garante que o contrato seja justo — leia-o na íntegra e considere consultar um advogado.",
    disclaimer: "Esta é uma revisão automatizada para ajudar inquilinos a identificar cláusulas que merecem atenção. Não constitui aconselhamento jurídico. Para assuntos importantes, consulte um advogado ou uma organização de direitos do inquilino.",
    levelHigh: "Alto", levelMedium: "Médio", levelLow: "Baixo",
    quoteLabel: "Do seu contrato de aluguel",
    verifiedBadge: "Verificado no original",
    notLocated: "Sinalizada como proteção ausente/inexistente (sem citação).",
    unverifiedQuote: "A citação não pôde ser localizada no seu contrato de aluguel; foi ocultada.",
    whyLabel: "Por que importa",
    suggestionLabel: "O que perguntar",
    reset: "Analisar outro",
    errPrefix: "Não foi possível concluir a análise: ",
    retry: "Tentar novamente",
    privacy: "Seu contrato de aluguel é lido no seu navegador; apenas o texto extraído é enviado para análise.",
  },
  fr: {
    title: "Analyse des clauses abusives du bail",
    subtitle:
      "Téléversez votre bail (résidentiel ou commercial) et obtenez une liste en langage clair des clauses risquées, abusives ou manquantes — chacune signalée en rouge / orange / vert, citée de votre document, avec les questions à poser avant de signer.",
    proBadge: "PRO",
    drop: "Glissez-déposez un PDF de bail ici, ou cliquez pour choisir",
    choose: "Choisir le PDF du bail",
    extracting: "Lecture du bail…",
    pagesChars: (p: number, c: number) => `${p} page${p > 1 ? "s" : ""} · ${c.toLocaleString()} caractères`,
    noText: "Aucun texte sélectionnable trouvé. S'agit-il d'un bail numérisé ? Appliquez d'abord l'OCR.",
    tooLong: `Ce bail dépasse la limite de ${MAX_CHARS.toLocaleString()} caractères ; seule la première partie sera analysée.`,
    analyze: "Rechercher les clauses problématiques",
    analyzing: "Analyse en cours…",
    result: (n: number) => `${n} clause${n > 1 ? "s" : ""} à examiner`,
    noRisks: "Aucune clause problématique évidente n'a été détectée. Cela ne garantit pas que le bail est équitable — lisez-le intégralement et envisagez de consulter un avocat.",
    disclaimer: "Il s'agit d'une analyse automatisée destinée à aider les locataires à repérer les clauses méritant attention. Elle ne constitue pas un conseil juridique. Pour toute question importante, consultez un avocat ou une association de défense des droits des locataires.",
    levelHigh: "Élevé", levelMedium: "Moyen", levelLow: "Faible",
    quoteLabel: "Extrait de votre bail",
    verifiedBadge: "Vérifié dans le document",
    notLocated: "Signalé comme protection absente ou manquante (aucun extrait).",
    unverifiedQuote: "La citation est introuvable dans votre bail ; elle a été masquée.",
    whyLabel: "Pourquoi c'est important",
    suggestionLabel: "Ce qu'il faut demander",
    reset: "Analyser un autre bail",
    errPrefix: "Impossible de terminer l'analyse : ",
    retry: "Réessayer",
    privacy: "Votre bail est lu dans votre navigateur ; seul le texte extrait est envoyé pour analyse.",
  },
  ja: {
    title: "賃貸契約レッドフラグ診断",
    subtitle:
      "賃貸契約書（住宅・事業用）をアップロードすると、リスクのある条項・不公平な条項・欠けている条項を分かりやすく一覧にします。各項目を赤／黄／緑で表示し、契約書から該当箇所を引用したうえで、署名前に確認すべき点をお伝えします。",
    proBadge: "PRO",
    drop: "賃貸契約書 PDF をここにドラッグ＆ドロップ、またはクリックして選択",
    choose: "賃貸契約書 PDF を選択",
    extracting: "契約書を読み取り中…",
    pagesChars: (p: number, c: number) => `${p} ページ · ${c.toLocaleString()} 文字`,
    noText: "選択可能なテキストが見つかりません。スキャンした契約書ですか？先にOCRをかけてください。",
    tooLong: `この契約書は ${MAX_CHARS.toLocaleString()} 文字の上限を超えています——先頭部分のみがレビューされます。`,
    analyze: "レッドフラグをスキャン",
    analyzing: "レビュー中…",
    result: (n: number) => `${n}件の指摘を確認`,
    noRisks: "明確なレッドフラグは見つかりませんでした。契約が公正である保証ではありません——全文を読み、弁護士の確認もご検討ください。",
    disclaimer: "これは、借主が注意すべき条項を見つける手助けをする自動レビューです。法的助言ではありません。重要な点は弁護士や借主支援団体にご相談ください。",
    levelHigh: "高", levelMedium: "中", levelLow: "低",
    quoteLabel: "あなたの契約書より",
    verifiedBadge: "出典と照合済み",
    notLocated: "欠落している保護として指摘（引用なし）。",
    unverifiedQuote: "引用された箇所を契約書内で確認できなかったため、非表示にしました。",
    whyLabel: "なぜ重要か",
    suggestionLabel: "確認すべきこと",
    reset: "別の契約書をスキャン",
    errPrefix: "スキャンを完了できませんでした: ",
    retry: "再試行",
    privacy: "契約書はブラウザ内で読み込まれ、分析には抽出されたテキストのみが送られます。",
  },
  de: {
    title: "Mietvertrag-Warnsignalprüfung",
    subtitle:
      "Laden Sie einen Mietvertrag hoch – Wohn- oder Gewerbemietvertrag – und erhalten Sie eine verständliche Liste riskanter, einseitiger oder fehlender Klauseln: jede in Rot / Gelb / Grün markiert, aus Ihrem Dokument zitiert, mit den Fragen, die Sie vor der Unterschrift stellen sollten.",
    proBadge: "PRO",
    drop: "Ziehen Sie ein Mietvertrags-PDF hierher oder klicken Sie zum Auswählen",
    choose: "Mietvertrags-PDF auswählen",
    extracting: "Mietvertrag wird gelesen…",
    pagesChars: (p: number, c: number) => `${p} Seiten · ${c.toLocaleString()} Zeichen`,
    noText: "Kein auswählbarer Text gefunden. Ist dies ein gescannter Mietvertrag? Führen Sie zuerst OCR aus.",
    tooLong: `Dieser Mietvertrag überschreitet das Limit von ${MAX_CHARS.toLocaleString()} Zeichen – nur der erste Teil wird geprüft.`,
    analyze: "Auf Warnsignale prüfen",
    analyzing: "Prüfung läuft…",
    result: (n: number) => `${n} Punkt${n === 1 ? "" : "e"} zur Prüfung`,
    noRisks: "Es wurden keine eindeutigen Warnsignale gefunden. Das ist keine Garantie, dass der Mietvertrag fair ist – lesen Sie ihn vollständig und ziehen Sie eine anwaltliche Prüfung in Betracht.",
    disclaimer: "Dies ist eine automatisierte Prüfung, die Mietern hilft, beachtenswerte Klauseln zu erkennen. Sie ist keine Rechtsberatung. Ziehen Sie bei wichtigen Angelegenheiten einen Anwalt oder eine Mietervereinigung hinzu.",
    levelHigh: "Hoch", levelMedium: "Mittel", levelLow: "Niedrig",
    quoteLabel: "Aus Ihrem Mietvertrag",
    verifiedBadge: "Mit der Quelle abgeglichen",
    notLocated: "Als fehlender/nicht vorhandener Schutz markiert (kein Zitat).",
    unverifiedQuote: "Ein zitierter Auszug ließ sich in Ihrem Mietvertrag nicht auffinden und wurde daher ausgeblendet.",
    whyLabel: "Warum es wichtig ist",
    suggestionLabel: "Was Sie fragen sollten",
    reset: "Weiteren Mietvertrag prüfen",
    errPrefix: "Die Prüfung konnte nicht abgeschlossen werden: ",
    retry: "Erneut versuchen",
    privacy: "Ihr Mietvertrag wird in Ihrem Browser gelesen; nur der extrahierte Text wird zur Analyse gesendet.",
  },
  ko: {
    title: "임대차 위험 신호 점검",
    subtitle:
      "주거용이든 상업용이든 임대차 계약서를 업로드하면 위험하거나 불공정하거나 빠진 조항을 쉬운 말로 정리한 목록을 받습니다 — 빨강/노랑/초록으로 표시되고, 문서에서 인용되며, 서명 전에 무엇을 물어야 할지 알려 줍니다.",
    proBadge: "PRO",
    drop: "임대차 계약서 PDF를 여기로 끌어다 놓거나 클릭해 선택하세요",
    choose: "임대차 계약서 PDF 선택",
    extracting: "임대차 계약서를 읽는 중…",
    pagesChars: (p: number, c: number) => `${p}페이지 · ${c.toLocaleString()}자`,
    noText: "선택 가능한 텍스트를 찾을 수 없습니다. 스캔한 계약서인가요? 먼저 OCR을 실행하세요.",
    tooLong: `이 계약서는 ${MAX_CHARS.toLocaleString()}자 한도를 넘어 — 앞부분만 검토됩니다.`,
    analyze: "위험 신호 점검",
    analyzing: "검토 중…",
    result: (n: number) => `검토할 항목 ${n}개`,
    noRisks: "뚜렷한 위험 신호는 발견되지 않았습니다. 그렇다고 계약이 공정하다는 보장은 아니니 전문을 읽고 변호사 검토도 고려하세요.",
    disclaimer: "이것은 임차인이 주의할 조항을 찾도록 돕는 자동 검토입니다. 법률 자문이 아닙니다. 중요한 사안은 변호사나 임차인 권익 단체와 상담하세요.",
    levelHigh: "높음", levelMedium: "중간", levelLow: "낮음",
    quoteLabel: "임대차 계약서에서 인용",
    verifiedBadge: "원문과 대조 확인됨",
    notLocated: "누락된/없는 보호 조항으로 표시됨(인용 없음).",
    unverifiedQuote: "인용한 구절을 임대차 계약서에서 찾을 수 없어 숨겼습니다.",
    whyLabel: "왜 중요한가",
    suggestionLabel: "무엇을 물어야 하나",
    reset: "다른 계약서 점검",
    errPrefix: "점검을 완료하지 못했습니다: ",
    retry: "다시 시도",
    privacy: "임대차 계약서는 브라우저에서 읽으며, 추출된 텍스트만 분석을 위해 전송됩니다.",
  },
} satisfies Record<AuthoredLocale, typeof _en>;

const LEVEL_ORDER: Record<RiskLevel, number> = { high: 0, medium: 1, low: 2 };
const LEVEL_STYLE: Record<RiskLevel, { dot: string; chip: string; border: string }> = {
  high: { dot: "#f87171", chip: "rgba(248,113,113,0.14)", border: "rgba(248,113,113,0.4)" },
  medium: { dot: "#f59e0b", chip: "rgba(245,158,11,0.14)", border: "rgba(245,158,11,0.4)" },
  low: { dot: "#34d399", chip: "rgba(52,211,153,0.14)", border: "rgba(52,211,153,0.35)" },
};

type Phase = "idle" | "extracting" | "ready" | "analyzing" | "done";

const SECTIONS: Record<AuthoredLocale, ToolSectionsContent> = {
  en: {
    benefitsTitle: "What the lease scan gives you",
    benefitsDescription: "An AI read of your rental agreement that surfaces the clauses worth a second look — before you sign.",
    benefits: [
      { title: "Risky clauses flagged in plain words", description: "The AI reads the whole lease and calls out unfair, one-sided, or unusual terms — auto-renewal traps, blanket repair liability, lopsided penalties — in language you don't need a lawyer to follow." },
      { title: "Sorted red / amber / green by severity", description: "Each finding is rated high, medium, or low, so you can see at a glance which clauses are deal-breakers and which are just worth a question." },
      { title: "Each red flag points to its source clause", description: "When the AI can locate the exact wording, it shows the quoted passage with a 'Verified against source' badge; a quote it can't pin down is hidden rather than guessed at." },
    ],
    workflowTitle: "How the lease check fits before you sign",
    workflowDescription: "For the moment a landlord hands you a lease and you have days, not weeks, to decide what to push back on.",
    steps: [
      "Upload your lease PDF — residential or commercial.",
      "The AI analyzes the document's text and flags risky, unfair, or missing clauses.",
      "Read the rated findings, the quoted source clause, and what to ask before you sign.",
    ],
    readingTitle: "More AI document review tools",
    readingDescription: "Related AI reviewers and the resource hub for getting more from your documents.",
    readingLinks: [
      { label: "Contract risk review", href: "/contract-risk", description: "Run the same kind of clause-by-clause risk read on any contract, not just a lease." },
      { label: "Bid & tender matrix", href: "/govbid-matrix", description: "Turn a tender or RFP into a structured requirements matrix you can answer point by point." },
      { label: "Document resource hub", href: "/resources", description: "A structured hub for PDF tools, conversion, and AI document workflows." },
    ],
  },
  zh: {
    benefitsTitle: "租约扫描能给你什么",
    benefitsDescription: "用 AI 通读你的租约,在签字前把值得再看一眼的条款挑出来。",
    benefits: [
      { title: "白话标出风险条款", description: "AI 通读整份租约,把不公平、单方面或异常的条款指出来——自动续约陷阱、全部维修责任、畸轻畸重的违约金——用你不需要律师就能看懂的话讲清楚。" },
      { title: "按严重程度分红/黄/绿", description: "每条都标为高、中、低等级,一眼就能看出哪些是硬伤、哪些只是值得问一句。" },
      { title: "每个红旗都指向原文条款", description: "当 AI 能定位到确切措辞时,会附上引用的原文并打上「已核对原文」标记;无法定位的引文会被隐藏,而不是猜一个。" },
    ],
    workflowTitle: "租约检查如何融入签字前的流程",
    workflowDescription: "当房东把租约递给你,而你只有几天、没有几周来决定该争取改哪些条款时。",
    steps: [
      "上传你的租约 PDF——住宅或商业均可。",
      "AI 分析文档文字,标出有风险、不公平或缺失的条款。",
      "查看分级结果、引用的原文条款,以及签字前该问什么。",
    ],
    readingTitle: "更多 AI 文档审查工具",
    readingDescription: "相关的 AI 审查工具,以及让文档发挥更大价值的资源中心。",
    readingLinks: [
      { label: "合同风险审查", href: "/contract-risk", description: "对任何合同做同样的逐条风险通读,不限于租约。" },
      { label: "招投标矩阵", href: "/govbid-matrix", description: "把招标书或 RFP 转成结构化的需求矩阵,逐条作答。" },
      { label: "文档资源中心", href: "/resources", description: "按工作流整理的 PDF 工具、转换和 AI 文档路径中心。" },
    ],
  },
  es: {
    benefitsTitle: "Lo que te da el análisis del arrendamiento",
    benefitsDescription: "Una lectura con IA de tu contrato de arrendamiento que destaca las cláusulas que merecen una segunda mirada, antes de firmar.",
    benefits: [
      { title: "Cláusulas riesgosas señaladas en lenguaje claro", description: "La IA lee todo el contrato y marca los términos injustos, unilaterales o inusuales —trampas de renovación automática, responsabilidad total de reparaciones, penalizaciones desproporcionadas— en un lenguaje que no necesita abogado." },
      { title: "Ordenadas en rojo / ámbar / verde por gravedad", description: "Cada hallazgo se califica como alto, medio o bajo, para que veas de un vistazo qué cláusulas son inaceptables y cuáles solo merecen una pregunta." },
      { title: "Cada alerta apunta a su cláusula de origen", description: "Cuando la IA puede localizar la redacción exacta, muestra el pasaje citado con un sello «Verificado con el original»; una cita que no puede ubicar se oculta en lugar de inventarse." },
    ],
    workflowTitle: "Cómo encaja el análisis antes de firmar",
    workflowDescription: "Para cuando un arrendador te entrega un contrato y tienes días, no semanas, para decidir qué objetar.",
    steps: [
      "Sube el PDF de tu arrendamiento, residencial o comercial.",
      "La IA analiza el texto del documento y señala cláusulas riesgosas, injustas o ausentes.",
      "Lee los hallazgos calificados, la cláusula de origen citada y qué preguntar antes de firmar.",
    ],
    readingTitle: "Más herramientas de revisión de documentos con IA",
    readingDescription: "Revisores con IA relacionados y el centro de recursos para sacar más de tus documentos.",
    readingLinks: [
      { label: "Revisión de riesgos de contratos", href: "/contract-risk", description: "Haz la misma lectura de riesgo cláusula por cláusula en cualquier contrato, no solo un arrendamiento." },
      { label: "Matriz de licitaciones", href: "/govbid-matrix", description: "Convierte una licitación o RFP en una matriz de requisitos estructurada que puedes responder punto por punto." },
      { label: "Centro de recursos de documentos", href: "/resources", description: "Un centro estructurado de herramientas PDF, conversión y flujos de documentos con IA." },
    ],
  },
  pt: {
    benefitsTitle: "O que a análise do contrato de aluguel oferece",
    benefitsDescription: "Uma leitura com IA do seu contrato de aluguel que destaca as cláusulas que merecem um segundo olhar, antes de assinar.",
    benefits: [
      { title: "Cláusulas arriscadas sinalizadas em linguagem simples", description: "A IA lê todo o contrato e aponta termos injustos, unilaterais ou incomuns — armadilhas de renovação automática, responsabilidade total por reparos, multas desproporcionais — em linguagem que dispensa advogado." },
      { title: "Ordenadas em vermelho / âmbar / verde por gravidade", description: "Cada achado é classificado como alto, médio ou baixo, para você ver de relance quais cláusulas são inaceitáveis e quais apenas merecem uma pergunta." },
      { title: "Cada alerta aponta para a cláusula de origem", description: "Quando a IA consegue localizar o texto exato, ela mostra o trecho citado com um selo «Verificado no original»; uma citação que não consegue localizar é ocultada em vez de adivinhada." },
    ],
    workflowTitle: "Como a análise se encaixa antes de assinar",
    workflowDescription: "Para quando um locador entrega um contrato e você tem dias, não semanas, para decidir o que contestar.",
    steps: [
      "Envie o PDF do seu contrato de aluguel — residencial ou comercial.",
      "A IA analisa o texto do documento e sinaliza cláusulas arriscadas, injustas ou ausentes.",
      "Leia os achados classificados, a cláusula de origem citada e o que perguntar antes de assinar.",
    ],
    readingTitle: "Mais ferramentas de revisão de documentos com IA",
    readingDescription: "Revisores com IA relacionados e o hub de recursos para aproveitar melhor seus documentos.",
    readingLinks: [
      { label: "Revisão de riscos de contrato", href: "/contract-risk", description: "Faça a mesma leitura de risco cláusula por cláusula em qualquer contrato, não só num aluguel." },
      { label: "Matriz de licitações", href: "/govbid-matrix", description: "Transforme um edital ou RFP em uma matriz de requisitos estruturada para responder ponto a ponto." },
      { label: "Hub de recursos de documentos", href: "/resources", description: "Um hub estruturado de ferramentas PDF, conversão e fluxos de documentos com IA." },
    ],
  },
  fr: {
    benefitsTitle: "Ce que l'analyse du bail vous apporte",
    benefitsDescription: "Une lecture par IA de votre bail qui met en évidence les clauses méritant un second regard, avant de signer.",
    benefits: [
      { title: "Clauses à risque signalées en langage clair", description: "L'IA lit l'intégralité du bail et repère les clauses injustes, déséquilibrées ou inhabituelles — pièges de reconduction tacite, responsabilité totale des réparations, pénalités disproportionnées — dans un langage sans jargon juridique." },
      { title: "Triées en rouge / orange / vert selon la gravité", description: "Chaque point est noté élevé, moyen ou faible, pour voir d'un coup d'œil les clauses rédhibitoires et celles qui méritent simplement une question." },
      { title: "Chaque alerte renvoie à sa clause d'origine", description: "Quand l'IA localise la formulation exacte, elle affiche le passage cité avec une mention « Vérifié dans le document » ; une citation qu'elle ne peut situer est masquée plutôt que devinée." },
    ],
    workflowTitle: "Comment l'analyse s'intègre avant la signature",
    workflowDescription: "Pour le moment où un bailleur vous remet un bail et où vous avez des jours, pas des semaines, pour décider quoi contester.",
    steps: [
      "Téléversez le PDF de votre bail — résidentiel ou commercial.",
      "L'IA analyse le texte du document et signale les clauses risquées, injustes ou manquantes.",
      "Lisez les points notés, la clause d'origine citée et les questions à poser avant de signer.",
    ],
    readingTitle: "Plus d'outils de revue de documents par IA",
    readingDescription: "Outils de revue par IA associés et le hub de ressources pour tirer plus de vos documents.",
    readingLinks: [
      { label: "Analyse des risques d'un contrat", href: "/contract-risk", description: "Faites la même lecture de risque clause par clause sur tout contrat, pas seulement un bail." },
      { label: "Matrice d'appels d'offres", href: "/govbid-matrix", description: "Transformez un appel d'offres ou un RFP en une matrice d'exigences structurée à traiter point par point." },
      { label: "Hub de ressources documentaires", href: "/resources", description: "Un hub structuré d'outils PDF, de conversion et de parcours documentaires IA." },
    ],
  },
  ja: {
    benefitsTitle: "賃貸契約スキャンでわかること",
    benefitsDescription: "賃貸契約書を AI が通読し、署名前にもう一度見ておくべき条項を浮かび上がらせます。",
    benefits: [
      { title: "リスク条項を分かりやすく指摘", description: "AI が契約書全体を読み、不公平・一方的・異例な条項——自動更新の落とし穴、修繕責任の全面負担、不均衡な違約金——を、弁護士なしでも分かる言葉で示します。" },
      { title: "深刻度を赤／黄／緑で分類", description: "各指摘を高・中・低で評価。どの条項が致命的で、どれが一言確認すれば済むものか、ひと目で分かります。" },
      { title: "各レッドフラグが該当条項を指し示す", description: "AI が正確な文言を特定できる場合は、引用箇所を「出典と照合済み」バッジ付きで表示します。特定できない引用は推測せず非表示にします。" },
    ],
    workflowTitle: "署名前の流れにどう組み込むか",
    workflowDescription: "貸主から契約書を渡され、何を交渉すべきか数週間ではなく数日で決めなければならないときに。",
    steps: [
      "賃貸契約書の PDF をアップロード——住宅用でも事業用でも。",
      "AI が文書のテキストを分析し、リスクのある・不公平な・欠けている条項を指摘します。",
      "評価された指摘、引用された該当条項、署名前に確認すべき点を読みます。",
    ],
    readingTitle: "他の AI 文書レビューツール",
    readingDescription: "関連する AI レビューツールと、文書をより活かすためのリソースハブ。",
    readingLinks: [
      { label: "契約リスクレビュー", href: "/contract-risk", description: "賃貸契約に限らず、あらゆる契約書を同じように条項ごとにリスク通読します。" },
      { label: "入札・提案マトリクス", href: "/govbid-matrix", description: "入札書や RFP を構造化された要件マトリクスに変換し、項目ごとに回答できます。" },
      { label: "文書リソースハブ", href: "/resources", description: "PDF ツール、変換、AI 文書ワークフローを整理したハブ。" },
    ],
  },
  de: {
    benefitsTitle: "Was Ihnen die Mietvertragsprüfung bietet",
    benefitsDescription: "Eine KI-Lesung Ihres Mietvertrags, die die Klauseln hervorhebt, die einen zweiten Blick wert sind – bevor Sie unterschreiben.",
    benefits: [
      { title: "Riskante Klauseln in einfachen Worten markiert", description: "Die KI liest den gesamten Mietvertrag und weist auf unfaire, einseitige oder ungewöhnliche Bedingungen hin – Fallen bei der automatischen Verlängerung, pauschale Reparaturhaftung, unausgewogene Vertragsstrafen – in einer Sprache, für die Sie keinen Anwalt brauchen." },
      { title: "Nach Schweregrad in Rot / Gelb / Grün sortiert", description: "Jeder Befund wird mit Hoch, Mittel oder Niedrig bewertet, sodass Sie auf einen Blick sehen, welche Klauseln ein Ausschlusskriterium sind und welche nur eine Nachfrage wert sind." },
      { title: "Jedes Warnsignal verweist auf seine Klausel", description: "Wenn die KI den genauen Wortlaut auffinden kann, zeigt sie die zitierte Stelle mit dem Hinweis „Mit der Quelle abgeglichen“; ein Zitat, das sie nicht eindeutig zuordnen kann, wird ausgeblendet statt erraten." },
    ],
    workflowTitle: "Wie die Mietvertragsprüfung vor der Unterschrift hineinpasst",
    workflowDescription: "Für den Moment, in dem ein Vermieter Ihnen einen Mietvertrag vorlegt und Sie Tage, nicht Wochen, haben, um zu entscheiden, was Sie nachverhandeln.",
    steps: [
      "Laden Sie Ihr Mietvertrags-PDF hoch – Wohn- oder Gewerbemietvertrag.",
      "Die KI analysiert den Text des Dokuments und markiert riskante, unfaire oder fehlende Klauseln.",
      "Lesen Sie die bewerteten Befunde, die zitierte Klausel und die Fragen, die Sie vor der Unterschrift stellen sollten.",
    ],
    readingTitle: "Weitere KI-Tools zur Dokumentenprüfung",
    readingDescription: "Verwandte KI-Prüftools und der Ressourcen-Hub, um mehr aus Ihren Dokumenten herauszuholen.",
    readingLinks: [
      { label: "Vertrags-Risikoprüfung", href: "/contract-risk", description: "Führen Sie dieselbe klauselweise Risikoprüfung für jeden Vertrag durch, nicht nur für einen Mietvertrag." },
      { label: "Ausschreibungs-Matrix", href: "/govbid-matrix", description: "Verwandeln Sie eine Ausschreibung oder ein RFP in eine strukturierte Anforderungsmatrix, die Sie Punkt für Punkt beantworten können." },
      { label: "Dokumenten-Ressourcen-Hub", href: "/resources", description: "Ein strukturierter Hub für PDF-Tools, Konvertierung und KI-Dokumenten-Workflows." },
    ],
  },
  ko: {
    benefitsTitle: "임대차 점검이 무엇을 제공하나요",
    benefitsDescription: "AI가 임대차 계약서를 읽고, 서명 전에 한 번 더 살펴볼 가치가 있는 조항을 짚어 줍니다.",
    benefits: [
      { title: "위험 조항을 쉬운 말로 표시", description: "AI가 계약서 전체를 읽고 불공정하거나 한쪽에 치우치거나 이례적인 조건 — 자동 갱신 함정, 전면적 수선 책임, 불균형한 위약금 — 을 변호사 없이도 이해할 수 있는 말로 짚어 줍니다." },
      { title: "심각도에 따라 빨강 / 노랑 / 초록으로 정렬", description: "각 결과는 높음·중간·낮음으로 평가되어, 어떤 조항이 치명적이고 어떤 조항이 한 번 물어볼 만한 수준인지 한눈에 알 수 있습니다." },
      { title: "각 위험 신호가 해당 출처 조항을 가리킵니다", description: "AI가 정확한 문구를 찾을 수 있으면 인용 구절을 「원문과 대조 확인됨」 배지와 함께 표시합니다. 위치를 특정할 수 없는 인용은 추측하지 않고 숨깁니다." },
    ],
    workflowTitle: "임대차 점검이 서명 전 흐름에 어떻게 맞물리나요",
    workflowDescription: "임대인이 계약서를 건넸는데, 무엇을 다시 협상할지 몇 주가 아니라 며칠 안에 정해야 하는 순간을 위한 기능입니다.",
    steps: [
      "임대차 계약서 PDF를 업로드하세요 — 주거용이든 상업용이든.",
      "AI가 문서의 텍스트를 분석해 위험하거나 불공정하거나 빠진 조항을 표시합니다.",
      "평가된 결과, 인용된 출처 조항, 서명 전에 물어볼 점을 읽어 보세요.",
    ],
    readingTitle: "더 많은 AI 문서 검토 도구",
    readingDescription: "관련 AI 검토 도구와, 문서를 더 잘 활용하기 위한 자료 허브입니다.",
    readingLinks: [
      { label: "계약 위험 검토", href: "/contract-risk", description: "임대차뿐 아니라 어떤 계약서에도 동일한 조항별 위험 검토를 실행합니다." },
      { label: "입찰·제안 매트릭스", href: "/govbid-matrix", description: "입찰서나 RFP를 항목별로 답할 수 있는 구조화된 요건 매트릭스로 바꿉니다." },
      { label: "문서 자료 허브", href: "/resources", description: "PDF 도구, 변환, AI 문서 워크플로를 정리한 구조화된 허브입니다." },
    ],
  },
};

export function LeaseRedflagClient({ locale = "en", embedded = false }: { locale?: Locale; embedded?: boolean }) {
  // ko is fully authored (STR/SECTIONS carry Korean). zh-Hant derives from zh via deepHant.
  const al: AuthoredLocale = locale === "zh-Hant" ? "en" : locale;
  const t = locale === "zh-Hant" ? deepHant(STR.zh) : STR[al];
  const sec: ToolSectionsContent = locale === "zh-Hant" ? deepHant(SECTIONS.zh) : SECTIONS[al];
  // zh-Hant rendered from zh via OpenCC; child components (UploadDropzone /
  // UpgradePrompt / ToolFaq / encryptedPdfMessage) lack zh-Hant in their union,
  // so map it to "zh" for those props.
  // ko has no engine/runtime copy yet → English (foundation phase); zh-Hant preserved.
  const childLocale = locale; // shared widgets accept zh-Hant (Traditional derived via OpenCC)
  const [phase, setPhase] = useState<Phase>("idle");
  const [fileName, setFileName] = useState("");
  const [text, setText] = useState("");
  const [pages, setPages] = useState(0);
  const [risks, setRisks] = useState<Risk[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [limitHit, setLimitHit] = useState<number | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [fileSizeMb, setFileSizeMb] = useState<number>(0);

  const levelLabel = useMemo(
    () => ({ high: t.levelHigh, medium: t.levelMedium, low: t.levelLow }),
    [t],
  );

  const reset = () => {
    setPhase("idle");
    setFileName("");
    setText("");
    setPages(0);
    setRisks(null);
    setError(null);
    setLimitHit(null);
    setThumbnailUrl(null);
    setFileSizeMb(0);
  };

  const onFile = useCallback(
    async (file: File) => {
      if (!file || (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"))) return;
      setError(null);
      setRisks(null);
      setLimitHit(null);
      setFileName(file.name);
      setFileSizeMb(Math.round((file.size / 1024 / 1024) * 100) / 100);
      setPhase("extracting");
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const data = new Uint8Array(await file.arrayBuffer());
        const doc = await pdfjs.getDocument({ data }).promise;
        try {
          const thumb = await doc.getPage(1);
          const vp = thumb.getViewport({ scale: 0.4 });
          const thumbCanvas = document.createElement("canvas");
          thumbCanvas.width = vp.width; thumbCanvas.height = vp.height;
          const ctx = thumbCanvas.getContext("2d");
          if (ctx) await thumb.render({ canvas: thumbCanvas, canvasContext: ctx, viewport: vp }).promise;
          setThumbnailUrl(thumbCanvas.toDataURL("image/jpeg", 0.7));
        } catch { /* non-critical */ }
        let out = "";
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const content = await page.getTextContent();
          out += content.items.map((it) => ("str" in it ? it.str : "")).join(" ") + "\n\n";
        }
        const trimmed = out.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
        setPages(doc.numPages);
        try { doc.destroy(); } catch { /* ignore */ }
        if (!trimmed) {
          setError(t.noText);
          setPhase("idle");
          return;
        }
        setText(trimmed);
        setPhase("ready");
      } catch (e) {
        setError(encryptedPdfMessage(e, childLocale) ?? ((e instanceof Error ? e.message : String(e)) || "Could not read PDF."));
        setPhase("idle");
      }
    },
    [t, locale, childLocale],
  );

  const onAnalyze = useCallback(async () => {
    if (!text) return;
    setPhase("analyzing");
    setError(null);
    setLimitHit(null);
    try {
      const gate = await checkUsage("contractAnalyzer");
      if (!gate.allowed) {
        setLimitHit(gate.limit);
        setPhase("ready");
        return;
      }
      const auth = await authHeader();
      const res = await fetch("/api/lease-redflag", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...auth },
        body: JSON.stringify({ text, locale }),
      });
      const data = await res.json().catch(() => ({}));
      if (data?.ok && Array.isArray(data.risks)) {
        const sorted = (data.risks as Risk[]).slice().sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]);
        setRisks(sorted);
        setPhase("done");
        trackToolRun("lease-redflag");
        await markUsage(gate, "contractAnalyzer");
      } else {
        setError(t.errPrefix + (data?.message || "Unknown error."));
        setPhase("ready");
      }
    } catch (e) {
      setError(t.errPrefix + (e instanceof Error ? e.message : String(e)));
      setPhase("ready");
    }
  }, [text, locale, t]);

  const card = "rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)]";

  return (
    <div className={embedded ? "mx-auto w-full max-w-3xl px-8 pb-10 pt-4" : `mx-auto ${LAYOUT.content} px-5 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20`}>
      {!embedded && (
        <>
          <div className="flex items-center gap-2">
            <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{t.title}</h1>
            <span className="rounded-full border border-[color:var(--accent)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[color:var(--accent)]">{t.proBadge}</span>
          </div>
          <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.subtitle}</p>
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
                ? "这份租约，先免费把红旗条款标出来"
                : locale === "es" ? "Este arrendamiento — que la IA identifique las cláusulas problemáticas."
                : locale === "pt" ? "Este contrato de arrendamento — que a IA identifique cláusulas problemáticas."
                : locale === "fr" ? "Ce bail — que l'IA identifie les clauses problématiques."
                : locale === "ja" ? "この賃貸契約書——AIが問題条項を洗い出します。"
                : locale === "de" ? "Dieser Mietvertrag — KI markiert die problematischen Klauseln."
                : locale === "ko" ? "이 임대계약서——AI가 위험 조항을 찾아드립니다."
                : "This lease — let AI flag the problematic clauses before you sign."
            }
          />
        </div>
      )}

      {phase === "idle" || phase === "extracting" ? (
        <>
          <UploadDropzone locale={childLocale} buttonLabel={t.choose} busy={phase === "extracting"} busyLabel={t.extracting} privacy={false} onFile={onFile} />
          {embedded && <WorkspaceValueZone type="ai" locale={childLocale} />}
        </>
      ) : (
        <div className={`${card} mt-8 p-5`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              {thumbnailUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={thumbnailUrl} alt="Page 1" className="h-24 max-w-[160px] w-auto object-contain shrink-0 rounded border border-[color:var(--line)]" />
              )}
              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold text-[color:var(--foreground)]">{fileName}</p>
                <p className="text-[12.5px] text-[color:var(--muted)]">{t.pagesChars(pages, text.length)}</p>
                {fileSizeMb > 0 && <p className="text-[11.5px] text-[color:var(--faint)]">{fileSizeMb} MB</p>}
              </div>
            </div>
            <button type="button" onClick={reset} className="shrink-0 text-[13px] font-medium text-[color:var(--muted)] hover:text-[color:var(--foreground)]">{t.reset}</button>
          </div>
          {text.length > MAX_CHARS && <p className="mt-2 text-[12px] text-[#f59e0b]">{t.tooLong}</p>}
          <div className="mt-5">
            <button type="button" onClick={onAnalyze} disabled={phase === "analyzing"} className="inline-flex h-10 items-center rounded-[var(--radius)] bg-[color:var(--accent)] px-6 text-[14px] font-semibold text-white transition hover:opacity-90 disabled:opacity-60">
              {phase === "analyzing" ? t.analyzing : t.analyze}
            </button>
          </div>
          <p className="mt-3 text-[11.5px] text-[color:var(--faint)]">{t.privacy}</p>
        </div>
      )}

      {error && (
        <div role="alert" className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">
          <span>{error}</span>
          {phase === "ready" && (
            <button type="button" onClick={onAnalyze} className="shrink-0 rounded border border-[rgba(248,113,113,0.4)] px-3 py-1 text-[12px] font-semibold transition hover:bg-[rgba(248,113,113,0.1)]">
              {t.retry}
            </button>
          )}
        </div>
      )}

      {limitHit !== null && <UpgradePrompt locale={childLocale === "ko" ? "en" : childLocale} limit={limitHit} />}

      {phase === "analyzing" && (
        <div className="mt-6 space-y-3" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="animate-pulse rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-[color:var(--surface-subtle)]" />
                <div className="h-5 w-14 rounded bg-[color:var(--surface-subtle)]" />
                <div className="h-5 w-32 rounded bg-[color:var(--surface-subtle)]" />
              </div>
              <div className="mt-3 space-y-2">
                <div className="h-3.5 w-full rounded bg-[color:var(--surface-subtle)]" />
                <div className="h-3.5 w-4/5 rounded bg-[color:var(--surface-subtle)]" />
              </div>
              <div className="mt-3 h-12 rounded bg-[color:var(--surface-subtle)] opacity-60" />
            </div>
          ))}
        </div>
      )}

      {risks && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{t.result(risks.length)}</span>
          </div>

          {risks.length === 0 ? (
            <div className={`${card} p-5 text-[13.5px] text-[color:var(--muted)]`}>{t.noRisks}</div>
          ) : (
            <ul className="grid gap-3">
              {risks.map((r, i) => {
                const s = LEVEL_STYLE[r.level];
                return (
                  <li key={i} className="rounded-[var(--radius-lg)] border bg-[color:var(--surface)] p-4" style={{ borderColor: s.border }}>
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.dot }} />
                      <span className="rounded px-2 py-0.5 text-[11px] font-semibold" style={{ background: s.chip, color: s.dot }}>{levelLabel[r.level]}</span>
                      <span className="text-[14px] font-semibold text-[color:var(--foreground)]">{r.type}</span>
                    </div>
                    <p className="mt-2.5 text-[13.5px] leading-relaxed text-[color:var(--foreground)]"><span className="text-[color:var(--muted)]">{t.whyLabel}: </span>{r.why}</p>
                    {r.suggestion && (
                      <p className="mt-1.5 text-[13.5px] leading-relaxed text-[color:var(--foreground)]"><span className="text-[color:var(--muted)]">{t.suggestionLabel}: </span>{r.suggestion}</p>
                    )}
                    {r.quote ? (
                      <div className="mt-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(52,211,153,0.12)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#34d399]">✓ {t.verifiedBadge}</span>
                        <blockquote className="mt-2 border-l-2 border-[color:var(--line-strong)] pl-3 text-[12.5px] italic leading-relaxed text-[color:var(--muted)]">
                          <span className="mb-1 block text-[10px] font-semibold uppercase not-italic tracking-[0.1em] text-[color:var(--faint)]">{t.quoteLabel}</span>
                          "{r.quote}"
                        </blockquote>
                      </div>
                    ) : r.missing ? (
                      <p className="mt-2 text-[12px] text-[color:var(--faint)]">{t.notLocated}</p>
                    ) : (
                      <p className="mt-2 text-[12px] text-[color:var(--faint)]">{t.unverifiedQuote}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <p className="mt-4 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-4 py-3 text-[12px] leading-relaxed text-[color:var(--muted)]">
            🏠 {t.disclaimer}
          </p>
        </div>
      )}

      {!embedded && <ToolSections locale={locale} content={sec} />}
      {!embedded && <ToolFaq tool="lease-redflag" locale={childLocale} />}
    </div>
  );
}
