"use client";

import { ToolFaq } from "@/components/ToolFaq";
import { ToolSections, type ToolSectionsContent } from "@/components/ToolSections";
import { GroundingNote, groundingFaq } from "@/components/GroundingNote";
import { RelatedPdfTools } from "@/components/RelatedPdfTools";
import { UploadDropzone } from "@/components/UploadDropzone";
import { encryptedPdfMessage } from "@/lib/pdf-errors";
import { checkUsage, markUsage } from "@/lib/usage-gate";
import { UpgradePrompt } from "@/components/ui/UpgradePrompt";
import { authHeader } from "@/lib/supabase";
import { deepHant } from "@/lib/zh-hant";
import { trackToolRun } from "@/lib/track";

import { useCallback, useMemo, useState } from "react";

type Locale = "en" | "zh" | "es" | "pt" | "fr" | "ja" | "zh-Hant";
type RiskLevel = "high" | "medium" | "low";
type Risk = { type: string; level: RiskLevel; quote: string | null; why: string; suggestion: string; missing?: boolean; unverified?: boolean };

const MAX_CHARS = 24_000;

const STR = {
  en: {
    title: "Contract Risk Check",
    subtitle:
      "Upload a contract and get a plain-language list of risky, one-sided, or missing clauses — each flagged red / amber / green, quoted from your document, with what to ask before you sign.",
    proBadge: "PRO",
    drop: "Drag & drop a contract PDF here, or click to choose",
    choose: "Choose contract PDF",
    extracting: "Reading contract…",
    pagesChars: (p: number, c: number) => `${p} pages · ${c.toLocaleString()} characters`,
    noText: "No selectable text found. Is this a scanned contract? Run OCR first.",
    tooLong: `This contract is longer than the ${MAX_CHARS.toLocaleString()}-character limit — only the first part will be reviewed.`,
    analyze: "Check for risks",
    analyzing: "Reviewing…",
    result: (n: number) => `${n} point${n === 1 ? "" : "s"} to review`,
    noRisks: "No clear risk clauses were flagged. That's not a guarantee the contract is safe — read it in full.",
    disclaimer: "This is an automated review to help you spot clauses worth attention. It is not legal advice. For anything important, consult a lawyer.",
    levelHigh: "High", levelMedium: "Medium", levelLow: "Low",
    quoteLabel: "From your contract",
    verifiedBadge: "Verified against source",
    notLocated: "Flagged as a missing/absent protection (no quote).",
    unverifiedQuote: "A cited quote couldn't be located in your document, so it was hidden.",
    whyLabel: "Why it matters",
    suggestionLabel: "What to ask",
    reset: "Check another",
    errPrefix: "Couldn't complete the review: ",
    retry: "Try again",
    privacy: "Your contract is read in your browser; only the extracted text is sent for analysis.",
  },
  zh: {
    title: "合同风险体检",
    subtitle:
      "上传合同,得到一份白话的风险清单——逐条标注 红/黄/绿 等级、引用合同原文、并告诉你签字前该问什么。",
    proBadge: "PRO",
    drop: "把合同 PDF 拖到这里,或点击选择",
    choose: "选择合同 PDF",
    extracting: "正在读取合同…",
    pagesChars: (p: number, c: number) => `${p} 页 · ${c.toLocaleString()} 字符`,
    noText: "没找到可选中的文字。是扫描件吗?请先用 OCR。",
    tooLong: `合同超过 ${MAX_CHARS.toLocaleString()} 字符上限,只会分析前面的部分。`,
    analyze: "检查风险",
    analyzing: "正在审查…",
    result: (n: number) => `${n} 个需要注意的点`,
    noRisks: "没有标出明显的风险条款。这不代表合同一定安全——请完整阅读。",
    disclaimer: "这是帮你发现值得注意条款的自动审查,不构成法律意见。重要事项请咨询律师。",
    levelHigh: "高", levelMedium: "中", levelLow: "低",
    quoteLabel: "合同原文",
    verifiedBadge: "已核对原文",
    notLocated: "标记为缺失/没有的保护条款(无原文)。",
    unverifiedQuote: "引文无法在原文中定位，已隐藏。",
    whyLabel: "为什么要注意",
    suggestionLabel: "该问什么",
    reset: "检查另一份",
    errPrefix: "审查未能完成:",
    retry: "重试",
    privacy: "合同在你的浏览器中读取,只有提取出的文字会被发送去分析。",
  },
  es: {
    title: "Revisión de riesgos del contrato",
    subtitle:
      "Sube un contrato y obtén una lista en lenguaje claro de cláusulas riesgosas, unilaterales o ausentes: cada una marcada en rojo / ámbar / verde, citada de tu documento, con qué preguntar antes de firmar.",
    proBadge: "PRO",
    drop: "Arrastra un PDF de contrato aquí, o haz clic para elegir",
    choose: "Elegir PDF del contrato",
    extracting: "Leyendo el contrato…",
    pagesChars: (p: number, c: number) => `${p} páginas · ${c.toLocaleString()} caracteres`,
    noText: "No se encontró texto seleccionable. ¿Es un contrato escaneado? Aplica OCR primero.",
    tooLong: `El contrato supera el límite de ${MAX_CHARS.toLocaleString()} caracteres; solo se revisará la primera parte.`,
    analyze: "Revisar riesgos",
    analyzing: "Revisando…",
    result: (n: number) => `${n} punto${n === 1 ? "" : "s"} para revisar`,
    noRisks: "No se marcaron cláusulas de riesgo claras. Eso no garantiza que el contrato sea seguro: léelo completo.",
    disclaimer: "Esta es una revisión automatizada para ayudarte a detectar cláusulas que merecen atención. No es asesoramiento legal. Para algo importante, consulta a un abogado.",
    levelHigh: "Alto", levelMedium: "Medio", levelLow: "Bajo",
    quoteLabel: "De tu contrato",
    verifiedBadge: "Verificado con el original",
    notLocated: "Marcada como protección ausente (sin cita).",
    unverifiedQuote: "No se pudo localizar la cita en tu documento; se ocultó.",
    whyLabel: "Por qué importa",
    suggestionLabel: "Qué preguntar",
    reset: "Revisar otro",
    errPrefix: "No se pudo completar la revisión: ",
    retry: "Reintentar",
    privacy: "Tu contrato se lee en tu navegador; solo se envía el texto extraído para analizarlo.",
  },
  pt: {
    title: "Verificação de riscos do contrato",
    subtitle:
      "Envie um contrato e receba uma lista em linguagem simples de cláusulas arriscadas, unilaterais ou ausentes — cada uma marcada em vermelho / âmbar / verde, citada do seu documento, com o que perguntar antes de assinar.",
    proBadge: "PRO",
    drop: "Arraste um PDF de contrato aqui, ou clique para escolher",
    choose: "Escolher PDF do contrato",
    extracting: "Lendo o contrato…",
    pagesChars: (p: number, c: number) => `${p} páginas · ${c.toLocaleString()} caracteres`,
    noText: "Nenhum texto selecionável encontrado. É um contrato digitalizado? Execute o OCR primeiro.",
    tooLong: `O contrato ultrapassa o limite de ${MAX_CHARS.toLocaleString()} caracteres; apenas a primeira parte será revisada.`,
    analyze: "Verificar riscos",
    analyzing: "Revisando…",
    result: (n: number) => `${n} ponto${n === 1 ? "" : "s"} para revisar`,
    noRisks: "Nenhuma cláusula de risco clara foi sinalizanda. Isso não garante que o contrato seja seguro — leia-o na íntegra.",
    disclaimer: "Esta é uma revisão automatizada para ajudá-lo a identificar cláusulas que merecem atenção. Não constitui aconselhamento jurídico. Para assuntos importantes, consulte um advogado.",
    levelHigh: "Alto", levelMedium: "Médio", levelLow: "Baixo",
    quoteLabel: "Do seu contrato",
    verifiedBadge: "Verificado no original",
    notLocated: "Sinalizada como proteção ausente/inexistente (sem citação).",
    unverifiedQuote: "A citação não pôde ser localizada no seu documento; foi ocultada.",
    whyLabel: "Por que importa",
    suggestionLabel: "O que perguntar",
    reset: "Verificar outro",
    errPrefix: "Não foi possível concluir a revisão: ",
    retry: "Tentar novamente",
    privacy: "Seu contrato é lido no seu navegador; apenas o texto extraído é enviado para análise.",
  },
  fr: {
    title: "Analyse des risques du contrat",
    subtitle:
      "Déposez un contrat et obtenez une liste en langage clair des clauses risquées, déséquilibrées ou absentes — chacune signalée en rouge / orange / vert, citée depuis votre document, avec les questions à poser avant de signer.",
    proBadge: "PRO",
    drop: "Glissez-déposez un PDF de contrat ici, ou cliquez pour choisir",
    choose: "Choisir un PDF de contrat",
    extracting: "Lecture du contrat…",
    pagesChars: (p: number, c: number) => `${p} page${p > 1 ? "s" : ""} · ${c.toLocaleString()} caractères`,
    noText: "Aucun texte sélectionnable trouvé. S'agit-il d'un contrat scanné ? Appliquez d'abord l'OCR.",
    tooLong: `Ce contrat dépasse la limite de ${MAX_CHARS.toLocaleString()} caractères — seule la première partie sera analysée.`,
    analyze: "Vérifier les risques",
    analyzing: "Analyse en cours…",
    result: (n: number) => `${n} point${n > 1 ? "s" : ""} à examiner`,
    noRisks: "Aucune clause à risque évidente n'a été détectée. Cela ne garantit pas que le contrat est sans risque — lisez-le intégralement.",
    disclaimer: "Il s'agit d'une analyse automatisée destinée à vous aider à repérer les clauses méritant attention. Elle ne constitue pas un conseil juridique. Pour toute question importante, consultez un avocat.",
    levelHigh: "Élevé", levelMedium: "Moyen", levelLow: "Faible",
    quoteLabel: "Extrait de votre contrat",
    verifiedBadge: "Vérifié dans le document",
    notLocated: "Signalé comme protection absente ou manquante (pas de citation).",
    unverifiedQuote: "La citation est introuvable dans votre document ; elle a été masquée.",
    whyLabel: "Pourquoi c'est important",
    suggestionLabel: "Ce qu'il faut demander",
    reset: "Analyser un autre",
    errPrefix: "Impossible de terminer l'analyse : ",
    retry: "Réessayer",
    privacy: "Votre contrat est lu dans votre navigateur ; seul le texte extrait est transmis pour l'analyse.",
  },
  ja: {
    title: "契約リスク診断",
    subtitle:
      "契約書をアップロードすると、リスクのある条項・一方的な条項・欠けている条項を分かりやすく一覧にします。各項目を赤／黄／緑で重要度表示し、契約書から該当箇所を引用したうえで、署名前に確認すべき点をお伝えします。",
    proBadge: "PRO",
    drop: "契約書 PDF をここにドラッグ＆ドロップ、またはクリックして選択",
    choose: "契約書 PDF を選択",
    extracting: "契約書を読み込んでいます…",
    pagesChars: (p: number, c: number) => `${p} ページ · ${c.toLocaleString()} 文字`,
    noText: "選択できるテキストが見つかりませんでした。スキャンした契約書ですか？まず OCR を実行してください。",
    tooLong: `この契約書は ${MAX_CHARS.toLocaleString()} 文字の上限を超えています。先頭部分のみを分析します。`,
    analyze: "リスクを診断",
    analyzing: "確認しています…",
    result: (n: number) => `確認すべきポイント ${n} 件`,
    noRisks: "明確なリスク条項は見つかりませんでした。これは契約書が安全であることを保証するものではありません。必ず全文をお読みください。",
    disclaimer: "本診断は、注意すべき条項を見つけるお手伝いをする自動レビューであり、法的助言ではありません。重要な事項は弁護士にご相談ください。",
    levelHigh: "高", levelMedium: "中", levelLow: "低",
    quoteLabel: "契約書からの引用",
    verifiedBadge: "原文と照合済み",
    notLocated: "欠けている保護条項として指摘（引用なし）。",
    unverifiedQuote: "引用箇所を本文中で確認できなかったため、非表示にしました。",
    whyLabel: "重要な理由",
    suggestionLabel: "確認すべきこと",
    reset: "別の契約書を診断",
    errPrefix: "レビューを完了できませんでした: ",
    retry: "再試行",
    privacy: "契約書はお使いのブラウザ内で読み込まれ、抽出されたテキストのみが分析のために送信されます。",
  },
};

