"use client";

import { useEffect, useState } from "react";
import { TIER_CATEGORIES } from "@/lib/tier-config";
import type { FeatureItem } from "@/lib/tier-config";
import { localizedPath, type RouteSlug, type RouteLocale } from "@/lib/i18n";
import { createBillingCheckoutSession, getSubscriptionSnapshot, type SubscriptionSnapshot } from "@/lib/subscription-runtime";
import type { PaidSubscriptionPlan } from "@/lib/billing-config";
import { getUser, onAuthChange } from "@/lib/auth";

type Locale = "en" | "zh" | "es" | "pt" | "fr";

const copy = {
  en: {
    title: "Simple pricing. Powerful documents.",
    subtitle: "Start free — no account, no card. Upgrade only when you need AI, bigger files, or higher volume. Cancel anytime, in two clicks.",
    monthly: "Monthly",
    yearly: "Yearly",
    save: "Save ~40%",
    perMo: "/mo",
    mostPopular: "Most popular",
    billedYearly: (v: string) => `${v} billed yearly`,
    // trust bar
    trust: ["7-day money-back guarantee", "Cancel anytime, no questions", "Files never used to train our models"],
    plans: [
      {
        name: "Free",
        monthlyPrice: "$0",
        yearlyPrice: "$0",
        tagline: "Everything you need for everyday PDF work.",
        highlights: ["20+ PDF tools — convert, compress, merge, split", "Encrypt, edit pages & OCR scanned docs", "Processed in your browser — files stay private", "Free forever, no account needed"],
        cta: "Start free now",
        href: "/chat-with-pdf" as RouteSlug,
        featured: false,
      },
      {
        name: "Plus",
        monthlyPrice: "$5",
        yearlyPrice: "$3",
        yearlyTotal: "$36/yr",
        tagline: "AI reads and compares your documents — in seconds.",
        valueLine: "Less than a coffee a month.",
        highlights: ["Everything in Free", "Chat with any PDF — answers cite the source", "AI summaries & key points in seconds", "Compare multiple documents side by side", "100 MB files, batch & priority, no ads"],
        cta: "Upgrade to Plus",
        href: "" as RouteSlug,
        featured: true,
      },
      {
        name: "Pro",
        monthlyPrice: "$20",
        yearlyPrice: "$12",
        yearlyTotal: "$144/yr",
        tagline: "Automate document workflows & professional review.",
        highlights: ["Everything in Plus", "Automate batch document workflows", "Contract review — flags risky & missing clauses", "API access & auto-classification", "Team workspace & priority support"],
        cta: "Upgrade to Pro",
        href: "" as RouteSlug,
        featured: false,
      },
    ],
    faqTitle: "Questions before you buy",
    faq: [
      { q: "Can I cancel anytime?", a: "Yes. Manage or cancel your subscription yourself in a couple of clicks — no emails, no retention games. You keep access until the end of the period you paid for." },
      { q: "Is there a refund?", a: "Yes. If Plus or Pro isn't right for you, request a refund within 7 days of payment and we'll return it." },
      { q: "Do I need to pay to use DockDocs?", a: "No. All 20+ core PDF tools are free forever, with no account required. You only pay if you want AI features, larger files, or higher volume." },
      { q: "What happens to my files?", a: "Most tools process entirely in your browser — your files never leave your device. Cloud conversions are processed and the temporary copy is deleted automatically. We never use your documents to train our own models, and only the text needed to answer is sent to the AI provider." },
      { q: "Can I switch plans later?", a: "Anytime. Upgrade, downgrade, or move between monthly and yearly whenever you like." },
    ],
    ctaTitle: "Try it free — decide later.",
    ctaDesc: "Open any tool right now. No account, no card, no commitment.",
    ctaBtn: "Start with a free tool",
    scenariosTitle: "What can DockDocs solve for you?",
    scenarios: [
      { emoji: "📊", title: "Compare quotes & pick the best", before: "Open 3 files, copy numbers into a sheet — ~1 hour", after: "Upload → side-by-side table + a sourced pick — 1 min", tier: "Plus", href: "/compare" as RouteSlug },
      { emoji: "📄", title: "Catch the traps in a contract", before: "Pay a lawyer $300, or sign blind and get burned", after: "AI flags risky & missing clauses in minutes", tier: "Pro", href: "/compare" as RouteSlug },
      { emoji: "🧾", title: "Process a batch of invoices", before: "Key them in one by one — hours, or hire help", after: "Drop the whole batch → auto-extract & summarize", tier: "Pro", href: "/extract-to-excel" as RouteSlug },
      { emoji: "📕", title: "Understand a long report fast", before: "Read 80 pages to find a few answers — hours", after: "Ask it anything → sourced answers in 30s", tier: "Plus", href: "/chat-with-pdf" as RouteSlug },
    ],
    compareTitle: "Compare plans",
    compareCols: ["Free", "Plus", "Pro"],
    compareRows: [
      { f: "20+ PDF tools — convert, compress, merge, encrypt, OCR", v: ["✓", "✓", "✓"] },
      { f: "Chat with PDF · AI summaries", v: ["—", "✓", "✓"] },
      { f: "AI translate PDF (keeps layout)", v: ["—", "Soon", "Soon"] },
      { f: "Compare multiple documents", v: ["—", "✓", "✓"] },
      { f: "100 MB files · batch · no ads", v: ["—", "✓", "✓"] },
      { f: "Automate workflows · API · auto-classify", v: ["—", "—", "✓"] },
      { f: "Contract review — risk & missing clauses", v: ["—", "—", "✓"] },
      { f: "Team workspace · priority support", v: ["—", "—", "✓"] },
    ],
  },
  zh: {
    title: "定价简单，文档强大。",
    subtitle: "免费开始——无需注册、无需信用卡。只在你需要 AI、更大文件或更高用量时才升级。随时取消，两次点击搞定。",
    monthly: "按月",
    yearly: "按年",
    save: "省约 40%",
    perMo: "/月",
    mostPopular: "最受欢迎",
    billedYearly: (v: string) => `按年计费 ${v}`,
    trust: ["7 天无理由退款", "随时取消，绝不刁难", "绝不用文件训练我们自己的模型"],
    plans: [
      {
        name: "免费",
        monthlyPrice: "$0",
        yearlyPrice: "$0",
        tagline: "日常 PDF 工作所需的一切。",
        highlights: ["20+ PDF 工具：转换、压缩、合并、拆分", "加密、页面编辑、扫描件 OCR", "浏览器本地处理——文件保持私密", "永久免费，无需注册"],
        cta: "立即免费开始",
        href: "/chat-with-pdf" as RouteSlug,
        featured: false,
      },
      {
        name: "Plus",
        monthlyPrice: "$5",
        yearlyPrice: "$3",
        yearlyTotal: "$36/年",
        tagline: "AI 替你读懂、横比文档——几秒搞定。",
        valueLine: "每月不到一杯咖啡的钱。",
        highlights: ["包含「免费」全部功能", "和任意 PDF 对话——答案带原文出处", "AI 摘要与要点，几秒搞定", "多份文档并排对比", "100MB 大文件、批量与优先、无广告"],
        cta: "升级到 Plus",
        href: "" as RouteSlug,
        featured: true,
      },
      {
        name: "Pro",
        monthlyPrice: "$20",
        yearlyPrice: "$12",
        yearlyTotal: "$144/年",
        tagline: "自动跑文档流程 + 专业领域审查。",
        highlights: ["包含「Plus」全部功能", "批量文档工作流自动化", "合同审查——标出风险与缺失条款", "API 接入与自动分类", "团队工作区与优先支持"],
        cta: "升级到 Pro",
        href: "" as RouteSlug,
        featured: false,
      },
    ],
    faqTitle: "购买前的疑问",
    faq: [
      { q: "可以随时取消吗？", a: "可以。你自己几次点击即可管理或取消订阅——无需发邮件，没有挽留套路。在你已付费的周期结束前，仍可正常使用。" },
      { q: "支持退款吗？", a: "支持。如果 Plus 或 Pro 不适合你，在付款后 7 天内申请退款，我们会全额退还。" },
      { q: "使用 DockDocs 必须付费吗？", a: "不必。全部 20+ 核心 PDF 工具永久免费，且无需注册。只有在你需要 AI 功能、更大文件或更高用量时才需付费。" },
      { q: "我的文件会怎样？", a: "大多数工具完全在你的浏览器中处理——文件绝不离开你的设备。云端转换处理后会自动删除临时副本。我们绝不会用你的文档训练我们自己的模型。" },
      { q: "之后可以更换套餐吗？", a: "随时可以。升级、降级，或在按月与按年之间切换，随你心意。" },
    ],
    ctaTitle: "先免费试用——之后再决定。",
    ctaDesc: "现在就打开任意工具。无需注册、无需信用卡、无需承诺。",
    ctaBtn: "从一个免费工具开始",
    scenariosTitle: "DockDocs 能替你解决什么？",
    scenarios: [
      { emoji: "📊", title: "比报价，选最优", before: "开 3 个文件抄数字进表格 —— 约 1 小时", after: "上传 → 并排对比表 + 带出处的推荐 —— 1 分钟", tier: "Plus", href: "/compare" as RouteSlug },
      { emoji: "📄", title: "看穿合同里的坑", before: "花 $300 找律师，或盲签踩坑", after: "AI 几分钟标出风险与缺失条款", tier: "Pro", href: "/compare" as RouteSlug },
      { emoji: "🧾", title: "批量处理发票", before: "一张张录入几小时，或雇人", after: "整批丢进去 → 自动抽取汇总", tier: "Pro", href: "/extract-to-excel" as RouteSlug },
      { emoji: "📕", title: "快速读懂长报告", before: "读 80 页找几个答案 —— 几小时", after: "问它任何问题 → 30 秒带出处的答案", tier: "Plus", href: "/chat-with-pdf" as RouteSlug },
    ],
    compareTitle: "套餐对照",
    compareCols: ["免费", "Plus", "Pro"],
    compareRows: [
      { f: "20+ PDF 工具(转换/压缩/合并/加密/OCR)", v: ["✓", "✓", "✓"] },
      { f: "和 PDF 对话 · AI 摘要", v: ["—", "✓", "✓"] },
      { f: "AI 翻译 PDF(保留版式)", v: ["—", "即将", "即将"] },
      { f: "多文档对比", v: ["—", "✓", "✓"] },
      { f: "100MB 大文件 · 批量 · 无广告", v: ["—", "✓", "✓"] },
      { f: "工作流自动化 · API · 自动分类", v: ["—", "—", "✓"] },
      { f: "合同审查(风险与缺失条款)", v: ["—", "—", "✓"] },
      { f: "团队工作区 · 优先支持", v: ["—", "—", "✓"] },
    ],
  },
  es: {
    title: "Precios simples. Documentos poderosos.",
    subtitle: "Empieza gratis — sin cuenta, sin tarjeta. Actualiza solo cuando necesites IA, archivos más grandes o mayor volumen. Cancela en cualquier momento, en dos clics.",
    monthly: "Mensual",
    yearly: "Anual",
    save: "Ahorra ~40%",
    perMo: "/mes",
    mostPopular: "Más popular",
    billedYearly: (v: string) => `${v} facturado anualmente`,
    trust: ["Garantía de devolución de 7 días", "Cancela en cualquier momento, sin preguntas", "Tus archivos nunca se usan para entrenar nuestros propios modelos"],
    plans: [
      {
        name: "Gratis",
        monthlyPrice: "$0",
        yearlyPrice: "$0",
        tagline: "Todo lo que necesitas para el trabajo diario con PDF.",
        highlights: ["20+ herramientas PDF — convertir, comprimir, unir, dividir", "Encriptar, editar páginas y OCR de docs escaneados", "Procesado en tu navegador — los archivos permanecen privados", "Gratis para siempre, sin cuenta necesaria"],
        cta: "Empieza gratis ahora",
        href: "/chat-with-pdf" as RouteSlug,
        featured: false,
      },
      {
        name: "Plus",
        monthlyPrice: "$5",
        yearlyPrice: "$3",
        yearlyTotal: "$36/año",
        tagline: "La IA lee y compara tus documentos — en segundos.",
        valueLine: "Menos que un café al mes.",
        highlights: ["Todo lo de Gratis", "Chatea con cualquier PDF — las respuestas citan la fuente", "Resúmenes e ideas clave de IA en segundos", "Compara múltiples documentos lado a lado", "Archivos de 100 MB, lotes y prioridad, sin anuncios"],
        cta: "Actualizar a Plus",
        href: "" as RouteSlug,
        featured: true,
      },
      {
        name: "Pro",
        monthlyPrice: "$20",
        yearlyPrice: "$12",
        yearlyTotal: "$144/año",
        tagline: "Automatiza flujos de trabajo y revisión profesional.",
        highlights: ["Todo lo de Plus", "Automatiza flujos de trabajo de documentos en lote", "Revisión de contratos — detecta cláusulas arriesgadas y faltantes", "Acceso a API y clasificación automática", "Espacio de trabajo en equipo y soporte prioritario"],
        cta: "Actualizar a Pro",
        href: "" as RouteSlug,
        featured: false,
      },
    ],
    faqTitle: "Preguntas antes de comprar",
    faq: [
      { q: "¿Puedo cancelar en cualquier momento?", a: "Sí. Gestiona o cancela tu suscripción tú mismo en un par de clics — sin correos, sin trucos de retención. Mantienes el acceso hasta el final del período que pagaste." },
      { q: "¿Hay reembolsos?", a: "Sí. Si Plus o Pro no es lo que buscas, solicita un reembolso dentro de los 7 días del pago y te lo devolvemos." },
      { q: "¿Necesito pagar para usar DockDocs?", a: "No. Las 20+ herramientas PDF básicas son gratuitas para siempre, sin necesidad de cuenta. Solo pagas si quieres funciones de IA, archivos más grandes o mayor volumen." },
      { q: "¿Qué pasa con mis archivos?", a: "La mayoría de herramientas procesan completamente en tu navegador — tus archivos nunca salen de tu dispositivo. Las conversiones en la nube se procesan y la copia temporal se elimina automáticamente. Nunca usamos tus documentos para entrenar nuestros propios modelos." },
      { q: "¿Puedo cambiar de plan después?", a: "En cualquier momento. Actualiza, baja de plan o cambia entre mensual y anual cuando quieras." },
    ],
    ctaTitle: "Pruébalo gratis — decide después.",
    ctaDesc: "Abre cualquier herramienta ahora mismo. Sin cuenta, sin tarjeta, sin compromiso.",
    ctaBtn: "Empieza con una herramienta gratuita",
    scenariosTitle: "¿Qué puede resolver DockDocs para ti?",
    scenarios: [
      { emoji: "📊", title: "Compara presupuestos y elige el mejor", before: "Abrir 3 archivos, copiar números en una hoja — ~1 hora", after: "Subir → tabla comparativa + recomendación con fuente — 1 min", tier: "Plus", href: "/compare" as RouteSlug },
      { emoji: "📄", title: "Detecta las trampas en un contrato", before: "Pagar $300 a un abogado, o firmar a ciegas y salir perdiendo", after: "La IA detecta cláusulas arriesgadas y faltantes en minutos", tier: "Pro", href: "/compare" as RouteSlug },
      { emoji: "🧾", title: "Procesa un lote de facturas", before: "Introducirlas una por una — horas, o contratar ayuda", after: "Sube el lote completo → extracción y resumen automático", tier: "Pro", href: "/extract-to-excel" as RouteSlug },
      { emoji: "📕", title: "Entiende un informe largo rápidamente", before: "Leer 80 páginas para encontrar unas respuestas — horas", after: "Pregúntale lo que sea → respuestas con fuente en 30s", tier: "Plus", href: "/chat-with-pdf" as RouteSlug },
    ],
    compareTitle: "Comparar planes",
    compareCols: ["Gratis", "Plus", "Pro"],
    compareRows: [
      { f: "20+ herramientas PDF — convertir, comprimir, unir, encriptar, OCR", v: ["✓", "✓", "✓"] },
      { f: "Chat con PDF · Resúmenes de IA", v: ["—", "✓", "✓"] },
      { f: "Traducir PDF con IA (mantiene el formato)", v: ["—", "Pronto", "Pronto"] },
      { f: "Comparar múltiples documentos", v: ["—", "✓", "✓"] },
      { f: "Archivos de 100 MB · lotes · sin anuncios", v: ["—", "✓", "✓"] },
      { f: "Automatizar flujos · API · auto-clasificar", v: ["—", "—", "✓"] },
      { f: "Revisión de contratos — riesgos y cláusulas faltantes", v: ["—", "—", "✓"] },
      { f: "Espacio de equipo · soporte prioritario", v: ["—", "—", "✓"] },
    ],
  },
  pt: {
    title: "Preços simples. Documentos poderosos.",
    subtitle: "Comece grátis — sem conta, sem cartão. Faça upgrade só quando precisar de IA, arquivos maiores ou maior volume. Cancele a qualquer momento, em dois cliques.",
    monthly: "Mensal",
    yearly: "Anual",
    save: "Economize ~40%",
    perMo: "/mês",
    mostPopular: "Mais popular",
    billedYearly: (v: string) => `${v} cobrado anualmente`,
    trust: ["Garantia de reembolso de 7 dias", "Cancele a qualquer momento, sem perguntas", "Seus arquivos nunca são usados para treinar nossos próprios modelos"],
    plans: [
      {
        name: "Grátis",
        monthlyPrice: "$0",
        yearlyPrice: "$0",
        tagline: "Tudo que você precisa para o trabalho diário com PDF.",
        highlights: ["20+ ferramentas PDF — converter, comprimir, mesclar, dividir", "Criptografar, editar páginas e OCR de docs digitalizados", "Processado no seu navegador — arquivos ficam privados", "Grátis para sempre, sem conta necessária"],
        cta: "Comece grátis agora",
        href: "/chat-with-pdf" as RouteSlug,
        featured: false,
      },
      {
        name: "Plus",
        monthlyPrice: "$5",
        yearlyPrice: "$3",
        yearlyTotal: "$36/ano",
        tagline: "A IA lê e compara seus documentos — em segundos.",
        valueLine: "Menos que um café por mês.",
        highlights: ["Tudo do Grátis", "Converse com qualquer PDF — respostas citam a fonte", "Resumos e pontos-chave com IA em segundos", "Compare vários documentos lado a lado", "Arquivos de 100 MB, lote e prioridade, sem anúncios"],
        cta: "Fazer upgrade para Plus",
        href: "" as RouteSlug,
        featured: true,
      },
      {
        name: "Pro",
        monthlyPrice: "$20",
        yearlyPrice: "$12",
        yearlyTotal: "$144/ano",
        tagline: "Automatize fluxos de documentos e revisão profissional.",
        highlights: ["Tudo do Plus", "Automatize fluxos de trabalho de documentos em lote", "Revisão de contratos — detecta cláusulas arriscadas e ausentes", "Acesso à API e classificação automática", "Espaço de trabalho em equipe e suporte prioritário"],
        cta: "Fazer upgrade para Pro",
        href: "" as RouteSlug,
        featured: false,
      },
    ],
    faqTitle: "Perguntas antes de comprar",
    faq: [
      { q: "Posso cancelar a qualquer momento?", a: "Sim. Gerencie ou cancele sua assinatura você mesmo em alguns cliques — sem e-mails, sem truques de retenção. Você mantém o acesso até o final do período pago." },
      { q: "Há reembolso?", a: "Sim. Se o Plus ou Pro não for o certo para você, solicite reembolso dentro de 7 dias do pagamento e devolveremos." },
      { q: "Preciso pagar para usar o DockDocs?", a: "Não. Todas as 20+ ferramentas PDF básicas são gratuitas para sempre, sem necessidade de conta. Você só paga se quiser recursos de IA, arquivos maiores ou maior volume." },
      { q: "O que acontece com meus arquivos?", a: "A maioria das ferramentas processa inteiramente no seu navegador — seus arquivos nunca saem do seu dispositivo. Conversões em nuvem são processadas e a cópia temporária é excluída automaticamente. Nunca usamos seus documentos para treinar nossos próprios modelos." },
      { q: "Posso trocar de plano depois?", a: "A qualquer momento. Faça upgrade, downgrade ou mude entre mensal e anual quando quiser." },
    ],
    ctaTitle: "Experimente grátis — decida depois.",
    ctaDesc: "Abra qualquer ferramenta agora mesmo. Sem conta, sem cartão, sem compromisso.",
    ctaBtn: "Comece com uma ferramenta gratuita",
    scenariosTitle: "O que o DockDocs pode resolver para você?",
    scenarios: [
      { emoji: "📊", title: "Compare orçamentos e escolha o melhor", before: "Abrir 3 arquivos, copiar números numa planilha — ~1 hora", after: "Carregar → tabela comparativa + recomendação com fonte — 1 min", tier: "Plus", href: "/compare" as RouteSlug },
      { emoji: "📄", title: "Detecte as armadilhas em um contrato", before: "Pagar $300 a um advogado, ou assinar às cegas e se arrepender", after: "A IA detecta cláusulas arriscadas e ausentes em minutos", tier: "Pro", href: "/compare" as RouteSlug },
      { emoji: "🧾", title: "Processe um lote de faturas", before: "Inserir uma a uma — horas, ou contratar ajuda", after: "Envie o lote inteiro → extração e resumo automáticos", tier: "Pro", href: "/extract-to-excel" as RouteSlug },
      { emoji: "📕", title: "Entenda um relatório longo rapidamente", before: "Ler 80 páginas para encontrar algumas respostas — horas", after: "Pergunte o que quiser → respostas com fonte em 30s", tier: "Plus", href: "/chat-with-pdf" as RouteSlug },
    ],
    compareTitle: "Comparar planos",
    compareCols: ["Grátis", "Plus", "Pro"],
    compareRows: [
      { f: "20+ ferramentas PDF — converter, comprimir, mesclar, criptografar, OCR", v: ["✓", "✓", "✓"] },
      { f: "Chat com PDF · Resumos de IA", v: ["—", "✓", "✓"] },
      { f: "Traduzir PDF com IA (mantém o formato)", v: ["—", "Em breve", "Em breve"] },
      { f: "Comparar vários documentos", v: ["—", "✓", "✓"] },
      { f: "Arquivos de 100 MB · lote · sem anúncios", v: ["—", "✓", "✓"] },
      { f: "Automatizar fluxos · API · auto-classificar", v: ["—", "—", "✓"] },
      { f: "Revisão de contratos — riscos e cláusulas ausentes", v: ["—", "—", "✓"] },
      { f: "Espaço de equipe · suporte prioritário", v: ["—", "—", "✓"] },
    ],
  },
  fr: {
    title: "Des tarifs simples. Des documents puissants.",
    subtitle: "Commencez gratuitement — sans compte, sans carte. Passez à un forfait supérieur uniquement si vous avez besoin d'IA, de fichiers plus volumineux ou d'un volume plus élevé. Annulez à tout moment, en deux clics.",
    monthly: "Mensuel",
    yearly: "Annuel",
    save: "Économisez ~40%",
    perMo: "/mois",
    mostPopular: "Le plus populaire",
    billedYearly: (v: string) => `${v} facturé annuellement`,
    trust: ["Garantie de remboursement 7 jours", "Annulez à tout moment, sans question", "Vos fichiers ne sont jamais utilisés pour entraîner nos propres modèles"],
    plans: [
      {
        name: "Gratuit",
        monthlyPrice: "$0",
        yearlyPrice: "$0",
        tagline: "Tout ce dont vous avez besoin pour le travail quotidien avec les PDF.",
        highlights: ["20+ outils PDF — convertir, compresser, fusionner, diviser", "Chiffrer, modifier les pages et OCR sur documents numérisés", "Traité dans votre navigateur — fichiers privés", "Gratuit pour toujours, sans compte nécessaire"],
        cta: "Commencer gratuitement",
        href: "/chat-with-pdf" as RouteSlug,
        featured: false,
      },
      {
        name: "Plus",
        monthlyPrice: "$5",
        yearlyPrice: "$3",
        yearlyTotal: "$36/an",
        tagline: "L'IA lit et compare vos documents — en quelques secondes.",
        valueLine: "Moins qu'un café par mois.",
        highlights: ["Tout du Gratuit", "Discutez avec n'importe quel PDF — les réponses citent la source", "Résumés et points clés IA en quelques secondes", "Comparez plusieurs documents côte à côte", "Fichiers 100 Mo, lot et priorité, sans publicités"],
        cta: "Passer à Plus",
        href: "" as RouteSlug,
        featured: true,
      },
      {
        name: "Pro",
        monthlyPrice: "$20",
        yearlyPrice: "$12",
        yearlyTotal: "$144/an",
        tagline: "Automatisez les flux de documents et la révision professionnelle.",
        highlights: ["Tout du Plus", "Automatisez les flux de traitement de documents par lots", "Révision de contrats — détecte les clauses à risque et manquantes", "Accès API et classification automatique", "Espace de travail d'équipe et support prioritaire"],
        cta: "Passer à Pro",
        href: "" as RouteSlug,
        featured: false,
      },
    ],
    faqTitle: "Questions avant d'acheter",
    faq: [
      { q: "Puis-je annuler à tout moment ?", a: "Oui. Gérez ou annulez votre abonnement vous-même en quelques clics — sans e-mail, sans artifices de rétention. Vous conservez l'accès jusqu'à la fin de la période payée." },
      { q: "Y a-t-il un remboursement ?", a: "Oui. Si Plus ou Pro ne vous convient pas, demandez un remboursement dans les 7 jours suivant le paiement et nous vous rembourserons." },
      { q: "Dois-je payer pour utiliser DockDocs ?", a: "Non. Tous les 20+ outils PDF de base sont gratuits pour toujours, sans compte nécessaire. Vous ne payez que si vous souhaitez des fonctionnalités IA, des fichiers plus volumineux ou un volume plus élevé." },
      { q: "Que se passe-t-il avec mes fichiers ?", a: "La plupart des outils traitent entièrement dans votre navigateur — vos fichiers ne quittent jamais votre appareil. Les conversions cloud sont traitées et la copie temporaire est supprimée automatiquement. Nous n'utilisons jamais vos documents pour entraîner nos propres modèles." },
      { q: "Puis-je changer de forfait par la suite ?", a: "À tout moment. Passez à un forfait supérieur, inférieur ou changez entre mensuel et annuel quand vous le souhaitez." },
    ],
    ctaTitle: "Essayez gratuitement — décidez ensuite.",
    ctaDesc: "Ouvrez n'importe quel outil maintenant. Sans compte, sans carte, sans engagement.",
    ctaBtn: "Commencer avec un outil gratuit",
    scenariosTitle: "Que peut résoudre DockDocs pour vous ?",
    scenarios: [
      { emoji: "📊", title: "Comparez des devis et choisissez le meilleur", before: "Ouvrir 3 fichiers, copier les chiffres dans un tableau — ~1h", after: "Charger → tableau comparatif + recommandation documentée — 1 min", tier: "Plus", href: "/compare" as RouteSlug },
      { emoji: "📄", title: "Repérez les pièges d'un contrat", before: "Payer 300 $ un juriste, ou signer en aveugle et le regretter", after: "L'IA détecte les clauses à risque et manquantes en quelques minutes", tier: "Pro", href: "/compare" as RouteSlug },
      { emoji: "🧾", title: "Traitez un lot de factures", before: "Les saisir une par une — des heures, ou embaucher de l'aide", after: "Déposez le lot entier → extraction et résumé automatiques", tier: "Pro", href: "/extract-to-excel" as RouteSlug },
      { emoji: "📕", title: "Comprenez un long rapport rapidement", before: "Lire 80 pages pour quelques réponses — des heures", after: "Posez vos questions → réponses documentées en 30s", tier: "Plus", href: "/chat-with-pdf" as RouteSlug },
    ],
    compareTitle: "Comparer les forfaits",
    compareCols: ["Gratuit", "Plus", "Pro"],
    compareRows: [
      { f: "20+ outils PDF — convertir, compresser, fusionner, chiffrer, OCR", v: ["✓", "✓", "✓"] },
      { f: "Chat avec PDF · Résumés IA", v: ["—", "✓", "✓"] },
      { f: "Traduire PDF avec IA (conserve le format)", v: ["—", "Bientôt", "Bientôt"] },
      { f: "Comparer plusieurs documents", v: ["—", "✓", "✓"] },
      { f: "Fichiers 100 Mo · lot · sans publicités", v: ["—", "✓", "✓"] },
      { f: "Automatiser les flux · API · auto-classer", v: ["—", "—", "✓"] },
      { f: "Révision de contrats — risques et clauses manquantes", v: ["—", "—", "✓"] },
      { f: "Espace d'équipe · support prioritaire", v: ["—", "—", "✓"] },
    ],
  },
} as const;

