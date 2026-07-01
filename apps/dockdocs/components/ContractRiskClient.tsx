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
import { appendWorkHistory } from "@/lib/work-history";
import { TrialCta } from "@/components/TrialCta";
import type { RouteLocale, AuthoredLocale, AuthoredCopy } from "@/lib/i18n";
import { LAYOUT } from "@/lib/layout-constants";

import { useCallback, useMemo, useState } from "react";

type Locale = RouteLocale;
type RiskLevel = "high" | "medium" | "low";
type Risk = { type: string; level: RiskLevel; quote: string | null; why: string; suggestion: string; missing?: boolean; unverified?: boolean };
type ContractTypeInfo = { detected: string; confidence: "high" | "medium" | "low" };
type TypeSpecificItem = { item: string; found: boolean; note?: string };
// Honest coverage of a long contract, returned by /api/contract-risk so the UI can
// show "analyzed X/Y pages" and never imply a false "all clear".
type Coverage = { coveredChars: number; totalChars: number; analyzedChunks: number; totalChunks: number; failedChunks: number; capped: boolean };

// Locate a verified quote inside the raw contract text for the "find in source"
// jump. Exact match first, then whitespace-tolerant (the server verifies quotes
// after collapsing whitespace, so the raw text may differ only in spacing).
// Returns null if it can't be placed.
function locateQuote(text: string, quote: string): { start: number; end: number } | null {
  const q = quote.trim();
  if (!q) return null;
  const exact = text.indexOf(q);
  if (exact >= 0) return { start: exact, end: exact + q.length };
  const pattern = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
  try {
    const m = new RegExp(pattern, "i").exec(text);
    if (m) return { start: m.index, end: m.index + m[0].length };
  } catch {
    // pathological quote → give up gracefully
  }
  return null;
}

const _en = {
    title: "Contract Risk Check",
    subtitle:
      "Upload a contract and get a plain-language list of risky, one-sided, or missing clauses — each flagged red / amber / green, quoted from your document, with what to ask before you sign.",
    proBadge: "PRO",
    drop: "Drag & drop a contract PDF here, or click to choose",
    choose: "Choose contract PDF",
    extracting: "Reading contract…",
    pagesChars: (p: number, c: number) => `${p} pages · ${c.toLocaleString()} characters`,
    noText: "No selectable text found. Is this a scanned contract? Run OCR first.",
    coverageFull: (p: number) => `Analyzed the full document — all ${p} ${p === 1 ? "page" : "pages"}.`,
    coveragePartial: (c: number, p: number) => `Analyzed about ${c} of ${p} pages. The rest is beyond the current length limit and was not reviewed — this is not a full review.`,
    coverageFailed: "Some sections couldn't be analyzed, so this may be incomplete.",
    sourceTitle: "Contract text",
    findInSource: "Find in text",
    approxPage: (n: number) => `≈ p.${n}`,
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
    errServer: "Server error — please try again.",
    progressSending: "Sending to AI…",
    progressAnalyzing: "AI analyzing…",
    retry: "Try again",
    exportBtn: "Export report",
    privacy: "Your contract is read in your browser; only the extracted text is sent for analysis.",
    confidenceHigh: "high confidence",
    confidenceMedium: "medium confidence",
    confidenceLow: "low confidence",
    typeChecklist: "Type-specific checklist",
};

