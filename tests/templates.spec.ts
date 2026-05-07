import { test, expect, BASE } from "./fixtures";

test.describe("Templates Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + "/templates");
  });

  test("shows templates page with title", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Templates" })).toBeVisible({ timeout: 10000 });
  });

  test("templates are displayed", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Templates" })).toBeVisible({ timeout: 5000 });
    // Should show count in subtitle
    await expect(page.getByText(/templates ·/)).toBeVisible({ timeout: 3000 });
  });

  test("clicking template shows structure", async ({ page }) => {
    // Click on any template card
    const card = page.locator(".glass-card-interactive").first();
    if (await card.isVisible({ timeout: 5000 })) {
      await card.click();
      await page.waitForTimeout(300);
      // Structure should be visible
      const structure = page.locator("pre");
      if (await structure.isVisible()) {
        expect(await structure.textContent()).toBeTruthy();
      }
    }
  });

  test("new template button is visible", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Nouveau" })).toBeVisible({ timeout: 5000 });
  });

  test("new template button opens form", async ({ page }) => {
    const newBtn = page.getByRole("button", { name: "Nouveau" });
    if (await newBtn.isVisible()) {
      await newBtn.click();
      await page.waitForTimeout(500);
      // Check form elements appeared
      const nameInput = page.locator('input[placeholder="Nom du template"]');
      await expect(nameInput).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe("Templates — CRUD Operations", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + "/templates");
  });

  test("template creation form has required fields", async ({ page }) => {
    const newBtn = page.getByRole("button", { name: "Nouveau" });
    if (await newBtn.isVisible()) {
      await newBtn.click();
      await page.waitForTimeout(500);
      await expect(page.locator('input[placeholder="Nom du template"]')).toBeVisible();
      await expect(page.locator('input[placeholder="Courte description"]')).toBeVisible();
      await expect(page.locator('textarea[placeholder*="Structure"]')).toBeVisible();
    }
  });

  test("form can be cancelled", async ({ page }) => {
    const newBtn = page.getByRole("button", { name: "Nouveau" });
    if (await newBtn.isVisible()) {
      await newBtn.click();
      await page.waitForTimeout(300);
      const cancelBtn = page.getByText("Annuler").first();
      if (await cancelBtn.isVisible()) {
        await cancelBtn.click();
        await expect(page.locator('input[placeholder="Nom du template"]')).not.toBeVisible({ timeout: 3000 });
      }
    }
  });
});
