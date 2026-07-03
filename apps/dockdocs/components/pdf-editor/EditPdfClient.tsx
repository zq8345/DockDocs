"use client";

// /edit-pdf — Phase A1 overlay editor.
// Everything runs in the browser; the file never leaves the device — that is
// the positioning axis (every competitor uploads). Non-destructive: the bake
// draws on top of the original document.

import { trackToolRun } from "@/lib/track";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { encryptedPdfMessage } from "@/lib/pdf-errors";
import { UploadDropzone } from "@/components/UploadDropzone";
import { deepHant } from "@/lib/zh-hant";
import type { RouteLocale, AuthoredCopy, AuthoredLocale } from "@/lib/i18n";
import { LAYOUT } from "@/lib/layout-constants";
import { elementPages, pageInfoOf, type EditorElement, type PageInfo, type PageRef, type TextElement } from "./editor-types";
import { editorReducer, initialEditorState } from "./editor-store";
import {
  DEFAULT_HIGHLIGHT_COLOR,
  DEFAULT_HIGHLIGHT_OPACITY,
  DEFAULT_INK_COLOR,
  DEFAULT_SHAPE_STROKE,
  DEFAULT_SIZE_PT,
  DEFAULT_STROKE_WIDTH_PT,
  DEFAULT_TEXT_COLOR,
  HIGHLIGHT_PRESETS,
  MAX_SIZE_PT,
  MIN_SIZE_PT,
  inkBounds,
  sizeTextElement,
} from "./editor-geometry";
import { bakePdf } from "./bake-engine";
import { PageCanvas } from "./PageCanvas";
import { ThumbRail } from "./ThumbRail";
import { SignaturePanel } from "./SignaturePanel";

type Locale = RouteLocale;

const STR_EN = {
  title: "Edit PDF",
  subtitle:
    "Add text, images, boxes, highlights and freehand notes anywhere on a PDF — drag everything into place and download the result. Runs in your browser; your file never leaves your device.",
  drop: "Drag & drop a PDF here, or click to choose",
  choose: "Choose PDF",
  rendering: "Rendering pages…",
  addText: "Text",
  addImage: "Image",
  addBox: "Box",
  addHighlight: "Highlight",
  draw: "Draw",
  hint: "Double-click a page to add text. Drag to move, pull a handle to resize, double-click a text box to edit.",
  drawHint: "Drawing mode — drag on a page to draw. Press Esc or click Draw again to exit.",
  placeholder: "Type here…",
  elements: (n: number) => `${n} element${n === 1 ? "" : "s"}`,
  undo: "Undo",
  redo: "Redo",
  download: "Download PDF",
  working: "Preparing PDF…",
  reset: "Start over",
  err: "Something went wrong: ",
  page: (n: number) => `Page ${n}`,
  size: "Size",
  color: "Color",
  bold: "Bold",
  fill: "Fill",
  noFill: "No fill",
  stroke: "Border",
  width: "Width",
  opacity: "Opacity",
  remove: "Remove",
  thumbsAria: "Page navigation",
  sign: "Sign",
  signDraw: "Draw",
  signType: "Type",
  signTypePlaceholder: "Type your name…",
  signApply: "Place on page",
  signClear: "Clear",
  cancel: "Cancel",
  addWatermark: "Watermark",
  wmDefault: "CONFIDENTIAL",
  pageRange: "Pages",
  addRedact: "Redact",
  redactHint: "Redact mode — drag to black out an area, or click a word to box it. Press Esc to exit.",
  redactBakeNote: "Pages with redactions are flattened to images on download, so the covered text is truly destroyed.",
  addPageNum: "Page numbers",
  startAt: "Start at",
  insertBlank: "Blank page",
  insertPdf: "Insert PDF",
  rotatePage: "Rotate page",
  deletePage: "Delete page",
  addWhiteout: "Cover & retype",
  whiteoutHint: "Cover-and-retype: click a word to cover it and type over it, or drag to place a covering patch. The original text is covered (it remains underneath), not edited. Esc to exit.",
};

