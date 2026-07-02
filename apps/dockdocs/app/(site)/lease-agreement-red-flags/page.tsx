import type { Metadata } from "next";
import { SaasInfoPage } from "@/components/SaasInfoPage";
import { siteUrl } from "@/lib/i18n";

// Standalone English-first GEO content page targeting renters, tenants, and
// property managers researching what to look for in a lease agreement.
// Educational long-form content; links to the /lease-redflag/ AI tool.
// AI tool (lease-redflag) sends extracted text to an AI model for analysis;
// the original PDF stays in the browser. Claims reflect this accurately.
// NOT in routeSlugs. Wired into standaloneContentRoutes + lib/standalone-routes.ts.

const url = `${siteUrl}/lease-agreement-red-flags/`;

export const metadata: Metadata = {
  title: "Lease Agreement Red Flags: What Tenants Should Watch For Before Signing",
  description:
    "Lease agreements contain clauses that can cost you thousands or leave you with no recourse. This guide covers the most common red flags — financial, maintenance, access, and exit terms — and what to ask your landlord before signing.",
  keywords: [
    "lease agreement red flags",
    "red flags in a lease",
    "what to look for in a lease agreement",
    "lease review checklist",
    "unfair lease clauses",
    "risky lease terms",
    "tenant lease review",
    "before signing a lease",
  ],
  alternates: { canonical: "/lease-agreement-red-flags/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Lease Agreement Red Flags: What Tenants Should Watch For Before Signing",
    description:
      "Common lease clauses that put tenants at a disadvantage — financial traps, maintenance gaps, unrestricted access rights, and exit term problems — and what to ask before you sign.",
    url,
    siteName: "DockDocs",
    type: "article",
  },
};

