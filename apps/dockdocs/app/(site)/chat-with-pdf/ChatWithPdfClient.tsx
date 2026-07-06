"use client";

import { trackToolRun } from "@/lib/track";
import { useEffect, useMemo, useRef, useState } from "react";
import { getRuntimeCopy, type RuntimeLocale } from "@/lib/copy";
import { toHant, deepHant } from "@/lib/zh-hant";
import { checkUsage, markUsage } from "@/lib/usage-gate";
import { pdfParseErrorMessage } from "@/lib/pdf-errors";
import { authHeader } from "@/lib/supabase";
import { UpgradePrompt } from "@/components/ui/UpgradePrompt";
import { AiToolShell, type AiShellStatus } from "@/components/ai-shell/AiToolShell";
import { DocContextBar } from "@/components/ai-shell/DocContextBar";
import { DocPreviewPanel } from "@/components/ai-shell/DocPreviewPanel";
import { StreamingProgressBar } from "@/components/ai-shell/StreamingOutput";
import { CitationChip } from "@/components/ai-shell/GroundedAnswer";
import { GroundedExplainer } from "@/components/ai-shell/GroundedExplainer";
import { resolveAiToolCopy, type AiToolCopyTable } from "@/components/ai-shell/AiToolCopy";
import { RelatedPdfTools } from "@/components/RelatedPdfTools";
import { ToolSections, type ToolSectionsContent } from "@/components/ToolSections";
import { dropzoneShell } from "@/components/design";
import { WorkspaceValueZone } from "@/components/WorkspaceValueZone";
import type { AuthoredLocale } from "@/lib/i18n";
import { LAYOUT } from "@/lib/layout-constants";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  citations?: string[];
};

type RuntimeState = "empty" | "selected" | "processing" | "success" | "error";

const maxPages = 12;
const maxCharacters = 40000;
const maxFileBytes = 25 * 1024 * 1024;

