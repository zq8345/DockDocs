"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { WorkspaceSidebar } from "@/components/WorkspaceSidebar";

// ── Quick-start tool cards ──────────────────────────────────────────────────
const TOOLS = [
  {
    key: "contract-risk",
    href: "/contract-risk",
    label: "Contract Review",
    desc: "Flag risky clauses, verified against source",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M5 3h10a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
        <path d="M7 8h6M7 12h4" />
        <circle cx="14" cy="14.5" r="2.5" />
        <path d="m16 16.5 1.5 1.5" />
      </svg>
    ),
  },
  {
    key: "chat-with-pdf",
    href: "/chat-with-pdf",
    label: "AI Chat",
    desc: "Ask questions, get grounded answers",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M3 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H7l-4 3V4Z" />
      </svg>
    ),
  },
  {
    key: "compare",
    href: "/compare",
    label: "Compare Docs",
    desc: "Side-by-side diff with AI explanation",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <rect x="2" y="3" width="7" height="14" rx="1" />
        <rect x="11" y="3" width="7" height="14" rx="1" />
        <path d="M9 10h2" />
      </svg>
    ),
  },
  {
    key: "ai-summary",
    href: "/ai-summary",
    label: "AI Summary",
    desc: "Extract key points from any document",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M4 5h12M4 9h8M4 13h10M4 17h6" />
      </svg>
    ),
  },
] as const;

// ── Component ───────────────────────────────────────────────────────────────
export function DashboardWorkspace() {
  const router = useRouter();
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (!file) return;
      router.push("/chat-with-pdf");
    },
    [router],
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[color:var(--background)]">
      <WorkspaceSidebar />

      {/* ── Right panel ── */}
      <main
        className="flex flex-1 flex-col overflow-y-auto"
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-8 py-12">

          {/* Heading */}
          <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--faint)]">
            Quick start
          </p>

          {/* Tool cards — 2×2 grid */}
          <div className="grid grid-cols-2 gap-3">
            {TOOLS.map((tool) => (
              <a
                key={tool.key}
                href={tool.href}
                className="group flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)] p-5 transition hover:border-[color:var(--accent)]"
              >
                <span className="text-[color:var(--muted)] transition group-hover:text-[color:var(--accent)]">
                  {tool.icon}
                </span>
                <div>
                  <p className="text-[14px] font-semibold text-[color:var(--foreground)]">{tool.label}</p>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-[color:var(--muted)]">{tool.desc}</p>
                </div>
              </a>
            ))}
          </div>

          {/* Drop zone */}
          <div
            className={`mt-6 flex flex-col items-center justify-center rounded-[var(--radius-lg)] border-2 border-dashed px-6 py-10 text-center transition ${
              dragOver
                ? "border-[color:var(--accent)] bg-[rgba(62,207,142,0.06)]"
                : "border-[color:var(--line)] hover:border-[color:var(--line-strong)]"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mb-3 h-8 w-8 text-[color:var(--faint)]"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p className="text-[14px] font-medium text-[color:var(--muted)]">
              {dragOver ? "Drop to open with AI Chat" : "Drop a document here"}
            </p>
            <p className="mt-1 text-[12px] text-[color:var(--faint)]">PDF · Word · Excel · PowerPoint</p>
          </div>

          {/* Privacy note */}
          <p className="mt-auto pt-8 text-center text-[11.5px] text-[color:var(--faint)]">
            ⚿ Your files are processed in your browser · never uploaded to a server
          </p>
        </div>
      </main>
    </div>
  );
}
