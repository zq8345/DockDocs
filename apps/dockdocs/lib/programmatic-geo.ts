import type { Metadata } from "next";
import { absoluteUrl, siteUrl, type Locale } from "@/lib/i18n";

export type ProgrammaticGeoSurface = "guides" | "resources";

export type GeoQueryIntent =
  | "conversational"
  | "workflow"
  | "comparison"
  | "device"
  | "beginner"
  | "professional";

export type GeoSemanticCluster =
  | "pdf-compression"
  | "pdf-merge"
  | "pdf-split"
  | "ocr-pdf"
  | "jpg-to-pdf"
  | "pdf-to-word"
  | "ai-pdf";

export type GeoQueryDefinition = {
  id: string;
  cluster: GeoSemanticCluster;
  intent: GeoQueryIntent;
  query: string;
  zhQuery: string;
  relatedTool: string;
  relatedWorkflow: string;
};

type QueryFamily = {
  cluster: GeoSemanticCluster;
  relatedTool: string;
  relatedWorkflow: string;
  action: string;
  object: string;
  output: string;
  zhAction: string;
  zhObject: string;
  zhOutput: string;
};

const queryFamilies: QueryFamily[] = [
  {
    cluster: "pdf-compression",
    relatedTool: "/compress-pdf/",
    relatedWorkflow: "reduce PDF file size",
    action: "compress",
    object: "a PDF",
    output: "a smaller PDF",
    zhAction: "压缩",
    zhObject: "PDF",
    zhOutput: "更小的 PDF",
  },
  {
    cluster: "pdf-merge",
    relatedTool: "/merge-pdf/",
    relatedWorkflow: "combine PDF files",
    action: "merge",
    object: "PDF files",
    output: "one organized PDF",
    zhAction: "合并",
    zhObject: "多个 PDF",
    zhOutput: "一个整理好的 PDF",
  },
  {
    cluster: "pdf-split",
    relatedTool: "/split-pdf/",
    relatedWorkflow: "extract PDF pages",
    action: "split",
    object: "a PDF",
    output: "separate page ranges",
    zhAction: "拆分",
    zhObject: "PDF",
    zhOutput: "独立页面或范围",
  },
  {
    cluster: "ocr-pdf",
    relatedTool: "/ocr-pdf/",
    relatedWorkflow: "extract text from scanned PDFs",
    action: "OCR",
    object: "a scanned PDF",
    output: "searchable text",
    zhAction: "OCR 识别",
    zhObject: "扫描 PDF",
    zhOutput: "可搜索文本",
  },
  {
    cluster: "jpg-to-pdf",
    relatedTool: "/jpg-to-pdf/",
    relatedWorkflow: "convert images to PDF",
    action: "convert",
    object: "JPG images",
    output: "a PDF document",
    zhAction: "转换",
    zhObject: "JPG 图片",
    zhOutput: "PDF 文档",
  },
  {
    cluster: "pdf-to-word",
    relatedTool: "/pdf-to-word/",
    relatedWorkflow: "convert PDF to editable Word",
    action: "convert",
    object: "a PDF",
    output: "an editable Word document",
    zhAction: "转换",
    zhObject: "PDF",
    zhOutput: "可编辑 Word 文档",
  },
  {
    cluster: "ai-pdf",
    relatedTool: "/ai-workspace/",
    relatedWorkflow: "use AI with PDF documents",
    action: "summarize and review",
    object: "PDF documents",
    output: "AI-ready document insights",
    zhAction: "总结和审阅",
    zhObject: "PDF 文档",
    zhOutput: "AI-ready 文档洞察",
  },
];

