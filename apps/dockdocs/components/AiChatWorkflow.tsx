"use client";

import { trackToolRun } from "@/lib/track";
import { TrialCta } from "@/components/TrialCta";
import { useEffect, useRef, useState } from "react";
import { deepHant } from "@/lib/zh-hant";
import { AiDocUpload } from "@/components/AiDocUpload";
import {
  askAiAboutPdf,
  type AiChatHistoryTurn,
  type AiChatLocale,
  type AiChatResult,
} from "@/lib/ai-chat-runtime";
import { saveChatForCurrentUser } from "@/lib/account-runtime";
import {
  canStartAiChat,
  consumeQueuedSessionRestore,
  getUsageQuota,
  promptTemplates,
  readFeatureFlags,
  recordChatCompletion,
  type UsageQuota,
  type WorkspaceFeatureFlags,
} from "@/lib/workspace-runtime";
import { LAYOUT } from "@/lib/layout-constants";

type WorkflowStatus =
  | "idle"
  | "ready"
  | "extracting"
  | "asking"
  | "streaming"
  | "validating"
  | "result"
  | "error";

// The chat UI authors native German copy (see copy.de below), but the AI engine
// (askAiAboutPdf / AiChatLocale) has no "de" — a /de visitor's extracted text is
// still answered via the en engine path (de → en fallback). ChatUiLocale widens
// only the UI-copy locale so the German strings render, without changing what is
// sent to the AI provider.
type ChatUiLocale = AiChatLocale | "de" | "zh-Hant";

const pick = (
  locale: ChatUiLocale,
  m: Record<AiChatLocale | "de", string>,
): string => locale === "zh-Hant" ? m["zh"] : m[locale as AiChatLocale | "de"];

