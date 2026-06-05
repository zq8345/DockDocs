import type { Context } from "@netlify/functions";

declare const Netlify: {
  env: {
    get(name: string): string | undefined;
  };
};

// ---------------------------------------------------------------------------
// Supported conversion routes
// ---------------------------------------------------------------------------
const SUPPORTED_CONVERSIONS = {
  "word-to-pdf": { inputFormat: "docx", outputFormat: "pdf", outputMime: "application/pdf", outputExt: "pdf" },
  "ppt-to-pdf": { inputFormat: "pptx", outputFormat: "pdf", outputMime: "application/pdf", outputExt: "pdf" },
  "excel-to-pdf": { inputFormat: "xlsx", outputFormat: "pdf", outputMime: "application/pdf", outputExt: "pdf" },
  "pdf-to-excel": { inputFormat: "pdf", outputFormat: "xlsx", outputMime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", outputExt: "xlsx" },
} as const;

type ConversionRoute = keyof typeof SUPPORTED_CONVERSIONS;

const MAX_FILE_BYTES = 6 * 1024 * 1024; // 6 MB — Netlify buffered function body limit
const CLOUDCONVERT_API = "https://api.cloudconvert.com/v2";

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") {
    return json({ ok: false, code: "METHOD_NOT_ALLOWED", message: "Use POST." }, 405);
  }

  const apiKey = Netlify.env.get("CLOUDCONVERT_API_KEY")?.trim();
  if (!apiKey) {
    return json({
      ok: false,
      code: "NOT_CONFIGURED",
      message: "CloudConvert API key is not configured. Set CLOUDCONVERT_API_KEY in Netlify environment variables.",
    }, 503);
  }

  // Parse form
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return json({ ok: false, code: "INVALID_FORM", message: "Could not parse form data." }, 400);
  }

  const route = (formData.get("route") as string | null)?.trim() as ConversionRoute | null;
  if (!route || !(route in SUPPORTED_CONVERSIONS)) {
    return json({
      ok: false,
      code: "INVALID_ROUTE",
      message: `Route must be one of: ${Object.keys(SUPPORTED_CONVERSIONS).join(", ")}`,
    }, 400);
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return json({ ok: false, code: "NO_FILE", message: "No file uploaded." }, 400);
  }

  if (file.size > MAX_FILE_BYTES) {
    return json({
      ok: false,
      code: "FILE_TOO_LARGE",
      message: `File size limit is 6 MB. Uploaded file is ${Math.round(file.size / 1024 / 1024 * 10) / 10} MB.`,
    }, 413);
  }

  const { inputFormat, outputFormat, outputMime, outputExt } = SUPPORTED_CONVERSIONS[route];

  try {
    // 1. Create a job with upload + convert + export tasks
    const jobRes = await fetch(`${CLOUDCONVERT_API}/jobs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tasks: {
          "upload-file": {
            operation: "import/upload",
          },
          "convert-file": {
            operation: "convert",
            input: "upload-file",
            input_format: inputFormat,
            output_format: outputFormat,
            ...(outputFormat === "pdf" ? { pdf_a: false, optimize_print: false } : {}),
          },
          "export-file": {
            operation: "export/url",
            input: "convert-file",
            inline: false,
            archive_multiple_files: false,
          },
        },
      }),
    });

    if (!jobRes.ok) {
      return json({ ok: false, code: "JOB_CREATE_FAILED", message: "The conversion service could not process this file right now. Try again in a moment." }, 502);
    }

    const job = await jobRes.json() as CloudConvertJob;
    const uploadTask = job.data.tasks.find((t) => t.name === "upload-file");

    if (!uploadTask?.result?.form) {
      return json({ ok: false, code: "UPLOAD_TASK_MISSING", message: "CloudConvert did not return an upload form." }, 502);
    }

    // 2. Upload the file to CloudConvert's S3 endpoint
    const uploadForm = new FormData();
    for (const [k, v] of Object.entries(uploadTask.result.form.parameters)) {
      uploadForm.append(k, v as string);
    }
    uploadForm.append("file", file, file.name || `source.${inputFormat}`);

    const uploadRes = await fetch(uploadTask.result.form.url, {
      method: "POST",
      body: uploadForm,
    });

    if (!uploadRes.ok && uploadRes.status !== 204) {
      return json({ ok: false, code: "UPLOAD_FAILED", message: "The file upload could not be completed. Check your connection and try again." }, 502);
    }

    // 3. Poll for job completion
    const jobId = job.data.id;
    let exportUrl: string | null = null;
    const startTime = Date.now();
    const TIMEOUT_MS = 55_000; // Netlify function limit is 60s
    const POLL_INTERVAL_MS = 1500;

    while (Date.now() - startTime < TIMEOUT_MS) {
      await sleep(POLL_INTERVAL_MS);

      const statusRes = await fetch(`${CLOUDCONVERT_API}/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      if (!statusRes.ok) continue;

      const statusData = await statusRes.json() as CloudConvertJob;
      const jobStatus = statusData.data.status;

      if (jobStatus === "error") {
        const failedTask = statusData.data.tasks.find((t) => t.status === "error");
        return json({
          ok: false,
          code: "CONVERSION_FAILED",
          message: "The file could not be converted. The format may not be supported or the file may be corrupted.",
        }, 422);
      }

      if (jobStatus === "finished") {
        const exportTask = statusData.data.tasks.find((t) => t.name === "export-file");
        exportUrl = exportTask?.result?.files?.[0]?.url ?? null;
        break;
      }
    }

    if (!exportUrl) {
      return json({ ok: false, code: "TIMEOUT", message: "Conversion timed out. Please try a smaller file." }, 504);
    }

    // 4. Download the converted file and stream it back
    const downloadRes = await fetch(exportUrl);
    if (!downloadRes.ok) {
      return json({ ok: false, code: "DOWNLOAD_FAILED", message: "Could not download converted file from CloudConvert." }, 502);
    }

    const fileBytes = await downloadRes.arrayBuffer();
    const baseName = file.name.replace(/\.[^.]+$/, "");
    const outputFileName = `${baseName}.${outputExt}`;

    return new Response(fileBytes, {
      status: 200,
      headers: {
        "Content-Type": outputMime,
        "Content-Disposition": `attachment; filename="${outputFileName}"`,
        "Content-Length": String(fileBytes.byteLength),
        "X-DockDocs-Route": route,
      },
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return json({ ok: false, code: "INTERNAL_ERROR", message }, 500);
  }
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface CloudConvertJob {
  data: {
    id: string;
    status: "waiting" | "processing" | "finished" | "error";
    tasks: CloudConvertTask[];
  };
}

interface CloudConvertTask {
  name: string;
  status: "waiting" | "processing" | "finished" | "error";
  message?: string;
  result?: {
    form?: {
      url: string;
      parameters: Record<string, unknown>;
    };
    files?: Array<{ url: string; filename: string }>;
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const config = {
  path: "/api/cloudconvert-convert",
};
