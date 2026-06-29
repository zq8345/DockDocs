import { siteUrl } from "@/lib/i18n";
import { deepHant } from "@/lib/zh-hant";
import { getToolFaqItems } from "@/components/ToolFaq";

// Lightweight JSON-LD (WebApplication + BreadcrumbList) for indexable tool pages
// that render a custom *Client.tsx and are NOT in toolSlugs — so they have no
// PdfToolPageConfig and never went through createPdfToolSchema. This keeps GEO /
// structured-data coverage complete across both render paths (the non-prefixed
// app/<slug>/page.tsx and the /zh|/es catch-all). en/zh authored; es → en.
export type Loc = "en" | "zh" | "es" | "pt" | "fr" | "ja" | "de" | "ko" | "zh-Hant";
type Label = { name: string; description: string; crumb: string };

const EXTRA_TOOL_LABELS: Record<string, Partial<Record<Loc, Label>>> = {
  "crop-pdf": {
    en: {
      name: "DockDocs Crop PDF",
      crumb: "Crop PDF",
      description:
        "Crop PDF margins online for free. Trim whitespace from any edge with a live preview — every page cropped the same, all in your browser.",
    },
    zh: {
      name: "DockDocs 裁剪 PDF",
      crumb: "裁剪 PDF",
      description:
        "免费在线裁剪 PDF 页边：用实时预览裁掉任意一边的空白，每页按同样方式裁剪，全部在浏览器中完成。",
    },
    es: {
      name: "DockDocs Recortar PDF",
      crumb: "Recortar PDF",
      description:
        "Recorta los márgenes de un PDF en línea y gratis. Elimina el espacio en blanco de cualquier borde con vista previa en vivo: todas las páginas se recortan igual, en tu navegador.",
    },
    pt: {
      name: "DockDocs Cortar PDF",
      crumb: "Cortar PDF",
      description:
        "Corte as margens de um PDF online e grátis. Remova o espaço em branco de qualquer borda com pré-visualização ao vivo — todas as páginas cortadas da mesma forma, no seu navegador.",
    },
    fr: {
      name: "DockDocs Rogner PDF",
      crumb: "Rogner PDF",
      description:
        "Rognez les marges d'un PDF en ligne et gratuitement. Supprimez les espaces blancs de n'importe quel bord avec un aperçu en direct — toutes les pages rognées de la même façon, dans votre navigateur.",
    },
    ja: {
      name: "DockDocs PDF 余白トリミング",
      crumb: "PDF 余白トリミング",
      description:
        "PDF の余白を無料でオンライントリミング。ライブプレビューを見ながらどの辺の余白も削除でき、全ページを同じ範囲でトリミング。すべてブラウザ内で完結します。",
    },
    de: {
      name: "DockDocs PDF zuschneiden",
      crumb: "PDF zuschneiden",
      description:
        "PDF-Ränder kostenlos online zuschneiden. Schneiden Sie Leerraum von beliebigen Seiten mit Live-Vorschau ab – alle Seiten gleich zugeschnitten, ganz in Ihrem Browser.",
    },
    ko: {
      name: "DockDocs PDF 여백 자르기",
      crumb: "PDF 여백 자르기",
      description:
        "PDF 여백을 무료로 온라인에서 자르세요. 실시간 미리보기로 모든 가장자리 여백 제거 — 모든 페이지를 동일하게, 전부 브라우저에서 처리됩니다.",
    },
  },
  "redact-pdf": {
    en: {
      name: "DockDocs Redact PDF",
      crumb: "Redact PDF",
      description:
        "Redact a PDF for real — permanently destroy the hidden text, not just cover it. Entirely in your browser; your file never leaves your device.",
    },
    zh: {
      name: "DockDocs PDF 涂黑脱敏",
      crumb: "涂黑脱敏",
      description:
        "真正涂黑脱敏 PDF：把姓名、号码等敏感文字永久删除(不是盖个黑框)，全部在浏览器中完成，文件不外泄。",
    },
    es: {
      name: "DockDocs Censurar PDF",
      crumb: "Censurar PDF",
      description:
        "Censura un PDF de verdad: destruye permanentemente el texto oculto, no solo lo tapa. Todo en tu navegador; tu archivo nunca sale de tu dispositivo.",
    },
    pt: {
      name: "DockDocs Tarjar PDF",
      crumb: "Tarjar PDF",
      description:
        "Tarje um PDF de verdade: destrói permanentemente o texto oculto, não apenas o cobre. Tudo no seu navegador; seu arquivo nunca sai do seu dispositivo.",
    },
    fr: {
      name: "DockDocs Caviarder PDF",
      crumb: "Caviarder PDF",
      description:
        "Caviardez un PDF pour de vrai : détruisez définitivement le texte caché, au lieu de seulement le masquer. Entièrement dans votre navigateur ; votre fichier ne quitte jamais votre appareil.",
    },
    ja: {
      name: "DockDocs PDF 黒塗り墨消し",
      crumb: "PDF 黒塗り墨消し",
      description:
        "PDF を本当に黒塗りします。隠した文字を上から覆うだけでなく、永久に削除します。すべてブラウザ内で処理し、ファイルが端末から外に出ることはありません。",
    },
    de: {
      name: "DockDocs PDF schwärzen",
      crumb: "PDF schwärzen",
      description:
        "Echte PDF-Schwärzung — verborgener Text wird dauerhaft gelöscht, nicht nur verdeckt. Vollständig in Ihrem Browser; Ihre Datei verlässt Ihr Gerät nicht.",
    },
    ko: {
      name: "DockDocs PDF 개인정보 삭제",
      crumb: "PDF 개인정보 삭제",
      description:
        "진짜 PDF 개인정보 삭제 — 숨겨진 텍스트를 단순히 가리는 것이 아니라 영구적으로 제거합니다. 완전히 브라우저에서 처리, 파일이 기기 밖으로 나가지 않습니다.",
    },
  },
  redline: {
    en: {
      name: "DockDocs PDF Redline",
      crumb: "PDF Redline",
      description:
        "Compare two PDF versions to see exactly what changed — added text highlighted, removed text struck through. Free and in your browser.",
    },
    zh: {
      name: "DockDocs PDF 版本对比",
      crumb: "版本对比",
      description:
        "上传原始版和修订版 PDF，逐句对比看清新增和删除的内容，全部在浏览器中完成。",
    },
    es: {
      name: "DockDocs Comparar PDF",
      crumb: "Comparar PDF",
      description:
        "Compara dos versiones de un PDF para ver exactamente qué cambió: el texto añadido resaltado y el eliminado tachado. Gratis y en tu navegador.",
    },
    pt: {
      name: "DockDocs Comparar PDF",
      crumb: "Comparar PDF",
      description:
        "Compare duas versões de um PDF para ver exatamente o que mudou: texto adicionado em destaque e texto removido riscado. Grátis e no seu navegador.",
    },
    fr: {
      name: "DockDocs Comparer PDF",
      crumb: "Comparer PDF",
      description:
        "Comparez deux versions d'un PDF pour voir exactement ce qui a changé : texte ajouté surligné, texte supprimé barré. Gratuit et dans votre navigateur.",
    },
    ja: {
      name: "DockDocs PDF 変更履歴・差分",
      crumb: "PDF 差分比較",
      description:
        "2 つのバージョンの PDF を比較して、変更点を正確に把握。追加されたテキストはハイライト、削除されたテキストは取り消し線で表示。無料、ブラウザ内で完結します。",
    },
    de: {
      name: "DockDocs PDF Redline",
      crumb: "PDF Redline",
      description:
        "Vergleichen Sie zwei PDF-Versionen, um genau zu sehen, was sich geändert hat – hinzugefügter Text hervorgehoben, entfernter Text durchgestrichen. Kostenlos und in Ihrem Browser.",
    },
    ko: {
      name: "DockDocs PDF 변경사항 추적",
      crumb: "PDF 비교",
      description:
        "두 PDF 버전을 비교해 정확히 무엇이 바뀌었는지 확인 — 추가된 텍스트는 하이라이트, 삭제된 텍스트는 취소선 표시. 무료, 브라우저에서 처리됩니다.",
    },
  },
  "extract-to-excel": {
    en: {
      name: "DockDocs Extract to Excel",
      crumb: "Extract to Excel",
      description:
        "Upload invoices, quotes, or contracts and let AI pull the key fields into a spreadsheet you can download as CSV. It only reports what is actually in each document.",
    },
    zh: {
      name: "DockDocs PDF 数据抽取到表格",
      crumb: "数据抽取到表格",
      description:
        "上传发票、报价单或合同，用 AI 把关键字段抽成表格，导出 CSV(Excel 可打开)。只报告文档里真实存在的内容。",
    },
    es: {
      name: "DockDocs Extraer a Excel",
      crumb: "Extraer a Excel",
      description:
        "Sube facturas, presupuestos o contratos y deja que la IA extraiga los campos clave a una hoja de cálculo que puedes descargar en CSV. Solo informa de lo que realmente aparece en cada documento.",
    },
    pt: {
      name: "DockDocs Extrair para Excel",
      crumb: "Extrair para Excel",
      description:
        "Envie faturas, orçamentos ou contratos e deixe a IA extrair os campos principais para uma planilha que você pode baixar em CSV. Ela só relata o que realmente está em cada documento.",
    },
    fr: {
      name: "DockDocs Extraire vers Excel",
      crumb: "Extraire vers Excel",
      description:
        "Importez factures, devis ou contrats et laissez l'IA extraire les champs clés vers un tableur téléchargeable en CSV. Elle ne rapporte que ce qui figure réellement dans chaque document.",
    },
    ja: {
      name: "DockDocs Excel への抽出",
      crumb: "Excel への抽出",
      description:
        "請求書・見積書・契約書をアップロードすると、AI が主要な項目を表に抽出し、CSV としてダウンロードできます。各文書に実際に書かれている内容だけを報告します。",
    },
    de: {
      name: "DockDocs Daten in Excel extrahieren",
      crumb: "In Excel extrahieren",
      description:
        "Laden Sie Rechnungen, Angebote oder Verträge hoch und lassen Sie die KI die wichtigsten Felder in eine CSV-Tabelle extrahieren. Es werden nur Daten aus dem jeweiligen Dokument gemeldet.",
    },
    ko: {
      name: "DockDocs Excel로 데이터 추출",
      crumb: "Excel로 추출",
      description:
        "청구서, 견적서, 계약서를 업로드하면 AI가 핵심 항목을 스프레드시트에 추출해 CSV로 다운로드할 수 있습니다. 각 문서에 실제로 있는 내용만 보고합니다.",
    },
  },
  "ai-workspace": {
    en: {
      name: "DockDocs AI Document Workspace",
      crumb: "AI Workspace",
      description:
        "AI PDF workspace for OCR, summaries, Chat with PDF, and multi-step document workflows — all in your browser.",
    },
    zh: {
      name: "DockDocs AI 文档工作区",
      crumb: "AI 工作区",
      description:
        "在浏览器里对 PDF 做 OCR、摘要、与文档对话和多步处理的 AI 文档工作区。",
    },
    es: {
      name: "DockDocs Espacio de trabajo con IA",
      crumb: "Espacio con IA",
      description:
        "Espacio de trabajo de PDF con IA para OCR, resúmenes, chatear con el PDF y flujos de varios pasos, todo en tu navegador.",
    },
    pt: {
      name: "DockDocs Espaço de trabalho com IA",
      crumb: "Espaço com IA",
      description:
        "Espaço de trabalho de PDF com IA para OCR, resumos, conversar com o PDF e fluxos de várias etapas, tudo no seu navegador.",
    },
    fr: {
      name: "DockDocs Espace de travail IA",
      crumb: "Espace IA",
      description:
        "Espace de travail PDF avec IA pour l'OCR, les résumés, le chat avec le PDF et les flux en plusieurs étapes, le tout dans votre navigateur.",
    },
    ja: {
      name: "DockDocs AI ドキュメントワークスペース",
      crumb: "AI ワークスペース",
      description:
        "OCR、要約、PDF とのチャット、複数ステップのドキュメント処理を行う AI 文書ワークスペース。すべてブラウザ内で完結します。",
    },
    de: {
      name: "DockDocs KI-Dokumentarbeitsbereich",
      crumb: "KI-Arbeitsbereich",
      description:
        "KI-PDF-Arbeitsbereich für OCR, Zusammenfassungen, Chat mit PDF und mehrstufige Dokumenten-Workflows – alles in Ihrem Browser.",
    },
    ko: {
      name: "DockDocs AI 문서 작업 공간",
      crumb: "AI 작업 공간",
      description:
        "OCR, 요약, PDF 채팅, 다단계 문서 워크플로를 위한 AI PDF 작업 공간 — 모두 브라우저에서 처리됩니다.",
    },
  },
  compare: {
    en: {
      name: "DockDocs Compare PDF",
      crumb: "Compare PDF",
      description:
        "Compare two or more PDF documents with AI to spot differences in clauses, terms, and content. Free, browser-based document comparison — nothing uploaded to any server.",
    },
    zh: {
      name: "DockDocs 多文档对比",
      crumb: "多文档对比",
      description:
        "上传多份 PDF，在浏览器抽取文本，并排对比关键字段——可定位时给出原文出处。",
    },
    es: {
      name: "DockDocs Comparar PDF",
      crumb: "Comparar PDF",
      description:
        "Sube varios PDFs, extrae el texto en tu navegador y compara los términos clave lado a lado — con la fuente detrás de cada valor cuando puede localizarla.",
    },
    pt: {
      name: "DockDocs Comparar PDF",
      crumb: "Comparar PDF",
      description:
        "Carregue vários PDFs, extraia o texto no seu navegador e compare os termos-chave lado a lado — com a fonte por trás de cada valor quando consegue localizá-la.",
    },
    fr: {
      name: "DockDocs Comparer PDF",
      crumb: "Comparer PDF",
      description:
        "Chargez plusieurs PDFs, extrayez le texte dans votre navigateur et comparez les termes clés côte à côte — avec la source derrière chaque valeur lorsqu'elle peut être localisée.",
    },
    ja: {
      name: "DockDocs PDF比較",
      crumb: "PDF比較",
      description:
        "複数のPDFをアップロードしてブラウザ内でテキスト抽出し、主要な条件を並べて比較—出典を特定できた値には原文の出典も表示します。",
    },
    de: {
      name: "DockDocs PDF vergleichen",
      crumb: "PDF vergleichen",
      description:
        "Laden Sie mehrere PDFs hoch, extrahieren Sie Text im Browser und vergleichen Sie die wichtigsten Bedingungen nebeneinander — mit Quellenangaben, wenn die KI diese lokalisieren kann.",
    },
    ko: {
      name: "DockDocs PDF 비교",
      crumb: "PDF 비교",
      description:
        "여러 PDF를 업로드해 브라우저에서 텍스트를 추출하고 핵심 조항을 나란히 비교 — AI가 출처를 찾을 수 있을 때 원문 출처도 함께 표시됩니다.",
    },
  },
  "govbid-matrix": {
    en: {
      name: "DockDocs Bid Compliance Matrix",
      crumb: "Bid Compliance Matrix",
      description:
        "Upload an RFP or government solicitation and get every mandatory 'shall/must' requirement extracted into a numbered compliance matrix with section references. Export to CSV.",
    },
    zh: {
      name: "DockDocs 标书合规矩阵",
      crumb: "标书合规矩阵",
      description:
        "上传 RFP 或政府招标文件，AI 自动提取每条强制性要求生成编号合规矩阵，带条款编号引用，可导出 CSV。",
    },
    es: {
      name: "DockDocs Matriz de licitaciones",
      crumb: "Matriz de licitaciones",
      description:
        "Sube una licitación o solicitud y obtén cada requisito obligatorio 'shall/must' extraído en una matriz de cumplimiento numerada con referencias de sección. Exporta a CSV.",
    },
    pt: {
      name: "DockDocs Matriz de licitações",
      crumb: "Matriz de licitações",
      description:
        "Carregue uma licitação ou solicitação e obtenha cada requisito obrigatório 'shall/must' extraído em uma matriz de conformidade numerada com referências de seção. Exporte para CSV.",
    },
    fr: {
      name: "DockDocs Matrice d'appels d'offres",
      crumb: "Matrice d'appels d'offres",
      description:
        "Chargez un appel d'offres et obtenez chaque exigence obligatoire 'shall/must' extraite dans une matrice de conformité numérotée avec des références de section. Exportez en CSV.",
    },
    ja: {
      name: "DockDocs 入札マトリクス",
      crumb: "入札コンプライアンス・マトリクス",
      description:
        "RFPや入札書類をアップロードするとAIがすべての強制要件(shall/must)を条番号付きのコンプライアンス・マトリクスに抽出します。CSVでエクスポート可能。",
    },
    de: {
      name: "DockDocs Angebots-Compliance-Matrix",
      crumb: "Angebots-Compliance-Matrix",
      description:
        "Laden Sie eine Ausschreibung hoch und erhalten Sie alle Pflichtanforderungen (shall/must) in einer nummerierten Compliance-Matrix mit Abschnittsreferenzen. Export als CSV.",
    },
    ko: {
      name: "DockDocs 입찰 적합성 매트릭스",
      crumb: "입찰 적합성 매트릭스",
      description:
        "RFP나 입찰 요청서를 업로드하면 AI가 모든 필수 요건(shall/must)을 섹션 참조와 함께 번호 매긴 적합성 매트릭스로 추출합니다. CSV 내보내기 지원.",
    },
  },
  "lease-redflag": {
    en: {
      name: "DockDocs Lease Red Flag Check",
      crumb: "Lease Red Flag Check",
      description:
        "Upload a lease and get a plain-language list of risky, unfair, or missing clauses — flagged red/amber/green, quoted from your document, with what to ask your landlord before signing. Informational, not legal advice.",
    },
    zh: {
      name: "DockDocs 租约红旗扫描",
      crumb: "租约红旗扫描",
      description:
        "上传住宅或商业租约,标红不公平条款——租金飞涨、高额违约、入侵检查权等。逐条引用原文,附签字前该问什么。仅供参考,非法律意见。",
    },
    es: {
      name: "DockDocs Revisión de arrendamiento",
      crumb: "Revisión de arrendamiento",
      description:
        "Sube un contrato de arrendamiento y obtén una lista de cláusulas injustas o arriesgadas para el inquilino — marcadas en rojo/ámbar/verde y citadas de tu documento. Orientativo, no asesoramiento legal.",
    },
    pt: {
      name: "DockDocs Revisão de locação",
      crumb: "Revisão de locação",
      description:
        "Carregue um contrato de locação e obtenha uma lista de cláusulas injustas ou arriscadas para o locatário — marcadas em vermelho/âmbar/verde e citadas do seu documento. Informativo, não aconselhamento jurídico.",
    },
    fr: {
      name: "DockDocs Audit de bail",
      crumb: "Audit de bail",
      description:
        "Chargez un bail et obtenez une liste des clauses injustes ou risquées pour le locataire — signalées en rouge/orange/vert et citées de votre document. Informatif, pas un conseil juridique.",
    },
    ja: {
      name: "DockDocs 賃貸契約レッドフラグ確認",
      crumb: "賃貸契約レッドフラグ確認",
      description:
        "賃貸契約書をアップロードすると、借主にとってリスクのある・不公平な条項の一覧を生成—赤・橙・緑でフラグを立て、ドキュメントから引用。参考情報であり、法的助言ではありません。",
    },
    de: {
      name: "DockDocs Mietvertrag-Risikocheck",
      crumb: "Mietvertrag-Risikocheck",
      description:
        "Laden Sie einen Mietvertrag hoch und erhalten Sie eine Klartextliste riskanter, unfairer oder fehlender Klauseln – rot/gelb/grün markiert und aus Ihrem Dokument zitiert. Informativ, kein Rechtsrat.",
    },
    ko: {
      name: "DockDocs 임대차 계약서 위험 조항 검토",
      crumb: "임대차 위험 조항 검토",
      description:
        "임대차 계약서를 업로드하면 불공정하거나 위험한 조항 목록을 쉬운 말로 정리해 드립니다 — 빨간색/황색/녹색으로 표시하고 원문에서 인용합니다. 참고용이며 법적 조언이 아닙니다.",
    },
  },
  flashcards: {
    en: {
      name: "DockDocs PDF Flashcards",
      crumb: "PDF Flashcards",
      description:
        "Turn a textbook chapter, lecture notes, or manual into study flashcards with AI — questions and answers are drawn only from your document. Flip a card to check yourself.",
    },
    zh: {
      name: "DockDocs PDF 抽认卡",
      crumb: "PDF 抽认卡",
      description:
        "上传课本章节、讲义或手册，用 AI 生成问答抽认卡（只来自你的文档），点卡片翻面自测。",
    },
    es: {
      name: "DockDocs Tarjetas de estudio PDF",
      crumb: "Tarjetas de estudio PDF",
      description:
        "Convierte un capítulo de libro, apuntes o manual en tarjetas de estudio con IA — preguntas y respuestas extraídas únicamente de tu documento.",
    },
    pt: {
      name: "DockDocs Cartões de estudo PDF",
      crumb: "Cartões de estudo PDF",
      description:
        "Transforme um capítulo de livro, notas de aula ou manual em cartões de estudo com IA — perguntas e respostas retiradas somente do seu documento.",
    },
    fr: {
      name: "DockDocs Cartes mémoire PDF",
      crumb: "Cartes mémoire PDF",
      description:
        "Transformez un chapitre de manuel, des notes de cours ou un guide en cartes mémoire avec l'IA — questions et réponses tirées uniquement de votre document.",
    },
    ja: {
      name: "DockDocs PDFフラッシュカード",
      crumb: "PDFフラッシュカード",
      description:
        "教科書・講義ノート・マニュアルをAIでフラッシュカードに変換—問答はすべてあなたのPDFから抽出されます。",
    },
    de: {
      name: "DockDocs PDF-Lernkarten",
      crumb: "PDF-Lernkarten",
      description:
        "Verwandeln Sie ein Buchkapitel, Vorlesungsnotizen oder ein Handbuch mit KI in Lernkarten – Fragen und Antworten stammen ausschließlich aus Ihrem Dokument.",
    },
    ko: {
      name: "DockDocs PDF 플래시카드",
      crumb: "PDF 플래시카드",
      description:
        "교재 챕터, 강의 노트, 매뉴얼을 AI로 플래시카드 문답으로 변환 — 문제와 답은 모두 내 문서에서만 추출됩니다.",
    },
  },
  "batch-sort": {
    en: {
      name: "DockDocs Batch Sort PDFs",
      crumb: "Batch Sort PDFs",
      description:
        "Drop a messy pile of PDFs — AI labels each (invoice, contract, resume…) and sorts them into folders inside one ZIP. The text is read in your browser; only that text is sent to the AI to sort — your file itself isn't uploaded.",
    },
    zh: {
      name: "DockDocs 批量分类归档",
      crumb: "批量分类归档",
      description:
        "拖入一堆杂乱 PDF,AI 给每份分类并分到一个 ZIP 里的不同文件夹，全部在浏览器中完成，文件不外泄。",
    },
    es: {
      name: "DockDocs Clasificar PDFs en lote",
      crumb: "Clasificar PDFs en lote",
      description:
        "Arrastra un montón de PDFs desordenados — la IA etiqueta cada uno y los organiza en carpetas dentro de un ZIP. Todo en tu navegador; tus archivos nunca salen de tu dispositivo.",
    },
    pt: {
      name: "DockDocs Classificar PDFs em lote",
      crumb: "Classificar PDFs em lote",
      description:
        "Arraste uma pilha de PDFs desorganizados — a IA etiqueta cada um e os organiza em pastas dentro de um ZIP. Tudo no seu navegador; seus arquivos nunca saem do dispositivo.",
    },
    fr: {
      name: "DockDocs Trier des PDF en lot",
      crumb: "Trier des PDF en lot",
      description:
        "Déposez une pile de PDFs en vrac — l'IA étiquette chacun et les trie dans des dossiers à l'intérieur d'un ZIP. Entièrement dans votre navigateur.",
    },
    ja: {
      name: "DockDocs PDF一括並べ替え",
      crumb: "PDF一括並べ替え",
      description:
        "雑多なPDFをドロップ—AIが各ファイルをラベル付けしてZIP内のフォルダに整理。すべてブラウザ内で完結。",
    },
    de: {
      name: "DockDocs PDFs stapelweise sortieren",
      crumb: "PDFs stapelweise sortieren",
      description:
        "Legen Sie einen ungeordneten Stapel PDFs ab – die KI beschriftet jedes (Rechnung, Vertrag, Lebenslauf …) und sortiert sie in Ordner innerhalb einer ZIP-Datei. Alles im Browser.",
    },
    ko: {
      name: "DockDocs PDF 일괄 분류",
      crumb: "PDF 일괄 분류",
      description:
        "정리되지 않은 PDF 더미를 끌어다 놓으면 AI가 각 파일을 분류해(청구서, 계약서, 이력서…) ZIP 파일 내 폴더에 정리해 줍니다. 모두 브라우저에서 처리됩니다.",
    },
  },
  "batch-compress": {
    en: {
      name: "DockDocs Batch Compress PDFs",
      crumb: "Batch Compress PDFs",
      description:
        "Drop a whole folder of PDFs and compress them all in one go — each is shrunk in your browser and packaged into a single ZIP. Nothing is uploaded.",
    },
    zh: {
      name: "DockDocs 批量压缩 PDF",
      crumb: "批量压缩 PDF",
      description:
        "拖入整个 PDF 文件夹一次性全部压缩，每个在浏览器中压缩并打包成 ZIP，不上传。",
    },
    es: {
      name: "DockDocs Comprimir PDF en lote",
      crumb: "Comprimir PDF en lote",
      description:
        "Arrastra una carpeta entera de PDFs y comprímelos todos de una vez — cada uno reducido en tu navegador y empaquetado en un ZIP.",
    },
    pt: {
      name: "DockDocs Comprimir PDFs em lote",
      crumb: "Comprimir PDFs em lote",
      description:
        "Arraste uma pasta inteira de PDFs e comprima todos de uma vez — cada um reduzido no seu navegador e empacotado em um único ZIP.",
    },
    fr: {
      name: "DockDocs Compresser des PDF en lot",
      crumb: "Compresser des PDF en lot",
      description:
        "Déposez un dossier entier de PDFs et compressez-les tous en une seule fois — chacun réduit dans votre navigateur et empaqueté dans un ZIP.",
    },
    ja: {
      name: "DockDocs PDF一括圧縮",
      crumb: "PDF一括圧縮",
      description:
        "PDFのフォルダをまるごとドロップして一括圧縮—各ファイルをブラウザで縮小し、1つのZIPにまとめます。",
    },
    de: {
      name: "DockDocs PDFs stapelweise komprimieren",
      crumb: "PDFs stapelweise komprimieren",
      description:
        "Legen Sie einen ganzen Ordner mit PDFs ab und komprimieren Sie alle auf einmal – jede wird im Browser verkleinert und in einer ZIP-Datei verpackt. Keine Uploads.",
    },
    ko: {
      name: "DockDocs PDF 일괄 압축",
      crumb: "PDF 일괄 압축",
      description:
        "PDF 폴더 전체를 한꺼번에 드롭해 일괄 압축 — 각 파일을 브라우저에서 압축해 하나의 ZIP으로 패키징합니다. 파일이 업로드되지 않습니다.",
    },
  },
  "batch-translate": {
    en: {
      name: "DockDocs Batch Translate PDFs",
      crumb: "Batch Translate PDFs",
      description:
        "Translate a whole folder of PDFs into one language in a single run — each document's text is translated and packaged into a ZIP of .txt files.",
    },
    zh: {
      name: "DockDocs 批量翻译 PDF",
      crumb: "批量翻译 PDF",
      description:
        "把整个文件夹的 PDF 一次性翻译成一种语言，每份的文字翻译后打包成 .txt 的 ZIP。",
    },
    es: {
      name: "DockDocs Traducir PDFs en lote",
      crumb: "Traducir PDFs en lote",
      description:
        "Traduce una carpeta entera de PDFs a un idioma de una vez — el texto de cada documento traducido y empaquetado en un ZIP de archivos .txt.",
    },
    pt: {
      name: "DockDocs Traduzir PDFs em lote",
      crumb: "Traduzir PDFs em lote",
      description:
        "Traduza uma pasta inteira de PDFs para um idioma de uma vez — o texto de cada documento traduzido e empacotado em um ZIP de arquivos .txt.",
    },
    fr: {
      name: "DockDocs Traduire des PDF en lot",
      crumb: "Traduire des PDF en lot",
      description:
        "Traduisez un dossier entier de PDFs dans une langue en une seule fois — le texte de chaque document traduit et empaqueté dans un ZIP de fichiers .txt.",
    },
    ja: {
      name: "DockDocs PDF一括翻訳",
      crumb: "PDF一括翻訳",
      description:
        "フォルダ全体のPDFを一度に1つの言語に翻訳—各ドキュメントのテキストを翻訳して.txtのZIPにまとめます。",
    },
    de: {
      name: "DockDocs PDFs stapelweise übersetzen",
      crumb: "PDFs stapelweise übersetzen",
      description:
        "Übersetzen Sie einen ganzen Ordner mit PDFs in einem Durchgang in eine Sprache – der Text jedes Dokuments wird übersetzt und als ZIP mit .txt-Dateien verpackt.",
    },
    ko: {
      name: "DockDocs PDF 일괄 번역",
      crumb: "PDF 일괄 번역",
      description:
        "PDF 폴더 전체를 한 번에 한 언어로 번역 — 각 문서의 텍스트를 번역해 .txt 파일의 ZIP으로 패키징합니다.",
    },
  },
  "batch-fix-scans": {
    en: {
      name: "DockDocs Batch Fix Scans",
      crumb: "Batch Fix Scans",
      description:
        "Clean up a whole folder of scanned PDFs at once — trim the same margins off every page or delete the same pages from each file. All in your browser, one ZIP.",
    },
    zh: {
      name: "DockDocs 批量修扫描",
      crumb: "批量修扫描",
      description:
        "一次清理整个文件夹的扫描件：给每页裁掉相同页边，或从每个文件删相同页，全部在浏览器中完成、打包 ZIP。",
    },
    es: {
      name: "DockDocs Reparar escaneos en lote",
      crumb: "Reparar escaneos en lote",
      description:
        "Limpia una carpeta entera de PDFs escaneados de una vez — recorta los mismos márgenes de cada página o elimina las mismas páginas de cada archivo. Todo en tu navegador, un ZIP.",
    },
    pt: {
      name: "DockDocs Reparar digitalizações em lote",
      crumb: "Reparar digitalizações em lote",
      description:
        "Limpe uma pasta inteira de PDFs digitalizados de uma vez — recorte as mesmas margens de cada página ou exclua as mesmas páginas de cada arquivo. Tudo no seu navegador, um ZIP.",
    },
    fr: {
      name: "DockDocs Réparer des scans en lot",
      crumb: "Réparer des scans en lot",
      description:
        "Nettoyez un dossier entier de PDFs numérisés en une fois — rognez les mêmes marges de chaque page ou supprimez les mêmes pages de chaque fichier. Tout dans votre navigateur, un ZIP.",
    },
    ja: {
      name: "DockDocs スキャン一括修正",
      crumb: "スキャン一括修正",
      description:
        "スキャンしたPDFのフォルダをまとめてクリーンアップ—各ページの同じ余白を切り取り、または各ファイルの同じページを削除。すべてブラウザ内で完結。",
    },
    de: {
      name: "DockDocs Scans stapelweise bereinigen",
      crumb: "Scans stapelweise bereinigen",
      description:
        "Bereinigen Sie einen ganzen Ordner mit gescannten PDFs auf einmal – schneiden Sie dieselben Ränder von jeder Seite ab oder löschen Sie dieselben Seiten aus jeder Datei. Alles im Browser, eine ZIP.",
    },
    ko: {
      name: "DockDocs 스캔 일괄 수정",
      crumb: "스캔 일괄 수정",
      description:
        "스캔된 PDF 폴더 전체를 한꺼번에 정리 — 모든 페이지에서 동일한 여백을 자르거나 각 파일에서 동일한 페이지를 삭제합니다. 모두 브라우저에서, 하나의 ZIP으로.",
    },
  },
  "batch-extract-sheet": {
    en: {
      name: "DockDocs Batch Extract to Spreadsheet",
      crumb: "Batch Extract to Spreadsheet",
      description:
        "Drop a whole folder of invoices, quotes, or contracts — AI pulls the key fields from every file into one table (one row each) and exports CSV. It only reports what's actually there.",
    },
    zh: {
      name: "DockDocs 批量抽取数据",
      crumb: "批量抽取数据",
      description:
        "拖入整个文件夹的发票/报价/合同，AI 把每份的关键字段抽进同一张表(一份一行)，导出 CSV。AI 只报告真实存在的内容。",
    },
    es: {
      name: "DockDocs Extraer datos en lote",
      crumb: "Extraer datos en lote",
      description:
        "Arrastra una carpeta de facturas, cotizaciones o contratos — la IA extrae los campos clave de cada archivo en una tabla (una fila por documento) y exporta CSV. Solo informa lo que realmente está en cada uno.",
    },
    pt: {
      name: "DockDocs Extrair dados em lote",
      crumb: "Extrair dados em lote",
      description:
        "Arraste uma pasta de faturas, orçamentos ou contratos — a IA extrai os campos-chave de cada arquivo em uma tabela (uma linha por documento) e exporta CSV. Informa apenas o que realmente está em cada um.",
    },
    fr: {
      name: "DockDocs Extraire des données en lot",
      crumb: "Extraire des données en lot",
      description:
        "Déposez un dossier de factures, devis ou contrats — l'IA extrait les champs clés de chaque fichier dans un tableau (une ligne par document) et exporte en CSV. Elle ne rapporte que ce qui est réellement présent.",
    },
    ja: {
      name: "DockDocs 一括データ抽出",
      crumb: "一括データ抽出",
      description:
        "請求書・見積書・契約書のフォルダをドロップ—AIが各ファイルのキーフィールドを1つの表に抽出（1ドキュメント1行）してCSVにエクスポート。",
    },
    de: {
      name: "DockDocs Daten stapelweise in Tabelle extrahieren",
      crumb: "Stapelweise in Tabelle extrahieren",
      description:
        "Legen Sie einen ganzen Ordner mit Rechnungen, Angeboten oder Verträgen ab – die KI extrahiert die Schlüsselfelder aller Dateien in eine Tabelle (eine Zeile pro Datei) und exportiert als CSV.",
    },
    ko: {
      name: "DockDocs 일괄 스프레드시트 추출",
      crumb: "일괄 데이터 추출",
      description:
        "청구서, 견적서, 계약서 폴더를 드롭하면 AI가 모든 파일의 핵심 항목을 하나의 표로 추출(파일당 한 행)해 CSV로 내보냅니다.",
    },
  },
  "contract-risk": {
    en: {
      name: "DockDocs Contract Risk Check",
      crumb: "Contract Risk Check",
      description:
        "Upload a contract and get a plain-language list of risky, one-sided, or missing clauses — flagged red/amber/green, quoted from your document. Informational, not legal advice.",
    },
    zh: {
      name: "DockDocs 合同风险体检",
      crumb: "合同风险体检",
      description:
        "上传合同,得到白话的风险清单:风险/单边/缺失条款,红黄绿标注、引用原文、附该问什么。仅供参考,非法律意见。",
    },
    es: {
      name: "DockDocs Revisión de riesgos en contratos",
      crumb: "Revisión de contratos",
      description:
        "Sube un contrato y obtén una lista en lenguaje claro de cláusulas arriesgadas, unilaterales o ausentes — marcadas en rojo/ámbar/verde y citadas de tu documento. Orientativo, no asesoramiento legal.",
    },
    pt: {
      name: "DockDocs Revisão de riscos em contratos",
      crumb: "Revisão de contratos",
      description:
        "Carregue um contrato e obtenha uma lista em linguagem simples de cláusulas arriscadas, unilaterais ou ausentes — marcadas em vermelho/âmbar/verde e citadas do seu documento. Informativo, não aconselhamento jurídico.",
    },
    fr: {
      name: "DockDocs Audit de risques contractuels",
      crumb: "Audit de contrats",
      description:
        "Chargez un contrat et obtenez une liste en langage clair des clauses risquées, unilatérales ou manquantes — signalées en rouge/orange/vert et citées de votre document. Informatif, pas un conseil juridique.",
    },
    ja: {
      name: "DockDocs 契約書リスクチェック",
      crumb: "契約書リスクチェック",
      description:
        "契約書をアップロードすると、わかりやすい言葉でリスク・一方的・欠落条項の一覧を生成—赤・橙・緑でフラグを立て、ドキュメントから引用。参考情報であり、法的助言ではありません。",
    },
    de: {
      name: "DockDocs Vertragsrisiko-Check",
      crumb: "Vertragsrisiko-Check",
      description:
        "Laden Sie einen Vertrag hoch und erhalten Sie eine verständliche Liste riskanter, einseitiger oder fehlender Klauseln — rot/gelb/grün markiert und aus Ihrem Dokument zitiert. Zur Information, keine Rechtsberatung.",
    },
    ko: {
      name: "DockDocs 계약서 위험 체크",
      crumb: "계약서 위험 체크",
      description:
        "계약서를 업로드하면 위험하거나 일방적이거나 누락된 조항의 목록을 쉬운 언어로 얻습니다 — 빨강/주황/초록으로 표시되고 문서에서 인용됩니다. 정보 제공용이며 법적 조언이 아닙니다.",
    },
  },
};

