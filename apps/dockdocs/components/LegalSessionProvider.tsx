"use client";

import { useState, type ReactNode } from "react";
import {
  LegalSessionContext,
  EMPTY_SESSION,
  type LegalSession,
  type LegalSessionResults,
  type LegalRisk,
  type LegalRequirement,
} from "@/lib/legal-session";

export function LegalSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<LegalSession>(EMPTY_SESSION);

  function setSessionFile(file: File, text: string, thumbnails: string[], pageCount: number) {
    setSession({ file, extractedText: text, pageThumbnails: thumbnails, fileName: file.name, pageCount, results: {} });
  }

  function setResult(key: keyof LegalSessionResults, value: LegalRisk[] | LegalRequirement[]) {
    setSession((s) => ({ ...s, results: { ...s.results, [key]: value } }));
  }

  function clearSession() {
    setSession(EMPTY_SESSION);
  }

  return (
    <LegalSessionContext.Provider value={{ session, setSessionFile, setResult, clearSession }}>
      {children}
    </LegalSessionContext.Provider>
  );
}
