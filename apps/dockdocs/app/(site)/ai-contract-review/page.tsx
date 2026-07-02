import type { Metadata } from "next";
import { SaasInfoPage } from "@/components/SaasInfoPage";
import { siteUrl } from "@/lib/i18n";

// Standalone English-first GEO content page targeting legal/professional queries
// about AI contract review. NOT in routeSlugs. Wired into standaloneContentRoutes
// and lib/standalone-routes.ts.
// Traceability claims are scoped ("when the AI can locate the clause") — never
// universal. No "court-ready" or "100% accurate" language. AI sends text, not zero data.

const url = `${siteUrl}/ai-contract-review/`;

export const metadata: Metadata = {
  title: "AI Contract Review: Surface Risky Clauses and Check the Exact Language (2026)",
  description:
    "AI contract review reads your contract and flags the clauses that carry risk — liability caps, indemnification, IP assignment, non-competes — and shows you the exact clause text so you can read it yourself, not just trust the AI's summary.",
  keywords: [
    "AI contract review",
    "contract review AI",
    "AI contract analysis",
    "AI NDA review",
    "AI contract risk analysis",
    "AI legal document review",
  ],
  alternates: { canonical: "/ai-contract-review/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "AI Contract Review: Surface Risky Clauses and Check the Exact Language (2026)",
    description:
      "What AI contract review actually does: flag risky clause types and show you the exact language — so you can read the clause, not just the AI's interpretation of it.",
    url,
    siteName: "DockDocs",
    type: "article",
  },
};

