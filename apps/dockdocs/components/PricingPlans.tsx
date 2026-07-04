"use client";

import { useEffect, useState } from "react";
import { headerStructure, navItemLabels, navCopy } from "@/lib/header-nav";
import { localizedPath, type RouteSlug, type RouteLocale } from "@/lib/i18n";
import { createBillingCheckoutSession, createBillingPortalSession, getSubscriptionSnapshot, startBillingTrial, BillingError, type SubscriptionSnapshot } from "@/lib/subscription-runtime";
import { isPlanUpgrade, type PaidSubscriptionPlan } from "@/lib/billing-config";
import { billingErrorCopy, type MembershipLocale } from "@/lib/membership-ui";
import { useUpgradeFlow, UpgradeConfirmModal } from "@/components/UpgradeFlow";
import { H2 as H2_CLS, eyebrowCls } from "@/components/design";
import { useWorkspaceNav } from "@/components/WorkspaceNavContext";
import { getUser, onAuthChange } from "@/lib/auth";
import { deepHant, toHant } from "@/lib/zh-hant";
import { LAYOUT } from "@/lib/layout-constants";

type Locale = "en" | "zh" | "es" | "pt" | "fr" | "ja" | "de" | "ko" | "zh-Hant";

const copy = {
  en: {
    title: "Simple pricing. Powerful, private documents.",
    subtitle: "Powerful document AI, fully unlocked with Pro — chat with any document, compare side by side, review contract risk, automate in batches, saving you dozens of hours.",
    monthly: "Monthly",
    yearly: "Yearly",
    save: "Save ~40%",
    lifetime: "Lifetime",
    perOnce: "one-time",
    lifetimeNote: "Founding rate — pay once, yours forever. Price rises later.",
    perMo: "/mo",
    billedYearly: (v: string) => `${v} billed yearly`,
    // trust bar
    trust: ["7-day money-back guarantee", "Cancel anytime, no questions", "Files never used to train our models", "7-day free trial — no credit card needed"],
    plans: [
      {
        name: "Free",
        monthlyPrice: "$0",
        yearlyPrice: "$0",
        tagline: "Everything you need for everyday PDF work.",
        highlights: ["~50 PDF tools — convert, compress, merge, split", "Encrypt, edit pages & OCR scanned docs", "Most tools run in your browser — files stay private", "Free forever, no account needed"],
        cta: "Start free now",
        href: "chat-with-pdf" as RouteSlug,
        featured: false,
      },
      {
        name: "Pro",
        monthlyPrice: "$9",
        yearlyPrice: "$6",
        yearlyTotal: "$72/yr",
        tagline: "AI reads, compares & reviews your documents — in seconds.",
        valueLine: "Less than a coffee a month.",
        highlights: ["Everything in Free", "Chat with any PDF — answers show their source when it can be located", "AI summaries & key points in seconds", "Compare multiple documents side by side", "100 MB files, batch & priority, no ads", "Automate batch document workflows", "Contract review — flags risky & missing clauses", "API access & auto-classification", "Team workspace & priority support"],
        cta: "Try free for 7 days",
        href: "" as RouteSlug,
        featured: true,
      },
    ],
    faqTitle: "Questions before you buy",
    faq: [
      { q: "Is there a free trial?", a: "Yes — sign in and your 7-day full Pro trial starts automatically. No credit card needed. One trial per account, ever. After the trial you stay on Free unless you subscribe." },
      { q: "Can I cancel anytime?", a: "Yes. Manage or cancel your subscription yourself in a couple of clicks — no emails, no retention games. You keep access until the end of the period you paid for." },
      { q: "Is there a refund?", a: "Yes — Pro and lifetime are both covered. If a plan isn't right for you, contact us within 7 days of payment and we'll refund it in full. Creem has no self-serve refund button, so just reach out — use 'Contact merchant' on your Creem order page, or email billing@dockdocs.app — and we'll handle it." },
      { q: "Do I need to pay to use DockDocs?", a: "No. All ~50 core PDF tools are free forever, with no account required. You only pay if you want AI features, larger files, or higher volume." },
      { q: "What happens to my files?", a: "Most tools process entirely in your browser — your files never leave your device. Cloud conversions are processed and the temporary copy is deleted automatically. We never use your documents to train our own models, and only the text needed to answer is sent to the AI provider." },
      { q: "Can I switch plans later?", a: "Anytime. Upgrade, downgrade, or move between monthly and yearly whenever you like." },
    ],
    ctaTitle: "Try it free — decide later.",
    ctaDesc: "Open any tool right now. No account, no card, no commitment.",
    ctaBtn: "Start with a free tool",
    scenariosTitle: "What can DockDocs solve for you?",
    scenarios: [
      { emoji: "📊", title: "Compare quotes & pick the best", before: "Open 3 files, copy numbers into a sheet — ~1 hour", after: "Upload → side-by-side table + a pick backed by the numbers — 1 min", tier: "Pro", href: "compare" as RouteSlug },
      { emoji: "📄", title: "Catch the traps in a contract", before: "Pay a lawyer $300, or sign blind and get burned", after: "AI flags risky & missing clauses in minutes", tier: "Pro", href: "compare" as RouteSlug },
      { emoji: "🧾", title: "Process a batch of invoices", before: "Key them in one by one — hours, or hire help", after: "Drop the whole batch → auto-extract & summarize", tier: "Pro", href: "extract-to-excel" as RouteSlug },
      { emoji: "📕", title: "Understand a long report fast", before: "Read 80 pages to find a few answers — hours", after: "Ask it anything → sourced answers (where located) in 30s", tier: "Pro", href: "chat-with-pdf" as RouteSlug },
    ],
    compareTitle: "Compare plans",
    compareCols: ["Free", "Pro"],
    compareRows: [
      { f: "~50 PDF tools — convert, compress, merge, encrypt, OCR", v: ["✓", "✓"] },
      { f: "Chat with PDF · AI summaries", v: ["—", "✓"] },
      { f: "AI translate PDF (keeps layout)", v: ["—", "Soon"] },
      { f: "Compare multiple documents", v: ["—", "✓"] },
      { f: "100 MB files · batch · no ads", v: ["—", "✓"] },
      { f: "Automate workflows · API · auto-classify", v: ["—", "✓"] },
      { f: "Contract review — risk & missing clauses", v: ["—", "✓"] },
      { f: "Team workspace · priority support", v: ["—", "✓"] },
    ],
  },
  zh: {
    title: "定价简单，文档强大且私密。",
    subtitle: "强大的文档 AI，Pro 一次解锁——和任意文档对话、并排比对、合同风险审查、批量自动化，替你省下几十小时。",
    monthly: "按月",
    yearly: "按年",
    save: "省约 40%",
    lifetime: "终身",
    perOnce: "一次性",
    lifetimeNote: "创始价——一次买断，永久使用，之后上调。",
    perMo: "/月",
    billedYearly: (v: string) => `按年计费 ${v}`,
    trust: ["7 天无理由退款", "随时取消，绝不刁难", "绝不用文件训练我们自己的模型", "7 天免费试用——无需信用卡"],
    plans: [
      {
        name: "免费",
        monthlyPrice: "$0",
        yearlyPrice: "$0",
        tagline: "日常 PDF 工作所需的一切。",
        highlights: ["~50 PDF 工具：转换、压缩、合并、拆分", "加密、页面编辑、扫描件 OCR", "大多数工具在浏览器本地处理——文件保持私密", "永久免费，无需注册"],
        cta: "立即免费开始",
        href: "chat-with-pdf" as RouteSlug,
        featured: false,
      },
      {
        name: "Pro",
        monthlyPrice: "$9",
        yearlyPrice: "$6",
        yearlyTotal: "$72/年",
        tagline: "AI 替你读、比、审文档——几秒搞定。",
        valueLine: "每月不到一杯咖啡的钱。",
        highlights: ["包含「免费」全部功能", "和任意 PDF 对话——能定位到原文时带出处", "AI 摘要与要点，几秒搞定", "多份文档并排对比", "100MB 大文件、批量与优先、无广告", "批量文档工作流自动化", "合同审查——标出风险与缺失条款", "API 接入与自动分类", "团队工作区与优先支持"],
        cta: "免费试用 7 天",
        href: "" as RouteSlug,
        featured: true,
      },
    ],
    faqTitle: "购买前的疑问",
    faq: [
      { q: "有免费试用期吗？", a: "有——登录后 7 天完整 Pro 试用自动开始，无需信用卡。每个账户仅可试用一次，试用结束后自动回到免费版，除非你订阅。" },
      { q: "可以随时取消吗？", a: "可以。你自己几次点击即可管理或取消订阅——无需发邮件，没有挽留套路。在你已付费的周期结束前，仍可正常使用。" },
      { q: "支持退款吗？", a: "支持——Pro 和终身均适用。如果某个套餐不适合你，在付款后 7 天内联系我们，我们为你全额退款。Creem 没有自助退款按钮，你联系一下即可——通过 Creem 订单页的「联系商家」，或邮件 billing@dockdocs.app——我们来处理。" },
      { q: "使用 DockDocs 必须付费吗？", a: "不必。全部 ~50 核心 PDF 工具永久免费，且无需注册。只有在你需要 AI 功能、更大文件或更高用量时才需付费。" },
      { q: "我的文件会怎样？", a: "大多数工具完全在你的浏览器中处理——文件绝不离开你的设备。云端转换处理后会自动删除临时副本。我们绝不会用你的文档训练我们自己的模型。" },
      { q: "之后可以更换套餐吗？", a: "随时可以。升级、降级，或在按月与按年之间切换，随你心意。" },
    ],
    ctaTitle: "先免费试用——之后再决定。",
    ctaDesc: "现在就打开任意工具。无需注册、无需信用卡、无需承诺。",
    ctaBtn: "从一个免费工具开始",
    scenariosTitle: "DockDocs 能替你解决什么？",
    scenarios: [
      { emoji: "📊", title: "比报价，选最优", before: "开 3 个文件抄数字进表格 —— 约 1 小时", after: "上传 → 并排对比表 + 基于并排数据的推荐 —— 1 分钟", tier: "Pro", href: "compare" as RouteSlug },
      { emoji: "📄", title: "看穿合同里的坑", before: "花 $300 找律师，或盲签踩坑", after: "AI 几分钟标出风险与缺失条款", tier: "Pro", href: "compare" as RouteSlug },
      { emoji: "🧾", title: "批量处理发票", before: "一张张录入几小时，或雇人", after: "整批丢进去 → 自动抽取汇总", tier: "Pro", href: "extract-to-excel" as RouteSlug },
      { emoji: "📕", title: "快速读懂长报告", before: "读 80 页找几个答案 —— 几小时", after: "问它任何问题 → 30 秒得到答案，能定位时带出处", tier: "Pro", href: "chat-with-pdf" as RouteSlug },
    ],
    compareTitle: "套餐对照",
    compareCols: ["免费", "Pro"],
    compareRows: [
      { f: "~50 PDF 工具(转换/压缩/合并/加密/OCR)", v: ["✓", "✓"] },
      { f: "和 PDF 对话 · AI 摘要", v: ["—", "✓"] },
      { f: "AI 翻译 PDF(保留版式)", v: ["—", "即将"] },
      { f: "多文档对比", v: ["—", "✓"] },
      { f: "100MB 大文件 · 批量 · 无广告", v: ["—", "✓"] },
      { f: "工作流自动化 · API · 自动分类", v: ["—", "✓"] },
      { f: "合同审查(风险与缺失条款)", v: ["—", "✓"] },
      { f: "团队工作区 · 优先支持", v: ["—", "✓"] },
    ],
  },
  es: {
    title: "Precios simples. Documentos potentes y privados.",
    subtitle: "IA documental potente, completamente desbloqueada con Pro — chatea con cualquier documento, compara en paralelo, revisa riesgos contractuales, automatiza en lote, ahorrándote decenas de horas.",
    monthly: "Mensual",
    yearly: "Anual",
    save: "Ahorra ~40%",
    lifetime: "De por vida",
    perOnce: "pago único",
    lifetimeNote: "Precio fundador: paga una vez, tuyo para siempre. Subirá después.",
    perMo: "/mes",
    billedYearly: (v: string) => `${v} facturado anualmente`,
    trust: ["Garantía de devolución de 7 días", "Cancela en cualquier momento, sin preguntas", "Tus archivos nunca se usan para entrenar nuestros propios modelos", "7 días de prueba gratis — sin tarjeta de crédito"],
    plans: [
      {
        name: "Gratis",
        monthlyPrice: "$0",
        yearlyPrice: "$0",
        tagline: "Todo lo que necesitas para el trabajo diario con PDF.",
        highlights: ["~50 herramientas PDF — convertir, comprimir, unir, dividir", "Encriptar, editar páginas y OCR de docs escaneados", "La mayoría de herramientas se procesan en tu navegador — los archivos permanecen privados", "Gratis para siempre, sin cuenta necesaria"],
        cta: "Empieza gratis ahora",
        href: "chat-with-pdf" as RouteSlug,
        featured: false,
      },
      {
        name: "Pro",
        monthlyPrice: "$9",
        yearlyPrice: "$6",
        yearlyTotal: "$72/año",
        tagline: "La IA lee, compara y revisa tus documentos — en segundos.",
        valueLine: "Menos que un café al mes.",
        highlights: ["Todo lo de Gratis", "Chatea con cualquier PDF — las respuestas muestran su fuente cuando puede localizarse", "Resúmenes e ideas clave de IA en segundos", "Compara múltiples documentos lado a lado", "Archivos de 100 MB, lotes y prioridad, sin anuncios", "Automatiza flujos de trabajo de documentos en lote", "Revisión de contratos — detecta cláusulas arriesgadas y faltantes", "Acceso a API y clasificación automática", "Espacio de trabajo en equipo y soporte prioritario"],
        cta: "Prueba gratis 7 días",
        href: "" as RouteSlug,
        featured: true,
      },
    ],
    faqTitle: "Preguntas antes de comprar",
    faq: [
      { q: "¿Hay una prueba gratuita?", a: "Sí — inicia sesión y tu prueba de 7 días de Pro completo comienza automáticamente. Sin tarjeta de crédito. Una prueba por cuenta. Después vuelves al plan Gratis a menos que te suscribas." },
      { q: "¿Puedo cancelar en cualquier momento?", a: "Sí. Gestiona o cancela tu suscripción tú mismo en un par de clics — sin correos, sin trucos de retención. Mantienes el acceso hasta el final del período que pagaste." },
      { q: "¿Hay reembolsos?", a: "Sí: Pro y de por vida están cubiertos. Si un plan no es lo que buscas, contáctanos dentro de los 7 días del pago y te lo reembolsamos por completo. Creem no tiene un botón de reembolso automático, así que solo escríbenos — con «Contactar al comerciante» en tu página de pedido de Creem, o por correo a billing@dockdocs.app — y lo gestionamos." },
      { q: "¿Necesito pagar para usar DockDocs?", a: "No. Las ~50 herramientas PDF básicas son gratuitas para siempre, sin necesidad de cuenta. Solo pagas si quieres funciones de IA, archivos más grandes o mayor volumen." },
      { q: "¿Qué pasa con mis archivos?", a: "La mayoría de herramientas procesan completamente en tu navegador — tus archivos nunca salen de tu dispositivo. Las conversiones en la nube se procesan y la copia temporal se elimina automáticamente. Nunca usamos tus documentos para entrenar nuestros propios modelos." },
      { q: "¿Puedo cambiar de plan después?", a: "En cualquier momento. Actualiza, baja de plan o cambia entre mensual y anual cuando quieras." },
    ],
    ctaTitle: "Pruébalo gratis — decide después.",
    ctaDesc: "Abre cualquier herramienta ahora mismo. Sin cuenta, sin tarjeta, sin compromiso.",
    ctaBtn: "Empieza con una herramienta gratuita",
    scenariosTitle: "¿Qué puede resolver DockDocs para ti?",
    scenarios: [
      { emoji: "📊", title: "Compara presupuestos y elige el mejor", before: "Abrir 3 archivos, copiar números en una hoja — ~1 hora", after: "Subir → tabla comparativa + recomendación basada en los datos — 1 min", tier: "Pro", href: "compare" as RouteSlug },
      { emoji: "📄", title: "Detecta las trampas en un contrato", before: "Pagar $300 a un abogado, o firmar a ciegas y salir perdiendo", after: "La IA detecta cláusulas arriesgadas y faltantes en minutos", tier: "Pro", href: "compare" as RouteSlug },
      { emoji: "🧾", title: "Procesa un lote de facturas", before: "Introducirlas una por una — horas, o contratar ayuda", after: "Sube el lote completo → extracción y resumen automático", tier: "Pro", href: "extract-to-excel" as RouteSlug },
      { emoji: "📕", title: "Entiende un informe largo rápidamente", before: "Leer 80 páginas para encontrar unas respuestas — horas", after: "Pregúntale lo que sea → respuestas con su fuente cuando se localiza, en 30s", tier: "Pro", href: "chat-with-pdf" as RouteSlug },
    ],
    compareTitle: "Comparar planes",
    compareCols: ["Gratis", "Pro"],
    compareRows: [
      { f: "~50 herramientas PDF — convertir, comprimir, unir, encriptar, OCR", v: ["✓", "✓"] },
      { f: "Chat con PDF · Resúmenes de IA", v: ["—", "✓"] },
      { f: "Traducir PDF con IA (mantiene el formato)", v: ["—", "Pronto"] },
      { f: "Comparar múltiples documentos", v: ["—", "✓"] },
      { f: "Archivos de 100 MB · lotes · sin anuncios", v: ["—", "✓"] },
      { f: "Automatizar flujos · API · auto-clasificar", v: ["—", "✓"] },
      { f: "Revisión de contratos — riesgos y cláusulas faltantes", v: ["—", "✓"] },
      { f: "Espacio de equipo · soporte prioritario", v: ["—", "✓"] },
    ],
  },
  pt: {
    title: "Preços simples. Documentos poderosos e privados.",
    subtitle: "IA documental poderosa, completamente desbloqueada com Pro — converse com qualquer documento, compare lado a lado, analise riscos contratuais, automatize em lote, economizando dezenas de horas.",
    monthly: "Mensal",
    yearly: "Anual",
    save: "Economize ~40%",
    lifetime: "Vitalício",
    perOnce: "pagamento único",
    lifetimeNote: "Preço fundador: pague uma vez, seu para sempre. O preço sobe depois.",
    perMo: "/mês",
    billedYearly: (v: string) => `${v} cobrado anualmente`,
    trust: ["Garantia de reembolso de 7 dias", "Cancele a qualquer momento, sem perguntas", "Seus arquivos nunca são usados para treinar nossos próprios modelos", "7 dias de teste grátis — sem cartão de crédito"],
    plans: [
      {
        name: "Grátis",
        monthlyPrice: "$0",
        yearlyPrice: "$0",
        tagline: "Tudo que você precisa para o trabalho diário com PDF.",
        highlights: ["~50 ferramentas PDF — converter, comprimir, mesclar, dividir", "Criptografar, editar páginas e OCR de docs digitalizados", "A maioria das ferramentas processa no seu navegador — arquivos ficam privados", "Grátis para sempre, sem conta necessária"],
        cta: "Comece grátis agora",
        href: "chat-with-pdf" as RouteSlug,
        featured: false,
      },
      {
        name: "Pro",
        monthlyPrice: "$9",
        yearlyPrice: "$6",
        yearlyTotal: "$72/ano",
        tagline: "A IA lê, compara e revisa seus documentos — em segundos.",
        valueLine: "Menos que um café por mês.",
        highlights: ["Tudo do Grátis", "Converse com qualquer PDF — respostas mostram a fonte quando pode ser localizada", "Resumos e pontos-chave com IA em segundos", "Compare vários documentos lado a lado", "Arquivos de 100 MB, lote e prioridade, sem anúncios", "Automatize fluxos de trabalho de documentos em lote", "Revisão de contratos — detecta cláusulas arriscadas e ausentes", "Acesso à API e classificação automática", "Espaço de trabalho em equipe e suporte prioritário"],
        cta: "Experimente grátis 7 dias",
        href: "" as RouteSlug,
        featured: true,
      },
    ],
    faqTitle: "Perguntas antes de comprar",
    faq: [
      { q: "Há um período de teste?", a: "Sim — entre com sua conta e seu teste de 7 dias do Pro completo começa automaticamente. Sem cartão de crédito. Um teste por conta. Depois você volta ao plano Grátis a menos que assine." },
      { q: "Posso cancelar a qualquer momento?", a: "Sim. Gerencie ou cancele sua assinatura você mesmo em alguns cliques — sem e-mails, sem truques de retenção. Você mantém o acesso até o final do período pago." },
      { q: "Há reembolso?", a: "Sim — Pro e vitalício estão cobertos. Se um plano não for o certo para você, entre em contato dentro de 7 dias do pagamento e devolvemos o valor integral. A Creem não tem botão de reembolso automático, então é só falar conosco — pelo «Contatar comerciante» na sua página de pedido da Creem, ou por e-mail para billing@dockdocs.app — que cuidamos disso." },
      { q: "Preciso pagar para usar o DockDocs?", a: "Não. Todas as ~50 ferramentas PDF básicas são gratuitas para sempre, sem necessidade de conta. Você só paga se quiser recursos de IA, arquivos maiores ou maior volume." },
      { q: "O que acontece com meus arquivos?", a: "A maioria das ferramentas processa inteiramente no seu navegador — seus arquivos nunca saem do seu dispositivo. Conversões em nuvem são processadas e a cópia temporária é excluída automaticamente. Nunca usamos seus documentos para treinar nossos próprios modelos." },
      { q: "Posso trocar de plano depois?", a: "A qualquer momento. Faça upgrade, downgrade ou mude entre mensal e anual quando quiser." },
    ],
    ctaTitle: "Experimente grátis — decida depois.",
    ctaDesc: "Abra qualquer ferramenta agora mesmo. Sem conta, sem cartão, sem compromisso.",
    ctaBtn: "Comece com uma ferramenta gratuita",
    scenariosTitle: "O que o DockDocs pode resolver para você?",
    scenarios: [
      { emoji: "📊", title: "Compare orçamentos e escolha o melhor", before: "Abrir 3 arquivos, copiar números numa planilha — ~1 hora", after: "Carregar → tabela comparativa + recomendação baseada nos dados — 1 min", tier: "Pro", href: "compare" as RouteSlug },
      { emoji: "📄", title: "Detecte as armadilhas em um contrato", before: "Pagar $300 a um advogado, ou assinar às cegas e se arrepender", after: "A IA detecta cláusulas arriscadas e ausentes em minutos", tier: "Pro", href: "compare" as RouteSlug },
      { emoji: "🧾", title: "Processe um lote de faturas", before: "Inserir uma a uma — horas, ou contratar ajuda", after: "Envie o lote inteiro → extração e resumo automáticos", tier: "Pro", href: "extract-to-excel" as RouteSlug },
      { emoji: "📕", title: "Entenda um relatório longo rapidamente", before: "Ler 80 páginas para encontrar algumas respostas — horas", after: "Pergunte o que quiser → respostas com a fonte quando localizável, em 30s", tier: "Pro", href: "chat-with-pdf" as RouteSlug },
    ],
    compareTitle: "Comparar planos",
    compareCols: ["Grátis", "Pro"],
    compareRows: [
      { f: "~50 ferramentas PDF — converter, comprimir, mesclar, criptografar, OCR", v: ["✓", "✓"] },
      { f: "Chat com PDF · Resumos de IA", v: ["—", "✓"] },
      { f: "Traduzir PDF com IA (mantém o formato)", v: ["—", "Em breve"] },
      { f: "Comparar vários documentos", v: ["—", "✓"] },
      { f: "Arquivos de 100 MB · lote · sem anúncios", v: ["—", "✓"] },
      { f: "Automatizar fluxos · API · auto-classificar", v: ["—", "✓"] },
      { f: "Revisão de contratos — riscos e cláusulas ausentes", v: ["—", "✓"] },
      { f: "Espaço de equipe · suporte prioritário", v: ["—", "✓"] },
    ],
  },
  fr: {
    title: "Des tarifs simples. Des documents puissants et privés.",
    subtitle: "Une IA documentaire puissante, entièrement débloquée avec Pro — dialoguez avec n'importe quel document, comparez côte à côte, analysez les risques contractuels, automatisez en lot, et gagnez des dizaines d'heures.",
    monthly: "Mensuel",
    yearly: "Annuel",
    save: "Économisez ~40%",
    lifetime: "À vie",
    perOnce: "paiement unique",
    lifetimeNote: "Tarif fondateur — payez une fois, à vous pour toujours. Le prix augmentera ensuite.",
    perMo: "/mois",
    billedYearly: (v: string) => `${v} facturé annuellement`,
    trust: ["Garantie de remboursement 7 jours", "Annulez à tout moment, sans question", "Vos fichiers ne sont jamais utilisés pour entraîner nos propres modèles", "7 jours d'essai gratuit — sans carte bancaire"],
    plans: [
      {
        name: "Gratuit",
        monthlyPrice: "$0",
        yearlyPrice: "$0",
        tagline: "Tout ce dont vous avez besoin pour le travail quotidien avec les PDF.",
        highlights: ["~50 outils PDF — convertir, compresser, fusionner, diviser", "Chiffrer, modifier les pages et OCR sur documents numérisés", "La plupart des outils fonctionnent dans votre navigateur — fichiers privés", "Gratuit pour toujours, sans compte nécessaire"],
        cta: "Commencer gratuitement",
        href: "chat-with-pdf" as RouteSlug,
        featured: false,
      },
      {
        name: "Pro",
        monthlyPrice: "$9",
        yearlyPrice: "$6",
        yearlyTotal: "$72/an",
        tagline: "L'IA lit, compare et révise vos documents — en quelques secondes.",
        valueLine: "Moins qu'un café par mois.",
        highlights: ["Tout du Gratuit", "Discutez avec n'importe quel PDF — les réponses montrent leur source lorsqu'elle peut être localisée", "Résumés et points clés IA en quelques secondes", "Comparez plusieurs documents côte à côte", "Fichiers 100 Mo, lot et priorité, sans publicités", "Automatisez les flux de traitement de documents par lots", "Révision de contrats — détecte les clauses à risque et manquantes", "Accès API et classification automatique", "Espace de travail d'équipe et support prioritaire"],
        cta: "Essai gratuit 7 jours",
        href: "" as RouteSlug,
        featured: true,
      },
    ],
    faqTitle: "Questions avant d'acheter",
    faq: [
      { q: "Y a-t-il un essai gratuit ?", a: "Oui — connectez-vous et votre essai de 7 jours Pro complet démarre automatiquement. Sans carte bancaire. Un essai par compte. Après l'essai, vous revenez au forfait Gratuit sauf abonnement." },
      { q: "Puis-je annuler à tout moment ?", a: "Oui. Gérez ou annulez votre abonnement vous-même en quelques clics — sans e-mail, sans artifices de rétention. Vous conservez l'accès jusqu'à la fin de la période payée." },
      { q: "Y a-t-il un remboursement ?", a: "Oui — Pro et à vie sont couverts. Si une formule ne vous convient pas, contactez-nous dans les 7 jours suivant le paiement et nous vous remboursons intégralement. Creem n'a pas de bouton de remboursement en libre-service, écrivez-nous simplement — via « Contacter le marchand » sur votre page de commande Creem, ou par e-mail à billing@dockdocs.app — et nous nous en occupons." },
      { q: "Dois-je payer pour utiliser DockDocs ?", a: "Non. Tous les ~50 outils PDF de base sont gratuits pour toujours, sans compte nécessaire. Vous ne payez que si vous souhaitez des fonctionnalités IA, des fichiers plus volumineux ou un volume plus élevé." },
      { q: "Que se passe-t-il avec mes fichiers ?", a: "La plupart des outils traitent entièrement dans votre navigateur — vos fichiers ne quittent jamais votre appareil. Les conversions cloud sont traitées et la copie temporaire est supprimée automatiquement. Nous n'utilisons jamais vos documents pour entraîner nos propres modèles." },
      { q: "Puis-je changer de forfait par la suite ?", a: "À tout moment. Passez à un forfait supérieur, inférieur ou changez entre mensuel et annuel quand vous le souhaitez." },
    ],
    ctaTitle: "Essayez gratuitement — décidez ensuite.",
    ctaDesc: "Ouvrez n'importe quel outil maintenant. Sans compte, sans carte, sans engagement.",
    ctaBtn: "Commencer avec un outil gratuit",
    scenariosTitle: "Que peut résoudre DockDocs pour vous ?",
    scenarios: [
      { emoji: "📊", title: "Comparez des devis et choisissez le meilleur", before: "Ouvrir 3 fichiers, copier les chiffres dans un tableau — ~1h", after: "Charger → tableau comparatif + recommandation fondée sur les chiffres — 1 min", tier: "Pro", href: "compare" as RouteSlug },
      { emoji: "📄", title: "Repérez les pièges d'un contrat", before: "Payer 300 $ un juriste, ou signer en aveugle et le regretter", after: "L'IA détecte les clauses à risque et manquantes en quelques minutes", tier: "Pro", href: "compare" as RouteSlug },
      { emoji: "🧾", title: "Traitez un lot de factures", before: "Les saisir une par une — des heures, ou embaucher de l'aide", after: "Déposez le lot entier → extraction et résumé automatiques", tier: "Pro", href: "extract-to-excel" as RouteSlug },
      { emoji: "📕", title: "Comprenez un long rapport rapidement", before: "Lire 80 pages pour quelques réponses — des heures", after: "Posez vos questions → réponses avec leur source quand localisable, en 30s", tier: "Pro", href: "chat-with-pdf" as RouteSlug },
    ],
    compareTitle: "Comparer les forfaits",
    compareCols: ["Gratuit", "Pro"],
    compareRows: [
      { f: "~50 outils PDF — convertir, compresser, fusionner, chiffrer, OCR", v: ["✓", "✓"] },
      { f: "Chat avec PDF · Résumés IA", v: ["—", "✓"] },
      { f: "Traduire PDF avec IA (conserve le format)", v: ["—", "Bientôt"] },
      { f: "Comparer plusieurs documents", v: ["—", "✓"] },
      { f: "Fichiers 100 Mo · lot · sans publicités", v: ["—", "✓"] },
      { f: "Automatiser les flux · API · auto-classer", v: ["—", "✓"] },
      { f: "Révision de contrats — risques et clauses manquantes", v: ["—", "✓"] },
      { f: "Espace d'équipe · support prioritaire", v: ["—", "✓"] },
    ],
  },
  ja: {
    title: "シンプルな料金。強力でプライベートなドキュメント。",
    subtitle: "Pro で全機能が開放される強力なドキュメント AI — 任意の資料とチャット、並列比較、契約リスク審査、バッチ自動化で、何十時間も節約できます。",
    monthly: "月額",
    yearly: "年額",
    save: "約40%お得",
    lifetime: "買い切り",
    perOnce: "一回限り",
    lifetimeNote: "創設者価格 — 一度の支払いで永久に利用可能。価格は今後上がります。",
    perMo: "/月",
    billedYearly: (v: string) => `年額 ${v} で請求`,
    trust: ["7日間返金保証", "いつでも解約可能、理由不要", "ファイルは自社モデルの学習に使用しません", "7日間無料トライアル — クレジットカード不要"],
    plans: [
      {
        name: "Free",
        monthlyPrice: "$0",
        yearlyPrice: "$0",
        tagline: "日常のPDF作業に必要なすべて。",
        highlights: ["約50のPDFツール — 変換、圧縮、結合、分割", "暗号化、ページ編集、スキャン文書のOCR", "ほとんどのツールはブラウザ内で処理 — ファイルは非公開のまま", "永久無料、アカウント不要"],
        cta: "今すぐ無料で始める",
        href: "chat-with-pdf" as RouteSlug,
        featured: false,
      },
      {
        name: "Pro",
        monthlyPrice: "$9",
        yearlyPrice: "$6",
        yearlyTotal: "$72/年",
        tagline: "AIがあなたのドキュメントを読み、比較し、審査します — 数秒で。",
        valueLine: "月にコーヒー1杯以下。",
        highlights: ["Freeのすべて", "あらゆるPDFと対話 — 特定できる場合は回答に出典を表示", "AIによる要約と要点を数秒で", "複数のドキュメントを並べて比較", "100MBのファイル、一括処理と優先、広告なし", "一括ドキュメントワークフローを自動化", "契約書レビュー — リスクや欠落条項を指摘", "APIアクセスと自動分類", "チームワークスペースと優先サポート"],
        cta: "7日間無料で試す",
        href: "" as RouteSlug,
        featured: true,
      },
    ],
    faqTitle: "購入前のよくある質問",
    faq: [
      { q: "無料トライアルはありますか？", a: "はい — サインインすると7日間のPro全機能トライアルが自動的に始まります。クレジットカード不要。アカウントごとに1回のみ。トライアル終了後、サブスクリプションを開始しない場合は無料プランに戻ります。" },
      { q: "いつでも解約できますか？", a: "はい。数クリックでご自身でサブスクリプションを管理・解約できます — メール不要、引き止めの仕掛けもありません。お支払い済みの期間の終了までは引き続きご利用いただけます。" },
      { q: "返金はありますか？", a: "はい — Proと買い切りプランの両方が対象です。プランがご希望に合わない場合は、お支払いから7日以内にご連絡いただければ全額返金いたします。Creemにはセルフサービスの返金ボタンがないため、ご一報ください — Creemの注文ページの「販売者に問い合わせる」をご利用いただくか、billing@dockdocs.app までメールをお送りください。こちらで対応いたします。" },
      { q: "DockDocsの利用に支払いは必要ですか？", a: "いいえ。約50のコアPDFツールはすべて永久無料で、アカウントも不要です。AI機能、より大きなファイル、より多い処理量が必要な場合のみお支払いいただきます。" },
      { q: "私のファイルはどうなりますか？", a: "ほとんどのツールは完全にブラウザ内で処理されます — ファイルがお使いのデバイスから出ることはありません。クラウド変換は処理後、一時コピーが自動的に削除されます。お客様のドキュメントを自社モデルの学習に使用することは一切なく、回答に必要なテキストのみがAIプロバイダーに送信されます。" },
      { q: "後でプランを変更できますか？", a: "いつでも可能です。アップグレード、ダウングレード、月額と年額の切り替えをいつでもお好きに行えます。" },
    ],
    ctaTitle: "無料で試して — 後で決める。",
    ctaDesc: "今すぐどのツールも開けます。アカウント不要、カード不要、契約不要。",
    ctaBtn: "無料ツールから始める",
    scenariosTitle: "DockDocsはあなたの何を解決できる？",
    scenarios: [
      { emoji: "📊", title: "見積もりを比較して最適なものを選ぶ", before: "3つのファイルを開いて数字をシートにコピー — 約1時間", after: "アップロード → 並列比較表 + 数値に基づくおすすめ — 1分", tier: "Pro", href: "compare" as RouteSlug },
      { emoji: "📄", title: "契約書の落とし穴を見抜く", before: "弁護士に$300払うか、よく見ずに署名して痛い目に遭う", after: "AIが数分でリスクや欠落条項を指摘", tier: "Pro", href: "compare" as RouteSlug },
      { emoji: "🧾", title: "請求書を一括処理する", before: "1枚ずつ入力 — 数時間、または人を雇う", after: "バッチごと投入 → 自動で抽出・要約", tier: "Pro", href: "extract-to-excel" as RouteSlug },
      { emoji: "📕", title: "長いレポートを素早く理解する", before: "80ページを読んでいくつかの答えを探す — 数時間", after: "何でも質問 → 30秒で回答（特定できる場合は出典付き）", tier: "Pro", href: "chat-with-pdf" as RouteSlug },
    ],
    compareTitle: "プランを比較",
    compareCols: ["Free", "Pro"],
    compareRows: [
      { f: "約50のPDFツール — 変換、圧縮、結合、暗号化、OCR", v: ["✓", "✓"] },
      { f: "PDFと対話 · AI要約", v: ["—", "✓"] },
      { f: "AIでPDFを翻訳（レイアウト保持）", v: ["—", "近日"] },
      { f: "複数のドキュメントを比較", v: ["—", "✓"] },
      { f: "100MBのファイル · 一括処理 · 広告なし", v: ["—", "✓"] },
      { f: "ワークフロー自動化 · API · 自動分類", v: ["—", "✓"] },
      { f: "契約書レビュー — リスクと欠落条項", v: ["—", "✓"] },
      { f: "チームワークスペース · 優先サポート", v: ["—", "✓"] },
    ],
  },
  de: {
    title: "Einfache Preise. Leistungsstarke, private Dokumente.",
    subtitle: "Leistungsstarke Dokumenten-KI, mit Pro vollständig freigeschaltet — mit beliebigen Dokumenten chatten, nebeneinander vergleichen, Vertragsrisiken prüfen, stapelweise automatisieren und dabei Dutzende Stunden sparen.",
    monthly: "Monatlich",
    yearly: "Jährlich",
    save: "Sparen Sie ~40 %",
    lifetime: "Lebenslang",
    perOnce: "einmalig",
    lifetimeNote: "Gründerpreis — einmal zahlen, für immer Ihres. Der Preis steigt später.",
    perMo: "/Mon.",
    billedYearly: (v: string) => `${v} jährlich abgerechnet`,
    trust: ["7 Tage Geld-zurück-Garantie", "Jederzeit kündbar, ohne Nachfragen", "Dateien werden nie zum Training unserer Modelle verwendet", "7 Tage kostenlose Testversion — keine Kreditkarte nötig"],
    plans: [
      {
        name: "Free",
        monthlyPrice: "$0",
        yearlyPrice: "$0",
        tagline: "Alles, was Sie für die tägliche PDF-Arbeit brauchen.",
        highlights: ["~50 PDF-Tools — konvertieren, komprimieren, zusammenfügen, teilen", "Verschlüsseln, Seiten bearbeiten und OCR für gescannte Dokumente", "Im Browser verarbeitet — die meisten Tools laufen lokal, Dateien bleiben privat", "Für immer kostenlos, kein Konto nötig"],
        cta: "Jetzt kostenlos starten",
        href: "chat-with-pdf" as RouteSlug,
        featured: false,
      },
      {
        name: "Pro",
        monthlyPrice: "$9",
        yearlyPrice: "$6",
        yearlyTotal: "$72/Jahr",
        tagline: "Die KI liest, vergleicht und prüft Ihre Dokumente — in Sekunden.",
        valueLine: "Weniger als ein Kaffee im Monat.",
        highlights: ["Alles aus Free", "Mit jedem PDF chatten — Antworten zeigen die Quelle, wenn sie auffindbar ist", "KI-Zusammenfassungen und Kernpunkte in Sekunden", "Mehrere Dokumente nebeneinander vergleichen", "100-MB-Dateien, Stapelverarbeitung und Priorität, ohne Werbung", "Stapel-Dokument-Workflows automatisieren", "Vertragsprüfung — markiert riskante und fehlende Klauseln", "API-Zugriff und automatische Klassifizierung", "Team-Arbeitsbereich und priorisierter Support"],
        cta: "7 Tage kostenlos testen",
        href: "" as RouteSlug,
        featured: true,
      },
    ],
    faqTitle: "Fragen vor dem Kauf",
    faq: [
      { q: "Gibt es eine kostenlose Testphase?", a: "Ja — melden Sie sich an und Ihr 7-tägiger Pro-Testzeitraum startet automatisch. Keine Kreditkarte nötig. Einmal pro Konto. Nach dem Test kehren Sie zum kostenlosen Tarif zurück, sofern Sie kein Abonnement abschließen." },
      { q: "Kann ich jederzeit kündigen?", a: "Ja. Verwalten oder kündigen Sie Ihr Abonnement selbst mit ein paar Klicks — keine E-Mails, keine Halte-Tricks. Sie behalten den Zugriff bis zum Ende des bezahlten Zeitraums." },
      { q: "Gibt es eine Rückerstattung?", a: "Ja — Pro und Lebenslang sind beide abgedeckt. Wenn ein Tarif nicht das Richtige für Sie ist, kontaktieren Sie uns innerhalb von 7 Tagen nach der Zahlung und wir erstatten Ihnen den vollen Betrag. Creem hat keinen Selbstbedienungs-Button für Rückerstattungen, melden Sie sich also einfach — über 'Händler kontaktieren' auf Ihrer Creem-Bestellseite oder per E-Mail an billing@dockdocs.app — und wir kümmern uns darum." },
      { q: "Muss ich für DockDocs bezahlen?", a: "Nein. Alle ~50 grundlegenden PDF-Tools sind für immer kostenlos, ohne Konto. Sie zahlen nur, wenn Sie KI-Funktionen, größere Dateien oder mehr Volumen möchten." },
      { q: "Was passiert mit meinen Dateien?", a: "Die meisten Tools verarbeiten alles in Ihrem Browser — Ihre Dateien verlassen Ihr Gerät nie. Ein paar Cloud-Konvertierungen laufen serverseitig; die temporäre Kopie wird danach automatisch gelöscht. Wir verwenden Ihre Dokumente nie zum Training unserer eigenen Modelle, und nur der für die Antwort nötige Text wird an den KI-Anbieter gesendet." },
      { q: "Kann ich später den Tarif wechseln?", a: "Jederzeit. Upgraden, downgraden oder zwischen monatlich und jährlich wechseln, wann immer Sie möchten." },
    ],
    ctaTitle: "Kostenlos ausprobieren — später entscheiden.",
    ctaDesc: "Öffnen Sie jetzt ein beliebiges Tool. Ohne Konto, ohne Karte, ohne Verpflichtung.",
    ctaBtn: "Mit einem kostenlosen Tool starten",
    scenariosTitle: "Was kann DockDocs für Sie lösen?",
    scenarios: [
      { emoji: "📊", title: "Angebote vergleichen und das beste wählen", before: "3 Dateien öffnen, Zahlen in eine Tabelle kopieren — ~1 Std.", after: "Hochladen → Vergleichstabelle + eine durch die Zahlen gestützte Empfehlung — 1 Min.", tier: "Pro", href: "compare" as RouteSlug },
      { emoji: "📄", title: "Die Fallen in einem Vertrag erkennen", before: "300 $ für einen Anwalt zahlen oder blind unterschreiben und Schaden nehmen", after: "Die KI markiert riskante und fehlende Klauseln in Minuten", tier: "Pro", href: "compare" as RouteSlug },
      { emoji: "🧾", title: "Einen Stapel Rechnungen verarbeiten", before: "Sie einzeln eintippen — Stunden, oder Hilfe einstellen", after: "Den ganzen Stapel ablegen → automatisch extrahieren und zusammenfassen", tier: "Pro", href: "extract-to-excel" as RouteSlug },
      { emoji: "📕", title: "Einen langen Bericht schnell verstehen", before: "80 Seiten lesen, um ein paar Antworten zu finden — Stunden", after: "Fragen Sie alles → belegte Antworten (wo auffindbar) in 30 Sek.", tier: "Pro", href: "chat-with-pdf" as RouteSlug },
    ],
    compareTitle: "Tarife vergleichen",
    compareCols: ["Free", "Pro"],
    compareRows: [
      { f: "~50 PDF-Tools — konvertieren, komprimieren, zusammenfügen, verschlüsseln, OCR", v: ["✓", "✓"] },
      { f: "Mit PDF chatten · KI-Zusammenfassungen", v: ["—", "✓"] },
      { f: "PDF mit KI übersetzen (behält das Layout)", v: ["—", "Bald"] },
      { f: "Mehrere Dokumente vergleichen", v: ["—", "✓"] },
      { f: "100-MB-Dateien · Stapel · ohne Werbung", v: ["—", "✓"] },
      { f: "Workflows automatisieren · API · Auto-Klassifizierung", v: ["—", "✓"] },
      { f: "Vertragsprüfung — Risiko- und fehlende Klauseln", v: ["—", "✓"] },
      { f: "Team-Arbeitsbereich · priorisierter Support", v: ["—", "✓"] },
    ],
  },
  ko: {
    title: "간단한 요금제. 강력하고 안전한 문서 작업.",
    subtitle: "Pro로 완전히 잠금 해제되는 강력한 문서 AI — 모든 문서와 대화, 나란히 비교, 계약 위험 검토, 대량 자동화로 수십 시간을 절약하세요.",
    monthly: "월간",
    yearly: "연간",
    save: "약 40% 절약",
    lifetime: "평생",
    perOnce: "1회 결제",
    lifetimeNote: "창립 기념가 — 한 번 결제하면 평생 사용. 가격은 추후 인상됩니다.",
    perMo: "/월",
    billedYearly: (v: string) => `연간 ${v} 청구`,
    trust: ["7일 환불 보장", "언제든 해지, 묻지 않습니다", "파일을 자사 모델 학습에 절대 사용하지 않습니다", "7일 무료 체험 — 신용카드 불필요"],
    plans: [
      {
        name: "Free",
        monthlyPrice: "$0",
        yearlyPrice: "$0",
        tagline: "일상적인 PDF 작업에 필요한 모든 것.",
        highlights: ["약 50가지 PDF 도구 — 변환, 압축, 병합, 분할", "암호화, 페이지 편집, 스캔 문서 OCR", "대부분의 도구는 브라우저에서 처리 — 파일은 안전하게 보관됩니다", "계정 없이 평생 무료"],
        cta: "지금 무료로 시작",
        href: "chat-with-pdf" as RouteSlug,
        featured: false,
      },
      {
        name: "Pro",
        monthlyPrice: "$9",
        yearlyPrice: "$6",
        yearlyTotal: "$72/년",
        tagline: "AI가 문서를 읽고 비교하고 검토합니다 — 단 몇 초 만에.",
        valueLine: "한 달에 커피 한 잔 값도 안 됩니다.",
        highlights: ["Free의 모든 기능", "어떤 PDF와도 대화 — 위치를 찾을 수 있으면 답변에 출처를 표시", "AI 요약과 핵심 정리를 몇 초 만에", "여러 문서를 나란히 비교", "100MB 파일, 일괄 처리와 우선 처리, 광고 없음", "일괄 문서 워크플로 자동화", "계약서 검토 — 위험 조항과 누락 조항을 표시", "API 접근과 자동 분류", "팀 워크스페이스와 우선 지원"],
        cta: "7일 무료 체험",
        href: "" as RouteSlug,
        featured: true,
      },
    ],
    faqTitle: "구매 전 자주 묻는 질문",
    faq: [
      { q: "무료 체험이 있나요?", a: "네 — 로그인하면 7일간 Pro 전체 기능 체험이 자동으로 시작됩니다. 신용카드 불필요. 계정당 1회만 가능합니다. 체험 후 구독하지 않으면 무료 요금제로 돌아갑니다." },
      { q: "언제든 해지할 수 있나요?", a: "네. 클릭 몇 번으로 직접 구독을 관리하거나 해지할 수 있습니다 — 이메일도, 붙잡는 절차도 없습니다. 결제하신 기간이 끝날 때까지는 계속 이용하실 수 있습니다." },
      { q: "환불이 되나요?", a: "네 — Pro, 평생 요금제 모두 해당됩니다. 요금제가 맞지 않으면 결제 후 7일 이내에 문의해 주시면 전액 환불해 드립니다. Creem에는 셀프 환불 버튼이 없으니 Creem 주문 페이지의 '판매자에게 문의'를 이용하시거나 billing@dockdocs.app으로 이메일을 보내 주세요. 바로 처리해 드립니다." },
      { q: "DockDocs를 쓰려면 결제해야 하나요?", a: "아니요. 약 50가지 핵심 PDF 도구는 계정 없이 평생 무료입니다. AI 기능, 더 큰 파일, 더 많은 작업량이 필요할 때만 결제하시면 됩니다." },
      { q: "제 파일은 어떻게 되나요?", a: "대부분의 도구는 브라우저에서 완전히 처리됩니다 — 파일이 기기를 벗어나지 않습니다. 클라우드 변환은 처리 후 임시 사본이 자동으로 삭제됩니다. 고객님의 문서를 자사 모델 학습에 절대 사용하지 않으며, 답변에 필요한 텍스트만 AI 제공업체에 전송됩니다." },
      { q: "나중에 요금제를 변경할 수 있나요?", a: "언제든 가능합니다. 원하실 때 업그레이드, 다운그레이드하거나 월간과 연간 사이를 전환할 수 있습니다." },
    ],
    ctaTitle: "무료로 사용해 보고 — 나중에 결정하세요.",
    ctaDesc: "지금 바로 아무 도구나 열어 보세요. 계정도, 카드도, 약정도 없습니다.",
    ctaBtn: "무료 도구로 시작하기",
    scenariosTitle: "DockDocs가 무엇을 해결해 드릴까요?",
    scenarios: [
      { emoji: "📊", title: "견적을 비교해 최선을 선택", before: "파일 3개를 열고 숫자를 시트에 옮겨 적기 — 약 1시간", after: "업로드 → 나란히 비교표 + 숫자에 근거한 추천 — 1분", tier: "Pro", href: "compare" as RouteSlug },
      { emoji: "📄", title: "계약서 속 함정 찾아내기", before: "변호사에게 $300을 내거나, 모르고 서명했다가 손해", after: "AI가 몇 분 만에 위험 조항과 누락 조항을 표시", tier: "Pro", href: "compare" as RouteSlug },
      { emoji: "🧾", title: "송장 묶음 처리하기", before: "하나씩 입력 — 몇 시간, 아니면 사람을 고용", after: "묶음째 넣으면 → 자동으로 추출·요약", tier: "Pro", href: "extract-to-excel" as RouteSlug },
      { emoji: "📕", title: "긴 보고서를 빠르게 파악", before: "답 몇 개를 찾으려 80쪽을 읽기 — 몇 시간", after: "무엇이든 질문 → 30초 만에 출처가 있는 답변(위치를 찾을 수 있는 경우)", tier: "Pro", href: "chat-with-pdf" as RouteSlug },
    ],
    compareTitle: "요금제 비교",
    compareCols: ["Free", "Pro"],
    compareRows: [
      { f: "약 50가지 PDF 도구 — 변환, 압축, 병합, 암호화, OCR", v: ["✓", "✓"] },
      { f: "PDF와 대화 · AI 요약", v: ["—", "✓"] },
      { f: "AI PDF 번역(레이아웃 유지)", v: ["—", "곧 제공"] },
      { f: "여러 문서 비교", v: ["—", "✓"] },
      { f: "100MB 파일 · 일괄 처리 · 광고 없음", v: ["—", "✓"] },
      { f: "워크플로 자동화 · API · 자동 분류", v: ["—", "✓"] },
      { f: "계약서 검토 — 위험 조항과 누락 조항", v: ["—", "✓"] },
      { f: "팀 워크스페이스 · 우선 지원", v: ["—", "✓"] },
    ],
  },
} as const;

