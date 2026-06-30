"use client";

import { useState } from "react";
import { TrialCta } from "@/components/TrialCta";
import { PdfWorkflowEngine } from "./workflow-engine";
import type { PdfToolPageConfig } from "./index";

export function ToolZoneWithTrial({ config }: { config: PdfToolPageConfig }) {
  const [success, setSuccess] = useState(false);
  return (
    <>
      <PdfWorkflowEngine config={config} onSuccess={() => setSuccess(true)} />
      <div className="mt-6">
        <TrialCta variant="tool-free" locale={config.locale} visible={success} />
      </div>
    </>
  );
}
