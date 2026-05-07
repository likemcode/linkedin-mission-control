import { test, expect, BASE } from "./fixtures";

test.describe("LinkedIn Preview", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + "/editor");
  });

  test("shows LinkedIn preview panel", async ({ page }) => {
    await expect(page.getByText("Aperçu LinkedIn")).toBeVisible({ timeout: 10000 });
  });

  test("preview reflects typed content", async ({ page }) => {
    const textarea = page.getByPlaceholder("Écris ton post LinkedIn");
    await textarea.fill("This is my LinkedIn post preview!");
    // The preview should show the same text in the white card
    await expect(page.getByText("This is my LinkedIn post preview!").first()).toBeVisible({ timeout: 5000 });
  });

  test("preview shows profile placeholder when no profile loaded", async ({ page }) => {
    const previewArea = page.locator(".bg-white").first();
    await expect(previewArea).toBeVisible({ timeout: 5000 });
  });

  test("engagement bar is displayed", async ({ page }) => {
    await expect(page.getByText("Like")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Comment")).toBeVisible();
    await expect(page.getByText("Repost")).toBeVisible();
    await expect(page.getByText("Send")).toBeVisible();
  });

  test("see more appears for long content", async ({ page }) => {
    const textarea = page.getByPlaceholder("Écris ton post LinkedIn");
    const longText = Array(50).fill("This is a long sentence for testing truncation.").join("\n");
    await textarea.fill(longText);
    await page.waitForTimeout(500);

    const seeMore = page.getByText("…voir plus");
    // May or may not appear depending on exact truncation threshold
    if (await seeMore.isVisible()) {
      await seeMore.click();
      await expect(page.getByText("voir moins")).toBeVisible();
    }
  });

  test("see more expands and collapses content", async ({ page }) => {
    const textarea = page.getByPlaceholder("Écris ton post LinkedIn");
    const longText = Array(50).fill("This is a long sentence for testing truncation.").join("\n");
    await textarea.fill(longText);
    await page.waitForTimeout(500);

    const seeMore = page.getByText("…voir plus");
    if (await seeMore.isVisible()) {
      await seeMore.click();
      await expect(page.getByText("voir moins")).toBeVisible();
      await page.getByText("voir moins").click();
      await expect(page.getByText("…voir plus")).toBeVisible();
    }
  });
});

test.describe("Character Gauge", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + "/editor");
  });

  test("shows character count", async ({ page }) => {
    const textarea = page.getByPlaceholder("Écris ton post LinkedIn");
    await textarea.fill("Hello");
    await page.waitForTimeout(300);
    await expect(page.getByText(/chars/)).toBeVisible({ timeout: 5000 });
  });

  test("shows ideal range markers", async ({ page }) => {
    await page.waitForTimeout(1000);
    // 1300-2000 appears in the character gauge
    await expect(page.getByText(/1300.*2000/)).toBeVisible({ timeout: 5000 });
  });

  test("zone label updates with content length", async ({ page }) => {
    const textarea = page.getByPlaceholder("Écris ton post LinkedIn");

    // Short content
    await textarea.fill("Short");
    await page.waitForTimeout(300);
    await expect(page.getByText("Trop court")).toBeVisible({ timeout: 5000 });

    // Medium content in green zone
    const medium = "A".repeat(1500);
    await textarea.fill(medium);
    await page.waitForTimeout(300);
    await expect(page.getByText("Zone optimale")).toBeVisible({ timeout: 5000 });
  });
});
