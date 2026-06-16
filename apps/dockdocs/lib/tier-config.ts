// Single source of truth for plan tier limits.
// Drives the pricing comparison table + future gating (feat-gating-enforce).
// NOTE: gating enforcement is NOT wired here yet — display only.

export type Tier = "free" | "plus" | "pro";

export type TierValue = { en: string; zh: string };

export type ToolItem = { slug: string; en: string; zh: string };

// Pro-only features that have no standalone tool page (can't be linked)
export type FeatureItem = {
  en: string;
  zh: string;
  status: "live" | "coming"; // "coming" renders as "Coming soon" pill
};

export type TierCategory = {
  id: string;
  label: TierValue;
  tools: ToolItem[];         // tools with their own /slug page
  features?: FeatureItem[];  // Pro-only capability items (no standalone page)
  limits: Record<Tier, TierValue>;
};

export const TIER_CATEGORIES: TierCategory[] = [
  {
    id: "basic-pdf",
    label: { en: "PDF tools (client-side, always free)", zh: "基础 PDF 工具（客户端，永久免费）" },
    tools: [
      { slug: "compress-pdf",  en: "Compress PDF",        zh: "PDF 压缩" },
      { slug: "merge-pdf",     en: "Merge PDF",           zh: "PDF 合并" },
      { slug: "split-pdf",     en: "Split PDF",           zh: "PDF 拆分" },
      { slug: "delete-page",   en: "Delete PDF Pages",    zh: "PDF 页面删除" },
      { slug: "rotate-page",   en: "Rotate PDF",          zh: "PDF 页面旋转" },
      { slug: "reorder-pages", en: "Reorder Pages",       zh: "PDF 页面排序" },
      { slug: "add-page",      en: "Add Pages to PDF",    zh: "PDF 页面添加" },
      { slug: "watermark-pdf", en: "Watermark PDF",       zh: "PDF 加水印" },
      { slug: "page-numbers",  en: "Add Page Numbers",    zh: "PDF 添加页码" },
      { slug: "crop-pdf",      en: "Crop PDF",            zh: "PDF 裁剪" },
      { slug: "protect-pdf",   en: "Protect PDF",         zh: "PDF 加密" },
      { slug: "unlock-pdf",    en: "Unlock PDF",          zh: "PDF 解密" },
      { slug: "sign-pdf",      en: "Sign PDF",            zh: "PDF 签名" },
      { slug: "redact-pdf",    en: "Redact PDF",          zh: "PDF 智能涂黑" },
      { slug: "ocr-pdf",       en: "OCR PDF",             zh: "PDF OCR" },
    ],
    limits: {
      free: { en: "♾",  zh: "♾" },
      plus: { en: "♾",  zh: "♾" },
      pro:  { en: "♾",  zh: "♾" },
    },
  },

  {
    id: "convert",
    label: { en: "Format conversion (single file)", zh: "格式转换（单文件）" },
    tools: [
      { slug: "pdf-to-word",     en: "PDF to Word",       zh: "PDF 转 Word" },
      { slug: "pdf-to-excel",    en: "PDF to Excel",      zh: "PDF 转 Excel" },
      { slug: "pdf-to-ppt",      en: "PDF to PowerPoint", zh: "PDF 转 PPT" },
      { slug: "pdf-to-pdfa",     en: "PDF to PDF/A",      zh: "PDF 转 PDF/A" },
      { slug: "pdf-to-image",    en: "PDF to Image",      zh: "PDF 转图片" },
      { slug: "pdf-to-html",     en: "PDF to HTML",       zh: "PDF 转 HTML" },
      { slug: "pdf-to-markdown", en: "PDF to Markdown",   zh: "PDF 转 Markdown" },
      { slug: "pdf-to-text",     en: "PDF to Text",       zh: "PDF 转文字" },
      { slug: "word-to-pdf",     en: "Word to PDF",       zh: "Word 转 PDF" },
      { slug: "excel-to-pdf",    en: "Excel to PDF",      zh: "Excel 转 PDF" },
      { slug: "ppt-to-pdf",      en: "PPT to PDF",        zh: "PPT 转 PDF" },
      { slug: "images-to-pdf",   en: "Images to PDF",     zh: "图片转 PDF" },
      { slug: "html-to-pdf",     en: "HTML to PDF",       zh: "HTML 转 PDF" },
      { slug: "url-to-pdf",      en: "URL to PDF",        zh: "网页转 PDF" },
    ],
    limits: {
      free: { en: "♾ fair use",  zh: "♾ 公平使用" },
      plus: { en: "♾",           zh: "♾" },
      pro:  { en: "♾",           zh: "♾" },
    },
  },

  {
    id: "batch",
    label: { en: "Batch processing", zh: "批量处理" },
    tools: [
      { slug: "batch-compress",      en: "Batch Compress",            zh: "批量 PDF 压缩" },
      { slug: "batch-pdf-to-image",  en: "Batch PDF to Image",        zh: "批量 PDF 转图片" },
      { slug: "batch-protect-pdf",   en: "Batch Encrypt PDF",         zh: "批量 PDF 加密" },
      { slug: "batch-rename-pdf",    en: "Batch Rename PDF",          zh: "批量 PDF 改名" },
      { slug: "batch-watermark-pdf", en: "Batch Watermark & Pages",   zh: "批量水印 & 页码" },
      { slug: "batch-page-numbers",  en: "Batch Add Page Numbers",    zh: "批量添加页码" },
      { slug: "batch-split-merge",   en: "Batch Split & Merge",       zh: "批量拆分合并" },
      { slug: "batch-rotate-pdf",    en: "Batch Rotate PDF",          zh: "批量旋转 PDF" },
      { slug: "batch-pdf-to-word",   en: "Batch PDF to Word",         zh: "批量 PDF 转 Word" },
      { slug: "batch-pdf-to-excel",  en: "Batch PDF to Excel",        zh: "批量 PDF 转 Excel" },
      { slug: "batch-word-to-pdf",   en: "Batch Word to PDF",         zh: "批量 Word 转 PDF" },
      { slug: "batch-excel-to-pdf",  en: "Batch Excel to PDF",        zh: "批量 Excel 转 PDF" },
      { slug: "batch-ppt-to-pdf",    en: "Batch PPT to PDF",          zh: "批量 PPT 转 PDF" },
      { slug: "batch-translate",     en: "Batch Translate",           zh: "批量翻译" },
      { slug: "batch-fix-scans",     en: "Batch Fix Scans",           zh: "批量修扫描" },
    ],
    limits: {
      free: { en: "≤ 3 files/batch · 3 batches/day", zh: "≤ 3文件/批 · 3批/天" },
      plus: { en: "≤ 20 files/batch",                 zh: "≤ 20文件/批" },
      pro:  { en: "♾ fair use",                       zh: "♾ 公平使用" },
    },
  },

  {
    id: "ai-standard",
    label: { en: "AI workflows — standard", zh: "AI 工作流（大路货）" },
    tools: [
      { slug: "ai-workspace",  en: "AI Workspace",          zh: "AI 工作台" },
      { slug: "chat-with-pdf", en: "Chat with PDF",         zh: "PDF 问答" },
      { slug: "ai-summary",    en: "AI Summary",            zh: "PDF 摘要提取" },
      { slug: "translate-pdf", en: "Translate PDF",         zh: "PDF 翻译" },
      { slug: "batch-summary", en: "Batch Summary",         zh: "批量摘要" },
      { slug: "batch-sort",    en: "Auto-Classify PDFs",    zh: "PDF 智能分类" },
    ],
    limits: {
      free: { en: "10 / day",   zh: "10次/天" },
      plus: { en: "200 / day",  zh: "200次/天" },
      pro:  { en: "♾",          zh: "♾" },
    },
  },

  {
    id: "ai-hero",
    label: { en: "AI heroes — specialized analysis", zh: "AI 英雄（专项分析）" },
    tools: [
      { slug: "compare",          en: "Compare Documents",      zh: "多文档对比" },
      { slug: "redline",          en: "Compare Versions",       zh: "PDF 版本对比" },
      { slug: "contract-risk",    en: "Contract Risk Check",    zh: "合同风险体检" },
      { slug: "govbid-matrix",    en: "Gov Bid Compliance",     zh: "政府标书合规矩阵" },
      { slug: "extract-to-excel", en: "Extract to Excel",       zh: "数据抽取到表格" },
      { slug: "lease-redflag",    en: "Lease Red Flag Check",   zh: "租约红旗扫描" },
    ],
    limits: {
      free: { en: "3 / day",                       zh: "3次/天" },
      plus: { en: "500 / month",                    zh: "500次/月" },
      pro:  { en: "♾  (~5 000/mo soft cap)",        zh: "♾（~5000/月软顶）" },
    },
  },

  {
    id: "hero-premium",
    label: { en: "Hero premium outputs", zh: "英雄高级输出" },
    tools: [],
    features: [
      { en: "Gov Bid → Excel matrix export",                        zh: "标书 Excel 矩阵导出",          status: "coming" },
      { en: "Statement batch processing + large files",             zh: "对账单批量处理 + 大文件",        status: "coming" },
      { en: "Extract line items + break 8-doc / 60 k-char cap",    zh: "抽取行项目 + 突破8份6万字符上限", status: "coming" },
      { en: "Hero large docs (long contracts · 100-300 page RFPs)", zh: "英雄大文档（长合同·100-300页RFP）", status: "coming" },
    ],
    limits: {
      free: { en: "—", zh: "—" },
      plus: { en: "—", zh: "—" },
      pro:  { en: "✓ Pro only", zh: "✓ 仅 Pro" },
    },
  },

  {
    id: "verticals",
    label: { en: "Professional verticals", zh: "专业领域" },
    tools: [],
    features: [
      { en: "Legal & contracts",          zh: "法律 / 合同",  status: "coming" },
      { en: "Finance & tax",              zh: "财务 / 税务",  status: "coming" },
      { en: "Research & academia",        zh: "科研 / 学术",  status: "coming" },
      { en: "Banking & finance",          zh: "金融 / 投行",  status: "coming" },
      { en: "Architecture & engineering", zh: "建筑 / 工程",  status: "coming" },
      { en: "Healthcare & medical",       zh: "医疗 / 健康",  status: "coming" },
    ],
    limits: {
      free: { en: "1 taste",          zh: "1次尝鲜" },
      plus: { en: "20 / month",       zh: "20次/月" },
      pro:  { en: "♾ all verticals",  zh: "♾ 全部垂直" },
    },
  },

  {
    id: "pro-exclusive",
    label: { en: "Pro exclusive", zh: "Pro 专属" },
    tools: [],
    features: [
      { en: "Private workspace",                                               zh: "私密工作区",                status: "live" },
      { en: "Unlimited fair-use — batch, AI & verticals (Plus is capped)",    zh: "无限（公平使用）批量/AI/垂直（Plus 有限额）", status: "live" },
      { en: "API access",                                                      zh: "API 访问",                  status: "coming" },
      { en: "Team seats",                                                      zh: "团队席位",                  status: "coming" },
      { en: "Priority processing",                                             zh: "优先处理",                  status: "coming" },
    ],
    limits: {
      free: { en: "—", zh: "—" },
      plus: { en: "—", zh: "—" },
      pro:  { en: "✓", zh: "✓" },
    },
  },
];
