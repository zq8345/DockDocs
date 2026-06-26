import { deepHant } from "@/lib/zh-hant";

// ─────────────────────────────────────────────────────────────────────────────
// HEADER NAV — single source (P2.1). The header dropdowns used to be 6 near-
// identical per-locale NavCat[] arrays (navCategories.en…ja, ~710 lines) differing
// only in labels. Collapse into:
//   • headerStructure — locale-independent (categories → tier + cols → items),
//     keyed by the en label because slugs repeat (/compare ×2, /pricing ×3) so a
//     slug can't be a unique key; tier is a constant, never rendered/translated.
//   • navItemLabels — tool/item labels per locale (key = en item label)
//   • navCopy        — category + column-heading labels per locale (key = en label)
// Adding a locale = add one block to each map. zh-Hant derives from zh (deepHant).
// ENFORCEMENT is correct-by-construction (same as P0.2 / footer-nav): both maps are
// typed-exhaustive Record<AuthoredLocale, Record<…Key, string>>, so a missing locale
// or a missing key is a tsc error (red build), not a silent English fallback.
// (Header/Footer label differences are a separate UX/brand item — P3 backlog.
// The /flashcards Single-doc-AI entry that had drifted into es/pt/fr nav is removed
// here per backlog feat-cleanup-nav-dupes; it remains linked from the footer.)
// ─────────────────────────────────────────────────────────────────────────────

type AuthoredLocale = "en" | "zh" | "es" | "pt" | "fr" | "ja" | "de";

// Locale-independent. `as const` so ItemKey/ChromeKey derive from it (single source).
export const headerStructure = [
  {
    "catKey": "Document tools",
    "tier": "Free",
    "cols": [
      {
        "headingKey": "PDF conversion",
        "items": [
          { "key": "PDF to Word",     "slug": "/pdf-to-word" },
          { "key": "PDF to Excel",    "slug": "/pdf-to-excel" },
          { "key": "PDF to PPT",      "slug": "/pdf-to-ppt" },
          { "key": "PDF to PDF/A",    "slug": "/pdf-to-pdfa" },
          { "key": "PDF to Image",    "slug": "/pdf-to-image" },
          { "key": "PDF to HTML",     "slug": "/pdf-to-html" },
          { "key": "PDF to Markdown", "slug": "/pdf-to-markdown" },
          { "key": "Word to PDF",     "slug": "/word-to-pdf" },
          { "key": "Excel to PDF",    "slug": "/excel-to-pdf" },
          { "key": "PPT to PDF",      "slug": "/ppt-to-pdf" },
          { "key": "Image to PDF",    "slug": "/images-to-pdf" },
          { "key": "HTML to PDF",     "slug": "/html-to-pdf" }
        ]
      },
      {
        "headingKey": "PDF editing",
        "items": [
          { "key": "Split PDF",        "slug": "/split-pdf" },
          { "key": "Compress PDF",     "slug": "/compress-pdf" },
          { "key": "Delete Pages",     "slug": "/delete-page" },
          { "key": "Rotate Pages",     "slug": "/rotate-page" },
          { "key": "Reorder Pages",    "slug": "/reorder-pages" },
          { "key": "Add Page",         "slug": "/add-page" },
          { "key": "Watermark PDF",    "slug": "/watermark-pdf" },
          { "key": "Add Page Numbers", "slug": "/page-numbers" },
          { "key": "Crop PDF",         "slug": "/crop-pdf" },
          { "key": "Redact PDF",       "slug": "/redact-pdf" },
          { "key": "Sign PDF",         "slug": "/sign-pdf" },
          { "key": "Protect PDF",      "slug": "/protect-pdf" },
          { "key": "Unlock PDF",       "slug": "/unlock-pdf" }
        ]
      },
      {
        "headingKey": "Batch",
        "items": [
          { "key": "Merge PDF",              "slug": "/merge-pdf" },
          { "key": "Batch PDF compress",     "slug": "/batch-compress" },
          { "key": "Batch PDF to image",     "slug": "/batch-pdf-to-image" },
          { "key": "Batch PDF encrypt",      "slug": "/batch-protect-pdf" },
          { "key": "Batch PDF rename",       "slug": "/batch-rename-pdf" },
          { "key": "Batch PDF watermark",    "slug": "/batch-watermark-pdf" },
          { "key": "Batch PDF page numbers", "slug": "/batch-page-numbers" },
          { "key": "Batch PDF split",        "slug": "/batch-split-merge" },
          { "key": "Batch PDF rotate",       "slug": "/batch-rotate-pdf" },
          { "key": "Batch PDF to Word",      "slug": "/batch-pdf-to-word" },
          { "key": "Batch PDF to Excel",     "slug": "/batch-pdf-to-excel" },
          { "key": "Batch Word to PDF",      "slug": "/batch-word-to-pdf" },
          { "key": "Batch Excel to PDF",     "slug": "/batch-excel-to-pdf" },
          { "key": "Batch PPT to PDF",       "slug": "/batch-ppt-to-pdf" },
          { "key": "Batch PDF translate",    "slug": "/batch-translate" },
          { "key": "Batch PDF fix scans",    "slug": "/batch-fix-scans" },
          { "key": "Batch summary",          "slug": "/batch-summary" },
          { "key": "Classify PDFs",          "slug": "/batch-sort" }
        ]
      }
    ]
  },
  {
    "catKey": "AI analysis",
    "tier": "Plus",
    "cols": [
      {
        "items": [
          { "key": "Chat with PDF",     "slug": "/chat-with-pdf" },
          { "key": "PDF Summary",       "slug": "/ai-summary" },
          { "key": "PDF OCR",           "slug": "/ocr-pdf" },
          { "key": "Compare documents", "slug": "/compare" },
          { "key": "Compare versions",  "slug": "/redline" },
          { "key": "Extract to Excel",  "slug": "/extract-to-excel" },
          { "key": "Flashcards",        "slug": "/flashcards" }
        ]
      }
    ]
  },
  {
    "catKey": "By profession",
    "tier": "Soon",
    "cols": [
      {
        "headingKey": "Pro tools",
        "items": [
          { "key": "Contract risk check", "slug": "/contract-risk" },
          { "key": "Lease red flag scan", "slug": "/lease-redflag" },
          { "key": "Gov Bid Compliance",  "slug": "/govbid-matrix" }
        ]
      },
      {
        "headingKey": "Industry",
        "items": [
          { "key": "Legal & contracts",   "slug": "/for/legal" },
          { "key": "Finance & tax",       "slug": "/for/finance",  "soon": true },
          { "key": "Research & academia", "slug": "/for/research", "soon": true }
        ]
      }
    ]
  }
] as const;