const queryTemplates: Array<{
  intent: GeoQueryIntent;
  en: (family: QueryFamily) => string;
  zh: (family: QueryFamily) => string;
}> = [
  {
    intent: "conversational",
    en: ({ action, object }) => `How do I ${action} ${object} online?`,
    zh: ({ zhAction, zhObject }) => `如何在线${zhAction}${zhObject}？`,
  },
  {
    intent: "conversational",
    en: ({ object, output }) => `What is the fastest way to turn ${object} into ${output}?`,
    zh: ({ zhObject, zhOutput }) => `把${zhObject}变成${zhOutput}最快的方法是什么？`,
  },
  {
    intent: "workflow",
    en: ({ action, object }) => `What is the best workflow to ${action} ${object}?`,
    zh: ({ zhAction, zhObject }) => `${zhAction}${zhObject}的最佳工作流是什么？`,
  },
  {
    intent: "workflow",
    en: ({ object, output }) => `How should I prepare ${object} before exporting ${output}?`,
    zh: ({ zhObject, zhOutput }) => `导出${zhOutput}前应该如何准备${zhObject}？`,
  },
  {
    intent: "comparison",
    en: ({ action, object }) => `Should I ${action} ${object} before using another PDF tool?`,
    zh: ({ zhAction, zhObject }) => `使用其它 PDF 工具前应该先${zhAction}${zhObject}吗？`,
  },
  {
    intent: "comparison",
    en: ({ relatedWorkflow }) => `What is the difference between ${relatedWorkflow} and an AI PDF workflow?`,
    zh: ({ relatedWorkflow }) => `${relatedWorkflow} 和 AI PDF 工作流有什么区别？`,
  },
  {
    intent: "device",
    en: ({ action, object }) => `Can I ${action} ${object} on iPhone?`,
    zh: ({ zhAction, zhObject }) => `可以在 iPhone 上${zhAction}${zhObject}吗？`,
  },
  {
    intent: "device",
    en: ({ action, object }) => `Can I ${action} ${object} on Android or mobile?`,
    zh: ({ zhAction, zhObject }) => `可以在 Android 或手机上${zhAction}${zhObject}吗？`,
  },
  {
    intent: "beginner",
    en: ({ action, object }) => `Beginner guide to ${action} ${object}`,
    zh: ({ zhAction, zhObject }) => `${zhAction}${zhObject}新手指南`,
  },
  {
    intent: "beginner",
    en: ({ object }) => `What should I know before uploading ${object}?`,
    zh: ({ zhObject }) => `上传${zhObject}前需要知道什么？`,
  },
  {
    intent: "professional",
    en: ({ relatedWorkflow }) => `How do professionals use ${relatedWorkflow} for client documents?`,
    zh: ({ relatedWorkflow }) => `专业人士如何用 ${relatedWorkflow} 处理客户文档？`,
  },
  {
    intent: "professional",
    en: ({ action, object }) => `How do teams ${action} ${object} for business workflows?`,
    zh: ({ zhAction, zhObject }) => `团队如何为业务工作流${zhAction}${zhObject}？`,
  },
  {
    intent: "workflow",
    en: ({ object }) => `How do I keep ${object} readable after processing?`,
    zh: ({ zhObject }) => `处理后如何保持${zhObject}可读？`,
  },
  {
    intent: "comparison",
    en: ({ output }) => `Is ${output} better than keeping the original PDF?`,
    zh: ({ zhOutput }) => `${zhOutput}比保留原始 PDF 更好吗？`,
  },
  {
    intent: "conversational",
    en: ({ object }) => `Can DockDocs help with ${object}?`,
    zh: ({ zhObject }) => `DockDocs 可以处理${zhObject}吗？`,
  },
  {
    intent: "workflow",
    en: ({ output }) => `How do I verify ${output} before sharing it?`,
    zh: ({ zhOutput }) => `分享前如何检查${zhOutput}？`,
  },
];

export const geoQueries: GeoQueryDefinition[] = queryFamilies.flatMap((family) =>
  queryTemplates.map((template, index) => ({
    id: `${family.cluster}-${template.intent}-${index + 1}`,
    cluster: family.cluster,
    intent: template.intent,
    query: template.en(family),
    zhQuery: template.zh(family),
    relatedTool: family.relatedTool,
    relatedWorkflow: family.relatedWorkflow,
  })),
);

export type ProgrammaticGeoPageSeed = {
  surface: ProgrammaticGeoSurface;
  slug: string;
  cluster: GeoSemanticCluster;
  toolHref: string;
  enTitle: string;
  zhTitle: string;
  enDescription: string;
  zhDescription: string;
  enQuestion: string;
  zhQuestion: string;
  enAnswer: string;
  zhAnswer: string;
  enSteps: string[];
  zhSteps: string[];
};

export type ProgrammaticGeoPageData = {
  surface: ProgrammaticGeoSurface;
  slug: string;
  cluster: GeoSemanticCluster;
  title: string;
  description: string;
  question: string;
  answer: string;
  steps: string[];
  toolHref: string;
  toolLabel: string;
  workflowSummary: string;
  comparisonRows: Array<[string, string]>;
  faqs: Array<{ question: string; answer: string }>;
  relatedPages: Array<{ title: string; href: string; description: string }>;
  relatedTools: Array<{ label: string; href: string; description: string }>;
};

