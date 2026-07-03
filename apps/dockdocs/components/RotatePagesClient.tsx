"use client";

import { ToolFaq } from "@/components/ToolFaq";
import { ToolSections, type ToolSectionsContent } from "@/components/ToolSections";
import { UploadDropzone } from "@/components/UploadDropzone";
import { WorkArea } from "@/components/WorkArea";
import { PageCard } from "@/components/PageCard";
import { CircularProgress } from "../../../shared/templates/pdf-tool-page/workflow-engine-components";
import { encryptedPdfMessage } from "@/lib/pdf-errors";

import { useCallback, useRef, useState } from "react";
import { ToolBridge } from "../../../shared/templates/pdf-tool-page/ToolBridge";
import { deepHant, toHant } from "@/lib/zh-hant";
import { trackToolRun } from "@/lib/track";
import type { RouteLocale, AuthoredLocale, AuthoredCopy } from "@/lib/i18n";
import { LAYOUT } from "@/lib/layout-constants";

type Locale = RouteLocale;
type Pg = { idx: number; thumb: string; w: number; h: number };

const _en = {
    title: "Rotate Pages",
    subtitle: "Upload a PDF and click a page to rotate it — watch it turn before you download. Fix sideways scans and landscape pages in your browser.",
    drop: "Drag & drop a PDF here, or click to choose",
    choose: "Choose PDF", rendering: "Rendering pages…",
    hint: "Click a page to rotate it 90°. Keep clicking to keep turning.",
    rotateAll: "Rotate all 90°", apply: "Apply & download", working: "Building PDF…",
    reset: "Start over", none: "No rotations yet — click a page.", err: "Something went wrong: ",
};

