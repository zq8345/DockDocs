"use client";
import { ToolFaq } from "@/components/ToolFaq";
import { BatchUploadBox } from "@/components/BatchUploadBox";

import { useCallback, useRef, useState } from "react";
import { Spinner } from "@/components/Spinner";
import { createZipArchive } from "../../../shared/templates/pdf-tool-page/pdf-runtime";
import { BatchFileCard } from "@/components/BatchFileCard";
import { usePlanBatchFileCap, checkAndRecordBatchRun, batchLimitMessage } from "@/lib/batch-limits";

type Locale = "en" | "zh" | "es" | "pt" | "fr" | "ja";
type Format = "word" | "excel";
type Status = "queued" | "done" | "error";
type Item = { id: string; name: string; file: File; status: Status; blob?: Blob; msg?: string };

const MAX_FILES = 20;
const MAX_BYTES = 5 * 1024 * 1024; // OSS reverse converter passes files through the Netlify function (~6 MB body cap)
const REVERSE_API = "/api/reverse-convert";

const STR = {
  en: {
    title: "Batch PDF to Word / Excel",
    subtitle:
      "Convert a whole folder of PDFs to editable Word or Excel files in one go — each is converted on our server and packaged into a single ZIP.",
    word: "To Word (.docx)",
    excel: "To Excel (.xlsx)",
    run: "Convert all",
    running: "Converting",
    download: "Download ZIP",
    reset: "Start over",
    files: (n: number, max: number) => `${n} / ${max} files`,
    done: "done",
    failed: "failed",
    need: "Add at least one PDF.",
    tooBig: "Over 5 MB — use the single-file tool",
    note: "Text and tables are extracted into an editable file. Scanned or heavily-designed PDFs may not convert perfectly. Files over 5 MB aren't supported in batch — use the single-file converter for those.",
    err: "Something went wrong: ",
  },
  zh: {
    title: "批量 PDF 转 Word / Excel",
    subtitle:
      "把整个文件夹的 PDF 一次性转成可编辑的 Word 或 Excel——每个在服务器转换并打包成一个 ZIP。",
    word: "转 Word (.docx)",
    excel: "转 Excel (.xlsx)",
    run: "全部转换",
    running: "转换中",
    download: "下载 ZIP",
    reset: "重新开始",
    files: (n: number, max: number) => `${n} / ${max} 份`,
    done: "完成",
    failed: "失败",
    need: "至少添加一份 PDF。",
    tooBig: "超过 5MB，请用单文件工具",
    note: "转换会把文字和表格提取成可编辑文件。扫描件或排版复杂的 PDF 可能转换得不完美。批量不支持超过 5MB 的文件——这类请用单文件转换器。",
    err: "出错了：",
  },
  es: {
    title: "PDF a Word / Excel por lotes",
    subtitle:
      "Convierte una carpeta entera de PDF a archivos Word o Excel editables de una vez: cada uno se convierte en nuestro servidor y se empaqueta en un solo ZIP.",
    word: "A Word (.docx)",
    excel: "A Excel (.xlsx)",
    run: "Convertir todo",
    running: "Convirtiendo",
    download: "Descargar ZIP",
    reset: "Empezar de nuevo",
    files: (n: number, max: number) => `${n} / ${max} archivos`,
    done: "listo",
    failed: "falló",
    need: "Agrega al menos un PDF.",
    tooBig: "Más de 5 MB — usa la herramienta de un solo archivo",
    note: "El texto y las tablas se extraen en un archivo editable. Los PDF escaneados o con mucho diseño pueden no convertirse perfectamente. Los archivos de más de 5 MB no se admiten por lotes; usa el convertidor de un solo archivo para esos.",
    err: "Algo salió mal: ",
  },
  pt: {
    title: "PDF para Word / Excel em lote",
    subtitle:
      "Converta uma pasta inteira de PDFs para arquivos Word ou Excel editáveis de uma vez: cada um é convertido no nosso servidor e empacotado em um único ZIP.",
    word: "Para Word (.docx)",
    excel: "Para Excel (.xlsx)",
    run: "Converter tudo",
    running: "Convertendo",
    download: "Baixar ZIP",
    reset: "Recomeçar",
    files: (n: number, max: number) => `${n} / ${max} arquivos`,
    done: "pronto",
    failed: "falhou",
    need: "Adicione pelo menos um PDF.",
    tooBig: "Mais de 5 MB — use a ferramenta de arquivo único",
    note: "O texto e as tabelas são extraídos para um arquivo editável. PDFs digitalizados ou com muito design podem não converter perfeitamente. Arquivos acima de 5 MB não são suportados em lote — use o conversor de arquivo único para esses.",
    err: "Algo deu errado: ",
  },
  fr: {
    title: "PDF en Word / Excel en lot",
    subtitle:
      "Convertissez un dossier entier de PDF en fichiers Word ou Excel modifiables en une seule fois : chaque fichier est converti sur notre serveur et regroupé dans un seul ZIP.",
    word: "En Word (.docx)",
    excel: "En Excel (.xlsx)",
    run: "Tout convertir",
    running: "Conversion en cours",
    download: "Télécharger le ZIP",
    reset: "Recommencer",
    files: (n: number, max: number) => `${n} / ${max} fichiers`,
    done: "terminé",
    failed: "échec",
    need: "Ajoutez au moins un PDF.",
    tooBig: "Plus de 5 Mo — utilisez l'outil fichier unique",
    note: "Le texte et les tableaux sont extraits dans un fichier modifiable. Les PDF numérisés ou très mis en page peuvent ne pas se convertir parfaitement. Les fichiers de plus de 5 Mo ne sont pas pris en charge en lot — utilisez le convertisseur fichier unique pour ceux-là.",
    err: "Une erreur est survenue : ",
  },
  ja: {
    title: "PDFをWord / Excelに一括変換",
    subtitle:
      "フォルダ内のPDFをまとめて編集可能なWordまたはExcelファイルに変換します。各ファイルはサーバーで変換され、1つのZIPにまとめられます。",
    word: "Wordに変換 (.docx)",
    excel: "Excelに変換 (.xlsx)",
    run: "すべて変換",
    running: "変換中",
    download: "ZIPをダウンロード",
    reset: "最初からやり直す",
    files: (n: number, max: number) => `${n} / ${max} ファイル`,
    done: "完了",
    failed: "失敗",
    need: "PDFを1つ以上追加してください。",
    tooBig: "5 MB超 — 単一ファイルツールをご利用ください",
    note: "テキストと表が編集可能なファイルに抽出されます。スキャンされたPDFや凝ったデザインのPDFは完全には変換できない場合があります。5 MBを超えるファイルは一括処理に対応していません — その場合は単一ファイル変換ツールをご利用ください。",
    err: "問題が発生しました: ",
  },
};

