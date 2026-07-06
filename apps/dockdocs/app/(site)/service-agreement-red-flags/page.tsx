import type { Metadata } from "next";
import { SaasInfoPage } from "@/components/SaasInfoPage";
import { siteUrl } from "@/lib/i18n";

// Standalone English-first GEO content page targeting professionals and businesses
// reviewing service agreements before signing — consulting, IT services, marketing,
// professional services. Links to /contract-risk/ (AI-assisted contract analysis).
// NOT in routeSlugs. Wired into standaloneContentRoutes + lib/standalone-routes.ts.

const url = `${siteUrl}/service-agreement-red-flags/`;

export const metadata: Metadata = {
  title: "Service Agreement Red Flags — What to Check Before You Sign",
  description:
    "Service agreements hide risks in their scope, IP, payment, and termination clauses. This guide covers the provisions most likely to create disputes, cost overruns, and unwanted obligations — and what to check in each one.",
  keywords: [
    "service agreement red flags",
    "service contract red flags",
    "what to look for in a service agreement",
    "consulting agreement red flags",
    "professional services agreement review",
    "service contract review checklist",
    "service agreement before signing",
    "IT services contract red flags",
  ],
  alternates: { canonical: "/service-agreement-red-flags/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Service Agreement Red Flags — What to Check Before You Sign",
    description:
      "Scope creep, IP disputes, uncapped liability, and one-sided termination are the most common sources of service agreement problems. A guide to the clauses that matter most.",
    url,
    siteName: "DockDocs",
    type: "article",
  },
};

