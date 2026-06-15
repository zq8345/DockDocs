"use client";
import { ToolFaq } from "@/components/ToolFaq";
import { BatchUploadBox } from "@/components/BatchUploadBox";

import { useCallback, useRef, useState } from "react";
import { createZipArchive } from "../../../shared/templates/pdf-tool-page/pdf-runtime";

type Locale = "en" | "zh" | "es" | "pt" | "fr";
type Mode = "sequence" | "replace";
type Item = { id: string; name: string; file: File };

const MAX_FILES = 100;

const STR = {
  en: {
    title: "Batch rename",
    subtitle: "Drop a whole folder and rename every file at once — by a numbered pattern or find-and-replace. The files themselves are untouched; you download a ZIP with the new names.",
    drop: "Drag & drop PDFs (or a folder) here, or click to choose", choose: "Choose PDFs", folder: "Choose folder",
    seq: "Numbered", rep: "Find & replace",
    base: "Base name", basePlaceholder: "e.g. invoice", start: "Start at",
    find: "Find", replace: "Replace with", findPlaceholder: "text in the filename", replacePlaceholder: "new text",
    download: "Download renamed ZIP", reset: "Start over",
    files: (n: number) => `${n} / ${MAX_FILES} files`, preview: "Preview", need: "Add at least one PDF.",
    note: "Renaming changes filenames only — the PDF contents are unchanged. Everything stays on your device.",
  },
  zh: {
    title: "批量 PDF 改名",
    subtitle: "拖入整个文件夹，一次性给所有文件改名——按编号模板或查找替换。文件内容不变；你下载一个用新名字打包的 ZIP。",
    drop: "把 PDF(或整个文件夹)拖到这里，或点击选择", choose: "选择 PDF", folder: "选择文件夹",
    seq: "编号", rep: "查找替换",
    base: "基础名", basePlaceholder: "如 invoice", start: "起始编号",
    find: "查找", replace: "替换为", findPlaceholder: "文件名中的文字", replacePlaceholder: "新文字",
    download: "下载改名后的 ZIP", reset: "重新开始",
    files: (n: number) => `${n} / ${MAX_FILES} 份`, preview: "预览", need: "至少添加一份 PDF。",
    note: "重命名只改文件名——PDF 内容不变。全部在你的设备上完成。",
  },
  es: {
    title: "Renombrar por lotes",
    subtitle: "Arrastra una carpeta entera y renombra todos los archivos a la vez, con un patrón numerado o buscar y reemplazar. Los archivos en sí no se modifican; descargas un ZIP con los nombres nuevos.",
    drop: "Arrastra y suelta PDF (o una carpeta) aquí, o haz clic para elegir", choose: "Elegir PDF", folder: "Elegir carpeta",
    seq: "Numerado", rep: "Buscar y reemplazar",
    base: "Nombre base", basePlaceholder: "p. ej. factura", start: "Empezar en",
    find: "Buscar", replace: "Reemplazar con", findPlaceholder: "texto en el nombre del archivo", replacePlaceholder: "texto nuevo",
    download: "Descargar ZIP renombrado", reset: "Empezar de nuevo",
    files: (n: number) => `${n} / ${MAX_FILES} archivos`, preview: "Vista previa", need: "Agrega al menos un PDF.",
    note: "Renombrar cambia solo los nombres de archivo: el contenido de los PDF no se modifica. Todo permanece en tu dispositivo.",
  },
  pt: {
    title: "Renomear em lote",
    subtitle: "Arraste uma pasta inteira e renomeie todos os arquivos de uma vez — com um padrão numerado ou localizar e substituir. Os arquivos em si não são alterados; você baixa um ZIP com os novos nomes.",
    drop: "Arraste e solte PDFs (ou uma pasta) aqui, ou clique para escolher", choose: "Escolher PDFs", folder: "Escolher pasta",
    seq: "Numerado", rep: "Localizar e substituir",
    base: "Nome base", basePlaceholder: "ex.: fatura", start: "Começar em",
    find: "Localizar", replace: "Substituir por", findPlaceholder: "texto no nome do arquivo", replacePlaceholder: "novo texto",
    download: "Baixar ZIP renomeado", reset: "Recomeçar",
    files: (n: number) => `${n} / ${MAX_FILES} arquivos`, preview: "Pré-visualização", need: "Adicione pelo menos um PDF.",
    note: "Renomear altera apenas os nomes dos arquivos — o conteúdo dos PDFs não é modificado. Tudo permanece no seu dispositivo.",
  },
  fr: {
    title: "Renommer en masse",
    subtitle: "Déposez un dossier entier et renommez tous les fichiers en une fois — selon un modèle numéroté ou par rechercher-remplacer. Les fichiers eux-mêmes ne sont pas modifiés ; vous téléchargez un ZIP avec les nouveaux noms.",
    drop: "Glissez-déposez des PDF (ou un dossier) ici, ou cliquez pour choisir", choose: "Choisir des PDF", folder: "Choisir un dossier",
    seq: "Numéroté", rep: "Rechercher et remplacer",
    base: "Nom de base", basePlaceholder: "ex. facture", start: "Commencer à",
    find: "Rechercher", replace: "Remplacer par", findPlaceholder: "texte dans le nom du fichier", replacePlaceholder: "nouveau texte",
    download: "Télécharger le ZIP renommé", reset: "Recommencer",
    files: (n: number) => `${n} / ${MAX_FILES} fichiers`, preview: "Aperçu", need: "Ajoutez au moins un PDF.",
    note: "Le renommage ne modifie que les noms de fichiers — le contenu des PDF reste inchangé. Tout reste sur votre appareil.",
  },
};

