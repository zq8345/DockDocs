// Single source of truth for page-level container widths.
// Import LAYOUT and use LAYOUT.content / LAYOUT.appShell in className
// template literals instead of bare Tailwind max-w-*xl strings.
// The pre-push guard (scripts/check-layout-constants.mjs) rejects any file
// that contains a bare mx-auto + max-w-(4xl|5xl|6xl|7xl) literal outside this file.
//
// Two tiers only:
//   content   = all page-level outer frames (marketing, info, tool pages, reading)
//   appShell  = workspace shell (my-chats, upgrade, mission-control)
// Inner work columns (upload box, result panels) are component-internal and not governed here.

export const LAYOUT = {
  /** All page-level outer frames: marketing, info, tool pages, AI tools, reading */
  content: "max-w-6xl",
  /** Workspace / app-shell (my-chats, upgrade, mission-control dashboard) */
  appShell: "max-w-7xl",
} as const;

export type LayoutSlot = keyof typeof LAYOUT;
