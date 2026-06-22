"use client";

import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { encryptedPdfMessage } from "@/lib/pdf-errors";
import { UploadDropzone } from "@/components/UploadDropzone";
import { ToolFaq } from "@/components/ToolFaq";
import { ToolSections, type ToolSectionsContent } from "@/components/ToolSections";
import { deepHant, toHant } from "@/lib/zh-hant";

type Locale = "en" | "zh" | "es" | "pt" | "fr" | "ja" | "zh-Hant";
// Boxes are stored in NORMALIZED page fractions (0–1) so they map to any render scale.
type Box = { id: string; page: number; x: number; y: number; w: number; h: number; auto?: boolean };
type Pg = { idx: number; url: string; ratio: number }; // ratio = height / width

const MAX_PAGES = 30;
const DISPLAY_SCALE = 1.4;
const OUTPUT_SCALE = 2.2; // ~158 DPI — legible, reasonable size

// PII detectors (suggestions only; the user confirms before applying).
const PII: Array<[string, RegExp]> = [
  ["email", /[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}/gi],
  ["phone", /(?:\+?1[\s.\-]?)?(?:\(\d{3}\)|\d{3})[\s.\-]?\d{3}[\s.\-]?\d{4}\b/g],
  ["ssn", /\b(?!000|666|9\d\d)\d{3}[\s.\-]?(?!00)\d{2}[\s.\-]?(?!0000)\d{4}\b/g],
  ["card", /\b(?:4\d{3}|5[1-5]\d{2}|6011|3[47]\d{2})[\s\-]?\d{3,4}[\s\-]?\d{3,4}[\s\-]?\d{0,4}\b/g],
  ["ipv4", /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g],
];

function luhn(num: string) {
  const d = num.replace(/\D/g, "");
  if (d.length < 13 || d.length > 19) return false;
  let sum = 0, alt = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let n = +d[i];
    if (alt) { n *= 2; if (n > 9) n -= 9; }
    sum += n; alt = !alt;
  }
  return sum % 10 === 0;
}

// A box needs meaningful area in BOTH dimensions to count / apply (and to survive
// a draw-release). One shared predicate => what the user sees is exactly what gets
// redacted — no thin box that shows on screen but is silently dropped on apply.
const sizable = (b: Box) => b.w > 0.0015 && b.h > 0.0015;

