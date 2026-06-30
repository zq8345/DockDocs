"use client";

import { trackToolRun } from "@/lib/track";
import { TrialCta } from "@/components/TrialCta";
import { useRef, useState } from "react";
import { AiDocUpload } from "@/components/AiDocUpload";
import {
  generateAiSummary,
  type AiSummaryLocale,
  type AiSummaryResult,
} from "@/lib/ai-summary-runtime";
import { canUseFeature, recordUsage } from "@/lib/usage-runtime";
import { getWorkspaceIdentity } from "@/lib/workspace-runtime";
import { LAYOUT } from "@/lib/layout-constants";
import { deepHant } from "@/lib/zh-hant";

type WorkflowStatus =
  | "idle"
  | "ready"
  | "extracting"
  | "summarizing"
  | "result"
  | "error";

type SummaryUiLocale = AiSummaryLocale | "de" | "zh-Hant";

const pick = (
  locale: SummaryUiLocale,
  m: Record<AiSummaryLocale | "de", string>,
): string => locale === "zh-Hant" ? m["zh"] : m[locale as AiSummaryLocale | "de"];

const copy = {
  en: {
    eyebrow: "AI summary",
    title: "Summarize a PDF without sending the full file to AI.",
    description:
      "DockDocs extracts browser-readable PDF text locally, then sends text only to the configured AI provider. For scanned PDFs, run OCR first and paste the extracted text here.",
    upload: "Choose PDF",
    pasteLabel: "Or paste OCR / extracted text",
    pastePlaceholder:
      "Paste OCR text or copied PDF text here when the PDF is scanned or image-based.",
    summarize: "Generate summary",
    reset: "Reset",
    cancel: "Cancel",
    source: "Source",
    characters: "Characters sent",
    provider: "Provider",
    download: "Download summary",
    executive: "Executive Summary",
    keyPoints: "Key Points",
    actionItems: "Action Items",
    nextSteps: "Suggested Next Steps",
    privacyTitle: "Privacy behavior",
    privacy:
      "PDF text extraction runs in the browser. The AI provider receives extracted text only after you start summarization. Files are not uploaded to the AI provider by this workflow.",
    idle: "Upload a PDF or paste OCR text to begin.",
    ready: "Ready to summarize.",
    working: "Working on summary...",
    quotaExceeded:
      "AI Summary limit reached for your current plan. Upgrade to continue.",
  },
  zh: {
    eyebrow: "AI 摘要",
    title: "为 PDF 生成摘要，但不把完整文件发送给 AI。",
    description:
      "DockDocs 会在浏览器本地提取可读取的 PDF 文本，然后只把文本发送给 AI 服务。扫描件请先运行 OCR，再把提取文本粘贴到这里。",
    upload: "选择 PDF",
    pasteLabel: "或粘贴 OCR / 已提取文本",
    pastePlaceholder: "扫描件或图片型 PDF 可先 OCR，再把文字粘贴到这里。",
    summarize: "生成摘要",
    reset: "重置",
    cancel: "取消",
    source: "来源",
    characters: "发送字符数",
    provider: "AI 服务",
    download: "下载摘要",
    executive: "执行摘要",
    keyPoints: "关键要点",
    actionItems: "行动项",
    nextSteps: "建议下一步",
    privacyTitle: "隐私处理方式",
    privacy:
      "PDF 文本提取在浏览器内完成。只有在你开始生成摘要后，提取出的文本才会发送给配置的 AI 服务。本工作流不会把完整 PDF 文件发送给 AI 服务。",
    idle: "上传 PDF 或粘贴 OCR 文本开始。",
    ready: "已准备生成摘要。",
    working: "正在生成摘要...",
    quotaExceeded: "当前套餐的 AI 摘要额度已用完。升级后可继续使用。",
  },
  es: {
    eyebrow: "Resumen con IA",
    title: "Resume un PDF sin enviar el archivo completo a la IA.",
    description:
      "DockDocs extrae localmente el texto legible del PDF y luego envía solo el texto al proveedor de IA configurado. Para PDF escaneados, ejecuta primero el OCR y pega aquí el texto extraído.",
    upload: "Elegir PDF",
    pasteLabel: "O pega texto de OCR / extraído",
    pastePlaceholder:
      "Pega aquí el texto de OCR o el texto copiado del PDF cuando el PDF esté escaneado o sea una imagen.",
    summarize: "Generar resumen",
    reset: "Restablecer",
    cancel: "Cancelar",
    source: "Fuente",
    characters: "Caracteres enviados",
    provider: "Proveedor",
    download: "Descargar resumen",
    executive: "Resumen ejecutivo",
    keyPoints: "Puntos clave",
    actionItems: "Acciones",
    nextSteps: "Próximos pasos sugeridos",
    privacyTitle: "Comportamiento de privacidad",
    privacy:
      "La extracción del texto del PDF se realiza en el navegador. El proveedor de IA recibe solo el texto extraído después de que inicias el resumen. Este flujo no sube archivos al proveedor de IA.",
    idle: "Sube un PDF o pega texto de OCR para empezar.",
    ready: "Listo para resumir.",
    working: "Generando el resumen...",
    quotaExceeded:
      "Has alcanzado el límite de AI Summary de tu plan actual. Mejora tu plan para continuar.",
  },
  pt: {
    eyebrow: "Resumo com IA",
    title: "Resuma um PDF sem enviar o arquivo completo para a IA.",
    description:
      "O DockDocs extrai localmente o texto legível do PDF e depois envia apenas o texto ao provedor de IA configurado. Para PDFs digitalizados, execute primeiro o OCR e cole aqui o texto extraído.",
    upload: "Escolher PDF",
    pasteLabel: "Ou cole texto de OCR / extraído",
    pastePlaceholder:
      "Cole aqui o texto de OCR ou o texto copiado do PDF quando o PDF for digitalizado ou baseado em imagem.",
    summarize: "Gerar resumo",
    reset: "Redefinir",
    cancel: "Cancelar",
    source: "Fonte",
    characters: "Caracteres enviados",
    provider: "Provedor",
    download: "Baixar resumo",
    executive: "Resumo executivo",
    keyPoints: "Pontos principais",
    actionItems: "Ações",
    nextSteps: "Próximos passos sugeridos",
    privacyTitle: "Comportamento de privacidade",
    privacy:
      "A extração do texto do PDF é feita no navegador. O provedor de IA recebe apenas o texto extraído depois que você inicia o resumo. Este fluxo não envia arquivos ao provedor de IA.",
    idle: "Envie um PDF ou cole texto de OCR para começar.",
    ready: "Pronto para resumir.",
    working: "Gerando o resumo...",
    quotaExceeded:
      "Você atingiu o limite do AI Summary do seu plano atual. Faça upgrade para continuar.",
  },
  fr: {
    eyebrow: "Résumé par IA",
    title: "Résumez un PDF sans envoyer le fichier complet à l'IA.",
    description:
      "DockDocs extrait localement le texte lisible du PDF, puis envoie uniquement le texte au fournisseur d'IA configuré. Pour les PDF numérisés, lancez d'abord l'OCR et collez ici le texte extrait.",
    upload: "Choisir un PDF",
    pasteLabel: "Ou collez le texte OCR / extrait",
    pastePlaceholder:
      "Collez ici le texte OCR ou le texte copié du PDF lorsque le PDF est numérisé ou composé d'images.",
    summarize: "Générer le résumé",
    reset: "Réinitialiser",
    cancel: "Annuler",
    source: "Source",
    characters: "Caractères envoyés",
    provider: "Fournisseur",
    download: "Télécharger le résumé",
    executive: "Résumé exécutif",
    keyPoints: "Points clés",
    actionItems: "Actions à mener",
    nextSteps: "Prochaines étapes suggérées",
    privacyTitle: "Comportement en matière de confidentialité",
    privacy:
      "L'extraction du texte du PDF s'exécute dans le navigateur. Le fournisseur d'IA ne reçoit que le texte extrait, une fois le résumé lancé. Ce flux n'envoie aucun fichier au fournisseur d'IA.",
    idle: "Importez un PDF ou collez du texte OCR pour commencer.",
    ready: "Prêt à résumer.",
    working: "Génération du résumé...",
    quotaExceeded:
      "Limite AI Summary atteinte pour votre formule actuelle. Passez à une formule supérieure pour continuer.",
  },
  ja: {
    eyebrow: "AI 要約",
    title: "ファイル全体を AI に送らずに PDF を要約します。",
    description:
      "DockDocs はブラウザー内で読み取り可能な PDF テキストを抽出し、設定済みの AI プロバイダーにはテキストのみを送信します。スキャンされた PDF の場合は、先に OCR を実行し、抽出したテキストをここに貼り付けてください。",
    upload: "PDF を選択",
    pasteLabel: "または OCR / 抽出済みテキストを貼り付け",
    pastePlaceholder:
      "PDF がスキャンまたは画像ベースの場合は、OCR テキストやコピーした PDF テキストをここに貼り付けてください。",
    summarize: "要約を生成",
    reset: "リセット",
    cancel: "キャンセル",
    source: "ソース",
    characters: "送信文字数",
    provider: "プロバイダー",
    download: "要約をダウンロード",
    executive: "エグゼクティブサマリー",
    keyPoints: "重要ポイント",
    actionItems: "アクション項目",
    nextSteps: "推奨される次のステップ",
    privacyTitle: "プライバシーの取り扱い",
    privacy:
      "PDF のテキスト抽出はブラウザー内で実行されます。AI プロバイダーが受け取るのは、要約を開始した後の抽出済みテキストのみです。このワークフローでは AI プロバイダーにファイルをアップロードしません。",
    idle: "PDF をアップロードするか OCR テキストを貼り付けて開始します。",
    ready: "要約の準備ができました。",
    working: "要約を生成しています...",
    quotaExceeded:
      "現在のプランの AI Summary 上限に達しました。続けるにはアップグレードしてください。",
  },
  de: {
    eyebrow: "KI-Zusammenfassung",
    title: "Fassen Sie ein PDF zusammen, ohne die vollständige Datei an die KI zu senden.",
    description:
      "DockDocs extrahiert den im Browser lesbaren PDF-Text lokal und sendet anschließend nur den Text an den konfigurierten KI-Anbieter. Führen Sie bei gescannten PDFs zuerst die OCR aus und fügen Sie den extrahierten Text hier ein.",
    upload: "PDF auswählen",
    pasteLabel: "Oder OCR- / extrahierten Text einfügen",
    pastePlaceholder:
      "Fügen Sie hier den OCR-Text oder den kopierten PDF-Text ein, wenn das PDF gescannt oder bildbasiert ist.",
    summarize: "Zusammenfassung erstellen",
    reset: "Zurücksetzen",
    cancel: "Abbrechen",
    source: "Quelle",
    characters: "Gesendete Zeichen",
    provider: "Anbieter",
    download: "Zusammenfassung herunterladen",
    executive: "Zusammenfassung für die Führungsebene",
    keyPoints: "Kernpunkte",
    actionItems: "Maßnahmen",
    nextSteps: "Empfohlene nächste Schritte",
    privacyTitle: "Verhalten beim Datenschutz",
    privacy:
      "Die Extraktion des PDF-Texts erfolgt im Browser. Der KI-Anbieter erhält erst nach dem Start der Zusammenfassung ausschließlich den extrahierten Text. Dieser Ablauf lädt keine Dateien zum KI-Anbieter hoch.",
    idle: "Laden Sie ein PDF hoch oder fügen Sie OCR-Text ein, um zu beginnen.",
    ready: "Bereit zum Zusammenfassen.",
    working: "Zusammenfassung wird erstellt ...",
    quotaExceeded:
      "Das AI-Summary-Limit Ihres aktuellen Tarifs ist erreicht. Führen Sie ein Upgrade durch, um fortzufahren.",
  },
  ko: {
    eyebrow: "AI 요약",
    title: "전체 파일을 AI로 보내지 않고 PDF를 요약하세요.",
    description:
      "DockDocs는 브라우저에서 읽을 수 있는 PDF 텍스트를 로컬에서 추출한 뒤, 설정된 AI 제공업체로 텍스트만 전송합니다. 스캔한 PDF는 먼저 OCR을 실행한 후 추출한 텍스트를 여기에 붙여넣으세요.",
    upload: "PDF 선택",
    pasteLabel: "또는 OCR / 추출한 텍스트 붙여넣기",
    pastePlaceholder:
      "PDF가 스캔본이거나 이미지 기반일 때 OCR 텍스트나 복사한 PDF 텍스트를 여기에 붙여넣으세요.",
    summarize: "요약 생성",
    reset: "초기화",
    cancel: "취소",
    source: "출처",
    characters: "전송된 문자 수",
    provider: "제공업체",
    download: "요약 다운로드",
    executive: "핵심 요약",
    keyPoints: "주요 내용",
    actionItems: "실행 항목",
    nextSteps: "제안된 다음 단계",
    privacyTitle: "개인정보 처리 방식",
    privacy:
      "PDF 텍스트 추출은 브라우저에서 실행됩니다. AI 제공업체는 요약을 시작한 후에만 추출한 텍스트를 받습니다. 이 워크플로는 파일을 AI 제공업체로 업로드하지 않습니다.",
    idle: "PDF를 업로드하거나 OCR 텍스트를 붙여넣어 시작하세요.",
    ready: "요약할 준비가 되었습니다.",
    working: "요약을 생성하는 중...",
    quotaExceeded:
      "현재 요금제의 AI 요약 한도에 도달했습니다. 계속하려면 업그레이드하세요.",
  },
} as const;

