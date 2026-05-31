import { RelatedTools } from "@/components/RelatedTools";
import { UploadPanel } from "@/components/UploadPanel";
import { ToolRuntimeClient } from "@/components/ToolRuntimeClient";

export default function OcrPage() {
  return (
    <main>
      <section className="border-b border-[color:var(--line)]">
        <div className="mx-auto grid min-h-[calc(100vh-92px)] max-w-7xl items-center gap-8 px-5 py-10 sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
              AI
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl xl:text-6xl">
              Make scanned documents searchable and AI-ready.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--muted)] sm:text-lg">
              Prepare scanned PDFs for downstream AI workflows with a clean OCR
              upload, processing, and output interface.
            </p>
          </div>
          <UploadPanel
            title="Upload scanned PDF"
            description="Drop a scan or PDF here to prepare OCR extraction. The UI shows supported files, limits, and processing state."
            formats="PDF, PNG, JPG"
            limit="Up to 25 MB"
            cta="Select scan"
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
              OCR output belongs in the workspace, not in a hidden file.
            </h2>
            <p className="mt-5 leading-7 text-[color:var(--muted)]">
              Text extraction, confidence, and next AI actions are shown
              together so users understand what is ready.
            </p>
          </div>
          <div className="mt-8">
            <ToolRuntimeClient
              uploadTitle="Runtime-bound OCR upload"
              uploadDescription="Select a scanned PDF or image to verify OCR upload, processing, output, and error UI states."
              formats="PDF, PNG, JPG"
              limit="Up to 25 MB"
              cta="Select scan"
              accept="application/pdf,.pdf,image/png,.png,image/jpeg,.jpg,.jpeg"
              allowedExtensions={[".pdf", ".png", ".jpg", ".jpeg"]}
              outputEyebrow="OCR Text"
              outputTitle="Extracted text preview"
              outputSummary="The document is ready for review. Low-confidence sections are called out before summary or chat workflows continue."
              keyPoints={[
                "Selectable text extracted from scanned pages.",
                "Low-confidence areas stay visible for review.",
                "Output can continue into Chat with PDF or AI Summary.",
              ]}
              actions={["Copy extracted text", "Download text file", "Summarize document"]}
              emptyMessage="Select a scanned document to generate OCR output."
            />
          </div>
        </div>
      </section>
      <RelatedTools />
    </main>
  );
}
