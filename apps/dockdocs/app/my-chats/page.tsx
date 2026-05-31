import type { Metadata } from "next";
import { MyChatsClient } from "@/components/MyChatsClient";

export const metadata: Metadata = {
  title: "My Chats | DockDocs",
  description:
    "View saved Chat with PDF conversations and uploaded document metadata in DockDocs.",
  alternates: {
    canonical: "/my-chats/",
  },
};

export default function MyChatsPage() {
  return (
    <main>
      <section className="border-b border-[color:var(--line)] px-5 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
            My Chats
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
            Saved Chat with PDF history.
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-[color:var(--muted)]">
            Signed-in users can keep chat history and uploaded document metadata
            for later review. Original PDF files are not stored.
          </p>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <MyChatsClient />
        </div>
      </section>
    </main>
  );
}
