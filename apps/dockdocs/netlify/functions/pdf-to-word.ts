import type { Config, Context } from "@netlify/functions";

declare const Netlify: {
  env: {
    get(name: string): string | undefined;
  };
};

const defaultMaxUploadBytes = 5 * 1024 * 1024;
const netlifyBufferedPayloadLimit = 6 * 1024 * 1024;
const convertApiEndpoint = "https://v2.convertapi.com/convert/pdf/to/docx";
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

  const provider = getProvider();

  if (provider.name === "convertapi" && !provider.token) {
    return json(
      {
        ok: false,
        code: "PDF_TO_WORD_BACKEND_NOT_CONFIGURED",
        message:
          "ConvertAPI PDF to Word provider is not configured yet. Set DOCKDOCS_CONVERTAPI_TOKEN to enable real DOCX conversion.",
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

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 55_000);

  try {
    const output = await convertPdfToDocxWithConvertApi({
      file,
      locale: String(formData.get("locale") ?? "en"),
      provider,
      signal: controller.signal,
    });

    const outputName = outputFileName(file.name);
    return new Response(output.data, {
      status: 200,
      headers: {
        "Content-Type": docxMime,
        "Content-Disposition": `attachment; filename="${outputName}"`,
        "Cache-Control": "no-store",
        "X-DockDocs-Conversion-Backend": "convertapi",
        "X-DockDocs-Conversion-Provider": "convertapi",
        "X-DockDocs-Conversion-Profile": output.profile,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "The PDF to Word provider timed out or could not be reached.";
    const timedOut = /abort|timeout|timed out/i.test(message);

    return json(
      {
        ok: false,
        code: timedOut
          ? "PDF_TO_WORD_PROVIDER_TIMEOUT"
          : "PDF_TO_WORD_PROVIDER_ERROR",
        message: timedOut
          ? "The PDF to Word provider timed out or could not be reached."
          : message,
        httpStatus: timedOut ? 504 : 502,
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

type UploadedPdfFile = File;

type ConvertApiProvider = {
  name: "convertapi";
  endpoint: string;
  token?: string;
  wysiwyg: boolean;
  ocrMode: "auto" | "force" | "never";
  ocrEngine: "native" | "tesseract";
};

async function convertPdfToDocxWithConvertApi({
  file,
  locale,
  provider,
  signal,
}: {
  file: UploadedPdfFile;
  locale: string;
  provider: ConvertApiProvider;
  signal: AbortSignal;
}) {
  if (!provider.token) {
    throw new Error("ConvertAPI token is missing.");
  }

  const providerFormData = new FormData();
  providerFormData.append("File", file, file.name || "dockdocs-source.pdf");
  providerFormData.append("StoreFile", "false");
  providerFormData.append("Wysiwyg", String(provider.wysiwyg));
  providerFormData.append("OcrMode", provider.ocrMode);
  providerFormData.append("OcrEngine", provider.ocrEngine);
  providerFormData.append("OcrLanguage", locale === "zh" ? "zh" : "en");

  const providerResponse = await fetch(provider.endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${provider.token}`,
    },
    body: providerFormData,
    signal,
  });

  if (!providerResponse.ok) {
    returnProviderError(
      providerResponse.status,
      await safeProviderError(providerResponse),
    );
  }

  const output = await providerResponse.arrayBuffer();
  const outputBytes = new Uint8Array(output);
  if (!isDocxZip(outputBytes)) {
    returnProviderError(
      502,
      "ConvertAPI did not return a valid DOCX binary response.",
    );
  }

  return {
    data: output,
    profile: [
      provider.wysiwyg ? "wysiwyg" : "editable",
      `ocr-${provider.ocrMode}`,
      provider.ocrEngine,
    ].join(";"),
  };
}

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

function isUploadedFile(value: FormDataEntryValue | null): value is UploadedPdfFile {
  return (
    typeof value === "object" &&
    value !== null &&
    "arrayBuffer" in value &&
    "size" in value &&
    "type" in value
  );
}

function isPdfFile(file: UploadedPdfFile) {
  return (
    file.type === "application/pdf" ||
    (file.name ?? "").toLowerCase().endsWith(".pdf")
  );
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

function getProvider(): ConvertApiProvider {
  return {
    name: "convertapi",
    endpoint:
      Netlify.env.get("DOCKDOCS_CONVERTAPI_PDF_TO_DOCX_URL")?.trim() ||
      convertApiEndpoint,
    token:
      Netlify.env.get("DOCKDOCS_CONVERTAPI_TOKEN")?.trim() ||
      Netlify.env.get("DOCKDOCS_PDF_TO_WORD_API_KEY")?.trim(),
    wysiwyg: readBool("DOCKDOCS_CONVERTAPI_WYSIWYG", true),
    ocrMode: readEnum("DOCKDOCS_CONVERTAPI_OCR_MODE", ["auto", "force", "never"], "auto"),
    ocrEngine: readEnum(
      "DOCKDOCS_CONVERTAPI_OCR_ENGINE",
      ["native", "tesseract"],
      "native",
    ),
  };
}

function readBool(name: string, fallback: boolean) {
  const raw = Netlify.env.get(name)?.trim().toLowerCase();
  if (!raw) {
    return fallback;
  }

  return raw === "true" || raw === "1" || raw === "yes";
}

function readEnum<T extends string>(name: string, values: T[], fallback: T) {
  const raw = Netlify.env.get(name)?.trim().toLowerCase() as T | undefined;
  return raw && values.includes(raw) ? raw : fallback;
}

function isDocxZip(bytes: Uint8Array) {
  return bytes.length > 4 && bytes[0] === 0x50 && bytes[1] === 0x4b;
}

async function safeProviderError(response: Response) {
  const text = await response.text().catch(() => "");
  return text.replace(/Bearer\s+[A-Za-z0-9._-]+/g, "Bearer [redacted]").slice(0, 500);
}

function returnProviderError(status: number, detail: string): never {
  throw new Error(`ConvertAPI PDF to Word failed with status ${status}. ${detail}`);
}
