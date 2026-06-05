import { expect, test } from "@playwright/test";
import { ensurePdfFixtures } from "./fixtures/pdf";

// ---------------------------------------------------------------------------
// Shared PDF tool page tests (upload → process → download)
// ---------------------------------------------------------------------------

test("compress-pdf loads the shared tool page template", async ({ page }) => {
  await page.goto("/compress-pdf");

  // Hero section
  await expect(
    page.getByRole("heading", { name: "Compress PDF files online without losing quality." }),
  ).toBeVisible();

  // Upload form
  const workflow = page.locator('[data-workflow-engine="compress-pdf"]');
  await expect(workflow).toBeVisible();
  await expect(workflow.locator('input[type="file"]')).toBeAttached();
  await expect(page.getByText("Waiting for upload")).toBeVisible();

  // Benefits section
  await expect(page.getByRole("heading", { name: "Reduce PDF size for sharing and uploads" })).toBeVisible();

  // Features section
  await expect(page.getByRole("heading", { name: "Built for modern PDF compression" })).toBeVisible();

  // FAQ section
  await expect(page.getByRole("heading", { name: "PDF compression questions" })).toBeVisible();

  // CTA section
  await expect(page.getByText("Reduce PDF file size for sharing and uploads.")).toBeVisible();
});

test("compress-pdf uploads a PDF and reaches ready state", async ({ page }) => {
  const { small } = ensurePdfFixtures();

  await page.goto("/compress-pdf");

  // Upload the file
  const fileInput = page.locator('[data-workflow-input="compress-pdf"]');
  await fileInput.setInputFiles(small.filePath);

  // Verify uploading progress shows, then ready state
  await expect(page.getByText("Uploading files")).toBeVisible({ timeout: 5000 });
  await expect(page.getByText("Files ready")).toBeVisible({ timeout: 10000 });
  await expect(page.getByText(small.name)).toBeVisible();
  await expect(page.getByText("Review files and start processing.")).toBeVisible();
});

test("compress-pdf processes a PDF and shows result state", async ({ page }) => {
  const { small } = ensurePdfFixtures();

  await page.goto("/compress-pdf");

  // Upload and wait for ready
  const fileInput = page.locator('[data-workflow-input="compress-pdf"]');
  await fileInput.setInputFiles(small.filePath);
  await expect(page.getByText("Files ready")).toBeVisible({ timeout: 10000 });

  // Start processing
  await page.getByRole("button", { name: "Compress PDF" }).click();

  // Verify processing state
  await expect(page.getByText("Processing")).toBeVisible({ timeout: 5000 });

  // Wait for result state
  await expect(page.getByText("Workflow complete")).toBeVisible({ timeout: 30000 });

  // Verify result contains file info
  await expect(page.getByText("PDF compressed")).toBeVisible();

  // Download button should be present
  await expect(page.getByRole("button", { name: "Download compressed PDF" })).toBeVisible();

  // Start over button
  await expect(page.getByRole("button", { name: "Start over" })).toBeVisible();
});

test("merge-pdf loads and accepts multiple files", async ({ page }) => {
  const { small } = ensurePdfFixtures();

  await page.goto("/merge-pdf");

  // Multiple uploads supported
  const workflow = page.locator('[data-workflow-engine="merge-pdf"]');
  await expect(workflow).toBeVisible();

  // Upload two files
  const fileInput = page.locator('[data-workflow-input="merge-pdf"]');
  await fileInput.setInputFiles([small.filePath, small.filePath]);

  await expect(page.getByText("Files ready")).toBeVisible({ timeout: 10000 });
  // Should list both files
  await expect(page.getByText(small.name).first()).toBeVisible();
  await expect(page.getByText("#1 -")).toBeVisible();
  await expect(page.getByText("#2 -")).toBeVisible();
});

test("tool pages have no horizontal overflow across viewports", async ({ page }) => {
  const toolRoutes = ["/compress-pdf", "/merge-pdf", "/split-pdf", "/pdf-to-word",
    "/ocr-pdf", "/jpg-to-pdf", "/delete-page", "/protect-pdf", "/word-to-pdf"];
  const viewports = [
    { width: 1280, height: 720 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);

    for (const route of toolRoutes) {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);

      const metrics = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));

      expect(metrics.scrollWidth, `${route} at ${viewport.width}px has horizontal overflow`)
        .toBe(metrics.clientWidth);
    }
  }
});

test("tool pages validate file type rejection", async ({ page }) => {
  await page.goto("/compress-pdf");

  // Try uploading a non-PDF file by creating a text file
  const fileInput = page.locator('[data-workflow-input="compress-pdf"]');
  await fileInput.setInputFiles({
    name: "test.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("hello world"),
  });

  // Should show error state
  await expect(page.getByText("Needs attention")).toBeVisible({ timeout: 5000 });
  await expect(page.getByText("Unsupported file type")).toBeVisible();

  // Review files button should return to idle
  await page.getByRole("button", { name: "Review files" }).click();
  await expect(page.getByText("Waiting for upload")).toBeVisible();
});

test("split-pdf shows page range input in ready state", async ({ page }) => {
  const { small } = ensurePdfFixtures();

  await page.goto("/split-pdf");

  const fileInput = page.locator('[data-workflow-input="split-pdf"]');
  await fileInput.setInputFiles(small.filePath);

  await expect(page.getByText("Files ready")).toBeVisible({ timeout: 10000 });

  // Page range input should be visible for split-pdf
  const rangeInput = page.getByPlaceholder("1-4, 12-18");
  await expect(rangeInput).toBeVisible();
  await expect(rangeInput).toHaveValue("1");

  // Enter a custom range
  await rangeInput.fill("1-3");
  await expect(rangeInput).toHaveValue("1-3");
});
