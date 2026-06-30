"use client";

import { trackToolRun } from "@/lib/track";
import { useCallback, useRef, useState } from "react";
import { Spinner } from "@/components/Spinner";
import { ToolFaq } from "@/components/ToolFaq";
import { ToolSections, type ToolSectionsContent } from "@/components/ToolSections";
import { encryptedPdfMessage } from "@/lib/pdf-errors";
import { deepHant } from "@/lib/zh-hant";
import { WorkspaceValueZone } from "@/components/WorkspaceValueZone";
import { dropzoneVisual } from "@/components/design";
import type { AuthoredCopy, AuthoredLocale, RouteLocale } from "@/lib/i18n";
import { LAYOUT } from "@/lib/layout-constants";

// Canonical route locale — derived from RouteLocale so adding a route locale
// (e.g. "de") propagates here instead of silently falling back to English.
type Locale = RouteLocale;
type Op ={ type: "eq" | "del" | "ins"; text: string };

const _en = {
    title: "Compare versions",
    subtitle: "Upload an original and a revised PDF to see exactly what changed — added text is highlighted, removed text is struck through. Everything runs in your browser.",
    original: "Original (v1)", revised: "Revised (v2)",
    choose: "Choose PDF", reading: "Reading…", change: "Replace",
    compare: "Compare versions", comparing: "Comparing…", reset: "Start over",
    tryExample: "Try example",
    dropHint: "Compared locally — your files never leave your device.",
    added: "Added", removed: "Removed", unchanged: "No textual changes found.",
    summary: (a: number, d: number) => `${a} added · ${d} removed`,
    need: "Add both PDFs to compare.",
    err: "Something went wrong: ",
    note: "Compares the extracted text sentence by sentence. Formatting and images aren't part of the comparison.",
    previewCaption: "See additions in green and deletions in red before you upload.",
  };