// Per-target heading/subtitle (native) for the split single-format pages.
const PT: Record<Format, Record<Locale, { title: string; subtitle: string }>> = {
  word: {
    en: { title: "Batch PDF to Word", subtitle: "Convert a whole folder of PDFs to editable Word (.docx) files in one go — each is converted on our server and packaged into a single ZIP." },
    zh: { title: "批量 PDF 转 Word", subtitle: "把整个文件夹的 PDF 一次性转成可编辑的 Word(.docx)——每个在服务器转换并打包成一个 ZIP。" },
    es: { title: "PDF a Word por lotes", subtitle: "Convierte una carpeta entera de PDF a archivos Word (.docx) editables de una vez: cada uno se convierte en nuestro servidor y se empaqueta en un solo ZIP." },
    pt: { title: "PDF para Word em lote", subtitle: "Converta uma pasta inteira de PDFs para arquivos Word (.docx) editáveis de uma vez: cada um é convertido no nosso servidor e empacotado em um único ZIP." },
    fr: { title: "PDF en Word par lots", subtitle: "Convertissez un dossier entier de PDF en fichiers Word (.docx) modifiables en une seule fois : chaque fichier est converti sur notre serveur et regroupé dans un seul ZIP." },
    ja: { title: "PDFをWordに一括変換", subtitle: "フォルダ内のPDFをまとめて編集可能なWord（.docx）に変換します——各ファイルはサーバーで変換され、1つのZIPにまとめられます。" },
  },
  excel: {
    en: { title: "Batch PDF to Excel", subtitle: "Convert a whole folder of PDFs to editable Excel (.xlsx) spreadsheets in one go — each is converted on our server and packaged into a single ZIP." },
    zh: { title: "批量 PDF 转 Excel", subtitle: "把整个文件夹的 PDF 一次性转成可编辑的 Excel(.xlsx)——每个在服务器转换并打包成一个 ZIP。" },
    es: { title: "PDF a Excel por lotes", subtitle: "Convierte una carpeta entera de PDF a hojas de cálculo Excel (.xlsx) editables de una vez: cada una se convierte en nuestro servidor y se empaqueta en un solo ZIP." },
    pt: { title: "PDF para Excel em lote", subtitle: "Converta uma pasta inteira de PDFs para planilhas Excel (.xlsx) editáveis de uma vez: cada uma é convertida no nosso servidor e empacotada em um único ZIP." },
    fr: { title: "PDF en Excel par lots", subtitle: "Convertissez un dossier entier de PDF en feuilles de calcul Excel (.xlsx) modifiables en une seule fois : chaque fichier est converti sur notre serveur et regroupé dans un seul ZIP." },
    ja: { title: "PDFをExcelに一括変換", subtitle: "フォルダ内のPDFをまとめて編集可能なExcel（.xlsx）に変換します——各ファイルはサーバーで変換され、1つのZIPにまとめられます。" },
  },
};