export const programmaticGeoPageSeeds: ProgrammaticGeoPageSeed[] = [
  {
    surface: "guides",
    slug: "compress-pdf-for-gmail",
    cluster: "pdf-compression",
    toolHref: "/compress-pdf/",
    enTitle: "How to Compress PDF for Gmail | DockDocs",
    zhTitle: "如何为 Gmail 压缩 PDF | DockDocs",
    enDescription: "A quick workflow for compressing PDF files before attaching them to Gmail messages.",
    zhDescription: "用于在 Gmail 附件发送前压缩 PDF 文件的快速工作流。",
    enQuestion: "How do I compress a PDF for Gmail?",
    zhQuestion: "如何为 Gmail 压缩 PDF？",
    enAnswer: "Compress the PDF, open the result, check readability, then attach the smaller file to Gmail.",
    zhAnswer: "先压缩 PDF，打开结果检查可读性，然后把更小的文件添加到 Gmail 附件。",
    enSteps: ["Upload the PDF.", "Run compression.", "Download the compressed PDF.", "Open the file and check readability.", "Attach it to Gmail."],
    zhSteps: ["上传 PDF。", "运行压缩。", "下载压缩后的 PDF。", "打开文件检查可读性。", "添加到 Gmail 附件。"],
  },
  {
    surface: "guides",
    slug: "reduce-pdf-size-without-losing-quality",
    cluster: "pdf-compression",
    toolHref: "/compress-pdf/",
    enTitle: "Reduce PDF Size Without Losing Quality | DockDocs",
    zhTitle: "在不明显损失质量的情况下减小 PDF | DockDocs",
    enDescription: "Learn how to reduce PDF file size while preserving readable text, images, and scan quality.",
    zhDescription: "了解如何在保持文字、图片和扫描清晰度的同时减小 PDF 文件体积。",
    enQuestion: "How do I reduce PDF size without losing quality?",
    zhQuestion: "如何在不明显损失质量的情况下减小 PDF？",
    enAnswer: "Use moderate compression, avoid repeated compression passes, and check pages with small text before sharing.",
    zhAnswer: "使用适度压缩，避免反复压缩，并在分享前检查包含小字的页面。",
    enSteps: ["Identify whether the PDF is text-based or scanned.", "Compress once.", "Review small text, tables, and signatures.", "Use split or OCR if compression is not enough."],
    zhSteps: ["判断 PDF 是文本型还是扫描型。", "只压缩一次。", "检查小字、表格和签名。", "如果压缩仍不够，再使用拆分或 OCR。"],
  },
  {
    surface: "guides",
    slug: "merge-pdfs-without-losing-quality",
    cluster: "pdf-merge",
    toolHref: "/merge-pdf/",
    enTitle: "Merge PDFs Without Losing Quality | DockDocs",
    zhTitle: "如何在不降低质量的情况下合并 PDF | DockDocs",
    enDescription: "Combine multiple PDF files into one organized packet while preserving document readability.",
    zhDescription: "将多个 PDF 合并为一个文档包，同时保持文档可读性。",
    enQuestion: "How do I merge PDFs without losing quality?",
    zhQuestion: "如何在不降低质量的情况下合并 PDF？",
    enAnswer: "Merge the original PDFs directly, keep the order clear, and compress only after merging if the final packet is too large.",
    zhAnswer: "直接合并原始 PDF，保持顺序清晰；如果最终文件太大，再在合并后压缩。",
    enSteps: ["Upload all PDFs.", "Arrange the order.", "Merge into one packet.", "Open the merged PDF and verify pages."],
    zhSteps: ["上传所有 PDF。", "调整顺序。", "合并为一个文档包。", "打开合并结果检查页面。"],
  },
  {
    surface: "guides",
    slug: "split-pdf-page-ranges",
    cluster: "pdf-split",
    toolHref: "/split-pdf/",
    enTitle: "Split PDF Page Ranges Online | DockDocs",
    zhTitle: "在线按页面范围拆分 PDF | DockDocs",
    enDescription: "Extract specific PDF pages or ranges into smaller files for review, upload, and sharing.",
    zhDescription: "提取指定 PDF 页面或范围，用于审阅、上传和共享。",
    enQuestion: "How do I split PDF page ranges?",
    zhQuestion: "如何按页面范围拆分 PDF？",
    enAnswer: "Upload the PDF, enter the page ranges you need, then export the selected pages as smaller files.",
    zhAnswer: "上传 PDF，输入需要的页面范围，然后导出更小的页面文件。",
    enSteps: ["Upload one PDF.", "Decide the page ranges.", "Enter ranges such as 1-4 or 10-12.", "Export the selected pages."],
    zhSteps: ["上传一个 PDF。", "确定页面范围。", "输入 1-4 或 10-12 等范围。", "导出所选页面。"],
  },
  {
    surface: "guides",
    slug: "ocr-scanned-pdf-online",
    cluster: "ocr-pdf",
    toolHref: "/ocr-pdf/",
    enTitle: "OCR Scanned PDF Online | DockDocs",
    zhTitle: "在线 OCR 扫描 PDF | DockDocs",
    enDescription: "Use OCR workflows to extract text from scanned PDFs and make documents easier to search.",
    zhDescription: "使用 OCR 工作流从扫描 PDF 中提取文本，让文档更易搜索。",
    enQuestion: "Can I OCR scanned PDFs online?",
    zhQuestion: "可以在线 OCR 扫描 PDF 吗？",
    enAnswer: "Yes. Upload a scanned PDF, run OCR, review the extracted text, then copy or download the text output.",
    zhAnswer: "可以。上传扫描 PDF，运行 OCR，检查提取文本，然后复制或下载文本结果。",
    enSteps: ["Upload a scanned PDF.", "Run OCR processing.", "Review the extracted text.", "Copy or download the output."],
    zhSteps: ["上传扫描 PDF。", "运行 OCR 处理。", "检查提取文本。", "复制或下载结果。"],
  },
  {
    surface: "guides",
    slug: "extract-text-from-pdf-with-ocr",
    cluster: "ocr-pdf",
    toolHref: "/ocr-pdf/",
    enTitle: "Extract Text from PDF with OCR | DockDocs",
    zhTitle: "使用 OCR 从 PDF 提取文字 | DockDocs",
    enDescription: "A practical guide for turning image-based PDF content into reusable text.",
    zhDescription: "将图片型 PDF 内容转成可复用文本的实用指南。",
    enQuestion: "How do I extract text from a PDF with OCR?",
    zhQuestion: "如何使用 OCR 从 PDF 提取文字？",
    enAnswer: "Use OCR when the PDF is scanned or image-based, then verify the text before using it in important documents.",
    zhAnswer: "当 PDF 是扫描件或图片型文档时使用 OCR，并在重要场景使用前检查文本。",
    enSteps: ["Check whether text is selectable.", "Upload the scanned PDF.", "Run OCR.", "Review and clean the extracted text."],
    zhSteps: ["检查文字是否可选中。", "上传扫描 PDF。", "运行 OCR。", "检查并整理提取文本。"],
  },
  {
    surface: "guides",
    slug: "jpg-to-pdf-on-iphone",
    cluster: "jpg-to-pdf",
    toolHref: "/jpg-to-pdf/",
    enTitle: "Best JPG to PDF Workflow on iPhone | DockDocs",
    zhTitle: "iPhone 上最佳 JPG 转 PDF 工作流 | DockDocs",
    enDescription: "Turn iPhone photos, receipts, and scans into a clean PDF document workflow.",
    zhDescription: "将 iPhone 照片、收据和扫描图整理为清晰的 PDF 文档。",
    enQuestion: "What is the best JPG to PDF workflow on iPhone?",
    zhQuestion: "iPhone 上最佳 JPG 转 PDF 工作流是什么？",
    enAnswer: "Select the images, arrange them in page order, export one PDF, then open the file to confirm the order.",
    zhAnswer: "选择图片，按页面顺序排列，导出一个 PDF，然后打开文件确认顺序。",
    enSteps: ["Choose JPG or PNG images.", "Arrange page order.", "Export a PDF.", "Open the PDF before sharing."],
    zhSteps: ["选择 JPG 或 PNG 图片。", "调整页面顺序。", "导出 PDF。", "分享前打开 PDF 检查。"],
  },
  {
    surface: "guides",
    slug: "convert-images-to-pdf-for-upload",
    cluster: "jpg-to-pdf",
    toolHref: "/jpg-to-pdf/",
    enTitle: "Convert Images to PDF for Upload | DockDocs",
    zhTitle: "将图片转换为 PDF 以便上传 | DockDocs",
    enDescription: "Prepare image files as one PDF for portals, forms, school tasks, and client handoff.",
    zhDescription: "将图片文件整理为一个 PDF，用于门户、表单、学校任务和客户交付。",
    enQuestion: "How do I convert images to PDF for upload?",
    zhQuestion: "如何将图片转换为 PDF 以便上传？",
    enAnswer: "Convert images into one ordered PDF so upload portals receive a single document instead of loose files.",
    zhAnswer: "将图片转换为一个有序 PDF，让上传门户接收一个文档，而不是零散文件。",
    enSteps: ["Collect the images.", "Remove blurry duplicates.", "Arrange pages.", "Export one PDF for upload."],
    zhSteps: ["收集图片。", "删除模糊或重复图片。", "调整页面顺序。", "导出一个用于上传的 PDF。"],
  },
  {
    surface: "guides",
    slug: "pdf-to-word-editable-document",
    cluster: "pdf-to-word",
    toolHref: "/pdf-to-word/",
    enTitle: "PDF to Word Editable Document Workflow | DockDocs",
    zhTitle: "PDF 转可编辑 Word 文档工作流 | DockDocs",
    enDescription: "Convert fixed PDF files into editable Word-style document workflows.",
    zhDescription: "将固定 PDF 文件转换为可编辑的 Word 风格文档工作流。",
    enQuestion: "How do I convert a PDF to an editable Word document?",
    zhQuestion: "如何将 PDF 转换为可编辑 Word 文档？",
    enAnswer: "Use PDF to Word when the document needs editing, then review headings, paragraphs, and tables after conversion.",
    zhAnswer: "当文档需要编辑时使用 PDF 转 Word，并在转换后检查标题、段落和表格。",
    enSteps: ["Upload the PDF.", "Convert to Word format.", "Review text structure.", "Edit and save the document."],
    zhSteps: ["上传 PDF。", "转换为 Word 格式。", "检查文本结构。", "编辑并保存文档。"],
  },
  {
    surface: "guides",
    slug: "ai-summarize-pdf-documents",
    cluster: "ai-pdf",
    toolHref: "/ai-workspace/",
    enTitle: "Can AI Summarize PDF Documents? | DockDocs",
    zhTitle: "AI 可以总结 PDF 文档吗？| DockDocs",
    enDescription: "Understand when AI PDF summaries help and when documents still need human review.",
    zhDescription: "了解 AI PDF 摘要何时有帮助，以及哪些文档仍需人工复核。",
    enQuestion: "Can AI summarize PDF documents?",
    zhQuestion: "AI 可以总结 PDF 文档吗？",
    enAnswer: "AI can help summarize long PDFs, but users should verify important facts, numbers, obligations, and dates.",
    zhAnswer: "AI 可以帮助总结长 PDF，但重要事实、数字、义务和日期仍需用户核对。",
    enSteps: ["Prepare a readable PDF.", "Run OCR first if it is scanned.", "Generate a summary.", "Verify key claims before using the output."],
    zhSteps: ["准备可读 PDF。", "如果是扫描件先运行 OCR。", "生成摘要。", "使用前核对关键内容。"],
  },
  {
    surface: "guides",
    slug: "chat-with-pdf-workflow",
    cluster: "ai-pdf",
    toolHref: "/ai-workspace/",
    enTitle: "Chat with PDF Workflow | DockDocs",
    zhTitle: "Chat with PDF 工作流 | DockDocs",
    enDescription: "A practical AI PDF workflow for asking questions about clauses, dates, tables, and document evidence.",
    zhDescription: "用于询问条款、日期、表格和文档证据的 AI PDF 工作流。",
    enQuestion: "How does Chat with PDF fit into document work?",
    zhQuestion: "Chat with PDF 如何融入文档工作？",
    enAnswer: "Chat with PDF is useful after the document is prepared, readable, and ready for question-answer review.",
    zhAnswer: "当文档已经准备好、可读并适合问答审阅时，Chat with PDF 最有用。",
    enSteps: ["Prepare the PDF.", "Run OCR if needed.", "Ask focused questions.", "Check answers against the source document."],
    zhSteps: ["准备 PDF。", "如有需要先 OCR。", "提出具体问题。", "对照原文检查答案。"],
  },
  {
    surface: "resources",
    slug: "pdf-compression-workflow-questions",
    cluster: "pdf-compression",
    toolHref: "/compress-pdf/",
    enTitle: "PDF Compression Workflow Questions | DockDocs",
    zhTitle: "PDF 压缩工作流问题 | DockDocs",
    enDescription: "A GEO resource hub for PDF compression questions, file-size reduction, and quality checks.",
    zhDescription: "面向 PDF 压缩、减小体积和质量检查问题的 GEO 资源中心。",
    enQuestion: "What should I know about PDF compression workflows?",
    zhQuestion: "PDF 压缩工作流需要了解什么？",
    enAnswer: "PDF compression is best when the goal is smaller files while preserving enough readability for the recipient.",
    zhAnswer: "PDF 压缩适用于在保持足够可读性的同时获得更小文件。",
    enSteps: ["Define the size target.", "Compress once.", "Review readability.", "Use split or OCR if needed."],
    zhSteps: ["确定体积目标。", "压缩一次。", "检查可读性。", "必要时使用拆分或 OCR。"],
  },
  {
    surface: "resources",
    slug: "ocr-pdf-workflow-questions",
    cluster: "ocr-pdf",
    toolHref: "/ocr-pdf/",
    enTitle: "OCR PDF Workflow Questions | DockDocs",
    zhTitle: "OCR PDF 工作流问题 | DockDocs",
    enDescription: "A GEO resource hub for OCR questions, scanned PDFs, and text extraction workflows.",
    zhDescription: "面向 OCR、扫描 PDF 和文本提取工作流问题的 GEO 资源中心。",
    enQuestion: "What should I know before using OCR on PDF files?",
    zhQuestion: "对 PDF 使用 OCR 前需要了解什么？",
    enAnswer: "OCR works best with clear scans, strong contrast, straight pages, and visible text.",
    zhAnswer: "OCR 最适合清晰扫描、对比度高、页面平直且文字可见的文档。",
    enSteps: ["Check scan quality.", "Upload the PDF.", "Run OCR.", "Review and correct extracted text."],
    zhSteps: ["检查扫描质量。", "上传 PDF。", "运行 OCR。", "检查并修正提取文本。"],
  },
  {
    surface: "resources",
    slug: "ai-pdf-workflow-questions",
    cluster: "ai-pdf",
    toolHref: "/ai-workspace/",
    enTitle: "AI PDF Workflow Questions | DockDocs",
    zhTitle: "AI PDF 工作流问题 | DockDocs",
    enDescription: "A GEO resource hub for AI PDF summaries, Chat with PDF, OCR, and document review workflows.",
    zhDescription: "面向 AI PDF 摘要、PDF 问答、OCR 和文档审阅工作流的 GEO 资源中心。",
    enQuestion: "How should AI fit into PDF workflows?",
    zhQuestion: "AI 应该如何融入 PDF 工作流？",
    enAnswer: "AI should enhance PDF workflows after the document task is clear, especially for OCR, summaries, and question-answer review.",
    zhAnswer: "AI 应在文档任务明确后增强 PDF 工作流，尤其适用于 OCR、摘要和问答审阅。",
    enSteps: ["Choose the PDF task first.", "Prepare or convert the file.", "Use AI for understanding.", "Verify important outputs."],
    zhSteps: ["先选择 PDF 任务。", "准备或转换文件。", "使用 AI 理解内容。", "核对重要输出。"],
  },
  {
    surface: "resources",
    slug: "image-to-pdf-conversion-questions",
    cluster: "jpg-to-pdf",
    toolHref: "/jpg-to-pdf/",
    enTitle: "Image to PDF Conversion Questions | DockDocs",
    zhTitle: "图片转 PDF 转换问题 | DockDocs",
    enDescription: "A GEO resource hub for JPG to PDF, image upload, page order, and document conversion questions.",
    zhDescription: "面向 JPG 转 PDF、图片上传、页面顺序和文档转换问题的 GEO 资源中心。",
    enQuestion: "What is the best way to convert images to PDF?",
    zhQuestion: "将图片转换为 PDF 的最佳方式是什么？",
    enAnswer: "Convert images to one ordered PDF when a portal, client, or workflow expects a single document.",
    zhAnswer: "当门户、客户或工作流需要单个文档时，将图片转换为一个有序 PDF。",
    enSteps: ["Collect image files.", "Arrange order.", "Export one PDF.", "Open and verify the page sequence."],
    zhSteps: ["收集图片文件。", "调整顺序。", "导出一个 PDF。", "打开并检查页面顺序。"],
  },
];

