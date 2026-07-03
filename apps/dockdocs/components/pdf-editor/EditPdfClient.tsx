"use client";

// /edit-pdf — Phase A1 overlay editor (skeleton: text elements).
// Everything runs in the browser; the file never leaves the device — that is
// the positioning axis (every competitor uploads). Non-destructive: the bake
// draws on top of the original document.

import { trackToolRun } from "@/lib/track";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { encryptedPdfMessage } from "@/lib/pdf-errors";
import { UploadDropzone } from "@/components/UploadDropzone";
import { deepHant } from "@/lib/zh-hant";
import type { RouteLocale, AuthoredCopy, AuthoredLocale } from "@/lib/i18n";
import { LAYOUT } from "@/lib/layout-constants";
import type { PageInfo, TextElement } from "./editor-types";
import { editorReducer, initialEditorState, nextZ } from "./editor-store";
import {
  DEFAULT_SIZE_PT,
  DEFAULT_TEXT_COLOR,
  sizeTextElement,
} from "./editor-geometry";
import { bakePdf } from "./bake-engine";
import { PageCanvas } from "./PageCanvas";

type Locale = RouteLocale;

const STR_EN = {
  title: "Edit PDF",
  subtitle:
    "Add text anywhere on a PDF — drag it into place, resize it, and download the result. Runs in your browser; your file never leaves your device.",
  drop: "Drag & drop a PDF here, or click to choose",
  choose: "Choose PDF",
  rendering: "Rendering pages…",
  addText: "Add text",
  hint: "Double-click a page to add text. Drag to move, pull a handle to resize, double-click a box to edit.",
  placeholder: "Type here…",
  elements: (n: number) => `${n} element${n === 1 ? "" : "s"}`,
  undo: "Undo",
  redo: "Redo",
  download: "Download PDF",
  working: "Preparing PDF…",
  reset: "Start over",
  err: "Something went wrong: ",
  page: (n: number) => `Page ${n}`,
};

