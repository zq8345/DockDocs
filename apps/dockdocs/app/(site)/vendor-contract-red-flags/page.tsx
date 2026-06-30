import type { Metadata } from "next";
import { SaasInfoPage } from "@/components/SaasInfoPage";
import { siteUrl } from "@/lib/i18n";

// Standalone English-first GEO content page targeting procurement teams
// and business owners reviewing vendor or supplier contracts.
// Links to /contract-risk/ (AI contract analysis, server-side AI)
// and /ai-workspace/ (multi-document comparison).
// AI tool claims: contract text is sent to an AI model for analysis.
// NOT in routeSlugs. Wired into standaloneContentRoutes + lib/standalone-routes.ts.

const url = `${siteUrl}/vendor-contract-red-flags/`;

export const metadata: Metadata = {
  title: "Vendor Contract Red Flags: What to Look For Before Signing a Supplier Agreement",
  description:
    "Vendor contracts contain clauses on auto-renewal, liability caps, SLA remedies, data handling, and termination that can lock your business in or leave you with no recourse when things go wrong. This guide covers the clauses most likely to create problems.",
  keywords: [
    "vendor contract red flags",
    "supplier contract review",
    "what to look for in vendor contract",
    "vendor agreement red flags",
    "SLA contract review",
    "vendor contract auto-renewal",
    "vendor liability clause",
    "before signing vendor contract",
  ],
  alternates: { canonical: "/vendor-contract-red-flags/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Vendor Contract Red Flags: What to Look For Before Signing a Supplier Agreement",
    description:
      "Auto-renewal traps, liability caps, SLA remedies that don't compensate real harm, data processing gaps, and exit terms that favor the vendor — and what to check before you sign.",
    url,
    siteName: "DockDocs",
    type: "article",
  },
};

