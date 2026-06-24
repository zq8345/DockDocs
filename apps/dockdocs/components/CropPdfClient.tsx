"use client";

import { trackToolRun } from "@/lib/track";
import { useCallback, useRef, useState } from "react";
import { UploadDropzone } from "@/components/UploadDropzone";
import { ToolFaq } from "@/components/ToolFaq";
import { ToolSections, type ToolSectionsContent } from "@/components/ToolSections";
import { encryptedPdfMessage } from "@/lib/pdf-errors";
import { deepHant } from "@/lib/zh-hant";
import type { RouteLocale } from "@/lib/i18n";

type Locale = RouteLocale;
// Locales that need their own authored copy; zh-Hant is machine-derived (deepHant)
// so it is excluded — adding a route locale (e.g. "de") to routeLocales makes the
// AuthoredCopy tables below a tsc error until the new locale's copy is added.
type AuthoredLocale = Exclude<RouteLocale, "zh-Hant">;
type Edges = { top: number; right: number; bottom: number; left: number };

const _en = {
  title: "Crop PDF",
  subtitle: "Upload a PDF, trim the whitespace from any edge with a live preview, and download — every page is cropped the same way, all in your browser.",
  drop: "Drag & drop a PDF here, or click to choose",
  choose: "Choose PDF", rendering: "Rendering preview…",
  preview: "Live preview", top: "Top", right: "Right", bottom: "Bottom", left: "Left",
  reset: "Reset edges", apply: "Crop & download", working: "Cropping…", start: "Start over",
  hint: "Drag the sliders to trim each edge (as a % of the page). The clear area is what you keep.",
  err: "Something went wrong: ",
};

const STR = {
  en: _en,
  zh: {
    title: "PDF 裁剪",
    subtitle: "上传 PDF，用实时预览裁掉任意一边的空白，然后下载——每页按同样方式裁剪，全部在浏览器中完成。",
    drop: "把 PDF 拖到这里，或点击选择",
    choose: "选择 PDF", rendering: "正在渲染预览…",
    preview: "实时预览", top: "上", right: "右", bottom: "下", left: "左",
    reset: "重置边距", apply: "裁剪并下载", working: "正在裁剪…", start: "重新开始",
    hint: "拖动滑块裁掉每一边(占页面的百分比)。透明区域是保留的部分。",
    err: "出错了：",
  },
  es: {
    title: "Recortar PDF",
    subtitle: "Sube un PDF, recorta el espacio en blanco de cualquier borde con una vista previa en vivo y descárgalo: todas las páginas se recortan igual, todo en tu navegador.",
    drop: "Arrastra y suelta un PDF aquí, o haz clic para elegir",
    choose: "Elegir PDF", rendering: "Generando vista previa…",
    preview: "Vista previa en vivo", top: "Arriba", right: "Derecha", bottom: "Abajo", left: "Izquierda",
    reset: "Restablecer bordes", apply: "Recortar y descargar", working: "Recortando…", start: "Empezar de nuevo",
    hint: "Arrastra los controles para recortar cada borde (como % de la página). El área despejada es lo que conservas.",
    err: "Algo salió mal: ",
  },
  pt: {
    title: "Recortar PDF",
    subtitle: "Envie um PDF, recorte o espaço em branco de qualquer borda com uma prévia ao vivo e baixe: todas as páginas são recortadas da mesma forma, tudo no seu navegador.",
    drop: "Arraste e solte um PDF aqui, ou clique para escolher",
    choose: "Escolher PDF", rendering: "Gerando prévia…",
    preview: "Prévia ao vivo", top: "Acima", right: "Direita", bottom: "Abaixo", left: "Esquerda",
    reset: "Redefinir bordas", apply: "Recortar e baixar", working: "Recortando…", start: "Recomeçar",
    hint: "Arraste os controles para recortar cada borda (como % da página). A área visível é o que você mantém.",
    err: "Algo deu errado: ",
  },
  fr: {
    title: "Rogner un PDF",
    subtitle: "Importez un PDF, rognez les marges de chaque bord grâce à un aperçu en direct, puis téléchargez — toutes les pages sont rognées de la même façon, entièrement dans votre navigateur.",
    drop: "Faites glisser un PDF ici, ou cliquez pour choisir",
    choose: "Choisir un PDF", rendering: "Génération de l'aperçu…",
    preview: "Aperçu en direct", top: "Haut", right: "Droite", bottom: "Bas", left: "Gauche",
    reset: "Réinitialiser les bords", apply: "Rogner et télécharger", working: "Rognage en cours…", start: "Recommencer",
    hint: "Faites glisser les curseurs pour rogner chaque bord (en % de la page). La zone claire est la partie conservée.",
    err: "Une erreur est survenue : ",
  },
  ja: {
    title: "PDFをトリミング",
    subtitle: "PDFをアップロードし、ライブプレビューで任意の辺の余白を切り取ってダウンロード——すべてのページが同じようにトリミングされ、すべてブラウザ内で完結します。",
    drop: "ここにPDFをドラッグ＆ドロップ、またはクリックして選択",
    choose: "PDFを選択", rendering: "プレビューを描画中…",
    preview: "ライブプレビュー", top: "上", right: "右", bottom: "下", left: "左",
    reset: "余白をリセット", apply: "トリミングしてダウンロード", working: "トリミング中…", start: "最初からやり直す",
    hint: "スライダーをドラッグして各辺を切り取ります（ページに対する%）。透明な部分が残る範囲です。",
    err: "問題が発生しました: ",
  },
  de: {
    title: "PDF zuschneiden",
    subtitle: "Laden Sie ein PDF hoch, schneiden Sie mit einer Live-Vorschau die Weißräume an jeder beliebigen Kante weg und laden Sie es herunter – jede Seite wird gleich zugeschnitten, komplett in Ihrem Browser.",
    drop: "PDF hierher ziehen und ablegen oder zum Auswählen klicken",
    choose: "PDF auswählen", rendering: "Vorschau wird erstellt…",
    preview: "Live-Vorschau", top: "Oben", right: "Rechts", bottom: "Unten", left: "Links",
    reset: "Kanten zurücksetzen", apply: "Zuschneiden und herunterladen", working: "Wird zugeschnitten…", start: "Neu beginnen",
    hint: "Ziehen Sie die Regler, um jede Kante zu beschneiden (als % der Seite). Der freie Bereich ist das, was erhalten bleibt.",
    err: "Etwas ist schiefgelaufen: ",
  },
} satisfies Record<AuthoredLocale, typeof _en>;