const STR = {
  en: _en,
  zh: {
    title: "PDF 页面旋转",
    subtitle: "上传 PDF，点击页面即可旋转——下载前先看它转好。在浏览器里修正横放的扫描件和页面。",
    drop: "把 PDF 拖到这里，或点击选择",
    choose: "选择 PDF", rendering: "正在渲染页面…",
    hint: "点击页面旋转 90°，连续点继续转。",
    rotateAll: "全部旋转 90°", apply: "应用并下载", working: "正在生成 PDF…",
    reset: "重新开始", none: "还没有旋转——点击某页试试。", err: "出错了：",
  },
  es: {
    title: "Rotar páginas",
    subtitle: "Sube un PDF y haz clic en una página para rotarla: mírala girar antes de descargarla. Corrige escaneos torcidos y páginas horizontales en tu navegador.",
    drop: "Arrastra y suelta un PDF aquí, o haz clic para elegir",
    choose: "Elegir PDF", rendering: "Procesando páginas…",
    hint: "Haz clic en una página para rotarla 90°. Sigue haciendo clic para seguir girando.",
    rotateAll: "Rotar todo 90°", apply: "Aplicar y descargar", working: "Generando PDF…",
    reset: "Empezar de nuevo", none: "Aún no hay rotaciones: haz clic en una página.", err: "Algo salió mal: ",
  },
  pt: {
    title: "Girar páginas",
    subtitle: "Envie um PDF e clique em uma página para girá-la: veja-a girar antes de baixar. Corrija digitalizações tortas e páginas horizontais no seu navegador.",
    drop: "Arraste e solte um PDF aqui, ou clique para escolher",
    choose: "Escolher PDF", rendering: "Processando páginas…",
    hint: "Clique em uma página para girá-la 90°. Continue clicando para continuar girando.",
    rotateAll: "Girar tudo 90°", apply: "Aplicar e baixar", working: "Gerando PDF…",
    reset: "Recomeçar", none: "Nenhuma rotação ainda — clique em uma página.", err: "Algo deu errado: ",
  },
  fr: {
    title: "Faire pivoter des pages",
    subtitle: "Importez un PDF et cliquez sur une page pour la faire pivoter — visualisez la rotation avant de télécharger. Corrigez les numérisations de travers et les pages en paysage directement dans votre navigateur.",
    drop: "Glissez-déposez un PDF ici, ou cliquez pour choisir",
    choose: "Choisir un PDF", rendering: "Rendu des pages en cours…",
    hint: "Cliquez sur une page pour la faire pivoter de 90°. Cliquez à nouveau pour continuer.",
    rotateAll: "Tout pivoter de 90°", apply: "Appliquer et télécharger", working: "Génération du PDF…",
    reset: "Recommencer", none: "Aucune rotation pour l'instant — cliquez sur une page.", err: "Une erreur est survenue : ",
  },
  ja: {
    title: "ページを回転",
    subtitle: "PDFをアップロードし、ページをクリックして回転——ダウンロード前に回転の様子を確認できます。横向きのスキャンや横長ページをブラウザ内で修正します。",
    drop: "ここにPDFをドラッグ＆ドロップ、またはクリックして選択",
    choose: "PDFを選択", rendering: "ページを描画中…",
    hint: "ページをクリックすると90°回転します。クリックを続けると回り続けます。",
    rotateAll: "すべて90°回転", apply: "適用してダウンロード", working: "PDFを生成中…",
    reset: "最初からやり直す", none: "まだ回転していません——ページをクリックしてください。", err: "問題が発生しました: ",
  },
  de: {
    title: "Seiten drehen",
    subtitle: "Laden Sie ein PDF hoch und klicken Sie auf eine Seite, um sie zu drehen – sehen Sie zu, wie sie sich dreht, bevor Sie herunterladen. Richten Sie seitliche Scans und Querformatseiten direkt in Ihrem Browser gerade.",
    drop: "Ziehen Sie ein PDF hierher oder klicken Sie zum Auswählen",
    choose: "PDF auswählen", rendering: "Seiten werden gerendert…",
    hint: "Klicken Sie auf eine Seite, um sie um 90° zu drehen. Klicken Sie weiter, um weiterzudrehen.",
    rotateAll: "Alle um 90° drehen", apply: "Anwenden & herunterladen", working: "PDF wird erstellt…",
    reset: "Neu beginnen", none: "Noch keine Drehungen – klicken Sie auf eine Seite.", err: "Etwas ist schiefgelaufen: ",
  },
  ko: {
    title: "페이지 회전",
    subtitle: "PDF를 업로드하고 페이지를 클릭해 회전하세요 — 다운로드하기 전에 돌아가는 모습을 확인할 수 있습니다. 옆으로 누운 스캔본과 가로 페이지를 브라우저에서 바로잡으세요.",
    drop: "여기에 PDF를 끌어다 놓거나 클릭해서 선택하세요",
    choose: "PDF 선택", rendering: "페이지를 렌더링하는 중…",
    hint: "페이지를 클릭하면 90° 회전합니다. 계속 클릭하면 계속 돌아갑니다.",
    rotateAll: "모두 90° 회전", apply: "적용하고 다운로드", working: "PDF를 생성하는 중…",
    reset: "다시 시작", none: "아직 회전한 페이지가 없습니다 — 페이지를 클릭하세요.", err: "문제가 발생했습니다: ",
  },
} satisfies AuthoredCopy<typeof _en>;

// ko is excluded from AuthoredLocale (English-fallback foundation phase), so its
// copy lives in standalone *_KO objects selected explicitly in the resolver below.
const STR_KO: (typeof STR)["en"] = {
  title: "페이지 회전",
  subtitle: "PDF를 업로드하고 페이지를 클릭해 회전하세요 — 다운로드하기 전에 돌아가는 모습을 확인할 수 있습니다. 옆으로 누운 스캔본과 가로 페이지를 브라우저에서 바로잡으세요.",
  drop: "여기에 PDF를 끌어다 놓거나 클릭해서 선택하세요",
  choose: "PDF 선택", rendering: "페이지를 렌더링하는 중…",
  hint: "페이지를 클릭하면 90° 회전합니다. 계속 클릭하면 계속 돌아갑니다.",
  rotateAll: "모두 90° 회전", apply: "적용하고 다운로드", working: "PDF를 생성하는 중…",
  reset: "다시 시작", none: "아직 회전한 페이지가 없습니다 — 페이지를 클릭하세요.", err: "문제가 발생했습니다: ",
};

