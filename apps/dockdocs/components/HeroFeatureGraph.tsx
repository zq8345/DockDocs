"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { navCategories } from "@/components/Header";

type Locale = "en" | "zh";
type Item = { name: string; slug: string };

const CENTER = { zh: "DockDocs", subZh: "懂你的 PDF", en: "DockDocs", subEn: "understands your PDF" };
const COLORS = ["#818cf8", "#c084fc", "#22d3ee", "#fbbf24"];
// category base angles (screen, y down): up-left / down-left / up-right / down-right
const ANG = [Math.PI * 1.25, Math.PI * 0.75, Math.PI * 1.75, Math.PI * 0.25];
const CAT_BLURB = [
  { zh: "转换 · 整理 · 加密 · 签名", en: "Convert · organize · encrypt · sign" },
  { zh: "整批 / 整文件夹一次处理", en: "Whole folders in one pass" },
  { zh: "AI 读懂 · 问答 · 对比 · 抽取", en: "AI reads · answers · compares · extracts" },
  { zh: "面向法律 / 财务 / 科研场景", en: "Legal · finance · research workflows" },
];
const DESC: Record<string, { zh: string; en: string }> = {
  "/pdf-to-word": { zh: "PDF 与 Word / Excel / PPT / 图片互转", en: "PDF ↔ Word / Excel / PPT / images" },
  "/split-pdf": { zh: "拆分、合并、压缩、整理页面", en: "Split, merge, compress, organize" },
  "/merge-pdf": { zh: "把多份 PDF 合并成一个", en: "Combine multiple PDFs into one" },
  "/protect-pdf": { zh: "加密、解锁、电子签名", en: "Encrypt, unlock, e-sign" },
  "/redact-pdf": { zh: "敏感信息真删除,不可恢复", en: "Permanently remove sensitive text" },
  "/chat-with-pdf": { zh: "和 PDF 对话,答案带出处", en: "Ask your PDF — answers cite sources" },
  "/ai-summary": { zh: "一键读懂长文档要点", en: "Grasp a long document fast" },
  "/compare": { zh: "多份合同 / 报价并排对比", en: "Compare contracts & quotes" },
  "/redline": { zh: "对比两版文档,标出增删", en: "Diff two versions, mark changes" },
  "/extract-to-excel": { zh: "把关键字段抽成表格", en: "Pull key fields into a sheet" },
  "/batch-compress": { zh: "整个文件夹一次压缩", en: "Compress a whole folder" },
  "/batch-sort": { zh: "AI 自动归类杂乱文件", en: "AI sorts a messy pile" },
};
const SHADOW = "0 1px 3px rgba(0,0,0,.95), 0 0 10px rgba(0,0,0,.8)";

const HUB_R = 165;
function flatItems(cat: { cols: { items: Item[] }[] }): Item[] {
  const seen = new Set<string>(); const out: Item[] = [];
  for (const col of cat.cols) for (const it of col.items ?? []) { const k = it.name + it.slug; if (!seen.has(k)) { seen.add(k); out.push(it); } }
  return out;
}
// pack n features into expanding arcs in a wedge around base angle A (no overlap)
function fanWorld(n: number, A: number): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = [];
  const r0 = 285, dr = 96, wedge = 1.32, minGap = 116;
  let placed = 0, arc = 0;
  while (placed < n) {
    const rr = r0 + arc * dr;
    const cap = Math.max(2, Math.floor((rr * wedge) / minGap));
    const cnt = Math.min(cap, n - placed);
    for (let c = 0; c < cnt; c++) {
      const frac = cnt === 1 ? 0.5 : c / (cnt - 1);
      const ang = A + (frac - 0.5) * wedge;
      out.push({ x: Math.cos(ang) * rr, y: Math.sin(ang) * rr });
    }
    placed += cnt; arc++;
  }
  return out;
}

type Node = { kind: "center" | "hub" | "feat"; x: number; y: number; color: string; cat: number; side: "l" | "r"; label: string; slug?: string; desc?: { zh: string; en: string } | null; blurb?: { zh: string; en: string } };