const page = {
  slug: "faq" as const,
  title: "AI Contract Review: Surface Risky Clauses and Check the Exact Language (2026)",
  description:
    "What AI contract review does, which clause types it handles best, and why seeing the exact clause text matters more than trusting the AI's interpretation.",
  eyebrow: "Legal Documents",
  heroTitle: "AI contract review: flags risky clauses and shows you the exact text",
  heroDescription:
    "AI contract review reads a contract and surfaces the provisions that carry risk — unlimited liability, missing indemnification carve-outs, broad IP assignments, one-sided termination rights. What distinguishes useful AI contract review from a summary: when the AI flags a clause, it shows you the exact language from your contract so you can read the actual provision, not just the AI's paraphrase of it.",
  primaryAction: { label: "Try AI contract review", href: "/contract-risk" },
  secondaryAction: { label: "AI due diligence review", href: "/ai-due-diligence-document-review" },
  sections: [
    {
      title: "What AI contract review does — and what it doesn't",
      description:
        "AI contract review reads the text of a contract and identifies clause types that commonly carry risk: clauses that create uncapped liability, that assign IP broadly, that include non-compete provisions, or that have asymmetric termination rights. It surfaces these so you know where to focus your attention.\n\nWhat AI contract review doesn't do: it doesn't give legal advice, it doesn't tell you whether a risk is acceptable for your specific situation, and it doesn't catch everything. AI reads the text of the contract — it doesn't know your business context, your jurisdiction's specific case law, or the negotiating dynamics behind the deal. It's a first-pass tool, not a substitute for legal judgment.",
    },
    {
      title: "The clause types that matter most",
      description:
        "Not all contract provisions carry equal risk. AI contract review is most useful when it's trained to surface the clause categories that create real exposure.",
      items: [
        {
          title: "Liability caps and indemnification",
          description:
            "Who bears the cost if something goes wrong? Contracts without liability caps leave you exposed to uncapped damages. Indemnification clauses that are one-sided put you on the hook for the other party's losses. AI can flag missing caps and asymmetric indemnification provisions.",
        },
        {
          title: "IP ownership and assignment",
          description:
            "Who owns what you build? Broad work-for-hire clauses can assign ownership of everything you create — including work done outside the scope of the contract — to the other party. Employment agreements and contractor agreements are common sources of overbroad IP assignments that people sign without reading carefully.",
        },
        {
          title: "Termination and notice",
          description:
            "Can the other party terminate with 24 hours notice? Without cause? Understanding the termination provisions tells you how much security the contract actually provides. One-sided termination rights — where one party can exit freely and the other is locked in — are a common risk that AI can surface.",
        },
        {
          title: "Non-compete and non-solicitation",
          description:
            "How long are you restricted from working in your field, hiring former colleagues, or pursuing certain clients? The enforceability of non-competes varies by jurisdiction, but their scope is always worth reviewing before signing. AI can identify the duration, geographic scope, and covered activities in a non-compete clause.",
        },
        {
          title: "Governing law and dispute resolution",
          description:
            "In which jurisdiction and forum do disputes get resolved? Governing law clauses affect which legal protections apply to you. Mandatory arbitration clauses eliminate your right to a jury trial. These provisions are easy to overlook because they're usually buried at the end of a contract.",
        },
      ],
    },
    {
      title: "Why seeing the exact clause text matters",
      description:
        "There's a meaningful difference between an AI telling you \"this contract has a broad IP assignment clause\" and the AI showing you the specific sentence that creates that assignment.\n\nThe summary is useful. The source text is verifiable. When the AI can locate the clause in your contract and show you the exact language, you can read it, interpret it, and decide whether the AI's characterization is accurate. You might agree with the AI's reading. You might disagree. Either way, you have the text in front of you and can make an informed judgment.\n\nWhen the AI flags a risk without showing the underlying clause, you have to trust the AI's interpretation without being able to check it. For a contract you're about to sign, that's a meaningful gap.",
    },
    {
      title: "Where AI contract review fits in a legal workflow",
      description:
        "AI contract review is most useful as a first-pass read — before you spend time (or legal fees) going through a contract clause by clause yourself.",
      items: [
        {
          title: "Before lawyer review",
          description:
            "If you're having a lawyer review a contract, AI can front-run that review: identify the provisions most worth spending legal time on, and flag anything that looks non-standard. You go into the lawyer conversation knowing which sections matter most.",
        },
        {
          title: "For contracts you review yourself",
          description:
            "Many contracts get signed without formal legal review — NDAs, freelance agreements, SaaS terms, contractor agreements. AI contract review gives you a structured way to catch the provisions that are most likely to cause problems, without reading every word yourself.",
        },
        {
          title: "For comparison across contract versions",
          description:
            "If you're negotiating a contract through multiple redlines, AI can help you track what changed between versions — which provisions were added, removed, or modified — rather than reading the entire document again from scratch each round.",
        },
        {
          title: "For due diligence on incoming contracts",
          description:
            "If you're acquiring a business or reviewing a portfolio of contracts, AI can process documents at a scale that isn't practical manually and surface the provisions that warrant closer attention — particularly when you're looking for consistency (or inconsistency) across many agreements.",
        },
      ],
    },
    {
      title: "What to expect from AI contract review — honestly",
      description:
        "AI contract review catches a lot. It won't catch everything. The things it misses tend to be:\n\n**Context-dependent risk**: a clause that looks standard might be problematic given something specific about your situation — your jurisdiction, your counterparty, your negotiating history — that the AI doesn't know.\n\n**Missing provisions**: AI is better at flagging what's in a contract than what's absent. A contract that's missing a warranty disclaimer, a force majeure clause, or a data protection provision may not trigger a red flag if the AI is looking for the presence of known risk language.\n\n**Ambiguous language**: when contract language is genuinely ambiguous — where reasonable lawyers could disagree about what it means — AI may pick one interpretation without noting the ambiguity. That's a reason to review flagged clauses yourself, not just accept the AI's characterization.",
    },
    {
      title: "How DockDocs AI contract review works",
      description:
        "DockDocs AI reads your contract and flags the provisions that carry common risk — liability exposure, IP ownership, termination rights, non-compete scope — and shows the relevant clause text alongside each finding when the AI can locate it in the document.",
      items: [
        {
          title: "Clause-level findings with source text",
          description:
            "When the AI identifies a risk, it surfaces the relevant clause so you can read the actual language, not just the AI's summary of it. You can confirm the AI's reading is accurate — or decide it got it wrong.",
        },
        {
          title: "Honest about uncertainty",
          description:
            "When the AI can't find a specific clause to support a finding, it says so rather than citing an approximation. A \"couldn't locate the specific provision\" note is more useful than a confident-sounding citation that doesn't point to the right thing.",
        },
        {
          title: "Text sent, not the file",
          description:
            "DockDocs extracts the text from your contract and sends that to the AI model — the original file stays in your browser session, not on an external server. For sensitive contracts, this distinction matters.",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "What is AI contract review?",
      answer:
        "AI contract review uses a language model to read a contract and identify provisions that carry common legal risk — unlimited liability, broad IP assignments, one-sided termination rights, non-compete scope, asymmetric indemnification. A good AI contract review tool shows you the exact clause text it's drawing on so you can verify its reading, rather than just giving you a summary you have to trust.",
    },
    {
      question: "Can AI replace a lawyer for contract review?",
      answer:
        "No. AI contract review is a first-pass tool, not a substitute for legal judgment. It surfaces clause types that commonly carry risk; it doesn't know your jurisdiction's specific case law, your business context, or how enforceable a given provision actually is in your situation. For high-stakes contracts — employment, acquisition, significant vendor agreements — legal review remains necessary. AI contract review is most useful as preparation for that review, not a replacement.",
    },
    {
      question: "What types of contracts does AI review work best for?",
      answer:
        "Contracts with discrete, identifiable provisions work best: NDAs, employment agreements, contractor agreements, SaaS subscription terms, vendor MSAs, and commercial lease agreements. Very short contracts (one page) and very complex multi-party agreements (where risk is distributed across dozens of exhibits) are edge cases where AI contract review adds less value. Standard professional contracts with clear clause structure are the strongest fit.",
    },
    {
      question: "How does AI identify risky clauses?",
      answer:
        "AI contract review looks for the presence (and absence) of specific clause types, the scope of the obligations they create, and language patterns that indicate unusual or one-sided terms. It's pattern-matching against what \"standard\" and \"non-standard\" looks like for a given clause type — not applying legal judgment about whether a risk is acceptable in your specific situation. That second step requires a human.",
    },
    {
      question: "Is it safe to upload a contract to an AI tool?",
      answer:
        "It depends on the tool. Tools that upload your file to a server expose the contract to third-party storage and processing. DockDocs extracts the text from your contract in your browser and sends that text to the AI model — the original file doesn't leave your device. For contracts containing sensitive commercial terms, NDA-protected information, or personal data, the processing model matters.",
    },
  ],
  readingLinks: [
    {
      label: "How to read a contract",
      href: "/how-to-read-a-contract/",
      description: "Before using AI review, understand the structure of a contract: how clauses interact, which sections carry the most risk, and what to focus attention on.",
    },
    {
      label: "Lease agreement red flags",
      href: "/lease-agreement-red-flags/",
      description: "The specific provisions that frequently harm tenants in commercial and residential lease agreements — useful context when reviewing a lease with AI tools.",
    },
    {
      label: "Employment contract red flags",
      href: "/employment-contract-red-flags/",
      description: "Non-compete scope, IP assignment breadth, at-will exceptions, and other employment contract provisions AI review commonly flags.",
    },
    {
      label: "Vendor contract red flags",
      href: "/vendor-contract-red-flags/",
      description: "Pricing change rights, data ownership, liability caps, and auto-renewal traps — the vendor agreement provisions most often surfaced by contract analysis.",
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
      name: "AI Contract Review: Surface Risky Clauses and Check the Exact Language (2026)",
      description:
        "What AI contract review does, which clause types it handles best, and why source traceability — seeing the exact clause text — matters more than trusting the AI's interpretation.",
      inLanguage: "en",
      about: { "@id": `${siteUrl}#org` },
      isPartOf: { "@type": "WebSite", name: "DockDocs", url: siteUrl },
      publisher: { "@type": "Organization", "@id": `${siteUrl}#org` },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "DockDocs", item: `${siteUrl}/` },
        { "@type": "ListItem", position: 2, name: "AI Contract Review", item: url },
      ],
    },
  ],
};

export default function AiContractReviewPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <SaasInfoPage page={page} />
    </>
  );
}
