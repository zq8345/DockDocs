/**
 * GroundedExplainer — the standing source-grounding prose, promoted into the
 * shell contract (方案: AI统一壳方案-2026-07-03 §7). Wraps GroundingNote so shell
 * consumers (incl. embedded/workspace contexts) mount the moat copy through one
 * atom; the c544023 removal of the !embedded gate made it unconditional on the
 * standalone AI pages — this closes the contract for shell pages going forward.
 */

import { GroundingNote } from "@/components/GroundingNote";

export function GroundedExplainer({
  variant,
  locale = "en",
}: {
  variant: "chat" | "contract" | "summary";
  locale?: string;
}) {
  return <GroundingNote variant={variant} locale={locale} />;
}
