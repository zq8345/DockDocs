import type { Context } from "@netlify/functions";
import { enforceFeatureGate } from "./_shared/feature-gate";

declare const Netlify: {
  env: {
    get(name: string): string | undefined;
  };
};

// ---------------------------------------------------------------------------
// Supported conversion routes
// ---------------------------------------------------------------------------
const SUPPORTED_CONVERSIONS = {
  "word-to-pdf": { inputFormat: "docx", outputFormat: "pdf", outputExt: "pdf" },
  "ppt-to-pdf": { inputFormat: "pptx", outputFormat: "pdf", outputExt: "pdf" },
  "excel-to-pdf": { inputFormat: "xlsx", outputFormat: "pdf", outputExt: "pdf" },
  "pdf-to-excel": { inputFormat: "pdf", outputFormat: "xlsx", outputExt: "xlsx" },
  "pdf-to-word": { inputFormat: "pdf", outputFormat: "docx", outputExt: "docx" },
  "html-to-pdf": { inputFormat: "html", outputFormat: "pdf", outputExt: "pdf" },
  "pdf-to-ppt": { inputFormat: "pdf", outputFormat: "pptx", outputExt: "pptx" },
  "pdf-to-pdfa": { inputFormat: "pdf", outputFormat: "pdf", outputExt: "pdf" },
} as const;

type ConversionRoute = keyof typeof SUPPORTED_CONVERSIONS;

const ENCRYPT_ROUTE = "protect-pdf";
const CLOUDCONVERT_API = "https://api.cloudconvert.com/v2";

// Map a failed CloudConvert /jobs status to a clearer, user-safe reason.
function cloudConvertFailMessage(status: number): string {
  if (status === 401 || status === 403) return "The conversion service rejected the request (the API key may be invalid or expired).";
  if (status === 402 || status === 429) return "The conversion service is temporarily over its quota. Please try again later.";
  return "The conversion service could not start the job. Try again in a moment.";
}

const ALLOWED_ORIGIN = /^https:\/\/([a-z0-9-]+\.)*(dockdocs\.app|netlify\.app)$/i;

