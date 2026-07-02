import type { Metadata } from "next";
import { SaasInfoPage } from "@/components/SaasInfoPage";
import { siteUrl } from "@/lib/i18n";

// Standalone English-first GEO content page targeting M&A, investment,
// and acquisition due diligence queries.
// Audience: founders preparing for fundraising/acquisition, investors
// conducting pre-close review, corporate development teams.
// Real content: what documents are actually requested, what reviewers
// look for in each category, common gaps that surface in diligence.
// Links to /ai-due-diligence-document-review/ (AI document analysis,
// server-side — text sent to AI model) and /ai-workspace/ (multi-document
// review, also server-side).
// Claims scoped: both tools described as sending document content to
// an AI model; output is informational, not legal or investment advice.
// NOT in routeSlugs. Wired into standaloneContentRoutes.

const url = `${siteUrl}/due-diligence-checklist-what-to-review/`;

export const metadata: Metadata = {
  title: "Due Diligence Document Checklist: What Investors and Acquirers Review",
  description:
    "What documents are requested in M&A and investment due diligence, what reviewers actually look for in each category, and the issues that most commonly surface and delay or kill deals.",
  keywords: [
    "due diligence checklist",
    "due diligence document review",
    "m&a due diligence documents",
    "what documents are needed for due diligence",
    "due diligence document list",
    "investment due diligence checklist",
    "acquisition due diligence",
    "due diligence what to review",
  ],
  alternates: { canonical: "/due-diligence-checklist-what-to-review/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Due Diligence Document Checklist: What Investors and Acquirers Review",
    description:
      "The documents requested in M&A and investment due diligence, what reviewers look for in each category, and the issues that most often surface.",
    url,
    siteName: "DockDocs",
    type: "article",
  },
};

