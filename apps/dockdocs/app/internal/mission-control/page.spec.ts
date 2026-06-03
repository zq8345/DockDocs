import { expect, test } from "@playwright/test";

const missionControlUrl = "http://127.0.0.1:3100/internal/mission-control/";

test("internal Mission Control route loads required Phase 1 sections", async ({
  page,
}) => {
  await page.goto(missionControlUrl);

  await expect(page.getByRole("heading", { name: "Mission Control" })).toBeVisible();
  await expect(page.getByText("Progress overview")).toBeVisible();
  await expect(page.getByText("Task lanes")).toBeVisible();
  await expect(page.getByText("Task summary")).toBeVisible();
  await expect(page.getByText("Next recommended action")).toBeVisible();
  await expect(page.getByText("Agent status", { exact: true })).toBeVisible();

  for (const label of ["DEV", "UI", "OPS", "SEO", "GEO"]) {
    await expect(page.getByRole("heading", { name: label, exact: true })).toBeVisible();
  }

  for (const task of [
    "DEV-300 premium AI workspace implementation",
    "UI-300 premium workspace interface readiness",
    "OPS-010 Google OAuth enablement follow-up",
    "OPS-011 production login validation follow-up",
  ]) {
    await expect(page.getByRole("heading", { name: task })).toBeVisible();
  }

  for (const agent of ["GPT", "Hermes PMO", "Hermes DEV", "Hermes UI", "Codex"]) {
    await expect(page.getByRole("heading", { name: agent, exact: true })).toBeVisible();
  }
});
