"use client";

import { trackToolRun } from "@/lib/track";
import { useMemo, useState } from "react";
import { getRuntimeCopy, type RuntimeLocale } from "@/lib/copy";
import { toHant, deepHant } from "@/lib/zh-hant";
import { checkUsage, markUsage } from "@/lib/usage-gate";
import { authHeader } from "@/lib/supabase";
import { UpgradePrompt } from "@/components/ui/UpgradePrompt";
import { GroundingNote } from "@/components/GroundingNote";
import { RelatedPdfTools } from "@/components/RelatedPdfTools";
import { ToolSections, type ToolSectionsContent } from "@/components/ToolSections";
import { dropzoneShell } from "@/components/design";
import type { AuthoredLocale } from "@/lib/i18n";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  citations?: string[];
};

type RuntimeState = "empty" | "selected" | "processing" | "success" | "error";
type ProviderReference = {
  provider?: string;
  model?: string;
  citations: unknown[];
};

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
    ],
  },
};

export function ChatWithPdfClient({ locale = "en" }: { locale?: RuntimeLocale | "es" | "pt" | "fr" | "ja" | "zh-Hant" }) {
  const copy = getRuntimeCopy(locale).chat;
  // Rich //Benefits //Workflow //Reading sections. ko + zh-Hant have no authored
  // block: ko → en, zh-Hant → derived from zh via deepHant (mirrors ContractRiskClient).
  const al: AuthoredLocale = locale === "ko" || locale === "zh-Hant" ? "en" : locale;
  const sec: ToolSectionsContent = locale === "zh-Hant" ? deepHant(SECTIONS.zh) : SECTIONS[al];
  const [fileName, setFileName] = useState("");
  const [documentText, setDocumentText] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<string>(copy.initialStatus);
  const [pageCount, setPageCount] = useState(0);
  const [providerReference, setProviderReference] = useState<ProviderReference>({
    citations: [],
  });
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [error, setError] = useState("");
  const [limitHit, setLimitHit] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);

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
    setProviderReference({ citations: [] });

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
    setIsExtracting(true);
    setStatus(copy.readingStatus);

    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      const buffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: buffer }).promise;
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
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : copy.extractionFailedError;
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

    try {
      // Gated, authoritative endpoint (server-side plan/usage enforcement +
      // grounded citations). Replaces the legacy ungated /.netlify/functions/chat-with-pdf.
      const auth = await authHeader();
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...auth,
        },
        body: JSON.stringify({
          context: documentText,
          question: userQuestion,
          sourceName: fileName,
          locale,
        }),
      });

      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean;
        code?: string;
        limit?: number;
        message?: string;
        result?: { answer?: string; references?: unknown[]; provider?: string; model?: string };
      } | null;

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
      setProviderReference({
        provider: payload.result?.provider,
        model: payload.result?.model,
        citations: [],
      });
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : copy.providerUnavailable;
      setError(message);
      setProviderReference({ citations: [] });
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: `${copy.unableToAnswer} ${message}`,
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  }

  return (
    <>
    <section
      id="workspace"
      aria-label={copy.workspaceTitle}
      data-testid="chat-workspace"
      className="mx-auto max-w-5xl"
    >
      {/* ── Upload zone (shown when no document) ── */}
      {!documentText && !isExtracting ? (
        <label
          data-testid="upload-panel"
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={(e) => { if (e.currentTarget === e.target) setDragging(false); }}
          onDrop={handleDrop}
          className={dropzoneShell(dragging)}
        >
          <span className="inline-flex h-12 w-full max-w-[280px] items-center justify-center rounded-[var(--radius)] bg-[color:var(--accent)] px-8 text-[15px] font-semibold text-white shadow-[0_4px_14px_rgba(62,207,142,0.35)] transition hover:opacity-90">
            {copy.choosePdf}
          </span>
          <span className="mt-4 text-sm text-[color:var(--muted)]">{copy.uploadHelp}</span>
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

      {/* ── Extracting state ── */}
      {isExtracting ? (
        <div className="rounded-[var(--radius-xl)] border border-[color:var(--line)] bg-[color:var(--surface)] p-10 text-center">
          <svg className="mx-auto h-10 w-10 animate-spin text-[color:var(--accent)]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="mt-4 text-sm font-semibold text-[color:var(--foreground)]">{copy.readingStatus}</p>
          <p className="mt-1 break-words text-xs text-[color:var(--muted)]">{activeDocumentName}</p>
        </div>
      ) : null}

      {/* ── Active document chat ── */}
      {documentText && !isExtracting ? (
        <div className="mx-auto max-w-3xl space-y-4">
          {/* Document bar */}
          <div className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[color:var(--soft-accent)] text-[10px] font-bold text-[color:var(--accent-strong)]">
              PDF
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[color:var(--foreground)]">{activeDocumentName}</p>
              <p className="text-xs text-[color:var(--muted)]">
                {pageCount
                  ? copy.pageIndexed.replace("{pages}", String(pageCount)).replace("{plural}", pageCount === 1 ? "" : "s")
                  : sourceStats}
                {providerReference.provider ? ` · ${providerReference.provider}` : ""}
              </p>
            </div>
            <label className="shrink-0 cursor-pointer rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-1.5 text-xs font-semibold text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--foreground)]">
              {copy.choosePdf}
              <input type="file" accept="application/pdf,.pdf" className="sr-only" onChange={handleFileChange} />
            </label>
          </div>

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
                      ? "ml-auto max-w-[85%] rounded-[var(--radius-lg)] bg-[color:var(--accent)] px-4 py-2.5 text-white"
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
                          : `${message.citations.length} verified against source`}
                      </p>
                      <ul className="space-y-1">
                        {message.citations.map((c, i) => (
                          <li key={i} className="rounded-[var(--radius-sm)] border-l-2 border-[color:var(--accent)] bg-[color:var(--surface)] px-2.5 py-1.5 text-[11.5px] leading-[1.55] text-[color:var(--muted)] italic">
                            &ldquo;{c}&rdquo;
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </article>
              ))
            )}
            {isAsking ? (
              <div className="mr-auto flex max-w-[85%] items-center gap-2 rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-4 py-3">
                <span className="h-2 w-2 animate-bounce rounded-full bg-[color:var(--muted)]" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[color:var(--muted)]" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[color:var(--muted)]" style={{ animationDelay: "300ms" }} />
              </div>
            ) : null}
            {error && messages.length > 0 ? (
              <div data-testid="chat-error-state" className="rounded-[var(--radius-sm)] border border-[color:var(--error-line)] bg-[color:var(--error-surface)] p-3 text-sm leading-6 text-[color:var(--error)]">
                {error}
              </div>
            ) : null}
          </div>

          {limitHit !== null ? (
            <UpgradePrompt locale={locale === "zh" ? "zh" : locale === "zh-Hant" ? "zh-Hant" : locale === "es" ? "es" : locale === "pt" ? "pt" : "en"} limit={limitHit} />
          ) : null}

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
          <div className="flex flex-wrap gap-2">
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
      ) : null}
    </section>
    <GroundingNote variant="chat" locale={locale} />
    <RelatedPdfTools locale={locale} exclude="/chat-with-pdf" />
    <ToolSections locale={locale} content={sec} />
    </>
  );
}
