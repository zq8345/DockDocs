"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { navCategories } from "@/components/Header";

type Locale = "en" | "zh";
type Item = { name: string; slug: string };

const CENTER = { zh: "DockDocs", subZh: "懂你的 PDF", en: "DockDocs", subEn: "understands your PDF" };
const COLORS = ["#818cf8", "#c084fc", "#22d3ee", "#fbbf24"];
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
  "/chat-with-pdf": { zh: "和 PDF 对话,答案带出处", en: "Ask your PDF — answers cite sources" },
  "/compare": { zh: "多份合同 / 报价并排对比", en: "Compare contracts & quotes" },
  "/batch-compress": { zh: "整个文件夹一次压缩", en: "Compress a whole folder" },
};

// 4-fold symmetric layout in % of the composition box (centre = 50,50)
const LAYOUT = [
  { pos: [30, 31], feats: [[15, 14], [7, 35], [34, 8]], side: "l" as const },   // 0 PDF tools  · top-left
  { pos: [30, 69], feats: [[15, 86], [7, 65], [34, 92]], side: "l" as const },  // 1 Batch      · bottom-left
  { pos: [70, 31], feats: [[85, 14], [93, 35], [66, 8]], side: "r" as const },  // 2 AI         · top-right
  { pos: [70, 69], feats: [[85, 86], [93, 65], [66, 92]], side: "r" as const }, // 3 Profession · bottom-right
];

function flatItems(cat: { cols: { items: Item[] }[] }): Item[] {
  const seen = new Set<string>(); const out: Item[] = [];
  for (const col of cat.cols) for (const it of col.items ?? []) { const k = it.name + it.slug; if (!seen.has(k)) { seen.add(k); out.push(it); } }
  return out;
}
function pick3(cat: { cols: { items: Item[] }[] }): Item[] {
  const out: Item[] = [];
  for (const col of cat.cols) if (col.items?.[0]) out.push(col.items[0]);
  for (const col of cat.cols) for (const it of (col.items ?? []).slice(1)) { if (out.length >= 3) break; if (!out.includes(it)) out.push(it); }
  return out.slice(0, 3);
}

type Node = { kind: "center" | "hub" | "feat"; bx: number; by: number; phase: number; color: string; cat: number; side: "l" | "r"; label: string; slug?: string; desc?: { zh: string; en: string } | null };