const STR = {
  en: _en,
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
    coverageFull: (p: number) => `已分析全文 —— 共 ${p} 页。`,
    coveragePartial: (c: number, p: number) => `已分析约 ${p} 页中的 ${c} 页;其余超出当前长度上限,未审查 —— 这不是完整审查。`,
    coverageFailed: "部分段落分析失败,结果可能不完整。",
    sourceTitle: "合同原文",
    findInSource: "在原文中定位",
    approxPage: (n: number) => `≈ 第 ${n} 页`,
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
    errServer: "服务器错误，请稍后重试。",
    progressSending: "发送给 AI…",
    progressAnalyzing: "AI 分析中…",
    retry: "重试",
    exportBtn: "导出报告",
    privacy: "合同在你的浏览器中读取,只有提取出的文字会被发送去分析。",
    confidenceHigh: "高置信度",
    confidenceMedium: "中置信度",
    confidenceLow: "低置信度",
    typeChecklist: "类型专属检查清单",
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
    coverageFull: (p: number) => `Se analizó el documento completo: ${p} ${p === 1 ? "página" : "páginas"}.`,
    coveragePartial: (c: number, p: number) => `Se analizaron unas ${c} de ${p} páginas. El resto supera el límite de longitud actual y no se revisó: no es una revisión completa.`,
    coverageFailed: "Algunas secciones no pudieron analizarse, por lo que puede estar incompleto.",
    sourceTitle: "Texto del contrato",
    findInSource: "Buscar en el texto",
    approxPage: (n: number) => `≈ pág. ${n}`,
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
    errServer: "Error del servidor — inténtalo de nuevo.",
    progressSending: "Enviando a IA…",
    progressAnalyzing: "IA analizando…",
    retry: "Reintentar",
    exportBtn: "Exportar informe",
    privacy: "Tu contrato se lee en tu navegador; solo se envía el texto extraído para analizarlo.",
    confidenceHigh: "confianza alta",
    confidenceMedium: "confianza media",
    confidenceLow: "confianza baja",
    typeChecklist: "Lista de verificación por tipo",
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
    coverageFull: (p: number) => `Analisado o documento inteiro: ${p} ${p === 1 ? "página" : "páginas"}.`,
    coveragePartial: (c: number, p: number) => `Analisadas cerca de ${c} de ${p} páginas. O restante ultrapassa o limite de tamanho atual e não foi revisado: não é uma revisão completa.`,
    coverageFailed: "Algumas seções não puderam ser analisadas, então pode estar incompleto.",
    sourceTitle: "Texto do contrato",
    findInSource: "Localizar no texto",
    approxPage: (n: number) => `≈ pág. ${n}`,
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
    errServer: "Erro no servidor — tente novamente.",
    progressSending: "Enviando à IA…",
    progressAnalyzing: "IA analisando…",
    retry: "Tentar novamente",
    exportBtn: "Exportar relatório",
    privacy: "Seu contrato é lido no seu navegador; apenas o texto extraído é enviado para análise.",
    confidenceHigh: "alta confiança",
    confidenceMedium: "confiança média",
    confidenceLow: "baixa confiança",
    typeChecklist: "Lista de verificação por tipo",
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
    coverageFull: (p: number) => `Document entier analysé — les ${p} ${p === 1 ? "page" : "pages"}.`,
    coveragePartial: (c: number, p: number) => `Environ ${c} pages sur ${p} analysées. Le reste dépasse la limite de longueur actuelle et n'a pas été examiné : ce n'est pas une analyse complète.`,
    coverageFailed: "Certaines sections n'ont pas pu être analysées ; le résultat peut être incomplet.",
    sourceTitle: "Texte du contrat",
    findInSource: "Trouver dans le texte",
    approxPage: (n: number) => `≈ p. ${n}`,
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
    errServer: "Erreur serveur — veuillez réessayer.",
    progressSending: "Envoi à l'IA…",
    progressAnalyzing: "Analyse IA en cours…",
    retry: "Réessayer",
    exportBtn: "Exporter le rapport",
    privacy: "Votre contrat est lu dans votre navigateur ; seul le texte extrait est transmis pour l'analyse.",
    confidenceHigh: "haute confiance",
    confidenceMedium: "confiance moyenne",
    confidenceLow: "faible confiance",
    typeChecklist: "Liste de vérification par type",
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
    coverageFull: (p: number) => `全文(${p} ページ)を分析しました。`,
    coveragePartial: (c: number, p: number) => `${p} ページ中およそ ${c} ページを分析しました。残りは現在の文字数上限を超えており未確認です。完全なレビューではありません。`,
    coverageFailed: "一部のセクションを分析できなかったため、結果が不完全な可能性があります。",
    sourceTitle: "契約書テキスト",
    findInSource: "本文で探す",
    approxPage: (n: number) => `≈ ${n} ページ`,
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
    errServer: "サーバーエラーが発生しました。再度お試しください。",
    progressSending: "AIに送信中…",
    progressAnalyzing: "AI分析中…",
    retry: "再試行",
    exportBtn: "レポートを書き出す",
    privacy: "契約書はお使いのブラウザ内で読み込まれ、抽出されたテキストのみが分析のために送信されます。",
    confidenceHigh: "確度：高",
    confidenceMedium: "確度：中",
    confidenceLow: "確度：低",
    typeChecklist: "種別別チェックリスト",
  },
  de: {
    title: "Vertrags-Risikoprüfung",
    subtitle:
      "Laden Sie einen Vertrag hoch und erhalten Sie eine verständliche Liste riskanter, einseitiger oder fehlender Klauseln – jede in Rot / Gelb / Grün markiert, aus Ihrem Dokument zitiert, mit den Fragen, die Sie vor der Unterschrift stellen sollten.",
    proBadge: "PRO",
    drop: "Ziehen Sie ein Vertrags-PDF hierher oder klicken Sie zum Auswählen",
    choose: "Vertrags-PDF auswählen",
    extracting: "Vertrag wird gelesen…",
    pagesChars: (p: number, c: number) => `${p} Seiten · ${c.toLocaleString()} Zeichen`,
    noText: "Kein auswählbarer Text gefunden. Ist dies ein gescannter Vertrag? Führen Sie zuerst OCR aus.",
    coverageFull: (p: number) => `Das gesamte Dokument analysiert – alle ${p} ${p === 1 ? "Seite" : "Seiten"}.`,
    coveragePartial: (c: number, p: number) => `Etwa ${c} von ${p} Seiten analysiert. Der Rest überschreitet das aktuelle Längenlimit und wurde nicht geprüft – keine vollständige Prüfung.`,
    coverageFailed: "Einige Abschnitte konnten nicht analysiert werden, daher ist das Ergebnis möglicherweise unvollständig.",
    sourceTitle: "Vertragstext",
    findInSource: "Im Text finden",
    approxPage: (n: number) => `≈ S. ${n}`,
    analyze: "Auf Risiken prüfen",
    analyzing: "Prüfung läuft…",
    result: (n: number) => `${n} Punkt${n === 1 ? "" : "e"} zur Prüfung`,
    noRisks: "Es wurden keine eindeutigen Risikoklauseln markiert. Das ist keine Garantie, dass der Vertrag sicher ist – lesen Sie ihn vollständig.",
    disclaimer: "Dies ist eine automatisierte Prüfung, die Ihnen hilft, beachtenswerte Klauseln zu erkennen. Sie ist keine Rechtsberatung. Ziehen Sie bei wichtigen Angelegenheiten einen Anwalt hinzu.",
    levelHigh: "Hoch", levelMedium: "Mittel", levelLow: "Niedrig",
    quoteLabel: "Aus Ihrem Vertrag",
    verifiedBadge: "Mit der Quelle abgeglichen",
    notLocated: "Als fehlender/nicht vorhandener Schutz markiert (kein Zitat).",
    unverifiedQuote: "Ein zitierter Auszug ließ sich in Ihrem Dokument nicht auffinden und wurde daher ausgeblendet.",
    whyLabel: "Warum es wichtig ist",
    suggestionLabel: "Was Sie fragen sollten",
    reset: "Weiteren prüfen",
    errPrefix: "Die Prüfung konnte nicht abgeschlossen werden: ",
    errServer: "Serverfehler — bitte erneut versuchen.",
    progressSending: "An KI senden…",
    progressAnalyzing: "KI analysiert…",
    retry: "Erneut versuchen",
    exportBtn: "Bericht exportieren",
    privacy: "Ihr Vertrag wird in Ihrem Browser gelesen; nur der extrahierte Text wird zur Analyse gesendet.",
    confidenceHigh: "hohe Gewissheit",
    confidenceMedium: "mittlere Gewissheit",
    confidenceLow: "niedrige Gewissheit",
    typeChecklist: "Typspezifische Checkliste",
  },
  ko: {
    title: "계약 위험 점검",
    subtitle:
      "계약서를 업로드하면 위험하거나 한쪽에 치우치거나 빠진 조항을 쉬운 말로 정리한 목록을 받습니다 — 각 항목은 빨강/노랑/초록으로 표시되고, 문서에서 인용되며, 서명 전에 무엇을 물어야 할지 알려 줍니다.",
    proBadge: "PRO",
    drop: "계약서 PDF를 여기로 끌어다 놓거나 클릭해 선택하세요",
    choose: "계약서 PDF 선택",
    extracting: "계약서를 읽는 중…",
    pagesChars: (p: number, c: number) => `${p}페이지 · ${c.toLocaleString()}자`,
    noText: "선택 가능한 텍스트를 찾을 수 없습니다. 스캔한 계약서인가요? 먼저 OCR을 실행하세요.",
    coverageFull: (p: number) => `전체 문서를 분석했습니다 — 총 ${p}페이지.`,
    coveragePartial: (c: number, p: number) => `약 ${p}페이지 중 ${c}페이지를 분석했습니다. 나머지는 현재 길이 한도를 넘어 검토되지 않았습니다 — 완전한 검토가 아닙니다.`,
    coverageFailed: "일부 구간을 분석하지 못해 결과가 불완전할 수 있습니다.",
    sourceTitle: "계약서 원문",
    findInSource: "원문에서 찾기",
    approxPage: (n: number) => `≈ ${n}페이지`,
    analyze: "위험 점검",
    analyzing: "검토 중…",
    result: (n: number) => `검토할 항목 ${n}개`,
    noRisks: "뚜렷한 위험 조항은 표시되지 않았습니다. 그렇다고 계약이 안전하다는 보장은 아니니 전문을 읽어 보세요.",
    disclaimer: "이것은 주의가 필요한 조항을 찾도록 돕는 자동 검토입니다. 법률 자문이 아닙니다. 중요한 사안은 변호사와 상담하세요.",
    levelHigh: "높음", levelMedium: "중간", levelLow: "낮음",
    quoteLabel: "계약서에서 인용",
    verifiedBadge: "원문과 대조 확인됨",
    notLocated: "누락된/없는 보호 조항으로 표시됨(인용 없음).",
    unverifiedQuote: "인용한 구절을 문서에서 찾을 수 없어 숨겼습니다.",
    whyLabel: "왜 중요한가",
    suggestionLabel: "무엇을 물어야 하나",
    reset: "다른 계약서 점검",
    errPrefix: "검토를 완료하지 못했습니다: ",
    errServer: "서버 오류 — 다시 시도해 주세요.",
    progressSending: "AI에 전송 중…",
    progressAnalyzing: "AI 분석 중…",
    retry: "다시 시도",
    exportBtn: "보고서 내보내기",
    privacy: "계약서는 브라우저에서 읽으며, 추출된 텍스트만 분석을 위해 전송됩니다.",
    confidenceHigh: "높은 신뢰도",
    confidenceMedium: "중간 신뢰도",
    confidenceLow: "낮은 신뢰도",
    typeChecklist: "유형별 점검 목록",
  },
} satisfies AuthoredCopy<typeof _en>;

