import { test as base, expect as baseExpect } from "@playwright/test";

export const BASE = "http://localhost:3000/linkedin";

export const TEST_PREFIX = "[E2E-TEST]";

export const test = base.extend({
  page: async ({ page }, use) => {
    // Dismiss onboarding if visible before each test
    await page.goto(BASE + "/");
    await page.evaluate(() => localStorage.setItem("mc_onboarding_complete", "true"));

    // Clean up test data from localStorage before each test
    await page.evaluate(() => {
      // Remove any test drafts
      const draft = localStorage.getItem("mc_draft");
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          if (parsed.content?.includes("[E2E-TEST]")) {
            localStorage.removeItem("mc_draft");
          }
        } catch {
          // Not JSON, skip
        }
      }
    });

    // Navigate to ideas and clean up any test ideas via the API
    try {
      await page.goto(BASE + "/ideas", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(500);
    } catch {
      // ignore
    }

    await use(page);
  },

  // Ensure the test DB is in a known state after each test
  // (API-level cleanup can be added here for post/idea deletion)
});

export const expect = baseExpect;