export function HeroFeatureGraph({ locale = "en" }: { locale?: Locale }) {
  const zh = locale === "zh";
  const [hover, setHover] = useState<number | null>(null);

  const { nodes, lines, cats, allFeats } = useMemo(() => {
    const cats = (navCategories[zh ? "zh" : "en"] ?? navCategories.en).slice(0, 4);
    const nodes: Node[] = [{ kind: "center", bx: 50, by: 50, phase: 0, color: "#a5b4fc", cat: -1, side: "r", label: "" }];
    const lines: { a: number; b: number; cat: number }[] = [];
    const allFeats: Item[][] = [];
    cats.forEach((cat, ci) => {
      const L = LAYOUT[ci];
      const hubIdx = nodes.length;
      nodes.push({ kind: "hub", bx: L.pos[0], by: L.pos[1], phase: ci * 1.7, color: COLORS[ci], cat: ci, side: L.side, label: cat.label });
      lines.push({ a: 0, b: hubIdx, cat: ci });
      allFeats.push(flatItems(cat));
      pick3(cat).forEach((it, k) => {
        const fi = nodes.length;
        nodes.push({ kind: "feat", bx: L.feats[k][0], by: L.feats[k][1], phase: ci * 1.7 + k * 0.9 + 0.5, color: COLORS[ci], cat: ci, side: L.side, label: it.name, slug: it.slug, desc: DESC[it.slug] ?? null });
        lines.push({ a: hubIdx, b: fi, cat: ci });
      });
    });
    return { nodes, lines, cats, allFeats };
  }, [zh]);

  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const nodeEls = useRef<(HTMLElement | null)[]>([]);
  const lineEls = useRef<(SVGPathElement | null)[]>([]);
  const proj = useRef<{ x: number; y: number }[]>([]);
  const hoverRef = useRef<number | null>(null);

  useEffect(() => {
    const el = box.current; if (!el) return;
    let raf = 0, f = 0;
    const tick = () => {
      f++;
      const w = el.clientWidth, h = el.clientHeight;
      if (w && h) {
        const t = f * 0.02;
        const aCat = hoverRef.current !== null ? nodes[hoverRef.current]?.cat ?? null : null;
        for (let i = 0; i < nodes.length; i++) {
          const amp = nodes[i].kind === "center" ? 3 : 5;
          const x = (nodes[i].bx / 100) * w + Math.sin(t + nodes[i].phase) * amp;
          const y = (nodes[i].by / 100) * h + Math.cos(t * 0.9 + nodes[i].phase) * amp;
          proj.current[i] = { x, y };
          const n = nodeEls.current[i]; if (!n) continue;
          n.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%)`;
          let op = 1;
          if (aCat !== null && nodes[i].cat !== aCat && nodes[i].kind !== "center") op = 0.22;
          n.style.opacity = String(op);
          n.style.zIndex = String(i === hoverRef.current ? 60 : nodes[i].kind === "center" ? 40 : 30);
        }
        for (let i = 0; i < lines.length; i++) {
          const p = lineEls.current[i]; if (!p) continue;
          const a = proj.current[lines[i].a], b = proj.current[lines[i].b];
          if (!a || !b) continue;
          const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
          const ex = b.x - a.x, ey = b.y - a.y; const l = Math.hypot(ex, ey) || 1;
          const c = l * 0.12;
          p.setAttribute("d", `M${a.x.toFixed(1)} ${a.y.toFixed(1)}Q${(mx - ey / l * c).toFixed(1)} ${(my + ex / l * c).toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`);
          p.style.opacity = String(aCat !== null && lines[i].cat !== aCat ? 0.12 : 1);
        }
        if (svg.current) svg.current.setAttribute("viewBox", `0 0 ${w} ${h}`);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [nodes, lines]);

  const setH = (i: number | null) => { hoverRef.current = i; setHover(i); };
  const lab = (side: "l" | "r", gap = 9): CSSProperties =>
    side === "l"
      ? { right: `calc(100% + ${gap}px)`, top: "50%", transform: "translateY(-50%)", textAlign: "right" }
      : { left: `calc(100% + ${gap}px)`, top: "50%", transform: "translateY(-50%)", textAlign: "left" };

  return (
    <div className="flex h-full w-full items-center justify-center px-6">
      <style>{`
        @keyframes hfg-orb{0%,100%{box-shadow:0 0 24px rgba(99,102,241,.6),0 0 56px rgba(99,102,241,.28)}50%{box-shadow:0 0 34px rgba(99,102,241,.85),0 0 78px rgba(99,102,241,.42)}}
        @keyframes hfg-breathe{0%,100%{opacity:.6}50%{opacity:.85}}
        @keyframes hfg-fade{from{opacity:0}to{opacity:1}}
        .hfg-node{position:absolute;left:0;top:0;will-change:transform,opacity;}
        .hfg-dot{display:block;border-radius:50%;}
        .hfg-lab{position:absolute;white-space:nowrap;pointer-events:none;}
        .hfg-pop{position:absolute;opacity:0;pointer-events:none;transition:opacity .2s;}
        .hfg-hub:hover .hfg-pop,.hfg-feat:hover .hfg-pop{opacity:1;pointer-events:auto;}
        .hfg-lines{animation:hfg-breathe 5.5s ease-in-out infinite;}
      `}</style>

      {/* Desktop: minimal symmetric feature graph */}
      <div ref={box} className="relative hidden w-full max-w-[1060px] sm:block" style={{ aspectRatio: "16 / 9", animation: "hfg-fade .8s ease both" }}>
        <span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[200px] w-[200px] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: "radial-gradient(circle, rgba(99,102,241,.3), transparent 70%)", zIndex: 1 }} />

        <svg ref={svg} className="hfg-lines pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
          <defs>
            {COLORS.map((col, ci) => (
              <linearGradient key={ci} id={`hfg-grad-${ci}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#818cf8" /><stop offset="1" stopColor={col} />
              </linearGradient>
            ))}
          </defs>
          {lines.map((ln, i) => (
            <path key={i} ref={(el) => { lineEls.current[i] = el; }} stroke={`url(#hfg-grad-${ln.cat})`} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeOpacity="0.55" />
          ))}
        </svg>

        {nodes.map((nd, i) => {
          if (nd.kind === "center") {
            return (
              <div key={i} ref={(el) => { nodeEls.current[i] = el; }} className="hfg-node" style={{ zIndex: 40 }}>
                <span className="hfg-dot" style={{ width: 54, height: 54, background: "radial-gradient(circle at 34% 30%, #e0e7ff, #6366f1 58%, #4338ca)", animation: "hfg-orb 4s ease-in-out infinite" }} />
                <span className="hfg-lab flex flex-col items-center" style={{ left: "50%", top: "calc(100% + 9px)", transform: "translateX(-50%)" }}>
                  <span className="text-[18px] font-bold tracking-tight text-white" style={{ textShadow: "0 1px 10px rgba(0,0,0,.7)" }}>{CENTER[zh ? "zh" : "en"]}</span>
                  <span className="text-[12px] font-medium text-[#a5b4fc]">{zh ? CENTER.subZh : CENTER.subEn}</span>
                </span>
              </div>
            );
          }
          if (nd.kind === "hub") {
            const feats = allFeats[nd.cat] ?? [];
            const top = nd.by < 50;
            return (
              <div key={i} ref={(el) => { nodeEls.current[i] = el; }} className="hfg-node hfg-hub cursor-default" onPointerEnter={() => setH(i)} onPointerLeave={() => setH(null)}>
                <span className="hfg-dot" style={{ width: 13, height: 13, background: nd.color, boxShadow: `0 0 15px ${nd.color}, 0 0 5px ${nd.color}` }} />
                <span className="hfg-lab text-[14.5px] font-bold text-white" style={{ ...lab(nd.side, 11), textShadow: `0 1px 8px rgba(0,0,0,.8), 0 0 14px ${nd.color}88` }}>{nd.label}</span>
                {/* hover panel: full feature list for this category */}
                <div className="hfg-pop rounded-[12px] border bg-[rgba(13,14,21,.98)] p-3 shadow-[0_14px_44px_rgba(0,0,0,.6)]"
                  style={{ width: 232, [nd.side === "l" ? "right" : "left"]: "calc(100% + 16px)", [top ? "top" : "bottom"]: "-8px", borderColor: `${nd.color}55`, zIndex: 70 }}>
                  <div className="mb-2 text-[11.5px] leading-snug text-[color:var(--muted)]">{zh ? CAT_BLURB[nd.cat].zh : CAT_BLURB[nd.cat].en}</div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                    {feats.map((ft, k) => (
                      <a key={k} href={ft.slug} className="truncate text-[12px] text-[color:var(--foreground)] transition hover:text-[color:var(--accent-strong)]" title={ft.name}>{ft.name}</a>
                    ))}
                  </div>
                </div>
              </div>
            );
          }
          const top = nd.by < 50;
          return (
            <a key={i} ref={(el) => { nodeEls.current[i] = el; }} href={nd.slug} className="hfg-node hfg-feat" style={{ textDecoration: "none" }} onPointerEnter={() => setH(i)} onPointerLeave={() => setH(null)}>
              <span className="hfg-dot" style={{ width: 8, height: 8, background: nd.color, boxShadow: `0 0 10px ${nd.color}` }} />
              <span className="hfg-lab text-[12px] font-medium text-[color:var(--foreground)]" style={{ ...lab(nd.side), textShadow: "0 1px 8px rgba(0,0,0,.85)" }}>{nd.label}</span>
              {nd.desc && (
                <div className="hfg-pop rounded-[9px] border border-[color:var(--line)] bg-[rgba(14,15,22,.97)] px-2.5 py-1.5 text-[11.5px] leading-snug text-[color:var(--muted)] shadow-[0_8px_28px_rgba(0,0,0,.5)]"
                  style={{ width: 180, left: "50%", transform: "translateX(-50%)", [top ? "top" : "bottom"]: "calc(100% + 10px)" }}>
                  {zh ? nd.desc.zh : nd.desc.en}
                </div>
              )}
            </a>
          );
        })}
      </div>

      {/* Mobile fallback */}
      <div className="w-full sm:hidden">
        <div className="mx-auto mb-6 w-fit rounded-full border border-[rgba(129,140,248,.5)] bg-[rgba(30,32,46,.92)] px-6 py-4 text-center shadow-[0_0_30px_rgba(99,102,241,.4)]">
          <div className="text-[20px] font-bold text-white">{CENTER[zh ? "zh" : "en"]}</div>
          <div className="text-[13px] font-medium text-[#a5b4fc]">{zh ? CENTER.subZh : CENTER.subEn}</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {cats.map((cat, i) => {
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
