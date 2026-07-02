import type { Metadata } from "next";
import { SaasInfoPage } from "@/components/SaasInfoPage";
import { siteUrl } from "@/lib/i18n";

// Standalone English-first GEO content page targeting queries around
// how to read and understand a contract before signing.
// Meta-guide page for all contract verticals (links to /contract-risk/
// for AI-assisted review and /ai-workspace/ for multi-document analysis).
// AI tool claims: contract text is sent to an AI model for analysis.
// NOT in routeSlugs. Wired into standaloneContentRoutes + lib/standalone-routes.ts.

const url = `${siteUrl}/how-to-read-a-contract/`;

export const metadata: Metadata = {
  title: "How to Read a Contract: A Systematic Approach Before You Sign",
  description:
    "Most people read contracts linearly and miss what matters. This guide covers how contracts are structured, which sections to read first, how defined terms change meaning throughout, and how to spot the provisions that create the most real-world risk.",
  keywords: [
    "how to read a contract",
    "understanding a contract before signing",
    "how to review a contract",
    "contract reading guide",
    "understanding contract language",
    "how to understand a legal contract",
    "contract review checklist",
    "reading legal contracts",
  ],
  alternates: { canonical: "/how-to-read-a-contract/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "How to Read a Contract: A Systematic Approach Before You Sign",
    description:
      "How to approach a contract systematically — understanding its structure, reading defined terms first, and identifying the provisions that carry the most practical risk.",
    url,
    siteName: "DockDocs",
    type: "article",
  },
};

