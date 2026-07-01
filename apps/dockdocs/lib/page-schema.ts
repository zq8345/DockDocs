// 本地化页面的结构化数据(JSON-LD)。
// catch-all 渲染的 /zh/、/zh/about、/zh/pricing 等之前缺 schema，这里统一生成。
// en 根路径(/、/about、/pricing)已在各自 page.tsx 注入，本文件供带语言前缀的页面使用。

const SITE = "https://dockdocs.app";
const baseFor = (locale: string) => (locale === "en" ? SITE : `${SITE}/${locale}`);

// North-star home FAQ (machine layer) — the two questions that carry the
// positioning: "is the AI making it up?" (answered with source-traceability)
// and "how is this different from a general chatbot?". Native per locale.
const HOME_FAQ: Record<string, { q: string; a: string }[]> = {
  en: [
    { q: "How do I know the AI isn't making it up?", a: "When the AI answers or extracts, it points back to the exact source passage in your own document so you can click to the original and check it yourself — you never have to take the AI's word for it. When a claim can't be grounded in your file, DockDocs flags it rather than presenting it as fact. This source-traceability is the core difference from a general chatbot." },
    { q: "What makes DockDocs different from other PDF tools and from a general AI chatbot?", a: "Two things a general AI chatbot can't offer: privacy you can verify and answers you can trust. Most DockDocs tools run in your browser, so sensitive files never leave your device. And its document AI shows the exact source passage behind its answers, and flags what it can't trace, so you can verify what it tells you. It's built for the documents you can't paste into a general chatbot — contracts, financials, research." },
  ],
  zh: [
    { q: "我怎么知道 AI 不是在瞎编？", a: "AI 回答或抽取时，会指回你文档中确切的原文段落，你可以点开原文自己核对——无需盲信 AI。当某个说法无法在你的文件中找到依据时，DockDocs 会标记出来，而不是当作事实呈现。这种可溯源正是它与通用聊天机器人的核心区别。" },
    { q: "DockDocs 与其他 PDF 工具、与通用 AI 聊天机器人有何不同？", a: "通用 AI 聊天机器人给不了的两点：可验证的隐私，和可信赖的答案。DockDocs 大多数工具在你的浏览器中运行，敏感文件不离开你的设备；它的文档 AI 会为答案展示背后的原文出处、并标出无法溯源的部分，让你自己核对。它为那些你不敢粘进通用聊天机器人的文档而生——合同、财务、研究资料。" },
  ],
  es: [
    { q: "¿Cómo sé que la IA no se lo está inventando?", a: "Cuando la IA responde o extrae, remite al pasaje fuente exacto de tu propio documento, así que puedes abrir el original y comprobarlo tú mismo, sin tener que fiarte de la palabra de la IA. Cuando una afirmación no puede fundamentarse en tu archivo, DockDocs la marca en lugar de presentarla como un hecho. Esta trazabilidad es la diferencia clave frente a un chatbot genérico." },
    { q: "¿Qué distingue a DockDocs de otras herramientas PDF y de un chatbot de IA genérico?", a: "Dos cosas que un chatbot genérico no puede ofrecer: privacidad que puedes verificar y respuestas en las que puedes confiar. La mayoría de las herramientas de DockDocs se ejecutan en tu navegador, así que los archivos sensibles nunca salen de tu dispositivo; y su IA documental muestra el pasaje de origen detrás de sus respuestas y señala lo que no puede rastrear, para que verifiques lo que te dice. Está hecha para los documentos que no pegarías en un chatbot genérico: contratos, finanzas, investigación." },
  ],
  pt: [
    { q: "Como sei que a IA não está inventando?", a: "Quando a IA responde ou extrai, remete ao trecho-fonte exato do seu próprio documento, então você pode abrir o original e conferir por conta própria, sem precisar confiar na palavra da IA. Quando uma afirmação não pode ser fundamentada no seu arquivo, o DockDocs a sinaliza em vez de apresentá-la como fato. Essa rastreabilidade é a diferença central em relação a um chatbot genérico." },
    { q: "O que diferencia o DockDocs de outras ferramentas PDF e de um chatbot de IA genérico?", a: "Duas coisas que um chatbot genérico não oferece: privacidade que você pode verificar e respostas em que pode confiar. A maioria das ferramentas do DockDocs roda no seu navegador, então arquivos sensíveis nunca saem do seu dispositivo; e sua IA documental mostra o trecho de origem por trás de suas respostas e sinaliza o que não pode rastrear, para você verificar o que ela diz. Foi feita para os documentos que você não colaria num chatbot genérico: contratos, finanças, pesquisa." },
  ],
  fr: [
    { q: "Comment savoir si l'IA n'invente pas ?", a: "Quand l'IA répond ou extrait, elle renvoie au passage source exact dans votre propre document : vous pouvez ouvrir l'original et le vérifier vous-même, sans avoir à croire l'IA sur parole. Lorsqu'une affirmation ne peut pas être étayée par votre fichier, DockDocs la signale au lieu de la présenter comme un fait. Cette traçabilité est la différence essentielle avec un chatbot généraliste." },
    { q: "Qu'est-ce qui distingue DockDocs des autres outils PDF et d'un chatbot IA généraliste ?", a: "Deux choses qu'un chatbot généraliste ne peut offrir : une confidentialité vérifiable et des réponses fiables. La plupart des outils DockDocs s'exécutent dans votre navigateur, vos fichiers sensibles ne quittent donc jamais votre appareil ; et son IA documentaire montre le passage source derrière ses réponses et signale ce qu'elle ne peut pas tracer, pour que vous puissiez vérifier ce qu'elle vous dit. Elle est conçue pour les documents que vous ne colleriez pas dans un chatbot généraliste : contrats, finances, recherche." },
  ],
  ja: [
    { q: "AI が作り話をしていないと、どうすれば分かりますか？", a: "AI が回答・抽出を行うとき、あなたの文書内の該当箇所（原文）を指し示せる場合はそれを示すので、原文を開いて自分で確認できます——AI の言葉を鵜呑みにする必要はありません。ある主張をあなたのファイルから裏付けられない場合、DockDocs はそれを事実として提示せず、裏付けが取れないことを明示します。この出典までたどれること（可溯源性）こそ、汎用チャットボットとの決定的な違いです。" },
    { q: "DockDocs は他の PDF ツールや汎用 AI チャットボットと何が違いますか？", a: "汎用チャットボットには提供できない 2 つの点があります——検証できるプライバシーと、信頼できる回答です。DockDocs のほとんどのツールはお使いのブラウザ内で動作するため、機密ファイルがデバイスの外に出ることはありません。さらに文書 AI は回答の根拠となる原文箇所を示し、たどれない部分は明示するので、内容を自分で検証できます。汎用チャットボットに貼り付けられない文書——契約書・財務資料・研究資料——のために作られています。" },
  ],
  de: [
    { q: "Woher weiß ich, dass die KI sich nichts ausdenkt?", a: "Wenn die KI antwortet oder Daten extrahiert, verweist sie auf die genaue Quellstelle in Ihrem eigenen Dokument — Sie können das Original aufrufen und es selbst prüfen, und müssen der KI nichts blind glauben. Lässt sich eine Aussage nicht in Ihrer Datei belegen, kennzeichnet DockDocs das, statt sie als Tatsache darzustellen. Diese Nachvollziehbarkeit bis zur Quelle ist der zentrale Unterschied zu einem allgemeinen Chatbot." },
    { q: "Was unterscheidet DockDocs von anderen PDF-Werkzeugen und von einem allgemeinen KI-Chatbot?", a: "Zwei Dinge, die ein allgemeiner KI-Chatbot nicht bieten kann: Datenschutz, den Sie überprüfen können, und Antworten, denen Sie vertrauen können. Die meisten DockDocs-Werkzeuge laufen in Ihrem Browser, sodass sensible Dateien Ihr Gerät nie verlassen. Und seine Dokumenten-KI zeigt die genaue Quellstelle hinter ihren Antworten und macht kenntlich, was sie nicht nachverfolgen kann, sodass Sie überprüfen können, was sie Ihnen sagt. Es ist für die Dokumente gemacht, die Sie nicht in einen allgemeinen Chatbot einfügen würden — Verträge, Finanzunterlagen, Forschung." },
  ],
  ko: [
    { q: "AI가 꾸며낸 내용이 아님을 어떻게 알 수 있나요?", a: "AI가 답변하거나 추출할 때, 내 문서의 정확한 원문 구절을 가리켜 줘서 원본을 열어 직접 확인할 수 있습니다 — AI의 말을 그냥 믿을 필요가 없습니다. 파일에서 근거를 찾을 수 없는 주장은 DockDocs가 사실인 것처럼 제시하는 대신 명확히 표시합니다. 이 출처 추적 가능성이 바로 일반 챗봇과의 핵심 차이입니다." },
    { q: "DockDocs는 다른 PDF 도구나 일반 AI 챗봇과 어떻게 다른가요?", a: "일반 AI 챗봇이 제공할 수 없는 두 가지: 검증 가능한 개인정보 보호와 신뢰할 수 있는 답변입니다. DockDocs의 대부분 도구는 브라우저에서 실행되므로 민감한 파일이 내 기기 밖으로 나가지 않습니다. 그리고 문서 AI는 답변 뒤의 정확한 원문 구절을 보여주고, 추적할 수 없는 부분을 명시해서 직접 검증할 수 있습니다. 계약서, 재무 자료, 연구 자료처럼 일반 챗봇에 붙여넣기 어려운 문서를 위해 만들어졌습니다." },
  ],
  "zh-Hant": [
    { q: "我怎麼知道 AI 不是在瞎編？", a: "AI 回答或抽取時，會指回你文檔中確切的原文段落，你可以點開原文自己核對——無需盲信 AI。當某個說法無法在你的文件中找到依據時，DockDocs 會標記出來，而不是當作事實呈現。這種可溯源正是它與通用聊天機器人的核心區別。" },
    { q: "DockDocs 與其他 PDF 工具、與通用 AI 聊天機器人有何不同？", a: "通用 AI 聊天機器人給不了的兩點：可驗證的隱私，和可信賴的答案。DockDocs 大多數工具在你的瀏覽器中運行，敏感文件不離開你的設備；它的文檔 AI 會為答案展示背後的原文出處、並標出無法溯源的部分，讓你自己核對。它為那些你不敢貼進通用聊天機器人的文檔而生——合同、財務、研究資料。" },
  ],
};