// //Benefits //Workflow //Recommended-reading — the same rich sections every other
// AI tool page carries (mirrors ContractRiskClient). Authored in the 7 AuthoredLocales
// (zh-Hant is derived from zh via deepHant at render; ko falls back to en). Citation +
// privacy claims are SCOPED to stay within the honesty moat: an answer is anchored to
// the source ONLY when the AI can locate the supporting passage, never "every answer".
const SECTIONS: Record<AuthoredLocale, ToolSectionsContent> = {
  en: {
    benefitsTitle: "What chatting with your PDF gives you",
    benefitsDescription: "Ask focused questions about one document and get answers built from its text — not the model's general knowledge.",
    benefits: [
      { title: "Answers from the document, not guesses", description: "The AI reads the text you extracted and answers from it, so you're working with what your PDF actually says — not whatever the model happens to remember." },
      { title: "Anchored to the source when it can be", description: "When the AI can locate the passage an answer rests on, it shows that supporting quote and marks it verified against the source. Not every answer has a quotable source — and the AI says so when it can't trace one." },
      { title: "Your file stays in the browser", description: "The text is extracted locally in your browser; only the selected text context and your question are sent to the AI provider. The PDF file itself is never uploaded." },
    ],
    workflowTitle: "How a PDF chat fits your work",
    workflowDescription: "For the moment you have a long PDF and a specific question, and you'd rather ask it than scroll the whole thing.",
    steps: [
      "Upload a PDF with selectable text — its text is extracted in your browser.",
      "Ask a focused question about the document.",
      "Read the answer with its supporting quotes — when a point can't be traced to the text, it's marked “can't verify” instead of guessed.",
    ],
    readingTitle: "More AI document tools",
    readingDescription: "Related tools for reading, reviewing, and comparing documents with traceable findings.",
    readingLinks: [
      { label: "AI summary", href: "/ai-summary", description: "Condense a long document into a structured summary you can scan in seconds." },
      { label: "Contract risk check", href: "/contract-risk", description: "Flag risky, one-sided, or missing clauses — quoted from your contract." },
      { label: "Compare documents", href: "/compare", description: "Ask one question across several documents and see how their answers differ." },
      { label: "AI Document Workspace", href: "/ai-workspace", description: "Analyze multiple documents at once — chat, summarize, and compare across your whole library." },
    ],
  },
  zh: {
    benefitsTitle: "和你的 PDF 对话能给你什么",
    benefitsDescription: "围绕一份文档提出聚焦的问题,得到基于它文字内容的回答——而不是模型的通用知识。",
    benefits: [
      { title: "回答来自文档,而非凭空猜测", description: "AI 读取你提取出的文字并据此作答,你面对的是 PDF 真正写了什么,而不是模型恰好记得的东西。" },
      { title: "能定位时锚定到原文", description: "当 AI 能找到某条回答所依据的原文段落时,会标出这段佐证引文并注明已与原文核对。并非每条回答都有出处可引——找不到依据时,AI 会如实说明。" },
      { title: "文件留在浏览器里", description: "文字在你的浏览器本地提取,只有选中的文字上下文和你的问题会发送给 AI provider。PDF 文件本身从不上传。" },
    ],
    workflowTitle: "PDF 问答如何融入你的工作",
    workflowDescription: "当你手上有一份很长的 PDF、又有一个具体问题,与其从头翻到尾,不如直接问。",
    steps: [
      "上传一份可选择文字的 PDF——文字在你的浏览器本地提取。",
      "围绕这份文档提出一个聚焦的问题。",
      "看带佐证引文的回答——当某一点无法在原文中追溯时,会标注“无法核实”而不是编造。",
    ],
    readingTitle: "更多 AI 文档工具",
    readingDescription: "阅读、审查、对比文档、结论可溯源的相关工具。",
    readingLinks: [
      { label: "AI 摘要", href: "/ai-summary", description: "把一份长文档浓缩成可在数秒内扫读的结构化摘要。" },
      { label: "合同风险体检", href: "/contract-risk", description: "标出有风险、单方面或缺失的条款——逐条引用你的合同原文。" },
      { label: "多文档对比", href: "/compare", description: "用同一个问题横向问多份文档,看它们的答案有何不同。" },
      { label: "AI 文档工作台", href: "/ai-workspace", description: "同时处理多份文档——跨文档对话、摘要和比较一站搞定。" },
    ],
  },
  es: {
    benefitsTitle: "Qué te da chatear con tu PDF",
    benefitsDescription: "Haz preguntas concretas sobre un documento y obtén respuestas construidas a partir de su texto, no del conocimiento general del modelo.",
    benefits: [
      { title: "Respuestas del documento, no conjeturas", description: "La IA lee el texto que extrajiste y responde a partir de él, así trabajas con lo que tu PDF realmente dice, no con lo que el modelo recuerde." },
      { title: "Anclado a la fuente cuando se puede", description: "Cuando la IA puede localizar el pasaje en el que se apoya una respuesta, muestra esa cita de respaldo y la marca como verificada con la fuente. No toda respuesta tiene una fuente citable, y la IA lo indica cuando no puede rastrearla." },
      { title: "Tu archivo se queda en el navegador", description: "El texto se extrae localmente en tu navegador; solo se envían al proveedor de IA el contexto de texto seleccionado y tu pregunta. El archivo PDF nunca se sube." },
    ],
    workflowTitle: "Cómo encaja el chat con PDF en tu trabajo",
    workflowDescription: "Para cuando tienes un PDF largo y una pregunta concreta, y prefieres preguntar antes que recorrerlo entero.",
    steps: [
      "Sube un PDF con texto seleccionable: su texto se extrae en tu navegador.",
      "Haz una pregunta concreta sobre el documento.",
      "Lee la respuesta con sus citas de respaldo: cuando un punto no puede rastrearse en el texto, se marca «no se puede verificar» en lugar de inventarse.",
    ],
    readingTitle: "Más herramientas de documentos con IA",
    readingDescription: "Herramientas relacionadas para leer, revisar y comparar documentos con hallazgos rastreables.",
    readingLinks: [
      { label: "Resumen con IA", href: "/ai-summary", description: "Condensa un documento largo en un resumen estructurado que puedes escanear en segundos." },
      { label: "Revisión de riesgos del contrato", href: "/contract-risk", description: "Marca cláusulas riesgosas, unilaterales o ausentes, citadas de tu contrato." },
      { label: "Comparar documentos", href: "/compare", description: "Haz una pregunta a varios documentos y observa cómo difieren sus respuestas." },
      { label: "Espacio de trabajo IA", href: "/ai-workspace", description: "Analiza varios documentos a la vez — chat, resumen y comparación en una sola interfaz." },
    ],
  },
  pt: {
    benefitsTitle: "O que conversar com seu PDF oferece",
    benefitsDescription: "Faça perguntas específicas sobre um documento e obtenha respostas construídas a partir do texto dele, não do conhecimento geral do modelo.",
    benefits: [
      { title: "Respostas do documento, não suposições", description: "A IA lê o texto que você extraiu e responde a partir dele, então você trabalha com o que o seu PDF realmente diz, não com o que o modelo lembra." },
      { title: "Ancorado na fonte quando possível", description: "Quando a IA consegue localizar o trecho em que uma resposta se apoia, ela mostra essa citação de apoio e a marca como verificada na fonte. Nem toda resposta tem uma fonte citável, e a IA avisa quando não consegue rastreá-la." },
      { title: "Seu arquivo permanece no navegador", description: "O texto é extraído localmente no seu navegador; apenas o contexto do texto selecionado e sua pergunta são enviados ao provedor de IA. O arquivo PDF em si nunca é enviado." },
    ],
    workflowTitle: "Como o chat com PDF se encaixa no seu trabalho",
    workflowDescription: "Para quando você tem um PDF longo e uma pergunta específica, e prefere perguntar a percorrer tudo.",
    steps: [
      "Envie um PDF com texto selecionável: o texto é extraído no seu navegador.",
      "Faça uma pergunta específica sobre o documento.",
      "Leia a resposta com suas citações de apoio: quando um ponto não pode ser rastreado no texto, ele é marcado como “não é possível verificar” em vez de inventado.",
    ],
    readingTitle: "Mais ferramentas de documentos com IA",
    readingDescription: "Ferramentas relacionadas para ler, revisar e comparar documentos com achados rastreáveis.",
    readingLinks: [
      { label: "Resumo com IA", href: "/ai-summary", description: "Condense um documento longo em um resumo estruturado que você lê em segundos." },
      { label: "Verificação de riscos do contrato", href: "/contract-risk", description: "Sinalize cláusulas arriscadas, unilaterais ou ausentes, citadas do seu contrato." },
      { label: "Comparar documentos", href: "/compare", description: "Faça uma pergunta a vários documentos e veja como as respostas diferem." },
      { label: "Área de trabalho de IA", href: "/ai-workspace", description: "Analise vários documentos de uma vez — chat, resumo e comparação em um só lugar." },
    ],
  },
  fr: {
    benefitsTitle: "Ce que le chat avec votre PDF vous apporte",
    benefitsDescription: "Posez des questions ciblées sur un document et obtenez des réponses construites à partir de son texte, et non des connaissances générales du modèle.",
    benefits: [
      { title: "Des réponses du document, pas des suppositions", description: "L'IA lit le texte que vous avez extrait et y répond à partir de là, vous travaillez donc avec ce que votre PDF dit réellement, pas avec ce dont le modèle se souvient." },
      { title: "Ancré à la source quand c'est possible", description: "Lorsque l'IA peut localiser le passage sur lequel repose une réponse, elle affiche cette citation à l'appui et la marque comme vérifiée dans la source. Toutes les réponses n'ont pas de source citable, et l'IA le signale lorsqu'elle ne peut en retracer aucune." },
      { title: "Votre fichier reste dans le navigateur", description: "Le texte est extrait localement dans votre navigateur ; seuls le contexte du texte sélectionné et votre question sont envoyés au fournisseur d'IA. Le fichier PDF lui-même n'est jamais téléversé." },
    ],
    workflowTitle: "Comment le chat PDF s'intègre à votre travail",
    workflowDescription: "Pour le moment où vous avez un long PDF et une question précise, et où vous préférez la poser plutôt que de tout parcourir.",
    steps: [
      "Déposez un PDF au texte sélectionnable : son texte est extrait dans votre navigateur.",
      "Posez une question précise sur le document.",
      "Lisez la réponse avec ses citations à l'appui : lorsqu'un point ne peut être retracé dans le texte, il est signalé « impossible à vérifier » plutôt que deviné.",
    ],
    readingTitle: "Plus d'outils documentaires IA",
    readingDescription: "Outils associés pour lire, analyser et comparer des documents avec des constats traçables.",
    readingLinks: [
      { label: "Résumé IA", href: "/ai-summary", description: "Condensez un long document en un résumé structuré que vous parcourez en quelques secondes." },
      { label: "Analyse des risques du contrat", href: "/contract-risk", description: "Signalez les clauses risquées, déséquilibrées ou absentes, citées depuis votre contrat." },
      { label: "Comparer des documents", href: "/compare", description: "Posez une question à plusieurs documents et voyez en quoi leurs réponses diffèrent." },
      { label: "Espace de travail IA", href: "/ai-workspace", description: "Analysez plusieurs documents à la fois — chat, résumé et comparaison en une seule interface." },
    ],
  },
  ja: {
    benefitsTitle: "PDF との対話で得られること",
    benefitsDescription: "一つの文書について焦点を絞った質問をすると、モデルの一般知識ではなく、その本文に基づいた回答が得られます。",
    benefits: [
      { title: "推測ではなく、文書からの回答", description: "AI はあなたが抽出したテキストを読み、それに基づいて答えます。だからあなたが向き合うのは、モデルがたまたま覚えていることではなく、PDF が実際に書いている内容です。" },
      { title: "可能なときは出典に紐づけ", description: "回答の根拠となる箇所を AI が特定できる場合、その裏づけとなる引用を示し、出典と照合済みと明示します。すべての回答に引用できる出典があるわけではなく、たどれないときは AI がその旨を伝えます。" },
      { title: "ファイルはブラウザ内にとどまる", description: "テキストはお使いのブラウザ内でローカルに抽出され、選択されたテキストの文脈とあなたの質問だけが AI プロバイダーに送信されます。PDF ファイル自体がアップロードされることはありません。" },
    ],
    workflowTitle: "PDF 対話が業務にどう役立つか",
    workflowDescription: "長い PDF と具体的な質問があり、全体をスクロールするより尋ねたいとき。",
    steps: [
      "選択できるテキストのある PDF をアップロード——その本文がブラウザ内で抽出されます。",
      "文書について焦点を絞った質問をします。",
      "裏づけの引用とともに回答を読みます——本文中でたどれない点は、推測せず「確認できません」と明示されます。",
    ],
    readingTitle: "他の AI 文書ツール",
    readingDescription: "文書を読み・確認し・比較するための、たどれる結果付きの関連ツール。",
    readingLinks: [
      { label: "AI 要約", href: "/ai-summary", description: "長い文書を、数秒で目を通せる構造化された要約に凝縮します。" },
      { label: "契約リスク診断", href: "/contract-risk", description: "リスクのある・一方的な・欠けている条項を、契約書から引用して指摘します。" },
      { label: "文書を比較", href: "/compare", description: "複数の文書に同じ質問を投げ、回答の違いを確認します。" },
      { label: "AI ドキュメントワークスペース", href: "/ai-workspace", description: "複数の文書を同時に処理——ライブラリ全体にわたるチャット・要約・比較を 1 か所で。" },
    ],
  },
  de: {
    benefitsTitle: "Was der Chat mit Ihrem PDF Ihnen bringt",
    benefitsDescription: "Stellen Sie gezielte Fragen zu einem Dokument und erhalten Sie Antworten, die aus seinem Text gebildet werden – nicht aus dem Allgemeinwissen des Modells.",
    benefits: [
      { title: "Antworten aus dem Dokument, kein Raten", description: "Die KI liest den von Ihnen extrahierten Text und antwortet daraus, sodass Sie mit dem arbeiten, was Ihr PDF tatsächlich sagt – nicht mit dem, woran das Modell sich zufällig erinnert." },
      { title: "An die Quelle gebunden, wenn möglich", description: "Wenn die KI die Stelle finden kann, auf der eine Antwort beruht, zeigt sie das stützende Zitat und kennzeichnet es als mit der Quelle abgeglichen. Nicht jede Antwort hat eine zitierbare Quelle – und die KI sagt es, wenn sie keine zurückverfolgen kann." },
      { title: "Ihre Datei bleibt im Browser", description: "Der Text wird lokal in Ihrem Browser extrahiert; nur der ausgewählte Textkontext und Ihre Frage werden an den KI-Anbieter gesendet. Die PDF-Datei selbst wird nie hochgeladen." },
    ],
    workflowTitle: "Wie ein PDF-Chat in Ihre Arbeit passt",
    workflowDescription: "Für den Moment, in dem Sie ein langes PDF und eine konkrete Frage haben und lieber fragen, als das Ganze zu durchscrollen.",
    steps: [
      "Laden Sie ein PDF mit auswählbarem Text hoch – sein Text wird in Ihrem Browser extrahiert.",
      "Stellen Sie eine gezielte Frage zum Dokument.",
      "Lesen Sie die Antwort mit ihren stützenden Zitaten – lässt sich ein Punkt im Text nicht zurückverfolgen, wird er als „nicht überprüfbar“ gekennzeichnet, statt geraten.",
    ],
    readingTitle: "Weitere KI-Dokumententools",
    readingDescription: "Verwandte Tools zum Lesen, Prüfen und Vergleichen von Dokumenten mit nachvollziehbaren Befunden.",
    readingLinks: [
      { label: "KI-Zusammenfassung", href: "/ai-summary", description: "Verdichten Sie ein langes Dokument zu einer strukturierten Zusammenfassung, die Sie in Sekunden überfliegen." },
      { label: "Vertrags-Risikoprüfung", href: "/contract-risk", description: "Markieren Sie riskante, einseitige oder fehlende Klauseln – aus Ihrem Vertrag zitiert." },
      { label: "Dokumente vergleichen", href: "/compare", description: "Stellen Sie mehreren Dokumenten eine Frage und sehen Sie, wie sich ihre Antworten unterscheiden." },
      { label: "KI-Dokumentarbeitsbereich", href: "/ai-workspace", description: "Analysieren Sie mehrere Dokumente gleichzeitig — Chat, Zusammenfassung und Vergleich in einer Oberfläche." },
    ],
  },
  ko: {
    benefitsTitle: "PDF와 대화하면 무엇이 좋은가요",
    benefitsDescription: "한 문서에 집중된 질문을 던지고, 모델의 일반 지식이 아니라 그 문서의 텍스트에서 만들어진 답변을 받으세요.",
    benefits: [
      { title: "추측이 아니라 문서에서 나온 답변", description: "AI는 당신이 추출한 텍스트를 읽고 그것을 근거로 답하므로, 모델이 우연히 기억하는 내용이 아니라 PDF가 실제로 말하는 내용을 다루게 됩니다." },
      { title: "가능할 때는 원문에 근거", description: "AI가 답변의 근거가 된 구절을 찾을 수 있을 때는 그 뒷받침 인용을 보여 주고 원문과 대조해 확인했음을 표시합니다. 모든 답변에 인용할 출처가 있는 것은 아니며, 추적할 수 없을 때는 AI가 그렇다고 알려 줍니다." },
      { title: "파일은 브라우저에 남습니다", description: "텍스트는 브라우저에서 로컬로 추출되며, 선택된 텍스트 맥락과 질문만 AI 제공업체로 전송됩니다. PDF 파일 자체는 업로드되지 않습니다." },
    ],
    workflowTitle: "PDF 대화가 업무에 어떻게 맞물리나요",
    workflowDescription: "긴 PDF와 구체적인 질문이 있는데, 처음부터 끝까지 훑기보다 바로 물어보고 싶을 때를 위한 기능입니다.",
    steps: [
      "선택 가능한 텍스트가 있는 PDF를 업로드하세요 — 텍스트가 브라우저에서 추출됩니다.",
      "문서에 대해 집중된 질문을 하세요.",
      "뒷받침 인용과 함께 답변을 읽으세요 — 원문에서 추적할 수 없는 부분은 추측 대신 「확인 불가」로 표시됩니다.",
    ],
    readingTitle: "더 많은 AI 문서 도구",
    readingDescription: "문서를 읽고, 검토하고, 비교하며 결과를 추적할 수 있는 관련 도구입니다.",
    readingLinks: [
      { label: "AI 요약", href: "/ai-summary", description: "긴 문서를 몇 초 만에 훑어볼 수 있는 구조화된 요약으로 압축합니다." },
      { label: "계약 위험 검토", href: "/contract-risk", description: "위험하거나 한쪽에 치우치거나 빠진 조항을 표시합니다 — 계약서에서 인용합니다." },
      { label: "문서 비교", href: "/compare", description: "여러 문서에 같은 질문을 던지고 답변이 어떻게 다른지 확인합니다." },
      { label: "AI 문서 워크스페이스", href: "/ai-workspace", description: "여러 문서를 한 번에 분석 — 전체 라이브러리에 걸쳐 채팅, 요약, 비교를 한 곳에서." },
    ],
},
};

