// G1 round-trip suite for the OOXML translation core. Run with:
//   node --test lib/ooxml-translate.test.ts   (from apps/dockdocs)
// Fixtures are REAL ZIP bytes built programmatically (spec-compliant OPC
// container: [Content_Types].xml + _rels/.rels + word/document.xml), so the
// round trip exercises the same byte paths the browser will.

import { test } from "node:test";
import assert from "node:assert/strict";
import { createZipArchive } from "../../../shared/templates/pdf-tool-page/zip-archive.ts";
import {
  unzipArchive,
  rezipArchive,
  extractDocxTexts,
  replaceDocxTexts,
  translateDocx,
  unescapeXml,
  escapeXml,
} from "./ooxml-translate.ts";

// ── fixture ──────────────────────────────────────────────────────────────────

const CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`;

const RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`;

// Two paragraphs: one split across two runs (bold second half), one with XML
// escapes + an explicit xml:space run + an empty run — the shapes Word writes.
const DOCUMENT_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Payment is due within </w:t></w:r><w:r><w:rPr><w:b/></w:rPr><w:t>30 days</w:t></w:r></w:p><w:p><w:r><w:t xml:space="preserve"> Fees &amp; charges &lt;net&gt; </w:t></w:r><w:r><w:t></w:t></w:r></w:p><w:sectPr/></w:body></w:document>`;

function buildFixtureDocx(): Uint8Array {
  return createZipArchive([
    { name: "[Content_Types].xml", data: CONTENT_TYPES },
    { name: "_rels/.rels", data: RELS },
    { name: "word/document.xml", data: DOCUMENT_XML },
  ]);
}

async function deflateRaw(data: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([data as BlobPart]).stream().pipeThrough(new CompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/** Hand-build a one-entry ZIP whose member is DEFLATE-compressed (method 8). */
async function buildDeflatedZip(name: string, content: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const nameBytes = encoder.encode(name);
  const raw = encoder.encode(content);
  const packed = await deflateRaw(raw);
  const crc = crc32(raw);

  const local = new Uint8Array(30 + nameBytes.length + packed.length);
  const lv = new DataView(local.buffer);
  lv.setUint32(0, 0x04034b50, true);
  lv.setUint16(4, 20, true);
  lv.setUint16(8, 8, true); // method 8
  lv.setUint32(14, crc, true);
  lv.setUint32(18, packed.length, true);
  lv.setUint32(22, raw.length, true);
  lv.setUint16(26, nameBytes.length, true);
  local.set(nameBytes, 30);
  local.set(packed, 30 + nameBytes.length);

  const central = new Uint8Array(46 + nameBytes.length);
  const cv = new DataView(central.buffer);
  cv.setUint32(0, 0x02014b50, true);
  cv.setUint16(4, 20, true);
  cv.setUint16(6, 20, true);
  cv.setUint16(10, 8, true); // method 8
  cv.setUint32(16, crc, true);
  cv.setUint32(20, packed.length, true);
  cv.setUint32(24, raw.length, true);
  cv.setUint16(28, nameBytes.length, true);
  cv.setUint32(42, 0, true); // local offset
  central.set(nameBytes, 46);

  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, 1, true);
  ev.setUint16(10, 1, true);
  ev.setUint32(12, central.length, true);
  ev.setUint32(16, local.length, true);

  const out = new Uint8Array(local.length + central.length + end.length);
  out.set(local, 0);
  out.set(central, local.length);
  out.set(end, local.length + central.length);
  return out;
}

function crc32(bytes: Uint8Array) {
  let crc = -1;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ bytes[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}
const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

// ── ZIP layer ────────────────────────────────────────────────────────────────

test("unzip round-trips a stored archive byte-for-byte", async () => {
  const fixture = buildFixtureDocx();
  const entries = await unzipArchive(fixture);
  assert.deepEqual([...entries.keys()], ["[Content_Types].xml", "_rels/.rels", "word/document.xml"]);
  assert.equal(new TextDecoder().decode(entries.get("word/document.xml")), DOCUMENT_XML);

  // repack → unzip again → still identical content
  const repacked = rezipArchive(entries);
  const again = await unzipArchive(repacked);
  assert.equal(new TextDecoder().decode(again.get("_rels/.rels")), RELS);
});

test("unzip inflates DEFLATE (method 8) members via DecompressionStream", async () => {
  const zipped = await buildDeflatedZip("word/document.xml", DOCUMENT_XML);
  const entries = await unzipArchive(zipped);
  assert.equal(new TextDecoder().decode(entries.get("word/document.xml")), DOCUMENT_XML);
});

test("unzip rejects garbage bytes", async () => {
  await assert.rejects(() => unzipArchive(new TextEncoder().encode("<html>not a zip</html>")));
});

// ── XML text layer ───────────────────────────────────────────────────────────

test("extractDocxTexts pulls runs in order and unescapes entities", () => {
  const texts = extractDocxTexts(DOCUMENT_XML);
  assert.deepEqual(texts, [
    "Payment is due within ",
    "30 days",
    " Fees & charges <net> ",
    "",
  ]);
});

test("replaceDocxTexts fills slots in order, escapes, preserves structure", () => {
  const out = replaceDocxTexts(DOCUMENT_XML, [
    "付款期限为 ",
    "30 天",
    " 费用 & 收费 <净额> ",
    null, // untouched empty run
  ]);
  assert.ok(out.includes(">付款期限为 </w:t>"));
  assert.ok(out.includes(">30 天</w:t>"));
  assert.ok(out.includes("费用 &amp; 收费 &lt;净额&gt;"));
  // bold run marker survives, run count unchanged
  assert.ok(out.includes("<w:b/>"));
  assert.equal((out.match(/<w:t\b/g) ?? []).length, 4);
  // rewritten runs carry xml:space so edge spaces survive
  assert.ok(/<w:t xml:space="preserve"[^>]*>付款期限为 /.test(out));
  // the null slot kept its original (empty, no forced attribute) form
  assert.ok(out.includes("<w:t></w:t>"));
});

test("unescape/escape are inverse for document text", () => {
  assert.equal(unescapeXml("A &amp; B &lt;C&gt; &#x4E2D;&#25991;"), "A & B <C> 中文");
  assert.equal(escapeXml("A & B <C>"), "A &amp; B &lt;C&gt;");
});

// ── end-to-end ──────────────────────────────────────────────────────────────

test("translateDocx: full round trip swaps text, leaves other parts intact, skips blanks", async () => {
  const fixture = buildFixtureDocx();
  const seen: string[] = [];
  const out = await translateDocx(fixture, async (texts) => {
    seen.push(...texts);
    return texts.map((t) => `[译]${t}`);
  });

  // whitespace-only / empty runs never reach the translator
  assert.deepEqual(seen, ["Payment is due within ", "30 days", " Fees & charges <net> "]);

  const entries = await unzipArchive(out);
  const xml = new TextDecoder().decode(entries.get("word/document.xml"));
  assert.ok(xml.includes("[译]Payment is due within "));
  assert.ok(xml.includes("[译]30 days"));
  assert.ok(xml.includes("[译] Fees &amp; charges &lt;net&gt; "));
  // untouched parts byte-identical
  assert.equal(new TextDecoder().decode(entries.get("[Content_Types].xml")), CONTENT_TYPES);
  assert.equal(new TextDecoder().decode(entries.get("_rels/.rels")), RELS);
});

test("translateDocx rejects a ZIP that is not a Word document", async () => {
  const notDocx = createZipArchive([{ name: "hello.txt", data: "hi" }]);
  await assert.rejects(() => translateDocx(notDocx, async (t) => t), /word\/document\.xml/);
});

test("translateDocx rejects a translator that drops segments", async () => {
  const fixture = buildFixtureDocx();
  await assert.rejects(() => translateDocx(fixture, async () => ["only one"]), /segments/);
});
