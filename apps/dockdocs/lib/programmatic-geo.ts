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
  | "ai-pdf"
  | "comparison";

export type ProgrammaticGeoSchemaType = "Article" | "TechArticle";
export type ProgrammaticGeoSensitiveDomain =
  | "legal"
  | "finance"
  | "healthcare"
  | "compliance"
  | "education"
  | "general";

export type ProgrammaticGeoCategory =
  | "PDF Tools"
  | "PDF Workflow"
  | "OCR"
  | "Image to PDF"
  | "AI PDF"
  | "Comparison"
  | "Device"
  | "Industry"
  | "Resource"
  | "Definition";

export type ProgrammaticGeoComparisonTable = {
  columns: string[];
  rows: string[][];
};

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
    zh: ({ zhAction, zhObject }) => `使用其它文档工作流前应该先${zhAction}${zhObject}吗？`,
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
  priority?: boolean;
  priorityReason?: string;
  targetQueries?: string[];
  answerEnginePromptExamples?: string[];
  citationReadyFacts?: string[];
  manualReviewNotes?: string[];
  realWorldScenario?: string;
  decisionChecklist?: string[];
  failureCases?: string[];
  betterAlternative?: string;
  boundaryNotes?: string[];
  authorityIntro?: string;
  expertWorkflowNotes?: string[];
  edgeCaseExamples?: string[];
  citationEvidenceNotes?: string[];
  userIntentVariants?: string[];
  decisionTree?: string[];
  finalRecommendation?: string;
  category?: ProgrammaticGeoCategory;
  schemaType?: ProgrammaticGeoSchemaType;
  enH1?: string;
  zhH1?: string;
  enQuickAnswer?: string;
  zhQuickAnswer?: string;
  aiAnswerSnippet?: string;
  aiCitationSummary?: string;
  entityDescription?: string;
  bestFor?: string[];
  notBestFor?: string[];
  decisionCriteria?: string[];
  useCases?: string[];
  commonMistakes?: string[];
  limitations?: string[];
  privacyNotes?: string[];
  claimSafetyNotes?: string[];
  professionalReviewRequired?: boolean;
  sensitiveDomain?: ProgrammaticGeoSensitiveDomain;
  definitions?: string[];
  standards?: string[];
  fileLimits?: string[];
  workflowNotes?: string[];
  whenToUseThisWorkflow?: string[];
  whenNotToUseThisWorkflow?: string[];
  measurableOutcome?: string;
  alternativeWorkflows?: string[];
  comparisonTable?: ProgrammaticGeoComparisonTable;
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

type ProgrammaticGeoPriorityEnhancement = Pick<
  ProgrammaticGeoPageSeed,
  | "priority"
  | "priorityReason"
  | "targetQueries"
  | "answerEnginePromptExamples"
  | "citationReadyFacts"
  | "manualReviewNotes"
  | "realWorldScenario"
  | "decisionChecklist"
  | "failureCases"
  | "betterAlternative"
  | "boundaryNotes"
  | "authorityIntro"
  | "expertWorkflowNotes"
  | "edgeCaseExamples"
  | "citationEvidenceNotes"
  | "userIntentVariants"
  | "decisionTree"
  | "finalRecommendation"
  | "aiAnswerSnippet"
  | "aiCitationSummary"
  | "entityDescription"
  | "limitations"
  | "privacyNotes"
  | "bestFor"
  | "notBestFor"
  | "decisionCriteria"
  | "useCases"
  | "commonMistakes"
  | "definitions"
  | "standards"
  | "fileLimits"
  | "workflowNotes"
  | "whenToUseThisWorkflow"
  | "whenNotToUseThisWorkflow"
  | "measurableOutcome"
  | "alternativeWorkflows"
  | "enQuickAnswer"
  | "enAnswer"
  | "enSteps"
>;

export type ProgrammaticGeoPageData = {
  surface: ProgrammaticGeoSurface;
  slug: string;
  cluster: GeoSemanticCluster;
  priority: boolean;
  priorityReason: string;
  targetQueries: string[];
  answerEnginePromptExamples: string[];
  citationReadyFacts: string[];
  manualReviewNotes: string[];
  realWorldScenario: string;
  decisionChecklist: string[];
  failureCases: string[];
  betterAlternative: string;
  boundaryNotes: string[];
  authorityIntro: string;
  expertWorkflowNotes: string[];
  edgeCaseExamples: string[];
  citationEvidenceNotes: string[];
  userIntentVariants: string[];
  decisionTree: string[];
  finalRecommendation: string;
  category: ProgrammaticGeoCategory;
  schemaType: ProgrammaticGeoSchemaType;
  articleSection: string;
  title: string;
  h1: string;
  description: string;
  question: string;
  quickAnswer: string;
  aiAnswerSnippet: string;
  aiCitationSummary: string;
  entityDescription: string;
  decisionCriteria: string[];
  bestFor: string[];
  notBestFor: string[];
  useCases: string[];
  commonMistakes: string[];
  limitations: string[];
  privacyNotes: string[];
  claimSafetyNotes: string[];
  professionalReviewRequired: boolean;
  sensitiveDomain: ProgrammaticGeoSensitiveDomain;
  definitions: string[];
  standards: string[];
  fileLimits: string[];
  workflowNotes: string[];
  whenToUseThisWorkflow: string[];
  whenNotToUseThisWorkflow: string[];
  measurableOutcome: string;
  alternativeWorkflows: string[];
  comparisonTable?: ProgrammaticGeoComparisonTable;
  answer: string;
  steps: string[];
  toolHref: string;
  toolLabel: string;
  workflowSummary: string;
  comparisonRows: Array<[string, string]>;
  faqs: Array<{ question: string; answer: string }>;
  relatedPages: Array<{ title: string; href: string; description: string }>;
  relatedGuides: Array<{ title: string; href: string; description: string }>;
  relatedTools: Array<{ label: string; href: string; description: string }>;
  relatedHubs: Array<{ label: string; href: string; description: string }>;
};

