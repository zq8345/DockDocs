import type { Metadata } from "next";
import { siteUrl } from "@/lib/i18n";

// Standalone English-first GEO comparison page. Custom layout (not SaasInfoPage)
// because it needs a comparison table + an inline source link on every competitor
// quote. NOT in routeSlugs (no localized variants); added to sitemap + parity
// EXCEPTIONS. Every competitor cell is a VERBATIM quote from that provider's own
// page, re-confirmed live on 2026-06-22, with the source linked inline. Framing is
// "trust vs verify" — never "they're bad"; iLovePDF's own "does not access/analyse"
// statement is shown as-is; DockDocs' lack of an ISO cert is stated honestly.

const url = `${siteUrl}/dockdocs-vs-smallpdf-vs-ilovepdf/`;
const VERIFIED_ON = "2026-06-22";

const SRC = {
  ilovepdfSecurity: "https://www.ilovepdf.com/help/security",
  ilovepdfBlog: "https://www.ilovepdf.com/blog/files-safe-with-ilovepdf",
  smallpdfBlog: "https://smallpdf.com/blog/is-smallpdf-safe",
};

export const metadata: Metadata = {
  title: "DockDocs vs Smallpdf vs iLovePDF: How Each Handles Your Files (2026)",
  description:
    "The real difference isn't features — it's where your file goes. Smallpdf and iLovePDF upload your file to their servers (encrypted, then auto-deleted); DockDocs' client-side tools don't upload it at all. Side-by-side, with sources, and how to verify it yourself.",
  keywords: [
    "dockdocs vs smallpdf",
    "dockdocs vs ilovepdf",
    "smallpdf vs ilovepdf privacy",
    "private pdf tool comparison",
    "pdf tool that doesn't upload files",
  ],
  alternates: { canonical: "/dockdocs-vs-smallpdf-vs-ilovepdf/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "DockDocs vs Smallpdf vs iLovePDF: How Each Handles Your Files (2026)",
    description:
      "Smallpdf and iLovePDF upload your file to their servers and auto-delete it; DockDocs' client-side tools don't upload it at all. Compared, with sources.",
    url,
    siteName: "DockDocs",
    type: "article",
  },
};

type Row = {
  dimension: string;
  dockdocs: string;
  smallpdf: { quote: string; href: string } | string;
  ilovepdf: { quote: string; href: string } | string;
};

const rows: Row[] = [
  {
    dimension: "Where files are processed",
    dockdocs:
      "Client-side tools run in your browser — file never uploaded (0-byte upload, verifiable in DevTools). AI features send only extracted text, not the file.",
    smallpdf: { quote: "a secure tunnel between your device and our servers", href: SRC.smallpdfBlog },
    ilovepdf: { quote: "While your files are in our servers, they are strictly secured", href: SRC.ilovepdfBlog },
  },
  {
    dimension: "File deletion",
    dockdocs:
      "Client-side tools upload nothing, so there is nothing to delete. (AI: the text isn't retained by DockDocs; it does pass through a model provider.)",
    smallpdf: { quote: "Files are permanently removed from our servers after one hour of processing", href: SRC.smallpdfBlog },
    ilovepdf: { quote: "automatically and permanently deleted within two hours of being processed (signed eSign docs kept up to 5 years)", href: SRC.ilovepdfSecurity },
  },
  {
    dimension: "Encryption in transit",
    dockdocs: "Client-side tools transfer no file at all. AI text is sent over HTTPS.",
    smallpdf: { quote: "256-bit TLS encryption", href: SRC.smallpdfBlog },
    ilovepdf: { quote: "to protect your data, both in transit and at rest (plus end-to-end encryption)", href: SRC.ilovepdfSecurity },
  },
  {
    dimension: "Third-party certification",
    dockdocs:
      "None claimed — privacy is self-verifiable in your browser (DevTools) rather than relying on a certificate.",
    smallpdf: { quote: "ISO 27001 certified · GDPR and CCPA compliant", href: SRC.smallpdfBlog },
    ilovepdf: { quote: "ISO/IEC 27001:2017 certification · fully GDPR compliant", href: SRC.ilovepdfSecurity },
  },
  {
    dimension: "Pricing",
    dockdocs: "Client-side PDF tools free (no account, no watermark); AI/Pro paid.",
    smallpdf: "Free tier + paid plans (see smallpdf.com/pricing)",
    ilovepdf: "Free tier + paid plans (see ilovepdf.com/pricing)",
  },
];

