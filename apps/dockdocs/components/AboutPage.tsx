// About page — a trust-conversion page, not a feature list. It argues, by
// architecture, that your files never reach a server. Same design family as
// the homepage (components/Home.tsx): flat #171717, weight-400 headings, mono
// --faint eyebrows, border-only, dividers only at header/footer, theme tokens
// only (no rgba white-alpha → survives light mode; route is force-dark anyway).

type Locale = "en" | "zh" | "es" | "pt" | "fr";

const content = {
  en: {
    heroEyebrow: "// Why DockDocs exists",
    heroPre: "Your documents are nobody's business but ",
    heroAccent: "yours.",
    heroSub: "Most DockDocs tools run inside your browser. Your files never reach us — because they never leave you.",

    originEyebrow: "// Origin",
    originPre: "Every other PDF site asks you to upload first. We ",
    originAccent: "refused",
    originPost: " to build that.",
    originBody: "Compressing a contract or an ID shouldn't mean handing it to a stranger's cloud. So we built the opposite: the work happens on your machine, and the few tools that truly need a server say so before you start.",

    flowEyebrow: "// Where your file goes",
    flowHeading: "Where your file actually goes.",
    flowSub: "Left: the typical online tool. Right: DockDocs — for most tools the file never crosses the line.",
    flowDevice: "Your device",
    flowNet: "The internet",
    flowLegacy: "uploaded · stored · scanned",
    flowServers: "their servers",
    flowLocal: "processed in your browser",
    flowZero: "0 bytes uploaded",

    tableEyebrow: "// In plain terms",
    tableHeading: "What we do. What we never do.",
    doHead: "We do",
    neverHead: "We never",
    doRows: ["Process files in your browser", "Delete cloud temp-files immediately", "Label every cloud step up front", "Cite the source of every AI answer", "Let you start with no account"],
    neverRows: ["Store your documents", "Train our own models on your files", "Sell or share your data", "Email-to-cancel traps", "Hidden uploads"],

    statsEyebrow: "// The numbers that matter",
    statsHeading: "The numbers that matter are zeros.",
    stats: [
      { n: "0", l: "files stored for in-browser tools", z: true },
      { n: "0", l: "files used to train our own models", z: true },
      { n: "$0", l: "to start — no account", z: true },
      { n: "~50", l: "PDF & AI tools", z: false },
    ],

    cloudEyebrow: "// Honest about the cloud",
    cloudHeading: "When a tool does use the cloud, it says so.",
    cloudSub: "A few tools (Office conversion, big OCR, AI chat) need a server: labeled before you start, encrypted in transit, deleted right after. And the AI always cites the source line.",
    cloudSteps: ["labeled up front", "encrypted in transit", "processed", "copy deleted"],
    cloudNotKept: "not retained",
    aiSummary: "AI answer",
    aiCite: "source",

    valuesEyebrow: "// What we stand on",
    valuesHeading: "What we stand on.",
    values: [
      { t: "Privacy by architecture", b: "The default is local — not a setting you flip." },
      { t: "Your files, your device", b: "In-browser tools never upload, ever." },
      { t: "No dark patterns", b: "Cancel in two clicks. No email-to-cancel games." },
      { t: "Open about how it works", b: "Every cloud step and AI source is labeled." },
    ],

    ctaHeading: "Try a tool. No upload. No account.",
    ctaSub: "Open any tool and watch the network tab — for the in-browser ones, nothing leaves.",
    cta1: "Browse the tools", cta2: "See how privacy works",
  },
  zh: {
    heroEyebrow: "// DockDocs 为何存在",
    heroPre: "你的文档，",
    heroAccent: "只与你有关。",
    heroSub: "DockDocs 的大多数工具都在你的浏览器里运行。文件到不了我们这——因为它根本没离开你。",

    originEyebrow: "// 缘起",
    originPre: "别的 PDF 网站都要你先上传。我们",
    originAccent: "偏不",
    originPost: "这么做。",
    originBody: "压缩一份合同或证件，不该意味着把它交给陌生人的云端。于是我们反着做：处理发生在你的设备上，少数真正需要服务器的工具，会在你开始前明确说明。",

    flowEyebrow: "// 文件去了哪",
    flowHeading: "你的文件，到底去了哪。",
    flowSub: "左边是普通在线工具，右边是 DockDocs——大多数工具，文件从不越过这条线。",
    flowDevice: "你的设备",
    flowNet: "互联网",
    flowLegacy: "上传 · 存储 · 扫描",
    flowServers: "他们的服务器",
    flowLocal: "在浏览器内处理",
    flowZero: "0 字节上传",

    tableEyebrow: "// 直白地说",
    tableHeading: "我们做什么。我们绝不做什么。",
    doHead: "我们会",
    neverHead: "我们绝不",
    doRows: ["在你的浏览器里处理", "云端临时副本即刻删除", "云端步骤事先标注", "每个 AI 答案标注原文", "无需注册即可开始"],
    neverRows: ["存储你的文档", "用你的文件训练我们自己的模型", "出售或分享你的数据", "发邮件才能取消的套路", "隐藏的上传"],

    statsEyebrow: "// 真正重要的数字",
    statsHeading: "最重要的数字，是零。",
    stats: [
      { n: "0", l: "浏览器内工具不存储文件", z: true },
      { n: "0", l: "文件用于训练我们自己的模型", z: true },
      { n: "$0", l: "开始使用 — 无需注册", z: true },
      { n: "~50", l: "PDF 与 AI 工具", z: false },
    ],

    cloudEyebrow: "// 对云端坦诚",
    cloudHeading: "少数工具确实要用云端——它会明说。",
    cloudSub: "少数工具（Office 转换、大文件 OCR、AI 问答）需要服务器：开始前标注、传输加密、用完即删。而且 AI 永远标注原文出处。",
    cloudSteps: ["事先标注", "传输加密", "处理", "副本删除"],
    cloudNotKept: "不留存",
    aiSummary: "AI 答案",
    aiCite: "原文",

    valuesEyebrow: "// 我们坚持什么",
    valuesHeading: "我们坚持什么。",
    values: [
      { t: "架构即隐私", b: "默认本地处理，而非一个开关。" },
      { t: "你的文件，在你的设备上", b: "浏览器内工具从不上传。" },
      { t: "拒绝套路", b: "两次点击即可取消，没有发邮件套路。" },
      { t: "公开运作方式", b: "每个云端步骤、每处 AI 出处都标注。" },
    ],

    ctaHeading: "试用一个工具。无上传。无需注册。",
    ctaSub: "打开任意工具，盯着网络面板看——浏览器内的工具，什么都不会发出去。",
    cta1: "浏览全部工具", cta2: "看隐私怎么做到",
  },
  es: {
    heroEyebrow: "// Por qué existe DockDocs",
    heroPre: "Tus documentos no son asunto de nadie más que ",
    heroAccent: "tuyo.",
    heroSub: "La mayoría de las herramientas de DockDocs funcionan dentro de tu navegador. Tus archivos nunca llegan a nosotros, porque nunca salen de ti.",

    originEyebrow: "// Origen",
    originPre: "Las demás webs de PDF te piden subir el archivo primero. Nosotros nos ",
    originAccent: "negamos",
    originPost: " a construir eso.",
    originBody: "Comprimir un contrato o un documento de identidad no debería significar entregárselo a la nube de un desconocido. Por eso hicimos lo contrario: el trabajo ocurre en tu equipo, y las pocas herramientas que de verdad necesitan un servidor lo advierten antes de empezar.",

    flowEyebrow: "// Adónde va tu archivo",
    flowHeading: "Adónde va realmente tu archivo.",
    flowSub: "Izquierda: la típica herramienta en línea. Derecha: DockDocs, donde en la mayoría de las herramientas el archivo nunca cruza la línea.",
    flowDevice: "Tu dispositivo",
    flowNet: "Internet",
    flowLegacy: "subido · almacenado · escaneado",
    flowServers: "sus servidores",
    flowLocal: "procesado en tu navegador",
    flowZero: "0 bytes subidos",

    tableEyebrow: "// En pocas palabras",
    tableHeading: "Lo que hacemos. Lo que nunca hacemos.",
    doHead: "Sí hacemos",
    neverHead: "Nunca hacemos",
    doRows: ["Procesar archivos en tu navegador", "Borrar al instante los temporales en la nube", "Señalar cada paso en la nube por adelantado", "Citar la fuente de cada respuesta de IA", "Dejarte empezar sin crear cuenta"],
    neverRows: ["Almacenar tus documentos", "Entrenar nuestros propios modelos con tus archivos", "Vender o compartir tus datos", "Trampas de cancelación por correo", "Subidas ocultas"],

    statsEyebrow: "// Los números que importan",
    statsHeading: "Los números que importan son ceros.",
    stats: [
      { n: "0", l: "archivos guardados en herramientas del navegador", z: true },
      { n: "0", l: "archivos usados para entrenar nuestros propios modelos", z: true },
      { n: "$0", l: "para empezar, sin cuenta", z: true },
      { n: "~50", l: "herramientas de PDF e IA", z: false },
    ],

    cloudEyebrow: "// Sinceros sobre la nube",
    cloudHeading: "Cuando una herramienta sí usa la nube, lo dice.",
    cloudSub: "Algunas herramientas (conversión de Office, OCR grande, chat con IA) necesitan un servidor: se avisa antes de empezar, va cifrado en tránsito y se borra justo después. Y la IA siempre cita la línea de origen.",
    cloudSteps: ["avisado por adelantado", "cifrado en tránsito", "procesado", "copia borrada"],
    cloudNotKept: "no se conserva",
    aiSummary: "respuesta de IA",
    aiCite: "fuente",

    valuesEyebrow: "// En lo que nos apoyamos",
    valuesHeading: "En lo que nos apoyamos.",
    values: [
      { t: "Privacidad por arquitectura", b: "Lo local es lo predeterminado, no una opción que activas." },
      { t: "Tus archivos, tu dispositivo", b: "Las herramientas del navegador nunca suben nada, jamás." },
      { t: "Sin trucos engañosos", b: "Cancela en dos clics. Nada de cancelar por correo." },
      { t: "Claros sobre cómo funciona", b: "Cada paso en la nube y cada fuente de IA llevan etiqueta." },
    ],

    ctaHeading: "Prueba una herramienta. Sin subir nada. Sin cuenta.",
    ctaSub: "Abre cualquier herramienta y mira la pestaña de red: con las del navegador, nada sale.",
    cta1: "Explorar las herramientas", cta2: "Ver cómo funciona la privacidad",
  },
  pt: {
    heroEyebrow: "// Por que o DockDocs existe",
    heroPre: "Seus documentos não são assunto de mais ninguém além de ",
    heroAccent: "você.",
    heroSub: "A maioria das ferramentas do DockDocs roda dentro do seu navegador. Seus arquivos nunca chegam até nós — porque nunca saem de você.",

    originEyebrow: "// Origem",
    originPre: "Todos os outros sites de PDF pedem para você enviar o arquivo primeiro. Nós nos ",
    originAccent: "recusamos",
    originPost: " a construir isso.",
    originBody: "Comprimir um contrato ou um documento de identidade não deveria significar entregá-lo à nuvem de um estranho. Por isso fizemos o oposto: o processamento acontece na sua máquina, e as poucas ferramentas que realmente precisam de um servidor avisam antes de você começar.",

    flowEyebrow: "// Para onde vai seu arquivo",
    flowHeading: "Para onde seu arquivo realmente vai.",
    flowSub: "Esquerda: a ferramenta online típica. Direita: DockDocs — na maioria das ferramentas o arquivo nunca cruza a linha.",
    flowDevice: "Seu dispositivo",
    flowNet: "A internet",
    flowLegacy: "enviado · armazenado · escaneado",
    flowServers: "servidores deles",
    flowLocal: "processado no seu navegador",
    flowZero: "0 bytes enviados",

    tableEyebrow: "// Em termos claros",
    tableHeading: "O que fazemos. O que jamais fazemos.",
    doHead: "Fazemos",
    neverHead: "Jamais fazemos",
    doRows: ["Processar arquivos no seu navegador", "Excluir temporários na nuvem imediatamente", "Indicar cada etapa na nuvem com antecedência", "Citar a fonte de cada resposta de IA", "Deixar você começar sem criar conta"],
    neverRows: ["Armazenar seus documentos", "Treinar nossos próprios modelos com seus arquivos", "Vender ou compartilhar seus dados", "Armadilhas de cancelamento por e-mail", "Envios ocultos"],

    statsEyebrow: "// Os números que importam",
    statsHeading: "Os números que importam são zeros.",
    stats: [
      { n: "0", l: "arquivos armazenados em ferramentas do navegador", z: true },
      { n: "0", l: "arquivos usados para treinar nossos próprios modelos", z: true },
      { n: "$0", l: "para começar — sem conta", z: true },
      { n: "~50", l: "ferramentas de PDF e IA", z: false },
    ],

    cloudEyebrow: "// Honestos sobre a nuvem",
    cloudHeading: "Quando uma ferramenta usa a nuvem, ela avisa.",
    cloudSub: "Algumas ferramentas (conversão do Office, OCR grande, chat com IA) precisam de um servidor: avisado antes de começar, criptografado em trânsito e excluído logo após. E a IA sempre cita a linha de origem.",
    cloudSteps: ["avisado com antecedência", "criptografado em trânsito", "processado", "cópia excluída"],
    cloudNotKept: "não retido",
    aiSummary: "resposta de IA",
    aiCite: "fonte",

    valuesEyebrow: "// No que nos apoiamos",
    valuesHeading: "No que nos apoiamos.",
    values: [
      { t: "Privacidade por arquitetura", b: "O padrão é local — não uma configuração que você ativa." },
      { t: "Seus arquivos, seu dispositivo", b: "Ferramentas do navegador nunca enviam nada, jamais." },
      { t: "Sem padrões obscuros", b: "Cancele em dois cliques. Nada de cancelar por e-mail." },
      { t: "Transparentes sobre como funciona", b: "Cada etapa na nuvem e cada fonte de IA são identificadas." },
    ],

    ctaHeading: "Experimente uma ferramenta. Sem envio. Sem conta.",
    ctaSub: "Abra qualquer ferramenta e observe a aba de rede — nas ferramentas do navegador, nada sai.",
    cta1: "Explorar as ferramentas", cta2: "Ver como a privacidade funciona",
  },
  fr: {
    heroEyebrow: "// Pourquoi DockDocs existe",
    heroPre: "Vos documents ne regardent personne d'autre que ",
    heroAccent: "vous.",
    heroSub: "La plupart des outils DockDocs s'exécutent dans votre navigateur. Vos fichiers ne nous parviennent jamais — parce qu'ils ne vous quittent jamais.",

    originEyebrow: "// Origine",
    originPre: "Tous les autres sites PDF vous demandent d'abord d'envoyer le fichier. Nous avons ",
    originAccent: "refusé",
    originPost: " de construire ça.",
    originBody: "Compresser un contrat ou une pièce d'identité ne devrait pas signifier la confier au cloud de quelqu'un d'autre. Nous avons donc fait le contraire : le traitement s'effectue sur votre machine, et les rares outils qui ont vraiment besoin d'un serveur vous le signalent avant que vous commenciez.",

    flowEyebrow: "// Où va votre fichier",
    flowHeading: "Où va vraiment votre fichier.",
    flowSub: "À gauche : l'outil en ligne typique. À droite : DockDocs — dans la plupart des outils, le fichier ne franchit jamais la ligne.",
    flowDevice: "Votre appareil",
    flowNet: "Internet",
    flowLegacy: "envoyé · stocké · analysé",
    flowServers: "leurs serveurs",
    flowLocal: "traité dans votre navigateur",
    flowZero: "0 octet envoyé",

    tableEyebrow: "// En termes clairs",
    tableHeading: "Ce que nous faisons. Ce que nous ne faisons jamais.",
    doHead: "Nous faisons",
    neverHead: "Nous ne faisons jamais",
    doRows: ["Traiter les fichiers dans votre navigateur", "Supprimer immédiatement les temporaires cloud", "Signaler chaque étape cloud à l'avance", "Citer la source de chaque réponse IA", "Vous laisser commencer sans compte"],
    neverRows: ["Stocker vos documents", "Entraîner nos propres modèles avec vos fichiers", "Vendre ou partager vos données", "Pièges de désabonnement par e-mail", "Envois cachés"],

    statsEyebrow: "// Les chiffres qui comptent",
    statsHeading: "Les chiffres qui comptent sont des zéros.",
    stats: [
      { n: "0", l: "fichiers stockés dans les outils navigateur", z: true },
      { n: "0", l: "fichiers utilisés pour entraîner nos propres modèles", z: true },
      { n: "0 €", l: "pour commencer — sans compte", z: true },
      { n: "~50", l: "outils PDF et IA", z: false },
    ],

    cloudEyebrow: "// Honnêtes sur le cloud",
    cloudHeading: "Quand un outil utilise le cloud, il vous le dit.",
    cloudSub: "Certains outils (conversion Office, OCR volumineuse, chat IA) ont besoin d'un serveur : signalé avant de commencer, chiffré en transit et supprimé juste après. Et l'IA cite toujours la ligne source.",
    cloudSteps: ["signalé à l'avance", "chiffré en transit", "traité", "copie supprimée"],
    cloudNotKept: "non conservé",
    aiSummary: "réponse IA",
    aiCite: "source",

    valuesEyebrow: "// Ce sur quoi nous nous appuyons",
    valuesHeading: "Ce sur quoi nous nous appuyons.",
    values: [
      { t: "Confidentialité par architecture", b: "Le traitement local est la valeur par défaut — pas un paramètre à activer." },
      { t: "Vos fichiers, votre appareil", b: "Les outils navigateur n'envoient jamais rien, jamais." },
      { t: "Aucun dark pattern", b: "Annulez en deux clics. Pas de désabonnement par e-mail." },
      { t: "Transparents sur le fonctionnement", b: "Chaque étape cloud et chaque source IA sont identifiées." },
    ],

    ctaHeading: "Essayez un outil. Sans envoi. Sans compte.",
    ctaSub: "Ouvrez n'importe quel outil et regardez l'onglet réseau — avec les outils navigateur, rien ne sort.",
    cta1: "Explorer les outils", cta2: "Voir comment fonctionne la confidentialité",
  },
} as const;

