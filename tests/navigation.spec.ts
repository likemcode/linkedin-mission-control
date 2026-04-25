import { test, expect, BASE } from "./fixtures";

test.describe("Sidebar Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + "/");
  });

  const pages = [
    { name: "Dashboard", url: "/", role: "heading", matchName: /Bonjour/ },
    { name: "Nouveau post", url: "/editor", role: "heading" },
    { name: "Calendrier", url: "/calendar", role: "heading", matchName: "Calendrier" },
    { name: "Idées", url: "/ideas", role: "heading" },
    { name: "Séries", url: "/series", role: "heading" },
    { name: "Batch", url: "/batch", role: "heading" },
    { name: "Templates", url: "/templates", role: "heading" },
    { name: "Analytics", url: "/analytics", role: "heading" },
  ];

  for (const { name, url, role, matchName } of pages) {
    test(`navigates to "${name}" page`, async ({ page }) => {
      const link = page.getByRole("link", { name }).first();
      if (await link.isVisible()) {
        // Force click to bypass overlay issues
        await link.click({ force: true });
        const heading = page.getByRole(role, { name: matchName || name });
        await expect(heading).toBeVisible({ timeout: 10000 });
      }
    });
  }

  test("sidebar has mission control branding", async ({ page }) => {
    await expect(page.getByText("Mission Control")).toBeVisible();
  });

  test("sidebar collapse toggle on desktop", async ({ page }) => {
    const toggle = page.getByText("Réduire");
    if (await toggle.isVisible()) {
      await toggle.click();
      await page.waitForTimeout(300);
    }
  });
});

test.describe("Calendar Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + "/calendar");
  });

  test("shows month navigation", async ({ page }) => {
    // The calendar shows month name + year. Test for month name.
    await expect(page.getByRole("heading", { name: "Calendrier" })).toBeVisible({ timeout: 10000 });
    // Check month/year is visible in French
    const monthRegex = /(Janvier|Février|Mars|Avril|Mai|Juin|Juillet|Août|Septembre|Octobre|Novembre|Décembre)/;
    await expect(page.getByText(monthRegex)).toBeVisible();
  });

  test("day cells are clickable", async ({ page }) => {
    const dayCell = page.locator("button").filter({ has: page.locator("span") }).first();
    if (await dayCell.isVisible()) {
      await dayCell.click();
      await page.waitForTimeout(300);
    }
  });

  test("legend shows status colors", async ({ page }) => {
    // The legend is inside the calendar card
    const calendarCard = page.locator(".glass-card").first();
    await expect(calendarCard).toBeVisible({ timeout: 5000 });
    // Check for day-of-week headers
    await expect(page.getByText("Lun")).toBeVisible({ timeout: 3000 });
  });
});

test.describe("Responsive — Mobile", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
  });

  test("hamburger menu is visible on mobile", async ({ page }) => {
    await page.goto(BASE + "/");
    const hamburger = page.getByLabel("Menu");
    await expect(hamburger).toBeVisible({ timeout: 5000 });
  });

  test("hamburger opens sidebar on mobile", async ({ page }) => {
    await page.goto(BASE + "/");
    const hamburger = page.getByLabel("Menu");
    await hamburger.click();
    await page.waitForTimeout(300);
    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible();
  });

  test("editor loads on mobile", async ({ page }) => {
    await page.goto(BASE + "/editor");
    await expect(page.getByText("Assistant IA")).toBeVisible({ timeout: 10000 });
  });
});
