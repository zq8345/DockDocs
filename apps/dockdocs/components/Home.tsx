"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { CSSProperties, ReactNode } from "react";
import { navCategories } from "@/components/Header";
import { deepHant, toHant } from "@/lib/zh-hant";
import { Figure, SHELL, H2, SUB, CAP, PANEL, eyebrowCls } from "@/components/design";

type Locale = "en" | "zh" | "es" | "pt" | "fr" | "ja" | "de" | "ko" | "zh-Hant";
type Item = { name: string; slug: string };

const COPY = {
  en: {
    eyebrow: "// Private · verifiable document AI",
    heroA: "Read any document.",
    heroB: "Verify every answer.",
    heroSub: "~50 PDF tools, most running in your browser, plus AI that reads, compares and extracts your documents — and shows the source passage behind what it finds.",
    primary: "Use it free",
    secondary: "See how privacy works",
    proof: [{ t: "Most tools run in your browser" }, { g: "0", t: " uploads in the browser" }, { t: "AI shows its source — or says it can't" }, { t: "No sign-up" }],
    findEyebrow: "// Find your tool",
    findHeading: "Pick a tool. Start in one click.",
    capSub: "About 50 PDF tools in one place — convert, organize, sign, redact, OCR — most running locally in your browser.",
    searchPlaceholder: "Search ~50 tools — compress, merge, sign…",
    searchNoResults: "No tool matches that — try another word, or browse all.",
    fig2Caption: "Fig 0.2 — ~50 tools, four ways in.",
    aiEyebrow: "// Grounded AI",
    aiHeading: "AI that shows its work.",
    aiSub: "Ask any document; when it answers or flags a finding, it shows the exact passage behind it — and tells you when something can't be traced, instead of inventing a source. Compare, extract, summarize.",
    aiCta: "Chat with a PDF",
    aiChips: ["Compare", "Extract to Excel", "Summarize", "Translate 18 languages"],
    fig3Caption: "Fig 0.3 — one grounded answer, traced to the exact passage.",
    jobsEyebrow: "// What it does for you",
    jobsHeading: "Minutes, not hours.",
    fig4Caption: "Fig 0.4 — four everyday jobs, minutes instead of hours.",
    browseAll: "Browse all tools",
    more: (n: number) => `and ${n} more`,
    tools: "tools",
    ctaEyebrow: "// Try it",
    ctaHeadA: "Read any document.",
    ctaHeadB: "Verify every answer.",
    ctaSub: "~50 tools, AI that cites its source when it can, and browser tools that upload nothing. Free to start — no sign-up.",
    viewPricing: "View pricing",
    qaQuestion: "How much did Q3 revenue grow?",
    qaGrounded: "Grounded answer",
    qaAnswer: "Q3 revenue grew 23% year-over-year, driven mainly by APAC.",
    qaSourcesLabel: "Sources",
    qaSnippets: ["revenue +23% YoY", "APAC the main driver"],
    aiSummary: "AI summary",
    cite: "source",
    figCaption: "Fig 0.1 — when the AI answers, it shows the passage behind it — and flags what it can't trace. One click to verify.",
  },
  zh: {
    eyebrow: "// 私密 · 可溯源的文档 AI",
    heroA: "读懂任意文档，",
    heroB: "逐一核验答案。",
    heroSub: "约 50 个 PDF 工具，多数在浏览器内运行，AI 读懂、对比、抽取你的文档——并展示它所发现内容背后的原文出处。",
    primary: "免费使用",
    secondary: "看隐私怎么做到",
    proof: [{ t: "多数工具在浏览器内处理" }, { g: "0", t: " 浏览器内上传" }, { t: "答案标注出处，无法溯源会说明" }, { t: "无需注册" }],
    findEyebrow: "// 找到你的工具",
    findHeading: "选个工具，一键开始。",
    capSub: "约 50 个 PDF 工具集中一处——转换、整理、签名、脱敏、OCR——大多在浏览器本地完成。",
    searchPlaceholder: "搜索约 50 个工具——压缩、合并、签名……",
    searchNoResults: "没有匹配的工具——换个词，或浏览全部。",
    fig2Caption: "图 0.2 — 约 50 个工具，四种入口。",
    aiEyebrow: "// AI · 可溯源",
    aiHeading: "会给你看依据的 AI。",
    aiSub: "向任意文档提问；AI 回答问题或标出某项发现时，会展示支撑它的原文原句——若有内容无法溯源，它会如实说明，而不是编造一个出处。对比、抽取、摘要。",
    aiCta: "与 PDF 对话",
    aiChips: ["多文档对比", "抽取到表格", "摘要", "翻译 18 种语言"],
    fig3Caption: "图 0.3 — 一个有据回答，追溯到确切的原文。",
    jobsEyebrow: "// 能替你做什么",
    jobsHeading: "几分钟，搞定原本要几小时的事。",
    fig4Caption: "图 0.4 — 四件日常事，几分钟而非几小时。",
    browseAll: "浏览全部工具",
    more: (n: number) => `还有 ${n} 个`,
    tools: "个工具",
    ctaEyebrow: "// 试试看",
    ctaHeadA: "读懂任意文档，",
    ctaHeadB: "逐一核验答案。",
    ctaSub: "约 50 个工具，会尽量给你看依据的 AI，浏览器工具零上传。免费开始，无需注册。",
    viewPricing: "查看定价",
    qaQuestion: "第 3 季度营收增长了多少？",
    qaGrounded: "有据回答",
    qaAnswer: "第 3 季度营收同比增长 23%，主要由亚太区驱动。",
    qaSourcesLabel: "依据",
    qaSnippets: ["营收同比 +23%", "亚太区为主要驱动"],
    aiSummary: "AI 摘要",
    cite: "原文",
    figCaption: "图 0.1 — AI 回答时，会展示支撑它的原文——无法溯源的会如实标出。一键即可核对。",
  },
  es: {
    eyebrow: "// IA documental privada y verificable",
    heroA: "Lee cualquier documento.",
    heroB: "Verifica cada respuesta.",
    heroSub: "~50 herramientas PDF, la mayoría se ejecuta en tu navegador, más una IA que lee, compara y extrae tus documentos — y muestra el pasaje de origen detrás de lo que encuentra.",
    primary: "Úsalo gratis",
    secondary: "Mira cómo funciona la privacidad",
    proof: [{ t: "La mayoría se procesa en tu navegador" }, { g: "0", t: " subidas en el navegador" }, { t: "La IA cita su fuente, o avisa si no puede" }, { t: "Sin registro" }],
    findEyebrow: "// Encuentra tu herramienta",
    findHeading: "Elige una herramienta. Empieza en un clic.",
    capSub: "Cerca de 50 herramientas PDF en un solo lugar — convertir, organizar, firmar, redactar, OCR — la mayoría se ejecutan localmente en tu navegador.",
    searchPlaceholder: "Busca ~50 herramientas — comprimir, combinar, firmar…",
    searchNoResults: "Ninguna herramienta coincide — prueba otra palabra o explora todas.",
    fig2Caption: "Fig 0.2 — ~50 herramientas, cuatro vías de entrada.",
    aiEyebrow: "// IA fundamentada",
    aiHeading: "Una IA que muestra su trabajo.",
    aiSub: "Pregunta a cualquier documento; cuando responde o señala un hallazgo, te muestra el pasaje exacto que lo respalda — y te avisa cuando algo no se puede rastrear, en lugar de inventarse una fuente. Compara, extrae, resume.",
    aiCta: "Chatea con un PDF",
    aiChips: ["Comparar", "Extraer a Excel", "Resumir", "Traducir 18 idiomas"],
    fig3Caption: "Fig 0.3 — una respuesta fundamentada, rastreada al pasaje exacto.",
    jobsEyebrow: "// Lo que hace por ti",
    jobsHeading: "Minutos, no horas.",
    fig4Caption: "Fig 0.4 — cuatro tareas cotidianas, minutos en vez de horas.",
    browseAll: "Ver todas las herramientas",
    more: (n: number) => `y ${n} más`,
    tools: "herramientas",
    ctaEyebrow: "// Pruébalo",
    ctaHeadA: "Lee cualquier documento.",
    ctaHeadB: "Verifica cada respuesta.",
    ctaSub: "~50 herramientas, IA que cita su fuente cuando puede, y herramientas del navegador que no suben nada. Gratis para empezar — sin registro.",
    viewPricing: "Ver precios",
    qaQuestion: "¿Cuánto crecieron los ingresos del 3.er trimestre?",
    qaGrounded: "Respuesta fundamentada",
    qaAnswer: "Los ingresos del 3.er trimestre crecieron un 23% interanual, impulsados principalmente por APAC.",
    qaSourcesLabel: "Fuentes",
    qaSnippets: ["ingresos +23% interanual", "APAC, motor principal"],
    aiSummary: "Resumen de IA",
    cite: "fuente",
    figCaption: "Fig 0.1 — cuando la IA responde, muestra el pasaje que lo respalda — y señala lo que no puede rastrear. Verifícalo con un clic.",
  },
  pt: {
    eyebrow: "// IA de documentos privada e verificável",
    heroA: "Leia qualquer documento.",
    heroB: "Verifique cada resposta.",
    heroSub: "~50 ferramentas PDF, a maioria roda no seu navegador, mais uma IA que lê, compara e extrai seus documentos — e mostra o trecho de origem por trás do que encontra.",
    primary: "Use gratuitamente",
    secondary: "Veja como a privacidade funciona",
    proof: [{ t: "A maioria é processada no navegador" }, { g: "0", t: " envios no navegador" }, { t: "A IA cita a fonte, ou avisa quando não dá" }, { t: "Sem cadastro" }],
    findEyebrow: "// Encontre sua ferramenta",
    findHeading: "Escolha uma ferramenta. Comece em um clique.",
    capSub: "Cerca de 50 ferramentas PDF em um só lugar — converter, organizar, assinar, redigir, OCR — a maioria roda localmente no seu navegador.",
    searchPlaceholder: "Buscar ~50 ferramentas — comprimir, juntar, assinar…",
    searchNoResults: "Nenhuma ferramenta corresponde — tente outra palavra ou veja todas.",
    fig2Caption: "Fig 0.2 — ~50 ferramentas, quatro formas de entrar.",
    aiEyebrow: "// IA embasada",
    aiHeading: "Uma IA que mostra seu trabalho.",
    aiSub: "Pergunte a qualquer documento; quando responde ou aponta uma constatação, ela mostra o trecho exato que a fundamenta — e avisa quando algo não pode ser rastreado, em vez de inventar uma fonte. Compare, extraia, resuma.",
    aiCta: "Converse com um PDF",
    aiChips: ["Comparar", "Extrair para Excel", "Resumir", "Traduzir 18 idiomas"],
    fig3Caption: "Fig 0.3 — uma resposta embasada, rastreada ao trecho exato.",
    jobsEyebrow: "// O que faz por você",
    jobsHeading: "Minutos, não horas.",
    fig4Caption: "Fig 0.4 — quatro tarefas do dia a dia, minutos em vez de horas.",
    browseAll: "Ver todas as ferramentas",
    more: (n: number) => `e mais ${n}`,
    tools: "ferramentas",
    ctaEyebrow: "// Experimente",
    ctaHeadA: "Leia qualquer documento.",
    ctaHeadB: "Verifique cada resposta.",
    ctaSub: "~50 ferramentas, IA que cita a fonte quando dá, e ferramentas do navegador que não enviam nada. Grátis para começar — sem cadastro.",
    viewPricing: "Ver preços",
    qaQuestion: "Quanto cresceu a receita do 3.º trimestre?",
    qaGrounded: "Resposta embasada",
    qaAnswer: "A receita do 3.º trimestre cresceu 23% ano a ano, impulsionada principalmente pela APAC.",
    qaSourcesLabel: "Fontes",
    qaSnippets: ["receita +23% A/A", "APAC, motor principal"],
    aiSummary: "Resumo de IA",
    cite: "fonte",
    figCaption: "Fig 0.1 — quando a IA responde, mostra o trecho por trás — e sinaliza o que não pode rastrear. Verifique com um clique.",
  },
  fr: {
    eyebrow: "// IA documentaire privée et vérifiable",
    heroA: "Lisez n'importe quel document.",
    heroB: "Vérifiez chaque réponse.",
    heroSub: "~50 outils PDF, dont la plupart s'exécutent dans votre navigateur, plus une IA qui lit, compare et extrait vos documents — et montre le passage source derrière ce qu'elle trouve.",
    primary: "Utiliser gratuitement",
    secondary: "Voir comment fonctionne la confidentialité",
    proof: [{ t: "La plupart traité dans votre navigateur" }, { g: "0", t: " envoi dans le navigateur" }, { t: "L'IA cite sa source, ou le signale sinon" }, { t: "Sans inscription" }],
    findEyebrow: "// Trouvez votre outil",
    findHeading: "Choisissez un outil. Commencez en un clic.",
    capSub: "Environ 50 outils PDF en un seul endroit — convertir, organiser, signer, caviarder, OCR — la plupart s'exécutent localement dans votre navigateur.",
    searchPlaceholder: "Rechercher ~50 outils — compresser, fusionner, signer…",
    searchNoResults: "Aucun outil ne correspond — essayez un autre mot, ou voyez tous.",
    fig2Caption: "Fig 0.2 — ~50 outils, quatre portes d'entrée.",
    aiEyebrow: "// IA fondée sur des preuves",
    aiHeading: "Une IA qui montre son travail.",
    aiSub: "Interrogez n'importe quel document ; quand l'IA répond ou relève un élément, elle montre le passage exact qui l'appuie — et vous indique quand quelque chose ne peut pas être tracé, au lieu d'inventer une source. Comparez, extrayez, résumez.",
    aiCta: "Discuter avec un PDF",
    aiChips: ["Comparer", "Extraire vers Excel", "Résumer", "Traduire en 18 langues"],
    fig3Caption: "Fig 0.3 — une réponse fondée, retracée jusqu'au passage exact.",
    jobsEyebrow: "// Ce qu'il fait pour vous",
    jobsHeading: "Des minutes, pas des heures.",
    fig4Caption: "Fig 0.4 — quatre tâches du quotidien, des minutes au lieu d'heures.",
    browseAll: "Voir tous les outils",
    more: (n: number) => `et ${n} de plus`,
    tools: "outils",
    ctaEyebrow: "// Essayez",
    ctaHeadA: "Lisez n'importe quel document.",
    ctaHeadB: "Vérifiez chaque réponse.",
    ctaSub: "~50 outils, IA qui cite sa source quand elle le peut, et des outils navigateur qui n'envoient rien. Gratuit pour commencer — sans inscription.",
    viewPricing: "Voir les tarifs",
    qaQuestion: "De combien les revenus du T3 ont-ils augmenté ?",
    qaGrounded: "Réponse fondée",
    qaAnswer: "Les revenus du T3 ont augmenté de 23% sur un an, principalement portés par l'APAC.",
    qaSourcesLabel: "Sources",
    qaSnippets: ["revenus +23% sur un an", "APAC, principal moteur"],
    aiSummary: "Résumé IA",
    cite: "source",
    figCaption: "Fig 0.1 — quand l'IA répond, elle montre le passage derrière — et signale ce qu'elle ne peut pas tracer. Vérifiez d'un clic.",
  },
  ja: {
    eyebrow: "// プライベート・検証可能なドキュメントAI",
    heroA: "あらゆる文書を読み解く。",
    heroB: "すべての回答を検証。",
    heroSub: "約50のPDFツール（その多くはブラウザ内で動作）。AIが文書を読み・比較・抽出し、見つけた内容の根拠となる原文箇所まで示します。",
    primary: "無料で使う",
    secondary: "プライバシーの仕組みを見る",
    proof: [{ t: "多くはブラウザ内で処理" }, { g: "0", t: " ブラウザ内の送信" }, { t: "根拠を提示、無理なら明示" }, { t: "登録不要" }],
    findEyebrow: "// ツールを探す",
    findHeading: "ツールを選んで、ワンクリックで開始。",
    capSub: "約50のPDFツールを一か所に——変換・整理・署名・墨消し・OCR——その多くはブラウザ内でローカルに動作します。",
    searchPlaceholder: "約50のツールを検索——圧縮、結合、署名…",
    searchNoResults: "一致するツールがありません——別の語を試すか、すべて表示してください。",
    fig2Caption: "図 0.2 — 約50ツール、4つの入口。",
    aiEyebrow: "// 根拠を示すAI",
    aiHeading: "根拠を示すAI。",
    aiSub: "どんな文書にも質問できます。AIは回答や指摘の根拠となる原文箇所を示し、たどれない場合は出典を作らず正直に伝えます。比較・抽出・要約。",
    aiCta: "PDFと対話",
    aiChips: ["比較", "Excelに抽出", "要約", "18言語に翻訳"],
    fig3Caption: "図 0.3 — 根拠ある回答が、正確な原文まで辿れる。",
    jobsEyebrow: "// あなたの代わりにできること",
    jobsHeading: "数時間ではなく、数分で。",
    fig4Caption: "図 0.4 — 日常の4つの作業が、数時間ではなく数分に。",
    browseAll: "すべてのツールを見る",
    more: (n: number) => `他${n}件`,
    tools: "ツール",
    ctaEyebrow: "// 試してみる",
    ctaHeadA: "あらゆる文書を読み解く。",
    ctaHeadB: "すべての回答を検証。",
    ctaSub: "約50のツール、可能な限り根拠を示すAI、ブラウザツールはアップロードなし。無料で開始——登録不要。",
    viewPricing: "料金を見る",
    qaQuestion: "第3四半期の売上はどれくらい伸びましたか？",
    qaGrounded: "根拠ある回答",
    qaAnswer: "第3四半期の売上は前年比23%増で、主にアジア太平洋が牽引しました。",
    qaSourcesLabel: "根拠",
    qaSnippets: ["売上 前年比+23%", "APACが主な牽引役"],
    aiSummary: "AI要約",
    cite: "原文",
    figCaption: "図 0.1 — AIが回答するとき、その根拠となる原文を示し——たどれない箇所は正直に明示します。ワンクリックで確認。",
  },
  de: {
    eyebrow: "// Private, überprüfbare Dokument-KI",
    heroA: "Jedes Dokument lesen.",
    heroB: "Jede Antwort überprüfen.",
    heroSub: "~50 PDF-Tools, die meisten laufen in Ihrem Browser, dazu eine KI, die Ihre Dokumente liest, vergleicht und Daten extrahiert — und die Quellstelle hinter dem zeigt, was sie findet.",
    primary: "Kostenlos nutzen",
    secondary: "So funktioniert der Datenschutz",
    proof: [{ t: "Die meisten Tools laufen in Ihrem Browser" }, { g: "0", t: " Uploads im Browser" }, { t: "Die KI zeigt ihre Quelle — oder sagt, wenn sie es nicht kann" }, { t: "Keine Anmeldung" }],
    findEyebrow: "// Finden Sie Ihr Tool",
    findHeading: "Wählen Sie ein Tool. Starten Sie mit einem Klick.",
    capSub: "Rund 50 PDF-Tools an einem Ort — konvertieren, ordnen, signieren, schwärzen, OCR — die meisten laufen lokal in Ihrem Browser.",
    searchPlaceholder: "~50 Tools durchsuchen — komprimieren, zusammenführen, signieren…",
    searchNoResults: "Kein Tool passt dazu — versuchen Sie ein anderes Wort oder sehen Sie alle an.",
    fig2Caption: "Abb. 0.2 — ~50 Tools, vier Wege hinein.",
    aiEyebrow: "// Belegbare KI",
    aiHeading: "Eine KI, die ihre Arbeit zeigt.",
    aiSub: "Fragen Sie jedes Dokument; wenn die KI antwortet oder einen Befund markiert, zeigt sie die genaue Stelle, die ihn stützt — und sagt Ihnen, wenn sich etwas nicht zurückverfolgen lässt, statt eine Quelle zu erfinden. Vergleichen, extrahieren, zusammenfassen.",
    aiCta: "Mit einem PDF chatten",
    aiChips: ["Vergleichen", "Nach Excel extrahieren", "Zusammenfassen", "In 18 Sprachen übersetzen"],
    fig3Caption: "Abb. 0.3 — eine belegte Antwort, zurückverfolgt bis zur genauen Stelle.",
    jobsEyebrow: "// Was es für Sie erledigt",
    jobsHeading: "Minuten statt Stunden.",
    fig4Caption: "Abb. 0.4 — vier alltägliche Aufgaben, Minuten statt Stunden.",
    browseAll: "Alle Tools durchsuchen",
    more: (n: number) => `und ${n} weitere`,
    tools: "Tools",
    ctaEyebrow: "// Ausprobieren",
    ctaHeadA: "Jedes Dokument lesen.",
    ctaHeadB: "Jede Antwort überprüfen.",
    ctaSub: "~50 Tools, eine KI, die ihre Quelle nennt, wenn sie kann, und Browser-Tools, die nichts hochladen. Kostenlos starten — ohne Anmeldung.",
    viewPricing: "Preise ansehen",
    qaQuestion: "Wie stark ist der Umsatz im 3. Quartal gewachsen?",
    qaGrounded: "Belegte Antwort",
    qaAnswer: "Der Umsatz im 3. Quartal wuchs um 23 % gegenüber dem Vorjahr, vor allem getrieben von APAC.",
    qaSourcesLabel: "Quellen",
    qaSnippets: ["Umsatz +23 % gg. Vorjahr", "APAC als Haupttreiber"],
    aiSummary: "KI-Zusammenfassung",
    cite: "Quelle",
    figCaption: "Abb. 0.1 — wenn die KI antwortet, zeigt sie die Stelle dahinter — und markiert, was sie nicht zurückverfolgen kann. Mit einem Klick überprüfen.",
  },
} as const;

