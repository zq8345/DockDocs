"use client";

import { useState } from "react";
import { toHant, deepHant } from "@/lib/zh-hant";
import { checkUsage, markUsage } from "@/lib/usage-gate";
import { trackToolRun } from "@/lib/track";
import { dropzoneShell } from "@/components/design";
import { WorkspaceValueZone } from "@/components/WorkspaceValueZone";
import { UpgradePrompt } from "@/components/ui/UpgradePrompt";
import { GroundingNote } from "@/components/GroundingNote";
import { RelatedPdfTools } from "@/components/RelatedPdfTools";
import { ToolSections, type ToolSectionsContent } from "@/components/ToolSections";
import type { AuthoredLocale } from "@/lib/i18n";

type SummaryData = {
  executiveSummary: string;
  keyPoints: string[];
  actionItems: string[];
  suggestedNextSteps?: string[];
  nextSteps?: string[];
  provider?: string;
  model?: string;
};

type Status = "idle" | "extracting" | "summarizing" | "done" | "error";

const maxPages = 20;
const maxCharacters = 24000;
const maxFileBytes = 25 * 1024 * 1024;

const SECTIONS: Record<AuthoredLocale, ToolSectionsContent> = {
  en: {
    benefitsTitle: "What the AI summary gives you",
    benefitsDescription: "The AI reads your document's text and condenses it into an executive summary, key points, and suggested next steps you can review at a glance.",
    benefits: [
      { title: "A long document, condensed", description: "Turn a long PDF or Office file into an executive summary, key points, the entities that matter, and suggested actions — the gist in a form you can actually skim." },
      { title: "Read in your browser", description: "The text is extracted from your file in your browser; only that extracted text is sent to the AI for summarizing. The file itself is never uploaded." },
      { title: "Grounded in your document", description: "The summary is drawn from the words in your file — it doesn't add facts that aren't there. It's a rewrite, not a word-for-word quote, so check key numbers and dates against the original." },
    ],
    workflowTitle: "How an AI summary fits your work",
    workflowDescription: "For the moment a long report, contract, or deck lands in your lap and you need the gist before you commit to reading every page.",
    steps: [
      "Upload the PDF — up to 20 pages.",
      "DockDocs extracts the text in your browser and sends only that text for summarizing.",
      "The AI distills a summary, key points, and suggested next steps from your file's text.",
      "Review the result — check the key numbers and dates against the original.",
    ],
    readingTitle: "More AI document tools",
    readingDescription: "Related tools for reading, questioning, and comparing documents with traceable findings.",
    readingLinks: [
      { label: "Chat with your PDF", href: "/chat-with-pdf", description: "Ask questions about a document and get answers grounded in its text, with the source quoted." },
      { label: "Contract risk check", href: "/contract-risk", description: "Have the AI flag risky, one-sided, or missing clauses in a contract, each tied to its source." },
      { label: "Compare documents", href: "/compare", description: "Line several documents up side by side and see where their key terms differ." },
    ],
  },
  zh: {
    benefitsTitle: "这份 AI 摘要能给你什么",
    benefitsDescription: "AI 通读文档正文,把它浓缩成可一眼审阅的执行摘要、关键要点和建议的后续步骤。",
    benefits: [
      { title: "把长文档浓缩成可读结果", description: "把一份很长的 PDF 或 Office 文件变成执行摘要、关键要点、值得关注的实体和建议行动——把要点整理成你真能快速浏览的形式。" },
      { title: "在浏览器里读取", description: "文字在你的浏览器里从文件中提取,只有这段提取出的文字会发送给 AI 用于生成摘要,文件本身不会被上传。" },
      { title: "忠于你的文档", description: "摘要只依据你文件里的文字,不会添加文档之外的事实。它是改写而非逐字引用,因此关键的数字和日期请对照原文核验。" },
    ],
    workflowTitle: "AI 摘要如何融入你的工作",
    workflowDescription: "当一份很长的报告、合同或演示文稿落到你手上、你需要在通读每一页之前先抓住要点时。",
    steps: [
      "上传 PDF——最多 20 页。",
      "DockDocs 在你的浏览器里提取文字,只把这段文字发送去生成摘要。",
      "AI 从你文件的文字中提炼出摘要、关键要点和建议的后续步骤。",
      "审阅结果——把关键的数字和日期对照原文核验。",
    ],
    readingTitle: "更多 AI 文档工具",
    readingDescription: "用于阅读、提问和对比文档、结论可溯源的相关工具。",
    readingLinks: [
      { label: "与 PDF 对话", href: "/chat-with-pdf", description: "就一份文档提问,得到依据其正文的回答,并附上引用的原文。" },
      { label: "合同风险体检", href: "/contract-risk", description: "让 AI 标出合同里有风险、单方面或缺失的条款,每条都对应原文出处。" },
      { label: "对比文档", href: "/compare", description: "把多份文档并排放在一起,看出它们关键条款的差异。" },
    ],
  },
  es: {
    benefitsTitle: "Qué te da el resumen con IA",
    benefitsDescription: "La IA lee el texto de tu documento y lo condensa en un resumen ejecutivo, puntos clave y próximos pasos sugeridos que puedes revisar de un vistazo.",
    benefits: [
      { title: "Un documento largo, condensado", description: "Convierte un PDF o archivo de Office extenso en un resumen ejecutivo, puntos clave, las entidades que importan y acciones sugeridas: lo esencial en un formato que de verdad puedes hojear." },
      { title: "Leído en tu navegador", description: "El texto se extrae de tu archivo en tu navegador; solo ese texto extraído se envía a la IA para resumirlo. El archivo en sí nunca se sube." },
      { title: "Basado en tu documento", description: "El resumen se extrae de las palabras de tu archivo, no añade datos que no estén ahí. Es una reescritura, no una cita literal, así que verifica las cifras y fechas clave con el original." },
    ],
    workflowTitle: "Cómo encaja el resumen con IA en tu trabajo",
    workflowDescription: "Para cuando un informe, contrato o presentación largo llega a tus manos y necesitas lo esencial antes de comprometerte a leer cada página.",
    steps: [
      "Sube el PDF: hasta 20 páginas.",
      "DockDocs extrae el texto en tu navegador y envía solo ese texto para resumirlo.",
      "La IA destila un resumen, puntos clave y próximos pasos sugeridos del texto de tu archivo.",
      "Revisa el resultado: verifica las cifras y fechas clave con el original.",
    ],
    readingTitle: "Más herramientas de documentos con IA",
    readingDescription: "Herramientas relacionadas para leer, preguntar y comparar documentos con hallazgos rastreables.",
    readingLinks: [
      { label: "Chatea con tu PDF", href: "/chat-with-pdf", description: "Haz preguntas sobre un documento y obtén respuestas basadas en su texto, con la fuente citada." },
      { label: "Revisión de riesgos de contrato", href: "/contract-risk", description: "Haz que la IA señale cláusulas riesgosas, unilaterales o ausentes en un contrato, cada una ligada a su fuente." },
      { label: "Comparar documentos", href: "/compare", description: "Pon varios documentos uno al lado del otro y ve dónde difieren sus términos clave." },
    ],
  },
  pt: {
    benefitsTitle: "O que o resumo com IA oferece",
    benefitsDescription: "A IA lê o texto do seu documento e o condensa em um resumo executivo, pontos principais e próximas etapas sugeridas que você pode revisar num relance.",
    benefits: [
      { title: "Um documento longo, condensado", description: "Transforme um PDF ou arquivo do Office extenso em um resumo executivo, pontos principais, as entidades que importam e ações sugeridas — o essencial num formato que você consegue de fato folhear." },
      { title: "Lido no seu navegador", description: "O texto é extraído do seu arquivo no seu navegador; somente esse texto extraído é enviado à IA para resumir. O arquivo em si nunca é enviado." },
      { title: "Fiel ao seu documento", description: "O resumo é extraído das palavras do seu arquivo — não acrescenta fatos que não estão lá. É uma reescrita, não uma citação literal, então confira os números e datas principais com o original." },
    ],
    workflowTitle: "Como o resumo com IA se encaixa no seu trabalho",
    workflowDescription: "Para quando um relatório, contrato ou apresentação longo cai no seu colo e você precisa do essencial antes de se comprometer a ler cada página.",
    steps: [
      "Envie o PDF: até 20 páginas.",
      "O DockDocs extrai o texto no seu navegador e envia somente esse texto para resumir.",
      "A IA destila um resumo, pontos principais e próximas etapas sugeridas do texto do seu arquivo.",
      "Revise o resultado: confira os números e datas principais com o original.",
    ],
    readingTitle: "Mais ferramentas de documentos com IA",
    readingDescription: "Ferramentas relacionadas para ler, perguntar e comparar documentos com achados rastreáveis.",
    readingLinks: [
      { label: "Converse com seu PDF", href: "/chat-with-pdf", description: "Faça perguntas sobre um documento e obtenha respostas baseadas no seu texto, com a fonte citada." },
      { label: "Análise de risco de contrato", href: "/contract-risk", description: "Faça a IA sinalizar cláusulas arriscadas, unilaterais ou ausentes em um contrato, cada uma ligada à sua fonte." },
      { label: "Comparar documentos", href: "/compare", description: "Coloque vários documentos lado a lado e veja onde seus termos principais diferem." },
    ],
  },
  fr: {
    benefitsTitle: "Ce que le résumé par IA vous apporte",
    benefitsDescription: "L'IA lit le texte de votre document et le condense en un résumé exécutif, des points clés et des prochaines étapes suggérées que vous pouvez parcourir d'un coup d'œil.",
    benefits: [
      { title: "Un long document, condensé", description: "Transformez un PDF ou un fichier Office volumineux en un résumé exécutif, des points clés, les entités qui comptent et des actions suggérées : l'essentiel sous une forme que vous pouvez réellement survoler." },
      { title: "Lu dans votre navigateur", description: "Le texte est extrait de votre fichier dans votre navigateur ; seul ce texte extrait est envoyé à l'IA pour le résumé. Le fichier lui-même n'est jamais téléversé." },
      { title: "Fidèle à votre document", description: "Le résumé est tiré des mots de votre fichier — il n'ajoute pas de faits qui n'y figurent pas. C'est une reformulation, pas une citation mot pour mot, alors vérifiez les chiffres et dates clés avec l'original." },
    ],
    workflowTitle: "Comment le résumé par IA s'intègre à votre travail",
    workflowDescription: "Pour le moment où un long rapport, contrat ou support de présentation atterrit chez vous et où vous avez besoin de l'essentiel avant de vous engager à tout lire.",
    steps: [
      "Déposez le PDF : jusqu'à 20 pages.",
      "DockDocs extrait le texte dans votre navigateur et n'envoie que ce texte pour le résumé.",
      "L'IA distille un résumé, des points clés et des prochaines étapes suggérées à partir du texte de votre fichier.",
      "Parcourez le résultat : vérifiez les chiffres et dates clés avec l'original.",
    ],
    readingTitle: "Plus d'outils documentaires par IA",
    readingDescription: "Outils associés pour lire, interroger et comparer des documents avec des constats traçables.",
    readingLinks: [
      { label: "Discutez avec votre PDF", href: "/chat-with-pdf", description: "Posez des questions sur un document et obtenez des réponses fondées sur son texte, avec la source citée." },
      { label: "Analyse des risques d'un contrat", href: "/contract-risk", description: "Faites signaler par l'IA les clauses risquées, déséquilibrées ou absentes d'un contrat, chacune liée à sa source." },
      { label: "Comparer des documents", href: "/compare", description: "Placez plusieurs documents côte à côte et voyez où leurs termes clés diffèrent." },
    ],
  },
  ja: {
    benefitsTitle: "AI 要約で得られること",
    benefitsDescription: "AI が文書の本文を読み取り、エグゼクティブサマリー・重要なポイント・推奨される次のステップへと凝縮し、ひと目で見直せる形にします。",
    benefits: [
      { title: "長い文書を凝縮", description: "長い PDF や Office ファイルを、エグゼクティブサマリー・重要なポイント・関係する固有名詞・推奨アクションに変換——要点を、実際にざっと目を通せる形にまとめます。" },
      { title: "ブラウザ内で読み取り", description: "テキストはあなたのブラウザ内でファイルから抽出され、その抽出済みテキストだけが要約のために AI に送信されます。ファイル自体はアップロードされません。" },
      { title: "あなたの文書に忠実", description: "要約はあなたのファイルの言葉から作られ、そこにない事実を付け足しません。逐語引用ではなく要約のため、重要な数値や日付は原文と照合してください。" },
    ],
    workflowTitle: "AI 要約が業務にどう役立つか",
    workflowDescription: "長い報告書・契約書・資料が手元に来て、全ページを読み込む前に要点をつかんでおきたいとき。",
    steps: [
      "PDF をアップロード——最大 20 ページ。",
      "DockDocs がブラウザ内でテキストを抽出し、そのテキストだけを要約のために送信します。",
      "AI があなたのファイルの本文から、要約・重要なポイント・推奨される次のステップを抽出します。",
      "結果を見直し——重要な数値や日付を原文と照合します。",
    ],
    readingTitle: "他の AI 文書ツール",
    readingDescription: "文書を読み、問いかけ、比較するための、たどれる指摘付きの関連ツール。",
    readingLinks: [
      { label: "PDF と対話", href: "/chat-with-pdf", description: "文書について質問し、その本文に基づく回答を出典の引用付きで得られます。" },
      { label: "契約リスクチェック", href: "/contract-risk", description: "AI に契約書のリスクのある・一方的な・欠けている条項を、それぞれ出典に紐づけて指摘させます。" },
      { label: "文書を比較", href: "/compare", description: "複数の文書を並べて、重要な条件がどこで食い違うかを確認します。" },
    ],
  },
  de: {
    benefitsTitle: "Was Ihnen die KI-Zusammenfassung bietet",
    benefitsDescription: "Die KI liest den Text Ihres Dokuments und verdichtet ihn zu einer Zusammenfassung für Entscheider, Kernpunkten und vorgeschlagenen nächsten Schritten, die Sie auf einen Blick prüfen können.",
    benefits: [
      { title: "Ein langes Dokument, verdichtet", description: "Verwandeln Sie ein langes PDF oder Office-Dokument in eine Zusammenfassung für Entscheider, Kernpunkte, die relevanten Entitäten und vorgeschlagene Maßnahmen – das Wesentliche in einer Form, die Sie tatsächlich überfliegen können." },
      { title: "Im Browser gelesen", description: "Der Text wird in Ihrem Browser aus Ihrer Datei extrahiert; nur dieser extrahierte Text wird zur Zusammenfassung an die KI gesendet. Die Datei selbst wird nie hochgeladen." },
      { title: "An Ihrem Dokument verankert", description: "Die Zusammenfassung stammt aus den Worten Ihrer Datei – sie fügt keine Fakten hinzu, die nicht darin stehen. Sie ist eine Umformulierung, kein wörtliches Zitat, prüfen Sie also wichtige Zahlen und Daten am Original." },
    ],
    workflowTitle: "Wie eine KI-Zusammenfassung in Ihre Arbeit passt",
    workflowDescription: "Für den Moment, in dem ein langer Bericht, Vertrag oder eine Präsentation bei Ihnen landet und Sie das Wesentliche brauchen, bevor Sie sich ans Lesen jeder Seite machen.",
    steps: [
      "Laden Sie das PDF hoch – bis zu 20 Seiten.",
      "DockDocs extrahiert den Text in Ihrem Browser und sendet nur diesen Text zur Zusammenfassung.",
      "Die KI destilliert aus dem Text Ihrer Datei eine Zusammenfassung, Kernpunkte und vorgeschlagene nächste Schritte.",
      "Prüfen Sie das Ergebnis – gleichen Sie wichtige Zahlen und Daten mit dem Original ab.",
    ],
    readingTitle: "Weitere KI-Dokumententools",
    readingDescription: "Verwandte Tools zum Lesen, Befragen und Vergleichen von Dokumenten mit nachvollziehbaren Befunden.",
    readingLinks: [
      { label: "Mit Ihrem PDF chatten", href: "/chat-with-pdf", description: "Stellen Sie Fragen zu einem Dokument und erhalten Sie Antworten, die auf seinem Text beruhen, mit zitierter Quelle." },
      { label: "Vertragsrisiko-Prüfung", href: "/contract-risk", description: "Lassen Sie die KI riskante, einseitige oder fehlende Klauseln in einem Vertrag markieren, jede an ihre Quelle gebunden." },
      { label: "Dokumente vergleichen", href: "/compare", description: "Stellen Sie mehrere Dokumente nebeneinander und sehen Sie, wo ihre wichtigen Begriffe abweichen." },
    ],
  },
  ko: {
    benefitsTitle: "AI 요약이 무엇을 제공하나요",
    benefitsDescription: "AI가 문서의 텍스트를 읽고 한눈에 검토할 수 있는 핵심 요약, 주요 항목, 권장 다음 단계로 압축합니다.",
    benefits: [
      { title: "긴 문서를 압축", description: "길고 복잡한 PDF나 Office 파일을 핵심 요약, 주요 항목, 중요한 대상, 권장 조치로 바꿉니다 — 실제로 훑어볼 수 있는 형태의 요지입니다." },
      { title: "브라우저에서 읽기", description: "텍스트는 브라우저에서 파일로부터 추출되며, 추출된 그 텍스트만 요약을 위해 AI로 전송됩니다. 파일 자체는 업로드되지 않습니다." },
      { title: "문서에 근거", description: "요약은 파일 속 단어에서 뽑아내며, 거기 없는 사실을 더하지 않습니다. 그대로 옮긴 인용이 아니라 바꿔 쓴 것이므로 핵심 숫자와 날짜는 원본과 대조해 확인하세요." },
    ],
    workflowTitle: "AI 요약이 업무에 어떻게 맞물리나요",
    workflowDescription: "긴 보고서, 계약서, 발표 자료가 손에 들어왔을 때 모든 페이지를 읽기 전에 요지를 파악해야 하는 순간을 위한 기능입니다.",
    steps: [
      "PDF를 업로드하세요 — 최대 20페이지.",
      "DockDocs가 브라우저에서 텍스트를 추출하고 그 텍스트만 요약을 위해 전송합니다.",
      "AI가 파일의 텍스트에서 요약, 주요 항목, 권장 다음 단계를 뽑아냅니다.",
      "결과를 검토하세요 — 핵심 숫자와 날짜는 원본과 대조해 확인하세요.",
    ],
    readingTitle: "더 많은 AI 문서 도구",
    readingDescription: "문서를 읽고, 질문하고, 비교하며 결과를 추적할 수 있는 관련 도구입니다.",
    readingLinks: [
      { label: "PDF와 대화", href: "/chat-with-pdf", description: "문서에 대해 질문하고 그 텍스트에 근거한 답변을 출처 인용과 함께 받으세요." },
      { label: "계약 위험 검토", href: "/contract-risk", description: "AI가 계약서의 위험하거나 한쪽에 치우치거나 빠진 조항을 각각 출처와 함께 표시하게 하세요." },
      { label: "문서 비교", href: "/compare", description: "여러 문서를 나란히 놓고 핵심 조건이 어디서 다른지 확인하세요." },
    ],
},
};


