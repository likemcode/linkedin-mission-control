import { test as base, expect as baseExpect } from "@playwright/test";

export const BASE = "http://localhost:3000/linkedin";

export const test = base.extend({
  page: async ({ page }, use) => {
    // Dismiss onboarding if visible before each test
    await page.goto(BASE + "/");
    await page.evaluate(() => localStorage.setItem("mc_onboarding_complete", "true"));
    await use(page);
  },
});

export const expect = baseExpect;