const SECTIONS: Record<AuthoredLocale, ToolSectionsContent> = {
  en: {
    benefitsTitle: "Why rotate PDF pages in your browser",
    benefitsDescription: "Fix the orientation of any page — or the whole document — in seconds.",
    benefits: [
      { title: "Fix sideways scans", description: "Straighten pages that scanned in landscape or upside-down so the document reads the right way up." },
      { title: "Rotate all or just some", description: "Apply a rotation to the whole PDF, or pick individual pages that need a different turn." },
      { title: "90° steps, any direction", description: "Turn pages 90°, 180°, or 270° — clockwise or counter-clockwise — and preview before you save." },
    ],
    workflowTitle: "How rotating fits your document work",
    workflowDescription: "For the moment a scan or export comes out sideways — a contract photographed in landscape, a batch scanned the wrong way.",
    steps: [
      "Upload the PDF with pages to rotate.",
      "Select pages and choose the rotation angle.",
      "Apply and download the corrected PDF.",
    ],
    readingTitle: "More ways to organize PDFs",
    readingDescription: "Related tools for fixing and rearranging document pages.",
    readingLinks: [
      { label: "Reorder pages", href: "/reorder-pages", description: "Drag to change the page order of a PDF." },
      { label: "Crop a PDF", href: "/crop-pdf", description: "Trim page margins or unwanted whitespace." },
      { label: "PDF workflow resources", href: "/resources", description: "A structured hub for PDF tools, OCR, conversion, and AI document paths." },
    ],
  },
  zh: {
    benefitsTitle: "为什么在浏览器里旋转 PDF 页面",
    benefitsDescription: "几秒钟修正任意页面——或整份文档——的方向。",
    benefits: [
      { title: "修正横置扫描", description: "把横向或倒置扫描的页面转正，让文档以正确方向阅读。" },
      { title: "整份或选页旋转", description: "对整个 PDF 应用旋转，或挑出需要单独转向的某几页。" },
      { title: "90°步进、任意方向", description: "把页面转 90°、180° 或 270°——顺时针或逆时针——保存前可预览。" },
    ],
    workflowTitle: "旋转如何融入你的文档工作",
    workflowDescription: "当扫描或导出歪了时——横拍的合同、扫反方向的一批文件。",
    steps: [
      "上传有页面要旋转的 PDF。",
      "选择页面并选好旋转角度。",
      "应用并下载修正后的 PDF。",
    ],
    readingTitle: "更多整理 PDF 的方式",
    readingDescription: "修正和重排文档页面的相关工具。",
    readingLinks: [
      { label: "重排页面", href: "/reorder-pages", description: "拖拽调整 PDF 的页面顺序。" },
      { label: "裁剪 PDF", href: "/crop-pdf", description: "裁掉页边或多余的留白。" },
      { label: "PDF 工作流资源", href: "/resources", description: "按工作流整理 PDF 工具、OCR、转换和 AI 文档路径。" },
    ],
  },
  es: {
    benefitsTitle: "Por qué rotar páginas de PDF en tu navegador",
    benefitsDescription: "Corrige la orientación de cualquier página —o de todo el documento— en segundos.",
    benefits: [
      { title: "Corrige escaneos de lado", description: "Endereza páginas escaneadas en horizontal o al revés para que el documento se lea correctamente." },
      { title: "Rota todo o solo algunas", description: "Aplica una rotación a todo el PDF o elige páginas concretas que necesiten otro giro." },
      { title: "Pasos de 90°, cualquier dirección", description: "Gira páginas 90°, 180° o 270°, en sentido horario o antihorario, y previsualiza antes de guardar." },
    ],
    workflowTitle: "Cómo encaja la rotación en tu trabajo",
    workflowDescription: "Para cuando un escaneo o exportación sale de lado: un contrato fotografiado en horizontal, un lote escaneado al revés.",
    steps: [
      "Sube el PDF con páginas para rotar.",
      "Selecciona páginas y elige el ángulo de rotación.",
      "Aplica y descarga el PDF corregido.",
    ],
    readingTitle: "Más formas de organizar PDF",
    readingDescription: "Herramientas relacionadas para corregir y reorganizar páginas de documentos.",
    readingLinks: [
      { label: "Reordenar páginas", href: "/reorder-pages", description: "Reorganiza el orden de las páginas del PDF arrastrando." },
      { label: "Recortar PDF", href: "/crop-pdf", description: "Recorta márgenes o espacios en blanco sobrantes." },
      { label: "Recursos de flujos de trabajo PDF", href: "/resources", description: "Un centro estructurado de herramientas PDF, OCR, conversión y rutas de documentos con IA." },
    ],
  },
  pt: {
    benefitsTitle: "Por que girar páginas de PDF no seu navegador",
    benefitsDescription: "Corrija a orientação de qualquer página — ou do documento inteiro — em segundos.",
    benefits: [
      { title: "Corrija digitalizações de lado", description: "Endireite páginas digitalizadas na horizontal ou de cabeça para baixo para o documento ser lido corretamente." },
      { title: "Gire tudo ou só algumas", description: "Aplique uma rotação ao PDF inteiro ou escolha páginas específicas que precisam de outro giro." },
      { title: "Passos de 90°, qualquer direção", description: "Gire páginas 90°, 180° ou 270°, no sentido horário ou anti-horário, e visualize antes de salvar." },
    ],
    workflowTitle: "Como a rotação se encaixa no seu trabalho",
    workflowDescription: "Para quando uma digitalização ou exportação sai de lado: um contrato fotografado na horizontal, um lote digitalizado ao contrário.",
    steps: [
      "Envie o PDF com páginas para girar.",
      "Selecione páginas e escolha o ângulo de rotação.",
      "Aplique e baixe o PDF corrigido.",
    ],
    readingTitle: "Mais formas de organizar PDF",
    readingDescription: "Ferramentas relacionadas para corrigir e reorganizar páginas de documentos.",
    readingLinks: [
      { label: "Reordenar páginas", href: "/reorder-pages", description: "Reorganize a ordem das páginas do PDF arrastando." },
      { label: "Recortar PDF", href: "/crop-pdf", description: "Corte margens ou espaços em branco sobrando." },
      { label: "Recursos de fluxos de trabalho PDF", href: "/resources", description: "Um hub estruturado de ferramentas PDF, OCR, conversão e fluxos de documentos com IA." },
    ],
  },
  fr: {
    benefitsTitle: "Pourquoi faire pivoter des pages PDF dans votre navigateur",
    benefitsDescription: "Corrigez l'orientation de n'importe quelle page — ou de tout le document — en quelques secondes.",
    benefits: [
      { title: "Corrigez les scans de travers", description: "Redressez les pages numérisées en paysage ou à l'envers pour que le document se lise dans le bon sens." },
      { title: "Tout ou seulement certaines", description: "Appliquez une rotation à tout le PDF, ou choisissez les pages qui ont besoin d'un autre sens." },
      { title: "Pas de 90°, toute direction", description: "Tournez les pages de 90°, 180° ou 270°, dans le sens horaire ou antihoraire, et prévisualisez avant d'enregistrer." },
    ],
    workflowTitle: "Comment la rotation s'intègre à votre travail",
    workflowDescription: "Pour le moment où un scan ou un export sort de travers : un contrat photographié en paysage, un lot numérisé à l'envers.",
    steps: [
      "Importez le PDF dont les pages doivent pivoter.",
      "Sélectionnez les pages et choisissez l'angle de rotation.",
      "Appliquez et téléchargez le PDF corrigé.",
    ],
    readingTitle: "Plus de façons d'organiser les PDF",
    readingDescription: "Outils associés pour corriger et réorganiser les pages des documents.",
    readingLinks: [
      { label: "Réorganiser les pages", href: "/reorder-pages", description: "Réorganisez l'ordre des pages du PDF par glisser-déposer." },
      { label: "Rogner un PDF", href: "/crop-pdf", description: "Coupez les marges ou les blancs superflus." },
      { label: "Ressources de flux de travail PDF", href: "/resources", description: "Un hub structuré d'outils PDF, d'OCR, de conversion et de parcours documentaires IA." },
    ],
  },
  ja: {
    benefitsTitle: "ブラウザで PDF ページを回転する理由",
    benefitsDescription: "任意のページ——または文書全体——の向きを数秒で修正します。",
    benefits: [
      { title: "横向きスキャンを修正", description: "横向きや上下逆さまにスキャンされたページをまっすぐにし、正しい向きで読めるようにします。" },
      { title: "全部または一部だけ回転", description: "PDF 全体に回転を適用するか、別の向きが必要な個別ページを選べます。" },
      { title: "90° 単位、任意の方向", description: "ページを 90°、180°、270°——時計回りまたは反時計回りに回転し、保存前にプレビューできます。" },
    ],
    workflowTitle: "回転が文書作業にどう役立つか",
    workflowDescription: "スキャンや書き出しが横向きになったとき——横向きで撮影した契約書、逆向きにスキャンした束。",
    steps: [
      "回転したいページのある PDF をアップロードします。",
      "ページを選び、回転角度を選択します。",
      "適用して、修正された PDF をダウンロードします。",
    ],
    readingTitle: "PDF を整理する他の方法",
    readingDescription: "文書のページを修正・並べ替えるための関連ツール。",
    readingLinks: [
      { label: "ページを並べ替え", href: "/reorder-pages", description: "ドラッグして PDF のページ順を変更します。" },
      { label: "PDF をトリミング", href: "/crop-pdf", description: "余白や不要な空白を切り取ります。" },
      { label: "PDF ワークフローのリソース", href: "/resources", description: "PDF ツール、OCR、変換、AI ドキュメントの導線を整理したハブ。" },
    ],
  },
  de: {
    benefitsTitle: "Warum PDF-Seiten in Ihrem Browser drehen",
    benefitsDescription: "Korrigieren Sie die Ausrichtung jeder beliebigen Seite – oder des ganzen Dokuments – in Sekunden.",
    benefits: [
      { title: "Seitliche Scans korrigieren", description: "Richten Sie Seiten gerade, die im Querformat oder kopfüber gescannt wurden, damit sich das Dokument richtig herum lesen lässt." },
      { title: "Alle oder nur einzelne drehen", description: "Wenden Sie eine Drehung auf das gesamte PDF an oder wählen Sie einzelne Seiten aus, die eine andere Drehung benötigen." },
      { title: "90°-Schritte, jede Richtung", description: "Drehen Sie Seiten um 90°, 180° oder 270° – im oder gegen den Uhrzeigersinn – und sehen Sie die Vorschau, bevor Sie speichern." },
    ],
    workflowTitle: "Wie das Drehen in Ihre Dokumentarbeit passt",
    workflowDescription: "Für den Moment, in dem ein Scan oder Export seitlich herauskommt – ein im Querformat fotografierter Vertrag, ein verkehrt herum gescannter Stapel.",
    steps: [
      "Laden Sie das PDF mit den zu drehenden Seiten hoch.",
      "Wählen Sie Seiten aus und legen Sie den Drehwinkel fest.",
      "Anwenden und das korrigierte PDF herunterladen.",
    ],
    readingTitle: "Weitere Möglichkeiten, PDFs zu organisieren",
    readingDescription: "Verwandte Tools zum Korrigieren und Neuordnen von Dokumentseiten.",
    readingLinks: [
      { label: "Seiten neu anordnen", href: "/reorder-pages", description: "Ändern Sie die Seitenreihenfolge eines PDFs per Ziehen." },
      { label: "PDF zuschneiden", href: "/crop-pdf", description: "Schneiden Sie Seitenränder oder unerwünschten Weißraum weg." },
      { label: "Ressourcen für PDF-Workflows", href: "/resources", description: "Ein strukturierter Hub für PDF-Tools, OCR, Konvertierung und KI-Dokumentenpfade." },
    ],
  },
  ko: {
    benefitsTitle: "브라우저에서 PDF 페이지를 회전하는 이유",
    benefitsDescription: "어느 한 페이지든 — 또는 문서 전체의 — 방향을 몇 초 만에 바로잡습니다.",
    benefits: [
      { title: "옆으로 누운 스캔 바로잡기", description: "가로나 거꾸로 스캔된 페이지를 똑바로 세워 문서가 바른 방향으로 읽히게 합니다." },
      { title: "전체 또는 일부만 회전", description: "PDF 전체에 회전을 적용하거나, 다른 방향이 필요한 개별 페이지를 골라 회전하세요." },
      { title: "90° 단위, 어느 방향이든", description: "페이지를 90°, 180°, 270°로 — 시계 방향이든 반시계 방향이든 — 돌리고 저장하기 전에 미리 확인하세요." },
    ],
    workflowTitle: "회전이 문서 작업에 어떻게 들어맞는가",
    workflowDescription: "스캔이나 내보내기가 옆으로 나왔을 때 — 가로로 촬영한 계약서, 방향이 뒤집힌 채 스캔된 묶음.",
    steps: [
      "회전할 페이지가 있는 PDF를 업로드합니다.",
      "페이지를 선택하고 회전 각도를 고릅니다.",
      "적용하고 바로잡은 PDF를 다운로드합니다.",
    ],
    readingTitle: "PDF를 정리하는 더 많은 방법",
    readingDescription: "문서 페이지를 바로잡고 재배열하는 관련 도구.",
    readingLinks: [
      { label: "페이지 재정렬", href: "/reorder-pages", description: "끌어서 PDF의 페이지 순서를 바꿉니다." },
      { label: "PDF 자르기", href: "/crop-pdf", description: "페이지 여백이나 불필요한 빈 공간을 잘라냅니다." },
      { label: "PDF 워크플로 리소스", href: "/resources", description: "PDF 도구, OCR, 변환, AI 문서 경로를 정리한 구조화된 허브." },
    ],
  },
};