export function AiSummaryClient({ locale = "en", embedded = false }: { locale?: "en" | "zh" | "es" | "pt" | "fr" | "ja" | "de" | "ko" | "zh-Hant"; embedded?: boolean }) {
  // childLocale collapses ko→en for child widgets (UpgradePrompt) whose prop union
  // doesn't include ko. The page's own copy is authored ko (booleans + SECTIONS_KO).
  const childLocale = locale === "ko" ? "en" : locale;
  // zh-Hant derives from zh via OpenCC: treat as zh for ternaries, then convert
  // the chosen zh string to Traditional with `h(...)`.
  const hant = locale === "zh-Hant";
  const zh = locale === "zh" || hant;
  const es = locale === "es";
  const pt = locale === "pt";
  const fr = locale === "fr";
  const ja = locale === "ja";
  const de = locale === "de";
  const ko = locale === "ko";
  const h = (s: string) => (hant ? toHant(s) : s);
  // ko authored in SECTIONS_KO; zh-Hant derives from zh (deepHant); mirrors ChatWithPdfClient.
  const al: AuthoredLocale = locale === "zh-Hant" ? "en" : locale;
  const sec: ToolSectionsContent = locale === "zh-Hant" ? deepHant(SECTIONS.zh) : SECTIONS[al];
  const [status, setStatus] = useState<Status>("idle");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [limitHit, setLimitHit] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) void processFile(file);
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void processFile(file);
  }

  async function processFile(file: File) {
    setError("");
    setSummary(null);
    setLimitHit(null);

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError(zh ? h("请上传 PDF 文件。") : ja ? "PDF ファイルをアップロードしてください。" : es ? "Por favor, sube un archivo PDF." : pt ? "Por favor, envie um arquivo PDF." : fr ? "Veuillez téléverser un fichier PDF." : de ? "Bitte laden Sie eine PDF-Datei hoch." : ko ? "PDF 파일을 업로드하세요." : "Please upload a PDF file.");
      setStatus("error");
      return;
    }
    if (file.size > maxFileBytes) {
      setError(zh ? h("文件超过 25 MB 限制。") : ja ? "ファイルが 25 MB の上限を超えています。" : es ? "El archivo supera el límite de 25 MB." : pt ? "O arquivo ultrapassa o limite de 25 MB." : fr ? "Le fichier dépasse la limite de 25 Mo." : de ? "Die Datei überschreitet das Limit von 25 MB." : ko ? "파일이 25MB 한도를 초과합니다." : "File exceeds the 25 MB limit.");
      setStatus("error");
      return;
    }

    setFileName(file.name);
    setStatus("extracting");

    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const buffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: buffer }).promise;
      const pageCount = Math.min(pdf.numPages, maxPages);
      const pages: string[] = [];

      for (let p = 1; p <= pageCount; p += 1) {
        const page = await pdf.getPage(p);
        const content = await page.getTextContent();
        pages.push(
          content.items
            .map((item) => (item as { str?: string }).str ?? "")
            .filter(Boolean)
            .join(" "),
        );
      }

      const text = pages.join("\n\n").slice(0, maxCharacters);
      if (!text.trim()) {
        setError(zh ? h("无法从该 PDF 提取文字，可能是扫描件。") : ja ? "この PDF からテキストを抽出できませんでした。スキャンされた PDF の可能性があります。" : es ? "No se pudo extraer texto — puede ser un PDF escaneado." : pt ? "Não foi possível extrair texto — pode ser um PDF digitalizado." : fr ? "Aucun texte n'a pu être extrait — il s'agit peut-être d'un PDF numérisé." : de ? "Aus diesem PDF konnte kein Text extrahiert werden – es ist möglicherweise ein gescanntes PDF." : ko ? "이 PDF에서 텍스트를 추출할 수 없습니다 — 스캔한 PDF일 수 있습니다." : "No text could be extracted — it may be a scanned PDF.");
        setStatus("error");
        return;
      }

      setStatus("summarizing");

      const gate = await checkUsage("summary");
      if (!gate.allowed) {
        setLimitHit(gate.limit);
        setStatus("error");
        return;
      }

      const response = await fetch("/api/ai-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, locale, sourceName: file.name }),
      });

      const payload = await response.json().catch(() => null);

      if (!payload?.ok || !payload.summary) {
        throw new Error(
          payload?.message ||
            (zh ? h("AI 摘要服务暂不可用。") : ja ? "AI 要約サービスは現在利用できません。" : es ? "El servicio de resumen IA no está disponible." : pt ? "O serviço de Resumo IA está indisponível." : fr ? "Le service de résumé IA est indisponible." : de ? "Der KI-Zusammenfassungsdienst ist derzeit nicht verfügbar." : ko ? "AI 요약 서비스를 현재 사용할 수 없습니다." : "AI Summary service is unavailable."),
        );
      }

      setSummary(payload.summary as SummaryData);
      setStatus("done");
      trackToolRun("ai-summary");
      await markUsage(gate, "summary");
    } catch (err) {
      setError(err instanceof Error ? err.message : zh ? h("处理失败。") : ja ? "処理に失敗しました。" : es ? "Error al procesar." : pt ? "Falha ao processar." : fr ? "Échec du traitement." : de ? "Verarbeitung fehlgeschlagen." : ko ? "처리에 실패했습니다." : "Processing failed.");
      setStatus("error");
    }
  }

  function reset() {
    setStatus("idle");
    setFileName("");
    setError("");
    setSummary(null);
    setLimitHit(null);
  }

  const nextSteps = summary?.suggestedNextSteps ?? summary?.nextSteps ?? [];

  return (
    <section className={embedded ? "mx-auto w-full max-w-3xl px-8 pb-10 pt-4 flex flex-col" : "mx-auto max-w-5xl"}>
      {embedded && (
        <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">
          {zh ? h("把 PDF 浓缩成执行摘要、关键要点和后续步骤。") : ja ? "PDFを要約・重要点・次のステップへ変換します。" : es ? "Convierte un PDF en resumen ejecutivo, puntos clave y próximos pasos." : pt ? "Transforme um PDF em resumo executivo, pontos-chave e próximos passos." : fr ? "Transformez un PDF en résumé, points clés et prochaines étapes." : de ? "Fassen Sie ein PDF in Zusammenfassung, Kernpunkte und nächste Schritte zusammen." : ko ? "PDF를 요약, 핵심 포인트, 다음 단계로 변환하세요." : "Turn a PDF into an executive summary, key points, and next steps."}
        </p>
      )}
      {/* Upload */}
      {status === "idle" || status === "error" ? (
        <label
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={(e) => { if (e.currentTarget === e.target) setDragging(false); }}
          onDrop={handleDrop}
          className={`${dropzoneShell(dragging)} overflow-y-auto`}
        >
          <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-[color:var(--line)] text-[color:var(--accent)]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4M7 9l5-5 5 5" /><path d="M5 16v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" /></svg>
          </span>
          <span className="inline-flex h-12 w-full max-w-[280px] items-center justify-center rounded-[var(--radius)] bg-[color:var(--accent)] px-6 text-[15px] font-semibold text-white shadow-[0_4px_14px_rgba(62,207,142,0.35)] transition hover:opacity-90">
            {zh ? h("选择 PDF") : ja ? "PDF を選択" : es ? "Elegir PDF" : pt ? "Escolher PDF" : fr ? "Choisir un PDF" : de ? "PDF auswählen" : ko ? "PDF 선택" : "Choose PDF"}
          </span>
          <span className="mt-4 text-sm text-[color:var(--muted)]">
            {zh ? h("或将文件拖放到此处，最多 20 页") : ja ? "またはファイルをここにドラッグ＆ドロップ" : es ? "o arrastra tu archivo aquí. Máx. 20 páginas" : pt ? "ou arraste o arquivo aqui. Máx. 20 páginas" : fr ? "ou déposez votre fichier ici. 20 pages max." : de ? "oder legen Sie Ihre Datei hier ab. Max. 20 Seiten" : ko ? "또는 여기에 파일을 끌어다 놓으세요. 최대 20페이지" : "or drop your file here. Up to 20 pages"}
          </span>
          <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-[color:var(--faint)]">
            <span>{zh ? h("最多 20 页 · 25 MB") : ja ? "最大20ページ · 25MBまで" : es ? "Máx. 25 MB" : pt ? "Máx. 25 MB" : fr ? "25 Mo max." : de ? "Max. 25 MB" : ko ? "최대 25MB" : "Up to 25 MB"}</span>
            <span className="hidden h-3 w-px bg-[color:var(--line)] sm:inline-block" />
            <span className="text-[color:var(--muted)]">{zh ? h("本地读取 · 文字发至AI") : ja ? "ローカルで読み取り · テキストをAIへ送信" : es ? "Leído localmente · texto enviado a IA" : pt ? "Lido localmente · texto enviado a IA" : fr ? "Lu localement · texte envoyé à l'IA" : de ? "Lokal gelesen · Text an KI gesendet" : ko ? "로컬에서 읽기 · 텍스트 AI로 전송" : "File read locally · text sent to AI"}</span>
          </div>
          {status === "error" && error ? (
            <span className="mt-4 text-sm text-[color:var(--error)]">{error}</span>
          ) : null}
          <input type="file" accept="application/pdf,.pdf" className="sr-only" onChange={handleFile} />
        </label>
      ) : null}

      {(status === "idle" || status === "error") && embedded && (
        <WorkspaceValueZone type="ai" locale={locale} />
      )}

      {limitHit !== null ? <UpgradePrompt locale={childLocale} limit={limitHit} /> : null}

      {/* Processing */}
      {status === "extracting" || status === "summarizing" ? (
        <div className="flex aspect-[16/9] w-full flex-col items-center justify-center rounded-[var(--radius-xl)] border border-[color:var(--line)] bg-[color:var(--surface)] p-6 text-center">
          <svg className="mx-auto h-10 w-10 animate-spin text-[color:var(--accent)]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="mt-4 text-sm font-semibold text-[color:var(--foreground)]">
            {status === "extracting"
              ? zh ? h("正在读取 PDF…") : ja ? "PDF を読み取り中…" : es ? "Leyendo el PDF…" : pt ? "Lendo o PDF…" : fr ? "Lecture du PDF…" : de ? "PDF wird gelesen…" : ko ? "PDF를 읽는 중…" : "Reading PDF…"
              : zh ? h("AI 正在生成摘要…") : ja ? "AI が要約を作成中…" : es ? "La IA está resumiendo…" : pt ? "A IA está resumindo…" : fr ? "L'IA résume…" : de ? "Die KI fasst zusammen…" : ko ? "AI가 요약하는 중…" : "AI is summarizing…"}
          </p>
          <p className="mt-1 break-words text-xs text-[color:var(--muted)]">{fileName}</p>
        </div>
      ) : null}

      {/* Result */}
      {status === "done" && summary ? (
        <div className="mx-auto max-w-3xl space-y-4">
          <div className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[color:var(--success-line)] bg-[color:var(--success-surface)] px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--success)] text-sm text-white">✓</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[color:var(--foreground)]">{fileName}</p>
              <p className="text-xs text-[color:var(--muted)]">{zh ? h("摘要已生成") : ja ? "要約を生成しました" : es ? "Resumen generado" : pt ? "Resumo gerado" : fr ? "Résumé généré" : de ? "Zusammenfassung erstellt" : ko ? "요약이 생성되었습니다" : "Summary generated"}</p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="shrink-0 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-1.5 text-xs font-semibold text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--foreground)]"
            >
              {zh ? h("新文档") : ja ? "新しいドキュメント" : es ? "Nuevo documento" : pt ? "Novo documento" : fr ? "Nouveau document" : de ? "Neues Dokument" : ko ? "새 문서" : "New document"}
            </button>
          </div>

          <SummaryBlock title={zh ? h("执行摘要") : ja ? "エグゼクティブサマリー" : es ? "Resumen ejecutivo" : pt ? "Resumo executivo" : fr ? "Résumé exécutif" : de ? "Zusammenfassung für Entscheider" : ko ? "핵심 요약" : "Executive Summary"}>
            <p className="text-sm leading-7 text-[color:var(--muted)]">{summary.executiveSummary}</p>
          </SummaryBlock>

          {summary.keyPoints?.length > 0 && (
            <SummaryBlock title={zh ? h("关键要点") : ja ? "重要なポイント" : es ? "Puntos clave" : pt ? "Pontos principais" : fr ? "Points clés" : de ? "Wichtigste Punkte" : ko ? "주요 항목" : "Key Points"}>
              <ul className="space-y-2">
                {summary.keyPoints.map((point, i) => (
                  <li key={i} className="flex gap-2.5 text-sm leading-6 text-[color:var(--muted)]">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--accent)]" />
                    {point}
                  </li>
                ))}
              </ul>
            </SummaryBlock>
          )}

          {summary.actionItems?.length > 0 && (
            <SummaryBlock title={zh ? h("行动项") : ja ? "アクションアイテム" : es ? "Acciones a realizar" : pt ? "Itens de ação" : fr ? "Points d'action" : de ? "Aufgaben" : ko ? "실행 항목" : "Action Items"}>
              <ul className="space-y-2">
                {summary.actionItems.map((item, i) => (
                  <li key={i} className="flex gap-2.5 text-sm leading-6 text-[color:var(--muted)]">
                    <span className="mt-0.5 text-[color:var(--accent)]">→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </SummaryBlock>
          )}

          {nextSteps.length > 0 && (
            <SummaryBlock title={zh ? h("后续步骤") : ja ? "推奨される次のステップ" : es ? "Próximos pasos sugeridos" : pt ? "Próximas etapas sugeridas" : fr ? "Prochaines étapes suggérées" : de ? "Empfohlene nächste Schritte" : ko ? "권장 다음 단계" : "Suggested Next Steps"}>
              <ul className="space-y-2">
                {nextSteps.map((step, i) => (
                  <li key={i} className="flex gap-2.5 text-sm leading-6 text-[color:var(--muted)]">
                    <span className="mt-0.5 font-semibold text-[color:var(--accent)]">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ul>
            </SummaryBlock>
          )}
        </div>
      ) : null}

      {!embedded && <GroundingNote variant="summary" locale={locale} />}
      {!embedded && <RelatedPdfTools locale={locale} exclude="/ai-summary" />}
      {!embedded && <ToolSections locale={locale} content={sec} />}
    </section>
  );
}

function SummaryBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.1em] text-[color:var(--foreground)]">{title}</h2>
      {children}
    </div>
  );
}