const toolLabels: Record<string, { en: string; zh: string; description: string; zhDescription: string }> = {
  "/compress-pdf/": {
    en: "Compress PDF",
    zh: "压缩 PDF",
    description: "Reduce PDF size for email, upload portals, and sharing.",
    zhDescription: "减小 PDF 体积，便于邮件、上传门户和共享。",
  },
  "/merge-pdf/": {
    en: "Merge PDF",
    zh: "合并 PDF",
    description: "Combine multiple PDFs into one organized packet.",
    zhDescription: "将多个 PDF 合并为一个整理好的文档包。",
  },
  "/split-pdf/": {
    en: "Split PDF",
    zh: "拆分 PDF",
    description: "Extract pages or page ranges from larger PDFs.",
    zhDescription: "从较大的 PDF 中提取页面或页面范围。",
  },
  "/ocr-pdf/": {
    en: "OCR PDF",
    zh: "OCR PDF",
    description: "Extract text from scanned and image-based PDFs.",
    zhDescription: "从扫描件和图片型 PDF 中提取文本。",
  },
  "/jpg-to-pdf/": {
    en: "JPG to PDF",
    zh: "JPG 转 PDF",
    description: "Convert JPG, PNG, and WebP images into PDF documents.",
    zhDescription: "将 JPG、PNG 和 WebP 图片转换为 PDF 文档。",
  },
  "/pdf-to-word/": {
    en: "PDF to Word",
    zh: "PDF 转 Word",
    description: "Prepare PDFs for editable Word document workflows.",
    zhDescription: "将 PDF 准备为可编辑 Word 文档工作流。",
  },
  "/ai-workspace/": {
    en: "AI Workspace",
    zh: "AI 工作区",
    description: "Use AI for OCR, summaries, Chat with PDF, and review workflows.",
    zhDescription: "使用 AI 进行 OCR、摘要、PDF 问答和审阅工作流。",
  },
};

