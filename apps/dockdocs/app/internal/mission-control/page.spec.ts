import { expect, test } from "@playwright/test";

const missionControlUrl = "http://127.0.0.1:3100/internal/mission-control/";

test("internal Mission Control route renders Chinese PMO dashboard", async ({
  page,
}) => {
  await page.goto(missionControlUrl);

  await expect(page.getByRole("heading", { name: "任务控制中心" })).toBeVisible();
  await expect(page.getByText("项目总览")).toBeVisible();
  await expect(page.getByText("任务泳道")).toBeVisible();
  await expect(page.getByText("任务队列", { exact: true })).toBeVisible();
  await expect(page.getByText("项目资产清单", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("代理状态", { exact: true })).toBeVisible();
  await expect(page.getByText("下一步建议", { exact: true })).toBeVisible();
  await expect(page.getByText("静态项目快照", { exact: true })).toBeVisible();

  for (const label of ["DEV", "UI", "OPS", "SEO", "GEO"]) {
    await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
  }

  for (const task of ["DEV-300", "OPS-100", "OPS-102", "OPS-103", "OPS-104A"]) {
    await expect(page.getByText(task, { exact: true }).first()).toBeVisible();
  }

  for (const agent of ["GPT 超级大脑", "Hermes 项目管理", "Codex 执行器"]) {
    await expect(page.getByRole("heading", { name: agent, exact: true }).first()).toBeVisible();
  }

  await expect(page.getByText("等待中", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("执行中", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("已完成", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("失败", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("已跳过", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("仅本地 DEV/QA 使用").first()).toBeVisible();
  await expect(page.getByText("仅允许白名单命令")).toBeVisible();

  await expect(page.getByText("Related Workspaces").first()).toBeHidden();
  await expect(page.getByRole("link", { name: "AI Workspace" }).first()).toBeHidden();
  await expect(page.getByRole("link", { name: "Convert" }).first()).toBeHidden();
  await expect(page.getByRole("link", { name: "Edit" }).first()).toBeHidden();
  await expect(page.getByRole("link", { name: "Compress" }).first()).toBeHidden();
  await expect(page.getByRole("link", { name: "OCR" }).first()).toBeHidden();
  await expect(page.getByRole("link", { name: "Security" }).first()).toBeHidden();
});