// Organization + WebSite descriptions, localized per homepage (the catch-all
// renders homeSchema(locale) on /zh /es /pt /fr). Scoped anti-confabulation
// wording consistent with HOME_FAQ; native polish to follow via the i18n lane.
const ORG_DESC: Record<string, string> = {
  en: "Private, verifiable document AI: read any document and verify its answers — the AI shows the source passage behind them and flags what it can't trace, so you can check it yourself. Plus ~50 PDF tools — most run in your browser, so those files never leave your device.",
  zh: "私密、可溯源的文档 AI：读懂任意文档、逐一核验它的答案——AI 会展示答案背后的原文出处、并标出无法溯源的部分，让你自己核对。另有约 50 个 PDF 工具——多数在浏览器内运行，这些文件不离开你的设备。",
  es: "IA documental privada y verificable: lee cualquier documento y verifica sus respuestas — la IA muestra el pasaje de origen detrás de ellas y señala lo que no puede rastrear, para que lo compruebes tú mismo. Además, ~50 herramientas PDF: la mayoría se ejecuta en tu navegador, así esos archivos nunca salen de tu dispositivo.",
  pt: "IA de documentos privada e verificável: leia qualquer documento e verifique suas respostas — a IA mostra o trecho de origem por trás delas e sinaliza o que não pode rastrear, para você conferir por conta própria. Além disso, ~50 ferramentas PDF: a maioria roda no seu navegador, então esses arquivos nunca saem do seu dispositivo.",
  fr: "IA documentaire privée et vérifiable : lisez n'importe quel document et vérifiez ses réponses — l'IA montre le passage source derrière elles et signale ce qu'elle ne peut pas tracer, pour que vous le vérifiiez vous-même. Plus ~50 outils PDF, dont la plupart s'exécutent dans votre navigateur, et ces fichiers ne quittent donc jamais votre appareil.",
  ja: "プライベートで検証できる文書 AI——あらゆる文書を読み解き、その回答を検証できます。AI が回答の根拠となる原文箇所を示し、たどれない部分は明示するので、自分で確認できます。さらに、お使いの約 50 種類の PDF ツール（その多くはブラウザ内で動作）により、それらのファイルがデバイスの外に出ることはありません。",
  de: "Private, nachvollziehbare Dokumenten-KI: Lesen Sie jedes Dokument und überprüfen Sie seine Antworten — die KI zeigt die Quellstelle dahinter und macht kenntlich, was sie nicht nachverfolgen kann. Dazu ~50 PDF-Werkzeuge — die meisten laufen in Ihrem Browser, sodass diese Dateien das Gerät nie verlassen.",
  ko: "개인 정보를 보호하며 검증 가능한 문서 AI: 모든 문서를 읽고 답변을 확인하세요 — AI는 출처 구절을 보여주고 추적할 수 없는 부분을 명시해서 직접 확인할 수 있습니다. 약 50개의 PDF 도구 포함 — 대부분 브라우저에서 실행되므로 파일이 기기 밖으로 나가지 않습니다.",
  "zh-Hant": "私密、可溯源的文檔 AI：讀懂任意文檔、逐一核驗它的答案——AI 會展示答案背後的原文出處、並標出無法溯源的部分，讓你自己核對。另有約 50 個 PDF 工具——多數在瀏覽器內運行，這些文件不離開你的設備。",
};
const SITE_DESC: Record<string, string> = {
  en: "Document AI that shows the source passage behind its answers, and flags what it can't trace, so you can verify them, plus private PDF tools that run in your browser. Built for documents you can't paste into a general chatbot.",
  zh: "会展示答案背后原文出处、并标出无法溯源的部分、让你能核实的文档 AI，外加在浏览器内运行的私密 PDF 工具。专为那些你不敢粘进通用聊天机器人的文档而生。",
  es: "IA documental que muestra el pasaje de origen detrás de sus respuestas y señala lo que no puede rastrear, para que las verifiques, más herramientas PDF privadas que se ejecutan en tu navegador. Hecha para los documentos que no pegarías en un chatbot genérico.",
  pt: "IA de documentos que mostra o trecho de origem por trás de suas respostas e sinaliza o que não pode rastrear, para que você as verifique, além de ferramentas PDF privadas que rodam no seu navegador. Feita para os documentos que você não colaria num chatbot genérico.",
  fr: "IA documentaire qui montre le passage source derrière ses réponses et signale ce qu'elle ne peut pas tracer, pour que vous les vérifiiez, plus des outils PDF privés qui s'exécutent dans votre navigateur. Conçue pour les documents que vous ne colleriez pas dans un chatbot généraliste.",
  ja: "回答の根拠となる原文箇所を示し、たどれない部分は明示して検証できるようにする文書 AI と、お使いのブラウザ内で動作するプライベートな PDF ツール。汎用チャットボットに貼り付けられない文書のために作られています。",
  de: "Dokumenten-KI, die die Quellstelle hinter ihren Antworten zeigt und kenntlich macht, was sie nicht nachverfolgen kann, damit Sie sie prüfen können — dazu private PDF-Werkzeuge, die in Ihrem Browser laufen. Gemacht für Dokumente, die Sie nicht in einen allgemeinen Chatbot einfügen würden.",
  ko: "답변 뒤의 원문 구절을 보여주고 추적할 수 없는 부분을 명시하여 검증할 수 있는 문서 AI와 브라우저에서 실행되는 개인 PDF 도구. 일반 챗봇에 붙여넣기 어려운 문서를 위해 만들어졌습니다.",
  "zh-Hant": "會展示答案背後原文出處、並標出無法溯源的部分、讓你能核實的文檔 AI，外加在瀏覽器內運行的私密 PDF 工具。專為那些你不敢貼進通用聊天機器人的文檔而生。",
};
// Organization slogan, per locale (was hardcoded English for all locales until 2026-06-24).
// Only en + de are authored; zh/es/pt/fr/ja have no vetted slogan translation yet and
// fall back to en here (intentional — better than a half-machine-translated tagline).
const SLOGAN: Record<string, string> = {
  en: "Read any document. Verify every answer.",
  de: "Jedes Dokument lesen. Jede Antwort überprüfen.",
};
const PRICING_DESC: Record<string, string> = {
  en: "Free online PDF tools with ~50 document processing features. AI-powered chat, OCR, compression, and conversion.",
  zh: "免费在线 PDF 工具，约 50 项文档处理功能，含 AI 问答、OCR、压缩和格式转换。",
  es: "Herramientas PDF en línea gratuitas con ~50 funciones de procesamiento de documentos. Chat, OCR, compresión y conversión con IA.",
  pt: "Ferramentas PDF online gratuitas com ~50 recursos de processamento de documentos. Chat, OCR, compressão e conversão com IA.",
  fr: "Outils PDF en ligne gratuits avec ~50 fonctionnalités de traitement de documents. Chat IA, OCR, compression et conversion.",
  ja: "オンライン PDF ツール（約 50 種）——AI チャット、OCR、圧縮、変換など多彩な文書処理機能を無料提供。",
  de: "Kostenlose Online-PDF-Werkzeuge mit ~50 Dokumentverarbeitungsfunktionen. KI-Chat, OCR, Komprimierung und Konvertierung.",
  ko: "무료 온라인 PDF 도구, 약 50가지 문서 처리 기능. AI 채팅, OCR, 압축 및 변환.",
  "zh-Hant": "免費線上 PDF 工具，約 50 項文件處理功能，含 AI 問答、OCR、壓縮和格式轉換。",
};
const PRICING_CRUMB: Record<string, string> = {
  en: "Pricing",
  zh: "定价",
  es: "Precios",
  pt: "Preços",
  fr: "Tarifs",
  ja: "料金",
  de: "Preise",
  ko: "요금제",
  "zh-Hant": "定價",
};

