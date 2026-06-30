import type { Metadata } from "next";
import { SaasInfoPage } from "@/components/SaasInfoPage";
import { siteUrl } from "@/lib/i18n";

// Standalone English-first GEO content page targeting employees and
// job-seekers reviewing employment contracts before signing.
// Links to /contract-risk/ (AI contract analysis, server-side AI)
// and /ai-workspace/ (multi-document review).
// AI tool claims: contract text is sent to an AI model for analysis.
// NOT in routeSlugs. Wired into standaloneContentRoutes + lib/standalone-routes.ts.

const url = `${siteUrl}/employment-contract-red-flags/`;

export const metadata: Metadata = {
  title: "Employment Contract Red Flags: What to Look For Before Signing",
  description:
    "Employment contracts contain clauses on competition restrictions, IP ownership, arbitration, and termination that can affect your career for years. This guide covers the clauses most likely to create problems and what to ask before you sign.",
  keywords: [
    "employment contract red flags",
    "red flags in employment contract",
    "what to look for in employment contract",
    "non-compete clause review",
    "employment contract ip clause",
    "at-will employment contract",
    "mandatory arbitration employment",
    "before signing employment contract",
  ],
  alternates: { canonical: "/employment-contract-red-flags/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Employment Contract Red Flags: What to Look For Before Signing",
    description:
      "Non-competes, IP assignment clauses, arbitration requirements, and termination terms that can constrain your career — and what to evaluate before you sign.",
    url,
    siteName: "DockDocs",
    type: "article",
  },
};