const STR = {
  en: {
    title: "Redact PDF",
    subtitle: "Black out names, numbers and any sensitive text — then download a copy where it's truly gone. Unlike a black box you can copy under, DockDocs flattens each page to an image so the hidden text is destroyed for good. Runs in your browser; your file never leaves your device.",
    drop: "Drag & drop a PDF here, or click to choose",
    choose: "Choose PDF", rendering: "Rendering pages…",
    hint: "Drag on a page to black out an area. Auto-suggested items are pre-marked — click any box's ✕ to remove it.",
    autoFound: (n: number) => `Auto-detected ${n} likely sensitive item${n === 1 ? "" : "s"} (emails, phone, SSN, cards, IPs). Review and add your own.`,
    autoNone: "No obvious emails/numbers auto-detected — drag on the pages to redact manually.",
    boxes: (n: number) => `${n} redaction${n === 1 ? "" : "s"}`,
    clear: "Clear all", apply: "Apply & download", working: "Removing & flattening…", reset: "Start over",
    needBox: "Add at least one redaction first.",
    note: "Output is a flattened image PDF: the redacted content is permanently removed and the page text is no longer selectable — that's exactly what makes it unrecoverable.",
    err: "Something went wrong: ", tooMany: `This PDF has more than ${MAX_PAGES} pages. Split it first, then redact.`,
  },
  zh: {
    title: "PDF 智能涂黑",
    subtitle: "把姓名、号码等敏感文字涂黑，下载一份「真正删掉」的副本。不同于能从底下复制出来的假黑框，DockDocs 把每页拍平成图片、底层文字彻底销毁。全程在浏览器完成，文件不离开你的设备。",
    drop: "把 PDF 拖到这里，或点击选择",
    choose: "选择 PDF", rendering: "正在渲染页面…",
    hint: "在页面上拖动即可涂黑一块区域。自动识别的敏感项已预先标记——点框上的 ✕ 可移除。",
    autoFound: (n: number) => `自动识别出 ${n} 处可能的敏感信息(邮箱、电话、SSN、卡号、IP)。请复核，也可自己补充。`,
    autoNone: "没自动识别到明显的邮箱/号码——在页面上拖动手动涂黑。",
    boxes: (n: number) => `${n} 处涂黑`,
    clear: "全部清除", apply: "应用并下载", working: "正在删除并拍平…", reset: "重新开始",
    needBox: "请先至少标记一处涂黑。",
    note: "输出为拍平的图片版 PDF：被涂黑的内容已永久删除、页面文字也不再可选——这正是它无法被还原的原因。",
    err: "出错了：", tooMany: `这份 PDF 超过 ${MAX_PAGES} 页。请先拆分再涂黑。`,
  },
  es: {
    title: "Censurar PDF",
    subtitle: "Tacha nombres, números y cualquier texto sensible, y descarga una copia donde realmente desaparecen. A diferencia de un recuadro negro por debajo del cual se puede copiar el texto, DockDocs aplana cada página como imagen para que el texto oculto se destruya para siempre. Se ejecuta en tu navegador; tu archivo nunca sale de tu dispositivo.",
    drop: "Arrastra y suelta un PDF aquí, o haz clic para elegir",
    choose: "Elegir PDF", rendering: "Procesando páginas…",
    hint: "Arrastra sobre una página para tachar un área. Los elementos sugeridos automáticamente vienen premarcados: haz clic en la ✕ de cualquier recuadro para quitarlo.",
    autoFound: (n: number) => `Se detectaron automáticamente ${n} elemento${n === 1 ? "" : "s"} probablemente sensible${n === 1 ? "" : "s"} (correos, teléfonos, SSN, tarjetas, IP). Revísalos y agrega los tuyos.`,
    autoNone: "No se detectaron correos/números evidentes automáticamente: arrastra sobre las páginas para censurar manualmente.",
    boxes: (n: number) => `${n} censura${n === 1 ? "" : "s"}`,
    clear: "Borrar todo", apply: "Aplicar y descargar", working: "Eliminando y aplanando…", reset: "Empezar de nuevo",
    needBox: "Agrega al menos una censura primero.",
    note: "El resultado es un PDF de imagen aplanada: el contenido censurado se elimina de forma permanente y el texto de la página ya no se puede seleccionar; eso es justamente lo que lo hace irrecuperable.",
    err: "Algo salió mal: ", tooMany: `Este PDF tiene más de ${MAX_PAGES} páginas. Divídelo primero y luego censúralo.`,
  },
  pt: {
    title: "Redigir PDF",
    subtitle: "Oculte nomes, números e qualquer texto sensível — depois baixe uma cópia onde eles foram realmente removidos. Ao contrário de uma caixa preta pela qual é possível copiar o texto, o DockDocs achata cada página como imagem para que o texto oculto seja destruído permanentemente. Executado no seu navegador; seu arquivo nunca sai do seu dispositivo.",
    drop: "Arraste e solte um PDF aqui, ou clique para escolher",
    choose: "Escolher PDF", rendering: "Processando páginas…",
    hint: "Arraste sobre uma página para ocultar uma área. Os itens sugeridos automaticamente vêm pré-marcados — clique no ✕ de qualquer caixa para removê-la.",
    autoFound: (n: number) => `${n} item${n === 1 ? "" : "ns"} provavelmente sensível${n === 1 ? "" : "is"} detectado${n === 1 ? "" : "s"} automaticamente (e-mails, telefones, CPF/SSN, cartões, IPs). Revise e adicione os seus.`,
    autoNone: "Nenhum e-mail/número óbvio detectado automaticamente — arraste sobre as páginas para redigir manualmente.",
    boxes: (n: number) => `${n} redação${n === 1 ? "" : "ões"}`,
    clear: "Limpar tudo", apply: "Aplicar e baixar", working: "Removendo e achatando…", reset: "Recomeçar",
    needBox: "Adicione pelo menos uma redação primeiro.",
    note: "O resultado é um PDF de imagem achatada: o conteúdo redigido é removido permanentemente e o texto da página não pode mais ser selecionado — é exatamente isso que o torna irrecuperável.",
    err: "Algo deu errado: ", tooMany: `Este PDF tem mais de ${MAX_PAGES} páginas. Divida-o primeiro e depois redija.`,
  },
  fr: {
    title: "Caviarder un PDF",
    subtitle: "Masquez définitivement les noms, numéros et tout texte sensible, puis téléchargez une copie où ces informations ont été véritablement supprimées. Contrairement à un cadre noir sous lequel on peut copier le texte, DockDocs aplatit chaque page en image afin que le contenu masqué soit détruit pour de bon. Fonctionne dans votre navigateur ; votre fichier ne quitte jamais votre appareil.",
    drop: "Glissez-déposez un PDF ici, ou cliquez pour choisir",
    choose: "Choisir un PDF", rendering: "Rendu des pages en cours…",
    hint: "Faites glisser sur une page pour noircir une zone. Les éléments suggérés automatiquement sont pré-marqués — cliquez sur le ✕ d'un cadre pour le supprimer.",
    autoFound: (n: number) => `${n} élément${n === 1 ? "" : "s"} potentiellement sensible${n === 1 ? "" : "s"} détecté${n === 1 ? "" : "s"} automatiquement (e-mails, téléphones, numéros de sécurité sociale, cartes, IP). Vérifiez et ajoutez les vôtres.`,
    autoNone: "Aucun e-mail ni numéro évident détecté automatiquement — faites glisser sur les pages pour caviarder manuellement.",
    boxes: (n: number) => `${n} caviardage${n === 1 ? "" : "s"}`,
    clear: "Tout effacer", apply: "Appliquer et télécharger", working: "Suppression et aplatissement…", reset: "Recommencer",
    needBox: "Ajoutez au moins un caviardage d'abord.",
    note: "Le résultat est un PDF image aplati : le contenu caviardé est supprimé définitivement et le texte de la page n'est plus sélectionnable — c'est précisément ce qui le rend irrécupérable.",
    err: "Une erreur est survenue : ", tooMany: `Ce PDF contient plus de ${MAX_PAGES} pages. Divisez-le d'abord, puis caviardez-le.`,
  },
  ja: {
    title: "PDFを黒塗り",
    subtitle: "名前、番号、機密テキストを黒塗りして、本当に消えたコピーをダウンロードできます。下から文字をコピーできる単なる黒い四角とは違い、DockDocsは各ページを画像に統合するため、隠した文字は完全に破棄されます。ブラウザ内で動作し、ファイルがデバイスから出ることはありません。",
    drop: "ここにPDFをドラッグ＆ドロップ、またはクリックして選択",
    choose: "PDFを選択", rendering: "ページを描画中…",
    hint: "ページ上をドラッグして範囲を黒塗りします。自動検出された項目は事前にマークされています——各ボックスの✕をクリックで削除。",
    autoFound: (n: number) => `機密の可能性がある項目を${n}件自動検出しました（メール、電話番号、SSN、カード番号、IP）。確認し、必要に応じて自分で追加してください。`,
    autoNone: "明らかなメール/番号は自動検出されませんでした——ページ上をドラッグして手動で黒塗りしてください。",
    boxes: (n: number) => `${n}件の黒塗り`,
    clear: "すべてクリア", apply: "適用してダウンロード", working: "削除して統合中…", reset: "最初からやり直す",
    needBox: "まず少なくとも1件の黒塗りを追加してください。",
    note: "出力は統合された画像PDFです。黒塗りした内容は完全に削除され、ページの文字は選択できなくなります——これこそが復元不可能である理由です。",
    err: "問題が発生しました: ", tooMany: `このPDFは${MAX_PAGES}ページを超えています。先に分割してから黒塗りしてください。`,
  },
};