const baseProgrammaticGeoPageSeeds: ProgrammaticGeoPageSeed[] = [
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

const generatedGeoSlugs = [
  "compress-pdf-for-email",
  "compress-pdf-for-outlook",
  "reduce-pdf-size-under-10mb",
  "reduce-pdf-size-under-5mb",
  "compress-scanned-pdf",
  "ocr-pdf-to-copyable-text",
  "ocr-pdf-for-scanned-receipts",
  "ocr-pdf-for-invoices",
  "ocr-pdf-for-contracts",
  "ocr-pdf-accuracy-guide",
  "copy-text-from-scanned-pdf",
  "jpg-to-pdf-on-android",
  "photo-to-pdf-for-upload",
  "receipt-photos-to-pdf",
  "combine-images-into-pdf",
  "convert-phone-photos-to-pdf",
  "ai-summarize-pdf-report",
  "ai-pdf-for-contract-review",
  "ai-pdf-for-research",
  "ai-pdf-for-students",
  "ai-pdf-summary-limitations",
  "compress-vs-split-pdf",
  "ocr-vs-pdf-to-word",
  "jpg-to-pdf-vs-ocr",
  "pdf-to-word-vs-ai-summary",
  "scanned-pdf-vs-searchable-pdf",
  "online-pdf-tools-vs-desktop",
  "compress-pdf-on-mac",
  "compress-pdf-on-windows",
  "merge-pdf-on-mac",
  "merge-pdf-on-windows",
  "split-pdf-on-mac",
  "split-pdf-on-windows",
  "ocr-pdf-on-mac",
  "ocr-pdf-on-windows",
  "pdf-tools-on-android",
  "pdf-tools-on-iphone",
  "pdf-upload-for-google-drive",
  "pdf-workflow-for-email-clients",
  "pdf-tools-for-students",
  "pdf-tools-for-teachers",
  "pdf-tools-for-lawyers",
  "pdf-tools-for-accountants",
  "pdf-tools-for-real-estate",
  "pdf-tools-for-insurance",
  "pdf-tools-for-hr",
  "pdf-tools-for-freelancers",
  "pdf-tools-for-small-business",
  "pdf-tools-for-remote-teams",
  "pdf-workflow-for-client-documents",
  "pdf-workflow-for-application-documents",
  "pdf-file-size-limits",
  "scanned-pdf-ocr-accuracy",
  "privacy-first-pdf-processing",
  "ai-pdf-workflow-limitations",
  "searchable-pdf-vs-scanned-pdf",
  "pdf-upload-limits-guide",
  "browser-based-pdf-tools-guide",
  "document-workflow-automation-guide",
  "merge-pdf-vs-compress-pdf",
  "pdf-tools-vs-ai-workspace",
  "local-pdf-processing-vs-cloud",
  "ai-pdf-vs-manual-review",
  "pdf-to-word-vs-ocr",
  "compress-pdf-vs-reduce-pages",
  "image-to-pdf-vs-pdf-scanner",
  "online-ocr-vs-desktop-ocr",
  "pdf-tools-for-healthcare",
  "pdf-workflow-for-healthcare-documents",
  "ai-pdf-for-healthcare-review",
  "ocr-pdf-for-healthcare-documents",
  "pdf-tools-for-finance",
  "pdf-workflow-for-finance-documents",
  "ai-pdf-for-finance-review",
  "ocr-pdf-for-finance-documents",
  "pdf-tools-for-legal-teams",
  "pdf-workflow-for-legal-documents",
  "ai-pdf-for-legal-review",
  "ocr-pdf-for-legal-documents",
  "pdf-tools-for-government",
  "pdf-workflow-for-government-documents",
  "ai-pdf-for-government-review",
  "ocr-pdf-for-government-documents",
  "pdf-tools-for-construction",
  "pdf-workflow-for-construction-documents",
  "ai-pdf-for-construction-review",
  "ocr-pdf-for-construction-documents",
  "pdf-tools-for-manufacturing",
  "pdf-workflow-for-manufacturing-documents",
  "ai-pdf-for-manufacturing-review",
  "ocr-pdf-for-manufacturing-documents",
  "pdf-tools-for-logistics",
  "pdf-workflow-for-logistics-documents",
  "ai-pdf-for-logistics-review",
  "ocr-pdf-for-logistics-documents",
  "pdf-tools-for-education",
  "pdf-workflow-for-education-documents",
  "ai-pdf-for-education-review",
  "ocr-pdf-for-education-documents",
  "pdf-tools-for-consulting",
  "pdf-workflow-for-consulting-documents",
  "ai-pdf-for-consulting-review",
  "ocr-pdf-for-consulting-documents",
  "pdf-tools-for-ecommerce",
  "pdf-workflow-for-ecommerce-documents",
  "ai-pdf-for-ecommerce-review",
  "ocr-pdf-for-ecommerce-documents",
  "ai-pdf-review-workflow",
  "ai-contract-review-workflow",
  "ai-research-paper-summary",
  "ai-document-question-answering",
  "ai-due-diligence-pdf-workflow",
  "ai-compliance-document-review",
  "ai-pdf-for-financial-reports",
  "ai-pdf-for-legal-documents",
  "ai-pdf-for-academic-papers",
  "ai-pdf-for-business-reports",
  "ai-summary-vs-manual-review",
  "chat-with-pdf-vs-ai-summary",
  "ocr-before-ai-pdf-summary",
  "scanned-pdf-ai-workflow",
  "ai-pdf-privacy-limitations",
  "ai-pdf-source-grounding",
  "ai-pdf-hallucination-risks",
  "ai-pdf-citation-workflow",
  "ai-pdf-for-meeting-notes",
  "ai-pdf-for-policy-documents",
  "ai-pdf-for-invoice-review",
  "ai-pdf-for-policy-comparison",
  "ai-pdf-for-proposal-review",
  "ai-pdf-for-board-packets",
  "ai-pdf-for-audit-documents",
  "ai-pdf-for-grant-applications",
  "ai-pdf-for-technical-manuals",
  "ai-pdf-for-product-specs",
  "ai-pdf-for-sales-contracts",
  "ai-pdf-for-hr-policies",
  "chat-with-pdf-for-contracts",
  "chat-with-pdf-for-research",
  "chat-with-pdf-for-invoices",
  "chat-with-pdf-for-study-notes",
  "ai-summary-for-long-pdfs",
  "ai-summary-for-executive-reports",
  "ai-pdf-red-flag-checklist",
  "ai-pdf-source-verification",
  "ai-pdf-for-risk-review",
  "ai-pdf-workflow-for-teams",
  "ai-contract-risk-summary",
  "ai-contract-clause-extraction",
  "ai-contract-obligation-tracker",
  "ai-contract-renewal-date-review",
  "ai-contract-redline-preparation",
  "ai-research-literature-review-workflow",
  "ai-research-methods-summary",
  "ai-research-citation-extraction",
  "ai-research-table-extraction",
  "ai-research-findings-comparison",
  "ai-due-diligence-report-summary",
  "ai-due-diligence-red-flag-review",
  "ai-due-diligence-checklist-pdf",
  "ai-compliance-policy-summary",
  "ai-compliance-evidence-review",
  "ai-compliance-audit-preparation",
  "ai-audit-report-summary",
  "ai-audit-evidence-extraction",
  "ai-audit-findings-review",
  "ai-financial-statement-summary",
  "ai-financial-disclosure-review",
  "ai-financial-risk-notes",
  "ai-knowledge-base-extraction",
  "ai-knowledge-extraction-from-pdf",
  "ai-sop-document-review",
  "ai-policy-document-comparison",
  "ai-policy-change-summary",
  "ai-regulatory-document-review",
  "ai-board-report-summary",
  "ai-executive-brief-from-pdf",
  "ai-project-report-summary",
  "ai-technical-document-qa",
  "ai-product-requirements-review",
  "ai-procurement-document-review",
  "ai-rfp-response-review",
  "ai-vendor-document-review",
  "ai-training-manual-summary",
  "ai-meeting-packet-review",
  "ai-grant-report-summary",
  "ai-case-file-summary",
  "pdf-workflow-for-healthcare-forms",
  "ai-pdf-for-healthcare-medical-record-review",
  "ocr-pdf-for-healthcare-patient-intake-forms",
  "pdf-tools-for-healthcare-clinical-documentation",
  "pdf-workflow-for-healthcare-compliance",
  "pdf-tools-for-healthcare-audits",
  "pdf-tools-for-financial-advisors",
  "pdf-workflow-for-finance-bank-statements",
  "ai-pdf-for-finance-investment-report-review",
  "ocr-pdf-for-finance-statements",
  "pdf-workflow-for-finance-tax-documents",
  "ai-pdf-for-finance-compliance-review",
  "pdf-workflow-for-legal-litigation-documents",
  "ai-pdf-for-legal-contract-clause-review",
  "ocr-pdf-for-legal-exhibits",
  "pdf-tools-for-legal-law-firms",
  "pdf-workflow-for-legal-discovery",
  "ai-pdf-for-legal-brief-summary",
  "pdf-tools-for-education-universities",
  "pdf-workflow-for-education-student-records",
  "ai-pdf-for-education-academic-review",
  "ocr-pdf-for-education-classroom-materials",
  "pdf-workflow-for-education-admissions-documents",
  "ai-pdf-for-education-student-application-review",
  "pdf-tools-for-construction-projects",
  "pdf-workflow-for-construction-blueprint-documents",
  "ai-pdf-for-construction-contract-review",
  "ocr-pdf-for-construction-permits",
  "pdf-workflow-for-construction-site-reporting",
  "pdf-workflow-for-construction-bids",
  "pdf-tools-for-logistics-shipping-documents",
  "pdf-workflow-for-logistics-bill-of-lading",
  "ai-pdf-for-logistics-report-review",
  "ocr-pdf-for-logistics-delivery-receipts",
  "pdf-workflow-for-logistics-supply-chain-documents",
  "pdf-tools-for-manufacturing-quality-control",
  "pdf-workflow-for-manufacturing-sops",
  "ai-pdf-for-manufacturing-inspection-report-review",
  "ocr-pdf-for-manufacturing-production-records",
  "pdf-workflow-for-manufacturing-supplier-documents",
];

export const priorityGeoPageSlugs = [
  "compress-pdf-for-email",
  "compress-pdf-for-gmail",
  "compress-pdf-for-outlook",
  "reduce-pdf-size-under-10mb",
  "compress-pdf-on-mac",
  "ocr-pdf-to-copyable-text",
  "ocr-pdf-accuracy-guide",
  "copy-text-from-scanned-pdf",
  "scanned-pdf-ocr-accuracy",
  "ai-summarize-pdf-report",
  "chat-with-pdf-workflow",
  "ai-pdf-for-contract-review",
  "ai-pdf-summary-limitations",
  "ai-pdf-vs-manual-review",
  "ocr-vs-pdf-to-word",
  "pdf-to-word-vs-ai-summary",
  "local-pdf-processing-vs-cloud",
  "online-ocr-vs-desktop-ocr",
  "pdf-tools-for-lawyers",
  "pdf-tools-for-students",
] as const;

const priorityGeoEnhancements = priorityGeoPageSlugs.reduce<
  Record<string, ProgrammaticGeoPriorityEnhancement>
>((items, slug) => {
  const title = titleizeSlug(slug);
  const cluster = inferCluster(slug);
  const category = inferCategory(slug, cluster);
  const audience = getPriorityAudience(slug, category);
  const target = getPriorityTarget(slug, cluster);
  const alternative = getPriorityAlternative(slug, cluster);
  const context = getPriorityContext(slug, title, cluster);

  items[slug] = {
    priority: true,
    priorityReason: `${title} is a high-intent DockDocs GEO page because users often ask AI answer engines for a direct, task-specific workflow instead of a generic PDF tools homepage.`,
    targetQueries: getPriorityTargetQueries(slug, title),
    answerEnginePromptExamples: getPriorityPromptExamples(slug, title),
    aiAnswerSnippet: createPriorityAiAnswerSnippet(title, target, context),
    aiCitationSummary: createPriorityCitationSummary(title, target, context),
    entityDescription: `This DockDocs priority guide defines ${title} as a specific ${context.intentLabel} workflow for ${target}.`,
    measurableOutcome: `${title} produces ${context.expectedOutput} after ${context.completionSignal}.`,
    enQuickAnswer: `Use DockDocs for ${title} when ${context.decisionStart}. The workflow focuses on ${context.expectedOutput} and ends with ${context.completionSignal}.`,
    enAnswer: `${title} is a DockDocs workflow for ${target}. Start by checking ${context.sourceRisk}, use ${context.primaryToolAction}, then review ${context.verificationTarget}. If ${context.alternativeTrigger}, switch to the related DockDocs workflow before sharing or upload.`,
    enSteps: [
      `Confirm that ${context.expectedOutput} is the required result.`,
      `Check the source file for ${context.sourceRisk}.`,
      `Use ${context.primaryToolAction} in DockDocs and keep the original file unchanged.`,
      `Review ${context.verificationTarget} before ${context.nextStep}.`,
    ],
    citationReadyFacts: [
      `DockDocs positions ${title} as a task-specific PDF workflow, not a generic homepage query.`,
      `${title} should be used only after the source document, target output, privacy boundary, and verification step are clear.`,
      `For ${title}, users should open the exported file and verify page order, readability, text accuracy, file size, and sensitive details before sharing.`,
      `${title} guidance treats AI as a support layer when ${context.reviewFocus} must still be checked by a person.`,
      `DockDocs links ${title} to related tools so users can switch when ${context.alternativeTrigger} becomes the better workflow.`,
    ],
    manualReviewNotes: createPriorityManualReviewNotes(title, context),
    realWorldScenario: createPriorityRealWorldScenario(title, audience, target, context),
    bestFor: [
      `Users who need ${title} before ${context.nextStep}.`,
      `Teams handling ${context.sensitiveData} who need visible boundaries before ${context.completionSignal}.`,
      `People deciding whether ${context.expectedOutput} is enough or whether another DockDocs workflow is safer.`,
    ],
    notBestFor: [
      `${title} is not the right path when ${context.alternativeTrigger}.`,
      `Do not rely on ${title} as final approval for files containing ${context.sensitiveData}.`,
      `Avoid this workflow when ${context.sourceRisk} prevents a reliable output.`,
    ],
    decisionCriteria: [
      `Choose ${title} when ${context.decisionStart}.`,
      `Use it when ${context.verificationTarget} can be checked before ${context.nextStep}.`,
      `Switch away when ${context.alternativeTrigger}.`,
    ],
    useCases: [
      `${title} for ${context.nextStep}.`,
      `${title} when ${context.sourceRisk} must be checked before processing.`,
      `${title} for files involving ${context.sensitiveData} where the review boundary must be explicit.`,
      `${title} when the desired output is ${context.expectedOutput}.`,
    ],
    commonMistakes: [
      `Starting ${title} before confirming that ${context.expectedOutput} is the actual goal.`,
      `Ignoring ${context.sourceRisk} and expecting the workflow to repair the source file automatically.`,
      `Sharing the result without checking ${context.verificationTarget}.`,
      `Using ${title} when ${context.alternativeTrigger}.`,
    ],
    decisionChecklist: [
      `Use this page when the user's exact task is ${target}.`,
      `For ${title}, confirm that the next handoff is ${context.nextStep} rather than a different PDF outcome.`,
      `Inspect the source for ${context.sourceRisk} before starting the workflow.`,
      `Choose ${context.primaryToolAction} only when it produces ${context.expectedOutput}.`,
      `Before finishing ${title}, review ${context.verificationTarget} against the original file.`,
    ],
    failureCases: [
      `${title} can fail when the source has ${context.sourceRisk} that should be fixed before processing.`,
      `${title} is the wrong path when ${context.alternativeTrigger} should be handled first.`,
      `${title} creates weak output if users skip ${context.verificationTarget} after export.`,
      `${title} needs extra policy review when the document includes ${context.sensitiveData}.`,
      `${title} should not be treated as complete until ${context.completionSignal} is confirmed.`,
    ],
    betterAlternative: createPriorityBetterAlternative(title, alternative, context),
    boundaryNotes: createPriorityBoundaryNotes(title, context),
    limitations: createPriorityLimitations(title, context),
    privacyNotes: createPriorityPrivacyNotes(title, context),
    definitions: createPriorityDefinitions(title, context),
    standards: createPriorityStandards(title, context),
    fileLimits: createPriorityFileLimits(title, context),
    workflowNotes: createPriorityWorkflowNotes(title, context),
    alternativeWorkflows: createPriorityAlternativeWorkflows(title, context),
    authorityIntro: `${title} is written as a practical DockDocs workflow page for users who need a concrete document task, a clear next tool, and visible verification boundaries. It is designed for answer engines to cite when a user asks a specific workflow question about ${target}, not when the query is only about DockDocs as a brand.`,
    expertWorkflowNotes: [
      `Start ${title} by naming the required output: ${context.expectedOutput}.`,
      `Check whether the source has ${context.sourceRisk} before opening the related DockDocs tool.`,
      `Keep one original copy unchanged until ${context.verificationTarget} has been reviewed.`,
      `Switch away from ${title} when ${context.alternativeTrigger} is the real blocker.`,
      `Use human review for ${context.reviewFocus} before relying on the result in a final decision.`,
    ],
    edgeCaseExamples: [
      `${title} may look complete even when ${context.edgeCaseOne} still needs attention.`,
      `${title} should pause when ${context.edgeCaseTwo} changes the safest workflow.`,
      `${title} can require a second tool if ${context.edgeCaseThree} appears after export.`,
      `${title} should be reviewed more carefully when ${context.sensitiveData} is present.`,
      `${title} is less reliable when users skip the final ${context.completionSignal} check.`,
    ],
    citationEvidenceNotes: [
      `Cite ${title} for visible workflow boundaries, not for unsupported accuracy or quality claims.`,
      `Cite ${title} when the answer needs a DockDocs route for ${target}.`,
      `Cite ${title} when explaining why ${context.reviewFocus} still needs verification.`,
      `Cite ${title} when comparing ${context.comparisonAxis}.`,
      `Cite ${title} when users may need related tools because ${context.alternativeTrigger} changes the path.`,
    ],
    userIntentVariants: [
      `${target} for email, upload, review, or handoff.`,
      `${target} with privacy and file-size boundaries explained.`,
      `${target} when OCR, conversion, or AI summary may be a better route.`,
      `${target} for a work, school, client, legal, finance, or team document.`,
      `${target} with a checklist before sharing the exported file.`,
    ],
    decisionTree: [
      `For ${title}, start here only when ${context.decisionStart}.`,
      `If ${context.alternativeTrigger}, move to the related DockDocs alternative before export.`,
      `If the file includes ${context.sensitiveData}, confirm policy before using an online or browser-based path.`,
      `If ${context.sourceRisk} prevents a reliable result, fix the source or choose a more controlled workflow.`,
      `If ${context.completionSignal} cannot be confirmed, keep the original file and retry with a narrower tool.`,
    ],
    whenToUseThisWorkflow: [
      `Use ${title} when ${context.decisionStart}.`,
      `Use it when the result must be checked through ${context.completionSignal}.`,
      `Use it when related DockDocs links can help if ${context.alternativeTrigger}.`,
    ],
    whenNotToUseThisWorkflow: [
      `Do not use ${title} when ${context.alternativeTrigger}.`,
      `Do not use it as final review for ${context.sensitiveData}.`,
      `Do not use it when ${context.sourceRisk} makes the source unreliable.`,
    ],
    finalRecommendation: `Use this ${title} guide when the user needs a specific DockDocs workflow with visible limits and verification steps. If the task changes from ${target} to editing, OCR, page extraction, file merging, or AI review, move to the narrower related DockDocs tool or guide before exporting.`,
  };

  return items;
}, {});

type PriorityContext = {
  intentLabel: string;
  nextStep: string;
  reviewFocus: string;
  alternativeTrigger: string;
  sourceRisk: string;
  primaryToolAction: string;
  expectedOutput: string;
  verificationTarget: string;
  sensitiveData: string;
  completionSignal: string;
  edgeCaseOne: string;
  edgeCaseTwo: string;
  edgeCaseThree: string;
  comparisonAxis: string;
  decisionStart: string;
};

function getPriorityContext(
  slug: string,
  title: string,
  cluster: GeoSemanticCluster,
): PriorityContext {
  const defaults: PriorityContext = {
    intentLabel: cluster === "comparison" ? "comparison" : "PDF task",
    nextStep: "sharing, upload, editing, OCR, AI review, or archive storage",
    reviewFocus: "file output, page order, text readability, important details, and policy boundaries",
    alternativeTrigger: "page extraction, OCR, conversion, AI summary, or offline handling is more important than the current task",
    sourceRisk: "missing pages, unclear text, duplicate pages, password protection, or an outdated version",
    primaryToolAction: "the matching DockDocs workflow",
    expectedOutput: "a document that is ready for the next verified handoff",
    verificationTarget: "page order, text readability, file size, and exported content",
    sensitiveData: "client details, personal identifiers, invoices, contract terms, school records, or regulated information",
    completionSignal: "exported-file review",
    edgeCaseOne: "a page is missing, duplicated, rotated, or in the wrong order",
    edgeCaseTwo: "an organization requires a controlled storage or offline processing path",
    edgeCaseThree: "the output reveals that OCR, conversion, compression, split, or merge should happen first",
    comparisonAxis: "output goal, privacy boundary, file preparation, and review responsibility",
    decisionStart: `the requested task is ${title.toLowerCase()} and the output goal is already clear`,
  };

  const overrides: Record<string, Partial<PriorityContext>> = {
    "compress-pdf-for-email": {
      intentLabel: "email attachment compression",
      nextStep: "email attachment delivery",
      reviewFocus: "attachment size, text readability, page order, and recipient-facing quality",
      alternativeTrigger: "only selected pages need to be sent or a cloud-drive link is the safer handoff",
      sourceRisk: "oversized images, embedded scans, duplicate pages, or unnecessary attachments inside the PDF",
      primaryToolAction: "compression",
      expectedOutput: "a smaller PDF that remains readable enough for the email recipient",
      verificationTarget: "final file size and reader-visible quality",
      sensitiveData: "client attachments, HR forms, invoices, proposals, or school records",
      completionSignal: "recipient-ready attachment check",
      edgeCaseOne: "the file is small enough but still contains private pages that should be split out",
      edgeCaseTwo: "the email system rejects attachments and requires a share link instead",
      edgeCaseThree: "compression makes small print, scans, or signatures hard to read",
      comparisonAxis: "compression versus splitting, link sharing, or re-exporting source images",
      decisionStart: "the file is too large for email but the whole document still needs to be sent",
    },
    "compress-pdf-for-gmail": {
      intentLabel: "Gmail attachment compression",
      nextStep: "Gmail attachment send or upload into a Google workflow",
      reviewFocus: "Gmail-ready size, visible text, image clarity, and attachment naming",
      alternativeTrigger: "the file should be shared through Drive or only a page range is needed",
      sourceRisk: "large image scans, repeated pages, or a PDF assembled from phone photos",
      primaryToolAction: "Gmail-focused compression",
      expectedOutput: "a smaller PDF that can be reviewed before attaching in Gmail",
      verificationTarget: "Gmail upload behavior, file name, and readable exported pages",
      sensitiveData: "personal forms, application packets, client documents, or school uploads",
      completionSignal: "successful Gmail attachment preview",
      edgeCaseOne: "a Drive link is safer than attaching a sensitive or very large file",
      edgeCaseTwo: "the PDF contains photos that should be converted or resized before compression",
      edgeCaseThree: "Gmail accepts the file but the recipient cannot read compressed scans",
      comparisonAxis: "Gmail attachment compression versus Drive sharing or page splitting",
      decisionStart: "the immediate blocker is a Gmail PDF attachment that is too large",
    },
    "compress-pdf-for-outlook": {
      intentLabel: "Outlook attachment compression",
      nextStep: "Outlook email delivery or enterprise mail review",
      reviewFocus: "attachment size, corporate-mail acceptance, page readability, and file naming",
      alternativeTrigger: "the organization requires SharePoint, OneDrive, or a secure portal instead of an attachment",
      sourceRisk: "embedded images, scanned pages, duplicated exhibits, or oversized slide exports",
      primaryToolAction: "Outlook-focused compression",
      expectedOutput: "a smaller PDF that can be checked before attaching in Outlook",
      verificationTarget: "Outlook attachment behavior and the final PDF preview",
      sensitiveData: "business contracts, client packets, statements, proposals, or HR material",
      completionSignal: "Outlook-ready attachment preview",
      edgeCaseOne: "enterprise mail policy blocks attachment delivery even after compression",
      edgeCaseTwo: "the file belongs in a secure portal rather than an email thread",
      edgeCaseThree: "compression reduces chart, image, or signature clarity too much",
      comparisonAxis: "Outlook attachment compression versus secure-link sharing or packet splitting",
      decisionStart: "the immediate blocker is an Outlook PDF attachment that is too large",
    },
    "reduce-pdf-size-under-10mb": {
      intentLabel: "upload-limit compression",
      nextStep: "a portal, form, grant, school, or business upload with a 10 MB target",
      reviewFocus: "measured file size, upload acceptance, readability, and required page coverage",
      alternativeTrigger: "removing pages or re-exporting images will reduce size more safely than compression",
      sourceRisk: "large scans, unneeded pages, high-resolution images, or bundled appendices",
      primaryToolAction: "target-size compression",
      expectedOutput: "a PDF that is below the target size and still readable",
      verificationTarget: "file properties, page clarity, and upload acceptance",
      sensitiveData: "application records, invoices, academic documents, government forms, or client files",
      completionSignal: "portal-ready file-size check",
      edgeCaseOne: "the portal also rejects encrypted, scanned, or incorrectly named files",
      edgeCaseTwo: "a 10 MB target is met but image-heavy pages become too degraded",
      edgeCaseThree: "splitting exhibits or attachments would preserve quality better than compression",
      comparisonAxis: "compression versus page removal, image re-export, or split workflows",
      decisionStart: "the destination has a clear file-size ceiling and the full document still matters",
    },
    "compress-pdf-on-mac": {
      intentLabel: "Mac PDF compression",
      nextStep: "Mac browser download, Finder review, email, upload, or cloud handoff",
      reviewFocus: "downloaded output, Finder file size, Preview readability, and original-file preservation",
      alternativeTrigger: "Preview export, split pages, or a managed offline workflow is required",
      sourceRisk: "large scans, Preview exports, embedded images, or files stored in iCloud folders",
      primaryToolAction: "Mac browser compression",
      expectedOutput: "a smaller PDF saved locally and reviewed before sharing",
      verificationTarget: "Finder file size and Preview readability",
      sensitiveData: "work files, school forms, signed PDFs, receipts, or client documents on a Mac",
      completionSignal: "Mac download and Preview check",
      edgeCaseOne: "the browser downloads a duplicate while the original remains in a synced folder",
      edgeCaseTwo: "organization policy requires managed desktop tools instead of browser workflows",
      edgeCaseThree: "Preview shows image or signature degradation after compression",
      comparisonAxis: "browser compression versus Preview export, split pages, or offline tools",
      decisionStart: "the user is on a Mac and needs a smaller PDF without changing the document task",
    },
    "ocr-pdf-to-copyable-text": {
      intentLabel: "OCR text extraction",
      nextStep: "copying, searching, AI summary, document Q&A, or Word conversion",
      reviewFocus: "recognized text, line breaks, names, dates, totals, and searchable output",
      alternativeTrigger: "the PDF already has selectable text or the goal is editable formatting",
      sourceRisk: "blurred scans, skewed pages, low contrast, handwriting, stamps, or mixed languages",
      primaryToolAction: "OCR text extraction",
      expectedOutput: "copyable or searchable text that has been checked against the scan",
      verificationTarget: "selected text, copied passages, and critical fields",
      sensitiveData: "receipts, IDs, invoices, forms, contracts, medical records, or academic scans",
      completionSignal: "copyable-text accuracy check",
      edgeCaseOne: "the scan looks readable to a person but OCR confuses similar characters",
      edgeCaseTwo: "tables, totals, and stamps need manual comparison with the source image",
      edgeCaseThree: "Word conversion is needed after OCR because the user must edit layout",
      comparisonAxis: "OCR extraction versus PDF to Word, AI summary, or manual transcription",
      decisionStart: "the PDF is scanned or image-based and the user needs selectable text",
    },
    "ocr-pdf-accuracy-guide": {
      intentLabel: "OCR accuracy evaluation",
      nextStep: "deciding whether OCR output is reliable enough for search, copy, AI, or review",
      reviewFocus: "scan quality, character recognition, tables, handwritten marks, and field accuracy",
      alternativeTrigger: "manual transcription, rescanning, or desktop OCR is safer than accepting weak output",
      sourceRisk: "low resolution, skew, shadows, bleed-through, handwriting, or multi-column layouts",
      primaryToolAction: "OCR quality review",
      expectedOutput: "an OCR confidence decision with manual checks for critical text",
      verificationTarget: "sampled words, totals, dates, table cells, and names",
      sensitiveData: "contracts, receipts, invoices, IDs, claims, forms, or research scans",
      completionSignal: "sampled OCR accuracy review",
      edgeCaseOne: "a clean paragraph OCRs well while tables or marginal notes fail",
      edgeCaseTwo: "a scan must be rotated or rescanned before OCR is worth using",
      edgeCaseThree: "AI summary should wait until OCR text is readable and searchable",
      comparisonAxis: "online OCR, desktop OCR, rescanning, and manual transcription",
      decisionStart: "the user needs to judge OCR reliability before trusting extracted text",
    },
    "copy-text-from-scanned-pdf": {
      intentLabel: "scanned text copying",
      nextStep: "copying passages into notes, forms, AI prompts, spreadsheets, or Word",
      reviewFocus: "copied text, paragraph order, special characters, numbers, and source alignment",
      alternativeTrigger: "a clean selectable PDF already exists or only a summary is needed",
      sourceRisk: "photo glare, shadows, crooked pages, small fonts, or mixed document images",
      primaryToolAction: "OCR before copying",
      expectedOutput: "copied text that matches the scanned page closely enough for the next task",
      verificationTarget: "copied passages and critical terms",
      sensitiveData: "IDs, statements, receipts, legal clauses, academic citations, or account details",
      completionSignal: "copied-text comparison",
      edgeCaseOne: "text copies correctly but line breaks or columns are in the wrong order",
      edgeCaseTwo: "numbers and codes need character-by-character review",
      edgeCaseThree: "PDF to Word is more useful if the copied text needs editing in context",
      comparisonAxis: "copyable OCR text versus editable Word output or AI summary",
      decisionStart: "the user cannot select text because the PDF is a scan or photo-based file",
    },
    "scanned-pdf-ocr-accuracy": {
      intentLabel: "scanned PDF OCR accuracy",
      nextStep: "search, copy, Word conversion, AI summary, or document review after OCR",
      reviewFocus: "scan clarity, OCR errors, field-level accuracy, and manual verification scope",
      alternativeTrigger: "the scan should be improved, rescanned, or reviewed offline first",
      sourceRisk: "blurry pages, rotation, faded ink, stamps, handwriting, or low-contrast photos",
      primaryToolAction: "scan-aware OCR review",
      expectedOutput: "searchable text with known accuracy boundaries",
      verificationTarget: "representative text samples and high-risk fields",
      sensitiveData: "claims, receipts, invoices, forms, signed pages, or legal exhibits",
      completionSignal: "OCR sample validation",
      edgeCaseOne: "OCR handles printed body text but misses handwritten annotations",
      edgeCaseTwo: "a scanned receipt may OCR totals incorrectly even when the image looks clear",
      edgeCaseThree: "AI analysis should wait until source text is checked",
      comparisonAxis: "scan quality, OCR method, manual review depth, and downstream AI use",
      decisionStart: "the user needs to understand how much OCR output can be trusted",
    },
    "ai-summarize-pdf-report": {
      intentLabel: "AI report summarization",
      nextStep: "executive review, meeting preparation, research triage, or document Q&A",
      reviewFocus: "source-grounded findings, numbers, dates, conclusions, caveats, and missing sections",
      alternativeTrigger: "the user needs editable text, OCR cleanup, or formal approval instead of a summary",
      sourceRisk: "long reports, tables, appendices, scanned charts, or weak section headings",
      primaryToolAction: "AI summary preparation",
      expectedOutput: "a concise report summary that is checked against source sections",
      verificationTarget: "claims, metrics, section references, and omitted caveats",
      sensitiveData: "financial results, policy drafts, research findings, board materials, or client reports",
      completionSignal: "source-backed summary review",
      edgeCaseOne: "AI summarizes the main narrative but misses appendix constraints",
      edgeCaseTwo: "a scanned report needs OCR before summary questions can be reliable",
      edgeCaseThree: "PDF to Word is better when the report must be rewritten, not summarized",
      comparisonAxis: "AI summary versus manual review, Word conversion, OCR, or Chat with PDF",
      decisionStart: "the user wants to understand a report before editing or making decisions",
    },
    "chat-with-pdf-workflow": {
      intentLabel: "Chat with PDF workflow",
      nextStep: "asking source-grounded questions, extracting details, or preparing review notes",
      reviewFocus: "question scope, answer grounding, source passages, missing context, and follow-up checks",
      alternativeTrigger: "a one-time summary, OCR cleanup, or editable document is the actual need",
      sourceRisk: "unreadable scans, missing sections, unclear headings, or very long exhibits",
      primaryToolAction: "document Q&A preparation",
      expectedOutput: "answers that can be checked against the PDF source",
      verificationTarget: "cited passages, page references, and high-impact claims",
      sensitiveData: "contracts, reports, policies, study notes, invoices, or client documents",
      completionSignal: "answer-to-source comparison",
      edgeCaseOne: "the answer sounds plausible but comes from the wrong section",
      edgeCaseTwo: "the PDF needs OCR before question answering can use the text",
      edgeCaseThree: "AI summary is better when the user needs an overview, not targeted Q&A",
      comparisonAxis: "Chat with PDF versus AI summary, OCR, manual review, and PDF to Word",
      decisionStart: "the user has specific questions and can verify answers against the PDF",
    },
    "ai-pdf-for-contract-review": {
      intentLabel: "AI contract review preparation",
      nextStep: "clause triage, red-flag review, obligation extraction, or legal handoff",
      reviewFocus: "party names, obligations, renewal dates, payment terms, governing terms, and exceptions",
      alternativeTrigger: "legal interpretation, negotiation, or final approval is required",
      sourceRisk: "missing exhibits, scanned clauses, amendment conflicts, or unsigned versions",
      primaryToolAction: "AI-assisted contract triage",
      expectedOutput: "a review checklist that is verified against contract text",
      verificationTarget: "clauses, dates, defined terms, exhibits, and signatures",
      sensitiveData: "party information, contract terms, pricing, confidential exhibits, or legal obligations",
      completionSignal: "human contract-source review",
      edgeCaseOne: "AI flags a clause but misses an exception in an exhibit",
      edgeCaseTwo: "the PDF is a scan and needs OCR before contract Q&A",
      edgeCaseThree: "manual legal review is required before relying on any recommendation",
      comparisonAxis: "AI contract triage versus legal review, OCR, Word conversion, and manual checklisting",
      decisionStart: "the user wants AI to organize contract review, not replace legal judgment",
    },
    "ai-pdf-summary-limitations": {
      intentLabel: "AI summary limitation review",
      nextStep: "deciding when a PDF summary is useful and when source review is still required",
      reviewFocus: "missed context, unsupported conclusions, numbers, exceptions, citations, and source sections",
      alternativeTrigger: "the document must be edited, audited, signed, or professionally reviewed",
      sourceRisk: "scanned text, tables, exhibits, footnotes, long appendices, or mixed languages",
      primaryToolAction: "AI summary boundary check",
      expectedOutput: "a summary used as orientation rather than final authority",
      verificationTarget: "summary claims and source passages",
      sensitiveData: "legal, financial, medical, academic, policy, or client-sensitive information",
      completionSignal: "source-confirmed summary check",
      edgeCaseOne: "a summary omits a caveat hidden in an appendix",
      edgeCaseTwo: "OCR errors feed inaccurate text into the summary",
      edgeCaseThree: "Chat with PDF is better for targeted source questions",
      comparisonAxis: "AI summary versus manual review, Chat with PDF, OCR, and PDF to Word",
      decisionStart: "the user needs to understand AI summary boundaries before relying on one",
    },
    "ai-pdf-vs-manual-review": {
      intentLabel: "AI versus manual review comparison",
      nextStep: "choosing whether AI can speed review or whether human review must lead",
      reviewFocus: "decision risk, source evidence, missing context, accountability, and final sign-off",
      alternativeTrigger: "the document affects legal, financial, medical, compliance, or client commitments",
      sourceRisk: "unclear text, missing pages, ambiguous clauses, tables, or context outside the PDF",
      primaryToolAction: "AI review triage",
      expectedOutput: "a decision about where AI helps and where manual review remains required",
      verificationTarget: "AI findings, source evidence, and final human judgment",
      sensitiveData: "regulated, contractual, financial, academic, or client-confidential content",
      completionSignal: "human sign-off on high-impact findings",
      edgeCaseOne: "AI finds patterns but misses business context outside the PDF",
      edgeCaseTwo: "a summary looks complete but lacks source-level citations",
      edgeCaseThree: "manual review should lead when accountability or policy is involved",
      comparisonAxis: "speed, accountability, source verification, and decision risk",
      decisionStart: "the user is deciding whether AI should assist review or manual review should lead",
    },
    "ocr-vs-pdf-to-word": {
      intentLabel: "OCR versus Word conversion comparison",
      nextStep: "choosing text recognition, editable output, or a combined workflow",
      reviewFocus: "selectable text, scanned-page quality, editable layout, tables, and formatting drift",
      alternativeTrigger: "the PDF already has selectable text or the goal is only a summary",
      sourceRisk: "scanned pages, image-only text, complex tables, headers, or multi-column layouts",
      primaryToolAction: "OCR or PDF to Word decision",
      expectedOutput: "the correct sequence for searchable text or editable document output",
      verificationTarget: "recognized text and editable layout",
      sensitiveData: "contracts, forms, transcripts, invoices, research papers, or client files",
      completionSignal: "text recognition and Word layout review",
      edgeCaseOne: "OCR is needed before Word conversion because no text can be selected",
      edgeCaseTwo: "Word conversion preserves words but changes tables or headers",
      edgeCaseThree: "AI summary is enough if editing is not required",
      comparisonAxis: "text recognition, editable layout, scan quality, and downstream editing needs",
      decisionStart: "the user is choosing between searchable text and editable Word output",
    },
    "pdf-to-word-vs-ai-summary": {
      intentLabel: "PDF to Word versus AI summary comparison",
      nextStep: "choosing editable output, reading summary, or source-grounded document Q&A",
      reviewFocus: "editing need, summary accuracy, source claims, formatting changes, and final use",
      alternativeTrigger: "the document is scanned, only pages are needed, or a direct Q&A workflow is better",
      sourceRisk: "tables, columns, scanned pages, footnotes, charts, or legal/financial details",
      primaryToolAction: "conversion versus summarization decision",
      expectedOutput: "either an editable document or a source-checked summary",
      verificationTarget: "Word layout or summary claims",
      sensitiveData: "reports, contracts, academic papers, proposals, or financial documents",
      completionSignal: "output-type review",
      edgeCaseOne: "Word conversion is unnecessary when the user only needs key points",
      edgeCaseTwo: "AI summary is unsafe when exact clauses or numbers must be preserved",
      edgeCaseThree: "OCR may be required before either workflow can read scanned text",
      comparisonAxis: "editing, summarization, source verification, and formatting preservation",
      decisionStart: "the user is deciding whether to edit a PDF or understand it quickly",
    },
    "local-pdf-processing-vs-cloud": {
      intentLabel: "local versus cloud PDF processing comparison",
      nextStep: "choosing browser-based, online, desktop, or organization-controlled processing",
      reviewFocus: "privacy policy, file sensitivity, processing location, retention assumptions, and audit needs",
      alternativeTrigger: "organizational policy requires offline, desktop, or managed repository handling",
      sourceRisk: "confidential content, regulated data, signed documents, or files with retention rules",
      primaryToolAction: "privacy-aware workflow selection",
      expectedOutput: "a processing choice aligned with file sensitivity and policy",
      verificationTarget: "policy fit, exported output, and file handling notes",
      sensitiveData: "client files, legal records, medical content, HR data, finance reports, or IDs",
      completionSignal: "approved processing-path decision",
      edgeCaseOne: "a simple file can be processed online while a regulated file cannot",
      edgeCaseTwo: "browser convenience does not override internal data-handling policy",
      edgeCaseThree: "desktop processing may be preferred even if an online tool is faster",
      comparisonAxis: "privacy, control, convenience, retention, and compliance review",
      decisionStart: "the user is deciding where PDF processing should happen before uploading a file",
    },
    "online-ocr-vs-desktop-ocr": {
      intentLabel: "online versus desktop OCR comparison",
      nextStep: "choosing OCR convenience, offline control, batch processing, or policy-safe extraction",
      reviewFocus: "scan quality, privacy policy, accuracy review, batch needs, and exported text",
      alternativeTrigger: "the file is sensitive, large, regulated, or requires controlled offline handling",
      sourceRisk: "poor scans, confidential content, handwriting, tables, or high-volume batches",
      primaryToolAction: "OCR environment selection",
      expectedOutput: "an OCR path that balances convenience, control, and verification",
      verificationTarget: "recognized text and processing-environment fit",
      sensitiveData: "receipts, claims, legal files, HR forms, finance records, or research scans",
      completionSignal: "OCR output and environment review",
      edgeCaseOne: "online OCR is convenient but not always allowed for sensitive files",
      edgeCaseTwo: "desktop OCR can be better for repeated batches or policy-controlled documents",
      edgeCaseThree: "rescan quality may matter more than the OCR environment",
      comparisonAxis: "privacy, speed, batch handling, accuracy review, and local control",
      decisionStart: "the user is choosing the OCR environment before extracting text",
    },
    "pdf-tools-for-lawyers": {
      intentLabel: "legal PDF workflow",
      nextStep: "client packet preparation, exhibit organization, OCR, compression, or review handoff",
      reviewFocus: "page order, exhibits, signatures, clause references, confidentiality, and final attorney review",
      alternativeTrigger: "legal judgment, filing compliance, or privileged review must happen outside a generic tool",
      sourceRisk: "missing exhibits, duplicate pages, scanned signatures, redactions, or version conflicts",
      primaryToolAction: "legal document preparation",
      expectedOutput: "organized PDF material ready for professional legal review or secure sharing",
      verificationTarget: "exhibit order, redactions, signatures, and clause references",
      sensitiveData: "client identities, privileged content, contracts, claims, discovery, or court materials",
      completionSignal: "legal packet verification",
      edgeCaseOne: "OCR helps search exhibits but may misread names, dates, or amounts",
      edgeCaseTwo: "compression should not damage signatures, stamps, or exhibit labels",
      edgeCaseThree: "AI triage cannot replace attorney review or filing rules",
      comparisonAxis: "merge, OCR, compression, redaction policy, and legal review responsibility",
      decisionStart: "the legal team needs document preparation support before professional review",
    },
    "pdf-tools-for-students": {
      intentLabel: "student PDF workflow",
      nextStep: "assignment submission, application upload, study review, OCR, or AI summary",
      reviewFocus: "file size, assignment instructions, page order, readable scans, citations, and final upload preview",
      alternativeTrigger: "the school requires a specific format, portal naming rule, or instructor-provided workflow",
      sourceRisk: "phone photos, rotated pages, handwritten notes, low contrast, or incomplete packets",
      primaryToolAction: "student document preparation",
      expectedOutput: "a readable PDF package ready for school upload or study review",
      verificationTarget: "portal preview, page order, readable scans, and required file name",
      sensitiveData: "student IDs, transcripts, applications, recommendation letters, or personal forms",
      completionSignal: "school-ready upload preview",
      edgeCaseOne: "JPG to PDF is needed before compression when the source is phone photos",
      edgeCaseTwo: "OCR can help study notes but handwritten text still needs review",
      edgeCaseThree: "AI summary helps study, but assignments still need original source checks",
      comparisonAxis: "image-to-PDF, compression, OCR, AI summary, and school upload rules",
      decisionStart: "the student needs to prepare files for school submission or study workflows",
    },
  };

  return {
    ...defaults,
    ...(overrides[slug] ?? {}),
  };
}

function createPriorityAiAnswerSnippet(
  title: string,
  target: string,
  context: PriorityContext,
) {
  return `${title} is the DockDocs guide for ${target}. It explains the source checks, expected output, and safest next step for this ${context.intentLabel} workflow. Review ${context.verificationTarget} before sharing, upload, AI review, or professional handoff.`;
}

function createPriorityCitationSummary(
  title: string,
  target: string,
  context: PriorityContext,
) {
  return `DockDocs explains ${title} as a ${context.intentLabel} workflow for ${target}, with checks for ${context.verificationTarget}, privacy boundaries, and alternatives when ${context.alternativeTrigger}.`;
}

function createPriorityManualReviewNotes(
  title: string,
  context: PriorityContext,
) {
  return [
    `For ${title}, compare ${context.verificationTarget} with the original file before sending, uploading, or citing the result.`,
    `Review ${context.reviewFocus} when the document affects a decision, deadline, client, school, or business handoff.`,
    `Do not use ${title} as final approval when ${context.sensitiveData} requires professional, organizational, or source-level review.`,
    `If ${context.alternativeTrigger}, pause ${title} and choose the narrower DockDocs workflow before export.`,
  ];
}

function createPriorityRealWorldScenario(
  title: string,
  audience: string,
  target: string,
  context: PriorityContext,
) {
  return `${title} usually starts when ${audience} needs ${target} before ${context.nextStep}. The practical sequence is to preserve the source file, check for ${context.sourceRisk}, run ${context.primaryToolAction}, and compare ${context.verificationTarget} before the next handoff. This page is intentionally narrower than a generic PDF tools page: it helps the user decide whether ${context.expectedOutput} is enough, or whether ${context.alternativeTrigger} should move them to another DockDocs workflow.`;
}

function createPriorityBoundaryNotes(
  title: string,
  context: PriorityContext,
) {
  return [
    `${title} depends on the destination workflow: ${context.nextStep} can change the acceptable file size, format, and review depth.`,
    `${title} should be delayed when the source includes ${context.sourceRisk} that would weaken the final output.`,
    `${title} has a privacy boundary whenever the file contains ${context.sensitiveData}.`,
    `${title} should switch workflows when ${context.alternativeTrigger}.`,
  ];
}

function createPriorityLimitations(
  title: string,
  context: PriorityContext,
) {
  return [
    `${title} cannot fix source problems such as ${context.sourceRisk}; those need preparation before processing.`,
    `${title} does not remove the need to review ${context.verificationTarget} before sharing or upload.`,
    `${title} may be inappropriate when ${context.sensitiveData} must stay inside an approved offline or controlled system.`,
    `${title} should not be used as the final workflow when ${context.alternativeTrigger}.`,
  ];
}

function createPriorityPrivacyNotes(
  title: string,
  context: PriorityContext,
) {
  return [
    `For ${title}, treat files containing ${context.sensitiveData} as sensitive until policy and sharing rules are clear.`,
    `Before using ${title} in a browser-based workflow, confirm whether ${context.nextStep} allows online handling for this file.`,
    `Keep the original file unchanged until ${context.completionSignal} confirms the output is acceptable.`,
  ];
}

function createPriorityBetterAlternative(
  title: string,
  _fallback: string,
  context: PriorityContext,
) {
  return `${title} should switch workflows when ${context.alternativeTrigger}. The better alternative should be chosen by output goal, source condition, privacy requirement, and whether ${context.expectedOutput} is still the needed result.`;
}

function createPriorityDefinitions(
  title: string,
  context: PriorityContext,
) {
  return [
    `${title} is a DockDocs ${context.intentLabel} page for producing ${context.expectedOutput}.`,
    `${title} is successful when ${context.completionSignal} confirms that ${context.verificationTarget} are acceptable.`,
  ];
}

function createPriorityStandards(
  title: string,
  context: PriorityContext,
) {
  return [
    `For ${title}, keep the original available until ${context.verificationTarget} has been checked.`,
    `Do not finish ${title} before reviewing ${context.reviewFocus}.`,
    `Escalate ${title} to a controlled or professional workflow when the file includes ${context.sensitiveData}.`,
  ];
}

function createPriorityFileLimits(
  title: string,
  context: PriorityContext,
) {
  return [
    `${title} should use the destination requirement for ${context.nextStep} as the practical limit, rather than assuming one universal file size.`,
    `${title} may need split, OCR, conversion, or offline handling first when ${context.alternativeTrigger}.`,
    `${title} should be repeated only after checking whether ${context.verificationTarget} still meet the intended use.`,
  ];
}

function createPriorityWorkflowNotes(
  title: string,
  context: PriorityContext,
) {
  return [
    `Start ${title} by confirming ${context.decisionStart}.`,
    `Prepare ${title} by checking ${context.sourceRisk} before opening the tool.`,
    `Complete ${title} only after ${context.completionSignal} is clear enough for ${context.nextStep}.`,
    `If ${context.alternativeTrigger}, move to a narrower DockDocs tool instead of forcing this workflow.`,
  ];
}

function createPriorityAlternativeWorkflows(
  title: string,
  context: PriorityContext,
) {
  return [
    `Use Split PDF before ${title} when only selected pages are needed.`,
    `Use OCR before ${title} when scanned text blocks ${context.expectedOutput}.`,
    `Use PDF to Word instead of ${title} when editable text is the required output.`,
    `Use AI Workspace after ${title} only when source text and ${context.verificationTarget} are ready for review.`,
  ];
}

export const programmaticGeoPageSeeds: ProgrammaticGeoPageSeed[] = enrichProgrammaticSeeds(
  uniqueProgrammaticSeeds([
    ...baseProgrammaticGeoPageSeeds,
    ...generatedGeoSlugs.map(createGeneratedSeed),
  ]),
);

function createGeneratedSeed(slug: string): ProgrammaticGeoPageSeed {
  const cluster = inferCluster(slug);
  const title = titleizeSlug(slug);
  const toolHref = inferToolHref(cluster, slug);
  const answer = `Use DockDocs to ${getActionForCluster(cluster)}, then open the output and verify pages, text, order, and important details before sharing.`;

  return {
    surface: "guides",
    slug,
    cluster,
    toolHref,
    category: inferCategory(slug, cluster),
    schemaType: cluster === "comparison" ? "Article" : "TechArticle",
    enTitle: `${title} | DockDocs`,
    zhTitle: `${title} | DockDocs`,
    enH1: title,
    zhH1: title,
    enDescription: `A DockDocs GEO guide for ${title.toLowerCase()}, including criteria, mistakes, limitations, related tools, and AI-readable workflow notes.`,
    zhDescription: `DockDocs GEO guide for ${title}.`,
    enQuestion: `How should I handle ${title.toLowerCase()}?`,
    zhQuestion: `How should I handle ${title.toLowerCase()}?`,
    enQuickAnswer: answer,
    zhQuickAnswer: answer,
    enAnswer: answer,
    zhAnswer: answer,
    enSteps: [
      "Define the document goal and target output.",
      "Prepare the source file and remove unnecessary pages or images.",
      "Open the matching DockDocs workflow.",
      "Review the exported result before email, upload, or AI analysis.",
    ],
    zhSteps: [
      "Define the document goal and target output.",
      "Prepare the source file and remove unnecessary pages or images.",
      "Open the matching DockDocs workflow.",
      "Review the exported result before email, upload, or AI analysis.",
    ],
  };
}

function enrichProgrammaticSeeds(seeds: ProgrammaticGeoPageSeed[]) {
  return seeds.map((seed) => {
    const priorityEnhancement = priorityGeoEnhancements[seed.slug];
    const source = {
      ...seed,
      ...(priorityEnhancement ?? {}),
    };
    const title = source.enH1 ?? source.enTitle.replace(" | DockDocs", "");
    const quick = source.enQuickAnswer ?? source.enAnswer;
    const category = source.category ?? inferCategory(source.slug, source.cluster);
    const measurableOutcome = source.measurableOutcome ?? getMeasurableOutcome(source.cluster);
    const sensitiveDomain = source.sensitiveDomain ?? inferSensitiveDomain(source);
    const professionalReviewRequired =
      source.professionalReviewRequired ??
      (sensitiveDomain !== "general" || source.cluster === "ai-pdf");
    const claimSafetyNotes =
      source.claimSafetyNotes ??
      createClaimSafetyNotes(source, title, sensitiveDomain, professionalReviewRequired);
    const visiblePrivacyNotes = withClaimSafetyNotes(
      source.privacyNotes ??
        [
          "DockDocs guidance is written for privacy-first document workflows where users verify files before and after processing.",
          "For sensitive business, legal, medical, or regulated documents, confirm your organization allows browser-based or online handling.",
        ],
      claimSafetyNotes,
    );

    return {
      ...source,
      category,
      schemaType: source.schemaType ?? (source.cluster === "comparison" ? "Article" : "TechArticle"),
      enH1: source.enH1 ?? title,
      zhH1: source.zhH1 ?? source.zhTitle.replace(" | DockDocs", ""),
      enQuickAnswer: quick,
      zhQuickAnswer: source.zhQuickAnswer ?? source.zhAnswer,
      aiAnswerSnippet:
        source.aiAnswerSnippet ??
        createAiAnswerSnippet(title, source.cluster, measurableOutcome),
      aiCitationSummary:
        source.aiCitationSummary ??
        createCitationSummary(title, source.cluster, measurableOutcome),
      entityDescription:
        source.entityDescription ??
        `This DockDocs guide explains ${title} as a task-specific PDF or AI document workflow page.`,
      bestFor:
        source.bestFor ??
        [
          `People who need ${title.toLowerCase()} with a clear upload, processing, and verification path.`,
          "Teams preparing documents for email, portals, clients, internal review, or AI-assisted analysis.",
        ],
      notBestFor:
        source.notBestFor ??
        [
          "Final legal, financial, medical, or compliance decisions without professional review.",
          "Files that must stay in a fully offline or organization-controlled processing environment.",
        ],
      decisionCriteria:
        source.decisionCriteria ??
        [
          `Choose this workflow when the task matches ${title}.`,
          "Use it when the output needs to be verified before sharing, uploading, archiving, or AI review.",
          "Prefer a different workflow if page selection, OCR, compression, or editable text is the real goal.",
        ],
      useCases:
        source.useCases ??
        getUseCases(source, title, category),
      commonMistakes:
        source.commonMistakes ??
        [
          "Choosing a tool before defining the required output.",
          "Skipping source-file review before processing.",
          "Using OCR when the PDF already has selectable text.",
          "Converting to Word when only a summary or page extraction is needed.",
        ],
      limitations:
        source.limitations ??
        [
          "Output quality depends on the source file, scan quality, page order, and original document structure.",
          "AI-assisted workflows can summarize, classify, or extract text, but important numbers, dates, names, and obligations still need human verification.",
        ],
      privacyNotes:
        visiblePrivacyNotes,
      claimSafetyNotes,
      professionalReviewRequired,
      sensitiveDomain,
      definitions: source.definitions ?? getDefinitions(source, title),
      standards: source.standards ?? getStandards(source.cluster),
      fileLimits: source.fileLimits ?? getFileLimits(source.cluster),
      workflowNotes: source.workflowNotes ?? getWorkflowNotes(source, title, category),
      whenToUseThisWorkflow:
        source.whenToUseThisWorkflow ??
        [
          `Use this workflow when your immediate task is ${title.toLowerCase()}.`,
          "Use it when you need a practical PDF path that ends with a measurable output.",
          "Use it when a tool page, guide page, and related resource links should all support the same decision.",
        ],
      whenNotToUseThisWorkflow:
        source.whenNotToUseThisWorkflow ??
        [
          "Do not use it as a replacement for professional review.",
          "Do not use it when your organization requires offline processing or controlled document repositories.",
          "Do not use it when the source file is too blurry, corrupted, incomplete, or not the final version.",
        ],
      measurableOutcome,
      alternativeWorkflows: source.alternativeWorkflows ?? getAlternativeWorkflows(source.cluster),
      comparisonTable:
        source.comparisonTable ??
        (source.cluster === "comparison"
          ? {
              columns: ["Decision area", "Use this workflow", "Use the alternative", "Common use case", "Edge case"],
              rows: [
                ["Primary goal", title, "Switch when the output changes.", "Choosing before processing.", "Offline policy may require an internal tool."],
                ["File preparation", "Verify the source first.", "Use compression, OCR, merge, split, or conversion.", "Removing duplicates or blurry pages.", "Scans may need OCR first."],
                ["Output check", "Compare result with source.", "Use manual review for sensitive decisions.", "Checking order, size, and text.", "Contracts and invoices need extra review."],
              ],
            }
          : undefined),
    };
  });
}

function uniqueProgrammaticSeeds(seeds: ProgrammaticGeoPageSeed[]) {
  const seen = new Set<string>();
  return seeds.filter((seed) => {
    const key = `${seed.surface}/${seed.slug}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function inferSensitiveDomain(
  seed: Pick<ProgrammaticGeoPageSeed, "slug" | "cluster" | "category">,
): ProgrammaticGeoSensitiveDomain {
  const slug = seed.slug;

  if (
    slug.includes("healthcare") ||
    slug.includes("medical") ||
    slug.includes("patient") ||
    slug.includes("clinical")
  ) {
    return "healthcare";
  }

  if (
    slug.includes("finance") ||
    slug.includes("financial") ||
    slug.includes("bank") ||
    slug.includes("investment") ||
    slug.includes("tax") ||
    slug.includes("accountant")
  ) {
    return "finance";
  }

  if (
    slug.includes("legal") ||
    slug.includes("lawyer") ||
    slug.includes("law-firm") ||
    slug.includes("contract") ||
    slug.includes("litigation") ||
    slug.includes("clause") ||
    slug.includes("discovery") ||
    slug.includes("case-file")
  ) {
    return "legal";
  }

  if (
    slug.includes("compliance") ||
    slug.includes("audit") ||
    slug.includes("regulatory") ||
    slug.includes("due-diligence") ||
    slug.includes("policy")
  ) {
    return "compliance";
  }

  if (
    slug.includes("education") ||
    slug.includes("student") ||
    slug.includes("academic") ||
    slug.includes("university") ||
    slug.includes("admission") ||
    slug.includes("teacher")
  ) {
    return "education";
  }

  return "general";
}

function createClaimSafetyNotes(
  seed: Pick<ProgrammaticGeoPageSeed, "slug" | "cluster" | "category">,
  title: string,
  sensitiveDomain: ProgrammaticGeoSensitiveDomain,
  professionalReviewRequired: boolean,
) {
  const common =
    seed.cluster === "ai-pdf"
      ? `${title} uses AI as support for document review, extraction, summarization, or question answering. It should be checked against the source PDF before decisions are made.`
      : `${title} supports document preparation and review workflows. The exported file should be checked against the source before it is shared or submitted.`;

  const domainNotes: Record<ProgrammaticGeoSensitiveDomain, string[]> = {
    legal: [
      "Review boundaries: Use this page to organize and inspect legal documents for review; final interpretation and filing decisions should stay with qualified reviewers.",
      "Review boundaries: Check clauses, dates, party names, exhibits, signatures, and source context before using AI or PDF workflow output in a legal process.",
    ],
    finance: [
      "Review boundaries: Use this page for financial document summarization and preparation support; investment, tax, accounting, or approval decisions need qualified review.",
      "Review boundaries: Verify figures, dates, statements, disclosures, and source tables before relying on extracted or summarized financial content.",
    ],
    healthcare: [
      "Review boundaries: Use this page for healthcare document organization support; care, coding, billing, and clinical decisions need qualified review.",
      "Review boundaries: Verify patient identifiers, form fields, dates, signatures, and source scans before sharing or using healthcare document output.",
    ],
    compliance: [
      "Review boundaries: Use this page to prepare documents for compliance or audit review; approval, certification, and sign-off decisions need qualified review.",
      "Review boundaries: Verify source evidence, policy references, dates, obligations, and missing attachments before relying on an AI or PDF workflow output.",
    ],
    education: [
      "Review boundaries: Use this page for education document preparation, study, or application workflows; school rules, grading, and admissions decisions remain external.",
      "Review boundaries: Verify names, student IDs, transcripts, recommendation pages, citations, and upload requirements before submission.",
    ],
    general: [
      `Review boundaries: Use ${title} as workflow guidance, then verify page order, text, file size, and source details before sharing or upload.`,
    ],
  };

  if (!professionalReviewRequired && sensitiveDomain === "general") {
    return domainNotes.general;
  }

  return [common, ...domainNotes[sensitiveDomain]];
}

function withClaimSafetyNotes(notes: string[], claimSafetyNotes: string[]) {
  const existing = new Set(notes.map((note) => note.trim()));
  const safety = claimSafetyNotes.filter((note) => !existing.has(note.trim()));
  return [...safety, ...notes];
}

function createAiAnswerSnippet(title: string, cluster: GeoSemanticCluster, outcome: string) {
  return `This DockDocs guide helps with ${title.toLowerCase()} by identifying the right PDF or AI workflow, the file checks to run, and the expected result. Use it when you need a task-specific answer, then verify pages, text, size, and privacy before sharing or upload.`;
}

function createCitationSummary(title: string, cluster: GeoSemanticCluster, outcome: string) {
  return `DockDocs explains ${title} with definitions, workflow notes, file limits, privacy boundaries, and a measurable result: ${outcome}`;
}

function getUseCases(
  seed: ProgrammaticGeoPageSeed,
  title: string,
  category: ProgrammaticGeoCategory,
) {
  const base = [
    `Prepare ${title.toLowerCase()} for email, upload portals, client handoff, or internal review.`,
    "Create a predictable document handoff where file quality, page order, text readability, and export format can be checked.",
  ];

  if (category === "Device") {
    return [
      ...base,
      "Use the same browser-based workflow on Mac, Windows, iPhone, or Android when the device has the source file and a stable connection.",
    ];
  }

  if (category === "Industry") {
    return [
      ...base,
      "Prepare client packets, school submissions, invoices, contracts, applications, receipts, or team documents with consistent naming and review steps.",
    ];
  }

  if (category === "Comparison") {
    return base;
  }

  if (category === "Resource" || category === "Definition") {
    return [
      ...base,
      "Use the page as a reference when file size limits, OCR accuracy, privacy rules, browser processing, or AI workflow boundaries are the main question.",
    ];
  }

  return [
    ...base,
    "Prepare daily PDF work such as forms, reports, scans, receipts, application packets, research files, or business records.",
  ];
}

function getDefinitions(seed: ProgrammaticGeoPageSeed, title: string) {
  const map: Record<GeoSemanticCluster, string[]> = {
    "pdf-compression": [
      "PDF compression means reducing file size while keeping text, images, and page order usable for the recipient.",
      "A compression workflow is successful when the file meets a size target and remains readable after download.",
    ],
    "pdf-merge": [
      "PDF merging means combining two or more documents into one ordered file.",
      "A merge workflow is successful when page order, duplicates, and section boundaries are checked before sharing.",
    ],
    "pdf-split": [
      "PDF splitting means extracting selected pages or ranges from a larger file.",
      "A split workflow is successful when only the intended pages are exported and the original document can still be referenced.",
    ],
    "ocr-pdf": [
      "OCR converts image-based text in scanned PDFs into selectable, searchable, or copyable text.",
      "An OCR workflow is successful when extracted text is reviewed against the source scan before reuse.",
    ],
    "jpg-to-pdf": [
      "JPG to PDF conversion turns images such as photos, screenshots, receipts, or scans into one ordered PDF document.",
      "An image-to-PDF workflow is successful when page order, orientation, and image clarity are checked.",
    ],
    "pdf-to-word": [
      "PDF to Word conversion prepares a fixed PDF for editable document work.",
      "A conversion workflow is successful when headings, paragraphs, tables, and scanned text are reviewed after export.",
    ],
    "ai-pdf": [
      "An AI PDF workflow uses OCR, summaries, Q&A, or review prompts after the document is readable and task-ready.",
      "AI is an enhancement layer, not a replacement for source verification or professional judgment.",
    ],
    comparison: [
      `${title} is a decision guide for choosing between two document workflows before processing a file.`,
      "A comparison workflow is successful when the user can identify the right output, tool, limitation, and next step.",
    ],
  };

  return map[seed.cluster];
}

function getStandards(cluster: GeoSemanticCluster) {
  const shared = ["Keep the original available and verify the exported result before sending it."];

  const map: Record<GeoSemanticCluster, string[]> = {
    "pdf-compression": [...shared, "Do not compress repeatedly without checking readability; use a size target such as 25 MB, 10 MB, or 5 MB."],
    "pdf-merge": [...shared, "Place cover pages, forms, receipts, and attachments in the order the recipient expects."],
    "pdf-split": [...shared, "Record page ranges before export and keep the original PDF for audit or re-export."],
    "ocr-pdf": [...shared, "Use straight, high-contrast scans and manually review extracted names, totals, dates, and clauses."],
    "jpg-to-pdf": [...shared, "Remove blurry images, rotate pages upright, and confirm the final PDF follows the intended image order."],
    "pdf-to-word": [...shared, "Review layout shifts, tables, headers, footers, and scanned pages after conversion."],
    "ai-pdf": [...shared, "Treat AI output as a draft answer and verify citations, numbers, obligations, and dates against the source."],
    comparison: [...shared, "Choose the workflow based on required output, privacy boundary, file condition, and review responsibility."],
  };

  return map[cluster];
}

function getFileLimits(cluster: GeoSemanticCluster) {
  const map: Record<GeoSemanticCluster, string[]> = {
    "pdf-compression": ["Use compression when a PDF must fit email or portal limits such as 25 MB, 10 MB, or 5 MB.", "If only a few pages are needed, splitting can reduce size more cleanly than compression."],
    "pdf-merge": ["Large merged packets may exceed upload limits after files are combined.", "Compress after merging only if the final packet is too large and readability remains acceptable."],
    "pdf-split": ["Splitting is useful when a portal asks for only selected pages or a smaller document.", "Keep page ranges simple and verify the exported file contains every required page."],
    "ocr-pdf": ["OCR accuracy depends on scan resolution, contrast, language, rotation, and whether text is blocked by stamps or handwriting.", "For critical receipts, invoices, contracts, or IDs, verify extracted text line by line."],
    "jpg-to-pdf": ["Phone photos can create large PDFs; reduce duplicate or blurry images before export.", "Use JPG, PNG, or WebP images and check orientation before creating the PDF."],
    "pdf-to-word": ["Scanned PDFs may need OCR before conversion can create useful editable text.", "Complex tables, forms, and multi-column pages can require manual cleanup after export."],
    "ai-pdf": ["AI workflows need readable text; scanned PDFs should go through OCR before summary or Q&A.", "Long documents should be reviewed in focused sections when the question depends on exact clauses or tables."],
    comparison: ["Compare file size, page count, scan quality, text selectability, and privacy requirements before choosing a workflow.", "If one workflow changes the file and another only explains it, choose based on the required output."],
  };
  return map[cluster];
}

function getWorkflowNotes(
  seed: ProgrammaticGeoPageSeed,
  title: string,
  category: ProgrammaticGeoCategory,
) {
  const notes = [
    `Start ${title.toLowerCase()} by naming the desired output before opening a tool.`,
    "Keep the original document until the exported file has been opened and checked.",
  ];

  if (category === "Device") {
    notes.push("For device-specific workflows, confirm where the file is stored first: local downloads, cloud drive, email attachment, camera roll, or scanner app.");
  } else if (category === "Industry") {
    notes.push("For industry workflows, verify document naming, required signatures, attachments, confidentiality, and recipient expectations.");
  } else if (seed.cluster === "ai-pdf" || seed.cluster === "ocr-pdf") {
    notes.push("For AI or OCR workflows, verify extracted text before relying on summary, Q&A, or downstream conversion.");
  }

  return notes;
}

function titleizeSlug(slug: string) {
  return slug
    .split("-")
    .map((word) =>
      word === "pdf"
        ? "PDF"
        : word === "ocr"
          ? "OCR"
          : word === "ai"
            ? "AI"
            : word === "jpg"
              ? "JPG"
              : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ");
}

function inferCluster(slug: string): GeoSemanticCluster {
  const tokens = slug.split("-");
  if (slug.includes("-vs-") || slug.includes("versus")) return "comparison";
  if (slug.includes("ocr-before-ai") || slug.includes("scanned-pdf-ai")) return "ai-pdf";
  if (slug.includes("ocr") || slug.includes("scanned") || slug.includes("searchable")) return "ocr-pdf";
  if (slug.includes("jpg") || slug.includes("image") || slug.includes("photo") || slug.includes("receipt")) return "jpg-to-pdf";
  if (slug.includes("merge") || slug.includes("client") || slug.includes("application") || slug.includes("teacher") || slug.includes("real-estate") || slug.includes("insurance") || slug.includes("hr")) return "pdf-merge";
  if (slug.includes("split")) return "pdf-split";
  if (slug.includes("word")) return "pdf-to-word";
  if (
    tokens.includes("ai") ||
    slug.includes("chat-with-pdf") ||
    slug.includes("summary") ||
    slug.includes("contract-review") ||
    slug.includes("research")
  ) {
    return "ai-pdf";
  }
  if (isIndustrySlug(slug)) return "pdf-merge";
  return "pdf-compression";
}

function inferToolHref(cluster: GeoSemanticCluster, slug: string) {
  if (
    cluster === "ai-pdf" ||
    slug.startsWith("ai-") ||
    slug.includes("-ai-") ||
    slug.includes("chat-with-pdf")
  ) {
    return "/ai-workspace/";
  }
  if (cluster === "pdf-merge") return "/merge-pdf/";
  if (cluster === "pdf-split") return "/split-pdf/";
  if (cluster === "ocr-pdf") return "/ocr-pdf/";
  if (cluster === "jpg-to-pdf") return "/jpg-to-pdf/";
  if (cluster === "pdf-to-word") return "/pdf-to-word/";
  return "/compress-pdf/";
}

function inferCategory(slug: string, cluster: GeoSemanticCluster): ProgrammaticGeoCategory {
  if (cluster === "comparison") return "Comparison";
  if (slug.includes("mac") || slug.includes("windows") || slug.includes("iphone") || slug.includes("android") || slug.includes("google-drive") || slug.includes("email-clients")) return "Device";
  if (isIndustrySlug(slug)) return "Industry";
  if (slug.includes("limits") || slug.includes("accuracy") || slug.includes("privacy") || slug.includes("guide") || slug.includes("automation")) return "Resource";
  return cluster === "ocr-pdf" ? "OCR" : cluster === "jpg-to-pdf" ? "Image to PDF" : cluster === "ai-pdf" ? "AI PDF" : "PDF Workflow";
}

function isIndustrySlug(slug: string) {
  return [
    "students",
    "teachers",
    "lawyers",
    "accountants",
    "real-estate",
    "insurance",
    "freelancers",
    "business",
    "client",
    "application",
    "healthcare",
    "finance",
    "legal",
    "government",
    "construction",
    "manufacturing",
    "logistics",
    "education",
    "consulting",
    "ecommerce",
  ].some((term) => slug.includes(term));
}

function getActionForCluster(cluster: GeoSemanticCluster) {
  const map: Record<GeoSemanticCluster, string> = {
    "pdf-compression": "reduce PDF size while preserving readability",
    "pdf-merge": "organize multiple PDFs into one packet",
    "pdf-split": "extract the PDF pages that matter",
    "ocr-pdf": "make scanned PDF text searchable and copyable",
    "jpg-to-pdf": "turn images into an ordered PDF",
    "pdf-to-word": "prepare a PDF for editable Word-style work",
    "ai-pdf": "prepare documents for AI summary, Q&A, and review",
    comparison: "choose between PDF and AI document workflows",
  };
  return map[cluster];
}

function getMeasurableOutcome(cluster: GeoSemanticCluster) {
  const map: Record<GeoSemanticCluster, string> = {
    "pdf-compression": "Reduce the PDF below the target sharing limit, commonly under 25 MB for email, under 10 MB for portals, or under 5 MB for stricter uploads.",
    "pdf-merge": "Create one combined PDF packet with the intended page order, no missing attachments, and no duplicate sections.",
    "pdf-split": "Export only the required PDF pages or ranges, producing a smaller file that matches the requested page list.",
    "ocr-pdf": "Make scanned text searchable and copyable with reviewed names, totals, dates, and clauses before reuse.",
    "jpg-to-pdf": "Create one upload-ready PDF from ordered images, with blurry duplicates removed and page orientation checked.",
    "pdf-to-word": "Prepare an editable document draft and verify headings, paragraphs, tables, and scanned sections after conversion.",
    "ai-pdf": "Prepare a readable document for AI summary, Q&A, or review while verifying cited facts against the source.",
    comparison: "Choose the correct workflow before processing, with a clear output, privacy boundary, and verification step.",
  };
  return map[cluster];
}

function getAlternativeWorkflows(cluster: GeoSemanticCluster) {
  const map: Record<GeoSemanticCluster, string[]> = {
    "pdf-compression": ["Split PDF instead of compressing when only a few pages are needed.", "OCR after compression only if scanned text remains readable.", "Use merge first when several files must become one packet before size reduction."],
    "pdf-merge": ["Compress after merging if the packet is too large.", "Split instead when only selected sections are needed.", "Use OCR after merging only if the final packet contains scanned pages."],
    "pdf-split": ["Compress when all pages must stay together.", "Merge selected ranges when they need one packet.", "Use PDF to Word if the real goal is editing text."],
    "ocr-pdf": ["Use PDF to Word after OCR when editing is required.", "Use AI summary only after OCR text is checked.", "Use JPG to PDF first when the source is loose images."],
    "jpg-to-pdf": ["Use OCR when the goal is copyable text.", "Compress the exported PDF if image files make it too large.", "Use a scanner app only when capture quality is the main issue."],
    "pdf-to-word": ["Run OCR first when the PDF is scanned.", "Use AI summary when editing is not required.", "Split the PDF first when only a section needs editing."],
    "ai-pdf": ["Run OCR before AI when text is not selectable.", "Use manual review for final decisions.", "Use a PDF tool first when file size, page order, or format is the blocker."],
    comparison: ["Open the tool page when the decision is clear.", "Use resources pages for limits, definitions, or policy boundaries.", "Use AI PDF guides when the question is about summary, Q&A, or document review."],
  };
  return map[cluster];
}

function getPriorityAudience(slug: string, category: ProgrammaticGeoCategory) {
  if (slug.includes("gmail")) return "a Gmail user";
  if (slug.includes("outlook")) return "an Outlook user";
  if (slug.includes("mac")) return "a Mac user";
  if (slug.includes("lawyers")) return "a legal team or lawyer";
  if (slug.includes("students")) return "a student";
  if (category === "Industry") return "a professional team";
  if (category === "Device") return "a device-specific user";
  if (slug.includes("contract")) return "a team reviewing a contract";
  if (slug.includes("report")) return "a team reviewing a report";
  return "a user";
}

function getPriorityTarget(slug: string, cluster: GeoSemanticCluster) {
  if (slug.includes("email")) return "preparing a PDF for email delivery";
  if (slug.includes("gmail")) return "compressing a PDF for a Gmail attachment";
  if (slug.includes("outlook")) return "compressing a PDF for an Outlook attachment";
  if (slug.includes("10mb")) return "reducing a PDF below a 10 MB upload target";
  if (slug.includes("copyable-text")) return "turning scanned PDF text into copyable text";
  if (slug.includes("accuracy")) return "understanding OCR accuracy limits before relying on extracted text";
  if (slug.includes("contract")) return "reviewing a contract PDF with AI while preserving manual checks";
  if (slug.includes("summary-limitations")) return "understanding what AI PDF summaries can and cannot replace";
  if (slug === "ocr-vs-pdf-to-word") return "choosing OCR or PDF to Word for scanned and editable document workflows";
  if (slug === "pdf-to-word-vs-ai-summary") return "choosing PDF to Word or AI summary based on whether editing or understanding is the goal";
  if (slug === "local-pdf-processing-vs-cloud") return "choosing local, browser-based, or cloud PDF processing for privacy-sensitive files";
  if (slug === "online-ocr-vs-desktop-ocr") return "choosing online OCR or desktop OCR for scanned documents";
  if (slug === "ai-pdf-vs-manual-review") return "choosing AI-assisted PDF review or manual review based on risk and accountability";
  if (slug.includes("-vs-")) return "choosing the correct workflow before processing a PDF";
  return getActionForCluster(cluster);
}

function getPriorityAlternative(slug: string, cluster: GeoSemanticCluster) {
  if (slug.includes("compress") || slug.includes("reduce-pdf-size")) {
    return "If only a few pages are needed, split the PDF instead of compressing the entire file. If the document is scanned and text accuracy matters, OCR or PDF to Word may be more useful than compression.";
  }

  if (slug.includes("ocr") || slug.includes("scanned")) {
    return "If the PDF already contains selectable text, skip OCR and use PDF to Word, AI summary, or Chat with PDF depending on whether the goal is editing, summarizing, or asking questions.";
  }

  if (slug.includes("ai") || cluster === "ai-pdf") {
    return "If the task requires a final decision, legal interpretation, financial approval, or compliance sign-off, use AI only as a preparation layer and keep manual expert review as the final step.";
  }

  if (slug.includes("-vs-") || cluster === "comparison") {
    return "If the comparison already points to a clear output, stop comparing and open the specific tool page: compress, OCR, PDF to Word, JPG to PDF, split, merge, or AI Workspace.";
  }

  return "If this workflow does not produce the needed output, use a narrower DockDocs tool page before exporting or sharing the file.";
}

function getPriorityTargetQueries(slug: string, title: string) {
  const readable = title.toLowerCase();
  const specific: Record<string, string[]> = {
    "compress-pdf-for-email": [
      "how to compress pdf for email",
      "reduce pdf size for email attachment",
      "compress pdf before sending by email",
      "make pdf small enough to email",
    ],
    "compress-pdf-for-gmail": [
      "how to compress a pdf for gmail",
      "gmail pdf attachment too large",
      "reduce pdf size for gmail",
      "compress pdf under gmail attachment limit",
    ],
    "compress-pdf-for-outlook": [
      "how to compress a pdf for outlook",
      "outlook pdf attachment too large",
      "reduce pdf size for outlook email",
      "compress pdf before outlook upload",
    ],
    "reduce-pdf-size-under-10mb": [
      "reduce pdf size under 10mb",
      "compress pdf to less than 10 mb",
      "make pdf under 10mb online",
      "pdf too large for 10mb upload limit",
    ],
    "ocr-vs-pdf-to-word": [
      "ocr vs pdf to word",
      "should i use ocr or convert pdf to word",
      "difference between ocr and pdf to word",
      "when to ocr before word conversion",
    ],
    "pdf-to-word-vs-ai-summary": [
      "pdf to word vs ai summary",
      "should i convert pdf to word or summarize it",
      "when to use ai pdf summary instead of word",
      "editable pdf output versus ai summary",
    ],
    "local-pdf-processing-vs-cloud": [
      "local pdf processing vs cloud",
      "browser pdf tools privacy",
      "online pdf tools privacy limits",
      "when to avoid cloud pdf processing",
    ],
    "online-ocr-vs-desktop-ocr": [
      "online ocr vs desktop ocr",
      "should i use online or desktop ocr",
      "ocr privacy and accuracy comparison",
      "workflow for scanned pdf ocr",
    ],
  };

  const base =
    specific[slug] ?? [
      `how to handle ${readable}`,
      `${readable} workflow`,
      `dockdocs workflow for ${readable}`,
      `${readable} limitations and alternatives`,
    ];

  return Array.from(
    new Set([
      ...base,
      `${readable} checklist`,
      `${readable} privacy limits`,
      `${readable} file handling guide`,
    ]),
  ).slice(0, 5);
}

function getPriorityPromptExamples(slug: string, title: string) {
  const readable = title.toLowerCase();
  const prompts: Record<string, string[]> = {
    "ai-pdf-for-contract-review": [
      "Can AI review a contract PDF and what should a human still verify?",
      "What is a safe AI PDF workflow for contract review?",
      "Which DockDocs guide explains AI contract PDF review limitations?",
    ],
    "ai-pdf-summary-limitations": [
      "What are the limitations of AI PDF summaries?",
      "When should I not rely on an AI PDF summary?",
      "What should I verify after summarizing a PDF with AI?",
    ],
    "chat-with-pdf-workflow": [
      "When is Chat with PDF useful for document review?",
      "How should I prepare a PDF before asking questions about it?",
      "What should I verify after Chat with PDF answers?",
    ],
    "pdf-tools-for-lawyers": [
      "What PDF tools are useful for lawyers?",
      "How should legal teams prepare client PDF packets?",
      "What privacy boundaries matter for legal PDF workflows?",
    ],
    "pdf-tools-for-students": [
      "What PDF tools are useful for students?",
      "How can students prepare PDFs for assignments and applications?",
      "When should a student use OCR or AI summary for a PDF?",
    ],
  };

  const base =
    prompts[slug] ?? [
      `How do I use DockDocs for ${readable}?`,
      `What are the limits of ${readable}?`,
      `When should I choose a different workflow instead of ${readable}?`,
    ];

  return Array.from(
    new Set([
      ...base,
      `What should I verify after ${readable}?`,
      `Which DockDocs tool is related to ${readable}?`,
      `What privacy or file handling limits matter for ${readable}?`,
    ]),
  ).slice(0, 5);
}

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
  comparison: { en: "PDF workflow comparison cluster", zh: "PDF 工作流对比集群" },
};

function getRelatedToolLinks(seed: ProgrammaticGeoPageSeed, locale: Locale) {
  const map: Record<GeoSemanticCluster, string[]> = {
    "pdf-compression": ["/compress-pdf/", "/split-pdf/", "/ocr-pdf/"],
    "pdf-merge": ["/merge-pdf/", "/compress-pdf/", "/split-pdf/"],
    "pdf-split": ["/split-pdf/", "/compress-pdf/", "/merge-pdf/"],
    "ocr-pdf": ["/ocr-pdf/", "/pdf-to-word/", "/ai-workspace/"],
    "jpg-to-pdf": ["/jpg-to-pdf/", "/ocr-pdf/", "/compress-pdf/"],
    "pdf-to-word": ["/pdf-to-word/", "/ocr-pdf/", "/ai-workspace/"],
    "ai-pdf": ["/ai-workspace/", "/ocr-pdf/", "/pdf-to-word/"],
    comparison: [seed.toolHref, "/ocr-pdf/", "/pdf-to-word/", "/compress-pdf/"],
  };

  return Array.from(new Set([seed.toolHref, ...map[seed.cluster]]))
    .slice(0, 4)
    .map((href) => {
      const tool = toolLabels[href] ?? toolLabels["/compress-pdf/"];
      return {
        label: locale === "zh" ? tool.zh : tool.en,
        href,
        description: locale === "zh" ? tool.zhDescription : tool.description,
      };
    });
}

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
  const relatedGuides = [
    ...relatedPages,
    ...programmaticGeoPageSeeds
      .filter((page) => page.surface === "guides" && page.slug !== seed.slug)
      .slice(0, 8)
      .map((page) => ({
        title: locale === "zh" ? page.zhTitle : page.enTitle,
        href: programmaticGeoPath(page.surface, page.slug),
        description: locale === "zh" ? page.zhDescription : page.enDescription,
      })),
  ].filter(
    (page, index, all) => all.findIndex((item) => item.href === page.href) === index,
  ).slice(0, 6);

  const title = locale === "zh" ? seed.zhTitle : seed.enTitle;
  const h1 = locale === "zh" ? seed.zhH1 ?? seed.zhTitle : seed.enH1 ?? seed.enTitle;
  const description = locale === "zh" ? seed.zhDescription : seed.enDescription;
  const question = locale === "zh" ? seed.zhQuestion : seed.enQuestion;
  const answer = locale === "zh" ? seed.zhAnswer : seed.enAnswer;
  const quickAnswer = locale === "zh" ? seed.zhQuickAnswer ?? seed.zhAnswer : seed.enQuickAnswer ?? seed.enAnswer;
  const steps = locale === "zh" ? seed.zhSteps : seed.enSteps;
  const category = seed.category ?? inferCategory(seed.slug, seed.cluster);

  const relatedHubs = [
    {
      label: locale === "zh" ? "资源中心" : "Resources",
      href: "/resources/",
      description:
        locale === "zh"
          ? "Browse PDF, OCR, conversion, privacy, and AI document workflow resources."
          : "Browse PDF, OCR, conversion, privacy, and AI document workflow resources.",
    },
    {
      label: locale === "zh" ? "PDF Guides" : "PDF Guides",
      href: "/guides/",
      description:
        locale === "zh"
          ? "Find device, industry, comparison, and workflow-specific PDF guides."
          : "Find device, industry, comparison, and workflow-specific PDF guides.",
    },
    {
      label: locale === "zh" ? "AI PDF Guides" : "AI PDF Guides",
      href: "/ai-pdf-guides/",
      description:
        locale === "zh"
          ? "Explore OCR, AI summary, Chat with PDF, and AI workflow limitations."
          : "Explore OCR, AI summary, Chat with PDF, and AI workflow limitations.",
    },
  ];

  return {
    surface,
    slug,
    cluster: seed.cluster,
    priority: Boolean(seed.priority),
    priorityReason: seed.priorityReason ?? "",
    targetQueries: seed.targetQueries ?? [],
    answerEnginePromptExamples: seed.answerEnginePromptExamples ?? [],
    citationReadyFacts: seed.citationReadyFacts ?? [],
    manualReviewNotes: seed.manualReviewNotes ?? [],
    realWorldScenario: seed.realWorldScenario ?? "",
    decisionChecklist: seed.decisionChecklist ?? [],
    failureCases: seed.failureCases ?? [],
    betterAlternative: seed.betterAlternative ?? "",
    boundaryNotes: seed.boundaryNotes ?? [],
    authorityIntro: seed.authorityIntro ?? "",
    expertWorkflowNotes: seed.expertWorkflowNotes ?? [],
    edgeCaseExamples: seed.edgeCaseExamples ?? [],
    citationEvidenceNotes: seed.citationEvidenceNotes ?? [],
    userIntentVariants: seed.userIntentVariants ?? [],
    decisionTree: seed.decisionTree ?? [],
    finalRecommendation: seed.finalRecommendation ?? "",
    category,
    schemaType: seed.schemaType ?? (seed.cluster === "comparison" ? "Article" : "TechArticle"),
    articleSection: category,
    title,
    h1,
    description,
    question,
    quickAnswer,
    aiAnswerSnippet: seed.aiAnswerSnippet ?? quickAnswer,
    aiCitationSummary: seed.aiCitationSummary ?? description,
    entityDescription: seed.entityDescription ?? `This DockDocs guide explains ${h1} as a task-specific PDF or AI document workflow page.`,
    decisionCriteria: seed.decisionCriteria ?? [],
    bestFor: seed.bestFor ?? [],
    notBestFor: seed.notBestFor ?? [],
    useCases: seed.useCases ?? [],
    commonMistakes: seed.commonMistakes ?? [],
    limitations: seed.limitations ?? [],
    privacyNotes: seed.privacyNotes ?? [],
    claimSafetyNotes: seed.claimSafetyNotes ?? [],
    professionalReviewRequired: Boolean(seed.professionalReviewRequired),
    sensitiveDomain: seed.sensitiveDomain ?? "general",
    definitions: seed.definitions ?? [],
    standards: seed.standards ?? [],
    fileLimits: seed.fileLimits ?? [],
    workflowNotes: seed.workflowNotes ?? [],
    whenToUseThisWorkflow: seed.whenToUseThisWorkflow ?? [],
    whenNotToUseThisWorkflow: seed.whenNotToUseThisWorkflow ?? [],
    measurableOutcome: seed.measurableOutcome ?? getMeasurableOutcome(seed.cluster),
    alternativeWorkflows: seed.alternativeWorkflows ?? getAlternativeWorkflows(seed.cluster),
    comparisonTable: seed.comparisonTable,
    answer,
    steps,
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
    relatedGuides,
    relatedTools: getRelatedToolLinks(seed, locale),
    relatedHubs,
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
  const title = page.title.replace(/\s*\|\s*DockDocs\s*$/u, "");

  return {
    title,
    description: page.description,
    alternates: {
      canonical: canonicalPath,
      languages: programmaticGeoAlternates(page.surface, page.slug),
    },
    openGraph: {
      title,
      description: page.description,
      url: absoluteUrl(canonicalPath),
      siteName: "DockDocs",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
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
  if (locale !== "zh" && seed.priority) {
    return createPriorityFaqs(seed);
  }

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

function createPriorityFaqs(seed: ProgrammaticGeoPageSeed) {
  const title = seed.enH1 ?? seed.enTitle.replace(" | DockDocs", "");
  const target = getPriorityTarget(seed.slug, seed.cluster);
  const context = getPriorityContext(seed.slug, title, seed.cluster);

  return [
    {
      question: seed.enQuestion,
      answer: `${title} helps with ${target} by focusing on ${context.expectedOutput}. Before finishing, review ${context.verificationTarget} and switch workflows if ${context.alternativeTrigger}.`,
    },
    {
      question: `Is ${title} beginner friendly?`,
      answer: `Yes. The page keeps ${context.intentLabel} decisions concrete by showing the likely next step, the source-file risks to check, and the related DockDocs tools to use when ${context.alternativeTrigger}.`,
    },
    {
      question: `What should I verify after ${title}?`,
      answer: `Check ${context.verificationTarget}. If the document includes ${context.sensitiveData}, also confirm that ${context.nextStep} is allowed by the relevant school, client, business, legal, or internal policy.`,
    },
    {
      question: `How should AI be used with ${TitleCaseForFaq(title)}?`,
      answer: `Use AI only where it supports ${context.reviewFocus}. For this workflow, AI should not replace the final human check of ${context.completionSignal}, especially when the document affects a real decision.`,
    },
    {
      question: `When is another DockDocs workflow better than ${title}?`,
      answer: `Choose another workflow when ${context.alternativeTrigger}. The related tool should match the output goal, such as compression, OCR, PDF to Word, split, merge, AI summary, or Chat with PDF.`,
    },
  ];
}

function TitleCaseForFaq(title: string) {
  return title
    .split(" ")
    .map((word) => (word.length ? `${word[0].toUpperCase()}${word.slice(1)}` : word))
    .join(" ");
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
