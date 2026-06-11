import type { Metadata } from "next";
import { MyChatsClient } from "@/components/MyChatsClient";

export const metadata: Metadata = {
  title: "My Chats — DockDocs",
  description:
    "View saved Chat with PDF conversations and uploaded document metadata in DockDocs.",
  alternates: {
    canonical: "/my-chats/",
  },
};

export default function MyChatsPage() {
  return <MyChatsClient locale="en" />;
}
