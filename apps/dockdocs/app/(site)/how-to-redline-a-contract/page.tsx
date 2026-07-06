import type { Metadata } from "next";
import { SaasInfoPage } from "@/components/SaasInfoPage";
import { siteUrl } from "@/lib/i18n";

// Standalone English-first GEO content page targeting queries around
// how to redline a contract, what redlining means, and how to mark up
// contract revisions. Links to /redline (client-side PDF diff tool)
// and /for/legal (legal hub).
// NOT in routeSlugs. Wired into standaloneContentRoutes in sitemap.ts.

const url = `${siteUrl}/how-to-redline-a-contract/`;

export const metadata: Metadata = {
  title: "How to Redline a Contract — Marking Up and Reviewing Revisions",
  description:
    "Redlining is the standard way to show proposed changes in a contract negotiation. This guide covers what redlining means, how to mark up a contract, what to look for when reviewing redlines, and how to do it with PDFs.",
  keywords: [
    "how to redline a contract",
    "redline a contract",
    "redline a pdf",
    "what is redlining in contracts",
    "contract redline",
    "redline document",
    "pdf redline",
    "markup contract changes",
    "contract revision tracking",
    "redlining meaning legal",
  ],
  alternates: { canonical: "/how-to-redline-a-contract/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "How to Redline a Contract — Marking Up and Reviewing Revisions",
    description:
      "What redlining means in contract practice, how to mark up proposed changes, what to review when you receive a redline, and how to handle PDFs that don't support tracked changes.",
    url,
    siteName: "DockDocs",
    type: "article",
  },
};

