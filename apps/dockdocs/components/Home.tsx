"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { CSSProperties, ReactNode } from "react";
import { navCategories } from "@/components/Header";
import { deepHant, toHant } from "@/lib/zh-hant";
import { Figure, SHELL, H2, SUB, CAP, PANEL, eyebrowCls } from "@/components/design";
import { ProductDemoHero } from "@/components/ProductDemoHero";
import { TrialCta } from "@/components/TrialCta";

type Locale = "en" | "zh" | "es" | "pt" | "fr" | "ja" | "de" | "ko" | "zh-Hant";
type Item = { name: string; slug: string };

const COPY = {
  en: {
    heroA: "Verifiable answers.",
    heroB: "Documents stay local.",
    heroSub: "AI that reads your documents and cites the source when it can locate it.",
    heroDisclosure: "Your file is read locally — only the extracted text is sent to AI.",
    primary: "Use it free",
    findEyebrow: "// Find your tool",
    findHeading: "Pick a tool. Start in one click.",
    capSub: "About 50 PDF tools in one place — convert, organize, sign, redact, OCR — most running locally in your browser.",
    aiEyebrow: "// Grounded AI",
    aiHeading: "AI that shows its work.",
    aiSub: "Ask any document; when it answers or flags a finding, it shows the exact passage behind it — and tells you when something can't be traced, instead of inventing a source. Compare, extract, summarize.",
    aiCta: "Chat with a PDF",
    aiChips: ["Compare", "Extract to Excel", "Summarize", "Translate 18 languages"],
    fig3Caption: "Fig 0.3 — one grounded answer, traced to the exact passage.",
    jobsEyebrow: "// What it does for you",
    jobsHeading: "Minutes, not hours.",
    browseAll: "Browse all tools",
    more: (n: number) => `and ${n} more`,
    tools: "tools",
    ctaEyebrow: "// Try it",
    ctaHeadA: "Start reading,",
    ctaHeadB: "answers you can check.",
    ctaSub: "~50 tools, AI that cites its source when it can, and browser tools that upload nothing. Free to start — no sign-up.",
    viewPricing: "View pricing",
    qaQuestion: "How much did Q3 revenue grow?",
    qaGrounded: "Grounded answer",
    qaAnswer: "Q3 revenue grew 23% year-over-year, driven mainly by APAC.",
    qaSourcesLabel: "Sources",
    qaSnippets: ["revenue +23% YoY", "APAC the main driver"],
    aiSummary: "AI summary",
    cite: "source",
  },
  zh: {
    heroA: "答案可核验，",
    heroB: "文档在本地。",
    heroSub: "AI 读你的文件——找得到时，指回原文出处。",
    heroDisclosure: "本地读取 · 文字发至 AI",
    primary: "免费使用",
    findEyebrow: "// 找到你的工具",
    findHeading: "选个工具，一键开始。",
    capSub: "约 50 个 PDF 工具集中一处——转换、整理、签名、脱敏、OCR——大多在浏览器本地完成。",
    aiEyebrow: "// AI · 可溯源",
    aiHeading: "会给你看依据的 AI。",
    aiSub: "向任意文档提问；AI 回答问题或标出某项发现时，会展示支撑它的原文原句——若有内容无法溯源，它会如实说明，而不是编造一个出处。对比、抽取、摘要。",
    aiCta: "与 PDF 对话",
    aiChips: ["多文档对比", "抽取到表格", "摘要", "翻译 18 种语言"],
    fig3Caption: "图 0.3 — 一个有据回答，追溯到确切的原文。",
    jobsEyebrow: "// 能替你做什么",
    jobsHeading: "几分钟，搞定原本要几小时的事。",
    browseAll: "浏览全部工具",
    more: (n: number) => `还有 ${n} 个`,
    tools: "个工具",
    ctaEyebrow: "// 试试看",
    ctaHeadA: "开始阅读，",
    ctaHeadB: "答案一一可查。",
    ctaSub: "约 50 个工具，会尽量给你看依据的 AI，浏览器工具零上传。免费开始，无需注册。",
    viewPricing: "查看定价",
    qaQuestion: "第 3 季度营收增长了多少？",
    qaGrounded: "有据回答",
    qaAnswer: "第 3 季度营收同比增长 23%，主要由亚太区驱动。",
    qaSourcesLabel: "依据",
    qaSnippets: ["营收同比 +23%", "亚太区为主要驱动"],
    aiSummary: "AI 摘要",
    cite: "原文",
  },
  es: {
    heroA: "Respuestas verificables.",
    heroB: "Documentos locales.",
    heroSub: "IA que lee tus documentos y cita la fuente cuando puede localizarla.",
    heroDisclosure: "Tu archivo se lee localmente — solo el texto extraído se envía a la IA.",
    primary: "Úsalo gratis",
    findEyebrow: "// Encuentra tu herramienta",
    findHeading: "Elige una herramienta. Empieza en un clic.",
    capSub: "Cerca de 50 herramientas PDF en un solo lugar — convertir, organizar, firmar, redactar, OCR — la mayoría se ejecutan localmente en tu navegador.",
    aiEyebrow: "// IA fundamentada",
    aiHeading: "Una IA que muestra su trabajo.",
    aiSub: "Pregunta a cualquier documento; cuando responde o señala un hallazgo, te muestra el pasaje exacto que lo respalda — y te avisa cuando algo no se puede rastrear, en lugar de inventarse una fuente. Compara, extrae, resume.",
    aiCta: "Chatea con un PDF",
    aiChips: ["Comparar", "Extraer a Excel", "Resumir", "Traducir 18 idiomas"],
    fig3Caption: "Fig 0.3 — una respuesta fundamentada, rastreada al pasaje exacto.",
    jobsEyebrow: "// Lo que hace por ti",
    jobsHeading: "Minutos, no horas.",
    browseAll: "Ver todas las herramientas",
    more: (n: number) => `y ${n} más`,
    tools: "herramientas",
    ctaEyebrow: "// Pruébalo",
    ctaHeadA: "Empieza a leer,",
    ctaHeadB: "respuestas que puedes verificar.",
    ctaSub: "~50 herramientas, IA que cita su fuente cuando puede, y herramientas del navegador que no suben nada. Gratis para empezar — sin registro.",
    viewPricing: "Ver precios",
    qaQuestion: "¿Cuánto crecieron los ingresos del 3.er trimestre?",
    qaGrounded: "Respuesta fundamentada",
    qaAnswer: "Los ingresos del 3.er trimestre crecieron un 23% interanual, impulsados principalmente por APAC.",
    qaSourcesLabel: "Fuentes",
    qaSnippets: ["ingresos +23% interanual", "APAC, motor principal"],
    aiSummary: "Resumen de IA",
    cite: "fuente",
  },
  pt: {
    heroA: "Respostas verificáveis.",
    heroB: "Documentos ficam locais.",
    heroSub: "IA que lê seus documentos e cita a fonte quando consegue localizá-la.",
    heroDisclosure: "Seu arquivo é lido localmente — apenas o texto extraído é enviado à IA.",
    primary: "Use gratuitamente",
    findEyebrow: "// Encontre sua ferramenta",
    findHeading: "Escolha uma ferramenta. Comece em um clique.",
    capSub: "Cerca de 50 ferramentas PDF em um só lugar — converter, organizar, assinar, redigir, OCR — a maioria roda localmente no seu navegador.",
    aiEyebrow: "// IA embasada",
    aiHeading: "Uma IA que mostra seu trabalho.",
    aiSub: "Pergunte a qualquer documento; quando responde ou aponta uma constatação, ela mostra o trecho exato que a fundamenta — e avisa quando algo não pode ser rastreado, em vez de inventar uma fonte. Compare, extraia, resuma.",
    aiCta: "Converse com um PDF",
    aiChips: ["Comparar", "Extrair para Excel", "Resumir", "Traduzir 18 idiomas"],
    fig3Caption: "Fig 0.3 — uma resposta embasada, rastreada ao trecho exato.",
    jobsEyebrow: "// O que faz por você",
    jobsHeading: "Minutos, não horas.",
    browseAll: "Ver todas as ferramentas",
    more: (n: number) => `e mais ${n}`,
    tools: "ferramentas",
    ctaEyebrow: "// Experimente",
    ctaHeadA: "Comece a ler,",
    ctaHeadB: "respostas que você pode verificar.",
    ctaSub: "~50 ferramentas, IA que cita a fonte quando dá, e ferramentas do navegador que não enviam nada. Grátis para começar — sem cadastro.",
    viewPricing: "Ver preços",
    qaQuestion: "Quanto cresceu a receita do 3.º trimestre?",
    qaGrounded: "Resposta embasada",
    qaAnswer: "A receita do 3.º trimestre cresceu 23% ano a ano, impulsionada principalmente pela APAC.",
    qaSourcesLabel: "Fontes",
    qaSnippets: ["receita +23% A/A", "APAC, motor principal"],
    aiSummary: "Resumo de IA",
    cite: "fonte",
  },
  fr: {
    heroA: "Réponses vérifiables.",
    heroB: "Documents restent locaux.",
    heroSub: "IA qui lit vos documents et cite la source quand elle peut la localiser.",
    heroDisclosure: "Votre fichier est lu localement — seul le texte extrait est envoyé à l'IA.",
    primary: "Utiliser gratuitement",
    findEyebrow: "// Trouvez votre outil",
    findHeading: "Choisissez un outil. Commencez en un clic.",
    capSub: "Environ 50 outils PDF en un seul endroit — convertir, organiser, signer, caviarder, OCR — la plupart s'exécutent localement dans votre navigateur.",
    aiEyebrow: "// IA fondée sur des preuves",
    aiHeading: "Une IA qui montre son travail.",
    aiSub: "Interrogez n'importe quel document ; quand l'IA répond ou relève un élément, elle montre le passage exact qui l'appuie — et vous indique quand quelque chose ne peut pas être tracé, au lieu d'inventer une source. Comparez, extrayez, résumez.",
    aiCta: "Discuter avec un PDF",
    aiChips: ["Comparer", "Extraire vers Excel", "Résumer", "Traduire en 18 langues"],
    fig3Caption: "Fig 0.3 — une réponse fondée, retracée jusqu'au passage exact.",
    jobsEyebrow: "// Ce qu'il fait pour vous",
    jobsHeading: "Des minutes, pas des heures.",
    browseAll: "Voir tous les outils",
    more: (n: number) => `et ${n} de plus`,
    tools: "outils",
    ctaEyebrow: "// Essayez",
    ctaHeadA: "Commencez à lire,",
    ctaHeadB: "des réponses vérifiables.",
    ctaSub: "~50 outils, IA qui cite sa source quand elle le peut, et des outils navigateur qui n'envoient rien. Gratuit pour commencer — sans inscription.",
    viewPricing: "Voir les tarifs",
    qaQuestion: "De combien les revenus du T3 ont-ils augmenté ?",
    qaGrounded: "Réponse fondée",
    qaAnswer: "Les revenus du T3 ont augmenté de 23% sur un an, principalement portés par l'APAC.",
    qaSourcesLabel: "Sources",
    qaSnippets: ["revenus +23% sur un an", "APAC, principal moteur"],
    aiSummary: "Résumé IA",
    cite: "source",
  },
  ja: {
    heroA: "答えは検証できる。",
    heroB: "文書はここに。",
    heroSub: "AIが文書を読み——たどれるとき、原文の出典を示します。",
    heroDisclosure: "ファイルはローカルで読み取り——抽出テキストのみAIに送信されます。",
    primary: "無料で使う",
    findEyebrow: "// ツールを探す",
    findHeading: "ツールを選んで、ワンクリックで開始。",
    capSub: "約50のPDFツールを一か所に——変換・整理・署名・墨消し・OCR——その多くはブラウザ内でローカルに動作します。",
    aiEyebrow: "// 根拠を示すAI",
    aiHeading: "根拠を示すAI。",
    aiSub: "どんな文書にも質問できます。AIは回答や指摘の根拠となる原文箇所を示し、たどれない場合は出典を作らず正直に伝えます。比較・抽出・要約。",
    aiCta: "PDFと対話",
    aiChips: ["比較", "Excelに抽出", "要約", "18言語に翻訳"],
    fig3Caption: "図 0.3 — 根拠ある回答が、正確な原文まで辿れる。",
    jobsEyebrow: "// あなたの代わりにできること",
    jobsHeading: "数時間ではなく、数分で。",
    browseAll: "すべてのツールを見る",
    more: (n: number) => `他${n}件`,
    tools: "ツール",
    ctaEyebrow: "// 試してみる",
    ctaHeadA: "読み始めよう、",
    ctaHeadB: "検証できる答えで。",
    ctaSub: "約50のツール、可能な限り根拠を示すAI、ブラウザツールはアップロードなし。無料で開始——登録不要。",
    viewPricing: "料金を見る",
    qaQuestion: "第3四半期の売上はどれくらい伸びましたか？",
    qaGrounded: "根拠ある回答",
    qaAnswer: "第3四半期の売上は前年比23%増で、主にアジア太平洋が牽引しました。",
    qaSourcesLabel: "根拠",
    qaSnippets: ["売上 前年比+23%", "APACが主な牽引役"],
    aiSummary: "AI要約",
    cite: "原文",
  },
  de: {
    heroA: "Prüfbare Antworten.",
    heroB: "Dokumente bleiben lokal.",
    heroSub: "KI, die Ihre Dokumente liest und die Quelle zitiert, wenn sie sie finden kann.",
    heroDisclosure: "Ihre Datei wird lokal gelesen — nur der extrahierte Text wird an die KI gesendet.",
    primary: "Kostenlos nutzen",
    findEyebrow: "// Finden Sie Ihr Tool",
    findHeading: "Wählen Sie ein Tool. Starten Sie mit einem Klick.",
    capSub: "Rund 50 PDF-Tools an einem Ort — konvertieren, ordnen, signieren, schwärzen, OCR — die meisten laufen lokal in Ihrem Browser.",
    aiEyebrow: "// Belegbare KI",
    aiHeading: "Eine KI, die ihre Arbeit zeigt.",
    aiSub: "Fragen Sie jedes Dokument; wenn die KI antwortet oder einen Befund markiert, zeigt sie die genaue Stelle, die ihn stützt — und sagt Ihnen, wenn sich etwas nicht zurückverfolgen lässt, statt eine Quelle zu erfinden. Vergleichen, extrahieren, zusammenfassen.",
    aiCta: "Mit einem PDF chatten",
    aiChips: ["Vergleichen", "Nach Excel extrahieren", "Zusammenfassen", "In 18 Sprachen übersetzen"],
    fig3Caption: "Abb. 0.3 — eine belegte Antwort, zurückverfolgt bis zur genauen Stelle.",
    jobsEyebrow: "// Was es für Sie erledigt",
    jobsHeading: "Minuten statt Stunden.",
    browseAll: "Alle Tools durchsuchen",
    more: (n: number) => `und ${n} weitere`,
    tools: "Tools",
    ctaEyebrow: "// Ausprobieren",
    ctaHeadA: "Anfangen zu lesen,",
    ctaHeadB: "prüfbare Antworten.",
    ctaSub: "~50 Tools, eine KI, die ihre Quelle nennt, wenn sie kann, und Browser-Tools, die nichts hochladen. Kostenlos starten — ohne Anmeldung.",
    viewPricing: "Preise ansehen",
    qaQuestion: "Wie stark ist der Umsatz im 3. Quartal gewachsen?",
    qaGrounded: "Belegte Antwort",
    qaAnswer: "Der Umsatz im 3. Quartal wuchs um 23 % gegenüber dem Vorjahr, vor allem getrieben von APAC.",
    qaSourcesLabel: "Quellen",
    qaSnippets: ["Umsatz +23 % gg. Vorjahr", "APAC als Haupttreiber"],
    aiSummary: "KI-Zusammenfassung",
    cite: "Quelle",
  },
  ko: {
    heroA: "검증 가능한 답변,",
    heroB: "문서는 로컬에.",
    heroSub: "AI가 문서를 읽고——찾을 수 있을 때 원문 출처를 알려드립니다.",
    heroDisclosure: "파일은 로컬에서 읽힙니다 — 추출된 텍스트만 AI로 전송됩니다.",
    primary: "무료로 사용하기",
    findEyebrow: "// 도구 찾기",
    findHeading: "도구를 고르세요. 한 번의 클릭으로 시작합니다.",
    capSub: "약 50개의 PDF 도구가 한곳에 — 변환, 정리, 서명, 가림 처리, OCR — 대부분 브라우저에서 로컬로 실행됩니다.",
    aiEyebrow: "// 근거를 제시하는 AI",
    aiHeading: "근거를 보여 주는 AI.",
    aiSub: "어떤 문서에도 질문하세요. AI가 답하거나 발견한 점을 표시할 때, 그 근거가 되는 정확한 구절을 보여 줍니다 — 그리고 출처를 만들어 내는 대신, 추적할 수 없을 때는 그렇다고 알립니다. 비교, 추출, 요약.",
    aiCta: "PDF와 대화하기",
    aiChips: ["비교", "Excel로 추출", "요약", "18개 언어 번역"],
    fig3Caption: "그림 0.3 — 근거 있는 하나의 답변, 정확한 구절까지 추적.",
    jobsEyebrow: "// 당신을 위해 해내는 일",
    jobsHeading: "몇 시간이 아니라, 몇 분 만에.",
    browseAll: "전체 도구 둘러보기",
    more: (n: number) => `외 ${n}개`,
    tools: "개 도구",
    ctaEyebrow: "// 사용해 보기",
    ctaHeadA: "지금 읽기 시작하세요,",
    ctaHeadB: "확인할 수 있는 답변.",
    ctaSub: "약 50개 도구, 가능할 때 출처를 제시하는 AI, 그리고 아무것도 업로드하지 않는 브라우저 도구. 무료로 시작 — 가입 불필요.",
    viewPricing: "요금 보기",
    qaQuestion: "3분기 매출은 얼마나 성장했나요?",
    qaGrounded: "근거 있는 답변",
    qaAnswer: "3분기 매출은 전년 대비 23% 성장했으며, 주로 APAC가 견인했습니다.",
    qaSourcesLabel: "출처",
    qaSnippets: ["매출 전년 대비 +23%", "APAC가 주요 견인 요인"],
    aiSummary: "AI 요약",
    cite: "원문",
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
    locale === "zh" || hant ? h("营收同比 +23%") : locale === "es" ? "Ingresos +23% interanual" : locale === "pt" ? "Receita +23% ano a ano" : locale === "fr" ? "Revenus +23% sur un an" : locale === "ja" ? "売上 前年比+23%" : locale === "de" ? "Umsatz +23 % gg. Vorjahr" : locale === "ko" ? "매출 전년 대비 +23%" : "Revenue +23% YoY",
    locale === "zh" || hant ? h("亚太区为主要驱动") : locale === "es" ? "APAC es el motor principal" : locale === "pt" ? "APAC é o motor principal" : locale === "fr" ? "L'APAC est le principal moteur" : locale === "ja" ? "APACが主な牽引役" : locale === "de" ? "APAC ist der Haupttreiber" : locale === "ko" ? "APAC가 주요 견인 요인" : "APAC is the main driver",
    locale === "zh" || hant ? h("毛利率 41%（↑3pt）") : locale === "es" ? "Margen bruto 41% (↑3pt)" : locale === "pt" ? "Margem bruta 41% (↑3pt)" : locale === "fr" ? "Marge brute 41% (↑3pt)" : locale === "ja" ? "粗利率41%（↑3pt）" : locale === "de" ? "Bruttomarge 41 % (↑3 pp)" : locale === "ko" ? "매출총이익률 41% (↑3pt)" : "Gross margin 41%",
  ];
  const citeLabel = locale === "zh" || hant ? h("已溯源") : locale === "es" ? "citado" : locale === "pt" ? "citado" : locale === "fr" ? "cité" : locale === "ja" ? "引用済み" : locale === "de" ? "belegt" : locale === "ko" ? "출처 확인됨" : "cited";
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
    <div className="space-y-2.5">
      <div className="rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] p-3">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded px-1.5 py-0.5 text-[8.5px] font-semibold" style={{ background: "rgba(239,68,68,0.12)", color: "rgb(248,113,113)" }}>HIGH RISK</span>
          <span className="h-[3px] flex-1 rounded-full bg-[color:var(--skeleton)]" />
        </div>
        {([["#ef4444", 80], ["#ef4444", 65], ["#f59e0b", 72], ["#3ecf8e", 88]] as [string, number][]).map(([color, w], i) => (
          <div key={i} className="sec-item mb-1.5 flex items-center gap-2 last:mb-0" style={{ ["--i"]: i } as CSSProperties}>
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color }} />
            <span className="h-[3px] rounded-full bg-[color:var(--skeleton)]" style={{ width: `${w}%` }} />
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {(["Legal", "Finance", "Research"] as const).map((lb, i) => (
          <span key={i} className="inline-flex items-center gap-1 rounded-full border border-[color:var(--line)] px-2 py-0.5 text-[9px] text-[color:var(--muted)]">
            <span className="h-1 w-1 rounded-full" style={{ background: i === 0 ? "rgb(62,207,142)" : "color-mix(in srgb, var(--skeleton) 100%, transparent)" }} />
            {lb}
          </span>
        ))}
      </div>
    </div>
  );
}

