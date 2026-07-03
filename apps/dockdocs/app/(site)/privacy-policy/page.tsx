import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n";
import { webPageSchema } from "@/lib/page-schema";

export const metadata: Metadata = {
  title: "Privacy Policy | DockDocs",
  description:
    "How DockDocs handles your files and data — every statement can be verified in your browser's developer tools.",
  alternates: {
    canonical: "/privacy-policy/",
    languages: languageAlternates("privacy-policy"),
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-20 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            webPageSchema("en", "privacy-policy", "Privacy Policy")
          ),
        }}
      />
      <p className="text-xs font-mono tracking-widest uppercase text-[color:var(--faint)] mb-4">
        Privacy Policy
      </p>
      <h1 className="text-3xl font-semibold mb-2">Privacy Policy</h1>
      <p className="text-sm text-[color:var(--muted)] mb-10">
        Effective date: July 3, 2026 &middot; Operated by{" "}
        <strong>Dock Group Limited</strong>
      </p>
      <p className="leading-7 text-[color:var(--muted)] mb-10">
        DockDocs (&ldquo;we&rdquo;) is operated by{" "}
        <strong>Dock Group Limited</strong>. This policy describes exactly what
        happens to your files and data &mdash; every statement below can be
        verified in your browser&apos;s developer tools (F12 &rarr; Network).
      </p>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">1. Your files</h2>
        <p className="leading-7 text-[color:var(--muted)] mb-4">
          <strong className="text-[color:var(--foreground)]">
            Most tools process files entirely in your browser.
          </strong>{" "}
          For the tools marked with the &ldquo;runs locally&rdquo; badge
          (compress, merge, split, rotate, watermark, redact, sign, protect,
          OCR, and others), your file never leaves your device. No upload takes
          place.
        </p>
        <p className="leading-7 text-[color:var(--muted)] mb-4">
          <strong className="text-[color:var(--foreground)]">
            Eight conversion tools use a third-party conversion service.
          </strong>{" "}
          Word/Excel/PowerPoint/HTML &rarr; PDF, PDF &rarr;
          Word/Excel/PowerPoint, and PDF/A conversion upload your file to
          CloudConvert (CloudConvert GmbH, Germany) for processing. Files are
          transferred over TLS, processed, and automatically deleted by
          CloudConvert according to their retention policy (typically within 24
          hours). We do not keep a copy of your file on our own servers at any
          point.
        </p>
        <p className="leading-7 text-[color:var(--muted)]">
          <strong className="text-[color:var(--foreground)]">
            AI analysis tools send extracted text &mdash; not your file &mdash;
            to AI models.
          </strong>{" "}
          When you use Chat with PDF, AI Summary, contract risk review, and
          similar tools, the text content of your document (extracted in your
          browser) is sent to AI models via OpenRouter for processing. We do not
          store your document text on our servers. AI responses are generated
          per request; we do not use your documents to train models.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">
          2. Data stored in your browser
        </h2>
        <p className="leading-7 text-[color:var(--muted)]">
          Chat history and document excerpts for the AI tools are saved{" "}
          <strong className="text-[color:var(--foreground)]">
            locally in your browser (localStorage)
          </strong>{" "}
          so you can revisit them &mdash; they are never uploaded to our
          servers. You can delete them at any time from the workspace, or by
          clearing your browser storage. If you use a shared computer, we
          recommend clearing them after use.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">3. Account data</h2>
        <p className="leading-7 text-[color:var(--muted)]">
          If you create an account, we store your email address and
          authentication identity via Supabase (our authentication and database
          provider). We use it to sign you in, associate your plan, and enforce
          usage limits. We do not sell or share your email with anyone.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">4. Payments</h2>
        <p className="leading-7 text-[color:var(--muted)]">
          Payments are processed by Creem (merchant of record). Your card
          number is entered on and processed by Creem &mdash; we never see or
          store it. We receive only your subscription status and a customer
          reference.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">5. Analytics</h2>
        <p className="leading-7 text-[color:var(--muted)]">
          We use self-hosted umami analytics (running on our own server) to
          count page views. It is cookie-free and does not build cross-site
          profiles. We do not use Google Analytics or advertising trackers.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">6. Sub-processors</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[color:var(--line)]">
                <th className="text-left py-2 pr-6 font-semibold text-[color:var(--foreground)]">
                  Provider
                </th>
                <th className="text-left py-2 pr-6 font-semibold text-[color:var(--foreground)]">
                  Purpose
                </th>
                <th className="text-left py-2 font-semibold text-[color:var(--foreground)]">
                  Data involved
                </th>
              </tr>
            </thead>
            <tbody className="text-[color:var(--muted)]">
              <tr className="border-b border-[color:var(--line)]">
                <td className="py-2 pr-6">CloudConvert GmbH</td>
                <td className="py-2 pr-6">File conversion (8 tools)</td>
                <td className="py-2">
                  The file you convert (auto-deleted after processing)
                </td>
              </tr>
              <tr className="border-b border-[color:var(--line)]">
                <td className="py-2 pr-6">OpenRouter, Inc.</td>
                <td className="py-2 pr-6">AI model routing</td>
                <td className="py-2">
                  Extracted document text for AI tools
                </td>
              </tr>
              <tr className="border-b border-[color:var(--line)]">
                <td className="py-2 pr-6">Supabase</td>
                <td className="py-2 pr-6">Authentication &amp; account data</td>
                <td className="py-2">Email, auth identity, plan status</td>
              </tr>
              <tr className="border-b border-[color:var(--line)]">
                <td className="py-2 pr-6">Creem</td>
                <td className="py-2 pr-6">Payments</td>
                <td className="py-2">
                  Payment details (handled entirely by Creem)
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-6">Netlify</td>
                <td className="py-2 pr-6">Hosting</td>
                <td className="py-2">
                  Standard server logs (IP, user agent)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">7. Your rights</h2>
        <p className="leading-7 text-[color:var(--muted)]">
          You can delete your account and associated data at any time from your
          account page (this also removes billing records we control). For any
          privacy request or question, contact{" "}
          <a
            href="mailto:hello@dockdocs.app"
            className="text-[color:var(--accent)] hover:underline"
          >
            hello@dockdocs.app
          </a>
          . If you are in the EEA/UK, you have the rights provided by the GDPR
          (access, rectification, erasure, portability, objection); if in
          California, the rights provided by the CCPA.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">8. Changes</h2>
        <p className="leading-7 text-[color:var(--muted)]">
          We will update this page when our data practices change, and note the
          effective date above.
        </p>
      </section>
    </main>
  );
}