// Exhaustive over AuthoredLocale: a missing route locale (e.g. "de") is a tsc
// error here, not a silent English fallback. zh-Hant is excluded — it is derived
// from zh via deepHant at the resolver below, never authored.
const STR = {
  en: _en,
  zh: {
    title: "PDF 版本对比",
    subtitle: "上传原始版和修订版 PDF，看清到底改了什么——新增文字高亮，删除文字加删除线。全部在浏览器中完成。",
    original: "原始版 (v1)", revised: "修订版 (v2)",
    choose: "选择 PDF", reading: "读取中…", change: "替换",
    compare: "对比版本", comparing: "对比中…", reset: "重新开始",
    tryExample: "查看示例", previewCaption: "上传前先看看输出效果——绿色高亮新增，红色删除线表示删除。",
    dropHint: "在本地对比——文件不离开你的设备。",
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
    tryExample: "Ver ejemplo", previewCaption: "Mira cómo se ve el resultado antes de subir: verde para añadido, tachado rojo para eliminado.",
    dropHint: "Se comparan localmente: tus archivos nunca salen de tu dispositivo.",
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
    tryExample: "Ver exemplo", previewCaption: "Veja como fica o resultado antes de enviar: verde para adicionado, tachado vermelho para removido.",
    dropHint: "Comparados localmente: seus arquivos nunca saem do seu dispositivo.",
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
    tryExample: "Voir un exemple", previewCaption: "Voyez le résultat avant d'importer : vert pour ajouté, barré rouge pour supprimé.",
    dropHint: "Comparaison locale — vos fichiers ne quittent jamais votre appareil.",
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
    tryExample: "サンプルを試す", previewCaption: "アップロード前に出力を確認：緑が追加、赤の取り消し線が削除。",
    dropHint: "ローカルで比較 — ファイルがデバイスから出ることはありません。",
    added: "追加", removed: "削除", unchanged: "テキストの変更は見つかりませんでした。",
    summary: (a: number, d: number) => `${a}件追加 · ${d}件削除`,
    need: "比較するには両方のPDFを追加してください。",
    err: "問題が発生しました: ",
    note: "抽出テキストを文単位で比較します。書式や画像は比較対象外です。",
  },
  de: {
    title: "Versionen vergleichen",
    subtitle: "Laden Sie ein Original- und ein überarbeitetes PDF hoch, um genau zu sehen, was sich geändert hat – hinzugefügter Text wird hervorgehoben, entfernter Text durchgestrichen. Die meisten Tools laufen direkt in Ihrem Browser.",
    original: "Original (v1)", revised: "Überarbeitet (v2)",
    choose: "PDF auswählen", reading: "Wird gelesen…", change: "Ersetzen",
    compare: "Versionen vergleichen", comparing: "Wird verglichen…", reset: "Neu beginnen",
    tryExample: "Beispiel ansehen", previewCaption: "Sehen Sie das Ergebnis vor dem Upload: Grün für hinzugefügt, rot durchgestrichen für entfernt.",
    dropHint: "Lokal verglichen – Ihre Dateien verlassen Ihr Gerät nicht.",
    added: "Hinzugefügt", removed: "Entfernt", unchanged: "Keine Textänderungen gefunden.",
    summary: (a: number, d: number) => `${a} hinzugefügt · ${d} entfernt`,
    need: "Fügen Sie beide PDFs zum Vergleichen hinzu.",
    err: "Etwas ist schiefgelaufen: ",
    note: "Vergleicht den extrahierten Text Satz für Satz. Formatierung und Bilder sind nicht Teil des Vergleichs.",
  },
  ko: {
    title: "버전 비교",
    subtitle: "원본 PDF와 수정본 PDF를 업로드하면 무엇이 바뀌었는지 정확히 보여 줍니다 — 추가된 텍스트는 강조되고 삭제된 텍스트는 취소선으로 표시됩니다. 모든 처리는 브라우저에서 이뤄집니다.",
    original: "원본 (v1)", revised: "수정본 (v2)",
    choose: "PDF 선택", reading: "읽는 중…", change: "교체",
    compare: "버전 비교", comparing: "비교 중…", reset: "처음부터 다시",
    tryExample: "예시 보기", previewCaption: "업로드 전에 결과를 미리 확인하세요: 초록색은 추가, 빨간색 취소선은 삭제.",
    dropHint: "로컬에서 비교합니다 — 파일은 기기를 벗어나지 않습니다.",
    added: "추가됨", removed: "삭제됨", unchanged: "텍스트 변경 사항을 찾지 못했습니다.",
    summary: (a: number, d: number) => `추가 ${a} · 삭제 ${d}`,
    need: "비교하려면 PDF 두 개를 모두 추가하세요.",
    err: "문제가 발생했습니다: ",
    note: "추출된 텍스트를 문장 단위로 비교합니다. 서식과 이미지는 비교 대상이 아닙니다.",
  },
} satisfies Record<AuthoredLocale, typeof _en>;

const EXAMPLE_OPS: Op[] = [
  { type: "eq", text: "This Agreement is entered into as of January 1, 2025 between Lessor and Lessee. " },
  { type: "del", text: "The lease term shall be 12 months." },
  { type: "ins", text: "The lease term shall be 24 months, with one renewal option." },
  { type: "eq", text: " Monthly rent is due on the first of each month. " },
  { type: "del", text: "Late fees of $25 apply after a 5-day grace period." },
  { type: "ins", text: "Late fees of $50 apply after a 3-day grace period." },
  { type: "eq", text: " Either party may terminate with 30 days written notice. " },
  { type: "ins", text: "A force majeure clause applies to events beyond reasonable control." },
];

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

