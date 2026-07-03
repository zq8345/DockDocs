// Pricing-DISPLAY source of truth — drives the PricingPlans.tsx comparison table.
// ⚠️ Gating enforcement is LIVE and lives ELSEWHERE: lib/usage-limits.ts (featureLimits)
// + netlify/functions/_shared/feature-gate.ts. This file is DISPLAY-ONLY; the numbers
// here MUST stay in sync with the enforced limits in usage-limits.ts.

export type Tier = "free" | "pro";

export type TierValue = {
  en: string;
  zh: string;
  es: string;
  pt: string;
  fr: string;
  ja: string;
  de: string;
  ko: string;
  internal?: string; // NOT rendered on the pricing page; for gating config only
};

export type ToolItem = { slug: string; en: string; zh: string; es: string; pt: string; fr: string; ja: string; de: string; ko: string };

// Pro-only features that have no standalone tool page (can't be linked)
export type FeatureItem = {
  en: string;
  zh: string;
  es: string;
  pt: string;
  fr: string;
  ja: string;
  de: string;
  ko: string;
  status: "live" | "coming"; // "coming" renders as "Coming soon" pill
  href?: string; // when live, the label links here (e.g. a shipped vertical hub /for/legal)
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
      ja: "PDF ツール（クライアント側・常に無料）",
      de: "PDF-Tools (im Browser, immer kostenlos)", ko: "PDF 도구 (브라우저 처리, 항상 무료)",
    },
    tools: [
      { slug: "compress-pdf",  en: "Compress PDF",        zh: "PDF 压缩",      es: "Comprimir PDF",            pt: "Comprimir PDF",              fr: "Compresser PDF",          ja: "PDF 圧縮",        de: "PDF komprimieren", ko: "PDF 압축" },
      { slug: "merge-pdf",     en: "Merge PDF",           zh: "PDF 合并",      es: "Combinar PDF",             pt: "Unir PDF",                   fr: "Fusionner PDF",           ja: "PDF 結合",        de: "PDF zusammenfügen", ko: "PDF 병합" },
      { slug: "split-pdf",     en: "Split PDF",           zh: "PDF 拆分",      es: "Dividir PDF",              pt: "Dividir PDF",                fr: "Diviser PDF",             ja: "PDF 分割",        de: "PDF teilen", ko: "PDF 분할" },
      { slug: "delete-page",   en: "Delete PDF Pages",    zh: "PDF 页面删除",  es: "Eliminar páginas",         pt: "Excluir páginas",            fr: "Supprimer des pages",     ja: "PDF ページ削除",  de: "PDF-Seiten löschen", ko: "PDF 페이지 삭제" },
      { slug: "rotate-page",   en: "Rotate PDF",          zh: "PDF 页面旋转",  es: "Rotar páginas",            pt: "Girar páginas",              fr: "Faire pivoter des pages", ja: "PDF ページ回転",  de: "PDF drehen", ko: "PDF 회전" },
      { slug: "reorder-pages", en: "Reorder Pages",       zh: "PDF 页面排序",  es: "Reordenar páginas",        pt: "Reordenar páginas",          fr: "Réorganiser les pages",   ja: "ページの並べ替え", de: "Seiten neu ordnen", ko: "페이지 재정렬" },
      { slug: "add-page",      en: "Add Pages to PDF",    zh: "PDF 页面添加",  es: "Añadir página",            pt: "Adicionar página",           fr: "Ajouter une page",        ja: "PDF ページ追加",  de: "Seiten zum PDF hinzufügen", ko: "PDF 페이지 추가" },
      { slug: "watermark-pdf", en: "Watermark PDF",       zh: "PDF 加水印",    es: "Marca de agua en PDF",     pt: "Marca d'água em PDF",        fr: "Filigrane PDF",           ja: "PDF 透かし追加",  de: "PDF mit Wasserzeichen", ko: "PDF 워터마크" },
      { slug: "page-numbers",  en: "Add Page Numbers",    zh: "PDF 添加页码",  es: "Añadir números de página", pt: "Adicionar números de página", fr: "Numéros de page",        ja: "ページ番号追加",  de: "Seitenzahlen hinzufügen", ko: "페이지 번호 추가" },
      { slug: "crop-pdf",      en: "Crop PDF",            zh: "PDF 裁剪",      es: "Recortar PDF",             pt: "Recortar PDF",               fr: "Rogner PDF",              ja: "PDF トリミング",  de: "PDF zuschneiden", ko: "PDF 자르기" },
      { slug: "protect-pdf",   en: "Protect PDF",         zh: "PDF 加密",      es: "Proteger PDF",             pt: "Proteger PDF",               fr: "Protéger PDF",            ja: "PDF 暗号化",      de: "PDF schützen", ko: "PDF 암호화" },
      { slug: "unlock-pdf",    en: "Unlock PDF",          zh: "PDF 解密",      es: "Desbloquear PDF",          pt: "Desbloquear PDF",            fr: "Déverrouiller PDF",       ja: "PDF ロック解除",  de: "PDF entsperren", ko: "PDF 잠금 해제" },
      { slug: "sign-pdf",      en: "Sign PDF",            zh: "PDF 签名",      es: "Firmar PDF",               pt: "Assinar PDF",                fr: "Signer PDF",              ja: "PDF 署名",        de: "PDF signieren", ko: "PDF 서명" },
      { slug: "redact-pdf",    en: "Redact PDF",          zh: "PDF 智能涂黑",  es: "Censurar PDF",             pt: "Redigir PDF",                fr: "Caviarder PDF",           ja: "PDF 墨消し",      de: "PDF schwärzen", ko: "PDF 텍스트 지우기" },
      { slug: "ocr-pdf",       en: "OCR PDF",             zh: "PDF OCR",       es: "OCR de PDF",               pt: "OCR de PDF",                 fr: "OCR PDF",                 ja: "PDF OCR",         de: "PDF-OCR", ko: "PDF OCR" },
    ],
    limits: {
      free: { en: "Unlimited", zh: "无限", es: "Ilimitado", pt: "Ilimitado", fr: "Illimité", ja: "無制限", de: "Unbegrenzt", ko: "무제한" },
      pro:  { en: "Unlimited", zh: "无限", es: "Ilimitado", pt: "Ilimitado", fr: "Illimité", ja: "無制限", de: "Unbegrenzt", ko: "무제한" },
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
      ja: "フォーマット変換（単一ファイル）",
      de: "Formatkonvertierung (Einzeldatei)", ko: "형식 변환 (단일 파일)",
    },
    tools: [
      { slug: "pdf-to-word",     en: "PDF to Word",       zh: "PDF 转 Word",     es: "PDF a Word",     pt: "PDF para Word",     fr: "PDF en Word",     ja: "PDF を Word に変換",        de: "PDF zu Word", ko: "PDF를 Word로 변환" },
      { slug: "pdf-to-excel",    en: "PDF to Excel",      zh: "PDF 转 Excel",    es: "PDF a Excel",    pt: "PDF para Excel",    fr: "PDF en Excel",    ja: "PDF を Excel に変換",       de: "PDF zu Excel", ko: "PDF를 Excel로 변환" },
      { slug: "pdf-to-ppt",      en: "PDF to PowerPoint", zh: "PDF 转 PPT",      es: "PDF a PPT",      pt: "PDF para PPT",      fr: "PDF en PPT",      ja: "PDF を PowerPoint に変換",  de: "PDF zu PowerPoint", ko: "PDF를 PowerPoint로 변환" },
      { slug: "pdf-to-pdfa",     en: "PDF to PDF/A",      zh: "PDF 转 PDF/A",    es: "PDF a PDF/A",    pt: "PDF para PDF/A",    fr: "PDF en PDF/A",    ja: "PDF を PDF/A に変換",       de: "PDF zu PDF/A", ko: "PDF를 PDF/A로 변환" },
      { slug: "pdf-to-image",    en: "PDF to Image",      zh: "PDF 转图片",      es: "PDF a imagen",   pt: "PDF para imagem",   fr: "PDF en image",    ja: "PDF を画像に変換",          de: "PDF zu Bild", ko: "PDF를 이미지로 변환" },
      { slug: "pdf-to-html",     en: "PDF to HTML",       zh: "PDF 转 HTML",     es: "PDF a HTML",     pt: "PDF para HTML",     fr: "PDF en HTML",     ja: "PDF を HTML に変換",        de: "PDF zu HTML", ko: "PDF를 HTML로 변환" },
      { slug: "pdf-to-markdown", en: "PDF to Markdown",   zh: "PDF 转 Markdown", es: "PDF a Markdown", pt: "PDF para Markdown", fr: "PDF en Markdown", ja: "PDF を Markdown に変換",    de: "PDF zu Markdown", ko: "PDF를 Markdown으로 변환" },
      { slug: "pdf-to-text",     en: "PDF to Text",       zh: "PDF 转文字",      es: "PDF a Texto",    pt: "PDF para Texto",    fr: "PDF en Texte",    ja: "PDF をテキストに変換",      de: "PDF zu Text", ko: "PDF를 텍스트로 변환" },
      { slug: "word-to-pdf",     en: "Word to PDF",       zh: "Word 转 PDF",     es: "Word a PDF",     pt: "Word para PDF",     fr: "Word en PDF",     ja: "Word を PDF に変換",        de: "Word zu PDF", ko: "Word를 PDF로 변환" },
      { slug: "excel-to-pdf",    en: "Excel to PDF",      zh: "Excel 转 PDF",    es: "Excel a PDF",    pt: "Excel para PDF",    fr: "Excel en PDF",    ja: "Excel を PDF に変換",       de: "Excel zu PDF", ko: "Excel을 PDF로 변환" },
      { slug: "ppt-to-pdf",      en: "PPT to PDF",        zh: "PPT 转 PDF",      es: "PPT a PDF",      pt: "PPT para PDF",      fr: "PPT en PDF",      ja: "PPT を PDF に変換",         de: "PPT zu PDF", ko: "PPT를 PDF로 변환" },
      { slug: "images-to-pdf",   en: "Images to PDF",     zh: "图片转 PDF",      es: "Imagen a PDF",   pt: "Imagem para PDF",   fr: "Image en PDF",    ja: "画像を PDF に変換",          de: "Bilder zu PDF", ko: "이미지를 PDF로 변환" },
      { slug: "html-to-pdf",     en: "HTML to PDF",       zh: "HTML 转 PDF",     es: "HTML a PDF",     pt: "HTML para PDF",     fr: "HTML en PDF",     ja: "HTML を PDF に変換",        de: "HTML zu PDF", ko: "HTML을 PDF로 변환" },
    ],
    limits: {
      free: { en: "10/day", zh: "10次/天", es: "10/día", pt: "10/dia", fr: "10/jour", ja: "10 回/日", de: "10 / Tag", ko: "10 / 일" },
      pro:  { en: "Unlimited", zh: "无限", es: "Ilimitado", pt: "Ilimitado", fr: "Illimité", ja: "無制限", de: "Unbegrenzt", ko: "무제한" },
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
      ja: "バッチ処理",
      de: "Stapelverarbeitung", ko: "일괄 처리",
    },
    tools: [
      { slug: "batch-compress",      en: "Batch Compress",            zh: "批量 PDF 压缩",   es: "Compresión por lotes",          pt: "Compressão em lote",              fr: "Compression par lots",    ja: "一括圧縮",                de: "Stapel-Komprimierung", ko: "일괄 압축" },
      { slug: "batch-pdf-to-image",  en: "Batch PDF to Image",        zh: "批量 PDF 转图片", es: "PDF a imagen por lotes",        pt: "PDF para imagem em lote",         fr: "PDF en image par lots",   ja: "PDF を画像に一括変換",    de: "Stapel: PDF zu Bild", ko: "PDF 일괄 이미지 변환" },
      { slug: "batch-protect-pdf",   en: "Batch Encrypt PDF",         zh: "批量 PDF 加密",   es: "Cifrado por lotes",             pt: "Criptografia em lote",            fr: "Chiffrement par lots",    ja: "PDF を一括暗号化",        de: "Stapel: PDF verschlüsseln", ko: "PDF 일괄 암호화" },
      { slug: "batch-pdf-to-word",   en: "Batch PDF to Word",         zh: "批量 PDF 转 Word", es: "PDF a Word por lotes",         pt: "PDF para Word em lote",           fr: "PDF en Word par lots",    ja: "PDF を Word に一括変換",  de: "Stapel: PDF zu Word", ko: "PDF 일괄 Word 변환" },
      { slug: "batch-pdf-to-excel",  en: "Batch PDF to Excel",        zh: "批量 PDF 转 Excel", es: "PDF a Excel por lotes",       pt: "PDF para Excel em lote",          fr: "PDF en Excel par lots",   ja: "PDF を Excel に一括変換", de: "Stapel: PDF zu Excel", ko: "PDF 일괄 Excel 변환" },
      { slug: "batch-word-to-pdf",   en: "Batch Word to PDF",         zh: "批量 Word 转 PDF", es: "Word a PDF por lotes",         pt: "Word para PDF em lote",           fr: "Word en PDF par lots",    ja: "Word を PDF に一括変換",  de: "Stapel: Word zu PDF", ko: "Word 일괄 PDF 변환" },
      { slug: "batch-excel-to-pdf",  en: "Batch Excel to PDF",        zh: "批量 Excel 转 PDF", es: "Excel a PDF por lotes",       pt: "Excel para PDF em lote",          fr: "Excel en PDF par lots",   ja: "Excel を PDF に一括変換", de: "Stapel: Excel zu PDF", ko: "Excel 일괄 PDF 변환" },
      { slug: "batch-ppt-to-pdf",    en: "Batch PPT to PDF",          zh: "批量 PPT 转 PDF", es: "PPT a PDF por lotes",           pt: "PPT para PDF em lote",            fr: "PPT en PDF par lots",     ja: "PPT を PDF に一括変換",   de: "Stapel: PPT zu PDF", ko: "PPT 일괄 PDF 변환" },
      { slug: "batch-translate",     en: "Batch Translate",           zh: "批量翻译",        es: "Traducir por lotes",            pt: "Traduzir em lote",                fr: "Traduction par lots",     ja: "一括翻訳",                de: "Stapel-Übersetzung", ko: "일괄 번역" },
    ],
    limits: {
      free: {
        en: "≤ 3 files/batch · 3 batches/day",
        zh: "≤ 3文件/批 · 3批/天",
        es: "≤ 3 archivos/lote · 3 lotes/día",
        pt: "≤ 3 arquivos/lote · 3 lotes/dia",
        fr: "≤ 3 fichiers/lot · 3 lots/jour",
        ja: "≤ 3 ファイル/バッチ · 3 バッチ/日",
        de: "≤ 3 Dateien/Stapel · 3 Stapel/Tag", ko: "≤ 3파일/배치 · 3배치/일",
      },
      pro:  {
        en: "≤ 50 files/batch · unlimited batches",
        zh: "≤ 50文件/批 · 不限次",
        es: "≤ 50 archivos/lote · lotes ilimitados",
        pt: "≤ 50 arquivos/lote · lotes ilimitados",
        fr: "≤ 50 fichiers/lot · lots illimités",
        ja: "≤ 50 ファイル/バッチ · バッチ無制限",
        de: "≤ 50 Dateien/Stapel · unbegrenzte Stapel", ko: "≤ 50파일/배치 · 배치 무제한",
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
      ja: "AI ワークフロー — 標準",
      de: "KI-Workflows — Standard", ko: "AI 워크플로 — 표준",
    },
    tools: [
      { slug: "ai-workspace",  en: "AI Workspace",          zh: "AI 工作台",    es: "Espacio de trabajo IA", pt: "Espaço de trabalho IA", fr: "Espace de travail IA", ja: "AI ワークスペース", de: "KI-Arbeitsbereich", ko: "AI 워크스페이스" },
      { slug: "chat-with-pdf", en: "Chat with PDF",         zh: "PDF 问答",     es: "Chatear con PDF",       pt: "Chat com PDF",          fr: "Chat avec PDF",        ja: "PDFと対話",         de: "Mit PDF chatten", ko: "PDF와 대화" },
      { slug: "ai-summary",    en: "AI Summary",            zh: "PDF 摘要提取", es: "Resumen de PDF",        pt: "Resumo de PDF",         fr: "Résumé PDF",           ja: "AI 要約",           de: "KI-Zusammenfassung", ko: "AI 요약" },
      { slug: "translate-pdf", en: "Translate PDF",         zh: "PDF 翻译",     es: "Traducir PDF",          pt: "Traduzir PDF",          fr: "Traduire PDF",         ja: "PDF 翻訳",          de: "PDF übersetzen", ko: "PDF 번역" },
      { slug: "batch-sort",    en: "Auto-Classify PDFs",    zh: "PDF 智能分类", es: "Clasificar PDF",        pt: "Classificar PDF",       fr: "Classer PDF",          ja: "PDF 自動分類",      de: "PDFs automatisch klassifizieren", ko: "PDF 자동 분류" },
    ],
    limits: {
      free: { en: "10 / day",   zh: "10次/天",  es: "10/día",  pt: "10/dia",  fr: "10/jour", ja: "10 回/日", de: "10 / Tag", ko: "10 / 일" },
      pro:  { en: "Unlimited",  zh: "无限",     es: "Ilimitado", pt: "Ilimitado", fr: "Illimité", ja: "無制限", de: "Unbegrenzt", ko: "무제한" },
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
      ja: "AI ヒーロー — 専門分析",
      de: "KI-Spezialisten — Fachanalyse", ko: "AI 전문가 — 특화 분석",
    },
    tools: [
      { slug: "compare",          en: "Compare Documents",      zh: "多文档对比",       es: "Comparar documentos",                  pt: "Comparar documentos",                  fr: "Comparer des documents",                ja: "ドキュメント比較",        de: "Dokumente vergleichen", ko: "문서 비교" },
      { slug: "redline",          en: "Compare Versions",       zh: "PDF 版本对比",     es: "Comparar versiones",                   pt: "Comparar versões",                     fr: "Comparer des versions",                 ja: "バージョン比較",          de: "Versionen vergleichen", ko: "버전 비교" },
      { slug: "contract-risk",    en: "Contract Risk Check",    zh: "合同风险体检",     es: "Revisión de riesgos del contrato",     pt: "Revisão de riscos do contrato",        fr: "Analyse de risques du contrat",         ja: "契約リスクチェック",      de: "Vertragsrisiko-Prüfung", ko: "계약 위험 검토" },
      { slug: "govbid-matrix",    en: "Gov Bid Compliance",     zh: "政府标书合规矩阵", es: "Matriz de cumplimiento de licitación", pt: "Matriz de conformidade de licitação",  fr: "Matrice de conformité d'appel d'offres", ja: "入札コンプライアンス",   de: "Ausschreibungs-Compliance", ko: "정부 입찰 적합성" },
      { slug: "extract-to-excel", en: "Extract to Excel",       zh: "数据抽取到表格",   es: "Extraer a Excel",                      pt: "Extrair para Excel",                   fr: "Extraire vers Excel",                   ja: "Excel に抽出",            de: "Nach Excel extrahieren", ko: "Excel로 추출" },
      { slug: "lease-redflag",    en: "Lease Red Flag Check",   zh: "租约红旗扫描",     es: "Análisis de riesgos del arrendamiento", pt: "Análise de riscos do arrendamento",   fr: "Signaux d'alerte du bail",              ja: "リース契約の注意点チェック", de: "Mietvertrag-Warnsignale", ko: "임대차 위험 스캔" },
      { slug: "contract-review",  en: "Contract Review",        zh: "合同版本对比",     es: "Revisión de contratos",                 pt: "Revisão de contratos",                fr: "Révision de contrats",                  ja: "契約書バージョン比較",    de: "Vertragsversionsvergleich", ko: "계약서 버전 비교" },
    ],
    limits: {
      free: { en: "3 / day",    zh: "3次/天",  es: "3/día",   pt: "3/dia",   fr: "3/jour", ja: "3 回/日", de: "3 / Tag", ko: "3 / 일" },
      pro:  { en: "Unlimited",  zh: "无限", es: "Ilimitado", pt: "Ilimitado", fr: "Illimité", ja: "無制限", de: "Unbegrenzt", ko: "무제한", internal: "~5 000/mo soft cap" },
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
      ja: "ヒーロー プレミアム出力",
      de: "Premium-Ausgaben der Spezialisten", ko: "전문가 프리미엄 출력",
    },
    tools: [],
    features: [
      {
        en: "Gov Bid → Excel matrix export",
        zh: "标书 Excel 矩阵导出",
        es: "Licitación → exportar matriz a Excel",
        pt: "Licitação → exportar matriz para Excel",
        fr: "Appel d'offres → export matrice Excel",
        ja: "入札 → Excel マトリクス出力",
        de: "Ausschreibung → Excel-Matrix-Export", ko: "정부 입찰 → Excel 매트릭스 내보내기",
        status: "coming",
      },
      {
        en: "Statement batch processing + large files",
        zh: "对账单批量处理 + 大文件",
        es: "Procesamiento de extractos por lotes + archivos grandes",
        pt: "Processamento de extratos em lote + arquivos grandes",
        fr: "Traitement de relevés par lots + fichiers volumineux",
        ja: "明細の一括処理 + 大容量ファイル",
        de: "Stapelverarbeitung von Kontoauszügen + große Dateien", ko: "명세서 일괄 처리 + 대용량 파일",
        status: "coming",
      },
      {
        en: "Extract line items + break 8-doc / 60 k-char cap",
        zh: "抽取行项目 + 突破8份6万字符上限",
        es: "Extraer partidas + superar el límite de 8 docs / 60 k caracteres",
        pt: "Extrair itens + superar o limite de 8 docs / 60 mil caracteres",
        fr: "Extraire les lignes + dépasser la limite de 8 docs / 60 k caractères",
        ja: "明細項目の抽出 + 8 件 / 6 万文字の上限を解除",
        de: "Positionen extrahieren + 8-Dokumente-/60.000-Zeichen-Grenze überschreiten", ko: "항목 추출 + 8개 문서 / 6만 자 제한 해제",
        status: "coming",
      },
      {
        en: "Hero large docs (long contracts · 100-300 page RFPs)",
        zh: "英雄大文档（长合同·100-300页RFP）",
        es: "Documentos grandes para expertos (contratos largos · RFP de 100-300 páginas)",
        pt: "Documentos grandes para especialistas (contratos longos · RFPs de 100-300 páginas)",
        fr: "Grands documents pour experts (contrats longs · appels d'offres de 100-300 pages)",
        ja: "ヒーロー大容量文書（長い契約書 · 100-300 ページの RFP）",
        de: "Große Spezialisten-Dokumente (lange Verträge · 100-300-seitige Ausschreibungen)", ko: "전문가용 대용량 문서 (긴 계약서 · 100-300페이지 RFP)",
        status: "coming",
      },
    ],
    limits: {
      free: { en: "—", zh: "—", es: "—", pt: "—", fr: "—", ja: "—", de: "—", ko: "—" },
      pro:  { en: "✓ Pro only", zh: "✓ 仅 Pro", es: "✓ Solo Pro", pt: "✓ Só Pro", fr: "✓ Pro uniquement", ja: "✓ Pro 限定", de: "✓ Nur Pro", ko: "✓ Pro 전용" },
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
      ja: "業種別ソリューション",
      de: "Branchenlösungen", ko: "전문 업종",
    },
    tools: [],
    features: [
      { en: "Legal & contracts",          zh: "法律 / 合同",  es: "Legal y contratos",          pt: "Jurídico e contratos",       fr: "Juridique et contrats",        ja: "法務・契約",         de: "Recht & Verträge", ko: "법률 / 계약",            status: "live", href: "/for/legal" },
      { en: "Finance & tax",              zh: "财务 / 税务",  es: "Finanzas e impuestos",       pt: "Finanças e impostos",        fr: "Finance et fiscalité",         ja: "財務・税務",         de: "Finanzen & Steuern", ko: "재무 / 세무",          status: "live", href: "/for/finance" },
      { en: "Research & academia",        zh: "科研 / 学术",  es: "Investigación y academia",   pt: "Pesquisa y academia",        fr: "Recherche et académique",      ja: "研究・学術",         de: "Forschung & Wissenschaft", ko: "연구 / 학술",    status: "live", href: "/for/research" },
      { en: "Banking & finance",          zh: "金融 / 投行",  es: "Banca y finanzas",           pt: "Banco e finanças",           fr: "Banque et finance",            ja: "銀行・金融",         de: "Banken & Finanzwesen", ko: "금융 / 투자은행",        status: "coming" },
      { en: "Architecture & engineering", zh: "建筑 / 工程",  es: "Arquitectura e ingeniería",  pt: "Arquitetura e engenharia",   fr: "Architecture et ingénierie",   ja: "建築・エンジニアリング", de: "Architektur & Ingenieurwesen", ko: "건축 / 엔지니어링", status: "coming" },
      { en: "Healthcare & medical",       zh: "医疗 / 健康",  es: "Salud y medicina",           pt: "Saúde y medicina",           fr: "Santé et médecine",            ja: "医療・ヘルスケア",   de: "Gesundheit & Medizin", ko: "의료 / 헬스케어",        status: "coming" },
    ],
    limits: {
      free: { en: "1 taste",                  zh: "1次尝鲜", es: "1 de prueba", pt: "1 de teste", fr: "1 à l'essai", ja: "1 回お試し", de: "1 zum Testen", ko: "1회 체험" },
      pro:  { en: "Unlimited · all verticals", zh: "无限 · 全部垂直", es: "Ilimitado · todos los sectores", pt: "Ilimitado · todos os setores", fr: "Illimité · tous les secteurs", ja: "無制限 · 全業種", de: "Unbegrenzt · alle Branchen", ko: "무제한 · 전체 업종" },
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
      ja: "Pro 限定",
      de: "Pro-exklusiv", ko: "Pro 전용",
    },
    tools: [],
    features: [
      {
        en: "Private workspace",
        zh: "私密工作区",
        es: "Espacio de trabajo privado",
        pt: "Espaço de trabalho privado",
        fr: "Espace de travail privé",
        ja: "プライベートワークスペース",
        de: "Privater Arbeitsbereich", ko: "프라이빗 워크스페이스",
        status: "live",
      },
      {
        en: "Unlimited batch, AI & verticals",
        zh: "无限批量/AI/垂直",
        es: "Lotes, IA y sectores ilimitados",
        pt: "Lotes, IA e setores ilimitados",
        fr: "Lots, IA et secteurs illimités",
        ja: "バッチ・AI・業種別が無制限",
        de: "Unbegrenzte Stapel, KI & Branchen", ko: "무제한 일괄 처리·AI·업종",
        status: "live",
      },
      {
        en: "API access",
        zh: "API 访问",
        es: "Acceso a la API",
        pt: "Acesso à API",
        fr: "Accès à l'API",
        ja: "API アクセス",
        de: "API-Zugriff", ko: "API 액세스",
        status: "coming",
      },
      {
        en: "Team seats",
        zh: "团队席位",
        es: "Plazas de equipo",
        pt: "Assentos de equipe",
        fr: "Sièges d'équipe",
        ja: "チームシート",
        de: "Team-Plätze", ko: "팀 좌석",
        status: "coming",
      },
      {
        en: "Priority processing",
        zh: "优先处理",
        es: "Procesamiento prioritario",
        pt: "Processamento prioritário",
        fr: "Traitement prioritaire",
        ja: "優先処理",
        de: "Priorisierte Verarbeitung", ko: "우선 처리",
        status: "coming",
      },
    ],
    limits: {
      free: { en: "—", zh: "—", es: "—", pt: "—", fr: "—", ja: "—", de: "—", ko: "—" },
      pro:  { en: "✓", zh: "✓", es: "✓", pt: "✓", fr: "✓", ja: "✓", de: "✓", ko: "✓" },
    },
  },
];