// 5 nav categories for the comparison table — mirrors workspace sidebar + headerStructure
type L8 = "en" | "zh" | "es" | "pt" | "fr" | "ja" | "de" | "ko";
const FREE_L8: Record<L8, string> = { en: "Free", zh: "免费", es: "Gratis", pt: "Grátis", fr: "Gratuit", ja: "無料", de: "Kostenlos", ko: "무료" };
const UNLIMITED_L8: Record<L8, string> = { en: "Unlimited", zh: "无限", es: "Ilimitado", pt: "Ilimitado", fr: "Illimité", ja: "無制限", de: "Unbegrenzt", ko: "무제한" };
const TEN_PER_DAY_L8: Record<L8, string> = { en: "10 / day", zh: "10次/天", es: "10/día", pt: "10/dia", fr: "10/jour", ja: "10回/日", de: "10/Tag", ko: "10/일" };
const COMPARE_CATS: {
  id: string;
  navKey: string;
  catNavKey: string;
  colIndex: number;
  freeTier: Record<L8, string>;
  proTier: Record<L8, string>;
}[] = [
  { id: "pdf-conversion", navKey: "PDF conversion", catNavKey: "Document tools", colIndex: 0, freeTier: TEN_PER_DAY_L8, proTier: UNLIMITED_L8 },
  { id: "pdf-editing",    navKey: "PDF editing",    catNavKey: "Document tools", colIndex: 1, freeTier: UNLIMITED_L8, proTier: UNLIMITED_L8 },
  {
    id: "batch", navKey: "Batch", catNavKey: "Document tools", colIndex: 2,
    freeTier: { en: "3 runs/day",          zh: "3批/天",          es: "3 lotes/día",         pt: "3 lotes/dia",         fr: "3 lots/jour",         ja: "3バッチ/日",          de: "3 Stapel/Tag",        ko: "3배치/일" },
    proTier:  UNLIMITED_L8,
  },
  {
    id: "ai-analysis", navKey: "AI analysis", catNavKey: "AI analysis", colIndex: 0,
    freeTier: { en: "10 / day",  zh: "10次/天", es: "10/día", pt: "10/dia", fr: "10/jour", ja: "10回/日", de: "10/Tag",     ko: "10/일" },
    proTier:  { en: "Unlimited", zh: "无限",    es: "Ilimitado", pt: "Ilimitado", fr: "Illimité", ja: "無制限",  de: "Unbegrenzt", ko: "무제한" },
  },
  {
    id: "by-profession", navKey: "By profession", catNavKey: "By profession", colIndex: 0,
    freeTier: { en: "3 / day",   zh: "3次/天", es: "3/día", pt: "3/dia", fr: "3/jour", ja: "3回/日", de: "3/Tag",     ko: "3/일" },
    proTier:  { en: "Unlimited", zh: "无限",   es: "Ilimitado", pt: "Ilimitado", fr: "Illimité", ja: "無制限",  de: "Unbegrenzt", ko: "무제한" },
  },
];

