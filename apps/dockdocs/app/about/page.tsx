import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About DockDocs",
  description:
    "DockDocs is a global document productivity team building privacy-first PDF tools for 30M+ users worldwide.",
  alternates: {
    canonical: "/about/",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const stats = [
  ["100+", "team members"],
  ["30M+", "global users"],
  ["5M+", "documents processed daily"],
  ["5", "global offices"],
] as const;

const offices = [
  { region: "APAC", city: "Hong Kong", role: "Headquarters" },
  { region: "AMERICAS", city: "San Francisco", role: "Product and engineering" },
  { region: "APAC", city: "Tokyo", role: "Localization and partnerships" },
  { region: "MEA", city: "Dubai", role: "Growth and support" },
  { region: "EUROPE", city: "Frankfurt", role: "Privacy and compliance" },
] as const;

const principles = [
  {
    title: "Privacy first",
    body: "Local tools keep files in the browser where possible, while cloud-assisted tools are clearly labeled before upload.",
  },
  {
    title: "Built for global use",
    body: "We design around multilingual, multi-region, high-frequency document workflows.",
  },
  {
    title: "Reliable at scale",
    body: "More than 5M daily document tasks require performance, availability, and clear user feedback.",
  },
] as const;

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
      {/* Hero */}
      <section className="text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent-strong)]">
          About
        </p>
        <h1 className="mt-4 text-[36px] font-semibold leading-[1.08] tracking-[-0.018em] sm:text-[48px]">
          A global document productivity team
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-[15px] leading-relaxed text-[color:var(--muted)] sm:text-[17px]">
          DockDocs is headquartered in Hong Kong, with regional teams in San
          Francisco, Tokyo, Dubai, and Frankfurt. Our team of 100+ people builds
          privacy-first PDF tools for 30M+ users worldwide, processing more than
          5M document workflows every day.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href="/"
            className="inline-flex min-h-[42px] items-center rounded-[var(--radius)] bg-[color:var(--accent)] px-5 text-[14px] font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.4)] transition hover:bg-[color:var(--accent-hover)]"
          >
            All PDF Tools
          </a>
          <a
            href="/blog"
            className="inline-flex min-h-[42px] items-center rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] px-5 text-[14px] font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)] hover:bg-[color:var(--surface-subtle)]"
          >
            Blog
          </a>
        </div>
      </section>

      {/* Stats */}
      <section className="mt-20 grid grid-cols-2 gap-4 rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] p-8 sm:grid-cols-4">
        {stats.map(([value, label]) => (
          <div key={label} className="text-center">
            <p className="text-[28px] font-semibold tracking-tight text-[color:var(--foreground)]">
              {value}
            </p>
            <p className="mt-1 text-[12px] font-medium text-[color:var(--faint)]">
              {label}
            </p>
          </div>
        ))}
      </section>

      {/* Global offices */}
      <section className="mt-20">
        <h2 className="text-[28px] font-semibold tracking-[-0.014em]">Global offices</h2>
        <p className="mt-3 text-[14px] leading-relaxed text-[color:var(--muted)]">
          Each regional team owns a clear part of product experience, privacy,
          localization, support, and growth.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {offices.map((office) => (
            <div
              key={office.city}
              className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5 transition hover:border-[color:var(--line-strong)]"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--faint)]">
                {office.region}
              </p>
              <p className="mt-2 text-[16px] font-semibold">{office.city}</p>
              <p className="mt-1 text-[13px] text-[color:var(--muted)]">
                {office.role}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Principles */}
      <section className="mt-20">
        <h2 className="text-[28px] font-semibold tracking-[-0.014em]">
          How we build DockDocs
        </h2>
        <p className="mt-3 text-[14px] leading-relaxed text-[color:var(--muted)]">
          Our goal is not to create a cluttered file toolbox. We connect
          compression, merging, conversion, OCR, AI summary, and Chat with PDF
          into clear document workflows.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {principles.map((p) => (
            <div
              key={p.title}
              className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5 transition hover:border-[color:var(--line-strong)]"
            >
              <p className="text-[14px] font-semibold">{p.title}</p>
              <p className="mt-2 text-[13px] leading-relaxed text-[color:var(--muted)]">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
