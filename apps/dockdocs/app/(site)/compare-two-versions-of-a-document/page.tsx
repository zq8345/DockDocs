import type { Metadata } from "next";
import { SaasInfoPage } from "@/components/SaasInfoPage";
import { siteUrl } from "@/lib/i18n";

// Standalone English-first GEO content page targeting queries around
// comparing two versions of a document or contract.
// Links to the /redline/ tool (client-side PDF diffing via pdf-lib).
// Redline tool: PDF text extracted in browser, diff computed locally — no upload.
// NOT in routeSlugs. Wired into standaloneContentRoutes + lib/standalone-routes.ts.

const url = `${siteUrl}/compare-two-versions-of-a-document/`;

export const metadata: Metadata = {
  title: "How to Compare Two Versions of a Document — Spotting What Changed",
  description:
    "When a contract, policy, or agreement comes back with revisions, you need to find what changed. This guide covers manual comparison, tracked-changes review, and automated PDF redlining — and when to use each method.",
  keywords: [
    "compare two versions of a document",
    "how to compare document versions",
    "compare two versions of a contract",
    "document version comparison",
    "pdf redline comparison",
    "find changes between documents",
    "compare contract versions",
    "document diff tool",
  ],
  alternates: { canonical: "/compare-two-versions-of-a-document/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "How to Compare Two Versions of a Document — Spotting What Changed",
    description:
      "Methods for comparing document versions — manual review, tracked changes, and automated PDF redlining — with guidance on which approach fits which situation.",
    url,
    siteName: "DockDocs",
    type: "article",
  },
};

