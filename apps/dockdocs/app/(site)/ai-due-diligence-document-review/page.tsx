import type { Metadata } from "next";
import { SaasInfoPage } from "@/components/SaasInfoPage";
import { siteUrl } from "@/lib/i18n";

// Standalone English-first GEO content page targeting M&A / investment / deal
// due diligence queries. NOT in routeSlugs. Wired into standaloneContentRoutes
// and lib/standalone-routes.ts.
// Traceability claims are scoped ("when the AI can locate the passage") — never
// universal. Explicit that AI sends extracted text to the model (not zero-data).
// No "court-ready" or absolute accuracy language.

const url = `${siteUrl}/ai-due-diligence-document-review/`;

export const metadata: Metadata = {
  title: "AI Due Diligence Document Review: Read More, Miss Less (2026)",
  description:
    "Due diligence produces more documents than any team can read carefully. AI can surface the provisions and facts that warrant closer attention — and show you the exact text it's drawing on so you can verify what it found.",
  keywords: [
    "AI due diligence",
    "due diligence document review AI",
    "M&A document AI",
    "deal room AI",
    "investor due diligence AI",
    "AI legal due diligence",
  ],
  alternates: { canonical: "/ai-due-diligence-document-review/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "AI Due Diligence Document Review: Read More, Miss Less (2026)",
    description:
      "AI due diligence document review surfaces risky provisions and key facts across a large document set — and shows you the clause text behind each finding so you can verify it.",
    url,
    siteName: "DockDocs",
    type: "article",
  },
};

