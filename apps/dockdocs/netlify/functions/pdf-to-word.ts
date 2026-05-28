import type { Config, Context } from "@netlify/functions";

declare const Netlify: {
  env: {
    get(name: string): string | undefined;
  };
};

const defaultMaxUploadBytes = 5 * 1024 * 1024;
const netlifyBufferedPayloadLimit = 6 * 1024 * 1024;
const docxMime =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") {
    return json(
      {
        code: "METHOD_NOT_ALLOWED",
        message: "Use POST with multipart/form-data to convert a PDF.",
      },
      405,
      { Allow: "POST" },
    );
  }

  const maxUploadBytes = getMaxUploadBytes();
  const contentLength = Number(req.headers.get("content-length") ?? "0");
  if (contentLength > maxUploadBytes) {
    return json(
      {
        ok: false,
        code: "PDF_TO_WORD_FILE_TOO_LARGE",
        message: "PDF to Word currently supports PDF uploads up to 5 MB.",
        httpStatus: 413,
      },
      200,
    );
  }

  const apiUrl = Netlify.env.get("DOCKDOCS_PDF_TO_WORD_API_URL")?.trim();
  const apiKey = Netlify.env.get("DOCKDOCS_PDF_TO_WORD_API_KEY")?.trim();

  if (!apiUrl) {
    return json(
      {
        ok: false,
        code: "PDF_TO_WORD_BACKEND_NOT_CONFIGURED",
        message:
          "PDF to Word conversion backend is not configured yet. No file was converted or stored.",
        httpStatus: 503,
      },
      200,
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return json(
      {
        ok: false,
        code: "INVALID_MULTIPART_UPLOAD",
        message: "Send a multipart/form-data request with a PDF file field.",
        httpStatus: 400,
      },
      200,
    );
  }

  const file = formData.get("file");
  if (!isUploadedFile(file)) {
    return json(
      {
        ok: false,
        code: "MISSING_PDF_FILE",
        message: "A PDF file field named file is required.",
        httpStatus: 400,
      },
      200,
    );
  }

  if (!isPdfFile(file)) {
    return json(
      {
        ok: false,
        code: "UNSUPPORTED_FILE_TYPE",
        message: "Only PDF files are supported.",
        httpStatus: 415,
      },
      200,
    );
  }

  if (file.size > maxUploadBytes) {
    return json(
      {
        ok: false,
        code: "PDF_TO_WORD_FILE_TOO_LARGE",
        message: "PDF to Word currently supports PDF uploads up to 5 MB.",
        httpStatus: 413,
      },
      200,
    );
  }

  const providerFormData = new FormData();
  providerFormData.append("file", file, file.name);
  providerFormData.append("locale", String(formData.get("locale") ?? "en"));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 55_000);

  try {
    const providerHeaders = new Headers();
    if (apiKey) {
      providerHeaders.set("Authorization", `Bearer ${apiKey}`);
    }

    const providerResponse = await fetch(apiUrl, {
      method: "POST",
      headers: providerHeaders,
      body: providerFormData,
      signal: controller.signal,
    });

    if (!providerResponse.ok) {
      return json(
        {
          ok: false,
          code: "PDF_TO_WORD_PROVIDER_ERROR",
          message: "The configured PDF to Word provider failed to convert this file.",
          status: providerResponse.status,
          httpStatus: 502,
        },
        200,
      );
    }

    const output = await providerResponse.arrayBuffer();
    const outputBytes = new Uint8Array(output);
    if (!outputBytes.length || outputBytes[0] !== 0x50 || outputBytes[1] !== 0x4b) {
      return json(
        {
          ok: false,
          code: "INVALID_DOCX_OUTPUT",
          message: "The configured provider did not return a valid DOCX file.",
          httpStatus: 502,
        },
        200,
      );
    }

    const outputName = outputFileName(file.name);
    return new Response(output, {
      status: 200,
      headers: {
        "Content-Type": docxMime,
        "Content-Disposition": `attachment; filename="${outputName}"`,
        "Cache-Control": "no-store",
        "X-DockDocs-Conversion-Backend": "netlify-function",
      },
    });
  } catch {
    return json(
      {
        ok: false,
        code: "PDF_TO_WORD_PROVIDER_TIMEOUT",
        message: "The PDF to Word provider timed out or could not be reached.",
        httpStatus: 504,
      },
      200,
    );
  } finally {
    clearTimeout(timeout);
  }
};

export const config: Config = {
  path: "/api/pdf-to-word",
  method: ["POST"],
};

function json(payload: Record<string, unknown>, status: number, headers?: Record<string, string>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

function isUploadedFile(value: FormDataEntryValue | null): value is File {
  return typeof File !== "undefined" && value instanceof File;
}

function isPdfFile(file: File) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

function outputFileName(inputName: string) {
  return `${inputName.replace(/\.pdf$/i, "") || "dockdocs-converted"}.docx`;
}

function getMaxUploadBytes() {
  const raw = Netlify.env.get("DOCKDOCS_PDF_TO_WORD_MAX_BYTES");
  const parsed = raw ? Number(raw) : defaultMaxUploadBytes;
  const safeValue = Number.isFinite(parsed) && parsed > 0 ? parsed : defaultMaxUploadBytes;
  return Math.min(safeValue, netlifyBufferedPayloadLimit);
}
