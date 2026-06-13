"""
DockDocs reverse-convert service (PDF → DOCX / XLSX)
Runs on port 4000 inside the Docker network; Caddy exposes /reverse/* externally.
"""
import io
import os
import tempfile
import logging
from fastapi import FastAPI, File, Form, HTTPException, UploadFile, Request
from fastapi.responses import Response
import pdf2docx
import pdfplumber
import openpyxl

logging.basicConfig(level=logging.INFO)
app = FastAPI(docs_url=None, redoc_url=None)

SECRET = os.environ.get("DOCKDOCS_REVERSE_SECRET", "")
MAX_BYTES = 10 * 1024 * 1024  # 10 MB — larger than the 5 MB Netlify proxy cap for safety

SUPPORTED = {"pdf-to-word", "pdf-to-excel"}


@app.post("/convert")
async def convert(
    request: Request,
    route: str = Form(...),
    file: UploadFile = File(...),
):
    # Gate: shared secret (same pattern as Caddy → Gotenberg)
    if SECRET and request.headers.get("x-dockdocs-key") != SECRET:
        raise HTTPException(status_code=403, detail="Forbidden")

    if route not in SUPPORTED:
        raise HTTPException(status_code=422, detail=f"Unsupported route: {route}. Supported: {sorted(SUPPORTED)}")

    data = await file.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=413, detail=f"File too large (max {MAX_BYTES // 1024 // 1024} MB).")
    if not data:
        raise HTTPException(status_code=422, detail="Empty file.")

    with tempfile.TemporaryDirectory() as tmp:
        src = os.path.join(tmp, "source.pdf")
        with open(src, "wb") as f:
            f.write(data)

        if route == "pdf-to-word":
            return _to_docx(src)
        if route == "pdf-to-excel":
            return _to_xlsx(src)


def _to_docx(src: str) -> Response:
    out = src.replace(".pdf", ".docx")
    cv = pdf2docx.Converter(src)
    cv.convert(out, start=0, end=None)
    cv.close()
    with open(out, "rb") as f:
        body = f.read()
    return Response(
        content=body,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    )


def _to_xlsx(src: str) -> Response:
    wb = openpyxl.Workbook()
    wb.remove(wb.active)  # remove default empty sheet

    with pdfplumber.open(src) as pdf:
        for page_num, page in enumerate(pdf.pages, 1):
            tables = page.extract_tables()
            if not tables:
                # No tables on this page — dump raw text as single column
                text = page.extract_text() or ""
                if text.strip():
                    ws = wb.create_sheet(title=f"Page {page_num}")
                    for line in text.split("\n"):
                        ws.append([line])
                continue
            for t_idx, table in enumerate(tables):
                sheet_name = f"P{page_num}" if len(tables) == 1 else f"P{page_num}-T{t_idx+1}"
                ws = wb.create_sheet(title=sheet_name[:31])  # Excel sheet name limit
                for row in table:
                    ws.append([cell if cell is not None else "" for cell in row])

    if not wb.sheetnames:
        wb.create_sheet(title="Sheet1")

    buf = io.BytesIO()
    wb.save(buf)
    buf.seek(0)
    return Response(
        content=buf.read(),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )


@app.get("/health")
def health():
    return {"ok": True}