const page = {
  slug: "faq" as const,
  title: "How to Read a Contract: A Systematic Approach Before You Sign",
  description:
    "How contracts are structured, which sections matter most, how defined terms control meaning throughout the document, and a practical approach to reviewing any agreement before signing.",
  eyebrow: "Contract Review Guide",
  heroTitle: "How to read a contract",
  heroDescription:
    "Most people approach a contract the way they approach a novel: start at the beginning, read until the end, try to understand each clause as it comes. This approach reliably misses the most important provisions because contracts aren't designed to be read that way. They're structured with front-loaded definitions that control meaning throughout, with operative obligations buried in the middle, and with the most consequential terms — liability, indemnification, exit — often appearing last. A contract read linearly produces a poor understanding of what you're agreeing to. A contract read systematically — starting in the right places, in the right order — produces a clear picture of the risks and obligations in a fraction of the time.",
  primaryAction: { label: "Review your contract with AI", href: "/contract-risk" },
  secondaryAction: { label: "Compare contract versions", href: "/redline" },
  sections: [
    {
      title: "How contracts are structured",
      description:
        "Understanding the standard architecture of a commercial contract tells you where to look for what. Most contracts follow a recognizable structure even when they look different on the surface.",
      items: [
        {
          title: "Recitals and background (the preamble)",
          description:
            "Contracts typically open with recitals — 'whereas' clauses that state the background and purpose of the agreement. Recitals are usually not operative: they describe context but don't create obligations. They can matter for interpreting ambiguous operative clauses (a court may look to recitals to understand intent), but they're not where the binding obligations are. Read them quickly for context; don't spend time analyzing them as if they contain the substantive terms.",
        },
        {
          title: "Definitions section: the most important section to read first",
          description:
            "The definitions section — often found in Section 1 or near the beginning — defines the capitalized terms used throughout the contract. Every capitalized term ('Confidential Information,' 'Material Breach,' 'Services,' 'Intellectual Property') means exactly what the definition says, not what those words mean in ordinary English. A deliberately narrow or broad definition in Section 1 changes the meaning of every provision that uses that term. Read the definitions first, before reading the operative clauses. When you encounter a capitalized term in the body of the contract, you already know what it means.",
        },
        {
          title: "Operative provisions: the heart of the contract",
          description:
            "The operative provisions — services, deliverables, payment, term, performance obligations — are the core of what each party agrees to do. These are usually the longest section and describe the substance of the deal. Read these in the context of the definitions you've already read. Pay attention to what's mandatory ('shall'), what's permissive ('may'), what's conditional ('subject to,' 'provided that,' 'unless'), and what's limited by scope or time. Conditions, qualifications, and exceptions are often embedded in operative clauses rather than separated into their own provisions.",
        },
        {
          title: "Representations and warranties",
          description:
            "A representation is a statement of current fact ('the licensor owns the intellectual property'). A warranty is a promise about future state or performance ('the software will perform as described in the documentation'). Breaching a representation or warranty can trigger specific remedies — indemnification, termination, damages. In contracts that include both, the distinction matters legally. In many commercial contracts, the terms are used together ('represents and warrants') without meaningful distinction. Read which party is making which representations and whether there are materiality qualifiers ('to the best of the party's knowledge').",
        },
        {
          title: "Indemnification, limitation of liability, and dispute resolution",
          description:
            "These three provisions — typically toward the end of the contract — define what happens when something goes wrong. Indemnification specifies who covers costs (legal fees, damages, settlements) arising from defined events. Limitation of liability caps what either party can recover. Dispute resolution specifies how conflicts are resolved (arbitration vs. litigation, which jurisdiction, which law applies). These sections often appear as boilerplate toward the back of the contract, which is why many readers never get to them — but they define the contract's risk profile as much as the operative provisions do.",
        },
      ],
    },
    {
      title: "How defined terms control meaning throughout",
      description:
        "The definitions section is the single highest-leverage place to spend time in a contract review. A carefully constructed definition can dramatically expand or narrow a party's obligations in ways that aren't obvious from reading the operative clauses alone.",
      items: [
        {
          title: "Overbroad definitions that expand obligations beyond what seems intended",
          description:
            "An NDA that defines 'Confidential Information' as 'any information disclosed by the Disclosing Party in connection with this Agreement, whether oral, written, or electronic, regardless of whether marked confidential' creates obligations around essentially everything said or written in the business relationship. Compare this to a definition that specifies 'written information marked Confidential at the time of disclosure' — the operative non-disclosure clause is identical in both NDAs, but the definitions create completely different scopes. The operative clause ('shall not disclose Confidential Information') reads the same; what changes is everything.",
        },
        {
          title: "Narrow definitions that limit what you receive",
          description:
            "Service agreements sometimes define 'Services' narrowly in the definitions section — a specific list of deliverables — while the commercial discussions that led to the contract created broader expectations. An IT services contract where 'Services' is defined as 'the implementation services described in Exhibit A only' limits the provider's obligations to exactly what's in Exhibit A, regardless of what was discussed in sales meetings. If Exhibit A doesn't include something you expected, the Services definition determines what you're owed.",
        },
        {
          title: "Material Adverse Effect and similar defined thresholds",
          description:
            "In M&A agreements, credit agreements, and complex commercial contracts, defined terms like 'Material Adverse Effect,' 'Material Breach,' or 'Force Majeure Event' are threshold conditions that trigger rights and obligations. The definition of 'Material Adverse Effect' in an acquisition agreement might explicitly exclude pandemic effects, regulatory changes, or industry-wide trends — events that laypeople would consider materially adverse. Whether an event crosses the threshold depends entirely on what the definition includes and excludes, not on whether it feels material in ordinary English.",
        },
        {
          title: "Cross-references that incorporate other documents",
          description:
            "Definitions sometimes incorporate other documents by reference: 'Applicable Laws means all laws, regulations, and guidelines applicable to the Services as set forth in Schedule C.' Reading the contract without Schedule C means you don't know what law applies. Contracts that incorporate purchase orders, statements of work, service level agreements, or acceptable use policies by reference are contracts where those incorporated documents are part of what you're signing. Track down every incorporated document before signing.",
        },
      ],
    },
    {
      title: "The language patterns that carry the most risk",
      description:
        "Certain sentence structures and word patterns in contracts signal provisions that create significant obligations or limit your rights. Learning to recognize them speeds up contract review.",
      items: [
        {
          title: "'Shall' versus 'may' versus 'will'",
          description:
            "In contract drafting, 'shall' typically creates a mandatory obligation — 'the Vendor shall deliver the report by the fifteenth of each month' is a binding commitment. 'May' creates a permission or option — 'the Client may terminate this agreement with 30 days notice' is a right, not an obligation. 'Will' is sometimes used interchangeably with 'shall' (modern drafting often prefers 'will' for clarity), but be alert to contracts where these terms are used inconsistently, which creates ambiguity about whether a provision is mandatory or permissive. If you see 'Vendor shall maintain insurance' and 'Client may request proof of insurance,' those are different standards.",
        },
        {
          title: "'Subject to,' 'provided that,' and embedded conditions",
          description:
            "Conditional language qualifies obligations: 'the Provider shall respond within 24 hours, subject to the limitations set forth in Section 8.3' or 'provided that Client has paid all undisputed invoices' or 'unless otherwise agreed in writing.' These qualifiers are easy to read past when scanning, but they convert what looks like a clear obligation into a conditioned one. When you see these phrases, find the condition. Section 8.3 might contain extensive carve-outs that gut the 24-hour commitment.",
        },
        {
          title: "Unlimited indemnification obligations",
          description:
            "Indemnification clauses that require a party to 'indemnify, defend, and hold harmless' the other party against 'any and all claims, damages, losses, costs, and expenses, including attorney's fees, arising out of or related to' something create very broad obligations. The key variables are: what triggers the obligation (a specific breach, or any claim 'related to' the agreement); who controls the defense (the indemnifying party, giving them authority over your legal strategy); and whether indemnification is mutual or one-sided. One-sided unlimited indemnification triggers covering the other party's own negligence is the most aggressive form.",
        },
        {
          title: "'Notwithstanding anything to the contrary'",
          description:
            "This phrase introduces a provision that overrides everything else in the contract. 'Notwithstanding anything to the contrary herein, Vendor's total liability shall not exceed $500' means the liability cap applies regardless of any other provision — including any representation, warranty, or obligation that might otherwise support a larger claim. Find every instance of 'notwithstanding' in a contract and read what follows carefully. These provisions are structurally dominant; they override negotiated terms that appear elsewhere.",
        },
        {
          title: "Automatic renewal and deemed-consent provisions",
          description:
            "Automatic renewal clauses ('this Agreement shall automatically renew for successive one-year terms unless either party provides written notice of non-renewal at least 90 days prior to the expiration of the then-current term') and deemed-consent provisions ('Client's failure to object within 30 days constitutes acceptance') create obligations through inaction. These are some of the most consequential provisions in long-term commercial relationships — and among the easiest to miss because they're triggered by not doing something rather than by doing something.",
        },
      ],
    },
    {
      title: "Sections to read with extra care",
      description:
        "Given limited review time, certain sections of a contract warrant deeper attention than others — not because the rest doesn't matter, but because specific sections consistently produce the most real-world consequences.",
      items: [
        {
          title: "The limitation of liability section",
          description:
            "The limitation of liability section caps what either party can recover in a dispute. This is often where a contract's apparent risk allocation diverges from the economic reality. A services contract with a $1M annual value may cap the provider's total liability at $50,000 — one month's fees — while excluding all consequential damages. Understanding what the cap is, what's excluded from it (fraud, intentional misconduct are typically carve-outs), and which party it applies to (often asymmetric) tells you the realistic recovery available if the relationship goes badly wrong.",
        },
        {
          title: "The termination section: rights, triggers, and consequences",
          description:
            "The termination section specifies: who can terminate (either party, or only one), under what circumstances (for cause, for convenience, or both), what notice is required, what obligations survive termination, and what happens to IP, data, and outstanding payment obligations when the contract ends. Termination-for-cause provisions often require a 'cure period' — a defined window for the breaching party to fix a breach before termination becomes effective. 'Material breach' triggers are only as good as how 'material' is defined, and that's usually in Section 1.",
        },
        {
          title: "The dispute resolution and governing law provisions",
          description:
            "The dispute resolution section specifies where, how, and under what law disputes are resolved. Three elements: governing law (which state's or country's contract law applies — can be different from where you operate); venue (where litigation or arbitration must take place — can create significant practical burdens); and method (court litigation vs. mandatory arbitration, including whether class actions are waived). For contracts governing significant commercial relationships, these provisions are often more consequential in practice than the substantive obligations, because they determine the cost and difficulty of enforcing or defending your rights.",
        },
        {
          title: "Attachments, exhibits, and incorporated documents",
          description:
            "Many commercial contracts are frameworks that incorporate separately attached documents: statements of work, service level agreements, pricing schedules, acceptable use policies, data processing agreements, and similar exhibits. The main contract often says 'Vendor will provide the Services as described in Statement of Work No. 1, attached hereto as Exhibit A.' Exhibit A is part of the contract — it's where the actual deliverables, timelines, and performance standards are specified. Never sign a contract without reading all attachments and exhibits; the main contract may be shorter and simpler precisely because the substantive detail is in the exhibits.",
        },
      ],
    },
    {
      title: "A practical approach to reading any contract",
      description:
        "Applied to any new contract, this sequence produces a useful understanding faster than linear reading.",
      items: [
        {
          title: "Step 1: Get the map before reading the territory",
          description:
            "Skim the table of contents or section headings to understand the contract's structure. How many sections are there? Where is the definitions section? Where is the liability section? Where are the exhibits? This takes two minutes and prevents reading the wrong section in depth while missing what matters. If there's no table of contents, skim section headings throughout.",
        },
        {
          title: "Step 2: Read the definitions in full",
          description:
            "Read every defined term before reading the operative sections. Pay particular attention to: what's defined broadly (the definition creates wide obligations), what's defined narrowly (the definition limits what you receive or protects), and which terms import other documents or external standards by reference. Flag any definitions that seem unusual or that deviate from plain English.",
        },
        {
          title: "Step 3: Read the limitation of liability, indemnification, and termination sections",
          description:
            "Before reading the operative obligations, understand the consequence structure. What's the liability cap? What triggers indemnification and in which direction? How does the contract end? Reading the back of the contract early frames the operative provisions correctly: you read each obligation knowing what happens if it's breached.",
        },
        {
          title: "Step 4: Read the operative provisions with your definitions in hand",
          description:
            "Now read the core obligations — services, payment, performance standards, IP — substituting your understanding of the defined terms as you go. For each obligation, ask: what exactly triggers it, what exactly satisfies it, and what are the consequences of non-performance? Flag conditional language, qualifications, and cross-references to other sections for follow-up.",
        },
        {
          title: "Step 5: Read every exhibit and attachment",
          description:
            "Don't sign until you've read every exhibit, schedule, statement of work, and attachment referenced in the main contract. The operative clauses commit you to what's in the exhibits; if you haven't read them, you don't know what you've agreed to. If an exhibit is labeled 'to be mutually agreed' and isn't attached, understand that you're signing the main contract without knowing what will go in that exhibit.",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "Where should I start when reading a contract?",
      answer:
        "Start with the definitions section, not page one. Defined terms — shown with capital letters throughout the contract — mean exactly what the definitions section says they mean, not what those words mean in ordinary usage. A contract where 'Confidential Information' is defined to include everything creates completely different obligations than one where it's defined narrowly, even if the operative non-disclosure clause reads identically. After definitions, read the liability, indemnification, and termination sections before the operative obligations. Understanding the consequence structure first helps you interpret the obligations correctly.",
    },
    {
      question: "What's the difference between a representation and a warranty in a contract?",
      answer:
        "A representation is a statement of present fact ('the company owns the intellectual property described herein'). A warranty is a promise about future performance or continued truth ('the software will function as described in the documentation for 12 months after delivery'). Breaching a representation can void the contract or trigger indemnification; breaching a warranty typically triggers specific remedy provisions. In practice, most commercial contracts use 'represents and warrants' together without meaningful legal distinction. In M&A and complex transactions, the distinction becomes important for determining remedies.",
    },
    {
      question: "What does 'indemnify and hold harmless' mean?",
      answer:
        "An indemnification clause makes one party responsible for covering certain costs (legal fees, damages, settlements) incurred by the other party in connection with defined events. 'Hold harmless' means the indemnifying party agrees the other won't be responsible for those costs. In practice, the two phrases are often used together and treated as a single obligation. The critical variables in any indemnification provision: what triggers it (a specific breach, or anything 'arising out of or related to' the agreement), who controls the defense (the indemnifying party's control over defense strategy is significant), and whether there are caps or carve-outs on the obligation.",
    },
    {
      question: "Why do contracts say 'notwithstanding anything to the contrary'?",
      answer:
        "'Notwithstanding anything to the contrary' introduces a provision that overrides all other contract terms. It's drafting shorthand for 'this provision controls regardless of what anything else in the contract says.' When you see this phrase, pay close attention to what follows — it's a provision designed to win any conflict with other contract terms. Common uses: liability caps that apply regardless of the nature of the breach, termination rights that operate regardless of other dispute resolution provisions, or indemnification carve-outs that apply regardless of limitation-of-liability language.",
    },
    {
      question: "Do I need a lawyer to review every contract?",
      answer:
        "Not every contract warrants legal review, but significant agreements often do. Factors that argue for legal review: the contract is long-term or difficult to exit; the financial exposure is large; the contract involves IP ownership; there are provisions you don't understand after careful reading; the other party is an experienced commercial counterparty with sophisticated legal drafting; or the contract contains unusual or aggressive provisions. For routine agreements (standard vendor terms, straightforward service agreements), legal review adds cost without proportionate value. For employment agreements, significant commercial contracts, real property leases, and M&A documents, legal review is standard practice.",
    },
    {
      question: "How can AI help with reading and reviewing a contract?",
      answer:
        "AI-assisted contract review reads the agreement and flags provisions that match patterns associated with risk or unusual drafting — overbroad definitions, one-sided indemnification, aggressive limitation-of-liability provisions, automatic renewal clauses, mandatory arbitration with class action waivers, and similar features. The output highlights flagged provisions with the actual contract language and explains why each is notable in plain language. This is useful for identifying which sections of a long agreement warrant focused attention, and for generating specific questions to ask the counterparty or legal counsel before signing. AI review identifies and explains what's in the contract; for significant transactions, a lawyer who knows your jurisdiction and circumstances interprets what it means for you specifically.",
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
      name: "How to Read a Contract: A Systematic Approach Before You Sign",
      description:
        "How contracts are structured, why definitions determine meaning throughout, which language patterns signal high-risk provisions, and a practical reading sequence for any agreement.",
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
        { "@type": "ListItem", position: 2, name: "How to Read a Contract", item: url },
      ],
    },
  ],
  readingLinks: [
    {
      label: "Lease agreement red flags",
      href: "/lease-agreement-red-flags/",
      description: "The provisions in residential and commercial leases that most commonly cause problems: holdover penalties, repair allocation, early termination exposure, and automatic renewals.",
    },
    {
      label: "Employment contract red flags",
      href: "/employment-contract-red-flags/",
      description: "What to look for in an offer letter or employment agreement before accepting: non-compete scope, IP assignment breadth, at-will exceptions, and equity documentation.",
    },
    {
      label: "NDA provisions to review",
      href: "/nda-what-to-look-for/",
      description: "Non-disclosure agreements appear standard but vary significantly: one-way vs. mutual scope, definition of confidential information, residuals clauses, and indefinite term provisions.",
    },
    {
      label: "Vendor contract red flags",
      href: "/vendor-contract-red-flags/",
      description: "Supplier and vendor agreements often have unfavorable indemnification, unilateral pricing change rights, and IP ownership terms that require attention before signing.",
    },
  ],
};

export default function HowToReadAContractPage() {
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
