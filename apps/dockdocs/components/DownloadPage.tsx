"use client";

import { useEffect, useState } from "react";

// BeforeInstallPromptEvent is not in standard lib.dom but exists at runtime.
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const STEPS_DESKTOP = [
  "Open dockdocs.app in Chrome or Edge",
  "Click the install icon (⊕) in the address bar",
  'Choose "Install" — DockDocs opens as its own window',
];

const STEPS_IOS = [
  "Open dockdocs.app in Safari",
  'Tap the Share button (⎙) at the bottom',
  'Scroll down and tap "Add to Home Screen"',
];

const COMING_SOON_PLATFORMS = [
  {
    name: "Windows",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8">
        <path d="M3 5.557 10.125 4.5v7.125H3zm0 12.886L10.125 19.5V12.375H3zm7.875 1.182L21 21v-8.625H10.875zM10.875 3 21 4.557V12H10.875z" />
      </svg>
    ),
    ext: ".exe",
  },
  {
    name: "macOS",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.15-2.15 1.27-2.13 3.79.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.79M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
    ),
    ext: ".dmg",
  },
];

export function DownloadPage() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showIosSteps, setShowIosSteps] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    // Detect already-installed PWA (display-mode: standalone)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
    }
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setInstalled(true);
      setInstallPrompt(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      {/* Hero */}
      <div className="mb-12 text-center">
        <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface)] text-[color:var(--accent)]">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2" />
            <path d="M12 18h.01" />
          </svg>
        </span>
        <h1 className="mt-4 text-[28px] font-semibold tracking-[-0.02em] text-[color:var(--foreground)]">
          Get DockDocs on your device
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-[color:var(--muted)]">
          Install the web app for offline access and a native feel — or wait for the upcoming desktop app.
        </p>
      </div>

      {/* PWA Section */}
      <section className="mb-8 overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-[color:var(--surface)]">
        <div className="border-b border-[color:var(--line)] px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--faint)]">Web App</p>
              <h2 className="mt-0.5 text-[17px] font-semibold text-[color:var(--foreground)]">Install to your device</h2>
            </div>
            <span className="rounded-full bg-[color:var(--accent)]/15 px-2.5 py-0.5 text-[10px] font-semibold text-[color:var(--accent)]">
              Available now
            </span>
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-[color:var(--muted)]">
            Works on Windows, Mac, iOS, and Android. No app store required — install directly from your browser.
          </p>
        </div>

        <div className="p-6">
          {installed ? (
            <div className="flex items-center gap-3 rounded-[var(--radius)] border border-[color:var(--accent)]/30 bg-[color:var(--accent)]/10 px-4 py-3 text-[13px] text-[color:var(--accent)]">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3.2 3.2L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              DockDocs is already installed on this device.
            </div>
          ) : installPrompt ? (
            <button
              type="button"
              onClick={() => void handleInstall()}
              className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-[color:var(--accent)] px-5 py-2.5 text-[14px] font-semibold text-[color:var(--on-accent)] transition hover:opacity-90"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4M7 11l5 5 5-5" /><path d="M5 16v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" /></svg>
              Install DockDocs
            </button>
          ) : (
            <p className="text-[13px] text-[color:var(--muted)]">
              Open this page in Chrome or Edge on desktop to get a one-click install button.
            </p>
          )}

          {/* Desktop steps */}
          <div className="mt-6">
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.1em] text-[color:var(--faint)]">
              Desktop (Chrome / Edge)
            </p>
            <ol className="space-y-2">
              {STEPS_DESKTOP.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-[13px] text-[color:var(--muted)]">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[color:var(--line)] text-[10px] font-semibold text-[color:var(--faint)]">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* iOS steps toggle */}
          <div className="mt-5 border-t border-[color:var(--line)] pt-5">
            <button
              type="button"
              onClick={() => setShowIosSteps((v) => !v)}
              className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-[color:var(--faint)] transition hover:text-[color:var(--muted)]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${showIosSteps ? "rotate-90" : ""}`}><path d="M9 18l6-6-6-6" /></svg>
              iOS / Safari steps
            </button>
            {showIosSteps && (
              <ol className="mt-3 space-y-2">
                {STEPS_IOS.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-[13px] text-[color:var(--muted)]">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[color:var(--line)] text-[10px] font-semibold text-[color:var(--faint)]">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </section>

      {/* Desktop Apps Coming Soon */}
      <section>
        <h2 className="mb-4 text-[15px] font-semibold text-[color:var(--foreground)]">Desktop apps</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {COMING_SOON_PLATFORMS.map(({ name, icon, ext }) => (
            <div
              key={name}
              className="flex items-center gap-4 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-5 py-4"
            >
              <span className="shrink-0 text-[color:var(--faint)]">{icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-[color:var(--foreground)]">{name}</p>
                <p className="text-[11px] text-[color:var(--faint)]">{ext} installer</p>
              </div>
              <span className="shrink-0 rounded border border-[color:var(--line)] px-2 py-0.5 text-[10px] font-medium text-[color:var(--faint)]">
                Coming soon
              </span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-[12px] text-[color:var(--faint)]">
          The web app already works offline and covers all functionality — the desktop app adds OS-level integration.
        </p>
      </section>

      {/* Privacy bar */}
      <div className="mt-8 flex items-start gap-3 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--surface-subtle)] px-5 py-4">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-px shrink-0 text-[color:var(--accent)]">
          <path d="M8 1.5L2 4v4c0 3.3 2.5 6.4 6 7 3.5-.6 6-3.7 6-7V4L8 1.5z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round"/>
        </svg>
        <p className="text-[12px] leading-relaxed text-[color:var(--muted)]">
          <span className="font-semibold text-[color:var(--foreground)]">Privacy: </span>
          Most DockDocs tools process your files locally in your browser — nothing is uploaded to our servers.
          A small number of conversion tools (Word↔PDF, Excel, PPT) use our secure conversion service.
          Your files are never stored.{" "}
          <a href="/privacy-policy" className="text-[color:var(--accent)] hover:underline">Privacy policy →</a>
        </p>
      </div>
    </div>
  );
}
