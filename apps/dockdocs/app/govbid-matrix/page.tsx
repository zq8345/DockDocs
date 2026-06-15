import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n";
import { GovbidMatrixClient } from "@/components/GovbidMatrixClient";

export const metadata: Metadata = {
  title: "Government Bid Compliance Matrix — Extract Every Shall/Must Requirement",
  description:
    "Upload an RFP or government solicitation and get every mandatory 'shall/must' requirement extracted into a numbered compliance matrix with section references and page numbers. Export to CSV.",
  keywords: [
    "government bid compliance",
    "RFP requirements extraction",
    "solicitation compliance matrix",
    "shall must requirements tracker",
    "government contractor tool",
    "FAR compliance checker",
  ],
  alternates: {
    canonical: "/govbid-matrix/",
    languages: languageAlternates("govbid-matrix"),
  },
};

export default function GovbidMatrixPage() {
  return <GovbidMatrixClient />;
}
