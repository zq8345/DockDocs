// Hero backdrop tuned for the feature graph: a faint dot-constellation that
// fades out, a soft accent aurora behind the centre node, and gentle side
// tints for depth. Pure CSS, theme-aware, no heavy motion.

export function HeroBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Dot constellation, fading toward the edges */}
      <div
        className="absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage: "radial-gradient(var(--line) 1.1px, transparent 1.2px)",
          backgroundSize: "34px 34px",
          maskImage: "radial-gradient(ellipse 78% 74% at 50% 44%, #000 32%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 78% 74% at 50% 44%, #000 32%, transparent 80%)",
        }}
      />

      {/* Soft accent aurora behind the graph centre */}
      <div
        className="absolute left-1/2 top-[44%] h-[680px] w-[1120px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.16] blur-[10px]"
        style={{ background: "radial-gradient(ellipse at center, var(--accent) 0%, transparent 62%)" }}
      />

      {/* Faint cyan / violet side tints for depth */}
      <div
        className="absolute left-[8%] top-[58%] h-[300px] w-[300px] -translate-y-1/2 rounded-full opacity-[0.08] blur-[8px]"
        style={{ background: "radial-gradient(circle, #22d3ee 0%, transparent 70%)" }}
      />
      <div
        className="absolute right-[8%] top-[40%] h-[320px] w-[320px] -translate-y-1/2 rounded-full opacity-[0.09] blur-[8px]"
        style={{ background: "radial-gradient(circle, #a855f7 0%, transparent 70%)" }}
      />

      {/* Fine top highlight line */}
      <div
        className="absolute inset-x-0 top-0 h-px opacity-60"
        style={{ background: "linear-gradient(90deg, transparent, var(--accent), transparent)" }}
      />
    </div>
  );
}