// Shell copy for the AI 壳 atoms this page renders (chip labels, cancel, …).
// Typed AiToolCopyTable → a missing locale is a tsc error (the ko lesson).
// Keys the page doesn't render yet (answer/references headings for oneshot
// tools) are still authored so the contract stays exhaustive.
const CHAT_SHELL_COPY: AiToolCopyTable<{ cancelled: string }> = {
  en: {
    ask: "Ask", working: "Thinking…", cancel: "Stop", retry: "Try again", ready: "Ready.",
    answer: "Answer", references: "Source passages", verifiedBadge: "Verified against source",
    unverifiedBadge: "Can't verify", missingBadge: "Missing", copyReference: "Copy",
    showReference: "Show more", hideReference: "Show less", copyAnswer: "Copy answer",
    repick: "Choose another PDF", reset: "Start over", cancelled: "Stopped.",
  },
  zh: {
    ask: "提问", working: "思考中…", cancel: "停止", retry: "重试", ready: "就绪。",
    answer: "回答", references: "原文段落", verifiedBadge: "已与原文核对",
    unverifiedBadge: "无法核实", missingBadge: "缺失", copyReference: "复制",
    showReference: "展开", hideReference: "收起", copyAnswer: "复制回答",
    repick: "换一份 PDF", reset: "重新开始", cancelled: "已停止。",
  },
  es: {
    ask: "Preguntar", working: "Pensando…", cancel: "Detener", retry: "Reintentar", ready: "Listo.",
    answer: "Respuesta", references: "Pasajes de la fuente", verifiedBadge: "Verificado con la fuente",
    unverifiedBadge: "No se puede verificar", missingBadge: "Ausente", copyReference: "Copiar",
    showReference: "Ver más", hideReference: "Ver menos", copyAnswer: "Copiar respuesta",
    repick: "Elegir otro PDF", reset: "Empezar de nuevo", cancelled: "Detenido.",
  },
  pt: {
    ask: "Perguntar", working: "Pensando…", cancel: "Parar", retry: "Tentar novamente", ready: "Pronto.",
    answer: "Resposta", references: "Trechos da fonte", verifiedBadge: "Verificado na fonte",
    unverifiedBadge: "Não é possível verificar", missingBadge: "Ausente", copyReference: "Copiar",
    showReference: "Ver mais", hideReference: "Ver menos", copyAnswer: "Copiar resposta",
    repick: "Escolher outro PDF", reset: "Recomeçar", cancelled: "Interrompido.",
  },
  fr: {
    ask: "Demander", working: "Réflexion…", cancel: "Arrêter", retry: "Réessayer", ready: "Prêt.",
    answer: "Réponse", references: "Passages de la source", verifiedBadge: "Vérifié dans la source",
    unverifiedBadge: "Invérifiable", missingBadge: "Manquant", copyReference: "Copier",
    showReference: "Voir plus", hideReference: "Voir moins", copyAnswer: "Copier la réponse",
    repick: "Choisir un autre PDF", reset: "Recommencer", cancelled: "Arrêté.",
  },
  ja: {
    ask: "質問する", working: "考えています…", cancel: "停止", retry: "再試行", ready: "準備完了。",
    answer: "回答", references: "出典の箇所", verifiedBadge: "出典と照合済み",
    unverifiedBadge: "検証できません", missingBadge: "欠落", copyReference: "コピー",
    showReference: "もっと見る", hideReference: "閉じる", copyAnswer: "回答をコピー",
    repick: "別の PDF を選ぶ", reset: "最初からやり直す", cancelled: "停止しました。",
  },
  de: {
    ask: "Fragen", working: "Denke nach…", cancel: "Stopp", retry: "Erneut versuchen", ready: "Bereit.",
    answer: "Antwort", references: "Quellstellen", verifiedBadge: "Mit der Quelle abgeglichen",
    unverifiedBadge: "Nicht überprüfbar", missingBadge: "Fehlt", copyReference: "Kopieren",
    showReference: "Mehr anzeigen", hideReference: "Weniger anzeigen", copyAnswer: "Antwort kopieren",
    repick: "Anderes PDF wählen", reset: "Von vorn beginnen", cancelled: "Gestoppt.",
  },
  ko: {
    ask: "질문하기", working: "생각 중…", cancel: "중지", retry: "다시 시도", ready: "준비 완료.",
    answer: "답변", references: "출처 구절", verifiedBadge: "출처와 대조 확인",
    unverifiedBadge: "확인 불가", missingBadge: "누락", copyReference: "복사",
    showReference: "더 보기", hideReference: "접기", copyAnswer: "답변 복사",
    repick: "다른 PDF 선택", reset: "다시 시작", cancelled: "중지되었습니다.",
  },
};

