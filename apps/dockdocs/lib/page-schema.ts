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
    { q: "AI が作り話をしていないと、どうすれば分かりますか？", a: "AI が回答・抽出を行うとき、あなたの文書内の該当箇所（原文）を必ず指し示すので、原文を開いて自分で確認できます——AI の言葉を鵜呑みにする必要はありません。ある主張をあなたのファイルから裏付けられない場合、DockDocs はそれを事実として提示せず、裏付けが取れないことを明示します。この出典までたどれること（可溯源性）こそ、汎用チャットボットとの決定的な違いです。" },
    { q: "DockDocs は他の PDF ツールや汎用 AI チャットボットと何が違いますか？", a: "汎用チャットボットには提供できない 2 つの点があります——検証できるプライバシーと、信頼できる回答です。DockDocs のほとんどのツールはお使いのブラウザ内で動作するため、機密ファイルがデバイスの外に出ることはありません。さらに文書 AI は回答の根拠となる原文箇所を示し、たどれない部分は明示するので、内容を自分で検証できます。汎用チャットボットに貼り付けられない文書——契約書・財務資料・研究資料——のために作られています。" },
  ],
};

// Organization + WebSite descriptions, localized per homepage (the catch-all
// renders homeSchema(locale) on /zh /es /pt /fr). Scoped anti-confabulation
// wording consistent with HOME_FAQ; native polish to follow via the i18n lane.
const ORG_DESC: Record<string, string> = {
  en: "Private, verifiable document AI: read any document and verify its answers — the AI shows the source passage behind them and flags what it can't trace, so you can check it yourself. Plus ~50 PDF tools that run in your browser, so files never leave your device.",
  zh: "私密、可溯源的文档 AI：读懂任意文档、逐一核验它的答案——AI 会展示答案背后的原文出处、并标出无法溯源的部分，让你自己核对。另有约 50 个在浏览器内运行的 PDF 工具，文件不离开你的设备。",
  es: "IA documental privada y verificable: lee cualquier documento y verifica sus respuestas — la IA muestra el pasaje de origen detrás de ellas y señala lo que no puede rastrear, para que lo compruebes tú mismo. Además, ~50 herramientas PDF que se ejecutan en tu navegador, así tus archivos nunca salen de tu dispositivo.",
  pt: "IA de documentos privada e verificável: leia qualquer documento e verifique suas respostas — a IA mostra o trecho de origem por trás delas e sinaliza o que não pode rastrear, para você conferir por conta própria. Além disso, ~50 ferramentas PDF que rodam no seu navegador, então seus arquivos nunca saem do seu dispositivo.",
  fr: "IA documentaire privée et vérifiable : lisez n'importe quel document et vérifiez ses réponses — l'IA montre le passage source derrière elles et signale ce qu'elle ne peut pas tracer, pour que vous le vérifiiez vous-même. Plus ~50 outils PDF qui s'exécutent dans votre navigateur, vos fichiers ne quittent donc jamais votre appareil.",
  ja: "プライベートで検証できる文書 AI——あらゆる文書を読み解き、その回答を検証できます。AI が回答の根拠となる原文箇所を示し、たどれない部分は明示するので、自分で確認できます。さらに、お使いのブラウザ内で動作する約 50 種類の PDF ツールにより、ファイルがデバイスの外に出ることはありません。",
};
const SITE_DESC: Record<string, string> = {
  en: "Document AI that shows the source passage behind its answers so you can verify them, plus private PDF tools that run in your browser. Built for documents you can't paste into a general chatbot.",
  zh: "会展示答案背后原文出处、让你能核实的文档 AI，外加在浏览器内运行的私密 PDF 工具。专为那些你不敢粘进通用聊天机器人的文档而生。",
  es: "IA documental que muestra el pasaje de origen detrás de sus respuestas para que las verifiques, más herramientas PDF privadas que se ejecutan en tu navegador. Hecha para los documentos que no pegarías en un chatbot genérico.",
  pt: "IA de documentos que mostra o trecho de origem por trás de suas respostas para que você as verifique, além de ferramentas PDF privadas que rodam no seu navegador. Feita para os documentos que você não colaria num chatbot genérico.",
  fr: "IA documentaire qui montre le passage source derrière ses réponses pour que vous les vérifiiez, plus des outils PDF privés qui s'exécutent dans votre navigateur. Conçue pour les documents que vous ne colleriez pas dans un chatbot généraliste.",
  ja: "回答の根拠となる原文箇所を示して検証できるようにする文書 AI と、お使いのブラウザ内で動作するプライベートな PDF ツール。汎用チャットボットに貼り付けられない文書のために作られています。",
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
        description: ORG_DESC[locale] ?? ORG_DESC.en,
        slogan: "Read any document. Verify every answer.",
        foundingDate: "2024",
        sameAs: ["https://github.com/zq8345/dock-ai-ecosystem"],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE}#website`,
        name: "DockDocs",
        url: SITE,
        description: SITE_DESC[locale] ?? SITE_DESC.en,
        inLanguage: ["en", "zh", "es", "pt", "fr", "ja"],
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
      { "@type": "Organization", "@id": `${SITE}#org`, name: "DockDocs", url: SITE, sameAs: ["https://github.com/zq8345/dock-ai-ecosystem"] },
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
        description: "Free online PDF tools with ~50 document processing features. AI-powered chat, OCR, compression, and conversion.",
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "USD",
          lowPrice: "0",
          highPrice: "20",
          offerCount: "3",
          offers: [
            { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" },
            { "@type": "Offer", name: "Plus", price: "5", priceCurrency: "USD" },
            { "@type": "Offer", name: "Pro", price: "20", priceCurrency: "USD" },
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
          { "@type": "ListItem", position: 2, name: "Pricing", item: url },
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
