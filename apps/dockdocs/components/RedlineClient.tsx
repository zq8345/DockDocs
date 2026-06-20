"use client";

import { useCallback, useRef, useState } from "react";
import { Spinner } from "@/components/Spinner";
import { ToolFaq } from "@/components/ToolFaq";
import { encryptedPdfMessage } from "@/lib/pdf-errors";
import { deepHant } from "@/lib/zh-hant";
import { dropzoneVisual } from "@/components/design";

type Locale = "en" | "zh" | "es" | "pt" | "fr" | "ja" | "zh-Hant";
type Op ={ type: "eq" | "del" | "ins"; text: string };

const STR = {
  en: {
    title: "Compare versions",
    subtitle: "Upload an original and a revised PDF to see exactly what changed — added text is highlighted, removed text is struck through. Everything runs in your browser.",
    original: "Original (v1)", revised: "Revised (v2)",
    choose: "Choose PDF", reading: "Reading…", change: "Replace",
    compare: "Compare versions", comparing: "Comparing…", reset: "Start over",
    added: "Added", removed: "Removed", unchanged: "No textual changes found.",
    summary: (a: number, d: number) => `${a} added · ${d} removed`,
    need: "Add both PDFs to compare.",
    err: "Something went wrong: ",
    note: "Compares the extracted text sentence by sentence. Formatting and images aren't part of the comparison.",
  },
  zh: {
    title: "PDF 版本对比",
    subtitle: "上传原始版和修订版 PDF，看清到底改了什么——新增文字高亮，删除文字加删除线。全部在浏览器中完成。",
    original: "原始版 (v1)", revised: "修订版 (v2)",
    choose: "选择 PDF", reading: "读取中…", change: "替换",
    compare: "对比版本", comparing: "对比中…", reset: "重新开始",
    added: "新增", removed: "删除", unchanged: "未发现文字差异。",
    summary: (a: number, d: number) => `新增 ${a} · 删除 ${d}`,
    need: "请添加两份 PDF。",
    err: "出错了：",
    note: "按句子逐句对比抽取出的文字。排版和图片不在对比范围内。",
  },
  es: {
    title: "Comparar versiones",
    subtitle: "Sube un PDF original y uno revisado para ver exactamente qué cambió: el texto añadido se resalta y el texto eliminado se muestra tachado. Todo se procesa en tu navegador.",
    original: "Original (v1)", revised: "Revisado (v2)",
    choose: "Elegir PDF", reading: "Leyendo…", change: "Reemplazar",
    compare: "Comparar versiones", comparing: "Comparando…", reset: "Empezar de nuevo",
    added: "Añadido", removed: "Eliminado", unchanged: "No se encontraron cambios de texto.",
    summary: (a: number, d: number) => `${a} añadido · ${d} eliminado`,
    need: "Agrega ambos PDF para comparar.",
    err: "Algo salió mal: ",
    note: "Compara el texto extraído oración por oración. El formato y las imágenes no forman parte de la comparación.",
  },
  pt: {
    title: "Comparar versões",
    subtitle: "Envie um PDF original e um revisado para ver exatamente o que mudou — o texto adicionado é destacado e o texto removido é tachado. Tudo é processado no seu navegador.",
    original: "Original (v1)", revised: "Revisado (v2)",
    choose: "Escolher PDF", reading: "Lendo…", change: "Substituir",
    compare: "Comparar versões", comparing: "Comparando…", reset: "Recomeçar",
    added: "Adicionado", removed: "Removido", unchanged: "Nenhuma alteração textual encontrada.",
    summary: (a: number, d: number) => `${a} adicionado · ${d} removido`,
    need: "Adicione ambos os PDFs para comparar.",
    err: "Algo deu errado: ",
    note: "Compara o texto extraído frase por frase. Formatação e imagens não fazem parte da comparação.",
  },
  fr: {
    title: "Comparer les versions",
    subtitle: "Importez un PDF original et un PDF révisé pour voir exactement ce qui a changé — le texte ajouté est surligné, le texte supprimé est barré. Tout s'exécute dans votre navigateur.",
    original: "Original (v1)", revised: "Révisé (v2)",
    choose: "Choisir un PDF", reading: "Lecture…", change: "Remplacer",
    compare: "Comparer les versions", comparing: "Comparaison…", reset: "Recommencer",
    added: "Ajouté", removed: "Supprimé", unchanged: "Aucune modification textuelle détectée.",
    summary: (a: number, d: number) => `${a} ajouté · ${d} supprimé`,
    need: "Ajoutez les deux PDF pour comparer.",
    err: "Une erreur est survenue : ",
    note: "Compare le texte extrait phrase par phrase. La mise en forme et les images ne font pas partie de la comparaison.",
  },
  ja: {
    title: "バージョンを比較",
    subtitle: "元版と改訂版のPDFをアップロードすると、変更点が一目で分かります——追加されたテキストはハイライト、削除されたテキストは取り消し線。すべてブラウザ内で動作します。",
    original: "元版 (v1)", revised: "改訂版 (v2)",
    choose: "PDFを選択", reading: "読み取り中…", change: "差し替え",
    compare: "バージョンを比較", comparing: "比較中…", reset: "最初からやり直す",
    added: "追加", removed: "削除", unchanged: "テキストの変更は見つかりませんでした。",
    summary: (a: number, d: number) => `${a}件追加 · ${d}件削除`,
    need: "比較するには両方のPDFを追加してください。",
    err: "問題が発生しました: ",
    note: "抽出テキストを文単位で比較します。書式や画像は比較対象外です。",
  },
};

async function extractText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  let text = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((it) => ("str" in it ? it.str : "")).join(" ") + "\n";
  }
  try { doc.destroy(); } catch { /* ignore */ }
  return text;
}