const SECTIONS: Record<AuthoredLocale, ToolSectionsContent> = {
  en: {
    benefitsTitle: "Why crop PDFs in your browser",
    benefitsDescription: "Trim margins and whitespace to tighten every page, with a live preview before you commit.",
    benefits: [
      { title: "See the crop before you apply it", description: "Drag each edge against a live page preview, so you know exactly what stays and what gets trimmed — no guesswork, no reopening the file." },
      { title: "Cut margins, keep your content", description: "Slice off scanner whitespace or wide print margins so the text and figures fill the page and read better on screens." },
      { title: "One crop across every page", description: "The edges you set are applied uniformly to all pages, giving you a consistent, evenly framed document in a single pass." },
    ],
    workflowTitle: "Where cropping fits your document work",
    workflowDescription: "For the moment a PDF arrives with too much empty border — a scan, an exported slide, a page meant for print you now read on screen.",
    steps: [
      "Upload the PDF you want to tidy up.",
      "Drag the top, right, bottom, and left edges in the live preview until only the content you want remains.",
      "Crop and download the trimmed PDF.",
    ],
    readingTitle: "More ways to reshape PDFs",
    readingDescription: "Related tools and guides for trimming and reorganizing documents.",
    readingLinks: [
      { label: "Split a PDF", href: "/split-pdf", description: "Pull a large PDF apart into separate files or page ranges." },
      { label: "PDF workflow resources", href: "/resources", description: "A structured hub for PDF tools, OCR, conversion, and AI document paths." },
    ],
  },
  zh: {
    benefitsTitle: "为什么在浏览器里裁剪 PDF",
    benefitsDescription: "裁掉页边空白，让每一页更紧凑，下手前先用实时预览看清效果。",
    benefits: [
      { title: "裁之前先看到效果", description: "对着实时页面预览拖动每一条边，清楚知道哪部分保留、哪部分被裁掉——不用猜，也不用反复打开文件。" },
      { title: "去掉页边，保住内容", description: "裁掉扫描留下的空白或过宽的打印页边，让文字和图表填满版面，在屏幕上更易读。" },
      { title: "一次裁剪应用到每一页", description: "你设定的边距会统一应用到所有页面，一次操作就得到边框一致、版式整齐的文档。" },
    ],
    workflowTitle: "裁剪如何融入你的文档工作",
    workflowDescription: "当一份 PDF 边框留白太多时——一张扫描件、一页导出的幻灯片，或一份本为打印、如今在屏幕上看的页面。",
    steps: [
      "上传你想整理的 PDF。",
      "在实时预览中拖动上、右、下、左四条边，直到只剩你想要的内容。",
      "裁剪并下载裁好后的 PDF。",
    ],
    readingTitle: "更多重塑 PDF 的方式",
    readingDescription: "裁剪与整理文档的相关工具和指南。",
    readingLinks: [
      { label: "拆分 PDF", href: "/split-pdf", description: "把一个大 PDF 拆成多个文件或页面范围。" },
      { label: "PDF 工作流资源", href: "/resources", description: "按工作流整理 PDF 工具、OCR、转换和 AI 文档路径。" },
    ],
  },
  es: {
    benefitsTitle: "Por qué recortar PDF en tu navegador",
    benefitsDescription: "Recorta márgenes y espacios en blanco para ajustar cada página, con una vista previa en vivo antes de confirmar.",
    benefits: [
      { title: "Ve el recorte antes de aplicarlo", description: "Arrastra cada borde sobre una vista previa en vivo y sabrás con exactitud qué se conserva y qué se recorta, sin adivinar ni volver a abrir el archivo." },
      { title: "Quita márgenes, conserva tu contenido", description: "Elimina el blanco del escaneo o los márgenes de impresión amplios para que el texto y las figuras llenen la página y se lean mejor en pantalla." },
      { title: "Un recorte para todas las páginas", description: "Los bordes que defines se aplican por igual a todas las páginas, para un documento uniforme y bien encuadrado en un solo paso." },
    ],
    workflowTitle: "Dónde encaja el recorte en tu trabajo",
    workflowDescription: "Para cuando un PDF llega con demasiado borde vacío: un escaneo, una diapositiva exportada o una página pensada para imprimir que ahora lees en pantalla.",
    steps: [
      "Sube el PDF que quieres ordenar.",
      "Arrastra los bordes superior, derecho, inferior e izquierdo en la vista previa hasta dejar solo el contenido que quieres.",
      "Recorta y descarga el PDF ajustado.",
    ],
    readingTitle: "Más formas de remodelar PDF",
    readingDescription: "Herramientas y guías relacionadas para recortar y reorganizar documentos.",
    readingLinks: [
      { label: "Dividir un PDF", href: "/split-pdf", description: "Separa un PDF grande en archivos o rangos de páginas." },
      { label: "Recursos de flujos de trabajo PDF", href: "/resources", description: "Un centro estructurado de herramientas PDF, OCR, conversión y rutas de documentos con IA." },
    ],
  },
  pt: {
    benefitsTitle: "Por que recortar PDF no seu navegador",
    benefitsDescription: "Apare margens e espaços em branco para ajustar cada página, com uma prévia ao vivo antes de confirmar.",
    benefits: [
      { title: "Veja o recorte antes de aplicar", description: "Arraste cada borda sobre uma prévia ao vivo e saiba exatamente o que fica e o que é aparado, sem adivinhar nem reabrir o arquivo." },
      { title: "Tire as margens, mantenha o conteúdo", description: "Remova o branco da digitalização ou as margens de impressão largas para que o texto e as figuras preencham a página e fiquem mais legíveis na tela." },
      { title: "Um recorte em todas as páginas", description: "As bordas que você define são aplicadas igualmente a todas as páginas, gerando um documento uniforme e bem enquadrado em uma única passada." },
    ],
    workflowTitle: "Onde o recorte se encaixa no seu trabalho",
    workflowDescription: "Para quando um PDF chega com borda vazia demais: uma digitalização, um slide exportado ou uma página feita para imprimir que agora você lê na tela.",
    steps: [
      "Envie o PDF que deseja organizar.",
      "Arraste as bordas superior, direita, inferior e esquerda na prévia até restar só o conteúdo que você quer.",
      "Recorte e baixe o PDF ajustado.",
    ],
    readingTitle: "Mais formas de remodelar PDF",
    readingDescription: "Ferramentas e guias relacionados para recortar e reorganizar documentos.",
    readingLinks: [
      { label: "Dividir um PDF", href: "/split-pdf", description: "Separe um PDF grande em arquivos ou intervalos de páginas." },
      { label: "Recursos de fluxos de trabalho PDF", href: "/resources", description: "Um hub estruturado de ferramentas PDF, OCR, conversão e fluxos de documentos com IA." },
    ],
  },
  fr: {
    benefitsTitle: "Pourquoi rogner des PDF dans votre navigateur",
    benefitsDescription: "Rognez marges et blancs pour resserrer chaque page, avec un aperçu en direct avant de valider.",
    benefits: [
      { title: "Voyez le rognage avant de l'appliquer", description: "Faites glisser chaque bord sur un aperçu en direct : vous savez exactement ce qui reste et ce qui est rogné, sans deviner ni rouvrir le fichier." },
      { title: "Coupez les marges, gardez le contenu", description: "Supprimez le blanc de numérisation ou les larges marges d'impression pour que texte et figures remplissent la page et se lisent mieux à l'écran." },
      { title: "Un seul rognage sur toutes les pages", description: "Les bords que vous définissez s'appliquent uniformément à toutes les pages, pour un document cohérent et bien cadré en une seule passe." },
    ],
    workflowTitle: "Où le rognage s'intègre à votre travail",
    workflowDescription: "Pour le moment où un PDF arrive avec trop de bordure vide : un scan, une diapositive exportée ou une page prévue pour l'impression que vous lisez désormais à l'écran.",
    steps: [
      "Importez le PDF à remettre en forme.",
      "Faites glisser les bords haut, droit, bas et gauche dans l'aperçu jusqu'à ne garder que le contenu voulu.",
      "Rognez et téléchargez le PDF ajusté.",
    ],
    readingTitle: "Plus de façons de remodeler les PDF",
    readingDescription: "Outils et guides associés pour rogner et réorganiser des documents.",
    readingLinks: [
      { label: "Diviser un PDF", href: "/split-pdf", description: "Séparez un grand PDF en fichiers ou plages de pages." },
      { label: "Ressources de flux de travail PDF", href: "/resources", description: "Un hub structuré d'outils PDF, d'OCR, de conversion et de parcours documentaires IA." },
    ],
  },
  ja: {
    benefitsTitle: "ブラウザで PDF をトリミングする理由",
    benefitsDescription: "余白を切り取って各ページを引き締めます。確定する前にライブプレビューで確認できます。",
    benefits: [
      { title: "適用する前に仕上がりを確認", description: "ライブのページプレビュー上で各辺をドラッグするので、残す部分と切り取る部分が正確にわかります。勘に頼らず、ファイルを開き直す必要もありません。" },
      { title: "余白を切り、中身は残す", description: "スキャンの白地や広すぎる印刷余白を取り除き、文字や図がページいっぱいに収まって画面で読みやすくなります。" },
      { title: "全ページに同じトリミング", description: "設定した辺はすべてのページに均一に適用され、一度の操作で枠の揃った整った文書になります。" },
    ],
    workflowTitle: "トリミングが文書作業にどう役立つか",
    workflowDescription: "PDF の余白が多すぎるとき——スキャン、書き出したスライド、印刷用だったページを今は画面で読む場合に。",
    steps: [
      "整えたい PDF をアップロードします。",
      "ライブプレビューで上・右・下・左の辺をドラッグし、残したい内容だけにします。",
      "トリミングして、整えた PDF をダウンロードします。",
    ],
    readingTitle: "PDF を整える他の方法",
    readingDescription: "文書のトリミングと再整理に関する関連ツールとガイド。",
    readingLinks: [
      { label: "PDF を分割", href: "/split-pdf", description: "大きな PDF を別々のファイルやページ範囲に分けます。" },
      { label: "PDF ワークフローのリソース", href: "/resources", description: "PDF ツール、OCR、変換、AI ドキュメントの導線を整理したハブ。" },
    ],
  },
  de: {
    benefitsTitle: "Warum PDFs im Browser zuschneiden",
    benefitsDescription: "Beschneiden Sie Ränder und Weißräume, um jede Seite zu straffen – mit einer Live-Vorschau, bevor Sie es übernehmen.",
    benefits: [
      { title: "Den Zuschnitt sehen, bevor Sie ihn anwenden", description: "Ziehen Sie jede Kante an einer Live-Seitenvorschau, damit Sie genau wissen, was bleibt und was weggeschnitten wird – kein Rätselraten, kein erneutes Öffnen der Datei." },
      { title: "Ränder kappen, Inhalt behalten", description: "Schneiden Sie Scan-Weißräume oder breite Druckränder ab, damit Text und Abbildungen die Seite ausfüllen und auf Bildschirmen besser lesbar sind." },
      { title: "Ein Zuschnitt für jede Seite", description: "Die von Ihnen gesetzten Kanten werden einheitlich auf alle Seiten angewendet und ergeben in einem einzigen Durchgang ein durchgängig gleichmäßig gerahmtes Dokument." },
    ],
    workflowTitle: "Wo das Zuschneiden in Ihre Dokumentarbeit passt",
    workflowDescription: "Gemacht für den Moment, in dem ein PDF mit zu viel leerem Rand ankommt – ein Scan, eine exportierte Folie oder eine für den Druck gedachte Seite, die Sie nun am Bildschirm lesen.",
    steps: [
      "Laden Sie das PDF hoch, das Sie aufräumen möchten.",
      "Ziehen Sie in der Live-Vorschau die obere, rechte, untere und linke Kante, bis nur noch der gewünschte Inhalt übrig bleibt.",
      "Schneiden Sie zu und laden Sie das beschnittene PDF herunter.",
    ],
    readingTitle: "Weitere Möglichkeiten, PDFs umzuformen",
    readingDescription: "Verwandte Tools und Anleitungen zum Beschneiden und Neuordnen von Dokumenten.",
    readingLinks: [
      { label: "PDF teilen", href: "/split-pdf", description: "Zerlegen Sie ein großes PDF in einzelne Dateien oder Seitenbereiche." },
      { label: "Ressourcen für PDF-Workflows", href: "/resources", description: "Ein strukturierter Hub für PDF-Tools, OCR, Konvertierung und KI-Dokumentenpfade." },
    ],
  },
};

