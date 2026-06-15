import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n";
import { ChatWithPdfClient } from "./ChatWithPdfClient";

export const metadata: Metadata = {
  title: "Chat with PDF — AI Q&A with Your Documents",
  description: "Chat with any PDF or document and get answers that cite the source — upload a file, ask questions, and let AI read it for you. Free, in your browser.",
  keywords: ["chat with pdf", "chat with documents", "ai pdf chat", "ask pdf questions", "chat with document"],
  alternates: { canonical: "/chat-with-pdf/", languages: languageAlternates("chat-with-pdf") },
  robots: { index: true, follow: true },
};

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
      </div>
    </main>
  );
}