const copy = {
  en: {
    eyebrow: "Chat with PDF",
    title: "Ask questions about extracted PDF text.",
    description:
      "DockDocs extracts readable PDF text locally, then sends only the selected text context and your question to the configured AI provider. For scanned PDFs, run OCR first and paste the extracted text here.",
    upload: "Choose PDF",
    pasteLabel: "Or paste OCR / extracted text",
    pastePlaceholder:
      "Paste OCR text or copied PDF text here when the PDF is scanned or image-based.",
    questionLabel: "Question",
    questionPlaceholder:
      "Ask about clauses, risks, dates, obligations, tables, or next steps.",
    ask: "Ask question",
    retry: "Retry",
    reset: "Reset",
    newChat: "New Chat",
    cancel: "Cancel",
    source: "Source",
    context: "Context sent",
    provider: "Provider",
    usage: "Token usage",
    answer: "Answer",
    conversation: "Conversation",
    user: "User",
    assistant: "Assistant",
    references: "References",
    copyReference: "Copy",
    showReference: "Show",
    hideReference: "Hide",
    templates: "Prompt templates",
    quota: "Today",
    quotaRemaining: "remaining",
    quotaExceeded:
      "Daily AI Chat limit reached for this browser. Sign in for a higher local quota or try again tomorrow.",
    privacyTitle: "Privacy behavior",
    privacy:
      "The original PDF file is never sent to the AI provider. Only the extracted text and your question are sent, and only after you start the chat.",
    idle: "Upload a PDF or paste OCR text, then ask a question.",
    ready: "Ready to ask.",
    working: "Asking the document...",
    extractingStatus: "Reading document text...",
    sendingStatus: "Sending context to the AI provider...",
    streamingStatus: "Streaming answer...",
    validatingStatus: "Validating references and token usage...",
    fallbackStatus: "Streaming paused. Finishing with the standard response...",
    cancelled: "Cancelled. The partial answer was not saved.",
    truncated: "Context was trimmed to fit the size limit.",
    verifiedBadge: "Source verified",
  },
  zh: {
    eyebrow: "PDF 问答",
    title: "基于提取文本向 PDF 提问。",
    description:
      "DockDocs 会在浏览器本地提取可读取的 PDF 文本，然后只把选中的文本上下文和你的问题发送给 AI 服务。扫描件请先运行 OCR，再把文字粘贴到这里。",
    upload: "选择 PDF",
    pasteLabel: "或粘贴 OCR / 已提取文本",
    pastePlaceholder: "扫描件或图片型 PDF 可先 OCR，再把文字粘贴到这里。",
    questionLabel: "问题",
    questionPlaceholder: "询问条款、风险、日期、义务、表格或下一步。",
    ask: "提问",
    retry: "重试",
    reset: "重置",
    newChat: "新对话",
    cancel: "取消",
    source: "来源",
    context: "发送上下文",
    provider: "AI 服务",
    usage: "Token 用量",
    answer: "回答",
    conversation: "对话记录",
    user: "用户",
    assistant: "助手",
    references: "引用依据",
    copyReference: "复制",
    showReference: "展开",
    hideReference: "收起",
    templates: "提示词模板",
    quota: "今日额度",
    quotaRemaining: "剩余",
    quotaExceeded:
      "今天的 AI Chat 本地额度已用完。登录后可使用更高额度，或明天再试。",
    privacyTitle: "隐私处理方式",
    privacy:
      "原始 PDF 文件不会发送给 AI 服务。只有在你开始提问后，才会发送提取的文本和你的问题。",
    idle: "上传 PDF 或粘贴 OCR 文本，然后提出问题。",
    ready: "已准备提问。",
    working: "正在询问文档...",
    extractingStatus: "正在读取文档文本...",
    sendingStatus: "正在发送上下文到 AI 服务...",
    streamingStatus: "正在流式生成回答...",
    validatingStatus: "正在校验引用和 token 用量...",
    fallbackStatus: "流式响应中断，正在使用标准响应完成...",
    cancelled: "已取消。未完成回答不会保存到对话记录。",
    truncated: "上下文已按大小限制裁剪。",
    verifiedBadge: "已核对原文",
  },
  es: {
    eyebrow: "Chat con PDF",
    title: "Haz preguntas sobre el texto extraído del PDF.",
    description:
      "DockDocs extrae localmente el texto legible del PDF y luego envía solo el contexto de texto seleccionado y tu pregunta al proveedor de IA configurado. Para PDF escaneados, ejecuta primero el OCR y pega aquí el texto extraído.",
    upload: "Elegir PDF",
    pasteLabel: "O pega texto de OCR / extraído",
    pastePlaceholder:
      "Pega aquí el texto de OCR o el texto copiado del PDF cuando el PDF esté escaneado o sea una imagen.",
    questionLabel: "Pregunta",
    questionPlaceholder:
      "Pregunta sobre cláusulas, riesgos, fechas, obligaciones, tablas o próximos pasos.",
    ask: "Hacer pregunta",
    retry: "Reintentar",
    reset: "Restablecer",
    newChat: "Nuevo chat",
    cancel: "Cancelar",
    source: "Fuente",
    context: "Contexto enviado",
    provider: "Proveedor",
    usage: "Uso de tokens",
    answer: "Respuesta",
    conversation: "Conversación",
    user: "Usuario",
    assistant: "Asistente",
    references: "Referencias",
    copyReference: "Copiar",
    showReference: "Mostrar",
    hideReference: "Ocultar",
    templates: "Plantillas de prompts",
    quota: "Hoy",
    quotaRemaining: "restantes",
    quotaExceeded:
      "Has alcanzado el límite diario de AI Chat de este navegador. Inicia sesión para una cuota local mayor o vuelve a intentarlo mañana.",
    privacyTitle: "Comportamiento de privacidad",
    privacy:
      "El archivo PDF original nunca se envía al proveedor de IA. Solo se envían el texto extraído y tu pregunta, y únicamente después de que inicias el chat.",
    idle: "Sube un PDF o pega texto de OCR y haz una pregunta.",
    ready: "Listo para preguntar.",
    working: "Consultando el documento...",
    extractingStatus: "Leyendo el texto del documento...",
    sendingStatus: "Enviando el contexto al proveedor de IA...",
    streamingStatus: "Transmitiendo la respuesta...",
    validatingStatus: "Validando referencias y uso de tokens...",
    fallbackStatus: "Transmisión en pausa. Finalizando con la respuesta estándar...",
    cancelled: "Cancelado. La respuesta parcial no se guardó.",
    truncated: "El contexto se recortó para ajustarse al límite de tamaño.",
    verifiedBadge: "Fuente verificada",
  },
  pt: {
    eyebrow: "Chat com PDF",
    title: "Faça perguntas sobre o texto extraído do PDF.",
    description:
      "O DockDocs extrai localmente o texto legível do PDF e depois envia apenas o contexto de texto selecionado e sua pergunta ao provedor de IA configurado. Para PDFs digitalizados, execute primeiro o OCR e cole aqui o texto extraído.",
    upload: "Escolher PDF",
    pasteLabel: "Ou cole texto de OCR / extraído",
    pastePlaceholder:
      "Cole aqui o texto de OCR ou o texto copiado do PDF quando o PDF for digitalizado ou baseado em imagem.",
    questionLabel: "Pergunta",
    questionPlaceholder:
      "Pergunte sobre cláusulas, riscos, datas, obrigações, tabelas ou próximos passos.",
    ask: "Fazer pergunta",
    retry: "Tentar novamente",
    reset: "Redefinir",
    newChat: "Novo chat",
    cancel: "Cancelar",
    source: "Fonte",
    context: "Contexto enviado",
    provider: "Provedor",
    usage: "Uso de tokens",
    answer: "Resposta",
    conversation: "Conversa",
    user: "Usuário",
    assistant: "Assistente",
    references: "Referências",
    copyReference: "Copiar",
    showReference: "Mostrar",
    hideReference: "Ocultar",
    templates: "Modelos de prompt",
    quota: "Hoje",
    quotaRemaining: "restantes",
    quotaExceeded:
      "Você atingiu o limite diário de AI Chat deste navegador. Faça login para uma cota local maior ou tente novamente amanhã.",
    privacyTitle: "Comportamento de privacidade",
    privacy:
      "O arquivo PDF original nunca é enviado ao provedor de IA. Apenas o texto extraído e sua pergunta são enviados, e somente depois que você inicia o chat.",
    idle: "Envie um PDF ou cole texto de OCR e faça uma pergunta.",
    ready: "Pronto para perguntar.",
    working: "Consultando o documento...",
    extractingStatus: "Lendo o texto do documento...",
    sendingStatus: "Enviando o contexto ao provedor de IA...",
    streamingStatus: "Transmitindo a resposta...",
    validatingStatus: "Validando referências e uso de tokens...",
    fallbackStatus: "Transmissão pausada. Finalizando com a resposta padrão...",
    cancelled: "Cancelado. A resposta parcial não foi salva.",
    truncated: "O contexto foi reduzido para caber no limite de tamanho.",
    verifiedBadge: "Fonte verificada",
  },
  fr: {
    eyebrow: "Chat avec PDF",
    title: "Posez des questions sur le texte extrait du PDF.",
    description:
      "DockDocs extrait localement le texte lisible du PDF, puis n'envoie que le contexte de texte sélectionné et votre question au fournisseur d'IA configuré. Pour les PDF numérisés, lancez d'abord l'OCR et collez ici le texte extrait.",
    upload: "Choisir un PDF",
    pasteLabel: "Ou collez le texte OCR / extrait",
    pastePlaceholder:
      "Collez ici le texte OCR ou le texte copié du PDF lorsque le PDF est numérisé ou composé d'images.",
    questionLabel: "Question",
    questionPlaceholder:
      "Posez des questions sur les clauses, les risques, les dates, les obligations, les tableaux ou les prochaines étapes.",
    ask: "Poser la question",
    retry: "Réessayer",
    reset: "Réinitialiser",
    newChat: "Nouvelle conversation",
    cancel: "Annuler",
    source: "Source",
    context: "Contexte envoyé",
    provider: "Fournisseur",
    usage: "Utilisation de jetons",
    answer: "Réponse",
    conversation: "Conversation",
    user: "Utilisateur",
    assistant: "Assistant",
    references: "Références",
    copyReference: "Copier",
    showReference: "Afficher",
    hideReference: "Masquer",
    templates: "Modèles de prompts",
    quota: "Aujourd'hui",
    quotaRemaining: "restants",
    quotaExceeded:
      "Limite quotidienne d'AI Chat atteinte pour ce navigateur. Connectez-vous pour un quota local plus élevé ou réessayez demain.",
    privacyTitle: "Comportement en matière de confidentialité",
    privacy:
      "Le fichier PDF original n'est jamais envoyé au fournisseur d'IA. Seuls le texte extrait et votre question sont envoyés, et uniquement après le lancement de la conversation.",
    idle: "Importez un PDF ou collez du texte OCR, puis posez une question.",
    ready: "Prêt à poser une question.",
    working: "Interrogation du document...",
    extractingStatus: "Lecture du texte du document...",
    sendingStatus: "Envoi du contexte au fournisseur d'IA...",
    streamingStatus: "Diffusion de la réponse...",
    validatingStatus: "Validation des références et de l'utilisation des jetons...",
    fallbackStatus: "Diffusion en pause. Finalisation avec la réponse standard...",
    cancelled: "Annulé. La réponse partielle n'a pas été enregistrée.",
    truncated: "Le contexte a été réduit pour respecter la limite de taille.",
    verifiedBadge: "Source vérifiée",
  },
  ja: {
    eyebrow: "PDFと対話",
    title: "抽出した PDF テキストについて質問します。",
    description:
      "DockDocs はブラウザー内で読み取り可能な PDF テキストを抽出し、設定済みの AI プロバイダーには選択したテキストコンテキストと質問のみを送信します。スキャンされた PDF の場合は、先に OCR を実行し、抽出したテキストをここに貼り付けてください。",
    upload: "PDF を選択",
    pasteLabel: "または OCR / 抽出済みテキストを貼り付け",
    pastePlaceholder:
      "PDF がスキャンまたは画像ベースの場合は、OCR テキストやコピーした PDF テキストをここに貼り付けてください。",
    questionLabel: "質問",
    questionPlaceholder:
      "条項、リスク、日付、義務、表、次のステップなどについて質問してください。",
    ask: "質問する",
    retry: "再試行",
    reset: "リセット",
    newChat: "新しいチャット",
    cancel: "キャンセル",
    source: "ソース",
    context: "送信したコンテキスト",
    provider: "プロバイダー",
    usage: "トークン使用量",
    answer: "回答",
    conversation: "会話",
    user: "ユーザー",
    assistant: "アシスタント",
    references: "引用元",
    copyReference: "コピー",
    showReference: "表示",
    hideReference: "折りたたむ",
    templates: "プロンプトテンプレート",
    quota: "本日",
    quotaRemaining: "残り",
    quotaExceeded:
      "このブラウザーの本日の AI Chat 上限に達しました。サインインするとローカルの上限が増えます。または明日もう一度お試しください。",
    privacyTitle: "プライバシーの取り扱い",
    privacy:
      "元の PDF ファイルが AI プロバイダーに送信されることはありません。送信されるのは抽出したテキストと質問のみで、チャットを開始した後にのみ送信されます。",
    idle: "PDF をアップロードするか OCR テキストを貼り付けてから質問してください。",
    ready: "質問の準備ができました。",
    working: "文書に問い合わせています...",
    extractingStatus: "文書テキストを読み込んでいます...",
    sendingStatus: "コンテキストを AI プロバイダーに送信しています...",
    streamingStatus: "回答をストリーミングしています...",
    validatingStatus: "引用元とトークン使用量を検証しています...",
    fallbackStatus: "ストリーミングを一時停止しました。標準応答で完了します...",
    cancelled: "キャンセルしました。未完了の回答は保存されません。",
    truncated: "コンテキストはサイズ制限に合わせて切り詰められました。",
    verifiedBadge: "ソース検証済み",
  },
  de: {
    eyebrow: "Chat mit PDF",
    title: "Stellen Sie Fragen zum extrahierten PDF-Text.",
    description:
      "DockDocs extrahiert den lesbaren PDF-Text lokal und sendet anschließend nur den ausgewählten Textkontext und Ihre Frage an den konfigurierten KI-Anbieter. Führen Sie bei gescannten PDFs zuerst die OCR aus und fügen Sie den extrahierten Text hier ein.",
    upload: "PDF auswählen",
    pasteLabel: "Oder OCR-/extrahierten Text einfügen",
    pastePlaceholder:
      "Fügen Sie hier den OCR-Text oder den aus dem PDF kopierten Text ein, wenn das PDF gescannt oder bildbasiert ist.",
    questionLabel: "Frage",
    questionPlaceholder:
      "Fragen Sie nach Klauseln, Risiken, Daten, Pflichten, Tabellen oder nächsten Schritten.",
    ask: "Frage stellen",
    retry: "Erneut versuchen",
    reset: "Zurücksetzen",
    newChat: "Neuer Chat",
    cancel: "Abbrechen",
    source: "Quelle",
    context: "Gesendeter Kontext",
    provider: "Anbieter",
    usage: "Token-Verbrauch",
    answer: "Antwort",
    conversation: "Konversation",
    user: "Benutzer",
    assistant: "Assistent",
    references: "Belege",
    copyReference: "Kopieren",
    showReference: "Anzeigen",
    hideReference: "Ausblenden",
    templates: "Prompt-Vorlagen",
    quota: "Heute",
    quotaRemaining: "verbleibend",
    quotaExceeded:
      "Das tägliche AI-Chat-Limit für diesen Browser ist erreicht. Melden Sie sich für ein höheres lokales Kontingent an oder versuchen Sie es morgen erneut.",
    privacyTitle: "Umgang mit dem Datenschutz",
    privacy:
      "Die originale PDF-Datei wird niemals an den KI-Anbieter gesendet. Es werden nur der extrahierte Text und Ihre Frage gesendet, und das erst, nachdem Sie den Chat gestartet haben.",
    idle: "Laden Sie ein PDF hoch oder fügen Sie OCR-Text ein und stellen Sie dann eine Frage.",
    ready: "Bereit für Ihre Frage.",
    working: "Das Dokument wird abgefragt ...",
    extractingStatus: "Dokumenttext wird gelesen ...",
    sendingStatus: "Kontext wird an den KI-Anbieter gesendet ...",
    streamingStatus: "Antwort wird gestreamt ...",
    validatingStatus: "Belege und Token-Verbrauch werden geprüft ...",
    fallbackStatus: "Streaming pausiert. Abschluss mit der Standardantwort ...",
    cancelled: "Abgebrochen. Die unvollständige Antwort wurde nicht gespeichert.",
    truncated: "Der Kontext wurde gekürzt, um das Größenlimit einzuhalten.",
    verifiedBadge: "Quelle geprüft",
  },
  ko: {
    eyebrow: "Chat with PDF",
    title: "추출한 PDF 텍스트에 대해 질문하세요.",
    description:
      "DockDocs는 읽을 수 있는 PDF 텍스트를 브라우저에서 추출한 뒤, 선택된 텍스트 컨텍스트와 질문만 설정된 AI 제공업체로 전송합니다. 스캔한 PDF는 먼저 OCR을 실행한 후 추출한 텍스트를 여기에 붙여넣으세요.",
    upload: "PDF 선택",
    pasteLabel: "또는 OCR / 추출한 텍스트 붙여넣기",
    pastePlaceholder:
      "PDF가 스캔본이거나 이미지 기반일 때 OCR 텍스트나 복사한 PDF 텍스트를 여기에 붙여넣으세요.",
    questionLabel: "질문",
    questionPlaceholder:
      "조항, 위험, 날짜, 의무, 표 또는 다음 단계에 대해 질문하세요.",
    ask: "질문하기",
    retry: "다시 시도",
    reset: "초기화",
    newChat: "새 채팅",
    cancel: "취소",
    source: "출처",
    context: "전송된 컨텍스트",
    provider: "제공업체",
    usage: "토큰 사용량",
    answer: "답변",
    conversation: "대화",
    user: "사용자",
    assistant: "어시스턴트",
    references: "참고",
    copyReference: "복사",
    showReference: "표시",
    hideReference: "숨기기",
    templates: "프롬프트 템플릿",
    quota: "오늘",
    quotaRemaining: "남음",
    quotaExceeded:
      "이 브라우저의 오늘 AI 채팅 한도에 도달했습니다. 로그인하면 로컬 한도가 늘어나며, 그렇지 않으면 내일 다시 시도하세요.",
    privacyTitle: "개인정보 처리 방식",
    privacy:
      "원본 PDF 파일은 AI 제공업체로 전송되지 않습니다. 추출한 텍스트와 질문만, 그리고 채팅을 시작한 후에만 전송됩니다.",
    idle: "PDF를 업로드하거나 OCR 텍스트를 붙여넣은 다음 질문하세요.",
    ready: "질문할 준비가 되었습니다.",
    working: "문서에 질문하는 중...",
    extractingStatus: "문서 텍스트를 읽는 중...",
    sendingStatus: "AI 제공업체로 컨텍스트를 전송하는 중...",
    streamingStatus: "답변을 스트리밍하는 중...",
    validatingStatus: "참고 자료와 토큰 사용량을 확인하는 중...",
    fallbackStatus: "스트리밍이 일시 중지되었습니다. 표준 응답으로 마무리하는 중...",
    cancelled: "취소되었습니다. 부분 답변은 저장되지 않았습니다.",
    truncated: "크기 제한에 맞추기 위해 컨텍스트가 잘렸습니다.",
    verifiedBadge: "출처 확인됨",
  },
} as const;

