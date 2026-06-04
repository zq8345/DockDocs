import { expect, test } from "@playwright/test";
import {
  dockTokens,
  type DockTokens,
  type DockTone,
} from "../../components/ui/tokens";
import {
  AccountCard,
  ActionCard,
  ChatCard,
  DocumentCard,
  MetricCard,
  SourceCard,
  StatusCard,
} from "../../components/ui/cards";
import {
  dockStatusGroups,
  getStatusTone,
  normalizeStatusLabel,
  StatusBadge,
  type DockStatusLabel,
} from "../../components/ui/Status";

const typedTokens: DockTokens = dockTokens;
const supportedTones: DockTone[] = ["neutral", "accent", "success", "warning", "error"];
const requiredStatuses: DockStatusLabel[] = [
  ...dockStatusGroups.core,
  ...dockStatusGroups.data,
  ...dockStatusGroups.document,
  ...dockStatusGroups.agent,
];
const cardPrimitives = [
  MetricCard,
  DocumentCard,
  ChatCard,
  SourceCard,
  StatusCard,
  AccountCard,
  ActionCard,
];

test("design tokens expose typed foundations", async () => {
  expect(typedTokens.color.surface).toBe("var(--surface)");
  expect(typedTokens.color.accent).toBe("var(--accent)");
  expect(typedTokens.spacing[4]).toBe("16px");
  expect(typedTokens.radius.md).toBe("var(--radius)");
  expect(supportedTones).toContain("success");
  for (const Primitive of cardPrimitives) {
    expect(typeof Primitive).toBe("function");
  }
  expect(typeof StatusBadge).toBe("function");
  expect(requiredStatuses).toContain("Production");
  expect(requiredStatuses).toContain("Session-only");
  expect(requiredStatuses).toContain("Citation");
  expect(requiredStatuses).toContain("Needs Review");
  expect(getStatusTone("Production")).toBe("success");
  expect(getStatusTone("Blocked")).toBe("error");
  expect(getStatusTone("PDF")).toBe("accent");
  expect(normalizeStatusLabel("已完成")).toBe("Completed");
});

test("Card, Status, SourceCard, StatusCard, and ActionCard render in Mission Control", async ({
  page,
}) => {
  await page.goto("/internal/mission-control");

  await expect(page.getByTestId("dock-card").first()).toBeVisible();
  await expect(page.getByTestId("dock-status").first()).toBeVisible();
  await expect(page.getByTestId("dock-source-card").first()).toBeVisible();
  await expect(page.getByTestId("dock-status-card").first()).toBeVisible();
  await expect(page.getByTestId("dock-action-card").first()).toBeVisible();
  await expect(page.getByText("Synced").first()).toBeVisible();
  await expect(page.getByText("Local").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "老板驾驶舱" })).toBeVisible();
});

test("MetricCard, DocumentCard, ChatCard, AccountCard, and ActionCard render in the workspace dashboard", async ({
  page,
}) => {
  await page.goto("/dashboard");

  await expect(page.getByTestId("dock-card").first()).toBeVisible();
  await expect(page.getByTestId("dock-metric-card").first()).toBeVisible();
  await expect(page.getByTestId("dock-document-card").first()).toBeVisible();
  await expect(page.getByTestId("dock-chat-card").first()).toBeVisible();
  await expect(page.getByTestId("dock-account-card").first()).toBeVisible();
  await expect(page.getByTestId("dock-action-card").first()).toBeVisible();
  await expect(page.getByText("Example").first()).toBeVisible();
  await expect(page.getByText("Local").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Document workspace overview." })).toBeVisible();
});

test("unified status badges render across AI workspace and Chat PDF", async ({ page }) => {
  await page.goto("/ai-workspace");

  await expect(page.getByText("AI Workspace layer").first()).toBeVisible();
  await expect(page.getByText("Uploaded").first()).toBeVisible();
  await expect(page.getByText("Parsed").first()).toBeVisible();
  await expect(page.getByText("Exported").first()).toBeVisible();

  await page.goto("/chat-with-pdf");

  await expect(page.getByTestId("dock-status").first()).toBeVisible();
  await expect(page.getByText("PDF").first()).toBeVisible();
  await expect(page.getByText("Source").first()).toBeVisible();
});

test("account and saved chat surfaces use unified data status badges", async ({
  page,
}) => {
  await page.goto("/account");

  await expect(page.getByTestId("dock-status").first()).toBeVisible();

  await page.goto("/my-chats");

  await expect(page.getByTestId("dock-status").first()).toBeVisible();
  await expect(page.getByText(/Session-only|Saved|Local/).first()).toBeVisible();
});