const page = {
  slug: "faq" as const,
  title: "Lease Agreement Red Flags: What Tenants Should Watch For Before Signing",
  description:
    "The lease clauses that most often create problems, what makes them risky, and how to evaluate a lease before committing.",
  eyebrow: "Tenant & Rental Guide",
  heroTitle: "Lease agreement red flags: what to look for before signing",
  heroDescription:
    "A lease is a legal contract that governs where you live and how much it costs — for a year or more. Most renters read it once, skim the price and dates, and sign. The clauses buried in the middle of a standard lease form are where disputes, unexpected costs, and difficult exits originate. Understanding what those clauses look like — before you sign — is the most valuable thing a tenant can do.",
  primaryAction: { label: "Review your lease with AI", href: "/lease-redflag" },
  secondaryAction: { label: "Review contracts for risk", href: "/contract-risk" },
  sections: [
    {
      title: "Financial red flags",
      description:
        "The financial terms in a lease go beyond rent. The clauses around fees, deposits, and charges are where the real financial exposure lives.",
      items: [
        {
          title: "Rent escalation clauses without a cap",
          description:
            "Some leases include automatic rent increases — at renewal or mid-lease — tied to the landlord's discretion or a broad index with no ceiling. A clause that allows rent to increase by 'any amount at the landlord's discretion' or by 'CPI plus X%' with no cap can result in increases larger than anticipated. Look for what triggers increases, how much notice is required, and whether there's a maximum percentage. A lease without these limits leaves the financial terms open-ended.",
        },
        {
          title: "Vague or uncapped late fees",
          description:
            "Late fees are often regulated — many jurisdictions cap them as a percentage of monthly rent or require a grace period before they can be charged. A lease that specifies fees higher than local limits, or that lacks a grace period, may contain terms that are unenforceable but still used as leverage. Check the specific dollar amount, whether a grace period is defined, and whether the fee compounds.",
        },
        {
          title: "Lease-break penalties disproportionate to the harm",
          description:
            "A lease that requires you to pay the remaining months' rent if you leave early — rather than covering only the landlord's actual re-letting costs — can be unenforceable as a liquidated damages clause in many jurisdictions, but defending this position requires legal proceedings. Look for whether the break fee is a fixed penalty or tied to 'reasonable re-letting costs.' The former is typically more tenant-unfavorable.",
        },
        {
          title: "Security deposit terms with no return timeline",
          description:
            "Most jurisdictions require landlords to return security deposits within a defined period (often 21–30 days) after lease end. A lease that omits this timeline, or that defines deductions broadly enough to cover normal wear and tear, may create deposit disputes. Check whether the lease defines what qualifies as a deductible damage (versus normal wear), and what the return timeline is.",
        },
        {
          title: "Responsibility for utilities or repairs that are typically landlord obligations",
          description:
            "Some leases transfer maintenance obligations — appliance repair, HVAC servicing, pest control, or plumbing maintenance — to the tenant. Whether this is enforceable depends on local landlord-tenant law. In many jurisdictions, habitability standards cannot be waived by contract. Look for which maintenance and repair obligations the lease places on the tenant rather than the landlord.",
        },
      ],
    },
    {
      title: "Maintenance and habitability red flags",
      description:
        "Maintenance terms define who is responsible for what, and what happens if things go wrong. Vague or asymmetric maintenance clauses are among the most common sources of tenant-landlord disputes.",
      items: [
        {
          title: "No defined response time for repairs",
          description:
            "A lease that says the landlord 'will address maintenance requests' without specifying a timeline gives the landlord no contractual obligation to act promptly. For non-emergency repairs this may be acceptable; for habitability issues (heat, plumbing, mold), an undefined timeline is a problem. Check whether the lease distinguishes between emergency and non-emergency repairs, and whether response times are specified for each.",
        },
        {
          title: "Tenant responsible for appliances the landlord provided",
          description:
            "If the lease includes appliances (refrigerator, dishwasher, HVAC) but makes the tenant responsible for their repair or replacement, the financial exposure from a failed appliance falls to the tenant — for equipment the tenant doesn't own. Look for which party is responsible for repairing and replacing provided appliances.",
        },
        {
          title: "As-is clauses for existing damage",
          description:
            "Some leases include clauses requiring the tenant to accept the property 'as-is' or waiving the landlord's obligation to address pre-existing damage before move-in. These clauses can be combined with deposit deduction rights to create a situation where the tenant is charged for damage that existed before they moved in. Document pre-existing damage thoroughly at move-in regardless of what the lease says.",
        },
        {
          title: "Broad tenant indemnification for landlord negligence",
          description:
            "Some leases include clauses requiring the tenant to indemnify (cover the costs of) the landlord against certain claims — sometimes including claims arising from the landlord's own negligence. Whether these clauses are enforceable depends on jurisdiction, but they can complicate insurance and liability situations. Look for indemnification language and what scope it covers.",
        },
      ],
    },
    {
      title: "Access and privacy red flags",
      description:
        "Landlords have the right to access the property — but that right is usually constrained by notice requirements. Lease clauses that expand access rights beyond local law, or that grant access without notice, are worth flagging.",
      items: [
        {
          title: "Entry without notice or with shorter notice than required by law",
          description:
            "Most jurisdictions require landlords to give advance notice before entering (typically 24–48 hours) except in genuine emergencies. A lease that allows entry with shorter notice, or that defines 'emergency' broadly enough to cover routine inspections, may grant access rights beyond what local law allows — though local law typically overrides a contract that provides less protection than the statutory minimum.",
        },
        {
          title: "Unrestricted inspection frequency",
          description:
            "A clause permitting inspections 'at any time' or 'as frequently as the landlord deems necessary' goes beyond what most landlords actually need and creates potential for harassment. Reasonable inspection frequency (quarterly or semi-annually, with notice) is standard. Clauses allowing unlimited, unannounced inspections are unusual and worth questioning.",
        },
        {
          title: "Broad subletting prohibitions that prevent all assignment",
          description:
            "Most leases restrict subletting — that's common and often reasonable. A clause that also prevents assignment of the lease (transferring it to another qualified tenant) or that requires landlord approval with no defined criteria for denying it may make exiting the lease harder than necessary. Look for what happens if your circumstances change and you need to transfer the lease.",
        },
      ],
    },
    {
      title: "Exit and termination red flags",
      description:
        "The conditions under which a lease ends — and what happens when it ends — define your flexibility. Leases with asymmetric termination rights or automatic renewal clauses can lock tenants in longer than expected.",
      items: [
        {
          title: "Automatic renewal with a short opt-out window",
          description:
            "Some leases automatically renew for another full term (typically 12 months) unless the tenant provides written notice to vacate within a specific window — often 30–90 days before the lease ends. A tenant who misses this window by even one day may find themselves bound to another full-year lease. Check what notice is required to prevent automatic renewal and when that window opens and closes.",
        },
        {
          title: "No-cause termination rights for the landlord only",
          description:
            "Some leases give the landlord the right to terminate with notice at any time, while binding the tenant for the full lease term. Depending on jurisdiction and housing type, this asymmetry may be partially addressed by local tenant protection laws — but a lease that explicitly creates this imbalance is worth noting before signing.",
        },
        {
          title: "Broad abandonment clauses",
          description:
            "Some leases define 'abandonment' broadly — triggering automatic termination and landlord possession if the tenant is absent for a defined period without notice. If you travel for work, take extended vacations, or have other reasons to be away from the unit, an abandonment clause with a short trigger (some leases specify as few as 5–7 days) could be problematic.",
        },
        {
          title: "Move-out requirements that are unusually burdensome",
          description:
            "Some leases require the tenant to restore the property to 'original condition' at move-out — which can be interpreted to require repainting, replacing carpets, or professional cleaning beyond what normal wear and tear would justify. Standard practice in most jurisdictions holds tenants responsible for damage beyond normal wear, not for the effects of ordinary living. Unusually broad restoration requirements can become the basis for large deposit deductions.",
        },
      ],
    },
    {
      title: "How to evaluate a lease before signing",
      description:
        "Working through a lease systematically — rather than reading it end-to-end and hoping to catch the problems — makes the review more effective.",
      items: [
        {
          title: "Check the financial terms first, specifically",
          description:
            "Rent amount and due date, late fee amount and grace period, security deposit amount and return conditions, and what utilities or maintenance costs the tenant is responsible for. These are the terms you'll interact with most often and that create the most financial exposure.",
        },
        {
          title: "Read the maintenance section carefully",
          description:
            "Who is responsible for what, what the response time for repairs is, and who is responsible for provided appliances. If the lease is vague about maintenance obligations, assume the landlord will interpret any ambiguity in their favor.",
        },
        {
          title: "Look specifically for automatic renewal language",
          description:
            "Search the lease for 'renewal,' 'auto-renew,' and 'notice to vacate.' If the lease auto-renews, calendar the opt-out window immediately upon signing — it's easy to miss a 60-day notice window that falls in the middle of the following year.",
        },
        {
          title: "Ask the landlord about anything that isn't in writing",
          description:
            "If the landlord has made verbal promises — about renovations, appliance replacements, or permission for pets or modifications — these need to be in the lease or in a signed addendum. Verbal commitments are generally not enforceable, and landlords change.",
        },
        {
          title: "Compare the terms to local landlord-tenant law",
          description:
            "Many jurisdictions have mandatory disclosure requirements, habitability standards, and tenant protections that override contrary lease terms. A lease may contain provisions that are technically unenforceable — but challenging them requires knowing they're unenforceable, which requires familiarity with local law. Legal aid organizations, tenant unions, and bar association referral services can provide local guidance.",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "What are the most common red flags in a lease agreement?",
      answer:
        "The most commonly problematic lease clauses fall into four categories: financial (uncapped rent escalation, vague late fees, large early-termination penalties, broad deposit deduction rights), maintenance (no defined repair timeline, tenant responsibility for landlord-provided appliances, as-is clauses), access (entry without required notice, unrestricted inspection rights), and exit (automatic renewal with short opt-out windows, asymmetric termination rights, overly broad abandonment clauses). The financial and exit terms are the ones that most often result in unexpected costs or difficulty leaving the unit.",
    },
    {
      question: "Is it normal for a lease to have clauses that favor the landlord?",
      answer:
        "Yes — most standard lease forms are drafted by or for landlords, and they tend to favor the landlord's interests. This doesn't mean every landlord-favorable clause is unreasonable or unenforceable. Some clauses are standard industry practice (late fee provisions, pet restrictions, subletting limitations). Others are unusual or potentially unenforceable under local law (entry without notice, indemnification of landlord negligence, restoration requirements that exceed normal wear-and-tear standards). Knowing which is which requires reviewing the specific terms against your jurisdiction's landlord-tenant law.",
    },
    {
      question: "Can a landlord enforce any clause they put in a lease?",
      answer:
        "No. Many jurisdictions have landlord-tenant laws that override specific types of lease clauses. Common examples: security deposit return timelines, habitability standards, notice requirements for entry, and minimum grace periods for late fees. A lease clause that contradicts a mandatory statutory provision is generally unenforceable — but 'generally unenforceable' and 'the landlord won't try to use it' are different things. Tenants who don't know a clause is unenforceable may comply with it anyway. Consulting a local tenant rights resource or attorney is the most reliable way to identify which clauses in your specific lease are unenforceable.",
    },
    {
      question: "How can AI help review a lease agreement?",
      answer:
        "AI-assisted lease review reads the document text and flags clauses that match patterns associated with risk — financial exposure, unusual landlord rights, maintenance gaps, exit term problems. The result is a structured list of flagged items, each quoted from the actual document text, with a plain-language explanation of why the clause is notable. This is useful for identifying which sections of a long lease document warrant closer attention, and for generating questions to ask the landlord before signing. AI review is informational — it's not legal advice, and for significant concerns, a local tenant attorney or tenant rights organization is the appropriate resource.",
    },
    {
      question: "What should I document at move-in to protect my security deposit?",
      answer:
        "Take timestamped photos of every room, closet, and surface at move-in — specifically documenting any pre-existing damage (stains, scuffs, scratches, dents, broken fixtures). Share these with the landlord in writing (email, with photos attached) and retain a copy. The documentation should be specific: not just 'there was damage' but 'the northeast corner of the living room wall has a 3-inch scuff at knee height.' This creates a baseline that makes it harder for a landlord to charge for pre-existing damage at move-out. Check whether your lease includes a move-in inspection checklist — if so, complete it in full and keep your copy.",
    },
    {
      question: "Can a landlord raise rent in the middle of a lease?",
      answer:
        "Generally no, for fixed-term leases — the rent amount is locked for the lease term unless the lease itself includes an escalation clause that permits mid-term increases. If the lease includes a rent escalation clause (whether tied to CPI, a fixed percentage, or the landlord's discretion), review it carefully: how much notice is required, what triggers the increase, and whether there's a cap. At renewal, in most jurisdictions without rent stabilization laws, the landlord can offer a new rent amount and the tenant can accept or decline.",
    },
  ],
  readingLinks: [
    {
      label: "How to read a contract",
      href: "/how-to-read-a-contract/",
      description: "A systematic approach to reading any contract: understanding structure, how defined terms control meaning, which sections to read first, and the language patterns that carry the most risk.",
    },
    {
      label: "Employment contract red flags",
      href: "/employment-contract-red-flags/",
      description: "Key provisions to review before signing an employment agreement: non-compete scope, IP assignment, at-will exceptions, equity documentation, and compensation structure.",
    },
    {
      label: "NDA provisions to review",
      href: "/nda-what-to-look-for/",
      description: "What to check before signing a non-disclosure agreement: one-way vs. mutual scope, definition breadth, residuals clauses, term length, and post-relationship obligations.",
    },
    {
      label: "How to share a PDF securely",
      href: "/how-to-share-a-pdf-securely/",
      description: "Methods for sharing sensitive lease documents: password protection, access controls, expiring links, and how to verify that shared documents haven't been altered.",
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
      name: "Lease Agreement Red Flags: What Tenants Should Watch For Before Signing",
      description:
        "Common lease clauses that create financial risk, maintenance problems, access issues, and exit difficulties for tenants — with guidance on what to look for before signing.",
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
        { "@type": "ListItem", position: 2, name: "Lease Agreement Red Flags", item: url },
      ],
    },
  ],
};

export default function LeaseAgreementRedFlagsPage() {
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
