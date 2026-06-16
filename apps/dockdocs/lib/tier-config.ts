// Single source of truth for plan tier limits.
// Drives the pricing comparison table + future gating (feat-gating-enforce).
// NOTE: gating enforcement is NOT wired here yet — display only.

export type Tier = "free" | "plus" | "pro";

export type TierValue = {
  en: string;
  zh: string;
  es: string;
  pt: string;
  fr: string;
  internal?: string; // NOT rendered on the pricing page; for gating config only
};

export type ToolItem = { slug: string; en: string; zh: string; es: string; pt: string; fr: string };

// Pro-only features that have no standalone tool page (can't be linked)
export type FeatureItem = {
  en: string;
  zh: string;
  es: string;
  pt: string;
  fr: string;
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
    label: {
      en: "PDF tools (client-side, always free)",
      zh: "基础 PDF 工具（客户端，永久免费）",
      es: "Herramientas PDF (en tu navegador, siempre gratis)",
      pt: "Ferramentas PDF (no navegador, sempre grátis)",
      fr: "Outils PDF (dans le navigateur, toujours gratuits)",
    },
    tools: [
      { slug: "compress-pdf",  en: "Compress PDF",        zh: "PDF 压缩",      es: "Comprimir PDF",            pt: "Comprimir PDF",              fr: "Compresser PDF" },
      { slug: "merge-pdf",     en: "Merge PDF",           zh: "PDF 合并",      es: "Combinar PDF",             pt: "Unir PDF",                   fr: "Fusionner PDF" },
      { slug: "split-pdf",     en: "Split PDF",           zh: "PDF 拆分",      es: "Dividir PDF",              pt: "Dividir PDF",                fr: "Diviser PDF" },
      { slug: "delete-page",   en: "Delete PDF Pages",    zh: "PDF 页面删除",  es: "Eliminar páginas",         pt: "Excluir páginas",            fr: "Supprimer des pages" },
      { slug: "rotate-page",   en: "Rotate PDF",          zh: "PDF 页面旋转",  es: "Rotar páginas",            pt: "Girar páginas",              fr: "Faire pivoter des pages" },
      { slug: "reorder-pages", en: "Reorder Pages",       zh: "PDF 页面排序",  es: "Reordenar páginas",        pt: "Reordenar páginas",          fr: "Réorganiser les pages" },
      { slug: "add-page",      en: "Add Pages to PDF",    zh: "PDF 页面添加",  es: "Añadir página",            pt: "Adicionar página",           fr: "Ajouter une page" },
      { slug: "watermark-pdf", en: "Watermark PDF",       zh: "PDF 加水印",    es: "Marca de agua en PDF",     pt: "Marca d'água em PDF",        fr: "Filigrane PDF" },
      { slug: "page-numbers",  en: "Add Page Numbers",    zh: "PDF 添加页码",  es: "Añadir números de página", pt: "Adicionar números de página", fr: "Numéros de page" },
      { slug: "crop-pdf",      en: "Crop PDF",            zh: "PDF 裁剪",      es: "Recortar PDF",             pt: "Recortar PDF",               fr: "Rogner PDF" },
      { slug: "protect-pdf",   en: "Protect PDF",         zh: "PDF 加密",      es: "Proteger PDF",             pt: "Proteger PDF",               fr: "Protéger PDF" },
      { slug: "unlock-pdf",    en: "Unlock PDF",          zh: "PDF 解密",      es: "Desbloquear PDF",          pt: "Desbloquear PDF",            fr: "Déverrouiller PDF" },
      { slug: "sign-pdf",      en: "Sign PDF",            zh: "PDF 签名",      es: "Firmar PDF",               pt: "Assinar PDF",                fr: "Signer PDF" },
      { slug: "redact-pdf",    en: "Redact PDF",          zh: "PDF 智能涂黑",  es: "Censurar PDF",             pt: "Redigir PDF",                fr: "Caviarder PDF" },
      { slug: "ocr-pdf",       en: "OCR PDF",             zh: "PDF OCR",       es: "OCR de PDF",               pt: "OCR de PDF",                 fr: "OCR PDF" },
    ],
    limits: {
      free: { en: "Unlimited", zh: "无限", es: "Ilimitado", pt: "Ilimitado", fr: "Illimité" },
      plus: { en: "Unlimited", zh: "无限", es: "Ilimitado", pt: "Ilimitado", fr: "Illimité" },
      pro:  { en: "Unlimited", zh: "无限", es: "Ilimitado", pt: "Ilimitado", fr: "Illimité" },
    },
  },

  {
    id: "convert",
    label: {
      en: "Format conversion (single file)",
      zh: "格式转换（单文件）",
      es: "Conversión de formatos (archivo único)",
      pt: "Conversão de formatos (arquivo único)",
      fr: "Conversion de formats (fichier unique)",
    },
    tools: [
      { slug: "pdf-to-word",     en: "PDF to Word",       zh: "PDF 转 Word",     es: "PDF a Word",     pt: "PDF para Word",     fr: "PDF en Word" },
      { slug: "pdf-to-excel",    en: "PDF to Excel",      zh: "PDF 转 Excel",    es: "PDF a Excel",    pt: "PDF para Excel",    fr: "PDF en Excel" },
      { slug: "pdf-to-ppt",      en: "PDF to PowerPoint", zh: "PDF 转 PPT",      es: "PDF a PPT",      pt: "PDF para PPT",      fr: "PDF en PPT" },
      { slug: "pdf-to-pdfa",     en: "PDF to PDF/A",      zh: "PDF 转 PDF/A",    es: "PDF a PDF/A",    pt: "PDF para PDF/A",    fr: "PDF en PDF/A" },
      { slug: "pdf-to-image",    en: "PDF to Image",      zh: "PDF 转图片",      es: "PDF a imagen",   pt: "PDF para imagem",   fr: "PDF en image" },
      { slug: "pdf-to-html",     en: "PDF to HTML",       zh: "PDF 转 HTML",     es: "PDF a HTML",     pt: "PDF para HTML",     fr: "PDF en HTML" },
      { slug: "pdf-to-markdown", en: "PDF to Markdown",   zh: "PDF 转 Markdown", es: "PDF a Markdown", pt: "PDF para Markdown", fr: "PDF en Markdown" },
      { slug: "pdf-to-text",     en: "PDF to Text",       zh: "PDF 转文字",      es: "PDF a Texto",    pt: "PDF para Texto",    fr: "PDF en Texte" },
      { slug: "word-to-pdf",     en: "Word to PDF",       zh: "Word 转 PDF",     es: "Word a PDF",     pt: "Word para PDF",     fr: "Word en PDF" },
      { slug: "excel-to-pdf",    en: "Excel to PDF",      zh: "Excel 转 PDF",    es: "Excel a PDF",    pt: "Excel para PDF",    fr: "Excel en PDF" },
      { slug: "ppt-to-pdf",      en: "PPT to PDF",        zh: "PPT 转 PDF",      es: "PPT a PDF",      pt: "PPT para PDF",      fr: "PPT en PDF" },
      { slug: "images-to-pdf",   en: "Images to PDF",     zh: "图片转 PDF",      es: "Imagen a PDF",   pt: "Imagem para PDF",   fr: "Image en PDF" },
      { slug: "html-to-pdf",     en: "HTML to PDF",       zh: "HTML 转 PDF",     es: "HTML a PDF",     pt: "HTML para PDF",     fr: "HTML en PDF" },
      { slug: "url-to-pdf",      en: "URL to PDF",        zh: "网页转 PDF",      es: "URL a PDF",      pt: "URL para PDF",      fr: "URL en PDF" },
    ],
    limits: {
      free: { en: "Unlimited", zh: "无限", es: "Ilimitado", pt: "Ilimitado", fr: "Illimité", internal: "fair use · CloudConvert reverse conversion cap applies" },
      plus: { en: "Unlimited", zh: "无限", es: "Ilimitado", pt: "Ilimitado", fr: "Illimité" },
      pro:  { en: "Unlimited", zh: "无限", es: "Ilimitado", pt: "Ilimitado", fr: "Illimité" },
    },
  },

  {
    id: "batch",
    label: {
      en: "Batch processing",
      zh: "批量处理",
      es: "Procesamiento por lotes",
      pt: "Processamento em lote",
      fr: "Traitement par lots",
    },
    tools: [
      { slug: "batch-compress",      en: "Batch Compress",            zh: "批量 PDF 压缩",   es: "Compresión por lotes",          pt: "Compressão em lote",              fr: "Compression par lots" },
      { slug: "batch-pdf-to-image",  en: "Batch PDF to Image",        zh: "批量 PDF 转图片", es: "PDF a imagen por lotes",        pt: "PDF para imagem em lote",         fr: "PDF en image par lots" },
      { slug: "batch-protect-pdf",   en: "Batch Encrypt PDF",         zh: "批量 PDF 加密",   es: "Cifrado por lotes",             pt: "Criptografia em lote",            fr: "Chiffrement par lots" },
      { slug: "batch-rename-pdf",    en: "Batch Rename PDF",          zh: "批量 PDF 改名",   es: "Renombrado por lotes",          pt: "Renomear em lote",                fr: "Renommage par lots" },
      { slug: "batch-watermark-pdf", en: "Batch Watermark & Pages",   zh: "批量水印 & 页码", es: "Marca de agua por lotes",       pt: "Marca d'água em lote",            fr: "Filigrane par lots" },
      { slug: "batch-page-numbers",  en: "Batch Add Page Numbers",    zh: "批量添加页码",    es: "Números de página por lotes",   pt: "Números de página em lote",       fr: "Numéros de page par lots" },
      { slug: "batch-split-merge",   en: "Batch Split & Merge",       zh: "批量拆分合并",    es: "División por lotes",            pt: "Divisão em lote",                 fr: "Division par lots" },
      { slug: "batch-rotate-pdf",    en: "Batch Rotate PDF",          zh: "批量旋转 PDF",    es: "Rotación por lotes",            pt: "Rotação em lote",                 fr: "Rotation par lots" },
      { slug: "batch-pdf-to-word",   en: "Batch PDF to Word",         zh: "批量 PDF 转 Word", es: "PDF a Word por lotes",         pt: "PDF para Word em lote",           fr: "PDF en Word par lots" },
      { slug: "batch-pdf-to-excel",  en: "Batch PDF to Excel",        zh: "批量 PDF 转 Excel", es: "PDF a Excel por lotes",       pt: "PDF para Excel em lote",          fr: "PDF en Excel par lots" },
      { slug: "batch-word-to-pdf",   en: "Batch Word to PDF",         zh: "批量 Word 转 PDF", es: "Word a PDF por lotes",         pt: "Word para PDF em lote",           fr: "Word en PDF par lots" },
      { slug: "batch-excel-to-pdf",  en: "Batch Excel to PDF",        zh: "批量 Excel 转 PDF", es: "Excel a PDF por lotes",       pt: "Excel para PDF em lote",          fr: "Excel en PDF par lots" },
      { slug: "batch-ppt-to-pdf",    en: "Batch PPT to PDF",          zh: "批量 PPT 转 PDF", es: "PPT a PDF por lotes",           pt: "PPT para PDF em lote",            fr: "PPT en PDF par lots" },
      { slug: "batch-translate",     en: "Batch Translate",           zh: "批量翻译",        es: "Traducir por lotes",            pt: "Traduzir em lote",                fr: "Traduction par lots" },
      { slug: "batch-fix-scans",     en: "Batch Fix Scans",           zh: "批量修扫描",      es: "Arreglar escaneos por lotes",   pt: "Corrigir digitalizações em lote", fr: "Corriger scans par lots" },
    ],
    limits: {
      free: {
        en: "≤ 3 files/batch · 3 batches/day",
        zh: "≤ 3文件/批 · 3批/天",
        es: "≤ 3 archivos/lote · 3 lotes/día",
        pt: "≤ 3 arquivos/lote · 3 lotes/dia",
        fr: "≤ 3 fichiers/lot · 3 lots/jour",
      },
      plus: {
        en: "≤ 20 files/batch · unlimited batches",
        zh: "≤ 20文件/批 · 不限次",
        es: "≤ 20 archivos/lote · lotes ilimitados",
        pt: "≤ 20 arquivos/lote · lotes ilimitados",
        fr: "≤ 20 fichiers/lot · lots illimités",
      },
      pro:  {
        en: "≤ 50 files/batch · unlimited batches",
        zh: "≤ 50文件/批 · 不限次",
        es: "≤ 50 archivos/lote · lotes ilimitados",
        pt: "≤ 50 arquivos/lote · lotes ilimitados",
        fr: "≤ 50 fichiers/lot · lots illimités",
      },
    },
  },

  {
    id: "ai-standard",
    label: {
      en: "AI workflows — standard",
      zh: "AI 工作流（大路货）",
      es: "Flujos de trabajo con IA — estándar",
      pt: "Fluxos de trabalho com IA — padrão",
      fr: "Flux de travail IA — standard",
    },
    tools: [
      { slug: "ai-workspace",  en: "AI Workspace",          zh: "AI 工作台",    es: "Espacio de trabajo IA", pt: "Espaço de trabalho IA", fr: "Espace de travail IA" },
      { slug: "chat-with-pdf", en: "Chat with PDF",         zh: "PDF 问答",     es: "Chatear con PDF",       pt: "Chat com PDF",          fr: "Chat avec PDF" },
      { slug: "ai-summary",    en: "AI Summary",            zh: "PDF 摘要提取", es: "Resumen de PDF",        pt: "Resumo de PDF",         fr: "Résumé PDF" },
      { slug: "translate-pdf", en: "Translate PDF",         zh: "PDF 翻译",     es: "Traducir PDF",          pt: "Traduzir PDF",          fr: "Traduire PDF" },
      { slug: "batch-summary", en: "Batch Summary",         zh: "批量摘要",     es: "Resumen por lotes",     pt: "Resumo em lote",        fr: "Résumé par lots" },
      { slug: "batch-sort",    en: "Auto-Classify PDFs",    zh: "PDF 智能分类", es: "Clasificar PDF",        pt: "Classificar PDF",       fr: "Classer PDF" },
    ],
    limits: {
      free: { en: "10 / day",   zh: "10次/天",  es: "10/día",  pt: "10/dia",  fr: "10/jour" },
      plus: { en: "200 / day",  zh: "200次/天", es: "200/día", pt: "200/dia", fr: "200/jour" },
      pro:  { en: "Unlimited",  zh: "无限",     es: "Ilimitado", pt: "Ilimitado", fr: "Illimité" },
    },
  },

  {
    id: "ai-hero",
    label: {
      en: "AI heroes — specialized analysis",
      zh: "AI 英雄（专项分析）",
      es: "IA expertos — análisis especializado",
      pt: "IA especialistas — análise especializada",
      fr: "IA experts — analyse spécialisée",
    },
    tools: [
      { slug: "compare",          en: "Compare Documents",      zh: "多文档对比",       es: "Comparar documentos",                  pt: "Comparar documentos",                  fr: "Comparer des documents" },
      { slug: "redline",          en: "Compare Versions",       zh: "PDF 版本对比",     es: "Comparar versiones",                   pt: "Comparar versões",                     fr: "Comparer des versions" },
      { slug: "contract-risk",    en: "Contract Risk Check",    zh: "合同风险体检",     es: "Revisión de riesgos del contrato",     pt: "Revisão de riscos do contrato",        fr: "Analyse de risques du contrat" },
      { slug: "govbid-matrix",    en: "Gov Bid Compliance",     zh: "政府标书合规矩阵", es: "Matriz de cumplimiento de licitación", pt: "Matriz de conformidade de licitação",  fr: "Matrice de conformité d'appel d'offres" },
      { slug: "extract-to-excel", en: "Extract to Excel",       zh: "数据抽取到表格",   es: "Extraer a Excel",                      pt: "Extrair para Excel",                   fr: "Extraire vers Excel" },
      { slug: "lease-redflag",    en: "Lease Red Flag Check",   zh: "租约红旗扫描",     es: "Análisis de riesgos del arrendamiento", pt: "Análise de riscos do arrendamento",   fr: "Signaux d'alerte du bail" },
    ],
    limits: {
      free: { en: "3 / day",    zh: "3次/天",  es: "3/día",   pt: "3/dia",   fr: "3/jour" },
      plus: { en: "500 / month", zh: "500次/月", es: "500/mes", pt: "500/mês", fr: "500/mois" },
      pro:  { en: "Unlimited",  zh: "无限", es: "Ilimitado", pt: "Ilimitado", fr: "Illimité", internal: "~5 000/mo soft cap" },
    },
  },

  {
    id: "hero-premium",
    label: {
      en: "Hero premium outputs",
      zh: "英雄高级输出",
      es: "Salidas premium de expertos",
      pt: "Saídas premium de especialistas",
      fr: "Sorties premium des experts",
    },
    tools: [],
    features: [
      {
        en: "Gov Bid → Excel matrix export",
        zh: "标书 Excel 矩阵导出",
        es: "Licitación → exportar matriz a Excel",
        pt: "Licitação → exportar matriz para Excel",
        fr: "Appel d'offres → export matrice Excel",
        status: "coming",
      },
      {
        en: "Statement batch processing + large files",
        zh: "对账单批量处理 + 大文件",
        es: "Procesamiento de extractos por lotes + archivos grandes",
        pt: "Processamento de extratos em lote + arquivos grandes",
        fr: "Traitement de relevés par lots + fichiers volumineux",
        status: "coming",
      },
      {
        en: "Extract line items + break 8-doc / 60 k-char cap",
        zh: "抽取行项目 + 突破8份6万字符上限",
        es: "Extraer partidas + superar el límite de 8 docs / 60 k caracteres",
        pt: "Extrair itens + superar o limite de 8 docs / 60 mil caracteres",
        fr: "Extraire les lignes + dépasser la limite de 8 docs / 60 k caractères",
        status: "coming",
      },
      {
        en: "Hero large docs (long contracts · 100-300 page RFPs)",
        zh: "英雄大文档（长合同·100-300页RFP）",
        es: "Documentos grandes para expertos (contratos largos · RFP de 100-300 páginas)",
        pt: "Documentos grandes para especialistas (contratos longos · RFPs de 100-300 páginas)",
        fr: "Grands documents pour experts (contrats longs · appels d'offres de 100-300 pages)",
        status: "coming",
      },
    ],
    limits: {
      free: { en: "—", zh: "—", es: "—", pt: "—", fr: "—" },
      plus: { en: "—", zh: "—", es: "—", pt: "—", fr: "—" },
      pro:  { en: "✓ Pro only", zh: "✓ 仅 Pro", es: "✓ Solo Pro", pt: "✓ Só Pro", fr: "✓ Pro uniquement" },
    },
  },

  {
    id: "verticals",
    label: {
      en: "Professional verticals",
      zh: "专业领域",
      es: "Sectores profesionales",
      pt: "Setores profissionais",
      fr: "Secteurs professionnels",
    },
    tools: [],
    features: [
      { en: "Legal & contracts",          zh: "法律 / 合同",  es: "Legal y contratos",          pt: "Jurídico e contratos",       fr: "Juridique et contrats",        status: "coming" },
      { en: "Finance & tax",              zh: "财务 / 税务",  es: "Finanzas e impuestos",       pt: "Finanças e impostos",        fr: "Finance et fiscalité",         status: "coming" },
      { en: "Research & academia",        zh: "科研 / 学术",  es: "Investigación y academia",   pt: "Pesquisa e academia",        fr: "Recherche et académique",      status: "coming" },
      { en: "Banking & finance",          zh: "金融 / 投行",  es: "Banca y finanzas",           pt: "Banco e finanças",           fr: "Banque et finance",            status: "coming" },
      { en: "Architecture & engineering", zh: "建筑 / 工程",  es: "Arquitectura e ingeniería",  pt: "Arquitetura e engenharia",   fr: "Architecture et ingénierie",   status: "coming" },
      { en: "Healthcare & medical",       zh: "医疗 / 健康",  es: "Salud y medicina",           pt: "Saúde e medicina",           fr: "Santé et médecine",            status: "coming" },
    ],
    limits: {
      free: { en: "1 taste",                  zh: "1次尝鲜", es: "1 de prueba", pt: "1 de teste", fr: "1 à l'essai" },
      plus: { en: "20 / month",               zh: "20次/月", es: "20/mes", pt: "20/mês", fr: "20/mois" },
      pro:  { en: "Unlimited · all verticals", zh: "无限 · 全部垂直", es: "Ilimitado · todos los sectores", pt: "Ilimitado · todos os setores", fr: "Illimité · tous les secteurs" },
    },
  },

  {
    id: "pro-exclusive",
    label: {
      en: "Pro exclusive",
      zh: "Pro 专属",
      es: "Exclusivo de Pro",
      pt: "Exclusivo do Pro",
      fr: "Exclusif Pro",
    },
    tools: [],
    features: [
      {
        en: "Private workspace",
        zh: "私密工作区",
        es: "Espacio de trabajo privado",
        pt: "Espaço de trabalho privado",
        fr: "Espace de travail privé",
        status: "live",
      },
      {
        en: "Unlimited batch, AI & verticals (Plus is capped)",
        zh: "无限批量/AI/垂直（Plus 有限额）",
        es: "Lotes, IA y sectores ilimitados (Plus tiene límite)",
        pt: "Lotes, IA e setores ilimitados (Plus tem limite)",
        fr: "Lots, IA et secteurs illimités (Plus est limité)",
        status: "live",
      },
      {
        en: "API access",
        zh: "API 访问",
        es: "Acceso a la API",
        pt: "Acesso à API",
        fr: "Accès à l'API",
        status: "coming",
      },
      {
        en: "Team seats",
        zh: "团队席位",
        es: "Plazas de equipo",
        pt: "Assentos de equipe",
        fr: "Sièges d'équipe",
        status: "coming",
      },
      {
        en: "Priority processing",
        zh: "优先处理",
        es: "Procesamiento prioritario",
        pt: "Processamento prioritário",
        fr: "Traitement prioritaire",
        status: "coming",
      },
    ],
    limits: {
      free: { en: "—", zh: "—", es: "—", pt: "—", fr: "—" },
      plus: { en: "—", zh: "—", es: "—", pt: "—", fr: "—" },
      pro:  { en: "✓", zh: "✓", es: "✓", pt: "✓", fr: "✓" },
    },
  },
];
