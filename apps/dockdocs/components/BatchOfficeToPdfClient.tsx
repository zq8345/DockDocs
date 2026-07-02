"use client";
import { trackToolRun } from "@/lib/track";
import { ToolFaq } from "@/components/ToolFaq";
import { BatchUploadBox } from "@/components/BatchUploadBox";

import { useCallback, useRef, useState } from "react";
import { Spinner } from "@/components/Spinner";
import { createZipArchive } from "../../../shared/templates/pdf-tool-page/pdf-runtime";
import { runCloudConvert } from "../../../shared/templates/pdf-tool-page/cloudconvert-runtime";
import type { CloudLocale } from "../../../shared/templates/pdf-tool-page/cloudconvert-runtime";
import { BatchFileCard } from "@/components/BatchFileCard";
import { usePlanBatchFileCap, checkAndRecordBatchRun, batchLimitMessage } from "@/lib/batch-limits";
import { deepHant, toHant } from "@/lib/zh-hant";
import type { RouteLocale, AuthoredLocale, AuthoredCopy } from "@/lib/i18n";
import { LAYOUT } from "@/lib/layout-constants";

type Locale = RouteLocale;
// zh-Hant is derived from zh via OpenCC, so copy tables are keyed by the authored locales only.
type CopyLocale = AuthoredLocale;
type Status = "queued" | "done" | "error";
type Item = { id: string; name: string; file: File; status: Status; blob?: Blob; msg?: string };

const MAX_FILES = 20;
const OFFICE_EXT = [".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx", ".odt", ".odp", ".ods", ".rtf"];
const ACCEPT = OFFICE_EXT.join(",") +
  ",application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" +
  ",application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation" +
  ",application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

function routeFor(name: string): "word-to-pdf" | "ppt-to-pdf" | "excel-to-pdf" {
  const l = name.toLowerCase();
  if (l.endsWith(".ppt") || l.endsWith(".pptx") || l.endsWith(".odp")) return "ppt-to-pdf";
  if (l.endsWith(".xls") || l.endsWith(".xlsx") || l.endsWith(".ods")) return "excel-to-pdf";
  return "word-to-pdf"; // doc/docx/odt/rtf and anything else LibreOffice handles
}

const _en = {
  title: "Batch Office to PDF",
  subtitle:
    "Convert a whole folder of Word, PowerPoint, and Excel files to PDF in one go — each is converted and packaged into a single ZIP.",
  run: "Convert all",
  running: "Converting",
  download: "Download ZIP",
  reset: "Start over",
  remove: "Remove",
  files: (n: number, max: number) => `${n} / ${max} files`,
  done: "done",
  failed: "failed",
  need: "Add at least one Office file.",
  hint: "Word, PowerPoint, Excel",
  note: "Files are converted to PDF and returned — they are not stored. All popular Office formats are supported.",
  err: "Something went wrong: ",
};

