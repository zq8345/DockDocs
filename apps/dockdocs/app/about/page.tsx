import type { Metadata } from "next";
import { AboutPage } from "@/components/AboutPage";

export const metadata: Metadata = {
  title: "About DockDocs",
  description:
    "DockDocs is a privacy-first AI document platform with 20+ PDF tools, AI chat, OCR, and document workflows — built for teams, students, and professionals worldwide.",
  alternates: {
    canonical: "/about/",
    languages: { zh: "/zh/about/" },
  },
  robots: { index: true, follow: true },
};

export default function AboutPageRoute() {
  return <AboutPage locale="en" />;
}
