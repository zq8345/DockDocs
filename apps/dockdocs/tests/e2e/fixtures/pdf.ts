import fs from "node:fs";
import path from "node:path";

export type PdfFixture = {
  filePath: string;
  name: string;
  size: number;
};

const fixtureDir = path.join(process.cwd(), "tests", ".generated");

export function ensurePdfFixtures() {
  fs.mkdirSync(fixtureDir, { recursive: true });

  const small = createPdf(
    path.join(fixtureDir, "small-chat.pdf"),
    "DockDocs small PDF. Owner is Alice. Due date is June 15. Revenue is up.",
    128 * 1024,
  );
  const large = createPdf(
    path.join(fixtureDir, "large-over-limit.pdf"),
    "DockDocs large PDF. This file is intentionally larger than the UI limit.",
    27 * 1024 * 1024,
  );

  return { small, large };
}

function createPdf(filePath: string, text: string, targetBytes: number): PdfFixture {
  if (fs.existsSync(filePath) && fs.statSync(filePath).size === targetBytes) {
    return {
      filePath,
      name: path.basename(filePath),
      size: fs.statSync(filePath).size,
    };
  }

  const escaped = text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n",
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
  ];
  const stream = [
    "BT",
    "/F1 18 Tf",
    "72 720 Td",
    `(${escaped}) Tj`,
    "0 -28 Td",
    "(This file is generated for DockDocs Chat with PDF Playwright QA.) Tj",
    "0 -28 Td",
    "(Summary risks actions references provider binding.) Tj",
    "ET",
  ].join("\n");
  objects.push(
    `5 0 obj\n<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream\nendobj\n`,
  );

  let body = "%PDF-1.4\n";
  const offsets = [0];

  for (const object of objects) {
    offsets.push(Buffer.byteLength(body));
    body += object;
  }

  const xrefOffset = Buffer.byteLength(body);
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;

  for (let index = 1; index <= objects.length; index += 1) {
    body += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }

  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  let buffer = Buffer.from(body, "binary");

  if (targetBytes > buffer.length) {
    const paddingLength = targetBytes - buffer.length;
    buffer = Buffer.concat([buffer, Buffer.from(`\n% DockDocs QA padding\n`), Buffer.alloc(paddingLength)]);
  }

  fs.writeFileSync(filePath, buffer);

  return {
    filePath,
    name: path.basename(filePath),
    size: fs.statSync(filePath).size,
  };
}
