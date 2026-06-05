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
    <div className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
      <h1 className="text-[28px] font-semibold tracking-[-0.014em]">Chat with PDF</h1>
      <p className="mt-2 text-[14px] leading-relaxed text-[color:var(--muted)]">
        Upload a PDF and ask questions about its content. AI reads the document with you.
      </p>
      <div className="mt-8">
        <ChatWithPdfClient locale="en" />
      </div>
    </div>
  );
}
