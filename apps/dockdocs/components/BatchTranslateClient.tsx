"use client";
import { ToolFaq } from "@/components/ToolFaq";
import { BatchUploadBox } from "@/components/BatchUploadBox";
import { checkUsage, markUsage } from "@/lib/usage-gate";
import { UpgradePrompt } from "@/components/ui/UpgradePrompt";
import { encryptedPdfMessage } from "@/lib/pdf-errors";
import { authHeader } from "@/lib/supabase";

import { useCallback, useRef, useState } from "react";
import { Spinner } from "@/components/Spinner";
import { createZipArchive } from "../../../shared/templates/pdf-tool-page/pdf-runtime";
import { BatchFileCard } from "@/components/BatchFileCard";

type Locale = "en" | "zh" | "es" | "pt" | "fr";
type Status = "queued" | "done" | "error";
type Item = { id: string; name: string; file: File; status: Status; translation?: string; msg?: string };

const MAX_FILES = 10; // AI translation has a per-call cost — keep batches modest
const MAX_CHARS = 14_000;

const LANGS: Array<{ code: string; en: string; zh: string }> = [
  { code: "en", en: "English", zh: "英语" },
  { code: "zh", en: "Chinese (Simplified)", zh: "中文（简体）" },
  { code: "zh-Hant", en: "Chinese (Traditional)", zh: "中文（繁体）" },
  { code: "es", en: "Spanish", zh: "西班牙语" },
  { code: "fr", en: "French", zh: "法语" },
  { code: "de", en: "German", zh: "德语" },
  { code: "ja", en: "Japanese", zh: "日语" },
  { code: "ko", en: "Korean", zh: "韩语" },
  { code: "pt", en: "Portuguese", zh: "葡萄牙语" },
  { code: "it", en: "Italian", zh: "意大利语" },
  { code: "ru", en: "Russian", zh: "俄语" },
  { code: "ar", en: "Arabic", zh: "阿拉伯语" },
  { code: "hi", en: "Hindi", zh: "印地语" },
];

const STR = {
  en: {
    title: "Batch Translate PDFs",
    subtitle:
      "Translate a whole folder of PDFs into one language in a single run — the text of each is translated and packaged into a single ZIP of .txt files.",
    target: "Translate to",
    run: "Translate all",
    running: "Translating",
    download: "Download ZIP",
    reset: "Start over",
    files: (n: number) => `${n} / ${MAX_FILES} files`,
    done: "done",
    failed: "failed",
    need: "Add at least one PDF.",
    noText: "No selectable text (scanned?)",
    tooLong: "Too long (over 14k chars)",
    note: "Each PDF is read in your browser; only the extracted text is sent for translation. Output is plain text (.txt), one file per PDF — layout is not preserved. Scanned PDFs need OCR first. Counts toward your daily AI limit.",
    err: "Something went wrong: ",
  },
  zh: {
    title: "批量翻译 PDF",
    subtitle:
      "一次把整个文件夹的 PDF 翻译成同一种语言——每份的文字被翻译并打包成一个 .txt 文件的 ZIP。",
    target: "翻译成",
    run: "全部翻译",
    running: "翻译中",
    download: "下载 ZIP",
    reset: "重新开始",
    files: (n: number) => `${n} / ${MAX_FILES} 份`,
    done: "完成",
    failed: "失败",
    need: "至少添加一份 PDF。",
    noText: "无可选文字（扫描件？）",
    tooLong: "文字过长（超 1.4 万字符）",
    note: "每份 PDF 在你的浏览器中读取，只有提取的文字会被发送去翻译。输出为纯文本(.txt)，每份 PDF 一个文件——不保留版式。扫描件需先做 OCR。计入你的每日 AI 额度。",
    err: "出错了：",
  },
  es: {
    title: "Traducir PDF por lotes",
    subtitle:
      "Traduce una carpeta entera de PDF a un idioma de una sola vez: el texto de cada uno se traduce y se empaqueta en un solo ZIP de archivos .txt.",
    target: "Traducir a",
    run: "Traducir todo",
    running: "Traduciendo",
    download: "Descargar ZIP",
    reset: "Empezar de nuevo",
    files: (n: number) => `${n} / ${MAX_FILES} archivos`,
    done: "listo",
    failed: "falló",
    need: "Agrega al menos un PDF.",
    noText: "Sin texto seleccionable (¿escaneado?)",
    tooLong: "Demasiado largo (más de 14k caracteres)",
    note: "Cada PDF se lee en tu navegador; solo se envía el texto extraído para traducir. La salida es texto plano (.txt), un archivo por PDF; no se conserva el diseño. Los PDF escaneados necesitan OCR primero. Cuenta para tu límite diario de IA.",
    err: "Algo salió mal: ",
  },
  pt: {
    title: "Traduzir PDFs em lote",
    subtitle:
      "Traduza uma pasta inteira de PDFs para um idioma em uma única execução — o texto de cada um é traduzido e empacotado em um único ZIP de arquivos .txt.",
    target: "Traduzir para",
    run: "Traduzir tudo",
    running: "Traduzindo",
    download: "Baixar ZIP",
    reset: "Recomeçar",
    files: (n: number) => `${n} / ${MAX_FILES} arquivos`,
    done: "pronto",
    failed: "falhou",
    need: "Adicione pelo menos um PDF.",
    noText: "Sem texto selecionável (digitalizado?)",
    tooLong: "Muito longo (mais de 14k caracteres)",
    note: "Cada PDF é lido no seu navegador; apenas o texto extraído é enviado para tradução. A saída é texto simples (.txt), um arquivo por PDF — o layout não é preservado. PDFs digitalizados precisam de OCR primeiro. Conta para o seu limite diário de IA.",
    err: "Algo deu errado: ",
  },
  fr: {
    title: "Traduire des PDF en lot",
    subtitle:
      "Traduisez un dossier entier de PDF dans une seule langue en une seule fois — le texte de chacun est traduit et regroupé dans un seul fichier ZIP de fichiers .txt.",
    target: "Traduire en",
    run: "Tout traduire",
    running: "Traduction en cours",
    download: "Télécharger le ZIP",
    reset: "Recommencer",
    files: (n: number) => `${n} / ${MAX_FILES} fichiers`,
    done: "terminé",
    failed: "échec",
    need: "Ajoutez au moins un PDF.",
    noText: "Aucun texte sélectionnable (numérisé ?)",
    tooLong: "Trop long (plus de 14 000 caractères)",
    note: "Chaque PDF est lu dans votre navigateur ; seul le texte extrait est envoyé pour traduction. Le résultat est en texte brut (.txt), un fichier par PDF — la mise en page n'est pas conservée. Les PDF numérisés nécessitent une OCR au préalable. Compte dans votre limite IA quotidienne.",
    err: "Une erreur s'est produite : ",
  },
};

