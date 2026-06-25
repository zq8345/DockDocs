import { defaultLocale } from "@/lib/i18n";
import { VerticalHubPage, type VerticalConfig } from "@/components/VerticalHubPage";

type Locale = "en" | "zh" | "es" | "pt" | "fr" | "ja" | "zh-Hant" | "de";

// "Finance & tax" professional vertical — a thin config over VerticalHubPage.
// Honesty gate: every card is a real, shipping tool (extract-to-excel,
// batch-extract-sheet, pdf-to-excel, ai-summary, compare). The page adds no gate
// and advertises no unbuilt quotas; the linked tools keep their own gating.
// Full en/zh/es/pt/fr/ja/de content; zh-Hant derives from zh (deepHant); ko falls back to en.
const financeConfig: VerticalConfig = {
  vertical: "finance",
  primarySlug: "extract-to-excel",
  secondarySlug: "ai-summary",
  disclaimerIcon: "📊",
  copy: {
    en: {
      eyebrow: "For finance & accounting",
      heroTitle: "AI document tools for invoices, statements, and financial reports",
      heroDescription:
        "Pull the numbers out of invoices, receipts, and statements into a spreadsheet, summarize long financial reports, and compare quotes side by side — each figure is shown with the source text it came from when it can be located, so you can check it before it reaches your books.",
      primary: "Extract to a spreadsheet",
      secondary: "Summarize a report",
      cardsTitle: "Tools for finance teams",
      cards: [
        { slug: "extract-to-excel", label: "Extract to Excel", description: "Turn invoices, receipts, and statements into a spreadsheet — AI pulls the key fields and shows the source text behind a value where it can locate it." },
        { slug: "batch-extract-sheet", label: "Batch Extract to Sheet", description: "Drop a whole batch of invoices or receipts and get one combined spreadsheet, extracted automatically." },
        { slug: "pdf-to-excel", label: "PDF to Excel", description: "Convert financial tables and statements from PDF into an editable Excel file." },
        { slug: "ai-summary", label: "AI Summary", description: "Condense long financial reports, filings, and earnings documents into key points and figures." },
        { slug: "compare", label: "Compare Documents", description: "Line up quotes, bids, or invoices side by side on the terms that matter, with a plain-language recommendation." },
      ],
      disclaimer: "These tools help you read and organize financial documents faster. They are not financial, tax, or accounting advice — for anything important, consult a qualified professional.",
    },
    zh: {
      eyebrow: "财务 / 税务",
      heroTitle: "面向发票、对账单与财报的 AI 文档工具",
      heroDescription:
        "把发票、收据、对账单里的数字抽成表格，浓缩冗长的财务报告，并排比较多份报价——能定位到原文时，每个数字都标出它在文档中的出处，让你在录入账目前逐项核对。",
      primary: "抽取成表格",
      secondary: "摘要一份报告",
      cardsTitle: "财务团队工具",
      cards: [
        { slug: "extract-to-excel", label: "数据抽取到表格", description: "把发票、收据、对账单抽成表格——AI 提取关键字段，能定位到原文时标出每个值背后的出处。" },
        { slug: "batch-extract-sheet", label: "批量抽取到表格", description: "整批丢进发票或收据，自动抽取并汇成一张表格。" },
        { slug: "pdf-to-excel", label: "PDF 转 Excel", description: "把 PDF 里的财务表格和对账单转换成可编辑的 Excel 文件。" },
        { slug: "ai-summary", label: "AI 摘要", description: "把冗长的财报、申报文件和业绩文档浓缩成要点和关键数字。" },
        { slug: "compare", label: "多文档对比", description: "围绕关键条款把报价、投标或发票并排比较，并给出白话推荐。" },
      ],
      disclaimer: "这些工具帮你更快地阅读和整理财务文档，不构成财务、税务或会计意见——重要事项请咨询专业人士。",
    },
    es: {
      eyebrow: "Finanzas y contabilidad",
      heroTitle: "Herramientas de documentos con IA para facturas, estados de cuenta e informes financieros",
      heroDescription:
        "Extrae los números de facturas, recibos y estados de cuenta a una hoja de cálculo, resume informes financieros extensos y compara presupuestos lado a lado — cada cifra se muestra con el texto de origen del documento cuando puede localizarse, para que puedas verificarla antes de que llegue a tus libros.",
      primary: "Extraer a una hoja de cálculo",
      secondary: "Resumir un informe",
      cardsTitle: "Herramientas para equipos de finanzas",
      cards: [
        { slug: "extract-to-excel", label: "Extraer a Excel", description: "Convierte facturas, recibos y estados de cuenta en una hoja de cálculo — la IA extrae los campos clave y muestra el texto de origen de cada valor cuando puede localizarlo." },
        { slug: "batch-extract-sheet", label: "Extracción por lotes a hoja", description: "Suelta un lote completo de facturas o recibos y obtén una sola hoja de cálculo combinada, extraída automáticamente." },
        { slug: "pdf-to-excel", label: "PDF a Excel", description: "Convierte tablas y estados financieros de PDF a un archivo de Excel editable." },
        { slug: "ai-summary", label: "Resumen IA", description: "Condensa informes financieros, presentaciones y documentos de resultados extensos en puntos clave y cifras." },
        { slug: "compare", label: "Comparar documentos", description: "Alinea presupuestos, ofertas o facturas lado a lado según lo que importa, con una recomendación en lenguaje claro." },
      ],
      disclaimer: "Estas herramientas te ayudan a leer y organizar documentos financieros más rápido. No son asesoramiento financiero, fiscal ni contable — para algo importante, consulta a un profesional cualificado.",
    },
    pt: {
      eyebrow: "Finanças e contabilidade",
      heroTitle: "Ferramentas de documentos com IA para faturas, extratos e relatórios financeiros",
      heroDescription:
        "Extraia os números de faturas, recibos e extratos para uma planilha, resuma relatórios financeiros longos e compare orçamentos lado a lado — cada valor é mostrado com o texto de origem do documento quando ele pode ser localizado, para que você possa conferi-lo antes de lançá-lo na contabilidade.",
      primary: "Extrair para uma planilha",
      secondary: "Resumir um relatório",
      cardsTitle: "Ferramentas para equipes financeiras",
      cards: [
        { slug: "extract-to-excel", label: "Extrair para Excel", description: "Transforme faturas, recibos e extratos em uma planilha — a IA extrai os campos-chave e mostra o texto de origem de cada valor quando consegue localizá-lo." },
        { slug: "batch-extract-sheet", label: "Extração em lote para planilha", description: "Solte um lote inteiro de faturas ou recibos e receba uma única planilha combinada, extraída automaticamente." },
        { slug: "pdf-to-excel", label: "PDF para Excel", description: "Converta tabelas e extratos financeiros de PDF para um arquivo Excel editável." },
        { slug: "ai-summary", label: "Resumo IA", description: "Condense relatórios financeiros, demonstrações e documentos de resultados longos em pontos-chave e números." },
        { slug: "compare", label: "Comparar documentos", description: "Alinhe orçamentos, propostas ou faturas lado a lado pelos termos que importam, com uma recomendação em linguagem simples." },
      ],
      disclaimer: "Estas ferramentas ajudam você a ler e organizar documentos financeiros mais rápido. Não constituem aconselhamento financeiro, fiscal ou contábil — para assuntos importantes, consulte um profissional qualificado.",
    },
    fr: {
      eyebrow: "Finance et comptabilité",
      heroTitle: "Outils documentaires IA pour factures, relevés et rapports financiers",
      heroDescription:
        "Extrayez les chiffres des factures, reçus et relevés vers un tableur, résumez de longs rapports financiers et comparez des devis côte à côte — chaque montant est accompagné du texte source du document lorsqu'il peut être localisé, pour que vous puissiez le vérifier avant qu'il n'entre dans vos comptes.",
      primary: "Extraire vers un tableur",
      secondary: "Résumer un rapport",
      cardsTitle: "Outils pour les équipes financières",
      cards: [
        { slug: "extract-to-excel", label: "Extraire vers Excel", description: "Transformez factures, reçus et relevés en tableur — l'IA extrait les champs clés et indique le texte source de chaque valeur lorsqu'elle peut le localiser." },
        { slug: "batch-extract-sheet", label: "Extraction par lot vers tableur", description: "Déposez tout un lot de factures ou de reçus et obtenez un seul tableur combiné, extrait automatiquement." },
        { slug: "pdf-to-excel", label: "PDF vers Excel", description: "Convertissez les tableaux et relevés financiers d'un PDF en un fichier Excel modifiable." },
        { slug: "ai-summary", label: "Résumé IA", description: "Condensez de longs rapports financiers, dépôts réglementaires et documents de résultats en points clés et chiffres." },
        { slug: "compare", label: "Comparer des documents", description: "Alignez devis, offres ou factures côte à côte selon les critères qui comptent, avec une recommandation en langage clair." },
      ],
      disclaimer: "Ces outils vous aident à lire et organiser plus vite vos documents financiers. Ils ne constituent pas un conseil financier, fiscal ou comptable — pour toute question importante, consultez un professionnel qualifié.",
    },
    ja: {
      eyebrow: "財務・会計向け",
      heroTitle: "請求書・明細書・財務レポートのための AI ドキュメントツール",
      heroDescription:
        "請求書・領収書・明細書から数字を抜き出して表計算シートにまとめ、長い財務レポートを要約し、複数の見積もりを並べて比較できます。各数値は、出典を特定できる場合に文書中の該当箇所とともに表示されるので、帳簿に反映する前に一つずつ確認できます。",
      primary: "表計算シートに抽出",
      secondary: "レポートを要約",
      cardsTitle: "財務チーム向けツール",
      cards: [
        { slug: "extract-to-excel", label: "Excel に抽出", description: "請求書・領収書・明細書を表計算シートに変換します。AI が重要な項目を抜き出し、出典を特定できる場合は各値の該当箇所を表示します。" },
        { slug: "batch-extract-sheet", label: "シートに一括抽出", description: "請求書や領収書をまとめて投入すると、自動で抽出して 1 枚の表計算シートにまとめます。" },
        { slug: "pdf-to-excel", label: "PDF を Excel に変換", description: "PDF 内の財務表や明細書を編集可能な Excel ファイルに変換します。" },
        { slug: "ai-summary", label: "AI 要約", description: "長い財務レポート・開示書類・決算資料を要点と主要な数字に凝縮します。" },
        { slug: "compare", label: "ドキュメント比較", description: "見積もり・入札・請求書を、重要な条件を軸に並べて比較し、わかりやすい言葉で推奨を示します。" },
      ],
      disclaimer: "これらのツールは財務ドキュメントをより速く読み、整理するのに役立ちます。財務・税務・会計に関する助言ではありません。重要な事項については、有資格の専門家にご相談ください。",
    },
    de: {
      eyebrow: "Für Finanzen & Buchhaltung",
      heroTitle: "KI-Dokumenttools für Rechnungen, Kontoauszüge und Finanzberichte",
      heroDescription:
        "Übertragen Sie die Zahlen aus Rechnungen, Belegen und Kontoauszügen in eine Tabelle, fassen Sie lange Finanzberichte zusammen und vergleichen Sie Angebote nebeneinander — jeder Wert wird mit der zugehörigen Quelltextstelle aus dem Dokument angezeigt, sofern sie sich finden lässt, sodass Sie ihn prüfen können, bevor er in Ihre Bücher gelangt.",
      primary: "In eine Tabelle extrahieren",
      secondary: "Einen Bericht zusammenfassen",
      cardsTitle: "Tools für Finanzteams",
      cards: [
        { slug: "extract-to-excel", label: "In Excel extrahieren", description: "Verwandeln Sie Rechnungen, Belege und Kontoauszüge in eine Tabelle — die KI erfasst die wichtigsten Felder und zeigt zu jedem Wert die Quelltextstelle an, sofern sie sich finden lässt." },
        { slug: "batch-extract-sheet", label: "Stapel-Extraktion in Tabelle", description: "Laden Sie einen ganzen Stapel Rechnungen oder Belege hoch und erhalten Sie eine einzige kombinierte Tabelle, automatisch extrahiert." },
        { slug: "pdf-to-excel", label: "PDF in Excel", description: "Konvertieren Sie Finanztabellen und Kontoauszüge aus einem PDF in eine bearbeitbare Excel-Datei." },
        { slug: "ai-summary", label: "KI-Zusammenfassung", description: "Verdichten Sie lange Finanzberichte, Geschäftsberichte und Abschlüsse auf die wichtigsten Punkte und Kennzahlen." },
        { slug: "compare", label: "Dokumente vergleichen", description: "Stellen Sie Angebote, Ausschreibungen oder Rechnungen anhand der entscheidenden Konditionen nebeneinander — mit einer Empfehlung in klarer Sprache." },
      ],
      disclaimer: "Diese Tools helfen Ihnen, Finanzdokumente schneller zu lesen und zu ordnen. Sie sind keine Finanz-, Steuer- oder Buchhaltungsberatung — ziehen Sie bei wichtigen Fragen eine qualifizierte Fachperson hinzu.",
    },
  },
};

export function FinanceHubPage({
  locale = defaultLocale,
  useLocalePrefix = false,
}: {
  locale?: Locale;
  useLocalePrefix?: boolean;
}) {
  return <VerticalHubPage config={financeConfig} locale={locale} useLocalePrefix={useLocalePrefix} />;
}