export function AiSummaryWorkflow({
  locale = "en",
  answerLocale,
}: {
  locale?: SummaryUiLocale;
  // Raw route locale for the ANSWER language; separate from the engine locale.
  answerLocale?: string;
}) {
  const t = locale === "zh-Hant" ? (deepHant(copy.zh) as unknown as typeof copy.en) : copy[locale as Exclude<SummaryUiLocale, "zh-Hant">];
  // The AI engine has no "de"/"zh-Hant"; collapse de→en, zh-Hant→zh for engine calls.
  const engineLocale: AiSummaryLocale = locale === "de" ? "en" : locale === "zh-Hant" ? "zh" : locale;
  const abortRef = useRef<AbortController | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [status, setStatus] = useState<WorkflowStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [progressStep, setProgressStep] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<AiSummaryResult | null>(null);

  const hasInput = Boolean(file) || pastedText.trim().length > 0;
  const isWorking = status === "extracting" || status === "summarizing";

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
    setStatus("ready");
  }

  async function startSummary() {
    if (!hasInput) {
      setError(t.idle);
      setStatus("error");
      return;
    }

    const identity = await getWorkspaceIdentity();
    const quota = await canUseFeature(identity.id, "summary");
    if (!quota.allowed) {
      setError(t.quotaExceeded);
      setStatus("error");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setError("");
    setResult(null);
    setProgress(0);
    setProgressStep("");
    setStatus("extracting");

    try {
      const summary = await generateAiSummary({
        file,
        pastedText,
        locale: engineLocale,
        answerLocale,
        signal: controller.signal,
        onProgress: ({ progress: nextProgress, step }) => {
          setProgress(nextProgress);
          setProgressStep(step);
          setStatus(nextProgress >= 68 ? "summarizing" : "extracting");
        },
      });

      if (controller.signal.aborted) {
        return;
      }

      setResult(summary);
      trackToolRun("ai-summary");
      await recordUsage(identity.id, "summary", {
        source: "ai-summary",
      });
      setProgress(100);
      setStatus("result");
    } catch (summaryError) {
      if (controller.signal.aborted) {
        return;
      }

      const message =
        summaryError instanceof Error
          ? summaryError.message
          : pick(locale, {
              en: "AI summary failed.",
              zh: "AI 摘要失败。",
              es: "El resumen con IA falló.",
              pt: "O resumo com IA falhou.",
              fr: "Échec du résumé par IA.",
              ja: "AI 要約に失敗しました。",
              ko: "AI 요약에 실패했습니다.",
              de: "KI-Zusammenfassung fehlgeschlagen.",
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
      setStatus("error");
    }
  }

  function cancel() {
    abortRef.current?.abort();
    setError("");
    setStatus(hasInput ? "ready" : "idle");
    setProgress(0);
    setProgressStep("");
  }

  function reset() {
    abortRef.current?.abort();
    setFile(null);
    setPastedText("");
    setStatus("idle");
    setProgress(0);
    setProgressStep("");
    setError("");
    setResult(null);
  }

  return (
    <section
      id="ai-summary"
      data-ai-summary-status={status}
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

        <div className="mt-6">
          <TrialCta
            variant="tool-pro"
            locale={locale}
            hookTitle={
              locale === "zh"
                ? "这份文档，先免费让 AI 给你一份完整摘要"
                : locale === "es" ? "Este documento — que la IA genere un resumen completo gratis."
                : locale === "pt" ? "Este documento — que a IA gere um resumo completo grátis."
                : locale === "fr" ? "Ce document — que l'IA génère un résumé complet gratuitement."
                : locale === "ja" ? "この文書——AIが完全な要約を無料で生成します。"
                : locale === "ko" ? "이 문서——AI가 무료로 전체 요약을 생성합니다."
                : "This document — let AI generate a full summary for free."
            }
          />
        </div>

        <div className="mt-8 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4">
          <AiDocUpload
            buttonLabel={t.upload}
            resetLabel={t.reset}
            inputData={{ "data-ai-summary-input": "pdf" }}
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
                setStatus(event.target.value.trim() ? "ready" : "idle");
                setError("");
                setResult(null);
              }}
              disabled={isWorking}
              placeholder={t.pastePlaceholder}
              className="mt-3 min-h-32 w-full resize-y rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4 text-sm leading-6 text-[color:var(--foreground)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--foreground)] disabled:opacity-60"
            />
          </AiDocUpload>

          <div className="mt-4 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={startSummary}
                disabled={!hasInput || isWorking}
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-[color:var(--on-accent)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isWorking ? t.working : t.summarize}
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
              </div>
            ) : null}

            {status === "ready" && !error ? (
              <p className="mt-4 text-sm font-medium text-[color:var(--muted)]">{t.ready}</p>
            ) : null}
          </div>

          {result ? (
            <div className="mt-4 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
              <dl className="grid gap-3 text-sm sm:grid-cols-3">
                <div>
                  <dt className="font-semibold text-[color:var(--muted)]">{t.source}</dt>
                  <dd className="mt-1 break-words font-semibold text-[color:var(--foreground)]">
                    {result.sourceName}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-[color:var(--muted)]">{t.characters}</dt>
                  <dd className="mt-1 font-semibold text-[color:var(--foreground)]">
                    {result.characterCount}
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

              <button
                type="button"
                onClick={() => downloadSummary(result, engineLocale)}
                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-[color:var(--on-accent)] transition hover:opacity-90"
              >
                {t.download}
              </button>

              <SummaryBlock title={t.executive} body={result.executiveSummary} />
              <SummaryList title={t.keyPoints} items={result.keyPoints} />
              <SummaryList title={t.actionItems} items={result.actionItems} />
              <SummaryList title={t.nextSteps} items={result.nextSteps} />
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

function downloadSummary(result: AiSummaryResult, locale: AiSummaryLocale) {
  const labels = {
    executive: copy[locale].executive,
    keyPoints: copy[locale].keyPoints,
    actionItems: copy[locale].actionItems,
    nextSteps: copy[locale].nextSteps,
  };

  const text = [
    labels.executive,
    result.executiveSummary,
    "",
    labels.keyPoints,
    ...result.keyPoints.map((item) => `- ${item}`),
    "",
    labels.actionItems,
    ...result.actionItems.map((item) => `- ${item}`),
    "",
    labels.nextSteps,
    ...result.nextSteps.map((item) => `- ${item}`),
  ].join("\n");

  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "dockdocs-ai-summary.txt";
  link.click();
  URL.revokeObjectURL(url);
}

function SummaryBlock({ title, body }: { title: string; body: string }) {
  return (
    <section className="mt-6 border-t border-[color:var(--line)] pt-5">
      <h3 className="text-lg font-semibold text-[color:var(--foreground)]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{body}</p>
    </section>
  );
}

function SummaryList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="mt-6 border-t border-[color:var(--line)] pt-5">
      <h3 className="text-lg font-semibold text-[color:var(--foreground)]">{title}</h3>
      <ul className="mt-3 grid gap-2 text-sm leading-6 text-[color:var(--muted)]">
        {items.map((item) => (
          <li key={item} className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