const LEVEL_ORDER: Record<RiskLevel, number> = { high: 0, medium: 1, low: 2 };
const LEVEL_STYLE: Record<RiskLevel, { dot: string; chip: string; border: string }> = {
  high: { dot: "#f87171", chip: "rgba(248,113,113,0.14)", border: "rgba(248,113,113,0.4)" },
  medium: { dot: "#f59e0b", chip: "rgba(245,158,11,0.14)", border: "rgba(245,158,11,0.4)" },
  low: { dot: "#34d399", chip: "rgba(52,211,153,0.14)", border: "rgba(52,211,153,0.35)" },
};

type Phase = "idle" | "extracting" | "ready" | "analyzing" | "done";

const SECTIONS: Record<"en" | "zh" | "es" | "pt" | "fr" | "ja", ToolSectionsContent> = {
  en: {
    benefitsTitle: "What the contract review gives you",
    benefitsDescription: "The AI reads the full contract text and surfaces the clauses worth a second look before you sign.",
    benefits: [
      { title: "Risky clauses, in plain words", description: "Auto-renewal, one-sided indemnity, unlimited liability, lopsided termination — each unusual or aggressive clause is explained in everyday language, not legalese." },
      { title: "Every flag points to its clause", description: "Each finding is shown with the exact passage it came from, verified against your document; when a quote can't be located in the text, it's hidden rather than guessed." },
      { title: "Red / amber / green triage", description: "Findings are ranked by severity and paired with a concrete question to ask before signing, so you know what to negotiate first." },
    ],
    workflowTitle: "How a contract check fits your work",
    workflowDescription: "For the moment you're handed an agreement and need to know where the traps are before it lands on your desk for signature.",
    steps: [
      "Upload the contract PDF — its text is extracted and sent for analysis.",
      "The AI flags risky, one-sided, or missing clauses and quotes each from your document.",
      "Review the red/amber/green list with the question to raise for each point.",
    ],
    readingTitle: "More AI document review tools",
    readingDescription: "Related tools for reading contracts, leases, and tenders with traceable findings.",
    readingLinks: [
      { label: "Lease red-flag check", href: "/lease-redflag", description: "The same clause-by-clause review tuned for rental and lease agreements." },
      { label: "Government bid analyzer", href: "/govbid-matrix", description: "Turn a tender document into a structured requirements matrix you can act on." },
      { label: "AI document resources", href: "/resources", description: "A structured hub for AI review, OCR, conversion, and other document workflows." },
    ],
  },
  zh: {
    benefitsTitle: "这份合同审查能给你什么",
    benefitsDescription: "AI 通读全文,在你签字前把值得再看一眼的条款挑出来。",
    benefits: [
      { title: "用白话讲清风险条款", description: "自动续约、单方面赔偿、无限责任、失衡的解约条款——每条异常或激进的条款都用日常语言解释,而不是法言法语。" },
      { title: "每个风险都指向对应原文", description: "每条结论都附上它出自的原文段落,并与你的文档核对;当引文无法在正文中定位时,会被隐藏而不是凭空生成。" },
      { title: "红/黄/绿 分级排查", description: "结论按严重程度排序,并配上一句签字前该问的具体问题,让你知道先谈哪一条。" },
    ],
    workflowTitle: "合同审查如何融入你的工作",
    workflowDescription: "当一份协议递到你手上、需要在它送去签字前弄清陷阱在哪里时。",
    steps: [
      "上传合同 PDF——提取其中的文字并发送去分析。",
      "AI 标出有风险、单方面或缺失的条款,并逐条引用你文档中的原文。",
      "对照红/黄/绿清单逐项查看,每条都附有该提出的问题。",
    ],
    readingTitle: "更多 AI 文档审查工具",
    readingDescription: "审查合同、租约和招标文件、结论可溯源的相关工具。",
    readingLinks: [
      { label: "租约红旗体检", href: "/lease-redflag", description: "同样的逐条审查,针对租赁与租约协议做了调整。" },
      { label: "政府招标分析", href: "/govbid-matrix", description: "把一份招标文件变成可执行的结构化需求矩阵。" },
      { label: "AI 文档资源", href: "/resources", description: "按工作流整理 AI 审查、OCR、转换等文档路径的资源中心。" },
    ],
  },
  es: {
    benefitsTitle: "Qué te da la revisión del contrato",
    benefitsDescription: "La IA lee todo el texto del contrato y destaca las cláusulas que conviene revisar antes de firmar.",
    benefits: [
      { title: "Cláusulas riesgosas, en lenguaje claro", description: "Renovación automática, indemnización unilateral, responsabilidad ilimitada, terminación desequilibrada: cada cláusula inusual o agresiva se explica en lenguaje cotidiano, no jurídico." },
      { title: "Cada alerta apunta a su cláusula", description: "Cada hallazgo se muestra con el pasaje exacto del que proviene, verificado en tu documento; si una cita no se localiza en el texto, se oculta en lugar de inventarse." },
      { title: "Triaje rojo / ámbar / verde", description: "Los hallazgos se ordenan por gravedad y se acompañan de una pregunta concreta para hacer antes de firmar, así sabes qué negociar primero." },
    ],
    workflowTitle: "Cómo encaja la revisión en tu trabajo",
    workflowDescription: "Para cuando recibes un acuerdo y necesitas saber dónde están las trampas antes de que llegue a tu mesa para firmar.",
    steps: [
      "Sube el PDF del contrato: se extrae su texto y se envía para analizarlo.",
      "La IA marca cláusulas riesgosas, unilaterales o ausentes y cita cada una de tu documento.",
      "Revisa la lista roja/ámbar/verde con la pregunta a plantear en cada punto.",
    ],
    readingTitle: "Más herramientas de revisión con IA",
    readingDescription: "Herramientas relacionadas para leer contratos, arrendamientos y licitaciones con hallazgos rastreables.",
    readingLinks: [
      { label: "Revisión de alertas de arrendamiento", href: "/lease-redflag", description: "La misma revisión cláusula por cláusula adaptada a contratos de alquiler y arrendamiento." },
      { label: "Analizador de licitaciones", href: "/govbid-matrix", description: "Convierte un pliego de licitación en una matriz de requisitos estructurada y accionable." },
      { label: "Recursos de documentos con IA", href: "/resources", description: "Un centro estructurado de revisión con IA, OCR, conversión y otros flujos documentales." },
    ],
  },
  pt: {
    benefitsTitle: "O que a revisão do contrato oferece",
    benefitsDescription: "A IA lê todo o texto do contrato e destaca as cláusulas que merecem uma segunda olhada antes de você assinar.",
    benefits: [
      { title: "Cláusulas arriscadas, em linguagem simples", description: "Renovação automática, indenização unilateral, responsabilidade ilimitada, rescisão desequilibrada: cada cláusula incomum ou agressiva é explicada em linguagem do dia a dia, não jurídica." },
      { title: "Cada alerta aponta para sua cláusula", description: "Cada achado é mostrado com o trecho exato de onde veio, verificado no seu documento; quando uma citação não pode ser localizada no texto, ela é ocultada em vez de inventada." },
      { title: "Triagem vermelho / âmbar / verde", description: "Os achados são ordenados por gravidade e acompanhados de uma pergunta concreta para fazer antes de assinar, para você saber o que negociar primeiro." },
    ],
    workflowTitle: "Como a revisão se encaixa no seu trabalho",
    workflowDescription: "Para quando você recebe um acordo e precisa saber onde estão as armadilhas antes de ele chegar à sua mesa para assinatura.",
    steps: [
      "Envie o PDF do contrato: o texto é extraído e enviado para análise.",
      "A IA sinaliza cláusulas arriscadas, unilaterais ou ausentes e cita cada uma do seu documento.",
      "Revise a lista vermelho/âmbar/verde com a pergunta a levantar em cada ponto.",
    ],
    readingTitle: "Mais ferramentas de revisão com IA",
    readingDescription: "Ferramentas relacionadas para ler contratos, locações e licitações com achados rastreáveis.",
    readingLinks: [
      { label: "Verificação de alertas de locação", href: "/lease-redflag", description: "A mesma revisão cláusula por cláusula ajustada para contratos de aluguel e locação." },
      { label: "Analisador de licitações", href: "/govbid-matrix", description: "Transforme um edital de licitação em uma matriz de requisitos estruturada e acionável." },
      { label: "Recursos de documentos com IA", href: "/resources", description: "Um hub estruturado de revisão com IA, OCR, conversão e outros fluxos documentais." },
    ],
  },
  fr: {
    benefitsTitle: "Ce que l'analyse du contrat vous apporte",
    benefitsDescription: "L'IA lit l'intégralité du texte du contrat et fait ressortir les clauses à examiner avant de signer.",
    benefits: [
      { title: "Les clauses à risque, en clair", description: "Reconduction automatique, indemnisation déséquilibrée, responsabilité illimitée, résiliation inéquitable : chaque clause inhabituelle ou agressive est expliquée en langage courant, pas en jargon juridique." },
      { title: "Chaque alerte renvoie à sa clause", description: "Chaque constat est présenté avec le passage exact dont il provient, vérifié dans votre document ; lorsqu'une citation est introuvable dans le texte, elle est masquée plutôt que devinée." },
      { title: "Tri rouge / orange / vert", description: "Les constats sont classés par gravité et accompagnés d'une question concrète à poser avant de signer, pour savoir quoi négocier en priorité." },
    ],
    workflowTitle: "Comment l'analyse s'intègre à votre travail",
    workflowDescription: "Pour le moment où on vous remet un accord et où vous devez savoir où sont les pièges avant qu'il arrive sur votre bureau pour signature.",
    steps: [
      "Déposez le PDF du contrat : son texte est extrait et envoyé pour analyse.",
      "L'IA signale les clauses risquées, déséquilibrées ou absentes et cite chacune depuis votre document.",
      "Parcourez la liste rouge/orange/vert avec la question à soulever pour chaque point.",
    ],
    readingTitle: "Plus d'outils d'analyse de documents par IA",
    readingDescription: "Outils associés pour lire contrats, baux et appels d'offres avec des constats traçables.",
    readingLinks: [
      { label: "Analyse des alertes de bail", href: "/lease-redflag", description: "La même analyse clause par clause adaptée aux contrats de location et baux." },
      { label: "Analyseur d'appels d'offres", href: "/govbid-matrix", description: "Transformez un dossier d'appel d'offres en une matrice d'exigences structurée et exploitable." },
      { label: "Ressources documentaires IA", href: "/resources", description: "Un hub structuré d'analyse IA, d'OCR, de conversion et d'autres parcours documentaires." },
    ],
  },
  ja: {
    benefitsTitle: "契約レビューで得られること",
    benefitsDescription: "AI が契約書の全文を読み取り、署名前に見直す価値のある条項を浮かび上がらせます。",
    benefits: [
      { title: "リスク条項を分かりやすく", description: "自動更新、一方的な補償、無制限責任、不均衡な解約条項——異常・攻撃的な条項を一つひとつ、法律用語ではなく日常の言葉で説明します。" },
      { title: "各指摘は該当条項を示す", description: "各指摘には、その出どころとなった本文の該当箇所が添えられ、あなたの文書と照合されます。引用箇所が本文中で確認できない場合は、推測せず非表示にします。" },
      { title: "赤／黄／緑の重要度分け", description: "指摘は重大度順に並び、署名前に確認すべき具体的な質問が添えられるので、まず何を交渉すべきか分かります。" },
    ],
    workflowTitle: "契約チェックが業務にどう役立つか",
    workflowDescription: "契約書を渡され、署名のために手元に来る前に落とし穴がどこにあるかを知っておきたいとき。",
    steps: [
      "契約書 PDF をアップロード——そのテキストが抽出され、分析のために送信されます。",
      "AI がリスクのある・一方的な・欠けている条項を指摘し、それぞれをあなたの文書から引用します。",
      "赤／黄／緑の一覧を、各項目で確認すべき質問とともに見直します。",
    ],
    readingTitle: "他の AI 文書レビューツール",
    readingDescription: "契約書・賃貸借契約・入札文書を、たどれる指摘付きで読むための関連ツール。",
    readingLinks: [
      { label: "賃貸借レッドフラグ診断", href: "/lease-redflag", description: "同じ条項ごとのレビューを、賃貸・リース契約向けに調整したもの。" },
      { label: "入札文書アナライザー", href: "/govbid-matrix", description: "入札文書を、実務で使える構造化された要件マトリクスに変換します。" },
      { label: "AI 文書リソース", href: "/resources", description: "AI レビュー、OCR、変換などの文書ワークフローを整理したハブ。" },
    ],
  },
};