export function homeSchema(locale: string = "en") {
  // Organization + WebSite + FAQPage all localized per homepage (catch-all renders homeSchema(locale)).
  const faq = HOME_FAQ[locale] ?? HOME_FAQ.en;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE}#org`,
        name: "DockDocs",
        url: SITE,
        logo: { "@type": "ImageObject", url: `${SITE}/icon-512.png`, width: 512, height: 512 },
        description: ORG_DESC[locale] ?? ORG_DESC.en,
        slogan: SLOGAN[locale] ?? SLOGAN.en,
        foundingDate: "2024",
        sameAs: ["https://github.com/zq8345/dock-ai-ecosystem"],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE}#website`,
        name: "DockDocs",
        url: SITE,
        description: SITE_DESC[locale] ?? SITE_DESC.en,
        inLanguage: ["en", "zh", "es", "pt", "fr", "ja", "de", "ko", "zh-Hant"],
        publisher: { "@id": `${SITE}#org` },
      },
      {
        "@type": "FAQPage",
        "@id": `${baseFor(locale)}/#home-faq`,
        mainEntity: faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };
}

export function aboutSchema(locale: string) {
  const url = `${baseFor(locale)}/about/`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": `${SITE}#org`, name: "DockDocs", url: SITE, logo: { "@type": "ImageObject", url: `${SITE}/icon-512.png`, width: 512, height: 512 }, slogan: SLOGAN[locale] ?? SLOGAN.en, sameAs: ["https://github.com/zq8345/dock-ai-ecosystem"] },
      {
        "@type": "AboutPage",
        "@id": `${url}#webpage`,
        url,
        name: "About DockDocs",
        about: { "@id": `${SITE}#org` },
        isPartOf: { "@type": "WebSite", name: "DockDocs", url: SITE },
      },
    ],
  };
}

