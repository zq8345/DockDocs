import type { PdfToolPageConfig } from "../../../shared/templates/pdf-tool-page";
import {
  absoluteUrl,
  languageAlternates,
  localizedPath,
  type Locale,
  type ToolSlug,
} from "@/lib/i18n";

type ToolCopy = {
  title: string;
  description: string;
  keywords: string[];
  appName: string;
  schemaName: string;
  breadcrumbName: string;
  heroTitle: string;
  heroDescription: string;
  primaryActionLabel: string;
  stats: Array<[string, string]>;
  upload: PdfToolPageConfig["upload"];
  benefitsTitle: string;
  benefitsDescription: string;
  benefits: PdfToolPageConfig["benefits"];
  featuresTitle: string;
  featuresDescription: string;
  features: PdfToolPageConfig["features"];
  workflowTitle: string;
  workflowDescription: string;
  steps: string[];
  faqTitle: string;
  faq: PdfToolPageConfig["faq"];
  cta: PdfToolPageConfig["cta"];
};

const enTools: Record<ToolSlug, ToolCopy> = {
  "compress-pdf": {
    title: "Compress PDF Online Free | DockDocs",
    description:
      "Compress PDF files online with AI-powered optimization. Fast, secure, and free PDF compression tool.",
    keywords: ["compress pdf", "pdf compressor", "reduce pdf size", "compress pdf online"],
    appName: "DockDocs Compress PDF",
    schemaName: "DockDocs Compress PDF",
    breadcrumbName: "Compress PDF",
    heroTitle: "Compress PDF online free with AI-powered optimization",
    heroDescription:
      "Reduce PDF size for email, portals, forms, and document sharing inside the DockDocs PDF tools workspace.",
    primaryActionLabel: "Compress PDF",
    stats: [["Price", "Free"], ["Input", "PDF files"], ["Workspace", "AI documents"]],
    upload: {
      title: "Upload a PDF to compress",
      description: "Drag and drop a PDF file here, or choose a file from your device.",
      buttonLabel: "Choose PDF",
      note: "PDF only. Fast, secure, and designed for office documents.",
    },
    benefitsTitle: "Smaller PDFs without a heavy interface",
    benefitsDescription:
      "Upload, compress, review the result, and download a smaller file in a clear workflow.",
    benefits: [
      { title: "Fast compression", description: "Move from upload to reduced file size without clutter." },
      { title: "Office-ready", description: "Useful for portals, email limits, forms, and document handoff." },
      { title: "Clear result state", description: "Users see a believable compressed output before download." },
    ],
    featuresTitle: "Built for modern PDF compression",
    featuresDescription: "A consistent DockDocs light SaaS interface for everyday compression work.",
    features: [
      { title: "Upload PDF", description: "Start with a focused PDF upload area." },
      { title: "Compression progress", description: "Show processing progress before the result." },
      { title: "Download CTA", description: "Present a clear compressed PDF download action." },
      { title: "Responsive UI", description: "Works across desktop, tablet, and mobile screens." },
    ],
    workflowTitle: "How PDF compression fits into document work",
    workflowDescription:
      "Compress PDF helps when a file is too large for email, uploads, portals, or document archives.",
    steps: [
      "Select a PDF file from your device.",
      "Let DockDocs prepare the document for optimization.",
      "Download a smaller PDF for sharing, uploading, or archiving.",
    ],
    faqTitle: "PDF compression questions",
    faq: [
      { question: "How do I compress a PDF?", answer: "Upload a PDF, review the compression state, then download the compressed result." },
      { question: "Is the compressor free?", answer: "The page is designed as a free everyday PDF workflow." },
      { question: "Can I use it on mobile?", answer: "Yes. DockDocs pages are responsive for mobile and desktop." },
    ],
    cta: {
      eyebrow: "Compress PDF",
      title: "Start with a smaller, easier-to-share PDF.",
      description: "Reduce PDF size for upload limits, email, and clean document handoff.",
      buttonLabel: "Compress PDF now",
    },
  },
  "merge-pdf": {
    title: "Merge PDF Files Online Free | DockDocs",
    description:
      "Merge multiple PDF files into one organized document online. Fast, secure, and AI-ready PDF merge workflow.",
    keywords: ["merge pdf", "combine pdf", "merge pdf online", "pdf merger"],
    appName: "DockDocs Merge PDF",
    schemaName: "DockDocs Merge PDF",
    breadcrumbName: "Merge PDF",
    heroTitle: "Merge PDF files online into one organized document.",
    heroDescription:
      "Combine multiple PDFs into one clean packet for sharing, archiving, and review.",
    primaryActionLabel: "Merge PDF",
    stats: [["Price", "Free"], ["Input", "Multiple PDFs"], ["Output", "One PDF"]],
    upload: {
      title: "Upload PDFs to merge",
      description: "Drag and drop multiple PDF files here, or choose files from your device.",
      buttonLabel: "Choose PDFs",
      multiple: true,
      note: "PDF only. Built for organized document packets.",
    },
    benefitsTitle: "Combine PDFs without a heavy interface",
    benefitsDescription: "Upload, reorder, merge, and download one final PDF.",
    benefits: [
      { title: "One packet", description: "Turn scattered PDFs into a single organized document." },
      { title: "Reorder preview", description: "Show document order before merging." },
      { title: "Download result", description: "Present one merged file as the final output." },
    ],
    featuresTitle: "Built for PDF merge workflows",
    featuresDescription: "A clean SaaS-style merge flow for everyday document packets.",
    features: [
      { title: "Multi-file upload", description: "Upload more than one PDF." },
      { title: "Order simulation", description: "Preview the final file order." },
      { title: "Merge state", description: "Show the processing stage." },
      { title: "Merged file CTA", description: "Download one organized PDF." },
    ],
    workflowTitle: "How PDF merging fits into document work",
    workflowDescription: "Merge PDF is useful for client packets, applications, invoices, and report bundles.",
    steps: ["Upload multiple PDFs.", "Arrange the file order.", "Download one merged PDF."],
    faqTitle: "PDF merge questions",
    faq: [
      { question: "Can I upload multiple PDFs?", answer: "Yes. The merge workflow is designed for multi-file upload." },
      { question: "Can I reorder files?", answer: "The page includes a reorder simulation before the merged output." },
      { question: "What is the output?", answer: "The intended output is one organized PDF file." },
    ],
    cta: {
      eyebrow: "Merge PDF",
      title: "Create one clean document packet.",
      description: "Combine PDFs into one organized result for work, school, or client handoff.",
      buttonLabel: "Merge PDF now",
    },
  },
  "split-pdf": {
    title: "Split PDF Online Free | DockDocs",
    description:
      "Split PDF files into separate pages or extract page ranges online. Fast, secure, and AI-ready PDF split workflow.",
    keywords: ["split pdf", "pdf splitter", "extract pdf pages", "split pdf online"],
    appName: "DockDocs Split PDF",
    schemaName: "DockDocs Split PDF",
    breadcrumbName: "Split PDF",
    heroTitle: "Split PDF files online into separate pages or ranges.",
    heroDescription: "Extract pages, separate sections, and prepare focused document sets.",
    primaryActionLabel: "Split PDF",
    stats: [["Price", "Free"], ["Input", "One PDF"], ["Output", "Pages or ranges"]],
    upload: {
      title: "Upload a PDF to split",
      description: "Drag and drop a PDF file here, or choose a file from your device.",
      buttonLabel: "Choose PDF",
      note: "PDF only. Built for page extraction workflows.",
    },
    benefitsTitle: "Extract PDF pages without a heavy interface",
    benefitsDescription: "Upload a PDF, enter page ranges, preview the split, and export a ZIP.",
    benefits: [
      { title: "Focused exports", description: "Extract the pages you need without sending the whole file." },
      { title: "Range input", description: "Use clear page range syntax such as 1-4 or 12-18." },
      { title: "ZIP result", description: "Group split results into one export-ready ZIP." },
    ],
    featuresTitle: "Built for PDF splitting",
    featuresDescription: "A simple split workflow for extracting pages and page ranges.",
    features: [
      { title: "Upload PDF", description: "Start with one PDF file." },
      { title: "Page range field", description: "Show the range input users expect." },
      { title: "Split preview", description: "Preview the intended extracted sections." },
      { title: "Export ZIP", description: "Download all split outputs together." },
    ],
    workflowTitle: "How PDF splitting fits into document work",
    workflowDescription: "Split PDF helps prepare smaller files from reports, forms, scans, and packets.",
    steps: ["Upload one PDF.", "Enter page ranges.", "Export split pages as a ZIP."],
    faqTitle: "PDF split questions",
    faq: [
      { question: "Can I extract page ranges?", answer: "Yes. The workflow includes a page range input." },
      { question: "What is the output?", answer: "Split files are shown as a ZIP-ready export." },
      { question: "Does it work on scanned PDFs?", answer: "The page can present scanned PDFs as PDF inputs, though OCR is separate." },
    ],
    cta: {
      eyebrow: "Split PDF",
      title: "Extract only the pages you need.",
      description: "Prepare smaller document sets from one larger PDF.",
      buttonLabel: "Split PDF now",
    },
  },
  "pdf-to-word": {
    title: "PDF to Word Converter Online Free | DockDocs",
    description:
      "Convert PDF files to editable Word documents online. Fast, secure, and AI-ready PDF conversion workflow.",
    keywords: ["pdf to word", "convert pdf to word", "pdf word converter", "pdf to docx"],
    appName: "DockDocs PDF to Word",
    schemaName: "DockDocs PDF to Word Converter",
    breadcrumbName: "PDF to Word",
    heroTitle: "Convert PDF to Word online for editable documents.",
    heroDescription: "Turn PDFs into editable Word-oriented workflows for revisions and collaboration.",
    primaryActionLabel: "Convert PDF to Word",
    stats: [["Price", "Free"], ["Input", "PDF files"], ["Output", "Word documents"]],
    upload: {
      title: "Upload a PDF to convert",
      description: "Drag and drop a PDF file here, or choose a file from your device.",
      buttonLabel: "Choose PDF",
      note: "PDF only. Built for editable document workflows.",
    },
    benefitsTitle: "Create editable Word files without a heavy interface",
    benefitsDescription: "Upload, convert, preview editable structure, and download a DOCX-style result.",
    benefits: [
      { title: "Editable output", description: "Prepare PDF content for revision." },
      { title: "Structure preview", description: "Show headings, text, and tables before download." },
      { title: "DOCX CTA", description: "Guide users toward an editable document export." },
    ],
    featuresTitle: "Built for PDF to Word conversion",
    featuresDescription: "A clean conversion flow that feels like part of a document workspace.",
    features: [
      { title: "PDF upload", description: "Start from a focused PDF upload." },
      { title: "Conversion state", description: "Show that document structure is being prepared." },
      { title: "Editable preview", description: "Preview the Word-style output." },
      { title: "Download DOCX", description: "Present a clear export action." },
    ],
    workflowTitle: "How PDF to Word fits into document work",
    workflowDescription: "PDF to Word helps when a static PDF needs revision, reuse, or collaboration.",
    steps: ["Upload a PDF.", "Convert document structure.", "Download an editable Word document."],
    faqTitle: "PDF to Word questions",
    faq: [
      { question: "Can I edit the output?", answer: "The intended workflow prepares PDF content for editable DOCX-style output." },
      { question: "Will layout be perfect?", answer: "Conversion quality depends on the original PDF structure." },
      { question: "Is this AI-ready?", answer: "The workflow is designed to connect with future AI document review." },
    ],
    cta: {
      eyebrow: "PDF to Word",
      title: "Prepare PDFs for editing and reuse.",
      description: "Move from static documents into editable workflows.",
      buttonLabel: "Convert now",
    },
  },
  "ocr-pdf": {
    title: "OCR PDF Online Free | DockDocs",
    description:
      "Extract text from scanned PDF files online using AI-powered OCR workflows inside DockDocs.",
    keywords: ["ocr pdf", "pdf ocr", "scan pdf to text", "extract text from pdf"],
    appName: "DockDocs OCR PDF",
    schemaName: "DockDocs OCR PDF",
    breadcrumbName: "OCR PDF",
    heroTitle: "OCR PDF online for scanned documents and AI-ready text.",
    heroDescription: "Turn scanned PDFs into searchable, reusable text workflows inside DockDocs.",
    primaryActionLabel: "OCR PDF",
    stats: [["Price", "Free"], ["Input", "Scanned PDFs"], ["Output", "Extracted text"]],
    upload: {
      title: "Upload a scanned PDF",
      description: "Drag and drop a scanned PDF file here, or choose a file from your device.",
      buttonLabel: "Choose PDF",
      note: "PDF only. Built for scanned documents, forms, and text extraction.",
    },
    benefitsTitle: "Extract text from scans without a heavy interface",
    benefitsDescription: "Upload a scan, run OCR, review extracted text, copy it, or download text.",
    benefits: [
      { title: "Reusable text", description: "Move scanned pages into searchable text workflows." },
      { title: "OCR progress", description: "Show recognition progress before output." },
      { title: "Copy and download", description: "Offer text-focused result actions." },
    ],
    featuresTitle: "Built for OCR workflows",
    featuresDescription: "A clear AI-enhanced OCR page inside the PDF tools product.",
    features: [
      { title: "Scanned PDF upload", description: "Accept scanned PDF workflows." },
      { title: "OCR processing", description: "Show text recognition state." },
      { title: "Text output area", description: "Present extracted text clearly." },
      { title: "Copy/download CTA", description: "Support copy text and .txt export." },
    ],
    workflowTitle: "How OCR PDF fits into document work",
    workflowDescription: "OCR PDF helps convert image-based documents into searchable, reusable text.",
    steps: ["Upload a scanned PDF.", "Run OCR text recognition.", "Copy or download extracted text."],
    faqTitle: "OCR PDF questions",
    faq: [
      { question: "How accurate is OCR?", answer: "Accuracy depends on scan quality, contrast, language, and layout." },
      { question: "Can I copy extracted text?", answer: "The workflow includes copy and download text actions." },
      { question: "Is OCR an AI feature?", answer: "OCR is presented as an AI-ready document understanding layer." },
    ],
    cta: {
      eyebrow: "OCR PDF",
      title: "Turn scanned documents into reusable text.",
      description: "Extract, review, copy, and download text from scanned PDFs.",
      buttonLabel: "Start OCR",
    },
  },
  "jpg-to-pdf": {
    title: "JPG to PDF Converter Online Free | DockDocs",
    description:
      "Convert JPG images to PDF online for free. Fast, secure, and privacy-first JPG to PDF workflows inside DockDocs.",
    keywords: ["jpg to pdf", "image to pdf", "convert jpg to pdf", "jpg pdf converter", "photo to pdf"],
    appName: "DockDocs JPG to PDF",
    schemaName: "DockDocs JPG to PDF Converter",
    breadcrumbName: "JPG to PDF",
    heroTitle: "Convert JPG images to PDF in a clean document workflow.",
    heroDescription: "Turn JPG photos, scans, and image files into PDF documents for sharing and archiving.",
    primaryActionLabel: "Convert JPG to PDF",
    stats: [["Price", "Free"], ["Input", "JPG images"], ["Output", "PDF document"]],
    upload: {
      title: "Upload JPG images",
      description: "Drag and drop JPG images here, or choose photos from your device.",
      buttonLabel: "Choose JPG images",
      multiple: true,
      accept: "image/jpeg,image/png,image/webp",
      fileBadge: "IMG",
      note: "JPG, PNG, and WebP image workflows for PDF creation.",
    },
    benefitsTitle: "Create PDFs from images without a heavy editor",
    benefitsDescription: "Upload images, arrange page order, and export one PDF.",
    benefits: [
      { title: "Photo to document", description: "Convert receipts, notes, scans, and photos into PDFs." },
      { title: "Page ordering", description: "Preview image order before export." },
      { title: "PDF export", description: "Download one PDF document from images." },
    ],
    featuresTitle: "Built for JPG to PDF workflows",
    featuresDescription: "A white DockDocs PDF tools experience for image-to-document conversion.",
    features: [
      { title: "Image upload", description: "Accept JPG, PNG, and WebP images." },
      { title: "Multiple images", description: "Prepare several photos for one PDF." },
      { title: "Order preview", description: "Show image pages before export." },
      { title: "Export PDF", description: "Create one PDF-ready output." },
    ],
    workflowTitle: "How JPG to PDF fits into document work",
    workflowDescription: "JPG to PDF helps turn images into portable documents for storage, sharing, and handoff.",
    steps: ["Select one or more images.", "Arrange page order.", "Export a PDF document."],
    faqTitle: "JPG to PDF questions",
    faq: [
      { question: "Which image formats are accepted?", answer: "JPG to PDF accepts JPG, PNG, and WebP images." },
      { question: "Can I upload multiple images?", answer: "Yes. The workflow supports multiple image upload and page ordering." },
      { question: "What is the output?", answer: "The intended output is one PDF document." },
    ],
    cta: {
      eyebrow: "JPG to PDF",
      title: "Turn images into a PDF-ready document workflow.",
      description: "Prepare photos, scans, receipts, and images for PDF sharing.",
      buttonLabel: "Convert JPG now",
    },
  },
};

