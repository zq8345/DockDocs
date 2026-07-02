import type { Metadata } from "next";
import { SaasInfoPage } from "@/components/SaasInfoPage";
import { siteUrl } from "@/lib/i18n";

// Standalone English-first GEO content page targeting queries about
// what to look for in an NDA before signing.
// Links to /contract-risk/ (AI contract analysis, server-side AI)
// and /ai-workspace/ (multi-document review).
// AI tool claims: contract text is sent to an AI model for analysis.
// NOT in routeSlugs. Wired into standaloneContentRoutes + lib/standalone-routes.ts.

const url = `${siteUrl}/nda-what-to-look-for/`;

export const metadata: Metadata = {
  title: "What to Look For in an NDA Before Signing",
  description:
    "NDAs vary widely in what they cover, how long they last, and what they prevent you from doing. This guide covers the key clauses — definition of confidential information, permitted disclosures, term, remedies, and mutual vs. one-sided scope — and what makes each one problematic.",
  keywords: [
    "what to look for in an NDA",
    "NDA red flags",
    "NDA review checklist",
    "non-disclosure agreement review",
    "NDA mutual vs one-sided",
    "NDA term length",
    "what makes a bad NDA",
    "before signing an NDA",
  ],
  alternates: { canonical: "/nda-what-to-look-for/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "What to Look For in an NDA Before Signing",
    description:
      "The NDA clauses that create real problems — overly broad definitions of confidential information, one-sided scope, unlimited term, punitive remedies — and what to check before you sign.",
    url,
    siteName: "DockDocs",
    type: "article",
  },
};

