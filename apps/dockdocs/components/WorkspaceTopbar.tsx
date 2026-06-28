"use client";

import { type RuntimeLocale } from "@/lib/copy";

// Topbar replaced by in-content tool heading (Resend-style); kept as no-op export.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function WorkspaceTopbar(_props: {
  locale: RuntimeLocale;
  activeTool?: string | null;
  toolLabel?: string;
}) {
  return null;
}