// Item labels = every item `key`. Chrome labels = every `catKey` + every `headingKey`.
// Derived from headerStructure so a new tool/column demands a label in EVERY locale.
type ItemKey = (typeof headerStructure)[number]["cols"][number]["items"][number]["key"];
type ChromeKey =
  | (typeof headerStructure)[number]["catKey"]
  | Extract<(typeof headerStructure)[number]["cols"][number], { readonly headingKey: string }>["headingKey"];

// Tool/item labels per locale.
export const navItemLabels: Record<AuthoredLocale, Record<ItemKey, string>> = {
  en: {"PDF to Word":"PDF to Word","PDF to Excel":"PDF to Excel","PDF to PPT":"PDF to PPT","PDF to PDF/A":"PDF to PDF/A","PDF to Image":"PDF to Image","PDF to HTML":"PDF to HTML","PDF to Markdown":"PDF to Markdown","Word to PDF":"Word to PDF","Excel to PDF":"Excel to PDF","PPT to PDF":"PPT to PDF","Image to PDF":"Image to PDF","HTML to PDF":"HTML to PDF","Split PDF":"Split PDF","Compress PDF":"Compress PDF","Delete Pages":"Delete Pages","Rotate Pages":"Rotate Pages","Reorder Pages":"Reorder Pages","Add Page":"Add Page","Watermark PDF":"Watermark PDF","Add Page Numbers":"Add Page Numbers","Crop PDF":"Crop PDF","Redact PDF":"Redact PDF","Sign PDF":"Sign PDF","Protect PDF":"Protect PDF","Unlock PDF":"Unlock PDF","PDF OCR":"PDF OCR","Merge PDF":"Merge PDF","Batch PDF compress":"Batch PDF compress","Batch PDF to image":"Batch PDF to image","Batch PDF encrypt":"Batch PDF encrypt","Batch PDF rename":"Batch PDF rename","Batch PDF watermark":"Batch PDF watermark","Batch PDF page numbers":"Batch PDF page numbers","Batch PDF split":"Batch PDF split","Batch PDF rotate":"Batch PDF rotate","Batch PDF to Word":"Batch PDF to Word","Batch PDF to Excel":"Batch PDF to Excel","Batch Word to PDF":"Batch Word to PDF","Batch Excel to PDF":"Batch Excel to PDF","Batch PPT to PDF":"Batch PPT to PDF","Batch PDF translate":"Batch PDF translate","Batch PDF fix scans":"Batch PDF fix scans","Batch summary":"Batch summary","Classify PDFs":"Classify PDFs","Chat with PDF":"Chat with PDF","PDF Summary":"PDF Summary","Compare documents":"Compare documents","Compare versions":"Compare versions","Extract to Excel":"Extract to Excel","Gov Bid Compliance":"Gov Bid Compliance","Flashcards":"Flashcards","Legal & contracts":"Legal & contracts","Finance & tax":"Finance & tax","Research & academia":"Research & academia","Contract risk check":"Contract risk check","Lease red flag scan":"Lease red flag scan"},
  zh: {"PDF to Word":"PDF 转 Word","PDF to Excel":"PDF 转 Excel","PDF to PPT":"PDF 转 PPT","PDF to PDF/A":"PDF 转 PDF/A","PDF to Image":"PDF 转图片","PDF to HTML":"PDF 转 HTML","PDF to Markdown":"PDF 转 Markdown","Word to PDF":"Word 转 PDF","Excel to PDF":"Excel 转 PDF","PPT to PDF":"PPT 转 PDF","Image to PDF":"图片转 PDF","HTML to PDF":"HTML 转 PDF","Split PDF":"PDF 拆分","Compress PDF":"PDF 压缩","Delete Pages":"PDF 页面删除","Rotate Pages":"PDF 页面旋转","Reorder Pages":"PDF 页面排序","Add Page":"PDF 页面添加","Watermark PDF":"PDF 加水印","Add Page Numbers":"PDF 添加页码","Crop PDF":"PDF 裁剪","Redact PDF":"PDF 智能涂黑","Sign PDF":"PDF 签名","Protect PDF":"PDF 加密","Unlock PDF":"PDF 解密","Merge PDF":"批量 PDF 合并","Batch PDF compress":"批量 PDF 压缩","Batch PDF to image":"批量 PDF 转图片","Batch PDF encrypt":"批量 PDF 加密","Batch PDF rename":"批量 PDF 改名","Batch PDF watermark":"批量 PDF 添加水印","Batch PDF page numbers":"批量 PDF 添加页码","Batch PDF split":"批量 PDF 拆分","Batch PDF rotate":"批量 PDF 旋转","Batch PDF to Word":"批量 PDF 转 Word","Batch PDF to Excel":"批量 PDF 转 Excel","Batch Word to PDF":"批量 Word 转 PDF","Batch Excel to PDF":"批量 Excel 转 PDF","Batch PPT to PDF":"批量 PPT 转 PDF","Batch PDF translate":"批量 PDF 翻译","Batch PDF fix scans":"批量 PDF 修扫描","Batch summary":"批量摘要","Classify PDFs":"PDF 智能分类","Chat with PDF":"PDF 问答","PDF Summary":"PDF 摘要提取","PDF OCR":"PDF OCR","Compare documents":"多文档对比","Compare versions":"PDF 版本对比","Extract to Excel":"数据抽取到表格","Gov Bid Compliance":"政府标书合规矩阵","Flashcards":"知识卡片","Legal & contracts":"法律 / 合同","Finance & tax":"财务 / 税务","Research & academia":"科研 / 学术","Contract risk check":"合同风险审查","Lease red flag scan":"租约风险扫描"},
  es: {"PDF to Word":"PDF a Word","PDF to Excel":"PDF a Excel","PDF to PPT":"PDF a PPT","PDF to PDF/A":"PDF a PDF/A","PDF to Image":"PDF a imagen","PDF to HTML":"PDF a HTML","PDF to Markdown":"PDF a Markdown","Word to PDF":"Word a PDF","Excel to PDF":"Excel a PDF","PPT to PDF":"PPT a PDF","Image to PDF":"Imagen a PDF","HTML to PDF":"HTML a PDF","Split PDF":"Dividir PDF","Compress PDF":"Comprimir PDF","Delete Pages":"Eliminar páginas","Rotate Pages":"Rotar páginas","Reorder Pages":"Reordenar páginas","Add Page":"Añadir página","Watermark PDF":"Marca de agua en PDF","Add Page Numbers":"Añadir números de página","Crop PDF":"Recortar PDF","Redact PDF":"Censurar PDF","Sign PDF":"Firmar PDF","Protect PDF":"Proteger PDF","Unlock PDF":"Desbloquear PDF","Merge PDF":"Combinar PDF","Batch PDF compress":"Compresión PDF por lotes","Batch PDF to image":"PDF a imagen por lotes","Batch PDF encrypt":"Cifrado PDF por lotes","Batch PDF rename":"Renombrado PDF por lotes","Batch PDF watermark":"Marca de agua PDF por lotes","Batch PDF page numbers":"Números de página PDF por lotes","Batch PDF split":"División PDF por lotes","Batch PDF rotate":"Rotación PDF por lotes","Batch PDF to Word":"PDF a Word por lotes","Batch PDF to Excel":"PDF a Excel por lotes","Batch Word to PDF":"Word a PDF por lotes","Batch Excel to PDF":"Excel a PDF por lotes","Batch PPT to PDF":"PPT a PDF por lotes","Batch PDF translate":"Traducir PDF por lotes","Batch PDF fix scans":"Arreglar escaneos PDF por lotes","Batch summary":"Resumen por lotes","Classify PDFs":"Clasificar PDF","Chat with PDF":"Chatear con PDF","PDF Summary":"Resumen de PDF","PDF OCR":"OCR de PDF","Compare documents":"Comparar documentos","Compare versions":"Comparar versiones","Extract to Excel":"Extraer a Excel","Gov Bid Compliance":"Matriz de cumplimiento de licitación","Flashcards":"Tarjetas de memoria","Legal & contracts":"Legal y contratos","Finance & tax":"Finanzas e impuestos","Research & academia":"Investigación y academia","Contract risk check":"Revisión de riesgos del contrato","Lease red flag scan":"Escaneo de señales de alerta en arrendamiento"},
  pt: {"PDF to Word":"PDF para Word","PDF to Excel":"PDF para Excel","PDF to PPT":"PDF para PPT","PDF to PDF/A":"PDF para PDF/A","PDF to Image":"PDF para imagem","PDF to HTML":"PDF para HTML","PDF to Markdown":"PDF para Markdown","Word to PDF":"Word para PDF","Excel to PDF":"Excel para PDF","PPT to PDF":"PPT para PDF","Image to PDF":"Imagem para PDF","HTML to PDF":"HTML para PDF","Split PDF":"Dividir PDF","Compress PDF":"Comprimir PDF","Delete Pages":"Excluir páginas","Rotate Pages":"Girar páginas","Reorder Pages":"Reordenar páginas","Add Page":"Adicionar página","Watermark PDF":"Marca d'água em PDF","Add Page Numbers":"Adicionar números de página","Crop PDF":"Recortar PDF","Redact PDF":"Redigir PDF","Sign PDF":"Assinar PDF","Protect PDF":"Proteger PDF","Unlock PDF":"Desbloquear PDF","Merge PDF":"Unir PDF","Batch PDF compress":"Compressão PDF em lote","Batch PDF to image":"PDF para imagem em lote","Batch PDF encrypt":"Criptografia PDF em lote","Batch PDF rename":"Renomear PDF em lote","Batch PDF watermark":"Marca d'água PDF em lote","Batch PDF page numbers":"Números de página PDF em lote","Batch PDF split":"Divisão PDF em lote","Batch PDF rotate":"Rotação PDF em lote","Batch PDF to Word":"PDF para Word em lote","Batch PDF to Excel":"PDF para Excel em lote","Batch Word to PDF":"Word para PDF em lote","Batch Excel to PDF":"Excel para PDF em lote","Batch PPT to PDF":"PPT para PDF em lote","Batch PDF translate":"Traduzir PDF em lote","Batch PDF fix scans":"Corrigir digitalizações PDF em lote","Batch summary":"Resumo em lote","Classify PDFs":"Classificar PDF","Chat with PDF":"Chat com PDF","PDF Summary":"Resumo de PDF","PDF OCR":"OCR de PDF","Compare documents":"Comparar documentos","Compare versions":"Comparar versões","Extract to Excel":"Extrair para Excel","Gov Bid Compliance":"Matriz de conformidade de licitação","Flashcards":"Cartões de memória","Legal & contracts":"Jurídico e contratos","Finance & tax":"Finanças e impostos","Research & academia":"Pesquisa e academia","Contract risk check":"Análise de risco contratual","Lease red flag scan":"Varredura de alertas no arrendamento"},
  fr: {"PDF to Word":"PDF en Word","PDF to Excel":"PDF en Excel","PDF to PPT":"PDF en PPT","PDF to PDF/A":"PDF en PDF/A","PDF to Image":"PDF en image","PDF to HTML":"PDF en HTML","PDF to Markdown":"PDF en Markdown","Word to PDF":"Word en PDF","Excel to PDF":"Excel en PDF","PPT to PDF":"PPT en PDF","Image to PDF":"Image en PDF","HTML to PDF":"HTML en PDF","Split PDF":"Diviser PDF","Compress PDF":"Compresser PDF","Delete Pages":"Supprimer des pages","Rotate Pages":"Faire pivoter des pages","Reorder Pages":"Réorganiser les pages","Add Page":"Ajouter une page","Watermark PDF":"Filigrane PDF","Add Page Numbers":"Numéros de page","Crop PDF":"Rogner PDF","Redact PDF":"Caviarder PDF","Sign PDF":"Signer PDF","Protect PDF":"Protéger PDF","Unlock PDF":"Déverrouiller PDF","Merge PDF":"Fusionner PDF","Batch PDF compress":"Compression PDF par lots","Batch PDF to image":"PDF en image par lots","Batch PDF encrypt":"Chiffrement PDF par lots","Batch PDF rename":"Renommage PDF par lots","Batch PDF watermark":"Filigrane PDF par lots","Batch PDF page numbers":"Numéros de page PDF par lots","Batch PDF split":"Division PDF par lots","Batch PDF rotate":"Rotation PDF par lots","Batch PDF to Word":"PDF en Word par lots","Batch PDF to Excel":"PDF en Excel par lots","Batch Word to PDF":"Word en PDF par lots","Batch Excel to PDF":"Excel en PDF par lots","Batch PPT to PDF":"PPT en PDF par lots","Batch PDF translate":"Traduction PDF par lots","Batch PDF fix scans":"Corriger scans PDF par lots","Batch summary":"Résumé par lots","Classify PDFs":"Classer PDF","Chat with PDF":"Chat avec PDF","PDF Summary":"Résumé PDF","PDF OCR":"OCR PDF","Compare documents":"Comparer des documents","Compare versions":"Comparer des versions","Extract to Excel":"Extraire vers Excel","Gov Bid Compliance":"Matrice de conformité d'appel d'offres","Flashcards":"Fiches mémo","Legal & contracts":"Juridique et contrats","Finance & tax":"Finance et fiscalité","Research & academia":"Recherche et académique","Contract risk check":"Analyse de risque contractuel","Lease red flag scan":"Scan des signaux d'alerte de bail"},
  ja: {"PDF to Word":"PDF を Word に変換","PDF to Excel":"PDF を Excel に変換","PDF to PPT":"PDF を PowerPoint に変換","PDF to PDF/A":"PDF を PDF/A に変換","PDF to Image":"PDF を画像に変換","PDF to HTML":"PDF を HTML に変換","PDF to Markdown":"PDF を Markdown に変換","Word to PDF":"Word を PDF に変換","Excel to PDF":"Excel を PDF に変換","PPT to PDF":"PowerPoint を PDF に変換","Image to PDF":"画像を PDF に変換","HTML to PDF":"HTML を PDF に変換","Split PDF":"PDF を分割","Compress PDF":"PDF を圧縮","Delete Pages":"ページを削除","Rotate Pages":"ページを回転","Reorder Pages":"ページを並べ替え","Add Page":"ページを追加","Watermark PDF":"PDF に透かしを追加","Add Page Numbers":"ページ番号を追加","Crop PDF":"PDF をトリミング","Redact PDF":"PDF を黒塗り","Sign PDF":"PDF に署名","Protect PDF":"PDF にパスワードを設定","Unlock PDF":"PDF のパスワードを解除","Merge PDF":"PDF を結合","Batch PDF compress":"PDF を一括圧縮","Batch PDF to image":"PDF を画像に一括変換","Batch PDF encrypt":"PDF を一括暗号化","Batch PDF rename":"PDF を一括リネーム","Batch PDF watermark":"PDF に一括透かし","Batch PDF page numbers":"PDF に一括ページ番号","Batch PDF split":"PDF を一括分割","Batch PDF rotate":"PDF を一括回転","Batch PDF to Word":"PDF を Word に一括変換","Batch PDF to Excel":"PDF を Excel に一括変換","Batch Word to PDF":"Word を PDF に一括変換","Batch Excel to PDF":"Excel を PDF に一括変換","Batch PPT to PDF":"PowerPoint を PDF に一括変換","Batch PDF translate":"PDF を一括翻訳","Batch PDF fix scans":"PDF スキャンを一括補正","Batch summary":"一括要約","Classify PDFs":"PDF を自動分類","Chat with PDF":"PDFと対話","PDF Summary":"PDF 要約","PDF OCR":"PDF を OCR（文字認識）","Compare documents":"文書を比較","Compare versions":"バージョンを比較","Extract to Excel":"Excel に抽出","Gov Bid Compliance":"入札要件コンプライアンス","Flashcards":"フラッシュカード","Legal & contracts":"法務・契約","Finance & tax":"財務・税務","Research & academia":"研究・学術","Contract risk check":"契約リスク確認","Lease red flag scan":"リース契約リスクスキャン"},
  de: {"PDF to Word":"PDF in Word","PDF to Excel":"PDF in Excel","PDF to PPT":"PDF in PPT","PDF to PDF/A":"PDF in PDF/A","PDF to Image":"PDF in Bild","PDF to HTML":"PDF in HTML","PDF to Markdown":"PDF in Markdown","Word to PDF":"Word in PDF","Excel to PDF":"Excel in PDF","PPT to PDF":"PPT in PDF","Image to PDF":"Bild in PDF","HTML to PDF":"HTML in PDF","Split PDF":"PDF teilen","Compress PDF":"PDF komprimieren","Delete Pages":"Seiten löschen","Rotate Pages":"Seiten drehen","Reorder Pages":"Seiten neu anordnen","Add Page":"Seiten einfügen","Watermark PDF":"Wasserzeichen-PDF","Add Page Numbers":"Seitennummerierung","Crop PDF":"PDF zuschneiden","Redact PDF":"PDF schwärzen","Sign PDF":"PDF unterschreiben","Protect PDF":"PDF schützen","Unlock PDF":"PDF entsperren","Merge PDF":"PDF zusammenfügen","Batch PDF compress":"PDF komprimieren (Stapel)","Batch PDF to image":"PDF in Bild (Stapel)","Batch PDF encrypt":"PDF verschlüsseln (Stapel)","Batch PDF rename":"PDF umbenennen (Stapel)","Batch PDF watermark":"Wasserzeichen-PDF (Stapel)","Batch PDF page numbers":"Seitennummerierung (Stapel)","Batch PDF split":"PDF teilen (Stapel)","Batch PDF rotate":"PDF drehen (Stapel)","Batch PDF to Word":"PDF in Word (Stapel)","Batch PDF to Excel":"PDF in Excel (Stapel)","Batch Word to PDF":"Word in PDF (Stapel)","Batch Excel to PDF":"Excel in PDF (Stapel)","Batch PPT to PDF":"PPT in PDF (Stapel)","Batch PDF translate":"PDF übersetzen (Stapel)","Batch PDF fix scans":"Scans korrigieren (Stapel)","Batch summary":"Stapel-Zusammenfassung","Classify PDFs":"PDFs klassifizieren","Chat with PDF":"Mit PDF chatten","PDF Summary":"PDF-Zusammenfassung","PDF OCR":"PDF-OCR","Compare documents":"Dokumente vergleichen","Compare versions":"Versionen vergleichen","Extract to Excel":"In Excel extrahieren","Gov Bid Compliance":"Ausschreibungs-Compliance","Flashcards":"Lernkarten","Legal & contracts":"Recht & Verträge","Finance & tax":"Finanzen & Steuern","Research & academia":"Forschung & Wissenschaft","Contract risk check":"Vertragsrisikoprüfung","Lease red flag scan":"Mietvertrag-Risikoscan"},
};

