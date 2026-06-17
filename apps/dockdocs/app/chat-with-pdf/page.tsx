import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n";
import { ChatWithPdfClient } from "./ChatWithPdfClient";
import { groundingFaq } from "@/components/GroundingNote";

export const metadata: Metadata = {
  title: "Chat with PDF — AI Q&A with Your Documents",
  description: "Chat with any PDF or document and get answers that cite the source — upload a file, ask questions, and let AI read it for you. Free, in your browser.",
  keywords: ["chat with pdf", "chat with documents", "ai pdf chat", "ask pdf questions", "chat with document"],
  alternates: { canonical: "/chat-with-pdf/", languages: languageAlternates("chat-with-pdf") },
  robots: { index: true, follow: true },
};

// FAQ — 真实能力、与实现相符；可被 AI 引擎引用的清晰事实块
const FAQ = [
  {
    question: "How do I chat with a PDF?",
    answer:
      "Upload your PDF, then type a question about its content. The AI reads the document and answers using what is actually in the file — for example asking for a deadline, a clause, a figure, or a summary of a section.",
  },
  {
    question: "Is Chat with PDF free?",
    answer:
      "Yes. You can upload a PDF and ask questions for free. There is a free usage quota, with paid plans for heavier use.",
  },
  {
    question: "Are the answers based on my document or general knowledge?",
    answer:
      "Answers are grounded in your uploaded document — the AI is instructed to answer from the file's content rather than general knowledge. For important details like dates, numbers, and legal terms, verify the answer against the source passage.",
  },
  {
    question: "What kinds of documents can I ask about?",
    answer:
      "It works with text-based PDFs such as contracts, reports, research papers, manuals, and meeting notes. For scanned (image-only) PDFs, run OCR first so the text can be read.",
  },
  {
    question: "Are my documents kept private?",
    answer:
      "Your document is sent to the AI service to generate answers, then discarded. Files are not stored long-term or used to train models, and no account is required to start.",
  },
];

// 结构化数据(此页未走共享模板，手动补上，供 Google 理解 + AI 引用)
const SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://dockdocs.app/chat-with-pdf/#app",
      name: "DockDocs Chat with PDF",
      url: "https://dockdocs.app/chat-with-pdf/",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description: "Upload a PDF and ask grounded questions. The AI answers using only your document.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://dockdocs.app/chat-with-pdf/#breadcrumb",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "DockDocs", item: "https://dockdocs.app/" },
        { "@type": "ListItem", position: 2, name: "Chat with PDF", item: "https://dockdocs.app/chat-with-pdf/" },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": "https://dockdocs.app/chat-with-pdf/#faq",
      // The visible FAQ list + the source-grounding fact (shown as prose by
      // GroundingNote in the client), so the citable grounding statement is in
      // the structured data without being duplicated in the visible FAQ list.
      mainEntity: [...FAQ, groundingFaq("chat", "en")].map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
  ],
};

export default function ChatWithPdfPage() {
  return (
    <main className="bg-[color:var(--surface)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
      <div className="mx-auto max-w-3xl px-5 pb-12 pt-12 sm:px-6 sm:pt-16">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs text-[color:var(--muted)]">
          <a href="/" className="transition hover:text-[color:var(--foreground)]">DockDocs</a>
          <span>/</span>
          <span className="font-medium text-[color:var(--foreground)]">Chat with PDF</span>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-3xl">
          Chat with PDF
        </h1>
        <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
          Upload a PDF and ask questions about its content. The AI answers using only your document.
        </p>

        <div className="mt-8">
          <ChatWithPdfClient locale="en" />
        </div>

        {/* Citable facts block — concise declarative statements (distinct from the
            Q&A FAQ) that AI answer engines can lift directly. All true to the tool. */}
        <section className="mt-16 border-t border-[color:var(--line)] pt-10">
          <h2 className="text-base font-medium text-[color:var(--foreground)]">How Chat with PDF works</h2>
          <ul className="mt-6 space-y-3 text-sm leading-6 text-[color:var(--muted)]">
            <li>Chat with PDF reads your uploaded document and answers from its contents — each answer points back to the source page or passage it came from, so you can verify it.</li>
            <li>It works with text-based PDFs such as contracts, reports, research papers, manuals, and meeting notes. Scanned, image-only PDFs should be run through <a href="/ocr-pdf/" className="text-[color:var(--accent)] hover:underline">OCR</a> first.</li>
            <li>It is free to start with no account. Your document is processed only to generate your answers and then discarded — it is not stored long-term or used to train models.</li>
            <li>You can ask for a specific clause, a deadline, a number, a definition, or a plain-language summary of any section, then continue with follow-up questions.</li>
          </ul>
        </section>

        <section className="mt-12 border-t border-[color:var(--line)] pt-10">
          <h2 className="text-base font-medium text-[color:var(--foreground)]">Frequently Asked Questions</h2>
          <dl className="mt-6 space-y-5">
            {FAQ.map((item) => (
              <div key={item.question}>
                <dt className="text-sm font-medium text-[color:var(--foreground)]">{item.question}</dt>
                <dd className="mt-1 text-sm leading-6 text-[color:var(--muted)]">{item.answer}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-8 text-sm leading-6 text-[color:var(--muted)]">
            Need a one-shot overview instead of a conversation? Try{" "}
            <a href="/ai-summary/" className="text-[color:var(--accent)] hover:underline">AI Summary</a>
            . For OCR, summaries, and chat together, open the{" "}
            <a href="/ai-workspace/" className="text-[color:var(--accent)] hover:underline">AI Workspace</a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