// category icons (nav order: 0 PDF · 1 Batch · 2 AI · 3 Profession)
const ICONS: Record<number, ReactNode> = {
  0: <path d="M7 3h6l4 4v10a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z M13 3v4h4" />,
  1: <path d="M4 8l8-4 8 4-8 4-8-4Z M4 12l8 4 8-4 M4 16l8 4 8-4" />,
  2: <path d="M12 3l1.8 4.7L18.5 9l-4.7 1.8L12 15.5l-1.8-4.7L5.5 9l4.7-1.3L12 3Z" />,
  3: <path d="M5 9h14v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V9Z M9 9V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />,
};

function flatItems(cat: { cols: { items: Item[] }[] }): Item[] {
  const seen = new Set<string>(); const out: Item[] = [];
  for (const col of cat.cols) for (const it of col.items ?? []) { const k = it.name + it.slug; if (!seen.has(k)) { seen.add(k); out.push(it); } }
  return out;
}

const GLOW = { background: "radial-gradient(480px circle at 30% 0%, rgba(62,207,142,0.06), transparent 62%)" };

// Shared JS-controlled typewriter. REST = fully shown (A-scheme: non-hover/touch visitors
// see the value prop + SEO has the text). On hover (desktop only): lines re-type one by one;
// lines not yet reached are clipped (tw-pending) so it reads as a true line-by-line reveal.
// Resets to fully-shown on leave. Touch never fires onMouseEnter → stays at the shown rest state.
function useLineReveal(count: number) {
  const [phase, setPhase] = useState(-1);
  const [active, setActive] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const start = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    // reduced-motion: skip the replay entirely, keep the static fully-shown rest state
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setActive(true);
    setPhase(0);
    for (let i = 1; i < count; i++) {
      timers.current.push(setTimeout(() => setPhase(i), i * 480));
    }
  }, [count]);
  const stop = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setActive(false);
    setPhase(-1);
  }, []);
  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);
  // "" = rest (fully shown) · tw-on = typing/typed · tw-pending = waiting its turn (clipped)
  const lineCls = useCallback((p: number) => (active ? (phase >= p ? "tw-on" : "tw-pending") : ""), [active, phase]);
  return { active, start, stop, lineCls };
}

