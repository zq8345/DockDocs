import type { Metadata } from "next";
import { SaasInfoPage } from "@/components/SaasInfoPage";
import { siteUrl } from "@/lib/i18n";

// Standalone GEO content page targeting Chinese-language AI legal review searches.
// NOT registered in routeSlugs — no localized variants; single URL added to sitemap
// directly in standaloneContentRoutes (app/sitemap.ts) and EXCEPTIONS via
// lib/standalone-routes.ts. All AI-traceability claims are scoped ("when the AI
// can locate the passage in the source document") per the honesty moat.

const url = `${siteUrl}/ai-contract-risk-analysis/`;

export const metadata: Metadata = {
  title: "AI 合同风险分析：律师如何用 AI 辅助审合同（2026）",
  description:
    "合同审查三大痛点：条款遗漏、格式非标、耗时费力。AI 辅助风险识别如何提速？可溯源批注如何保留律师判断力？含实际工作流与高频 FAQ。",
  keywords: [
    "AI 合同审查",
    "合同风险分析",
    "合同审查工具",
    "AI 审合同",
    "合同风险识别",
    "合同风险体检",
  ],
  alternates: { canonical: "/ai-contract-risk-analysis/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "AI 合同风险分析：律师如何用 AI 辅助审合同（2026）",
    description:
      "合同审查痛点、AI 辅助风险识别工作流、三类高频风险举例及 FAQ，适合律师与法务人员参考。",
    url,
    siteName: "DockDocs",
    type: "article",
  },
};

