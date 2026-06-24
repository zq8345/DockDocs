"use client";

import { trackToolRun } from "@/lib/track";
import { ToolFaq } from "@/components/ToolFaq";
import { ToolSections, type ToolSectionsContent } from "@/components/ToolSections";
import { UploadDropzone } from "@/components/UploadDropzone";
import { encryptedPdfMessage } from "@/lib/pdf-errors";
import { checkUsage, markUsage } from "@/lib/usage-gate";
import { UpgradePrompt } from "@/components/ui/UpgradePrompt";
import { authHeader } from "@/lib/supabase";
import { deepHant, toHant } from "@/lib/zh-hant";
import type { RouteLocale, AuthoredCopy, AuthoredLocale } from "@/lib/i18n";

import { useCallback, useState } from "react";

type Locale = RouteLocale;

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

const STR_EN = {
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
};

const STR = {
  en: STR_EN,
  zh: {
    title: "PDF 翻译",
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
  es: {
    title: "Traducir PDF",
    subtitle:
      "Sube un PDF, elige un idioma y obtén el texto traducido. La IA traduce el texto del documento, procesado de forma privada y solo texto por ahora (la conservación del diseño llegará pronto).",
    drop: "Arrastra y suelta un PDF aquí, o haz clic para elegir",
    choose: "Elegir PDF",
    extracting: "Leyendo el PDF…",
    pagesChars: (p: number, c: number) => `${p} páginas · ${c.toLocaleString()} caracteres`,
    noText: "No se encontró texto seleccionable. ¿Es un PDF escaneado? Aplica OCR primero.",
    tooLong: `Este PDF tiene más texto que el límite de ${MAX_CHARS.toLocaleString()} caracteres. Usa un documento más corto (unas 10 páginas).`,
    target: "Traducir a",
    translate: "Traducir",
    translating: "Traduciendo…",
    result: "Traducción",
    copy: "Copiar",
    copied: "¡Copiado!",
    download: "Descargar .txt",
    reset: "Empezar de nuevo",
    errPrefix: "La traducción falló: ",
    privacy: "Tu archivo se lee en tu navegador; solo se envía el texto extraído para traducirlo.",
  },
  pt: {
    title: "Traduzir PDF",
    subtitle:
      "Envie um PDF, escolha um idioma e receba o texto traduzido. A IA traduz o texto do documento — processado de forma privada, somente texto por enquanto (preservação do layout em breve).",
    drop: "Arraste e solte um PDF aqui, ou clique para escolher",
    choose: "Escolher PDF",
    extracting: "Lendo o PDF…",
    pagesChars: (p: number, c: number) => `${p} páginas · ${c.toLocaleString()} caracteres`,
    noText: "Nenhum texto selecionável encontrado. É um PDF digitalizado? Execute o OCR primeiro.",
    tooLong: `Este PDF tem mais texto do que o limite de ${MAX_CHARS.toLocaleString()} caracteres. Use um documento mais curto (cerca de 10 páginas).`,
    target: "Traduzir para",
    translate: "Traduzir",
    translating: "Traduzindo…",
    result: "Tradução",
    copy: "Copiar",
    copied: "Copiado!",
    download: "Baixar .txt",
    reset: "Recomeçar",
    errPrefix: "A tradução falhou: ",
    privacy: "Seu arquivo é lido no seu navegador; apenas o texto extraído é enviado para tradução.",
  },
  fr: {
    title: "Traduire un PDF",
    subtitle:
      "Téléversez un PDF, choisissez une langue et obtenez le texte traduit. L'IA traduit le contenu textuel du document — traitement privé, texte uniquement pour l'instant (la conservation de la mise en page arrive bientôt).",
    drop: "Faites glisser un PDF ici, ou cliquez pour choisir",
    choose: "Choisir un PDF",
    extracting: "Lecture du PDF…",
    pagesChars: (p: number, c: number) => `${p} pages · ${c.toLocaleString()} caractères`,
    noText: "Aucun texte sélectionnable trouvé. Est-ce un PDF numérisé ? Appliquez d'abord l'OCR.",
    tooLong: `Ce PDF contient plus de texte que la limite de ${MAX_CHARS.toLocaleString()} caractères. Utilisez un document plus court (environ 10 pages).`,
    target: "Traduire vers",
    translate: "Traduire",
    translating: "Traduction en cours…",
    result: "Traduction",
    copy: "Copier",
    copied: "Copié !",
    download: "Télécharger .txt",
    reset: "Recommencer",
    errPrefix: "La traduction a échoué : ",
    privacy: "Votre fichier est lu dans votre navigateur ; seul le texte extrait est envoyé pour la traduction.",
  },
  ja: {
    title: "PDFを翻訳",
    subtitle:
      "PDFをアップロードし、言語を選んで翻訳されたテキストを取得します。AIが文書のテキストを翻訳します——プライベートに処理され、現在はテキストのみ対応（レイアウト保持は近日対応）。",
    drop: "ここにPDFをドラッグ＆ドロップ、またはクリックして選択",
    choose: "PDFを選択",
    extracting: "PDFを読み取り中…",
    pagesChars: (p: number, c: number) => `${p}ページ · ${c.toLocaleString()}文字`,
    noText: "選択可能なテキストが見つかりません。スキャンされたPDFですか？先にOCRを実行してください。",
    tooLong: `このPDFは${MAX_CHARS.toLocaleString()}文字の上限を超えるテキストを含んでいます。より短い文書（約10ページ）をお使いください。`,
    target: "翻訳先",
    translate: "翻訳",
    translating: "翻訳中…",
    result: "翻訳",
    copy: "コピー",
    copied: "コピーしました！",
    download: ".txtをダウンロード",
    reset: "最初からやり直す",
    errPrefix: "翻訳に失敗しました: ",
    privacy: "ファイルはブラウザ内で読み取られ、抽出されたテキストのみが翻訳のために送信されます。",
  },
  de: {
    title: "PDF übersetzen",
    subtitle:
      "Laden Sie ein PDF hoch, wählen Sie eine Sprache und erhalten Sie den übersetzten Text. Die KI übersetzt den Text des Dokuments — privat verarbeitet, vorerst nur Text (eine layouterhaltende Ausgabe folgt).",
    drop: "Ziehen Sie ein PDF hierher oder klicken Sie zum Auswählen",
    choose: "PDF auswählen",
    extracting: "PDF wird gelesen…",
    pagesChars: (p: number, c: number) => `${p} Seiten · ${c.toLocaleString()} Zeichen`,
    noText: "Kein auswählbarer Text gefunden. Ist das ein gescanntes PDF? Führen Sie zuerst eine OCR durch.",
    tooLong: `Dieses PDF enthält mehr Text als das Limit von ${MAX_CHARS.toLocaleString()} Zeichen. Verwenden Sie ein kürzeres Dokument (etwa 10 Seiten).`,
    target: "Übersetzen nach",
    translate: "Übersetzen",
    translating: "Wird übersetzt…",
    result: "Übersetzung",
    copy: "Kopieren",
    copied: "Kopiert!",
    download: ".txt herunterladen",
    reset: "Neu beginnen",
    errPrefix: "Übersetzung fehlgeschlagen: ",
    privacy: "Ihre Datei wird in Ihrem Browser gelesen; nur der extrahierte Text wird zum Übersetzen gesendet.",
  },
} satisfies AuthoredCopy<typeof STR_EN>;

type Phase = "idle" | "extracting" | "ready" | "translating" | "done";

// Localize a language option label. LANGS carries only en/zh labels by design, so
// every non-zh authored locale renders the English label. Written as an exhaustive
// switch (never default) so adding a new route locale forces an explicit decision
// here instead of silently falling through to the English label.
function langLabel(l: { en: string; zh: string }, locale: Locale): string {
  if (locale === "zh-Hant") return toHant(l.zh);
  // ko has no authored copy yet → English (foundation phase). Mirrors zh-Hant special-casing.
  const authored: AuthoredLocale = locale === "ko" ? "en" : locale;
  switch (authored) {
    case "zh":
      return l.zh;
    case "en":
    case "es":
    case "pt":
    case "fr":
    case "ja":
    case "de":
      return l.en;
    default: {
      const _exhaustive: never = authored;
      return _exhaustive;
    }
  }
}

const SECTIONS: Record<AuthoredLocale, ToolSectionsContent> = {
  en: {
    benefitsTitle: "What the PDF translator does",
    benefitsDescription: "Turn a PDF in one language into readable text in another, without retyping it.",
    benefits: [
      { title: "Translate into 18 languages", description: "Pick from English, Chinese, Spanish, French, Japanese, Arabic, Hindi and more — the AI renders your document's text in the target language you choose." },
      { title: "Full prose, not word-by-word", description: "The extracted text is translated as connected sentences, so the result reads naturally instead of as a stitched-together glossary." },
      { title: "Copy or download as .txt", description: "Get the translation as plain text you can copy straight into an email or save as a .txt file — layout-preserving output is on the roadmap." },
    ],
    workflowTitle: "How translation fits your document work",
    workflowDescription: "When a PDF arrives in a language your team doesn't read — a foreign contract, a supplier's spec sheet, a research paper.",
    steps: [
      "Upload the PDF; its text is extracted in your browser and the text is sent to the AI.",
      "Choose the language you want it translated into and start the translation.",
      "Read the result on screen, then copy it or download it as a .txt file.",
    ],
    readingTitle: "More AI document tools",
    readingDescription: "Related ways to work with what a document says, not just its format.",
    readingLinks: [
      { label: "Chat with a PDF", href: "/chat-with-pdf", description: "Ask questions about a document and get answers drawn from its text." },
      { label: "Summarize a PDF", href: "/ai-summary", description: "Condense a long document into its key points before or after translating it." },
      { label: "AI document resources", href: "/resources", description: "A structured hub for AI document tools, conversion, and PDF workflows." },
    ],
  },
  zh: {
    benefitsTitle: "PDF 翻译工具能做什么",
    benefitsDescription: "把一种语言的 PDF 转成另一种语言的可读文字，无需重新打字。",
    benefits: [
      { title: "翻译成 18 种语言", description: "可选英语、中文、西班牙语、法语、日语、阿拉伯语、印地语等——AI 会把文档中的文字翻成你选的目标语言。" },
      { title: "成段译文，而非逐词", description: "提取出的文字按连贯的句子翻译，结果读起来自然流畅，而不是拼凑的词汇表。" },
      { title: "复制或下载为 .txt", description: "译文以纯文本呈现，可直接复制进邮件或保存为 .txt 文件——保留版式的输出已在规划中。" },
    ],
    workflowTitle: "翻译如何融入你的文档工作",
    workflowDescription: "当一份 PDF 是团队看不懂的语言时——外文合同、供应商规格表、研究论文。",
    steps: [
      "上传 PDF，文字在你的浏览器中提取，文字随后发送给 AI。",
      "选择要翻译成的语言并开始翻译。",
      "在屏幕上查看结果，然后复制或下载为 .txt 文件。",
    ],
    readingTitle: "更多 AI 文档工具",
    readingDescription: "围绕文档“说了什么”而非仅是格式的相关方式。",
    readingLinks: [
      { label: "与 PDF 对话", href: "/chat-with-pdf", description: "就文档提问，获得基于其文字内容的回答。" },
      { label: "总结 PDF", href: "/ai-summary", description: "在翻译前后把长文档浓缩成要点。" },
      { label: "AI 文档资源", href: "/resources", description: "按工作流整理 AI 文档工具、转换和 PDF 流程的中心。" },
    ],
  },
  es: {
    benefitsTitle: "Qué hace el traductor de PDF",
    benefitsDescription: "Convierte un PDF de un idioma en texto legible en otro, sin volver a teclearlo.",
    benefits: [
      { title: "Traduce a 18 idiomas", description: "Elige entre inglés, chino, español, francés, japonés, árabe, hindi y más: la IA traduce el texto de tu documento al idioma de destino que elijas." },
      { title: "Prosa completa, no palabra por palabra", description: "El texto extraído se traduce como frases conectadas, así el resultado se lee con naturalidad en lugar de como un glosario improvisado." },
      { title: "Copia o descarga como .txt", description: "Obtén la traducción como texto plano que puedes pegar en un correo o guardar como archivo .txt; la salida que conserva el diseño está en la hoja de ruta." },
    ],
    workflowTitle: "Cómo encaja la traducción en tu trabajo",
    workflowDescription: "Cuando llega un PDF en un idioma que tu equipo no lee: un contrato extranjero, una ficha técnica de un proveedor, un artículo de investigación.",
    steps: [
      "Sube el PDF; su texto se extrae en tu navegador y el texto se envía a la IA.",
      "Elige el idioma al que quieres traducirlo e inicia la traducción.",
      "Lee el resultado en pantalla y luego cópialo o descárgalo como archivo .txt.",
    ],
    readingTitle: "Más herramientas de documentos con IA",
    readingDescription: "Formas relacionadas de trabajar con lo que dice un documento, no solo su formato.",
    readingLinks: [
      { label: "Chatea con un PDF", href: "/chat-with-pdf", description: "Haz preguntas sobre un documento y obtén respuestas extraídas de su texto." },
      { label: "Resumir un PDF", href: "/ai-summary", description: "Condensa un documento largo en sus puntos clave antes o después de traducirlo." },
      { label: "Recursos de documentos con IA", href: "/resources", description: "Un centro estructurado de herramientas de documentos con IA, conversión y flujos PDF." },
    ],
  },
  pt: {
    benefitsTitle: "O que o tradutor de PDF faz",
    benefitsDescription: "Transforme um PDF em um idioma em texto legível em outro, sem redigitar.",
    benefits: [
      { title: "Traduza para 18 idiomas", description: "Escolha entre inglês, chinês, espanhol, francês, japonês, árabe, hindi e mais: a IA traduz o texto do seu documento para o idioma de destino escolhido." },
      { title: "Prosa completa, não palavra por palavra", description: "O texto extraído é traduzido como frases conectadas, então o resultado se lê com naturalidade em vez de um glossário emendado." },
      { title: "Copie ou baixe como .txt", description: "Receba a tradução como texto simples para colar em um e-mail ou salvar como arquivo .txt; a saída que preserva o layout está no roadmap." },
    ],
    workflowTitle: "Como a tradução se encaixa no seu trabalho",
    workflowDescription: "Quando chega um PDF em um idioma que sua equipe não lê: um contrato estrangeiro, uma ficha técnica de fornecedor, um artigo de pesquisa.",
    steps: [
      "Envie o PDF; o texto é extraído no seu navegador e o texto é enviado para a IA.",
      "Escolha o idioma para o qual quer traduzir e inicie a tradução.",
      "Leia o resultado na tela e depois copie ou baixe como arquivo .txt.",
    ],
    readingTitle: "Mais ferramentas de documentos com IA",
    readingDescription: "Formas relacionadas de trabalhar com o que um documento diz, não apenas seu formato.",
    readingLinks: [
      { label: "Converse com um PDF", href: "/chat-with-pdf", description: "Faça perguntas sobre um documento e receba respostas extraídas do texto dele." },
      { label: "Resumir um PDF", href: "/ai-summary", description: "Condense um documento longo em seus pontos principais antes ou depois de traduzi-lo." },
      { label: "Recursos de documentos com IA", href: "/resources", description: "Um hub estruturado de ferramentas de documentos com IA, conversão e fluxos PDF." },
    ],
  },
  fr: {
    benefitsTitle: "Ce que fait le traducteur de PDF",
    benefitsDescription: "Transformez un PDF d'une langue en texte lisible dans une autre, sans le retaper.",
    benefits: [
      { title: "Traduisez vers 18 langues", description: "Choisissez parmi l'anglais, le chinois, l'espagnol, le français, le japonais, l'arabe, l'hindi et plus : l'IA traduit le texte de votre document dans la langue cible choisie." },
      { title: "Une prose complète, pas mot à mot", description: "Le texte extrait est traduit en phrases reliées, le résultat se lit donc naturellement plutôt que comme un glossaire bricolé." },
      { title: "Copiez ou téléchargez en .txt", description: "Obtenez la traduction en texte brut à coller dans un e-mail ou à enregistrer en fichier .txt ; la sortie conservant la mise en page est prévue." },
    ],
    workflowTitle: "Comment la traduction s'intègre à votre travail",
    workflowDescription: "Quand un PDF arrive dans une langue que votre équipe ne lit pas : un contrat étranger, une fiche technique de fournisseur, un article de recherche.",
    steps: [
      "Téléversez le PDF ; son texte est extrait dans votre navigateur et le texte est envoyé à l'IA.",
      "Choisissez la langue vers laquelle traduire et lancez la traduction.",
      "Lisez le résultat à l'écran, puis copiez-le ou téléchargez-le en fichier .txt.",
    ],
    readingTitle: "Plus d'outils documentaires IA",
    readingDescription: "Façons connexes de travailler sur ce que dit un document, pas seulement son format.",
    readingLinks: [
      { label: "Discuter avec un PDF", href: "/chat-with-pdf", description: "Posez des questions sur un document et obtenez des réponses tirées de son texte." },
      { label: "Résumer un PDF", href: "/ai-summary", description: "Condensez un long document en ses points clés avant ou après la traduction." },
      { label: "Ressources documentaires IA", href: "/resources", description: "Un hub structuré d'outils documentaires IA, de conversion et de parcours PDF." },
    ],
  },
  ja: {
    benefitsTitle: "PDF 翻訳ツールでできること",
    benefitsDescription: "ある言語の PDF を別の言語の読めるテキストに変換します。打ち直し不要です。",
    benefits: [
      { title: "18 の言語に翻訳", description: "英語、中国語、スペイン語、フランス語、日本語、アラビア語、ヒンディー語などから選択——AI が文書のテキストを選んだ言語に翻訳します。" },
      { title: "単語単位ではなく文章として", description: "抽出されたテキストはつながった文として翻訳されるため、結果は寄せ集めの用語集ではなく自然に読めます。" },
      { title: "コピーまたは .txt でダウンロード", description: "翻訳はプレーンテキストで得られ、メールに貼り付けたり .txt ファイルとして保存できます——レイアウト保持の出力は対応予定です。" },
    ],
    workflowTitle: "翻訳が文書作業にどう役立つか",
    workflowDescription: "チームが読めない言語の PDF が届いたとき——外国語の契約書、取引先の仕様書、研究論文。",
    steps: [
      "PDF をアップロードします。テキストはブラウザ内で抽出され、そのテキストが AI に送信されます。",
      "翻訳したい言語を選んで翻訳を開始します。",
      "結果を画面で確認し、コピーするか .txt ファイルとしてダウンロードします。",
    ],
    readingTitle: "他の AI 文書ツール",
    readingDescription: "形式だけでなく、文書が何を述べているかを扱う関連手段。",
    readingLinks: [
      { label: "PDF とチャット", href: "/chat-with-pdf", description: "文書について質問し、そのテキストに基づく回答を得ます。" },
      { label: "PDF を要約", href: "/ai-summary", description: "翻訳の前後に、長い文書を要点へ凝縮します。" },
      { label: "AI 文書リソース", href: "/resources", description: "AI 文書ツール、変換、PDF ワークフローを整理したハブ。" },
    ],
  },
  de: {
    benefitsTitle: "Was der PDF-Übersetzer leistet",
    benefitsDescription: "Verwandeln Sie ein PDF aus einer Sprache in lesbaren Text in einer anderen, ohne es neu abzutippen.",
    benefits: [
      { title: "In 18 Sprachen übersetzen", description: "Wählen Sie aus Englisch, Chinesisch, Spanisch, Französisch, Japanisch, Arabisch, Hindi und mehr — die KI gibt den Text Ihres Dokuments in der gewählten Zielsprache wieder." },
      { title: "Vollständiger Fließtext, nicht Wort für Wort", description: "Der extrahierte Text wird als zusammenhängende Sätze übersetzt, sodass sich das Ergebnis natürlich liest und nicht wie ein zusammengestückeltes Glossar." },
      { title: "Kopieren oder als .txt herunterladen", description: "Erhalten Sie die Übersetzung als reinen Text, den Sie direkt in eine E-Mail kopieren oder als .txt-Datei speichern können — eine layouterhaltende Ausgabe ist geplant." },
    ],
    workflowTitle: "Wie die Übersetzung in Ihre Dokumentenarbeit passt",
    workflowDescription: "Wenn ein PDF in einer Sprache eintrifft, die Ihr Team nicht liest — ein ausländischer Vertrag, das Datenblatt eines Lieferanten, eine Forschungsarbeit.",
    steps: [
      "Laden Sie das PDF hoch; sein Text wird in Ihrem Browser extrahiert und der Text an die KI gesendet.",
      "Wählen Sie die Sprache, in die übersetzt werden soll, und starten Sie die Übersetzung.",
      "Lesen Sie das Ergebnis auf dem Bildschirm und kopieren Sie es dann oder laden Sie es als .txt-Datei herunter.",
    ],
    readingTitle: "Weitere KI-Dokumententools",
    readingDescription: "Verwandte Wege, um mit dem zu arbeiten, was ein Dokument aussagt, nicht nur mit seinem Format.",
    readingLinks: [
      { label: "Mit einem PDF chatten", href: "/chat-with-pdf", description: "Stellen Sie Fragen zu einem Dokument und erhalten Sie Antworten, die aus seinem Text stammen." },
      { label: "Ein PDF zusammenfassen", href: "/ai-summary", description: "Verdichten Sie ein langes Dokument vor oder nach der Übersetzung auf seine Kernpunkte." },
      { label: "KI-Dokumentenressourcen", href: "/resources", description: "Ein strukturierter Hub für KI-Dokumententools, Konvertierung und PDF-Workflows." },
    ],
  },
};

export function TranslatePdfClient({ locale = "en" }: { locale?: Locale }) {
  // ko has no authored copy yet → English (foundation phase). Mirrors zh-Hant special-casing.
  const al: AuthoredLocale = locale === "ko" || locale === "zh-Hant" ? "en" : locale;
  // childLocale collapses ONLY ko (preserves zh-Hant) for child props/runtime fns lacking "ko".
  const childLocale = locale === "ko" ? "en" : locale;
  const t = locale === "zh-Hant" ? deepHant(STR.zh) : STR[al];
  const sec: ToolSectionsContent = locale === "zh-Hant" ? deepHant(SECTIONS.zh) : SECTIONS[al];
  const [phase, setPhase] = useState<Phase>("idle");
  const [fileName, setFileName] = useState("");
  const [text, setText] = useState("");
  const [pages, setPages] = useState(0);
  const [target, setTarget] = useState(locale === "zh" ? "en" : "zh");
  const [result, setResult] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [limitHit, setLimitHit] = useState<number | null>(null);

  const reset = () => {
    setPhase("idle");
    setFileName("");
    setText("");
    setPages(0);
    setResult("");
    setError(null);
    setLimitHit(null);
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
        setError(encryptedPdfMessage(e, childLocale) ?? ((e instanceof Error ? e.message : String(e)) || "Could not read PDF."));
        setPhase("idle");
      }
    },
    [t, childLocale],
  );

  const onTranslate = useCallback(async () => {
    if (!text) return;
    setPhase("translating");
    setError(null);
    setLimitHit(null);
    try {
      const gate = await checkUsage("translate");
      if (!gate.allowed) {
        setLimitHit(gate.limit);
        setPhase("ready");
        return;
      }
      const auth = await authHeader();
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...auth },
        body: JSON.stringify({ text, targetLang: target, locale }),
      });
      const data = await res.json();
      if (data?.ok && typeof data.translation === "string") {
        setResult(data.translation);
        setPhase("done");
        trackToolRun("translate-pdf");
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
    <div className="mx-auto max-w-5xl px-5 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20">
      <h1 className="text-[30px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">
        {t.title}
      </h1>
      <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--muted)]">{t.subtitle}</p>

      {/* Upload */}
      {phase === "idle" || phase === "extracting" ? (
        <UploadDropzone locale={childLocale} buttonLabel={t.choose} busy={phase === "extracting"} busyLabel={t.extracting} privacy={false} onFile={onFile} />
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
                    {langLabel(l, locale)}
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

      {limitHit !== null && <UpgradePrompt locale={childLocale} limit={limitHit} />}

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
      <ToolSections locale={locale} content={sec} />
      <ToolFaq tool="translate-pdf" locale={locale} />
    </div>
  );
}