// Category + column-heading labels per locale.
export const navCopy: Record<AuthoredLocale, Record<ChromeKey, string>> = {
  en: {"Document tools":"Document tools","PDF conversion":"PDF conversion","PDF editing":"PDF editing","Batch":"Batch","AI analysis":"AI analysis","By profession":"By profession","Pro tools":"Pro tools","Industry":"Industry"},
  zh: {"Document tools":"文档工具","PDF conversion":"PDF 转化","PDF editing":"PDF 编辑","Batch":"批量处理","AI analysis":"AI 分析","By profession":"专业领域","Pro tools":"专业工具","Industry":"行业领域"},
  es: {"Document tools":"Herramientas de documentos","PDF conversion":"Conversión de PDF","PDF editing":"Edición de PDF","Batch":"Por lotes","AI analysis":"Análisis de IA","By profession":"Por profesión","Pro tools":"Herramientas profesionales","Industry":"Industria"},
  pt: {"Document tools":"Ferramentas de documentos","PDF conversion":"Conversão de PDF","PDF editing":"Edição de PDF","Batch":"Em lote","AI analysis":"Análise de IA","By profession":"Por profissão","Pro tools":"Ferramentas profissionais","Industry":"Indústria"},
  fr: {"Document tools":"Outils de documents","PDF conversion":"Conversion PDF","PDF editing":"Édition PDF","Batch":"Par lots","AI analysis":"Analyse IA","By profession":"Par profession","Pro tools":"Outils professionnels","Industry":"Secteur"},
  ja: {"Document tools":"ドキュメントツール","PDF conversion":"PDF変換","PDF editing":"PDF編集","Batch":"一括","AI analysis":"AI分析","By profession":"業種別","Pro tools":"プロツール","Industry":"業種"},
  de: {"Document tools":"Dokumenten-Tools","PDF conversion":"PDF-Konvertierung","PDF editing":"PDF-Bearbeitung","Batch":"Stapel","AI analysis":"KI-Analyse","By profession":"Nach Beruf","Pro tools":"Profi-Tools","Industry":"Branche"},
};

