"use client";

import { createContext, useContext } from "react";

export type LegalRisk = {
  type: string;
  level: "high" | "medium" | "low";
  quote: string | null;
  why: string;
  suggestion: string;
  missing?: boolean;
  unverified?: boolean;
};

export type LegalRequirement = {
  id: string;
  section: string;
  requirement: string;
  quote: string | null;
  type: "mandatory" | "advisory";
};

export type LegalSessionResults = {
  contractRisk?: LegalRisk[];
  leaseRedflag?: LegalRisk[];
  govbidMatrix?: LegalRequirement[];
};

export type LegalSession = {
  file: File | null;
  extractedText: string;
  pageThumbnails: string[];
  fileName: string;
  pageCount: number;
  results: LegalSessionResults;
};

export const EMPTY_SESSION: LegalSession = {
  file: null,
  extractedText: "",
  pageThumbnails: [],
  fileName: "",
  pageCount: 0,
  results: {},
};

type CtxType = {
  session: LegalSession;
  setSessionFile: (file: File, text: string, thumbnails: string[], pageCount: number) => void;
  setResult: (key: keyof LegalSessionResults, value: LegalRisk[] | LegalRequirement[]) => void;
  clearSession: () => void;
};

export const LegalSessionContext = createContext<CtxType | null>(null);

export function useLegalSession() {
  return useContext(LegalSessionContext);
}