const clusterLabels: Record<GeoSemanticCluster, { en: string; zh: string }> = {
  "pdf-compression": { en: "PDF compression cluster", zh: "PDF 压缩集群" },
  "pdf-merge": { en: "PDF merge cluster", zh: "PDF 合并集群" },
  "pdf-split": { en: "PDF split cluster", zh: "PDF 拆分集群" },
  "ocr-pdf": { en: "OCR PDF cluster", zh: "OCR PDF 集群" },
  "jpg-to-pdf": { en: "JPG to PDF cluster", zh: "JPG 转 PDF 集群" },
  "pdf-to-word": { en: "PDF to Word cluster", zh: "PDF 转 Word 集群" },
  "ai-pdf": { en: "AI PDF cluster", zh: "AI PDF 集群" },
};

export function getProgrammaticGeoQueryCount() {
  return geoQueries.length;
}

export function getProgrammaticGeoPageSeeds(surface?: ProgrammaticGeoSurface) {
  return surface
    ? programmaticGeoPageSeeds.filter((page) => page.surface === surface)
    : programmaticGeoPageSeeds;
}

export function getProgrammaticGeoPage(
  locale: Locale,
  surface: ProgrammaticGeoSurface,
  slug: string,
): ProgrammaticGeoPageData | null {
  const seed = programmaticGeoPageSeeds.find(
    (page) => page.surface === surface && page.slug === slug,
  );

  if (!seed) {
    return null;
  }

  const tool = toolLabels[seed.toolHref];
  const relatedPages = programmaticGeoPageSeeds
    .filter((page) => page.cluster === seed.cluster && page.slug !== seed.slug)
    .slice(0, 4)
    .map((page) => ({
      title: locale === "zh" ? page.zhTitle : page.enTitle,
      href: programmaticGeoPath(page.surface, page.slug),
      description: locale === "zh" ? page.zhDescription : page.enDescription,
    }));

  return {
    surface,
    slug,
    cluster: seed.cluster,
    title: locale === "zh" ? seed.zhTitle : seed.enTitle,
    description: locale === "zh" ? seed.zhDescription : seed.enDescription,
    question: locale === "zh" ? seed.zhQuestion : seed.enQuestion,
    answer: locale === "zh" ? seed.zhAnswer : seed.enAnswer,
    steps: locale === "zh" ? seed.zhSteps : seed.enSteps,
    toolHref: seed.toolHref,
    toolLabel: locale === "zh" ? tool.zh : tool.en,
    workflowSummary:
      locale === "zh"
        ? `${clusterLabels[seed.cluster].zh}将常见问题、工具步骤和相关工作流连接起来，帮助用户和 AI answer engines 快速理解页面用途。`
        : `${clusterLabels[seed.cluster].en} connects common questions, tool steps, and related workflows so users and AI answer engines can understand the page quickly.`,
    comparisonRows:
      locale === "zh"
        ? [
            ["适用场景", "当用户需要完成具体 PDF 任务并理解下一步时。"],
            ["推荐工具", tool.zh],
            ["AI 角色", "AI 作为 OCR、摘要、问答或审阅增强层。"],
          ]
        : [
            ["Best for", "A specific PDF task with a clear next step."],
            ["Recommended tool", tool.en],
            ["AI role", "An enhancement layer for OCR, summaries, Q&A, or review."],
          ],
    faqs: createFaqs(seed, locale),
    relatedPages,
    relatedTools: [
      {
        label: locale === "zh" ? tool.zh : tool.en,
        href: seed.toolHref,
        description: locale === "zh" ? tool.zhDescription : tool.description,
      },
      {
        label: locale === "zh" ? "资源中心" : "Resources",
        href: "/resources/",
        description:
          locale === "zh"
            ? "浏览 PDF、OCR、转换和 AI 文档工作流资源。"
            : "Browse PDF, OCR, conversion, and AI document workflow resources.",
      },
      {
        label: locale === "zh" ? "帮助中心" : "Help Center",
        href: "/help/",
        description:
          locale === "zh"
            ? "了解上传、隐私、格式和 AI 限制。"
            : "Understand uploads, privacy, formats, and AI limits.",
      },
    ],
  };
}

