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

const typedTokens: DockTokens = dockTokens;
const supportedTones: DockTone[] = ["neutral", "accent", "success", "warning", "error"];
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
