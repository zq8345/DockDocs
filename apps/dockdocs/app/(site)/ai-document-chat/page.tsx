import type { Metadata } from "next";
import { SaasInfoPage } from "@/components/SaasInfoPage";
import { siteUrl } from "@/lib/i18n";

// Standalone English-first GEO content page targeting "chat with documents" and
// "AI document chat" queries (GSC: 23 impressions, 0 clicks — zero content gap).
// Differentiated from /chat-with-pdf/ (tool page) by explaining WHAT AI document
// chat is, WHEN to use it, and WHAT TO EXPECT — not the tool UI itself.
// Traceability claims scoped ("when the AI can locate the passage"). AI sends
// extracted text, not zero data.

const url = `${siteUrl}/ai-document-chat/`;

export const metadata: Metadata = {
  title: "AI Document Chat: Ask Questions, Get Answers from Your Documents (2026)",
  description:
    "AI document chat lets you ask questions about a document in plain language and get answers drawn from its contents — not from the AI's general knowledge. What it does, when it's more useful than keyword search, and what to expect from it.",
  keywords: [
    "AI document chat",
    "chat with documents",
    "chat with document AI",
    "AI document Q&A",
    "ask questions about a document",
    "AI PDF chat",
  ],
  alternates: { canonical: "/ai-document-chat/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "AI Document Chat: Ask Questions, Get Answers from Your Documents (2026)",
    description:
      "AI document chat answers questions from a specific document's contents — not from general knowledge. What it does well, what it doesn't, and how to evaluate whether answers are trustworthy.",
    url,
    siteName: "DockDocs",
    type: "article",
  },
};