// Split into sentence-ish units for a readable redline.
function toUnits(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?。！？;；\n])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 2500); // cap to keep the LCS bounded on very large documents
}

// Sentence-level LCS diff -> ordered ops.
function diff(a: string[], b: string[]): Op[] {
  const n = a.length, m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const ops: Op[] = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) { ops.push({ type: "eq", text: a[i] }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { ops.push({ type: "del", text: a[i] }); i++; }
    else { ops.push({ type: "ins", text: b[j] }); j++; }
  }
  while (i < n) ops.push({ type: "del", text: a[i++] });
  while (j < m) ops.push({ type: "ins", text: b[j++] });
  return ops;
}

export function RedlineClient({ locale = "en" }: { locale?: Locale }) {
  const t = locale === "zh-Hant" ? deepHant(STR.zh) : (STR[locale] ?? STR.en);
  const [a, setA] = useState<File | null>(null);
  const [b, setB] = useState<File | null>(null);
  const [phase, setPhase] = useState<"idle" | "comparing" | "done">("idle");
  const [ops, setOps] = useState<Op[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [draggingSlot, setDraggingSlot] = useState<"a" | "b" | null>(null);
  const aRef = useRef<HTMLInputElement>(null);
  const bRef = useRef<HTMLInputElement>(null);

  const compare = useCallback(async () => {
    if (!a || !b) { setError(t.need); return; }
    setPhase("comparing"); setError(null); setOps([]);
    try {
      const [ta, tb] = await Promise.all([extractText(a), extractText(b)]);
      const result = diff(toUnits(ta), toUnits(tb));
      setOps(result);
      setPhase("done");
    } catch (e) {
      setError(encryptedPdfMessage(e, locale) ?? (t.err + (e instanceof Error ? e.message : String(e))));
      setPhase("idle");
    }
  }, [a, b, t, locale]);

  const reset = () => { setA(null); setB(null); setOps([]); setPhase("idle"); setError(null); };

  const counts = { ins: ops.filter((o) => o.type === "ins").length, del: ops.filter((o) => o.type === "del").length };

  const slot = (file: File | null, set: (f: File | null) => void, ref: React.RefObject<HTMLInputElement | null>, label: string, slotKey: "a" | "b") => (
    <>
      <input ref={ref} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { set(f); setPhase("idle"); setError(null); } }} />
      <div
        onClick={() => ref.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDraggingSlot(slotKey); }}
      onDragLeave={(e) => { if (e.currentTarget === e.target) setDraggingSlot(null); }}
      onDrop={(e) => { e.preventDefault(); setDraggingSlot(null); const f = e.dataTransfer.files?.[0]; if (f) { set(f); setPhase("idle"); setError(null); } }}
      className={`${dropzoneVisual(draggingSlot === slotKey)} cursor-pointer p-5`}
    >
      <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{label}</p>
      {file ? (
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="truncate text-[13.5px] font-medium text-[color:var(--foreground)]" title={file.name}>{file.name}</span>
          <button type="button" onClick={(e) => { e.stopPropagation(); ref.current?.click(); }} className="shrink-0 text-[12.5px] font-medium text-[color:var(--muted)] hover:text-[color:var(--foreground)]">{t.change}</button>
        </div>
      ) : (
        <button type="button" onClick={(e) => { e.stopPropagation(); ref.current?.click(); }} className="mt-3 inline-flex h-10 items-center rounded-[var(--radius)] bg-[color:var(--accent)] px-5 text-[13.5px] font-semibold text-white transition hover:opacity-90">{t.choose}</button>
      )}
    </div>
    </>
  );

  return (
    <div className="mx-auto max-w-5xl px-5 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20">
      <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{t.title}</h1>
      <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.subtitle}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {slot(a, setA, aRef, t.original, "a")}
        {slot(b, setB, bRef, t.revised, "b")}
      </div>

      <div className="mt-5 flex items-center gap-2">
        <button type="button" onClick={compare} disabled={!a || !b || phase === "comparing"} className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-[color:var(--accent)] px-6 py-2.5 text-[14px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50">{phase === "comparing" ? (<><Spinner /> {t.comparing}</>) : t.compare}</button>
        {(a || b) && <button type="button" onClick={reset} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2.5 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">{t.reset}</button>}
      </div>

      {phase === "done" && (
        <div className="mt-6">
          <div className="mb-3 flex flex-wrap items-center gap-4 text-[12.5px]">
            <span className="font-semibold text-[color:var(--muted)]">{t.summary(counts.ins, counts.del)}</span>
            <span className="inline-flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-sm bg-[rgba(52,211,153,0.3)]" />{t.added}</span>
            <span className="inline-flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-sm bg-[rgba(248,113,113,0.3)]" />{t.removed}</span>
          </div>
          {counts.ins === 0 && counts.del === 0 ? (
            <p className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-4 text-[14px] text-[color:var(--muted)]">{t.unchanged}</p>
          ) : (
            <div className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5 text-[14px] leading-7">
              {ops.map((o, i) => (
                <span
                  key={i}
                  className={
                    o.type === "ins"
                      ? "rounded-sm bg-[rgba(52,211,153,0.18)] text-[color:var(--foreground)]"
                      : o.type === "del"
                        ? "rounded-sm bg-[rgba(248,113,113,0.16)] text-[#b91c1c] line-through"
                        : "text-[color:var(--muted)]"
                  }
                >
                  {o.text}{" "}
                </span>
              ))}
            </div>
          )}
          <p className="mt-3 text-[12px] text-[color:var(--faint)]">{t.note}</p>
        </div>
      )}

      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}
      <ToolFaq tool="redline" locale={locale} />
    </div>
  );
}
