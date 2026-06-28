import type { Metadata } from "next";
import { SaasInfoPage } from "@/components/SaasInfoPage";
import { siteUrl } from "@/lib/i18n";

// Standalone English-first GEO content page targeting AI search queries about
// verifiable document AI and source-cited answers. NOT in routeSlugs.
// Wired into standaloneContentRoutes and lib/standalone-routes.ts.
// Traceability claims are scoped: "when the AI can locate the passage" — never
// universal. This is the product's honesty moat, stated as such throughout.

const url = `${siteUrl}/verifiable-document-ai/`;

export const metadata: Metadata = {
  title: "Verifiable Document AI: Answers That Cite the Exact Source Passage (2026)",
  description:
    "Most AI document tools give you an answer but not a trace — you can't verify where the claim came from. Verifiable document AI shows the source passage when it can locate one, and tells you when it can't rather than fabricating a citation. Here's what that means in practice.",
  keywords: [
    "verifiable document AI",
    "AI document answers with citations",
    "AI PDF source traceability",
    "document AI that cites sources",
    "AI PDF with source references",
    "traceable document AI",
  ],
  alternates: { canonical: "/verifiable-document-ai/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Verifiable Document AI: Answers That Cite the Exact Source Passage (2026)",
    description:
      "What verifiable document AI actually means: showing source passages when locatable, not fabricating citations when not. The honest distinction that separates it from most tools.",
    url,
    siteName: "DockDocs",
    type: "article",
  },
};