const SECTIONS: AuthoredCopy<ToolSectionsContent> = {
  en: {
    benefitsTitle: "Why redline PDFs in your browser",
    benefitsDescription: "Compare an original and a revised PDF and see every text change marked up — no need to read both side by side.",
    benefits: [
      { title: "Every edit, marked in place", description: "Added text is highlighted and removed text is struck through in one continuous read, so you never miss a quiet wording change." },
      { title: "Built for long documents", description: "A sentence-level diff scans through hundreds of pages and surfaces only what actually changed between the two versions." },
      { title: "A clear added/removed tally", description: "See at a glance how many passages were added versus removed before you read a single line of the markup." },
    ],
    workflowTitle: "How redlining fits your review work",
    workflowDescription: "For the moment two versions of a contract, policy, or report land on your desk and you have to know exactly what moved.",
    steps: [
      "Upload the original PDF and the revised PDF you want to compare.",
      "Run the comparison to red-line every added and removed passage.",
      "Read the marked-up result and download or share what changed.",
    ],
    readingTitle: "More ways to work with documents",
    readingDescription: "Related tools and guides for reviewing and finalizing PDFs.",
    readingLinks: [
      { label: "Redact a PDF", href: "/redact-pdf", description: "Permanently black out sensitive text before sharing a reviewed document." },
      { label: "PDF workflow resources", href: "/resources", description: "A structured hub for PDF tools, OCR, conversion, and AI document paths." },
    ],
  },
  zh: {
    benefitsTitle: "为什么在浏览器里红线对比 PDF",
    benefitsDescription: "对比原始版和修订版 PDF，每处文字改动都标注出来——不必再把两份文件并排逐行核对。",
    benefits: [
      { title: "每处改动就地标注", description: "新增文字高亮、删除文字加删除线，连贯地一次读完，再细微的措辞变动也不会漏看。" },
      { title: "为长文档而生", description: "按句子级别比对，可扫遍数百页，只把两个版本之间真正变化的内容呈现出来。" },
      { title: "新增/删除一目了然", description: "读正文之前就先看到共新增了多少处、删除了多少处。" },
    ],
    workflowTitle: "红线对比如何融入你的审阅工作",
    workflowDescription: "当一份合同、制度或报告的两个版本摆到你面前，你必须搞清楚到底改了哪里时。",
    steps: [
      "上传要对比的原始版 PDF 和修订版 PDF。",
      "运行对比，把每处新增和删除都标成红线。",
      "查看标注结果，下载或分享改动内容。",
    ],
    readingTitle: "更多处理文档的方式",
    readingDescription: "审阅和定稿 PDF 的相关工具与指南。",
    readingLinks: [
      { label: "涂黑 PDF", href: "/redact-pdf", description: "分享审阅过的文档前，永久涂黑其中的敏感文字。" },
      { label: "PDF 工作流资源", href: "/resources", description: "按工作流整理 PDF 工具、OCR、转换和 AI 文档路径。" },
    ],
  },
  es: {
    benefitsTitle: "Por qué comparar PDF en tu navegador",
    benefitsDescription: "Compara un PDF original y uno revisado y ve cada cambio de texto marcado, sin tener que leer ambos en paralelo.",
    benefits: [
      { title: "Cada edición, marcada en su sitio", description: "El texto añadido se resalta y el eliminado se tacha en una lectura continua, para que no se te escape ningún cambio sutil de redacción." },
      { title: "Pensado para documentos largos", description: "Una comparación frase por frase recorre cientos de páginas y muestra solo lo que realmente cambió entre las dos versiones." },
      { title: "Un recuento claro de añadidos y eliminados", description: "Ve de un vistazo cuántos pasajes se añadieron frente a los eliminados antes de leer una sola línea del marcado." },
    ],
    workflowTitle: "Cómo encaja la comparación en tu revisión",
    workflowDescription: "Para cuando dos versiones de un contrato, una política o un informe llegan a tu mesa y necesitas saber exactamente qué cambió.",
    steps: [
      "Sube el PDF original y el PDF revisado que quieres comparar.",
      "Ejecuta la comparación para marcar en rojo cada pasaje añadido y eliminado.",
      "Lee el resultado marcado y descarga o comparte lo que cambió.",
    ],
    readingTitle: "Más formas de trabajar con documentos",
    readingDescription: "Herramientas y guías relacionadas para revisar y finalizar PDF.",
    readingLinks: [
      { label: "Ocultar texto de un PDF", href: "/redact-pdf", description: "Tacha de forma permanente el texto sensible antes de compartir un documento revisado." },
      { label: "Recursos de flujos de trabajo PDF", href: "/resources", description: "Un centro estructurado de herramientas PDF, OCR, conversión y rutas de documentos con IA." },
    ],
  },
  pt: {
    benefitsTitle: "Por que comparar PDF no seu navegador",
    benefitsDescription: "Compare um PDF original e um revisado e veja cada alteração de texto marcada, sem precisar ler os dois lado a lado.",
    benefits: [
      { title: "Cada edição, marcada no lugar", description: "O texto adicionado é destacado e o removido é tachado em uma leitura contínua, para você nunca perder uma mudança discreta de redação." },
      { title: "Feito para documentos longos", description: "Uma comparação frase por frase percorre centenas de páginas e mostra apenas o que realmente mudou entre as duas versões." },
      { title: "Uma contagem clara de adições e remoções", description: "Veja num relance quantos trechos foram adicionados versus removidos antes de ler uma única linha da marcação." },
    ],
    workflowTitle: "Como a comparação se encaixa na sua revisão",
    workflowDescription: "Para quando duas versões de um contrato, política ou relatório chegam à sua mesa e você precisa saber exatamente o que mudou.",
    steps: [
      "Envie o PDF original e o PDF revisado que deseja comparar.",
      "Execute a comparação para marcar em vermelho cada trecho adicionado e removido.",
      "Leia o resultado marcado e baixe ou compartilhe o que mudou.",
    ],
    readingTitle: "Mais formas de trabalhar com documentos",
    readingDescription: "Ferramentas e guias relacionados para revisar e finalizar PDF.",
    readingLinks: [
      { label: "Ocultar texto de um PDF", href: "/redact-pdf", description: "Apague permanentemente o texto sensível antes de compartilhar um documento revisado." },
      { label: "Recursos de fluxos de trabalho PDF", href: "/resources", description: "Um hub estruturado de ferramentas PDF, OCR, conversão e fluxos de documentos com IA." },
    ],
  },
  fr: {
    benefitsTitle: "Pourquoi comparer des PDF dans votre navigateur",
    benefitsDescription: "Comparez un PDF original et un PDF révisé et voyez chaque modification de texte annotée, sans avoir à lire les deux en parallèle.",
    benefits: [
      { title: "Chaque modification, annotée sur place", description: "Le texte ajouté est surligné et le texte supprimé est barré en une lecture continue, pour ne jamais manquer un changement de formulation discret." },
      { title: "Conçu pour les longs documents", description: "Une comparaison phrase par phrase parcourt des centaines de pages et ne fait ressortir que ce qui a réellement changé entre les deux versions." },
      { title: "Un décompte clair des ajouts et suppressions", description: "Voyez d'un coup d'œil combien de passages ont été ajoutés par rapport à ceux supprimés avant de lire une seule ligne de l'annotation." },
    ],
    workflowTitle: "Comment la comparaison s'intègre à votre relecture",
    workflowDescription: "Pour le moment où deux versions d'un contrat, d'une politique ou d'un rapport arrivent sur votre bureau et où vous devez savoir précisément ce qui a bougé.",
    steps: [
      "Importez le PDF original et le PDF révisé à comparer.",
      "Lancez la comparaison pour souligner en rouge chaque passage ajouté et supprimé.",
      "Lisez le résultat annoté et téléchargez ou partagez ce qui a changé.",
    ],
    readingTitle: "Plus de façons de travailler avec les documents",
    readingDescription: "Outils et guides associés pour relire et finaliser des PDF.",
    readingLinks: [
      { label: "Caviarder un PDF", href: "/redact-pdf", description: "Masquez définitivement le texte sensible avant de partager un document relu." },
      { label: "Ressources de flux de travail PDF", href: "/resources", description: "Un hub structuré d'outils PDF, d'OCR, de conversion et de parcours documentaires IA." },
    ],
  },
  ja: {
    benefitsTitle: "ブラウザで PDF を赤字対比する理由",
    benefitsDescription: "元版と改訂版の PDF を比較し、すべてのテキスト変更をマークアップ表示——両方を並べて読み比べる必要はありません。",
    benefits: [
      { title: "すべての変更をその場で表示", description: "追加テキストはハイライト、削除テキストは取り消し線で一続きに読めるので、わずかな言い回しの変更も見逃しません。" },
      { title: "長い文書のために設計", description: "文単位の差分で数百ページを走査し、2 つのバージョン間で実際に変わった箇所だけを浮かび上がらせます。" },
      { title: "追加・削除の件数が一目瞭然", description: "マークアップを一行も読む前に、何か所追加され、何か所削除されたかをひと目で把握できます。" },
    ],
    workflowTitle: "赤字対比がレビュー作業にどう役立つか",
    workflowDescription: "契約書、規程、レポートの 2 つのバージョンが手元に届き、どこが動いたのかを正確に把握しなければならないとき。",
    steps: [
      "比較したい元版 PDF と改訂版 PDF をアップロードします。",
      "比較を実行し、追加・削除された箇所をすべて赤字でマークします。",
      "マークアップ結果を確認し、変更点をダウンロードまたは共有します。",
    ],
    readingTitle: "文書を扱う他の方法",
    readingDescription: "PDF のレビューと仕上げに関する関連ツールとガイド。",
    readingLinks: [
      { label: "PDF を黒塗り", href: "/redact-pdf", description: "レビュー済みの文書を共有する前に、機密テキストを完全に黒塗りします。" },
      { label: "PDF ワークフローのリソース", href: "/resources", description: "PDF ツール、OCR、変換、AI ドキュメントの導線を整理したハブ。" },
    ],
  },
  de: {
    benefitsTitle: "Warum PDFs in Ihrem Browser redlinen",
    benefitsDescription: "Vergleichen Sie ein Original- und ein überarbeitetes PDF und sehen Sie jede Textänderung markiert – Sie müssen nicht beide nebeneinander lesen.",
    benefits: [
      { title: "Jede Änderung an Ort und Stelle markiert", description: "Hinzugefügter Text wird hervorgehoben und entfernter Text durchgestrichen, in einem durchgehenden Lesefluss, sodass Ihnen keine stille Umformulierung entgeht." },
      { title: "Für lange Dokumente gemacht", description: "Ein Vergleich auf Satzebene durchläuft Hunderte von Seiten und hebt nur das hervor, was sich zwischen den beiden Versionen tatsächlich geändert hat." },
      { title: "Eine klare Zählung von Hinzugefügtem und Entferntem", description: "Sehen Sie auf einen Blick, wie viele Passagen hinzugefügt und wie viele entfernt wurden, bevor Sie eine einzige Zeile der Markierung lesen." },
    ],
    workflowTitle: "Wie das Redlining in Ihre Prüfungsarbeit passt",
    workflowDescription: "Für den Moment, in dem zwei Versionen eines Vertrags, einer Richtlinie oder eines Berichts auf Ihrem Schreibtisch landen und Sie genau wissen müssen, was sich verschoben hat.",
    steps: [
      "Laden Sie das Original-PDF und das überarbeitete PDF hoch, die Sie vergleichen möchten.",
      "Führen Sie den Vergleich aus, um jede hinzugefügte und entfernte Passage rot zu markieren.",
      "Lesen Sie das markierte Ergebnis und laden Sie das Geänderte herunter oder teilen Sie es.",
    ],
    readingTitle: "Weitere Wege, mit Dokumenten zu arbeiten",
    readingDescription: "Verwandte Tools und Anleitungen zum Prüfen und Finalisieren von PDFs.",
    readingLinks: [
      { label: "PDF schwärzen", href: "/redact-pdf", description: "Schwärzen Sie vertraulichen Text dauerhaft, bevor Sie ein geprüftes Dokument teilen." },
      { label: "PDF-Workflow-Ressourcen", href: "/resources", description: "Ein strukturierter Hub für PDF-Tools, OCR, Konvertierung und KI-Dokumentenwege." },
    ],
  },
  ko: {
    benefitsTitle: "브라우저에서 PDF를 비교 표시하는 이유",
    benefitsDescription: "원본 PDF와 수정본 PDF를 비교해 모든 텍스트 변경을 표시합니다 — 두 문서를 나란히 읽을 필요가 없습니다.",
    benefits: [
      { title: "모든 수정을 제자리에 표시", description: "추가된 텍스트는 강조되고 삭제된 텍스트는 취소선으로 한 흐름에 이어 읽히므로, 미묘한 표현 변화도 놓치지 않습니다." },
      { title: "긴 문서를 위해 설계", description: "문장 단위 비교가 수백 페이지를 훑어, 두 버전 사이에서 실제로 바뀐 부분만 드러냅니다." },
      { title: "추가/삭제 건수를 한눈에", description: "표시된 내용을 한 줄도 읽기 전에 몇 군데가 추가되고 삭제되었는지 먼저 확인할 수 있습니다." },
    ],
    workflowTitle: "비교 표시가 검토 작업에 어떻게 맞물리나요",
    workflowDescription: "계약서, 정책, 보고서의 두 버전이 책상에 올라와 정확히 무엇이 바뀌었는지 알아야 하는 순간을 위한 기능입니다.",
    steps: [
      "비교하려는 원본 PDF와 수정본 PDF를 업로드하세요.",
      "비교를 실행해 추가·삭제된 모든 부분을 빨간 줄로 표시합니다.",
      "표시된 결과를 읽고 바뀐 내용을 다운로드하거나 공유하세요.",
    ],
    readingTitle: "문서를 다루는 더 많은 방법",
    readingDescription: "PDF를 검토하고 마무리하는 관련 도구와 가이드입니다.",
    readingLinks: [
      { label: "PDF 가리기", href: "/redact-pdf", description: "검토한 문서를 공유하기 전에 민감한 텍스트를 영구적으로 가립니다." },
      { label: "PDF 워크플로 자료", href: "/resources", description: "PDF 도구, OCR, 변환, AI 문서 경로를 정리한 허브입니다." },
    ],
  },
};