const STR = {
  en: STR_EN,
  zh: {
    title: "编辑 PDF",
    subtitle: "在 PDF 任意位置添加文字、图片、方框、高亮和手写批注——拖到合适的位置,然后下载成品。全程在浏览器完成,文件不离开你的设备。",
    drop: "把 PDF 拖到这里,或点击选择",
    choose: "选择 PDF",
    rendering: "正在渲染页面…",
    addText: "文字",
    addImage: "图片",
    addBox: "方框",
    addHighlight: "高亮",
    draw: "手写",
    hint: "双击页面即可添加文字。拖动移动位置,拉动句柄调整大小,双击文本框编辑内容。",
    drawHint: "手写模式——在页面上拖动书写。按 Esc 或再点一次「手写」退出。",
    placeholder: "输入文字…",
    elements: (n: number) => `${n} 个元素`,
    undo: "撤销",
    redo: "重做",
    download: "下载 PDF",
    working: "正在生成 PDF…",
    reset: "重新开始",
    err: "出错了:",
    page: (n: number) => `第 ${n} 页`,
    size: "字号",
    color: "颜色",
    bold: "加粗",
    fill: "填充",
    noFill: "无填充",
    stroke: "描边",
    width: "粗细",
    opacity: "不透明度",
    remove: "删除",
    thumbsAria: "页面导航",
    sign: "签名",
    signDraw: "手写",
    signType: "打字",
    signTypePlaceholder: "输入你的姓名…",
    signApply: "放入页面",
    signClear: "清除",
    cancel: "取消",
    addWatermark: "水印",
    wmDefault: "机密",
    pageRange: "页范围",
    addRedact: "涂黑",
    redactHint: "涂黑模式——拖动框住一块区域,或点击某个词自动框住。按 Esc 退出。",
    redactBakeNote: "含涂黑的页面在下载时会整页转为图片,被盖住的文字被真正销毁。",
    addPageNum: "页码",
    startAt: "起始页码",
    insertBlank: "空白页",
    insertPdf: "插入 PDF",
    rotatePage: "旋转页面",
    deletePage: "删除页面",
    addWhiteout: "遮盖替换",
    whiteoutHint: "遮盖替换模式——点击某个词,用底色方块盖住并在上面输入新文字;或拖动放置遮盖块。原文字只是被盖住(仍在下层),并非被编辑。按 Esc 退出。",
  },
  es: {
    title: "Editar PDF",
    subtitle: "Añade texto, imágenes, recuadros, resaltados y notas a mano en cualquier parte de un PDF: arrastra todo a su sitio y descarga el resultado. Se ejecuta en tu navegador; tu archivo nunca sale de tu dispositivo.",
    drop: "Arrastra y suelta un PDF aquí, o haz clic para elegir",
    choose: "Elegir PDF",
    rendering: "Procesando páginas…",
    addText: "Texto",
    addImage: "Imagen",
    addBox: "Recuadro",
    addHighlight: "Resaltar",
    draw: "Dibujar",
    hint: "Haz doble clic en una página para añadir texto. Arrastra para mover, tira de un tirador para cambiar el tamaño y haz doble clic en un cuadro de texto para editarlo.",
    drawHint: "Modo dibujo: arrastra sobre una página para dibujar. Pulsa Esc o vuelve a hacer clic en Dibujar para salir.",
    placeholder: "Escribe aquí…",
    elements: (n: number) => `${n} elemento${n === 1 ? "" : "s"}`,
    undo: "Deshacer",
    redo: "Rehacer",
    download: "Descargar PDF",
    working: "Generando el PDF…",
    reset: "Empezar de nuevo",
    err: "Algo salió mal: ",
    page: (n: number) => `Página ${n}`,
    size: "Tamaño",
    color: "Color",
    bold: "Negrita",
    fill: "Relleno",
    noFill: "Sin relleno",
    stroke: "Borde",
    width: "Grosor",
    opacity: "Opacidad",
    remove: "Eliminar",
    thumbsAria: "Navegación de páginas",
    sign: "Firmar",
    signDraw: "Dibujar",
    signType: "Escribir",
    signTypePlaceholder: "Escribe tu nombre…",
    signApply: "Colocar en la página",
    signClear: "Borrar",
    cancel: "Cancelar",
    addWatermark: "Marca de agua",
    wmDefault: "CONFIDENCIAL",
    pageRange: "Páginas",
    addRedact: "Censurar",
    redactHint: "Modo censura: arrastra para tachar un área, o haz clic en una palabra para enmarcarla. Pulsa Esc para salir.",
    redactBakeNote: "Las páginas con censuras se aplanan como imágenes al descargar, así el texto cubierto se destruye de verdad.",
    addPageNum: "Números de página",
    startAt: "Empezar en",
    insertBlank: "Página en blanco",
    insertPdf: "Insertar PDF",
    rotatePage: "Girar página",
    deletePage: "Eliminar página",
    addWhiteout: "Cubrir y reescribir",
    whiteoutHint: "Cubrir y reescribir: haz clic en una palabra para cubrirla y escribir encima, o arrastra para colocar un parche. El texto original queda cubierto (sigue debajo), no se edita. Esc para salir.",
  },
  pt: {
    title: "Editar PDF",
    subtitle: "Adicione texto, imagens, caixas, destaques e anotações à mão em qualquer lugar de um PDF — arraste tudo para a posição certa e baixe o resultado. Executado no seu navegador; seu arquivo nunca sai do seu dispositivo.",
    drop: "Arraste e solte um PDF aqui, ou clique para escolher",
    choose: "Escolher PDF",
    rendering: "Processando páginas…",
    addText: "Texto",
    addImage: "Imagem",
    addBox: "Caixa",
    addHighlight: "Destacar",
    draw: "Desenhar",
    hint: "Clique duas vezes em uma página para adicionar texto. Arraste para mover, puxe uma alça para redimensionar e clique duas vezes em uma caixa de texto para editar.",
    drawHint: "Modo desenho — arraste sobre uma página para desenhar. Pressione Esc ou clique em Desenhar novamente para sair.",
    placeholder: "Digite aqui…",
    elements: (n: number) => `${n} elemento${n === 1 ? "" : "s"}`,
    undo: "Desfazer",
    redo: "Refazer",
    download: "Baixar PDF",
    working: "Gerando o PDF…",
    reset: "Recomeçar",
    err: "Algo deu errado: ",
    page: (n: number) => `Página ${n}`,
    size: "Tamanho",
    color: "Cor",
    bold: "Negrito",
    fill: "Preenchimento",
    noFill: "Sem preenchimento",
    stroke: "Borda",
    width: "Espessura",
    opacity: "Opacidade",
    remove: "Remover",
    thumbsAria: "Navegação de páginas",
    sign: "Assinar",
    signDraw: "Desenhar",
    signType: "Digitar",
    signTypePlaceholder: "Digite seu nome…",
    signApply: "Colocar na página",
    signClear: "Limpar",
    cancel: "Cancelar",
    addWatermark: "Marca d'água",
    wmDefault: "CONFIDENCIAL",
    pageRange: "Páginas",
    addRedact: "Redigir",
    redactHint: "Modo de redação — arraste para ocultar uma área, ou clique em uma palavra para enquadrá-la. Pressione Esc para sair.",
    redactBakeNote: "Páginas com redações são achatadas como imagens ao baixar, então o texto coberto é realmente destruído.",
    addPageNum: "Números de página",
    startAt: "Começar em",
    insertBlank: "Página em branco",
    insertPdf: "Inserir PDF",
    rotatePage: "Girar página",
    deletePage: "Excluir página",
    addWhiteout: "Cobrir e reescrever",
    whiteoutHint: "Cobrir e reescrever: clique em uma palavra para cobri-la e digitar por cima, ou arraste para colocar um remendo. O texto original fica coberto (continua por baixo), nao e editado. Esc para sair.",
  },
  fr: {
    title: "Modifier un PDF",
    subtitle: "Ajoutez du texte, des images, des cadres, des surlignages et des annotations à main levée n'importe où dans un PDF — placez chaque élément par glisser-déposer, puis téléchargez le résultat. Fonctionne dans votre navigateur ; votre fichier ne quitte jamais votre appareil.",
    drop: "Glissez-déposez un PDF ici, ou cliquez pour choisir",
    choose: "Choisir un PDF",
    rendering: "Rendu des pages en cours…",
    addText: "Texte",
    addImage: "Image",
    addBox: "Cadre",
    addHighlight: "Surligner",
    draw: "Dessiner",
    hint: "Double-cliquez sur une page pour ajouter du texte. Faites glisser pour déplacer, tirez une poignée pour redimensionner, double-cliquez sur un bloc de texte pour le modifier.",
    drawHint: "Mode dessin — faites glisser sur une page pour dessiner. Appuyez sur Échap ou cliquez à nouveau sur Dessiner pour quitter.",
    placeholder: "Saisissez votre texte…",
    elements: (n: number) => `${n} élément${n === 1 ? "" : "s"}`,
    undo: "Annuler",
    redo: "Rétablir",
    download: "Télécharger le PDF",
    working: "Génération du PDF…",
    reset: "Recommencer",
    err: "Une erreur est survenue : ",
    page: (n: number) => `Page ${n}`,
    size: "Taille",
    color: "Couleur",
    bold: "Gras",
    fill: "Remplissage",
    noFill: "Sans remplissage",
    stroke: "Bordure",
    width: "Épaisseur",
    opacity: "Opacité",
    remove: "Supprimer",
    thumbsAria: "Navigation des pages",
    sign: "Signer",
    signDraw: "Dessiner",
    signType: "Saisir",
    signTypePlaceholder: "Saisissez votre nom…",
    signApply: "Placer sur la page",
    signClear: "Effacer",
    cancel: "Annuler",
    addWatermark: "Filigrane",
    wmDefault: "CONFIDENTIEL",
    pageRange: "Pages",
    addRedact: "Caviarder",
    redactHint: "Mode caviardage — faites glisser pour noircir une zone, ou cliquez sur un mot pour l'encadrer. Appuyez sur Échap pour quitter.",
    redactBakeNote: "Les pages caviardées sont aplaties en images au téléchargement : le texte masqué est réellement détruit.",
    addPageNum: "Numéros de page",
    startAt: "Commencer à",
    insertBlank: "Page vierge",
    insertPdf: "Insérer un PDF",
    rotatePage: "Pivoter la page",
    deletePage: "Supprimer la page",
    addWhiteout: "Masquer et réécrire",
    whiteoutHint: "Masquer et réécrire : cliquez sur un mot pour le couvrir et taper par-dessus, ou faites glisser pour placer un cache. Le texte original est couvert (il reste en dessous), pas modifié. Échap pour quitter.",
  },
  ja: {
    title: "PDFを編集",
    subtitle: "PDFの好きな場所にテキスト・画像・枠・ハイライト・手書きメモを追加——ドラッグで配置して、結果をダウンロード。ブラウザ内で動作し、ファイルがデバイスから出ることはありません。",
    drop: "ここにPDFをドラッグ＆ドロップ、またはクリックして選択",
    choose: "PDFを選択",
    rendering: "ページを描画中…",
    addText: "テキスト",
    addImage: "画像",
    addBox: "枠",
    addHighlight: "ハイライト",
    draw: "手書き",
    hint: "ページをダブルクリックしてテキストを追加。ドラッグで移動、ハンドルでサイズ変更、テキストボックスをダブルクリックで編集できます。",
    drawHint: "手書きモード——ページ上をドラッグして描きます。Escキーまたは再度「手書き」をクリックで終了。",
    placeholder: "ここに入力…",
    elements: (n: number) => `${n}個の要素`,
    undo: "元に戻す",
    redo: "やり直す",
    download: "PDFをダウンロード",
    working: "PDFを生成中…",
    reset: "最初からやり直す",
    err: "問題が発生しました: ",
    page: (n: number) => `${n}ページ`,
    size: "サイズ",
    color: "色",
    bold: "太字",
    fill: "塗り",
    noFill: "塗りなし",
    stroke: "枠線",
    width: "太さ",
    opacity: "不透明度",
    remove: "削除",
    thumbsAria: "ページナビゲーション",
    sign: "署名",
    signDraw: "手書き",
    signType: "入力",
    signTypePlaceholder: "名前を入力…",
    signApply: "ページに配置",
    signClear: "クリア",
    cancel: "キャンセル",
    addWatermark: "透かし",
    wmDefault: "社外秘",
    pageRange: "ページ範囲",
    addRedact: "黒塗り",
    redactHint: "黒塗りモード——ドラッグで範囲を黒塗り、または単語をクリックで自動枠。Escで終了。",
    redactBakeNote: "黒塗りを含むページはダウンロード時に画像化され、隠された文字は完全に破棄されます。",
    addPageNum: "ページ番号",
    startAt: "開始番号",
    insertBlank: "白紙ページ",
    insertPdf: "PDFを挿入",
    rotatePage: "ページを回転",
    deletePage: "ページを削除",
    addWhiteout: "上書き置換",
    whiteoutHint: "上書き置換モード——単語をクリックすると下地色のパッチで覆い、その上に入力できます。ドラッグでパッチを配置。元の文字は覆われるだけで(下に残ります)、編集はされません。Escで終了。",
  },
  de: {
    title: "PDF bearbeiten",
    subtitle: "Fügen Sie an beliebiger Stelle eines PDFs Text, Bilder, Rahmen, Hervorhebungen und Freihand-Notizen hinzu – ziehen Sie alles an die richtige Position und laden Sie das Ergebnis herunter. Läuft in Ihrem Browser; Ihre Datei verlässt Ihr Gerät nicht.",
    drop: "PDF hierher ziehen und ablegen oder zum Auswählen klicken",
    choose: "PDF auswählen",
    rendering: "Seiten werden gerendert…",
    addText: "Text",
    addImage: "Bild",
    addBox: "Rahmen",
    addHighlight: "Hervorheben",
    draw: "Zeichnen",
    hint: "Doppelklicken Sie auf eine Seite, um Text hinzuzufügen. Ziehen zum Verschieben, an einem Griff ziehen zum Skalieren, Doppelklick auf ein Textfeld zum Bearbeiten.",
    drawHint: "Zeichenmodus – ziehen Sie auf einer Seite, um zu zeichnen. Esc oder erneut auf Zeichnen klicken zum Beenden.",
    placeholder: "Hier tippen…",
    elements: (n: number) => `${n} Element${n === 1 ? "" : "e"}`,
    undo: "Rückgängig",
    redo: "Wiederholen",
    download: "PDF herunterladen",
    working: "PDF wird erstellt…",
    reset: "Neu beginnen",
    err: "Etwas ist schiefgelaufen: ",
    page: (n: number) => `Seite ${n}`,
    size: "Größe",
    color: "Farbe",
    bold: "Fett",
    fill: "Füllung",
    noFill: "Keine Füllung",
    stroke: "Rand",
    width: "Stärke",
    opacity: "Deckkraft",
    remove: "Entfernen",
    thumbsAria: "Seitennavigation",
    sign: "Signieren",
    signDraw: "Zeichnen",
    signType: "Tippen",
    signTypePlaceholder: "Namen eingeben…",
    signApply: "Auf Seite platzieren",
    signClear: "Löschen",
    cancel: "Abbrechen",
    addWatermark: "Wasserzeichen",
    wmDefault: "VERTRAULICH",
    pageRange: "Seiten",
    addRedact: "Schwärzen",
    redactHint: "Schwärzungsmodus – ziehen Sie, um einen Bereich zu schwärzen, oder klicken Sie auf ein Wort. Esc zum Beenden.",
    redactBakeNote: "Seiten mit Schwärzungen werden beim Download zu Bildern reduziert – der verdeckte Text wird wirklich zerstört.",
    addPageNum: "Seitenzahlen",
    startAt: "Beginnen bei",
    insertBlank: "Leere Seite",
    insertPdf: "PDF einfügen",
    rotatePage: "Seite drehen",
    deletePage: "Seite löschen",
    addWhiteout: "Abdecken & neu tippen",
    whiteoutHint: "Abdecken & neu tippen: Klicken Sie auf ein Wort, um es abzudecken und darüber zu tippen, oder ziehen Sie einen Deckflicken auf. Der Originaltext wird abgedeckt (bleibt darunter), nicht bearbeitet. Esc zum Beenden.",
  },
  ko: {
    title: "PDF 편집",
    subtitle: "PDF 어디에나 텍스트, 이미지, 상자, 형광펜, 손글씨 메모를 추가하세요 — 원하는 위치로 드래그한 뒤 결과를 다운로드하세요. 브라우저에서 실행되며, 파일은 기기를 벗어나지 않습니다.",
    drop: "여기에 PDF를 끌어다 놓거나 클릭해서 선택하세요",
    choose: "PDF 선택",
    rendering: "페이지를 렌더링하는 중…",
    addText: "텍스트",
    addImage: "이미지",
    addBox: "상자",
    addHighlight: "형광펜",
    draw: "그리기",
    hint: "페이지를 더블클릭해 텍스트를 추가하세요. 드래그로 이동, 핸들로 크기 조절, 텍스트 상자를 더블클릭하면 편집할 수 있습니다.",
    drawHint: "그리기 모드 — 페이지 위를 드래그해 그리세요. Esc를 누르거나 그리기를 다시 클릭하면 종료됩니다.",
    placeholder: "여기에 입력…",
    elements: (n: number) => `요소 ${n}개`,
    undo: "실행 취소",
    redo: "다시 실행",
    download: "PDF 다운로드",
    working: "PDF 생성 중…",
    reset: "다시 시작",
    err: "문제가 발생했습니다: ",
    page: (n: number) => `${n}페이지`,
    size: "크기",
    color: "색상",
    bold: "굵게",
    fill: "채우기",
    noFill: "채우기 없음",
    stroke: "테두리",
    width: "굵기",
    opacity: "불투명도",
    remove: "삭제",
    thumbsAria: "페이지 탐색",
    sign: "서명",
    signDraw: "그리기",
    signType: "입력",
    signTypePlaceholder: "이름을 입력하세요…",
    signApply: "페이지에 배치",
    signClear: "지우기",
    cancel: "취소",
    addWatermark: "워터마크",
    wmDefault: "대외비",
    pageRange: "페이지 범위",
    addRedact: "가리기",
    redactHint: "가리기 모드 — 드래그해 영역을 가리거나, 단어를 클릭해 자동으로 상자를 만드세요. Esc로 종료합니다.",
    redactBakeNote: "가림이 있는 페이지는 다운로드 시 이미지로 평탄화되어, 가려진 텍스트가 완전히 삭제됩니다.",
    addPageNum: "페이지 번호",
    startAt: "시작 번호",
    insertBlank: "빈 페이지",
    insertPdf: "PDF 삽입",
    rotatePage: "페이지 회전",
    deletePage: "페이지 삭제",
    addWhiteout: "덮고 다시 입력",
    whiteoutHint: "덮고 다시 입력 — 단어를 클릭하면 바탕색 패치로 덮고 위에 입력할 수 있습니다. 드래그로 패치를 배치하세요. 원본 텍스트는 편집되는 것이 아니라 덮일 뿐이며 아래에 남아 있습니다. Esc로 종료.",
  },
} satisfies AuthoredCopy<typeof STR_EN>;

