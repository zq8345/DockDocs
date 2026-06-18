"use client";

import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { navCategories } from "@/components/Header";

type Locale = "en" | "zh" | "es" | "pt" | "fr";
type Item = { name: string; slug: string };

const COPY = {
  en: {
    eyebrow: "// Private · verifiable document AI",
    heroA: "Read any document.",
    heroB: "Trust every answer.",
    heroSub: "~50 PDF tools that run in your browser, plus AI that reads, compares and extracts your documents — and shows the source passage behind what it finds.",
    primary: "Use it free",
    secondary: "See how privacy works",
    proof: [{ t: "Processed in your browser" }, { g: "0", t: " files uploaded" }, { t: "AI answers show their source" }, { t: "No sign-up" }],
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
    ctaHeadB: "Trust every answer.",
    ctaSub: "~50 tools, AI that shows its source, nothing uploaded. Free to start — no sign-up.",
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
    heroB: "答案皆可追溯。",
    heroSub: "约 50 个 PDF 工具在浏览器内运行，AI 读懂、对比、抽取你的文档——并展示它所发现内容背后的原文出处。",
    primary: "免费使用",
    secondary: "看隐私怎么做到",
    proof: [{ t: "在浏览器内处理" }, { g: "0", t: " 文件上传" }, { t: "回答标注原文出处" }, { t: "无需注册" }],
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
    ctaHeadB: "答案皆可追溯。",
    ctaSub: "约 50 个工具，会给你看依据的 AI，零上传。免费开始，无需注册。",
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
    heroB: "Confía en cada respuesta.",
    heroSub: "~50 herramientas PDF que se ejecutan en tu navegador, más una IA que lee, compara y extrae tus documentos — y muestra el pasaje de origen detrás de lo que encuentra.",
    primary: "Úsalo gratis",
    secondary: "Mira cómo funciona la privacidad",
    proof: [{ t: "Procesado en tu navegador" }, { g: "0", t: " archivos subidos" }, { t: "Las respuestas muestran su fuente" }, { t: "Sin registro" }],
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
    ctaHeadB: "Confía en cada respuesta.",
    ctaSub: "~50 herramientas, IA que muestra su fuente, nada se sube. Gratis para empezar — sin registro.",
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
    heroB: "Confie em cada resposta.",
    heroSub: "~50 ferramentas PDF que rodam no seu navegador, mais uma IA que lê, compara e extrai seus documentos — e mostra o trecho de origem por trás do que encontra.",
    primary: "Use gratuitamente",
    secondary: "Veja como a privacidade funciona",
    proof: [{ t: "Processado no seu navegador" }, { g: "0", t: " arquivos enviados" }, { t: "As respostas mostram a fonte" }, { t: "Sem cadastro" }],
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
    ctaHeadB: "Confie em cada resposta.",
    ctaSub: "~50 ferramentas, IA que mostra a fonte, nada é enviado. Grátis para começar — sem cadastro.",
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
    heroB: "Fiez-vous à chaque réponse.",
    heroSub: "~50 outils PDF qui s'exécutent dans votre navigateur, plus une IA qui lit, compare et extrait vos documents — et montre le passage source derrière ce qu'elle trouve.",
    primary: "Utiliser gratuitement",
    secondary: "Voir comment fonctionne la confidentialité",
    proof: [{ t: "Traité dans votre navigateur" }, { g: "0", t: " fichiers envoyés" }, { t: "Les réponses montrent leur source" }, { t: "Sans inscription" }],
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
    ctaHeadB: "Fiez-vous à chaque réponse.",
    ctaSub: "~50 outils, IA qui montre sa source, rien n'est envoyé. Gratuit pour commencer — sans inscription.",
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

const EYEBROW = (zh: boolean) => `font-mono text-[12px] text-[color:var(--faint)] ${zh ? "" : "uppercase tracking-[0.08em]"}`;
const CARD = "group relative overflow-hidden rounded-2xl border border-[color:var(--line)] p-6 transition-colors duration-200 hover:border-[color:var(--line-strong)]";
const GLOW = { background: "radial-gradient(480px circle at 30% 0%, rgba(62,207,142,0.06), transparent 62%)" };

// ── About v2 design primitives (reused verbatim so Home reads as the same family) ──
const H2 = "text-[28px] font-normal leading-[1.15] tracking-[-0.02em] text-[color:var(--foreground)] sm:text-[36px]";
const SUB = "mt-4 max-w-2xl text-[16px] leading-[1.6] text-[color:var(--muted)]";
const CAP = "mt-4 font-mono text-[12px] text-[color:var(--faint)]";
const SHELL = "mx-auto max-w-5xl px-5 py-24 sm:px-6 sm:py-28 lg:px-8";
const PANEL = "rounded-xl border border-[color:var(--line)] bg-black/20 p-5";

// The same depth/weight recipe as AboutPage's <Figure>: soft accent glow behind,
// raised gradient surface, strong border + large shadow, inner lit top edge.
function Figure({ children, className = "", glow = "28%" }: { children: ReactNode; className?: string; glow?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 blur-[48px]"
        style={{ background: `radial-gradient(55% 60% at ${glow} 45%, rgba(62,207,142,0.10), transparent 70%)` }}
      />
      <div
        className="relative z-10 overflow-hidden rounded-2xl border border-[color:var(--line-strong)] p-6 sm:p-8"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.012) 60%, transparent), var(--surface)",
          boxShadow: "0 24px 60px -20px rgba(0,0,0,0.6), inset 0 1px 0 0 rgba(255,255,255,0.04)",
        }}
      >
        {children}
      </div>
    </div>
  );
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
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="mt-tile flex h-14 w-10 flex-col gap-1 rounded-md border border-[color:var(--line)] p-1.5" style={{ ["--i"]: i } as CSSProperties}>
          {[70, 90, 55].map((w, k) => <span key={k} className="h-[3px] rounded-full bg-[color:var(--skeleton)]" style={{ width: `${w}%` }} />)}
        </div>
      ))}
      <div className="mt-tile flex h-14 w-10 items-center justify-center rounded-md border border-dashed border-[color:var(--line-strong)] text-[16px] text-[color:var(--faint)]" style={{ ["--i"]: 4 } as CSSProperties}>+</div>
    </div>
  );
}
function MiniExtract({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex h-16 w-12 flex-col gap-1 overflow-hidden rounded-md border border-[color:var(--line)] p-1.5">
        {[80, 60, 75, 50, 65].map((w, k) => <span key={k} className="h-[3px] rounded-full bg-[color:var(--skeleton)]" style={{ width: `${w}%` }} />)}
        <span className="mx-scan pointer-events-none absolute inset-x-1 top-1 h-3 rounded" style={{ background: "linear-gradient(var(--soft-accent), transparent)" }} />
      </div>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[color:var(--accent)]"><path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      <div className="flex-1 rounded-md border border-[color:var(--line)] p-2">
        <p className="mb-1.5 text-[9px] font-normal uppercase tracking-[0.1em] text-[color:var(--faint)]">{label}</p>
        {[0, 1, 2].map((k) => (
          <div key={k} className="mx-row mb-1 flex items-center gap-1.5 last:mb-0" style={{ ["--i"]: k } as CSSProperties}>
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--accent)]" />
            <span className="h-[3px] flex-1 rounded-full bg-[color:var(--skeleton)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
function MiniBatch() {
  return (
    <div>
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
    <div className="relative flex h-16 w-full flex-col justify-center gap-1.5 rounded-md border border-[color:var(--line)] px-3">
      <span className="h-[3px] w-[60%] rounded-full bg-[color:var(--skeleton)]" />
      <span className="ms-bar h-[6px] rounded-sm bg-[color:var(--foreground)]" />
      <span className="h-[3px] w-[70%] rounded-full bg-[color:var(--skeleton)]" />
      <svg className="absolute right-3 top-3 text-[color:var(--accent)]" width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" /><path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4" /></svg>
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
    en: ["Compare quotes, pick the best", "3 files into a sheet · ~1h", "a sourced pick · 1 min"],
    zh: ["比报价，选最优", "开 3 个文件抄进表格 · 约 1 小时", "带出处的推荐 · 1 分钟"],
    es: ["Compara presupuestos, elige el mejor", "3 archivos a una hoja · ~1 h", "una elección con fuentes · 1 min"],
    pt: ["Compare orçamentos, escolha o melhor", "3 arquivos em uma planilha · ~1h", "uma escolha com fontes · 1 min"],
    fr: ["Comparez des devis, choisissez le meilleur", "3 fichiers dans un tableau · ~1h", "un choix documenté · 1 min"] },
  { icon: <path d="M6 3h7l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM13 3v4h4M8.5 14l2 2 4-4" />, href: "/redline",
    en: ["Catch the traps in a contract", "a lawyer, or sign blind", "AI flags risky & missing clauses"],
    zh: ["看穿合同里的坑", "花钱找律师，或盲签踩坑", "AI 标出风险与缺失条款"],
    es: ["Detecta las trampas de un contrato", "un abogado, o firmar a ciegas", "la IA señala cláusulas de riesgo y ausentes"],
    pt: ["Detecte as armadilhas de um contrato", "um advogado, ou assinar às cegas", "a IA sinaliza cláusulas de risco e ausentes"],
    fr: ["Repérez les pièges d'un contrat", "un juriste, ou signer en aveugle", "l'IA signale les clauses à risque et manquantes"] },
  { icon: <path d="M4 7l8-4 8 4-8 4-8-4ZM4 12l8 4 8-4M4 17l8 4 8-4" />, href: "/batch-extract-sheet",
    en: ["Process a batch of invoices", "key them in one by one · hours", "drop the batch → auto-extract"],
    zh: ["批量处理发票", "一张张录入 · 几小时", "整批丢进去 → 自动抽取"],
    es: ["Procesa un lote de facturas", "teclearlas una a una · horas", "suelta el lote → extracción automática"],
    pt: ["Processe um lote de faturas", "digitá-las uma a uma · horas", "solte o lote → extração automática"],
    fr: ["Traitez un lot de factures", "les saisir une par une · des heures", "déposez le lot → extraction automatique"] },
  { icon: <path d="M5 4h11a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H5zM8.5 9h6M8.5 13h6" />, href: "/chat-with-pdf",
    en: ["Understand a long report fast", "read 80 pages for a few answers", "ask it → answers you can trace · 30s"],
    zh: ["快速读懂长报告", "读 80 页找几个答案", "问它 → 30 秒可追溯的答案"],
    es: ["Entiende un informe largo rápido", "leer 80 páginas por unas respuestas", "pregúntale → respuestas que puedes rastrear · 30 s"],
    pt: ["Entenda um relatório longo rápido", "ler 80 páginas por algumas respostas", "pergunte → respostas que você pode rastrear · 30s"],
    fr: ["Comprendre un long rapport rapidement", "lire 80 pages pour quelques réponses", "interrogez-le → des réponses traçables · 30s"] },
];

export function Home({ locale = "en" }: { locale?: Locale }) {
  const zh = locale === "zh";
  const c = COPY[locale] ?? COPY.en;
  const cats = (navCategories[locale] ?? navCategories.en).slice(0, 4);
  const path = (slug: string) => (locale === "zh" ? `/zh${slug}` : locale === "es" ? `/es${slug}` : locale === "pt" ? `/pt${slug}` : locale === "fr" ? `/fr${slug}` : slug);

  // ── real client-side tool search over the full flatItems set across all 4 cats ──
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
        @media (prefers-reduced-motion: reduce){.hfg-in,.batch-bar,.ms-bar,.mt-tile,.mx-scan,.mx-row,.ms-stack{animation:none!important;transition:none!important}}
      `}</style>

      {/* ── 1 · Hero — centered anchor (deliberate contrast vs left-aligned interior); no mid-page divider ── */}
      <section className="relative overflow-hidden">
        {/* depth glow (very restrained — the Linear move: flat → has depth) */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[520px] bg-[radial-gradient(60%_50%_at_50%_0%,rgba(62,207,142,0.10),transparent)] blur-[40px]" />
        <div className="relative z-10 mx-auto max-w-3xl px-5 pb-24 pt-28 text-center sm:px-6 sm:pb-28 sm:pt-36">
          <p className={EYEBROW(zh)}>{c.eyebrow}</p>
          <h1 className="mx-auto mt-5 max-w-[16ch] text-balance font-medium text-[40px] leading-[1.06] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[60px] sm:leading-[1.03] sm:tracking-[-0.03em] lg:text-[84px] lg:leading-[1.0] lg:tracking-[-0.04em]">
            {c.heroA}<br /><span className="text-[color:var(--muted)]">{c.heroB}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-[17px] leading-[1.65] text-[color:var(--muted)] sm:text-[19px]">{c.heroSub}</p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a href={path("/chat-with-pdf")} className="inline-flex h-12 items-center justify-center rounded-full bg-[color:var(--accent)] px-6 text-[15px] font-medium transition hover:bg-[color:var(--accent-hover)]">{c.primary}</a>
            <a href={path("/privacy-policy")} className="inline-flex h-12 items-center justify-center rounded-full border border-[color:var(--line)] px-6 text-[15px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">{c.secondary}</a>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] text-[color:var(--faint)]">
            {c.proof.map((f, i) => (
              <span key={i} className="inline-flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="text-[color:var(--accent)]"><path d="M3 8.5l3.2 3.2L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                {"g" in f && f.g ? <span className="font-medium text-[color:var(--accent)]">{f.g}</span> : null}
                <span className="text-[color:var(--foreground)]">{f.t}</span>
              </span>
            ))}
          </div>

          {/* product as art: a real grounded-AI interface — report → AI summary, with a citation.
              Kept LIGHTER than interior figures (soft glow only, no heavy shadow/gradient surface) so it never competes with the H1. */}
          <div className="relative mt-16 sm:mt-20">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 blur-[40px]" style={{ background: "radial-gradient(60% 60% at 50% 40%, rgba(62,207,142,0.08), transparent 70%)" }} />
            <div className="hfg-in relative z-10 mx-auto max-w-xl rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] p-5 text-left shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
              <div className="flex items-stretch gap-3">
                <div className="flex w-[36%] flex-col gap-1.5 rounded-lg border border-[color:var(--line)] p-3">
                  {[80, 60, 70, 50, 65, 55].map((w, i) => <span key={i} className={`h-[3px] rounded-full ${i === 2 ? "bg-[color:var(--accent)]" : "bg-[color:var(--skeleton)]"}`} style={{ width: `${w}%`, opacity: i === 2 ? 0.9 : 1 }} />)}
                  <span className="mt-1 text-[10px] text-[color:var(--faint)]">report.pdf</span>
                </div>
                <div className="flex items-center text-[color:var(--accent)]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <div className="flex-1 rounded-lg border border-[color:var(--line)] p-3">
                  <p className="mb-2 text-[10px] font-normal uppercase tracking-[0.12em] text-[color:var(--faint)]">{c.aiSummary}</p>
                  <div className="mb-1.5 flex items-center gap-1.5 text-[12px] text-[color:var(--foreground)]">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--accent)]" />
                    <span className="min-w-0">{locale === "zh" ? "营收同比 +23%" : locale === "es" ? "Ingresos +23% interanual" : locale === "pt" ? "Receita +23% ano a ano" : locale === "fr" ? "Revenus +23% sur un an" : "Revenue +23% YoY"}</span>
                    <span className="ml-auto inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded border border-[color:var(--line)] px-1.5 py-0.5 text-[9px] font-medium text-[color:var(--accent)]">{c.cite}</span>
                  </div>
                  {[locale === "zh" ? "亚太区为主要驱动" : locale === "es" ? "APAC es el motor principal" : locale === "pt" ? "APAC é o motor principal" : locale === "fr" ? "L'APAC est le principal moteur" : "APAC is the main driver", locale === "zh" ? "毛利率 41%（↑3pt）" : locale === "es" ? "Margen bruto 41% (↑3pt)" : locale === "pt" ? "Margem bruta 41% (↑3pt)" : locale === "fr" ? "Marge brute 41% (↑3pt)" : "Gross margin 41% (↑3pt)"].map((b) => (
                    <div key={b} className="mb-1.5 flex items-center gap-1.5 text-[12px] text-[color:var(--muted)] last:mb-0">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--ink-soft)]" />{b}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-4 font-mono text-[12px] text-[color:var(--faint)]">{c.figCaption}</p>
          </div>
        </div>
      </section>

      {/* ── 2 · Find your tool — bento promoted high + a REAL client-side search (funnel-critical) ── */}
      <section>
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
          <p className={EYEBROW(zh)}>{c.findEyebrow}</p>
          <h2 className={`mt-4 ${H2}`}>{c.findHeading}</h2>
          <p className="mt-4 max-w-2xl text-[16px] leading-[1.55] text-[color:var(--muted)]">{c.capSub}</p>

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
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
              {CARDS.map(({ nav, span, visual }) => {
                const cat = cats[nav];
                if (!cat) return null;
                const tools = flatItems(cat as { cols: { items: Item[] }[] });
                const chips = tools.slice(0, 4);
                const more = tools.length - chips.length;
                return (
                  <div key={nav} className={`${CARD} ${span === 2 ? "md:col-span-2" : "md:col-span-1"}`}>
                    <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={GLOW} />
                    <div className="relative flex h-full flex-col">
                      <div className="flex items-center gap-3">
                        <Icon i={nav} />
                        <h3 className="text-[18px] font-normal text-[color:var(--foreground)] sm:text-[20px]">{cat.label}</h3>
                        <span className="ml-auto text-[12px] text-[color:var(--faint)]">{tools.length} {c.tools}</span>
                      </div>
                      <div className="mt-5">
                        {visual === "thumbs" && <MiniThumbs />}
                        {visual === "extract" && <MiniExtract label={c.aiSummary} />}
                        {visual === "batch" && <MiniBatch />}
                        {visual === "secure" && <MiniSecure />}
                      </div>
                      <div className="mt-5 flex flex-wrap items-center gap-2">
                        {chips.map((t) => (
                          <a key={t.slug} href={path(t.slug)} className="rounded-full border border-[color:var(--line)] px-2.5 py-1 text-[12px] text-[color:var(--muted)] transition-colors hover:border-[color:var(--line-strong)] hover:text-[color:var(--foreground)]">{t.name}</a>
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
          <p className={EYEBROW(zh)}>{c.aiEyebrow}</p>
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
            <div className="mx-auto max-w-xl">
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
          <p className={EYEBROW(zh)}>{c.jobsEyebrow}</p>
          <h2 className={`mt-4 ${H2}`}>{c.jobsHeading}</h2>
          <Figure className="mt-10" glow="20%">
            <div className="grid gap-4 sm:grid-cols-2">
              {SCENARIOS.map((s) => {
                const t = locale === "zh" ? s.zh : locale === "es" ? s.es : locale === "pt" ? s.pt : locale === "fr" ? s.fr : s.en;
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
          <p className={EYEBROW(zh)}>{c.ctaEyebrow}</p>
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