export function ContractRiskClient({ locale = "en" }: { locale?: Locale }) {
  const t = locale === "zh-Hant" ? deepHant(STR.zh) : (STR[locale] ?? STR.en);
  const sec: ToolSectionsContent = locale === "zh-Hant" ? deepHant(SECTIONS.zh) : (SECTIONS[locale] ?? SECTIONS.en);
  // zh-Hant is rendered from zh via OpenCC; child components below
  // (UploadDropzone / UpgradePrompt / ToolFaq / encryptedPdfMessage) don't
  // accept zh-Hant in their Locale union, so map it to "zh" for those props.
  const childLocale = locale; // shared widgets accept zh-Hant (Traditional derived via OpenCC)
  const [phase, setPhase] = useState<Phase>("idle");
  const [fileName, setFileName] = useState("");
  const [text, setText] = useState("");
  const [pages, setPages] = useState(0);
  const [risks, setRisks] = useState<Risk[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [limitHit, setLimitHit] = useState<number | null>(null);

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
  };

  const onFile = useCallback(
    async (file: File) => {
      if (!file || (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"))) return;
      setError(null);
      setRisks(null);
      setLimitHit(null);
      setFileName(file.name);
      setPhase("extracting");
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const data = new Uint8Array(await file.arrayBuffer());
        const doc = await pdfjs.getDocument({ data }).promise;
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
      const res = await fetch("/api/contract-risk", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...auth },
        body: JSON.stringify({ text, locale }),
      });
      const data = await res.json().catch(() => ({}));
      if (data?.ok && Array.isArray(data.risks)) {
        const sorted = (data.risks as Risk[]).slice().sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]);
        setRisks(sorted);
        setPhase("done");
        trackToolRun("contract-risk");
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

  // JSON-LD for both the en (/contract-risk/) and localized (/zh|/es… ) routes —
  // this page has no shared-template config, so the schema is emitted here so it
  // ships on every route that renders this client. FAQPage carries the source-
  // grounding fact so an answer engine can cite how the review stays anchored.
  const schemaPath = locale === "en" ? "/contract-risk/" : `/${locale}/contract-risk/`;
  const schemaHome = locale === "en" ? "https://dockdocs.app/" : `https://dockdocs.app/${locale}/`;
  const schemaUrl = `https://dockdocs.app${schemaPath}`;
  const groundQa = groundingFaq("contract", locale);
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${schemaUrl}#app`,
        name: "DockDocs Contract Risk Check",
        url: schemaUrl,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description: t.subtitle,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "FAQPage",
        "@id": `${schemaUrl}#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: groundQa.question,
            acceptedAnswer: { "@type": "Answer", text: groundQa.answer },
          },
        ],
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${schemaUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "DockDocs", item: schemaHome },
          { "@type": "ListItem", position: 2, name: t.title, item: schemaUrl },
        ],
      },
    ],
  };

  return (
    <div className="mx-auto max-w-5xl px-5 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="flex items-center gap-2">
        <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{t.title}</h1>
        <span className="rounded-full border border-[color:var(--accent)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[color:var(--accent)]">{t.proBadge}</span>
      </div>
      <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.subtitle}</p>

      {phase === "idle" || phase === "extracting" ? (
        <UploadDropzone locale={childLocale} buttonLabel={t.choose} busy={phase === "extracting"} busyLabel={t.extracting} privacy={false} onFile={onFile} />
      ) : (
        <div className={`${card} mt-8 p-5`}>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold text-[color:var(--foreground)]">{fileName}</p>
              <p className="text-[12.5px] text-[color:var(--muted)]">{t.pagesChars(pages, text.length)}</p>
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

      {limitHit !== null && <UpgradePrompt locale={childLocale} limit={limitHit} />}

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
                          “{r.quote}”
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
            ⚖️ {t.disclaimer}
          </p>
        </div>
      )}

      <GroundingNote variant="contract" locale={locale} />
      <RelatedPdfTools locale={locale} exclude="/contract-risk" />
      <ToolSections locale={locale} content={sec} />
      <ToolFaq tool="contract-risk" locale={childLocale} />
    </div>
  );
}