export function PricingPlans({ locale = "en" }: { locale?: Locale }) {
  const [period, setPeriod] = useState<"monthly" | "annual" | "lifetime">("annual"); // default annual per pricing spec
  const [openCats, setOpenCats] = useState<Set<string>>(new Set());

  const [billingLoading, setBillingLoading] = useState("");
  const [billingError, setBillingError] = useState("");
  const [subscription, setSubscription] = useState<SubscriptionSnapshot | null>(null);
  const mLocale = locale as MembershipLocale;
  // Shared in-place upgrade flow (quote → breakdown modal → discounted checkout).
  const upgrade = useUpgradeFlow(mLocale);

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
  // zh-Hant derives from zh via OpenCC.
  const hant = locale === "zh-Hant";
  const zh = locale === "zh" || hant;
  const h = (s: string) => (hant ? toHant(s) : s);
  // ko now has a full authored copy block (read directly); zh-Hant derives from zh.
  const c = hant ? deepHant(copy.zh) : (copy[locale as keyof typeof copy] ?? copy.en);
  const selectLabel = zh ? h("选择套餐") : locale === "es" ? "Seleccionar plan" : locale === "pt" ? "Selecionar plano" : locale === "fr" ? "Sélectionner le forfait" : locale === "ja" ? "プランを選択" : locale === "de" ? "Tarif auswählen" : locale === "ko" ? "요금제 선택" : "Select plan";

  // For non-signed-in visitors the Pro CTA emphasises signing in to unlock the trial,
  // rather than a standalone "start trial" action.
  const guestProCta = zh ? h("登录，免费用 7 天 Pro") : locale === "es" ? "Iniciar sesión — 7 días Pro gratis" : locale === "pt" ? "Entrar — 7 dias Pro grátis" : locale === "fr" ? "Se connecter — 7 jours Pro gratuits" : locale === "ja" ? "ログインして 7日間 Pro 無料体験" : locale === "de" ? "Anmelden — 7 Tage Pro kostenlos" : locale === "ko" ? "로그인 — 7일 Pro 무료 체험" : "Sign in — free 7 days of Pro";

  const wsNav = useWorkspaceNav();
  // Turn a billing failure into a clear, localized message AND a console line with
  // the precise code — never swallow it into a silent /account redirect. Only a
  // genuine auth failure (401) sends the user to sign in.
  function handleBillingError(err: unknown) {
    const e = err instanceof BillingError ? err : null;
    const code = e?.code;
    const message = e?.message || (err instanceof Error ? err.message : "");
    console.error("[billing] action failed:", code ?? "(no code)", "—", message);

    // Genuine not-signed-in → send to sign in.
    if (e?.status === 401 || code === "UNAUTHORIZED" || code === "UNAUTHENTICATED") {
      if (wsNav) { wsNav("/workspace-account"); } else if (typeof window !== "undefined") { window.location.href = localizedPath(locale as RouteLocale, "account"); }
      return;
    }
    // The change isn't an in-place upgrade (e.g. a downgrade) → open the portal.
    if (code === "USE_PORTAL") {
      void handlePortal();
      return;
    }
    setBillingError(billingErrorCopy(code, message, mLocale));
  }

  // Plain hosted checkout for a NEW subscription (Free → paid) — no credit.
  async function plainCheckout(plan: PaidSubscriptionPlan) {
    setBillingLoading(plan);
    setBillingError("");
    try {
      await createBillingCheckoutSession(plan, period); // redirects to checkout on success
    } catch (err) {
      handleBillingError(err);
      setBillingLoading("");
    }
  }
  // The proration UPGRADE flow (quote → breakdown modal → discounted checkout) lives
  // in useUpgradeFlow(); the "upgrade" CTA calls upgrade.beginUpgrade(plan, period).
  // Downgrades / lateral changes route to the Creem billing portal (no auto
  // double-charge); the real fix for downgrades is backlogged (nf-downgrade-flow).
  async function handlePortal() {
    setBillingLoading("portal");
    setBillingError("");
    try {
      await createBillingPortalSession(); // redirects on success
    } catch (err) {
      handleBillingError(err);
      setBillingLoading("");
    }
  }
  // Trial-first checkout: try 7-day free trial; on TRIAL_USED fall through to
  // regular checkout so paid users are never blocked. On auth failure send to
  // sign-in so the user can get a session before we write the trial record.
  async function handleTrialOrCheckout(plan: PaidSubscriptionPlan) {
    setBillingLoading(plan);
    setBillingError("");
    try {
      const result = await startBillingTrial();
      if (result.ok || result.code === "ALREADY_PAID") {
        if (wsNav) wsNav("/workspace-account"); else if (typeof window !== "undefined") window.location.href = localizedPath(locale as RouteLocale, "account");
        return;
      }
      if (result.code === "UNAUTHENTICATED") {
        if (wsNav) wsNav("/workspace-account"); else if (typeof window !== "undefined") window.location.href = localizedPath(locale as RouteLocale, "account");
        return;
      }
      // TRIAL_USED — user already trialed; fall through to paid checkout.
      await createBillingCheckoutSession(plan, period);
    } catch (err) {
      handleBillingError(err);
      setBillingLoading("");
    }
  }
  // Per-card checkout: same Creem flow as main CTA but with explicit interval (avoids state async issue)
  async function handleCardCta(inv: "monthly" | "annual" | "lifetime") {
    setPeriod(inv);
    if (pricingCtaKind === "current") return;
    if (pricingCtaKind === "manage") { void handlePortal(); return; }
    setBillingLoading("PRO");
    setBillingError("");
    try {
      if (pricingCtaKind === "upgrade") { await upgrade.beginUpgrade("PRO", inv); return; }
      const result = await startBillingTrial();
      if (result.ok || result.code === "ALREADY_PAID") {
        if (wsNav) wsNav("/workspace-account"); else if (typeof window !== "undefined") window.location.href = localizedPath(locale as RouteLocale, "account");
        return;
      }
      if (result.code === "UNAUTHENTICATED") {
        if (wsNav) wsNav("/workspace-account"); else if (typeof window !== "undefined") window.location.href = localizedPath(locale as RouteLocale, "account");
        return;
      }
      await createBillingCheckoutSession("PRO", inv);
    } catch (err) {
      handleBillingError(err);
      setBillingLoading("");
    }
  }

  // 账户页全站统一为 /account(无语言版本)，不要按 locale 加 /zh 前缀，否则 /zh/account 会 404
  const toolHref = (href: RouteSlug) => (href ? localizedPath(locale as RouteLocale, href) : "/account");

  // ── New locale strings (pricing v2) ──
  const subscribeProLabel = zh ? h("订阅 Pro 会员") : locale === "es" ? "Suscribirse a Pro" : locale === "pt" ? "Assinar Pro" : locale === "fr" ? "S'abonner à Pro" : locale === "ja" ? "Proに登録" : locale === "de" ? "Pro abonnieren" : locale === "ko" ? "Pro 구독" : "Subscribe to Pro";
  const trialLinkLabel = zh ? h("先免费试用 7 天 Pro 会员") : locale === "es" ? "Primero prueba Pro 7 días gratis" : locale === "pt" ? "Primeiro experimente Pro 7 dias grátis" : locale === "fr" ? "D'abord essayer Pro 7 jours gratuit" : locale === "ja" ? "まずProを7日間無料で試す" : locale === "de" ? "Zuerst Pro 7 Tage gratis testen" : locale === "ko" ? "먼저 Pro 7일 무료 체험" : "Start free 7-day Pro trial first";
  // Capability grid short labels (4 items × locale)
  const CAP_GRID = [
    {
      label: zh ? h("对话") : locale === "es" ? "Chat" : locale === "pt" ? "Chat" : locale === "fr" ? "Chat" : locale === "ja" ? "チャット" : locale === "de" ? "Chat" : locale === "ko" ? "대화" : "Chat",
    },
    {
      label: zh ? h("对比") : locale === "es" ? "Comparar" : locale === "pt" ? "Comparar" : locale === "fr" ? "Comparer" : locale === "ja" ? "比較" : locale === "de" ? "Vergleich" : locale === "ko" ? "비교" : "Compare",
    },
    {
      label: zh ? h("合同") : locale === "es" ? "Contratos" : locale === "pt" ? "Contratos" : locale === "fr" ? "Contrats" : locale === "ja" ? "契約" : locale === "de" ? "Verträge" : locale === "ko" ? "계약" : "Contracts",
    },
    {
      label: zh ? h("批量") : locale === "es" ? "Lote" : locale === "pt" ? "Lote" : locale === "fr" ? "Lot" : locale === "ja" ? "一括" : locale === "de" ? "Stapel" : locale === "ko" ? "일괄" : "Batch",
    },
  ];
  // 3 billing-option card layout — Pro only; Free de-emphasised as a note below.
  const proPlan = c.plans.find((p) => p.featured) ?? c.plans[c.plans.length - 1];
  const pricingCtaKind = ((): "current" | "checkout" | "upgrade" | "manage" => {
    if (!subscription) return "checkout";
    const cur = subscription.displayName.toUpperCase();
    const curInt = subscription.record.interval;
    const pk: PaidSubscriptionPlan = "PRO";
    if (cur === "FREE") return "checkout";
    if (curInt === "lifetime") return cur === pk ? "current" : "manage";
    if (cur === pk && curInt === period) return "current";
    return isPlanUpgrade(cur, curInt, pk, period) ? "upgrade" : "manage";
  })();
  const billingLimitedNote = zh ? h("500 席 · 创始价") : locale === "es" ? "500 cupos · precio fundador" : locale === "pt" ? "500 vagas · preço fundador" : locale === "fr" ? "500 places · tarif fondateur" : locale === "ja" ? "500枠 · 創設者価格" : locale === "de" ? "500 Plätze · Gründerpreis" : locale === "ko" ? "500석 · 창립 기념가" : "500 slots · founding rate";
  const billingFreeNote = zh ? h("或继续使用免费版——约 50 个工具，无需注册。") : locale === "es" ? "O continúa gratis — ~50 herramientas, sin registro." : locale === "pt" ? "Ou continue grátis — ~50 ferramentas, sem cadastro." : locale === "fr" ? "Ou continuez gratuitement — ~50 outils, sans inscription." : locale === "ja" ? "または無料プランを継続——約50ツール、登録不要。" : locale === "de" ? "Oder kostenlos weiternutzen — ~50 Tools, keine Anmeldung nötig." : locale === "ko" ? "또는 무료로 계속 이용 — 약 50개 도구, 가입 불필요." : "Or continue with Free — ~50 tools, no sign-up needed.";
  const billingPopularLabel = zh ? h("最受欢迎") : locale === "es" ? "Más popular" : locale === "pt" ? "Mais popular" : locale === "fr" ? "Plus populaire" : locale === "ja" ? "人気" : locale === "de" ? "Beliebt" : locale === "ko" ? "인기" : "Popular";
  const billingRedirecting = zh ? h("跳转中…") : locale === "es" ? "Redirigiendo…" : locale === "pt" ? "Redirecionando…" : locale === "fr" ? "Redirection…" : locale === "ja" ? "リダイレクト中…" : locale === "de" ? "Weiterleitung…" : locale === "ko" ? "이동 중…" : "Redirecting…";
  const billingCurrentLabel = zh ? h("当前套餐") : locale === "es" ? "Plan actual" : locale === "pt" ? "Plano atual" : locale === "fr" ? "Forfait actuel" : locale === "ja" ? "現在のプラン" : locale === "de" ? "Aktueller Tarif" : locale === "ko" ? "현재 요금제" : "Current plan";
  const billingManageLabel = zh ? h("管理账单") : locale === "es" ? "Gestionar facturación" : locale === "pt" ? "Gerenciar cobrança" : locale === "fr" ? "Gérer la facturation" : locale === "ja" ? "請求を管理" : locale === "de" ? "Abrechnung verwalten" : locale === "ko" ? "결제 관리" : "Manage billing";
  type ICard = { interval: "monthly" | "annual" | "lifetime"; label: string; price: string; sub: string; badge: string | null; highlighted: boolean };
  const BILLING_CARDS: ICard[] = [
    { interval: "monthly", label: c.monthly, price: proPlan.monthlyPrice, sub: `${proPlan.monthlyPrice}${c.perMo}`, badge: null, highlighted: false },
    { interval: "annual", label: c.yearly, price: proPlan.yearlyPrice, sub: c.billedYearly("yearlyTotal" in proPlan ? proPlan.yearlyTotal ?? "" : ""), badge: null, highlighted: true },
    { interval: "lifetime", label: c.lifetime, price: "$149", sub: c.perOnce, badge: billingLimitedNote, highlighted: false },
  ];
  return (
    <div className={`mx-auto ${LAYOUT.content} px-5 py-20 sm:py-24`}>
      {/* Hero — left-aligned, matching Home / About design baseline */}
      <div>
        <p className={eyebrowCls(zh)}>{zh ? h("// 定价") : locale === "es" ? "// Precios" : locale === "pt" ? "// Preços" : locale === "fr" ? "// Tarifs" : locale === "ja" ? "// 料金" : locale === "de" ? "// Preise" : locale === "ko" ? "// 요금제" : "// Pricing"}</p>
        <h1 className="mt-4 max-w-[28ch] text-[40px] font-normal leading-[1.05] tracking-[-0.035em] text-[color:var(--foreground)] sm:text-[60px]">
          {c.title}
        </h1>
        <p className="mt-5 max-w-2xl text-[16px] leading-[1.6] text-[color:var(--muted)]">
          {c.subtitle}
        </p>

      </div>

      {/* Billing error — surfaced, never silently swallowed into a redirect */}
      {(billingError || upgrade.error) && (
        <div className="mx-auto mt-6 max-w-xl rounded-[var(--radius-sm)] border border-[color:var(--error-line)] bg-[color:var(--error-surface)] px-4 py-3 text-center text-[13px] text-[color:var(--error)]">
          {billingError || upgrade.error}
        </div>
      )}

      {/* Same Pro, three ways to pay — card layout */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {BILLING_CARDS.map(({ interval, label, price, sub, badge, highlighted }) => {
          const isSelected = period === interval;
          const isCurrentInterval = !!subscription && subscription.displayName.toUpperCase() === "PRO" && subscription.record.interval === interval;
          return (
            <div
              key={interval}
              onClick={() => setPeriod(interval)}
              className={`relative flex cursor-pointer flex-col rounded-[var(--radius)] border px-5 py-6 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] ${
                isSelected
                  ? "border-[color:var(--accent)] bg-[color:var(--surface)]"
                  : "border-[color:var(--line)] bg-[color:var(--surface-subtle)] hover:border-[color:var(--line-strong)]"
              }`}
            >
              {highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[color:var(--accent)] px-2.5 py-0.5 text-[10px] font-semibold text-[color:var(--on-accent)]">
                  {billingPopularLabel}
                </span>
              )}
              {badge && (
                <span className="absolute -top-3 right-4 rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] px-2.5 py-0.5 text-[10px] font-medium text-[color:var(--muted)]">
                  {badge}
                </span>
              )}
              <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[color:var(--muted)]">{label}</p>
              <p className="mt-1.5 text-[32px] font-semibold tracking-[-0.02em] text-[color:var(--foreground)]">{price}</p>
              <p className="text-[11px] text-[color:var(--faint)]">{sub}</p>

              {/* 1px hairline + 2×2 capability grid */}
              <div className="my-4 h-px bg-[color:var(--line)]" />
              <div className="grid grid-cols-2 gap-1">
                {CAP_GRID.map((cap, i) => (
                  <div key={i} className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] transition ${isSelected ? "bg-[color:var(--accent)]/5 text-[color:var(--foreground)]" : "text-[color:var(--muted)]"}`}>
                    <span className={isSelected ? "text-[color:var(--accent)]" : "text-[color:var(--muted)]"}>
                      {i === 0 && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a9 9 0 0 1 8.7 11.5L21 21l-5.5-.3A9 9 0 1 1 12 3z"/><path d="M8 12h.01M12 12h.01M16 12h.01"/></svg>}
                      {i === 1 && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="5" width="7" height="14" rx="1"/><rect x="14" y="5" width="7" height="14" rx="1"/></svg>}
                      {i === 2 && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3L4 7v5c0 4.418 3.582 8.418 8 10 4.418-1.582 8-5.582 8-10V7z"/><circle cx="12" cy="12" r="2.5"/><path d="M13.8 13.8l1.7 1.7"/></svg>}
                      {i === 3 && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l9 4.5-9 4.5-9-4.5z"/><path d="M3 11.5l9 4.5 9-4.5"/><path d="M3 16.5l9 4.5 9-4.5"/></svg>}
                    </span>
                    {cap.label}
                  </div>
                ))}
              </div>

            </div>
          );
        })}
      </div>

      {/* Main CTA — big subscribe button + optional trial link + free note */}
      <div className="mt-8 flex flex-col items-center gap-3">
        {pricingCtaKind === "current" ? (
          <div className="flex w-full max-w-sm items-center justify-center rounded-full border border-[color:var(--line)] px-8 py-3 text-[14px] font-medium text-[color:var(--muted)]">
            {billingCurrentLabel}
          </div>
        ) : pricingCtaKind === "manage" ? (
          <button type="button" onClick={() => void handlePortal()} disabled={billingLoading === "portal"}
            className="flex h-12 w-full max-w-sm items-center justify-center rounded-full bg-[color:var(--accent)] text-[15px] font-semibold text-[color:var(--on-accent)] transition hover:opacity-90 disabled:opacity-60">
            {billingLoading === "portal" ? billingRedirecting : billingManageLabel}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void handleCardCta(period)}
            disabled={billingLoading === "PRO" || (pricingCtaKind === "upgrade" && upgrade.loading)}
            className="flex h-12 w-full max-w-sm items-center justify-center rounded-full bg-[color:var(--accent)] text-[15px] font-semibold text-[color:var(--on-accent)] transition hover:opacity-90 disabled:opacity-60"
          >
            {(billingLoading === "PRO" || (pricingCtaKind === "upgrade" && upgrade.loading))
              ? billingRedirecting
              : subscribeProLabel}
          </button>
        )}
        {pricingCtaKind === "checkout" && (
          <button
            type="button"
            onClick={() => void handleTrialOrCheckout("PRO")}
            disabled={billingLoading === "PRO"}
            className="text-[13px] text-[color:var(--muted)] underline-offset-2 hover:underline disabled:opacity-60"
          >
            {trialLinkLabel}
          </button>
        )}
        <p className="text-center text-[13px] text-[color:var(--muted)]">{billingFreeNote}</p>
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

      {/* Compare plans — 5 nav categories, collapsible accordion */}
      <div className={`mx-auto mt-16 ${LAYOUT.content}`}>
        <p className={eyebrowCls(zh)}>{zh ? h("// 套餐对照") : locale === "es" ? "// Comparar" : locale === "pt" ? "// Comparar" : locale === "fr" ? "// Comparer" : locale === "ja" ? "// プラン比較" : locale === "de" ? "// Vergleich" : locale === "ko" ? "// 요금제 비교" : "// Compare"}</p>
        <h2 className={`mt-4 ${H2_CLS}`}>{c.compareTitle}</h2>
        <p className="mt-2 text-[13px] text-[color:var(--faint)]">
          {zh ? h("点击分类展开该类所有工具")
            : locale === "es" ? "Haz clic en una categoría para ver las herramientas que incluye"
            : locale === "pt" ? "Clique em uma categoria para ver as ferramentas que ela inclui"
            : locale === "fr" ? "Cliquez sur une catégorie pour voir les outils qu'elle inclut"
            : locale === "ja" ? "カテゴリをクリックすると含まれるツールが表示されます"
            : locale === "de" ? "Klicken Sie auf eine Kategorie, um die enthaltenen Tools zu sehen"
            : locale === "ko" ? "카테고리를 클릭하면 포함된 도구가 표시됩니다"
            : "Click a category to see the tools it includes"}
        </p>
        <div className="mt-8 overflow-x-auto rounded-2xl border border-[color:var(--line)]">
          <table className="w-full table-fixed border-collapse text-[14px]">
            <colgroup>
              <col className="w-1/3" />
              <col className="w-1/3" />
              <col className="w-1/3" />
            </colgroup>
            <thead>
              <tr className="bg-[color:var(--surface-subtle)]">
                <th className="border-b border-[color:var(--line)] px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.08em] text-[color:var(--faint)]">
                  {zh ? h("功能") : locale === "es" ? "Herramienta" : locale === "pt" ? "Ferramenta" : locale === "fr" ? "Outil" : locale === "ja" ? "ツール" : locale === "de" ? "Tool" : locale === "ko" ? "도구" : "Tool"}
                </th>
                <th className="border-b border-l border-[color:var(--line)] px-5 py-3 text-center text-[12px] font-semibold uppercase tracking-[0.08em] text-[color:var(--faint)]">Free</th>
                <th className="border-b border-l border-[color:var(--line)] px-5 py-3 text-center text-[12px] font-semibold uppercase tracking-[0.08em] text-[color:var(--faint)]">Pro</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE_CATS.flatMap((cat) => {
                const isOpen = openCats.has(cat.id);
                const navLoc = locale as "en" | "zh" | "zh-Hant" | "es" | "pt" | "fr" | "ja" | "de" | "ko";
                const t8 = (hant ? "zh" : locale) as L8;
                const chrome = navCopy[navLoc] ?? navCopy.en;
                const items = navItemLabels[navLoc] ?? navItemLabels.en;
                const catLabel = h(chrome[cat.navKey as keyof typeof navCopy.en] ?? navCopy.en[cat.navKey as keyof typeof navCopy.en]);
                const freeLabel = h(cat.freeTier[t8] ?? cat.freeTier.en);
                const proLabel = h(cat.proTier[t8] ?? cat.proTier.en);
                const structCat = headerStructure.find((sc) => sc.catKey === cat.catNavKey);
                const col = structCat?.cols[cat.colIndex];
                const toolItems = col?.items ?? [];
                return [
                  <tr
                    key={`cat-${cat.id}`}
                    onClick={() => setOpenCats(prev => { const next = new Set(prev); isOpen ? next.delete(cat.id) : next.add(cat.id); return next; })}
                    className="cursor-pointer transition-colors hover:bg-[color:var(--surface-subtle)]"
                  >
                    <td className="border-b border-[color:var(--line)] px-4 py-3">
                      <span className="flex items-center gap-2">
                        <svg className={`h-3 w-3 shrink-0 opacity-40 transition-transform ${isOpen ? "rotate-90" : ""}`} viewBox="0 0 12 12" fill="none">
                          <path d="M4 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <span className="font-medium text-[color:var(--foreground)]">{catLabel}</span>
                      </span>
                    </td>
                    <td className="border-b border-l border-[color:var(--line)] px-5 py-3 text-center text-[12.5px] text-[color:var(--muted)]">{freeLabel}</td>
                    <td className="border-b border-l border-[color:var(--line)] px-5 py-3 text-center text-[12.5px] font-medium text-[color:var(--accent)]">{proLabel}</td>
                  </tr>,
                  ...(isOpen ? toolItems.map((tool) => (
                    <tr key={`tool-${tool.slug}`} className="bg-[color:var(--surface)] transition-colors hover:bg-[color:var(--surface-subtle)]">
                      <td className="border-b border-[color:var(--line)] py-2 pl-10 pr-4">
                        <a href={localizedPath(locale as RouteLocale, tool.slug.replace(/^\//, "") as RouteSlug)} className="text-[13px] text-[color:var(--muted)] transition hover:text-[color:var(--foreground)]">
                          {h(items[tool.key as keyof typeof navItemLabels.en] ?? navItemLabels.en[tool.key as keyof typeof navItemLabels.en] ?? tool.key)}
                        </a>
                      </td>
                      <td className="border-b border-l border-[color:var(--line)] px-5 py-2 text-center text-[12px] text-[color:var(--faint)]">{freeLabel}</td>
                      <td className="border-b border-l border-[color:var(--line)] px-5 py-2 text-center text-[12px] text-[color:var(--accent)]">{proLabel}</td>
                    </tr>
                  )) : []),
                ];
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 px-4 text-[11.5px] text-[color:var(--faint)]">
          {zh
            ? <>{h("* 无限套餐遵循合理使用政策，仅用于防止异常滥用。")}<a href={localizedPath(locale as RouteLocale, "terms")} className="underline hover:text-[color:var(--muted)]">{h("查看条款")}</a></>
            : locale === "es"
            ? <>* Los planes ilimitados están sujetos a nuestra <a href={localizedPath(locale as RouteLocale, "terms")} className="underline hover:text-[color:var(--muted)]">Política de Uso Razonable</a> para evitar abusos.</>
            : locale === "pt"
            ? <>* Os planos ilimitados estão sujeitos à nossa <a href={localizedPath(locale as RouteLocale, "terms")} className="underline hover:text-[color:var(--muted)]">Política de Uso Justo</a> para evitar abusos.</>
            : locale === "fr"
            ? <>* Les forfaits illimités sont soumis à notre <a href={localizedPath(locale as RouteLocale, "terms")} className="underline hover:text-[color:var(--muted)]">Politique d'utilisation équitable</a> afin de prévenir les abus.</>
            : locale === "ja"
            ? <>* 無制限プランは、不正利用を防ぐための<a href={localizedPath(locale as RouteLocale, "terms")} className="underline hover:text-[color:var(--muted)]">フェアユースポリシー</a>が適用されます。</>
            : locale === "de"
            ? <>* Unbegrenzte Tarife unterliegen unserer <a href={localizedPath(locale as RouteLocale, "terms")} className="underline hover:text-[color:var(--muted)]">Fair-Use-Richtlinie</a>, um Missbrauch zu verhindern.</>
            : locale === "ko"
            ? <>* 무제한 요금제는 악용을 방지하기 위해 <a href={localizedPath(locale as RouteLocale, "terms")} className="underline hover:text-[color:var(--muted)]">공정 이용 정책</a>이 적용됩니다.</>
            : <>* Unlimited plans are subject to our <a href={localizedPath(locale as RouteLocale, "terms")} className="underline hover:text-[color:var(--muted)]">Fair Use Policy</a> to prevent abuse.</>
          }
        </p>
      </div>

      {/* Solutions by scenario */}
      <div className={`mx-auto mt-24 ${LAYOUT.content}`}>
        <p className={eyebrowCls(zh)}>{zh ? h("// 应用场景") : locale === "es" ? "// Casos de uso" : locale === "pt" ? "// Casos de uso" : locale === "fr" ? "// Cas d'usage" : locale === "ja" ? "// ユースケース" : locale === "de" ? "// Anwendungsfälle" : locale === "ko" ? "// 활용 사례" : "// Use cases"}</p>
        <h2 className={`mt-4 ${H2_CLS}`}>{c.scenariosTitle}</h2>
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
                <a href={toolHref(s.href)} className="mt-3 inline-block text-[13px] font-medium text-[color:var(--accent)] transition hover:text-[color:var(--accent-strong)]">{zh ? h("去试试 →") : locale === "es" ? "Pruébalo →" : locale === "pt" ? "Experimente →" : locale === "fr" ? "Essayez →" : locale === "ja" ? "試す →" : locale === "de" ? "Ausprobieren →" : locale === "ko" ? "사용해 보기 →" : "Try it →"}</a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* FAQ — always open, consistent with other site FAQ pages */}
      <div className={`mx-auto mt-24 ${LAYOUT.content}`}>
        <p className={eyebrowCls(zh)}>{zh ? h("// 常见问题") : locale === "es" ? "// Preguntas frecuentes" : locale === "pt" ? "// Perguntas frequentes" : locale === "fr" ? "// FAQ" : locale === "ja" ? "// よくある質問" : locale === "de" ? "// Häufige Fragen" : locale === "ko" ? "// 자주 묻는 질문" : "// FAQ"}</p>
        <h2 className={`mt-4 ${H2_CLS}`}>{c.faqTitle}</h2>
        <div className="mt-8">
          {c.faq.map((item) => (
            <div key={item.q} className="py-6">
              <p className="text-[15px] font-normal text-[color:var(--foreground)]">{item.q}</p>
              <p className="mt-3 text-[14px] leading-7 text-[color:var(--muted)]">{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade breakdown — credit is visible before the redirect (可溯源/honest). */}
      <UpgradeConfirmModal flow={upgrade} locale={mLocale} />
    </div>
  );
}
