// AI-citable "source grounding" fact block — plain, crawlable prose that states,
// in words an answer engine can quote, exactly how DockDocs anchors AI output to
// the user's document. This is the GEO/差异化 differentiator and is distinct from
// the inline "✓ verified" UI badge: this is standing page content, not interaction.
// Mounted on /chat-with-pdf and /contract-risk; rendered on both the en and the
// localized routes, so authored in all 5 active locales.

import { toHant } from "@/lib/zh-hant";

type Variant = "chat" | "contract" | "summary";

// Keyed by locale string with an en fallback, so any client's locale union
// (some include ja) is safe to pass.
const TITLE: Record<string, string> = {
  en: "How DockDocs grounds AI answers in your source",
  zh: "DockDocs 如何让 AI 的结论锚定在你的原文上",
  es: "Cómo DockDocs ancla las respuestas de la IA en tu documento",
  pt: "Como o DockDocs ancora as respostas da IA no seu documento",
  fr: "Comment DockDocs ancre les réponses de l'IA dans votre document",
  ja: "DockDocs はどのように AI の回答をあなたの原文に根拠づけるか",
  de: "Wie DockDocs die Antworten der KI in Ihrem Dokument verankert",
  ko: "DockDocs는 어떻게 AI 답변을 원문에 근거하게 하는가",
};

// Summaries are a paraphrase, not a verbatim quote, so the title speaks to
// faithfulness/grounding rather than "answers".
const TITLE_SUMMARY: Record<string, string> = {
  en: "How DockDocs keeps summaries grounded in your document",
  zh: "DockDocs 如何让摘要忠于你的原文",
  es: "Cómo DockDocs mantiene los resúmenes anclados a tu documento",
  pt: "Como o DockDocs mantém os resumos fiéis ao seu documento",
  fr: "Comment DockDocs garde les résumés fidèles à votre document",
  ja: "DockDocs はどのように要約をあなたの原文に忠実に保つか",
  de: "Wie DockDocs Zusammenfassungen in Ihrem Dokument verankert hält",
  ko: "DockDocs는 어떻게 요약을 원문에 충실하게 유지하는가",
};

function titleMapFor(variant: Variant): Record<string, string> {
  return variant === "summary" ? TITLE_SUMMARY : TITLE;
}

