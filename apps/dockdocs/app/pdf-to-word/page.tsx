import { RelatedTools } from "@/components/RelatedTools";
import { UploadPanel } from "@/components/UploadPanel";
import { ToolRuntimeClient } from "@/components/ToolRuntimeClient";

export default function PdfToWordPage() {
  return (
    <main>
      <section className="border-b border-[color:var(--line)]">
        <div className="mx-auto grid min-h-[calc(100vh-92px)] max-w-7xl items-center gap-8 px-5 py-10 sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
              Convert
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl xl:text-6xl">
              Convert PDFs into editable Word-ready documents.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--muted)] sm:text-lg">
              Keep conversion inside the same AI document platform, with upload
              limits, output status, and next actions in one place.
            </p>
          </div>
          <UploadPanel
            title="Upload PDF to convert"
            description="Drop a PDF here to prepare a Word conversion workflow without changing the backend provider logic."
            formats="PDF"
            limit="Up to 25 MB"
            cta="Select PDF"
            interactive={false}
          />
        </div>
      </section>

      <section className="border-b border-[color:var(--line)] px-5 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
              Output
            </p>
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
              Conversion output should explain what happened.
            </h2>
            <p className="mt-5 leading-7 text-[color:var(--muted)]">
              The UI sets expectations around editable content, layout review,
              and follow-up document actions.
            </p>
          </div>
          <div className="mt-8">
            <ToolRuntimeClient
              uploadTitle="Runtime-bound conversion upload"
              uploadDescription="Select a PDF to verify conversion upload, processing, success, and error UI states without changing provider logic."
              formats="PDF"
              limit="Up to 25 MB"
              cta="Select PDF"
              accept="application/pdf,.pdf"
              allowedExtensions={[".pdf"]}
              outputEyebrow="Word Output"
              outputTitle="Editable document ready"
              outputSummary="The converted document is ready for review, with layout notes and follow-up actions surfaced next to the result."
              keyPoints={[
                "Text content is prepared for editing.",
                "Layout review remains visible before handoff.",
                "Users can continue with summary or chat workflows.",
              ]}
              actions={["Download DOCX", "Review layout notes", "Run AI Summary"]}
              emptyMessage="Select a PDF to generate a Word output preview."
            />
          </div>
        </div>
      </section>
      <RelatedTools />
    </main>
  );
}
