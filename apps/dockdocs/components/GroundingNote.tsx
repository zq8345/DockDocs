// AI-citable "source grounding" fact block — plain, crawlable prose that states,
// in words an answer engine can quote, exactly how DockDocs anchors AI output to
// the user's document. This is the GEO/差异化 differentiator and is distinct from
// the inline "✓ verified" UI badge: this is standing page content, not interaction.
// Mounted on /chat-with-pdf and /contract-risk; rendered on both the en and the
// localized routes, so authored in all 5 active locales.

type Variant = "chat" | "contract";

// Keyed by locale string with an en fallback, so any client's locale union
// (some include ja) is safe to pass.
const TITLE: Record<string, string> = {
  en: "How DockDocs grounds AI answers in your source",
  zh: "DockDocs 如何让 AI 的结论锚定在你的原文上",
  es: "Cómo DockDocs ancla las respuestas de la IA en tu documento",
  pt: "Como o DockDocs ancora as respostas da IA no seu documento",
  fr: "Comment DockDocs ancre les réponses de l'IA dans votre document",
};

const BODY: Record<Variant, Record<string, string>> = {
  chat: {
    en: "Every answer is generated from the text of the document you uploaded — not from the model's general knowledge. DockDocs shows the exact passage each answer draws from, so you can trace any claim back to its source. When the document does not contain enough evidence, DockDocs says so instead of guessing, and a quoted reference that cannot be located in your file is flagged as unverifiable rather than presented as fact. That source-grounding is what separates a trustworthy document assistant from a general chatbot.",
    zh: "每条回答都来自你上传文档里的文字，而不是模型的通用知识。DockDocs 会标出每条回答所依据的具体原文段落，让你能把任何结论溯源回出处。当文档证据不足时，DockDocs 会如实说明，而不是猜测；如果引用的原文在你的文件里找不到，会被标为「无法核实」，而不是当作事实呈现。正是这种「锚定原文」，把可信的文档助手和普通聊天机器人区分开来。",
    es: "Cada respuesta se genera a partir del texto del documento que subiste, no del conocimiento general del modelo. DockDocs muestra el pasaje exacto del que procede cada respuesta, para que puedas rastrear cualquier afirmación hasta su origen. Cuando el documento no contiene evidencia suficiente, DockDocs lo dice en lugar de adivinar, y una cita que no se puede localizar en tu archivo se marca como no verificable en vez de presentarse como un hecho. Ese anclaje a la fuente es lo que distingue a un asistente documental fiable de un chatbot genérico.",
    pt: "Cada resposta é gerada a partir do texto do documento que você enviou — não do conhecimento geral do modelo. O DockDocs mostra a passagem exata de onde cada resposta vem, para que você possa rastrear qualquer afirmação até a origem. Quando o documento não tem evidência suficiente, o DockDocs diz isso em vez de adivinhar, e uma citação que não pode ser localizada no seu arquivo é marcada como não verificável em vez de apresentada como fato. Esse ancoramento na fonte é o que separa um assistente de documentos confiável de um chatbot genérico.",
    fr: "Chaque réponse est générée à partir du texte du document que vous avez importé, et non des connaissances générales du modèle. DockDocs indique le passage exact dont provient chaque réponse, pour que vous puissiez remonter toute affirmation à sa source. Lorsque le document ne contient pas assez d'éléments, DockDocs le dit plutôt que de deviner, et une citation introuvable dans votre fichier est signalée comme invérifiable au lieu d'être présentée comme un fait. Cet ancrage dans la source distingue un assistant documentaire fiable d'un chatbot générique.",
  },
  contract: {
    en: "Every risk DockDocs flags is anchored to the exact clause it came from — quoted verbatim from your contract so you can verify it in the original. A flagged quote that cannot be located in your document is marked unverifiable and hidden, not presented as fact, and a genuinely absent protection is labelled as missing rather than invented. Nothing is fabricated: what cannot be traced to your contract, you can see cannot be traced. That source-grounding is what makes the review trustworthy rather than a generic AI guess — though it is an informational first pass, not legal advice.",
    zh: "DockDocs 标出的每一项风险，都锚定在它所依据的具体条款上——逐字引用你合同里的原文，让你能在原件中核对。如果某条引用在你的文档里找不到，会被标为「无法核实」并隐藏，而不是当作事实；真正缺失的保护条款会被标为「缺失」，而不是凭空编造。绝不杜撰：凡是无法溯源到你合同的内容，你都能一眼看出它无法溯源。正是这种「锚定原文」，让这份体检可信，而不是泛泛的 AI 猜测——但它只是帮你发现要点的第一遍审查，不构成法律意见。",
    es: "Cada riesgo que DockDocs señala está anclado a la cláusula exacta de la que procede, citada textualmente de tu contrato para que puedas verificarla en el original. Una cita que no se puede localizar en tu documento se marca como no verificable y se oculta, en vez de presentarse como un hecho, y una protección realmente ausente se etiqueta como faltante en lugar de inventarse. No se fabrica nada: lo que no se puede rastrear hasta tu contrato, ves que no se puede rastrear. Ese anclaje a la fuente hace que la revisión sea fiable y no una conjetura genérica de IA — aunque es una primera revisión informativa, no asesoramiento legal.",
    pt: "Cada risco que o DockDocs sinaliza está ancorado à cláusula exata de onde veio — citada literalmente do seu contrato para que você possa verificá-la no original. Uma citação que não pode ser localizada no seu documento é marcada como não verificável e ocultada, em vez de apresentada como fato, e uma proteção realmente ausente é rotulada como faltante em vez de inventada. Nada é fabricado: o que não pode ser rastreado até o seu contrato, você vê que não pode ser rastreado. Esse ancoramento na fonte torna a revisão confiável, e não um palpite genérico de IA — embora seja uma primeira revisão informativa, não aconselhamento jurídico.",
    fr: "Chaque risque signalé par DockDocs est ancré à la clause exacte dont il provient, citée mot pour mot depuis votre contrat afin que vous puissiez la vérifier dans l'original. Une citation introuvable dans votre document est signalée comme invérifiable et masquée, plutôt que présentée comme un fait, et une protection réellement absente est étiquetée comme manquante au lieu d'être inventée. Rien n'est fabriqué : ce qui ne peut être relié à votre contrat, vous voyez que cela ne peut l'être. Cet ancrage dans la source rend l'analyse fiable plutôt qu'une supposition générique d'IA — bien qu'il s'agisse d'une première analyse informative, pas d'un conseil juridique.",
  },
};

export function GroundingNote({ variant, locale = "en" }: { variant: Variant; locale?: string }) {
  const title = TITLE[locale] ?? TITLE.en;
  const body = BODY[variant][locale] ?? BODY[variant].en;
  return (
    <section className="mt-12 border-t border-[color:var(--line)] pt-8">
      <h2 className="text-[15px] font-semibold text-[color:var(--foreground)]">{title}</h2>
      <p className="mt-3 max-w-3xl text-[13.5px] leading-relaxed text-[color:var(--muted)]">{body}</p>
    </section>
  );
}

// Exported so the page-level FAQPage schema can reuse the exact same wording as a
// crawlable Q&A (keeps the visible prose and the structured data in sync).
export function groundingFaq(variant: Variant, locale: string = "en") {
  return { question: TITLE[locale] ?? TITLE.en, answer: BODY[variant][locale] ?? BODY[variant].en };
}
