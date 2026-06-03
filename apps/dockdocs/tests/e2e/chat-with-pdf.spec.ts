import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { ensurePdfFixtures } from "./fixtures/pdf";

const workerPath = path.join(
  "pdfjs-dist",
  "build",
  "pdf.worker.min.mjs",
);
const resolvedWorkerPath = require.resolve(workerPath);
const smokeRoutes = [
  "/",
  "/pricing",
  "/chat-with-pdf",
  "/dashboard",
  "/ai-summary",
  "/ocr",
  "/compress-pdf",
  "/pdf-to-word",
  "/blog",
  "/guides",
  "/resources",
  "/ai-pdf-guides",
  "/zh",
  "/zh/pricing",
  "/zh/chat-with-pdf",
  "/zh/dashboard",
  "/zh/ai-summary",
  "/zh/ocr",
  "/zh/compress-pdf",
  "/zh/pdf-to-word",
  "/zh/blog",
  "/zh/guides",
  "/zh/resources",
  "/zh/ai-pdf-guides",
];

test.beforeEach(async ({ page }) => {
  await page.route("https://unpkg.com/pdfjs-dist@*/build/pdf.worker.min.mjs", async (route) => {
    await route.fulfill({
      body: fs.readFileSync(resolvedWorkerPath, "utf8"),
      contentType: "text/javascript",
    });
  });
});

test("loads Chat with PDF workspace and shows three-column UI", async ({ page }) => {
  await page.goto("/chat-with-pdf");

  await expect(page.getByRole("heading", { name: "Ask grounded questions about a PDF." })).toBeVisible();
  await expect(page.getByTestId("document-sidebar")).toBeVisible();
  await expect(page.getByTestId("conversation-workspace")).toBeVisible();
  await expect(page.getByTestId("source-intelligence-panel")).toBeVisible();
  await expect(page.getByTestId("upload-panel")).toBeVisible();
  await expect(page.getByTestId("provider-reference")).toContainText("Waiting for AI response");
});

test("uploads a real small PDF and shows selected, processing, and success state", async ({ page }) => {
  const { small } = ensurePdfFixtures();

  await page.goto("/chat-with-pdf");
  await page.getByTestId("upload-input").setInputFiles(small.filePath);

  await expect(page.getByTestId("document-status")).toContainText(small.name);
  await expect(page.getByTestId("document-status")).toContainText(/Reading PDF text|Ready: extracted/);
  await expect(page.getByTestId("document-status")).toContainText("Ready: extracted");
  await expect(page.getByTestId("result-state")).toContainText("Selectable text extracted");
  await expect(page.getByTestId("source-intelligence-panel")).toContainText("1 page indexed");

  await page.getByTestId("knowledge-card-summary").click();
  await expect(page.getByTestId("chat-input")).toHaveValue("Create an executive summary of this PDF.");
  await expect(page.getByTestId("ask-button")).toBeEnabled();
});

test("knowledge cards fill the chat question", async ({ page }) => {
  await page.goto("/chat-with-pdf");

  await page.getByTestId("knowledge-card-summary").click();
  await expect(page.getByTestId("chat-input")).toHaveValue("Create an executive summary of this PDF.");

  await page.getByTestId("knowledge-card-risks").click();
  await expect(page.getByTestId("chat-input")).toHaveValue(
    "Identify risks, blockers, and obligations in this PDF.",
  );

  await page.getByTestId("knowledge-card-actions").click();
  await expect(page.getByTestId("chat-input")).toHaveValue(
    "List action items, owners, and dates from this PDF.",
  );
});

test("large PDF over 25 MB shows error state", async ({ page }) => {
  const { large } = ensurePdfFixtures();

  await page.goto("/chat-with-pdf");
  await page.getByTestId("upload-input").setInputFiles(large.filePath);

  await expect(page.getByTestId("document-error-state")).toContainText("File size limit exceeded.");
  await expect(page.getByTestId("document-error-state")).toContainText("Please choose a PDF up to 25 MB.");
});

test("provider not configured displays expected error state", async ({ page }) => {
  const { small } = ensurePdfFixtures();

  await page.route("**/.netlify/functions/chat-with-pdf", async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        error:
          "AI provider is not configured. Set DEEPSEEK_API_KEY or DOCKDOCS_AI_SUMMARY_API_KEY before using Chat with PDF.",
      }),
      contentType: "application/json",
      status: 503,
    });
  });

  await page.goto("/chat-with-pdf");
  await page.getByTestId("upload-input").setInputFiles(small.filePath);
  await expect(page.getByTestId("document-status")).toContainText("Ready: extracted");

  await page.getByTestId("chat-input").fill("Who is the owner?");
  await page.getByTestId("ask-button").click();

  await expect(page.getByTestId("chat-error-state")).toContainText("AI provider is not configured.");
  await expect(page.getByTestId("conversation-workspace")).toContainText("Unable to answer");
});

for (const viewport of [
  { height: 720, name: "Desktop 1280", width: 1280 },
  { height: 1024, name: "Tablet 768", width: 768 },
  { height: 844, name: "Mobile 390", width: 390 },
]) {
  test(`${viewport.name} has no horizontal overflow`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/chat-with-pdf");

    const metrics = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));

    expect(metrics.scrollWidth).toBe(metrics.clientWidth);
  });
}

