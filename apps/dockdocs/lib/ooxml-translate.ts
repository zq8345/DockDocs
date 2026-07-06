// OOXML in-place text translation — the layout-preserving core of 文档翻译
// (AI 壳 Batch 3, G1). A .docx/.pptx/.xlsx is a ZIP of XML parts; translating
// the document = swapping the human text inside <w:t>/<a:t>/<t> runs and
// repacking, leaving every other byte (styles, images, tables, numbering)
// untouched. The file itself never leaves the device — only the extracted
// text strings go to the translation API (privacy moat, same contract as the
// PDF tools).
//
// ZERO new dependencies by design (supply-chain rule):
// - unzip: hand-rolled central-directory parser + the browser/Node native
//   DecompressionStream("deflate-raw") for method-8 members
// - repack: the existing createZipArchive (STORE method) from pdf-runtime —
//   Office opens stored archives fine; output is a bit larger, never broken
//
// G1 scope: run-level replacement for word/document.xml (<w:t>). Sentence
// merging across runs (quality) is G2; pptx/xlsx parts are G3 on this same
// chassis.

// .ts extension so the node --test suite (ESM loader, no bundler resolution)
// can load this module directly; tsconfig has allowImportingTsExtensions.
import { createZipArchive } from "../../../shared/templates/pdf-tool-page/zip-archive.ts";

// ── ZIP layer ────────────────────────────────────────────────────────────────

const EOCD_SIG = 0x06054b50;
const CENTRAL_SIG = 0x02014b50;
const LOCAL_SIG = 0x04034b50;