const page = {
  slug: "faq" as const,
  title: "Employment Contract Red Flags: What to Look For Before Signing",
  description:
    "The employment contract clauses most likely to affect your career after you leave, what makes them risky, and how to evaluate an offer before signing.",
  eyebrow: "Employment & Career Guide",
  heroTitle: "Employment contract red flags: what to look for before signing",
  heroDescription:
    "An employment contract covers more than salary and start date. The clauses on competition restrictions, intellectual property ownership, dispute resolution, and termination define what you can do after you leave — sometimes for years. Most candidates review salary, title, and benefits and skim everything else. The clauses buried in section 8 of a standard offer letter are where the long-term constraints live. Understanding what those clauses look like before you sign is the most important thing you can do with an employment contract.",
  primaryAction: { label: "Review your contract with AI", href: "/contract-risk" },
  secondaryAction: { label: "Analyze multiple documents", href: "/ai-workspace" },
  sections: [
    {
      title: "Non-compete and non-solicitation red flags",
      description:
        "Post-employment restrictions limit what you can do after you leave — which competitors you can join, which clients you can work with, which colleagues you can hire. These clauses are among the most consequential in any employment contract.",
      items: [
        {
          title: "Non-competes with broad geographic or industry scope",
          description:
            "A non-compete that prohibits you from working for 'any competitor' in 'any country' for two years is effectively a prohibition on working in your field. Reasonable non-competes are narrow: specific job roles, defined competitors, geographic areas where the employer actually operates. A clause that covers your entire industry or profession, or that isn't limited to a geography where your employer has real business, is a signal to negotiate or push back. Enforceability varies significantly by jurisdiction — California, Minnesota, and several other states have banned or severely restricted non-competes, while others enforce them broadly.",
        },
        {
          title: "Non-solicitation of clients you've never worked with",
          description:
            "Non-solicitation clauses typically prohibit you from working with the company's clients for a period after leaving. A reasonable scope: clients you personally worked with. An overbroad scope: any client of the company anywhere, including clients in divisions you've never touched. The latter is particularly burdensome in large companies where the 'client list' spans thousands of accounts globally.",
        },
        {
          title: "Non-solicitation of employees that extends indefinitely",
          description:
            "Many contracts prohibit recruiting former colleagues after leaving. A one-year restriction on actively soliciting colleagues you worked closely with is common and generally reasonable. A restriction that extends to all employees of the company globally, with no time limit, is not standard and can significantly limit your ability to build a team in your next role.",
        },
        {
          title: "Garden leave provisions that restrict while paying",
          description:
            "Some contracts, particularly in financial services, include 'garden leave' clauses that keep you employed (and paid) during your notice period but prohibit you from working elsewhere. If the garden leave period is long (six months to a year), this effectively operates as a paid but coercive restriction — you're bound to the company even after your exit is agreed.",
        },
      ],
    },
    {
      title: "Intellectual property assignment red flags",
      description:
        "IP assignment clauses determine who owns what you create. In their broadest forms, they can transfer ownership of work you do outside company time and unrelated to your job.",
      items: [
        {
          title: "Assignment of inventions created outside work hours",
          description:
            "Standard IP assignment clauses transfer ownership of inventions created using company resources, company information, or related to the company's business to the employer. Overbroad clauses go further: they assign ownership of 'any invention or work' created during the employment period, regardless of whether company resources were used or whether the invention relates to the company's business. If you have side projects, freelance work, or a startup, an overbroad IP assignment can transfer ownership of that work to your employer without you realizing it. Several states (California, Delaware, Minnesota, and others) limit IP assignment to company-related work — but the clause is often drafted to the maximum scope regardless.",
        },
        {
          title: "Definitions of 'company business' that are too wide",
          description:
            "IP assignment clauses often define the company's business broadly — sometimes so broadly that work you do in an adjacent field falls within it. A software company that defines its business as 'any technology product or service' is effectively claiming ownership of anything technology-related you create outside work. Check how the company's business is defined in the IP clause and whether that definition is narrower than what the company actually does.",
        },
        {
          title: "Pre-invention assignment that covers work before you joined",
          description:
            "Some IP clauses are retroactive, purporting to assign inventions or work created before the employment start date. If you have existing IP — a side project, a patent application, or a product — that you want to retain, you typically need to disclose and explicitly exclude it in a schedule attached to the contract. Check whether the contract requires you to list prior inventions and whether you've done so completely.",
        },
        {
          title: "Work-for-hire language that covers all output",
          description:
            "Work-for-hire provisions (under US copyright law) vest copyright ownership in the employer for work created in the scope of employment. When these provisions are drafted without limits, they can cover creative work done on personal time if it could be characterized as related to the employer's business. This is particularly relevant for writers, designers, developers, and creative professionals who produce work outside their job that could theoretically relate to their employer's products.",
        },
      ],
    },
    {
      title: "Compensation and bonus red flags",
      description:
        "Salary is typically clear in an offer letter. The terms around bonuses, equity, and variable compensation are where the financial exposure often lies.",
      items: [
        {
          title: "Discretionary bonus language with no defined criteria",
          description:
            "A bonus described as 'discretionary' with no defined performance criteria, no defined payment schedule, and no defined amount leaves the employer with complete flexibility to pay nothing and be contractually compliant. If a bonus is a significant part of your expected compensation, the contract should specify at minimum: the target amount or percentage, the performance criteria for earning it, and the timing of payment. 'Discretionary' without these elements means the bonus is not a contractual entitlement.",
        },
        {
          title: "Bonus clawback provisions with long lookback periods",
          description:
            "Some contracts include clawback provisions that require returning bonuses already paid if you leave within a defined period. A one-year clawback on a signing bonus is common and generally reasonable. Multi-year clawbacks on performance bonuses that have already vested, or clawbacks triggered by factors outside your control, are more problematic. Check the clawback period, what triggers it, and whether it's proportional (a full clawback if you leave in month one vs. a partial clawback if you leave in month 11).",
        },
        {
          title: "Equity terms that vest only on specific conditions",
          description:
            "Equity compensation (stock options, RSUs) is often a significant part of total compensation, particularly in startups and technology companies. Key terms to evaluate: vesting schedule and cliff, what happens to unvested equity if the company is acquired (acceleration, or termination of the unvested shares), and what happens to unvested equity if you're terminated without cause. A four-year vest with a one-year cliff is standard; a cliff that extends beyond one year is less common. Acquisition-related provisions vary widely and can result in unvested equity being canceled in acquisition scenarios.",
        },
      ],
    },
    {
      title: "Termination and at-will red flags",
      description:
        "The conditions under which employment ends, and what you're entitled to when it does, define your security and your exit options.",
      items: [
        {
          title: "At-will employment with no severance",
          description:
            "At-will employment means either party can terminate the relationship at any time without cause. This is the default in most US states and is standard in many employment contracts. By itself, at-will is not unusual. The red flag is an at-will employment clause combined with no severance provision, while the employer retains significant restrictive covenants (non-competes, IP assignments) that limit what you can do next. You have no protection against termination, but the constraints after termination remain fully effective.",
        },
        {
          title: "Cause definitions that give the employer broad discretion",
          description:
            "Contracts that include severance or other protections contingent on termination 'without cause' define 'cause' in a clause. An overly broad definition — including subjective standards like 'failure to meet performance expectations' or 'conduct that the company deems inappropriate' — effectively converts a protected termination into an at-will one, since the employer can characterize almost any departure as 'for cause.' Narrow cause definitions (fraud, criminal conviction, gross negligence) provide more meaningful protection.",
        },
        {
          title: "Required notice periods that are asymmetric",
          description:
            "Some contracts require you to give 30, 60, or 90 days notice before leaving, while permitting the employer to terminate immediately (or with minimal notice). Asymmetric notice requirements restrict your flexibility to accept other offers without a gap, while giving you no corresponding security. If you're required to give extended notice, the contract should either provide a matching notice period from the employer or specify severance in lieu of notice.",
        },
      ],
    },
    {
      title: "Dispute resolution and arbitration red flags",
      description:
        "Mandatory arbitration clauses require that employment disputes be resolved through private arbitration rather than in court. This significantly changes the dispute resolution process in ways that typically favor employers.",
      items: [
        {
          title: "Mandatory arbitration for all employment claims",
          description:
            "A mandatory arbitration clause waives your right to bring employment claims — wrongful termination, discrimination, wage claims — to a court or jury. Arbitration is private, typically less discovery-intensive, and statistically produces lower awards for plaintiffs than juries. The clause may also prohibit class actions, preventing employees from joining collective suits. Before signing, check whether the clause covers all claims or only some, who selects the arbitrator, and who pays the arbitration costs.",
        },
        {
          title: "Confidentiality requirements on disputes and outcomes",
          description:
            "Some arbitration clauses require that disputes and their outcomes remain confidential — you cannot discuss the existence or result of a claim. This prevents employees from learning that others have brought similar claims against the same employer, and can prevent you from alerting others to patterns of conduct even after your dispute is resolved.",
        },
        {
          title: "Choice-of-law clauses that override state employment protections",
          description:
            "Employment contracts often specify which state's law governs disputes. A company headquartered in California but specifying Delaware or another state's law may be attempting to apply that state's employment law — which might be less protective — to an employee who actually works in California. Courts sometimes apply the law of the employee's work state regardless of the contract clause, but this is not universal and adds uncertainty to any dispute.",
        },
      ],
    },
    {
      title: "How to evaluate an employment contract before signing",
      description:
        "A structured review — looking for specific clause types rather than reading end-to-end hoping to spot problems — is more effective and faster.",
      items: [
        {
          title: "Read the non-compete and non-solicitation sections first",
          description:
            "These have the longest tail: the restrictions apply after you leave, sometimes for years. Assess geographic scope, industry scope, duration, and whether they're limited to the role and clients you'll actually work with. If these clauses are overbroad, this is the most important thing to negotiate before signing.",
        },
        {
          title: "Read the IP assignment clause and list your prior inventions",
          description:
            "Understand what the clause assigns and whether the company's business definition is narrow enough to exclude work you do on your own time. If the contract includes a prior invention schedule, complete it fully — listing any side projects, pending applications, or existing products you want to retain. An incomplete prior invention disclosure can create ambiguity about ownership.",
        },
        {
          title: "Check the bonus and equity terms specifically",
          description:
            "For any compensation described as 'target,' 'bonus,' or 'discretionary,' verify what performance criteria attach to it and whether it's a contractual commitment or a possibility. For equity, understand the vesting schedule, the cliff, and what happens at acquisition.",
        },
        {
          title: "Look for the arbitration clause and understand what it waives",
          description:
            "Search for 'arbitration,' 'dispute resolution,' and 'JAMS' or 'AAA' (major arbitration services). If a mandatory arbitration clause is present, understand whether it covers discrimination claims (EEOC claims are excluded in some clauses post-Ending Forced Arbitration of Sexual Assault Act), who selects the arbitrator, and whether class actions are prohibited.",
        },
        {
          title: "Ask for any verbal commitments in writing",
          description:
            "If a recruiter or hiring manager has made verbal promises — role expansion, promotion timelines, future equity grants, remote work flexibility — these need to be in the contract or in a signed addendum. Verbal representations made during hiring are generally not enforceable after signing, and hiring managers who made them may no longer be at the company when you try to rely on them.",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "What are the most common red flags in an employment contract?",
      answer:
        "The most consequential clauses are: non-competes (check scope, geography, and duration), IP assignment (check whether it covers outside work and prior inventions), arbitration (check whether it covers all claims and prohibits class actions), bonus terms (check whether the bonus is discretionary or tied to defined criteria), and termination terms (check whether at-will employment is combined with significant post-employment restrictions and no severance). These are the clauses most likely to create problems during or after the employment relationship.",
    },
    {
      question: "Are non-compete clauses enforceable?",
      answer:
        "Enforceability depends significantly on jurisdiction. California, Minnesota, North Dakota, and Oklahoma effectively ban most non-competes. Other states enforce them to varying degrees, typically requiring that the restriction be reasonable in scope, geography, and duration; protect a legitimate business interest; and not impose undue hardship on the employee. Even in states where non-competes are enforceable, courts often narrow overbroad clauses rather than voiding them entirely. The FTC proposed a rule banning most non-competes nationally, though this has faced legal challenges. The practical answer: consult an employment attorney in your state before relying on unenforceability as a defense — it's jurisdiction-specific and litigation-dependent.",
    },
    {
      question: "Can my employer own work I do on my own time?",
      answer:
        "In some jurisdictions and with broadly drafted IP assignment clauses, yes — if the work relates to the company's business or was created using company resources. California, Delaware, Minnesota, North Carolina, and Washington have statutes limiting employer IP ownership to work done using company resources or related to the company's current or anticipated business. In other states, a broadly drafted IP assignment clause may transfer ownership of personal-time work if it falls within the company's business definition. If you have side projects you want to protect, review the IP clause carefully, list prior inventions on any required schedule, and consider consulting an attorney before signing.",
    },
    {
      question: "What does mandatory arbitration mean for my rights?",
      answer:
        "Mandatory arbitration requires that employment disputes be resolved in private arbitration rather than through the court system. This generally means: no jury, limited discovery, a single arbitrator (often from a pool associated with the arbitration service), confidential proceedings and outcome, and typically no class actions. Studies show that employment arbitration produces lower awards for employees on average than jury verdicts. Some claims are excluded from mandatory arbitration by statute — sexual assault and harassment claims under the Ending Forced Arbitration of Sexual Assault and Sexual Harassment Act of 2022, and certain NLRA claims. Beyond these statutory exclusions, mandatory arbitration clauses are generally enforceable.",
    },
    {
      question: "Should I negotiate my employment contract?",
      answer:
        "Yes, particularly for the restrictive covenants (non-compete scope, IP assignment scope) and the terms that affect what happens if the relationship ends (severance, termination notice, clawback). Salary negotiations get most of the attention, but the post-employment restrictions are often more consequential over a career. Most employers will not rescind an offer because a candidate asked to narrow an overbroad non-compete or limit IP assignment to company-related work. An employment attorney can review a contract in a few hours and identify what's negotiable; the cost of that review is small relative to the constraints you're signing away.",
    },
    {
      question: "How can AI help review an employment contract?",
      answer:
        "AI-assisted contract review extracts and flags clauses that match patterns associated with risk — overbroad non-competes, expansive IP assignment, mandatory arbitration, clawback provisions, discretionary bonus language — and provides a plain-language explanation of what each flagged clause means. The result is a structured list of the clauses that warrant closer attention, with the relevant contract text quoted. This is useful for identifying which sections of a long contract need focused review, and for generating specific questions to ask the employer's HR team or legal counsel before signing. AI review is informational — it identifies what's there and explains the patterns, but for significant concerns, an employment attorney who practices in your jurisdiction is the appropriate resource.",
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
      name: "Employment Contract Red Flags: What to Look For Before Signing",
      description:
        "Non-competes, IP assignment clauses, arbitration requirements, bonus terms, and termination conditions in employment contracts that can constrain your career — and what to evaluate before signing.",
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
          name: "Employment Contract Red Flags",
          item: url,
        },
      ],
    },
  ],
};

export default function EmploymentContractRedFlagsPage() {
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