const SECTIONS_KO: ToolSectionsContent = {
  benefitsTitle: "브라우저에서 PDF 페이지를 회전하는 이유",
  benefitsDescription: "어느 한 페이지든 — 또는 문서 전체의 — 방향을 몇 초 만에 바로잡습니다.",
  benefits: [
    { title: "옆으로 누운 스캔 바로잡기", description: "가로나 거꾸로 스캔된 페이지를 똑바로 세워 문서가 바른 방향으로 읽히게 합니다." },
    { title: "전체 또는 일부만 회전", description: "PDF 전체에 회전을 적용하거나, 다른 방향이 필요한 개별 페이지를 골라 회전하세요." },
    { title: "90° 단위, 어느 방향이든", description: "페이지를 90°, 180°, 270°로 — 시계 방향이든 반시계 방향이든 — 돌리고 저장하기 전에 미리 확인하세요." },
  ],
  workflowTitle: "회전이 문서 작업에 어떻게 들어맞는가",
  workflowDescription: "스캔이나 내보내기가 옆으로 나왔을 때 — 가로로 촬영한 계약서, 방향이 뒤집힌 채 스캔된 묶음.",
  steps: [
    "회전할 페이지가 있는 PDF를 업로드합니다.",
    "페이지를 선택하고 회전 각도를 고릅니다.",
    "적용하고 바로잡은 PDF를 다운로드합니다.",
  ],
  readingTitle: "PDF를 정리하는 더 많은 방법",
  readingDescription: "문서 페이지를 바로잡고 재배열하는 관련 도구.",
  readingLinks: [
    { label: "페이지 재정렬", href: "/reorder-pages", description: "끌어서 PDF의 페이지 순서를 바꿉니다." },
    { label: "PDF 자르기", href: "/crop-pdf", description: "페이지 여백이나 불필요한 빈 공간을 잘라냅니다." },
    { label: "PDF 워크플로 리소스", href: "/resources", description: "PDF 도구, OCR, 변환, AI 문서 경로를 정리한 구조화된 허브." },
  ],
};