export function CropPdfClient({ locale = "en" }: { locale?: Locale }) {
  const t = locale === "zh-Hant" ? deepHant(STR.zh) : STR[locale];
  const sec: ToolSectionsContent = locale === "zh-Hant" ? deepHant(SECTIONS.zh) : SECTIONS[locale];
  const [phase, setPhase] = useState<"idle" | "rendering" | "ready" | "working">("idle");
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState("");
  const [edges, setEdges] = useState<Edges>({ top: 0, right: 0, bottom: 0, left: 0 });
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<File | null>(null);

  const reset = () => { setPhase("idle"); setFileName(""); setPreview(""); setEdges({ top: 0, right: 0, bottom: 0, left: 0 }); setError(null); fileRef.current = null; };

  const onFile = useCallback(async (file: File) => {
    if (!file || (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"))) return;
    setError(null); setEdges({ top: 0, right: 0, bottom: 0, left: 0 }); setFileName(file.name); fileRef.current = file; setPhase("rendering");
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
      const page = await doc.getPage(1);
      const viewport = page.getViewport({ scale: 1.2 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width; canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      if (ctx) await page.render({ canvas, canvasContext: ctx, viewport }).promise;
      setPreview(canvas.toDataURL("image/jpeg", 0.8));
      try { doc.destroy(); } catch { /* ignore */ }
      setPhase("ready");
    } catch (e) {
      setError(encryptedPdfMessage(e, locale) ?? (t.err + (e instanceof Error ? e.message : String(e)))); setPhase("idle");
    }
  }, [t, locale]);

  const setEdge = (k: keyof Edges, v: number) => setEdges((p) => ({ ...p, [k]: Math.max(0, Math.min(45, v)) }));
  const hasCrop = edges.top + edges.bottom < 100 && edges.left + edges.right < 100 && (edges.top || edges.right || edges.bottom || edges.left);

  const apply = useCallback(async () => {
    const file = fileRef.current;
    if (!file) return;
    if (edges.top + edges.bottom >= 100 || edges.left + edges.right >= 100) { setError(t.err + "margins too large"); return; }
    setPhase("working"); setError(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const pdf = await PDFDocument.load(await file.arrayBuffer());
      for (const page of pdf.getPages()) {
        const { x, y, width, height } = page.getCropBox();
        const l = (edges.left / 100) * width;
        const r = (edges.right / 100) * width;
        const tp = (edges.top / 100) * height;
        const b = (edges.bottom / 100) * height;
        page.setCropBox(x + l, y + b, width - l - r, height - tp - b);
      }
      const bytes = await pdf.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = (fileName.replace(/\.pdf$/i, "") || "document") + "-cropped.pdf"; a.click();
      URL.revokeObjectURL(url);
      trackToolRun("crop-pdf");
      setPhase("ready");
    } catch (e) {
      setError(encryptedPdfMessage(e, locale) ?? (t.err + (e instanceof Error ? e.message : String(e)))); setPhase("ready");
    }
  }, [edges, fileName, t, locale]);

  const slider = (k: keyof Edges, label: string) => (
    <label className="flex items-center gap-2 text-[12.5px] text-[color:var(--muted)]">
      <span className="w-8 shrink-0">{label}</span>
      <input type="range" min={0} max={45} value={edges[k]} onChange={(e) => setEdge(k, +e.target.value)} className="flex-1 accent-[color:var(--accent)]" />
      <span className="w-9 shrink-0 text-right tabular-nums">{edges[k]}%</span>
    </label>
  );

  return (
    <div className="mx-auto max-w-5xl px-5 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20">
      <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{t.title}</h1>
      <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.subtitle}</p>

      {phase === "idle" || phase === "rendering" ? (
        <UploadDropzone locale={locale} buttonLabel={t.choose} busy={phase === "rendering"} busyLabel={t.rendering} onFile={onFile} />
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-[14px] font-semibold text-[color:var(--foreground)]">{fileName}</p>
              <button type="button" onClick={reset} className="shrink-0 text-[13px] font-medium text-[color:var(--muted)] hover:text-[color:var(--foreground)]">{t.start}</button>
            </div>
            <p className="mt-2 text-[12.5px] leading-relaxed text-[color:var(--faint)]">{t.hint}</p>
            <div className="mt-4 space-y-3">
              {slider("top", t.top)}
              {slider("right", t.right)}
              {slider("bottom", t.bottom)}
              {slider("left", t.left)}
            </div>
            <div className="mt-5 flex items-center gap-2">
              <button type="button" onClick={() => setEdges({ top: 0, right: 0, bottom: 0, left: 0 })} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">{t.reset}</button>
              <button type="button" onClick={apply} disabled={phase === "working" || !hasCrop} className="rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50">{phase === "working" ? t.working : t.apply}</button>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{t.preview}</span>
            <div className="relative inline-block max-w-full overflow-hidden rounded-[var(--radius)] border border-[color:var(--line)] bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {preview && <img src={preview} alt="page 1" className="block h-auto w-full" />}
              {/* shaded crop margins */}
              <div className="pointer-events-none absolute inset-x-0 top-0 bg-black/45" style={{ height: `${edges.top}%` }} />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-black/45" style={{ height: `${edges.bottom}%` }} />
              <div className="pointer-events-none absolute inset-y-0 left-0 bg-black/45" style={{ width: `${edges.left}%` }} />
              <div className="pointer-events-none absolute inset-y-0 right-0 bg-black/45" style={{ width: `${edges.right}%` }} />
            </div>
          </div>
        </div>
      )}

      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}
      <ToolSections locale={locale} content={sec} />
      <ToolFaq tool="crop-pdf" locale={locale} />
    </div>
  );
}