const STR = {
  en: _en,
  zh: {
    title: "批量 Office 转 PDF",
    subtitle:
      "把整个文件夹的 Word、PowerPoint、Excel 一次性全部转成 PDF，打包成一个 ZIP。",
    run: "全部转换",
    running: "转换中",
    download: "下载 ZIP",
    reset: "重新开始",
    remove: "移除",
    files: (n: number, max: number) => `${n} / ${max} 份`,
    done: "完成",
    failed: "失败",
    need: "至少添加一个 Office 文件。",
    hint: "Word、PowerPoint、Excel",
    note: "文件转换成 PDF 后返回，不会被保存。支持所有主流 Office 格式。",
    err: "出错了：",
  },
  es: {
    title: "Office a PDF por lotes",
    subtitle:
      "Convierte una carpeta entera de archivos Word, PowerPoint y Excel a PDF de una vez: cada uno se convierte y se empaqueta en un solo ZIP.",
    run: "Convertir todo",
    running: "Convirtiendo",
    download: "Descargar ZIP",
    reset: "Empezar de nuevo",
    remove: "Quitar",
    files: (n: number, max: number) => `${n} / ${max} archivos`,
    done: "listo",
    failed: "falló",
    need: "Agrega al menos un archivo de Office.",
    hint: "Word, PowerPoint, Excel",
    note: "Los archivos se convierten a PDF y se devuelven — no se almacenan. Se admiten todos los formatos de Office más habituales.",
    err: "Algo salió mal: ",
  },
  pt: {
    title: "Office para PDF em lote",
    subtitle:
      "Converta uma pasta inteira de arquivos Word, PowerPoint e Excel para PDF de uma vez: cada um é convertido e empacotado em um único ZIP.",
    run: "Converter tudo",
    running: "Convertendo",
    download: "Baixar ZIP",
    reset: "Recomeçar",
    remove: "Remover",
    files: (n: number, max: number) => `${n} / ${max} arquivos`,
    done: "pronto",
    failed: "falhou",
    need: "Adicione pelo menos um arquivo do Office.",
    hint: "Word, PowerPoint, Excel",
    note: "Os arquivos são convertidos para PDF e devolvidos — não são armazenados. Todos os formatos de Office mais comuns são suportados.",
    err: "Algo deu errado: ",
  },
  fr: {
    title: "Office vers PDF en lot",
    subtitle:
      "Convertissez un dossier entier de fichiers Word, PowerPoint et Excel en PDF en une seule fois — chaque fichier est converti et regroupé dans un seul ZIP.",
    run: "Tout convertir",
    running: "Conversion en cours",
    download: "Télécharger le ZIP",
    reset: "Recommencer",
    remove: "Retirer",
    files: (n: number, max: number) => `${n} / ${max} fichiers`,
    done: "terminé",
    failed: "échec",
    need: "Ajoutez au moins un fichier Office.",
    hint: "Word, PowerPoint, Excel",
    note: "Les fichiers sont convertis en PDF et renvoyés — ils ne sont pas conservés. Tous les formats Office courants sont pris en charge.",
    err: "Une erreur s'est produite : ",
  },
  ja: {
    title: "OfficeをPDFに一括変換",
    subtitle:
      "フォルダ内のWord、PowerPoint、ExcelファイルをまとめてPDFに変換し、1つのZIPにまとめます。",
    run: "すべて変換",
    running: "変換中",
    download: "ZIPをダウンロード",
    reset: "最初からやり直す",
    remove: "削除",
    files: (n: number, max: number) => `${n} / ${max} ファイル`,
    done: "完了",
    failed: "失敗",
    need: "Officeファイルを1つ以上追加してください。",
    hint: "Word、PowerPoint、Excel",
    note: "ファイルはPDFに変換されて返されます — 保存されることはありません。主要なOfficeフォーマットすべてに対応しています。",
    err: "問題が発生しました: ",
  },
  de: {
    title: "Office stapelweise zu PDF",
    subtitle:
      "Konvertieren Sie einen ganzen Ordner mit Word-, PowerPoint- und Excel-Dateien in einem Durchgang zu PDF – jede Datei wird konvertiert und in einem einzigen ZIP gebündelt.",
    run: "Alle konvertieren",
    running: "Wird konvertiert",
    download: "ZIP herunterladen",
    reset: "Neu beginnen",
    remove: "Entfernen",
    files: (n: number, max: number) => `${n} / ${max} Dateien`,
    done: "fertig",
    failed: "fehlgeschlagen",
    need: "Fügen Sie mindestens eine Office-Datei hinzu.",
    hint: "Word, PowerPoint, Excel",
    note: "Die Dateien werden zu PDF konvertiert und zurückgegeben – sie werden nicht gespeichert. Alle gängigen Office-Formate werden unterstützt.",
    err: "Etwas ist schiefgelaufen: ",
  },
  ko: {
    title: "Office를 PDF로 일괄 변환",
    subtitle:
      "폴더 안의 Word, PowerPoint, Excel 파일을 한 번에 PDF로 변환하여 하나의 ZIP으로 묶습니다.",
    run: "전체 변환",
    running: "변환 중",
    download: "ZIP 다운로드",
    reset: "다시 시작",
    remove: "제거",
    files: (n: number, max: number) => `${n} / ${max}개 파일`,
    done: "완료",
    failed: "실패",
    need: "Office 파일을 하나 이상 추가해 주세요.",
    hint: "Word, PowerPoint, Excel",
    note: "파일은 PDF로 변환되어 반환되며, 저장되지 않습니다. 모든 주요 Office 형식을 지원합니다.",
    err: "문제가 발생했습니다: ",
  },
} satisfies AuthoredCopy<typeof _en>;