const page = {
  slug: "faq" as const,
  title: "How to Compare Two Versions of a Document — Spotting What Changed",
  description:
    "Methods for comparing document versions, how automated redlining works, and when each approach is the right one.",
  eyebrow: "Document Review & Contracts",
  heroTitle: "How to compare two versions of a document",
  heroDescription:
    "A counterparty returns a contract with their changes. A policy comes back revised after legal review. You receive a document you've seen before and need to know: what's different? The answer matters more than it sounds — a single changed clause in a contract can shift liability, alter payment terms, or create an exit right that wasn't there before. This guide covers the main methods for comparing document versions, what each one is good for, and how to choose the right one for the situation.",
  primaryAction: { label: "Compare two PDFs with redlining", href: "/redline" },
  secondaryAction: { label: "Review a contract for risk", href: "/contract-risk" },
  sections: [
    {
      title: "Why document comparison matters",
      description:
        "Documents go through multiple versions for reasons ranging from negotiation to regulatory updates to clerical errors. The problem with received revisions is that the changes aren't always disclosed — a counterparty's tracked changes may be accepted before sharing, a policy may arrive as a clean document with no indication of what moved, or a contract may be re-sent with changes the sender hopes go unnoticed.",
      items: [
        {
          title: "Undisclosed changes in contract negotiations",
          description:
            "In active contract negotiations, counterparties sometimes return a document with changes they hope will be adopted without scrutiny — particularly in long agreements where reading every clause again is impractical. Standard practice requires counterparties to use tracked changes; not all do. Without a systematic comparison, a changed indemnification clause, an added limitation-of-liability cap, or a modified payment term can be missed.",
        },
        {
          title: "Policy and procedure updates",
          description:
            "Organizations that issue periodic policy updates — employee handbooks, vendor terms, privacy policies, or operating procedures — often distribute the new version without a change summary. For the recipient, the question is: what specifically changed, and does it affect me? Reading two policies side-by-side works for short documents; for longer ones, systematic comparison is faster and more reliable.",
        },
        {
          title: "Regulatory and compliance document revisions",
          description:
            "Regulated industries receive updated forms, disclosure templates, and compliance documents from regulators, associations, or insurers. Understanding exactly what changed — whether a new disclosure was added, a liability statement was modified, or a defined term was altered — is a compliance obligation. Manual comparison at scale is error-prone; systematic comparison catches the specific changes.",
        },
        {
          title: "Verifying that a final version matches an approved draft",
          description:
            "After a contract has been agreed in principle, the final version for signature should match the last agreed draft. Clerical errors, inadvertent version rollbacks, or deliberate last-minute changes occasionally appear in the final version. Checking the signature version against the last approved draft before signing is a standard risk control.",
        },
      ],
    },
    {
      title: "Manual comparison: what it looks like and when it works",
      description:
        "For short documents or when the changes are expected to be limited, reading the two versions side by side remains a valid approach — but it has known failure modes.",
      items: [
        {
          title: "Side-by-side reading on screen or paper",
          description:
            "The oldest method: open both documents, either side-by-side on screen or printed, and read them in parallel. This works reliably only for short documents (a few pages) where the reader can hold the context of both versions simultaneously. For documents longer than 5–10 pages, manual side-by-side reading reliably misses changes — particularly single-word substitutions, moved paragraphs, and changed numbers.",
        },
        {
          title: "Reading only sections you expect changed",
          description:
            "If the counterparty has disclosed which sections they revised, reading only those sections is efficient — but it trusts the counterparty's disclosure to be complete. This is a reasonable approach in well-established relationships with transparent counterparties; for adversarial or unfamiliar counterparties, it's a vulnerability.",
        },
        {
          title: "Paragraph-level highlighting",
          description:
            "Printing both versions and using colored highlighters to mark differences is more systematic than reading alone — but it remains prone to missed changes, particularly in long dense paragraphs where single-word changes are easy to overlook. It also produces a non-digital artifact that's hard to share or audit.",
        },
      ],
    },
    {
      title: "Tracked changes: the standard for collaborative documents",
      description:
        "In Word, Google Docs, and similar word processors, tracked changes (or 'suggesting mode') records each edit as an annotation, attributing it to a user and making additions/deletions visible without hiding the original. This is the standard mechanism for document negotiation in most professional contexts.",
      items: [
        {
          title: "What tracked changes shows you",
          description:
            "Tracked changes marks additions (typically underlined or in green) and deletions (strikethrough, often in red) so both versions of a changed passage are visible simultaneously. Comments are also visible. The reviewer can accept or reject each change individually. This is the clearest format for reviewing revisions — when the counterparty has used it.",
        },
        {
          title: "When tracked changes isn't available",
          description:
            "Tracked changes requires both parties to work in the same editable format (Word/DOCX, Google Docs). When a document arrives as a PDF — as many executed contracts, regulatory filings, and formally distributed documents do — there's no tracked-changes layer. PDFs don't natively record revision history. Comparison then requires either converting to an editable format (with risk of formatting changes) or using a PDF-specific comparison tool.",
        },
        {
          title: "The risk of accepted tracked changes",
          description:
            "Before sharing a revised document, some counterparties accept all their tracked changes — converting the revision marks to clean text — so the document appears as a fresh unedited version. This is standard when producing a 'clean' copy of an agreed document but problematic when done to obscure changes that haven't been agreed. Receiving a document with tracked changes accepted means you're looking at a clean version with no revision record, making comparison essential.",
        },
      ],
    },
    {
      title: "PDF redlining: automated comparison for PDFs",
      description:
        "PDF redlining tools compare two PDF files by extracting their text content, computing a diff, and highlighting additions and deletions in the output — often color-coded (additions in green, deletions in red) in the same visual format as tracked changes.",
      items: [
        {
          title: "How PDF text comparison works",
          description:
            "The tool extracts the text from each PDF, aligns it at the paragraph or sentence level, and runs a diff algorithm (similar to the `diff` utilities used for code) to identify additions, deletions, and unchanged passages. The result is presented as an annotated document showing what changed between version A and version B. Formatting changes (font size, margins, spacing) are typically not captured — only text-level changes.",
        },
        {
          title: "What PDF redlining reliably catches",
          description:
            "Added or deleted text at any scale — a single word ('not' added before 'liable'), a changed number ('30 days' to '90 days'), a new paragraph, or an entire added section. It catches changes regardless of where in the document they appear, without requiring the reviewer to read every word of both versions.",
        },
        {
          title: "Limitations to know",
          description:
            "PDF redlining works on text content. It does not detect formatting changes (a table restructured to hide information, font size reduced to make a clause less prominent), image substitutions, or changes in embedded attachments. For high-stakes agreements, PDF comparison supplements but does not replace careful legal review — it tells you where the text changed, not what the changed text means legally.",
        },
        {
          title: "Scanned PDFs require OCR",
          description:
            "PDFs created by scanning physical documents don't contain machine-readable text — they contain images of text. PDF comparison tools work on extracted text; a scanned PDF without an OCR layer provides no text to compare. If your PDFs are scanned, use OCR software to add a text layer before comparing. Some PDF comparison tools include built-in OCR.",
        },
      ],
    },
    {
      title: "Choosing the right method for your situation",
      description:
        "The right comparison method depends on the document type, format, stakes, and how the document arrived.",
      items: [
        {
          title: "Both versions are Word/Google Docs files from an active negotiation",
          description:
            "Use tracked changes. Ask the counterparty to share revisions with track changes on, or turn it on yourself and compare manually. If they've sent a clean version, use a Word comparison tool (Word → Review → Compare → Compare Documents, or Google Docs → File → Version history if you uploaded both versions).",
        },
        {
          title: "One or both versions are PDFs",
          description:
            "Use a PDF redlining tool. This is the cleanest approach when you have two PDF versions and want a systematic text comparison. A local browser-based redline tool (which doesn't upload your document to a server) is appropriate for confidential documents.",
        },
        {
          title: "The document is short and the counterparty disclosed what changed",
          description:
            "Manual review of the specified sections, followed by a quick skim of the rest for anything unexpected. This is reasonable for trusted counterparties and short documents. Consider a tool comparison as a verification step if the stakes are high.",
        },
        {
          title: "The stakes are high or you don't trust the counterparty's disclosure",
          description:
            "Use automated comparison regardless of document length, then review the flagged changes. Don't rely solely on manual reading for high-stakes agreements. After the automated comparison, consider having counsel review the changed sections specifically.",
        },
        {
          title: "The document contains sensitive information",
          description:
            "For documents containing personal data, trade secrets, privileged communications, or information subject to data residency requirements, use a comparison tool that doesn't upload the document to an external server. Browser-based local tools process both PDFs in browser memory, with no server transmission, and are verifiable via DevTools.",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "How do I compare two versions of a PDF document?",
      answer:
        "Use a PDF comparison (redlining) tool that accepts two PDF files and outputs a diff highlighting additions and deletions. Browser-based PDF redlining tools extract text from both PDFs, compute a text diff, and present the results with additions highlighted (typically green) and deletions shown in strikethrough (typically red), in the same visual format as Word tracked changes. For confidential documents, use a tool that processes both PDFs locally in your browser without uploading them to a server — you can verify this with the DevTools Network tab.",
    },
    {
      question: "What's the difference between redlining and tracked changes?",
      answer:
        "Tracked changes is a feature of editable word processors (Word, Google Docs) that records each edit as it's made, attributing it to a user. Redlining refers to comparing two finished documents — often PDFs — and marking what changed between them. Tracked changes is built into the document's editing workflow; redlining is a retrospective comparison of two versions. For PDFs, which don't have a native edit-tracking layer, redlining tools compute the diff from the extracted text of both files.",
    },
    {
      question: "Can I compare two PDFs without uploading them to a server?",
      answer:
        "Yes. Browser-based PDF comparison tools extract the text from both PDFs within your browser's JavaScript environment, compute the diff locally, and display the result — without sending either document to a server. Open DevTools (F12) → Network tab before loading your PDFs, then run the comparison. A local tool shows no outbound requests carrying your document content. This is the appropriate approach for contracts, legal documents, or any document containing information you'd rather not transmit to a third-party server.",
    },
    {
      question: "What changes can a PDF comparison tool miss?",
      answer:
        "PDF text comparison detects text additions, deletions, and substitutions. It does not detect formatting changes (a clause moved to smaller font, a table restructured to de-emphasize a term), image substitutions, changes in embedded attachments, or metadata changes. For most practical document comparison purposes, text-level changes are what matter — but for high-stakes agreements, supplement automated comparison with careful human review of the changed sections.",
    },
    {
      question: "Can I compare scanned PDFs?",
      answer:
        "Only if they have a machine-readable text layer. PDFs created by scanning physical documents contain images of text, not selectable text. PDF comparison tools work on the text content — they need machine-readable text to extract. If your PDFs are scanned without OCR, you'll need to run OCR first to add a text layer before comparison. You can check whether a PDF has selectable text by trying to click and drag to select text in a PDF viewer — if it selects, the PDF has a text layer.",
    },
    {
      question: "How do I verify that a final contract matches the agreed draft?",
      answer:
        "Run a PDF redline comparison between your last approved draft and the final version sent for signature. Any differences will appear as additions (green) or deletions (red). Pay particular attention to: defined terms (a changed definition in Section 1 can alter the meaning of every clause that uses that term); liability and indemnification sections; payment terms and amounts; and notice and termination clauses. If differences appear that weren't discussed or agreed, raise them before signing — not after.",
    },
  ],
  readingLinks: [
    {
      label: "How to read a contract",
      href: "/how-to-read-a-contract/",
      description: "Once you've compared versions, understanding the contract itself: structure, defined terms, which sections carry the most risk, and how to interpret changes in context.",
    },
    {
      label: "Lease agreement red flags",
      href: "/lease-agreement-red-flags/",
      description: "When comparing lease agreement versions, knowing what the high-risk provisions are helps you spot meaningful changes vs. cosmetic edits.",
    },
    {
      label: "Vendor contract red flags",
      href: "/vendor-contract-red-flags/",
      description: "Vendor agreement comparison often surfaces changes to pricing, liability caps, and termination rights. What to look for in the differences.",
    },
    {
      label: "How to share a PDF securely",
      href: "/how-to-share-a-pdf-securely/",
      description: "After comparing and finalizing a document, sharing it securely: password protection, access controls, and verifying document integrity before sending.",
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
      name: "How to Compare Two Versions of a Document — Spotting What Changed",
      description:
        "Methods for comparing document versions — manual review, tracked changes, and automated PDF redlining — with guidance on which approach fits which situation.",
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
          name: "Compare Two Versions of a Document",
          item: url,
        },
      ],
    },
  ],
};

export default function CompareTwoVersionsOfADocumentPage() {
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