const page = {
  slug: "faq" as const,
  title: "How to Redline a Contract — Marking Up and Reviewing Revisions",
  description:
    "What redlining means, how to mark up proposed changes, and what to look for when you receive a redlined contract.",
  eyebrow: "Contract Negotiation & Review",
  heroTitle: "How to redline a contract",
  heroDescription:
    "Redlining is how contract changes get communicated in negotiation. You receive a contract, mark up your proposed changes — additions underlined or highlighted, deletions struck through — and return it. The other side sees exactly what you changed, accepts what they agree with, and proposes their own alternatives where they don't. When both sides stop redlining and the markups disappear, you have an agreed contract. This guide covers how to redline a contract, what to look for when you receive one, and how to handle the common case where the document is a PDF.",
  primaryAction: { label: "Compare two PDF versions (redline)", href: "/redline" },
  secondaryAction: { label: "Legal document tools", href: "/for/legal" },
  sections: [
    {
      title: "What redlining means in practice",
      description:
        "The term 'redline' comes from the physical practice of marking contract changes in red ink. In modern usage it refers to any markup showing what has been added or deleted — the color and method vary, but the convention is consistent across industries.",
      items: [
        {
          title: "The visual convention: green for additions, red for deletions",
          description:
            "In most software tools and professional practice, added text appears underlined (often in green or blue), and deleted text appears with a strikethrough (often in red). This lets both parties see the original text and the proposed replacement simultaneously — without having to read two separate documents and find the differences manually. The convention mirrors the way a lawyer might physically redline a contract with a red pen, crossing out language to be removed and writing proposed replacements in the margin.",
        },
        {
          title: "Redlining vs. tracked changes: what's the difference",
          description:
            "Tracked changes is a feature in word processors (Microsoft Word, Google Docs) that records each edit as it's made — it's a live editing record built into the document. Redlining is a broader term: it can refer to tracked changes in Word, or to the output of comparing two finished document versions. In PDF contexts, where there's no native edit-tracking layer, redlining means running a comparison tool against two PDF versions and viewing the resulting diff.",
        },
        {
          title: "Why contracts are often in PDF by the time you redline them",
          description:
            "Final or near-final contract drafts are routinely distributed as PDFs — they're harder to accidentally edit, and they preserve formatting across systems. But PDFs don't have a native tracked-changes layer. When a contract arrives as a PDF and you need to redline it, the options are: convert it to Word and use tracked changes, or use a PDF redlining tool that extracts the text, computes a diff between two versions, and presents the output visually.",
        },
        {
          title: "Clean copies vs. redlined versions",
          description:
            "In contract negotiation, a 'clean copy' is a version with all proposed changes accepted — no markup visible. A 'redlined version' or 'marked-up draft' shows the proposed changes. Standard practice: when proposing changes, return a redlined version. When both sides reach agreement on a section, produce a clean copy of those provisions. Never sign a redlined version — the signature version should be a clean copy where both parties agree on the final text.",
        },
      ],
    },
    {
      title: "How to redline a contract (step by step)",
      description:
        "The mechanics depend on the document format. Here's how to handle the two most common cases.",
      items: [
        {
          title: "Redlining a Word document with tracked changes",
          description:
            "Open the document in Microsoft Word. Go to Review → Track Changes (or Ctrl+Shift+E). With tracking on, every addition you make appears underlined and every deletion appears struck through. When you're done, go to Review → Show Markup to verify all changes are visible. Email or share the file with tracked changes on — don't accept changes before sending. The recipient can then accept, reject, or respond to each change individually.",
        },
        {
          title: "Redlining a PDF (two approaches)",
          description:
            "If you have the source Word file, convert the PDF to Word (or ask the other side for the editable version), make your changes with tracked changes on, and export back to PDF. If you only have the PDF: use a browser-based PDF comparison tool to compare your version against the received version. Upload both PDFs — the tool extracts the text, computes the diff, and shows additions and deletions visually. For confidential contracts, use a tool that processes both files locally in your browser without uploading them to a server.",
        },
        {
          title: "What to mark: substance vs. style",
          description:
            "Mark every substantive change you're proposing: changed terms, added clauses, deleted language, modified numbers or dates. Don't mark cosmetic changes (fixing a typo, correcting a cross-reference number) as if they were substantive — it creates confusion. If you're making both substantive and cosmetic edits, note in your cover email which changes are non-negotiable positions and which are minor corrections.",
        },
        {
          title: "Sending back your redline",
          description:
            "When returning a redlined contract, send both the marked-up version (showing all your proposed changes) and a clean version (with all changes accepted, so the other side can read the document without markup). This is considered professional practice: it shows your positions clearly and gives the other side a clean draft to respond to. Include a short cover note identifying the key issues you've raised.",
        },
      ],
    },
    {
      title: "What to look for when you receive a redlined contract",
      description:
        "Reviewing someone else's redline requires more than reading the highlighted text. Changes elsewhere in the document — or patterns across changes — often matter as much as any single markup.",
      items: [
        {
          title: "Start with defined terms",
          description:
            "Defined terms in Section 1 (or the definitions section) carry throughout the entire contract. A change to a defined term — for example, narrowing the definition of 'Deliverables' or broadening 'Confidential Information' — affects every clause that uses that term. Review defined-term changes first, because they can silently change the meaning of provisions you haven't looked at yet.",
        },
        {
          title: "Pay close attention to liability, indemnification, and warranty",
          description:
            "These are the sections where financial exposure is determined. Common redline moves: adding a cap on liability ('not to exceed the fees paid in the prior 12 months'), narrowing the scope of an indemnification obligation, adding exclusions to warranties, or removing the word 'reasonable' from a best-efforts obligation. Any change in these sections deserves careful consideration even if it looks minor.",
        },
        {
          title: "Check termination rights and notice periods",
          description:
            "Counterparties often propose asymmetric termination rights — for example, giving themselves the right to terminate for convenience while removing or limiting your corresponding right. Notice periods affect how quickly either party can exit. Check whether termination triggers, cure periods, and post-termination obligations are bilateral and proportionate.",
        },
        {
          title: "Look for changes outside the redlined sections",
          description:
            "Not all counterparties return honest redlines. Some accept tracked changes before sharing, producing a clean document where undisclosed changes are invisible. If a document arrives 'clean' but looks different from your last version, run a PDF comparison to surface any text that changed without being marked. A tool that computes a diff between the two versions will show every text difference, regardless of whether tracked changes was used.",
        },
        {
          title: "Count what was deleted, not just what was added",
          description:
            "Counterparties occasionally remove protections that favor you — a dispute resolution clause replaced with litigation, an audit right deleted, a warranty removed — without proposing alternative language. Deletions without replacements can be easy to miss when skimming markup. When reviewing a redline, read struck-through text as carefully as proposed additions.",
        },
      ],
    },
    {
      title: "Redlining PDFs: why it's different from Word",
      description:
        "PDFs are common in contract practice but don't have a native revision-tracking layer. Here's what that means in practice and how to work around it.",
      items: [
        {
          title: "PDFs don't natively record revision history",
          description:
            "A PDF is a fixed-format presentation document. Unlike Word, where revision marks are stored in the document's structure, a PDF just contains the rendered output — text, images, and formatting — with no record of what changed between versions. To 'redline' a PDF, you need to either compare two versions externally (and view the diff) or convert to an editable format and use tracked changes.",
        },
        {
          title: "Browser-based PDF comparison: how it works",
          description:
            "A browser-based PDF redline tool extracts the text content from both PDFs (the earlier version and the revised version), runs a diff algorithm to identify additions and deletions, and displays the result with standard redline markup — additions highlighted, deletions struck through. The entire process runs in your browser's JavaScript environment. For confidential contracts, this means the document text is never transmitted to an external server; you can verify this with the DevTools Network tab.",
        },
        {
          title: "Scanned PDFs require OCR first",
          description:
            "PDFs created by scanning physical documents contain images, not machine-readable text. PDF comparison tools work on text content — they need selectable text to extract and compare. If your contract PDFs are scanned, run OCR first to add a text layer. A quick test: try to click and drag to select text in your PDF viewer. If you can select it, the PDF has a text layer. If not, run OCR before comparison.",
        },
        {
          title: "What PDF comparison doesn't catch",
          description:
            "PDF text comparison detects text additions, deletions, and substitutions — including single-word changes and number substitutions. It does not detect formatting changes (a clause moved to smaller type, a table restructured), image substitutions, or changes to embedded attachments. For the text-level changes that matter most in contract review, it's reliable; for format-level manipulation, it has limits.",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "What does redlining a contract mean?",
      answer:
        "Redlining a contract means marking it up with proposed changes — typically showing additions underlined or highlighted and deletions struck through. The term comes from the practice of marking changes in red ink. In contract negotiation, parties exchange redlined versions to show what they're proposing to change, accept the changes they agree with, and propose alternatives where they don't. When both parties stop redlining, the clean version is the agreed contract.",
    },
    {
      question: "How do I redline a PDF contract?",
      answer:
        "If you have the source Word file, make your changes with Track Changes on, then export back to PDF. If you only have the PDF: upload both your version and the received version to a PDF comparison tool. The tool extracts text from both files, computes a diff, and displays a redlined view — additions highlighted, deletions struck through — without requiring you to manually find every change. For confidential contracts, use a browser-based tool that processes both PDFs locally, without uploading them to a server.",
    },
    {
      question: "What's the difference between redlining and tracked changes?",
      answer:
        "Tracked changes is a feature in word processors that records each edit as you make it. Redlining refers more broadly to any markup showing proposed changes — it can mean tracked changes in Word, or the output of comparing two finished documents (as happens with PDFs). In everyday contract practice, people use the terms interchangeably. The key distinction is that tracked changes is built into the editing workflow; PDF redlining is a retrospective comparison of two already-complete versions.",
    },
    {
      question: "What's the difference between redlining and redacting a document?",
      answer:
        "Redlining and redacting are opposite operations that are easy to confuse. Redlining marks proposed changes during negotiation — additions highlighted, deletions struck through — so both parties see exactly what's changing and can respond. Redacting permanently removes sensitive text before sharing a document, blacking out names, dollar amounts, or confidential clauses so the recipient sees only what you intend to disclose. If you're negotiating a contract, you redline. If you need to share a document but hide some of its content first, you redact. DockDocs has tools for both: compare and mark up PDF versions at the redline comparison tool, or black out sensitive text with the Redact PDF tool before sharing.",
    },
    {
      question: "Do I need to send both a redlined version and a clean version?",
      answer:
        "In professional contract practice, yes. Sending both is standard: the redlined version shows your counterparty exactly what you've proposed, while the clean version lets them read the contract without markup to understand how it reads if your changes are accepted. It's also common to include a short cover note summarizing the key issues. Some parties return only the redlined version; the clean copy is a courtesy that speeds up negotiation.",
    },
    {
      question: "How do I check if a PDF was changed without showing redlines?",
      answer:
        "Run a PDF comparison against the version you have on file. Upload the two PDFs to a comparison tool — your earlier version and the received version — and it will compute a text diff showing every addition and deletion, including changes that were made without tracked changes. This catches cases where a counterparty accepted all changes before sharing, producing a 'clean' document that contains undisclosed modifications. The comparison shows the text-level differences between the two files.",
    },
    {
      question: "Can I redline a scanned PDF contract?",
      answer:
        "Not directly. Scanned PDFs contain images of text, not machine-readable text — PDF comparison tools need actual text to compare. You'll need to run OCR first to add a text layer. To check whether your PDF has selectable text, open it in a PDF viewer and try to click-and-drag to highlight text; if it selects, there's a text layer. After OCR, the PDF comparison works normally. Some PDFs are hybrids — they contain a text layer that was added after scanning and may be inaccurate if the OCR quality was poor.",
    },
  ],
  readingLinks: [
    {
      label: "Compare two versions of a document",
      href: "/compare-two-versions-of-a-document/",
      description:
        "When both versions are PDFs, how PDF comparison works — and when each comparison method (manual, tracked changes, automated diff) is the right choice for the situation.",
    },
    {
      label: "How to read a contract",
      href: "/how-to-read-a-contract/",
      description:
        "Contract structure, what each section typically contains, which clauses carry the most risk, and how to work through a contract efficiently before redlining.",
    },
    {
      label: "NDA: what to look for",
      href: "/nda-what-to-look-for/",
      description:
        "NDAs are among the most frequently negotiated and redlined contracts. Key provisions to review: definition of confidential information, permitted use, exclusions, and return/destruction requirements.",
    },
    {
      label: "Vendor contract red flags",
      href: "/vendor-contract-red-flags/",
      description:
        "When you receive a vendor's paper (their standard form) and are about to redline it, the provisions most likely to need your changes — liability caps, indemnification scope, IP ownership, and termination rights.",
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
      name: "How to Redline a Contract — Marking Up and Reviewing Revisions",
      description:
        "What redlining means in contract practice, how to mark up proposed changes, what to review when you receive a redline, and how to handle PDFs that don't support tracked changes.",
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
          name: "How to Redline a Contract",
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

export default function HowToRedlineAContractPage() {
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
