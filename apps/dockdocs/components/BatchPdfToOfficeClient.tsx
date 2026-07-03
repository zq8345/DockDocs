"use client";
import { trackToolRun } from "@/lib/track";
import { ToolFaq } from "@/components/ToolFaq";
import { BatchUploadBox } from "@/components/BatchUploadBox";

import { useCallback, useRef, useState } from "react";
import { CircularProgress } from "../../../shared/templates/pdf-tool-page/workflow-engine-components";
import { ToolBridge } from "../../../shared/templates/pdf-tool-page/ToolBridge";
import { createZipArchive } from "../../../shared/templates/pdf-tool-page/pdf-runtime";
import { runCloudConvert } from "../../../shared/templates/pdf-tool-page/cloudconvert-runtime";
import type { CloudLocale } from "../../../shared/templates/pdf-tool-page/cloudconvert-runtime";
import { BatchFileCard } from "@/components/BatchFileCard";
import { checkAndRecordBatchRun, batchLimitMessage } from "@/lib/batch-limits";
import { deepHant, toHant } from "@/lib/zh-hant";
import type { RouteLocale, AuthoredLocale, AuthoredCopy } from "@/lib/i18n";
import { LAYOUT } from "@/lib/layout-constants";
import { PAGES_LABEL } from "@/lib/batch-pages-label";

type Locale = RouteLocale;
// zh-Hant is derived from zh via OpenCC, so copy tables are keyed by the authored locales only.
type CopyLocale = AuthoredLocale;
type Format = "word" | "excel";
type Status = "queued" | "done" | "error";
type Item = { id: string; name: string; file: File; status: Status; blob?: Blob; msg?: string };

const MAX_FILES = 20;

const _en = {
  title: "Batch PDF to Word / Excel",
  subtitle:
    "Convert a whole folder of PDFs to editable Word or Excel files in one go — each is converted and packaged into a single ZIP.",
  word: "To Word (.docx)",
  excel: "To Excel (.xlsx)",
  run: "Convert all",
  running: "Converting",
  download: "Download ZIP",
  reset: "Start over",
  remove: "Remove",
  files: (n: number, max: number) => `${n} / ${max} files`,
  done: "done",
  failed: "failed",
  need: "Add at least one PDF.",
  note: "Text and tables are extracted into an editable file. Scanned or heavily-designed PDFs may not convert perfectly.",
  err: "Something went wrong: ",
};