const page = {
  slug: "faq" as const,
  title: "AI Due Diligence Document Review: Read More, Miss Less (2026)",
  description:
    "What AI due diligence document review actually does, why source traceability matters in deal contexts, why sensitive deal documents can't go to a general AI chatbot, and what AI still leaves open.",
  eyebrow: "M&A & Deals",
  heroTitle: "AI due diligence document review: read more, miss less",
  heroDescription:
    "A typical M&A due diligence process produces hundreds of documents — contracts, financial statements, employment agreements, IP assignments, regulatory filings, permits, litigation records. No team reads all of them carefully. AI due diligence document review changes the economics: it can surface the provisions and facts that warrant attention across a full document set, so human review is concentrated where it matters most.",
  primaryAction: { label: "Try AI document review", href: "/contract-risk" },
  secondaryAction: { label: "AI contract review", href: "/ai-contract-review" },
  sections: [
    {
      title: "The volume problem in due diligence",
      description:
        "The purpose of due diligence is to find what you don't know before you commit to a deal. The challenge is that the information you need to find is distributed across a large document set — and the documents that contain the most important details aren't always obvious upfront.\n\nA supplier contract buried in exhibit 47 might have an uncapped liability provision that changes the risk profile of the deal. An employment agreement might assign IP rights in a way that affects what the business actually owns. A regulatory permit might have a change-of-control clause that triggers renegotiation on acquisition. These aren't hypothetical risks — they're the kinds of things that delay or restructure deals when found late, and that are missed entirely when documents aren't read carefully.\n\nThe practical constraint is time. Due diligence timelines are fixed, deal teams are finite, and the number of documents typically exceeds what can be read carefully within the available window. Something gets skimmed. AI changes what gets skimmed.",
    },
    {
      title: "What AI surfaces in due diligence documents",
      description:
        "AI due diligence review reads documents and identifies the provisions and facts most likely to be material to a deal — the things that create risk, obligation, or uncertainty the acquirer needs to understand.",
      items: [
        {
          title: "Change-of-control provisions",
          description:
            "Many commercial contracts, leases, licenses, and financing arrangements include change-of-control clauses that trigger consent requirements, termination rights, or renegotiation on acquisition. AI can scan a document set for these provisions and surface them for human review before close.",
        },
        {
          title: "Liability exposure and indemnification",
          description:
            "Uncapped liability provisions, one-sided indemnification obligations, and warranties that survived previous transaction close are diligence issues. AI can surface the liability cap structure and indemnification scope across a contract portfolio.",
        },
        {
          title: "IP ownership and encumbrances",
          description:
            "Who actually owns the IP that makes the business valuable? Employment agreements, contractor agreements, and historical assignments determine whether IP was created by employees (and thus owned by the company) or by contractors (where ownership depends on contract language). AI can flag the relevant provisions.",
        },
        {
          title: "Key commercial terms and customer concentration",
          description:
            "Revenue concentration risk, minimum purchase commitments, exclusivity obligations, and pricing terms across a customer or supplier portfolio are material to deal valuation. AI can extract and organize these terms across a document set faster than manual review.",
        },
        {
          title: "Employment and non-compete obligations",
          description:
            "Retention risk for key employees, non-compete restrictions that might affect the combined business, and employment agreements with unusual terms all factor into deal economics. AI can surface the relevant provisions across an employment agreement portfolio.",
        },
      ],
    },
    {
      title: "Why source traceability is non-negotiable in due diligence",
      description:
        "In a due diligence context, a finding that can't be verified back to the document it came from has limited value. A deal team acts on findings — adjusts pricing, requests reps and warranties, adds closing conditions, or walks away. The basis for those actions needs to be traceable to actual document language, not just an AI's characterization of it.\n\nWhen the AI can locate the relevant clause in a document and show you the exact text, you can verify the finding before acting on it. You can confirm that the AI read the clause correctly. You can read the surrounding context that might change the interpretation. You can cite the specific provision in negotiation.\n\nWhen the AI produces a finding without showing the supporting text — or when it can't locate one in your document — that's a signal to treat the finding as a lead for manual review, not a confirmed fact. The difference matters in deal contexts.",
    },
    {
      title: "Why due diligence documents can't go to a general AI chatbot",
      description:
        "General AI chatbots process what you give them and may use that content to improve future models, store it in conversation history accessible to other users with the same account, or transmit it to third-party inference providers. For due diligence documents, these properties create serious problems.",
      items: [
        {
          title: "NDA obligations",
          description:
            "Most M&A processes are governed by confidentiality agreements that restrict who can see deal documents and how they can be processed. Uploading documents covered by an NDA to a general-purpose chatbot may constitute a breach — the NDA likely doesn't authorize third-party AI processing as a permitted use.",
        },
        {
          title: "Material non-public information",
          description:
            "If a deal involves a public company, due diligence documents are likely to contain MNPI. Transmitting MNPI to a third-party service creates additional regulatory exposure beyond the NDA. General chatbot privacy policies aren't designed around securities law compliance.",
        },
        {
          title: "Deal confidentiality",
          description:
            "Even without formal NDA or securities law constraints, deal terms, valuations, and negotiating positions are commercially sensitive. Transmitting these to a service that logs conversations and uses them for model training creates a record that exists outside the deal team's control.",
        },
      ],
    },
    {
      title: "What AI still leaves open in due diligence",
      description:
        "AI due diligence review is a first-pass tool, not a complete diligence process. The gaps it leaves are predictable.",
      items: [
        {
          title: "Materiality judgment",
          description:
            "AI can flag a provision; it can't tell you whether that provision is material to this deal at this price with this counterparty. Materiality depends on business context, deal structure, and risk tolerance that the AI doesn't have. Human judgment is required to move from \"this provision exists\" to \"this provision matters enough to act on.\"",
        },
        {
          title: "Missing provisions",
          description:
            "AI is better at finding what's in documents than what's absent. A contract that's missing a standard IP assignment, that lacks a data protection clause, or that has no change-of-control provision at all may not trigger a finding. Negative diligence — confirming that standard provisions are present — requires a different approach.",
        },
        {
          title: "Cross-document dependencies",
          description:
            "A provision in one contract may interact with a provision in another in ways that create risk. An exclusivity obligation in a supplier agreement and a competing-products clause in a customer agreement might create a conflict that's invisible when documents are reviewed individually. AI document review helps with individual documents; identifying cross-document conflicts requires additional synthesis.",
        },
        {
          title: "Oral and undocumented arrangements",
          description:
            "Side letters, oral agreements, and undisclosed arrangements don't appear in the documents at all. AI can only review what's in the data room.",
        },
      ],
    },
    {
      title: "How DockDocs fits in a due diligence workflow",
      description:
        "DockDocs AI reads documents and flags the provisions most relevant to deal risk — change-of-control terms, liability exposure, IP structure, employment arrangements — and shows the relevant clause text alongside each finding when the AI can locate it in the document. The extracted text goes to the AI model; the original file stays in your browser session.",
      items: [
        {
          title: "Document-by-document review with clause-level findings",
          description:
            "For each document, AI surfaces the provisions that warrant attention and shows the exact clause text it's drawing on. You verify the reading before acting on the finding — the source is visible, not just summarized.",
        },
        {
          title: "Honest about uncertainty",
          description:
            "When the AI can't find a supporting passage in the document, it says so rather than producing a confident-sounding finding without a source. In due diligence, a transparent \"couldn't locate the specific provision\" is more useful than a fabricated citation.",
        },
        {
          title: "Text-based processing — file stays local",
          description:
            "DockDocs extracts the text from your document and sends that to the AI model. The original file isn't transmitted to DockDocs servers. For documents covered by NDA or subject to confidentiality constraints, this processing model reduces (though doesn't eliminate) the transmission footprint.",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "What is AI due diligence document review?",
      answer:
        "AI due diligence document review uses a language model to read deal documents and surface the provisions and facts most likely to be material to an acquisition or investment decision — change-of-control clauses, liability exposure, IP structure, key commercial terms. A useful AI due diligence tool shows you the clause text it's drawing on so you can verify the finding rather than just accepting the AI's characterization.",
    },
    {
      question: "Can I use ChatGPT for due diligence document review?",
      answer:
        "Most due diligence documents are covered by NDAs that restrict how the information can be processed and by whom. Uploading documents to a general chatbot service that logs conversations, may use inputs for model training, and processes data on third-party infrastructure likely violates the NDA's permitted-use restrictions. If the deal involves a public company, MNPI considerations add further constraints. Purpose-built tools with appropriate privacy policies and data processing terms are a better fit for due diligence.",
    },
    {
      question: "What types of documents does AI due diligence work best for?",
      answer:
        "Contracts with discrete, identifiable provisions work best: commercial agreements, employment contracts, IP assignments, lease agreements, and regulatory filings. Financial statements, technical documentation, and heavily formatted documents (spreadsheets, data room exhibits) are less well-suited to text-based AI analysis. The strongest fit is standard professional documents where key provisions are expressed in clause-form text.",
    },
    {
      question: "How does AI handle confidentiality for sensitive deal documents?",
      answer:
        "It depends on the tool's architecture. Tools that upload your file to a server expose deal documents to third-party infrastructure, which may violate NDA provisions governing permitted processors. Tools that extract text and process it through an AI model create a smaller but non-zero transmission footprint — the text reaches the AI provider, even if the original file doesn't leave your browser. For documents subject to strict confidentiality constraints, review the tool's privacy policy and data processing terms against the applicable NDA before use.",
    },
    {
      question: "What does AI still leave open in due diligence?",
      answer:
        "AI due diligence review leaves open: materiality judgment (whether a flagged provision actually matters to this deal), negative diligence (confirming that standard provisions are present, not just finding what's there), cross-document dependencies (how provisions in different contracts interact), and anything that isn't in the documents — oral agreements, side letters, undisclosed arrangements. It's a first-pass tool that changes where human attention is concentrated, not a replacement for human diligence.",
    },
  ],
  readingLinks: [
    {
      label: "Due diligence document checklist",
      href: "/due-diligence-checklist-what-to-review/",
      description: "What documents are typically reviewed in M&A and investment due diligence — corporate structure, contracts, IP, employment, and compliance.",
    },
    {
      label: "Employment contract red flags",
      href: "/employment-contract-red-flags/",
      description: "In people diligence, employment contracts reveal IP assignment scope, non-compete exposure, and key-person retention risks.",
    },
    {
      label: "NDA: what to look for",
      href: "/nda-what-to-look-for/",
      description: "Due diligence involves reviewing confidentiality agreements. What NDA provisions matter for a buyer: residuals clauses, definition scope, and permitted disclosures.",
    },
    {
      label: "How to share a PDF securely",
      href: "/how-to-share-a-pdf-securely/",
      description: "Due diligence document sharing: data room basics, password protection, and how to transmit sensitive deal documents without exposing them to unauthorized parties.",
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
      name: "AI Due Diligence Document Review: Read More, Miss Less (2026)",
      description:
        "What AI due diligence document review surfaces, why source traceability matters in deal contexts, why sensitive deal documents can't go to a general AI chatbot, and what AI still leaves open.",
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
        { "@type": "ListItem", position: 2, name: "AI Due Diligence Document Review", item: url },
      ],
    },
  ],
};

export default function AiDueDiligenceDocumentReviewPage() {
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
