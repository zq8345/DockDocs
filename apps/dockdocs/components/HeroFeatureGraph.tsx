"use client";

import { useState } from "react";
import { navCategories } from "@/components/Header";

type Locale = "en" | "zh";

const CENTER = { zh: "DockDocs", subZh: "懂你的 PDF", en: "DockDocs", subEn: "understands your PDF" };

// Layout per category (by nav order): position, accent color, and the 3 feature anchor points.
const POS = [
  { x: 27, y: 30, color: "#818cf8", feats: [{ x: 11, y: 15 }, { x: 8.5, y: 45 }, { x: 38, y: 9 }] },   // PDF tools — top-left
  { x: 27, y: 70, color: "#c084fc", feats: [{ x: 11, y: 85 }, { x: 8.5, y: 55 }, { x: 38, y: 91 }] },  // Batch — bottom-left
  { x: 73, y: 30, color: "#22d3ee", feats: [{ x: 89, y: 15 }, { x: 91.5, y: 45 }, { x: 62, y: 9 }] },  // AI workflows — top-right
  { x: 73, y: 70, color: "#fbbf24", feats: [{ x: 89, y: 85 }, { x: 91.5, y: 55 }, { x: 62, y: 91 }] }, // By profession — bottom-right
];

// One-line descriptions keyed by route slug. New/unknown tools fall back gracefully.
const DESC: Record<string, { zh: string; en: string }> = {
  "/pdf-to-word": { zh: "PDF 与 Word、Excel、PPT、图片自由互转", en: "PDF ↔ Word, Excel, PPT, images" },
  "/split-pdf": { zh: "拆分、合并、压缩、整理页面", en: "Split, merge, compress, organize pages" },
  "/merge-pdf": { zh: "把多份 PDF 合并成一个", en: "Combine multiple PDFs into one" },
  "/compress-pdf": { zh: "把 PDF 压得更小", en: "Shrink your PDF" },
  "/protect-pdf": { zh: "加密、解锁、电子签名", en: "Encrypt, unlock, e-sign" },
  "/redact-pdf": { zh: "敏感信息真删除,不可恢复", en: "Permanently remove sensitive text" },
  "/sign-pdf": { zh: "给 PDF 加电子签名", en: "Add an e-signature" },
  "/ocr-pdf": { zh: "扫描件变可搜索文字", en: "Make scans searchable" },
  "/chat-with-pdf": { zh: "和 PDF 对话,答案带原文出处", en: "Ask your PDF — answers cite the source" },
  "/ai-summary": { zh: "一键读懂长文档要点", en: "Grasp a long document's key points" },
  "/translate-pdf": { zh: "翻译文档,保留要点", en: "Translate documents, meaning intact" },
  "/flashcards": { zh: "文档一键生成抽认卡", en: "Turn documents into flashcards" },
  "/compare": { zh: "多份合同/报价并排对比,秒选最优", en: "Compare contracts & quotes side by side" },
  "/redline": { zh: "对比两版文档,标出增删", en: "Compare two versions, mark changes" },
  "/extract-to-excel": { zh: "把关键字段抽成 Excel", en: "Pull key fields into a spreadsheet" },
  "/classify": { zh: "自动分类、打标签", en: "Auto-classify and tag" },
  "/batch-compress": { zh: "整个文件夹一次处理", en: "Process a whole folder at once" },
  "/batch-pdf-to-image": { zh: "整批 PDF 转图片", en: "A folder of PDFs → images" },
  "/batch-sort": { zh: "AI 把杂乱文件自动归类", en: "AI sorts a messy pile into folders" },
  "/batch-extract-sheet": { zh: "一堆发票 → 一张总表", en: "A pile of invoices → one sheet" },
};
const SOON_DESC = { zh: "专业方案,即将推出", en: "Pro solution — coming soon" };