export function AiChatWorkflow({
  locale = "en",
  answerLocale,
}: {
  locale?: ChatUiLocale;
  // Raw route locale for the ANSWER language (de/zh-Hant), separate from the
  // engine `locale` which may be collapsed to en.
  answerLocale?: string;
}) {
  const t = locale === "zh-Hant" ? (deepHant(copy.zh) as unknown as typeof copy.en) : copy[locale as Exclude<ChatUiLocale, "zh-Hant">];
  // The AI engine has no "de"/"zh-Hant"; collapse de→en, zh-Hant→zh for engine calls.
  const engineLocale: AiChatLocale = locale === "de" ? "en" : locale === "zh-Hant" ? "zh" : locale;
  const abortRef = useRef<AbortController | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [question, setQuestion] = useState("");
  const [status, setStatus] = useState<WorkflowStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [progressStep, setProgressStep] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<AiChatResult | null>(null);
  const [streamingAnswer, setStreamingAnswer] = useState("");
  const [history, setHistory] = useState<AiChatHistoryTurn[]>([]);
  const [quota, setQuota] = useState<UsageQuota | null>(null);
  const [featureFlags, setFeatureFlags] = useState<WorkspaceFeatureFlags>(() =>
    readFeatureFlags(),
  );
  const [expandedReferences, setExpandedReferences] = useState<Record<string, boolean>>(
    {},
  );

  const hasDocument = Boolean(file) || pastedText.trim().length > 0;
  const hasQuestion = question.trim().length > 0;
  const isWorking =
    status === "extracting" ||
    status === "asking" ||
    status === "streaming" ||
    status === "validating";

  useEffect(() => {
    if (status === "idle" || status === "ready") {
      setStatus(hasDocument && hasQuestion ? "ready" : "idle");
    }
  }, [hasDocument, hasQuestion, status]);

  useEffect(() => {
    let mounted = true;

    getUsageQuota().then((nextQuota) => {
      if (mounted) {
        setQuota(nextQuota);
      }
    });
    setFeatureFlags(readFeatureFlags());

    const restoredSession = consumeQueuedSessionRestore();
    if (restoredSession?.contextText) {
      setPastedText(restoredSession.contextText);
      setHistory(restoredSession.turns.slice(-8));
      setResult(null);
      setStatus("ready");
    }

    return () => {
      mounted = false;
    };
  }, []);

  function chooseFile(fileList: FileList | null) {
    const selected = fileList?.[0] ?? null;
    setError("");
    setResult(null);

    if (!selected) {
      return;
    }

    if (
      selected.type !== "application/pdf" &&
      !selected.name.toLowerCase().endsWith(".pdf")
    ) {
      setError(
        pick(locale, {
          en: "Upload a PDF file.",
          zh: "请上传 PDF 文件。",
          es: "Sube un archivo PDF.",
          pt: "Envie um arquivo PDF.",
          fr: "Importez un fichier PDF.",
          ja: "PDF ファイルをアップロードしてください。",
          ko: "PDF 파일을 업로드하세요.",
          de: "Laden Sie eine PDF-Datei hoch.",
        }),
      );
      setStatus("error");
      return;
    }

    setFile(selected);
    setStatus(question.trim() ? "ready" : "idle");
  }

  async function startChat() {
    if (!hasDocument || !hasQuestion) {
      setError(t.idle);
      setStatus("error");
      return;
    }

    const quotaCheck = await canStartAiChat();
    setQuota(quotaCheck.quota);
    if (!quotaCheck.allowed) {
      setError(t.quotaExceeded);
      setStatus("error");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setError("");
    setResult(null);
    setStreamingAnswer("");
    setProgress(0);
    setProgressStep(t.extractingStatus);
    setStatus("extracting");

    try {
      const answer = await askAiAboutPdf({
        file,
        pastedText,
        question,
        history,
        locale: engineLocale,
        answerLocale,
        signal: controller.signal,
        onProgress: ({ progress: nextProgress, step }) => {
          setProgress(nextProgress);
          setProgressStep(nextProgress >= 70 ? t.sendingStatus : step);
          setStatus(nextProgress >= 70 ? "asking" : "extracting");
        },
        onAnswerDelta: (text) => {
          if (!text) {
            return;
          }

          setStreamingAnswer((current) => `${current}${text}`);
          setProgress((current) => Math.max(current, 85));
          setProgressStep(t.streamingStatus);
          setStatus("streaming");
        },
        onStreamStatus: (streamStatus) => {
          if (streamStatus === "streaming") {
            setProgress((current) => Math.max(current, 85));
            setProgressStep(t.streamingStatus);
            setStatus("streaming");
          }

          if (streamStatus === "validating") {
            setProgress((current) => Math.max(current, 95));
            setProgressStep(t.validatingStatus);
            setStatus("validating");
          }

          if (streamStatus === "fallback") {
            setStreamingAnswer("");
            setProgress((current) => Math.max(current, 75));
            setProgressStep(t.fallbackStatus);
            setStatus("asking");
          }
        },
      });

      if (controller.signal.aborted) {
        return;
      }

      setResult(answer);
      trackToolRun("chat-with-pdf");
      setStreamingAnswer("");
      await saveChatForCurrentUser({
        question: question.trim(),
        result: answer,
      });
      await recordChatCompletion({
        question: question.trim(),
        result: answer,
        history,
        contextText: answer.contextText ?? pastedText,
      });
      setQuota(await getUsageQuota());
      setHistory((currentHistory) =>
        [
          ...currentHistory,
          {
            question: question.trim(),
            answer: answer.answer,
          },
        ].slice(-8),
      );
      setQuestion("");
      setProgress(100);
      setStatus("result");
    } catch (chatError) {
      if (controller.signal.aborted) {
        return;
      }

      const message =
        chatError instanceof Error
          ? chatError.message
          : pick(locale, {
              en: "Chat with PDF failed.",
              zh: "PDF 问答失败。",
              es: "El chat con PDF falló.",
              pt: "O chat com PDF falhou.",
              fr: "Échec du chat avec PDF.",
              ja: "PDF とのチャットに失敗しました。",
              ko: "Chat with PDF에 실패했습니다.",
              de: "Chat mit PDF fehlgeschlagen.",
            });
      setError(
        message === "aborted"
          ? pick(locale, {
              en: "Cancelled.",
              zh: "已取消。",
              es: "Cancelado.",
              pt: "Cancelado.",
              fr: "Annulé.",
              ja: "キャンセルしました。",
              ko: "취소되었습니다.",
              de: "Abgebrochen.",
            })
          : message,
      );
      setProgress(0);
      setProgressStep("");
      setStatus("error");
    }
  }

  function cancel() {
    abortRef.current?.abort();
    setStreamingAnswer("");
    setError(t.cancelled);
    setStatus(hasDocument && hasQuestion ? "ready" : "idle");
    setProgress(0);
    setProgressStep("");
  }

  function reset() {
    abortRef.current?.abort();
    setFile(null);
    setPastedText("");
    setQuestion("");
    setStatus("idle");
    setProgress(0);
    setProgressStep("");
    setError("");
    setResult(null);
    setStreamingAnswer("");
    setHistory([]);
  }

  function newChat() {
    abortRef.current?.abort();
    setQuestion("");
    setHistory([]);
    setResult(null);
    setStreamingAnswer("");
    setError("");
    setProgress(0);
    setProgressStep("");
    setStatus("idle");
  }

  function updateReadyState(
    nextQuestion = question,
    nextText = pastedText,
    nextFile = file,
  ) {
    setStatus(
      (nextFile || nextText.trim()) && nextQuestion.trim() ? "ready" : "idle",
    );
  }

  function toggleReference(reference: string) {
    setExpandedReferences((current) => ({
      ...current,
      [reference]: !current[reference],
    }));
  }

  async function copyReference(reference: string) {
    await navigator.clipboard?.writeText(reference).catch(() => undefined);
  }

  return (
    <section
      id="chat-with-pdf"
      data-ai-chat-status={status}
      className="border-b border-[color:var(--line)] bg-[color:var(--surface-subtle)] py-16"
    >
      <div className={`mx-auto ${LAYOUT.content} px-5 sm:px-6 lg:px-8`}>
        <p className="text-sm font-mono uppercase tracking-[0.1em] text-[color:var(--faint)]">
          {t.eyebrow}
        </p>
        <h2 className="mt-4 break-words text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">
          {t.title}
        </h2>
        <p className="mt-4 text-sm leading-7 text-[color:var(--muted)] sm:text-base">
          {t.description}
        </p>

        <div className="mt-6">
          <TrialCta
            variant="tool-pro"
            locale={locale}
            hookTitle={
              locale === "zh" ? "上传这份文档，7 天内免费向它提无限问题"
                : locale === "zh-Hant" ? "上傳這份文件，7 天內免費向它提無限問題"
                : locale === "es" ? "Este documento — 7 días para hacerle preguntas ilimitadas con IA."
                : locale === "pt" ? "Este documento — 7 dias para fazer perguntas ilimitadas com IA."
                : locale === "fr" ? "Ce document — 7 jours pour poser des questions illimitées par IA."
                : locale === "ja" ? "この文書——7日間、AIに何でも質問し放題。"
                : locale === "ko" ? "이 문서——7일 동안 AI에게 무제한 질문하세요."
                : locale === "de" ? "Dieses Dokument — 7 Tage, um es unbegrenzt per KI zu befragen."
                : "This document — 7 days to ask it unlimited AI questions."
            }
          />
        </div>

        <div className="mt-8 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4">
          <AiDocUpload
            buttonLabel={t.upload}
            resetLabel={t.reset}
            extraActions={
              <button
                type="button"
                onClick={newChat}
                disabled={isWorking || history.length === 0}
                className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-5 py-3 text-sm font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t.newChat}
              </button>
            }
            inputData={{ "data-ai-chat-input": "pdf" }}
            fileName={file?.name}
            idleText={t.idle}
            disabled={isWorking}
            onFiles={chooseFile}
            onReset={reset}
          >
            <label className="mt-5 block text-sm font-semibold text-[color:var(--foreground)]">
              {t.pasteLabel}
            </label>
            <textarea
              value={pastedText}
              onChange={(event) => {
                setPastedText(event.target.value);
                updateReadyState(question, event.target.value);
                setError("");
                setResult(null);
                setStreamingAnswer("");
              }}
              disabled={isWorking}
              placeholder={t.pastePlaceholder}
              className="mt-3 min-h-28 w-full resize-y rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4 text-sm leading-6 text-[color:var(--foreground)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--foreground)] disabled:opacity-60"
            />
            <label className="mt-5 block text-sm font-semibold text-[color:var(--foreground)]">
              {t.questionLabel}
            </label>
            <input
              value={question}
              onChange={(event) => {
                setQuestion(event.target.value);
                updateReadyState(event.target.value, pastedText);
                setError("");
                setResult(null);
                setStreamingAnswer("");
              }}
              disabled={isWorking}
              placeholder={t.questionPlaceholder}
              className="mt-3 min-h-11 w-full rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--foreground)] disabled:opacity-60"
            />
            {featureFlags.templates ? (
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                  {t.templates}
                </p>
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {promptTemplates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => {
                        setQuestion(template.prompt);
                        updateReadyState(template.prompt, pastedText);
                      }}
                      disabled={isWorking}
                      className="shrink-0 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-2 text-xs font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)] disabled:opacity-50"
                    >
                      {template.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </AiDocUpload>

          <div className="mt-4 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-4">
            {featureFlags.quota && quota ? (
              <div className="mb-4 grid gap-2 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] p-3 text-sm sm:grid-cols-3">
                <p className="font-semibold text-[color:var(--foreground)]">
                  {t.quota}: {quota.used}/{quota.limit}
                </p>
                <p className="font-semibold text-[color:var(--muted)]">
                  {quota.remaining} {t.quotaRemaining}
                </p>
                <p className="font-semibold text-[color:var(--muted)]">
                  {quota.signedIn
                    ? pick(locale, {
                        en: "Signed in",
                        zh: "已登录",
                        es: "Sesión iniciada",
                        pt: "Conectado",
                        fr: "Connecté",
                        ja: "サインイン済み",
                        ko: "로그인됨",
                        de: "Angemeldet",
                      })
                    : pick(locale, {
                        en: "Anonymous",
                        zh: "匿名",
                        es: "Anónimo",
                        pt: "Anônimo",
                        fr: "Anonyme",
                        ja: "匿名",
                        ko: "익명",
                        de: "Anonym",
                      })}
                </p>
              </div>
            ) : null}
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={startChat}
                disabled={!hasDocument || !hasQuestion || isWorking}
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-[color:var(--on-accent)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isWorking ? t.working : t.ask}
              </button>
              {isWorking ? (
                <button
                  type="button"
                  onClick={cancel}
                  className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-5 py-3 text-sm font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]"
                >
                  {t.cancel}
                </button>
              ) : null}
            </div>

            {isWorking ? (
              <div className="mt-4">
                <div className="h-2 overflow-hidden rounded-full bg-[color:var(--line)]">
                  <div
                    className="h-full rounded-full bg-[color:var(--foreground)] transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-3 text-sm font-medium text-[color:var(--muted)]">
                  {progressStep}
                </p>
              </div>
            ) : null}

            {error ? (
              <div
                role="alert"
                className="mt-4 rounded-[var(--radius)] border border-[color:var(--error-line)] bg-[color:var(--error-surface)] p-4 text-sm leading-6 text-[color:var(--error)]"
              >
                {error}
                {status === "error" && hasDocument && hasQuestion ? (
                  <button
                    type="button"
                    onClick={startChat}
                    className="mt-3 inline-flex min-h-10 items-center justify-center rounded-full bg-[color:var(--error)] px-4 py-2 text-sm font-semibold text-[color:var(--background)] transition hover:opacity-90"
                  >
                    {t.retry}
                  </button>
                ) : null}
              </div>
            ) : null}

            {status === "ready" && !error ? (
              <p className="mt-4 text-sm font-medium text-[color:var(--muted)]">{t.ready}</p>
            ) : null}
          </div>

          {history.length > 0 ? (
            <section className="mt-4 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
              <h3 className="text-lg font-semibold text-[color:var(--foreground)]">
                {t.conversation}
              </h3>
              <div className="mt-4 grid gap-3">
                {history.map((turn, index) => (
                  <div key={`${index}-${turn.question}`} className="grid gap-2">
                    <div className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                        {t.user}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[color:var(--foreground)]">
                        {turn.question}
                      </p>
                    </div>
                    <div className="rounded-[var(--radius)] border border-[color:var(--soft-accent)] bg-[color:var(--soft-accent)] p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--accent)]">
                        {t.assistant}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[color:var(--accent-strong)]">
                        {turn.answer}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {result || streamingAnswer ? (
            <div className="mt-4 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
              {result ? (
                <dl className="grid gap-3 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="font-semibold text-[color:var(--muted)]">{t.source}</dt>
                    <dd className="mt-1 break-words font-semibold text-[color:var(--foreground)]">
                      {result.sourceName}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[color:var(--muted)]">{t.context}</dt>
                    <dd className="mt-1 font-semibold text-[color:var(--foreground)]">
                      {result.contextCharacters}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[color:var(--muted)]">{t.provider}</dt>
                    <dd className="mt-1 break-words font-semibold text-[color:var(--foreground)]">
                      {[result.provider, result.model].filter(Boolean).join(" / ") ||
                        "AI"}
                    </dd>
                  </div>
                </dl>
              ) : null}

              {result?.truncated ? (
                <p className="mt-4 rounded-[var(--radius-sm)] border border-[color:var(--warning-line)] bg-[color:var(--warning-surface)] p-3 text-sm leading-6 text-[color:var(--warning)]">
                  {t.truncated}
                </p>
              ) : null}

              <section className="mt-6 border-t border-[color:var(--line)] pt-5">
                <h3 className="text-lg font-semibold text-[color:var(--foreground)]">{t.answer}</h3>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[color:var(--muted)]">
                  {result?.answer ?? streamingAnswer}
                </p>
              </section>
              {result ? (
                <section className="mt-6 border-t border-[color:var(--line)] pt-5">
                  <h3 className="text-lg font-semibold text-[color:var(--foreground)]">
                    {t.references}
                  </h3>
                  <ul className="mt-3 grid gap-2 text-sm leading-6 text-[color:var(--muted)]">
                    {result.references.map((reference) => {
                      const expanded = Boolean(expandedReferences[reference]);
                      const canCollapse =
                        featureFlags.citationViewer && reference.length > 180;
                      return (
                        <li
                          key={reference}
                          className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3"
                        >
                          <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-[rgba(62,207,142,0.1)] px-2 py-0.5 text-[11px] font-semibold text-[color:var(--accent)]">
                            ✓ {t.verifiedBadge}
                          </span>
                          <p className={`mt-1 text-sm ${expanded || !canCollapse ? "" : "line-clamp-3"}`}>
                            {reference}
                          </p>
                          {featureFlags.citationViewer ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => copyReference(reference)}
                                className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-1.5 text-xs font-semibold text-[color:var(--foreground)]"
                              >
                                {t.copyReference}
                              </button>
                              {canCollapse ? (
                                <button
                                  type="button"
                                  onClick={() => toggleReference(reference)}
                                  className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-1.5 text-xs font-semibold text-[color:var(--foreground)]"
                                >
                                  {expanded ? t.hideReference : t.showReference}
                                </button>
                              ) : null}
                            </div>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ) : null}
              {result?.usage ? (
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                  {t.usage}:{" "}
                  {[
                    result.usage.prompt_tokens
                      ? `prompt ${result.usage.prompt_tokens}`
                      : "",
                    result.usage.completion_tokens
                      ? `completion ${result.usage.completion_tokens}`
                      : "",
                    result.usage.total_tokens
                      ? `total ${result.usage.total_tokens}`
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" / ")}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="mt-8 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-5">
          <h3 className="font-semibold text-[color:var(--foreground)]">{t.privacyTitle}</h3>
          <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{t.privacy}</p>
        </div>
      </div>
    </section>
  );
}