const LEVEL_ORDER: Record<RiskLevel, number> = { high: 0, medium: 1, low: 2 };
const LEVEL_STYLE: Record<RiskLevel, { dot: string; chip: string; border: string }> = {
  high: { dot: "#f87171", chip: "rgba(248,113,113,0.14)", border: "rgba(248,113,113,0.4)" },
  medium: { dot: "#f59e0b", chip: "rgba(245,158,11,0.14)", border: "rgba(245,158,11,0.4)" },
  low: { dot: "#34d399", chip: "rgba(52,211,153,0.14)", border: "rgba(52,211,153,0.35)" },
};

type Phase = "idle" | "extracting" | "ready" | "analyzing" | "done";

const SECTIONS: Record<AuthoredLocale, ToolSectionsContent> = {
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
      "The AI flags risky, one-sided, or missing clauses — quoting the ones it can locate in your document, and noting the missing ones.",
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
      "AI 标出有风险、单方面或缺失的条款——能定位到原文的逐条引用，缺失类则标注为缺失。",
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
      "La IA marca cláusulas riesgosas, unilaterales o ausentes — citando de tu documento las que puede localizar y señalando las ausentes.",
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
      "A IA sinaliza cláusulas arriscadas, unilaterais ou ausentes — citando do seu documento as que consegue localizar e marcando as ausentes.",
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
      "L'IA signale les clauses risquées, déséquilibrées ou absentes — en citant depuis votre document celles qu'elle peut localiser et en indiquant les absentes.",
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
      "AI がリスクのある・一方的な・欠けている条項を指摘し、特定できたものはあなたの文書から引用し、欠けているものは「欠落」と明示します。",
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
  de: {
    benefitsTitle: "Was Ihnen die Vertragsprüfung bietet",
    benefitsDescription: "Die KI liest den gesamten Vertragstext und hebt die Klauseln hervor, die vor der Unterschrift einen zweiten Blick wert sind.",
    benefits: [
      { title: "Riskante Klauseln, in einfachen Worten", description: "Automatische Verlängerung, einseitige Freistellung, unbeschränkte Haftung, ungleiche Kündigung – jede ungewöhnliche oder aggressive Klausel wird in Alltagssprache erklärt, nicht im Juristendeutsch." },
      { title: "Jeder Hinweis verweist auf seine Klausel", description: "Jeder Befund wird mit der genauen Textstelle gezeigt, aus der er stammt, und mit Ihrem Dokument abgeglichen; lässt sich ein Zitat im Text nicht auffinden, wird es ausgeblendet statt erraten." },
      { title: "Einstufung in Rot / Gelb / Grün", description: "Die Befunde sind nach Schweregrad geordnet und mit einer konkreten Frage versehen, die Sie vor der Unterschrift stellen sollten – so wissen Sie, worüber Sie zuerst verhandeln." },
    ],
    workflowTitle: "Wie eine Vertragsprüfung in Ihre Arbeit passt",
    workflowDescription: "Für den Moment, in dem Ihnen ein Vertrag vorgelegt wird und Sie wissen müssen, wo die Fallstricke liegen, bevor er zur Unterschrift auf Ihrem Schreibtisch landet.",
    steps: [
      "Laden Sie das Vertrags-PDF hoch – sein Text wird extrahiert und zur Analyse gesendet.",
      "Die KI markiert riskante, einseitige oder fehlende Klauseln – sie zitiert die, die sie in Ihrem Dokument auffinden kann, und weist auf die fehlenden hin.",
      "Gehen Sie die Liste in Rot/Gelb/Grün durch, mit der Frage, die zu jedem Punkt anzusprechen ist.",
    ],
    readingTitle: "Weitere KI-Tools zur Dokumentenprüfung",
    readingDescription: "Verwandte Tools zum Lesen von Verträgen, Mietverträgen und Ausschreibungen mit nachvollziehbaren Befunden.",
    readingLinks: [
      { label: "Mietvertrag-Warnsignalprüfung", href: "/lease-redflag", description: "Dieselbe klauselweise Prüfung, abgestimmt auf Miet- und Pachtverträge." },
      { label: "Ausschreibungs-Analyse", href: "/govbid-matrix", description: "Verwandeln Sie eine Ausschreibungsunterlage in eine strukturierte, umsetzbare Anforderungsmatrix." },
      { label: "KI-Dokumentenressourcen", href: "/resources", description: "Ein strukturierter Hub für KI-Prüfung, OCR, Konvertierung und weitere Dokumenten-Workflows." },
    ],
  },
  ko: {
    benefitsTitle: "계약서 검토가 무엇을 제공하나요",
    benefitsDescription: "AI가 계약서 전문을 읽고 서명 전에 한 번 더 살펴볼 가치가 있는 조항을 짚어 줍니다.",
    benefits: [
      { title: "위험 조항을 쉬운 말로", description: "자동 갱신, 일방적 면책, 무제한 책임, 한쪽에 치우친 해지 — 이례적이거나 공격적인 조항을 법률 용어가 아니라 일상 언어로 설명합니다." },
      { title: "모든 표시는 해당 조항을 가리킵니다", description: "각 결과는 그 출처가 된 정확한 구절과 함께 표시되고 문서와 대조해 확인됩니다. 인용을 본문에서 찾을 수 없으면 추측하지 않고 숨깁니다." },
      { title: "빨강 / 노랑 / 초록 분류", description: "결과는 심각도순으로 정렬되고, 서명 전에 물어볼 구체적인 질문이 함께 제시되어 무엇부터 협상할지 알 수 있습니다." },
    ],
    workflowTitle: "계약서 점검이 업무에 어떻게 맞물리나요",
    workflowDescription: "계약서가 서명을 위해 책상에 오기 전에, 어디에 함정이 있는지 알아야 하는 순간을 위한 기능입니다.",
    steps: [
      "계약서 PDF를 업로드하세요 — 텍스트가 추출되어 분석을 위해 전송됩니다.",
      "AI가 위험하거나 한쪽에 치우치거나 빠진 조항을 표시합니다 — 문서에서 찾을 수 있는 것은 인용하고, 빠진 것은 기록합니다.",
      "각 항목마다 제기할 질문과 함께 빨강/노랑/초록 목록을 검토하세요.",
    ],
    readingTitle: "더 많은 AI 문서 검토 도구",
    readingDescription: "계약서, 임대차, 입찰 문서를 추적 가능한 결과와 함께 읽기 위한 관련 도구입니다.",
    readingLinks: [
      { label: "임대차 위험 신호 점검", href: "/lease-redflag", description: "임대차 계약에 맞춘 동일한 조항별 검토." },
      { label: "정부 입찰 분석", href: "/govbid-matrix", description: "입찰 문서를 실행 가능한 구조화된 요건 매트릭스로 바꿉니다." },
      { label: "AI 문서 자료", href: "/resources", description: "AI 검토, OCR, 변환 등 문서 워크플로를 정리한 허브입니다." },
    ],
  },
};

