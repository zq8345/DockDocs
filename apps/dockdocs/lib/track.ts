/**
 * North-star activation event for the growth funnel: fires once per successful
 * tool completion. Routed to self-hosted Umami (privacy-first, cookieless),
 * which is injected by the snippet in app/layout.tsx (production only).
 *
 * 🔴 PRIVACY RED-LINE: the payload is ONLY { slug }. NEVER pass a file name,
 * page count, document content, user id, email, or any other identifier.
 *
 * When window.umami is absent (dev/localhost where the snippet isn't injected,
 * or before it has loaded) this is a silent no-op — callers don't need to guard.
 */

declare global {
  interface Window {
    umami?: { track: (event: string, data?: Record<string, string>) => void };
  }
}

export function trackToolRun(slug: string): void {
  if (typeof window === "undefined") return;
  window.umami?.track("tool_run", { slug });
}