export function RotatePagesClient({ locale = "en", embedded = false }: { locale?: Locale; embedded?: boolean }) {
  // ko has no authored copy yet → English (foundation phase). Mirrors zh-Hant special-casing.
  const al: AuthoredLocale = locale === "zh-Hant" ? "en" : locale;
  // childLocale collapses ONLY ko (preserves zh-Hant) for child props/runtime fns lacking "ko".
  const childLocale = locale;
  const t = locale === "zh-Hant" ? deepHant(STR.zh) : locale === "ko" ? STR_KO : STR[al];
  const sec: ToolSectionsContent = locale === "zh-Hant" ? deepHant(SECTIONS.zh) : locale === "ko" ? SECTIONS_KO : SECTIONS[al];
  const pageLabel = (n: number) => {
    const MSG: Record<AuthoredLocale, string> = {
      en: `Page ${n}`,
      zh: `第 ${n} 页`,
      es: `Página ${n}`,
      pt: `Página ${n}`,
      fr: `Page ${n}`,
      ja: `${n}ページ`,
      de: `Seite ${n}`,
      ko: `${n}페이지`,
    };
    return locale === "zh-Hant" ? toHant(MSG.zh) : locale === "ko" ? `${n}페이지` : MSG[al];
  };
  const [phase, setPhase] = useState<"idle" | "rendering" | "ready" | "working">("idle");
  const [done, setDone] = useState(false);
  const [fileName, setFileName] = useState("");
  const [pages, setPages] = useState<Pg[]>([]);
  const [rot, setRot] = useState<Record<number, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<File | null>(null);

  const reset = () => { setDone(false);
    setPhase("idle"); setFileName(""); setPages([]); setRot({}); setError(null); fileRef.current = null;
  };

  const onFile = useCallback(async (file: File) => {
    if (!file || (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"))) return;
    setError(null); setRot({}); setFileName(file.name); fileRef.current = file; setPhase("rendering");
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const data = new Uint8Array(await file.arrayBuffer());
      const doc = await pdfjs.getDocument({ data }).promise;
      const out: Pg[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale: 0.5 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width; canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (ctx) await page.render({ canvas, canvasContext: ctx, viewport }).promise;
        out.push({ idx: i - 1, thumb: canvas.toDataURL("image/jpeg", 0.7), w: canvas.width, h: canvas.height });
      }
      try { doc.destroy(); } catch { /* ignore */ }
      setPages(out); setPhase("ready");
    } catch (e) {
      setError(encryptedPdfMessage(e, childLocale) ?? (t.err + (e instanceof Error ? e.message : String(e)))); setPhase("idle");
    }
  }, [t, childLocale]);

  const rotateOne = (idx: number) => setRot((prev) => ({ ...prev, [idx]: ((prev[idx] || 0) + 90) % 360 }));
  const rotateAll = () => setRot((prev) => {
    const next: Record<number, number> = {};
    pages.forEach((p) => { next[p.idx] = ((prev[p.idx] || 0) + 90) % 360; });
    return next;
  });


  const count = Object.values(rot).filter((d) => d % 360 !== 0).length;

  const apply = useCallback(async () => {
    const file = fileRef.current;
    if (!file) return;
    setPhase("working"); setError(null); setProgress(5);
    try {
      const { PDFDocument, degrees } = await import("pdf-lib");
      const pdf = await PDFDocument.load(await file.arrayBuffer());
      setProgress(30);
      const docPages = pdf.getPages();
      docPages.forEach((p, i) => {
        const delta = rot[i] || 0;
        if (delta % 360 !== 0) {
          const cur = p.getRotation().angle || 0;
          p.setRotation(degrees((cur + delta) % 360));
        }
        setProgress(30 + Math.round(((i + 1) / docPages.length) * 45));
      });
      const bytes = await pdf.save();
      setProgress(95);
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = (fileName.replace(/\.pdf$/i, "") || "document") + "-rotated.pdf";
      a.click();
      URL.revokeObjectURL(url);
      trackToolRun("rotate-page");
      setProgress(100);
      setDone(true);
      setPhase("ready");
    } catch (e) {
      setError(encryptedPdfMessage(e, childLocale) ?? (t.err + (e instanceof Error ? e.message : String(e)))); setPhase("ready");
    }
  }, [rot, fileName, t, childLocale]);

  return (
    <div className={embedded ? "mx-auto w-full max-w-3xl px-8 pb-10 pt-4" : `mx-auto ${LAYOUT.content} px-5 pb-16 sm:px-6 sm:pb-20 pt-12 sm:pt-16`}>
      {!embedded && <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{t.title}</h1>}
      <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.subtitle}</p>

      {phase === "idle" || phase === "rendering" ? (
        <UploadDropzone locale={childLocale} buttonLabel={t.choose} busy={phase === "rendering"} busyLabel={t.rendering} onFile={onFile} constrained={embedded} valueZone="client" />
      ) : (
        <WorkArea
          left={
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-[15px] font-semibold text-[color:var(--foreground)]">{fileName}</p>
                <button type="button" onClick={reset} aria-label={t.reset}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[color:var(--surface)] text-[color:var(--muted)] opacity-80 transition hover:opacity-100 hover:text-[color:var(--error)]">
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                    <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <p className="mt-0.5 text-[12.5px] text-[color:var(--muted)]">
                {pages.length}p{fileRef.current ? ` · ${(fileRef.current.size / 1024 / 1024).toFixed(2)} MB` : ""}
                {count > 0 && <span className="ml-1 font-medium text-[color:var(--accent)]">· {count} ↻</span>}
              </p>
            </div>
          }
          right={
            <>

              <button type="button" onClick={rotateAll}
                className="rounded-[var(--radius)] border border-[color:var(--line)] px-3 py-1.5 text-[13px] font-medium text-[color:var(--foreground)] hover:border-[color:var(--line-strong)]">
                ↻ {t.rotateAll}
              </button>
              <button type="button" onClick={apply} disabled={phase === "working" || count === 0} className="rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
                {phase === "working" ? t.working : t.apply}
              </button>
            </>
          }
          footer={count > 0 ? t.hint : t.none}
        >

          {phase === "working" && (
            <div className="mx-auto mb-4 max-w-[200px]">
              <CircularProgress bare progress={progress} title={t.working} />
            </div>
          )}

          <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
            {pages.map((p) => {
              const deg = rot[p.idx] || 0;
              const rotated = deg % 360 !== 0;
              return (
                <PageCard
                  key={p.idx}
                  src={p.thumb}
                  alt={`page ${p.idx + 1}`}
                  pageLabel={pageLabel(p.idx + 1)}
                  selected={rotated}
                  dim={!rotated}
                  imgClassName={rotated ? "transition-all duration-200" : "transition-all duration-200 group-hover:opacity-100"}
                  imgStyle={{ transform: `rotate(${deg}deg)` }}
                  labelClassName={rotated ? "font-medium text-[color:var(--accent)]" : undefined}
                  topRight={
                    <span className="absolute right-1.5 top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--surface-subtle)] text-[11px] text-[color:var(--muted)] opacity-0 transition group-hover:opacity-100">↻</span>
                  }
                  onSelect={() => rotateOne(p.idx)}
                />
              );
            })}
          </div>
        </WorkArea>
      )}

      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}
      {done && (
        <div className="mt-6">
          <ToolBridge slug="rotate-page" locale={locale} useLocalePrefix={locale !== "en"} />
        </div>
      )}
      {!embedded && <ToolSections locale={locale} content={sec} />}
      {!embedded && <ToolFaq tool="rotate-page" locale={locale} />}
    </div>
  );
}
