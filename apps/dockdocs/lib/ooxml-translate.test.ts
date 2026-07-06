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
  planDocxParagraphs,
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

test("unzip rejects garbage bytes with a file-type-neutral message", async () => {
  // "Invalid file structure." (not "PDF") so pdf-errors' corrupt-file mapper
  // gives a .docx user a sensible notice without a misleading PDF reference.
  await assert.rejects(
    () => unzipArchive(new TextEncoder().encode("<html>not a zip</html>")),
    /Invalid file structure/,
  );
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

// ── paragraph merge (G2): sentences split across runs ───────────────────────

test("planDocxParagraphs merges runs per paragraph, in order", () => {
  const plan = planDocxParagraphs(DOCUMENT_XML);
  assert.deepEqual(plan.paragraphs, [
    "Payment is due within 30 days", // two runs (plain + bold) = ONE unit
    " Fees & charges <net> ",        // preserve-space run + empty run
  ]);
});

test("apply puts the whole translation in the first run and empties the rest", () => {
  const plan = planDocxParagraphs(DOCUMENT_XML);
  const out = plan.apply(["付款期限为 30 天", null]);
  // first run of paragraph 1 carries everything…
  assert.ok(out.includes(">付款期限为 30 天</w:t>"));
  // …the bold second run is emptied but its element + formatting survive
  assert.ok(/<w:rPr><w:b\/><\/w:rPr><w:t xml:space="preserve"><\/w:t>/.test(out));
  // paragraph 2 (null) fully untouched, including its escapes
  assert.ok(out.includes(" Fees &amp; charges &lt;net&gt; "));
  assert.equal((out.match(/<w:t\b/g) ?? []).length, 4);
});

test("apply rejects a paragraph-count mismatch", () => {
  const plan = planDocxParagraphs(DOCUMENT_XML);
  assert.throws(() => plan.apply(["only one"]), /paragraphs/);
});

test("hyperlink runs merge into their paragraph; link element survives", () => {
  const xml = `<w:document xmlns:w="w"><w:body><w:p><w:r><w:t>See </w:t></w:r><w:hyperlink r:id="rId9"><w:r><w:rPr><w:u/></w:rPr><w:t>the appendix</w:t></w:r></w:hyperlink><w:r><w:t> for details.</w:t></w:r></w:p></w:body></w:document>`;
  const plan = planDocxParagraphs(xml);
  assert.deepEqual(plan.paragraphs, ["See the appendix for details."]);
  const out = plan.apply(["详情见附录。"]);
  assert.ok(out.includes(">详情见附录。</w:t>"));
  assert.ok(out.includes('<w:hyperlink r:id="rId9">')); // link element intact
});

test("table-cell paragraphs are separate units", () => {
  const xml = `<w:document xmlns:w="w"><w:body><w:tbl><w:tr><w:tc><w:p><w:r><w:t>Cell A</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>Cell B</w:t></w:r></w:p></w:tc></w:tr></w:tbl><w:p><w:r><w:t>After table</w:t></w:r></w:p></w:body></w:document>`;
  const plan = planDocxParagraphs(xml);
  assert.deepEqual(plan.paragraphs, ["Cell A", "Cell B", "After table"]);
});

test("run-level <w:br/> elements survive the refill", () => {
  const xml = `<w:document xmlns:w="w"><w:body><w:p><w:r><w:t>Line one</w:t></w:r><w:r><w:br/><w:t>Line two</w:t></w:r></w:p></w:body></w:document>`;
  const plan = planDocxParagraphs(xml);
  assert.deepEqual(plan.paragraphs, ["Line oneLine two"]);
  const out = plan.apply(["第一行第二行"]);
  assert.ok(out.includes("<w:br/>"));
});

test("a stray <w:t> outside any <w:p> never shifts the mapping", () => {
  const xml = `<w:document xmlns:w="w"><w:body><w:t>stray</w:t><w:p><w:r><w:t>Real paragraph</w:t></w:r></w:p></w:body></w:document>`;
  const plan = planDocxParagraphs(xml);
  assert.deepEqual(plan.paragraphs, ["Real paragraph"]);
  const out = plan.apply(["真正的段落"]);
  assert.ok(out.includes(">stray</w:t>")); // untouched
  assert.ok(out.includes(">真正的段落</w:t>"));
});

// ── CJK (the primary use case: Chinese contract .docx) ───────────────────────

test("CJK: no-space Chinese runs merge into one whole-sentence unit", () => {
  // Chinese has no inter-word spaces; a sentence Word split across a plain +
  // bold run must NOT be joined with a space or translated fragment-by-fragment.
  const xml = `<w:document xmlns:w="w"><w:body><w:p><w:r><w:t>本合同</w:t></w:r><w:r><w:rPr><w:b/></w:rPr><w:t>自签署之日起生效</w:t></w:r></w:p></w:body></w:document>`;
  const plan = planDocxParagraphs(xml);
  assert.deepEqual(plan.paragraphs, ["本合同自签署之日起生效"]);
  const out = plan.apply(["This contract takes effect upon signing"]);
  assert.ok(out.includes(">This contract takes effect upon signing</w:t>"));
  assert.ok(/<w:rPr><w:b\/><\/w:rPr><w:t xml:space="preserve"><\/w:t>/.test(out)); // bold run emptied, kept
});

test("CJK: mixed Chinese+Latin paragraph merges in order", () => {
  const xml = `<w:document xmlns:w="w"><w:body><w:p><w:r><w:t>付款方式：</w:t></w:r><w:r><w:t>Net 30 days</w:t></w:r><w:r><w:t>。</w:t></w:r></w:p></w:body></w:document>`;
  const plan = planDocxParagraphs(xml);
  assert.deepEqual(plan.paragraphs, ["付款方式：Net 30 days。"]);
});

test("CJK: full docx round trip, Chinese source → target, other parts intact", async () => {
  const zhDoc = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>甲方与</w:t></w:r><w:r><w:rPr><w:b/></w:rPr><w:t>乙方</w:t></w:r><w:r><w:t>达成如下协议。</w:t></w:r></w:p><w:sectPr/></w:body></w:document>`;
  const fixture = createZipArchive([
    { name: "[Content_Types].xml", data: CONTENT_TYPES },
    { name: "_rels/.rels", data: RELS },
    { name: "word/document.xml", data: zhDoc },
  ]);
  const seen: string[] = [];
  const out = await translateDocx(fixture, async (texts) => {
    seen.push(...texts);
    return texts.map(() => "Party A and Party B agree as follows.");
  });
  assert.deepEqual(seen, ["甲方与乙方达成如下协议。"]); // one merged unit, no spaces injected
  const xml = new TextDecoder().decode((await unzipArchive(out)).get("word/document.xml"));
  assert.ok(xml.includes(">Party A and Party B agree as follows.</w:t>"));
  assert.ok(xml.includes("<w:b/>"));
});

// ── field-code / bookmark-only paragraphs (no <w:t> to translate) ────────────

test("bookmark-only paragraph is skipped, does not shift later paragraphs", () => {
  const xml = `<w:document xmlns:w="w"><w:body><w:p><w:bookmarkStart w:id="0" w:name="ref1"/><w:bookmarkEnd w:id="0"/></w:p><w:p><w:r><w:t>Real text</w:t></w:r></w:p></w:body></w:document>`;
  const plan = planDocxParagraphs(xml);
  assert.deepEqual(plan.paragraphs, ["Real text"]); // empty paragraph produced no unit
  const out = plan.apply(["实际文本"]);
  assert.ok(out.includes(">实际文本</w:t>"));
  assert.ok(out.includes('<w:bookmarkStart w:id="0" w:name="ref1"/>')); // bookmark intact
});

test("field-code paragraph (instrText, no <w:t>) is skipped", () => {
  // A PAGE field: fldChar begin / instrText / fldChar end — instrText is NOT
  // <w:t>, so the paragraph has no translatable unit and passes through.
  const xml = `<w:document xmlns:w="w"><w:body><w:p><w:r><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText>PAGE</w:instrText></w:r><w:r><w:fldChar w:fldCharType="end"/></w:r></w:p><w:p><w:r><w:t>Chapter one</w:t></w:r></w:p></w:body></w:document>`;
  const plan = planDocxParagraphs(xml);
  assert.deepEqual(plan.paragraphs, ["Chapter one"]);
  const out = plan.apply(["第一章"]);
  assert.ok(out.includes("<w:instrText>PAGE</w:instrText>")); // field instruction untouched
  assert.ok(out.includes(">第一章</w:t>"));
});

// ── end-to-end ──────────────────────────────────────────────────────────────

test("translateDocx: paragraph-level round trip, other parts intact, blanks skipped", async () => {
  const fixture = buildFixtureDocx();
  const seen: string[] = [];
  const out = await translateDocx(fixture, async (texts) => {
    seen.push(...texts);
    return texts.map((t) => `[译]${t}`);
  });

  // translator sees WHOLE paragraphs (runs merged), not fragments
  assert.deepEqual(seen, ["Payment is due within 30 days", " Fees & charges <net> "]);

  const entries = await unzipArchive(out);
  const xml = new TextDecoder().decode(entries.get("word/document.xml"));
  assert.ok(xml.includes("[译]Payment is due within 30 days"));
  assert.ok(xml.includes("[译] Fees &amp; charges &lt;net&gt; "));
  assert.ok(xml.includes("<w:b/>")); // formatting elements survive
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
