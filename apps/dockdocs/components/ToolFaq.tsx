type Locale = "en" | "zh" | "es" | "pt" | "fr";
type QA = { q: string; a: string };

// FAQ content for the custom-client tools (which don't use the PdfToolPage template).
const FAQS: Record<string, { title: { en: string; zh: string; es: string }; items: { en: QA[]; zh: QA[]; es: QA[] } }> = {
  "contract-risk": {
    title: { en: "Contract Risk Check — FAQ", zh: "合同风险体检常见问题", es: "Revisión de riesgos del contrato — preguntas frecuentes" },
    items: {
      en: [
        { q: "What does it check for?", a: "It scans your contract for clauses worth a second look — auto-renewal, one-sided termination or change, uncapped/unlimited liability, penalties and late fees, payment traps and hidden costs, overbroad non-compete, and missing standard protections (like no liability cap). Each finding is flagged red (high), amber (medium), or green (low), quoted from your contract, with a plain-language reason and what to ask before signing." },
        { q: "Is this legal advice?", a: "No. It's an automated review to help a non-lawyer spot clauses that deserve attention — it is not legal advice and not a substitute for a lawyer. For anything important or high-value, have a qualified attorney review it. Flagging nothing is not a guarantee the contract is safe." },
        { q: "Does it make up clauses or quotes?", a: "Every quote is verified against your actual contract text — if the AI returns a quote we can't find in your document, we drop it rather than show a fabricated citation. Missing-clause risks are shown without a quote and labelled as such. The AI can still miss things, so always read the full contract." },
        { q: "Is my contract uploaded or stored?", a: "Your contract is read in your browser; only the extracted text is sent for analysis, and it is not stored afterwards. The file itself never leaves your device." },
        { q: "Which contracts work best?", a: "Text-based PDFs (born-digital). Scanned contracts have no selectable text — run OCR first. It works in English, Chinese, Spanish and more; quotes stay in the contract's original language." },
      ],
      zh: [
        { q: "它检查哪些东西?", a: "它会扫描合同里值得多看一眼的条款——自动续约、单方解约或单方变更、无上限/无限责任、违约金和滞纳金、付款陷阱和隐藏费用、过宽的竞业限制,以及缺失的标准保护(比如没有责任上限)。每条都标成 红(高)/黄(中)/绿(低),引用你合同的原文,配白话理由和签字前该问什么。" },
        { q: "这是法律意见吗?", a: "不是。这是帮非律师发现值得注意条款的自动审查,不构成法律意见,也不能替代律师。重要或金额大的合同,请让有资质的律师审。没标出问题不代表合同一定安全。" },
        { q: "它会编造条款或原文吗?", a: "每一条原文引用都会和你的合同实际文字核对——如果 AI 给出的引用在你文档里找不到,我们会丢弃它,而不是显示伪造的出处。缺失类风险不带引用并明确标注。AI 仍可能漏看,所以请完整阅读合同。" },
        { q: "我的合同会被上传或保存吗?", a: "合同在你的浏览器中读取,只有提取的文字会被发送去分析,且事后不保存。文件本身不离开你的设备。" },
        { q: "哪类合同效果最好?", a: "文字版 PDF(电子原生)。扫描件没有可选文字,请先做 OCR。支持中文、英文、西班牙语等;原文引用保持合同的原始语言。" },
      ],
      es: [
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
  "batch-fix-scans": {
    title: { en: "Batch fix scans — FAQ", zh: "批量修扫描常见问题", es: "Arreglar escaneos por lotes — preguntas frecuentes" },
    items: {
      en: [
        { q: "What can Batch Fix Scans do?", a: "Two clean-up jobs across a whole folder of PDFs at once. Crop margins trims the same edges off every page of every file (great for removing black scan borders or binding margins). Delete pages removes the same page numbers from each file (great for stripping a cover sheet or separator page). Pick one mode, set it once, and it applies to the whole batch." },
        { q: "How does cropping work?", a: "Use the sliders to trim each edge as a percentage of the page; the preview shows the first file with the trimmed area shaded. The same crop is applied to every page of every file in the batch. Cropping uses the PDF crop box, so the trimmed area is hidden, not destroyed — it can be restored later." },
        { q: "How does delete pages work?", a: "Enter the page numbers to remove from each file, like 1 for a cover or 1,3-4 for several. Those pages are deleted from every file in the batch. If a file would lose all its pages, it is skipped and flagged so you don't get an empty document." },
        { q: "Is there a limit, and are my files uploaded?", a: "Up to 30 files per batch. Everything runs entirely in your browser — your files are never uploaded, which makes this safe for confidential scans. You get them all back in a single ZIP." },
        { q: "Is it free?", a: "Yes, completely free — no account, no watermark, no daily limit." },
      ],
      zh: [
        { q: "批量修扫描能做什么？", a: "一次对整个文件夹的 PDF 做两类清理：「裁剪页边」给每个文件的每一页裁掉相同的边（适合去掉扫描黑边或装订线），「删除页面」从每个文件删掉相同的页码（适合去掉封面或分隔页）。选一种模式，设一次，应用到整批。" },
        { q: "裁剪是怎么工作的？", a: "用滑块按页面百分比裁掉每一边；预览显示第一个文件、被裁区域加阴影。同样的裁剪会应用到整批每个文件的每一页。裁剪使用 PDF 裁剪框，所以被裁区域是隐藏而非销毁——以后可以还原。" },
        { q: "删除页面怎么用？", a: "输入要从每个文件删除的页码，如 1 删封面，或 1,3-4 删多页。这些页会从整批每个文件中删除。如果某个文件会被删空，它会被跳过并标注，避免得到空文档。" },
        { q: "有限制吗？文件会被上传吗？", a: "每批最多 30 个文件。全部在你的浏览器中完成——文件绝不上传，所以处理机密扫描件也安全。最后打包成一个 ZIP 拿回。" },
        { q: "免费吗？", a: "完全免费——无需注册、没有水印、也没有每日次数限制。" },
      ],
      es: [
        { q: "¿Qué puede hacer Arreglar escaneos por lotes?", a: "Dos tareas de limpieza sobre una carpeta entera de PDF a la vez. Recortar márgenes recorta los mismos bordes de cada página de cada archivo (ideal para quitar bordes negros de escaneo o márgenes de encuadernación). Eliminar páginas quita los mismos números de página de cada archivo (ideal para quitar una portada o página separadora). Elige un modo, configúralo una vez y se aplica a todo el lote." },
        { q: "¿Cómo funciona el recorte?", a: "Usa los controles para recortar cada borde como porcentaje de la página; la vista previa muestra el primer archivo con el área recortada sombreada. El mismo recorte se aplica a cada página de cada archivo del lote. El recorte usa el cuadro de recorte del PDF, así que el área recortada se oculta, no se destruye, y puede restaurarse después." },
        { q: "¿Cómo funciona eliminar páginas?", a: "Introduce los números de página a quitar de cada archivo, como 1 para una portada o 1,3-4 para varias. Esas páginas se eliminan de cada archivo del lote. Si un archivo perdería todas sus páginas, se omite y se marca para que no obtengas un documento vacío." },
        { q: "¿Hay un límite y se suben mis archivos?", a: "Hasta 30 archivos por lote. Todo se ejecuta enteramente en tu navegador; tus archivos nunca se suben, lo que lo hace seguro para escaneos confidenciales. Los recibes todos en un solo ZIP." },
        { q: "¿Es gratis?", a: "Sí, completamente gratis: sin cuenta, sin marca de agua, sin límite diario." },
      ],
    },
  },
  "batch-translate": {
    title: { en: "Batch translate PDFs — FAQ", zh: "批量翻译 PDF 常见问题", es: "Traducir PDF por lotes — preguntas frecuentes" },
    items: {
      en: [
        { q: "How do I translate several PDFs at once?", a: "Drop your PDFs onto the page — or a whole folder — pick the target language, then click Translate all. Each PDF is read in your browser, its text is translated one by one, and you download them all as a single ZIP of .txt files." },
        { q: "Which languages can I translate to?", a: "13 languages including English, Simplified and Traditional Chinese, Spanish, French, German, Japanese, Korean, Portuguese, Italian, Russian, Arabic, and Hindi. The whole batch is translated into the one language you pick." },
        { q: "What do I get back — does it keep the layout?", a: "You get plain text (.txt), one file per PDF, zipped together. The translation is text-only, so the original layout, images, and formatting are not preserved. It's best for reading and reusing the content, not for producing a formatted copy." },
        { q: "Is there a limit, and what about scanned PDFs?", a: "Up to 10 PDFs per batch, each up to about 10 pages (14,000 characters) of text. Scanned PDFs have no selectable text, so run OCR on them first; otherwise they're skipped with a note." },
        { q: "Is it private and free?", a: "Each PDF is read in your browser and only the extracted text — never the file — is sent for translation. It's free; translation counts toward your daily AI usage limit, which resets each day." },
      ],
      zh: [
        { q: "怎么一次翻译多个 PDF？", a: "把 PDF 拖到页面上——也可以整个文件夹——选目标语言，再点「全部翻译」。每份 PDF 在浏览器中读取，文字逐个翻译，最后打包成一个 .txt 文件的 ZIP 下载。" },
        { q: "可以翻译成哪些语言？", a: "13 种语言，包括英语、简体和繁体中文、西班牙语、法语、德语、日语、韩语、葡萄牙语、意大利语、俄语、阿拉伯语和印地语。整批都会翻译成你选的那一种语言。" },
        { q: "我拿回什么？保留版式吗？", a: "你拿回纯文本(.txt)，每份 PDF 一个文件，一起打包。翻译只含文字，所以原始版式、图片和格式都不保留。适合阅读和再利用内容，不适合产出带格式的副本。" },
        { q: "有限制吗？扫描件怎么办？", a: "每批最多 10 份 PDF，每份约 10 页(1.4 万字符)以内的文字。扫描件没有可选文字，请先做 OCR，否则会被跳过并标注。" },
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
  "batch-compress": {
    title: { en: "Batch compress PDF — FAQ", zh: "批量 PDF 压缩常见问题", es: "Comprimir PDF por lotes — preguntas frecuentes" },
    items: {
      en: [
        { q: "How do I compress several PDFs at once?", a: "Drag your PDFs onto the page — or drop a whole folder, or use \"Choose folder\" — and any non-PDF files in that folder are filtered out automatically. Pick a compression strength (\"Light\", \"Recommended\", or \"Strong\"), then click \"Compress all\". Each file is processed one by one, and when it finishes you click \"Download ZIP\" to get them all back in a single archive." },
        { q: "Are my files uploaded to a server?", a: "No. This is a 100% client-side tool: every PDF is read and compressed right inside your browser, and nothing is ever sent to any server. Your files never leave your device, which is also why you can use it on confidential documents without worry." },
        { q: "What do I get back, and how are the files named?", a: "You get a single ZIP file (dockdocs-compressed.zip). Inside it, each PDF keeps its original name with \"-compressed\" added before the extension — so report.pdf becomes report-compressed.pdf. Each row also shows how much that file shrank, and the download button shows the overall size reduction." },
        { q: "Is there a limit on how many files or how large they can be?", a: "You can add up to 30 PDFs per batch. There's no fixed per-file size cap — because everything runs in your browser, the real limit is your device's memory. Big or numerous files still work, they just take longer to process on a weaker machine." },
        { q: "Why didn't my PDF shrink much?", a: "Compression works by rendering each page to an image, which is great for scans and image-heavy PDFs but does little for files that are mostly plain text — there's simply not much to squeeze out. If a file barely changes, that's expected; try \"Strong\" for a bit more, but text-only PDFs are already close to their minimum size." },
        { q: "Is it free? Do I need an account?", a: "Yes, it's completely free — no signup, no watermark, no daily limit. Just open the page and start compressing." },
      ],
      zh: [
        { q: "怎么一次压缩多个 PDF？", a: "把多个 PDF 拖到页面上——也可以直接拖入整个文件夹，或点「选择文件夹」——文件夹里的非 PDF 文件会被自动过滤掉。选择压缩强度（「轻度」「推荐」或「强力」），再点「全部压缩」。每个文件会逐个处理，完成后点「下载 ZIP」，就能把它们打包成一个压缩包一起拿回。" },
        { q: "我的文件会被上传到服务器吗？", a: "不会。这是一个 100% 在本地运行的工具——每个 PDF 都在你的浏览器里读取和压缩，不会发送到任何服务器。文件始终不离开你的设备，所以处理机密文档也可以放心使用。" },
        { q: "我拿回的是什么格式？文件怎么命名？", a: "你拿回的是一个 ZIP 压缩包（dockdocs-compressed.zip）。里面每个 PDF 保留原文件名，并在扩展名前加上「-compressed」——比如 report.pdf 会变成 report-compressed.pdf。每一行还会显示该文件减小了多少，下载按钮上则显示整体的压缩比例。" },
        { q: "对文件数量或大小有限制吗？", a: "每批最多可以添加 30 份 PDF。单个文件没有固定的大小上限——因为全部在浏览器里完成，真正的上限是你设备的内存。文件很大或很多依然可以处理，只是在配置较弱的机器上会慢一些。" },
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
        { q: "Are there rules for the password or limits on how many files?", a: "The password must be 4–32 characters using only letters, digits, and the underscore (_) — that keeps it safe to apply across every PDF reader. You can encrypt up to 30 files per batch; for more, just run the tool again. There's no hard size limit, but because everything runs in your browser, very large jobs go slower on low-memory devices." },
        { q: "What happens to a PDF that's already password-protected?", a: "It's skipped. The tool can't re-lock a file it can't open, so any PDF that already has a password is left out of the ZIP rather than failing the whole batch. Decrypt it first (with the original password) if you want to re-encrypt it here." },
        { q: "Is it really free? Any watermark or sign-up?", a: "Yes, completely free with no sign-up and no watermark. The encrypted PDFs are byte-for-byte your originals plus the password — DockDocs adds nothing to them." },
      ],
      zh: [
        { q: "怎么一次给多个 PDF 加密？", a: "把 PDF 拖进上传框——也可以直接拖入整个文件夹，或点击选择文件。在「密码」框里输入一个密码，然后点「全部加密」。所有文件都会用这同一个密码上锁，最后你会得到一个 ZIP，每份文件都被重命名为「…-protected.pdf」。" },
        { q: "我的文件会被上传到服务器吗？", a: "不会。这是一个 100% 在本地运行的工具——每份 PDF 都在你的浏览器里加密，任何文件都不会离开你的设备。没有上传、不用注册、也不会在任何地方留副本。页面加载完成后，你甚至可以断网使用。" },
        { q: "加密完我会拿到什么？什么格式？", a: "你会得到一个名为「dockdocs-protected.zip」的压缩包。里面每份原 PDF 都是一份独立的加密文件，文件名带「-protected.pdf」后缀。打开其中任意一份时，阅读器都会要求输入你设的密码。" },
        { q: "密码有规则吗？文件数量有上限吗？", a: "密码必须是 4–32 位，且只能用字母、数字和下划线(_)——这样才能保证在各种 PDF 阅读器里都通用。每批最多加密 30 份文件，要更多就再运行一次即可。没有硬性大小限制，但由于全部在浏览器里完成，文件特别多或特别大时——在内存较小的设备上会慢一些。" },
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
  "batch-rename-pdf": {
    title: { en: "Batch rename PDF — FAQ", zh: "批量 PDF 改名常见问题", es: "Renombrar PDF por lotes — preguntas frecuentes" },
    items: {
      en: [
        { q: "How do I rename a batch of PDFs?", a: "Drag a whole folder (or a set of PDFs) onto the upload box, or click to choose files. Then pick a mode: \"Numbered\" gives every file a base name plus a sequence number (invoice-01.pdf, invoice-02.pdf…), and \"Find & replace\" swaps any text that appears in the existing filenames. A live preview shows each old name struck through next to its new name, so you can check the result before you commit. When it looks right, click \"Download renamed ZIP\"." },
        { q: "Are my files uploaded anywhere?", a: "No. This tool is 100% client-side — every file is read and renamed inside your own browser, and nothing is ever sent to a server. There is no upload step at all; the renaming and the ZIP are built locally on your device. That is also why it is free, with no signup, no watermark, and no account to create." },
        { q: "What do I get back, and are the PDFs modified?", a: "You get a single ZIP file (dockdocs-renamed.zip) containing copies of your PDFs with the new filenames. Renaming changes the filenames only — the PDF contents, pages, and quality are left completely untouched. The original files on your computer are not altered either; you just download a freshly named set." },
        { q: "Is there a limit on how many files I can rename?", a: "Yes — this tool handles up to 100 PDFs per batch. Because everything runs in your browser, very large batches use more memory and take a little longer on weaker machines, but well within the 100-file limit it is fast. If you have more than 100 files, just run a second batch." },
        { q: "Can I drop a folder that has non-PDF files in it?", a: "Yes. You can drop an entire folder, and the tool automatically filters out anything that is not a PDF — images, spreadsheets, and other documents are ignored, so only your PDFs are added to the list. You do not need to clean up the folder first." },
        { q: "What happens if two files would end up with the same name?", a: "The tool catches that automatically. If a numbered pattern or find-and-replace would produce two identical filenames, it adds a -1, -2 (and so on) suffix to the later ones so every file in the ZIP keeps a unique name. Nothing gets silently overwritten or lost." },
      ],
      zh: [
        { q: "怎么批量给 PDF 改名？", a: "把整个文件夹（或一批 PDF）拖到上传框里，或点击选择文件。然后选一种模式：「编号」会给每个文件一个基础名加上序号（invoice-01.pdf、invoice-02.pdf……），「查找替换」则替换原文件名里出现的任意文字。预览区会把每个旧名字（带删除线）和它的新名字并排显示，你可以在确认前先核对结果。看起来没问题后，点击「下载改名后的 ZIP」即可。" },
        { q: "我的文件会被上传到哪里吗？", a: "不会。本工具 100% 在本地运行——每个文件都在你自己的浏览器里读取和改名，绝不会发送到任何服务器。整个过程根本没有上传这一步；改名和打包 ZIP 都在你的设备上本地完成。这也是为什么它免费——无需注册、无水印，也不用创建账号。" },
        { q: "我拿回来的是什么？PDF 内容会被改动吗？", a: "你会得到一个 ZIP 文件（dockdocs-renamed.zip），里面是用新文件名打包好的 PDF 副本。重命名只改文件名——PDF 的内容、页面和清晰度完全不变。你电脑上的原始文件也不会被改动，你只是下载了一套重新命名的文件。" },
        { q: "能改名的文件数量有上限吗？", a: "有——本工具每批最多处理 100 份 PDF。因为全部在浏览器里运行，超大批次会占用更多内存，在配置较弱的机器上会稍慢一些，但在 100 份以内速度很快。如果文件超过 100 份，再跑一批即可。" },
        { q: "文件夹里混有非 PDF 文件可以直接拖进来吗？", a: "可以。你能直接拖入整个文件夹，工具会自动过滤掉所有非 PDF 的文件——图片、表格和其他文档都会被忽略，只有 PDF 才会被加入列表。你不需要事先清理文件夹。" },
        { q: "如果两个文件改名后重名了会怎样？", a: "工具会自动处理。如果编号模板或查找替换会产生两个相同的文件名，它会给靠后的那些加上 -1、-2（以此类推）的后缀，保证 ZIP 里每个文件名都唯一。不会有任何文件被悄悄覆盖或丢失。" },
      ],
      es: [
        { q: "¿Cómo renombro un lote de PDF?", a: "Arrastra una carpeta entera (o un conjunto de PDF) a la casilla de carga, o haz clic para elegir archivos. Luego elige un modo: «Numerado» da a cada archivo un nombre base más un número de secuencia (factura-01.pdf, factura-02.pdf…), y «Buscar y reemplazar» sustituye cualquier texto que aparezca en los nombres actuales. Una vista previa en vivo muestra cada nombre antiguo tachado junto a su nombre nuevo, para que compruebes el resultado antes de confirmar. Cuando se vea bien, haz clic en «Descargar ZIP renombrado»." },
        { q: "¿Mis archivos se suben a algún sitio?", a: "No. Esta herramienta es 100 % del lado del cliente: cada archivo se lee y se renombra dentro de tu propio navegador, y nada se envía jamás a un servidor. No hay ningún paso de carga; el renombrado y el ZIP se generan localmente en tu dispositivo. Por eso también es gratis, sin registro, sin marca de agua y sin cuenta que crear." },
        { q: "¿Qué recibo de vuelta y se modifican los PDF?", a: "Recibes un único archivo ZIP (dockdocs-renamed.zip) con copias de tus PDF y los nuevos nombres. Renombrar cambia únicamente los nombres de archivo; el contenido, las páginas y la calidad de los PDF quedan totalmente intactos. Los archivos originales de tu equipo tampoco se modifican; solo descargas un conjunto recién nombrado." },
        { q: "¿Hay un límite de cuántos archivos puedo renombrar?", a: "Sí: esta herramienta procesa hasta 100 PDF por lote. Como todo se ejecuta en tu navegador, los lotes muy grandes usan más memoria y tardan un poco más en máquinas menos potentes, pero dentro del límite de 100 archivos es rápido. Si tienes más de 100 archivos, ejecuta un segundo lote." },
        { q: "¿Puedo soltar una carpeta que tenga archivos que no sean PDF?", a: "Sí. Puedes soltar una carpeta entera y la herramienta descarta automáticamente todo lo que no sea PDF: imágenes, hojas de cálculo y otros documentos se ignoran, de modo que solo tus PDF se añaden a la lista. No necesitas limpiar la carpeta primero." },
        { q: "¿Qué ocurre si dos archivos acabaran con el mismo nombre?", a: "La herramienta lo detecta automáticamente. Si un patrón numerado o un buscar y reemplazar produjera dos nombres idénticos, añade un sufijo -1, -2 (y así sucesivamente) a los posteriores, de modo que cada archivo del ZIP mantenga un nombre único. Nada se sobrescribe ni se pierde de forma silenciosa." },
      ],
    },
  },
  "batch-rotate-pdf": {
    title: { en: "Batch rotate PDF — FAQ", zh: "批量 PDF 旋转常见问题", es: "Rotar PDF por lotes — preguntas frecuentes" },
    items: {
      en: [
        { q: "How do I rotate a batch of PDFs?", a: "Drag your PDFs onto the box — or drop a whole folder, or use \"Choose folder\". Pick a rotation angle (90°, 180° or 270°), then click \"Rotate all\". When it finishes, click \"Download ZIP\" to get every rotated file in one archive. You can also use the \"+\" button to add more PDFs before running." },
        { q: "Are my files uploaded to a server?", a: "No. This is a 100% client-side tool — every PDF is opened and rotated right inside your browser using your device's own resources, and the ZIP is assembled locally too. Nothing is ever uploaded to DockDocs or anywhere else, so your documents never leave your computer." },
        { q: "What do I get back, and how are the files named?", a: "You get a single ZIP file (dockdocs-rotated.zip) containing every successfully rotated PDF. Each file keeps its original name with \"-rotated\" added before the extension — for example invoice.pdf becomes invoice-rotated.pdf — so it's easy to tell the new copies from your originals." },
        { q: "What gets rotated, and can I rotate only some pages?", a: "The chosen angle is applied to every page of every PDF in the batch — this is a whole-folder fixer, not a per-page editor, so you can't rotate individual pages here. The rotation also adds to any existing rotation, so applying 90° to an already-rotated page turns it a further 90°. For per-page control, use our single-file rotate tool instead." },
        { q: "Are there limits, and why might a PDF say \"failed\"?", a: "You can add up to 50 PDFs per batch. There's no fixed file-size cap — because everything runs in your browser, the real limit is your device's memory, so big jobs on a weak laptop or phone are just slower. Encrypted or password-protected PDFs can't be opened for rotation, so they're skipped and marked \"failed\"; the rest of the batch still processes and only the successful files go into the ZIP. Unlock the file first, then add it again." },
        { q: "Is it free? Do I need an account?", a: "Yes, it's completely free — no signup, no account, and no watermark on your output. Because all the work happens in your browser, there's nothing to pay for and no usage meter; just open the page and start rotating." },
      ],
      zh: [
        { q: "怎么批量旋转 PDF？", a: "把 PDF 拖到上传框里——也可以直接拖入整个文件夹，或用「选择文件夹」。选好旋转角度（90°、180° 或 270°），再点「全部旋转」。完成后点「下载 ZIP」，所有旋转好的文件会打包在一个压缩包里。开始前还能用「+」按钮继续添加 PDF。" },
        { q: "我的文件会被上传到服务器吗？", a: "不会。这是一个 100% 在本地完成的工具——每份 PDF 都在你的浏览器里、用你自己设备的资源打开并旋转，连 ZIP 也是在本地打包的。任何文件都不会上传到 DockDocs 或别处，文档自始至终不会离开你的电脑。" },
        { q: "我会得到什么？文件怎么命名？", a: "你会得到一个 ZIP 压缩包（dockdocs-rotated.zip），里面是所有成功旋转的 PDF。每份文件保留原文件名，只在扩展名前加上「-rotated」——例如 invoice.pdf 会变成 invoice-rotated.pdf——这样很容易把新文件和原件区分开。" },
        { q: "会旋转哪些内容？能只转部分页面吗？", a: "所选角度会应用到批次中每份 PDF 的每一页——它是用来一次性纠正整个文件夹的工具，而不是逐页编辑器，所以这里没法只旋转某几页。旋转还会叠加在已有的旋转角度上，比如对一页已经转过的页面再加 90°，它会再转 90°。需要逐页控制的话，请改用我们的单文件旋转工具。" },
        { q: "有数量限制吗？为什么有文件显示「失败」？", a: "每个批次最多可以添加 50 份 PDF。文件大小没有固定上限——因为全部在浏览器里运行，真正的限制是你设备的内存，所以在性能较弱的笔记本或手机上处理大批量只是会慢一些。已加密或设了密码的 PDF 无法被打开旋转，会被跳过并标记为「失败」；批次里其余文件照常处理，只有成功的文件会进入 ZIP。先解除密码，再重新添加即可。" },
        { q: "是免费的吗？需要注册账号吗？", a: "是的，完全免费——无需注册、无需账号，输出也不带水印。因为所有处理都在你的浏览器里完成，既没有任何费用，也没有使用次数限制；打开页面就能直接旋转。" },
      ],
      es: [
        { q: "¿Cómo roto un lote de PDF?", a: "Arrastra tus PDF a la casilla —o suelta una carpeta entera, o usa «Elegir carpeta»—. Elige un ángulo de rotación (90°, 180° o 270°) y luego haz clic en «Rotar todo». Cuando termine, haz clic en «Descargar ZIP» para obtener todos los archivos rotados en un solo archivo comprimido. También puedes usar el botón «+» para añadir más PDF antes de ejecutar." },
        { q: "¿Mis archivos se suben a un servidor?", a: "No. Es una herramienta 100 % del lado del cliente: cada PDF se abre y se rota dentro de tu propio navegador usando los recursos de tu dispositivo, y el ZIP también se monta localmente. Nada se sube nunca a DockDocs ni a ningún otro sitio, así que tus documentos jamás salen de tu equipo." },
        { q: "¿Qué recibo de vuelta y cómo se nombran los archivos?", a: "Recibes un único archivo ZIP (dockdocs-rotated.zip) con cada PDF rotado correctamente. Cada archivo conserva su nombre original con «-rotated» añadido antes de la extensión —por ejemplo, factura.pdf se convierte en factura-rotated.pdf—, así es fácil distinguir las copias nuevas de tus originales." },
        { q: "¿Qué se rota y puedo rotar solo algunas páginas?", a: "El ángulo elegido se aplica a todas las páginas de cada PDF del lote: esto es un corrector de carpetas enteras, no un editor por página, así que aquí no puedes rotar páginas individuales. La rotación además se suma a cualquier rotación existente, de modo que aplicar 90° a una página ya rotada la gira otros 90°. Para un control por página, usa nuestra herramienta de rotación de un solo archivo." },
        { q: "¿Hay límites y por qué un PDF podría decir «fallido»?", a: "Puedes añadir hasta 50 PDF por lote. No hay un tope de tamaño fijo: como todo se ejecuta en tu navegador, el límite real es la memoria de tu dispositivo, así que los trabajos grandes en una laptop o teléfono poco potente solo van más lentos. Los PDF cifrados o protegidos con contraseña no pueden abrirse para rotarse, así que se omiten y se marcan como «fallido»; el resto del lote sigue procesándose y solo los archivos correctos entran en el ZIP. Desbloquea primero el archivo y vuelve a añadirlo." },
        { q: "¿Es gratis? ¿Necesito una cuenta?", a: "Sí, es completamente gratis: sin registro, sin cuenta y sin marca de agua en tu resultado. Como todo el trabajo ocurre en tu navegador, no hay nada que pagar ni medidor de uso; solo abre la página y empieza a rotar." },
      ],
    },
  },
  "batch-watermark-pdf": {
    title: { en: "Batch watermark PDFs — FAQ", zh: "批量 PDF 添加水印常见问题", es: "Marca de agua en PDF por lotes — preguntas frecuentes" },
    items: {
      en: [
        { q: "How do I watermark a whole folder of PDFs at once?", a: "Drag a folder (or several PDFs) onto the upload box, or click to pick files. Type your watermark text — for example CONFIDENTIAL — then click \"Apply to all\". Each PDF is stamped one by one, and when it finishes you click \"Download ZIP\" to get every watermarked file in a single archive. If you dropped a folder, any non-PDF files inside it are filtered out automatically, so you don't have to clean the folder first." },
        { q: "Are my files uploaded to a server?", a: "No. Every PDF is processed entirely in your browser, on your own device — nothing is uploaded to any server, and there's no account or sign-in. Your documents never leave your computer, which is exactly why it's safe for confidential files." },
        { q: "What do I get back, and how are the files named?", a: "You get one ZIP file (dockdocs-batch.zip) containing all the watermarked PDFs. Each output keeps its original name with a \"-watermarked.pdf\" suffix — so report.pdf becomes report-watermarked.pdf. Your original files are left untouched." },
        { q: "Is there a limit on how many PDFs I can do at once?", a: "This batch tool processes up to 30 PDFs per run. If you add more, only the first 30 are kept. There's no fixed file-size cap — since everything runs in your browser, the real limit is your device's memory, so very large files or weak machines will simply be slower. For a bigger job, split it into batches of 30." },
        { q: "Is it free? Does it add its own watermark or branding?", a: "Yes, it's completely free with no signup, no trial, and no usage limits beyond the 30-files-per-run batch size. The only watermark on your PDFs is the text you type — DockDocs never stamps its own logo or branding onto your files." },
        { q: "Can I choose where the watermark goes or how transparent it is?", a: "Not in the batch tool. It uses a fixed default placement — a diagonal watermark across each page — to keep the whole folder consistent. If you need a custom position, opacity, or font size, use the single-file Watermark tool instead, which gives you full control over one document at a time." },
      ],
      zh: [
        { q: "怎么给整个文件夹的 PDF 一次性加水印？", a: "把文件夹(或多份 PDF)拖到上传框，或点击选择文件。输入水印文字——比如「机密」或「CONFIDENTIAL」——再点「全部应用」。每份 PDF 会被逐个加上水印，完成后点「下载 ZIP」就能把所有加好水印的文件打包成一个压缩包拿到手。如果你拖进来的是文件夹，里面的非 PDF 文件会被自动过滤掉，不用提前清理。" },
        { q: "我的文件会被上传到服务器吗？", a: "不会。每份 PDF 都完全在你的浏览器、你自己的设备上处理——不上传任何文件到服务器，也不需要注册或登录。你的文档从不离开本机，所以处理机密文件也很安全。" },
        { q: "处理完我拿到的是什么？文件怎么命名？", a: "你会拿到一个 ZIP 压缩包(dockdocs-batch.zip)，里面是所有加好水印的 PDF。每个输出文件保留原文件名并加上「-watermarked.pdf」后缀——比如 report.pdf 会变成 report-watermarked.pdf。原始文件不会被改动。" },
        { q: "一次最多能处理多少份 PDF？", a: "这个批量工具每次最多处理 30 份 PDF。多加的部分只会保留前 30 份。文件大小没有固定上限——因为全部在浏览器里运行，真正的限制是设备内存，所以文件很大或机器较弱时只是会慢一些。任务更大时，把它拆成每批 30 份处理即可。" },
        { q: "免费吗？会加上它自己的水印或品牌标识吗？", a: "完全免费，无需注册、无试用、除了每次 30 份的批量上限外没有任何使用限制。你的 PDF 上唯一的水印就是你自己输入的文字——DockDocs 绝不会在你的文件上打上自己的 logo 或品牌标识。" },
        { q: "能自定义水印的位置或透明度吗？", a: "批量工具里不行。它使用固定的默认排版——每页一条对角水印——以保证整个文件夹效果一致。如果需要自定义位置、透明度或字号，请改用单文件的「加水印」工具，它能对单份文档进行完整控制。" },
      ],
      es: [
        { q: "¿Cómo pongo una marca de agua a toda una carpeta de PDF a la vez?", a: "Arrastra una carpeta (o varios PDF) a la casilla de carga, o haz clic para elegir archivos. Escribe el texto de tu marca de agua —por ejemplo, CONFIDENCIAL— y luego haz clic en «Aplicar a todo». Cada PDF se sella uno por uno y, al terminar, haces clic en «Descargar ZIP» para obtener todos los archivos con marca de agua en un solo archivo comprimido. Si soltaste una carpeta, los archivos que no sean PDF que haya dentro se descartan automáticamente, así que no tienes que limpiarla primero." },
        { q: "¿Mis archivos se suben a un servidor?", a: "No. Cada PDF se procesa por completo en tu navegador, en tu propio dispositivo: nada se sube a ningún servidor y no hay cuenta ni inicio de sesión. Tus documentos jamás salen de tu equipo, que es justo por lo que es seguro para archivos confidenciales." },
        { q: "¿Qué recibo de vuelta y cómo se nombran los archivos?", a: "Recibes un archivo ZIP (dockdocs-batch.zip) con todos los PDF marcados. Cada salida conserva su nombre original con el sufijo «-watermarked.pdf», así que report.pdf se convierte en report-watermarked.pdf. Tus archivos originales quedan intactos." },
        { q: "¿Hay un límite de cuántos PDF puedo hacer a la vez?", a: "Esta herramienta por lotes procesa hasta 30 PDF por ejecución. Si añades más, solo se conservan los primeros 30. No hay un tope de tamaño fijo: como todo se ejecuta en tu navegador, el límite real es la memoria de tu dispositivo, así que los archivos muy grandes o las máquinas poco potentes simplemente irán más lentos. Para un trabajo mayor, divídelo en lotes de 30." },
        { q: "¿Es gratis? ¿Añade su propia marca de agua o branding?", a: "Sí, es completamente gratis, sin registro, sin prueba y sin límites de uso más allá del tamaño de lote de 30 archivos por ejecución. La única marca de agua en tus PDF es el texto que escribes; DockDocs nunca estampa su propio logotipo ni branding en tus archivos." },
        { q: "¿Puedo elegir dónde va la marca de agua o lo transparente que es?", a: "En la herramienta por lotes, no. Usa una ubicación predeterminada fija —una marca de agua diagonal sobre cada página— para mantener toda la carpeta coherente. Si necesitas una posición, opacidad o tamaño de fuente personalizados, usa la herramienta de marca de agua de un solo archivo, que te da control total sobre un documento a la vez." },
      ],
    },
  },
  "batch-page-numbers": {
    title: { en: "Batch page numbers — FAQ", zh: "批量 PDF 添加页码常见问题", es: "Números de página por lotes — preguntas frecuentes" },
    items: {
      en: [
        { q: "How do I add page numbers to a batch of PDFs?", a: "Drag your PDFs onto the upload box — or drop a whole folder, or use \"Choose folder\" to pick one. The tool adds each PDF to the list, then click \"Apply to all\". Every file is numbered one by one, and when it finishes you click \"Download ZIP\" to get them all in a single archive." },
        { q: "Are my files uploaded anywhere?", a: "No. This is a 100% client-side tool — every PDF is opened and numbered right inside your browser, and nothing is sent to any server. Your files never leave your device, which is why it works even on confidential documents." },
        { q: "What do I get back, and how are the files named?", a: "You get one ZIP file (named dockdocs-batch.zip) containing every successfully numbered PDF. Each output keeps its original name with a \"-numbered.pdf\" suffix added — so report.pdf becomes report-numbered.pdf. Only files that processed successfully are included; any that failed are skipped and the rest still come through." },
        { q: "Is there a limit on how many files I can do at once, and can I drop a folder with non-PDFs in it?", a: "You can process up to 30 PDFs per batch — the counter next to the list shows how many you've added (for example \"12 / 30 files\"). There's no hard size limit, but since everything runs in your browser, very large or numerous files use more memory and run slower on weaker devices. You can safely drop a folder that also contains images or Word docs: the tool automatically keeps only the actual PDFs and filters everything else out." },
        { q: "Can I choose where the page numbers go or change their style?", a: "Not in the batch tool — it uses a fixed default placement to keep the whole folder consistent in one click. If you need to control the position, font, or starting number, use the single-file \"Add page numbers\" tool instead, which gives you those options." },
        { q: "Is it free? Do I need an account or will there be a watermark?", a: "It's completely free with no signup required, and there's no watermark added to your PDFs. Because everything runs locally in your browser, there's nothing to pay for and no upload quota." },
      ],
      zh: [
        { q: "怎么给一批 PDF 批量加页码？", a: "把 PDF 拖到上传框里——也可以直接拖入整个文件夹，或用「选择文件夹」来挑选。工具会把每份 PDF 加进列表，然后点「全部应用」。文件会一份份依次加上页码，完成后点「下载 ZIP」，所有文件会打包在一个压缩包里。" },
        { q: "我的文件会被上传吗？", a: "不会。这是一个 100% 在本地运行的工具——每份 PDF 都在你的浏览器里打开并加页码，不会发送到任何服务器。文件始终留在你的设备上，所以处理机密文档也很放心。" },
        { q: "处理完拿到的是什么？文件怎么命名？", a: "你会得到一个 ZIP 压缩包(名为 dockdocs-batch.zip)，里面是每份成功加好页码的 PDF。每个输出文件保留原文件名，并加上「-numbered.pdf」后缀——比如 report.pdf 会变成 report-numbered.pdf。只有处理成功的文件会被打包，个别失败的会被跳过，其余照常输出。" },
        { q: "一次最多能处理多少份？文件夹里混了非 PDF 也能拖进来吗？", a: "一次最多 30 份 PDF——列表旁的计数会显示已添加的数量(例如「12 / 30 份」)。没有严格的大小上限，但因为全部在浏览器里运行，文件过大或过多会占用更多内存，在性能较弱的设备上会慢一些。文件夹里混了图片、Word 文档也没关系——工具会自动只保留真正的 PDF，其余全部过滤掉。" },
        { q: "能选择页码的位置或样式吗？", a: "批量工具里不行——它使用固定的默认排版，好让整个文件夹一键处理、风格统一。如果需要控制位置、字体或起始页码，请改用单文件的「加页码」工具，那里提供这些选项。" },
        { q: "免费吗？需要注册吗？会加水印吗？", a: "完全免费，无需注册，也不会给你的 PDF 加任何水印。因为一切都在你的浏览器本地完成，所以没有付费项目，也没有上传配额限制。" },
      ],
      es: [
        { q: "¿Cómo añado números de página a un lote de PDF?", a: "Arrastra tus PDF a la casilla de carga —o suelta una carpeta entera, o usa «Elegir carpeta» para escoger una—. La herramienta añade cada PDF a la lista; luego haz clic en «Aplicar a todo». Cada archivo se numera uno por uno y, al terminar, haces clic en «Descargar ZIP» para obtenerlos todos en un solo archivo comprimido." },
        { q: "¿Mis archivos se suben a algún sitio?", a: "No. Es una herramienta 100 % del lado del cliente: cada PDF se abre y se numera dentro de tu propio navegador, y nada se envía a ningún servidor. Tus archivos jamás salen de tu dispositivo, y por eso funciona incluso con documentos confidenciales." },
        { q: "¿Qué recibo de vuelta y cómo se nombran los archivos?", a: "Recibes un archivo ZIP (llamado dockdocs-batch.zip) con cada PDF numerado correctamente. Cada salida conserva su nombre original con el sufijo «-numbered.pdf» añadido, así que report.pdf se convierte en report-numbered.pdf. Solo se incluyen los archivos que se procesaron correctamente; los que fallaron se omiten y el resto sí pasa." },
        { q: "¿Hay un límite de cuántos archivos puedo hacer a la vez y puedo soltar una carpeta con archivos que no sean PDF?", a: "Puedes procesar hasta 30 PDF por lote; el contador junto a la lista muestra cuántos has añadido (por ejemplo, «12 / 30 archivos»). No hay un límite estricto de tamaño, pero como todo se ejecuta en tu navegador, los archivos muy grandes o numerosos usan más memoria y van más lentos en dispositivos poco potentes. Puedes soltar sin problema una carpeta que también contenga imágenes o documentos de Word: la herramienta conserva automáticamente solo los PDF reales y descarta todo lo demás." },
        { q: "¿Puedo elegir dónde van los números de página o cambiar su estilo?", a: "En la herramienta por lotes, no: usa una ubicación predeterminada fija para mantener toda la carpeta coherente con un solo clic. Si necesitas controlar la posición, la fuente o el número inicial, usa la herramienta de un solo archivo «Añadir números de página», que te ofrece esas opciones." },
        { q: "¿Es gratis? ¿Necesito una cuenta o habrá una marca de agua?", a: "Es completamente gratis, sin registro necesario, y no se añade ninguna marca de agua a tus PDF. Como todo se ejecuta localmente en tu navegador, no hay nada que pagar ni cuota de carga." },
      ],
    },
  },
  "batch-split-merge": {
    title: { en: "Batch split PDF — FAQ", zh: "批量 PDF 拆分常见问题", es: "Dividir PDF por lotes — preguntas frecuentes" },
    items: {
      en: [
        { q: "How do I split a whole folder of PDFs at once?", a: "Drag and drop your PDFs — or a whole folder — onto the upload box, or click to choose them. Set \"Pages per file\" to how many pages each output piece should contain (1 splits every page into its own file), then click \"Run\". Each PDF is cut into chunks of that size and everything is packaged into a single ZIP you can download with \"Download ZIP\"." },
        { q: "Are my files uploaded to a server?", a: "No. Splitting runs entirely in your browser using a local PDF engine — nothing is uploaded, nothing is stored, and nothing leaves your device. You can even disconnect from the internet after the page loads and it still works. That is why it is safe for sensitive or confidential documents." },
        { q: "What do I get back, and how are the files named?", a: "You get one ZIP file (dockdocs-split.zip). Inside, every PDF is split into pieces named after the original — for example report.pdf becomes report-part1.pdf, report-part2.pdf, and so on. If you uploaded several PDFs, all of their parts are flattened together into the same ZIP." },
        { q: "Can I add a folder, and what happens to non-PDF files in it?", a: "Yes — you can drop or choose an entire folder. Any file that is not a PDF is filtered out automatically, so you do not have to clean the folder first. Only the PDFs are added to the list and processed." },
        { q: "Is there a limit on how many or how large the files can be?", a: "There is a cap of 50 files per batch — if you add more, only the first 50 are kept. There is no fixed page or file-size limit; the real constraint is your device's memory, so very large PDFs or huge batches will simply run slower on weaker machines. If one PDF is corrupt or password-protected it is marked \"failed\" and skipped, while the rest still split normally." },
        { q: "Is it free? Do I need an account or will it add a watermark?", a: "Yes, it is completely free with no sign-up and no watermark. Because the work happens on your own device, there are no usage credits or limits to worry about — use it as often as you like." },
      ],
      zh: [
        { q: "怎么一次拆分整个文件夹的 PDF？", a: "把 PDF——或整个文件夹——拖到上传框，或点击选择。把「每个文件页数」设成每份输出包含多少页(填 1 就是每页拆成一份)，然后点「开始」。每份 PDF 都会按这个页数切成若干块，全部打包进一个 ZIP，点「下载 ZIP」即可保存。" },
        { q: "我的文件会上传到服务器吗？", a: "不会。拆分完全在你的浏览器里用本地 PDF 引擎完成——不上传、不存储，任何文件都不会离开你的设备。页面加载完后即使断网也照样能用。所以处理敏感或机密文档很安全。" },
        { q: "我会拿到什么？文件怎么命名？", a: "你会得到一个 ZIP 文件(dockdocs-split.zip)。里面每份 PDF 都按原名拆成若干块——比如 report.pdf 会变成 report-part1.pdf、report-part2.pdf 等等。如果你上传了多份 PDF，所有切出来的部分会一起放进同一个 ZIP。" },
        { q: "可以直接选文件夹吗？里面的非 PDF 文件怎么办？", a: "可以——你可以拖入或选择整个文件夹。其中所有非 PDF 文件会被自动过滤掉，无需事先清理文件夹。只有 PDF 会被加入列表并处理。" },
        { q: "文件数量或大小有限制吗？", a: "单次最多 50 份——超出的部分只保留前 50 份。页数和文件大小没有固定上限，真正的限制是设备内存，所以超大 PDF 或超大批量在性能较弱的机器上只会更慢一些。如果某份 PDF 损坏或加了密码，它会被标为「失败」并跳过——其余文件照常拆分。" },
        { q: "免费吗？需要注册吗？会加水印吗？", a: "完全免费，无需注册，也不加水印。因为所有处理都在你自己的设备上完成，没有任何用量额度或次数限制——想用多少次都可以。" },
      ],
      es: [
        { q: "¿Cómo divido toda una carpeta de PDF a la vez?", a: "Arrastra y suelta tus PDF —o una carpeta entera— en la casilla de carga, o haz clic para elegirlos. Configura «Páginas por archivo» con cuántas páginas debe contener cada parte de salida (1 divide cada página en su propio archivo) y luego haz clic en «Ejecutar». Cada PDF se corta en bloques de ese tamaño y todo se empaqueta en un único ZIP que puedes descargar con «Descargar ZIP»." },
        { q: "¿Mis archivos se suben a un servidor?", a: "No. La división se ejecuta por completo en tu navegador usando un motor PDF local: nada se sube, nada se almacena y nada sale de tu dispositivo. Incluso puedes desconectarte de internet después de que la página cargue y seguirá funcionando. Por eso es seguro para documentos sensibles o confidenciales." },
        { q: "¿Qué recibo de vuelta y cómo se nombran los archivos?", a: "Recibes un archivo ZIP (dockdocs-split.zip). Dentro, cada PDF se divide en partes nombradas a partir del original; por ejemplo, report.pdf se convierte en report-part1.pdf, report-part2.pdf, y así sucesivamente. Si subiste varios PDF, todas sus partes se agrupan juntas en el mismo ZIP." },
        { q: "¿Puedo añadir una carpeta y qué ocurre con los archivos que no sean PDF que haya en ella?", a: "Sí: puedes soltar o elegir una carpeta entera. Cualquier archivo que no sea PDF se descarta automáticamente, así que no tienes que limpiar la carpeta primero. Solo los PDF se añaden a la lista y se procesan." },
        { q: "¿Hay un límite de cuántos o de qué tamaño pueden ser los archivos?", a: "Hay un tope de 50 archivos por lote; si añades más, solo se conservan los primeros 50. No hay un límite fijo de páginas o tamaño de archivo; la restricción real es la memoria de tu dispositivo, así que los PDF muy grandes o los lotes enormes simplemente irán más lentos en máquinas poco potentes. Si un PDF está dañado o protegido con contraseña, se marca como «fallido» y se omite, mientras que el resto se divide con normalidad." },
        { q: "¿Es gratis? ¿Necesito una cuenta o añadirá una marca de agua?", a: "Sí, es completamente gratis, sin registro y sin marca de agua. Como el trabajo ocurre en tu propio dispositivo, no hay créditos ni límites de uso de los que preocuparse: úsala tantas veces como quieras." },
      ],
    },
  },
  "batch-summary": {
    title: { en: "Batch summary — FAQ", zh: "批量摘要常见问题", es: "Resumen por lotes — preguntas frecuentes" },
    items: {
      en: [
        { q: "How do I summarize several PDFs at once?", a: "Drag and drop your PDFs onto the drop zone, or click \"Choose PDFs\" to pick them. You can add up to 5 files at a time. Once they're loaded, click \"Summarize all\" — each document is summarized in turn, and you'll see a progress count like 2/5 while it works. When it finishes you get an executive summary plus key points for every file." },
        { q: "Is my file uploaded anywhere? Where does the work happen?", a: "Your PDF file is never uploaded. The text is extracted right inside your browser, and only that extracted text — not the original file — is sent to our AI summary service to generate the summary. This is an AI tool, so it does need an internet connection to reach the AI service, but the document itself stays on your device." },
        { q: "It says \"no extractable text (scan?)\" for one of my files. What's wrong?", a: "That means the PDF has no text layer to read — it's almost always a scanned page or a photo saved as PDF, which is just an image to the tool. Run our OCR PDF tool on it first to add a real text layer, then come back and summarize it here. PDFs that are encrypted or password-protected also won't extract; remove the password first." },
        { q: "What do I get back, and can I save it?", a: "For each PDF you get a short executive summary plus a list of key points, shown as a card on the page. Once all files are done, click \"Download all (.md)\" to save everything as a single Markdown file (dockdocs-summaries.md) with one section per document — easy to drop into your notes, a doc, or a wiki." },
        { q: "Why only 5 files at a time, and why one at a time?", a: "We cap each run at 5 PDFs and process them one after another to stay within fair-use limits and keep results reliable rather than overloading the AI service. If you have more, just run a batch, click \"Start over\", and load the next set. Files that fail are marked individually, so one bad PDF won't stop the rest." },
        { q: "The summaries look good — can I trust them blindly?", a: "Treat them as a fast first pass, not a substitute for reading. Summaries are AI-generated from each document, so they can miss nuance or occasionally get a detail wrong — always give them a quick check against the source before you rely on anything important, especially in contracts or reports." },
      ],
      zh: [
        { q: "怎么一次给多份 PDF 生成摘要？", a: "把 PDF 拖到上传区，或点击「选择 PDF」挑选文件——一次最多 5 份。文件加载好后点「全部摘要」，工具会逐份处理，期间会显示像 2/5 这样的进度。完成后，每份文件都会给出执行摘要 + 关键要点。" },
        { q: "我的文件会被上传吗？处理在哪里进行？", a: "你的 PDF 文件不会被上传。文字是在你的浏览器里就地提取的，只有提取出来的文本——而不是原始文件——才会发送到我们的 AI 摘要服务来生成摘要。这是一款 AI 工具，需要联网才能访问 AI 服务，但文档本身始终留在你的设备上。" },
        { q: "某份文件显示「无可提取文字(扫描件？)」是怎么回事？", a: "这表示该 PDF 没有可读取的文字层——多半是扫描件，或把照片存成了 PDF，对工具来说它只是一张图片。请先用我们的「OCR PDF」工具给它加上真正的文字层，再回到这里生成摘要。加密或带密码的 PDF 同样无法提取文字——请先解除密码。" },
        { q: "我会得到什么结果？能保存吗？", a: "每份 PDF 都会得到一段简短的执行摘要，外加一组关键要点，以卡片形式显示在页面上。全部处理完后，点「下载全部 (.md)」即可把所有结果存成一个 Markdown 文件(dockdocs-summaries.md)，每份文档一节——方便直接粘进笔记、文档或知识库。" },
        { q: "为什么一次只能 5 份，而且要逐份处理？", a: "每次最多 5 份、并且逐份依次处理——这是为了符合合理用量限制，让结果稳定可靠，而不至于让 AI 服务过载。文件更多时，跑完一批后点「重新开始」再加载下一批即可。处理失败的文件会单独标记出来，所以一份坏 PDF 不会拖垮其余的。" },
        { q: "摘要看起来不错，可以完全照搬吗？", a: "请把它当作快速的初步速览，而不是替代通读。摘要由 AI 从每份文档生成，可能漏掉细微之处，偶尔也会弄错某个细节——在依赖任何重要内容之前(尤其是合同或报告)，建议对照原文快速核对一遍。" },
      ],
      es: [
        { q: "¿Cómo resumo varios PDF a la vez?", a: "Arrastra y suelta tus PDF en la zona de carga, o haz clic en «Elegir PDF» para escogerlos. Puedes añadir hasta 5 archivos a la vez. Una vez cargados, haz clic en «Resumir todo»: cada documento se resume por turnos y verás un recuento de progreso como 2/5 mientras trabaja. Al terminar obtienes un resumen ejecutivo más puntos clave de cada archivo." },
        { q: "¿Mi archivo se sube a algún sitio? ¿Dónde ocurre el trabajo?", a: "Tu archivo PDF nunca se sube. El texto se extrae dentro de tu navegador y solo ese texto extraído —no el archivo original— se envía a nuestro servicio de resumen con IA para generar el resumen. Es una herramienta de IA, así que sí necesita conexión a internet para llegar al servicio de IA, pero el documento en sí permanece en tu dispositivo." },
        { q: "Dice «sin texto extraíble (¿escaneado?)» en uno de mis archivos. ¿Qué pasa?", a: "Significa que el PDF no tiene una capa de texto que leer; casi siempre es una página escaneada o una foto guardada como PDF, que para la herramienta es solo una imagen. Pásalo primero por nuestra herramienta OCR PDF para añadir una capa de texto real, y luego vuelve y resúmelo aquí. Los PDF cifrados o protegidos con contraseña tampoco se pueden extraer; quita primero la contraseña." },
        { q: "¿Qué recibo de vuelta y puedo guardarlo?", a: "Por cada PDF obtienes un breve resumen ejecutivo más una lista de puntos clave, mostrados como una tarjeta en la página. Una vez terminados todos los archivos, haz clic en «Descargar todo (.md)» para guardarlo todo como un único archivo Markdown (dockdocs-summaries.md) con una sección por documento, fácil de pegar en tus notas, un documento o un wiki." },
        { q: "¿Por qué solo 5 archivos a la vez y por qué de uno en uno?", a: "Limitamos cada ejecución a 5 PDF y los procesamos uno tras otro para mantenernos dentro de los límites de uso justo y que los resultados sean fiables, en lugar de saturar el servicio de IA. Si tienes más, ejecuta un lote, haz clic en «Empezar de nuevo» y carga el siguiente conjunto. Los archivos que fallan se marcan de forma individual, así que un PDF defectuoso no detiene al resto." },
        { q: "Los resúmenes se ven bien; ¿puedo confiar en ellos a ciegas?", a: "Trátalos como una primera pasada rápida, no como un sustituto de la lectura. Los resúmenes se generan con IA a partir de cada documento, así que pueden pasar por alto matices o, de vez en cuando, equivocarse en un detalle: revísalos siempre rápidamente contra la fuente antes de fiarte de algo importante, sobre todo en contratos o informes." },
      ],
    },
  },
  "batch-sort": {
    title: { en: "Classify PDFs — FAQ", zh: "PDF 智能分类常见问题", es: "Clasificar PDF — preguntas frecuentes" },
    items: {
      en: [
        { q: "How do I use it?", a: "Drag and drop your PDFs — or a whole folder — onto the page, or click \"Choose PDFs\" / \"Choose folder\". Press \"Sort all\" and the AI labels each file with a category (invoice, contract, resume, report and so on). When it finishes, click \"Download sorted ZIP\" to get one ZIP with your files grouped into category folders. You can sort up to 30 files at a time." },
        { q: "Are my files uploaded to a server?", a: "No — your actual PDF files never leave your device. Each PDF is read right in your browser to pull out its text, and only that extracted text is sent to our AI service to decide the category. The files themselves stay local, and the final ZIP is built in your browser from your originals." },
        { q: "Does it work on scanned PDFs or photos of documents?", a: "Not directly. A scanned or image-only PDF has no text layer, so there's nothing to read — those files come back marked \"no text\" and land in an \"Uncategorized\" folder. Run them through OCR first (our \"OCR PDF\" tool adds a text layer), then sort them here." },
        { q: "Do I need an internet connection?", a: "Yes. The text is extracted on your device, but the actual classification is done by our AI service online, so you need to be connected. The text extraction and the final ZIP packaging happen locally; only the category decision needs the internet." },
        { q: "What do I get back, and are my original files changed?", a: "You get a single ZIP named dockdocs-sorted.zip with one subfolder per category, and your original PDFs placed inside — untouched and unmodified. If two files would end up with the same name in the same folder, we add a \"-1\", \"-2\" suffix so nothing gets overwritten." },
        { q: "How accurate are the categories?", a: "The categories are AI-suggested from each document's text, so they're a strong starting point but worth a quick check — especially for unusual documents. To keep it fast, the AI reads only the first 6 pages of each PDF, which is plenty for most files but can miss the point on a document whose type only becomes clear later on." },
      ],
      zh: [
        { q: "怎么使用？", a: "把 PDF——或者整个文件夹——拖到页面上，或点击「选择 PDF」/「选择文件夹」。点「全部分类」，AI 会给每份文件打上类别(发票、合同、简历、报告等)。完成后点「下载归档 ZIP」，得到一个把文件按类别分到不同文件夹的 ZIP。一次最多处理 30 份文件。" },
        { q: "我的文件会被上传到服务器吗？", a: "不会——你的 PDF 文件本身始终不离开你的设备。每份 PDF 都在浏览器里读取并提取出文字，只有提取出来的文字才会发送到我们的 AI 服务去判断类别。文件本身留在本地，最终的 ZIP 也是在你的浏览器里用你的原文件打包生成的。" },
        { q: "扫描件或拍照的文档能用吗？", a: "不能直接用。扫描件或纯图片 PDF 没有文字层——没有文字可读，这类文件会被标记为「无文字」并归入「未分类」文件夹。请先做 OCR(我们的「PDF OCR」工具会加上文字层)，再回到这里分类。" },
        { q: "需要联网吗？", a: "需要。文字是在你的设备上提取的，但真正的分类由我们在线的 AI 服务完成，所以必须联网。文字提取和最终的 ZIP 打包都在本地进行——只有类别判断这一步需要联网。" },
        { q: "我会拿到什么？原文件会被改动吗？", a: "你会拿到一个名为 dockdocs-sorted.zip 的 ZIP，里面每个类别一个子文件夹，你的原 PDF 原封不动地放在里面——不修改、不改名。如果同一文件夹里有两份文件会重名，我们会自动加上「-1」「-2」后缀，确保不会互相覆盖。" },
        { q: "分类准不准？", a: "类别由 AI 从每份文档的文字推断而来，是很好的起点，但建议快速核对一下——尤其是不常见的文档。为了保证速度，AI 只读取每份 PDF 的前 6 页，对大多数文件足够了，但如果某份文档要到后面才能看出类型，可能会判断偏差。" },
      ],
      es: [
        { q: "¿Cómo se usa?", a: "Arrastra y suelta tus PDF —o una carpeta entera— en la página, o haz clic en «Elegir PDF» / «Elegir carpeta». Pulsa «Clasificar todo» y la IA etiqueta cada archivo con una categoría (factura, contrato, currículum, informe, etc.). Al terminar, haz clic en «Descargar ZIP clasificado» para obtener un ZIP con tus archivos agrupados en carpetas por categoría. Puedes clasificar hasta 30 archivos a la vez." },
        { q: "¿Mis archivos se suben a un servidor?", a: "No: tus archivos PDF reales jamás salen de tu dispositivo. Cada PDF se lee directamente en tu navegador para extraer su texto, y solo ese texto extraído se envía a nuestro servicio de IA para decidir la categoría. Los archivos en sí permanecen locales, y el ZIP final se genera en tu navegador a partir de tus originales." },
        { q: "¿Funciona con PDF escaneados o fotos de documentos?", a: "No directamente. Un PDF escaneado o de solo imagen no tiene capa de texto, así que no hay nada que leer: esos archivos vuelven marcados como «sin texto» y van a parar a una carpeta «Sin clasificar». Pásalos primero por OCR (nuestra herramienta «OCR PDF» añade una capa de texto) y luego clasifícalos aquí." },
        { q: "¿Necesito conexión a internet?", a: "Sí. El texto se extrae en tu dispositivo, pero la clasificación en sí la realiza nuestro servicio de IA en línea, así que necesitas estar conectado. La extracción de texto y el empaquetado final del ZIP ocurren localmente; solo la decisión de categoría necesita internet." },
        { q: "¿Qué recibo de vuelta y se modifican mis archivos originales?", a: "Recibes un único ZIP llamado dockdocs-sorted.zip con una subcarpeta por categoría y tus PDF originales colocados dentro, intactos y sin modificar. Si dos archivos acabaran con el mismo nombre en la misma carpeta, añadimos un sufijo «-1», «-2» para que nada se sobrescriba." },
        { q: "¿Qué tan precisas son las categorías?", a: "Las categorías las sugiere la IA a partir del texto de cada documento, así que son un buen punto de partida pero conviene revisarlas rápidamente, sobre todo en documentos poco habituales. Para que sea rápido, la IA lee solo las primeras 6 páginas de cada PDF, lo cual basta para la mayoría de archivos, pero puede errar el tema en un documento cuyo tipo solo queda claro más adelante." },
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
        { q: "How do I compare documents?", a: "Upload 2 to 8 PDFs of the same kind — quotes, invoices, or contracts — then pick the type and click \"Compare fields\". DockDocs lines up the key terms (price, delivery, payment, warranty, and so on) side by side in one table, with the exact source line behind every value. You also get a sourced recommendation for which option wins, and you can ask one question across all the documents at once." },
        { q: "Are my files uploaded to your server?", a: "No — your PDFs never leave your device. DockDocs reads them right in your browser to pull out the text. Only that extracted plain text (not the file itself) is sent to our server, where the AI extracts and aligns the fields. So the document, its layout, and any embedded data stay local; what travels is the words on the page." },
        { q: "Why does my PDF say \"Not recognized (likely scanned — needs OCR)\"?", a: "That means the PDF has no selectable text layer — it's usually a scan or a photo of a page, so there's nothing to read. Click \"Extract text with OCR\" on that document and DockDocs will run OCR in your browser to recognize the text (the first few pages), then you can compare it like any other file. Encrypted or password-protected PDFs also can't be read until they're unlocked." },
        { q: "What do I get back, and can I trust the values?", a: "You get a comparison table where every cell shows the value plus the exact source line it came from — and that line is verified to actually appear in your document, so nothing is invented. Click any source line to jump to a highlighted snippet of the original text. If a document simply doesn't state something, you'll see \"Not recognized\" rather than a guess. One caveat: the overall recommendation is the AI's reasoning over those numbers and isn't individually source-checked, so confirm the figures in the table before you decide." },
        { q: "Is there a limit on file count or size?", a: "You can compare up to 8 PDFs at a time, and you need at least 2 readable ones for the comparison to run. For the \"ask across documents\" feature, the combined text of all documents must stay under 60,000 characters and your question under 500 characters — if you hit that, use fewer or shorter documents. The tool needs an internet connection, since the field extraction and recommendation run on our server." },
        { q: "Is it free?", a: "Yes — you can upload your PDFs, run the side-by-side comparison, get the recommendation, and ask questions across your documents. The in-browser OCR for scanned files is free too, since it runs locally on your device. The comparison engine is in beta, so behavior may keep improving." },
      ],
      zh: [
        { q: "怎么对比文档？", a: "上传 2 到 8 份同类 PDF——报价单、账单或合同——选好类型，点「对比字段」。DockDocs 会把关键条款(总价、交期、付款方式、质保等)并排放进一张表里，每个值后面都带着它在原文里的那一句出处。你还会得到一份带依据的推荐(选哪个、为什么)，并且可以用一个问题问遍所有上传的文档。" },
        { q: "我的文件会上传到你们服务器吗？", a: "不会——你的 PDF 不离开你的设备。DockDocs 直接在你浏览器里读取文件、抽出文字，只有抽出的纯文本(而不是文件本身)会发到我们服务器，由 AI 在那里抽取并对齐字段。所以文档、版式和任何内嵌数据都留在本地，真正传出去的只是页面上的文字。" },
        { q: "为什么我的 PDF 显示「未识别(可能是扫描件——需 OCR)」？", a: "这表示这份 PDF 没有可选中的文字层——通常是扫描件或页面照片，里面没有现成的文字可读。点这份文档上的「用 OCR 提取文字」,DockDocs 会在你浏览器里跑 OCR 识别文字(前几页)，识别后就能像普通文件一样对比了。加密或带密码的 PDF 在解锁前也读不了。" },
        { q: "对比完我能拿到什么？这些值可信吗？", a: "你会拿到一张对比表，每个单元格都显示具体的值，以及它来自原文的那一句——而且这句已校验确实出现在你的文档里，绝不凭空编造。点任意一句出处，就能跳到原文对应片段并高亮显示。如果某份文档根本没写某项，你看到的是「未识别」而不是猜测。需要留意一点——最终的推荐结论是 AI 基于表格里数字做的推理，它不像表格每个单元格那样逐条核对过出处，所以决定前请以表格里的数字为准。" },
        { q: "对文件数量或大小有限制吗？", a: "一次最多对比 8 份 PDF，且至少要有 2 份可读才能开始对比。对于「跨文档提问」功能，所有文档合计文字需在 60,000 字符以内，问题在 500 字符以内——超了就换用更少或更短的文档。该工具需要联网，因为字段抽取和推荐是在我们服务器上完成的。" },
        { q: "免费吗？", a: "免费——你可以上传 PDF、做并排对比、拿到推荐，并跨文档提问。扫描件的浏览器内 OCR 也免费，因为它在你本地设备上运行。对比引擎目前是测试版，体验会持续改进。" },
      ],
      es: [
        { q: "¿Cómo comparo documentos?", a: "Sube de 2 a 8 PDF del mismo tipo —presupuestos, facturas o contratos—, luego elige el tipo y haz clic en «Comparar campos». DockDocs alinea los términos clave (precio, entrega, pago, garantía, etc.) lado a lado en una sola tabla, con la línea de origen exacta detrás de cada valor. También obtienes una recomendación con fuentes sobre qué opción gana, y puedes hacer una pregunta a todos los documentos a la vez." },
        { q: "¿Mis archivos se suben a tu servidor?", a: "No: tus PDF jamás salen de tu dispositivo. DockDocs los lee directamente en tu navegador para extraer el texto. Solo ese texto plano extraído (no el archivo en sí) se envía a nuestro servidor, donde la IA extrae y alinea los campos. Así que el documento, su diseño y cualquier dato incrustado permanecen locales; lo que viaja son las palabras de la página." },
        { q: "¿Por qué mi PDF dice «No reconocido (probablemente escaneado, necesita OCR)»?", a: "Significa que el PDF no tiene una capa de texto seleccionable: suele ser un escaneo o una foto de una página, así que no hay nada que leer. Haz clic en «Extraer texto con OCR» en ese documento y DockDocs ejecutará OCR en tu navegador para reconocer el texto (las primeras páginas), tras lo cual podrás compararlo como cualquier otro archivo. Los PDF cifrados o protegidos con contraseña tampoco se pueden leer hasta que se desbloquean." },
        { q: "¿Qué recibo de vuelta y puedo confiar en los valores?", a: "Recibes una tabla comparativa donde cada celda muestra el valor más la línea de origen exacta de la que procede, y esa línea se verifica que aparezca realmente en tu documento, así que nada se inventa. Haz clic en cualquier línea de origen para saltar a un fragmento resaltado del texto original. Si un documento simplemente no indica algo, verás «No reconocido» en lugar de una suposición. Una advertencia: la recomendación general es el razonamiento de la IA sobre esas cifras y no se verifica fuente por fuente, así que confirma los datos de la tabla antes de decidir." },
        { q: "¿Hay un límite de cantidad o tamaño de archivos?", a: "Puedes comparar hasta 8 PDF a la vez, y necesitas al menos 2 legibles para que la comparación se ejecute. Para la función de «preguntar a todos los documentos», el texto combinado de todos los documentos debe mantenerse por debajo de 60 000 caracteres y tu pregunta por debajo de 500 caracteres; si lo superas, usa documentos menos numerosos o más cortos. La herramienta necesita conexión a internet, ya que la extracción de campos y la recomendación se ejecutan en nuestro servidor." },
        { q: "¿Es gratis?", a: "Sí: puedes subir tus PDF, ejecutar la comparación lado a lado, obtener la recomendación y hacer preguntas a tus documentos. El OCR en el navegador para archivos escaneados también es gratis, ya que se ejecuta localmente en tu dispositivo. El motor de comparación está en fase beta, así que su comportamiento puede seguir mejorando." },
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
        { q: "How do I compare two PDF versions?", a: "Upload the original (v1) and the revised (v2) PDF, then click Compare versions. DockDocs lines up the text and shows a single marked-up view — added text is highlighted in green, removed text is struck through in red, like track changes." },
        { q: "Are my files uploaded anywhere?", a: "No. This is a client-side tool: the text is extracted and compared entirely in your browser, so your files never leave your device. Nothing is sent to a server." },
        { q: "Does it catch reworded sentences?", a: "It compares sentence by sentence, so it marks which sentences were added and which were removed. A small reword shows up as one deletion plus one addition rather than a word-level change inside the sentence." },
        { q: "What does it actually compare — does it check formatting or images?", a: "Only the extracted text. Fonts, layout, colors, images and tables aren't part of the comparison, and scanned PDFs with no real text layer won't produce useful results. If it reports no textual changes, the wording is identical even if the look changed." },
        { q: "How large can the documents be?", a: "The whole comparison runs in your browser, so it's tuned for documents up to a few thousand sentences (it caps at 2,500 sentences per file). Very long contracts or books may be truncated or run slowly." },
        { q: "Is it free?", a: "Yes — comparing versions is completely free, with no sign-up and no limit on the number of comparisons." },
      ],
      zh: [
        { q: "如何对比两份 PDF 版本？", a: "上传原始版(v1)和修订版(v2)两个 PDF，点「对比版本」。DockDocs 会对齐文本，生成一个标注视图——新增文字用绿色高亮，删除文字用红色加删除线，类似修订模式。" },
        { q: "文件会被上传吗？", a: "不会。这是纯客户端工具：文本完全在你的浏览器中提取和对比，文件不会离开你的设备，也不会发送到任何服务器。" },
        { q: "能识别改写过的句子吗？", a: "它逐句对比，会标出哪些句子是新增、哪些是删除。小幅改写会显示为一处删除加一处新增，而不是在句子内部标出改动的几个字。" },
        { q: "它到底对比什么——会比排版或图片吗？", a: "只比对抽取出来的文字。字体、版式、颜色、图片和表格都不在对比范围内；没有真正文字层的扫描件也得不到有用结果。如果显示「未发现文字差异」，说明文字完全一致，即使外观变了。" },
        { q: "文档可以多大？", a: "整个对比都在浏览器里运行，因此适合最多几千句的文档(每个文件上限 2500 句)。特别长的合同或书籍可能被截断或变慢。" },
        { q: "是免费的吗？", a: "免费——版本对比完全免费，无需注册，对比次数也不限。" },
      ],
      es: [
        { q: "¿Cómo comparo dos versiones de un PDF?", a: "Sube el PDF original (v1) y el revisado (v2), luego haz clic en «Comparar versiones». DockDocs alinea el texto y muestra una única vista con marcas: el texto añadido se resalta en verde y el texto eliminado se tacha en rojo, como el control de cambios." },
        { q: "¿Mis archivos se suben a algún sitio?", a: "No. Es una herramienta del lado del cliente: el texto se extrae y se compara por completo en tu navegador, así que tus archivos jamás salen de tu dispositivo. Nada se envía a un servidor." },
        { q: "¿Detecta frases reformuladas?", a: "Compara frase por frase, así que marca qué frases se añadieron y cuáles se eliminaron. Una pequeña reformulación aparece como una eliminación más una adición, en lugar de un cambio a nivel de palabra dentro de la frase." },
        { q: "¿Qué compara exactamente? ¿Revisa el formato o las imágenes?", a: "Solo el texto extraído. Las fuentes, el diseño, los colores, las imágenes y las tablas no forman parte de la comparación, y los PDF escaneados sin una capa de texto real no darán resultados útiles. Si informa de que no hay cambios de texto, la redacción es idéntica aunque el aspecto haya cambiado." },
        { q: "¿Cómo de grandes pueden ser los documentos?", a: "Toda la comparación se ejecuta en tu navegador, así que está ajustada para documentos de hasta unos miles de frases (tiene un tope de 2500 frases por archivo). Los contratos o libros muy largos pueden truncarse o ir lentos." },
        { q: "¿Es gratis?", a: "Sí: comparar versiones es completamente gratis, sin registro y sin límite en el número de comparaciones." },
      ],
    },
  },
};

// cast: remove when "pt" is added to Locale
const FAQS_PT: Record<string, { title: string; items: Array<{ q: string; a: string }> }> = {
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
  "batch-fix-scans": {
    title: "Corrigir digitalizações em lote — perguntas frequentes",
    items: [
      { q: "O que o Corrigir digitalizações em lote faz?", a: "Duas tarefas de limpeza em uma pasta inteira de PDFs de uma vez. Cortar margens apara as mesmas bordas de cada página de cada arquivo (ótimo para remover bordas pretas de digitalização ou margens de encadernação). Excluir páginas remove os mesmos números de página de cada arquivo (ótimo para remover uma capa ou página separadora). Escolha um modo, configure uma vez e ele se aplica a todo o lote." },
      { q: "Como funciona o corte?", a: "Use os controles deslizantes para aparar cada borda como porcentagem da página; a pré-visualização mostra o primeiro arquivo com a área aparada sombreada. O mesmo corte é aplicado a cada página de cada arquivo do lote. O corte usa a caixa de corte do PDF, então a área aparada fica oculta, não destruída — pode ser restaurada depois." },
      { q: "Como funciona a exclusão de páginas?", a: "Digite os números das páginas a remover de cada arquivo, como 1 para uma capa ou 1,3-4 para várias. Essas páginas são excluídas de cada arquivo do lote. Se um arquivo ficasse sem páginas, ele é ignorado e sinalizado para você não receber um documento vazio." },
      { q: "Há um limite e meus arquivos são enviados?", a: "Até 30 arquivos por lote. Tudo é executado inteiramente no seu navegador — seus arquivos nunca são enviados, o que torna isso seguro para digitalizações confidenciais. Você recebe tudo de volta em um único ZIP." },
      { q: "É gratuito?", a: "Sim, completamente gratuito — sem conta, sem marca d'água, sem limite diário." },
    ],
  },
  "batch-translate": {
    title: "Traduzir PDFs em lote — perguntas frequentes",
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
  "batch-rename-pdf": {
    title: "Renomear PDFs em lote — perguntas frequentes",
    items: [
      { q: "Como renomeio um lote de PDFs?", a: "Arraste uma pasta inteira (ou um conjunto de PDFs) para a caixa de upload, ou clique para escolher arquivos. Em seguida, escolha um modo: «Numerado» dá a cada arquivo um nome base mais um número de sequência (fatura-01.pdf, fatura-02.pdf…), e «Localizar e substituir» troca qualquer texto que apareça nos nomes de arquivo atuais. Uma pré-visualização ao vivo mostra cada nome antigo riscado ao lado do seu novo nome, para que você verifique o resultado antes de confirmar. Quando parecer correto, clique em «Baixar ZIP renomeado»." },
      { q: "Meus arquivos são enviados para algum lugar?", a: "Não. Esta ferramenta é 100% do lado do cliente — cada arquivo é lido e renomeado dentro do seu próprio navegador, e nada é jamais enviado a um servidor. Não há etapa de upload; a renomeação e o ZIP são gerados localmente no seu dispositivo. É por isso que também é gratuito, sem cadastro, sem marca d'água e sem conta a criar." },
      { q: "O que recebo de volta e os PDFs são modificados?", a: "Você recebe um único arquivo ZIP (dockdocs-renamed.zip) contendo cópias dos seus PDFs com os novos nomes de arquivo. Renomear muda apenas os nomes de arquivo — o conteúdo, as páginas e a qualidade dos PDFs ficam completamente intactos. Os arquivos originais no seu computador também não são alterados; você apenas baixa um conjunto recém-nomeado." },
      { q: "Há um limite de quantos arquivos posso renomear?", a: "Sim — esta ferramenta processa até 100 PDFs por lote. Como tudo é executado no seu navegador, lotes muito grandes usam mais memória e demoram um pouco mais em máquinas mais fracas, mas dentro do limite de 100 arquivos é rápido. Se você tiver mais de 100 arquivos, execute um segundo lote." },
      { q: "Posso soltar uma pasta que tenha arquivos que não sejam PDF?", a: "Sim. Você pode soltar uma pasta inteira e a ferramenta descarta automaticamente qualquer coisa que não seja PDF — imagens, planilhas e outros documentos são ignorados, então apenas seus PDFs são adicionados à lista. Você não precisa limpar a pasta primeiro." },
      { q: "O que acontece se dois arquivos ficassem com o mesmo nome?", a: "A ferramenta detecta isso automaticamente. Se um padrão numerado ou localizar e substituir produziria dois nomes de arquivo idênticos, ele adiciona um sufixo -1, -2 (e assim por diante) aos posteriores para que cada arquivo no ZIP mantenha um nome único. Nada é silenciosamente sobrescrito ou perdido." },
    ],
  },
  "batch-rotate-pdf": {
    title: "Rotacionar PDFs em lote — perguntas frequentes",
    items: [
      { q: "Como rotaciono um lote de PDFs?", a: "Arraste seus PDFs para a caixa — ou solte uma pasta inteira, ou use «Escolher pasta». Escolha um ângulo de rotação (90°, 180° ou 270°) e clique em «Rotacionar tudo». Quando terminar, clique em «Baixar ZIP» para obter todos os arquivos rotacionados em um único arquivo. Você também pode usar o botão «+» para adicionar mais PDFs antes de executar." },
      { q: "Meus arquivos são enviados a um servidor?", a: "Não. É uma ferramenta 100% do lado do cliente — cada PDF é aberto e rotacionado dentro do seu próprio navegador usando os recursos do seu dispositivo, e o ZIP também é montado localmente. Nada é jamais enviado ao DockDocs ou a qualquer outro lugar, então seus documentos nunca saem do seu computador." },
      { q: "O que recebo de volta e como os arquivos são nomeados?", a: "Você recebe um único arquivo ZIP (dockdocs-rotated.zip) contendo cada PDF rotacionado com sucesso. Cada arquivo mantém seu nome original com «-rotated» adicionado antes da extensão — por exemplo, fatura.pdf se torna fatura-rotated.pdf — então é fácil distinguir as novas cópias dos seus originais." },
      { q: "O que é rotacionado e posso rotacionar apenas algumas páginas?", a: "O ângulo escolhido é aplicado a todas as páginas de cada PDF do lote — esta é uma ferramenta de correção de pasta inteira, não um editor por página, então você não pode rotacionar páginas individuais aqui. A rotação também se soma a qualquer rotação existente, então aplicar 90° a uma página já rotacionada a gira mais 90°. Para controle por página, use nossa ferramenta de rotação de arquivo único." },
      { q: "Há limites e por que um PDF pode dizer «falhou»?", a: "Você pode adicionar até 50 PDFs por lote. Não há limite fixo de tamanho de arquivo — como tudo é executado no seu navegador, o limite real é a memória do seu dispositivo, então trabalhos grandes em um notebook ou celular mais fraco simplesmente ficam mais lentos. PDFs criptografados ou protegidos por senha não podem ser abertos para rotação, então são ignorados e marcados como «falhou»; o restante do lote ainda processa e apenas os arquivos bem-sucedidos entram no ZIP. Desbloqueie o arquivo primeiro e adicione-o novamente." },
      { q: "É gratuito? Preciso de uma conta?", a: "Sim, é completamente gratuito — sem cadastro, sem conta e sem marca d'água no seu resultado. Como todo o trabalho acontece no seu navegador, não há nada a pagar nem medidor de uso; basta abrir a página e começar a rotacionar." },
    ],
  },
  "batch-watermark-pdf": {
    title: "Marca d'água em PDFs em lote — perguntas frequentes",
    items: [
      { q: "Como adiciono marca d'água a uma pasta inteira de PDFs de uma vez?", a: "Arraste uma pasta (ou vários PDFs) para a caixa de upload, ou clique para escolher arquivos. Digite o texto da sua marca d'água — por exemplo, CONFIDENCIAL — e clique em «Aplicar a todos». Cada PDF é carimbado um por um e, quando terminar, clique em «Baixar ZIP» para obter todos os arquivos com marca d'água em um único arquivo compactado. Se você soltou uma pasta, quaisquer arquivos que não sejam PDF dentro dela são filtrados automaticamente, então você não precisa limpá-la primeiro." },
      { q: "Meus arquivos são enviados a um servidor?", a: "Não. Cada PDF é processado inteiramente no seu navegador, no seu próprio dispositivo — nada é enviado a qualquer servidor e não há conta ou login. Seus documentos nunca saem do seu computador, que é exatamente o motivo pelo qual é seguro para arquivos confidenciais." },
      { q: "O que recebo de volta e como os arquivos são nomeados?", a: "Você recebe um arquivo ZIP (dockdocs-batch.zip) com todos os PDFs com marca d'água. Cada saída mantém seu nome original com o sufixo «-watermarked.pdf» — então report.pdf se torna report-watermarked.pdf. Seus arquivos originais ficam intactos." },
      { q: "Há um limite de quantos PDFs posso fazer de uma vez?", a: "Esta ferramenta em lote processa até 30 PDFs por execução. Se você adicionar mais, apenas os primeiros 30 são mantidos. Não há limite fixo de tamanho de arquivo — como tudo é executado no seu navegador, o limite real é a memória do seu dispositivo, então arquivos muito grandes ou máquinas mais fracas simplesmente serão mais lentos. Para um trabalho maior, divida-o em lotes de 30." },
      { q: "É gratuito? Adiciona sua própria marca d'água ou marca?", a: "Sim, é completamente gratuito, sem cadastro, sem avaliação e sem limites de uso além do tamanho de lote de 30 arquivos por execução. A única marca d'água nos seus PDFs é o texto que você digita — o DockDocs nunca carimba seu próprio logotipo ou marca nos seus arquivos." },
      { q: "Posso escolher onde a marca d'água vai ou quão transparente ela é?", a: "Não na ferramenta em lote. Ela usa um posicionamento padrão fixo — uma marca d'água diagonal em cada página — para manter toda a pasta consistente. Se você precisar de posição, opacidade ou tamanho de fonte personalizados, use a ferramenta de Marca d'água de arquivo único, que lhe dá controle total sobre um documento de cada vez." },
    ],
  },
  "batch-page-numbers": {
    title: "Numeração de páginas em lote — perguntas frequentes",
    items: [
      { q: "Como adiciono números de página a um lote de PDFs?", a: "Arraste seus PDFs para a caixa de upload — ou solte uma pasta inteira, ou use «Escolher pasta». A ferramenta adiciona cada PDF à lista; em seguida, clique em «Aplicar a todos». Cada arquivo é numerado um por um e, quando terminar, clique em «Baixar ZIP» para obtê-los todos em um único arquivo compactado." },
      { q: "Meus arquivos são enviados para algum lugar?", a: "Não. É uma ferramenta 100% do lado do cliente — cada PDF é aberto e numerado dentro do seu próprio navegador, e nada é enviado a qualquer servidor. Seus arquivos nunca saem do seu dispositivo, e é por isso que funciona mesmo com documentos confidenciais." },
      { q: "O que recebo de volta e como os arquivos são nomeados?", a: "Você recebe um arquivo ZIP (chamado dockdocs-batch.zip) com cada PDF numerado com sucesso. Cada saída mantém seu nome original com o sufixo «-numbered.pdf» adicionado — então report.pdf se torna report-numbered.pdf. Apenas os arquivos que processaram com sucesso são incluídos; os que falharam são ignorados e o restante ainda passa." },
      { q: "Há limite de quantos arquivos posso fazer de uma vez e posso soltar uma pasta com arquivos não-PDF?", a: "Você pode processar até 30 PDFs por lote — o contador ao lado da lista mostra quantos você adicionou (por exemplo, «12 / 30 arquivos»). Não há limite rígido de tamanho, mas como tudo é executado no seu navegador, arquivos muito grandes ou numerosos usam mais memória e ficam mais lentos em dispositivos mais fracos. Você pode soltar com segurança uma pasta que também contenha imagens ou documentos do Word: a ferramenta mantém automaticamente apenas os PDFs reais e filtra todo o resto." },
      { q: "Posso escolher onde vão os números de página ou mudar o estilo?", a: "Não na ferramenta em lote — ela usa um posicionamento padrão fixo para manter toda a pasta consistente com um clique. Se você precisar controlar a posição, a fonte ou o número inicial, use a ferramenta de arquivo único «Adicionar números de página», que oferece essas opções." },
      { q: "É gratuito? Preciso de uma conta ou haverá marca d'água?", a: "É completamente gratuito, sem cadastro necessário, e nenhuma marca d'água é adicionada aos seus PDFs. Como tudo é executado localmente no seu navegador, não há nada a pagar nem cota de upload." },
    ],
  },
  "batch-split-merge": {
    title: "Dividir PDFs em lote — perguntas frequentes",
    items: [
      { q: "Como divido uma pasta inteira de PDFs de uma vez?", a: "Arraste e solte seus PDFs — ou uma pasta inteira — na caixa de upload, ou clique para escolhê-los. Defina «Páginas por arquivo» com quantas páginas cada parte de saída deve conter (1 divide cada página em seu próprio arquivo) e clique em «Executar». Cada PDF é cortado em blocos desse tamanho e tudo é empacotado em um único ZIP que você pode baixar com «Baixar ZIP»." },
      { q: "Meus arquivos são enviados a um servidor?", a: "Não. A divisão é executada inteiramente no seu navegador usando um mecanismo PDF local — nada é enviado, nada é armazenado e nada sai do seu dispositivo. Você pode até desconectar-se da internet depois que a página carregar e ainda funciona. É por isso que é seguro para documentos sensíveis ou confidenciais." },
      { q: "O que recebo de volta e como os arquivos são nomeados?", a: "Você recebe um arquivo ZIP (dockdocs-split.zip). Dentro, cada PDF é dividido em partes nomeadas a partir do original — por exemplo, report.pdf se torna report-part1.pdf, report-part2.pdf, e assim por diante. Se você enviou vários PDFs, todas as suas partes são agrupadas juntas no mesmo ZIP." },
      { q: "Posso adicionar uma pasta e o que acontece com arquivos não-PDF nela?", a: "Sim — você pode soltar ou escolher uma pasta inteira. Qualquer arquivo que não seja PDF é filtrado automaticamente, então você não precisa limpar a pasta primeiro. Apenas os PDFs são adicionados à lista e processados." },
      { q: "Há limite de quantos ou de tamanho dos arquivos?", a: "Há um limite de 50 arquivos por lote — se você adicionar mais, apenas os primeiros 50 são mantidos. Não há limite fixo de páginas ou tamanho de arquivo; a restrição real é a memória do seu dispositivo, então PDFs muito grandes ou lotes enormes simplesmente ficam mais lentos em máquinas mais fracas. Se um PDF estiver corrompido ou protegido por senha, ele é marcado como «falhou» e ignorado, enquanto o restante ainda divide normalmente." },
      { q: "É gratuito? Preciso de uma conta ou ele adiciona marca d'água?", a: "Sim, é completamente gratuito, sem cadastro e sem marca d'água. Como o trabalho acontece no seu próprio dispositivo, não há créditos de uso ou limites com os quais se preocupar — use quantas vezes quiser." },
    ],
  },
  "batch-summary": {
    title: "Resumo em lote — perguntas frequentes",
    items: [
      { q: "Como resumo vários PDFs de uma vez?", a: "Arraste e solte seus PDFs na zona de soltar, ou clique em «Escolher PDFs» para selecioná-los. Você pode adicionar até 5 arquivos de uma vez. Depois de carregados, clique em «Resumir tudo» — cada documento é resumido por vez e você verá uma contagem de progresso como 2/5 enquanto trabalha. Quando terminar, você obtém um resumo executivo mais pontos principais de cada arquivo." },
      { q: "Meu arquivo é enviado para algum lugar? Onde o trabalho acontece?", a: "Seu arquivo PDF nunca é enviado. O texto é extraído dentro do seu navegador e apenas esse texto extraído — não o arquivo original — é enviado ao nosso serviço de resumo de IA para gerar o resumo. Esta é uma ferramenta de IA, então precisa de conexão à internet para acessar o serviço de IA, mas o documento em si fica no seu dispositivo." },
      { q: "Diz «sem texto extraível (digitalização?)» em um dos meus arquivos. O que aconteceu?", a: "Isso significa que o PDF não tem uma camada de texto para ler — quase sempre é uma página digitalizada ou uma foto salva como PDF, que é apenas uma imagem para a ferramenta. Execute nossa ferramenta PDF OCR nela primeiro para adicionar uma camada de texto real e, em seguida, volte e resuma aqui. PDFs criptografados ou protegidos por senha também não extraem; remova a senha primeiro." },
      { q: "O que recebo de volta e posso salvar?", a: "Para cada PDF você obtém um breve resumo executivo mais uma lista de pontos principais, mostrados como um cartão na página. Depois que todos os arquivos estiverem prontos, clique em «Baixar tudo (.md)» para salvar tudo como um único arquivo Markdown (dockdocs-summaries.md) com uma seção por documento — fácil de colocar em suas notas, um documento ou um wiki." },
      { q: "Por que apenas 5 arquivos de uma vez e por que um de cada vez?", a: "Limitamos cada execução a 5 PDFs e os processamos um após o outro para permanecer dentro dos limites de uso justo e manter os resultados confiáveis em vez de sobrecarregar o serviço de IA. Se você tiver mais, execute um lote, clique em «Recomeçar» e carregue o próximo conjunto. Arquivos que falham são marcados individualmente, então um PDF ruim não impede o restante." },
      { q: "Os resumos parecem bons — posso confiar neles cegamente?", a: "Trate-os como uma primeira passagem rápida, não como substituto da leitura. Os resumos são gerados por IA de cada documento, então podem perder nuances ou ocasionalmente errar um detalhe — sempre faça uma verificação rápida com a fonte antes de confiar em qualquer coisa importante, especialmente em contratos ou relatórios." },
    ],
  },
  "batch-sort": {
    title: "Classificar PDFs — perguntas frequentes",
    items: [
      { q: "Como usar?", a: "Arraste e solte seus PDFs — ou uma pasta inteira — na página, ou clique em «Escolher PDFs» / «Escolher pasta». Pressione «Classificar tudo» e a IA rotula cada arquivo com uma categoria (fatura, contrato, currículo, relatório, etc.). Quando terminar, clique em «Baixar ZIP classificado» para obter um ZIP com seus arquivos agrupados em pastas de categoria. Você pode classificar até 30 arquivos de uma vez." },
      { q: "Meus arquivos são enviados a um servidor?", a: "Não — seus arquivos PDF reais nunca saem do seu dispositivo. Cada PDF é lido diretamente no seu navegador para extrair o texto e apenas esse texto extraído é enviado ao nosso serviço de IA para decidir a categoria. Os arquivos em si permanecem locais, e o ZIP final é gerado no seu navegador a partir dos seus originais." },
      { q: "Funciona com PDFs digitalizados ou fotos de documentos?", a: "Não diretamente. Um PDF digitalizado ou somente de imagem não tem camada de texto, então não há nada para ler — esses arquivos voltam marcados como «sem texto» e ficam em uma pasta «Não classificado». Execute-os primeiro pelo OCR (nossa ferramenta «OCR PDF» adiciona uma camada de texto) e depois classifique-os aqui." },
      { q: "Preciso de conexão à internet?", a: "Sim. O texto é extraído no seu dispositivo, mas a classificação real é feita pelo nosso serviço de IA online, então você precisa estar conectado. A extração de texto e o empacotamento final do ZIP acontecem localmente; apenas a decisão de categoria precisa da internet." },
      { q: "O que recebo de volta e meus arquivos originais são alterados?", a: "Você recebe um único ZIP chamado dockdocs-sorted.zip com uma subpasta por categoria e seus PDFs originais colocados dentro — intactos e sem modificação. Se dois arquivos ficassem com o mesmo nome na mesma pasta, adicionamos um sufixo «-1», «-2» para que nada seja sobrescrito." },
      { q: "Quão precisas são as categorias?", a: "As categorias são sugeridas pela IA a partir do texto de cada documento, então são um bom ponto de partida, mas vale uma verificação rápida — especialmente para documentos incomuns. Para ser rápido, a IA lê apenas as primeiras 6 páginas de cada PDF, o que é suficiente para a maioria dos arquivos, mas pode errar o tipo em um documento cujo tipo só fica claro mais adiante." },
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
      { q: "Como comparo documentos?", a: "Envie de 2 a 8 PDFs do mesmo tipo — orçamentos, faturas ou contratos — escolha o tipo e clique em «Comparar campos». O DockDocs alinha os termos principais (preço, entrega, pagamento, garantia, etc.) lado a lado em uma única tabela, com a linha de origem exata por trás de cada valor. Você também obtém uma recomendação com fontes sobre qual opção vence e pode fazer uma pergunta a todos os documentos de uma vez." },
      { q: "Meus arquivos são enviados ao seu servidor?", a: "Não — seus PDFs nunca saem do seu dispositivo. O DockDocs os lê diretamente no seu navegador para extrair o texto. Apenas esse texto simples extraído (não o arquivo em si) é enviado ao nosso servidor, onde a IA extrai e alinha os campos. Então o documento, seu layout e quaisquer dados incorporados ficam locais; o que viaja são as palavras na página." },
      { q: "Por que meu PDF diz «Não reconhecido (provavelmente digitalizado — precisa de OCR)»?", a: "Isso significa que o PDF não tem uma camada de texto selecionável — geralmente é uma digitalização ou uma foto de uma página, então não há nada para ler. Clique em «Extrair texto com OCR» nesse documento e o DockDocs executará o OCR no seu navegador para reconhecer o texto (as primeiras páginas) e, em seguida, você pode compará-lo como qualquer outro arquivo. PDFs criptografados ou protegidos por senha também não podem ser lidos até que sejam desbloqueados." },
      { q: "O que recebo de volta e posso confiar nos valores?", a: "Você obtém uma tabela comparativa onde cada célula mostra o valor mais a linha de origem exata da qual veio — e essa linha é verificada para realmente aparecer no seu documento, então nada é inventado. Clique em qualquer linha de origem para ir a um trecho destacado do texto original. Se um documento simplesmente não declara algo, você verá «Não reconhecido» em vez de uma suposição. Uma ressalva: a recomendação geral é o raciocínio da IA sobre esses números e não é verificada individualmente por fonte, então confirme os valores na tabela antes de decidir." },
      { q: "Há limite de quantidade ou tamanho de arquivos?", a: "Você pode comparar até 8 PDFs de uma vez e precisa de pelo menos 2 legíveis para a comparação funcionar. Para o recurso «perguntar em todos os documentos», o texto combinado de todos os documentos deve ficar abaixo de 60.000 caracteres e sua pergunta abaixo de 500 caracteres — se exceder, use documentos menos numerosos ou mais curtos. A ferramenta precisa de conexão à internet, pois a extração de campos e a recomendação são executadas no nosso servidor." },
      { q: "É gratuito?", a: "Sim — você pode enviar seus PDFs, executar a comparação lado a lado, obter a recomendação e fazer perguntas em seus documentos. O OCR no navegador para arquivos digitalizados também é gratuito, pois é executado localmente no seu dispositivo. O mecanismo de comparação está em versão beta, então o comportamento pode continuar melhorando." },
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

export function ToolFaq({ tool, locale = "en" }: { tool: string; locale?: Locale }) {
  if (locale === "pt") {
    const ptData = FAQS_PT[tool];
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
  if (locale === "fr") return null;
  const data = FAQS[tool];
  if (!data) return null;
  const items = data.items[locale] ?? data.items.en;
  return (
    <section className="mx-auto mt-12 border-t border-[color:var(--line)] pt-10">
      <h2 className="text-[22px] font-normal tracking-[-0.02em] text-[color:var(--foreground)] sm:text-[26px]">{data.title[locale] ?? data.title.en}</h2>
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