// Best-effort per-IP sliding-window limiter (per warm instance) to bound CloudConvert credit abuse.
const rlHits = new Map<string, number[]>();
function isRateLimited(req: Request, limit: number, windowMs: number, store = rlHits): boolean {
  const ip =
    req.headers.get("x-nf-client-connection-ip") ||
    (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
    "anon";
  const now = Date.now();
  const arr = (store.get(ip) || []).filter((ts) => now - ts < windowMs);
  arr.push(now);
  store.set(ip, arr);
  if (store.size > 5000) {
    for (const [k, v] of store) if (!v.length || now - v[v.length - 1] > windowMs) store.delete(k);
  }
  return arr.length > limit;
}

// ---------------------------------------------------------------------------
// Handler — JSON-only control plane. The file NEVER passes through this
// function: the browser uploads directly to CloudConvert and downloads the
// result directly. This avoids Netlify's 6 MB function body limit.
//
// Two actions:
//   { action: "create", route, password? }  -> creates a job, returns
//        { jobId, upload: { url, parameters }, outputExt }
//   { action: "status", jobId }             -> returns
//        { status, downloadUrl? }
// ---------------------------------------------------------------------------
export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") {
    return json({ ok: false, code: "METHOD_NOT_ALLOWED", message: "Use POST." }, 405);
  }

  const origin = req.headers.get("origin");
  if (origin && !ALLOWED_ORIGIN.test(origin) && !/^http:\/\/localhost(:\d+)?$/i.test(origin)) {
    return json({ ok: false, code: "FORBIDDEN_ORIGIN", message: "Requests are only allowed from DockDocs." }, 403);
  }

  const apiKey = Netlify.env.get("CLOUDCONVERT_API_KEY")?.trim();
  if (!apiKey) {
    return json({
      ok: false,
      code: "NOT_CONFIGURED",
      message: "CloudConvert API key is not configured. Set CLOUDCONVERT_API_KEY in Netlify environment variables.",
    }, 503);
  }

  let body: { action?: string; route?: string; password?: string; jobId?: string; url?: string };
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, code: "INVALID_BODY", message: "Expected JSON body." }, 400);
  }

  // ── STATUS: poll an existing job ──
  if (body.action === "status") {
    const jobId = body.jobId?.trim();
    if (!jobId) {
      return json({ ok: false, code: "NO_JOB_ID", message: "jobId is required." }, 400);
    }
    try {
      const statusRes = await fetch(`${CLOUDCONVERT_API}/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!statusRes.ok) {
        return json({ ok: false, code: "STATUS_FAILED", message: "Could not check conversion status." }, 502);
      }
      const statusData = await statusRes.json() as CloudConvertJob;
      const jobStatus = statusData.data.status;

      if (jobStatus === "error") {
        return json({
          ok: false,
          code: "CONVERSION_FAILED",
          message: "The file could not be converted. The format may not be supported or the file may be corrupted.",
        }, 200);
      }

      if (jobStatus === "finished") {
        const exportTask = statusData.data.tasks.find((t) => t.name === "export-file");
        const downloadUrl = exportTask?.result?.files?.[0]?.url ?? null;
        if (!downloadUrl) {
          return json({ ok: false, code: "NO_EXPORT", message: "Conversion finished but no output URL was returned." }, 200);
        }
        return json({ ok: true, status: "finished", downloadUrl });
      }

      // still waiting/processing
      return json({ ok: true, status: jobStatus });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return json({ ok: false, code: "INTERNAL_ERROR", message }, 500);
    }
  }

  // ── DELETE: clean up the job right after the client downloads (fire-and-forget) ──
  if (body.action === "delete") {
    const jobId = body.jobId?.trim();
    if (jobId) {
      await fetch(`${CLOUDCONVERT_API}/jobs/${jobId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${apiKey}` },
      }).catch(() => {});
    }
    return json({ ok: true });
  }

  // Rate-limit only the costly CREATE path (status polling stays exempt so live jobs can poll).
  // Per-minute burst guard + a per-day cap to bound CloudConvert credit abuse by scrapers.
  // (Forward office/html/pdfa now go to the $0 self-hosted box; CloudConvert here serves
  //  the paid reverse pdf->office and the >5 MB fallback.)
  if (isRateLimited(req, 12, 60_000)) {
    return json({ ok: false, code: "RATE_LIMITED", message: "Too many conversions — please wait a minute and try again." }, 429);
  }

  // Per-plan daily/monthly cap (by Supabase user via Bearer token, or anon by IP) —
  // the authoritative bound on CloudConvert credit burn that replaces the old
  // best-effort in-memory daily counter. Only the costly CREATE path is gated;
  // status polling above is exempt. Counted (gate.commit) only after a job is created.
  const gate = await enforceFeatureGate(req, "convert");
  if (!gate.ok) {
    return gate.response;
  }

  // ── CREATE: build a job and return the direct-upload form ──
  const route = body.route?.trim();
  const isEncrypt = route === ENCRYPT_ROUTE;
  if (!route || (!isEncrypt && !(route in SUPPORTED_CONVERSIONS))) {
    return json({
      ok: false,
      code: "INVALID_ROUTE",
      message: `Route must be one of: ${Object.keys(SUPPORTED_CONVERSIONS).join(", ")}, ${ENCRYPT_ROUTE}`,
    }, 400);
  }

  const password = body.password?.trim() ?? "";
  if (isEncrypt && password.length < 4) {
    return json({ ok: false, code: "INVALID_PASSWORD", message: "Password must be at least 4 characters." }, 400);
  }

  const conv = isEncrypt
    ? { inputFormat: "pdf", outputFormat: "pdf", outputExt: "pdf" }
    : SUPPORTED_CONVERSIONS[route as ConversionRoute];
  const { inputFormat, outputFormat, outputExt } = conv;

  const processingTask = isEncrypt
    ? {
        operation: "pdf/encrypt",
        input: "upload-file",
        password,
        owner_password: password,
      }
    : {
        operation: "convert",
        input: "upload-file",
        input_format: inputFormat,
        output_format: outputFormat,
        ...(outputFormat === "pdf" ? { pdf_a: route === "pdf-to-pdfa", optimize_print: false } : {}),
      };

  try {
    const jobRes = await fetch(`${CLOUDCONVERT_API}/jobs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tasks: {
          "upload-file": { operation: "import/upload" },
          "convert-file": processingTask,
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
      const detail = await jobRes.text().catch(() => "");
      console.error("[cloudconvert] job create failed", jobRes.status, detail.slice(0, 400));
      return json({ ok: false, code: "JOB_CREATE_FAILED", status: jobRes.status, message: cloudConvertFailMessage(jobRes.status) }, 502);
    }

    const job = await jobRes.json() as CloudConvertJob;
    const uploadTask = job.data.tasks.find((t) => t.name === "upload-file");

    if (!uploadTask?.result?.form) {
      return json({ ok: false, code: "UPLOAD_TASK_MISSING", message: "CloudConvert did not return an upload form." }, 502);
    }

    await gate.commit();
    return json({
      ok: true,
      jobId: job.data.id,
      upload: {
        url: uploadTask.result.form.url,
        parameters: uploadTask.result.form.parameters,
      },
      outputExt,
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

export const config = {
  path: "/api/cloudconvert-convert",
};
