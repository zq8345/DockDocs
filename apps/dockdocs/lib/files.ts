// Shared file helpers used across the upload boxes and file cards.
// Single source of truth so every upload path shows sizes and rejects
// off-type files the same way.

// Human-readable byte size: "812 B" / "4.2 KB" / "12.4 MB".
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Keep files whose extension matches `extensions`; PDFs are also matched by MIME
// type so a .pdf with an odd name still gets through. Non-matching files (e.g.
// other docs inside a dropped folder) are filtered out before they reach a tool.
export function matchFiles(list: FileList | null, extensions: string[]): File[] {
  return Array.from(list || []).filter((f) => {
    const lower = f.name.toLowerCase();
    return (
      extensions.some((e) => lower.endsWith(e)) ||
      (extensions.includes(".pdf") && f.type === "application/pdf")
    );
  });
}
