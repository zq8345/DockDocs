"use client";

// Signature capture panel: hand-drawn pad or typed script — both rasterize to
// a transparent PNG data URL (the proven SignPdfClient pad/typed→canvas path,
// generalized to hand the PNG to the editor as a placeable element).

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

const PAD_W = 480;
const PAD_H = 160;
const TYPE_FONT = "64px 'Brush Script MT', 'Segoe Script', cursive";
const INK = "#111827";

export type SignaturePanelStrings = {
  draw: string;
  type: string;
  typePlaceholder: string;
  clear: string;
  apply: string;
  cancel: string;
};

export function SignaturePanel({
  t,
  onApply,
  onCancel,
}: {
  t: SignaturePanelStrings;
  /** PNG data URL + natural aspect (h/w) of the captured signature. */
  onApply: (src: string, ratio: number) => void;
  onCancel: () => void;
}) {
  const [mode, setMode] = useState<"draw" | "type">("draw");
  const [typed, setTyped] = useState("");
  const [sig, setSig] = useState("");
  const padRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasStroke = useRef(false);

  // ── pad (pointer-based draw) ──
  const padCtx = () => padRef.current?.getContext("2d") ?? null;
  const padPoint = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const c = padRef.current!;
    const r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * c.width, y: ((e.clientY - r.top) / r.height) * c.height };
  };
  const padDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const ctx = padCtx();
    if (!ctx) return;
    drawing.current = true;
    const { x, y } = padPoint(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    padRef.current?.setPointerCapture(e.pointerId);
  };
  const padMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = padCtx();
    if (!ctx) return;
    const { x, y } = padPoint(e);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = INK;
    ctx.lineTo(x, y);
    ctx.stroke();
    hasStroke.current = true;
  };
  const padUp = () => {
    drawing.current = false;
    if (hasStroke.current && padRef.current) setSig(padRef.current.toDataURL("image/png"));
  };
  const clearPad = () => {
    const ctx = padCtx();
    if (ctx && padRef.current) ctx.clearRect(0, 0, padRef.current.width, padRef.current.height);
    hasStroke.current = false;
    if (mode === "draw") setSig("");
  };

  // ── typed → canvas PNG ──
  useEffect(() => {
    if (mode !== "type") return;
    const name = typed.trim();
    if (!name) { setSig(""); return; }
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 160;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = INK;
    ctx.font = TYPE_FONT;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(name, canvas.width / 2, canvas.height / 2);
    setSig(canvas.toDataURL("image/png"));
  }, [typed, mode]);

  const ratio = mode === "draw" ? PAD_H / PAD_W : 160 / 600;

  return (
    <div className="mt-3 space-y-3 border-t border-[color:var(--line)] pt-3">
      <div className="inline-flex rounded-[var(--radius)] border border-[color:var(--line)] p-0.5">
        {(["draw", "type"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); setSig(""); if (m === "draw") { hasStroke.current = false; } }}
            className={`rounded-[var(--radius-sm)] px-4 py-1.5 text-[12.5px] font-medium transition ${mode === m ? "bg-[color:var(--accent)] text-white" : "text-[color:var(--muted)]"}`}
          >
            {m === "draw" ? t.draw : t.type}
          </button>
        ))}
      </div>

      {mode === "draw" ? (
        <div className="w-full max-w-[480px]">
          <canvas
            ref={padRef}
            width={PAD_W}
            height={PAD_H}
            className="w-full touch-none rounded-[var(--radius)] border border-[color:var(--line)] bg-white"
            onPointerDown={padDown}
            onPointerMove={padMove}
            onPointerUp={padUp}
          />
        </div>
      ) : (
        <input
          type="text"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder={t.typePlaceholder}
          className="h-10 w-full max-w-[480px] rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3 text-[14px] text-[color:var(--foreground)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--accent)]"
        />
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => { if (sig) onApply(sig, ratio); }}
          disabled={!sig}
          className="rounded-[var(--radius)] bg-[color:var(--accent)] px-4 py-2 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t.apply}
        </button>
        {mode === "draw" && (
          <button type="button" onClick={clearPad} className="rounded-[var(--radius)] border border-[color:var(--line)] px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]">
            {t.clear}
          </button>
        )}
        <button type="button" onClick={onCancel} className="text-[13px] text-[color:var(--muted)] transition hover:text-[color:var(--foreground)]">
          {t.cancel}
        </button>
      </div>
    </div>
  );
}