export type NavItem = { name: string; slug: string; soon?: boolean };
export type NavCol = { heading?: string; items: NavItem[] };
export type NavCat = { label: string; tier: string; cols: NavCol[] };

// Derive the rendered categories for a locale. zh-Hant = deepHant(zh); unknown
// locale falls back to en. Per-key en fallback guards against a missing label.
export function getNavCategories(locale: string): NavCat[] {
  const items =
    locale === "zh-Hant"
      ? (deepHant(navItemLabels.zh) as Record<string, string>)
      : (navItemLabels[locale as AuthoredLocale] ?? navItemLabels.en);
  const chrome =
    locale === "zh-Hant"
      ? (deepHant(navCopy.zh) as Record<string, string>)
      : (navCopy[locale as AuthoredLocale] ?? navCopy.en);
  return headerStructure.map((cat) => ({
    label: chrome[cat.catKey] ?? navCopy.en[cat.catKey],
    tier: cat.tier,
    cols: cat.cols.map((col) => ({
      ...("headingKey" in col ? { heading: chrome[col.headingKey] ?? navCopy.en[col.headingKey] } : {}),
      items: col.items.map((it) => ({
        name: items[it.key] ?? navItemLabels.en[it.key],
        slug: it.slug,
        ...("soon" in it ? { soon: true as const } : {}),
      })),
    })),
  }));
}