const STR = {
  en: STR_EN,
  zh: {
    title: "编辑 PDF",
    subtitle: "在 PDF 任意位置添加文字——拖到合适的位置、调整大小,然后下载成品。全程在浏览器完成,文件不离开你的设备。",
    drop: "把 PDF 拖到这里,或点击选择",
    choose: "选择 PDF",
    rendering: "正在渲染页面…",
    addText: "添加文字",
    hint: "双击页面即可添加文字。拖动移动位置,拉动句柄调整大小,双击文本框编辑内容。",
    placeholder: "输入文字…",
    elements: (n: number) => `${n} 个元素`,
    undo: "撤销",
    redo: "重做",
    download: "下载 PDF",
    working: "正在生成 PDF…",
    reset: "重新开始",
    err: "出错了:",
    page: (n: number) => `第 ${n} 页`,
  },
  es: {
    title: "Editar PDF",
    subtitle: "Añade texto en cualquier parte de un PDF: arrástralo a su sitio, cambia su tamaño y descarga el resultado. Se ejecuta en tu navegador; tu archivo nunca sale de tu dispositivo.",
    drop: "Arrastra y suelta un PDF aquí, o haz clic para elegir",
    choose: "Elegir PDF",
    rendering: "Procesando páginas…",
    addText: "Añadir texto",
    hint: "Haz doble clic en una página para añadir texto. Arrastra para mover, tira de un tirador para cambiar el tamaño y haz doble clic en un cuadro para editarlo.",
    placeholder: "Escribe aquí…",
    elements: (n: number) => `${n} elemento${n === 1 ? "" : "s"}`,
    undo: "Deshacer",
    redo: "Rehacer",
    download: "Descargar PDF",
    working: "Generando el PDF…",
    reset: "Empezar de nuevo",
    err: "Algo salió mal: ",
    page: (n: number) => `Página ${n}`,
  },
  pt: {
    title: "Editar PDF",
    subtitle: "Adicione texto em qualquer lugar de um PDF — arraste para a posição certa, redimensione e baixe o resultado. Executado no seu navegador; seu arquivo nunca sai do seu dispositivo.",
    drop: "Arraste e solte um PDF aqui, ou clique para escolher",
    choose: "Escolher PDF",
    rendering: "Processando páginas…",
    addText: "Adicionar texto",
    hint: "Clique duas vezes em uma página para adicionar texto. Arraste para mover, puxe uma alça para redimensionar e clique duas vezes em uma caixa para editar.",
    placeholder: "Digite aqui…",
    elements: (n: number) => `${n} elemento${n === 1 ? "" : "s"}`,
    undo: "Desfazer",
    redo: "Refazer",
    download: "Baixar PDF",
    working: "Gerando o PDF…",
    reset: "Recomeçar",
    err: "Algo deu errado: ",
    page: (n: number) => `Página ${n}`,
  },
  fr: {
    title: "Modifier un PDF",
    subtitle: "Ajoutez du texte n'importe où dans un PDF — faites-le glisser, redimensionnez-le, puis téléchargez le résultat. Fonctionne dans votre navigateur ; votre fichier ne quitte jamais votre appareil.",
    drop: "Glissez-déposez un PDF ici, ou cliquez pour choisir",
    choose: "Choisir un PDF",
    rendering: "Rendu des pages en cours…",
    addText: "Ajouter du texte",
    hint: "Double-cliquez sur une page pour ajouter du texte. Faites glisser pour déplacer, tirez une poignée pour redimensionner, double-cliquez sur un bloc pour le modifier.",
    placeholder: "Saisissez votre texte…",
    elements: (n: number) => `${n} élément${n === 1 ? "" : "s"}`,
    undo: "Annuler",
    redo: "Rétablir",
    download: "Télécharger le PDF",
    working: "Génération du PDF…",
    reset: "Recommencer",
    err: "Une erreur est survenue : ",
    page: (n: number) => `Page ${n}`,
  },
  ja: {
    title: "PDFを編集",
    subtitle: "PDFの好きな場所にテキストを追加——ドラッグで配置、サイズを調整して、結果をダウンロード。ブラウザ内で動作し、ファイルがデバイスから出ることはありません。",
    drop: "ここにPDFをドラッグ＆ドロップ、またはクリックして選択",
    choose: "PDFを選択",
    rendering: "ページを描画中…",
    addText: "テキストを追加",
    hint: "ページをダブルクリックしてテキストを追加。ドラッグで移動、ハンドルでサイズ変更、ボックスをダブルクリックで編集できます。",
    placeholder: "ここに入力…",
    elements: (n: number) => `${n}個の要素`,
    undo: "元に戻す",
    redo: "やり直す",
    download: "PDFをダウンロード",
    working: "PDFを生成中…",
    reset: "最初からやり直す",
    err: "問題が発生しました: ",
    page: (n: number) => `${n}ページ`,
  },
  de: {
    title: "PDF bearbeiten",
    subtitle: "Fügen Sie an beliebiger Stelle eines PDFs Text hinzu – ziehen Sie ihn an die richtige Position, ändern Sie die Größe und laden Sie das Ergebnis herunter. Läuft in Ihrem Browser; Ihre Datei verlässt Ihr Gerät nicht.",
    drop: "PDF hierher ziehen und ablegen oder zum Auswählen klicken",
    choose: "PDF auswählen",
    rendering: "Seiten werden gerendert…",
    addText: "Text hinzufügen",
    hint: "Doppelklicken Sie auf eine Seite, um Text hinzuzufügen. Ziehen zum Verschieben, an einem Griff ziehen zum Skalieren, Doppelklick auf ein Feld zum Bearbeiten.",
    placeholder: "Hier tippen…",
    elements: (n: number) => `${n} Element${n === 1 ? "" : "e"}`,
    undo: "Rückgängig",
    redo: "Wiederholen",
    download: "PDF herunterladen",
    working: "PDF wird erstellt…",
    reset: "Neu beginnen",
    err: "Etwas ist schiefgelaufen: ",
    page: (n: number) => `Seite ${n}`,
  },
  ko: {
    title: "PDF 편집",
    subtitle: "PDF 어디에나 텍스트를 추가하세요 — 원하는 위치로 드래그하고 크기를 조절한 뒤 결과를 다운로드하세요. 브라우저에서 실행되며, 파일은 기기를 벗어나지 않습니다.",
    drop: "여기에 PDF를 끌어다 놓거나 클릭해서 선택하세요",
    choose: "PDF 선택",
    rendering: "페이지를 렌더링하는 중…",
    addText: "텍스트 추가",
    hint: "페이지를 더블클릭해 텍스트를 추가하세요. 드래그로 이동, 핸들로 크기 조절, 상자를 더블클릭하면 편집할 수 있습니다.",
    placeholder: "여기에 입력…",
    elements: (n: number) => `요소 ${n}개`,
    undo: "실행 취소",
    redo: "다시 실행",
    download: "PDF 다운로드",
    working: "PDF 생성 중…",
    reset: "다시 시작",
    err: "문제가 발생했습니다: ",
    page: (n: number) => `${n}페이지`,
  },
} satisfies AuthoredCopy<typeof STR_EN>;

