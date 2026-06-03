import type { Metadata } from "next";
import { CommercialAccountClient } from "@/components/CommercialAccountClient";

export const metadata: Metadata = {
  title: "Account",
  description:
    "Create a DockDocs account, sign in with Netlify Identity, and bind workspace records to your user.",
  alternates: {
    canonical: "/account/",
  },
};

export default function AccountPage() {
  return (
    <main>
      <section className="border-b border-[color:var(--line)] bg-[color:var(--surface)] px-5 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
            Account
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
            Register, sign in, and keep workspace data scoped to your account.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--muted)] sm:text-base">
            DockDocs uses Netlify Identity for Google and Email login. Signed-in
            workspace data is stored by account ID, anonymous data stays local to
            this browser, and original PDF files are not saved by the account
            layer.
          </p>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <CommercialAccountClient />
        </div>
      </section>
    </main>
  );
}