const STR = {
  en: _en,
  zh: {
    title: "批量 PDF 转 Word / Excel",
    subtitle:
      "把整个文件夹的 PDF 一次性转成可编辑的 Word 或 Excel，打包成一个 ZIP。",
    word: "转 Word (.docx)",
    excel: "转 Excel (.xlsx)",
    run: "全部转换",
    running: "转换中",
    download: "下载 ZIP",
    reset: "重新开始",
    remove: "移除",
    files: (n: number, max: number) => `${n} / ${max} 份`,
    done: "完成",
    failed: "失败",
    need: "至少添加一份 PDF。",
    note: "转换会把文字和表格提取成可编辑文件。扫描件或排版复杂的 PDF 可能转换得不完美。",
    err: "出错了：",
  },
  es: {
    title: "PDF a Word / Excel por lotes",
    subtitle:
      "Convierte una carpeta entera de PDF a archivos Word o Excel editables de una vez: cada uno se convierte y se empaqueta en un solo ZIP.",
    word: "A Word (.docx)",
    excel: "A Excel (.xlsx)",
    run: "Convertir todo",
    running: "Convirtiendo",
    download: "Descargar ZIP",
    reset: "Empezar de nuevo",
    remove: "Quitar",
    files: (n: number, max: number) => `${n} / ${max} archivos`,
    done: "listo",
    failed: "falló",
    need: "Agrega al menos un PDF.",
    note: "El texto y las tablas se extraen en un archivo editable. Los PDF escaneados o con mucho diseño pueden no convertirse perfectamente.",
    err: "Algo salió mal: ",
  },
  pt: {
    title: "PDF para Word / Excel em lote",
    subtitle:
      "Converta uma pasta inteira de PDFs para arquivos Word ou Excel editáveis de uma vez: cada um é convertido e empacotado em um único ZIP.",
    word: "Para Word (.docx)",
    excel: "Para Excel (.xlsx)",
    run: "Converter tudo",
    running: "Convertendo",
    download: "Baixar ZIP",
    reset: "Recomeçar",
    remove: "Remover",
    files: (n: number, max: number) => `${n} / ${max} arquivos`,
    done: "pronto",
    failed: "falhou",
    need: "Adicione pelo menos um PDF.",
    note: "O texto e as tabelas são extraídos para um arquivo editável. PDFs digitalizados ou com muito design podem não converter perfeitamente.",
    err: "Algo deu errado: ",
  },
  fr: {
    title: "PDF en Word / Excel en lot",
    subtitle:
      "Convertissez un dossier entier de PDF en fichiers Word ou Excel modifiables en une seule fois : chaque fichier est converti et regroupé dans un seul ZIP.",
    word: "En Word (.docx)",
    excel: "En Excel (.xlsx)",
    run: "Tout convertir",
    running: "Conversion en cours",
    download: "Télécharger le ZIP",
    reset: "Recommencer",
    remove: "Retirer",
    files: (n: number, max: number) => `${n} / ${max} fichiers`,
    done: "terminé",
    failed: "échec",
    need: "Ajoutez au moins un PDF.",
    note: "Le texte et les tableaux sont extraits dans un fichier modifiable. Les PDF numérisés ou très mis en page peuvent ne pas se convertir parfaitement.",
    err: "Une erreur est survenue : ",
  },
  ja: {
    title: "PDFをWord / Excelに一括変換",
    subtitle:
      "フォルダ内のPDFをまとめて編集可能なWordまたはExcelファイルに変換し、1つのZIPにまとめます。",
    word: "Wordに変換 (.docx)",
    excel: "Excelに変換 (.xlsx)",
    run: "すべて変換",
    running: "変換中",
    download: "ZIPをダウンロード",
    reset: "最初からやり直す",
    remove: "削除",
    files: (n: number, max: number) => `${n} / ${max} ファイル`,
    done: "完了",
    failed: "失敗",
    need: "PDFを1つ以上追加してください。",
    note: "テキストと表が編集可能なファイルに抽出されます。スキャンされたPDFや複雑なレイアウトのPDFは完全に変換されない場合があります。",
    err: "問題が発生しました: ",
  },
  de: {
    title: "PDF stapelweise zu Word / Excel",
    subtitle:
      "Konvertieren Sie einen ganzen Ordner mit PDFs auf einmal in bearbeitbare Word- oder Excel-Dateien – jede wird konvertiert und in einem einzigen ZIP gebündelt.",
    word: "Zu Word (.docx)",
    excel: "Zu Excel (.xlsx)",
    run: "Alle konvertieren",
    running: "Wird konvertiert",
    download: "ZIP herunterladen",
    reset: "Neu beginnen",
    remove: "Entfernen",
    files: (n: number, max: number) => `${n} / ${max} Dateien`,
    done: "fertig",
    failed: "fehlgeschlagen",
    need: "Fügen Sie mindestens ein PDF hinzu.",
    note: "Text und Tabellen werden in eine bearbeitbare Datei extrahiert. Eingescannte oder aufwendig gestaltete PDFs lassen sich möglicherweise nicht perfekt konvertieren.",
    err: "Etwas ist schiefgelaufen: ",
  },
  ko: {
    title: "PDF를 Word / Excel로 일괄 변환",
    subtitle:
      "폴더 안의 PDF를 한 번에 편집 가능한 Word나 Excel 파일로 변환하여 하나의 ZIP으로 묶습니다.",
    word: "Word로 변환 (.docx)",
    excel: "Excel로 변환 (.xlsx)",
    run: "전체 변환",
    running: "변환 중",
    download: "ZIP 다운로드",
    reset: "다시 시작",
    remove: "제거",
    files: (n: number, max: number) => `${n} / ${max}개 파일`,
    done: "완료",
    failed: "실패",
    need: "PDF를 하나 이상 추가해 주세요.",
    note: "텍스트와 표가 편집 가능한 파일로 추출됩니다. 스캔본이나 디자인이 복잡한 PDF는 완벽하게 변환되지 않을 수 있습니다.",
    err: "문제가 발생했습니다: ",
  },
} satisfies AuthoredCopy<typeof _en>;