const page = {
  slug: "faq" as const,
  title: "What to Look For in an NDA Before Signing",
  description:
    "Key NDA clauses, what makes them overly broad or problematic, and how to evaluate a non-disclosure agreement before you sign.",
  eyebrow: "Contracts & Agreements Guide",
  heroTitle: "What to look for in an NDA before signing",
  heroDescription:
    "A non-disclosure agreement looks simple: agree not to share what you learn. In practice, NDAs vary significantly in what they define as confidential, how long the obligation lasts, what you're permitted to disclose and to whom, and what the other party can do if they believe you've violated it. A poorly reviewed NDA can prohibit you from discussing work you did independently, obligate you to maintain secrecy indefinitely, or expose you to injunctive relief in any jurisdiction the other party chooses. Understanding what to look for — before you sign — is the most efficient investment you can make in an NDA review.",
  primaryAction: { label: "Review your NDA with AI", href: "/contract-risk" },
  secondaryAction: { label: "Analyze multiple agreements", href: "/ai-workspace" },
  sections: [
    {
      title: "Definition of 'confidential information'",
      description:
        "The definition of confidential information is the most important clause in an NDA. Everything else — duration, permitted disclosures, remedies — operates on whatever falls within this definition. A definition that's too broad or too vague creates obligations you can't practically honor.",
      items: [
        {
          title: "Definitions that cover everything the disclosing party designates",
          description:
            "Some NDAs define confidential information as 'anything the disclosing party marks confidential or identifies as confidential at the time of disclosure.' This requires you to track every designation, and in practice means the disclosing party can unilaterally expand what you're bound to protect simply by labeling it. More balanced definitions enumerate categories of information (financial data, customer lists, product roadmaps, source code) and include a reasonableness standard.",
        },
        {
          title: "Definitions that include oral disclosures without follow-up confirmation",
          description:
            "NDAs that include verbal statements as confidential information — without requiring the disclosing party to confirm in writing within a set period — create obligations around conversations you can't document. If a meeting happened six months ago and a disclosure occurred then, you may have no record of what was disclosed or when. Reasonable NDAs either exclude oral disclosures entirely or require written confirmation of the confidential nature of verbal disclosures within 30 days.",
        },
        {
          title: "Definitions with no carve-outs for publicly available information",
          description:
            "Standard NDA definitions exclude information that: (1) was already in your possession before the disclosure; (2) is or becomes publicly available through no breach of the agreement; (3) you received independently from a third party without restriction; or (4) you developed independently without reference to the confidential information. An NDA missing one or more of these standard carve-outs creates obligations that could apply to information you already knew or that becomes public.",
        },
        {
          title: "Definitions that include the existence of the relationship itself",
          description:
            "Some NDAs define confidential information to include the existence of the discussions or the NDA itself — you can't even confirm that you've signed an NDA with this party. This is common in M&A contexts where it's standard and reasonable. In most other contexts — vendor relationships, employment, partnerships — requiring confidentiality about the existence of a business relationship is unusual and can create awkward obligations when the relationship becomes publicly apparent.",
        },
      ],
    },
    {
      title: "Scope: mutual vs. one-sided",
      description:
        "Who is bound by the NDA, and whose information is protected, defines the power balance of the agreement. Most NDAs are either mutual (both parties share and protect information) or unilateral (one party discloses, one party protects). The structure should match the actual situation.",
      items: [
        {
          title: "One-sided NDAs in bilateral disclosure situations",
          description:
            "If both parties are sharing sensitive information — in a partnership discussion, a joint development project, or an acquisition where both parties disclose financials — a one-sided NDA that only protects one party's information creates an asymmetric obligation. The party not protected by the NDA shares information with no contractual protection. In these situations, a mutual NDA (MDA) is more appropriate. Watch for NDAs labeled as 'mutual' that are actually one-sided in their operative language.",
        },
        {
          title: "Mutual NDAs in clearly one-sided situations",
          description:
            "Conversely, if only one party is genuinely disclosing sensitive information — a company sharing its product roadmap with a vendor, or an employer sharing proprietary process information with a contractor — a mutual NDA may give the counterparty unexpected protections they don't need. This is typically less problematic than the reverse, but it's worth understanding what you're agreeing to protect in the 'mutual' direction.",
        },
        {
          title: "Scope that extends to affiliates without limit",
          description:
            "Some NDAs extend the obligation to affiliates, subsidiaries, or related entities without defining the scope. If the other party is part of a large corporate group, you may be obligated to protect information on behalf of dozens of entities you've never interacted with. A reasonable NDA either limits protection to the named party or defines 'affiliate' specifically and ties obligations to the specific information those affiliates share.",
        },
      ],
    },
    {
      title: "Permitted disclosures",
      description:
        "NDAs define circumstances where you're permitted to disclose confidential information. Overly restrictive permitted disclosure clauses can create compliance problems with your existing legal obligations.",
      items: [
        {
          title: "No carve-out for legally compelled disclosure",
          description:
            "If you're subpoenaed or otherwise legally required to disclose information covered by an NDA, you need to be able to comply with the legal compulsion without breaching the agreement. Standard NDAs permit legally compelled disclosure, typically requiring you to give the disclosing party prompt notice so they can seek a protective order. An NDA with no legally-compelled-disclosure carve-out could create a conflict between your contractual obligation and a court order.",
        },
        {
          title: "Restrictions on disclosure to your own lawyers and advisors",
          description:
            "To get advice on an agreement or a transaction, you may need to share confidential information with your attorneys, accountants, or financial advisors. A reasonable NDA permits disclosure to professional advisors who are themselves bound by confidentiality obligations. An NDA that requires the other party's written consent before you can share information with your own counsel creates a practical problem: you can't get legal advice on the agreement without potentially breaching it.",
        },
        {
          title: "Restrictions that conflict with reporting obligations",
          description:
            "Employees at public companies, regulated entities, or organizations with compliance obligations may have affirmative reporting duties — to their compliance department, to regulators, or to auditors. An NDA signed with a vendor or partner that conflicts with these obligations creates a real compliance risk. Some NDAs include explicit carve-outs for regulatory disclosures; if yours doesn't, and your role involves compliance reporting, this is worth flagging.",
        },
        {
          title: "Need-to-know limitations on employees and contractors",
          description:
            "Reasonable NDAs permit disclosure to employees and contractors who need to know the information to do their jobs, provided they're bound by similar confidentiality obligations. An NDA that requires individual written approval for each person who accesses the information creates operational burdens — particularly for organizations where confidential information may need to reach multiple teams. Check whether the NDA's internal disclosure provisions are workable for how your organization actually operates.",
        },
      ],
    },
    {
      title: "Term and duration",
      description:
        "How long confidentiality obligations last matters as much as what they cover. Obligations that run indefinitely create permanent constraints; obligations that are too short may not protect the disclosing party's legitimate interests.",
      items: [
        {
          title: "Indefinite or perpetual confidentiality obligations",
          description:
            "NDAs that require confidentiality 'in perpetuity' or 'indefinitely' without a defined end date create obligations that never terminate. For trade secrets — which themselves enjoy protection for as long as they remain secret — perpetual confidentiality obligations may be legally defensible and commercially reasonable. For other categories of business information (financial projections, product roadmaps, customer lists) that change over time and lose commercial sensitivity, perpetual obligations go beyond what's necessary. A defined term of two to five years is typical for commercial NDAs; longer terms are appropriate for highly sensitive technical information.",
        },
        {
          title: "Short terms that leave the disclosing party exposed",
          description:
            "On the other end, some NDAs have very short terms — 12 months from the date of disclosure, for example — that may not adequately protect genuinely sensitive information. If you're the disclosing party, a one-year term on a business plan, a product roadmap, or customer data may leave you exposed once the term ends. What you protect should drive the term you negotiate.",
        },
        {
          title: "Different terms for different types of information",
          description:
            "A well-drafted NDA can specify different confidentiality periods for different categories of information — shorter terms for business and financial information, longer or perpetual terms for technical know-how and trade secrets. If the NDA treats all information identically with a single term, it may be appropriate for one category but not another. Consider whether the information you'll be sharing or receiving falls into multiple categories with genuinely different sensitivity timeframes.",
        },
      ],
    },
    {
      title: "Remedies and enforcement",
      description:
        "What happens if the NDA is breached defines the real-world consequences of signing. Overly aggressive remedy provisions can give the other party disproportionate leverage.",
      items: [
        {
          title: "Automatic injunctive relief without a bond requirement",
          description:
            "Many NDAs include clauses stating that any breach will cause 'irreparable harm' entitling the other party to seek injunctive relief without posting a bond. These provisions can make it significantly easier for the other party to obtain an emergency court order restraining your actions pending a full hearing — even in cases where the alleged breach is disputed. Courts aren't required to follow NDA terms on injunctive relief, but a signed acknowledgment of irreparable harm is persuasive. Combined with a choice-of-forum clause requiring litigation in an inconvenient jurisdiction, this can be used as a pressure tactic.",
        },
        {
          title: "Liquidated damages provisions at fixed amounts",
          description:
            "Some NDAs specify fixed financial penalties per breach or per disclosure. Liquidated damages provisions are generally enforceable when they represent a reasonable estimate of actual damages at the time of contracting — damages that would otherwise be difficult to quantify. Fixed per-breach penalties that are disproportionate to the commercial value of the information, or that could aggregate rapidly across multiple technical disclosures, can create extreme financial exposure relative to the actual harm.",
        },
        {
          title: "Attorneys' fees provisions that favor only one party",
          description:
            "Some NDAs include one-sided attorneys' fees provisions: if the disclosing party prevails in an enforcement action, it recovers fees; if the receiving party prevails, it doesn't. This asymmetry makes the receiving party bear all litigation cost risk, which can discourage legitimate defenses even where the alleged breach is dubious or the NDA clause at issue is unenforceable.",
        },
        {
          title: "Forum selection clauses in inconvenient jurisdictions",
          description:
            "NDAs frequently specify the jurisdiction where disputes must be litigated. A choice-of-forum clause requiring litigation in a state where you have no physical presence, no attorneys, and no connection to the dispute creates significant practical burdens if you need to defend yourself. This is particularly problematic for individuals or small companies signing NDAs with large organizations that have established litigation resources in the specified forum.",
        },
      ],
    },
    {
      title: "How to review an NDA before signing",
      description:
        "A structured NDA review takes 20–30 minutes if you know what to look for. Start with the clauses that have the most practical impact.",
      items: [
        {
          title: "Read the definition of confidential information first",
          description:
            "This defines the scope of everything else. Check for the four standard carve-outs (prior possession, public availability, independent development, third-party disclosure), check whether oral disclosures are included, and check whether the definition requires a designation process or covers 'anything the other party considers confidential.'",
        },
        {
          title: "Confirm the mutual vs. one-sided structure matches the situation",
          description:
            "If both parties are sharing information, the NDA should be mutual. If only one party is sharing, a one-sided NDA is appropriate — but check which direction it runs and confirm it matches the actual flow of information.",
        },
        {
          title: "Check the term and whether it differs by information category",
          description:
            "For most commercial NDAs, two to five years is typical. Longer for technical know-how; shorter for time-sensitive business information. Perpetual terms warrant closer scrutiny.",
        },
        {
          title: "Check the permitted disclosures for legal and regulatory conflicts",
          description:
            "Verify that you can disclose to your own legal counsel and advisors, and that a legally-compelled-disclosure carve-out exists. If your role involves compliance or regulatory reporting, check whether those obligations create a conflict with the NDA's restrictions.",
        },
        {
          title: "Understand the remedies and forum selection",
          description:
            "Check whether injunctive relief is pre-stipulated, what the damages provisions look like, and where disputes must be litigated. Asymmetric remedies and inconvenient forum clauses are negotiating points, particularly for individuals and smaller organizations.",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "What are the most important things to check in an NDA?",
      answer:
        "The definition of confidential information (what you're obligated to protect and what's excluded), the mutual vs. one-sided structure (does it match who's actually sharing information), the term (how long your obligations last), the permitted disclosures (can you share with your attorneys, comply with legal compulsion), and the remedies (injunctive relief provisions, liquidated damages, forum selection). These five areas determine the practical scope and risk of the agreement.",
    },
    {
      question: "What's the difference between a mutual NDA and a one-sided NDA?",
      answer:
        "A mutual NDA (sometimes called an MNDA or MDA) binds both parties to protect each other's confidential information — appropriate when both parties are disclosing sensitive information. A one-sided NDA (unilateral NDA) binds only the receiving party — appropriate when only one party is disclosing. The structure should match the actual information flow. An NDA labeled 'mutual' may be one-sided in its operative terms, so read the definitions of 'disclosing party' and 'receiving party' carefully.",
    },
    {
      question: "How long should an NDA last?",
      answer:
        "Most commercial NDAs specify two to five years for general business information. Technical know-how, trade secrets, and highly proprietary technical information may warrant longer terms or perpetual protection — trade secrets in particular derive their protection from continued secrecy, so perpetual NDA terms for those categories are commercially rational. Financial projections, business plans, and customer lists typically lose commercial sensitivity over time; perpetual terms for those categories are more aggressive than necessary. A well-drafted NDA can specify different terms for different information categories.",
    },
    {
      question: "Can I negotiate an NDA?",
      answer:
        "Yes, and it's common to do so for specific clauses — particularly the definition of confidential information, the term, the permitted disclosures, and any overly aggressive remedy provisions. The other party's responsiveness to negotiation depends on the context: a counterparty with more leverage (a large enterprise offering vendor access) may be less flexible than one with less leverage (a startup seeking a partnership). Standard requests — like adding standard carve-outs to the confidential information definition, or narrowing an indefinite term to five years — are rarely deal-breakers. If specific clauses create genuine compliance conflicts with your existing obligations, these should be raised before signing, not after.",
    },
    {
      question: "What happens if I violate an NDA?",
      answer:
        "Consequences depend on the NDA's terms and jurisdiction. Typical remedies: the injured party can seek actual damages (quantifiable financial harm from the disclosure), injunctive relief (a court order preventing further disclosure), and in some cases attorneys' fees and liquidated damages if the NDA specifies them. NDAs that include 'irreparable harm' acknowledgments and automatic injunctive relief clauses can make it easier for the other party to obtain emergency court orders. Practical outcomes often depend more on the commercial relationship and the actual harm caused than on the NDA's formal remedies.",
    },
    {
      question: "How can AI help review an NDA?",
      answer:
        "AI-assisted NDA review extracts the key provisions — confidential information definition, carve-outs, term, permitted disclosures, remedies, forum selection — and flags clauses that deviate from standard practice or create unusual obligations. The output identifies which sections warrant attention and explains in plain language why each flagged clause is notable. This is useful for quickly identifying the high-priority areas in a dense document before deciding whether to sign, request changes, or seek legal counsel. AI review is informational — for significant concerns, or for NDAs that will govern substantial commercial relationships, an attorney familiar with your jurisdiction is the appropriate resource.",
    },
  ],
  readingLinks: [
    {
      label: "How to read a contract",
      href: "/how-to-read-a-contract/",
      description: "A systematic approach to reading any agreement: how contracts are structured, why definitions matter, which sections carry the most risk, and language patterns to watch for.",
    },
    {
      label: "Employment contract red flags",
      href: "/employment-contract-red-flags/",
      description: "NDAs are often part of an employment package. Employment agreement red flags: non-compete scope, IP assignment breadth, arbitration clauses, and equity documentation.",
    },
    {
      label: "Vendor contract red flags",
      href: "/vendor-contract-red-flags/",
      description: "Supplier and vendor agreements frequently include confidentiality provisions alongside the commercial terms. What else to review in vendor agreements.",
    },
    {
      label: "Software license agreement red flags",
      href: "/software-license-agreement-red-flags/",
      description: "SaaS and software agreements include confidentiality provisions alongside data rights, termination access, and audit rights provisions worth reviewing.",
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
      name: "What to Look For in an NDA Before Signing",
      description:
        "Key NDA clauses — confidential information definition, mutual vs. one-sided scope, term, permitted disclosures, and remedies — and what makes each one problematic.",
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
        { "@type": "ListItem", position: 2, name: "What to Look For in an NDA", item: url },
      ],
    },
  ],
};

export default function NdaWhatToLookForPage() {
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
