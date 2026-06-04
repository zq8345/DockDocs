import { expect, test } from "@playwright/test";
import {
  dockTokens,
  type DockTokens,
  type DockTone,
} from "../../components/ui/tokens";

const typedTokens: DockTokens = dockTokens;
const supportedTones: DockTone[] = ["neutral", "accent", "success", "warning", "error"];

test("design tokens expose typed foundations", async () => {
  expect(typedTokens.color.surface).toBe("var(--surface)");
  expect(typedTokens.color.accent).toBe("var(--accent)");
  expect(typedTokens.spacing[4]).toBe("16px");
  expect(typedTokens.radius.md).toBe("var(--radius)");
  expect(supportedTones).toContain("success");
});

test("Card and Status primitives render in Mission Control", async ({ page }) => {
  await page.goto("/internal/mission-control");

  await expect(page.getByTestId("dock-card").first()).toBeVisible();
  await expect(page.getByTestId("dock-status").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "老板驾驶舱" })).toBeVisible();
});

test("Card primitive renders in the workspace dashboard", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page.getByTestId("dock-card").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Document workspace overview." })).toBeVisible();
});
