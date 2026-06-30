"use client";

import { LAYOUT } from "@/lib/layout-constants";
import { deepHant } from "@/lib/zh-hant";

type Locale = "en" | "zh" | "es" | "pt" | "fr" | "ja" | "ko" | "de" | "zh-Hant";

const STR = {
  en: {
    heroTitle1: "PDF tools",
    heroTitle2: "built for real work.",
    heroSubtitle: "Merge, compress, convert, chat with AI — every tool you need for PDFs, all free.",
    ctaStart: "Start free",
    ctaBrowse: "Browse tools →",
    featFastTitle: "Fast & free",
    featFastDesc: "Every tool is free. No account, no watermarks, no limits.",
    featPrivacyTitle: "Privacy first",
    featPrivacyDesc: "Files processed in your browser. Nothing stored on servers.",
    featAiTitle: "AI-powered",
    featAiDesc: "Chat, summarize, translate, and extract insights from documents.",
    featGlobalTitle: "Global",
    featGlobalDesc: "12 languages. Teams in 5 cities. 30M+ users worldwide.",
    mostUsed: "Most used",
    startWith: "Start with these.",
    viewAll: "View all 26 tools →",
    isNew: "New",
    tools: {
      mergePdf: { name: "Merge PDF", desc: "Combine PDFs in the order you want." },
      compressPdf: { name: "Compress PDF", desc: "Reduce file size while optimizing quality." },
      chatWithPdf: { name: "Chat with PDF", desc: "Ask questions grounded in your document." },
      wordToPdf: { name: "Word to PDF", desc: "DOCX to high-fidelity PDF." },
      pdfToWord: { name: "PDF to Word", desc: "Extract content into editable Word." },
      splitPdf: { name: "Split PDF", desc: "Extract pages or split by range." },
    },
  },
  zh: {
    heroTitle1: "PDF 工具",
    heroTitle2: "为真实工作而生。",
    heroSubtitle: "合并、压缩、转换、与 AI 对话——所有你需要的 PDF 工具，全部免费。",
    ctaStart: "免费开始",
    ctaBrowse: "浏览工具 →",
    featFastTitle: "快速且免费",
    featFastDesc: "所有工具均免费，无需账号，无水印，无限制。",
    featPrivacyTitle: "隐私优先",
    featPrivacyDesc: "文件在浏览器中处理，不会上传至服务器。",
    featAiTitle: "AI 加持",
    featAiDesc: "对话、摘要、翻译，从文档中提取洞见。",
    featGlobalTitle: "全球化",
    featGlobalDesc: "12 种语言，5 个城市的团队，全球 3000 万+ 用户。",
    mostUsed: "最常用",
    startWith: "从这些开始。",
    viewAll: "查看全部 26 个工具 →",
    isNew: "新",
    tools: {
      mergePdf: { name: "合并 PDF", desc: "按你想要的顺序合并多个 PDF。" },
      compressPdf: { name: "压缩 PDF", desc: "在优化质量的同时减小文件大小。" },
      chatWithPdf: { name: "与 PDF 对话", desc: "基于文档内容提问。" },
      wordToPdf: { name: "Word 转 PDF", desc: "将 DOCX 转换为高保真 PDF。" },
      pdfToWord: { name: "PDF 转 Word", desc: "提取内容为可编辑的 Word 文档。" },
      splitPdf: { name: "拆分 PDF", desc: "提取页面或按范围拆分。" },
    },
  },
  es: {
    heroTitle1: "Herramientas PDF",
    heroTitle2: "hechas para el trabajo real.",
    heroSubtitle: "Fusiona, comprime, convierte, chatea con IA — todas las herramientas PDF que necesitas, totalmente gratis.",
    ctaStart: "Empezar gratis",
    ctaBrowse: "Ver herramientas →",
    featFastTitle: "Rápido y gratuito",
    featFastDesc: "Todas las herramientas son gratuitas. Sin cuenta, sin marcas de agua, sin límites.",
    featPrivacyTitle: "Privacidad primero",
    featPrivacyDesc: "Los archivos se procesan en tu navegador. Nada se almacena en servidores.",
    featAiTitle: "Con IA integrada",
    featAiDesc: "Chatea, resume, traduce y extrae información de tus documentos.",
    featGlobalTitle: "Global",
    featGlobalDesc: "12 idiomas. Equipos en 5 ciudades. Más de 30 millones de usuarios.",
    mostUsed: "Más usadas",
    startWith: "Empieza con estas.",
    viewAll: "Ver las 26 herramientas →",
    isNew: "Nuevo",
    tools: {
      mergePdf: { name: "Unir PDF", desc: "Combina PDFs en el orden que quieras." },
      compressPdf: { name: "Comprimir PDF", desc: "Reduce el tamaño del archivo optimizando la calidad." },
      chatWithPdf: { name: "Chat con PDF", desc: "Haz preguntas basadas en tu documento." },
      wordToPdf: { name: "Word a PDF", desc: "DOCX a PDF de alta fidelidad." },
      pdfToWord: { name: "PDF a Word", desc: "Extrae el contenido en un Word editable." },
      splitPdf: { name: "Dividir PDF", desc: "Extrae páginas o divide por rango." },
    },
  },
  pt: {
    heroTitle1: "Ferramentas PDF",
    heroTitle2: "feitas para o trabalho real.",
    heroSubtitle: "Mescle, comprima, converta, converse com IA — todas as ferramentas PDF que você precisa, totalmente grátis.",
    ctaStart: "Começar grátis",
    ctaBrowse: "Ver ferramentas →",
    featFastTitle: "Rápido e gratuito",
    featFastDesc: "Todas as ferramentas são gratuitas. Sem conta, sem marcas d'água, sem limites.",
    featPrivacyTitle: "Privacidade em primeiro lugar",
    featPrivacyDesc: "Os arquivos são processados no seu navegador. Nada é armazenado em servidores.",
    featAiTitle: "Com IA integrada",
    featAiDesc: "Converse, resuma, traduza e extraia informações dos seus documentos.",
    featGlobalTitle: "Global",
    featGlobalDesc: "12 idiomas. Equipes em 5 cidades. Mais de 30 milhões de usuários.",
    mostUsed: "Mais usadas",
    startWith: "Comece com estas.",
    viewAll: "Ver todas as 26 ferramentas →",
    isNew: "Novo",
    tools: {
      mergePdf: { name: "Mesclar PDF", desc: "Combine PDFs na ordem que quiser." },
      compressPdf: { name: "Comprimir PDF", desc: "Reduza o tamanho do arquivo otimizando a qualidade." },
      chatWithPdf: { name: "Chat com PDF", desc: "Faça perguntas baseadas no seu documento." },
      wordToPdf: { name: "Word para PDF", desc: "DOCX para PDF de alta fidelidade." },
      pdfToWord: { name: "PDF para Word", desc: "Extraia o conteúdo para um Word editável." },
      splitPdf: { name: "Dividir PDF", desc: "Extraia páginas ou divida por intervalo." },
    },
  },
  fr: {
    heroTitle1: "Outils PDF",
    heroTitle2: "conçus pour le vrai travail.",
    heroSubtitle: "Fusionnez, compressez, convertissez, discutez avec l'IA — tous les outils PDF dont vous avez besoin, entièrement gratuits.",
    ctaStart: "Commencer gratuitement",
    ctaBrowse: "Parcourir les outils →",
    featFastTitle: "Rapide et gratuit",
    featFastDesc: "Tous les outils sont gratuits. Sans compte, sans filigrane, sans limites.",
    featPrivacyTitle: "La vie privée avant tout",
    featPrivacyDesc: "Les fichiers sont traités dans votre navigateur. Rien n'est stocké sur les serveurs.",
    featAiTitle: "Propulsé par l'IA",
    featAiDesc: "Discutez, résumez, traduisez et extrayez des informations de vos documents.",
    featGlobalTitle: "Mondial",
    featGlobalDesc: "12 langues. Des équipes dans 5 villes. Plus de 30 millions d'utilisateurs.",
    mostUsed: "Les plus utilisés",
    startWith: "Commencez par ceux-ci.",
    viewAll: "Voir les 26 outils →",
    isNew: "Nouveau",
    tools: {
      mergePdf: { name: "Fusionner des PDF", desc: "Combinez des PDF dans l'ordre souhaité." },
      compressPdf: { name: "Compresser un PDF", desc: "Réduisez la taille du fichier tout en optimisant la qualité." },
      chatWithPdf: { name: "Chat avec PDF", desc: "Posez des questions ancrées dans votre document." },
      wordToPdf: { name: "Word en PDF", desc: "DOCX vers PDF haute fidélité." },
      pdfToWord: { name: "PDF en Word", desc: "Extrayez le contenu dans un Word modifiable." },
      splitPdf: { name: "Diviser un PDF", desc: "Extrayez des pages ou divisez par plage." },
    },
  },
  ja: {
    heroTitle1: "PDF ツール",
    heroTitle2: "実際の仕事のために。",
    heroSubtitle: "結合、圧縮、変換、AI との対話 — 必要な PDF ツールがすべて、しかも無料で。",
    ctaStart: "無料で始める",
    ctaBrowse: "ツールを見る →",
    featFastTitle: "高速で無料",
    featFastDesc: "すべてのツールが無料。アカウント不要、透かしなし、制限なし。",
    featPrivacyTitle: "プライバシー最優先",
    featPrivacyDesc: "ファイルはブラウザ内で処理されます。サーバーには何も保存されません。",
    featAiTitle: "AI 搭載",
    featAiDesc: "対話、要約、翻訳、ドキュメントからの洞察の抽出。",
    featGlobalTitle: "グローバル",
    featGlobalDesc: "12 言語。5 都市のチーム。世界中で 3,000 万人以上のユーザー。",
    mostUsed: "よく使われる",
    startWith: "まずはこちらから。",
    viewAll: "26 個すべてのツールを見る →",
    isNew: "新着",
    tools: {
      mergePdf: { name: "PDF を結合", desc: "好きな順番で PDF を結合します。" },
      compressPdf: { name: "PDF を圧縮", desc: "品質を保ちながらファイルサイズを縮小します。" },
      chatWithPdf: { name: "PDF と対話", desc: "ドキュメントに基づいて質問できます。" },
      wordToPdf: { name: "Word を PDF に", desc: "DOCX を高精度な PDF に変換します。" },
      pdfToWord: { name: "PDF を Word に", desc: "内容を編集可能な Word に抽出します。" },
      splitPdf: { name: "PDF を分割", desc: "ページを抽出するか範囲で分割します。" },
    },
  },
  ko: {
    heroTitle1: "PDF 도구",
    heroTitle2: "실제 업무를 위해 만들었습니다.",
    heroSubtitle: "병합, 압축, 변환, AI와 대화 — 필요한 PDF 도구를 모두, 무료로.",
    ctaStart: "무료로 시작",
    ctaBrowse: "도구 둘러보기 →",
    featFastTitle: "빠르고 무료",
    featFastDesc: "모든 도구가 무료입니다. 계정도, 워터마크도, 제한도 없습니다.",
    featPrivacyTitle: "프라이버시 우선",
    featPrivacyDesc: "파일은 브라우저에서 처리됩니다. 서버에 아무것도 저장되지 않습니다.",
    featAiTitle: "AI 기반",
    featAiDesc: "문서와 대화하고, 요약하고, 번역하고, 인사이트를 추출합니다.",
    featGlobalTitle: "글로벌",
    featGlobalDesc: "12개 언어. 5개 도시의 팀. 전 세계 3,000만 명 이상의 사용자.",
    mostUsed: "가장 많이 사용",
    startWith: "여기서 시작하세요.",
    viewAll: "26개 도구 전체 보기 →",
    isNew: "신규",
    tools: {
      mergePdf: { name: "PDF 병합", desc: "원하는 순서로 PDF를 결합합니다." },
      compressPdf: { name: "PDF 압축", desc: "품질을 유지하며 파일 크기를 줄입니다." },
      chatWithPdf: { name: "PDF와 대화", desc: "문서에 근거해 질문할 수 있습니다." },
      wordToPdf: { name: "Word를 PDF로", desc: "DOCX를 고품질 PDF로 변환합니다." },
      pdfToWord: { name: "PDF를 Word로", desc: "내용을 편집 가능한 Word로 추출합니다." },
      splitPdf: { name: "PDF 분할", desc: "페이지를 추출하거나 범위로 분할합니다." },
    },
  },
  de: {
    heroTitle1: "PDF-Tools",
    heroTitle2: "für echte Arbeit gemacht.",
    heroSubtitle: "Zusammenführen, komprimieren, konvertieren, mit KI chatten — alle PDF-Tools, die Sie brauchen, völlig kostenlos.",
    ctaStart: "Kostenlos starten",
    ctaBrowse: "Tools ansehen →",
    featFastTitle: "Schnell und kostenlos",
    featFastDesc: "Alle Tools sind kostenlos. Kein Konto, kein Wasserzeichen, keine Einschränkungen.",
    featPrivacyTitle: "Datenschutz zuerst",
    featPrivacyDesc: "Dateien werden im Browser verarbeitet. Nichts wird auf Servern gespeichert.",
    featAiTitle: "KI-gestützt",
    featAiDesc: "Chatten, zusammenfassen, übersetzen und Erkenntnisse aus Dokumenten gewinnen.",
    featGlobalTitle: "Global",
    featGlobalDesc: "12 Sprachen. Teams in 5 Städten. Über 30 Millionen Nutzer weltweit.",
    mostUsed: "Am häufigsten genutzt",
    startWith: "Hier starten.",
    viewAll: "Alle 26 Tools anzeigen →",
    isNew: "Neu",
    tools: {
      mergePdf: { name: "PDF zusammenführen", desc: "PDFs in der gewünschten Reihenfolge zusammenführen." },
      compressPdf: { name: "PDF komprimieren", desc: "Dateigröße reduzieren und Qualität optimieren." },
      chatWithPdf: { name: "Mit PDF chatten", desc: "Fragen zu Ihrem Dokument stellen." },
      wordToPdf: { name: "Word zu PDF", desc: "DOCX in hochauflösendes PDF umwandeln." },
      pdfToWord: { name: "PDF zu Word", desc: "Inhalte in bearbeitbares Word extrahieren." },
      splitPdf: { name: "PDF aufteilen", desc: "Seiten extrahieren oder nach Bereich aufteilen." },
    },
  },
};