const SECTIONS: Record<"en" | "zh" | "es" | "pt" | "fr" | "ja", ToolSectionsContent> = {
  en: {
    benefitsTitle: "Why redact PDFs in your browser",
    benefitsDescription: "Black out sensitive content and download a copy where the hidden text is truly gone — not just covered.",
    benefits: [
      { title: "The text is destroyed, not hidden", description: "Each page is flattened to an image, so the blacked-out words can't be copied, searched, or recovered the way they can under a simple black box." },
      { title: "Auto-finds the obvious risks", description: "Emails, phone numbers, SSNs, card numbers, and IPs are detected and pre-marked for you — review each one and remove any false positives before applying." },
      { title: "Precise manual control", description: "Drag a box over anything the detector misses — names, figures, signatures, logos — and place exactly as many redactions as a page needs." },
    ],
    workflowTitle: "How redaction fits your document work",
    workflowDescription: "For the moment a file has to be shared but parts of it must never be read — a contract, a medical record, a discovery document, a screenshot with personal data.",
    steps: [
      "Upload the PDF you need to sanitize (up to 30 pages).",
      "Confirm the auto-detected items and drag boxes over anything else to black out.",
      "Apply and download a flattened copy with the redacted content permanently removed.",
    ],
    readingTitle: "More ways to protect PDFs",
    readingDescription: "Related tools and guides for securing and finishing documents.",
    readingLinks: [
      { label: "Watermark a PDF", href: "/watermark-pdf", description: "Stamp a label like CONFIDENTIAL or DRAFT across pages before you share them." },
      { label: "How to redact a PDF for free", href: "/guides/redact-pdf-free", description: "A step-by-step walkthrough of removing sensitive text so it can't be recovered." },
      { label: "PDF workflow resources", href: "/resources", description: "A structured hub for PDF tools, OCR, conversion, and AI document paths." },
    ],
  },
  zh: {
    benefitsTitle: "为什么在浏览器里给 PDF 涂黑",
    benefitsDescription: "把敏感内容涂黑，下载一份隐藏文字真正被删掉的副本——而不只是被盖住。",
    benefits: [
      { title: "文字被销毁，而非藏起", description: "每页都被拍平成图片，被涂黑的文字无法像普通黑框那样被复制、搜索或还原出来。" },
      { title: "自动找出明显风险", description: "邮箱、电话、SSN、卡号、IP 会被自动识别并预先标记——逐项复核、剔除误报后再应用。" },
      { title: "手动精确控制", description: "对识别遗漏的内容——姓名、数字、签名、徽标——拖框框住，一页需要几处就标几处。" },
    ],
    workflowTitle: "涂黑如何融入你的文档工作",
    workflowDescription: "当文件必须分享、但其中某些内容绝不能被看到时——合同、病历、证据材料、含个人信息的截图。",
    steps: [
      "上传需要脱敏的 PDF(最多 30 页)。",
      "确认自动识别的项目，并对其他要涂黑的内容拖框框选。",
      "应用并下载一份已永久删除涂黑内容的拍平副本。",
    ],
    readingTitle: "更多保护 PDF 的方式",
    readingDescription: "用于加固和收尾文档的相关工具和指南。",
    readingLinks: [
      { label: "给 PDF 加水印", href: "/watermark-pdf", description: "分享前在页面上盖上「机密」「草稿」之类的标记。" },
      { label: "如何免费给 PDF 涂黑", href: "/guides/redact-pdf-free", description: "一步步教你删除敏感文字、让它无法被还原。" },
      { label: "PDF 工作流资源", href: "/resources", description: "按工作流整理 PDF 工具、OCR、转换和 AI 文档路径。" },
    ],
  },
  es: {
    benefitsTitle: "Por qué censurar PDF en tu navegador",
    benefitsDescription: "Tacha contenido sensible y descarga una copia donde el texto oculto realmente desaparece, no solo se cubre.",
    benefits: [
      { title: "El texto se destruye, no se oculta", description: "Cada página se aplana como imagen, así que las palabras tachadas no se pueden copiar, buscar ni recuperar como ocurre bajo un simple recuadro negro." },
      { title: "Detecta los riesgos evidentes", description: "Correos, teléfonos, SSN, números de tarjeta e IP se detectan y premarcan por ti: revisa cada uno y quita los falsos positivos antes de aplicar." },
      { title: "Control manual preciso", description: "Arrastra un recuadro sobre lo que el detector pase por alto —nombres, cifras, firmas, logotipos— y coloca tantas censuras como necesite la página." },
    ],
    workflowTitle: "Cómo encaja la censura en tu trabajo",
    workflowDescription: "Para cuando un archivo debe compartirse pero hay partes que nadie debe leer: un contrato, un historial médico, un documento de prueba, una captura con datos personales.",
    steps: [
      "Sube el PDF que necesitas sanear (hasta 30 páginas).",
      "Confirma los elementos detectados y arrastra recuadros sobre todo lo demás que quieras tachar.",
      "Aplica y descarga una copia aplanada con el contenido censurado eliminado de forma permanente.",
    ],
    readingTitle: "Más formas de proteger PDF",
    readingDescription: "Herramientas y guías relacionadas para asegurar y finalizar documentos.",
    readingLinks: [
      { label: "Marca de agua en un PDF", href: "/watermark-pdf", description: "Estampa una etiqueta como CONFIDENCIAL o BORRADOR en las páginas antes de compartirlas." },
      { label: "Cómo censurar un PDF gratis", href: "/guides/redact-pdf-free", description: "Guía paso a paso para eliminar texto sensible de modo que no se pueda recuperar." },
      { label: "Recursos de flujos de trabajo PDF", href: "/resources", description: "Un centro estructurado de herramientas PDF, OCR, conversión y rutas de documentos con IA." },
    ],
  },
  pt: {
    benefitsTitle: "Por que redigir PDF no seu navegador",
    benefitsDescription: "Oculte conteúdo sensível e baixe uma cópia onde o texto escondido realmente desaparece, não apenas fica coberto.",
    benefits: [
      { title: "O texto é destruído, não escondido", description: "Cada página é achatada como imagem, então as palavras ocultadas não podem ser copiadas, pesquisadas ou recuperadas como acontece sob uma simples caixa preta." },
      { title: "Encontra os riscos óbvios", description: "E-mails, telefones, CPF/SSN, números de cartão e IPs são detectados e pré-marcados para você: revise cada um e remova os falsos positivos antes de aplicar." },
      { title: "Controle manual preciso", description: "Arraste uma caixa sobre o que o detector deixar passar —nomes, valores, assinaturas, logotipos— e coloque quantas redações a página precisar." },
    ],
    workflowTitle: "Como a redação se encaixa no seu trabalho",
    workflowDescription: "Para quando um arquivo precisa ser compartilhado, mas partes dele nunca devem ser lidas: um contrato, um prontuário médico, um documento de prova, uma captura com dados pessoais.",
    steps: [
      "Envie o PDF que você precisa higienizar (até 30 páginas).",
      "Confirme os itens detectados e arraste caixas sobre tudo o mais que quiser ocultar.",
      "Aplique e baixe uma cópia achatada com o conteúdo redigido removido permanentemente.",
    ],
    readingTitle: "Mais formas de proteger PDF",
    readingDescription: "Ferramentas e guias relacionados para proteger e finalizar documentos.",
    readingLinks: [
      { label: "Marca d'água em um PDF", href: "/watermark-pdf", description: "Carimbe um rótulo como CONFIDENCIAL ou RASCUNHO nas páginas antes de compartilhá-las." },
      { label: "Como redigir um PDF de graça", href: "/guides/redact-pdf-free", description: "Um passo a passo para remover texto sensível de modo que não possa ser recuperado." },
      { label: "Recursos de fluxos de trabalho PDF", href: "/resources", description: "Um hub estruturado de ferramentas PDF, OCR, conversão e fluxos de documentos com IA." },
    ],
  },
  fr: {
    benefitsTitle: "Pourquoi caviarder des PDF dans votre navigateur",
    benefitsDescription: "Masquez le contenu sensible et téléchargez une copie où le texte caché disparaît vraiment, au lieu d'être simplement recouvert.",
    benefits: [
      { title: "Le texte est détruit, pas masqué", description: "Chaque page est aplatie en image : les mots caviardés ne peuvent plus être copiés, recherchés ni récupérés, contrairement à un simple cadre noir." },
      { title: "Repère les risques évidents", description: "E-mails, téléphones, numéros de sécurité sociale, cartes et IP sont détectés et pré-marqués pour vous : vérifiez chacun et retirez les faux positifs avant d'appliquer." },
      { title: "Contrôle manuel précis", description: "Tracez un cadre sur tout ce que le détecteur oublie —noms, montants, signatures, logos— et placez autant de caviardages que la page l'exige." },
    ],
    workflowTitle: "Comment le caviardage s'intègre à votre travail",
    workflowDescription: "Pour le moment où un fichier doit être partagé mais où certaines parties ne doivent jamais être lues : un contrat, un dossier médical, une pièce de procédure, une capture avec des données personnelles.",
    steps: [
      "Importez le PDF à nettoyer (jusqu'à 30 pages).",
      "Confirmez les éléments détectés et tracez des cadres sur tout le reste à masquer.",
      "Appliquez et téléchargez une copie aplatie où le contenu caviardé est définitivement supprimé.",
    ],
    readingTitle: "Plus de façons de protéger les PDF",
    readingDescription: "Outils et guides associés pour sécuriser et finaliser les documents.",
    readingLinks: [
      { label: "Filigraner un PDF", href: "/watermark-pdf", description: "Apposez une mention comme CONFIDENTIEL ou BROUILLON sur les pages avant de les partager." },
      { label: "Comment caviarder un PDF gratuitement", href: "/guides/redact-pdf-free", description: "Un guide pas à pas pour supprimer le texte sensible afin qu'il soit irrécupérable." },
      { label: "Ressources de flux de travail PDF", href: "/resources", description: "Un hub structuré d'outils PDF, d'OCR, de conversion et de parcours documentaires IA." },
    ],
  },
  ja: {
    benefitsTitle: "ブラウザで PDF を黒塗りする理由",
    benefitsDescription: "機密内容を黒塗りし、隠した文字が本当に消えた——ただ覆われただけではない——コピーをダウンロードできます。",
    benefits: [
      { title: "文字は隠すのではなく破棄", description: "各ページを画像に統合するため、黒塗りした文字は単なる黒い四角の下とは違い、コピーも検索も復元もできません。" },
      { title: "明らかなリスクを自動検出", description: "メール、電話番号、SSN、カード番号、IP を検出して事前にマーク——各項目を確認し、誤検出を外してから適用できます。" },
      { title: "手動での精密な制御", description: "検出が見逃した部分——名前、数値、署名、ロゴ——にボックスをドラッグし、ページに必要なだけ黒塗りを配置できます。" },
    ],
    workflowTitle: "黒塗りが文書作業にどう役立つか",
    workflowDescription: "ファイルを共有しなければならないが、一部は決して読まれてはならないとき——契約書、診療記録、証拠資料、個人情報を含むスクリーンショット。",
    steps: [
      "黒塗りしたい PDF をアップロードします(最大 30 ページ)。",
      "自動検出された項目を確認し、その他に黒塗りしたい箇所をドラッグで囲みます。",
      "適用して、黒塗り内容が完全に削除された統合済みコピーをダウンロードします。",
    ],
    readingTitle: "PDF を保護する他の方法",
    readingDescription: "文書を保護し仕上げるための関連ツールとガイド。",
    readingLinks: [
      { label: "PDF に透かしを入れる", href: "/watermark-pdf", description: "共有前に「社外秘」「ドラフト」などのラベルをページに押します。" },
      { label: "PDF を無料で黒塗りする方法", href: "/guides/redact-pdf-free", description: "機密文字を復元できないように削除する手順を順を追って解説します。" },
      { label: "PDF ワークフローのリソース", href: "/resources", description: "PDF ツール、OCR、変換、AI ドキュメントの導線を整理したハブ。" },
    ],
  },
};

