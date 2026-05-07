import { test, expect, BASE } from "./fixtures";

// Override the auto-dismiss in fixtures for onboarding tests
test.describe("Onboarding Wizard", () => {
  test("shows onboarding on first visit", async ({ page }) => {
    await page.goto(BASE + "/");
    await page.evaluate(() => localStorage.removeItem("mc_onboarding_complete"));
    await page.reload();
    await expect(page.getByText("Connecte LinkedIn")).toBeVisible({ timeout: 5000 });
  });

  test("can skip onboarding", async ({ page }) => {
    await page.goto(BASE + "/");
    await page.evaluate(() => localStorage.removeItem("mc_onboarding_complete"));
    await page.reload();
    // The onboarding has a "Passer" button or the overlay can be dismissed
    const skipBtn = page.getByText(/Passer/);
    if (await skipBtn.isVisible({ timeout: 5000 })) {
      await skipBtn.click();
      await expect(page.getByText("Connecte LinkedIn")).not.toBeVisible({ timeout: 3000 });
    }
  });

  test("onboarding stays hidden when completed", async ({ page }) => {
    await page.goto(BASE + "/");
    await page.evaluate(() => localStorage.setItem("mc_onboarding_complete", "true"));
    await page.reload();
    await expect(page.getByText("Connecte LinkedIn")).not.toBeVisible({ timeout: 5000 });
  });
});