// Per-target heading/subtitle (native) for the split single-format pages.
const PT: Record<Format, Record<CopyLocale, { title: string; subtitle: string }>> = {
  word: {
    en: { title: "Batch PDF to Word", subtitle: "Convert a whole folder of PDFs to editable Word (.docx) files in one go — each is converted and packaged into a single ZIP." },
    zh: { title: "批量 PDF 转 Word", subtitle: "把整个文件夹的 PDF 一次性转成可编辑的 Word(.docx)，打包成一个 ZIP。" },
    es: { title: "PDF a Word por lotes", subtitle: "Convierte una carpeta entera de PDF a archivos Word (.docx) editables de una vez: cada uno se convierte y se empaqueta en un solo ZIP." },
    pt: { title: "PDF para Word em lote", subtitle: "Converta uma pasta inteira de PDFs para arquivos Word (.docx) editáveis de uma vez: cada um é convertido e empacotado em um único ZIP." },
    fr: { title: "PDF en Word par lots", subtitle: "Convertissez un dossier entier de PDF en fichiers Word (.docx) modifiables en une seule fois : chaque fichier est converti et regroupé dans un seul ZIP." },
    ja: { title: "PDFをWordに一括変換", subtitle: "フォルダ内のPDFをまとめて編集可能なWord（.docx）に変換し、1つのZIPにまとめます。" },
    de: { title: "PDF stapelweise zu Word", subtitle: "Konvertieren Sie einen ganzen Ordner mit PDFs auf einmal in bearbeitbare Word-Dateien (.docx) – jede wird konvertiert und in einem einzigen ZIP gebündelt." },
    ko: { title: "PDF를 Word로 일괄 변환", subtitle: "폴더 안의 PDF를 한 번에 편집 가능한 Word(.docx) 파일로 변환하여 하나의 ZIP으로 묶습니다." },
  },
  excel: {
    en: { title: "Batch PDF to Excel", subtitle: "Convert a whole folder of PDFs to editable Excel (.xlsx) spreadsheets in one go — each is converted and packaged into a single ZIP." },
    zh: { title: "批量 PDF 转 Excel", subtitle: "把整个文件夹的 PDF 一次性转成可编辑的 Excel(.xlsx)，打包成一个 ZIP。" },
    es: { title: "PDF a Excel por lotes", subtitle: "Convierte una carpeta entera de PDF a hojas de cálculo Excel (.xlsx) editables de una vez: cada una se convierte y se empaqueta en un solo ZIP." },
    pt: { title: "PDF para Excel em lote", subtitle: "Converta uma pasta inteira de PDFs para planilhas Excel (.xlsx) editáveis de uma vez: cada uma é convertida e empacotada em um único ZIP." },
    fr: { title: "PDF en Excel par lots", subtitle: "Convertissez un dossier entier de PDF en feuilles de calcul Excel (.xlsx) modifiables en une seule fois : chaque fichier est converti et regroupé dans un seul ZIP." },
    ja: { title: "PDFをExcelに一括変換", subtitle: "フォルダ内のPDFをまとめて編集可能なExcel（.xlsx）に変換し、1つのZIPにまとめます。" },
    de: { title: "PDF stapelweise zu Excel", subtitle: "Konvertieren Sie einen ganzen Ordner mit PDFs auf einmal in bearbeitbare Excel-Tabellen (.xlsx) – jede wird konvertiert und in einem einzigen ZIP gebündelt." },
    ko: { title: "PDF를 Excel로 일괄 변환", subtitle: "폴더 안의 PDF를 한 번에 편집 가능한 Excel(.xlsx) 파일로 변환하여 하나의 ZIP으로 묶습니다." },
  },
};

