// About page — a trust-conversion page, not a feature list. It argues, by
// architecture, that your files never reach a server. Same design family as
// the homepage (components/Home.tsx): flat #171717, weight-400 headings, mono
// --faint eyebrows. v2: uniform LEFT-aligned sections, one substantial figure
// per section wrapped in the shared <Figure> depth treatment, the file-flow
// diagram rebuilt as the star, and a "Don't trust us — press F12" proof section.
// All factual claims are verifiable; the only numbers are 0 / 0 / $0 / ~50.

import type { ReactNode } from "react";

type Locale = "en" | "zh" | "es" | "pt" | "fr";

const content = {
  en: {
    heroEyebrow: "// About DockDocs",
    heroPre: "Your documents are nobody's business but ",
    heroAccent: "yours.",
    heroSub: "Most DockDocs tools run entirely inside your browser — your files never reach us because they never leave you. Local is the default, not a setting you flip.",
    heroCaption: "Fig 0.1 — your file, and where it stays.",

    flowEyebrow: "// Follow the file",
    flowHeading: "Where your file actually goes.",
    flowSub: "For most tools, the work happens on your machine — and the file never crosses the line.",
    flowDevice: "Your device",
    flowNet: "The internet",
    flowServers: "their servers",
    flowZero: "0 bytes uploaded",
    flowLeaves: "leaves your device",
    flowNoCross: "nothing crosses this line",
    flowWouldGo: "where your file would normally go",
    flowStays: "stays on your machine",
    flowCaption: "Fig 0.2 — for most tools, your file never crosses the boundary.",

    proofEyebrow: "// Don't take our word for it",
    proofHeading: "Don't trust us. Press F12.",
    proofSub: "Open your browser's Network tab and run an in-browser tool — you'll see zero uploads. Turn your Wi-Fi off; it still works.",
    proofZero: "0 requests · 0 B transferred",
    proofOffline: "Works with Wi-Fi off.",
    proofCallout: "this is the whole proof",
    proofCaption: "Fig 0.3 — a real in-browser tool, captured live. Nothing leaves.",

    tableEyebrow: "// In plain terms",
    tableHeading: "What we do. What we never do.",
    tableSub: "No fine print. The left list is the whole product; the right list is everything we refuse to do.",
    doHead: "We do",
    neverHead: "We never",
    doRows: ["Process files in your browser", "Delete cloud temp-files immediately", "Label every cloud step up front", "Cite the source of every AI answer", "Let you start with no account"],
    neverRows: ["Store your documents", "Train our own models on your files", "Sell or share your data", "Email-to-cancel traps", "Hidden uploads"],
    tableCaption: "Fig 0.4 — the deal, in full.",

    cloudEyebrow: "// Honest about the cloud",
    cloudHeading: "When a tool does use the cloud, it says so.",
    cloudSub: "A few tools (Office conversion, big OCR, AI chat) need a server: labeled before you start, encrypted in transit, deleted right after. When the AI answers a question or flags a finding, it shows the exact passage behind it — quoted from your file and verified to be there — and tells you when something can't be traced, instead of inventing a source.",
    cloudSteps: ["labeled up front", "encrypted in transit", "processed", "copy deleted"],
    cloudNotKept: "not retained",
    aiSummary: "AI answer",
    aiCite: "source",
    cloudCaption: "Fig 0.5 — cloud steps are labeled and deleted; AI answers are traceable.",

    statsEyebrow: "// The numbers that matter",
    statsHeading: "The numbers that matter are zeros.",
    statsSub: "Built independently — funded by the people who use it, not investors. No pressure to harvest data or chase growth at any cost.",
    stats: [
      { n: "0", l: "files stored for in-browser tools", z: true },
      { n: "0", l: "files used to train our own models", z: true },
      { n: "$0", l: "to start — no account", z: true },
      { n: "~50", l: "PDF & AI tools", z: false },
    ],
    relPoints: [
      { t: "Payments", b: "Creem, a licensed Merchant of Record — we never see your card." },
      { t: "Refunds", b: "7-day money-back, cancel anytime." },
      { t: "No lock-in", b: "Your data is yours; export anytime." },
      { t: "Anti-fragile", b: "In-browser tools always ran on your machine — never held hostage." },
    ],
    statsCaption: "Fig 0.6 — what we store, what we charge, and who we answer to.",

    ctaEyebrow: "// Try it",
    ctaHeading: "Try a tool. No upload. No account.",
    ctaSub: "Open any tool and watch the network tab — for the in-browser ones, nothing leaves.",
    cta1: "Browse the tools", cta2: "See how privacy works",
  },
  zh: {
    heroEyebrow: "// 关于 DockDocs",
    heroPre: "你的文档，",
    heroAccent: "只与你有关。",
    heroSub: "DockDocs 的大多数工具完全在你的浏览器里运行——文件到不了我们这，因为它根本没离开你。本地处理是默认，而不是一个要你去打开的开关。",
    heroCaption: "图 0.1 — 你的文件，以及它留在哪。",

    flowEyebrow: "// 跟着文件走",
    flowHeading: "你的文件，到底去了哪。",
    flowSub: "大多数工具，处理都发生在你的设备上——文件从不越过这条线。",
    flowDevice: "你的设备",
    flowNet: "互联网",
    flowServers: "他们的服务器",
    flowZero: "0 字节上传",
    flowLeaves: "离开你的设备",
    flowNoCross: "没有东西越过这条线",
    flowWouldGo: "你的文件通常会去的地方",
    flowStays: "留在你的机器上",
    flowCaption: "图 0.2 — 多数工具，你的文件从不越过边界。",

    proofEyebrow: "// 别只听我们说",
    proofHeading: "别信我们。按 F12。",
    proofSub: "打开浏览器的「网络」面板，跑一个浏览器内工具——你会看到零上传。关掉 Wi-Fi，它照样能用。",
    proofZero: "0 个请求 · 0 B 传输",
    proofOffline: "断网也能用。",
    proofCallout: "这就是全部证明",
    proofCaption: "图 0.3 — 一个真实的浏览器内工具，实时捕获。什么都没发出去。",

    tableEyebrow: "// 直白地说",
    tableHeading: "我们做什么。我们绝不做什么。",
    tableSub: "没有小字条款。左边这列就是产品的全部；右边这列是我们拒绝做的一切。",
    doHead: "我们会",
    neverHead: "我们绝不",
    doRows: ["在你的浏览器里处理", "云端临时副本即刻删除", "云端步骤事先标注", "每个 AI 答案标注原文", "无需注册即可开始"],
    neverRows: ["存储你的文档", "用你的文件训练我们自己的模型", "出售或分享你的数据", "发邮件才能取消的套路", "隐藏的上传"],
    tableCaption: "图 0.4 — 完整的约定。",

    cloudEyebrow: "// 对云端坦诚",
    cloudHeading: "少数工具确实要用云端——它会明说。",
    cloudSub: "少数工具（Office 转换、大文件 OCR、AI 问答）需要服务器：开始前标注、传输加密、用完即删。AI 回答问题或标出某项发现时，会把支撑它的原文原句展示给你——从你的文件里逐字引用、并核实确实在文中——若有内容无法溯源，它会如实说明，而不是编造一个出处。",
    cloudSteps: ["事先标注", "传输加密", "处理", "副本删除"],
    cloudNotKept: "不留存",
    aiSummary: "AI 答案",
    aiCite: "原文",
    cloudCaption: "图 0.5 — 云端步骤会标注并删除；AI 答案可溯源。",

    statsEyebrow: "// 真正重要的数字",
    statsHeading: "最重要的数字，是零。",
    statsSub: "独立打造——靠使用它的人养活，而不是投资人。没有人逼我们榨取数据或不计代价地增长。",
    stats: [
      { n: "0", l: "浏览器内工具不存储文件", z: true },
      { n: "0", l: "文件用于训练我们自己的模型", z: true },
      { n: "$0", l: "开始使用 — 无需注册", z: true },
      { n: "~50", l: "PDF 与 AI 工具", z: false },
    ],
    relPoints: [
      { t: "付款", b: "由持牌 Merchant of Record Creem 处理——我们看不到你的卡。" },
      { t: "退款", b: "7 天无理由退款，随时取消。" },
      { t: "无锁定", b: "你的数据是你的，随时导出。" },
      { t: "反脆弱", b: "浏览器内工具一直跑在你的机器上——从不被扣作人质。" },
    ],
    statsCaption: "图 0.6 — 我们存什么、收什么、对谁负责。",

    ctaEyebrow: "// 试试看",
    ctaHeading: "试用一个工具。无上传。无需注册。",
    ctaSub: "打开任意工具，盯着网络面板看——浏览器内的工具，什么都不会发出去。",
    cta1: "浏览全部工具", cta2: "看隐私怎么做到",
  },
  es: {
    heroEyebrow: "// Acerca de DockDocs",
    heroPre: "Tus documentos no son asunto de nadie más que ",
    heroAccent: "tuyo.",
    heroSub: "La mayoría de las herramientas de DockDocs funcionan por completo en tu navegador: tus archivos nunca llegan a nosotros porque nunca salen de ti. Lo local es lo predeterminado, no una opción que activas.",
    heroCaption: "Fig 0.1 — tu archivo, y dónde se queda.",

    flowEyebrow: "// Sigue el archivo",
    flowHeading: "Adónde va realmente tu archivo.",
    flowSub: "En la mayoría de las herramientas, el trabajo ocurre en tu equipo, y el archivo nunca cruza la línea.",
    flowDevice: "Tu dispositivo",
    flowNet: "Internet",
    flowServers: "sus servidores",
    flowZero: "0 bytes subidos",
    flowLeaves: "sale de tu dispositivo",
    flowNoCross: "nada cruza esta línea",
    flowWouldGo: "adonde normalmente iría tu archivo",
    flowStays: "se queda en tu equipo",
    flowCaption: "Fig 0.2 — en la mayoría de herramientas, tu archivo nunca cruza el límite.",

    proofEyebrow: "// No nos creas sin más",
    proofHeading: "No confíes en nosotros. Pulsa F12.",
    proofSub: "Abre la pestaña de Red del navegador y usa una herramienta del navegador: verás cero subidas. Apaga el Wi-Fi; sigue funcionando.",
    proofZero: "0 solicitudes · 0 B transferidos",
    proofOffline: "Funciona sin Wi-Fi.",
    proofCallout: "esta es toda la prueba",
    proofCaption: "Fig 0.3 — una herramienta del navegador real, capturada en vivo. Nada sale.",

    tableEyebrow: "// En pocas palabras",
    tableHeading: "Lo que hacemos. Lo que nunca hacemos.",
    tableSub: "Sin letra pequeña. La lista de la izquierda es todo el producto; la de la derecha es todo lo que nos negamos a hacer.",
    doHead: "Sí hacemos",
    neverHead: "Nunca hacemos",
    doRows: ["Procesar archivos en tu navegador", "Borrar al instante los temporales en la nube", "Señalar cada paso en la nube por adelantado", "Citar la fuente de cada respuesta de IA", "Dejarte empezar sin crear cuenta"],
    neverRows: ["Almacenar tus documentos", "Entrenar nuestros propios modelos con tus archivos", "Vender o compartir tus datos", "Trampas de cancelación por correo", "Subidas ocultas"],
    tableCaption: "Fig 0.4 — el trato, completo.",

    cloudEyebrow: "// Sinceros sobre la nube",
    cloudHeading: "Cuando una herramienta sí usa la nube, lo dice.",
    cloudSub: "Algunas herramientas (conversión de Office, OCR grande, chat con IA) necesitan un servidor: avisado antes de empezar, cifrado en tránsito y borrado justo después. Cuando la IA responde una pregunta o señala un hallazgo, te muestra el pasaje exacto que lo respalda —citado de tu archivo y comprobado que está realmente ahí— y te avisa cuando algo no se puede rastrear, en lugar de inventarse una fuente.",
    cloudSteps: ["avisado por adelantado", "cifrado en tránsito", "procesado", "copia borrada"],
    cloudNotKept: "no se conserva",
    aiSummary: "respuesta de IA",
    aiCite: "fuente",
    cloudCaption: "Fig 0.5 — los pasos en la nube se señalan y se borran; las respuestas de IA son rastreables.",

    statsEyebrow: "// Los números que importan",
    statsHeading: "Los números que importan son ceros.",
    statsSub: "Construido de forma independiente — financiado por quienes lo usan, no por inversores. Sin presión por recolectar datos ni por crecer a cualquier precio.",
    stats: [
      { n: "0", l: "archivos guardados en herramientas del navegador", z: true },
      { n: "0", l: "archivos usados para entrenar nuestros propios modelos", z: true },
      { n: "$0", l: "para empezar, sin cuenta", z: true },
      { n: "~50", l: "herramientas de PDF e IA", z: false },
    ],
    relPoints: [
      { t: "Pagos", b: "Creem, un Merchant of Record con licencia — nunca vemos tu tarjeta." },
      { t: "Reembolsos", b: "Devolución en 7 días, cancela cuando quieras." },
      { t: "Sin bloqueo", b: "Tus datos son tuyos; expórtalos cuando quieras." },
      { t: "Antifrágil", b: "Las herramientas del navegador siempre se ejecutaron en tu equipo, nunca retenidas." },
    ],
    statsCaption: "Fig 0.6 — qué guardamos, qué cobramos y ante quién respondemos.",

    ctaEyebrow: "// Pruébalo",
    ctaHeading: "Prueba una herramienta. Sin subir nada. Sin cuenta.",
    ctaSub: "Abre cualquier herramienta y mira la pestaña de red: con las del navegador, nada sale.",
    cta1: "Explorar las herramientas", cta2: "Ver cómo funciona la privacidad",
  },
  pt: {
    heroEyebrow: "// Sobre o DockDocs",
    heroPre: "Seus documentos não são assunto de mais ninguém além de ",
    heroAccent: "você.",
    heroSub: "A maioria das ferramentas do DockDocs roda inteiramente no seu navegador — seus arquivos nunca chegam até nós porque nunca saem de você. O local é o padrão, não uma configuração que você ativa.",
    heroCaption: "Fig 0.1 — seu arquivo, e onde ele fica.",

    flowEyebrow: "// Siga o arquivo",
    flowHeading: "Para onde seu arquivo realmente vai.",
    flowSub: "Na maioria das ferramentas, o processamento acontece na sua máquina, e o arquivo nunca cruza a linha.",
    flowDevice: "Seu dispositivo",
    flowNet: "A internet",
    flowServers: "servidores deles",
    flowZero: "0 bytes enviados",
    flowLeaves: "sai do seu dispositivo",
    flowNoCross: "nada cruza esta linha",
    flowWouldGo: "para onde seu arquivo normalmente iria",
    flowStays: "fica na sua máquina",
    flowCaption: "Fig 0.2 — na maioria das ferramentas, seu arquivo nunca cruza o limite.",

    proofEyebrow: "// Não acredite só na nossa palavra",
    proofHeading: "Não confie em nós. Aperte F12.",
    proofSub: "Abra a aba Rede do navegador e use uma ferramenta do navegador: você verá zero envios. Desligue o Wi-Fi; continua funcionando.",
    proofZero: "0 requisições · 0 B transferidos",
    proofOffline: "Funciona sem Wi-Fi.",
    proofCallout: "esta é a prova inteira",
    proofCaption: "Fig 0.3 — uma ferramenta do navegador real, capturada ao vivo. Nada sai.",

    tableEyebrow: "// Em termos claros",
    tableHeading: "O que fazemos. O que jamais fazemos.",
    tableSub: "Sem letras miúdas. A lista da esquerda é o produto inteiro; a da direita é tudo o que nos recusamos a fazer.",
    doHead: "Fazemos",
    neverHead: "Jamais fazemos",
    doRows: ["Processar arquivos no seu navegador", "Excluir temporários na nuvem imediatamente", "Indicar cada etapa na nuvem com antecedência", "Citar a fonte de cada resposta de IA", "Deixar você começar sem criar conta"],
    neverRows: ["Armazenar seus documentos", "Treinar nossos próprios modelos com seus arquivos", "Vender ou compartilhar seus dados", "Armadilhas de cancelamento por e-mail", "Envios ocultos"],
    tableCaption: "Fig 0.4 — o acordo, por completo.",

    cloudEyebrow: "// Honestos sobre a nuvem",
    cloudHeading: "Quando uma ferramenta usa a nuvem, ela avisa.",
    cloudSub: "Algumas ferramentas (conversão do Office, OCR grande, chat com IA) precisam de um servidor: avisado antes de começar, criptografado em trânsito e excluído logo após. Quando a IA responde a uma pergunta ou aponta uma constatação, ela mostra o trecho exato que a fundamenta — citado do seu arquivo e confirmado que está mesmo lá — e avisa quando algo não pode ser rastreado, em vez de inventar uma fonte.",
    cloudSteps: ["avisado com antecedência", "criptografado em trânsito", "processado", "cópia excluída"],
    cloudNotKept: "não retido",
    aiSummary: "resposta de IA",
    aiCite: "fonte",
    cloudCaption: "Fig 0.5 — as etapas na nuvem são indicadas e excluídas; as respostas de IA são rastreáveis.",

    statsEyebrow: "// Os números que importam",
    statsHeading: "Os números que importam são zeros.",
    statsSub: "Construído de forma independente — sustentado por quem o usa, não por investidores. Sem pressão para coletar dados ou crescer a qualquer custo.",
    stats: [
      { n: "0", l: "arquivos armazenados em ferramentas do navegador", z: true },
      { n: "0", l: "arquivos usados para treinar nossos próprios modelos", z: true },
      { n: "$0", l: "para começar — sem conta", z: true },
      { n: "~50", l: "ferramentas de PDF e IA", z: false },
    ],
    relPoints: [
      { t: "Pagamentos", b: "Creem, um Merchant of Record licenciado — nunca vemos seu cartão." },
      { t: "Reembolsos", b: "Reembolso em 7 dias, cancele quando quiser." },
      { t: "Sem aprisionamento", b: "Seus dados são seus; exporte quando quiser." },
      { t: "Antifrágil", b: "As ferramentas do navegador sempre rodaram na sua máquina, nunca reféns." },
    ],
    statsCaption: "Fig 0.6 — o que guardamos, o que cobramos e a quem respondemos.",

    ctaEyebrow: "// Experimente",
    ctaHeading: "Experimente uma ferramenta. Sem envio. Sem conta.",
    ctaSub: "Abra qualquer ferramenta e observe a aba de rede — nas ferramentas do navegador, nada sai.",
    cta1: "Explorar as ferramentas", cta2: "Ver como a privacidade funciona",
  },
  fr: {
    heroEyebrow: "// À propos de DockDocs",
    heroPre: "Vos documents ne regardent personne d'autre que ",
    heroAccent: "vous.",
    heroSub: "La plupart des outils DockDocs s'exécutent entièrement dans votre navigateur — vos fichiers ne nous parviennent jamais parce qu'ils ne vous quittent jamais. Le local est la valeur par défaut, pas un paramètre à activer.",
    heroCaption: "Fig 0.1 — votre fichier, et là où il reste.",

    flowEyebrow: "// Suivez le fichier",
    flowHeading: "Où va vraiment votre fichier.",
    flowSub: "Dans la plupart des outils, le traitement a lieu sur votre machine, et le fichier ne franchit jamais la ligne.",
    flowDevice: "Votre appareil",
    flowNet: "Internet",
    flowServers: "leurs serveurs",
    flowZero: "0 octet envoyé",
    flowLeaves: "quitte votre appareil",
    flowNoCross: "rien ne franchit cette ligne",
    flowWouldGo: "là où votre fichier irait normalement",
    flowStays: "reste sur votre machine",
    flowCaption: "Fig 0.2 — pour la plupart des outils, votre fichier ne franchit jamais la limite.",

    proofEyebrow: "// Ne nous croyez pas sur parole",
    proofHeading: "Ne nous faites pas confiance. Appuyez sur F12.",
    proofSub: "Ouvrez l'onglet Réseau de votre navigateur et lancez un outil navigateur : vous verrez zéro envoi. Coupez le Wi-Fi ; ça marche toujours.",
    proofZero: "0 requête · 0 o transféré",
    proofOffline: "Fonctionne sans Wi-Fi.",
    proofCallout: "c'est toute la preuve",
    proofCaption: "Fig 0.3 — un vrai outil navigateur, capturé en direct. Rien ne sort.",

    tableEyebrow: "// En termes clairs",
    tableHeading: "Ce que nous faisons. Ce que nous ne faisons jamais.",
    tableSub: "Pas de petits caractères. La liste de gauche est tout le produit ; celle de droite est tout ce que nous refusons de faire.",
    doHead: "Nous faisons",
    neverHead: "Nous ne faisons jamais",
    doRows: ["Traiter les fichiers dans votre navigateur", "Supprimer immédiatement les temporaires cloud", "Signaler chaque étape cloud à l'avance", "Citer la source de chaque réponse IA", "Vous laisser commencer sans compte"],
    neverRows: ["Stocker vos documents", "Entraîner nos propres modèles avec vos fichiers", "Vendre ou partager vos données", "Pièges de désabonnement par e-mail", "Envois cachés"],
    tableCaption: "Fig 0.4 — l'accord, en entier.",

    cloudEyebrow: "// Honnêtes sur le cloud",
    cloudHeading: "Quand un outil utilise le cloud, il vous le dit.",
    cloudSub: "Certains outils (conversion Office, OCR volumineuse, chat IA) ont besoin d'un serveur : signalé avant de commencer, chiffré en transit et supprimé juste après. Quand l'IA répond à une question ou relève un élément, elle montre le passage exact qui l'appuie — cité depuis votre fichier et vérifié qu'il s'y trouve — et vous indique quand quelque chose ne peut pas être tracé, au lieu d'inventer une source.",
    cloudSteps: ["signalé à l'avance", "chiffré en transit", "traité", "copie supprimée"],
    cloudNotKept: "non conservé",
    aiSummary: "réponse IA",
    aiCite: "source",
    cloudCaption: "Fig 0.5 — les étapes cloud sont signalées et supprimées ; les réponses IA sont traçables.",

    statsEyebrow: "// Les chiffres qui comptent",
    statsHeading: "Les chiffres qui comptent sont des zéros.",
    statsSub: "Conçu de façon indépendante — financé par ceux qui l'utilisent, pas par des investisseurs. Aucune pression pour collecter des données ou croître à tout prix.",
    stats: [
      { n: "0", l: "fichiers stockés dans les outils navigateur", z: true },
      { n: "0", l: "fichiers utilisés pour entraîner nos propres modèles", z: true },
      { n: "0 €", l: "pour commencer — sans compte", z: true },
      { n: "~50", l: "outils PDF et IA", z: false },
    ],
    relPoints: [
      { t: "Paiements", b: "Creem, un Merchant of Record agréé — nous ne voyons jamais votre carte." },
      { t: "Remboursements", b: "Remboursement sous 7 jours, annulez à tout moment." },
      { t: "Sans verrouillage", b: "Vos données sont à vous ; exportez à tout moment." },
      { t: "Antifragile", b: "Les outils navigateur ont toujours tourné sur votre machine, jamais en otage." },
    ],
    statsCaption: "Fig 0.6 — ce que nous stockons, ce que nous facturons et devant qui nous répondons.",

    ctaEyebrow: "// Essayez",
    ctaHeading: "Essayez un outil. Sans envoi. Sans compte.",
    ctaSub: "Ouvrez n'importe quel outil et regardez l'onglet réseau — avec les outils navigateur, rien ne sort.",
    cta1: "Explorer les outils", cta2: "Voir comment fonctionne la confidentialité",
  },
} as const;