// Slot order matches ICONS (0 PDF · 1 Batch · 2 AI · 3 Profession).
// Batch (slot 1) is a virtual cat derived from cats[0].cols[2] — not a top-level navCategory.
const CARDS: { visual: "thumbs" | "batch" | "extract" | "secure" }[] = [
  { visual: "thumbs" },
  { visual: "batch" },
  { visual: "extract" },
  { visual: "secure" },
];

// 你给什么 → AI怎么做 → 你得到什么 (t[0]=title, t[1]=input, t[2]=output)
const SCENARIOS = [
  { icon: <path d="M4 13h3v6H4zM10 9h3v10h-3zM16 5h3v14h-3z" />, href: "/compare",
    en: ["Compare quotes, pick the best in 1 min", "A few quote PDFs", "AI pulls a comparison table, flags the winner"],
    zh: ["比报价，1 分钟拿决定", "几份报价 PDF", "AI 抽对比表、标出最优"],
    es: ["Compara presupuestos, decide en 1 minuto", "Unos PDFs de presupuestos", "AI genera tabla comparativa y señala el ganador"],
    pt: ["Compare orçamentos, decida em 1 minuto", "Alguns PDFs de orçamentos", "AI monta tabela comparativa e indica o melhor"],
    fr: ["Comparez des devis, décidez en 1 minute", "Quelques PDF de devis", "L'IA dresse un tableau comparatif et signale le meilleur"],
    ja: ["見積もりを比較し、1分で決断", "いくつかの見積PDFを", "AIが比較表を作成し最良を示す"],
    de: ["Angebote vergleichen, in 1 Min. entscheiden", "Einige Angebots-PDFs", "KI erstellt Vergleichstabelle und markiert das Beste"],
    ko: ["견적을 비교해 1분 만에 결정", "견적 PDF 몇 개를", "AI가 비교표 생성·최선 표시"] },
  { icon: <path d="M6 3h7l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM13 3v4h4M8.5 14l2 2 4-4" />, href: "/redline",
    en: ["Review a contract before signing", "Upload the contract", "AI flags every high-risk clause, links to the exact text"],
    zh: ["看合同，签字前心里有数", "上传合同", "AI 逐条标高危+引到原文"],
    es: ["Revisa un contrato antes de firmar", "Sube el contrato", "AI marca cada cláusula de riesgo con referencia al texto"],
    pt: ["Revise um contrato antes de assinar", "Suba o contrato", "AI marca cada cláusula de risco com link ao texto"],
    fr: ["Relisez un contrat avant de signer", "Téléversez le contrat", "L'IA signale chaque clause à risque avec renvoi au texte"],
    ja: ["契約書を署名前に確認", "契約書をアップロード", "AIが高リスク条項を逐条マーク+原文に誘導"],
    de: ["Vertrag vor der Unterschrift prüfen", "Vertrag hochladen", "KI markiert jede Risikoklausel mit Verweis auf den Text"],
    ko: ["서명 전 계약서 검토", "계약서 업로드", "AI가 고위험 조항 표시+원문 연결"] },
  { icon: <path d="M4 7l8-4 8 4-8 4-8-4ZM4 12l8 4 8-4M4 17l8 4 8-4" />, href: "/batch-extract-sheet",
    en: ["Process a batch of invoices", "Invoices in bulk", "AI extracts amount, date, and vendor — automatically"],
    zh: ["批发票，几分钟一摞", "整批发票", "AI 自动抽出金额/日期/抬头"],
    es: ["Procesa facturas en lote", "Facturas a granel", "AI extrae importe, fecha y emisor automáticamente"],
    pt: ["Processe faturas em lote", "Faturas em volume", "AI extrai valor, data e fornecedor automaticamente"],
    fr: ["Traitez des factures en lot", "Des factures en vrac", "L'IA extrait montant, date et émetteur automatiquement"],
    ja: ["請求書をまとめて処理", "まとめて請求書を", "AIが金額・日付・発行元を自動抽出"],
    de: ["Rechnungen stapelweise verarbeiten", "Rechnungen in Menge", "KI extrahiert Betrag, Datum und Aussteller automatisch"],
    ko: ["청구서 일괄 처리", "청구서 묶음을", "AI가 금액·날짜·거래처 자동 추출"] },
  { icon: <path d="M5 4h11a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H5zM8.5 9h6M8.5 13h6" />, href: "/chat-with-pdf",
    en: ["Understand a long report in 30 seconds", "An 80-page upload", "Ask one question → an answer with a source"],
    zh: ["读长报告，30 秒有答案", "上传 80 页", "问一句 → 带出处的答案"],
    es: ["Entiende un informe largo en 30 segundos", "Un PDF de 80 páginas", "Haz una pregunta → respuesta con fuente"],
    pt: ["Entenda um relatório longo em 30 segundos", "Um PDF de 80 páginas", "Faça uma pergunta → resposta com fonte"],
    fr: ["Comprenez un long rapport en 30 secondes", "Un PDF de 80 pages", "Posez une question → réponse avec source"],
    ja: ["長い報告書を30秒で理解", "80ページのPDF", "一問するだけ → 出典付きの回答"],
    de: ["Langen Bericht in 30 Sek. verstehen", "Ein 80-seitiges PDF", "Eine Frage stellen → Antwort mit Quellenangabe"],
    ko: ["긴 보고서를 30초에 이해", "80페이지 PDF를", "질문 하나 → 출처 있는 답변"] },
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
  // Batch is col[2] of Document tools — synthesize a virtual 4th cat for the home grid.
  const batchCat = { label: cats[0]?.cols[2]?.heading ?? "Batch", cols: [{ items: cats[0]?.cols[2]?.items ?? [] }] };
  const allCats = [cats[0], batchCat, cats[1], cats[2]];
  const path = (slug: string) => (hant ? `/zh-Hant${slug}` : locale === "zh" ? `/zh${slug}` : locale === "es" ? `/es${slug}` : locale === "pt" ? `/pt${slug}` : locale === "fr" ? `/fr${slug}` : locale === "ja" ? `/ja${slug}` : locale === "de" ? `/de${slug}` : locale === "ko" ? `/ko${slug}` : slug);


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
        /* MiniSecure: risk items stagger-slide on hover */
        @keyframes secItemIn{from{opacity:.35;transform:translateX(-4px)}to{opacity:1;transform:none}}
        .group:hover .sec-item{animation:secItemIn .3s ease both;animation-delay:calc(var(--i)*.08s)}
        @media (prefers-reduced-motion:reduce){.hfg-in,.batch-bar,.ms-bar,.mt-tile,.mx-scan,.mx-row,.ms-stack,.mc-file,.mc-progress,.ms-label,.sec-tag,.sec-prof{animation:none!important;transition:none!important}.tw-line,.tw-pill{animation:none!important;opacity:1!important;clip-path:none!important}.mc-badge{animation:none!important;opacity:1!important;transform:translateX(-50%)!important}.ms-label,.sec-tag,.sec-prof{opacity:1!important;transform:none!important}}
      `}</style>

      {/* ── 1 · Hero ── */}
      <section>
        <div className={SHELL}>
          <h1 className="max-w-[28ch] font-medium text-[40px] leading-[1.05] tracking-[-0.035em] text-[color:var(--foreground)] sm:text-[60px]">
            {c.heroA}{locale === "zh" || locale === "zh-Hant" || locale === "ja" ? "" : " "}<span className="text-[color:var(--muted)]">{c.heroB}</span>
          </h1>
          <p className="mt-5 max-w-[52ch] text-[17px] leading-[1.6] text-[color:var(--muted)] sm:text-[19px]">{c.heroSub}</p>
          <div className="mt-14">
            <ProductDemoHero locale={locale} />
          </div>
          <p className="mt-4 text-[12px] text-[color:var(--faint)]">{c.heroDisclosure}</p>
        </div>
      </section>

      {/* ── 1b · Trial CTA band — no SHELL wrapper; TrialCta owns its container so null = zero footprint ── */}
      <TrialCta variant="hero" locale={locale} />

      {/* ── 2 · Find your tool — bento promoted high + a REAL client-side search (funnel-critical) ── */}
      <section>
        <div className={SHELL}>
          <p className={eyebrowCls(zh)}>{c.findEyebrow}</p>
          <h2 className={`mt-4 ${H2}`}>{c.findHeading}</h2>
          <p className={SUB}>{c.capSub}</p>

          <Figure className="mt-8" glow="30%">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {CARDS.map(({ visual }, idx) => {
                const cat = allCats[idx];
                if (!cat) return null;
                const tools = flatItems(cat as { cols: { items: Item[] }[] });
                const chips = tools.slice(0, 4);
                const more = tools.length - chips.length;
                return (
                  <div key={idx} className="group relative overflow-hidden rounded-xl border border-[color:var(--line)] bg-black/20 p-5 transition-colors duration-200 hover:border-[color:var(--line-strong)]">
                    <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={GLOW} />
                    <div className="relative flex h-full flex-col">
                      <div className="flex items-center gap-3">
                        <Icon i={idx} />
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
                          <a href={path("/workspace")} className="inline-flex items-center gap-1 px-1 text-[12px] text-[color:var(--accent)] transition hover:text-[color:var(--accent-strong)]">{c.more(more)} →</a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Figure>

          <a href={path("/workspace")} className="mt-8 inline-flex items-center gap-1.5 text-[14px] font-medium text-[color:var(--accent)] transition hover:gap-2.5">
            {c.browseAll}
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 8h9M8 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </a>
        </div>
      </section>

      {/* ── 3 · What it does for you — 4 jobs in one Figure ── */}
      <section>
        <div className={SHELL}>
          <p className={eyebrowCls(zh)}>{c.jobsEyebrow}</p>
          <h2 className={`mt-4 ${H2}`}>{c.jobsHeading}</h2>
          <Figure className="mt-10" glow="20%">
            <div className="grid gap-4 sm:grid-cols-2">
              {SCENARIOS.map((s) => {
                const t = hant ? deepHant(s.zh) : locale === "zh" ? s.zh : locale === "es" ? s.es : locale === "pt" ? s.pt : locale === "fr" ? s.fr : locale === "ja" ? s.ja : locale === "de" ? s.de : locale === "ko" ? s.ko : s.en;
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