const page = {
  slug: "faq" as const,
  title: "AI Document Chat: Ask Questions, Get Answers from Your Documents (2026)",
  description:
    "What AI document chat actually does, when it's more useful than search, and how to tell whether the answers it gives you are trustworthy.",
  eyebrow: "Document AI",
  heroTitle: "AI document chat: ask questions, get answers from your documents",
  heroDescription:
    "AI document chat works differently from a search engine and differently from a general chatbot. A search engine finds relevant pages; it doesn't answer your specific question. A general chatbot answers from its training data, which may have nothing to do with your document. AI document chat reads a document you provide and answers questions using only what's in that document — not the AI's general knowledge.",
  primaryAction: { label: "Chat with a document", href: "/chat-with-pdf" },
  secondaryAction: { label: "Verifiable document AI", href: "/verifiable-document-ai" },
  sections: [
    {
      title: "What AI document chat actually does",
      description:
        "When you chat with a document using AI, you upload the document (or paste its text), then ask questions in natural language. The AI reads the document's content and generates an answer based on what it finds there.\n\nThe AI is not performing keyword search — it's reading the document semantically, understanding the question, and constructing an answer from the relevant parts of the text. This means you can ask questions that don't map to any exact phrase in the document: \"what are the termination conditions?\" or \"summarize the methodology section\" or \"does this contract limit liability?\" — and get a useful answer even when none of those exact words appear together in the text.",
    },
    {
      title: "When document chat is more useful than keyword search",
      description:
        "Keyword search is better when you know the exact term you're looking for and want to jump to where it appears. Document chat is better when:",
      items: [
        {
          title: "You're asking a question, not searching for a term",
          description:
            "\"What is the notice period for termination?\" is a question. Searching \"notice period\" in a contract finder will locate every instance of that phrase — but won't tell you what the relevant clause actually means or how it applies. AI chat synthesizes the answer.",
        },
        {
          title: "The answer requires interpretation, not just location",
          description:
            "\"Is this contract one-sided?\" can't be answered by finding the right page. It requires reading multiple provisions together and making a judgment. AI document chat can do that interpretation — with the caveat that you should read the underlying clauses to verify.",
        },
        {
          title: "You're working with a long document you haven't fully read",
          description:
            "A 120-page contract, a research paper with extensive appendices, a technical manual for software you're evaluating — document chat gives you a way to get oriented and find what's relevant before committing to a full read.",
        },
        {
          title: "You need a summary of a specific section",
          description:
            "\"Summarize the limitations and exclusions section\" or \"what does the indemnification clause say in plain language?\" — document chat translates specific sections into readable prose without summarizing the whole document.",
        },
      ],
    },
    {
      title: "What to expect: traceability and limitations",
      description:
        "AI document chat has two properties that distinguish good implementations from problematic ones.",
      items: [
        {
          title: "Source passage when locatable",
          description:
            "When the AI can locate the specific passage that supports its answer, a good document chat tool shows you that passage — the actual text from your document the answer is based on. This lets you verify the AI's interpretation rather than just trusting it. When the AI cannot locate a supporting passage, it should say so rather than generating a confident-sounding answer without a grounding source.",
        },
        {
          title: "Not infallible",
          description:
            "AI document chat can misread a clause, miss the interaction between two provisions, or generate a plausible-sounding answer that doesn't accurately reflect what the document says. For any answer that matters — before signing, before relying on a factual claim, before making a business decision — read the source passage yourself. The AI's answer is a starting point, not a final word.",
        },
        {
          title: "Text-based, not image-based",
          description:
            "AI document chat reads extracted text. Scanned documents, forms, diagrams, and heavily image-based PDFs may not have machine-readable text for the AI to work with. For scanned documents, OCR is a prerequisite — the text needs to be extracted before it can be analyzed.",
        },
        {
          title: "Context window constraints",
          description:
            "Very long documents may exceed what a single AI context window can hold. Some tools handle this by chunking documents and retrieving the most relevant sections; others process the whole document at once. For very long documents, ask the tool explicitly about a specific section rather than expecting it to synthesize across the entire document.",
        },
      ],
    },
    {
      title: "Document types that work well with AI chat",
      description:
        "AI document chat performs best when documents have clear prose structure and machine-readable text.",
      items: [
        {
          title: "Contracts and legal agreements",
          description:
            "Contracts are structured, clause-form documents — exactly what AI document chat handles well. You can ask about specific provisions, request plain-language translations of legal language, or ask what the contract says about a particular situation.",
        },
        {
          title: "Research papers and reports",
          description:
            "Research papers have defined sections (abstract, methods, results, conclusion) that map naturally to document chat questions. \"What methodology did they use?\" or \"what were the main findings?\" are well-formed questions for AI document chat.",
        },
        {
          title: "Policy and compliance documents",
          description:
            "Privacy policies, HR handbooks, regulatory guidance, and compliance frameworks are long and hard to read end-to-end. Document chat lets you ask \"what does this policy say about data retention?\" rather than reading 40 pages to find the relevant paragraph.",
        },
        {
          title: "Financial statements and filings",
          description:
            "Annual reports, earnings releases, and SEC filings contain specific data that can be hard to locate. Document chat lets you ask \"what was revenue in Q3?\" or \"what are the main risk factors cited?\" and get a direct answer from the document.",
        },
      ],
    },
    {
      title: "What distinguishes good AI document chat",
      description:
        "Not all AI document chat tools work equally well. The differences that matter most for professional use:",
      items: [
        {
          title: "Source traceability",
          description:
            "Does the tool show you where in the document the answer came from? A tool that shows the source passage makes the AI's reasoning auditable — you can check whether the AI read the right part of the document. A tool that gives answers without sources requires trusting the AI's interpretation without the ability to verify it.",
        },
        {
          title: "Transparency about uncertainty",
          description:
            "When the AI isn't sure, does it say so? Or does it produce a confident-sounding answer regardless? A tool that flags uncertainty — \"I couldn't find a specific clause addressing this\" — is more useful than one that always generates an answer.",
        },
        {
          title: "Privacy of the document",
          description:
            "Does the document go to a server, or is it processed locally? For sensitive documents (contracts, financial data, personal information), whether the file itself is transmitted matters. Some tools extract text and send only the text to the AI; others transmit the original file.",
        },
      ],
    },
    {
      title: "How DockDocs approaches document chat",
      description:
        "DockDocs Chat with PDF reads your document and answers questions based on its contents. When the AI can locate the relevant passage in the extracted text, it shows you that passage so you can verify the answer. When it can't locate a supporting passage, it says so.",
      items: [
        {
          title: "Answers from your document, not general knowledge",
          description:
            "The AI is instructed to answer from the document you upload, not from its training data. For questions the document doesn't address, that should be reflected in the answer rather than generating general knowledge dressed up as document-specific answers.",
        },
        {
          title: "Source passage when locatable",
          description:
            "Where the AI can find the relevant text in your document, it surfaces that passage alongside the answer. You can read the actual clause or sentence, not just the AI's paraphrase of it.",
        },
        {
          title: "Text sent to the AI, not the file",
          description:
            "DockDocs extracts text from your document in your browser and sends that text to the AI provider. The original file is not transmitted to DockDocs servers. For sensitive documents, this limits (though does not eliminate) the external transmission footprint.",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "What is AI document chat?",
      answer:
        "AI document chat is a way to ask questions about a specific document in plain language and get answers drawn from that document's content — not from the AI's general knowledge. You provide the document, the AI reads it, and you ask questions: what does clause 7 say? what are the main findings? what is the return policy? The AI answers from what's in the document.",
    },
    {
      question: "How is AI document chat different from a general chatbot?",
      answer:
        "A general chatbot answers from its training data — it knows things it was trained on, and makes up or hallucinates things it doesn't. AI document chat is constrained to answer from a specific document you provide. It shouldn't (and in a well-implemented tool, won't) pull in outside information to answer questions about your document. The tradeoff: document chat is more accurate about what's in your specific document, but it can only answer questions that can be answered from the document's text.",
    },
    {
      question: "Does AI document chat work for all document types?",
      answer:
        "Text-based PDFs and documents work best: contracts, reports, research papers, manuals, financial filings, policy documents. Scanned documents (image-only PDFs) need OCR first so the text can be extracted. Heavily visual documents — diagrams, forms, presentations where content is in images — may not have enough machine-readable text to work with.",
    },
    {
      question: "How do I know the AI's answers are accurate?",
      answer:
        "The best way is to use a tool that shows the source passage from your document alongside each answer — so you can read the actual text and verify the AI's interpretation. If an answer matters (before signing, before making a decision), read the underlying passage yourself. AI document chat can misread, oversimplify, or miss the interaction between provisions. The source passage makes the AI's reasoning checkable rather than something you have to take on faith.",
    },
    {
      question: "Is it safe to use AI document chat with sensitive documents?",
      answer:
        "It depends on the tool's architecture. Tools that upload your document to a server expose it to third-party processing. Tools that extract text in your browser and send only the text to the AI provider have a smaller (but non-zero) transmission footprint — the text still reaches an AI provider's servers. For documents under NDA, containing personal data, or subject to regulatory constraints, check the tool's privacy policy and data processing terms before use. A tool that processes the file locally (text extraction in your browser) reduces but does not eliminate the external exposure.",
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
      name: "AI Document Chat: Ask Questions, Get Answers from Your Documents (2026)",
      description:
        "What AI document chat does, when it's more useful than search, what to expect from traceability and accuracy, and how to evaluate whether a tool is trustworthy.",
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
        { "@type": "ListItem", position: 2, name: "AI Document Chat", item: url },
      ],
    },
  ],
};

export default function AiDocumentChatPage() {
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
