import type { Metadata } from "next";
import { ClassifyClient } from "@/components/ClassifyClient";

export const metadata: Metadata = {
  title: "Auto-Classify & Tag PDFs — Organize a Folder with AI | DockDocs",
  description:
    "Upload a pile of PDFs and let AI sort them into categories and tags — invoices, resumes, contracts, papers — so you can organize a folder in seconds.",
  keywords: ["classify pdf", "auto tag pdf", "organize pdfs", "ai document classification", "sort pdf files"],
};

export default function ClassifyPage() {
  return <ClassifyClient />;
}