export function BatchRenameClient({ locale = "en" }: { locale?: Locale }) {
  const t = STR[locale] ?? STR.en;
  const [items, setItems] = useState<Item[]>([]);
  const [mode, setMode] = useState<Mode>("sequence");
  const [base, setBase] = useState("");
  const [start, setStart] = useState(1);
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: File[]) => {
    const pdfs = files.filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    if (!pdfs.length) return;
    setError(null);
    setItems((prev) => [...prev, ...pdfs.map((f) => ({ id: `${f.name}-${f.size}-${f.lastModified}-${Math.random().toString(36).slice(2, 6)}`, name: f.name, file: f }))].slice(0, MAX_FILES));
  }, []);

  const reset = () => { setItems([]); setError(null); };

  // Compute the new name for item at index (extension preserved).
  const pad = String(start + Math.max(0, items.length - 1)).length;
  const rawName = (it: Item, i: number) => {
    if (mode === "sequence") {
      const b = base.trim() || it.name.replace(/\.pdf$/i, "");
      return `${b}-${String(start + i).padStart(pad, "0")}.pdf`;
    }
    if (!find) return it.name;
    return it.name.split(find).join(replace);
  };
  // Ensure uniqueness so the ZIP has no clobbered entries.
  const newNames = (() => {
    const seen = new Map<string, number>();
    return items.map((it, i) => {
      let n = rawName(it, i);
      if (seen.has(n)) { const c = (seen.get(n) || 0) + 1; seen.set(n, c); n = n.replace(/(\.pdf)$/i, `-${c}$1`); }
      else seen.set(n, 0);
      return n;
    });
  })();

  const download = async () => {
    if (items.length === 0) { setError(t.need); return; }
    try {
      const entries = await Promise.all(items.map(async (it, i) => ({ name: newNames[i], data: new Uint8Array(await it.file.arrayBuffer()) })));
      const zip = createZipArchive(entries);
      const blob = new Blob([zip as BlobPart], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "dockdocs-renamed.zip"; a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(locale === "zh" ? "打包下载失败，请重试。" : "Could not build the download — please try again.");
    }
  };

  const inputCls = "h-9 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3 text-[13.5px] text-[color:var(--foreground)]";

  return (
    <div className="mx-auto max-w-5xl px-5 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20">
      <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{t.title}</h1>
      <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.subtitle}</p>

      <input ref={inputRef} type="file" accept="application/pdf,.pdf" multiple className="hidden" onChange={(e) => { const fs = Array.from(e.target.files || []); if (fs.length) addFiles(fs); e.currentTarget.value = ""; }} />
      <input ref={folderRef} type="file" multiple className="hidden" {...({ webkitdirectory: "", directory: "" } as Record<string, string>)} onChange={(e) => { const fs = Array.from(e.target.files || []); if (fs.length) addFiles(fs); e.currentTarget.value = ""; }} />

      {items.length === 0 ? (
        <BatchUploadBox locale={locale} onFiles={addFiles} />
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-wrap items-end gap-3">
              <div className="inline-flex rounded-[var(--radius)] border border-[color:var(--line)] p-0.5">
                {(["sequence", "replace"] as const).map((m) => (
                  <button key={m} type="button" onClick={() => setMode(m)} className={`rounded-[var(--radius-sm)] px-3 py-1.5 text-[12.5px] font-medium transition ${mode === m ? "bg-[color:var(--accent)] text-white" : "text-[color:var(--muted)]"}`}>{m === "sequence" ? t.seq : t.rep}</button>
                ))}
              </div>
              {mode === "sequence" ? (
                <>
                  <label className="flex flex-col gap-1 text-[11.5px] text-[color:var(--muted)]">{t.base}<input value={base} onChange={(e) => setBase(e.target.value)} placeholder={t.basePlaceholder} className={`${inputCls} w-40`} /></label>
                  <label className="flex flex-col gap-1 text-[11.5px] text-[color:var(--muted)]">{t.start}<input type="number" min={0} value={start} onChange={(e) => setStart(Math.max(0, parseInt(e.target.value || "0", 10)))} className={`${inputCls} w-24`} /></label>
                </>
              ) : (
                <>
                  <label className="flex flex-col gap-1 text-[11.5px] text-[color:var(--muted)]">{t.find}<input value={find} onChange={(e) => setFind(e.target.value)} placeholder={t.findPlaceholder} className={`${inputCls} w-40`} /></label>
                  <label className="flex flex-col gap-1 text-[11.5px] text-[color:var(--muted)]">{t.replace}<input value={replace} onChange={(e) => setReplace(e.target.value)} placeholder={t.replacePlaceholder} className={`${inputCls} w-40`} /></label>
                </>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <p className="text-[14px] font-semibold text-[color:var(--foreground)]">{t.files(items.length)}</p>
              {items.length < MAX_FILES && <button type="button" onClick={() => inputRef.current?.click()} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">+</button>}
              <button type="button" onClick={reset} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">{t.reset}</button>
              <button type="button" onClick={download} className="rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90">{t.download}</button>
            </div>
          </div>

          <p className="mt-4 text-[12px] font-semibold uppercase tracking-[0.1em] text-[color:var(--faint)]">{t.preview}</p>
          <ul className="mt-2 grid gap-1.5">
            {items.map((it, i) => (
              <li key={it.id} className="flex items-center gap-2 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-2 text-[13px]">
                <span className="min-w-0 flex-1 truncate text-[color:var(--muted)] line-through" title={it.name}>{it.name}</span>
                <span className="shrink-0 text-[color:var(--faint)]">→</span>
                <span className="min-w-0 flex-1 truncate font-medium text-[color:var(--foreground)]" title={newNames[i]}>{newNames[i]}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[12px] text-[color:var(--faint)]">{t.note}</p>
        </>
      )}

      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}
      <ToolFaq tool="batch-rename-pdf" locale={locale} />
    </div>
  );
}