export function pricingSchema(locale: string) {
  const url = `${baseFor(locale)}/pricing/`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE}/pricing/#app`,
        name: "DockDocs",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: SITE,
        description: PRICING_DESC[locale] ?? PRICING_DESC.en,
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "USD",
          lowPrice: "0",
          highPrice: "149",
          offerCount: "4",
          offers: [
            { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" },
            { "@type": "Offer", name: "Plus — Monthly", price: "9", priceCurrency: "USD" },
            { "@type": "Offer", name: "Plus — Annual", price: "72", priceCurrency: "USD" },
            { "@type": "Offer", name: "Lifetime", price: "149", priceCurrency: "USD" },
          ],
        },
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: "DockDocs Pricing",
        isPartOf: { "@type": "WebSite", name: "DockDocs", url: SITE },
        mainEntity: { "@id": `${SITE}/pricing/#app` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "DockDocs", item: `${baseFor(locale)}/` },
          { "@type": "ListItem", position: 2, name: PRICING_CRUMB[locale] ?? PRICING_CRUMB.en, item: url },
        ],
      },
    ],
  };
}

// 通用页面结构化数据 —— 给信息页/法律页/站点地图等补 JSON-LD(健康爬取曾标记它们缺 schema)。
export function webPageSchema(locale: string, slug: string, name: string) {
  const url = slug ? `${baseFor(locale)}/${slug}/` : `${baseFor(locale)}/`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name,
        isPartOf: { "@type": "WebSite", "@id": `${SITE}#website`, name: "DockDocs", url: SITE },
        inLanguage: locale,
      },
    ],
  };
}