export function ContractRiskClient({ locale = "en", embedded = false }: { locale?: Locale; embedded?: boolean }) {
  // ko is fully authored (STR/SECTIONS carry Korean). zh-Hant derives from zh via deepHant.
  const al: AuthoredLocale = locale === "zh-Hant" ? "en" : locale;
  const t = locale === "zh-Hant" ? deepHant(STR.zh) : STR[al];
  const sec: ToolSectionsContent = locale === "zh-Hant" ? deepHant(SECTIONS.zh) : SECTIONS[al];
  // Shared widgets (UploadDropzone / UpgradePrompt / encryptedPdfMessage) accept zh-Hant
  // (Traditional derived via OpenCC) but not ko, so collapse only ko → en for those props.
  const childLocale = locale;
  const [phase, setPhase] = useState<Phase>("idle");
  const [fileName, setFileName] = useState("");
  const [text, setText] = useState("");
  const [pages, setPages] = useState(0);
  const [risks, setRisks] = useState<Risk[] | null>(null);
  const [coverage, setCoverage] = useState<Coverage | null>(null);
  const [flashIdx, setFlashIdx] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [limitHit, setLimitHit] = useState<number | null>(null);
  const [contractType, setContractType] = useState<ContractTypeInfo | null>(null);
  const [typeSpecificItems, setTypeSpecificItems] = useState<TypeSpecificItem[]>([]);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [fileSizeMb, setFileSizeMb] = useState<number>(0);
  const [pageDataUrls, setPageDataUrls] = useState<string[]>([]);
  const [progressStep, setProgressStep] = useState<string>("");

  const levelLabel = useMemo(
    () => ({ high: t.levelHigh, medium: t.levelMedium, low: t.levelLow }),
    [t],
  );

  // PR-3: locate each verified quote in the raw text so the user can jump to it.
  const locations = useMemo(
    () => (risks ? risks.map((r) => (r.quote ? locateQuote(text, r.quote) : null)) : []),
    [risks, text],
  );

  // Source-text view with located quotes highlighted, so a flagged clause can be
  // scrolled to and read in context.
  const sourceSegments = useMemo(() => {
    if (!text || !risks || risks.length === 0) return null;
    const ranges = locations
      .map((loc, i) => (loc ? { start: loc.start, end: loc.end, i } : null))
      .filter((x): x is { start: number; end: number; i: number } => x !== null)
      .sort((a, b) => a.start - b.start);
    const segs: Array<{ text: string; mark: number | null }> = [];
    let pos = 0;
    let lastEnd = -1;
    for (const r of ranges) {
      if (r.start < lastEnd) continue; // skip overlapping matches
      if (r.start > pos) segs.push({ text: text.slice(pos, r.start), mark: null });
      segs.push({ text: text.slice(r.start, r.end), mark: r.i });
      pos = r.end;
      lastEnd = r.end;
    }
    if (pos < text.length) segs.push({ text: text.slice(pos), mark: null });
    return segs;
  }, [text, risks, locations]);

  const findInSource = useCallback((i: number) => {
    const el = document.getElementById(`cq-${i}`);
    if (!el) return;
    const details = el.closest("details");
    if (details && !details.open) details.open = true;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setFlashIdx(i);
    window.setTimeout(() => setFlashIdx((cur) => (cur === i ? null : cur)), 1600);
  }, []);

  const reset = () => {
    setPhase("idle");
    setFileName("");
    setText("");
    setPages(0);
    setRisks(null);
    setCoverage(null);
    setError(null);
    setLimitHit(null);
    setContractType(null);
    setTypeSpecificItems([]);
    setThumbnailUrl(null);
    setFileSizeMb(0);
    setPageDataUrls([]);
    setProgressStep("");
  };

  const handleExport = () => {
    if (!risks) return;
    const isZh = locale === "zh" || locale === "zh-Hant";
    const now = new Date().toLocaleString(isZh ? "zh-CN" : "en-US");
    const groups: Record<RiskLevel, Risk[]> = { high: [], medium: [], low: [] };
    risks.forEach((r) => groups[r.level].push(r));
    const missing = risks.filter((r) => r.missing);
    const fmtRisk = (r: Risk): string => {
      const lines: string[] = [`- **${r.type}**`];
      if (r.quote) lines.push(`  > "${r.quote}"`);
      if (r.why) lines.push(`  ${isZh ? "原因" : "Why"}: ${r.why}`);
      if (r.suggestion) lines.push(`  ${isZh ? "建议" : "Suggestion"}: ${r.suggestion}`);
      return lines.join("\n");
    };
    const sec = (title: string, items: Risk[]) =>
      items.length > 0 ? `\n## ${title}\n\n${items.map(fmtRisk).join("\n\n")}` : "";
    const md = isZh
      ? [
          `# 合同风险报告`,
          `文件：${fileName}`,
          `扫描时间：${now}`,
          sec(`高风险条款（${groups.high.length} 条）`, groups.high),
          sec(`中风险条款（${groups.medium.length} 条）`, groups.medium),
          sec(`低风险条款（${groups.low.length} 条）`, groups.low),
          missing.length > 0 ? sec(`缺失条款（${missing.length} 条）`, missing) : "",
          `\n---\n本报告由 DockDocs 合同风险体检生成，仅供参考，不构成法律意见。`,
        ].join("\n")
      : [
          `# Contract Risk Report`,
          `File: ${fileName}`,
          `Scanned: ${now}`,
          sec(`High Risk (${groups.high.length})`, groups.high),
          sec(`Medium Risk (${groups.medium.length})`, groups.medium),
          sec(`Low Risk (${groups.low.length})`, groups.low),
          missing.length > 0 ? sec(`Missing Clauses (${missing.length})`, missing) : "",
          `\n---\nReviewed with DockDocs Contract Risk Check — findings are verified against source text.\nThis report is for reference only and is not legal advice.`,
        ].join("\n");
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contract-risk-${fileName.replace(/\.pdf$/i, "")}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const onFile = useCallback(
    async (file: File) => {
      if (!file || (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"))) return;
      setError(null);
      setRisks(null);
      setLimitHit(null);
      setThumbnailUrl(null);
      setPageDataUrls([]);
      setFileName(file.name);
      setFileSizeMb(Math.round((file.size / 1024 / 1024) * 100) / 100);
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

        // Render page thumbnails (up to 20 pages) for the upload card preview and
        // the two-column results view. Capture before destroy().
        const pageLimit = Math.min(doc.numPages, 20);
        const urls: string[] = [];
        for (let i = 1; i <= pageLimit; i++) {
          try {
            const pg = await doc.getPage(i);
            const vp = pg.getViewport({ scale: 0.35 });
            const canvas = document.createElement("canvas");
            canvas.width = vp.width;
            canvas.height = vp.height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              await pg.render({ canvas, canvasContext: ctx, viewport: vp }).promise;
              urls.push(canvas.toDataURL("image/jpeg", 0.65));
            }
          } catch { /* individual page render failure is non-fatal */ }
        }
        if (urls.length > 0) {
          setThumbnailUrl(urls[0]);
          setPageDataUrls(urls);
        }

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
    [t, childLocale],
  );

  const onAnalyze = useCallback(async () => {
    if (!text) return;
    setPhase("analyzing");
    setError(null);
    setLimitHit(null);
    setCoverage(null);
    setProgressStep(t.progressSending);
    try {
      const gate = await checkUsage("contractAnalyzer");
      if (!gate.allowed) {
        setLimitHit(gate.limit);
        setPhase("ready");
        setProgressStep("");
        return;
      }
      const auth = await authHeader();
      const res = await fetch("/api/contract-risk", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...auth },
        body: JSON.stringify({ text, locale }),
      });
      setProgressStep(t.progressAnalyzing);
      // null on JSON parse failure (HTML 500 from Netlify crash) — distinguish from {}
      const data = await res.json().catch(() => null);
      if (data === null) {
        setError(t.errPrefix + t.errServer);
        setPhase("ready");
        setProgressStep("");
        return;
      }
      if (data?.code === "UPGRADE_REQUIRED") {
        setLimitHit(data?.limit ?? 0);
        setPhase("ready");
        setProgressStep("");
        return;
      }
      if (data?.ok && Array.isArray(data.risks)) {
        const sorted = (data.risks as Risk[]).slice().sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]);
        setRisks(sorted);
        setCoverage(data.coverage && typeof data.coverage === "object" ? (data.coverage as Coverage) : null);
        setContractType(data.contractType && typeof data.contractType === "object" ? (data.contractType as ContractTypeInfo) : null);
        setTypeSpecificItems(Array.isArray(data.typeSpecificItems) ? (data.typeSpecificItems as TypeSpecificItem[]) : []);
        setProgressStep("");
        setPhase("done");
        trackToolRun("contract-risk");
        await markUsage(gate, "contractAnalyzer");
        // Save to dashboard work history
        const highCount = sorted.filter((r) => r.level === "high").length;
        const isZhLocale = locale === "zh" || locale === "zh-Hant";
        appendWorkHistory({
          tool: "contract-risk",
          fileName,
          subtitle: isZhLocale
            ? `发现${sorted.length}处风险(高${highCount})`
            : `${sorted.length} risk${sorted.length === 1 ? "" : "s"} (${highCount} high)`,
          href: "/contract-risk",
          timestamp: Date.now(),
        });
      } else {
        setError(t.errPrefix + (data?.message || t.errServer));
        setPhase("ready");
        setProgressStep("");
      }
    } catch (e) {
      setError(t.errPrefix + (e instanceof Error ? e.message : String(e)));
      setPhase("ready");
      setProgressStep("");
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
    <div className={embedded ? "mx-auto w-full max-w-3xl px-8 pb-10 pt-4 flex flex-col" : `mx-auto ${LAYOUT.content} px-5 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20`}>
      {!embedded && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />}
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
                ? "这份合同，先免费把风险查出来"
                : locale === "es" ? "Este contrato — que la IA identifique los riesgos antes de firmar."
                : locale === "pt" ? "Este contrato — que a IA identifique os riscos antes de assinar."
                : locale === "fr" ? "Ce contrat — que l'IA identifie les risques avant de signer."
                : locale === "ja" ? "この契約書——署名前にAIがリスクを洗い出します。"
                : locale === "de" ? "Dieser Vertrag — KI erkennt die Risiken, bevor Sie unterschreiben."
                : locale === "ko" ? "이 계약서——서명 전에 AI가 위험을 찾아드립니다."
                : "This contract — let AI flag the risks before you sign."
            }
          />
        </div>
      )}

      {phase === "idle" || phase === "extracting" ? (
        <UploadDropzone
          locale={locale}
          constrained={embedded}
          buttonLabel={t.choose}
          busy={phase === "extracting"}
          busyLabel={t.extracting}
          privacy={false}
          note={t.privacy}
          valueZone={embedded ? "ai" : undefined}
          onFile={onFile}
        />
      ) : (
        <div className={`${card} ${embedded ? "mt-3" : "mt-8"} p-5`}>
          <div className="flex items-start justify-between gap-3">
            {/* Thumbnail + file meta */}
            <div className="flex min-w-0 items-start gap-3">
              {thumbnailUrl && (
                <img
                  src={thumbnailUrl}
                  alt="Page 1"
                  className="h-16 w-auto shrink-0 rounded border border-[color:var(--line)] object-cover shadow-sm"
                />
              )}
              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold text-[color:var(--foreground)]">{fileName}</p>
                <p className="text-[12.5px] text-[color:var(--muted)]">{t.pagesChars(pages, text.length)}</p>
                {fileSizeMb > 0 && (
                  <p className="text-[11.5px] text-[color:var(--faint)]">{fileSizeMb} MB</p>
                )}
              </div>
            </div>
            <button type="button" onClick={reset} className="shrink-0 text-[13px] font-medium text-[color:var(--muted)] hover:text-[color:var(--foreground)]">{t.reset}</button>
          </div>
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
        <div className="mt-6" aria-busy="true">
          {/* Progress label */}
          {progressStep && (
            <div className="mb-4 flex items-center gap-2.5 text-[13px] text-[color:var(--muted)]">
              <svg className="h-4 w-4 animate-spin shrink-0 text-[color:var(--accent)]" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <span>{progressStep}</span>
            </div>
          )}
          <div className="space-y-3">
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
        </div>
      )}

      {risks && (
        <div className={`mt-6 ${pageDataUrls.length > 0 ? "lg:grid lg:grid-cols-[200px_1fr] lg:gap-6 lg:items-start" : ""}`}>
          {/* Left column: page previews strip (only shown when we have thumbnails) */}
          {pageDataUrls.length > 0 && (
            <div className="hidden lg:flex lg:flex-col lg:gap-1.5 lg:overflow-y-auto lg:max-h-[calc(100vh-160px)] lg:sticky lg:top-4">
              {pageDataUrls.map((url, idx) => (
                <div key={idx} className="rounded border border-[color:var(--line)] overflow-hidden bg-[color:var(--surface)]">
                  <img src={url} alt={`Page ${idx + 1}`} className="w-full block" />
                  <p className="text-center text-[9px] text-[color:var(--faint)] py-0.5 font-medium">{idx + 1}</p>
                </div>
              ))}
            </div>
          )}
          {/* Right column: risk findings */}
          <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{t.result(risks.length)}</span>
            <button
              type="button"
              onClick={handleExport}
              className="flex items-center gap-1.5 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-1.5 text-[12px] font-semibold text-[color:var(--muted)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0">
                <path d="M8 2v8M5 7l3 3 3-3M3 12h10" />
              </svg>
              {t.exportBtn}
            </button>
          </div>

          {contractType && (
            <div className="mb-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-1 text-[12.5px] text-[color:var(--muted)]">
                <span aria-hidden="true">📋</span>
                <span className="font-semibold text-[color:var(--foreground)]">{contractType.detected}</span>
                <span aria-hidden="true" className="text-[color:var(--faint)]">·</span>
                <span>{contractType.confidence === "high" ? t.confidenceHigh : contractType.confidence === "medium" ? t.confidenceMedium : t.confidenceLow}</span>
              </span>
            </div>
          )}

          {/* PR-B1 summary bar: severity counts + clickable proportional overview bar.
              Counts are derived client-side; clicking a colour segment scrolls to that
              severity's first finding. Verdict + scoped colour legend land in a later
              increment (with the server `summary` field, through claims-check). */}
          {risks.length > 0 && (() => {
            const counts = { high: 0, medium: 0, low: 0, missing: 0 };
            risks.forEach((r) => { counts[r.level] += 1; if (r.missing) counts.missing += 1; });
            const order: RiskLevel[] = ["high", "medium", "low"];
            const barTotal = counts.high + counts.medium + counts.low;
            const scrollToLevel = (lvl: RiskLevel) => {
              const idx = risks.findIndex((r) => r.level === lvl);
              if (idx >= 0) document.getElementById(`risk-card-${idx}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
            };
            return (
              <div className="mb-3">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] font-medium text-[color:var(--muted)]">
                  {order.map((lvl) => (
                    <span key={lvl} className="inline-flex items-center gap-1.5">
                      <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: LEVEL_STYLE[lvl].dot }} />
                      <span className="font-semibold text-[color:var(--foreground)]">{counts[lvl]}</span>
                      {levelLabel[lvl]}
                    </span>
                  ))}
                  {counts.missing > 0 && (
                    <span className="inline-flex items-center gap-1 text-[color:var(--faint)]">◇ <span className="font-semibold">{counts.missing}</span></span>
                  )}
                </div>
                {barTotal > 0 && (
                  <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-[color:var(--surface-subtle)]">
                    {order.map((lvl) =>
                      counts[lvl] > 0 ? (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => scrollToLevel(lvl)}
                          title={`${counts[lvl]} ${levelLabel[lvl]}`}
                          aria-label={`${counts[lvl]} ${levelLabel[lvl]}`}
                          className="h-full cursor-pointer transition hover:opacity-80"
                          style={{ flexGrow: counts[lvl], flexBasis: 0, backgroundColor: LEVEL_STYLE[lvl].dot }}
                        />
                      ) : null,
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {typeSpecificItems.length > 0 && (
            <details className="mb-3 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)]">
              <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3">
                <span className="text-[13px] font-semibold text-[color:var(--foreground)]">{t.typeChecklist}</span>
                <span className="text-[11px] text-[color:var(--faint)]">{typeSpecificItems.filter((i) => i.found).length}/{typeSpecificItems.length}</span>
              </summary>
              <ul className="divide-y divide-[color:var(--line)] border-t border-[color:var(--line)]">
                {typeSpecificItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 px-4 py-2.5">
                    <span className="mt-0.5 shrink-0 text-[13px]">{item.found ? "✅" : "❌"}</span>
                    <div className="min-w-0 flex-1">
                      <span className={`text-[13px] font-medium ${item.found ? "text-[color:var(--foreground)]" : "text-[color:var(--muted)]"}`}>{item.item}</span>
                      {item.note && <p className="mt-0.5 text-[12px] text-[color:var(--faint)]">{item.note}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </details>
          )}

          {coverage && (() => {
            const total = pages || 0;
            const coveredPages =
              total > 0
                ? Math.min(total, Math.max(1, Math.round((total * coverage.coveredChars) / Math.max(1, coverage.totalChars))))
                : 0;
            const warn = coverage.capped || coverage.failedChunks > 0;
            const base = coverage.capped && total > 0 ? t.coveragePartial(coveredPages, total) : t.coverageFull(total);
            const msg = coverage.failedChunks > 0 ? `${base} ${t.coverageFailed}` : base;
            return (
              <p
                className="mb-3 rounded-[var(--radius)] border px-3 py-2 text-[12px] leading-relaxed"
                style={
                  warn
                    ? { borderColor: "rgba(245,158,11,0.4)", color: "#f59e0b", background: "rgba(245,158,11,0.08)" }
                    : { borderColor: "var(--line)", color: "var(--muted)", background: "var(--surface-subtle)" }
                }
              >
                {warn ? "⚠ " : "✓ "}
                {msg}
              </p>
            );
          })()}

          {risks.length === 0 ? (
            <div className={`${card} p-5 text-[13.5px] text-[color:var(--muted)]`}>{t.noRisks}</div>
          ) : (
            <ul className="grid gap-3">
              {risks.map((r, i) => {
                const s = LEVEL_STYLE[r.level];
                const loc = locations[i] ?? null;
                return (
                  <li key={i} id={`risk-card-${i}`} className="scroll-mt-20 rounded-[var(--radius-lg)] border bg-[color:var(--surface)] p-4" style={{ borderColor: s.border }}>
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
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(52,211,153,0.12)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#34d399]">✓ {t.verifiedBadge}</span>
                          {loc && pages > 0 && (
                            <span className="text-[10px] font-medium text-[color:var(--faint)]">{t.approxPage(Math.max(1, Math.ceil((loc.start / Math.max(1, text.length)) * pages)))}</span>
                          )}
                          {loc && (
                            <button type="button" onClick={() => findInSource(i)} className="text-[10px] font-semibold text-[color:var(--accent)] hover:underline">{t.findInSource} ↧</button>
                          )}
                        </div>
                        <blockquote className="mt-2 border-l-2 border-[color:var(--line-strong)] pl-3 text-[12.5px] italic leading-relaxed text-[color:var(--muted)]">
                          <span className="mb-1 block text-[10px] font-semibold uppercase not-italic tracking-[0.1em] text-[color:var(--faint)]">{t.quoteLabel}</span>
                          “{r.quote}”
                        </blockquote>
                      </div>
                    ) : r.missing ? (
                      <p className="mt-2 inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-2 py-1 text-[12px] text-[color:var(--muted)]">
                        <span className="text-[color:var(--faint)]">◇</span>{t.notLocated}
                      </p>
                    ) : (
                      <p className="mt-2 inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border px-2 py-1 text-[12px]" style={{ borderColor: "rgba(245,158,11,0.4)", color: "#f59e0b", background: "rgba(245,158,11,0.08)" }}>
                        <span>⚠</span>{t.unverifiedQuote}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <p className="mt-4 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-4 py-3 text-[12px] leading-relaxed text-[color:var(--muted)]">
            ⚖️ {t.disclaimer}
          </p>

          {text && sourceSegments && (
            <details className="mt-4 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)]">
              <summary className="cursor-pointer list-none px-4 py-3 text-[13px] font-semibold text-[color:var(--foreground)]">
                {t.sourceTitle}
              </summary>
              <div className="max-h-[28rem] overflow-auto whitespace-pre-wrap border-t border-[color:var(--line)] px-4 py-3 text-[12.5px] leading-relaxed text-[color:var(--muted)]">
                {sourceSegments.map((seg, idx) =>
                  seg.mark === null ? (
                    <span key={idx}>{seg.text}</span>
                  ) : (
                    <mark
                      key={idx}
                      id={`cq-${seg.mark}`}
                      className="rounded px-0.5"
                      style={{
                        backgroundColor: flashIdx === seg.mark ? "rgba(52,211,153,0.55)" : "rgba(52,211,153,0.18)",
                        color: "var(--foreground)",
                        transition: "background-color 0.4s ease",
                      }}
                    >
                      {seg.text}
                    </mark>
                  ),
                )}
              </div>
            </details>
          )}
          </div>{/* end right column */}
        </div>
      )}

      {!embedded && <GroundingNote variant="contract" locale={locale} />}
      {!embedded && <RelatedPdfTools locale={locale} exclude="/contract-risk" />}
      {!embedded && <ToolSections locale={locale} content={sec} />}
      {!embedded && <ToolFaq tool="contract-risk" locale={locale} />}
    </div>
  );
}
