import { defaultLocale } from "@/lib/i18n";
import { VerticalHubPage, type VerticalConfig } from "@/components/VerticalHubPage";

type Locale = "en" | "zh" | "es" | "pt" | "fr";

// "Research & academia" professional vertical — a thin config over VerticalHubPage.
// Honesty gate: every card is a real, shipping tool (ai-summary, chat-with-pdf,
// compare, ocr-pdf, extract-to-excel). The page adds no gate and advertises no
// unbuilt quotas; the linked tools keep their own gating. The disclaimer is
// honest about AI summaries missing nuance — verify against the source before citing.
// Full en/zh/es/pt/fr content; other UI locales fall back to en.
const researchConfig: VerticalConfig = {
  vertical: "research",
  primarySlug: "ai-summary",
  secondarySlug: "chat-with-pdf",
  disclaimerIcon: "🔬",
  copy: {
    en: {
      eyebrow: "For research & academia",
      heroTitle: "AI document tools for papers, reports, and research",
      heroDescription:
        "Summarize long papers into their key findings, ask a PDF about its methods and results, compare several studies side by side, OCR scanned articles, and pull data tables into a spreadsheet — when it answers or flags a finding, it shows the passage behind it, so you can verify before you cite.",
      primary: "Summarize a paper",
      secondary: "Ask a paper",
      cardsTitle: "Tools for researchers",
      cards: [
        { slug: "ai-summary", label: "AI Summary", description: "Condense a long paper or report into its key findings, methods, and takeaways." },
        { slug: "chat-with-pdf", label: "Chat with PDF", description: "Ask a paper about its methods, results, or definitions — answers show the passage they came from, and flag what they can't trace." },
        { slug: "compare", label: "Compare Documents", description: "Line up several papers or studies side by side on the dimensions that matter." },
        { slug: "ocr-pdf", label: "PDF OCR", description: "Extract selectable text from scanned articles and old PDFs so you can search and quote them." },
        { slug: "extract-to-excel", label: "Extract to Excel", description: "Pull data tables and figures out of a PDF into a spreadsheet you can analyze." },
      ],
      disclaimer: "These tools help you read, search, and organize research faster. AI summaries and answers can miss nuance — always verify against the original source before citing or relying on it.",
    },
    zh: {
      eyebrow: "科研 / 学术",
      heroTitle: "面向论文、报告与研究的 AI 文档工具",
      heroDescription:
        "把长论文浓缩成核心发现，向 PDF 提问它的方法与结果，并排比较多篇研究，对扫描文章做 OCR，把数据表抽进表格——回答或标出某项发现时，它会展示支撑它的原文段落，让你在引用前能核对。",
      primary: "摘要一篇论文",
      secondary: "向论文提问",
      cardsTitle: "研究者工具",
      cards: [
        { slug: "ai-summary", label: "AI 摘要", description: "把长论文或报告浓缩成核心发现、方法与结论。" },
        { slug: "chat-with-pdf", label: "PDF 问答", description: "向论文提问方法、结果或定义——答案会展示它出自的原文，并标出无法溯源的部分。" },
        { slug: "compare", label: "多文档对比", description: "围绕关键维度把多篇论文或研究并排比较。" },
        { slug: "ocr-pdf", label: "PDF OCR", description: "从扫描文章和旧 PDF 中提取可选中的文字，便于检索和引用。" },
        { slug: "extract-to-excel", label: "数据抽取到表格", description: "把 PDF 里的数据表和图表抽进可分析的表格。" },
      ],
      disclaimer: "这些工具帮你更快地阅读、检索和整理研究资料。AI 摘要和回答可能遗漏细微之处——引用或依赖前请务必对照原文核对。",
    },
    es: {
      eyebrow: "Investigación y academia",
      heroTitle: "Herramientas de documentos con IA para artículos, informes e investigación",
      heroDescription:
        "Resume artículos extensos en sus hallazgos clave, pregunta a un PDF sobre sus métodos y resultados, compara varios estudios lado a lado, aplica OCR a artículos escaneados y extrae tablas de datos a una hoja de cálculo — cuando responde o señala un hallazgo, muestra el pasaje que lo respalda, para que puedas verificar antes de citar.",
      primary: "Resumir un artículo",
      secondary: "Preguntar a un artículo",
      cardsTitle: "Herramientas para investigadores",
      cards: [
        { slug: "ai-summary", label: "Resumen IA", description: "Condensa un artículo o informe extenso en sus hallazgos, métodos y conclusiones clave." },
        { slug: "chat-with-pdf", label: "Chat con PDF", description: "Pregunta a un artículo sobre sus métodos, resultados o definiciones — las respuestas muestran el pasaje del que provienen y señalan lo que no pueden rastrear." },
        { slug: "compare", label: "Comparar documentos", description: "Alinea varios artículos o estudios lado a lado según las dimensiones que importan." },
        { slug: "ocr-pdf", label: "OCR de PDF", description: "Extrae texto seleccionable de artículos escaneados y PDFs antiguos para poder buscarlos y citarlos." },
        { slug: "extract-to-excel", label: "Extraer a Excel", description: "Extrae tablas de datos y figuras de un PDF a una hoja de cálculo que puedas analizar." },
      ],
      disclaimer: "Estas herramientas te ayudan a leer, buscar y organizar tu investigación más rápido. Los resúmenes y respuestas de IA pueden pasar por alto matices — verifica siempre con la fuente original antes de citar o basarte en ello.",
    },
    pt: {
      eyebrow: "Pesquisa e academia",
      heroTitle: "Ferramentas de documentos com IA para artigos, relatórios e pesquisa",
      heroDescription:
        "Resuma artigos longos em suas principais descobertas, pergunte a um PDF sobre seus métodos e resultados, compare vários estudos lado a lado, aplique OCR a artigos digitalizados e extraia tabelas de dados para uma planilha — quando responde ou aponta uma constatação, mostra o trecho que a fundamenta, para que você possa verificar antes de citar.",
      primary: "Resumir um artigo",
      secondary: "Perguntar a um artigo",
      cardsTitle: "Ferramentas para pesquisadores",
      cards: [
        { slug: "ai-summary", label: "Resumo IA", description: "Condense um artigo ou relatório longo em suas principais descobertas, métodos e conclusões." },
        { slug: "chat-with-pdf", label: "Chat com PDF", description: "Pergunte a um artigo sobre seus métodos, resultados ou definições — as respostas mostram o trecho de onde vieram e sinalizam o que não podem rastrear." },
        { slug: "compare", label: "Comparar documentos", description: "Alinhe vários artigos ou estudos lado a lado pelas dimensões que importam." },
        { slug: "ocr-pdf", label: "OCR de PDF", description: "Extraia texto selecionável de artigos digitalizados e PDFs antigos para poder pesquisá-los e citá-los." },
        { slug: "extract-to-excel", label: "Extrair para Excel", description: "Extraia tabelas de dados e figuras de um PDF para uma planilha que você possa analisar." },
      ],
      disclaimer: "Estas ferramentas ajudam você a ler, pesquisar e organizar sua pesquisa mais rápido. Resumos e respostas de IA podem perder nuances — verifique sempre com a fonte original antes de citar ou se basear nela.",
    },
    fr: {
      eyebrow: "Recherche et académique",
      heroTitle: "Outils documentaires IA pour articles, rapports et recherche",
      heroDescription:
        "Résumez de longs articles en leurs conclusions clés, interrogez un PDF sur ses méthodes et résultats, comparez plusieurs études côte à côte, appliquez l'OCR à des articles numérisés et extrayez des tableaux de données vers un tableur — quand l'IA répond ou relève un élément, elle montre le passage qui l'appuie, pour que vous puissiez vérifier avant de citer.",
      primary: "Résumer un article",
      secondary: "Interroger un article",
      cardsTitle: "Outils pour les chercheurs",
      cards: [
        { slug: "ai-summary", label: "Résumé IA", description: "Condensez un long article ou rapport en ses conclusions, méthodes et points clés." },
        { slug: "chat-with-pdf", label: "Chat avec PDF", description: "Interrogez un article sur ses méthodes, résultats ou définitions — les réponses montrent le passage dont elles proviennent et signalent ce qu'elles ne peuvent pas tracer." },
        { slug: "compare", label: "Comparer des documents", description: "Alignez plusieurs articles ou études côte à côte selon les dimensions qui comptent." },
        { slug: "ocr-pdf", label: "OCR PDF", description: "Extrayez du texte sélectionnable d'articles numérisés et de vieux PDFs pour pouvoir les rechercher et les citer." },
        { slug: "extract-to-excel", label: "Extraire vers Excel", description: "Extrayez les tableaux de données et figures d'un PDF vers un tableur que vous pouvez analyser." },
      ],
      disclaimer: "Ces outils vous aident à lire, rechercher et organiser votre recherche plus vite. Les résumés et réponses de l'IA peuvent manquer de nuance — vérifiez toujours par rapport à la source originale avant de citer ou de vous y fier.",
    },
  },
};

export function ResearchHubPage({
  locale = defaultLocale,
  useLocalePrefix = false,
}: {
  locale?: Locale;
  useLocalePrefix?: boolean;
}) {
  return <VerticalHubPage config={researchConfig} locale={locale} useLocalePrefix={useLocalePrefix} />;
}