export function RedactPdfClient({ locale = "en" }: { locale?: Locale }) {
  const t = locale === "zh-Hant" ? deepHant(STR.zh) : (STR[locale] ?? STR.en);
  const sec: ToolSectionsContent = locale === "zh-Hant" ? deepHant(SECTIONS.zh) : (SECTIONS[locale] ?? SECTIONS.en);
  const [phase, setPhase] = useState<"idle" | "rendering" | "ready" | "working">("idle");
  const [pages, setPages] = useState<Pg[]>([]);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [autoMsg, setAutoMsg] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<File | null>(null);
  const draw = useRef<{ page: number; x0: number; y0: number; id: string } | null>(null);

  const reset = () => { setPhase("idle"); setPages([]); setBoxes([]); setAutoMsg(""); setError(null); fileRef.current = null; };

  const onFile = useCallback(async (file: File) => {
    if (!file || (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"))) return;
    setError(null); fileRef.current = file; setPhase("rendering");
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
      if (doc.numPages > MAX_PAGES) { setError(t.tooMany); setPhase("idle"); try { doc.destroy(); } catch {} return; }

      const out: Pg[] = [];
      const auto: Box[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale: DISPLAY_SCALE });
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
        const ctx = canvas.getContext("2d");
        if (ctx) await page.render({ canvas, canvasContext: ctx, viewport }).promise;
        out.push({ idx: i - 1, url: canvas.toDataURL("image/jpeg", 0.85), ratio: canvas.height / canvas.width });

        // Auto-detect PII → normalized boxes
        try {
          const tc = await page.getTextContent();
          let full = "";
          const ranges: Array<{ s: number; e: number; item: { str: string; width: number; height: number; transform: number[] } }> = [];
          for (const it of tc.items as Array<{ str?: string; width?: number; height?: number; transform?: number[]; hasEOL?: boolean }>) {
            if (typeof it.str !== "string") continue;
            const s = full.length; full += it.str;
            ranges.push({ s, e: full.length, item: { str: it.str, width: it.width ?? 0, height: it.height ?? 0, transform: it.transform ?? [1, 0, 0, 1, 0, 0] } });
            if (it.hasEOL) full += "\n";
          }
          for (const [type, re] of PII) {
            re.lastIndex = 0; let m: RegExpExecArray | null;
            while ((m = re.exec(full)) !== null) {
              if (type === "card" && !luhn(m[0])) continue;
              const ms = m.index, me = m.index + m[0].length;
              for (const r of ranges.filter((r) => r.s < me && r.e > ms)) {
                const dm = pdfjs.Util.transform(viewport.transform, r.item.transform);
                const sx = Math.hypot(dm[0], dm[1]), sy = Math.hypot(dm[2], dm[3]);
                const w = r.item.width * sx, h = r.item.height * sy;
                const pad = h * 0.22;
                const px = dm[4] - pad, py = dm[5] - h - pad;
                auto.push({
                  id: `a-${i}-${ms}-${r.s}`, page: i - 1, auto: true,
                  x: Math.max(0, px / canvas.width), y: Math.max(0, py / canvas.height),
                  w: Math.min(1, (w + 2 * pad) / canvas.width), h: Math.min(1, (h + 2 * pad) / canvas.height),
                });
              }
            }
          }
        } catch { /* text layer optional */ }
      }
      try { doc.destroy(); } catch {}
      setPages(out); setBoxes(auto);
      setAutoMsg(auto.length ? t.autoFound(auto.length) : t.autoNone);
      setPhase("ready");
    } catch (e) {
      setError(encryptedPdfMessage(e, locale) ?? (t.err + (e instanceof Error ? e.message : String(e))));
      setPhase("idle");
    }
  }, [t, locale]);

  // ── Drawing on a page ──
  const norm = (e: ReactPointerEvent, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    return { x: Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), y: Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)) };
  };
  const onDown = (e: ReactPointerEvent, page: number) => {
    if (phase !== "ready") return;
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
    const p = norm(e, el);
    const id = `d-${page}-${pages.length}-${boxes.length}-${Math.random().toString(36).slice(2, 6)}`;
    draw.current = { page, x0: p.x, y0: p.y, id };
    setBoxes((prev) => [...prev, { id, page, x: p.x, y: p.y, w: 0, h: 0 }]);
  };
  const onMove = (e: ReactPointerEvent) => {
    const d = draw.current; if (!d) return;
    const p = norm(e, e.currentTarget as HTMLElement);
    setBoxes((prev) => prev.map((b) => b.id === d.id ? { ...b, x: Math.min(d.x0, p.x), y: Math.min(d.y0, p.y), w: Math.abs(p.x - d.x0), h: Math.abs(p.y - d.y0) } : b));
  };
  const onUp = () => {
    const d = draw.current; draw.current = null;
    if (d) setBoxes((prev) => prev.filter((b) => !(b.id === d.id && !sizable(b))));
  };
  const removeBox = (id: string) => setBoxes((prev) => prev.filter((b) => b.id !== id));

  // ── Apply: rasterize each page, paint opaque black, rebuild image-only PDF ──
  const apply = useCallback(async () => {
    const file = fileRef.current;
    if (!file) return;
    const real = boxes.filter(sizable);
    if (real.length === 0) { setError(t.needBox); return; }
    setPhase("working"); setError(null);
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const { PDFDocument } = await import("pdf-lib");
      const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
      const outPdf = await PDFDocument.create();

      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale: OUTPUT_SCALE });
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) continue;
        await page.render({ canvas, canvasContext: ctx, viewport }).promise;

        // Paint fully-opaque black over each box (text underneath is destroyed by rasterization).
        ctx.save();
        ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over"; ctx.fillStyle = "#000000";
        for (const b of real) {
          if (b.page !== i - 1) continue;
          ctx.fillRect(Math.floor(b.x * canvas.width), Math.floor(b.y * canvas.height), Math.ceil(b.w * canvas.width), Math.ceil(b.h * canvas.height));
        }
        ctx.restore();

        const blob: Blob = await new Promise((res, rej) => canvas.toBlob((bl) => (bl ? res(bl) : rej(new Error("encode failed"))), "image/jpeg", 0.9));
        const img = await outPdf.embedJpg(await blob.arrayBuffer());
        const pw = canvas.width / OUTPUT_SCALE, ph = canvas.height / OUTPUT_SCALE;
        const np = outPdf.addPage([pw, ph]);
        np.drawImage(img, { x: 0, y: 0, width: pw, height: ph });
        canvas.width = 0; canvas.height = 0; // free bitmap
      }
      try { doc.destroy(); } catch {}

      const bytes = await outPdf.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = (file.name.replace(/\.pdf$/i, "") || "document") + "-redacted.pdf"; a.click();
      URL.revokeObjectURL(url);
      setPhase("ready");
    } catch (e) {
      setError(encryptedPdfMessage(e, locale) ?? (t.err + (e instanceof Error ? e.message : String(e))));
      setPhase("ready");
    }
  }, [boxes, t, locale]);

  return (
    <div className="mx-auto max-w-5xl px-5 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20">
      <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{t.title}</h1>
      <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.subtitle}</p>

      {phase === "idle" || phase === "rendering" ? (
        <UploadDropzone locale={locale} buttonLabel={t.choose} busy={phase === "rendering"} busyLabel={t.rendering} onFile={onFile} />
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-[color:var(--foreground)]">{t.boxes(boxes.filter(sizable).length)}</p>
              <p className="text-[12.5px] text-[color:var(--muted)]">{t.hint}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button type="button" onClick={reset} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] hover:border-[color:var(--line-strong)]">{t.reset}</button>
              <button type="button" onClick={() => setBoxes([])} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] hover:border-[color:var(--line-strong)]">{t.clear}</button>
              <button type="button" onClick={apply} disabled={phase === "working"} className="rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50">{phase === "working" ? t.working : t.apply}</button>
            </div>
          </div>

          {autoMsg && <p className="mt-3 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-4 py-2.5 text-[12.5px] text-[color:var(--muted)]">{autoMsg}</p>}

          <div className="mt-5 space-y-4">
            {pages.map((pg) => (
              <div key={pg.idx} className="mx-auto w-full max-w-2xl">
                <div
                  className="relative w-full touch-none overflow-hidden rounded-[var(--radius)] border border-[color:var(--line)] bg-white select-none"
                  style={{ paddingBottom: `${pg.ratio * 100}%` }}
                  onPointerDown={(e) => onDown(e, pg.idx)}
                  onPointerMove={onMove}
                  onPointerUp={onUp}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={pg.url} alt={`page ${pg.idx + 1}`} draggable={false} className="pointer-events-none absolute inset-0 h-full w-full" />
                  {boxes.filter((b) => b.page === pg.idx).map((b) => (
                    <div key={b.id} className="group absolute" style={{ left: `${b.x * 100}%`, top: `${b.y * 100}%`, width: `${b.w * 100}%`, height: `${b.h * 100}%`, background: "rgba(0,0,0,0.82)", outline: b.auto ? "1.5px solid rgba(251,191,36,0.9)" : "1.5px solid rgba(124,131,255,0.9)" }}>
                      <button type="button" onPointerDown={(e) => { e.stopPropagation(); }} onClick={(e) => { e.stopPropagation(); removeBox(b.id); }} className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--accent)] text-[11px] font-bold text-white opacity-0 transition group-hover:opacity-100">✕</button>
                    </div>
                  ))}
                </div>
                <p className="mt-1 text-center text-[11.5px] text-[color:var(--muted)]">{locale === "zh" ? `第 ${pg.idx + 1} 页` : locale === "zh-Hant" ? toHant(`第 ${pg.idx + 1} 页`) : `Page ${pg.idx + 1}`}</p>
              </div>
            ))}
          </div>

          <p className="mt-6 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-4 py-3 text-[12.5px] leading-5 text-[color:var(--muted)]">{t.note}</p>
        </>
      )}

      {error && <div className="mt-4 rounded-[var(--radius)] border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13.5px] text-[#f87171]">{error}</div>}
      <ToolSections locale={locale} content={sec} />
      <ToolFaq tool="redact-pdf" locale={locale} />
    </div>
  );
}
