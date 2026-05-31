import { RelatedTools } from "@/components/RelatedTools";
import { UploadPanel } from "@/components/UploadPanel";
import { ToolRuntimeClient } from "@/components/ToolRuntimeClient";

export default function AiSummaryPage() {
  return (
    <main>
      <section className="border-b border-[color:var(--line)]">
        <div className="mx-auto grid min-h-[calc(100vh-92px)] max-w-7xl items-center gap-8 px-5 py-10 sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
              AI
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl xl:text-6xl">
              Summarize documents into decisions and next actions.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--muted)] sm:text-lg">
              Turn long PDFs and office files into a reviewable AI output:
              summary, key points, entities, and suggested next steps.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#upload"
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-[color:var(--accent)] px-5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Upload document
              </a>
              <a
                href="/chat-with-pdf"
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-[color:var(--line)] px-5 text-sm font-semibold transition hover:border-[color:var(--foreground)]"
              >
                Start chat
              </a>
            </div>
          </div>
          <UploadPanel
            title="Upload for AI Summary"
            description="Drop a document here to prepare an AI summary workflow with visible limits and status states."
            formats="PDF, DOC, DOCX"
            limit="Up to 25 MB"
            cta="Select document"
            interactive={false}
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
              Result
            </p>
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
              Summary output that invites review and follow-up.
            </h2>
            <p className="mt-5 leading-7 text-[color:var(--muted)]">
              The result view prioritizes readable AI output over a simple
              success state, keeping the next workflow one click away.
            </p>
          </div>
          <div className="mt-8">
            <ToolRuntimeClient
              uploadTitle="Runtime-bound summary upload"
              uploadDescription="Select a document to verify summary empty, selected, processing, success, and error UI states."
              formats="PDF, DOC, DOCX"
              limit="Up to 25 MB"
              cta="Select document"
              accept="application/pdf,.pdf,.doc,.docx"
              allowedExtensions={[".pdf", ".doc", ".docx"]}
              outputEyebrow="AI Summary"
              outputTitle="Board report summary"
              outputSummary="Revenue increased in the latest quarter, but customer support volume and vendor renewal risk need follow-up before the next operating review."
              keyPoints={[
                "Support volume increased across enterprise accounts.",
                "Two vendor renewals need owner confirmation.",
                "Budget decisions are blocked by missing finance inputs.",
              ]}
              actions={["Copy summary", "Download brief", "Ask follow-up questions"]}
              emptyMessage="Select a document to generate a summary preview."
            />
          </div>
        </div>
      </section>
      <RelatedTools />
    </main>
  );
}