const zhTools: Record<ToolSlug, ToolCopy> = {
  "compress-pdf": {
    ...enTools["compress-pdf"],
    title: "在线免费压缩 PDF | DockDocs",
    description: "使用 DockDocs 在线压缩 PDF 文件，适合上传、邮件、表单和日常共享。",
    appName: "DockDocs 压缩 PDF",
    schemaName: "DockDocs 压缩 PDF",
    breadcrumbName: "压缩 PDF",
    heroTitle: "在线压缩 PDF，减小文件体积。",
    heroDescription: "为邮件、门户上传、表单提交和文档共享减小 PDF 文件体积。",
    primaryActionLabel: "压缩 PDF",
    stats: [["价格", "免费"], ["输入", "PDF 文件"], ["输出", "更小的 PDF"]],
    upload: { ...enTools["compress-pdf"].upload, title: "上传 PDF 进行压缩", description: "拖放 PDF 文件，或从设备中选择文件。", buttonLabel: "选择 PDF" },
    benefitsTitle: "用清晰流程压缩 PDF",
    benefitsDescription: "上传、压缩、查看结果并下载更小的文件。",
    workflowTitle: "PDF 压缩如何融入文档工作",
    workflowDescription: "当文件过大、无法上传或不便发送时，压缩 PDF 可以帮助完成交付。",
    steps: ["选择一个 PDF 文件。", "让 DockDocs 准备压缩。", "下载更小的 PDF。"],
    faqTitle: "PDF 压缩问题",
    faq: [
      { question: "如何压缩 PDF？", answer: "上传 PDF，查看压缩状态，然后下载压缩后的文件。" },
      { question: "是否免费？", answer: "该页面面向日常免费 PDF 压缩工作流设计。" },
      { question: "手机可以使用吗？", answer: "可以。页面支持移动端和桌面端。" },
    ],
    cta: { eyebrow: "压缩 PDF", title: "从更小、更易分享的 PDF 开始。", description: "用于上传限制、邮件和文档交付。", buttonLabel: "立即压缩" },
  },
  "merge-pdf": {
    ...enTools["merge-pdf"],
    title: "在线免费合并 PDF | DockDocs",
    description: "在线将多个 PDF 合并成一个有序文档。",
    appName: "DockDocs 合并 PDF",
    schemaName: "DockDocs 合并 PDF",
    breadcrumbName: "合并 PDF",
    heroTitle: "在线合并 PDF，生成一个有序文档。",
    heroDescription: "把多个 PDF 合并为一个清晰的文档包，适合共享、归档和审阅。",
    primaryActionLabel: "合并 PDF",
    stats: [["价格", "免费"], ["输入", "多个 PDF"], ["输出", "一个 PDF"]],
    upload: { ...enTools["merge-pdf"].upload, title: "上传要合并的 PDF", description: "拖放多个 PDF 文件，或从设备中选择文件。", buttonLabel: "选择 PDF 文件" },
    benefitsTitle: "轻松合并多个 PDF",
    benefitsDescription: "上传、排序、合并并下载一个最终 PDF。",
    workflowTitle: "PDF 合并如何融入文档工作",
    workflowDescription: "合并 PDF 适合客户资料包、申请材料、发票和报告合集。",
    steps: ["上传多个 PDF。", "调整文件顺序。", "下载合并后的 PDF。"],
    faqTitle: "PDF 合并问题",
    faq: [
      { question: "可以上传多个 PDF 吗？", answer: "可以，合并工作流支持多文件上传。" },
      { question: "可以调整顺序吗？", answer: "页面包含合并前的排序预览。" },
      { question: "输出是什么？", answer: "输出是一个有序的 PDF 文件。" },
    ],
    cta: { eyebrow: "合并 PDF", title: "创建一个清晰的文档包。", description: "将多个 PDF 合并为一个有序结果。", buttonLabel: "立即合并" },
  },
  "split-pdf": {
    ...enTools["split-pdf"],
    title: "在线免费拆分 PDF | DockDocs",
    description: "在线拆分 PDF 页面或提取页面范围。",
    appName: "DockDocs 拆分 PDF",
    schemaName: "DockDocs 拆分 PDF",
    breadcrumbName: "拆分 PDF",
    heroTitle: "在线拆分 PDF，提取页面或范围。",
    heroDescription: "从一个 PDF 中提取页面、分离章节或准备更小的文档集。",
    primaryActionLabel: "拆分 PDF",
    stats: [["价格", "免费"], ["输入", "一个 PDF"], ["输出", "页面或范围"]],
    upload: { ...enTools["split-pdf"].upload, title: "上传 PDF 进行拆分", description: "拖放 PDF 文件，或从设备中选择文件。", buttonLabel: "选择 PDF" },
    benefitsTitle: "快速提取 PDF 页面",
    benefitsDescription: "上传 PDF、输入页面范围、预览拆分并导出 ZIP。",
    workflowTitle: "PDF 拆分如何融入文档工作",
    workflowDescription: "拆分 PDF 可从报告、表单、扫描件和资料包中提取需要的页面。",
    steps: ["上传一个 PDF。", "输入页面范围。", "将拆分结果导出为 ZIP。"],
    faqTitle: "PDF 拆分问题",
    faq: [
      { question: "可以提取页面范围吗？", answer: "可以，工作流包含页面范围输入。" },
      { question: "输出是什么？", answer: "拆分结果以 ZIP 导出的形式呈现。" },
      { question: "扫描 PDF 可以用吗？", answer: "可以作为 PDF 输入；文字识别属于 OCR 工作流。" },
    ],
    cta: { eyebrow: "拆分 PDF", title: "只提取你需要的页面。", description: "从一个较大的 PDF 准备更小的文档集。", buttonLabel: "立即拆分" },
  },
  "pdf-to-word": {
    ...enTools["pdf-to-word"],
    title: "在线免费 PDF 转 Word | DockDocs",
    description: "将 PDF 在线转换为可编辑的 Word 文档工作流。",
    appName: "DockDocs PDF 转 Word",
    schemaName: "DockDocs PDF 转 Word",
    breadcrumbName: "PDF 转 Word",
    heroTitle: "在线将 PDF 转为可编辑 Word 文档。",
    heroDescription: "把 PDF 转入可编辑文档工作流，方便修改、协作和复用。",
    primaryActionLabel: "PDF 转 Word",
    stats: [["价格", "免费"], ["输入", "PDF 文件"], ["输出", "Word 文档"]],
    upload: { ...enTools["pdf-to-word"].upload, title: "上传要转换的 PDF", description: "拖放 PDF 文件，或从设备中选择文件。", buttonLabel: "选择 PDF" },
    benefitsTitle: "从 PDF 创建可编辑文档",
    benefitsDescription: "上传、转换、预览结构并下载 DOCX 风格结果。",
    workflowTitle: "PDF 转 Word 如何融入文档工作",
    workflowDescription: "当静态 PDF 需要修改、复用或协作时，PDF 转 Word 很有用。",
    steps: ["上传 PDF。", "转换文档结构。", "下载可编辑 Word 文档。"],
    faqTitle: "PDF 转 Word 问题",
    faq: [
      { question: "输出可以编辑吗？", answer: "该工作流面向可编辑 DOCX 风格输出设计。" },
      { question: "版式会完全一致吗？", answer: "转换质量取决于原始 PDF 结构。" },
      { question: "是否适合 AI 工作流？", answer: "该流程可连接未来 AI 文档审阅。" },
    ],
    cta: { eyebrow: "PDF 转 Word", title: "让 PDF 进入可编辑工作流。", description: "从静态文档进入可修改、可复用的流程。", buttonLabel: "立即转换" },
  },
  "ocr-pdf": {
    ...enTools["ocr-pdf"],
    title: "在线免费 OCR PDF | DockDocs",
    description: "使用 DockDocs 从扫描 PDF 中提取文本。",
    appName: "DockDocs OCR PDF",
    schemaName: "DockDocs OCR PDF",
    breadcrumbName: "OCR PDF",
    heroTitle: "OCR PDF：从扫描 PDF 提取可复用文字。",
    heroDescription: "将扫描 PDF 转换为可搜索、可复用的文本工作流。",
    primaryActionLabel: "OCR PDF",
    stats: [["价格", "免费"], ["输入", "扫描 PDF"], ["输出", "提取文本"]],
    upload: { ...enTools["ocr-pdf"].upload, title: "上传扫描 PDF", description: "拖放扫描 PDF，或从设备中选择文件。", buttonLabel: "选择 PDF" },
    benefitsTitle: "从扫描件中提取文本",
    benefitsDescription: "上传扫描件、运行 OCR、查看文本、复制或下载。",
    workflowTitle: "OCR PDF 如何融入文档工作",
    workflowDescription: "OCR PDF 可将图片型文档转换为可搜索、可复用文本。",
    steps: ["上传扫描 PDF。", "运行 OCR 识别。", "复制或下载提取文本。"],
    faqTitle: "OCR PDF 问题",
    faq: [
      { question: "OCR 准确率如何？", answer: "取决于扫描质量、对比度、语言和布局。" },
      { question: "可以复制文本吗？", answer: "工作流包含复制文本和下载文本操作。" },
      { question: "OCR 是 AI 功能吗？", answer: "OCR 被定位为 AI-ready 的文档理解层。" },
    ],
    cta: { eyebrow: "OCR PDF", title: "将扫描文档变成可复用文本。", description: "提取、复核、复制并下载扫描 PDF 中的文字。", buttonLabel: "开始 OCR" },
  },
  "jpg-to-pdf": {
    ...enTools["jpg-to-pdf"],
    title: "在线免费 JPG 转 PDF | DockDocs",
    description: "将 JPG 图片在线转换为 PDF，支持隐私优先的图片转文档工作流。",
    appName: "DockDocs JPG 转 PDF",
    schemaName: "DockDocs JPG 转 PDF",
    breadcrumbName: "JPG 转 PDF",
    heroTitle: "将 JPG 图片转换为清晰的 PDF 文档。",
    heroDescription: "把照片、扫描图和图片文件转换为适合共享和归档的 PDF。",
    primaryActionLabel: "JPG 转 PDF",
    stats: [["价格", "免费"], ["输入", "JPG 图片"], ["输出", "PDF 文档"]],
    upload: { ...enTools["jpg-to-pdf"].upload, title: "上传 JPG 图片", description: "拖放 JPG 图片，或从设备中选择照片。", buttonLabel: "选择 JPG 图片" },
    benefitsTitle: "从图片创建 PDF",
    benefitsDescription: "上传图片、调整页面顺序并导出一个 PDF。",
    workflowTitle: "JPG 转 PDF 如何融入文档工作",
    workflowDescription: "JPG 转 PDF 可将图片变成便于存储、共享和交付的文档。",
    steps: ["选择一张或多张图片。", "调整页面顺序。", "导出 PDF 文档。"],
    faqTitle: "JPG 转 PDF 问题",
    faq: [
      { question: "支持哪些图片格式？", answer: "JPG 转 PDF 支持 JPG、PNG 和 WebP 图片。" },
      { question: "可以上传多张图片吗？", answer: "可以，工作流支持多图片上传和页面排序。" },
      { question: "输出是什么？", answer: "输出是一个 PDF 文档。" },
    ],
    cta: { eyebrow: "JPG 转 PDF", title: "将图片转换为 PDF 文档工作流。", description: "为照片、扫描图和收据创建 PDF。", buttonLabel: "立即转换" },
  },
};

const localizedTools = {
  en: enTools,
  zh: zhTools,
};

export function getLocalizedToolConfig(
  locale: Locale,
  slug: ToolSlug,
): PdfToolPageConfig {
  return {
    slug,
    locale,
    canonicalPath: localizedPath(locale, slug),
    alternateLanguages: languageAlternates(slug),
    ...localizedTools[locale][slug],
  };
}

export function getLocalizedToolUrl(locale: Locale, slug: ToolSlug) {
  return absoluteUrl(localizedPath(locale, slug));
}
