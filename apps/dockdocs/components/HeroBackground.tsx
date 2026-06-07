// Futuristic SaaS hero background — layered grid, glow orbs, and a subtle
// animated conic shimmer. Pure CSS/SVG, theme-aware, GPU-friendly.

export function HeroBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Perspective grid that fades toward the top */}
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, #000 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, #000 30%, transparent 75%)",
        }}
      />

      {/* Primary accent glow */}
      <div
        className="absolute left-1/2 top-[-180px] h-[560px] w-[920px] -translate-x-1/2 rounded-full opacity-[0.18] blur-[8px]"
        style={{ background: "radial-gradient(ellipse at center, var(--accent) 0%, transparent 65%)" }}
      />

      {/* Secondary side glows for depth */}
      <div
        className="absolute left-[6%] top-[28%] h-[280px] w-[280px] rounded-full opacity-[0.10] blur-[6px]"
        style={{ background: "radial-gradient(circle, #22d3ee 0%, transparent 70%)" }}
      />
      <div
        className="absolute right-[6%] top-[20%] h-[320px] w-[320px] rounded-full opacity-[0.10] blur-[6px]"
        style={{ background: "radial-gradient(circle, #a855f7 0%, transparent 70%)" }}
      />

      {/* Slow rotating conic shimmer behind the headline */}
      <div className="absolute left-1/2 top-[-220px] h-[640px] w-[640px] -translate-x-1/2">
        <div
          className="dd-spin h-full w-full rounded-full opacity-[0.08]"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, var(--accent) 60deg, transparent 140deg, #22d3ee 220deg, transparent 300deg)",
            maskImage: "radial-gradient(circle, transparent 55%, #000 56%, #000 70%, transparent 72%)",
            WebkitMaskImage: "radial-gradient(circle, transparent 55%, #000 56%, #000 70%, transparent 72%)",
          }}
        />
      </div>

      {/* Fine top highlight line */}
      <div
        className="absolute inset-x-0 top-0 h-px opacity-60"
        style={{ background: "linear-gradient(90deg, transparent, var(--accent), transparent)" }}
      />

      <style>{`
        @keyframes dd-spin { to { transform: rotate(360deg); } }
        .dd-spin { animation: dd-spin 28s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .dd-spin { animation: none; } }
      `}</style>
    </div>
  );
}