async function inflateRaw(data: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([data as BlobPart]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/**
 * Unpack a ZIP (OOXML container) into name → bytes, preserving entry order.
 * Supports method 0 (stored) and 8 (deflate) — everything Office writes.
 * No ZIP64 (an Office document near 4 GB is beyond this tool's scope anyway).
 */
export async function unzipArchive(bytes: Uint8Array): Promise<Map<string, Uint8Array>> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  // EOCD lives in the last 22..(22+65535) bytes (variable-length comment).
  let eocd = -1;
  const scanFloor = Math.max(0, bytes.length - 22 - 65535);
  for (let i = bytes.length - 22; i >= scanFloor; i--) {
    if (view.getUint32(i, true) === EOCD_SIG) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error("Invalid PDF structure."); // reuse the corrupt-file wording family
  const entryCount = view.getUint16(eocd + 10, true);
  const centralOffset = view.getUint32(eocd + 16, true);

  const entries = new Map<string, Uint8Array>();
  const decoder = new TextDecoder();
  let p = centralOffset;
  for (let i = 0; i < entryCount; i++) {
    if (view.getUint32(p, true) !== CENTRAL_SIG) throw new Error("Invalid PDF structure.");
    const method = view.getUint16(p + 10, true);
    const compSize = view.getUint32(p + 20, true);
    const nameLen = view.getUint16(p + 28, true);
    const extraLen = view.getUint16(p + 30, true);
    const commentLen = view.getUint16(p + 32, true);
    const localOffset = view.getUint32(p + 42, true);
    const name = decoder.decode(bytes.subarray(p + 46, p + 46 + nameLen));

    // The LOCAL header's name/extra lengths can differ from the central copy —
    // the data offset must be computed from the local record.
    if (view.getUint32(localOffset, true) !== LOCAL_SIG) throw new Error("Invalid PDF structure.");
    const localNameLen = view.getUint16(localOffset + 26, true);
    const localExtraLen = view.getUint16(localOffset + 28, true);
    const dataStart = localOffset + 30 + localNameLen + localExtraLen;
    const raw = bytes.subarray(dataStart, dataStart + compSize);

    if (method === 0) {
      entries.set(name, raw.slice());
    } else if (method === 8) {
      entries.set(name, await inflateRaw(raw));
    } else {
      throw new Error(`Unsupported ZIP compression method ${method}`);
    }
    p += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

/** Repack entries (order preserved) into a stored-method ZIP Office accepts. */
export function rezipArchive(entries: Map<string, Uint8Array>): Uint8Array {
  return createZipArchive([...entries.entries()].map(([name, data]) => ({ name, data })));
}

// ── XML text layer (docx G1: <w:t> runs) ────────────────────────────────────

const XML_UNESCAPES: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&apos;": "'" };

export function unescapeXml(value: string): string {
  return value.replace(/&(?:amp|lt|gt|quot|apos);|&#x?[0-9a-fA-F]+;/g, (m) => {
    if (XML_UNESCAPES[m]) return XML_UNESCAPES[m];
    const code = m[2] === "x" || m[2] === "X" ? parseInt(m.slice(3, -1), 16) : parseInt(m.slice(2, -1), 10);
    return Number.isFinite(code) ? String.fromCodePoint(code) : m;
  });
}

export function escapeXml(value: string): string {
  return value.replace(/[&<>]/g, (c) => (c === "&" ? "&amp;" : c === "<" ? "&lt;" : "&gt;"));
}

const W_T = /(<w:t\b[^>]*>)([\s\S]*?)(<\/w:t>)/g;

/**
 * Pull every <w:t> run's text (unescaped) out of word/document.xml, in
 * document order. Index in the returned array = replacement slot.
 */
export function extractDocxTexts(documentXml: string): string[] {
  const texts: string[] = [];
  for (const match of documentXml.matchAll(W_T)) {
    texts.push(unescapeXml(match[2]));
  }
  return texts;
}

/**
 * Write translations back into the same <w:t> slots, in order. A null/undefined
 * slot keeps the original run untouched. Every rewritten run gets
 * xml:space="preserve" so leading/trailing spaces in the translation survive
 * (always-on is valid OOXML and cheaper than diffing whitespace).
 */
export function replaceDocxTexts(documentXml: string, translations: Array<string | null | undefined>): string {
  let index = 0;
  return documentXml.replace(W_T, (whole, open: string, _text: string, close: string) => {
    const next = translations[index++];
    if (next === null || next === undefined) return whole;
    const openPreserved = open.includes("xml:space")
      ? open
      : open.replace(/<w:t\b/, '<w:t xml:space="preserve"');
    return openPreserved + escapeXml(next) + close;
  });
}

// ── High-level: translate one .docx ─────────────────────────────────────────

/** True for runs worth sending to the translator (skip whitespace/empty). */
export function isTranslatableText(text: string): boolean {
  return text.trim().length > 0;
}

export type TranslateBatch = (texts: string[]) => Promise<string[]>;

/**
 * Translate a .docx in place: unzip → swap <w:t> text via `translateBatch` →
 * repack. Only the text strings are handed to the callback — the caller owns
 * the API transport (and its streaming/chunking); this module never touches
 * the network. Non-translatable runs (pure whitespace) pass through verbatim.
 * Returns the rebuilt .docx bytes.
 */
export async function translateDocx(bytes: Uint8Array, translateBatch: TranslateBatch): Promise<Uint8Array> {
  const entries = await unzipArchive(bytes);
  const docPath = "word/document.xml";
  const docXmlBytes = entries.get(docPath);
  if (!docXmlBytes) throw new Error("Not a Word document (word/document.xml missing).");
  const documentXml = new TextDecoder().decode(docXmlBytes);

  const texts = extractDocxTexts(documentXml);
  const jobIndices: number[] = [];
  const jobTexts: string[] = [];
  texts.forEach((text, i) => {
    if (isTranslatableText(text)) {
      jobIndices.push(i);
      jobTexts.push(text);
    }
  });

  const translated = jobTexts.length > 0 ? await translateBatch(jobTexts) : [];
  if (translated.length !== jobTexts.length) {
    throw new Error(`Translator returned ${translated.length} segments for ${jobTexts.length} inputs.`);
  }

  const slots: Array<string | null> = texts.map(() => null);
  jobIndices.forEach((slot, k) => { slots[slot] = translated[k]; });

  const newXml = replaceDocxTexts(documentXml, slots);
  entries.set(docPath, new TextEncoder().encode(newXml));
  return rezipArchive(entries);
}