export function BatchPdfToOfficeClient({ locale = "en", target, embedded = false }: { locale?: Locale; target?: Format; embedded?: boolean }) {
  // ko has no authored copy yet → English (foundation phase). Mirrors zh-Hant special-casing.
  // (zh-Hant is also collapsed here because every [al] index below is already inside a
  // `locale === "zh-Hant" ? deepHant(…) :` ternary, so the zh-Hant case never reaches [al].)
  const al: AuthoredLocale = locale === "zh-Hant" ? "en" : locale;
  const t = locale === "zh-Hant" ? deepHant(STR.zh) : STR[al];
  // zh-Hant child components (BatchUploadBox / ToolFaq) accept zh-Hant; ko → English (no Korean strings yet).
  const childLocale = locale; // shared widgets accept zh-Hant (Traditional derived via OpenCC)
  const maxFiles = MAX_FILES;
  const head = target
    ? (locale === "zh-Hant" ? deepHant(PT[target].zh) : PT[target][al])
    : { title: t.title, subtitle: t.subtitle };
  const [items, setItems] = useState<Item[]>([]);
  const [format, setFormat] = useState<Format>(target ?? "word");
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: File[]) => {
    const pdfs = files.filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    if (!pdfs.length) return;
    setError(null);
    setPhase("idle");
    setItems((prev) =>
      [
        ...prev,
        ...pdfs.map((f) => ({
          id: `${f.name}-${f.size}-${f.lastModified}-${Math.random().toString(36).slice(2, 6)}`,
          name: f.name,
          file: f,
          status: "queued" as const,
        })),
      ].slice(0, maxFiles),
    );
  }, [maxFiles]);

  const reset = () => {
    setItems([]);
    setPhase("idle");
    setProgress(0);
    setError(null);
  };

  const run = useCallback(async () => {
    if (items.length === 0) {
      setError(t.need);
      return;
    }
    const batchGate = await checkAndRecordBatchRun();
    if (!batchGate.allowed) { setError(batchLimitMessage(locale)); return; }
    setPhase("running");
    setError(null);
    setProgress(0);
    const route = format === "word" ? "pdf-to-word" : "pdf-to-excel";
    const ext = format === "word" ? ".docx" : ".xlsx";
    const updated = [...items];
    for (let i = 0; i < updated.length; i++) {
      setProgress(i + 1);
      const it = updated[i];
      try {
        const outputFileName = it.name.replace(/\.pdf$/i, ext);
        const artifact = await runCloudConvert({
          file: it.file,
          route,
          outputFileName,
          locale: locale as CloudLocale,
        });
        updated[i] = { ...it, status: "done", blob: artifact.blob };
      } catch (e) {
        updated[i] = { ...it, status: "error", msg: e instanceof Error ? e.message : String(e) };
      }
      setItems([...updated]);
    }
    setPhase("done");
  }, [items, format, t, locale]);

  const download = async () => {
    const ext = format === "word" ? "docx" : "xlsx";
    const files = items.filter((it) => it.status === "done" && it.blob);
    if (!files.length) return;
    try {
      const entries = await Promise.all(
        files.map(async (it) => ({
          name: it.name.replace(/\.pdf$/i, "") + "." + ext,
          data: new Uint8Array(await it.blob!.arrayBuffer()),
        })),
      );
      const zip = createZipArchive(entries);
      const blob = new Blob([zip as BlobPart], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dockdocs-pdf-to-${format}.zip`;
      a.click();
      trackToolRun(`batch-pdf-to-${format}`);
      URL.revokeObjectURL(url);
    } catch {
      const DL_ERR: Record<AuthoredLocale, string> = {
        en: "Could not build the download — please try again.",
        zh: "打包下载失败，请重试。",
        es: "No se pudo crear la descarga; inténtalo de nuevo.",
        fr: "Impossible de créer le téléchargement — veuillez réessayer.",
        pt: "Não foi possível criar o download — tente novamente.",
        ja: "ダウンロードの作成に失敗しました。もう一度お試しください。",
        de: "Der Download konnte nicht erstellt werden – bitte versuchen Sie es erneut.",
        ko: "다운로드를 생성하지 못했습니다. 다시 시도해 주세요.",
      };
      setError(locale === "zh-Hant" ? toHant(DL_ERR.zh) : DL_ERR[al]);
    }
  };

  const doneCount = items.filter((it) => it.status === "done").length;
  const formats: Format[] = ["word", "excel"];

  return (
    <div className={embedded ? "mx-auto w-full max-w-3xl px-8 pb-10 pt-4" : `mx-auto ${LAYOUT.content} px-5 pb-16 sm:px-6 sm:pb-20 pt-12 sm:pt-16`}>
      {!embedded && <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{head.title}</h1>}
      <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{head.subtitle}</p>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        multiple
        className="hidden"
        onChange={(e) => {
          const fs = Array.from(e.target.files || []);
          if (fs.length) addFiles(fs);
          e.currentTarget.value = "";
        }}
      />

      {items.length === 0 ? (
        <BatchUploadBox locale={childLocale} onFiles={addFiles} privacyLabel={null} embedded={embedded} valueZone="server" />
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-[14px] font-semibold text-[color:var(--foreground)]">{t.files(items.length, maxFiles)}</p>
              {!target && (
                <div className="inline-flex rounded-[var(--radius)] border border-[color:var(--line)] p-0.5">
                  {formats.map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setFormat(fmt)}
                      className={`rounded-[var(--radius-sm)] px-3 py-1.5 text-[12.5px] font-medium transition ${format === fmt ? "bg-[color:var(--accent)] text-white" : "text-[color:var(--muted)]"}`}
                    >
                      {fmt === "word" ? t.word : t.excel}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex shrink-0 gap-2">
              {items.length < maxFiles && (
                <button type="button" onClick={() => inputRef.current?.click()} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">+</button>
              )}
              <button type="button" onClick={reset} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">{t.reset}</button>
              {phase === "done" && doneCount > 0 ? (
                <button type="button" onClick={download} className="rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90">{t.download}</button>
              ) : (
                <button type="button" onClick={run} disabled={phase === "running"} className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50">{phase === "running" ? t.running : t.run}</button>
              )}
            </div>
          </div>

          {phase === "running" && (
            <div className="mx-auto mt-6 max-w-[200px]">
              <CircularProgress
                bare
                progress={items.length > 0 ? (progress / items.length) * 100 : 0}
                title={t.running}
                description={`${progress} / ${items.length}`}
              />
            </div>
          )}

          <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
            {items.map((it) => (
              <BatchFileCard
                key={it.id}
                file={it.file}
                status={it.status}
                errorMsg={it.msg}
                statusNode={
                  it.status === "done"
                    ? <span className="text-[12.5px] text-[#34d399]">{t.done}</span>
                    : it.status === "error"
                    ? <span className="text-[12.5px] text-[#f87171]" title={it.msg}>{it.msg || t.failed}</span>
                    : undefined
                }
                doneLabel={t.done}
                failLabel={t.failed}
                removeLabel={t.remove}
                pagesLabel={locale === "zh-Hant" ? toHant(PAGES_LABEL.zh) : PAGES_LABEL[al]}
                onRemove={phase !== "running" ? () => setItems(prev => prev.filter(x => x.id !== it.id)) : undefined}
              />
            ))}
            {items.length < maxFiles && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex min-h-[240px] flex-col items-center justify-center gap-1.5 rounded-[var(--radius)] border-2 border-dashed border-[color:var(--line)] text-[color:var(--muted)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
              >
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
            )}
          </div>
          <p className="mt-3 text-[12px] text-[color:var(--faint)]">{t.note}</p>
        </>
      )}

      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}
      {phase === "done" && !embedded && (
        <div className="mt-6">
          <ToolBridge slug={`batch-pdf-to-${format}`} locale={locale} useLocalePrefix={locale !== "en"} />
        </div>
      )}
      {!embedded && <ToolFaq tool={target ? `batch-pdf-to-${target}` : "batch-pdf-to-office"} locale={childLocale} />}
    </div>
  );
}