export function EditPdfClient({ locale = "en", embedded = false }: { locale?: Locale; embedded?: boolean }) {
  const al: AuthoredLocale = locale === "zh-Hant" ? "en" : locale;
  const t = locale === "zh-Hant" ? deepHant(STR.zh) : STR[al];

  const [phase, setPhase] = useState<"idle" | "rendering" | "ready" | "working">("idle");
  const [error, setError] = useState<string | null>(null);
  const [inkMode, setInkMode] = useState(false);
  const [redactMode, setRedactMode] = useState(false);
  const [whiteoutMode, setWhiteoutMode] = useState(false);
  const [signOpen, setSignOpen] = useState(false);
  const [bakeDone, setBakeDone] = useState<{ done: number; total: number } | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [state, dispatch] = useReducer(editorReducer, initialEditorState);
  // Page infos derive from the editable page list (page management source).
  const pages = useMemo(() => state.pageList.map(pageInfoOf), [state.pageList]);

  const fileRef = useRef<File | null>(null);
  // Inserted-PDF sources: bytes for the bake, pdf.js docs for rasters.
  const extraSourcesRef = useRef<Record<string, ArrayBuffer>>({});
  const extraJsDocs = useRef<Map<string, { getPage: (n: number) => Promise<unknown>; destroy: () => Promise<void> }>>(new Map());
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pageInsertInputRef = useRef<HTMLInputElement>(null);
  const insertPdfAtRef = useRef(0);
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
    for (const d of extraJsDocs.current.values()) d.destroy().catch(() => {});
    extraJsDocs.current.clear();
    extraSourcesRef.current = {};
    visiblePages.current.clear();
    setError(null);
    setInkMode(false);
    setRedactMode(false);
    setPhase("idle");
    dispatch({ type: "reset" });
  }, []);

  useEffect(() => () => { docRef.current?.destroy().catch(() => {}); }, []);

  // Unsaved-work guard (A1 persistence decision: warn on close, no autosave).
  const dirty = state.elements.length > 0 || state.past.length > 0;
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const onFile = useCallback(async (file: File) => {
    if (!file || (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"))) return;
    setError(null);
    fileRef.current = file;
    setPhase("rendering");
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
      const refs: PageRef[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const vp = page.getViewport({ scale: 1 });
        refs.push({ src: { doc: "main", page: i - 1 }, rotate: 0, wPt: vp.width, hPt: vp.height });
      }
      docRef.current = doc as unknown as typeof docRef.current;
      dispatch({ type: "setPages", pageList: refs });
      setPhase("ready");
    } catch (e) {
      setError(encryptedPdfMessage(e, locale) ?? (t.err + (e instanceof Error ? e.message : String(e))));
      setPhase("idle");
    }
  }, [t, locale]);

  const stateRef = useRef(state);
  stateRef.current = state;
  const pagesRef = useRef(pages);
  pagesRef.current = pages;

  // Lazy per-page raster at the frame's real width (no display-scale constant).
  // targetWidth (CSS px) overrides for thumbnails, which render well below 1×.
  const renderBitmap = useCallback((pageIndex: number, targetWidth?: number): Promise<string | null> => {
    const job = renderChain.current.then(async () => {
      const ref = stateRef.current.pageList[pageIndex];
      if (!ref) return null;
      const containerW = targetWidth ?? viewerRef.current?.clientWidth ?? 800;
      const dpr = window.devicePixelRatio || 1;
      const finish = (canvas: HTMLCanvasElement) => {
        const url = canvas.toDataURL("image/jpeg", 0.85);
        canvas.width = 0;
        canvas.height = 0;
        return url;
      };
      if (!ref.src) {
        // Blank page — plain white ground.
        const scale = Math.min(3, Math.max(targetWidth ? 0.05 : 1, (containerW * dpr) / ref.wPt));
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(ref.wPt * scale);
        canvas.height = Math.ceil(ref.hPt * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return finish(canvas);
      }
      const doc = ref.src.doc === "main" ? docRef.current : extraJsDocs.current.get(ref.src.doc);
      if (!doc) return null;
      const page = (await doc.getPage(ref.src.page + 1)) as {
        rotate?: number;
        getViewport: (o: { scale: number; rotation?: number }) => { width: number; height: number };
        render: (o: unknown) => { promise: Promise<void> };
      };
      // pdf.js viewport rotation is ABSOLUTE — compose the source page's own
      // /Rotate with the user's extra page rotation.
      const rotation = (((page.rotate ?? 0) + ref.rotate) % 360 + 360) % 360;
      const base = page.getViewport({ scale: 1, rotation });
      const scale = Math.min(3, Math.max(targetWidth ? 0.05 : 1, (containerW * dpr) / base.width));
      const viewport = page.getViewport({ scale, rotation });
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      await page.render({ canvas, canvasContext: ctx, viewport }).promise;
      return finish(canvas);
    }).catch(() => null);
    renderChain.current = job;
    return job;
  }, []);

  const onVisibility = useCallback((pageIndex: number, visible: boolean) => {
    if (visible) visiblePages.current.add(pageIndex);
    else visiblePages.current.delete(pageIndex);
    // Topmost visible page drives the thumbnail-rail highlight (React bails
    // out when the value is unchanged, so scroll churn is cheap).
    if (visiblePages.current.size) setCurrentPage(Math.min(...visiblePages.current));
  }, []);

  const scrollRef = useRef<HTMLDivElement>(null);
  const jumpToPage = useCallback((idx: number) => {
    scrollRef.current
      ?.querySelector(`[data-page-frame="${idx}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const targetPage = () =>
    visiblePages.current.size ? Math.min(...visiblePages.current) : 0;

  // z is advisory — the reducer's "add" reassigns it against current state,
  // so stale closures (concurrent image loads) can't collide.
  const baseEl = (pageIndex: number, w: number, h: number, cx?: number, cy?: number) => ({
    id: crypto.randomUUID(),
    page: pageIndex,
    x: Math.min(Math.max((cx ?? 0.5) - w / 2, 0), Math.max(0, 1 - w)),
    y: Math.min(Math.max((cy ?? 0.4) - h / 2, 0), Math.max(0, 1 - h)),
    w,
    h,
    rotation: 0,
    z: 0,
  });

  const addText = useCallback((pageIndex: number, cx?: number, cy?: number) => {
    const page = pages[pageIndex];
    if (!page) return;
    const seed = { text: "", sizePt: DEFAULT_SIZE_PT, bold: false };
    const { w, h } = sizeTextElement(seed, page);
    const el: TextElement = {
      ...baseEl(pageIndex, w, h, cx, cy),
      type: "text",
      text: "",
      sizePt: DEFAULT_SIZE_PT,
      color: DEFAULT_TEXT_COLOR,
      bold: false,
    };
    dispatch({ type: "add", el });
    dispatch({ type: "edit", id: el.id });
  }, [pages]);

  const addShape = useCallback(() => {
    const el: EditorElement = {
      ...baseEl(targetPage(), 0.25, 0.12),
      type: "shape",
      fill: null,
      stroke: DEFAULT_SHAPE_STROKE,
      strokeWidthPt: DEFAULT_STROKE_WIDTH_PT,
      opacity: 1,
    };
    dispatch({ type: "add", el });
  }, []);

  const addHighlight = useCallback(() => {
    const el: EditorElement = {
      ...baseEl(targetPage(), 0.3, 0.035),
      type: "highlight",
      color: DEFAULT_HIGHLIGHT_COLOR,
      opacity: DEFAULT_HIGHLIGHT_OPACITY,
    };
    dispatch({ type: "add", el });
  }, []);

  const onImageFile = useCallback((file: File) => {
    const mime = file.type === "image/png" ? "image/png" : file.type === "image/jpeg" ? "image/jpeg" : null;
    if (!mime) return;
    // Capture the target page NOW — the user may scroll while the file loads.
    const pageIndex = targetPage();
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result);
      const img = new Image();
      img.onload = () => {
        const page = pages[pageIndex];
        if (!page) return;
        const ratio = img.naturalHeight / Math.max(1, img.naturalWidth);
        // Fit within 40% width AND 90% height, preserving aspect.
        let w = 0.4;
        let h = (w * ratio * page.wPt) / page.hPt;
        if (h > 0.9) {
          w *= 0.9 / h;
          h = 0.9;
        }
        const el: EditorElement = {
          ...baseEl(pageIndex, w, h),
          type: "image",
          src,
          mime,
          opacity: 1,
        };
        dispatch({ type: "add", el });
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }, [pages]);

  const addWatermark = useCallback(() => {
    const pageIndex = targetPage();
    const page = pages[pageIndex];
    if (!page) return;
    const seed = { text: t.wmDefault, sizePt: 36, bold: false };
    const { w, h } = sizeTextElement(seed, page);
    const el: EditorElement = {
      ...baseEl(pageIndex, w, h, 0.5, 0.5),
      type: "watermark",
      mode: "text",
      text: t.wmDefault,
      sizePt: 36,
      color: "#9ca3af",
      opacity: 0.35,
      rotation: -45, // reads bottom-left → top-right, the classic diagonal
      pageFrom: 0,
      pageTo: pages.length - 1,
    };
    dispatch({ type: "add", el });
  }, [pages, t]);

  const addPageNum = useCallback(() => {
    const pageIndex = targetPage();
    const page = pages[pageIndex];
    if (!page) return;
    const template = "{page} / {total}";
    const widest = template.replaceAll("{page}", String(pages.length)).replaceAll("{total}", String(pages.length));
    const { w, h } = sizeTextElement({ text: widest, sizePt: 11, bold: false }, page);
    const el: EditorElement = {
      ...baseEl(pageIndex, w, h, 0.5, 0.955),
      type: "pagenum",
      template,
      startAt: 1,
      sizePt: 11,
      color: "#374151",
      pageFrom: 0,
      pageTo: pages.length - 1,
    };
    dispatch({ type: "add", el });
  }, [pages]);

  // ── page management (ThumbRail actions) ──
  const pageKeyOf = (ref: PageRef, i: number) =>
    `${i}:${ref.src ? `${ref.src.doc}/${ref.src.page}` : "blank"}:${ref.rotate}`;

  const insertBlankAfter = useCallback((at: number) => {
    const nb = stateRef.current.pageList[at];
    dispatch({
      type: "insertPages",
      at: at + 1,
      refs: [{ src: null, rotate: 0, wPt: nb?.wPt ?? 612, hPt: nb?.hPt ?? 792 }],
    });
  }, []);

  const insertPdfAfter = useCallback(async (at: number, file: File) => {
    try {
      const bytes = await file.arrayBuffer();
      const id = crypto.randomUUID();
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const doc = await pdfjs.getDocument({ data: new Uint8Array(bytes.slice(0)) }).promise;
      const refs: PageRef[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const vp = (await doc.getPage(i)).getViewport({ scale: 1 });
        refs.push({ src: { doc: id, page: i - 1 }, rotate: 0, wPt: vp.width, hPt: vp.height });
      }
      extraSourcesRef.current[id] = bytes;
      extraJsDocs.current.set(id, doc as unknown as { getPage: (n: number) => Promise<unknown>; destroy: () => Promise<void> });
      dispatch({ type: "insertPages", at: at + 1, refs });
    } catch (e) {
      setError(encryptedPdfMessage(e, locale) ?? (t.err + (e instanceof Error ? e.message : String(e))));
    }
  }, [t, locale]);

  const onRedactRect = useCallback((pageIndex: number, rect: { x: number; y: number; w: number; h: number }) => {
    if (rect.w < 0.002 || rect.h < 0.002) return;
    const el: EditorElement = {
      id: crypto.randomUUID(),
      type: "redact",
      page: pageIndex,
      ...rect,
      rotation: 0,
      z: 0, // reassigned by the reducer
    };
    dispatch({ type: "add", el });
  }, []);

  // Locate the WORD under a normalized point: find the text run via
  // pdfjs Util.transform, estimate the word's span by character share
  // (generalizes RedactPdfClient's box math to click-to-box). Returns a
  // normalized box + the glyph height in pt, or null (scanned page / miss).
  const locateWordAt = useCallback(async (pageIndex: number, nx: number, ny: number): Promise<{ x: number; y: number; w: number; h: number; glyphHPt: number } | null> => {
    const ref = stateRef.current.pageList[pageIndex];
    if (!ref?.src) return null;
    const doc = ref.src.doc === "main" ? docRef.current : extraJsDocs.current.get(ref.src.doc);
    if (!doc) return null;
    try {
      const pdfjs = await import("pdfjs-dist");
      const page = (await doc.getPage(ref.src.page + 1)) as {
        rotate?: number;
        getViewport: (o: { scale: number; rotation?: number }) => { transform: number[]; width: number; height: number };
        getTextContent: () => Promise<{ items: Array<{ str?: string; width?: number; height?: number; transform?: number[] }> }>;
      };
      const rotation = (((page.rotate ?? 0) + ref.rotate) % 360 + 360) % 360;
      const vp = page.getViewport({ scale: 1, rotation });
      const tc = await page.getTextContent();
      const px = nx * vp.width;
      const py = ny * vp.height;
      for (const it of tc.items) {
        if (typeof it.str !== "string" || !it.str.trim()) continue;
        const dm = pdfjs.Util.transform(vp.transform, it.transform ?? [1, 0, 0, 1, 0, 0]);
        const sx = Math.hypot(dm[0], dm[1]);
        const sy = Math.hypot(dm[2], dm[3]);
        const w = (it.width ?? 0) * sx;
        const h = (it.height ?? 0) * sy;
        const x0 = dm[4];
        const yTop = dm[5] - h;
        if (px < x0 || px > x0 + w || py < yTop || py > yTop + h) continue;
        const str = it.str;
        const rel = (px - x0) / Math.max(w, 1e-6);
        let ws = 0;
        let we = str.length;
        const hitIdx = Math.min(str.length - 1, Math.max(0, Math.floor(rel * str.length)));
        if (str[hitIdx] !== " ") {
          ws = str.lastIndexOf(" ", hitIdx) + 1;
          const nextSpace = str.indexOf(" ", hitIdx);
          we = nextSpace === -1 ? str.length : nextSpace;
        }
        const bx = x0 + (ws / str.length) * w;
        const bw = ((we - ws) / str.length) * w;
        return {
          x: bx / vp.width,
          y: yTop / vp.height,
          w: bw / vp.width,
          h: h / vp.height,
          glyphHPt: h,
        };
      }
    } catch { /* text layer optional */ }
    return null;
  }, []);

  const onRedactTap = useCallback(async (pageIndex: number, nx: number, ny: number) => {
    const word = await locateWordAt(pageIndex, nx, ny);
    const info = pages[pageIndex];
    if (!word || !info) return;
    const padX = (word.glyphHPt * 0.22) / info.wPt;
    const padY = (word.glyphHPt * 0.22) / info.hPt;
    onRedactRect(pageIndex, {
      x: Math.max(0, word.x - padX),
      y: Math.max(0, word.y - padY),
      w: Math.min(1, word.w + 2 * padX),
      h: Math.min(1, word.h + 2 * padY),
    });
  }, [locateWordAt, pages, onRedactRect]);

  const onWhiteoutRect = useCallback((pageIndex: number, rect: { x: number; y: number; w: number; h: number }, color: string) => {
    if (rect.w < 0.002 || rect.h < 0.002) return;
    const el: EditorElement = {
      id: crypto.randomUUID(),
      type: "whiteout",
      page: pageIndex,
      ...rect,
      rotation: 0,
      z: 0, // reassigned by the reducer
      color,
    };
    dispatch({ type: "add", el });
  }, []);

  // Cover-and-retype: patch over the word, then a focused text box on top.
  const onWhiteoutTap = useCallback(async (pageIndex: number, nx: number, ny: number, color: string) => {
    const word = await locateWordAt(pageIndex, nx, ny);
    const info = pages[pageIndex];
    if (!word || !info) return;
    const padX = (word.glyphHPt * 0.15) / info.wPt;
    const padY = (word.glyphHPt * 0.15) / info.hPt;
    onWhiteoutRect(pageIndex, {
      x: Math.max(0, word.x - padX),
      y: Math.max(0, word.y - padY),
      w: Math.min(1, word.w + 2 * padX),
      h: Math.min(1, word.h + 2 * padY),
    }, color);
    const sizePt = Math.max(MIN_SIZE_PT, Math.round(word.glyphHPt * 0.8));
    const sized = sizeTextElement({ text: "", sizePt, bold: false }, info);
    const textEl: EditorElement = {
      id: crypto.randomUUID(),
      type: "text",
      page: pageIndex,
      x: word.x,
      y: word.y,
      w: sized.w,
      h: sized.h,
      rotation: 0,
      z: 0, // reassigned by the reducer
      text: "",
      sizePt,
      color: DEFAULT_TEXT_COLOR,
      bold: false,
    };
    dispatch({ type: "add", el: textEl });
    dispatch({ type: "edit", id: textEl.id });
  }, [locateWordAt, pages, onWhiteoutRect]);

  const addSignature = useCallback((src: string, imgRatio: number) => {
    const pageIndex = targetPage();
    const page = pages[pageIndex];
    if (!page) return;
    const w = 0.25;
    const h = Math.min((w * imgRatio * page.wPt) / page.hPt, 0.9);
    const el: EditorElement = {
      ...baseEl(pageIndex, w, h),
      type: "signature",
      src,
      opacity: 1,
    };
    dispatch({ type: "add", el });
    setSignOpen(false);
  }, [pages]);

  const onInkStroke = useCallback((pageIndex: number, points: Array<[number, number]>) => {
    const page = pages[pageIndex];
    if (!page) return;
    const b = inkBounds(points, DEFAULT_STROKE_WIDTH_PT, page);
    const el: EditorElement = {
      id: crypto.randomUUID(),
      type: "ink",
      page: pageIndex,
      x: b.x,
      y: b.y,
      w: b.w,
      h: b.h,
      rotation: 0,
      z: 0, // reassigned by the reducer
      points: b.points,
      color: DEFAULT_INK_COLOR,
      strokeWidthPt: DEFAULT_STROKE_WIDTH_PT,
    };
    dispatch({ type: "add", el });
  }, [pages]);

  // Keyboard: delete / nudge / undo / redo (skipped while typing in the box).
  const inkModeRef = useRef(inkMode);
  inkModeRef.current = inkMode;
  const redactModeRef = useRef(redactMode);
  redactModeRef.current = redactMode;
  const whiteoutModeRef = useRef(whiteoutMode);
  whiteoutModeRef.current = whiteoutMode;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = stateRef.current;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "TEXTAREA" || tag === "INPUT" || s.editingId) return;
      if (e.key === "Escape" && redactModeRef.current) { setRedactMode(false); return; }
      if (e.key === "Escape" && whiteoutModeRef.current) { setWhiteoutMode(false); return; }
      if (e.key === "Escape" && inkModeRef.current) { setInkMode(false); return; }
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
    setBakeDone({ done: 0, total: state.elements.length });
    try {
      const bytes = await bakePdf(
        await file.arrayBuffer(),
        pages,
        state.elements,
        (done, total) => setBakeDone({ done, total }),
        state.pageList,
        extraSourcesRef.current,
      );
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
    } finally {
      setBakeDone(null);
    }
  }, [pages, state.elements, state.pageList, t, locale]);

  const selected = state.elements.find((el) => el.id === state.selectedId) ?? null;

  const iconBtn =
    "flex h-8 w-8 items-center justify-center rounded-[var(--radius)] border border-[color:var(--line)] text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)] disabled:opacity-35 disabled:hover:border-[color:var(--line)]";
  const toolBtn =
    "rounded-[var(--radius)] border border-[color:var(--line)] px-3 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]";

  // Editing states trade the hero header for editor real estate — the shell
  // is viewport-fixed with its own scroll regions (thumbnail rail + canvas).
  // Embedded (workspace main area): idle keeps the standard max-w-3xl upload
  // column; editing goes full-width — the editor-app layout needs the room.
  const editing = phase === "ready" || phase === "working";

  return (
    <div className={embedded ? (editing ? "w-full px-2 pb-6 pt-2" : "mx-auto w-full max-w-3xl px-8 pb-10 pt-4") : `mx-auto ${LAYOUT.content} px-5 sm:px-6 ${editing ? "pb-6 pt-6" : "pb-16 pt-12 sm:pb-20 sm:pt-16"}`}>
      {!embedded && !editing && <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{t.title}</h1>}
      {!editing && <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.subtitle}</p>}

      {phase === "idle" || phase === "rendering" ? (
        <UploadDropzone locale={locale} buttonLabel={t.choose} busy={phase === "rendering"} busyLabel={t.rendering} onFile={onFile} constrained={embedded} valueZone="client" />
      ) : (
        <div className="flex gap-3" style={{ height: embedded ? "calc(100dvh - 13rem)" : "calc(100dvh - 10.5rem)", minHeight: 480 }}>
          {/* Left: page-thumbnail navigation (own scroll; hidden on mobile) */}
          <ThumbRail
            pages={pages}
            pageKeys={state.pageList.map(pageKeyOf)}
            currentPage={currentPage}
            onJump={jumpToPage}
            renderBitmap={renderBitmap}
            labels={{
              aria: t.thumbsAria,
              insertBlank: t.insertBlank,
              insertPdf: t.insertPdf,
              rotatePage: t.rotatePage,
              deletePage: t.deletePage,
              pageLabel: t.page,
            }}
            onInsertBlank={insertBlankAfter}
            onInsertPdf={(at) => { insertPdfAtRef.current = at; pageInsertInputRef.current?.click(); }}
            onRotatePage={(i) => dispatch({ type: "rotatePage", at: i })}
            onDeletePage={(i) => dispatch({ type: "removePage", at: i })}
            onMovePage={(from, to) => dispatch({ type: "movePage", from, to })}
          />

          {/* Right: toolbar pinned at top, canvas scrolls beneath it */}
          <div className="flex min-w-0 flex-1 flex-col">
          <div className="rounded-[12px] border border-[color:var(--line)] bg-[color:var(--surface-raised)] px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
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
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <button type="button" aria-label={t.undo} title={t.undo} onClick={() => dispatch({ type: "undo" })} disabled={state.past.length === 0 || phase === "working"} className={iconBtn}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M6 3L2.5 6.5 6 10M3 6.5h7a3.5 3.5 0 010 7H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button type="button" aria-label={t.redo} title={t.redo} onClick={() => dispatch({ type: "redo" })} disabled={state.future.length === 0 || phase === "working"} className={iconBtn}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M10 3l3.5 3.5L10 10M13 6.5H6a3.5 3.5 0 000 7h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <span className="h-5 w-px bg-[color:var(--line)]" aria-hidden="true" />
                <button type="button" onClick={() => addText(targetPage())} className={toolBtn}>{t.addText}</button>
                <button type="button" onClick={() => imageInputRef.current?.click()} className={toolBtn}>{t.addImage}</button>
                <button type="button" onClick={addShape} className={toolBtn}>{t.addBox}</button>
                <button type="button" onClick={addHighlight} className={toolBtn}>{t.addHighlight}</button>
                <button type="button" onClick={addWatermark} className={toolBtn}>{t.addWatermark}</button>
                <button type="button" onClick={addPageNum} className={toolBtn}>{t.addPageNum}</button>
                <button
                  type="button"
                  onClick={() => setSignOpen((v) => !v)}
                  aria-pressed={signOpen}
                  className={
                    signOpen
                      ? "rounded-[var(--radius)] border border-[color:var(--accent)] bg-[rgba(62,207,142,0.12)] px-3 py-2 text-[13px] font-medium text-[color:var(--accent)]"
                      : toolBtn
                  }
                >
                  {t.sign}
                </button>
                <button
                  type="button"
                  onClick={() => { setInkMode((v) => !v); setRedactMode(false); setWhiteoutMode(false); }}
                  aria-pressed={inkMode}
                  className={
                    inkMode
                      ? "rounded-[var(--radius)] border border-[color:var(--accent)] bg-[rgba(62,207,142,0.12)] px-3 py-2 text-[13px] font-medium text-[color:var(--accent)]"
                      : toolBtn
                  }
                >
                  {t.draw}
                </button>
                <button
                  type="button"
                  onClick={() => { setRedactMode((v) => !v); setInkMode(false); setWhiteoutMode(false); setSignOpen(false); }}
                  aria-pressed={redactMode}
                  className={
                    redactMode
                      ? "rounded-[var(--radius)] border border-[color:var(--accent)] bg-[rgba(62,207,142,0.12)] px-3 py-2 text-[13px] font-medium text-[color:var(--accent)]"
                      : toolBtn
                  }
                >
                  {t.addRedact}
                </button>
                <button
                  type="button"
                  onClick={() => { setWhiteoutMode((v) => !v); setInkMode(false); setRedactMode(false); setSignOpen(false); }}
                  aria-pressed={whiteoutMode}
                  className={
                    whiteoutMode
                      ? "rounded-[var(--radius)] border border-[color:var(--accent)] bg-[rgba(62,207,142,0.12)] px-3 py-2 text-[13px] font-medium text-[color:var(--accent)]"
                      : toolBtn
                  }
                >
                  {t.addWhiteout}
                </button>
                <span className="h-5 w-px bg-[color:var(--line)]" aria-hidden="true" />
                <button type="button" onClick={download} disabled={phase === "working" || state.elements.length === 0}
                  className="rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
                  {phase === "working"
                    ? bakeDone && bakeDone.total > 1
                      ? `${t.working} ${Math.min(bakeDone.done + 1, bakeDone.total)}/${bakeDone.total}`
                      : t.working
                    : t.download}
                </button>
              </div>
            </div>

            {signOpen && (
              <SignaturePanel
                t={{ draw: t.signDraw, type: t.signType, typePlaceholder: t.signTypePlaceholder, clear: t.signClear, apply: t.signApply, cancel: t.cancel }}
                onApply={addSignature}
                onCancel={() => setSignOpen(false)}
              />
            )}
            {selected && !inkMode && !redactMode && !whiteoutMode && !signOpen && (
              <PropertyPanel el={selected} pages={pages} dispatch={dispatch} t={t} />
            )}
          </div>
          <p className="mt-2 shrink-0 text-[12px] text-[color:var(--faint)]">
            {whiteoutMode ? t.whiteoutHint : redactMode ? t.redactHint : inkMode ? t.drawHint : t.hint}
            {state.elements.some((el) => el.type === "redact") && (
              <span className="ml-2 text-[#fbbf24]">{t.redactBakeNote}</span>
            )}
          </p>

          <input
            ref={imageInputRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onImageFile(f);
              e.target.value = "";
            }}
          />
          <input
            ref={pageInsertInputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void insertPdfAfter(insertPdfAtRef.current, f);
              e.target.value = "";
            }}
          />

          <div ref={scrollRef} className="isolate mt-3 min-h-0 flex-1 overflow-y-auto">
            <div ref={viewerRef} className="mx-auto w-full max-w-3xl space-y-4 pb-6">
              {pages.map((pg) => (
                <PageCanvas
                  key={pageKeyOf(state.pageList[pg.index], pg.index)}
                  page={pg}
                  elements={state.elements.filter((el) => elementPages(el, pages.length).includes(pg.index))}
                  selectedId={state.selectedId}
                  editingId={state.editingId}
                  dispatch={dispatch}
                  renderBitmap={renderBitmap}
                  onVisibility={onVisibility}
                  onAddTextAt={addText}
                  inkMode={inkMode}
                  inkStyle={{ color: DEFAULT_INK_COLOR, strokeWidthPt: DEFAULT_STROKE_WIDTH_PT }}
                  onInkStroke={onInkStroke}
                  redactMode={redactMode}
                  onRedactRect={onRedactRect}
                  onRedactTap={onRedactTap}
                  whiteoutMode={whiteoutMode}
                  onWhiteoutRect={onWhiteoutRect}
                  onWhiteoutTap={onWhiteoutTap}
                  pageLabel={t.page(pg.index + 1)}
                  editPlaceholder={t.placeholder}
                  removeLabel={t.remove}
                />
              ))}
            </div>
          </div>
          </div>
        </div>
      )}

      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}
    </div>
  );
}

// ── Property panel ────────────────────────────────────────────────────────────
// Each control snapshots history when the interaction starts (focus /
// pointerdown; the reducer dedups repeats) and streams transient updates, so
// one slider drag = one undo step. Labels come from the shared STR table.

function PropertyPanel({
  el,
  pages,
  dispatch,
  t,
}: {
  el: EditorElement;
  pages: PageInfo[];
  dispatch: React.Dispatch<import("./editor-store").EditorAction>;
  t: typeof STR_EN;
}) {
  const snap = () => dispatch({ type: "snapshot" });
  const patch = (p: Partial<EditorElement>) =>
    dispatch({ type: "update", id: el.id, transient: true, patch: p });

  const label = "flex items-center gap-1.5 text-[12px] text-[color:var(--muted)]";
  const focusRing =
    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--accent)]";
  const colorInput =
    `h-7 w-9 cursor-pointer rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-transparent p-0.5 ${focusRing}`;
  const numInput =
    `h-7 w-14 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-1.5 text-[12.5px] text-[color:var(--foreground)] ${focusRing}`;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[color:var(--line)] pt-3">
      {el.type === "text" && (
        <>
          <label className={label}>
            {t.size}
            <input
              type="number"
              min={MIN_SIZE_PT}
              max={MAX_SIZE_PT}
              value={Math.round(el.sizePt)}
              onFocus={snap}
              onChange={(e) => {
                const sizePt = Math.min(MAX_SIZE_PT, Math.max(MIN_SIZE_PT, Number(e.target.value) || MIN_SIZE_PT));
                const page = pages[el.page];
                const sized = page ? sizeTextElement({ text: el.text, sizePt, bold: el.bold }, page) : null;
                patch(sized ? { sizePt, w: sized.w, h: sized.h } : { sizePt });
              }}
              className={numInput}
            />
          </label>
          <label className={label}>
            {t.color}
            <input type="color" value={el.color} onFocus={snap} onChange={(e) => patch({ color: e.target.value })} className={colorInput} />
          </label>
          <button
            type="button"
            aria-pressed={el.bold}
            onClick={() => {
              snap();
              const page = pages[el.page];
              const bold = !el.bold;
              const sized = page ? sizeTextElement({ text: el.text, sizePt: el.sizePt, bold }, page) : null;
              patch(sized ? { bold, w: sized.w, h: sized.h } : { bold });
            }}
            className={`rounded-[var(--radius-sm)] border px-2.5 py-1 text-[12.5px] font-semibold transition ${el.bold ? "border-[color:var(--accent)] text-[color:var(--accent)]" : "border-[color:var(--line)] text-[color:var(--muted)] hover:border-[color:var(--line-strong)]"}`}
          >
            {t.bold}
          </button>
        </>
      )}

      {(el.type === "image" || el.type === "signature") && (
        <label className={label}>
          {t.opacity}
          <input type="range" min={0.1} max={1} step={0.05} value={el.opacity} onPointerDown={snap} onChange={(e) => patch({ opacity: Number(e.target.value) })} className="w-28 accent-[color:var(--accent)]" />
        </label>
      )}

      {el.type === "pagenum" && (
        <>
          <input
            type="text"
            value={el.template}
            onFocus={snap}
            onChange={(e) => {
              const template = e.target.value;
              const page = pages[el.page];
              const widest = template
                .replaceAll("{page}", String(el.startAt + Math.abs(el.pageTo - el.pageFrom)))
                .replaceAll("{total}", String(Math.abs(el.pageTo - el.pageFrom) + 1));
              const sized = page ? sizeTextElement({ text: widest, sizePt: el.sizePt, bold: false }, page) : null;
              patch(sized ? ({ template, w: sized.w, h: sized.h } as Partial<EditorElement>) : ({ template } as Partial<EditorElement>));
            }}
            className={`${numInput} w-36 font-mono`}
            title="{page} {total}"
          />
          <label className={label}>
            {t.startAt}
            <input
              type="number"
              min={1}
              value={el.startAt}
              onFocus={snap}
              onChange={(e) => patch({ startAt: Math.max(1, Number(e.target.value) || 1) } as Partial<EditorElement>)}
              className={`${numInput} w-14`}
            />
          </label>
          <label className={label}>
            {t.size}
            <input
              type="number"
              min={MIN_SIZE_PT}
              max={MAX_SIZE_PT}
              value={Math.round(el.sizePt)}
              onFocus={snap}
              onChange={(e) => {
                const sizePt = Math.min(MAX_SIZE_PT, Math.max(MIN_SIZE_PT, Number(e.target.value) || MIN_SIZE_PT));
                patch({ sizePt } as Partial<EditorElement>);
              }}
              className={numInput}
            />
          </label>
          <label className={label}>
            {t.color}
            <input type="color" value={el.color} onFocus={snap} onChange={(e) => patch({ color: e.target.value } as Partial<EditorElement>)} className={colorInput} />
          </label>
          <label className={label}>
            {t.pageRange}
            <input
              type="number"
              min={1}
              max={pages.length}
              value={Math.min(el.pageFrom, el.pageTo) + 1}
              onFocus={snap}
              onChange={(e) => patch({ pageFrom: Math.min(pages.length, Math.max(1, Number(e.target.value) || 1)) - 1 } as Partial<EditorElement>)}
              className={`${numInput} w-14`}
            />
            <span className="text-[color:var(--faint)]">–</span>
            <input
              type="number"
              min={1}
              max={pages.length}
              value={Math.max(el.pageFrom, el.pageTo) + 1}
              onFocus={snap}
              onChange={(e) => patch({ pageTo: Math.min(pages.length, Math.max(1, Number(e.target.value) || pages.length)) - 1 } as Partial<EditorElement>)}
              className={`${numInput} w-14`}
            />
          </label>
        </>
      )}

      {el.type === "whiteout" && (
        <label className={label}>
          {t.color}
          <input type="color" value={el.color} onFocus={snap} onChange={(e) => patch({ color: e.target.value } as Partial<EditorElement>)} className={colorInput} />
        </label>
      )}

      {el.type === "watermark" && (
        <>
          {el.mode === "text" && (
            <>
              <input
                type="text"
                value={el.text}
                onFocus={snap}
                onChange={(e) => {
                  const text = e.target.value;
                  const page = pages[el.page];
                  const sized = page ? sizeTextElement({ text, sizePt: el.sizePt, bold: false }, page) : null;
                  patch(sized ? { text, w: sized.w, h: sized.h } : { text });
                }}
                className={`${numInput} w-40`}
              />
              <label className={label}>
                {t.size}
                <input
                  type="number"
                  min={MIN_SIZE_PT}
                  max={MAX_SIZE_PT}
                  value={Math.round(el.sizePt)}
                  onFocus={snap}
                  onChange={(e) => {
                    const sizePt = Math.min(MAX_SIZE_PT, Math.max(MIN_SIZE_PT, Number(e.target.value) || MIN_SIZE_PT));
                    const page = pages[el.page];
                    const sized = page ? sizeTextElement({ text: el.text, sizePt, bold: false }, page) : null;
                    patch(sized ? { sizePt, w: sized.w, h: sized.h } : { sizePt });
                  }}
                  className={numInput}
                />
              </label>
              <label className={label}>
                {t.color}
                <input type="color" value={el.color} onFocus={snap} onChange={(e) => patch({ color: e.target.value })} className={colorInput} />
              </label>
            </>
          )}
          <label className={label}>
            {t.opacity}
            <input type="range" min={0.05} max={1} step={0.05} value={el.opacity} onPointerDown={snap} onChange={(e) => patch({ opacity: Number(e.target.value) })} className="w-28 accent-[color:var(--accent)]" />
          </label>
          <label className={label}>
            {t.pageRange}
            <input
              type="number"
              min={1}
              max={pages.length}
              value={Math.min(el.pageFrom, el.pageTo) + 1}
              onFocus={snap}
              onChange={(e) => patch({ pageFrom: Math.min(pages.length, Math.max(1, Number(e.target.value) || 1)) - 1 })}
              className={`${numInput} w-14`}
            />
            <span className="text-[color:var(--faint)]">–</span>
            <input
              type="number"
              min={1}
              max={pages.length}
              value={Math.max(el.pageFrom, el.pageTo) + 1}
              onFocus={snap}
              onChange={(e) => patch({ pageTo: Math.min(pages.length, Math.max(1, Number(e.target.value) || pages.length)) - 1 })}
              className={`${numInput} w-14`}
            />
          </label>
        </>
      )}

      {el.type === "shape" && (
        <>
          <label className={label}>
            {t.stroke}
            <input type="color" value={el.stroke ?? "#ef4444"} onFocus={snap} onChange={(e) => patch({ stroke: e.target.value })} className={colorInput} />
          </label>
          <label className={label}>
            {t.width}
            <input
              type="number"
              min={0.5}
              max={12}
              step={0.5}
              value={el.strokeWidthPt}
              onFocus={snap}
              onChange={(e) => patch({ strokeWidthPt: Math.min(12, Math.max(0.5, Number(e.target.value) || 1)) })}
              className={numInput}
            />
          </label>
          <label className={label}>
            {t.fill}
            <input type="color" value={el.fill ?? "#ffffff"} onFocus={snap} onChange={(e) => patch({ fill: e.target.value })} className={colorInput} />
            <button
              type="button"
              onClick={() => { snap(); patch({ fill: el.fill ? null : "#ffffff" }); }}
              className={`rounded-[var(--radius-sm)] border px-2 py-1 text-[11.5px] transition ${el.fill ? "border-[color:var(--line)] text-[color:var(--muted)] hover:border-[color:var(--line-strong)]" : "border-[color:var(--accent)] text-[color:var(--accent)]"}`}
            >
              {t.noFill}
            </button>
          </label>
          <label className={label}>
            {t.opacity}
            <input type="range" min={0.1} max={1} step={0.05} value={el.opacity} onPointerDown={snap} onChange={(e) => patch({ opacity: Number(e.target.value) })} className="w-28 accent-[color:var(--accent)]" />
          </label>
        </>
      )}

      {el.type === "highlight" && (
        <>
          <span className={label}>
            {t.color}
            <span className="flex gap-1.5">
              {HIGHLIGHT_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={c}
                  onClick={() => { snap(); patch({ color: c }); }}
                  className="h-6 w-6 rounded-[var(--radius-sm)] border"
                  style={{ background: c, borderColor: el.color === c ? "var(--accent)" : "var(--line)", borderWidth: el.color === c ? 2 : 1 }}
                />
              ))}
            </span>
            <input type="color" value={el.color} onFocus={snap} onChange={(e) => patch({ color: e.target.value })} className={colorInput} />
          </span>
          <label className={label}>
            {t.opacity}
            <input type="range" min={0.15} max={0.8} step={0.05} value={el.opacity} onPointerDown={snap} onChange={(e) => patch({ opacity: Number(e.target.value) })} className="w-28 accent-[color:var(--accent)]" />
          </label>
        </>
      )}

      {el.type === "ink" && (
        <>
          <label className={label}>
            {t.color}
            <input type="color" value={el.color} onFocus={snap} onChange={(e) => patch({ color: e.target.value })} className={colorInput} />
          </label>
          <label className={label}>
            {t.width}
            <input
              type="number"
              min={0.5}
              max={12}
              step={0.5}
              value={el.strokeWidthPt}
              onFocus={snap}
              onChange={(e) => patch({ strokeWidthPt: Math.min(12, Math.max(0.5, Number(e.target.value) || 1)) })}
              className={numInput}
            />
          </label>
        </>
      )}
    </div>
  );
}