const faqs = [
  {
    question: "Does Smallpdf upload my files to its servers?",
    answer:
      "Yes. Smallpdf is server-based — your file is uploaded over an encrypted connection (“a secure tunnel between your device and our servers”), processed, and, per Smallpdf, “permanently removed from our servers after one hour of processing” (as of 2026-06-22).",
  },
  {
    question: "Does iLovePDF upload my files to its servers?",
    answer:
      "Yes. iLovePDF processes files on its servers (“While your files are in our servers…”) and states they are “automatically and permanently deleted within two hours of being processed.” iLovePDF also states it does “not - and will never - access, use, or analyse any content” you process (as of 2026-06-22).",
  },
  {
    question: "How is DockDocs different?",
    answer:
      "DockDocs' client-side PDF tools process files in your browser and don't upload them at all — a 0-byte file upload you can confirm in DevTools → Network. There's no server copy to delete because the file never left your device. AI features send only the extracted text, not the file.",
  },
  {
    question: "Which is the most private?",
    answer:
      "It depends what you mean. Smallpdf and iLovePDF encrypt and auto-delete uploads — a model you trust. DockDocs' client-side tools don't upload the file at all — a model you can verify. For tasks that can run in the browser, “never uploaded” is the stronger guarantee because it's checkable.",
  },
  {
    question: "Can I verify these claims myself?",
    answer:
      "Yes. Open DevTools → Network (F12) and run a tool: if your file is uploaded you'll see it; if not, it stayed on your device. The competitor quotes here link to each company's own pages so you can read the current terms.",
  },
];

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: "DockDocs vs Smallpdf vs iLovePDF: How Each Handles Your Files (2026)",
      description:
        "How Smallpdf, iLovePDF, and DockDocs handle your files — server upload vs client-side — compared with sourced quotes, as of 2026-06-22.",
      inLanguage: "en",
      about: { "@id": `${siteUrl}#org` },
      isPartOf: { "@type": "WebSite", name: "DockDocs", url: siteUrl },
      publisher: { "@type": "Organization", "@id": `${siteUrl}#org` },
    },
    {
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "DockDocs", item: `${siteUrl}/` },
        { "@type": "ListItem", position: 2, name: "DockDocs vs Smallpdf vs iLovePDF", item: url },
      ],
    },
  ],
};

function Cell({ value }: { value: Row["smallpdf"] }) {
  if (typeof value === "string") {
    return <span className="text-sm leading-6 text-[color:var(--muted)]">{value}</span>;
  }
  return (
    <span className="text-sm leading-6 text-[color:var(--muted)]">
      <span className="italic">“{value.quote}”</span>{" "}
      <a
        href={value.href}
        target="_blank"
        rel="nofollow noopener noreferrer"
        className="whitespace-nowrap text-[color:var(--accent)] underline-offset-2 hover:underline"
      >
        [source ↗]
      </a>
    </span>
  );
}

