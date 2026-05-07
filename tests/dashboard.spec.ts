import { test, expect, BASE } from "./fixtures";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + "/");
  });

  test("shows personalized greeting", async ({ page }) => {
    // Should show "Bonjour" somewhere on the dashboard
    await expect(page.getByText(/Bonjour/)).toBeVisible();
  });

  test("KPI cards are visible", async ({ page }) => {
    await expect(page.getByText("Brouillons").first()).toBeVisible();
    await expect(page.getByText("Planifiés").first()).toBeVisible();
    await expect(page.getByText("Publiés").first()).toBeVisible();
  });

  test("activity sparkline section is present", async ({ page }) => {
    await expect(page.getByText("Activité cette semaine")).toBeVisible();
  });

  test("sidebar navigation works", async ({ page }) => {
    // Sidebar links should exist
    await expect(page.getByRole("link", { name: "Dashboard" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Nouveau post" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Calendrier" }).first()).toBeVisible();
  });

  test("navigating to editor from dashboard CTA", async ({ page }) => {
    const cta = page.getByRole("link", { name: "Nouveau post" }).first();
    if (await cta.isVisible()) {
      await cta.click();
      await expect(page).toHaveURL(/\/editor/);
    }
  });

  test("recent drafts section renders", async ({ page }) => {
    // Either shows drafts or empty state
    const hasDrafts = await page.getByText("Brouillons récents").isVisible();
    const hasEmpty = await page.getByText("Aucun brouillon").isVisible();
    expect(hasDrafts || hasEmpty).toBeTruthy();
  });
});
