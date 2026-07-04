import { VerifyClientSide, LOCAL_ONLY_SLUGS } from "../../../shared/templates/pdf-tool-page/VerifyClientSide";
import { toHant, deepHant } from "@/lib/zh-hant";
import type { RouteLocale } from "@/lib/i18n";

// Use the canonical route-locale union so the prop is RouteLocale-true: adding a
// new route locale (e.g. "de") flows into every resolver below, where the
// exhaustive `never`-default switch forces an explicit FAQ decision for it.
// (FAQS here is partial-by-design — many tools have no fr/ja copy and intentionally
// fall back to generic/en — so we do NOT force AuthoredCopy on the copy tables.)
type Locale = RouteLocale;
type QA = { q: string; a: string };

// FAQ content for the custom-client tools (which don't use the PdfToolPage template).
const FAQS: Record<string, { title: { en: string; zh: string; es: string }; items: { en: QA[]; zh: QA[]; es: QA[] } }> = {
  "chat-with-pdf": {
    title: { en: "Chat with PDF — FAQ", zh: "PDF 对话常见问题", es: "Chat con PDF — preguntas frecuentes" },
    items: {
      en: [
        { q: "How does it work?", a: "Upload a text-based PDF and DockDocs extracts its text in your browser, then you ask questions and the AI answers using that document's content — not generic web knowledge. One document at a time, up to 12 pages / 40,000 characters / 25 MB per file." },
        { q: "Can I trust the answers — are they tied to my document?", a: "Answers are grounded in the text extracted from your PDF, and when the AI's reply matches passages in your file, those appear under a '✓ verified against source' note with the exact quotes, so you can check them yourself. Citations depend on what the model returns and won't appear for every answer, and AI can still be wrong — for anything important, confirm against the original document." },
        { q: "Is my PDF uploaded or stored?", a: "The text is extracted in your browser; only that extracted text is sent to the AI provider to answer your question, and the file itself never leaves your device and isn't stored afterwards." },
        { q: "Which PDFs work?", a: "Text-based (born-digital) PDFs. Scanned PDFs have no selectable text — run OCR first so chat has something to read. It works in English, Chinese, Spanish, Portuguese, French and more; answers follow the language you ask in." },
        { q: "Are there limits?", a: "DockDocs caps each file at 25 MB, 12 pages, and 40,000 characters of extracted text; for longer documents, split or compress them first. A daily free quota applies — upgrade if you need more." },
        { q: "Does it work with documents other than PDF?", a: "Currently DockDocs Chat with PDF works with PDF files. If your document is in another format — Word, Excel, or PowerPoint — export it to PDF first, then upload. For scanned documents, run OCR first to make the text readable before chatting." },
      ],
      zh: [
        { q: "它是怎么工作的?", a: "上传文字版 PDF,DockDocs 会在你的浏览器里提取文字,然后你提问、AI 基于这份文档的内容作答——而不是泛泛的网络知识。一次处理一份文档,单文件最多 12 页 / 40,000 字符 / 25 MB。" },
        { q: "答案可信吗——是基于我的文档吗?", a: "答案锚定从你 PDF 提取的文字;当 AI 的回答命中文档里的段落时,会在「✓ 已与原文核对」提示下列出确切引文,方便你自己核对。引用取决于模型返回的内容,不是每条答案都有,而且 AI 仍可能出错——重要内容请回原文确认。" },
        { q: "我的 PDF 会被上传或保存吗?", a: "文字在你的浏览器里提取;只有提取出的文字会发送给 AI provider 来回答你的问题,文件本身不离开你的设备,事后也不保存。" },
        { q: "哪类 PDF 能用?", a: "文字版(电子原生)PDF。扫描件没有可选文字——请先做 OCR,让对话有内容可读。支持中文、英文、西班牙语、葡萄牙语、法语等;答案会跟随你提问的语言。" },
        { q: "有什么限制吗?", a: "单文件上限为 25 MB、12 页、提取文字 40,000 字符;更长的文档请先拆分或压缩。每日有免费额度——需要更多可升级。" },
        { q: "除了 PDF，其他文档格式也支持吗?", a: "目前仅支持 PDF 文件对话。如果你的文档是 Word、Excel 或 PPT 格式，请先导出为 PDF 再上传。扫描版文档请先做 OCR 提取文字，再开始对话。" },
      ],
      es: [
        { q: "¿Cómo funciona?", a: "Sube un PDF basado en texto y DockDocs extrae su texto en tu navegador; luego haces preguntas y la IA responde usando el contenido de ese documento, no conocimiento genérico de la web. Un documento a la vez, hasta 12 páginas / 40.000 caracteres / 25 MB por archivo." },
        { q: "¿Puedo confiar en las respuestas? ¿Están basadas en mi documento?", a: "Las respuestas se fundamentan en el texto extraído de tu PDF y, cuando la respuesta de la IA coincide con pasajes de tu archivo, estos se muestran bajo un aviso «✓ verificado en la fuente» con las citas exactas, para que tú mismo las compruebes. Las citas dependen de lo que devuelve el modelo y no aparecen en todas las respuestas; además, la IA puede equivocarse: para algo importante, confírmalo en el documento original." },
        { q: "¿Se sube o almacena mi PDF?", a: "El texto se extrae en tu navegador; solo ese texto extraído se envía al proveedor de IA para responder tu pregunta, y el archivo en sí nunca sale de tu dispositivo ni se almacena después." },
        { q: "¿Qué PDF funcionan?", a: "PDF basados en texto (digitales de origen). Los PDF escaneados no tienen texto seleccionable: aplica OCR primero para que el chat tenga algo que leer. Funciona en español, inglés, chino, portugués, francés y más; las respuestas siguen el idioma en que preguntas." },
        { q: "¿Hay límites?", a: "DockDocs limita cada archivo a 25 MB, 12 páginas y 40.000 caracteres de texto extraído; para documentos más largos, divídelos o comprímelos primero. Se aplica una cuota diaria gratuita: mejora tu plan si necesitas más." },
        { q: "¿Funciona con documentos que no sean PDF?", a: "Actualmente DockDocs Chat con PDF trabaja con archivos PDF. Si tu documento está en otro formato — Word, Excel o PowerPoint — expórtalo a PDF primero y luego súbelo. Para documentos escaneados, aplica OCR primero para que el texto sea legible antes de chatear." },
      ],
    },
  },
  "govbid-matrix": {
    title: { en: "Government Bid Compliance Matrix — FAQ", zh: "政府标书合规矩阵常见问题", es: "Matriz de cumplimiento para licitaciones públicas — preguntas frecuentes" },
    items: {
      en: [
        { q: "What does it extract?", a: "It reads an RFP, solicitation, or tender and pulls every binding 'shall/must/will' requirement into a numbered compliance matrix — each row carries the requirement, its section reference, and whether it's mandatory or advisory. You can filter to mandatory-only and export the whole matrix to CSV to drop straight into your proposal-response tracker." },
        { q: "Can I trace every requirement back to the solicitation?", a: "Yes — that's the point. Every row quotes the exact source text and shows its section, so you can verify each requirement against the original document before you commit to it in your bid. If the AI returns a quote we can't find in your file, we label it 'Quote unverifiable' rather than show a fabricated citation. Nothing is invented; what you can't trace, you can see you can't trace." },
        { q: "Does this replace reading the solicitation myself?", a: "No. It's a fast first pass to make sure no 'shall/must' slips through — it is not a guarantee of completeness and not compliance or legal advice. You remain responsible for your bid's compliance; always read the full solicitation, and treat anything the tool misses as still binding." },
        { q: "Is my solicitation uploaded or stored?", a: "Your file is read in your browser; only the extracted text is sent for analysis, and it is not stored afterwards. The file itself never leaves your device — which matters for pre-award and confidential tenders." },
        { q: "Which documents work best?", a: "Text-based PDFs (born-digital). Scanned solicitations have no selectable text — run OCR first. It works in English, Chinese, Spanish, Portuguese, French and more; quotes stay in the document's original language." },
      ],
      zh: [
        { q: "它提取什么?", a: "它读取 RFP、招标或投标文件,把每一条具约束力的「shall/must/will」要求提取成带编号的合规矩阵——每行包含合规要求、所属条款,以及属于强制要求还是建议要求。你可以只看强制项,并把整个矩阵导出为 CSV,直接放进你的投标响应跟踪表。" },
        { q: "每条要求都能核对回标书原文吗?", a: "可以——这正是它的重点。每一行都引用确切的原文,并标出条款,这样你在投标中承诺之前,能逐条对照原始文件核对。如果 AI 给出的引用在你文件里找不到,我们会标成「引用未验证」,而不是显示伪造的出处。绝不编造;核对不到的,你能一眼看出核对不到。" },
        { q: "这能替代我自己通读标书吗?", a: "不能。它是快速的第一遍,确保没有「shall/must」被漏掉——它不保证提取完整,也不构成合规意见或法律意见。投标的合规责任仍在你;请完整阅读招标文件,工具漏掉的内容同样具有约束力。" },
        { q: "我的标书会被上传或保存吗?", a: "文件在你的浏览器中读取,只有提取的文字会被发送去分析,且事后不保存。文件本身不离开你的设备——这对授标前和涉密招标尤其重要。" },
        { q: "哪类文件效果最好?", a: "文字版 PDF(电子原生)。扫描件没有可选文字,请先做 OCR。支持中文、英文、西班牙语、葡萄牙语、法语等;原文引用保持文件的原始语言。" },
      ],
      es: [
        { q: "¿Qué extrae?", a: "Lee un RFP, pliego o licitación y reúne cada requisito vinculante 'shall/must/will' en una matriz de cumplimiento numerada: cada fila incluye el requisito, su referencia de sección y si es obligatorio o recomendado. Puedes filtrar solo los obligatorios y exportar toda la matriz a CSV para volcarla directamente en tu seguimiento de respuesta a la propuesta." },
        { q: "¿Puedo rastrear cada requisito hasta el pliego original?", a: "Sí, ese es el objetivo. Cada fila cita el texto fuente exacto y muestra su sección, para que verifiques cada requisito contra el documento original antes de comprometerte en tu oferta. Si la IA devuelve una cita que no encontramos en tu archivo, la etiquetamos como 'Cita no verificada' en lugar de mostrar una referencia inventada. No se inventa nada; lo que no puedes rastrear, ves que no puedes rastrearlo." },
        { q: "¿Esto reemplaza leer el pliego yo mismo?", a: "No. Es una primera pasada rápida para asegurar que ningún 'shall/must' se escape; no garantiza exhaustividad ni es asesoramiento de cumplimiento o legal. La conformidad de tu oferta sigue siendo tu responsabilidad; lee siempre el pliego completo y considera vinculante todo lo que la herramienta pase por alto." },
        { q: "¿Se sube o almacena mi licitación?", a: "Tu archivo se lee en tu navegador; solo se envía el texto extraído para análisis y no se almacena después. El archivo en sí nunca sale de tu dispositivo, algo clave en licitaciones confidenciales y previas a la adjudicación." },
        { q: "¿Qué documentos funcionan mejor?", a: "PDF basados en texto (digitales de origen). Las licitaciones escaneadas no tienen texto seleccionable: aplica OCR primero. Funciona en español, inglés, chino, portugués, francés y más; las citas se mantienen en el idioma original del documento." },
      ],
    },
  },
  "contract-risk": {
    title: { en: "Contract Risk Check — FAQ", zh: "合同风险体检常见问题", es: "Revisión de riesgos del contrato — preguntas frecuentes" },
    items: {
      en: [
        { q: "How do I spot risky clauses in a contract?", a: "Upload your contract as a PDF and DockDocs scans it for seven common risk areas: auto-renewal traps, one-sided termination rights, uncapped liability, penalties and late fees, hidden costs, overbroad non-compete, and missing standard protections. Each risky clause is flagged red, amber, or green with a direct quote from your document and a plain-language explanation of what to ask before signing. For scanned contracts, run OCR first to add a text layer." },
        { q: "What does it check for?", a: "It scans your contract for clauses worth a second look — auto-renewal, one-sided termination or change, uncapped/unlimited liability, penalties and late fees, payment traps and hidden costs, overbroad non-compete, and missing standard protections (like no liability cap). Each finding is flagged red (high), amber (medium), or green (low), quoted from your contract, with a plain-language reason and what to ask before signing." },
        { q: "Is this legal advice?", a: "No. It's an automated review to help a non-lawyer spot clauses that deserve attention — it is not legal advice and not a substitute for a lawyer. For anything important or high-value, have a qualified attorney review it. Flagging nothing is not a guarantee the contract is safe." },
        { q: "Does it make up clauses or quotes?", a: "Every quote is verified against your actual contract text — if the AI returns a quote we can't find in your document, we drop it rather than show a fabricated citation. Missing-clause risks are shown without a quote and labelled as such. The AI can still miss things, so always read the full contract." },
        { q: "Is my contract uploaded or stored?", a: "Your contract is read in your browser; only the extracted text is sent for analysis, and it is not stored afterwards. The file itself never leaves your device." },
        { q: "Which contracts work best?", a: "Text-based PDFs (born-digital). Scanned contracts have no selectable text — run OCR first. It works in English, Chinese, Spanish and more; quotes stay in the contract's original language." },
      ],
      zh: [
        { q: "如何识别合同中的风险条款?", a: "上传 PDF 格式的合同，DockDocs 会扫描七类常见风险点：自动续约陷阱、单方解约权、无上限责任、违约金和滞纳金、隐藏费用、过宽竞业限制，以及缺失的标准保护。每条风险条款会被标成红/黄/绿，并附上合同原文引用和白话解释，告诉你签字前该问什么。扫描版合同请先做 OCR 加文字层。" },
        { q: "它检查哪些东西?", a: "它会扫描合同里值得多看一眼的条款——自动续约、单方解约或单方变更、无上限/无限责任、违约金和滞纳金、付款陷阱和隐藏费用、过宽的竞业限制,以及缺失的标准保护(比如没有责任上限)。每条都标成 红(高)/黄(中)/绿(低),引用你合同的原文,配白话理由和签字前该问什么。" },
        { q: "这是法律意见吗?", a: "不是。这是帮非律师发现值得注意条款的自动审查,不构成法律意见,也不能替代律师。重要或金额大的合同,请让有资质的律师审。没标出问题不代表合同一定安全。" },
        { q: "它会编造条款或原文吗?", a: "每一条原文引用都会和你的合同实际文字核对——如果 AI 给出的引用在你文档里找不到,我们会丢弃它,而不是显示伪造的出处。缺失类风险不带引用并明确标注。AI 仍可能漏看,所以请完整阅读合同。" },
        { q: "我的合同会被上传或保存吗?", a: "合同在你的浏览器中读取,只有提取的文字会被发送去分析,且事后不保存。文件本身不离开你的设备。" },
        { q: "哪类合同效果最好?", a: "文字版 PDF(电子原生)。扫描件没有可选文字,请先做 OCR。支持中文、英文、西班牙语等;原文引用保持合同的原始语言。" },
      ],
      es: [
        { q: "¿Cómo identifico las cláusulas de riesgo en un contrato?", a: "Sube tu contrato como PDF y DockDocs lo analiza en busca de siete áreas de riesgo comunes: renovación automática, terminación unilateral, responsabilidad ilimitada, penalidades y cargos por mora, costos ocultos, no competencia excesiva, y protecciones estándar faltantes. Cada cláusula de riesgo se marca en rojo, ámbar o verde con una cita directa de tu documento y una explicación en lenguaje llano. Para contratos escaneados, ejecuta OCR primero." },
        { q: "¿Qué revisa?", a: "Escanea tu contrato en busca de cláusulas que merecen una segunda mirada: renovación automática, terminación o cambio unilateral, responsabilidad ilimitada/sin tope, penalizaciones y recargos, trampas de pago y costos ocultos, no competencia excesiva y protecciones estándar ausentes (como la falta de tope de responsabilidad). Cada hallazgo se marca en rojo (alto), ámbar (medio) o verde (bajo), citado de tu contrato, con una razón en lenguaje claro y qué preguntar antes de firmar." },
        { q: "¿Es asesoramiento legal?", a: "No. Es una revisión automatizada para ayudar a un no abogado a detectar cláusulas que merecen atención; no es asesoramiento legal ni sustituye a un abogado. Para algo importante o de alto valor, que lo revise un abogado calificado. No marcar nada no garantiza que el contrato sea seguro." },
        { q: "¿Inventa cláusulas o citas?", a: "Cada cita se verifica contra el texto real de tu contrato: si la IA devuelve una cita que no encontramos en tu documento, la descartamos en lugar de mostrar una cita inventada. Los riesgos por cláusula ausente se muestran sin cita y se etiquetan como tales. La IA aún puede pasar cosas por alto, así que lee siempre el contrato completo." },
        { q: "¿Se sube o se almacena mi contrato?", a: "Tu contrato se lee en tu navegador; solo se envía el texto extraído para analizarlo y no se almacena después. El archivo en sí nunca sale de tu dispositivo." },
        { q: "¿Qué contratos funcionan mejor?", a: "PDF basados en texto (digitales de origen). Los contratos escaneados no tienen texto seleccionable: aplica OCR primero. Funciona en español, inglés, chino y más; las citas se mantienen en el idioma original del contrato." },
      ],
    },
  },
  "lease-redflag": {
    title: { en: "Lease Red Flag Check — FAQ", zh: "租约红旗扫描常见问题", es: "Análisis de riesgos del arrendamiento — preguntas frecuentes" },
    items: {
      en: [
        { q: "What does it flag?", a: "It scans your lease for clauses that could hurt you as a tenant — aggressive rent escalation, harsh early-termination penalties, unreasonable landlord entry rights, unclear maintenance splits, excessive security-deposit deductions, subletting restrictions, unfair holdover charges, and missing standard protections (no grace period, no habitability warranty, no right to cure before eviction). Each finding is flagged red (high), amber (medium), or green (low), quoted from your lease, with what to ask or negotiate." },
        { q: "Is this legal advice?", a: "No. It's an automated review to help tenants spot clauses that deserve attention — it is not legal advice and not a substitute for a lawyer or tenant-rights organization. For anything important, consult a qualified attorney. Flagging nothing is not a guarantee the lease is fair." },
        { q: "Does it make up quotes?", a: "Every quote is verified against your actual lease text — if the AI returns a quote we can't find in your document, we drop it rather than show a fabricated citation. Missing-clause risks are shown without a quote and labelled as such." },
        { q: "Is my lease uploaded or stored?", a: "Your lease is read in your browser; only the extracted text is sent for analysis, and it is not stored afterwards. The file itself never leaves your device." },
        { q: "What lease formats work?", a: "Text-based PDFs (born-digital). Scanned leases have no selectable text — run OCR first. It works in English, Chinese, Spanish and more; quotes stay in the lease's original language." },
      ],
      zh: [
        { q: "它会标出哪些问题?", a: "它扫描租约里可能对租客不利的条款——激进的租金涨价条款、高额提前解约违约金、房东进入检查的不合理权利、不明确的维修分工、过度的押金扣除权利、转租限制、不公平的续租条款,以及缺失的标准保护(没有逾期宽限期、没有宜居性保证、没有驱逐前改正权利)。每条标红(高)/黄(中)/绿(低),引用原文,附该问什么。" },
        { q: "这是法律意见吗?", a: "不是。这是帮租客发现值得注意条款的自动审查,不构成法律意见,也不能替代律师或租客权益机构。重要事项请咨询律师。没标出问题不代表租约一定公平。" },
        { q: "它会伪造引文吗?", a: "每条原文引用都会和租约实际文字核对——如果 AI 给出的引用在文档里找不到,我们会丢弃而不是显示伪造的出处。缺失类风险不带引用并明确标注。" },
        { q: "我的租约会被上传或保存吗?", a: "租约在浏览器中读取,只有提取的文字会被发送去分析,且事后不保存。文件本身不离开你的设备。" },
        { q: "哪类租约效果最好?", a: "文字版 PDF(电子原生)。扫描件请先 OCR。支持中文、英文、西班牙语等;原文引用保持租约的原始语言。" },
      ],
      es: [
        { q: "¿Qué señala?", a: "Escanea tu contrato de arrendamiento en busca de cláusulas que podrían perjudicarte como inquilino: escalada agresiva del alquiler, penalizaciones duras por rescisión anticipada, derechos de entrada del arrendador no razonables, repartos de mantenimiento poco claros, deducciones excesivas del depósito, restricciones de subarrendamiento, cargos injustos por permanencia y protecciones estándar ausentes. Cada hallazgo se marca en rojo, ámbar o verde, con cita y qué preguntar." },
        { q: "¿Es asesoramiento legal?", a: "No. Es una revisión automatizada para ayudar a los inquilinos a detectar cláusulas que merecen atención; no es asesoramiento legal ni sustituye a un abogado o una organización de derechos del inquilino. Para algo importante, consulta a un abogado calificado." },
        { q: "¿Inventa citas?", a: "Cada cita se verifica contra el texto real de tu contrato: si la IA devuelve una cita que no encontramos en tu documento, la descartamos. Los riesgos por cláusula ausente se muestran sin cita y se etiquetan como tales." },
        { q: "¿Se sube o almacena mi arrendamiento?", a: "Tu arrendamiento se lee en tu navegador; solo se envía el texto extraído para analizarlo y no se almacena. El archivo nunca sale de tu dispositivo." },
        { q: "¿Qué formatos funcionan?", a: "PDF basados en texto (digitales de origen). Los escaneados necesitan OCR primero. Funciona en español, inglés, chino y más; las citas se mantienen en el idioma original del arrendamiento." },
      ],
    },
  },
  "batch-translate": {
    title: { en: "Translate Documents — FAQ", zh: "文档翻译常见问题", es: "Traducir Documentos — preguntas frecuentes" },
    items: {
      en: [
        { q: "How do I translate several PDFs at once?", a: "Drop your PDFs onto the page — or a whole folder — pick the target language, then click Translate all. Each PDF is read in your browser, its text is translated one by one, and you download them all as a single ZIP of .txt files." },
        { q: "Which languages can I translate to?", a: "13 languages including English, Simplified and Traditional Chinese, Spanish, French, German, Japanese, Korean, Portuguese, Italian, Russian, Arabic, and Hindi. The whole batch is translated into the one language you pick." },
        { q: "What do I get back — does it keep the layout?", a: "You get plain text (.txt), one file per PDF, zipped together. The translation is text-only, so the original layout, images, and formatting are not preserved. It's best for reading and reusing the content, not for producing a formatted copy." },
        { q: "Is there a limit, and what about scanned PDFs?", a: "Up to 20 PDFs per batch, each up to about 10 pages (14,000 characters) of text. Scanned PDFs have no selectable text, so run OCR on them first; otherwise they're skipped with a note." },
        { q: "Is it private and free?", a: "Each PDF is read in your browser and only the extracted text — never the file — is sent for translation. It's free; translation counts toward your daily AI usage limit, which resets each day." },
      ],
      zh: [
        { q: "怎么一次翻译多个 PDF？", a: "把 PDF 拖到页面上——也可以整个文件夹——选目标语言，再点「全部翻译」。每份 PDF 在浏览器中读取，文字逐个翻译，最后打包成一个 .txt 文件的 ZIP 下载。" },
        { q: "可以翻译成哪些语言？", a: "13 种语言，包括英语、简体和繁体中文、西班牙语、法语、德语、日语、韩语、葡萄牙语、意大利语、俄语、阿拉伯语和印地语。整批都会翻译成你选的那一种语言。" },
        { q: "我拿回什么？保留版式吗？", a: "你拿回纯文本(.txt)，每份 PDF 一个文件，一起打包。翻译只含文字，所以原始版式、图片和格式都不保留。适合阅读和再利用内容，不适合产出带格式的副本。" },
        { q: "有限制吗？扫描件怎么办？", a: "每批最多 20 份 PDF，每份约 10 页(1.4 万字符)以内的文字。扫描件没有可选文字，请先做 OCR，否则会被跳过并标注。" },
        { q: "私密吗？免费吗？", a: "每份 PDF 在你的浏览器中读取，只有提取的文字（不是文件本身）会被发送去翻译。免费；翻译计入你的每日 AI 使用额度，每天重置。" },
      ],
      es: [
        { q: "¿Cómo traduzco varios PDF a la vez?", a: "Arrastra tus PDF a la página (o una carpeta entera), elige el idioma de destino y haz clic en Traducir todo. Cada PDF se lee en tu navegador, su texto se traduce uno por uno y los descargas todos como un solo ZIP de archivos .txt." },
        { q: "¿A qué idiomas puedo traducir?", a: "13 idiomas, incluidos inglés, chino simplificado y tradicional, español, francés, alemán, japonés, coreano, portugués, italiano, ruso, árabe e hindi. Todo el lote se traduce al idioma que elijas." },
        { q: "¿Qué recibo? ¿Conserva el diseño?", a: "Recibes texto plano (.txt), un archivo por PDF, empaquetados juntos. La traducción es solo texto, así que no se conservan el diseño, las imágenes ni el formato originales. Es ideal para leer y reutilizar el contenido, no para producir una copia con formato." },
        { q: "¿Hay un límite y qué pasa con los PDF escaneados?", a: "Hasta 10 PDF por lote, cada uno con unas 10 páginas (14 000 caracteres) de texto. Los PDF escaneados no tienen texto seleccionable, así que aplícales OCR primero; de lo contrario se omiten con una nota." },
        { q: "¿Es privado y gratis?", a: "Cada PDF se lee en tu navegador y solo el texto extraído, nunca el archivo, se envía para traducir. Es gratis; la traducción cuenta para tu límite diario de uso de IA, que se restablece cada día." },
      ],
    },
  },
  "batch-office-to-pdf": {
    title: { en: "Batch Office to PDF — FAQ", zh: "批量 Office 转 PDF 常见问题", es: "Office a PDF por lotes — preguntas frecuentes" },
    items: {
      en: [
        { q: "How do I convert several Office files to PDF at once?", a: "Drop your Word, PowerPoint, and Excel files onto the page — or a whole folder — then click Convert all. Each file is converted to PDF one by one, and when they finish you click Download ZIP to get them all in a single archive." },
        { q: "Which formats can I convert?", a: "Word (.doc, .docx), PowerPoint (.ppt, .pptx), Excel (.xls, .xlsx), plus OpenDocument (.odt, .odp, .ods) and .rtf. The file type is detected automatically, so you can mix documents, slides, and spreadsheets in the same batch." },
        { q: "Will the PDF look exactly like the original?", a: "Conversion uses LibreOffice — the same engine behind our single-file Office to PDF tools. For typical documents the result is faithful, but unusual fonts, macros, or very complex layouts can shift slightly, so check anything formatting-sensitive." },
        { q: "Is there a size or count limit?", a: "Up to 20 files per batch, each up to 5 MB. For a file larger than 5 MB, use the single-file Word to PDF, PPT to PDF, or Excel to PDF tool, which handles bigger files." },
        { q: "Are my files uploaded, and is it free?", a: "It's free with no account. Office conversion runs on our own server, so each file is sent there, converted to PDF, and returned — it is not stored or kept afterwards." },
      ],
      zh: [
        { q: "怎么一次把多个 Office 文件转成 PDF？", a: "把 Word、PowerPoint、Excel 文件拖到页面上——也可以直接拖入整个文件夹——再点「全部转换」。每个文件逐个转成 PDF，完成后点「下载 ZIP」打包一起拿回。" },
        { q: "支持哪些格式？", a: "Word(.doc/.docx)、PowerPoint(.ppt/.pptx)、Excel(.xls/.xlsx)，以及 OpenDocument(.odt/.odp/.ods)和 .rtf。文件类型自动识别，可以把文档、幻灯片、表格混在同一批里。" },
        { q: "转出的 PDF 会和原件一模一样吗？", a: "转换使用 LibreOffice——和我们单文件 Office 转 PDF 工具相同的引擎。常规文档结果忠实，但特殊字体、宏或非常复杂的排版可能略有偏移，对格式敏感的文件请检查一下。" },
        { q: "有数量或大小限制吗？", a: "每批最多 20 个文件，每个不超过 5MB。超过 5MB 的文件请用单文件的「Word 转 PDF」「PPT 转 PDF」或「Excel 转 PDF」工具，那里支持更大的文件。" },
        { q: "文件会被上传吗？免费吗？", a: "免费、无需注册。Office 转换在我们自己的服务器上完成，所以每个文件会被发送到服务器转成 PDF 后返回——转换后不会保存或留存。" },
      ],
      es: [
        { q: "¿Cómo convierto varios archivos de Office a PDF a la vez?", a: "Arrastra tus archivos de Word, PowerPoint y Excel a la página (o una carpeta entera) y haz clic en Convertir todo. Cada archivo se convierte a PDF uno por uno y, al terminar, pulsa Descargar ZIP para obtenerlos todos en un solo archivo." },
        { q: "¿Qué formatos puedo convertir?", a: "Word (.doc, .docx), PowerPoint (.ppt, .pptx), Excel (.xls, .xlsx), además de OpenDocument (.odt, .odp, .ods) y .rtf. El tipo de archivo se detecta automáticamente, así que puedes mezclar documentos, diapositivas y hojas de cálculo en el mismo lote." },
        { q: "¿El PDF quedará exactamente igual que el original?", a: "La conversión usa LibreOffice, el mismo motor de nuestras herramientas de un solo archivo. Para documentos típicos el resultado es fiel, pero fuentes poco comunes, macros o diseños muy complejos pueden variar un poco; revisa lo que sea sensible al formato." },
        { q: "¿Hay límite de tamaño o cantidad?", a: "Hasta 20 archivos por lote, cada uno de hasta 5 MB. Para un archivo de más de 5 MB, usa la herramienta de un solo archivo Word a PDF, PPT a PDF o Excel a PDF, que admite archivos más grandes." },
        { q: "¿Se suben mis archivos? ¿Es gratis?", a: "Es gratis y sin cuenta. La conversión de Office se ejecuta en nuestro propio servidor, así que cada archivo se envía allí, se convierte a PDF y se devuelve; no se almacena ni se conserva." },
      ],
    },
  },
  "batch-word-to-pdf": {
    title: { en: "Batch Word to PDF — FAQ", zh: "批量 Word 转 PDF 常见问题", es: "Word a PDF por lotes — preguntas frecuentes" },
    items: {
      en: [
        { q: "Can I convert .doc files or Google Docs exports in bulk?", a: "Yes. Both .doc (older format) and .docx (modern format) are supported. If your files are from Google Docs, export them first: in Google Docs go to File → Download → Microsoft Word (.docx), then drop the downloaded files here. You can mix .doc and .docx in the same batch." },
        { q: "How do I convert several Word files to PDF at once?", a: "Drop your Word files onto the page — or a whole folder — then click Convert all. Each .doc or .docx is converted to PDF one by one, and when they finish you click Download ZIP to get them all in a single archive." },
        { q: "Which Word formats are supported?", a: "Both modern .docx and legacy .doc, plus OpenDocument text (.odt) and .rtf. For mixed batches of Word, PowerPoint and Excel together, use the general Office to PDF tool instead." },
        { q: "Will the PDF look exactly like the original?", a: "Conversion uses LibreOffice — the same engine behind our single-file Word to PDF tool. For typical documents the result is faithful, but unusual fonts, macros, or very complex layouts can shift slightly, so check anything formatting-sensitive." },
        { q: "Is there a size or count limit?", a: "Up to 20 files per batch, each up to 5 MB. For a Word file larger than 5 MB, use the single-file Word to PDF tool, which handles bigger files." },
        { q: "Are my files uploaded, and is it free?", a: "It's free with no account. Office conversion runs on our own server, so each file is sent there, converted to PDF, and returned — it is not stored or kept afterwards." },
      ],
      zh: [
        { q: "能批量转换 .doc 文件或 Google Docs 导出的文件吗？", a: "可以。批量转换器同时支持旧版 .doc 和新版 .docx 格式。如果文件来自 Google Docs，请先导出：在 Google Docs 里点「文件」→「下载」→「Microsoft Word(.docx)」，然后把下载的文件拖到这里转换。.doc 和 .docx 可以混在同一批。" },
        { q: "怎么一次把多个 Word 文件转成 PDF？", a: "把 Word 文件拖到页面上——也可以直接拖入整个文件夹——再点「全部转换」。每个 .doc 或 .docx 逐个转成 PDF，完成后点「下载 ZIP」打包一起拿回。" },
        { q: "支持哪些 Word 格式？", a: "新版 .docx 和旧版 .doc 都支持，另外还有 OpenDocument 文本(.odt)和 .rtf。如果要把 Word、PowerPoint、Excel 混在一批，请改用通用的「Office 转 PDF」工具。" },
        { q: "转出的 PDF 会和原件一模一样吗？", a: "转换使用 LibreOffice——和我们单文件「Word 转 PDF」工具相同的引擎。常规文档结果忠实，但特殊字体、宏或非常复杂的排版可能略有偏移，对格式敏感的文件请检查一下。" },
        { q: "有数量或大小限制吗？", a: "每批最多 20 个文件，每个不超过 5MB。超过 5MB 的 Word 文件请用单文件的「Word 转 PDF」工具，那里支持更大的文件。" },
        { q: "文件会被上传吗？免费吗？", a: "免费、无需注册。Office 转换在我们自己的服务器上完成，所以每个文件会被发送到服务器转成 PDF 后返回——转换后不会保存或留存。" },
      ],
      es: [
        { q: "¿Puedo convertir archivos .doc o exportaciones de Google Docs en lote?", a: "Sí. El convertidor por lotes admite tanto el formato antiguo .doc como el moderno .docx. Si tus archivos son de Google Docs, expórtalos primero: en Google Docs ve a Archivo → Descargar → Microsoft Word (.docx) y luego arrastra los archivos descargados aquí. Puedes mezclar .doc y .docx en el mismo lote." },
        { q: "¿Cómo convierto varios archivos de Word a PDF a la vez?", a: "Arrastra tus archivos de Word a la página (o una carpeta entera) y haz clic en Convertir todo. Cada .doc o .docx se convierte a PDF uno por uno y, al terminar, pulsa Descargar ZIP para obtenerlos todos en un solo archivo." },
        { q: "¿Qué formatos de Word se admiten?", a: "Tanto el moderno .docx como el antiguo .doc, además de OpenDocument de texto (.odt) y .rtf. Para lotes mixtos de Word, PowerPoint y Excel juntos, usa la herramienta general de Office a PDF." },
        { q: "¿El PDF quedará exactamente igual que el original?", a: "La conversión usa LibreOffice, el mismo motor de nuestra herramienta de un solo archivo Word a PDF. Para documentos típicos el resultado es fiel, pero fuentes poco comunes, macros o diseños muy complejos pueden variar un poco; revisa lo que sea sensible al formato." },
        { q: "¿Hay límite de tamaño o cantidad?", a: "Hasta 20 archivos por lote, cada uno de hasta 5 MB. Para un archivo de Word de más de 5 MB, usa la herramienta de un solo archivo Word a PDF, que admite archivos más grandes." },
        { q: "¿Se suben mis archivos? ¿Es gratis?", a: "Es gratis y sin cuenta. La conversión de Office se ejecuta en nuestro propio servidor, así que cada archivo se envía allí, se convierte a PDF y se devuelve; no se almacena ni se conserva." },
      ],
    },
  },
  "batch-excel-to-pdf": {
    title: { en: "Batch Excel to PDF — FAQ", zh: "批量 Excel 转 PDF 常见问题", es: "Excel a PDF por lotes — preguntas frecuentes" },
    items: {
      en: [
        { q: "How do I convert several Excel files to PDF at once?", a: "Drop your spreadsheets onto the page — or a whole folder — then click Convert all. Each .xls or .xlsx is converted to PDF one by one, and when they finish you click Download ZIP to get them all in a single archive." },
        { q: "Which spreadsheet formats are supported?", a: "Both modern .xlsx and legacy .xls, plus OpenDocument spreadsheets (.ods). For mixed batches of Word, PowerPoint and Excel together, use the general Office to PDF tool instead." },
        { q: "Will wide sheets fit on the page?", a: "Conversion uses LibreOffice and follows each sheet's print area and page setup, so very wide spreadsheets may split across pages just as they would when printing. Set the print area or scaling in Excel first if you need everything on one page." },
        { q: "Is there a size or count limit?", a: "Up to 20 files per batch, each up to 5 MB. For an Excel file larger than 5 MB, use the single-file Excel to PDF tool, which handles bigger files." },
        { q: "Are my files uploaded, and is it free?", a: "It's free with no account. Office conversion runs on our own server, so each file is sent there, converted to PDF, and returned — it is not stored or kept afterwards." },
      ],
      zh: [
        { q: "怎么一次把多个 Excel 文件转成 PDF？", a: "把表格文件拖到页面上——也可以直接拖入整个文件夹——再点「全部转换」。每个 .xls 或 .xlsx 逐个转成 PDF，完成后点「下载 ZIP」打包一起拿回。" },
        { q: "支持哪些表格格式？", a: "新版 .xlsx 和旧版 .xls 都支持，另外还有 OpenDocument 表格(.ods)。如果要把 Word、PowerPoint、Excel 混在一批，请改用通用的「Office 转 PDF」工具。" },
        { q: "宽表格能完整放进页面吗？", a: "转换使用 LibreOffice，并遵循每张工作表的打印区域和页面设置，所以非常宽的表格可能像打印时一样跨页。若想全部放在一页，请先在 Excel 里设置打印区域或缩放。" },
        { q: "有数量或大小限制吗？", a: "每批最多 20 个文件，每个不超过 5MB。超过 5MB 的 Excel 文件请用单文件的「Excel 转 PDF」工具，那里支持更大的文件。" },
        { q: "文件会被上传吗？免费吗？", a: "免费、无需注册。Office 转换在我们自己的服务器上完成，所以每个文件会被发送到服务器转成 PDF 后返回——转换后不会保存或留存。" },
      ],
      es: [
        { q: "¿Cómo convierto varios archivos de Excel a PDF a la vez?", a: "Arrastra tus hojas de cálculo a la página (o una carpeta entera) y haz clic en Convertir todo. Cada .xls o .xlsx se convierte a PDF uno por uno y, al terminar, pulsa Descargar ZIP para obtenerlos todos en un solo archivo." },
        { q: "¿Qué formatos de hoja de cálculo se admiten?", a: "Tanto el moderno .xlsx como el antiguo .xls, además de hojas de cálculo OpenDocument (.ods). Para lotes mixtos de Word, PowerPoint y Excel juntos, usa la herramienta general de Office a PDF." },
        { q: "¿Las hojas anchas caben en la página?", a: "La conversión usa LibreOffice y respeta el área de impresión y la configuración de página de cada hoja, así que las hojas muy anchas pueden dividirse en varias páginas igual que al imprimir. Define el área de impresión o el escalado en Excel primero si necesitas todo en una página." },
        { q: "¿Hay límite de tamaño o cantidad?", a: "Hasta 20 archivos por lote, cada uno de hasta 5 MB. Para un archivo de Excel de más de 5 MB, usa la herramienta de un solo archivo Excel a PDF, que admite archivos más grandes." },
        { q: "¿Se suben mis archivos? ¿Es gratis?", a: "Es gratis y sin cuenta. La conversión de Office se ejecuta en nuestro propio servidor, así que cada archivo se envía allí, se convierte a PDF y se devuelve; no se almacena ni se conserva." },
      ],
    },
  },
  "batch-ppt-to-pdf": {
    title: { en: "Batch PowerPoint to PDF — FAQ", zh: "批量 PPT 转 PDF 常见问题", es: "PowerPoint a PDF por lotes — preguntas frecuentes" },
    items: {
      en: [
        { q: "How do I convert several PowerPoint files to PDF at once?", a: "Drop your PowerPoint files onto the page — or a whole folder — then click Convert all. Each .ppt or .pptx is converted to PDF one by one, and when they finish you click Download ZIP to get them all in a single archive." },
        { q: "Which PowerPoint formats are supported?", a: "Both modern .pptx and legacy .ppt, plus OpenDocument presentations (.odp). For mixed batches of Word, PowerPoint and Excel together, use the general Office to PDF tool instead." },
        { q: "How do the slides come out in the PDF?", a: "Each slide becomes one full PDF page, in order, using LibreOffice — the same engine as our single-file PPT to PDF tool. Speaker notes and animations aren't included; the PDF captures the final look of each slide. Unusual fonts or very complex layouts can shift slightly, so check formatting-sensitive decks." },
        { q: "Is there a size or count limit?", a: "Up to 20 files per batch, each up to 5 MB. For a PowerPoint file larger than 5 MB, use the single-file PPT to PDF tool, which handles bigger files." },
        { q: "Are my files uploaded, and is it free?", a: "It's free with no account. Office conversion runs on our own server, so each file is sent there, converted to PDF, and returned — it is not stored or kept afterwards." },
      ],
      zh: [
        { q: "怎么一次把多个 PPT 文件转成 PDF？", a: "把 PowerPoint 文件拖到页面上——也可以直接拖入整个文件夹——再点「全部转换」。每个 .ppt 或 .pptx 逐个转成 PDF，完成后点「下载 ZIP」打包一起拿回。" },
        { q: "支持哪些 PowerPoint 格式？", a: "新版 .pptx 和旧版 .ppt 都支持，另外还有 OpenDocument 演示文稿(.odp)。如果要把 Word、PowerPoint、Excel 混在一批，请改用通用的「Office 转 PDF」工具。" },
        { q: "幻灯片在 PDF 里是什么样？", a: "每张幻灯片按顺序变成一整页 PDF，使用 LibreOffice——和我们单文件「PPT 转 PDF」工具相同的引擎。演讲者备注和动画不会包含；PDF 呈现每张幻灯片的最终画面。特殊字体或非常复杂的排版可能略有偏移，对格式敏感的演示文稿请检查一下。" },
        { q: "有数量或大小限制吗？", a: "每批最多 20 个文件，每个不超过 5MB。超过 5MB 的 PowerPoint 文件请用单文件的「PPT 转 PDF」工具，那里支持更大的文件。" },
        { q: "文件会被上传吗？免费吗？", a: "免费、无需注册。Office 转换在我们自己的服务器上完成，所以每个文件会被发送到服务器转成 PDF 后返回——转换后不会保存或留存。" },
      ],
      es: [
        { q: "¿Cómo convierto varios archivos de PowerPoint a PDF a la vez?", a: "Arrastra tus archivos de PowerPoint a la página (o una carpeta entera) y haz clic en Convertir todo. Cada .ppt o .pptx se convierte a PDF uno por uno y, al terminar, pulsa Descargar ZIP para obtenerlos todos en un solo archivo." },
        { q: "¿Qué formatos de PowerPoint se admiten?", a: "Tanto el moderno .pptx como el antiguo .ppt, además de presentaciones OpenDocument (.odp). Para lotes mixtos de Word, PowerPoint y Excel juntos, usa la herramienta general de Office a PDF." },
        { q: "¿Cómo quedan las diapositivas en el PDF?", a: "Cada diapositiva se convierte en una página completa del PDF, en orden, usando LibreOffice, el mismo motor que nuestra herramienta de un solo archivo PPT a PDF. Las notas del orador y las animaciones no se incluyen; el PDF captura el aspecto final de cada diapositiva. Las fuentes poco comunes o los diseños muy complejos pueden variar un poco, así que revisa las presentaciones sensibles al formato." },
        { q: "¿Hay límite de tamaño o cantidad?", a: "Hasta 20 archivos por lote, cada uno de hasta 5 MB. Para un archivo de PowerPoint de más de 5 MB, usa la herramienta de un solo archivo PPT a PDF, que admite archivos más grandes." },
        { q: "¿Se suben mis archivos? ¿Es gratis?", a: "Es gratis y sin cuenta. La conversión de Office se ejecuta en nuestro propio servidor, así que cada archivo se envía allí, se convierte a PDF y se devuelve; no se almacena ni se conserva." },
      ],
    },
  },
  "batch-pdf-to-office": {
    title: { en: "Batch PDF to Word/Excel — FAQ", zh: "批量 PDF 转 Word/Excel 常见问题", es: "PDF a Word/Excel por lotes — preguntas frecuentes" },
    items: {
      en: [
        { q: "How do I convert several PDFs to Word or Excel at once?", a: "Drop your PDFs onto the page — or a whole folder — choose Word or Excel as the target, then click Convert all. Each file is converted one by one, and when they finish you click Download ZIP to get them all back in a single archive." },
        { q: "Should I pick Word or Excel?", a: "Pick Word (.docx) for documents that are mostly text and paragraphs, and Excel (.xlsx) for PDFs built from tables — invoices, statements, data sheets. Excel works best when the PDF has clear rows and columns." },
        { q: "Will the layout look exactly like the original?", a: "No converter can promise a pixel-perfect copy. We extract the text and tables into a genuinely editable file, which is what you want for editing — but scanned PDFs or heavily-designed pages may need cleanup afterwards. For a born-digital PDF with normal text and tables, results are usually close." },
        { q: "Is there a size or count limit?", a: "You can convert up to 20 PDFs per batch, each up to 5 MB. For a file larger than 5 MB, use the single-file PDF to Word or PDF to Excel tool, which handles bigger files." },
        { q: "Are my files uploaded, and is it free?", a: "It's free with no account. Unlike our browser-only tools, conversion to Office formats runs on our own server, so each PDF is sent there, converted, and returned — it is not stored or kept afterwards." },
      ],
      zh: [
        { q: "怎么一次把多个 PDF 转成 Word 或 Excel？", a: "把多个 PDF 拖到页面上——也可以直接拖入整个文件夹——选择「转 Word」或「转 Excel」，再点「全部转换」。每个文件逐个转换，完成后点「下载 ZIP」，把它们打包成一个压缩包一起拿回。" },
        { q: "该选 Word 还是 Excel？", a: "以文字和段落为主的文档选「转 Word(.docx)」；由表格构成的 PDF——发票、对账单、数据表——选「转 Excel(.xlsx)」。PDF 里行列越清晰，转 Excel 效果越好。" },
        { q: "排版会和原件一模一样吗？", a: "没有任何转换器能保证逐像素还原。我们把文字和表格提取成真正可编辑的文件，这正是编辑所需——但扫描件或排版复杂的页面可能需要再整理。对于正常文字和表格的电子版 PDF，结果通常比较接近。" },
        { q: "有数量或大小限制吗？", a: "每批最多转换 20 个 PDF，每个不超过 5MB。超过 5MB 的文件请用单文件的「PDF 转 Word」或「PDF 转 Excel」工具，那里支持更大的文件。" },
        { q: "文件会被上传吗？免费吗？", a: "免费、无需注册。与我们的纯浏览器工具不同，转成 Office 格式在我们自己的服务器上完成，所以每个 PDF 会被发送到服务器转换后返回——转换后不会保存或留存。" },
      ],
      es: [
        { q: "¿Cómo convierto varios PDF a Word o Excel a la vez?", a: "Arrastra tus PDF a la página (o una carpeta entera), elige Word o Excel como destino y haz clic en Convertir todo. Cada archivo se convierte uno por uno y, al terminar, pulsa Descargar ZIP para obtenerlos todos en un solo archivo." },
        { q: "¿Debo elegir Word o Excel?", a: "Elige Word (.docx) para documentos con texto y párrafos, y Excel (.xlsx) para PDF formados por tablas: facturas, extractos, hojas de datos. Excel funciona mejor cuando el PDF tiene filas y columnas claras." },
        { q: "¿El diseño quedará exactamente igual que el original?", a: "Ningún convertidor puede prometer una copia idéntica al píxel. Extraemos el texto y las tablas en un archivo realmente editable, que es lo que necesitas para editar, pero los PDF escaneados o muy diseñados pueden requerir ajustes después. Para un PDF digital con texto y tablas normales, el resultado suele ser cercano." },
        { q: "¿Hay límite de tamaño o cantidad?", a: "Puedes convertir hasta 20 PDF por lote, cada uno de hasta 5 MB. Para un archivo de más de 5 MB, usa la herramienta de un solo archivo PDF a Word o PDF a Excel, que admite archivos más grandes." },
        { q: "¿Se suben mis archivos? ¿Es gratis?", a: "Es gratis y sin cuenta. A diferencia de nuestras herramientas que funcionan solo en el navegador, la conversión a formatos de Office se ejecuta en nuestro propio servidor, así que cada PDF se envía allí, se convierte y se devuelve; no se almacena ni se conserva." },
      ],
    },
  },
  "batch-pdf-to-word": {
    title: { en: "Batch PDF to Word — FAQ", zh: "批量 PDF 转 Word 常见问题", es: "PDF a Word por lotes — preguntas frecuentes" },
    items: {
      en: [
        { q: "How do I convert several PDFs to Word at once?", a: "Drop your PDFs onto the page — or a whole folder — then click Convert all. Each file is converted to an editable Word document one by one, and when they finish you click Download ZIP to get them all back in a single archive." },
        { q: "Will the Word file look exactly like the original?", a: "No converter can promise a pixel-perfect copy. We extract the text into a genuinely editable .docx, which is what you want for editing — but scanned PDFs or heavily-designed pages may need cleanup afterwards. For a born-digital PDF with normal text, results are usually close." },
        { q: "Which PDFs convert best?", a: "Text-based, born-digital PDFs convert best. Scanned PDFs have no selectable text — run OCR on them first, otherwise the Word file comes back empty. If your PDF is mostly tables, the PDF to Excel converter usually gives a cleaner result." },
        { q: "Is there a size or count limit?", a: "You can convert up to 20 PDFs per batch, each up to 5 MB. For a file larger than 5 MB, use the single-file PDF to Word tool, which handles bigger files." },
        { q: "Are my files uploaded, and is it free?", a: "It's free with no account. Unlike our browser-only tools, conversion to Word runs on our own server, so each PDF is sent there, converted, and returned — it is not stored or kept afterwards." },
      ],
      zh: [
        { q: "怎么一次把多个 PDF 转成 Word？", a: "把多个 PDF 拖到页面上——也可以直接拖入整个文件夹——再点「全部转换」。每个文件逐个转成可编辑的 Word 文档，完成后点「下载 ZIP」，把它们打包成一个压缩包一起拿回。" },
        { q: "转出的 Word 会和原件一模一样吗？", a: "没有任何转换器能保证逐像素还原。我们把文字提取成真正可编辑的 .docx，这正是编辑所需——但扫描件或排版复杂的页面可能需要再整理。对于正常文字的电子版 PDF，结果通常比较接近。" },
        { q: "哪类 PDF 转换效果最好？", a: "文字版、电子原生的 PDF 效果最好。扫描件没有可选文字，请先做 OCR，否则转出的 Word 会是空的。如果 PDF 主要由表格构成，用「PDF 转 Excel」通常更整洁。" },
        { q: "有数量或大小限制吗？", a: "每批最多转换 20 个 PDF，每个不超过 5MB。超过 5MB 的文件请用单文件的「PDF 转 Word」工具，那里支持更大的文件。" },
        { q: "文件会被上传吗？免费吗？", a: "免费、无需注册。与我们的纯浏览器工具不同，转成 Word 在我们自己的服务器上完成，所以每个 PDF 会被发送到服务器转换后返回——转换后不会保存或留存。" },
      ],
      es: [
        { q: "¿Cómo convierto varios PDF a Word a la vez?", a: "Arrastra tus PDF a la página (o una carpeta entera) y haz clic en Convertir todo. Cada archivo se convierte a un documento de Word editable uno por uno y, al terminar, pulsa Descargar ZIP para obtenerlos todos en un solo archivo." },
        { q: "¿El archivo de Word quedará exactamente igual que el original?", a: "Ningún convertidor puede prometer una copia idéntica al píxel. Extraemos el texto en un .docx realmente editable, que es lo que necesitas para editar, pero los PDF escaneados o muy diseñados pueden requerir ajustes después. Para un PDF digital con texto normal, el resultado suele ser cercano." },
        { q: "¿Qué PDF se convierten mejor?", a: "Los PDF basados en texto y digitales de origen se convierten mejor. Los PDF escaneados no tienen texto seleccionable: aplícales OCR primero, de lo contrario el archivo de Word saldrá vacío. Si tu PDF es mayormente tablas, el convertidor de PDF a Excel suele dar un resultado más limpio." },
        { q: "¿Hay límite de tamaño o cantidad?", a: "Puedes convertir hasta 20 PDF por lote, cada uno de hasta 5 MB. Para un archivo de más de 5 MB, usa la herramienta de un solo archivo PDF a Word, que admite archivos más grandes." },
        { q: "¿Se suben mis archivos? ¿Es gratis?", a: "Es gratis y sin cuenta. A diferencia de nuestras herramientas que funcionan solo en el navegador, la conversión a Word se ejecuta en nuestro propio servidor, así que cada PDF se envía allí, se convierte y se devuelve; no se almacena ni se conserva." },
      ],
    },
  },
  "batch-pdf-to-excel": {
    title: { en: "Batch PDF to Excel — FAQ", zh: "批量 PDF 转 Excel 常见问题", es: "PDF a Excel por lotes — preguntas frecuentes" },
    items: {
      en: [
        { q: "How do I convert several PDFs to Excel at once?", a: "Drop your PDFs onto the page — or a whole folder — then click Convert all. Each file is converted to an editable Excel spreadsheet one by one, and when they finish you click Download ZIP to get them all back in a single archive." },
        { q: "Will the Excel file look exactly like the original?", a: "No converter can promise a pixel-perfect copy. We extract the tables and text into a genuinely editable .xlsx, which is what you want for working with the numbers — but scanned PDFs or heavily-designed pages may need cleanup afterwards. For a born-digital PDF with clear tables, results are usually close." },
        { q: "Which PDFs convert best?", a: "PDFs built from clear tables — invoices, bank statements, data sheets — convert best, because the rows and columns map straight into spreadsheet cells. Scanned PDFs have no selectable text, so run OCR on them first. If your PDF is mostly paragraphs rather than tables, the PDF to Word converter usually gives a cleaner result." },
        { q: "Is there a size or count limit?", a: "You can convert up to 20 PDFs per batch, each up to 5 MB. For a file larger than 5 MB, use the single-file PDF to Excel tool, which handles bigger files." },
        { q: "Are my files uploaded, and is it free?", a: "It's free with no account. Unlike our browser-only tools, conversion to Excel runs on our own server, so each PDF is sent there, converted, and returned — it is not stored or kept afterwards." },
      ],
      zh: [
        { q: "怎么一次把多个 PDF 转成 Excel？", a: "把多个 PDF 拖到页面上——也可以直接拖入整个文件夹——再点「全部转换」。每个文件逐个转成可编辑的 Excel 表格，完成后点「下载 ZIP」，把它们打包成一个压缩包一起拿回。" },
        { q: "转出的 Excel 会和原件一模一样吗？", a: "没有任何转换器能保证逐像素还原。我们把表格和文字提取成真正可编辑的 .xlsx，这正是处理数据所需——但扫描件或排版复杂的页面可能需要再整理。对于表格清晰的电子版 PDF，结果通常比较接近。" },
        { q: "哪类 PDF 转换效果最好？", a: "由清晰表格构成的 PDF——发票、对账单、数据表——效果最好，因为行列能直接对应到表格单元格。扫描件没有可选文字，请先做 OCR。如果 PDF 主要是段落文字而非表格，用「PDF 转 Word」通常更整洁。" },
        { q: "有数量或大小限制吗？", a: "每批最多转换 20 个 PDF，每个不超过 5MB。超过 5MB 的文件请用单文件的「PDF 转 Excel」工具，那里支持更大的文件。" },
        { q: "文件会被上传吗？免费吗？", a: "免费、无需注册。与我们的纯浏览器工具不同，转成 Excel 在我们自己的服务器上完成，所以每个 PDF 会被发送到服务器转换后返回——转换后不会保存或留存。" },
      ],
      es: [
        { q: "¿Cómo convierto varios PDF a Excel a la vez?", a: "Arrastra tus PDF a la página (o una carpeta entera) y haz clic en Convertir todo. Cada archivo se convierte a una hoja de cálculo de Excel editable uno por uno y, al terminar, pulsa Descargar ZIP para obtenerlos todos en un solo archivo." },
        { q: "¿El archivo de Excel quedará exactamente igual que el original?", a: "Ningún convertidor puede prometer una copia idéntica al píxel. Extraemos las tablas y el texto en un .xlsx realmente editable, que es lo que necesitas para trabajar con los datos, pero los PDF escaneados o muy diseñados pueden requerir ajustes después. Para un PDF digital con tablas claras, el resultado suele ser cercano." },
        { q: "¿Qué PDF se convierten mejor?", a: "Los PDF formados por tablas claras —facturas, extractos bancarios, hojas de datos— se convierten mejor, porque las filas y columnas se asignan directamente a las celdas de la hoja de cálculo. Los PDF escaneados no tienen texto seleccionable, así que aplícales OCR primero. Si tu PDF es mayormente párrafos en lugar de tablas, el convertidor de PDF a Word suele dar un resultado más limpio." },
        { q: "¿Hay límite de tamaño o cantidad?", a: "Puedes convertir hasta 20 PDF por lote, cada uno de hasta 5 MB. Para un archivo de más de 5 MB, usa la herramienta de un solo archivo PDF a Excel, que admite archivos más grandes." },
        { q: "¿Se suben mis archivos? ¿Es gratis?", a: "Es gratis y sin cuenta. A diferencia de nuestras herramientas que funcionan solo en el navegador, la conversión a Excel se ejecuta en nuestro propio servidor, así que cada PDF se envía allí, se convierte y se devuelve; no se almacena ni se conserva." },
      ],
    },
  },
  "batch-compress": {
    title: { en: "Batch compress PDF — FAQ", zh: "批量 PDF 压缩常见问题", es: "Comprimir PDF por lotes — preguntas frecuentes" },
    items: {
      en: [
        { q: "How do I compress several PDFs at once?", a: "Drag your PDFs onto the page — or drop a whole folder, or use \"Choose folder\" — and any non-PDF files in that folder are filtered out automatically. Pick a compression strength (\"Light\", \"Recommended\", or \"Strong\"), then click \"Compress all\". Each file is processed one by one, and when it finishes you click \"Download ZIP\" to get them all back in a single archive." },
        { q: "Are my files uploaded to a server?", a: "No. This is a 100% client-side tool: every PDF is read and compressed right inside your browser, and nothing is ever sent to any server. Your files never leave your device, which is also why you can use it on confidential documents without worry." },
        { q: "What do I get back, and how are the files named?", a: "You get a single ZIP file (dockdocs-compressed.zip). Inside it, each PDF keeps its original name with \"-compressed\" added before the extension — so report.pdf becomes report-compressed.pdf. Each row also shows how much that file shrank, and the download button shows the overall size reduction." },
        { q: "Is there a limit on how many files or how large they can be?", a: "You can add up to 20 PDFs per batch. There's no fixed per-file size cap — because everything runs in your browser, the real limit is your device's memory. Big or numerous files still work, they just take longer to process on a weaker machine." },
        { q: "Why didn't my PDF shrink much?", a: "Compression works by rendering each page to an image, which is great for scans and image-heavy PDFs but does little for files that are mostly plain text — there's simply not much to squeeze out. If a file barely changes, that's expected; try \"Strong\" for a bit more, but text-only PDFs are already close to their minimum size." },
        { q: "Is it free? Do I need an account?", a: "Yes, it's completely free — no signup, no watermark, no daily limit. Just open the page and start compressing." },
      ],
      zh: [
        { q: "怎么一次压缩多个 PDF？", a: "把多个 PDF 拖到页面上——也可以直接拖入整个文件夹，或点「选择文件夹」——文件夹里的非 PDF 文件会被自动过滤掉。选择压缩强度（「轻度」「推荐」或「强力」），再点「全部压缩」。每个文件会逐个处理，完成后点「下载 ZIP」，就能把它们打包成一个压缩包一起拿回。" },
        { q: "我的文件会被上传到服务器吗？", a: "不会。这是一个 100% 在本地运行的工具——每个 PDF 都在你的浏览器里读取和压缩，不会发送到任何服务器。文件始终不离开你的设备，所以处理机密文档也可以放心使用。" },
        { q: "我拿回的是什么格式？文件怎么命名？", a: "你拿回的是一个 ZIP 压缩包（dockdocs-compressed.zip）。里面每个 PDF 保留原文件名，并在扩展名前加上「-compressed」——比如 report.pdf 会变成 report-compressed.pdf。每一行还会显示该文件减小了多少，下载按钮上则显示整体的压缩比例。" },
        { q: "对文件数量或大小有限制吗？", a: "每批最多可以添加 20 份 PDF。单个文件没有固定的大小上限——因为全部在浏览器里完成，真正的上限是你设备的内存。文件很大或很多依然可以处理，只是在配置较弱的机器上会慢一些。" },
        { q: "为什么我的 PDF 压不了多少？", a: "压缩的原理是把每一页渲染成图片——这对扫描件和图片多的 PDF 效果很好，但对以纯文字为主的文件作用有限，因为本来就没多少可压的空间。如果某个文件几乎没变化，这是正常的；可以试试「强力」再多压一点，但纯文字 PDF 通常已经接近它的最小体积了。" },
        { q: "免费吗？需要注册吗？", a: "完全免费——无需注册、没有水印、也没有每日次数限制。打开页面就能直接开始压缩。" },
      ],
      es: [
        { q: "¿Cómo comprimo varios PDF a la vez?", a: "Arrastra tus PDF a la página —o suelta una carpeta entera, o usa «Elegir carpeta»— y cualquier archivo que no sea PDF dentro de esa carpeta se descarta de forma automática. Elige una intensidad de compresión («Ligera», «Recomendada» o «Fuerte») y luego haz clic en «Comprimir todo». Cada archivo se procesa uno por uno y, al terminar, haces clic en «Descargar ZIP» para recuperarlos todos en un solo archivo comprimido." },
        { q: "¿Mis archivos se suben a un servidor?", a: "No. Es una herramienta 100 % del lado del cliente: cada PDF se lee y se comprime dentro de tu propio navegador, y nada se envía nunca a ningún servidor. Tus archivos jamás salen de tu dispositivo, y por eso puedes usarla con documentos confidenciales sin preocupación." },
        { q: "¿Qué recibo de vuelta y cómo se nombran los archivos?", a: "Recibes un único archivo ZIP (dockdocs-compressed.zip). Dentro, cada PDF conserva su nombre original con «-compressed» añadido antes de la extensión, así que report.pdf se convierte en report-compressed.pdf. Cada fila también muestra cuánto se redujo ese archivo, y el botón de descarga muestra la reducción de tamaño total." },
        { q: "¿Hay un límite de cuántos archivos o de qué tamaño pueden tener?", a: "Puedes añadir hasta 30 PDF por lote. No hay un tope de tamaño fijo por archivo: como todo se ejecuta en tu navegador, el límite real es la memoria de tu dispositivo. Los archivos grandes o numerosos siguen funcionando, solo que tardan más en procesarse en una máquina menos potente." },
        { q: "¿Por qué mi PDF apenas se redujo?", a: "La compresión funciona renderizando cada página como imagen, lo cual es ideal para escaneos y PDF con muchas imágenes, pero hace poco con archivos que son mayormente texto plano: simplemente no hay mucho que exprimir. Si un archivo apenas cambia, es lo esperado; prueba «Fuerte» para reducir un poco más, pero los PDF de solo texto ya están cerca de su tamaño mínimo." },
        { q: "¿Es gratis? ¿Necesito una cuenta?", a: "Sí, es completamente gratis: sin registro, sin marca de agua, sin límite diario. Solo abre la página y empieza a comprimir." },
      ],
    },
  },
  "batch-pdf-to-image": {
    title: { en: "Batch PDF to image — FAQ", zh: "批量 PDF 转图片常见问题", es: "PDF a imagen por lotes — preguntas frecuentes" },
    items: {
      en: [
        { q: "How do I convert a batch of PDFs to images?", a: "Drag your PDFs onto the upload box — or drop a whole folder, or click \"Choose folder\" to pick one. Choose JPG or PNG, then click \"Convert all\". Every page of every PDF is turned into an image and the result downloads as a single ZIP. There's no signup and no watermark." },
        { q: "Are my files uploaded to a server?", a: "No. This tool is 100% client-side: each PDF is read and rendered into images entirely inside your browser, and nothing is ever uploaded to any server. The ZIP you download is built locally on your device. You can even run it offline once the page has loaded." },
        { q: "What do I get back, and how are the images named?", a: "You get one ZIP file (named dockdocs-images.zip) containing every page as a separate image. Each file is named after its source PDF plus the page number — for example report.pdf becomes report-1.jpg, report-2.jpg, and so on. Pages are rendered at 2× scale for crisp, high-resolution output." },
        { q: "What's the difference between JPG and PNG here?", a: "JPG gives smaller files and flattens each page onto a white background — ideal for photo-heavy or scanned documents. PNG is lossless and keeps transparency, which is better for line art, diagrams, or pages you'll edit later. Pick whichever fits before you hit \"Convert all\"; you can re-run with the other format any time." },
        { q: "How many files or pages can I convert at once?", a: "You can queue up to 20 PDFs per batch — extra files beyond that are dropped automatically. There's no fixed page or size limit, so the real ceiling is your device's memory: very large PDFs or huge page counts simply take longer and run slower on weaker machines. For a big job, split it into a few batches." },
        { q: "Why did one of my PDFs show \"failed\"?", a: "The most common cause is a password-protected or encrypted PDF — the tool can't render pages it can't open, so that file is marked failed while the rest of the batch still converts normally. Remove the password first (our Unlock PDF tool can help), then add it back. Corrupted or non-PDF files can also fail; note that if you drop a folder, non-PDF files are filtered out automatically rather than failing." },
      ],
      zh: [
        { q: "怎么批量把 PDF 转成图片？", a: "把 PDF 拖到上传框里——也可以直接拖入整个文件夹，或点击「选择文件夹」挑一个。选好 JPG 或 PNG，再点「全部转换」。每份 PDF 的每一页都会转成一张图片，结果打包成一个 ZIP 下载下来。无需注册，也没有水印。" },
        { q: "我的文件会被上传到服务器吗？", a: "不会。本工具 100% 在本地运行——每份 PDF 都在你的浏览器里读取并渲染成图片，任何文件都不会上传到任何服务器。下载的 ZIP 也是在你设备上本地生成的。页面加载完后，即使断网也能用。" },
        { q: "转完得到什么？图片怎么命名？", a: "你会得到一个 ZIP 文件(名为 dockdocs-images.zip)，里面每一页都是一张单独的图片。每个文件以源 PDF 名加页码命名——比如 report.pdf 会生成 report-1.jpg、report-2.jpg，以此类推。每页都以 2× 倍率渲染，输出清晰、分辨率高。" },
        { q: "这里的 JPG 和 PNG 有什么区别？", a: "JPG 文件更小，会把每一页铺在白色背景上——适合图片多的文档或扫描件。PNG 是无损的，保留透明背景，更适合线稿、图表或之后要再编辑的页面。点「全部转换」前选好就行；想换格式随时可以重新跑一次。" },
        { q: "一次能转多少份文件或多少页？", a: "每一批最多排入 20 份 PDF——超出的会被自动丢弃。页数和大小没有固定上限，真正的天花板是你设备的内存：超大 PDF 或页数极多时只是更慢一些，在配置较弱的机器上跑得吃力。任务很大时，建议拆成几批来转。" },
        { q: "为什么有一份 PDF 显示「失败」?", a: "最常见的原因是带密码或加密的 PDF——工具打不开就没法渲染页面，于是这份会被标为「失败」，而同批其他文件照常转换。请先去掉密码(可以用我们的「解锁 PDF」工具)，再把它加回来。损坏的文件或非 PDF 文件也可能失败；不过——如果你拖入的是文件夹，里面的非 PDF 文件会被自动过滤掉，而不会报失败。" },
      ],
      es: [
        { q: "¿Cómo convierto un lote de PDF a imágenes?", a: "Arrastra tus PDF a la casilla de carga —o suelta una carpeta entera, o haz clic en «Elegir carpeta» para escoger una—. Elige JPG o PNG y luego haz clic en «Convertir todo». Cada página de cada PDF se convierte en una imagen y el resultado se descarga como un único ZIP. No hay registro ni marca de agua." },
        { q: "¿Mis archivos se suben a un servidor?", a: "No. Esta herramienta es 100 % del lado del cliente: cada PDF se lee y se renderiza en imágenes por completo dentro de tu navegador, y nada se sube nunca a ningún servidor. El ZIP que descargas se genera localmente en tu dispositivo. Incluso puedes usarla sin conexión una vez que la página ha cargado." },
        { q: "¿Qué recibo de vuelta y cómo se nombran las imágenes?", a: "Recibes un archivo ZIP (llamado dockdocs-images.zip) que contiene cada página como una imagen separada. Cada archivo lleva el nombre de su PDF de origen más el número de página; por ejemplo, report.pdf se convierte en report-1.jpg, report-2.jpg, y así sucesivamente. Las páginas se renderizan a escala 2× para una salida nítida y de alta resolución." },
        { q: "¿Cuál es la diferencia entre JPG y PNG aquí?", a: "JPG genera archivos más pequeños y aplana cada página sobre un fondo blanco, ideal para documentos con muchas fotos o escaneados. PNG no tiene pérdidas y conserva la transparencia, lo cual es mejor para dibujos lineales, diagramas o páginas que vayas a editar después. Elige el que mejor te convenga antes de pulsar «Convertir todo»; puedes volver a ejecutarlo con el otro formato cuando quieras." },
        { q: "¿Cuántos archivos o páginas puedo convertir a la vez?", a: "Puedes poner en cola hasta 20 PDF por lote; los archivos que sobren se descartan automáticamente. No hay un límite fijo de páginas o tamaño, así que el techo real es la memoria de tu dispositivo: los PDF muy grandes o con muchísimas páginas simplemente tardan más y van más lentos en máquinas menos potentes. Para un trabajo grande, divídelo en varios lotes." },
        { q: "¿Por qué uno de mis PDF mostró «fallido»?", a: "La causa más común es un PDF protegido con contraseña o cifrado: la herramienta no puede renderizar páginas que no puede abrir, así que ese archivo se marca como fallido mientras el resto del lote se convierte con normalidad. Quita primero la contraseña (nuestra herramienta Desbloquear PDF puede ayudar) y vuelve a añadirlo. Los archivos dañados o que no sean PDF también pueden fallar; ten en cuenta que, si sueltas una carpeta, los archivos que no sean PDF se descartan automáticamente en lugar de fallar." },
      ],
    },
  },
  "batch-protect-pdf": {
    title: { en: "Batch encrypt PDF — FAQ", zh: "批量 PDF 加密常见问题", es: "Cifrar PDF por lotes — preguntas frecuentes" },
    items: {
      en: [
        { q: "How do I encrypt several PDFs at once?", a: "Drag your PDFs onto the box — or drop an entire folder, or click to choose files. Type one password (the \"Password\" field), then click \"Encrypt all\". Every file is locked with that same password, and you get a single ZIP back with each file renamed to \"…-protected.pdf\"." },
        { q: "Are my files uploaded to a server?", a: "No. This is a 100% client-side tool — every PDF is encrypted right inside your browser and nothing ever leaves your device. There is no upload, no account, and no copy kept anywhere. You can even run it offline once the page has loaded." },
        { q: "What do I get back, and in what format?", a: "You get one ZIP file named \"dockdocs-protected.zip\". Inside it, each input PDF appears as its own encrypted file with a \"-protected.pdf\" suffix. Open any of them and your reader will ask for the password you set." },
        { q: "Are there rules for the password or limits on how many files?", a: "The password must be 4–32 characters using only letters, digits, and the underscore (_) — that keeps it safe to apply across every PDF reader. You can encrypt up to 20 files per batch; for more, just run the tool again. There's no hard size limit, but because everything runs in your browser, very large jobs go slower on low-memory devices." },
        { q: "What happens to a PDF that's already password-protected?", a: "It's skipped. The tool can't re-lock a file it can't open, so any PDF that already has a password is left out of the ZIP rather than failing the whole batch. Decrypt it first (with the original password) if you want to re-encrypt it here." },
        { q: "Is it really free? Any watermark or sign-up?", a: "Yes, completely free with no sign-up and no watermark. The encrypted PDFs are byte-for-byte your originals plus the password — DockDocs adds nothing to them." },
      ],
      zh: [
        { q: "怎么一次给多个 PDF 加密？", a: "把 PDF 拖进上传框——也可以直接拖入整个文件夹，或点击选择文件。在「密码」框里输入一个密码，然后点「全部加密」。所有文件都会用这同一个密码上锁，最后你会得到一个 ZIP，每份文件都被重命名为「…-protected.pdf」。" },
        { q: "我的文件会被上传到服务器吗？", a: "不会。这是一个 100% 在本地运行的工具——每份 PDF 都在你的浏览器里加密，任何文件都不会离开你的设备。没有上传、不用注册、也不会在任何地方留副本。页面加载完成后，你甚至可以断网使用。" },
        { q: "加密完我会拿到什么？什么格式？", a: "你会得到一个名为「dockdocs-protected.zip」的压缩包。里面每份原 PDF 都是一份独立的加密文件，文件名带「-protected.pdf」后缀。打开其中任意一份时，阅读器都会要求输入你设的密码。" },
        { q: "密码有规则吗？文件数量有上限吗？", a: "密码必须是 4–32 位，且只能用字母、数字和下划线(_)——这样才能保证在各种 PDF 阅读器里都通用。每批最多加密 20 份文件，要更多就再运行一次即可。没有硬性大小限制，但由于全部在浏览器里完成，文件特别多或特别大时——在内存较小的设备上会慢一些。" },
        { q: "已经设过密码的 PDF 会怎么处理？", a: "会被跳过。工具打不开一个已加密的文件，自然也无法再次上锁，所以这类 PDF 会被排除在 ZIP 之外，而不会让整批任务失败。如果想在这里重新加密，请先用原密码解密它。" },
        { q: "真的免费吗？有水印或要注册吗？", a: "是的，完全免费，无需注册，也没有水印。加密后的 PDF 与你的原件逐字节一致，只是多了一道密码——DockDocs 不会往里面添加任何东西。" },
      ],
      es: [
        { q: "¿Cómo cifro varios PDF a la vez?", a: "Arrastra tus PDF a la casilla —o suelta una carpeta entera, o haz clic para elegir archivos—. Escribe una contraseña (el campo «Contraseña») y luego haz clic en «Cifrar todo». Cada archivo se bloquea con esa misma contraseña y recibes un único ZIP con cada archivo renombrado como «…-protected.pdf»." },
        { q: "¿Mis archivos se suben a un servidor?", a: "No. Es una herramienta 100 % del lado del cliente: cada PDF se cifra dentro de tu propio navegador y nada sale jamás de tu dispositivo. No hay carga, ni cuenta, ni copia guardada en ningún sitio. Incluso puedes usarla sin conexión una vez que la página ha cargado." },
        { q: "¿Qué recibo de vuelta y en qué formato?", a: "Recibes un archivo ZIP llamado «dockdocs-protected.zip». Dentro, cada PDF de entrada aparece como su propio archivo cifrado con el sufijo «-protected.pdf». Abre cualquiera de ellos y tu lector pedirá la contraseña que estableciste." },
        { q: "¿Hay reglas para la contraseña o límites de cuántos archivos?", a: "La contraseña debe tener entre 4 y 32 caracteres usando solo letras, dígitos y el guion bajo (_); así es seguro aplicarla en cualquier lector de PDF. Puedes cifrar hasta 30 archivos por lote; para más, vuelve a ejecutar la herramienta. No hay un límite estricto de tamaño, pero como todo se ejecuta en tu navegador, los trabajos muy grandes van más lentos en dispositivos con poca memoria." },
        { q: "¿Qué ocurre con un PDF que ya está protegido con contraseña?", a: "Se omite. La herramienta no puede volver a bloquear un archivo que no puede abrir, así que cualquier PDF que ya tenga contraseña queda fuera del ZIP en lugar de hacer fallar todo el lote. Descífralo primero (con la contraseña original) si quieres volver a cifrarlo aquí." },
        { q: "¿De verdad es gratis? ¿Lleva marca de agua o requiere registro?", a: "Sí, completamente gratis, sin registro y sin marca de agua. Los PDF cifrados son byte a byte tus originales más la contraseña; DockDocs no les añade nada." },
      ],
    },
  },
  "flashcards": {
    title: { en: "PDF Flashcards — FAQ", zh: "PDF 抽认卡常见问题", es: "Tarjetas de estudio de PDF — preguntas frecuentes" },
    items: {
      en: [
        { q: "How do I turn a PDF into flashcards?", a: "Drop in a PDF — a textbook chapter, lecture notes, or a manual — and the tool reads the text right in your browser. Pick how many cards you want (5, 10, 15, or 20), then press \"Generate cards.\" You get a grid of question/answer cards; tap any card to flip it and check yourself." },
        { q: "Is my PDF uploaded anywhere?", a: "Your PDF file is never uploaded. The text is extracted inside your browser, and only that plain text (plus your card count and language) is sent to our AI service to write the cards. The original file, with its images, layout, and metadata, stays on your device." },
        { q: "Why does it say \"No text found in this PDF\"?", a: "Your PDF is a scan or a picture — it has no text layer to read, only an image of the page. Run it through OCR first to add a searchable text layer, then come back and try again. Tip: if the PDF is password-protected, unlock it first with the \"Unlock PDF\" tool." },
        { q: "Are the cards accurate?", a: "The cards are written by AI using only the text from your document — it's told not to use outside knowledge or invent facts. Even so, AI can misread or oversimplify, so give the cards a quick check before you study from them. The tool reminds you of this on the results screen." },
        { q: "Is there a size or usage limit?", a: "Yes. Each run accepts up to about 16,000 characters of text — roughly 12 pages — so feed it one chapter or section at a time rather than a whole book. There's also a fair-use rate limit of about six generations per minute. If you hit either, you'll see a clear message; just shorten the content or wait a minute." },
        { q: "Is it free, and do I need an internet connection?", a: "It's free to use — no account or payment needed. Because the cards are written by an AI service, you do need an internet connection: the browser reads your PDF offline, but generating the cards makes a quick call to our server." },
      ],
      zh: [
        { q: "怎么把 PDF 变成抽认卡？", a: "把 PDF 拖进来——课本章节、讲义或手册都行——工具会直接在你的浏览器里读取文字。选择想要的卡片数量（5、10、15 或 20 张），然后点「生成卡片」。你会得到一组问答卡片，点任意一张即可翻面自测。" },
        { q: "我的 PDF 会被上传吗？", a: "你的 PDF 文件不会被上传。文字是在你的浏览器内提取的，只有提取出的纯文本（加上卡片数量和语言）会发给我们的 AI 服务来生成卡片。原始文件——连同里面的图片、排版和元数据——始终留在你的设备上。" },
        { q: "为什么提示「这个 PDF 里没有文字」？", a: "你的 PDF 是扫描件或图片——它没有可读取的文字层，只有页面的图像。请先用 OCR 给它加上可检索的文字层，再回来重试。提示：如果 PDF 有密码保护，请先用「解锁 PDF」工具去掉保护。" },
        { q: "卡片内容准确吗？", a: "卡片由 AI 仅根据你文档里的文字生成——我们要求它不使用外部知识、不编造事实。即便如此，AI 也可能误读或过度简化，所以学习前请快速核对一遍。工具在结果页面也会提醒你这一点。" },
        { q: "有大小或使用限制吗？", a: "有。每次最多处理约 16,000 字符的文字——大约 12 页——所以请一次喂一个章节或小节，而不是整本书。另外还有合理使用的频率限制，约为每分钟六次生成。一旦触及，你会看到清晰的提示；缩短内容或稍等一分钟即可。" },
        { q: "是免费的吗？需要联网吗？", a: "免费使用——无需注册或付费。由于卡片是由 AI 服务生成的，你确实需要联网——浏览器离线读取你的 PDF，但生成卡片会向我们的服务器发起一次快速请求。" },
      ],
      es: [
        { q: "¿Cómo convierto un PDF en tarjetas de estudio?", a: "Suelta un PDF —un capítulo de un libro de texto, apuntes de clase o un manual— y la herramienta lee el texto directamente en tu navegador. Elige cuántas tarjetas quieres (5, 10, 15 o 20) y pulsa «Generar tarjetas». Obtienes una cuadrícula de tarjetas de pregunta/respuesta; toca cualquier tarjeta para darle la vuelta y autoevaluarte." },
        { q: "¿Mi PDF se sube a algún sitio?", a: "Tu archivo PDF nunca se sube. El texto se extrae dentro de tu navegador y solo ese texto plano (más la cantidad de tarjetas y el idioma) se envía a nuestro servicio de IA para redactar las tarjetas. El archivo original, con sus imágenes, diseño y metadatos, permanece en tu dispositivo." },
        { q: "¿Por qué dice «No se encontró texto en este PDF»?", a: "Tu PDF es un escaneo o una imagen: no tiene una capa de texto que leer, solo una imagen de la página. Pásalo primero por OCR para añadir una capa de texto consultable y luego vuelve a intentarlo. Consejo: si el PDF está protegido con contraseña, desbloquéalo primero con la herramienta «Desbloquear PDF»." },
        { q: "¿Son precisas las tarjetas?", a: "Las tarjetas las redacta la IA usando únicamente el texto de tu documento; se le indica que no use conocimiento externo ni invente datos. Aun así, la IA puede malinterpretar o simplificar de más, así que revisa rápidamente las tarjetas antes de estudiar con ellas. La herramienta te lo recuerda en la pantalla de resultados." },
        { q: "¿Hay un límite de tamaño o de uso?", a: "Sí. Cada ejecución acepta hasta unos 16 000 caracteres de texto —aproximadamente 12 páginas—, así que aliméntala con un capítulo o sección a la vez en lugar de un libro entero. También hay un límite de uso justo de unas seis generaciones por minuto. Si alcanzas alguno, verás un mensaje claro; solo acorta el contenido o espera un minuto." },
        { q: "¿Es gratis y necesito conexión a internet?", a: "Es gratis de usar: no se necesita cuenta ni pago. Como las tarjetas las redacta un servicio de IA, sí necesitas conexión a internet: el navegador lee tu PDF sin conexión, pero generar las tarjetas hace una llamada rápida a nuestro servidor." },
      ],
    },
  },
  "compare": {
    title: { en: "Compare documents — FAQ", zh: "多文档对比常见问题", es: "Comparar documentos — preguntas frecuentes" },
    items: {
      en: [
        { q: "How do I compare documents?", a: "Upload 2 to 8 PDFs of the same kind — quotes, invoices, or contracts — then pick the type and click \"Compare fields\". DockDocs lines up the key terms (price, delivery, payment, warranty, and so on) side by side in one table, showing the exact source line behind each value wherever it can locate one (and \"Not recognized\" when a document doesn't state it, never a guess). You also get a recommendation backed by those compared numbers for which option wins, and you can ask one question across all the documents at once." },
        { q: "Are my files uploaded to your server?", a: "No — your PDFs never leave your device. DockDocs reads them right in your browser to pull out the text. Only that extracted plain text (not the file itself) is sent to our server, where the AI extracts and aligns the fields. So the document, its layout, and any embedded data stay local; what travels is the words on the page." },
        { q: "Why does my PDF say \"Not recognized (likely scanned — needs OCR)\"?", a: "That means the PDF has no selectable text layer — it's usually a scan or a photo of a page, so there's nothing to read. Click \"Extract text with OCR\" on that document and DockDocs will run OCR in your browser to recognize the text (the first few pages), then you can compare it like any other file. Encrypted or password-protected PDFs also can't be read until they're unlocked." },
        { q: "What do I get back, and can I trust the values?", a: "You get a comparison table where every cell shows the value plus the exact source line it came from — and that line is verified to actually appear in your document, so nothing is invented. Click any source line to jump to a highlighted snippet of the original text. If a document simply doesn't state something, you'll see \"Not recognized\" rather than a guess. One caveat: the overall recommendation is the AI's reasoning over those numbers and isn't individually source-checked, so confirm the figures in the table before you decide." },
        { q: "Is there a limit on file count or size?", a: "You can compare up to 8 PDFs at a time, and you need at least 2 readable ones for the comparison to run. For the \"ask across documents\" feature, the combined text of all documents must stay under 60,000 characters and your question under 500 characters — if you hit that, use fewer or shorter documents. The tool needs an internet connection, since the field extraction and recommendation run on our server." },
        { q: "Is it free?", a: "Yes — you can upload your PDFs, run the side-by-side comparison, get the recommendation, and ask questions across your documents. The in-browser OCR for scanned files is free too, since it runs locally on your device." },
      ],
      zh: [
        { q: "怎么对比文档？", a: "上传 2 到 8 份同类 PDF——报价单、账单或合同——选好类型，点「对比字段」。DockDocs 会把关键条款(总价、交期、付款方式、质保等)并排放进一张表里，能定位到原文时，就在值后面附上它在原文里的那一句出处(定位不到则显示「未识别」，绝不猜测)。你还会得到一份带依据的推荐(选哪个、为什么)，并且可以用一个问题问遍所有上传的文档。" },
        { q: "我的文件会上传到你们服务器吗？", a: "不会——你的 PDF 不离开你的设备。DockDocs 直接在你浏览器里读取文件、抽出文字，只有抽出的纯文本(而不是文件本身)会发到我们服务器，由 AI 在那里抽取并对齐字段。所以文档、版式和任何内嵌数据都留在本地，真正传出去的只是页面上的文字。" },
        { q: "为什么我的 PDF 显示「未识别(可能是扫描件——需 OCR)」？", a: "这表示这份 PDF 没有可选中的文字层——通常是扫描件或页面照片，里面没有现成的文字可读。点这份文档上的「用 OCR 提取文字」,DockDocs 会在你浏览器里跑 OCR 识别文字(前几页)，识别后就能像普通文件一样对比了。加密或带密码的 PDF 在解锁前也读不了。" },
        { q: "对比完我能拿到什么？这些值可信吗？", a: "你会拿到一张对比表，每个单元格都显示具体的值，以及它来自原文的那一句——而且这句已校验确实出现在你的文档里，绝不凭空编造。点任意一句出处，就能跳到原文对应片段并高亮显示。如果某份文档根本没写某项，你看到的是「未识别」而不是猜测。需要留意一点——最终的推荐结论是 AI 基于表格里数字做的推理，它不像表格每个单元格那样逐条核对过出处，所以决定前请以表格里的数字为准。" },
        { q: "对文件数量或大小有限制吗？", a: "一次最多对比 8 份 PDF，且至少要有 2 份可读才能开始对比。对于「跨文档提问」功能，所有文档合计文字需在 60,000 字符以内，问题在 500 字符以内——超了就换用更少或更短的文档。该工具需要联网，因为字段抽取和推荐是在我们服务器上完成的。" },
        { q: "免费吗？", a: "免费——你可以上传 PDF、做并排对比、拿到推荐，并跨文档提问。扫描件的浏览器内 OCR 也免费，因为它在你本地设备上运行。" },
      ],
      es: [
        { q: "¿Cómo comparo documentos?", a: "Sube de 2 a 8 PDF del mismo tipo —presupuestos, facturas o contratos—, luego elige el tipo y haz clic en «Comparar campos». DockDocs alinea los términos clave (precio, entrega, pago, garantía, etc.) lado a lado en una sola tabla, mostrando la línea de origen exacta detrás de cada valor cuando puede localizarla (y «No reconocido» cuando un documento no lo indica, nunca una suposición). También obtienes una recomendación basada en los datos comparados sobre qué opción gana, y puedes hacer una pregunta a todos los documentos a la vez." },
        { q: "¿Mis archivos se suben a tu servidor?", a: "No: tus PDF jamás salen de tu dispositivo. DockDocs los lee directamente en tu navegador para extraer el texto. Solo ese texto plano extraído (no el archivo en sí) se envía a nuestro servidor, donde la IA extrae y alinea los campos. Así que el documento, su diseño y cualquier dato incrustado permanecen locales; lo que viaja son las palabras de la página." },
        { q: "¿Por qué mi PDF dice «No reconocido (probablemente escaneado, necesita OCR)»?", a: "Significa que el PDF no tiene una capa de texto seleccionable: suele ser un escaneo o una foto de una página, así que no hay nada que leer. Haz clic en «Extraer texto con OCR» en ese documento y DockDocs ejecutará OCR en tu navegador para reconocer el texto (las primeras páginas), tras lo cual podrás compararlo como cualquier otro archivo. Los PDF cifrados o protegidos con contraseña tampoco se pueden leer hasta que se desbloquean." },
        { q: "¿Qué recibo de vuelta y puedo confiar en los valores?", a: "Recibes una tabla comparativa donde cada celda muestra el valor más la línea de origen exacta de la que procede, y esa línea se verifica que aparezca realmente en tu documento, así que nada se inventa. Haz clic en cualquier línea de origen para saltar a un fragmento resaltado del texto original. Si un documento simplemente no indica algo, verás «No reconocido» en lugar de una suposición. Una advertencia: la recomendación general es el razonamiento de la IA sobre esas cifras y no se verifica fuente por fuente, así que confirma los datos de la tabla antes de decidir." },
        { q: "¿Hay un límite de cantidad o tamaño de archivos?", a: "Puedes comparar hasta 8 PDF a la vez, y necesitas al menos 2 legibles para que la comparación se ejecute. Para la función de «preguntar a todos los documentos», el texto combinado de todos los documentos debe mantenerse por debajo de 60 000 caracteres y tu pregunta por debajo de 500 caracteres; si lo superas, usa documentos menos numerosos o más cortos. La herramienta necesita conexión a internet, ya que la extracción de campos y la recomendación se ejecutan en nuestro servidor." },
        { q: "¿Es gratis?", a: "Sí: puedes subir tus PDF, ejecutar la comparación lado a lado, obtener la recomendación y hacer preguntas a tus documentos. El OCR en el navegador para archivos escaneados también es gratis, ya que se ejecuta localmente en tu dispositivo." },
      ],
    },
  },
  "merge-pdf": {
    title: { en: "Merge PDF files — FAQ", zh: "合并 PDF 常见问题", es: "Combinar archivos PDF — preguntas frecuentes" },
    items: {
      en: [
        { q: "How do I merge PDF files?", a: "Add two or more PDFs, drag the file thumbnails into the order you want, then click Merge & download. The pages are combined top-to-bottom in that order into a single PDF." },
        { q: "Can I control the order they're combined in?", a: "Yes. Each file shows a thumbnail and a number badge — drag them around to reorder before merging. You see exactly what's going where before you click, not after." },
        { q: "Are my files uploaded to a server?", a: "No. Everything runs locally in your browser — the merging is done on your device and your files are never uploaded or sent anywhere. No account or sign-up needed." },
        { q: "Is there a file size or page limit?", a: "There's no fixed cap. Since the whole job runs in your browser, the practical limit is your device's memory — very large files or a lot of them at once can get slow on low-RAM devices." },
        { q: "Why did one of my PDFs get skipped?", a: "Password-protected or encrypted PDFs can't be read, so they're left out with a notice. Unlock or remove the password first, then add the file again." },
        { q: "Is it free?", a: "Yes — completely free, with no watermark and no registration. The merged file downloads as a single PDF." },
      ],
      zh: [
        { q: "如何合并 PDF 文件？", a: "添加两个或更多 PDF，把文件缩略图拖成你想要的顺序，然后点「合并并下载」。会按这个顺序从上到下把页面合并成一个 PDF。" },
        { q: "能控制合并顺序吗？", a: "能。每个文件都有缩略图和序号，合并前拖动即可调整顺序。合并前就能看清哪个排在哪，不用合完才发现顺序错了。" },
        { q: "文件会被上传到服务器吗？", a: "不会。全程在你的浏览器本地运行，合并在你的设备上完成，文件不会上传、也不会被发送到任何地方。无需账号、无需注册。" },
        { q: "有文件大小或页数限制吗？", a: "没有固定上限。因为整个过程都在浏览器里跑，实际上限取决于你设备的内存——文件太大或一次加太多，在内存小的设备上可能会变慢。" },
        { q: "为什么有个 PDF 被跳过了？", a: "加了密码或被加密的 PDF 读不了，会被跳过并给出提示。先解除密码，再重新添加这个文件即可。" },
        { q: "免费吗？", a: "免费——完全免费，无水印、无需注册。合并结果会下载为一个 PDF 文件。" },
      ],
      es: [
        { q: "¿Cómo combino archivos PDF?", a: "Añade dos o más PDF, arrastra las miniaturas de los archivos al orden que quieras y luego haz clic en «Combinar y descargar». Las páginas se unen de arriba abajo en ese orden en un único PDF." },
        { q: "¿Puedo controlar el orden en que se combinan?", a: "Sí. Cada archivo muestra una miniatura y una insignia con un número; arrástralos para reordenarlos antes de combinar. Ves exactamente qué va dónde antes de hacer clic, no después." },
        { q: "¿Mis archivos se suben a un servidor?", a: "No. Todo se ejecuta localmente en tu navegador: la combinación se hace en tu dispositivo y tus archivos jamás se suben ni se envían a ningún sitio. No se necesita cuenta ni registro." },
        { q: "¿Hay un límite de tamaño de archivo o de páginas?", a: "No hay un tope fijo. Como todo el trabajo se ejecuta en tu navegador, el límite práctico es la memoria de tu dispositivo: los archivos muy grandes o muchos a la vez pueden volverse lentos en dispositivos con poca RAM." },
        { q: "¿Por qué se omitió uno de mis PDF?", a: "Los PDF protegidos con contraseña o cifrados no se pueden leer, así que quedan fuera con un aviso. Desbloquéalos o quita la contraseña primero y vuelve a añadir el archivo." },
        { q: "¿Es gratis?", a: "Sí: completamente gratis, sin marca de agua y sin registro. El archivo combinado se descarga como un único PDF." },
      ],
    },
  },
  "split-pdf": {
    title: { en: "Split a PDF — FAQ", zh: "拆分 PDF 常见问题", es: "Dividir un PDF — preguntas frecuentes" },
    items: {
      en: [
        { q: "How do I split a PDF?", a: "Upload the PDF, then click the ✂ between any two pages to set a cut point. You can add as many cuts as you like, or use 'Split every N pages' to place them automatically. When you hit Split & download, each segment is saved as its own PDF, all packed into a single ZIP." },
        { q: "How do I know what ends up in each file?", a: "Before you download, the pages are colour-tinted and badged 'File 1', 'File 2', and so on, and a live count tells you exactly how many files will be created — so there are no surprises." },
        { q: "Is my file uploaded anywhere?", a: "No. The whole split runs locally in your browser — the PDF is read, cut, and zipped on your device and never gets sent to a server. Nothing leaves your machine." },
        { q: "Is there a file-size or page limit?", a: "There's no fixed cap. Because everything runs in your browser, the practical limit is your device's memory — very large or high-page-count PDFs take longer to render and may strain an older phone or laptop." },
        { q: "What do I actually get back, and is it free?", a: "You get a ZIP containing one PDF per segment (named like document-part-1.pdf, document-part-2.pdf). Even if you only set one cut, the output still comes as a ZIP. It's completely free, with no sign-up or watermark. Note: password-protected PDFs need to be unlocked first." },
      ],
      zh: [
        { q: "如何拆分 PDF？", a: "上传 PDF，在任意两页之间点 ✂ 设置一个切分点。你想设几个就设几个，也可以用「每 N 页拆一份」让它自动放置切分点。点「拆分并下载」后，每一段都会保存为单独的 PDF，并打包成一个 ZIP。" },
        { q: "怎么看清每个文件包含哪些页？", a: "下载前，页面会按所属文件用颜色标注，并标上「文件1」「文件2」等，同时实时显示将生成几个文件——一目了然，不会出错。" },
        { q: "文件会被上传吗？", a: "不会。整个拆分都在你的浏览器本地完成——PDF 在你的设备上读取、切分、打包，全程不发送到任何服务器，文件不会离开你的设备。" },
        { q: "有文件大小或页数限制吗？", a: "没有固定上限。因为全部在浏览器里处理，实际限制取决于你设备的内存——页数很多或体积很大的 PDF 渲染会更慢，老旧的手机或笔记本可能比较吃力。" },
        { q: "拆分后得到什么？免费吗？", a: "你会得到一个 ZIP，里面每一段是一个 PDF（命名类似 document-part-1.pdf、document-part-2.pdf）。即使只设了一个切分点，输出也仍是 ZIP。完全免费，无需注册、不加水印。注意：带密码的 PDF 需要先解锁。" },
      ],
      es: [
        { q: "¿Cómo divido un PDF?", a: "Sube el PDF y luego haz clic en las ✂ entre dos páginas cualesquiera para fijar un punto de corte. Puedes añadir tantos cortes como quieras, o usar «Dividir cada N páginas» para colocarlos automáticamente. Cuando pulses «Dividir y descargar», cada segmento se guarda como su propio PDF, todos empaquetados en un único ZIP." },
        { q: "¿Cómo sé qué acaba en cada archivo?", a: "Antes de descargar, las páginas se tintan con color y se etiquetan «Archivo 1», «Archivo 2», y así sucesivamente, y un recuento en vivo te dice exactamente cuántos archivos se crearán, de modo que no hay sorpresas." },
        { q: "¿Mi archivo se sube a algún sitio?", a: "No. Toda la división se ejecuta localmente en tu navegador: el PDF se lee, se corta y se comprime en tu dispositivo y nunca se envía a un servidor. Nada sale de tu equipo." },
        { q: "¿Hay un límite de tamaño de archivo o de páginas?", a: "No hay un tope fijo. Como todo se ejecuta en tu navegador, el límite práctico es la memoria de tu dispositivo: los PDF muy grandes o con muchas páginas tardan más en renderizarse y pueden exigir mucho a un teléfono o una laptop antigua." },
        { q: "¿Qué recibo exactamente de vuelta y es gratis?", a: "Recibes un ZIP que contiene un PDF por segmento (nombrados como document-part-1.pdf, document-part-2.pdf). Aunque solo fijes un corte, la salida sigue siendo un ZIP. Es completamente gratis, sin registro ni marca de agua. Nota: los PDF protegidos con contraseña deben desbloquearse primero." },
      ],
    },
  },
  "crop-pdf": {
    title: { en: "Crop PDF — FAQ", zh: "裁剪 PDF 常见问题", es: "Recortar PDF — preguntas frecuentes" },
    items: {
      en: [
        { q: "How do I crop a PDF?", a: "Upload your PDF, then drag the top, right, bottom and left sliders to trim each edge. You'll see a live preview as you go, so just adjust until it looks right and click Crop & download." },
        { q: "Does it crop every page the same way?", a: "Yes. The margins you set are applied uniformly to every page, so the whole document stays consistent. There's no per-page cropping in this tool." },
        { q: "Is the cropped-out content actually deleted?", a: "No. Cropping changes the visible area (the crop box) — the trimmed parts are hidden, not erased. That means nothing is truly lost, but it also means someone could recover it. If you need the content gone for good, use a redaction tool instead." },
        { q: "Is my file uploaded anywhere?", a: "No. Everything runs locally in your browser — your PDF never leaves your device and nothing is sent to a server." },
        { q: "Is there a file size limit?", a: "There's no fixed limit. Because it all happens in your browser, the practical ceiling depends on your device's memory — very large files may get slow or run out of memory on weaker machines." },
        { q: "Is it free? Do I need an account?", a: "It's completely free and there's no sign-up required. Just open the page and start cropping." },
      ],
      zh: [
        { q: "如何裁剪 PDF？", a: "上传 PDF，然后拖动上、右、下、左四个滑块裁掉每一边。拖的时候能看到实时预览，调到满意了点「裁剪并下载」就行。" },
        { q: "是每一页都按同样的方式裁吗？", a: "是的。你设的边距会统一应用到每一页，整份文档保持一致。这个工具不支持单页单独裁剪。" },
        { q: "被裁掉的内容是真的删掉了吗？", a: "不是。裁剪改的是可见区域（裁剪框），被裁的部分是隐藏起来，并没有抹掉。所以内容不会真正丢失，但也意味着别人有可能恢复出来。如果想彻底去掉内容，请改用脱敏（涂黑）工具。" },
        { q: "文件会被上传到什么地方吗？", a: "不会。全部在你的浏览器里本地处理——PDF 不会离开你的设备，也不会发送到任何服务器。" },
        { q: "有文件大小限制吗？", a: "没有固定上限。因为都在浏览器里完成，实际能处理多大取决于你设备的内存——文件特别大时，配置较弱的机器可能会变慢或内存不足。" },
        { q: "免费吗？需要注册吗？", a: "完全免费，也不用注册。打开页面就能直接裁。" },
      ],
      es: [
        { q: "¿Cómo recorto un PDF?", a: "Sube tu PDF y luego arrastra los controles deslizantes superior, derecho, inferior e izquierdo para recortar cada borde. Verás una vista previa en vivo a medida que avanzas, así que ajusta hasta que se vea bien y haz clic en «Recortar y descargar»." },
        { q: "¿Recorta todas las páginas de la misma manera?", a: "Sí. Los márgenes que estableces se aplican de forma uniforme a todas las páginas, de modo que todo el documento se mantiene coherente. Esta herramienta no permite recortar página por página." },
        { q: "¿El contenido recortado se elimina realmente?", a: "No. Recortar cambia el área visible (el cuadro de recorte): las partes recortadas quedan ocultas, no borradas. Eso significa que nada se pierde de verdad, pero también que alguien podría recuperarlo. Si necesitas que el contenido desaparezca para siempre, usa una herramienta de censura (redacción) en su lugar." },
        { q: "¿Mi archivo se sube a algún sitio?", a: "No. Todo se ejecuta localmente en tu navegador: tu PDF jamás sale de tu dispositivo y nada se envía a un servidor." },
        { q: "¿Hay un límite de tamaño de archivo?", a: "No hay un límite fijo. Como todo ocurre en tu navegador, el techo práctico depende de la memoria de tu dispositivo: los archivos muy grandes pueden volverse lentos o quedarse sin memoria en máquinas poco potentes." },
        { q: "¿Es gratis? ¿Necesito una cuenta?", a: "Es completamente gratis y no se necesita registro. Solo abre la página y empieza a recortar." },
      ],
    },
  },
  "sign-pdf": {
    title: { en: "Sign PDF — FAQ", zh: "PDF 签名常见问题", es: "Firmar PDF — preguntas frecuentes" },
    items: {
      en: [
        { q: "How do I sign a PDF?", a: "Upload your PDF, draw or type your signature, choose the page, position and size, then click Sign & download. You get a new file named …-signed.pdf." },
        { q: "Is my file uploaded anywhere?", a: "No. The whole thing runs in your browser — the page is rendered and your signature is stamped onto the PDF locally. Your file never leaves your device and nothing is sent to a server." },
        { q: "Can I draw my signature, or do I have to type it?", a: "Either works. Draw with your mouse or finger on the pad, or switch to Type to render your name in a script font. Hit Clear to redo a drawn signature." },
        { q: "Is there a file size limit, and does it cost anything?", a: "It's free with no sign-up. There's no fixed size cap, but because everything is processed in memory, very large PDFs depend on your device's RAM — a huge file may be slow on an older phone or laptop." },
        { q: "Where does the signature actually go, and any gotchas?", a: "It's placed by one of nine anchor positions (corners, edges, center) and scaled by the size slider — you can't drag it to an exact pixel. It's stamped on one page at a time, so repeat for each page you need to sign. Encrypted/password-protected PDFs need to be unlocked first." },
        { q: "Does this count as a legal e-signature?", a: "The signature is stamped onto the page as an image, not a certificate-based digital signature. Typed and drawn e-signatures are accepted for many everyday documents, but check the specific requirements for your use case." },
      ],
      zh: [
        { q: "如何给 PDF 签名？", a: "上传 PDF，手写或打字你的签名，选择页面、位置和大小，然后点「签名并下载」。会得到一个名为「…-signed.pdf」的新文件。" },
        { q: "文件会被上传吗？", a: "不会。整个过程都在你的浏览器中完成——页面在本地渲染，签名也在本地盖到 PDF 上。文件不会离开你的设备，不会发送到任何服务器。" },
        { q: "可以手写签名吗，还是只能打字？", a: "两种都行。用鼠标或手指在画板上手写，或切换到「打字」用签名字体写你的名字。手写错了点「清除」重来即可。" },
        { q: "有大小限制吗？要收费吗？", a: "免费、无需注册。没有固定的大小上限，但因为全程在内存中处理，超大的 PDF 受设备内存影响——文件很大时，在较旧的手机或电脑上可能会变慢。" },
        { q: "签名放在哪里？有哪些容易踩的坑？", a: "签名按九个固定锚点（四角、四边、居中）摆放，用大小滑块缩放——不能拖到精确的像素位置。一次只盖在一页上，需要签多页就逐页重复。加密/有密码的 PDF 需要先解锁。" },
        { q: "这算有法律效力的电子签名吗？", a: "签名是作为图片盖到页面上的，不是基于证书的数字签名。打字和手写电子签名在许多日常文档中被接受，具体用途请核对相关要求。" },
      ],
      es: [
        { q: "¿Cómo firmo un PDF?", a: "Sube tu PDF, dibuja o escribe tu firma, elige la página, la posición y el tamaño, y luego haz clic en «Firmar y descargar». Obtienes un archivo nuevo llamado …-signed.pdf." },
        { q: "¿Mi archivo se sube a algún sitio?", a: "No. Todo el proceso se ejecuta en tu navegador: la página se renderiza y tu firma se estampa en el PDF localmente. Tu archivo jamás sale de tu dispositivo y nada se envía a un servidor." },
        { q: "¿Puedo dibujar mi firma o tengo que escribirla?", a: "Cualquiera de las dos opciones funciona. Dibuja con el mouse o el dedo en el panel, o cambia a «Escribir» para representar tu nombre con una fuente caligráfica. Pulsa «Borrar» para rehacer una firma dibujada." },
        { q: "¿Hay un límite de tamaño de archivo y cuesta algo?", a: "Es gratis y sin registro. No hay un tope de tamaño fijo, pero como todo se procesa en memoria, los PDF muy grandes dependen de la RAM de tu dispositivo: un archivo enorme puede ir lento en un teléfono o una laptop antigua." },
        { q: "¿Dónde va exactamente la firma y hay algún detalle a tener en cuenta?", a: "Se coloca en una de nueve posiciones de anclaje (esquinas, bordes, centro) y se escala con el control deslizante de tamaño; no puedes arrastrarla a un píxel exacto. Se estampa en una página a la vez, así que repite el proceso por cada página que necesites firmar. Los PDF cifrados o protegidos con contraseña deben desbloquearse primero." },
        { q: "¿Cuenta esto como una firma electrónica legal?", a: "La firma se estampa en la página como una imagen, no como una firma digital basada en certificado. Las firmas electrónicas escritas y dibujadas se aceptan en muchos documentos cotidianos, pero comprueba los requisitos concretos de tu caso de uso." },
      ],
    },
  },
  "reorder-pages": {
    title: { en: "Reorder PDF pages — FAQ", zh: "PDF 页面排序常见问题", es: "Reordenar páginas de PDF — preguntas frecuentes" },
    items: {
      en: [
        { q: "How do I reorder pages in a PDF?", a: "Upload your PDF, then drag the page thumbnails into the order you want and click Apply & download. No typing page numbers — you arrange them visually." },
        { q: "Can I delete pages while I'm at it?", a: "Yes. Click the ✕ on any thumbnail to drop that page, then download. Reordering and removing pages happen in the same step." },
        { q: "Is my file uploaded anywhere?", a: "No. Everything runs locally in your browser — your PDF is never uploaded and never leaves your device." },
        { q: "Is there a file size or page limit?", a: "There's no fixed limit. Very large PDFs just depend on your device's memory, since all the work happens on your machine." },
        { q: "Will reordering lower the quality?", a: "No. Pages keep their original content and resolution — only the order changes, nothing is re-rendered or compressed." },
        { q: "Is it free? Do I need an account?", a: "It's completely free with no sign-up required." },
      ],
      zh: [
        { q: "如何给 PDF 页面排序？", a: "上传 PDF，把页面缩略图拖成你想要的顺序，然后点「应用并下载」。不用输入页码，直接拖着排。" },
        { q: "排序的同时能删除页面吗？", a: "能。点缩略图上的 ✕ 就能去掉那一页，再下载即可。排序和删除在同一步完成。" },
        { q: "文件会被上传吗？", a: "不会。全部在你的浏览器本地处理，PDF 不上传、也不会离开你的设备。" },
        { q: "有文件大小或页数限制吗？", a: "没有固定上限。因为全部在本机处理，超大的 PDF 主要受你设备内存影响。" },
        { q: "排序会降低画质吗？", a: "不会。页面内容和分辨率保持原样，只改变顺序，不会重新渲染或压缩。" },
        { q: "免费吗？需要注册吗？", a: "完全免费，也无需注册。" },
      ],
      es: [
        { q: "¿Cómo reordeno las páginas de un PDF?", a: "Sube tu PDF, luego arrastra las miniaturas de las páginas al orden que quieras y haz clic en «Aplicar y descargar». No hay que escribir números de página: las organizas visualmente." },
        { q: "¿Puedo eliminar páginas mientras lo hago?", a: "Sí. Haz clic en la ✕ de cualquier miniatura para descartar esa página y luego descarga. Reordenar y eliminar páginas ocurren en el mismo paso." },
        { q: "¿Mi archivo se sube a algún sitio?", a: "No. Todo se ejecuta localmente en tu navegador: tu PDF jamás se sube ni sale de tu dispositivo." },
        { q: "¿Hay un límite de tamaño de archivo o de páginas?", a: "No hay un límite fijo. Los PDF muy grandes simplemente dependen de la memoria de tu dispositivo, ya que todo el trabajo ocurre en tu equipo." },
        { q: "¿Reordenar reducirá la calidad?", a: "No. Las páginas conservan su contenido y resolución originales; solo cambia el orden, nada se vuelve a renderizar ni se comprime." },
        { q: "¿Es gratis? ¿Necesito una cuenta?", a: "Es completamente gratis, sin registro necesario." },
      ],
    },
  },
  "delete-page": {
    title: { en: "Delete PDF pages — FAQ", zh: "删除 PDF 页面常见问题", es: "Eliminar páginas de PDF — preguntas frecuentes" },
    items: {
      en: [
        { q: "How do I delete pages from a PDF?", a: "Upload your PDF, click the pages you want to remove (they turn red with an ✕), then click Delete & download. A counter shows how many pages will be deleted and how many remain." },
        { q: "What if I mark the wrong page?", a: "Just click it again to keep it — the red mark and ✕ disappear. You can mark and unmark as many times as you like before downloading." },
        { q: "Is my file uploaded anywhere?", a: "No. The whole thing runs in your browser using your device's own memory — your PDF is never sent to a server and never leaves your device." },
        { q: "Is there a file size limit?", a: "There's no fixed cap. Since the work happens locally, the practical limit is your device's memory — very large or image-heavy PDFs may be slow on low-end machines." },
        { q: "What do I get back?", a: "A new PDF with the marked pages removed, downloaded as \"yourfile-pages-removed.pdf\". The rest of the pages keep their original content and order; your original file isn't changed. You must keep at least one page." },
        { q: "Is it free?", a: "Yes — completely free, with no sign-up or account needed." },
      ],
      zh: [
        { q: "怎么删除 PDF 里的页面？", a: "上传 PDF，点击要删除的页面（会标红并出现 ✕），然后点「删除并下载」。界面会实时显示将删除几页、还剩几页。" },
        { q: "点错页面了怎么办？", a: "再点一次就会保留，红色标记和 ✕ 会消失。下载前你可以反复标记和取消，想改多少次都行。" },
        { q: "文件会被上传吗？", a: "不会。整个过程都在你的浏览器里、用你设备自己的内存完成，PDF 不会发到服务器，也不会离开你的设备。" },
        { q: "有文件大小限制吗？", a: "没有固定上限。因为是在本地处理，实际上限取决于你设备的内存——超大或图片很多的 PDF 在配置较低的设备上可能会慢一些。" },
        { q: "删完会得到什么？", a: "一个删掉了所选页面的新 PDF，文件名为「原文件名-pages-removed.pdf」。其余页面内容和顺序保持不变，原文件也不会被改动。注意至少要保留一页。" },
        { q: "免费吗？", a: "免费——完全免费，无需注册或登录。" },
      ],
      es: [
        { q: "¿Cómo elimino páginas de un PDF?", a: "Sube tu PDF, haz clic en las páginas que quieras quitar (se ponen rojas con una ✕) y luego haz clic en «Eliminar y descargar». Un contador muestra cuántas páginas se eliminarán y cuántas quedan." },
        { q: "¿Y si marco la página equivocada?", a: "Solo haz clic de nuevo en ella para conservarla: la marca roja y la ✕ desaparecen. Puedes marcar y desmarcar tantas veces como quieras antes de descargar." },
        { q: "¿Mi archivo se sube a algún sitio?", a: "No. Todo el proceso se ejecuta en tu navegador usando la propia memoria de tu dispositivo: tu PDF jamás se envía a un servidor ni sale de tu dispositivo." },
        { q: "¿Hay un límite de tamaño de archivo?", a: "No hay un tope fijo. Como el trabajo ocurre localmente, el límite práctico es la memoria de tu dispositivo: los PDF muy grandes o con muchas imágenes pueden ir lentos en máquinas de gama baja." },
        { q: "¿Qué recibo de vuelta?", a: "Un PDF nuevo con las páginas marcadas eliminadas, descargado como «tuarchivo-pages-removed.pdf». El resto de las páginas conserva su contenido y orden originales; tu archivo original no se modifica. Debes conservar al menos una página." },
        { q: "¿Es gratis?", a: "Sí: completamente gratis, sin registro ni cuenta necesaria." },
      ],
    },
  },
  "rotate-page": {
    title: { en: "Rotate PDF pages — FAQ", zh: "旋转 PDF 页面常见问题", es: "Rotar páginas de PDF — preguntas frecuentes" },
    items: {
      en: [
        { q: "How do I rotate pages in a PDF?", a: "Upload the PDF and click a page to turn it 90° clockwise. Keep clicking the same page to rotate it 180°, 270°, and back. Or hit Rotate all 90° to spin every page at once, then download." },
        { q: "Can I rotate just one page, or different pages by different amounts?", a: "Yes. Each page rotates on its own, so you can fix a single sideways scan or set different pages to different angles — only the pages you click change." },
        { q: "Is my file uploaded anywhere?", a: "No. Everything runs locally in your browser — the rotation is written to the PDF on your device and the file never gets sent to a server or leaves your device." },
        { q: "Is there a file size or page limit?", a: "There's no fixed limit we impose. Since it all happens in your browser, the practical ceiling depends on your device's memory — very large PDFs may get slow on low-memory phones or tablets." },
        { q: "Does rotating lose quality or change the content?", a: "No. Rotation just sets each page's orientation flag — the text, images, and resolution stay exactly the same. Nothing is re-rendered or compressed." },
        { q: "Is it free? Do I need an account?", a: "It's completely free with no sign-up. Open the page, rotate, and download." },
      ],
      zh: [
        { q: "如何旋转 PDF 页面？", a: "上传 PDF，点击某页即可顺时针旋转 90°。继续点同一页会转到 180°、270°，再点转回原位。也可以点「全部旋转 90°」一次性旋转所有页面，然后下载。" },
        { q: "能只转某一页，或给不同页面设不同角度吗？", a: "可以。每页独立旋转，你可以单独纠正一张拍歪的扫描页，也可以给不同页面设不同角度——只有你点过的页面会变。" },
        { q: "文件会被上传吗？", a: "不会。全部在你的浏览器本地处理，旋转直接写进设备上的 PDF，文件不会上传到服务器，也不会离开你的设备。" },
        { q: "有文件大小或页数限制吗？", a: "我们没有设固定上限。因为全程在浏览器里完成，实际能处理多大取决于你设备的内存——内存较小的手机或平板处理超大 PDF 可能会变慢。" },
        { q: "旋转会降低质量或改变内容吗？", a: "不会。旋转只是设置每页的方向标记，文字、图片和分辨率完全不变，不会重新渲染或压缩。" },
        { q: "免费吗？需要注册吗？", a: "完全免费，无需注册。打开页面、旋转、下载即可。" },
      ],
      es: [
        { q: "¿Cómo roto páginas de un PDF?", a: "Sube el PDF y haz clic en una página para girarla 90° en sentido horario. Sigue haciendo clic en la misma página para rotarla 180°, 270° y de vuelta. O pulsa «Rotar todo 90°» para girar todas las páginas a la vez, y luego descarga." },
        { q: "¿Puedo rotar solo una página, o distintas páginas con distintos ángulos?", a: "Sí. Cada página se rota por su cuenta, así que puedes corregir un único escaneo de lado o ajustar distintas páginas a distintos ángulos: solo cambian las páginas en las que haces clic." },
        { q: "¿Mi archivo se sube a algún sitio?", a: "No. Todo se ejecuta localmente en tu navegador: la rotación se escribe en el PDF en tu dispositivo y el archivo jamás se envía a un servidor ni sale de tu dispositivo." },
        { q: "¿Hay un límite de tamaño de archivo o de páginas?", a: "No imponemos un límite fijo. Como todo ocurre en tu navegador, el techo práctico depende de la memoria de tu dispositivo: los PDF muy grandes pueden ir lentos en teléfonos o tabletas con poca memoria." },
        { q: "¿Rotar pierde calidad o cambia el contenido?", a: "No. La rotación solo ajusta el indicador de orientación de cada página; el texto, las imágenes y la resolución quedan exactamente igual. Nada se vuelve a renderizar ni se comprime." },
        { q: "¿Es gratis? ¿Necesito una cuenta?", a: "Es completamente gratis, sin registro. Abre la página, rota y descarga." },
      ],
    },
  },
  "add-page": {
    title: { en: "Insert pages into a PDF — FAQ", zh: "向 PDF 插入页面常见问题", es: "Insertar páginas en un PDF — preguntas frecuentes" },
    items: {
      en: [
        { q: "How do I insert pages into a PDF?", a: "Upload your PDF, click where you want to insert (at the very start or after a specific page), then choose the file to insert there and click Insert & download." },
        { q: "What can I insert?", a: "Another PDF (all of its pages are dropped in at that spot) or a single PNG/JPG image, which is added as one new page." },
        { q: "Is my file uploaded?", a: "No. Everything runs locally in your browser using pdf-lib — your files never leave your device, and nothing is sent to a server." },
        { q: "What do I get back?", a: "A single new PDF with the inserted pages in place, downloaded as \"<your-file>-with-insert.pdf\". Your original file isn't changed." },
        { q: "Is there a file size limit?", a: "There's no fixed limit, but since it all happens in your browser, very large PDFs depend on your device's memory. If a huge file struggles, try a smaller one." },
        { q: "Is it free?", a: "Yes — it's completely free, with no sign-up or account required." },
      ],
      zh: [
        { q: "如何向 PDF 插入页面？", a: "上传你的 PDF，点击想插入的位置（最前面或某一页之后），再选择要插入的文件，然后点「插入并下载」。" },
        { q: "可以插入什么？", a: "可以插入另一个 PDF（它的所有页面会一起插到该位置），或者一张 PNG/JPG 图片（作为一个新页面）。" },
        { q: "文件会被上传吗？", a: "不会。全部在你的浏览器本地用 pdf-lib 处理，文件不会离开你的设备，也不会发送到任何服务器。" },
        { q: "会得到什么结果？", a: "一个插入好页面的新 PDF，文件名为「<原文件名>-with-insert.pdf」，原文件不会被改动。" },
        { q: "有文件大小限制吗？", a: "没有固定上限，但因为全程在浏览器里完成，超大的 PDF 受你设备内存影响。如果文件太大处理吃力，可以换小一点的试试。" },
        { q: "是免费的吗？", a: "是，完全免费，无需注册或登录。" },
      ],
      es: [
        { q: "¿Cómo inserto páginas en un PDF?", a: "Sube tu PDF, haz clic donde quieras insertar (justo al principio o después de una página concreta), luego elige el archivo que insertar allí y haz clic en «Insertar y descargar»." },
        { q: "¿Qué puedo insertar?", a: "Otro PDF (todas sus páginas se colocan en ese punto) o una sola imagen PNG/JPG, que se añade como una nueva página." },
        { q: "¿Mi archivo se sube?", a: "No. Todo se ejecuta localmente en tu navegador usando pdf-lib: tus archivos jamás salen de tu dispositivo y nada se envía a un servidor." },
        { q: "¿Qué recibo de vuelta?", a: "Un único PDF nuevo con las páginas insertadas en su sitio, descargado como «<tu-archivo>-with-insert.pdf». Tu archivo original no se modifica." },
        { q: "¿Hay un límite de tamaño de archivo?", a: "No hay un límite fijo, pero como todo ocurre en tu navegador, los PDF muy grandes dependen de la memoria de tu dispositivo. Si un archivo enorme tiene dificultades, prueba con uno más pequeño." },
        { q: "¿Es gratis?", a: "Sí: es completamente gratis, sin registro ni cuenta necesaria." },
      ],
    },
  },
  "watermark-pdf": {
    title: { en: "Add a watermark to a PDF — FAQ", zh: "PDF 加水印常见问题", es: "Añadir una marca de agua a un PDF — preguntas frecuentes" },
    items: {
      en: [
        { q: "How do I add a watermark to a PDF?", a: "Upload the PDF, build a text or image watermark, and adjust its position, opacity and rotation while you watch the live preview. Choose which pages to stamp, then click Apply & download." },
        { q: "Can I use an image or logo instead of text?", a: "Yes. Switch to Image mode to drop in a logo or picture as the watermark. Either way you can set the position, opacity and rotation." },
        { q: "Does it stamp every page?", a: "You decide. The watermark goes onto the pages you select, so you can mark the whole document or just specific pages." },
        { q: "Are my files uploaded anywhere?", a: "No. The watermark is applied right in your browser — your PDF never leaves your device and nothing is sent to a server." },
        { q: "Is there a file size limit?", a: "There's no fixed cap. Since everything runs locally, very large PDFs are limited only by your device's memory — on most machines that's plenty." },
        { q: "Is it free? Do I need an account?", a: "It's free and there's no sign-up. Just open the page, add your PDF, and download the watermarked file." },
      ],
      zh: [
        { q: "如何给 PDF 加水印？", a: "上传 PDF，制作文字或图片水印，一边看实时预览一边调整位置、透明度和旋转角度。选好要盖的页面，然后点「应用并下载」。" },
        { q: "可以用图片或 Logo 代替文字吗？", a: "可以。切换到「图片」模式即可把 Logo 或图片作为水印。两种模式都能设置位置、透明度和旋转。" },
        { q: "会盖到每一页吗？", a: "由你决定。水印只盖到你选中的页面，可以盖整个文档，也可以只盖指定页面。" },
        { q: "文件会被上传吗？", a: "不会。水印完全在你的浏览器本地应用，PDF 不会离开你的设备，也不会发送到任何服务器。" },
        { q: "有文件大小限制吗？", a: "没有固定上限。因为全部在本地处理，超大 PDF 只受设备内存影响——一般电脑都够用。" },
        { q: "免费吗？需要注册吗？", a: "免费，且无需注册。打开页面、添加 PDF、下载带水印的文件即可。" },
      ],
      es: [
        { q: "¿Cómo añado una marca de agua a un PDF?", a: "Sube el PDF, crea una marca de agua de texto o de imagen y ajusta su posición, opacidad y rotación mientras observas la vista previa en vivo. Elige qué páginas sellar y luego haz clic en «Aplicar y descargar»." },
        { q: "¿Puedo usar una imagen o un logotipo en lugar de texto?", a: "Sí. Cambia al modo «Imagen» para colocar un logotipo o una imagen como marca de agua. En cualquier caso, puedes ajustar la posición, la opacidad y la rotación." },
        { q: "¿La estampa en todas las páginas?", a: "Tú decides. La marca de agua va en las páginas que selecciones, así que puedes marcar todo el documento o solo páginas concretas." },
        { q: "¿Mis archivos se suben a algún sitio?", a: "No. La marca de agua se aplica directamente en tu navegador: tu PDF jamás sale de tu dispositivo y nada se envía a un servidor." },
        { q: "¿Hay un límite de tamaño de archivo?", a: "No hay un tope fijo. Como todo se ejecuta localmente, los PDF muy grandes solo están limitados por la memoria de tu dispositivo, que en la mayoría de las máquinas es de sobra." },
        { q: "¿Es gratis? ¿Necesito una cuenta?", a: "Es gratis y sin registro. Solo abre la página, añade tu PDF y descarga el archivo con marca de agua." },
      ],
    },
  },
  "page-numbers": {
    title: { en: "Add page numbers to a PDF — FAQ", zh: "PDF 添加页码 常见问题", es: "Añadir números de página a un PDF — preguntas frecuentes" },
    items: {
      en: [
        { q: "How do I add page numbers to a PDF?", a: "Upload your PDF, pick where the number goes (top or bottom, left/center/right), choose the format and start number, and set the page range. The live preview shows exactly how it looks, then click Add numbers & download." },
        { q: "Is my file uploaded anywhere?", a: "No. Everything runs locally in your browser — the PDF is read, numbered, and saved on your device. Your file is never uploaded and never leaves your computer." },
        { q: "What formats and positions can I use?", a: "Four formats: just the number (1), Page 1, 1 / N, or 1 of N. Six positions: top or bottom, paired with left, center, or right. You can also set a small/medium/large margin." },
        { q: "Can I start from a specific number or only number some pages?", a: "Yes. Set Start at for the first number (handy if your cover page shouldn't count), and use the from/to range to number only part of the document. The count continues across the range you pick." },
        { q: "Is there a file size limit?", a: "There's no fixed cap. Since the work happens in your browser, very large PDFs are limited only by your device's memory — on most machines typical documents go through fine." },
        { q: "Is it free? Do I need an account?", a: "Yes, it's completely free and no sign-up is required. Just open the page and start." },
      ],
      zh: [
        { q: "怎么给 PDF 添加页码？", a: "上传 PDF，选择页码位置(上或下，左/中/右)，挑好格式和起始数字，再设置页码范围。实时预览会显示最终效果，确认后点「添加页码并下载」即可。" },
        { q: "文件会被上传吗？", a: "不会。整个过程都在你的浏览器本地完成——PDF 在本地读取、加页码、保存，文件不会上传，也不会离开你的设备。" },
        { q: "支持哪些格式和位置？", a: "四种格式：纯数字(1)、第 1 页、1 / N、1 / 共 N。六个位置：上或下，分别配合左、中、右。还可以选小/中/大三种边距。" },
        { q: "可以从指定数字开始，或只给部分页加页码吗？", a: "可以。用「起始数字」设置第一个号码(封面不想计入时很方便)，用「从/到」只给文档的一部分加页码，号码会在你选的范围内连续编号。" },
        { q: "有文件大小限制吗？", a: "没有固定上限。因为处理是在浏览器里完成的，超大 PDF 只受设备内存影响——一般文档在大多数电脑上都能顺利处理。" },
        { q: "免费吗？需要注册吗？", a: "完全免费，也不需要注册。打开页面直接用就行。" },
      ],
      es: [
        { q: "¿Cómo añado números de página a un PDF?", a: "Sube tu PDF, elige dónde va el número (arriba o abajo, izquierda/centro/derecha), escoge el formato y el número inicial, y establece el rango de páginas. La vista previa en vivo muestra exactamente cómo queda; luego haz clic en «Añadir números y descargar»." },
        { q: "¿Mi archivo se sube a algún sitio?", a: "No. Todo se ejecuta localmente en tu navegador: el PDF se lee, se numera y se guarda en tu dispositivo. Tu archivo jamás se sube ni sale de tu equipo." },
        { q: "¿Qué formatos y posiciones puedo usar?", a: "Cuatro formatos: solo el número (1), Página 1, 1 / N, o 1 de N. Seis posiciones: arriba o abajo, combinadas con izquierda, centro o derecha. También puedes establecer un margen pequeño, mediano o grande." },
        { q: "¿Puedo empezar desde un número concreto o numerar solo algunas páginas?", a: "Sí. Usa «Empezar en» para el primer número (útil si tu portada no debe contar) y usa el rango desde/hasta para numerar solo una parte del documento. El recuento continúa a lo largo del rango que elijas." },
        { q: "¿Hay un límite de tamaño de archivo?", a: "No hay un tope fijo. Como el trabajo ocurre en tu navegador, los PDF muy grandes solo están limitados por la memoria de tu dispositivo; en la mayoría de las máquinas los documentos típicos pasan sin problema." },
        { q: "¿Es gratis? ¿Necesito una cuenta?", a: "Sí, es completamente gratis y no se necesita registro. Solo abre la página y empieza." },
      ],
    },
  },
  "images-to-pdf": {
    title: { en: "Images to PDF — FAQ", zh: "图片转 PDF 常见问题", es: "Imágenes a PDF — preguntas frecuentes" },
    items: {
      en: [
        { q: "How do I convert images to a PDF?", a: "Add your images, drag the thumbnails into the order you want, then click Convert to PDF. Each image becomes one page, top to bottom, in a single file you can download." },
        { q: "Which image formats are supported?", a: "JPG, PNG, WebP, GIF and BMP. HEIC (the format iPhones often save photos in) isn't supported yet — convert those to JPG first, or change your iPhone camera setting to 'Most Compatible'." },
        { q: "Can I combine many images into one PDF?", a: "Yes. Add as many as you like and drag them to reorder — they're merged into a single PDF in exactly that order, one image per page." },
        { q: "Are my images uploaded anywhere?", a: "No. Everything runs locally in your browser — the PDF is built on your device and your images are never sent to a server or stored anywhere." },
        { q: "Is there a size or file-count limit?", a: "There's no fixed limit. Since it all happens on your device, the practical ceiling is your device's memory — very large or very many high-resolution images can slow an older phone or low-RAM laptop." },
        { q: "Is it free? Do I need an account?", a: "Yes, it's completely free with no sign-up, no watermark and no email required. Just open the page and start." },
      ],
      zh: [
        { q: "如何把图片转成 PDF？", a: "添加图片，把缩略图拖成你想要的顺序，然后点「转换为 PDF」。每张图片占一页，从上到下排列，合成一个可下载的文件。" },
        { q: "支持哪些图片格式？", a: "JPG、PNG、WebP、GIF、BMP。HEIC（iPhone 常用的照片格式）暂不支持——可先转成 JPG，或把 iPhone 相机设置改为「兼容性最佳」。" },
        { q: "可以把多张图片合成一个 PDF 吗？", a: "可以。想加多少加多少，拖动即可排序——会严格按这个顺序合并成一个 PDF，每张图片一页。" },
        { q: "图片会被上传吗？", a: "不会。全部在你的浏览器本地处理——PDF 在你的设备上生成，图片不会上传到服务器，也不会被保存在任何地方。" },
        { q: "有大小或数量限制吗？", a: "没有固定上限。因为全程在本地处理，实际上限取决于设备内存——图片过大或数量过多时，旧手机或内存较小的电脑可能会变慢。" },
        { q: "免费吗？需要注册吗？", a: "完全免费，无需注册，没有水印，也不用填邮箱。打开页面即可使用。" },
      ],
      es: [
        { q: "¿Cómo convierto imágenes en un PDF?", a: "Añade tus imágenes, arrastra las miniaturas al orden que quieras y luego haz clic en «Convertir a PDF». Cada imagen se convierte en una página, de arriba abajo, en un único archivo que puedes descargar." },
        { q: "¿Qué formatos de imagen son compatibles?", a: "JPG, PNG, WebP, GIF y BMP. HEIC (el formato en el que los iPhone suelen guardar las fotos) aún no es compatible: convierte esas a JPG primero, o cambia el ajuste de la cámara de tu iPhone a «Más compatible»." },
        { q: "¿Puedo combinar muchas imágenes en un solo PDF?", a: "Sí. Añade tantas como quieras y arrástralas para reordenarlas: se combinan en un único PDF exactamente en ese orden, una imagen por página." },
        { q: "¿Mis imágenes se suben a algún sitio?", a: "No. Todo se ejecuta localmente en tu navegador: el PDF se genera en tu dispositivo y tus imágenes jamás se envían a un servidor ni se almacenan en ningún sitio." },
        { q: "¿Hay un límite de tamaño o de cantidad de archivos?", a: "No hay un límite fijo. Como todo ocurre en tu dispositivo, el techo práctico es la memoria de tu dispositivo: imágenes de alta resolución muy grandes o muy numerosas pueden ralentizar un teléfono antiguo o una laptop con poca RAM." },
        { q: "¿Es gratis? ¿Necesito una cuenta?", a: "Sí, es completamente gratis, sin registro, sin marca de agua y sin necesidad de correo electrónico. Solo abre la página y empieza." },
      ],
    },
  },
  "pdf-to-png": {
    title: { en: "PDF to PNG — FAQ", zh: "PDF 转 PNG 常见问题", es: "PDF a PNG — preguntas frecuentes" },
    items: {
      en: [
        { q: "How do I convert a PDF to PNG?", a: "Drop in a PDF and every page shows up as a thumbnail. Click pages to include or exclude them (or use Select all / Select none), make sure PNG is selected, then Convert & download. A single page comes down as one PNG; multiple pages are bundled into a ZIP." },
        { q: "Is my PDF uploaded anywhere?", a: "No. The whole thing runs in your browser — the PDF is read and rendered to PNG locally and the download is generated on your device. Nothing is sent to a server, so your file never leaves your machine." },
        { q: "Why choose PNG instead of JPG?", a: "PNG is lossless, so it keeps text, line art, diagrams and screenshots razor-sharp with no compression artifacts, and it supports transparency. JPG files are smaller and fine for photos, but they soften fine detail and can't be transparent." },
        { q: "Is there a file size or page limit?", a: "There's no fixed cap and no sign-up. Because everything is processed in your browser, the real limit is your device's memory — very large or very high-page-count PDFs use more RAM and take longer, especially on phones or older machines." },
        { q: "It won't open my PDF — what's wrong?", a: "The most common cause is a password-protected or encrypted PDF, which the tool can't read; remove the password first and try again. Output is rendered at 2x for crisp images, but it's still a picture — the text becomes pixels, so you can't select or search it afterwards." },
        { q: "Is PDF to PNG free?", a: "Yes — completely free, no account, no watermark, no limit on how many times you use it." },
      ],
      zh: [
        { q: "如何把 PDF 转成 PNG？", a: "把 PDF 拖进来，每一页都会显示为缩略图。点击页面来选中或排除（也可用「全选 / 全不选」），确认已选择 PNG，然后点「转换并下载」。单页直接下载成一张 PNG，多页会打包成 ZIP。" },
        { q: "我的 PDF 会被上传吗？", a: "不会。整个过程都在你的浏览器里完成——PDF 在本地读取并渲染成 PNG，下载文件也在你的设备上生成，不会发送到任何服务器，文件始终不离开你的设备。" },
        { q: "为什么选 PNG 而不是 JPG？", a: "PNG 是无损的，能让文字、线条图、图表和截图保持极致清晰、没有压缩噪点，而且支持透明。JPG 体积更小、适合照片，但会让细节变模糊，且不支持透明。" },
        { q: "有文件大小或页数限制吗？", a: "没有固定上限，也无需注册。因为全部在浏览器里处理，真正的限制是你设备的内存——页数很多或很大的 PDF 会占用更多内存、处理更慢，手机或老旧电脑上尤其明显。" },
        { q: "打不开我的 PDF，是怎么回事？", a: "最常见的原因是 PDF 加了密码或被加密，工具无法读取，请先去掉密码再试。输出按 2 倍分辨率渲染，画质清晰，但毕竟是图片——文字变成了像素，转换后无法再选中或搜索文字。" },
        { q: "PDF 转 PNG 是免费的吗？", a: "是的——完全免费，无需账号，没有水印，使用次数也没有限制。" },
      ],
      es: [
        { q: "¿Cómo convierto un PDF a PNG?", a: "Suelta un PDF y cada página aparece como una miniatura. Haz clic en las páginas para incluirlas o excluirlas (o usa «Seleccionar todo» / «No seleccionar ninguna»), asegúrate de tener PNG seleccionado y luego «Convertir y descargar». Una sola página se descarga como un PNG; varias páginas se agrupan en un ZIP." },
        { q: "¿Mi PDF se sube a algún sitio?", a: "No. Todo el proceso se ejecuta en tu navegador: el PDF se lee y se renderiza en PNG localmente, y la descarga se genera en tu dispositivo. Nada se envía a un servidor, así que tu archivo jamás sale de tu equipo." },
        { q: "¿Por qué elegir PNG en lugar de JPG?", a: "PNG no tiene pérdidas, así que mantiene el texto, los dibujos lineales, los diagramas y las capturas de pantalla nítidos y sin artefactos de compresión, y admite transparencia. Los archivos JPG son más pequeños y van bien para fotos, pero suavizan los detalles finos y no pueden ser transparentes." },
        { q: "¿Hay un límite de tamaño de archivo o de páginas?", a: "No hay un tope fijo ni registro. Como todo se procesa en tu navegador, el límite real es la memoria de tu dispositivo: los PDF muy grandes o con muchísimas páginas usan más RAM y tardan más, sobre todo en teléfonos o máquinas antiguas." },
        { q: "No abre mi PDF, ¿qué pasa?", a: "La causa más común es un PDF protegido con contraseña o cifrado, que la herramienta no puede leer; quita primero la contraseña e inténtalo de nuevo. La salida se renderiza a 2× para imágenes nítidas, pero sigue siendo una imagen: el texto se convierte en píxeles, así que después no podrás seleccionarlo ni buscarlo." },
        { q: "¿Es gratis PDF a PNG?", a: "Sí: completamente gratis, sin cuenta, sin marca de agua y sin límite en cuántas veces lo uses." },
      ],
    },
  },
  "pdf-to-image": {
    title: { en: "PDF to Image — FAQ", zh: "PDF 转图片常见问题", es: "PDF a imagen — preguntas frecuentes" },
    items: {
      en: [
        { q: "How do I convert a PDF to JPG or PNG?", a: "Drop in a PDF and every page shows up as a thumbnail. Click pages to include or exclude them (or use Select all / Select none), pick JPG or PNG, then Convert & download. A single page comes down as one image; multiple pages are bundled into a ZIP." },
        { q: "Is my PDF uploaded anywhere?", a: "No. The whole thing runs in your browser — the PDF is read and rendered to images locally and the download is generated on your device. Nothing is sent to a server, so your file never leaves your machine." },
        { q: "JPG or PNG — which should I pick?", a: "PNG is lossless, so it's best for sharp text, line art and screenshots. JPG files are smaller and fine for photos and scans. One thing to know: JPG can't be transparent, so transparent areas of a page are flattened onto a white background." },
        { q: "Is there a file size or page limit?", a: "There's no fixed cap and no sign-up. Because everything is processed in your browser, the real limit is your device's memory — very large or very high-page-count PDFs use more RAM and take longer, especially on phones or older machines." },
        { q: "It won't open my PDF — what's wrong?", a: "The most common cause is a password-protected or encrypted PDF, which the tool can't read; remove the password first and try again. Output is rendered at 2x for crisp images, but it's still a picture — the text becomes pixels, so you can't select or search it afterwards." },
        { q: "Is it free?", a: "Yes — completely free, no account, no watermark, no limit on how many times you use it." },
      ],
      zh: [
        { q: "如何把 PDF 转成 JPG 或 PNG？", a: "把 PDF 拖进来，每一页都会显示为缩略图。点击页面来选中或排除（也可用「全选 / 全不选」），选 JPG 或 PNG，然后点「转换并下载」。单页直接下载成一张图片，多页会打包成 ZIP。" },
        { q: "我的 PDF 会被上传吗？", a: "不会。整个过程都在你的浏览器里完成——PDF 在本地读取并渲染成图片，下载文件也在你的设备上生成，不会发送到任何服务器，文件始终不离开你的设备。" },
        { q: "JPG 还是 PNG，该选哪个？", a: "PNG 是无损的，适合清晰的文字、线条图和截图；JPG 体积更小，适合照片和扫描件。有一点要注意：JPG 不支持透明，页面里透明的部分会被填成白色背景。" },
        { q: "有文件大小或页数限制吗？", a: "没有固定上限，也无需注册。因为全部在浏览器里处理，真正的限制是你设备的内存——页数很多或很大的 PDF 会占用更多内存、处理更慢，手机或老旧电脑上尤其明显。" },
        { q: "打不开我的 PDF，是怎么回事？", a: "最常见的原因是 PDF 加了密码或被加密，工具无法读取，请先去掉密码再试。输出按 2 倍分辨率渲染，画质清晰，但毕竟是图片——文字变成了像素，转换后无法再选中或搜索文字。" },
        { q: "是免费的吗？", a: "是的——完全免费，无需账号，没有水印，使用次数也没有限制。" },
      ],
      es: [
        { q: "¿Cómo convierto un PDF a JPG o PNG?", a: "Suelta un PDF y cada página aparece como una miniatura. Haz clic en las páginas para incluirlas o excluirlas (o usa «Seleccionar todo» / «No seleccionar ninguna»), elige JPG o PNG y luego «Convertir y descargar». Una sola página se descarga como una imagen; varias páginas se agrupan en un ZIP." },
        { q: "¿Mi PDF se sube a algún sitio?", a: "No. Todo el proceso se ejecuta en tu navegador: el PDF se lee y se renderiza en imágenes localmente, y la descarga se genera en tu dispositivo. Nada se envía a un servidor, así que tu archivo jamás sale de tu equipo." },
        { q: "JPG o PNG, ¿cuál debo elegir?", a: "PNG no tiene pérdidas, así que es ideal para texto nítido, dibujos lineales y capturas de pantalla. Los archivos JPG son más pequeños y van bien para fotos y escaneos. Algo que conviene saber: JPG no puede ser transparente, así que las zonas transparentes de una página se aplanan sobre un fondo blanco." },
        { q: "¿Hay un límite de tamaño de archivo o de páginas?", a: "No hay un tope fijo ni registro. Como todo se procesa en tu navegador, el límite real es la memoria de tu dispositivo: los PDF muy grandes o con muchísimas páginas usan más RAM y tardan más, sobre todo en teléfonos o máquinas antiguas." },
        { q: "No abre mi PDF, ¿qué pasa?", a: "La causa más común es un PDF protegido con contraseña o cifrado, que la herramienta no puede leer; quita primero la contraseña e inténtalo de nuevo. La salida se renderiza a 2× para imágenes nítidas, pero sigue siendo una imagen: el texto se convierte en píxeles, así que después no podrás seleccionarlo ni buscarlo." },
        { q: "¿Es gratis?", a: "Sí: completamente gratis, sin cuenta, sin marca de agua y sin límite en cuántas veces lo uses." },
      ],
    },
  },
  "redact-pdf": {
    title: { en: "Redact PDF — Frequently Asked Questions", zh: "PDF 智能涂黑 —— 常见问题", es: "Censurar PDF — preguntas frecuentes" },
    items: {
      en: [
        { q: "How do I redact a PDF?", a: "Drop your PDF onto the page and DockDocs renders every page right in your browser. Drag a box over anything you want to hide — a name, an account number, a signature. DockDocs also auto-scans for likely sensitive items (emails, phone numbers, SSNs, card numbers, IPs) and pre-marks them; review those suggestions and click the ✕ on any box you don't want. When you're done, hit Apply & download to get the redacted copy." },
        { q: "Is the text actually removed, or just covered with a black box?", a: "Actually removed. A lot of \"redaction\" just lays a black rectangle on top — the original text is still in the file and anyone can copy it out or delete the box. DockDocs re-renders each page as a flat image with the black areas burned in, so the underlying text is destroyed and gone for good. That's exactly what makes the result safe to share." },
        { q: "Are my files uploaded anywhere?", a: "No. The whole thing runs inside your browser on your own device — opening the PDF, drawing the boxes, and building the redacted copy all happen locally. Your file is never sent to a server and never leaves your computer, so it's a good fit for confidential or regulated documents." },
        { q: "Are there any limits, and is it free?", a: "It's completely free with no account, email, or install required. There's no fixed file-size cap, though very large PDFs depend on your device's memory. The one hard limit is page count: a document can have up to 30 pages — if yours is longer, split it first and redact each part." },
        { q: "What does the output file look like?", a: "You get a new PDF where every page is a flattened image (around 158 DPI — clean and readable). Because the pages are now images, the redacted content is permanently gone and the rest of the text is no longer selectable or searchable. That trade-off is the whole point: text you can't select is text that can't be recovered." },
        { q: "Should I trust the auto-detected boxes on their own?", a: "Treat them as a head start, not a guarantee. The auto-scan catches common patterns like emails and numbers, but it can miss things written in unusual formats and won't know about context-specific secrets only you can recognize. Always read through the pages yourself and drag boxes over anything the detector didn't flag before you download." },
      ],
      zh: [
        { q: "怎么用它给 PDF 涂黑？", a: "把 PDF 拖进来，DockDocs 会在你浏览器里把每一页渲染出来。想遮哪里就在哪里拖一个框——姓名、账号、签名都行。它还会自动扫描可能的敏感信息(邮箱、电话、SSN、卡号、IP)并预先标好，你复核一下，不想涂的点框上的 ✕ 去掉即可。弄好后点「应用并下载」，就能拿到涂黑后的副本。" },
        { q: "是真的把文字删掉了，还是只盖了个黑框？", a: "是真的删掉。很多所谓的「涂黑」只是在上面盖一个黑色方块，原文还留在文件里，别人能从底下复制出来，甚至把黑框删掉。DockDocs 会把每一页重新拍平成图片、把黑色区域直接烧进去，底层文字被彻底销毁、再也找不回来——这正是涂黑后能放心发出去的原因。" },
        { q: "我的文件会被上传吗？", a: "不会。整个过程都在你浏览器、你自己的设备上完成：打开 PDF、画框、生成涂黑副本，全是本地处理。文件不会发到任何服务器，也不会离开你的电脑，所以处理机密或受监管的文档也比较放心。" },
        { q: "有什么限制吗？要收费吗？", a: "完全免费，不用注册、不用留邮箱、不用安装。文件大小没有固定上限，但很大的 PDF 会受你设备内存影响。唯一的硬限制是页数：单份文档最多 30 页——超了就先拆开，分段涂黑。" },
        { q: "导出的文件是什么样的？", a: "你会得到一份新的 PDF，每页都是拍平后的图片(约 158 DPI，清晰可读)。因为页面已经变成图片，被涂黑的内容永久消失，其余文字也不再能选中或搜索。这个取舍正是关键：选不中的文字，才是无法被还原的文字。" },
        { q: "自动识别的框可以直接信吗？", a: "把它当成帮你打个底，而不是万无一失。自动扫描能抓住邮箱、号码这类常见格式，但格式不太规整的可能漏掉，而且它不懂只有你才认得的、跟上下文相关的敏感信息。下载前，务必自己把每页过一遍，把检测没标到的地方手动拖框涂掉。" },
      ],
      es: [
        { q: "¿Cómo censuro un PDF?", a: "Suelta tu PDF en la página y DockDocs renderiza cada página directamente en tu navegador. Arrastra un cuadro sobre cualquier cosa que quieras ocultar: un nombre, un número de cuenta, una firma. DockDocs también escanea automáticamente en busca de elementos probablemente sensibles (correos, números de teléfono, números de seguridad social, números de tarjeta, IP) y los premarca; revisa esas sugerencias y haz clic en la ✕ de cualquier cuadro que no quieras. Cuando termines, pulsa «Aplicar y descargar» para obtener la copia censurada." },
        { q: "¿El texto se elimina de verdad o solo se tapa con un recuadro negro?", a: "Se elimina de verdad. Muchas «censuras» solo colocan un rectángulo negro encima: el texto original sigue en el archivo y cualquiera puede copiarlo o borrar el recuadro. DockDocs vuelve a renderizar cada página como una imagen plana con las zonas negras incrustadas, de modo que el texto subyacente se destruye y desaparece para siempre. Eso es justo lo que hace que el resultado sea seguro para compartir." },
        { q: "¿Mis archivos se suben a algún sitio?", a: "No. Todo el proceso se ejecuta dentro de tu navegador, en tu propio dispositivo: abrir el PDF, dibujar los cuadros y generar la copia censurada ocurren localmente. Tu archivo jamás se envía a un servidor ni sale de tu equipo, así que es una buena opción para documentos confidenciales o regulados." },
        { q: "¿Hay algún límite y es gratis?", a: "Es completamente gratis, sin cuenta, correo ni instalación necesaria. No hay un tope de tamaño fijo, aunque los PDF muy grandes dependen de la memoria de tu dispositivo. El único límite estricto es el número de páginas: un documento puede tener hasta 30 páginas; si el tuyo es más largo, divídelo primero y censura cada parte." },
        { q: "¿Cómo es el archivo de salida?", a: "Obtienes un PDF nuevo en el que cada página es una imagen aplanada (alrededor de 158 DPI, limpia y legible). Como las páginas ahora son imágenes, el contenido censurado desaparece de forma permanente y el resto del texto deja de ser seleccionable o consultable. Esa contrapartida es justo el objetivo: el texto que no puedes seleccionar es texto que no se puede recuperar." },
        { q: "¿Debo fiarme de los cuadros detectados automáticamente por sí solos?", a: "Trátalos como un punto de partida, no como una garantía. El escaneo automático detecta patrones comunes como correos y números, pero puede pasar por alto cosas escritas en formatos poco habituales y no conocerá secretos específicos del contexto que solo tú puedes reconocer. Lee siempre las páginas tú mismo y arrastra cuadros sobre cualquier cosa que el detector no haya marcado antes de descargar." },
      ],
    },
  },
  "translate-pdf": {
    title: { en: "Translate a PDF — FAQ", zh: "翻译 PDF 常见问题", es: "Traducir un PDF — preguntas frecuentes" },
    items: {
      en: [
        { q: "How do I translate a PDF?", a: "Upload your PDF, pick a target language from the list, and click Translate. The text is pulled out of the file and translated by AI, then you can copy it or download it as a .txt file." },
        { q: "Is my file uploaded? Is this private?", a: "The PDF is read right in your browser — the file itself never leaves your device. Only the plain text extracted from it is sent to the AI to translate. The original document, formatting and images are never uploaded." },
        { q: "Is there a size limit?", a: "Yes — about 14,000 characters per run, roughly 10 pages. If your document is longer, split it into smaller chunks and translate them one at a time." },
        { q: "Which languages can I translate into?", a: "More than 18, including English, Simplified and Traditional Chinese, Spanish, French, German, Japanese, Korean, Portuguese, Italian, Russian, Arabic, Hindi, and more. The tool auto-detects the source language, so you only pick the target." },
        { q: "Does it keep the original layout? What do I get back?", a: "Not yet — this version translates the text content only and gives you the translated text to copy or download. Layout-preserving translation that rebuilds the PDF is on the roadmap. Also note: if the PDF is a scan or image with no selectable text, there's nothing to extract — run OCR on it first." },
        { q: "Is it free? Can I rely on it for legal documents?", a: "Yes, it's free to use. AI translation is great for understanding a document and getting a solid first draft, but it isn't a certified translation — for legal, official or certified purposes, have a qualified human review or translate it." },
      ],
      zh: [
        { q: "怎么翻译 PDF？", a: "上传 PDF，从列表里选好目标语言，点「翻译」。系统会把文件里的文字提取出来交给 AI 翻译，翻完后可以直接复制，或下载成 .txt 文件。" },
        { q: "文件会被上传吗？隐私安全吗？", a: "PDF 是在你的浏览器里读取的，文件本身不会离开你的设备。只有从中提取出的纯文字会发给 AI 翻译，原始文档、排版和图片都不会上传。" },
        { q: "有篇幅限制吗？", a: "有——每次大约 14000 字符，差不多 10 页。文档更长的话，先拆成几小段，分次翻译就行。" },
        { q: "能翻成哪些语言？", a: "18 种以上，包括英语、简体和繁体中文、西班牙语、法语、德语、日语、韩语、葡萄牙语、意大利语、俄语、阿拉伯语、印地语等。原文语言会自动识别，你只需要选目标语言。" },
        { q: "会保留原来的版式吗？翻完得到的是什么？", a: "暂时不会——这个版本只翻译文字内容，给你的是翻译后的文字，可复制或下载。能重排版式、还原成 PDF 的翻译还在规划中。另外要注意：如果 PDF 是扫描件或纯图片、没有可选中的文字，就没东西可提取，请先做 OCR。" },
        { q: "免费吗？法律文件能直接用吗？", a: "免费使用。AI 翻译很适合理解文档、出一份不错的初稿，但它不是认证翻译——用于法律、正式或需要认证的场景时，请找专业人士复核或翻译。" },
      ],
      es: [
        { q: "¿Cómo traduzco un PDF?", a: "Sube tu PDF, elige un idioma de destino de la lista y haz clic en «Traducir». El texto se extrae del archivo y lo traduce la IA; luego puedes copiarlo o descargarlo como un archivo .txt." },
        { q: "¿Mi archivo se sube? ¿Es privado?", a: "El PDF se lee directamente en tu navegador: el archivo en sí jamás sale de tu dispositivo. Solo el texto plano extraído de él se envía a la IA para traducir. El documento original, el formato y las imágenes nunca se suben." },
        { q: "¿Hay un límite de tamaño?", a: "Sí: unos 14 000 caracteres por ejecución, aproximadamente 10 páginas. Si tu documento es más largo, divídelo en fragmentos más pequeños y tradúcelos de uno en uno." },
        { q: "¿A qué idiomas puedo traducir?", a: "Más de 18, incluidos inglés, chino simplificado y tradicional, español, francés, alemán, japonés, coreano, portugués, italiano, ruso, árabe, hindi y más. La herramienta detecta automáticamente el idioma de origen, así que solo eliges el de destino." },
        { q: "¿Conserva el diseño original? ¿Qué recibo de vuelta?", a: "Todavía no: esta versión traduce solo el contenido de texto y te da el texto traducido para copiar o descargar. La traducción que conserva el diseño y reconstruye el PDF está en la hoja de ruta. Ten en cuenta también: si el PDF es un escaneo o una imagen sin texto seleccionable, no hay nada que extraer; pásale OCR primero." },
        { q: "¿Es gratis? ¿Puedo fiarme de ella para documentos legales?", a: "Sí, es gratis de usar. La traducción con IA es estupenda para entender un documento y conseguir un buen primer borrador, pero no es una traducción certificada: para fines legales, oficiales o certificados, pide que una persona cualificada la revise o la traduzca." },
      ],
    },
  },
  "extract-to-excel": {
    title: { en: "Extract PDF data to a spreadsheet — FAQ", zh: "把 PDF 数据抽取成表格 — 常见问题", es: "Extraer datos de PDF a una hoja de cálculo — preguntas frecuentes" },
    items: {
      en: [
        { q: "How do I extract data from PDFs into a spreadsheet?", a: "Drop in your invoices, quotes, or contracts (or pick a whole folder to batch them), choose the document type, and click Extract. The AI pulls the key fields — totals, dates, parties, terms — into one table you can download as a CSV that opens in Excel, Google Sheets, or Numbers. It's free." },
        { q: "Are my files uploaded to a server?", a: "The PDF itself never leaves your device — it's read right in your browser. Only the plain text it pulls out is sent to the AI to sort into columns; the original file, with its layout and any images, stays local. If that text-out step is a dealbreaker for sensitive contracts, that's worth knowing up front." },
        { q: "How do I know the numbers are right?", a: "Every value is tagged with the exact sentence it came from in the original document, so you can spot-check it in one glance. If the AI can't clearly find a field, it leaves the cell blank instead of guessing — and we drop any source quote that doesn't actually appear in your file, so nothing is fabricated." },
        { q: "What are the limits?", a: "Up to 8 documents at a time, and the combined text caps out around 60,000 characters — roughly a stack of normal invoices, not a 200-page master agreement. For big batches, run them in a few rounds." },
        { q: "It pulled nothing out — what happened?", a: "Almost always a scanned or photographed PDF. If the text isn't selectable in a normal PDF reader, there's nothing for the browser to read and the AI gets an empty page. Run those through OCR first. Password-protected PDFs also can't be read until you unlock them." },
        { q: "Which documents work best?", a: "Structured paperwork with consistent fields — invoices, quotes, and contracts — where each preset field (vendor, total, due date, payment terms, and so on) is actually printed somewhere in the doc. Free-form letters or unusual layouts will leave more cells blank." },
      ],
      zh: [
        { q: "怎么把 PDF 里的数据抽取成表格？", a: "把发票、报价单或合同拖进来(也可以「选择文件夹」一次性批量处理)，选好文档类型，点「抽取」。AI 会把关键字段——金额、日期、当事方、条款——汇总到一张表里，可下载为 CSV，用 Excel、Google 表格或 Numbers 打开。完全免费。" },
        { q: "文件会被上传到服务器吗？", a: "PDF 本身不会离开你的设备，它在你的浏览器里读取。只有读出来的纯文字会发给 AI 整理成列；原始文件连同版式和图片都留在本地。如果是很敏感的合同，这一步「发送文字」要不要做，值得你提前心里有数。" },
        { q: "怎么确认抽出来的数对不对？", a: "每个值都标注了它来自原文的哪一句，一眼就能核对。AI 找不到的字段会直接留空，而不是瞎编；而且只要 AI 给的原文引用在你的文件里实际找不到，我们就会丢弃它，绝不伪造出处。" },
        { q: "有什么限制？", a: "一次最多 8 份文档，合并文字总量约 6 万字符上限——大概是一摞普通发票的量，不是一份两百页的主合同。量大就分几批跑。" },
        { q: "什么都没抽出来，怎么回事？", a: "基本都是扫描件或拍照的 PDF。如果在普通阅读器里选不中里面的文字，浏览器就读不到内容，AI 拿到的是一张空白页。这种先做 OCR 再来。加密的 PDF 也得先解锁才能读取。" },
        { q: "哪类文档效果最好？", a: "字段固定的结构化单据——发票、报价单、合同——而且每个预设字段(供应商、总额、到期日、付款条款等)在文档里确实有写出来。自由格式的信件或排版很特别的文件，留空的格子会更多。" },
      ],
      es: [
        { q: "¿Cómo extraigo datos de PDF a una hoja de cálculo?", a: "Suelta tus facturas, presupuestos o contratos (o elige una carpeta entera para procesarlos por lotes), escoge el tipo de documento y haz clic en «Extraer». La IA extrae los campos clave —totales, fechas, partes, condiciones— en una sola tabla que puedes descargar como un CSV que se abre en Excel, Google Sheets o Numbers. Es gratis." },
        { q: "¿Mis archivos se suben a un servidor?", a: "El PDF en sí jamás sale de tu dispositivo: se lee directamente en tu navegador. Solo el texto plano que extrae se envía a la IA para ordenarlo en columnas; el archivo original, con su diseño y cualquier imagen, permanece local. Si ese paso de enviar el texto es un inconveniente para contratos sensibles, conviene saberlo de antemano." },
        { q: "¿Cómo sé que los números son correctos?", a: "Cada valor se etiqueta con la frase exacta de la que procede en el documento original, así que puedes verificarlo de un vistazo. Si la IA no encuentra con claridad un campo, deja la celda en blanco en lugar de adivinar, y descartamos cualquier cita de origen que no aparezca realmente en tu archivo, de modo que nada se fabrica." },
        { q: "¿Cuáles son los límites?", a: "Hasta 8 documentos a la vez, y el texto combinado tiene un tope de unos 60 000 caracteres —aproximadamente una pila de facturas normales, no un contrato maestro de 200 páginas—. Para lotes grandes, procésalos en varias rondas." },
        { q: "No extrajo nada, ¿qué pasó?", a: "Casi siempre es un PDF escaneado o fotografiado. Si el texto no es seleccionable en un lector de PDF normal, no hay nada que el navegador pueda leer y la IA recibe una página en blanco. Pásalos primero por OCR. Los PDF protegidos con contraseña tampoco se pueden leer hasta que los desbloquees." },
        { q: "¿Qué documentos funcionan mejor?", a: "Documentación estructurada con campos consistentes —facturas, presupuestos y contratos— donde cada campo predefinido (proveedor, total, fecha de vencimiento, condiciones de pago, etc.) está realmente impreso en algún lugar del documento. Las cartas de formato libre o los diseños poco habituales dejarán más celdas en blanco." },
      ],
    },
  },
  "redline": {
    title: { en: "Compare PDF versions (redline) — FAQ", zh: "PDF 版本对比(红线)常见问题", es: "Comparar versiones de PDF (línea roja) — preguntas frecuentes" },
    items: {
      en: [
        { q: "How do I redline a contract or compare two PDF versions?", a: "Upload the original (v1) and the revised (v2) PDF, then click Compare versions. DockDocs lines up the text and shows a marked-up view — added text is highlighted in green, removed text is struck through in red. This is the same redline view used in contract negotiation and legal document review to track what changed between versions." },
        { q: "Are my files uploaded anywhere?", a: "No. This is a client-side tool: the text is extracted and compared entirely in your browser, so your files never leave your device. Nothing is sent to a server." },
        { q: "Does it catch reworded sentences?", a: "It compares sentence by sentence, so it marks which sentences were added and which were removed. A small reword shows up as one deletion plus one addition rather than a word-level change inside the sentence." },
        { q: "What does it actually compare — does it check formatting or images?", a: "Only the extracted text. Fonts, layout, colors, images and tables aren't part of the comparison, and scanned PDFs with no real text layer won't produce useful results. If it reports no textual changes, the wording is identical even if the look changed." },
        { q: "How large can the documents be?", a: "The whole comparison runs in your browser, so it's tuned for documents up to a few thousand sentences (it caps at 2,500 sentences per file). Very long contracts or books may be truncated or run slowly." },
        { q: "Is it free?", a: "Yes — comparing versions is completely free, with no sign-up and no limit on the number of comparisons." },
        { q: "Can I compare two versions of a contract — will it show every change?", a: "Yes. Upload the earlier version and the revised version, and DockDocs shows a full redline of the contract text — added clauses highlighted in green, removed text struck through in red, sentence by sentence. It shows all textual changes; for scanned contracts without a text layer, run OCR first to make the text readable." },
      ],
      zh: [
        { q: "如何用红线标注对比合同或对比两份 PDF 版本？", a: "上传原始版(v1)和修订版(v2)两个 PDF，点「对比版本」。DockDocs 会对齐文本，生成一个标注视图——新增文字用绿色高亮，删除文字用红色加删除线。这正是合同谈判和法律文件审查中用于追踪版本改动的红线视图。" },
        { q: "文件会被上传吗？", a: "不会。这是纯客户端工具：文本完全在你的浏览器中提取和对比，文件不会离开你的设备，也不会发送到任何服务器。" },
        { q: "能识别改写过的句子吗？", a: "它逐句对比，会标出哪些句子是新增、哪些是删除。小幅改写会显示为一处删除加一处新增，而不是在句子内部标出改动的几个字。" },
        { q: "它到底对比什么——会比排版或图片吗？", a: "只比对抽取出来的文字。字体、版式、颜色、图片和表格都不在对比范围内；没有真正文字层的扫描件也得不到有用结果。如果显示「未发现文字差异」，说明文字完全一致，即使外观变了。" },
        { q: "文档可以多大？", a: "整个对比都在浏览器里运行，因此适合最多几千句的文档(每个文件上限 2500 句)。特别长的合同或书籍可能被截断或变慢。" },
        { q: "是免费的吗？", a: "免费——版本对比完全免费，无需注册，对比次数也不限。" },
        { q: "能对比合同的两个版本吗——会显示所有改动吗？", a: "可以。上传旧版和修订版，DockDocs 会生成完整的合同文字红线标注——新增条款用绿色高亮，删除文字用红色删除线，逐句对比。所有文字改动都会显示；对于没有文字层的扫描合同，请先做 OCR 提取文字。" },
      ],
      es: [
        { q: "¿Cómo marco con líneas rojas un contrato o comparo dos versiones de un PDF?", a: "Sube el PDF original (v1) y el revisado (v2), luego haz clic en «Comparar versiones». DockDocs alinea el texto y muestra una vista marcada: el texto añadido resaltado en verde y el texto eliminado tachado en rojo. Es la misma vista de redline que se usa en la negociación de contratos y la revisión de documentos legales para ver qué cambió entre versiones." },
        { q: "¿Mis archivos se suben a algún sitio?", a: "No. Es una herramienta del lado del cliente: el texto se extrae y se compara por completo en tu navegador, así que tus archivos jamás salen de tu dispositivo. Nada se envía a un servidor." },
        { q: "¿Detecta frases reformuladas?", a: "Compara frase por frase, así que marca qué frases se añadieron y cuáles se eliminaron. Una pequeña reformulación aparece como una eliminación más una adición, en lugar de un cambio a nivel de palabra dentro de la frase." },
        { q: "¿Qué compara exactamente? ¿Revisa el formato o las imágenes?", a: "Solo el texto extraído. Las fuentes, el diseño, los colores, las imágenes y las tablas no forman parte de la comparación, y los PDF escaneados sin una capa de texto real no darán resultados útiles. Si informa de que no hay cambios de texto, la redacción es idéntica aunque el aspecto haya cambiado." },
        { q: "¿Cómo de grandes pueden ser los documentos?", a: "Toda la comparación se ejecuta en tu navegador, así que está ajustada para documentos de hasta unos miles de frases (tiene un tope de 2500 frases por archivo). Los contratos o libros muy largos pueden truncarse o ir lentos." },
        { q: "¿Es gratis?", a: "Sí: comparar versiones es completamente gratis, sin registro y sin límite en el número de comparaciones." },
        { q: "¿Puedo comparar dos versiones de un contrato? ¿Mostrará todos los cambios?", a: "Sí. Sube la versión anterior y la revisada, y DockDocs muestra un redline completo del texto del contrato: cláusulas añadidas resaltadas en verde, texto eliminado tachado en rojo, frase a frase. Muestra todos los cambios textuales; para contratos escaneados sin capa de texto, aplica primero OCR para que el texto sea legible." },
      ],
    },
  },
};

// cast: remove when "pt" is added to Locale
const FAQS_PT: Record<string, { title: string; items: Array<{ q: string; a: string }> }> = {
  "chat-with-pdf": {
    title: "Chat com PDF — perguntas frequentes",
    items: [
      { q: "Como funciona?", a: "Envie um PDF com texto e o DockDocs extrai o texto no seu navegador; depois você faz perguntas e a IA responde usando o conteúdo daquele documento — não conhecimento genérico da web. Um documento por vez, até 12 páginas / 40.000 caracteres / 25 MB por arquivo." },
      { q: "Posso confiar nas respostas? Elas se baseiam no meu documento?", a: "As respostas são fundamentadas no texto extraído do seu PDF e, quando a resposta da IA corresponde a trechos do seu arquivo, eles aparecem sob um aviso «✓ verificado na fonte» com as citações exatas, para você mesmo conferir. As citações dependem do que o modelo retorna e não aparecem em toda resposta; além disso, a IA ainda pode errar — para algo importante, confirme no documento original." },
      { q: "Meu PDF é enviado ou armazenado?", a: "O texto é extraído no seu navegador; apenas esse texto extraído é enviado ao provedor de IA para responder à sua pergunta, e o arquivo em si nunca sai do seu dispositivo nem é armazenado depois." },
      { q: "Quais PDFs funcionam?", a: "PDFs com texto (nativos digitais). PDFs digitalizados não têm texto selecionável — execute o OCR primeiro para o chat ter o que ler. Funciona em português, inglês, espanhol, francês e outros; as respostas seguem o idioma em que você pergunta." },
      { q: "Há limites?", a: "DockDocs limita cada arquivo a 25 MB, 12 páginas e 40.000 caracteres de texto extraído; para documentos mais longos, divida ou comprima antes. Há uma cota diária gratuita — faça upgrade se precisar de mais." },
    ],
  },
  "govbid-matrix": {
    title: "Matriz de conformidade para licitações públicas — perguntas frequentes",
    items: [
      { q: "O que ela extrai?", a: "Lê um RFP, edital ou licitação e reúne cada requisito vinculante 'shall/must/will' em uma matriz de conformidade numerada: cada linha traz o requisito, a referência de seção e se é obrigatório ou recomendado. Você pode filtrar somente os obrigatórios e exportar toda a matriz em CSV para colar direto no seu controle de resposta à proposta." },
      { q: "Consigo rastrear cada requisito até o edital original?", a: "Sim — esse é o objetivo. Cada linha cita o texto fonte exato e mostra sua seção, para você verificar cada requisito no documento original antes de assumi-lo na sua proposta. Se a IA devolver uma citação que não encontramos no seu arquivo, nós a rotulamos como 'Citação não verificável' em vez de exibir uma referência fabricada. Nada é inventado; o que você não consegue rastrear, você vê que não consegue." },
      { q: "Isso substitui ler o edital eu mesmo?", a: "Não. É uma primeira passada rápida para garantir que nenhum 'shall/must' escape — não garante completude e não é assessoria de conformidade ou jurídica. A conformidade da sua proposta continua sendo sua responsabilidade; leia sempre o edital completo e trate como vinculante tudo o que a ferramenta deixar passar." },
      { q: "Meu edital é enviado ou armazenado?", a: "Seu arquivo é lido no seu navegador; apenas o texto extraído é enviado para análise, e não é armazenado depois. O arquivo em si nunca sai do seu dispositivo — o que importa em licitações sigilosas e antes da adjudicação." },
      { q: "Quais documentos funcionam melhor?", a: "PDFs com texto (nativos digitais). Licitações digitalizadas não têm texto selecionável — execute o OCR primeiro. Funciona em português, inglês, espanhol, francês e outros; as citações permanecem no idioma original do documento." },
    ],
  },
  "contract-risk": {
    title: "Análise de risco contratual — perguntas frequentes",
    items: [
      { q: "O que é verificado?", a: "Escaneia seu contrato em busca de cláusulas que merecem atenção: renovação automática, rescisão ou alteração unilateral, responsabilidade ilimitada, multas e juros de mora, armadilhas de pagamento e custos ocultos, não-concorrência excessiva e proteções-padrão ausentes (como ausência de limite de responsabilidade). Cada achado é marcado em vermelho (alto), âmbar (médio) ou verde (baixo), citado do seu contrato, com a razão em linguagem simples e o que perguntar antes de assinar." },
      { q: "É assessoria jurídica?", a: "Não. É uma revisão automatizada para ajudar quem não é advogado a identificar cláusulas que merecem atenção — não é assessoria jurídica e não substitui um advogado. Para algo importante ou de alto valor, peça a um advogado qualificado que revise. Não sinalizar nada não garante que o contrato seja seguro." },
      { q: "Cria cláusulas ou citações falsas?", a: "Cada citação é verificada no texto real do seu contrato — se a IA devolver uma citação que não encontramos no seu documento, a descartamos em vez de exibir uma referência fabricada. Riscos de cláusula ausente são exibidos sem citação e rotulados como tal. A IA ainda pode perder coisas, portanto leia sempre o contrato completo." },
      { q: "Meu contrato é enviado ou armazenado?", a: "Seu contrato é lido no seu navegador; apenas o texto extraído é enviado para análise, e não é armazenado depois. O arquivo em si nunca sai do seu dispositivo." },
      { q: "Quais contratos funcionam melhor?", a: "PDFs com texto (nativos digitais). Contratos digitalizados não têm texto selecionável — execute o OCR primeiro. Funciona em português, inglês, espanhol e outros; as citações permanecem no idioma original do contrato." },
    ],
  },
  "lease-redflag": {
    title: "Análise de risco do contrato de locação — perguntas frequentes",
    items: [
      { q: "O que é sinalizado?", a: "Escaneia seu contrato de locação em busca de cláusulas que podem prejudicar você como inquilino: reajuste agressivo de aluguel, multas pesadas por rescisão antecipada, direitos de entrada do locador não razoáveis, divisão de manutenção pouco clara, deduções excessivas de caução, restrições de sublocação, encargos injustos de permanência e proteções-padrão ausentes. Cada achado é marcado em vermelho, âmbar ou verde, com citação e o que perguntar ou negociar." },
      { q: "É assessoria jurídica?", a: "Não. É uma revisão automatizada para ajudar inquilinos a identificar cláusulas que merecem atenção — não é assessoria jurídica e não substitui um advogado ou uma organização de direitos do inquilino. Para algo importante, consulte um advogado qualificado." },
      { q: "Cria citações falsas?", a: "Cada citação é verificada no texto real do seu contrato — se a IA devolver uma citação que não encontramos no seu documento, a descartamos. Riscos de cláusula ausente são exibidos sem citação e rotulados como tal." },
      { q: "Meu contrato é enviado ou armazenado?", a: "Seu contrato é lido no seu navegador; apenas o texto extraído é enviado para análise, e não é armazenado depois. O arquivo em si nunca sai do seu dispositivo." },
      { q: "Quais formatos funcionam?", a: "PDFs com texto (nativos digitais). Contratos digitalizados precisam de OCR primeiro. Funciona em português, inglês, espanhol e outros; as citações permanecem no idioma original do contrato." },
    ],
  },
  "batch-translate": {
    title: "Traduzir Documentos — perguntas frequentes",
    items: [
      { q: "Como traduzo vários PDFs de uma vez?", a: "Solte seus PDFs na página — ou uma pasta inteira — escolha o idioma de destino e clique em Traduzir tudo. Cada PDF é lido no seu navegador, o texto é traduzido um por um, e você baixa tudo como um único ZIP de arquivos .txt." },
      { q: "Para quais idiomas posso traduzir?", a: "13 idiomas, incluindo inglês, chinês simplificado e tradicional, espanhol, francês, alemão, japonês, coreano, português, italiano, russo, árabe e hindi. Todo o lote é traduzido para o idioma que você escolher." },
      { q: "O que recebo — mantém o layout?", a: "Você recebe texto simples (.txt), um arquivo por PDF, compactados juntos. A tradução é apenas de texto, então o layout original, imagens e formatação não são preservados. É ideal para ler e reutilizar o conteúdo, não para produzir uma cópia formatada." },
      { q: "Há um limite e o que acontece com PDFs digitalizados?", a: "Até 10 PDFs por lote, cada um com até cerca de 10 páginas (14.000 caracteres) de texto. PDFs digitalizados não têm texto selecionável — execute o OCR neles primeiro; caso contrário, são ignorados com uma observação." },
      { q: "É privado e gratuito?", a: "Cada PDF é lido no seu navegador e apenas o texto extraído — nunca o arquivo — é enviado para tradução. É gratuito; a tradução conta para o seu limite diário de uso de IA, que é redefinido a cada dia." },
    ],
  },
  "batch-office-to-pdf": {
    title: "Office para PDF em lote — perguntas frequentes",
    items: [
      { q: "Como converto vários arquivos do Office em PDF de uma vez?", a: "Solte seus arquivos do Word, PowerPoint e Excel na página — ou uma pasta inteira — e clique em Converter tudo. Cada arquivo é convertido em PDF um por um e, quando terminarem, clique em Baixar ZIP para obter tudo em um único arquivo." },
      { q: "Quais formatos posso converter?", a: "Word (.doc, .docx), PowerPoint (.ppt, .pptx), Excel (.xls, .xlsx), além de OpenDocument (.odt, .odp, .ods) e .rtf. O tipo de arquivo é detectado automaticamente, então você pode misturar documentos, slides e planilhas no mesmo lote." },
      { q: "O PDF ficará exatamente igual ao original?", a: "A conversão usa LibreOffice — o mesmo mecanismo das nossas ferramentas de Office para PDF de arquivo único. Para documentos típicos o resultado é fiel, mas fontes incomuns, macros ou layouts muito complexos podem variar um pouco; verifique o que for sensível à formatação." },
      { q: "Há limite de tamanho ou quantidade?", a: "Até 20 arquivos por lote, cada um de até 5 MB. Para um arquivo maior que 5 MB, use a ferramenta de arquivo único Word para PDF, PPT para PDF ou Excel para PDF, que suporta arquivos maiores." },
      { q: "Meus arquivos são enviados? É gratuito?", a: "É gratuito e sem conta. A conversão do Office é executada no nosso próprio servidor, então cada arquivo é enviado lá, convertido em PDF e devolvido — não é armazenado ou mantido depois." },
    ],
  },
  "batch-word-to-pdf": {
    title: "Word para PDF em lote — perguntas frequentes",
    items: [
      { q: "Como converto vários arquivos do Word em PDF de uma vez?", a: "Solte seus arquivos do Word na página — ou uma pasta inteira — e clique em Converter tudo. Cada .doc ou .docx é convertido em PDF um por um e, quando terminarem, clique em Baixar ZIP para obter tudo em um único arquivo." },
      { q: "Quais formatos do Word são suportados?", a: "Tanto o moderno .docx quanto o antigo .doc, além de OpenDocument de texto (.odt) e .rtf. Para lotes mistos de Word, PowerPoint e Excel juntos, use a ferramenta geral de Office para PDF." },
      { q: "O PDF ficará exatamente igual ao original?", a: "A conversão usa LibreOffice — o mesmo mecanismo da nossa ferramenta de arquivo único Word para PDF. Para documentos típicos o resultado é fiel, mas fontes incomuns, macros ou layouts muito complexos podem variar um pouco; verifique o que for sensível à formatação." },
      { q: "Há limite de tamanho ou quantidade?", a: "Até 20 arquivos por lote, cada um de até 5 MB. Para um arquivo do Word maior que 5 MB, use a ferramenta de arquivo único Word para PDF, que suporta arquivos maiores." },
      { q: "Meus arquivos são enviados? É gratuito?", a: "É gratuito e sem conta. A conversão do Office é executada no nosso próprio servidor, então cada arquivo é enviado lá, convertido em PDF e devolvido — não é armazenado ou mantido depois." },
    ],
  },
  "batch-excel-to-pdf": {
    title: "Excel para PDF em lote — perguntas frequentes",
    items: [
      { q: "Como converto vários arquivos do Excel em PDF de uma vez?", a: "Solte suas planilhas na página — ou uma pasta inteira — e clique em Converter tudo. Cada .xls ou .xlsx é convertido em PDF um por um e, quando terminarem, clique em Baixar ZIP para obter tudo em um único arquivo." },
      { q: "Quais formatos de planilha são suportados?", a: "Tanto o moderno .xlsx quanto o antigo .xls, além de planilhas OpenDocument (.ods). Para lotes mistos de Word, PowerPoint e Excel juntos, use a ferramenta geral de Office para PDF." },
      { q: "As planilhas largas cabem na página?", a: "A conversão usa LibreOffice e segue a área de impressão e a configuração de página de cada planilha, então planilhas muito largas podem se dividir em várias páginas, como na impressão. Defina a área de impressão ou o dimensionamento no Excel primeiro se precisar de tudo em uma página." },
      { q: "Há limite de tamanho ou quantidade?", a: "Até 20 arquivos por lote, cada um de até 5 MB. Para um arquivo do Excel maior que 5 MB, use a ferramenta de arquivo único Excel para PDF, que suporta arquivos maiores." },
      { q: "Meus arquivos são enviados? É gratuito?", a: "É gratuito e sem conta. A conversão do Office é executada no nosso próprio servidor, então cada arquivo é enviado lá, convertido em PDF e devolvido — não é armazenado ou mantido depois." },
    ],
  },
  "batch-ppt-to-pdf": {
    title: "PowerPoint para PDF em lote — perguntas frequentes",
    items: [
      { q: "Como converto vários arquivos do PowerPoint em PDF de uma vez?", a: "Solte seus arquivos do PowerPoint na página — ou uma pasta inteira — e clique em Converter tudo. Cada .ppt ou .pptx é convertido em PDF um por um e, quando terminarem, clique em Baixar ZIP para obter tudo em um único arquivo." },
      { q: "Quais formatos do PowerPoint são suportados?", a: "Tanto o moderno .pptx quanto o antigo .ppt, além de apresentações OpenDocument (.odp). Para lotes mistos de Word, PowerPoint e Excel juntos, use a ferramenta geral de Office para PDF." },
      { q: "Como os slides ficam no PDF?", a: "Cada slide vira uma página inteira do PDF, em ordem, usando LibreOffice — o mesmo mecanismo da nossa ferramenta de arquivo único PPT para PDF. Notas do apresentador e animações não são incluídas; o PDF captura a aparência final de cada slide. Fontes incomuns ou layouts muito complexos podem variar um pouco, então verifique apresentações sensíveis à formatação." },
      { q: "Há limite de tamanho ou quantidade?", a: "Até 20 arquivos por lote, cada um de até 5 MB. Para um arquivo do PowerPoint maior que 5 MB, use a ferramenta de arquivo único PPT para PDF, que suporta arquivos maiores." },
      { q: "Meus arquivos são enviados? É gratuito?", a: "É gratuito e sem conta. A conversão do Office é executada no nosso próprio servidor, então cada arquivo é enviado lá, convertido em PDF e devolvido — não é armazenado ou mantido depois." },
    ],
  },
  "batch-pdf-to-office": {
    title: "PDF para Word/Excel em lote — perguntas frequentes",
    items: [
      { q: "Como converto vários PDFs em Word ou Excel de uma vez?", a: "Solte seus PDFs na página — ou uma pasta inteira — escolha Word ou Excel como destino e clique em Converter tudo. Cada arquivo é convertido um por um e, quando terminarem, clique em Baixar ZIP para obter tudo em um único arquivo." },
      { q: "Devo escolher Word ou Excel?", a: "Escolha Word (.docx) para documentos com texto e parágrafos, e Excel (.xlsx) para PDFs formados por tabelas — faturas, extratos, planilhas de dados. O Excel funciona melhor quando o PDF tem linhas e colunas claras." },
      { q: "O layout ficará exatamente igual ao original?", a: "Nenhum conversor pode garantir uma cópia pixel a pixel. Extraímos o texto e as tabelas em um arquivo realmente editável — que é o que você precisa para editar — mas PDFs digitalizados ou com layout complexo podem precisar de ajustes depois. Para um PDF digital com texto e tabelas normais, o resultado costuma ser próximo." },
      { q: "Há limite de tamanho ou quantidade?", a: "Você pode converter até 20 PDFs por lote, cada um de até 5 MB. Para um arquivo maior que 5 MB, use a ferramenta de arquivo único PDF para Word ou PDF para Excel, que suporta arquivos maiores." },
      { q: "Meus arquivos são enviados? É gratuito?", a: "É gratuito e sem conta. Ao contrário das nossas ferramentas que funcionam apenas no navegador, a conversão para formatos do Office é executada no nosso próprio servidor, então cada PDF é enviado lá, convertido e devolvido — não é armazenado ou mantido depois." },
    ],
  },
  "batch-pdf-to-word": {
    title: "PDF para Word em lote — perguntas frequentes",
    items: [
      { q: "Como converto vários PDFs em Word de uma vez?", a: "Solte seus PDFs na página — ou uma pasta inteira — e clique em Converter tudo. Cada arquivo é convertido em um documento do Word editável um por um e, quando terminarem, clique em Baixar ZIP para obter tudo em um único arquivo." },
      { q: "O arquivo do Word ficará exatamente igual ao original?", a: "Nenhum conversor pode garantir uma cópia pixel a pixel. Extraímos o texto em um .docx realmente editável — que é o que você precisa para editar — mas PDFs digitalizados ou com layout complexo podem precisar de ajustes depois. Para um PDF digital com texto normal, o resultado costuma ser próximo." },
      { q: "Quais PDFs convertem melhor?", a: "PDFs baseados em texto e de origem digital convertem melhor. PDFs digitalizados não têm texto selecionável — execute o OCR neles primeiro, caso contrário o arquivo do Word volta vazio. Se o seu PDF é formado principalmente por tabelas, o conversor de PDF para Excel costuma dar um resultado mais limpo." },
      { q: "Há limite de tamanho ou quantidade?", a: "Você pode converter até 20 PDFs por lote, cada um de até 5 MB. Para um arquivo maior que 5 MB, use a ferramenta de arquivo único PDF para Word, que suporta arquivos maiores." },
      { q: "Meus arquivos são enviados? É gratuito?", a: "É gratuito e sem conta. Ao contrário das nossas ferramentas que funcionam apenas no navegador, a conversão para Word é executada no nosso próprio servidor, então cada PDF é enviado lá, convertido e devolvido — não é armazenado ou mantido depois." },
    ],
  },
  "batch-pdf-to-excel": {
    title: "PDF para Excel em lote — perguntas frequentes",
    items: [
      { q: "Como converto vários PDFs em Excel de uma vez?", a: "Solte seus PDFs na página — ou uma pasta inteira — e clique em Converter tudo. Cada arquivo é convertido em uma planilha do Excel editável um por um e, quando terminarem, clique em Baixar ZIP para obter tudo em um único arquivo." },
      { q: "O arquivo do Excel ficará exatamente igual ao original?", a: "Nenhum conversor pode garantir uma cópia pixel a pixel. Extraímos as tabelas e o texto em um .xlsx realmente editável — que é o que você precisa para trabalhar com os números — mas PDFs digitalizados ou com layout complexo podem precisar de ajustes depois. Para um PDF digital com tabelas claras, o resultado costuma ser próximo." },
      { q: "Quais PDFs convertem melhor?", a: "PDFs formados por tabelas claras — faturas, extratos bancários, planilhas de dados — convertem melhor, porque as linhas e colunas se mapeiam diretamente para as células da planilha. PDFs digitalizados não têm texto selecionável, então execute o OCR neles primeiro. Se o seu PDF é formado principalmente por parágrafos em vez de tabelas, o conversor de PDF para Word costuma dar um resultado mais limpo." },
      { q: "Há limite de tamanho ou quantidade?", a: "Você pode converter até 20 PDFs por lote, cada um de até 5 MB. Para um arquivo maior que 5 MB, use a ferramenta de arquivo único PDF para Excel, que suporta arquivos maiores." },
      { q: "Meus arquivos são enviados? É gratuito?", a: "É gratuito e sem conta. Ao contrário das nossas ferramentas que funcionam apenas no navegador, a conversão para Excel é executada no nosso próprio servidor, então cada PDF é enviado lá, convertido e devolvido — não é armazenado ou mantido depois." },
    ],
  },
  "batch-compress": {
    title: "Comprimir PDFs em lote — perguntas frequentes",
    items: [
      { q: "Como comprimo vários PDFs de uma vez?", a: "Arraste seus PDFs para a página — ou solte uma pasta inteira, ou use «Escolher pasta» — e qualquer arquivo que não seja PDF nessa pasta é filtrado automaticamente. Escolha uma intensidade de compressão («Leve», «Recomendada» ou «Intensa») e clique em «Comprimir tudo». Cada arquivo é processado um por um e, quando terminar, clique em «Baixar ZIP» para recuperar tudo em um único arquivo compactado." },
      { q: "Meus arquivos são enviados a um servidor?", a: "Não. Esta é uma ferramenta 100% do lado do cliente: cada PDF é lido e comprimido dentro do seu próprio navegador, e nada é jamais enviado a qualquer servidor. Seus arquivos nunca saem do seu dispositivo, e é por isso que você pode usá-la com documentos confidenciais sem preocupação." },
      { q: "O que recebo de volta e como os arquivos são nomeados?", a: "Você recebe um único arquivo ZIP (dockdocs-compressed.zip). Dentro dele, cada PDF mantém seu nome original com «-compressed» adicionado antes da extensão — então report.pdf se torna report-compressed.pdf. Cada linha também mostra o quanto aquele arquivo diminuiu, e o botão de download mostra a redução de tamanho total." },
      { q: "Há limite de quantos arquivos ou de tamanho?", a: "Você pode adicionar até 30 PDFs por lote. Não há limite fixo de tamanho por arquivo — como tudo é executado no seu navegador, o limite real é a memória do seu dispositivo. Arquivos grandes ou numerosos ainda funcionam, só demoram mais para processar em máquinas mais fracas." },
      { q: "Por que meu PDF não reduziu muito?", a: "A compressão funciona renderizando cada página como uma imagem, o que é ótimo para digitalizações e PDFs com muitas imagens, mas faz pouco por arquivos que são principalmente texto simples — simplesmente não há muito a comprimir. Se um arquivo mal muda, isso é esperado; tente «Intensa» para um pouco mais, mas PDFs somente de texto já estão perto do seu tamanho mínimo." },
      { q: "É gratuito? Preciso de uma conta?", a: "Sim, é completamente gratuito — sem cadastro, sem marca d'água, sem limite diário. Basta abrir a página e começar a comprimir." },
    ],
  },
  "batch-pdf-to-image": {
    title: "PDF para imagem em lote — perguntas frequentes",
    items: [
      { q: "Como converto um lote de PDFs em imagens?", a: "Arraste seus PDFs para a caixa de upload — ou solte uma pasta inteira, ou clique em «Escolher pasta». Escolha JPG ou PNG e clique em «Converter tudo». Cada página de cada PDF é convertida em uma imagem e o resultado é baixado como um único ZIP. Sem cadastro e sem marca d'água." },
      { q: "Meus arquivos são enviados a um servidor?", a: "Não. Esta ferramenta é 100% do lado do cliente: cada PDF é lido e renderizado em imagens inteiramente dentro do seu navegador, e nada é jamais enviado a qualquer servidor. O ZIP que você baixa é gerado localmente no seu dispositivo. Você pode até usá-la offline depois que a página carregar." },
      { q: "O que recebo de volta e como as imagens são nomeadas?", a: "Você recebe um arquivo ZIP (chamado dockdocs-images.zip) contendo cada página como uma imagem separada. Cada arquivo leva o nome do seu PDF de origem mais o número da página — por exemplo, report.pdf se torna report-1.jpg, report-2.jpg, e assim por diante. As páginas são renderizadas em escala 2× para uma saída nítida e de alta resolução." },
      { q: "Qual é a diferença entre JPG e PNG aqui?", a: "O JPG gera arquivos menores e achata cada página em um fundo branco — ideal para documentos com muitas fotos ou digitalizados. O PNG não tem perdas e mantém a transparência, o que é melhor para artes lineares, diagramas ou páginas que você vai editar depois. Escolha o que for mais adequado antes de clicar em «Converter tudo»; você pode executar novamente com o outro formato quando quiser." },
      { q: "Quantos arquivos ou páginas posso converter de uma vez?", a: "Você pode colocar em fila até 20 PDFs por lote — arquivos extras além disso são descartados automaticamente. Não há limite fixo de páginas ou tamanho, então o teto real é a memória do seu dispositivo: PDFs muito grandes ou com muitas páginas simplesmente demoram mais e ficam mais lentos em máquinas mais fracas. Para um trabalho grande, divida-o em alguns lotes." },
      { q: "Por que um dos meus PDFs mostrou «falhou»?", a: "A causa mais comum é um PDF protegido por senha ou criptografado — a ferramenta não pode renderizar páginas que não consegue abrir, então esse arquivo é marcado como falhou enquanto o restante do lote ainda se converte normalmente. Remova a senha primeiro (nossa ferramenta Desbloquear PDF pode ajudar) e depois adicione-o novamente. Arquivos corrompidos ou que não são PDF também podem falhar; note que, se você soltar uma pasta, arquivos que não são PDF são filtrados automaticamente em vez de falhar." },
    ],
  },
  "batch-protect-pdf": {
    title: "Criptografar PDFs em lote — perguntas frequentes",
    items: [
      { q: "Como criptografo vários PDFs de uma vez?", a: "Arraste seus PDFs para a caixa — ou solte uma pasta inteira, ou clique para escolher arquivos. Digite uma senha (o campo «Senha») e clique em «Criptografar tudo». Cada arquivo é bloqueado com essa mesma senha e você recebe um único ZIP com cada arquivo renomeado como «…-protected.pdf»." },
      { q: "Meus arquivos são enviados a um servidor?", a: "Não. É uma ferramenta 100% do lado do cliente — cada PDF é criptografado dentro do seu próprio navegador e nada jamais sai do seu dispositivo. Não há upload, nem conta, nem cópia guardada em lugar algum. Você pode até usá-la offline depois que a página carregar." },
      { q: "O que recebo de volta e em que formato?", a: "Você recebe um arquivo ZIP chamado «dockdocs-protected.zip». Dentro, cada PDF de entrada aparece como seu próprio arquivo criptografado com o sufixo «-protected.pdf». Abra qualquer um deles e seu leitor pedirá a senha que você definiu." },
      { q: "Há regras para a senha ou limites de quantos arquivos?", a: "A senha deve ter entre 4 e 32 caracteres usando apenas letras, dígitos e o sublinhado (_) — isso a torna segura para aplicar em qualquer leitor de PDF. Você pode criptografar até 30 arquivos por lote; para mais, execute a ferramenta novamente. Não há limite rígido de tamanho, mas como tudo é executado no seu navegador, trabalhos muito grandes ficam mais lentos em dispositivos com pouca memória." },
      { q: "O que acontece com um PDF que já está protegido por senha?", a: "É ignorado. A ferramenta não pode bloquear novamente um arquivo que não consegue abrir, então qualquer PDF que já tenha senha fica fora do ZIP em vez de fazer todo o lote falhar. Descriptografe-o primeiro (com a senha original) se quiser criptografá-lo novamente aqui." },
      { q: "É realmente gratuito? Tem marca d'água ou exige cadastro?", a: "Sim, completamente gratuito, sem cadastro e sem marca d'água. Os PDFs criptografados são byte a byte seus originais mais a senha — o DockDocs não adiciona nada a eles." },
    ],
  },
  "flashcards": {
    title: "Cartões de estudo de PDF — perguntas frequentes",
    items: [
      { q: "Como transformo um PDF em cartões de estudo?", a: "Solte um PDF — um capítulo de livro, anotações de aula ou um manual — e a ferramenta lê o texto diretamente no seu navegador. Escolha quantos cartões quer (5, 10, 15 ou 20) e pressione «Gerar cartões». Você obtém uma grade de cartões de pergunta/resposta; toque em qualquer cartão para virá-lo e testar a si mesmo." },
      { q: "Meu PDF é enviado para algum lugar?", a: "Seu arquivo PDF nunca é enviado. O texto é extraído dentro do seu navegador e apenas esse texto simples (mais a quantidade de cartões e o idioma) é enviado ao nosso serviço de IA para redigir os cartões. O arquivo original, com suas imagens, layout e metadados, permanece no seu dispositivo." },
      { q: "Por que diz «Nenhum texto encontrado neste PDF»?", a: "Seu PDF é uma digitalização ou uma imagem — não tem uma camada de texto para ler, apenas uma imagem da página. Execute-o primeiro pelo OCR para adicionar uma camada de texto pesquisável e depois tente novamente. Dica: se o PDF estiver protegido por senha, desbloqueie-o primeiro com a ferramenta «Desbloquear PDF»." },
      { q: "Os cartões são precisos?", a: "Os cartões são redigidos pela IA usando apenas o texto do seu documento — ela é instruída a não usar conhecimento externo ou inventar fatos. Mesmo assim, a IA pode interpretar mal ou simplificar demais, então verifique os cartões rapidamente antes de estudar com eles. A ferramenta lembra você disso na tela de resultados." },
      { q: "Há limite de tamanho ou uso?", a: "Sim. Cada execução aceita até cerca de 16.000 caracteres de texto — aproximadamente 12 páginas — então alimente-a com um capítulo ou seção de cada vez em vez de um livro inteiro. Também há um limite de uso justo de cerca de seis gerações por minuto. Se você atingir qualquer um deles, verá uma mensagem clara; basta encurtar o conteúdo ou aguardar um minuto." },
      { q: "É gratuito e preciso de conexão à internet?", a: "É gratuito para usar — sem conta ou pagamento necessário. Como os cartões são redigidos por um serviço de IA, você precisa de conexão à internet: o navegador lê seu PDF offline, mas gerar os cartões faz uma chamada rápida ao nosso servidor." },
    ],
  },
  "compare": {
    title: "Comparar documentos — perguntas frequentes",
    items: [
      { q: "Como comparo documentos?", a: "Envie de 2 a 8 PDFs do mesmo tipo — orçamentos, faturas ou contratos — escolha o tipo e clique em «Comparar campos». O DockDocs alinha os termos principais (preço, entrega, pagamento, garantia, etc.) lado a lado em uma única tabela, mostrando a linha de origem exata por trás de cada valor quando consegue localizá-la (e «Não reconhecido» quando um documento não o indica, nunca um palpite). Você também obtém uma recomendação baseada nos dados comparados sobre qual opção vence e pode fazer uma pergunta a todos os documentos de uma vez." },
      { q: "Meus arquivos são enviados ao seu servidor?", a: "Não — seus PDFs nunca saem do seu dispositivo. O DockDocs os lê diretamente no seu navegador para extrair o texto. Apenas esse texto simples extraído (não o arquivo em si) é enviado ao nosso servidor, onde a IA extrai e alinha os campos. Então o documento, seu layout e quaisquer dados incorporados ficam locais; o que viaja são as palavras na página." },
      { q: "Por que meu PDF diz «Não reconhecido (provavelmente digitalizado — precisa de OCR)»?", a: "Isso significa que o PDF não tem uma camada de texto selecionável — geralmente é uma digitalização ou uma foto de uma página, então não há nada para ler. Clique em «Extrair texto com OCR» nesse documento e o DockDocs executará o OCR no seu navegador para reconhecer o texto (as primeiras páginas) e, em seguida, você pode compará-lo como qualquer outro arquivo. PDFs criptografados ou protegidos por senha também não podem ser lidos até que sejam desbloqueados." },
      { q: "O que recebo de volta e posso confiar nos valores?", a: "Você obtém uma tabela comparativa onde cada célula mostra o valor mais a linha de origem exata da qual veio — e essa linha é verificada para realmente aparecer no seu documento, então nada é inventado. Clique em qualquer linha de origem para ir a um trecho destacado do texto original. Se um documento simplesmente não declara algo, você verá «Não reconhecido» em vez de uma suposição. Uma ressalva: a recomendação geral é o raciocínio da IA sobre esses números e não é verificada individualmente por fonte, então confirme os valores na tabela antes de decidir." },
      { q: "Há limite de quantidade ou tamanho de arquivos?", a: "Você pode comparar até 8 PDFs de uma vez e precisa de pelo menos 2 legíveis para a comparação funcionar. Para o recurso «perguntar em todos os documentos», o texto combinado de todos os documentos deve ficar abaixo de 60.000 caracteres e sua pergunta abaixo de 500 caracteres — se exceder, use documentos menos numerosos ou mais curtos. A ferramenta precisa de conexão à internet, pois a extração de campos e a recomendação são executadas no nosso servidor." },
      { q: "É gratuito?", a: "Sim — você pode enviar seus PDFs, executar a comparação lado a lado, obter a recomendação e fazer perguntas em seus documentos. O OCR no navegador para arquivos digitalizados também é gratuito, pois é executado localmente no seu dispositivo." },
    ],
  },
  "merge-pdf": {
    title: "Mesclar arquivos PDF — perguntas frequentes",
    items: [
      { q: "Como mesclar arquivos PDF?", a: "Adicione dois ou mais PDFs, arraste as miniaturas para a ordem desejada e clique em Mesclar e baixar. As páginas são combinadas de cima para baixo, nessa ordem, em um único PDF." },
      { q: "Consigo controlar a ordem de mesclagem?", a: "Sim. Cada arquivo tem uma miniatura e um número — arraste para reordenar antes de mesclar. Você vê exatamente o que vai onde antes de clicar, não depois." },
      { q: "Meus arquivos são enviados a um servidor?", a: "Não. Tudo é executado localmente no seu navegador — a mesclagem ocorre no seu dispositivo e seus arquivos nunca são enviados. Sem conta, sem cadastro." },
      { q: "Há limite de tamanho ou de páginas?", a: "Não há limite fixo. Como todo o processo ocorre no navegador, o limite prático é a memória do dispositivo — arquivos muito grandes ou muitos de uma vez podem ficar lentos em dispositivos com pouca RAM." },
      { q: "Por que um dos meus PDFs foi ignorado?", a: "PDFs protegidos por senha ou criptografados não podem ser lidos, então são excluídos com um aviso. Remova a senha primeiro e adicione o arquivo novamente." },
      { q: "É gratuito?", a: "Sim — completamente gratuito, sem marca d'água e sem cadastro. O arquivo mesclado é baixado como um único PDF." },
    ],
  },
  "split-pdf": {
    title: "Dividir um PDF — perguntas frequentes",
    items: [
      { q: "Como dividir um PDF?", a: "Envie o PDF e clique no ✂ entre duas páginas para definir um ponto de corte. Adicione quantos cortes quiser ou use «Dividir a cada N páginas» para colocá-los automaticamente. Ao clicar em Dividir e baixar, cada segmento é salvo como um PDF separado, todos compactados em um único ZIP." },
      { q: "Como sei o que vai em cada arquivo?", a: "Antes de baixar, as páginas são coloridas e rotuladas «Arquivo 1», «Arquivo 2», e assim por diante, e um contador ao vivo informa exatamente quantos arquivos serão criados — sem surpresas." },
      { q: "Meu arquivo é enviado a algum lugar?", a: "Não. A divisão toda é feita localmente no seu navegador: o PDF é lido, cortado e compactado no seu dispositivo e nunca enviado a um servidor." },
      { q: "Há limite de tamanho ou de páginas?", a: "Sem limite fixo. Como tudo ocorre no navegador, o limite prático é a memória do dispositivo — PDFs muito grandes ou com muitas páginas demoram mais para renderizar." },
      { q: "O que recebo de volta e é gratuito?", a: "Um ZIP com um PDF por segmento (nomeados como document-part-1.pdf, document-part-2.pdf). Mesmo com um único corte, a saída é um ZIP. Totalmente gratuito, sem cadastro ou marca d'água. Observação: PDFs protegidos por senha precisam ser desbloqueados primeiro." },
    ],
  },
  "crop-pdf": {
    title: "Recortar PDF — perguntas frequentes",
    items: [
      { q: "Como recorto um PDF?", a: "Envie seu PDF e arraste os controles deslizantes superior, direito, inferior e esquerdo para aparar cada borda. Você verá uma pré-visualização ao vivo enquanto ajusta, então basta configurar até parecer certo e clicar em Recortar e baixar." },
      { q: "Recorta todas as páginas da mesma forma?", a: "Sim. As margens definidas são aplicadas uniformemente a todas as páginas, então o documento inteiro fica consistente. Esta ferramenta não permite recorte por página." },
      { q: "O conteúdo recortado é realmente excluído?", a: "Não. Recortar muda a área visível (a caixa de corte) — as partes recortadas ficam ocultas, não apagadas. Isso significa que nada é realmente perdido, mas também que alguém poderia recuperá-lo. Se precisar que o conteúdo desapareça definitivamente, use uma ferramenta de redação." },
      { q: "Meu arquivo é enviado para algum lugar?", a: "Não. Tudo é executado localmente no seu navegador — seu PDF nunca sai do seu dispositivo e nada é enviado a um servidor." },
      { q: "Há limite de tamanho?", a: "Não há limite fixo. Como tudo acontece no seu navegador, o teto prático depende da memória do seu dispositivo — arquivos muito grandes podem ficar lentos ou ficar sem memória em máquinas mais fracas." },
      { q: "É gratuito? Preciso de uma conta?", a: "É completamente gratuito e não é necessário cadastro. Basta abrir a página e começar a recortar." },
    ],
  },
  "sign-pdf": {
    title: "Assinar PDF — perguntas frequentes",
    items: [
      { q: "Como assinar um PDF?", a: "Envie o PDF, desenhe ou digite sua assinatura, escolha a página, posição e tamanho e clique em Assinar e baixar. Você obtém um novo arquivo chamado …-signed.pdf." },
      { q: "Meu arquivo é enviado?", a: "Não. Tudo ocorre no seu navegador — a página é renderizada e sua assinatura é carimbada no PDF localmente. Seu arquivo nunca sai do dispositivo e nada é enviado a um servidor." },
      { q: "Posso desenhar minha assinatura ou só digitá-la?", a: "As duas opções funcionam. Desenhe com mouse ou dedo no painel, ou mude para Digitar para renderizar seu nome em fonte caligráfica. Clique em Limpar para refazer uma assinatura desenhada." },
      { q: "Há limite de tamanho? Tem custo?", a: "Gratuito, sem cadastro. Sem limite fixo de tamanho, mas como tudo é processado em memória, PDFs muito grandes dependem da RAM do dispositivo — um arquivo enorme pode ficar lento em um celular ou notebook mais antigo." },
      { q: "Onde fica a assinatura e há pontos a saber?", a: "Posicionada em uma de nove âncoras (cantos, bordas, centro) e redimensionada pelo controle de tamanho — não é possível arrastar para um pixel exato. É carimbada em uma página de cada vez; repita para cada página. PDFs criptografados precisam ser desbloqueados primeiro." },
      { q: "Isso conta como assinatura eletrônica legal?", a: "A assinatura é carimbada na página como imagem, não como assinatura digital baseada em certificado. Assinaturas eletrônicas digitadas e desenhadas são aceitas em muitos documentos do dia a dia, mas verifique os requisitos específicos do seu caso." },
    ],
  },
  "reorder-pages": {
    title: "Reordenar páginas de PDF — perguntas frequentes",
    items: [
      { q: "Como reordenar páginas de um PDF?", a: "Envie o PDF, arraste as miniaturas para a ordem desejada e clique em Aplicar e baixar. Sem digitar números de página — você organiza visualmente." },
      { q: "Posso excluir páginas ao mesmo tempo?", a: "Sim. Clique no ✕ de qualquer miniatura para remover essa página e depois baixe. Reordenar e remover páginas acontecem na mesma etapa." },
      { q: "Meu arquivo é enviado?", a: "Não. Tudo é executado localmente no seu navegador — seu PDF nunca é enviado e nunca sai do seu dispositivo." },
      { q: "Há limite de tamanho ou de páginas?", a: "Sem limite fixo. PDFs muito grandes dependem apenas da memória do dispositivo, pois todo o trabalho ocorre na sua máquina." },
      { q: "Reordenar reduz a qualidade?", a: "Não. As páginas mantêm conteúdo e resolução originais — apenas a ordem muda, nada é re-renderizado ou comprimido." },
      { q: "É gratuito? Precisa de conta?", a: "Completamente gratuito, sem cadastro." },
    ],
  },
  "delete-page": {
    title: "Excluir páginas de PDF — perguntas frequentes",
    items: [
      { q: "Como excluir páginas de um PDF?", a: "Envie o PDF, clique nas páginas que deseja remover (ficam vermelhas com ✕) e clique em Excluir e baixar. Um contador mostra quantas serão excluídas e quantas restam." },
      { q: "E se eu marcar a página errada?", a: "Clique novamente para mantê-la — a marcação vermelha e o ✕ desaparecem. Você pode marcar e desmarcar quantas vezes quiser antes de baixar." },
      { q: "Meu arquivo é enviado?", a: "Não. Tudo é processado no seu navegador usando a memória do dispositivo — seu PDF nunca é enviado a um servidor e nunca sai do seu dispositivo." },
      { q: "Há limite de tamanho?", a: "Sem limite fixo. Como o trabalho acontece localmente, o limite prático é a memória do dispositivo — PDFs muito grandes ou com muitas imagens podem ficar lentos em máquinas de entrada." },
      { q: "O que recebo de volta?", a: "Um novo PDF sem as páginas marcadas, baixado como «seuarquivo-pages-removed.pdf». As demais páginas mantêm conteúdo e ordem originais; o arquivo original não é alterado. É necessário manter ao menos uma página." },
      { q: "É gratuito?", a: "Sim — completamente gratuito, sem cadastro ou conta necessária." },
    ],
  },
  "rotate-page": {
    title: "Rotacionar páginas de PDF — perguntas frequentes",
    items: [
      { q: "Como rotacionar páginas de um PDF?", a: "Envie o PDF e clique em uma página para girá-la 90° no sentido horário. Clique novamente na mesma página para 180°, 270° e de volta. Ou clique em Rotacionar todas 90° para girar todas de uma vez e depois baixe." },
      { q: "Posso rotacionar só uma página ou definir ângulos diferentes por página?", a: "Sim. Cada página gira independentemente — você pode corrigir uma única digitalização torta ou definir ângulos diferentes para cada página; apenas as páginas que você clicar mudam." },
      { q: "Meu arquivo é enviado?", a: "Não. Tudo é executado localmente no seu navegador — a rotação é gravada no PDF no seu dispositivo e o arquivo nunca é enviado a um servidor." },
      { q: "Há limite de tamanho ou de páginas?", a: "Não impomos limite fixo. Como tudo ocorre no navegador, o teto prático depende da memória do dispositivo — PDFs muito grandes podem ficar lentos em celulares ou tablets com pouca memória." },
      { q: "Rotacionar perde qualidade ou altera o conteúdo?", a: "Não. A rotação apenas define o sinalizador de orientação de cada página — texto, imagens e resolução ficam exatamente iguais. Nada é re-renderizado ou comprimido." },
      { q: "É gratuito? Precisa de conta?", a: "Completamente gratuito, sem cadastro. Abra a página, rotacione e baixe." },
    ],
  },
  "add-page": {
    title: "Inserir páginas em um PDF — perguntas frequentes",
    items: [
      { q: "Como inserir páginas em um PDF?", a: "Envie seu PDF, clique onde deseja inserir (no início ou após uma página específica), escolha o arquivo para inserir e clique em Inserir e baixar." },
      { q: "O que posso inserir?", a: "Outro PDF (todas as suas páginas são inseridas naquele ponto) ou uma imagem PNG/JPG, que é adicionada como uma nova página." },
      { q: "Meu arquivo é enviado?", a: "Não. Tudo é executado localmente no seu navegador com pdf-lib — seus arquivos nunca saem do dispositivo e nada é enviado a um servidor." },
      { q: "O que recebo de volta?", a: "Um único PDF novo com as páginas inseridas, baixado como «<seuarquivo>-with-insert.pdf». Seu arquivo original não é alterado." },
      { q: "Há limite de tamanho?", a: "Sem limite fixo, mas como tudo ocorre no navegador, PDFs muito grandes dependem da memória do dispositivo. Se um arquivo enorme tiver dificuldades, tente um menor." },
      { q: "É gratuito?", a: "Sim — completamente gratuito, sem cadastro ou conta necessária." },
    ],
  },
  "watermark-pdf": {
    title: "Adicionar marca d'água a um PDF — perguntas frequentes",
    items: [
      { q: "Como adicionar marca d'água a um PDF?", a: "Envie o PDF, crie uma marca d'água de texto ou imagem e ajuste posição, opacidade e rotação acompanhando a pré-visualização ao vivo. Escolha quais páginas carimbar e clique em Aplicar e baixar." },
      { q: "Posso usar imagem ou logotipo em vez de texto?", a: "Sim. Mude para o modo Imagem para usar um logotipo ou imagem como marca d'água. Em qualquer modo você pode ajustar posição, opacidade e rotação." },
      { q: "Carimba em todas as páginas?", a: "Você decide. A marca d'água vai nas páginas que você selecionar — pode marcar o documento inteiro ou apenas páginas específicas." },
      { q: "Meus arquivos são enviados?", a: "Não. A marca d'água é aplicada diretamente no seu navegador — seu PDF nunca sai do dispositivo e nada é enviado a um servidor." },
      { q: "Há limite de tamanho?", a: "Sem limite fixo. Como tudo é executado localmente, PDFs muito grandes são limitados apenas pela memória do dispositivo — na maioria das máquinas isso é suficiente." },
      { q: "É gratuito? Precisa de conta?", a: "Gratuito, sem cadastro. Abra a página, adicione seu PDF e baixe o arquivo com marca d'água." },
    ],
  },
  "page-numbers": {
    title: "Adicionar números de página a um PDF — perguntas frequentes",
    items: [
      { q: "Como adicionar números de página a um PDF?", a: "Envie o PDF, escolha posição (topo ou rodapé, esquerda/centro/direita), formato e número inicial, e defina o intervalo de páginas. A pré-visualização ao vivo mostra o resultado; em seguida, clique em Adicionar números e baixar." },
      { q: "Meu arquivo é enviado?", a: "Não. Tudo é executado localmente — o PDF é lido, numerado e salvo no seu dispositivo. Nunca é enviado a um servidor e nunca sai do seu computador." },
      { q: "Quais formatos e posições posso usar?", a: "Quatro formatos: só o número (1), Página 1, 1 / N, ou 1 de N. Seis posições: topo ou rodapé, com esquerda, centro ou direita. Também há opção de margem pequena/média/grande." },
      { q: "Posso começar de um número específico ou numerar só parte do documento?", a: "Sim. Use Começar em para o primeiro número (útil quando a capa não deve contar) e use o intervalo de/até para numerar apenas parte do documento. A contagem continua ao longo do intervalo que você escolher." },
      { q: "Há limite de tamanho?", a: "Sem limite fixo. Como o trabalho acontece no navegador, PDFs muito grandes são limitados pela memória do dispositivo — na maioria das máquinas os documentos típicos passam sem problema." },
      { q: "É gratuito? Precisa de conta?", a: "Sim, completamente gratuito e sem cadastro. Basta abrir a página e começar." },
    ],
  },
  "images-to-pdf": {
    title: "Imagens para PDF — perguntas frequentes",
    items: [
      { q: "Como converto imagens em PDF?", a: "Adicione suas imagens, arraste as miniaturas para a ordem desejada e clique em Converter para PDF. Cada imagem se torna uma página, de cima para baixo, em um único arquivo que você pode baixar." },
      { q: "Quais formatos de imagem são compatíveis?", a: "JPG, PNG, WebP, GIF e BMP. HEIC (o formato que iPhones geralmente usam para salvar fotos) ainda não é compatível — converta-as para JPG primeiro ou altere a configuração da câmera do iPhone para «Mais Compatível»." },
      { q: "Posso combinar muitas imagens em um único PDF?", a: "Sim. Adicione quantas quiser e arraste para reordenar — elas são mescladas em um único PDF exatamente nessa ordem, uma imagem por página." },
      { q: "Minhas imagens são enviadas para algum lugar?", a: "Não. Tudo é executado localmente no seu navegador — o PDF é gerado no seu dispositivo e suas imagens nunca são enviadas a um servidor nem armazenadas em lugar algum." },
      { q: "Há limite de tamanho ou quantidade de arquivos?", a: "Não há limite fixo. Como tudo acontece no seu dispositivo, o teto prático é a memória do seu dispositivo — imagens de alta resolução muito grandes ou muito numerosas podem deixar um celular mais antigo ou notebook com pouca RAM mais lento." },
      { q: "É gratuito? Preciso de conta?", a: "Sim, é completamente gratuito, sem cadastro, sem marca d'água e sem necessidade de e-mail. Basta abrir a página e começar." },
    ],
  },
  "pdf-to-png": {
    title: "PDF para PNG — perguntas frequentes",
    items: [
      { q: "Como converto um PDF em PNG?", a: "Solte um PDF e cada página aparece como uma miniatura. Clique nas páginas para incluir ou excluir (ou use Selecionar tudo / Selecionar nenhuma), confirme que PNG está selecionado e clique em Converter e baixar. Uma única página é baixada como um PNG; várias páginas são agrupadas em um ZIP." },
      { q: "Meu PDF é enviado para algum lugar?", a: "Não. Tudo é executado no seu navegador — o PDF é lido e renderizado em PNG localmente e o download é gerado no seu dispositivo. Nada é enviado a um servidor, então seu arquivo nunca sai da sua máquina." },
      { q: "Por que escolher PNG em vez de JPG?", a: "PNG é sem perdas, então mantém texto, arte linear, diagramas e capturas de tela nítidos, sem artefatos de compressão, e suporta transparência. Os arquivos JPG são menores e bons para fotos, mas suavizam detalhes finos e não podem ser transparentes." },
      { q: "Há limite de tamanho ou de páginas?", a: "Não há limite fixo e não precisa de cadastro. Como tudo é processado no seu navegador, o limite real é a memória do dispositivo — PDFs muito grandes ou com muitas páginas usam mais RAM e demoram mais, especialmente em celulares ou máquinas mais antigas." },
      { q: "Não abre meu PDF — o que há de errado?", a: "A causa mais comum é um PDF protegido por senha ou criptografado, que a ferramenta não consegue ler; remova a senha primeiro e tente novamente. A saída é renderizada em 2× para imagens nítidas, mas ainda é uma imagem — o texto vira pixels, então você não pode selecioná-lo ou pesquisá-lo depois." },
      { q: "PDF para PNG é gratuito?", a: "Sim — completamente gratuito, sem conta, sem marca d'água, sem limite em quantas vezes você usa." },
    ],
  },
  "pdf-to-image": {
    title: "PDF para imagem — perguntas frequentes",
    items: [
      { q: "Como converto um PDF em JPG ou PNG?", a: "Solte um PDF e cada página aparece como uma miniatura. Clique nas páginas para incluir ou excluir (ou use Selecionar tudo / Selecionar nenhuma), escolha JPG ou PNG e clique em Converter e baixar. Uma única página é baixada como uma imagem; várias páginas são agrupadas em um ZIP." },
      { q: "Meu PDF é enviado para algum lugar?", a: "Não. Tudo é executado no seu navegador — o PDF é lido e renderizado em imagens localmente e o download é gerado no seu dispositivo. Nada é enviado a um servidor, então seu arquivo nunca sai da sua máquina." },
      { q: "JPG ou PNG — qual devo escolher?", a: "PNG é sem perdas, então é melhor para texto nítido, arte linear e capturas de tela. Os arquivos JPG são menores e bons para fotos e digitalizações. Uma coisa a saber: JPG não pode ser transparente, então áreas transparentes de uma página ficam com fundo branco." },
      { q: "Há limite de tamanho ou de páginas?", a: "Não há limite fixo e não precisa de cadastro. Como tudo é processado no seu navegador, o limite real é a memória do dispositivo — PDFs muito grandes ou com muitas páginas usam mais RAM e demoram mais, especialmente em celulares ou máquinas mais antigas." },
      { q: "Não abre meu PDF — o que há de errado?", a: "A causa mais comum é um PDF protegido por senha ou criptografado, que a ferramenta não consegue ler; remova a senha primeiro e tente novamente. A saída é renderizada em 2× para imagens nítidas, mas ainda é uma imagem — o texto vira pixels, então você não pode selecioná-lo ou pesquisá-lo depois." },
      { q: "É gratuito?", a: "Sim — completamente gratuito, sem conta, sem marca d'água, sem limite em quantas vezes você usa." },
    ],
  },
  "redact-pdf": {
    title: "Redigir PDF — perguntas frequentes",
    items: [
      { q: "Como redigir um PDF?", a: "Solte seu PDF na página e o DockDocs renderiza cada página no seu navegador. Arraste uma caixa sobre o que quiser ocultar — um nome, número de conta, assinatura. O DockDocs também verifica automaticamente itens sensíveis (e-mails, telefones, CPF, números de cartão, IPs) e os pré-marca; revise e clique no ✕ de qualquer caixa que não quiser. Clique em Aplicar e baixar para obter a cópia redigida." },
      { q: "O texto é realmente removido ou apenas coberto por uma caixa preta?", a: "Realmente removido. Muitas «redações» apenas colocam um retângulo preto por cima — o texto original ainda está no arquivo e alguém pode copiá-lo ou apagar a caixa. O DockDocs re-renderiza cada página como uma imagem plana com as áreas pretas gravadas, destruindo o texto subjacente permanentemente. É exatamente isso que torna o resultado seguro para compartilhar." },
      { q: "Meus arquivos são enviados?", a: "Não. Tudo acontece no seu navegador no seu próprio dispositivo — abertura do PDF, desenho das caixas e geração da cópia redigida, tudo localmente. Seu arquivo nunca é enviado a um servidor e nunca sai do seu computador, então é adequado para documentos confidenciais ou regulados." },
      { q: "Há limites? É gratuito?", a: "Completamente gratuito, sem conta, e-mail ou instalação necessária. Sem limite fixo de tamanho, mas PDFs muito grandes dependem da memória do dispositivo. O único limite rígido é a contagem de páginas: até 30 páginas por documento — se o seu for mais longo, divida-o primeiro e redigir cada parte." },
      { q: "Como é o arquivo de saída?", a: "Você obtém um PDF novo onde cada página é uma imagem achatada (cerca de 158 DPI — limpa e legível). Como as páginas agora são imagens, o conteúdo redigido desaparece permanentemente e o restante do texto não pode mais ser selecionado ou pesquisado. Essa troca é exatamente o objetivo: texto que você não pode selecionar é texto que não pode ser recuperado." },
      { q: "Devo confiar nas caixas detectadas automaticamente por si só?", a: "Trate-as como ponto de partida, não como garantia. A verificação automática captura padrões comuns como e-mails e números, mas pode perder coisas em formatos incomuns e não conhecerá segredos específicos do contexto que só você pode reconhecer. Sempre leia as páginas você mesmo e arraste caixas sobre qualquer coisa que o detector não sinalizou antes de baixar." },
    ],
  },
  "translate-pdf": {
    title: "Traduzir um PDF — perguntas frequentes",
    items: [
      { q: "Como traduzir um PDF?", a: "Envie o PDF, escolha o idioma de destino na lista e clique em Traduzir. O texto é extraído do arquivo e traduzido pela IA; em seguida, você pode copiá-lo ou baixá-lo como arquivo .txt." },
      { q: "Meu arquivo é enviado? É privado?", a: "O PDF é lido diretamente no seu navegador — o arquivo em si nunca sai do dispositivo. Apenas o texto simples extraído é enviado à IA para traduzir. O documento original, formatação e imagens nunca são enviados." },
      { q: "Há limite de tamanho?", a: "Sim — cerca de 14.000 caracteres por execução, aproximadamente 10 páginas. Se o documento for mais longo, divida em partes menores e traduza uma de cada vez." },
      { q: "Para quais idiomas posso traduzir?", a: "Mais de 18, incluindo inglês, chinês simplificado e tradicional, espanhol, francês, alemão, japonês, coreano, português, italiano, russo, árabe, hindi e mais. A ferramenta detecta automaticamente o idioma de origem, então você só escolhe o destino." },
      { q: "Mantém o layout original? O que recebo de volta?", a: "Ainda não — esta versão traduz apenas o conteúdo de texto e fornece o texto traduzido para copiar ou baixar. A tradução com preservação de layout está no roteiro. Observação: se o PDF for uma digitalização ou imagem sem texto selecionável, não há nada para extrair — execute o OCR primeiro." },
      { q: "É gratuito? Posso confiar para documentos legais?", a: "Sim, é gratuito. A tradução por IA é ótima para entender um documento e obter um bom rascunho inicial, mas não é uma tradução certificada — para fins legais ou oficiais, peça a um profissional qualificado para revisá-la." },
    ],
  },
  "extract-to-excel": {
    title: "Extrair dados de PDF para planilha — perguntas frequentes",
    items: [
      { q: "Como extraio dados de PDFs para uma planilha?", a: "Solte suas faturas, orçamentos ou contratos (ou selecione uma pasta inteira para processar em lote), escolha o tipo de documento e clique em Extrair. A IA extrai os campos principais — totais, datas, partes, termos — em uma tabela que você pode baixar como CSV para abrir no Excel, Google Sheets ou Numbers. É gratuito." },
      { q: "Meus arquivos são enviados a um servidor?", a: "O PDF em si nunca sai do seu dispositivo — é lido no seu navegador. Apenas o texto simples extraído é enviado à IA para organizar em colunas; o arquivo original, com seu layout e imagens, fica local. Se essa etapa de envio de texto for um problema para contratos sensíveis, vale saber disso antecipadamente." },
      { q: "Como sei se os números estão certos?", a: "Cada valor é marcado com a frase exata de onde veio no documento original, para que você possa verificar rapidamente. Se a IA não encontrar um campo com clareza, deixa a célula em branco em vez de adivinhar — e descartamos qualquer citação de origem que não apareça realmente no seu arquivo, então nada é fabricado." },
      { q: "Quais são os limites?", a: "Até 8 documentos de uma vez, e o texto combinado chega a cerca de 60.000 caracteres — aproximadamente uma pilha de faturas normais, não um contrato mestre de 200 páginas. Para lotes grandes, processe em algumas rodadas." },
      { q: "Não extraiu nada — o que aconteceu?", a: "Quase sempre é um PDF digitalizado ou fotografado. Se o texto não for selecionável em um leitor de PDF normal, não há nada para o navegador ler e a IA recebe uma página em branco. Execute o OCR primeiro. PDFs protegidos por senha também não podem ser lidos até serem desbloqueados." },
      { q: "Quais documentos funcionam melhor?", a: "Papelada estruturada com campos consistentes — faturas, orçamentos e contratos — onde cada campo predefinido (fornecedor, total, data de vencimento, condições de pagamento, etc.) está realmente impresso no documento. Cartas de formato livre ou layouts incomuns deixarão mais células em branco." },
    ],
  },
  "redline": {
    title: "Comparar versões de PDF (linha vermelha) — perguntas frequentes",
    items: [
      { q: "Como comparo duas versões de PDF?", a: "Envie o PDF original (v1) e o revisado (v2) e clique em Comparar versões. O DockDocs alinha o texto e exibe uma única visão marcada — texto adicionado é destacado em verde, texto removido é tachado em vermelho, como o controle de alterações." },
      { q: "Meus arquivos são enviados para algum lugar?", a: "Não. É uma ferramenta do lado do cliente: o texto é extraído e comparado inteiramente no seu navegador, então seus arquivos nunca saem do seu dispositivo. Nada é enviado a um servidor." },
      { q: "Detecta frases reformuladas?", a: "Compara frase por frase, então marca quais frases foram adicionadas e quais foram removidas. Uma pequena reformulação aparece como uma exclusão mais uma adição, em vez de uma mudança no nível da palavra dentro da frase." },
      { q: "O que compara exatamente — verifica formatação ou imagens?", a: "Apenas o texto extraído. Fontes, layout, cores, imagens e tabelas não fazem parte da comparação, e PDFs digitalizados sem uma camada de texto real não produzirão resultados úteis. Se relatar nenhuma mudança de texto, a redação é idêntica mesmo que o visual tenha mudado." },
      { q: "Qual pode ser o tamanho dos documentos?", a: "Toda a comparação é executada no seu navegador, então é ajustada para documentos de até alguns milhares de frases (limite de 2.500 frases por arquivo). Contratos ou livros muito longos podem ser truncados ou demorar." },
      { q: "É gratuito?", a: "Sim — comparar versões é completamente gratuito, sem cadastro e sem limite no número de comparações." },
    ],
  },
};

const FAQS_FR: Record<string, { title: string; items: Array<{ q: string; a: string }> }> = {
  "chat-with-pdf": {
    title: "Chat avec PDF — foire aux questions",
    items: [
      { q: "Comment ça marche ?", a: "Importez un PDF basé sur du texte et DockDocs en extrait le texte dans votre navigateur ; vous posez ensuite des questions et l'IA répond en s'appuyant sur le contenu de ce document — et non sur des connaissances générales du web. Un document à la fois, jusqu'à 12 pages / 40 000 caractères / 25 Mo par fichier." },
      { q: "Puis-je faire confiance aux réponses ? Sont-elles fondées sur mon document ?", a: "Les réponses sont fondées sur le texte extrait de votre PDF et, lorsque la réponse de l'IA correspond à des passages de votre fichier, ceux-ci s'affichent sous une mention « ✓ vérifié dans la source » avec les citations exactes, pour que vous puissiez les contrôler vous-même. Les citations dépendent de ce que renvoie le modèle et n'apparaissent pas pour chaque réponse ; de plus, l'IA peut se tromper — pour tout élément important, vérifiez dans le document original." },
      { q: "Mon PDF est-il téléversé ou stocké ?", a: "Le texte est extrait dans votre navigateur ; seul ce texte extrait est envoyé au fournisseur d'IA pour répondre à votre question, et le fichier lui-même ne quitte jamais votre appareil et n'est pas conservé ensuite." },
      { q: "Quels PDF fonctionnent ?", a: "Les PDF basés sur du texte (nés numériquement). Les PDF scannés n'ont pas de texte sélectionnable — lancez d'abord l'OCR pour que le chat ait quelque chose à lire. Fonctionne en français, anglais, espagnol, portugais et plus ; les réponses suivent la langue de votre question." },
      { q: "Y a-t-il des limites ?", a: "DockDocs limite chaque fichier à 25 Mo, 12 pages et 40 000 caractères de texte extrait ; pour les documents plus longs, divisez-les ou compressez-les d'abord. Un quota quotidien gratuit s'applique — passez à une formule supérieure si besoin." },
    ],
  },
  "govbid-matrix": {
    title: "Matrice de conformité pour appels d'offres publics — foire aux questions",
    items: [
      { q: "Qu'extrait-il ?", a: "Il lit un appel d'offres, un cahier des charges ou un marché et regroupe chaque exigence contraignante « shall/must/will » dans une matrice de conformité numérotée : chaque ligne indique l'exigence, sa référence de section, la page et si elle est obligatoire ou recommandée. Vous pouvez filtrer les exigences obligatoires uniquement et exporter toute la matrice en CSV pour l'intégrer directement à votre suivi de réponse à l'offre." },
      { q: "Puis-je relier chaque exigence à l'appel d'offres d'origine ?", a: "Oui — c'est tout l'intérêt. Chaque ligne cite le texte source exact et indique sa section et sa page, afin que vous vérifiiez chaque exigence dans le document original avant de vous y engager dans votre offre. Si l'IA renvoie une citation que nous ne trouvons pas dans votre fichier, nous l'étiquetons « Citation non vérifiable » plutôt que d'afficher une référence fabriquée. Rien n'est inventé ; ce que vous ne pouvez pas tracer, vous voyez que vous ne pouvez pas le tracer." },
      { q: "Cela remplace-t-il la lecture de l'appel d'offres moi-même ?", a: "Non. C'est un premier passage rapide pour s'assurer qu'aucun « shall/must » n'échappe — ce n'est ni une garantie d'exhaustivité, ni un conseil de conformité ou juridique. La conformité de votre offre reste votre responsabilité ; lisez toujours l'appel d'offres en entier et considérez comme contraignant tout ce que l'outil omet." },
      { q: "Mon appel d'offres est-il téléversé ou stocké ?", a: "Votre fichier est lu dans votre navigateur ; seul le texte extrait est envoyé pour analyse, et il n'est pas conservé ensuite. Le fichier lui-même ne quitte jamais votre appareil — ce qui compte pour les marchés confidentiels et avant attribution." },
      { q: "Quels documents fonctionnent le mieux ?", a: "Les PDF basés sur du texte (nés numériquement). Les appels d'offres scannés n'ont pas de texte sélectionnable — lancez d'abord l'OCR. Fonctionne en français, anglais, espagnol, portugais et plus ; les citations restent dans la langue originale du document." },
    ],
  },
  "contract-risk": {
    title: "Analyse de risques du contrat — foire aux questions",
    items: [
      { q: "Que vérifie-t-il ?", a: "Il analyse votre contrat à la recherche de clauses méritant une seconde lecture : renouvellement automatique, résiliation ou modification unilatérale, responsabilité illimitée/non plafonnée, pénalités et frais de retard, pièges de paiement et coûts cachés, clause de non-concurrence excessive, et protections standard manquantes (absence de plafond de responsabilité, par exemple). Chaque constat est signalé en rouge (élevé), orange (moyen) ou vert (faible), cité de votre contrat, avec une explication en langage clair et ce qu'il convient de demander avant de signer." },
      { q: "Est-ce un conseil juridique ?", a: "Non. Il s'agit d'une analyse automatisée pour aider un non-juriste à repérer les clauses qui méritent attention — ce n'est pas un conseil juridique et cela ne remplace pas un avocat. Pour tout contrat important ou à fort enjeu, faites-le examiner par un avocat qualifié. L'absence de signalement ne garantit pas que le contrat est sûr." },
      { q: "Invente-t-il des clauses ou des citations ?", a: "Chaque citation est vérifiée par rapport au texte réel de votre contrat — si l'IA renvoie une citation que nous ne trouvons pas dans votre document, nous la supprimons plutôt que d'afficher une référence fabriquée. Les risques liés aux clauses manquantes sont affichés sans citation et clairement étiquetés. L'IA peut néanmoins passer des éléments à côté, lisez donc toujours l'intégralité du contrat." },
      { q: "Mon contrat est-il téléversé ou stocké ?", a: "Votre contrat est lu dans votre navigateur ; seul le texte extrait est envoyé pour analyse, et il n'est pas conservé ensuite. Le fichier lui-même ne quitte jamais votre appareil." },
      { q: "Quels contrats fonctionnent le mieux ?", a: "Les PDF basés sur du texte (nés numériquement). Les contrats scannés n'ont pas de texte sélectionnable — lancez d'abord l'OCR. Fonctionne en français, anglais, espagnol et plus ; les citations restent dans la langue originale du contrat." },
    ],
  },
  "lease-redflag": {
    title: "Analyse des risques du bail — foire aux questions",
    items: [
      { q: "Que signale-t-il ?", a: "Il analyse votre bail à la recherche de clauses susceptibles de vous nuire en tant que locataire : révision agressive des loyers, pénalités sévères en cas de résiliation anticipée, droits d'accès déraisonnables du propriétaire, répartition des charges d'entretien peu claire, déductions excessives sur le dépôt de garantie, restrictions de sous-location, charges de maintien injustes et protections standard absentes (pas de délai de grâce, pas de garantie d'habitabilité, pas de droit de régularisation avant expulsion). Chaque constat est signalé en rouge, orange ou vert, avec citation et ce qu'il convient de demander ou de négocier." },
      { q: "Est-ce un conseil juridique ?", a: "Non. Il s'agit d'une analyse automatisée pour aider les locataires à repérer les clauses méritant attention — ce n'est pas un conseil juridique et cela ne remplace pas un avocat ou une association de défense des locataires. Pour tout point important, consultez un avocat qualifié. L'absence de signalement ne garantit pas que le bail est équitable." },
      { q: "Invente-t-il des citations ?", a: "Chaque citation est vérifiée par rapport au texte réel de votre bail — si l'IA renvoie une citation que nous ne trouvons pas dans votre document, nous la supprimons. Les risques liés aux clauses manquantes sont affichés sans citation et clairement étiquetés." },
      { q: "Mon bail est-il téléversé ou stocké ?", a: "Votre bail est lu dans votre navigateur ; seul le texte extrait est envoyé pour analyse, et il n'est pas conservé ensuite. Le fichier lui-même ne quitte jamais votre appareil." },
      { q: "Quels formats fonctionnent ?", a: "Les PDF basés sur du texte (nés numériquement). Les baux scannés nécessitent d'abord un OCR. Fonctionne en français, anglais, espagnol et plus ; les citations restent dans la langue originale du bail." },
    ],
  },
  "batch-translate": {
    title: "Traduire des documents — foire aux questions",
    items: [
      { q: "Comment traduire plusieurs PDF à la fois ?", a: "Déposez vos PDF sur la page — ou un dossier entier — choisissez la langue cible, puis cliquez sur Tout traduire. Chaque PDF est lu dans votre navigateur, son texte est traduit un par un, et vous les téléchargez tous dans un seul ZIP de fichiers .txt." },
      { q: "Dans quelles langues puis-je traduire ?", a: "13 langues, dont l'anglais, le chinois simplifié et traditionnel, l'espagnol, le français, l'allemand, le japonais, le coréen, le portugais, l'italien, le russe, l'arabe et le hindi. L'ensemble du lot est traduit dans la langue que vous choisissez." },
      { q: "Que reçois-je — la mise en page est-elle conservée ?", a: "Vous recevez du texte brut (.txt), un fichier par PDF, compressés ensemble. La traduction est en texte uniquement, donc la mise en page originale, les images et la mise en forme ne sont pas conservées. C'est idéal pour lire et réutiliser le contenu, pas pour produire une copie mise en forme." },
      { q: "Y a-t-il une limite et que se passe-t-il avec les PDF scannés ?", a: "Jusqu'à 10 PDF par lot, chacun contenant jusqu'à environ 10 pages (14 000 caractères) de texte. Les PDF scannés n'ont pas de texte sélectionnable — lancez d'abord l'OCR ; sinon ils sont ignorés avec une note." },
      { q: "Est-ce privé et gratuit ?", a: "Chaque PDF est lu dans votre navigateur et seul le texte extrait — jamais le fichier — est envoyé pour traduction. C'est gratuit ; la traduction est comptabilisée dans votre limite d'utilisation quotidienne de l'IA, qui se remet à zéro chaque jour." },
    ],
  },
  "batch-office-to-pdf": {
    title: "Office en PDF par lot — foire aux questions",
    items: [
      { q: "Comment convertir plusieurs fichiers Office en PDF à la fois ?", a: "Déposez vos fichiers Word, PowerPoint et Excel sur la page — ou un dossier entier — puis cliquez sur Tout convertir. Chaque fichier est converti en PDF l'un après l'autre et, une fois terminé, cliquez sur Télécharger le ZIP pour tout obtenir dans une seule archive." },
      { q: "Quels formats puis-je convertir ?", a: "Word (.doc, .docx), PowerPoint (.ppt, .pptx), Excel (.xls, .xlsx), ainsi qu'OpenDocument (.odt, .odp, .ods) et .rtf. Le type de fichier est détecté automatiquement, vous pouvez donc mélanger documents, présentations et feuilles de calcul dans le même lot." },
      { q: "Le PDF sera-t-il exactement identique à l'original ?", a: "La conversion utilise LibreOffice — le même moteur que nos outils Office en PDF pour fichier unique. Pour les documents courants, le résultat est fidèle, mais les polices inhabituelles, les macros ou les mises en page très complexes peuvent légèrement différer ; vérifiez tout ce qui est sensible à la mise en forme." },
      { q: "Y a-t-il une limite de taille ou de nombre ?", a: "Jusqu'à 20 fichiers par lot, chacun jusqu'à 5 Mo. Pour un fichier supérieur à 5 Mo, utilisez l'outil fichier unique Word en PDF, PPT en PDF ou Excel en PDF, qui gère les fichiers plus volumineux." },
      { q: "Mes fichiers sont-ils téléversés ? Est-ce gratuit ?", a: "C'est gratuit et sans compte. La conversion Office s'effectue sur notre propre serveur, donc chaque fichier y est envoyé, converti en PDF et renvoyé — il n'est ni stocké ni conservé après coup." },
    ],
  },
  "batch-word-to-pdf": {
    title: "Word en PDF par lot — foire aux questions",
    items: [
      { q: "Comment convertir plusieurs fichiers Word en PDF à la fois ?", a: "Déposez vos fichiers Word sur la page — ou un dossier entier — puis cliquez sur Tout convertir. Chaque .doc ou .docx est converti en PDF l'un après l'autre et, une fois terminé, cliquez sur Télécharger le ZIP pour tout obtenir dans une seule archive." },
      { q: "Quels formats Word sont pris en charge ?", a: "Le .docx moderne comme le .doc plus ancien, ainsi qu'OpenDocument texte (.odt) et .rtf. Pour des lots mixtes de Word, PowerPoint et Excel ensemble, utilisez plutôt l'outil général Office en PDF." },
      { q: "Le PDF sera-t-il exactement identique à l'original ?", a: "La conversion utilise LibreOffice — le même moteur que notre outil fichier unique Word en PDF. Pour les documents courants, le résultat est fidèle, mais les polices inhabituelles, les macros ou les mises en page très complexes peuvent légèrement différer ; vérifiez tout ce qui est sensible à la mise en forme." },
      { q: "Y a-t-il une limite de taille ou de nombre ?", a: "Jusqu'à 20 fichiers par lot, chacun jusqu'à 5 Mo. Pour un fichier Word supérieur à 5 Mo, utilisez l'outil fichier unique Word en PDF, qui gère les fichiers plus volumineux." },
      { q: "Mes fichiers sont-ils téléversés ? Est-ce gratuit ?", a: "C'est gratuit et sans compte. La conversion Office s'effectue sur notre propre serveur, donc chaque fichier y est envoyé, converti en PDF et renvoyé — il n'est ni stocké ni conservé après coup." },
    ],
  },
  "batch-excel-to-pdf": {
    title: "Excel en PDF par lot — foire aux questions",
    items: [
      { q: "Comment convertir plusieurs fichiers Excel en PDF à la fois ?", a: "Déposez vos feuilles de calcul sur la page — ou un dossier entier — puis cliquez sur Tout convertir. Chaque .xls ou .xlsx est converti en PDF l'un après l'autre et, une fois terminé, cliquez sur Télécharger le ZIP pour tout obtenir dans une seule archive." },
      { q: "Quels formats de feuille de calcul sont pris en charge ?", a: "Le .xlsx moderne comme le .xls plus ancien, ainsi que les feuilles de calcul OpenDocument (.ods). Pour des lots mixtes de Word, PowerPoint et Excel ensemble, utilisez plutôt l'outil général Office en PDF." },
      { q: "Les feuilles larges tiennent-elles sur la page ?", a: "La conversion utilise LibreOffice et respecte la zone d'impression et la mise en page de chaque feuille, de sorte que les feuilles très larges peuvent se répartir sur plusieurs pages, comme à l'impression. Définissez d'abord la zone d'impression ou la mise à l'échelle dans Excel si vous voulez tout sur une seule page." },
      { q: "Y a-t-il une limite de taille ou de nombre ?", a: "Jusqu'à 20 fichiers par lot, chacun jusqu'à 5 Mo. Pour un fichier Excel supérieur à 5 Mo, utilisez l'outil fichier unique Excel en PDF, qui gère les fichiers plus volumineux." },
      { q: "Mes fichiers sont-ils téléversés ? Est-ce gratuit ?", a: "C'est gratuit et sans compte. La conversion Office s'effectue sur notre propre serveur, donc chaque fichier y est envoyé, converti en PDF et renvoyé — il n'est ni stocké ni conservé après coup." },
    ],
  },
  "batch-ppt-to-pdf": {
    title: "PowerPoint en PDF par lot — foire aux questions",
    items: [
      { q: "Comment convertir plusieurs fichiers PowerPoint en PDF à la fois ?", a: "Déposez vos fichiers PowerPoint sur la page — ou un dossier entier — puis cliquez sur Tout convertir. Chaque .ppt ou .pptx est converti en PDF l'un après l'autre et, une fois terminé, cliquez sur Télécharger le ZIP pour tout obtenir dans une seule archive." },
      { q: "Quels formats PowerPoint sont pris en charge ?", a: "Le .pptx moderne comme le .ppt plus ancien, ainsi que les présentations OpenDocument (.odp). Pour des lots mixtes de Word, PowerPoint et Excel ensemble, utilisez plutôt l'outil général Office en PDF." },
      { q: "Comment les diapositives apparaissent-elles dans le PDF ?", a: "Chaque diapositive devient une page PDF entière, dans l'ordre, grâce à LibreOffice — le même moteur que notre outil fichier unique PPT en PDF. Les notes de l'intervenant et les animations ne sont pas incluses ; le PDF capture l'aspect final de chaque diapositive. Les polices inhabituelles ou les mises en page très complexes peuvent légèrement différer ; vérifiez les présentations sensibles à la mise en forme." },
      { q: "Y a-t-il une limite de taille ou de nombre ?", a: "Jusqu'à 20 fichiers par lot, chacun jusqu'à 5 Mo. Pour un fichier PowerPoint supérieur à 5 Mo, utilisez l'outil fichier unique PPT en PDF, qui gère les fichiers plus volumineux." },
      { q: "Mes fichiers sont-ils téléversés ? Est-ce gratuit ?", a: "C'est gratuit et sans compte. La conversion Office s'effectue sur notre propre serveur, donc chaque fichier y est envoyé, converti en PDF et renvoyé — il n'est ni stocké ni conservé après coup." },
    ],
  },
  "batch-pdf-to-office": {
    title: "PDF en Word/Excel par lot — foire aux questions",
    items: [
      { q: "Comment convertir plusieurs PDF en Word ou Excel à la fois ?", a: "Déposez vos PDF sur la page — ou un dossier entier — choisissez Word ou Excel comme cible, puis cliquez sur Tout convertir. Chaque fichier est converti l'un après l'autre et, une fois terminé, cliquez sur Télécharger le ZIP pour tout obtenir dans une seule archive." },
      { q: "Dois-je choisir Word ou Excel ?", a: "Choisissez Word (.docx) pour les documents principalement composés de texte et de paragraphes, et Excel (.xlsx) pour les PDF constitués de tableaux — factures, relevés, feuilles de données. Excel fonctionne mieux lorsque le PDF comporte des lignes et des colonnes claires." },
      { q: "La mise en page sera-t-elle exactement identique à l'original ?", a: "Aucun convertisseur ne peut promettre une copie pixel par pixel. Nous extrayons le texte et les tableaux dans un fichier réellement modifiable — ce dont vous avez besoin pour éditer — mais les PDF scannés ou très élaborés visuellement peuvent nécessiter des ajustements. Pour un PDF numérique avec du texte et des tableaux normaux, le résultat est généralement proche." },
      { q: "Y a-t-il une limite de taille ou de nombre ?", a: "Vous pouvez convertir jusqu'à 20 PDF par lot, chacun jusqu'à 5 Mo. Pour un fichier supérieur à 5 Mo, utilisez l'outil fichier unique PDF en Word ou PDF en Excel, qui gère les fichiers plus volumineux." },
      { q: "Mes fichiers sont-ils téléversés ? Est-ce gratuit ?", a: "C'est gratuit et sans compte. Contrairement à nos outils fonctionnant uniquement dans le navigateur, la conversion vers les formats Office s'effectue sur notre propre serveur, donc chaque PDF y est envoyé, converti et renvoyé — il n'est ni stocké ni conservé après coup." },
    ],
  },
  "batch-pdf-to-word": {
    title: "PDF en Word par lot — foire aux questions",
    items: [
      { q: "Comment convertir plusieurs PDF en Word à la fois ?", a: "Déposez vos PDF sur la page — ou un dossier entier — puis cliquez sur Tout convertir. Chaque fichier est converti en document Word modifiable l'un après l'autre et, une fois terminé, cliquez sur Télécharger le ZIP pour tout obtenir dans une seule archive." },
      { q: "Le fichier Word sera-t-il exactement identique à l'original ?", a: "Aucun convertisseur ne peut promettre une copie pixel par pixel. Nous extrayons le texte dans un .docx réellement modifiable — ce dont vous avez besoin pour éditer — mais les PDF scannés ou très élaborés visuellement peuvent nécessiter des ajustements. Pour un PDF numérique avec du texte normal, le résultat est généralement proche." },
      { q: "Quels PDF se convertissent le mieux ?", a: "Les PDF basés sur du texte et nativement numériques se convertissent le mieux. Les PDF scannés n'ont pas de texte sélectionnable — appliquez-leur d'abord l'OCR, sinon le fichier Word revient vide. Si votre PDF est principalement composé de tableaux, le convertisseur PDF en Excel donne généralement un résultat plus propre." },
      { q: "Y a-t-il une limite de taille ou de nombre ?", a: "Vous pouvez convertir jusqu'à 20 PDF par lot, chacun jusqu'à 5 Mo. Pour un fichier supérieur à 5 Mo, utilisez l'outil fichier unique PDF en Word, qui gère les fichiers plus volumineux." },
      { q: "Mes fichiers sont-ils téléversés ? Est-ce gratuit ?", a: "C'est gratuit et sans compte. Contrairement à nos outils fonctionnant uniquement dans le navigateur, la conversion vers Word s'effectue sur notre propre serveur, donc chaque PDF y est envoyé, converti et renvoyé — il n'est ni stocké ni conservé après coup." },
    ],
  },
  "batch-pdf-to-excel": {
    title: "PDF en Excel par lot — foire aux questions",
    items: [
      { q: "Comment convertir plusieurs PDF en Excel à la fois ?", a: "Déposez vos PDF sur la page — ou un dossier entier — puis cliquez sur Tout convertir. Chaque fichier est converti en feuille de calcul Excel modifiable l'un après l'autre et, une fois terminé, cliquez sur Télécharger le ZIP pour tout obtenir dans une seule archive." },
      { q: "Le fichier Excel sera-t-il exactement identique à l'original ?", a: "Aucun convertisseur ne peut promettre une copie pixel par pixel. Nous extrayons les tableaux et le texte dans un .xlsx réellement modifiable — ce dont vous avez besoin pour travailler avec les chiffres — mais les PDF scannés ou très élaborés visuellement peuvent nécessiter des ajustements. Pour un PDF numérique avec des tableaux clairs, le résultat est généralement proche." },
      { q: "Quels PDF se convertissent le mieux ?", a: "Les PDF constitués de tableaux clairs — factures, relevés bancaires, feuilles de données — se convertissent le mieux, car les lignes et les colonnes correspondent directement aux cellules de la feuille de calcul. Les PDF scannés n'ont pas de texte sélectionnable, appliquez-leur donc d'abord l'OCR. Si votre PDF est principalement composé de paragraphes plutôt que de tableaux, le convertisseur PDF en Word donne généralement un résultat plus propre." },
      { q: "Y a-t-il une limite de taille ou de nombre ?", a: "Vous pouvez convertir jusqu'à 20 PDF par lot, chacun jusqu'à 5 Mo. Pour un fichier supérieur à 5 Mo, utilisez l'outil fichier unique PDF en Excel, qui gère les fichiers plus volumineux." },
      { q: "Mes fichiers sont-ils téléversés ? Est-ce gratuit ?", a: "C'est gratuit et sans compte. Contrairement à nos outils fonctionnant uniquement dans le navigateur, la conversion vers Excel s'effectue sur notre propre serveur, donc chaque PDF y est envoyé, converti et renvoyé — il n'est ni stocké ni conservé après coup." },
    ],
  },
  "batch-compress": {
    title: "Compresser des PDF par lot — foire aux questions",
    items: [
      { q: "Comment compresser plusieurs PDF à la fois ?", a: "Faites glisser vos PDF sur la page — ou déposez un dossier entier, ou utilisez « Choisir un dossier » — et tout fichier non-PDF dans ce dossier est filtré automatiquement. Choisissez une intensité de compression (« Légère », « Recommandée » ou « Forte »), puis cliquez sur « Tout compresser ». Chaque fichier est traité l'un après l'autre et, une fois terminé, cliquez sur « Télécharger le ZIP » pour tout récupérer dans une seule archive." },
      { q: "Mes fichiers sont-ils envoyés à un serveur ?", a: "Non. Il s'agit d'un outil 100 % côté client : chaque PDF est lu et compressé directement dans votre navigateur, et rien n'est jamais envoyé à un quelconque serveur. Vos fichiers ne quittent jamais votre appareil, c'est pourquoi vous pouvez l'utiliser en toute sécurité sur des documents confidentiels." },
      { q: "Que reçois-je et comment les fichiers sont-ils nommés ?", a: "Vous recevez un seul fichier ZIP (dockdocs-compressed.zip). À l'intérieur, chaque PDF conserve son nom d'origine avec « -compressed » ajouté avant l'extension — ainsi report.pdf devient report-compressed.pdf. Chaque ligne indique également la réduction de taille du fichier, et le bouton de téléchargement affiche la réduction globale." },
      { q: "Y a-t-il une limite de nombre de fichiers ou de taille ?", a: "Vous pouvez ajouter jusqu'à 30 PDF par lot. Il n'y a pas de limite de taille fixe par fichier — comme tout s'exécute dans votre navigateur, la vraie limite est la mémoire de votre appareil. Les fichiers volumineux ou nombreux fonctionnent quand même, ils prennent simplement plus de temps sur une machine peu puissante." },
      { q: "Pourquoi mon PDF n'a-t-il pas beaucoup réduit ?", a: "La compression fonctionne en infographiant chaque page en image, ce qui est idéal pour les scans et les PDF riches en images, mais peu efficace pour les fichiers principalement composés de texte brut — il n'y a tout simplement pas grand-chose à compresser. Si un fichier change à peine, c'est normal ; essayez « Forte » pour un peu plus, mais les PDF tout-texte sont déjà proches de leur taille minimale." },
      { q: "Est-ce gratuit ? Ai-je besoin d'un compte ?", a: "Oui, entièrement gratuit — sans inscription, sans filigrane, sans limite quotidienne. Ouvrez simplement la page et commencez à compresser." },
    ],
  },
  "batch-pdf-to-image": {
    title: "PDF en image par lot — foire aux questions",
    items: [
      { q: "Comment convertir un lot de PDF en images ?", a: "Faites glisser vos PDF vers la zone de dépôt — ou déposez un dossier entier, ou cliquez sur « Choisir un dossier ». Choisissez JPG ou PNG, puis cliquez sur « Tout convertir ». Chaque page de chaque PDF est convertie en image et le résultat est téléchargé dans un seul ZIP. Pas d'inscription, pas de filigrane." },
      { q: "Mes fichiers sont-ils envoyés à un serveur ?", a: "Non. Cet outil est 100 % côté client : chaque PDF est lu et converti en images entièrement dans votre navigateur, et rien n'est jamais téléversé vers un serveur. Le ZIP que vous téléchargez est généré localement sur votre appareil. Vous pouvez même l'utiliser hors ligne une fois la page chargée." },
      { q: "Que reçois-je et comment les images sont-elles nommées ?", a: "Vous recevez un fichier ZIP (nommé dockdocs-images.zip) contenant chaque page sous forme d'image séparée. Chaque fichier est nommé d'après son PDF source plus le numéro de page — par exemple report.pdf devient report-1.jpg, report-2.jpg, etc. Les pages sont rendues à l'échelle 2× pour une sortie nette et haute résolution." },
      { q: "Quelle est la différence entre JPG et PNG ici ?", a: "Le JPG produit des fichiers plus petits et aplatit chaque page sur un fond blanc — idéal pour les documents avec beaucoup de photos ou les scans. Le PNG est sans perte et conserve la transparence, ce qui convient mieux aux dessins au trait, aux diagrammes ou aux pages que vous modifierez ultérieurement. Choisissez celui qui vous convient avant de cliquer sur « Tout convertir » ; vous pouvez relancer avec l'autre format à tout moment." },
      { q: "Combien de fichiers ou de pages puis-je convertir à la fois ?", a: "Vous pouvez mettre en file d'attente jusqu'à 20 PDF par lot — les fichiers supplémentaires sont automatiquement supprimés. Il n'y a pas de limite fixe de pages ou de taille, donc le vrai plafond est la mémoire de votre appareil : les PDF très volumineux ou avec de nombreuses pages prennent simplement plus de temps et ralentissent sur les machines peu puissantes. Pour un grand travail, divisez-le en quelques lots." },
      { q: "Pourquoi l'un de mes PDF affiche-t-il « échoué » ?", a: "La cause la plus courante est un PDF protégé par mot de passe ou chiffré — l'outil ne peut pas afficher les pages qu'il ne peut pas ouvrir, donc ce fichier est marqué « échoué » tandis que le reste du lot continue à se convertir normalement. Supprimez d'abord le mot de passe (notre outil Déverrouiller PDF peut aider), puis rajoutez-le. Les fichiers corrompus ou non-PDF peuvent également échouer ; notez que si vous déposez un dossier, les fichiers non-PDF sont filtrés automatiquement plutôt que de marquer un échec." },
    ],
  },
  "batch-protect-pdf": {
    title: "Chiffrer des PDF par lot — foire aux questions",
    items: [
      { q: "Comment chiffrer plusieurs PDF à la fois ?", a: "Faites glisser vos PDF dans la zone — ou déposez un dossier entier, ou cliquez pour choisir des fichiers. Saisissez un mot de passe (le champ « Mot de passe »), puis cliquez sur « Tout chiffrer ». Chaque fichier est verrouillé avec ce même mot de passe et vous recevez un seul ZIP avec chaque fichier renommé en « …-protected.pdf »." },
      { q: "Mes fichiers sont-ils envoyés à un serveur ?", a: "Non. Il s'agit d'un outil 100 % côté client — chaque PDF est chiffré directement dans votre navigateur et rien ne quitte jamais votre appareil. Pas de téléversement, pas de compte, pas de copie conservée nulle part. Vous pouvez même l'utiliser hors ligne une fois la page chargée." },
      { q: "Que reçois-je et sous quel format ?", a: "Vous recevez un fichier ZIP nommé « dockdocs-protected.zip ». À l'intérieur, chaque PDF d'entrée apparaît comme son propre fichier chiffré avec le suffixe « -protected.pdf ». Ouvrez-en un et votre lecteur vous demandera le mot de passe que vous avez défini." },
      { q: "Y a-t-il des règles pour le mot de passe ou des limites sur le nombre de fichiers ?", a: "Le mot de passe doit comporter entre 4 et 32 caractères en utilisant uniquement des lettres, des chiffres et le tiret bas (_) — cela garantit sa compatibilité avec tous les lecteurs PDF. Vous pouvez chiffrer jusqu'à 30 fichiers par lot ; pour plus, relancez simplement l'outil. Il n'y a pas de limite de taille stricte, mais comme tout s'exécute dans votre navigateur, les très grands travaux ralentissent sur les appareils avec peu de mémoire." },
      { q: "Que se passe-t-il avec un PDF déjà protégé par mot de passe ?", a: "Il est ignoré. L'outil ne peut pas reverrouiller un fichier qu'il ne peut pas ouvrir, donc tout PDF déjà protégé est exclu du ZIP plutôt que de faire échouer l'ensemble du lot. Déchiffrez-le d'abord (avec le mot de passe d'origine) si vous souhaitez le rechiffrer ici." },
      { q: "Est-ce vraiment gratuit ? Y a-t-il un filigrane ou une inscription requise ?", a: "Oui, entièrement gratuit, sans inscription et sans filigrane. Les PDF chiffrés sont octet par octet vos originaux plus le mot de passe — DockDocs n'y ajoute rien." },
    ],
  },
  "flashcards": {
    title: "Fiches de révision PDF — foire aux questions",
    items: [
      { q: "Comment transformer un PDF en fiches de révision ?", a: "Déposez un PDF — un chapitre de manuel, des notes de cours ou un guide — et l'outil lit le texte directement dans votre navigateur. Choisissez combien de fiches vous souhaitez (5, 10, 15 ou 20), puis appuyez sur « Générer les fiches ». Vous obtenez une grille de fiches question/réponse ; appuyez sur n'importe quelle fiche pour la retourner et vous auto-évaluer." },
      { q: "Mon PDF est-il téléversé quelque part ?", a: "Votre fichier PDF n'est jamais téléversé. Le texte est extrait dans votre navigateur, et seul ce texte brut (plus le nombre de fiches et la langue) est envoyé à notre service IA pour rédiger les fiches. Le fichier original, avec ses images, sa mise en page et ses métadonnées, reste sur votre appareil." },
      { q: "Pourquoi affiche-t-il « Aucun texte trouvé dans ce PDF » ?", a: "Votre PDF est un scan ou une image — il n'a pas de couche de texte à lire, seulement une image de la page. Passez-le d'abord par l'OCR pour ajouter une couche de texte consultable, puis revenez et réessayez. Conseil : si le PDF est protégé par mot de passe, déverrouillez-le d'abord avec l'outil « Déverrouiller PDF »." },
      { q: "Les fiches sont-elles exactes ?", a: "Les fiches sont rédigées par l'IA en utilisant uniquement le texte de votre document — on lui demande de ne pas utiliser de connaissances externes ni d'inventer des faits. Même ainsi, l'IA peut mal interpréter ou trop simplifier, donc vérifiez rapidement les fiches avant d'étudier avec elles. L'outil vous le rappelle sur l'écran des résultats." },
      { q: "Y a-t-il une limite de taille ou d'utilisation ?", a: "Oui. Chaque exécution accepte jusqu'à environ 16 000 caractères de texte — environ 12 pages — donc alimentez-la avec un chapitre ou une section à la fois plutôt qu'un livre entier. Il y a également une limite d'utilisation raisonnable d'environ six générations par minute. Si vous atteignez l'une ou l'autre, vous verrez un message clair ; raccourcissez simplement le contenu ou attendez une minute." },
      { q: "Est-ce gratuit et ai-je besoin d'une connexion internet ?", a: "C'est gratuit — aucun compte ou paiement requis. Comme les fiches sont rédigées par un service IA, vous avez besoin d'une connexion internet : le navigateur lit votre PDF hors ligne, mais la génération des fiches effectue un appel rapide à notre serveur." },
    ],
  },
  "compare": {
    title: "Comparer des documents — foire aux questions",
    items: [
      { q: "Comment comparer des documents ?", a: "Téléversez 2 à 8 PDF du même type — devis, factures ou contrats — choisissez le type et cliquez sur « Comparer les champs ». DockDocs aligne les termes clés (prix, délai de livraison, paiement, garantie, etc.) côte à côte dans un seul tableau, en affichant la ligne source exacte derrière chaque valeur lorsqu'il peut la localiser (et « Non reconnu » lorsqu'un document ne l'indique pas, jamais une supposition). Vous obtenez également une recommandation fondée sur les chiffres comparés sur l'option gagnante, et vous pouvez poser une question à tous les documents à la fois." },
      { q: "Mes fichiers sont-ils envoyés à votre serveur ?", a: "Non — vos PDF ne quittent jamais votre appareil. DockDocs les lit directement dans votre navigateur pour en extraire le texte. Seul ce texte brut extrait (pas le fichier lui-même) est envoyé à notre serveur, où l'IA extrait et aligne les champs. Ainsi, le document, sa mise en page et toutes les données intégrées restent locaux ; ce qui circule ce sont les mots sur la page." },
      { q: "Pourquoi mon PDF affiche-t-il « Non reconnu (probablement scanné — OCR nécessaire) » ?", a: "Cela signifie que le PDF n'a pas de couche de texte sélectionnable — il s'agit généralement d'un scan ou d'une photo d'une page, donc il n'y a rien à lire. Cliquez sur « Extraire le texte avec OCR » sur ce document et DockDocs exécutera l'OCR dans votre navigateur pour reconnaître le texte (les premières pages), puis vous pourrez le comparer comme n'importe quel autre fichier. Les PDF chiffrés ou protégés par mot de passe ne peuvent pas non plus être lus avant d'être déverrouillés." },
      { q: "Que reçois-je et puis-je faire confiance aux valeurs ?", a: "Vous obtenez un tableau comparatif où chaque cellule affiche la valeur plus la ligne source exacte dont elle provient — et cette ligne est vérifiée pour apparaître réellement dans votre document, donc rien n'est inventé. Cliquez sur n'importe quelle ligne source pour accéder à un extrait mis en évidence du texte original. Si un document ne mentionne tout simplement pas quelque chose, vous verrez « Non reconnu » plutôt qu'une supposition. Une mise en garde : la recommandation globale est le raisonnement de l'IA sur ces chiffres et n'est pas vérifiée source par source, donc confirmez les chiffres dans le tableau avant de décider." },
      { q: "Y a-t-il une limite sur le nombre ou la taille des fichiers ?", a: "Vous pouvez comparer jusqu'à 8 PDF à la fois, et il vous faut au moins 2 lisibles pour que la comparaison s'exécute. Pour la fonctionnalité « poser une question à tous les documents », le texte combiné de tous les documents doit rester en dessous de 60 000 caractères et votre question en dessous de 500 caractères — si vous dépassez, utilisez moins de documents ou des documents plus courts. L'outil nécessite une connexion internet, car l'extraction des champs et la recommandation s'exécutent sur notre serveur." },
      { q: "Est-ce gratuit ?", a: "Oui — vous pouvez téléverser vos PDF, effectuer la comparaison côte à côte, obtenir la recommandation et poser des questions à vos documents. L'OCR dans le navigateur pour les fichiers scannés est également gratuit, car il s'exécute localement sur votre appareil. Le moteur de comparaison est en bêta, son comportement peut donc continuer à s'améliorer." },
    ],
  },
  "merge-pdf": {
    title: "Fusionner des fichiers PDF — foire aux questions",
    items: [
      { q: "Comment fusionner des fichiers PDF ?", a: "Ajoutez deux PDF ou plus, faites glisser les miniatures dans l'ordre souhaité, puis cliquez sur Fusionner et télécharger. Les pages sont combinées de haut en bas dans cet ordre en un seul PDF." },
      { q: "Puis-je contrôler l'ordre de fusion ?", a: "Oui. Chaque fichier affiche une miniature et un badge numéroté — faites-les glisser pour les réordonner avant de fusionner. Vous voyez exactement ce qui va où avant de cliquer, pas après." },
      { q: "Mes fichiers sont-ils envoyés à un serveur ?", a: "Non. Tout s'exécute localement dans votre navigateur — la fusion se fait sur votre appareil et vos fichiers ne sont jamais téléversés ni envoyés nulle part. Pas de compte ni d'inscription nécessaires." },
      { q: "Y a-t-il une limite de taille de fichier ou de pages ?", a: "Il n'y a pas de limite fixe. Comme tout le travail se passe dans votre navigateur, la limite pratique est la mémoire de votre appareil — les fichiers très volumineux ou nombreux peuvent être lents sur les appareils avec peu de RAM." },
      { q: "Pourquoi l'un de mes PDF a-t-il été ignoré ?", a: "Les PDF protégés par mot de passe ou chiffrés ne peuvent pas être lus, donc ils sont exclus avec un avertissement. Supprimez d'abord le mot de passe, puis rajoutez le fichier." },
      { q: "Est-ce gratuit ?", a: "Oui — entièrement gratuit, sans filigrane et sans inscription. Le fichier fusionné se télécharge sous forme d'un seul PDF." },
    ],
  },
  "split-pdf": {
    title: "Diviser un PDF — foire aux questions",
    items: [
      { q: "Comment diviser un PDF ?", a: "Téléversez le PDF, puis cliquez sur le ✂ entre deux pages pour définir un point de coupe. Vous pouvez ajouter autant de coupes que vous le souhaitez, ou utiliser « Diviser toutes les N pages » pour les placer automatiquement. Lorsque vous cliquez sur Diviser et télécharger, chaque segment est enregistré comme son propre PDF, tous emballés dans un seul ZIP." },
      { q: "Comment savoir ce qui se retrouve dans chaque fichier ?", a: "Avant de télécharger, les pages sont colorées et étiquetées « Fichier 1 », « Fichier 2 », etc., et un compteur en direct vous indique exactement combien de fichiers seront créés — pas de surprises." },
      { q: "Mon fichier est-il téléversé quelque part ?", a: "Non. Toute la division s'exécute localement dans votre navigateur — le PDF est lu, découpé et compressé sur votre appareil et n'est jamais envoyé à un serveur. Rien ne quitte votre machine." },
      { q: "Y a-t-il une limite de taille ou de pages ?", a: "Il n'y a pas de limite fixe. Comme tout s'exécute dans votre navigateur, la limite pratique est la mémoire de votre appareil — les PDF très volumineux ou avec beaucoup de pages prennent plus de temps à afficher et peuvent solliciter un téléphone ou un ordinateur plus ancien." },
      { q: "Que reçois-je exactement et est-ce gratuit ?", a: "Vous obtenez un ZIP contenant un PDF par segment (nommés comme document-part-1.pdf, document-part-2.pdf). Même si vous n'avez défini qu'une seule coupe, la sortie est toujours un ZIP. C'est entièrement gratuit, sans inscription ni filigrane. Remarque : les PDF protégés par mot de passe doivent être déverrouillés d'abord." },
    ],
  },
  "crop-pdf": {
    title: "Rogner un PDF — foire aux questions",
    items: [
      { q: "Comment rogner un PDF ?", a: "Téléversez votre PDF, puis faites glisser les curseurs supérieur, droit, inférieur et gauche pour rogner chaque bord. Vous verrez un aperçu en direct au fur et à mesure, ajustez simplement jusqu'à ce que ça soit bon et cliquez sur Rogner et télécharger." },
      { q: "Rogne-t-il chaque page de la même façon ?", a: "Oui. Les marges que vous définissez sont appliquées uniformément à chaque page, donc tout le document reste cohérent. Il n'y a pas de rognage page par page dans cet outil." },
      { q: "Le contenu rogné est-il vraiment supprimé ?", a: "Non. Le rognage modifie la zone visible (la zone de rognage) — les parties rognées sont masquées, pas effacées. Cela signifie que rien n'est vraiment perdu, mais aussi que quelqu'un pourrait le récupérer. Si vous avez besoin que le contenu disparaisse définitivement, utilisez plutôt un outil de caviardage." },
      { q: "Mon fichier est-il téléversé quelque part ?", a: "Non. Tout s'exécute localement dans votre navigateur — votre PDF ne quitte jamais votre appareil et rien n'est envoyé à un serveur." },
      { q: "Y a-t-il une limite de taille de fichier ?", a: "Il n'y a pas de limite fixe. Comme tout se passe dans votre navigateur, le plafond pratique dépend de la mémoire de votre appareil — les fichiers très volumineux peuvent être lents ou manquer de mémoire sur les machines peu puissantes." },
      { q: "Est-ce gratuit ? Ai-je besoin d'un compte ?", a: "C'est entièrement gratuit et aucune inscription n'est requise. Ouvrez simplement la page et commencez à rogner." },
    ],
  },
  "sign-pdf": {
    title: "Signer un PDF — foire aux questions",
    items: [
      { q: "Comment signer un PDF ?", a: "Téléversez votre PDF, dessinez ou saisissez votre signature, choisissez la page, la position et la taille, puis cliquez sur Signer et télécharger. Vous obtenez un nouveau fichier nommé …-signed.pdf." },
      { q: "Mon fichier est-il téléversé quelque part ?", a: "Non. Tout se passe dans votre navigateur — la page est rendue et votre signature est apposée sur le PDF localement. Votre fichier ne quitte jamais votre appareil et rien n'est envoyé à un serveur." },
      { q: "Puis-je dessiner ma signature ou dois-je la saisir ?", a: "Les deux fonctionnent. Dessinez avec votre souris ou votre doigt sur le pavé, ou passez en mode Saisie pour afficher votre nom dans une police cursive. Cliquez sur Effacer pour recommencer une signature dessinée." },
      { q: "Y a-t-il une limite de taille et est-ce payant ?", a: "C'est gratuit et sans inscription. Il n'y a pas de limite de taille fixe, mais comme tout est traité en mémoire, les PDF très volumineux dépendent de la RAM de votre appareil — un fichier énorme peut être lent sur un téléphone ou un ordinateur portable plus ancien." },
      { q: "Où va exactement la signature et y a-t-il des points à noter ?", a: "Elle est placée selon l'une des neuf positions d'ancrage (coins, bords, centre) et mise à l'échelle par le curseur de taille — vous ne pouvez pas la faire glisser jusqu'à un pixel précis. Elle est apposée sur une page à la fois, répétez donc pour chaque page que vous devez signer. Les PDF chiffrés ou protégés par mot de passe doivent être déverrouillés d'abord." },
      { q: "Cela compte-t-il comme une signature électronique légale ?", a: "La signature est apposée sur la page sous forme d'image, pas de signature numérique basée sur un certificat. Les signatures électroniques saisies et dessinées sont acceptées pour de nombreux documents courants, mais vérifiez les exigences spécifiques à votre cas d'usage." },
    ],
  },
  "reorder-pages": {
    title: "Réordonner les pages d'un PDF — foire aux questions",
    items: [
      { q: "Comment réordonner les pages d'un PDF ?", a: "Téléversez votre PDF, faites glisser les miniatures de pages dans l'ordre souhaité et cliquez sur Appliquer et télécharger. Pas besoin de saisir des numéros de page — vous les organisez visuellement." },
      { q: "Puis-je supprimer des pages en même temps ?", a: "Oui. Cliquez sur le ✕ de n'importe quelle miniature pour supprimer cette page, puis téléchargez. La réorganisation et la suppression de pages se font en une seule étape." },
      { q: "Mon fichier est-il téléversé quelque part ?", a: "Non. Tout s'exécute localement dans votre navigateur — votre PDF n'est jamais téléversé et ne quitte jamais votre appareil." },
      { q: "Y a-t-il une limite de taille ou de pages ?", a: "Il n'y a pas de limite fixe. Les PDF très volumineux dépendent simplement de la mémoire de votre appareil, car tout le travail se passe sur votre machine." },
      { q: "La réorganisation diminuera-t-elle la qualité ?", a: "Non. Les pages conservent leur contenu et leur résolution d'origine — seul l'ordre change, rien n'est re-rendu ni compressé." },
      { q: "Est-ce gratuit ? Ai-je besoin d'un compte ?", a: "C'est entièrement gratuit et aucune inscription n'est requise." },
    ],
  },
  "delete-page": {
    title: "Supprimer des pages d'un PDF — foire aux questions",
    items: [
      { q: "Comment supprimer des pages d'un PDF ?", a: "Téléversez votre PDF, cliquez sur les pages que vous souhaitez supprimer (elles deviennent rouges avec un ✕), puis cliquez sur Supprimer et télécharger. Un compteur indique combien de pages seront supprimées et combien restent." },
      { q: "Que faire si je marque la mauvaise page ?", a: "Cliquez à nouveau dessus pour la conserver — la marque rouge et le ✕ disparaissent. Vous pouvez marquer et démarquer autant de fois que vous le souhaitez avant de télécharger." },
      { q: "Mon fichier est-il téléversé quelque part ?", a: "Non. Tout se passe dans votre navigateur en utilisant la mémoire de votre appareil — votre PDF n'est jamais envoyé à un serveur et ne quitte jamais votre appareil." },
      { q: "Y a-t-il une limite de taille de fichier ?", a: "Il n'y a pas de limite fixe. Comme le travail se passe localement, la limite pratique est la mémoire de votre appareil — les PDF très volumineux ou riches en images peuvent être lents sur les machines d'entrée de gamme." },
      { q: "Que reçois-je ?", a: "Un nouveau PDF sans les pages marquées, téléchargé sous le nom « votrefichier-pages-removed.pdf ». Le reste des pages conserve leur contenu et leur ordre d'origine ; votre fichier original n'est pas modifié. Vous devez conserver au moins une page." },
      { q: "Est-ce gratuit ?", a: "Oui — entièrement gratuit, sans inscription ni compte nécessaires." },
    ],
  },
  "rotate-page": {
    title: "Faire pivoter les pages d'un PDF — foire aux questions",
    items: [
      { q: "Comment faire pivoter des pages dans un PDF ?", a: "Téléversez le PDF et cliquez sur une page pour la faire pivoter de 90° dans le sens horaire. Continuez à cliquer sur la même page pour la faire pivoter à 180°, 270°, puis revenir en arrière. Ou cliquez sur Tout faire pivoter à 90° pour faire pivoter chaque page en une fois, puis téléchargez." },
      { q: "Puis-je ne faire pivoter qu'une seule page, ou des pages différentes selon des angles différents ?", a: "Oui. Chaque page pivote indépendamment, vous pouvez donc corriger un seul scan de côté ou définir des angles différents pour différentes pages — seules les pages sur lesquelles vous cliquez changent." },
      { q: "Mon fichier est-il téléversé quelque part ?", a: "Non. Tout s'exécute localement dans votre navigateur — la rotation est inscrite dans le PDF sur votre appareil et le fichier n'est jamais envoyé à un serveur ni ne quitte votre appareil." },
      { q: "Y a-t-il une limite de taille ou de pages ?", a: "Il n'y a pas de limite fixe que nous imposons. Comme tout se passe dans votre navigateur, le plafond pratique dépend de la mémoire de votre appareil — les PDF très volumineux peuvent être lents sur les téléphones ou tablettes avec peu de mémoire." },
      { q: "La rotation entraîne-t-elle une perte de qualité ou modifie-t-elle le contenu ?", a: "Non. La rotation définit simplement l'indicateur d'orientation de chaque page — le texte, les images et la résolution restent exactement les mêmes. Rien n'est re-rendu ni compressé." },
      { q: "Est-ce gratuit ? Ai-je besoin d'un compte ?", a: "C'est entièrement gratuit et sans inscription. Ouvrez la page, faites pivoter et téléchargez." },
    ],
  },
  "add-page": {
    title: "Insérer des pages dans un PDF — foire aux questions",
    items: [
      { q: "Comment insérer des pages dans un PDF ?", a: "Téléversez votre PDF, cliquez à l'endroit où vous souhaitez insérer (au tout début ou après une page spécifique), puis choisissez le fichier à insérer là et cliquez sur Insérer et télécharger." },
      { q: "Que puis-je insérer ?", a: "Un autre PDF (toutes ses pages sont déposées à cet endroit) ou une seule image PNG/JPG, qui est ajoutée comme une nouvelle page." },
      { q: "Mon fichier est-il téléversé ?", a: "Non. Tout s'exécute localement dans votre navigateur avec pdf-lib — vos fichiers ne quittent jamais votre appareil et rien n'est envoyé à un serveur." },
      { q: "Que reçois-je ?", a: "Un seul nouveau PDF avec les pages insérées en place, téléchargé sous le nom « <votre-fichier>-with-insert.pdf ». Votre fichier original n'est pas modifié." },
      { q: "Y a-t-il une limite de taille ?", a: "Il n'y a pas de limite fixe, mais comme tout se passe dans votre navigateur, les PDF très volumineux dépendent de la mémoire de votre appareil. Si un fichier énorme a du mal, essayez-en un plus petit." },
      { q: "Est-ce gratuit ?", a: "Oui — entièrement gratuit, sans inscription ni compte nécessaires." },
    ],
  },
  "watermark-pdf": {
    title: "Ajouter un filigrane à un PDF — foire aux questions",
    items: [
      { q: "Comment ajouter un filigrane à un PDF ?", a: "Téléversez le PDF, créez un filigrane texte ou image, et ajustez sa position, son opacité et sa rotation tout en regardant l'aperçu en direct. Choisissez quelles pages estampiller, puis cliquez sur Appliquer et télécharger." },
      { q: "Puis-je utiliser une image ou un logo plutôt que du texte ?", a: "Oui. Passez en mode Image pour déposer un logo ou une image comme filigrane. Dans les deux cas, vous pouvez définir la position, l'opacité et la rotation." },
      { q: "Estampille-t-il chaque page ?", a: "Vous décidez. Le filigrane va sur les pages que vous sélectionnez, vous pouvez donc marquer l'ensemble du document ou uniquement des pages spécifiques." },
      { q: "Mes fichiers sont-ils téléversés quelque part ?", a: "Non. Le filigrane est appliqué directement dans votre navigateur — votre PDF ne quitte jamais votre appareil et rien n'est envoyé à un serveur." },
      { q: "Y a-t-il une limite de taille de fichier ?", a: "Il n'y a pas de limite fixe. Comme tout s'exécute localement, les PDF très volumineux ne sont limités que par la mémoire de votre appareil — sur la plupart des machines c'est largement suffisant." },
      { q: "Est-ce gratuit ? Ai-je besoin d'un compte ?", a: "C'est gratuit et sans inscription. Ouvrez simplement la page, ajoutez votre PDF et téléchargez le fichier avec filigrane." },
    ],
  },
  "page-numbers": {
    title: "Ajouter des numéros de page à un PDF — foire aux questions",
    items: [
      { q: "Comment ajouter des numéros de page à un PDF ?", a: "Téléversez votre PDF, choisissez où va le numéro (haut ou bas, gauche/centre/droite), sélectionnez le format et le numéro de départ, et définissez la plage de pages. L'aperçu en direct montre exactement le résultat, puis cliquez sur Ajouter des numéros et télécharger." },
      { q: "Mon fichier est-il téléversé quelque part ?", a: "Non. Tout s'exécute localement dans votre navigateur — le PDF est lu, numéroté et enregistré sur votre appareil. Votre fichier n'est jamais téléversé et ne quitte jamais votre ordinateur." },
      { q: "Quels formats et positions puis-je utiliser ?", a: "Quatre formats : juste le numéro (1), Page 1, 1 / N, ou 1 sur N. Six positions : haut ou bas, associées à gauche, centre ou droite. Vous pouvez également définir une petite/moyenne/grande marge." },
      { q: "Puis-je commencer à partir d'un numéro spécifique ou ne numéroter que certaines pages ?", a: "Oui. Définissez Commencer à pour le premier numéro (pratique si votre page de couverture ne doit pas compter), et utilisez la plage de/à pour ne numéroter qu'une partie du document. La numérotation continue sur la plage que vous choisissez." },
      { q: "Y a-t-il une limite de taille de fichier ?", a: "Il n'y a pas de limite fixe. Comme le travail se passe dans votre navigateur, les PDF très volumineux ne sont limités que par la mémoire de votre appareil — sur la plupart des machines les documents courants passent sans problème." },
      { q: "Est-ce gratuit ? Ai-je besoin d'un compte ?", a: "Oui, c'est entièrement gratuit et aucune inscription n'est requise. Ouvrez simplement la page et commencez." },
    ],
  },
  "images-to-pdf": {
    title: "Images en PDF — foire aux questions",
    items: [
      { q: "Comment convertir des images en PDF ?", a: "Ajoutez vos images, faites glisser les miniatures dans l'ordre souhaité, puis cliquez sur Convertir en PDF. Chaque image devient une page, de haut en bas, dans un seul fichier que vous pouvez télécharger." },
      { q: "Quels formats d'image sont pris en charge ?", a: "JPG, PNG, WebP, GIF et BMP. HEIC (le format dans lequel les iPhone enregistrent souvent les photos) n'est pas encore pris en charge — convertissez-les d'abord en JPG, ou modifiez le réglage de l'appareil photo de votre iPhone en « Plus compatible »." },
      { q: "Puis-je combiner de nombreuses images en un seul PDF ?", a: "Oui. Ajoutez-en autant que vous voulez et faites-les glisser pour les réordonner — elles sont fusionnées en un seul PDF exactement dans cet ordre, une image par page." },
      { q: "Mes images sont-elles téléversées quelque part ?", a: "Non. Tout s'exécute localement dans votre navigateur — le PDF est créé sur votre appareil et vos images ne sont jamais envoyées à un serveur ni stockées nulle part." },
      { q: "Y a-t-il une limite de taille ou de nombre de fichiers ?", a: "Il n'y a pas de limite fixe. Comme tout se passe sur votre appareil, le plafond pratique est la mémoire de votre appareil — les images très grandes ou très nombreuses en haute résolution peuvent ralentir un téléphone ancien ou un ordinateur portable avec peu de RAM." },
      { q: "Est-ce gratuit ? Ai-je besoin d'un compte ?", a: "Oui, c'est entièrement gratuit, sans inscription, sans filigrane et sans e-mail requis. Ouvrez simplement la page et commencez." },
    ],
  },
  "pdf-to-png": {
    title: "PDF en PNG — foire aux questions",
    items: [
      { q: "Comment convertir un PDF en PNG ?", a: "Déposez un PDF et chaque page apparaît sous forme de miniature. Cliquez sur les pages pour les inclure ou les exclure (ou utilisez Tout sélectionner / Ne rien sélectionner), vérifiez que PNG est sélectionné, puis Convertir et télécharger. Une seule page se télécharge sous forme d'un PNG ; plusieurs pages sont regroupées dans un ZIP." },
      { q: "Mon PDF est-il téléversé quelque part ?", a: "Non. Tout se passe dans votre navigateur — le PDF est lu et converti en PNG localement et le téléchargement est généré sur votre appareil. Rien n'est envoyé à un serveur, donc votre fichier ne quitte jamais votre machine." },
      { q: "Pourquoi choisir le PNG plutôt que le JPG ?", a: "Le PNG est sans perte : il garde le texte, le dessin au trait, les schémas et les captures d'écran parfaitement nets, sans artefacts de compression, et prend en charge la transparence. Les fichiers JPG sont plus petits et conviennent aux photos, mais ils adoucissent les détails fins et ne peuvent pas être transparents." },
      { q: "Y a-t-il une limite de taille ou de pages ?", a: "Il n'y a pas de limite fixe et pas d'inscription. Comme tout est traité dans votre navigateur, la vraie limite est la mémoire de votre appareil — les PDF très volumineux ou avec beaucoup de pages utilisent plus de RAM et prennent plus de temps, surtout sur les téléphones ou les machines anciennes." },
      { q: "Il ne peut pas ouvrir mon PDF — que se passe-t-il ?", a: "La cause la plus courante est un PDF protégé par mot de passe ou chiffré, que l'outil ne peut pas lire ; supprimez d'abord le mot de passe et réessayez. La sortie est rendue à 2× pour des images nettes, mais c'est toujours une image — le texte devient des pixels, vous ne pouvez donc pas le sélectionner ni le rechercher ensuite." },
      { q: "La conversion PDF en PNG est-elle gratuite ?", a: "Oui — entièrement gratuit, sans compte, sans filigrane, sans limite sur le nombre de fois que vous l'utilisez." },
    ],
  },
  "pdf-to-image": {
    title: "PDF en image — foire aux questions",
    items: [
      { q: "Comment convertir un PDF en JPG ou PNG ?", a: "Déposez un PDF et chaque page apparaît sous forme de miniature. Cliquez sur les pages pour les inclure ou les exclure (ou utilisez Tout sélectionner / Ne rien sélectionner), choisissez JPG ou PNG, puis Convertir et télécharger. Une seule page se télécharge sous forme d'une image ; plusieurs pages sont regroupées dans un ZIP." },
      { q: "Mon PDF est-il téléversé quelque part ?", a: "Non. Tout se passe dans votre navigateur — le PDF est lu et converti en images localement et le téléchargement est généré sur votre appareil. Rien n'est envoyé à un serveur, donc votre fichier ne quitte jamais votre machine." },
      { q: "JPG ou PNG — lequel choisir ?", a: "Le PNG est sans perte, donc idéal pour du texte net, du dessin au trait et des captures d'écran. Les fichiers JPG sont plus petits et conviennent aux photos et aux scans. Un point à noter : le JPG ne peut pas être transparent, donc les zones transparentes d'une page sont aplaties sur un fond blanc." },
      { q: "Y a-t-il une limite de taille ou de pages ?", a: "Il n'y a pas de limite fixe et pas d'inscription. Comme tout est traité dans votre navigateur, la vraie limite est la mémoire de votre appareil — les PDF très volumineux ou avec beaucoup de pages utilisent plus de RAM et prennent plus de temps, surtout sur les téléphones ou les machines anciennes." },
      { q: "Il ne peut pas ouvrir mon PDF — que se passe-t-il ?", a: "La cause la plus courante est un PDF protégé par mot de passe ou chiffré, que l'outil ne peut pas lire ; supprimez d'abord le mot de passe et réessayez. La sortie est rendue à 2× pour des images nettes, mais c'est toujours une image — le texte devient des pixels, vous ne pouvez donc pas le sélectionner ni le rechercher ensuite." },
      { q: "Est-ce gratuit ?", a: "Oui — entièrement gratuit, sans compte, sans filigrane, sans limite sur le nombre de fois que vous l'utilisez." },
    ],
  },
  "redact-pdf": {
    title: "Caviarder un PDF — foire aux questions",
    items: [
      { q: "Comment caviarder un PDF ?", a: "Déposez votre PDF sur la page et DockDocs affiche chaque page directement dans votre navigateur. Faites glisser un cadre sur tout ce que vous souhaitez masquer — un nom, un numéro de compte, une signature. DockDocs analyse également automatiquement les éléments probablement sensibles (e-mails, numéros de téléphone, numéros de sécurité sociale, numéros de carte, adresses IP) et les pré-marque ; examinez ces suggestions et cliquez sur le ✕ de tout cadre que vous ne souhaitez pas. Une fois terminé, cliquez sur Appliquer et télécharger pour obtenir la copie caviardée." },
      { q: "Le texte est-il vraiment supprimé ou simplement recouvert d'un cadre noir ?", a: "Vraiment supprimé. Beaucoup de « caviardages » posent simplement un rectangle noir par-dessus — le texte original est toujours dans le fichier et n'importe qui peut le copier ou supprimer le cadre. DockDocs re-rend chaque page sous forme d'image plate avec les zones noires incrustées, de sorte que le texte sous-jacent est détruit et définitivement effacé. C'est exactement ce qui rend le résultat sûr à partager." },
      { q: "Mes fichiers sont-ils téléversés quelque part ?", a: "Non. Tout se passe dans votre navigateur sur votre propre appareil — l'ouverture du PDF, le tracé des cadres et la création de la copie caviardée se font tous localement. Votre fichier n'est jamais envoyé à un serveur et ne quitte jamais votre ordinateur, c'est donc adapté aux documents confidentiels ou réglementés." },
      { q: "Y a-t-il des limites et est-ce gratuit ?", a: "C'est entièrement gratuit, sans compte, sans e-mail ni installation requis. Il n'y a pas de limite de taille fixe, bien que les PDF très volumineux dépendent de la mémoire de votre appareil. La seule limite stricte est le nombre de pages : un document peut comporter jusqu'à 30 pages — si le vôtre est plus long, divisez-le d'abord et caviardez chaque partie." },
      { q: "À quoi ressemble le fichier de sortie ?", a: "Vous obtenez un nouveau PDF où chaque page est une image aplatie (environ 158 DPI — nette et lisible). Comme les pages sont maintenant des images, le contenu caviardé disparaît définitivement et le reste du texte n'est plus sélectionnable ni consultable. Ce compromis est tout l'intérêt : le texte que vous ne pouvez pas sélectionner est un texte qui ne peut pas être récupéré." },
      { q: "Dois-je faire confiance aux cadres détectés automatiquement seuls ?", a: "Traitez-les comme un point de départ, pas comme une garantie. L'analyse automatique détecte les modèles courants comme les e-mails et les numéros, mais peut passer à côté d'éléments rédigés dans des formats inhabituels et ne connaîtra pas les secrets spécifiques au contexte que vous seul pouvez reconnaître. Lisez toujours vous-même les pages et faites glisser des cadres sur tout ce que le détecteur n'a pas signalé avant de télécharger." },
    ],
  },
  "translate-pdf": {
    title: "Traduire un PDF — foire aux questions",
    items: [
      { q: "Comment traduire un PDF ?", a: "Téléversez votre PDF, choisissez une langue cible dans la liste et cliquez sur Traduire. Le texte est extrait du fichier et traduit par l'IA, puis vous pouvez le copier ou le télécharger sous forme de fichier .txt." },
      { q: "Mon fichier est-il téléversé ? Est-ce privé ?", a: "Le PDF est lu directement dans votre navigateur — le fichier lui-même ne quitte jamais votre appareil. Seul le texte brut extrait est envoyé à l'IA pour traduction. Le document original, la mise en forme et les images ne sont jamais téléversés." },
      { q: "Y a-t-il une limite de taille ?", a: "Oui — environ 14 000 caractères par exécution, soit environ 10 pages. Si votre document est plus long, divisez-le en morceaux plus petits et traduisez-les un par un." },
      { q: "Dans quelles langues puis-je traduire ?", a: "Plus de 18, dont l'anglais, le chinois simplifié et traditionnel, l'espagnol, le français, l'allemand, le japonais, le coréen, le portugais, l'italien, le russe, l'arabe, le hindi et plus. L'outil détecte automatiquement la langue source, vous n'avez donc qu'à choisir la cible." },
      { q: "Conserve-t-il la mise en page originale ? Que reçois-je ?", a: "Pas encore — cette version traduit uniquement le contenu textuel et vous fournit le texte traduit à copier ou télécharger. La traduction préservant la mise en page qui reconstruit le PDF est au programme. Remarque également : si le PDF est un scan ou une image sans texte sélectionnable, il n'y a rien à extraire — lancez d'abord l'OCR." },
      { q: "Est-ce gratuit ? Puis-je m'y fier pour des documents juridiques ?", a: "Oui, c'est gratuit. La traduction IA est idéale pour comprendre un document et obtenir une bonne première ébauche, mais ce n'est pas une traduction certifiée — pour des usages juridiques, officiels ou certifiés, faites-la réviser ou traduire par un professionnel qualifié." },
    ],
  },
  "extract-to-excel": {
    title: "Extraire des données PDF vers un tableur — foire aux questions",
    items: [
      { q: "Comment extraire des données de PDF vers un tableur ?", a: "Déposez vos factures, devis ou contrats (ou choisissez un dossier entier pour les traiter par lot), choisissez le type de document et cliquez sur Extraire. L'IA extrait les champs clés — totaux, dates, parties, conditions — dans un seul tableau que vous pouvez télécharger en CSV à ouvrir dans Excel, Google Sheets ou Numbers. C'est gratuit." },
      { q: "Mes fichiers sont-ils envoyés à un serveur ?", a: "Le PDF lui-même ne quitte jamais votre appareil — il est lu directement dans votre navigateur. Seul le texte brut extrait est envoyé à l'IA pour l'organiser en colonnes ; le fichier original, avec sa mise en page et ses images, reste local. Si cette étape d'envoi du texte pose problème pour des contrats sensibles, cela vaut la peine d'y réfléchir à l'avance." },
      { q: "Comment savoir si les chiffres sont corrects ?", a: "Chaque valeur est taguée avec la phrase exacte dont elle provient dans le document original, vous pouvez donc la vérifier d'un coup d'œil. Si l'IA ne peut pas trouver clairement un champ, elle laisse la cellule vide plutôt que de deviner — et nous supprimons toute citation source qui n'apparaît pas réellement dans votre fichier, donc rien n'est fabriqué." },
      { q: "Quelles sont les limites ?", a: "Jusqu'à 8 documents à la fois, et le texte combiné est limité à environ 60 000 caractères — environ une pile de factures normales, pas un contrat-cadre de 200 pages. Pour les grands lots, traitez-les en plusieurs tours." },
      { q: "Il n'a rien extrait — que s'est-il passé ?", a: "C'est presque toujours un PDF scanné ou photographié. Si le texte n'est pas sélectionnable dans un lecteur PDF normal, il n'y a rien que le navigateur puisse lire et l'IA reçoit une page vide. Passez-les d'abord par l'OCR. Les PDF protégés par mot de passe ne peuvent pas non plus être lus tant qu'ils ne sont pas déverrouillés." },
      { q: "Quels documents fonctionnent le mieux ?", a: "Les documents structurés avec des champs cohérents — factures, devis et contrats — où chaque champ prédéfini (fournisseur, total, date d'échéance, conditions de paiement, etc.) est réellement imprimé quelque part dans le document. Les lettres en format libre ou les mises en page inhabituelles laisseront davantage de cellules vides." },
    ],
  },
  "redline": {
    title: "Comparer des versions de PDF (suivi des modifications) — foire aux questions",
    items: [
      { q: "Comment comparer deux versions de PDF ?", a: "Téléversez le PDF original (v1) et le PDF révisé (v2), puis cliquez sur Comparer les versions. DockDocs aligne le texte et affiche une vue annotée unique — le texte ajouté est surligné en vert, le texte supprimé est barré en rouge, comme le suivi des modifications." },
      { q: "Mes fichiers sont-ils téléversés quelque part ?", a: "Non. Il s'agit d'un outil côté client : le texte est extrait et comparé entièrement dans votre navigateur, donc vos fichiers ne quittent jamais votre appareil. Rien n'est envoyé à un serveur." },
      { q: "Détecte-t-il les phrases reformulées ?", a: "Il compare phrase par phrase, donc il marque quelles phrases ont été ajoutées et lesquelles ont été supprimées. Une petite reformulation apparaît comme une suppression plus un ajout plutôt qu'un changement au niveau du mot dans la phrase." },
      { q: "Que compare-t-il exactement — vérifie-t-il la mise en forme ou les images ?", a: "Uniquement le texte extrait. Les polices, la mise en page, les couleurs, les images et les tableaux ne font pas partie de la comparaison, et les PDF scannés sans vraie couche de texte ne produiront pas de résultats utiles. S'il indique aucune modification textuelle, le libellé est identique même si l'apparence a changé." },
      { q: "Quelle peut être la taille des documents ?", a: "Toute la comparaison s'exécute dans votre navigateur, donc elle est calibrée pour des documents jusqu'à quelques milliers de phrases (plafond de 2 500 phrases par fichier). Les contrats ou livres très longs peuvent être tronqués ou lents." },
      { q: "Est-ce gratuit ?", a: "Oui — comparer des versions est entièrement gratuit, sans inscription et sans limite sur le nombre de comparaisons." },
    ],
  },
};

const FAQS_JA: Record<string, { title: string; items: Array<{ q: string; a: string }> }> = {
  "chat-with-pdf": {
    title: "PDFと対話 — よくある質問",
    items: [
      { q: "どのように動作しますか？", a: "テキストベースのPDFをアップロードすると、DockDocs がブラウザ内でテキストを抽出します。あなたが質問すると、AIは一般的なウェブ知識ではなく、その文書の内容を使って回答します。1度に1文書、1ファイルあたり最大12ページ／40,000文字／25 MBまでです。" },
      { q: "回答は信頼できますか？私の文書に基づいていますか？", a: "回答はPDFから抽出したテキストに基づきます。AIの回答があなたのファイル内の箇所と一致する場合、「✓ 出典と照合済み」の注記の下に該当する引用が表示され、ご自身で確認できます。引用はモデルの返答内容に依存し、すべての回答に表示されるわけではありません。AIは誤ることもあるため、重要な点は必ず元の文書で確認してください。" },
      { q: "私のPDFはアップロード・保存されますか？", a: "テキストはブラウザ内で抽出され、その抽出テキストのみが回答のためにAIプロバイダーに送られます。ファイル自体がデバイスから出ることはなく、後から保存されることもありません。" },
      { q: "どんなPDFが使えますか？", a: "テキストベース（デジタル生成）のPDFです。スキャンPDFには選択可能なテキストがないため、先にOCRをかけて読める状態にしてください。英語・中国語・スペイン語・ポルトガル語・フランス語などに対応し、回答は質問した言語に従います。" },
      { q: "制限はありますか？", a: "1ファイルあたり25 MB・12ページ・抽出テキスト40,000文字までです。長い文書は先に分割または圧縮してください。無料の1日あたりの利用枠があり、それ以上が必要な場合はアップグレードしてください。" },
    ],
  },
  "govbid-matrix": {
    title: "入札コンプライアンス・マトリクス — よくある質問",
    items: [
      { q: "何を抽出しますか？", a: "RFP・入札公告・調達仕様書を読み込み、拘束力のある「~しなければならない（shall/must/will）」要件をすべて、番号付きのコンプライアンス・マトリクスに抽出します。各行に要件・該当セクション・必須か任意かを記載します。必須のみで絞り込み、マトリクス全体をCSVに書き出して提案管理表にそのまま取り込めます。" },
      { q: "各要件を公告まで遡れますか？", a: "はい——それが目的です。各行は出典本文をそのまま引用しセクションを示すので、入札に反映する前に元の文書と照合できます。AIが返した引用がファイル内に見つからない場合は、捏造した出典を表示せず「引用を確認できません」と表示します。何も作り出さず、たどれないものはたどれないと分かります。" },
      { q: "自分で公告を読む必要はなくなりますか？", a: "いいえ。「~しなければならない」を見落とさないための高速な一次チェックであり、網羅性の保証ではなく、コンプライアンスや法的助言でもありません。入札のコンプライアンス責任は引き続きあなたにあります。必ず公告全文を読み、ツールが見落としたものも拘束力があるものとして扱ってください。" },
      { q: "公告はアップロード・保存されますか？", a: "ファイルはブラウザ内で読み込まれ、抽出テキストのみが分析に送られ、後から保存されることはありません。ファイル自体がデバイスから出ることはなく、これは落札前や機密の入札で重要です。" },
      { q: "どの文書が最適ですか？", a: "テキストベース（デジタル生成）のPDFです。スキャンされた公告には選択可能なテキストがないため、先にOCRをかけてください。英語・中国語・スペイン語・ポルトガル語・フランス語などに対応し、引用は文書の原語のまま保たれます。" },
    ],
  },
  "lease-redflag": {
    title: "賃貸契約レッドフラグ診断 — よくある質問",
    items: [
      { q: "何を指摘しますか？", a: "借主に不利になりうる条項を賃貸契約からスキャンします——過度な賃料増額、厳しい中途解約違約金、不合理な貸主の立入権、不明確な修繕負担、過大な敷金控除、転貸制限、不当な明渡遅延金、標準的な保護の欠落（猶予期間なし、居住性の保証なし、退去前の是正機会なし）など。各指摘を赤（高）・黄（中）・緑（低）で表示し、契約書から引用したうえで、確認・交渉すべき点を示します。" },
      { q: "これは法的助言ですか？", a: "いいえ。借主が注意すべき条項を見つける手助けをする自動レビューであり、法的助言ではなく、弁護士や借主支援団体の代わりにもなりません。重要な点は資格のある弁護士にご相談ください。何も指摘がないことは契約が公正である保証にはなりません。" },
      { q: "引用を作り出すことはありますか？", a: "すべての引用は実際の契約書本文と照合します——AIが返した引用が文書内に見つからない場合は、捏造した出典を表示せず破棄します。欠落条項のリスクは引用なしで、その旨を明記して表示します。" },
      { q: "私の契約書はアップロード・保存されますか？", a: "契約書はブラウザ内で読み込まれ、抽出テキストのみが分析に送られ、後から保存されることはありません。ファイル自体がデバイスから出ることはありません。" },
      { q: "どの契約書形式が使えますか？", a: "テキストベース（デジタル生成）のPDFです。スキャンされた契約書には選択可能なテキストがないため、先にOCRをかけてください。英語・中国語・スペイン語などに対応し、引用は契約書の原語のまま保たれます。" },
    ],
  },
  "flashcards": {
    title: "PDFフラッシュカード — よくある質問",
    items: [
      { q: "PDFをどうフラッシュカードにしますか？", a: "PDF（教科書の章、講義ノート、マニュアルなど）を投入すると、ブラウザ内でテキストを読み取ります。枚数（5・10・15・20）を選び、「カードを生成」を押すと、問題／回答カードのグリッドが作られます。どのカードもタップすると裏返って自己確認できます。" },
      { q: "私のPDFはどこかにアップロードされますか？", a: "PDFファイルがアップロードされることはありません。テキストはブラウザ内で抽出され、その平文（とカード枚数・言語）のみがカード作成のためAIサービスに送られます。画像・レイアウト・メタデータを含む元ファイルはデバイスに留まります。" },
      { q: "「このPDFにテキストが見つかりません」と出るのはなぜ？", a: "そのPDFはスキャンや画像で、読み取るテキスト層がなくページの画像しかありません。先にOCRをかけて検索可能なテキスト層を追加してから再度お試しください。ヒント：パスワード保護されている場合は「PDFのロック解除」で先に解除してください。" },
      { q: "カードは正確ですか？", a: "カードは文書のテキストのみを使ってAIが作成し、外部知識や事実の創作はしないよう指示されています。それでもAIは読み違いや単純化をすることがあるため、学習前にざっと確認してください。結果画面でもこの点を案内します。" },
      { q: "サイズや利用の制限はありますか？", a: "はい。1回あたり約16,000文字（およそ12ページ）までなので、本全体ではなく章・節単位で投入してください。公正利用のため毎分約6回までのレート制限もあります。上限に達すると明確なメッセージが出るので、内容を短くするか少し待ってください。" },
      { q: "無料ですか？インターネット接続は必要ですか？", a: "無料で使えます——アカウントや支払いは不要です。カードはAIサービスが作成するため、インターネット接続が必要です。ブラウザはPDFをオフラインで読みますが、カード生成時にサーバーへ短い通信を行います。" },
    ],
  },
  "compare": {
    title: "文書を比較 — よくある質問",
    items: [
      { q: "文書をどう比較しますか？", a: "同じ種類のPDF（見積・請求書・契約書）を2〜8件アップロードし、種類を選んで「項目を比較」をクリックします。DockDocs が主要な項目（価格・納期・支払い・保証など）を1つの表に横並びにし、原文を特定できた値にはその根拠となる原文の行も示します（記載がない場合は推測せず「認識できません」と表示します）。どれが優れているかの根拠つき推奨も得られ、全文書に対して1つの質問もできます。" },
      { q: "ファイルはサーバーにアップロードされますか？", a: "いいえ——PDFがデバイスから出ることはありません。DockDocs はブラウザ内で読み取ってテキストを抽出します。その抽出した平文のみ（ファイル自体ではなく）がサーバーに送られ、AIが項目を抽出・整列します。文書・レイアウト・埋め込みデータはローカルに留まり、送られるのはページ上の文字だけです。" },
      { q: "PDFが「認識できません（スキャンの可能性／OCRが必要）」と出るのはなぜ？", a: "そのPDFに選択可能なテキスト層がない（スキャンや写真）ためで、読み取るものがありません。その文書で「OCRでテキスト抽出」をクリックすると、DockDocs がブラウザ内でOCR（先頭数ページ）を実行し、他のファイルと同様に比較できます。暗号化・パスワード保護されたPDFも解除するまで読めません。" },
      { q: "何が得られ、値は信頼できますか？", a: "各セルに値とその根拠となる原文の行が表示される比較表が得られます。その行は実際に文書内にあることを確認済みで、何も作り出しません。行をクリックすると原文の該当箇所がハイライト表示されます。文書に記載がない場合は推測せず「認識できません」と表示します。ただし全体の推奨はそれらの数値に対するAIの推論であり個別に出典確認はしていないため、判断前に表の数値をご確認ください。" },
      { q: "ファイル数やサイズの制限はありますか？", a: "1度に最大8件のPDFを比較でき、比較には読み取り可能なものが2件以上必要です。「全文書に質問」機能では、全文書の合計テキストが60,000文字未満、質問が500文字未満である必要があります。超える場合は件数を減らすか短くしてください。項目抽出と推奨はサーバーで実行するため、インターネット接続が必要です。" },
      { q: "無料ですか？", a: "はい——PDFのアップロード、横並び比較、推奨の取得、全文書への質問が行えます。スキャンファイル向けのブラウザ内OCRも、デバイス上でローカルに動作するため無料です。" },
    ],
  },
  "redline": {
    title: "PDFバージョン比較（赤字）— よくある質問",
    items: [
      { q: "2つのPDFバージョンをどう比較しますか？", a: "元版（v1）と改訂版（v2）のPDFをアップロードし、「バージョンを比較」をクリックします。DockDocs がテキストを突き合わせ、1つのマークアップ表示にまとめます——追加箇所は緑のハイライト、削除箇所は赤の取り消し線で、変更履歴のように示します。" },
      { q: "ファイルはどこかにアップロードされますか？", a: "いいえ。これはクライアントサイドのツールで、テキストの抽出と比較はすべてブラウザ内で行われ、ファイルがデバイスから出ることはありません。サーバーには何も送られません。" },
      { q: "言い換えた文も検出できますか？", a: "文単位で比較するため、どの文が追加・削除されたかを示します。わずかな言い換えは、文中の語単位の変更ではなく、1つの削除＋1つの追加として表れます。" },
      { q: "実際に何を比較しますか？書式や画像も対象ですか？", a: "抽出テキストのみです。フォント・レイアウト・色・画像・表は比較対象外で、テキスト層のないスキャンPDFは有用な結果になりません。テキストの変更なしと表示された場合、見た目が変わっていても文言は同一です。" },
      { q: "文書はどのくらい大きくできますか？", a: "比較はすべてブラウザ内で行われるため、数千文までの文書向けに調整されています（1ファイルあたり2,500文で上限）。非常に長い契約書や書籍は切り詰められたり、動作が遅くなることがあります。" },
      { q: "無料ですか？", a: "はい——バージョン比較は完全無料で、登録不要、比較回数の制限もありません。" },
    ],
  },
  "extract-to-excel": {
    title: "PDFデータを表計算へ抽出 — よくある質問",
    items: [
      { q: "PDFからデータを表計算へどう抽出しますか？", a: "請求書・見積・契約書を投入し（フォルダを選んで一括も可）、文書の種類を選んで「抽出」をクリックします。AIが主要項目（合計・日付・当事者・条件）を1つの表に抽出し、Excel・Google スプレッドシート・Numbers で開けるCSVとしてダウンロードできます。無料です。" },
      { q: "ファイルはサーバーにアップロードされますか？", a: "PDF自体がデバイスから出ることはなく、ブラウザ内で読み取られます。抽出した平文のみが列に整理するためAIに送られ、レイアウトや画像を含む元ファイルはローカルに留まります。機密契約でこの「テキスト送信」が問題になる場合は、事前にご認識ください。" },
      { q: "数値が正しいかどう分かりますか？", a: "各値には元文書での出典文がタグ付けされるので、一目で確認できます。AIが項目を明確に見つけられない場合は推測せずセルを空欄にし、ファイル内に実在しない出典引用は破棄するので、何も捏造されません。" },
      { q: "制限はありますか？", a: "1度に最大8文書、合計テキストは約60,000文字までです——通常の請求書の束ほどで、200ページの基本契約書ではありません。大量の場合は数回に分けて実行してください。" },
      { q: "何も抽出されませんでした——なぜ？", a: "ほぼ確実にスキャンや写真のPDFです。通常のPDFリーダーでテキストを選択できない場合、ブラウザが読むものがなくAIには空白ページに見えます。先にOCRをかけてください。パスワード保護されたPDFも解除するまで読めません。" },
      { q: "どの文書が最適ですか？", a: "項目が一貫した定型書類——請求書・見積・契約書——で、各既定項目（取引先・合計・支払期日・支払条件など）が文書のどこかに実際に印字されているものです。自由形式の手紙や特殊なレイアウトは空欄が増えます。" },
    ],
  },
  "merge-pdf": {
    title: "PDFを結合 — よくある質問",
    items: [
      { q: "PDFをどう結合しますか？", a: "2つ以上のPDFを追加し、サムネイルを好きな順序にドラッグして「結合してダウンロード」をクリックします。ページはその順に上から下へ1つのPDFにまとまります。" },
      { q: "結合される順序を指定できますか？", a: "はい。各ファイルにサムネイルと番号バッジが付くので、結合前にドラッグで並べ替えられます。クリック後ではなく前に、何がどこに入るか正確に分かります。" },
      { q: "ファイルはサーバーにアップロードされますか？", a: "いいえ。すべてブラウザ内でローカルに動作し、結合はデバイス上で行われ、ファイルがアップロードされたりどこかに送られることはありません。アカウントや登録も不要です。" },
      { q: "ファイルサイズやページ数の上限はありますか？", a: "固定の上限はありません。処理はすべてブラウザ内で行われるため、実質的な上限はデバイスのメモリです。非常に大きい・多数のファイルは低メモリ端末では遅くなることがあります。" },
      { q: "PDFの1つがスキップされたのはなぜ？", a: "パスワード保護・暗号化されたPDFは読み取れないため、通知とともに除外されます。先にロックを解除してから再度追加してください。" },
      { q: "無料ですか？", a: "はい——完全無料で、透かしも登録もありません。結合したファイルは1つのPDFとしてダウンロードされます。" },
    ],
  },
  "split-pdf": {
    title: "PDFを分割 — よくある質問",
    items: [
      { q: "PDFをどう分割しますか？", a: "PDFをアップロードし、任意の2ページの間の ✂ をクリックして切れ目を設定します。切れ目はいくつでも追加でき、「Nページごとに分割」で自動配置もできます。「分割してダウンロード」を押すと、各区間が個別のPDFとして保存され、1つのZIPにまとめられます。" },
      { q: "各ファイルに何が入るか分かりますか？", a: "ダウンロード前に、ページが色分けされ「File 1」「File 2」などのバッジが付き、作成されるファイル数がリアルタイムで表示されるので、驚きはありません。" },
      { q: "ファイルはどこかにアップロードされますか？", a: "いいえ。分割はすべてブラウザ内でローカルに動作し、PDFの読み取り・分割・ZIP化はデバイス上で行われ、サーバーに送られることはありません。" },
      { q: "ファイルサイズやページ数の上限はありますか？", a: "固定の上限はありません。すべてブラウザ内で行われるため、実質的な上限はデバイスのメモリです。非常に大きい・ページ数の多いPDFは描画に時間がかかり、古い端末では負荷になることがあります。" },
      { q: "何が得られますか？無料ですか？", a: "区間ごとに1つのPDFを含むZIP（document-part-1.pdf のような名前）が得られます。切れ目が1つだけでも出力はZIPです。完全無料で、登録も透かしもありません。注意:パスワード保護されたPDFは先に解除が必要です。" },
    ],
  },
  "crop-pdf": {
    title: "PDFをトリミング — よくある質問",
    items: [
      { q: "PDFをどうトリミングしますか？", a: "PDFをアップロードし、上・右・下・左のスライダーをドラッグして各辺を切り詰めます。リアルタイムプレビューを見ながら調整し、「トリミングしてダウンロード」をクリックします。" },
      { q: "全ページ同じようにトリミングされますか？", a: "はい。設定した余白はすべてのページに一律で適用され、文書全体が一貫します。ページごとのトリミングはありません。" },
      { q: "切り取った部分は実際に削除されますか？", a: "いいえ。トリミングは表示領域（クロップボックス）を変えるもので、切り詰めた部分は隠れるだけで消去されません。失われはしませんが、復元される可能性もあります。完全に消したい場合は墨消しツールをお使いください。" },
      { q: "ファイルはどこかにアップロードされますか？", a: "いいえ。すべてブラウザ内でローカルに動作し、PDFがデバイスから出ることも、サーバーに送られることもありません。" },
      { q: "ファイルサイズの上限はありますか？", a: "固定の上限はありません。すべてブラウザ内で行われるため、実質的な上限はデバイスのメモリで、非常に大きいファイルは非力な端末では遅くなることがあります。" },
      { q: "無料ですか？アカウントは必要ですか？", a: "完全無料で、登録不要です。ページを開いてそのまま始められます。" },
    ],
  },
  "sign-pdf": {
    title: "PDFに署名 — よくある質問",
    items: [
      { q: "PDFにどう署名しますか？", a: "PDFをアップロードし、署名を描くか入力し、ページ・位置・サイズを選んで「署名してダウンロード」をクリックします。…-signed.pdf という新しいファイルが得られます。" },
      { q: "ファイルはどこかにアップロードされますか？", a: "いいえ。すべてブラウザ内で動作し、ページの描画と署名の合成はローカルで行われます。ファイルがデバイスから出ることも、サーバーに送られることもありません。" },
      { q: "署名は描けますか？入力する必要がありますか？", a: "どちらも可能です。パッド上でマウスや指で描くか、「入力」に切り替えて手書き風フォントで名前を表示します。「クリア」で描き直せます。" },
      { q: "ファイルサイズの上限や費用はありますか？", a: "無料・登録不要です。固定の上限はありませんが、メモリ上で処理するため、非常に大きいPDFはデバイスのRAMに依存し、古い端末では遅くなることがあります。" },
      { q: "署名はどこに入りますか？注意点は？", a: "9つのアンカー位置（四隅・各辺・中央）のいずれかに配置し、サイズスライダーで調整します（1ピクセル単位での配置はできません）。1度に1ページずつ合成されるので、署名が必要な各ページで繰り返してください。暗号化・パスワード保護されたPDFは先に解除が必要です。" },
      { q: "これは法的な電子署名になりますか？", a: "署名は証明書ベースのデジタル署名ではなく、画像としてページに合成されます。入力・手書きの電子署名は日常的な多くの文書で受け入れられますが、用途ごとの具体的な要件をご確認ください。" },
    ],
  },
  "reorder-pages": {
    title: "PDFページを並べ替え — よくある質問",
    items: [
      { q: "PDFのページをどう並べ替えますか？", a: "PDFをアップロードし、ページのサムネイルを好きな順序にドラッグして「適用してダウンロード」をクリックします。ページ番号の入力は不要で、視覚的に並べます。" },
      { q: "ついでにページを削除できますか？", a: "はい。サムネイルの ✕ をクリックするとそのページを除外できます。並べ替えと削除を同じ操作で行えます。" },
      { q: "ファイルはどこかにアップロードされますか？", a: "いいえ。すべてブラウザ内でローカルに動作し、PDFがアップロードされたりデバイスから出ることはありません。" },
      { q: "ファイルサイズやページ数の上限はありますか？", a: "固定の上限はありません。処理はすべてデバイス上で行われるため、非常に大きいPDFはメモリに依存します。" },
      { q: "並べ替えると画質が下がりますか？", a: "いいえ。ページは元の内容と解像度を保ち、変わるのは順序だけです。再描画や圧縮は行われません。" },
      { q: "無料ですか？アカウントは必要ですか？", a: "完全無料で、登録不要です。" },
    ],
  },
  "delete-page": {
    title: "PDFページを削除 — よくある質問",
    items: [
      { q: "PDFのページをどう削除しますか？", a: "PDFをアップロードし、削除したいページをクリックすると（赤と ✕ で表示）、「削除してダウンロード」をクリックします。削除されるページ数と残るページ数がカウンターに表示されます。" },
      { q: "間違ったページを選んだら？", a: "もう一度クリックすれば残せます（赤と ✕ が消えます）。ダウンロード前なら何度でも選択・解除できます。" },
      { q: "ファイルはどこかにアップロードされますか？", a: "いいえ。すべてデバイスのメモリを使ってブラウザ内で動作し、PDFがサーバーに送られたりデバイスから出ることはありません。" },
      { q: "ファイルサイズの上限はありますか？", a: "固定の上限はありません。処理はローカルで行われるため、実質的な上限はデバイスのメモリで、非常に大きい・画像の多いPDFは非力な端末では遅くなることがあります。" },
      { q: "何が得られますか？", a: "選んだページを削除した新しいPDFが「yourfile-pages-removed.pdf」としてダウンロードされます。残りのページは元の内容と順序を保ち、元ファイルは変更されません。最低1ページは残す必要があります。" },
      { q: "無料ですか？", a: "はい——完全無料で、登録もアカウントも不要です。" },
    ],
  },
  "rotate-page": {
    title: "PDFページを回転 — よくある質問",
    items: [
      { q: "PDFのページをどう回転しますか？", a: "PDFをアップロードし、ページをクリックすると時計回りに90°回転します。同じページをクリックし続けると180°・270°・元に戻ります。「すべて90°回転」で全ページを一度に回し、ダウンロードします。" },
      { q: "1ページだけ、またはページごとに角度を変えられますか？", a: "はい。各ページは個別に回転するので、横向きの1枚を直したり、ページごとに異なる角度を設定できます。クリックしたページだけが変わります。" },
      { q: "ファイルはどこかにアップロードされますか？", a: "いいえ。すべてブラウザ内でローカルに動作し、回転はデバイス上でPDFに書き込まれます。ファイルがサーバーに送られたりデバイスから出ることはありません。" },
      { q: "ファイルサイズやページ数の上限はありますか？", a: "こちらで課す固定の上限はありません。すべてブラウザ内で行われるため、実質的な上限はデバイスのメモリで、非常に大きいPDFは低メモリの端末では遅くなることがあります。" },
      { q: "回転すると画質が下がったり内容が変わりますか？", a: "いいえ。回転は各ページの向きフラグを設定するだけで、テキスト・画像・解像度はそのままです。再描画や圧縮は行われません。" },
      { q: "無料ですか？アカウントは必要ですか？", a: "完全無料で、登録不要です。ページを開いて回転し、ダウンロードするだけです。" },
    ],
  },
  "add-page": {
    title: "PDFにページを挿入 — よくある質問",
    items: [
      { q: "PDFにページをどう挿入しますか？", a: "PDFをアップロードし、挿入位置（先頭、または特定ページの後）をクリックし、そこに挿入するファイルを選んで「挿入してダウンロード」をクリックします。" },
      { q: "何を挿入できますか？", a: "別のPDF（その全ページがその位置に挿入されます）か、1枚のPNG/JPG画像（新しい1ページとして追加）です。" },
      { q: "ファイルはアップロードされますか？", a: "いいえ。pdf-lib を使ってすべてブラウザ内でローカルに動作し、ファイルがデバイスから出たりサーバーに送られることはありません。" },
      { q: "何が得られますか？", a: "挿入されたページが入った新しいPDFが「<元ファイル名>-with-insert.pdf」としてダウンロードされます。元ファイルは変更されません。" },
      { q: "ファイルサイズの上限はありますか？", a: "固定の上限はありませんが、すべてブラウザ内で行われるため、非常に大きいPDFはデバイスのメモリに依存します。大きいファイルで不安定なら小さいものでお試しください。" },
      { q: "無料ですか？", a: "はい——完全無料で、登録もアカウントも不要です。" },
    ],
  },
  "watermark-pdf": {
    title: "PDFに透かしを追加 — よくある質問",
    items: [
      { q: "PDFにどう透かしを追加しますか？", a: "PDFをアップロードし、テキストまたは画像の透かしを作り、リアルタイムプレビューを見ながら位置・不透明度・回転を調整します。押印するページを選び、「適用してダウンロード」をクリックします。" },
      { q: "テキストの代わりに画像やロゴを使えますか？", a: "はい。「画像」モードに切り替えてロゴや画像を透かしとして使えます。いずれも位置・不透明度・回転を設定できます。" },
      { q: "全ページに押印されますか？", a: "選べます。透かしは選んだページに入るので、文書全体でも特定ページだけでも可能です。" },
      { q: "ファイルはどこかにアップロードされますか？", a: "いいえ。透かしはブラウザ内で適用され、PDFがデバイスから出たりサーバーに送られることはありません。" },
      { q: "ファイルサイズの上限はありますか？", a: "固定の上限はありません。すべてローカルで動作するため、非常に大きいPDFもデバイスのメモリ次第で、ほとんどの端末では十分です。" },
      { q: "無料ですか？アカウントは必要ですか？", a: "無料・登録不要です。ページを開いてPDFを追加し、透かし入りファイルをダウンロードするだけです。" },
    ],
  },
  "page-numbers": {
    title: "PDFにページ番号を追加 — よくある質問",
    items: [
      { q: "PDFにどうページ番号を追加しますか？", a: "PDFをアップロードし、番号の位置（上または下、左/中央/右）を選び、書式と開始番号、ページ範囲を設定します。リアルタイムプレビューで見え方を確認し、「番号を追加してダウンロード」をクリックします。" },
      { q: "ファイルはどこかにアップロードされますか？", a: "いいえ。すべてブラウザ内でローカルに動作し、PDFの読み取り・採番・保存はデバイス上で行われます。ファイルがアップロードされたりコンピューターから出ることはありません。" },
      { q: "どの書式・位置が使えますか？", a: "書式は4種類:番号のみ(1)、Page 1、1 / N、1 of N。位置は6種類:上または下に、左・中央・右の組み合わせ。余白も小・中・大から選べます。" },
      { q: "特定の番号から始めたり、一部のページだけ採番できますか？", a: "はい。「開始番号」で最初の番号を設定でき（表紙を数えたくない時に便利）、from/to の範囲で文書の一部だけ採番できます。番号は指定範囲にわたって連続します。" },
      { q: "ファイルサイズの上限はありますか？", a: "固定の上限はありません。処理はブラウザ内で行われるため、非常に大きいPDFもデバイスのメモリ次第で、ほとんどの端末では通常の文書は問題なく処理できます。" },
      { q: "無料ですか？アカウントは必要ですか？", a: "はい、完全無料で登録不要です。ページを開いて始めるだけです。" },
    ],
  },
  "images-to-pdf": {
    title: "画像をPDFに変換 — よくある質問",
    items: [
      { q: "画像をどうPDFに変換しますか？", a: "画像を追加し、サムネイルを好きな順序にドラッグして「PDFに変換」をクリックします。各画像が上から下へ1ページずつになり、1つのファイルとしてダウンロードできます。" },
      { q: "どの画像形式に対応していますか？", a: "JPG・PNG・WebP・GIF・BMP です。HEIC（iPhone がよく使う形式）はまだ未対応です——先にJPGに変換するか、iPhone のカメラ設定を「互換性優先」に変更してください。" },
      { q: "多数の画像を1つのPDFにまとめられますか？", a: "はい。いくつでも追加してドラッグで並べ替えられ、その順で1画像1ページとして1つのPDFに結合されます。" },
      { q: "画像はどこかにアップロードされますか？", a: "いいえ。すべてブラウザ内でローカルに動作し、PDFはデバイス上で作られ、画像がサーバーに送られたり保存されることはありません。" },
      { q: "サイズやファイル数の上限はありますか？", a: "固定の上限はありません。すべてデバイス上で行われるため、実質的な上限はデバイスのメモリで、非常に大きい・多数の高解像度画像は古い端末や低メモリのPCでは遅くなることがあります。" },
      { q: "無料ですか？アカウントは必要ですか？", a: "はい、完全無料で、登録・透かし・メール不要です。ページを開いて始めるだけです。" },
    ],
  },
  "pdf-to-png": {
    title: "PDFをPNGに変換 — よくある質問",
    items: [
      { q: "PDFをどうPNGに変換しますか？", a: "PDFを投入すると各ページがサムネイルで表示されます。含める/除外するページをクリックし（「すべて選択」「選択解除」も可）、PNGが選択されていることを確認して「変換してダウンロード」をクリックします。1ページなら1枚のPNG、複数ページならZIPにまとめられます。" },
      { q: "私のPDFはどこかにアップロードされますか？", a: "いいえ。すべてブラウザ内で動作し、PDFの読み取りとPNGへの描画はローカルで行われ、ダウンロードもデバイス上で生成されます。サーバーには何も送られず、ファイルがデバイスから出ることはありません。" },
      { q: "JPGではなくPNGを選ぶ理由は？", a: "PNGは無損失なので、文字・線画・図表・スクリーンショットを圧縮ノイズなく非常にくっきり保ち、透過にも対応します。JPGはファイルが小さく写真に向きますが、細部が甘くなり、透過はできません。" },
      { q: "ファイルサイズやページ数の上限はありますか？", a: "固定の上限はなく、登録も不要です。すべてブラウザ内で処理するため、実質的な上限はデバイスのメモリで、非常に大きい・ページ数の多いPDFはRAMを多く使い時間がかかります（特にスマホや古い端末）。" },
      { q: "PDFが開けません——何が問題ですか？", a: "最も多い原因はパスワード保護・暗号化されたPDFで、ツールが読み取れません。先にパスワードを解除して再度お試しください。出力は鮮明さのため2倍で描画しますが、あくまで画像なので、文字はピクセルになり後から選択・検索はできません。" },
      { q: "PDFからPNGへの変換は無料ですか？", a: "はい——完全無料で、アカウント・透かし・利用回数の制限もありません。" },
    ],
  },
  "pdf-to-image": {
    title: "PDFを画像に変換 — よくある質問",
    items: [
      { q: "PDFをどうJPG/PNGに変換しますか？", a: "PDFを投入すると各ページがサムネイルで表示されます。含める/除外するページをクリックし（「すべて選択」「選択解除」も可）、JPGかPNGを選んで「変換してダウンロード」をクリックします。1ページなら1枚の画像、複数ページならZIPにまとめられます。" },
      { q: "私のPDFはどこかにアップロードされますか？", a: "いいえ。すべてブラウザ内で動作し、PDFの読み取りと画像への描画はローカルで行われ、ダウンロードもデバイス上で生成されます。サーバーには何も送られず、ファイルがデバイスから出ることはありません。" },
      { q: "JPGとPNG、どちらを選ぶべき？", a: "PNGは無損失で、くっきりした文字・線画・スクリーンショットに最適です。JPGはファイルが小さく、写真やスキャンに向きます。注意:JPGは透過できないため、ページの透過部分は白背景に合成されます。" },
      { q: "ファイルサイズやページ数の上限はありますか？", a: "固定の上限はなく、登録も不要です。すべてブラウザ内で処理するため、実質的な上限はデバイスのメモリで、非常に大きい・ページ数の多いPDFはRAMを多く使い時間がかかります（特にスマホや古い端末）。" },
      { q: "PDFが開けません——何が問題ですか？", a: "最も多い原因はパスワード保護・暗号化されたPDFで、ツールが読み取れません。先にパスワードを解除して再度お試しください。出力は鮮明さのため2倍で描画しますが、あくまで画像なので、文字はピクセルになり後から選択・検索はできません。" },
      { q: "無料ですか？", a: "はい——完全無料で、アカウント・透かし・利用回数の制限もありません。" },
    ],
  },
  "redact-pdf": {
    title: "PDFを墨消し — よくある質問",
    items: [
      { q: "PDFをどう墨消ししますか？", a: "PDFをページに投入すると、DockDocs がブラウザ内で各ページを描画します。隠したい箇所（氏名・口座番号・署名など）をドラッグで囲みます。DockDocs は機密の可能性が高い項目（メール・電話番号・SSN・カード番号・IP）も自動検出して事前にマークします。提案を確認し、不要なものは ✕ をクリックします。完了したら「適用してダウンロード」で墨消し済みのコピーが得られます。" },
      { q: "テキストは実際に削除されますか？黒い四角で覆うだけ？", a: "実際に削除されます。多くの「墨消し」は黒い長方形を上に置くだけで、元のテキストはファイルに残り、コピーされたり四角を消されたりします。DockDocs は各ページを黒い領域を焼き込んだ平らな画像として再描画するので、下のテキストは完全に消えます。だからこそ共有しても安全です。" },
      { q: "ファイルはどこかにアップロードされますか？", a: "いいえ。PDFを開く・四角を描く・墨消し済みコピーを作る——すべてご自身の端末のブラウザ内でローカルに行われます。ファイルがサーバーに送られたりコンピューターから出ることはなく、機密・規制対象の文書に適しています。" },
      { q: "制限はありますか？無料ですか？", a: "完全無料で、アカウント・メール・インストール不要です。固定のファイルサイズ上限はありませんが、非常に大きいPDFはデバイスのメモリに依存します。1つだけ厳しい制限があり、ページ数は最大30ページです——超える場合は先に分割して各部分を墨消ししてください。" },
      { q: "出力ファイルはどうなりますか？", a: "各ページが平らな画像（約158 DPI——鮮明で読みやすい）になった新しいPDFが得られます。ページが画像になるため、墨消しした内容は永久に消え、残りのテキストも選択・検索できなくなります。そのトレードオフこそが要点です:選択できないテキストは復元できないテキストです。" },
      { q: "自動検出の四角だけを信頼してよいですか？", a: "出発点として扱い、保証とはみなさないでください。自動スキャンはメールや番号など一般的なパターンを捉えますが、特殊な書式は見落とすことがあり、あなたしか分からない文脈依存の秘密は分かりません。ダウンロード前に必ずご自身でページを読み、検出されなかった箇所にも四角を引いてください。" },
    ],
  },
  "translate-pdf": {
    title: "PDFを翻訳 — よくある質問",
    items: [
      { q: "PDFをどう翻訳しますか？", a: "PDFをアップロードし、リストから対象言語を選んで「翻訳」をクリックします。テキストがファイルから抽出されAIが翻訳し、コピーまたは .txt ファイルとしてダウンロードできます。" },
      { q: "ファイルはアップロードされますか？プライベートですか？", a: "PDFはブラウザ内で読み込まれ、ファイル自体がデバイスから出ることはありません。抽出された平文のみが翻訳のためAIに送られます。元の文書・書式・画像がアップロードされることはありません。" },
      { q: "サイズ制限はありますか？", a: "はい——1回あたり約14,000文字、おおよそ10ページです。長い文書は小さく分割して1つずつ翻訳してください。" },
      { q: "どの言語に翻訳できますか？", a: "英語、中国語（簡体・繁体）、スペイン語、フランス語、ドイツ語、日本語、韓国語、ポルトガル語、イタリア語、ロシア語、アラビア語、ヒンディー語など18以上です。元言語は自動検出されるので、対象言語だけ選びます。" },
      { q: "元のレイアウトは保たれますか？何が得られますか？", a: "まだです——このバージョンはテキスト内容のみを翻訳し、コピー・ダウンロードできる翻訳テキストを提供します。PDFを再構築するレイアウト保持翻訳は計画中です。なお、スキャンや画像で選択可能なテキストがないPDFは抽出するものがないため、先にOCRをかけてください。" },
      { q: "無料ですか？法的文書に頼れますか？", a: "はい、無料で使えます。AI翻訳は文書の理解や良い下書き作りに最適ですが、認証翻訳ではありません——法的・公式・認証目的には、資格のある人による確認・翻訳を受けてください。" },
    ],
  },
  "contract-risk": {
    title: "契約リスク診断 — よくある質問",
    items: [
      { q: "何をチェックしますか？", a: "契約書をスキャンし、見直す価値のある条項を洗い出します——自動更新、一方的な解約・変更、上限のない／無制限の責任、違約金・遅延損害金、支払いの落とし穴や隠れたコスト、過度に広い競業避止、そして標準的な保護の欠落（責任の上限がない等）です。各項目を赤（高）／黄（中）／緑（低）で表示し、契約書から該当箇所を引用したうえで、平易な理由と署名前に確認すべき点を示します。" },
      { q: "これは法的助言ですか？", a: "いいえ。これは、法律の専門家でない方が注意すべき条項を見つけるのを支援する自動レビューであり、法的助言ではなく、弁護士の代わりにもなりません。重要な契約や金額の大きい契約は、必ず資格のある弁護士にご確認ください。何も指摘されないことは、契約書が安全である保証にはなりません。" },
      { q: "条項や引用を作り出すことはありますか？", a: "すべての引用は実際の契約書本文と照合します——AI が返した引用が文書内に見つからない場合は、事実と異なる出典を表示するのではなく、その引用を破棄します。欠落している条項のリスクは引用なしで、その旨を明記して表示します。AI が見落とす可能性は残るため、契約書は必ず全文をお読みください。" },
    ],
  },
  "batch-translate": {
    title: "文書翻訳 — よくある質問",
    items: [
      { q: "複数のPDFを一度に翻訳するには？", a: "PDFをページにドロップ——フォルダ全体でも可——して、翻訳先の言語を選び、「すべて翻訳」をクリックします。各PDFはブラウザ内で読み取られ、テキストが1つずつ翻訳され、すべてを.txtファイルの1つのZIPとしてダウンロードできます。" },
      { q: "どの言語に翻訳できますか？", a: "英語、簡体字・繁体字中国語、スペイン語、フランス語、ドイツ語、日本語、韓国語、ポルトガル語、イタリア語、ロシア語、アラビア語、ヒンディー語を含む13言語です。バッチ全体が、選んだ1つの言語に翻訳されます。" },
      { q: "何が得られますか？レイアウトは保たれますか？", a: "PDFごとに1つのプレーンテキスト（.txt）が得られ、まとめてZIP化されます。翻訳はテキストのみのため、元のレイアウト・画像・書式は保持されません。内容を読んで再利用するのに最適で、書式付きのコピーを作る用途には向きません。" },
      { q: "制限はありますか？スキャンPDFはどうなりますか？", a: "1バッチあたり最大10件のPDFで、各ファイルはおよそ10ページ（14,000文字）までのテキストです。スキャンPDFには選択可能なテキストがないため、先にOCRをかけてください。そうでないと注記付きでスキップされます。" },
      { q: "プライベートで無料ですか？", a: "各PDFはブラウザ内で読み取られ、抽出されたテキストのみ（ファイル自体ではなく）が翻訳のために送られます。無料です。翻訳は毎日リセットされる1日あたりのAI利用枠に計上されます。" },
    ],
  },
  "batch-office-to-pdf": {
    title: "Office一括PDF変換 — よくある質問",
    items: [
      { q: "複数のOfficeファイルを一度にPDFへ変換するには？", a: "Word・PowerPoint・Excelファイルをページにドロップ——フォルダ全体でも可——して、「すべて変換」をクリックします。各ファイルが1つずつPDFに変換され、完了したら「ZIPをダウンロード」をクリックして1つのアーカイブにまとめて受け取ります。" },
      { q: "どの形式を変換できますか？", a: "Word（.doc、.docx）、PowerPoint（.ppt、.pptx）、Excel（.xls、.xlsx）に加え、OpenDocument（.odt、.odp、.ods）と.rtfです。ファイル種別は自動判定されるため、文書・スライド・表計算を同じバッチに混在させられます。" },
      { q: "PDFは元の見た目とまったく同じになりますか？", a: "変換にはLibreOfficeを使用します——単一ファイル版のOffice→PDFツールと同じエンジンです。一般的な文書では忠実な結果になりますが、特殊なフォント・マクロ・非常に複雑なレイアウトはわずかにずれることがあるため、書式に敏感なものは確認してください。" },
      { q: "サイズや件数の制限はありますか？", a: "1バッチあたり最大20ファイル、各ファイル最大5 MBです。5 MBを超えるファイルは、より大きなファイルを扱える単一ファイル版のWord→PDF、PPT→PDF、Excel→PDFツールをお使いください。" },
      { q: "ファイルはアップロードされますか？無料ですか？", a: "無料・アカウント不要です。Office変換は当社自身のサーバーで実行されるため、各ファイルはそこへ送られPDFに変換されて返されます——その後に保存・保持されることはありません。" },
    ],
  },
  "batch-word-to-pdf": {
    title: "Word一括PDF変換 — よくある質問",
    items: [
      { q: "複数のWordファイルを一度にPDFへ変換するには？", a: "Wordファイルをページにドロップ——フォルダ全体でも可——して、「すべて変換」をクリックします。各.docまたは.docxが1つずつPDFに変換され、完了したら「ZIPをダウンロード」をクリックして1つのアーカイブにまとめて受け取ります。" },
      { q: "どのWord形式に対応していますか？", a: "新しい.docxと従来の.docの両方に加え、OpenDocumentテキスト（.odt）と.rtfに対応します。Word・PowerPoint・Excelが混在するバッチには、汎用のOffice→PDFツールをお使いください。" },
      { q: "PDFは元の見た目とまったく同じになりますか？", a: "変換にはLibreOfficeを使用します——単一ファイル版のWord→PDFツールと同じエンジンです。一般的な文書では忠実な結果になりますが、特殊なフォント・マクロ・非常に複雑なレイアウトはわずかにずれることがあるため、書式に敏感なものは確認してください。" },
      { q: "サイズや件数の制限はありますか？", a: "1バッチあたり最大20ファイル、各ファイル最大5 MBです。5 MBを超えるWordファイルは、より大きなファイルを扱える単一ファイル版のWord→PDFツールをお使いください。" },
      { q: "ファイルはアップロードされますか？無料ですか？", a: "無料・アカウント不要です。Office変換は当社自身のサーバーで実行されるため、各ファイルはそこへ送られPDFに変換されて返されます——その後に保存・保持されることはありません。" },
    ],
  },
  "batch-excel-to-pdf": {
    title: "Excel一括PDF変換 — よくある質問",
    items: [
      { q: "複数のExcelファイルを一度にPDFへ変換するには？", a: "表計算ファイルをページにドロップ——フォルダ全体でも可——して、「すべて変換」をクリックします。各.xlsまたは.xlsxが1つずつPDFに変換され、完了したら「ZIPをダウンロード」をクリックして1つのアーカイブにまとめて受け取ります。" },
      { q: "どの表計算形式に対応していますか？", a: "新しい.xlsxと従来の.xlsの両方に加え、OpenDocument表計算（.ods）に対応します。Word・PowerPoint・Excelが混在するバッチには、汎用のOffice→PDFツールをお使いください。" },
      { q: "幅の広いシートはページに収まりますか？", a: "変換にはLibreOfficeを使用し、各シートの印刷範囲とページ設定に従います。そのため、非常に幅の広い表計算は印刷時と同じように複数ページに分かれることがあります。すべてを1ページに収めたい場合は、先にExcelで印刷範囲や拡大縮小を設定してください。" },
      { q: "サイズや件数の制限はありますか？", a: "1バッチあたり最大20ファイル、各ファイル最大5 MBです。5 MBを超えるExcelファイルは、より大きなファイルを扱える単一ファイル版のExcel→PDFツールをお使いください。" },
      { q: "ファイルはアップロードされますか？無料ですか？", a: "無料・アカウント不要です。Office変換は当社自身のサーバーで実行されるため、各ファイルはそこへ送られPDFに変換されて返されます——その後に保存・保持されることはありません。" },
    ],
  },
  "batch-ppt-to-pdf": {
    title: "PowerPoint一括PDF変換 — よくある質問",
    items: [
      { q: "複数のPowerPointファイルを一度にPDFへ変換するには？", a: "PowerPointファイルをページにドロップ——フォルダ全体でも可——して、「すべて変換」をクリックします。各.pptまたは.pptxが1つずつPDFに変換され、完了したら「ZIPをダウンロード」をクリックして1つのアーカイブにまとめて受け取ります。" },
      { q: "どのPowerPoint形式に対応していますか？", a: "新しい.pptxと従来の.pptの両方に加え、OpenDocumentプレゼンテーション（.odp）に対応します。Word・PowerPoint・Excelが混在するバッチには、汎用のOffice→PDFツールをお使いください。" },
      { q: "スライドはPDFでどのように出力されますか？", a: "各スライドが順番どおりPDFの1ページ全体になります。LibreOfficeを使用しており——単一ファイル版のPPT→PDFツールと同じエンジンです。発表者ノートやアニメーションは含まれず、PDFには各スライドの最終的な見た目が収められます。特殊なフォントや非常に複雑なレイアウトはわずかにずれることがあるため、書式に敏感なスライドは確認してください。" },
      { q: "サイズや件数の制限はありますか？", a: "1バッチあたり最大20ファイル、各ファイル最大5 MBです。5 MBを超えるPowerPointファイルは、より大きなファイルを扱える単一ファイル版のPPT→PDFツールをお使いください。" },
      { q: "ファイルはアップロードされますか？無料ですか？", a: "無料・アカウント不要です。Office変換は当社自身のサーバーで実行されるため、各ファイルはそこへ送られPDFに変換されて返されます——その後に保存・保持されることはありません。" },
    ],
  },
  "batch-pdf-to-office": {
    title: "PDF一括Word/Excel変換 — よくある質問",
    items: [
      { q: "複数のPDFを一度にWordまたはExcelへ変換するには？", a: "PDFをページにドロップ——フォルダ全体でも可——して、変換先にWordまたはExcelを選び、「すべて変換」をクリックします。各ファイルが1つずつ変換され、完了したら「ZIPをダウンロード」をクリックして1つのアーカイブにまとめて受け取ります。" },
      { q: "WordとExcelのどちらを選べばよいですか？", a: "テキストと段落が中心の文書にはWord（.docx）を、表で構成されたPDF——請求書・明細書・データシート——にはExcel（.xlsx）を選びます。PDFに明確な行と列がある場合、Excelが最も効果的です。" },
      { q: "レイアウトは元とまったく同じになりますか？", a: "ピクセル単位で完全に同じコピーを約束できる変換ツールはありません。当社はテキストと表を本当に編集可能なファイルへ抽出します。これが編集に必要なものですが、スキャンPDFや凝ったデザインのページは後で手直しが必要なことがあります。通常のテキストと表を持つ電子生成のPDFなら、結果はたいてい近いものになります。" },
      { q: "サイズや件数の制限はありますか？", a: "1バッチあたり最大20件のPDF、各ファイル最大5 MBまで変換できます。5 MBを超えるファイルは、より大きなファイルを扱える単一ファイル版のPDF→WordまたはPDF→Excelツールをお使いください。" },
      { q: "ファイルはアップロードされますか？無料ですか？", a: "無料・アカウント不要です。ブラウザ内のみで動作する他のツールと異なり、Office形式への変換は当社自身のサーバーで実行されるため、各PDFはそこへ送られ変換されて返されます——その後に保存・保持されることはありません。" },
    ],
  },
  "batch-pdf-to-word": {
    title: "PDF一括Word変換 — よくある質問",
    items: [
      { q: "複数のPDFを一度にWordへ変換するには？", a: "PDFをページにドロップ——フォルダ全体でも可——して、「すべて変換」をクリックします。各ファイルが1つずつ編集可能なWord文書に変換され、完了したら「ZIPをダウンロード」をクリックして1つのアーカイブにまとめて受け取ります。" },
      { q: "Wordファイルは元とまったく同じになりますか？", a: "ピクセル単位で完全に同じコピーを約束できる変換ツールはありません。当社はテキストを本当に編集可能な.docxへ抽出します。これが編集に必要なものですが、スキャンPDFや凝ったデザインのページは後で手直しが必要なことがあります。通常のテキストを持つ電子生成のPDFなら、結果はたいてい近いものになります。" },
      { q: "どのPDFが最もよく変換できますか？", a: "テキストベースの電子生成PDFが最もよく変換できます。スキャンPDFには選択可能なテキストがないため——先にOCRをかけてください。そうでないとWordファイルは空で返ってきます。PDFが主に表で構成されている場合は、PDF→Excel変換のほうがたいていきれいな結果になります。" },
      { q: "サイズや件数の制限はありますか？", a: "1バッチあたり最大20件のPDF、各ファイル最大5 MBまで変換できます。5 MBを超えるファイルは、より大きなファイルを扱える単一ファイル版のPDF→Wordツールをお使いください。" },
      { q: "ファイルはアップロードされますか？無料ですか？", a: "無料・アカウント不要です。ブラウザ内のみで動作する他のツールと異なり、Wordへの変換は当社自身のサーバーで実行されるため、各PDFはそこへ送られ変換されて返されます——その後に保存・保持されることはありません。" },
    ],
  },
  "batch-pdf-to-excel": {
    title: "PDF一括Excel変換 — よくある質問",
    items: [
      { q: "複数のPDFを一度にExcelへ変換するには？", a: "PDFをページにドロップ——フォルダ全体でも可——して、「すべて変換」をクリックします。各ファイルが1つずつ編集可能なExcel表計算に変換され、完了したら「ZIPをダウンロード」をクリックして1つのアーカイブにまとめて受け取ります。" },
      { q: "Excelファイルは元とまったく同じになりますか？", a: "ピクセル単位で完全に同じコピーを約束できる変換ツールはありません。当社は表とテキストを本当に編集可能な.xlsxへ抽出します。これが数値を扱うのに必要なものですが、スキャンPDFや凝ったデザインのページは後で手直しが必要なことがあります。明確な表を持つ電子生成のPDFなら、結果はたいてい近いものになります。" },
      { q: "どのPDFが最もよく変換できますか？", a: "明確な表で構成されたPDF——請求書・銀行明細・データシート——が最もよく変換できます。行と列がそのまま表計算のセルに対応するためです。スキャンPDFには選択可能なテキストがないため、先にOCRをかけてください。PDFが表ではなく主に段落で構成されている場合は、PDF→Word変換のほうがたいていきれいな結果になります。" },
      { q: "サイズや件数の制限はありますか？", a: "1バッチあたり最大20件のPDF、各ファイル最大5 MBまで変換できます。5 MBを超えるファイルは、より大きなファイルを扱える単一ファイル版のPDF→Excelツールをお使いください。" },
      { q: "ファイルはアップロードされますか？無料ですか？", a: "無料・アカウント不要です。ブラウザ内のみで動作する他のツールと異なり、Excelへの変換は当社自身のサーバーで実行されるため、各PDFはそこへ送られ変換されて返されます——その後に保存・保持されることはありません。" },
    ],
  },
  "batch-compress": {
    title: "PDF一括圧縮 — よくある質問",
    items: [
      { q: "複数のPDFを一度に圧縮するには？", a: "PDFをページにドラッグ——フォルダ全体をドロップするか「フォルダを選択」を使ってもOK——すると、そのフォルダ内のPDF以外のファイルは自動的に除外されます。圧縮の強さ（「軽め」「推奨」「強め」）を選び、「すべて圧縮」をクリックします。各ファイルが1つずつ処理され、完了したら「ZIPをダウンロード」をクリックして1つのアーカイブにまとめて受け取ります。" },
      { q: "ファイルはサーバーにアップロードされますか？", a: "いいえ。これは100%クライアントサイドのツールです。すべてのPDFはブラウザ内で読み取られ圧縮され、サーバーへ何かが送られることはありません。ファイルがデバイスから出ることはなく、だからこそ機密文書でも安心して使えます。" },
      { q: "何が得られますか？ファイル名はどうなりますか？", a: "1つのZIPファイル（dockdocs-compressed.zip）が得られます。その中で各PDFは元の名前を保ち、拡張子の前に「-compressed」が付きます——つまり report.pdf は report-compressed.pdf になります。各行にはそのファイルがどれだけ縮んだかも表示され、ダウンロードボタンには全体の削減率が表示されます。" },
      { q: "ファイル数やサイズに制限はありますか？", a: "1バッチあたり最大30件のPDFを追加できます。ファイルごとの固定のサイズ上限はありません——すべてブラウザ内で動作するため、実際の上限はデバイスのメモリです。大きいファイルや多数のファイルでも動作しますが、非力なマシンでは処理に時間がかかります。" },
      { q: "なぜPDFがあまり縮まなかったのですか？", a: "圧縮は各ページを画像にレンダリングすることで行われます。スキャンや画像の多いPDFには効果的ですが、主にプレーンテキストのファイルにはほとんど効果がありません——絞り出せるものがあまりないためです。ファイルがほとんど変わらない場合、それは想定どおりです。もう少し縮めたいなら「強め」を試してください。ただしテキストのみのPDFはすでに最小サイズに近いです。" },
      { q: "無料ですか？アカウントは必要ですか？", a: "はい、完全無料です——登録不要、透かしなし、1日あたりの制限もありません。ページを開いてそのまま圧縮を始められます。" },
    ],
  },
  "batch-pdf-to-image": {
    title: "PDF一括画像変換 — よくある質問",
    items: [
      { q: "PDFのバッチを画像へ変換するには？", a: "PDFをアップロードボックスにドラッグ——フォルダ全体をドロップするか「フォルダを選択」をクリックしてもOK——します。JPGまたはPNGを選び、「すべて変換」をクリックします。すべてのPDFのすべてのページが画像になり、結果は1つのZIPとしてダウンロードされます。登録も透かしもありません。" },
      { q: "ファイルはサーバーにアップロードされますか？", a: "いいえ。このツールは100%クライアントサイドです。各PDFはブラウザ内で完全に読み取られ画像にレンダリングされ、サーバーへアップロードされることはありません。ダウンロードするZIPはデバイス上でローカルに作られます。ページが読み込まれた後はオフラインでも実行できます。" },
      { q: "何が得られますか？画像のファイル名はどうなりますか？", a: "各ページを個別の画像として含む1つのZIPファイル（dockdocs-images.zip）が得られます。各ファイルは元のPDF名にページ番号を付けた名前になります——たとえば report.pdf は report-1.jpg、report-2.jpg のようになります。ページは鮮明な高解像度出力のため2倍スケールでレンダリングされます。" },
      { q: "ここでのJPGとPNGの違いは？", a: "JPGはより小さなファイルになり、各ページを白い背景に統合します——写真の多い文書やスキャン文書に最適です。PNGはロスレスで透明を保つため、線画・図版・後で編集するページに向いています。「すべて変換」を押す前に合うほうを選んでください。いつでももう一方の形式で再実行できます。" },
      { q: "一度に何ファイル・何ページ変換できますか？", a: "1バッチあたり最大20件のPDFをキューに入れられます——それを超える分は自動的に除外されます。ページ数やサイズの固定上限はないため、実際の上限はデバイスのメモリです。非常に大きいPDFや膨大なページ数は、非力なマシンでは時間がかかり動作が遅くなるだけです。大きな処理はいくつかのバッチに分けてください。" },
      { q: "なぜPDFの1つが「失敗」と表示されたのですか？", a: "最も多い原因はパスワード保護・暗号化されたPDFです——開けないページはレンダリングできないため、そのファイルは失敗と印が付き、バッチの残りは通常どおり変換されます。先にパスワードを解除し（PDFのロック解除ツールが役立ちます）、もう一度追加してください。破損ファイルやPDF以外のファイルも失敗することがあります。なお、フォルダをドロップした場合、PDF以外のファイルは失敗ではなく自動的に除外されます。" },
    ],
  },
  "batch-protect-pdf": {
    title: "PDF一括暗号化 — よくある質問",
    items: [
      { q: "複数のPDFを一度に暗号化するには？", a: "PDFをボックスにドラッグ——フォルダ全体をドロップするか、クリックしてファイルを選択——します。パスワードを1つ入力し（「パスワード」欄）、「すべて暗号化」をクリックします。すべてのファイルがその同じパスワードでロックされ、各ファイルが「…-protected.pdf」に名前変更された1つのZIPが返されます。" },
      { q: "ファイルはサーバーにアップロードされますか？", a: "いいえ。これは100%クライアントサイドのツールです——すべてのPDFはブラウザ内で暗号化され、何かがデバイスから出ることはありません。アップロードもアカウントもなく、どこにもコピーは保持されません。ページが読み込まれた後はオフラインでも実行できます。" },
      { q: "何が得られますか？どんな形式ですか？", a: "「dockdocs-protected.zip」という名前の1つのZIPファイルが得られます。その中で、入力した各PDFが「-protected.pdf」の接尾辞付きの暗号化ファイルとして入っています。どれを開いてもリーダーは設定したパスワードを尋ねます。" },
      { q: "パスワードのルールやファイル数の制限はありますか？", a: "パスワードは英字・数字・アンダースコア（_）のみを使った4〜32文字でなければなりません——これによりあらゆるPDFリーダーで安全に適用できます。1バッチあたり最大30ファイルを暗号化でき、それ以上はツールをもう一度実行してください。厳密なサイズ上限はありませんが、すべてブラウザ内で動作するため、非常に大きな処理はメモリの少ないデバイスでは遅くなります。" },
      { q: "すでにパスワード保護されたPDFはどうなりますか？", a: "スキップされます。開けないファイルを再ロックすることはできないため、すでにパスワードのあるPDFはバッチ全体を失敗させるのではなくZIPから除外されます。ここで再暗号化したい場合は、まず（元のパスワードで）復号してください。" },
      { q: "本当に無料ですか？透かしや登録はありますか？", a: "はい、完全無料で、登録も透かしもありません。暗号化されたPDFはバイト単位であなたの元ファイルにパスワードを加えたものです——DockDocsは何も追加しません。" },
    ],
  },
};

const FAQS_DE: Record<string, { title: string; items: Array<{ q: string; a: string }> }> = {
  "chat-with-pdf": {
    title: "Mit PDF chatten — Häufige Fragen",
    items: [
      { q: "Wie funktioniert es?", a: "Laden Sie ein textbasiertes PDF hoch, und DockDocs extrahiert dessen Text in Ihrem Browser. Anschließend stellen Sie Fragen, und die KI antwortet anhand des Inhalts dieses Dokuments — nicht anhand von allgemeinem Webwissen. Ein Dokument auf einmal, bis zu 12 Seiten / 40.000 Zeichen / 25 MB pro Datei." },
      { q: "Kann ich den Antworten vertrauen — beruhen sie auf meinem Dokument?", a: "Die Antworten stützen sich auf den aus Ihrem PDF extrahierten Text, und wenn die Antwort der KI mit Stellen in Ihrer Datei übereinstimmt, erscheinen diese unter dem Hinweis „✓ mit der Quelle abgeglichen“ samt den exakten Zitaten, sodass Sie sie selbst prüfen können. Quellenangaben hängen davon ab, was das Modell zurückgibt, und erscheinen nicht bei jeder Antwort; zudem kann die KI sich irren — prüfen Sie alles Wichtige im Originaldokument nach." },
      { q: "Wird mein PDF hochgeladen oder gespeichert?", a: "Der Text wird in Ihrem Browser extrahiert; nur dieser extrahierte Text wird an den KI-Anbieter gesendet, um Ihre Frage zu beantworten, und die Datei selbst verlässt Ihr Gerät nie und wird danach nicht gespeichert." },
      { q: "Welche PDFs funktionieren?", a: "Textbasierte (digital erstellte) PDFs. Gescannte PDFs haben keinen auswählbaren Text — führen Sie zuerst OCR aus, damit der Chat etwas zum Lesen hat. Es funktioniert auf Deutsch, Englisch, Chinesisch, Spanisch, Portugiesisch, Französisch und mehr; die Antworten folgen der Sprache, in der Sie fragen." },
      { q: "Gibt es Grenzen?", a: "DockDocs begrenzt jede Datei auf 25 MB, 12 Seiten und 40.000 Zeichen extrahierten Text; teilen oder komprimieren Sie längere Dokumente zuvor. Es gilt ein kostenloses Tageskontingent — führen Sie ein Upgrade durch, wenn Sie mehr benötigen." },
    ],
  },
  "govbid-matrix": {
    title: "Compliance-Matrix für öffentliche Ausschreibungen — Häufige Fragen",
    items: [
      { q: "Was extrahiert es?", a: "Es liest eine Ausschreibung, eine Leistungsbeschreibung oder ein Vergabedokument und fasst jede verbindliche „shall/must/will“-Anforderung in einer nummerierten Compliance-Matrix zusammen — jede Zeile enthält die Anforderung, ihren Abschnittsbezug und ob sie verpflichtend oder empfehlend ist. Sie können nach ausschließlich verpflichtenden filtern und die gesamte Matrix als CSV exportieren, um sie direkt in Ihr Tracking der Angebotsantwort zu übernehmen." },
      { q: "Kann ich jede Anforderung zur Ausschreibung zurückverfolgen?", a: "Ja — genau darum geht es. Jede Zeile zitiert den exakten Quelltext und zeigt ihren Abschnitt, sodass Sie jede Anforderung im Originaldokument prüfen können, bevor Sie sich in Ihrem Angebot darauf festlegen. Gibt die KI ein Zitat zurück, das wir in Ihrer Datei nicht finden, kennzeichnen wir es als „Zitat nicht überprüfbar“, statt eine erfundene Quellenangabe anzuzeigen. Nichts wird erfunden; was Sie nicht zurückverfolgen können, sehen Sie als nicht zurückverfolgbar." },
      { q: "Ersetzt das, dass ich die Ausschreibung selbst lese?", a: "Nein. Es ist ein schneller erster Durchgang, um sicherzustellen, dass kein „shall/must“ durchrutscht — es ist keine Garantie für Vollständigkeit und keine Compliance- oder Rechtsberatung. Für die Compliance Ihres Angebots bleiben Sie verantwortlich; lesen Sie stets die vollständige Ausschreibung und behandeln Sie alles, was das Tool übersieht, weiterhin als verbindlich." },
      { q: "Wird meine Ausschreibung hochgeladen oder gespeichert?", a: "Ihre Datei wird in Ihrem Browser gelesen; nur der extrahierte Text wird zur Analyse gesendet und danach nicht gespeichert. Die Datei selbst verlässt Ihr Gerät nie — was bei vertraulichen Ausschreibungen und vor der Zuschlagserteilung wichtig ist." },
      { q: "Welche Dokumente funktionieren am besten?", a: "Textbasierte PDFs (digital erstellt). Gescannte Ausschreibungen haben keinen auswählbaren Text — führen Sie zuerst OCR aus. Es funktioniert auf Deutsch, Englisch, Chinesisch, Spanisch, Portugiesisch, Französisch und mehr; Zitate bleiben in der Originalsprache des Dokuments." },
    ],
  },
  "contract-risk": {
    title: "Vertragsrisiko-Prüfung — Häufige Fragen",
    items: [
      { q: "Worauf prüft es?", a: "Es durchsucht Ihren Vertrag nach Klauseln, die einen zweiten Blick verdienen — automatische Verlängerung, einseitige Kündigung oder Änderung, unbegrenzte/nicht gedeckelte Haftung, Vertragsstrafen und Verzugsgebühren, Zahlungsfallen und versteckte Kosten, zu weit gefasstes Wettbewerbsverbot sowie fehlende Standardschutzmechanismen (etwa keine Haftungsobergrenze). Jeder Befund wird rot (hoch), gelb (mittel) oder grün (niedrig) markiert, aus Ihrem Vertrag zitiert und mit einer Begründung in einfacher Sprache sowie Hinweisen versehen, was Sie vor der Unterschrift fragen sollten." },
      { q: "Ist das eine Rechtsberatung?", a: "Nein. Es ist eine automatisierte Prüfung, die einer Person ohne juristische Ausbildung hilft, Klauseln zu erkennen, die Aufmerksamkeit verdienen — es ist keine Rechtsberatung und kein Ersatz für eine Anwältin oder einen Anwalt. Lassen Sie alles Wichtige oder Werthaltige von einer qualifizierten Anwältin oder einem qualifizierten Anwalt prüfen. Werden keine Befunde markiert, ist das keine Garantie dafür, dass der Vertrag sicher ist." },
      { q: "Erfindet es Klauseln oder Zitate?", a: "Jedes Zitat wird mit dem tatsächlichen Text Ihres Vertrags abgeglichen — gibt die KI ein Zitat zurück, das wir in Ihrem Dokument nicht finden, verwerfen wir es, statt eine erfundene Quellenangabe anzuzeigen. Risiken durch fehlende Klauseln werden ohne Zitat und entsprechend gekennzeichnet angezeigt. Die KI kann dennoch Dinge übersehen, lesen Sie also stets den vollständigen Vertrag." },
      { q: "Wird mein Vertrag hochgeladen oder gespeichert?", a: "Ihr Vertrag wird in Ihrem Browser gelesen; nur der extrahierte Text wird zur Analyse gesendet und danach nicht gespeichert. Die Datei selbst verlässt Ihr Gerät nie." },
      { q: "Welche Verträge funktionieren am besten?", a: "Textbasierte PDFs (digital erstellt). Gescannte Verträge haben keinen auswählbaren Text — führen Sie zuerst OCR aus. Es funktioniert auf Deutsch, Englisch, Chinesisch und mehr; Zitate bleiben in der Originalsprache des Vertrags." },
    ],
  },
  "lease-redflag": {
    title: "Mietvertrag-Warnsignal-Prüfung — Häufige Fragen",
    items: [
      { q: "Was markiert es?", a: "Es durchsucht Ihren Mietvertrag nach Klauseln, die Ihnen als Mieterin oder Mieter schaden könnten — aggressive Mietsteigerungen, harte Strafen bei vorzeitiger Kündigung, unangemessene Betretungsrechte des Vermieters, unklare Aufteilung von Instandhaltungskosten, überzogene Abzüge von der Kaution, Untervermietungsbeschränkungen, unfaire Gebühren bei verspäteter Rückgabe sowie fehlende Standardschutzmechanismen (keine Nachfrist, keine Zusicherung der Bewohnbarkeit, kein Recht auf Nachbesserung vor einer Kündigung). Jeder Befund wird rot (hoch), gelb (mittel) oder grün (niedrig) markiert, aus Ihrem Mietvertrag zitiert und mit Hinweisen versehen, was Sie fragen oder verhandeln sollten." },
      { q: "Ist das eine Rechtsberatung?", a: "Nein. Es ist eine automatisierte Prüfung, die Mieterinnen und Mietern hilft, Klauseln zu erkennen, die Aufmerksamkeit verdienen — es ist keine Rechtsberatung und kein Ersatz für eine Anwältin, einen Anwalt oder eine Mieterschutzorganisation. Wenden Sie sich bei allem Wichtigen an eine qualifizierte Anwältin oder einen qualifizierten Anwalt. Werden keine Befunde markiert, ist das keine Garantie dafür, dass der Mietvertrag fair ist." },
      { q: "Erfindet es Zitate?", a: "Jedes Zitat wird mit dem tatsächlichen Text Ihres Mietvertrags abgeglichen — gibt die KI ein Zitat zurück, das wir in Ihrem Dokument nicht finden, verwerfen wir es, statt eine erfundene Quellenangabe anzuzeigen. Risiken durch fehlende Klauseln werden ohne Zitat und entsprechend gekennzeichnet angezeigt." },
      { q: "Wird mein Mietvertrag hochgeladen oder gespeichert?", a: "Ihr Mietvertrag wird in Ihrem Browser gelesen; nur der extrahierte Text wird zur Analyse gesendet und danach nicht gespeichert. Die Datei selbst verlässt Ihr Gerät nie." },
      { q: "Welche Mietvertragsformate funktionieren?", a: "Textbasierte PDFs (digital erstellt). Gescannte Mietverträge haben keinen auswählbaren Text — führen Sie zuerst OCR aus. Es funktioniert auf Deutsch, Englisch, Chinesisch und mehr; Zitate bleiben in der Originalsprache des Mietvertrags." },
    ],
  },
  "batch-translate": {
    title: "Dokumente übersetzen — Häufige Fragen",
    items: [
      { q: "Wie übersetze ich mehrere PDFs auf einmal?", a: "Ziehen Sie Ihre PDFs auf die Seite — oder einen ganzen Ordner —, wählen Sie die Zielsprache und klicken Sie auf „Alle übersetzen“. Jedes PDF wird in Ihrem Browser gelesen, sein Text wird nacheinander übersetzt, und Sie laden alle als ein einziges ZIP mit .txt-Dateien herunter." },
      { q: "In welche Sprachen kann ich übersetzen?", a: "13 Sprachen, darunter Englisch, vereinfachtes und traditionelles Chinesisch, Spanisch, Französisch, Deutsch, Japanisch, Koreanisch, Portugiesisch, Italienisch, Russisch, Arabisch und Hindi. Der gesamte Stapel wird in die eine von Ihnen gewählte Sprache übersetzt." },
      { q: "Was erhalte ich zurück — bleibt das Layout erhalten?", a: "Sie erhalten reinen Text (.txt), eine Datei pro PDF, zusammen gepackt. Die Übersetzung erfolgt nur als Text, daher bleiben das ursprüngliche Layout, Bilder und die Formatierung nicht erhalten. Sie eignet sich am besten zum Lesen und Wiederverwenden des Inhalts, nicht zum Erstellen einer formatierten Kopie." },
      { q: "Gibt es eine Grenze, und was ist mit gescannten PDFs?", a: "Bis zu 10 PDFs pro Stapel, jeweils mit bis zu etwa 10 Seiten (14.000 Zeichen) Text. Gescannte PDFs haben keinen auswählbaren Text, führen Sie also zuerst OCR aus; andernfalls werden sie mit einem Hinweis übersprungen." },
      { q: "Ist es privat und kostenlos?", a: "Jedes PDF wird in Ihrem Browser gelesen, und nur der extrahierte Text — nie die Datei — wird zur Übersetzung gesendet. Es ist kostenlos; die Übersetzung wird auf Ihr tägliches KI-Nutzungslimit angerechnet, das täglich zurückgesetzt wird." },
    ],
  },
  "batch-office-to-pdf": {
    title: "Office im Stapel in PDF — Häufige Fragen",
    items: [
      { q: "Wie konvertiere ich mehrere Office-Dateien auf einmal in PDF?", a: "Ziehen Sie Ihre Word-, PowerPoint- und Excel-Dateien auf die Seite — oder einen ganzen Ordner — und klicken Sie dann auf „Alle konvertieren“. Jede Datei wird nacheinander in PDF konvertiert, und wenn sie fertig sind, klicken Sie auf „ZIP herunterladen“, um sie alle in einem einzigen Archiv zu erhalten." },
      { q: "Welche Formate kann ich konvertieren?", a: "Word (.doc, .docx), PowerPoint (.ppt, .pptx), Excel (.xls, .xlsx) sowie OpenDocument (.odt, .odp, .ods) und .rtf. Der Dateityp wird automatisch erkannt, sodass Sie Dokumente, Folien und Tabellen im selben Stapel mischen können." },
      { q: "Sieht das PDF genauso aus wie das Original?", a: "Die Konvertierung nutzt LibreOffice — dieselbe Engine wie hinter unseren Einzeldatei-Tools für Office in PDF. Bei typischen Dokumenten ist das Ergebnis originalgetreu, aber ungewöhnliche Schriftarten, Makros oder sehr komplexe Layouts können leicht verrutschen, prüfen Sie also alles Formatierungsempfindliche." },
      { q: "Gibt es eine Größen- oder Anzahlbegrenzung?", a: "Bis zu 20 Dateien pro Stapel, jeweils bis zu 5 MB. Verwenden Sie für eine Datei über 5 MB das Einzeldatei-Tool Word in PDF, PPT in PDF oder Excel in PDF, das größere Dateien verarbeitet." },
      { q: "Werden meine Dateien hochgeladen, und ist es kostenlos?", a: "Es ist kostenlos und ohne Konto. Die Office-Konvertierung läuft auf unserem eigenen Server, daher wird jede Datei dorthin gesendet, in PDF konvertiert und zurückgegeben — sie wird danach nicht gespeichert oder aufbewahrt." },
    ],
  },
  "batch-word-to-pdf": {
    title: "Word im Stapel in PDF — Häufige Fragen",
    items: [
      { q: "Wie konvertiere ich mehrere Word-Dateien auf einmal in PDF?", a: "Ziehen Sie Ihre Word-Dateien auf die Seite — oder einen ganzen Ordner — und klicken Sie dann auf „Alle konvertieren“. Jede .doc- oder .docx-Datei wird nacheinander in PDF konvertiert, und wenn sie fertig sind, klicken Sie auf „ZIP herunterladen“, um sie alle in einem einzigen Archiv zu erhalten." },
      { q: "Welche Word-Formate werden unterstützt?", a: "Sowohl das moderne .docx als auch das ältere .doc, dazu OpenDocument-Text (.odt) und .rtf. Verwenden Sie für gemischte Stapel aus Word, PowerPoint und Excel zusammen stattdessen das allgemeine Tool Office in PDF." },
      { q: "Sieht das PDF genauso aus wie das Original?", a: "Die Konvertierung nutzt LibreOffice — dieselbe Engine wie hinter unserem Einzeldatei-Tool Word in PDF. Bei typischen Dokumenten ist das Ergebnis originalgetreu, aber ungewöhnliche Schriftarten, Makros oder sehr komplexe Layouts können leicht verrutschen, prüfen Sie also alles Formatierungsempfindliche." },
      { q: "Gibt es eine Größen- oder Anzahlbegrenzung?", a: "Bis zu 20 Dateien pro Stapel, jeweils bis zu 5 MB. Verwenden Sie für eine Word-Datei über 5 MB das Einzeldatei-Tool Word in PDF, das größere Dateien verarbeitet." },
      { q: "Werden meine Dateien hochgeladen, und ist es kostenlos?", a: "Es ist kostenlos und ohne Konto. Die Office-Konvertierung läuft auf unserem eigenen Server, daher wird jede Datei dorthin gesendet, in PDF konvertiert und zurückgegeben — sie wird danach nicht gespeichert oder aufbewahrt." },
    ],
  },
  "batch-excel-to-pdf": {
    title: "Excel im Stapel in PDF — Häufige Fragen",
    items: [
      { q: "Wie konvertiere ich mehrere Excel-Dateien auf einmal in PDF?", a: "Ziehen Sie Ihre Tabellen auf die Seite — oder einen ganzen Ordner — und klicken Sie dann auf „Alle konvertieren“. Jede .xls- oder .xlsx-Datei wird nacheinander in PDF konvertiert, und wenn sie fertig sind, klicken Sie auf „ZIP herunterladen“, um sie alle in einem einzigen Archiv zu erhalten." },
      { q: "Welche Tabellenformate werden unterstützt?", a: "Sowohl das moderne .xlsx als auch das ältere .xls, dazu OpenDocument-Tabellen (.ods). Verwenden Sie für gemischte Stapel aus Word, PowerPoint und Excel zusammen stattdessen das allgemeine Tool Office in PDF." },
      { q: "Passen breite Tabellenblätter auf die Seite?", a: "Die Konvertierung nutzt LibreOffice und folgt dem Druckbereich und der Seiteneinrichtung jedes Tabellenblatts, sodass sehr breite Tabellen über mehrere Seiten verteilt werden können, genau wie beim Drucken. Stellen Sie zuerst den Druckbereich oder die Skalierung in Excel ein, wenn alles auf eine Seite passen soll." },
      { q: "Gibt es eine Größen- oder Anzahlbegrenzung?", a: "Bis zu 20 Dateien pro Stapel, jeweils bis zu 5 MB. Verwenden Sie für eine Excel-Datei über 5 MB das Einzeldatei-Tool Excel in PDF, das größere Dateien verarbeitet." },
      { q: "Werden meine Dateien hochgeladen, und ist es kostenlos?", a: "Es ist kostenlos und ohne Konto. Die Office-Konvertierung läuft auf unserem eigenen Server, daher wird jede Datei dorthin gesendet, in PDF konvertiert und zurückgegeben — sie wird danach nicht gespeichert oder aufbewahrt." },
    ],
  },
  "batch-ppt-to-pdf": {
    title: "PowerPoint im Stapel in PDF — Häufige Fragen",
    items: [
      { q: "Wie konvertiere ich mehrere PowerPoint-Dateien auf einmal in PDF?", a: "Ziehen Sie Ihre PowerPoint-Dateien auf die Seite — oder einen ganzen Ordner — und klicken Sie dann auf „Alle konvertieren“. Jede .ppt- oder .pptx-Datei wird nacheinander in PDF konvertiert, und wenn sie fertig sind, klicken Sie auf „ZIP herunterladen“, um sie alle in einem einzigen Archiv zu erhalten." },
      { q: "Welche PowerPoint-Formate werden unterstützt?", a: "Sowohl das moderne .pptx als auch das ältere .ppt, dazu OpenDocument-Präsentationen (.odp). Verwenden Sie für gemischte Stapel aus Word, PowerPoint und Excel zusammen stattdessen das allgemeine Tool Office in PDF." },
      { q: "Wie werden die Folien im PDF dargestellt?", a: "Jede Folie wird der Reihe nach zu einer vollen PDF-Seite, mit LibreOffice — derselben Engine wie unser Einzeldatei-Tool PPT in PDF. Notizen für Vortragende und Animationen sind nicht enthalten; das PDF erfasst das endgültige Erscheinungsbild jeder Folie. Ungewöhnliche Schriftarten oder sehr komplexe Layouts können leicht verrutschen, prüfen Sie also formatierungsempfindliche Präsentationen." },
      { q: "Gibt es eine Größen- oder Anzahlbegrenzung?", a: "Bis zu 20 Dateien pro Stapel, jeweils bis zu 5 MB. Verwenden Sie für eine PowerPoint-Datei über 5 MB das Einzeldatei-Tool PPT in PDF, das größere Dateien verarbeitet." },
      { q: "Werden meine Dateien hochgeladen, und ist es kostenlos?", a: "Es ist kostenlos und ohne Konto. Die Office-Konvertierung läuft auf unserem eigenen Server, daher wird jede Datei dorthin gesendet, in PDF konvertiert und zurückgegeben — sie wird danach nicht gespeichert oder aufbewahrt." },
    ],
  },
  "batch-pdf-to-office": {
    title: "PDF im Stapel in Word/Excel — Häufige Fragen",
    items: [
      { q: "Wie konvertiere ich mehrere PDFs auf einmal in Word oder Excel?", a: "Ziehen Sie Ihre PDFs auf die Seite — oder einen ganzen Ordner —, wählen Sie Word oder Excel als Ziel und klicken Sie dann auf „Alle konvertieren“. Jede Datei wird nacheinander konvertiert, und wenn sie fertig sind, klicken Sie auf „ZIP herunterladen“, um sie alle in einem einzigen Archiv zurückzuerhalten." },
      { q: "Soll ich Word oder Excel wählen?", a: "Wählen Sie Word (.docx) für Dokumente, die überwiegend aus Text und Absätzen bestehen, und Excel (.xlsx) für PDFs, die aus Tabellen aufgebaut sind — Rechnungen, Kontoauszüge, Datenblätter. Excel funktioniert am besten, wenn das PDF klare Zeilen und Spalten hat." },
      { q: "Sieht das Layout genauso aus wie das Original?", a: "Kein Konverter kann eine pixelgenaue Kopie versprechen. Wir extrahieren den Text und die Tabellen in eine wirklich bearbeitbare Datei, was Sie zum Bearbeiten brauchen — aber gescannte PDFs oder aufwendig gestaltete Seiten erfordern danach möglicherweise eine Nachbearbeitung. Bei einem digital erstellten PDF mit normalem Text und Tabellen sind die Ergebnisse meist nah dran." },
      { q: "Gibt es eine Größen- oder Anzahlbegrenzung?", a: "Sie können bis zu 20 PDFs pro Stapel konvertieren, jeweils bis zu 5 MB. Verwenden Sie für eine Datei über 5 MB das Einzeldatei-Tool PDF in Word oder PDF in Excel, das größere Dateien verarbeitet." },
      { q: "Werden meine Dateien hochgeladen, und ist es kostenlos?", a: "Es ist kostenlos und ohne Konto. Anders als bei unseren reinen Browser-Tools läuft die Konvertierung in Office-Formate auf unserem eigenen Server, daher wird jedes PDF dorthin gesendet, konvertiert und zurückgegeben — es wird danach nicht gespeichert oder aufbewahrt." },
    ],
  },
  "batch-pdf-to-word": {
    title: "PDF im Stapel in Word — Häufige Fragen",
    items: [
      { q: "Wie konvertiere ich mehrere PDFs auf einmal in Word?", a: "Ziehen Sie Ihre PDFs auf die Seite — oder einen ganzen Ordner — und klicken Sie dann auf „Alle konvertieren“. Jede Datei wird nacheinander in ein bearbeitbares Word-Dokument konvertiert, und wenn sie fertig sind, klicken Sie auf „ZIP herunterladen“, um sie alle in einem einzigen Archiv zurückzuerhalten." },
      { q: "Sieht die Word-Datei genauso aus wie das Original?", a: "Kein Konverter kann eine pixelgenaue Kopie versprechen. Wir extrahieren den Text in eine wirklich bearbeitbare .docx-Datei, was Sie zum Bearbeiten brauchen — aber gescannte PDFs oder aufwendig gestaltete Seiten erfordern danach möglicherweise eine Nachbearbeitung. Bei einem digital erstellten PDF mit normalem Text sind die Ergebnisse meist nah dran." },
      { q: "Welche PDFs lassen sich am besten konvertieren?", a: "Textbasierte, digital erstellte PDFs lassen sich am besten konvertieren. Gescannte PDFs haben keinen auswählbaren Text — führen Sie zuerst OCR aus, sonst kommt die Word-Datei leer zurück. Ist Ihr PDF überwiegend aus Tabellen aufgebaut, liefert der Konverter PDF in Excel meist ein saubereres Ergebnis." },
      { q: "Gibt es eine Größen- oder Anzahlbegrenzung?", a: "Sie können bis zu 20 PDFs pro Stapel konvertieren, jeweils bis zu 5 MB. Verwenden Sie für eine Datei über 5 MB das Einzeldatei-Tool PDF in Word, das größere Dateien verarbeitet." },
      { q: "Werden meine Dateien hochgeladen, und ist es kostenlos?", a: "Es ist kostenlos und ohne Konto. Anders als bei unseren reinen Browser-Tools läuft die Konvertierung in Word auf unserem eigenen Server, daher wird jedes PDF dorthin gesendet, konvertiert und zurückgegeben — es wird danach nicht gespeichert oder aufbewahrt." },
    ],
  },
  "batch-pdf-to-excel": {
    title: "PDF im Stapel in Excel — Häufige Fragen",
    items: [
      { q: "Wie konvertiere ich mehrere PDFs auf einmal in Excel?", a: "Ziehen Sie Ihre PDFs auf die Seite — oder einen ganzen Ordner — und klicken Sie dann auf „Alle konvertieren“. Jede Datei wird nacheinander in eine bearbeitbare Excel-Tabelle konvertiert, und wenn sie fertig sind, klicken Sie auf „ZIP herunterladen“, um sie alle in einem einzigen Archiv zurückzuerhalten." },
      { q: "Sieht die Excel-Datei genauso aus wie das Original?", a: "Kein Konverter kann eine pixelgenaue Kopie versprechen. Wir extrahieren die Tabellen und den Text in eine wirklich bearbeitbare .xlsx-Datei, was Sie zum Arbeiten mit den Zahlen brauchen — aber gescannte PDFs oder aufwendig gestaltete Seiten erfordern danach möglicherweise eine Nachbearbeitung. Bei einem digital erstellten PDF mit klaren Tabellen sind die Ergebnisse meist nah dran." },
      { q: "Welche PDFs lassen sich am besten konvertieren?", a: "PDFs, die aus klaren Tabellen aufgebaut sind — Rechnungen, Kontoauszüge, Datenblätter —, lassen sich am besten konvertieren, weil die Zeilen und Spalten direkt in die Tabellenzellen übertragen werden. Gescannte PDFs haben keinen auswählbaren Text, führen Sie also zuerst OCR aus. Ist Ihr PDF überwiegend aus Absätzen statt aus Tabellen aufgebaut, liefert der Konverter PDF in Word meist ein saubereres Ergebnis." },
      { q: "Gibt es eine Größen- oder Anzahlbegrenzung?", a: "Sie können bis zu 20 PDFs pro Stapel konvertieren, jeweils bis zu 5 MB. Verwenden Sie für eine Datei über 5 MB das Einzeldatei-Tool PDF in Excel, das größere Dateien verarbeitet." },
      { q: "Werden meine Dateien hochgeladen, und ist es kostenlos?", a: "Es ist kostenlos und ohne Konto. Anders als bei unseren reinen Browser-Tools läuft die Konvertierung in Excel auf unserem eigenen Server, daher wird jedes PDF dorthin gesendet, konvertiert und zurückgegeben — es wird danach nicht gespeichert oder aufbewahrt." },
    ],
  },
  "batch-compress": {
    title: "PDF im Stapel komprimieren — Häufige Fragen",
    items: [
      { q: "Wie komprimiere ich mehrere PDFs auf einmal?", a: "Ziehen Sie Ihre PDFs auf die Seite — oder legen Sie einen ganzen Ordner ab oder nutzen Sie „Ordner wählen“ — und alle Nicht-PDF-Dateien in diesem Ordner werden automatisch herausgefiltert. Wählen Sie eine Komprimierungsstärke („Leicht“, „Empfohlen“ oder „Stark“) und klicken Sie dann auf „Alle komprimieren“. Jede Datei wird nacheinander verarbeitet, und wenn sie fertig ist, klicken Sie auf „ZIP herunterladen“, um sie alle in einem einzigen Archiv zurückzuerhalten." },
      { q: "Werden meine Dateien auf einen Server hochgeladen?", a: "Nein. Dies ist ein zu 100 % clientseitiges Tool: Jedes PDF wird direkt in Ihrem Browser gelesen und komprimiert, und nichts wird je an einen Server gesendet. Ihre Dateien verlassen Ihr Gerät nie, weshalb Sie es auch bei vertraulichen Dokumenten bedenkenlos verwenden können." },
      { q: "Was erhalte ich zurück, und wie werden die Dateien benannt?", a: "Sie erhalten eine einzige ZIP-Datei (dockdocs-compressed.zip). Darin behält jedes PDF seinen ursprünglichen Namen mit dem Zusatz „-compressed“ vor der Erweiterung — aus report.pdf wird also report-compressed.pdf. Jede Zeile zeigt außerdem, wie stark diese Datei geschrumpft ist, und die Download-Schaltfläche zeigt die gesamte Größenreduzierung." },
      { q: "Gibt es eine Grenze, wie viele Dateien oder wie groß sie sein dürfen?", a: "Sie können bis zu 30 PDFs pro Stapel hinzufügen. Es gibt keine feste Größenobergrenze pro Datei — da alles in Ihrem Browser läuft, ist die tatsächliche Grenze der Arbeitsspeicher Ihres Geräts. Große oder zahlreiche Dateien funktionieren weiterhin, brauchen auf einem schwächeren Gerät nur länger." },
      { q: "Warum ist mein PDF kaum geschrumpft?", a: "Die Komprimierung funktioniert, indem jede Seite als Bild gerendert wird, was bei Scans und bildlastigen PDFs hervorragend ist, aber bei Dateien, die überwiegend aus reinem Text bestehen, wenig bewirkt — es gibt schlicht nicht viel herauszuholen. Ändert sich eine Datei kaum, ist das zu erwarten; versuchen Sie „Stark“ für etwas mehr, aber reine Text-PDFs sind bereits nah an ihrer Mindestgröße." },
      { q: "Ist es kostenlos? Brauche ich ein Konto?", a: "Ja, es ist vollständig kostenlos — keine Anmeldung, kein Wasserzeichen, kein Tageslimit. Öffnen Sie einfach die Seite und beginnen Sie mit dem Komprimieren." },
    ],
  },
  "batch-pdf-to-image": {
    title: "PDF im Stapel in Bild — Häufige Fragen",
    items: [
      { q: "Wie konvertiere ich einen Stapel PDFs in Bilder?", a: "Ziehen Sie Ihre PDFs auf das Upload-Feld — oder legen Sie einen ganzen Ordner ab oder klicken Sie auf „Ordner wählen“, um einen auszuwählen. Wählen Sie JPG oder PNG und klicken Sie dann auf „Alle konvertieren“. Jede Seite jedes PDFs wird in ein Bild umgewandelt, und das Ergebnis wird als ein einziges ZIP heruntergeladen. Es gibt keine Anmeldung und kein Wasserzeichen." },
      { q: "Werden meine Dateien auf einen Server hochgeladen?", a: "Nein. Dieses Tool ist zu 100 % clientseitig: Jedes PDF wird vollständig in Ihrem Browser gelesen und in Bilder gerendert, und nichts wird je auf einen Server hochgeladen. Das ZIP, das Sie herunterladen, wird lokal auf Ihrem Gerät erstellt. Sie können es sogar offline ausführen, sobald die Seite geladen ist." },
      { q: "Was erhalte ich zurück, und wie werden die Bilder benannt?", a: "Sie erhalten eine ZIP-Datei (mit dem Namen dockdocs-images.zip), die jede Seite als separates Bild enthält. Jede Datei wird nach ihrem Quell-PDF plus der Seitennummer benannt — aus report.pdf werden zum Beispiel report-1.jpg, report-2.jpg und so weiter. Die Seiten werden mit 2-facher Skalierung für eine gestochen scharfe, hochauflösende Ausgabe gerendert." },
      { q: "Was ist hier der Unterschied zwischen JPG und PNG?", a: "JPG ergibt kleinere Dateien und legt jede Seite auf einen weißen Hintergrund — ideal für fotolastige oder gescannte Dokumente. PNG ist verlustfrei und bewahrt Transparenz, was bei Strichzeichnungen, Diagrammen oder Seiten, die Sie später bearbeiten, besser ist. Wählen Sie das Passende, bevor Sie auf „Alle konvertieren“ klicken; Sie können jederzeit mit dem anderen Format erneut ausführen." },
      { q: "Wie viele Dateien oder Seiten kann ich auf einmal konvertieren?", a: "Sie können bis zu 20 PDFs pro Stapel einreihen — darüber hinausgehende Dateien werden automatisch verworfen. Es gibt keine feste Seiten- oder Größenbegrenzung, die tatsächliche Obergrenze ist also der Arbeitsspeicher Ihres Geräts: Sehr große PDFs oder enorme Seitenzahlen brauchen einfach länger und laufen auf schwächeren Geräten langsamer. Teilen Sie einen großen Auftrag in einige Stapel auf." },
      { q: "Warum wurde eines meiner PDFs als „fehlgeschlagen“ angezeigt?", a: "Die häufigste Ursache ist ein passwortgeschütztes oder verschlüsseltes PDF — das Tool kann keine Seiten rendern, die es nicht öffnen kann, daher wird diese Datei als fehlgeschlagen markiert, während der Rest des Stapels normal konvertiert. Entfernen Sie zuerst das Passwort (unser Tool PDF entsperren hilft dabei) und fügen Sie es dann wieder hinzu. Auch beschädigte oder Nicht-PDF-Dateien können fehlschlagen; wenn Sie einen Ordner ablegen, werden Nicht-PDF-Dateien jedoch automatisch herausgefiltert, statt fehlzuschlagen." },
    ],
  },
  "batch-protect-pdf": {
    title: "PDF im Stapel verschlüsseln — Häufige Fragen",
    items: [
      { q: "Wie verschlüssele ich mehrere PDFs auf einmal?", a: "Ziehen Sie Ihre PDFs auf das Feld — oder legen Sie einen ganzen Ordner ab oder klicken Sie, um Dateien auszuwählen. Geben Sie ein Passwort ein (Feld „Passwort“) und klicken Sie dann auf „Alle verschlüsseln“. Jede Datei wird mit demselben Passwort gesperrt, und Sie erhalten ein einziges ZIP zurück, in dem jede Datei in „…-protected.pdf“ umbenannt ist." },
      { q: "Werden meine Dateien auf einen Server hochgeladen?", a: "Nein. Dies ist ein zu 100 % clientseitiges Tool — jedes PDF wird direkt in Ihrem Browser verschlüsselt, und nichts verlässt je Ihr Gerät. Es gibt keinen Upload, kein Konto und keine irgendwo aufbewahrte Kopie. Sie können es sogar offline ausführen, sobald die Seite geladen ist." },
      { q: "Was erhalte ich zurück, und in welchem Format?", a: "Sie erhalten eine ZIP-Datei mit dem Namen „dockdocs-protected.zip“. Darin erscheint jedes eingegebene PDF als eigene verschlüsselte Datei mit dem Suffix „-protected.pdf“. Öffnen Sie eine davon, und Ihr Reader fragt nach dem von Ihnen festgelegten Passwort." },
      { q: "Gibt es Regeln für das Passwort oder Grenzen für die Anzahl der Dateien?", a: "Das Passwort muss 4–32 Zeichen lang sein und darf nur Buchstaben, Ziffern und den Unterstrich (_) enthalten — das hält es sicher anwendbar über jeden PDF-Reader hinweg. Sie können bis zu 30 Dateien pro Stapel verschlüsseln; für mehr führen Sie das Tool einfach erneut aus. Es gibt keine feste Größengrenze, aber da alles in Ihrem Browser läuft, gehen sehr große Aufträge auf Geräten mit wenig Arbeitsspeicher langsamer." },
      { q: "Was passiert mit einem PDF, das bereits passwortgeschützt ist?", a: "Es wird übersprungen. Das Tool kann eine Datei, die es nicht öffnen kann, nicht erneut sperren, daher wird jedes PDF, das bereits ein Passwort hat, aus dem ZIP ausgelassen, statt den gesamten Stapel scheitern zu lassen. Entschlüsseln Sie es zuerst (mit dem ursprünglichen Passwort), wenn Sie es hier erneut verschlüsseln möchten." },
      { q: "Ist es wirklich kostenlos? Wasserzeichen oder Anmeldung?", a: "Ja, vollständig kostenlos, ohne Anmeldung und ohne Wasserzeichen. Die verschlüsselten PDFs sind Byte für Byte Ihre Originale plus das Passwort — DockDocs fügt ihnen nichts hinzu." },
    ],
  },
  "flashcards": {
    title: "PDF-Lernkarten — Häufige Fragen",
    items: [
      { q: "Wie verwandle ich ein PDF in Lernkarten?", a: "Legen Sie ein PDF ab — ein Lehrbuchkapitel, Vorlesungsnotizen oder ein Handbuch —, und das Tool liest den Text direkt in Ihrem Browser. Wählen Sie, wie viele Karten Sie möchten (5, 10, 15 oder 20), und drücken Sie auf „Karten erzeugen“. Sie erhalten ein Raster aus Frage-/Antwort-Karten; tippen Sie auf eine beliebige Karte, um sie umzudrehen und sich selbst abzufragen." },
      { q: "Wird mein PDF irgendwohin hochgeladen?", a: "Ihre PDF-Datei wird nie hochgeladen. Der Text wird in Ihrem Browser extrahiert, und nur dieser reine Text (plus Ihre Kartenanzahl und Sprache) wird an unseren KI-Dienst gesendet, um die Karten zu schreiben. Die Originaldatei mit ihren Bildern, ihrem Layout und ihren Metadaten bleibt auf Ihrem Gerät." },
      { q: "Warum erscheint „Kein Text in diesem PDF gefunden“?", a: "Ihr PDF ist ein Scan oder ein Bild — es hat keine Textebene zum Lesen, nur ein Bild der Seite. Führen Sie es zuerst durch OCR, um eine durchsuchbare Textebene hinzuzufügen, und versuchen Sie es dann erneut. Tipp: Ist das PDF passwortgeschützt, entsperren Sie es zuerst mit dem Tool „PDF entsperren“." },
      { q: "Sind die Karten korrekt?", a: "Die Karten werden von der KI ausschließlich anhand des Textes Ihres Dokuments geschrieben — sie ist angewiesen, kein externes Wissen zu verwenden und keine Fakten zu erfinden. Dennoch kann die KI etwas falsch lesen oder zu stark vereinfachen, prüfen Sie die Karten also kurz, bevor Sie damit lernen. Das Tool erinnert Sie im Ergebnisbildschirm daran." },
      { q: "Gibt es eine Größen- oder Nutzungsgrenze?", a: "Ja. Jeder Durchlauf nimmt bis zu etwa 16.000 Zeichen Text an — ungefähr 12 Seiten —, geben Sie ihm also jeweils ein Kapitel oder einen Abschnitt, nicht ein ganzes Buch. Es gibt außerdem eine Fair-Use-Ratenbegrenzung von etwa sechs Erzeugungen pro Minute. Wenn Sie eine der Grenzen erreichen, sehen Sie eine klare Meldung; kürzen Sie einfach den Inhalt oder warten Sie eine Minute." },
      { q: "Ist es kostenlos, und brauche ich eine Internetverbindung?", a: "Die Nutzung ist kostenlos — kein Konto und keine Zahlung nötig. Da die Karten von einem KI-Dienst geschrieben werden, benötigen Sie eine Internetverbindung: Der Browser liest Ihr PDF offline, aber das Erzeugen der Karten löst einen kurzen Aufruf an unseren Server aus." },
    ],
  },
  "compare": {
    title: "Dokumente vergleichen — Häufige Fragen",
    items: [
      { q: "Wie vergleiche ich Dokumente?", a: "Laden Sie 2 bis 8 PDFs derselben Art hoch — Angebote, Rechnungen oder Verträge —, wählen Sie dann den Typ und klicken Sie auf „Felder vergleichen“. DockDocs stellt die wichtigsten Konditionen (Preis, Lieferung, Zahlung, Garantie und so weiter) nebeneinander in einer Tabelle dar und zeigt die exakte Quellzeile hinter jedem Wert, wo immer es eine finden kann (und „Nicht erkannt“, wenn ein Dokument etwas nicht angibt, nie eine Vermutung). Sie erhalten außerdem eine durch diese verglichenen Zahlen gestützte Empfehlung, welche Option gewinnt, und Sie können eine Frage über alle Dokumente auf einmal stellen." },
      { q: "Werden meine Dateien auf Ihren Server hochgeladen?", a: "Nein — Ihre PDFs verlassen Ihr Gerät nie. DockDocs liest sie direkt in Ihrem Browser, um den Text herauszuziehen. Nur dieser extrahierte reine Text (nicht die Datei selbst) wird an unseren Server gesendet, wo die KI die Felder extrahiert und ausrichtet. Das Dokument, sein Layout und alle eingebetteten Daten bleiben also lokal; was reist, sind die Wörter auf der Seite." },
      { q: "Warum steht bei meinem PDF „Nicht erkannt (wahrscheinlich gescannt — OCR nötig)“?", a: "Das bedeutet, dass das PDF keine auswählbare Textebene hat — meist ein Scan oder ein Foto einer Seite, es gibt also nichts zu lesen. Klicken Sie bei diesem Dokument auf „Text mit OCR extrahieren“, und DockDocs führt OCR in Ihrem Browser aus, um den Text zu erkennen (die ersten paar Seiten), danach können Sie es wie jede andere Datei vergleichen. Verschlüsselte oder passwortgeschützte PDFs lassen sich ebenfalls nicht lesen, bis sie entsperrt sind." },
      { q: "Was erhalte ich zurück, und kann ich den Werten vertrauen?", a: "Sie erhalten eine Vergleichstabelle, in der jede Zelle den Wert plus die exakte Quellzeile zeigt, aus der er stammt — und diese Zeile ist daraufhin geprüft, dass sie tatsächlich in Ihrem Dokument vorkommt, sodass nichts erfunden wird. Klicken Sie auf eine beliebige Quellzeile, um zu einem hervorgehobenen Ausschnitt des Originaltextes zu springen. Gibt ein Dokument etwas schlicht nicht an, sehen Sie „Nicht erkannt“ statt einer Vermutung. Ein Vorbehalt: Die Gesamtempfehlung ist die Schlussfolgerung der KI über diese Zahlen und wird nicht einzeln quellengeprüft, bestätigen Sie die Zahlen in der Tabelle also, bevor Sie entscheiden." },
      { q: "Gibt es eine Grenze für Dateianzahl oder -größe?", a: "Sie können bis zu 8 PDFs auf einmal vergleichen und benötigen mindestens 2 lesbare, damit der Vergleich läuft. Für die Funktion „über Dokumente hinweg fragen“ muss der kombinierte Text aller Dokumente unter 60.000 Zeichen und Ihre Frage unter 500 Zeichen bleiben — wenn Sie das erreichen, verwenden Sie weniger oder kürzere Dokumente. Das Tool benötigt eine Internetverbindung, da die Feldextraktion und die Empfehlung auf unserem Server laufen." },
      { q: "Ist es kostenlos?", a: "Ja — Sie können Ihre PDFs hochladen, den Vergleich nebeneinander ausführen, die Empfehlung erhalten und Fragen über Ihre Dokumente hinweg stellen. Die OCR im Browser für gescannte Dateien ist ebenfalls kostenlos, da sie lokal auf Ihrem Gerät läuft." },
    ],
  },
  "merge-pdf": {
    title: "PDF-Dateien zusammenfügen — Häufige Fragen",
    items: [
      { q: "Wie führe ich PDF-Dateien zusammen?", a: "Fügen Sie zwei oder mehr PDFs hinzu, ziehen Sie die Datei-Miniaturansichten in die gewünschte Reihenfolge und klicken Sie dann auf „Zusammenfügen & herunterladen“. Die Seiten werden in dieser Reihenfolge von oben nach unten zu einem einzigen PDF kombiniert." },
      { q: "Kann ich die Reihenfolge der Kombination steuern?", a: "Ja. Jede Datei zeigt eine Miniaturansicht und ein Nummern-Abzeichen — ziehen Sie sie herum, um sie vor dem Zusammenfügen neu anzuordnen. Sie sehen genau, was wohin kommt, bevor Sie klicken, nicht danach." },
      { q: "Werden meine Dateien auf einen Server hochgeladen?", a: "Nein. Alles läuft lokal in Ihrem Browser — das Zusammenfügen geschieht auf Ihrem Gerät, und Ihre Dateien werden nie hochgeladen oder irgendwohin gesendet. Es ist kein Konto und keine Anmeldung nötig." },
      { q: "Gibt es eine Datei- oder Seitengrenze?", a: "Es gibt keine feste Obergrenze. Da der gesamte Auftrag in Ihrem Browser läuft, ist die praktische Grenze der Arbeitsspeicher Ihres Geräts — sehr große Dateien oder viele auf einmal können auf Geräten mit wenig RAM langsam werden." },
      { q: "Warum wurde eines meiner PDFs übersprungen?", a: "Passwortgeschützte oder verschlüsselte PDFs lassen sich nicht lesen, daher werden sie mit einem Hinweis ausgelassen. Entsperren Sie sie oder entfernen Sie zuerst das Passwort und fügen Sie die Datei dann erneut hinzu." },
      { q: "Ist es kostenlos?", a: "Ja — vollständig kostenlos, ohne Wasserzeichen und ohne Registrierung. Die zusammengefügte Datei wird als ein einziges PDF heruntergeladen." },
    ],
  },
  "split-pdf": {
    title: "Ein PDF teilen — Häufige Fragen",
    items: [
      { q: "Wie teile ich ein PDF?", a: "Laden Sie das PDF hoch und klicken Sie dann auf das ✂ zwischen zwei beliebigen Seiten, um einen Schnittpunkt zu setzen. Sie können beliebig viele Schnitte hinzufügen oder „Alle N Seiten teilen“ verwenden, um sie automatisch zu platzieren. Wenn Sie auf „Teilen & herunterladen“ klicken, wird jeder Abschnitt als eigenes PDF gespeichert, alle zusammen in einem einzigen ZIP gepackt." },
      { q: "Woher weiß ich, was in jeder Datei landet?", a: "Vor dem Herunterladen werden die Seiten farblich getönt und mit „Datei 1“, „Datei 2“ und so weiter beschriftet, und ein Live-Zähler sagt Ihnen genau, wie viele Dateien erstellt werden — so gibt es keine Überraschungen." },
      { q: "Wird meine Datei irgendwohin hochgeladen?", a: "Nein. Das gesamte Teilen läuft lokal in Ihrem Browser — das PDF wird auf Ihrem Gerät gelesen, geschnitten und gepackt und wird nie an einen Server gesendet. Nichts verlässt Ihr Gerät." },
      { q: "Gibt es eine Datei- oder Seitengrenze?", a: "Es gibt keine feste Obergrenze. Da alles in Ihrem Browser läuft, ist die praktische Grenze der Arbeitsspeicher Ihres Geräts — sehr große PDFs oder solche mit vielen Seiten brauchen länger zum Rendern und können ein älteres Telefon oder Laptop belasten." },
      { q: "Was erhalte ich tatsächlich zurück, und ist es kostenlos?", a: "Sie erhalten ein ZIP mit einem PDF pro Abschnitt (benannt wie document-part-1.pdf, document-part-2.pdf). Selbst wenn Sie nur einen Schnitt setzen, kommt die Ausgabe als ZIP. Es ist vollständig kostenlos, ohne Anmeldung oder Wasserzeichen. Hinweis: Passwortgeschützte PDFs müssen zuerst entsperrt werden." },
    ],
  },
  "crop-pdf": {
    title: "PDF zuschneiden — Häufige Fragen",
    items: [
      { q: "Wie schneide ich ein PDF zu?", a: "Laden Sie Ihr PDF hoch und ziehen Sie dann die Schieberegler oben, rechts, unten und links, um jede Kante zu beschneiden. Sie sehen dabei eine Live-Vorschau, passen Sie also einfach an, bis es passt, und klicken Sie auf „Zuschneiden & herunterladen“." },
      { q: "Wird jede Seite gleich zugeschnitten?", a: "Ja. Die von Ihnen festgelegten Ränder werden einheitlich auf jede Seite angewendet, sodass das gesamte Dokument konsistent bleibt. Ein seitengenaues Zuschneiden gibt es in diesem Tool nicht." },
      { q: "Wird der zugeschnittene Inhalt tatsächlich gelöscht?", a: "Nein. Das Zuschneiden ändert den sichtbaren Bereich (die Zuschnittbox) — die beschnittenen Teile werden ausgeblendet, nicht gelöscht. Das bedeutet, dass nichts wirklich verloren geht, aber auch, dass jemand es wiederherstellen könnte. Wenn der Inhalt endgültig weg sein soll, verwenden Sie stattdessen ein Schwärzungs-Tool." },
      { q: "Wird meine Datei irgendwohin hochgeladen?", a: "Nein. Alles läuft lokal in Ihrem Browser — Ihr PDF verlässt Ihr Gerät nie, und nichts wird an einen Server gesendet." },
      { q: "Gibt es eine Dateigrößengrenze?", a: "Es gibt keine feste Grenze. Da alles in Ihrem Browser geschieht, hängt die praktische Obergrenze vom Arbeitsspeicher Ihres Geräts ab — sehr große Dateien können auf schwächeren Geräten langsam werden oder den Speicher überschreiten." },
      { q: "Ist es kostenlos? Brauche ich ein Konto?", a: "Es ist vollständig kostenlos, und es ist keine Anmeldung erforderlich. Öffnen Sie einfach die Seite und beginnen Sie mit dem Zuschneiden." },
    ],
  },
  "sign-pdf": {
    title: "PDF signieren — Häufige Fragen",
    items: [
      { q: "Wie signiere ich ein PDF?", a: "Laden Sie Ihr PDF hoch, zeichnen oder tippen Sie Ihre Signatur, wählen Sie die Seite, Position und Größe und klicken Sie dann auf „Signieren & herunterladen“. Sie erhalten eine neue Datei mit dem Namen …-signed.pdf." },
      { q: "Wird meine Datei irgendwohin hochgeladen?", a: "Nein. Alles läuft in Ihrem Browser — die Seite wird gerendert, und Ihre Signatur wird lokal auf das PDF gestempelt. Ihre Datei verlässt Ihr Gerät nie, und nichts wird an einen Server gesendet." },
      { q: "Kann ich meine Signatur zeichnen, oder muss ich sie tippen?", a: "Beides geht. Zeichnen Sie mit Maus oder Finger auf dem Feld oder wechseln Sie zu „Tippen“, um Ihren Namen in einer Schreibschrift darzustellen. Drücken Sie auf „Löschen“, um eine gezeichnete Signatur neu zu machen." },
      { q: "Gibt es eine Dateigrößengrenze, und kostet es etwas?", a: "Es ist kostenlos und ohne Anmeldung. Es gibt keine feste Größenobergrenze, aber da alles im Arbeitsspeicher verarbeitet wird, hängen sehr große PDFs vom RAM Ihres Geräts ab — eine riesige Datei kann auf einem älteren Telefon oder Laptop langsam sein." },
      { q: "Wohin kommt die Signatur tatsächlich, und worauf ist zu achten?", a: "Sie wird an einer von neun Ankerpositionen (Ecken, Kanten, Mitte) platziert und über den Größenregler skaliert — Sie können sie nicht pixelgenau ziehen. Sie wird jeweils auf eine Seite gestempelt, wiederholen Sie es also für jede Seite, die Sie signieren müssen. Verschlüsselte/passwortgeschützte PDFs müssen zuerst entsperrt werden." },
      { q: "Gilt das als rechtsgültige elektronische Signatur?", a: "Die Signatur wird als Bild auf die Seite gestempelt, nicht als zertifikatsbasierte digitale Signatur. Getippte und gezeichnete elektronische Signaturen werden für viele alltägliche Dokumente akzeptiert, prüfen Sie aber die konkreten Anforderungen für Ihren Anwendungsfall." },
    ],
  },
  "reorder-pages": {
    title: "PDF-Seiten neu anordnen — Häufige Fragen",
    items: [
      { q: "Wie ordne ich Seiten in einem PDF neu an?", a: "Laden Sie Ihr PDF hoch, ziehen Sie dann die Seiten-Miniaturansichten in die gewünschte Reihenfolge und klicken Sie auf „Anwenden & herunterladen“. Kein Eintippen von Seitennummern — Sie ordnen sie visuell an." },
      { q: "Kann ich dabei auch Seiten löschen?", a: "Ja. Klicken Sie auf das ✕ einer beliebigen Miniaturansicht, um diese Seite zu entfernen, und laden Sie dann herunter. Das Neuanordnen und Entfernen von Seiten geschieht im selben Schritt." },
      { q: "Wird meine Datei irgendwohin hochgeladen?", a: "Nein. Alles läuft lokal in Ihrem Browser — Ihr PDF wird nie hochgeladen und verlässt Ihr Gerät nie." },
      { q: "Gibt es eine Datei- oder Seitengrenze?", a: "Es gibt keine feste Grenze. Sehr große PDFs hängen einfach vom Arbeitsspeicher Ihres Geräts ab, da die gesamte Arbeit auf Ihrem Gerät geschieht." },
      { q: "Verschlechtert das Neuanordnen die Qualität?", a: "Nein. Die Seiten behalten ihren ursprünglichen Inhalt und ihre Auflösung — nur die Reihenfolge ändert sich, nichts wird neu gerendert oder komprimiert." },
      { q: "Ist es kostenlos? Brauche ich ein Konto?", a: "Es ist vollständig kostenlos, ohne erforderliche Anmeldung." },
    ],
  },
  "delete-page": {
    title: "PDF-Seiten löschen — Häufige Fragen",
    items: [
      { q: "Wie lösche ich Seiten aus einem PDF?", a: "Laden Sie Ihr PDF hoch, klicken Sie auf die Seiten, die Sie entfernen möchten (sie werden rot mit einem ✕), und klicken Sie dann auf „Löschen & herunterladen“. Ein Zähler zeigt, wie viele Seiten gelöscht werden und wie viele übrig bleiben." },
      { q: "Was, wenn ich die falsche Seite markiere?", a: "Klicken Sie sie einfach erneut an, um sie zu behalten — die rote Markierung und das ✕ verschwinden. Sie können beliebig oft markieren und die Markierung aufheben, bevor Sie herunterladen." },
      { q: "Wird meine Datei irgendwohin hochgeladen?", a: "Nein. Alles läuft in Ihrem Browser mit dem Arbeitsspeicher Ihres eigenen Geräts — Ihr PDF wird nie an einen Server gesendet und verlässt Ihr Gerät nie." },
      { q: "Gibt es eine Dateigrößengrenze?", a: "Es gibt keine feste Obergrenze. Da die Arbeit lokal geschieht, ist die praktische Grenze der Arbeitsspeicher Ihres Geräts — sehr große oder bildlastige PDFs können auf schwächeren Geräten langsam sein." },
      { q: "Was erhalte ich zurück?", a: "Ein neues PDF mit den entfernten markierten Seiten, heruntergeladen als „ihredatei-pages-removed.pdf“. Die übrigen Seiten behalten ihren ursprünglichen Inhalt und ihre Reihenfolge; Ihre Originaldatei wird nicht verändert. Sie müssen mindestens eine Seite behalten." },
      { q: "Ist es kostenlos?", a: "Ja — vollständig kostenlos, ohne erforderliche Anmeldung oder Konto." },
    ],
  },
  "rotate-page": {
    title: "PDF-Seiten drehen — Häufige Fragen",
    items: [
      { q: "Wie drehe ich Seiten in einem PDF?", a: "Laden Sie das PDF hoch und klicken Sie auf eine Seite, um sie um 90° im Uhrzeigersinn zu drehen. Klicken Sie dieselbe Seite weiter an, um sie auf 180°, 270° und zurück zu drehen. Oder drücken Sie auf „Alle um 90° drehen“, um jede Seite auf einmal zu drehen, und laden Sie dann herunter." },
      { q: "Kann ich nur eine Seite drehen oder verschiedene Seiten um unterschiedliche Beträge?", a: "Ja. Jede Seite dreht sich eigenständig, sodass Sie einen einzelnen seitwärts liegenden Scan korrigieren oder verschiedene Seiten auf verschiedene Winkel setzen können — nur die Seiten, die Sie anklicken, ändern sich." },
      { q: "Wird meine Datei irgendwohin hochgeladen?", a: "Nein. Alles läuft lokal in Ihrem Browser — die Drehung wird auf Ihrem Gerät ins PDF geschrieben, und die Datei wird nie an einen Server gesendet und verlässt Ihr Gerät nie." },
      { q: "Gibt es eine Datei- oder Seitengrenze?", a: "Es gibt keine feste Grenze, die wir vorgeben. Da alles in Ihrem Browser geschieht, hängt die praktische Obergrenze vom Arbeitsspeicher Ihres Geräts ab — sehr große PDFs können auf Telefonen oder Tablets mit wenig Speicher langsam werden." },
      { q: "Verliert das Drehen Qualität oder ändert es den Inhalt?", a: "Nein. Die Drehung setzt nur das Ausrichtungsflag jeder Seite — der Text, die Bilder und die Auflösung bleiben exakt gleich. Nichts wird neu gerendert oder komprimiert." },
      { q: "Ist es kostenlos? Brauche ich ein Konto?", a: "Es ist vollständig kostenlos, ohne Anmeldung. Öffnen Sie die Seite, drehen Sie und laden Sie herunter." },
    ],
  },
  "add-page": {
    title: "Seiten in ein PDF einfügen — Häufige Fragen",
    items: [
      { q: "Wie füge ich Seiten in ein PDF ein?", a: "Laden Sie Ihr PDF hoch, klicken Sie dorthin, wo Sie einfügen möchten (ganz am Anfang oder nach einer bestimmten Seite), wählen Sie dann die dort einzufügende Datei und klicken Sie auf „Einfügen & herunterladen“." },
      { q: "Was kann ich einfügen?", a: "Ein weiteres PDF (alle seine Seiten werden an dieser Stelle eingefügt) oder ein einzelnes PNG-/JPG-Bild, das als eine neue Seite hinzugefügt wird." },
      { q: "Wird meine Datei hochgeladen?", a: "Nein. Alles läuft lokal in Ihrem Browser mit pdf-lib — Ihre Dateien verlassen Ihr Gerät nie, und nichts wird an einen Server gesendet." },
      { q: "Was erhalte ich zurück?", a: "Ein einziges neues PDF mit den eingefügten Seiten an ihrem Platz, heruntergeladen als „<ihre-datei>-with-insert.pdf“. Ihre Originaldatei wird nicht verändert." },
      { q: "Gibt es eine Dateigrößengrenze?", a: "Es gibt keine feste Grenze, aber da alles in Ihrem Browser geschieht, hängen sehr große PDFs vom Arbeitsspeicher Ihres Geräts ab. Wenn eine riesige Datei Probleme macht, versuchen Sie eine kleinere." },
      { q: "Ist es kostenlos?", a: "Ja — es ist vollständig kostenlos, ohne erforderliche Anmeldung oder Konto." },
    ],
  },
  "watermark-pdf": {
    title: "Ein Wasserzeichen zu einem PDF hinzufügen — Häufige Fragen",
    items: [
      { q: "Wie füge ich einem PDF ein Wasserzeichen hinzu?", a: "Laden Sie das PDF hoch, erstellen Sie ein Text- oder Bild-Wasserzeichen und passen Sie seine Position, Deckkraft und Drehung an, während Sie die Live-Vorschau beobachten. Wählen Sie, welche Seiten gestempelt werden, und klicken Sie dann auf „Anwenden & herunterladen“." },
      { q: "Kann ich statt Text ein Bild oder Logo verwenden?", a: "Ja. Wechseln Sie in den Bildmodus, um ein Logo oder Bild als Wasserzeichen einzufügen. So oder so können Sie Position, Deckkraft und Drehung festlegen." },
      { q: "Stempelt es jede Seite?", a: "Das entscheiden Sie. Das Wasserzeichen kommt auf die von Ihnen ausgewählten Seiten, sodass Sie das ganze Dokument oder nur bestimmte Seiten markieren können." },
      { q: "Werden meine Dateien irgendwohin hochgeladen?", a: "Nein. Das Wasserzeichen wird direkt in Ihrem Browser angewendet — Ihr PDF verlässt Ihr Gerät nie, und nichts wird an einen Server gesendet." },
      { q: "Gibt es eine Dateigrößengrenze?", a: "Es gibt keine feste Obergrenze. Da alles lokal läuft, sind sehr große PDFs nur durch den Arbeitsspeicher Ihres Geräts begrenzt — auf den meisten Geräten ist das reichlich." },
      { q: "Ist es kostenlos? Brauche ich ein Konto?", a: "Es ist kostenlos, und es gibt keine Anmeldung. Öffnen Sie einfach die Seite, fügen Sie Ihr PDF hinzu und laden Sie die mit Wasserzeichen versehene Datei herunter." },
    ],
  },
  "page-numbers": {
    title: "Seitenzahlen zu einem PDF hinzufügen — Häufige Fragen",
    items: [
      { q: "Wie füge ich einem PDF Seitenzahlen hinzu?", a: "Laden Sie Ihr PDF hoch, wählen Sie, wohin die Zahl kommt (oben oder unten, links/Mitte/rechts), wählen Sie das Format und die Startnummer und legen Sie den Seitenbereich fest. Die Live-Vorschau zeigt genau, wie es aussieht, dann klicken Sie auf „Nummern hinzufügen & herunterladen“." },
      { q: "Wird meine Datei irgendwohin hochgeladen?", a: "Nein. Alles läuft lokal in Ihrem Browser — das PDF wird auf Ihrem Gerät gelesen, nummeriert und gespeichert. Ihre Datei wird nie hochgeladen und verlässt Ihren Computer nie." },
      { q: "Welche Formate und Positionen kann ich verwenden?", a: "Vier Formate: nur die Zahl (1), Seite 1, 1 / N oder 1 von N. Sechs Positionen: oben oder unten, kombiniert mit links, Mitte oder rechts. Sie können außerdem einen kleinen/mittleren/großen Rand festlegen." },
      { q: "Kann ich bei einer bestimmten Zahl beginnen oder nur einige Seiten nummerieren?", a: "Ja. Stellen Sie „Beginnen bei“ für die erste Zahl ein (praktisch, wenn Ihr Deckblatt nicht mitzählen soll), und verwenden Sie den von/bis-Bereich, um nur einen Teil des Dokuments zu nummerieren. Die Zählung läuft über den von Ihnen gewählten Bereich weiter." },
      { q: "Gibt es eine Dateigrößengrenze?", a: "Es gibt keine feste Obergrenze. Da die Arbeit in Ihrem Browser geschieht, sind sehr große PDFs nur durch den Arbeitsspeicher Ihres Geräts begrenzt — auf den meisten Geräten gehen typische Dokumente problemlos durch." },
      { q: "Ist es kostenlos? Brauche ich ein Konto?", a: "Ja, es ist vollständig kostenlos, und es ist keine Anmeldung erforderlich. Öffnen Sie einfach die Seite und legen Sie los." },
    ],
  },
  "images-to-pdf": {
    title: "Bilder in PDF — Häufige Fragen",
    items: [
      { q: "Wie konvertiere ich Bilder in ein PDF?", a: "Fügen Sie Ihre Bilder hinzu, ziehen Sie die Miniaturansichten in die gewünschte Reihenfolge und klicken Sie dann auf „In PDF konvertieren“. Jedes Bild wird zu einer Seite, von oben nach unten, in einer einzigen Datei, die Sie herunterladen können." },
      { q: "Welche Bildformate werden unterstützt?", a: "JPG, PNG, WebP, GIF und BMP. HEIC (das Format, in dem iPhones Fotos oft speichern) wird noch nicht unterstützt — konvertieren Sie diese zuerst in JPG oder ändern Sie die Kameraeinstellung Ihres iPhones auf „Maximale Kompatibilität“." },
      { q: "Kann ich viele Bilder in einem PDF zusammenfassen?", a: "Ja. Fügen Sie beliebig viele hinzu und ziehen Sie sie zum Neuanordnen — sie werden in genau dieser Reihenfolge zu einem einzigen PDF zusammengefügt, ein Bild pro Seite." },
      { q: "Werden meine Bilder irgendwohin hochgeladen?", a: "Nein. Alles läuft lokal in Ihrem Browser — das PDF wird auf Ihrem Gerät erstellt, und Ihre Bilder werden nie an einen Server gesendet oder irgendwo gespeichert." },
      { q: "Gibt es eine Größen- oder Dateianzahlgrenze?", a: "Es gibt keine feste Grenze. Da alles auf Ihrem Gerät geschieht, ist die praktische Obergrenze der Arbeitsspeicher Ihres Geräts — sehr große oder sehr viele hochauflösende Bilder können ein älteres Telefon oder einen Laptop mit wenig RAM verlangsamen." },
      { q: "Ist es kostenlos? Brauche ich ein Konto?", a: "Ja, es ist vollständig kostenlos, ohne Anmeldung, ohne Wasserzeichen und ohne erforderliche E-Mail. Öffnen Sie einfach die Seite und legen Sie los." },
    ],
  },
  "pdf-to-png": {
    title: "PDF in PNG — Häufige Fragen",
    items: [
      { q: "Wie konvertiere ich ein PDF in PNG?", a: "Legen Sie ein PDF ab, und jede Seite erscheint als Miniaturansicht. Klicken Sie Seiten an, um sie ein- oder auszuschließen (oder nutzen Sie „Alle auswählen“ / „Keine auswählen“), stellen Sie sicher, dass PNG ausgewählt ist, und dann „Konvertieren & herunterladen“. Eine einzelne Seite kommt als ein PNG herunter; mehrere Seiten werden in ein ZIP gebündelt." },
      { q: "Wird mein PDF irgendwohin hochgeladen?", a: "Nein. Alles läuft in Ihrem Browser — das PDF wird lokal gelesen und in PNG gerendert, und der Download wird auf Ihrem Gerät erzeugt. Nichts wird an einen Server gesendet, Ihre Datei verlässt Ihr Gerät also nie." },
      { q: "Warum PNG statt JPG wählen?", a: "PNG ist verlustfrei und hält daher Text, Strichzeichnungen, Diagramme und Screenshots gestochen scharf ohne Komprimierungsartefakte und unterstützt Transparenz. JPG-Dateien sind kleiner und für Fotos in Ordnung, aber sie weichen feine Details auf und können nicht transparent sein." },
      { q: "Gibt es eine Datei- oder Seitengrenze?", a: "Es gibt keine feste Obergrenze und keine Anmeldung. Da alles in Ihrem Browser verarbeitet wird, ist die tatsächliche Grenze der Arbeitsspeicher Ihres Geräts — sehr große PDFs oder solche mit sehr vielen Seiten verbrauchen mehr RAM und brauchen länger, besonders auf Telefonen oder älteren Geräten." },
      { q: "Es öffnet mein PDF nicht — was ist los?", a: "Die häufigste Ursache ist ein passwortgeschütztes oder verschlüsseltes PDF, das das Tool nicht lesen kann; entfernen Sie zuerst das Passwort und versuchen Sie es erneut. Die Ausgabe wird mit 2-facher Skalierung für scharfe Bilder gerendert, ist aber dennoch ein Bild — der Text wird zu Pixeln, Sie können ihn danach also nicht auswählen oder durchsuchen." },
      { q: "Ist PDF in PNG kostenlos?", a: "Ja — vollständig kostenlos, kein Konto, kein Wasserzeichen, keine Grenze, wie oft Sie es verwenden." },
    ],
  },
  "pdf-to-image": {
    title: "PDF in Bild — Häufige Fragen",
    items: [
      { q: "Wie konvertiere ich ein PDF in JPG oder PNG?", a: "Legen Sie ein PDF ab, und jede Seite erscheint als Miniaturansicht. Klicken Sie Seiten an, um sie ein- oder auszuschließen (oder nutzen Sie „Alle auswählen“ / „Keine auswählen“), wählen Sie JPG oder PNG, und dann „Konvertieren & herunterladen“. Eine einzelne Seite kommt als ein Bild herunter; mehrere Seiten werden in ein ZIP gebündelt." },
      { q: "Wird mein PDF irgendwohin hochgeladen?", a: "Nein. Alles läuft in Ihrem Browser — das PDF wird lokal gelesen und in Bilder gerendert, und der Download wird auf Ihrem Gerät erzeugt. Nichts wird an einen Server gesendet, Ihre Datei verlässt Ihr Gerät also nie." },
      { q: "JPG oder PNG — welches soll ich wählen?", a: "PNG ist verlustfrei und daher am besten für scharfen Text, Strichzeichnungen und Screenshots. JPG-Dateien sind kleiner und für Fotos und Scans in Ordnung. Eines sollten Sie wissen: JPG kann nicht transparent sein, daher werden transparente Bereiche einer Seite auf einen weißen Hintergrund reduziert." },
      { q: "Gibt es eine Datei- oder Seitengrenze?", a: "Es gibt keine feste Obergrenze und keine Anmeldung. Da alles in Ihrem Browser verarbeitet wird, ist die tatsächliche Grenze der Arbeitsspeicher Ihres Geräts — sehr große PDFs oder solche mit sehr vielen Seiten verbrauchen mehr RAM und brauchen länger, besonders auf Telefonen oder älteren Geräten." },
      { q: "Es öffnet mein PDF nicht — was ist los?", a: "Die häufigste Ursache ist ein passwortgeschütztes oder verschlüsseltes PDF, das das Tool nicht lesen kann; entfernen Sie zuerst das Passwort und versuchen Sie es erneut. Die Ausgabe wird mit 2-facher Skalierung für scharfe Bilder gerendert, ist aber dennoch ein Bild — der Text wird zu Pixeln, Sie können ihn danach also nicht auswählen oder durchsuchen." },
      { q: "Ist es kostenlos?", a: "Ja — vollständig kostenlos, kein Konto, kein Wasserzeichen, keine Grenze, wie oft Sie es verwenden." },
    ],
  },
  "redact-pdf": {
    title: "PDF schwärzen — Häufige Fragen",
    items: [
      { q: "Wie schwärze ich ein PDF?", a: "Legen Sie Ihr PDF auf der Seite ab, und DockDocs rendert jede Seite direkt in Ihrem Browser. Ziehen Sie einen Kasten über alles, was Sie verbergen möchten — einen Namen, eine Kontonummer, eine Unterschrift. DockDocs scannt außerdem automatisch nach wahrscheinlich sensiblen Elementen (E-Mails, Telefonnummern, Sozialversicherungsnummern, Kartennummern, IP-Adressen) und markiert sie vor; prüfen Sie diese Vorschläge und klicken Sie auf das ✕ jedes Kastens, den Sie nicht möchten. Wenn Sie fertig sind, drücken Sie auf „Anwenden & herunterladen“, um die geschwärzte Kopie zu erhalten." },
      { q: "Wird der Text tatsächlich entfernt oder nur mit einem schwarzen Kasten überdeckt?", a: "Tatsächlich entfernt. Viele „Schwärzungen“ legen nur ein schwarzes Rechteck darüber — der ursprüngliche Text ist weiterhin in der Datei, und jeder kann ihn herauskopieren oder den Kasten löschen. DockDocs rendert jede Seite als flaches Bild neu, in das die schwarzen Bereiche eingebrannt sind, sodass der darunterliegende Text zerstört und für immer weg ist. Genau das macht das Ergebnis sicher zum Teilen." },
      { q: "Werden meine Dateien irgendwohin hochgeladen?", a: "Nein. Alles läuft in Ihrem Browser auf Ihrem eigenen Gerät — das Öffnen des PDFs, das Zeichnen der Kästen und das Erstellen der geschwärzten Kopie geschehen alle lokal. Ihre Datei wird nie an einen Server gesendet und verlässt Ihren Computer nie, daher eignet sie sich gut für vertrauliche oder regulierte Dokumente." },
      { q: "Gibt es Grenzen, und ist es kostenlos?", a: "Es ist vollständig kostenlos, ohne erforderliches Konto, E-Mail oder Installation. Es gibt keine feste Dateigrößenobergrenze, sehr große PDFs hängen jedoch vom Arbeitsspeicher Ihres Geräts ab. Die eine harte Grenze ist die Seitenzahl: Ein Dokument darf bis zu 30 Seiten haben — ist Ihres länger, teilen Sie es zuerst und schwärzen Sie jeden Teil." },
      { q: "Wie sieht die Ausgabedatei aus?", a: "Sie erhalten ein neues PDF, in dem jede Seite ein flachgerechnetes Bild ist (etwa 158 DPI — sauber und lesbar). Da die Seiten nun Bilder sind, ist der geschwärzte Inhalt dauerhaft weg, und der übrige Text ist nicht mehr auswählbar oder durchsuchbar. Dieser Kompromiss ist der ganze Sinn: Text, den Sie nicht auswählen können, ist Text, der nicht wiederhergestellt werden kann." },
      { q: "Sollte ich den automatisch erkannten Kästen allein vertrauen?", a: "Behandeln Sie sie als Vorsprung, nicht als Garantie. Der automatische Scan erfasst gängige Muster wie E-Mails und Nummern, kann aber in ungewöhnlichen Formaten Geschriebenes übersehen und kennt keine kontextspezifischen Geheimnisse, die nur Sie erkennen können. Lesen Sie die Seiten immer selbst durch und ziehen Sie Kästen über alles, was der Detektor nicht markiert hat, bevor Sie herunterladen." },
    ],
  },
  "translate-pdf": {
    title: "Ein PDF übersetzen — Häufige Fragen",
    items: [
      { q: "Wie übersetze ich ein PDF?", a: "Laden Sie Ihr PDF hoch, wählen Sie eine Zielsprache aus der Liste und klicken Sie auf „Übersetzen“. Der Text wird aus der Datei gezogen und von der KI übersetzt, dann können Sie ihn kopieren oder als .txt-Datei herunterladen." },
      { q: "Wird meine Datei hochgeladen? Ist das privat?", a: "Das PDF wird direkt in Ihrem Browser gelesen — die Datei selbst verlässt Ihr Gerät nie. Nur der daraus extrahierte reine Text wird zur Übersetzung an die KI gesendet. Das Originaldokument, die Formatierung und die Bilder werden nie hochgeladen." },
      { q: "Gibt es eine Größengrenze?", a: "Ja — etwa 14.000 Zeichen pro Durchlauf, ungefähr 10 Seiten. Ist Ihr Dokument länger, teilen Sie es in kleinere Stücke und übersetzen Sie sie nacheinander." },
      { q: "In welche Sprachen kann ich übersetzen?", a: "Mehr als 18, darunter Englisch, vereinfachtes und traditionelles Chinesisch, Spanisch, Französisch, Deutsch, Japanisch, Koreanisch, Portugiesisch, Italienisch, Russisch, Arabisch, Hindi und mehr. Das Tool erkennt die Ausgangssprache automatisch, Sie wählen also nur das Ziel." },
      { q: "Bleibt das ursprüngliche Layout erhalten? Was erhalte ich zurück?", a: "Noch nicht — diese Version übersetzt nur den Textinhalt und gibt Ihnen den übersetzten Text zum Kopieren oder Herunterladen. Eine layouterhaltende Übersetzung, die das PDF neu aufbaut, ist auf der Roadmap. Beachten Sie außerdem: Ist das PDF ein Scan oder Bild ohne auswählbaren Text, gibt es nichts zu extrahieren — führen Sie zuerst OCR darauf aus." },
      { q: "Ist es kostenlos? Kann ich mich bei rechtlichen Dokumenten darauf verlassen?", a: "Ja, die Nutzung ist kostenlos. Die KI-Übersetzung ist hervorragend, um ein Dokument zu verstehen und einen soliden ersten Entwurf zu erhalten, aber sie ist keine beglaubigte Übersetzung — lassen Sie sie für rechtliche, offizielle oder beglaubigte Zwecke von einer qualifizierten Person prüfen oder übersetzen." },
    ],
  },
  "extract-to-excel": {
    title: "PDF-Daten in eine Tabelle extrahieren — Häufige Fragen",
    items: [
      { q: "Wie extrahiere ich Daten aus PDFs in eine Tabelle?", a: "Legen Sie Ihre Rechnungen, Angebote oder Verträge ab (oder wählen Sie einen ganzen Ordner, um sie im Stapel zu verarbeiten), wählen Sie den Dokumenttyp und klicken Sie auf „Extrahieren“. Die KI zieht die wichtigsten Felder — Summen, Daten, Vertragsparteien, Konditionen — in eine Tabelle, die Sie als CSV herunterladen können, das sich in Excel, Google Sheets oder Numbers öffnen lässt. Es ist kostenlos." },
      { q: "Werden meine Dateien auf einen Server hochgeladen?", a: "Das PDF selbst verlässt Ihr Gerät nie — es wird direkt in Ihrem Browser gelesen. Nur der reine Text, den es herauszieht, wird an die KI gesendet, um ihn in Spalten zu sortieren; die Originaldatei mit ihrem Layout und allen Bildern bleibt lokal. Falls dieser Schritt der Textausgabe bei sensiblen Verträgen ein Ausschlusskriterium ist, ist das vorab wissenswert." },
      { q: "Woher weiß ich, dass die Zahlen stimmen?", a: "Jeder Wert ist mit dem exakten Satz versehen, aus dem er im Originaldokument stammt, sodass Sie ihn mit einem Blick stichprobenartig prüfen können. Kann die KI ein Feld nicht eindeutig finden, lässt sie die Zelle leer, statt zu raten — und wir verwerfen jedes Quellzitat, das nicht tatsächlich in Ihrer Datei vorkommt, sodass nichts erfunden wird." },
      { q: "Was sind die Grenzen?", a: "Bis zu 8 Dokumente auf einmal, und der kombinierte Text ist bei etwa 60.000 Zeichen gedeckelt — ungefähr ein Stapel normaler Rechnungen, nicht ein 200-seitiger Rahmenvertrag. Verarbeiten Sie große Stapel in mehreren Durchgängen." },
      { q: "Es wurde nichts herausgezogen — was ist passiert?", a: "Fast immer ein gescanntes oder fotografiertes PDF. Lässt sich der Text in einem normalen PDF-Reader nicht auswählen, gibt es für den Browser nichts zu lesen, und die KI erhält eine leere Seite. Führen Sie diese zuerst durch OCR. Passwortgeschützte PDFs lassen sich ebenfalls nicht lesen, bis Sie sie entsperren." },
      { q: "Welche Dokumente funktionieren am besten?", a: "Strukturierte Unterlagen mit konsistenten Feldern — Rechnungen, Angebote und Verträge —, bei denen jedes vorgegebene Feld (Lieferant, Summe, Fälligkeitsdatum, Zahlungsbedingungen und so weiter) tatsächlich irgendwo im Dokument abgedruckt ist. Freiformige Briefe oder ungewöhnliche Layouts lassen mehr Zellen leer." },
    ],
  },
  "redline": {
    title: "PDF-Versionen vergleichen (Redline) — Häufige Fragen",
    items: [
      { q: "Wie vergleiche ich zwei PDF-Versionen?", a: "Laden Sie das Original (v1) und das überarbeitete (v2) PDF hoch und klicken Sie dann auf „Versionen vergleichen“. DockDocs richtet den Text aus und zeigt eine einzige markierte Ansicht — hinzugefügter Text wird grün hervorgehoben, entfernter Text rot durchgestrichen, wie bei Änderungsnachverfolgung." },
      { q: "Werden meine Dateien irgendwohin hochgeladen?", a: "Nein. Dies ist ein clientseitiges Tool: Der Text wird vollständig in Ihrem Browser extrahiert und verglichen, Ihre Dateien verlassen Ihr Gerät also nie. Nichts wird an einen Server gesendet." },
      { q: "Erkennt es umformulierte Sätze?", a: "Es vergleicht Satz für Satz, markiert also, welche Sätze hinzugefügt und welche entfernt wurden. Eine kleine Umformulierung erscheint als eine Löschung plus eine Hinzufügung statt als wortgenaue Änderung innerhalb des Satzes." },
      { q: "Was vergleicht es eigentlich — prüft es Formatierung oder Bilder?", a: "Nur den extrahierten Text. Schriftarten, Layout, Farben, Bilder und Tabellen sind nicht Teil des Vergleichs, und gescannte PDFs ohne echte Textebene liefern keine brauchbaren Ergebnisse. Meldet es keine Textänderungen, ist der Wortlaut identisch, auch wenn sich das Erscheinungsbild geändert hat." },
      { q: "Wie groß dürfen die Dokumente sein?", a: "Der gesamte Vergleich läuft in Ihrem Browser, er ist also auf Dokumente bis zu einigen tausend Sätzen ausgelegt (er ist bei 2.500 Sätzen pro Datei gedeckelt). Sehr lange Verträge oder Bücher können abgeschnitten werden oder langsam laufen." },
      { q: "Ist es kostenlos?", a: "Ja — das Vergleichen von Versionen ist vollständig kostenlos, ohne Anmeldung und ohne Grenze für die Anzahl der Vergleiche." },
    ],
  },
};

const FAQS_KO: Record<string, { title: string; items: Array<{ q: string; a: string }> }> = {
  "chat-with-pdf": {
    title: "PDF와 대화하기 — 자주 묻는 질문",
    items: [
      { q: "어떻게 작동하나요?", a: "텍스트 기반 PDF를 업로드하면 DockDocs가 브라우저 안에서 텍스트를 추출하고, 이후 질문을 하면 AI가 일반적인 웹 지식이 아니라 해당 문서의 내용을 바탕으로 답합니다. 한 번에 한 문서를 다루는, 파일당 최대 12페이지 / 40,000자 / 25 MB까지 지원합니다." },
      { q: "답변을 믿어도 되나요 — 제 문서에 근거한 답변인가요?", a: "답변은 PDF에서 추출한 텍스트에 근거하며, AI의 답변이 파일 속 구절과 일치하면 「✓ 원문과 대조 확인」 표시 아래에 정확한 인용문이 함께 나타나 직접 확인하실 수 있습니다. 인용은 모델이 반환하는 내용에 따라 달라지므로 모든 답변에 나타나지는 않으며, AI는 여전히 틀릴 수 있으니 중요한 내용은 원본 문서로 확인하세요." },
      { q: "제 PDF가 업로드되거나 저장되나요?", a: "텍스트는 브라우저 안에서 추출되며, 그렇게 추출된 텍스트만 질문에 답하기 위해 AI 제공업체로 전송됩니다. 파일 자체는 기기를 절대 벗어나지 않고 이후에 저장되지도 않습니다." },
      { q: "어떤 PDF가 작동하나요?", a: "텍스트 기반(디지털로 생성된) PDF입니다. 스캔한 PDF는 선택 가능한 텍스트가 없으므로 먼저 OCR을 실행해 대화가 읽을 수 있는 내용을 만들어 주세요. 영어, 중국어, 스페인어, 포르투갈어, 프랑스어 등에서 작동하며, 답변은 질문한 언어를 따릅니다." },
      { q: "제한이 있나요?", a: "DockDocs는 파일당 25 MB, 12페이지, 추출 텍스트 40,000자로 제한합니다. 더 긴 문서는 먼저 분할하거나 압축하세요. 무료 일일 사용량이 적용되며, 더 필요하면 업그레이드하세요." },
    ],
  },
  "govbid-matrix": {
    title: "정부 입찰 준수 매트릭스 — 자주 묻는 질문",
    items: [
      { q: "무엇을 추출하나요?", a: "RFP, 입찰 공고 또는 제안 요청서를 읽어 구속력 있는 모든 「shall/must/will」 요건을 번호가 매겨진 준수 매트릭스로 정리합니다. 각 행에는 요건, 해당 조항 참조, 그리고 그것이 필수인지 권고인지가 담깁니다. 필수 항목만 필터링할 수 있고, 매트릭스 전체를 CSV로 내보내 제안서 응답 추적표에 바로 옮겨 넣을 수 있습니다. (「shall/must/will」은 계약서에서 구속력을 나타내는 영어 표현입니다.)" },
      { q: "모든 요건을 입찰 문서 원문까지 추적할 수 있나요?", a: "네, 바로 그것이 핵심입니다. 각 행은 정확한 원문을 인용하고 해당 조항을 표시하므로, 입찰에서 약속하기 전에 각 요건을 원본 문서와 대조해 확인할 수 있습니다. AI가 파일에서 찾을 수 없는 인용문을 반환하면 꾸며낸 출처를 보여주는 대신 「인용 확인 불가」로 표시합니다. 무엇도 지어내지 않으며, 추적할 수 없는 것은 추적할 수 없다고 그대로 보입니다." },
      { q: "이 도구가 입찰 문서를 직접 읽는 일을 대신해 주나요?", a: "아니요. 「shall/must」가 빠지지 않도록 빠르게 1차로 훑는 것일 뿐, 완전성을 보장하지 않으며 준수 자문이나 법률 자문도 아닙니다. 입찰의 준수 책임은 여전히 귀하에게 있으니 항상 전체 입찰 문서를 읽고, 도구가 놓친 내용도 여전히 구속력이 있다고 간주하세요." },
      { q: "제 입찰 문서가 업로드되거나 저장되나요?", a: "파일은 브라우저 안에서 읽히고, 분석을 위해 추출된 텍스트만 전송되며 이후에 저장되지 않습니다. 파일 자체는 기기를 절대 벗어나지 않으며, 이는 낙찰 전이거나 기밀인 입찰에서 특히 중요합니다." },
      { q: "어떤 문서가 가장 잘 작동하나요?", a: "텍스트 기반 PDF(디지털로 생성된 것)입니다. 스캔한 입찰 문서는 선택 가능한 텍스트가 없으니 먼저 OCR을 실행하세요. 영어, 중국어, 스페인어, 포르투갈어, 프랑스어 등에서 작동하며, 인용문은 문서의 원래 언어로 유지됩니다." },
    ],
  },
  "contract-risk": {
    title: "계약서 위험 점검 — 자주 묻는 질문",
    items: [
      { q: "무엇을 점검하나요?", a: "계약서에서 한 번 더 살펴볼 가치가 있는 조항을 찾아냅니다 — 자동 갱신, 일방적 해지나 변경, 무제한/상한 없는 책임, 위약금과 연체료, 결제 함정과 숨은 비용, 지나치게 광범위한 경업 금지, 그리고 누락된 표준 보호장치(예: 책임 한도 없음). 각 발견 항목은 빨강(높음), 노랑(중간), 초록(낮음)으로 표시되고, 계약서에서 인용되며, 쉬운 말로 된 설명과 서명 전에 무엇을 물어봐야 하는지에 대한 안내가 함께 제공됩니다." },
      { q: "이것이 법률 자문인가요?", a: "아니요. 법률 교육을 받지 않은 사람이 주의가 필요한 조항을 알아차리도록 돕는 자동 점검일 뿐, 법률 자문이 아니며 변호사를 대신하지도 않습니다. 중요하거나 가치가 큰 사안은 자격을 갖춘 변호사의 검토를 받으세요. 발견 항목이 표시되지 않았다고 해서 계약서가 안전하다는 보장은 아닙니다." },
      { q: "조항이나 인용문을 지어내나요?", a: "모든 인용문은 실제 계약서 텍스트와 대조됩니다 — AI가 문서에서 찾을 수 없는 인용문을 반환하면 꾸며낸 출처를 보여주는 대신 폐기합니다. 누락된 조항으로 인한 위험은 인용문 없이 그에 맞게 표시됩니다. 그래도 AI는 무언가를 놓칠 수 있으니 항상 계약서 전체를 읽으세요." },
      { q: "제 계약서가 업로드되거나 저장되나요?", a: "계약서는 브라우저 안에서 읽히고, 분석을 위해 추출된 텍스트만 전송되며 이후에 저장되지 않습니다. 파일 자체는 기기를 절대 벗어나지 않습니다." },
      { q: "어떤 계약서가 가장 잘 작동하나요?", a: "텍스트 기반 PDF(디지털로 생성된 것)입니다. 스캔한 계약서는 선택 가능한 텍스트가 없으니 먼저 OCR을 실행하세요. 영어, 중국어 등에서 작동하며, 인용문은 계약서의 원래 언어로 유지됩니다." },
    ],
  },
  "lease-redflag": {
    title: "임대차 계약 경고 신호 점검 — 자주 묻는 질문",
    items: [
      { q: "무엇을 표시하나요?", a: "임차인인 귀하에게 불리할 수 있는 조항을 임대차 계약서에서 찾아냅니다 — 공격적인 임대료 인상, 가혹한 조기 해지 위약금, 과도한 임대인 출입권, 불명확한 유지보수 비용 분담, 지나친 보증금 공제, 전대 제한, 불공정한 반환 지연 비용, 그리고 누락된 표준 보호장치(유예 기간 없음, 거주 적합성 보증 없음, 해지 전 시정 권리 없음). 각 발견 항목은 빨강(높음), 노랑(중간), 초록(낮음)으로 표시되고, 임대차 계약서에서 인용되며, 무엇을 묻거나 협상해야 하는지에 대한 안내가 함께 제공됩니다." },
      { q: "이것이 법률 자문인가요?", a: "아니요. 임차인이 주의가 필요한 조항을 알아차리도록 돕는 자동 점검일 뿐, 법률 자문이 아니며 변호사나 임차인 보호 단체를 대신하지도 않습니다. 중요한 사안은 자격을 갖춘 변호사에게 문의하세요. 발견 항목이 표시되지 않았다고 해서 임대차 계약서가 공정하다는 보장은 아닙니다." },
      { q: "인용문을 지어내나요?", a: "모든 인용문은 실제 임대차 계약서 텍스트와 대조됩니다 — AI가 문서에서 찾을 수 없는 인용문을 반환하면 꾸며낸 출처를 보여주는 대신 폐기합니다. 누락된 조항으로 인한 위험은 인용문 없이 그에 맞게 표시됩니다." },
      { q: "제 임대차 계약서가 업로드되거나 저장되나요?", a: "임대차 계약서는 브라우저 안에서 읽히고, 분석을 위해 추출된 텍스트만 전송되며 이후에 저장되지 않습니다. 파일 자체는 기기를 절대 벗어나지 않습니다." },
      { q: "어떤 임대차 계약서 형식이 작동하나요?", a: "텍스트 기반 PDF(디지털로 생성된 것)입니다. 스캔한 임대차 계약서는 선택 가능한 텍스트가 없으니 먼저 OCR을 실행하세요. 영어, 중국어 등에서 작동하며, 인용문은 임대차 계약서의 원래 언어로 유지됩니다." },
    ],
  },
  "batch-translate": {
    title: "문서 번역 — 자주 묻는 질문",
    items: [
      { q: "여러 PDF를 한 번에 번역하려면 어떻게 하나요?", a: "PDF를 — 또는 폴더 전체를 — 페이지에 끌어다 놓고, 대상 언어를 선택한 뒤 「모두 번역」을 클릭하세요. 각 PDF는 브라우저 안에서 읽히고 그 텍스트가 차례로 번역되며, 모든 결과를 .txt 파일이 담긴 하나의 ZIP으로 내려받습니다." },
      { q: "어떤 언어로 번역할 수 있나요?", a: "영어, 중국어 간체와 번체, 스페인어, 프랑스어, 독일어, 일본어, 한국어, 포르투갈어, 이탈리아어, 러시아어, 아랍어, 힌디어를 포함한 13개 언어입니다. 묶음 전체가 선택한 하나의 언어로 번역됩니다." },
      { q: "무엇을 받게 되나요 — 레이아웃이 유지되나요?", a: "PDF당 한 개씩, 순수 텍스트(.txt) 파일을 함께 압축해 받습니다. 번역은 텍스트로만 이루어지므로 원래 레이아웃, 이미지, 서식은 유지되지 않습니다. 서식이 적용된 사본을 만들기보다는 내용을 읽고 재사용하기에 가장 적합합니다." },
      { q: "제한이 있나요? 스캔한 PDF는 어떻게 되나요?", a: "묶음당 최대 10개 PDF이며, 각 파일은 약 10페이지(14,000자) 분량의 텍스트까지입니다. 스캔한 PDF는 선택 가능한 텍스트가 없으니 먼저 OCR을 실행하세요. 그렇지 않으면 안내와 함께 건너뜁니다." },
      { q: "비공개이고 무료인가요?", a: "각 PDF는 브라우저 안에서 읽히고, 파일이 아니라 추출된 텍스트만 번역을 위해 전송됩니다. 무료이며, 번역은 매일 초기화되는 일일 AI 사용 한도에 반영됩니다." },
    ],
  },
  "batch-office-to-pdf": {
    title: "Office 일괄 PDF 변환 — 자주 묻는 질문",
    items: [
      { q: "여러 Office 파일을 한 번에 PDF로 변환하려면 어떻게 하나요?", a: "Word, PowerPoint, Excel 파일을 — 또는 폴더 전체를 — 페이지에 끌어다 놓은 뒤 「모두 변환」을 클릭하세요. 각 파일이 차례로 PDF로 변환되고, 완료되면 「ZIP 내려받기」를 클릭해 하나의 압축 파일로 모두 받습니다." },
      { q: "어떤 형식을 변환할 수 있나요?", a: "Word(.doc, .docx), PowerPoint(.ppt, .pptx), Excel(.xls, .xlsx)과 함께 OpenDocument(.odt, .odp, .ods) 및 .rtf입니다. 파일 형식이 자동으로 인식되므로 문서, 슬라이드, 스프레드시트를 같은 묶음에 섞을 수 있습니다." },
      { q: "PDF가 원본과 똑같이 보이나요?", a: "변환은 LibreOffice를 사용합니다 — 단일 파일 Office to PDF 도구와 같은 엔진입니다. 일반적인 문서에서는 결과가 원본에 충실하지만, 특이한 글꼴, 매크로, 매우 복잡한 레이아웃은 약간 어긋날 수 있으니 서식에 민감한 부분은 확인하세요." },
      { q: "크기나 개수 제한이 있나요?", a: "묶음당 최대 20개 파일이며, 각 파일은 최대 5 MB입니다. 5 MB가 넘는 파일은 더 큰 파일을 처리하는 단일 파일 Word to PDF, PPT to PDF, Excel to PDF 도구를 사용하세요." },
      { q: "제 파일이 업로드되나요? 무료인가요?", a: "무료이며 계정이 필요 없습니다. Office 변환은 저희 자체 서버에서 실행되므로 각 파일이 그곳으로 전송되어 PDF로 변환된 뒤 반환됩니다 — 이후에 저장되거나 보관되지 않습니다." },
    ],
  },
  "batch-word-to-pdf": {
    title: "Word 일괄 PDF 변환 — 자주 묻는 질문",
    items: [
      { q: "여러 Word 파일을 한 번에 PDF로 변환하려면 어떻게 하나요?", a: "Word 파일을 — 또는 폴더 전체를 — 페이지에 끌어다 놓은 뒤 「모두 변환」을 클릭하세요. 각 .doc 또는 .docx 파일이 차례로 PDF로 변환되고, 완료되면 「ZIP 내려받기」를 클릭해 하나의 압축 파일로 모두 받습니다." },
      { q: "어떤 Word 형식이 지원되나요?", a: "최신 .docx와 구형 .doc은 물론 OpenDocument 텍스트(.odt)와 .rtf를 지원합니다. Word, PowerPoint, Excel을 함께 섞은 묶음은 대신 범용 Office to PDF 도구를 사용하세요." },
      { q: "PDF가 원본과 똑같이 보이나요?", a: "변환은 LibreOffice를 사용합니다 — 단일 파일 Word to PDF 도구와 같은 엔진입니다. 일반적인 문서에서는 결과가 원본에 충실하지만, 특이한 글꼴, 매크로, 매우 복잡한 레이아웃은 약간 어긋날 수 있으니 서식에 민감한 부분은 확인하세요." },
      { q: "크기나 개수 제한이 있나요?", a: "묶음당 최대 20개 파일이며, 각 파일은 최대 5 MB입니다. 5 MB가 넘는 Word 파일은 더 큰 파일을 처리하는 단일 파일 Word to PDF 도구를 사용하세요." },
      { q: "제 파일이 업로드되나요? 무료인가요?", a: "무료이며 계정이 필요 없습니다. Office 변환은 저희 자체 서버에서 실행되므로 각 파일이 그곳으로 전송되어 PDF로 변환된 뒤 반환됩니다 — 이후에 저장되거나 보관되지 않습니다." },
    ],
  },
  "batch-excel-to-pdf": {
    title: "Excel 일괄 PDF 변환 — 자주 묻는 질문",
    items: [
      { q: "여러 Excel 파일을 한 번에 PDF로 변환하려면 어떻게 하나요?", a: "스프레드시트를 — 또는 폴더 전체를 — 페이지에 끌어다 놓은 뒤 「모두 변환」을 클릭하세요. 각 .xls 또는 .xlsx 파일이 차례로 PDF로 변환되고, 완료되면 「ZIP 내려받기」를 클릭해 하나의 압축 파일로 모두 받습니다." },
      { q: "어떤 스프레드시트 형식이 지원되나요?", a: "최신 .xlsx와 구형 .xls은 물론 OpenDocument 스프레드시트(.ods)를 지원합니다. Word, PowerPoint, Excel을 함께 섞은 묶음은 대신 범용 Office to PDF 도구를 사용하세요." },
      { q: "넓은 시트가 페이지에 맞게 들어가나요?", a: "변환은 LibreOffice를 사용하며 각 시트의 인쇄 영역과 페이지 설정을 따르므로, 인쇄할 때와 똑같이 매우 넓은 표가 여러 페이지에 걸쳐 나뉠 수 있습니다. 모든 내용을 한 페이지에 담으려면 먼저 Excel에서 인쇄 영역이나 배율을 설정하세요." },
      { q: "크기나 개수 제한이 있나요?", a: "묶음당 최대 20개 파일이며, 각 파일은 최대 5 MB입니다. 5 MB가 넘는 Excel 파일은 더 큰 파일을 처리하는 단일 파일 Excel to PDF 도구를 사용하세요." },
      { q: "제 파일이 업로드되나요? 무료인가요?", a: "무료이며 계정이 필요 없습니다. Office 변환은 저희 자체 서버에서 실행되므로 각 파일이 그곳으로 전송되어 PDF로 변환된 뒤 반환됩니다 — 이후에 저장되거나 보관되지 않습니다." },
    ],
  },
  "batch-ppt-to-pdf": {
    title: "PowerPoint 일괄 PDF 변환 — 자주 묻는 질문",
    items: [
      { q: "여러 PowerPoint 파일을 한 번에 PDF로 변환하려면 어떻게 하나요?", a: "PowerPoint 파일을 — 또는 폴더 전체를 — 페이지에 끌어다 놓은 뒤 「모두 변환」을 클릭하세요. 각 .ppt 또는 .pptx 파일이 차례로 PDF로 변환되고, 완료되면 「ZIP 내려받기」를 클릭해 하나의 압축 파일로 모두 받습니다." },
      { q: "어떤 PowerPoint 형식이 지원되나요?", a: "최신 .pptx와 구형 .ppt은 물론 OpenDocument 프레젠테이션(.odp)을 지원합니다. Word, PowerPoint, Excel을 함께 섞은 묶음은 대신 범용 Office to PDF 도구를 사용하세요." },
      { q: "슬라이드가 PDF에서 어떻게 표시되나요?", a: "각 슬라이드가 차례대로 한 장의 PDF 페이지가 됩니다. LibreOffice를 사용하며 — 단일 파일 PPT to PDF 도구와 같은 엔진입니다. 발표자 노트와 애니메이션은 포함되지 않으며, PDF는 각 슬라이드의 최종 모습을 담습니다. 특이한 글꼴이나 매우 복잡한 레이아웃은 약간 어긋날 수 있으니 서식에 민감한 프레젠테이션은 확인하세요." },
      { q: "크기나 개수 제한이 있나요?", a: "묶음당 최대 20개 파일이며, 각 파일은 최대 5 MB입니다. 5 MB가 넘는 PowerPoint 파일은 더 큰 파일을 처리하는 단일 파일 PPT to PDF 도구를 사용하세요." },
      { q: "제 파일이 업로드되나요? 무료인가요?", a: "무료이며 계정이 필요 없습니다. Office 변환은 저희 자체 서버에서 실행되므로 각 파일이 그곳으로 전송되어 PDF로 변환된 뒤 반환됩니다 — 이후에 저장되거나 보관되지 않습니다." },
    ],
  },
  "batch-pdf-to-office": {
    title: "PDF 일괄 Word/Excel 변환 — 자주 묻는 질문",
    items: [
      { q: "여러 PDF를 한 번에 Word나 Excel로 변환하려면 어떻게 하나요?", a: "PDF를 — 또는 폴더 전체를 — 페이지에 끌어다 놓고, 대상으로 Word 또는 Excel을 선택한 뒤 「모두 변환」을 클릭하세요. 각 파일이 차례로 변환되고, 완료되면 「ZIP 내려받기」를 클릭해 하나의 압축 파일로 모두 받습니다." },
      { q: "Word를 선택해야 하나요, Excel을 선택해야 하나요?", a: "주로 텍스트와 문단으로 이루어진 문서에는 Word(.docx)를, 표로 구성된 PDF — 청구서, 계좌 명세서, 데이터 시트 — 에는 Excel(.xlsx)을 선택하세요. Excel은 PDF에 명확한 행과 열이 있을 때 가장 잘 작동합니다." },
      { q: "레이아웃이 원본과 똑같이 보이나요?", a: "어떤 변환기도 픽셀 단위로 똑같은 사본을 약속할 수는 없습니다. 저희는 텍스트와 표를 실제로 편집 가능한 파일로 추출하며, 이는 편집에 필요한 것입니다 — 다만 스캔한 PDF나 정교하게 디자인된 페이지는 이후에 약간의 정리가 필요할 수 있습니다. 일반 텍스트와 표가 있는 디지털 생성 PDF라면 결과가 대체로 원본에 가깝습니다." },
      { q: "크기나 개수 제한이 있나요?", a: "묶음당 최대 20개 PDF를 변환할 수 있으며, 각 파일은 최대 5 MB입니다. 5 MB가 넘는 파일은 더 큰 파일을 처리하는 단일 파일 PDF to Word 또는 PDF to Excel 도구를 사용하세요." },
      { q: "제 파일이 업로드되나요? 무료인가요?", a: "무료이며 계정이 필요 없습니다. 순수 브라우저 도구와 달리 Office 형식 변환은 저희 자체 서버에서 실행되므로 각 PDF가 그곳으로 전송되어 변환된 뒤 반환됩니다 — 이후에 저장되거나 보관되지 않습니다." },
    ],
  },
  "batch-pdf-to-word": {
    title: "PDF 일괄 Word 변환 — 자주 묻는 질문",
    items: [
      { q: "여러 PDF를 한 번에 Word로 변환하려면 어떻게 하나요?", a: "PDF를 — 또는 폴더 전체를 — 페이지에 끌어다 놓은 뒤 「모두 변환」을 클릭하세요. 각 파일이 차례로 편집 가능한 Word 문서로 변환되고, 완료되면 「ZIP 내려받기」를 클릭해 하나의 압축 파일로 모두 받습니다." },
      { q: "Word 파일이 원본과 똑같이 보이나요?", a: "어떤 변환기도 픽셀 단위로 똑같은 사본을 약속할 수는 없습니다. 저희는 텍스트를 실제로 편집 가능한 .docx 파일로 추출하며, 이는 편집에 필요한 것입니다 — 다만 스캔한 PDF나 정교하게 디자인된 페이지는 이후에 약간의 정리가 필요할 수 있습니다. 일반 텍스트가 있는 디지털 생성 PDF라면 결과가 대체로 원본에 가깝습니다." },
      { q: "어떤 PDF가 가장 잘 변환되나요?", a: "텍스트 기반의 디지털 생성 PDF가 가장 잘 변환됩니다. 스캔한 PDF는 선택 가능한 텍스트가 없으니 먼저 OCR을 실행하세요. 그렇지 않으면 Word 파일이 비어 있는 채로 나옵니다. PDF가 주로 표로 구성되어 있다면 PDF to Excel 변환기가 보통 더 깔끔한 결과를 냅니다." },
      { q: "크기나 개수 제한이 있나요?", a: "묶음당 최대 20개 PDF를 변환할 수 있으며, 각 파일은 최대 5 MB입니다. 5 MB가 넘는 파일은 더 큰 파일을 처리하는 단일 파일 PDF to Word 도구를 사용하세요." },
      { q: "제 파일이 업로드되나요? 무료인가요?", a: "무료이며 계정이 필요 없습니다. 순수 브라우저 도구와 달리 Word 변환은 저희 자체 서버에서 실행되므로 각 PDF가 그곳으로 전송되어 변환된 뒤 반환됩니다 — 이후에 저장되거나 보관되지 않습니다." },
    ],
  },
  "batch-pdf-to-excel": {
    title: "PDF 일괄 Excel 변환 — 자주 묻는 질문",
    items: [
      { q: "여러 PDF를 한 번에 Excel로 변환하려면 어떻게 하나요?", a: "PDF를 — 또는 폴더 전체를 — 페이지에 끌어다 놓은 뒤 「모두 변환」을 클릭하세요. 각 파일이 차례로 편집 가능한 Excel 스프레드시트로 변환되고, 완료되면 「ZIP 내려받기」를 클릭해 하나의 압축 파일로 모두 받습니다." },
      { q: "Excel 파일이 원본과 똑같이 보이나요?", a: "어떤 변환기도 픽셀 단위로 똑같은 사본을 약속할 수는 없습니다. 저희는 표와 텍스트를 실제로 편집 가능한 .xlsx 파일로 추출하며, 이는 숫자를 다루는 데 필요한 것입니다 — 다만 스캔한 PDF나 정교하게 디자인된 페이지는 이후에 약간의 정리가 필요할 수 있습니다. 명확한 표가 있는 디지털 생성 PDF라면 결과가 대체로 원본에 가깝습니다." },
      { q: "어떤 PDF가 가장 잘 변환되나요?", a: "명확한 표로 구성된 PDF — 청구서, 계좌 명세서, 데이터 시트 — 가 가장 잘 변환됩니다. 행과 열이 스프레드시트 셀로 곧바로 옮겨지기 때문입니다. 스캔한 PDF는 선택 가능한 텍스트가 없으니 먼저 OCR을 실행하세요. PDF가 표보다 주로 문단으로 구성되어 있다면 PDF to Word 변환기가 보통 더 깔끔한 결과를 냅니다." },
      { q: "크기나 개수 제한이 있나요?", a: "묶음당 최대 20개 PDF를 변환할 수 있으며, 각 파일은 최대 5 MB입니다. 5 MB가 넘는 파일은 더 큰 파일을 처리하는 단일 파일 PDF to Excel 도구를 사용하세요." },
      { q: "제 파일이 업로드되나요? 무료인가요?", a: "무료이며 계정이 필요 없습니다. 순수 브라우저 도구와 달리 Excel 변환은 저희 자체 서버에서 실행되므로 각 PDF가 그곳으로 전송되어 변환된 뒤 반환됩니다 — 이후에 저장되거나 보관되지 않습니다." },
    ],
  },
  "batch-compress": {
    title: "PDF 일괄 압축 — 자주 묻는 질문",
    items: [
      { q: "여러 PDF를 한 번에 압축하려면 어떻게 하나요?", a: "PDF를 페이지에 끌어다 놓거나 — 폴더 전체를 끌어다 놓거나 「폴더 선택」을 사용하면 — 그 폴더 안의 PDF가 아닌 파일은 자동으로 걸러집니다. 압축 강도(「약하게」, 「권장」, 「강하게」)를 선택한 뒤 「모두 압축」을 클릭하세요. 각 파일이 차례로 처리되고, 완료되면 「ZIP 내려받기」를 클릭해 하나의 압축 파일로 모두 받습니다." },
      { q: "제 파일이 서버에 업로드되나요?", a: "아니요. 이것은 100% 클라이언트 측 도구입니다. 각 PDF는 브라우저 안에서 직접 읽히고 압축되며, 어떤 것도 서버로 전송되지 않습니다. 파일이 기기를 절대 벗어나지 않으므로 기밀 문서에도 마음 놓고 사용할 수 있습니다." },
      { q: "무엇을 받게 되며 파일 이름은 어떻게 되나요?", a: "하나의 ZIP 파일(dockdocs-compressed.zip)을 받습니다. 그 안에서 각 PDF는 확장자 앞에 「-compressed」가 붙은 원래 이름을 유지합니다 — 즉 report.pdf는 report-compressed.pdf가 됩니다. 각 행은 해당 파일이 얼마나 줄었는지도 보여주며, 내려받기 버튼은 전체 용량 절감을 표시합니다." },
      { q: "파일 개수나 크기에 제한이 있나요?", a: "묶음당 최대 30개 PDF를 추가할 수 있습니다. 파일당 고정된 크기 상한은 없으며 — 모든 작업이 브라우저 안에서 실행되므로 실제 한계는 기기의 메모리입니다. 크거나 많은 파일도 여전히 작동하며, 성능이 낮은 기기에서는 시간이 더 걸릴 뿐입니다." },
      { q: "제 PDF가 거의 줄지 않은 이유는 무엇인가요?", a: "압축은 각 페이지를 이미지로 렌더링하는 방식으로 작동합니다. 이는 스캔본과 이미지가 많은 PDF에는 매우 효과적이지만, 주로 순수 텍스트로 이루어진 파일에는 거의 효과가 없습니다 — 줄일 여지가 별로 없기 때문입니다. 어떤 파일이 거의 변하지 않는다면 그것은 예상된 결과입니다. 「강하게」를 시도하면 조금 더 줄일 수 있지만, 순수 텍스트 PDF는 이미 최소 크기에 가깝습니다." },
      { q: "무료인가요? 계정이 필요한가요?", a: "네, 완전 무료입니다 — 가입도, 워터마크도, 일일 제한도 없습니다. 그냥 페이지를 열고 압축을 시작하세요." },
    ],
  },
  "batch-pdf-to-image": {
    title: "PDF 일괄 이미지 변환 — 자주 묻는 질문",
    items: [
      { q: "PDF 묶음을 이미지로 변환하려면 어떻게 하나요?", a: "PDF를 업로드 영역에 끌어다 놓거나 — 폴더 전체를 끌어다 놓거나 「폴더 선택」을 클릭해 하나를 고르세요. JPG 또는 PNG를 선택한 뒤 「모두 변환」을 클릭하세요. 각 PDF의 모든 페이지가 이미지로 바뀌고, 결과는 하나의 ZIP으로 내려받습니다. 가입도, 워터마크도 없습니다." },
      { q: "제 파일이 서버에 업로드되나요?", a: "아니요. 이 도구는 100% 클라이언트 측입니다. 각 PDF는 전적으로 브라우저 안에서 읽히고 이미지로 렌더링되며, 어떤 것도 서버로 업로드되지 않습니다. 내려받는 ZIP은 기기에서 로컬로 생성됩니다. 페이지가 한 번 로드되면 오프라인에서도 실행할 수 있습니다." },
      { q: "무엇을 받게 되며 이미지 이름은 어떻게 되나요?", a: "각 페이지를 별도의 이미지로 담은 ZIP 파일(dockdocs-images.zip)을 받습니다. 각 파일은 원본 PDF 이름에 페이지 번호를 더해 이름이 붙습니다 — 예를 들어 report.pdf는 report-1.jpg, report-2.jpg 등이 됩니다. 페이지는 선명한 고해상도 출력을 위해 2배 배율로 렌더링됩니다." },
      { q: "여기서 JPG와 PNG의 차이는 무엇인가요?", a: "JPG는 더 작은 파일을 만들고 각 페이지를 흰색 배경 위에 놓습니다 — 사진이 많거나 스캔한 문서에 적합합니다. PNG는 무손실이며 투명도를 유지하므로 선화, 도표, 또는 나중에 편집할 페이지에 더 좋습니다. 「모두 변환」을 클릭하기 전에 알맞은 것을 고르세요. 언제든 다른 형식으로 다시 실행할 수 있습니다." },
      { q: "한 번에 몇 개의 파일이나 페이지를 변환할 수 있나요?", a: "묶음당 최대 20개 PDF를 대기열에 넣을 수 있으며 — 그 이상의 파일은 자동으로 제외됩니다. 고정된 페이지나 크기 제한은 없으므로 실제 상한은 기기의 메모리입니다. 매우 큰 PDF나 엄청난 페이지 수는 시간이 더 걸리고 성능이 낮은 기기에서 더 느리게 실행될 뿐입니다. 큰 작업은 여러 묶음으로 나누세요." },
      { q: "제 PDF 중 하나가 「실패」로 표시된 이유는 무엇인가요?", a: "가장 흔한 원인은 암호로 보호되었거나 암호화된 PDF입니다 — 도구가 열 수 없는 페이지는 렌더링할 수 없으므로 해당 파일은 실패로 표시되고 나머지 묶음은 정상적으로 변환됩니다. 먼저 암호를 제거하고(저희 PDF 잠금 해제 도구가 도와줍니다) 다시 추가하세요. 손상되었거나 PDF가 아닌 파일도 실패할 수 있지만, 폴더를 끌어다 놓으면 PDF가 아닌 파일은 실패하는 대신 자동으로 걸러집니다." },
    ],
  },
  "batch-protect-pdf": {
    title: "PDF 일괄 암호화 — 자주 묻는 질문",
    items: [
      { q: "여러 PDF를 한 번에 암호화하려면 어떻게 하나요?", a: "PDF를 영역에 끌어다 놓거나 — 폴더 전체를 끌어다 놓거나 클릭해 파일을 고르세요. 암호를 입력하고(「암호」 필드) 「모두 암호화」를 클릭하세요. 각 파일이 같은 암호로 잠기고, 각 파일이 「…-protected.pdf」로 이름이 바뀐 하나의 ZIP을 받습니다." },
      { q: "제 파일이 서버에 업로드되나요?", a: "아니요. 이것은 100% 클라이언트 측 도구입니다 — 각 PDF는 브라우저 안에서 직접 암호화되며, 어떤 것도 기기를 절대 벗어나지 않습니다. 업로드도, 계정도, 어딘가에 보관되는 사본도 없습니다. 페이지가 한 번 로드되면 오프라인에서도 실행할 수 있습니다." },
      { q: "무엇을 어떤 형식으로 받게 되나요?", a: "「dockdocs-protected.zip」이라는 ZIP 파일을 받습니다. 그 안에서 입력한 각 PDF가 「-protected.pdf」 접미사가 붙은 자체 암호화 파일로 나타납니다. 그중 하나를 열면 리더가 귀하가 설정한 암호를 묻습니다." },
      { q: "암호 규칙이나 파일 개수 제한이 있나요?", a: "암호는 4~32자여야 하며 문자, 숫자, 밑줄(_)만 포함할 수 있습니다 — 이는 어떤 PDF 리더에서도 안정적으로 작동하도록 유지합니다. 묶음당 최대 30개 파일을 암호화할 수 있으며, 더 많으면 도구를 다시 실행하면 됩니다. 고정된 크기 제한은 없지만, 모든 작업이 브라우저 안에서 실행되므로 메모리가 적은 기기에서는 매우 큰 작업이 더 느리게 진행됩니다." },
      { q: "이미 암호로 보호된 PDF는 어떻게 되나요?", a: "건너뜁니다. 도구는 열 수 없는 파일을 다시 잠글 수 없으므로, 이미 암호가 있는 PDF는 전체 묶음을 실패시키는 대신 ZIP에서 제외됩니다. 여기서 다시 암호화하려면 먼저 (원래 암호로) 복호화하세요." },
      { q: "정말 무료인가요? 워터마크나 가입이 있나요?", a: "네, 완전 무료이며 가입도, 워터마크도 없습니다. 암호화된 PDF는 바이트 단위로 귀하의 원본에 암호가 더해진 것입니다 — DockDocs는 거기에 어떤 것도 추가하지 않습니다." },
    ],
  },
  "flashcards": {
    title: "PDF 플래시카드 — 자주 묻는 질문",
    items: [
      { q: "PDF를 플래시카드로 만들려면 어떻게 하나요?", a: "PDF를 끌어다 놓으세요 — 교과서 한 챕터, 강의 노트, 또는 매뉴얼 — 그러면 도구가 브라우저 안에서 직접 텍스트를 읽습니다. 원하는 카드 수(5, 10, 15, 20)를 선택하고 「카드 생성」을 누르세요. 질문/답변 카드 격자를 받게 되며, 아무 카드나 눌러 뒤집어 스스로 확인할 수 있습니다." },
      { q: "제 PDF가 어딘가에 업로드되나요?", a: "PDF 파일은 절대 업로드되지 않습니다. 텍스트는 브라우저 안에서 추출되며, 카드를 작성하기 위해 그 순수 텍스트(와 카드 수, 언어)만 저희 AI 서비스로 전송됩니다. 이미지, 레이아웃, 메타데이터가 담긴 원본 파일은 귀하의 기기에 남습니다." },
      { q: "「이 PDF에서 텍스트를 찾을 수 없음」이 나타나는 이유는 무엇인가요?", a: "귀하의 PDF가 스캔본이거나 이미지입니다 — 읽을 텍스트 레이어 없이 페이지의 이미지만 있습니다. 먼저 OCR을 거쳐 검색 가능한 텍스트 레이어를 추가한 뒤 다시 시도하세요. 팁: PDF가 암호로 보호되어 있다면 먼저 「PDF 잠금 해제」 도구로 잠금을 푸세요." },
      { q: "카드가 정확한가요?", a: "카드는 오직 귀하 문서의 텍스트만을 바탕으로 AI가 작성하며 — 외부 지식을 사용하지 않고 사실을 지어내지 않도록 지시받습니다. 그래도 AI가 잘못 읽거나 지나치게 단순화할 수 있으니 학습에 쓰기 전에 카드를 잠깐 확인하세요. 도구가 결과 화면에서 이를 상기시켜 줍니다." },
      { q: "크기나 사용 제한이 있나요?", a: "네. 각 실행은 최대 약 16,000자의 텍스트 — 대략 12페이지 — 를 받으므로, 책 전체가 아니라 한 번에 한 챕터나 한 섹션을 넣으세요. 또한 분당 약 6회 생성이라는 공정 사용 속도 제한이 있습니다. 둘 중 하나에 도달하면 명확한 안내가 표시되니 내용을 줄이거나 1분 기다리세요." },
      { q: "무료인가요? 인터넷 연결이 필요한가요?", a: "사용은 무료입니다 — 계정도, 결제도 필요 없습니다. 카드는 AI 서비스가 작성하므로 인터넷 연결이 필요합니다. 브라우저는 PDF를 오프라인으로 읽지만, 카드 생성은 저희 서버로의 짧은 호출을 일으킵니다." },
    ],
  },
  "compare": {
    title: "문서 비교 — 자주 묻는 질문",
    items: [
      { q: "문서를 어떻게 비교하나요?", a: "같은 종류의 PDF 2~8개를 업로드하세요 — 견적서, 청구서, 또는 계약서 — 그런 다음 유형을 선택하고 「필드 비교」를 클릭하세요. DockDocs가 핵심 조건(가격, 배송, 결제, 보증 등)을 표로 나란히 배치하고, 찾을 수 있는 한 각 값 뒤의 정확한 원문 줄을 보여줍니다(그리고 어떤 문서가 무언가를 명시하지 않으면 추측 대신 「감지되지 않음」으로 표시합니다). 또한 이렇게 비교된 수치에 근거해 어떤 선택지가 우세한지에 대한 추천을 받으며, 모든 문서에 대해 한 번에 질문할 수 있습니다." },
      { q: "제 파일이 저희 서버에 업로드되나요?", a: "아니요 — PDF는 기기를 절대 벗어나지 않습니다. DockDocs가 텍스트를 뽑아내기 위해 브라우저 안에서 직접 읽습니다. 그렇게 추출된 순수 텍스트만(파일 자체가 아니라) 저희 서버로 전송되어 AI가 필드를 추출하고 정렬합니다. 따라서 문서와 그 레이아웃, 임베드된 데이터는 로컬에 남고, 이동하는 것은 페이지 위의 단어뿐입니다." },
      { q: "제 PDF에 「감지되지 않음(스캔본으로 추정 — OCR 필요)」이라고 나오는 이유는 무엇인가요?", a: "그것은 PDF에 선택 가능한 텍스트 레이어가 없다는 뜻으로, 대개 스캔본이거나 페이지 사진이므로 읽을 것이 없습니다. 해당 문서에서 「OCR로 텍스트 추출」을 클릭하면 DockDocs가 브라우저 안에서 OCR을 실행해 텍스트(처음 몇 페이지)를 인식하며, 그 후에는 다른 파일과 똑같이 비교할 수 있습니다. 암호화되었거나 암호로 보호된 PDF도 잠금이 해제되기 전에는 읽을 수 없습니다." },
      { q: "무엇을 받게 되며 값을 믿어도 되나요?", a: "각 셀이 값과 함께 그것이 나온 정확한 원문 줄을 보여주는 비교표를 받습니다 — 그리고 그 줄은 실제로 귀하의 문서에 나타나는지 확인되므로 어떤 것도 지어내지 않습니다. 아무 원문 줄이나 클릭하면 강조 표시된 원본 텍스트 조각으로 이동합니다. 어떤 문서가 무언가를 그저 명시하지 않으면 추측 대신 「감지되지 않음」이 보입니다. 한 가지 유의점: 전체 추천은 이 수치에 대한 AI의 결론이며 개별적으로 출처가 확인되지는 않으니, 결정하기 전에 표의 수치를 확인하세요." },
      { q: "파일 개수나 크기에 제한이 있나요?", a: "한 번에 최대 8개 PDF를 비교할 수 있으며, 비교가 실행되려면 읽을 수 있는 파일이 최소 2개 필요합니다. 「문서 전반에 질문하기」 기능을 쓰려면 모든 문서의 합산 텍스트가 60,000자 미만, 질문이 500자 미만이어야 합니다 — 이에 도달하면 더 적거나 짧은 문서를 사용하세요. 필드 추출과 추천이 저희 서버에서 실행되므로 도구에는 인터넷 연결이 필요합니다." },
      { q: "무료인가요?", a: "네 — PDF를 업로드하고, 나란히 비교를 실행하고, 추천을 받고, 문서 전반에 질문할 수 있습니다. 스캔한 파일에 대한 브라우저 내 OCR도 귀하의 기기에서 로컬로 실행되므로 무료입니다." },
    ],
  },
  "merge-pdf": {
    title: "PDF 파일 병합 — 자주 묻는 질문",
    items: [
      { q: "PDF 파일을 어떻게 병합하나요?", a: "두 개 이상의 PDF를 추가하고, 파일 미리보기를 원하는 순서로 끌어다 놓은 뒤 「병합 후 내려받기」를 클릭하세요. 페이지가 위에서 아래의 그 순서대로 하나의 PDF로 결합됩니다." },
      { q: "결합 순서를 제어할 수 있나요?", a: "네. 각 파일은 미리보기와 번호 배지를 표시합니다 — 병합 전에 끌어다 놓아 다시 배열하세요. 클릭한 뒤가 아니라 그 전에 무엇이 어디로 가는지 정확히 볼 수 있습니다." },
      { q: "제 파일이 서버에 업로드되나요?", a: "아니요. 모든 작업이 브라우저 안에서 로컬로 실행됩니다 — 병합은 귀하의 기기에서 이루어지며, 파일은 절대 업로드되거나 어딘가로 전송되지 않습니다. 계정도, 가입도 필요 없습니다." },
      { q: "파일이나 페이지 제한이 있나요?", a: "고정된 상한은 없습니다. 전체 작업이 브라우저 안에서 실행되므로 실질적 한계는 기기의 메모리입니다 — 매우 큰 파일이나 한 번에 많은 파일은 RAM이 적은 기기에서 느려질 수 있습니다." },
      { q: "제 PDF 중 하나가 건너뛰어진 이유는 무엇인가요?", a: "암호로 보호되었거나 암호화된 PDF는 읽을 수 없으므로 안내와 함께 제외됩니다. 잠금을 해제하거나 먼저 암호를 제거한 뒤 파일을 다시 추가하세요." },
      { q: "무료인가요?", a: "네 — 완전 무료이며 워터마크도, 가입도 없습니다. 병합된 파일은 하나의 PDF로 내려받습니다." },
    ],
  },
  "split-pdf": {
    title: "PDF 한 개 분할 — 자주 묻는 질문",
    items: [
      { q: "PDF를 어떻게 분할하나요?", a: "PDF를 업로드한 뒤 두 페이지 사이의 ✂를 클릭해 분할 지점을 설정하세요. 분할은 원하는 만큼 추가할 수 있고, 「N페이지마다 분할」을 사용해 자동으로 배치할 수도 있습니다. 「분할 후 내려받기」를 클릭하면 각 구간이 자체 PDF로 저장되어 하나의 ZIP에 함께 묶입니다." },
      { q: "각 파일에 무엇이 들어갈지 어떻게 아나요?", a: "내려받기 전에 페이지가 색으로 음영 처리되고 「파일 1」, 「파일 2」 등으로 표시되며, 실시간 카운터가 몇 개의 파일이 만들어지는지 정확히 알려줍니다 — 그래서 뜻밖의 일이 없습니다." },
      { q: "제 파일이 어딘가에 업로드되나요?", a: "아니요. 모든 분할이 브라우저 안에서 로컬로 실행됩니다 — PDF는 귀하의 기기에서 읽히고, 잘리고, 묶이며, 절대 서버로 전송되지 않습니다. 어떤 것도 기기를 벗어나지 않습니다." },
      { q: "파일이나 페이지 제한이 있나요?", a: "고정된 상한은 없습니다. 모든 작업이 브라우저 안에서 실행되므로 실질적 한계는 기기의 메모리입니다 — 매우 큰 PDF나 페이지가 많은 PDF는 렌더링에 시간이 더 걸리고 오래된 휴대폰이나 노트북에 부담을 줄 수 있습니다." },
      { q: "실제로 무엇을 받게 되며 무료인가요?", a: "구간당 한 개의 PDF가 담긴 ZIP을 받습니다(document-part-1.pdf, document-part-2.pdf처럼 이름이 붙습니다). 분할 지점을 하나만 설정해도 출력물은 ZIP으로 나옵니다. 완전 무료이며 가입도, 워터마크도 없습니다. 참고: 암호로 보호된 PDF는 먼저 잠금을 해제해야 합니다." },
    ],
  },
  "crop-pdf": {
    title: "PDF 자르기 — 자주 묻는 질문",
    items: [
      { q: "PDF를 어떻게 자르나요?", a: "PDF를 업로드한 뒤 위, 오른쪽, 아래, 왼쪽 슬라이더를 끌어 각 가장자리를 잘라내세요. 그동안 실시간 미리보기를 볼 수 있으니, 마음에 들 때까지 조정한 뒤 「자르기 후 내려받기」를 클릭하세요." },
      { q: "모든 페이지가 똑같이 잘리나요?", a: "네. 설정한 여백이 모든 페이지에 일관되게 적용되어 문서 전체가 일관성을 유지합니다. 이 도구에는 페이지 단위 자르기가 없습니다." },
      { q: "잘린 내용이 실제로 삭제되나요?", a: "아니요. 자르기는 보이는 영역(자르기 상자)을 바꿉니다 — 잘린 부분은 삭제되지 않고 숨겨집니다. 즉 실제로 사라지는 것은 없지만, 누군가가 복원할 수도 있다는 뜻입니다. 내용을 영구적으로 없애려면 대신 마스킹(블랙아웃) 도구를 사용하세요." },
      { q: "제 파일이 어딘가에 업로드되나요?", a: "아니요. 모든 작업이 브라우저 안에서 로컬로 실행됩니다 — PDF는 기기를 절대 벗어나지 않으며, 어떤 것도 서버로 전송되지 않습니다." },
      { q: "파일 크기 제한이 있나요?", a: "고정된 제한은 없습니다. 모든 작업이 브라우저 안에서 이루어지므로 실질적 상한은 기기의 메모리에 달려 있습니다 — 매우 큰 파일은 성능이 낮은 기기에서 느려지거나 메모리를 초과할 수 있습니다." },
      { q: "무료인가요? 계정이 필요한가요?", a: "완전 무료이며 가입이 필요 없습니다. 그냥 페이지를 열고 자르기를 시작하세요." },
    ],
  },
  "sign-pdf": {
    title: "PDF 서명 — 자주 묻는 질문",
    items: [
      { q: "PDF에 어떻게 서명하나요?", a: "PDF를 업로드하고, 서명을 그리거나 입력하고, 페이지·위치·크기를 선택한 뒤 「서명 후 내려받기」를 클릭하세요. …-signed.pdf라는 이름의 새 파일을 받습니다." },
      { q: "제 파일이 어딘가에 업로드되나요?", a: "아니요. 모든 작업이 브라우저 안에서 실행됩니다 — 페이지가 렌더링되고 서명이 로컬에서 PDF에 찍힙니다. 파일은 기기를 절대 벗어나지 않으며, 어떤 것도 서버로 전송되지 않습니다." },
      { q: "서명을 그릴 수 있나요, 아니면 입력해야 하나요?", a: "둘 다 됩니다. 마우스나 손가락으로 영역에 그리거나 「입력」으로 전환해 이름을 필기체로 표현하세요. 그린 서명을 다시 하려면 「지우기」를 누르세요." },
      { q: "파일 크기 제한이 있고, 비용이 드나요?", a: "무료이며 가입이 필요 없습니다. 고정된 크기 상한은 없지만 모든 작업이 메모리에서 처리되므로 매우 큰 PDF는 기기의 RAM에 달려 있습니다 — 거대한 파일은 오래된 휴대폰이나 노트북에서 느릴 수 있습니다." },
      { q: "서명이 실제로 어디에 들어가며 무엇에 유의해야 하나요?", a: "서명은 아홉 개의 앵커 위치(모서리, 가장자리, 가운데) 중 하나에 놓이고 크기 슬라이더로 조절됩니다 — 픽셀 단위로 끌 수는 없습니다. 한 번에 한 페이지에 찍히므로 서명할 각 페이지마다 반복하세요. 암호화/암호로 보호된 PDF는 먼저 잠금을 해제해야 합니다." },
      { q: "이것이 법적으로 유효한 전자 서명으로 인정되나요?", a: "서명은 인증서 기반 디지털 서명이 아니라 페이지에 이미지로 찍힙니다. 입력하거나 그린 전자 서명은 많은 일상 문서에서 인정되지만, 귀하의 용도에 대한 구체적인 요건은 확인하세요." },
    ],
  },
  "reorder-pages": {
    title: "PDF 페이지 재배열 — 자주 묻는 질문",
    items: [
      { q: "PDF의 페이지를 어떻게 재배열하나요?", a: "PDF를 업로드한 뒤 페이지 미리보기를 원하는 순서로 끌어다 놓고 「적용 후 내려받기」를 클릭하세요. 페이지 번호를 입력할 필요 없이 시각적으로 배열합니다." },
      { q: "그 과정에서 페이지를 삭제할 수도 있나요?", a: "네. 아무 미리보기의 ✕를 클릭해 그 페이지를 제거한 뒤 내려받으세요. 페이지 재배열과 제거가 같은 단계에서 이루어집니다." },
      { q: "제 파일이 어딘가에 업로드되나요?", a: "아니요. 모든 작업이 브라우저 안에서 로컬로 실행됩니다 — PDF는 절대 업로드되지 않으며 기기를 벗어나지 않습니다." },
      { q: "파일이나 페이지 제한이 있나요?", a: "고정된 제한은 없습니다. 모든 작업이 귀하의 기기에서 이루어지므로 매우 큰 PDF는 그저 기기의 메모리에 달려 있을 뿐입니다." },
      { q: "재배열하면 품질이 떨어지나요?", a: "아니요. 페이지는 원래 내용과 해상도를 유지합니다 — 순서만 바뀌며, 어떤 것도 다시 렌더링되거나 압축되지 않습니다." },
      { q: "무료인가요? 계정이 필요한가요?", a: "완전 무료이며 가입이 필요 없습니다." },
    ],
  },
  "delete-page": {
    title: "PDF 페이지 삭제 — 자주 묻는 질문",
    items: [
      { q: "PDF에서 페이지를 어떻게 삭제하나요?", a: "PDF를 업로드하고, 제거하려는 페이지를 클릭한 뒤(빨갛게 ✕가 표시됩니다) 「삭제 후 내려받기」를 클릭하세요. 카운터가 몇 페이지가 삭제되고 몇 페이지가 남는지 보여줍니다." },
      { q: "잘못된 페이지를 표시하면 어떻게 하나요?", a: "그냥 다시 클릭해 그대로 두세요 — 빨간 표시와 ✕가 사라집니다. 내려받기 전에 원하는 만큼 표시하고 해제할 수 있습니다." },
      { q: "제 파일이 어딘가에 업로드되나요?", a: "아니요. 모든 작업이 귀하 기기의 메모리를 사용해 브라우저 안에서 실행됩니다 — PDF는 절대 서버로 전송되지 않으며 기기를 벗어나지 않습니다." },
      { q: "파일 크기 제한이 있나요?", a: "고정된 상한은 없습니다. 작업이 로컬에서 이루어지므로 실질적 한계는 기기의 메모리입니다 — 매우 크거나 이미지가 많은 PDF는 성능이 낮은 기기에서 느릴 수 있습니다." },
      { q: "무엇을 받게 되나요?", a: "표시한 페이지가 제거된 새 PDF를 「귀하파일-pages-removed.pdf」로 내려받습니다. 남은 페이지는 원래 내용과 순서를 유지하며, 원본 파일은 변경되지 않습니다. 최소 한 페이지는 남겨야 합니다." },
      { q: "무료인가요?", a: "네 — 완전 무료이며 가입이나 계정이 필요 없습니다." },
    ],
  },
  "rotate-page": {
    title: "PDF 페이지 회전 — 자주 묻는 질문",
    items: [
      { q: "PDF의 페이지를 어떻게 회전하나요?", a: "PDF를 업로드하고 페이지를 클릭해 시계 방향으로 90° 회전하세요. 같은 페이지를 계속 클릭하면 180°, 270°를 거쳐 다시 돌아옵니다. 또는 「모두 90° 회전」을 눌러 모든 페이지를 한 번에 회전한 뒤 내려받으세요." },
      { q: "한 페이지만 회전하거나 서로 다른 페이지를 다른 각도로 회전할 수 있나요?", a: "네. 각 페이지가 독립적으로 회전하므로 옆으로 누운 스캔본 한 장을 바로잡거나 여러 페이지를 서로 다른 각도로 설정할 수 있습니다 — 클릭한 페이지만 바뀝니다." },
      { q: "제 파일이 어딘가에 업로드되나요?", a: "아니요. 모든 작업이 브라우저 안에서 로컬로 실행됩니다 — 회전은 귀하의 기기에서 PDF에 기록되며, 파일은 절대 서버로 전송되지 않고 기기를 벗어나지 않습니다." },
      { q: "파일이나 페이지 제한이 있나요?", a: "저희가 정한 고정된 제한은 없습니다. 모든 작업이 브라우저 안에서 이루어지므로 실질적 상한은 기기의 메모리에 달려 있습니다 — 매우 큰 PDF는 메모리가 적은 휴대폰이나 태블릿에서 느려질 수 있습니다." },
      { q: "회전하면 품질이 떨어지거나 내용이 바뀌나요?", a: "아니요. 회전은 각 페이지의 방향 플래그만 설정합니다 — 텍스트, 이미지, 해상도는 정확히 그대로입니다. 어떤 것도 다시 렌더링되거나 압축되지 않습니다." },
      { q: "무료인가요? 계정이 필요한가요?", a: "완전 무료이며 가입이 필요 없습니다. 페이지를 열고, 회전하고, 내려받으세요." },
    ],
  },
  "add-page": {
    title: "PDF에 페이지 삽입 — 자주 묻는 질문",
    items: [
      { q: "PDF에 페이지를 어떻게 삽입하나요?", a: "PDF를 업로드하고, 삽입하려는 위치를 클릭한 뒤(맨 앞이나 특정 페이지 다음), 거기에 삽입할 파일을 선택하고 「삽입 후 내려받기」를 클릭하세요." },
      { q: "무엇을 삽입할 수 있나요?", a: "다른 PDF(그 모든 페이지가 해당 위치에 삽입됩니다) 또는 한 장의 PNG/JPG 이미지(새 페이지로 추가됩니다)입니다." },
      { q: "제 파일이 업로드되나요?", a: "아니요. 모든 작업이 pdf-lib를 사용해 브라우저 안에서 로컬로 실행됩니다 — 파일은 기기를 절대 벗어나지 않으며, 어떤 것도 서버로 전송되지 않습니다." },
      { q: "무엇을 받게 되나요?", a: "삽입된 페이지가 제자리에 들어간 하나의 새 PDF를 「<귀하-파일>-with-insert.pdf」로 내려받습니다. 원본 파일은 변경되지 않습니다." },
      { q: "파일 크기 제한이 있나요?", a: "고정된 제한은 없지만 모든 작업이 브라우저 안에서 이루어지므로 매우 큰 PDF는 기기의 메모리에 달려 있습니다. 거대한 파일에 문제가 생기면 더 작은 것을 시도하세요." },
      { q: "무료인가요?", a: "네 — 완전 무료이며 가입이나 계정이 필요 없습니다." },
    ],
  },
  "watermark-pdf": {
    title: "PDF에 워터마크 추가 — 자주 묻는 질문",
    items: [
      { q: "PDF에 워터마크를 어떻게 추가하나요?", a: "PDF를 업로드하고, 텍스트나 이미지 워터마크를 만든 뒤 실시간 미리보기를 보며 위치, 불투명도, 회전을 조정하세요. 어떤 페이지에 찍을지 선택한 뒤 「적용 후 내려받기」를 클릭하세요." },
      { q: "텍스트 대신 이미지나 로고를 쓸 수 있나요?", a: "네. 이미지 모드로 전환해 로고나 이미지를 워터마크로 넣으세요. 어느 쪽이든 위치, 불투명도, 회전을 설정할 수 있습니다." },
      { q: "모든 페이지에 찍히나요?", a: "그것은 귀하가 정합니다. 워터마크는 귀하가 선택한 페이지에 들어가므로 문서 전체에 표시하거나 특정 페이지에만 표시할 수 있습니다." },
      { q: "제 파일이 어딘가에 업로드되나요?", a: "아니요. 워터마크는 브라우저 안에서 직접 적용됩니다 — PDF는 기기를 절대 벗어나지 않으며, 어떤 것도 서버로 전송되지 않습니다." },
      { q: "파일 크기 제한이 있나요?", a: "고정된 상한은 없습니다. 모든 작업이 로컬로 실행되므로 매우 큰 PDF는 기기의 메모리로만 제한되며 — 대부분의 기기에서 그것은 충분합니다." },
      { q: "무료인가요? 계정이 필요한가요?", a: "무료이며 가입이 없습니다. 그냥 페이지를 열고, PDF를 추가하고, 워터마크가 들어간 파일을 내려받으세요." },
    ],
  },
  "page-numbers": {
    title: "PDF에 페이지 번호 추가 — 자주 묻는 질문",
    items: [
      { q: "PDF에 페이지 번호를 어떻게 추가하나요?", a: "PDF를 업로드하고, 번호가 들어갈 위치(위 또는 아래, 왼쪽/가운데/오른쪽)를 선택하고, 형식과 시작 번호를 고른 뒤 페이지 범위를 설정하세요. 실시간 미리보기가 어떻게 보일지 정확히 보여주며, 그런 다음 「번호 추가 후 내려받기」를 클릭하세요." },
      { q: "제 파일이 어딘가에 업로드되나요?", a: "아니요. 모든 작업이 브라우저 안에서 로컬로 실행됩니다 — PDF는 귀하의 기기에서 읽히고, 번호가 매겨지고, 저장됩니다. 파일은 절대 업로드되지 않으며 컴퓨터를 벗어나지 않습니다." },
      { q: "어떤 형식과 위치를 쓸 수 있나요?", a: "네 가지 형식: 숫자만(1), 페이지 1, 1 / N, 또는 1 / N 중. 여섯 가지 위치: 위 또는 아래를 왼쪽, 가운데, 오른쪽과 조합합니다. 또한 작은/중간/큰 여백을 설정할 수 있습니다." },
      { q: "특정 번호에서 시작하거나 일부 페이지만 번호를 매길 수 있나요?", a: "네. 첫 번호를 「시작 번호」로 설정하고(표지를 세지 않으려 할 때 편리합니다), 시작/끝 범위를 사용해 문서의 일부만 번호를 매기세요. 번호 매기기는 귀하가 선택한 범위에 걸쳐 이어집니다." },
      { q: "파일 크기 제한이 있나요?", a: "고정된 상한은 없습니다. 작업이 브라우저 안에서 이루어지므로 매우 큰 PDF는 기기의 메모리로만 제한되며 — 대부분의 기기에서 일반적인 문서는 문제없이 처리됩니다." },
      { q: "무료인가요? 계정이 필요한가요?", a: "네, 완전 무료이며 가입이 필요 없습니다. 그냥 페이지를 열고 시작하세요." },
    ],
  },
  "images-to-pdf": {
    title: "이미지 PDF 변환 — 자주 묻는 질문",
    items: [
      { q: "이미지를 PDF로 어떻게 변환하나요?", a: "이미지를 추가하고, 미리보기를 원하는 순서로 끌어다 놓은 뒤 「PDF로 변환」을 클릭하세요. 각 이미지가 위에서 아래로 한 페이지가 되어, 내려받을 수 있는 하나의 파일로 만들어집니다." },
      { q: "어떤 이미지 형식이 지원되나요?", a: "JPG, PNG, WebP, GIF, BMP입니다. HEIC(아이폰이 사진을 자주 저장하는 형식)는 아직 지원되지 않습니다 — 이를 먼저 JPG로 변환하거나 아이폰 카메라 설정을 「높은 호환성」으로 바꾸세요." },
      { q: "여러 이미지를 한 PDF로 합칠 수 있나요?", a: "네. 원하는 만큼 추가하고 끌어다 놓아 재배열하세요 — 정확히 그 순서대로 한 이미지당 한 페이지씩 하나의 PDF로 합쳐집니다." },
      { q: "제 이미지가 어딘가에 업로드되나요?", a: "아니요. 모든 작업이 브라우저 안에서 로컬로 실행됩니다 — PDF는 귀하의 기기에서 만들어지며, 이미지는 절대 서버로 전송되거나 어딘가에 저장되지 않습니다." },
      { q: "크기나 파일 개수 제한이 있나요?", a: "고정된 제한은 없습니다. 모든 작업이 귀하의 기기에서 이루어지므로 실질적 상한은 기기의 메모리입니다 — 매우 크거나 매우 많은 고해상도 이미지는 RAM이 적은 오래된 휴대폰이나 노트북을 느리게 할 수 있습니다." },
      { q: "무료인가요? 계정이 필요한가요?", a: "네, 완전 무료이며 가입도, 워터마크도, 필수 이메일도 없습니다. 그냥 페이지를 열고 시작하세요." },
    ],
  },
  "pdf-to-png": {
    title: "PDF PNG 변환 — 자주 묻는 질문",
    items: [
      { q: "PDF를 PNG로 어떻게 변환하나요?", a: "PDF를 끌어다 놓으면 각 페이지가 미리보기로 나타납니다. 페이지를 클릭해 포함하거나 제외하고(또는 「모두 선택」 / 「모두 해제」를 사용하고), PNG가 선택되어 있는지 확인한 뒤 「변환 후 내려받기」를 클릭하세요. 한 페이지는 하나의 PNG로 내려받고, 여러 페이지는 ZIP으로 묶입니다." },
      { q: "제 PDF가 어딘가에 업로드되나요?", a: "아니요. 모든 작업이 브라우저 안에서 실행됩니다 — PDF는 로컬에서 읽히고 PNG로 렌더링되며, 내려받기는 귀하의 기기에서 생성됩니다. 어떤 것도 서버로 전송되지 않으므로 파일이 기기를 절대 벗어나지 않습니다." },
      { q: "JPG 대신 PNG를 선택하는 이유는 무엇인가요?", a: "PNG는 무손실이므로 텍스트, 선화, 도표, 스크린샷을 압축 아티팩트 없이 선명하게 유지하고 투명도를 지원합니다. JPG 파일은 더 작고 사진에는 괜찮지만, 미세한 디테일을 뭉개고 투명할 수 없습니다." },
      { q: "파일이나 페이지 제한이 있나요?", a: "고정된 상한도, 가입도 없습니다. 모든 작업이 브라우저 안에서 처리되므로 실제 한계는 기기의 메모리입니다 — 매우 큰 PDF나 페이지가 아주 많은 PDF는 RAM을 더 쓰고 시간이 더 걸리며, 특히 휴대폰이나 오래된 기기에서 그렇습니다." },
      { q: "제 PDF를 열지 못합니다 — 무슨 문제인가요?", a: "가장 흔한 원인은 도구가 읽을 수 없는 암호로 보호되었거나 암호화된 PDF입니다. 먼저 암호를 제거한 뒤 다시 시도하세요. 출력물은 선명한 이미지를 위해 2배 배율로 렌더링되지만 그래도 이미지이므로 — 텍스트가 픽셀이 되어 이후에 선택하거나 검색할 수 없습니다." },
      { q: "PDF PNG 변환은 무료인가요?", a: "네 — 완전 무료이며 계정도, 워터마크도, 사용 횟수 제한도 없습니다." },
    ],
  },
  "pdf-to-image": {
    title: "PDF 이미지 변환 — 자주 묻는 질문",
    items: [
      { q: "PDF를 JPG나 PNG로 어떻게 변환하나요?", a: "PDF를 끌어다 놓으면 각 페이지가 미리보기로 나타납니다. 페이지를 클릭해 포함하거나 제외하고(또는 「모두 선택」 / 「모두 해제」를 사용하고), JPG 또는 PNG를 선택한 뒤 「변환 후 내려받기」를 클릭하세요. 한 페이지는 하나의 이미지로 내려받고, 여러 페이지는 ZIP으로 묶입니다." },
      { q: "제 PDF가 어딘가에 업로드되나요?", a: "아니요. 모든 작업이 브라우저 안에서 실행됩니다 — PDF는 로컬에서 읽히고 이미지로 렌더링되며, 내려받기는 귀하의 기기에서 생성됩니다. 어떤 것도 서버로 전송되지 않으므로 파일이 기기를 절대 벗어나지 않습니다." },
      { q: "JPG와 PNG 중 무엇을 선택해야 하나요?", a: "PNG는 무손실이므로 선명한 텍스트, 선화, 스크린샷에 가장 좋습니다. JPG 파일은 더 작고 사진과 스캔본에는 괜찮습니다. 한 가지 알아둘 점: JPG는 투명할 수 없으므로 페이지의 투명한 영역은 흰색 배경으로 처리됩니다." },
      { q: "파일이나 페이지 제한이 있나요?", a: "고정된 상한도, 가입도 없습니다. 모든 작업이 브라우저 안에서 처리되므로 실제 한계는 기기의 메모리입니다 — 매우 큰 PDF나 페이지가 아주 많은 PDF는 RAM을 더 쓰고 시간이 더 걸리며, 특히 휴대폰이나 오래된 기기에서 그렇습니다." },
      { q: "제 PDF를 열지 못합니다 — 무슨 문제인가요?", a: "가장 흔한 원인은 도구가 읽을 수 없는 암호로 보호되었거나 암호화된 PDF입니다. 먼저 암호를 제거한 뒤 다시 시도하세요. 출력물은 선명한 이미지를 위해 2배 배율로 렌더링되지만 그래도 이미지이므로 — 텍스트가 픽셀이 되어 이후에 선택하거나 검색할 수 없습니다." },
      { q: "무료인가요?", a: "네 — 완전 무료이며 계정도, 워터마크도, 사용 횟수 제한도 없습니다." },
    ],
  },
  "redact-pdf": {
    title: "PDF 마스킹 — 자주 묻는 질문",
    items: [
      { q: "PDF를 어떻게 마스킹하나요?", a: "PDF를 페이지에 끌어다 놓으면 DockDocs가 각 페이지를 브라우저 안에서 직접 렌더링합니다. 숨기려는 것 위로 상자를 끌어 그으세요 — 이름, 계좌번호, 서명. DockDocs는 또한 민감할 가능성이 높은 항목(이메일, 전화번호, 주민등록번호, 카드번호, IP 주소)을 자동으로 검색해 미리 표시합니다. 이 제안들을 검토하고 원하지 않는 각 상자의 ✕를 클릭하세요. 끝나면 「적용 후 내려받기」를 눌러 마스킹된 사본을 받으세요." },
      { q: "텍스트가 실제로 제거되나요, 아니면 검은 상자로 덮일 뿐인가요?", a: "실제로 제거됩니다. 많은 「마스킹」은 검은 사각형을 덮어두기만 합니다 — 원래 텍스트는 여전히 파일 안에 있어 누구나 복사하거나 상자를 지울 수 있습니다. DockDocs는 각 페이지를 검은 영역이 새겨진 평면 이미지로 다시 렌더링하므로 그 아래 텍스트가 파괴되어 영원히 사라집니다. 바로 그 점이 결과물을 안심하고 공유할 수 있게 만듭니다." },
      { q: "제 파일이 어딘가에 업로드되나요?", a: "아니요. 모든 작업이 귀하 기기의 브라우저 안에서 실행됩니다 — PDF 열기, 상자 그리기, 마스킹된 사본 생성이 모두 로컬에서 이루어집니다. 파일은 절대 서버로 전송되지 않고 컴퓨터를 벗어나지 않으므로 기밀이거나 규제 대상인 문서에 적합합니다." },
      { q: "제한이 있나요? 무료인가요?", a: "완전 무료이며 계정, 이메일, 설치가 필요 없습니다. 고정된 파일 크기 상한은 없지만 매우 큰 PDF는 기기의 메모리에 달려 있습니다. 한 가지 엄격한 제한은 페이지 수입니다: 한 문서는 최대 30페이지까지 가능하며 — 더 길면 먼저 분할한 뒤 각 부분을 마스킹하세요." },
      { q: "출력 파일은 어떤 모습인가요?", a: "각 페이지가 평면화된 이미지(약 158 DPI — 깔끔하고 읽기 좋습니다)인 새 PDF를 받습니다. 이제 페이지가 이미지이므로 마스킹된 내용은 영구적으로 사라지고, 남은 텍스트는 더 이상 선택하거나 검색할 수 없습니다. 이 절충이 바로 핵심입니다: 선택할 수 없는 텍스트는 복원할 수 없는 텍스트입니다." },
      { q: "자동으로 감지된 상자만 믿어도 되나요?", a: "보장이 아니라 앞선 출발로 다루세요. 자동 검색은 이메일과 번호 같은 흔한 패턴을 잡아내지만, 특이한 형식으로 쓰인 것은 놓칠 수 있고 귀하만 알아볼 수 있는 맥락상의 비밀은 알지 못합니다. 항상 페이지를 직접 읽고, 내려받기 전에 감지기가 표시하지 않은 모든 것 위로 상자를 그으세요." },
    ],
  },
  "translate-pdf": {
    title: "PDF 번역 — 자주 묻는 질문",
    items: [
      { q: "PDF를 어떻게 번역하나요?", a: "PDF를 업로드하고, 목록에서 대상 언어를 선택한 뒤 「번역」을 클릭하세요. 파일에서 텍스트를 뽑아내 AI가 번역하며, 그런 다음 복사하거나 .txt 파일로 내려받을 수 있습니다." },
      { q: "제 파일이 업로드되나요? 비공개인가요?", a: "PDF는 브라우저 안에서 직접 읽힙니다 — 파일 자체는 기기를 절대 벗어나지 않습니다. 거기서 추출된 순수 텍스트만 번역을 위해 AI로 전송됩니다. 원본 문서, 서식, 이미지는 절대 업로드되지 않습니다." },
      { q: "크기 제한이 있나요?", a: "네 — 실행당 약 14,000자, 대략 10페이지입니다. 문서가 더 길면 더 작은 조각으로 나누어 차례로 번역하세요." },
      { q: "어떤 언어로 번역할 수 있나요?", a: "영어, 중국어 간체와 번체, 스페인어, 프랑스어, 독일어, 일본어, 한국어, 포르투갈어, 이탈리아어, 러시아어, 아랍어, 힌디어 등 18개 이상입니다. 도구가 원본 언어를 자동으로 감지하므로 대상만 선택하면 됩니다." },
      { q: "원래 레이아웃이 유지되나요? 무엇을 받게 되나요?", a: "아직은 아닙니다 — 이 버전은 텍스트 내용만 번역해 복사하거나 내려받을 번역 텍스트를 제공합니다. PDF를 다시 구성하는 레이아웃 보존 번역은 로드맵에 있습니다. 또한 유의하세요: PDF가 선택 가능한 텍스트가 없는 스캔본이나 이미지라면 추출할 것이 없으니 — 먼저 OCR을 실행하세요." },
      { q: "무료인가요? 법률 문서에 의존해도 되나요?", a: "네, 사용은 무료입니다. AI 번역은 문서를 이해하고 든든한 초안을 얻는 데 훌륭하지만 공인 번역이 아니므로 — 법적, 공식, 또는 인증 용도로는 자격을 갖춘 사람이 검토하거나 번역하게 하세요." },
    ],
  },
  "extract-to-excel": {
    title: "PDF 데이터 스프레드시트 추출 — 자주 묻는 질문",
    items: [
      { q: "PDF에서 데이터를 스프레드시트로 어떻게 추출하나요?", a: "청구서, 견적서, 계약서를 끌어다 놓고(또는 폴더 전체를 선택해 일괄 처리하고), 문서 유형을 선택한 뒤 「추출」을 클릭하세요. AI가 핵심 필드 — 합계, 날짜, 계약 당사자, 조건 — 를 표로 뽑아내며, 이를 Excel, Google Sheets, Numbers에서 열 수 있는 CSV로 내려받을 수 있습니다. 무료입니다." },
      { q: "제 파일이 서버에 업로드되나요?", a: "PDF 자체는 기기를 절대 벗어나지 않습니다 — 브라우저 안에서 직접 읽힙니다. 거기서 뽑아낸 순수 텍스트만 열로 정리하기 위해 AI로 전송되며, 레이아웃과 모든 이미지가 담긴 원본 파일은 로컬에 남습니다. 민감한 계약서에서 이 텍스트 전송 단계가 받아들이기 어려운 점이라면, 미리 알아둘 가치가 있습니다." },
      { q: "숫자가 맞는지 어떻게 아나요?", a: "각 값에는 원본 문서에서 그것이 나온 정확한 문장이 함께 표시되므로 한눈에 표본 점검할 수 있습니다. AI가 어떤 필드를 명확히 찾을 수 없으면 추측하는 대신 셀을 비워 두며 — 그리고 실제로 귀하의 파일에 나타나지 않는 출처 인용문은 모두 폐기하므로 어떤 것도 지어내지 않습니다." },
      { q: "제한은 무엇인가요?", a: "한 번에 최대 8개 문서이며, 합산 텍스트는 약 60,000자로 제한됩니다 — 대략 일반 청구서 한 묶음이지 200페이지짜리 기본 계약서가 아닙니다. 큰 묶음은 여러 번에 나누어 처리하세요." },
      { q: "아무것도 추출되지 않았습니다 — 무슨 일이 있었나요?", a: "거의 항상 스캔하거나 촬영한 PDF입니다. 일반 PDF 리더에서 텍스트를 선택할 수 없다면 브라우저가 읽을 것이 없고 AI는 빈 페이지를 받습니다. 이런 파일은 먼저 OCR을 거치세요. 암호로 보호된 PDF도 잠금을 해제하기 전에는 읽을 수 없습니다." },
      { q: "어떤 문서가 가장 잘 작동하나요?", a: "일관된 필드를 가진 구조화된 자료 — 청구서, 견적서, 계약서 — 로서 미리 정해진 각 필드(공급업체, 합계, 만기일, 결제 조건 등)가 실제로 문서 어딘가에 인쇄되어 있는 것입니다. 자유 형식의 편지나 특이한 레이아웃은 더 많은 셀을 비워 둡니다." },
    ],
  },
  "redline": {
    title: "PDF 버전 비교(레드라인) — 자주 묻는 질문",
    items: [
      { q: "두 PDF 버전을 어떻게 비교하나요?", a: "원본(v1)과 수정본(v2) PDF를 업로드한 뒤 「버전 비교」를 클릭하세요. DockDocs가 텍스트를 정렬하고 하나의 표시된 화면을 보여줍니다 — 추가된 텍스트는 초록색으로 강조되고, 제거된 텍스트는 빨간색 취소선으로 표시되어 변경 내용 추적과 같습니다." },
      { q: "제 파일이 어딘가에 업로드되나요?", a: "아니요. 이것은 클라이언트 측 도구입니다: 텍스트는 전적으로 브라우저 안에서 추출되고 비교되므로 파일이 기기를 절대 벗어나지 않습니다. 어떤 것도 서버로 전송되지 않습니다." },
      { q: "다시 쓴 문장을 감지하나요?", a: "문장 단위로 비교하므로 어떤 문장이 추가되고 제거되었는지 표시합니다. 작은 재서술은 문장 안의 단어 단위 변경이 아니라 하나의 삭제와 하나의 추가로 나타납니다." },
      { q: "실제로 무엇을 비교하나요 — 서식이나 이미지를 확인하나요?", a: "추출된 텍스트만입니다. 글꼴, 레이아웃, 색상, 이미지, 표는 비교 대상이 아니며, 실제 텍스트 레이어가 없는 스캔한 PDF는 쓸 만한 결과를 내지 못합니다. 텍스트 변경이 보고되지 않으면 겉모습이 바뀌었더라도 문구는 동일합니다." },
      { q: "문서가 얼마나 클 수 있나요?", a: "전체 비교가 브라우저 안에서 실행되므로 최대 수천 문장까지의 문서를 대상으로 설계되었습니다(파일당 2,500 문장으로 제한됩니다). 매우 긴 계약서나 책은 잘리거나 느리게 실행될 수 있습니다." },
      { q: "무료인가요?", a: "네 — 버전 비교는 완전 무료이며 가입도, 비교 횟수 제한도 없습니다." },
    ],
  },
};

// Resolve the SAME FAQ Q&A items that ToolFaqInner renders for a (tool, locale),
// so FAQPage JSON-LD can reuse the exact visible copy (single source of truth).
// Returns null when the tool has no FAQ for that locale (→ emit no FAQPage).
export function getToolFaqItems(tool: string, locale: Locale = "en"): QA[] | null {
  if (locale === "pt") return FAQS_PT[tool]?.items ?? null;
  if (locale === "fr") return FAQS_FR[tool]?.items ?? null;
  if (locale === "ja") return FAQS_JA[tool]?.items ?? null;
  if (locale === "de") return FAQS_DE[tool]?.items ?? null;
  if (locale === "ko") return FAQS_KO[tool]?.items ?? null;
  const data = FAQS[tool];
  if (!data) return null;
  if (locale === "zh-Hant") return deepHant(data.items.zh);
  // Exhaustive over the remaining authored locales. A NEW route locale that has no
  // FAQ behavior decided will fail the `never` assignment here at compile time,
  // forcing the author to choose rather than silently inheriting en.
  switch (locale) {
    case "en":
    case "zh":
    case "es":
      return data.items[locale] ?? data.items.en;
    default: {
      const _exhaustive: never = locale;
      return _exhaustive;
    }
  }
}

export function ToolFaq(props: { tool: string; locale?: Locale }) {
  // Verifiable-trust block for pure-client tools (file never uploaded) — rendered
  // as a sibling BELOW the FAQ (aligns with the template path, which also renders
  // it after the FAQ, and avoids a double border-t divider stacking against the
  // FAQ section). Still shows when a locale has no FAQ data (ToolFaqInner returns
  // null) — it's an independent sibling. Gated on LOCAL_ONLY_SLUGS so it NEVER
  // appears on a server/AI tool.
  return (
    <>
      <ToolFaqInner {...props} />
      {LOCAL_ONLY_SLUGS.has(props.tool) ? <VerifyClientSide locale={props.locale ?? "en"} divider={false} /> : null}
    </>
  );
}

// Variant tools (pdf-to-png / pdf-to-jpg) carry their own FAQ where it exists,
// but fall back to the generic image FAQ for any locale that lacks variant copy —
// so a non-English page never renders an empty FAQ or English fallback text.
const FAQ_FALLBACK: Record<string, string> = {
  "pdf-to-png": "pdf-to-image",
  "pdf-to-jpg": "pdf-to-image",
};

// Single source of truth for FAQ JSON-LD: returns the EXACT items rendered as the
// visible FAQ by <ToolFaq> for this tool+locale, mapped to {question,answer} for
// FAQPage structured data. Returns null when this locale has no FAQ copy for the
// tool (no fallback row exists), so callers can fall back to their own config.faq
// — guaranteeing JSON-LD FAQ never disappears and never mixes English into a
// non-English page. Mirrors ToolFaqInner's resolution one-for-one.
export function getFaqItems(
  tool: string,
  locale: Locale = "en",
): { question: string; answer: string }[] | null {
  let items: QA[] | undefined;
  if (locale === "pt") {
    items = (FAQS_PT[tool] ?? FAQS_PT[FAQ_FALLBACK[tool]])?.items;
  } else if (locale === "fr") {
    items = (FAQS_FR[tool] ?? FAQS_FR[FAQ_FALLBACK[tool]])?.items;
  } else if (locale === "ja") {
    items = (FAQS_JA[tool] ?? FAQS_JA[FAQ_FALLBACK[tool]])?.items;
  } else if (locale === "de") {
    items = (FAQS_DE[tool] ?? FAQS_DE[FAQ_FALLBACK[tool]])?.items;
  } else if (locale === "ko") {
    items = (FAQS_KO[tool] ?? FAQS_KO[FAQ_FALLBACK[tool]])?.items;
  } else {
    const data = FAQS[tool] ?? FAQS[FAQ_FALLBACK[tool]];
    if (data) {
      if (locale === "zh-Hant") {
        items = deepHant(data.items.zh);
      } else {
        // Exhaustive over the remaining authored locales — a NEW route locale
        // without a decided FAQ behavior fails the `never` assignment at compile
        // time instead of silently falling through to English.
        switch (locale) {
          case "en":
          case "zh":
          case "es":
            items = data.items[locale] ?? data.items.en;
            break;
          default: {
            const _exhaustive: never = locale;
            items = _exhaustive;
          }
        }
      }
    }
  }
  if (!items) return null;
  return items.map((it) => ({ question: it.q, answer: it.a }));
}

function ToolFaqInner({ tool, locale = "en" }: { tool: string; locale?: Locale }) {
  if (locale === "pt") {
    const ptData = FAQS_PT[tool] ?? FAQS_PT[FAQ_FALLBACK[tool]];
    if (!ptData) return null;
    return (
      <section className="mx-auto mt-12 border-t border-[color:var(--line)] pt-10">
        <h2 className="text-[22px] font-normal tracking-[-0.02em] text-[color:var(--foreground)] sm:text-[26px]">{ptData.title}</h2>
        <div className="mt-6 space-y-6">
          {ptData.items.map((it) => (
            <div key={it.q}>
              <h3 className="text-[15px] font-medium text-[color:var(--foreground)]">{it.q}</h3>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{it.a}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }
  if (locale === "fr") {
    const frData = FAQS_FR[tool] ?? FAQS_FR[FAQ_FALLBACK[tool]];
    if (!frData) return null;
    return (
      <section className="mx-auto mt-12 border-t border-[color:var(--line)] pt-10">
        <h2 className="text-[22px] font-normal tracking-[-0.02em] text-[color:var(--foreground)] sm:text-[26px]">{frData.title}</h2>
        <div className="mt-6 space-y-6">
          {frData.items.map((it) => (
            <div key={it.q}>
              <h3 className="text-[15px] font-medium text-[color:var(--foreground)]">{it.q}</h3>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{it.a}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }
  if (locale === "ja") {
    const jaData = FAQS_JA[tool] ?? FAQS_JA[FAQ_FALLBACK[tool]];
    if (!jaData) return null;
    return (
      <section className="mx-auto mt-12 border-t border-[color:var(--line)] pt-10">
        <h2 className="text-[22px] font-normal tracking-[-0.02em] text-[color:var(--foreground)] sm:text-[26px]">{jaData.title}</h2>
        <div className="mt-6 space-y-6">
          {jaData.items.map((it) => (
            <div key={it.q}>
              <h3 className="text-[15px] font-medium text-[color:var(--foreground)]">{it.q}</h3>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{it.a}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }
  if (locale === "de") {
    const deData = FAQS_DE[tool] ?? FAQS_DE[FAQ_FALLBACK[tool]];
    if (!deData) return null;
    return (
      <section className="mx-auto mt-12 border-t border-[color:var(--line)] pt-10">
        <h2 className="text-[22px] font-normal tracking-[-0.02em] text-[color:var(--foreground)] sm:text-[26px]">{deData.title}</h2>
        <div className="mt-6 space-y-6">
          {deData.items.map((it) => (
            <div key={it.q}>
              <h3 className="text-[15px] font-medium text-[color:var(--foreground)]">{it.q}</h3>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{it.a}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }
  if (locale === "ko") {
    const koData = FAQS_KO[tool] ?? FAQS_KO[FAQ_FALLBACK[tool]];
    if (!koData) return null;
    return (
      <section className="mx-auto mt-12 border-t border-[color:var(--line)] pt-10">
        <h2 className="text-[22px] font-normal tracking-[-0.02em] text-[color:var(--foreground)] sm:text-[26px]">{koData.title}</h2>
        <div className="mt-6 space-y-6">
          {koData.items.map((it) => (
            <div key={it.q}>
              <h3 className="text-[15px] font-medium text-[color:var(--foreground)]">{it.q}</h3>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{it.a}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }
  const data = FAQS[tool] ?? FAQS[FAQ_FALLBACK[tool]];
  if (!data) return null;
  // zh-Hant derives from the zh FAQ data via OpenCC.
  let items: QA[];
  let title: string;
  if (locale === "zh-Hant") {
    items = deepHant(data.items.zh);
    title = toHant(data.title.zh);
  } else {
    // Exhaustive over the remaining authored locales: a NEW route locale that
    // hasn't had its FAQ rendering decided fails the `never` assignment at compile
    // time rather than silently rendering English here.
    switch (locale) {
      case "en":
      case "zh":
      case "es":
        items = data.items[locale] ?? data.items.en;
        title = data.title[locale] ?? data.title.en;
        break;
      default: {
        const _exhaustive: never = locale;
        return _exhaustive;
      }
    }
  }
  return (
    <section className="mx-auto mt-12 border-t border-[color:var(--line)] pt-10">
      <h2 className="text-[22px] font-normal tracking-[-0.02em] text-[color:var(--foreground)] sm:text-[26px]">{title}</h2>
      <div className="mt-6 space-y-6">
        {items.map((it) => (
          <div key={it.q}>
            <h3 className="text-[15px] font-medium text-[color:var(--foreground)]">{it.q}</h3>
            <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{it.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
