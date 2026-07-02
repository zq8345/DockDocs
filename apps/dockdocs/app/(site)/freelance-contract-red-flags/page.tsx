import type { Metadata } from "next";
import { SaasInfoPage } from "@/components/SaasInfoPage";
import { siteUrl } from "@/lib/i18n";

// Standalone English-first GEO content page targeting freelancers,
// independent contractors, and consultants reviewing client contracts.
// Links to /contract-risk/ (AI contract analysis, server-side AI)
// and /ai-workspace/ (multi-document review).
// AI tool claims: contract text is sent to an AI model for analysis.
// NOT in routeSlugs. Wired into standaloneContentRoutes + lib/standalone-routes.ts.

const url = `${siteUrl}/freelance-contract-red-flags/`;

export const metadata: Metadata = {
  title: "Freelance Contract Red Flags: What to Look For Before Signing a Client Agreement",
  description:
    "Freelance contracts can leave you unpaid, hand your work to clients who haven't paid for it, or lock you into unlimited revisions with no exit. This guide covers the clauses most likely to create problems for independent contractors and consultants.",
  keywords: [
    "freelance contract red flags",
    "freelance contract review",
    "what to look for in freelance contract",
    "independent contractor agreement red flags",
    "freelance payment terms",
    "scope creep contract clause",
    "freelance IP ownership",
    "before signing freelance contract",
  ],
  alternates: { canonical: "/freelance-contract-red-flags/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Freelance Contract Red Flags: What to Look For Before Signing a Client Agreement",
    description:
      "Payment protections, IP ownership, scope limits, revision caps, and termination terms that every freelancer should check before signing a client agreement.",
    url,
    siteName: "DockDocs",
    type: "article",
  },
};