const toolIcons: Record<string, string> = {
  "chat-with-pdf": "💬", "ai-summary": "📋", "ocr-pdf": "🔍", "translate-pdf": "🌐",
  "word-to-pdf": "📄", "pdf-to-word": "📕", "excel-to-pdf": "📊", "pdf-to-excel": "📕",
  "ppt-to-pdf": "🖥", "jpg-to-pdf": "🖼", "png-to-pdf": "🖼", "pdf-to-jpg": "📕",
  "pdf-to-png": "📕", "pdf-to-markdown": "📕",
  "merge-pdf": "🔗", "split-pdf": "✂️", "compress-pdf": "📦",
  "delete-page": "🗑", "rotate-page": "🔄", "reorder-pages": "📑", "add-page": "➕",
  "protect-pdf": "🔒", "unlock-pdf": "🔓", "edit-pdf": "✏️", "sign-pdf": "✍️",
};

type ToolCard = { name: string; href: string; category: string; isNew?: boolean; desc: string };

export function HomeClient({ locale = "en" }: { locale?: Locale }) {
  const t = locale === "zh-Hant" ? deepHant(STR.zh) : ((STR as Record<string, typeof STR.en>)[locale] ?? STR.en);

  const highlightTools: ToolCard[] = [
    { name: t.tools.mergePdf.name, href: "/merge-pdf", category: "popular", desc: t.tools.mergePdf.desc },
    { name: t.tools.compressPdf.name, href: "/compress-pdf", category: "popular", desc: t.tools.compressPdf.desc },
    { name: t.tools.chatWithPdf.name, href: "/chat-with-pdf", category: "popular", desc: t.tools.chatWithPdf.desc, isNew: true },
    { name: t.tools.wordToPdf.name, href: "/word-to-pdf", category: "convert", desc: t.tools.wordToPdf.desc },
    { name: t.tools.pdfToWord.name, href: "/pdf-to-word", category: "convert", desc: t.tools.pdfToWord.desc },
    { name: t.tools.splitPdf.name, href: "/split-pdf", category: "popular", desc: t.tools.splitPdf.desc },
  ];

  const features = [
    { icon: "⚡", title: t.featFastTitle, desc: t.featFastDesc },
    { icon: "🔒", title: t.featPrivacyTitle, desc: t.featPrivacyDesc },
    { icon: "🤖", title: t.featAiTitle, desc: t.featAiDesc },
    { icon: "🌍", title: t.featGlobalTitle, desc: t.featGlobalDesc },
  ];

  return (
    <>
      {/* Hero */}
      <section className="border-b border-[color:var(--line)]">
        <div className={`mx-auto grid ${LAYOUT.content} items-center gap-12 px-5 py-20 sm:py-28 lg:grid-cols-2 lg:py-36`}>
          <div>
            <h1 className="text-[40px] font-semibold leading-[1.04] tracking-[-0.022em] sm:text-[52px] sm:leading-[1.02]">
              {t.heroTitle1}<br /><span className="text-[color:var(--accent-strong)]">{t.heroTitle2}</span>
            </h1>
            <p className="mt-6 max-w-lg text-[16px] leading-relaxed text-[color:var(--muted)]">
              {t.heroSubtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="/merge-pdf" className="inline-flex min-h-[44px] items-center rounded-[var(--radius)] bg-[color:var(--accent)] px-5 text-[14px] font-semibold text-white shadow-[0_1px_3px_rgba(0,0,0,0.3)] transition hover:bg-[color:var(--accent-hover)]">{t.ctaStart}</a>
              <a href="#tools" className="inline-flex min-h-[44px] items-center rounded-[var(--radius)] border border-[color:var(--line)] px-5 text-[14px] font-medium transition hover:border-[color:var(--line-strong)]">{t.ctaBrowse}</a>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] p-8">
              <div className="grid grid-cols-3 gap-3">
                {["📄→📕", "📄→📊", "🔗", "📦", "🤖", "🔒", "✂️", "🔄", "✏️"].map((icon, i) => (
                  <div key={i} className="flex aspect-square items-center justify-center rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--surface)] text-[28px]">{icon}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-[color:var(--line)]">
        <div className={`mx-auto ${LAYOUT.content} px-5 py-20 sm:py-24`}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] p-6 transition hover:border-[color:var(--line-strong)]">
                <span className="text-[24px]">{f.icon}</span>
                <h3 className="mt-4 text-[16px] font-semibold">{f.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-[color:var(--muted)]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular tools */}
      <section id="tools" className="border-b border-[color:var(--line)]">
        <div className={`mx-auto ${LAYOUT.content} px-5 py-20 sm:py-24`}>
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--faint)]">{t.mostUsed}</p>
          <h2 className="mt-3 text-center text-[28px] font-semibold tracking-[-0.014em]">{t.startWith}</h2>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {highlightTools.map((tool) => (
              <a key={tool.href} href={tool.href} className="group relative flex items-start gap-4 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5 transition hover:border-[color:var(--line-strong)] hover:bg-[color:var(--surface-raised)]">
                {tool.isNew && <span className="absolute -top-1.5 -right-1.5 rounded-full bg-[color:var(--accent)] px-2 py-0.5 text-[9px] font-bold uppercase text-white shadow-sm">{t.isNew}</span>}
                <span className="shrink-0 pt-0.5 text-[24px]">{toolIcons[tool.href.replace(/^\//, "")] || "📄"}</span>
                <div><h3 className="text-[15px] font-semibold">{tool.name}</h3><p className="mt-1 text-[13px] leading-relaxed text-[color:var(--muted)]">{tool.desc}</p></div>
              </a>
            ))}
          </div>
          <p className="mt-8 text-center">
            <a href="/" className="text-[13px] font-medium text-[color:var(--accent-strong)] hover:underline">{t.viewAll}</a>
          </p>
        </div>
      </section>
    </>
  );
}