export function RedlineClient({ locale = "en", embedded = false }: { locale?: Locale; embedded?: boolean }) {
  // ko is fully authored (STR/SECTIONS carry Korean). zh-Hant derives from zh via deepHant.
  const al: AuthoredLocale = locale === "zh-Hant" ? "en" : locale;
  // childLocale collapses ONLY ko (preserves zh-Hant) for runtime fns lacking "ko".
  const childLocale = locale;
  const t = locale === "zh-Hant" ? deepHant(STR.zh) : STR[al];
  const sec: ToolSectionsContent = locale === "zh-Hant" ? deepHant(SECTIONS.zh) : SECTIONS[al];
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
      trackToolRun("redline");
    } catch (e) {
      setError(encryptedPdfMessage(e, childLocale) ?? (t.err + (e instanceof Error ? e.message : String(e))));
      setPhase("idle");
    }
  }, [a, b, t, childLocale]);

  const reset = () => { setA(null); setB(null); setOps([]); setPhase("idle"); setError(null); };
  const loadExample = () => { setOps(EXAMPLE_OPS); setPhase("done"); setError(null); };

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
    <div className={embedded ? "mx-auto w-full max-w-3xl px-8 pb-10 pt-4" : `mx-auto ${LAYOUT.content} px-5 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20`}>
      {!embedded && (
        <>
          <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{t.title}</h1>
          <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.subtitle}</p>
        </>
      )}
      {embedded && <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.subtitle}</p>}

      {/* Result preview illustration — shown only before any file is loaded */}
      {phase === "idle" && !a && !b && !embedded && (
        <div className="mt-8 overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)]">
          <div className="flex min-h-[140px] items-stretch">
            {/* Left: input V1 + V2 stacked */}
            <div className="flex w-[42%] flex-col justify-center gap-2 p-4">
              {(["V1", "V2"] as const).map((label) => (
                <div key={label} className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--background)] px-3 py-2">
                  <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-[color:var(--faint)]">{label}</p>
                  <div className="space-y-1">
                    {[1, 0.75, 1, 0.6].map((w, i) => (
                      <div key={i} className="h-1.5 rounded-full bg-[color:var(--line)]" style={{ width: `${w * 100}%` }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {/* Arrow */}
            <div className="flex w-[12%] items-center justify-center text-[color:var(--faint)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </div>
            {/* Right: diff output preview — mirrors the real block-level output */}
            <div className="flex flex-1 flex-col justify-center divide-y divide-[color:var(--line)] overflow-hidden border-l border-[color:var(--line)] text-[11px]">
              <div className="bg-[rgba(52,211,153,0.10)] px-3 py-1.5 text-[color:var(--foreground)]"><span className="mr-1.5 font-mono text-[9px] font-bold opacity-60">+</span>term shall be 24 months.</div>
              <div className="bg-[rgba(248,113,113,0.09)] px-3 py-1.5 text-[#b91c1c] line-through"><span className="mr-1.5 font-mono text-[9px] font-bold opacity-60">−</span>term shall be 12 months.</div>
              <div className="px-3 py-1.5 text-[color:var(--faint)]">Monthly rent due on the 1st.</div>
              <div className="bg-[rgba(52,211,153,0.10)] px-3 py-1.5 text-[color:var(--foreground)]"><span className="mr-1.5 font-mono text-[9px] font-bold opacity-60">+</span>Force majeure clause added.</div>
            </div>
          </div>
          <div className="border-t border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-2 text-center text-[11.5px] text-[color:var(--faint)]">
            {t.previewCaption}
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {slot(a, setA, aRef, t.original, "a")}
        {slot(b, setB, bRef, t.revised, "b")}
      </div>

      <p className="mt-3 text-xs text-[color:var(--muted)]">{t.dropHint}</p>
      <p className="mt-1.5 flex items-center justify-center gap-1 text-[11.5px] text-[color:var(--accent)]">
        <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" /><path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4" /></svg>
        {locale === "zh-Hant" ? deepHant("本地处理，文件不上传") : locale === "zh" ? "本地处理，文件不上传" : locale === "ja" ? "ローカルで処理 — ファイルはアップロードされません" : locale === "es" ? "Procesado localmente — nunca se sube" : locale === "pt" ? "Processado localmente — nunca enviado" : locale === "fr" ? "Traité localement — jamais téléversé" : locale === "de" ? "Lokal verarbeitet – nicht hochgeladen" : locale === "ko" ? "기기에서 처리 — 업로드되지 않습니다" : "Processed locally — never uploaded"}
      </p>
      {embedded && !a && !b && <WorkspaceValueZone type="client" locale={locale} />}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button type="button" onClick={compare} disabled={!a || !b || phase === "comparing"} className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-[color:var(--accent)] px-6 py-2.5 text-[14px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50">{phase === "comparing" ? (<><Spinner /> {t.comparing}</>) : t.compare}</button>
        {!a && !b && phase !== "done" && (
          <button type="button" onClick={loadExample} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2.5 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">{t.tryExample}</button>
        )}
        {(a || b || phase === "done") && <button type="button" onClick={reset} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2.5 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">{t.reset}</button>}
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
            <div className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] divide-y divide-[color:var(--line)] overflow-hidden text-[13.5px]">
              {ops.map((o, i) => (
                <div
                  key={i}
                  className={
                    o.type === "ins"
                      ? "bg-[rgba(52,211,153,0.10)] px-4 py-2 text-[color:var(--foreground)]"
                      : o.type === "del"
                        ? "bg-[rgba(248,113,113,0.09)] px-4 py-2 text-[#b91c1c] line-through"
                        : "px-4 py-2 text-[color:var(--muted)]"
                  }
                >
                  {o.type !== "eq" && (
                    <span className="mr-2 select-none font-mono text-[11px] font-bold opacity-60">
                      {o.type === "ins" ? "+" : "−"}
                    </span>
                  )}
                  {o.text}
                </div>
              ))}
            </div>
          )}
          <p className="mt-3 text-[12px] text-[color:var(--faint)]">{t.note}</p>
        </div>
      )}

      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}
      {!embedded && <ToolSections locale={locale} content={sec} />}
      {!embedded && <ToolFaq tool="redline" locale={locale} />}
    </div>
  );
}
