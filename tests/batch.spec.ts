import { test, expect, BASE } from "./fixtures";

test.describe("Batch Generation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + "/batch");
  });

  test("shows batch page", async ({ page }) => {
    await expect(page.getByText("Mode Batch")).toBeVisible();
  });

  test("themes input is present", async ({ page }) => {
    const themesInput = page.getByPlaceholder(/leadership, productivité/);
    await expect(themesInput).toBeVisible();
  });

  test("count input defaults to 5", async ({ page }) => {
    const countInput = page.locator('input[type="number"]');
    await expect(countInput).toHaveValue("5");
  });

  test("template select has options", async ({ page }) => {
    const templateSelect = page.locator("select").filter({ has: page.locator("option") }).first();
    const options = await templateSelect.locator("option").all();
    expect(options.length).toBeGreaterThanOrEqual(1);
  });

  test("generate button is disabled with no themes", async ({ page }) => {
    const generateBtn = page.locator("button").filter({ hasText: /Générer/ });
    await expect(generateBtn).toBeDisabled();
  });

  test("generate button enables when themes are entered", async ({ page }) => {
    const themesInput = page.getByPlaceholder(/leadership, productivité/);
    await themesInput.fill("leadership, IA");

    const generateBtn = page.locator("button").filter({ hasText: /Générer/ });
    await expect(generateBtn).toBeEnabled();
  });
});
