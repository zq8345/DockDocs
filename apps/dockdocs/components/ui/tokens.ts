export const dockTokens = {
  color: {
    background: "var(--background)",
    foreground: "var(--foreground)",
    surface: "var(--surface)",
    surfaceSubtle: "var(--surface-subtle)",
    line: "var(--line)",
    muted: "var(--muted)",
    accent: "var(--accent)",
    accentStrong: "var(--accent-strong)",
    softAccent: "var(--soft-accent)",
    success: "var(--success)",
    successSurface: "var(--success-surface)",
    successLine: "var(--success-line)",
    warning: "var(--warning)",
    warningSurface: "var(--warning-surface)",
    warningLine: "var(--warning-line)",
    error: "var(--error)",
    errorSurface: "var(--error-surface)",
    errorLine: "var(--error-line)",
  },
  font: {
    sans: "var(--font-geist-sans)",
    mono: "var(--font-geist-mono)",
  },
  spacing: {
    0: "0",
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    6: "24px",
    8: "32px",
    12: "48px",
    16: "64px",
  },
  radius: {
    sm: "var(--radius-sm)",
    md: "var(--radius)",
    lg: "var(--radius-lg)",
  },
  shadow: {
    none: "none",
    card: "0 18px 55px rgba(15, 23, 42, 0.08)",
  },
} as const;

export type DockTokens = typeof dockTokens;
export type DockTone = "neutral" | "accent" | "success" | "warning" | "error";