test("dashboard IA is visible in English and Chinese", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Document workspace overview." })).toBeVisible();
  await expect(page.getByRole("link", { name: "View pricing" }).first()).toBeVisible();
  await expect(page.getByText("Conversations", { exact: true })).toBeVisible();
  await expect(page.getByText("Workspace health", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Recommended next steps", { exact: true })).toBeVisible();

  await page.goto("/zh/dashboard");
  await expect(page.getByRole("heading", { name: "文档工作区概览。" })).toBeVisible();
  await expect(page.getByRole("link", { name: "查看价格" }).first()).toBeVisible();
  await expect(page.getByText("最近对话", { exact: true })).toBeVisible();
  await expect(page.getByText("工作区健康", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("建议下一步", { exact: true })).toBeVisible();
});

test("pricing page is localized and responsive", async ({ page }) => {
  await page.goto("/pricing");
  await expect(page.getByRole("heading", { name: "Plans for an AI document workspace." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Free" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Plus" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Pro" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Move from first upload to a wider document workspace." })).toBeVisible();
  await expect(page.getByText("UI only: Stripe")).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/zh/pricing");
  await expect(page.getByRole("heading", { name: "面向 AI 文档工作区的方案。" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "从首次上传扩展到更完整的文档工作区。" })).toBeVisible();
  await expect(page.getByText("仅 UI：本次设计不接 Stripe")).toBeVisible();

  const metrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    lang: document.documentElement.lang,
  }));

  expect(metrics.scrollWidth).toBe(metrics.clientWidth);
  expect(metrics.lang).toBe("zh");
});

test("account workspace binding shows anonymous state and Free placeholder", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/account");
  await expect(page.getByRole("heading", { name: "Register, sign in, and keep workspace data scoped to your account." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue with Google" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Create account" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Free" })).toBeVisible();
  await expect(page.getByText("anonymous", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Stripe Checkout")).toHaveCount(0);

  await page.goto("/dashboard");
  await expect(page.getByText("Sign in to save workspace records under your account.")).toBeVisible();
  await expect(page.getByText("Plan: Free")).toBeVisible();
  await expect(page.getByText("Storage: Anonymous")).toBeVisible();

  await page.goto("/my-chats");
  await expect(page.getByRole("heading", { name: "Sign in to isolate workspace data." })).toBeVisible();
  await expect(page.getByText("Current storage: anonymous · Plan: Free")).toBeVisible();
});

test("header tools and utility menus are keyboard and mobile friendly", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");

  const productNav = page.getByRole("navigation", { name: "DockDocs navigation" });
  await productNav.getByRole("button", { name: "Convert" }).hover();
  await expect(page.locator("#dockdocs-feature-menu-convert")).toContainText("PDF to Word");
  await page.keyboard.press("Escape");
  await expect(page.locator("#dockdocs-feature-menu-convert")).toBeHidden();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/zh");

  await page.getByRole("button", { name: "工具" }).click();
  await expect(page.locator("#dockdocs-tools-menu").getByRole("heading", { name: "AI 工作区" })).toBeVisible();

  await page.getByRole("button", { name: "功能" }).click();
  await expect(page.locator("#dockdocs-tools-menu")).toBeHidden();
  await expect(page.locator("#dockdocs-utility-menu")).toBeVisible();
  await expect(page.getByRole("link", { name: "中文" })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.locator("#dockdocs-utility-menu")).toBeHidden();

  const metrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(metrics.scrollWidth).toBe(metrics.clientWidth);
});

test("primary routes load across desktop, tablet, and mobile without horizontal overflow", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    consoleErrors.push(error.message);
  });
  const viewports = [
    { width: 1280, height: 720 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);

    for (const route of smokeRoutes) {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);

      const metrics = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        lang: document.documentElement.lang,
        title: document.title,
      }));

      expect(metrics.scrollWidth).toBe(metrics.clientWidth);
      expect(metrics.title).not.toContain("| DockDocs | DockDocs");

      if (route.startsWith("/zh")) {
        expect(metrics.lang).toBe("zh");
      }
    }
  }

  expect(consoleErrors).toEqual([]);
});

test("localized shell, content routes, and workspace landmarks stay visible", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto("/zh");
  await page.getByRole("button", { name: "工具" }).click();
  await expect(page.getByRole("heading", { name: "AI 工作区" })).toBeVisible();
  await page.getByRole("button", { name: "工具" }).click();
  await page.getByRole("button", { name: "功能" }).click();
  await expect(page.getByRole("link", { name: "中文" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "面向真实文件的 ChatGPT for documents。" })).toBeVisible();

  await page.goto("/zh/chat-with-pdf");
  await expect(page.getByTestId("document-sidebar")).toBeVisible();
  await expect(page.getByTestId("conversation-workspace")).toBeVisible();
  await expect(page.getByTestId("source-intelligence-panel")).toBeVisible();

  await page.goto("/zh/dashboard");
  await expect(page.getByRole("heading", { name: "文档工作区概览。" })).toBeVisible();
  await expect(page.locator("#actions").getByText("AI 操作", { exact: true })).toBeVisible();

  for (const route of ["/blog", "/guides", "/resources", "/ai-pdf-guides", "/zh/blog", "/zh/guides", "/zh/resources", "/zh/ai-pdf-guides"]) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator("main")).toBeVisible();
  }
});