const page = {
  slug: "faq" as const,
  title: "Freelance Contract Red Flags: What to Look For Before Signing a Client Agreement",
  description:
    "The freelance and contractor contract clauses most likely to leave you unpaid, expose you to unlimited work, or transfer your IP before you've been compensated.",
  eyebrow: "Freelance & Independent Contractor Guide",
  heroTitle: "Freelance contract red flags: what to look for before signing",
  heroDescription:
    "A freelance contract defines who owns your work, when you get paid, how much additional work the client can request, and what happens if the engagement ends early. Most standard client agreements are drafted to protect the client's interests — payment terms that favor cash flow over prompt payment, IP assignment that transfers rights before payment, scope language that invites unlimited revisions, and cancellation clauses that minimize what the client owes you. Understanding what to look for before you sign protects the thing you're actually selling: your work, your time, and your right to be paid for both.",
  primaryAction: { label: "Review your contract with AI", href: "/contract-risk" },
  secondaryAction: { label: "Compare contract versions", href: "/redline" },
  sections: [
    {
      title: "Payment terms red flags",
      description:
        "Payment terms define when and how you get paid. For freelancers, these are the most consequential clauses in any contract — the ones most likely to leave you doing work you never get compensated for.",
      items: [
        {
          title: "Payment on net-60 or net-90 terms",
          description:
            "Net payment terms specify how many days after invoice submission the client has to pay. Net-30 is common in commercial contexts; net-60 and net-90 are extended terms more typical of large enterprises. For freelancers, a net-90 payment term means you could complete a project in January and receive payment in April. If you're working across multiple clients simultaneously, extended payment terms can create significant cash flow gaps. Check whether the net terms are negotiable and whether they apply to all payments or only final deliverable payments.",
        },
        {
          title: "No upfront deposit or milestone payments",
          description:
            "Contracts that require no upfront payment and defer all compensation to final delivery transfer all financial risk to the freelancer. If the client disappears, changes their mind, or disputes the deliverable at the end, you have no compensation for the work already done. Standard practice for project-based work: a deposit (20–50% of the total fee) before work begins, with milestone or progress payments for longer projects. A contract with no deposit and no milestones is a contract where the client has no financial stake in the project until you've already done all the work.",
        },
        {
          title: "Payment conditioned on client's subjective approval",
          description:
            "Contracts that make final payment contingent on the client's 'satisfaction' or 'approval' without objective completion criteria give the client unilateral power to withhold payment indefinitely. The appropriate trigger for final payment is delivery of the specified deliverables meeting the agreed specifications — not client satisfaction, which is subjective and can always be withheld. If approval is required, the contract should specify what approval means (a reasonable review period, specific objection requirements, and a deemed-approval if no objection is raised within the review period).",
        },
        {
          title: "Kill fees that are too low to be meaningful",
          description:
            "Kill fees compensate the freelancer if the client cancels the project after work has begun. A kill fee of 10–20% of the project value for mid-project cancellation doesn't compensate the time already invested if significant work was completed. The kill fee structure should escalate with the percentage of the project completed at cancellation — compensation near the full project value if the project is near completion. A flat kill fee regardless of completion stage leaves you with poor compensation for cancellations that happen after most of the work is done.",
        },
        {
          title: "No late payment remedies",
          description:
            "A contract that specifies payment terms but includes no consequence for late payment gives the client no financial incentive to pay on time. Standard provisions: interest on overdue invoices (commonly 1.5% per month), the right to suspend work until overdue invoices are paid, and the client's obligation to cover collection costs (including reasonable attorney's fees) if payment requires legal action. Without these, a client who ignores an invoice faces no contractual consequence beyond the damage to the relationship.",
        },
      ],
    },
    {
      title: "Intellectual property red flags",
      description:
        "IP assignment clauses determine who owns the work you create. As a freelancer, your creative output is your product — the IP terms in a contract determine whether you retain any rights to it, and under what conditions.",
      items: [
        {
          title: "IP transferred before payment is received",
          description:
            "Many client contracts include IP assignment clauses that transfer ownership of all work product to the client 'upon creation' or 'upon delivery' — before payment has been received. If the client doesn't pay, you've transferred ownership of work you never got paid for, and recovering it is a legal problem, not just a contract dispute. The more protective structure: IP transfers upon receipt of final payment. This gives you retained ownership as leverage if payment doesn't come, and it's a standard term that experienced clients accept.",
        },
        {
          title: "Assignment of work product not related to the engagement",
          description:
            "Overbroad IP assignment clauses sometimes capture work beyond the specific deliverables — 'all work product created by contractor during the term of this agreement' rather than 'all work product created specifically for Client under this agreement.' If you're working with multiple clients simultaneously, an overbroad clause could be read to assign work you created for another client, or creative work you developed independently during the same period.",
        },
        {
          title: "No license back for portfolio use",
          description:
            "Once you assign IP to a client, you typically have no right to show or describe that work without the client's permission. If the contract includes a full work-for-hire or IP assignment without a portfolio license, you may be unable to include the work in your portfolio, show it to prospective clients, or reference it publicly. Standard contracts include a portfolio license: the right to display and describe the work for self-promotional purposes, subject to the client's reasonable confidentiality requirements.",
        },
        {
          title: "Moral rights waivers for creative work",
          description:
            "Some contracts (particularly those dealing with creative, artistic, or authored works) include waivers of moral rights — your rights as the creator to be credited for the work and to object to distortions or modifications that harm your reputation. Moral rights waivers are common in work-for-hire contexts, but they're worth understanding: they may prevent you from objecting to significant modifications to your work after delivery, including modifications you would find professionally objectionable.",
        },
      ],
    },
    {
      title: "Scope and revisions red flags",
      description:
        "Scope creep — the expansion of project requirements beyond what was originally agreed — is the most common source of disputes in freelance engagements. Contract language that leaves scope undefined or revisions unlimited is the mechanism through which scope creep becomes contractually sanctioned unpaid work.",
      items: [
        {
          title: "No written scope of work attached to the contract",
          description:
            "A contract that describes the deliverables in general terms ('design work as requested,' 'writing services for the project') without a specific scope of work attached creates unlimited flexibility for the client to define what they're owed. Every project should have a specific written scope: deliverables with format, quantity, length, or other objective specifications; what's included and what's explicitly excluded; and the process for agreeing to additional work outside the scope. Without this, 'the project' means whatever the client thinks it means.",
        },
        {
          title: "Unlimited revisions",
          description:
            "A revision clause with no limit on the number of rounds — 'revisions until the client is satisfied' or 'the contractor will revise the deliverables as reasonably requested' — effectively commits you to unlimited additional work at no additional charge. Standard contracts specify a defined number of revision rounds (two or three is common for creative work), with additional revisions billed at an agreed hourly or per-round rate. The revision count should specify what constitutes a revision (minor changes within a deliverable, not fundamental scope changes).",
        },
        {
          title: "Scope change requests addressed verbally rather than in writing",
          description:
            "Some clients prefer to communicate scope changes verbally — in meetings, phone calls, or informal messages — and then include that additional work in their definition of what was agreed. A contract that doesn't require written change orders for scope changes allows verbal requests to expand your obligations without creating documentation of the additional work or agreement on additional compensation. Every scope change — any work not covered in the original scope of work — should require a written change order signed by both parties before the additional work begins.",
        },
        {
          title: "Acceptance criteria that defer to client judgment",
          description:
            "A deliverable accepted when 'the client is satisfied' creates an open-ended loop. The client can request revisions, mark them as not satisfying the standard, and continue requesting changes indefinitely without triggering the payment milestone or requiring a change order. Define acceptance criteria specifically: delivery of the specified deliverables in the agreed format, with a defined review period and a deemed-acceptance mechanism if the client doesn't provide written objection within the review window.",
        },
      ],
    },
    {
      title: "Non-compete and non-solicitation red flags",
      description:
        "Client agreements sometimes include post-engagement restrictions on who you can work with and what you can work on. As a freelancer, these restrictions directly affect your ability to earn.",
      items: [
        {
          title: "Non-competes that restrict your industry",
          description:
            "A non-compete clause in a freelance contract that prohibits you from working with the client's competitors for a period after the engagement ends directly limits your market. As a freelancer, working across multiple clients in the same industry is often the point — and a non-compete that covers your industry effectively restricts your ability to work in your field. Enforceability depends on jurisdiction (California effectively bans non-competes for any worker; other states vary), but a clause you don't know is there is a clause you won't contest.",
        },
        {
          title: "Non-solicitation of the client's employees or clients",
          description:
            "Freelance contracts sometimes prohibit you from working directly with employees or clients of the company you're contracting with, even after the engagement ends. A non-solicitation clause that's broad enough to prevent you from independently connecting with someone you met through the engagement — even years later — restricts your professional network in ways that go beyond protecting legitimate business interests.",
        },
        {
          title: "Exclusivity requirements during the engagement",
          description:
            "Some client contracts include exclusivity clauses requiring you to work only for that client during the engagement term. For a full-time employment arrangement, this may be appropriate — but for a freelance engagement where you're an independent contractor, exclusivity eliminates your ability to take other work and typically needs to be compensated at or near a full-time equivalent rate to make economic sense. An exclusivity requirement buried in a contract at a project rate is a significant hidden constraint.",
        },
      ],
    },
    {
      title: "Termination and cancellation red flags",
      description:
        "Termination clauses determine what happens when the engagement ends early — whether the client cancels, you withdraw, or the project concludes unexpectedly.",
      items: [
        {
          title: "Client can terminate for any reason with minimal notice",
          description:
            "A termination-for-convenience clause that allows the client to cancel the project on 24 or 48 hours' notice, with compensation only for work completed to date at a time-and-materials rate, can leave you significantly undercompensated for blocked time, preparation, and opportunity costs. A reasonable termination clause provides: enough notice to transition the work (one to two weeks is common), compensation for work completed, and either a kill fee or compensation for the scheduled time you were holding for the project.",
        },
        {
          title: "No compensation for work in progress at cancellation",
          description:
            "Some contracts compensate only for formally delivered and accepted work at cancellation — not for work in progress. If you're halfway through a deliverable when the client cancels, 'work completed to date' interpreted narrowly means nothing if no deliverable has been formally submitted. Specify that work in progress is compensated at a pro-rata rate based on the percentage of the deliverable completed, not just on formally submitted deliverables.",
        },
        {
          title: "Client retains IP rights even if they cancel without paying",
          description:
            "If IP transfers on creation or delivery rather than on payment, and the contract permits the client to cancel without paying the full project fee, the client may end up with both your work and a reduced obligation. Combined with a kill fee that's lower than the work's value, this structure lets clients use your work without paying for it. Ensure the IP transfer is conditioned on receipt of full payment, and that the kill fee structure accounts for the work's value, not just the calendar time spent.",
        },
      ],
    },
    {
      title: "What to check before signing a freelance contract",
      description:
        "A systematic review of a client agreement takes 20–30 minutes and should happen before every new engagement, not just for large projects.",
      items: [
        {
          title: "Check the payment structure first",
          description:
            "Is there a deposit? What are the milestone payment triggers? What's the net payment term on each invoice? What happens if payment is late? If the answers are: no deposit, payment on delivery only, net-60, and no late payment consequence — you're taking on substantial financial risk. These are negotiating points.",
        },
        {
          title: "Find the IP assignment clause and check when it triggers",
          description:
            "Search for 'intellectual property,' 'work product,' 'work for hire,' and 'assignment.' Check whether the assignment happens on creation, delivery, or final payment. If it happens before final payment, request that the trigger be changed to receipt of full payment.",
        },
        {
          title: "Read the scope of work and revision provisions",
          description:
            "Is the scope specific or general? Is there a revision limit? Is there a change-order requirement for work outside the scope? If the scope is vague and revisions are unlimited, the contract commits you to however much work the client decides is included.",
        },
        {
          title: "Check the termination and kill fee structure",
          description:
            "What happens if the client cancels? What's the notice period? Is there a kill fee, and does it escalate with completion percentage? Is work in progress compensated? And critically — does the client retain IP rights if they cancel without paying?",
        },
        {
          title: "Look for any non-compete or exclusivity language",
          description:
            "Search for 'compete,' 'exclusivity,' 'non-solicitation,' and 'restriction.' Any restriction on your ability to work with others — during or after the engagement — is worth understanding before you sign, particularly if it limits your primary market.",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "What are the most common red flags in a freelance contract?",
      answer:
        "The most consequential clauses are: no upfront deposit (all financial risk is yours until delivery), IP transfer before payment (you lose ownership before getting paid), unlimited revisions (no limit on free additional work), vague scope of work (the client defines what was agreed), kill fees that don't escalate with completion percentage (poor protection against late-project cancellations), and payment conditioned on subjective client approval rather than objective deliverable specifications. These six areas cover the majority of freelance contract disputes.",
    },
    {
      question: "Should a freelance contract transfer IP before payment?",
      answer:
        "No. IP should transfer upon receipt of final payment, not upon creation or delivery. Transferring IP before payment means you've given away ownership of your work before the client has completed their obligation. If they don't pay, you've lost both the money and the rights. The protective structure — IP transfers on final payment — is standard in well-negotiated freelance agreements and acceptable to clients who intend to pay. If a client objects to this structure, that's informative.",
    },
    {
      question: "How many revision rounds should a freelance contract allow?",
      answer:
        "For most creative work, two to three rounds of revisions is standard. One round is tight but acceptable for well-specified projects. Unlimited revisions are not appropriate for fixed-price work — they convert a fixed-price engagement into an open-ended time commitment. The revision count should also specify what constitutes a 'revision' (minor changes within the deliverable spec) versus a scope change (new requirements that require a change order). If the client has never worked with a revision-limited contract, explain that additional rounds beyond the included number are billed at your standard hourly rate — most clients understand this.",
    },
    {
      question: "Are non-compete clauses in freelance contracts enforceable?",
      answer:
        "It depends on the jurisdiction and the scope of the restriction. California effectively bans non-competes for workers in any category, including independent contractors. Other states enforce them to varying degrees, requiring reasonableness in scope, geography, and duration. As an independent contractor rather than an employee, non-compete enforceability arguments can be stronger in some states — the law around non-competes for independent contractors differs from employee non-competes. The practical question before signing: would this restriction meaningfully limit your ability to work if enforced? If yes, it's worth pushing back on before you sign, regardless of enforceability.",
    },
    {
      question: "What should a kill fee look like in a freelance contract?",
      answer:
        "A kill fee should compensate you for the work completed and the time blocked for the project. A structure that works: compensation for all work completed to date (including work in progress at a pro-rata rate), plus a cancellation fee that scales with how far into the project the cancellation occurs — lower if the client cancels before significant work begins, higher if the project is near completion. A flat kill fee of 10–20% of the project value regardless of completion stage undercompensates cancellations that happen after most of the work is done. Also check: does the client retain IP rights if they pay only the kill fee and not the full project amount?",
    },
    {
      question: "How can AI help review a freelance contract?",
      answer:
        "AI-assisted contract review reads a freelance agreement and flags provisions that commonly create problems for independent contractors: payment terms that favor the client, IP transfer before payment, unlimited revision language, vague scope definitions, low or flat kill fees, and non-compete or exclusivity provisions. The output highlights flagged clauses with the actual contract language and a plain-language explanation of what makes each clause notable. This is useful for quickly identifying what to push back on before negotiations and for understanding the risk profile of an agreement before you sign. AI review is informational — for high-value engagements or contracts with complex IP provisions, legal review by an attorney familiar with freelancer rights in your jurisdiction is worthwhile.",
    },
  ],
  readingLinks: [
    {
      label: "How to read a contract",
      href: "/how-to-read-a-contract/",
      description: "Understanding contract structure and language before you negotiate. How defined terms control the whole agreement and which sections to read first.",
    },
    {
      label: "Vendor contract red flags",
      href: "/vendor-contract-red-flags/",
      description: "If your freelance work is for a business client, their standard vendor agreement may apply. Additional red flags in commercial agreements beyond the standard freelancer provisions.",
    },
    {
      label: "NDA provisions to review",
      href: "/nda-what-to-look-for/",
      description: "Freelance clients often require NDAs alongside the engagement agreement. What to check in the confidentiality provisions before signing.",
    },
    {
      label: "Employment contract red flags",
      href: "/employment-contract-red-flags/",
      description: "Comparing freelance and employment terms helps clarify the tradeoffs. Employment agreements include non-competes, IP assignment, and equity provisions that differ from contractor terms.",
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
      name: "Freelance Contract Red Flags: What to Look For Before Signing a Client Agreement",
      description:
        "Payment protections, IP ownership timing, revision limits, scope definitions, kill fee structures, and non-compete clauses in freelance contracts — what to evaluate before signing.",
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
          name: "Freelance Contract Red Flags",
          item: url,
        },
      ],
    },
  ],
};

export default function FreelanceContractRedFlagsPage() {
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