function Icon({ i }: { i: number }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[color:var(--line)] text-[color:var(--accent)]">
      <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{ICONS[i]}</svg>
    </span>
  );
}

// ── mini-visuals (border-only on flat #171717) ──
function MiniThumbs() {
  return (
    <div className="flex items-end gap-2">
      {/* Compress target — shrinks + progress bar + badge on hover */}
      <div className="relative flex flex-col items-center">
        <span className="mc-badge pointer-events-none absolute -top-4 left-1/2 whitespace-nowrap rounded border border-[color:var(--line)] bg-[color:var(--surface)] px-1.5 py-px text-[9px] font-medium text-[color:var(--accent)]">−68%</span>
        <div className="mc-file flex h-14 w-10 flex-col gap-1 overflow-hidden rounded-md border border-[color:var(--line)] p-1.5">
          {[70, 90, 55].map((w, k) => (
            <span key={k} className="h-[3px] shrink-0 rounded-full bg-[color:var(--skeleton)]" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="mt-1 h-1 w-10 overflow-hidden rounded-full bg-[color:var(--skeleton)]">
          <div className="mc-progress h-full rounded-full bg-[color:var(--accent)]" />
        </div>
      </div>
      {/* Other files */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="mt-tile flex h-14 w-10 flex-col gap-1 rounded-md border border-[color:var(--line)] p-1.5" style={{ ["--i"]: i } as CSSProperties}>
          {[70, 90, 55].map((w, k) => (
            <span key={k} className="h-[3px] rounded-full bg-[color:var(--skeleton)]" style={{ width: `${w}%` }} />
          ))}
        </div>
      ))}
      <div className="mt-tile flex h-14 w-10 items-center justify-center rounded-md border border-dashed border-[color:var(--line-strong)] text-[16px] text-[color:var(--faint)]" style={{ ["--i"]: 4 } as CSSProperties}>+</div>
    </div>
  );
}
function MiniExtract({ label, locale }: { label: string; locale: Locale }) {
  const { start, stop, lineCls } = useLineReveal(3);
  const hant = locale === "zh-Hant";
  const h = (s: string) => (hant ? toHant(s) : s);
  const lines = [
    locale === "zh" || hant ? h("营收同比 +23%") : locale === "es" ? "Ingresos +23% interanual" : locale === "pt" ? "Receita +23% ano a ano" : locale === "fr" ? "Revenus +23% sur un an" : locale === "ja" ? "売上 前年比+23%" : locale === "de" ? "Umsatz +23 % gg. Vorjahr" : "Revenue +23% YoY",
    locale === "zh" || hant ? h("亚太区为主要驱动") : locale === "es" ? "APAC es el motor principal" : locale === "pt" ? "APAC é o motor principal" : locale === "fr" ? "L'APAC est le principal moteur" : locale === "ja" ? "APACが主な牽引役" : locale === "de" ? "APAC ist der Haupttreiber" : "APAC is the main driver",
    locale === "zh" || hant ? h("毛利率 41%（↑3pt）") : locale === "es" ? "Margen bruto 41% (↑3pt)" : locale === "pt" ? "Margem bruta 41% (↑3pt)" : locale === "fr" ? "Marge brute 41% (↑3pt)" : locale === "ja" ? "粗利率41%（↑3pt）" : locale === "de" ? "Bruttomarge 41 % (↑3 pp)" : "Gross margin 41%",
  ];
  const citeLabel = locale === "zh" || hant ? h("已溯源") : locale === "es" ? "citado" : locale === "pt" ? "citado" : locale === "fr" ? "cité" : locale === "ja" ? "引用済み" : locale === "de" ? "belegt" : "cited";
  return (
    <div className="flex items-center gap-2.5" onMouseEnter={start} onMouseLeave={stop}>
      <div className="relative flex h-16 w-12 flex-col gap-1 overflow-hidden rounded-md border border-[color:var(--line)] p-1.5">
        {[80, 60, 75, 50, 65].map((w, k) => <span key={k} className="h-[3px] rounded-full bg-[color:var(--skeleton)]" style={{ width: `${w}%` }} />)}
        <span className="mx-scan pointer-events-none absolute inset-x-1 top-1 h-3 rounded" style={{ background: "linear-gradient(var(--soft-accent), transparent)" }} />
      </div>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[color:var(--accent)]"><path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      <div className="flex-1 rounded-md border border-[color:var(--line)] p-2">
        <p className="mb-1.5 text-[9px] font-normal uppercase tracking-[0.1em] text-[color:var(--faint)]">{label}</p>
        {/* Line 1 with source badge */}
        <div className="mb-1 flex items-center gap-1 last:mb-0">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--accent)]" />
          <span className={`tw-line min-w-0 flex-1 text-[10px] leading-tight text-[color:var(--foreground)] ${lineCls(0)}`}>{lines[0]}</span>
          <span className={`tw-pill ml-auto inline-flex shrink-0 items-center rounded border border-[color:var(--line)] px-1 py-px text-[8px] font-medium text-[color:var(--accent)] ${lineCls(0)}`}>{citeLabel}</span>
        </div>
        {/* Lines 2–3 */}
        {lines.slice(1).map((line, i) => (
          <div key={i} className="mb-1 flex items-center gap-1 last:mb-0">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--ink-soft)]" />
            <span className={`tw-line min-w-0 flex-1 text-[10px] leading-tight text-[color:var(--muted)] ${lineCls(i + 1)}`}>{line}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
function MiniBatch() {
  return (
    <div>
      {/* Sort-category labels appear after batch bar fills */}
      <div className="mb-2 flex gap-1.5">
        {(["Invoice", "Contract"] as const).map((lb, i) => (
          <span key={i} className="ms-label inline-flex items-center gap-1 rounded-full border border-[color:var(--line)] px-2 py-px text-[9px] text-[color:var(--accent)]" style={{ ["--i"]: i } as CSSProperties}>
            <span className="h-1 w-1 shrink-0 rounded-full bg-current" />{lb}
          </span>
        ))}
      </div>
      <div className="relative h-14">
        {[0, 1, 2].map((i) => (
          <div key={i} className="ms-stack absolute h-12 w-10 rounded-md border border-[color:var(--line)]" style={{ left: `${i * 10}px`, top: `${i * 3}px`, background: "var(--background)", ["--i"]: i } as CSSProperties} />
        ))}
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[color:var(--skeleton)]">
        <div className="batch-bar h-full rounded-full bg-[color:var(--accent)]" />
      </div>
      <p className="mt-1.5 text-[11px] text-[color:var(--faint)]">142 files</p>
    </div>
  );
}
function MiniSecure() {
  return (
    <div className="relative flex h-full w-full flex-col gap-2 rounded-md border border-[color:var(--line)] p-3">
      {/* Rotating profession label */}
      <div className="relative h-5 overflow-hidden">
        {(["Legal", "Finance", "Research"] as const).map((lb, i) => (
          <span key={i} className={`sec-prof sec-prof-${i} absolute left-0 top-0 inline-flex items-center rounded-full border border-[color:var(--line)] px-2 py-px text-[9px] text-[color:var(--muted)]`}>{lb}</span>
        ))}
      </div>
      {/* Risk-annotated contract lines (red/yellow/green) */}
      {(["#ef4444", "#f59e0b", "#3ecf8e"] as const).map((color, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span className="sec-tag h-2 w-2 shrink-0 rounded-full" style={{ background: color, ["--i"]: i } as CSSProperties} />
          <span className="h-[3px] flex-1 rounded-full bg-[color:var(--skeleton)]" />
        </div>
      ))}
    </div>
  );
}

const CARDS: { nav: number; span: number; visual: "thumbs" | "extract" | "batch" | "secure" }[] = [
  { nav: 0, span: 2, visual: "thumbs" },
  { nav: 2, span: 1, visual: "extract" },
  { nav: 1, span: 2, visual: "batch" },
  { nav: 3, span: 1, visual: "secure" },
];

// section-3 capability chips link to their tool pages (funnel: link-bearing per spec)
const AICHIP_SLUGS = ["/compare", "/extract-to-excel", "/ai-summary", "/translate-pdf"];

// concrete jobs DockDocs does — old way → DockDocs (low text, scannable)
const SCENARIOS = [
  { icon: <path d="M4 13h3v6H4zM10 9h3v10h-3zM16 5h3v14h-3z" />, href: "/compare",
    en: ["Compare quotes, pick the best", "3 files into a sheet · ~1h", "a data-backed pick · 1 min"],
    zh: ["比报价，选最优", "开 3 个文件抄进表格 · 约 1 小时", "基于数据的推荐 · 1 分钟"],
    es: ["Compara presupuestos, elige el mejor", "3 archivos a una hoja · ~1 h", "una elección basada en los datos · 1 min"],
    pt: ["Compare orçamentos, escolha o melhor", "3 arquivos em uma planilha · ~1h", "uma escolha baseada nos dados · 1 min"],
    fr: ["Comparez des devis, choisissez le meilleur", "3 fichiers dans un tableau · ~1h", "un choix fondé sur les chiffres · 1 min"],
    ja: ["見積もりを比較し、最適を選ぶ", "3ファイルを表に書き写す · 約1時間", "数値に基づく選定 · 1分"],
    de: ["Angebote vergleichen, das beste wählen", "3 Dateien in eine Tabelle · ~1 Std.", "eine datenbasierte Wahl · 1 Min."] },
  { icon: <path d="M6 3h7l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM13 3v4h4M8.5 14l2 2 4-4" />, href: "/redline",
    en: ["Catch the traps in a contract", "a lawyer, or sign blind", "AI flags risky & missing clauses"],
    zh: ["看穿合同里的坑", "花钱找律师，或盲签踩坑", "AI 标出风险与缺失条款"],
    es: ["Detecta las trampas de un contrato", "un abogado, o firmar a ciegas", "la IA señala cláusulas de riesgo y ausentes"],
    pt: ["Detecte as armadilhas de um contrato", "um advogado, ou assinar às cegas", "a IA sinaliza cláusulas de risco e ausentes"],
    fr: ["Repérez les pièges d'un contrat", "un juriste, ou signer en aveugle", "l'IA signale les clauses à risque et manquantes"],
    ja: ["契約書の落とし穴を見抜く", "弁護士に頼むか、よく見ずに署名", "AIがリスク条項と欠落を指摘"],
    de: ["Die Fallen in einem Vertrag erkennen", "einen Anwalt zahlen oder blind unterschreiben", "die KI markiert riskante und fehlende Klauseln"] },
  { icon: <path d="M4 7l8-4 8 4-8 4-8-4ZM4 12l8 4 8-4M4 17l8 4 8-4" />, href: "/batch-extract-sheet",
    en: ["Process a batch of invoices", "key them in one by one · hours", "drop the batch → auto-extract"],
    zh: ["批量处理发票", "一张张录入 · 几小时", "整批丢进去 → 自动抽取"],
    es: ["Procesa un lote de facturas", "teclearlas una a una · horas", "suelta el lote → extracción automática"],
    pt: ["Processe um lote de faturas", "digitá-las uma a uma · horas", "solte o lote → extração automática"],
    fr: ["Traitez un lot de factures", "les saisir une par une · des heures", "déposez le lot → extraction automatique"],
    ja: ["請求書をまとめて処理", "1枚ずつ手入力 · 数時間", "まとめて投入 → 自動抽出"],
    de: ["Einen Stapel Rechnungen verarbeiten", "einzeln abtippen · Stunden", "den Stapel ablegen → automatische Extraktion"] },
  { icon: <path d="M5 4h11a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H5zM8.5 9h6M8.5 13h6" />, href: "/chat-with-pdf",
    en: ["Understand a long report fast", "read 80 pages for a few answers", "ask it → answers you can trace · 30s"],
    zh: ["快速读懂长报告", "读 80 页找几个答案", "问它 → 30 秒可追溯的答案"],
    es: ["Entiende un informe largo rápido", "leer 80 páginas por unas respuestas", "pregúntale → respuestas que puedes rastrear · 30 s"],
    pt: ["Entenda um relatório longo rápido", "ler 80 páginas por algumas respostas", "pergunte → respostas que você pode rastrear · 30s"],
    fr: ["Comprendre un long rapport rapidement", "lire 80 pages pour quelques réponses", "interrogez-le → des réponses traçables · 30s"],
    ja: ["長い報告書を素早く理解", "数個の答えのために80ページ読む", "質問する → 追跡できる回答 · 30秒"],
    de: ["Einen langen Bericht schnell verstehen", "80 Seiten für ein paar Antworten lesen", "fragen Sie ihn → nachvollziehbare Antworten · 30 Sek."] },
];

export function Home({ locale = "en" }: { locale?: Locale }) {
  // CJK typography flag (also covers zh-Hant). Content for zh-Hant is derived from
  // zh via OpenCC: `hant` + `h(...)` convert chosen zh strings to Traditional.
  const hant = locale === "zh-Hant";
  const zh = locale === "zh" || locale === "ja" || hant;
  const h = (s: string) => (hant ? toHant(s) : s);
  // ko has no COPY block yet → English via `?? COPY.en` (foundation phase). Cast the
  // index so the ko key (valid in Home's local Locale) doesn't trip the narrower object.
  const c = hant ? deepHant(COPY.zh) : (COPY[locale as keyof typeof COPY] ?? COPY.en);
  // navCategories (Header.tsx) has no de/zh-Hant nav menu yet → those locales
  // fall back to the English menu via `?? navCategories.en`. Cast the index so
  // the de key (valid in Home's local Locale) doesn't trip the narrower Record.
  const cats = (hant ? deepHant(navCategories.zh) : (navCategories[locale as keyof typeof navCategories] ?? navCategories.en)).slice(0, 4);
  const path = (slug: string) => (hant ? `/zh-Hant${slug}` : locale === "zh" ? `/zh${slug}` : locale === "es" ? `/es${slug}` : locale === "pt" ? `/pt${slug}` : locale === "fr" ? `/fr${slug}` : locale === "ja" ? `/ja${slug}` : locale === "de" ? `/de${slug}` : locale === "ko" ? `/ko${slug}` : slug);

  // ── real client-side tool search over the full flatItems set across all 4 cats ──
  const heroReveal = useLineReveal(3);

  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const allTools: Item[] = (() => {
    const seen = new Set<string>(); const out: Item[] = [];
    for (const cat of cats) { if (!cat) continue; for (const it of flatItems(cat as { cols: { items: Item[] }[] })) { if (!seen.has(it.slug)) { seen.add(it.slug); out.push(it); } } }
    return out;
  })();
  const matches = query ? allTools.filter((t) => t.name.toLowerCase().includes(query)) : [];

  return (
    <>
      <style>{`
        @keyframes hfgIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        @keyframes mtPop{0%,100%{transform:translateY(0)}45%{transform:translateY(-7px)}}
        @keyframes mxScan{0%{transform:translateY(-4px);opacity:0}15%{opacity:.9}100%{transform:translateY(46px);opacity:0}}
        @keyframes mxRow{from{opacity:.2;transform:translateX(-4px)}to{opacity:1;transform:none}}
        @keyframes msShuffle{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
        .hfg-in{animation:hfgIn .7s ease-out both}
        /* hover-triggered card animations (each card is a .group) */
        .batch-bar{width:8%;transition:width 1.5s cubic-bezier(.2,.8,.2,1)}
        .group:hover .batch-bar{width:70%}
        .ms-bar{width:14%;transition:width .6s ease}
        .group:hover .ms-bar{width:48%}
        .group:hover .mt-tile{animation:mtPop .6s ease both;animation-delay:calc(var(--i)*.09s)}
        .mx-scan{opacity:0}
        .group:hover .mx-scan{animation:mxScan 1.5s ease-in-out infinite}
        .group:hover .mx-row{animation:mxRow .45s ease both;animation-delay:calc(var(--i)*.16s + .15s)}
        .group:hover .ms-stack{animation:msShuffle .6s ease both;animation-delay:calc(var(--i)*.1s)}
        /* JS-controlled typewriter: hero + ai-workflows card. REST = fully shown (A-scheme: non-hover/touch see it + SEO); hover re-types line by line */
        @keyframes htype{from{opacity:1;clip-path:inset(0 100% 0 0)}to{opacity:1;clip-path:inset(0 0 0 0)}}
        @keyframes htypePill{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:none}}
        .tw-line{opacity:1}.tw-line.tw-pending{clip-path:inset(0 100% 0 0)}.tw-line.tw-on{animation:htype .5s steps(16) both}
        .tw-pill{opacity:1}.tw-pill.tw-pending{opacity:0}.tw-pill.tw-on{animation:htypePill .3s ease .42s both}
        /* MiniThumbs: compress animation */
        @keyframes mcCompress{0%,25%{height:56px}75%,100%{height:36px}}
        @keyframes mcBadgeIn{0%,50%{opacity:0;transform:translateX(-50%) scale(.8)}80%,100%{opacity:1;transform:translateX(-50%) scale(1)}}
        @keyframes mcBarFill{from{width:0}to{width:100%}}
        .mc-badge{opacity:0;transform:translateX(-50%)}.mc-progress{width:0}
        .group:hover .mc-file{animation:mcCompress 1.5s ease both}
        .group:hover .mc-badge{animation:mcBadgeIn 1.5s ease both}
        .group:hover .mc-progress{animation:mcBarFill 1.2s ease-in-out .1s both}
        /* MiniBatch: sort-category labels appear after progress fills */
        @keyframes msLabelIn{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:none}}
        .ms-label{opacity:0}
        .group:hover .ms-label{animation:msLabelIn .35s ease both;animation-delay:calc(var(--i)*.2s + .5s)}
        /* MiniSecure: risk annotation dots + rotating profession label */
        @keyframes secTagIn{from{opacity:0;transform:translateX(-5px)}to{opacity:1;transform:none}}
        @keyframes secRotate{0%,15%{opacity:0;transform:translateY(4px)}22%,65%{opacity:1;transform:none}72%,100%{opacity:0;transform:translateY(-3px)}}
        .sec-tag{opacity:0}.sec-prof{opacity:0}
        .group:hover .sec-tag{animation:secTagIn .35s ease both;animation-delay:calc(var(--i)*.22s + .15s)}
        .group:hover .sec-prof-0{animation:secRotate 2.4s ease 0s infinite}
        .group:hover .sec-prof-1{animation:secRotate 2.4s ease .8s infinite}
        .group:hover .sec-prof-2{animation:secRotate 2.4s ease 1.6s infinite}
        @media (prefers-reduced-motion:reduce){.hfg-in,.batch-bar,.ms-bar,.mt-tile,.mx-scan,.mx-row,.ms-stack,.mc-file,.mc-progress,.ms-label,.sec-tag,.sec-prof{animation:none!important;transition:none!important}.tw-line,.tw-pill{animation:none!important;opacity:1!important;clip-path:none!important}.mc-badge{animation:none!important;opacity:1!important;transform:translateX(-50%)!important}.ms-label,.sec-tag,.sec-prof{opacity:1!important;transform:none!important}}
      `}</style>

      {/* ── 1 · Hero — left-aligned anchor, mirroring About §1 (eyebrow → big H1 → sub → CTAs → trust pills → weighty wide Figure → caption) ── */}
      <section>
        <div className={SHELL}>
          <p className={eyebrowCls(zh)}>{c.eyebrow}</p>
          <h1 className="mt-4 max-w-[20ch] font-medium text-[40px] leading-[1.05] tracking-[-0.035em] text-[color:var(--foreground)] sm:text-[60px] sm:leading-[1.03] sm:tracking-[-0.03em] lg:text-[80px] lg:leading-[1.0] lg:tracking-[-0.04em]">
            {c.heroA}<br /><span className="text-[color:var(--muted)]">{c.heroB}</span>
          </h1>
          <p className={SUB}>{c.heroSub}</p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a href={path("/chat-with-pdf")} className="inline-flex h-12 items-center justify-center rounded-full bg-[color:var(--accent)] px-6 text-[15px] font-medium transition hover:bg-[color:var(--accent-hover)]">{c.primary}</a>
            <a href={path("/privacy-policy")} className="inline-flex h-12 items-center justify-center rounded-full border border-[color:var(--line)] px-6 text-[15px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">{c.secondary}</a>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-[color:var(--faint)]">
            {c.proof.map((f, i) => (
              <span key={i} className="inline-flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="text-[color:var(--accent)]"><path d="M3 8.5l3.2 3.2L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                {"g" in f && f.g ? <span className="font-medium text-[color:var(--accent)]">{f.g}</span> : null}
                <span className="text-[color:var(--foreground)]">{f.t}</span>
              </span>
            ))}
          </div>

          {/* product as art: a real grounded-AI interface — report → AI summary, with a citation. Full About-weight Figure, wide. */}
          <Figure className="mt-12" glow="24%">
            <div className="hfg-in flex items-stretch gap-4" onMouseEnter={heroReveal.start} onMouseLeave={heroReveal.stop}>
              <div className="flex w-[34%] flex-col gap-1.5 rounded-lg border border-[color:var(--line)] bg-black/20 p-4">
                {[80, 60, 70, 50, 65, 55].map((w, i) => <span key={i} className={`h-[3px] rounded-full ${i === 2 ? "bg-[color:var(--accent)]" : "bg-[color:var(--skeleton)]"}`} style={{ width: `${w}%`, opacity: i === 2 ? 0.9 : 1 }} />)}
                <span className="mt-1 text-[10px] text-[color:var(--faint)]">report.pdf</span>
              </div>
              <div className="flex items-center text-[color:var(--accent)]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <div className="flex-1 rounded-lg border border-[color:var(--line)] bg-black/20 p-4">
                <p className="mb-2 text-[10px] font-normal uppercase tracking-[0.12em] text-[color:var(--faint)]">{c.aiSummary}</p>
                <div className="mb-1.5 flex items-center gap-1.5 text-[13px] text-[color:var(--foreground)]">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--accent)]" />
                  <span className={`tw-line min-w-0 ${heroReveal.lineCls(0)}`}>{locale === "zh" || hant ? h("营收同比 +23%") : locale === "es" ? "Ingresos +23% interanual" : locale === "pt" ? "Receita +23% ano a ano" : locale === "fr" ? "Revenus +23% sur un an" : locale === "ja" ? "売上 前年比+23%" : locale === "de" ? "Umsatz +23 % gg. Vorjahr" : "Revenue +23% YoY"}</span>
                  <span className={`tw-pill ml-auto inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded border border-[color:var(--line)] px-1.5 py-0.5 text-[9px] font-medium text-[color:var(--accent)] ${heroReveal.lineCls(0)}`}>{c.cite}</span>
                </div>
                {[locale === "zh" || hant ? h("亚太区为主要驱动") : locale === "es" ? "APAC es el motor principal" : locale === "pt" ? "APAC é o motor principal" : locale === "fr" ? "L'APAC est le principal moteur" : locale === "ja" ? "APACが主な牽引役" : locale === "de" ? "APAC ist der Haupttreiber" : "APAC is the main driver", locale === "zh" || hant ? h("毛利率 41%（↑3pt）") : locale === "es" ? "Margen bruto 41% (↑3pt)" : locale === "pt" ? "Margem bruta 41% (↑3pt)" : locale === "fr" ? "Marge brute 41% (↑3pt)" : locale === "ja" ? "粗利率41%（↑3pt）" : locale === "de" ? "Bruttomarge 41 % (↑3 pp)" : "Gross margin 41% (↑3pt)"].map((b, i) => (
                  <div key={b} className="mb-1.5 flex items-center gap-1.5 text-[13px] text-[color:var(--muted)] last:mb-0">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--ink-soft)]" /><span className={`tw-line ${heroReveal.lineCls(i + 1)}`}>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </Figure>
          <p className={CAP}>{c.figCaption}</p>
        </div>
      </section>

      {/* ── 2 · Find your tool — bento promoted high + a REAL client-side search (funnel-critical) ── */}
      <section>
        <div className={SHELL}>
          <p className={eyebrowCls(zh)}>{c.findEyebrow}</p>
          <h2 className={`mt-4 ${H2}`}>{c.findHeading}</h2>
          <p className={SUB}>{c.capSub}</p>

          {/* contained search pill — never a full-width hairline */}
          <div className="relative mt-8 max-w-xl">
            <svg aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--faint)]" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" /><path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={c.searchPlaceholder}
              aria-label={c.searchPlaceholder}
              className="h-12 w-full rounded-full border border-[color:var(--line-strong)] bg-[color:var(--surface)] pl-11 pr-4 text-[15px] text-[color:var(--foreground)] outline-none transition-colors placeholder:text-[color:var(--faint)] focus:border-[color:var(--accent)]"
            />
          </div>

          {query ? (
            matches.length ? (
              <div className="mt-6 flex flex-wrap gap-2">
                {matches.map((t) => (
                  <a key={t.slug} href={path(t.slug)} className="rounded-full border border-[color:var(--line)] px-3 py-1.5 text-[13px] text-[color:var(--muted)] transition-colors hover:border-[color:var(--line-strong)] hover:text-[color:var(--foreground)]">{t.name}</a>
                ))}
              </div>
            ) : (
              <p className="mt-6 text-[14px] text-[color:var(--faint)]">{c.searchNoResults}</p>
            )
          ) : (
            <Figure className="mt-8" glow="30%">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {CARDS.map(({ nav, span, visual }) => {
                  const cat = cats[nav];
                  if (!cat) return null;
                  const tools = flatItems(cat as { cols: { items: Item[] }[] });
                  const chips = tools.slice(0, 4);
                  const more = tools.length - chips.length;
                  return (
                    <div key={nav} className={`group relative overflow-hidden rounded-xl border border-[color:var(--line)] bg-black/20 p-5 transition-colors duration-200 hover:border-[color:var(--line-strong)] ${span === 2 ? "md:col-span-2" : "md:col-span-1"}`}>
                      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={GLOW} />
                      <div className="relative flex h-full flex-col">
                        <div className="flex items-center gap-3">
                          <Icon i={nav} />
                          <h3 className="text-[18px] font-normal text-[color:var(--foreground)] sm:text-[20px]">{cat.label}</h3>
                          <span className="ml-auto text-[12px] text-[color:var(--faint)]">{tools.length} {c.tools}</span>
                        </div>
                        <div className="mt-5">
                          {visual === "thumbs" && <MiniThumbs />}
                          {visual === "extract" && <MiniExtract label={c.aiSummary} locale={locale} />}
                          {visual === "batch" && <MiniBatch />}
                          {visual === "secure" && <MiniSecure />}
                        </div>
                        <div className="mt-5 flex flex-wrap items-center gap-2">
                          {chips.map((t) => (
                            <a key={t.slug} href={path(t.slug)} className="rounded-full border border-[color:var(--line-strong)] bg-[color:var(--surface)] px-2.5 py-1 text-[12px] text-[color:var(--muted)] transition-colors hover:border-[color:var(--accent)] hover:text-[color:var(--foreground)]">{t.name}</a>
                          ))}
                          {more > 0 && (
                            <a href={path("/sitemap")} className="inline-flex items-center gap-1 px-1 text-[12px] text-[color:var(--accent)] transition hover:text-[color:var(--accent-strong)]">{c.more(more)} →</a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Figure>
          )}

          <a href={path("/sitemap")} className="mt-8 inline-flex items-center gap-1.5 text-[14px] font-medium text-[color:var(--accent)] transition hover:gap-2.5">
            {c.browseAll}
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 8h9M8 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </a>
          <p className={CAP}>{c.fig2Caption}</p>
        </div>
      </section>

      {/* ── 3 · Grounded AI (moat) — CTA + chips BEFORE the figure so the funnel link isn't buried ── */}
      <section>
        <div className={SHELL}>
          <p className={eyebrowCls(zh)}>{c.aiEyebrow}</p>
          <h2 className={`mt-4 ${H2}`}>{c.aiHeading}</h2>
          <p className={SUB}>{c.aiSub}</p>
          <a href={path("/chat-with-pdf")} className="mt-6 inline-flex items-center gap-1.5 text-[14px] font-medium text-[color:var(--accent)] transition hover:gap-2.5">
            {c.aiCta}
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 8h9M8 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </a>
          <div className="mt-6 flex flex-wrap gap-2">
            {c.aiChips.map((chip, i) => (
              <a key={chip} href={path(AICHIP_SLUGS[i])} className="rounded-full border border-[color:var(--line)] px-3 py-1 text-[12px] text-[color:var(--muted)] transition-colors hover:border-[color:var(--line-strong)] hover:text-[color:var(--foreground)]">{chip}</a>
            ))}
          </div>

          {/* grounded Q&A: a question, then an answer that cites VERBATIM SNIPPETS (what the product really returns — not page numbers) */}
          <Figure className="mt-10" glow="32%">
            <div>
              <div className="flex justify-end">
                <span className="max-w-[80%] rounded-2xl rounded-br-md border border-[color:var(--line)] bg-[color:var(--background)] px-3.5 py-2 text-[12.5px] leading-[1.45] text-[color:var(--foreground)]">{c.qaQuestion}</span>
              </div>
              <div className={`mt-3 ${PANEL}`}>
                <div className="mb-2.5 flex items-center gap-1.5 text-[10px] font-normal uppercase tracking-[0.12em] text-[color:var(--faint)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent)]" />{c.qaGrounded}
                </div>
                <p className="mb-3 text-[12.5px] leading-[1.5] text-[color:var(--foreground)]">{c.qaAnswer}</p>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-[color:var(--faint)]">{c.qaSourcesLabel}</span>
                  {c.qaSnippets.map((snip) => (
                    <span key={snip} className="inline-flex items-center gap-1 rounded border border-[color:var(--line)] px-1.5 py-0.5 text-[10px] font-medium text-[color:var(--accent)] transition-colors hover:border-[color:var(--accent)]">
                      <svg width="9" height="9" viewBox="0 0 16 16" fill="none"><path d="M5 4H3v3h2zM10 4H8v3h2z" fill="currentColor" /></svg>
                      “{snip}”
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Figure>
          <p className={CAP}>{c.fig3Caption}</p>
        </div>
      </section>

      {/* ── 4 · What it does for you — 4 jobs in one Figure ── */}
      <section>
        <div className={SHELL}>
          <p className={eyebrowCls(zh)}>{c.jobsEyebrow}</p>
          <h2 className={`mt-4 ${H2}`}>{c.jobsHeading}</h2>
          <Figure className="mt-10" glow="20%">
            <div className="grid gap-4 sm:grid-cols-2">
              {SCENARIOS.map((s) => {
                const t = hant ? deepHant(s.zh) : locale === "zh" ? s.zh : locale === "es" ? s.es : locale === "pt" ? s.pt : locale === "fr" ? s.fr : locale === "ja" ? s.ja : s.en;
                return (
                  <a key={t[0]} href={path(s.href)} className={`${PANEL} block transition-colors hover:border-[color:var(--line-strong)]`}>
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[color:var(--line)] text-[color:var(--accent)]">
                      <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{s.icon}</svg>
                    </span>
                    <p className="mt-4 text-[16px] font-normal text-[color:var(--foreground)]">{t[0]}</p>
                    <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[13px] leading-[1.5]">
                      <span className="text-[color:var(--faint)]">{t[1]}</span>
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="shrink-0 text-[color:var(--accent)]"><path d="M3 8h9M8 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      <span className="text-[color:var(--foreground)]">{t[2]}</span>
                    </div>
                  </a>
                );
              })}
            </div>
          </Figure>
          <p className={CAP}>{c.fig4Caption}</p>
        </div>
      </section>

      {/* ── 5 · Try it — left-aligned closing CTA (unifies with About section 7) ── */}
      <section>
        <div className={SHELL}>
          <p className={eyebrowCls(zh)}>{c.ctaEyebrow}</p>
          <h2 className={`mt-4 ${H2}`}>{c.ctaHeadA} <span className="text-[color:var(--muted)]">{c.ctaHeadB}</span></h2>
          <p className={SUB}>{c.ctaSub}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href={path("/chat-with-pdf")} className="inline-flex h-11 items-center justify-center rounded-full bg-[color:var(--accent)] px-6 text-[14px] font-medium transition hover:bg-[color:var(--accent-hover)]">{c.primary}</a>
            <a href={path("/pricing")} className="inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--line-strong)] px-6 text-[14px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--foreground)]">{c.viewPricing}</a>
          </div>
        </div>
      </section>
    </>
  );
}
