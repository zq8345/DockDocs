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
  await expect(page.getByText("Task Queue", { exact: true })).toBeVisible();
  await expect(page.getByText("Pending", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Running", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Completed", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Failed", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Queue mode:")).toBeVisible();
  await expect(page.getByText("Whitelisted commands only")).toBeVisible();
  await expect(page.getByText("Project Inventory", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Static project snapshot", { exact: true })).toBeVisible();
  await expect(page.getByText("Branch inventory", { exact: true })).toBeVisible();
  await expect(page.getByText("PR inventory", { exact: true })).toBeVisible();
  await expect(page.getByText("Queue summary", { exact: true })).toBeVisible();
  await expect(page.getByText("数据来源：")).toBeVisible();
  await expect(page.getByText("构建时自动生成")).toBeVisible();
  await expect(page.getByText("最后生成时间：")).toBeVisible();
  await expect(page.getByText("同步提醒", { exact: true })).toBeVisible();
  await expect(page.getByText("无同步提醒", { exact: true })).toBeVisible();

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
    await expect(page.getByRole("heading", { name: agent, exact: true }).first()).toBeVisible();
  }

  for (const queueTask of ["OPS-102", "OPS-102A", "DEV-300"]) {
    await expect(page.getByRole("heading", { name: queueTask, exact: true }).first()).toBeVisible();
  }

  for (const inventoryItem of [
    "DEV-100",
    "DEV-200",
    "DEV-300",
    "DEV-301",
    "OPS-100",
    "OPS-102",
    "OPS-103",
    "OPS-104A",
    "OPS-106",
    "Codex OPS",
    "Codex DEV",
  ]) {
    await expect(page.getByRole("heading", { name: inventoryItem, exact: true }).first()).toBeVisible();
  }
});