async function extractText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  const data = new Uint8Array(await file.arrayBuffer());
  const doc = await pdfjs.getDocument({ data }).promise;
  let out = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    out += content.items.map((it) => ("str" in it ? it.str : "")).join(" ") + "\n\n";
  }
  try { doc.destroy(); } catch { /* ignore */ }
  return out.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

export function BatchTranslateClient({ locale = "en" }: { locale?: Locale }) {
  const t = STR[locale] ?? STR.en;
  const [items, setItems] = useState<Item[]>([]);
  const [target, setTarget] = useState(locale === "zh" ? "en" : "zh");
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [limitHit, setLimitHit] = useState<number | null>(null);
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
      ].slice(0, MAX_FILES),
    );
  }, []);

  const reset = () => {
    setItems([]);
    setPhase("idle");
    setProgress(0);
    setError(null);
    setLimitHit(null);
  };

  const run = useCallback(async () => {
    if (items.length === 0) {
      setError(t.need);
      return;
    }
    setPhase("running");
    setError(null);
    setLimitHit(null);
    setProgress(0);
    const auth = await authHeader();
    const updated = [...items];
    for (let i = 0; i < updated.length; i++) {
      setProgress(i + 1);
      const it = updated[i];
      try {
        const text = await extractText(it.file);
        if (!text) {
          updated[i] = { ...it, status: "error", msg: t.noText };
          setItems([...updated]);
          continue;
        }
        if (text.length > MAX_CHARS) {
          updated[i] = { ...it, status: "error", msg: t.tooLong };
          setItems([...updated]);
          continue;
        }
        const gate = await checkUsage("translate");
        if (!gate.allowed) {
          setLimitHit(gate.limit);
          // Stop here — remaining files stay queued so the user knows they weren't done.
          break;
        }
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...auth },
          body: JSON.stringify({ text, targetLang: target, locale }),
        });
        const data = await res.json().catch(() => ({}));
        if (data?.ok && typeof data.translation === "string") {
          updated[i] = { ...it, status: "done", translation: data.translation };
          await markUsage(gate, "translate");
        } else {
          updated[i] = { ...it, status: "error", msg: data?.message || t.failed };
        }
      } catch (e) {
        updated[i] = { ...it, status: "error", msg: encryptedPdfMessage(e, locale) ?? (e instanceof Error ? e.message : String(e)) };
      }
      setItems([...updated]);
    }
    setPhase("done");
  }, [items, target, locale, t]);

  const download = async () => {
    const files = items.filter((it) => it.status === "done" && it.translation);
    if (!files.length) return;
    try {
      const enc = new TextEncoder();
      const entries = files.map((it) => ({
        name: it.name.replace(/\.pdf$/i, "") + `-${target}.txt`,
        data: enc.encode(it.translation!),
      }));
      const zip = createZipArchive(entries);
      const blob = new Blob([zip as BlobPart], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dockdocs-translated-${target}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError(locale === "zh" ? "打包下载失败，请重试。" : locale === "es" ? "No se pudo crear la descarga; inténtalo de nuevo." : "Could not build the download — please try again.");
    }
  };

  const doneCount = items.filter((it) => it.status === "done").length;

  return (
    <div className="mx-auto max-w-5xl px-5 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20">
      <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{t.title}</h1>
      <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.subtitle}</p>

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
        <BatchUploadBox locale={locale} onFiles={addFiles} privacyLabel={locale === "zh" ? "文件在本地读取，仅发送文字" : locale === "es" ? "Leído localmente; solo se envía el texto" : "Read locally — only text is sent"} />
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-[14px] font-semibold text-[color:var(--foreground)]">{t.files(items.length)}</p>
              <label className="inline-flex items-center gap-2">
                <span className="text-[12px] font-medium text-[color:var(--muted)]">{t.target}</span>
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  disabled={phase === "running"}
                  className="h-9 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-2.5 text-[13px] text-[color:var(--foreground)]"
                >
                  {LANGS.map((l) => (
                    <option key={l.code} value={l.code}>{locale === "zh" ? l.zh : l.en}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex shrink-0 gap-2">
              {items.length < MAX_FILES && (
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

      {limitHit !== null && <UpgradePrompt locale={locale} limit={limitHit} />}
      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}
      <ToolFaq tool="batch-translate" locale={locale} />
    </div>
  );
}