const Check = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0 text-[color:var(--accent)]"><path d="M3 8.5l3.2 3.2L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const Dash = () => <span className="mt-0.5 shrink-0 text-[color:var(--faint)]">—</span>;

// The depth/weight recipe — every figure on the page sits in one of these so it
// reads as a crafted object lifted above the flat page: soft accent glow behind,
// raised gradient surface, strong border + large shadow, and an inner lit top edge.
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

// A nested panel one level lower inside a <Figure>, for the layered panel-in-panel depth.
const PANEL = "rounded-xl border border-[color:var(--line)] bg-black/20 p-5";

export function AboutPage({ locale = "en" }: { locale?: Locale }) {
  const zh = locale === "zh";
  const c = content[locale] ?? content.en;
  const eyebrow = `font-mono text-[12px] text-[color:var(--faint)] ${zh ? "" : "uppercase tracking-[0.08em]"}`;
  const h2 = "text-[28px] font-normal leading-[1.15] tracking-[-0.02em] text-[color:var(--foreground)] sm:text-[36px]";
  const sub = "mt-4 max-w-2xl text-[16px] leading-[1.6] text-[color:var(--muted)]";
  const cap = "mt-4 font-mono text-[12px] text-[color:var(--faint)]";
  const shell = "mx-auto max-w-5xl px-5 py-24 sm:px-6 sm:py-28 lg:px-8";
  const path = (slug: string) => (locale === "zh" ? `/zh${slug}` : locale === "es" ? `/es${slug}` : locale === "pt" ? `/pt${slug}` : locale === "fr" ? `/fr${slug}` : slug);

  return (
    <main>
      <style>{`
        @keyframes abFlow{to{stroke-dashoffset:-28}}
        .ab-flow{stroke-dasharray:1 9;stroke-linecap:round;animation:abFlow 1.4s linear infinite}
        @media (prefers-reduced-motion: reduce){.ab-flow{animation:none}}
      `}</style>

      {/* 1 ── Hero (left-aligned manifesto; origin + "local is the default" folded in) ── */}
      <section>
        <div className={shell}>
          <p className={eyebrow}>{c.heroEyebrow}</p>
          <h1 className="mt-4 max-w-[18ch] text-[40px] font-medium leading-[1.05] tracking-[-0.035em] text-[color:var(--foreground)] sm:text-[60px] lg:text-[80px] lg:leading-[1.02] lg:tracking-[-0.04em]">
            {c.heroPre}<span className="text-[color:var(--accent)]">{c.heroAccent}</span>
          </h1>
          <p className={sub}>{c.heroSub}</p>
          <Figure className="mt-10" glow="22%">
            <div className="flex items-center gap-5">
              {/* "Your device" panel holding the file + 0-bytes pill */}
              <div className={`${PANEL} flex items-center gap-3`}>
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[color:var(--accent)]"><path d="M7 3h6l4 4v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.4" /><path d="M13 3v4h4" stroke="currentColor" strokeWidth="1.4" /></svg>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--accent)] px-2.5 py-1 text-[11px] font-medium text-[color:var(--accent)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent)]" />{c.flowZero}
                </span>
              </div>
              {/* severed dotted trail toward a greyed "the internet" edge it never reaches */}
              <div className="flex flex-1 items-center gap-3">
                <div className="h-px flex-1 border-t border-dashed border-[color:var(--line-strong)]" />
                <span className="font-mono text-[11px] text-[color:var(--faint)]">{c.flowNet}</span>
              </div>
            </div>
          </Figure>
          <p className={cap}>{c.heroCaption}</p>
        </div>
      </section>

      {/* 2 ── THE STAR: where your file goes ── */}
      <section>
        <div className={shell}>
          <p className={eyebrow}>{c.flowEyebrow}</p>
          <h2 className={`mt-4 max-w-2xl ${h2}`}>{c.flowHeading}</h2>
          <p className={sub}>{c.flowSub}</p>
          <Figure className="mt-10" glow="40%">
            <svg viewBox="0 0 960 360" className="w-full" role="img" aria-label={c.flowHeading}>
              <defs>
                <filter id="abPillGlow" x="-60%" y="-60%" width="220%" height="220%">
                  <feGaussianBlur stdDeviation="9" />
                </filter>
              </defs>
              {/* cold "internet" wash on the right half */}
              <rect x="600" y="0" width="360" height="360" fill="rgba(255,255,255,0.015)" />
              {/* boundary */}
              <line x1="600" y1="44" x2="600" y2="316" style={{ stroke: "var(--line-strong)" }} strokeWidth="1.5" strokeDasharray="3 7" />
              <text x="300" y="34" textAnchor="middle" className="font-mono text-[13px]" style={{ fill: "var(--faint)" }}>{c.flowDevice}</text>
              <text x="790" y="34" textAnchor="middle" className="font-mono text-[13px]" style={{ fill: "var(--faint)" }}>{c.flowNet}</text>

              {/* Lane A — the typical tool: file crosses to a server (cold, severed) */}
              <g style={{ color: "var(--faint)" }} stroke="currentColor" fill="none" strokeWidth="1.6">
                <rect x="64" y="96" width="80" height="56" rx="8" style={{ fill: "var(--surface)" }} />
                <line x1="64" y1="114" x2="144" y2="114" /><circle cx="74" cy="105" r="1.6" fill="currentColor" />
                <line x1="150" y1="124" x2="556" y2="124" />
                {/* the crossing segment, tinted warning-red */}
                <line x1="556" y1="124" x2="754" y2="124" stroke="rgba(239,68,68,0.55)" />
                <path d="M752 118l12 6-12 6z" fill="rgba(239,68,68,0.7)" stroke="none" />
                <rect x="762" y="100" width="68" height="50" rx="6" style={{ fill: "var(--surface)" }} />
                <line x1="776" y1="116" x2="816" y2="116" /><line x1="776" y1="126" x2="816" y2="126" /><line x1="776" y1="136" x2="816" y2="136" />
                <text x="350" y="150" textAnchor="middle" fill="currentColor" stroke="none" className="font-mono text-[12px]">{c.flowLeaves}</text>
                <text x="796" y="168" textAnchor="middle" fill="currentColor" stroke="none" className="text-[12px]">{c.flowServers}</text>
              </g>
              {/* annotation: where your file would normally go */}
              <g className="hidden sm:block" stroke="var(--faint)" strokeWidth="0.75" fill="none">
                <path d="M796 178 V206 H700" />
                <text x="694" y="210" textAnchor="end" fill="var(--faint)" stroke="none" className="font-mono text-[11px]">{c.flowWouldGo}</text>
              </g>

              {/* Lane B — DockDocs: file loops back, never crosses (warm/glowing) */}
              <g style={{ color: "var(--accent)" }} stroke="currentColor" fill="none" strokeWidth="1.9">
                <ellipse cx="104" cy="290" rx="46" ry="8" fill="rgba(0,0,0,0.35)" stroke="none" />
                <rect x="64" y="240" width="80" height="56" rx="8" style={{ fill: "var(--surface)" }} />
                <line x1="64" y1="258" x2="144" y2="258" /><circle cx="74" cy="249" r="1.6" fill="currentColor" />
                <path d="M150 272H250a20 20 0 0 0 0-40H150" />
                <path d="M150 228l13-6v12z" fill="currentColor" stroke="none" />
                <path className="ab-flow" d="M150 272H250a20 20 0 0 0 0-40H150" strokeWidth="2.6" />
                <text x="300" y="244" fill="currentColor" stroke="none" className="font-mono text-[12px]">{c.flowStays}</text>
                {/* the hero pill — lit, with a soft glow behind it (spec C names it the hero element) */}
                <rect x="300" y="258" width="186" height="32" rx="16" fill="rgba(62,207,142,0.5)" stroke="none" filter="url(#abPillGlow)" />
                <rect x="300" y="258" width="186" height="32" rx="16" fill="rgba(62,207,142,0.08)" strokeWidth="1.6" />
                <text x="393" y="279" textAnchor="middle" fill="currentColor" stroke="none" className="text-[13px] font-medium">{c.flowZero}</text>
              </g>
              {/* annotation: nothing crosses this line */}
              <g className="hidden sm:block" stroke="var(--accent)" strokeWidth="0.75" fill="none" opacity="0.8">
                <path d="M600 250 H560 V224" />
                <text x="556" y="220" textAnchor="end" fill="var(--accent)" stroke="none" className="font-mono text-[11px]">{c.flowNoCross}</text>
              </g>
            </svg>
          </Figure>
          <p className={cap}>{c.flowCaption}</p>
        </div>
      </section>

      {/* 3 ── Don't trust us, verify it (the F12 proof) ── */}
      <section>
        <div className={shell}>
          <p className={eyebrow}>{c.proofEyebrow}</p>
          <h2 className={`mt-4 max-w-2xl ${h2}`}>{c.proofHeading}</h2>
          <p className={sub}>{c.proofSub}</p>
          <Figure className="mt-10" glow="50%">
            <div className="rounded-xl border border-[color:var(--line)] bg-black/30 p-0 overflow-hidden">
              {/* DevTools "Network" header row */}
              <div className="flex items-center gap-2 border-b border-[color:var(--line)] px-4 py-2.5 font-mono text-[11px] text-[color:var(--faint)]">
                <span className="h-2 w-2 rounded-full bg-[color:var(--error)]" /><span className="text-[color:var(--muted)]">Recording…</span>
                <span className="ml-4 hidden gap-6 sm:flex"><span>Name</span><span>Status</span><span>Size</span><span>Time</span></span>
              </div>
              {/* empty results body — the point */}
              <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
                <span className="text-[24px] font-medium tracking-[-0.01em] text-[color:var(--accent)] sm:text-[30px]" style={{ textShadow: "0 0 28px rgba(62,207,142,0.45)" }}>{c.proofZero}</span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line-strong)] px-3 py-1 text-[12px] text-[color:var(--muted)]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[color:var(--accent)]"><path d="M3 12l18-7-7 18-2.5-7.5L3 12Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>
                  {c.proofOffline}
                </span>
              </div>
            </div>
            <p className="mt-3 font-mono text-[11px] text-[color:var(--accent)]">↑ {c.proofCallout}</p>
          </Figure>
          <p className={cap}>{c.proofCaption}</p>
        </div>
      </section>

      {/* 4 ── What we do / What we never do ── */}
      <section>
        <div className={shell}>
          <p className={eyebrow}>{c.tableEyebrow}</p>
          <h2 className={`mt-4 max-w-2xl ${h2}`}>{c.tableHeading}</h2>
          <p className={sub}>{c.tableSub}</p>
          <Figure className="mt-10">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className={PANEL} style={{ borderLeft: "2px solid var(--accent)" }}>
                <div className="mb-4 flex items-center gap-2"><Check /><span className="text-[15px] font-normal text-[color:var(--foreground)]">{c.doHead}</span></div>
                <ul className="space-y-2.5">
                  {c.doRows.map((r) => <li key={r} className="flex items-start gap-2.5 text-[14px] leading-[1.5] text-[color:var(--foreground)]"><Check /><span>{r}</span></li>)}
                </ul>
              </div>
              <div className={PANEL}>
                <div className="mb-4 flex items-center gap-2"><Dash /><span className="text-[15px] font-normal text-[color:var(--muted)]">{c.neverHead}</span></div>
                <ul className="space-y-2.5">
                  {c.neverRows.map((r) => <li key={r} className="flex items-start gap-2.5 text-[14px] leading-[1.5] text-[color:var(--muted)]"><Dash /><span>{r}</span></li>)}
                </ul>
              </div>
            </div>
          </Figure>
          <p className={cap}>{c.tableCaption}</p>
        </div>
      </section>

      {/* 5 ── Honest about the cloud + verifiable AI ── */}
      <section>
        <div className={shell}>
          <p className={eyebrow}>{c.cloudEyebrow}</p>
          <h2 className={`mt-4 max-w-2xl ${h2}`}>{c.cloudHeading}</h2>
          <p className={sub}>{c.cloudSub}</p>
          <Figure className="mt-10">
            <div className="grid gap-4 md:grid-cols-2">
              {/* cloud lifecycle */}
              <div className={PANEL}>
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
              <div className={PANEL}>
                <div className="flex items-stretch gap-3">
                  <div className="flex w-[36%] flex-col gap-1.5 rounded-lg border border-[color:var(--line)] p-3">
                    {[80, 60, 70, 50, 65].map((w, i) => <span key={i} className="h-[3px] rounded-full" style={{ width: `${w}%`, background: i === 2 ? "var(--accent)" : "var(--skeleton)" }} />)}
                  </div>
                  <div className="flex items-center text-[color:var(--accent)]"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
                  <div className="flex-1 rounded-lg border border-[color:var(--line)] p-3">
                    <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--faint)]">{c.aiSummary}</p>
                    <div className="mb-1.5 flex items-center gap-1.5 rounded bg-[color:var(--soft-accent)] px-1.5 py-1 text-[12px]" style={{ boxShadow: "0 0 18px rgba(62,207,142,0.18)" }}>
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--accent)]" />
                      <span className="h-[3px] flex-1 rounded-full bg-[color:var(--accent)] opacity-70" />
                      <span className="shrink-0 rounded border border-[color:var(--accent)] px-1.5 py-0.5 text-[9px] font-medium text-[color:var(--accent)]">{c.aiCite}</span>
                    </div>
                    {[58, 72].map((w, i) => (
                      <div key={i} className="mb-1.5 flex items-center gap-1.5 last:mb-0">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--ink-soft)]" />
                        <span className="h-[3px] rounded-full bg-[color:var(--skeleton)]" style={{ width: `${w}%` }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Figure>
          <p className={cap}>{c.cloudCaption}</p>
        </div>
      </section>

      {/* 6 ── The numbers + how we're funded (zeros + funding fact-row, merged) ── */}
      <section>
        <div className={shell}>
          <p className={eyebrow}>{c.statsEyebrow}</p>
          <h2 className={`mt-4 max-w-2xl ${h2}`}>{c.statsHeading}</h2>
          <p className={sub}>{c.statsSub}</p>
          <Figure className="mt-10" glow="20%">
            {/* the zeros */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
              {c.stats.map((s) => (
                <div key={s.l}>
                  <div className={`text-[44px] font-normal tracking-[-0.02em] md:text-[64px] ${s.z ? "text-[color:var(--accent)]" : "text-[color:var(--foreground)]"}`} style={s.z ? { textShadow: "0 0 30px rgba(62,207,142,0.3)" } : undefined}>{s.n}</div>
                  <div className="mt-2 max-w-[170px] font-mono text-[12px] leading-[1.4] text-[color:var(--faint)]">{s.l}</div>
                </div>
              ))}
            </div>
            {/* funding / reliability fact-row */}
            <div className="mt-8 grid gap-x-6 gap-y-4 border-t border-[color:var(--line)] pt-6 sm:grid-cols-2 lg:grid-cols-4">
              {c.relPoints.map((p) => (
                <div key={p.t}>
                  <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[color:var(--accent-strong)]">{p.t}</p>
                  <p className="mt-1.5 text-[13px] leading-[1.5] text-[color:var(--muted)]">{p.b}</p>
                </div>
              ))}
            </div>
          </Figure>
          <p className={cap}>{c.statsCaption}</p>
        </div>
      </section>

      {/* 7 ── CTA (left-aligned; closing) ── */}
      <section>
        <div className={shell}>
          <p className={eyebrow}>{c.ctaEyebrow}</p>
          <h2 className={`mt-4 ${h2}`}>{c.ctaHeading}</h2>
          <p className={sub}>{c.ctaSub}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href={path("/sitemap")} className="inline-flex h-11 items-center justify-center rounded-full bg-[color:var(--accent)] px-6 text-[14px] font-medium transition hover:bg-[color:var(--accent-hover)]">{c.cta1}</a>
            <a href={path("/privacy-policy")} className="inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--line-strong)] px-6 text-[14px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--foreground)]">{c.cta2}</a>
          </div>
        </div>
      </section>
    </main>
  );
}
