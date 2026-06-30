"use client";

import { trackToolRun } from "@/lib/track";
import { useEffect, useRef, useState } from "react";
import { dropzoneVisual } from "@/components/design";
import {
  analyzeDocument,
  type DocumentAnalysis,
} from "@/lib/document-analyzer-runtime";
import type { AiChatLocale, AiChatProgress } from "@/lib/ai-chat-runtime";
import { deepHant } from "@/lib/zh-hant";
import {
  readWorkspaceSnapshot,
  recordDocumentAnalysisCompletion,
  type SavedWorkspaceSession,
} from "@/lib/workspace-runtime";
import { LAYOUT } from "@/lib/layout-constants";

type AnalyzerStatus =
  | "idle"
  | "ready"
  | "extracting"
  | "analyzing"
  | "result"
  | "error";

type AnalyzerUiLocale = AiChatLocale | "de" | "zh-Hant";

const pick = (
  locale: AnalyzerUiLocale,
  m: Record<AiChatLocale | "de", string>,
): string => locale === "zh-Hant" ? m["zh"] : m[locale as AiChatLocale | "de"];

const copy = {
  en: {
    eyebrow: "Document analysis",
    title: "Analyze a document before you start asking questions.",
    description:
      "Upload a PDF, paste OCR text, or analyze a saved chat context. DockDocs sends only extracted text to the AI provider and returns structured workspace notes.",
    upload: "Choose PDF",
    pasteLabel: "OCR text or chat context",
    pastePlaceholder:
      "Paste extracted OCR text, copied PDF text, or a chat context here.",
    analyze: "Analyze document",
    analyzing: "Analyzing...",
    reset: "Reset",
    latestContext: "Use latest saved chat context",
    source: "Source",
    context: "Context analyzed",
    usage: "Token usage",
    provider: "Provider",
    summary: "Document Summary",
    keyDates: "Key Dates",
    keyAmounts: "Key Amounts",
    people: "People / Organizations",
    risks: "Risks",
    actionItems: "Action Items",
    references: "References",
    verifiedBadge: "Source verified",
    idle: "Upload a PDF or paste text to start.",
    ready: "Ready to analyze.",
    truncated: "Context was trimmed to fit the size limit.",
    noSavedContext: "No saved chat context yet.",
    notFound: "Not found",
  },
  zh: {
    eyebrow: "文档分析",
    title: "提问前先自动分析文档。",
    description:
      "上传 PDF、粘贴 OCR 文本，或分析已保存的对话上下文。DockDocs 只把提取的文本发送给 AI 服务，并返回结构化的工作笔记。",
    upload: "选择 PDF",
    pasteLabel: "OCR 文本或 Chat Context",
    pastePlaceholder: "粘贴 OCR 文本、复制的 PDF 文本或 Chat Context。",
    analyze: "分析文档",
    analyzing: "正在分析...",
    reset: "重置",
    latestContext: "使用最近保存的 Chat Context",
    source: "来源",
    context: "分析上下文",
    usage: "Token 用量",
    provider: "AI 服务",
    summary: "文档总结",
    keyDates: "关键日期",
    keyAmounts: "关键金额",
    people: "人员 / 机构",
    risks: "风险",
    actionItems: "行动项",
    references: "引用依据",
    verifiedBadge: "已核对原文",
    idle: "上传 PDF 或粘贴文本开始分析。",
    ready: "已准备分析。",
    truncated: "上下文已按大小限制裁剪。",
    noSavedContext: "暂无已保存的 Chat Context。",
    notFound: "未找到",
  },
  es: {
    eyebrow: "Análisis de documentos",
    title: "Analiza un documento antes de empezar a hacer preguntas.",
    description:
      "Sube un PDF, pega texto de OCR o analiza un contexto de chat guardado. DockDocs envía solo el texto extraído al proveedor de IA y devuelve notas de trabajo estructuradas.",
    upload: "Elegir PDF",
    pasteLabel: "Texto de OCR o contexto de chat",
    pastePlaceholder:
      "Pega aquí texto de OCR extraído, texto copiado del PDF o un contexto de chat.",
    analyze: "Analizar documento",
    analyzing: "Analizando...",
    reset: "Restablecer",
    latestContext: "Usar el último contexto de chat guardado",
    source: "Fuente",
    context: "Contexto analizado",
    usage: "Uso de tokens",
    provider: "Proveedor",
    summary: "Resumen del documento",
    keyDates: "Fechas clave",
    keyAmounts: "Importes clave",
    people: "Personas / Organizaciones",
    risks: "Riesgos",
    actionItems: "Acciones",
    references: "Referencias",
    verifiedBadge: "Fuente verificada",
    idle: "Sube un PDF o pega texto para empezar.",
    ready: "Listo para analizar.",
    truncated: "El contexto se recortó para ajustarse al límite de tamaño.",
    noSavedContext: "Aún no hay contexto de chat guardado.",
    notFound: "No encontrado",
  },
  pt: {
    eyebrow: "Análise de documentos",
    title: "Analise um documento antes de começar a fazer perguntas.",
    description:
      "Envie um PDF, cole texto de OCR ou analise um contexto de chat salvo. O DockDocs envia apenas o texto extraído ao provedor de IA e retorna notas de trabalho estruturadas.",
    upload: "Escolher PDF",
    pasteLabel: "Texto de OCR ou contexto de chat",
    pastePlaceholder:
      "Cole aqui texto de OCR extraído, texto copiado do PDF ou um contexto de chat.",
    analyze: "Analisar documento",
    analyzing: "Analisando...",
    reset: "Redefinir",
    latestContext: "Usar o último contexto de chat salvo",
    source: "Fonte",
    context: "Contexto analisado",
    usage: "Uso de tokens",
    provider: "Provedor",
    summary: "Resumo do documento",
    keyDates: "Datas-chave",
    keyAmounts: "Valores-chave",
    people: "Pessoas / Organizações",
    risks: "Riscos",
    actionItems: "Ações",
    references: "Referências",
    verifiedBadge: "Fonte verificada",
    idle: "Envie um PDF ou cole texto para começar.",
    ready: "Pronto para analisar.",
    truncated: "O contexto foi reduzido para caber no limite de tamanho.",
    noSavedContext: "Ainda não há contexto de chat salvo.",
    notFound: "Não encontrado",
  },
  fr: {
    eyebrow: "Analyse de documents",
    title: "Analysez un document avant de commencer à poser des questions.",
    description:
      "Importez un PDF, collez du texte OCR ou analysez un contexte de conversation enregistré. DockDocs n'envoie que le texte extrait au fournisseur d'IA et renvoie des notes de travail structurées.",
    upload: "Choisir un PDF",
    pasteLabel: "Texte OCR ou contexte de conversation",
    pastePlaceholder:
      "Collez ici du texte OCR extrait, du texte copié du PDF ou un contexte de conversation.",
    analyze: "Analyser le document",
    analyzing: "Analyse en cours...",
    reset: "Réinitialiser",
    latestContext: "Utiliser le dernier contexte de conversation enregistré",
    source: "Source",
    context: "Contexte analysé",
    usage: "Utilisation de jetons",
    provider: "Fournisseur",
    summary: "Résumé du document",
    keyDates: "Dates clés",
    keyAmounts: "Montants clés",
    people: "Personnes / Organisations",
    risks: "Risques",
    actionItems: "Actions à mener",
    references: "Références",
    verifiedBadge: "Source vérifiée",
    idle: "Importez un PDF ou collez du texte pour commencer.",
    ready: "Prêt à analyser.",
    truncated: "Le contexte a été réduit pour respecter la limite de taille.",
    noSavedContext: "Aucun contexte de conversation enregistré pour l'instant.",
    notFound: "Introuvable",
  },
  ja: {
    eyebrow: "文書分析",
    title: "質問を始める前に文書を分析します。",
    description:
      "PDF をアップロードするか、OCR テキストを貼り付けるか、保存済みのチャットコンテキストを分析します。DockDocs は抽出したテキストのみを AI プロバイダーに送信し、構造化された作業メモを返します。",
    upload: "PDF を選択",
    pasteLabel: "OCR テキストまたはチャットコンテキスト",
    pastePlaceholder:
      "抽出した OCR テキスト、コピーした PDF テキスト、またはチャットコンテキストをここに貼り付けてください。",
    analyze: "文書を分析",
    analyzing: "分析しています...",
    reset: "リセット",
    latestContext: "最後に保存したチャットコンテキストを使用",
    source: "ソース",
    context: "分析したコンテキスト",
    usage: "トークン使用量",
    provider: "プロバイダー",
    summary: "文書の概要",
    keyDates: "重要な日付",
    keyAmounts: "重要な金額",
    people: "人物 / 組織",
    risks: "リスク",
    actionItems: "アクション項目",
    references: "引用元",
    verifiedBadge: "ソース検証済み",
    idle: "PDF をアップロードするかテキストを貼り付けて分析を開始します。",
    ready: "分析の準備ができました。",
    truncated: "コンテキストはサイズ制限に合わせて切り詰められました。",
    noSavedContext: "保存済みのチャットコンテキストはまだありません。",
    notFound: "見つかりません",
  },
  ko: {
    eyebrow: "문서 분석",
    title: "질문을 시작하기 전에 문서를 분석하세요.",
    description:
      "PDF를 업로드하거나 OCR 텍스트를 붙여넣거나 저장된 채팅 컨텍스트를 분석하세요. DockDocs는 추출한 텍스트만 AI 제공업체로 전송하고 구조화된 작업 노트를 반환합니다.",
    upload: "PDF 선택",
    pasteLabel: "OCR 텍스트 또는 채팅 컨텍스트",
    pastePlaceholder:
      "추출한 OCR 텍스트, 복사한 PDF 텍스트 또는 채팅 컨텍스트를 여기에 붙여넣으세요.",
    analyze: "문서 분석",
    analyzing: "분석 중...",
    reset: "초기화",
    latestContext: "최근 저장된 채팅 컨텍스트 사용",
    source: "출처",
    context: "분석된 컨텍스트",
    usage: "토큰 사용량",
    provider: "제공업체",
    summary: "문서 요약",
    keyDates: "주요 날짜",
    keyAmounts: "주요 금액",
    people: "인물 / 조직",
    risks: "위험",
    actionItems: "실행 항목",
    references: "참고",
    verifiedBadge: "출처 확인됨",
    idle: "PDF를 업로드하거나 텍스트를 붙여넣어 시작하세요.",
    ready: "분석할 준비가 되었습니다.",
    truncated: "크기 제한에 맞추기 위해 컨텍스트가 잘렸습니다.",
    noSavedContext: "아직 저장된 채팅 컨텍스트가 없습니다.",
    notFound: "찾을 수 없음",
  },
  de: {
    eyebrow: "Dokumentanalyse",
    title: "Analysieren Sie ein Dokument, bevor Sie Fragen stellen.",
    description:
      "Laden Sie ein PDF hoch, fügen Sie OCR-Text ein oder analysieren Sie einen gespeicherten Chat-Kontext. DockDocs sendet nur den extrahierten Text an den KI-Anbieter und gibt strukturierte Arbeitsnotizen zurück.",
    upload: "PDF auswählen",
    pasteLabel: "OCR-Text oder Chat-Kontext",
    pastePlaceholder:
      "Fügen Sie hier extrahierten OCR-Text, kopierten PDF-Text oder einen Chat-Kontext ein.",
    analyze: "Dokument analysieren",
    analyzing: "Wird analysiert ...",
    reset: "Zurücksetzen",
    latestContext: "Letzten gespeicherten Chat-Kontext verwenden",
    source: "Quelle",
    context: "Analysierter Kontext",
    usage: "Token-Verbrauch",
    provider: "Anbieter",
    summary: "Dokumentzusammenfassung",
    keyDates: "Wichtige Daten",
    keyAmounts: "Wichtige Beträge",
    people: "Personen / Organisationen",
    risks: "Risiken",
    actionItems: "Maßnahmen",
    references: "Belege",
    verifiedBadge: "Quelle geprüft",
    idle: "Laden Sie ein PDF hoch oder fügen Sie Text ein, um zu beginnen.",
    ready: "Bereit zur Analyse.",
    truncated: "Der Kontext wurde gekürzt, um das Größenlimit einzuhalten.",
    noSavedContext: "Noch kein Chat-Kontext gespeichert.",
    notFound: "Nicht gefunden",
  },
} as const;

