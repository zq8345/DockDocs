"use client";

type Locale = "en" | "zh";

const T = {
  en: {
    doc: "report-Q4.pdf",
    q: "How much did Q4 revenue grow YoY?",
    a1: "Up ",
    a2: "23%",
    a3: " year over year — driven mostly by the APAC region.",
    cite: "Source · p.4 · Revenue table",
    note: "Grounded answer — every figure points back to the source.",
  },
  zh: {
    doc: "Q4-财报.pdf",
    q: "Q4 营收同比增长多少？",
    a1: "同比增长 ",
    a2: "23%",
    a3: "，主要来自亚太区。",
    cite: "来源 · 第 4 页 · 营收表",
    note: "答案可溯源 —— 每个数字都能点回原文。",
  },
};

const KF = `
@keyframes ddRise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes ddPulse{0%,100%{opacity:.55}50%{opacity:1}}
@keyframes ddBlink{0%,100%{opacity:.2}50%{opacity:1}}
`;

export function HeroChatDemo({ locale = "en" }: { locale?: Locale }) {
  const t = T[locale] ?? T.en;
  return (
    <div className="relative mx-auto w-full max-w-md">
      <style>{KF}</style>
      <div className="rounded-[var(--radius-xl)] border border-[color:var(--line)] bg-[color:var(--surface)] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.5)]">
        {/* Document tab */}
        <div
          className="flex items-center gap-2 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3 py-2"
          style={{ animation: "ddRise .5s ease-out both" }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-[color:var(--accent)]">
            <path d="M4 2h5l3 3v9H4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
            <path d="M9 2v3h3" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
          </svg>
          <span className="text-[12.5px] font-medium text-[color:var(--muted)]">{t.doc}</span>
          <span className="ml-auto flex gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--line-strong)]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--line-strong)]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent)]" style={{ animation: "ddBlink 1.6s ease-in-out infinite" }} />
          </span>
        </div>

        {/* Question */}
        <div className="mt-3 flex justify-end" style={{ animation: "ddRise .5s ease-out both", animationDelay: ".18s" }}>
          <div className="max-w-[80%] rounded-[14px] rounded-br-[4px] bg-[color:var(--accent)] px-3.5 py-2 text-[13px] font-medium text-white">
            {t.q}
          </div>
        </div>

        {/* Answer with citation */}
        <div className="mt-2 flex justify-start" style={{ animation: "ddRise .5s ease-out both", animationDelay: ".5s" }}>
          <div className="max-w-[88%] rounded-[14px] rounded-bl-[4px] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-3.5 py-2.5 text-[13px] leading-6 text-[color:var(--foreground)]">
            {t.a1}
            <mark
              className="rounded bg-[color:var(--soft-accent)] px-1 font-semibold text-[color:var(--accent-strong)]"
              style={{ animation: "ddPulse 2.6s ease-in-out infinite" }}
            >
              {t.a2}
            </mark>
            {t.a3}
            <div
              className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[color:var(--line-strong)] bg-[color:var(--surface)] px-2.5 py-1 text-[11px] font-medium text-[color:var(--accent-strong)]"
              style={{ animation: "ddPulse 2.6s ease-in-out infinite" }}
            >
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                <path d="M4 2h5l3 3v9H4z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              </svg>
              {t.cite}
            </div>
          </div>
        </div>

        <p className="mt-3 text-center text-[11px] leading-5 text-[color:var(--faint)]">{t.note}</p>
      </div>
    </div>
  );
}