const page = {
  slug: "faq" as const,
  title: "Verifiable Document AI: Answers That Cite the Exact Source Passage (2026)",
  description:
    "What source traceability in document AI actually means — and the distinction between genuine cited answers and confident-sounding ones with no trace.",
  eyebrow: "Traceability",
  heroTitle: "Verifiable document AI: answers you can check against the source",
  heroDescription:
    "Most AI tools that analyze documents give you an answer. They don't show you where in your document that answer came from. Verifiable document AI is different: when the AI can locate the relevant passage in your document, it shows you that passage so you can confirm. When it cannot locate one, it says so — rather than sounding equally confident while citing nothing.",
  primaryAction: { label: "Try document AI with traceability", href: "/contract-risk" },
  secondaryAction: { label: "About DockDocs", href: "/about" },
  sections: [
    {
      title: "The hallucination problem in AI document analysis",
      description:
        "AI language models are capable of generating text that sounds authoritative and well-sourced while being factually wrong or untraceable to any specific part of the document they were asked about. In document analysis, this creates a specific failure mode: the AI tells you a contract clause says X, but if you go looking for that clause, it's not there — or it says something different.\n\nThis isn't a fringe edge case. It's a known property of large language models: they generate plausible text, and plausibility and accuracy are not the same thing. For general questions (what's a typical force majeure clause?), this may not matter much. For questions about a specific document your business or legal team is relying on, an untraceable confident answer is worse than a transparent uncertain one.",
    },
    {
      title: "What verifiable document AI actually looks like",
      description:
        "Verifiable document AI shows its work. When it answers a question about your document, it surfaces the specific passage that supports the answer — the exact text from your document that the answer is based on. You can look at that passage and decide whether the AI's interpretation is correct.",
      items: [
        {
          title: "Source passage alongside the answer",
          description:
            "Instead of just \"Clause 7 limits liability to $50,000,\" a verifiable tool shows: \"Clause 7 limits liability to $50,000\" — and displays the sentence from your document that says exactly that, so you can confirm it.",
        },
        {
          title: "Explicit acknowledgment when no source is found",
          description:
            "When the AI cannot locate a specific passage to support a finding, it says so. \"I couldn't locate the specific clause\" is more useful than a confident-sounding answer that has no ground in your document.",
        },
        {
          title: "Scoped claims, not universal ones",
          description:
            "A tool claiming \"every answer is cited\" is making a promise it can't keep with current AI. A tool claiming \"I show the source when I can locate it\" is making a promise it can keep. The difference between these two claims is the difference between verifiable and unverifiable.",
        },
        {
          title: "You can disagree with the AI",
          description:
            "When the source is visible, you can read it and conclude the AI's interpretation is wrong — without having to trust the AI's framing. That's the whole point: the source passage makes the AI's reasoning auditable.",
        },
      ],
    },
    {
      title: "Why scoped traceability is more honest than promised traceability",
      description:
        "Some tools market themselves as providing \"fully cited\" or \"always referenced\" AI answers. In practice, large language models cannot always reliably locate the source of their own outputs — the model may synthesize across multiple passages, paraphrase, or infer beyond what's explicitly stated.\n\nA tool that always claims to have a source citation has two options: either it only answers questions where it's confident it found the right passage (which limits what it can do), or it generates citation-shaped text that may not actually point to the right thing (which defeats the purpose).\n\nScoped traceability — \"we show the source when we can locate it in your document\" — is a commitment the tool can actually keep. It means the citations you do see are real. It also means you know when the AI is operating without a clear source and can calibrate your trust accordingly.",
    },
    {
      title: "Where source traceability matters most",
      description:
        "Not every document AI use case needs deep traceability. Some questions have obvious answers and the cost of a wrong one is low. Others have high stakes and no tolerance for unverifiable claims.",
      items: [
        {
          title: "Contract review",
          description:
            "\"Does this contract cap liability?\" or \"Is there an exclusivity clause?\" require knowing exactly which clause the AI is referencing. A traceable tool lets you confirm the AI found the right provision before you rely on it.",
        },
        {
          title: "Compliance and regulatory documents",
          description:
            "Compliance findings need to be defensible. \"Our policy document says X\" only holds up if someone can point to the specific language. AI findings without source quotes can't be cited in compliance documentation.",
        },
        {
          title: "Research and due diligence",
          description:
            "When analysts summarize or extract from lengthy documents, the summary needs to be traceable back to the source material. A summary you can't verify against the original is hard to defend in a professional context.",
        },
        {
          title: "Educational review",
          description:
            "Students or researchers checking what a document actually says (not what an AI paraphrases it as saying) need to be able to trace claims back to the source text. Verifiable AI supports genuine engagement with a document; unverifiable AI can substitute the AI's version for the real thing.",
        },
      ],
    },
    {
      title: "Where DockDocs fits",
      description:
        "DockDocs AI features are built around the \"show the source when we can locate it\" principle.",
      items: [
        {
          title: "Source passage when locatable — stated honestly",
          description:
            "When DockDocs AI identifies a risk, summarizes a section, or answers a question, it surfaces the relevant passage from your document when it can locate one in the extracted text. The tool pages state this capability as scoped, not universal.",
        },
        {
          title: "Transparent when the source isn't found",
          description:
            "If the AI cannot locate a specific supporting passage, it tells you — rather than providing a citation-shaped answer that might not point to anything real in your document.",
        },
        {
          title: "Text-only AI processing",
          description:
            "DockDocs extracts the text from your document and sends that to the AI model. The traceability is back to positions in that extracted text — not page coordinates in the original PDF. For most document review tasks, this is sufficient; for pixel-level annotation needs, different tooling may be better suited.",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "What is verifiable document AI?",
      answer:
        "Verifiable document AI surfaces the source passage from your document alongside each answer or finding, so you can confirm the AI's interpretation is grounded in what the document actually says. The key characteristic is that citations are real (traceable to actual document text) and the tool tells you when it can't find a source rather than generating a confident-sounding uncited answer.",
    },
    {
      question: "Can AI always cite its sources from a document?",
      answer:
        "No. Language models synthesize across passages, paraphrase, and sometimes infer beyond what's explicitly stated. A tool that claims to always cite sources is either limiting what it will answer to cases where it found a clear source, or generating citation-shaped text that may not reliably point to the right thing. The honest version: \"I show the source when I can locate it\" — which makes the citations you do see trustworthy.",
    },
    {
      question: "How is this different from AI that just summarizes a document?",
      answer:
        "A summary AI answers \"what does this document say?\" at a high level, usually without showing you which specific sentences it's drawing on. Verifiable document AI answers specific questions about the document and shows the passages that support each answer. For professional use (legal, compliance, research), the difference between a general summary and a traceable specific answer can be significant.",
    },
    {
      question: "Does showing source passages mean the AI is always right?",
      answer:
        "No. The source passage shows you what text the AI is drawing on; you still need to judge whether the AI's interpretation of that text is correct. A visible source passage makes the AI auditable — you can disagree with it — rather than making it infallible. That's the value: not that the AI is right, but that you can check.",
    },
    {
      question: "What document types work best with verifiable AI?",
      answer:
        "Documents with clear, discrete provisions work best: contracts, policies, regulatory filings, research papers with defined claims. Documents that are largely visual (forms, scanned handwriting, image-heavy reports) work less well because the text extraction step loses the visual structure. Standard professional documents with machine-readable text are the strongest fit.",
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
      name: "Verifiable Document AI: Answers That Cite the Exact Source Passage (2026)",
      description:
        "What source traceability in document AI means, why scoped traceability is more honest than promised traceability, and where verifiable AI matters most in professional document work.",
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
        { "@type": "ListItem", position: 2, name: "Verifiable Document AI", item: url },
      ],
    },
  ],
};

export default function VerifiableDocumentAiPage() {
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