export function BatchPdfToOfficeClient({ locale = "en", target }: { locale?: Locale; target?: Format }) {
  const t = STR[locale] ?? STR.en;
  const maxFiles = Math.min(MAX_FILES, usePlanBatchFileCap());
  const head = target ? (PT[target][locale] ?? PT[target].en) : { title: t.title, subtitle: t.subtitle };
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
  }, []);

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
    const updated = [...items];
    for (let i = 0; i < updated.length; i++) {
      setProgress(i + 1);
      const it = updated[i];
      if (it.file.size > MAX_BYTES) {
        updated[i] = { ...it, status: "error", msg: t.tooBig };
        setItems([...updated]);
        continue;
      }
      try {
        const fd = new FormData();
        fd.append("route", route);
        fd.append("file", it.file, it.file.name || "source.pdf");
        const res = await fetch(REVERSE_API, { method: "POST", body: fd });
        if (!res.ok) {
          let msg = t.failed;
          try {
            const j = await res.json();
            if (j?.message) msg = j.message;
          } catch {
            /* non-JSON error body */
          }
          updated[i] = { ...it, status: "error", msg };
        } else {
          const blob = await res.blob();
          updated[i] = blob.size === 0 ? { ...it, status: "error", msg: t.failed } : { ...it, status: "done", blob };
        }
      } catch (e) {
        updated[i] = { ...it, status: "error", msg: e instanceof Error ? e.message : String(e) };
      }
      setItems([...updated]);
    }
    setPhase("done");
  }, [items, format, t]);

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
      URL.revokeObjectURL(url);
    } catch {
      setError(locale === "zh" ? "打包下载失败，请重试。" : locale === "es" ? "No se pudo crear la descarga; inténtalo de nuevo." : locale === "fr" ? "Impossible de créer le téléchargement — veuillez réessayer." : locale === "pt" ? "Não foi possível criar o download — tente novamente." : locale === "ja" ? "ダウンロードの作成に失敗しました。もう一度お試しください。" : "Could not build the download — please try again.");
    }
  };

  const doneCount = items.filter((it) => it.status === "done").length;
  const formats: Format[] = ["word", "excel"];

  return (
    <div className="mx-auto max-w-5xl px-5 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20">
      <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{head.title}</h1>
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
        <BatchUploadBox locale={locale} onFiles={addFiles} privacyLabel={locale === "zh" ? "在我们的服务器转换" : locale === "es" ? "Convertido en nuestro servidor" : locale === "fr" ? "Converti sur notre serveur" : locale === "pt" ? "Convertido no nosso servidor" : locale === "ja" ? "当社のサーバーで変換" : "Converted on our server"} />
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
                <button type="button" onClick={run} disabled={phase === "running"} className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50">{phase === "running" ? (<><Spinner /> {t.running} {progress}/{items.length}</>) : t.run}</button>
              )}
            </div>
          </div>

          <ul className="mt-4 grid gap-2">
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
                onRemove={phase !== "running" ? () => setItems(prev => prev.filter(x => x.id !== it.id)) : undefined}
              />
            ))}
          </ul>
          <p className="mt-3 text-[12px] text-[color:var(--faint)]">{t.note}</p>
        </>
      )}

      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}
      <ToolFaq tool={target ? `batch-pdf-to-${target}` : "batch-pdf-to-office"} locale={locale} />
    </div>
  );
}