const page = {
  slug: "faq" as const,
  title: "Due Diligence Document Checklist: What Investors and Acquirers Review",
  description:
    "What documents are actually requested in M&A and investment due diligence, organized by category — and what reviewers are looking for in each, not just what they ask you to produce.",
  eyebrow: "M&A and Investment Guide",
  heroTitle: "Due diligence document checklist",
  heroDescription:
    "Due diligence is a structured review process conducted by investors or acquirers before closing a transaction. Its purpose is to verify representations made about the target company, identify risks that affect the transaction price or structure, and surface issues that require resolution before closing. The document review is the central activity. Understanding what documents are requested — and more importantly, what reviewers are actually looking for in each category — helps founders and operators prepare effectively and anticipate the issues most likely to surface. This guide covers the standard document categories, what to produce in each, and the flags that commonly derail or delay deals.",
  primaryAction: { label: "Review due diligence documents with AI", href: "/ai-due-diligence-document-review" },
  secondaryAction: { label: "Analyze multiple documents with AI", href: "/ai-workspace" },
  sections: [
    {
      title: "Corporate and legal structure documents",
      description:
        "The corporate records category establishes the legal identity and authority structure of the target — who owns it, how it's governed, and whether the seller has the authority to complete the transaction.",
      items: [
        {
          title: "Formation documents and corporate records",
          description:
            "Certificate of incorporation, articles of organization, operating agreement, bylaws, and all amendments. Reviewers confirm that the entity is properly formed in the state of organization, that the governing documents match the company's actual governance practices, and that any amendments have been properly adopted and filed. Common issues: amendments adopted by board but not filed with the state; operating agreements that haven't been updated to reflect changes in ownership; bylaws that require shareholder approval for actions the company has been taking by board resolution only.",
        },
        {
          title: "Capitalization table and equity documentation",
          description:
            "The cap table showing all outstanding equity (common stock, preferred stock, options, warrants, convertible notes, SAFEs, and any other instruments that could convert to equity). Every security issued should have documentation: stock certificates or electronic records, option grant agreements specifying grant date, strike price, vesting schedule, and shares granted. Reviewers verify that the cap table is accurate and fully diluted — many disclosed cap tables omit unexercised options, unconverted notes, or warrants. They also check for equity issued without proper board authorization, options with missing grant documentation, or SAFEs with ambiguous valuation caps.",
        },
        {
          title: "Board and shareholder meeting records",
          description:
            "Minutes of all board meetings and shareholder meetings, including consents in lieu of meeting. These records document the decisions underlying every significant action the company has taken: equity issuances, major contracts, officer appointments, policy adoptions. Reviewers confirm that actions requiring board approval were properly authorized, that voting thresholds were met, and that the minutes are consistent with what actually happened. Missing minutes for periods of significant activity are a common issue, as is a mismatch between what minutes say was approved and what was actually done.",
        },
        {
          title: "Subsidiary structure and intercompany agreements",
          description:
            "If the company has subsidiaries, reviewers need the formation documents and cap table for each, plus any intercompany agreements (service agreements, IP licenses, management agreements). Issues: foreign subsidiaries with compliance obligations in their jurisdictions that haven't been maintained; intercompany transactions without arm's-length documentation (raises transfer pricing issues for tax purposes); subsidiaries that should have been dissolved but haven't been.",
        },
      ],
    },
    {
      title: "Financial documents",
      description:
        "Financial due diligence verifies that the company's financial statements accurately represent its financial position and that the business is performing as represented.",
      items: [
        {
          title: "Financial statements: audited vs. management accounts",
          description:
            "For later-stage companies and acquisitions above a threshold, acquirers typically require audited financial statements — income statement, balance sheet, and cash flow statement — for the past three years, prepared under GAAP. For earlier-stage transactions, management accounts are accepted. Reviewers look for revenue recognition practices (when revenue is recognized, whether it's consistent with the nature of the business), unusual accruals or one-time adjustments, any restatements or material weaknesses identified in prior audits, and whether financial performance matches the representations made in the deal process.",
        },
        {
          title: "Revenue and customer metrics",
          description:
            "For recurring revenue businesses: MRR/ARR breakdown, customer count, churn rates (both gross and net), average contract value, cohort retention, and revenue concentration. Reviewers are looking for: whether stated ARR is calculated consistently (some companies include non-recurring elements); whether the largest customers represent a concentration risk; whether churn metrics in the data room match what was represented in pitches; and whether growth trends are accelerating or decelerating. Common issue: ARR disclosed as contracted ARR vs. recognized ARR, with the difference explained by large but not-yet-live contracts.",
        },
        {
          title: "Outstanding obligations, debt, and off-balance-sheet items",
          description:
            "All debt instruments (term loans, lines of credit, convertible notes), leases, letters of credit, guarantees, and any off-balance-sheet obligations. The acquirer needs to know what obligations will survive the transaction or need to be repaid at closing. Issues: undisclosed debt (particularly informal loans from founders or related parties); equipment leases or office leases not reflected on the balance sheet; change-of-control provisions in debt agreements that require lender consent or trigger repayment at closing.",
        },
        {
          title: "Tax returns and outstanding tax obligations",
          description:
            "Federal and state tax returns for the past three to five years, plus any correspondence with taxing authorities, outstanding assessments, and tax sharing or indemnification agreements with former related parties. Reviewers check for: tax positions that are aggressive or uncertain; nexus — whether the company has sales tax or payroll tax obligations in states where it has employees or significant revenue but hasn't filed; R&D tax credit positions that haven't been substantiated; and whether convertible instruments have been properly handled for tax purposes.",
        },
      ],
    },
    {
      title: "Contracts and commercial agreements",
      description:
        "The contracts category covers all significant commitments the company has made — customer agreements, vendor contracts, partnership deals, and any arrangements that create ongoing obligations.",
      items: [
        {
          title: "Customer contracts and standard agreement templates",
          description:
            "All enterprise customer contracts and the standard form agreements used for smaller customers. Reviewers assess: revenue concentration (how dependent is revenue on a few customers); contract duration and renewal terms (are these month-to-month or multi-year commitments); pricing and discount structures; contractual limitations (service levels the company has committed to); and customer-favorable terms that might need to be modified post-acquisition. Key flag: change-of-control provisions in customer contracts — some enterprise agreements allow the customer to terminate if the company is acquired.",
        },
        {
          title: "Vendor and supplier agreements",
          description:
            "Material vendor contracts, cloud infrastructure agreements, software licenses, and any sole-source or critical vendor dependencies. Reviewers look for: critical dependencies where a vendor relationship disruption would affect product delivery; contracts with unfavorable terms that will continue post-acquisition; and again, change-of-control provisions that require renegotiation on acquisition. For software companies, the cloud infrastructure agreement (typically AWS, GCP, or Azure) and any significant third-party API dependencies are particularly scrutinized.",
        },
        {
          title: "Partnership and channel agreements",
          description:
            "Reseller agreements, distribution agreements, integration partnerships, and referral arrangements. Exclusivity provisions — where the company is restricted from entering certain markets or partnering with certain counterparties — are scrutinized because they may limit the acquirer's strategy. Revenue-sharing arrangements with partners need to be evaluated for their ongoing financial impact. White-label or OEM arrangements where the company's product is distributed under another brand create complexity around IP ownership and revenue attribution.",
        },
        {
          title: "Material contracts with unusual or restrictive terms",
          description:
            "Any contract that restricts the company's ability to operate in certain markets, raises prices, hire certain individuals, or enter certain business lines — including non-compete provisions in employment or acquisition agreements, most-favored-nation pricing commitments, exclusivity arrangements, and right-of-first-refusal provisions that give third parties priority on transactions. These provisions may survive the acquisition and constrain the acquirer's plans.",
        },
      ],
    },
    {
      title: "Intellectual property documents",
      description:
        "For technology companies, IP due diligence is often the most important category — confirming that the company owns what it represents as its core asset.",
      items: [
        {
          title: "IP assignment agreements from founders and employees",
          description:
            "The most critical IP document: the signed IP assignment agreement from each founder, establishing that the intellectual property they created was assigned to the company rather than retained personally. Early founders often create core IP before the company is properly formed or before signing a formal agreement. Reviewers specifically look for: IP assignment agreements from each founder covering work done before and after formation; any prior employer's potential claim to IP created while founders were employed elsewhere (most employment agreements include a broad IP assignment to the employer); and IP assignment clauses in current employee agreements (typically in the Confidential Information and Inventions Agreement or similar).",
        },
        {
          title: "Patent portfolio and applications",
          description:
            "For patent-heavy businesses: all issued patents, pending applications, licenses (both inbound and outbound), and any correspondence with the patent office or third parties about IP rights. Reviewers assess whether the patent portfolio actually covers the product's key functionality, whether any applications are likely to be granted, and whether any third-party patents might present infringement risk. For most software companies, patents play a supporting role; the more fundamental question is clean ownership of the codebase and trade secrets.",
        },
        {
          title: "Open-source usage and compliance",
          description:
            "A complete list of open-source libraries and components used in the product, with their licenses. For software acquirers, this review is increasingly standard. Reviewers check: whether any GPL-licensed components are used in a way that would require the company to release its proprietary code as open source (copyleft obligations); whether all open-source license requirements are being met (attribution, license notices); and whether any licenses were violated. Undisclosed open-source usage with copyleft provisions can create significant post-acquisition obligations.",
        },
        {
          title: "IP disputes, claims, and cease-and-desist history",
          description:
            "Any received or sent IP infringement notices, cease-and-desist letters, DMCA takedowns, trademark disputes, or claims of prior art. Unresolved IP disputes — particularly from well-resourced claimants — can affect valuation, require escrow, or become deal-breakers. Founders sometimes don't treat a one-time cease-and-desist letter as significant, but acquirers will want to understand the outcome and whether the underlying risk was resolved.",
        },
      ],
    },
    {
      title: "People and employment documents",
      description:
        "The people category covers the workforce that will continue operating the business post-transaction — their agreements, obligations, and any existing disputes.",
      items: [
        {
          title: "Employment agreements and compensation records",
          description:
            "Employment agreements for all officers and key employees, offer letters, consulting agreements, and compensation schedules. Reviewers look for: golden parachute or change-of-control acceleration provisions that create payouts at closing; severance obligations that survive a transaction; non-standard terms that complicate integration; and whether compensation is at market (underpaid key employees represent integration risk). For acquisitions specifically: acqui-hire provisions, retention packages, and the structure of equity treatment at closing.",
        },
        {
          title: "Non-compete and non-solicitation agreements",
          description:
            "Non-compete agreements signed by founders, executives, and key employees — and their enforceability in the applicable jurisdiction. California, for example, prohibits enforcement of non-competes for employees. Acquirers want confidence that key people can't immediately go work for a competitor or start a competing venture using knowledge acquired at the company. Gaps: non-compete agreements that are too narrow to cover the actual competitive landscape, or that expire before the deal closes.",
        },
        {
          title: "Benefits, option plans, and equity documentation",
          description:
            "The equity incentive plan (typically a stock option plan), the plan administration records, all option grant documentation, and any equity acceleration provisions. At closing, outstanding options typically must be addressed — cancelled, converted, or accelerated. The acquirer needs a complete picture of what needs to be paid out and to whom. Issues: missing grant documentation making it impossible to verify strike price or vesting; double-trigger acceleration provisions that require both a change of control and termination to trigger acceleration (preferred by acquirers) vs. single-trigger provisions (preferred by employees).",
        },
        {
          title: "Employment disputes and HR matters",
          description:
            "Any current or past employment-related claims, EEOC charges, wage and hour claims, discrimination complaints, and significant HR issues. Acquirers typically request representations about these in the purchase agreement, with indemnification for undisclosed matters. Unreported but pending claims surface during the review period and can require price adjustments, holdbacks, or in severe cases, deal renegotiation.",
        },
      ],
    },
    {
      title: "Legal, compliance, and regulatory documents",
      description:
        "The legal and compliance category identifies litigation risk and regulatory obligations that may affect the transaction or require ongoing management.",
      items: [
        {
          title: "Pending and threatened litigation",
          description:
            "A complete disclosure of all pending, threatened, and reasonably anticipated litigation — including customer disputes, contractor claims, regulatory actions, and IP matters. Acquirers assess: the magnitude of potential exposure; whether existing insurance covers the claims; and whether any matter creates regulatory or reputational risk that affects the transaction. The disclosure should include matters where no formal claim has been made but where the company is aware of a basis for a claim. Underestimating litigation risk and the completeness of disclosure is a common issue.",
        },
        {
          title: "Regulatory compliance and licenses",
          description:
            "Any industry-specific licenses, permits, or regulatory approvals required to operate — and whether they're current. For businesses in regulated sectors (financial services, healthcare, cannabis, education, food service), regulatory compliance is often a deal-specific deep-dive. For general businesses, the review covers business licenses, foreign qualification filings (if the company does business in states other than its state of formation), and any consent decrees or regulatory orders.",
        },
        {
          title: "Data privacy and security compliance",
          description:
            "GDPR, CCPA, and other applicable privacy compliance documentation: privacy policy, data processing agreements with vendors, records of processing activities, breach notification history, and any privacy complaints or regulatory inquiries. For companies that handle personal data of EU residents, documented GDPR compliance is increasingly required by acquirers — particularly whether proper DPAs are in place with processors and sub-processors and whether the company has a lawful basis for each processing activity. Acquirers are also reviewing security practices: SOC 2 reports, penetration test results, and incident history.",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "How long does due diligence typically take?",
      answer:
        "Timelines vary by transaction type and size. In venture capital: Series A and B rounds typically include a light diligence process of 2–6 weeks. Later-stage rounds and growth equity investments typically require 4–8 weeks. In M&A: strategic acquisitions and private equity buyouts typically run 4–12 weeks depending on company complexity and buyer sophistication. Public company acquisitions are longer. The diligence period is often the critical path for deal timeline: delays in document production, incomplete disclosures that require follow-up, or identified issues requiring resolution all extend the timeline. The seller controls the speed of diligence by how prepared they are when the process starts.",
    },
    {
      question: "What is a data room and how should it be organized?",
      answer:
        "A data room is a secure document repository where the target company provides access to diligence documents. Modern data rooms are virtual (VDRs) — secure web platforms with access controls, document watermarking, and Q&A functionality. Standard organization follows the diligence categories: Corporate, Financials, Contracts, IP, People, Legal/Regulatory, plus any deal-specific categories. Best practice: produce documents proactively rather than reactively; use clear file naming; include an index. Disorganized data rooms signal to buyers that operations may be equally disorganized — it creates friction and often leads to more, not fewer, follow-up requests.",
    },
    {
      question: "What documents do founders frequently forget to include?",
      answer:
        "The most common omissions: (1) Founder IP assignment agreements — particularly for work done before the company was formally incorporated; (2) complete option grant documentation — many companies issued options without proper documentation of terms; (3) board minutes for significant decisions — meetings may have happened but minutes were never finalized; (4) side letters or amendments to SAFE/convertible notes — terms are sometimes modified informally; (5) insurance policies and claims history; (6) government filings beyond Delaware incorporation — if the company has employees in other states, those states may require foreign qualification; (7) correspondence with accountants or auditors about accounting positions; (8) any contracts with founders or related parties that weren't at arm's length.",
    },
    {
      question: "What are the most common deal-killers found in due diligence?",
      answer:
        "Issues that most frequently affect deal outcomes: (1) IP ownership gaps — particularly missing founder IP assignments or prior employer IP claims; (2) undisclosed litigation or regulatory matters; (3) financial restatements or significant departures from GAAP; (4) cap table discrepancies — the fully diluted cap table doesn't match disclosed ownership; (5) customer or vendor change-of-control provisions that trigger at closing; (6) open-source copyleft obligations that affect proprietary code ownership; (7) key employee non-compete unenforceability in their jurisdiction; (8) material customer churn or concentration that wasn't disclosed. Most of these are survivable with preparation; many are deal-killers only because they surface unexpectedly late in the process.",
    },
    {
      question: "How does AI help with due diligence document review?",
      answer:
        "AI-assisted due diligence review reads documents and identifies specific provisions relevant to the diligence question — change-of-control provisions in contracts, IP assignment scope in employment agreements, indemnification obligations, liability limitations, and similar provisions that are important but time-consuming to locate manually across dozens of documents. The output includes the actual contract language with plain-language explanations of why each provision is relevant. For a document-intensive process, this significantly reduces the time to develop an initial view of which documents have issues requiring deeper review. AI identifies and explains specific provisions; the interpretation of their significance in the context of a specific transaction requires legal and financial advisors who understand the deal structure and risk tolerance.",
    },
    {
      question: "Should founders prepare a data room before starting a fundraising or sale process?",
      answer:
        "Yes, for anything beyond seed-stage. Starting a formal diligence process without a prepared data room substantially lengthens the timeline and increases founder stress. The process of preparing a data room often surfaces issues that need to be resolved — missing IP assignments, incomplete board minutes, undocumented option grants — before they're discovered by the counterparty and become negotiating problems. A pre-prepared, well-organized data room signals operational maturity. Minimum preparation for a Series B or later round: clean cap table with all documentation, executed agreements with all investors, complete employee and contractor IP assignment, up-to-date corporate records, and prior two years of financial statements.",
    },
  ],
  readingLinks: [
    {
      label: "Software license agreement red flags",
      href: "/software-license-agreement-red-flags/",
      description: "Due diligence includes reviewing vendor agreements. SaaS and software license red flags: data rights, post-termination access, change-of-control provisions, and audit rights.",
    },
    {
      label: "NDA provisions to review",
      href: "/nda-what-to-look-for/",
      description: "NDAs govern the diligence process itself and appear throughout a company's contract portfolio. What to check before signing and what reviewers look for in an NDA stack.",
    },
    {
      label: "Employment contract red flags",
      href: "/employment-contract-red-flags/",
      description: "Employment agreements are a central due diligence category. What reviewers look for: IP assignment completeness, non-compete enforceability, change-of-control provisions.",
    },
    {
      label: "How to share a PDF securely",
      href: "/how-to-share-a-pdf-securely/",
      description: "Due diligence requires sharing sensitive documents. Methods for secure document sharing: password protection, expiring access, and verifying document integrity.",
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
      name: "Due Diligence Document Checklist: What Investors and Acquirers Review",
      description:
        "What documents are requested in M&A and investment due diligence, what reviewers look for in each category, and the issues that most commonly surface and delay or kill deals.",
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
          name: "Due Diligence Document Checklist",
          item: url,
        },
      ],
    },
  ],
};

export default function DueDiligenceChecklistPage() {
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