const BODY: Record<Variant, Record<string, string>> = {
  chat: {
    en: "Every answer is generated from the text of the document you uploaded — not from the model's general knowledge. When the AI can ground an answer in your document, DockDocs shows the exact passage it draws from, so you can trace that answer back to its source — a source citation won't appear for every answer. When the document does not contain enough evidence, DockDocs says so instead of guessing, and a quoted reference that cannot be located in your file is flagged as unverifiable rather than presented as fact. That source-grounding is what separates a trustworthy document assistant from a general chatbot.",
    zh: "每条回答都来自你上传文档里的文字，而不是模型的通用知识。当 AI 能在你的文档里为某条回答找到依据时，DockDocs 会标出它所依据的具体原文段落，让你能把这条回答溯源回出处——但并非每条回答都会有出处可引。当文档证据不足时，DockDocs 会如实说明，而不是猜测；如果引用的原文在你的文件里找不到，会被标为「无法核实」，而不是当作事实呈现。正是这种「锚定原文」，把可信的文档助手和普通聊天机器人区分开来。",
    es: "Cada respuesta se genera a partir del texto del documento que subiste, no del conocimiento general del modelo. Cuando la IA puede fundamentar una respuesta en tu documento, DockDocs muestra el pasaje exacto del que procede, para que puedas rastrear esa respuesta hasta su origen — aunque no todas las respuestas tendrán una cita de su fuente. Cuando el documento no contiene evidencia suficiente, DockDocs lo dice en lugar de adivinar, y una cita que no se puede localizar en tu archivo se marca como no verificable en vez de presentarse como un hecho. Ese anclaje a la fuente es lo que distingue a un asistente documental fiable de un chatbot genérico.",
    pt: "Cada resposta é gerada a partir do texto do documento que você enviou — não do conhecimento geral do modelo. Quando a IA consegue fundamentar uma resposta no seu documento, o DockDocs mostra a passagem exata de onde ela vem, para que você possa rastrear essa resposta até a origem — embora nem toda resposta tenha uma citação da fonte. Quando o documento não tem evidência suficiente, o DockDocs diz isso em vez de adivinhar, e uma citação que não pode ser localizada no seu arquivo é marcada como não verificável em vez de apresentada como fato. Esse ancoramento na fonte é o que separa um assistente de documentos confiável de um chatbot genérico.",
    fr: "Chaque réponse est générée à partir du texte du document que vous avez importé, et non des connaissances générales du modèle. Lorsque l'IA peut ancrer une réponse dans votre document, DockDocs indique le passage exact dont elle provient, pour que vous puissiez remonter cette réponse à sa source — même si toutes les réponses n'auront pas de citation de source. Lorsque le document ne contient pas assez d'éléments, DockDocs le dit plutôt que de deviner, et une citation introuvable dans votre fichier est signalée comme invérifiable au lieu d'être présentée comme un fait. Cet ancrage dans la source distingue un assistant documentaire fiable d'un chatbot générique.",
    ja: "どの回答も、あなたがアップロードした文書の本文から生成されます。モデルの一般知識からではありません。AI が回答をあなたの文書に根拠づけられる場合、DockDocs はその根拠となった具体的な箇所を示すので、その回答を出典までたどれます。ただし、すべての回答に出典が付くわけではありません。文書に十分な根拠がない場合、DockDocs は推測せずにそのまま「根拠が足りない」と伝え、あなたのファイル内で見つけられない引用は、事実として提示するのではなく「検証できない」と明示します。この「原文への根拠づけ」こそが、信頼できる文書アシスタントを一般的なチャットボットと分けるものです。",
    de: "Jede Antwort wird aus dem Text des Dokuments erzeugt, das Sie hochgeladen haben – nicht aus dem allgemeinen Wissen des Modells. Wenn die KI eine Antwort in Ihrem Dokument verankern kann, zeigt DockDocs die genaue Textstelle, auf die sie sich stützt, sodass Sie diese Antwort bis zu ihrer Quelle zurückverfolgen können – ein Quellennachweis erscheint aber nicht bei jeder Antwort. Wenn das Dokument nicht genügend Belege enthält, sagt DockDocs das, anstatt zu raten, und ein zitierter Verweis, der sich in Ihrer Datei nicht auffinden lässt, wird als nicht überprüfbar gekennzeichnet, statt als Tatsache dargestellt zu werden. Genau diese Verankerung in der Quelle unterscheidet einen vertrauenswürdigen Dokumentassistenten von einem allgemeinen Chatbot.",
    ko: "모든 답변은 모델의 일반 지식이 아니라 업로드한 문서의 텍스트에서 생성됩니다. AI가 답변을 문서에서 근거로 뒷받침할 수 있을 때, DockDocs는 그 근거가 된 정확한 구절을 보여 주어 답변을 출처까지 거슬러 확인할 수 있게 합니다 — 다만 모든 답변에 출처가 표시되지는 않습니다. 문서에 충분한 근거가 없으면 DockDocs는 추측하지 않고 그렇다고 알려 주며, 파일에서 찾을 수 없는 인용은 사실로 제시하지 않고 「확인 불가」로 표시합니다. 바로 이 원문 근거가 신뢰할 수 있는 문서 도우미를 일반 챗봇과 구분 짓습니다.",
  },
  contract: {
    en: "Every risk DockDocs flags is anchored to the exact clause it came from — quoted verbatim from your contract so you can verify it in the original. A flagged quote that cannot be located in your document is marked unverifiable and hidden, not presented as fact, and a genuinely absent protection is labelled as missing rather than invented. Nothing is fabricated: what cannot be traced to your contract, you can see cannot be traced. That source-grounding is what makes the review trustworthy rather than a generic AI guess — though it is an informational first pass, not legal advice.",
    zh: "DockDocs 标出的每一项风险，都锚定在它所依据的具体条款上——逐字引用你合同里的原文，让你能在原件中核对。如果某条引用在你的文档里找不到，会被标为「无法核实」并隐藏，而不是当作事实；真正缺失的保护条款会被标为「缺失」，而不是凭空编造。绝不杜撰：凡是无法溯源到你合同的内容，你都能一眼看出它无法溯源。正是这种「锚定原文」，让这份体检可信，而不是泛泛的 AI 猜测——但它只是帮你发现要点的第一遍审查，不构成法律意见。",
    es: "Cada riesgo que DockDocs señala está anclado a la cláusula exacta de la que procede, citada textualmente de tu contrato para que puedas verificarla en el original. Una cita que no se puede localizar en tu documento se marca como no verificable y se oculta, en vez de presentarse como un hecho, y una protección realmente ausente se etiqueta como faltante en lugar de inventarse. No se fabrica nada: lo que no se puede rastrear hasta tu contrato, ves que no se puede rastrear. Ese anclaje a la fuente hace que la revisión sea fiable y no una conjetura genérica de IA — aunque es una primera revisión informativa, no asesoramiento legal.",
    pt: "Cada risco que o DockDocs sinaliza está ancorado à cláusula exata de onde veio — citada literalmente do seu contrato para que você possa verificá-la no original. Uma citação que não pode ser localizada no seu documento é marcada como não verificável e ocultada, em vez de apresentada como fato, e uma proteção realmente ausente é rotulada como faltante em vez de inventada. Nada é fabricado: o que não pode ser rastreado até o seu contrato, você vê que não pode ser rastreado. Esse ancoramento na fonte torna a revisão confiável, e não um palpite genérico de IA — embora seja uma primeira revisão informativa, não aconselhamento jurídico.",
    fr: "Chaque risque signalé par DockDocs est ancré à la clause exacte dont il provient, citée mot pour mot depuis votre contrat afin que vous puissiez la vérifier dans l'original. Une citation introuvable dans votre document est signalée comme invérifiable et masquée, plutôt que présentée comme un fait, et une protection réellement absente est étiquetée comme manquante au lieu d'être inventée. Rien n'est fabriqué : ce qui ne peut être relié à votre contrat, vous voyez que cela ne peut l'être. Cet ancrage dans la source rend l'analyse fiable plutôt qu'une supposition générique d'IA — bien qu'il s'agisse d'une première analyse informative, pas d'un conseil juridique.",
    ja: "DockDocs が指摘する各リスクは、その根拠となった具体的な条項に結びついています。あなたの契約書から逐語的に引用されるので、原本で確認できます。文書内で見つけられない引用は「検証できない」と表示して非表示にし、事実としては提示しません。本当に欠けている保護条項は、でっち上げるのではなく「欠落」と明示します。捏造は一切ありません。契約書までたどれないものは、たどれないとはっきり分かります。この「原文への根拠づけ」が、一般的な AI の当て推量ではなく信頼できるチェックを実現します。ただし、これは要点を見つけるための最初の情報提供的なチェックであり、法的助言ではありません。",
    de: "Jedes Risiko, das DockDocs kennzeichnet, ist in der genauen Klausel verankert, aus der es stammt – wörtlich aus Ihrem Vertrag zitiert, sodass Sie es im Original überprüfen können. Ein gekennzeichnetes Zitat, das sich in Ihrem Dokument nicht auffinden lässt, wird als nicht überprüfbar markiert und ausgeblendet, nicht als Tatsache dargestellt, und ein tatsächlich fehlender Schutz wird als fehlend gekennzeichnet, statt erfunden zu werden. Nichts wird erfunden: Was sich nicht auf Ihren Vertrag zurückführen lässt, erkennen Sie auch als nicht zurückführbar. Genau diese Verankerung in der Quelle macht die Prüfung vertrauenswürdig und nicht zu einer beliebigen KI-Vermutung – auch wenn es sich um eine erste informative Durchsicht handelt, nicht um eine Rechtsberatung.",
    ko: "DockDocs가 표시하는 모든 위험은 그 출처가 된 정확한 조항에 근거합니다 — 계약서에서 그대로 인용되므로 원본에서 직접 확인할 수 있습니다. 문서에서 찾을 수 없는 인용은 「확인 불가」로 표시되어 숨겨지며 사실로 제시되지 않고, 실제로 빠져 있는 보호 조항은 지어내지 않고 「누락」으로 표시됩니다. 그 무엇도 꾸며내지 않습니다. 계약서까지 거슬러 확인할 수 없는 내용은 확인할 수 없다는 것을 그대로 보여 줍니다. 바로 이 원문 근거가, 일반적인 AI 추측이 아니라 신뢰할 수 있는 검토를 만들어 줍니다 — 다만 이는 요점을 찾아 주는 정보용 1차 검토이며 법률 자문이 아닙니다.",
  },
  summary: {
    en: "Every summary is written only from the text of the document you uploaded — DockDocs instructs the AI to draw the key points, action items and takeaways from your file's own content and not to add facts from outside it. A summary is a paraphrase, not a quote, so for anything that matters — figures, dates, obligations — check it against the passage it came from. The value is a faithful condensation of what your document actually says, not a generic answer assembled from the model's general knowledge.",
    zh: "每一份摘要都只依据你上传文档里的文字生成——DockDocs 会要求 AI 从你文件本身的内容中提炼要点、行动项和结论，不添加文档之外的事实。摘要是改写而非逐字引用，所以涉及关键信息——数字、日期、义务——请对照原文核对。它的价值在于忠实浓缩你文档真正说了什么，而不是用模型的通用知识拼凑出一个泛泛的答案。",
    es: "Cada resumen se redacta únicamente a partir del texto del documento que subiste: DockDocs indica a la IA que extraiga los puntos clave, las acciones y las conclusiones del propio contenido de tu archivo y que no añada datos ajenos a él. Un resumen es una paráfrasis, no una cita, así que para lo que importa —cifras, fechas, obligaciones— contrástalo con el pasaje del que procede. Su valor es condensar fielmente lo que tu documento dice de verdad, no una respuesta genérica armada con el conocimiento general del modelo.",
    pt: "Cada resumo é escrito apenas a partir do texto do documento que você enviou — o DockDocs instrui a IA a extrair os pontos-chave, as ações e as conclusões do próprio conteúdo do seu arquivo e a não acrescentar fatos externos a ele. Um resumo é uma paráfrase, não uma citação, então para o que importa — números, datas, obrigações — confira com o trecho de onde veio. O valor é condensar fielmente o que o seu documento realmente diz, não uma resposta genérica montada com o conhecimento geral do modelo.",
    fr: "Chaque résumé est rédigé uniquement à partir du texte du document que vous avez importé : DockDocs demande à l'IA de tirer les points clés, les actions et les conclusions du contenu de votre fichier lui-même, sans ajouter de faits extérieurs. Un résumé est une paraphrase, pas une citation : pour ce qui compte — chiffres, dates, obligations — vérifiez-le par rapport au passage dont il provient. Sa valeur est de condenser fidèlement ce que votre document dit réellement, et non une réponse générique assemblée à partir des connaissances générales du modèle.",
    ja: "どの要約も、あなたがアップロードした文書の本文だけをもとに書かれます。DockDocs は AI に対し、要点・アクション項目・結論をあなたのファイル自身の内容から抽出し、文書外の事実を加えないよう指示します。要約は逐語引用ではなく言い換えなので、数字・日付・義務など重要な事項については、その出典となった箇所と照らし合わせて確認してください。その価値は、モデルの一般知識から組み立てた当たり障りのない回答ではなく、あなたの文書が実際に述べている内容を忠実に凝縮することにあります。",
    de: "Jede Zusammenfassung wird ausschließlich aus dem Text des Dokuments verfasst, das Sie hochgeladen haben – DockDocs weist die KI an, die Kernpunkte, Aufgaben und Schlussfolgerungen aus dem eigenen Inhalt Ihrer Datei zu ziehen und keine Fakten von außerhalb hinzuzufügen. Eine Zusammenfassung ist eine Umschreibung, kein Zitat; prüfen Sie daher alles, was zählt – Zahlen, Daten, Verpflichtungen – anhand der Textstelle, aus der es stammt. Der Wert liegt in einer getreuen Verdichtung dessen, was Ihr Dokument tatsächlich sagt, und nicht in einer beliebigen Antwort, die aus dem allgemeinen Wissen des Modells zusammengesetzt ist.",
    ko: "모든 요약은 오직 업로드한 문서의 텍스트만으로 작성됩니다 — DockDocs는 AI에게 핵심 사항, 실행 항목, 결론을 파일 자체의 내용에서 뽑아내고 문서 밖의 사실은 더하지 말라고 지시합니다. 요약은 그대로 옮긴 인용이 아니라 바꿔 쓴 것이므로, 숫자·날짜·의무처럼 중요한 내용은 그 출처가 된 구절과 대조해 확인하세요. 그 가치는 모델의 일반 지식으로 짜맞춘 일반적인 답변이 아니라, 문서가 실제로 말하는 내용을 충실히 압축하는 데 있습니다.",
  },
};

// Resolve a locale string from a Record, deriving zh-Hant from zh via OpenCC.
function pickG(rec: Record<string, string>, locale: string): string {
  if (locale === "zh-Hant") return toHant(rec.zh ?? rec.en);
  return rec[locale] ?? rec.en;
}

export function GroundingNote({ variant, locale = "en" }: { variant: Variant; locale?: string }) {
  const titles = titleMapFor(variant);
  const title = pickG(titles, locale);
  const body = pickG(BODY[variant], locale);
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
  const titles = titleMapFor(variant);
  return { question: pickG(titles, locale), answer: pickG(BODY[variant], locale) };
}
