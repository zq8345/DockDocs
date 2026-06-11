"use client";

import { useRef, useState } from "react";
import { navCategories } from "@/components/Header";

type Locale = "en" | "zh";
type Item = { name: string; slug: string };

const CENTER = { zh: "DockDocs", subZh: "懂你的 PDF", en: "DockDocs", subEn: "understands your PDF" };

// Per-category layout (by nav order): position, accent, 3 highlight-node anchors, category blurb.
const POS = [
  { x: 27, y: 30, color: "#818cf8", feats: [{ x: 11, y: 15 }, { x: 8.5, y: 45 }, { x: 38, y: 9 }], dzh: "转换、整理、加密、签名——全套基础 PDF 处理工具", den: "Convert, organize, encrypt, sign — the full PDF toolkit" },
  { x: 27, y: 70, color: "#c084fc", feats: [{ x: 11, y: 85 }, { x: 8.5, y: 55 }, { x: 38, y: 91 }], dzh: "整批 / 整文件夹一次处理,省下重复劳动", den: "Process whole folders in one pass — no repetitive clicking" },
  { x: 73, y: 30, color: "#22d3ee", feats: [{ x: 89, y: 15 }, { x: 91.5, y: 45 }, { x: 62, y: 9 }], dzh: "让 AI 读懂、问答、对比、抽取你的文档", den: "AI that reads, answers, compares and extracts your docs" },
  { x: 73, y: 70, color: "#fbbf24", feats: [{ x: 89, y: 85 }, { x: 91.5, y: 55 }, { x: 62, y: 91 }], dzh: "面向法律 / 财务 / 科研等场景的专项方案", den: "Tailored solutions for legal, finance, research and more" },
];

const DESC: Record<string, { zh: string; en: string }> = {
  "/pdf-to-word": { zh: "PDF 与 Word、Excel、PPT、图片自由互转", en: "PDF ↔ Word, Excel, PPT, images" },
  "/split-pdf": { zh: "拆分、合并、压缩、整理页面", en: "Split, merge, compress, organize pages" },
  "/merge-pdf": { zh: "把多份 PDF 合并成一个", en: "Combine multiple PDFs into one" },
  "/protect-pdf": { zh: "加密、解锁、电子签名", en: "Encrypt, unlock, e-sign" },
  "/redact-pdf": { zh: "敏感信息真删除,不可恢复", en: "Permanently remove sensitive text" },
  "/chat-with-pdf": { zh: "和 PDF 对话,答案带原文出处", en: "Ask your PDF — answers cite the source" },
  "/ai-summary": { zh: "一键读懂长文档要点", en: "Grasp a long document's key points" },
  "/compare": { zh: "多份合同/报价并排对比,秒选最优", en: "Compare contracts & quotes side by side" },
  "/redline": { zh: "对比两版文档,标出增删", en: "Compare two versions, mark changes" },
  "/extract-to-excel": { zh: "把关键字段抽成 Excel", en: "Pull key fields into a spreadsheet" },
  "/batch-compress": { zh: "整个文件夹一次处理", en: "Process a whole folder at once" },
  "/batch-sort": { zh: "AI 把杂乱文件自动归类", en: "AI sorts a messy pile into folders" },
};

function flatItems(cat: { cols: { items: Item[] }[] }): Item[] {
  const seen = new Set<string>(); const out: Item[] = [];
  for (const col of cat.cols) for (const it of col.items ?? []) { const k = it.name + it.slug; if (!seen.has(k)) { seen.add(k); out.push(it); } }
  return out;
}
function pickFeatures(cat: { cols: { items: Item[] }[] }): Item[] {
  const out: Item[] = [];
  for (const col of cat.cols) if (col.items?.[0]) out.push(col.items[0]);
  for (const col of cat.cols) for (const it of (col.items ?? []).slice(1)) { if (out.length >= 3) break; if (!out.includes(it)) out.push(it); }
  return out.slice(0, 3);
}

