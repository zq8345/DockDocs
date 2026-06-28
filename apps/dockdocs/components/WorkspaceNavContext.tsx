"use client";

import { createContext, useContext } from "react";

/**
 * Provides workspace-internal navigation so that components like UpgradePrompt,
 * UpgradeFlow, PricingPlans, and MyChatsClient can navigate within the app shell
 * instead of doing hard window.location.href redirects that break the zero-escape rule.
 *
 * When null (components rendered outside the workspace), callers fall back to the
 * original navigation (window.location.href / router.push).
 */
export const WorkspaceNavContext = createContext<((slug: string) => void) | null>(null);

/** Use inside any component that might be rendered inside the workspace shell. */
export function useWorkspaceNav() {
  return useContext(WorkspaceNavContext);
}