export function programmaticGeoPath(
  surface: ProgrammaticGeoSurface,
  slug: string,
  locale?: Locale,
) {
  const path = `/${surface}/${slug}/`;
  return locale ? `/${locale}${path}` : path;
}

export function programmaticGeoAlternates(
  surface: ProgrammaticGeoSurface,
  slug: string,
) {
  return {
    en: absoluteUrl(programmaticGeoPath(surface, slug, "en")),
    zh: absoluteUrl(programmaticGeoPath(surface, slug, "zh")),
    "x-default": absoluteUrl(programmaticGeoPath(surface, slug)),
  };
}

export function createProgrammaticGeoMetadata(
  page: ProgrammaticGeoPageData,
  locale: Locale,
  useLocalePrefix = false,
): Metadata {
  const canonicalPath = programmaticGeoPath(
    page.surface,
    page.slug,
    useLocalePrefix ? locale : undefined,
  );

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: canonicalPath,
      languages: programmaticGeoAlternates(page.surface, page.slug),
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url: absoluteUrl(canonicalPath),
      siteName: "DockDocs",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function getClusterPages(cluster: GeoSemanticCluster) {
  return programmaticGeoPageSeeds.filter((page) => page.cluster === cluster);
}

export function getGeoQueryClusterSummary() {
  return queryFamilies.map((family) => ({
    cluster: family.cluster,
    count: geoQueries.filter((query) => query.cluster === family.cluster).length,
    relatedTool: family.relatedTool,
    relatedWorkflow: family.relatedWorkflow,
  }));
}

function createFaqs(seed: ProgrammaticGeoPageSeed, locale: Locale) {
  if (locale === "zh") {
    return [
      { question: seed.zhQuestion, answer: seed.zhAnswer },
      {
        question: "这个工作流适合新手吗？",
        answer: "适合。页面使用快速答案、步骤、对比表和相关工具链接，让新用户能先理解任务再打开工具。",
      },
      {
        question: "AI 在这个 PDF 工作流中做什么？",
        answer: "AI 是增强层，适合 OCR、摘要、问答和文档理解，但重要输出仍应人工核对。",
      },
      {
        question: "这个页面如何帮助搜索和 AI answer engines？",
        answer: "页面使用简短答案、分步流程、FAQ、结构化数据和语义内链，便于 Google 和 AI 系统提取答案。",
      },
    ];
  }

  return [
    { question: seed.enQuestion, answer: seed.enAnswer },
    {
      question: "Is this workflow beginner friendly?",
      answer:
        "Yes. The page uses a quick answer, numbered steps, comparison formatting, and related tool links so new users can understand the task before opening the tool.",
    },
    {
      question: "How does AI fit into this PDF workflow?",
      answer:
        "AI is an enhancement layer for OCR, summaries, Q&A, and document understanding. Important outputs should still be verified by the user.",
    },
    {
      question: "How does this page help search and AI answer engines?",
      answer:
        "It uses concise answers, step-by-step structure, FAQ schema, HowTo schema, and semantic internal links so Google and AI systems can extract the answer more easily.",
    },
  ];
}

export function localizedProgrammaticHref(
  href: string,
  locale: Locale,
  useLocalePrefix: boolean,
) {
  if (!useLocalePrefix) {
    return href;
  }

  return href === "/" ? `/${locale}/` : `/${locale}${href}`;
}

export function absoluteProgrammaticUrl(path: string) {
  return `${siteUrl}${path}`;
}
