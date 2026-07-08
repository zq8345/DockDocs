import { ImageResponse } from "next/og";

// Site-wide social card (1200×630). Next generates this to a static PNG at build
// time (works under output: "export") and wires og:image / twitter:image into the
// metadata for every page that doesn't set its own image.
export const alt = "DockDocs — every tool you need for PDFs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0a0a0a",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              backgroundColor: "#3ECF8E",
              marginRight: 16,
              display: "flex",
            }}
          />
          <div style={{ fontSize: 34, color: "#ffffff", fontWeight: 600 }}>DockDocs</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 78, color: "#ffffff", fontWeight: 700, lineHeight: 1.05 }}>
            Every tool you need for PDFs.
          </div>
          <div style={{ fontSize: 30, color: "#a1a1a1", marginTop: 28, lineHeight: 1.3 }}>
            Convert · Compress · Merge · OCR · Chat with PDF — free, in your browser.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 28, color: "#3ECF8E", fontWeight: 600 }}>dockdocs.app</div>
          <div style={{ fontSize: 24, color: "#6b6b6b" }}>AI document platform</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