function pathFor(slug: string, locale: Loc): string {
  return locale === "en" ? `/${slug}/` : `/${locale}/${slug}/`;
}

// Slugs whose custom client renders a real visible <ToolFaq> Q&A — so we can emit
// FAQPage JSON-LD that reuses that exact visible copy (no fabricated FAQ). Other
// extra-tool slugs (e.g. /for/* hubs, batch tools without a verified FAQ) are
// intentionally excluded.
const FAQ_PAGE_SLUGS = new Set(["compare", "extract-to-excel", "redline", "redact-pdf"]);

// faqLocale is the real route locale (e.g. "de"/"ko") used ONLY for FAQ item
// lookup — the FAQ copy in FAQS_DE/FAQS_KO is already authored even though the
// leaf-surface UI still falls back to English via toLeafLocale. `locale` continues
// to drive the WebApplication label and URL path.
export function extraToolSchema(slug: string, locale: Loc, faqLocale?: string) {
  const entry = EXTRA_TOOL_LABELS[slug];
  if (!entry) return null;
  // zh-Hant derives from zh via OpenCC.
  const lab = locale === "zh-Hant"
    ? (entry.zh ? deepHant(entry.zh) : entry.en)
    : (entry[locale] ?? entry.en);
  if (!lab) return null;
  const url = `${siteUrl}${pathFor(slug, locale)}`;
  const graph: object[] = [
    {
      "@type": "WebApplication",
      "@id": `${url}#app`,
      name: lab.name,
      url,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description: lab.description,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      brand: { "@type": "Brand", name: "DockDocs" },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "DockDocs", item: siteUrl },
        { "@type": "ListItem", position: 2, name: lab.crumb, item: url },
      ],
    },
  ];

  // FAQPage — reuse the SAME Q&A the page renders (getToolFaqItems), so the
  // structured data never drifts from the visible FAQ. Only for slugs with a
  // real visible FAQ in this locale.
  if (FAQ_PAGE_SLUGS.has(slug)) {
    // Use faqLocale (real route locale) when available so de/ko get their authored
    // FAQS_DE/FAQS_KO content; fall back to locale for the remaining leaf locales.
    const faqItems = getToolFaqItems(slug, (faqLocale ?? locale) as Parameters<typeof getToolFaqItems>[1]);
    if (faqItems && faqItems.length > 0) {
      graph.push({
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: faqItems.map((it) => ({
          "@type": "Question",
          name: it.q,
          acceptedAnswer: { "@type": "Answer", text: it.a },
        })),
      });
    }
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

export function ExtraToolJsonLd({ slug, locale, faqLocale }: { slug: string; locale: Loc; faqLocale?: string }) {
  const schema = extraToolSchema(slug, locale, faqLocale);
  if (!schema) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Slugs covered above — used by the catch-all to decide whether to emit schema.
export const EXTRA_TOOL_SLUGS = Object.keys(EXTRA_TOOL_LABELS);
