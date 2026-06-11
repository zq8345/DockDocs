"use client";

import { ToolFaq } from "@/components/ToolFaq";
import { encryptedPdfMessage } from "@/lib/pdf-errors";
import { checkUsage, markUsage, freeLimitMessage } from "@/lib/usage-gate";

import { useCallback, useRef, useState } from "react";

type Locale = "en" | "zh";

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
  { code: "nl", en: "Dutch", zh: "荷兰语" },
  { code: "id", en: "Indonesian", zh: "印尼语" },
  { code: "vi", en: "Vietnamese", zh: "越南语" },
  { code: "th", en: "Thai", zh: "泰语" },
  { code: "tr", en: "Turkish", zh: "土耳其语" },
];

const STR = {
  en: {
    title: "Translate PDF",
    subtitle:
      "Upload a PDF, pick a language, and get the translated text. AI translates the document's text — processed privately, text-only for now (layout-preserving is coming).",
    drop: "Drag & drop a PDF here, or click to choose",
    choose: "Choose PDF",
    extracting: "Reading PDF…",
    pagesChars: (p: number, c: number) => `${p} pages · ${c.toLocaleString()} characters`,
    noText: "No selectable text found. Is this a scanned PDF? Run OCR first.",
    tooLong: `This PDF has more text than the ${MAX_CHARS.toLocaleString()}-character limit. Use a shorter document (about 10 pages).`,
    target: "Translate to",
    translate: "Translate",
    translating: "Translating…",
    result: "Translation",
    copy: "Copy",
    copied: "Copied!",
    download: "Download .txt",
    reset: "Start over",
    errPrefix: "Translation failed: ",
    privacy: "Your file is read in your browser; only the extracted text is sent for translation.",
  },
  zh: {
    title: "翻译 PDF",
    subtitle:
      "上传 PDF、选择语言，获得翻译后的文字。AI 翻译文档中的文字——私密处理，目前为纯文本（保留版式即将推出）。",
    drop: "把 PDF 拖到这里，或点击选择",
    choose: "选择 PDF",
    extracting: "正在读取 PDF…",
    pagesChars: (p: number, c: number) => `${p} 页 · ${c.toLocaleString()} 字符`,
    noText: "没找到可选中的文字。是扫描件吗？请先用 OCR。",
    tooLong: `这份 PDF 的文字超过 ${MAX_CHARS.toLocaleString()} 字符上限，请用更短的文档（约 10 页内）。`,
    target: "翻译成",
    translate: "翻译",
    translating: "正在翻译…",
    result: "翻译结果",
    copy: "复制",
    copied: "已复制！",
    download: "下载 .txt",
    reset: "重新开始",
    errPrefix: "翻译失败：",
    privacy: "文件在你的浏览器中读取，只有提取出的文字会被发送去翻译。",
  },
};

type Phase = "idle" | "extracting" | "ready" | "translating" | "done";

