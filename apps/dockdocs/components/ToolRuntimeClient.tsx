"use client";

import type { ChangeEvent } from "react";
import { useMemo, useState } from "react";
import { ResultPreview } from "@/components/ResultPreview";
import { UploadPanel } from "@/components/UploadPanel";
import { getRuntimeCopy, type RuntimeLocale } from "@/lib/copy";

type ToolRuntimeState = "empty" | "selected" | "processing" | "success" | "error";

type ToolRuntimeClientProps = {
  uploadTitle: string;
  uploadDescription: string;
  formats: string;
  limit: string;
  cta: string;
  accept: string;
  allowedExtensions: string[];
  outputEyebrow: string;
  outputTitle: string;
  outputSummary: string;
  keyPoints: string[];
  actions: string[];
  emptyMessage: string;
  locale?: RuntimeLocale;
};

const maxFileSize = 25 * 1024 * 1024;

export function ToolRuntimeClient({
  uploadTitle,
  uploadDescription,
  formats,
  limit,
  cta,
  accept,
  allowedExtensions,
  outputEyebrow,
  outputTitle,
  outputSummary,
  keyPoints,
  actions,
  emptyMessage,
  locale = "en",
}: ToolRuntimeClientProps) {
  const copy = getRuntimeCopy(locale);
  const [state, setState] = useState<ToolRuntimeState>("empty");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  const uploadState = useMemo(() => {
    if (state === "selected") {
      return "selected";
    }

    return state;
  }, [state]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setError("");

    if (!file) {
      setFileName("");
      setState("empty");
      return;
    }

    setFileName(file.name);

    const lowerName = file.name.toLowerCase();
    const extensionAllowed = allowedExtensions.some((extension) =>
      lowerName.endsWith(extension),
    );

    if (!extensionAllowed) {
      setState("error");
      setError(`${copy.common.errors.unsupportedFile} ${formats}.`);
      return;
    }

    if (file.size > maxFileSize) {
      setState("error");
      setError(copy.common.errors.fileTooLarge);
      return;
    }

    setState("selected");
    window.setTimeout(() => {
      setState("processing");
      window.setTimeout(() => {
        setState("success");
      }, 700);
    }, 250);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <UploadPanel
        title={uploadTitle}
        description={uploadDescription}
        formats={formats}
        limit={limit}
        cta={cta}
        accept={accept}
        fileName={fileName}
        state={uploadState}
        errorMessage={error}
        onFileChange={handleFileChange}
        labels={copy.common.upload}
      />
      <ResultPreview
        eyebrow={outputEyebrow}
        title={outputTitle}
        summary={outputSummary}
        keyPoints={keyPoints}
        actions={actions}
        state={state === "selected" ? "empty" : state}
        emptyMessage={emptyMessage}
        errorMessage={error}
        labels={copy.common.result}
      />
    </div>
  );
}
