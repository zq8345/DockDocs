import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n";
import { QuizClient } from "@/components/QuizClient";

export const metadata: Metadata = {
  title: "PDF Flashcard Maker — Study Cards from Any PDF",
  description:
    "Turn a textbook chapter, lecture notes, or manual into study flashcards with AI — questions and answers are drawn only from your document. Flip a card to check yourself.",
  keywords: ["pdf flashcards", "flashcard maker", "create flashcards from pdf", "study cards", "ai flashcards"],
  alternates: {
    canonical: "/flashcards/",
    languages: languageAlternates("flashcards"),
  },
};

export default function FlashcardsPage() {
  return <QuizClient />;
}