const Check = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0 text-[color:var(--accent)]"><path d="M3 8.5l3.2 3.2L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const Dash = () => <span className="mt-0.5 shrink-0 text-[color:var(--faint)]">—</span>;

const VALUE_ICONS = [
  <path key="0" d="M5 11V8a4 4 0 1 1 8 0v3 M4 11h10v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6Z" />,
  <path key="1" d="M4 6h10v7H4z M7 16h4 M9 13v3" />,
  <path key="2" d="M2 9s2.5-4 7-4 7 4 7 4-2.5 4-7 4-7-4-7-4Z M9 7v0 M3 3l12 12" />,
  <path key="3" d="M6 5 2 9l4 4 M12 5l4 4-4 4" />,
];

export function AboutPage({ locale = "en" }: { locale?: Locale }) {
  const zh = locale === "zh";
  const c = content[locale] ?? content.en;
  const eyebrow = `font-mono text-[12px] text-[color:var(--faint)] ${zh ? "" : "uppercase tracking-[0.08em]"}`;
  const h2 = "text-[28px] font-normal leading-[1.15] tracking-[-0.02em] text-[color:var(--foreground)] sm:text-[36px]";
  const path = (slug: string) => (locale === "zh" ? `/zh${slug}` : locale === "es" ? `/es${slug}` : locale === "pt" ? `/pt${slug}` : locale === "fr" ? `/fr${slug}` : slug);

  return (
    <main>
      <style>{`
        @keyframes abFlow{to{stroke-dashoffset:-28}}
        .ab-flow{stroke-dasharray:1 9;stroke-linecap:round;animation:abFlow 1.4s linear infinite}
        @media (prefers-reduced-motion: reduce){.ab-flow{animation:none}}
      `}</style>

      {/* 1 ── Manifesto hero (the only top hairline) ── */}
      <section className="border-b border-[color:var(--line)]">
        <div className="mx-auto max-w-3xl px-5 pb-20 pt-24 text-center sm:px-6 sm:pb-28 sm:pt-32">
          <p className={eyebrow}>{c.heroEyebrow}</p>
          <h1 className="mt-5 text-[36px] font-normal leading-[1.05] tracking-[-0.03em] text-[color:var(--foreground)] sm:text-[54px] lg:text-[64px]">
            {c.heroPre}<span className="text-[color:var(--accent)]">{c.heroAccent}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-[16px] leading-[1.6] text-[color:var(--muted)]">{c.heroSub}</p>
        </div>
      </section>

      {/* 2 ── Origin ── */}
      <section>
        <div className="mx-auto grid max-w-5xl gap-10 px-5 py-20 sm:px-6 sm:py-28 lg:grid-cols-[320px_1fr] lg:px-8">
          <div>
            <p className={eyebrow}>{c.originEyebrow}</p>
            <h2 className={`mt-4 ${h2}`}>{c.originPre}<span className="text-[color:var(--accent)]">{c.originAccent}</span>{c.originPost}</h2>
          </div>
          <p className="self-end text-[16px] leading-[1.7] text-[color:var(--muted)]">{c.originBody}</p>
        </div>
      </section>

      {/* 3 ── Data-flow centerpiece ── */}
      <section>
        <div className="mx-auto max-w-5xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">
          <p className={eyebrow}>{c.flowEyebrow}</p>
          <h2 className={`mt-4 ${h2}`}>{c.flowHeading}</h2>
          <p className="mt-4 max-w-2xl text-[16px] leading-[1.6] text-[color:var(--muted)]">{c.flowSub}</p>

          <div className="mt-8 overflow-hidden rounded-2xl border border-[color:var(--line)] p-4 sm:p-8">
            <svg viewBox="0 0 920 300" className="w-full" role="img" aria-label={c.flowHeading}>
              {/* boundary */}
              <line x1="560" y1="40" x2="560" y2="260" style={{ stroke: "var(--line-strong)" }} strokeWidth="1.5" strokeDasharray="3 6" />
              <text x="280" y="32" textAnchor="middle" className="font-mono text-[13px]" style={{ fill: "var(--faint)" }}>{c.flowDevice}</text>
              <text x="745" y="32" textAnchor="middle" className="font-mono text-[13px]" style={{ fill: "var(--faint)" }}>{c.flowNet}</text>

              {/* legacy lane — file crosses to a server */}
              <g className="text-[color:var(--faint)]" style={{ color: "var(--faint)" }} stroke="currentColor" fill="none" strokeWidth="1.6">
                <rect x="70" y="92" width="74" height="52" rx="7" />
                <line x1="70" y1="108" x2="144" y2="108" />
                <circle cx="80" cy="100" r="1.6" fill="currentColor" />
                <line x1="150" y1="118" x2="692" y2="118" />
                <path d="M690 112l12 6-12 6z" fill="currentColor" stroke="none" />
                <rect x="700" y="96" width="64" height="46" rx="5" />
                <line x1="712" y1="110" x2="752" y2="110" /><line x1="712" y1="120" x2="752" y2="120" /><line x1="712" y1="130" x2="752" y2="130" />
                <text x="420" y="150" textAnchor="middle" fill="currentColor" stroke="none" className="font-mono text-[12px]">{c.flowLegacy}</text>
                <text x="732" y="164" textAnchor="middle" fill="currentColor" stroke="none" className="text-[12px]">{c.flowServers}</text>
                <line x1="694" y1="159" x2="770" y2="159" strokeWidth="1.4" />
              </g>

              {/* dockdocs lane — file loops back, never crosses */}
              <g style={{ color: "var(--accent)" }} stroke="currentColor" fill="none" strokeWidth="1.8">
                <rect x="70" y="206" width="74" height="52" rx="7" />
                <line x1="70" y1="222" x2="144" y2="222" />
                <circle cx="80" cy="214" r="1.6" fill="currentColor" />
                {/* return-loop: file goes out a little, comes right back to the device — never crosses */}
                <path d="M148 234H246a18 18 0 0 0 0-36H148" />
                <path d="M148 198l13-6v12z" fill="currentColor" stroke="none" />
                <path className="ab-flow" d="M148 234H246a18 18 0 0 0 0-36H148" strokeWidth="2.4" />
                <text x="300" y="206" fill="currentColor" stroke="none" className="font-mono text-[12px]">{c.flowLocal}</text>
                {/* 0 bytes pill */}
                <rect x="300" y="218" width="150" height="26" rx="13" strokeWidth="1.4" />
                <text x="375" y="235" textAnchor="middle" fill="currentColor" stroke="none" className="text-[12px]">{c.flowZero}</text>
              </g>
            </svg>
          </div>
        </div>
      </section>

      {/* 4 ── Do / Never table ── */}
      <section>
        <div className="mx-auto max-w-5xl px-5 py-20 sm:px-6 sm:py-28 lg:px-8">
          <p className={eyebrow}>{c.tableEyebrow}</p>
          <h2 className={`mt-4 ${h2}`}>{c.tableHeading}</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[color:var(--line)] p-6" style={{ borderLeft: "2px solid var(--accent)" }}>
              <div className="mb-4 flex items-center gap-2"><Check /><span className="text-[15px] font-normal text-[color:var(--foreground)]">{c.doHead}</span></div>
              <ul className="space-y-2.5">
                {c.doRows.map((r) => <li key={r} className="flex items-start gap-2.5 text-[14px] leading-[1.5] text-[color:var(--foreground)]"><Check /><span>{r}</span></li>)}
              </ul>
            </div>
            <div className="rounded-2xl border border-[color:var(--line)] p-6">
              <div className="mb-4 flex items-center gap-2"><Dash /><span className="text-[15px] font-normal text-[color:var(--muted)]">{c.neverHead}</span></div>
              <ul className="space-y-2.5">
                {c.neverRows.map((r) => <li key={r} className="flex items-start gap-2.5 text-[14px] leading-[1.5] text-[color:var(--muted)]"><Dash /><span>{r}</span></li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5 ── Zero stat band ── */}
      <section className="border-y border-[color:var(--line)]">
        <div className="mx-auto max-w-5xl px-5 py-20 sm:px-6 sm:py-24 lg:px-8">
          <p className={`${eyebrow} text-center`}>{c.statsEyebrow}</p>
          <h2 className={`mt-3 text-center ${h2}`}>{c.statsHeading}</h2>
          <div className="mt-12 grid grid-cols-2 gap-y-10 md:grid-cols-4">
            {c.stats.map((s) => (
              <div key={s.l} className="text-center">
                <div className={`text-[40px] font-normal tracking-[-0.02em] md:text-[60px] ${s.z ? "text-[color:var(--accent)]" : "text-[color:var(--foreground)]"}`}>{s.n}</div>
                <div className="mx-auto mt-2 max-w-[160px] font-mono text-[12px] leading-[1.4] text-[color:var(--faint)]">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6 ── Honest about the cloud + cited AI ── */}
      <section>
        <div className="mx-auto max-w-5xl px-5 py-20 sm:px-6 sm:py-28 lg:px-8">
          <p className={eyebrow}>{c.cloudEyebrow}</p>
          <h2 className={`mt-4 max-w-2xl ${h2}`}>{c.cloudHeading}</h2>
          <p className="mt-4 max-w-2xl text-[16px] leading-[1.6] text-[color:var(--muted)]">{c.cloudSub}</p>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {/* cloud lifecycle */}
            <div className="rounded-2xl border border-[color:var(--line)] p-6">
              <ol className="space-y-4">
                {c.cloudSteps.map((step, i) => {
                  const last = i === c.cloudSteps.length - 1;
                  return (
                    <li key={step} className="flex items-center gap-3">
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-[11px] ${last ? "border-[color:var(--accent)] text-[color:var(--accent)]" : "border-[color:var(--line)] text-[color:var(--faint)]"}`}>{`0${i + 1}`}</span>
                      <span className="text-[14px] text-[color:var(--foreground)]">{step}</span>
                      {last && <span className="ml-auto rounded-full border border-[color:var(--line)] px-2 py-0.5 text-[11px] text-[color:var(--accent)]">{c.cloudNotKept}</span>}
                    </li>
                  );
                })}
              </ol>
            </div>
            {/* traceable AI */}
            <div className="rounded-2xl border border-[color:var(--line)] p-6">
              <div className="flex items-stretch gap-3">
                <div className="flex w-[36%] flex-col gap-1.5 rounded-lg border border-[color:var(--line)] p-3">
                  {[80, 60, 70, 50, 65].map((w, i) => <span key={i} className="h-[3px] rounded-full" style={{ width: `${w}%`, background: i === 2 ? "var(--accent)" : "var(--skeleton)" }} />)}
                </div>
                <div className="flex items-center text-[color:var(--accent)]"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
                <div className="flex-1 rounded-lg border border-[color:var(--line)] p-3">
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--faint)]">{c.aiSummary}</p>
                  <div className="flex items-center gap-1.5 text-[12px] text-[color:var(--foreground)]">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--accent)]" />
                    <span className="h-[3px] flex-1 rounded-full bg-[color:var(--skeleton)]" />
                    <span className="rounded border border-[color:var(--line)] px-1.5 py-0.5 text-[9px] text-[color:var(--accent)]">{c.aiCite}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7 ── Values ── */}
      <section>
        <div className="mx-auto max-w-5xl px-5 py-20 sm:px-6 sm:py-28 lg:px-8">
          <p className={eyebrow}>{c.valuesEyebrow}</p>
          <h2 className={`mt-4 ${h2}`}>{c.valuesHeading}</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {c.values.map((v, i) => (
              <div key={v.t} className="rounded-2xl border border-[color:var(--line)] p-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[color:var(--line)] text-[color:var(--accent)]">
                  <svg viewBox="0 0 20 20" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{VALUE_ICONS[i]}</svg>
                </span>
                <p className="mt-4 font-mono text-[11px] text-[color:var(--faint)]">{`0${i + 1}`}</p>
                <p className="mt-1.5 text-[16px] font-normal text-[color:var(--foreground)]">{v.t}</p>
                <p className="mt-2 text-[14px] leading-[1.5] text-[color:var(--muted)]">{v.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8 ── Soft CTA (bottom hairline owned by footer) ── */}
      <section>
        <div className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-6 sm:py-32">
          <h2 className="text-[28px] font-normal leading-[1.1] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[40px]">{c.ctaHeading}</h2>
          <p className="mx-auto mt-4 max-w-xl text-[16px] leading-[1.55] text-[color:var(--muted)]">{c.ctaSub}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href={path("/sitemap")} className="inline-flex h-11 items-center justify-center rounded-full bg-[color:var(--accent)] px-6 text-[14px] font-medium transition hover:bg-[color:var(--accent-hover)]">{c.cta1}</a>
            <a href={path("/privacy-policy")} className="inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--line-strong)] px-6 text-[14px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--foreground)]">{c.cta2}</a>
          </div>
        </div>
      </section>
    </main>
  );
}