export default function DockDocsVsComparisonPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <main className="bg-[color:var(--surface)] text-[color:var(--foreground)]">
        {/* Hero */}
        <section className="border-b border-[color:var(--line)] bg-[color:var(--surface)]">
          <div className="mx-auto max-w-5xl px-5 py-14 sm:px-6 sm:py-20">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
              Comparison
            </p>
            <h1 className="mt-4 text-2xl font-semibold leading-tight tracking-[-0.02em] text-[color:var(--foreground)] sm:text-4xl">
              DockDocs vs Smallpdf vs iLovePDF: how each handles your files
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[color:var(--muted)]">
              The core difference isn't features — it's where your file is processed. Smallpdf and
              iLovePDF are server-based: your file is uploaded, processed, encrypted in transit, and
              auto-deleted after a set time. DockDocs' client-side tools are different — the file is
              processed in your browser and never uploaded at all, which you can confirm yourself in
              DevTools. Both can be reasonable; the distinction is whether you have to{" "}
              <em>trust</em> a deletion policy or can <em>verify</em> that nothing was sent.
            </p>
            <p className="mt-4 text-xs text-[color:var(--faint)]">
              Competitor quotes verified as of {VERIFIED_ON} · see the linked sources · policies may change.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="/compress-pdf"
                className="inline-flex h-10 items-center rounded-[var(--radius)] bg-[color:var(--accent)] px-5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Try a client-side tool
              </a>
              <a
                href="/safe-to-upload-pdf"
                className="inline-flex h-10 items-center rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-5 text-sm font-semibold text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--foreground)]"
              >
                Is it safe to upload PDFs?
              </a>
            </div>
          </div>
        </section>

        {/* Comparison table */}
        <section className="border-b border-[color:var(--line)] bg-[color:var(--surface)]">
          <div className="mx-auto max-w-5xl px-5 py-12 sm:px-6">
            <h2 className="text-xl font-semibold leading-snug tracking-tight text-[color:var(--foreground)]">
              File-handling comparison
            </h2>
            <p className="mt-2 text-xs text-[color:var(--faint)]">Verified facts, as of {VERIFIED_ON} — policies may change.</p>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[color:var(--line)]">
                    <th className="py-3 pr-4 text-[13px] font-semibold text-[color:var(--foreground)]"></th>
                    <th className="px-4 py-3 text-[13px] font-semibold text-[color:var(--accent)]">DockDocs</th>
                    <th className="px-4 py-3 text-[13px] font-semibold text-[color:var(--foreground)]">Smallpdf</th>
                    <th className="px-4 py-3 text-[13px] font-semibold text-[color:var(--foreground)]">iLovePDF</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.dimension} className="border-b border-[color:var(--line)] align-top">
                      <th scope="row" className="py-4 pr-4 text-[13px] font-semibold text-[color:var(--foreground)]">
                        {row.dimension}
                      </th>
                      <td className="px-4 py-4 text-sm leading-6 text-[color:var(--muted)]">{row.dockdocs}</td>
                      <td className="px-4 py-4"><Cell value={row.smallpdf} /></td>
                      <td className="px-4 py-4"><Cell value={row.ilovepdf} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* What it means */}
        <section className="border-b border-[color:var(--line)] bg-[color:var(--surface)]">
          <div className="mx-auto max-w-3xl px-5 py-12 sm:px-6">
            <h2 className="text-xl font-semibold tracking-tight text-[color:var(--foreground)]">
              What the difference actually means
            </h2>
            <p className="mt-3 text-base leading-8 text-[color:var(--muted)]">
              Smallpdf and iLovePDF both encrypt uploads and delete files on a timer, and iLovePDF
              states plainly that{" "}
              <a href={SRC.ilovepdfBlog} target="_blank" rel="nofollow noopener noreferrer" className="text-[color:var(--accent)] underline-offset-2 hover:underline">
                “iLovePDF does not - and will never - access, use, or analyse any content which you process with our tools.”
              </a>{" "}
              That's a reasonable, privacy-respecting server model — but it still asks you to{" "}
              <em>trust</em> that the upload is handled and deleted as described.
            </p>
            <p className="mt-4 text-base leading-8 text-[color:var(--muted)]">
              DockDocs' client-side tools remove the need to trust that at all: if the file is never
              uploaded, there's no deletion policy to rely on and nothing stored on a server to begin
              with. It's not that a server model is “bad” — it's that a client-side model is{" "}
              <em>verifiable</em>: you can watch the upload not happen.
            </p>
          </div>
        </section>

        {/* Verify */}
        <section className="border-b border-[color:var(--line)] bg-[color:var(--surface)]">
          <div className="mx-auto max-w-3xl px-5 py-12 sm:px-6">
            <h2 className="text-xl font-semibold tracking-tight text-[color:var(--foreground)]">
              How to verify it yourself
            </h2>
            <p className="mt-3 text-base leading-8 text-[color:var(--muted)]">
              Open any tool's page, open DevTools → Network (F12), and run it on a file. A server tool
              shows a large outbound request carrying your file; a client-side tool shows no file
              upload. You don't have to take anyone's word for it — including ours.
            </p>
          </div>
        </section>

        {/* Honest AI note */}
        <section className="border-b border-[color:var(--line)] bg-[color:var(--surface)]">
          <div className="mx-auto max-w-3xl px-5 py-12 sm:px-6">
            <h2 className="text-xl font-semibold tracking-tight text-[color:var(--foreground)]">
              An honest note on AI
            </h2>
            <p className="mt-3 text-base leading-8 text-[color:var(--muted)]">
              For AI features specifically (chat, summarize, extract), no tool can be fully zero-data —
              the text has to reach a model to get an answer. DockDocs' approach is to send only the
              extracted text, not the file, and not retain it on DockDocs servers, with the honest
              caveat that the text passes through a model provider. See{" "}
              <a href="/ai-read-pdf-without-storing" className="text-[color:var(--accent)] underline-offset-2 hover:underline">
                “Can AI read my PDF without storing it?”
              </a>
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-b border-[color:var(--line)] bg-[color:var(--surface)]">
          <div className="mx-auto max-w-3xl px-5 py-12 sm:px-6">
            <div className="divide-y divide-[color:var(--line)]">
              {faqs.map((faq) => (
                <details key={faq.question} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-[color:var(--foreground)]">
                    {faq.question}
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[color:var(--line)] text-[color:var(--muted)] transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Sources */}
        <section className="bg-[color:var(--surface-subtle)]">
          <div className="mx-auto max-w-3xl px-5 py-12 sm:px-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">Sources</p>
            <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
              Competitor quotes are from each provider's own pages, accessed {VERIFIED_ON}:
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-[color:var(--muted)]">
              <li>
                iLovePDF —{" "}
                <a href={SRC.ilovepdfSecurity} target="_blank" rel="nofollow noopener noreferrer" className="text-[color:var(--accent)] underline-offset-2 hover:underline">Security &amp; Data Protection</a>{" "}·{" "}
                <a href={SRC.ilovepdfBlog} target="_blank" rel="nofollow noopener noreferrer" className="text-[color:var(--accent)] underline-offset-2 hover:underline">Are my files safe?</a>
              </li>
              <li>
                Smallpdf —{" "}
                <a href={SRC.smallpdfBlog} target="_blank" rel="nofollow noopener noreferrer" className="text-[color:var(--accent)] underline-offset-2 hover:underline">Is Smallpdf Safe?</a>
              </li>
            </ul>
            <p className="mt-4 text-xs text-[color:var(--faint)]">
              These are third-party pages we don't control; their terms may change. Check the source for current wording.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