const page = {
  slug: "faq" as const,
  title: "AI 合同风险分析：律师如何用 AI 辅助审合同（2026）",
  description: "合同审查的痛点与 AI 辅助识别风险条款的方法。",
  eyebrow: "法律科技",
  heroTitle: "合同审查太慢、太容易漏——AI 能帮到哪一步？",
  heroDescription:
    "一份 50 页采购合同，人工审查需要 2–4 小时；遇到非标格式或大量附件，还容易遗漏关键条款。AI 合同审查工具不能替代律师，但可以做第一轮风险扫描——识别疑似问题条款、标注原文位置、让律师把时间花在判断上，而不是翻页上。",
  primaryAction: { label: "合同风险体检", href: "/contract-risk" },
  secondaryAction: { label: "法律专业工作台", href: "/for/legal" },
  sections: [
    {
      title: "合同审查的三大痛点",
      description:
        "法务和律师在审查合同时反复遭遇同样的挑战，尤其是在非标格式、大批量场景下。",
      items: [
        {
          title: "条款遗漏风险高",
          description:
            "关键条款（违约金上限、保密范围、排他义务）往往埋在附件或定义章节，人工快速浏览容易跳过，事后发现代价极高。",
        },
        {
          title: "格式非标，难以比对",
          description:
            "对方提供的合同格式各异，与己方模板逐字比对耗时；扫描件 PDF 还需先 OCR 才能全文检索，效率更低。",
        },
        {
          title: "重复性工作占用大量精力",
          description:
            "同类合同（劳动合同、采购合同）结构相似，逐份人工审查效率低，律师的高价值判断时间被机械工作挤占。",
        },
      ],
    },
    {
      title: "AI 如何辅助识别合同风险",
      description:
        "AI 审查工具的核心价值是\"快速定位\"而不是\"替代判断\"。对于常见风险模式（无上限违约金、宽泛排他条款、缺失保密义务），AI 可以在秒级内完成全文扫描并列出疑似条款清单。\n\n关于引用原文：当 AI 能够在合同文本中准确定位相关段落时，会附上原文引用，方便律师直接核对；若无法定位，AI 不会编造来源或凭空援引。这一\"可定位才标注\"的逻辑是诚实审查的基础——不夸大能力，不产生幻觉引用。",
    },
    {
      title: "律师使用 AI 审合同的实际工作流",
      description:
        "完整流程通常分为五步：AI 承担前三步的机械性扫描，律师专注第四步的专业判断与最终定论。",
      items: [
        {
          title: "① 上传 PDF，提取文本",
          description:
            "将合同 PDF 上传至工具。扫描件先经 OCR 识别成可搜索文本；原生 PDF 直接提取。工具只将提取的文字内容发送给 AI，原始文件本身不长期存储于服务器。",
        },
        {
          title: "② AI 扫描风险关键词与条款结构",
          description:
            "AI 按预设风险类别（违约责任、排他义务、保密条款、不可抗力、争议管辖）扫描全文，标记疑似高风险段落及其页码/章节位置。",
        },
        {
          title: "③ 输出批注清单（含原文引用，能定位时附上）",
          description:
            "对每个疑似风险条款，AI 列出：风险类型、疑似原因、原文片段（能准确定位时附上）。律师可直接跳转至对应段落快速复核，而不必从头翻读全文。",
        },
        {
          title: "④ 律师复核与专业判断",
          description:
            "律师审阅批注清单，结合业务背景和适用法律做出最终判断。AI 的标注是起点，不是终点——法律结论必须由律师负责确认。",
        },
        {
          title: "⑤ 导出审查报告",
          description:
            "将批注结果导出为 PDF 或 Word 报告，便于存档、客户沟通或内部审批流程留痕。",
        },
      ],
    },
    {
      title: "三类高频合同风险举例",
      description:
        "以下是 AI 辅助扫描中最常识别出的风险类型，也是合同谈判中最容易被忽略的潜在\"地雷\"。",
      items: [
        {
          title: "违约金无上限条款",
          description:
            "合同中出现\"按日计罚款\"但未设定总额上限，或\"损失赔偿不设限\"，在违约发生时可能面临无限责任。典型表述：\"乙方每逾期一日，向甲方支付合同总价 1% 的违约金。\"（未设上限即为风险点。）",
        },
        {
          title: "过宽的排他条款",
          description:
            "排他义务若未明确限定业务范围、地域或期限，可能实质性限制一方的未来商业自由度。如\"乙方在合同期内不得向任何第三方提供同类服务\"而无具体范围界定。",
        },
        {
          title: "缺失或模糊的保密条款",
          description:
            "合同无保密条款，或保密期限与\"商业秘密\"定义不清，数据泄露后难以主张权利。签署前应核查：保密义务是否对等、期限是否合理、违反后果是否有约定。",
        },
      ],
    },
    {
      title: "适合 AI 辅助审查的合同类型",
      description:
        "AI 审查在结构相对固定、条款类型可预测的合同中效率最高，以下四类最为常见。",
      items: [
        {
          title: "劳动合同",
          description:
            "核查试用期约定、竞业限制范围、薪酬结构、解除条件等关键点，尤其适合 HR 在批量入职前快速完成第一轮扫描。",
        },
        {
          title: "采购与供应商合同",
          description:
            "重点关注交付标准、验收条款、付款周期与违约责任，常见于制造业、电商、IT 外包等大量重复签署的场景。",
        },
        {
          title: "租赁合同",
          description:
            "押金退还条件、提前解约违约金、装修权利、维修责任归属，是租赁合同中最常见的争议来源，AI 扫描可快速定位。",
        },
        {
          title: "框架协议与长期合作合同",
          description:
            "框架协议往往涉及保密、知识产权归属、排他义务等对长期合作影响深远的条款，值得在执行订单前认真审查一遍。",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "AI 能替代律师审合同吗？",
      answer:
        "不能。AI 适合做第一轮风险扫描——识别疑似问题条款、标注位置、节省翻页时间。但法律结论涉及专业判断、适用法律和具体业务背景，必须由执业律师负责。AI 的价值是\"让律师把时间花在判断上\"，而不是\"替代律师的判断\"。",
    },
    {
      question: "AI 识别出的风险条款准确吗？",
      answer:
        "AI 在识别常见风险模式（无上限违约金、宽泛排他、缺失保密）方面准确率较高，但在罕见条款类型或高度定制合同中可能有遗漏或误报。这正是为什么最终复核必须由律师完成——AI 批注是参考，不是结论。",
    },
    {
      question: "上传合同到 AI 工具安全吗？",
      answer:
        "取决于工具的处理方式。DockDocs 的合同审查工具只将提取的文本内容发送给 AI，不在服务器长期存储原始文件。若合同含高度敏感信息，建议在工具的隐私说明中确认数据处理方式，或事先咨询所在单位的法务/IT 合规部门。",
    },
    {
      question: "AI 合同审查适合哪些语言的合同？",
      answer:
        "目前对中文和英文合同效果最好，两者均有相对成熟的法律术语语料支持。日文合同可用但精度稍低；其他语言建议先小范围测试再正式用于实际审查。",
    },
  ],
  readingLinks: [
    {
      label: "How to read a contract",
      href: "/how-to-read-a-contract/",
      description: "A guide to contract structure before doing a risk analysis: defined terms, conditions precedent, and which clause types create the most exposure.",
    },
    {
      label: "Vendor contract red flags",
      href: "/vendor-contract-red-flags/",
      description: "The vendor agreement provisions most commonly flagged in risk analysis: unilateral pricing changes, auto-renewal, data ownership, and liability caps.",
    },
    {
      label: "Software license agreement red flags",
      href: "/software-license-agreement-red-flags/",
      description: "SaaS and software buyer risk: data rights, termination and data access, usage restrictions, and audit rights clauses to scrutinize.",
    },
    {
      label: "Lease agreement red flags",
      href: "/lease-agreement-red-flags/",
      description: "Commercial and residential lease provisions that frequently surface in contract risk analysis — maintenance allocation, exit rights, and personal guarantees.",
    },
  ],
};

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: "AI 合同风险分析：律师如何用 AI 辅助审合同（2026）",
      description:
        "合同审查痛点、AI 辅助风险识别工作流、三类高频风险举例及 FAQ，适合律师与法务人员参考。",
      inLanguage: "zh-Hans",
      about: { "@id": `${siteUrl}#org` },
      isPartOf: { "@type": "WebSite", name: "DockDocs", url: siteUrl },
      publisher: { "@type": "Organization", "@id": `${siteUrl}#org` },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "DockDocs", item: `${siteUrl}/` },
        { "@type": "ListItem", position: 2, name: "法律工作台", item: `${siteUrl}/for/legal/` },
        { "@type": "ListItem", position: 3, name: "AI 合同风险分析", item: url },
      ],
    },
  ],
};

export default function AiContractRiskAnalysisPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <SaasInfoPage page={page} locale="zh" />
      <section className="border-t border-[color:var(--line)] bg-[color:var(--surface-subtle)]">
        <div className="mx-auto max-w-3xl px-5 py-5 sm:px-6">
          <p className="text-xs leading-5 text-[color:var(--faint)]">
            免责声明：本文仅供参考，不构成法律意见。合同条款的法律效力因适用法律、具体情境而异，建议由执业律师进行最终复核与专业判断。
          </p>
        </div>
      </section>
    </>
  );
}