export function DocumentAnalyzerWorkflow({
  locale = "en",
  answerLocale,
}: {
  locale?: AnalyzerUiLocale;
  // Raw route locale for the ANSWER language; separate from the engine locale.
  answerLocale?: string;
}) {
  const t = locale === "zh-Hant" ? (deepHant(copy.zh) as unknown as typeof copy.en) : copy[locale as Exclude<AnalyzerUiLocale, "zh-Hant">];
  // The AI engine has no "de"/"zh-Hant"; collapse de→en, zh-Hant→zh for engine calls.
  const engineLocale: AiChatLocale = locale === "de" ? "en" : locale === "zh-Hant" ? "zh" : locale;
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const [status, setStatus] = useState<AnalyzerStatus>("idle");
  const [progress, setProgress] = useState<AiChatProgress>({
    progress: 0,
    step: "",
  });
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [latestSession, setLatestSession] = useState<SavedWorkspaceSession | null>(
    null,
  );

  const hasDocument = Boolean(file) || pastedText.trim().length > 0;
  const isWorking = status === "extracting" || status === "analyzing";

  useEffect(() => {
    let mounted = true;

    readWorkspaceSnapshot().then((snapshot) => {
      if (mounted) {
        setLatestSession(snapshot.sessions[0] ?? null);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  async function chooseFile(fileList: FileList | null) {
    const selected = fileList?.[0] ?? null;
    setError("");
    setAnalysis(null);

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
    setPastedText("");
    await startAnalysis({ nextFile: selected, nextText: "" });
  }

  async function startAnalysis({
    nextFile = file,
    nextText = pastedText,
    chatContext,
    chatContextName,
  }: {
    nextFile?: File | null;
    nextText?: string;
    chatContext?: string;
    chatContextName?: string;
  } = {}) {
    if (!nextFile && !nextText.trim() && !chatContext?.trim()) {
      setError(t.idle);
      setStatus("error");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setError("");
    setAnalysis(null);
    setProgress({
      progress: 0,
      step: "",
    });
    setStatus("extracting");

    try {
      const result = await analyzeDocument({
        file: nextFile,
        pastedText: nextText,
        chatContext,
        chatContextName,
        locale: engineLocale,
        answerLocale,
        signal: controller.signal,
        onProgress: (nextProgress) => {
          setProgress(nextProgress);
          setStatus(nextProgress.progress >= 70 ? "analyzing" : "extracting");
        },
      });

      if (controller.signal.aborted) {
        return;
      }

      setAnalysis(result);
      trackToolRun("document-analyzer");
      await recordDocumentAnalysisCompletion({
        source: result.source,
        sourceName: result.sourceName,
        contextCharacters: result.contextCharacters,
        truncated: result.truncated,
        usage: result.usage,
      });
      setStatus("result");
    } catch (analyzerError) {
      if (controller.signal.aborted) {
        return;
      }

      setError(
        analyzerError instanceof Error
          ? analyzerError.message
          : pick(locale, {
              en: "Document analysis failed.",
              zh: "文档分析失败。",
              es: "El análisis del documento falló.",
              pt: "A análise do documento falhou.",
              fr: "Échec de l'analyse du document.",
              ja: "文書分析に失敗しました。",
              ko: "문서 분석에 실패했습니다.",
              de: "Dokumentanalyse fehlgeschlagen.",
            }),
      );
      setStatus("error");
    }
  }

  function useLatestContext() {
    if (!latestSession) {
      setError(t.noSavedContext);
      setStatus("error");
      return;
    }

    setFile(null);
    setPastedText(latestSession.contextText);
    void startAnalysis({
      nextFile: null,
      nextText: "",
      chatContext: latestSession.contextText,
      chatContextName: latestSession.document.sourceName,
    });
  }

  function reset() {
    abortRef.current?.abort();
    setFile(null);
    setPastedText("");
    setStatus("idle");
    setProgress({
      progress: 0,
      step: "",
    });
    setError("");
    setAnalysis(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <section
      id="document-analyzer"
      className="border-b border-[color:var(--line)] bg-[color:var(--surface)] py-16"
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

        <div className="mt-8 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={(e) => { if (e.currentTarget === e.target) setDragging(false); }}
            onDrop={(e) => { e.preventDefault(); setDragging(false); void chooseFile(e.dataTransfer.files); }}
            className={`${dropzoneVisual(dragging)} p-5`}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={isWorking}
                className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-[color:var(--on-accent)] transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t.upload}
              </button>
              <button
                type="button"
                onClick={useLatestContext}
                disabled={isWorking || !latestSession}
                className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-5 py-3 text-sm font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t.latestContext}
              </button>
              <button
                type="button"
                onClick={reset}
                disabled={isWorking}
                className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-5 py-3 text-sm font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t.reset}
              </button>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              className="sr-only"
              onChange={(event) => void chooseFile(event.target.files)}
            />
            <p className="mt-4 break-words text-sm font-semibold text-[color:var(--foreground)]">
              {file?.name ?? latestSession?.document.sourceName ?? t.idle}
            </p>

            <label className="mt-5 block text-sm font-semibold text-[color:var(--foreground)]">
              {t.pasteLabel}
            </label>
            <textarea
              value={pastedText}
              onChange={(event) => {
                setPastedText(event.target.value);
                setFile(null);
                setError("");
                setAnalysis(null);
                setStatus(event.target.value.trim() ? "ready" : "idle");
              }}
              disabled={isWorking}
              placeholder={t.pastePlaceholder}
              className="mt-3 min-h-32 w-full resize-y rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4 text-sm leading-6 text-[color:var(--foreground)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--foreground)] disabled:opacity-60"
            />
          </div>

          <div className="mt-4 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-4">
            <button
              type="button"
              onClick={() => void startAnalysis()}
              disabled={!hasDocument || isWorking}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-[color:var(--on-accent)] transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isWorking ? t.analyzing : t.analyze}
            </button>

            {isWorking ? (
              <div className="mt-4">
                <div className="h-2 overflow-hidden rounded-full bg-[color:var(--line)]">
                  <div
                    className="h-full rounded-full bg-[color:var(--foreground)] transition-all"
                    style={{ width: `${progress.progress}%` }}
                  />
                </div>
                <p className="mt-3 text-sm font-medium text-[color:var(--muted)]">
                  {progress.step}
                </p>
              </div>
            ) : null}

            {status === "ready" && !error ? (
              <p className="mt-4 text-sm font-medium text-[color:var(--muted)]">
                {t.ready}
              </p>
            ) : null}

            {error ? (
              <div
                role="alert"
                className="mt-4 rounded-[var(--radius)] border border-[color:var(--error-line)] bg-[color:var(--error-surface)] p-4 text-sm leading-6 text-[color:var(--error)]"
              >
                {error}
              </div>
            ) : null}
          </div>

          {analysis ? (
            <div className="mt-4 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
              <dl className="grid gap-3 text-sm sm:grid-cols-3">
                <Info label={t.source} value={analysis.sourceName} />
                <Info label={t.context} value={String(analysis.contextCharacters)} />
                <Info
                  label={t.provider}
                  value={
                    [analysis.provider, analysis.model].filter(Boolean).join(" / ") ||
                    "AI"
                  }
                />
              </dl>

              {analysis.truncated ? (
                <p className="mt-4 rounded-[var(--radius-sm)] border border-[color:var(--warning-line)] bg-[color:var(--warning-surface)] p-3 text-sm leading-6 text-[color:var(--warning)]">
                  {t.truncated}
                </p>
              ) : null}

              <div className="mt-6 grid gap-4">
                <AnalysisSection title={t.summary} items={[analysis.summary]} emptyLabel={t.notFound} />
                <AnalysisSection title={t.keyDates} items={analysis.keyDates} emptyLabel={t.notFound} />
                <AnalysisSection title={t.keyAmounts} items={analysis.keyAmounts} emptyLabel={t.notFound} />
                <AnalysisSection
                  title={t.people}
                  items={analysis.peopleOrganizations}
                  emptyLabel={t.notFound}
                />
                <AnalysisSection title={t.risks} items={analysis.risks} emptyLabel={t.notFound} />
                <AnalysisSection title={t.actionItems} items={analysis.actionItems} emptyLabel={t.notFound} />
              </div>

              <section className="mt-6 border-t border-[color:var(--line)] pt-5">
                <h3 className="text-lg font-semibold text-[color:var(--foreground)]">
                  {t.references}
                </h3>
                <ul className="mt-3 grid gap-2 text-sm leading-6 text-[color:var(--muted)]">
                  {analysis.references.map((reference) => (
                    <li
                      key={reference}
                      className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3"
                    >
                      <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-[rgba(62,207,142,0.1)] px-2 py-0.5 text-[11px] font-semibold text-[color:var(--accent)]">✓ {t.verifiedBadge}</span>
                      <p className="mt-1 text-sm">{reference}</p>
                    </li>
                  ))}
                </ul>
              </section>

              {analysis.usage ? (
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                  {t.usage}:{" "}
                  {[
                    analysis.usage.prompt_tokens
                      ? `prompt ${analysis.usage.prompt_tokens}`
                      : "",
                    analysis.usage.completion_tokens
                      ? `completion ${analysis.usage.completion_tokens}`
                      : "",
                    analysis.usage.total_tokens
                      ? `total ${analysis.usage.total_tokens}`
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" / ")}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-semibold text-[color:var(--muted)]">{label}</dt>
      <dd className="mt-1 break-words font-semibold text-[color:var(--foreground)]">
        {value}
      </dd>
    </div>
  );
}

function AnalysisSection({
  title,
  items,
  emptyLabel,
}: {
  title: string;
  items: string[];
  emptyLabel: string;
}) {
  const visibleItems = items.length > 0 ? items : [emptyLabel];
  return (
    <section className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-4">
      <h3 className="font-semibold text-[color:var(--foreground)]">{title}</h3>
      <ul className="mt-3 grid gap-2 text-sm leading-6 text-[color:var(--muted)]">
        {visibleItems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
