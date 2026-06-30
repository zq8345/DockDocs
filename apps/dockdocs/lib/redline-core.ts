export type Op = { type: "eq" | "del" | "ins"; text: string };

export async function extractText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  let text = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((it) => ("str" in it ? it.str : "")).join(" ") + "\n";
  }
  try { doc.destroy(); } catch { /* ignore */ }
  return text;
}

export function toUnits(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?。！？;；\n])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 2500);
}

export function diff(a: string[], b: string[]): Op[] {
  const n = a.length, m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const ops: Op[] = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) { ops.push({ type: "eq", text: a[i] }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { ops.push({ type: "del", text: a[i] }); i++; }
    else { ops.push({ type: "ins", text: b[j] }); j++; }
  }
  while (i < n) ops.push({ type: "del", text: a[i++] });
  while (j < m) ops.push({ type: "ins", text: b[j++] });
  return ops;
}

export function changePairs(ops: Op[]): Array<{ del: string; ins: string }> {
  const pairs: Array<{ del: string; ins: string }> = [];
  let i = 0;
  while (i < ops.length) {
    const op = ops[i];
    if (op.type === "del") {
      const ins = ops[i + 1]?.type === "ins" ? ops[i + 1].text : "";
      pairs.push({ del: op.text, ins });
      i += ins ? 2 : 1;
    } else if (op.type === "ins") {
      pairs.push({ del: "", ins: op.text });
      i++;
    } else {
      i++;
    }
  }
  return pairs;
}
