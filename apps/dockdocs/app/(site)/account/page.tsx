import type { Metadata } from "next";
import { AccountClient } from "@/components/AccountClient";
import { LAYOUT } from "@/lib/layout-constants";

export const metadata: Metadata = {
  title: "Account",
  description:
    "Sign in to DockDocs with Google. Access your workspace, manage billing, and track document usage.",
  alternates: {
    canonical: "/account/",
  },
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <div className={`mx-auto ${LAYOUT.content} px-5 py-20 sm:py-28`}>
      <div className="mx-auto max-w-md">
        <AccountClient />
      </div>
    </div>
  );
}
