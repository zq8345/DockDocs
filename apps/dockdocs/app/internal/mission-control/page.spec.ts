import { expect, test, type Page } from "@playwright/test";

const missionControlUrl = "http://127.0.0.1:3100/internal/mission-control/";

test("internal Mission Control route renders Chinese PMO dashboard with auto sync data", async ({
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

  await expect(page.getByText("数据来源：").first()).toBeVisible();
  await expect(page.getByText("构建时自动生成").first()).toBeVisible();
  await expect(page.getByText("最后生成时间：").first()).toBeVisible();
  await expect(page.getByText("同步状态", { exact: true })).toBeVisible();
  await expect(page.getByText("PMO同步正常", { exact: true })).toBeVisible();
  await expect(page.getByText("PMO generated queue", { exact: true })).toBeVisible();
  await expect(page.getByText("Queue source: PMO generated")).toBeVisible();
  await expect(page.getByText("Generated task count:")).toBeVisible();
  await expect(page.getByText("Queue generatedAt:")).toBeVisible();
  await expect(page.getByText("Pending generated tasks:")).toBeVisible();

  for (const label of ["DEV", "UI", "OPS", "SEO", "GEO"]) {
    await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
  }

  for (const task of ["DEV-300", "DEV-301", "UI-301A", "OPS-100", "OPS-102", "OPS-103", "OPS-104A", "OPS-106"]) {
    await expect(page.getByText(task, { exact: true }).first()).toBeVisible();
  }

  await expect(taskCard(page, "DEV-300", "生产中")).toBeVisible();
  await expect(taskCard(page, "DEV-301", "已完成")).toBeVisible();
  await expect(taskCard(page, "UI-301A", "已完成")).toBeVisible();
  await expect(taskCard(page, "OPS-106", "已完成")).toBeVisible();
  await expect(
    page.locator("article").filter({ hasText: "UI-301A 中文内部项目驾驶舱" }).filter({
      hasText: "进行中",
    }),
  ).toHaveCount(0);

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
  await expect(page.getByRole("link", { name: "Convert" }).first()).toBeHidden();
  await expect(page.getByRole("link", { name: "Edit" }).first()).toBeHidden();
  await expect(page.getByRole("link", { name: "Compress" }).first()).toBeHidden();
  await expect(page.getByRole("link", { name: "OCR" }).first()).toBeHidden();
  await expect(page.getByRole("link", { name: "Security" }).first()).toBeHidden();
  await expect(page.getByText("Pricing").first()).toBeHidden();
  await expect(page.getByText("Blog").first()).toBeHidden();
});

function taskCard(page: Page, id: string, status: string) {
  return page.locator("article").filter({ hasText: id }).filter({ hasText: status }).first();
}
