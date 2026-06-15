"use client";

// Flow extraction templates — Phase A (localStorage).
// Stores user-named extraction configs so they can pre-set docType + dimensions
// for repeat comparisons without re-selecting each time.
// Phase B will mirror these to Supabase (nf-flow-foundation schema ready).

export type FlowTemplate = {
  id: string;
  name: string;
  docType: string;
  dimensions: Array<{ key: string; label: string }>;
  createdAt: string;
};

const KEY = "dockdocs:flow-templates";

export function loadTemplates(): FlowTemplate[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isTemplate);
  } catch {
    return [];
  }
}

export function saveTemplate(
  tpl: Omit<FlowTemplate, "id" | "createdAt">,
): FlowTemplate {
  const next: FlowTemplate = {
    id: `tpl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    ...tpl,
  };
  const existing = loadTemplates().filter((t) => t.name !== tpl.name);
  localStorage.setItem(KEY, JSON.stringify([next, ...existing]));
  return next;
}

export function deleteTemplate(id: string): void {
  const updated = loadTemplates().filter((t) => t.id !== id);
  localStorage.setItem(KEY, JSON.stringify(updated));
}

function isTemplate(x: unknown): x is FlowTemplate {
  if (!x || typeof x !== "object") return false;
  const t = x as Record<string, unknown>;
  return (
    typeof t.id === "string" &&
    typeof t.name === "string" &&
    typeof t.docType === "string" &&
    Array.isArray(t.dimensions) &&
    typeof t.createdAt === "string"
  );
}