const page = {
  slug: "faq" as const,
  title: "Service Agreement Red Flags — What to Check Before You Sign",
  description:
    "The clauses in service agreements that create the most disputes, cost overruns, and unwanted obligations — and how to spot them before you sign.",
  eyebrow: "Contract Review & Risk",
  heroTitle: "Service agreement red flags",
  heroDescription:
    "Service agreements look straightforward until something goes wrong. A vague scope clause becomes a disagreement about what was actually owed. A missing acceptance-criteria provision gives one party the right to reject finished work indefinitely. A one-sided termination clause lets the other party exit without penalty while holding you to your obligations. These problems are not edge cases — they are how service agreement disputes typically start. This guide covers the provisions most likely to cause problems, what to look for in each, and what the contract should say instead.",
  primaryAction: { label: "Scan this agreement for risk clauses", href: "/contract-risk" },
  secondaryAction: { label: "Compare two contract versions", href: "/redline" },
  sections: [
    {
      title: "Scope of work: the source of most disputes",
      description:
        "Vague scope language is the single most common cause of service agreement disputes. When the scope is ambiguous, every party reads it to suit their interests — and both readings are technically defensible.",
      items: [
        {
          title: "Undefined deliverables",
          description:
            "A scope that describes activities ('provide marketing support', 'assist with IT infrastructure') rather than deliverables ('deliver a 12-month content calendar by March 1', 'migrate three servers to cloud by April 15') gives the service provider wide latitude to claim the work is complete. Before signing, ask: what specifically will be delivered, in what format, and by when? If the answers aren't in the contract, the scope is too vague.",
        },
        {
          title: "No acceptance criteria",
          description:
            "Without defined acceptance criteria, the party receiving the work has unlimited discretion to reject it — and the party providing the work has no objective standard for claiming it is done. A well-drafted service agreement specifies what 'acceptance' means: specific criteria the deliverable must meet, a review period after delivery, and a deemed-acceptance provision (if no objection within N days, work is accepted). Missing acceptance criteria create indefinite disputes about whether the work was satisfactory.",
        },
        {
          title: "No change order process",
          description:
            "When a client requests changes outside the original scope, the question of whether those changes are included or additional becomes a dispute. A service agreement should include a change order provision: any change to scope, timeline, or deliverables must be agreed in writing, signed by both parties, and priced before the work begins. Without it, service providers absorb scope creep or face payment disputes; clients face unexpected invoices.",
        },
        {
          title: "'As requested' and open-ended service descriptions",
          description:
            "Phrases like 'as directed by client', 'as required', or 'additional services as needed' without a cap or process for defining scope are indefinite obligations. They mean the service provider has agreed to do whatever is asked with no clear endpoint. These should be replaced with a specific list of included services and a defined process for handling requests outside that list.",
        },
      ],
    },
    {
      title: "IP and ownership: who keeps the work product",
      description:
        "IP ownership clauses in service agreements determine who owns what the service provider creates — and the default in most jurisdictions is not what most clients expect.",
      items: [
        {
          title: "Work-for-hire and assignment clauses",
          description:
            "In most jurisdictions, work created by an independent contractor is owned by the contractor, not the client, unless there is a written assignment. Service agreements should include an explicit IP assignment clause transferring ownership of all work product, deliverables, and related IP to the client upon payment. If such a clause is absent, the service provider may retain rights to work you commissioned and paid for.",
        },
        {
          title: "Pre-existing IP and background IP carve-outs",
          description:
            "Service providers often retain ownership of tools, frameworks, methodologies, and code they bring to an engagement (background IP). A well-drafted clause distinguishes between background IP (service provider retains) and foreground IP (client receives). Watch for broad background IP carve-outs that effectively give the provider ownership of the core deliverable by classifying it as a modification of their existing tools.",
        },
        {
          title: "License-back provisions",
          description:
            "Some service agreements assign IP to the client but include a license-back — a license for the provider to use the work product in other engagements. Depending on how it is drafted, this can mean a competitor has a license to use code, content, or designs you paid for. Review whether license-back rights are exclusive or non-exclusive, and whether they are limited to non-competing uses.",
        },
        {
          title: "IP from subcontractors",
          description:
            "If the service provider uses subcontractors, the IP provisions must extend to subcontractor work. A clause that assigns IP to the client but does not require the provider to obtain equivalent assignments from subcontractors creates a gap — the client owns the prime provider's work but not the subcontracted portion.",
        },
      ],
    },
    {
      title: "Liability, indemnification, and warranties",
      description:
        "These clauses determine who bears the financial consequences when the service goes wrong. They are frequently the most negotiated provisions in professional services agreements.",
      items: [
        {
          title: "Uncapped liability or caps set below the contract value",
          description:
            "A service agreement with no liability cap exposes both parties to unlimited claims. An agreement with a cap set below the contract value (for example, 'liability shall not exceed $5,000' in a $200,000 engagement) means the provider has no financial incentive to perform — the maximum they can lose is less than what they were paid. Standard market practice is a cap set at the fees paid in the prior 12 months, or the total fees paid, or a multiple of annual fees for high-risk engagements.",
        },
        {
          title: "One-sided indemnification",
          description:
            "Indemnification clauses that require one party to defend and hold harmless the other without a corresponding obligation in return are one-sided. A red flag pattern: a service provider requires the client to indemnify them for claims arising from the client's use of the service, but the provider's reciprocal obligation is limited to IP infringement only. Both parties should have indemnification obligations proportionate to their risks.",
        },
        {
          title: "Warranty disclaimers",
          description:
            "Service agreements sometimes disclaim all warranties, including implied warranties of fitness for a particular purpose and merchantability. A complete warranty disclaimer means the service provider makes no promise that the work will actually do what you need it to do. At minimum, look for an express warranty that the deliverables will conform to the specifications agreed in the scope of work.",
        },
        {
          title: "Consequential damages exclusions",
          description:
            "Most professional services agreements exclude liability for consequential or indirect damages (lost profits, lost business opportunity, business interruption). These exclusions are standard and generally reciprocal. A red flag is when the exclusion is one-sided — applying only to the provider but not to the client — or when it is drafted so broadly that it eliminates all meaningful remedies for the client when the provider fails to perform.",
        },
      ],
    },
    {
      title: "Payment terms and financial risk",
      description:
        "Payment provisions determine when you must pay, what happens if you dispute an invoice, and what penalties apply for late payment. These are frequently weighted toward the service provider.",
      items: [
        {
          title: "Milestone payments vs. time-and-materials",
          description:
            "Fixed-price milestone agreements pay upon delivery of defined outputs. Time-and-materials agreements pay for hours or resources consumed, regardless of whether deliverables are completed. Time-and-materials arrangements carry more risk for the client: if the project takes longer than estimated, the client pays the overrun. Before signing a time-and-materials agreement, look for: a not-to-exceed cap, a regular reporting requirement, and approval rights before billing additional hours.",
        },
        {
          title: "Payment timing vs. acceptance timing",
          description:
            "Watch for agreements that require payment within 30 days of invoice but give the client 30 days to review work for acceptance. If the review period is the same as the payment period, the client must pay before completing their review. The payment deadline should run from acceptance, not from invoice date or delivery date.",
        },
        {
          title: "Interest on late payments",
          description:
            "Late payment interest clauses are standard and legitimate. A red flag is an interest rate significantly above the legal maximum (some jurisdictions cap interest rates) or automatic acceleration provisions that make all remaining fees immediately due on any late payment. Review the rate and any acceleration mechanics.",
        },
        {
          title: "Disputed invoice provisions",
          description:
            "A well-drafted service agreement specifies a process for disputing invoices: the client gives written notice of the disputed amount within a specified period, and payment of undisputed amounts remains due while the dispute is resolved. Without this, a partial dispute over one line item on an invoice may give the provider grounds to claim the entire invoice is overdue.",
        },
      ],
    },
    {
      title: "Termination rights and exit provisions",
      description:
        "Termination clauses determine who can exit, under what conditions, on how much notice, and what obligations survive after termination. One-sided termination rights are among the most consequential red flags in service agreements.",
      items: [
        {
          title: "Termination for convenience (and whether it is mutual)",
          description:
            "Many service agreements give the client the right to terminate for convenience (without cause) on notice, but do not give the same right to the service provider. That asymmetry is often acceptable from the client's perspective — it means you can exit if the relationship breaks down without having to prove breach. The red flag is the reverse: the provider has a broad right to terminate for convenience, but the client does not. Check whether termination-for-convenience rights are mutual or one-sided.",
        },
        {
          title: "Termination for cause and cure periods",
          description:
            "Termination for cause provisions should include a cure period: the breaching party receives written notice and a defined period (typically 15 to 30 days) to remedy the breach before termination takes effect. Agreements that allow immediate termination without a cure period — or that define 'cause' so broadly that minor disputes qualify — give one party significant leverage to exit at will while claiming the other is in breach.",
        },
        {
          title: "Payment obligations on termination",
          description:
            "When a service agreement terminates early, what is owed? Look for: whether the client owes payment for work completed but not yet invoiced, whether the client owes payment for anticipated work not yet begun (cancellation fees), and whether there is an obligation to pay for non-cancelable commitments the provider has made (subcontractors, purchased licenses). These provisions are often legitimate but should be specific rather than open-ended.",
        },
        {
          title: "Transition and knowledge transfer",
          description:
            "If you terminate a service agreement and need to transition work to another provider, does the agreement require the departing provider to cooperate with the transition? Agreements with no transition assistance obligations can make it expensive or impractical to change providers, creating practical lock-in even when the contract has no explicit exclusivity clause.",
        },
      ],
    },
    {
      title: "Non-solicitation and restrictive covenants",
      description:
        "Restrictive covenants in service agreements — particularly non-solicitation and non-compete provisions — can limit your ability to hire people who worked on your engagement or to work with competitors of your service provider.",
      items: [
        {
          title: "Non-solicitation of employees",
          description:
            "Most service agreements include a provision prohibiting you from soliciting or hiring the service provider's employees who worked on your engagement for a period after the agreement ends. This is generally reasonable. The red flag is a broad non-solicitation clause that covers all of the provider's employees (not just those you worked with), applies to anyone who responds to your general job postings, or extends for an unreasonably long period (more than 12 months is worth pushing back on).",
        },
        {
          title: "Non-compete provisions",
          description:
            "Some service agreements include a non-compete provision preventing you from engaging a competing service provider during or after the agreement. This is unusual and aggressive — you are the client, not the employee. Non-compete clauses in client agreements should be resisted or limited significantly (short duration, narrow definition of 'competitor', limited to providers of identical services).",
        },
        {
          title: "Non-solicitation of clients",
          description:
            "Provisions preventing the service provider from soliciting your clients after the engagement are protective of your business interests and generally acceptable. Review the scope — ideally limited to clients the provider interacted with during the engagement, not all of your clients.",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "What's the most important clause to review in a service agreement?",
      answer:
        "Scope of work is the starting point, because it determines what both parties are committing to. If the scope is vague, every other clause is harder to enforce — you can't claim breach of a standard that was never defined. After scope, prioritize: IP ownership (who keeps the work product), liability cap (what's the maximum financial exposure), and termination rights (who can exit and at what cost). These four provisions account for most service agreement disputes.",
    },
    {
      question: "What's the difference between a service agreement and a vendor contract?",
      answer:
        "The terms are often used interchangeably, but a service agreement typically refers to a contract for services — consulting, IT, marketing, professional services — where the primary deliverable is work performed rather than a product supplied. A vendor contract is broader and can include product supply, software licensing, or services. The key differences in what to review: service agreements require particular attention to scope of work, deliverables, acceptance criteria, and IP ownership of work product, because these don't exist in product supply contracts.",
    },
    {
      question: "Do I need a lawyer to review a service agreement?",
      answer:
        "For high-value, long-term, or legally complex engagements, legal review is worth the cost. For routine engagements, a systematic self-review using a checklist like this one — covering scope, IP, liability, payment, and termination — can identify the provisions that need negotiation. If you find material issues (uncapped liability, missing IP assignment, one-sided termination without cure), those are worth flagging to a lawyer. Using an AI contract analysis tool first can help you identify where to focus attention before engaging legal review.",
    },
    {
      question: "Can I use AI to review a service agreement?",
      answer:
        "AI tools can scan a service agreement and flag common risk patterns — uncapped liability, auto-renewal terms, one-sided termination rights, missing standard protections. This is useful for a first pass, particularly for identifying which provisions need closer attention. The limitation: AI analysis flags patterns, it does not give legal advice or assess how a clause would be interpreted in your specific jurisdiction or context. Use it as a screening tool, not a replacement for legal judgment on high-stakes provisions.",
    },
    {
      question: "What should I do if I find a red flag in a service agreement?",
      answer:
        "Note specifically what the problematic provision says and what you need it to say instead. Then raise it as a negotiation point before signing — not after. Most service providers are willing to negotiate standard provisions. If a provider refuses any modification to a one-sided liability cap, a missing IP assignment, or a termination clause with no cure period, treat that refusal as information about how they will behave if something goes wrong. Not all red flags are dealbreakers, but they should all be deliberate decisions, not surprises.",
    },
    {
      question: "How do I verify the contract I'm signing hasn't changed from the version I reviewed?",
      answer:
        "Run a PDF comparison between the version you reviewed and the final version sent for signature. Upload both PDFs to a redline comparison tool and it will highlight every text difference. Pay particular attention to: the liability section, IP assignment, termination rights, and any clause with a number (payment terms, caps, notice periods). Changes between 'agreed' and 'signature' versions are rare but not unknown, particularly in long agreements where a single changed clause is easy to miss.",
    },
  ],
  readingLinks: [
    {
      label: "Vendor contract red flags",
      href: "/vendor-contract-red-flags/",
      description:
        "When the service agreement is with a supplier or vendor, the additional provisions to watch: SLA remedies, data handling, auto-renewal terms, and supplier audit rights.",
    },
    {
      label: "Freelance contract red flags",
      href: "/freelance-contract-red-flags/",
      description:
        "If you are a freelancer signing a client's paper, the provisions most likely to create problems: IP ownership, payment on acceptance, kill fees, and non-compete scope.",
    },
    {
      label: "How to compare two versions of a contract",
      href: "/compare-two-versions-of-a-document/",
      description:
        "When a revised service agreement comes back from the other side, how to systematically find every change — particularly changes made without tracked markup.",
    },
    {
      label: "How to redline a contract",
      href: "/how-to-redline-a-contract/",
      description:
        "The mechanics of marking up a service agreement with your proposed changes — tracked changes in Word, redlining PDFs, and sending back a professional redline.",
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
      name: "Service Agreement Red Flags — What to Check Before You Sign",
      description:
        "Scope creep, IP disputes, uncapped liability, and one-sided termination are the most common sources of service agreement problems. A guide to the clauses that matter most.",
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
        {
          "@type": "ListItem",
          position: 2,
          name: "Service Agreement Red Flags",
          item: url,
        },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: page.faqs.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
  ],
};

export default function ServiceAgreementRedFlagsPage() {
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