export function ChatWithPdfClient({ locale = "en", embedded = false }: { locale?: RuntimeLocale | "es" | "pt" | "fr" | "ja" | "zh-Hant"; embedded?: boolean }) {
  const copy = getRuntimeCopy(locale).chat;
  // Rich //Benefits //Workflow //Reading sections. ko authored in SECTIONS_KO;
  // zh-Hant → derived from zh via deepHant (mirrors ContractRiskClient).
  const al: AuthoredLocale = locale === "zh-Hant" ? "en" : locale;
  const sec: ToolSectionsContent = locale === "zh-Hant" ? deepHant(SECTIONS.zh) : SECTIONS[al];
  const [fileName, setFileName] = useState("");
  const [documentText, setDocumentText] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<string>(copy.initialStatus);
  const [pageCount, setPageCount] = useState(0);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [error, setError] = useState("");
  const [limitHit, setLimitHit] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [streamingAnswer, setStreamingAnswer] = useState("");
  const [extractProgress, setExtractProgress] = useState(0);
  const [docThumb, setDocThumb] = useState<string | null>(null);
  const [fileSizeMb, setFileSizeMb] = useState(0);
  const [expandedCitations, setExpandedCitations] = useState<Record<string, boolean>>({});
  const abortRef = useRef<AbortController | null>(null);
  const repickRef = useRef<HTMLInputElement | null>(null);
  const conversationEndRef = useRef<HTMLDivElement | null>(null);
  const shellCopy = resolveAiToolCopy(CHAT_SHELL_COPY, locale);

  // A submitted question always jumps the transcript to the newest exchange,
  // even when the reader had scrolled up (the shell viewport only follows
  // content while already at the bottom).
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages.length]);

  const canAsk = useMemo(
    () => documentText.trim().length > 0 && question.trim().length > 0 && !isAsking,
    [documentText, isAsking, question],
  );
  const sourceStats = useMemo(() => {
    if (!documentText) {
      return copy.sourceWaiting;
    }

    return copy.sourceReady.replace("{characters}", documentText.length.toLocaleString());
  }, [copy.sourceReady, copy.sourceWaiting, documentText]);
  const documentState: RuntimeState = useMemo(() => {
    if (error) {
      return "error";
    }

    if (isExtracting) {
      return "processing";
    }

    if (documentText) {
      return "success";
    }

    if (fileName) {
      return "selected";
    }

    return "empty";
  }, [documentText, error, fileName, isExtracting]);
  const resultGenerated = messages.some((message) => message.role === "assistant");
  const userQuestions = messages.filter((message) => message.role === "user");
  const activeDocumentName = fileName || copy.untitled;

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    void processFile(event.target.files?.[0]);
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    setDragging(false);
    void processFile(event.dataTransfer.files?.[0]);
  }

  async function processFile(file: File | undefined) {
    setError("");
    setMessages([]);
    setDocumentText("");
    setPageCount(0);
    setDocThumb(null);
    setFileSizeMb(0);

    if (!file) {
      setFileName("");
      setStatus(copy.initialStatus);
      return;
    }

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setFileName(file.name);
      setStatus(copy.pdfRequiredStatus);
      setError(copy.pdfRequiredError);
      return;
    }

    if (file.size > maxFileBytes) {
      setFileName(file.name);
      setStatus(copy.fileLimitStatus);
      setError(copy.fileLimitError);
      return;
    }

    setFileName(file.name);
    setFileSizeMb(Math.round((file.size / 1024 / 1024) * 100) / 100);
    setIsExtracting(true);
    setExtractProgress(5);
    setStatus(copy.readingStatus);

    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      const buffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: buffer }).promise;
      setExtractProgress(15);
      const pageCount = Math.min(pdf.numPages, maxPages);
      const pages: string[] = [];

      for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item) => {
            const maybeTextItem = item as { str?: string };
            return maybeTextItem.str ?? "";
          })
          .filter(Boolean)
          .join(" ");

        pages.push(pageText);
        setExtractProgress(15 + Math.round((pageNumber / pageCount) * 85));
      }

      const extracted = pages.join("\n\n").slice(0, maxCharacters);

      if (!extracted.trim()) {
        setStatus(copy.noTextStatus);
        setError(copy.noTextError);
        return;
      }

      setDocumentText(extracted);
      setPageCount(pageCount);
      setStatus(
        copy.readyStatus
          .replace("{characters}", extracted.length.toLocaleString())
          .replace("{pages}", String(pageCount))
          .replace("{plural}", pageCount === 1 ? "" : "s"),
      );

      // First-page thumbnail for the v2 left preview panel — non-critical,
      // the panel falls back to a PDF badge if rendering fails. Rendered at
      // the card's display size × devicePixelRatio (预览必须真实可读), never a
      // fixed low scale stretched up.
      try {
        const firstPage = await pdf.getPage(1);
        const baseViewport = firstPage.getViewport({ scale: 1 });
        const targetWidth = 280 * Math.min(window.devicePixelRatio || 1, 2);
        const viewport = firstPage.getViewport({ scale: Math.min(targetWidth / baseViewport.width, 2.5) });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          await firstPage.render({ canvas, canvasContext: ctx, viewport }).promise;
          setDocThumb(canvas.toDataURL("image/jpeg", 0.72));
        }
      } catch {
        /* keep badge fallback */
      }
    } catch (caughtError) {
      const message =
        pdfParseErrorMessage(caughtError, locale) ??
        (caughtError instanceof Error ? caughtError.message : copy.extractionFailedError);
      setStatus(copy.extractionFailedStatus);
      setError(message);
    } finally {
      setIsExtracting(false);
    }
  }

  async function askQuestion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canAsk) {
      return;
    }

    const userQuestion = question.trim();
    setQuestion("");
    setError("");
    setLimitHit(null);
    setIsAsking(true);

    const gate = await checkUsage("chat");
    if (!gate.allowed) {
      setLimitHit(gate.limit);
      setIsAsking(false);
      return;
    }

    setMessages((current) => [...current, { role: "user", content: userQuestion }]);
    setStreamingAnswer("");
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    type ChatPayload = {
      ok?: boolean;
      code?: string;
      limit?: number;
      message?: string;
      result?: { answer?: string; references?: unknown[]; provider?: string; model?: string };
    };

    try {
      // Gated, authoritative endpoint (server-side plan/usage enforcement +
      // grounded citations). stream:true → NDJSON token deltas + final result
      // (the same protocol ai-workspace consumes); non-NDJSON responses (gate
      // errors, stream-less fallback) drop through to the JSON branch.
      const auth = await authHeader();
      // Prior completed turns so the model sees the conversation, not just the
      // last question (last 8, mirroring the workspace behavior).
      const history = messages
        .reduce<{ question: string; answer: string }[]>((turns, message, index) => {
          const next = messages[index + 1];
          if (message.role === "user" && next?.role === "assistant") {
            turns.push({ question: message.content, answer: next.content });
          }
          return turns;
        }, [])
        .slice(-8);
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/x-ndjson",
          ...auth,
        },
        body: JSON.stringify({
          context: documentText,
          question: userQuestion,
          history,
          sourceName: fileName,
          locale,
          stream: true,
        }),
        signal: controller.signal,
      });

      let payload: ChatPayload | null = null;
      const contentType = response.headers.get("content-type") ?? "";

      if (contentType.includes("application/x-ndjson") && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        const handleLine = (line: string) => {
          const trimmed = line.trim();
          if (!trimmed) return;
          let event: ({ type?: string; text?: string } & ChatPayload) | null = null;
          try {
            event = JSON.parse(trimmed) as { type?: string; text?: string } & ChatPayload;
          } catch {
            return;
          }
          if (event.type === "delta" && typeof event.text === "string") {
            const text = event.text;
            setStreamingAnswer((current) => current + text);
          } else if (event.type === "result" || event.type === "error") {
            payload = event;
          }
        };
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop() ?? "";
          for (const line of lines) handleLine(line);
        }
        if (buffer) handleLine(buffer);

        // Stream ended in an error event (or produced nothing): fall back ONCE
        // to the plain JSON request before surfacing anything — the same
        // stream→JSON degradation ai-workspace's runtime does. The JSON path is
        // a fresh provider run with its own repair chain, so a single flaky
        // streaming attempt never becomes a red box (兜底原则: the user only
        // sees an error when every path is exhausted). Gate errors are not
        // retried — they're an answer, not a failure.
        const streamFailed = !payload || (payload as ChatPayload).ok !== true;
        const isGateHit = (payload as ChatPayload | null)?.code === "UPGRADE_REQUIRED";
        if (streamFailed && !isGateHit && !controller.signal.aborted) {
          setStreamingAnswer("");
          const retry = await fetch("/api/ai-chat", {
            method: "POST",
            headers: { "Content-Type": "application/json", ...auth },
            body: JSON.stringify({
              context: documentText,
              question: userQuestion,
              history,
              sourceName: fileName,
              locale,
            }),
            signal: controller.signal,
          });
          payload = (await retry.json().catch(() => null)) as ChatPayload | null;
          if (retry.status === 402 || payload?.code === "UPGRADE_REQUIRED") {
            setLimitHit(typeof payload?.limit === "number" ? payload.limit : gate.limit);
            setMessages((current) => current.slice(0, -1));
            return;
          }
        }
      } else {
        payload = (await response.json().catch(() => null)) as ChatPayload | null;
      }

      // Server gate hit (authoritative) — show the upgrade prompt and stop.
      if (response.status === 402 || payload?.code === "UPGRADE_REQUIRED") {
        setLimitHit(typeof payload?.limit === "number" ? payload.limit : gate.limit);
        setMessages((current) => current.slice(0, -1));
        return;
      }

      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.message ?? copy.providerFailed);
      }

      const answer = payload.result?.answer ?? "";
      if (!answer) {
        throw new Error(copy.providerEmpty);
      }

      const citations = Array.isArray(payload.result?.references)
        ? (payload.result?.references as string[]).filter((c) => typeof c === "string")
        : [];
      setMessages((current) => [
        ...current,
        { role: "assistant", content: answer, citations },
      ]);
      trackToolRun("chat-with-pdf");
      await markUsage(gate, "chat");
    } catch (caughtError) {
      if (controller.signal.aborted) {
        // User pressed Stop: keep their question, drop the pending answer quietly.
        return;
      }
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : copy.providerUnavailable;
      setError(message);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: `${copy.unableToAnswer} ${message}`,
        },
      ]);
    } finally {
      setStreamingAnswer("");
      setIsAsking(false);
    }
  }

  function cancelAsk() {
    abortRef.current?.abort();
  }

  function toggleCitation(key: string) {
    setExpandedCitations((current) => ({ ...current, [key]: !current[key] }));
  }

  const activeDoc = Boolean(documentText) && !isExtracting;
  const shellStatus: AiShellStatus =
    isExtracting || isAsking ? "working"
    : error && !activeDoc ? "error"
    : resultGenerated ? "result"
    : activeDoc ? "ready"
    : "idle";

  return (
    <>
    <section
      id="workspace"
      aria-label={copy.workspaceTitle}
      data-testid="chat-workspace"
      className={embedded ? "mx-auto w-full max-w-3xl px-8 pb-10 pt-4 flex flex-col" : "w-full"}
    >
      {embedded && <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{copy.heroTitle}</p>}
      <AiToolShell
        mode="conversational"
        status={shellStatus}
        docIntake={
          <>
            {/* ── Upload zone (shown when no document) ── */}
            {!documentText && !isExtracting ? (
              <label
                data-testid="upload-panel"
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={(e) => { if (e.currentTarget === e.target) setDragging(false); }}
                onDrop={handleDrop}
                className={dropzoneShell(dragging)}
              >
                <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-[color:var(--line)] text-[color:var(--accent)]">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4M7 9l5-5 5 5" /><path d="M5 16v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" /></svg>
                </span>
                <span className="inline-flex h-12 w-full max-w-[280px] items-center justify-center rounded-[var(--radius)] bg-[color:var(--accent)] px-8 text-[15px] font-semibold text-white shadow-[0_4px_14px_rgba(62,207,142,0.35)] transition hover:opacity-90">
                  {copy.choosePdf}
                </span>
                <span className="mt-4 text-sm text-[color:var(--muted)]">{copy.uploadHelp}</span>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs text-[color:var(--faint)]">
                  <span>{locale === "zh-Hant" ? deepHant("支持") : locale === "zh" ? "支持" : locale === "ja" ? "対応形式" : locale === "de" ? "Unterstützt" : locale === "ko" ? "지원 형식" : locale === "es" ? "Admite" : locale === "pt" ? "Suporta" : locale === "fr" ? "Prend en charge" : "Supports"} PDF</span>
                  <span className="hidden h-3 w-px bg-[color:var(--line)] sm:inline-block" />
                  <span className="text-[color:var(--muted)]">{locale === "zh-Hant" ? deepHant("本地读取 · 文字发至AI") : locale === "zh" ? "本地读取 · 文字发至AI" : locale === "ja" ? "ローカルで読み取り · テキストをAIへ送信" : locale === "es" ? "Leído localmente · texto enviado a IA" : locale === "pt" ? "Lido localmente · texto enviado a IA" : locale === "fr" ? "Lu localement · texte envoyé à l'IA" : locale === "de" ? "Lokal gelesen · Text an KI gesendet" : locale === "ko" ? "로컬에서 읽기 · 텍스트 AI로 전송" : "File read locally · text sent to AI"}</span>
                </div>
                {documentState === "error" && error && (
                  <span className="mt-4 text-sm text-[color:var(--error)]">{error}</span>
                )}
                <input
                  data-testid="upload-input"
                  type="file"
                  accept="application/pdf,.pdf"
                  className="sr-only"
                  onChange={handleFileChange}
                />
              </label>
            ) : null}
            {embedded && !documentText && !isExtracting && <WorkspaceValueZone type="ai" locale={locale} />}

            {/* ── Extracting: real per-page progress instead of a blind spinner ── */}
            {isExtracting ? (
              <div className="rounded-[var(--radius-xl)] border border-[color:var(--line)] bg-[color:var(--surface)] p-10">
                <div className="mx-auto max-w-sm">
                  <StreamingProgressBar progress={extractProgress} step={copy.readingStatus} />
                  <p className="mt-2 break-words text-center text-xs text-[color:var(--muted)]">{activeDocumentName}</p>
                </div>
              </div>
            ) : null}
          </>
        }
        contextBar={
          activeDoc ? (
            /* A-2: panel head — file identity + re-pick live here (bare mode:
               the shell's container provides the chrome). The re-pick button
               moved up from under the preview card. */
            <DocContextBar
              bare
              fileName={activeDocumentName}
              meta={`${fileSizeMb ? `${fileSizeMb} MB` : ""}${fileSizeMb && pageCount ? " · " : ""}${pageCount ? `${pageCount}p` : ""}` || undefined}
              statusLabel={isAsking ? copy.asking : undefined}
              onRepick={() => repickRef.current?.click()}
              repickLabel={copy.choosePdf}
              disabled={isAsking}
            />
          ) : null
        }
        docPanel={
          activeDoc ? (
            <>
              <DocPreviewPanel
                docs={[
                  {
                    name: activeDocumentName,
                    meta: `${fileSizeMb ? `${fileSizeMb} MB` : ""}${fileSizeMb && pageCount ? " · " : ""}${pageCount ? `${pageCount}p` : ""}` || undefined,
                    thumbUrl: docThumb,
                  },
                ]}
              />
              <input ref={repickRef} type="file" accept="application/pdf,.pdf" className="sr-only" onChange={handleFileChange} />
            </>
          ) : null
        }
        resultRegion={
          activeDoc ? (
            <div className="mt-4 md:mt-0">

          {/* Conversation */}
          <div
            data-testid="conversation-workspace"
            className="min-h-[320px] space-y-3 rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4 sm:p-5"
          >
            {messages.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-sm font-semibold text-[color:var(--foreground)]">{copy.starterTitle}</p>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[color:var(--muted)]">{copy.starterDescription}</p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {copy.suggestedQuestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setQuestion(suggestion)}
                      className="rounded-full border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3.5 py-1.5 text-xs font-medium text-[color:var(--muted)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--foreground)]"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <article
                  key={`${message.role}-${index}`}
                  className={
                    message.role === "user"
                      ? "ml-auto w-fit max-w-[75%] rounded-[var(--radius-lg)] bg-[color:var(--accent)] px-4 py-2.5 text-white"
                      : "mr-auto max-w-[85%] rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-4 py-2.5"
                  }
                >
                  <p className={`whitespace-pre-wrap text-sm leading-6 ${message.role === "user" ? "text-white" : "text-[color:var(--foreground)]"}`}>
                    {message.content}
                  </p>
                  {message.role === "assistant" && message.citations && message.citations.length > 0 && (
                    <div className="mt-2.5 border-t border-[color:var(--line)] pt-2.5">
                      <p className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold text-[color:var(--accent)]">
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6.5l2.5 2.5L10 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {locale === "zh"
                          ? `${message.citations.length} 处已与原文核对`
                          : locale === "zh-Hant"
                          ? toHant(`${message.citations.length} 处已与原文核对`)
                          : locale === "ja"
                          ? `${message.citations.length} 件を出典と照合済み`
                          : locale === "es"
                          ? `${message.citations.length} verificado${message.citations.length > 1 ? "s" : ""} en la fuente`
                          : locale === "pt"
                          ? `${message.citations.length} verificado${message.citations.length > 1 ? "s" : ""} na fonte`
                          : locale === "fr"
                          ? `${message.citations.length} vérifié${message.citations.length > 1 ? "s" : ""} dans la source`
                          : locale === "de"
                          ? `${message.citations.length} mit der Quelle abgeglichen`
                          : locale === "ko"
                          ? `${message.citations.length}건 출처와 대조 확인`
                          : `${message.citations.length} verified against source`}
                      </p>
                      <ul className="grid gap-2">
                        {message.citations.map((c, i) => (
                          <CitationChip
                            key={`${index}-${i}`}
                            citation={{ quote: c }}
                            labels={{
                              verified: shellCopy.verifiedBadge,
                              copy: shellCopy.copyReference,
                              show: shellCopy.showReference,
                              hide: shellCopy.hideReference,
                            }}
                            expanded={Boolean(expandedCitations[`${index}:${i}`])}
                            canCollapse={c.length > 180}
                            showActions
                            onCopy={(quote) => void navigator.clipboard?.writeText(quote).catch(() => undefined)}
                            onToggle={() => toggleCitation(`${index}:${i}`)}
                          />
                        ))}
                      </ul>
                    </div>
                  )}
                </article>
              ))
            )}
            {isAsking ? (
              streamingAnswer ? (
                /* Tokens stream into a live assistant bubble — no more black-box wait. */
                <article className="mr-auto max-w-[85%] rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-4 py-2.5">
                  <p className="whitespace-pre-wrap text-sm leading-6 text-[color:var(--foreground)]">{streamingAnswer}</p>
                </article>
              ) : (
                <div className="mr-auto flex max-w-[85%] items-center gap-2 rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-4 py-3">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[color:var(--muted)]" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[color:var(--muted)]" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[color:var(--muted)]" style={{ animationDelay: "300ms" }} />
                </div>
              )
            ) : null}
            {error && messages.length > 0 ? (
              <div data-testid="chat-error-state" className="rounded-[var(--radius-sm)] border border-[color:var(--error-line)] bg-[color:var(--error-surface)] p-3 text-sm leading-6 text-[color:var(--error)]">
                {error}
              </div>
            ) : null}
          </div>
          <div ref={conversationEndRef} aria-hidden="true" />

              {limitHit !== null ? (
                <div className="mt-4">
                  <UpgradePrompt locale={locale} limit={limitHit} />
                </div>
              ) : null}
            </div>
          ) : null
        }
        actionRegion={
          activeDoc ? (
            <div className="mt-4">
              {/* Input */}
              <form onSubmit={askQuestion} className="rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] p-2">
                <div className="flex items-end gap-2">
                  <textarea
                    data-testid="chat-input"
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                    placeholder={copy.placeholder}
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (canAsk) askQuestion(e as unknown as React.FormEvent<HTMLFormElement>);
                      }
                    }}
                    className="max-h-32 min-h-[44px] flex-1 resize-none rounded-[var(--radius-sm)] bg-transparent px-3 py-2.5 text-sm leading-6 outline-none placeholder:text-[color:var(--muted)]"
                  />
                  {isAsking ? (
                    <button
                      type="button"
                      onClick={cancelAsk}
                      className="inline-flex h-11 shrink-0 items-center rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-4 text-sm font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]"
                    >
                      {shellCopy.cancel}
                    </button>
                  ) : null}
                  <button
                    data-testid="ask-button"
                    type="submit"
                    disabled={!canAsk}
                    className="inline-flex h-11 shrink-0 items-center rounded-[var(--radius)] bg-[color:var(--accent)] px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {isAsking ? copy.asking : copy.ask}
                  </button>
                </div>
              </form>

              {/* Quick actions */}
              <div className="mt-4 flex flex-wrap gap-2">
                {copy.knowledgeCards.map((card) => (
                  <button
                    key={card.title}
                    type="button"
                    onClick={() => setQuestion(card.prompt)}
                    className="rounded-full border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3.5 py-1.5 text-xs font-medium text-[color:var(--muted)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--foreground)]"
                  >
                    {card.title}
                  </button>
                ))}
              </div>
            </div>
          ) : null
        }
      />
    </section>
    <GroundedExplainer variant="chat" locale={locale} />
    {!embedded && <RelatedPdfTools locale={locale} exclude="/chat-with-pdf" />}
    {!embedded && <ToolSections locale={locale} content={sec} />}
    </>
  );
}