export function EditPdfClient({ locale = "en", embedded = false }: { locale?: Locale; embedded?: boolean }) {
  const al: AuthoredLocale = locale === "zh-Hant" ? "en" : locale;
  const t = locale === "zh-Hant" ? deepHant(STR.zh) : STR[al];

  const [phase, setPhase] = useState<"idle" | "rendering" | "ready" | "working">("idle");
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [state, dispatch] = useReducer(editorReducer, initialEditorState);

  const fileRef = useRef<File | null>(null);
  // pdf.js document proxy, kept alive for lazy page rasters until reset.
  const docRef = useRef<{ getPage: (n: number) => Promise<unknown>; destroy: () => Promise<void> } | null>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const visiblePages = useRef<Set<number>>(new Set());
  // Serialize page rasters — parallel render() calls on one doc balloon memory.
  const renderChain = useRef<Promise<unknown>>(Promise.resolve());

  const reset = useCallback(() => {
    docRef.current?.destroy().catch(() => {});
    docRef.current = null;
    fileRef.current = null;
    visiblePages.current.clear();
    setPages([]);
    setError(null);
    setPhase("idle");
    dispatch({ type: "reset" });
  }, []);

  useEffect(() => () => { docRef.current?.destroy().catch(() => {}); }, []);

  // Unsaved-work guard (A1 persistence decision: warn on close, no autosave).
  useEffect(() => {
    if (state.elements.length === 0) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [state.elements.length > 0]);

  const onFile = useCallback(async (file: File) => {
    if (!file || (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"))) return;
    setError(null);
    fileRef.current = file;
    setPhase("rendering");
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
      const infos: PageInfo[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const vp = page.getViewport({ scale: 1 });
        infos.push({ index: i - 1, wPt: vp.width, hPt: vp.height, ratio: vp.height / vp.width });
      }
      docRef.current = doc as unknown as typeof docRef.current;
      setPages(infos);
      setPhase("ready");
    } catch (e) {
      setError(encryptedPdfMessage(e, locale) ?? (t.err + (e instanceof Error ? e.message : String(e))));
      setPhase("idle");
    }
  }, [t, locale]);

  // Lazy per-page raster at the frame's real width (no display-scale constant).
  const renderBitmap = useCallback((pageIndex: number): Promise<string | null> => {
    const job = renderChain.current.then(async () => {
      const doc = docRef.current;
      if (!doc) return null;
      const page = (await doc.getPage(pageIndex + 1)) as {
        getViewport: (o: { scale: number }) => { width: number; height: number };
        render: (o: unknown) => { promise: Promise<void> };
      };
      const base = page.getViewport({ scale: 1 });
      const containerW = viewerRef.current?.clientWidth ?? 800;
      const scale = Math.min(3, Math.max(1, (containerW * (window.devicePixelRatio || 1)) / base.width));
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      await page.render({ canvas, canvasContext: ctx, viewport }).promise;
      const url = canvas.toDataURL("image/jpeg", 0.85);
      canvas.width = 0;
      canvas.height = 0;
      return url;
    }).catch(() => null);
    renderChain.current = job;
    return job;
  }, []);

  const onVisibility = useCallback((pageIndex: number, visible: boolean) => {
    if (visible) visiblePages.current.add(pageIndex);
    else visiblePages.current.delete(pageIndex);
  }, []);

  const addText = useCallback((pageIndex: number, cx?: number, cy?: number) => {
    const page = pages[pageIndex];
    if (!page) return;
    const seed = { text: "", sizePt: DEFAULT_SIZE_PT, bold: false };
    const { w, h } = sizeTextElement(seed, page);
    const el: TextElement = {
      id: crypto.randomUUID(),
      type: "text",
      page: pageIndex,
      x: Math.min(Math.max((cx ?? 0.5) - w / 2, 0), Math.max(0, 1 - w)),
      y: Math.min(Math.max((cy ?? 0.4) - h / 2, 0), Math.max(0, 1 - h)),
      w,
      h,
      rotation: 0,
      z: nextZ(state.elements),
      text: "",
      sizePt: DEFAULT_SIZE_PT,
      color: DEFAULT_TEXT_COLOR,
      bold: false,
    };
    dispatch({ type: "add", el });
    dispatch({ type: "edit", id: el.id });
  }, [pages, state.elements]);

  // Toolbar "Add text" targets the topmost visible page.
  const addTextToVisible = useCallback(() => {
    const target = visiblePages.current.size
      ? Math.min(...visiblePages.current)
      : 0;
    addText(target);
  }, [addText]);

  // Keyboard: delete / nudge / undo / redo (skipped while typing in the box).
  const stateRef = useRef(state);
  stateRef.current = state;
  const pagesRef = useRef(pages);
  pagesRef.current = pages;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = stateRef.current;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "TEXTAREA" || tag === "INPUT" || s.editingId) return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "z" && !e.shiftKey) { e.preventDefault(); dispatch({ type: "undo" }); return; }
      if ((mod && e.key.toLowerCase() === "y") || (mod && e.shiftKey && e.key.toLowerCase() === "z")) { e.preventDefault(); dispatch({ type: "redo" }); return; }
      if (!s.selectedId) return;
      const sel = s.elements.find((el) => el.id === s.selectedId);
      if (!sel) return;
      if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); dispatch({ type: "remove", id: sel.id }); return; }
      if (e.key === "Escape") { dispatch({ type: "select", id: null }); return; }
      const page = pagesRef.current[sel.page];
      if (!page || !e.key.startsWith("Arrow")) return;
      e.preventDefault();
      const stepPt = e.shiftKey ? 10 : 1;
      const dx = e.key === "ArrowLeft" ? -stepPt / page.wPt : e.key === "ArrowRight" ? stepPt / page.wPt : 0;
      const dy = e.key === "ArrowUp" ? -stepPt / page.hPt : e.key === "ArrowDown" ? stepPt / page.hPt : 0;
      dispatch({ type: "snapshot" });
      dispatch({
        type: "update",
        id: sel.id,
        transient: true,
        patch: {
          x: Math.min(Math.max(sel.x + dx, 0), Math.max(0, 1 - sel.w)),
          y: Math.min(Math.max(sel.y + dy, 0), Math.max(0, 1 - sel.h)),
        },
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const download = useCallback(async () => {
    const file = fileRef.current;
    if (!file || state.elements.length === 0) return;
    setPhase("working");
    setError(null);
    try {
      const bytes = await bakePdf(await file.arrayBuffer(), pages, state.elements);
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = (file.name.replace(/\.pdf$/i, "") || "document") + "-edited.pdf";
      a.click();
      URL.revokeObjectURL(url);
      trackToolRun("edit-pdf");
      setPhase("ready");
    } catch (e) {
      setError(encryptedPdfMessage(e, locale) ?? (t.err + (e instanceof Error ? e.message : String(e))));
      setPhase("ready");
    }
  }, [pages, state.elements, t, locale]);

  const iconBtn =
    "flex h-8 w-8 items-center justify-center rounded-[var(--radius)] border border-[color:var(--line)] text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)] disabled:opacity-35 disabled:hover:border-[color:var(--line)]";

  return (
    <div className={embedded ? "mx-auto w-full max-w-3xl px-8 pb-10 pt-4" : `mx-auto ${LAYOUT.content} px-5 pb-16 sm:px-6 sm:pb-20 pt-12 sm:pt-16`}>
      {!embedded && <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{t.title}</h1>}
      <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.subtitle}</p>

      {phase === "idle" || phase === "rendering" ? (
        <UploadDropzone locale={locale} buttonLabel={t.choose} busy={phase === "rendering"} busyLabel={t.rendering} onFile={onFile} constrained={embedded} valueZone="client" />
      ) : (
        <>
          {/* Toolbar — sticky so it stays reachable while scrolling long docs */}
          <div className="sticky top-2 z-30 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-[color:var(--line)] bg-[color:var(--surface-raised)] px-4 py-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="min-w-0 truncate text-[15px] font-semibold text-[color:var(--foreground)]">{fileRef.current?.name ?? ""}</p>
                <button type="button" aria-label={t.reset} onClick={reset}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[color:var(--surface)] text-[color:var(--muted)] opacity-80 transition hover:opacity-100 hover:text-[color:var(--error)]">
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                    <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <p className="mt-0.5 text-[12px] text-[color:var(--muted)]">
                <span className="font-medium text-[color:var(--accent)]">{t.elements(state.elements.length)}</span>
                {fileRef.current && <> · {pages.length}p · {(fileRef.current.size / 1024 / 1024).toFixed(2)} MB</>}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button type="button" aria-label={t.undo} title={t.undo} onClick={() => dispatch({ type: "undo" })} disabled={state.past.length === 0} className={iconBtn}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M6 3L2.5 6.5 6 10M3 6.5h7a3.5 3.5 0 010 7H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button type="button" aria-label={t.redo} title={t.redo} onClick={() => dispatch({ type: "redo" })} disabled={state.future.length === 0} className={iconBtn}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M10 3l3.5 3.5L10 10M13 6.5H6a3.5 3.5 0 000 7h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button type="button" onClick={addTextToVisible}
                className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">
                {t.addText}
              </button>
              <button type="button" onClick={download} disabled={phase === "working" || state.elements.length === 0}
                className="rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
                {phase === "working" ? t.working : t.download}
              </button>
            </div>
          </div>
          <p className="mt-2 text-[12px] text-[color:var(--faint)]">{t.hint}</p>

          <div ref={viewerRef} className="mx-auto mt-5 w-full max-w-3xl space-y-4">
            {pages.map((pg) => (
              <PageCanvas
                key={pg.index}
                page={pg}
                elements={state.elements.filter((el) => el.page === pg.index)}
                selectedId={state.selectedId}
                editingId={state.editingId}
                dispatch={dispatch}
                renderBitmap={renderBitmap}
                onVisibility={onVisibility}
                onAddTextAt={addText}
                pageLabel={t.page(pg.index + 1)}
                editPlaceholder={t.placeholder}
              />
            ))}
          </div>
        </>
      )}

      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}
    </div>
  );
}
