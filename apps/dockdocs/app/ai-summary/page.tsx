import { RelatedTools } from "@/components/RelatedTools";
import { UploadPanel } from "@/components/UploadPanel";
import { ToolRuntimeClient } from "@/components/ToolRuntimeClient";
import { getRuntimeCopy, type RuntimeLocale } from "@/lib/copy";

function AiSummaryPageContent({ locale = "en" }: { locale?: RuntimeLocale }) {
  const copy = getRuntimeCopy(locale);
  const page = copy.summary;

  return (
    <main>
      <section className="border-b border-[color:var(--line)]">
        <div className="mx-auto grid min-h-[calc(100vh-92px)] max-w-7xl items-center gap-8 px-5 py-10 sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
              {page.eyebrow}
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl xl:text-6xl">
              {page.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--muted)] sm:text-lg">
              {page.description}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#upload"
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-[color:var(--accent)] px-5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                {page.primaryCta}
              </a>
              <a
                href="/chat-with-pdf"
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-[color:var(--line)] px-5 text-sm font-semibold transition hover:border-[color:var(--foreground)]"
              >
                {page.secondaryCta}
              </a>
            </div>
          </div>
          <UploadPanel
            title={page.uploadTitle}
            description={page.uploadDescription}
            formats={page.formats}
            limit={page.limit}
            cta={page.cta}
            interactive={false}
            labels={copy.common.upload}
          />
        </div>
      </section>

      <section
        id="upload"
        className="border-b border-[color:var(--line)] px-5 py-16 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
              {page.outputEyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
              {page.outputHeading}
            </h2>
            <p className="mt-5 leading-7 text-[color:var(--muted)]">
              {page.outputDescription}
            </p>
          </div>
          <div className="mt-8">
            <ToolRuntimeClient
              uploadTitle={page.runtimeUploadTitle}
              uploadDescription={page.runtimeUploadDescription}
              formats={page.formats}
              limit={page.limit}
              cta={page.cta}
              accept="application/pdf,.pdf,.doc,.docx"
              allowedExtensions={[".pdf", ".doc", ".docx"]}
              outputEyebrow={page.resultEyebrow}
              outputTitle={page.resultTitle}
              outputSummary={page.resultSummary}
              keyPoints={[...page.keyPoints]}
              actions={[...page.actions]}
              emptyMessage={page.emptyMessage}
              locale={locale}
            />
          </div>
        </div>
      </section>
      <RelatedTools />
    </main>
  );
}

export default function AiSummaryPage() {
  return <AiSummaryPageContent />;
}
