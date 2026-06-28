import { defaultLocale } from "@/lib/i18n";
import { VerticalHubPage, type VerticalConfig } from "@/components/VerticalHubPage";

type Locale = "en" | "zh" | "es" | "pt" | "fr" | "ja" | "zh-Hant" | "de" | "ko";

// "Research & academia" professional vertical — a thin config over VerticalHubPage.
// Honesty gate: every card is a real, shipping tool (ai-summary, chat-with-pdf,
// compare, ocr-pdf, extract-to-excel). The page adds no gate and advertises no
// unbuilt quotas; the linked tools keep their own gating. The disclaimer is
// honest about AI summaries missing nuance — verify against the source before citing.
// Full en/zh/es/pt/fr/ja/de content; zh-Hant derives from zh (deepHant); ko falls back to en.
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
    ja: {
      eyebrow: "研究・学術向け",
      heroTitle: "論文・レポート・研究のための AI ドキュメントツール",
      heroDescription:
        "長い論文を要点に凝縮し、PDF にその手法や結果を質問し、複数の研究を並べて比較し、スキャンした論文を OCR し、データ表をスプレッドシートに抽出できます——回答や指摘の際には、その根拠となる原文の該当箇所を示すので、引用する前に確認できます。",
      primary: "論文を要約する",
      secondary: "論文に質問する",
      cardsTitle: "研究者向けツール",
      cards: [
        { slug: "ai-summary", label: "AI 要約", description: "長い論文やレポートを、主要な発見・手法・要点に凝縮します。" },
        { slug: "chat-with-pdf", label: "PDF とチャット", description: "論文に手法・結果・定義を質問——回答は出典となった原文の該当箇所を示し、出典と照合できない部分は明示します。" },
        { slug: "compare", label: "ドキュメント比較", description: "重要な観点で複数の論文や研究を並べて比較します。" },
        { slug: "ocr-pdf", label: "PDF OCR", description: "スキャンした論文や古い PDF から選択可能なテキストを抽出し、検索と引用を可能にします。" },
        { slug: "extract-to-excel", label: "Excel に抽出", description: "PDF 内のデータ表や図を、分析できるスプレッドシートに抽出します。" },
      ],
      disclaimer: "これらのツールは、研究資料をより速く読み・検索し・整理するのを助けます。AI の要約や回答は細かなニュアンスを見落とすことがあります——引用したり依拠したりする前に、必ず原典と照合して確認してください。",
    },
    de: {
      eyebrow: "Für Forschung & Wissenschaft",
      heroTitle: "KI-Dokumenttools für Arbeiten, Berichte und Forschung",
      heroDescription:
        "Fassen Sie lange Arbeiten auf ihre Kernergebnisse zusammen, befragen Sie ein PDF zu seinen Methoden und Ergebnissen, vergleichen Sie mehrere Studien nebeneinander, wenden Sie OCR auf gescannte Artikel an und übertragen Sie Datentabellen in eine Tabelle — bei jeder Antwort und jedem Befund wird die zugrunde liegende Textstelle angezeigt, sodass Sie vor dem Zitieren prüfen können.",
      primary: "Eine Arbeit zusammenfassen",
      secondary: "Eine Arbeit befragen",
      cardsTitle: "Tools für Forschende",
      cards: [
        { slug: "ai-summary", label: "KI-Zusammenfassung", description: "Verdichten Sie eine lange Arbeit oder einen Bericht auf ihre Kernergebnisse, Methoden und zentralen Aussagen." },
        { slug: "chat-with-pdf", label: "Mit PDF chatten", description: "Befragen Sie eine Arbeit zu ihren Methoden, Ergebnissen oder Definitionen — Antworten zeigen die Textstelle, aus der sie stammen, und weisen darauf hin, was sich nicht belegen lässt." },
        { slug: "compare", label: "Dokumente vergleichen", description: "Stellen Sie mehrere Arbeiten oder Studien nebeneinander anhand der entscheidenden Kriterien." },
        { slug: "ocr-pdf", label: "PDF-OCR", description: "Extrahieren Sie auswählbaren Text aus gescannten Artikeln und alten PDFs, um sie durchsuchen und zitieren zu können." },
        { slug: "extract-to-excel", label: "In Excel extrahieren", description: "Übertragen Sie Datentabellen und Abbildungen aus einem PDF in eine Tabelle, die Sie analysieren können." },
      ],
      disclaimer: "Diese Tools helfen Ihnen, Forschungsmaterial schneller zu lesen, zu durchsuchen und zu ordnen. KI-Zusammenfassungen und -Antworten können Nuancen übersehen — prüfen Sie immer anhand der Originalquelle, bevor Sie zitieren oder sich darauf verlassen.",
    },
    ko: {
      eyebrow: "연구 / 학술",
      heroTitle: "논문, 보고서, 연구를 위한 AI 문서 도구",
      heroDescription:
        "긴 논문을 핵심 발견으로 요약하고, PDF에 방법과 결과를 질문하고, 여러 연구를 나란히 비교하고, 스캔한 논문에 OCR을 적용하고, 데이터 표를 스프레드시트로 추출하세요 — 답변하거나 발견을 표시할 때 그 근거가 된 구절을 함께 보여 주므로, 인용하기 전에 직접 확인할 수 있습니다.",
      primary: "논문 요약",
      secondary: "논문에 질문",
      cardsTitle: "연구자를 위한 도구",
      cards: [
        { slug: "ai-summary", label: "AI 요약", description: "긴 논문이나 보고서를 핵심 발견·방법·요점으로 압축합니다." },
        { slug: "chat-with-pdf", label: "PDF와 대화", description: "논문에 방법·결과·정의를 질문하세요 — 답변은 그 출처가 된 구절을 보여 주고, 출처를 찾을 수 없는 부분은 표시합니다." },
        { slug: "compare", label: "문서 비교", description: "여러 논문이나 연구를 중요한 기준에 따라 나란히 비교합니다." },
        { slug: "ocr-pdf", label: "PDF OCR", description: "스캔한 논문과 오래된 PDF에서 선택 가능한 텍스트를 추출해 검색하고 인용할 수 있게 합니다." },
        { slug: "extract-to-excel", label: "Excel로 추출", description: "PDF 속 데이터 표와 도표를 분석할 수 있는 스프레드시트로 추출합니다." },
      ],
      disclaimer: "이 도구들은 연구 자료를 더 빠르게 읽고, 검색하고, 정리하도록 돕습니다. AI 요약과 답변은 미묘한 뉘앙스를 놓칠 수 있으므로, 인용하거나 근거로 삼기 전에 반드시 원본 출처와 대조해 확인하세요.",
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