type Item = { name: string; slug: string };
function pickFeatures(cat: { cols: { items: Item[] }[] }): Item[] {
  const out: Item[] = [];
  for (const col of cat.cols) if (col.items?.[0]) out.push(col.items[0]);
  for (const col of cat.cols) for (const it of (col.items ?? []).slice(1)) { if (out.length >= 3) break; if (!out.includes(it)) out.push(it); }
  return out.slice(0, 3);
}

export function HeroFeatureGraph({ locale = "en" }: { locale?: Locale }) {
  const zh = locale === "zh";
  const [active, setActive] = useState<string | null>(null);
  const cats = (navCategories[zh ? "zh" : "en"] ?? navCategories.en).slice(0, 4);

  const built = cats.map((cat, i) => ({
    label: cat.label,
    ...POS[i],
    feats: pickFeatures(cat).map((it) => {
      const soon = it.slug === "/pricing";
      return { name: it.name, slug: it.slug, soon, desc: DESC[it.slug] ?? (soon ? SOON_DESC : null) };
    }),
  }));

  return (
    <div className="hfg-wrap">
      <style>{`
        .hfg-wrap{position:relative;width:100%;}
        @keyframes hfg-float{0%,100%{transform:translate(-50%,-50%) translateY(0)}50%{transform:translate(-50%,-50%) translateY(-7px)}}
        @keyframes hfg-pulse{0%,100%{opacity:.55;transform:translate(-50%,-50%) scale(1)}50%{opacity:.9;transform:translate(-50%,-50%) scale(1.18)}}
        @keyframes hfg-in{from{opacity:0;transform:translate(-50%,-50%) scale(.6)}to{opacity:1}}
        .hfg-node{position:absolute;animation:hfg-in .7s cubic-bezier(.2,.8,.2,1) backwards;}
        .hfg-float{animation:hfg-in .7s cubic-bezier(.2,.8,.2,1) backwards, hfg-float var(--d,6s) ease-in-out infinite;}
        .hfg-feat{cursor:pointer;}
        .hfg-pill{white-space:nowrap;transition:transform .25s cubic-bezier(.2,.8,.2,1),box-shadow .25s,border-color .25s,background .25s;}
        .hfg-feat:hover .hfg-pill{transform:scale(1.09);}
        .hfg-tip{position:absolute;left:50%;transform:translateX(-50%) translateY(4px);opacity:0;pointer-events:none;transition:opacity .2s,transform .2s;z-index:30;}
        .hfg-feat:hover .hfg-tip{opacity:1;transform:translateX(-50%) translateY(0);}
        @media (prefers-reduced-motion: reduce){.hfg-float{animation:hfg-in .7s backwards}}
      `}</style>

      <div className="relative mx-auto hidden w-full max-w-[940px] sm:block" style={{ aspectRatio: "16 / 10" }}>
        <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            {built.map((c, i) => (
              <linearGradient key={i} id={`hfg-g${i}`} x1="50" y1="50" x2={c.x} y2={c.y} gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#6366f1" stopOpacity="0.55" />
                <stop offset="1" stopColor={c.color} stopOpacity="0.7" />
              </linearGradient>
            ))}
          </defs>
          {built.map((c, i) => (
            <g key={i}>
              <line x1="50" y1="50" x2={c.x} y2={c.y} stroke={`url(#hfg-g${i})`} strokeWidth="0.4" vectorEffect="non-scaling-stroke" strokeLinecap="round"
                strokeDasharray="2 2" style={{ animation: "hfg-flow 1.4s linear infinite" }} />
              {c.feats.map((_f, j) => (
                <line key={j} x1={c.x} y1={c.y} x2={c.feats[j] ? POS[i].feats[j].x : c.x} y2={POS[i].feats[j].y} stroke={c.color}
                  strokeOpacity={active === null || active === `${i}-${j}` ? 0.32 : 0.12} strokeWidth="0.35" vectorEffect="non-scaling-stroke" strokeLinecap="round" style={{ transition: "stroke-opacity .25s" }} />
              ))}
            </g>
          ))}
        </svg>

        <span className="hfg-node" style={{ left: "50%", top: "50%", width: 150, height: 150, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,.45), transparent 70%)", animation: "hfg-pulse 4.5s ease-in-out infinite", transform: "translate(-50%,-50%)", zIndex: 1 }} />

        <div className="hfg-node hfg-float" style={{ left: "50%", top: "50%", zIndex: 20, ["--d" as string]: "7s" }}>
          <div className="flex flex-col items-center justify-center rounded-full border border-[rgba(129,140,248,.5)] bg-[rgba(30,32,46,.92)] px-7 py-5 text-center shadow-[0_0_42px_rgba(99,102,241,.45)]" style={{ minWidth: 168 }}>
            <span className="text-[19px] font-bold tracking-tight text-white">{CENTER[zh ? "zh" : "en"]}</span>
            <span className="mt-0.5 text-[12.5px] font-medium text-[#a5b4fc]">{zh ? CENTER.subZh : CENTER.subEn}</span>
          </div>
        </div>

        {built.map((c, i) => (
          <div key={i} className="hfg-node hfg-float" style={{ left: `${c.x}%`, top: `${c.y}%`, zIndex: 15, animationDelay: `${0.1 + i * 0.08}s`, ["--d" as string]: `${5.5 + i * 0.7}s` }}>
            <div className="hfg-pill flex items-center gap-1.5 rounded-full border px-4 py-2 font-semibold backdrop-blur-sm"
              style={{ borderColor: `${c.color}66`, background: `${c.color}1f`, color: "#fff", boxShadow: `0 0 22px ${c.color}33`, fontSize: 14 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: c.color, boxShadow: `0 0 8px ${c.color}` }} />
              {c.label}
            </div>
          </div>
        ))}

        {built.map((c, i) => c.feats.map((f, j) => {
          const id = `${i}-${j}`;
          const fp = POS[i].feats[j];
          const tipBelow = fp.y < 46;
          return (
            <a key={id} href={f.soon ? undefined : f.slug} className="hfg-node hfg-feat" aria-disabled={f.soon}
              onMouseEnter={() => setActive(id)} onMouseLeave={() => setActive(null)} onClick={(e) => { if (f.soon) e.preventDefault(); }}
              style={{ left: `${fp.x}%`, top: `${fp.y}%`, zIndex: 16, animationDelay: `${0.3 + (i * 3 + j) * 0.05}s`, ["--d" as string]: `${5 + ((i + j) % 4) * 0.6}s`, textDecoration: "none" }}>
              <div className="hfg-pill flex items-center gap-1.5 rounded-full border border-[color:var(--line)] bg-[rgba(22,24,34,.9)] px-3 py-1.5 text-[12.5px] font-medium text-[color:var(--foreground)] hover:border-[color:var(--line-strong)]"
                style={active === id ? { borderColor: c.color, boxShadow: `0 0 18px ${c.color}55` } : undefined}>
                {f.name}
                {f.soon && <span className="rounded-full bg-[rgba(251,191,36,.16)] px-1.5 py-0.5 text-[9px] font-semibold uppercase text-[#fbbf24]">soon</span>}
              </div>
              {f.desc && (
                <div className="hfg-tip" style={{ [tipBelow ? "top" : "bottom"]: "calc(100% + 8px)" }}>
                  <div className="max-w-[210px] rounded-[10px] border border-[color:var(--line)] bg-[rgba(16,17,25,.97)] px-3 py-2 text-center text-[12px] leading-snug text-[color:var(--muted)] shadow-[0_8px_30px_rgba(0,0,0,.5)]">
                    {zh ? f.desc.zh : f.desc.en}
                  </div>
                </div>
              )}
            </a>
          );
        }))}
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
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: c.color }} />
                {c.label}
              </div>
              <ul className="mt-1.5 space-y-0.5 text-[12px] text-[color:var(--muted)]">
                {c.feats.map((f, j) => <li key={j}>{f.name}{f.soon ? " ·soon" : ""}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