type Source = "word" | "excel" | "ppt";

const SRC: Record<Source, { ext: string[]; route: "word-to-pdf" | "excel-to-pdf" | "ppt-to-pdf"; accept: string }> = {
  word: { ext: [".doc", ".docx", ".odt", ".rtf"], route: "word-to-pdf", accept: ".doc,.docx,.odt,.rtf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
  excel: { ext: [".xls", ".xlsx", ".ods"], route: "excel-to-pdf", accept: ".xls,.xlsx,.ods,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
  ppt: { ext: [".ppt", ".pptx", ".odp"], route: "ppt-to-pdf", accept: ".ppt,.pptx,.odp,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation" },
};

// Per-source heading/subtitle/hint (native) for the split single-format pages.
const PS: Record<Source, Record<CopyLocale, { title: string; subtitle: string; hint: string }>> = {
  word: {
    en: { title: "Batch Word to PDF", subtitle: "Convert a whole folder of Word documents to PDF in one go — each is converted and packaged into a single ZIP.", hint: "Word documents" },
    zh: { title: "批量 Word 转 PDF", subtitle: "把整个文件夹的 Word 文档一次性全部转成 PDF，打包成一个 ZIP。", hint: "Word 文档" },
    es: { title: "Word a PDF por lotes", subtitle: "Convierte una carpeta entera de documentos Word a PDF de una vez: cada uno se convierte y se empaqueta en un solo ZIP.", hint: "Documentos Word" },
    pt: { title: "Word para PDF em lote", subtitle: "Converta uma pasta inteira de documentos Word para PDF de uma vez: cada um é convertido e empacotado em um único ZIP.", hint: "Documentos Word" },
    fr: { title: "Word en PDF par lots", subtitle: "Convertissez un dossier entier de documents Word en PDF en une seule fois — chaque fichier est converti et regroupé dans un seul ZIP.", hint: "Documents Word" },
    ja: { title: "WordをPDFに一括変換", subtitle: "フォルダ内のWord文書をまとめてPDFに変換し、1つのZIPにまとめます。", hint: "Word文書" },
    de: { title: "Word stapelweise zu PDF", subtitle: "Konvertieren Sie einen ganzen Ordner mit Word-Dokumenten in einem Durchgang zu PDF – jede Datei wird konvertiert und in einem einzigen ZIP gebündelt.", hint: "Word-Dokumente" },
    ko: { title: "Word를 PDF로 일괄 변환", subtitle: "폴더 안의 Word 문서를 한 번에 PDF로 변환하여 하나의 ZIP으로 묶습니다.", hint: "Word 문서" },
  },
  excel: {
    en: { title: "Batch Excel to PDF", subtitle: "Convert a whole folder of Excel spreadsheets to PDF in one go — each is converted and packaged into a single ZIP.", hint: "Excel spreadsheets" },
    zh: { title: "批量 Excel 转 PDF", subtitle: "把整个文件夹的 Excel 表格一次性全部转成 PDF，打包成一个 ZIP。", hint: "Excel 表格" },
    es: { title: "Excel a PDF por lotes", subtitle: "Convierte una carpeta entera de hojas de cálculo Excel a PDF de una vez: cada una se convierte y se empaqueta en un solo ZIP.", hint: "Hojas de cálculo Excel" },
    pt: { title: "Excel para PDF em lote", subtitle: "Converta uma pasta inteira de planilhas Excel para PDF de uma vez: cada uma é convertida e empacotada em um único ZIP.", hint: "Planilhas Excel" },
    fr: { title: "Excel en PDF par lots", subtitle: "Convertissez un dossier entier de feuilles de calcul Excel en PDF en une seule fois — chaque fichier est converti et regroupé dans un seul ZIP.", hint: "Feuilles de calcul Excel" },
    ja: { title: "ExcelをPDFに一括変換", subtitle: "フォルダ内のExcel表計算をまとめてPDFに変換し、1つのZIPにまとめます。", hint: "Excel表計算" },
    de: { title: "Excel stapelweise zu PDF", subtitle: "Konvertieren Sie einen ganzen Ordner mit Excel-Tabellen in einem Durchgang zu PDF – jede Datei wird konvertiert und in einem einzigen ZIP gebündelt.", hint: "Excel-Tabellen" },
    ko: { title: "Excel을 PDF로 일괄 변환", subtitle: "폴더 안의 Excel 스프레드시트를 한 번에 PDF로 변환하여 하나의 ZIP으로 묶습니다.", hint: "Excel 스프레드시트" },
  },
  ppt: {
    en: { title: "Batch PPT to PDF", subtitle: "Convert a whole folder of PowerPoint presentations to PDF in one go — each is converted and packaged into a single ZIP.", hint: "PowerPoint slides" },
    zh: { title: "批量 PPT 转 PDF", subtitle: "把整个文件夹的 PowerPoint 演示文稿一次性全部转成 PDF，打包成一个 ZIP。", hint: "PowerPoint 演示文稿" },
    es: { title: "PPT a PDF por lotes", subtitle: "Convierte una carpeta entera de presentaciones de PowerPoint a PDF de una vez: cada una se convierte y se empaqueta en un solo ZIP.", hint: "Presentaciones PowerPoint" },
    pt: { title: "PPT para PDF em lote", subtitle: "Converta uma pasta inteira de apresentações do PowerPoint para PDF de uma vez: cada uma é convertida e empacotada em um único ZIP.", hint: "Apresentações PowerPoint" },
    fr: { title: "PPT en PDF par lots", subtitle: "Convertissez un dossier entier de présentations PowerPoint en PDF en une seule fois — chaque fichier est converti et regroupé dans un seul ZIP.", hint: "Présentations PowerPoint" },
    ja: { title: "PowerPointをPDFに一括変換", subtitle: "フォルダ内のPowerPointプレゼンテーションをまとめてPDFに変換し、1つのZIPにまとめます。", hint: "PowerPointスライド" },
    de: { title: "PPT stapelweise zu PDF", subtitle: "Konvertieren Sie einen ganzen Ordner mit PowerPoint-Präsentationen in einem Durchgang zu PDF – jede Datei wird konvertiert und in einem einzigen ZIP gebündelt.", hint: "PowerPoint-Folien" },
    ko: { title: "PPT를 PDF로 일괄 변환", subtitle: "폴더 안의 PowerPoint 프레젠테이션을 한 번에 PDF로 변환하여 하나의 ZIP으로 묶습니다.", hint: "PowerPoint 슬라이드" },
  },
};

export function BatchOfficeToPdfClient({ locale = "en", source, embedded = false }: { locale?: Locale; source?: Source; embedded?: boolean }) {
  // ko has no authored copy yet → English (foundation phase). Mirrors zh-Hant special-casing.
  // (zh-Hant is also collapsed here because every [al] index below is already inside a
  // `locale === "zh-Hant" ? deepHant(…) :` ternary, so the zh-Hant case never reaches [al].)
  const al: AuthoredLocale = locale === "zh-Hant" ? "en" : locale;
  const t = locale === "zh-Hant" ? deepHant(STR.zh) : STR[al];
  // zh-Hant child components (BatchUploadBox / ToolFaq) accept zh-Hant; ko → English (no Korean strings yet).
  const childLocale = locale; // shared widgets accept zh-Hant (Traditional derived via OpenCC)
  const maxFiles = Math.min(MAX_FILES, usePlanBatchFileCap());
  const head = source
    ? (locale === "zh-Hant" ? deepHant(PS[source].zh) : PS[source][al])
    : { title: t.title, subtitle: t.subtitle, hint: t.hint };
  const exts = source ? SRC[source].ext : OFFICE_EXT;
  const accept = source ? SRC[source].accept : ACCEPT;
  const [items, setItems] = useState<Item[]>([]);
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: File[]) => {
    const allowed = source ? SRC[source].ext : OFFICE_EXT;
    const office = files.filter((f) => allowed.some((e) => f.name.toLowerCase().endsWith(e)));
    if (!office.length) return;
    setError(null);
    setPhase("idle");
    setItems((prev) =>
      [
        ...prev,
        ...office.map((f) => ({
          id: `${f.name}-${f.size}-${f.lastModified}-${Math.random().toString(36).slice(2, 6)}`,
          name: f.name,
          file: f,
          status: "queued" as const,
        })),
      ].slice(0, maxFiles),
    );
  }, [source]);

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
    const updated = [...items];
    for (let i = 0; i < updated.length; i++) {
      setProgress(i + 1);
      const it = updated[i];
      try {
        const route = source ? SRC[source].route : routeFor(it.name);
        const outputFileName = it.name.replace(/\.(docx?|pptx?|xlsx?|odt|odp|ods|rtf)$/i, ".pdf");
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
  }, [items, t, source, locale]);

  const download = async () => {
    const files = items.filter((it) => it.status === "done" && it.blob);
    if (!files.length) return;
    try {
      const entries = await Promise.all(
        files.map(async (it) => ({
          name: it.name.replace(/\.(docx?|pptx?|xlsx?|odt|odp|ods|rtf)$/i, "") + ".pdf",
          data: new Uint8Array(await it.blob!.arrayBuffer()),
        })),
      );
      const zip = createZipArchive(entries);
      const blob = new Blob([zip as BlobPart], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "dockdocs-office-to-pdf.zip";
      a.click();
      trackToolRun(source ? `batch-${source}-to-pdf` : "batch-office-to-pdf");
      URL.revokeObjectURL(url);
    } catch {
      const ZIP_ERR: Record<AuthoredLocale, string> = {
        en: "Could not build the download — please try again.",
        zh: "打包下载失败，请重试。",
        es: "No se pudo crear la descarga; inténtalo de nuevo.",
        pt: "Não foi possível criar o download — tente novamente.",
        fr: "Impossible de créer le téléchargement — veuillez réessayer.",
        ja: "ダウンロードの作成に失敗しました。もう一度お試しください。",
        de: "Der Download konnte nicht erstellt werden – bitte versuchen Sie es erneut.",
        ko: "다운로드를 생성하지 못했습니다. 다시 시도해 주세요.",
      };
      setError(locale === "zh-Hant" ? toHant(ZIP_ERR.zh) : ZIP_ERR[al]);
    }
  };

  const doneCount = items.filter((it) => it.status === "done").length;

  return (
    <div className={embedded ? "mx-auto w-full max-w-3xl px-8 pb-10 pt-4" : `mx-auto ${LAYOUT.content} px-5 pb-16 sm:px-6 sm:pb-20 pt-12 sm:pt-16`}>
      {!embedded && <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{head.title}</h1>}
      <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{head.subtitle}</p>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        className="hidden"
        onChange={(e) => {
          const fs = Array.from(e.target.files || []);
          if (fs.length) addFiles(fs);
          e.currentTarget.value = "";
        }}
      />

      {items.length === 0 ? (
        <BatchUploadBox
          locale={childLocale}
          onFiles={addFiles}
          accept={accept}
          extensions={exts}
          hint={head.hint}
          privacyLabel={null}
          embedded={embedded}
          valueZone="server"
        />
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[14px] font-semibold text-[color:var(--foreground)]">{t.files(items.length, maxFiles)}</p>
            <div className="flex shrink-0 gap-2">
              {items.length < maxFiles && (
                <button type="button" onClick={() => inputRef.current?.click()} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">+</button>
              )}
              <button type="button" onClick={reset} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">{t.reset}</button>
              {phase === "done" && doneCount > 0 ? (
                <button type="button" onClick={download} className="rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90">{t.download}</button>
              ) : (
                <button type="button" onClick={run} disabled={phase === "running"} className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50">{phase === "running" ? (<><Spinner /> {t.running} {progress}/{items.length}</>) : t.run}</button>
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
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
                onRemove={phase !== "running" ? () => setItems(prev => prev.filter(x => x.id !== it.id)) : undefined}
              />
            ))}
          </div>
          <p className="mt-3 text-[12px] text-[color:var(--faint)]">{t.note}</p>
        </>
      )}

      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}
      {!embedded && <ToolFaq tool={source ? `batch-${source}-to-pdf` : "batch-office-to-pdf"} locale={childLocale} />}
    </div>
  );
}