export function TranslatePdfClient({ locale = "en" }: { locale?: Locale }) {
  const t = STR[locale] ?? STR.en;
  const [phase, setPhase] = useState<Phase>("idle");
  const [fileName, setFileName] = useState("");
  const [text, setText] = useState("");
  const [pages, setPages] = useState(0);
  const [target, setTarget] = useState(locale === "zh" ? "en" : "zh");
  const [result, setResult] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setPhase("idle");
    setFileName("");
    setText("");
    setPages(0);
    setResult("");
    setError(null);
  };

  const onFile = useCallback(
    async (file: File) => {
      if (!file || (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"))) return;
      setError(null);
      setResult("");
      setFileName(file.name);
      setPhase("extracting");
      try {
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
        const trimmed = out.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
        if (!trimmed) {
          setError(t.noText);
          setPhase("idle");
          return;
        }
        if (trimmed.length > MAX_CHARS) {
          setError(t.tooLong);
          setPhase("idle");
          return;
        }
        setText(trimmed);
        setPages(doc.numPages);
        try { doc.destroy(); } catch { /* ignore */ }
        setPhase("ready");
      } catch (e) {
        setError(encryptedPdfMessage(e, locale) ?? ((e instanceof Error ? e.message : String(e)) || "Could not read PDF."));
        setPhase("idle");
      }
    },
    [t, locale],
  );

  const onTranslate = useCallback(async () => {
    if (!text) return;
    setPhase("translating");
    setError(null);
    try {
      const gate = await checkUsage("translate");
      if (!gate.allowed) {
        setError(freeLimitMessage(gate.limit, locale === "zh"));
        setPhase("ready");
        return;
      }
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLang: target, locale }),
      });
      const data = await res.json();
      if (data?.ok && typeof data.translation === "string") {
        setResult(data.translation);
        setPhase("done");
        await markUsage(gate, "translate");
      } else {
        setError(t.errPrefix + (data?.message || "Unknown error."));
        setPhase("ready");
      }
    } catch (e) {
      setError(t.errPrefix + (e instanceof Error ? e.message : String(e)));
      setPhase("ready");
    }
  }, [text, target, locale, t]);

  const download = () => {
    const blob = new Blob([result], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (fileName.replace(/\.pdf$/i, "") || "translation") + `-${target}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const card =
    "rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)]";

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
      <h1 className="text-[28px] font-semibold tracking-[-0.018em] text-[color:var(--foreground)] sm:text-[34px]">
        {t.title}
      </h1>
      <p className="mt-3 max-w-4xl text-[15px] leading-relaxed text-[color:var(--muted)]">{t.subtitle}</p>

      {/* Upload */}
      {phase === "idle" || phase === "extracting" ? (
        <div
          className={`${card} mt-8 cursor-pointer border-dashed p-10 text-center transition hover:border-[color:var(--line-strong)]`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f) onFile(f);
          }}
        >
          <p className="text-[15px] font-medium text-[color:var(--foreground)]">
            {phase === "extracting" ? t.extracting : t.drop}
          </p>
          {phase !== "extracting" && (
            <button
              type="button"
              className="mt-4 inline-flex h-10 items-center rounded-[var(--radius)] bg-[color:var(--accent)] px-5 text-[14px] font-semibold text-white transition hover:opacity-90"
            >
              {t.choose}
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
            }}
          />
        </div>
      ) : (
        <div className={`${card} mt-8 p-5`}>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold text-[color:var(--foreground)]">{fileName}</p>
              <p className="text-[12.5px] text-[color:var(--muted)]">{t.pagesChars(pages, text.length)}</p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="shrink-0 text-[13px] font-medium text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
            >
              {t.reset}
            </button>
          </div>

          <div className="mt-5 flex flex-wrap items-end gap-3">
            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                {t.target}
              </span>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                disabled={phase === "translating"}
                className="h-10 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3 text-[14px] text-[color:var(--foreground)]"
              >
                {LANGS.map((l) => (
                  <option key={l.code} value={l.code}>
                    {locale === "zh" ? l.zh : l.en}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={onTranslate}
              disabled={phase === "translating"}
              className="inline-flex h-10 items-center rounded-[var(--radius)] bg-[color:var(--accent)] px-6 text-[14px] font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {phase === "translating" ? t.translating : t.translate}
            </button>
          </div>
          <p className="mt-3 text-[11.5px] text-[color:var(--faint)]">{t.privacy}</p>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className={`${card} mt-6 p-5`}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
              {t.result}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={copy}
                className="rounded-[var(--radius-sm)] border border-[color:var(--line)] px-3 py-1.5 text-[12.5px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]"
              >
                {copied ? t.copied : t.copy}
              </button>
              <button
                type="button"
                onClick={download}
                className="rounded-[var(--radius-sm)] bg-[color:var(--accent)] px-3 py-1.5 text-[12.5px] font-semibold text-white transition hover:opacity-90"
              >
                {t.download}
              </button>
            </div>
          </div>
          <textarea
            readOnly
            value={result}
            className="h-80 w-full resize-y rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-3 text-[14px] leading-relaxed text-[color:var(--foreground)]"
          />
        </div>
      )}
      <ToolFaq tool="translate-pdf" locale={locale} />
    </div>
  );
}