const page = {
  slug: "faq" as const,
  title: "Vendor Contract Red Flags: What to Look For Before Signing a Supplier Agreement",
  description:
    "The vendor contract clauses most likely to create problems — financial exposure, operational lock-in, and inadequate remedies when things go wrong — and what to evaluate before signing.",
  eyebrow: "Procurement & Vendor Management Guide",
  heroTitle: "Vendor contract red flags: what to look for before signing",
  heroDescription:
    "Vendor and supplier contracts define what your business gets, what you pay, what happens when the vendor underperforms, and how difficult it is to leave. Most vendor agreements are drafted by the vendor's legal team, structured to limit the vendor's liability, extend the vendor's revenue, and make the relationship difficult to exit. The clauses that create problems — often buried in sections labeled 'Limitation of Liability,' 'Term and Renewal,' and 'Service Level Agreement' — are where the real commercial risk lives. Understanding what to look for before you sign is more useful than discovering these clauses after the contract is in effect.",
  primaryAction: { label: "Review your vendor contract with AI", href: "/contract-risk" },
  secondaryAction: { label: "Compare contract versions", href: "/redline" },
  sections: [
    {
      title: "Auto-renewal and term red flags",
      description:
        "How a contract ends — and what happens if you don't actively terminate it — defines your flexibility. Auto-renewal clauses are among the most consistently problematic vendor contract provisions.",
      items: [
        {
          title: "Auto-renewal with short or buried opt-out windows",
          description:
            "Many vendor contracts automatically renew for a full additional term (often 12 months) unless you provide written termination notice within a specified window — typically 30 to 90 days before the current term ends. A termination window that opens and closes before you've thought to look creates a situation where missing a single date locks you into another full year. Check the specific notice window, how notice must be delivered, and whether the contract requires the vendor to remind you before the window closes (most don't).",
        },
        {
          title: "Initial terms that lock in pricing before you've validated the relationship",
          description:
            "Some vendor contracts — particularly for software and managed services — require one- or two-year commitments upfront, before you've had a chance to validate the vendor's performance in your actual environment. A short pilot period followed by a multi-year commitment allows you to evaluate the relationship before the long-term lock-in. Initial terms longer than six to twelve months for unproven vendors warrant scrutiny.",
        },
        {
          title: "Price escalation at renewal without notice requirements",
          description:
            "Auto-renewal provisions often incorporate price escalation clauses that permit the vendor to increase pricing at renewal — sometimes significantly — without your affirmative agreement. A clause that permits price increases up to 'CPI plus X%' or 'at the vendor's discretion' with no cap and no advance notice requirement can result in significant cost increases without the opportunity to budget or renegotiate. Check what notice the vendor must provide before increasing prices and whether there's a cap.",
        },
        {
          title: "Multi-year terms without milestone-based exit rights",
          description:
            "Long-term contracts (two years or more) that don't include exit rights tied to performance milestones or service-level failures lock you into the relationship regardless of performance. A multi-year commitment without the ability to exit if the vendor fails to meet agreed standards transfers all execution risk to you. Look for whether the contract permits termination without penalty if the vendor fails to cure defined service deficiencies within a defined cure period.",
        },
      ],
    },
    {
      title: "Liability and indemnification red flags",
      description:
        "Liability caps and indemnification provisions determine what compensation is available when the vendor's failure causes you harm. Vendor-drafted contracts typically limit the vendor's exposure while expanding yours.",
      items: [
        {
          title: "Liability caps set at one month's fees",
          description:
            "The most common vendor liability cap limits the vendor's total liability to fees paid in the prior month (or sometimes 30 to 90 days). For a vendor whose failure could cause significant operational disruption — a payment processor, a cloud hosting provider, a critical software platform — a cap set at one month's fees may bear no relationship to the actual harm their failure could cause. Check what the cap is set at and whether it's proportionate to the potential harm of a service failure in your context.",
        },
        {
          title: "Exclusions of consequential and indirect damages",
          description:
            "Most vendor contracts exclude liability for consequential, indirect, special, and punitive damages. This is standard and generally accepted in commercial agreements. The problem arises when combined with an already-low direct-damage cap: if consequential damages are excluded and direct damages are capped at 30 days of fees, the vendor's financial exposure for a catastrophic failure may be negligible relative to the harm caused. The exclusion of indirect damages is often more commercially significant than the cap itself, particularly for service failures that cause lost business.",
        },
        {
          title: "Broad vendor indemnification from customer's own operations",
          description:
            "Some vendor contracts require the customer to indemnify the vendor against claims arising from the customer's use of the service — including, in some cases, claims arising from the vendor's failure to deliver. An indemnification clause that shifts liability back to the customer for situations that are within the vendor's control inverts the risk allocation and should be carefully reviewed.",
        },
        {
          title: "No carve-outs for fraud, gross negligence, or willful misconduct",
          description:
            "Standard exceptions to liability caps and damage exclusions include fraud, gross negligence, and willful misconduct by the vendor. If a vendor's liability cap and damage exclusions apply even to these situations — meaning there's no liability above a trivial cap even for deliberate misconduct — the contract provides no meaningful deterrent against the worst-case vendor behavior. Carve-outs for these categories are standard in well-negotiated agreements.",
        },
      ],
    },
    {
      title: "SLA and performance red flags",
      description:
        "Service level agreements define what level of performance the vendor commits to and what remedies you have when they miss those levels. Weak SLA structures provide commitments without meaningful consequences.",
      items: [
        {
          title: "SLA credits that don't compensate actual harm",
          description:
            "Most vendor SLAs provide credits — a percentage reduction in the next invoice — when uptime or performance targets are missed. A vendor with a 99.9% uptime SLA that provides a 5% credit for a full day of downtime may be paying you a few dollars while the downtime cost you far more in lost revenue, staff time, and customer impact. SLA credits are designed to acknowledge the failure, not compensate the harm. If reliable uptime or performance is critical, understand that SLA credits rarely cover actual business impact.",
        },
        {
          title: "Uptime calculations that exclude planned maintenance windows",
          description:
            "Vendor uptime calculations frequently exclude scheduled maintenance windows from the denominator — so the '99.9% uptime' guarantee doesn't count time when the vendor took the service down for maintenance. A vendor that schedules four hours of maintenance monthly and excludes it from the uptime calculation is providing less than the headline SLA suggests. Check how uptime is measured and what events are excluded from the calculation.",
        },
        {
          title: "SLA credit caps that limit your total recovery",
          description:
            "Many SLA provisions cap total credits in any given period at a fixed percentage of that period's fees — commonly 10% to 30%. If a vendor misses SLA targets repeatedly in the same month, you may still only recover up to the cap regardless of how many failures occurred. Check whether there's a cumulative credit cap and whether sustained underperformance triggers any additional remedies (escalation, termination right).",
        },
        {
          title: "No termination right for sustained SLA failure",
          description:
            "SLA credits address individual failures. A vendor who consistently misses SLA targets while providing credits may be in ongoing breach, but if the contract provides no termination right for sustained underperformance, you're stuck in the relationship as long as they're paying the credits. Look for whether the contract permits termination without penalty if the vendor fails to meet SLA targets for a defined number of consecutive periods.",
        },
      ],
    },
    {
      title: "Data, privacy, and security red flags",
      description:
        "Vendors who process your data or your customers' data on your behalf create legal and regulatory obligations. Contracts that don't address these obligations clearly can leave you with compliance exposure.",
      items: [
        {
          title: "No Data Processing Agreement for vendors handling personal data",
          description:
            "Under GDPR, CCPA, and similar privacy regulations, when you engage a vendor to process personal data on your behalf, the vendor is a 'data processor' and you must have a Data Processing Agreement (DPA) in place that specifies the data processing scope, security measures, data retention, and sub-processor disclosure requirements. Vendor contracts that don't include or reference a DPA — or that push back when you request one — create regulatory exposure. If your vendor touches personal data about EU residents or California consumers, a DPA is not optional.",
        },
        {
          title: "Vague or absent security obligations",
          description:
            "Vendor contracts that describe security obligations in marketing terms ('industry-leading security,' 'enterprise-grade protection') without specifying minimum standards are effectively unenforceable. Meaningful security provisions specify: the security frameworks or certifications the vendor maintains (SOC 2, ISO 27001, PCI-DSS), the frequency of penetration testing, the encryption standards for data at rest and in transit, and the process for reporting and remediating security incidents. Vague security language provides no contractual basis for remedies if the vendor's inadequate security leads to a breach.",
        },
        {
          title: "Broad vendor rights to use your data",
          description:
            "Some vendor contracts — particularly for software platforms — include provisions that grant the vendor rights to use your data for their own purposes: product improvement, model training, anonymized benchmarking, or industry reporting. These provisions are sometimes buried in the general terms and not prominently disclosed. If your data includes proprietary business information or personal data about your customers or employees, check whether the vendor has taken rights to use it beyond serving your specific account.",
        },
        {
          title: "No defined breach notification timeline",
          description:
            "If the vendor experiences a security incident that affects your data, you may have regulatory obligations to notify affected individuals within a defined timeframe (72 hours under GDPR, 'expedient' under most US state breach notification laws). To meet these obligations, you need the vendor to notify you promptly. Contracts that don't specify a breach notification timeline — or that give the vendor vague obligations to notify 'promptly' or 'without undue delay' without a defined number of days — create a gap between your regulatory obligations and what you can contractually require of the vendor.",
        },
      ],
    },
    {
      title: "Termination and exit red flags",
      description:
        "The conditions under which you can leave a vendor relationship — and what the transition looks like — define your operational flexibility and leverage.",
      items: [
        {
          title: "No termination for convenience during the initial term",
          description:
            "Contracts that don't permit termination without cause during the initial term lock you in regardless of what changes in your business. A vendor relationship that made sense at contract signing may become unnecessary, redundant, or unaffordable due to a business change that couldn't have been anticipated. A termination-for-convenience right (even one with a 30- to 90-day notice requirement and a modest termination fee) provides flexibility you won't regret having if circumstances change.",
        },
        {
          title: "Early termination penalties that equal the remaining contract value",
          description:
            "Some vendor contracts calculate early termination fees as the full remaining fees for the unexpired term — effectively requiring you to pay for service you won't receive if you leave. Whether this is enforceable as a liquidated damages clause depends on jurisdiction, but it functions as a significant exit barrier. A reasonable early termination fee represents the vendor's actual cost of losing the contract early (staff transition, lost margin on remaining term), not the full remaining revenue.",
        },
        {
          title: "No data portability or export provisions",
          description:
            "When you leave a vendor — particularly a SaaS platform — you need your data back in a usable format. Contracts that don't specify the format in which your data will be returned, the timeframe within which it will be provided, and whether there's an export fee can leave you with significant practical difficulty in transitioning. Check whether the contract includes specific data portability provisions and whether the export format is one you can actually ingest into an alternative system.",
        },
        {
          title: "Vendor termination rights that are broader than yours",
          description:
            "Some vendor contracts give the vendor the right to terminate the agreement with minimal notice for reasons including 'material change in business,' 'strategic decision,' or 'discontinuation of the product' — while binding you to the full term and early-termination penalties. If the vendor can exit freely while you're locked in, the contract's risk allocation significantly favors the vendor.",
        },
      ],
    },
    {
      title: "How to review a vendor contract before signing",
      description:
        "A systematic review of vendor contracts focuses on the provisions that most often create problems in practice, rather than reading every clause of a long agreement.",
      items: [
        {
          title: "Check the auto-renewal and notice provisions first",
          description:
            "Find the term and renewal section. Determine how long the initial term is, whether it auto-renews, what the opt-out window is, and how notice must be delivered. If the notice window is narrow, calendar it immediately when the contract is signed.",
        },
        {
          title: "Read the liability cap and damage exclusion together",
          description:
            "The liability cap and the consequential damage exclusion work together to define the vendor's maximum financial exposure. Consider both in the context of the actual harm a service failure in your specific situation could cause, not in the abstract.",
        },
        {
          title: "Check the SLA definitions and credit structure",
          description:
            "Understand how uptime is calculated, what's excluded, how credits are calculated and capped, and whether there's a termination right for sustained SLA failure. SLA credits are a floor, not a ceiling — but knowing what the floor is tells you what the contract actually delivers.",
        },
        {
          title: "Confirm data handling obligations match your regulatory requirements",
          description:
            "If the vendor touches personal data, confirm whether a DPA is required and whether the vendor provides one. Check the security provisions for specificity, the breach notification timeline, and any rights the vendor has taken to use your data beyond serving your account.",
        },
        {
          title: "Understand what exiting looks like before you enter",
          description:
            "Read the termination provisions before signing: termination for convenience availability, early termination fees, data portability provisions, and transition assistance obligations. Understanding the exit terms at signing prevents unpleasant surprises when the relationship ends.",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "What are the most common red flags in a vendor contract?",
      answer:
        "The most consistently problematic provisions are: auto-renewal with short opt-out windows (missing the window locks you in for another full term), liability caps set at one or two months of fees (rarely proportionate to actual harm from a service failure), SLA credits that don't trigger termination rights for sustained failure, vague security obligations without defined standards, no Data Processing Agreement for vendors handling personal data, and early termination fees equal to the remaining contract value. Financial and exit terms affect you most immediately; data and liability terms matter most when something goes wrong.",
    },
    {
      question: "Can I negotiate a vendor contract?",
      answer:
        "Yes, and it's standard practice to do so for the provisions that have the most commercial impact. Common negotiation targets: increasing the liability cap (at least to the prior 12 months of fees), adding a termination-for-convenience right, narrowing the SLA carve-outs for planned maintenance, adding a data portability provision, and inserting a DPA if one isn't provided. Vendor flexibility varies significantly with your commercial importance to them — a large contract gives you more leverage than a small one. For strategic vendor relationships, having legal counsel review and mark up the agreement before signing is standard practice.",
    },
    {
      question: "What is a reasonable liability cap in a vendor contract?",
      answer:
        "Market standard for commercial software and services contracts is typically the fees paid in the prior 12 months — though some vendors negotiate for shorter periods (3 or 6 months) and some customers push for longer or uncapped liability for specific categories (breach of confidentiality, IP infringement). What's 'reasonable' depends on the potential harm of a service failure in your context: a vendor whose failure could cause you millions in lost revenue should accept a higher cap than a vendor providing a low-stakes administrative tool. Always evaluate the cap against the actual harm scenario, not in the abstract.",
    },
    {
      question: "What is a Data Processing Agreement and when do I need one?",
      answer:
        "A Data Processing Agreement (DPA) is a contract required under GDPR (and similar privacy laws) when a vendor processes personal data on your behalf. It specifies what data the vendor processes, for what purpose, the security measures they maintain, how long they retain the data, and how sub-processors (vendors your vendor uses) are managed. You need a DPA when your vendor touches personal data about EU residents (GDPR), California consumers (CCPA), or residents of other jurisdictions with DPA requirements. Failing to have a DPA in place when required is itself a regulatory violation, separate from any actual data breach.",
    },
    {
      question: "What should I look for in a vendor SLA?",
      answer:
        "Check how uptime is calculated and what's excluded (planned maintenance, force majeure, customer-caused outages). Check how credits are calculated — a percentage of monthly fees, not of actual harm. Check whether credits are capped within a period, which limits your recovery from repeated failures. Check whether there's a termination right for sustained SLA failure — credits address individual failures; only a termination right addresses a vendor who consistently underperforms while paying the credits. For critical systems, the SLA's credit structure is rarely what protects you — exit rights are.",
    },
    {
      question: "How can AI help review a vendor contract?",
      answer:
        "AI-assisted contract review reads the agreement and flags provisions that match patterns associated with risk: narrow liability caps, overbroad damage exclusions, auto-renewal with short notice windows, SLA structures with credit caps but no termination rights, vague security obligations, and data use provisions that grant the vendor rights beyond serving your account. The output highlights which sections warrant attention, quotes the relevant language, and explains what makes each clause notable. This is useful for quickly identifying the negotiating priorities in a long agreement. AI review is informational — for contracts that will govern significant vendor relationships, legal review by counsel who knows your regulatory environment is the appropriate follow-on step.",
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
      name: "Vendor Contract Red Flags: What to Look For Before Signing a Supplier Agreement",
      description:
        "Auto-renewal traps, liability caps, SLA remedy gaps, data handling obligations, and exit terms in vendor contracts — and what to evaluate before signing.",
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
          name: "Vendor Contract Red Flags",
          item: url,
        },
      ],
    },
  ],
};

export default function VendorContractRedFlagsPage() {
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
