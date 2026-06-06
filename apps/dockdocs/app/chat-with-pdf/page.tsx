import type { Metadata } from "next";
import { ChatWithPdfClient } from "./ChatWithPdfClient";

export const metadata: Metadata = {
  title: "Chat with PDF — DockDocs",
  description: "Upload a PDF and ask grounded questions. AI-powered document chat.",
  alternates: { canonical: "/chat-with-pdf/" },
  robots: { index: true, follow: true },
};

export default function ChatWithPdfPage() {
  return (
    <main className="bg-[color:var(--surface)]">
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
