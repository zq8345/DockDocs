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
    { q: "How do I know the AI isn't making it up?", a: "Every AI answer and extraction points back to the exact source passage in your own document, so you can click to the original and check it yourself — you never have to take the AI's word for it. When a claim can't be grounded in your file, DockDocs flags it rather than presenting it as fact. This source-traceability is the core difference from a general chatbot." },
    { q: "What makes DockDocs different from other PDF tools and from a general AI chatbot?", a: "Two things a general AI chatbot can't offer: privacy you can verify and answers you can trust. Most DockDocs tools run in your browser, so sensitive files never leave your device. And its document AI cites the exact source for every answer, so you can verify each one. It's built for the documents you can't paste into a general chatbot — contracts, financials, research." },
  ],
  zh: [
    { q: "我怎么知道 AI 不是在瞎编？", a: "每个 AI 答案和抽取都指回你文档中确切的原文段落，你可以点开原文自己核对——无需盲信 AI。当某个说法无法在你的文件中找到依据时，DockDocs 会标记出来，而不是当作事实呈现。这种可溯源正是它与通用聊天机器人的核心区别。" },
    { q: "DockDocs 与其他 PDF 工具、与通用 AI 聊天机器人有何不同？", a: "通用 AI 聊天机器人给不了的两点：可验证的隐私，和可信赖的答案。DockDocs 大多数工具在你的浏览器中运行，敏感文件不离开你的设备；它的文档 AI 为每个答案引用确切出处，让你逐条核对。它为那些你不敢粘进通用聊天机器人的文档而生——合同、财务、研究资料。" },
  ],
  es: [
    { q: "¿Cómo sé que la IA no se lo está inventando?", a: "Cada respuesta y extracción de la IA remite al pasaje fuente exacto de tu propio documento, así que puedes abrir el original y comprobarlo tú mismo, sin tener que fiarte de la palabra de la IA. Cuando una afirmación no puede fundamentarse en tu archivo, DockDocs la marca en lugar de presentarla como un hecho. Esta trazabilidad es la diferencia clave frente a un chatbot genérico." },
    { q: "¿Qué distingue a DockDocs de otras herramientas PDF y de un chatbot de IA genérico?", a: "Dos cosas que un chatbot genérico no puede ofrecer: privacidad que puedes verificar y respuestas en las que puedes confiar. La mayoría de las herramientas de DockDocs se ejecutan en tu navegador, así que los archivos sensibles nunca salen de tu dispositivo; y su IA documental cita la fuente exacta de cada respuesta para que la verifiques. Está hecha para los documentos que no pegarías en un chatbot genérico: contratos, finanzas, investigación." },
  ],
  pt: [
    { q: "Como sei que a IA não está inventando?", a: "Cada resposta e extração da IA remete ao trecho-fonte exato do seu próprio documento, então você pode abrir o original e conferir por conta própria, sem precisar confiar na palavra da IA. Quando uma afirmação não pode ser fundamentada no seu arquivo, o DockDocs a sinaliza em vez de apresentá-la como fato. Essa rastreabilidade é a diferença central em relação a um chatbot genérico." },
    { q: "O que diferencia o DockDocs de outras ferramentas PDF e de um chatbot de IA genérico?", a: "Duas coisas que um chatbot genérico não oferece: privacidade que você pode verificar e respostas em que pode confiar. A maioria das ferramentas do DockDocs roda no seu navegador, então arquivos sensíveis nunca saem do seu dispositivo; e sua IA documental cita a fonte exata de cada resposta para você verificar. Foi feita para os documentos que você não colaria num chatbot genérico: contratos, finanças, pesquisa." },
  ],
  fr: [
    { q: "Comment savoir si l'IA n'invente pas ?", a: "Chaque réponse et extraction de l'IA renvoie au passage source exact dans votre propre document : vous pouvez ouvrir l'original et le vérifier vous-même, sans avoir à croire l'IA sur parole. Lorsqu'une affirmation ne peut pas être étayée par votre fichier, DockDocs la signale au lieu de la présenter comme un fait. Cette traçabilité est la différence essentielle avec un chatbot généraliste." },
    { q: "Qu'est-ce qui distingue DockDocs des autres outils PDF et d'un chatbot IA généraliste ?", a: "Deux choses qu'un chatbot généraliste ne peut offrir : une confidentialité vérifiable et des réponses fiables. La plupart des outils DockDocs s'exécutent dans votre navigateur, vos fichiers sensibles ne quittent donc jamais votre appareil ; et son IA documentaire cite la source exacte de chaque réponse pour que vous puissiez la vérifier. Elle est conçue pour les documents que vous ne colleriez pas dans un chatbot généraliste : contrats, finances, recherche." },
  ],
};

export function homeSchema(locale: string = "en") {
  // Organization + WebSite are site-wide entities; FAQPage is localized.
  const faq = HOME_FAQ[locale] ?? HOME_FAQ.en;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE}#org`,
        name: "DockDocs",
        url: SITE,
        description: "Private, verifiable document AI: read any document and trust every answer because each one cites the exact source you can check. Plus 20+ PDF tools that run in your browser, so files never leave your device.",
        slogan: "Read any document. Trust every answer.",
        foundingDate: "2024",
        sameAs: ["https://github.com/zq8345/dock-ai-ecosystem"],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE}#website`,
        name: "DockDocs",
        url: SITE,
        description: "Document AI that cites its source so you can verify every answer, plus private PDF tools that run in your browser. Built for documents you can't paste into a general chatbot.",
        inLanguage: ["en", "zh", "es", "pt", "fr"],
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
        description: "Free online PDF tools with 20+ document processing features. AI-powered chat, OCR, compression, and conversion.",
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