export function HeroFeatureGraph({ locale = "en" }: { locale?: Locale }) {
  const zh = locale === "zh";
  const [hover, setHover] = useState<number | null>(null);

  const { nodes, lines, maxR } = useMemo(() => {
    const cats = (navCategories[zh ? "zh" : "en"] ?? navCategories.en).slice(0, 4);
    const nodes: Node[] = [{ kind: "center", x: 0, y: 0, color: "#a5b4fc", cat: -1, side: "r", label: "" }];
    const lines: { a: number; b: number; color: string; cat: number; k: number }[] = [];
    let maxR = 0;
    cats.forEach((cat, ci) => {
      const side: "l" | "r" = ci === 0 || ci === 1 ? "l" : "r";
      const hubIdx = nodes.length;
      nodes.push({ kind: "hub", x: Math.cos(ANG[ci]) * HUB_R, y: Math.sin(ANG[ci]) * HUB_R, color: COLORS[ci], cat: ci, side, label: cat.label, blurb: CAT_BLURB[ci] });
      lines.push({ a: 0, b: hubIdx, color: COLORS[ci], cat: ci, k: lines.length });
      const feats = flatItems(cat);
      const pts = fanWorld(feats.length, ANG[ci]);
      feats.forEach((it, k) => {
        const fi = nodes.length;
        maxR = Math.max(maxR, Math.hypot(pts[k].x, pts[k].y));
        nodes.push({ kind: "feat", x: pts[k].x, y: pts[k].y, color: COLORS[ci], cat: ci, side, label: it.name, slug: it.slug, desc: DESC[it.slug] ?? null });
        lines.push({ a: hubIdx, b: fi, color: COLORS[ci], cat: ci, k: lines.length });
      });
    });
    return { nodes, lines, maxR };
  }, [zh]);

  const viewport = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const nodeEls = useRef<(HTMLElement | null)[]>([]);
  const baseEls = useRef<(SVGPathElement | null)[]>([]);
  const flowEls = useRef<(SVGPathElement | null)[]>([]);
  const tip = useRef<HTMLDivElement>(null);
  const proj = useRef<{ x: number; y: number; u: number }[]>([]);
  const pan = useRef({ x: 0, y: 0 });
  const vel = useRef({ x: 0, y: 0 });
  const drag = useRef({ on: false, px: 0, py: 0, moved: false });
  const hoverRef = useRef<number | null>(null);

  useEffect(() => {
    const vp = viewport.current; if (!vp) return;
    let raf = 0;

    const tick = () => {
      const w = vp.clientWidth, h = vp.clientHeight;
      if (w && h) {
        const WS = Math.min(Math.max(h / 620, 0.8), 1.4);
        const MAXPAN = (maxR + 80) * WS;
        if (!drag.current.on) {
          pan.current.x += vel.current.x; pan.current.y += vel.current.y;
          vel.current.x *= 0.91; vel.current.y *= 0.91;
        }
        pan.current.x = Math.max(-MAXPAN, Math.min(MAXPAN, pan.current.x));
        pan.current.y = Math.max(-MAXPAN, Math.min(MAXPAN, pan.current.y));

        const cx = w / 2, cy = h / 2;
        const Rf = Math.min(w, h) * 0.62;
        const aCat = hoverRef.current !== null ? nodes[hoverRef.current]?.cat ?? null : null;

        for (let i = 0; i < nodes.length; i++) {
          const dx = nodes[i].x * WS + pan.current.x;
          const dy = nodes[i].y * WS + pan.current.y;
          const d = Math.hypot(dx, dy);
          const u = Math.min(d / Rf, 1.5);
          const uu = Math.min(u, 1);
          const compress = 1 - 0.08 * uu * uu;
          const sx = cx + dx * compress, sy = cy + dy * compress;
          proj.current[i] = { x: sx, y: sy, u };
          const el = nodeEls.current[i]; if (!el) continue;
          const k = nodes[i].kind;
          const s = 0.9 + 0.32 * (1 - uu * uu);
          el.style.transform = `translate3d(${sx}px,${sy}px,0) translate(-50%,-50%) scale(${s})`;
          let op = k === "center" ? 1 : 0.55 + 0.45 * (1 - uu * 0.7);
          if (u > 1) op *= Math.max(0, 1 - (u - 1) * 2.2);
          if (aCat !== null && nodes[i].cat !== aCat && k !== "center") op *= 0.16;
          el.style.opacity = String(op);
          el.style.zIndex = String(300 + Math.round((1 - uu) * 400) + (i === hoverRef.current ? 500 : 0));
        }

        for (let i = 0; i < lines.length; i++) {
          const bp = baseEls.current[i], fp = flowEls.current[i];
          const a = proj.current[lines[i].a], b = proj.current[lines[i].b];
          if (!a || !b) continue;
          const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
          const ex = b.x - a.x, ey = b.y - a.y; const l = Math.hypot(ex, ey) || 1;
          const c = l * (0.1 + ((i * 37) % 11) / 11 * 0.14);
          const dpath = `M${a.x.toFixed(1)} ${a.y.toFixed(1)}Q${(mx - ey / l * c).toFixed(1)} ${(my + ex / l * c).toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
          const depth = 1 - Math.min((a.u + b.u) / 2, 1);
          const dim = aCat !== null && lines[i].cat !== aCat ? 0.14 : 1;
          if (bp) { bp.setAttribute("d", dpath); bp.setAttribute("stroke-opacity", (0.07 + 0.16 * depth).toFixed(3) + ""); bp.style.opacity = String(dim); }
          if (fp) { fp.setAttribute("d", dpath); fp.style.opacity = String((0.5 + 0.5 * depth) * dim); }
        }

        if (svg.current) svg.current.setAttribute("viewBox", `0 0 ${w} ${h}`);
        const ti = tip.current;
        if (ti) {
          const hi = hoverRef.current;
          if (hi !== null && proj.current[hi] && nodes[hi].kind !== "center") {
            ti.style.opacity = "1";
            ti.style.transform = `translate3d(${proj.current[hi].x}px,${proj.current[hi].y}px,0) translate(-50%,calc(-100% - 18px))`;
          } else ti.style.opacity = "0";
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onDown = (e: PointerEvent) => { drag.current = { on: true, px: e.clientX, py: e.clientY, moved: false }; vp.setPointerCapture?.(e.pointerId); vp.style.cursor = "grabbing"; };
    const onMove = (e: PointerEvent) => {
      if (!drag.current.on) return;
      const dx = e.clientX - drag.current.px, dy = e.clientY - drag.current.py;
      if (Math.abs(dx) + Math.abs(dy) > 3) drag.current.moved = true;
      pan.current.x += dx; pan.current.y += dy;
      vel.current = { x: dx, y: dy };
      drag.current.px = e.clientX; drag.current.py = e.clientY;
    };
    const onUp = () => { drag.current.on = false; vp.style.cursor = "grab"; };
    vp.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => { cancelAnimationFrame(raf); vp.removeEventListener("pointerdown", onDown); window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); };
  }, [nodes, lines, maxR]);

  const setH = (i: number | null) => { hoverRef.current = i; setHover(i); };
  const hov = hover !== null ? nodes[hover] : null;
  const labelSide = (side: "l" | "r"): CSSProperties =>
    side === "l"
      ? { right: "calc(100% + 7px)", top: "50%", transform: "translateY(-50%)", textAlign: "right" }
      : { left: "calc(100% + 7px)", top: "50%", transform: "translateY(-50%)", textAlign: "left" };

  return (
    <div className="relative h-full w-full">
      <style>{`
        @keyframes hfg-flow{to{stroke-dashoffset:-32}}
        @keyframes hfg-pulse{0%,100%{opacity:.45;transform:translate(-50%,-50%) scale(1)}50%{opacity:.8;transform:translate(-50%,-50%) scale(1.18)}}
        @keyframes hfg-fade{from{opacity:0}to{opacity:1}}
        @keyframes hfg-orb{0%,100%{box-shadow:0 0 26px rgba(99,102,241,.6),0 0 60px rgba(99,102,241,.3)}50%{box-shadow:0 0 36px rgba(99,102,241,.85),0 0 80px rgba(99,102,241,.45)}}
        .hfg-node{position:absolute;left:0;top:0;will-change:transform,opacity;}
        .hfg-dot{display:block;border-radius:50%;}
        .hfg-lab{position:absolute;white-space:nowrap;pointer-events:none;}
        .hfg-flowline{fill:none;stroke-linecap:round;stroke-dasharray:0.5 15.5;animation:hfg-flow 1.6s linear infinite;}
        .hfg-tipbox{position:absolute;left:0;top:0;opacity:0;pointer-events:none;transition:opacity .18s;z-index:1200;white-space:nowrap;will-change:transform,opacity;}
      `}</style>

      {/* Desktop: full-bleed, gently-curved pannable feature flow-map */}
      <div ref={viewport} className="absolute inset-0 hidden touch-none select-none overflow-hidden sm:block" style={{ cursor: "grab", animation: "hfg-fade .8s ease both" }}>
        <span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[180px] w-[180px] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: "radial-gradient(circle, rgba(99,102,241,.32), transparent 70%)", animation: "hfg-pulse 4.5s ease-in-out infinite", zIndex: 1 }} />

        <svg ref={svg} className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
          {lines.map((ln, i) => (
            <path key={`b${i}`} ref={(el) => { baseEls.current[i] = el; }} stroke={ln.color} strokeWidth="0.9" fill="none" />
          ))}
          {lines.map((ln, i) => (
            <path key={`f${i}`} ref={(el) => { flowEls.current[i] = el; }} className="hfg-flowline" stroke={ln.color} strokeWidth="2.4" style={{ animationDelay: `${(i % 11) * 0.14}s` }} />
          ))}
        </svg>

        {nodes.map((nd, i) => {
          if (nd.kind === "center") {
            return (
              <div key={i} ref={(el) => { nodeEls.current[i] = el; }} className="hfg-node" style={{ zIndex: 800 }}>
                <span className="hfg-dot" style={{ width: 50, height: 50, background: "radial-gradient(circle at 34% 30%, #e0e7ff, #6366f1 58%, #4338ca)", animation: "hfg-orb 4s ease-in-out infinite" }} />
                <span className="hfg-lab flex flex-col items-center" style={{ left: "50%", top: "calc(100% + 7px)", transform: "translateX(-50%)" }}>
                  <span className="text-[17px] font-bold tracking-tight text-white" style={{ textShadow: SHADOW }}>{CENTER[zh ? "zh" : "en"]}</span>
                  <span className="text-[11.5px] font-medium text-[#a5b4fc]" style={{ textShadow: SHADOW }}>{zh ? CENTER.subZh : CENTER.subEn}</span>
                </span>
              </div>
            );
          }
          if (nd.kind === "hub") {
            return (
              <div key={i} ref={(el) => { nodeEls.current[i] = el; }} className="hfg-node cursor-pointer" onPointerEnter={() => setH(i)} onPointerLeave={() => setH(null)}>
                <span className="hfg-dot" style={{ width: 13, height: 13, background: nd.color, boxShadow: `0 0 14px ${nd.color}, 0 0 4px ${nd.color}` }} />
                <span className="hfg-lab text-[14.5px] font-bold text-white" style={{ ...labelSide(nd.side), textShadow: `${SHADOW}, 0 0 12px ${nd.color}99` }}>{nd.label}</span>
              </div>
            );
          }
          return (
            <a key={i} ref={(el) => { nodeEls.current[i] = el; }} href={nd.slug} className="hfg-node" style={{ textDecoration: "none" }}
              onPointerEnter={() => setH(i)} onPointerLeave={() => setH(null)}
              onClick={(e) => { if (drag.current.moved) e.preventDefault(); }}>
              <span className="hfg-dot" style={{ width: 8, height: 8, background: nd.color, boxShadow: `0 0 9px ${nd.color}` }} />
              <span className="hfg-lab text-[11.5px] font-medium text-[color:var(--foreground)]" style={{ ...labelSide(nd.side), textShadow: SHADOW }}>{nd.label}</span>
            </a>
          );
        })}

        <div ref={tip} className="hfg-tipbox">
          <div className="rounded-[10px] border bg-[rgba(14,15,22,.97)] px-3 py-2 text-center shadow-[0_10px_34px_rgba(0,0,0,.55)]" style={{ borderColor: hov ? `${hov.color}66` : "var(--line)", maxWidth: 240 }}>
            <div className="text-[13px] font-semibold text-white">{hov?.label}</div>
            {hov && (hov.kind === "hub" ? hov.blurb : hov.desc) && (
              <div className="mt-0.5 text-[11.5px] leading-snug text-[color:var(--muted)]">{(() => { const d = hov.kind === "hub" ? hov.blurb : hov.desc; return d ? (zh ? d.zh : d.en) : null; })()}</div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile fallback */}
      <div className="flex h-full flex-col justify-center px-4 py-6 sm:hidden">
        <div className="mx-auto mb-6 w-fit rounded-full border border-[rgba(129,140,248,.5)] bg-[rgba(30,32,46,.92)] px-6 py-4 text-center shadow-[0_0_30px_rgba(99,102,241,.4)]">
          <div className="text-[20px] font-bold text-white">{CENTER[zh ? "zh" : "en"]}</div>
          <div className="text-[13px] font-medium text-[#a5b4fc]">{zh ? CENTER.subZh : CENTER.subEn}</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {(navCategories[zh ? "zh" : "en"] ?? navCategories.en).slice(0, 4).map((cat, i) => {
            const feats = flatItems(cat as { cols: { items: Item[] }[] });
            return (
              <div key={i} className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-3">
                <div className="flex items-center gap-1.5 text-[13.5px] font-semibold text-[color:var(--foreground)]">
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: COLORS[i] }} />{cat.label}
                </div>
                <p className="mt-1 text-[11px] leading-snug text-[color:var(--faint)]">{zh ? CAT_BLURB[i].zh : CAT_BLURB[i].en}</p>
                <ul className="mt-1.5 grid grid-cols-2 gap-x-2 text-[11.5px] text-[color:var(--muted)]">
                  {feats.slice(0, 8).map((ff, j) => <li key={j} className="truncate">{ff.name}</li>)}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