export function HeroFeatureGraph({ locale = "en" }: { locale?: Locale }) {
  const zh = locale === "zh";
  const cats = (navCategories[zh ? "zh" : "en"] ?? navCategories.en).slice(0, 4);
  const [hoverCat, setHoverCat] = useState<number | null>(null);
  const [hoverFeat, setHoverFeat] = useState<string | null>(null);
  const layer = useRef<HTMLDivElement>(null);

  const built = cats.map((cat, i) => ({
    label: cat.label, ...POS[i],
    feats: pickFeatures(cat).map((it) => ({ name: it.name, slug: it.slug, desc: DESC[it.slug] ?? null })),
    all: flatItems(cat),
  }));

  const onMove = (e: React.MouseEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    if (layer.current) layer.current.style.transform = `translate(${px * -16}px, ${py * -14}px)`;
  };
  const onLeave = () => { if (layer.current) layer.current.style.transform = ""; setHoverCat(null); };
  const dim = (k: number) => (hoverCat !== null && hoverCat !== k ? 0.28 : 1);

  return (
    <div className="hfg-wrap">
      <style>{`
        .hfg-wrap{position:relative;width:100%;}
        @keyframes hfg-float{0%,100%{transform:translate(-50%,-50%) translateY(0)}50%{transform:translate(-50%,-50%) translateY(-7px)}}
        @keyframes hfg-pulse{0%,100%{opacity:.55;transform:translate(-50%,-50%) scale(1)}50%{opacity:.9;transform:translate(-50%,-50%) scale(1.18)}}
        @keyframes hfg-in{from{opacity:0;transform:translate(-50%,-50%) scale(.6)}to{opacity:1}}
        .hfg-layer{position:absolute;inset:0;transition:transform .35s cubic-bezier(.2,.8,.2,1);}
        .hfg-node{position:absolute;animation:hfg-in .7s cubic-bezier(.2,.8,.2,1) backwards;transition:opacity .25s;}
        .hfg-float{animation:hfg-in .7s cubic-bezier(.2,.8,.2,1) backwards, hfg-float var(--d,6s) ease-in-out infinite;}
        .hfg-pill{white-space:nowrap;transition:transform .25s cubic-bezier(.2,.8,.2,1),box-shadow .25s,border-color .25s,background .25s;}
        .hfg-feat:hover .hfg-pill,.hfg-cat:hover .hfg-pill{transform:scale(1.08);}
        .hfg-tip{position:absolute;opacity:0;pointer-events:none;transition:opacity .2s,transform .2s;z-index:40;white-space:nowrap;}
        .hfg-feat:hover .hfg-tip{opacity:1;}
        .hfg-panel{position:absolute;opacity:0;pointer-events:none;transition:opacity .2s,transform .2s;z-index:45;width:248px;}
        .hfg-cat:hover .hfg-panel{opacity:1;pointer-events:auto;}
        @media (prefers-reduced-motion: reduce){.hfg-float{animation:hfg-in .7s backwards}.hfg-layer{transition:none}}
      `}</style>

      <div className="relative mx-auto hidden w-full max-w-[940px] sm:block" style={{ aspectRatio: "16 / 10" }} onMouseMove={onMove} onMouseLeave={onLeave}>
        <div ref={layer} className="hfg-layer">
          <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              {built.map((c, i) => (
                <linearGradient key={i} id={`hfg-g${i}`} x1="50" y1="50" x2={c.x} y2={c.y} gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#6366f1" stopOpacity="0.55" /><stop offset="1" stopColor={c.color} stopOpacity="0.7" />
                </linearGradient>
              ))}
            </defs>
            {built.map((c, i) => (
              <g key={i} style={{ opacity: dim(i), transition: "opacity .25s" }}>
                <line x1="50" y1="50" x2={c.x} y2={c.y} stroke={`url(#hfg-g${i})`} strokeWidth="0.4" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeDasharray="2 2" />
                {c.feats.map((_f, j) => (
                  <line key={j} x1={c.x} y1={c.y} x2={POS[i].feats[j].x} y2={POS[i].feats[j].y} stroke={c.color} strokeOpacity="0.3" strokeWidth="0.35" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
                ))}
              </g>
            ))}
          </svg>

          <span className="hfg-node" style={{ left: "50%", top: "50%", width: 150, height: 150, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,.45), transparent 70%)", animation: "hfg-pulse 4.5s ease-in-out infinite", transform: "translate(-50%,-50%)", zIndex: 1 }} />

          <div className="hfg-node hfg-float" style={{ left: "50%", top: "50%", zIndex: 20, ["--d" as string]: "7s" }}>
            <span className="flex flex-col items-center justify-center rounded-full border border-[rgba(129,140,248,.5)] bg-[rgba(30,32,46,.92)] px-7 py-5 text-center shadow-[0_0_42px_rgba(99,102,241,.45)]" style={{ minWidth: 168 }}>
              <span className="text-[19px] font-bold tracking-tight text-white">{CENTER[zh ? "zh" : "en"]}</span>
              <span className="mt-0.5 text-[12.5px] font-medium text-[#a5b4fc]">{zh ? CENTER.subZh : CENTER.subEn}</span>
            </span>
          </div>

          {/* Category nodes + hover panel listing ALL features */}
          {built.map((c, i) => {
            const top = c.y < 50;
            return (
              <div key={i} className="hfg-node hfg-cat" onMouseEnter={() => setHoverCat(i)} onMouseLeave={() => setHoverCat(null)}
                style={{ left: `${c.x}%`, top: `${c.y}%`, zIndex: hoverCat === i ? 46 : 15, opacity: dim(i), animationDelay: `${0.1 + i * 0.08}s` }}>
                <div className="hfg-float" style={{ ["--d" as string]: `${5.5 + i * 0.7}s` }}>
                  <div className="hfg-pill flex cursor-default items-center gap-1.5 rounded-full border px-4 py-2 font-semibold backdrop-blur-sm"
                    style={{ borderColor: `${c.color}66`, background: `${c.color}1f`, color: "#fff", boxShadow: `0 0 22px ${c.color}33`, fontSize: 14 }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: c.color, boxShadow: `0 0 8px ${c.color}` }} />
                    {c.label}
                  </div>
                </div>
                <div className="hfg-panel rounded-[12px] border bg-[rgba(14,15,22,.98)] p-3 shadow-[0_12px_40px_rgba(0,0,0,.55)]"
                  style={{ left: "50%", transform: "translateX(-50%)", [top ? "top" : "bottom"]: "calc(100% + 10px)", borderColor: `${c.color}55` }}>
                  <div className="mb-2 text-[12px] leading-snug text-[color:var(--muted)]">{zh ? c.dzh : c.den}</div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                    {c.all.map((it, k) => (
                      <a key={k} href={it.slug} className="truncate text-[12px] text-[color:var(--foreground)] transition hover:text-[color:var(--accent-strong)]" title={it.name}>{it.name}</a>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Highlight feature nodes (horizontal tooltip) */}
          {built.map((c, i) => c.feats.map((f, j) => {
            const id = `${i}-${j}`; const fp = POS[i].feats[j];
            const top = fp.y < 46; const right = fp.x > 55;
            return (
              <a key={id} href={f.slug} className="hfg-node hfg-feat" onMouseEnter={() => setHoverFeat(id)} onMouseLeave={() => setHoverFeat(null)}
                style={{ left: `${fp.x}%`, top: `${fp.y}%`, zIndex: hoverFeat === id ? 41 : 16, opacity: dim(i), animationDelay: `${0.3 + (i * 3 + j) * 0.05}s`, textDecoration: "none" }}>
                <div className="hfg-float" style={{ ["--d" as string]: `${5 + ((i + j) % 4) * 0.6}s` }}>
                  <div className="hfg-pill flex items-center gap-1.5 rounded-full border border-[color:var(--line)] bg-[rgba(22,24,34,.92)] px-3 py-1.5 text-[12.5px] font-medium text-[color:var(--foreground)]"
                    style={hoverFeat === id ? { borderColor: c.color, boxShadow: `0 0 18px ${c.color}55` } : undefined}>
                    {f.name}
                  </div>
                </div>
                {f.desc && (
                  <div className="hfg-tip" style={{ [top ? "top" : "bottom"]: "calc(100% + 8px)", left: right ? "auto" : "0", right: right ? "0" : "auto" }}>
                    <div className="rounded-[9px] border border-[color:var(--line)] bg-[rgba(16,17,25,.97)] px-3 py-1.5 text-[12px] text-[color:var(--muted)] shadow-[0_8px_30px_rgba(0,0,0,.5)]">
                      {zh ? f.desc.zh : f.desc.en}
                    </div>
                  </div>
                )}
              </a>
            );
          }))}
        </div>
      </div>

      {/* Mobile fallback */}
      <div className="sm:hidden">
        <div className="mx-auto mb-6 w-fit rounded-full border border-[rgba(129,140,248,.5)] bg-[rgba(30,32,46,.92)] px-6 py-4 text-center shadow-[0_0_30px_rgba(99,102,241,.4)]">
          <div className="text-[20px] font-bold text-white">{CENTER[zh ? "zh" : "en"]}</div>
          <div className="text-[13px] font-medium text-[#a5b4fc]">{zh ? CENTER.subZh : CENTER.subEn}</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {built.map((c, i) => (
            <div key={i} className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-3">
              <div className="flex items-center gap-1.5 text-[13.5px] font-semibold text-[color:var(--foreground)]">
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: c.color }} />{c.label}
              </div>
              <p className="mt-1 text-[11px] leading-snug text-[color:var(--faint)]">{zh ? c.dzh : c.den}</p>
              <ul className="mt-1.5 grid grid-cols-2 gap-x-2 text-[11.5px] text-[color:var(--muted)]">
                {c.all.slice(0, 8).map((f, j) => <li key={j} className="truncate">{f.name}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