export function PricingPlans({ locale = "en" }: { locale?: Locale }) {
  const [yearly, setYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [openCat, setOpenCat] = useState<string | null>(null);
  const [billingLoading, setBillingLoading] = useState("");
  const [subscription, setSubscription] = useState<SubscriptionSnapshot | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const u = await getUser();
        if (!mounted || !u) return;
        const snap = await getSubscriptionSnapshot();
        if (mounted) setSubscription(snap);
      } catch {}
    }
    load();
    const unsub = onAuthChange(async (u) => {
      if (!mounted) return;
      if (u) {
        try { const snap = await getSubscriptionSnapshot(); if (mounted) setSubscription(snap); } catch {}
      } else {
        if (mounted) setSubscription(null);
      }
    });
    return () => { mounted = false; unsub(); };
  }, []);
  const zh = locale === "zh";
  const c = copy[locale] ?? copy.en;

  // Start hosted checkout for paid plans. Signed-in users go straight to Creem;
  // signed-out users (or if checkout isn't configured yet) fall back to /account
  // so they can sign in and upgrade there — instead of the button dead-ending.
  async function upgrade(plan: PaidSubscriptionPlan) {
    setBillingLoading(plan);
    try {
      await createBillingCheckoutSession(plan); // redirects to checkout on success
    } catch {
      if (typeof window !== "undefined") window.location.href = "/account";
    }
  }
  // 账户页全站统一为 /account(无语言版本)，不要按 locale 加 /zh 前缀，否则 /zh/account 会 404
  const toolHref = (href: RouteSlug) => (href ? localizedPath(locale as RouteLocale, href) : "/account");
  const eyebrow = `font-mono text-[12px] text-[color:var(--faint)] ${zh || locale === "es" || locale === "fr" ? "" : "uppercase tracking-[0.08em]"}`;
  const h2 = "text-[26px] font-normal leading-[1.15] tracking-[-0.02em] text-[color:var(--foreground)] sm:text-[32px]";

  return (
    <div className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
      {/* Header */}
      <div className="text-center">
        <p className={eyebrow}>{locale === "zh" ? "// 定价" : locale === "es" ? "// Precios" : locale === "pt" ? "// Preços" : locale === "fr" ? "// Tarifs" : "// Pricing"}</p>
        <h1 className="mt-4 text-[34px] font-normal leading-[1.08] tracking-[-0.025em] text-[color:var(--foreground)] sm:text-[48px]">
          {c.title}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-[16px] leading-[1.6] text-[color:var(--muted)]">
          {c.subtitle}
        </p>

        {/* Monthly / Yearly toggle */}
        <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-[color:var(--line)] p-1">
          <button type="button" onClick={() => setYearly(false)}
            className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition ${!yearly ? "bg-[color:var(--accent)]" : "text-[color:var(--muted)] hover:text-[color:var(--foreground)]"}`}
          >{c.monthly}</button>
          <button type="button" onClick={() => setYearly(true)}
            className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition ${yearly ? "bg-[color:var(--accent)]" : "text-[color:var(--muted)] hover:text-[color:var(--foreground)]"}`}
          >{c.yearly} <span className={`ml-1 text-[11px] ${yearly ? "text-[color:var(--on-accent)]" : "text-[color:var(--accent-strong)]"}`}>{c.save}</span></button>
        </div>
      </div>

      {/* Plans */}
      <div className="mt-12 grid gap-4 lg:grid-cols-3">
        {c.plans.map((plan) => {
          const isFree = plan.monthlyPrice === "$0";
          const price = yearly && !isFree ? plan.yearlyPrice : plan.monthlyPrice;
          const featured = plan.featured;
          const planKey: PaidSubscriptionPlan | null = isFree ? null : featured ? "PLUS" : "PRO";
          const isCurrentPlan = subscription
            ? planKey !== null && subscription.displayName.toUpperCase() === planKey
            : false;
          const ctaCls = `mt-6 flex h-11 w-full items-center justify-center rounded-full text-[14px] font-medium transition ${featured ? "bg-[color:var(--accent)] hover:bg-[color:var(--accent-hover)]" : "border border-[color:var(--line-strong)] text-[color:var(--foreground)] hover:border-[color:var(--foreground)]"}`;
          return (
            <article key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-6 transition-colors ${
                featured
                  ? "border-[color:var(--accent)] lg:-mt-2 lg:mb-2"
                  : "border-[color:var(--line)] hover:border-[color:var(--line-strong)]"
              }`}
            >
              {featured && (
                <span className="mb-3 self-start rounded-full bg-[color:var(--accent)] px-3 py-1 text-[11px] font-medium">{c.mostPopular}</span>
              )}
              <h2 className="text-[20px] font-normal text-[color:var(--foreground)]">{plan.name}</h2>

              <div className="mt-4">
                <p className="text-[44px] font-normal leading-none tracking-tight text-[color:var(--foreground)]">
                  {price}<span className="text-[16px] text-[color:var(--muted)]">{isFree ? "" : c.perMo}</span>
                </p>
                {yearly && !isFree && "yearlyTotal" in plan && plan.yearlyTotal && (
                  <p className="mt-1.5 text-[13px] text-[color:var(--muted)]">{c.billedYearly(plan.yearlyTotal)}</p>
                )}
                {!yearly && "valueLine" in plan && plan.valueLine && (
                  <p className="mt-1.5 text-[13px] text-[color:var(--accent-strong)]">{plan.valueLine}</p>
                )}
              </div>

              <p className="mt-4 text-[14px] leading-[1.5] text-[color:var(--muted)]">{plan.tagline}</p>

              <ul className="mt-6 flex-1 space-y-3">
                {plan.highlights.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[14px] leading-[1.45] text-[color:var(--foreground)]">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0 text-[color:var(--accent)]"><path d="M3 8.5l3.2 3.2L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    {item}
                  </li>
                ))}
              </ul>

              {planKey ? (
                <button type="button" onClick={() => !isCurrentPlan && upgrade(planKey)} disabled={isCurrentPlan || billingLoading === planKey} className={ctaCls}>
                  {isCurrentPlan
                    ? (locale === "zh" ? "当前套餐" : locale === "es" ? "Plan actual" : locale === "pt" ? "Plano atual" : locale === "fr" ? "Forfait actuel" : "Current plan")
                    : billingLoading === planKey
                      ? (locale === "zh" ? "跳转中…" : locale === "es" ? "Redirigiendo…" : locale === "pt" ? "Redirecionando…" : locale === "fr" ? "Redirection…" : "Redirecting…")
                      : plan.cta}
                </button>
              ) : (
                <a href={toolHref(plan.href)} className={ctaCls}>{plan.cta}</a>
              )}
            </article>
          );
        })}
      </div>

      {/* Trust bar */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
        {c.trust.map((t) => (
          <span key={t} className="flex items-center gap-2 text-[13px] text-[color:var(--muted)]">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="text-[color:var(--accent)]"><path d="M3 8.5l3.2 3.2L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            {t}
          </span>
        ))}
      </div>

      {/* Compare plans — driven by lib/tier-config.ts */}
      <div className="mx-auto mt-16 max-w-4xl">
        <p className={`${eyebrow} text-center`}>{locale === "zh" ? "// 套餐对照" : locale === "es" ? "// Comparar" : locale === "pt" ? "// Comparar" : locale === "fr" ? "// Comparer" : "// Compare"}</p>
        <h2 className={`mt-3 text-center ${h2}`}>{c.compareTitle}</h2>
        <p className="mt-2 text-center text-[13px] text-[color:var(--faint)]">
          {locale === "zh" ? "点击分类展开该类所有工具"
            : locale === "es" ? "Haz clic en una categoría para ver las herramientas que incluye"
            : locale === "pt" ? "Clique em uma categoria para ver as ferramentas que ela inclui"
            : locale === "fr" ? "Cliquez sur une catégorie pour voir les outils qu'elle inclut"
            : "Click a category to see the tools it includes"}
        </p>
        <div className="mt-8 overflow-x-auto rounded-2xl border border-[color:var(--line)]">
          <table className="w-full border-collapse text-[14px]">
            <thead>
              <tr>
                <th className="border-b border-[color:var(--line)] px-4 py-3 text-left" />
                {c.compareCols.map((col, i) => (
                  <th key={col} className={`border-b border-l border-[color:var(--line)] px-4 py-3 text-center text-[13px] font-normal ${i === 1 ? "text-[color:var(--accent-strong)]" : "text-[color:var(--foreground)]"}`}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIER_CATEGORIES.flatMap((cat) => {
                const isOpen = openCat === cat.id;
                const hasTools = cat.tools.length > 0;
                const hasFeatures = (cat.features?.length ?? 0) > 0;
                const canExpand = hasTools || hasFeatures;
                const catLabel = cat.label[locale] ?? cat.label.en;
                const lim = (tier: "free" | "plus" | "pro") => {
                  const v = cat.limits[tier];
                  return v[locale] ?? v.en;
                };
                const cellCls = (val: string) =>
                  val.startsWith("Unlimited") || val.startsWith("无限") || val.startsWith("Ilimitado") || val.startsWith("Illimité")
                    ? "font-medium text-[color:var(--foreground)]"
                  : val === "—" ? "text-[color:var(--faint)]"
                  : val.startsWith("✓") ? "font-medium text-[color:var(--accent)]"
                  : "text-[12px] text-[color:var(--muted)]";

                const rows = [
                  <tr
                    key={`row-${cat.id}`}
                    onClick={() => canExpand && setOpenCat(isOpen ? null : cat.id)}
                    className={`${canExpand ? "cursor-pointer hover:bg-[color:var(--surface-subtle)]" : ""} transition-colors`}
                  >
                    <td className="border-b border-[color:var(--line)] px-4 py-3">
                      <span className="flex items-center gap-2">
                        {canExpand ? (
                          <svg className={`h-3 w-3 shrink-0 opacity-40 transition-transform ${isOpen ? "rotate-90" : ""}`} viewBox="0 0 12 12" fill="none">
                            <path d="M4 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        ) : (
                          <span className="inline-block w-3" />
                        )}
                        <span className="text-[color:var(--foreground)]">{catLabel}</span>
                      </span>
                    </td>
                    {(["free", "plus", "pro"] as const).map((tier) => {
                      const val = lim(tier);
                      return (
                        <td key={tier} className={`border-b border-l border-[color:var(--line)] px-4 py-3 text-center ${cellCls(val)}`}>{val}</td>
                      );
                    })}
                  </tr>,
                ];

                if (isOpen && canExpand) {
                  rows.push(
                    <tr key={`tools-${cat.id}`}>
                      <td colSpan={4} className="border-b border-[color:var(--line)] bg-[color:var(--surface)] px-6 pb-4 pt-2">
                        {hasTools && (
                          <div className="flex flex-wrap gap-2">
                            {cat.tools.map((tool) => (
                              <a
                                key={tool.slug}
                                href={`/${tool.slug}/`}
                                className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--background)] px-2.5 py-1 text-[12px] text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--foreground)]"
                              >
                                {tool[locale] ?? tool.en}
                              </a>
                            ))}
                          </div>
                        )}
                        {hasFeatures && (
                          <ul className={`space-y-1.5 ${hasTools ? "mt-3" : ""}`}>
                            {(cat.features as FeatureItem[]).map((f, i) => (
                              <li key={i} className="flex items-center gap-2 text-[12.5px]">
                                <span className={f.status === "live" ? "text-[color:var(--accent)]" : "text-[color:var(--faint)]"}>
                                  {f.status === "live" ? "✓" : "○"}
                                </span>
                                {f.href ? (
                                  <a href={f.href} className="text-[color:var(--foreground)] underline-offset-2 hover:underline">
                                    {f[locale] ?? f.en}
                                  </a>
                                ) : (
                                  <span className={f.status === "live" ? "text-[color:var(--foreground)]" : "text-[color:var(--muted)]"}>
                                    {f[locale] ?? f.en}
                                  </span>
                                )}
                                {f.status === "coming" && (
                                  <span className="rounded-full border border-[color:var(--line)] px-1.5 py-0.5 text-[10px] text-[color:var(--faint)]">
                                    {locale === "zh" ? "即将推出" : locale === "es" ? "Pronto" : locale === "pt" ? "Em breve" : locale === "fr" ? "Bientôt" : "Coming"}
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                    </tr>
                  );
                }

                return rows;
              })}
            </tbody>
          </table>
        </div>
          <p className="mt-3 px-4 text-[11.5px] text-[color:var(--faint)]">
            {locale === "zh"
              ? <>* 无限套餐遵循合理使用政策，仅用于防止异常滥用。<a href="/terms/" className="underline hover:text-[color:var(--muted)]">查看条款</a></>
              : locale === "es"
              ? <>* Los planes ilimitados están sujetos a nuestra <a href="/terms/" className="underline hover:text-[color:var(--muted)]">Política de Uso Razonable</a> para evitar abusos.</>
              : locale === "pt"
              ? <>* Os planos ilimitados estão sujeitos à nossa <a href="/terms/" className="underline hover:text-[color:var(--muted)]">Política de Uso Justo</a> para evitar abusos.</>
              : locale === "fr"
              ? <>* Les forfaits illimités sont soumis à notre <a href="/terms/" className="underline hover:text-[color:var(--muted)]">Politique d'utilisation équitable</a> afin de prévenir les abus.</>
              : <>* Unlimited plans are subject to our <a href="/terms/" className="underline hover:text-[color:var(--muted)]">Fair Use Policy</a> to prevent abuse.</>
            }
          </p>
      </div>

      {/* Solutions by scenario */}
      <div className="mx-auto mt-24 max-w-5xl">
        <p className={`${eyebrow} text-center`}>{locale === "zh" ? "// 应用场景" : locale === "es" ? "// Casos de uso" : locale === "pt" ? "// Casos de uso" : locale === "fr" ? "// Cas d'usage" : "// Use cases"}</p>
        <h2 className={`mt-3 text-center ${h2}`}>{c.scenariosTitle}</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {c.scenarios.map((s) => (
            <div key={s.title} className="rounded-2xl border border-[color:var(--line)] p-5 transition-colors hover:border-[color:var(--line-strong)]">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[15px] font-normal text-[color:var(--foreground)]">{s.emoji} {s.title}</p>
                <span className="shrink-0 rounded-full border border-[color:var(--line)] px-2.5 py-0.5 text-[11px] text-[color:var(--accent)]">{s.tier}</span>
              </div>
              <p className="mt-3 text-[13px] leading-6 text-[color:var(--muted)]">😩 {s.before}</p>
              <p className="mt-1.5 text-[13px] leading-6 text-[color:var(--foreground)]"><span className="text-[color:var(--accent)]">⚡</span> {s.after}</p>
              {s.href && (
                <a href={toolHref(s.href)} className="mt-3 inline-block text-[13px] font-medium text-[color:var(--accent)] transition hover:text-[color:var(--accent-strong)]">{locale === "zh" ? "去试试 →" : locale === "es" ? "Pruébalo →" : locale === "pt" ? "Experimente →" : locale === "fr" ? "Essayez →" : "Try it →"}</a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mx-auto mt-24 max-w-3xl">
        <p className={`${eyebrow} text-center`}>{locale === "zh" ? "// 常见问题" : locale === "es" ? "// Preguntas frecuentes" : locale === "pt" ? "// Perguntas frequentes" : locale === "fr" ? "// FAQ" : "// FAQ"}</p>
        <h2 className={`mt-3 text-center ${h2}`}>{c.faqTitle}</h2>
        <div className="mt-8 divide-y divide-[color:var(--line)] border-y border-[color:var(--line)]">
          {c.faq.map((item, i) => (
            <div key={item.q}>
              <button type="button" onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left"
              >
                <span className="text-[15px] font-normal text-[color:var(--foreground)]">{item.q}</span>
                <span className={`shrink-0 text-[color:var(--muted)] transition ${openFaq === i ? "rotate-45" : ""}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                </span>
              </button>
              {openFaq === i && (
                <p className="pb-5 text-[14px] leading-7 text-[color:var(--muted)]">{item.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mx-auto mt-24 max-w-3xl text-center">
        <h2 className={h2}>{c.ctaTitle}</h2>
        <p className="mx-auto mt-4 max-w-xl text-[16px] leading-[1.55] text-[color:var(--muted)]">{c.ctaDesc}</p>
        <a href={locale === "zh" ? "/zh/" : locale === "es" ? "/es/" : locale === "pt" ? "/pt/" : locale === "fr" ? "/fr/" : "/"}
          className="mt-8 inline-flex h-11 items-center rounded-full bg-[color:var(--accent)] px-6 text-[14px] font-medium transition hover:bg-[color:var(--accent-hover)]"
        >{c.ctaBtn}</a>
      </div>
    </div>
  );
}
